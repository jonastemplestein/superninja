// Normal gameplay takes of First Sounds (the first-sound game: "Which one starts with... /s/?", two pictures, the sound's
// petal beside the speaker), for Jonas's 27 Sep 2026 clip choice. Filmed on PRODUCTION at real speed with the camera rig
// in scripts/tweet-clips.ts (CDP screencast, the real soundtrack rebuilt from window.__audioLog, measured A/V sync).
//
//   bun assets-src/clips/2026-09-27/firstsound/drive.ts <take> <level> <hero> [seconds] [--miss=N] [--gpu] [--720p]
//
//   <level>  w1-2 (/m/ /s/), w1-3 (/a/ /t/) or w1-10 (/n/ /p/, then building words)
//   <hero>   kai | suki
//   --miss=N the child's Nth answer (1-based, counting only the child's own picture/letter answers) is a slip: it taps
//            the other picture first, hears Sensei's gentle correction ("Listen again. Mmmop. Which one starts with...
//            /m/"), then gets it right
//
// Writes takes/<take>.master.mp4 (+ .master.wav, .timeline.json, .sheet.jpg) and prints the timeline.
//
// The child: waits while Sensei talks (the scene is busy), looks at the pictures for 0.7–1.1 s once the question is
// over, then taps the right one (a pointerdown, with the rig's soft ripple). Ready holds (the green arrow) get a tap
// after about a second. It never taps "Play again" or anything at the level's end.
//
// The save: a child who has played every level before this one (stars on them, so the game's narration treats First
// Sounds as known from w1-3 on, as it would be for a real child), with the petals of the sounds met so far, captions on
// and the music at the game's default.
import type { Page } from "playwright";
import { loadavg } from "node:os";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";

export const PROD = "https://superninja.templestein.com";

const ORDER = ["w1-wu1", "w1-wu2", "w1-wu3", "w1-wu4", "w1-wu5", "w1-wu6", "w1-2", "w1-3", "w1-4", "w1-5", "w1-6", "w1-7", "w1-8", "w1-9", "w1-10"];
const PETALS: Record<string, string[]> = { "w1-2": [], "w1-3": ["m", "s"], "w1-10": ["m", "s", "a", "t", "i"] };

