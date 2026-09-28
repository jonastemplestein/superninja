// Normal gameplay clips of Ninja Ears (the ears warm-ups: w1-wu1, w1-wu3, w1-wu5), for Jonas to choose from (27 Sep).
// Recorded from PRODUCTION at real speed with the rig in scripts/tweet-clips.ts (CDP screencast, the game's own
// soundtrack rebuilt from window.__audioLog, clapper-measured A/V sync).
//
//   bun assets-src/clips/2026-09-27/ears/drive.ts <level> <take> [hero] [seconds] [slip] [preroll]
//     level   w1-wu1 | w1-wu3 | w1-wu5
//     hero    kai | suki (default kai)
//     slip    one gentle mistake: "<beat>:<n>:<label>": the child's n-th tap (1-based) in that beat goes on <label>
//             instead, e.g. "tapall:2:moon" (W1: moon after the sock) or "sounds:3:cap"; "-" for none
//     preroll seconds of the lesson played once before the take (see drive()), 0 for none
//     GPU=1   render with ANGLE Metal instead of SwiftShader (steadier while other workflows load the CPU)
//     SPECK=0 leave out the capture fix in ./antisampler.ts (on by default)
//   → takes/<level>-<take>.master.mp4 (+ .wav, .timeline.json, .sheet.jpg)
//
// The drive, like the 26 Sep fish-dog driver (assets-src/tweet/2026-09-26/fish-dog/drive.ts):
// - The warm-up starts talking as soon as the page loads, under the rig's head clapper, so once the clapper is done
//   the drive clears the storage (the init script writes the same fresh save again) and reloads: the lesson starts
//   again from the top, clean.
// - It taps like a child who listens: only once the question has been said in full (__snState.asked), and 0.9–1.4 s
//   after that (never over Sensei, so no line is cut off), on .wu .wu-slot:not(.out) [aria-label=<next>] (or the
//   tortoise / rabbit button). A held Next between two shows (W1: the notice → tap all) is tapped ~1.3 s after it is
//   ready. Once the lesson ends (the reward), hands off.
import type { Page } from "playwright";
import { join } from "node:path";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";
import { antiSampler } from "./antisampler";

export const PROD = "https://superninja.templestein.com";
const HERE = import.meta.dir;

export function saveFor(hero: "kai" | "suki") {
  return tweetSave({ hero, schoolYear: "none", stickers: [], shiny: [], settings: { captions: true, music: 0.32, unlockAll: false } });
}

interface Slip { beat: string; n: number; label: string }
const parseSlip = (s?: string): Slip | null => {
  if (!s || s === "-") return null;
  const [beat, n, label] = s.split(":");
  return { beat, n: Number(n), label };
};

/** The child: plays the lesson until `stopAt` (Date.now() ms) or the lesson ends (true then). */
async function child(page: Page, rig: Rig, o: { slip?: Slip | null; seed: number }, stopAt = Infinity): Promise<boolean> {
  // a steady but human rhythm (seeded, so a take can be repeated, and the pre-roll taps like the take)
  let seed = o.seed;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let key = "", since = 0, wait = 0;
  let wasWarmup = false;
  let beat = "", tapsInBeat = 0, slipped = false;
  while (rig.live() && Date.now() < stopAt) {
    const s: any = await page
      .evaluate(() => {
        const w = window as any;
        return { st: w.__snState || {}, nav: w.__snNav || null };
      })
      .catch(() => ({ st: {}, nav: null }));
    const st = s.st, nav = s.nav;
    if (st.scene === "warmup") wasWarmup = true;
    else if (wasWarmup) return true; // the reward: hands off
    if (st.scene === "warmup" && st.beat !== beat) {
      beat = st.beat;
      tapsInBeat = 0;
    }
    // what a child would tap now, if anything
    let now = "";
    if (nav?.next === "ready" && nav?.pres?.id && String(nav.pres.id).startsWith("W")) now = "next";
    else if (st.scene === "warmup" && st.next && st.asked && !st.busy) now = `ans:${st.next}`;
    if (now !== key) {
      key = now;
      since = Date.now();
      wait = now === "next" ? 1300 : 900 + rnd() * 500;
    } else if (now && Date.now() - since >= wait) {
      if (now === "next") {
        rig.mark("next");
        await rig.tap('[data-nav="next"]');
      } else {
        tapsInBeat++;
        const slip = o.slip && !slipped && o.slip.beat === beat && o.slip.n === tapsInBeat ? o.slip : null;
        const label = slip ? slip.label : st.next;
        if (slip) {
          slipped = true;
          rig.mark(`slip ${label}`);
        }
        const sel = label === "tortoise" || label === "rabbit" ? `.wu [aria-label="${label}"]` : `.wu .wu-slot:not(.out) [aria-label="${label}"]`;
        await rig.tap(sel);
      }
      key = "";
      // (let the game take the tap before looking again)
      await rig.wait(250);
      continue;
    }
    await rig.wait(40);
  }
  return false;
}

const fresh = async (page: Page, rig: Rig, label: string) => {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  rig.mark(`reload ${label}`);
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark(`loaded ${label}`);
};

/** `preroll` (s): play the lesson once, unfilmed in effect (cut away), before the take: the headless browser's
 *  software renderer stalls ~260 ms the first time each new effect is drawn (the tortoise's pulse, a new card set), and
 *  a second pass in the same browser draws them smoothly. */
export async function drive(page: Page, rig: Rig, o: { slip?: Slip | null; seed?: number; preroll?: number; speck?: boolean } = {}) {
  const seed = o.seed ?? 7;
  // (from the reload on: see ./antisampler.ts)
  if (o.speck) await page.context().addInitScript(antiSampler);
  if (o.preroll) {
    await fresh(page, rig, "preroll");
    await child(page, rig, { slip: o.slip, seed }, Date.now() + o.preroll * 1000);
  }
  await fresh(page, rig, "take");
  if (await child(page, rig, { slip: o.slip, seed })) rig.mark("lesson over");
}

if (import.meta.main) {
  const [level = "w1-wu1", take = "t1", hero = "kai", secs = "95", slipArg = "-", preArg = "0"] = process.argv.slice(2);
  const outDir = join(HERE, "takes");
  const rec = await record({
    name: `${level}-${take}`, url: `/play/?level=${level}`, base: PROD, save: saveFor(hero as "kai" | "suki"), seconds: Number(secs), outDir,
    drive: (p, r) => drive(p, r, { slip: parseSlip(slipArg), seed: 7 + take.length * 13 + take.charCodeAt(take.length - 1), preroll: Number(preArg), speck: process.env.SPECK !== "0" }), sheetEvery: 1,
    gpu: process.env.GPU === "1",
  });
  const said = rec.events.filter((e) => ["speech", "tap", "mark", "hitch", "scene", "sting"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.dur ? ` (${e.dur})` : ""}${e.text && e.kind === "speech" ? ` "${e.text}"` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
