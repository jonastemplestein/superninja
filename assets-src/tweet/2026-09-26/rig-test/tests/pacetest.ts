// Rig test 1b: frame pacing with a motion probe. The drive adds a thin strip at the top with a white block that a
// requestAnimationFrame loop moves at a constant 0.6 CSS px/ms (the main thread, like the game's own animations). On
// the finished 30 fps master every frame should move it by 20 CSS px: 0 = a repeated frame, 40 = a dropped one.
import { record } from "../../../../../scripts/tweet-clips.ts";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/tweet/2026-09-26/rig-test/pacing";
const SPEED = 0.6, SPAN = 1280 - 16;
const variants = [
  { name: "probe-cdp-1080", capture: "cdp", size: "1080p" },
  { name: "probe-pw-1080", capture: "playwright", size: "1080p" },
  { name: "probe-cdp-720", capture: "cdp", size: "720p" },
] as const;
const only = process.argv.slice(2);
const results: any[] = [];
for (const v of variants.filter((x) => !only.length || only.includes(x.name))) {
  const load = spawnSync("sysctl", ["-n", "vm.loadavg"]).stdout.toString().trim();
  const r = await record({
    name: v.name, url: "/play/?level=w2-2", seconds: 20, outDir: OUT, capture: v.capture, size: v.size, sheetEvery: 0,
    drive: async (page, rig) => {
      await page.evaluate(({ speed, span }) => {
        const strip = document.createElement("div");
        strip.style.cssText = `position:fixed;left:0;top:0;width:${window.innerWidth}px;height:10px;background:#000;z-index:2147483645;pointer-events:none`;
        const block = document.createElement("div");
        const k = window.innerWidth / 1280; // (the Playwright 1080p run lays out at 1920 CSS px)
        block.style.cssText = `position:absolute;left:0;top:0;width:${16 * k}px;height:10px;background:#fff`;
        strip.appendChild(block);
        document.body.appendChild(strip);
        const tick = (t: number) => {
          block.style.transform = `translateX(${((t * speed) % span) * k}px)`;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { speed: SPEED, span: SPAN });
      await rig.bot();
    },
  });
  // the block's x (in 1280-wide units) on every frame of the game part
  const W = 1280;
  const raw = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-ss", String(r.game.start + 1), "-to", String(r.game.end - 0.3), "-i", r.master,
    "-vf", `crop=iw:4:0:2,scale=${W}:1:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 28 }).stdout;
  const n = Math.floor(raw.length / W);
  const xs: number[] = [];
  for (let i = 0; i < n; i++) {
    let s = 0, m = 0;
    for (let x = 0; x < W; x++) {
      const v = raw[i * W + x];
      if (v > 128) (s += x * v), (m += v);
    }
    xs.push(m ? s / m : NaN);
  }
  const step = SPEED * 1000 / 30; // 20 px per frame
  const d = xs.slice(1).map((x, i) => (((x - xs[i]) % SPAN) + SPAN) % SPAN).filter((x) => !isNaN(x));
  const frac = (f: (x: number) => boolean) => +(100 * d.filter(f).length / d.length).toFixed(1);
  const res = {
    ...v, load, frames: d.length,
    repeatPct: frac((x) => x < step * 0.25),
    droppedPct: frac((x) => x > step * 1.6),
    onTimePct: frac((x) => Math.abs(x - step) <= step * 0.3),
    jitterPx: +Math.sqrt(d.reduce((a, x) => a + (x - step) ** 2, 0) / d.length).toFixed(2),
    delivered: r.frames, sync: { shift: r.sync.audioShiftMs, median: r.sync.residualMedianMs, maxAbs: r.sync.residualMaxAbsMs },
  };
  results.push(res);
  console.log(JSON.stringify(res));
}
writeFileSync(`${OUT}/pacing-${only.join("_") || "all"}.json`, JSON.stringify(results, null, 1));
