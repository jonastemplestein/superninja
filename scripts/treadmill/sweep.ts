// Treadmill stage 1: bots sweep every level and scene at fast-forward on a phone-landscape viewport.
// Each case: a "perfect child" bot plays it to the end (or a monkey taps at random), while in-page invariant checks
// look for things a child would trip over. Output: <runDir>/sweep.json (Finding[] + per-case stats) and
// <runDir>/cases/<case>/{meta.json, f_*.png} filmstrips for the visual critic.
// Usage: bun scripts/treadmill/sweep.ts [--run dir] [--only w1-4,map] [--base http://localhost:5173] [--fast 3] [--par 6] [--monkey] [--nav] [--no-petals]
// --nav (slower): in each new waiting position the bot first taps Hear it again (and Show me again, where there is one)
// and checks what it plays (docs/NAVIGATION.md §6.2: replay-silent, replay-stale, show-again-broken).
// The petal invariants are on by default since integration (FIX_PLAN I.2; --no-petals turns them off, and --petals is still
// accepted): the sound display invariants (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §4.4 F4.2). The first three are blockers in
// the first-session cases (FIRST_SESSION) and majors elsewhere: sound-without-petal (a "petal" sound clip starts and no petal of that sound is visible,
// with 50 ms grace; < x > needs /k/ and /s/), petal-for-hidden (a "hidden" sound's petal is visible while it plays),
// petal-giveaway (a visible answer card is the picture of a visible petal: the apple card beside /a/), petal-too-small
// (the picture of a visible non-mini badge under 38 CSS px on the 844×390 phone, at rest: a small reading is taken again
// once its pop-in has finished), petal-overflow (a petal runs past its panel, a clipping ancestor or the stage, at rest)
// and petal-covered (something painted lies over its picture, at rest), both major, and sound-unclassified (a lone sound
// with no job, §3.1). With them, F4.2's perf invariants, all minor, from a once-a-second sample in the page (counted as
// soak.ts counts them): anim-main-thread (more than 2 endless animations the compositor can't run at once, named: a
// property like z-index or box-shadow, or an SVG target), anim-hidden (more than 2 endless animations running on hidden
// elements, named; an opacity that is an animation's own, a fade in progress, isn't hidden), each in 2 or more samples,
// and raf-at-rest (a screen's median rAF requests a second above 5 once nothing has been said, tapped or changed for 2 s).
// See perf-probe.ts.
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../../src/content/worlds";
import { warmupScript } from "../../src/content/warmups";
import { save, step, FLOWER_SAVE, unlockAudio } from "./bot";
import type { CaseMeta, Finding } from "./types";
import { perfIssues, perfSampler, type PerfSample } from "./perf-probe";
// (the lines Hear it again replays: an instruction that is not an aside, a Help clue or a fast/slow idea line, exactly
// the register the game keeps in nav.tsx; integration, 27 Sep, after D6's tv_fs_two_ways)
import { isRegisterable as isInstruction } from "../../src/content/instructions";
import { LINES } from "../../src/content/lines";
import { helpGuard } from "../lib/help";
// the model's year1 child (SCROLL_DESIGN §8.1, playtest/runs/flower-v2/saves/export.ts), for tree-fork
import KIDS from "../../src/ui/flower-children.fixture.json";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "3"));
const PAR = Number(arg("par", "6"));
const MONKEY = process.argv.includes("--monkey");
const NAV = process.argv.includes("--nav");
/** the petal and perf invariants: on unless --no-petals (the default since integration, FIX_PLAN I.2) */
const PETALS = !process.argv.includes("--no-petals");
/** --petals: each sound's petal picture word (src/content/flower.ts CHART_PETALS), for petal-giveaway */
/** --petals: clip lengths (ms at 1×), so the perf sampler knows when a clip is still being said */
const DURS: Record<string, number> = PETALS ? JSON.parse(readFileSync(new URL("../../public/a/durations.json", import.meta.url), "utf8")) : {};
const ICON: Record<string, string> = PETALS ? Object.fromEntries((await import("../../src/content/flower")).CHART_PETALS.map((c) => [c.p, c.iconWord])) : {};
const RUN = arg("run", `playtest/runs/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`)!;
const ONLY = arg("only")?.split(",");
const VIEW = { width: 844, height: 390 }; // iPhone 13-ish, landscape: what children actually hold
// real time per case; --nav's child replays every instruction first, so its cases get twice as long (w1-10 and w3-6
// hit 150 s with --nav, and w3-6 finishes in 95 s without: verify round 1)
const MAX_MS = NAV ? 300_000 : 150_000;
const STUCK_MS = 25_000; // real time with no visible change and nothing for the bot to do
const FRAME_EVERY = 2500;

const YEAR1 = { now: (KIDS as any).year1.now as string, save: { ...(KIDS as any).year1.save, seenIntro: true, seenFlower: true, seenTraining: true, seenPlacement: true } };

const INTENT: Record<string, string> = {
  listen: "Hear a word spoken slowly and tap the matching picture (sounds only, no letters).",
  firstsound: "Hear a word and tap the picture that starts with the target sound; then see how the sound is written; then find it.",
  soundhunt: "Hear two words and pick the one with the target sound in the middle; then build and read words.",
  dojo: "Sensei builds a word sound by sound (I do), then we do it together, then the child builds words from letter tiles on their own, then reads.",
  battle: "A monster appears; the child spells/reads words to beat it by tapping letter tiles.",
  swap: "Word chain: change one sound to turn one word into the next (mat → sat → sit).",
  run: "Endless runner: tap to jump and collect the letters that spell the word.",
  sort: "Sort words into baskets by which spelling of a sound they use.",
  story: "Interactive picture story: read along and choose what happens next.",
  boss: "A boss battle: the land's guardian (the Sky Magpie at the Sky Temple), a longer spelling battle over the land's words. Baron Muddle cuts in to introduce her and to taunt; on the first win he escapes in his balloon.",
  learn: "Learn a new spelling of a sound.",
  training: "First-time tutorial: learn to tap, the gong, the help button and the speaker button.",
  placement: "Get-to-know-you quiz that places the child at the right level.",
  map: "World map: tap the next level to play.",
  title: "Title screen: press play.",
  profiles: "Who's playing? Choose a player or make a new one.",
  tree: "The World Flower: one teardrop petal per sound (44), lit as the child wins them back, with the petal chart as a ninja scroll to swipe. Tap a petal to hear its sound, tap a gem to hear Sensei explain how that spelling spells the sound, and tap the green gate to practise it in the dojo.",
  "tree-petal": "One World Flower petal up close: the sound, its spellings as gems (tap to hear how each spells the sound; a glowing one opens its gem battle), Sensei's example words, the words the child has found, and a green gate to practise in the dojo.",
  "tree-victory": "A gem was just won in its gem battle: victory music builds, the gem flies into its petal, the petal blooms, then Sensei explains the spelling and counts the ways the child knows to spell the sound. Nothing to tap until the green arrow appears.",
  "tree-found": "A level has just taught new spellings: each gem's dark crystal cracks open in its petal while Sensei explains the spelling with example words. Tapping skips ahead; the green arrow carries on.",
  "tree-world": "The start of a new land: the World Flower so far, every known sound lighting up in turn, one sound re-explained with example words, and the petals still hiding in this land's mist. Tapping skips ahead.",
  "tree-practise": "A practice dojo from the World Flower's green gate: build three words with one spelling (one together, then on your own), then back to the World Flower, where the gem's energy fills up.",
  "tree-trial": "A Gem Trial: spell the words before the purple bar fills to win the gem; then the World Flower's victory, where the gem dives into its petal to swelling music.",
  "tree-practised": "Back from a practice dojo: the scroll shows the practised gem's energy filling up, and a full gem opens its petal with the gem battle ready.",
  "tree-chart": "The World Flower's petal chart: the school's sound chart as laminated sheets, half a sheet per screen, swiped up and down with a finger (one swipe, one half-sheet), with page dots to jump. Tap a petal to open its card (tap outside the card to close it); a petal not met yet shakes and stays a secret.",
  "tree-land": "A gem won in its Gem Trial whose petal still has spellings to win: after the victory the chart opens, the jewel flies in and lands beside its spelling, and the petal's colour grows. Then the green arrow.",
  "tree-fork": "A petal's card for a spelling that spells more than one sound (th in thin and this): the fork chip opens a panel with a petal for each sound, and the tick goes back to the card.",
  book: "The Sticker Book: a sticker for every picture the child has played with (gold ones for words read or spelt), in the order they were collected, with a big counter.",
  grownups: "Grown-ups settings page.",
  ears: "Warm-up 'Ninja Ears' for a 3-year-old who can't read: big picture cards, each named aloud and spotlit; Sensei shows one first ('Let me show you!', a paw taps), then the child tries: tap the picture, fast and slow words with the tortoise and rabbit, noticing first sounds, tap all that start with a sound. No letters.",
  picread: "Warm-up 'Ninjas read this way' for a 3-year-old: pictures on a reading rail read left to right (fish dog → a fish-dog), which order did Sensei read, compound words (sun + flower), sound dots. Sensei shows one first, then the child tries. No letters.",
  optin: "The school-year question for a brand-new child, all spoken with big picture buttons: 'Do you go to big school yet?' (teddy / school), then 'Which class are you in?' (Reception, Year One, Year Two, Not sure). A tap starts a settling ring; the badge flies to the grown-ups' gear.",
  picparade: "Grown-ups' picture parade: every warm-up picture full screen, with a tick and a cross to mark whether the child named it.",
  stickers: "The Sticker Book reward: the lesson's pictures turn into stickers and land in the book.",
  intro: "The opening film: eight shots about the World Flower and Baron Muddle. Each shot plays its clip with Sensei's line, then holds on its last frame until the child taps the big green Next arrow (Back and Hear it again beside it). Nothing moves on by itself.",
  choose: "Choose your ninja: two big cards (Kai, Suki). A tap picks one (it powers up and Sensei says 'Great choice!'), then the green Next arrow goes on. Idle: the cards bob and Sensei asks again; the pointing hand shows; the game never picks.",
  finale: "The finale: the World Flower blooms again (the ninja's biggest celebration), then Baron Muddle says sorry. Two held steps, each waiting on the green Next arrow; Next on the last goes to the map.",
  home: "Home (top-left, on every screen) tapped part-way through: it must land on the right screen (the title before the map, else the map or the World Flower), with exactly one scene left.",
  "nav-demo": "Dev demo of the navigation pieces: a three-step show that holds on a green Next arrow (Back and Hear it again beside it), a turn with the sound picture, and a final hold.",
};

/** `optin`: the answer the bot gives the school-year question (window.__botOptIn: "none", "unsure", "R", "Y1", "Y2").
 *  `leave`: the case is done once the route (window.__snRoute) is no longer this one (a show the child left with Next).
 *  `stopAfterMs`: the case is done after this long (real ms), e.g. to tap Home part-way through. `idle`: the idle-next
 *  check (§6.4): once Next is first ready, nobody taps for this long (game ms); nav_ready must play, Next must glow, and
 *  the step must not move on. `after.expect` is the landing's __snState.scene, or its route when it publishes none (the
 *  title).
 *  `taps`: real taps (by aria-label) before the bot plays, e.g. the petal panel's Practise gate. `after`: once the case
 *  is done, a real tap on this button must leave exactly one scene on stage, publishing `expect` (App routes that
 *  leave the World Flower: Next at a trip's end → the map, Home → the map). */
