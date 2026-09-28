// Sound display probe (docs/SOUND_DISPLAY.md): does the child SEE a sound's petal whenever the game presents that sound?
// Bots play levels and scenes on an 844×390 phone viewport. Every time a pure sound clip (/a/p/<id>.mp3) starts, an
// in-page hook checks, at that instant, whether that sound's petal is visible: a SoundBadge (.sound-badge[data-p]), a
// BigPetal ([data-petal]), a petal on the chart scroll, or a World Flower petal showing its picture. Lines that talk
// about sounds ("It's two letters, but it's one sound", "You won back a sound!") are checked the same way. Frames are
// taken for the first few misses per context. Output: playtest/runs/sound-display/<run>/{log.json, summary.md, frames/}
// (git-ignored: the frames run to hundreds of megabytes).
// Usage: bun scripts/treadmill/sound-display.ts [--base URL | --build dir] [--port N] [--only w1-2,w2-1]
//        [--persona perfect,learner,splitter] [--fast 3] [--out dir] [--check [--findings file]]
// Where it plays (never the shared dev server unless you name it): --base URL, a server that is already up (the game's
// root, e.g. http://127.0.0.1:4704, or its /play/ URL); --build dir, a finished frozen build folder, served here with
// vite preview on --port (default 4185); neither, a fresh frozen build of the working tree (frozen.ts) on --port. It
// checks that the game answers before it starts, and exits 2 if it doesn't. Flags take `--k v` or `--k=v`.
// --check (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §4.4 F4.6, §11.3): judged by each sound clip's job (`show` in __audioLog,
// §3.1): every "petal" clip has its petal visible as it starts (100 %), no "hidden" clip shows one (0 %), and no lone
// sound is unclassified (0); and the lines that present won or two-letter sounds ("You won back a sound!", "It's two
// letters, but it's one sound.") have a petal while they are said, or a "petal" sound right after. Unclassified sounds
// that would have no petal once DEFAULT_SHOW is "petal" (integration, I.1) are listed with the SOUND_DISPLAY row they
// match. The picture size of every visible badge is measured (a phone at 844×390: want ≥ 38 CSS px). Exits 1 on a fail.
// The fast and slow checks (FIX_PLAN §13.5 FS-F4.1, TEACHER_SCRIPT §9.6), as the child sees them, in the games with a
// fast/slow moment: fs-badges (the tortoise visible and lit as every slow word, and every run of sounds after a slow
// lead-in, starts; the rabbit visible and lit on the fast word after a fast lead: the nav layer's badges, or a warm-up's
// own), fs-rabbit-size (Move 1's live rabbit at least 100 stage px) and fs-badge-overlap (the nav layer's badges never
// over ▶, the paw, a petal or the caption). What they read: the nav layer's [data-fs="tortoise"|"rabbit"] (lit: class
// "lit"; live: class "live") and __snNav.speed { shown, lit, rabbit: "live" }, and a warm-up's .wu-speed.tortoise and
// .rabbit (glow, flash or pulse).
// Personas: perfect, learner (a wrong tile on every third item), splitter (FIX_PLAN §11.3's splitter run: on the first try
// of a slot whose spelling has two or more letters it taps a tile that is part of it, bot.ts's splitStep, so the
// corrections' sounds and two-letter lines are seen; --check adds split-petal). The splitter needs two-letter spellings:
// --persona splitter --only w2-1,w3-6,w5-1,w5-6,w6-br1,w6-1,w6-2,trial.
import { chromium, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { save, step, unlockAudio } from "./bot";
import { frozen } from "./frozen";
import type { Finding } from "./types";
import { helpGuard } from "../lib/help";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

const argv = process.argv.slice(2);
/** `--k v` or `--k=v` */
const arg = (k: string, d?: string) => {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${k}`) return argv[i + 1];
    if (argv[i].startsWith(`--${k}=`)) return argv[i].slice(k.length + 3);
  }
  return d;
};
/** The game's root from a --base URL: "http://127.0.0.1:4704", ".../", ".../play/" and ".../play/index.html" all work. */
const baseOf = (url: string) => url.trim().replace(/[?#].*$/, "").replace(/\/+$/, "").replace(/\/play(\/index\.html)?$/, "").replace(/\/+$/, "");
const FAST = Number(arg("fast", "3"));
const ONLY = arg("only")?.split(",");
type Persona = "perfect" | "learner" | "splitter";
const PERSONAS = arg("persona", "perfect,learner")!.split(",") as Persona[];
for (const p of PERSONAS)
  if (!["perfect", "learner", "splitter"].includes(p)) {
    console.error(`sound-display: unknown persona "${p}" (perfect, learner, splitter)`);
    process.exit(2);
  }
const RUN = arg("out") ?? `playtest/runs/sound-display/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
const CHECK = argv.includes("--check");
const FINDINGS = arg("findings");
mkdirSync(`${RUN}/frames`, { recursive: true });

// ---- where it plays: the --base given, a --build folder served here, or a fresh frozen build (never a fallback URL)
let BASE: string;
let stopServer = () => {};
{
  const given = arg("base");
  const build = arg("build");
  const port = Number(arg("port", "4185"));
  try {
    if (given) BASE = baseOf(given);
    else {
      const f = await frozen({ port, out: build, build: !build, retry: 2, log: (s) => console.log(s) });
      BASE = f.base;
      stopServer = f.stop;
    }
  } catch (e) {
    console.error(`sound-display: ${(e as Error).message}`);
    process.exit(2);
  }
  const ok = await fetch(`${BASE}/play/`, { signal: AbortSignal.timeout(5000) }).then((r) => r.ok, () => false);
  if (!ok) {
    console.error(`sound-display: ${BASE}/play/ doesn't answer (start a frozen build: bun scripts/treadmill/frozen.ts --port N --detach, or pass --build <dir>)`);
    stopServer();
    process.exit(2);
  }
  console.log(`sound-display: playing ${BASE}/play/ → ${RUN}`);
}

const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});
type Case = { name: string; url: string; save?: object; ms?: number };
const CASES: Case[] = [
  { name: "w1-wu1", url: "/play/?level=w1-wu1" },
  { name: "w1-wu2", url: "/play/?level=w1-wu2" },
  // Reward 2 (the Sticker Book open, "They all start with... /s/", the first petal): the book has been seen before
  { name: "reward2", url: "/play/?level=w1-wu2", save: save({ seenBook: true, stickers: ["sun", "sock", "cat"] }) },
  { name: "w1-wu3", url: "/play/?level=w1-wu3" },
  { name: "w1-wu5", url: "/play/?level=w1-wu5" },
  { name: "w1-wu6", url: "/play/?level=w1-wu6" },
  { name: "w1-2", url: "/play/?level=w1-2" },
  { name: "w1-4", url: "/play/?level=w1-4" },
  { name: "w1-6", url: "/play/?level=w1-6" },
  { name: "w1-7", url: "/play/?level=w1-7" },
  { name: "w1-8", url: "/play/?level=w1-8" },
  { name: "w1-9", url: "/play/?level=w1-9" },
  { name: "w1-14", url: "/play/?level=w1-14" },
  { name: "w2-1", url: "/play/?level=w2-1" },
  { name: "w3-6", url: "/play/?level=w3-6" },
  { name: "w5-1", url: "/play/?level=w5-1" },
  { name: "w5-6", url: "/play/?level=w5-6" },
  { name: "w6-br1", url: "/play/?level=w6-br1" },
  { name: "w6-1", url: "/play/?level=w6-1" },
  { name: "w6-2", url: "/play/?level=w6-2" },
  { name: "placement", url: "/play/?scene=placement", save: save({ seenPlacement: false }) },
  { name: "training", url: "/play/?scene=training", save: save({ seenTraining: false }) },
  { name: "flower-intro", url: "/play/?scene=tree", save: save({ seenFlower: false }) },
  { name: "tree-free", url: "/play/?scene=tree", save: FLOWER_SAVE, ms: 25_000 },
  { name: "tree-petal", url: "/play/?scene=tree&gem=ai>ae&open=1", save: FLOWER_SAVE, ms: 25_000 },
  { name: "tree-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", save: FLOWER_SAVE },
  { name: "tree-found-th", url: "/play/?scene=tree&visit=spelling:th>dh", save: FLOWER_SAVE },
  { name: "tree-world", url: "/play/?scene=tree&visit=world:3", save: FLOWER_SAVE },
  { name: "tree-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", save: FLOWER_SAVE },
  { name: "trial", url: "/play/?trial=ai>ae", save: FLOWER_SAVE },
  // the nav layer's tortoise and rabbit on their own (NavDemo ?fs=1: Move 1 on "cat", then Move 5): the fast/slow
  // checks' self-test, whatever the scenes do yet
  { name: "fs-demo", url: "/play/?scene=nav-demo&fs=1", ms: 40_000 },
  { name: "fs-demo-column", url: "/play/?scene=nav-demo&fs=1&at=column", ms: 40_000 },
].filter((c) => !ONLY || ONLY.includes(c.name));

