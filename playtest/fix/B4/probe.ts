// B4's probe (FIX_PLAN §7 B4, TV-B4.1): play one Sticker reward or the Sticker Book on a frozen build at 844×390, as a
// child would, and keep what was said (every clip with its sound job), the nav log, the __snState trail and a frame at
// every clip start (plus named stills). Not part of the treadmill: the evidence for playtest/fix/B4/.
//
// Usage: bun playtest/fix/B4/probe.ts --base http://127.0.0.1:4724 --case r1|r2|short|short3|book|book-first|school1
//        [--out playtest/runs/fix/B4/<case>] [--fast 1] [--mode child|bot|watch] [--ms 90000] [--shots]
//   --mode child  taps what __snState.next names as soon as it is published (default; a real child, even during a step)
//          bot    the treadmill bot (scripts/treadmill/bot.ts step()) only
//          watch  never taps the board (only Next), so the idle ladders and timeouts show
//   --shots       a frame at every clip start, and at +150/+300/+600 ms after each pure sound (the introduction)
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { save, step } from "../../../scripts/treadmill/bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://127.0.0.1:4724")!;
const CASE = arg("case", "r1")!;
const FAST = Number(arg("fast", "1"));
const MODE = arg("mode", "child")!;
const MS = Number(arg("ms", "90000"));
const SHOTS = process.argv.includes("--shots");
const OUT = arg("out", `playtest/runs/fix/B4/${CASE}-${MODE}`)!;
mkdirSync(`${OUT}/frames`, { recursive: true });

