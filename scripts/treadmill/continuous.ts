// One continuous journey in ONE page, as a child really plays it: a brand-new child from the title tap through the
// first minutes (film, choose, opt-in, dojo welcome, W1, Sticker Book, W2, map), then every next stone from the map in
// order, with the rewards, World Flower trips and map walks between them. Nothing is reloaded between levels, so the
// in-memory state a real session builds up (teach.ts rotation counts, narrate.tsx's per-level caps, the streak, the
// particle layer) carries over exactly as it would on a phone. This is the transcript to read for repetition across
// levels ("A, two letters, one sound, A, two letters, one sound") that the one-level-per-page transcript.ts can't show.
//
// Records every clip said (line id and text, pure sounds, words, stretched words), every tap, every scene change, and
// which lines were CUT OFF (the next speech clip started before this clip's recorded duration had run: durations.json),
// plus a DOM-size sample every 10 game seconds (a cheap leak signal for the performance work).
// For scripts/treadmill/script-audit.ts --check (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §4.4 F4.4, §13 TV-F4.2) it also
// records: the route (window.__snRoute) and the game (TEACHER_SCRIPT §2.6's ids: __snState.game, else from the scene and
// the warm-up beat) as they change; each question as it opens (`turn`: __snState.next set and not busy); every held
// step (`hold`: __snNav.next "ready", with how it ended; a Ready is a hold whose id starts "ready:"); each sound clip's
// job (`show`) and the route it started on; right/wrong sounds (`sfx`); whether the scene was busy at each tap; the
// game's nav log (every entry, not just the last 500); the splitter's deliberate splits and paw moves. For the fast and
// slow checks (FIX_PLAN §13.5, TEACHER_SCRIPT §9.6): the nav log's `speed` (the tortoise or the rabbit lit) and `rabbit`
// (Move 1's join-in resolved) entries as events, and on every speech clip `lit`: which of the tortoise and the rabbit were
// lit as it started (sampled then and 150 ms in: the nav layer's badges, [data-fs="tortoise"|"rabbit"] with class "lit"
// or __snNav.speed.lit while they are drawn, or a warm-up's own .wu-speed buttons glowing).
//
// Personas: perfect, learner (about 1 in 3 first tries wrong), splitter (a learner's pace, and on the first try of any
// slot whose spelling has two or more letters it taps a tile that is part of it, wherever it is on screen: bot.ts),
// watcher (taps the paw once at every Ready hold: bot.ts).
//
// Output: playtest/transcripts/<out>/continuous-<persona>.{md,json}
// Usage: bun scripts/treadmill/continuous.ts [--base http://localhost:5173] [--persona learner,perfect] [--levels 12]
//        [--optin none] [--from w5-1] [--fast 4] [--out playtest/transcripts/<run>]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { LEVELS } from "../../src/content/worlds";
import { teachEntry } from "../../src/content/phonics";
import { STORIES } from "../../src/content/stories";
import { warmupScript } from "../../src/content/warmups";
import { step } from "./bot";
import { durations } from "./durations";
import { fsNavEvents, gameOfScene } from "./script-audit";
import { decodeForTranscript } from "../../src/content/templates-decode";
import { helpGuard } from "../lib/help";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
type Persona = "perfect" | "learner" | "splitter" | "watcher";
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "4"));
const PERSONAS = arg("persona", "learner,perfect")!.split(",") as Persona[];
const OPTIN = arg("optin", "none")!;
/** stones to play from the map after the first minutes */
const LEVELS_AFTER = Number(arg("levels", "12"));
/** `--from w5-1`: skip the first minutes; the child has finished every level before this one (3 stars, their
 *  spellings met, their World Flower trips had) and starts at the map, where this is the next stone */
