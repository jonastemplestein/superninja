// Clip editor "boss" (27 Sep 2026): normal gameplay clips of the boss battles (Battle.tsx with level.kind "boss"),
// filmed on PRODUCTION at real speed with the camera rig in scripts/tweet-clips.ts (CDP screencast, the real soundtrack
// rebuilt from window.__audioLog, measured A/V sync).
//
//   bun assets-src/clips/2026-09-27/boss/drive.ts take <name> <clip 1|2|3> [--720p] [--gpu]
//   bun assets-src/clips/2026-09-27/boss/drive.ts window <master> <clip>       the cut the clip's window picks (JSON)
//   bun assets-src/clips/2026-09-27/boss/drive.ts cut <master> <start> <end> <out.mp4> [posterAt]
//   bun assets-src/clips/2026-09-27/boss/drive.ts sheet <file> [every] [from] [to]
//
// The clips (CLIPS below): each a different boss, land, hero and part of the fight.
//   1  w1-15 Bamboo Village, the sumo panda, Suki: the boss arrives (Baron Muddle's threat, the ninja powers up, "A big
//      boss monster! Listen carefully, and spell your best!") and the first words are spelt.
//   2  w3-12 Snowy Mountains, the yeti, Kai: mid-fight, one slip and Sensei's gentle correction, then the half-way roar
//      ("Grrrr... You dare to fight ME?").
//   3  w6-11 the last land, Baron Muddle himself, Suki: the last words and the win (the somersault volley of stars, the
//      Baron blasted into the sky: "Nooo! My muddle! ... I will be back!", bonked by a star).
//
// The child: after the rig's head clapper the drive clears the storage and reloads (the level starts clean from its
// intro, and the clapper is never over it), waits while the scene is locked (Sensei or the Baron talking), looks at the
// new word for 0.5–0.8 s, then taps each sound's tile once the previous pure sound has been heard to its end (it reads
// each sound's length from the page's own audio buffers), about one tap a second. A planned slip taps a wrong tile,
// waits for Sensei's correction, looks again, and taps the right one. Held steps get the green arrow after a beat;
// nothing is tapped on the reward screen.
//
// Decisions (27 Sep, logged here: this editor writes only under assets-src/clips/2026-09-27/):
// - 720p. Two 1080p takes of clip 1 on the shared machine (load 9–25, three other editors filming) drew 40–41 fps with
//   the picture's latency drifting 40 → 270 ms (sync off by up to 159 ms); every 720p take at a similar load drew 59 fps
//   with no freeze. The spec allows 1280×720 when the source is 720p.
// - The finals are cut with `final` (below): the window from the take's own events, the sound lined up by the claps'
//   residual at the window's middle, the fade-out kept out of the last voice, a poster picked by eye.
// - The "two letters, one sound" reminders are retired in the save (see saveFor), as the battle editor did.
// - Finals: boss-1 from c1-…-720-t3 (t1 was also clean; t3 has two three-sound words, top and not), boss-2 from
//   c2-…-720-t1 (t2 froze all through). boss-3 from c3-…-720-t3 (59 fps, no freeze in the whole take), cut
//   100.30–129.945 by hand: its two-word window ran 36.9 s (the Baron's 6.5 s taunt sits between the last two words),
//   so it opens on the combo after "soap" (right after Sensei's blend), then the taunt, "wax", the win and "You beat
//   the boss! What a ninja!". t1 froze twice (86, 99 ms) under that reward line and t2 once (118 ms) as "snail" came
//   in; t1's clean part (green, road, the win, ending on the bonk before the reward screen) is kept as
//   boss/alt/boss-3-t1-green-road.mp4.
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
  /** how long to film (from the first load; the reload and the boss's intro take ~20 s) */
  seconds: number;
  /** a slip: the word (1-based, in the order asked) and the slot (0-based) where the child taps a wrong tile first */
  miss?: { word: number; slot: number };
}
export const CLIPS: Record<string, Clip> = {
  "1": { level: "w1-15", hero: "suki", seconds: 72 },
  "2": { level: "w3-12", hero: "kai", seconds: 88, miss: { word: 4, slot: 1 } },
  "3": { level: "w6-11", hero: "suki", seconds: 155 },
};

