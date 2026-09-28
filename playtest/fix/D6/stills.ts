// D6 (Story Time) named stills at 844×390, on a frozen build: the teacher's voice (TEACHER_SCRIPT §3.23), fast and
// slow (§9.3), the reminder's petal (SOUND_DISPLAY r42). Plays the story as a child would, waiting for the clip that
// marks each moment (window.__audioLog), and shoots it. Also writes what it heard (heard-<run>.md) and the
// __snState/busy trail, for a quick read.
// Usage: bun playtest/fix/D6/stills.ts [base=http://127.0.0.1:4746] [out=playtest/fix/D6/frames] [--only s1|s5|recap]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { save } from "../../../scripts/treadmill/bot";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const BASE = args[0] ?? "http://127.0.0.1:4746";
const OUT = args[1] ?? "playtest/fix/D6/frames";
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
mkdirSync(OUT, { recursive: true });

type Clip = { t: number; url: string; kind: string };
const clipName = (u: string) => u.replace(/^.*\/a\//, "").replace(/\.mp3.*$/, "");

async function open(page: Page, level: string, s: object) {
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}/play/`);
  await page.evaluate((x) => localStorage.setItem("superninja.save.v1", JSON.stringify(x)), { ...s, settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
  await page.goto(`${BASE}/play/?level=${level}&fast=1`);
  await page.mouse.click(420, 4);
}
const log = (page: Page): Promise<Clip[]> => page.evaluate(() => ((window as any).__audioLog ?? []).filter((a: any) => a.kind === "speech")).catch(() => []);
/** Wait until a clip whose name matches `re` starts (after `after` ms, Date.now()); resolves with its start time. */
async function clip(page: Page, re: RegExp, after = 0, timeout = 60_000): Promise<number> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const c = (await log(page)).find((a) => a.t > after && re.test(clipName(a.url)));
    if (c) return c.t;
    await page.waitForTimeout(40);
  }
  throw new Error(`no clip ${re} within ${timeout} ms`);
}
async function shot(page: Page, name: string, at?: number) {
  if (at) {
    const now = await page.evaluate(() => Date.now());
    if (at > now) await page.waitForTimeout(at - now);
  }
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  ${name}.png`);
}
const tap = (page: Page, sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 2000 });
async function waitFor(page: Page, fn: string, timeout = 60_000) {
  await page.waitForFunction(fn, undefined, { timeout, polling: 60 });
}
async function heard(page: Page, name: string) {
  const c = await log(page);
  const t0 = c[0]?.t ?? 0;
  writeFileSync(`${OUT}/../heard-${name}.md`, c.map((a) => `${((a.t - t0) / 1000).toFixed(1).padStart(6)}  ${clipName(a.url)}`).join("\n") + "\n");
}
/** On a Sensei page: wait for the green arrow, then tap it. */
async function nextPage(page: Page) {
  await waitFor(page, `window.__snNav?.next === "ready"`, 60_000);
  await page.waitForTimeout(300);
  await tap(page, '[data-nav="next"]');
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctxOf = () => b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, deviceScaleFactor: 2 });