export function saveFor(level: string, hero: "kai" | "suki") {
  const before = ORDER.slice(0, ORDER.indexOf(level));
  const stars = Object.fromEntries(before.map((id) => [id, 3]));
  const petals = PETALS[level] ?? [];
  return tweetSave({
    hero, stars, petals, schoolYear: "none",
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** An invisible heartbeat: a 2 px square in the top-right corner at opacity 0.004, whose colour changes every animation
 *  frame. Chrome's screencast sends a frame only when the picture changes, so without it every still moment of the game
 *  (there is one of ~266 ms around each right answer, after the spell settles) is reported by the rig as a "hitch".
 *  diag/heartbeat.ts showed they are not freezes: with a visible heartbeat the screencast ran at a steady 60 fps through
 *  them and requestAnimationFrame never stalled. With this one, the rig's hitches and repeated frames count real
 *  freezes only. It changes no pixel of the picture (0.4% of a 1-level step rounds away). */
async function heartbeat(page: Page) {
  await page
    .evaluate(() => {
      if (document.getElementById("__hb")) return;
      const d = document.createElement("div");
      d.id = "__hb";
      d.style.cssText = "position:fixed;right:0;top:0;width:2px;height:2px;z-index:2147483647;pointer-events:none;opacity:0.004;background:#000";
      document.body.appendChild(d);
      let k = 0;
      const tick = () => {
        d.style.background = k++ % 2 ? "#000" : "#010101";
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    })
    .catch(() => {});
}

export async function drive(page: Page, rig: Rig, { miss = 0, beat = true }: { miss?: number; beat?: boolean } = {}) {
  if (beat) await heartbeat(page);
  let answers = 0; // the child's own answers so far
  let turnKey = ""; // the turn being looked at
  let dueAt = 0;
  let tappedKey = "";
  let tappedAt = 0;
  let slipped = false;
  while (rig.live()) {
    const s: any = await page
      .evaluate(() => ({ st: (window as any).__snState ?? {}, nav: (window as any).__snNav ?? null, again: !!document.querySelector('button[aria-label="Play again"]') }))
      .catch(() => null);
    if (!s) {
      await rig.wait(60);
      continue;
    }
    const { st, nav } = s;
    const now = Date.now();
    // a held step: the green arrow, a moment after it lights (never at the level's end)
    if (nav?.next === "ready" && !s.again) {
      const key = `ready|${nav.pres?.id ?? ""}|${nav.pres?.step ?? ""}`;
      if (key !== turnKey) {
        turnKey = key;
        dueAt = now + jitter(900, 1300);
      } else if (now >= dueAt && tappedKey !== key) {
        rig.mark(`ready ${nav.pres?.id ?? ""}`);
        await rig.tap('[data-nav="next"]');
        tappedKey = key;
        tappedAt = Date.now();
      }
      await rig.wait(40);
      continue;
    }
    const answerable = (st.scene === "pick" || st.scene === "build") && st.next && !st.busy;
    if (!answerable) {
      if (turnKey && !turnKey.startsWith("ready")) turnKey = "";
      await rig.wait(40);
      continue;
    }
    const key = `${st.scene}|${st.word ?? ""}|${st.next}|${answers}`;
    if (key !== turnKey) {
      turnKey = key;
      // a child looks at the pictures first; letters in a word follow each other a little faster
      dueAt = now + (st.scene === "build" ? jitter(650, 900) : jitter(700, 1100));
    }
    // (a tap the game did not take: try again after a while)
    if (tappedKey === key && now - tappedAt < 1800) {
      await rig.wait(40);
      continue;
    }
    if (now < dueAt) {
      await rig.wait(Math.min(40, dueAt - now));
      continue;
    }
    const n = answers + 1;
    if (miss && n === miss && !slipped && st.scene === "pick") {
      const wrong: string | null = await page
        .evaluate((next) => Array.from(document.querySelectorAll(".pick-row [aria-label]")).map((e) => e.getAttribute("aria-label")).find((a) => a && a !== next) ?? null, st.next)
        .catch(() => null);
      if (wrong) {
        slipped = true;
        rig.mark(`slip ${wrong} (answer ${st.next})`);
        await rig.tap(`.pick-row [aria-label="${wrong}"]`);
        turnKey = "";
        tappedKey = "";
        await rig.wait(400);
        continue;
      }
    }
    const sel = st.scene === "pick" ? `.pick-row [aria-label="${st.next}"]` : `.row button[aria-label="${st.next}"]`;
    rig.mark(`tap ${st.next}${st.word ? ` (${st.word})` : ""}`);
    await rig.tap(sel);
    answers++;
    tappedKey = `${st.scene}|${st.word ?? ""}|${st.next}|${answers}`;
    tappedAt = Date.now();
    await rig.wait(150);
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [take, level, hero, secs] = args.filter((a) => !a.startsWith("--"));
  if (!take || !level || !hero) {
    console.log("usage: bun assets-src/clips/2026-09-27/firstsound/drive.ts <take> <level> <kai|suki> [seconds] [--miss=N] [--gpu] [--720p]");
    process.exit(1);
  }
  const miss = Number(args.find((a) => a.startsWith("--miss="))?.slice(7) ?? 0);
  // the machine is shared with bots: wait (up to 15 min) for a quieter minute before filming (--load=N, default 10)
  const maxLoad = Number(args.find((a) => a.startsWith("--load="))?.slice(7) ?? 10);
  for (const until = Date.now() + 15 * 60_000; loadavg()[0] > maxLoad && Date.now() < until; ) {
    console.log(`[firstsound] load ${loadavg()[0].toFixed(1)} > ${maxLoad}: waiting`);
    await new Promise((r) => setTimeout(r, 15_000));
  }
  console.log(`[firstsound] filming at load ${loadavg()[0].toFixed(1)}`);
  const rec = await record({
    name: take, base: PROD, url: `/play/?level=${level}`, save: saveFor(level, hero as "kai" | "suki"), seconds: Number(secs ?? 90),
    outDir: `${import.meta.dir}/takes`, drive: (p, r) => drive(p, r, { miss, beat: !args.includes("--nobeat") }),
    size: args.includes("--720p") ? "720p" : "1080p", gpu: args.includes("--gpu"), sheetEvery: 1,
  });
  const said = rec.events.filter((e) => ["speech", "mark", "tap", "hitch", "scene", "sting"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}${e.dur ? ` (${e.dur.toFixed(2)})` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
