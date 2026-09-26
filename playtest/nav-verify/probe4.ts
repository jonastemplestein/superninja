// Why does Hear it again stay silent on build / battle / swap turns? List the [data-nav="again"] elements and tap each.
import { chromium } from "playwright";
import { save } from "../../scripts/treadmill/bot";
const BASE = "http://localhost:5173", FAST = 4;
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const lv of (process.argv[2] ?? "w1-4,w1-6,w1-8").split(",")) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("superninja.save.v1", JSON.stringify(s)); sessionStorage.setItem("sn.setup", "done"); }, { ...save(), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}/play/?level=${lv}&fast=${FAST}`);
  await page.waitForTimeout(600);
  await page.mouse.click(420, 4);
  for (let k = 0; k < 200; k++) {
    const st: any = await page.evaluate(() => (window as any).__snState);
    const loud = await page.evaluate(() => !!document.querySelector(".help-btn.talking, .bubble"));
    if (st?.next && !st.busy && !loud) break;
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => [...document.querySelectorAll('[data-nav="again"]')].map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { tag: e.tagName, label: e.getAttribute("aria-label"), cls: e.className, disabled: (e as any).disabled ?? null, ariaDis: e.getAttribute("aria-disabled"), vis: s.visibility, op: s.opacity, pe: s.pointerEvents, r: [r.x | 0, r.y | 0, r.width | 0, r.height | 0] }; }));
  const st: any = await page.evaluate(() => ({ st: (window as any).__snState, nav: (window as any).__snNav }));
  console.log(`== ${lv}`, JSON.stringify(st));
  console.log(JSON.stringify(info, null, 0));
  await page.screenshot({ path: `playtest/nav-verify/r1-replay/${lv}-turn.png` });
  for (let i = 0; i < info.length; i++) {
    const n0 = await page.evaluate(() => (window as any).__audioLog.length);
    // a real touch at its centre (what a child does)
    const r = info[i].r;
    if (r[2] > 2) await page.touchscreen.tap(r[0] + r[2] / 2, r[1] + r[3] / 2);
    await page.waitForTimeout(1500);
    const said = await page.evaluate((n) => (window as any).__audioLog.slice(n).map((a: any) => a.url.split("/").slice(-2).join("/")), n0);
    console.log(`  real tap on #${i} (${info[i].label}): ${said.join(" ") || "(silent)"}`);
    const n1 = await page.evaluate(() => (window as any).__audioLog.length);
    await page.locator('[data-nav="again"]').nth(i).dispatchEvent("pointerdown").catch((e) => console.log("dispatch failed", String(e).slice(0, 80)));
    await page.waitForTimeout(1500);
    const said2 = await page.evaluate((n) => (window as any).__audioLog.slice(n).map((a: any) => a.url.split("/").slice(-2).join("/")), n1);
    console.log(`  dispatched pointerdown on #${i}: ${said2.join(" ") || "(silent)"}`);
  }
  await ctx.close();
}
await b.close();
