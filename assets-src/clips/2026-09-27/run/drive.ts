// Clip editor "run" (27 Sep 2026): normal gameplay clips of Ninja Run (src/scenes/Run.tsx), filmed on PRODUCTION at
// real speed with the camera rig in scripts/tweet-clips.ts (CDP screencast, the real soundtrack rebuilt from
// window.__audioLog, measured A/V sync). The ninja runs; a group of lanterns comes in; Sensei says a word's sounds
// ("blend": lanterns carry written words) or the banner shows a word ("read": lanterns carry pictures); the child taps
// the right lantern, the ninja leaps and bursts it, and Sensei blends the word as it lights up; crates, spikes and stars
// come between the words; after six words the ninja kicks the gong.
//
//   bun assets-src/clips/2026-09-27/run/drive.ts take <name> <clip 1|2|3> [--720p] [--gpu] [--nowait]
//   bun assets-src/clips/2026-09-27/run/drive.ts final <clip> <master> <start> <end> [posterAt]
//   bun assets-src/clips/2026-09-27/run/drive.ts sheet <file> [every]
//
// The clips (CLIPS below): each a different land, backdrop, word set and part of the run.
//   1  w1-9 Bamboo Village, Kai, two lanterns: the run's start ("Ninja Run! Tap to jump, and catch the right word!")
//      and the first words (one to blend, one to read).
//   2  w3-5 Misty Mountains, Suki, three lanterns: mid-run, one wrong lantern and Sensei's gentle correction, then the
//      right one.
//   3  w6-9 Sky Temple, Kai, three lanterns, a streak: the last words and the gong (flying kick, backflip, ground-pound,
//      cheer, "Bong! You made it to the gong!").
//
// PRODUCTION IS OLDER THAN src/ (27 Sep, play-Z1ApfqUX.js): its run has no starting gun (it opens on "Ninja Run! Tap
// to jump, and catch the right word!" and runs at once), asks "Listen to the sounds. What word do they make?" (then
// rotated cues) + the sounds, praises every word, corrects with "That says… <the tapped word's sounds, word>. Listen…
// <the sounds>", and its pickups are petals. Its __snState has no `next`/`started`/`busy`, and its __snRun() flies at a
// lantern without a tap. So the child here goes by window.__runLanterns() (the lanterns and `cueDone`).
//
// The child: after the rig's head clapper the drive clears the storage and reloads (the run starts clean, the clapper
// is never over it). It never taps a lantern while Sensei is asking (cueDone false) or before every lantern is in view:
// it looks for 0.5–0.9 s (a word to read and its pictures: 0.9–1.4 s), then taps the right lantern with a real
// pointerdown on the canvas at the lantern (the game's own hit test; the rig's ripple shows the tap). A planned slip
// taps a wrong one first, listens to the whole correction, looks again and taps the right one. Between the words a small
// in-page helper (runJumper) taps the open sky to jump a crate or spikes when the ninja has no streak (with a streak the
// game's ninja kicks crates and flips spikes itself), and jumps through most petal arcs; it finds them where the game
// draws them (a wrapped drawImage on the lower canvas, `.run-under`).
//
// Decisions (27 Sep; this editor writes only under assets-src/clips/2026-09-27/):
// - The save: a child who has played every level before this one (three stars each), who knows Ninja Run (two tellings,
//   last played yesterday: src's "short" form; production has no forms), and who has had the once-only explanations (Baron's motive, gem energy, the first streak,
//   the first reading group, the left-to-right sweep in lands 1–2) and the spaced "two letters, one sound" reminders
//   (the battle and boss editors decided the same): the clip is the run's own loop.
// - There is no monster in Ninja Run: "the monster faces the ninja" does not apply.
// - w1-9 has only two picture words, so production makes every group there a blend group (a reading group needs three
//   pictures): clip 1 has no picture lanterns; clips 2 and 3 have one reading group each.
// - 720p. A 1080p probe (c1-w1-9-kai-p1, load 8) drew 37 fps with six 80–124 ms freezes; every 720p take drew 60 fps.
//   The spec allows 1280×720 for a 720p source (the other editors decided the same).
// - Cut with ./cut.ts (from ../boss/cut.ts), changed to take an exact frame count from an exact seek with no fps filter
//   and no -shortest: the rig's `-t` + fps=30 + -shortest dropped a frame near the end and repeated the last, or came
//   out a frame short.
// - Finals (takes/takes.log has every take; all six at 60 fps):
//   run-1 from c1-w1-9-kai-720-t2 (no freeze, sync ±18 ms), 2.70–29.40: in on the fade-up after the reload, out 0.7 s
//     after the second word's trophy has gone, before the next question. (t1, "it"/"at", was also clean; t2 opens on
//     the three-sound "mat".)
//   run-2 from c2-w3-5-suki-720-t1 (no freeze, ±37 ms), 20.10–52.10: the reading group "zip" (with the once-a-land
//     "Ninjas read this way!") and the blend group "web" with the slip on "wet". (t2, a slip on "jog" for "jig", was
//     clean too, but has no reading group in its window.)
//   run-3 from c3-w6-9-kai-720-t2 (no freeze, ±19 ms), 62.40–90.667: "road", then "pram" (reading), the six-streak
//     power-up and the gong; out one frame before the reward screen cuts in (90.700). t1 froze 99 ms in that window.
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { LEVELS } from "../../../../src/content/worlds";
import { GRAPHEMES } from "../../../../src/content/phonics";
import { antiSampler, bufferDurations } from "./antisampler";
import { cut } from "./cut";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export interface Clip {
  level: string;
  hero: "kai" | "suki";
  /** how long to film (from the first load; the reload and the opening line take ~8 s, each word ~12 s, the gong ~6 s) */
  seconds: number;
  /** a slip: the word (1-based, in the order asked) where the child taps a wrong lantern first */
  miss?: number;
}
export const CLIPS: Record<string, Clip> = {
  "1": { level: "w1-9", hero: "kai", seconds: 36 },
  "2": { level: "w3-5", hero: "suki", seconds: 74, miss: 3 },
  "3": { level: "w6-9", hero: "kai", seconds: 105 },
};

