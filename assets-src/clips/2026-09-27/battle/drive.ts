// Clip editor "battle" (27 Sep 2026): normal gameplay clips of the monster battle (Battle.tsx), filmed on PRODUCTION
// at real speed with the rig in scripts/tweet-clips.ts (CDP screencast, the game's own soundtrack rebuilt from
// window.__audioLog, clapper-measured A/V sync). Hear the word, spell it sound by sound (each right sound is a hit), the
// word is blended and the finisher lands, the streak builds, and the last word sends the monster spinning off into the
// sky: "Hooray! The monster ran away!".
//
//   bun assets-src/clips/2026-09-27/battle/drive.ts take <name> <level> <kai|suki> [seconds] [--slip=K:S] [--load=N] [--gpu] [--720p]
//   bun assets-src/clips/2026-09-27/battle/drive.ts window <master> [words=3]   the cut (last `words` words + the run-away)
//   bun assets-src/clips/2026-09-27/battle/drive.ts sheet <file> <from> <to> [every=0.5] [out.jpg]
//
// --load=N    wait (up to 20 min) for the 1-minute load to fall under N before filming (default 16, up to 10 min)
// --slip=K:S  one gentle correction: in the K-th word from the end (1 = the last word), the child's first tap on slot S
//             (0-based) goes on a wrong tile, so the game's correction shows ("hm?", "Keep going, ninja." if a streak
//             was lost, "Listen again… <word>"), then the right tile.
//
// The drive (after the 26 Sep battle-streak driver, assets-src/tweet/2026-09-26/battle-streak/drive.ts) plays like a
// quick, confident child: it looks at each new word for a moment, then taps the right tile once the last pure sound has
// been heard in full (the sound files' own lengths, fetched from production), about one tap a second, and never taps
// anything else (no Next at the end). It re-rolls the battle (a reload with the same save) until the window's words (the
// last three, or two for a slip take) each have a picture, three or four sounds and no < wh > or < tch > (production
// draws those wider than a filled slot's tile, 27 Sep).
//
// Checks: `window` finds the out point in the picture (the first black frame before the reward); ./stutter.py and
// ./repeats.py count frozen and repeated frames in a window (repeats.py counts exact repeats; a mean difference
// mistakes a quiet moment for one). Cut with ./cut.ts.
// The save: a child who has heard Baron Muddle's motive, the gem-energy explanation and the first-streak line, and
// whose "two letters, one sound" reminders for the level's spellings are done (they are spaced over sessions; a child
// this far on has had them), so the window is the battle's own loop.
// Every take films with the anti-sampler (../ears/antisampler.ts): without it Chrome's capturer froze the picture for
// ~250 ms whenever one small region was the only thing moving.
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { record, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";
import { antiSampler } from "../ears/antisampler";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** Every multi-letter spelling up to the Shadow Castle: their reminders are retired (n = 3, the schedule's end). */
const MULTI = ["ff", "ll", "ss", "zz", "sh", "ch", "th", "ck", "ng", "wh", "qu", "ve", "tch", "x"];
export const saveFor = (hero: "kai" | "suki") => {
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = {
    "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] },
  };
  for (const g of MULTI) (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  return tweetSave({ hero, narr, seenStreak: true, settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true } });
};

interface W { text: string; segs: { g: string; p: string }[]; pic: boolean }
/** The battle's words in the order it will ask them (the Battle component's `words` ref, read through React's fiber). */
const battleWords = (page: Page): Promise<W[] | null> =>
  page.evaluate(() => {
    const el = document.querySelector(".bt-row") ?? document.querySelector(".row");
    if (!el) return null;
    const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
    let f: any = key ? (el as any)[key] : null;
    for (; f; f = f.return) {
      for (let h = f.memoizedState; h && typeof h === "object" && "next" in h; h = h.next) {
        const v = h.memoizedState?.current;
        if (Array.isArray(v) && v.length && v.every((w: any) => w && typeof w.text === "string" && Array.isArray(w.segs)))
          return v.map((w: any) => ({ text: w.text, segs: w.segs.map((s: any) => ({ g: s.g, p: s.p })), pic: !!w.pic }));
      }
    }
    return null;
  }).catch(() => null);

/** How long each pure sound lasts (ms), from production's own files. */
const soundMs = new Map<string, number>();
async function measureSounds(ps: string[]) {
  mkdirSync(join(TAKES, ".sounds"), { recursive: true });
  for (const p of ps) {
    if (soundMs.has(p)) continue;
    const f = join(TAKES, ".sounds", `${p}.mp3`);
    try {
      if (!existsSync(f)) writeFileSync(f, Buffer.from(await (await fetch(`${PROD}/a/p/${p}.mp3`)).arrayBuffer()));
      const d = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.toString());
      soundMs.set(p, Number.isFinite(d) && d > 0 ? d * 1000 : 700);
    } catch {
      soundMs.set(p, 700);
    }
  }
}

export interface Plan { slip?: { fromEnd: number; slot: number } | null }
/** Spellings whose letters spill out of a filled 104 px slot tile on production (27 Sep: the slot's Tile keeps its
 *  size while the row's grows; "wh" and "tch" overflow it, "sh", "ch", "ck" and "ng" just fit). */
const WIDE = new Set(["wh", "tch"]);

async function reroll(page: Page, rig: Rig, save: unknown, plan: Plan): Promise<W[] | null> {
  let words: W[] | null = null;
  // (a slip take's window is its last two words. A try is a reload, 0.3–1 s; at w3-9 few words have a picture, and at
  // w5-9 many have < wh > or < tch >, so a window of three picture words takes a few dozen tries there)
  const need = plan.slip ? 2 : 3, give = 60;
  for (let tries = 1; tries <= give + 21 && rig.live(); tries++) {
    const t0 = Date.now();
    words = null;
    while (Date.now() - t0 < 10_000 && rig.live()) {
      const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
      if (st.scene === "battle" && st.word) {
        words = await battleWords(page);
        break;
      }
      await rig.wait(60);
    }
    const n = words?.length ?? 0;
    const last = words?.slice(-need) ?? [];
    const slipWord = plan.slip && words ? words[n - plan.slip.fromEnd] : null;
    // (the window's words: a picture each, three or four sounds, and no spelling too wide for its slot: production
    // draws a filled slot's < wh > and < tch > wider than the tile, 27 Sep; a slip needs a slot after it in its word)
    // (past `give` tries a window without pictures will do; past give + 20, anything)
    const slipOk = !slipWord || slipWord.segs.length > (plan.slip?.slot ?? 0) + 1;
    const narrow = (w: W) => !w.segs.some((s) => WIDE.has(s.g));
    const strict = last.every((w) => w.pic && w.segs.length >= 3 && w.segs.length <= 4 && narrow(w)) && slipOk;
    const loose = last.every((w) => w.segs.length >= 3 && narrow(w)) && slipOk;
    const ok = !!words && (strict || (tries > give && loose) || tries > give + 20);
    const desc = words?.map((w) => `${w.text}(${w.segs.length}${w.pic ? "" : " no pic"})`).join(" ") ?? "?";
    rig.mark(`order ${desc} ${ok ? "kept" : "re-rolled"}`);
    console.log(`[battle] try ${tries}: ${desc} ${ok ? "kept" : "re-roll"}`);
    if (ok) return words;
    await page.evaluate((s) => {
      localStorage.clear();
      localStorage.setItem("superninja.save.v1", JSON.stringify(s));
    }, save).catch(() => {});
    await page.reload({ waitUntil: "load", timeout: 30_000 }).catch(() => {});
  }
  return words;
}

export async function drive(page: Page, rig: Rig, save: unknown, plan: Plan = {}) {
  // the anti-sampler: in this document now, and in every reload
  await page.context().addInitScript(antiSampler);
  await page.evaluate(antiSampler).catch(() => {});
  const words = await reroll(page, rig, save, plan);
  if (words) await measureSounds([...new Set(words.flatMap((w) => w.segs.map((s) => s.p)))]);
  const slipAt = plan.slip && words ? { word: words[words.length - plan.slip.fromEnd]?.text, slot: plan.slip.slot } : null;
  let slipped = false;
  let word = "";
  let unlockedAt = 0, lastTap = 0, lookMs = 0, gapMs = 0;
  let lastLetter = "";
  let wasLocked = true;
  let slot = 0;
  while (rig.live()) {
    const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
    const now = Date.now();
    if (st.scene !== "battle" || st.locked || !st.next) {
      wasLocked = true;
      await rig.wait(40);
      continue;
    }
    if (wasLocked || st.word !== word) {
      // a new word (or the scene just unlocked after a correction): a child looks, then starts
      wasLocked = false;
      if (st.word !== word) {
        word = st.word;
        slot = 0;
      }
      lastLetter = "";
      unlockedAt = now;
      lookMs = jitter(560, 720);
    }
    const due = lastLetter ? lastTap + gapMs : unlockedAt + lookMs;
    if (now < due) {
      await rig.wait(Math.min(40, due - now));
      continue;
    }
    const letter: string = st.next;
    if (slipAt && !slipped && word === slipAt.word && slot === slipAt.slot) {
      // the slip: a tile that isn't in the word, and a vowel for a vowel (the confusion a child makes: e for i), if
      // there is one
      const wrong = await page.locator(".row .tile").evaluateAll((els, [n, w]) => {
        const ls = els.map((e) => e.getAttribute("aria-label")).filter((a): a is string => !!a && a !== n && !w.includes(a));
        const vowel = (g: string) => /^[aeiou]$/.test(g);
        return ls.find((a) => vowel(a) === vowel(n)) ?? ls[0] ?? null;
      }, [letter, word] as const).catch(() => null);
      if (wrong) {
        slipped = true;
        rig.mark(`slip ${wrong} (for ${letter} in ${word})`);
        await rig.tap(`.row button[aria-label="${wrong}"]`);
        lastLetter = "";
        wasLocked = true;
        await rig.wait(300);
        continue;
      }
    }
    await rig.tap(`.row button[aria-label="${letter}"]`);
    rig.mark(`tap ${letter} (${word})`);
    slot++;
    lastTap = Date.now();
    lastLetter = letter;
    const p = words?.find((w) => w.text === word)?.segs.find((s) => s.g === letter)?.p;
    // the next tap once this sound is over, plus a beat (never faster than a real hand)
    gapMs = Math.max(860, (p ? soundMs.get(p) ?? 650 : 650) + 260) + jitter(-40, 120);
    await rig.wait(120);
  }
}

// ------------------------------------------------------------------------------------------------ the edit
/**
 * The cut, from a take's own events: in just before the prompt of the `n`-th word from the end (the new word's card
 * popping in, after the previous word's praise has ended), out once "Hooray! The monster ran away!" has been said and
 * the ninja is celebrating, on the battle's last frame before the game cuts to the reward screen.
 */
export function editWindow(ev: TimelineEvent[], n = 3, master?: string): { start: number; end: number; words: string[]; win: number } {
  const kept = [...ev].reverse().find((e) => e.kind === "mark" && e.id.startsWith("order ") && e.id.endsWith("kept"));
  const after = kept?.t ?? 0;
  const e2 = ev.filter((e) => e.t >= after);
  const win = e2.find((e) => e.kind === "speech" && e.id === "battle_win");
  if (!win) throw new Error("no battle_win: the battle never ended in the take");
  const order: { word: string; t: number }[] = [];
  for (const e of e2) if (e.kind === "scene" && e.id.startsWith("battle:") && e.t < win.t) {
    const w = e.id.slice(7);
    if (order[order.length - 1]?.word !== w) order.push({ word: w, t: e.t });
  }
  const first = order[order.length - n];
  if (!first) throw new Error(`only ${order.length} words`);
  const prompt = e2.find((e) => e.kind === "speech" && e.id === `word:${first.word}` && e.t >= first.t - 1.5);
  const before = e2.filter((e) => e.kind === "speech" && prompt && e.t < prompt.t && !e.id.startsWith("word:")).pop();
  const pt = prompt?.t ?? first.t;
  const start = Math.max(pt - 0.4, before ? before.t + (before.dur ?? 0) + 0.05 : 0);
  // out on the battle's last frame: the game cuts to black for the reward as its fanfare starts. The first black frame
  // lands within a frame of the fanfare either way (w2-2-suki-t1: fanfare 49.498 s, black from 49.500; w5-9-suki-t2:
  // 58.773 s, black from 58.767), so with the master it is found in the picture itself.
  const fanfare = e2.find((e) => e.kind === "sfx" && e.id === "fanfare" && e.t > win.t);
  const dark = fanfare && master ? firstDark(master, fanfare.t - 0.25, 0.5) : null;
  const end = dark ?? (fanfare ? Math.ceil((fanfare.t - 0.035) * 30) / 30 : win.t + (win.dur ?? 2.5));
  return { start: Math.round(start * 30) / 30, end: Math.round(end * 30) / 30, words: order.slice(-n).map((o) => o.word), win: win.t };
}

/** Seconds of the first frame in [from, from + len) whose mean luma is under 40 (the black before the reward), or null. */
export function firstDark(file: string, from: number, len: number): number | null {
  const start = Math.floor(from * 30) / 30;
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(start), "-i", file, "-t", String(len), "-vf", "scale=32:18,format=gray", "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 28 });
  const px = 32 * 18;
  for (let i = 0, k = 0; i + px <= r.stdout.length; i += px, k++) {
    let sum = 0;
    for (let j = 0; j < px; j++) sum += r.stdout[i + j];
    if (sum / px < 40) return Math.round((start + k / 30) * 30) / 30;
  }
  return null;
}

/** A contact sheet of [from, to] seconds of a file, one frame every `every` s, six across, labelled with the master's
 *  timeline (speech, taps, freezes). */
export function rangeSheet(file: string, from: number, to: number, every = 0.5, out?: string): string {
  const tl = file.replace(/\.master\.mp4$/, ".timeline.json");
  const events: TimelineEvent[] = tl !== file && existsSync(tl) ? JSON.parse(readFileSync(tl, "utf8")).events : [];
  const n = Math.floor((to - from) / every + 1e-6) + 1;
  const tw = 320, th = 180;
  const sheet = out ?? file.replace(/(\.master)?\.mp4$/, `.sheet-${from}-${to}.jpg`);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(from), "-i", file, "-vf", `fps=${1 / every}:round=down,scale=${tw}:${th}:flags=bicubic,format=rgb24`, "-frames:v", String(n), "-f", "rawvideo", "pipe:1"], { maxBuffer: 1 << 30 });
  const frames = Math.floor(r.stdout.length / (tw * th * 3));
  const labels = Array.from({ length: frames }, (_, k) => {
    const t = from + k * every;
    const said = events.filter((e) => e.t >= t && e.t < t + every && ["speech", "tap", "sting", "hitch", "mark"].includes(e.kind) && !(e.kind === "mark" && e.id.startsWith("tap ")))
      .map((e) => (e.kind === "speech" ? `"${(e.text ?? e.id).slice(0, 34)}"` : e.kind === "tap" ? `tap ${e.id}` : e.kind === "hitch" ? `FREEZE ${e.id}` : `${e.kind} ${e.id}`));
    return [`${t.toFixed(2)}s`, ...said].join(" ");
  });
  const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
