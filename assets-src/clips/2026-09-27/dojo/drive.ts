// Clip editor "dojo" (27 Sep 2026): normal gameplay takes of the Dojo for Jonas's clip choice. Filmed on PRODUCTION
// at real speed with the camera rig in scripts/tweet-clips.ts (CDP screencast, the real soundtrack rebuilt from
// window.__audioLog, measured A/V sync), captions on as the game shows them.
//
// The Dojo (src/scenes/Dojo.tsx): Learn (Sensei says a new sound twice, the ninja's spell writes its spelling beside
// the sound's petal, "Tap it, and say it with me!", two taps), Find ("Find the spelling for... /b/": the ninja strikes
// the one the child taps), then Build (the word is said, the child taps its letters one by one and the ninja kicks,
// punches or carries each tile into its slot, then the word is read back with its sound buttons lit). w1-4 is the
// early Word Building dojo (src/scenes/Early.tsx EarlyDojo): Sensei builds the first word ("Watch me!"), then
// together, then the child alone, then "Who read it right?".
//
//   bun assets-src/clips/2026-09-27/dojo/drive.ts <take> <level> <kai|suki> [seconds] [--miss=N[,M]] [--720p] [--gpu] [--load=N]
//
//   --miss=N  the child's Nth answer (1-based; a Find tap, each letter of a Build, a Who-read-it-right pick; the two
//             "say it with me" taps in Learn don't count, they can't be wrong) goes to a wrong tile first, so
//             Sensei's gentle correction shows, then the right one
//
// Writes takes/<take>.master.mp4 (+ .master.wav, .timeline.json, .sheet.jpg) and prints the timeline.
//
// The child: after the rig's head clapper it clears the storage and reloads, so the level starts clean from its first
// word (the first load's sounds are not in the soundtrack: the audio log is per document). It never taps while Sensei
// is talking (the Help button's portrait has .talking then), looks for 0.6-1.2 s before answering, taps the letters of
// a word 0.75-1.0 s apart, taps a green arrow (a held step) after about a second, and never taps anything at the end.
// Every take films with the anti-sampler (./antisampler.ts; without it Chrome's capturer freezes the picture for
// ~266 ms about a second after every strike and spell).
//
// Takes: bash ./takes.sh "<take> <level> <hero> <seconds> [--miss=N]" ... (one browser at a time, all 720p).
// Cuts and checks: ./cut.ts (spec, sheet in review/, freezes, repeated frames, lines cut through); ./synccheck.py (the
// tap ripples against the taps' times on the sound clock).
//
// Decisions (27 Sep, logged here: this editor writes only under assets-src/clips/2026-09-27/):
// - 720p. At 1080p the shared machine let the browser draw 32 fps (w2-1-kai-t1: 442 hitches); every 720p take held
//   60 fps with no freeze in its window. The finals are 1280×720 (the spec allows it for a 720p source).
// - The save carries the narrative ledger a real child would have by then (NARR above): the first takes on a fresh save
//   (w3-4-suki-720-t1, w1-4-suki-720-t1) said once-per-save firsts that a child at w3-4 heard long ago.
// - Continuous windows, no internal cuts. A dojo level learns all its sounds, then finds them all, then builds, so no
//   35 s window holds a Learn and a Build: across the three clips there are two with building (dojo-2 finds the last
//   new sound, then builds the first word; dojo-3 is the early dojo's own turn) and two with new sounds (dojo-1, dojo-2).
// - Every dojo has the same backdrop (dojo_bg) and no monster: the three vary the level, the land's sounds and words,
//   and the hero instead.
//
// Finals (cut with ./cut.ts; master seconds):
//   dojo-1  w2-1 Kai   takes/w2-1-kai-720-t3    2.667–30.133  poster 18.65  (t2 also clean; t3's sync ±16 ms vs ±22)
//   dojo-2  w3-4 Suki  takes/w3-4-suki-720-t2  53.833–81.333  poster 77.5   (--miss=5: a for u; t3 clean, but its word
//                                                                           "jog" has no picture and its slip, g for o,
//                                                                           is less natural)
//   dojo-3  w1-4 Suki  takes/w1-4-suki-720-t3  64.933–86.000  poster 78.61  (--miss=3: m first; t2 the same beats, but
//                                                                           two repeated frames in the take)
import type { Page } from "playwright";
import { loadavg } from "node:os";
import { spawnSync } from "node:child_process";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";
import { antiSampler } from "./antisampler";