/** lines that talk about a sound: when one plays, is a petal on screen? */
const SOUND_TALK = LINES.filter((l) => /\bsounds?\b|\bpetals?\b/i.test(l.text)).map((l) => l.id);
const DURS: Record<string, number> = JSON.parse(readFileSync(new URL("../../public/a/durations.json", import.meta.url), "utf8"));
const TALK_DUR = Object.fromEntries(SOUND_TALK.map((id) => [id, DURS[`l/${id}`] ?? 1500]));
/** Of those, the lines that present a sound the child must see (--check): the reward's won sounds (SD r58) and the
 *  two-letter lines (SD r28, Dec4: they end on the sound, with its petal). */
const TALK_NEEDS_PETAL = /^(petals?_got|tv_won_.*|t_two_letters|st_two_letters_too|two_letters_one_sound|t_three_letters|t_four_letters)$/;
/** The read-back's slow lead-ins and fast leads (TEACHER_SCRIPT §9.4, script-audit's FS_SLOW_LEADS / FS_FAST_LEADS);
 *  here the stuck lines lead a slow slot too (`tv_fs_stuck_push` + the sounds). */
const FS_SLOW_LEADS = ["tv_fs_say_sounds_slow", "tv_fs_say_slow", "tv_fs_slow_tortoise", "tv_fs_stuck_slow", "tv_fs_stuck_again", "tv_fs_stuck_push"];
const FS_FAST_LEADS = ["tv_fs_rabbit_read", "fm_tap_rabbit", "tv_fs_now_fast", "tv_fs_fast_rabbit"];
/** The games with a fast/slow moment (TEACHER_SCRIPT §9.3), by `__snState.game`, else the scene or the warm-up's beat. */
const FS_SCENES = ["fastslow", "slowpick", "tapall:in", "tapall", "sounds", "dots", "pick", "firstsound", "soundhunt", "build", "read", "readcheck", "battle", "boss", "review", "trial", "swap", "run", "story", "fs-demo"];

