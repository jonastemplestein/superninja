// Crisp stills of key moments for the landing page gallery → public/media/shots/<name>.webp
// Usage: bun scripts/screenshots.ts [base-url]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:5173";
const OUT = "public/media/shots";
mkdirSync(OUT, { recursive: true });

const base = (extra: object = {}) => ({
  v: 1, hero: "suki", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenBook: true, captionsV2: true,
  stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [],
  settings: { relaxed: false, music: 0, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra,
});
const bookWords = Object.fromEntries(["cat", "cap", "bat", "bag", "hat", "pig", "bin", "cot", "hop", "hot", "bib", "pin"].map((w) => [w, { n: 1, ok: 1, last: 1 }]));

const SHOTS: { name: string; url: string; save?: object; wait: number; act?: string[] }[] = [
  { name: "title", url: "/play/?scene=title", wait: 2500 },
  { name: "map", url: "/play/?scene=map", wait: 2500, save: base({ stars: { "w1-wu1": 1, "w1-wu2": 1, "w1-wu3": 1, "w1-wu4": 1, "w1-wu5": 1, "w1-wu6": 1, "w1-2": 2, "w1-3": 3 }, settings: { unlockAll: false, music: 0, captions: false, relaxed: false } }) },
  { name: "battle", url: "/play/?level=w2-8", wait: 9000 },
  { name: "flower", url: "/play/?scene=tree", wait: 2500, save: base({ petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v"], gems: ["a>a", "t>t", "p>p", "m>m", "i>i", "s>s", "n>n", "o>o", "b>b", "g>g"], energy: { "c>k": 8, "h>h": 5, "d>d": 3 } }) },
  { name: "petal", url: "/play/?scene=tree", wait: 1500, act: ['[aria-label="petal k"]'], save: base({ petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "k", "l", "r", "u"], gems: ["c>k"], energy: { "k>k": 8 } }) },
  { name: "book", url: "/play/?scene=book", wait: 2000, act: ['[aria-label="previous page"]'], save: base({ words: bookWords }) },
  { name: "story", url: "/play/?level=w2-7", wait: 16000 },
  { name: "training", url: "/play/?scene=training", wait: 3000, save: base({ seenTraining: false }) },
];

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const s of SHOTS) {
  const page = await (await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 })).newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((v) => localStorage.setItem("superninja.save.v1", JSON.stringify(v)), s.save ?? base());
  await page.goto(BASE + s.url);
  await page.mouse.click(2, 2);
  await page.waitForTimeout(s.wait);
  for (const sel of s.act ?? []) {
    await page.locator(sel).first().dispatchEvent("pointerdown");
    await page.waitForTimeout(1200);
  }
  const png = `${OUT}/${s.name}.png`;
  await page.screenshot({ path: png });
  execFileSync("cwebp", ["-quiet", "-q", "82", "-resize", "1600", "0", png, "-o", `${OUT}/${s.name}.webp`]);
  execFileSync("rm", [png]);
  console.log("✓", s.name);
}
await b.close();