const W1 = ["sun", "sock", "cat", "sausage", "moon"];
const W2 = ["fish", "dog", "flower", "sunflower", "star", "starfish"];
const lessons = ["w1-wu1", "w1-wu2"];
const CASES: Record<string, { url: string; save: object }> = {
  r1: { url: "/play/?scene=reward&id=w1-wu1&stars=3&closing=tv_w1_end", save: save({ band: "W", schoolYear: "none", firstSession: { lessons, step: 0 }, seenBook: false, stickers: [], shiny: [], sessions: 1 }) },
  r2: { url: "/play/?scene=reward&id=w1-wu2&stars=3&closing=fm_l2_done", save: save({ band: "W", schoolYear: "none", firstSession: { lessons, step: 1 }, seenBook: true, stickers: [...W1], shiny: [], petals: [], sessions: 1, stars: { "w1-wu1": 1 } }) },
  // a later warm-up's reward (W3): the stickers fly into the book, "+N"
  short: { url: "/play/?scene=reward&id=w1-wu3&stars=3&closing=fm_l3_done", save: save({ seenBook: true, stickers: [...W1, ...W2, "fishdog"], shiny: ["fishdog"], petals: ["s"], sessions: 3, stars: { "w1-wu1": 1, "w1-wu2": 1 } }) },
  // Reward 1 on a school path (the next lesson is not W2): the end line is tv_next_game
  school1: { url: "/play/?scene=reward&id=w1-2&stars=3", save: save({ band: "R", schoolYear: "R", firstSession: { lessons: ["w1-2", "w1-3"], step: 0 }, seenBook: false, stickers: [], shiny: [], sessions: 1 }) },
  book: { url: "/play/?scene=book", save: save({ seenBook: true, stickers: [...W1, ...W2, "fishdog", "am", "at", "mug", "bag"], shiny: ["fishdog"], words: { am: { n: 1, ok: 1, last: 0 }, at: { n: 1, ok: 1, last: 0 }, sun: { n: 1, ok: 1, last: 0 }, cat: { n: 1, ok: 1, last: 0 } } }) },
  "book-first": { url: "/play/?scene=book", save: save({ seenBook: false, stickers: [...W1], shiny: [] }) },
};
const c = CASES[CASE];
if (!c) throw new Error(`no case ${CASE}`);

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page: Page = await ctx.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.addInitScript(() => {
  (window as any).__audioLog = [];
});
await page.goto(`${BASE}/play/`);
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save as any), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
await page.goto(`${BASE}${c.url}&fast=${FAST}`);
await page.mouse.click(420, 4);
const t0 = Date.now();
const states: any[] = [];
let seen = 0, n = 0, lastSig = "";
const shot = async (name: string) => {
  const f = `${String(n++).padStart(3, "0")}-${name.replace(/[^a-z0-9_:.-]/gi, "_")}.png`;
  await page.screenshot({ path: `${OUT}/frames/${f}` }).catch(() => {});
  return f;
};
const tapped: { t: number; what: string }[] = [];
while (Date.now() - t0 < MS) {
  const s = await page.evaluate(() => ({ st: (window as any).__snState ?? {}, nav: (window as any).__snNav ?? null, route: (window as any).__snRoute, log: ((window as any).__audioLog ?? []).length })).catch(() => null);
  if (!s) break;
  const sig = JSON.stringify([s.st, s.nav?.next, s.nav?.pres, s.route]);
  if (sig !== lastSig) {
    lastSig = sig;
    states.push({ t: Date.now() - t0, st: s.st, next: s.nav?.next, pres: s.nav?.pres, speed: s.nav?.speed, sound: s.nav?.sound, route: s.route });
  }
  if (s.log > seen) {
    const news: any[] = await page.evaluate((k) => (window as any).__audioLog.slice(k), seen);
    seen = s.log;
    for (const e of news) {
      if (e.kind !== "speech") continue;
      const id = String(e.url).replace(/^.*\/a\//, "").replace(/\.mp3.*$/, "");
      if (SHOTS) {
        await shot(id);
        if (id.startsWith("p/")) for (const d of [150, 300, 600]) (await page.waitForTimeout(d === 150 ? 150 : 150 * (d === 300 ? 1 : 2)), await shot(`${id}+${d}`));
      }
    }
  }
  if (typeof s.route === "string" && !s.route.startsWith("reward") && !s.route.startsWith("book") && Date.now() - t0 > 3000) {
    await shot(`left-${s.route}`);
    break;
  }
  const st = s.st;
  if (MODE === "child" && (st.scene === "stickers" || st.scene === "book") && st.next && !st.busy) {
    const el = page.locator(`[aria-label="${st.next}"]`).first();
    if (await el.count()) {
      await el.dispatchEvent("pointerdown").catch(() => {});
      tapped.push({ t: Date.now() - t0, what: st.next });
      await page.waitForTimeout(600);
      continue;
    }
  }
  if (MODE === "watch" && s.nav?.next === "ready" && !(await page.locator('button[aria-label="Play again"]').count())) {
    await page.waitForTimeout(1500);
    await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown").catch(() => {});
    tapped.push({ t: Date.now() - t0, what: "Next" });
    continue;
  }
  if (MODE !== "watch") {
    if (s.nav?.next === "ready" && (await page.locator('button[aria-label="Play again"]').count())) {
      // a replayable reward's last step: tap Next ourselves (the bot leaves "Play again" screens)
      await page.waitForTimeout(1200);
      await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown").catch(() => {});
      tapped.push({ t: Date.now() - t0, what: "Next (play-again screen)" });
    } else {
      const before = s.nav?.next;
      await step(page).catch(() => {});
      if (before === "ready") tapped.push({ t: Date.now() - t0, what: "bot step (Next)" });
    }
  }
  if (CASE.startsWith("book") && Date.now() - t0 > 4000 && !tapped.length) {
    const st2 = page.locator("button.sticker").first();
    await st2.dispatchEvent("pointerdown").catch(() => {});
    tapped.push({ t: Date.now() - t0, what: "a sticker" });
  }
  await page.waitForTimeout(150);
}
await shot("end");
const audio = await page.evaluate(() => (window as any).__audioLog ?? []).catch(() => []);
const navLog = await page.evaluate(() => (window as any).__snNavLog ?? []).catch(() => []);
const said = audio
  .filter((e: any) => e.kind === "speech")
  .map((e: any) => ({ t: ((e.t - (audio[0]?.t ?? e.t)) / 1000).toFixed(2), id: String(e.url).replace(/^.*\/a\//, "").replace(/\.mp3.*$/, ""), ...(e.show ? { show: e.show } : {}), ...(e.cued ? { cued: e.cued } : {}) }));
writeFileSync(`${OUT}/log.json`, JSON.stringify({ case: CASE, mode: MODE, fast: FAST, said, tapped, states, navLog, errors }, null, 1));
console.log(said.map((s: any) => `${s.t} ${s.id}${s.show ? ` [${s.show}]` : ""}`).join("\n"));
console.log(`taps: ${tapped.map((x) => `${(x.t / 1000).toFixed(1)} ${x.what}`).join(" · ")}`);
if (errors.length) console.log(`ERRORS:\n${errors.join("\n")}`);
await b.close();