export const PROD = "https://superninja.templestein.com";

/** The levels before each filmed one (stars on them, as for a real child who got here) and the sounds met so far. */
const W1 = ["w1-wu1", "w1-wu2", "w1-wu3", "w1-wu4", "w1-wu5", "w1-wu6", "w1-2", "w1-3", "w1-4", "w1-5", "w1-6", "w1-7", "w1-8", "w1-9", "w1-10", "w1-11", "w1-12", "w1-13", "w1-14", "w1-15"];
const W2 = ["w2-1", "w2-2", "w2-3", "w2-4", "w2-5", "w2-6", "w2-7", "w2-8"];
const W3 = ["w3-1", "w3-2", "w3-3", "w3-4"];
const ORDER = [...W1, ...W2, ...W3];
const PETALS: Record<string, string[]> = {
  "w1-4": ["m", "s", "a", "t"],
  "w1-5": ["m", "s", "a", "t"],
  "w2-1": ["m", "s", "a", "t", "i", "n", "p", "o"],
  "w2-4": ["m", "s", "a", "t", "i", "n", "p", "o", "b", "c", "g", "h"],
  "w3-1": ["m", "s", "a", "t", "i", "n", "p", "o", "b", "c", "g", "h", "d", "e", "f", "v"],
  "w3-4": ["m", "s", "a", "t", "i", "n", "p", "o", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u"],
};

/** The explanations a real child has already heard by the filmed level (the save's narrative ledger, `narr`: level
 *  indices in LEVELS order, src/scenes/narrate.tsx), so the level says what it would say to them there and not the
 *  once-per-save firsts a fresh save would get: the gem's first fill and "Three right answers in a row! Your ninja is
 *  getting stronger." (both met by w1-4), the dojo's welcome (w1-4, then w2-1; from w2-4 "Back to the dojo!"), the
 *  speaker tip (the Dojo's Find, twice: w2-1, w2-4), "The last sound is at the end of the word" (w1-4, w1-5).
 *  Indices: w1-2 6, w1-3 7, w1-4 8, w1-5 9, w2-1 20, w2-4 23, w3-1 28. */
const told = (...at: number[]) => ({ n: at.length, at });
const NARR: Record<string, Record<string, { n: number; at: number[] }>> = {
  "w1-4": { "ready:first": told(0), "ready:paw": told(0), "hear-see:w1": told(6) },
  "w2-1": {
    "ready:first": told(0), "ready:paw": told(0), "hear-see:w1": told(6), "dojo:first": told(8), "dojo:welcome": told(8), "gem-energy": told(8),
    "left-right:build": told(8), "place:last": told(8, 9),
  },
  "w3-4": {
    "ready:first": told(0), "ready:paw": told(0), "hear-see:w1": told(6), "dojo:first": told(8), "dojo:welcome": told(8, 20), "gem-energy": told(8),
    "left-right:build": told(8), "place:last": told(8, 9), "hear-again": told(20, 23), "left-right:w2": told(20), "dojo:back": told(23, 28),
  },
};

export function saveFor(level: string, hero: "kai" | "suki") {
  const at = ORDER.indexOf(level);
  const stars = Object.fromEntries(ORDER.slice(0, Math.max(0, at)).map((id) => [id, 3]));
  return tweetSave({
    hero, stars, petals: PETALS[level] ?? [], schoolYear: "none", seenStreak: true, narr: NARR[level] ?? {}, sessions: 4 + Math.round(at / 3),
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

const jitter = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

type Seen = {
  st: any;
  nav: any;
  talking: boolean;
  again: boolean;
  /** Build: the bank's free tiles; Find: the choices */
  tiles: string[];
};

export async function drive(page: Page, rig: Rig, { miss = [] as number[] } = {}) {
  await page.context().addInitScript(antiSampler);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");

  let answers = 0; // the child's own answers so far (see --miss)
  let quietSince = 0; // when Sensei last stopped talking (0 while talking)
  let turn = ""; // what the child is looking at
  let turnSince = 0;
  let dueAt = 0;
  let lastTap = 0;
  let lastKey = "";
  let learnTaps = 0;
  let slipped = new Set<number>();
  let readyKey = "";
  let readyDue = 0;
  let readyTapped = "";

  while (rig.live()) {
    const s: Seen | null = await page
      .evaluate(() => {
        const w = window as any;
        const tiles = Array.from(document.querySelectorAll(".dj-bank button.tile:not(.used), .build-bank button.tile:not(.used), .dj-front .row button.tile")).map((e) => e.getAttribute("aria-label") ?? "");
        return { st: w.__snState ?? {}, nav: w.__snNav ?? null, talking: !!document.querySelector(".help-btn.talking"), again: !!document.querySelector('button[aria-label="Play again"]'), tiles };
      })
      .catch(() => null);
    if (!s) {
      await rig.wait(60);
      continue;
    }
    const { st, nav } = s;
    const now = Date.now();
    if (s.talking) quietSince = 0;
    else if (!quietSince) quietSince = now;
    const quiet = quietSince ? now - quietSince : 0;

    // a held step: the green arrow, a moment after it lights (never at the level's end)
    if (nav?.next === "ready" && !s.again) {
      const key = `ready|${nav.pres?.id ?? ""}|${nav.pres?.step ?? ""}`;
      if (key !== readyKey) {
        readyKey = key;
        readyDue = now + jitter(900, 1300);
      } else if (now >= readyDue && readyTapped !== key) {
        rig.mark(`ready ${nav.pres?.id ?? ""}`);
        await rig.tap('[data-nav="next"]');
        readyTapped = key;
      }
      await rig.wait(50);
      continue;
    }
    if (s.again) {
      await rig.wait(200);
      continue;
    }

    const scene: string = st.scene ?? "";
    const next: string | null = st.next ?? null;
    // ---- Learn: "Tap it, and say it with me!" (twice)
    if (scene === "learn") {
      const key = `learn|${next ?? ""}`;
      if (key !== turn) {
        turn = key;
        turnSince = now;
        learnTaps = 0;
        dueAt = 0;
      }
      if (!next || learnTaps >= 2) {
        await rig.wait(50);
        continue;
      }
      if (learnTaps === 0) {
        // the explanation is over (the spelling is up and Sensei has been quiet a moment): look, then tap
        if (quiet < 350) {
          dueAt = 0;
          await rig.wait(40);
          continue;
        }
        if (!dueAt) dueAt = now + jitter(450, 800);
      } else if (!dueAt) dueAt = lastTap + jitter(1000, 1250);
      if (now < dueAt) {
        await rig.wait(30);
        continue;
      }
      rig.mark(`say ${next} (${learnTaps + 1})`);
      await rig.tap(`.dj-learn button.tile[aria-label="${next}"]`);
      learnTaps++;
      lastTap = Date.now();
      dueAt = 0;
      continue;
    }
    // ---- Find, Build, Who read it right?
    const answerable =
      (scene === "find" && next) || (scene === "build" && next && !st.busy) || (scene === "read" && !st.busy && (st.tapIdx != null || st.next));
    if (!answerable) {
      await rig.wait(40);
      continue;
    }
    // Build: one key per letter (the word, and how many letters are in)
    const key = scene === "build" ? `build|${st.word}|${next}|${answers}` : scene === "read" ? `read|${st.tapIdx ?? ""}|${st.next ?? ""}` : `find|${next}`;
    if (key !== turn) {
      const sameWord = scene === "build" && turn.startsWith(`build|${st.word}|`) && lastTap > 0;
      turn = key;
      turnSince = now;
      dueAt = sameWord ? lastTap + jitter(750, 1000) : 0;
    }
    // a new question: wait until it has been asked (and a correction: until it has been said)
    if (!dueAt) {
      if (quiet < (scene === "find" ? 600 : 350) || now - turnSince < 400) {
        await rig.wait(40);
        continue;
      }
      dueAt = now + (scene === "read" ? jitter(500, 800) : jitter(600, 1000));
    }
    if (now < dueAt) {
      await rig.wait(Math.min(30, dueAt - now));
      continue;
    }
    // (one tap per turn: a turn that stays up after it, e.g. while the ninja says "Three right answers in a row!", is not
    // tapped again; a tap the game did not take is tried again only after 6 s of quiet)
    if (lastKey === key && (now - lastTap < 6000 || quiet < 3000)) {
      await rig.wait(40);
      continue;
    }
    const n = answers + 1;
    if (miss.includes(n) && !slipped.has(n) && (scene === "find" || scene === "build")) {
      const wrong = s.tiles.find((t) => t && t !== next && t.length === (next ?? "").length) ?? s.tiles.find((t) => t && t !== next);
      if (wrong) {
        slipped.add(n);
        rig.mark(`slip ${wrong} (answer ${next})`);
        await rig.tap(scene === "find" ? `.dj-front .row button.tile[aria-label="${wrong}"]` : `.dj-bank button.tile[aria-label="${wrong}"]:not(.used), .build-bank button.tile[aria-label="${wrong}"]:not(.used)`);
        // then listen to the whole correction before trying again
        turn = "";
        lastTap = Date.now();
        await rig.wait(500);
        continue;
      }
    }
    let sel: string;
    if (scene === "find") sel = `.dj-front .row button.tile[aria-label="${next}"]`;
    else if (scene === "build") sel = `.dj-bank button.tile[aria-label="${next}"]:not(.used), .build-bank button.tile[aria-label="${next}"]:not(.used)`;
    else sel = st.tapIdx != null ? `[aria-label="sound ${st.tapIdx}"]` : `[aria-label="reader ${st.next}"]`;
    rig.mark(`tap ${scene} ${scene === "read" ? (st.tapIdx != null ? `sound ${st.tapIdx}` : st.next) : next}${st.word ? ` (${st.word})` : ""}`);
    await rig.tap(sel);
    if (!(scene === "read" && st.tapIdx != null)) answers++;
    lastKey = key;
    lastTap = Date.now();
    await rig.wait(120);
  }
}

/** Wait (up to `maxMin` minutes) until the 1-minute load is under `load`, twice 12 s apart. */
async function waitForQuiet(maxMin: number, load: number) {
  const t0 = Date.now();
  const others = () =>
    spawnSync("ps", ["-Ao", "command"]).stdout.toString().split("\n").filter((l) => /^bun .*clips\/2026-09-27\/(?!dojo\/)[^/]+\/\S+\.ts\b/.test(l)).length;
  for (;;) {
    if (loadavg()[0] <= load) {
      await new Promise((r) => setTimeout(r, 12_000 + Math.random() * 5000));
      if (loadavg()[0] <= load) return;
    }
    if (Date.now() - t0 > maxMin * 60_000) {
      console.log(`[dojo] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)}, ${others()} other clip scripts)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const [take, level, hero, secs] = args.filter((a) => !a.startsWith("--"));
  if (!take || !level || !hero) {
    console.log("usage: bun assets-src/clips/2026-09-27/dojo/drive.ts <take> <level> <kai|suki> [seconds] [--miss=N[,M]] [--720p] [--gpu] [--load=N]");
    process.exit(1);
  }
  const miss = (args.find((a) => a.startsWith("--miss="))?.slice(7) ?? "").split(",").filter(Boolean).map(Number);
  const maxLoad = Number(args.find((a) => a.startsWith("--load="))?.slice(7) ?? 14);
  if (!args.includes("--nowait")) await waitForQuiet(20, maxLoad);
  console.log(`[dojo] ${take}: filming at load ${loadavg()[0].toFixed(1)}`);
  const rec = await record({
    name: take, base: PROD, url: `/play/?level=${level}`, save: saveFor(level, hero as "kai" | "suki"), seconds: Number(secs ?? 120),
    outDir: `${import.meta.dir}/takes`, drive: (p, r) => drive(p, r, { miss }),
    size: args.includes("--720p") ? "720p" : "1080p", gpu: args.includes("--gpu"), sheetEvery: 1,
  });
  const said = rec.events
    .filter((e) => ["speech", "mark", "hitch", "scene", "sting"].includes(e.kind))
    .map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}${e.dur ? ` (${e.dur.toFixed(2)})` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
