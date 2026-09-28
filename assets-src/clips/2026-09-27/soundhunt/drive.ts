// Clip editor "soundhunt" (27 Sep 2026): normal gameplay clips of Sound Hunt (Early.tsx SoundHuntLevel), filmed on
// PRODUCTION at real speed with the rig in scripts/tweet-clips.ts. The hunt: two pictures, "Which one has this sound in
// it? /i/... piiin... paaan", the child taps one, the ninja strikes it (or gives a living thing a gift), "Pin has this
// sound in the middle... /i/", and (in Sensei's and the together turns) "This is how we spell... /i/" as the ninja's
// spell writes the letter under the picture. Then the next pair ("Let's do it together!", "Now it's your turn!").
//
//   bun assets-src/clips/2026-09-27/soundhunt/drive.ts take <name> <level> <kai|suki> [seconds] [--miss=N] [--720p] [--gpu] [--nowait]
//   bun assets-src/clips/2026-09-27/soundhunt/drive.ts window <master> <plan>        the cut a plan picks (JSON)
//   bun assets-src/clips/2026-09-27/soundhunt/drive.ts cut <master> <start> <end> <out.mp4> [posterAt]
//   bun assets-src/clips/2026-09-27/soundhunt/drive.ts sheet <file> [from] [to] [every]
//
// --miss=N: the child's Nth own answer (1 = the together turn, 2 = the first turn alone) goes to the wrong picture
// first, so Sensei's gentle correction shows ("Listen again... liiid... maaat"), then the right one.
//
// The drive plays like an attentive child: after the rig's head clapper it clears the storage and reloads (the level
// starts clean, from its introduction; the first load's sounds are not in the soundtrack), taps the green arrow on a
// held step after a beat, and answers a turn 0.8–1.25 s after Sensei has finished asking (never mid-question). It reads
// the game's state with one light evaluate every ~90 ms (the page is busy enough).
//
// The finals (27 Sep), cut with ./cut.ts (25 ms fade in, 250 ms out) at the windows `window` picks:
//   soundhunt-1  w1-7  Kai   takes/c1-kai-b    "pair"  28.067–58.767  poster 11.88   (c1-kai-a 14 fps, c1-kai-c also clean)
//   soundhunt-2  w1-11 Suki  takes/c2-suki-c   "pair"  27.967–59.600  poster 12.54   (c2-suki-a 38 fps, c2-suki-b clean)
//   soundhunt-3  w1-7  Suki  takes/c3-suki-c   "fix"   43.767–76.767  poster 30.75   (--miss=2; a, b had 70–137 ms freezes in
//                                                                                     the window, d clean)
// Every take films with the anti-sampler (./antisampler.ts): without it, Chrome's capturer froze the picture for 266 ms
// about a second after every strike and spell.
//
// The machine is shared with the treadmill bots and the other clip editors: a take first waits (up to 25 min) until the
// load has eased, so the camera gets a fair share of the CPU.
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, trim, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { antiSampler } from "./antisampler";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const saveFor = (hero: "kai" | "suki") => tweetSave({ hero, settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true } });

export interface Plan {
  /** the child's own answers (together / alone) that go to the wrong picture first, 1-based */
  miss?: number[];
}

