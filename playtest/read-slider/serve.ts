// Serve the read slider's frozen build (playtest/runs/read-slider/dist, from vite.config.ts here) with the game's
// assets straight from public/ (never the shared dev server). Usage: bun playtest/read-slider/serve.ts --port 49xx
// playtest/read-slider/overlay/ comes first: art proposed in docs/fix-requests.md for an existing file (today only
// pic_rain.webp, the rain redraw: the picture audit names the current one "cloud"), so the videos show it. --no-overlay
// serves public/ as it is.
import { existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
const ROOT = resolve(import.meta.dirname, "../..");
const DIST = resolve(ROOT, "playtest/runs/read-slider/dist");
const PUB = resolve(ROOT, "public");
const OVERLAY = resolve(ROOT, "playtest/read-slider/overlay");
const port = Number(process.argv[process.argv.indexOf("--port") + 1] || 4971);
const file = (p: string) => existsSync(p) && statSync(p).isFile();
Bun.serve({
  port,
  hostname: "127.0.0.1",
  fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    if (path === "/" || path === "/slider/") return new Response(Bun.file(join(DIST, "playtest/read-slider/index.html")));
    for (const base of process.argv.includes("--no-overlay") ? [DIST, PUB] : [DIST, OVERLAY, PUB]) {
      const p = join(base, path);
      if (p.startsWith(base) && file(p)) return new Response(Bun.file(p));
    }
    return new Response("not found", { status: 404 });
  },
});
console.log(`read slider: http://127.0.0.1:${port}/`);