interface Case { name: string; url: string; kind: string; title: string; save?: object; play: boolean; optin?: string; taps?: string[]; after?: { tap: string; expect: string }; leave?: string; stopAfterMs?: number; idle?: number; acts?: Act[]; watch?: Watch[]; clock?: string }
/** `acts`: what the child does, in order, in the bot's place (the bot plays once they are done), each with real touch:
 *  `tap` a label, `tapSel` the first visible element matching a selector, `swipe` the petal chart one half-sheet up or
 *  down (a paced finger flick: it must turn exactly one half-sheet), `scrim` a tap on the petal card's backdrop beside
 *  the card, `dot` a tap on a page dot (the chart must land on that half-sheet), `expect` a condition in the page that
 *  must hold within `within` real ms. A failed act is a `scripted-step` (a swipe that turned no page, or two, a
 *  `chart-swipe`). `watch`: conditions that must each hold at some moment while the case plays (checked on every step
 *  of the loop). `clock`: the page's date (the flower saves' `now`: recency, dust and mastery depend on it). */
type Act = { do: "tap"; label: string } | { do: "tapSel"; sel: string; name: string } | { do: "swipe"; dir: "up" | "down" } | { do: "scrim" } | { do: "dot"; i: number } | { do: "expect"; js: string; name: string; within?: number };
type Watch = { name: string; js: string };
const IS_LEVEL = new Set(LEVELS.map((l) => l.id));
const cases: Case[] = [
  ...LEVELS.map((l) => ({ name: l.id, url: `/play/?level=${l.id}`, kind: l.kind, title: `${WORLDS[l.world - 1].name} ${l.id} (${l.kind})`, play: true })),
  { name: "training", url: "/play/?scene=training", kind: "training", title: "Training", save: save({ seenTraining: false }), play: true },
  { name: "placement", url: "/play/?scene=placement", kind: "placement", title: "Placement", save: save({ seenPlacement: false }), play: true },
  ...["map", "title", "profiles", "tree", "book", "grownups"].map((s) => ({ name: s, url: `/play/?scene=${s}`, kind: s, title: s, play: false })),
  // the World Flower's petal detail and its trips (src/scenes/Tree.tsx, Intros.tsx): a child part-way through Blossom Hills
  // who has met ai and ay; played to the end (the trip is done when __snState.done)
  { name: "tree-petal", url: "/play/?scene=tree&gem=ai>ae&open=1", kind: "tree-petal", title: "World Flower: a petal up close", save: FLOWER_SAVE, play: false },
  { name: "tree-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", kind: "tree-victory", title: "World Flower: a gem won", save: FLOWER_SAVE, play: true },
  { name: "tree-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", kind: "tree-found", title: "World Flower: new spellings found", save: FLOWER_SAVE, play: true },
  { name: "tree-world", url: "/play/?scene=tree&visit=world:3", kind: "tree-world", title: "World Flower: the start of a new land", save: FLOWER_SAVE, play: true },
  { name: "tree-practised", url: "/play/?scene=tree&visit=practised:ai>ae&from=0.3", kind: "tree-practised", title: "World Flower: back from practice", save: FLOWER_SAVE, play: true },
  // the App's routes to and from the World Flower: a practice dojo (then the flower fills its gem), a Gem Trial (then
  // its victory); both are done when the trip on the flower is, and its held Next goes on to the map
  { name: "practise", url: "/play/?practise=ai>ae", kind: "tree-practise", title: "Practice dojo (ai), back to the World Flower, then Next to the map", save: FLOWER_SAVE, play: true, after: { tap: "Next", expect: "map" } },
  { name: "trial", url: "/play/?trial=ai>ae", kind: "tree-trial", title: "Gem Trial (ai), then its victory, then Next to the map", save: FLOWER_SAVE, play: true, after: { tap: "Next", expect: "map" } },
  // the petal panel's Practise gate, tapped for real: the panel and the flower must leave with it (they once stayed on
  // top of the dojo: two sibling children with the same key in App.tsx); then the practice, the flower, and the map.
  // /s/'s card on < ss > (B2's request): in FLOWER_SAVE it is met and charging (4 of 8), so the card offers the dojo gate
  // (ai>ae's gem is ready, and its card offers the battle instead). The case failed at integration and in verify round 1
  // because the sweep's audio-unlock click at the top of the screen landed on the card's backdrop and closed the card.
  { name: "tree-practise-tap", url: "/play/?scene=tree&gem=ss>s&open=1", kind: "tree-practise", title: "Petal panel → Practise → the practice dojo → the flower → the map", save: FLOWER_SAVE, play: true, taps: ["Practise in the dojo"], after: { tap: "Next", expect: "map" } },
  // SCROLL_DESIGN §8.4's new cases. The chart, by hand: "Petal chart", three swipes up and one down with a real finger
  // (each must turn exactly one half-sheet), a petal's card, closed on its backdrop, a petal not met yet (petal_secret, no
  // card), a page dot, then Home → the map. (FLOWER_SAVE's chart opens on half-sheet 0; after the swipes it is on 2,
  // where /e/ is met and /j/ is not.)
  {
    name: "tree-chart", url: "/play/?scene=tree", kind: "tree-chart", title: "World Flower chart: swipes, a card, a secret petal, a page dot, Home", save: FLOWER_SAVE, play: true,
    acts: [
      { do: "tap", label: "Petal chart" },
      { do: "expect", name: "the chart is open", js: "window.__snState?.view === 1 && window.__snState?.half != null" },
      { do: "swipe", dir: "up" }, { do: "swipe", dir: "up" }, { do: "swipe", dir: "up" }, { do: "swipe", dir: "down" },
      { do: "tapSel", name: "a met petal on the half-sheet", sel: `.pc-half[data-half="HALF"] .pc-petal[data-stage]:not([data-stage="missing"])` },
      { do: "expect", name: "its card opens", js: "!!window.__snState?.open && !!document.querySelector('.pd-card')" },
      { do: "scrim" },
      { do: "expect", name: "the backdrop closes the card", js: "!window.__snState?.open && !document.querySelector('.pd-card')" },
      { do: "tapSel", name: "a petal not met yet", sel: `.pc-half[data-half="HALF"] .pc-petal[data-stage="missing"]` },
      { do: "expect", name: "a secret: petal_secret, and no card", js: "(window.__audioLog ?? []).some((a) => /\\/petal_secret\\.mp3/.test(a.url)) && !window.__snState?.open" },
      { do: "dot", i: 0 },
      // (a dot below the pill: the dots after the current one are drawn 24 stage px lower to make room for it)
      { do: "dot", i: 4 },
    ],
    after: { tap: "Home", expect: "map" },
  },
  // a gem won whose petal isn't complete by it (SCROLL_DESIGN §8.4, v1 §8.2): /oe/ with < oa > and < ow > met and neither
  // won; the victory ends on the chart, where the jewel lands beside < oa > and the colour grows, then the green arrow
  {
    name: "tree-land", url: "/play/?scene=tree&gem=oa>oe&celebrate=1", kind: "tree-land", title: "World Flower: a gem won lands on the chart (oa)", play: true,
    save: { ...FLOWER_SAVE, petals: [...(FLOWER_SAVE as any).petals, "oa", "ow"], energy: { ...(FLOWER_SAVE as any).energy, "oa>oe": 8, "ow>oe": 3 } },
    watch: [
      { name: "the chart opens for the landing", js: "window.__snState?.landing === true && window.__snState?.view === 1" },
      { name: "the jewel lands beside < oa >", js: "!!document.querySelector('.pc-ln.landed[data-gem-chip=\"oa>oe\"]')" },
      { name: "/oe/'s colour grows", js: "!!document.querySelector('.pc-petal[data-p=\"oe\"] .pc-fl.rising')" },
    ],
  },
  // the fork (SCROLL_DESIGN §3.7, §8.4): the year1 child (src/ui/flower-children.fixture.json, at its own date), /th/'s
  // card, < th >, the fork chip: two petals (/th/ and /dh/) and no magnifying glass; the tick goes back to /th/'s card
  {
    name: "tree-fork", url: "/play/?scene=tree&gem=th>th", kind: "tree-fork", title: "World Flower: th's fork panel, and back to its card", play: true, save: YEAR1.save, clock: YEAR1.now,
    acts: [
      { do: "expect", name: "the chart opens on /th/", js: "window.__snState?.view === 1 && !!document.querySelector('.pc-petal[data-p=\"th\"]')" },
      { do: "tapSel", name: "/th/'s petal", sel: `.pc-petal[data-p="th"]` },
      { do: "expect", name: "/th/'s card opens", js: "window.__snState?.open === 'th' && !!document.querySelector('.pd-card')" },
      { do: "tapSel", name: "< th > on the card", sel: `.pd-card [data-key="th>th"]` },
      { do: "tapSel", name: "the fork chip", sel: `.pd-card [aria-label="th: its other sounds"]` },
      { do: "expect", name: "the fork panel: two petals, no magnifying glass", js: "window.__snState?.fork === 'th' && document.querySelectorAll('.fk-card .fk-petal[data-p]').length === 2 && !document.querySelector('[aria-label^=\"Sound Detective\"]')" },
      { do: "tap", label: "close" },
      { do: "expect", name: "the tick goes back to /th/'s card", js: "window.__snState?.fork == null && window.__snState?.open === 'th' && !!document.querySelector('.pd-card:not(.fk-card)')" },
    ],
  },
  // Home from the World Flower: the map, and nothing of the flower left behind
  { name: "tree-home", url: "/play/?scene=tree", kind: "tree", title: "World Flower → Home → the map", save: FLOWER_SAVE, play: true, after: { tap: "Home", expect: "map" } },
  // the first minutes (docs/FIRST_MINUTES.md): the opt-in with each kind of answer (done once the first session is set
  // up and the opt-in has gone), the Sticker Book with stickers, the picture parade, and the map after the first session
  { name: "optin", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (not at school yet)", save: save({ seenPlacement: false, seenTraining: false, stars: {} }), play: true },
  { name: "optin-Y1", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (Year One)", save: save({ seenPlacement: false, seenTraining: true, stars: {} }), play: true, optin: "Y1" },
  { name: "optin-unsure", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (not sure)", save: save({ seenPlacement: false, seenTraining: true, stars: {} }), play: true, optin: "unsure" },
  { name: "book-stickers", url: "/play/?scene=book", kind: "book", title: "Sticker Book with stickers", save: save({ seenBook: true, stickers: ["sun", "sock", "cat", "sausage", "moon", "fish", "dog", "flower", "sunflower", "star", "starfish", "fishdog", "am", "at"], shiny: ["fishdog"], words: { am: { n: 1, ok: 1, last: 0 }, at: { n: 1, ok: 1, last: 0 }, sun: { n: 1, ok: 1, last: 0 } } }), play: false },
  { name: "picparade", url: "/play/?scene=picparade", kind: "picparade", title: "Picture parade", play: false },
  { name: "map-warmups", url: "/play/?scene=map", kind: "map", title: "Map after the first session", save: save({ stars: { "w1-wu1": 1, "w1-wu2": 1 }, settings: { unlockAll: false } }), play: false },
  // the navigation pieces on their own (src/scenes/NavDemo.tsx): every nav invariant must pass here
  { name: "nav-demo", url: "/play/?scene=nav-demo", kind: "nav-demo", title: "Navigation demo", play: true },
  // the shows before the map and the finale (docs/NAVIGATION.md §6.4): played through with Next until the child leaves
  { name: "intro", url: "/play/?scene=intro", kind: "intro", title: "The opening film, shot by shot on Next", save: save({ seenIntro: false, hero: null }), play: true, leave: "intro" },
  { name: "idle-next", url: "/play/?scene=intro", kind: "intro", title: "The film's first shot, left alone for 20 s: it must hold, glow and say nav_ready", save: save({ seenIntro: false, hero: null }), play: true, idle: 20_000 },
  { name: "choose", url: "/play/?scene=choose", kind: "choose", title: "Choose your ninja, then Next", save: save({ seenIntro: false, hero: null }), play: true, leave: "choose" },
  { name: "finale", url: "/play/?scene=finale", kind: "finale", title: "The finale's two held steps, then Next to the map", play: true, leave: "finale" },
  // where Home lands (§3.3, §6.1): a real tap on Home part-way through each kind of screen
  ...([
    ["home-film", "/play/?scene=intro", "title", save({ seenIntro: false, hero: null })],
    ["home-choose", "/play/?scene=choose", "title", save({ seenIntro: false, hero: null })],
    ["home-optin", "/play/?scene=optin", "title", save({ seenPlacement: false, seenTraining: false, stars: {} })],
    ["home-training", "/play/?scene=training", "title", save({ seenTraining: false })],
    ["home-reward", "/play/?scene=reward&id=w1-6", "map", undefined],
    ["home-book", "/play/?scene=book", "map", undefined],
    ["home-placement", "/play/?scene=placement", "map", save({ seenPlacement: false })],
    ["home-finale", "/play/?scene=finale", "map", undefined],
    ["home-trip", "/play/?scene=tree&visit=world:3", "map", FLOWER_SAVE],
    ["home-trial", "/play/?trial=ai>ae", "tree", FLOWER_SAVE],
    ["home-level", "/play/?level=w2-3", "map", undefined],
  ] as [string, string, string, object | undefined][]).map(([name, url, expect, sv]): Case => ({ name, url, kind: "home", title: `${url.replace("/play/?", "")} → Home → the ${expect}`, save: sv, play: true, stopAfterMs: 5000, after: { tap: "Home", expect } })),
].filter((c) => !ONLY || ONLY.includes(c.name));

// ---------------------------------------------------------------- in-page checks
type Issue = { kind: string; sel: string; detail: string };
/** `level`: the case is a level, where the ninja always stands in the ninja zone (docs/HERO.md). */
function pageChecks(opts: { level?: boolean } = {}): Issue[] {
  const out: Issue[] = [];
  const W = innerWidth, H = innerHeight;
  const name = (el: Element) => {
    const a = el.getAttribute("aria-label");
    const c = (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
    const t = !a && !c ? (el.textContent ?? "").trim().slice(0, 24) : "";
    return `${el.tagName.toLowerCase()}${c}${a ? `[aria-label="${a}"]` : ""}${t ? `("${t}")` : ""}`;
  };
  // still popping in (a finite animation on it or a parent is running): its size isn't final yet
  const settling = (el: Element) => {
    for (let e: Element | null = el; e && e !== document.body; e = e.parentElement)
      if (e.getAnimations().some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime as number))) return true;
    return false;
  };
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.3 && r.width > 2 && r.height > 2;
  };
  // while a modal (first-visit intro, dialog) is open, only its own targets matter; the page under it is meant to be dimmed.
  // A modal still fading in or out counts too: however see-through, it already (or still) catches every tap.
  const blocking = (el: Element) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== "hidden" && s.display !== "none" && s.pointerEvents !== "none" && r.width > 2 && r.height > 2;
  };
  const modal = [...document.querySelectorAll("[data-modal]")].find(blocking);
  const targets = [...(modal ?? document).querySelectorAll("button, [role=button], .hear-card, [data-tap]")].filter(
    (el) => visible(el) && !(el as HTMLButtonElement).disabled && !el.classList.contains("used") && !el.closest("[aria-hidden=true]"),
  );
  for (const el of targets) {
    const r = el.getBoundingClientRect();
    const n = name(el);
    const scroller = el.closest(".scrollable");
    const adult = !!el.closest("[data-grownups]"); // grown-up controls may be ordinary web-sized
    if (scroller) {
      // inside a scrolling container, a target that is (partly) scrolled out of its view is fine: below the fold of a
      // scrolling page, or sideways off-screen in a swipeable row such as the World Flower's petal scroll
      const v = scroller.getBoundingClientRect();
      const vis = { left: Math.max(0, v.left), right: Math.min(W, v.right), top: Math.max(0, v.top), bottom: Math.min(H, v.bottom) };
      if (r.bottom > vis.bottom + 1 || r.top < vis.top - 1 || r.right > vis.right + 1 || r.left < vis.left - 1) continue;
    }
    if (r.right < 4 || r.bottom < 4 || r.left > W - 4 || r.top > H - 4) out.push({ kind: "offscreen", sel: n, detail: `rect ${r.left | 0},${r.top | 0} ${r.width | 0}×${r.height | 0}` });
    else if (r.left < 0 || r.right > W || r.bottom > H) out.push({ kind: "clipped-target", sel: n, detail: `extends past the screen edge (${r.left | 0},${r.top | 0} ${r.width | 0}×${r.height | 0})` });
    if (!adult && Math.min(r.width, r.height) < 40 && !settling(el)) out.push({ kind: "tiny-target", sel: n, detail: `${r.width | 0}×${r.height | 0}px on a phone (want ≥ 44)` });
    if (r.left < 16 || r.right > W - 16) out.push({ kind: "edge-target", sel: n, detail: "within 16px of the side edge (iOS back-swipe zone)" });
    // what's actually under the centre?
    const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== el && !el.contains(top) && !top.contains(el) && !top.closest("[data-tap-proxy]")) out.push({ kind: "covered-target", sel: n, detail: `centre is covered by ${name(top)}` });
  }
  // zone conflicts (docs/HERO.md layout contract, stage coordinates 1280×720): nothing to tap in the ninja zone
  // (bottom-left, where the player's ninja stands in every level) or the help zone (bottom-right, Sensei's Help button)
  const stage = document.querySelector(".stage");
  if (stage) {
    const sr = stage.getBoundingClientRect();
    const sc = sr.width / 1280;
    const ninjaZone = !!opts.level || !!document.querySelector(".ninja-spot");
    const titleScreen = !!document.querySelector(".scene.title");
    for (const el of targets) {
      if (el.getAttribute("aria-label") === "Help" || el.closest("[data-tap-proxy]")) continue;
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2 - sr.left) / sc, y = (r.top + r.height / 2 - sr.top) / sc;
      const inNinja = ninjaZone && x >= 0 && x <= 330 && y >= 380 && y <= 720;
      const inHelp = x >= 1116 && x <= 1280 && y >= 556 && y <= 720;
      // the Home zone (docs/NAVIGATION.md §3.1): nothing but Home with its centre in x 0-130, y 0-130. Not on the title,
      // which has no Home (TITLE_DESIGN §9.7): its "Who's playing?" chip sits there by design (integration, 27 Sep)
      const inHome = !titleScreen && x >= 0 && x <= 130 && y >= 0 && y <= 130 && el.getAttribute("data-nav") !== "home";
      if (inNinja || inHelp || inHome)
        out.push({ kind: "zone-conflict", sel: name(el), detail: `centre at stage ${x | 0},${y | 0} is in the ${inNinja ? "ninja zone (x 0-330, y 380-720)" : inHelp ? "help zone (x 1116-1280, y 556-720)" : "Home zone (x 0-130, y 0-130)"}` });
    }
  }
  // Home on every screen (docs/NAVIGATION.md §6.1): exactly one visible [data-nav="home"], at least 44 px on the phone,
  // centred in the Home zone, and nothing over it. Exempt: the title (it is home), the turn-your-phone prompt, the crash
  // screen, the ninja demo, and a route still fading in (the first 600 ms).
  const fading = [...document.querySelectorAll(".fullscreen-fade")].some((f) => f.getAnimations().some((a) => a.playState === "running"));
  const noHome = !!document.querySelector(".scene.title, .rotate") || /Oops! A muddle!/.test(document.body.innerText) || /scene=ninja-demo/.test(location.search) || fading;
  if (stage && !noHome) {
    const sr = stage.getBoundingClientRect();
    const sc = sr.width / 1280;
    const homes = [...document.querySelectorAll('[data-nav="home"]')].filter(visible);
    if (!homes.length) out.push({ kind: "home-missing", sel: "Home", detail: "no visible Home button ([data-nav=\"home\"]) on this screen" });
    if (homes.length > 1) out.push({ kind: "home-duplicate", sel: "Home", detail: `${homes.length} Home buttons: ${homes.map(name).join(", ")}` });
    const h = homes[0];
    if (h) {
      const r = h.getBoundingClientRect();
      const x = (r.left + r.width / 2 - sr.left) / sc, y = (r.top + r.height / 2 - sr.top) / sc;
      if (r.width < 44 || r.height < 44 || x > 130 || y > 130 || x < 0 || y < 0) out.push({ kind: "home-misplaced", sel: name(h), detail: `${r.width | 0}×${r.height | 0}px on the phone, centre at stage ${x | 0},${y | 0} (want ≥ 44 px, centre in x 0-130, y 0-130)` });
      const top = document.elementFromPoint(Math.min(W - 1, Math.max(0, r.left + r.width / 2)), Math.min(H - 1, Math.max(0, r.top + r.height / 2)));
      if (top && top !== h && !h.contains(top)) out.push({ kind: "home-covered", sel: name(h), detail: `a tap on Home lands on ${name(top)}` });
    }
  }
  for (let i = 0; i < targets.length; i++)
    for (let j = i + 1; j < targets.length; j++) {
      if (targets[i].contains(targets[j]) || targets[j].contains(targets[i])) continue;
      const a = targets[i].getBoundingClientRect(), b = targets[j].getBoundingClientRect();
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const small = Math.min(a.width * a.height, b.width * b.height);
      if (ix * iy > 0.2 * small) out.push({ kind: "overlapping-targets", sel: `${name(targets[i])} + ${name(targets[j])}`, detail: `${Math.round((100 * ix * iy) / small)}% overlap` });
    }
  for (const el of document.querySelectorAll(".bubble, .tile, .card, button")) {
    if (!visible(el)) continue;
    const h = el as HTMLElement;
    if (h.scrollWidth > h.clientWidth + 3 && getComputedStyle(h).overflowX !== "visible") out.push({ kind: "text-overflow", sel: name(el), detail: `content ${h.scrollWidth}px in ${h.clientWidth}px` });
  }
  for (const img of document.querySelectorAll("img")) if (img.complete && img.naturalWidth === 0 && visible(img)) out.push({ kind: "broken-image", sel: name(img), detail: img.src.replace(location.origin, "") });
  // the card-box invariant (docs/FIRST_MINUTES.md §11, §14.5), in the warm-ups: every settled picture plate inside the
  // play area, clear of the other cards, the ninja and Help zones and the speaker, never clipped by an ancestor, and its
  // picture inside it
  if (stage && document.querySelector(".wu")) {
    const sr = stage.getBoundingClientRect();
    const sc = sr.width / 1280;
    const toStage = (r: DOMRect) => ({ x: (r.left - sr.left) / sc, y: (r.top - sr.top) / sc, w: r.width / sc, h: r.height / sc });
    const plates = [...document.querySelectorAll(".wu .wu-slot:not(.out) .pcard-plate, .wu .wu-rail-btn .pcard-plate")].filter((p) => {
      const slot = (p.closest(".wu-slot") ?? p) as HTMLElement;
      return Number(getComputedStyle(slot).opacity) > 0.9 && !slot.getAnimations().some((a) => a.playState === "running");
    });
    const rs = plates.map((p) => ({ w: (p.closest("[data-pic]") as HTMLElement | null)?.dataset.pic ?? "?", r: toStage(p.getBoundingClientRect()), el: p }));
    const speaker = document.querySelector(".wu-speaker");
    const sp = speaker ? toStage(speaker.getBoundingClientRect()) : null;
    const inter = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const card = (w: string, detail: string) => out.push({ kind: "card-box", sel: `card ${w}`, detail });
    for (const { w, r, el } of rs) {
      if (r.x < 336 || r.x + r.w > 1114 || r.y < 70 || r.y + r.h > 600) card(w, `outside the play area (${r.x | 0},${r.y | 0} ${r.w | 0}×${r.h | 0})`);
      if (r.x < 330 && r.y + r.h > 380) card(w, "in the ninja zone");
      if (r.x + r.w > 1116 && r.y + r.h > 556) card(w, "in the Help zone");
      if (sp && inter(r, sp) > 0) card(w, "under the speaker");
      for (const o of rs) if (o.el !== el && inter(r, o.r) > 4) card(w, `overlaps ${o.w}`);
      for (let a = el.parentElement; a && !a.classList.contains("stage"); a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (["hidden", "clip"].includes(cs.overflowX) || ["hidden", "clip"].includes(cs.overflowY) || cs.clipPath !== "none") {
          card(w, `clipped by an overflow:${cs.overflow} ancestor (${a.className})`);
          break;
        }
      }
      const pic = el.querySelector("img");
      if (pic) {
        const ir = toStage(pic.getBoundingClientRect());
        if (ir.x < r.x - 1 || ir.y < r.y - 1 || ir.x + ir.w > r.x + r.w + 1 || ir.y + ir.h > r.y + r.h + 1) card(w, "picture spills out of its plate");
      }
    }
  }
  const text = document.body.innerText;
  for (const bad of ["undefined", "NaN", "[object Object]", "null"]) if (new RegExp(`\\b${bad.replace(/[[\]]/g, "\\$&")}\\b`).test(text)) out.push({ kind: "junk-text", sel: "body", detail: `"${bad}" visible on screen` });
  if (/Oops! A muddle!/.test(text)) out.push({ kind: "crash-screen", sel: "body", detail: text.slice(0, 300) });
  return out;
}

