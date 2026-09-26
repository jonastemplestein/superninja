// Clip editor #1, "battle-streak": the ninja in a real battle (level w1-6: am, at, mat, sat), every tile right first
// time, so the streak builds from nothing to the rainbow "ninja master" and the monster runs away.
//
//   bun assets-src/tweet/2026-09-26/battle-streak/drive.ts take <name> [seconds] [--gpu]   record a take into ./takes/
//   bun assets-src/tweet/2026-09-26/battle-streak/drive.ts window <master>        the cut editWindow() picks
//   bun assets-src/tweet/2026-09-26/battle-streak/drive.ts sheet <file> <from> <to> [every=0.5] [out.jpg]
//   bun assets-src/tweet/2026-09-26/battle-streak/drive.ts cut <master> <start> <end> [posterAt]
//
// The drive plays like a quick, confident child (not the bot): it looks at each new word for a moment, then taps the
// right tile as soon as the last sound has been heard (the pure sound is never cut off), about one tap every 0.8–1 s,
// and never taps anything else (no Next at the end, so the take holds on the reward).
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { record, trim, tweetSave, type Rig, type TimelineEvent } from "../../../../scripts/tweet-clips";

const HERE = dirname(fileURLToPath(import.meta.url));
const TAKES = join(HERE, "takes");

/** Explanations already heard: skips Baron's motive and the 8 s "Look, a gem!" pause; the first-streak line stays. */
export const SAVE = tweetSave({
  narr: { "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] } },
  settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
});

/** How long each pure sound lasts (ms, from the preview's own files): the next tap waits for it to end. */
const SOUND_MS: Record<string, number> = { m: 660, a: 312, t: 165, s: 783 };
const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** The battle's four words in the order it will ask them (read from the Battle component's `words` ref through React's
 *  fiber; null if that fails). */
const wordOrder = (page: Page): Promise<string[] | null> =>
  page.evaluate(() => {
    const el = document.querySelector(".bt-row") ?? document.querySelector(".row");
    if (!el) return null;
    const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
    let f: any = key ? (el as any)[key] : null;
    for (; f; f = f.return) {
      for (let h = f.memoizedState; h && typeof h === "object" && "next" in h; h = h.next) {
        const v = h.memoizedState?.current;
        if (Array.isArray(v) && v.length && v.every((w: any) => w && typeof w.text === "string" && Array.isArray(w.segs))) return v.map((w: any) => w.text);
      }
    }
    return null;
  }).catch(() => null);

/**
 * Re-roll the battle until its words come in an order where the streak's three tiers land on three words in a row:
 * a two-sound word first means the first-streak line ("Three right answers in a row!") ends word 2, "Super ninja
 * streak!" word 3 and "ninja master" word 4, whatever the rest. Best of all, word 2 has three sounds, so words 3 and 4
 * are five sounds together (the shortest run from "Three right answers" to "ninja master"). The words are shuffled
 * when the battle mounts, so a re-roll is a reload with the same save (the legacy save becomes the current profile
 * again). The picture and the log from before the last reload are never used (the cut is well after it).
 */
async function reroll(page: Page, rig: Rig, save: unknown) {
  for (let tries = 1; tries <= 12 && rig.live(); tries++) {
    const t0 = Date.now();
    let order: string[] | null = null;
    let first = "";
    while (Date.now() - t0 < 8000) {
      const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
      if (st.scene === "battle" && st.word) {
        first = st.word;
        order = await wordOrder(page);
        break;
      }
      await rig.wait(50);
    }
    const len = (w: string) => w.length; // (every word here is one letter per sound)
    const ok = order ? len(order[0]) === 2 && (len(order[1]) === 3 || tries > 5) : first ? len(first) === 2 || tries > 5 : true;
    rig.mark(`order ${order?.join(" ") ?? first} ${ok ? "kept" : "re-rolled"}`);
    console.log(`[battle-streak] try ${tries}: ${order?.join(" ") ?? `${first} …`} ${ok ? "kept" : "re-roll"}`);
    if (ok) return;
    await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), save).catch(() => {});
    await page.reload({ waitUntil: "load", timeout: 30_000 }).catch(() => {});
  }
}

export async function drive(page: Page, rig: Rig) {
  if (process.env.REROLL !== "0") await reroll(page, rig, SAVE);
  let word = "";
  let unlockedAt = 0;
  let lastTap = 0;
  let lastLetter = "";
  let wasLocked = true;
  let lookMs = 0;
  let gapMs = 0;
  while (rig.live()) {
    const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
    const now = Date.now();
    if (st.scene !== "battle" || st.locked || !st.next) {
      wasLocked = true;
      await rig.wait(40);
      continue;
    }
    if (wasLocked || st.word !== word) {
      // a new word (or the scene just unlocked): a child looks, then starts
      wasLocked = false;
      if (st.word !== word) {
        word = st.word;
        lastLetter = "";
      }
      unlockedAt = now;
      lookMs = jitter(520, 680);
    }
    const due = lastLetter ? lastTap + gapMs : unlockedAt + lookMs;
    if (now < due) {
      await rig.wait(Math.min(40, due - now));
      continue;
    }
    const letter: string = st.next;
    await rig.tap(`.row button[aria-label="${letter}"]`);
    rig.mark(`tap ${letter} (${word})`);
    lastTap = Date.now();
    lastLetter = letter;
    // the next tap once this sound is over, plus a beat (never faster than a real hand)
    gapMs = Math.max(820, (SOUND_MS[letter] ?? 600) + 230) + jitter(-40, 80);
    await rig.wait(120);
  }
}

