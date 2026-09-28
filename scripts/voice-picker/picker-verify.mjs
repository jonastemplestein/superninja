// Voice picker check: opens the page in WebKit at phone size (390x844, touch) and Chromium at laptop size (1280x800),
// plays clips (readyState and currentTime must advance), rates one voice and picks one, waits for the Worker to
// store it, and takes screenshots.
//   node scripts/voice-picker/picker-verify.mjs <url> [--no-save]
// Screenshots and a report: playtest/runs/voice-picker/picker/verify/
import { webkit, chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "playtest/runs/voice-picker/picker/verify");
mkdirSync(OUT, { recursive: true });
const url = process.argv[2];
const NO_SAVE = process.argv.includes("--no-save");
if (!url) throw new Error("usage: picker-verify.mjs <url>");
const report = { url, started: new Date().toISOString(), phone: {}, laptop: {} };
const errors = [];

async function playCheck(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  await locator.tap().catch(() => locator.click()); // tap on the touch phone, click on the laptop (exactly one)
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(350);
    samples.push(await page.evaluate(() => { const a = window.__picker.audio; return { rs: a.readyState, t: Math.round(a.currentTime * 1000) / 1000, paused: a.paused, src: a.currentSrc.split("/").slice(-3).join("/") }; }));
  }
  const ts = samples.map((s) => s.t);
  const advancing = ts.some((t, i) => i > 0 && t > ts[i - 1]) && Math.max(...ts) > 0.2;
  const ok = samples.some((s) => s.rs >= 2) && advancing;
  return { label, ok, readyState: Math.max(...samples.map((s) => s.rs)), currentTimes: ts, src: samples.at(-1).src };
}

// ---------- phone: WebKit, touch ----------
{
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("phone pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("phone console: " + m.text()); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".card");
  await page.screenshot({ path: join(OUT, "phone-1-top.png") });
  report.phone.scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  report.phone.status0 = await page.textContent("#statusText");
  await page.locator("#listen summary").tap();
  await page.locator(".pair button").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(OUT, "phone-2-listen.png") });
  const plays = [];
  plays.push(await playCheck(page, page.locator(".pair button").first(), "listen pair: sensei-4 take 1"));
  const card1 = page.locator(".card").nth(0);
  plays.push(await playCheck(page, card1.locator(".chip[data-take='1']").nth(1), "card 1, line 2 take 1"));
  const card2 = page.locator(".card").nth(1);
  const t2 = card2.locator(".chip.take").first();
  plays.push(await playCheck(page, (await t2.count()) ? t2 : card2.locator(".chip").first(), "card 2, an extra take"));
  report.phone.plays = plays;
  await page.screenshot({ path: join(OUT, "phone-3-playing.png") });
  console.error("phone plays", JSON.stringify(plays));
  if (await page.locator("#stopBtn").isVisible()) await page.locator("#stopBtn").tap();
  if (!NO_SAVE) {
    await card1.locator(".star[data-star='4']").tap();
    await card1.locator(".note").fill("Test note from the verification run (to be cleared).");
    await card1.locator(".pick").tap();
    await page.waitForFunction(() => document.querySelector("#status").dataset.s === "saved", null, { timeout: 20000 }).catch(() => {});
    report.phone.status1 = await page.textContent("#statusText");
    report.phone.lastSave = await page.evaluate(() => window.__lastSave || null);
    report.phone.pickedId = await card1.getAttribute("data-id");
  }
  await card1.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(OUT, "phone-4-rated.png") });
  await page.locator("#picksBtn").tap();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, "phone-5-picks-sheet.png") });
  await page.locator("#picksBtn").tap();
  await page.locator("#blind").tap();
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector("#roleIntro").scrollIntoView());
  await page.screenshot({ path: join(OUT, "phone-6-blind.png") });
  await page.locator("#blind").tap();
  await browser.close();
}

// ---------- laptop: Chromium ----------
{
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: scheme });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push("laptop pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("laptop console: " + m.text()); });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(".card");
    await page.waitForTimeout(1200); // let it pull the saved picks
    await page.screenshot({ path: join(OUT, `laptop-${scheme}-1-top.png`) });
    await page.evaluate(() => document.querySelector("#roleIntro").scrollIntoView());
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUT, `laptop-${scheme}-2-cards.png`) });
    if (scheme === "light") {
      report.laptop.syncedPick = await page.evaluate(() => { const s = window.__picker.state(); return s.picks.sensei ? s.picks.sensei.id : null; });
      report.laptop.plays = [await playCheck(page, page.locator(".card").nth(2).locator(".playall"), "card 3, play all")];
      await page.screenshot({ path: join(OUT, `laptop-light-3-playing.png`) });
      if (await page.locator("#stopBtn").isVisible()) await page.locator("#stopBtn").click();
      await page.locator(".tab[data-role='baron']").click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: join(OUT, `laptop-light-4-baron.png`) });
      await page.locator(".tab[data-role='narrator']").click();
      await page.locator("#britOnly").click();
      await page.locator("#sort").selectOption("british");
      await page.waitForTimeout(200);
      report.laptop.narratorAllCount = await page.textContent("#count");
      await page.locator("#britOnly").click();
      await page.locator(".tab[data-role='sensei']").click();
      await page.locator("#sort").selectOption("overall");
    }
    await ctx.close();
  }
  await browser.close();
}

report.errors = errors;
report.ok = errors.length === 0 && report.phone.plays.every((p) => p.ok) && report.laptop.plays.every((p) => p.ok) && report.phone.scrollWidth <= 390;
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
