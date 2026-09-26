// Five clip recipes for the 26 Sep 2026 tweet ("10 changes since last night"), for the camera rig in
// scripts/tweet-clips.ts. Each recipe films the PREVIEW build (https://next.superninja.templestein.com, the build of
// commit 0b50f5f) with captions on, and says where to cut: `window(events)` finds the moment on the master's own
// timeline (the bot's play and the speech timings vary a little from run to run, so the cut follows the events, not
// fixed seconds).
//
//   bun assets-src/tweet/2026-09-26/clip-recipes.ts <name|all> [outDir] [--trim]
//
// Writes <outDir>/<name>.master.mp4 (+ .timeline.json, .sheet.jpg) and, with --trim, <outDir>/<name>.mp4 cut to the
// window (loudness-matched by the rig's trim()). One browser at a time: the rig queues recordings.
import type { Page } from "playwright";
import { record, trim, tweetSave, type Rig, type TimelineEvent } from "../../../scripts/tweet-clips";

/** A child part-way through Blossom Hills who has met ai and ay (scripts/record-clips.ts FLOWER_SAVE), with a few
 *  words found, so a petal's panel has words to show. */
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
  words: {
    rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 },
    sat: { n: 3, ok: 3, last: 1 }, sit: { n: 2, ok: 2, last: 1 }, mat: { n: 2, ok: 2, last: 1 }, am: { n: 2, ok: 2, last: 1 },
  },
};
/** Explanations a child has already heard in full (src/scenes/narrate.tsx ledger): skips Baron's motive and the 8 s
 *  "Look, a gem!" pause in the first battle, so the battle is all action. The first-streak line stays. */
