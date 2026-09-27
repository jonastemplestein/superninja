// A frozen build: build the working tree once into a folder and serve it with `vite preview` (no HMR, no file watcher),
// so edits made elsewhere can't reload the page under a test. Test on one of these, never on the shared dev server.
//
// Usage: bun scripts/treadmill/frozen.ts --port N [--out dir] [--probes [--patched]] [--no-build] [--detach] [--retry N]
//        bun scripts/treadmill/frozen.ts --port N --stop
//   --out dir    the build folder (default playtest/runs/frozen/.build-<port>; playtest/runs is git-ignored)
//   --probes     build with scripts/treadmill/soak.vite.config.ts: the game plus soak.ts's read-only module probes
//                (window.__snPerfMods). Test builds only. --patched also patches in soak-fixes.ts (SOAK_FIXES=1).
//   --no-build   serve what is already in --out
//   --detach     leave the server running and exit (pid in <out>.pid, log in <out>.log; --stop kills it)
//                (default: serve in the foreground until Ctrl-C)
//   --retry N    if the build fails (another lane's half-finished edit), wait 45 s and try again, up to N times
// Prints the game's URL (http://127.0.0.1:N/play/) once it answers. soak.ts and run.ts import frozen() from here.
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const VITE = resolve(ROOT, "node_modules/.bin/vite");
const SOAK_CONFIG = resolve(ROOT, "scripts/treadmill/soak.vite.config.ts");

export interface Frozen {
  /** e.g. http://127.0.0.1:4404 (the game is at `${base}/play/`) */
  base: string;
  out: string;
  pid: number;
  /** when the build was made (ISO), or null with --no-build */
  built: string | null;
  stop: () => void;
}

export interface FrozenOptions {
  port: number;
  out?: string;
  /** build with soak.vite.config.ts (soak.ts's module probes) */
  probes?: boolean;
  /** with probes: patch soak-fixes.ts in (SOAK_FIXES=1) */
  patched?: boolean;
  /** false: serve what is already in `out` */
  build?: boolean;
  /** leave the server running after this process exits (pid and log next to the folder) */
  detach?: boolean;
  /** build attempts after the first one fails, 45 s apart */
  retry?: number;
  /** extra environment for the build and the server (e.g. SOAK_FIXES_REPORT) */
  env?: Record<string, string>;
  log?: (s: string) => void;
}

const up = (url: string) =>
  fetch(url, { signal: AbortSignal.timeout(2000) }).then(
    (r) => r.ok,
    () => false,
  );

/** Build (unless build: false) and serve. Resolves once `${base}/play/` answers; throws if the build or server fails. */
export async function frozen(o: FrozenOptions): Promise<Frozen> {
  const log = o.log ?? ((s: string) => console.log(s));
  const out = resolve(ROOT, o.out ?? `playtest/runs/frozen/.build-${o.port}`);
  const base = `http://127.0.0.1:${o.port}`;
  if (await up(`${base}/play/`)) throw new Error(`port ${o.port} is already serving (${base}/play/): stop that server or pick another port`);
  const cfg = o.probes ? ["--config", SOAK_CONFIG] : [];
  const env = { ...process.env, ...(o.probes ? { SOAK_FIXES: o.patched ? "1" : "0" } : {}), ...o.env };
  let built: string | null = null;
  if (o.build !== false) {
    mkdirSync(dirname(out), { recursive: true });
    for (let attempt = 0; ; attempt++) {
      const t0 = Date.now();
      log(`frozen: building ${o.probes ? `with the soak probes${o.patched ? " and the fixes preview" : ""} ` : ""}→ ${out}`);
      const r = spawnSync(VITE, ["build", ...cfg, "--outDir", out, "--emptyOutDir", "--logLevel", "warn"], { cwd: ROOT, env, stdio: ["ignore", "inherit", "pipe"], encoding: "utf8" });
      if (r.status === 0) {
        built = new Date().toISOString();
        log(`frozen: built in ${Math.round((Date.now() - t0) / 1000)}s`);
        break;
      }
      const err = (r.stderr ?? "").trim().split("\n").slice(-12).join("\n");
      if (attempt >= (o.retry ?? 0)) throw new Error(`the build failed (exit ${r.status}):\n${err}`);
      log(`frozen: the build failed (another lane mid-edit?); retrying in 45 s\n${err}`);
      await new Promise((res) => setTimeout(res, 45_000));
    }
  } else if (!existsSync(resolve(out, "play/index.html"))) throw new Error(`--no-build: there is no build in ${out}`);

  const args = ["preview", ...cfg, "--outDir", out, "--port", String(o.port), "--strictPort", "--host", "127.0.0.1"];
  let proc: ChildProcess;
  if (o.detach) {
    const fd = openSync(`${out}.log`, "a");
    proc = spawn(VITE, args, { cwd: ROOT, env, detached: true, stdio: ["ignore", fd, fd] });
    proc.unref();
    writeFileSync(`${out}.pid`, String(proc.pid));
  } else proc = spawn(VITE, args, { cwd: ROOT, env, stdio: "ignore" });
  const stop = () => {
    try {
      process.kill(o.detach ? -proc.pid! : proc.pid!, "SIGTERM");
    } catch {}
  };
  let exited: number | null = null;
  proc.on("exit", (c) => (exited = c ?? -1));
  for (let i = 0; i < 120; i++) {
    if (await up(`${base}/play/`)) return { base, out, pid: proc.pid!, built, stop };
    if (exited != null) break;
    await new Promise((res) => setTimeout(res, 250));
  }
  stop();
  throw new Error(`vite preview on ${base} never answered${exited != null ? ` (it exited with ${exited})` : ""}`);
}

/** Stop a detached server started with --detach (by the pid file next to its folder). */
export function stopFrozen(port: number, out?: string): boolean {
  const pidFile = `${resolve(ROOT, out ?? `playtest/runs/frozen/.build-${port}`)}.pid`;
  if (!existsSync(pidFile)) return false;
  const pid = Number(readFileSync(pidFile, "utf8").trim());
  for (const target of [-pid, pid])
    try {
      process.kill(target, "SIGTERM");
      return true;
    } catch {}
  return false;
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  const arg = (k: string) => {
    const i = argv.indexOf(`--${k}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const flag = (k: string) => argv.includes(`--${k}`);
  const port = Number(arg("port"));
  if (!port) {
    console.error("usage: bun scripts/treadmill/frozen.ts --port N [--out dir] [--probes [--patched]] [--no-build] [--detach] [--retry N] | --port N --stop");
    process.exit(2);
  }
  if (flag("stop")) {
    const ok = stopFrozen(port, arg("out"));
    console.log(ok ? `frozen: stopped the server on ${port}` : `frozen: no detached server found for ${port}`);
    process.exit(ok ? 0 : 1);
  }
  try {
    const f = await frozen({ port, out: arg("out"), probes: flag("probes"), patched: flag("patched"), build: !flag("no-build"), detach: flag("detach"), retry: Number(arg("retry") ?? 0) });
    console.log(`frozen: ${f.base}/play/ (pid ${f.pid}${f.built ? `, built ${f.built}` : ""})`);
    if (flag("detach")) {
      console.log(`frozen: detached; stop it with bun scripts/treadmill/frozen.ts --port ${port}${arg("out") ? ` --out ${arg("out")}` : ""} --stop`);
      process.exit(0);
    }
    const bye = () => (f.stop(), process.exit(0));
    process.on("SIGINT", bye);
    process.on("SIGTERM", bye);
    await new Promise(() => {});
  } catch (e) {
    console.error(`frozen: ${(e as Error).message}`);
    process.exit(1);
  }
}
