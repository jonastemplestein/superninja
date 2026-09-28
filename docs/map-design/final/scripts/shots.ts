// Screenshots and measurements of the map mockup (docs/map-design/final/index.html), the same way the audit measured
// production (docs/map-design/current/scripts/map-audit.ts): Playwright Chromium, isMobile, hasTouch, DPR 3, an iPhone
// user agent, real touch taps. Writes docs/map-design/final/shots/.
//   bun docs/map-design/final/scripts/shots.ts [--only rest,states,boxes,closeups,tapmaps,probes,compare]
import { chromium, type Browser, type Page } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/docs/map-design";
const PAGE = `file://${ROOT}/final/index.html`;
const OUT = `${ROOT}/final/shots`;
mkdirSync(OUT, { recursive: true });
const arg = (k: string, d: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = new Set(arg("only", "rest,states,boxes,closeups,tapmaps,probes,compare").split(","));
const VIEWPORTS = [
  { name: "844x390", width: 844, height: 390 },
  { name: "667x375", width: 667, height: 375 },
  { name: "932x430", width: 932, height: 430 },
];
const CHILDREN = ["new", "bamboo", "w3"];
const STATES = ["hint", "idle8", "idle16", "help", "locked", "ninja", "confirm", "confirm8", "away"];
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

async function open(b: Browser, vp: (typeof VIEWPORTS)[number], q: string) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA });
  ctx.setDefaultTimeout(20000);
  const page = await ctx.newPage();
  await page.goto(`${PAGE}?clean=1&${q}`, { timeout: 20000 });
  await page.waitForFunction(() => (window as any).__ready === true, null, { timeout: 15000 });
  await page.waitForTimeout(250);
  return { ctx, page };
}

/** in-page: the glowing stone's disc hit-tested on a 1 CSS px grid, the ninja's box against the stone's, sizes */
async function measure(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage")!.getBoundingClientRect();
    const sc = stage.width / 1280;
    const stone = document.querySelector<HTMLElement>("[data-map-next]");
    if (!stone) return { here: false };
    const disc = stone.querySelector(".disc")!.getBoundingClientRect();
    const ninja = document.querySelector<HTMLElement>("[data-map-ninja]")!.getBoundingClientRect();
    const hand = document.querySelector<HTMLElement>("[data-map-hand]");
    const cx = disc.left + disc.width / 2, cy = disc.top + disc.height / 2, r = disc.width / 2;
    let n = 0, onStone = 0, onHand = 0, other = 0;
    const others: Record<string, number> = {};
    for (let y = Math.floor(disc.top); y <= disc.bottom; y++)
      for (let x = Math.floor(disc.left); x <= disc.right; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
        n++;
        const el = document.elementFromPoint(x, y);
        if (el && stone.contains(el)) onStone++;
        else if (el && hand?.contains(el)) onHand++;
        else { other++; const k = (el as HTMLElement)?.className?.toString?.() || "?"; others[k] = (others[k] ?? 0) + 1; }
      }
    const ix = Math.max(0, Math.min(ninja.right, disc.right) - Math.max(ninja.left, disc.left));
    const iy = Math.max(0, Math.min(ninja.bottom, disc.bottom) - Math.max(ninja.top, disc.top));
    const done = [...document.querySelectorAll<HTMLElement>("[data-map-done]")].map((e) => e.getBoundingClientRect());
    const gap = Math.min(...done.map((d) => Math.hypot(d.left + d.width / 2 - cx, d.top + d.height / 2 - cy) - r - d.width / 2));
    return {
      here: true, scale: +sc.toFixed(4),
      nextCss: +disc.width.toFixed(1), nextTapCss: +stone.getBoundingClientRect().width.toFixed(1),
      ninjaCss: { w: +ninja.width.toFixed(1), h: +ninja.height.toFixed(1) },
      ninjaOverStoneCss: `${ix.toFixed(1)} × ${iy.toFixed(1)}`,
      ninjaToStoneGapCss: +Math.max(disc.left - ninja.right, ninja.left - disc.right).toFixed(1),
      discTaps: { points: n, stone: +((100 * onStone) / n).toFixed(1), hand: +((100 * onHand) / n).toFixed(1), other: +((100 * other) / n).toFixed(1), others },
      nearestFinishedTapCircleCss: Number.isFinite(gap) ? +gap.toFixed(1) : null,
      finishedTapCss: done.length ? +Math.min(...done.map((d) => d.width)).toFixed(1) : null,
      snState: (window as any).__snState,
    };
  });
}

