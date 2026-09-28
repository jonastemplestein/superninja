// Record gameplay clips for the landing page: the bot (scripts/treadmill/bot.ts, which knows every scene and taps the
// green Next arrow at a held step) plays each scene, and the camera rig in scripts/tweet-clips.ts films it: a CDP
// screencast rebuilt to a steady 30 fps, with the game's real soundtrack (the base's own sound files and sfx, at the
// times they played, speech cut where the game cut it, lined up with the picture).
// Usage: bun scripts/record-clips.ts [base-url] [clip...] [--recut] [--gpu]   (default base: http://localhost:5173; no names:
// every clip; --recut: cut the clip again from its last master, e.g. after changing its window, without filming;
// --gpu: render on the GPU, when a busy machine makes SwiftShader stutter)
//   bun scripts/record-clips.ts https://superninja.templestein.com battle run dojo swap story boss map flower trial
// Output: public/media/clips/<name>.mp4 + <name>.jpg (poster): 1280×720 H.264 High, yuv420p, faststart, 30 fps.
// Trailer footage (tr_*) is 1920×1080 in assets-src/trailer/clips/. The masters, their timelines (what was said and
// tapped when, which sound files) and contact sheets stay in assets-src/clips-raw/.
// Each clip is filmed in its own bun process (under bun, a second browser in one process can hang). Nothing is
// deleted: a file that is replaced goes to .trash/.
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { contactSheet, record, trim, tweetSave, type RecordResult, type Rig } from "./tweet-clips";
import { step } from "./treadmill/bot";
import { LEVELS } from "../src/content/worlds";

const args = process.argv.slice(2);
const BASE = args[0]?.startsWith("http") ? args[0].replace(/\/$/, "") : "http://localhost:5173";
const oneAt = args.indexOf("--one");
const recut = args.includes("--recut");
// --gpu: draw on the GPU (ANGLE Metal) instead of SwiftShader, for a busy machine (see tweet-clips.ts)
const gpu = args.includes("--gpu");
const only = args.filter((a, i) => !a.startsWith("http") && !a.startsWith("--") && i !== oneAt + 1);
const OUT = "public/media/clips";
const TRAILER = "assets-src/trailer/clips"; // trailer footage stays out of public/
const RAW = "assets-src/clips-raw";

/** The filming save: the bot's (every level open, the first-time explanations seen), captions off as before (the page
 *  plays the clips small and muted), and the first-streak explanation already heard (it would fill a battle clip). */
const clipSave = (extra: Record<string, any> = {}) => tweetSave({ seenStreak: true, ...extra, settings: { captions: false, ...(extra.settings ?? {}) } });
/** A child coming back to the game who has played every level before `id`, as the old clips showed it: each game
 *  already introduced (the game migrates a save with stars to the games' short openings), and the once-per-save
 *  explanations of the first land (the Baron's motive, the dojo's welcome, the first gem, the first Ready hold...) heard. */
const returning = (id: string, extra: Record<string, any> = {}) => {
  const before = LEVELS.slice(0, LEVELS.findIndex((l) => l.id === id));
  const heard = ["gem-energy", "gem-battle", "ready:first", "ready:paw", "story:choice", "baron-motive", "dojo:welcome", "dojo:first", "made-of-sounds", "left-right:build", "hear-see:w1", "place:middle", "place:last"];
  return clipSave({ stars: Object.fromEntries(before.map((l) => [l.id, 3])), narr: Object.fromEntries(heard.map((k) => [k, { n: 1, at: [0], s: [0] }])), ...extra });
};
const level = (id: string) => ({ url: `/play/?level=${id}`, save: returning(id) });

interface Clip {
  name: string;
  url: string;
  save?: Record<string, unknown>;
  /** the clip's length, and how far into the game (after the page has loaded) it starts */
  seconds: number;
  skip?: number;
  /** now and then a deliberately wrong tile in a battle, so the correction shows */
  mistakes?: boolean;
  /** plays the moment (default: the bot plays) */
  drive?: (page: Page, rig: Rig) => Promise<void>;
  /** start the clip `lead` seconds before the first event of this kind (and id) on the master's timeline (a speech
   *  line, a tap: see <name>.timeline.json), instead of `skip` seconds into the game; if there is none, `skip` */
  from?: { kind: string; id?: RegExp; lead: number };
  /** how long to film from the page starting to load (default: 3 + skip + seconds + 1) */
  film?: number;
  /** seconds into the clip for the poster (default min(3, seconds / 2)) */
  poster?: number;
}

