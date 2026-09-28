// Clip editor "gemtrial" (27 Sep 2026): normal gameplay clips of the Gem Trial (Battle.tsx with a level's `trialGem`:
// the timed "gem battle" against the Gem Guardian) and of the gem-won celebration on the World Flower (Tree.tsx's
// victory), filmed on PRODUCTION at real speed with the camera rig in scripts/tweet-clips.ts (CDP screencast, the real
// soundtrack rebuilt from window.__audioLog, measured A/V sync).
//
//   bun assets-src/clips/2026-09-27/gemtrial/drive.ts take <name> <clip 1|2|3> [--720p] [--gpu] [--nowait]
//   bun assets-src/clips/2026-09-27/gemtrial/drive.ts final <clip> <master> <start> <end> [posterAt]
//   bun assets-src/clips/2026-09-27/gemtrial/drive.ts sheet <file> [every]
//
// How a Gem Trial starts in the game: practice fills a gem's energy; a full gem is "ready" (engine/gems.ts gemState)
// and its petal on the World Flower offers "Gem battle <g>" (Tree.tsx PetalDetail), which calls makeTrial(key): a
// one-off battle level ("trial") in the child's current land (the frontier's world, so its backdrop), monster
// gem_guardian (5 hp: five words from trialWords(), words with the gem's spelling and only spellings the child knows),
// with the purple charge bar (the Guardian attacks when it is full: a lost heart). Won, the gem flies over the ninja's
// head, and App routes to the World Flower's victory (the gem dives into its petal; a petal whose gems are all in
// flies home onto the big World Flower). The same trial opens from a URL: /play/?trial=<gem> (App.tsx), and the
// victory from /play/?scene=tree&gem=<gem>&celebrate=1 (Tree.tsx); both are on production (checked 27 Sep).
//
// The clips (CLIPS below): a different land, gem, words and hero each. (There is only one Gem Guardian: every trial
// has the same monster.)
//   1  Blossom Hills (frontier w2-6), the gem <e> /e/, Kai: the child's FIRST gem battle (production's introduction,
//      27 Sep: "Your gem is ready. Spell the words to win it." "Watch the purple bar. Spell the word before it fills."
//      "If it fills, you lose a heart. I will help you try again.", no Ready hold; src/ has other lines by now), then
//      the first two words spelt as the bar charges (slowly: a first trial's bar runs at 0.6 speed).
//   2  Shadow Castle (frontier w5-7), the gem <sh> /sh/, Suki: a later gem battle, the last two words (one slip and
//      Sensei's gentle correction, the bar jumping up), the Guardian knocked out and the gem flying over the ninja.
//   3  the World Flower, the gem <ee> /ee/ (after <ea>), Suki: the victory: "You won the gem! It's going into its
//      petal!", the dive, the bloom, Sensei on the new spelling, and the petal flying home onto the World Flower.
//
// The child (clips 1, 2): after the rig's head clapper the drive clears the storage and reloads (the trial starts
// clean, never under the clapper), re-rolling (another reload, ~0.3 s) until the words in the clip's window have
// pictures and three or four sounds; it waits while the scene is locked, answers a Ready hold (the green arrow) after a
// beat, looks at each new word for 0.5–0.8 s, then taps each sound's tile once the previous pure sound has been heard to
// its end, about one tap a second. A planned slip taps a tile that is not in the word, waits for the correction, looks
// again, and taps the right one. Nothing is tapped on the World Flower after a trial.
// Clip 3: production holds each beat of the victory on Next (the tweet kit's preview of 26 Sep played it through by
// itself): the child taps the green arrow 0.3–0.45 s after it lights, up to the last beat.
//
// Decisions (27 Sep, logged here: this editor writes only under assets-src/clips/2026-09-27/):
// - 1080p on the GPU (`--gpu`, ANGLE Metal) for every final. At load 8–13: 1080p on the CPU drew 31 fps with 134
//   hitches (c1-1080-t1); 720p on the CPU drew 51–54 fps for the trials but only 31 fps in the victory, with 24 repeated
//   frames at the burst and the homecoming (c3-720-t1); 1080p on the GPU drew 60 fps with no freeze in the windows of
//   c1-1080gpu-t3/t4, c2-1080gpu-t2 and c3-1080gpu-t3/t4/t5 (c2-1080gpu-t3 froze twice, 100 ms, in its last word).
// - The screen shake is filmed as the game plays it (no --noshake re-add as the tweet kit did: on the GPU it drew clean).
// - The victory has no music under its talk, so the child taps Next briskly (t5) to keep the pauses under ~0.6 s.
// - There is one Gem Guardian: the monster cannot vary between the clips; the land, gem, words and hero do.
// - Finals (cut with `final`, checked with ./repeats.ts, ./strip.py and ./envelope.py):
//     gemtrial-1  c1-1080gpu-t4 2.733–34.300 (pen, tent; t3's vest and den had less clear pictures), poster 24.37
//     gemtrial-2  c2-1080gpu-t2 33.800–59.867 (shop with the slip, shed, the win), poster 22.1
//     gemtrial-3  c3-1080gpu-t5 2.567–32.150, poster 17.883 (t3, cut 2.633–33.9, had 0.8–0.9 s silences between beats
//                 and 0.5 s of silence at its tail)
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactSheet, record, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { LEVELS, knownSpellings } from "../../../../src/content/worlds";
import { GEMS } from "../../../../src/content/flower";
import { antiSampler, bufferDurations } from "./antisampler";
import { cut } from "./cut";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const DAY = 86_400_000;

