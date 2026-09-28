// Clip editor "supercut" (27 Sep 2026): one take per enemy (all 19: the 18 monsters of the six lands and the Gem
// Guardian of the Gem Trial), each a whole fight filmed on PRODUCTION at real speed with the camera rig in
// scripts/tweet-clips.ts: the entrance (a monster dropping in with a boom, a flyer swooping in, or, for a boss, Baron
// Muddle's cut-in), every hit, and the run-away (or, for a boss, "Nooo! My muddle!"). ./edit.ts cuts the supercut from
// them.
//
//   bun assets-src/clips/2026-09-27/supercut/drive.ts take <name> <enemy> [--720p] [--cpu] [--seconds=N] [--hero=kai|suki] [--nowait]
//   bun assets-src/clips/2026-09-27/supercut/drive.ts list
//
// The child is the gem-trial editor's (../gemtrial/drive.ts driveTrial, which plays any Battle.tsx fight): after the
// rig's head clapper it clears the storage and reloads (the fight starts clean, the entrance never under the clapper),
// looks at each new word for 0.5–0.8 s, then taps each sound's tile once the previous pure sound has been heard to its
// end (about one tap a second), never a wrong tile.
// The save: a child who has played every level before this one (three stars each), has heard the once-only lines
// (Baron's motive, gem energy, the first streak, the first two Readies), whose "two letters, one sound" reminders are
// retired (as the battle and boss editors decided), and who has had both tellings of the Monster Battle, the boss battle
// and the gem battle, last played two days ago: every fight opens on its short form (no demo, no Ready hold), so the
// take is the fight itself. Captions on, the music at the game's default.
// The Gem Guardian's trial is the gem-trial editor's clip 2 save (the <sh> gem, frontier w5-7: the Shadow Castle).
//
// Decisions (27 Sep, logged here):
// - 1080p on the GPU (the default here; --cpu and --720p for comparison). The probe (gloop-t2, load 5–7) drew 60 fps
//   with no hitch and no repeated frame; so did every take after it (19 takes, 0 hitches in any fight; the few
//   hitches were at the reload, before the fight). The 1920×1080 spec needs no upscale.
// - Every enemy filmed fresh today on production (the facing fix for gloop, bamboo_bandit, boss_panda and kappa is in
//   it), not reused from the other editors' morning takes: one session, one resolution, one save.
// - Kept: gloop-t2 (t1 was broken: its intermediate video was moved away while it was still mixing), bamboo_bandit-t2
//   (t1's knockout had one repeated frame mid-spin, 38.90 s), every other enemy's t1.
import type { Page } from "playwright";
import { mkdirSync } from "node:fs";
import { loadavg } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";
import { LEVELS, MONSTER_INFO, knownSpellings } from "../../../../src/content/worlds";
import { driveTrial, saveFor as trialSave, type Clip as TrialClip } from "../gemtrial/drive";

export const PROD = "https://superninja.templestein.com";
const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES = join(HERE, "takes");
const DAY = 86_400_000;

export interface Enemy { id: string; level?: string; trial?: string; hero: "kai" | "suki"; seconds: number }
const secs = (hp: number, boss: boolean) => (boss ? 30 + hp * 11.5 : 14 + hp * 12);
const E = (id: string, level: string, hero: "kai" | "suki"): Enemy => ({ id, level, hero, seconds: Math.round(secs(MONSTER_INFO[id].hp, id.startsWith("boss_"))) });
/** In the game's order (the running order of the supercut is ./edit.ts's). */
export const ENEMIES: Enemy[] = [
  E("gloop", "w1-6", "kai"),
  E("bamboo_bandit", "w1-13", "suki"),
  E("boss_panda", "w1-15", "kai"),
  E("crabble", "w2-2", "suki"),
  E("petal_imp", "w2-6", "kai"),
  E("boss_oni", "w2-8", "suki"),
  E("snow_puff", "w3-3", "kai"),
  E("rock_golem", "w3-9", "suki"),
  E("boss_yeti", "w3-12", "kai"),
  E("kappa", "w4-4", "suki"),
  E("puffer", "w4-7", "kai"),
  E("boss_serpent", "w4-9", "suki"),
  E("lantern_ghost", "w5-2", "kai"),
  E("thunder_drum", "w5-7", "suki"),
  E("shadow_bat", "w5-9", "kai"),
  E("boss_knight", "w5-11", "suki"),
  E("cloud_sprite", "w6-5", "kai"),
  E("boss_baron", "w6-11", "suki"),
  { id: "gem_guardian", trial: "sh>sh", hero: "kai", seconds: 84 },
];

/** Told twice, in sessions 5 and 7, last played two days ago: the short form (content/narrative.ts frameForm). */
const twice = () => ({ n: 2, at: [0, 0], s: [5, 7], lastAt: Date.now() - 2 * DAY, lastSession: 7 });
export function saveFor(level: string, hero: "kai" | "suki") {
  const i = LEVELS.findIndex((l) => l.id === level);
  if (i < 0) throw new Error(`no level ${level}`);
  const stars = Object.fromEntries(LEVELS.slice(0, i).map((l) => [l.id, 3]));
  const told = { n: 3, at: [0, 0, 0], s: [0, 0, 0] };
  const narr: Record<string, unknown> = {
    "baron-motive": { n: 1, at: [0] }, "gem-energy": { n: 1, at: [0] }, "ready:first": { n: 1, at: [0] }, "ready:paw": { n: 1, at: [0] },
    "battle:why": { n: 1, at: [0] }, "game:battle": twice(), "game:boss": twice(), "game:trial": twice(),
  };
  for (const g of knownSpellings(LEVELS[i])) if (g.length > 1 || g === "x") (narr[`letters:${g}`] = told), (narr[`two-sounds:${g}`] = told);
  return tweetSave({
    hero, stars, schoolYear: "none", seenStreak: true, seenTimer: true, sessions: 9, narr,
    settings: { relaxed: false, music: 0.32, captions: true, unlockAll: true },
  });
}