type Ev = {
  /** "split": the splitter's deliberate split (p: the spelling it needed, line: the tile it tapped) */
  t: number; kind: "sound" | "talk" | "slow" | "fast" | "split"; p: string; line?: string; prev: string | null; seen: boolean; how: string | null; others: string[];
  scene: string | null; route: string | null; pres: string | null; navSound: string | null; blend: boolean; persona?: string; case?: string; frame?: string;
  /** the clip's job (§3.1: petal, tile, hidden, unclassified; absent on builds before F1.0), and ms its cue waited */
  show?: string; cued?: number;
  /** the smallest picture of a visible non-mini badge on screen as the clip started (CSS px) */
  pic?: number | null;
  /** a talk line: a petal visible when it ended, and a "petal" sound within 1.5 s after it */
  seenEnd?: boolean; petalAfter?: boolean;
  /** a slow slot (kind "slow": a slow word, or a sound after a slow lead-in) or a fast word after a fast lead (kind
   *  "fast"): the game, the badges lit as it started or 150 ms in, and whether a tortoise / rabbit was on screen */
  game?: string | null; lit?: string[]; shownSlow?: boolean; shownFast?: boolean;
};
/** One look at the nav layer's fast/slow badges (the Node loop's, a few times a second): the live rabbit's size in
 *  stage px, and what a badge covers. */
type FsLook = { case?: string; persona?: string; scene: string | null; live: number | null; overlaps: string[] };

/** The nav layer's fast/slow badges right now (TEACHER_SCRIPT §9.6), or null when none is on screen: the live rabbit's
 *  size in stage px once it has finished growing (null when it isn't live, or still animating), and what a badge
 *  covers (▶, the paw, a petal, the caption; more than 16 CSS px² of overlap). */
function fsLook(): { scene: string | null; live: number | null; overlaps: string[] } | null {
  const w = window as any;
  const vis = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
    for (let e: Element | null = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
    }
    return true;
  };
  const badges = [...document.querySelectorAll("[data-fs], [data-speed]")].filter(vis);
  if (!badges.length) return null;
  const stage = document.querySelector(".stage");
  const sc = stage ? stage.getBoundingClientRect().width / 1280 : 1;
  const isRabbit = (b: Element) => b.getAttribute("data-fs") === "rabbit" || b.getAttribute("data-speed") === "fast";
  const isLive = (b: Element) => { const d = b.getAttribute("data-live"); return (d !== null && d !== "false") || /\blive\b/.test(b.getAttribute("class") ?? ""); };
  const rabbit = badges.find((b) => isRabbit(b) && (isLive(b) || w.__snNav?.speed?.rabbit === "live" || w.__snNav?.speed?.live === true));
  let settling = false;
  for (let e: Element | null = rabbit ?? null; e && e !== document.body; e = e.parentElement) if (e.getAnimations().some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime as number))) settling = true;
  const live = rabbit && !settling ? Math.round(Math.min(rabbit.getBoundingClientRect().width, rabbit.getBoundingClientRect().height) / sc) : null;
  const others: [string, string][] = [["▶", '[data-nav="next"]'], ["the paw", '[data-nav="show"], .demo-paw, div[style*="taphint"]'], ["a petal", ".sound-badge, [data-petal]"], ["the caption", ".bubble"]];
  const overlaps = new Set<string>();
  for (const b of badges) {
    const r = b.getBoundingClientRect();
    for (const [name, sel] of others)
      for (const o of document.querySelectorAll(sel)) {
        if (!vis(o) || o.contains(b) || b.contains(o)) continue;
        const q = o.getBoundingClientRect();
        const a = Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)) * Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top));
        if (a > 16) overlaps.add(`the ${isRabbit(b) ? "rabbit" : "tortoise"} over ${name}`);
      }
  }
  return { scene: w.__snState?.scene ?? null, live, overlaps: [...overlaps] };
}

