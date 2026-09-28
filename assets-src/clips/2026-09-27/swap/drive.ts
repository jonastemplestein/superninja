// Clip editor "swap" (27 Sep 2026): normal gameplay clips of Sound Swap (src/scenes/Swap.tsx), filmed on PRODUCTION at
// real speed with the rig in scripts/tweet-clips.ts (CDP screencast, the real soundtrack rebuilt from window.__audioLog,
// measured A/V sync). The game: Baron Muddle has muddled the words. "Change it to make... sat. Which sound needs to
// change?" (w1-8, an early chain: "...mmmat... sssat. What changed?"); the child taps the sound that changes, the ninja
// kicks it out of the word, the picture goes wobbly and the new spellings pop up ("Yes, the first sound changes! Now
// pick the new sound."); the child picks the new one, a spell carries it up into the gap, the picture turns into the
// new word, Sensei blends it ("s-a-t, sat"), praise, and a star bonks Baron.
//
//   bun assets-src/clips/2026-09-27/swap/drive.ts take <name> <level> <kai|suki> [seconds=60] [--slip=new@K|pos@K] [--720p] [--gpu] [--nowait]
//   bun assets-src/clips/2026-09-27/swap/drive.ts sheet <file> [every=1]
//
// --slip=new@K: at step K (0-based), the child first taps a wrong new spelling (Sensei: "Listen: hat... hot.", then the
//               child picks the right one). --slip=pos@K: first taps a sound that stays ("That's /h/. /h/ stays the
//               same. Listen: hat... hot.").
//
// The child: once the question is over (the scene is no longer busy) it looks at the word for 0.9–1.4 s and taps the
// sound that changes (`.slots .tile` number `pos`, as the treadmill bot does); once the new spellings are up it waits for
// Sensei's "Now pick the new sound." to end (the caption bubble goes) and taps the right one 0.7–1.1 s later. A held step
// (the green arrow) gets a tap after ~1.1 s, never at the level's end ("Play again").
//
// The page: after the rig's head clapper the drive clears the storage and reloads, so the level starts clean from
// Sensei's introduction (the first load's sounds are not in the soundtrack), and the filmed document carries the
// anti-sampler specks (./antisampler.ts: without them Chrome's capturer drops ~266 ms of frames after a strike or spell).
// The save: the hero, captions on, music at the game's default, and "gem-energy" already heard (the first fixed word of
// a save would otherwise hold on "Look, a gem!" until Next); the "Yes, the first sound changes!" place lines stay.
//
// A take first waits (up to 25 min) for a quieter machine and for other clip editors' takes to finish (one headless
// browser of ours at a time; the treadmill bots share the machine). ./takes.sh films a list of takes one after another.
//
// The finals (27 Sep), all 1080p, cut with ./cut.ts (fade in 25 ms; out 150 ms, or 30 ms where a word's last
// consonant sits at the cut), checked with ./check.ts (spec, loudness, repeated frames, contact sheet into ./review/):
//   swap-1  w1-8 Kai   takes/w1-8-kai-t1   2.600–31.400  poster 18.9   the level's opening: Sensei's introduction, then
//           mat → sat (first sound, the early chain's stretched "mmmat... sssat. What changed?"). t2 also clean, but its
//           short "Super!" leaves no time for the star to land on Baron before the next question.
//   swap-2  w3-2 Suki  takes/w3-2-suki-t3  27.367–49.100 poster 14.43  hat → hut with a slip (--slip=pos@1): taps h,
//           "That's /h/. That sound stays the same. Listen... hat... hut.", then a, u. t1 (hug → hut) clean but the spell
//           is still in flight to Baron when the next question starts; t2 (hut → hug) has an 82 ms freeze mid-window.
//   swap-3  w5-8 Kai   takes/w5-8-kai-t3   45.767–65.533 poster 14.73  wig → wing (last sound, g → ng), "It's two letters,
//           but it's one sound.", "Wow! Super ninja streak!" (the second power-up) and a spell on Baron. The random
//           chains differ per take: t1's (king → wing → wig → fig) ran past the take's end; t2 stuttered (42.6 fps, load
//           27). The out point is the frame between two captions, after the k of "streak" (the file's last 80 ms).
// swap-1 opens on the level's own fade in from dark (the reload); the other in and out points sit in the gap between
// two lines, where the old caption has gone and (at the in point) the next question's caption is up; the game starts the next question as soon as the praise ends, so the out point is always
// within ~0.2 s of the next line (never through it).
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";
import { antiSampler } from "./antisampler";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const saveFor = (hero: "kai" | "suki") =>
  tweetSave({ hero, narr: { "gem-energy": { n: 1, at: [0] } }, settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true } });

