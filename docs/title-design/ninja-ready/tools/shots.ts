// Screenshots and measurements of the "ninja-ready" title mockup on three landscape phones (touch, DPR 3, iPhone UA).
//   bun docs/title-design/ninja-ready/tools/shots.ts [tag]
// Serves the repo root on a local port so the mockup's relative paths to public/ work. Writes shots/*.png and
// shots/measure.json. Nothing is deleted.
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../../..");
const SHOTS = resolve(import.meta.dir, "../shots");
mkdirSync(SHOTS, { recursive: true });
const tag = process.argv[2] ?? "v";
const TYPES: Record<string, string> = { html: "text/html", webp: "image/webp", png: "image/png", jpg: "image/jpeg", mp3: "audio/mpeg", svg: "image/svg+xml", js: "text/javascript", css: "text/css" };
const server = Bun.serve({
  port: 0,
  fetch(req) {
    const p = decodeURIComponent(new URL(req.url).pathname);
    const f = join(ROOT, p.endsWith("/") ? p + "index.html" : p);
    if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) return new Response("nf", { status: 404 });
    return new Response(Bun.file(f), { headers: { "content-type": TYPES[f.split(".").pop()!] ?? "application/octet-stream" } });
  },
});
const BASE = `http://localhost:${server.port}/docs/title-design/ninja-ready/`;
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const out: Record<string, any> = {};

async function open(w: number, h: number, state: string) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?state=${state}&ui=0`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1400);
  return { ctx, page };
}
async function measure(page: Page) {
  return page.evaluate(() => {
    const r = (sel: string) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const anims = document.getAnimations();
    const props = new Set<string>();
    for (const a of anims) {
      const kf = (a.effect as KeyframeEffect)?.getKeyframes?.() ?? [];
      for (const k of kf) for (const p of Object.keys(k)) if (!["offset", "easing", "composite", "computedOffset"].includes(p)) props.add(p);
    }
    return {
      scale: (window as any).__scale,
      domNodes: document.getElementsByTagName("*").length,
      animations: anims.length,
      infinite: anims.filter((a) => (a.effect as KeyframeEffect)?.getTiming().iterations === Infinity).length,
      animatedProps: [...props],
      playDisc: r(".disc"), playHit: r(".gong"), help: r(".help-btn"), gear: r(".gear"), logo: r(".logo"), ninja: r(".ninja-wrap.front"), badge: r(".badge .b-face"),
    };
  });
}
async function idleCost(page: Page) {
  // rAF calls and main-thread busy time over 4 s untouched
  await page.evaluate(() => {
    (window as any).__raf = 0;
    const o = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => { (window as any).__raf++; return o(cb); };
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const m0 = await cdp.send("Performance.getMetrics");
  await sleep(4000);
  const m1 = await cdp.send("Performance.getMetrics");
  const get = (m: any, n: string) => m.metrics.find((x: any) => x.name === n)?.value ?? 0;
  return {
    rafCalls: await page.evaluate(() => (window as any).__raf),
    taskMs: Math.round((get(m1, "TaskDuration") - get(m0, "TaskDuration")) * 1000),
    scriptMs: Math.round((get(m1, "ScriptDuration") - get(m0, "ScriptDuration")) * 1000),
    layouts: get(m1, "LayoutCount") - get(m0, "LayoutCount"),
    styleRecalcs: get(m1, "RecalcStyleCount") - get(m0, "RecalcStyleCount"),
  };
}

for (const [w, h] of [[844, 390], [667, 375], [932, 430]] as const) {
  for (const state of ["first", "returning", "many"]) {
    if (w !== 844 && state === "many") continue;
    const { ctx, page } = await open(w, h, state);
    await page.screenshot({ path: join(SHOTS, `${tag}-${state}-${w}x${h}.png`) });
    out[`${state}-${w}x${h}`] = await measure(page);
    if (w === 844 && state === "returning") {
      out.idle = await idleCost(page);
      // hover, press
      const d = out[`${state}-${w}x${h}`].playDisc;
      await page.addStyleTag({ content: ".disc{animation:none!important}" });
      await page.evaluate(() => document.querySelector(".gong")!.classList.add("pressed"));
      await sleep(150);
      await page.screenshot({ path: join(SHOTS, `${tag}-press-844x390.png`), clip: { x: d.x - 60, y: d.y - 60, width: d.w + 120, height: d.h + 160 } });
      await page.evaluate(() => document.querySelector(".gong")!.classList.remove("pressed"));
      await page.addStyleTag({ content: ".disc{transform:scale(1.07)!important}.g-glow{opacity:1!important}" });
      await sleep(150);
      await page.screenshot({ path: join(SHOTS, `${tag}-hover-844x390.png`), clip: { x: d.x - 60, y: d.y - 60, width: d.w + 120, height: d.h + 160 } });
    }
    await ctx.close();
  }
}
// the start sequence at 844×390: a filmstrip of the tap
{
  // in slow motion (×8): the page's timers take ?slow=8 and CDP slows the CSS animations to match
  const SLOW = 8;
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?state=returning&ui=0&slow=${SLOW}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1200);
  const d = (await measure(page)).playDisc;
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / SLOW });
  const x = d.x + d.w / 2, y = d.y + d.h / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  const t0 = Date.now();
  for (const t of [60, 160, 300, 520, 720, 900, 1150, 1700]) {
    await sleep(Math.max(0, t * SLOW - (Date.now() - t0)));
    await page.screenshot({ path: join(SHOTS, `${tag}-start-${String(t).padStart(4, "0")}ms.png`) });
  }
  out.startTapNextShown = await page.evaluate(() => !!document.querySelector(".next"));
  await ctx.close();
}
writeFileSync(join(SHOTS, `${tag}-measure.json`), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await b.close();
server.stop();
