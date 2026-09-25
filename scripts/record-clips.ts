// Record gameplay clips for the landing page: headless Chromium at iPhone-landscape size, a bot plays each scene.
// Usage: bun scripts/record-clips.ts [base-url] [clip...]   (default base: http://localhost:5173)
// Output: public/media/clips/<name>.mp4 + <name>.jpg (poster)
import { chromium, type Page } from "playwright";
import { mkdirSync, readdirSync, renameSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:5173";
const only = process.argv.slice(2).filter((a) => !a.startsWith("http"));
const OUT = "public/media/clips";
const TMP = "assets-src/clips-raw";
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// The game's own 16:9 stage fills the frame (no phone letterbox bars), shown inside a phone mockup on the page.
const VIEW = { width: 1280, height: 720 };
const SCALE = 1;

type Save = Record<string, unknown>;
const baseSave = (extra: Save = {}): Save => ({
  v: 1, hero: "kai", seenIntro: true, seenPlacement: true, seenFlower: true, seenTimer: true, captionsV2: true,
  stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
  settings: { relaxed: false, music: 0.3, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra,
});

/** One bot step: tap the right answer in whatever scene is showing (mirrors scripts/bot.js). */
async function botStep(page: Page, opts: { mistakes?: boolean } = {}) {
  const st: any = await page.evaluate(() => (window as any).__snState || {});
  const down = async (sel: string) => {
    const el = page.locator(sel).first();
    if (!(await el.count())) return false;
    await el.dispatchEvent("pointerdown").catch(() => {});
    return true;
  };
  if (["battle", "build", "find", "learn"].includes(st.scene) && st.next) {
    // occasionally make a deliberate mistake so the correction shows up in the clip
    if (opts.mistakes && Math.random() < 0.18) {
      const wrong = await page.locator(".row .tile").evaluateAll((els, n) => els.map((e) => e.getAttribute("aria-label")).find((a) => a && a !== n), st.next);
      if (wrong) return down(`.row .tile[aria-label="${wrong}"]`);
    }
    return (await down(`.row button[aria-label="${st.next}"]`)) || down(`button[aria-label="${st.next}"]`);
  }
  if (st.scene === "swap" && !st.busy) {
    if (st.picked === null || st.picked === undefined) return down(`.slots .tile >> nth=${st.pos}`);
    return down(`.row .tile[aria-label="${st.next}"]`);
  }
  if (st.scene === "sort" && st.next) return down(`button[aria-label="basket ${st.next}"]`);
  if (st.scene === "run") return page.evaluate(() => (window as any).__snRun?.());
  for (const l of ["Next page", "I read it!"]) if (await down(`button[aria-label="${l}"]`)) return true;
  if (await down("button.tile.lg")) return true;
  return down("button.card");
}

interface Clip { name: string; url: string; save?: Save; seconds: number; skip?: number; mistakes?: boolean; script?: (page: Page) => Promise<void> }
const CLIPS: Clip[] = [
  { name: "battle", url: "/play/?level=w1-6", seconds: 16, skip: 3, mistakes: true },
  { name: "run", url: "/play/?level=w1-4", seconds: 16, skip: 4 },
  { name: "dojo", url: "/play/?level=w2-1", seconds: 15, skip: 1 },
  { name: "swap", url: "/play/?level=w1-5", seconds: 14, skip: 5 },
  { name: "story", url: "/play/?level=w1-7", seconds: 14, skip: 4 },
  { name: "boss", url: "/play/?level=w2-8", seconds: 16, skip: 6 },
  {
    name: "map", url: "/play/?scene=map", seconds: 7, skip: 1,
    save: baseSave({ hero: "suki", stars: { "w1-1": 3, "w1-2": 2, "w1-3": 3 }, settings: { relaxed: false, music: 0.3, captions: false, unlockAll: false } }),
  },
  {
    name: "flower", url: "/play/?scene=tree", seconds: 10, skip: 1,
    save: baseSave({ petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h"], gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s"], energy: { "n>n": 8, "o>o": 5, "c>k": 3, "b>b": 6 } }),
    script: async (page) => {
      await page.waitForTimeout(3500);
      await page.locator('[aria-label="petal n"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(5000);
    },
  },
  {
    name: "trial", url: "/play/?scene=tree", seconds: 16, skip: 2,
    save: baseSave({ petals: ["a", "i", "m", "s", "t", "n", "o", "p"], stars: { "w1-1": 3, "w1-2": 3, "w1-3": 3 }, energy: { "m>m": 8 } }),
    script: async (page) => {
      await page.waitForTimeout(1200);
      await page.locator('[aria-label="petal m"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(900);
      await page.locator('[aria-label="gem m ready"]').dispatchEvent("pointerdown");
      await page.waitForTimeout(8000);
      for (let i = 0; i < 30; i++) {
        await botStep(page);
        await page.waitForTimeout(700);
      }
    },
  },
  // --- Trailer footage (trailer/trailer.config.ts). Not used on the landing page; `bun scripts/record-clips.ts tr_boss_baron` etc.
  { name: "tr_boss_panda", url: "/play/?level=w1-8", seconds: 16, skip: 1 },
  { name: "tr_boss_yeti", url: "/play/?level=w3-12", seconds: 16, skip: 1 },
  { name: "tr_boss_serpent", url: "/play/?level=w4-9", seconds: 16, skip: 1 },
  { name: "tr_boss_knight", url: "/play/?level=w5-11", seconds: 16, skip: 1 },
  { name: "tr_boss_baron", url: "/play/?level=w6-11", seconds: 70, skip: 1 },
  { name: "tr_run_mountain", url: "/play/?level=w3-5", seconds: 12, skip: 3 },
  { name: "tr_run_sky", url: "/play/?level=w6-9", seconds: 12, skip: 3 },
  { name: "tr_battle_castle", url: "/play/?level=w5-9", seconds: 14, skip: 3 },
  {
    name: "tr_flower_full", url: "/play/?scene=tree", seconds: 14, skip: 1,
    save: baseSave({
      petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "j", "w", "z", "x", "y", "sh", "ch", "th"],
      gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "o>o", "b>b", "g>g", "h>h", "d>d", "e>e", "f>f"],
      energy: { "c>k": 8, "u>u": 6, "r>r": 7, "l>l": 5, "sh>sh": 4, "k>k": 3, "v>v": 8 },
    }),
    script: async (page) => {
      await page.waitForTimeout(3000);
      await page.locator('[aria-label="petal c"]').dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(4000);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(800);
      await page.locator('[aria-label="petal v"]').dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(4000);
    },
  },
];
// 1080p trailer copies of the landing-page clips (same bot scripts, trailer output dir)
for (const n of ["battle", "run", "dojo", "swap", "story", "boss", "flower", "trial"]) {
  const c = CLIPS.find((x) => x.name === n)!;
  CLIPS.push({ ...c, name: `tr_${n}` });
}

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const clip of CLIPS.filter((c) => !only.length || only.includes(c.name))) {
  const dir = `${TMP}/${clip.name}`;
  rmSync(dir, { recursive: true, force: true });
  // Trailer footage is recorded at 1920×1080: a bigger viewport (the game scales its stage to fit).
  // deviceScaleFactor would not help: Playwright records at CSS-pixel size.
  const view = clip.name.startsWith("tr_") ? { width: 1920, height: 1080 } : VIEW;
  const ctx = await browser.newContext({
    viewport: view, deviceScaleFactor: SCALE, hasTouch: false, isMobile: false,
    recordVideo: { dir, size: { width: view.width * SCALE, height: view.height * SCALE } },
  });
  const page = await ctx.newPage();
  const videoStart = Date.now();
  await page.addInitScript(() => ((window as any).__audioLog = []));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), clip.save ?? baseSave());
  const t0 = Date.now();
  await page.goto(BASE + clip.url);
  await page.mouse.click(2, 2);
  const end = t0 + ((clip.skip ?? 0) + clip.seconds + 2) * 1000;
  if (clip.script) await clip.script(page);
  while (Date.now() < end) {
    await botStep(page, { mistakes: clip.mistakes });
    await page.waitForTimeout(900);
  }
  // collect everything the game played, so the clip gets its real soundtrack
  const log: { t: number; url: string; kind: string }[] = await page.evaluate(() => (window as any).__audioLog ?? []);
  mkdirSync("assets-src/sfx", { recursive: true });
  for (const name of new Set(log.filter((e) => e.kind === "sfx").map((e) => e.url.slice(4)))) {
    const f = `assets-src/sfx/${name}.wav`;
    if (!existsSync(f)) writeFileSync(f, Buffer.from(await page.evaluate((n) => (window as any).__renderSfx(n), name)));
  }
  await ctx.close(); // flushes the video
  const raw = readdirSync(dir).find((f) => f.endsWith(".webm"))!;
  renameSync(`${dir}/${raw}`, `${dir}/raw.webm`);
  const ss = String(clip.skip ?? 0);
  // mix the soundtrack: speech + sfx at their real times, music looped from when it started
  const inputs: string[] = [];
  const chains: string[] = [];
  const total = (clip.skip ?? 0) + clip.seconds + 1;
  log.forEach((e) => {
    const at = Math.max(0, e.t - videoStart);
    if (at / 1000 > total) return;
    const file = e.kind === "sfx" ? `assets-src/sfx/${e.url.slice(4)}.wav` : `public${e.url}`;
    if (!existsSync(file)) return;
    const k = inputs.length / (e.kind === "music" ? 4 : 2);
    if (e.kind === "music") inputs.push("-stream_loop", "-1", "-i", file);
    else inputs.push("-i", file);
    const idx = chains.length + 1;
    const vol = e.kind === "music" ? 0.22 : e.kind === "sfx" ? 0.5 : 1.0;
    chains.push(`[${idx}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${at}|${at},volume=${vol},atrim=0:${total}[a${idx}]`);
    void k;
  });
  const outDir = clip.name.startsWith("tr_") ? "assets-src/trailer/clips" : OUT; // trailer footage stays out of public/
  mkdirSync(outDir, { recursive: true });
  const out = `${outDir}/${clip.name}.mp4`;
  const vargs = ["-vf", `scale=${view.width}:-2,fps=30`, "-c:v", "libx264", "-preset", "slow", "-crf", view.width > 1280 ? "18" : "27", "-pix_fmt", "yuv420p"];
  if (chains.length) {
    const mix = `${chains.join(";")};${chains.map((_, i) => `[a${i + 1}]`).join("")}amix=inputs=${chains.length}:normalize=0:duration=longest,atrim=${ss}:${total},asetpts=PTS-STARTPTS,alimiter=limit=0.9,loudnorm=I=-18:TP=-1.5[aout]`;
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", ss, "-i", `${dir}/raw.webm`, ...inputs, "-filter_complex", mix, "-map", "0:v", "-map", "[aout]", "-t", String(clip.seconds), ...vargs, "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out]);
  } else {
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", ss, "-i", `${dir}/raw.webm`, "-t", String(clip.seconds), "-an", ...vargs, "-movflags", "+faststart", out]);
  }
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(Math.min(3, clip.seconds / 2)), "-i", out, "-frames:v", "1", "-q:v", "4", out.replace(/\.mp4$/, ".jpg")]);
  console.log("✓", clip.name);
}
await browser.close();
