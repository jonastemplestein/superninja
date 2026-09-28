// B4's named stills (FIX_PLAN §7 Acceptance (B), TV-B4.1) on a frozen build at 844×390: each is taken a set time after a
// given clip starts, with every animation paused there (as sound-shots.ts --freeze does), so the moment is exact.
// Usage: bun playtest/fix/B4/stills.ts --base http://127.0.0.1:4724 [--out playtest/fix/B4/frames]
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import { save } from "../../../scripts/treadmill/bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://127.0.0.1:4724")!;
const OUT = arg("out", "playtest/fix/B4/frames")!;
mkdirSync(OUT, { recursive: true });
const W1 = ["sun", "sock", "cat", "sausage", "moon"];
const W2 = ["fish", "dog", "flower", "sunflower", "star", "starfish"];
const lessons = ["w1-wu1", "w1-wu2"];

/** A still: `at` ms after the `nth` (from 0) clip whose id starts with `clip` (l/…, p/…, w/…, x/…). `tap`: then tap this
 *  (an aria-label) as a child would. */
type Still = { clip: string; nth?: number; at: number; name: string; tap?: string };
const CASES: { name: string; url: string; save: object; stills: Still[]; ms: number; tapFirst?: { at: number; label: string } }[] = [
  {
    name: "r1",
    url: "/play/?scene=reward&id=w1-wu1&stars=3&closing=tv_w1_end",
    save: save({ band: "W", schoolYear: "none", firstSession: { lessons, step: 0 }, seenBook: false, stickers: [], shiny: [], sessions: 1 }),
    ms: 45_000,
    stills: [
      { clip: "l/fm_rw_look", at: 2200, name: "reward1-fan" },
      { clip: "l/tv_rw_book", at: 2600, name: "reward1-book-wait", tap: "Sticker Book" },
      { clip: "l/tv_rw_every", at: 500, name: "reward1-every" },
      { clip: "l/tv_rw_tap", at: 3200, name: "reward1-tap-sticker", tap: "sticker sun" },
      { clip: "x/sun", at: 500, name: "reward1-slow-tortoise" },
      { clip: "l/tv_rw_fast_slow", at: 1500, name: "reward1-fast-slow" },
      { clip: "l/tv_rw_next", at: 1500, name: "reward1-next-said" },
      { clip: "l/tv_rw_next", at: 4600, name: "reward1-next" },
    ],
  },
  {
    name: "r2",
    url: "/play/?scene=reward&id=w1-wu2&stars=3&closing=fm_l2_done",
    save: save({ band: "W", schoolYear: "none", firstSession: { lessons, step: 1 }, seenBook: true, stickers: [...W1], shiny: [], petals: [], sessions: 1, stars: { "w1-wu1": 1 } }),
    ms: 60_000,
    stills: [
      { clip: "l/fm_rw2_s", at: 3500, name: "reward2-s-hop" },
      { clip: "p/s", nth: 0, at: 120, name: "reward2-step1-s-petal", tap: "Next" },
      { clip: "l/fm_rw2_petal", at: 4300, name: "reward2-lift-out" },
      { clip: "l/tv_rw2_flower", at: 1500, name: "reward2-flower-heart" },
      { clip: "l/tv_rw2_tap_petal", at: 2400, name: "reward2-petal-wait", tap: "your petal" },
      { clip: "p/s", nth: 1, at: 200, name: "reward2-hero" },
      { clip: "p/s", nth: 1, at: 1600, name: "reward2-hero-bloomed" },
    ],
  },
  {
    name: "short",
    url: "/play/?scene=reward&id=w1-wu3&stars=3&closing=fm_l3_done",
    save: save({ seenBook: true, stickers: [...W1, ...W2, "fishdog"], shiny: ["fishdog"], petals: ["s"], sessions: 3, stars: { "w1-wu1": 1, "w1-wu2": 1 } }),
    ms: 8000,
    stills: [{ clip: "l/fm_rw_more", at: 900, name: "reward-later-plus" }],
  },
  {
    name: "book",
    url: "/play/?scene=book",
    save: save({ seenBook: true, stickers: [...W1, ...W2, "fishdog", "am", "at", "mug", "bag"], shiny: ["fishdog"], words: { am: { n: 1, ok: 1, last: 0 }, at: { n: 1, ok: 1, last: 0 }, sun: { n: 1, ok: 1, last: 0 }, cat: { n: 1, ok: 1, last: 0 } } }),
    ms: 9000,
    tapFirst: { at: 2500, label: "sticker at" },
    stills: [
      { clip: "p/a", at: 120, name: "book-word-sticker-a-lit" },
      { clip: "w/at", at: 150, name: "book-word-sticker-word-lit" },
    ],
  },
  {
    name: "book-pics",
    url: "/play/?scene=book",
    save: save({ seenBook: true, stickers: [...W1, ...W2, "fishdog"], shiny: ["fishdog"], words: { sun: { n: 1, ok: 1, last: 0 } } }),
    ms: 9000,
    tapFirst: { at: 2500, label: "sticker cat" },
    stills: [
      { clip: "w/cat", at: 150, name: "book-picture-sticker-rabbit" },
      { clip: "x/cat", at: 500, name: "book-picture-sticker-tortoise" },
    ],
  },
];

