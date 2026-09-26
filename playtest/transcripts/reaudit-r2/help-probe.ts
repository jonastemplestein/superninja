// Re-audit round 2 probe (not part of the game): press Help 1, 2 and 3 times while a child is spelling a word in a
// Dojo build (w2-1), an ordinary battle (w1-6) and the early build (w1-4), and run a first Gem Trial with the timer
// intro unseen, recording everything said. Checks NARRATIVE_AUDIT F27/F29 (never segment the word) and F16.
import { chromium, type Page } from "playwright";
import { writeFileSync } from "node:fs";
import { LINES } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/lines.ts";
import { save, step } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/bot.ts";
const BASE = "http://localhost:5173";
const FAST = 4;
const LINE = new Map(LINES.map((l) => [l.id, l]));
const dec = (u: string) => {
  let m;
  if ((m = u.match(/\/a\/l\/([^/]+)\.mp3/))) return `SENSEI: ${LINE.get(m[1])?.text ?? m[1]}  <${m[1]}>`;
  if ((m = u.match(/\/a\/p\/([^/]+)\.mp3/))) return `  sound /${m[1]}/`;
  if ((m = u.match(/\/a\/w\/([^/]+)\.mp3/))) return `  word "${m[1]}"`;
  if ((m = u.match(/\/a\/x\/([^/]+)\.mp3/))) return `  stretched "${m[1]}"`;
  if ((m = u.match(/\/a\/o\/([^/]+)\.mp3/))) return `  held "${m[1]}"`;
  return null;
};
const out: string[] = [];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
async function run(name: string, url: string, sv: any, scenes: string[], helps: boolean) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  await page.addInitScript(() => ((window as any).__audioLog = []));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("superninja.save.v1", JSON.stringify(s)); }, { ...sv, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.goto(`${BASE}${url}&fast=${FAST}`);
  await page.mouse.click(420, 4);
  const t0 = Date.now();
  const marks: { t: number; text: string }[] = [];
  let pressed = 0;
  let lastWord = "";
  while (Date.now() - t0 < 60_000) {
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    const word = st.word ?? st.next ?? "";
    if (helps && scenes.includes(st.scene) && st.next && pressed < 3 && !st.busy && !st.locked) {
      // wait for Sensei to stop, then press Help
      const talking = await page.locator(".help-btn.talking").count();
      if (!talking) {
        await page.waitForTimeout(400);
        marks.push({ t: Date.now(), text: `>>> HELP press ${pressed + 1} (scene ${st.scene}, word ${st.word ?? "?"}, slot needs ${st.next})` });
        await page.locator('[aria-label="Help"]').first().dispatchEvent("pointerdown").catch(() => {});
        pressed++;
        await page.waitForTimeout(2500);
        continue;
      }
      await page.waitForTimeout(150);
      continue;
    }
    if (helps && pressed >= 3) { await page.waitForTimeout(2500); break; }
    await step(page).catch(() => {});
    await page.waitForTimeout(300);
  }
  const audio = await page.evaluate(() => (window as any).__audioLog ?? []);
  const evs = [
    ...audio.map((a: any) => ({ t: a.t, text: dec(a.url) })).filter((e: any) => e.text),
    ...marks,
  ].sort((a, c) => a.t - c.t);
  out.push(`## ${name}`, "", ...evs.map((e) => `${(((e.t - t0) * FAST) / 1000).toFixed(1).padStart(6)}s ${e.text}`), "");
  await ctx.close();
}
const FLOWER = { petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"], gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"], energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 }, words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } } };
if (process.argv[2] === "trial") {
  await run("First Gem Trial ai>ae (timer unseen)", "/play/?trial=ai>ae", save({ ...FLOWER, seenTimer: false }), [], false);
  writeFileSync("/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/transcripts/reaudit-r2/trial-probe.md", out.join("\n"));
} else {
await run("Dojo build w2-1: Help x3", "/play/?level=w2-1", save(), ["build"], true);
await run("Battle w1-6: Help x3", "/play/?level=w1-6", save(), ["battle"], true);
await run("Early build w1-4: Help x3", "/play/?level=w1-4", save(), ["build"], true);
writeFileSync("/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/transcripts/reaudit-r2/help-probe.md", out.join("\n"));
}
await b.close();
console.log("done");