async function play(page: Page, c: Case, persona: Persona, looks: FsLook[]) {
  // (bot.ts reads window.__botPersona once per page: the splitter splits two-letter spellings; the others are the default child)
  await page.addInitScript((p) => void ((window as any).__botPersona = p), persona === "splitter" ? "splitter" : null);
  await page.addInitScript(({ talk, dur, fast, slowLeads, fastLeads, fsScenes }: { talk: string[]; dur: Record<string, number>; fast: number; slowLeads: string[]; fastLeads: string[]; fsScenes: string[] }) => {
    const w = window as any;
    w.__sdDur = dur;
    w.__sdFast = fast;
    const TALK = new Set(talk);
    const log: any[] = [];
    w.__sdLog = log;
    let prev: string | null = null, prevT = 0, prevWasSound = false;
    const vis = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
      }
      return true;
    };
    /** Every sound petal on screen right now (with its picture), and how it is drawn. */
    const petals = () => {
      const out: { p: string; how: string }[] = [];
      document.querySelectorAll(".sound-badge[data-p]").forEach((e) => vis(e) && out.push({ p: e.getAttribute("data-p")!, how: `SoundBadge ${Math.round(e.getBoundingClientRect().width)}px` }));
      document.querySelectorAll("[data-petal]").forEach((e) => vis(e) && out.push({ p: e.getAttribute("data-petal")!, how: `BigPetal ${Math.round(e.getBoundingClientRect().width)}px` }));
      document.querySelectorAll('[role="button"][data-p]').forEach((e) => vis(e) && e.querySelector("img") && out.push({ p: e.getAttribute("data-p")!, how: "ScrollPetal" }));
      document.querySelectorAll("svg path[data-p]").forEach((e) => {
        const g = e.parentElement;
        if (g && g.querySelector("image") && vis(e)) out.push({ p: e.getAttribute("data-p")!, how: `WorldFlower petal ${Math.round(e.getBoundingClientRect().width)}px` });
      });
      return out;
    };
    const ctx = () => ({ scene: w.__snState?.scene ?? null, route: w.__snRoute ? String(w.__snRoute) : null, pres: w.__snNav?.pres ? `${w.__snNav.pres.id}#${w.__snNav.pres.step}` : null, navSound: w.__snNav?.sound ?? null });
    // ---- the tortoise and the rabbit (TEACHER_SCRIPT §9.6)
    const gameNow = (): string | null => {
      const st = w.__snState ?? {};
      return st.game ?? (st.scene === "warmup" ? st.beat ?? null : st.scene ?? null);
    };
    const litEl = (el: Element) => {
      const c = el.getAttribute("class") ?? "";
      if (el.matches(".wu-speed")) return /\b(glow|flash|pulse)\b/.test(c);
      const d = el.getAttribute("data-lit");
      return /\blit\b/.test(c) || (d !== null && d !== "false" && d !== "0");
    };
    const fsNow = () => {
      const slow = [...document.querySelectorAll('[data-fs="tortoise"], [data-speed="slow"], .wu-speed.tortoise')].filter(vis);
      const fastEls = [...document.querySelectorAll('[data-fs="rabbit"], [data-speed="fast"], .wu-speed.rabbit')].filter(vis);
      const lit: string[] = [];
      const sp = w.__snNav?.speed;
      if (sp && sp.shown !== false && typeof sp.lit === "string" && (sp.lit === "slow" ? slow.length : fastEls.length)) lit.push(sp.lit);
      if (slow.some(litEl) && !lit.includes("slow")) lit.push("slow");
      if (fastEls.some(litEl) && !lit.includes("fast")) lit.push("fast");
      return { lit, shownSlow: slow.length > 0, shownFast: fastEls.length > 0 };
    };
    /** a slow slot or a fast word, in a game with a fast/slow moment: what was lit as it started, and 150 ms in */
    const fsEvent = (kind: "slow" | "fast", word: string, now: number) => {
      const game = gameNow();
      if (!game || !fsScenes.includes(game)) return;
      const e: any = { t: now, kind, p: word, prev, seen: false, how: null, others: [], blend: false, game, ...fsNow(), ...ctx() };
      setTimeout(() => {
        const again = fsNow();
        for (const x of again.lit) if (!e.lit.includes(x)) e.lit.push(x);
        e.shownSlow ||= again.shownSlow;
        e.shownFast ||= again.shownFast;
      }, 150);
      log.push(e);
    };
    /** the last line said and when (a fast lead's word may wait for the rabbit's tap: up to 12 game seconds) */
    let lastLine: { id: string; t: number } | null = null;
    let slowRun = 0;
    /** the smallest picture of a visible badge that isn't a mini or a caption's still petal (CSS px), or null */
    const pic = () => {
      let min: number | null = null;
      document.querySelectorAll(".sound-badge").forEach((b) => {
        if (b.classList.contains("still") || b.classList.contains("mini") || b.getAttribute("data-tier") === "mini" || !vis(b)) return;
        const img = b.querySelector("img");
        if (!img) return;
        const r = img.getBoundingClientRect();
        const s = Math.min(r.width, r.height);
        if (s > 0 && (min === null || s < min)) min = Math.round(s);
      });
      return min;
    };
    let lastTalk: any = null;
    const arr: any[] = [];
    arr.push = function (...items: any[]) {
      for (const it of items) {
        const url: string = it?.url ?? "";
        let m = url.match(/\/a\/p\/([^/]+)\.mp3/);
        const now = performance.now();
        if (m) {
          const p = m[1];
          const all = petals();
          const mine = all.find((x) => x.p === p);
          const blend = prevWasSound && now - prevT < 1500;
          const e: any = { t: now, kind: "sound", p, prev, seen: !!mine, how: mine?.how ?? null, others: all.filter((x) => x.p !== p).map((x) => x.p), blend, show: it?.show, cued: it?.cued, pic: pic(), ...ctx() };
          // (a petal's pop rises as its clip is cued: look again 50 ms in, as the sweep's sound-without-petal does)
          if (!e.seen && it?.show === "petal") setTimeout(() => { const again = petals().find((x) => x.p === p || (p === "ks" && x.p === "k")); if (again) (e.seen = true), (e.how = `${again.how} (+50 ms)`); }, 50);
          if (lastTalk && it?.show === "petal" && now - lastTalk.end < 1500) lastTalk.petalAfter = true;
          log.push(e);
          // the sounds after a slow lead-in are a slow slot (the first of them; the run ends at the next line or word)
          if (slowRun && now - slowRun < 6000 / (w.__sdFast ?? 1)) {
            fsEvent("slow", p, now);
            slowRun = 0;
          }
          prevWasSound = true;
          prevT = now;
          continue;
        }
        m = url.match(/\/a\/l\/([^/]+)\.mp3/);
        if (m) {
          const id = m[1];
          if (TALK.has(id)) {
            const all = petals();
            const e: any = { t: now, kind: "talk", p: all[0]?.p ?? "", line: id, prev, seen: all.length > 0, how: all[0]?.how ?? null, others: all.slice(1).map((x) => x.p), blend: false, pic: pic(), ...ctx() };
            const d = (w.__sdDur?.[id] ?? 1500) / (w.__sdFast ?? 1);
            e.end = now + d;
            setTimeout(() => void (e.seenEnd = petals().length > 0), Math.max(0, d - 80));
            lastTalk = e;
            log.push(e);
          }
          prev = id;
          prevWasSound = false;
          prevT = now;
          lastLine = { id, t: now };
          slowRun = slowLeads.includes(id) ? now : 0;
        } else if (/\/a\/(w|x|o|s)\//.test(url)) {
          const word = decodeURIComponent(url.split("/").pop()!.replace(/\.mp3.*$/, ""));
          // every slow word is a slow slot; the first word after a fast lead is the fast word (`prev`: the line before)
          if (/\/a\/x\//.test(url)) fsEvent("slow", word, now);
          if (/\/a\/w\//.test(url) && lastLine && fastLeads.includes(lastLine.id) && now - lastLine.t < 20000 / (w.__sdFast ?? 1)) {
            fsEvent("fast", word, now);
            lastLine = null;
          }
          slowRun = 0;
          prev = url.split("/").slice(-2).join("/").replace(".mp3", "");
          prevWasSound = false;
        }
      }
      return Array.prototype.push.apply(this, items);
    };
    w.__audioLog = arr;
  }, { talk: SOUND_TALK, dur: TALK_DUR, fast: FAST, slowLeads: FS_SLOW_LEADS, fastLeads: FS_FAST_LEADS, fsScenes: FS_SCENES });
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save ?? save()), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
  await page.goto(`${BASE}${c.url}&fast=${FAST}`);
  await unlockAudio(page); // (not a click at the top: it landed on whatever was there)
  const t0 = Date.now();
  let seenN = 0, item = 0, endAt = 0;
  const shots = new Map<string, number>();
  const frames: (string | undefined)[] = [];
  while (Date.now() - t0 < (c.ms ?? 170_000)) {
    // after the level: stay on the reward a while (what it says about sounds), then stop. (The Sticker Book reward's
    // steps hold on Next: the bot taps it, so its steps play through too.)
    if (!endAt && (await page.locator('button[aria-label="Play again"]').count())) endAt = Date.now();
    if (endAt && Date.now() - endAt > (c.name === "reward2" ? 40_000 : 9000)) break;
    const log: Ev[] = await page.evaluate(() => (window as any).__sdLog ?? []).catch(() => []);
    for (const [j, e] of log.slice(seenN).entries()) {
      // a frame for the first two events per (scene, lead line, kind, seen): what the child saw as the sound played
      const k = `${e.kind}|${e.scene}|${e.line ?? e.prev}|${e.seen}|${e.blend}`;
      const n = shots.get(k) ?? 0;
      if (n < (e.seen ? 1 : 2)) {
        shots.set(k, n + 1);
        const file = `${c.name}-${persona}-${String(seenN + j).padStart(3, "0")}-${e.kind}-${e.p || e.line}-${e.seen ? "petal" : "NONE"}.png`;
        await page.screenshot({ path: `${RUN}/frames/${file}` }).catch(() => {});
        frames[seenN + j] = file;
      }
    }
    seenN = log.length;
    if (endAt) {
      // Reward 2's held steps: Next once each step has finished (the stickers, then the first petal)
      if (c.name === "reward2" && (await page.evaluate(() => (window as any).__snNav?.next === "ready").catch(() => false)))
        await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
      await page.waitForTimeout(250);
      continue;
    }
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    if (persona === "learner" && st.next && !st.busy && ++item % 3 === 0) {
      const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"]), .wu-slot:not(.out) button:not([aria-label="${st.next}"])`).first();
      if (await wrong.count()) {
        await wrong.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
        await page.waitForTimeout(900);
      }
    }
    // the free World Flower: open a petal, then its panel, as a child exploring would
    if (c.name === "tree-free" && Date.now() - t0 > 6000 && Date.now() - t0 < 6400) await page.locator('svg path[data-p="a"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    // the fast/slow badges before the bot taps (it taps a live rabbit once it has grown: bot.ts)
    const look = await page.evaluate(fsLook).catch(() => null);
    if (look && (look.live !== null || look.overlaps.length)) {
      looks.push({ ...look, case: c.name, persona });
      if (look.overlaps.length && !shots.has(`fs|${look.overlaps.join()}`)) {
        shots.set(`fs|${look.overlaps.join()}`, 1);
        await page.screenshot({ path: `${RUN}/frames/${c.name}-${persona}-fs-overlap.png` }).catch(() => {});
      }
    }
    await step(page).catch(() => {});
    await page.waitForTimeout(200);
  }
  // the final record of every event (a petal that rose 50 ms into its clip, a talk line's end are filled in later)
  await page.waitForTimeout(400);
  const final: Ev[] = await page.evaluate(() => (window as any).__sdLog ?? []).catch(() => []);
  const evs: Ev[] = final.map((e, i) => ({ ...e, ...(frames[i] ? { frame: frames[i] } : {}), persona, case: c.name }));
  // the splitter's splits (bot.ts logs them on Date.now(); the log is on performance.now())
  const sp = await page.evaluate(() => ({ splits: ((window as any).__botSplits ?? []) as { t: number; tapped: string; next: string; word: string | null }[], off: Date.now() - performance.now() })).catch(() => ({ splits: [], off: 0 }));
  for (const x of sp.splits) evs.push({ t: x.t - sp.off, kind: "split", p: x.next, line: x.tapped, prev: x.word, seen: false, how: null, others: [], scene: null, route: null, pres: null, navSound: null, blend: false, persona, case: c.name });
  if (!evs.length || !evs.some((e) => e.frame)) await page.screenshot({ path: `${RUN}/frames/${c.name}-${persona}-end.png` }).catch(() => {});
  return evs;
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const all: Ev[] = [];
const looks: FsLook[] = [];
const jobs = PERSONAS.flatMap((persona) => CASES.map((c) => ({ c, persona })));
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < jobs.length) {
      const { c, persona } = jobs[next++];
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
      const page = await ctx.newPage();
      const evs = await play(page, c, persona, looks).catch((e) => (console.log(`${c.name} ${persona}: ERROR ${String(e).slice(0, 200)}`), [] as Ev[]));
      all.push(...evs);
      await ctx.close();
      const s = evs.filter((e) => e.kind === "sound");
      const splits = evs.filter((e) => e.kind === "split").length;
      console.log(`${persona} ${c.name}: ${s.length} sounds, ${s.filter((e) => !e.seen && !e.blend).length} alone without a petal, ${s.filter((e) => e.blend).length} in blends${persona === "splitter" ? `, ${splits} splits` : ""}`);
    }
  }),
);
await b.close();
stopServer();
writeFileSync(`${RUN}/log.json`, JSON.stringify(all, null, 1));
writeFileSync(`${RUN}/fs-looks.json`, JSON.stringify(looks, null, 1));

