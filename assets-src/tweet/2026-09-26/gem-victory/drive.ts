// Takes for the hand-cut "gem-victory" tweet clip (26 Sep 2026): the World Flower's gem-mastered celebration with the
// victory sting, then the petal flying home onto the big World Flower.
//
//   bun assets-src/tweet/2026-09-26/gem-victory/drive.ts <take> [--noshake] [--1080p] [--gpu] [--seconds 44]
//
// Writes assets-src/tweet/2026-09-26/gem-victory/raw/<take>.master.mp4 (+ .master.wav, .timeline.json, .sheet.jpg)
// and prints the speech timeline, frame stats and sync.
//
// Why the reload: `&celebrate=1` starts the celebration the moment the page loads, which is while the rig is still
// clapping its sync slates, so "You won the gem!" and the gem's first spin would land on the clapper (the recipe's
// one-take clip starts 0.5 s into that line). The drive clears the save (the rig's init script then seeds it again)
// and loads the page a second time once the game window has started, so the whole celebration is clean.
import { writeFileSync } from "node:fs";
import { record, tweetSave } from "../../../../scripts/tweet-clips";

/** scripts/record-clips.ts FLOWER_SAVE plus a few words found (as clip-recipes.ts FLOWER): part-way through Blossom
 *  Hills, ai and ay met, ay>ae won; the victory is for ai>ae. */
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "ay>ae"],
  energy: { "o>o": 5, "c>k": 3, "b>b": 6, "ai>ae": 8, "ss>s": 4, "l>l": 7 },
  words: {
    rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 },
    sat: { n: 3, ok: 3, last: 1 }, sit: { n: 2, ok: 2, last: 1 }, mat: { n: 2, ok: 2, last: 1 }, am: { n: 2, ok: 2, last: 1 },
  },
};

const PREVIEW = "https://next.superninja.templestein.com";
const URL_PATH = "/play/?scene=tree&gem=ai%3Eae&celebrate=1";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/gem-victory/raw";

const args = process.argv.slice(2);
const take = args.find((a) => !a.startsWith("--")) ?? "take1";
const size = args.includes("--1080p") ? "1080p" : "720p";
const gpu = args.includes("--gpu");
const si = args.indexOf("--seconds");
const seconds = si >= 0 ? Number(args[si + 1]) : 44;
/** --noshake: the game's screen shake (.screen-shake, 0.4 s: the dive's burst and each of the ninja's landings) makes
 *  the headless renderer drop to about 10 fps for its whole length, on the CPU and the GPU alike and with or without a
 *  compositor layer for the stage (tested with diag.ts: with the shake off, no frame gap over 49 ms). So the take is
 *  filmed with the shake switched off, the moment each shake starts is logged (<take>.shakes.json, master clock),
 *  and edit.ts puts the very same shake (styles.css @keyframes screenshake) back on the picture. */
const noshake = args.includes("--noshake");
const NOSHAKE_CSS = ".screen-shake{animation:none!important}";
const clock = { t0: 0 };
let shakes: number[] = [];

const rec = await record({
  name: take,
  url: URL_PATH,
  base: PREVIEW,
  // captions on, music at the game's default 0.32 (tweetSave)
  save: tweetSave(FLOWER),
  seconds,
  outDir: OUT,
  size,
  gpu,
  showTaps: false,
  sheetEvery: 1,
  drive: async (page, rig) => {
    // no taps: the celebration plays by itself. Start it again, now that the slates are done.
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {}
    });
    if (noshake)
      await page.addInitScript((css) => {
        const w = window as any;
        w.__shakes = [] as number[];
        const add = () => {
          const s = document.createElement("style");
          s.textContent = css;
          document.head.appendChild(s);
        };
        if (document.head) add();
        else document.addEventListener("DOMContentLoaded", add, { once: true });
        // shakeStage() removes the class, reads offsetWidth and adds it again: log each add
        new MutationObserver((ms) => {
          for (const m of ms) {
            const el = m.target as Element;
            if (el.classList?.contains("screen-shake") && !(m.oldValue ?? "").split(/\s+/).includes("screen-shake")) w.__shakes.push(Date.now());
          }
        }).observe(document, { attributes: true, attributeFilter: ["class"], attributeOldValue: true, subtree: true });
      }, NOSHAKE_CSS);
    clock.t0 = Date.now() - rig.elapsed() * 1000;
    rig.mark("reload");
    await page.goto(PREVIEW + URL_PATH, { waitUntil: "load", timeout: 60_000 });
    rig.mark("loaded");
    while (rig.live()) {
      await rig.wait(250);
      if (!noshake) continue;
      // (only ever grows: a late poll can land on the rig's blank page, whose list is empty)
      const got = await page.evaluate(() => (window as any).__shakes as number[] | undefined).catch(() => undefined);
      if (got && got.length >= shakes.length) shakes = got;
    }
  },
});

const said = rec.events.filter((e) => e.kind === "speech").map((e) => `${e.t.toFixed(2)}+${(e.dur ?? 0).toFixed(2)} ${e.id}`);
const other = rec.events.filter((e) => ["sting", "music", "music-stop", "mark", "scene", "hitch"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.dur ? ` (${e.dur})` : ""}`);
if (noshake) {
  // the shake's DOM moment on the master's clock: the picture shows it rec.sync.audioShiftMs later (the rig lines the
  // sound up with the picture by the same amount)
  const at = [...new Set(shakes)].map((t) => Math.round(((t - clock.t0 + rec.sync.audioShiftMs) / 1000) * 1000) / 1000);
  writeFileSync(`${OUT}/${take}.shakes.json`, JSON.stringify({ css: NOSHAKE_CSS, shakes: at }, null, 1));
  console.log("shakes (master s):", at.join(" "));
}
console.log(JSON.stringify({ take, size, gpu, noshake, master: rec.master, sheet: rec.sheet, game: rec.game, duration: rec.duration, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
console.log("speech:\n  " + said.join("\n  "));
console.log("other:\n  " + other.join("\n  "));
process.exit(0);