export interface Clip {
  kind: "trial" | "celebrate";
  gem: string;
  /** the level the child is up to (the first without stars): its land is the trial's backdrop */
  frontier: string;
  hero: "kai" | "suki";
  /** the child's first gem battle (the full introduction, the bar at 0.6 speed) */
  first?: boolean;
  /** a slip: the word (1-based, in the order asked) and the slot (0-based) where the child taps a wrong tile first */
  miss?: { word: number; slot: number };
  /** the words (1-based) the window shows: they are re-rolled until each has a picture and 3–4 sounds */
  window: number[];
  /** gems already won besides every single-letter and unit ≤ 11 one (e.g. the petal's other spelling) */
  won?: string[];
  seconds: number;
}
export const CLIPS: Record<string, Clip> = {
  "1": { kind: "trial", gem: "e>e", frontier: "w2-6", hero: "kai", first: true, window: [1, 2], seconds: 86 },
  "2": { kind: "trial", gem: "sh>sh", frontier: "w5-7", hero: "suki", miss: { word: 4, slot: 1 }, window: [4, 5], seconds: 90 },
  "3": { kind: "celebrate", gem: "ee>ee", frontier: "w6-4", hero: "suki", won: ["ai>ae", "ay>ae", "ea>ee"], window: [], seconds: 62 },
};

/** A child up to `frontier` (three stars on every level before it), who has met every spelling taught so far and won
 *  the gems of the spellings before this land's (plus `won`), with the gem on trial full of energy; the once-only
 *  explanations it would have heard by then heard (Baron's motive, gem energy, the first streak, the save's first two
 *  Readies), the "two letters, one sound" reminders retired (spaced over sessions, as the battle and boss editors
 *  decided), captions on and the music at the game's default. A later trial's game ledger has had its two tellings. */
