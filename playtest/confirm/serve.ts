// Serve the confirm's frozen build (playtest/runs/confirm/dist, from vite.config.ts here) with the game's assets from
// public/ (never the shared dev server). Usage: bun playtest/confirm/serve.ts --port 49xx
import { existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
const ROOT = resolve(import.meta.dirname, "../..");
const DIST = resolve(ROOT, "playtest/runs/confirm/dist");
const PUB = resolve(ROOT, "public");
const port = Number(process.argv[process.argv.indexOf("--port") + 1] || 4961);
const file = (p: string) => existsSync(p) && statSync(p).isFile();
Bun.serve({
  port,
  hostname: "127.0.0.1",
  fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/" || path === "/confirm/") return new Response(Bun.file(join(DIST, "playtest/confirm/index.html")));
    for (const base of [DIST, PUB]) {
      const p = join(base, path);
      if (p.startsWith(base) && file(p)) return new Response(Bun.file(p));
    }
    return new Response("not found", { status: 404 });
  },
});
console.log(`confirm demo: http://127.0.0.1:${port}/`);
