// Treadmill stage 1: bots sweep every level and scene at fast-forward on a phone-landscape viewport.
// Each case: a "perfect child" bot plays it to the end (or a monkey taps at random), while in-page invariant checks
// look for things a child would trip over. Output: <runDir>/sweep.json (Finding[] + per-case stats) and
// <runDir>/cases/<case>/{meta.json, f_*.png} filmstrips for the visual critic.
// Usage: bun scripts/treadmill/sweep.ts [--run dir] [--only w1-4,map] [--base http://localhost:5173] [--fast 3] [--par 6] [--monkey]
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../../src/content/worlds";
import { warmupScript } from "../../src/content/warmups";
import { save, step } from "./bot";
import type { CaseMeta, Finding } from "./types";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "3"));
const PAR = Number(arg("par", "6"));
const MONKEY = process.argv.includes("--monkey");
const RUN = arg("run", `playtest/runs/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`)!;
const ONLY = arg("only")?.split(",");
const VIEW = { width: 844, height: 390 }; // iPhone 13-ish, landscape: what children actually hold
const MAX_MS = 150_000; // real time per case
const STUCK_MS = 25_000; // real time with no visible change and nothing for the bot to do
const FRAME_EVERY = 2500;

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
  boss: "Boss battle against Baron Muddle using everything learnt so far.",
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
  book: "The Sticker Book: a sticker for every picture the child has played with (gold ones for words read or spelt), in the order they were collected, with a big counter.",
  grownups: "Grown-ups settings page.",
  ears: "Warm-up 'Ninja Ears' for a 3-year-old who can't read: big picture cards, each named aloud and spotlit; Sensei shows one first ('Let me show you!', a paw taps), then the child tries: tap the picture, fast and slow words with the tortoise and rabbit, noticing first sounds, tap all that start with a sound. No letters.",
  picread: "Warm-up 'Ninjas read this way' for a 3-year-old: pictures on a reading rail read left to right (fish dog → a fish-dog), which order did Sensei read, compound words (sun + flower), sound dots. Sensei shows one first, then the child tries. No letters.",
  optin: "The school-year question for a brand-new child, all spoken with big picture buttons: 'Do you go to big school yet?' (teddy / school), then 'Which class are you in?' (Reception, Year One, Year Two, Not sure). A tap starts a settling ring; the badge flies to the grown-ups' gear.",
  picparade: "Grown-ups' picture parade: every warm-up picture full screen, with a tick and a cross to mark whether the child named it.",
  stickers: "The Sticker Book reward: the lesson's pictures turn into stickers and land in the book.",
};

/** `optin`: the answer the bot gives the school-year question (window.__botOptIn: "none", "unsure", "R", "Y1", "Y2").
 *  `taps`: real taps (by aria-label) before the bot plays, e.g. the petal panel's Practise gate. `after`: once the case
 *  is done, a real tap on this button must leave exactly one scene on stage, publishing `expect` (App routes that
 *  leave the World Flower: Carry on → the map, Home → the map). */