export function saveFor(clip: Clip) {
  const i = LEVELS.findIndex((l) => l.id === clip.frontier);
  if (i < 0) throw new Error(`no level ${clip.frontier}`);
  const lv = LEVELS[i];
  const stars = Object.fromEntries(LEVELS.slice(0, i).map((l) => [l.id, 3]));
  const known = knownSpellings(lv);
  // gems won: every gem of an earlier land's spelling (the trial's own gem aside)
  const earlier = knownSpellings(LEVELS.find((l) => l.world === lv.world)!);
  const gems = [...new Set([...GEMS.filter((g) => g.inPlay && earlier.has(g.g) && g.key !== clip.gem && g.unit < 12).map((g) => g.key), ...(clip.won ?? [])])];
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = {
    "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] }, "ready:first": { n: 1, at: [0] }, "ready:paw": { n: 1, at: [0] },
  };
  for (const g of known) if (g.length > 1 || g === "x") (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  const sessions = clip.first ? 4 : 9;
  // a later gem battle: told twice (sessions 5 and 7), last played two days ago → the short form (narrative.ts frameForm)
  if (clip.kind === "trial" && !clip.first) narr["game:trial"] = { n: 2, at: [i - 6, i - 2], s: [5, 7], lastAt: Date.now() - 2 * DAY, lastSession: 7 };
  const energy: Record<string, number> = {};
  for (const g of GEMS) if (g.inPlay && known.has(g.g) && !gems.includes(g.key)) energy[g.key] = 3 + ((g.unit * 7) % 4);
  if (clip.kind === "trial") energy[clip.gem] = 8; // ENERGY_FULL: the gem is ready for its battle
  const words: Record<string, { n: number; ok: number; last: number }> = {};
  for (const w of ["tree", "bee", "feet", "sheep", "sea", "tea", "leaf", "rain", "tail", "day", "play", "ship", "fish", "shop", "bed", "hen", "net", "peg"]) words[w] = { n: 2, ok: 2, last: 1 };
  return tweetSave({
    hero: clip.hero, stars, petals: [...known], gems, energy, words, schoolYear: "none", seenStreak: true, seenTimer: !clip.first, sessions, narr,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

interface W { text: string; segs: { g: string; p: string }[]; pic: boolean }
/** The battle's words in the order it will ask them (the Battle component's `words` state, read through React's fiber;
 *  after ../battle/drive.ts). */
const battleWords = (page: Page): Promise<W[] | null> =>
  page.evaluate(() => {
    const el = document.querySelector(".bt-row") ?? document.querySelector(".row");
    if (!el) return null;
    const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
    let f: any = key ? (el as any)[key] : null;
    for (; f; f = f.return) {
      for (let h = f.memoizedState; h && typeof h === "object" && "next" in h; h = h.next) {
        const v = h.memoizedState;
        const arr = Array.isArray(v) ? v : Array.isArray(v?.current) ? v.current : null;
        if (arr && arr.length && arr.every((w: any) => w && typeof w.text === "string" && Array.isArray(w.segs)))
          return arr.map((w: any) => ({ text: w.text, segs: w.segs.map((s: any) => ({ g: s.g, p: s.p })), pic: !!w.pic }));
      }
    }
    return null;
  }).catch(() => null);

/** Reload (the same save: the rig's init script seeds it into the cleared storage) until the window's words suit. */
async function reroll(page: Page, rig: Rig, clip: Clip): Promise<W[] | null> {
  let words: W[] | null = null;
  for (let tries = 1; tries <= 40 && rig.live(); tries++) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    }).catch(() => {});
    rig.mark("reload");
    await page.reload({ waitUntil: "load", timeout: 60_000 }).catch(() => {});
    const t0 = Date.now();
    words = null;
    while (Date.now() - t0 < 10_000 && rig.live()) {
      const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
      if (st.scene === "battle" && st.word) {
        words = await battleWords(page);
        break;
      }
      await rig.wait(50);
    }
    const win = clip.window.map((n) => words?.[n - 1]).filter(Boolean) as W[];
    const slipOk = !clip.miss || (words?.[clip.miss.word - 1]?.segs.length ?? 0) > clip.miss.slot + 1;
    const distinct = new Set(words?.map((w) => w.text)).size === (words?.length ?? 0);
    const ok = !!words && win.length === clip.window.length && win.every((w) => w.pic && w.segs.length >= 3 && w.segs.length <= 4) && slipOk && (distinct || tries > 20);
    const desc = words?.map((w) => `${w.text}(${w.segs.length}${w.pic ? "" : " no pic"})`).join(" ") ?? "?";
    rig.mark(`order ${desc} ${ok ? "kept" : "re-rolled"}`);
    console.log(`[gemtrial] try ${tries}: ${desc} ${ok ? "kept" : "re-roll"}`);
    if (ok || tries >= 40) return words;
  }
  return words;
}

export async function driveTrial(page: Page, rig: Rig, clip: Clip) {
  await page.context().addInitScript(antiSampler);
  await page.context().addInitScript(bufferDurations);
  await reroll(page, rig, clip);
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
  let over = false;
  while (rig.live()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, st = w.__snState || {}, nav = w.__snNav || {};
      return { scene: st.scene, next: st.next, locked: st.locked, word: st.word, hp: st.hp, phase: st.phase, ready: nav.next === "ready" };
    }).catch(() => ({}));
    const now = Date.now();
    if (!shown && s.scene === "battle") {
      shown = true;
      rig.mark("battle");
    }
    if (shown && s.scene && s.scene !== "battle" && !over) {
      over = true;
      rig.mark(`left battle for ${s.scene}`);
    }
    if (over) {
      await rig.wait(200);
      continue;
    }
    // the Ready hold (the green arrow): a child taps it a beat after Sensei asks
    if (s.ready && s.scene === "battle" && s.phase === "hold") {
      if (!readySince) readySince = now;
      if (now - readySince > jitter(650, 900)) {
        rig.mark("ready");
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(400);
      } else await rig.wait(60);
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

/** The victory plays by itself: start it again once the head clapper is done (as the tweet kit's gem-victory driver). */
export async function driveCelebrate(page: Page, rig: Rig, clip: Clip) {
  await page.context().addInitScript(antiSampler);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let last = "";
  let readySince = 0, wait = 0;
  while (rig.live()) {
    const s: any = await page.evaluate(() => {
      const w = window as any, p = w.__snNav?.pres;
      return { scene: w.__snState?.scene, pres: p?.id ?? null, step: p?.step ?? null, of: p?.of ?? null, ready: w.__snNav?.next === "ready" };
    }).catch(() => ({}));
    const key = `${s.scene}|${s.pres}|${s.step}/${s.of}|${s.ready ? "ready" : "wait"}`;
    if (key !== last) rig.mark(`state ${key}`), (last = key);
    // production holds each beat of the victory on Next (the green arrow): the child taps it a beat after it lights,
    // up to the last beat (its Next would leave the victory for the World Flower)
    if (s.ready && s.pres === "gem-victory" && s.step != null && s.of != null && s.step < s.of - 1) {
      // (a keen child, tapping as soon as the arrow lights: the victory has no music under its talk, so a slower tap
      // leaves ~0.9 s of silence between Sensei's lines; the first takes, t3 and t4, tapped after 0.6–0.85 s)
      if (!readySince) (readySince = Date.now()), (wait = Number(process.env.GEMTRIAL_TAP_MS ?? 0) || jitter(300, 450));
      if (Date.now() - readySince > wait) {
        rig.mark(`next ${s.step + 1}/${s.of}`);
        await rig.tap('[data-nav="next"]');
        readySince = 0;
        await rig.wait(500);
        continue;
      }
    } else readySince = 0;
    await rig.wait(50);
  }
}

/** Another clip editor's take is running (a bun …/clips/2026-09-27/<other>/…ts process). */
function othersFilming(): boolean {
  const ps = spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n");
  return ps.some((l) => /^bun .*clips\/2026-09-27\/(?!gemtrial\/)[^/]+\/[^ ]*\.ts .*take/.test(l) || /^bun .*clips\/2026-09-27\/(?!gemtrial\/)[^/]+\/drive\.ts/.test(l));
}
/** Wait until the 1-minute load is under `max` (twice, 12 s apart) and no other editor is filming (that wait gives up
 *  after 5 minutes: theirs may be waiting too); gives up altogether after `maxMin` minutes. */
export async function waitForQuiet(max = 12, maxMin = 40) {
  const t0 = Date.now();
  for (;;) {
    const quiet = loadavg()[0] < max && (!othersFilming() || Date.now() - t0 > 5 * 60_000);
    if (quiet) {
      await new Promise((r) => setTimeout(r, 8_000 + Math.random() * 4000));
      if (loadavg()[0] < max + 2) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[gemtrial] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
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
    const url = clip.kind === "trial" ? `/play/?trial=${encodeURIComponent(clip.gem)}` : `/play/?scene=tree&gem=${encodeURIComponent(clip.gem)}&celebrate=1`;
    console.log(`[gemtrial] ${name}: filming clip ${id} ${url} (${clip.hero}, ${clip.frontier}) at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({
      name, url, base: PROD, save: saveFor(clip), seconds: clip.seconds, outDir: TAKES,
      drive: (p, r) => (clip.kind === "trial" ? driveTrial(p, r, clip) : driveCelebrate(p, r, clip)),
      size: a.includes("--720p") ? "720p" : "1080p", gpu: a.includes("--gpu"), showTaps: true,
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { lat: rec.sync.pictureLatencyMs, shift: rec.sync.audioShiftMs, res: rec.sync.residualMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs }, advice: rec.advice }));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "scene", "sting", "music", "music-stop", "mark", "hitch"].includes(e.kind) && !/^tap /.test(e.id)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "final") {
    // final <clip> <master> <start> <end> [posterAt]: cut to ../gemtrial-<clip>.mp4 with its poster, the sound lined up by
    // the claps' residual (interpolated between the head's and the tail's medians at the window's middle), the fade-out
    // kept out of the last voice, and a contact sheet (every 0.5 s) of the finished clip beside this file
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
    const out = join(HERE, "..", `gemtrial-${id}.mp4`);
    const lastLine = (tl.events as TimelineEvent[]).filter((e) => e.kind === "speech" && e.t < end).pop();
    const voiced = lastLine ? endOf(lastLine) - 0.1 : 0;
    const fadeOutMs = Math.round(Math.max(50, Math.min(250, (end - voiced) * 1000 - 20)));
    const res = cut(master, start, end, out, { posterAt: posterArg ? Number(posterArg) : undefined, audioLateMs: late, fadeOutMs });
    const sheet = contactSheet(out, 0.5, join(HERE, `gemtrial-${id}.sheet.jpg`));
    console.log(JSON.stringify({ ...res, start, end, audioLateMs: late, head, tail, fadeOutMs, sheet }, null, 1));
  } else if (cmd === "sheet") {
    const f = resolve(a[0]);
    if (!existsSync(f)) throw new Error(`no ${f}`);
    console.log(contactSheet(f, a[1] ? Number(a[1]) : 1));
  } else {
    console.log("usage: drive.ts take <name> <1|2|3> [--720p] [--gpu] [--nowait] | final <clip> <master> <start> <end> [posterAt] | sheet <file> [every]");
  }
  process.exit(0);
}
