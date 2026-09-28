// Verifier: does every "How it plays" slot play a real video in WebKit iPhone emulation (production)?
import { webkit, devices } from "playwright";
import { writeFileSync } from "node:fs";

const OUT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/landing/verify";
const b = await webkit.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices["iPhone 15"].userAgent });
const p = await ctx.newPage();
const errors: string[] = [];
p.on("pageerror", (e) => errors.push(String(e)));
const failed: string[] = [];
p.on("requestfailed", (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
await p.goto("https://superninja.templestein.com/?modes=" + Date.now(), { waitUntil: "load", timeout: 90000 });
await p.waitForTimeout(1500);
// scroll to the section the way a thumb would
await p.evaluate(() => document.getElementById("play")!.scrollIntoView({ block: "start" }));
await p.waitForTimeout(1500);
await p.evaluate(() => document.querySelector(".modes")!.scrollIntoView({ block: "center" }));
await p.waitForTimeout(2500);
await p.screenshot({ path: `${OUT}/modes-section-390x664-webkit.png` });

const n = await p.locator(".modes .mode").count();
const rows: any[] = [];
for (let i = 0; i < n; i++) {
  await p.evaluate((i) => {
    const m = document.querySelectorAll<HTMLElement>(".modes .mode")[i];
    const modes = document.querySelector<HTMLElement>(".modes")!;
    // horizontal swipe on phones: bring the card to the scroller's centre
    modes.scrollTo({ left: m.offsetLeft - (modes.clientWidth - m.clientWidth) / 2, behavior: "instant" as ScrollBehavior });
    m.scrollIntoView({ block: "center", inline: "center" });
  }, i);
  await p.waitForTimeout(3000);
  const probe = () => p.evaluate((i) => {
    const m = document.querySelectorAll<HTMLElement>(".modes .mode")[i];
    const v = m.querySelector("video")!;
    const r = m.getBoundingClientRect();
    return { title: m.querySelector("h3")!.textContent, tag: v.tagName, src: v.currentSrc || v.getAttribute("src") || "", dataSrc: v.dataset.src, poster: v.poster.split("/").slice(-1)[0], readyState: v.readyState, t: +v.currentTime.toFixed(3), paused: v.paused, vw: v.videoWidth, vh: v.videoHeight, err: v.error?.code ?? null, cardLeft: Math.round(r.left), cardRight: Math.round(r.right), cardTop: Math.round(r.top), img: !!m.querySelector(".screen img") };
  }, i);
  const a = await probe();
  await p.waitForTimeout(1200);
  const c = await probe();
  const ok = a.readyState >= 2 && c.readyState >= 2 && c.t !== a.t && !c.paused && c.vw > 0 && !c.err;
  const shot = `${OUT}/modes-${i + 1}-${(a.title ?? "").toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "")}-webkit.png`;
  await p.screenshot({ path: shot });
  rows.push({ ok, ...c, t0: a.t, t1: c.t, shot });
  console.log(`${ok ? "OK  " : "FAIL"} ${String(a.title).padEnd(28)} ${c.src.replace(/^https:\/\/[^/]+/, "")} readyState ${a.readyState}->${c.readyState} t ${a.t}->${c.t} paused ${c.paused} ${c.vw}x${c.vh} err ${c.err} card ${c.cardLeft}..${c.cardRight} imgInScreen ${c.img}`);
}
// the other two clips on the page (the World Flower and the Gem Trial)
for (const sel of ['video[data-src$="flower.mp4"]', 'video[data-src$="trial.mp4"]']) {
  await p.evaluate((sel) => document.querySelector(sel)!.scrollIntoView({ block: "center" }), sel);
  await p.waitForTimeout(3000);
  const probe = () => p.evaluate((sel) => { const v = document.querySelector<HTMLVideoElement>(sel)!; return { src: v.currentSrc, readyState: v.readyState, t: +v.currentTime.toFixed(3), paused: v.paused, vw: v.videoWidth }; }, sel);
  const a = await probe(); await p.waitForTimeout(1200); const c = await probe();
  const ok = c.readyState >= 2 && c.t !== a.t && !c.paused && c.vw > 0;
  rows.push({ ok, sel, ...c, t0: a.t });
  console.log(`${ok ? "OK  " : "FAIL"} ${sel.padEnd(28)} readyState ${a.readyState}->${c.readyState} t ${a.t}->${c.t} paused ${c.paused} w ${c.vw}`);
}
await p.evaluate(() => document.querySelector('video[data-src$="flower.mp4"]')!.scrollIntoView({ block: "center" }));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/modes-flower-webkit.png` });
console.log("pageerrors:", errors.length ? errors : "none");
console.log("failed requests:", failed.length ? failed : "none");
writeFileSync(`${OUT}/modes.json`, JSON.stringify({ rows, errors, failed }, null, 2));
await b.close();