/** A child who has played every level before this one (three stars each), with the once-only explanations it would
 *  have heard by then (Baron's motive, gem energy, the first streak) and the "two letters, one sound" / "this can
 *  be..." reminders retired (they are spaced over sessions: a child at a land's boss has had them; the battle editor
 *  decided the same), captions on and the music at the game's default. */
export function saveFor(level: string, hero: "kai" | "suki") {
  const i = LEVELS.findIndex((l) => l.id === level);
  const stars = Object.fromEntries(LEVELS.slice(0, i).map((l) => [l.id, 3]));
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = { "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] } };
  for (const g of Object.keys(GRAPHEMES)) (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  return tweetSave({
    hero, stars, schoolYear: "none", seenStreak: true, narr,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

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
  let shown = false;
  let word = "";
  let wordN = 0;
  let slot = 0;
  let missed = false;
  let wasLocked = true;
  let lookFrom = 0, lookMs = 0;
  let due = 0;
  let readySince = 0;
  while (rig.live()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
      return { scene: st.scene, next: st.next, locked: st.locked, word: st.word, hp: st.hp, ready: nav.next === "ready", again: !!document.querySelector('button[aria-label="Play again"]') };
    }).catch(() => ({}));
    const now = Date.now();
    if (!shown && s.scene === "battle") {
      shown = true;
      rig.mark("battle");
    }
    // a held step: the green arrow, after a beat (never on the reward screen)
    if (s.ready) {
      if (!readySince) readySince = now;
      if (now - readySince > 1100 && !s.again && s.scene === "battle") {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(80);
      continue;
    }
    readySince = 0;
    if (s.scene !== "battle" || s.locked || !s.next) {
      wasLocked = true;
      await rig.wait(40);
      continue;
    }
    if (s.word !== word) {
      word = s.word;
      wordN++;
      slot = 0;
      missed = false;
      rig.mark(`word ${wordN} ${word}`);
    }
    if (wasLocked) {
      // a new word (or the correction is over): a child looks, then starts
      wasLocked = false;
      lookFrom = now;
      lookMs = missed && slot === clip.miss?.slot ? jitter(650, 900) : jitter(520, 760);
      due = 0;
    }
    const at = Math.max(lookFrom + lookMs, due);
    if (now < at) {
      await rig.wait(Math.min(40, at - now));
      continue;
    }
    const letter: string = s.next;
    if (clip.miss && !missed && wordN === clip.miss.word && slot === clip.miss.slot) {
      // the slip: a tile that is not in the word at all if there is one
      const wrong = await page.evaluate(({ need, w }) => {
        const labels = Array.from(document.querySelectorAll(".row button[aria-label]")).map((e) => e.getAttribute("aria-label")!);
        const others = labels.filter((l) => l && l !== need);
        return others.find((l) => !w.includes(l)) ?? others[0] ?? null;
      }, { need: letter, w: word }).catch(() => null);
      if (wrong) {
        missed = true;
        rig.mark(`miss ${wrong} (for ${letter} in ${word})`);
        await rig.tap(`.row button[aria-label="${wrong}"]`);
        wasLocked = true;
        await rig.wait(300);
        continue;
      }
    }
    const T = Date.now();
    await rig.tap(`.row button[aria-label="${letter}"]`);
    rig.mark(`tap ${letter} (${word})`);
    slot++;
    // the next tap once this pure sound has been heard to its end, plus a beat (never faster than a real hand)
    let end = 0;
    for (let k = 0; k < 12 && !end; k++) {
      await rig.wait(40);
      const e: any = await page.evaluate((t0) => {
        const w = window as any, log = w.__audioLog || [];
        for (let i = log.length - 1; i >= 0; i--) {
          const x = log[i];
          if (x.t < t0 - 30) break;
          if (x.kind === "speech" && /^\/a\/p\//.test(x.url)) return { t: x.t, dur: (w.__bufDur || {})[x.sid] ?? null };
        }
        return null;
      }, T).catch(() => null);
      if (e) end = e.t + (e.dur ?? 0.7) * 1000;
    }
    due = Math.max(T + jitter(800, 920), (end || T + 700) + jitter(200, 340));
  }
}

/** Another clip editor's take is running (a bun …/clips/2026-09-27/<other>/…ts process). */
function othersFilming(): boolean {
  const ps = spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n");
  return ps.some((l) => /^bun .*clips\/2026-09-27\/(?!boss\/)[^/]+\/drive\.ts/.test(l));
}
/** Wait until the 1-minute load is under `max` (twice, 12 s apart) and no other editor is filming (that wait gives up
 *  after 5 minutes: theirs may be waiting too); gives up altogether after `maxMin` minutes. */
export async function waitForQuiet(max = 12, maxMin = 60) {
  const t0 = Date.now();
  for (;;) {
    const quiet = loadavg()[0] < max && (!othersFilming() || Date.now() - t0 > 5 * 60_000);
    if (quiet) {
      await new Promise((r) => setTimeout(r, 12_000 + Math.random() * 6000));
      if (loadavg()[0] < max + 2) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[boss] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
      return;
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
}

// ------------------------------------------------------------------------------------------------ the edit
const speech = (ev: TimelineEvent[]) => ev.filter((e) => e.kind === "speech");
const endOf = (e: TimelineEvent) => e.t + (e.dur ?? 0);
const marks = (ev: TimelineEvent[], re: RegExp) => ev.filter((e) => e.kind === "mark" && re.test(e.id));
const f30 = (t: number) => Math.round(t * 30) / 30;
/** The master's frames in [from, from + len) (a region [x, y, w, h] of them, in picture px), as small grey pictures;
 *  per frame (seconds, on the 1/30 s grid) how much it differs from the one before (0–255 mean). */
export function frameDiffs(master: string, from: number, len: number, region?: number[]): { t: number; d: number }[] {
  const start = f30(Math.max(0, from));
  const crop = region ? `crop=${region[2]}:${region[3]}:${region[0]}:${region[1]},` : "";
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", master, "-ss", String(start), "-t", String(len), "-vf", `${crop}scale=96:54,format=gray`, "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 28 });
  const px = 96 * 54, n = Math.floor(r.stdout.length / px);
  const out: { t: number; d: number }[] = [];
  for (let k = 1; k < n; k++) {
    let d = 0;
    for (let i = 0; i < px; i++) d += Math.abs(r.stdout[k * px + i] - r.stdout[(k - 1) * px + i]);
    out.push({ t: f30(start + k / 30), d: d / px });
  }
  return out;
}

/** The first frame in [from, to] where the picture changes at once (the next word's card and tiles coming in: a mean
 *  difference over 4, where the game's own motion stays under ~2.5), or the biggest change there. */
export function changeAt(master: string, from: number, to: number): number {
  const d = frameDiffs(master, from, Math.max(0.1, to - from));
  if (!d.length) return to;
  return (d.find((x) => x.d > 4) ?? d.reduce((a, b) => (b.d > a.d ? b : a), d[0])).t;
}
/** Per frame in [from, from + len): mean luma and its spread (a plain loading screen has almost none). */
export function frameStats(master: string, from: number, len: number): { t: number; mean: number; sd: number }[] {
  const start = f30(Math.max(0, from));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", master, "-ss", String(start), "-t", String(len), "-vf", "scale=96:54,format=gray", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 28 });
  const px = 96 * 54, n = Math.floor(r.stdout.length / px);
  const out: { t: number; mean: number; sd: number }[] = [];
  for (let k = 0; k < n; k++) {
    let s = 0, s2 = 0;
    for (let i = 0; i < px; i++) {
      const v = r.stdout[k * px + i];
      s += v;
      s2 += v * v;
    }
    const mean = s / px;
    out.push({ t: f30(start + k / 30), mean, sd: Math.sqrt(Math.max(0, s2 / px - mean * mean)) });
  }
  return out;
}

export interface Window { start: number; end: number; poster: number; beats: string[] }
/** The window for a clip, from a take's own events (and, for the in-point of clip 1, its pictures). */
export function editWindow(master: string, ev: TimelineEvent[], id: string): Window {
  const sp = speech(ev);
  const words = marks(ev, /^word \d+ /).map((m) => ({ n: Number(m.id.split(" ")[1]), text: m.id.split(" ")[2], t: m.t }));
  /** the word's prompt: the first word:<text> line after its mark's word began being asked (the mark comes when the
   *  child may answer, just after the prompt ends) */
  const prompt = (n: number) => {
    const w = words.find((x) => x.n === n);
    return w ? [...sp].reverse().find((e) => e.id === `word:${w.text}` && e.t <= w.t + 0.05) : undefined;
  };
  /** what is said after the word's last tap and before the next word's prompt (blend, praise, lines) */
  const after = (n: number) => {
    const p = prompt(n + 1);
    const w = words.find((x) => x.n === n)!;
    return sp.filter((e) => e.t > w.t && (!p || e.t < p.t - 0.01));
  };
  let start = 0, end = 0, poster = 0;
  if (id === "1") {
    // in: the first frame of the battle fading in (the plain loading screen before it is left out); out: the second
    // word's praise heard to its end, before the third word's prompt
    const shown = marks(ev, /^battle$/)[0];
    if (!shown) throw new Error("no battle mark");
    // (the app fades the battle up from its plain purple over ~0.5 s: in once it is almost half-way up, so the clip
    // opens on a quick fade-up of the battle itself, never on the purple)
    const fl = frameStats(master, shown.t - 1.5, 2.5);
    const flat = fl.filter((f) => f.sd < 3 && f.t < shown.t + 0.6).pop();
    if (!flat) throw new Error("no loading screen before the battle");
    const peak = Math.max(...fl.filter((f) => f.t > flat.t && f.t < flat.t + 0.8).map((f) => f.mean));
    start = fl.find((f) => f.t > flat.t && f.mean >= 0.45 * peak)!.t;
    const said = after(2);
    const last = said[said.length - 1];
    if (!last) throw new Error("no line after word 2");
    const next = prompt(3);
    end = Math.min(endOf(last) + 0.75, next ? changeAt(master, endOf(last) - 0.3, next.t + 0.15) - 1 / 30 : Infinity);
    const threat = sp.find((e) => e.id.startsWith("baron_w"));
    poster = threat ? threat.t + 2.2 - start : 3;
  } else if (id === "2") {
    // the slip's word, the Baron's half-way roar, and the next word spelt right with its praise (the child back on
    // track): in just before the slip word's prompt, out once that praise has been heard, before the following word's
    // card comes in. (When that is over 35 s: out once "Grrrr... You dare to fight ME?" has been heard.)
    const miss = marks(ev, /^miss /)[0];
    const grr = sp.find((e) => e.id === "baron_grr");
    if (!miss || !grr) throw new Error(`no ${miss ? "baron_grr" : "miss"}`);
    const n = words.filter((w) => w.t < miss.t).pop()!.n;
    const p = prompt(n)!;
    const before = sp.filter((e) => e.t < p.t - 0.01).pop();
    start = Math.max(p.t - 0.45, before ? endOf(before) + 0.12 : 0);
    const outAfter = (lastLine: TimelineEvent, nextPrompt?: TimelineEvent) =>
      Math.min(endOf(lastLine) + 0.75, nextPrompt ? changeAt(master, endOf(lastLine) - 0.3, nextPrompt.t + 0.15) - 1 / 30 : Infinity);
    const n2 = words.find((w) => w.t > endOf(grr))?.n;
    const said2 = n2 ? after(n2) : [];
    const endLong = said2.length && prompt(n2! + 1) ? outAfter(said2[said2.length - 1], prompt(n2! + 1)) : Infinity;
    end = endLong - start <= 35 ? endLong : outAfter(grr, sp.find((e) => e.t > endOf(grr) - 0.05));
    poster = grr.t + 1.0 - start;
  } else {
    // the last two words and the win: in just before the second-to-last word's prompt, out after "You beat the boss!"
    const last = words[words.length - 1];
    const lose = sp.find((e) => e.id === "baron_lose");
    if (!last || !lose) throw new Error("no last word / baron_lose");
    const win = sp.find((e) => e.id === "battle_boss_win" && e.t > lose.t);
    let n = last.n - 1;
    const p = () => prompt(n)!;
    const before = () => sp.filter((e) => e.t < p().t - 0.01).pop();
    start = Math.max(p().t - 0.45, before() ? endOf(before()!) + 0.12 : 0);
    // (out before the reward's next line, if one follows: a petal, the world done)
    const nextLine = win ? sp.find((e) => e.t > endOf(win) - 0.05) : undefined;
    end = win ? Math.min(endOf(win) + 0.7, nextLine ? nextLine.t - 0.05 : Infinity) : endOf(lose) + 2.5;
    if (end - start > 35) {
      n = last.n;
      start = Math.max(p().t - 0.45, before() ? endOf(before()!) + 0.12 : 0);
    }
    poster = lose.t + 1.2 - start;
  }
  start = f30(start);
  const beats = ev.filter((e) => e.t >= start && e.t <= end && ["speech", "tap", "hitch", "mark"].includes(e.kind)).map((e) => `${(e.t - start).toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}`);
  return { start, end, poster, beats };
}

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, id] = a;
    const clip = CLIPS[id];
    if (!clip) throw new Error("clip 1, 2 or 3");
    mkdirSync(TAKES, { recursive: true });
    if (!a.includes("--nowait")) await waitForQuiet();
    console.log(`[boss] ${name}: filming ${clip.level} (${clip.hero}) at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({
      name, url: `/play/?level=${clip.level}`, base: PROD, save: saveFor(clip.level, clip.hero), seconds: clip.seconds, outDir: TAKES,
      drive: (p, r) => drive(p, r, clip), size: a.includes("--720p") ? "720p" : "1080p", gpu: a.includes("--gpu"),
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { shift: rec.sync.audioShiftMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "scene", "sting", "music-stop", "mark", "hitch"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "window") {
    const m = resolve(a[0]);
    const w = editWindow(m, JSON.parse(readFileSync(m.replace(/\.master\.mp4$/, ".timeline.json"), "utf8")).events, a[1]);
    console.log(JSON.stringify({ start: w.start, end: w.end, len: +(w.end - w.start).toFixed(3), poster: +w.poster.toFixed(3) }));
    console.log(w.beats.join("\n"));
  } else if (cmd === "cut") {
    console.log(JSON.stringify(cut(resolve(a[0]), Number(a[1]), Number(a[2]), resolve(a[3]), { posterAt: a[4] ? Number(a[4]) : undefined }), null, 1));
  } else if (cmd === "final") {
    // final <clip 1|2|3> <master> [posterAt] [start] [end]: the clip's window (or the given one), cut to ../boss-<clip>.mp4
    // with its poster, the sound lined up by the claps' residual (interpolated between the head's and the tail's
    // medians at the window's middle), and a contact sheet (every 0.5 s) of the finished clip beside this file
    const [id, m, posterArg, sArg, eArg] = a;
    const master = resolve(m);
    const tl = JSON.parse(readFileSync(master.replace(/\.master\.mp4$/, ".timeline.json"), "utf8"));
    const w = editWindow(master, tl.events, id);
    const start = sArg ? Number(sArg) : w.start, end = eArg ? Number(eArg) : w.end;
    const r: (number | null)[] = tl.sync.residualMs;
    const med = (xs: (number | null)[]) => {
      const s = xs.filter((x): x is number => x != null).sort((p, q) => p - q);
      return s.length ? s[Math.floor(s.length / 2)] : 0;
    };
    const head = med(r.slice(0, 5)), tail = med(r.slice(5));
    const mid = (start + end) / 2;
    const late = Math.round(head + ((tail - head) * (mid - tl.game.start)) / Math.max(1, tl.game.end - tl.game.start));
    const out = join(HERE, "..", `boss-${id}.mp4`);
    // the fade-out never reaches into a voice: it starts after the last line's voice has ended (its file's last ~0.1 s
    // is silence), 50–250 ms long
    const lastLine = (tl.events as TimelineEvent[]).filter((e) => e.kind === "speech" && e.t < end).pop();
    const voiced = lastLine ? endOf(lastLine) - 0.1 : 0;
    const fadeOutMs = Math.round(Math.max(50, Math.min(250, (end - voiced) * 1000 - 20)));
    const res = cut(master, start, end, out, { posterAt: posterArg ? Number(posterArg) : w.poster, audioLateMs: late, fadeOutMs });
    const sheet = contactSheet(out, 0.5, join(HERE, `boss-${id}.sheet.jpg`));
    console.log(JSON.stringify({ ...res, start, end, audioLateMs: late, head, tail, sheet }, null, 1));
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1));
  } else {
    console.log("usage: drive.ts take <name> <1|2|3> [--720p] [--gpu] [--nowait] | window <master> <1|2|3> | cut <master> <start> <end> <out.mp4> [posterAt] | sheet <file> [every]");
  }
  process.exit(0);
}
