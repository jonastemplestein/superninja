// Nav verify, targeted: (A) where Home lands from each screen; (B) idle turns never answer for the child;
// (C) Reward 1's last step holds. Usage: bun playtest/nav-verify/probe2.ts [outDir]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { step as botStep, save } from "../../scripts/treadmill/bot";

const BASE = "http://localhost:5173";
const FAST = 4;
const OUT = process.argv[2] ?? "playtest/nav-verify/r1-targeted";
mkdirSync(OUT, { recursive: true });
const G = (ms: number) => ms / FAST;
const out: string[] = [];
const bad: string[] = [];
const FLOWER = { petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"], gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"], energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 }, words: { rain: { n: 2, ok: 2, last: 3 } } };
const FRESH = { v: 1, hero: "kai", seenIntro: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true };

async function open(b: any, url: string, sv: object) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => {
    localStorage.clear();
    const id = "pnav";
    localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: (s as any).hero ?? null, created: Date.now(), last: Date.now() }], current: id }));
    localStorage.setItem(`superninja.save.${id}`, JSON.stringify(s));
    sessionStorage.setItem("sn.setup", "done");
  }, { ...sv, settings: { ...((sv as any).settings ?? {}), music: 0, captions: true } });
  await page.addInitScript(() => {
    (window as any).__audioLog = [];
  });
  await page.goto(`${BASE}${url}${url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await page.waitForTimeout(700);
  await page.mouse.click(420, 4).catch(() => {});
  return { ctx, page };
}
const st = (p: Page) => p.evaluate(() => ({ route: (window as any).__snRoute, st: (window as any).__snState, nav: (window as any).__snNav, scenes: [...document.querySelectorAll(".stage > .scene")].length, talking: !!document.querySelector(".help-btn.talking") })).catch(() => null as any);
const realTap = async (p: Page, sel: string) => {
  const el = p.locator(sel).first();
  if (!(await el.count())) return false;
  const bb = await el.boundingBox();
  if (!bb) return false;
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
  return true;
};

// ---- (A) Home landings: play a little (the bot), then a real tap on Home
const HOMES: { name: string; url: string; save: object; playMs: number; expect: string }[] = [
  { name: "film", url: "/play/?scene=intro", save: { ...FRESH, seenIntro: false, hero: null }, playMs: 6000, expect: "title" },
  { name: "choose", url: "/play/?scene=choose", save: FRESH, playMs: 3000, expect: "title" },
  { name: "optin", url: "/play/?scene=optin", save: save({ seenPlacement: false, seenTraining: false, stars: {} }), playMs: 3000, expect: "title" },
  { name: "training", url: "/play/?scene=training", save: save({ seenTraining: false }), playMs: 2000, expect: "title" },
  { name: "reward", url: "/play/?scene=reward&id=w2-1&stars=3", save: save(), playMs: 3000, expect: "map" },
  { name: "reward1", url: "/play/?scene=reward&id=w1-wu1&stars=1", save: save(), playMs: 3000, expect: "?" },
  { name: "trip", url: "/play/?scene=tree&visit=world:3", save: save(FLOWER), playMs: 3000, expect: "map" },
  { name: "trial", url: "/play/?trial=ai>ae", save: save(FLOWER), playMs: 12000, expect: "tree" },
  { name: "book", url: "/play/?scene=book", save: save(), playMs: 2000, expect: "map" },
  { name: "placement", url: "/play/?scene=placement", save: save({ seenPlacement: false }), playMs: 5000, expect: "map" },
  { name: "finale", url: "/play/?scene=finale", save: save(), playMs: 4000, expect: "map" },
  { name: "story", url: "/play/?level=w1-14", save: save(), playMs: 8000, expect: "map" },
  { name: "w2-1", url: "/play/?level=w2-1", save: save(), playMs: 8000, expect: "map" },
  { name: "tree", url: "/play/?scene=tree", save: save(FLOWER), playMs: 2000, expect: "map" },
  { name: "profiles", url: "/play/?scene=profiles", save: save(), playMs: 1500, expect: "title" },
  { name: "grownups", url: "/play/?scene=grownups", save: save(), playMs: 1500, expect: "map" },
];

// ---- (B) idle turns: get to the turn, then idle 30 s of game time
async function idle(page: Page, name: string, gameMs = 30000) {
  const a = await st(page);
  const k0 = JSON.stringify([a?.route, a?.st?.scene, a?.st?.next, a?.st?.selected ?? null, a?.st?.picked ?? null, a?.st?.screen ?? null, a?.st?.beat ?? null]);
  const n0 = await page.evaluate(() => (window as any).__audioLog.length);
  await page.screenshot({ path: `${OUT}/idle-${name}-0.png` });
  const t = Date.now();
  let moved = "";
  let shot16 = false;
  while (Date.now() - t < G(gameMs)) {
    await page.waitForTimeout(250);
    if (!shot16 && Date.now() - t > G(17000)) (shot16 = true), await page.screenshot({ path: `${OUT}/idle-${name}-17s.png` });
    const b = await st(page);
    const k = JSON.stringify([b?.route, b?.st?.scene, b?.st?.next, b?.st?.selected ?? null, b?.st?.picked ?? null, b?.st?.screen ?? null, b?.st?.beat ?? null]);
    if (k !== k0) { moved = k; break; }
  }
  const said = (await page.evaluate((n) => (window as any).__audioLog.slice(n).map((x: any) => x.url.split("/").pop()), n0)).join(", ");
  await page.screenshot({ path: `${OUT}/idle-${name}-end.png` });
  const line = `IDLE ${name}: ${moved ? `MOVED ${k0} -> ${moved}` : "held"} ; said: ${said}`;
  out.push(line);
  if (moved) bad.push(line);
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
await Promise.all([
  (async () => {
    for (const h of HOMES) {
      const { ctx, page } = await open(b, h.url, h.save);
      const t = Date.now();
      while (Date.now() - t < G(h.playMs)) {
        await botStep(page).catch(() => {});
        await page.waitForTimeout(G(700));
      }
      const before = await st(page);
      await page.screenshot({ path: `${OUT}/home-${h.name}-before.png` });
      const ok = await realTap(page, '[data-nav="home"]');
      await page.waitForTimeout(G(3000));
      const after = await st(page);
      await page.screenshot({ path: `${OUT}/home-${h.name}-after.png` });
      const talking = after?.talking;
      const line = `HOME ${h.name}: from ${before?.route} (${before?.st?.scene}) -> ${after?.route} (${after?.st?.scene}), scenes=${after?.scenes}, talking=${talking}${ok ? "" : " [NO HOME BUTTON]"} expect ${h.expect}`;
      out.push(line);
      if (!ok || (h.expect !== "?" && !String(after?.route).startsWith(h.expect)) || after?.scenes !== 1) bad.push(line);
      // the trip: is it still due? (the map's World Flower button pulses)
      if (h.name === "trip" || h.name === "reward") {
        const due = await page.evaluate(() => { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return s.tripDue ?? null; }).catch(() => "err");
        out.push(`  tripDue after Home: ${JSON.stringify(due)}`);
      }
      await ctx.close();
    }
  })(),
  (async () => {
    // opt-in screen A: nothing selected
    {
      const { ctx, page } = await open(b, "/play/?scene=optin", save({ seenPlacement: false, seenTraining: false, stars: {} }));
      await page.waitForTimeout(G(6000));
      await idle(page, "optin-A", 32000);
      await ctx.close();
    }
    // choose: nothing picked
    {
      const { ctx, page } = await open(b, "/play/?scene=choose", FRESH);
      await page.waitForTimeout(G(4000));
      await idle(page, "choose", 25000);
      await ctx.close();
    }
    // training: the speaker step
    {
      const { ctx, page } = await open(b, "/play/?scene=training", save({ seenTraining: false }));
      for (let k = 0; k < 40; k++) {
        const s = await st(page);
        if (s?.st?.scene === "tut-speaker") break;
        await botStep(page).catch(() => {});
        await page.waitForTimeout(G(900));
      }
      await page.waitForTimeout(G(4000));
      await idle(page, "training-speaker", 32000);
      await ctx.close();
    }
    // W1: the first turn, and the tap-all turn
    {
      const { ctx, page } = await open(b, "/play/?level=w1-wu1", save());
      for (let k = 0; k < 60; k++) {
        const s = await st(page);
        if (s?.st?.next && !s.st.busy && s.st.asked) break;
        await page.waitForTimeout(G(500));
      }
      await idle(page, "w1-first-turn", 32000);
      await ctx.close();
    }
    // Reward 1: the sticker turn, then (after the tap) the last step holds
    {
      const { ctx, page } = await open(b, "/play/?scene=reward&id=w1-wu1&stars=1", save({ stickers: [] }));
      for (let k = 0; k < 80; k++) {
        const s = await st(page);
        if (s?.st?.scene === "stickers" && s.st.next && !s.st.busy) break;
        await page.waitForTimeout(G(500));
      }
      await idle(page, "reward1-sticker-turn", 30000);
      await botStep(page).catch(() => {}); // tap the sticker
      for (let k = 0; k < 80; k++) {
        const s = await st(page);
        if (s?.nav?.next === "ready") break;
        await page.waitForTimeout(G(500));
      }
      const s = await st(page);
      out.push(`REWARD1 last step: nav=${JSON.stringify(s?.nav)} st=${JSON.stringify(s?.st)}`);
      await page.screenshot({ path: `${OUT}/reward1-last-held.png` });
      await idle(page, "reward1-last-step", 22000);
      await ctx.close();
    }
    // Reward 2 (w1-wu2): Home on its steps
    {
      const { ctx, page } = await open(b, "/play/?scene=reward&id=w1-wu2&stars=1", save({ stickers: ["sun", "sock", "cat", "sausage", "moon"] }));
      await page.waitForTimeout(G(8000));
      const s = await st(page);
      out.push(`REWARD2 at 8s: route=${s?.route} nav=${JSON.stringify(s?.nav)}`);
      await page.screenshot({ path: `${OUT}/reward2-8s.png` });
      await ctx.close();
    }
  })(),
]);
await b.close();
writeFileSync(`${OUT}/result.txt`, out.join("\n") + "\n\nBAD:\n" + bad.join("\n"));
console.log(out.join("\n"));
console.log("\nBAD:\n" + bad.join("\n"));