raw = sys.stdin.buffer.read(); tw, th, n, cols = ${tw}, ${th}, ${frames}, 6
labels = json.loads(sys.argv[2]); rows = (n + cols - 1) // cols; lh = 30
sheet = Image.new("RGB", (cols * tw, rows * (th + lh)), (24, 22, 30)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 11)
except Exception: font = ImageFont.load_default()
for k in range(n):
    im = Image.frombytes("RGB", (tw, th), raw[k*tw*th*3:(k+1)*tw*th*3]); x, y = (k % cols) * tw, (k // cols) * (th + lh)
    sheet.paste(im, (x, y)); lab = labels[k]
    d.text((x + 4, y + th + 2), lab[:58], fill=(235, 235, 235), font=font); d.text((x + 4, y + th + 15), lab[58:116], fill=(180, 180, 190), font=font)
sheet.save(sys.argv[1], quality=85)
`;
  const p = spawnSync("python3", ["-c", py, sheet, JSON.stringify(labels)], { input: r.stdout, maxBuffer: 1 << 30 });
  if (p.status !== 0) throw new Error(p.stderr.toString());
  return sheet;
}

/** Wait (up to `maxMin` minutes) until the 1-minute load is under `load`, twice 12 s apart. */
async function waitForQuiet(maxMin = 10, load = 16) {
  const t0 = Date.now();
  for (;;) {
    if (loadavg()[0] <= load) {
      await new Promise((r) => setTimeout(r, 12_000));
      if (loadavg()[0] <= load) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[battle] recording anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
      return;
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
}

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, level, hero] = a;
    const secs = Number(a.slice(3).find((x) => !x.startsWith("--")) ?? 80);
    const slipArg = a.find((x) => x.startsWith("--slip="))?.slice(7);
    const slip = slipArg ? { fromEnd: Number(slipArg.split(":")[0]), slot: Number(slipArg.split(":")[1]) } : null;
    const loadArg = a.find((x) => x.startsWith("--load="));
    if (!a.includes("--nowait")) await waitForQuiet(loadArg ? 20 : 10, loadArg ? Number(loadArg.slice(7)) : 16);
    console.log(`[battle] ${name}: ${level} ${hero}${slip ? ` slip ${slipArg}` : ""}, recording at load ${loadavg()[0].toFixed(1)}`);
    const save = saveFor(hero as "kai" | "suki");
    const rec = await record({
      name, url: `/play/?level=${level}`, base: PROD, save, seconds: secs, outDir: TAKES, drive: (p, r) => drive(p, r, save, { slip }),
      gpu: a.includes("--gpu"), size: a.includes("--720p") ? "720p" : "1080p",
    });
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    try {
      const w = editWindow(rec.events, 3, rec.master);
      console.log("window3:", JSON.stringify(w), (w.end - w.start).toFixed(2), "s");
      const w2 = editWindow(rec.events, 2, rec.master);
      console.log("window2:", JSON.stringify(w2), (w2.end - w2.start).toFixed(2), "s");
    } catch (e) {
      console.log("window:", (e as Error).message);
    }
    for (const e of rec.events) if (["speech", "tap", "scene", "sting", "music", "music-stop", "mark", "hitch"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "window") {
    const tl = resolve(a[0]).replace(/\.master\.mp4$/, ".timeline.json");
    const w = editWindow(JSON.parse(readFileSync(tl, "utf8")).events, Number(a[1] ?? 3), resolve(a[0]));
    console.log(JSON.stringify({ ...w, len: +(w.end - w.start).toFixed(3) }));
  } else if (cmd === "sheet") {
    console.log(rangeSheet(resolve(a[0]), Number(a[1]), Number(a[2]), a[3] ? Number(a[3]) : 0.5, a[4] ? resolve(a[4]) : undefined));
  } else {
    console.log("usage: drive.ts take <name> <level> <kai|suki> [seconds] [--slip=K:S] [--gpu] [--720p] [--nowait] | window <master> [words] | sheet <file> <from> <to> [every] [out.jpg]");
  }
  process.exit(0);
}