/** A child part-way through Blossom Hills who has met ai and ay: a flower with some petals home, gems charging and
 *  one ready, and words found (the World Flower clips). */
const FLOWER_SAVE = clipSave({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});
/** Swipe the World Flower's petal scroll sideways with the mouse (the scroll pans on a mouse drag), `dx` in pixels. */
async function swipeScroll(page: Page, dx: number) {
  const box = await page.locator(".petal-scroll").boundingBox();
  if (!box) return;
  const y = box.y + box.height * 0.85, x0 = box.x + box.width / 2 - dx / 2;
  await page.mouse.move(x0, y);
  await page.mouse.down();
  for (let i = 1; i <= 24; i++) {
    await page.mouse.move(x0 + (dx * i) / 24, y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}
const bot = (mistakes = false) => (_: Page, rig: Rig) => rig.bot({ mistakes: mistakes ? 0.18 : 0 });
/** The Ninja Run as a child plays it: listen to Sensei's sounds first, then (a moment later) tap the right lantern.
 *  (The bot's shortcut flies at it as soon as it is on screen, and the run then holds the ninja in mid-air while the
 *  sounds are said.) Anything else on screen (a Ready hold, the green arrow) is the bot's. */
async function runDrive(page: Page, rig: Rig) {
  let heardAt = 0;
  while (rig.live()) {
    const s = await page
      .evaluate(() => {
        const w = window as any;
        if (w.__snState?.scene !== "run" || !w.__runLanterns) return null;
        const r = w.__runLanterns();
        return { cueDone: !!r.cueDone, ready: r.lanterns.some((l: any) => l.correct && !l.popped && l.x < 1280 - 150) };
      })
      .catch(() => null);
    if (!s) await step(page).catch(() => {});
    else if (!s.cueDone || !s.ready) heardAt = 0;
    else if (!heardAt) heardAt = Date.now();
    else if (Date.now() - heardAt > 350 + Math.random() * 300) {
      await page.evaluate(() => (window as any).__snRun?.()).catch(() => {});
      heardAt = 0;
    }
    await rig.wait(200);
  }
}

// Levels as the game has them since the Sounds~Write order (27 Sep): unit 1 is a m s t i, unit 2 n o p, unit 3 b c g h.
const CLIPS: Clip[] = [
  // Bamboo Village, the bamboo bandit, unit 2 words (nap, pot...)
  { name: "battle", ...level("w1-13"), seconds: 16, from: { kind: "speech", id: /^battle_spell$/, lead: 0 }, film: 30, mistakes: true },
  // a run with unit 2 and 3 words (the pure /b/ and /k/), from the first word's sounds: two catches and the running between
  { name: "run", ...level("w2-3"), seconds: 16, skip: 3, from: { kind: "speech", id: /^sound:/, lead: 0.4 }, film: 27, drive: runDrive, poster: 2.7 },
  // the dojo teaching b c g h: hear the sound, see how it is written, tap it and say it (/b/, then /k/)
  { name: "dojo", ...level("w2-1"), seconds: 15, skip: 1, from: { kind: "speech", id: /^listen$/, lead: 0 }, film: 28, poster: 4.5 },
  // from the first tap: one word changed, Sensei setting up the next, and the next changed
  { name: "swap", ...level("w1-12"), seconds: 15, skip: 4, from: { kind: "tap", lead: 0.5 }, film: 34 },
  // the first story: the end of a page Sensei reads, then the child's pages (Map! Tap it!...), a few seconds on each
  { name: "story", ...level("w1-14"), seconds: 14, skip: 3, from: { kind: "speech", id: /^story_your_turn$/, lead: 2.5 }, film: 34, drive: (_, rig) => rig.bot({ every: 3200 }) },
  // the oni, Blossom Hills' boss, from its first word (the Baron's taunt before it is long)
  { name: "boss", ...level("w2-8"), seconds: 16, skip: 5, from: { kind: "speech", id: /^word:/, lead: 1 }, film: 34, poster: 4.4 },
  {
    name: "map", url: "/play/?scene=map", seconds: 7, skip: 1, from: { kind: "speech", id: /^map_hint$/, lead: 0 },
    save: clipSave({ hero: "suki", stars: { "w1-wu1": 1, "w1-wu2": 1, "w1-wu3": 1, "w1-wu4": 1, "w1-wu5": 1, "w1-wu6": 1, "w1-2": 2, "w1-3": 3 }, settings: { unlockAll: false } }),
  },
  {
    // the World Flower, then the petal chart as a ninja scroll (swiped both ways), then one petal up close with Sensei
    name: "flower", url: "/play/?scene=tree", seconds: 13, skip: 0, from: { kind: "tap", id: /^Petal chart$/, lead: 2 }, film: 24, poster: 0.5,
    save: FLOWER_SAVE,
    drive: async (page) => {
      await page.waitForTimeout(3000);
      await page.locator('[aria-label="Petal chart"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(1500);
      await swipeScroll(page, -760);
      await page.waitForTimeout(700);
      await swipeScroll(page, -520);
      await page.waitForTimeout(700);
      await swipeScroll(page, 1280);
      await page.waitForTimeout(900);
      await page.locator('.petal-scroll [aria-label="petal ae"]').click();
      await page.waitForTimeout(8000);
    },
  },
  // a gem won: the victory music, the gem flying into its petal, the bloom, and Sensei's explanation (not on the page)
  { name: "victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", seconds: 21, skip: 0, save: FLOWER_SAVE },
  {
    name: "trial", url: "/play/?scene=tree", seconds: 16, skip: 1, film: 22,
    save: clipSave({ petals: ["a", "i", "m", "s", "t", "n", "o", "p"], stars: { "w1-wu1": 1, "w1-wu2": 1, "w1-wu3": 1, "w1-wu4": 1, "w1-wu5": 1, "w1-wu6": 1, "w1-2": 3, "w1-3": 3 }, energy: { "m>m": 8 } }),
    drive: async (page, rig) => {
      await page.waitForTimeout(1200);
      await page.locator('[aria-label="petal m"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(900);
      await page.locator('[aria-label="gem m ready"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(3500);
      await rig.bot({ every: 700 });
    },
  },
  // --- Trailer footage (trailer/trailer.config.ts). Not used on the landing page; `bun scripts/record-clips.ts tr_boss_magpie` etc. (tr_boss_baron.mp4, the old w6-11, is what trailer.config.ts still cuts from: MARKETING_PLAN §4.1)
  { name: "tr_boss_panda", url: "/play/?level=w1-15", seconds: 16, skip: 1 },
  { name: "tr_boss_yeti", url: "/play/?level=w3-12", seconds: 16, skip: 1 },
  { name: "tr_boss_serpent", url: "/play/?level=w4-9", seconds: 16, skip: 1 },
  { name: "tr_boss_knight", url: "/play/?level=w5-11", seconds: 16, skip: 1 },
  { name: "tr_boss_magpie", url: "/play/?level=w6-11", seconds: 70, skip: 1 },
  { name: "tr_run_mountain", url: "/play/?level=w3-5", seconds: 12, skip: 3 },
  { name: "tr_run_sky", url: "/play/?level=w6-9", seconds: 12, skip: 3 },
  { name: "tr_battle_castle", url: "/play/?level=w5-9", seconds: 14, skip: 3 },
  {
    name: "tr_flower_full", url: "/play/?scene=tree", seconds: 14, skip: 1,
    save: clipSave({
      petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "j", "w", "z", "x", "y", "sh", "ch", "th"],
      gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "o>o", "b>b", "g>g", "h>h", "d>d", "e>e", "f>f"],
      energy: { "c>k": 8, "u>u": 6, "r>r": 7, "l>l": 5, "sh>sh": 4, "k>k": 3, "v>v": 8 },
    }),
    drive: async (page) => {
      await page.waitForTimeout(3000);
      await page.locator('[aria-label="petal c"]').dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(4000);
      await page.locator('[aria-label="close"]').dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(800);
      await page.locator('[aria-label="petal v"]').dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(4000);
    },
  },
];
// 1080p trailer copies of the landing-page clips (same bot scripts, trailer output dir)
for (const n of ["battle", "run", "dojo", "swap", "story", "boss", "flower", "trial", "victory"]) {
  const c = CLIPS.find((x) => x.name === n)!;
  CLIPS.push({ ...c, name: `tr_${n}` });
}

/** Film one clip (in this process) and cut it. */
async function film(clip: Clip) {
  const tr = clip.name.startsWith("tr_");
  const skip = clip.skip ?? 0;
  mkdirSync(RAW, { recursive: true });
  // --recut: cut again from the last master (a new window or encoding) without filming again
  const tl = `${RAW}/${clip.name}.timeline.json`;
  const rec: Pick<RecordResult, "master" | "game" | "events" | "timeline" | "frames" | "sync" | "advice"> = recut && existsSync(tl)
    ? { ...JSON.parse(readFileSync(tl, "utf8")), master: `${RAW}/${clip.name}.master.mp4`, timeline: tl }
    : await record({
        name: clip.name, url: clip.url, base: BASE, outDir: RAW, save: clip.save ?? clipSave(),
        // (from the page starting to load: the head clapper takes about 2 s, then the game, then a spare second)
        seconds: clip.film ?? 3 + skip + clip.seconds + 1,
        size: tr ? "1080p" : "720p",
        drive: clip.drive ?? bot(clip.mistakes),
        gpu,
      });
  const out = `${tr ? TRAILER : OUT}/${clip.name}.mp4`;
  mkdirSync(tr ? TRAILER : OUT, { recursive: true });
  let start = rec.game.start + skip;
  if (clip.from) {
    const f = clip.from;
    const e = rec.events.find((e) => e.kind === f.kind && (!f.id || f.id.test(e.id)) && e.t >= rec.game.start);
    if (e) start = Math.max(rec.game.start, e.t - f.lead);
    else console.warn(`[record-clips] ${clip.name}: no ${f.kind} ${f.id ?? ""} on the timeline; starting ${skip} s into the game`);
  }
  start = Math.max(rec.game.start, Math.min(start, rec.game.end - clip.seconds));
  const cut = trim(rec.master, start, start + clip.seconds, out, { posterAt: clip.poster ?? Math.min(3, clip.seconds / 2), crf: tr ? 18 : 27, lufs: -18 });
  const sheet = contactSheet(out, 1, `${RAW}/${clip.name}.clip.sheet.jpg`);
  // what is said and tapped in the clip, on the clip's own clock (for checking its soundtrack)
  const end = start + clip.seconds;
  const inClip = rec.events.filter((e) => e.t < end && e.t + (e.dur ?? 0) > start && !["slate", "mark"].includes(e.kind));
  writeFileSync(`${RAW}/${clip.name}.clip.json`, JSON.stringify({ clip: out, master: rec.master, window: [start, end], events: inClip.map((e) => ({ ...e, t: Math.round((e.t - start) * 1000) / 1000 })) }, null, 1));
  console.log(JSON.stringify({ clip: clip.name, out, poster: cut.poster, ...cut.spec, seconds: cut.duration, warnings: cut.warnings, fps: rec.frames?.fps, sync: rec.sync.residualMedianMs, advice: rec.advice, timeline: rec.timeline, sheet }));
}

if (oneAt >= 0) {
  const clip = CLIPS.find((c) => c.name === args[oneAt + 1]);
  if (!clip) throw new Error(`no clip ${args[oneAt + 1]}`);
  await film(clip);
  process.exit(0); // (a browser that never finished closing would keep bun alive)
}
let failed = 0;
for (const clip of CLIPS.filter((c) => !only.length || only.includes(c.name))) {
  const r = spawnSync(process.execPath, [process.argv[1], BASE, "--one", clip.name, ...(recut ? ["--recut"] : []), ...(gpu ? ["--gpu"] : [])], { stdio: "inherit" });
  if (r.status === 0) console.log("✓", clip.name);
  else (failed++, console.error("✗", clip.name));
}
process.exit(failed ? 1 : 0);