// ---- summary: per case, per context (scene + the line said before the sound), how often the petal was there
const rows = new Map<string, { case: string; scene: string | null; ctx: string; kind: string; show: string; n: number; seen: number; blend: number; how: Set<string>; ps: Set<string>; frame?: string }>();
for (const e of all) {
  if (e.kind === "slow" || e.kind === "fast" || e.kind === "split") continue;
  const ctxt = e.kind === "talk" ? `line ${e.line}` : e.blend ? "(inside a blend: sound after sound)" : `after ${e.prev ?? "(nothing)"}`;
  const job = e.kind === "talk" ? "" : e.show ?? "(no job logged)";
  const k = `${e.case}|${e.scene}|${ctxt}|${e.kind}|${job}`;
  const r = rows.get(k) ?? { case: e.case!, scene: e.scene, ctx: ctxt, kind: e.kind, show: job, n: 0, seen: 0, blend: 0, how: new Set<string>(), ps: new Set<string>() };
  r.n++;
  if (e.seen) r.seen++;
  if (e.blend) r.blend++;
  if (e.how) r.how.add(e.how.replace(/ \d+px/, ""));
  if (e.p) r.ps.add(e.p);
  if (!r.frame && e.frame) r.frame = e.frame;
  rows.set(k, r);
}
const lines = [
  "# Sound display probe",
  "",
  `Run ${RUN}, fast=${FAST}, 844×390, personas: ${PERSONAS.join(", ")}. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.`,
  "",
  "| case | scene | context | kind | job | sounds | petal visible | drawn as | frame |",
  "|---|---|---|---|---|---|---|---|---|",
  ...[...rows.values()].sort((a, b) => a.case.localeCompare(b.case) || b.n - b.seen - (a.n - a.seen)).map((r) => `| ${r.case} | ${r.scene ?? ""} | ${r.ctx} | ${r.kind} ${[...r.ps].slice(0, 6).join(" ")} | ${r.show} | ${r.n} | ${r.seen}/${r.n} | ${[...r.how].join(", ")} | ${r.frame ? `frames/${r.frame}` : ""} |`),
];
writeFileSync(`${RUN}/summary.md`, lines.join("\n") + "\n");
const s = all.filter((e) => e.kind === "sound" && !e.blend);
console.log(`→ ${RUN}: ${s.length} sounds said on their own, petal visible for ${s.filter((e) => e.seen).length}`);

