// Map auditor: plays the production map at three phone sizes (DPR 3, touch) for three children, measures the next
// stone, the ninja, the pointing hand and every tap target, and writes screenshots + a JSON of measurements.
// Usage: bun map-audit.ts [--base https://superninja.templestein.com] [--out docs/map-design/current] [--only shots|taps|idle]
import { chromium, type Page, type BrowserContext } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright";
import { mkdirSync, writeFileSync } from "fs";
import { LEVELS } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/worlds";

const arg = (k: string, d: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("base", "https://superninja.templestein.com");
const OUT = arg("out", "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/docs/map-design/current");
const ONLY = arg("only", "all");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "844x390", width: 844, height: 390 },
  { name: "667x375", width: 667, height: 375 },
  { name: "932x430", width: 932, height: 430 },
];

function saveFor(next: string) {
  const i = LEVELS.findIndex((l) => l.id === next);
  const before = LEVELS.slice(0, i);
  const stars = Object.fromEntries(before.map((l) => [l.id, l.warmup ? 1 : 3]));
  const petals = [...new Set(before.flatMap((l) => (l.teach ?? []).map((t) => t.split("=")[0])))];
  return {
    v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenStreak: true,
    schoolYear: "none", schoolYearAt: Date.now(), band: "pre", captionsV2: true,
    stars, read: {}, spell: {}, words: {}, petals: petals.length ? petals : ["s"], energy: {}, gems: [], placed: [],
    flowerSeen: [...new Set(before.map((l) => `world:${l.world}`))],
    settings: { relaxed: false, music: 0, captions: false, unlockAll: false },
    minutes: before.length * 6, sessions: Math.max(1, Math.ceil(before.length / 3)), stickers: ["sun", "sock"], shiny: [], adjustLog: [],
  };
}
const STATES = [
  { name: "new", next: "w1-wu3", title: "a new child, just after the first session (next: the third warm-up stone)" },
  { name: "bamboo", next: "w1-7", title: "partway through Bamboo Village (next: w1-7, Sound Hunt)" },
  { name: "w3", next: "w3-6", title: "in the Misty Mountains (next: w3-6, a dojo)" },
];