// ------------------------------------------------------------------------------------------------ the edit
/**
 * The cut, from a take's own events: open just before Sensei asks the word that makes the streak "super" (the new
 * word's card fading in), so the clip is two whole words, each capped by a power-up: tap, tap, blend, "Wow! Super
 * ninja streak!"; tap, tap, tap, blend, rainbow "Amazing! You're a ninja master!", the flip, "Hooray! The monster ran
 * away!", and out once the reward's word cards have landed with "You did it!" (the battle music has faded under the
 * fanfare by then, so nothing stops abruptly). Take 5 (am mat at sat): 29.233–52.5 s, poster 16.03 s in.
 */
export function editWindow(ev: TimelineEvent[]): { start: number; end: number; poster: number } {
  const say = (id: string, after = 0) => ev.find((e) => e.kind === "speech" && e.id === id && e.t >= after);
  const six = say("streak_6"), ten = say("streak_10"), win = say("battle_win");
  if (!six || !ten || !win) throw new Error("no streak_6 / streak_10 / battle_win: the streak broke; record again");
  // the word asked before "Super ninja streak!": its prompt is the last word:* line before the last tap before six
  const tapsBefore = ev.filter((e) => e.kind === "tap" && e.t < six.t);
  const lastTap = tapsBefore[tapsBefore.length - 1];
  const prompts = ev.filter((e) => e.kind === "speech" && e.id.startsWith("word:") && e.t < (lastTap?.t ?? six.t));
  // (the word's first prompt: the blend at the end of the word says it again)
  const firstTapOfWord = (() => {
    let k = tapsBefore.length - 1;
    while (k > 0 && tapsBefore[k].t - tapsBefore[k - 1].t < 1.6) k--;
    return tapsBefore[k];
  })();
  const prompt = [...prompts].reverse().find((e) => e.t < (firstTapOfWord?.t ?? six.t));
  // never inside the line before (the first-streak explanation: the new word's card appears as its file's last ~0.09 s
  // of silence plays), so the first frame is the new word's card fading in (take 5: master frame 877, 29.233 s; frame
  // 876 still shows the old word and its caption)
  const before = ev.filter((e) => e.kind === "speech" && prompt && e.t < prompt.t && !e.id.startsWith("word:") && !e.id.startsWith("sound:")).pop();
  const start = Math.max((prompt?.t ?? six.t - 6) - 0.35, before ? Math.floor((before.t + (before.dur ?? 0)) * 30) / 30 : 0);
  // out 0.3 s after "You did it!" (its file ends in ~0.1 s of silence), with the reward's word cards settled
  const did = say("yay_7", win.t);
  const end = did && did.t - win.t < 4.5 ? did.t + (did.dur ?? 0.75) + 0.23 : win.t + (win.dur ?? 2.5) + 1.4;
  // the poster: the rainbow ninja master, the monster blasted away in stars, "Amazing! You're a ninja master!"
  return { start, end, poster: ten.t + 0.284 - start };
}

// ------------------------------------------------------------------------------------------------ editing helpers
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
    const said = events.filter((e) => e.t >= t && e.t < t + every && ["speech", "tap", "sting", "hitch", "music-stop"].includes(e.kind))
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

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const name = a[0] ?? `take-${Date.now()}`;
    const gpu = a.includes("--gpu");
    const secs = a.slice(1).find((x) => !x.startsWith("--"));
    const rec = await record({ name, url: "/play/?level=w1-6", seconds: Number(secs ?? 56), outDir: TAKES, save: SAVE, drive, gpu });
    const say = (id: string) => rec.events.find((e) => e.kind === "speech" && e.id === id);
    const words = rec.events.filter((e) => e.kind === "scene" && e.id.startsWith("battle:")).map((e) => e.id.slice(7));
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
    console.log("order:", words.join(" "), "| streak_6:", say("streak_6")?.t, "| streak_10:", say("streak_10")?.t, "| battle_win:", say("battle_win")?.t);
    console.log("hitches:", rec.events.filter((e) => e.kind === "hitch").map((e) => `${e.t}(${e.id})`).join(" ") || "none");
    for (const e of rec.events) if (["speech", "tap", "scene", "sting", "music", "music-stop"].includes(e.kind)) console.log(`${e.t.toFixed(3)} ${e.kind} ${e.id}${e.dur ? ` [${e.dur}]` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  } else if (cmd === "window") {
    const tl = resolve(a[0]).replace(/\.master\.mp4$/, ".timeline.json");
    console.log(JSON.stringify(editWindow(JSON.parse(readFileSync(tl, "utf8")).events)));
  } else if (cmd === "sheet") {
    console.log(rangeSheet(resolve(a[0]), Number(a[1]), Number(a[2]), a[3] ? Number(a[3]) : 0.5, a[4] ? resolve(a[4]) : undefined));
  } else if (cmd === "cut") {
    const out = join(HERE, "..", "battle-streak.mp4");
    console.log(JSON.stringify(trim(resolve(a[0]), Number(a[1]), Number(a[2]), out, a[3] ? { posterAt: Number(a[3]) } : {}), null, 1));
  } else {
    console.log("usage: drive.ts take <name> [seconds] [--gpu] | window <master> | sheet <file> <from> <to> [every] [out.jpg] | cut <master> <start> <end> [posterAt]");
  }
  process.exit(0);
}