const HEARD = { "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] } };

const first = (ev: TimelineEvent[], id: string, after = 0) => ev.find((e) => e.kind === "speech" && e.id === id && e.t >= after);
const nth = (ev: TimelineEvent[], id: string, n: number) => ev.filter((e) => e.kind === "speech" && e.id === id)[n - 1];

/** The end of "Look! Your new gem goes here, in its petal." (and before Sensei's next line starts). */
const afterHere = (ev: TimelineEvent[], game: { start: number }) => {
  const here = first(ev, "wf_new_gem_here");
  if (!here) return game.start + 11;
  const next = first(ev, "t_another_way", here.t);
  return Math.min(here.t + (here.dur ?? 3.2) + 0.5, next ? next.t - 0.08 : Infinity);
};

/** Swipe the World Flower's petal scroll with the mouse (it pans on a drag), `dx` px, over `ms`. */
async function swipe(page: Page, dx: number, ms = 450) {
  const box = await page.locator(".petal-scroll").boundingBox();
  if (!box) return;
  const y = box.y + box.height * 0.8, x0 = box.x + box.width / 2 - dx / 2;
  await page.mouse.move(x0, y);
  await page.mouse.down();
  const n = Math.max(8, Math.round(ms / 16));
  for (let i = 1; i <= n; i++) {
    // ease-out, like a finger flick
    const k = 1 - (1 - i / n) ** 2;
    await page.mouse.move(x0 + dx * k, y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}

export interface Recipe {
  name: string;
  feature: string;
  url: string;
  save: Record<string, unknown>;
  seconds: number;
  /** the rig's capture size; the World Flower scenes are heavy (glows, particles) and film smoothly only at 720p on a
   *  busy machine */
  size?: "1080p" | "720p";
  drive?: (page: Page, rig: Rig) => Promise<void>;
  /** [start, end] on the master's clock, from its events; `game` is when the game's picture started */
  window: (ev: TimelineEvent[], game: { start: number; end: number }) => [number, number];
  /** optional hand cut: several [start, end] pieces of the same master, joined with hard cuts */
  cuts?: (ev: TimelineEvent[], game: { start: number; end: number }) => [number, number][];
}

export const RECIPES: Recipe[] = [
  {
    // The ninja in a battle: kicks, spells and shurikens on every right answer, flames over its head for the streak,
    // "Wow! Super ninja streak!" at 6 and a rainbow "ninja master" at 10, then the monster is beaten.
    name: "battle-streak",
    feature: "The ninja on every level: moves, streak flames and glow (docs/HERO.md)",
    url: "/play/?level=w1-6",
    save: tweetSave({ narr: HEARD }),
    seconds: 62,
    drive: (_p, rig) => rig.bot({ every: 900 }),
    window: (ev) => {
      const six = first(ev, "streak_6"), win = first(ev, "battle_win");
      if (!six || !win) throw new Error("battle-streak: no streak_6 / battle_win (a miss broke the streak?): re-record");
      // the words come in a random order, so "super streak" (6) can come early: keep the clip to about 24 s, ending on
      // the reward's word cards
      const end = win.t + 4.5;
      return [Math.max(six.t - 5, end - 24), end];
    },
  },
  {
    // Winning a gem: the World Flower opens, the gem spins up and dives into its petal on the burst of the victory music,
    // the petal blooms, and Sensei explains the new spelling in Sounds~Write teacher language.
    name: "gem-victory",
    feature: "The World Flower's gem-mastered celebration with the victory music",
    url: "/play/?scene=tree&gem=ai%3Eae&celebrate=1",
    save: tweetSave(FLOWER),
    seconds: 33,
    size: "720p",
    drive: async (_p, rig) => rig.wait(33_000),
    // one take: the win, the dive and the bloom, and "Look! Your new gem goes here, in its petal." A hand-cut version
    // jumps from there to the homecoming (see `cuts`): the petal flies back into the big World Flower, which blooms.
    window: (ev, game) => [game.start + 0.1, afterHere(ev, game)],
    cuts: (ev, game) => {
      const ways = first(ev, "t_ways_2");
      const a: [number, number] = [game.start + 0.1, afterHere(ev, game)];
      // the homecoming starts once "Now you know two ways to spell... /ae/" is over
      const ae = ways ? first(ev, "sound:ae", ways.t) : undefined;
      const home = ae ? ae.t + (ae.dur ?? 0.7) + 0.15 : ways ? ways.t + 3.2 : game.start + 23.5;
      return [a, [home, Math.min(game.end, home + 6)]];
    },
  },
  {
    // The opening film from shot 3: Baron Muddle, lip-synced to his own voice ("Words, words, WORDS! How I HATE them!",
    // "I am Baron Muddle! Every sound on this island is MINE!"), blows the World Flower's petals away.
    name: "film-baron",
    feature: "The new World Flower opening film, with Baron Muddle lip-synced",
    url: "/play/?scene=intro",
    save: tweetSave({ seenIntro: false }),
    seconds: 27,
    size: "720p", // (the film itself is 1280×720)
    drive: async (_p, rig) => {
      // skip shots 1 and 2 (the arrow top right moves on to the next shot)
      await rig.wait(800);
      await rig.tap('[aria-label="Next"]');
      await rig.wait(600);
      await rig.tap('[aria-label="Next"]');
    },
    window: (ev) => {
      const f3 = first(ev, "film_3"), f6 = first(ev, "film_6");
      if (!f3) throw new Error("film-baron: film_3 never played");
      return [f3.t - 0.45, f6 ? f6.t - 0.25 : f3.t + 17.5];
    },
  },
  {
    // Warm-up 2, "Ninjas read this way!": Sensei shows ("Let me show you!"): fish... dog, and the two pictures merge into
    // a fish-dog; then the child taps them left to right and makes the fish-dog themselves.
    name: "fish-dog",
    feature: "Picture-reading warm-up (left to right, before letters) with Let me show you / Your turn",
    url: "/play/?level=w1-wu2",
    save: tweetSave({ schoolYear: "none", stickers: [], shiny: [], settings: { unlockAll: false } }),
    seconds: 30,
    drive: (_p, rig) => rig.bot({ every: 1100 }),
    window: (ev, game) => {
      const done = nth(ev, "fm_pair_fish_dog", 2);
      return [game.start + 0.2, done ? done.t + (done.dur ?? 1) + 1.2 : game.start + 23];
    },
  },
  {
    // The petal chart as a ninja scroll: it opens on /ae/ (one gem won, one glowing), then swipe past the sounds not met
    // yet (misty, with a "?") to met petals with the school chart's pictures in their corners, flick back, and open
    // /ae/: the train picture, its gems, "Different spellings of /ae/... but it's the same sound!", the words found with
    // it (rain, tail, day; tap to hear) and the green Practise gate. (/s/ was tried first: its chart picture, a plain
    // red disc, reads badly.)
    name: "petal-scroll",
    feature: "The scrollable petal chart: mysterious unmet petals, pictures, words found, Practise gate",
    url: "/play/?scene=tree",
    save: tweetSave(FLOWER),
    seconds: 27,
    size: "720p",
    drive: async (page, rig) => {
      await rig.wait(2200);
      rig.mark("chart");
      await rig.tap('[aria-label="Petal chart"]');
      await rig.wait(2000);
      for (const dx of [-760, -1000, -900]) {
        await swipe(page, dx);
        await rig.wait(1100);
      }
      await swipe(page, 3000, 600); // flick back to the start (/ae/)
      await rig.wait(1200);
      rig.mark("petal ae");
      await page.locator('.petal-scroll [aria-label="petal ae"]').first().click({ timeout: 2000 }).catch(() => rig.tap('.petal-scroll [aria-label="petal ae"]'));
      await rig.wait(10_000);
    },
    window: (ev, game) => {
      const at = ev.find((e) => e.kind === "mark" && e.id === "petal ae")?.t ?? game.start + 14;
      const day = first(ev, "word:day", at);
      return [game.start + 0.1, Math.min(game.end, day ? day.t + (day.dur ?? 0.6) + 1.2 : at + 8.5)];
    },
  },
];

if (import.meta.main) {
  const args = process.argv.slice(2);
  const which = args[0] ?? "all";
  const outDir = args.find((a, i) => i > 0 && !a.startsWith("--")) ?? "assets-src/tweet/2026-09-26/recipe-tests";
  const doTrim = args.includes("--trim");
  for (const r of RECIPES.filter((x) => which === "all" || x.name === which)) {
    const size = (process.env.TWEET_SIZE as Recipe["size"]) ?? r.size;
    const rec = await record({ name: r.name, url: r.url, save: r.save, seconds: r.seconds, drive: r.drive, outDir, size });
    let win: [number, number] | string;
    try {
      win = r.window(rec.events, rec.game).map((x) => Math.round(x * 100) / 100) as [number, number];
    } catch (e: any) {
      win = String(e?.message ?? e);
    }
    const said = rec.events.filter((e) => e.kind === "speech").map((e) => `${e.t.toFixed(1)} ${e.id}`).join(" | ");
    console.log(JSON.stringify({ name: r.name, master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, window: win }, null, 1));
    console.log("speech:", said);
    if (r.cuts) console.log("cuts:", JSON.stringify(r.cuts(rec.events, rec.game).map((c) => c.map((x) => Math.round(x * 100) / 100))));
    if (doTrim && Array.isArray(win)) {
      const out = `${outDir}/${r.name}.mp4`;
      const t = trim(rec.master, win[0], win[1], out);
      console.log("trimmed:", JSON.stringify(t));
    }
  }
}
