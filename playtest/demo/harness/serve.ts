// Serve Sensei's demo harness from its frozen build (playtest/runs/demo-harness/dist, from vite.config.ts here) with the
// game's assets straight from public/ (never the shared dev server). Usage: bun playtest/demo/harness/serve.ts --port 49xx
import { existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
const ROOT = resolve(import.meta.dirname, "../../..");
const DIST = resolve(ROOT, "playtest/runs/demo-harness/dist");
const PUB = resolve(ROOT, "public");
const port = Number(process.argv[process.argv.indexOf("--port") + 1] || 4981);
const file = (p: string) => existsSync(p) && statSync(p).isFile();
Bun.serve({
  port,
  hostname: "127.0.0.1",
  fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/" || path === "/demo/") return new Response(Bun.file(join(DIST, "playtest/demo/harness/index.html")));
    for (const base of [DIST, PUB]) {
      const p = join(base, path);
      if (p.startsWith(base) && file(p)) return new Response(Bun.file(p));
    }
    return new Response("not found", { status: 404 });
  },
});
console.log(`sensei demo harness: http://127.0.0.1:${port}/`);
