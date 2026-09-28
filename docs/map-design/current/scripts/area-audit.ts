// Share of the screen's tappable area per kind of target (844x390, DPR 3, touch), sampled every 2 CSS px.
import { chromium } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright";
import { writeFileSync } from "fs";
import { LEVELS } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/worlds";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/docs/map-design/current";
const b = await chromium.launch();
const res: any = {};
for (const next of ["w1-wu3", "w1-7", "w3-6"]) {
  const before = LEVELS.slice(0, LEVELS.findIndex((l) => l.id === next));
  const sv = { v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenStreak: true, schoolYear: "none", schoolYearAt: Date.now(), band: "pre", captionsV2: true, stars: Object.fromEntries(before.map((l) => [l.id, l.warmup ? 1 : 3])), read: {}, spell: {}, words: {}, petals: ["s"], energy: {}, gems: [], placed: [], flowerSeen: [], settings: { relaxed: false, music: 0, captions: false, unlockAll: false }, minutes: 60, sessions: 3, stickers: [], shiny: [], adjustLog: [] };
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript((sv) => {
    if (!sessionStorage.getItem("s")) { localStorage.clear(); localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id: "pa", name: "Ninja", hero: "kai", created: 1, last: 1 }], current: "pa" })); localStorage.setItem("superninja.save.pa", JSON.stringify(sv)); sessionStorage.setItem("s", "1"); }
    sessionStorage.setItem("sn.setup", "done");
  }, sv);
  await page.goto("https://superninja.templestein.com/play/?scene=map");
  await page.waitForSelector(".scene.map .map-next");
  await page.waitForTimeout(2500);
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { if (a.effect?.getTiming().iterations === Infinity) { a.pause(); a.currentTime = 0; } else a.finish(); } catch {} }));
  res[next] = await page.evaluate(() => {
    const cur = document.querySelector(".scene.map .map-next")!.getAttribute("aria-label");
    const who = (el: Element | null) => {
      const t = el?.closest("[data-tap-proxy], button, [aria-label], [data-nav]");
      if (!t) return "nothing";
      if (t.matches("[data-tap-proxy]")) return "next level (the ninja)";
      const l = t.getAttribute("aria-label") ?? "";
      if (l === cur) return "next level (the stone)";
      if (l.startsWith("level ")) return /grayscale/.test((t.querySelector("img") as HTMLElement | null)?.style.filter ?? "") ? "locked stone" : "finished stone (replays)";
      return l || t.getAttribute("data-nav") || "other";
    };
    const n: Record<string, number> = {};
    for (let y = 0; y < innerHeight; y += 2) for (let x = 0; x < innerWidth; x += 2) { const k = who(document.elementFromPoint(x + 1, y + 1)); n[k] = (n[k] ?? 0) + 4; }
    const tappable = Object.entries(n).filter(([k]) => k !== "nothing").reduce((a, [, v]) => a + v, 0);
    return Object.fromEntries(Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, { cssPx2: v, shareOfTappable: k === "nothing" ? null : +(v / tappable).toFixed(3) }]));
  });
  console.log(next, JSON.stringify(res[next]));
  await ctx.close();
}
writeFileSync(`${OUT}/measurements-area.json`, JSON.stringify(res, null, 1));
await b.close();
