// Clip editor "sort" (27 Sep 2026): normal gameplay clips of Sorting (src/scenes/Sort.tsx), filmed on PRODUCTION at
// real speed with the rig in scripts/tweet-clips.ts (CDP screencast, the real soundtrack rebuilt from window.__audioLog,
// measured A/V sync). The game: one sound, its spellings in open chests. A word drops in and Sensei says it; the child
// taps the chest with the same spelling; the word turns green, Sensei sounds it out (each spelling lights and sparks
// into the ninja's fists), and the ninja knocks it spinning into the chest (or floats it in with a spell); the chest
// gulps it. A wrong chest shakes its head and the word bounces back: "Let's look again. Which chest has the same
// spelling?" After the eighth word the chests close, glowing: "Same sound, different spellings. You sorted them all."
//
//   bun assets-src/clips/2026-09-27/sort/drive.ts take <name> <level> <kai|suki> [seconds=95] [--slip=K[:g]] [--720p] [--gpu] [--nowait]
//   bun assets-src/clips/2026-09-27/sort/drive.ts sheet <file> [every=1] [out.jpg]
//
// --slip=K[:g]: at word K (0-based), the child first taps a wrong chest (g, or the other two-letter / one-letter
//               spelling), hears Sensei's correction, looks again and taps the right one.
//
// The child: once the word has been said (and, on the first word, "Tap the chest with the same spelling as the word.";
// the caption bubble has gone), it looks at the word for 0.7–1.3 s and taps the chest (`button[aria-label="basket g"]`,
// the scene's __snState.next). A held step (the green arrow) gets a tap after ~1.1 s, never on the reward screen.
//
// The page: after the rig's head clapper the drive clears the storage and reloads, so the level starts clean from its
// opening (the first load's sounds are not in the soundtrack), and the filmed document carries the anti-sampler specks
// (./antisampler.ts). The save (saveFor): a child who has played every level before this one (three stars each), with
// the once-only explanations heard (gem energy, the first streak) and the "two letters, one sound" reminders retired
// (as the battle and boss editors did), captions on, music at the default. Production's Sort (27 Sep) is older than
// src/scenes/Sort.tsx: the chests stand open from the start, the opening is "Sorting time! ..." + "This sound can be
// spelt in two/three ways." + the sound once per chest + "Tap the chest with the same spelling as the word.", a wrong
// chest gets "Listen... tail. t-ae-l, tail.", and the level closes on "Sorted! What a clever ninja."; it publishes no
// `stage`, so the child answers whenever a said word is on screen and the scene isn't busy.
//
// A take first waits (up to 25 min) for a quieter machine and for other clip editors' takes to finish (one headless
// browser of ours at a time). ./takes.sh films a list of takes one after another.
//
// Decisions (27 Sep; this editor writes only under assets-src/clips/2026-09-27/):
// - 1080p: every take drew 54-60 fps at load 6-16 (the rig's frame stats), so no 720p fallback was needed.
// - All three levels are in Sky Temple (every sort level is), so the backdrop can't vary; Sorting has no monster. The
//   clips vary the level (the /k/ three-chest sort, /ae/ and /oe/ two-chest sorts), the words, the hero (Kai, Suki,
//   Suki) and the part of the level (the middle, the opening with a slip, the end).
// - Cuts with ./cut.ts (fade in 25 ms; out 100-120 ms, or 30 ms where the scene cuts to the reward screen), checked with
//   ./check.ts (spec, loudness, contact sheet into ./review/) and ./still.py (no frame is a repeat of the one before:
//   check.ts's mean-difference "still" frames are the quiet idle moments, with real motion in them).
// - Finals:
//   sort-1  w6-br1 Kai   takes/br1-kai-t2    20.633-50.567 poster 21.0  stuck, kid, silk, "Ninja power!", sock, scab
//           (every chest gets a word). t3 froze twice (94, 174 ms) as "kit" was sounded out; t1 was the probe (the
//           child never answered: production publishes no `stage`).
//   sort-2  w6-2 Suki    takes/w6-2-suki-t1  2.600-34.500  poster 24.2  the level's opening from its fade-in, then a
//           slip on "tail" (--slip=0: taps ay), "Listen... tail. t-ae-l, tail.", ai, then say and nail. t2 (a slip on
//           "day") is as good (58.3 fps against 59.7): its cut is kept as alt/sort-2-w62t2.mp4.
//   sort-3  w6-8 Suki    takes/w6-8-suki-t1  38.967-67.267 poster 14.0  slow, coat, "Wow! Super ninja streak!", snow,
//           blow (the last word: a big flip), "Sorted! What a clever ninja." The out point is the last frame before the
//           scene cuts to the reward screen, 48 ms after the line's last sound. t2 drew 54 fps with 6 repeated frames.
// In points sit after the previous word's landing chime (it lasts 0.18 s) as the next word pops in, out points after
// the landing chime before the next word is said (the next word is on screen, unsaid, for the last few frames).
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";
import { LEVELS } from "../../../../src/content/worlds";
import { GRAPHEMES } from "../../../../src/content/phonics";
import { antiSampler } from "./antisampler";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export function saveFor(level: string, hero: "kai" | "suki") {
  const i = LEVELS.findIndex((l) => l.id === level);
  const stars = Object.fromEntries(LEVELS.slice(0, Math.max(0, i)).map((l) => [l.id, 3]));
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = {
    "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] },
    // Sorting is known: two tellings in earlier sessions (games.ts migrateGames' retired entry) → the short form
    "game:sort": { n: 2, at: [0, 0], s: [0, 0], lastSession: -1 },
  };
  // (production's Sort, 27 Sep, reads older keys: "sort:first" once per save, "You know this sound!... Sorting time! These
  // words have the same sound, but it's spelt in different ways." (else "Sorting time! Same sound, different
  // spellings."), and "sort:<sound>" once per sound, "This sound can be spelt in three ways." and "Tap the chest...".
  // w6-br1 is a child's first sort, so it keeps the first form; the later sorts have met it.)
  if (level !== "w6-br1") narr["sort:first"] = { n: 1, at: [0] };
  for (const g of Object.keys(GRAPHEMES)) (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  return tweetSave({
    hero, stars, schoolYear: "none", seenStreak: true, narr,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

export interface Plan {
  slip?: { word: number; g?: string };
  /** stop answering after this many seconds of the master */
  until?: number;
}

export async function drive(page: Page, rig: Rig, plan: Plan = {}) {
  await page.context().addInitScript(antiSampler);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let key = "";
  let since = 0;
  let look = 0;
  let readySince = 0;
  let slipped = false;
  let shown = false;
  const on = () => rig.live() && (plan.until == null || rig.elapsed() < plan.until);
  while (on()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
      const chests = Array.from(document.querySelectorAll(".so-chest button[aria-label]")).map((e) => e.getAttribute("aria-label")!.replace(/^basket /, ""));
      return { scene: st.scene, stage: st.stage, form: st.form, next: st.next, busy: st.busy, i: st.i, said: st.said, ready: nav.next === "ready", again: !!document.querySelector('button[aria-label="Play again"]'), talking: !!document.querySelector(".bubble"), chests };
    }).catch(() => ({}));
    const now = Date.now();
    if (!shown && s.scene === "sort") {
      shown = true;
      rig.mark(`sort ${s.form}`);
    }
    if (s.ready) {
      if (!readySince) readySince = now;
      if (now - readySince > 1100 && !s.again && s.scene === "sort") {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(80);
      continue;
    }
    readySince = 0;
    // (production's Sort publishes no `stage`: a word on screen that isn't being answered is a turn; `said`: Sensei has
    // said it)
    if (s.scene !== "sort" || (s.stage != null && s.stage !== "play") || s.busy || s.next == null || s.said === false) {
      key = "";
      await rig.wait(50);
      continue;
    }
    const k = `${s.i}`;
    if (k !== key) {
      key = k;
      since = now;
      look = jitter(700, 1300);
    }
    // the word (and on the first, "Tap the chest with the same spelling as the word.") is heard to its end first
    if (s.talking && now - since < 5000) {
      since = now;
      await rig.wait(40);
      continue;
    }
    if (now - since < look) {
      await rig.wait(30);
      continue;
    }
    if (!on()) break;
    if (!slipped && plan.slip && plan.slip.word === s.i) {
      const others = (s.chests as string[]).filter((g) => g !== s.next);
      // a plausible mix-up: the named one, else a spelling of the other length (ck ↔ k, ai ↔ ay: the other one)
      const wrong = (plan.slip.g && others.includes(plan.slip.g) ? plan.slip.g : null) ?? others.find((g) => g.length === s.next.length) ?? others[0];
      rig.mark(`slip ${wrong} (for ${s.next})`);
      await rig.tap(`.so-chest button[aria-label="basket ${wrong}"]`);
      slipped = true;
    } else {
      rig.mark(`tap ${s.next}`);
      await rig.tap(`.so-chest button[aria-label="basket ${s.next}"]`);
    }
    key = "";
    await rig.wait(400);
  }
}

/** How many other clip editors (bun processes under assets-src/clips/2026-09-27/, not ours) are filming right now: they
 *  have a headless browser or the rig's frame encoder (ffmpeg image2pipe) as a child. */
function othersFilming(): number {
  const rows = spawnSync("ps", ["-Ao", "pid=,ppid=,command="]).stdout.toString().split("\n").map((l) => l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean) as RegExpMatchArray[];
  const editors = new Set(rows.filter((r) => /^bun .*clips\/2026-09-27\/(?!sort\/)[^/]+\/\S+\.ts\b/.test(r[3])).map((r) => r[1]));
  const busy = new Set(rows.filter((r) => editors.has(r[2]) && (/chrome-headless-shell(?!.*--type=)/.test(r[3]) || /^ffmpeg .*image2pipe/.test(r[3]))).map((r) => r[2]));
  return busy.size;
}
/** Wait (up to `maxMin` minutes) until no other clip editor is filming and the 1-minute load is under `load` (checked
 *  twice, 10–16 s apart, so two editors that see the same gap don't both start). */
async function waitForQuiet(maxMin = 25, load = 14) {
  const t0 = Date.now();
  const ok = () => loadavg()[0] <= load && othersFilming() === 0;
  for (;;) {
    if (ok()) {
      await new Promise((r) => setTimeout(r, 10_000 + Math.random() * 6000));
      if (ok()) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[sort] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)}, ${othersFilming()} other editors filming)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, level, hero] = a;
    const secs = Number(a.slice(3).find((x) => !x.startsWith("--")) ?? 95);
    const sl = a.find((x) => x.startsWith("--slip="))?.slice(7).match(/^(\d+)(?::(\w+))?$/);
    const plan: Plan = { ...(sl ? { slip: { word: Number(sl[1]), g: sl[2] } } : {}), until: secs };
    mkdirSync(TAKES, { recursive: true });
    if (!a.includes("--nowait")) await waitForQuiet();
    console.log(`[sort] ${name}: filming ${level} (${hero}) at load ${loadavg()[0].toFixed(1)}${sl ? ` slip ${sl[0]}` : ""}`);
    const rec = await record({
      name, url: `/play/?level=${level}`, base: PROD, save: saveFor(level, hero as "kai" | "suki"), seconds: secs, outDir: TAKES,
      drive: (p, r) => drive(p, r, plan), size: a.includes("--720p") ? "720p" : "1080p", gpu: a.includes("--gpu"),
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { shift: rec.sync.audioShiftMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs, each: rec.sync.residualMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "tap", "scene", "sting", "music-stop", "mark"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1, a[2] ? resolve(a[2]) : undefined));
  } else {
    console.log("usage: drive.ts take <name> <level> <kai|suki> [seconds] [--slip=K[:g]] [--720p] [--gpu] [--nowait] | sheet <file> [every] [out.jpg]");
  }
  process.exit(0);
}
