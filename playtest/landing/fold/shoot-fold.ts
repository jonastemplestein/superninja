// First-screen shots of the landing page at real phones' VISIBLE viewport sizes (browser chrome subtracted),
// with the title and the big Play button measured against the fold.
// bun playtest/landing/fold/shoot-fold.ts <base-url> <label>   e.g. https://superninja.templestein.com before
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "https://superninja.templestein.com").replace(/\/$/, "");
const LABEL = process.argv[3] ?? "shot";
const OUT = process.env.OUT ?? "playtest/landing/fold";
mkdirSync(OUT, { recursive: true });

const SIZES = [
  ["iphone15-safari", 390, 664],
  ["iphone15-safari-collapsed", 390, 750],
  ["iphone15-promax", 430, 740],
  ["iphone-se", 375, 553],
  ["pixel8-chrome", 412, 800],
  ["galaxy-s", 360, 680],
  ["landscape-phone", 844, 340],
] as const;

const b = await chromium.launch();
const rows: Record<string, unknown>[] = [];
for (const [name, width, height] of SIZES) {
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const r = (s: string) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), height: Math.round(b.height), visible: getComputedStyle(el).display !== "none" };
    };
    const go = r(".hero-copy .cta-row .btn-go");
    return {
      vh: innerHeight,
      title: r(".hero-title .logo"),
      tagline: r(".hero-title .tagline"),
      art: r(".hero-art img"),
      go,
      // the button's hard 5px ink shadow is part of what you see
      marginBelowPlay: go ? innerHeight - (go.bottom + 5) : null,
      hero: r(".hero"),
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  await p.screenshot({ path: `${OUT}/${LABEL}-${name}-${width}x${height}.png` });
  // the sticky bar Play: scroll past the hero and check it shows
  await p.evaluate(() => scrollTo(0, document.querySelector<HTMLElement>(".hero")!.offsetHeight + 200));
  await p.waitForTimeout(700);
  const bar = await p.evaluate(() => {
    const a = document.querySelector<HTMLElement>(".bar-play")!;
    const cs = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return { solid: document.getElementById("bar")!.classList.contains("solid"), visible: cs.visibility === "visible" && +cs.opacity > 0.9 && r.height > 0 && r.left >= 0 && r.right <= innerWidth, top: Math.round(r.top), right: Math.round(r.right) };
  });
  await p.screenshot({ path: `${OUT}/${LABEL}-${name}-${width}x${height}-scrolled.png` });
  const ok = !!m.go && m.marginBelowPlay! >= 12 && !!m.title && m.title.top >= 0 && m.scrollWidth <= width && bar.visible;
  rows.push({ name, size: `${width}x${height}`, ok, ...m, bar });
  console.log(`${ok ? "OK  " : "FAIL"} ${name.padEnd(26)} ${width}x${height}  title ${m.title?.top}-${m.title?.bottom}  play ${m.go?.top}-${m.go?.bottom}  margin ${m.marginBelowPlay}  art h ${m.art?.height}  bar-play ${bar.visible ? "shows" : "MISSING/CLIPPED"} (right ${bar.right})  scrollW ${m.scrollWidth}`);
  await ctx.close();
}
await b.close();
writeFileSync(`${OUT}/${LABEL}.json`, JSON.stringify(rows, null, 2));
