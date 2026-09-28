// Clip editor "story" (27 Sep 2026): normal gameplay clips of Story Time (Story.tsx, level.kind "story"), filmed on
// PRODUCTION at real speed, captions on, with the camera rig in scripts/tweet-clips.ts (CDP screencast, the real
// soundtrack rebuilt from window.__audioLog, measured A/V sync).
//
//   bun assets-src/clips/2026-09-27/story/drive.ts take <name> <clip 1|2|3> [--720p] [--nowait]
//   bun assets-src/clips/2026-09-27/story/drive.ts beats <master> [from] [to]      what happens, on the master's clock
//   bun assets-src/clips/2026-09-27/story/drive.ts final <clip> <master> <start> <end> <posterAt>
//   bun assets-src/clips/2026-09-27/story/drive.ts sheet <file> [every]
//
// Each take films the whole story, from its title to "The end! What a story!", and the clip's window is picked from
// the take afterwards (the story's pages come in a fixed order, so every take of a clip plays the same beats).
//
// The clips (CLIPS below): a different story, land, hero and part of the loop each.
//   1  w1-14 "The Missing Pot" (Bamboo Village, the pandas), Suki: the first story. Picks "mat" straight away; taps
//      "Pot" for help on "Pot! Pot on mat!" (from c1-t3; c1-t2 read it without help).
//   2  w3-11 "The Yak's Bell" (Misty Mountains, Rex the yak), Kai: short form. Taps "hill" for help on "Run, run! Up
//      the hill!"; at the question picks the box first (the gentle "not quite"), then the bell.
//   3  w5-10 "The Baron's Chest" (Shadow Castle), Suki: short form. Tries "kick" first (the funny detour: the flying
//      kick bounces off the chest), then "tap" (the spell on the lock, the chest bursting open).
//
// The child: after the rig's head clapper the drive clears the storage and reloads (the level starts clean from its
// title, and the clapper is never over it). It never taps while Sensei (or the ninja) is talking: it reads the rig's
// own audio log, with each sound's length from its buffer (antisampler.ts bufferDurations). Then, like a child who
// listens: the green arrow ~1.1 s after it wakes; a page to read, 0.7 s + ~0.4 s a word of reading, then the tick (a
// help word first, where the plan has one: tapped ~0.9 s in, its read-back heard, then a moment more on the page); a
// choice, ~1.3 s to read the two words; the question's pictures, ~1.2 s. Nothing is tapped on the reward screen.
//
// The save: a child who has played every level before this one (three stars each; the story game's form follows from
// those stars, as the game migrates them: full at w1-14, short later), with the once-only moments it would have had by
// then (the first Readies, the streak, the Baron's motive), the "two letters, one sound" reminders retired (as the
// battle and boss editors decided), and the special words ("This is 'the'. Just say 'the' here.") told as often as
// the earlier stories' pages would have told them (specialLedger). Captions on, music at the game's default.
//
// Decisions (27 Sep; this editor writes only under assets-src/clips/2026-09-27/):
// - production's Story.tsx is older than src/ (27 Sep): its __snState has no busy/next, its title has no Ready line
//   ("Story time! I'll read, and you read too.", the title, then the green arrow), the first page is handed over with
//   "Your turn to read.", the question is led by "Let's think about the story..." and answered "That's it!". The drive
//   reads the page itself (look()), so it plays either.
// - 1080p: c1-t2 drew 58.7 fps with no freeze in the game at load ~7 (c1-t1, 44.9 fps, was filmed while the driver
//   still waited for a `next` production never sets: the child sat on page 2).
// - Finals (cut with `final`; the sound lined up by the claps' residual at the window's middle; in-points on the first
//   frame of a page turn, out-points after the last voice and before the next page or the reward screen):
//   story-1 from c1-t5 (58.1 fps, no freeze), 43.767-73.6: the choice, "mat", "Pot! Pot on mat!" with "Pot" tapped for
//     help, the feast page read to its end. (c1-t4 was also clean; c1-t3 froze 100 ms during the choice line; c1-t2
//     read the page without the help tap.)
//   story-2 from c2-t2 (58.5 fps, no freeze), 65.833-98.5: "The bell is in the box. Yes!", the reunion page, the
//     question with the box tapped first ("Keep going, ninja.": the streak was going), the bell, "The end! What a
//     story!", out on the story's last frame (the reward screen cuts in on the next). c2-t1 was also clean.
//   story-3 from c3-t2 (56.1 fps, no freeze), 39.8-65.8: the choice, "kick" first (the funny detour), the flying kick
//     bouncing off the chest, "Kick! Thud! It is still shut.", "Ouch... Try again." (c3-t1 drew 52 fps.) The other half
//     of the same take (tap, the spell on the lock, the chest bursting open) is alt/story-3-alt-chest-opens.mp4.
// - Checks: stutter.py (no run of 3+ identical frames in any final), synccheck.py (tap ripples against the taps' own
//   times: within about ±25 ms, the 1/30 s frame grid included), luma.py (where a page turn's fade from dark starts).
// - one take films the whole story (~2 min): the clip windows are chosen from the pictures and the timeline after.
// - the anti-sampler (two invisible specks, see antisampler.ts) is on in every take: the screencast otherwise drops
//   frames for ~250 ms whenever only the ninja's breathing moves (the ears editor's finding).
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { LEVELS } from "../../../../src/content/worlds";
import { GRAPHEMES } from "../../../../src/content/phonics";
import { STORIES } from "../../../../src/content/stories";
import { due, told, specialWords, specialKey, type Exposure } from "../../../../src/content/narrative";
import { antiSampler, bufferDurations } from "./antisampler";
import { cut } from "./cut";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export interface Clip {
  level: string;
  hero: "kai" | "suki";
  /** how long to film, from the first load (the whole story, with room to spare) */
  seconds: number;
  /** page id → the word the child taps for help on it (first) */
  help?: Record<string, string>;
  /** choice page id → the words picked, in order, one per visit (a detour first, then the way on) */
  picks?: Record<string, string[]>;
  /** the question's pictures, in the order tapped (a wrong one first: the gentle "not quite") */
  answers?: string[];
}
export const CLIPS: Record<string, Clip> = {
  "1": { level: "w1-14", hero: "suki", seconds: 100, help: { "6": "Pot" }, picks: { "5": ["mat"] }, answers: ["pot"] },
  "2": { level: "w3-11", hero: "kai", seconds: 115, help: { "4": "hill" }, picks: { "5": ["box"] }, answers: ["box", "bell"] },
  "3": { level: "w5-10", hero: "suki", seconds: 125, picks: { "4": ["kick", "tap"] }, answers: ["rock"] },
};

