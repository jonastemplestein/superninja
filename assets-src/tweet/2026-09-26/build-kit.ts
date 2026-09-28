// Builds the tweet kit next to this file: tweet.txt (the long post), the zip and index.html.
// tweet.md is written by hand. Run: bun assets-src/tweet/2026-09-26/build-kit.ts
// Upload and checks: assets-src/tweet/2026-09-26/upload-kit.sh
import { existsSync, readFileSync, renameSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dir;
const ROOT = join(DIR, "../../..");
const ZIP = "superninja-tweet-2026-09-26.zip";

type Clip = { name: string; caption: string; posts: string; srt?: boolean };
const CLIPS: Clip[] = [
  { name: "battle-streak", posts: "Long post and thread 1/10", caption: "Every sound a child reads right powers up their ninja: a glowing streak, then \"Super ninja streak!\", then a rainbow ninja master, and the monster runs away." },
  { name: "film-baron", posts: "Long post and thread 3/10", srt: true, caption: "The new opening film: Baron Muddle, lip-synced to his own voice, blows the World Flower's petals all over the island." },
  { name: "gem-victory", posts: "Long post and thread 4/10", caption: "Win a gem and it dives into its petal. Collect every spelling and the petal flies home to the World Flower." },
  { name: "petal-scroll", posts: "Thread 8/10", srt: true, caption: "The petal chart is now a ninja scroll: sounds you haven't met yet hide in the mist, and the ones you have show their spellings, the words you've found, and \"different spellings… but it's the same sound!\"" },
];
const THREAD_CLIPS: Record<number, string> = { 1: "battle-streak", 3: "film-baron", 4: "gem-victory", 8: "petal-scroll" };

// Sections of tweet-draft.txt
const draft = readFileSync(join(DIR, "tweet-draft.txt"), "utf8");
const parts = draft.split(/^(LONG_POST.*|THREAD.*|SHORT)$/m);
const section = (p: string) => parts[parts.findIndex((s) => s.startsWith(p)) + 1].trim();
const long = section("LONG_POST");
const thread = section("THREAD").split(/^===$/m).map((s) => s.trim());
const short = section("SHORT");

// X's weighted length: links count 23, most Latin text 1, everything else 2.
function xLength(s: string) {
  const urls = s.match(/\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|org|net|io|ai|dev)(?:\/[^\s)]*)?/gi) ?? [];
  let rest = s;
  for (const u of urls) rest = rest.replace(u, "");
  let n = urls.length * 23;
  for (const ch of rest.normalize("NFC")) {
    const c = ch.codePointAt(0)!;
    n += c <= 4351 || (c >= 8192 && c <= 8205) || (c >= 8208 && c <= 8223) || (c >= 8242 && c <= 8247) ? 1 : 2;
  }
  return n;
}

// 1. tweet.txt
writeFileSync(join(DIR, "tweet.txt"), long + "\n");

// 2. The zip (an old one goes to .trash, never rm)
const zipPath = join(DIR, ZIP);
if (existsSync(zipPath)) {
  const trash = join(ROOT, ".trash");
  mkdirSync(trash, { recursive: true });
  renameSync(zipPath, join(trash, `${ZIP}.${Date.now()}`));
}
const zipFiles = [
  ...CLIPS.flatMap((c) => [`${c.name}.mp4`, `${c.name}.jpg`, ...(c.srt ? [`${c.name}.srt`] : [])]),
  "tweet.md",
  "tweet.txt",
].map((f) => join(DIR, f));
const z = Bun.spawnSync(["zip", "-j", "-X", zipPath, ...zipFiles]);
if (z.exitCode !== 0) throw new Error(z.stderr.toString());