async function open(ctx: BrowserContext, state: (typeof STATES)[number], url: string) {
  const page = await ctx.newPage();
  const sv = saveFor(state.next);
  await page.addInitScript((sv) => {
    const w = window as any;
    w.__audioLog = [];
    try {
      if (!sessionStorage.getItem("audit.seeded")) {
        localStorage.clear();
        const id = "paudit";
        localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: "kai", created: Date.now(), last: Date.now() }], current: id }));
        localStorage.setItem(`superninja.save.${id}`, JSON.stringify(sv));
        sessionStorage.setItem("audit.seeded", "1");
      }
      sessionStorage.setItem("sn.setup", "done");
    } catch {}
  }, sv);
  await page.goto(`${BASE}${url}`);
  return page;
}
const said = (page: Page) => page.evaluate(() => ((window as any).__audioLog ?? []).filter((e: any) => e.kind === "speech").map((e: any) => ({ t: e.t, id: String(e.url).replace(/^.*\/l\//, "").replace(/\.mp3$/, "") })));

/** In-page: every tap target, the next stone, the ninja, the hand, and the hit-test of the stone's disk. */
async function measure(page: Page) {
  return page.evaluate(async () => {
    const stage = document.querySelector(".stage") as HTMLElement;
    const sr = stage.getBoundingClientRect();
    const scale = sr.width / 1280;
    const R = (r: DOMRect) => ({ x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
    const toStage = (x: number, y: number) => ({ x: Math.round((x - sr.left) / scale), y: Math.round((y - sr.top) / scale) });
    const stones = [...document.querySelectorAll<HTMLButtonElement>(".scene.map button[aria-label^='level ']")].map((b) => {
      const r = b.getBoundingClientRect();
      return { id: b.getAttribute("aria-label")!.slice(6), cur: b.classList.contains("map-next"), locked: /grayscale/.test((b.querySelector("img") as HTMLElement).style.filter), opacity: getComputedStyle(b).opacity, rect: R(r), stageSize: Math.round(r.width / scale) };
    });
    const curEl = document.querySelector<HTMLElement>(".scene.map .map-next")!;
    const cr = curEl.getBoundingClientRect();
    const hero = document.querySelector<HTMLElement>(".map-hero");
    const hr = hero?.getBoundingClientRect();
    const himg = hero?.querySelector("img") as HTMLImageElement | null;
    const ir = himg?.getBoundingClientRect();
    // the sprite's painted pixels, in CSS px (alpha > 128)
    let alphaAt: ((x: number, y: number) => boolean) | null = null;
    if (himg && ir) {
      await himg.decode().catch(() => {});
      const k = 2;
      const c = document.createElement("canvas");
      c.width = Math.ceil(ir.width * k);
      c.height = Math.ceil(ir.height * k);
      const g = c.getContext("2d")!;
      g.drawImage(himg, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      alphaAt = (x, y) => {
        const px = Math.floor((x - ir.left) * k), py = Math.floor((y - ir.top) * k);
        if (px < 0 || py < 0 || px >= c.width || py >= c.height) return false;
        return d[(py * c.width + px) * 4 + 3] > 128;
      };
    }
    const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2, rad = cr.width / 2;
    const icon = curEl.querySelector("img")!.getBoundingClientRect();
    const who = (el: Element | null) => {
      if (!el) return "nothing";
      const t = el.closest("[data-tap-proxy], button, [aria-label], [data-nav]");
      if (!t) return "background";
      if (t.matches("[data-tap-proxy]")) return "ninja";
      return t.getAttribute("aria-label") ?? t.getAttribute("data-nav") ?? t.className;
    };
    // hit-test and paint-test the stone's disk and its icon on a 1-CSS-px grid
    let disk = 0, diskHero = 0, diskStone = 0, diskOther = 0, diskPainted = 0, iconN = 0, iconPainted = 0;
    const otherHits: Record<string, number> = {};
    for (let y = Math.floor(cr.top); y <= cr.bottom; y++)
      for (let x = Math.floor(cr.left); x <= cr.right; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 > rad * rad) continue;
        disk++;
        const w = who(document.elementFromPoint(x, y));
        if (w === "ninja") diskHero++;
        else if (w === curEl.getAttribute("aria-label")) diskStone++;
        else (diskOther++, (otherHits[w] = (otherHits[w] ?? 0) + 1));
        if (alphaAt?.(x, y)) diskPainted++;
        if (x >= icon.left && x <= icon.right && y >= icon.top && y <= icon.bottom) {
          iconN++;
          if (alphaAt?.(x, y)) iconPainted++;
        }
      }
    // overlap of the ninja's box with the stone's box
    const ov = hr ? { x: Math.max(0, Math.min(hr.right, cr.right) - Math.max(hr.left, cr.left)), y: Math.max(0, Math.min(hr.bottom, cr.bottom) - Math.max(hr.top, cr.top)) } : null;
    // the painted sprite's own bounds
    let spriteBox: any = null;
    if (alphaAt && ir) {
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = ir.top; y < ir.bottom; y += 0.5) for (let x = ir.left; x < ir.right; x += 0.5) if (alphaAt(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      spriteBox = { x: +x0.toFixed(1), y: +y0.toFixed(1), w: +(x1 - x0).toFixed(1), h: +(y1 - y0).toFixed(1) };
    }
    // the pointing hand: its box, and what a tap at its fingertip (svg 31,8 of 64) or its middle lands on
    const handEl = [...curEl.querySelectorAll("div")].find((d) => (d as HTMLElement).style.animation.includes("taphint")) as HTMLElement | undefined;
    const hand = handEl ? handEl.getBoundingClientRect() : null;
    const tip = hand ? { x: hand.left + (31 / 64) * hand.width, y: hand.top + (8 / 64) * hand.height } : null;
    const handInfo = hand && tip ? { rect: R(hand), tip: { x: +tip.x.toFixed(1), y: +tip.y.toFixed(1) }, tipStage: toStage(tip.x, tip.y), tipOnStone: (tip.x - cx) ** 2 + (tip.y - cy) ** 2 <= rad * rad, tipDistFromStoneEdge: +(Math.hypot(tip.x - cx, tip.y - cy) - rad).toFixed(1), tapAtTip: who(document.elementFromPoint(tip.x, tip.y)), tapAtMiddle: who(document.elementFromPoint(hand.left + hand.width / 2, hand.top + hand.height / 2)) } : null;
    // every other tap target on screen
    const targets = [...document.querySelectorAll<HTMLElement>("button, [data-tap-proxy], [role=button]")]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && getComputedStyle(e).visibility !== "hidden" && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight; })
      .map((e) => { const r = e.getBoundingClientRect(); return { label: e.getAttribute("aria-label") ?? (e.matches("[data-tap-proxy]") ? "the ninja (→ the next level)" : e.className), cls: e.className, rect: R(r), stage: toStage(r.left + r.width / 2, r.top + r.height / 2), cssSize: Math.round(Math.min(r.width, r.height)), z: getComputedStyle(e).zIndex, pulse: /pulse|map-next/.test(e.className) }; });
    return {
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio, coarse: matchMedia("(pointer: coarse)").matches },
      scale: +scale.toFixed(4), stageRect: R(sr),
      next: { id: curEl.getAttribute("aria-label"), rect: R(cr), stageSize: Math.round(cr.width / scale), centreStage: toStage(cx, cy), z: getComputedStyle(curEl).zIndex, icon: R(icon) },
      hero: hr ? { rect: R(hr), stageBox: { w: Math.round(hr.width / scale), h: Math.round(hr.height / scale) }, z: getComputedStyle(hero!).zIndex, sprite: spriteBox } : null,
      overlapBox: ov && { x: +ov.x.toFixed(1), y: +ov.y.toFixed(1), fracOfStoneH: +(ov.y / cr.height).toFixed(3), fracOfStoneW: +(ov.x / cr.width).toFixed(3) },
      diskHitTest: { disk, toNinja: +(diskHero / disk).toFixed(3), toStone: +(diskStone / disk).toFixed(3), toOther: +(diskOther / disk).toFixed(3), otherHits },
      diskHiddenBySprite: +(diskPainted / disk).toFixed(3), iconHiddenBySprite: iconN ? +(iconPainted / iconN).toFixed(3) : null,
      hand: handInfo,
      stones, targets,
    };
  });
}

/** A tap map: every 6 CSS px, what a finger there would hit, drawn over the screen. */
async function tapMap(page: Page, file: string, curLabel: string) {
  await page.evaluate((curLabel) => {
    const who = (el: Element | null) => {
      if (!el) return "none";
      const t = el.closest("[data-tap-proxy], button, [aria-label], [data-nav]");
      if (!t) return "none";
      if (t.matches("[data-tap-proxy]")) return "ninja";
      const l = t.getAttribute("aria-label") ?? "";
      if (l === curLabel) return "next";
      if (l.startsWith("level ")) return /grayscale/.test((t.querySelector("img") as HTMLElement | null)?.style.filter ?? "") ? "locked" : "old";
      if (/world/.test(l)) return "world";
      if (l === "Home" || t.getAttribute("data-nav") === "home") return "home";
      if (l === "Help") return "help";
      return "side";
    };
    const col: Record<string, string> = { ninja: "rgba(0,200,90,.55)", next: "rgba(0,230,120,.55)", old: "rgba(255,120,0,.55)", locked: "rgba(120,120,120,.55)", world: "rgba(160,60,255,.5)", home: "rgba(255,0,60,.55)", help: "rgba(0,190,255,.5)", side: "rgba(40,90,255,.5)" };
    const cells: [number, number, string][] = [];
    const step = 6;
    for (let y = 0; y < innerHeight; y += step) for (let x = 0; x < innerWidth; x += step) cells.push([x, y, who(document.elementFromPoint(x + step / 2, y + step / 2))]);
    const cv = document.createElement("canvas");
    cv.id = "audit-tapmap";
    cv.width = innerWidth * 2;
    cv.height = innerHeight * 2;
    Object.assign(cv.style, { position: "fixed", inset: "0", width: innerWidth + "px", height: innerHeight + "px", zIndex: "99999", pointerEvents: "none" });
    const g = cv.getContext("2d")!;
    g.scale(2, 2);
    for (const [x, y, k] of cells) if (col[k]) (g.fillStyle = col[k]), g.fillRect(x, y, step, step);
    // legend, in the right-hand margin beside the stage
    const L = [["next", "next level"], ["ninja", "ninja → next"], ["old", "old stone: replays"], ["locked", "locked: Not yet!"], ["world", "◀ ▶ lands"], ["side", "side buttons"], ["home", "Home → title"], ["help", "Help"]];
    g.font = "bold 8px system-ui";
    const lw = 92;
    let ly = 6;
    g.fillStyle = "rgba(255,255,255,.9)";
    g.fillRect(innerWidth - lw - 2, ly - 3, lw, L.length * 11 + 4);
    for (const [k, t] of L) {
      g.fillStyle = col[k].replace(/[\d.]+\)$/, "1)");
      g.fillRect(innerWidth - lw + 1, ly, 8, 8);
      g.fillStyle = "#111";
      g.fillText(t, innerWidth - lw + 12, ly + 7);
      ly += 11;
    }
    document.body.appendChild(cv);
  }, curLabel);
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  await page.evaluate(() => document.getElementById("audit-tapmap")?.remove());
}

// one-off animations (the fade-in, the stones popping in) run to their end; endless ones (the bounce, the bob, the hand)
// stop at their resting frame, so the geometry is the layout's own
const freeze = (page: Page) => page.evaluate(() => document.getAnimations().forEach((a) => { try { const it = a.effect?.getTiming().iterations; if (it === Infinity) { a.pause(); a.currentTime = 0; } else a.finish(); } catch {} }));

async function main() {
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const results: any = { base: BASE, at: new Date().toISOString(), shots: {}, taps: {}, idle: {}, arrive: {} };
  const ctxFor = (vp: (typeof VIEWPORTS)[number]) => browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });

  if (ONLY === "all" || ONLY === "shots") {
    for (const vp of VIEWPORTS) for (const st of STATES) {
      const ctx = await ctxFor(vp);
      const page = await open(ctx, st, "/play/?scene=map");
      await page.waitForSelector(".scene.map .map-next", { timeout: 20000 });
      await page.waitForTimeout(2500); // the stones pop in; the ninja bobs
      const tag = `${st.name}-${vp.name}`;
      await page.screenshot({ path: `${OUT}/${tag}.jpg`, type: "jpeg", quality: 85 });
      await freeze(page);
      const m = await measure(page);
      // a close-up of the next stone and the ninja, at device resolution
      const c = m.next.rect, h = m.hero?.rect ?? c;
      const x0 = Math.max(0, Math.min(c.x, h.x) - 40), y0 = Math.max(0, Math.min(c.y, h.y) - 30);
      const x1 = Math.min(vp.width, Math.max(c.x + c.w, h.x + h.w) + 70), y1 = Math.min(vp.height, Math.max(c.y + c.h, h.y + h.h) + 50);
      await page.screenshot({ path: `${OUT}/${tag}-closeup.png`, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
      // the same close-up with the ninja hidden: what the child can't see
      await page.evaluate(() => { const h = document.querySelector<HTMLElement>(".map-hero"); if (h) h.style.visibility = "hidden"; });
      await page.screenshot({ path: `${OUT}/${tag}-closeup-no-ninja.png`, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
      await page.evaluate(() => { const h = document.querySelector<HTMLElement>(".map-hero"); if (h) h.style.visibility = ""; });
      await tapMap(page, `${OUT}/${tag}-tapmap.jpg`, m.next.id!);
      await page.waitForTimeout(6000);
      results.shots[tag] = { state: st.title, ...m, said: await said(page) };
      console.log(tag, JSON.stringify({ scale: m.scale, next: m.next.rect, stage: m.next.stageSize, hero: m.hero?.rect, ov: m.overlapBox, hit: m.diskHitTest, hidden: m.diskHiddenBySprite, icon: m.iconHiddenBySprite, hand: m.hand?.tapAtTip, tipEdge: m.hand?.tipDistFromStoneEdge }));
      await ctx.close();
    }
  }

  if (ONLY === "all" || ONLY === "taps") {
    // what a child's tap on each thing does (844x390, partway through Bamboo Village)
    const vp = VIEWPORTS[0];
    const st = STATES[1];
    const probes: { name: string; at: (m: any) => { x: number; y: number } | null }[] = [
      { name: "the pointing hand's fingertip", at: (m) => m.hand?.tip ?? null },
      { name: "the middle of the pointing hand", at: (m) => m.hand ? { x: m.hand.rect.x + m.hand.rect.w / 2, y: m.hand.rect.y + m.hand.rect.h / 2 } : null },
      { name: "the ninja's head", at: (m) => m.hero?.sprite ? { x: m.hero.sprite.x + m.hero.sprite.w / 2, y: m.hero.sprite.y + 8 } : null },
      { name: "the visible gold rim below the ninja", at: (m) => ({ x: m.next.rect.x + m.next.rect.w / 2, y: m.next.rect.y + m.next.rect.h - 6 }) },
      { name: "the stone just finished (w1-6, the battle)", at: (m) => { const s = m.stones.find((s: any) => s.id === "w1-6"); return s && { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 }; } },
      { name: "the stars under a finished stone (w1-5)", at: (m) => { const s = m.stones.find((s: any) => s.id === "w1-5"); return s && { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h + 6 }; } },
      { name: "the first locked stone (w1-8)", at: (m) => { const s = m.stones.find((s: any) => s.id === "w1-8"); return s && { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 }; } },
      { name: "the gold Sensei's Challenge button", at: (m) => { const s = m.targets.find((t: any) => t.label === "Sensei's Challenge"); return s && { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 }; } },
      { name: "the ▶ next-land arrow", at: (m) => { const s = m.targets.find((t: any) => t.label === "next world"); return s && { x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2 }; } },
    ];
    for (const p of probes) {
      const ctx = await ctxFor(vp);
      const page = await open(ctx, st, "/play/?scene=map");
      await page.waitForSelector(".scene.map .map-next", { timeout: 20000 });
      await page.waitForTimeout(7000); // let the arrival lines finish
      await freeze(page);
      const m = await measure(page);
      const at = p.at(m);
      if (!at) { results.taps[p.name] = { error: "not found" }; await ctx.close(); continue; }
      const before = (await said(page)).length;
      await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.play(); } catch {} }));
      await page.touchscreen.tap(at.x, at.y);
      await page.waitForTimeout(1800);
      const route = await page.evaluate(() => String((window as any).__snRoute ?? ""));
      const lines = (await said(page)).slice(before).map((e: any) => e.id);
      const slug = p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "");
      await page.screenshot({ path: `${OUT}/tap-${slug}.jpg`, type: "jpeg", quality: 70 });
      results.taps[p.name] = { at: { x: Math.round(at.x), y: Math.round(at.y) }, route, lines };
      console.log("tap", p.name, "→", route, lines.join(","));
      await ctx.close();
    }
  }

  if (ONLY === "all" || ONLY === "idle") {
    // arrival from the title (Start → the map, "welcome"), then 45 s with no tap: what does Sensei say, and when?
    const vp = VIEWPORTS[0];
    for (const st of [STATES[0], STATES[1]]) {
      const ctx = await ctxFor(vp);
      const page = await open(ctx, st, "/play/");
      await page.waitForTimeout(2500);
      const t0 = Date.now();
      const tapLabel = async (re: RegExp) => {
        const loc = page.locator("button, [aria-label]").filter({ has: page.locator(":scope") });
        const all = await page.locator("[aria-label]").evaluateAll((els, src) => els.map((e) => e.getAttribute("aria-label")).filter((l) => new RegExp(src).test(l ?? "")), re.source);
        if (!all.length) return false;
        const box = await page.locator(`[aria-label="${all[0]}"]`).first().boundingBox();
        if (!box) return false;
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        return all[0];
      };
      const steps: string[] = [];
      for (let k = 0; k < 6; k++) {
        const route = await page.evaluate(() => String((window as any).__snRoute ?? ""));
        steps.push(route);
        if (route.startsWith("map")) break;
        const hit = (await tapLabel(/^(Start|Play|player )/)) || (await tapLabel(/Ninja/));
        steps.push(`tap ${hit}`);
        await page.waitForTimeout(1500);
      }
      await page.waitForSelector(".scene.map .map-next", { timeout: 20000 }).catch(() => {});
      const tMap = Date.now();
      await page.waitForTimeout(45000);
      const lines = (await said(page)).map((e: any) => ({ id: e.id, s: +((e.t - tMap) / 1000).toFixed(1) }));
      await page.screenshot({ path: `${OUT}/idle45-${st.name}-844x390.jpg`, type: "jpeg", quality: 80 });
      results.idle[st.name] = { steps, lines, route: await page.evaluate(() => String((window as any).__snRoute ?? "")) };
      console.log("idle", st.name, JSON.stringify(results.idle[st.name]));
      await ctx.close();
    }
  }

  if (ONLY === "all" || ONLY === "arrive") {
    const vp = VIEWPORTS[0];
    const cases = [
      { name: "arrive-r2", url: "/play/?scene=reward&id=w1-wu2", next: "w1-wu2", extra: { stars: { "w1-wu1": 1 }, firstSession: { lessons: ["w1-wu1", "w1-wu2"], step: 1 }, seenBook: true, petals: [] } },
      { name: "arrive-w1-6", url: "/play/?scene=reward&id=w1-6", next: "w1-6", extra: {} },
    ];
    for (const c of cases) {
      const ctx = await ctxFor(vp);
      const page = await ctx.newPage();
      const sv = { ...saveFor(c.next), ...c.extra };
      await page.addInitScript((sv) => {
        (window as any).__audioLog = [];
        try {
          if (!sessionStorage.getItem("audit.seeded")) {
            localStorage.clear();
            localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id: "paudit", name: "Ninja", hero: "kai", created: Date.now(), last: Date.now() }], current: "paudit" }));
            localStorage.setItem("superninja.save.paudit", JSON.stringify(sv));
            sessionStorage.setItem("audit.seeded", "1");
          }
          sessionStorage.setItem("sn.setup", "done");
        } catch {}
      }, sv);
      await page.goto(`${BASE}${c.url}`);
      await page.waitForTimeout(3000);
      const home = await page.locator('[data-nav="home"]').first().boundingBox();
      if (!home) { console.log(c.name, "no Home"); await ctx.close(); continue; }
      await page.touchscreen.tap(home.x + home.width / 2, home.y + home.height / 2);
      const t0 = Date.now();
      await page.waitForSelector(".scene.map", { timeout: 10000 }).catch(() => {});
      const frames: string[] = [];
      for (const ms of [300, 900, 1600, 3500, 8000]) {
        const wait = ms - (Date.now() - t0);
        if (wait > 0) await page.waitForTimeout(wait);
        const f = `${c.name}-${String(ms).padStart(4, "0")}ms.jpg`;
        await page.screenshot({ path: `${OUT}/${f}`, type: "jpeg", quality: 80 });
        frames.push(f);
      }
      await page.waitForTimeout(Math.max(0, 45000 - (Date.now() - t0)));
      const lines = (await said(page)).filter((e: any) => e.t >= t0 - 200).map((e: any) => ({ id: e.id, s: +((e.t - t0) / 1000).toFixed(1) }));
      const hands = await page.evaluate(() => [...document.querySelectorAll("div")].filter((d) => (d as HTMLElement).style.animation.includes("taphint")).length);
      results.arrive[c.name] = { frames, lines, handsAt45s: hands, route: await page.evaluate(() => String((window as any).__snRoute ?? "")) };
      console.log(c.name, JSON.stringify(results.arrive[c.name]));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/measurements${ONLY === "all" ? "" : "-" + ONLY}.json`, JSON.stringify(results, null, 1));
  await browser.close();
}
main();