const FROM = arg("from");
const RUN = arg("out") ?? `playtest/transcripts/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
mkdirSync(RUN, { recursive: true });

const LINE = new Map(LINES.map((l) => [l.id, l]));
const PAGE = new Map<string, string>(STORIES.flatMap((st) => st.pages.map((p) => [`${st.id}_${p.id}`, p.text] as const)));
/** Clip lengths (durations.json, with the gapped slow words and newer clips measured from their files: durations.ts). */
const DUR: Record<string, number> = durations();

type Ev = {
  t: number; kind: "say" | "sound" | "word" | "stretch" | "onset" | "story" | "tap" | "scene" | "piece" | "route" | "game" | "turn" | "hold" | "sfx" | "split" | "paw" | "speed" | "rabbit";
  who?: string; text: string; id?: string; dur?: number; cut?: boolean;
  /** a sound clip's job (§3.1: petal, tile, hidden, or unclassified), the route any clip started on, and whether the map
   *  or App's fade from it was still on screen (a level's line that starts then speaks over the map: Dec5) */
  show?: string; route?: string; mapOn?: boolean;
  /** a tap: the nav control it was on, and whether the scene was busy (a tile tapped during a demo is ignored) */
  nav?: string | null; busy?: boolean;
  /** a hold: when it ended and how (next, show, board: <label>, answer: <label>, none); a split: the spelling and the tile */
  end?: number; how?: string; next?: string; tapped?: string; game?: string | null;
  /** a speech clip: the fast/slow badges lit as it started ("slow", "fast"); a speed event: which one lit */
  lit?: string[]; which?: string;
};

function decode(url: string): Omit<Ev, "t"> | null {
  let m;
  // a templated clip (/a/t/, docs/SPEECH_TEMPLATES.md): its text, from the template registry
  const tpl = decodeForTranscript(url);
  if (tpl) return tpl;
  const dur = (k: string) => DUR[k];
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) {
    const l = LINE.get(m[1]);
    return { kind: "say", who: l?.who ?? "sensei", text: l?.text ?? `[line ${m[1]}]`, id: m[1], dur: dur(`l/${m[1]}`) };
  }
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { kind: "sound", text: `/${m[1]}/`, id: `sound:${m[1]}`, dur: dur(`p/${m[1]}`) };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { kind: "word", text: m[1], id: `word:${m[1]}`, dur: dur(`w/${m[1]}`) };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { kind: "stretch", text: m[1], id: `stretch:${m[1]}`, dur: dur(`x/${m[1]}`) };
  if ((m = url.match(/\/a\/o\/([^/]+)\.mp3/))) return { kind: "onset", text: m[1], id: `onset:${m[1]}`, dur: dur(`o/${m[1]}`) };
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return { kind: "story", who: "sensei", text: PAGE.get(m[1]) ?? `[story ${m[1]}]`, id: `story:${m[1]}`, dur: dur(`s/${m[1]}`) };
  return null;
}

/** Which piece of the journey is on screen (the first minutes' pieces, then levels, rewards, trips and the map). */
const pieceNow = (page: Page) =>
  page.evaluate(() => {
    const q = (s: string) => !!document.querySelector(s);
    const st = (window as any).__snState ?? {};
    if (q(".oi")) return "opt-in";
    if (q(".st-reward")) return "sticker book";
    if (q(".scene.map")) return "map";
    if (st.scene === "reward") return "reward";
    if (st.scene === "tree") return "world flower";
    if (typeof st.scene === "string" && st.scene.startsWith("tut-")) return "dojo welcome";
    if (q(".scene.choose")) return "choose";
    if (q(".skip-film") || q("video")) return "intro film";
    if (q(".scene.title")) return "title";
    if (q('[aria-label^="player "]')) return "profiles";
    return "level";
  });

/** The game on screen (TEACHER_SCRIPT §2.6): the scene's own `game` once it publishes one, else from the scene, the
 *  level and the warm-up beat. A warm-up's tap-all is "tapall:in" when its script beat is a sound in the middle. */
function gameNow(st: any, level: string | null, tiles: boolean, tapallN: number): string | null {
  if (typeof st?.game === "string") return st.game;
  // a scene that publishes `game: null` says it is not a game (Show Sensei's placement keeps scene "find" for the bots;
  // the opt-in, Training, the rewards, the film): don't guess one from the scene (lane A's request, integration 27 Sep)
  if (st && "game" in st && st.game === null) return null;
  if (st?.scene === "warmup" && st.beat === "tapall") {
    let how = st.how;
    if (!how && st.key) {
      try {
        how = (warmupScript(st.key).beats.filter((b: any) => b.kind === "tapall")[tapallN] as any)?.how;
      } catch {}
    }
    return how === "in" ? "tapall:in" : "tapall";
  }
  if (st?.scene === "pick" && tiles) return "find";
  if (st?.scene === "battle" && level === "trial") return "trial";
  return gameOfScene(st?.scene, level, st?.beat ?? null);
}

async function play(page: Page, persona: Persona) {
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  // a child part-way through: every earlier level done, its spellings met and its trips had
  const before = FROM ? LEVELS.slice(0, Math.max(0, LEVELS.findIndex((l) => l.id === FROM))) : [];
  const later = FROM
    ? {
        hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenStreak: true, schoolYear: "R",
        stars: Object.fromEntries(before.map((l) => [l.id, 3])),
        petals: [...new Set(before.flatMap((l) => (l.teach ?? []).map((t) => t.split("=")[0])))],
        flowerSeen: [...new Set(before.flatMap((l) => (l.teach ?? []).map((t) => { const sg = teachEntry(t); return `spelling:${sg.g === "x" ? "x>ks" : `${sg.g}>${sg.p}`}`; })).concat(before.map((l) => `world:${l.world}`)))],
        sessions: 8, minutes: 90,
      }
    : {};
  await page.evaluate((later) => {
    localStorage.clear();
    const id = "pcont";
    localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: (later as any).hero ?? null, created: Date.now(), last: Date.now() }], current: id }));
    localStorage.setItem(`superninja.save.${id}`, JSON.stringify({ v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true, ...later }));
    sessionStorage.setItem("sn.setup", "done");
  }, later);
  await page.addInitScript(([o, persona]) => {
    const w = window as any;
    w.__taps = [];
    w.__botOptIn = o;
    w.__botPersona = persona;
    // every clip, with the route and scene it started on (a level line that starts on the map spoke over it)
    const log: any[] = [];
    // which of the tortoise and the rabbit are lit right now (TEACHER_SCRIPT §9.6): the nav layer's badges, or a
    // warm-up's own speed buttons (glow, flash or pulse)
    const shown = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return false;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.2) return false;
      }
      return true;
    };
    // lit: the nav layer's badge with class "lit" (or data-lit); a warm-up's own button glowing, flashing or pulsing
    const on = (el: Element) => {
      const c = el.getAttribute("class") ?? "";
      if (el.matches(".wu-speed")) return /\b(glow|flash|pulse)\b/.test(c);
      const d = el.getAttribute("data-lit");
      return /\blit\b/.test(c) || (d !== null && d !== "false" && d !== "0");
    };
    const litNow = () => {
      const out: string[] = [];
      const sp = w.__snNav?.speed;
      if (sp && sp.shown !== false && typeof sp.lit === "string") out.push(sp.lit);
      for (const [sel, which] of [['[data-fs="tortoise"], [data-speed="slow"], .wu-speed.tortoise', "slow"], ['[data-fs="rabbit"], [data-speed="fast"], .wu-speed.rabbit', "fast"]])
        if (!out.includes(which) && [...document.querySelectorAll(sel)].some((el) => on(el) && shown(el))) out.push(which);
      return out;
    };
    log.push = function (...items: any[]) {
      for (const it of items) {
        const rec: any = { ...it, route: w.__snRoute != null ? String(w.__snRoute) : null, scene: w.__snState?.scene ?? null, mapOn: !!document.querySelector(".scene.map") || [...document.querySelectorAll(".fullscreen-fade")].some((f) => f.getAnimations().some((a) => a.playState === "running")) };
        if (it?.kind === "speech") {
          rec.lit = litNow();
          setTimeout(() => {
            for (const x of litNow()) if (!rec.lit.includes(x)) rec.lit.push(x);
          }, 150);
        }
        Array.prototype.push.call(this, rec);
      }
      return this.length;
    };
    w.__audioLog = log;
    // the game's nav log keeps its newest 500 entries; keep every one here
    const all: any[] = (w.__botNavLog = []);
    const nav: any[] = [];
    nav.push = function (...items: any[]) {
      all.push(...items);
      return Array.prototype.push.apply(this, items);
    };
    w.__snNavLog = nav;
    // the streak's granted tier lines (streak.ts keeps its last 50 in __snStreak.lines): keep every one, for script-audit's
    // exact master-early (Dec2: a tier line rests on whole answers)
    const granted: any[] = (w.__botStreakLines = []);
    let streakProbe: any;
    Object.defineProperty(w, "__snStreak", {
      configurable: true,
      get: () => streakProbe,
      set: (v) => {
        streakProbe = v;
        if (v && Array.isArray(v.lines)) {
          const push0 = v.lines.push;
          v.lines.push = function (...items: any[]) {
            granted.push(...items);
            return push0.apply(this, items);
          };
        }
      },
    });
    addEventListener("pointerdown", (e) => {
      const el = (e.target as Element).closest?.("[aria-label], button, .tile, .card");
      const n = (e.target as Element).closest?.("[data-nav]")?.getAttribute("data-nav") ?? null;
      const st = w.__snState;
      w.__taps.push({ t: Date.now(), label: el?.getAttribute("aria-label") || (el?.textContent ?? "").trim().slice(0, 30) || "(somewhere)", nav: n, busy: typeof st?.busy === "boolean" ? st.busy : undefined });
    }, true);
  }, [OPTIN, persona] as const);
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  await page.waitForTimeout(600);
  const t0 = Date.now();
  const pieces: { t: number; text: string }[] = [];
  const scenes: { t: number; text: string }[] = [];
  const marks: { t: number; kind: "route" | "game" | "turn"; text: string; game?: string | null }[] = [];
  const holds: { t: number; id: string; end: number | null }[] = [];
  const dom: { t: number; nodes: number; fx: number }[] = [];
  let last = "";
  let lastScene = "";
  let stones = 0;
  let lastStone = "";
  let item = 0;
  let lastNext = "";
  let wait = 0;
  let domAt = 0;
  let finished = false;
  let lastRoute = "", lastGame: string | null | undefined, lastTurn = "", lastBeat = "", tapallN = 0, levelNow: string | null = null;
  let hold: { t: number; id: string } | null = null;
  const think = (persona === "perfect" || persona === "watcher" ? 1200 : 2600) / FAST;
  const down = (sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).then(() => true).catch(() => false);
  while (Date.now() - t0 < (70 * 60_000) / FAST) {
    const now = await pieceNow(page).catch(() => "?");
    const snap: any = await page.evaluate(() => { const w = window as any; return { st: w.__snState ?? {}, nav: w.__snNav ?? null, route: w.__snRoute != null ? String(w.__snRoute) : "", tiles: !!document.querySelector(".pick-row .tile") }; }).catch(() => ({ st: {}, nav: null, route: "", tiles: false }));
    const st: any = snap.st;
    if (now !== last) {
      pieces.push({ t: Date.now(), text: now === "level" ? `level ${lastStone || "(first minutes)"}` : now });
      last = now;
    }
    if (st.scene && st.scene !== lastScene) {
      scenes.push({ t: Date.now(), text: st.scene });
      lastScene = st.scene;
    }
    // the route, the game, the question and the held step, as they change
    if (snap.route !== lastRoute) {
      marks.push({ t: Date.now(), kind: "route", text: snap.route });
      lastRoute = snap.route;
      levelNow = snap.route.startsWith("level:") ? snap.route.slice(6) : snap.route.startsWith("trial") ? "trial" : null;
      tapallN = 0;
      lastBeat = "";
    }
    if (st.scene === "warmup" && st.beat !== lastBeat) {
      if (lastBeat === "tapall") tapallN++;
      lastBeat = st.beat;
    }
    const game = levelNow ? gameNow(st, levelNow, snap.tiles, tapallN) : null;
    if (game !== lastGame) {
      marks.push({ t: Date.now(), kind: "game", text: game ?? "" });
      lastGame = game;
    }
    const turnKey = st.next && !st.busy ? JSON.stringify([st.scene, st.next, st.beat ?? st.word ?? st.i ?? st.pos ?? null]) : "";
    if (turnKey && turnKey !== lastTurn) marks.push({ t: Date.now(), kind: "turn", text: String(st.next), game });
    lastTurn = turnKey;
    const readyNow = snap.nav?.next === "ready";
    const holdId = snap.nav?.pres?.id ? `${snap.nav.pres.id}${snap.nav.pres.of > 1 ? ` ${snap.nav.pres.step + 1}/${snap.nav.pres.of}` : ""}` : st.scene ?? now;
    if (readyNow && !hold) hold = { t: Date.now(), id: holdId };
    else if (!readyNow && hold) (holds.push({ ...hold, end: Date.now() }), (hold = null));
    if (Date.now() - domAt > 10_000 / FAST) {
      domAt = Date.now();
      const s = await page.evaluate(() => ({ nodes: document.getElementsByTagName("*").length, fx: document.querySelector(".fx-layer, .fx")?.childElementCount ?? 0 })).catch(() => null);
      if (s) dom.push({ t: Date.now(), ...s });
    }
    // before the game: tap Start, pick the player, watch the film (each shot holds on Next), choose Kai and go on
    const pre: any = ["title", "profiles", "choose", "intro film"].includes(now) ? snap.nav : null;
    if (pre?.next === "ready") {
      await page.waitForTimeout(think);
      await down('[data-nav="next"]');
    } else if (now === "title") await down('button[aria-label="Start"]');
    else if (now === "profiles") await down('[aria-label="player Ninja"]');
    else if (now === "choose") {
      if (!st.picked) await down('[aria-label="kai"]');
    } else if (now === "intro film") {
      // the film plays its shot; the nav branch above taps Next when it holds
    } else if (now === "map") {
      if (stones >= LEVELS_AFTER && !finished) {
        finished = true;
        await page.waitForTimeout(6000 / FAST); // the map's arrival line
        break;
      }
      // wait for the map's arrival speech and the walk to the next stone, then tap the gold stone
      if (st.next && st.next !== lastStone) {
        await page.waitForTimeout(3500 / FAST);
        if (await down(`[aria-label="level ${st.next}"]`)) {
          lastStone = st.next;
          stones++;
          pieces.push({ t: Date.now(), text: `stone ${stones}: ${st.next}` });
        }
      } else if (st.next) await down(`[aria-label="level ${st.next}"]`);
    } else {
      // a held step: tap the green arrow once it's ready, even beside "Play again" (a child going on, not the harness
      // ending its case as bot.ts does). A Ready hold (TEACHER_SCRIPT §2.3) goes to bot.ts, which answers it for the
      // persona: the watcher's paw, and the default's right-answer tap on one hand-over Ready in three.
      const nav: any = snap.nav;
      if (nav?.next === "ready" && !(st.scene === "warmup" && st.next)) {
        await page.waitForTimeout(think);
        if (typeof nav?.pres?.id === "string" && nav.pres.id.startsWith("ready:")) await step(page).catch(() => {});
        else await down('[data-nav="next"]');
        await page.waitForTimeout(150);
        continue;
      }
      const wrongs = persona === "learner";
      // warm-ups: answer after the question, with a think; the learner gets about 1 in 3 first tries wrong
      if (st.scene === "warmup" && st.next) {
        if (!st.asked && st.beat !== "rail" && st.beat !== "dots") { await page.waitForTimeout(120); continue; }
        const key = `${st.beat}:${st.next}`;
        if (key !== lastNext) {
          lastNext = key;
          wait = Date.now() + think;
          if (wrongs && ++item % 3 === 0) {
            await page.waitForTimeout(think);
            const wrong = await page.evaluate((next) => {
              const opts = [...document.querySelectorAll(".wu .wu-slot:not(.out) button.pcard, .wu button.wu-speed, .wu button.wu-rail-btn, .wu button.wu-bigdot")].map((b) => b.getAttribute("aria-label")).filter((l) => l && l !== next);
              return opts.at(-1) ?? null;
            }, st.next);
            if (wrong) {
              await down(`.wu [aria-label="${wrong}"]`);
              await page.waitForTimeout(3500 / FAST);
              continue;
            }
          }
        }
        if (Date.now() < wait) { await page.waitForTimeout(80); continue; }
      } else if (st.next && st.scene !== "optin" && st.scene !== "map") {
        // other games: a new question, a think, and the learner's wrong first try on every third
        const key = `${st.scene}:${st.next}:${st.pos ?? ""}:${st.tapIdx ?? ""}`;
        if (key !== lastNext) {
          lastNext = key;
          wait = Date.now() + think;
          if (wrongs && ++item % 3 === 0) {
            const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
            if (await wrong.count()) {
              await page.waitForTimeout(think);
              await wrong.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
              await page.waitForTimeout(3500 / FAST);
              continue;
            }
          }
        }
        if (Date.now() < wait) { await page.waitForTimeout(80); continue; }
      }
      if (typeof st.scene === "string" && st.scene.startsWith("tut-")) {
        if (await page.locator(".help-btn.talking").count()) { await page.waitForTimeout(100); continue; }
        await page.waitForTimeout(think);
      }
      if (st.scene === "optin" && st.next && !st.settling) {
        if (!st.asked) { await page.waitForTimeout(120); continue; }
        await page.waitForTimeout(think);
      }
      await step(page).catch(() => {});
    }
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);
  if (hold) holds.push({ ...hold, end: null });
  const { audio, taps, navlog, splits, splitNone, streakLines, off } = await page.evaluate(() => { const w = window as any; return { audio: w.__audioLog ?? [], taps: w.__taps ?? [], navlog: w.__botNavLog ?? [], splits: w.__botSplits ?? [], splitNone: w.__botSplitNone ?? [], streakLines: w.__snStreak ? w.__botStreakLines ?? [] : null, off: Date.now() - performance.now() }; });
  const game = (t: number) => Math.round(((t - t0) * FAST) / 100) / 10;
  const speech: Ev[] = audio.filter((a: any) => a.kind === "speech").map((a: any) => { const d = decode(a.url); return d ? { t: game(a.t), ...d, ...(d.kind === "sound" ? { show: a.show ?? "unclassified" } : {}), ...(a.route ? { route: a.route } : {}), ...(d.kind === "say" && a.mapOn !== undefined ? { mapOn: !!a.mapOn } : {}), ...(Array.isArray(a.lit) && a.lit.length ? { lit: a.lit } : {}) } : null; }).filter(Boolean);
  // a clip is cut off when the next speech clip starts before it could have finished (its recorded length, less 150 ms)
  for (let i = 0; i + 1 < speech.length; i++) {
    const e = speech[i];
    if (e.dur && speech[i + 1].t < e.t + e.dur / 1000 - 0.15) e.cut = true;
  }
  const tapEvs: Ev[] = [];
  for (const x of taps.filter((x: any) => x.t >= t0 && x.label !== "(somewhere)")) {
    const t = game(x.t);
    if (tapEvs.some((o) => o.text === x.label && t - o.t < 2)) continue;
    tapEvs.push({ t, kind: "tap", text: x.label, ...(x.nav ? { nav: x.nav } : {}), ...(x.busy !== undefined ? { busy: x.busy } : {}) });
  }
  const nav = navlog.map((e: any) => ({ ...e, t: game(e.t + off) }));
  // how each held step ended: the nav log's own answer (a Ready logs { kind: "ready", how }), else the first tap
  const holdEvs: Ev[] = holds.map((h) => {
    const t = game(h.t), end = h.end == null ? null : game(h.end);
    const logged = nav.find((e: any) => e.kind === "ready" && e.how && e.t >= t - 0.5 && (end == null || e.t <= end + 1));
    const tap = tapEvs.find((x) => x.t >= t - 0.2 && (end == null || x.t <= end + 0.6));
    const how = logged ? `${logged.how}${logged.label ? `: ${logged.label}` : ""}` : tap ? (tap.nav === "next" ? "next" : tap.nav === "show" ? "show" : `board: ${tap.text}`) : end == null ? "still waiting at the end" : "none";
    return { t, kind: "hold" as const, text: h.id, ...(end != null ? { end } : {}), how };
  });
  const sfx: Ev[] = audio.filter((a: any) => a.kind === "sfx" && /^sfx:(good|great|wrong)$/.test(a.url)).map((a: any) => ({ t: game(a.t), kind: "sfx" as const, text: a.url.slice(4) }));
  const splitEvs: Ev[] = splits.map((s: any) => ({ t: game(s.t), kind: "split" as const, text: `${s.tapped} for ${s.next}`, next: s.next, tapped: s.tapped }));
  const paws: Ev[] = nav.filter((e: any) => e.kind === "paw" || e.kind === "demo").map((e: any) => ({ t: e.t, kind: "paw" as const, text: e.id ?? e.kind }));
  // the tortoise and the rabbit (nav log `speed`, `rabbit`); a rabbit tap the tap log missed becomes a tap
  const fs = fsNavEvents(nav, tapEvs) as Ev[];
  const evs: Ev[] = [
    ...speech,
    ...tapEvs,
    ...scenes.map((s) => ({ t: game(s.t), kind: "scene" as const, text: s.text })),
    ...pieces.map((p) => ({ t: game(p.t), kind: "piece" as const, text: p.text })),
    ...marks.map((m) => ({ t: game(m.t), kind: m.kind, text: m.text, ...(m.kind === "turn" ? { game: m.game } : {}) })),
    ...holdEvs,
    ...sfx,
    ...splitEvs,
    ...paws,
    ...fs,
  ].sort((a, b) => a.t - b.t);
  // the splitter's two-letter slots that offered no part of the spelling to tap (so no split was possible there)
  const noSplit = splitNone.map((s: any) => ({ t: game(s.t), next: s.next, word: s.word, bank: s.bank }));
  // the tier lines the streak granted (null: a build before streak.ts published __snStreak), on the game clock
  const streak = streakLines ? streakLines.map((l: any) => ({ ...l, t: game(l.t + off) })) : null;
  return { evs, dom: dom.map((d) => ({ t: game(d.t), nodes: d.nodes, fx: d.fx })), stones, navlog: nav, noSplit, streakLines: streak };
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
function render(persona: string, r: Awaited<ReturnType<typeof play>>): string {
  const out = [
    `# One continuous journey (${persona} child, ${FROM ? `from ${FROM}` : `opt-in: ${OPTIN}`})`,
    "",
    `${FROM ? `A child who has finished every level before ${FROM}, from the title tap` : "A brand-new child from the title tap through the first minutes"}, then ${r.stones} stones from the map, in one page. Game time (played at ${FAST}×). ✂ marks a clip cut off by the next one; ⟂ a level's line that started while the map was still on screen. [ready: …] is a Ready hold (TEACHER_SCRIPT §2.3) and how the child answered it.`,
    "",
  ];
  let words: string[] = [];
  const flush = () => {
    if (words.length) out.push(`          🔊 ${words.join(" · ")}`);
    words = [];
  };
  for (const e of r.evs) {
    if (e.kind === "sound" || e.kind === "word" || e.kind === "stretch" || e.kind === "onset") {
      const w = e.kind === "word" ? `"${e.text}"` : e.kind === "stretch" ? `"${e.text}" (slowly)` : e.kind === "onset" ? `"${e.text}" (first sound held)` : e.text;
      words.push(e.cut ? `${w}✂` : w);
      continue;
    }
    // the fast/slow badges: [tortoise] or [rabbit] where one lit, among the sounds and words
    if (e.kind === "speed") {
      words.push(e.text === "slow" ? "[tortoise]" : e.text === "fast" ? "[rabbit]" : `[${e.text}]`);
      continue;
    }
    if (["route", "game", "turn", "sfx"].includes(e.kind)) continue;
    if (e.kind === "hold" && !/^ready:/.test(e.text)) continue;
    flush();
    const ts = fmt(e.t).padStart(7);
    const overMap = e.kind === "say" && e.mapOn && /^stone /.test(r.evs.filter((x) => x.kind === "piece" && x.t <= e.t).at(-1)?.text ?? "") ? " ⟂" : "";
    if (e.kind === "say") out.push(`${ts} ${e.who === "baron" ? "BARON" : "SENSEI"}: ${e.text}${e.cut ? " ✂" : ""}${overMap}  ‹${e.id}›`);
    else if (e.kind === "story") out.push(`${ts} STORY: ${e.text}${e.cut ? " ✂" : ""}`);
    else if (e.kind === "tap") out.push(`${ts}     > ${e.nav ? `TAP ${e.text}` : `child taps: ${e.text}`}`);
    else if (e.kind === "scene") out.push(`${ts}     --- ${e.text} ---`);
    else if (e.kind === "piece") out.push("", `${ts} ===== ${e.text} =====`);
    else if (e.kind === "hold") {
      const how = e.how === "next" ? "TAP Next" : e.how === "show" ? "TAP Show me again" : e.how?.startsWith("board") ? `TAP ${e.how}` : e.how?.startsWith("answer") ? `TAP ${e.how}` : e.how ?? "";
      out.push(`${ts}     [ready: ${e.text.replace(/^ready:/, "")}: ${how}${e.end != null ? ` after ${(e.end - e.t).toFixed(1)} s` : ""}]`);
    } else if (e.kind === "split") out.push(`${ts}     > child taps < ${e.tapped} > for < ${e.next} > (splitter: a deliberate split)`);
    else if (e.kind === "paw") out.push(`${ts}     (the paw: ${e.text})`);
    else if (e.kind === "rabbit") out.push(`${ts}     (the rabbit: ${e.text === "tap" ? "the child tapped it" : e.text === "timeout" ? "no tap in 12 s; Sensei says it fast" : e.text})`);
  }
  flush();
  out.push("", "## Page size over time (DOM elements; fx layer children)", "", r.dom.map((d) => `${fmt(d.t)} ${d.nodes}/${d.fx}`).join(" · "));
  return out.join("\n") + "\n";
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
await Promise.all(
  PERSONAS.map(async (persona) => {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
    const page = await ctx.newPage();
    const r = await play(page, persona);
    const meta = { persona, from: FROM ?? null, optin: OPTIN, fast: FAST, levels: LEVELS_AFTER, base: BASE, at: new Date().toISOString() };
    writeFileSync(`${RUN}/continuous-${persona}${FROM ? `-from-${FROM}` : ""}.json`, JSON.stringify({ meta, ...r }, null, 1));
    writeFileSync(`${RUN}/continuous-${persona}${FROM ? `-from-${FROM}` : ""}.md`, render(persona, r));
    const splits = r.evs.filter((e) => e.kind === "split").length;
    console.log(`${persona}: ${r.stones} stones, ${r.evs.filter((e) => e.kind === "say").length} lines, ${r.evs.filter((e) => e.cut).length} cut off, ${r.evs.filter((e) => e.kind === "hold" && /^ready:/.test(e.text)).length} Ready holds, ${splits} splits${persona === "splitter" ? ` (${r.noSplit.length} more two-letter slots offered no part of the spelling)` : ""}`);
    await ctx.close();
  }),
);
await b.close();
console.log(`→ ${RUN}`);
