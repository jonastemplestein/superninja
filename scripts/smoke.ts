// Smoke test: a bot plays one level of every kind (plus training, placement, a Gem Trial) to the end.
// Usage: bun scripts/smoke.ts [base-url]
import { chromium, type Page } from "playwright";
import { save, step } from "./treadmill/bot";
const BASE = process.argv[2] ?? "http://localhost:5173";
const CASES: { name: string; url: string; done: (p: Page) => Promise<boolean>; save?: object; max?: number }[] = [
  ...["w1-wu1", "w1-wu2", "w1-2", "w1-4", "w1-6", "w1-7", "w1-8", "w1-10", "w1-11", "w1-15", "w3-2", "w3-5", "w6-br1", "w6-2"].map((id) => ({ name: id, url: `/play/?level=${id}`, done: (p: Page) => p.locator('button[aria-label="Play again"]').count().then((n) => n > 0) })),
  { name: "training", url: "/play/?scene=training", save: save({ seenTraining: false }), done: (p) => p.evaluate(() => (() => { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); return JSON.parse(localStorage.getItem("superninja.save." + pr.current)!).seenTraining === true; })()) },
  { name: "placement", url: "/play/?scene=placement", save: save({ seenPlacement: false }), done: (p) => p.evaluate(() => (() => { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); return JSON.parse(localStorage.getItem("superninja.save." + pr.current)!).seenPlacement === true; })()) },
];

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let failed = 0;
await Promise.all(
  CASES.map(async (c) => {
    const page = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + "/play/");
    await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), c.save ?? save());
    await page.goto(BASE + c.url);
    await page.mouse.click(2, 2);
    const t0 = Date.now();
    let ok = false;
    while (Date.now() - t0 < (c.max ?? 420_000)) {
      if (await c.done(page)) {
        ok = true;
        break;
      }
      await step(page);
      await page.waitForTimeout(700);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    if (!ok || errors.length) failed++;
    console.log(`${ok && !errors.length ? "✓" : "✗"} ${c.name.padEnd(10)} ${secs}s ${errors.join(" | ")}`);
  }),
);
await b.close();
process.exit(failed ? 1 : 0);
