// Writes index.html for the 27 Sep clip kit from clips.ts: lengths from ffprobe, sizes from the files and zips/.
//   bun assets-src/clips/2026-09-27/page.ts      (run zips.sh first)
import { spawnSync } from "node:child_process";
import { statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_ZIP, GROUPS, zipOf } from "./clips";

const D = import.meta.dir;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const mb = (f: string) => `${(statSync(f).size / 1e6).toFixed(1)} MB`;
const secs = (f: string) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]);
  return `${Number(r.stdout.toString()).toFixed(1)} s`;
};

const nClips = GROUPS.reduce((n, g) => n + g.clips.length, 0);
const nav = GROUPS.map((g) => `<a class="chip" href="#${g.key}">${esc(g.name)}</a>`).join("\n      ");
const sections = GROUPS.map((g) => {
  const cards = g.clips
    .map((c) => {
      const mp4 = join(D, `${c.file}.mp4`);
      return `      <article class="clip">
        <video controls preload="metadata" playsinline poster="${c.file}.jpg" src="${c.file}.mp4"></video>
        <div class="clip-body">
          <h3>${esc(c.file)} <span class="dur">${secs(mp4)}</span></h3>
          <p class="clip-meta">${esc(c.level)}</p>
          <p class="clip-caption">${esc(c.text)}</p>
          <p class="clip-links"><a class="link" href="${c.file}.mp4" download>Download MP4 · ${mb(mp4)}</a><a class="link" href="${c.file}.jpg" download>Poster</a></p>
        </div>
      </article>`;
    })
    .join("\n");
  const zip = zipOf(g);
  return `  <section id="${g.key}">
    <div class="sec-head">
      <div>
        <h2>${esc(g.name)}</h2>
        <p class="sec-about">${esc(g.about)}</p>
      </div>
      <a class="btn" href="${zip}" download>Download these ${g.clips.length} (zip) <small>${mb(join(D, "zips", zip))}</small></a>
    </div>
    <div class="clips${g.clips.length === 2 ? " two" : ""}">
${cards}
    </div>
  </section>`;
}).join("\n\n");

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Super Ninja: game clips</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fbf5ea;
    --surface: #ffffff;
    --surface-2: #f6eddc;
    --ink: #2b2117;
    --muted: #6d5f4e;
    --line: #e7d9c1;
    --gold: #f3b52a;
    --gold-ink: #3a2a08;
    --gold-hover: #e6a613;
    --red: #c8352b;
    --focus: #2f6fd6;
    --shadow: 0 1px 2px rgba(60, 40, 10, .06), 0 6px 20px rgba(60, 40, 10, .06);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #16120e;
      --surface: #211b15;
      --surface-2: #2a221a;
      --ink: #f4ecdd;
      --muted: #b5a68f;
      --line: #3a2f24;
      --gold: #f3b52a;
      --gold-ink: #2b1e04;
      --gold-hover: #ffc545;
      --red: #ff7a6b;
      --focus: #8bb4ff;
      --shadow: 0 1px 2px rgba(0, 0, 0, .3), 0 6px 20px rgba(0, 0, 0, .25);
    }
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 32px 16px 64px; }
  h1, h2, h3 { font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif; line-height: 1.2; margin: 0; }
  h1 { font-size: clamp(28px, 5vw, 40px); letter-spacing: -.01em; }
  h2 { font-size: 22px; }
  h3 { font-size: 17px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .eyebrow { color: var(--red); font-weight: 600; font-size: 14px; letter-spacing: .04em; text-transform: uppercase; margin: 0 0 6px; }
  .lead { color: var(--muted); margin: 10px 0 20px; max-width: 68ch; }
  a { color: inherit; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex-shrink: 0;
    border-radius: 999px; text-decoration: none; font-weight: 600;
    background: var(--gold); color: var(--gold-ink); padding: 8px 16px; min-height: 40px;
  }
  .btn small { font-weight: 500; opacity: .75; }
  .btn:hover { background: var(--gold-hover); }
  .btn:focus-visible, .link:focus-visible, .chip:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
  .btn-big { font-size: 18px; padding: 14px 26px; min-height: 56px; }
  .nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 8px; }
  .chip { text-decoration: none; font-size: 14px; padding: 6px 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--muted); }
  .chip:hover { color: var(--ink); border-color: var(--muted); }
  section { margin-top: 44px; scroll-margin-top: 16px; }
  .sec-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px 20px; flex-wrap: wrap; margin-bottom: 14px; }
  .sec-about { color: var(--muted); margin: 4px 0 0; max-width: 62ch; }
  .clips { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 16px; }
  .clips.two { grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr)); }
  .clip { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); display: flex; flex-direction: column; min-width: 0; }
  .clip video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
  .clip-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .dur { color: var(--muted); font-weight: 500; font-size: 14px; font-family: system-ui, -apple-system, sans-serif; font-variant-numeric: tabular-nums; }
  .clip-meta { margin: 0; color: var(--muted); font-size: 14px; }
  .clip-caption { margin: 0; font-size: 15px; }
  .clip-links { margin: auto 0 0; padding-top: 8px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; }
  .link { color: var(--muted); font-size: 14px; text-underline-offset: 3px; padding: 6px 0; }
  .link:hover { color: var(--ink); }
  footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--line); color: var(--muted); font-size: 14px; }
  footer p { margin: 0 0 8px; max-width: 80ch; }
</style>
</head>
<body>
<main class="wrap">
  <header>
    <p class="eyebrow">27 September 2026</p>
    <h1>Super Ninja: game clips</h1>
    <p class="lead">Normal gameplay from every kind of level, three clips each so you can choose, plus the enemy supercut. All filmed on the live game at real speed, with captions on as the game shows them.</p>
    <a class="btn btn-big" href="${ALL_ZIP}" download>Download all (zip) <small>${nClips} clips · ${mb(join(D, "zips", ALL_ZIP))}</small></a>
    <nav class="nav" aria-label="Level types">
      ${nav}
    </nav>
  </header>

${sections}

  <footer>
    <p>Every clip: MP4 (H.264, 30 fps, AAC 48 kHz, −16 LUFS) with a JPG poster. 1080p unless marked 720p. The zips hold each clip and its poster.</p>
    <p>Sections run in the order a child meets each kind of level. Hero, land and words vary between the three clips of a type where the game allows it.</p>
  </footer>
</main>
</body>
</html>
`;
writeFileSync(join(D, "index.html"), html);
console.log(`index.html: ${GROUPS.length} sections, ${nClips} clips`);
