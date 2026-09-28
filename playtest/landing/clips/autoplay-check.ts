// Do the landing page's gameplay clips play on a phone? Playwright WebKit (iPhone 15) and Chromium (Pixel 7).
// Usage: bun playtest/landing/clips/autoplay-check.ts <base-url> <out-dir> [webkit|chromium ...]
//
// Neither engine here applies iOS Safari's media rules, so the "ios" runs add them in the page (an init script),
// as WebKit's HTMLMediaElement.cpp / MediaElementSession.cpp have them: a video with sound that is unmuted outside a
// tap is paused (setMutedInternal → updateShouldPlay → pauseInternal), and play() on an unmuted one outside a tap is
// refused (RequireUserGestureForAudioRateChange), until that element has been played or unmuted inside a tap. A touch
// only counts as a tap on touchend/click (not pointerdown).
//
// Scenarios: "muted" (no taps: plain muted autoplay), "button" (scroll to How it plays, tap the Sound button, swipe
// through the cards: Jonas's case), "hero-tap" (tap the hero first, wait, then scroll and swipe). "ios-strict" also
// assumes a muted/unmuted flip inside a tap does NOT unlock a clip (only playing it inside the tap does), to test the
// page's fallback (the clip goes on muted rather than freezing).
import { webkit, chromium, devices, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const [base = "http://localhost:5392", out = "playtest/landing/clips/autoplay", ...engines] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

function iosPolicy(strict: boolean) {
  const w = window as any;
  let gesture = false;
  const on = () => {
    gesture = true;
    setTimeout(() => (gesture = false), 0);
  };
  for (const t of ["touchend", "click", "keydown", "mousedown"]) addEventListener(t, on, true);
  const P = HTMLMediaElement.prototype as any;
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")!;
  const play = P.play, pause = P.pause;
  const name = (el: any) => String(el.currentSrc || el.getAttribute("data-src") || el.src || "audio").split("/").pop();
  w.__ios = { pausedOnUnmute: [] as string[], refused: [] as string[] };
  Object.defineProperty(HTMLMediaElement.prototype, "muted", {
    configurable: true,
    get() {
      return d.get!.call(this);
    },
    set(m: boolean) {
      const was = d.get!.call(this);
      d.set!.call(this, m);
      if (was === m) return;
      if (gesture) return void (strict || (this.__unlocked = true));
      if (!m && !this.__unlocked && !this.paused) {
        pause.call(this);
        w.__ios.pausedOnUnmute.push(name(this));
      }
    },
  });
  P.play = function (this: any) {
    if (gesture) this.__unlocked = true;
    else if (!this.muted && !this.__unlocked) {
      w.__ios.refused.push(name(this));
      return Promise.reject(new DOMException("user gesture required (emulated iOS policy)", "NotAllowedError"));
    }
    return play.call(this);
  };
}

type Clip = { name: string; t: number; paused: boolean; muted: boolean; rs: number };
const clips = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLVideoElement>(".modes video, .flower-media video")].map((v) => ({
      name: (v.dataset.src || "").split("/").pop()!.replace(".mp4", ""), t: v.currentTime, paused: v.paused, muted: v.muted, rs: v.readyState,
    })),
  ) as Promise<Clip[]>;
/** Is `name` playing? Two samples 1.2 s apart while it is on screen. */
async function check(page: Page, name: string) {
  const a = (await clips(page)).find((c) => c.name === name)!;
  await page.waitForTimeout(1200);
  const b = (await clips(page)).find((c) => c.name === name)!;
  const moved = b.t - a.t;
  return { name, playing: !b.paused && moved > 0.5, advanced: +moved.toFixed(2), paused: b.paused, muted: b.muted, readyState: b.rs };
}
const showCard = (page: Page, i: number) =>
  page.evaluate((i) => {
    const m = document.querySelector<HTMLElement>(".modes")!;
    const card = m.children[i] as HTMLElement;
    m.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(m).paddingLeft), behavior: "smooth" });
  }, i);
const tapEl = async (page: Page, sel: string) => {
  const r = (await page.locator(sel).first().boundingBox())!;
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
};

const results: any[] = [];
const within = (p: Promise<unknown>, ms: number) => Promise.race([p.catch(() => {}), new Promise((r) => setTimeout(r, ms))]);
for (const engine of engines.length ? engines : ["webkit", "chromium"]) {
  // (one browser per engine: under bun a second launch in the same process can hang)
  const browser = await (engine === "webkit" ? webkit : chromium).launch();
  for (const scenario of ["muted", "button", "hero-tap"] as const) {
    for (const policy of scenario === "muted" ? [""] : ["ios", "ios-strict"]) {
      const ctx = await browser.newContext({ ...(engine === "webkit" ? devices["iPhone 15"] : devices["Pixel 7"]) });
      if (policy) await ctx.addInitScript(iosPolicy, policy === "ios-strict");
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(base + "/", { waitUntil: "load" });
      await page.waitForTimeout(800);
      if (scenario === "hero-tap") {
        await tapEl(page, ".hero h1");
        await page.waitForTimeout(5500); // (transient activation is over)
      }
      await page.evaluate(() => document.querySelector("#play .modes")!.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(2500);
      if (scenario === "button") {
        await tapEl(page, "#sound");
        await page.waitForTimeout(5500);
      }
      const seen: any[] = [];
      const cards = ["battle", "run", "dojo", "swap", "story", "boss"];
      for (let i = 0; i < cards.length; i++) {
        if (i) {
          await showCard(page, i);
          await page.waitForTimeout(1800);
        }
        seen.push(await check(page, cards[i]));
        await page.locator(".modes").screenshot({ path: `${out}/${engine}-${scenario}-${i}-${cards[i]}.png` }).catch(() => {});
      }
      await page.evaluate(() => document.querySelector(".flower-media")!.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(2500);
      seen.push(await check(page, "flower"), await check(page, "trial"));
      const ios = policy ? await page.evaluate(() => (window as any).__ios) : null;
      const sound = await page.evaluate(() => document.querySelector("#sound")?.getAttribute("aria-pressed"));
      results.push({ engine, scenario, policy: policy || "none", soundOn: sound, clips: seen, ios, errors });
      const line = seen.map((c) => `${c.name}:${c.playing ? (c.muted ? "plays(muted)" : "plays(SOUND)") : "FROZEN"}`).join(" ");
      console.log(`${engine.padEnd(8)} ${scenario.padEnd(8)} policy=${(policy || "none").padEnd(10)} sound=${sound}  ${line}${ios ? `  pausedOnUnmute=${ios.pausedOnUnmute.join(",") || "-"} refused=${[...new Set(ios.refused)].join(",") || "-"}` : ""}${errors.length ? `  ERR ${errors.join(" | ")}` : ""}`);
      await within(ctx.close(), 10_000);
    }
  }
  await within(browser.close(), 10_000);
}
writeFileSync(`${out}/results.json`, JSON.stringify({ base, at: new Date().toISOString(), results }, null, 1));
process.exit(0);