/** Wait (up to `maxMin` minutes) until the 1-minute load is under `max`, twice 10 s apart. */
async function quiet(max = 12, maxMin = 20) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMin * 60_000) {
    if (loadavg()[0] < max) {
      await new Promise((r) => setTimeout(r, 10_000));
      if (loadavg()[0] < max + 2) return;
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  console.log(`[supercut] filming anyway after ${maxMin} min (load ${loadavg()[0].toFixed(1)})`);
}

export async function drive(page: Page, rig: Rig, e: Enemy) {
  const clip: TrialClip = { kind: "trial", gem: e.trial ?? "", frontier: e.level ?? "w5-7", hero: e.hero, window: [], seconds: e.seconds };
  // Move 1's join-in (the session's first word zapped: "Now tap the rabbit, and read the word fast."): the child taps
  // the rabbit once Sensei has said so (driveTrial never does: a gem battle has no rabbit), and its star leaps at the
  // monster; without it the rabbit waits 12 s
  const rabbit = (async () => {
    while (rig.live()) {
      const live = await page.evaluate(() => !!document.querySelector('[data-fs="rabbit"][role="button"]')).catch(() => false);
      if (!live) {
        await rig.wait(120);
        continue;
      }
      await rig.wait(2300 + Math.random() * 300);
      rig.mark("rabbit");
      await rig.tap('[data-fs="rabbit"][role="button"]');
      await rig.wait(1500);
    }
  })();
  await driveTrial(page, rig, clip);
  await rabbit;
}

// The rig fetches each sound from production after filming; now and then one fetch hangs (a stale pooled connection,
// it seems) until Bun's 300 s fetch timeout (gloop-t1, bamboo_bandit-t1: 3–5 minutes idle). Every fetch here closes
// its connection, gives up after 20 s and tries again (up to three times).
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init: any = {}) => {
  for (let i = 1; ; i++) {
    try {
      return await realFetch(input, { ...init, keepalive: false, headers: { ...(init.headers ?? {}), connection: "close" }, signal: AbortSignal.timeout(20_000) });
    } catch (e) {
      if (i >= 3) throw e;
      console.warn(`[supercut] fetch ${String(input)} failed (${(e as Error).message}); again`);
    }
  }
}) as typeof fetch;

if (import.meta.main) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "take") {
    const [name, id] = a;
    const base = ENEMIES.find((x) => x.id === id);
    if (!base) throw new Error(`enemy: ${ENEMIES.map((x) => x.id).join(" ")}`);
    const opt = (k: string) => a.find((x) => x.startsWith(`--${k}=`))?.split("=")[1];
    const e: Enemy = { ...base, hero: (opt("hero") as "kai" | "suki") ?? base.hero, seconds: Number(opt("seconds") ?? base.seconds) };
    mkdirSync(TAKES, { recursive: true });
    // (the gem-trial editor's waitForQuiet counts this very process as another editor filming: wait on the load only)
    if (!a.includes("--nowait")) await quiet(12, 20);
    const url = e.trial ? `/play/?trial=${encodeURIComponent(e.trial)}` : `/play/?level=${e.level}`;
    const save = e.trial
      ? trialSave({ kind: "trial", gem: e.trial, frontier: "w5-7", hero: e.hero, window: [], seconds: e.seconds })
      : saveFor(e.level!, e.hero);
    const gpu = !a.includes("--cpu"), size = a.includes("--720p") ? "720p" : "1080p";
    console.log(`[supercut] ${name}: ${e.id} ${url} (${e.hero}) ${e.seconds}s ${size}${gpu ? " gpu" : ""} at load ${loadavg()[0].toFixed(1)}`);
    const rec = await record({ name, url, base: PROD, save, seconds: e.seconds, outDir: TAKES, drive: (p, r) => drive(p, r, e), size, gpu, showTaps: true });
    const ev = rec.events;
    const end = ev.find((x) => x.kind === "speech" && ["battle_win", "baron_lose"].includes(x.id)) ?? ev.find((x) => x.kind === "mark" && x.id.startsWith("left battle"));
    console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: { lat: rec.sync.pictureLatencyMs, shift: rec.sync.audioShiftMs, res: rec.sync.residualMs, median: rec.sync.residualMedianMs, maxAbs: rec.sync.residualMaxAbsMs }, advice: rec.advice, ended: end ? `${end.id} at ${end.t}` : "NOT FINISHED" }));
    console.log("hitches:", ev.filter((x) => x.kind === "hitch").map((x) => `${x.t}(${x.id})`).join(" ") || "none");
    for (const x of ev) if (["speech", "scene", "sting", "music", "music-stop", "mark", "hitch"].includes(x.kind) && !/^tap /.test(x.id)) console.log(`${x.t.toFixed(3)} ${x.kind} ${x.id}${x.dur ? ` [${x.dur}]` : ""}${x.text && x.kind === "speech" ? ` "${x.text}"` : ""}`);
  } else if (cmd === "list") {
    for (const e of ENEMIES) console.log(e.id, e.level ?? `trial ${e.trial}`, e.hero, e.seconds);
  } else {
    console.log("usage: drive.ts take <name> <enemy> [--720p] [--cpu] [--seconds=N] [--hero=kai|suki] [--nowait] | list");
  }
  process.exit(0);
}
