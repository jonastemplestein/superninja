// Hand-driven takes of the petal chart (the "petal-scroll" clip for the 26 Sep 2026 tweet), filmed on the PREVIEW build
// with the camera rig in scripts/tweet-clips.ts.
//
//   bun assets-src/tweet/2026-09-26/petal-scroll/drive.ts <take> [--720p] [--gpu]
//
// Writes assets-src/tweet/2026-09-26/petal-scroll/raw/<take>.master.mp4 (+ .master.wav, .timeline.json, .sheet.jpg).
//
// The beats (seconds after the game's picture starts):
//   ~1.9  Sensei has finished "Tap a petal to see its gems." (it plays under the clapper, so it is not in the cut): tap
//         the pink Petal chart button. The scroll unrolls on /ae/ (ay won, ai glowing), with its own little nudge.
//   +1.9  flick into the mist, then tap a misty "?" petal: "This sound is still a secret. You'll find it on your
//         adventure!" and, while she says it, swipe on through the mist to the met petals (/s/ /l/ /f/ /e/, with the
//         school chart's pictures in their corners)
//   then  flick back to the start and open /ae/: the train, the ai and ay gems, "/ae/. Different spellings of... /ae/
//         ...but it's the same sound!", tail... and... day, the words found (rain, tail, day) and the green Practise gate.
//
// Swipes are real touch gestures (CDP Input.synthesizeScrollGesture, touch, with the fling a finger leaves): the browser
// scrolls them on its compositor like a tablet does. A mouse drag (the chart's desktop fallback) sets scrollLeft from
// the page's main thread, which the SVG mist keeps busy, so under the rig it moved in 3–5 jerks per swipe (take1, and
// recipe-tests/petal-scroll.mp4).
//
// The chart's swipe hint (a hand gliding over the petals) is switched off (localStorage superninja.scrollHint): on video
// it reads as a mouse cursor.
import type { CDPSession, Page } from "playwright";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";

/** A child part-way through Blossom Hills who has met ai and ay, with a few words found (as clip-recipes.ts FLOWER). */
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
  words: {
    rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 },
    sat: { n: 3, ok: 3, last: 1 }, sit: { n: 2, ok: 2, last: 1 }, mat: { n: 2, ok: 2, last: 1 }, am: { n: 2, ok: 2, last: 1 },
  },
};

const Y = 92 + 4 + 230; // a finger low on the scroll band (CSS px), under the petals' gems
const scrollLeft = (page: Page) => page.evaluate(() => (document.querySelector(".petal-scroll") as HTMLElement | null)?.scrollLeft ?? 0);

/** A finger swipe: from x, `dx` px (negative: the finger moves left, the chart moves on), at `speed` px/s; `fling`: let
 *  it glide on after the finger lifts. */
async function swipe(cdp: CDPSession, x: number, dx: number, speed: number, fling: boolean) {
  await cdp.send("Input.synthesizeScrollGesture", { x, y: Y, xDistance: dx, yDistance: 0, speed, gestureSourceType: "touch", preventFling: !fling }).catch((e) => console.warn("swipe failed", e?.message));
}
/** A finger tap at (x, y). */
async function tapAt(cdp: CDPSession, x: number, y: number) {
  await cdp.send("Input.synthesizeTapGesture", { x, y, duration: 60, tapCount: 1, gestureSourceType: "touch" }).catch((e) => console.warn("tap failed", e?.message));
}

/** The middle of the misty ("?") petal nearest the middle of the screen. */
async function mistyNearMiddle(page: Page) {
  return page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.petal-scroll [aria-label^="petal "]')) as HTMLElement[];
    const misty = els.filter((e) => e.querySelector('[fill*="-mist)"]'));
    let best: { x: number; y: number; id: string } | null = null, bestD = Infinity;
    for (const e of misty) {
      const r = e.getBoundingClientRect();
      const x = r.left + r.width / 2, d = Math.abs(x - innerWidth / 2);
      if (r.left > 60 && r.right < innerWidth - 60 && d < bestD) (bestD = d), (best = { x, y: r.top + r.height * 0.45, id: e.getAttribute("aria-label") ?? "" });
    }
    return best;
  });
}
/** Where a petal is on screen (CSS px). */
const petalBox = (page: Page, p: string) => page.locator(`.petal-scroll [aria-label="petal ${p}"]`).first().boundingBox();

async function drive(page: Page, rig: Rig) {
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(() => localStorage.setItem("superninja.scrollHint", "1")).catch(() => {});
  await rig.wait(1900);
  rig.mark("chart");
  await rig.tap('[aria-label="Petal chart"]');
  await rig.wait(1900);
  // a flick into the mist
  rig.mark("flick 1");
  await swipe(cdp, 980, -420, 2200, true);
  await rig.wait(900);
  const m = await mistyNearMiddle(page);
  if (m) {
    rig.mark(`secret ${m.id}`);
    await tapAt(cdp, m.x, m.y);
  }
  await rig.wait(1100);
  // on through the mist while Sensei says it's a secret: a flick, then a swipe that stops with /s/ a petal in from the
  // left (one misty petal still showing beside the met ones)
  rig.mark("flick 2");
  await swipe(cdp, 1000, -600, 3000, true);
  await rig.wait(1000);
  const s = await petalBox(page, "s");
  const togo = s ? s.x - 250 : 900;
  rig.mark(`swipe 3 (${Math.round(togo)} px)`);
  if (togo > 40) await swipe(cdp, Math.min(1180, 250 + togo), -Math.min(togo, 1100), 1600, false);
  rig.mark("met petals");
  await rig.wait(1500);
  // flick home, and again if it didn't get there
  rig.mark("flick home");
  for (let i = 0; i < 3 && (await scrollLeft(page)) > 4; i++) {
    // (tested: 1050 px at 8000 px/s carries it home from /s/, ~2770 px)
    await swipe(cdp, 170, 1050, 9000, true);
    await rig.wait(i ? 700 : 1000);
  }
  await rig.wait(250);
  const ae = await petalBox(page, "ae");
  // Sensei explains a petal with two met spellings one of two ways, on a coin toss (Tree.tsx Explain: `Math.random() <
  // 0.5` gives "Different spellings of /ae/... but it's the same sound!", else "This petal is the sound /ae/..."). The
  // clip is about the first, so for the moment of this tap the coin lands that way (takes 2 and 3 got the other).
  // Nothing else random happens as the panel opens (no particles).
  await page.evaluate(() => {
    const w = window as any, r = Math.random, until = performance.now() + 900;
    Math.random = () => (performance.now() < until ? r() * 0.5 : r());
    w.__coinUntil = until;
  }).catch(() => {});
  rig.mark("petal ae");
  if (ae && ae.x > 0 && ae.x + ae.width < 1280) await tapAt(cdp, ae.x + ae.width / 2, ae.y + ae.height * 0.45);
  else rig.mark("ae not in view");
  await rig.wait(10_000);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const take = args.find((a) => !a.startsWith("--")) ?? "take1";
  const outDir = `${import.meta.dir}/raw`;
  const rec = await record({
    name: take, url: "/play/?scene=tree", save: tweetSave(FLOWER), seconds: 28, outDir, drive,
    size: args.includes("--720p") ? "720p" : "1080p", gpu: args.includes("--gpu"), sheetEvery: 0.5,
  });
  const said = rec.events.filter((e) => ["speech", "mark", "tap", "hitch"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.dur ? ` (${e.dur.toFixed(2)})` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