export async function drive(page: Page, rig: Rig, plan: Plan = {}) {
  // (the filmed document gets the anti-sampler specks: see antisampler.ts)
  await page.context().addInitScript(antiSampler);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let readySince = 0;
  let turnKey = "";
  let turnSince = 0;
  let lookMs = 0;
  let own = 0;
  let missedThis = false;
  let wasBusy = true;
  while (rig.live()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
      const opts = Array.from(document.querySelectorAll(".pick-row [aria-label]")).map((e) => e.getAttribute("aria-label"));
      return { scene: st.scene, next: st.next, busy: st.busy, ready: nav.next === "ready", again: !!document.querySelector('button[aria-label="Play again"]'), opts };
    }).catch(() => ({}));
    const now = Date.now();
    // a held step: the green arrow, after a beat (never at the level's end: "Play again" is there)
    if (s.ready) {
      if (!readySince) readySince = now;
      if (now - readySince > 1100 && !s.again) {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(90);
      continue;
    }
    readySince = 0;
    if (s.scene === "pick" && s.next) {
      if (s.busy) {
        wasBusy = true;
        await rig.wait(90);
        continue;
      }
      // the child's turn (again): look, then answer
      if (wasBusy || s.next !== turnKey) {
        if (s.next !== turnKey) missedThis = false;
        turnKey = s.next;
        turnSince = now;
        lookMs = missedThis ? jitter(800, 1100) : jitter(800, 1250);
        wasBusy = false;
      }
      if (now - turnSince < lookMs) {
        await rig.wait(60);
        continue;
      }
      const other = (s.opts as string[]).find((o) => o && o !== s.next);
      if (!missedThis && other && (plan.miss ?? []).includes(own + 1)) {
        rig.mark(`miss ${other} (for ${s.next})`);
        await rig.tap(`.pick-row [aria-label="${other}"]`);
        missedThis = true;
        wasBusy = true;
        await rig.wait(400);
        continue;
      }
      rig.mark(`tap ${s.next}`);
      await rig.tap(`.pick-row [aria-label="${s.next}"]`);
      own++;
      wasBusy = true;
      await rig.wait(500);
      continue;
    }
    await rig.wait(90);
  }
}

/** Wait (up to `maxMin` minutes) until the 1-minute load is under `load`,
 *  twice 12 s apart (so two waiting editors that see the same dip don't both start). */
async function waitForQuiet(maxMin = 25, load = 14) {
  const t0 = Date.now();
  const busy = () => {
    const ps = spawnSync("ps", ["-eo", "pid,command"]).stdout.toString().split("\n");
    const others = ps.filter((l) => /assets-src\/clips\/2026-09-27\/(?!soundhunt\/)[^/]+\/\S+\.ts\b/.test(l) && !/\bgrep\b/.test(l));
    // (other editors' takes count through the load: waiting for none at all could take hours)
    return { busy: loadavg()[0] > load, others: others.length };
  };
  for (;;) {
    const a = busy();
    if (!a.busy) {
      await new Promise((r) => setTimeout(r, 12_000 + Math.random() * 6000));
      if (!busy().busy) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[soundhunt] recording anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)}, ${a.others} other clip scripts)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
}

// ------------------------------------------------------------------------------------------------ the edit
const speech = (ev: TimelineEvent[]) => ev.filter((e) => e.kind === "speech");
const endOf = (e: TimelineEvent) => e.t + (e.dur ?? 0);
/** The master's frames in [from, from + len) (a region [x, y, w, h] of them, in 1920×1080 px), as small grey pictures;
 *  returns the frame (seconds, on the 1/30 s grid) where the picture changes most from the one before. */
function biggestChange(master: string, from: number, len: number, region?: number[]): number {
  const start = Math.round(Math.max(0, from) * 30) / 30;
  const crop = region ? `crop=${region[2]}:${region[3]}:${region[0]}:${region[1]},` : "";
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", master, "-ss", String(start), "-t", String(len), "-vf", `${crop}scale=96:54,format=gray`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 28 });
  const px = 96 * 54, n = Math.floor(r.stdout.length / px);
  let best = -1, at = start;
  for (let k = 1; k < n; k++) {
    let d = 0;
    for (let i = 0; i < px; i++) d += Math.abs(r.stdout[k * px + i] - r.stdout[(k - 1) * px + i]);
    if (d > best) (best = d), (at = start + k / 30);
  }
  return Math.round(at * 30) / 30;
}
/**
 * The windows, from a take's own events and pictures:
 *  - "pair": the together turn and the first turn alone. In on the first frame of the new pair dropping in, with
 *    "Let's do it together!" (never on the old pair: a one-frame flash); out with the turn alone's letter showing, two
 *    frames before the level moves on to Word Building ("Lid has this sound in the middle... /i/").
 *  - "fix": the first turn alone, with its correction, and the next turn alone. In on "Now it's your turn!"'s pair
 *    dropping in (or, `fromQuestion`, just before its question, when the whole would be over 35 s); out with the next
 *    turn's teaching done, two frames before the following pair drops in.
 */