/** The special words the stories before this level would have taught, page by page along each story's way on (no
 *  detours), with the game's own spacing (narrative.ts: its first page, the next page with it, a later story). */
export function specialLedger(level: string): Record<string, Exposure> {
  const idx = LEVELS.findIndex((l) => l.id === level);
  const l: Record<string, Exposure> = {};
  LEVELS.slice(0, idx).forEach((lv, i) => {
    if (lv.kind !== "story" || !lv.story) return;
    const st = STORIES.find((s) => s.id === lv.story);
    if (!st) return;
    for (const p of st.pages) {
      if (p.kind !== "read" || /[a-z]$/.test(p.id)) continue;
      const w = specialWords(p.text).find(({ word }) => due(l[specialKey(word)], i, "special"));
      if (w) l[specialKey(w.word)] = told(l[specialKey(w.word)], i, 1);
    }
  });
  return l;
}

export function saveFor(level: string, hero: "kai" | "suki") {
  const i = LEVELS.findIndex((l) => l.id === level);
  const stars = Object.fromEntries(LEVELS.slice(0, i).map((l) => [l.id, 3]));
  const retired = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = {
    "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] }, "ready:first": { n: 1, at: [0] }, "ready:paw": { n: 1, at: [0] },
    ...specialLedger(level),
  };
  // a child past the first story has chosen in a story before ("Read the words, and tap one!" instead of the first
  // time's "Read the two words. Tap the one you choose.")
  const firstStory = LEVELS.findIndex((l) => l.kind === "story");
  if (i > firstStory) narr["story:choice"] = { n: 1, at: [firstStory] };
  for (const g of Object.keys(GRAPHEMES)) (narr[`letters:${g}`] = retired), (narr[`two-sounds:${g}`] = retired);
  return tweetSave({
    hero, stars, schoolYear: "none", seenStreak: true, narr,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

interface Look {
  scene?: string; page?: string; kind?: string;
  /** the child can answer now: the tick is live, the choice words are up and none chosen, the pictures are in and not
   *  solved, or the green arrow is awake */
  act: boolean;
  ready: boolean; again: boolean; speaking: boolean;
}
/** The page as the child sees it. (Production's Story.tsx, 27 Sep, publishes only { scene, story, page, kind } in
 *  window.__snState, so whether a turn is open is read from the page itself.) Whether anyone is talking: a speech sound
 *  from the audio log that has not ended or been stopped. */
const look = (page: Page): Promise<Look> =>
  page.evaluate(() => {
    const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
    const log: any[] = w.__audioLog || [], dur = w.__bufDur || {};
    const now = Date.now();
    const stopped = new Set<number>();
    for (let i = log.length - 1; i >= 0 && i >= log.length - 200; i--) if (log[i].kind === "stop") stopped.add(log[i].sid);
    let speaking = false;
    for (let i = log.length - 1; i >= 0 && i >= log.length - 200; i--) {
      const e = log[i];
      if (e.kind !== "speech" || stopped.has(e.sid)) continue;
      const d = dur[e.sid];
      if (d == null ? now - e.t < 400 : e.t + d * 1000 > now) {
        speaking = true;
        break;
      }
      if (now - e.t > 30_000) break;
    }
    const ready = nav.next === "ready";
    let act = ready;
    if (st.kind === "read") act = !!document.querySelector('.st-side button[aria-label="I read it!"].ready');
    else if (st.kind === "choice") {
      const tiles = Array.from(document.querySelectorAll(".st-choices .tile"));
      act = tiles.length > 0 && !tiles.some((t) => /\b(right|picked|not)\b/.test(t.className));
    } else if (st.kind === "question") act = document.querySelectorAll(".st-cards .card").length > 0 && !document.querySelector(".st-cards.solved");
    return { scene: st.scene, page: st.page, kind: st.kind, act, ready, again: !!document.querySelector('button[aria-label="Play again"]'), speaking };
  }).catch(() => ({ act: false, ready: false, again: false, speaking: true }));

/** Mark the first element under `sel` whose letters are `word` (data-clip-tap), so rig.tap can tap it. */
const markByText = (page: Page, sel: string, word: string) =>
  page.evaluate(({ sel, word }) => {
    document.querySelectorAll("[data-clip-tap]").forEach((e) => e.removeAttribute("data-clip-tap"));
    const el = (Array.from(document.querySelectorAll(sel)) as HTMLElement[]).find((e) => (e.textContent ?? "").replace(/[^A-Za-z']/g, "").toLowerCase() === word.toLowerCase());
    if (!el) return false;
    el.setAttribute("data-clip-tap", "1");
    return true;
  }, { sel, word }).catch(() => false);

export async function drive(page: Page, rig: Rig, clip: Clip) {
  await page.context().addInitScript(antiSampler);
  await page.context().addInitScript(bufferDurations);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let key = "";
  let since = 0;
  let quietSince = 0;
  let wait = 0;
  let helped = false;
  const visits = new Map<string, number>();
  let answered = 0;
  let finished = false;
  while (rig.live()) {
    const s = await look(page);
    const now = Date.now();
    if (s.scene !== "story" || s.again) {
      if (!finished && s.scene && s.scene !== "story") {
        finished = true;
        rig.mark(`left story (${s.scene})`);
      }
      await rig.wait(80);
      continue;
    }
    // what the child is looking at: a new one starts its own clock
    const k = `${s.page}|${s.kind}|${s.ready ? "ready" : s.act ? "act" : "wait"}`;
    if (k !== key) {
      key = k;
      since = now;
      quietSince = 0;
      if (!s.act) helped = false;
      wait = s.ready ? jitter(950, 1300)
        : s.kind === "read" ? 700 + 400 * (s.page ? wordsOn(clip, s.page) : 4) * jitter(0.9, 1.1)
        : s.kind === "choice" ? jitter(1200, 1500)
        : s.kind === "question" ? jitter(1100, 1400)
        : 1000;
    }
    // (a page's first line starts a moment after it appears: never act in its first 0.8 s)
    if (!s.act || s.speaking || now - since < 800) {
      quietSince = 0;
      await rig.wait(40);
      continue;
    }
    if (!quietSince) quietSince = now;
    // a help word: ~0.9 s into the page, once
    const helpWord = s.kind === "read" && s.page ? clip.help?.[s.page] : undefined;
    if (helpWord && !helped && now - quietSince >= 900) {
      helped = true;
      if (await markByText(page, ".st-words .word-btn", helpWord)) {
        rig.mark(`help ${helpWord}`);
        await rig.tap('[data-clip-tap="1"]');
        // the read-back plays; then a moment more on the page before the tick
        quietSince = 0;
        wait = jitter(1300, 1700);
        await rig.wait(350);
        continue;
      }
      rig.mark(`help ${helpWord}: not found`);
    }
    if (now - quietSince < wait) {
      await rig.wait(40);
      continue;
    }
    if (s.ready) {
      rig.mark(`next (${s.page})`);
      await rig.tap('[data-nav="next"]');
    } else if (s.kind === "read") {
      rig.mark(`tick (${s.page})`);
      await rig.tap('.st-side button[aria-label="I read it!"]');
    } else if (s.kind === "choice") {
      const n = visits.get(s.page!) ?? 0;
      visits.set(s.page!, n + 1);
      const lv = LEVELS.find((l) => l.id === clip.level);
      const p = STORIES.find((x) => x.id === lv?.story)?.pages.find((x) => x.id === s.page);
      const word = clip.picks?.[s.page!]?.[n] ?? (p && p.kind === "choice" ? p.options[p.options.length - 1].word : "");
      rig.mark(`pick ${word} (${s.page})`);
      if (await markByText(page, ".st-choices .tile", word)) await rig.tap('[data-clip-tap="1"]');
      else rig.mark(`pick ${word}: not found`);
    } else if (s.kind === "question") {
      const lv = LEVELS.find((l) => l.id === clip.level);
      const p = STORIES.find((x) => x.id === lv?.story)?.pages.find((x) => x.id === s.page);
      const right = p && p.kind === "question" ? p.options.find((o) => o.correct)?.label ?? "" : "";
      const label = clip.answers?.[answered] ?? right;
      answered++;
      rig.mark(`answer ${label}${label === right ? "" : " (not it)"}`);
      await rig.tap(`.st-cards .card[aria-label="${label}"]`);
    }
    key = "";
    await rig.wait(450);
  }
}
/** How many words a read page has (the child's reading time). */
function wordsOn(clip: Clip, pageId: string): number {
  const lv = LEVELS.find((l) => l.id === clip.level);
  const p = STORIES.find((s) => s.id === lv?.story)?.pages.find((x) => x.id === pageId);
  return p ? p.text.split(" ").length : 4;
}

/** Another clip editor's take is running (a bun …/clips/2026-09-27/<other>/…ts process), or another rig browser. */
function othersFilming(): boolean {
  const ps = spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n");
  return ps.some((l) => /^bun .*clips\/2026-09-27\/(?!story\/)[^/]+\/[^ ]+\.ts/.test(l) || /chrome-headless-shell.*force-device-scale-factor/.test(l));
}
/** Wait until the 1-minute load is under `max` (twice, 12 s apart) and no other editor is filming (that wait gives up
 *  after 5 minutes); gives up altogether after `maxMin` minutes. */
export async function waitForQuiet(max = 12, maxMin = 60) {
  const t0 = Date.now();
  for (;;) {
    const quiet = loadavg()[0] < max && (!othersFilming() || Date.now() - t0 > 5 * 60_000);
    if (quiet) {
      await new Promise((r) => setTimeout(r, 8_000 + Math.random() * 4000));
      if (loadavg()[0] < max + 2) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[story] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
      return;
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
}

const endOf = (e: TimelineEvent) => e.t + (e.dur ?? 0);

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, id] = a;
    const clip = CLIPS[id];
    if (!clip) throw new Error("clip 1, 2 or 3");
    mkdirSync(TAKES, { recursive: true });
    if (!a.includes("--nowait")) await waitForQuiet();
    console.log(`[story] ${name}: filming ${clip.level} (${clip.hero}) at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({
      name, url: `/play/?level=${clip.level}`, base: PROD, save: saveFor(clip.level, clip.hero), seconds: clip.seconds, outDir: TAKES,
      drive: (p, r) => drive(p, r, clip), size: a.includes("--720p") ? "720p" : "1080p", sheetEvery: 2,
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { shift: rec.sync.audioShiftMs, lat: rec.sync.pictureLatencyMs, res: rec.sync.residualMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "scene", "sting", "music-stop", "mark", "hitch"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "beats") {
    const m = resolve(a[0]);
    const tl = JSON.parse(readFileSync(m.replace(/\.master\.mp4$/, ".timeline.json"), "utf8"));
    const from = a[1] ? Number(a[1]) : 0, to = a[2] ? Number(a[2]) : Infinity;
    console.log(JSON.stringify({ game: tl.game, frames: tl.frames, sync: tl.sync }));
    for (const e of tl.events as TimelineEvent[]) if (e.t >= from && e.t <= to && e.kind !== "slate") console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur} → ${endOf(e).toFixed(3)}]` : ""}${e.text ? ` "${e.text}"` : ""}`);
  } else if (cmd === "final") {
    // final <clip 1|2|3> <master> <start> <end> <posterAt(master s)>: cut to ../story-<clip>.mp4 with its poster, the
    // sound lined up by the claps' residual (interpolated between the head's and the tail's medians at the window's
    // middle), the fade-out kept out of the last voice, and a contact sheet (every 0.5 s) of the finished clip here
    const [id, m, sArg, eArg, pArg] = a;
    const master = resolve(m);
    const tl = JSON.parse(readFileSync(master.replace(/\.master\.mp4$/, ".timeline.json"), "utf8"));
    const start = Number(sArg), end = Number(eArg);
    const r: (number | null)[] = tl.sync.residualMs;
    const med = (xs: (number | null)[]) => {
      const s = xs.filter((x): x is number => x != null).sort((p, q) => p - q);
      return s.length ? s[Math.floor(s.length / 2)] : 0;
    };
    const head = med(r.slice(0, 5)), tail = med(r.slice(5));
    const mid = (start + end) / 2;
    const late = Math.round(head + ((tail - head) * (mid - tl.game.start)) / Math.max(1, tl.game.end - tl.game.start));
    const out = join(HERE, "..", `story-${id}.mp4`);
    const lastLine = (tl.events as TimelineEvent[]).filter((e) => e.kind === "speech" && e.t < end).pop();
    const voiced = lastLine ? endOf(lastLine) - 0.1 : 0;
    const fadeOutMs = Math.round(Math.max(50, Math.min(400, (end - voiced) * 1000 - 20)));
    const res = cut(master, start, end, out, { posterAt: Number(pArg) - start, audioLateMs: late, fadeOutMs });
    const sheet = contactSheet(out, 0.5, join(HERE, `story-${id}.sheet.jpg`));
    console.log(JSON.stringify({ ...res, start, end, audioLateMs: late, head, tail, fadeOutMs, sheet }, null, 1));
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1, a[2]));
  } else {
    console.log("usage: drive.ts take <name> <1|2|3> [--720p] [--nowait] | beats <master> [from] [to] | final <clip> <master> <start> <end> <posterAt> | sheet <file> [every] [out]");
  }
  process.exit(0);
}
