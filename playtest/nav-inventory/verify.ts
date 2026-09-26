// Two targeted checks: (1) the warm-up speaker during a Sensei demo replays a stale question; (2) Home is covered
// by the World Flower intro overlay (a tap there skips a step instead of going home).
import { chromium } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright/index.mjs";
import { save } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/bot";
const BASE = "http://localhost:5173";
const OUT = process.argv[2];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

async function open(url: string, s: any) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("superninja.save.v1", JSON.stringify(s)); sessionStorage.setItem("sn.setup", "done"); }, s);
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}${url}&fast=2`);
  return { ctx, page };
}

// (1) W1: wait for the fastslow demo, then tap Hear it again
{
  const { ctx, page } = await open("/play/?level=w1-wu1", save());
  const t0 = Date.now();
  let tapped = false;
  while (Date.now() - t0 < 60_000) {
    const st: any = await page.evaluate(() => (window as any).__snState ?? {});
    if (st.scene === "warmup" && st.next && !tapped && st.beat === "tap") await page.locator(`.wu [aria-label="${st.next}"]`).first().dispatchEvent("pointerdown").catch(() => {});
    if (st.beat === "fastslow" && st.busy && !tapped) {
      await page.waitForTimeout(600);
      const n0 = await page.evaluate(() => (window as any).__audioLog.length);
      await page.locator('[aria-label="Hear it again"]').first().dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(1500);
      const log = await page.evaluate((n0) => (window as any).__audioLog.slice(n0).map((x: any) => x.url), n0);
      console.log("(1) during the fast/slow demo, Hear it again played:", log);
      await page.screenshot({ path: `${OUT}/stale-speaker.png` });
      tapped = true;
      break;
    }
    await page.waitForTimeout(200);
  }
  await ctx.close();
}

// (2) the World Flower intro: what is under the Home button's centre?
{
  const s = save({ petals: ["a", "s"], seenFlower: false });
  const { ctx, page } = await open("/play/?scene=tree&x=1", s);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const home = [...document.querySelectorAll("button")].find((b) => b.querySelector('path[d^="M10 30 32 11"]'))!;
    const rc = home.getBoundingClientRect();
    const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
    return { home: home.getAttribute("aria-label"), coveredBy: top === home || home.contains(top!) ? null : (top as HTMLElement)?.className };
  });
  console.log("(2) World Flower intro, Home covered by:", r);
  // tap where Home is, and see what happens
  const box = await page.locator('button[aria-label="back"]').first().boundingBox();
  const before = await page.evaluate(() => JSON.stringify((window as any).__snState));
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => JSON.stringify((window as any).__snState));
  console.log("(2) state before tap:", before, "\n    after tap on Home:", after);
  await page.screenshot({ path: `${OUT}/intro-home-tap.png` });
  await ctx.close();
}
await b.close();