interface Case { name: string; url: string; kind: string; title: string; save?: object; play: boolean; optin?: string; taps?: string[]; after?: { tap: string; expect: string } }
const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});
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
  // its victory); both are done when the trip on the flower is
  { name: "practise", url: "/play/?practise=ai>ae", kind: "tree-practise", title: "Practice dojo (ai), back to the World Flower, then Carry on to the map", save: FLOWER_SAVE, play: true, after: { tap: "Carry on", expect: "map" } },
  { name: "trial", url: "/play/?trial=ai>ae", kind: "tree-trial", title: "Gem Trial (ai), then its victory, then Carry on to the map", save: FLOWER_SAVE, play: true, after: { tap: "Carry on", expect: "map" } },
  // the petal panel's Practise gate, tapped for real: the panel and the flower must leave with it (they once stayed on
  // top of the dojo: two sibling children with the same key in App.tsx); then the practice, the flower, and the map
  { name: "tree-practise-tap", url: "/play/?scene=tree&gem=ai>ae&open=1", kind: "tree-practise", title: "Petal panel → Practise → the practice dojo → the flower → the map", save: FLOWER_SAVE, play: true, taps: ["Practise in the dojo"], after: { tap: "Carry on", expect: "map" } },
  // Home from the World Flower: the map, and nothing of the flower left behind
  { name: "tree-home", url: "/play/?scene=tree", kind: "tree", title: "World Flower → Home → the map", save: FLOWER_SAVE, play: true, after: { tap: "back", expect: "map" } },
  // the first minutes (docs/FIRST_MINUTES.md): the opt-in with each kind of answer (done once the first session is set
  // up and the opt-in has gone), the Sticker Book with stickers, the picture parade, and the map after the first session
  { name: "optin", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (not at school yet)", save: save({ seenPlacement: false, seenTraining: false, stars: {} }), play: true },
  { name: "optin-Y1", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (Year One)", save: save({ seenPlacement: false, seenTraining: true, stars: {} }), play: true, optin: "Y1" },
  { name: "optin-unsure", url: "/play/?scene=optin", kind: "optin", title: "Opt-in (not sure)", save: save({ seenPlacement: false, seenTraining: true, stars: {} }), play: true, optin: "unsure" },
  { name: "book-stickers", url: "/play/?scene=book", kind: "book", title: "Sticker Book with stickers", save: save({ seenBook: true, stickers: ["sun", "sock", "cat", "sausage", "moon", "fish", "dog", "flower", "sunflower", "star", "starfish", "fishdog", "am", "at"], shiny: ["fishdog"], words: { am: { n: 1, ok: 1, last: 0 }, at: { n: 1, ok: 1, last: 0 }, sun: { n: 1, ok: 1, last: 0 } } }), play: false },
  { name: "picparade", url: "/play/?scene=picparade", kind: "picparade", title: "Picture parade", play: false },
  { name: "map-warmups", url: "/play/?scene=map", kind: "map", title: "Map after the first session", save: save({ stars: { "w1-wu1": 1, "w1-wu2": 1 }, settings: { unlockAll: false } }), play: false },
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
    for (const el of targets) {
      if (el.getAttribute("aria-label") === "Help" || el.closest("[data-tap-proxy]")) continue;
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2 - sr.left) / sc, y = (r.top + r.height / 2 - sr.top) / sc;
      const inNinja = ninjaZone && x >= 0 && x <= 330 && y >= 380 && y <= 720;
      const inHelp = x >= 1116 && x <= 1280 && y >= 556 && y <= 720;
      if (inNinja || inHelp)
        out.push({ kind: "zone-conflict", sel: name(el), detail: `centre at stage ${x | 0},${y | 0} is in the ${inNinja ? "ninja zone (x 0-330, y 380-720)" : "help zone (x 1116-1280, y 556-720)"}` });
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

const SEV: Record<string, Finding["severity"]> = {
  "crash-screen": "blocker", pageerror: "blocker", stuck: "blocker", "did-not-finish": "major", "covered-target": "major", offscreen: "major", "zone-conflict": "major",
  "broken-image": "major", "junk-text": "major", "overlapping-targets": "major", "clipped-target": "minor", "tiny-target": "minor",
  "edge-target": "minor", "text-overflow": "minor", "console-error": "minor", "monkey-crash": "blocker",
  "card-box": "major", "warmup-over-cap": "major", "stacked-scenes": "blocker", "stale-scene": "blocker", "duplicate-key": "blocker",
};

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
    findings.set(sig, { sig, source: kind.startsWith("monkey") || monkey ? "bot" : "invariant", severity: SEV[kind] ?? "minor", case: c.name, title: `${kind}: ${sel}`, detail, evidence, repro: `${BASE}${c.url}` });
  };
  page.on("pageerror", (e) => add("pageerror", e.message.slice(0, 80), e.stack?.slice(0, 600) ?? e.message));
  // (React's duplicate-key warning is a blocker: two siblings with one key leave an old scene mounted over the next)
  page.on("console", (m) => m.type() === "error" && !/favicon|404|net::ERR/.test(m.text()) && add(/two children with the same key/.test(m.text()) ? "duplicate-key" : "console-error", m.text().slice(0, 80), m.text().slice(0, 400)));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save ?? save()), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript((o) => {
    (window as any).__audioLog = [];
    (window as any).__botOptIn = o;
  }, c.optin ?? "none");
  await page.goto(`${BASE}${c.url}${c.url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await page.mouse.click(VIEW.width / 2, 4);
  const pending = [...(monkey ? [] : c.taps ?? [])];
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
  const t0 = Date.now();
  let lastSig = "", lastChange = Date.now(), lastFrame = -1e9, ok = false, ticks = 0;
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
  while (Date.now() - t0 < (c.play ? MAX_MS : 12_000)) {
    if (pending.length) {
      // (let the screen settle first, as a child would: panels pop in, and the first tap only unlocks audio)
      if (Date.now() - t0 < 2500) { await page.waitForTimeout(200); continue; }
      const label = pending.shift()!;
      if (!(await realTap(label))) add("did-not-finish", `tap ${label}`, `The case's tap on "${label}" found nothing to tap.`);
      await page.waitForTimeout(1500 / FAST);
      await frame(`tapped-${label.replace(/[^a-z0-9]+/gi, "-")}`);
      continue;
    }
    if (c.play && !monkey && (await page.locator('button[aria-label="Play again"]').count())) {
      ok = true;
      // a warm-up's time governor (docs/FIRST_MINUTES.md §3 rule 10, §14): the lesson must close by its hard cap
      const wu = await page.evaluate(() => (window as any).__snWarmup ?? null).catch(() => null);
      if (wu?.key) {
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
    if (!c.play) { await page.waitForTimeout(400); continue; }
    if (monkey) {
      for (let k = 0; k < 4; k++) await page.mouse.click(10 + Math.random() * (VIEW.width - 20), 10 + Math.random() * (VIEW.height - 20)).catch(() => {});
      if (Date.now() - t0 > 45_000) { ok = true; break; }
    } else if (c.kind.startsWith("tree") && (await page.evaluate(() => (window as any).__snState?.scene === "tree" && (window as any).__snState.done === true).catch(() => false))) {
      // (a trip that has just finished: the case ends at the top of the loop; the bot mustn't tap Carry on first)
    } else await step(page).catch(() => {});
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
    const got = await page.evaluate(() => ({ scenes: [...document.querySelectorAll(".stage > .scene")].map((e) => (e as HTMLElement).className), st: (window as any).__snState ?? null })).catch(() => ({ scenes: [] as string[], st: null }));
    if (got.scenes.length !== 1) add("stacked-scenes", `after ${c.after.tap}`, `After tapping "${c.after.tap}": ${got.scenes.length} scenes on the stage (${got.scenes.join(" | ")}).`, [`cases/${tag}/${f}`]);
    if (got.st?.scene !== c.after.expect) add("stale-scene", `after ${c.after.tap}`, `After tapping "${c.after.tap}" the game publishes ${JSON.stringify(got.st)}, not scene "${c.after.expect}".`, [`cases/${tag}/${f}`]);
    for (const i of await page.evaluate(pageChecks, {}).catch(() => [] as Issue[])) add(i.kind, `${i.sel} (after ${c.after.tap})`, i.detail, [`cases/${tag}/${f}`]);
  }
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