// ---- s1 (w1-14), a fresh child: the full form, the first child page, reading together, the first choice, the question
if (!ONLY || ONLY === "s1") {
  console.log("s1 (w1-14), full form");
  const ctx = await ctxOf();
  const page = await ctx.newPage();
  await open(page, "w1-14", save());
  await page.waitForTimeout(650);
  await shot(page, "story-title-open");
  const fr = await clip(page, /^l\/tv_story_frame$/);
  await shot(page, "story-title-glow", fr + 700);
  const ti = await clip(page, /^s\/s1_title$/);
  await shot(page, "story-title-words", ti + 450);
  const bg = await clip(page, /^l\/tv_story_begin$/);
  await shot(page, "story-title-ready", bg + 1500);
  await page.waitForTimeout(800);
  await tap(page, '[data-nav="next"]');
  // page 1 (Sensei reads)
  await page.waitForTimeout(2500);
  await shot(page, "story-narr-reading");
  await nextPage(page);
  // page 2: the child's first page
  const yo = await clip(page, /^l\/tv_story_yours$/);
  await shot(page, "story-first-page-yours", yo + 700);
  const tk = await clip(page, /^l\/tv_story_tick$/, yo);
  await shot(page, "story-first-page-tick", tk + 900);
  // quiet: "Let's read it together." at 8 s, the first word the slow way, then fast (the session's first read-back)
  const tg = await clip(page, /^l\/tv_story_together$/, tk, 30_000);
  const sl = await clip(page, /^p\//, tg, 15_000);
  await shot(page, "story-together-slow", sl + 120);
  const fw = await clip(page, /^w\//, sl, 15_000);
  await shot(page, "story-together-fast", fw + 120);
  // let it finish, then the tick
  await page.waitForTimeout(5000);
  await tap(page, 'button[aria-label="I read it!"]');
  await page.waitForTimeout(1200);
  await shot(page, "story-tick-reply");
  await nextPage(page);
  // page 4: "Tip, tap, tip, tap." (a later page): a word tapped for help, read back with the tortoise and the rabbit
  const yt = await clip(page, /^l\/story_your_turn$/, fw);
  await page.waitForTimeout(1800);
  await tap(page, ".st-word .word-btn");
  const hs = await clip(page, /^p\//, yt, 10_000);
  await shot(page, "story-help-slow", hs + 100);
  const hw = await clip(page, /^w\//, hs, 10_000);
  await shot(page, "story-help-fast", hw + 150);
  await page.waitForTimeout(1500);
  await tap(page, 'button[aria-label="I read it!"]');
  // page 5: the save's first choice: the words wait for "Now you choose what happens."
  const q5 = await clip(page, /^s\/s1_5$/, hw, 60_000);
  await shot(page, "story-choice-wait", q5 + 900);
  const ch = await clip(page, /^l\/tv_story_choice$/, q5);
  await shot(page, "story-choice-live", ch + 1200);
  await page.waitForTimeout(1600);
  await tap(page, 'button.tile[aria-label="mat"]');
  const cs = await clip(page, /^p\//, ch, 15_000);
  await shot(page, "story-choice-readback", cs + 100);
  // page 6 (read, a quiet hand-over: "Your turn to read." was said under 40 s ago) → tick; page 7 (Sensei) → Next
  await waitFor(page, `document.querySelector(".st-go-wrap.ready") !== null`, 30_000);
  await page.waitForTimeout(700);
  await shot(page, "story-quiet-handover");
  await page.waitForTimeout(1500);
  await tap(page, 'button[aria-label="I read it!"]');
  await nextPage(page);
  // the question: the pictures come after "Now a question about the story.", and glow as it is read
  const ql = await clip(page, /^l\/tv_story_q$/, cs, 60_000);
  await shot(page, "story-question-lead", ql + 900);
  const qq = await clip(page, /^s\/s1_q$/, ql);
  await shot(page, "story-question-cards", qq + 700);
  await page.waitForTimeout(1500);
  const st = await page.evaluate(() => (window as any).__snState);
  console.log("  question __snState", JSON.stringify(st));
  await tap(page, 'button.card[aria-label="map"]');
  await page.waitForTimeout(3000);
  await tap(page, 'button.card[aria-label="pot"]');
  await clip(page, /^l\/story_end$/, qq, 20_000);
  await page.waitForTimeout(900);
  await shot(page, "story-end");
  await heard(page, "s1");
  const nav = await page.evaluate(() => (window as any).__snNavLog ?? []);
  writeFileSync(`${OUT}/../navlog-s1.json`, JSON.stringify(nav, null, 1));
  await ctx.close();
}

// ---- s5 (w5-10): a word tapped for help brings "It's two letters, but it's one sound." and the petal above < ck >
if (!ONLY || ONLY === "s5") {
  console.log("s5 (w5-10): the reminder's petal");
  const ctx = await ctxOf();
  const page = await ctx.newPage();
  // a child in a later session who has heard Story Time twice (the short form), and was told < ck > in session 1
  await open(page, "w5-10", save({ sessions: 3, narr: { "game:story": { n: 2, at: [0, 0], s: [1, 2], lastSession: 2, lastAt: Date.now() - 86400000 }, "letters:ck": { n: 1, at: [0], s: [1] }, "games:v1": { n: 1, at: [], s: [1] }, "story:yours": { n: 1, at: [0], s: [1] }, "story:choice": { n: 1, at: [0], s: [1] } } }));
  const bg = await clip(page, /^l\/tv_story_begin$/, 0, 30_000);
  await shot(page, "story-short-ready", bg + 1500);
  await page.waitForTimeout(700);
  await tap(page, '[data-nav="next"]');
  await nextPage(page);
  // page 2: "The chest is on a big black rock." (tap "black")
  await clip(page, /^l\/story_your_turn$/, bg, 30_000);
  await page.waitForTimeout(1500);
  await page.locator(".st-word .word-btn", { hasText: "black" }).first().dispatchEvent("pointerdown");
  const rm = await clip(page, /^l\/t_two_letters$/, bg, 20_000);
  const pk = await clip(page, /^p\/k$/, rm, 10_000);
  // at the sound: its job and cue (__audioLog), the /k/ petal on screen and where, and which letters of "black" are lit
  const probe = () =>
    page.evaluate(() => {
      const a = ((window as any).__audioLog ?? []).filter((x: any) => /\/p\/k\.mp3/.test(x.url)).at(-1);
      const b = [...document.querySelectorAll<HTMLElement>('.sound-badge[data-p="k"]')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0)[0];
      const w = [...document.querySelectorAll<HTMLElement>(".st-word .word-btn")].find((e) => e.textContent?.includes("black"));
      const segs = [...(w?.querySelectorAll<HTMLElement>(":scope > span") ?? [])].map((s) => ({ g: s.firstChild?.textContent, lit: !!s.style.color, bar: !!s.querySelector(".sb.lit") }));
      const ck = segs.find((s) => s.g === "ck");
      const r = w?.querySelectorAll<HTMLElement>(":scope > span")[segs.findIndex((s) => s.g === "ck")]?.getBoundingClientRect();
      return { t: Date.now(), show: a?.show, cued: a?.cued, petal: b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), tipX: Math.round(b.x + b.width / 2) } : null, ck: r ? { x: Math.round(r.x), w: Math.round(r.width), mid: Math.round(r.x + r.width / 2), top: Math.round(r.y) } : null, ckLit: ck?.lit, segs };
    });
  const p1 = await probe();
  await shot(page, "story-reminder-pop", pk + 180);
  const p2 = await probe();
  writeFileSync(`${OUT}/../reminder-s5.json`, JSON.stringify({ atSound: { ...p1, ms: p1.t - pk }, atShot: { ...p2, ms: p2.t - pk } }, null, 1));
  await heard(page, "s5");
  await ctx.close();
}
await b.close();