// ---- --check (FIX_PLAN §4.4 F4.6, §11.3)
if (CHECK) {
  /** The SOUND_DISPLAY §3 row a missing petal matches, where it is one the plan names (§5.4). */
  const sdRow = (e: Ev) =>
    e.kind === "talk" && /^(petals?_got|tv_won_)/.test(e.line ?? "") ? "SD r58 (the reward's won sounds)"
      : e.kind === "talk" && /letters/.test(e.line ?? "") ? "SD r28 (the read-back's two-letter line)"
      : e.kind === "sound" && /^(t_two_letters|t_three_letters|t_four_letters|two_letters_one_sound|st_two_letters_too)$/.test(e.prev ?? "") ? "SD r28 (the two-letter line's sound, Dec4)"
      : e.scene === "find" && /^(thats|tv_thats_write)$/.test(e.prev ?? "") ? "SD r23 (Find's wrong tile)"
      : e.case === "w3-6" && e.scene === "learn" && (e.p === "k" || e.p === "s") ? "SD r19 (< x >: /k/ + /s/)"
      : e.case === "w5-1" && e.p === "th" ? "SD r20 (< th >: /th/ beside /dh/)"
      : "";
  const ctxOf = (e: Ev) => `${e.case} ${e.scene ?? ""} ${e.kind === "talk" ? `‹${e.line}›` : `/${e.p}/ after ‹${e.prev ?? "(nothing)"}›`}`;
  const group = (xs: Ev[]) => {
    const m = new Map<string, { n: number; e: Ev }>();
    for (const e of xs) m.set(ctxOf(e), { n: (m.get(ctxOf(e))?.n ?? 0) + 1, e: m.get(ctxOf(e))?.e ?? e });
    return [...m].sort((a, b) => b[1].n - a[1].n).map(([k, { n, e }]) => `${k} ×${n}${sdRow(e) ? ` = ${sdRow(e)}` : ""}${e.frame ? ` (frames/${e.frame})` : ""}`);
  };
  const sounds = all.filter((e) => e.kind === "sound");
  const logged = sounds.some((e) => e.show !== undefined);
  const petal = sounds.filter((e) => e.show === "petal");
  const hidden = sounds.filter((e) => e.show === "hidden");
  const unclassified = sounds.filter((e) => e.show === undefined || e.show === "unclassified");
  const talk = all.filter((e) => e.kind === "talk" && TALK_NEEDS_PETAL.test(e.line ?? ""));
  const talkBad = talk.filter((e) => !e.seen && !e.seenEnd && !e.petalAfter);
  const wouldBe = unclassified.filter((e) => !e.seen && !e.blend);
  const pics = all.filter((e) => e.pic != null);
  const small = pics.filter((e) => e.pic! < 38);
  type M = { id: string; row: string; value: string; target: string; pass: boolean | null; detail: string[] };
  const M: M[] = [
    { id: "petal-visible", row: "\"petal\" clips with their petal visible as they start", value: petal.length ? `${petal.filter((e) => e.seen).length} of ${petal.length}` : "no petal clips", target: "100 %", pass: petal.length ? petal.every((e) => e.seen) : null, detail: group(petal.filter((e) => !e.seen)) },
    { id: "petal-for-hidden", row: "\"hidden\" clips with a petal of their sound visible", value: hidden.length ? `${hidden.filter((e) => e.seen).length} of ${hidden.length}` : "no hidden clips", target: "0 %", pass: hidden.length ? !hidden.some((e) => e.seen) : null, detail: group(hidden.filter((e) => e.seen)) },
    { id: "unclassified", row: "sounds with no job (§3.1)", value: `${unclassified.length} of ${sounds.length}${logged ? "" : " (this build logs no jobs: before F1.0)"}`, target: "0", pass: unclassified.length === 0, detail: [`${wouldBe.length} of them would show no petal once DEFAULT_SHOW is "petal" (plan I.1):`, ...group(wouldBe)] },
    { id: "talk-without-petal", row: "\"You won back…\" and two-letter lines with no petal (SD r58, r28)", value: `${talkBad.length} of ${talk.length}`, target: "0", pass: talk.length ? talkBad.length === 0 : null, detail: group(talkBad) },
    { id: "petal-picture-size", row: "visible badge pictures (non-mini), smallest, at 844×390", value: pics.length ? `min ${Math.min(...pics.map((e) => e.pic!))} px; ${small.length} of ${pics.length} clips with one < 38 px` : "no badges measured", target: "≥ 38 px (report only)", pass: null, detail: group(small).slice(0, 6) },
  ];
  // ---- split-petal: the splitter's corrections (FIX_PLAN §11.3's splitter run; SD r28, Dec4): after each deliberate
  // split, the correction's sounds ("That's… /s/ We need… /sh/") and its two-letter line ("It's two letters, but it's one
  // sound.") each with its petal, in the 15 game seconds after the split (or up to the next one). A split with no sound or
  // two-letter line after it is listed, but the words are script-audit's split-correction to judge, not this check.
  if (PERSONAS.includes("splitter")) {
    const splits = all.filter((e) => e.kind === "split").sort((a, b) => a.case!.localeCompare(b.case!) || a.t - b.t);
    const res = splits.map((s, i) => {
      const nextSplit = splits[i + 1]?.case === s.case ? splits[i + 1].t : Infinity;
      const until = Math.min(s.t + 15000 / FAST, nextSplit);
      const win = all.filter((e) => e.case === s.case && e.persona === s.persona && e.t > s.t && e.t < until);
      const snd = win.filter((e) => e.kind === "sound" && e.show === "petal" && !e.blend);
      const talk = win.filter((e) => e.kind === "talk" && TALK_NEEDS_PETAL.test(e.line ?? "") && /letters/.test(e.line ?? ""));
      // (the two-letter line is about the sound "We need…" named: its petal, /ch/, not only the tapped part's /h/)
      const needed = snd.find((e) => e.prev === "we_need" || e.prev === "tv_we_need")?.p;
      const lineOk = (e: Ev) => (needed && e.seen ? e.p === needed || e.others.includes(needed) : e.seen || !!e.seenEnd || !!e.petalAfter);
      const missing = [...snd.filter((e) => !e.seen).map((e) => `/${e.p}/ after ‹${e.prev ?? "?"}›`), ...talk.filter((e) => !lineOk(e)).map((e) => `‹${e.line}›${needed ? ` without /${needed}/` : ""}`)];
      return { s, snd, talk, missing, silent: !snd.length && !talk.length };
    });
    const bad = res.filter((r) => r.missing.length);
    const silent = res.filter((r) => r.silent);
    M.push({
      id: "split-petal",
      row: "the splitter's corrections: every sound and two-letter line after a split with its petal",
      value: splits.length ? `${res.length - bad.length} of ${splits.length} splits (${res.filter((r) => r.talk.length).length} with a two-letter line; ${silent.length} with neither a sound nor the line after them)` : "the splitter never split",
      target: "100 %",
      pass: splits.length ? bad.length === 0 : null,
      detail: [
        ...bad.map((r) => `${r.s.case} < ${r.s.line} > for < ${r.s.p} > (${r.s.prev ?? "?"}): no petal for ${r.missing.join(", ")}`),
        ...silent.map((r) => `${r.s.case} < ${r.s.line} > for < ${r.s.p} > (${r.s.prev ?? "?"}): no sound or two-letter line in the 15 game seconds after it`),
      ],
    });
  }
  // ---- the fast and slow checks (TEACHER_SCRIPT §9.6, FIX_PLAN §13.5 FS-F4.1)
  {
    const slow = all.filter((e) => e.kind === "slow"), fast = all.filter((e) => e.kind === "fast");
    const darkS = slow.filter((e) => !e.lit?.includes("slow")), darkF = fast.filter((e) => !e.lit?.includes("fast"));
    const fsCtx = (e: Ev, which: string) => `${e.case} ${e.game ?? e.scene ?? ""} ${e.kind === "slow" ? (e.prev && FS_SLOW_LEADS.includes(e.prev) ? `/${e.p}/ after ‹${e.prev}›` : `[${e.p}, slowly]`) : `[${e.p}] after ‹${e.prev ?? "?"}›`}: the ${which} ${e.kind === "slow" ? (e.shownSlow ? "on screen but not lit" : "not on screen") : e.shownFast ? "on screen but not lit" : "not on screen"}`;
    const byCtx = (xs: Ev[], which: string) => {
      const m = new Map<string, number>();
      for (const e of xs) m.set(fsCtx(e, which), (m.get(fsCtx(e, which)) ?? 0) + 1);
      return [...m].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ×${n}`);
    };
    M.push({ id: "fs-badges", row: "the tortoise lit as every slow slot starts, the rabbit on the fast word after a fast lead (games with a fast/slow moment)", value: slow.length + fast.length ? `tortoise ${slow.length - darkS.length} of ${slow.length}, rabbit ${fast.length - darkF.length} of ${fast.length}` : "no slow slots", target: "100 %", pass: slow.length + fast.length ? !darkS.length && !darkF.length : null, detail: [...byCtx(darkS, "tortoise"), ...byCtx(darkF, "rabbit")] });
    const live = looks.filter((l) => l.live !== null);
    const tiny = live.filter((l) => l.live! < 100);
    M.push({ id: "fs-rabbit-size", row: "Move 1's live rabbit, grown (stage px)", value: live.length ? `min ${Math.min(...live.map((l) => l.live!))} px in ${live.length} looks` : "never live", target: "≥ 100 stage px", pass: live.length ? !tiny.length : null, detail: [...new Set(tiny.map((l) => `${l.case} ${l.scene ?? ""}: ${l.live} px`))].slice(0, 8) });
    const over = looks.filter((l) => l.overlaps.length);
    M.push({ id: "fs-badge-overlap", row: "the nav layer's tortoise or rabbit over ▶, the paw, a petal or the caption", value: String(new Set(over.map((l) => `${l.case}|${l.overlaps.join()}`)).size), target: "0", pass: over.length === 0, detail: [...new Set(over.map((l) => `${l.case} ${l.scene ?? ""} (${l.persona}): ${l.overlaps.join(", ")} (frames/${l.case}-${l.persona}-fs-overlap.png)`))].slice(0, 8) });
  }
  const v = (m: M) => (m.pass === null ? "n/a" : m.pass ? "pass" : "**FAIL**");
  const md = ["# Sound display: --check", "", `Run ${RUN}, cases ${[...new Set(all.map((e) => e.case))].join(", ")}, personas ${PERSONAS.join(", ")}.`, "", "| Metric | Target | Value | Verdict |", "|---|---|---|---|", ...M.map((m) => `| \`${m.id}\` ${m.row} | ${m.target} | ${m.value} | ${v(m)} |`), "", ...M.filter((m) => m.detail.length).flatMap((m) => [`## ${m.id}`, "", ...m.detail.slice(0, 40).map((d) => `- ${d}`), ""])].join("\n");
  writeFileSync(`${RUN}/check.md`, md + "\n");
  console.log(md);
  const fails = M.filter((m) => m.pass === false);
  const findings: Finding[] = fails.map((m) => ({ sig: `sound:${m.id}`, source: "sound", severity: "major", case: "sound-display", title: `sound:${m.id}: ${m.row}`, detail: `Target ${m.target}; ${m.value}. ${m.detail.slice(0, 4).join("; ")}`, evidence: [`${RUN}/check.md`] }));
  if (FINDINGS) writeFileSync(FINDINGS, JSON.stringify(findings, null, 1));
  console.log(fails.length ? `\n${fails.length} failed: ${fails.map((m) => m.id).join(", ")}` : "\nall targets met");
  process.exitCode = fails.length ? 1 : 0;
}