// 3. index.html
const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function probe(file: string) {
  const r = Bun.spawnSync(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", file]);
  const j = JSON.parse(r.stdout.toString());
  return { seconds: Number(j.format.duration), height: j.streams[0].height as number };
}

const copyBlock = (id: string, label: string, text: string, extra = "") => `
      <div class="post">
        <div class="post-bar">
          <span class="post-label">${label}</span>
          <button class="copy" type="button" data-copy="${id}">Copy</button>
        </div>
        <pre class="post-text" id="${id}">${esc(text)}</pre>
        ${extra}
      </div>`;

const clipCards = CLIPS.map((c) => {
  const file = join(DIR, `${c.name}.mp4`);
  const { seconds, height } = probe(file);
  const size = statSync(file).size;
  return `
      <article class="clip">
        <video controls preload="metadata" playsinline poster="${c.name}.jpg" src="${c.name}.mp4"></video>
        <div class="clip-body">
          <h3>${c.name}</h3>
          <p class="clip-caption">${esc(c.caption)}</p>
          <p class="clip-meta">${seconds.toFixed(1)} s · ${height}p · ${mb(size)} · ${esc(c.posts)}</p>
          <div class="clip-links">
            <a class="btn" href="${c.name}.mp4" download>Download</a>
            <a class="link" href="${c.name}.jpg" download>Poster</a>
            ${c.srt ? `<a class="link" href="${c.name}.srt" download>Captions (.srt)</a>` : ""}
          </div>
        </div>
      </article>`;
}).join("");

const threadPosts = thread.map((t, i) => {
  const clip = THREAD_CLIPS[i + 1];
  return copyBlock(`thread-${i + 1}`, `${i + 1}/${thread.length} · ${xLength(t)} characters`, t, clip ? `<p class="attach">Attach: <strong>${clip}</strong></p>` : "");
}).join("");

const zipSize = statSync(zipPath).size;
const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Super Ninja: tweet kit</title>
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
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 32px 16px 64px; }
  h1, h2, h3 { font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif; line-height: 1.2; margin: 0; }
  h1 { font-size: clamp(28px, 5vw, 40px); letter-spacing: -.01em; }
  h2 { font-size: 22px; margin: 40px 0 12px; }
  h3 { font-size: 18px; }
  .eyebrow { color: var(--red); font-weight: 600; font-size: 14px; letter-spacing: .04em; text-transform: uppercase; margin: 0 0 6px; }
  .lead { color: var(--muted); margin: 10px 0 20px; max-width: 60ch; }
  a { color: inherit; }
  .btn, .copy {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: 0; border-radius: 999px; cursor: pointer; text-decoration: none; font: inherit; font-weight: 600;
    background: var(--gold); color: var(--gold-ink);
    padding: 8px 16px; min-height: 40px;
  }
  .btn:hover, .copy:hover { background: var(--gold-hover); }
  .btn:focus-visible, .copy:focus-visible, .link:focus-visible, summary:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
  .btn-big { font-size: 18px; padding: 14px 26px; min-height: 56px; }
  .btn-big small { font-weight: 500; opacity: .75; }
  .copy.done { background: #2e9b57; color: #fff; }
  .link { color: var(--muted); font-size: 15px; text-underline-offset: 3px; padding: 8px 4px; }
  .link:hover { color: var(--ink); }

  .post { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
  .post + .post { margin-top: 12px; }
  .post-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px 10px 16px; border-bottom: 1px solid var(--line); background: var(--surface-2); }
  .post-label { color: var(--muted); font-size: 14px; }
  .post-text { margin: 0; padding: 16px; white-space: pre-wrap; overflow-wrap: anywhere; font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .attach { margin: 0; padding: 0 16px 14px; color: var(--muted); font-size: 14px; }
  .attach strong { color: var(--ink); font-weight: 600; }

  details { margin-top: 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; }
  summary { cursor: pointer; padding: 14px 16px; font-weight: 600; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: "Show"; color: var(--muted); font-weight: 500; font-size: 14px; }
  details[open] summary::after { content: "Hide"; }
  summary .note { color: var(--muted); font-weight: 400; font-size: 14px; }
  .details-body { padding: 0 12px 12px; }
  .details-body .post { box-shadow: none; }

  .clips { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .clip { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); display: flex; flex-direction: column; }
  .clip video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
  .clip-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .clip-caption { margin: 0; }
  .clip-meta { margin: 0; color: var(--muted); font-size: 14px; }
  .clip-links { margin-top: auto; padding-top: 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
  .notes { color: var(--muted); font-size: 15px; margin: 8px 0 0; padding-left: 20px; max-width: 70ch; }
  .notes li + li { margin-top: 6px; }
  footer { margin-top: 40px; color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<main class="wrap">
  <header>
    <p class="eyebrow">26 September 2026</p>
    <h1>Super Ninja: tweet kit</h1>
    <p class="lead">A tweet about the 10 changes since last night, and five gameplay clips cut by hand to go with it. The zip has every clip, its poster, caption files and the text.</p>
    <a class="btn btn-big" href="${ZIP}" download>Download everything (zip) <small>${mb(zipSize)}</small></a>
  </header>

  <section>
    <h2>The post</h2>
    ${copyBlock("long", `Long post · ${xLength(long).toLocaleString("en-GB")} characters, needs X Premium`, long,
      `<p class="attach">Attach: <strong>battle-streak, film-baron, gem-victory</strong>, in that order (add petal-scroll as a 4th if you like).</p>`)}

    <details>
      <summary><span>Thread <span class="note">10 posts, each within 280</span></span></summary>
      <div class="details-body">${threadPosts}
      </div>
    </details>

    <details>
      <summary><span>Short post <span class="note">${xLength(short)} characters</span></span></summary>
      <div class="details-body">
        ${copyBlock("short", `Short · ${xLength(short)} characters`, short, `<p class="attach">Attach: <strong>battle-streak</strong>, and gem-victory if you want two.</p>`)}
      </div>
    </details>
  </section>

  <section>
    <h2>Clips</h2>
    <div class="clips">${clipCards}
    </div>
    <ul class="notes">
      <li>X plays video muted. Film-baron and petal-scroll have no words on screen, so attach their .srt caption file when you upload them.</li>
      <li>"Since last night" means since 25 Sep, 22:59. If this goes out tomorrow, say "in the last 24 hours" instead.</li>
      <li>The link in the post is production, superninja.templestein.com, which has had all of this since 21:48.</li>
    </ul>
  </section>

  <footer>Unlisted page: anyone with the link can open it.</footer>
</main>
<script>
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return ok;
  }
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const text = document.getElementById(button.dataset.copy).textContent;
    const ok = await copyText(text);
    button.textContent = ok ? "Copied" : "Select and copy";
    button.classList.toggle("done", ok);
    if (!ok) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(button.dataset.copy));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    clearTimeout(button._t);
    button._t = setTimeout(() => { button.textContent = "Copy"; button.classList.remove("done"); }, 2000);
  });
</script>
</body>
</html>
`;
writeFileSync(join(DIR, "index.html"), html);
console.log(`tweet.txt, ${ZIP} (${mb(zipSize)}), index.html written`);
console.log(`long ${xLength(long)}, thread ${thread.map(xLength).join(" ")}, short ${xLength(short)}`);
