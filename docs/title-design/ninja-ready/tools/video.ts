// Records the mockup at 844×390: the entrance and 6 s of idle, then one tap on Play and the way on.
//   bun docs/title-design/ninja-ready/tools/video.ts   → shots/title-motion-844x390.mp4
import { chromium } from "playwright";
import { existsSync, statSync, readdirSync, mkdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../../..");
const SHOTS = resolve(import.meta.dir, "../shots");
const RAW = resolve(ROOT, "playtest/runs/title-design/ninja-ready/video-raw");
mkdirSync(RAW, { recursive: true });
const TYPES: Record<string, string> = { html: "text/html", webp: "image/webp", png: "image/png", mp3: "audio/mpeg" };
const server = Bun.serve({ port: 0, fetch(req) {
  const p = decodeURIComponent(new URL(req.url).pathname), f = join(ROOT, p.endsWith("/") ? p + "index.html" : p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) return new Response("nf", { status: 404 });
  return new Response(Bun.file(f), { headers: { "content-type": TYPES[f.split(".").pop()!] ?? "application/octet-stream" } });
} });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, recordVideo: { dir: RAW, size: { width: 1688, height: 780 } } });
const page = await ctx.newPage();
await page.goto(`http://localhost:${server.port}/docs/title-design/ninja-ready/?state=returning&ui=0`);
await sleep(7000);
const cdp = await ctx.newCDPSession(page);
const r = (await page.locator(".disc").boundingBox())!;
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 }] });
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await sleep(3000);
const vid = await page.video()!.path();
await ctx.close();
await b.close();
server.stop();
const mp4 = join(SHOTS, "title-motion-844x390.mp4");
if (existsSync(mp4)) { mkdirSync(join(ROOT, ".trash"), { recursive: true }); renameSync(mp4, join(ROOT, ".trash", `title-motion-844x390-${Date.now()}.mp4`)); }
spawnSync("ffmpeg", ["-loglevel", "error", "-i", vid, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart", mp4], { stdio: "inherit" });
console.log(mp4);
