// Clip "film-baron" for the 26 Sep 2026 tweet: the new World Flower opening film, from shot 3. Baron Muddle ("Words,
// words, WORDS! How I HATE them!"), lip-synced to his own voice in shot 4 ("I am Baron Muddle! Every sound on this island
// is MINE! Mwa-ha-ha-ha!"), blows the flower's petals into a rainbow vortex, and in shot 5 they streak across the island
// ("Oh no! The petals blew away, all over the island!").
//
//   bun assets-src/tweet/2026-09-26/film-baron/drive.ts <take-name> [seconds]
//
// Films one take of the PREVIEW build with the camera rig (scripts/tweet-clips.ts) into ./raw/<take>.master.mp4 (+ its
// .timeline.json and contact sheet). One take per process (the rig's advice: a second browser in one bun process is
// unreliable). The cut is made by cut.ts in this folder.
//
// Choices:
// - 720p: the film's clips are 1280×720 (24 fps), so 1080p would only upscale them, and cost frames.
// - A clean feed: the film's overlays (Skip film, the Next arrow, the shot dots, Sensei's help button) are made
//   transparent, so the clip is the film itself. They stay in the DOM, so the taps below still work; the tap ripple is
//   off (the two taps are before the cut anyway).
// - Shots 1 and 2 are skipped with the Next arrow, as in clip-recipes.ts. The preview moves on by itself after each
//   shot's clip and line; if a newer build waits for Next instead (src/scenes/IntroFilm.tsx: "Nothing moves on by
//   itself"), the drive taps Next once a shot has finished, so the take still reaches shot 6.
import type { Page } from "playwright";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";

const OUT = "assets-src/tweet/2026-09-26/film-baron/raw";

const CLEAN = `
  .skip-film, [aria-label="Next"], .help-btn, .hold-hint, .film-dots, .scene > .row { opacity: 0 !important; transition: none !important; animation: none !important; }
`;

export async function drive(page: Page, rig: Rig) {
  await page.addStyleTag({ content: CLEAN }).catch(() => {});
  // shot changes on the timeline (when the film's <video> gets a new clip), to find the cuts
  let lastSrc = "";
  let endedSince = 0;
  const watch = async () => {
    while (rig.live()) {
      const v = await page
        .evaluate(() => {
          const el = document.querySelector("video");
          return el ? { src: el.getAttribute("src") ?? "", ended: el.ended, t: el.currentTime } : null;
        })
        .catch(() => null);
      if (v && v.src !== lastSrc) {
        lastSrc = v.src;
        endedSince = 0;
        rig.mark(`shot ${v.src.match(/intro_(\d+)/)?.[1] ?? v.src}`);
      }
      // (a build that waits for Next: tap it once the shot has held its last frame for 1.5 s)
      if (v?.ended) {
        endedSince ||= Date.now();
        if (Date.now() - endedSince > 1500) {
          rig.mark("next (no auto-advance)");
          await rig.tap('[aria-label="Next"]');
          endedSince = Date.now() + 5000;
        }
      } else endedSince = 0;
      await rig.wait(50);
    }
  };
  const watching = watch();
  // skip shots 1 and 2
  await rig.wait(800);
  await rig.tap('[aria-label="Next"]');
  await rig.wait(600);
  await rig.tap('[aria-label="Next"]');
  await watching;
}

if (import.meta.main) {
  const name = process.argv[2] ?? "take1";
  const seconds = Number(process.argv[3] ?? 25);
  const rec = await record({
    name,
    url: "/play/?scene=intro",
    save: tweetSave({ seenIntro: false }),
    seconds,
    outDir: OUT,
    size: "720p",
    showTaps: false,
    drive,
  });
  const said = rec.events.filter((e) => ["speech", "mark", "hitch", "tap"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.dur ? ` (${e.dur}s)` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
