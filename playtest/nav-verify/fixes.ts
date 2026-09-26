// Verification probe (not part of the game) for the navigation fixes: the opt-in's held confirm keeps its card, Choose's
// idle help, the reward's trophy when nothing is new, and the press-and-hold Skip film.
// Usage: bun playtest/nav-verify/fixes.ts <outdir>
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import { save } from "../../scripts/treadmill/bot";
const out = process.argv[2] ?? "playtest/nav-verify/fixes";
const FAST = 3;
const BASE = "http://localhost:5173";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
async function open(url: string, sv: object) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...sv, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript(() => ((window as any).__audioLog = []));
  await page.goto(`${BASE}${url}&fast=${FAST}`);
  await page.mouse.click(422, 4);
  return page;
}
const tap = async (page: Page, sel: string) => {
  const bx = await page.locator(sel).first().boundingBox();
  if (bx) await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  return !!bx;
};
const lines = (page: Page) => page.evaluate(() => (window as any).__audioLog.filter((e: any) => e.kind === "speech").map((e: any) => e.url.replace(/^.*\//, "")));
const waitFor = async (page: Page, fn: () => boolean, ms = 30_000) => {
  for (const t = Date.now(); Date.now() - t < ms; await page.waitForTimeout(150)) if (await page.evaluate(fn).catch(() => false)) return true;
  return false;
};

// 1. the opt-in's confirm
{
  const page = await open("/play/?scene=optin", save({ seenPlacement: false, seenTraining: false, stars: {} }));
  await waitFor(page, () => !!(window as any).__snState?.asked);
  await tap(page, '.oi [aria-label="teddy"]');
  await waitFor(page, () => (window as any).__snNav?.next === "ready");
  await tap(page, '[data-nav="next"]');
  const held = await waitFor(page, () => (window as any).__snNav?.pres?.id === "optin-confirm");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/1_optin_confirm_hold.png` });
  console.log("opt-in confirm held:", held, "kept card:", await page.locator(".oi-kept").count());
  await page.context().close();
}
// 2. Choose, left alone
{
  const page = await open("/play/?scene=choose", save({ seenIntro: false, hero: null }));
  await page.waitForTimeout(9500 / FAST + 2500 / FAST);
  await page.screenshot({ path: `${out}/2_choose_idle9.png` });
  console.log("choose 9 s: nudge cards", await page.locator(".choose-card.nudge").count(), "said", (await lines(page)).join(" "));
  await page.waitForTimeout(8000 / FAST);
  await page.screenshot({ path: `${out}/3_choose_idle17.png` });
  console.log("choose 17 s: hand", await page.locator(".choose-card svg").count(), "state", JSON.stringify(await page.evaluate(() => (window as any).__snState)));
  await page.context().close();
}
// 3. rewards with nothing new
for (const id of ["w1-14", "w2-1", "w2-3"]) {
  const page = await open(`/play/?scene=reward&id=${id}&stars=3`, save());
  await page.waitForTimeout(9000 / FAST);
  await page.screenshot({ path: `${out}/4_reward_${id}.png` });
  console.log(`reward ${id}: trophy`, await page.locator(".rw-trophy").count());
  await page.context().close();
}
// 4. Skip film: a short tap only shows how; a hold skips
{
  const page = await open("/play/?scene=intro", save({ seenIntro: false, hero: null }));
  await page.waitForTimeout(1500);
  await tap(page, '[aria-label="Skip film"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/5_skip_tap.png` });
  console.log("skip tap: route", await page.evaluate(() => (window as any).__snRoute), "hint", await page.locator(".hold-hint").count());
  const bx = await page.locator('[aria-label="Skip film"]').boundingBox();
  if (bx) {
    await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1300);
    await page.mouse.up();
  }
  await page.waitForTimeout(600);
  console.log("skip hold: route", await page.evaluate(() => (window as any).__snRoute));
  await page.context().close();
}
await b.close();
