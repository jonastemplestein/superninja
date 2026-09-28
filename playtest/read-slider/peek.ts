// A quick look at the harness: screenshots at 844×390 every `every` ms after the start tap, with __snState.
//   bun playtest/read-slider/peek.ts <case> <seconds> [every] [--port 4971]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [cse = "compound", secs = "8", every = "1000"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const port = Number(process.argv.includes("--port") ? process.argv[process.argv.indexOf("--port") + 1] : 4971);
const out = `playtest/read-slider/shots/peek-${cse}`;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
page.on("response", (r) => r.status() >= 400 && console.log("HTTP", r.status(), r.url()));
await page.goto(`http://127.0.0.1:${port}/?case=${cse}&debug=1`);
await page.waitForSelector("[data-start]");
const r = (await page.locator("[data-start]").boundingBox())!;
await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
for (let k = 0; k < (Number(secs) * 1000) / Number(every); k++) {
  await page.waitForTimeout(Number(every));
  await page.screenshot({ path: `${out}/${String(k).padStart(2, "0")}.png` });
  const st = await page.evaluate(() => ({ st: (window as any).__snState, log: (window as any).__rsLog?.slice(-2) }));
  console.log(k, JSON.stringify(st.st && { phase: st.st.phase, next: st.st.next, fired: st.st.fired, busy: st.st.busy, from: st.st.from }), JSON.stringify(st.log));
}
await b.close();
