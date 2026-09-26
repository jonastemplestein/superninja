// Verification probe (not part of the game): play a level until the one-off gem explanation holds, then check the hold:
// it waits on Next, Hear it again says audit_gem_first again, the gem stays up; screenshots at each point.
// Usage: bun playtest/nav-verify/gemhold.ts <level> <outdir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { save, step } from "../../scripts/treadmill/bot";
const [lv = "w1-4", out = "playtest/nav-verify/gemhold"] = process.argv.slice(2);
const FAST = 3;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:5173/play/");
await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...save(), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
await page.addInitScript(() => ((window as any).__audioLog = []));
await page.goto(`http://localhost:5173/play/?level=${lv}&fast=${FAST}`);
await page.mouse.click(422, 4);
const t0 = Date.now();
let found = false;
while (Date.now() - t0 < 120_000) {
  const nav: any = await page.evaluate(() => (window as any).__snNav ?? null).catch(() => null);
  if (nav?.pres?.id === "gem-energy") { found = true; break; }
  if (await page.locator('button[aria-label="Play again"]').count()) break;
  await step(page).catch(() => {});
  await page.waitForTimeout(300);
}
console.log(lv, "gem hold found:", found, "after", Math.round((Date.now() - t0) / 1000), "s");
if (found) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${lv}_1_hold.png` });
  // idle 10 s game: nothing moves on, Next glows with the hand
  await page.waitForTimeout(10_000 / FAST);
  const nav1: any = await page.evaluate(() => (window as any).__snNav);
  await page.screenshot({ path: `${out}/${lv}_2_idle10.png` });
  console.log("after 10 s idle:", JSON.stringify(nav1?.pres), nav1?.next, "gem shown:", await page.locator(".pop-in [class*=gem], .pop-in svg").count());
  // Hear it again
  const n0 = await page.evaluate(() => (window as any).__audioLog.length);
  const again = page.locator('.nav-layer [data-nav="again"]').first();
  const box = await again.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1200 / FAST);
  await page.screenshot({ path: `${out}/${lv}_3_replay.png` });
  await page.waitForTimeout(6000 / FAST);
  const said = await page.evaluate((n) => (window as any).__audioLog.slice(n).filter((e: any) => e.kind === "speech").map((e: any) => e.url), n0);
  console.log("Hear it again said:", said.join(", "));
  const nav2: any = await page.evaluate(() => (window as any).__snNav);
  console.log("still held:", JSON.stringify(nav2?.pres), nav2?.next, "sound:", nav2?.sound);
  // Next
  const nx = await page.locator('[data-nav="next"]').first().boundingBox();
  if (nx) await page.mouse.click(nx.x + nx.width / 2, nx.y + nx.height / 2);
  await page.waitForTimeout(2500 / FAST);
  const nav3: any = await page.evaluate(() => (window as any).__snNav);
  await page.screenshot({ path: `${out}/${lv}_4_after_next.png` });
  console.log("after Next:", JSON.stringify(nav3?.pres), nav3?.next, "state:", JSON.stringify(await page.evaluate(() => (window as any).__snState)));
}
await b.close();