// ---------------------------------------------------------------- --petals: in-page checks on what is on screen
type PetalIssue = { kind: string; sel: string; detail: string };
/** Answer cards that are the picture of a visible petal, and badge pictures too small to read (measured at rest). */
async function petalChecks(icon: Record<string, string>): Promise<PetalIssue[]> {
  const out: PetalIssue[] = [];
  const vis = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
    for (let e: Element | null = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
    }
    return true;
  };
  const petals = [...document.querySelectorAll(".sound-badge[data-p], [data-petal]")].filter(vis).map((e) => ({ el: e, p: e.getAttribute("data-p") ?? e.getAttribute("data-petal") ?? "" }));
  const cards = [...document.querySelectorAll(".pick-row [aria-label], .wu .wu-slot:not(.out) [aria-label], [data-pic]")].filter(vis).map((e) => (e.getAttribute("data-pic") ?? e.getAttribute("aria-label") ?? "").toLowerCase());
  for (const { p } of petals) {
    const w = icon[p];
    if (w && cards.includes(w)) out.push({ kind: "petal-giveaway", sel: `/${p}/ beside a ${w} card`, detail: `The /${p}/ petal (its picture is a ${w}) is on screen with an answer card "${w}": the petal gives the answer away (SOUND_DISPLAY A12). Cards: ${[...new Set(cards)].join(", ")}.` });
  }
  // A petal caught mid pop-in (its own or an ancestor's transform animation) reads small (27 Sep: w1-2, w3-4, w5-3,
  // w5-11 and the trial, none small at rest). So a small reading is measured again once the finite animations on its
  // chain have finished (at most 1.5 s) and 300 ms more have passed (an endless loop is then at another phase), and the
  // larger of the two readings counts. A petal that has gone by then isn't reported.
  const size = (img: Element) => {
    const r = img.getBoundingClientRect();
    return Math.min(r.width, r.height);
  };
  const small: { el: Element; p: string; img: Element; px: number }[] = [];
  for (const { el, p } of petals) {
    if (el.classList.contains("still") || el.classList.contains("mini") || el.getAttribute("data-tier") === "mini") continue;
    const img = el.querySelector("img");
    if (!img) continue;
    const px = size(img);
    if (px > 0 && px < 38) small.push({ el, p, img, px });
  }
  // petal-overflow and petal-covered (verify round 2: the w3-6 reward's row of seven won petals ran past its panel's left
  // edge and its last petal sat under the Sticker Book, and the sweep saw only petal-too-small). Every visible petal that
  // isn't a caption's mini chip, at rest: its shape inside the stage, inside any ancestor that clips it, and inside its
  // panel (the nearest ancestor that paints a box, a background, gradient or border, and is smaller than most of the
  // stage); and nothing painted over its picture (a 3×3 grid of points on it: covered when 3 or more are under one other
  // thing). The hit test is made with every element's pointer-events on for that instant (the Sticker Book, confetti and
  // the ninja take no taps), and full-screen layers (the particle canvas, the vignette, a modal's dimmer) don't count as
  // covers. A petal (partly) scrolled out of a scrolling container's view, the World Flower's chart, is fine.
  const stageEl = document.querySelector(".stage");
  const stageR = stageEl?.getBoundingClientRect() ?? new DOMRect(0, 0, innerWidth, innerHeight);
  const stageArea = stageR.width * stageR.height;
  const nm = (el: Element) => {
    const a = el.getAttribute("aria-label");
    const c = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    return `${el.tagName.toLowerCase()}${c}${a ? `[aria-label="${a}"]` : ""}`;
  };
  const alphaOf = (col: string) => (col === "transparent" ? 0 : /^rgba?\(/.test(col) ? Number(col.replace(/^rgba?\(|\)$/g, "").split(/[,/\s]+/).filter(Boolean)[3] ?? 1) : 1);
  /** does this element paint something of its own over its box (not a transparent wrapper)? */
  const paints = (el: Element) => {
    if (el instanceof SVGElement) return el.tagName.toLowerCase() !== "svg" && el.tagName.toLowerCase() !== "g";
    if (["IMG", "CANVAS", "VIDEO", "PICTURE"].includes(el.tagName)) return true;
    const s = getComputedStyle(el);
    if (alphaOf(s.backgroundColor) >= 0.5 || s.backgroundImage !== "none") return true;
    return [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0);
  };
  const boxed = (el: Element) => {
    const s = getComputedStyle(el);
    return alphaOf(s.backgroundColor) >= 0.5 || s.backgroundImage !== "none" || (s.borderTopStyle !== "none" && parseFloat(s.borderTopWidth) >= 1 && parseFloat(s.borderLeftWidth) >= 1);
  };
  const shown = (el: Element) => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
    }
    return true;
  };
  type Place = { over?: { px: number; side: string; of: string }; cover?: { n: number; by: string } };
  /** Where a petal sits: how far it runs past its containers, and what lies over its picture. null: scrolled out of view. */
  const placeOf = (el: Element): Place | null => {
    const r = el.getBoundingClientRect();
    const tol = Math.max(4, 0.15 * Math.min(r.width, r.height));
    const place: Place = {};
    const past = (c: DOMRect, of: string) => {
      const sides: [number, string][] = [[c.left - r.left, "left"], [r.right - c.right, "right"], [c.top - r.top, "top"], [r.bottom - c.bottom, "bottom"]];
      const [px, side] = sides.sort((a, b) => b[0] - a[0])[0];
      if (px > tol && px > (place.over?.px ?? 0)) place.over = { px, side, of };
    };
    let panel: Element | null = null;
    for (let a = el.parentElement; a && a !== document.body && a !== stageEl; a = a.parentElement) {
      const s = getComputedStyle(a);
      const ar = a.getBoundingClientRect();
      if (["auto", "scroll"].includes(s.overflowX) || ["auto", "scroll"].includes(s.overflowY)) {
        if (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1) return null;
        continue;
      }
      if (["hidden", "clip"].includes(s.overflowX) || ["hidden", "clip"].includes(s.overflowY)) past(ar, `a clipping ${nm(a)}`);
      if (!panel && !a.matches(".scene") && ar.width * ar.height < 0.8 * stageArea && boxed(a)) past(ar, `its panel ${nm((panel = a))}`);
    }
    past(stageR, "the stage");
    const img = el.querySelector("img") ?? el;
    const ir = img.getBoundingClientRect();
    const by = new Map<Element, number>();
    for (const fx of [0.2, 0.5, 0.8])
      for (const fy of [0.2, 0.5, 0.8]) {
        const x = ir.left + fx * ir.width, y = ir.top + fy * ir.height;
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        for (const top of document.elementsFromPoint(x, y)) {
          if (top === el || el.contains(top) || top.contains(el)) break;
          const tr = top.getBoundingClientRect();
          if (tr.width * tr.height > 0.5 * stageArea || !paints(top) || !shown(top)) continue;
          by.set(top, (by.get(top) ?? 0) + 1);
          break;
        }
      }
    const worst = [...by].sort((a, b) => b[1] - a[1])[0];
    // (named by its first class only: the Sticker Book is "div.rw-book" before and after its "thunk")
    const top1 = worst ? worst[0].closest("[class]") ?? worst[0] : null;
    if (worst && top1 && worst[1] >= 3) place.cover = { n: worst[1], by: `${top1.tagName.toLowerCase()}${typeof top1.className === "string" && top1.className.trim() ? "." + top1.className.trim().split(/\s+/)[0] : ""}` };
    return place;
  };
  /** every petal's place, with every element's pointer-events on for the hit tests (restored at once, same task) */
  const placesNow = (els: Element[]) => {
    const probe = document.createElement("style");
    probe.textContent = "*, *::before, *::after { pointer-events: auto !important; }";
    document.head.appendChild(probe);
    try {
      return els.map((el) => (el.isConnected && vis(el) ? placeOf(el) : null));
    } finally {
      probe.remove();
    }
  };
  const placed = petals.filter(({ el }) => !el.classList.contains("mini") && el.getAttribute("data-tier") !== "mini" && !el.closest(".bubble"));
  const firstLook = placesNow(placed.map((x) => x.el));
  const misplaced = placed.map((x, i) => ({ ...x, look: firstLook[i] })).filter((x) => x.look && (x.look.over || x.look.cover));
  if (small.length || misplaced.length) {
    const moving = new Set<Animation>();
    for (const e0 of [...small.map((s) => s.img), ...misplaced.map((m) => m.el)])
      for (let e: Element | null = e0; e && e !== document.body; e = e.parentElement)
        for (const a of e.getAnimations()) if (a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime as number)) moving.add(a);
    if (moving.size) await Promise.race([Promise.all([...moving].map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 1500))]);
    await new Promise((r) => setTimeout(r, 300));
    for (const { el, p, img, px: first } of small) {
      if (!img.isConnected || !vis(el)) continue;
      const px = Math.max(first, size(img));
      if (px > 0 && px < 38) out.push({ kind: "petal-too-small", sel: `/${p}/ badge`, detail: `The /${p}/ petal's picture is ${Math.round(px)} CSS px on the 844×390 phone, at rest (want ≥ 38; the badge is ${Math.round(el.getBoundingClientRect().width)} px wide).` });
    }
    // (both looks must agree: a petal still flying in, or confetti passing over, is let go)
    const again = placesNow(misplaced.map((m) => m.el));
    for (const [i, { el, p, look }] of misplaced.entries()) {
      const now = again[i];
      if (!now) continue;
      const r = el.getBoundingClientRect();
      const box = `its box ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)} CSS px`;
      if (look!.over && now.over) {
        const o = now.over.px <= look!.over.px ? now.over : look!.over;
        out.push({ kind: "petal-overflow", sel: `/${p}/ petal past ${o.of.replace(/^(its panel|a clipping) /, "")}`, detail: `The /${p}/ petal runs ${Math.round(o.px)} px past the ${o.side} edge of ${o.of}, at rest (${box}): part of it is off its panel or cut off.` });
      }
      if (look!.cover && now.cover && now.cover.by === look!.cover.by)
        out.push({ kind: "petal-covered", sel: `/${p}/ petal under ${now.cover.by}`, detail: `${Math.min(now.cover.n, look!.cover.n)} of 9 points on the /${p}/ petal's picture are under ${now.cover.by}, at rest (${box}): the child can't see the petal.` });
    }
  }
  return out;
}

