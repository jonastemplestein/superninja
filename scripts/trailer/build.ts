// One command: bun scripts/trailer/build.ts [--landscape-only] [--gen-only] [--no-teaser] [--prune] [--config=trailer/trailer.config.ts]
//   → public/media/trailer.mp4 (1920×1080), trailer-vertical.mp4 (1080×1920), trailer-teaser.mp4, trailer-poster.jpg
// Pipeline: generate (cached) → cards → segments → concat → mix → mux/export. See docs/TRAILER.md.
import { chromium } from "playwright";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { TrailerConfig } from "../../trailer/trailer.config";
import { assemble, renderSegment } from "./assemble";
import { cardDir, FORMATS, renderCards, type Format } from "./cards";
import { generate } from "./generate";
import { BUILD, CACHE, duration, ensureDir, ffmpeg, hashOf, layout, log, p } from "./lib";
import { mix } from "./mix";

const args = process.argv.slice(2);
const flag = (f: string) => args.includes(f);
const cfgPath = args.find((a) => a.startsWith("--config="))?.slice(9) ?? "trailer/trailer.config.ts";
const cfg: TrailerConfig = (await import(p(cfgPath))).default;
const OUT = p("public/media"); // web encodes (≤ 25 MiB each: Cloudflare Workers' asset limit)
const MASTER = p("assets-src/trailer/out"); // full-quality 1080p masters, not deployed
const t0 = Date.now();

const shots = layout(cfg);
const total = shots[shots.length - 1].end;
log(`${cfg.title}: ${shots.length} shots, ${total.toFixed(1)}s`);

const man = await generate(cfg);
if (flag("--gen-only")) process.exit(0);

const fmts: Format[] = flag("--landscape-only") ? [FORMATS.landscape] : [FORMATS.landscape, FORMATS.vertical];
await renderCards(shots, fmts);
const vframe = fmts.includes(FORMATS.vertical) ? await renderVframe() : undefined;

const audio = mix(cfg, shots, man);
ensureDir(BUILD);
for (const fmt of fmts) {
  const video = assemble(cfg, shots, fmt, man, vframe);
  const name = fmt.name === "landscape" ? "trailer.mp4" : "trailer-vertical.mp4";
  ensureDir(MASTER);
  mux(video, audio, join(MASTER, name));
  webEncode(join(MASTER, name), join(OUT, name), fmt.name === "landscape" ? "1280:-2" : "720:-2");
  log(`✓ ${name}: master in assets-src/trailer/out, web copy in public/media (${duration(join(OUT, name)).toFixed(1)}s)`);
}

// poster: a frame of the title card
const posterShot = shots.find((s) => s.id === cfg.poster.shot)!;
ffmpeg(["-ss", (posterShot.start + cfg.poster.at).toFixed(3), "-i", join(MASTER, "trailer.mp4"), "-frames:v", "1", "-q:v", "2", join(OUT, "trailer-poster.jpg")]);
log("✓ public/media/trailer-poster.jpg");

// teaser: shot ranges cut straight out of the finished trailer (same mix), with tiny audio fades at the joins
if (!flag("--no-teaser")) {
  const parts = cfg.teaser.map((r) => {
    const a = shots.find((s) => s.id === r.from), b = shots.find((s) => s.id === r.to);
    if (!a || !b) throw new Error(`teaser: unknown shot ${r.from}/${r.to}`);
    return [a.start, b.end] as const;
  });
  const vf = parts.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(b - a - 0.06).toFixed(3)}:d=0.06[a${i}]`);
  const cat = parts.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${parts.length}:v=1:a=1[v][a]`;
  const out = join(OUT, "trailer-teaser.mp4");
  ffmpeg(["-i", join(MASTER, "trailer.mp4"), "-filter_complex", vf.join(";") + ";" + cat, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  log(`✓ ${out.replace(p(""), "")} (${duration(out).toFixed(1)}s)`);
}
// --prune: delete cached card frames and segments that the current edit no longer uses (model assets are kept: they cost money)
if (flag("--prune")) {
  const keep = new Set<string>();
  for (const fmt of fmts) for (const s of shots) {
    if (s.card) keep.add(cardDir(s, fmt));
    keep.add(renderSegment(s, fmt, man, vframe));
  }
  if (vframe) keep.add(vframe);
  let n = 0;
  for (const d of ["cards", "segments"]) for (const f of readdirSync(join(CACHE, d))) {
    const path = join(CACHE, d, f);
    if (!keep.has(path)) { rmSync(path, { recursive: true, force: true }); n++; }
  }
  log(`pruned ${n} stale cache entries`);
}
log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

/** 720p-class H.264 for the web: small enough for Workers assets and link-preview players. */
function webEncode(src: string, out: string, scale: string) {
  ffmpeg(["-i", src, "-vf", `scale=${scale}`, "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out]);
}

function mux(video: string, audio: string, out: string) {
  ffmpeg(["-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "9M", "-bufsize", "18M", "-profile:v", "high", "-level", "4.2", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out]);
}

/** Static chrome for the vertical cut (small logo at the top, URL at the bottom), as a transparent PNG. */
async function renderVframe(): Promise<string> {
  const spec = { style: "vframe", text: "superninja.templestein.com", dur: 1 };
  const out = join(CACHE, "cards", `vframe-${hashOf(spec, ["trailer/cards/card.html"])}.png`);
  if (existsSync(out)) return out;
  ensureDir(join(CACHE, "cards"));
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(pathToFileURL(p("trailer/cards/card.html")).href + "#" + encodeURIComponent(JSON.stringify(spec)));
  await page.evaluate(() => (window as any).ready);
  await page.screenshot({ path: out, omitBackground: true });
  await b.close();
  return out;
}