/** what a finger hits, every 6 CSS px: the share of the tappable area per target (like the audit's area-audit.ts) */
async function tapmap(page: Page) {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage")!.getBoundingClientRect();
    const kind = (el: Element | null): string => {
      if (!el) return "none";
      if (el.closest("[data-map-next], [data-map-hand]")) return "next";
      if (el.closest("[data-map-done]")) return "done";
      if (el.closest("[data-map-ninja]")) return "ninja";
      if (el.closest("[data-map-way]")) return "way";
      if (el.closest('[data-nav="home"]')) return "home";
      if (el.closest(".help")) return "help";
      if (el.closest("button")) return "button";
      return "background";
    };
    const pts: [number, number, string][] = [];
    const area: Record<string, number> = {};
    for (let y = stage.top + 3; y < stage.bottom; y += 6)
      for (let x = stage.left + 3; x < stage.right; x += 6) {
        const k = kind(document.elementFromPoint(x, y));
        pts.push([x, y, k]);
        area[k] = (area[k] ?? 0) + 36;
      }
    const tappable = Object.entries(area).filter(([k]) => k !== "background" && k !== "none").reduce((a, [, v]) => a + v, 0);
    const share = Object.fromEntries(Object.entries(area).filter(([k]) => k !== "background" && k !== "none").map(([k, v]) => [k, { px2: v, pct: +((100 * v) / tappable).toFixed(1) }]));
    return { pts, share };
  });
}

const b = await chromium.launch();
setTimeout(() => { console.error("watchdog: over 20 minutes, giving up"); process.exit(2); }, 20 * 60_000);
const measurements: any = { made: new Date().toISOString(), page: "docs/map-design/final/index.html", rest: {}, states: {}, tapmaps: {}, probes: {} };
for (const vp of VIEWPORTS)
  for (const child of CHILDREN) {
    const tag = `${child}-${vp.name}`;
    if (ONLY.has("rest") || ONLY.has("closeups")) {
      const { ctx, page } = await open(b, vp, `child=${child}&state=rest`);
      if (ONLY.has("rest")) await page.screenshot({ path: `${OUT}/${tag}.jpg`, type: "jpeg", quality: 88 });
      measurements.rest[tag] = await measure(page);
      if (ONLY.has("closeups")) {
        const box = await page.evaluate(() => {
          const d = document.querySelector("[data-map-next] .disc")!.getBoundingClientRect(), n = document.querySelector("[data-map-ninja]")!.getBoundingClientRect();
          const l = Math.min(d.left, n.left) - 40, t = Math.min(d.top, n.top) - 40, r = Math.max(d.right, n.right) + 60, bt = Math.max(d.bottom, n.bottom) + 50;
          return { x: Math.max(0, l), y: Math.max(0, t), width: Math.min(innerWidth, r) - Math.max(0, l), height: Math.min(innerHeight, bt) - Math.max(0, t) };
        });
        await page.screenshot({ path: `${OUT}/${tag}-closeup.png`, clip: box });
      }
      await ctx.close();
    }
    if (vp.name !== "844x390") continue;
    if (ONLY.has("boxes")) {
      const { ctx, page } = await open(b, vp, `child=${child}&state=rest&debug=1`);
      await page.screenshot({ path: `${OUT}/${tag}-boxes.jpg`, type: "jpeg", quality: 88 });
      await ctx.close();
    }
    if (ONLY.has("states"))
      for (const st of STATES) {
        const { ctx, page } = await open(b, vp, `child=${child}&state=${st}`);
        await page.screenshot({ path: `${OUT}/${tag}-${st}.jpg`, type: "jpeg", quality: 88 });
        measurements.states[`${tag}-${st}`] = await page.evaluate(() => (window as any).__snState);
        await ctx.close();
      }
    if (ONLY.has("tapmaps")) {
      const { ctx, page } = await open(b, vp, `child=${child}&state=idle8`);
      const tm = await tapmap(page);
      measurements.tapmaps[tag] = tm.share;
      const COL: Record<string, string> = { next: "#00c853", done: "#ff9100", ninja: "#ffd600", way: "#00c853", home: "#ff1744", help: "#00e5ff", button: "#2962ff" };
      await page.evaluate(([pts, COL]) => {
        const c = document.createElement("canvas");
        c.width = innerWidth; c.height = innerHeight;
        Object.assign(c.style, { position: "fixed", inset: "0", zIndex: "999", pointerEvents: "none" });
        const g = c.getContext("2d")!;
        for (const [x, y, k] of pts as [number, number, string][]) if (COL[k]) { g.fillStyle = COL[k] + "b0"; g.fillRect(x - 3, y - 3, 6, 6); }
        g.fillStyle = "#fffffff0"; g.fillRect(innerWidth - 200, 4, 196, 118);
        g.font = "600 12px system-ui"; let yy = 20;
        for (const [k, lab] of [["next", "next level (+ its hand)"], ["done", "finished: asks first"], ["ninja", "ninja: shows the way"], ["button", "side buttons, ◀ ▶"], ["home", "Home → title"], ["help", "Help"]]) { g.fillStyle = COL[k]; g.fillRect(innerWidth - 194, yy - 10, 12, 12); g.fillStyle = "#222"; g.fillText(lab, innerWidth - 176, yy); yy += 18; }
        document.body.append(c);
      }, [tm.pts, COL] as const);
      await page.screenshot({ path: `${OUT}/${tag}-tapmap.jpg`, type: "jpeg", quality: 85 });
      await ctx.close();
    }
    if (ONLY.has("probes")) {
      // real touch taps on the things a three-year-old taps first (audit §3), and what each one does
      const probes: any[] = [];
      const targets = ["the middle of the glowing stone", "the glowing stone's bottom rim", "the pointing hand's palm", "the ninja's head", "the finished stone nearest the ninja", "a locked stone", "30 CSS px below the glowing stone"];
      for (const which of targets) {
        const { ctx, page } = await open(b, vp, `child=${child}&state=idle8`);
        const pt = await page.evaluate((which) => {
          const r = (s: string) => document.querySelector(s)?.getBoundingClientRect();
          const d = r("[data-map-next] .disc")!, n = r("[data-map-ninja]")!;
          const done = [...document.querySelectorAll("[data-map-done]")].map((e) => e.getBoundingClientRect());
          const near = done.sort((a, b) => Math.hypot(a.x - n.x, a.y - n.y) - Math.hypot(b.x - n.x, b.y - n.y))[0];
          const lk = document.querySelector("[data-map-locked]")?.getBoundingClientRect();
          const hand = document.querySelector("[data-map-hand] path")!.getBoundingClientRect();
          switch (which) {
            case "the middle of the glowing stone": return [d.left + d.width / 2, d.top + d.height / 2];
            case "the glowing stone's bottom rim": return [d.left + d.width / 2, d.bottom - 4];
            case "the pointing hand's palm": return [hand.left + hand.width * 0.55, hand.top + hand.height * 0.7];
            case "the ninja's head": return [n.left + n.width / 2, n.top + n.height * 0.18];
            case "the finished stone nearest the ninja": return near ? [near.left + near.width / 2, near.top + near.height / 2] : null;
            case "a locked stone": return lk ? [lk.left + lk.width / 2, lk.top + lk.height / 2] : null;
            default: return [d.left + d.width / 2, Math.min(innerHeight - 30, d.bottom + 30)];
          }
        }, which);
        if (!pt) { await ctx.close(); continue; }
        await page.waitForTimeout(450);
        await page.touchscreen.tap(pt[0], pt[1]);
        await page.waitForTimeout(250);
        const res = await page.evaluate(() => (document.querySelector(".veil") ? "plays the next level" : document.querySelector(".cf-root") ? "asks first: the replay question" : document.querySelector(".stone.next.flash") ? "shows the way (the stone flashes, the hand, the ninja points, the hint)" : "nothing"));
        probes.push({ tap: which, at: pt.map((v: number) => +v.toFixed(1)), result: res });
        await ctx.close();
      }
      measurements.probes[tag] = probes;
    }
  }