const SEV: Record<string, Finding["severity"]> = {
  "crash-screen": "blocker", pageerror: "blocker", stuck: "blocker", "did-not-finish": "major", "covered-target": "major", offscreen: "major", "zone-conflict": "major",
  "broken-image": "major", "junk-text": "major", "overlapping-targets": "major", "clipped-target": "minor", "tiny-target": "minor",
  "edge-target": "minor", "text-overflow": "minor", "console-error": "minor", "monkey-crash": "blocker",
  "card-box": "major", "warmup-over-cap": "major", "stacked-scenes": "blocker", "stale-scene": "blocker", "duplicate-key": "blocker",
  // navigation (docs/NAVIGATION.md §6); home-* and auto-* are blockers in the first-session cases (FIRST_SESSION)
  "home-missing": "major", "home-covered": "major", "home-misplaced": "major", "home-duplicate": "major",
  "no-replay-for-instruction": "major", "auto-advance": "major", "auto-answer": "major",
  "replay-silent": "major", "replay-stale": "major", "show-again-broken": "major", "idle-nudge": "minor",
  // the petal invariants (FIX_PLAN I.2): the first three are majors here, and blockers in the first-session cases
  // (severityOf); petal-too-small, sound-unclassified and the perf invariants stay minor
  "sound-without-petal": "major", "petal-for-hidden": "major", "petal-giveaway": "major", "petal-too-small": "minor", "sound-unclassified": "minor",
  // (verify round 2) a petal off its panel, cut off, or under something painted: majors
  "petal-overflow": "major", "petal-covered": "major",
  "anim-main-thread": "minor", "anim-hidden": "minor", "raf-at-rest": "minor",
  // a case's own steps (Case.acts, Case.watch): the World Flower's chart and cards by hand (SCROLL_DESIGN §8.4)
  "scripted-step": "major", "chart-swipe": "major",
};