/** A child who has played every level before this one, knows Ninja Run, and has had the once-only explanations (see
 *  Decisions above). */
export function saveFor(level: string, hero: "kai" | "suki") {
  const i = LEVELS.findIndex((l) => l.id === level);
  const stars = Object.fromEntries(LEVELS.slice(0, i).map((l) => [l.id, 3]));
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const once = { n: 1, at: [0], s: [0] };
  const narr: Record<string, unknown> = {
    "baron-motive": once, "gem-energy": once, "run:read": once, "left-right:w1": once, "left-right:w2": once,
    "ready:first": once, "ready:paw": once,
    // two tellings in earlier sessions, last played yesterday (session 4): today (session 5) is the short form
    "game:run": { n: 2, at: [0, 0], s: [1, 2], lastAt: Date.now() - 86_400_000, lastSession: 4, struggled: false },
  };
  for (const g of Object.keys(GRAPHEMES)) (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  return tweetSave({
    hero, stars, schoolYear: "none", seenStreak: true, narr, sessions: 5,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

/** In the page, before the game: where the run draws its crates, spikes and stars (a wrapped drawImage on the lower
 *  canvas, `.run-under`: stage x, y and whether it is tilted, i.e. already bumped), and a child's jumps: while
 *  window.__autoJump is on and no lantern is in play, a tap on open ground to jump a crate or spikes coming up (only
 *  without a streak: with one the game's ninja deals with them itself) and to jump through most star arcs. */
export function runJumper() {
  const w = window as any;
  const CR = w.CanvasRenderingContext2D?.prototype;
  if (!CR || CR.__snJumper) return;
  CR.__snJumper = true;
  const DI = CR.drawImage;
  const seen: { k: string; x: number; y: number; tilt: boolean; t: number }[] = [];
  w.__runSeen = seen;
  CR.drawImage = function (img: any, ...a: any[]) {
    try {
      if (img && img.tagName === "IMG" && this.canvas?.classList?.contains("run-under")) {
        let k = img.__snKind;
        if (k === undefined) {
          const m = /item_(crate|spikes|star|petal)/.exec(img.currentSrc || img.src || "");
          k = img.__snKind = m ? (m[1] === "petal" ? "star" : m[1]) : ""; // (production's pickups are petals, src's stars)
        }
        if (k) {
          const m = this.getTransform();
          const s = this.canvas.width / 1280 || 1;
          seen.push({ k, x: m.e / s, y: m.f / s, tilt: Math.abs(m.b) > 0.02 * s, t: performance.now() });
          if (seen.length > 600) seen.splice(0, 300);
        }
      }
    } catch {}
    return DI.call(this, img, ...a);
  };
  const HX = 235;
  let lastJump = -1e9;
  const arcs = new Map<number, boolean>(); // per star arc (by its world x, rounded): does the child jump for it?
  const hist: { t: number; d: number }[] = [];
  const tap = () => {
    const c = document.querySelector(".run-scene > canvas:not(.run-under)") as HTMLCanvasElement | null;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const x = 470 + Math.random() * 140, y = 440 + Math.random() * 70; // open sky over the track, clear of the lanterns
    c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", clientX: r.left + (x / 1280) * r.width, clientY: r.top + (y / 720) * r.height }));
    lastJump = performance.now();
    (w.__snJumps ??= []).push({ t: Date.now() });
  };
  const tick = () => {
    requestAnimationFrame(tick);
    try {
      const now = performance.now();
      const d = typeof w.__runDist === "function" ? w.__runDist() : null;
      if (d == null) return;
      hist.push({ t: now, d });
      while (hist.length > 2 && now - hist[0].t > 180) hist.shift();
      const v = hist.length > 1 ? ((d - hist[0].d) / Math.max(1, now - hist[0].t)) * 1000 : 0;
      if (!w.__autoJump) return;
      const st = w.__snState;
      if (!st || st.scene !== "run" || st.finished || st.gong) return;
      if (now - lastJump < 1000) return;
      const L = typeof w.__runLanterns === "function" ? w.__runLanterns() : null;
      // (a jump while lanterns are in play only while every one is still well to the right: the tap point is never
      // within the game's 110 px of a lantern, and a jump can't touch one; the obstacles come in with the lanterns)
      if (L && L.lanterns.some((l: any) => !l.popped && l.x < 520)) return;
      if (v < 200) return;
      // the latest drawn frame's things
      const last = seen.length ? seen[seen.length - 1].t : 0;
      if (now - last > 80) return;
      const frame = seen.filter((e) => e.t >= last - 4);
      const ahead = frame.filter((e) => e.x - HX > 0).sort((p, q) => p.x - q.x);
      // a crate or spikes: in the air while it passes under (the game trips the ninja if it is under 70 px up while
      // the obstacle is within 60 px): a jump when it is `lo`… `lo + 35%` of the window away
      if ((st.glow ?? 0) === 0) {
        const ob = ahead.find((e) => e.k !== "star" && !e.tilt);
        if (ob) {
          const dx = ob.x - HX, lo = 60 + 0.058 * v, hi = 0.795 * v - 60;
          if (hi > lo + 20 && dx >= lo && dx <= lo + 0.35 * (hi - lo) + 6) return void tap();
        }
      }
      // a star arc (four stars, 70 px apart): up as its first star comes in, so the high ones are caught
      const s0 = ahead.find((e) => e.k === "star");
      if (s0 && ahead.filter((e) => e.k === "star" && e.x - s0.x < 260).length >= 3) {
        const key = Math.round((s0.x + d) / 50);
        if (!arcs.has(key)) arcs.set(key, Math.random() < 0.8);
        const dx = s0.x - HX;
        if (arcs.get(key) && dx >= 25 && dx <= 25 + 0.09 * v) return void tap();
      }
    } catch {}
  };
  requestAnimationFrame(tick);
}

export async function drive(page: Page, rig: Rig, clip: Clip) {
  await page.context().addInitScript(antiSampler);
  await page.context().addInitScript(bufferDurations);
  await page.context().addInitScript(runJumper);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let shown = false;
  let word = "";
  let wordN = 0;
  let missed = false;
  let asked = false; // this word's question (or the correction) has begun: Sensei's cue is playing or has played
  let lookFrom = 0, lookMs = 0;
  let tappedAt = 0;
  let readySince = 0;
  let jumpsSeen = 0;
  while (rig.live()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {}, L = w.__runLanterns?.();
      const live = L ? L.lanterns.filter((l: any) => !l.popped) : [];
      const right = live.find((l: any) => l.correct);
      return {
        scene: st.scene, finished: st.finished, gong: st.gong, mode: st.mode, glow: st.glow, event: st.event,
        ready: nav.next === "ready", again: !!document.querySelector('button[aria-label="Play again"]'), talking: !!document.querySelector(".help-btn.talking"),
        jumps: (w.__snJumps || []).length, cueDone: L?.cueDone, right: right ? right.word : null, allIn: live.length > 0 && live.every((l: any) => l.x < 1100),
      };
    }).catch(() => ({}));
    const now = Date.now();
    if (!shown && s.scene === "run") {
      shown = true;
      rig.mark("run");
      await page.evaluate(() => ((window as any).__autoJump = true)).catch(() => {});
    }
    if (s.jumps > jumpsSeen) {
      for (let k = jumpsSeen; k < s.jumps; k++) rig.mark("jump");
      jumpsSeen = s.jumps;
    }
    // a held step: the green arrow a beat after Sensei has finished (never on the reward screen)
    if (s.ready) {
      if (!readySince || s.talking) readySince = now;
      if (now - readySince > 1100 && !s.again && s.scene === "run") {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(60);
      continue;
    }
    readySince = 0;
    if (s.scene !== "run" || !s.right) {
      await rig.wait(40);
      continue;
    }
    if (s.right !== word) {
      word = s.right;
      wordN++;
      missed = false;
      asked = false;
      lookFrom = 0;
      tappedAt = 0;
      rig.mark(`word ${wordN} ${word} ${s.mode}`);
    }
    // Sensei is asking (or correcting): listen
    if (!s.cueDone) {
      asked = true;
      lookFrom = 0;
      await rig.wait(40);
      continue;
    }
    if (!asked || !s.allIn || (tappedAt && now - tappedAt < 2500)) {
      await rig.wait(40);
      continue;
    }
    if (!lookFrom) {
      lookFrom = now;
      lookMs = s.mode === "read" ? jitter(900, 1400) : missed ? jitter(650, 950) : jitter(500, 900);
    }
    if (now < lookFrom + lookMs) {
      await rig.wait(Math.min(40, lookFrom + lookMs - now));
      continue;
    }
    const slip = clip.miss === wordN && !missed;
    // a real tap on the canvas at the lantern (the game's own hit test: within 110 px of its middle)
    const hit: string | null = await page.evaluate((wrong) => {
      const w = window as any, L = w.__runLanterns?.();
      const live = (L?.lanterns ?? []).filter((l: any) => !l.popped && l.x < 1130 && l.x > 60);
      const pick = wrong ? live.filter((l: any) => !l.correct).sort((a: any, b: any) => a.x - b.x)[0] : live.find((l: any) => l.correct);
      const c = document.querySelector(".run-scene > canvas:not(.run-under)") as HTMLCanvasElement | null;
      if (!pick || !c) return null;
      const r = c.getBoundingClientRect();
      const x = pick.x + (Math.random() * 16 - 8), y = pick.y + 30 + (Math.random() * 12 - 6);
      c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, isPrimary: true, pointerType: "touch", clientX: r.left + (x / 1280) * r.width, clientY: r.top + (y / 720) * r.height }));
      return pick.word;
    }, slip).catch(() => null);
    if (!hit) {
      await rig.wait(60);
      continue;
    }
    if (slip) {
      missed = true;
      asked = false; // wait for the correction to begin, and to end
      lookFrom = 0;
      rig.mark(`miss ${hit} (for ${word})`);
    } else {
      tappedAt = now;
      lookFrom = 0;
      rig.mark(`tap ${hit}`);
    }
    await rig.wait(120);
  }
}