export function editWindow(master: string, ev: TimelineEvent[], plan: "pair" | "fix", fromQuestion = false): { start: number; end: number; poster: number; beats: string[] } {
  const sp = speech(ev);
  const first = (id: string, after = 0) => sp.find((e) => e.id === id && e.t >= after);
  const opener = plan === "pair" ? first("wedo") : first("youdo");
  if (!opener) throw new Error(`no ${plan === "pair" ? "wedo" : "youdo"} line`);
  // (the pictures row: stage y 128–416 → 192–624 px at 1080p)
  let start = biggestChange(master, opener.t - 0.8, 1.0, [300, 150, 1400, 500]);
  if (fromQuestion) {
    const q = first("hunt_q", opener.t);
    const prev = [...sp].reverse().find((e) => q && e.t < q.t);
    if (q) start = Math.round(Math.max(q.t - 0.5, prev ? endOf(prev) + 0.15 : 0) * 30) / 30;
  }
  // the turns in the window: each "mid_*" line (the teaching after a right answer) and the pure sound after it
  const mids = sp.filter((e) => e.t > opener.t && /^mid_|^has_in_middle/.test(e.id));
  if (mids.length < 2) throw new Error(`only ${mids.length} teaching lines after ${opener.id}`);
  const lastMid = mids[1];
  const lastSound = sp.find((e) => e.t > lastMid.t && e.id.startsWith("sound:"));
  const tail = lastSound ? endOf(lastSound) : endOf(lastMid);
  const next = sp.find((e) => e.t > tail - 0.05 && !e.id.startsWith("sound:"));
  // the next screen (or pair) appears a little before its first line is heard: find it, and stop two frames before
  const change = next ? biggestChange(master, Math.max(tail + 0.1, next.t - 0.6), Math.min(0.9, next.t + 0.2 - tail), undefined) : Infinity;
  const end = Math.min(tail + 0.9, change - 2 / 30);
  const beats = ev.filter((e) => e.t >= start && e.t <= end && (e.kind === "speech" || e.kind === "tap" || e.kind === "hitch" || e.kind === "sfx")).map((e) => `${(e.t - start).toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}`);
  // the poster: the first answer's picture struck, its star on it, Sensei teaching ("… has this sound in the middle")
  const poster = mids[0].t + 0.7 - start;
  return { start, end, poster, beats };
}

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, level, hero] = a;
    const secs = Number(a.slice(3).find((x) => !x.startsWith("--")) ?? 70);
    const miss = a.find((x) => x.startsWith("--miss="))?.slice(7).split(",").map(Number).filter(Boolean) ?? [];
    mkdirSync(TAKES, { recursive: true });
    if (!a.includes("--nowait")) await waitForQuiet();
    console.log(`[soundhunt] ${name}: recording at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({
      name, url: `/play/?level=${level}`, base: PROD, save: saveFor(hero as "kai" | "suki"), seconds: secs, outDir: TAKES,
      drive: (p, r) => drive(p, r, { miss }), size: a.includes("--720p") ? "720p" : "1080p", gpu: a.includes("--gpu"),
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { shift: rec.sync.audioShiftMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "tap", "scene", "sting", "music-stop", "mark"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "window") {
    const tl = resolve(a[0]).replace(/\.master\.mp4$/, ".timeline.json");
    const w = editWindow(resolve(a[0]), JSON.parse(readFileSync(tl, "utf8")).events, (a[1] ?? "pair") as "pair" | "fix", a.includes("--question"));
    console.log(JSON.stringify({ start: w.start, end: w.end, len: +(w.end - w.start).toFixed(3), poster: w.poster }));
    console.log(w.beats.join("\n"));
  } else if (cmd === "cut") {
    const r = trim(resolve(a[0]), Number(a[1]), Number(a[2]), resolve(a[3]), a[4] ? { posterAt: Number(a[4]) } : {});
    console.log(JSON.stringify(r, null, 1));
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1));
  } else {
    console.log("usage: drive.ts take <name> <level> <kai|suki> [seconds] [--miss=N,M] [--720p] [--gpu] [--nowait] | window <master> <pair|fix> | cut <master> <start> <end> <out.mp4> [posterAt] | sheet <file> [every]");
  }
  process.exit(0);
}
