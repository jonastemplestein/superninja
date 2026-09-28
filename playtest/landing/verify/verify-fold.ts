// Verifier: fold check of the production landing page. One browser at a time.
import { webkit, chromium, devices, type Browser } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "https://superninja.templestein.com";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/landing/verify";
mkdirSync(OUT, { recursive: true });

const IPHONE_UA = devices["iPhone 15"].userAgent;
const ANDROID_UA = devices["Pixel 7"].userAgent;
const SIZES: [string, number, number, "webkit" | "chromium", number][] = [
  ["iphone15-safari", 390, 664, "webkit", 3],
  ["iphone15-safari-collapsed", 390, 750, "webkit", 3],
  ["iphone15-promax", 430, 740, "webkit", 3],
  ["iphone-se", 375, 553, "webkit", 2],
  ["pixel8-chrome", 412, 800, "chromium", 2.625],
  ["galaxy-s", 360, 680, "chromium", 3],
  ["landscape-iphone", 844, 340, "webkit", 3],
  ["landscape-android", 844, 340, "chromium", 3],
];

const rows: any[] = [];
const ONLY = process.argv[2];
{
  for (const [name, width, height, eng, dpr] of SIZES) {
    if (ONLY && !name.includes(ONLY)) continue;
    const b: Browser = await (eng === "webkit" ? webkit : chromium).launch(); // a fresh browser per size, one at a time
    const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, userAgent: eng === "webkit" ? IPHONE_UA : ANDROID_UA });
    const p = await ctx.newPage();
    const errors: string[] = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    await p.goto(BASE + "/?v=" + Date.now(), { waitUntil: "load", timeout: 60000 }); await p.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(2500);
    const m = await p.evaluate(() => {
      const go = document.querySelector<HTMLElement>(".hero .cta-row .btn-go")!;
      const r = go.getBoundingClientRect();
      // the hard ink shadow is part of what you see: parse "0 5px 0 ..." offsets from box-shadow
      const bs = getComputedStyle(go).boxShadow;
      const offs = [...bs.matchAll(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+0px/g)].map((x) => +x[2]);
      const hardShadow = offs.length ? Math.max(...offs) : 5;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      const hitBottom = document.elementFromPoint(cx, r.bottom - 4);
      const logo = document.querySelector(".logo")!.getBoundingClientRect();
      const tag = document.querySelector(".tagline")!.getBoundingClientRect();
      const lede = document.querySelector(".lede")?.getBoundingClientRect();
      return {
        vh: innerHeight, vw: innerWidth, scrollY, scrollW: document.documentElement.scrollWidth,
        play: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height) },
        hardShadow, box: bs,
        marginBelow: Math.round(innerHeight - (r.bottom + hardShadow)),
        onTop: !!hit && (hit === go || go.contains(hit)), onTopBottomEdge: !!hitBottom && (hitBottom === go || go.contains(hitBottom)),
        logo: { top: Math.round(logo.top), bottom: Math.round(logo.bottom) },
        tagline: { top: Math.round(tag.top), bottom: Math.round(tag.bottom) },
        lede: lede ? { top: Math.round(lede.top), bottom: Math.round(lede.bottom) } : null,
        svh: (() => { const d = document.createElement("div"); d.style.cssText = "position:absolute;height:100svh;width:1px"; document.body.appendChild(d); const h = d.getBoundingClientRect().height; d.remove(); return h; })(),
      };
    });
    const file = `${OUT}/fold-${name}-${width}x${height}-${eng}.png`;
    await p.screenshot({ path: file });
    const ok = m.marginBelow >= 12 && m.play.top >= 0 && m.play.left >= 0 && m.play.right <= width && m.onTop && m.onTopBottomEdge && m.scrollY === 0 && m.scrollW <= width;
    rows.push({ name, size: `${width}x${height}`, engine: eng, ok, errors, file, ...m });
    console.log(`${ok ? "OK  " : "FAIL"} ${name.padEnd(26)} ${eng.padEnd(8)} ${width}x${height} play ${m.play.top}-${m.play.bottom} (+${m.hardShadow}px shadow) margin ${m.marginBelow}px  onTop ${m.onTop}/${m.onTopBottomEdge}  logo ${m.logo.top}-${m.logo.bottom} tagline ${m.tagline.top}-${m.tagline.bottom} svh ${m.svh} scrollW ${m.scrollW} errors ${errors.length}`);
    await ctx.close();
    await b.close();
  }
}
writeFileSync(`${OUT}/fold${ONLY ? "-" + ONLY : ""}.json`, JSON.stringify(rows, null, 2));
