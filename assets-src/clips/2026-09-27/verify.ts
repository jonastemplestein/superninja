// Checks the 27 Sep clip kit once uploaded (or the local page before):
//   bun assets-src/clips/2026-09-27/verify.ts urls              every file on R2: HTTP 200, content-type, sha256 = local
//   bun assets-src/clips/2026-09-27/verify.ts page [url] [dir]  the page in headless Chromium at 1280×800 and 390×844:
//                                                                 full-page screenshots into dir, every video's
//                                                                 readyState ≥ 1, no sideways scroll
// url defaults to the R2 page; pass file://…/index.html for the local copy. One browser, closed at the end.
import { createHash } from "node:crypto";
import { createReadStream, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { ALL_ZIP, GROUPS, zipOf } from "./clips";

const D = import.meta.dir;
const BASE = `https://pub-283f083f98c24b3a8f2731dd663075d2.r2.dev/${readFileSync(join(D, ".r2-prefix"), "utf8").trim()}`;

const files: { key: string; local: string; type: string; attach: boolean }[] = [];
for (const g of GROUPS) {
  for (const c of g.clips) {
    files.push({ key: `${c.file}.mp4`, local: join(D, `${c.file}.mp4`), type: "video/mp4", attach: true });
    files.push({ key: `${c.file}.jpg`, local: join(D, `${c.file}.jpg`), type: "image/jpeg", attach: false });
  }
  files.push({ key: zipOf(g), local: join(D, "zips", zipOf(g)), type: "application/zip", attach: true });
}
files.push({ key: ALL_ZIP, local: join(D, "zips", ALL_ZIP), type: "application/zip", attach: true });
files.push({ key: "index.html", local: join(D, "index.html"), type: "text/html; charset=utf-8", attach: false });

const sha = (f: string) =>
  new Promise<string>((ok, no) => {
    const h = createHash("sha256");
    createReadStream(f).on("data", (d) => h.update(d)).on("end", () => ok(h.digest("hex"))).on("error", no);
  });

async function urls() {
  let bad = 0;
  const run = async (f: (typeof files)[number]) => {
    const url = `${BASE}/${f.key}`;
    const res = await fetch(url, { cache: "no-store" });
    const h = createHash("sha256");
    let n = 0;
    if (res.body) for await (const chunk of res.body as any) { h.update(chunk); n += chunk.length; }
    const remote = h.digest("hex"), local = await sha(f.local);
    const type = res.headers.get("content-type") ?? "";
    const disp = res.headers.get("content-disposition") ?? "";
    const ok = res.status === 200 && type === f.type && remote === local && (f.attach ? disp.startsWith("attachment") : !disp.startsWith("attachment"));
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "BAD "} ${res.status} ${f.key}  ${type}  ${disp || "-"}  ${(n / 1e6).toFixed(1)} MB  sha256 ${remote === local ? "match" : `MISMATCH ${remote.slice(0, 12)} vs ${local.slice(0, 12)}`}`);
  };
  const queue = [...files];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()!); }));
  console.log(bad ? `${bad} of ${files.length} failed` : `all ${files.length} files ok`);
  process.exit(bad ? 1 : 0);
}

async function page(url = `${BASE}/index.html`, dir = join(D, "zips", ".shots")) {
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  let bad = 0;
  try {
    for (const [name, vp] of [["desktop", { width: 1280, height: 800 }], ["phone", { width: 390, height: 844 }]] as const) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: name === "phone" ? 2 : 1 });
      const p = await ctx.newPage();
      await p.goto(url, { waitUntil: "load", timeout: 120_000 });
      // the videos load their metadata as they come into view on some engines: scroll through the page once
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += vp.height) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(150); }
      await p.evaluate(() => scrollTo(0, 0));
      const deadline = Date.now() + 60_000;
      let states: { src: string; rs: number; w: number; d: number }[] = [];
      while (Date.now() < deadline) {
        states = await p.$$eval("video", (vs) => vs.map((v) => ({ src: v.getAttribute("src")!, rs: v.readyState, w: v.videoWidth, d: v.duration })));
        if (states.every((s) => s.rs >= 1)) break;
        await p.waitForTimeout(500);
      }
      const notReady = states.filter((s) => s.rs < 1);
      const sideways = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const broken = await p.$$eval("img, video", (els) => els.filter((e: any) => e.tagName === "IMG" && !e.naturalWidth).length);
      const shot = join(dir, `${name}.png`);
      await p.screenshot({ path: shot, fullPage: true });
      await p.screenshot({ path: join(dir, `${name}-top.png`) });
      if (notReady.length || sideways > 0 || broken) bad++;
      console.log(`${name} ${vp.width}×${vp.height}: ${states.length} videos, ${states.length - notReady.length} with readyState ≥ 1${notReady.length ? ` (not: ${notReady.map((s) => s.src).join(", ")})` : ""}; sideways scroll ${sideways}px; shots ${shot}`);
      console.log(`  ${states.map((s) => `${s.src} rs${s.rs} ${s.w}w ${s.d?.toFixed(1)}s`).join(" | ")}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  process.exit(bad ? 1 : 0);
}

const [cmd, a, b] = process.argv.slice(2);
if (cmd === "urls") await urls();
else if (cmd === "page") await page(a || undefined, b || undefined);
else console.log("usage: verify.ts urls | page [url] [dir]");
