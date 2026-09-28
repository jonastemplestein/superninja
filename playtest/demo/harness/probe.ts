// Measure Sensei's paw in the harness (playtest/demo/harness/, a frozen build served by serve.ts), in the page, every
// 30 ms from "Let me show you." until the paw is home: where its fingertip is and how it is turned (from the computed
// transforms), what of it (SenseiDemo's pawOutline) comes near the sock's plate (the child's next answer), where it
// crosses the caption bubble and which of the two is painted on top (z-index, then DOM order). Captions on (the
// harness's setting), 844 × 390, a touch browser, real speed.
//   bun playtest/demo/harness/probe.ts [--port 4981] [--out <file.json>]
// Prints a summary (the least clearance to the sock, in flight and at the hover / press / draw-back; the samples where
// the paw crosses the bubble, and whether the bubble hid it there) and writes every sample to --out.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const g = globalThis as Record<string, unknown>;
// SenseiDemo.tsx imports the engine: a minimal browser to import pawOutline() from it here
g.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
g.document ??= { addEventListener() {}, visibilityState: "visible", createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), querySelector: () => null, querySelectorAll: () => [], body: {} };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.removeEventListener ??= () => {};
g.location ??= { search: "", href: "http://localhost/", pathname: "/", hash: "" };
g.navigator ??= { userAgent: "bun" };
g.matchMedia ??= () => ({ matches: false, addEventListener() {} });
g.Image ??= class { set src(_v: string) {} };
g.requestAnimationFrame ??= () => 0;
g.AudioContext ??= class { createGain() { return { gain: { value: 1, setValueAtTime() {} }, connect() {} }; } get destination() { return {}; } };
const { pawOutline } = await import("../../../src/ui/SenseiDemo");

const args = process.argv.slice(2);
const arg = (k: string, d: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const port = Number(arg("--port", "4981"));
const out = arg("--out", "");

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForSelector("[data-start]");
await page.locator("[data-start]").tap();

// the sampler, in the page: every 30 ms while the paw is shown
await page.evaluate(() => {
  const w = window as any;
  w.__pawSamples = [];
  const stage = document.querySelector(".stage") as HTMLElement;
  const toStage = (r: DOMRect) => {
    const s = stage.getBoundingClientRect();
    const k = s.width / 1280;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  };
  const mat = (el: Element) => {
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return null;
    const m = new DOMMatrix(t);
    return { a: m.a, b: m.b, e: m.e, f: m.f, s: Math.hypot(m.a, m.b) };
  };
  const t0 = performance.now();
  w.__pawTimer = setInterval(() => {
    const paw = document.querySelector(".sd-paw") as HTMLElement | null;
    if (!paw || getComputedStyle(paw).display === "none" || getComputedStyle(paw.parentElement!).display === "none") return;
    const m = mat(paw), inner = mat(paw.querySelector(".sd-paw-in")!);
    if (!m) return;
    const plate = document.querySelector('.demo-row [data-pic="sock"] .pcard-plate');
    const bubble = document.querySelector(".bubble");
    // which is painted on top where they cross: the higher z-index, else the later in the DOM (one stacking context)
    const layer = paw.parentElement!;
    const zi = (el: Element) => Number(getComputedStyle(el).zIndex) || 0;
    const pawOnTop = bubble ? zi(layer) > zi(bubble) || (zi(layer) === zi(bubble) && !!(bubble.compareDocumentPosition(layer) & Node.DOCUMENT_POSITION_FOLLOWING)) : null;
    w.__pawSamples.push({
      t: Math.round(performance.now() - t0),
      step: w.__snState?.step ?? null,
      // the fingertip (the hotspot, 90 × 16.8 px into the paw's box) when the paw is at full size
      tip: { x: m.e + 90, y: m.f + 16.8 },
      s: +m.s.toFixed(3),
      rot: inner ? +((Math.atan2(inner.b, inner.a) * 180) / Math.PI).toFixed(1) : null,
      op: +getComputedStyle(paw).opacity,
      sock: plate ? toStage(plate.getBoundingClientRect()) : null,
      bubble: bubble ? toStage(bubble.getBoundingClientRect()) : null,
      pawOnTop,
    });
  }, 30);
});

// play until the demo is done (the Ready hold is up), then stop
const deadline = Date.now() + 60_000;
for (;;) {
  await new Promise((r) => setTimeout(r, 200));
  const nav = await page.evaluate(() => (window as any).__snNav?.next ?? null).catch(() => null);
  if (nav === "ready" || Date.now() > deadline) break;
}
const samples: any[] = await page.evaluate(() => (clearInterval((window as any).__pawTimer), (window as any).__pawSamples));
// idle after the demo: the layer hidden, none of its animations running
await new Promise((r) => setTimeout(r, 1200));
const idle = await page.evaluate(() => {
  const layer = document.querySelector(".sd-layer") as HTMLElement;
  const running = document.getAnimations().filter((a) => {
    const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
    return !!t && layer.contains(t) && a.playState === "running";
  }).length;
  return { display: getComputedStyle(layer).display, running };
});
await b.close();

type Box = { x: number; y: number; w: number; h: number };
const dist = (q: { x: number; y: number }, r: Box) => Math.hypot(Math.max(r.x - q.x, 0, q.x - (r.x + r.w)), Math.max(r.y - q.y, 0, q.y - (r.y + r.h)));
const rows = samples
  .filter((x) => x.s > 0.97 && x.op > 0.5 && x.rot != null)
  .map((x) => {
    const outline = pawOutline(x.tip, x.rot);
    const clear = x.sock ? Math.min(...outline.map((q) => dist(q, x.sock))) : null;
    // crossing the bubble: any of the paw inside the bubble's box (its tail aside); hidden if the bubble is on top
    const crosses = x.bubble ? outline.some((q) => q.x > x.bubble.x && q.x < x.bubble.x + x.bubble.w && q.y > x.bubble.y && q.y < x.bubble.y + x.bubble.h + 6) : false;
    return { ...x, clear: clear == null ? null : Math.round(clear), crosses, hidden: crosses && x.pawOnTop === false };
  });
const by = (steps: string[]) => rows.filter((r) => steps.includes(r.step));
const least = (rs: any[]) => (rs.length ? Math.min(...rs.map((r) => r.clear ?? 1e9)) : null);
const summary = {
  samples: samples.length,
  full: rows.length,
  flight: { n: by(["fly"]).length, leastToSock: least(by(["fly"])) },
  hoverLookPress: { n: by(["look", "press"]).length, leastToSock: least(by(["look", "press"])) },
  effect: { n: by(["effect"]).length, leastToSock: least(by(["effect"])) },
  overall: least(rows),
  crossesBubble: rows.filter((r) => r.crosses).length,
  crossesBubbleSteps: [...new Set(rows.filter((r) => r.crosses).map((r) => r.step))],
  hiddenByBubble: rows.filter((r) => r.hidden).map((r) => ({ t: r.t, step: r.step, tip: { x: Math.round(r.tip.x), y: Math.round(r.tip.y) } })),
  touchingSock: rows.filter((r) => (r.clear ?? 1e9) <= 0).map((r) => ({ t: r.t, step: r.step })),
  idle,
};
console.log(JSON.stringify(summary, null, 1));
if (out) writeFileSync(out, JSON.stringify({ summary, rows }, null, 1));
process.exit(0);