export interface Plan {
  slip?: { kind: "new" | "pos"; step: number };
  /** stop answering after this many seconds of the master (the take's length): the first take's child went on tapping
   *  while the rig closed the page, although rig.live() should have stopped it */
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
  let since = 0; // when this turn became answerable (and quiet)
  let look = 0;
  let readySince = 0;
  let slipped = false;
  const on = () => rig.live() && (plan.until == null || rig.elapsed() < plan.until);
  while (on()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
      const choices = Array.from(document.querySelectorAll(".swap-choices .tile[aria-label]")).map((e) => e.getAttribute("aria-label"));
      const cells = document.querySelectorAll(".slots.swap-word .tile").length;
      return { ...st, ready: nav.next === "ready", again: !!document.querySelector('button[aria-label="Play again"]'), talking: !!document.querySelector(".bubble"), choices, cells };
    }).catch(() => ({}));
    const now = Date.now();
    if (s.ready) {
      if (!readySince) readySince = now;
      if (now - readySince > 1100 && !s.again) {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(80);
      continue;
    }
    readySince = 0;
    if (s.scene !== "swap" || s.busy || s.next == null) {
      key = "";
      await rig.wait(60);
      continue;
    }
    const phase = s.picked == null ? "pos" : "new";
    const k = `${s.step}|${phase}`;
    // the new spellings: wait for "Now pick the new sound." (its caption) to end before looking (at most 4 s)
    if (k !== key) {
      key = k;
      since = now;
      look = phase === "pos" ? jitter(900, 1400) : jitter(700, 1100);
    }
    if (phase === "new" && s.talking && now - since < 4000) {
      since = now;
      await rig.wait(50);
      continue;
    }
    if (now - since < look) {
      await rig.wait(40);
      continue;
    }
    if (!on()) {
      console.log(`[swap] stopped answering at ${rig.elapsed().toFixed(2)} s (live ${rig.live()})`);
      break;
    }
    const slipHere = !slipped && plan.slip && plan.slip.step === s.step && plan.slip.kind === phase;
    if (phase === "pos") {
      if (slipHere && s.cells > 1) {
        const wrong = s.pos === 0 ? 1 : 0;
        rig.mark(`slip pos ${wrong} (for ${s.pos})`);
        await rig.tap(`.slots.swap-word .tile >> nth=${wrong}`);
        slipped = true;
      } else {
        rig.mark(`tap pos ${s.pos}`);
        await rig.tap(`.slots.swap-word .tile >> nth=${s.pos}`);
      }
    } else {
      const other = (s.choices as string[]).find((c) => c && c !== s.next);
      if (slipHere && other) {
        rig.mark(`slip new ${other} (for ${s.next})`);
        await rig.tap(`.swap-choices .tile[aria-label="${other}"]`);
        slipped = true;
      } else {
        rig.mark(`tap new ${s.next}`);
        await rig.tap(`.swap-choices .tile[aria-label="${s.next}"]`);
      }
    }
    key = "";
    await rig.wait(500);
  }
}

/** How many other clip editors (bun processes under assets-src/clips/2026-09-27/, not ours) are filming right now: they
 *  have a headless browser or the rig's frame encoder (ffmpeg image2pipe) as a child. (A process that is only waiting
 *  for its turn has neither.) */
function othersFilming(): number {
  const rows = spawnSync("ps", ["-Ao", "pid=,ppid=,command="]).stdout.toString().split("\n").map((l) => l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/)).filter(Boolean) as RegExpMatchArray[];
  const editors = new Set(rows.filter((r) => /^bun .*clips\/2026-09-27\/(?!swap\/)[^/]+\/\S+\.ts\b/.test(r[3])).map((r) => r[1]));
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
      console.log(`[swap] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)}, ${othersFilming()} other editors filming)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, level, hero] = a;
    const secs = Number(a.slice(3).find((x) => !x.startsWith("--")) ?? 60);
    const sl = a.find((x) => x.startsWith("--slip="))?.slice(7).match(/^(new|pos)@(\d+)$/);
    const plan: Plan = { ...(sl ? { slip: { kind: sl[1] as "new" | "pos", step: Number(sl[2]) } } : {}), until: secs };
    mkdirSync(TAKES, { recursive: true });
    if (!a.includes("--nowait")) await waitForQuiet();
    console.log(`[swap] ${name}: filming ${level} (${hero}) at load ${loadavg()[0].toFixed(1)}${sl ? ` slip ${sl[0]}` : ""}`);
    const rec = await record({
      name, url: `/play/?level=${level}`, base: PROD, save: saveFor(hero as "kai" | "suki"), seconds: secs, outDir: TAKES,
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
    console.log("usage: drive.ts take <name> <level> <kai|suki> [seconds] [--slip=new@K|pos@K] [--720p] [--gpu] [--nowait] | sheet <file> [every] [out.jpg]");
  }
  process.exit(0);
}
