// The demo inventory's cases: every game type's first meeting, on the level that plays it first (src/content/games.ts
// gamesOfLevel; the cheat menu's Teacher voice list lands on the same levels). The save is the treadmill bot's (a child
// in play: film, Choose, Training and placement done) with an empty narrative ledger, so every game, every
// once-per-save explanation and every "Watch me first!" is a first time. `turns`: stop this many answers after the
// start (plus `tail` ms), so the recording holds the demo, the hand-over and the child's first go or two.
export interface Case {
  name: string;
  title: string;
  url: string;
  /** games this recording holds the first meeting of (GameId) */
  games: string[];
  save?: Record<string, unknown>;
  /** the most it records, from the page load (s) */
  seconds: number;
  /** stop after this many answers (plus `tail`) */
  turns?: number;
  tail?: number;
  /** ms of quiet before the child answers (default 1500) */
  pause?: number;
  /** ms before the child taps a held Next (default 1200) */
  nextPause?: number;
  /** never answer (a show with no turn) */
  watchOnly?: boolean;
}

export const CASES: Case[] = [
  { name: "w1-wu1", title: "W1 Ninja Ears (preschool): Ninja Ears, the rabbit and the tortoise, the first sound, Pocket Hunt", url: "/play/?level=w1-wu1", games: ["tap", "fastslow", "notice", "tapall"], save: { band: "W", schoolYear: "none" }, seconds: 150 },
  { name: "w1-wu2", title: "W2 Ninjas Read This Way: Ninja Reading, the swap, two rows, Word Squish", url: "/play/?level=w1-wu2", games: ["rail", "which", "compound"], save: { band: "W", schoolYear: "none" }, seconds: 130 },
  { name: "w1-wu3", title: "W3 Ninja Ears again: Slow Words, a sound in the middle", url: "/play/?level=w1-wu3", games: ["slowpick", "tapall:in"], save: { band: "W", schoolYear: "none" }, seconds: 150 },
  { name: "w1-wu4", title: "W4 Ninjas Read This Way: three in a row", url: "/play/?level=w1-wu4", games: ["rail"], save: { band: "W", schoolYear: "none" }, seconds: 50, turns: 3 },
  { name: "w1-wu5", title: "W5 Guess My Word (sounds to words)", url: "/play/?level=w1-wu5", games: ["sounds"], save: { band: "W", schoolYear: "none" }, seconds: 60, turns: 2 },
  { name: "w1-wu6", title: "W6 Sound Dots", url: "/play/?level=w1-wu6", games: ["dots"], save: { band: "W", schoolYear: "none" }, seconds: 60, turns: 3 },
  { name: "w1-2", title: "w1-2 First Sounds (I do for /m/ and /s/) and Ninja Eyes", url: "/play/?level=w1-2", games: ["firstsound", "find"], seconds: 170 },
  { name: "w1-4", title: "w1-4 Word Building (Watch me first) and Kai and Suki", url: "/play/?level=w1-4", games: ["build", "readcheck"], seconds: 150 },
  { name: "w1-6", title: "w1-6 the first Monster Battle", url: "/play/?level=w1-6", games: ["battle"], seconds: 50, turns: 3 },
  { name: "w1-7", title: "w1-7 Sound Hunt (a sound in the middle)", url: "/play/?level=w1-7", games: ["soundhunt"], seconds: 70, turns: 2 },
  { name: "w1-8", title: "w1-8 Sound Swap", url: "/play/?level=w1-8", games: ["swap"], seconds: 50, turns: 3 },
  { name: "w1-9", title: "w1-9 Ninja Run", url: "/play/?level=w1-9", games: ["run"], seconds: 40, turns: 2 },
  { name: "w1-14", title: "w1-14 Story Time", url: "/play/?level=w1-14", games: ["story"], seconds: 50, turns: 3 },
  { name: "w1-15", title: "w1-15 the first boss", url: "/play/?level=w1-15", games: ["boss"], seconds: 40, turns: 2 },
  { name: "w2-1", title: "w2-1 the first Dojo lesson: New Sounds", url: "/play/?level=w2-1", games: ["learn", "find", "build"], seconds: 60, turns: 3 },
  { name: "w6-br1", title: "w6-br1 Sorting (the Bridging Unit)", url: "/play/?level=w6-br1", games: ["sort"], save: { schoolYear: "Y1" }, seconds: 50, turns: 2 },
  { name: "trial", title: "a Gem Trial (a gem battle), the first one", url: "/play/?trial=a%3Ea", games: ["trial"], save: { petals: ["a", "t", "m", "s", "i", "n", "p"], energy: { "a>a": 8 }, words: { at: { n: 2, ok: 2, last: 1 }, am: { n: 2, ok: 2, last: 1 }, mat: { n: 2, ok: 2, last: 1 }, sat: { n: 2, ok: 2, last: 1 }, tap: { n: 2, ok: 2, last: 1 }, map: { n: 2, ok: 2, last: 1 } } }, seconds: 40, turns: 2 },
  { name: "review", title: "Sensei's Challenge (a review battle)", url: "/play/?level=review", games: ["review"], save: { stars: { "w1-wu1": 1, "w1-wu2": 1, "w1-wu3": 1, "w1-wu4": 1, "w1-wu5": 1, "w1-wu6": 1, "w1-2": 3, "w1-3": 3, "w1-4": 3, "w1-5": 3, "w1-6": 3 }, petals: ["a", "t", "m", "s", "i"] }, seconds: 40, turns: 2 },
];
