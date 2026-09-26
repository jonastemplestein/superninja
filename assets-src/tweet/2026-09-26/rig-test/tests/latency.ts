// Probe: how steady is the picture latency (DOM change → frame timestamp) over a recording, while the bot plays?
// A small white square flashes in the bottom-left corner every 400 ms; each flash's first frame is found by decoding.
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { step, save } from "../../../../../scripts/treadmill/bot.ts";
const mode = process.argv[2] ?? "swiftshader"; // swiftshader | metal
const nth = Number(process.argv[3] ?? 1);
const q = Number(process.argv[4] ?? 92);
const gpuArgs = mode === "metal" ? ["--use-angle=metal", "--enable-gpu", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] : [];
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--force-device-scale-factor=1.5", ...gpuArgs] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();
const FLOWER = process.env.URL?.includes("tree") ? {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
} : {};
const sv = { ...(save() as any), ...FLOWER, settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true } };
await page.addInitScript((s) => { try { if (location.protocol.startsWith("http") && !localStorage.getItem("superninja.profiles.v1")) localStorage.setItem("superninja.save.v1", JSON.stringify(s)); } catch {} }, sv);
const cdp = await ctx.newCDPSession(page);
const frames: { ts: number; buf: Buffer }[] = [];
cdp.on("Page.screencastFrame", (f: any) => {
  cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  frames.push({ ts: f.metadata.timestamp * 1000, buf: Buffer.from(f.data, "base64") });
});
await page.goto("https://next.superninja.templestein.com" + (process.env.URL ?? "/play/?level=w2-2"));
await cdp.send("Page.startScreencast", { format: "jpeg", quality: q, maxWidth: 1920, maxHeight: 1080, everyNthFrame: nth });
const gl = await page.evaluate(() => { const c = document.createElement("canvas").getContext("webgl"); const e = c?.getExtension("WEBGL_debug_renderer_info"); return e ? c!.getParameter(e.UNMASKED_RENDERER_WEBGL) : "none"; });
const flashes: number[] = [];
let live = true;
const botLoop = (async () => { while (live) { await step(page).catch(() => {}); await page.waitForTimeout(700).catch(() => {}); } })();
const t0 = Date.now();
while (Date.now() - t0 < 20000) {
  flashes.push(await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;left:0;bottom:0;width:40px;height:40px;background:#fff;z-index:2147483647;pointer-events:none";
    document.body.appendChild(d);
    const t = Date.now();
    setTimeout(() => d.remove(), 150);
    return t;
  }));
  await page.waitForTimeout(400);
}
live = false;
await botLoop;
await browser.close();
// corner brightness of every frame
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-i", "pipe:0", "-vf", "crop=54:54:3:1023,scale=4:4,format=gray", "-f", "rawvideo", "pipe:1"], { input: Buffer.concat(frames.map((f) => f.buf)), maxBuffer: 1 << 30 });
const L = [...Array(frames.length)].map((_, i) => { let s = 0; for (let k = 0; k < 16; k++) s += r.stdout[i * 16 + k]; return s / 16; });
const lat = flashes.map((s) => { const i = frames.findIndex((f, k) => f.ts >= s - 5 && L[k] > 235 && k > 0 && L[k - 1] < 235); return i < 0 ? NaN : frames[i].ts - s; }).filter((x) => !isNaN(x));
const sorted = [...lat].sort((a, b) => a - b);
const gaps = frames.slice(1).map((f, i) => f.ts - frames[i].ts).sort((a, b) => a - b);
const pick = (xs: number[], p: number) => Math.round(xs[Math.floor(p * (xs.length - 1))]);
console.log(JSON.stringify({ mode, nth, q, gl: gl.slice(0, 60), fps: Math.round(frames.length / ((frames.at(-1)!.ts - frames[0].ts) / 1000)), gapP99: pick(gaps, 0.99), gapMax: pick(gaps, 1), n: lat.length, of: flashes.length, latency: { min: pick(sorted, 0), p10: pick(sorted, 0.1), p50: pick(sorted, 0.5), p90: pick(sorted, 0.9), max: pick(sorted, 1), mean: Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) }, series: lat.map(Math.round).join(" ") }));