await b.close();

// today's screenshots beside the new ones
if (ONLY.has("compare")) {
  const b2 = await chromium.launch();
  const p = await b2.newPage({ viewport: { width: 1700, height: 460 }, deviceScaleFactor: 1 });
  for (const vp of VIEWPORTS)
    for (const child of CHILDREN) {
      const tag = `${child}-${vp.name}`;
      const today = `${ROOT}/current/${tag}.jpg`, now = `${OUT}/${tag}.jpg`;
      if (!existsSync(today) || !existsSync(now)) continue;
      const html = `${tmpdir()}/sn-compare-${tag}.html`;
      writeFileSync(html, `<body style="margin:0;background:#1d1230;font:700 18px system-ui;color:#fff;display:flex;gap:12px;padding:10px">
        <div style="flex:1"><div style="margin:0 0 6px">Today (production, ${vp.name})</div><img src="file://${today}" style="width:100%"></div>
        <div style="flex:1"><div style="margin:0 0 6px">Redesign (mockup, ${vp.name})</div><img src="file://${now}" style="width:100%"></div></body>`);
      await p.goto(`file://${html}`);
      await p.waitForTimeout(300);
      const h = await p.evaluate(() => document.body.scrollHeight);
      await p.setViewportSize({ width: 1700, height: h });
      await p.screenshot({ path: `${OUT}/compare-${tag}.jpg`, type: "jpeg", quality: 85 });
    }
  await b2.close();
}
const prev = existsSync(`${OUT}/measurements.json`) ? JSON.parse(await Bun.file(`${OUT}/measurements.json`).text()) : {};
writeFileSync(`${OUT}/measurements.json`, JSON.stringify({ ...prev, ...Object.fromEntries(Object.entries(measurements).filter(([, v]) => typeof v !== "object" || Object.keys(v as object).length)) }, null, 1));
console.log("done", OUT);
process.exit(0); // (the watchdog timer would keep the process alive)