/** Another clip editor's take is running (a bun …/clips/2026-09-27/<other>/…ts process). */
function othersFilming(): boolean {
  const ps = spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n");
  return ps.some((l) => /^bun .*clips\/2026-09-27\/(?!run\/)[^/]+\/(drive|takes)\.ts/.test(l));
}
/** Wait until the 1-minute load is under `max` (twice, 12 s apart) and no other editor is filming (that wait gives up
 *  after 5 minutes); gives up altogether after `maxMin` minutes. */
export async function waitForQuiet(max = 12, maxMin = 40) {
  const t0 = Date.now();
  for (;;) {
    const quiet = loadavg()[0] < max && (!othersFilming() || Date.now() - t0 > 5 * 60_000);
    if (quiet) {
      await new Promise((r) => setTimeout(r, 8_000 + Math.random() * 4000));
      if (loadavg()[0] < max + 2) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[run] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
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
    const secArg = a.find((x) => x.startsWith("--seconds="));
    console.log(`[run] ${name}: filming ${clip.level} (${clip.hero}) at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({
      name, url: `/play/?level=${clip.level}`, base: PROD, save: saveFor(clip.level, clip.hero), seconds: secArg ? Number(secArg.slice(10)) : clip.seconds, outDir: TAKES,
      drive: (p, r) => drive(p, r, clip), size: a.includes("--720p") ? "720p" : "1080p", gpu: a.includes("--gpu"),
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { shift: rec.sync.audioShiftMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs, residual: rec.sync.residualMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "scene", "sting", "music-stop", "mark", "hitch", "tap"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "final") {
    // final <clip 1|2|3> <master> <start> <end> [posterAt]: cut to ../run-<clip>.mp4 with its poster, the sound lined
    // up by the claps' residual (interpolated between the head's and the tail's medians at the window's middle), and a
    // contact sheet (every 0.5 s) of the finished clip beside this file
    const [id, m, sArg, eArg, posterArg] = a;
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
    const out = join(HERE, "..", `run-${id}.mp4`);
    // the fade-out never reaches into a voice: it starts after the last line's voice has ended (its file's last ~0.1 s
    // is silence), 50–250 ms long
    const lastLine = (tl.events as TimelineEvent[]).filter((e) => e.kind === "speech" && e.t < end).pop();
    const voiced = lastLine ? endOf(lastLine) - 0.1 : 0;
    const fadeOutMs = Math.round(Math.max(50, Math.min(250, (end - voiced) * 1000 - 20)));
    const res = cut(master, start, end, out, { posterAt: posterArg ? Number(posterArg) : undefined, audioLateMs: late, fadeOutMs });
    const sheet = contactSheet(out, 0.5, join(HERE, `run-${id}.sheet.jpg`));
    console.log(JSON.stringify({ ...res, start, end, audioLateMs: late, head, tail, fadeOutMs, sheet }, null, 1));
  } else if (cmd === "frames") {
    // frames <file> <out-prefix> <t1> [t2 …]: single frames (full size) at those times, for checking in and out points
    const [f, prefix, ...ts] = a;
    for (const t of ts) {
      const out = `${resolve(prefix)}-${Number(t).toFixed(3)}.jpg`;
      spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", resolve(f), "-ss", String(t), "-frames:v", "1", "-q:v", "3", out]);
      console.log(out);
    }
  } else if (cmd === "stats") {
    // stats <file> <from> <len>: per frame, the mean luma, its spread and how much it differs from the frame before
    const [f, from, len] = a;
    const start = Math.round(Number(from) * 30) / 30;
    const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", resolve(f), "-ss", String(start), "-t", len, "-vf", "scale=96:54,format=gray", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 28 });
    const px = 96 * 54, n = Math.floor(r.stdout.length / px);
    for (let k = 0; k < n; k++) {
      let s1 = 0, s2 = 0, d = 0;
      for (let i = 0; i < px; i++) {
        const v = r.stdout[k * px + i];
        s1 += v;
        s2 += v * v;
        if (k) d += Math.abs(v - r.stdout[(k - 1) * px + i]);
      }
      const mean = s1 / px;
      console.log(`${(start + k / 30).toFixed(3)} mean ${mean.toFixed(1)} sd ${Math.sqrt(Math.max(0, s2 / px - mean * mean)).toFixed(1)} diff ${(d / px).toFixed(2)}`);
    }
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1, a[2] ? resolve(a[2]) : undefined));
  } else {
    console.log("usage: drive.ts take <name> <1|2|3> [--720p] [--gpu] [--nowait] [--seconds=N] | final <clip> <master> <start> <end> [posterAt] | sheet <file> [every] [out]");
  }
  process.exit(0);
}
