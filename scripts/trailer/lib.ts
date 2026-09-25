// Shared helpers for the trailer pipeline (see docs/TRAILER.md).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Shot, TrailerConfig } from "../../trailer/trailer.config";

export const ROOT = resolve(import.meta.dir, "../..");
export const CACHE = join(ROOT, "assets-src/trailer/cache");
export const BUILD = join(ROOT, "assets-src/trailer/build");
export const FPS = 30;
export const AR = 48000;

export const p = (...parts: string[]) => join(ROOT, ...parts);

/** Stable content hash of any JSON-able recipe (+ optional file contents it depends on). */
export function hashOf(recipe: unknown, files: string[] = []): string {
  const h = createHash("sha256").update(JSON.stringify(recipe));
  for (const f of files) h.update(readFileSync(p(f)));
  return h.digest("hex").slice(0, 12);
}

export function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
  return path;
}

export function ffmpeg(args: string[], opts: { quiet?: boolean } = {}) {
  ensureDir(dirname(args[args.length - 1]));
  try {
    return execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 28, stdio: opts.quiet ? "pipe" : ["ignore", "pipe", "inherit"] }).toString();
  } catch (e: any) {
    throw new Error(`ffmpeg failed: ffmpeg ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(" ").slice(0, 4000)}\n${e.stderr ?? ""}`);
  }
}

export function duration(file: string): number {
  return parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
}

export function hasAudio(file: string): boolean {
  return execFileSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file]).toString().trim().length > 0;
}

export const fresh = (file: string) => existsSync(file) && statSync(file).size > 0;

const secretCache: Record<string, string> = {};
/** Read a secret from env, or fall back to `doppler secrets get` so `bun scripts/trailer/build.ts` works without wrapping. */
export function secret(name: string, project: string, config = "dev"): string {
  if (process.env[name]) return process.env[name]!;
  const k = `${project}/${config}/${name}`;
  if (!secretCache[k]) {
    try {
      secretCache[k] = execFileSync("doppler", ["secrets", "get", name, "--plain", "-p", project, "-c", config]).toString().trim();
    } catch {
      throw new Error(`Missing secret ${name}: set it in env or make sure doppler project ${project}/${config} is reachable`);
    }
  }
  return secretCache[k];
}
export const geminiKey = () => process.env.APP_CONFIG_GEMINI_API_KEY ?? secret("APP_CONFIG_GEMINI_API_KEY", "os-legacy-2026-04");
export const cfToken = () => secret("CLOUDFLARE_API_TOKEN", "os");
export const cfAccount = () => secret("CLOUDFLARE_ACCOUNT_ID", "os");

export interface Placed extends Shot {
  index: number;
  start: number;
  end: number;
  frames: number;
}

/** Lay the shots end to end on a frame-accurate timeline. */
export function layout(cfg: TrailerConfig): Placed[] {
  let frame = 0;
  return cfg.shots.map((s, index) => {
    const frames = Math.round(s.dur * FPS);
    const placed = { ...s, index, start: frame / FPS, end: (frame + frames) / FPS, frames };
    frame += frames;
    return placed;
  });
}

export function shotStart(shots: Placed[], ref: string): number {
  const [id, off] = ref.split("+");
  const s = shots.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown shot id "${id}"`);
  return s.start + (off ? parseFloat(off) : 0);
}

export const log = (...a: unknown[]) => console.log("·", ...a);
