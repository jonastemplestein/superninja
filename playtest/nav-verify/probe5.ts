// Swap: tap Hear the target word (a real touch) on each of the first turns, after the quiet.
import { chromium } from "playwright";
import { save, step } from "../../scripts/treadmill/bot";
const BASE = "http://localhost:5173", FAST = 4;
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const lv of (process.argv[2] ?? "w1-8").split(",")) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("superninja.save.v1", JSON.stringify(s)); sessionStorage.setItem("sn.setup", "done"); }, { ...save(), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}/play/?level=${lv}&fast=${FAST}`);
  await page.waitForTimeout(600);
  await page.mouse.click(420, 4);
  let last = "", turns = 0;
  const t0 = Date.now();
  while (turns < 6 && Date.now() - t0 < 60000) {
    const st: any = await page.evaluate(() => (window as any).__snState);
    const loud = await page.evaluate(() => !!document.querySelector(".help-btn.talking, .bubble"));
    const key = st?.next && !st.busy ? JSON.stringify([st.step, st.next, st.picked, st.word]) : "";
    if (key && key !== last && !loud) {
      last = key; turns++;
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => { const e = document.querySelector('[data-nav="again"]'); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2, e.getAttribute("aria-label"), (e as any).disabled]; });
      const n0 = await page.evaluate(() => (window as any).__audioLog.length);
      if (r) await page.touchscreen.tap(r[0] as number, r[1] as number);
      await page.waitForTimeout(2500);
      const said = await page.evaluate((n) => (window as any).__audioLog.slice(n).map((a: any) => a.url.split("/").slice(-2).join("/")), n0);
      const st2: any = await page.evaluate(() => (window as any).__snState);
      console.log(`${lv} turn ${key}: again=${JSON.stringify(r)} → ${said.join(" ") || "(silent)"}  | st after: ${JSON.stringify(st2)}`);
      if (!said.length) await page.screenshot({ path: `playtest/nav-verify/r1-replay/${lv}-silent-${turns}.png` });
      continue;
    }
    await step(page).catch(() => {});
    await page.waitForTimeout(200);
  }
  await ctx.close();
}
await b.close();