/** The first session (the opt-in, the welcome, Lessons 1 and 2, the film): a child's first minutes, where a missing Home,
 *  a screen that moves on by itself, or a sound shown wrongly (no petal, a hidden sound's petal, a petal that gives the
 *  answer away: FIX_PLAN I.2) is a blocker. */
const FIRST_SESSION = new Set(["optin", "optin-Y1", "optin-unsure", "training", "intro", "idle-next", "choose", "home-film", "home-choose", "home-optin", "home-training", ...LEVELS.filter((l) => l.warmup === "W1" || l.warmup === "W2").map((l) => l.id)]);
const FIRST_SESSION_BLOCKERS = /^(home-|auto-|sound-without-petal$|petal-for-hidden$|petal-giveaway$)/;
const severityOf = (kind: string, caseName: string): Finding["severity"] =>
  FIRST_SESSION.has(caseName) && FIRST_SESSION_BLOCKERS.test(kind) ? "blocker" : SEV[kind] ?? "minor";

// ---------------------------------------------------------------- run one case
async function runCase(b: Browser, c: Case, monkey: boolean): Promise<{ findings: Finding[]; secs: number; ok: boolean }> {
  const tag = monkey ? `${c.name}~monkey` : c.name;
  const dir = `${RUN}/cases/${tag}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: VIEW, hasTouch: true, isMobile: false });
  const page = await ctx.newPage();
  const findings = new Map<string, Finding>();
  const add = (kind: string, sel: string, detail: string, evidence: string[] = []) => {
    const sig = `bot:${c.name}:${kind}:${sel.replace(/\("[^"]*"\)/g, "")}`; // anonymous buttons' text is detail, not identity
    if (findings.has(sig)) return;
    findings.set(sig, { sig, source: kind.startsWith("monkey") || monkey ? "bot" : "invariant", severity: severityOf(kind, c.name), case: c.name, title: `${kind}: ${sel}`, detail, evidence, repro: `${BASE}${c.url}` });
  };
  page.on("pageerror", (e) => add("pageerror", e.message.slice(0, 80), e.stack?.slice(0, 600) ?? e.message));
  // (React's duplicate-key warning is a blocker: two siblings with one key leave an old scene mounted over the next)
  page.on("console", (m) => m.type() === "error" && !/favicon|404|net::ERR/.test(m.text()) && add(/two children with the same key/.test(m.text()) ? "duplicate-key" : "console-error", m.text().slice(0, 80), m.text().slice(0, 400)));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save ?? save()), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  // --petals: the perf invariants' sampler (perf-probe.ts), before the page's own scripts
  if (PETALS && !monkey) await page.addInitScript(perfSampler, { dur: DURS, fast: FAST });
  await page.addInitScript(([o, petals]) => {
    const w = window as any;
    w.__audioLog = [];
    w.__botOptIn = o;
    // --petals: as each sound clip starts, is its petal on screen (for "petal"), or hidden (for "hidden")?
    if (petals) {
      const issues: any[] = (w.__petalIssues = []);
      const vis = (el: Element) => {
        const r = el.getBoundingClientRect();
        if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
        for (let e: Element | null = el; e; e = e.parentElement) {
          const s = getComputedStyle(e);
          if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
        }
        return true;
      };
      const on = () => {
        const ps: string[] = [];
        document.querySelectorAll(".sound-badge[data-p], [data-petal]").forEach((e) => vis(e) && ps.push(e.getAttribute("data-p") ?? e.getAttribute("data-petal") ?? ""));
        document.querySelectorAll('[role="button"][data-p]').forEach((e) => vis(e) && e.querySelector("img") && ps.push(e.getAttribute("data-p")!));
        document.querySelectorAll("svg path[data-p]").forEach((e) => e.parentElement?.querySelector("image") && vis(e) && ps.push(e.getAttribute("data-p")!));
        return ps;
      };
      const seen = (p: string) => { const ps = on(); return ps.includes(p) || (p === "ks" && ps.includes("k") && ps.includes("s")); };
      let prev: string | null = null;
      const log: any[] = w.__audioLog;
      log.push = function (...items: any[]) {
        for (const it of items) w.__perfAct?.(it?.url);
        for (const it of items) {
          const m = String(it?.url ?? "").match(/\/a\/p\/([^/]+)\.mp3/);
          if (m) {
            const p = m[1], show = it.show, sel = `after ${prev ?? "(nothing)"}`, scene = w.__snState?.scene ?? "?";
            if (show === "petal" && !seen(p)) setTimeout(() => void (!seen(p) && issues.push({ kind: "sound-without-petal", sel: `/${p}/ ${sel}`, detail: `A "petal" sound /${p}/ started (${scene}, after ${prev ?? "nothing"}) with no /${p}/ petal visible, and none 50 ms later.` })), 50);
            if (show === "hidden") {
              const look = () => void (seen(p) && issues.push({ kind: "petal-for-hidden", sel: `/${p}/ ${sel}`, detail: `A "hidden" sound /${p}/ (the question: ${scene}, after ${prev ?? "nothing"}) played with its petal visible.` }));
              look();
              setTimeout(look, 150);
            }
            if (show === undefined || show === "unclassified") issues.push({ kind: "sound-unclassified", sel, detail: `A lone sound /${p}/ (${scene}, after ${prev ?? "nothing"}) has no job (show: petal, tile or hidden).` });
          }
          const l = String(it?.url ?? "").match(/\/a\/l\/([^/]+)\.mp3/);
          if (l) prev = l[1];
        }
        return Array.prototype.push.apply(this, items);
      };
    }
    // navigation invariants (docs/NAVIGATION.md §6): every child input (bot taps are dispatched pointer events, real
    // taps are trusted ones), and every change of route, turn (__snState's scene, next, busy) and step (__snNav.pres),
    // all on performance.now()
    w.__snInput = [];
    w.__snTrack = [];
    const track = (k: string, v: unknown) => w.__snTrack.push({ t: performance.now(), k, v });
    let route: unknown, state: any = null, nav: any = null, turnKey = "", presKey: string | null = null;
    Object.defineProperty(w, "__snRoute", { configurable: true, get: () => route, set: (v) => void (v !== route && ((route = v), track("route", v))) });
    Object.defineProperty(w, "__snState", {
      configurable: true,
      get: () => state,
      set: (v) => {
        state = v;
        const next = v && typeof v.next === "string" ? v.next : null;
        // the question: a warm-up's beat, a word being built or spelt, a sort's word, else the answer itself (a tap-all
        // or a word has several answers in one question)
        const qv = v?.beat ?? v?.word ?? v?.i ?? null;
        const q = qv == null ? null : String(qv);
        const key = JSON.stringify([v?.scene ?? null, next, !!v?.busy, q]);
        if (key !== turnKey) (turnKey = key), track("turn", { scene: v?.scene ?? null, next, busy: !!v?.busy, capped: !!v?.capped, q });
      },
    });
    Object.defineProperty(w, "__snNav", {
      configurable: true,
      get: () => nav,
      set: (v) => {
        nav = v;
        const key = v?.pres ? `${v.pres.id}#${v.pres.step}` : null;
        if (key !== presKey) (presKey = key), track("pres", key);
      },
    });
    window.addEventListener("pointerdown", (e) => {
      const el = e.target instanceof Element ? e.target : null;
      const n = el?.closest("[data-nav]"), l = el?.closest("[aria-label]");
      const label = l?.getAttribute("aria-label") ?? null;
      w.__snInput.push({ t: performance.now(), nav: n?.getAttribute("data-nav") ?? null, label, grown: !!el?.closest("[data-grownups]") || /^Grown-ups/.test(label ?? ""), dialog: !!el?.closest('[role="dialog"], [data-modal]') });
    }, true);
  }, [c.optin ?? "none", PETALS && !monkey] as const);
  // (a case's own date: Date runs from it, as the flower saves' child lives)
  if (c.clock)
    await page.addInitScript((t) => {
      const real = Date, off = new real(t).getTime() - real.now();
      class ChildDate extends real {
        constructor(...a: any[]) {
          if (a.length === 0) super(real.now() + off);
          else super(...(a as [any]));
        }
        static now() {
          return real.now() + off;
        }
      }
      (globalThis as any).Date = ChildDate;
    }, c.clock);
  await page.goto(`${BASE}${c.url}${c.url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await unlockAudio(page); // (not a click at the top: it closed the petal card on its backdrop)
  const pending = [...(monkey ? [] : c.taps ?? [])];
  const acts = [...(monkey ? [] : c.acts ?? [])];
  const watches = (monkey ? [] : c.watch ?? []).map((w) => ({ ...w, seen: false }));
  // real touch for the acts: CDP touch points, as a finger (the chart's native scroll and its tap guard need them)
  const cdp = acts.length ? await ctx.newCDPSession(page) : null;
  const meta: CaseMeta = { case: tag, url: c.url, kind: c.kind, title: c.title + (monkey ? " — random tapping" : ""), intent: INTENT[c.kind] ?? c.kind, frames: [] };
  /** A real tap (pointer events at its centre, as a finger would) on the first visible element with this aria-label. */
  const realTap = async (label: string, within = 12_000) => {
    const loc = page.locator(`[aria-label="${label}"]`).first();
    for (const t = Date.now(); Date.now() - t < within; await page.waitForTimeout(250)) {
      const box = await loc.boundingBox().catch(() => null);
      if (box && box.width > 2) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        return true;
      }
    }
    return false;
  };
  /** More than one scene on the stage for over a second: an old screen left mounted under or over the new one. */
  const stackedScenes = async () => {
    const n = () => page.evaluate(() => document.querySelectorAll(".stage > .scene").length).catch(() => 1);
    if ((await n()) <= 1) return null;
    await page.waitForTimeout(1000 / FAST);
    const k = await n();
    return k > 1 ? k : null;
  };
  // ---- a case's own acts (Case.acts): a child's hand on the World Flower, with real touch
  const snState = () => page.evaluate(() => (window as any).__snState ?? null).catch(() => null);
  /** The centre of the first element matching `sel` that is on screen and not covered there. */
  const spotOf = (sel: string) =>
    page
      .evaluate((sel) => {
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4 || r.bottom < 2 || r.top > innerHeight - 2 || r.right < 2 || r.left > innerWidth - 2) continue;
          const x = Math.min(Math.max(r.x + r.width / 2, 2), innerWidth - 2), y = Math.min(Math.max(r.y + r.height / 2, 2), innerHeight - 2);
          const top = document.elementFromPoint(x, y);
          if (top && (top === el || el.contains(top))) return { x, y };
        }
        return null;
      }, sel)
      .catch(() => null);
  const touchTap = async (x: number, y: number) => {
    if (!cdp) return page.mouse.click(x, y);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1, radiusX: 10, radiusY: 10, force: 1 }] });
    await page.waitForTimeout(70);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  /** The chart's scrollTop once it has stopped moving (unchanged for 300 ms; at most 4 s). */
  const chartAtRest = async () => {
    let last = -2, since = Date.now();
    for (const t = Date.now(); Date.now() - t < 4000; await page.waitForTimeout(50)) {
      const top = await page.evaluate(() => (document.querySelector(".pc-scroller") as HTMLElement | null)?.scrollTop ?? -1).catch(() => -1);
      if (top !== last) (last = top), (since = Date.now());
      else if (Date.now() - since > 300) break;
    }
    return Math.round(last);
  };
  /** A finger flick on the chart, as the design's acceptance makes it (SCROLL_DESIGN §8.2, mockup/cost.ts swipe60):
   *  250 px in 120 ms, a touch point every 16.7 ms (paced, as a phone samples a finger). Each point carries its own time,
   *  as a phone's touch screen stamps it: without the stamps, points that reached a busy page in a burst read as a far
   *  faster fling, and the first flick after the chart opened sometimes went three half-sheets or none (3 of 40 flicks
   *  at --par 4 under load; 0 of 40 with the stamps: F4, verify round 1). */
  const flick = async (dir: "up" | "down") => {
    const r = await page.evaluate(() => { const b = document.querySelector(".pc-scroller")?.getBoundingClientRect(); return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null; }).catch(() => null);
    if (!r || !cdp) return false;
    const dy = Math.min(250, r.h * 0.8) * (dir === "up" ? -1 : 1);
    const x0 = r.x + r.w * 0.42, y0 = dir === "up" ? r.y + r.h - 30 : r.y + 30;
    const pt = (y: number) => [{ x: x0, y, id: 1, radiusX: 10, radiusY: 10, force: 1 }];
    const steps = Math.round(120 / 16.67), s0 = performance.now(), ts0 = Date.now() / 1000;
    const at = (i: number) => ({ timestamp: ts0 + (i * 16.67) / 1000 });
    try {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt(y0), ...at(0) });
      for (let i = 1; i <= steps; i++) {
        const wait = s0 + i * 16.67 - performance.now();
        if (wait > 0) await new Promise((res) => setTimeout(res, wait));
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pt(y0 + (dy * i) / steps), ...at(i) });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [], ...at(steps) });
    } catch {
      return false;
    }
    return true;
  };
  /** Wait (real ms) until `js` holds in the page. */
  const until = async (js: string, within = 4000) => {
    for (const t = Date.now(); Date.now() - t < within; await page.waitForTimeout(150)) if (await page.evaluate(js).catch(() => false)) return true;
    return !!(await page.evaluate(js).catch(() => false));
  };
  const doAct = async (a: Act) => {
    const half = (await snState())?.half;
    const name = a.do === "tap" ? `tap ${a.label}` : a.do === "tapSel" ? a.name : a.do === "swipe" ? `swipe ${a.dir}` : a.do === "dot" ? `page dot ${a.i}` : a.do === "scrim" ? "the backdrop" : a.name;
    const fail = async (kind: string, detail: string) => {
      const f = await frame(`act-${name.replace(/[^a-z0-9]+/gi, "-").slice(0, 30)}`);
      add(kind, name, `${detail} snState=${JSON.stringify(await snState())}`, f ? [`cases/${tag}/${f}`] : []);
    };
    if (a.do === "tap") {
      if (!(await realTap(a.label, 6000))) await fail("scripted-step", `Nothing labelled "${a.label}" to tap.`);
      await page.waitForTimeout(1200 / FAST + 300);
    } else if (a.do === "tapSel") {
      const sel = a.sel.replace(/HALF/g, String(half ?? 0));
      const at = await spotOf(sel);
      if (!at) return fail("scripted-step", `Nothing on screen to tap for ${sel}.`);
      await touchTap(at.x, at.y);
      await page.waitForTimeout(1200 / FAST + 300);
    } else if (a.do === "scrim") {
      // a point on the card's backdrop, beside the card (the letterbox or the dimmed chart)
      const at = await page
        .evaluate(() => {
          const bd = document.querySelector(".pd-backdrop")?.getBoundingClientRect(), card = document.querySelector(".pd-card")?.getBoundingClientRect();
          if (!bd || !card) return null;
          for (const [x, y] of [[bd.x + 24, bd.y + bd.height / 2], [bd.right - 24, bd.y + bd.height / 2], [bd.x + bd.width / 2, bd.bottom - 12], [bd.x + bd.width / 2, bd.y + 12]]) {
            const inCard = x >= card.left && x <= card.right && y >= card.top && y <= card.bottom;
            const top = document.elementFromPoint(x, y);
            if (!inCard && top?.closest(".pd-backdrop") && !top.closest(".pd-card")) return { x, y };
          }
          return null;
        })
        .catch(() => null);
      if (!at) return fail("scripted-step", "No petal card's backdrop to tap beside the card.");
      await touchTap(at.x, at.y);
      await page.waitForTimeout(1200 / FAST + 300);
    } else if (a.do === "swipe") {
      const top0 = await chartAtRest();
      const before = (await snState())?.half;
      if (typeof before !== "number" || !(await flick(a.dir))) return fail("scripted-step", "No petal chart on screen to swipe.");
      await page.waitForTimeout(200);
      const top1 = await chartAtRest();
      const after = (await snState())?.half;
      const want = Math.max(0, Math.min(5, before + (a.dir === "up" ? 1 : -1)));
      if (after !== want) await fail("chart-swipe", `A finger flick ${a.dir} (250 px in 120 ms, paced at 60 Hz) on half-sheet ${before} ended on half-sheet ${after} (scrollTop ${top0} → ${top1}), not ${want}: one swipe must turn exactly one half-sheet (SCROLL_DESIGN §4.1, §8.2).`);
    } else if (a.do === "dot") {
      const at = await spotOf(`.pc-dots i[data-i="${a.i}"]`);
      if (!at) return fail("scripted-step", `No page dot ${a.i} on screen.`);
      await touchTap(at.x, at.y);
      await page.waitForTimeout(300);
      await chartAtRest();
      if (!(await until(`window.__snState?.half === ${a.i}`, 3000))) await fail("scripted-step", `Page dot ${a.i} was tapped, but the chart is on half-sheet ${(await snState())?.half}.`);
    } else if (a.do === "expect") {
      if (!(await until(a.js, a.within ?? 4000))) await fail("scripted-step", `Expected within ${(a.within ?? 4000) / 1000} s: ${a.js}.`);
    }
    await frame(`act-${name.replace(/[^a-z0-9]+/gi, "-").slice(0, 30)}`);
  };
  const t0 = Date.now();
  let lastSig = "", lastChange = Date.now(), lastFrame = -1e9, ok = false, ticks = 0;
  /** --petals: the page's sound-clip issues since the last read */
  let petalAt = 0;
  const petalLog = async (): Promise<Issue[]> => {
    const xs: Issue[] = await page.evaluate((from) => ((window as any).__petalIssues ?? []).slice(from), petalAt).catch(() => []);
    petalAt += xs.length;
    return xs;
  };
  const frame = async (why = "") => {
    const t = Date.now() - t0;
    if (t < 500 && !why) return ""; // the screen is still fading in
    const file = `f_${String(meta.frames.length).padStart(2, "0")}${why ? "_" + why : ""}.png`;
    await page.screenshot({ path: `${dir}/${file}` }).catch(() => {});
    const info = await page
      .evaluate(() => ({
        st: (window as any).__snState ?? null,
        cap: document.querySelector(".bubble")?.textContent ?? "",
        // things still popping or dropping in: layout claims on this frame are unreliable (the critic is told)
        settling: document.getAnimations().some((a) => a.playState === "running" && Number(a.effect?.getTiming().iterations) !== Infinity),
      }))
      .catch(() => ({ st: null, cap: "", settling: false }));
    meta.frames.push({ file, t, snState: info.st, caption: info.cap, settling: info.settling } as CaseMeta["frames"][number]);
    return file;
  };
  // ---- navigation invariants (docs/NAVIGATION.md §6), from the page's input and change logs (all performance.now())
  // auto-advance: a step (__snNav.pres) changed without a Next, Back or Home tap since it started; a route changed with
  //   no tap on the old route, or left a show (the film, Choose, the opt-in, a reward, the finale, the placement's end,
  //   the World Flower to the map) without Next or Home.
  // auto-answer: a turn (__snState.next set, not busy) ended with no answer from the child.
  // no-replay-for-instruction: the screen waits (Next ready, or a turn) after an instruction, quiet for 1 s of game
  //   time, with no visible Hear it again ([data-nav="again"]). The bot waits for the quiet on the first three waits of
  //   each screen, so the check doesn't depend on how fast it answers.
  type NavInput = { t: number; nav: string | null; label: string | null; grown: boolean; dialog: boolean };
  const inputs: NavInput[] = [];
  const trackLog: { t: number; k: string; v: unknown }[] = []; // (written as navtrack.json when a nav check fails)
  let trackAt = 0, inputAt = 0, audioAt = 0;
  let route: { v: string; t: number } | null = null;
  let pres: { v: string | null; t: number } = { v: null, t: 0 };
  let openTurn: { scene: string | null; next: string; t: number } | null = null;
  let capT: number | null = null, posT = 0, quietSince = 0, lastInstr: { id: string; t: number } | null = null;
  // --nav: when this question began (a new route, step, or question: a warm-up's beat, a word, else the answer; a busy
  // flip or the next letter of the same word doesn't count), every Sensei line said
  // (performance.now()), and every speech clip of any kind
  let stepT = 0, turnSN = "";
  const lines: { id: string; t: number }[] = [];
  const speech: { url: string; t: number }[] = [];
  const checked = new Set<string>(), waitsPerScreen = new Map<string, number>();
  const SHOW_ROUTES = new Set(["intro", "choose", "optin", "reward", "finale", "placement"]);
  const SHOW_EXITS = new Set(["Play again", "Go to the World Flower", "Skip film"]);
  const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
  const between = (a: number, b: number) => inputs.filter((i) => i.t >= a && i.t <= b);
  const said = (ins: NavInput[]) => ins.map((i) => i.nav ?? i.label ?? "(the background)").join(", ") || "none";
  const onRoute = (ev: { t: number; v: string }) => {
    const from = route;
    route = { v: String(ev.v), t: ev.t };
    posT = stepT = ev.t;
    if (!from || from.v === route.v) return;
    const a = from.v.split(":")[0], b = route.v.split(":")[0];
    if ([a, b].some((x) => x === "grownups" || x === "setup")) return;
    const ins = between(from.t, ev.t);
    if (ins.length && (ins[ins.length - 1].grown || ins[ins.length - 1].dialog)) return; // left by a grown-up's choice (Jump ahead's hold, the gear)
    if (!ins.length) return add("auto-advance", `route ${a} → ${b}`, `The game went from ${from.v} to ${route.v} with no tap on ${from.v}.`);
    const show = SHOW_ROUTES.has(a) || (a === "tree" && b === "map");
    if (show && !ins.some((i) => ["next", "home", "back"].includes(i.nav ?? "") || SHOW_EXITS.has(i.label ?? "")))
      add("auto-advance", `route ${a} → ${b}`, `${from.v} is a show, but it went on to ${route.v} without a tap on Next or Home (taps there: ${said(ins)}).`);
  };
  const onTurn = (ev: { t: number; v: { scene: string | null; next: string | null; busy: boolean; capped: boolean; q: string | null } }) => {
    const v = ev.v;
    if (v.capped && capT == null) capT = ev.t;
    if (openTurn && v.next !== openTurn.next) {
      // (a tap on the turn's own answer counts even on a [data-nav="sound"] petal: the petal join-in "petal s": C2)
      const ins = between(openTurn.t, ev.t).filter((i) => !["again", "show", "sound"].includes(i.nav ?? "") || (!!i.label && i.label === openTurn!.next));
      const capped = capT != null && between(capT, ev.t).length > 0;
      if (!ins.length && !capped) add("auto-answer", `${openTurn.scene} turn`, `The turn "${openTurn.next}" (${openTurn.scene}) ended without an answer from the child (now ${JSON.stringify(v)}).`);
      openTurn = null;
    }
    if (v.next && !v.busy && !openTurn) openTurn = { scene: v.scene, next: v.next, t: ev.t };
    if (!v.next) openTurn = null;
    posT = ev.t;
    const sn = `${v.scene}|${v.q ?? v.next}`;
    if (sn !== turnSN) (turnSN = sn), (stepT = ev.t);
  };
  const onPres = (ev: { t: number; v: string | null }) => {
    if (pres.v && ev.v !== pres.v) {
      const ins = between(pres.t, ev.t);
      // a Ready hold (holdReady) also ends on a tap on the board or a right answer (a hand-over Ready: TEACHER_SCRIPT
      // §2.3, readyTap): any tap but Hear it again, the paw or Help ends it by the child's hand (C2's request)
      const byChild = pres.v.startsWith("ready:") ? ins.some((i) => !["again", "show", "help"].includes(i.nav ?? "")) : ins.some((i) => ["next", "back", "home"].includes(i.nav ?? ""));
      if (!byChild)
        add("auto-advance", `step ${pres.v.split("#")[0]}`, `The step ${pres.v} went on to ${ev.v ?? "(the end of the show)"} by itself (taps: ${said(ins)}).`);
    }
    pres = { v: ev.v, t: ev.t };
    posT = stepT = ev.t;
  };
  type Probe = { tr: any[]; inp: NavInput[]; au: { t: number; url: string; kind: string }[]; auN: number; now: number; wall: number; st: { scene: string | null; next: string | null; busy: boolean }; next: string | null; pres: string | null; loud: boolean; again: boolean };
  const probe = () =>
    page
      .evaluate(([a, b, c]) => {
        const w = window as any;
        const st = w.__snState ?? null, nav = w.__snNav ?? null;
        const shown = (el: Element) => {
          const s = getComputedStyle(el), r = el.getBoundingClientRect();
          if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) <= 0.3 || r.width <= 2 || r.height <= 2) return false;
          const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !!top && (top === el || el.contains(top));
        };
        return {
          tr: (w.__snTrack ?? []).slice(a),
          inp: (w.__snInput ?? []).slice(b),
          au: (w.__audioLog ?? []).slice(c),
          auN: (w.__audioLog ?? []).length,
          now: performance.now(),
          wall: Date.now(),
          st: { scene: st?.scene ?? null, next: typeof st?.next === "string" ? st.next : null, busy: !!st?.busy },
          next: nav?.next ?? null,
          pres: nav?.pres ? `${nav.pres.id}#${nav.pres.step}` : null,
          loud: !!document.querySelector(".bubble, .help-btn.talking"),
          again: [...document.querySelectorAll('[data-nav="again"]')].some(shown),
        };
      }, [trackAt, inputAt, audioAt])
      .catch(() => null) as Promise<Probe | null>;
  /** Take a probe's new log entries: run the change checks and note what was said. */
  const take = (q: Probe) => {
    trackAt += q.tr.length;
    inputAt += q.inp.length;
    audioAt = q.auN;
    inputs.push(...q.inp);
    trackLog.push(...q.tr);
    for (const ev of q.tr) ev.k === "route" ? onRoute(ev) : ev.k === "turn" ? onTurn(ev) : onPres(ev);
    const off = q.wall - q.now; // __audioLog is on Date.now()
    for (const e of q.au) {
      if (e.kind === "speech") speech.push({ url: e.url, t: e.t - off });
      const m = e.kind === "speech" && e.url.match(/\/a\/l\/([^/]+)\.mp3/);
      if (m) lines.push({ id: m[1], t: e.t - off });
      if (m && isInstruction(m[1])) lastInstr = { id: m[1], t: e.t - off };
    }
    if (q.loud) quietSince = q.now;
  };
  /** Read the logs, run the change checks, and (when `settle`) wait for the quiet a replay check needs. */
  const navTick = async (settle: boolean) => {
    let p = await probe();
    if (!p) return;
    take(p);
    const waiting = (q: Probe) => q.next === "ready" || (!!q.st.next && !q.st.busy);
    const screen = (q: Probe) => `${(route?.v ?? "?").split(":")[0]}/${q.pres?.split("#")[0] ?? q.st.scene ?? "?"}`;
    const pos = (q: Probe) => `${route?.v}|${q.pres}|${q.st.scene}|${q.st.next}`;
    const instructed = () => !!lastInstr && lastInstr.t >= posT - 2500 / FAST;
    if (!waiting(p) || !instructed() || checked.has(pos(p))) return;
    const quietFor = 1000 / FAST;
    if (settle && (waitsPerScreen.get(screen(p)) ?? 0) < 3) {
      // hold the bot until the screen has been quiet for a second of game time (at most 3 s real)
      waitsPerScreen.set(screen(p), (waitsPerScreen.get(screen(p)) ?? 0) + 1);
      const k = pos(p);
      for (const t = Date.now(); Date.now() - t < 3000; ) {
        if (p.now - quietSince >= quietFor && !p.loud) break;
        await page.waitForTimeout(100);
        const q = await probe();
        if (!q) return;
        take(q);
        p = q;
        if (pos(p) !== k || !waiting(p)) return;
      }
    }
    if (p.loud || p.now - quietSince < quietFor) return;
    checked.add(pos(p));
    if (!p.again && lastInstr)
      add("no-replay-for-instruction", screen(p), `After "${LINE_TEXT.get(lastInstr.id) ?? lastInstr.id}" (${lastInstr.id}) the screen waits (${p.next === "ready" ? `Next, step ${p.pres}` : `turn "${p.st.next}"`}) with no Hear it again to tap.`);
  };
  // ---- --nav (§6.2): in each new waiting position, tap Hear it again (and Show me again) before answering or going on
  const navTested = new Set<string>();
  /** The centre (client px) of the first visible, uncovered [data-nav=k] that isn't dim, or null. */
  const navTarget = (k: string) =>
    page
      .evaluate((k) => {
        for (const el of document.querySelectorAll(`[data-nav="${k}"]`)) {
          const s = getComputedStyle(el), r = el.getBoundingClientRect();
          if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) <= 0.3 || r.width <= 2 || el.closest(".navc-dim")) continue;
          const x = r.left + r.width / 2, y = r.top + r.height / 2;
          const top = document.elementFromPoint(x, y);
          if (top && (top === el || el.contains(top))) return { x, y };
        }
        return null;
      }, k)
      .catch(() => null);
  /** Speech clips since index `from` of the sweep's log, waiting up to `ms` real for the first. */
  const heardSince = async (from: number, ms: number) => {
    for (const t = Date.now(); speech.length <= from && Date.now() - t < ms; ) {
      await page.waitForTimeout(80);
      const q = await probe();
      if (q) take(q);
    }
    return speech.slice(from);
  };
  /** Wait (at most `ms` real) until nothing has been said for a second of game time. */
  const untilQuiet = async (ms: number) => {
    for (const t = Date.now(); Date.now() - t < ms; ) {
      await page.waitForTimeout(100);
      const q = await probe();
      if (!q) return;
      take(q);
      if (!q.loud && q.now - quietSince >= 1000 / FAST) return;
    }
  };
  const lineOf = (url: string) => url.match(/\/a\/l\/([^/]+)\.mp3/)?.[1] ?? null;
  const navProbe = async () => {
    const p = await probe();
    if (!p) return;
    take(p);
    const waiting = p.next === "ready" || (!!p.st.next && !p.st.busy);
    if (!waiting || p.loud || p.now - quietSince < 1000 / FAST) return;
    const key = `${route?.v}|${p.pres}|${p.st.scene}|${p.st.next}`;
    if (navTested.has(key)) return;
    navTested.add(key);
    const where = `${(route?.v ?? "?").split(":")[0]}/${p.pres?.split("#")[0] ?? p.st.scene ?? "?"}`;
    // what this question said that the child needs (from its start, or up to 2.5 s of game time before)
    const said = [...new Set(lines.filter((l) => l.t >= stepT - 2500 / FAST && isInstruction(l.id)).map((l) => l.id))];
    const again = await navTarget("again");
    if (again) {
      const from = speech.length;
      await page.mouse.click(again.x, again.y);
      const got = await heardSince(from, 2000 / FAST);
      if (!got.length) add("replay-silent", where, `Hear it again at ${key} played nothing within 2 s (game time).`);
      else {
        await untilQuiet(15_000);
        const replayed = speech.slice(from).map((e) => lineOf(e.url)).filter((x): x is string => !!x);
        if (said.length && replayed.length && !replayed.some((id) => said.includes(id)))
          add("replay-stale", where, `Hear it again at ${key} said ${replayed.map((id) => `"${LINE_TEXT.get(id) ?? id}"`).join(", ")}, but this question said ${said.map((id) => `"${LINE_TEXT.get(id) ?? id}"`).join(", ")}.`);
      }
    }
    const show = await navTarget("show");
    if (show) {
      const before = await probe();
      if (before) take(before);
      const from = speech.length;
      await page.mouse.click(show.x, show.y);
      const got = await heardSince(from, 2000 / FAST);
      await untilQuiet(20_000);
      const after = await probe();
      if (after) take(after);
      if (!got.length) add("show-again-broken", where, `Show me again at ${key} played nothing within 2 s (game time).`);
      else if (before && after && (after.st.next !== before.st.next || after.st.scene !== before.st.scene))
        add("show-again-broken", where, `Show me again at ${key} changed the turn (${before.st.scene}/${before.st.next} → ${after.st.scene}/${after.st.next}): it must never answer.`);
    }
  };
  // ---- idle-next (§6.4): the first held step, left alone
  const idleCheck = async (ms: number) => {
    const p = await probe();
    if (!p || p.next !== "ready") return false;
    take(p);
    const pres0 = p.pres;
    const from = lines.length;
    await page.waitForTimeout(ms / FAST);
    const q = await probe();
    if (q) take(q);
    const glow = await page.locator(".nav-next.ready.glow").count().catch(() => 0);
    await frame("idle");
    const nudged = lines.slice(from).some((l) => l.id === "nav_ready");
    if (!nudged) add("idle-nudge", "nav_ready", `Left alone for ${ms / 1000} s (game time) at ${pres0}, Sensei never said "Tap the arrow when you're ready!".`);
    if (!glow) add("idle-nudge", "glow", `Left alone for ${ms / 1000} s (game time) at ${pres0}, the Next arrow didn't glow.`);
    if (q && (q.pres !== pres0 || q.next !== "ready")) add("auto-advance", `idle ${pres0}`, `Left alone for ${ms / 1000} s (game time), the step went from ${pres0} (Next ready) to ${q.pres} (Next ${q.next}).`);
    return true;
  };
  while (Date.now() - t0 < (c.play ? MAX_MS : 12_000)) {
    // a show left by the child (`leave`), or a case that stops part-way for its `after` tap (`stopAfterMs`)
    if (!monkey && c.leave) {
      const r = await page.evaluate(() => String((window as any).__snRoute ?? "")).catch(() => "");
      if (r && r.split(":")[0] !== c.leave) {
        await frame("left");
        ok = true;
        break;
      }
    }
    if (!monkey && c.stopAfterMs && Date.now() - t0 > c.stopAfterMs) {
      await frame("stop");
      ok = true;
      break;
    }
    if (!monkey && c.idle && (await idleCheck(c.idle))) {
      ok = true;
      break;
    }
    if (pending.length) {
      // (let the screen settle first, as a child would: panels pop in, and the first tap only unlocks audio)
      if (Date.now() - t0 < 2500) { await page.waitForTimeout(200); continue; }
      const label = pending.shift()!;
      if (!(await realTap(label))) add("did-not-finish", `tap ${label}`, `The case's tap on "${label}" found nothing to tap.`);
      await page.waitForTimeout(1500 / FAST);
      await frame(`tapped-${label.replace(/[^a-z0-9]+/gi, "-")}`);
      continue;
    }
    // the case's own acts, one a step (the checks below run between them), once the screen has settled
    if (acts.length) {
      if (Date.now() - t0 < 2500) { await page.waitForTimeout(200); continue; }
      await doAct(acts.shift()!);
      lastFrame = -1e9; // (check the screen the act left at once)
    }
    for (const w of watches) if (!w.seen && (await page.evaluate(w.js).catch(() => false))) w.seen = true;
    // a case made of acts alone is done once they are (and any trip they started is over)
    if (c.acts && !acts.length && !monkey && !(await page.evaluate(() => (window as any).__snState?.busy === true).catch(() => false))) {
      await frame("done");
      ok = true;
      break;
    }
    if (c.play && !monkey && (await page.locator('button[aria-label="Play again"]').count())) {
      ok = true;
      // a warm-up's time governor (docs/FIRST_MINUTES.md §3 rule 10, §14): the lesson must close by its hard cap (not
      // checked with --nav, whose child waits for quiet before and after every replay: a slow child the cap may not fit)
      const wu = await page.evaluate(() => (window as any).__snWarmup ?? null).catch(() => null);
      if (wu?.key && !NAV) {
        const cap = warmupScript(wu.key, wu.version === "R" ? "R" : undefined).capS;
        if (wu.secs > cap + 3) add("warmup-over-cap", `${wu.key} ${wu.secs}s`, `The lesson took ${wu.secs}s of game time; its hard cap is ${cap}s (skipped: ${(wu.skipped ?? []).join(", ") || "none"}).`);
      }
      break;
    }
    // the opt-in is done once the first session is set up and the opt-in has gone
    if (c.play && !monkey && c.kind === "optin") {
      const done = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return !!s.firstSession && !document.querySelector(".oi"); } catch { return false; } }).catch(() => false);
      if (done) { await frame("done"); ok = true; break; }
    }
    // a trip to the World Flower is over when its green arrow shows (Tree.tsx publishes done); a plain visit (tree-home)
    // once it has settled
    if (c.play && !monkey && c.kind.startsWith("tree") && (await page.evaluate((plain) => { const st = (window as any).__snState; return st?.scene === "tree" && (st.done === true || (plain && !st.intro && !st.busy && !st.open)); }, c.kind === "tree").catch(() => false)) && (c.kind !== "tree" || Date.now() - t0 > 2500)) {
      await frame("done");
      ok = true;
      break;
    }
    if (c.name === "training" || c.name === "placement") {
      const done = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return s.seenTraining && s.seenPlacement; } catch { return false; } });
      if (done) { ok = true; break; }
    }
    if (Date.now() - lastFrame > FRAME_EVERY) {
      lastFrame = Date.now();
      ticks++;
      if (meta.frames.length < 40 || ticks % 4 === 0) await frame(); // long levels: thin the filmstrip out
      // monkeys wander into other screens: only crash-type signals count there (layout is the deterministic bot's job)
      const issues = (await page.evaluate(pageChecks, { level: IS_LEVEL.has(c.name) }).catch(() => [] as Issue[])).filter((i) => !monkey || ["crash-screen", "junk-text", "broken-image"].includes(i.kind));
      if (PETALS && !monkey) issues.push(...(await page.evaluate(petalChecks, ICON).catch(() => [] as Issue[])), ...(await petalLog()));
      const stacked = await stackedScenes();
      if (stacked) issues.push({ kind: "stacked-scenes", sel: ".stage > .scene", detail: `${stacked} scenes on the stage for over a second (an old screen is still mounted under or over the new one); snState=${JSON.stringify(await page.evaluate(() => (window as any).__snState ?? null).catch(() => null))}` });
      for (const i of issues) {
        const sig = `bot:${c.name}:${i.kind}:${i.sel.replace(/\("[^"]*"\)/g, "")}`;
        if (!findings.has(sig)) {
          // outline the culprit for the evidence shot
          const shot = `issue_${findings.size}.png`;
          await page.evaluate((sel) => { const m = sel.match(/\[aria-label="([^"]+)"\]/); const el = m ? document.querySelector(`[aria-label="${m[1]}"]`) : null; if (el) (el as HTMLElement).style.outline = "5px solid red"; }, i.sel).catch(() => {});
          await page.screenshot({ path: `${dir}/${shot}` }).catch(() => {});
          await page.evaluate(() => document.querySelectorAll("[style*='outline']").forEach((e) => ((e as HTMLElement).style.outline = ""))).catch(() => {});
          add(i.kind, i.sel, i.detail, [`cases/${tag}/${shot}`]);
        }
      }

    }
    if (!monkey) await navTick(true);
    if (!c.play) { await page.waitForTimeout(400); continue; }
    if (NAV && !monkey) await navProbe();
    if (monkey) {
      for (let k = 0; k < 4; k++) await page.mouse.click(10 + Math.random() * (VIEW.width - 20), 10 + Math.random() * (VIEW.height - 20)).catch(() => {});
      if (Date.now() - t0 > 45_000) { ok = true; break; }
    } else if (c.kind.startsWith("tree") && (await page.evaluate(() => (window as any).__snState?.scene === "tree" && (window as any).__snState.done === true).catch(() => false))) {
      // (a trip that has just finished: the case ends at the top of the loop; the bot mustn't tap its Next first)
    } else if (!c.idle) await step(page).catch(() => {}); // (idle-next: nobody taps)
    const sig = await page.evaluate(() => JSON.stringify((window as any).__snState ?? null) + (document.querySelector(".bubble")?.textContent ?? "") + ((window as any).__audioLog?.length ?? 0) + document.querySelectorAll("*").length).catch(() => "");
    if (sig !== lastSig) (lastSig = sig), (lastChange = Date.now());
    else if (!monkey && Date.now() - lastChange > STUCK_MS) {
      const f = await frame("stuck");
      add("stuck", "no change", `Nothing changed on screen or in audio for ${STUCK_MS / 1000}s (real, at ${FAST}×) and the bot found nothing to tap. snState=${JSON.stringify(meta.frames.at(-1)?.snState)}`, [`cases/${tag}/${f}`]);
      break;
    }
    await page.waitForTimeout(monkey ? 250 : 350);
  }
  if (c.play && !monkey && !ok && ![...findings.values()].some((f) => f.title.startsWith("stuck"))) add("did-not-finish", "timeout", `The bot did not finish within ${MAX_MS / 1000}s real time.`);
  for (const w of watches) if (!w.seen && !(await page.evaluate(w.js).catch(() => false))) add("scripted-step", `never: ${w.name}`, `This never held while the case played: ${w.js}.`);
  for (const a of acts) add("scripted-step", `not reached: ${a.do === "tap" ? `tap ${a.label}` : a.do === "tapSel" || a.do === "expect" ? a.name : a.do}`, "The case ended before this act.");
  // leaving: one real tap must leave exactly one scene, the one expected (and its state, not the old scene's)
  if (ok && c.after && !monkey) {
    // a petal panel left open (e.g. offering a gem that is now ready) is closed first: it covers the arrow on purpose
    if (await page.locator('[data-modal] [aria-label="close"]').count()) {
      await realTap("close", 3000);
      await page.waitForTimeout(1200 / FAST);
    }
    if (!(await realTap(c.after.tap, 6000))) add("did-not-finish", `tap ${c.after.tap}`, `Nothing labelled "${c.after.tap}" to tap at the end.`);
    await page.waitForTimeout(2500 / FAST);
    const f = await frame(`after-${c.after.tap.replace(/[^a-z0-9]+/gi, "-")}`);
    const got = await page.evaluate(() => ({ scenes: [...document.querySelectorAll(".stage > .scene")].map((e) => (e as HTMLElement).className), st: (window as any).__snState ?? null, route: String((window as any).__snRoute ?? "") })).catch(() => ({ scenes: [] as string[], st: null, route: "" }));
    // (a screen that publishes no state, the title, is known by its route)
    const landed = got.st?.scene ?? got.route.split(":")[0];
    if (got.scenes.length !== 1) add("stacked-scenes", `after ${c.after.tap}`, `After tapping "${c.after.tap}": ${got.scenes.length} scenes on the stage (${got.scenes.join(" | ")}).`, [`cases/${tag}/${f}`]);
    if (landed !== c.after.expect) add("stale-scene", `after ${c.after.tap}`, `After tapping "${c.after.tap}" the game is on route ${got.route} and publishes ${JSON.stringify(got.st)}, not scene "${c.after.expect}".`, [`cases/${tag}/${f}`]);
    for (const i of await page.evaluate(pageChecks, {}).catch(() => [] as Issue[])) add(i.kind, `${i.sel} (after ${c.after.tap})`, i.detail, [`cases/${tag}/${f}`]);
  }
  if (!monkey) await navTick(false);
  if (PETALS && !monkey) for (const i of await petalLog()) add(i.kind, i.sel, i.detail);
  if (PETALS && !monkey) {
    const samples: PerfSample[] = await page.evaluate(() => (window as any).__perfSamples ?? []).catch(() => []);
    for (const i of perfIssues(samples)) add(i.kind, i.sel, i.detail);
    writeFileSync(`${dir}/perf.json`, JSON.stringify(samples));
  }
  // evidence for a navigation finding: every input and every change the checks saw (performance.now() ms)
  if ([...findings.values()].some((f) => /^(auto-|replay-|show-again|idle-)/.test(f.title)))
    writeFileSync(`${dir}/navtrack.json`, JSON.stringify({ inputs, track: trackLog, speech: speech.map((e) => ({ ...e, url: e.url.replace(/^.*\/a\//, "") })) }, null, 1));
  if (monkey && (await page.evaluate(() => /Oops! A muddle!/.test(document.body.innerText)).catch(() => false))) add("monkey-crash", "crash screen", "Random tapping crashed the game.");
  writeFileSync(`${dir}/meta.json`, JSON.stringify(meta, null, 1));
  await ctx.close();
  return { findings: [...findings.values()], secs: Math.round((Date.now() - t0) / 1000), ok: ok || !c.play };
}

// ---------------------------------------------------------------- main
mkdirSync(RUN, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const jobs = [...cases.map((c) => ({ c, monkey: false })), ...(MONKEY ? cases.filter((c) => c.play).map((c) => ({ c, monkey: true })) : [])];
const results: Record<string, { ok: boolean; secs: number; findings: number }> = {};
const all: Finding[] = [];
let next = 0;
const t0 = Date.now();
await Promise.all(
  Array.from({ length: PAR }, async () => {
    while (next < jobs.length) {
      const { c, monkey } = jobs[next++];
      const r = await runCase(b, c, monkey).catch((e) => ({ findings: [{ sig: `bot:${c.name}:harness`, source: "bot", severity: "minor", case: c.name, title: "harness error", detail: String(e).slice(0, 400), evidence: [] } as Finding], secs: 0, ok: false }));
      const tag = monkey ? `${c.name}~monkey` : c.name;
      results[tag] = { ok: r.ok, secs: r.secs, findings: r.findings.length };
      all.push(...r.findings);
      const worst = r.findings.filter((f) => f.severity === "blocker" || f.severity === "major").length;
      console.log(`${r.ok && !worst ? "✓" : r.ok ? "!" : "✗"} ${tag.padEnd(16)} ${String(r.secs).padStart(3)}s  ${r.findings.length} findings${worst ? ` (${worst} major+)` : ""}`);
    }
  }),
);
await b.close();
writeFileSync(`${RUN}/sweep.json`, JSON.stringify({ base: BASE, fast: FAST, secs: Math.round((Date.now() - t0) / 1000), results, findings: all }, null, 1));
console.log(`\n${Object.values(results).filter((r) => r.ok).length}/${jobs.length} finished · ${all.length} findings · ${Math.round((Date.now() - t0) / 1000)}s → ${RUN}/sweep.json`);