const freezeShot = async (page: Page, file: string) => {
  // (only the running ones, and only those are resumed: play() on a finished animation would start it over)
  await page.evaluate(() => {
    const w = window as any;
    w.__frozen = document.getAnimations().filter((a) => a.playState === "running");
    for (const a of w.__frozen) a.pause();
    for (const svg of document.querySelectorAll("svg")) svg.pauseAnimations();
  });
  await page.waitForTimeout(60);
  await page.screenshot({ path: file });
  await page.evaluate(() => {
    const w = window as any;
    (w.__frozen ?? []).forEach((a: Animation) => a.playState === "paused" && a.play());
    w.__frozen = null;
    document.querySelectorAll("svg").forEach((svg) => svg.unpauseAnimations());
  });
};

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const c of CASES) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}/play/`);
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save as any), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
  await page.goto(`${BASE}${c.url}&fast=1`);
  await page.mouse.click(420, 4);
  const t0 = Date.now();
  const left = [...c.stills];
  const seen = new Map<string, number>();
  let k = 0;
  let tappedFirst = false;
  while (left.length && Date.now() - t0 < c.ms) {
    if (c.tapFirst && !tappedFirst && Date.now() - t0 > c.tapFirst.at) {
      tappedFirst = true;
      await page.locator(`[aria-label="${c.tapFirst.label}"]`).first().dispatchEvent("pointerdown").catch(() => {});
    }
    const log: any[] = await page.evaluate(() => (window as any).__audioLog ?? []);
    for (; k < log.length; k++) {
      const e = log[k];
      if (e.kind !== "speech") continue;
      const id = String(e.url).replace(/^.*\/a\//, "").replace(/\.mp3.*$/, "");
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      // (a later still for the same clip is found again below: stills are taken in order)
      for (const s of left.filter((s) => id.startsWith(s.clip) && (s.nth ?? 0) === n).sort((a, z) => a.at - z.at)) {
        const wait = s.at - (Date.now() - e.t);
        if (wait > 0) await page.waitForTimeout(wait);
        await freezeShot(page, `${OUT}/${s.name}.png`);
        console.log(`${c.name}: ${s.name} (${id} +${s.at} ms)`);
        left.splice(left.indexOf(s), 1);
        if (s.tap) {
          await page.waitForTimeout(s.tap === "Next" ? 1500 : 300);
          if (s.tap === "Next") {
            for (let i = 0; i < 40; i++) {
              if (await page.evaluate(() => (window as any).__snNav?.next === "ready")) break;
              await page.waitForTimeout(250);
            }
            await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown").catch(() => {});
          } else await page.locator(`[aria-label="${s.tap}"]`).first().dispatchEvent("pointerdown").catch(() => {});
        }
      }
    }
    await page.waitForTimeout(40);
  }
  if (left.length) console.log(`${c.name}: missed ${left.map((s) => s.name).join(", ")}`);
  await ctx.close();
}
await b.close();
