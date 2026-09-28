// The demo inventory's camera (docs/demo-choreography/inventory.md): plays one game type's first-time demo on a build
// (production by default) at 844×390 with touch, at real speed, and logs everything that happens on the page's own
// clock (Date.now()):
//   · every clip the game plays (window.__audioLog, the game's recording hook) and every hush() that cut one short;
//   · the paw (<TapHint/>: the pointing hand) appearing and leaving, with where it is and what is under it;
//   · every call on the ninja controller (window.__ninja: strike, act, carry, knock, pose, celebrate, say) and every
//     sprite pose it shows (the .ninja-spot's data-pose);
//   · card, tile and button state classes (right, glow, found, struck, lit, flash, pulse, wrong, dim, hint...);
//   · the caption bubble, Sensei talking (.help-btn.talking), __snState and __snNav changes, and every tap.
// The screen is filmed with a CDP screencast (JPEG), rebuilt to a constant 30 fps video from the frames' own
// timestamps, so a frame at time t shows what was on screen at t.
//
// A child is simulated: it watches while Sensei talks, and answers a turn (scripts/treadmill/bot.ts step()) once
// Sensei has been quiet for `pause` ms, like a child who listens to the whole question first.
//
//   bun playtest/demo/inventory/record.ts <case> [--base https://superninja.templestein.com] [--out playtest/demo/inventory/runs]
//
// House rules: nothing is deleted (an old run is moved to .trash/demo-inventory/); one browser per process.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { step as botStep, save as botSave } from "../../../scripts/treadmill/bot";
import { CASES } from "./cases";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const NAME = process.argv[2];
const BASE = arg("base", "https://superninja.templestein.com")!;
const ROOT = resolve(import.meta.dir, "../../..");
const OUT = resolve(arg("out", join(ROOT, "playtest/demo/inventory/runs"))!);
const W = 844, H = 390, DSF = 2, FPS = 30;

const c = CASES.find((x) => x.name === NAME);
if (!c) {
  console.error(`no case "${NAME}"; cases: ${CASES.map((x) => x.name).join(", ")}`);
  process.exit(1);
}
const dir = join(OUT, c.name);
if (existsSync(dir)) {
  const trash = join(ROOT, ".trash", "demo-inventory");
  mkdirSync(trash, { recursive: true });
  renameSync(dir, join(trash, `${new Date().toISOString().replace(/[:.]/g, "-")}-${c.name}`));
}
mkdirSync(dir, { recursive: true });

const save = botSave({ ...c.save, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });

/** Runs in the page before the game: the probes (see the header). */
function probe({ save }: { save: unknown }) {
  const w = window as any;
  const T = () => Date.now();
  const ev: any[] = [];
  w.__inv = ev;
  const push = (e: any) => Array.prototype.push.call(ev, { t: T(), ...e });
  // the game's audio log, with which buffer source each clip was, so a later stop() (hush) can end it
  const log: any[] = [];
  let lastSrc: any = null;
  let sid = 0;
  log.push = function (...items: any[]) {
    for (const e of items) if (e && lastSrc && e.kind === "speech" && Date.now() - lastSrc.t < 50) e.sid = lastSrc.id;
    return Array.prototype.push.apply(this, items);
  };
  w.__audioLog = log;
  const AB = w.AudioBufferSourceNode?.prototype;
  if (AB) {
    const start = AB.start, stop = AB.stop;
    AB.start = function (...a: any[]) {
      this.__sid = ++sid;
      lastSrc = { id: this.__sid, t: Date.now() };
      return start.apply(this, a);
    };
    AB.stop = function (...a: any[]) {
      if (this.__sid && !this.__stopped) {
        this.__stopped = true;
        Array.prototype.push.call(log, { t: Date.now(), kind: "stop", url: "", sid: this.__sid });
      }
      return stop.apply(this, a);
    };
  }
  try {
    localStorage.clear();
    localStorage.setItem("superninja.save.v1", JSON.stringify(save));
  } catch {}

  const label = (el: Element | null | undefined): string => {
    if (!el) return "";
    const a = el.closest?.("[aria-label]");
    if (a) return a.getAttribute("aria-label") ?? "";
    const d = el.closest?.("[data-w]");
    if (d) return `w:${d.getAttribute("data-w")}`;
    return (el as HTMLElement).className?.toString().slice(0, 40) ?? el.tagName;
  };
  const rectOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
  };
  const what = (x: any): any => {
    if (!x) return null;
    if (x instanceof Element) return { el: label(x), rect: rectOf(x) };
    if (typeof x === "object" && "x" in x && "y" in x) return { x: Math.round(x.x), y: Math.round(x.y) };
    return x;
  };

  // the ninja controller: every call, with its move and target
  let nj: any;
  Object.defineProperty(w, "__ninja", {
    configurable: true,
    get: () => nj,
    set: (v) => {
      nj = v;
      for (const k of ["strike", "act", "carry", "knock", "celebrate", "pose", "say", "streakLine"]) {
        const f = v?.[k];
        if (typeof f !== "function") continue;
        v[k] = function (...a: any[]) {
          const args =
            k === "strike" ? { target: what(a[0]), move: a[1]?.move ?? null, soft: !!a[1]?.soft }
            : k === "act" ? { move: a[0], target: what(a[1]), soft: !!a[2]?.soft }
            : k === "carry" ? { from: what(a[0]), to: what(a[1]) }
            : k === "knock" ? { target: what(a[0]) }
            : k === "pose" ? { pose: a[0], now: !!a[1]?.now }
            : {};
          push({ k: "ninja", m: k, ...args });
          return f.apply(this, a);
        };
      }
    },
  });

  // the paw (TapHint: animation taphint), poses, state classes, the caption, Sensei talking
  const INTEREST = new Set(["right", "wrong", "glow", "found", "struck", "lit", "flash", "pulse", "hint", "spot", "dim", "hop", "stretch", "zip", "joy", "aside", "dj-front", "used", "talking", "live", "ready", "on", "out", "moving", "wait", "bump", "nod", "spotlit", "shake"]);
  const pawOf = (n: Node): HTMLElement | null => {
    if (!(n instanceof HTMLElement)) return null;
    if (n.style?.animation?.includes("taphint")) return n;
    const inner = n.querySelector?.('[style*="taphint"]') as HTMLElement | null;
    return inner;
  };
  const paws = new Map<HTMLElement, number>();
  let pid = 0;
  let lastCap = "";
  const capCheck = () => {
    const b = document.querySelector(".bubble");
    const t = b?.textContent?.trim() ?? "";
    if (t !== lastCap) {
      lastCap = t;
      push({ k: "caption", text: t });
    }
  };
  const mo = new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "childList") {
        m.addedNodes.forEach((n) => {
          const p = pawOf(n);
          if (p && !paws.has(p)) {
            paws.set(p, ++pid);
            const r = p.getBoundingClientRect();
            // what is under the fingertip (the TapHint's fingertip is near its top-left third)
            const fx = r.left + r.width * 0.45, fy = r.top + r.height * 0.15;
            const under = document.elementsFromPoint(fx, fy).find((e) => e !== p && !p.contains(e) && e.closest("[aria-label]"));
            push({ k: "paw", on: true, id: pid, rect: rectOf(p), over: label(under ?? p.parentElement) });
          }
        });
        m.removedNodes.forEach((n) => {
          for (const [p, id] of paws) if (n === p || (n instanceof Element && n.contains(p))) {
            paws.delete(p);
            push({ k: "paw", on: false, id });
          }
        });
      } else if (m.type === "attributes") {
        const el = m.target as HTMLElement;
        if (m.attributeName === "data-pose" && el.classList.contains("ninja-spot")) {
          push({ k: "pose", pose: el.dataset.pose ?? "" });
        } else if (m.attributeName === "class") {
          const before = new Set((m.oldValue ?? "").split(/\s+/).filter(Boolean));
          const after = new Set(el.classList);
          const add = [...after].filter((c) => !before.has(c) && INTEREST.has(c));
          const rem = [...before].filter((c) => !after.has(c) && INTEREST.has(c));
          if (add.length || rem.length) {
            const cls = typeof el.className === "string" ? el.className.split(/\s+/)[0] : "";
            push({ k: "cls", el: label(el), cls, add, rem });
          }
        } else if (m.attributeName === "style" && el.style?.animation?.includes("taphint") && paws.has(el)) {
          push({ k: "paw", move: true, id: paws.get(el), rect: rectOf(el) });
        }
      }
    }
    capCheck();
  });
  const startObs = () => mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ["class", "data-pose", "style"], characterData: true });
  if (document.documentElement) startObs();
  else addEventListener("DOMContentLoaded", startObs);

  // taps (the simulated child's pointerdowns)
  addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      push({ k: "tap", el: label(el), rect: el ? rectOf(el) : null });
      if (!document.body) return;
      const r = el?.getBoundingClientRect();
      const x = e.clientX || (r ? r.left + r.width / 2 : 0), y = e.clientY || (r ? r.top + r.height / 2 : 0);
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;pointer-events:none;z-index:2147483646;background:rgba(80,200,255,.35);border:3px solid rgba(80,200,255,.95)`;
      document.body.appendChild(d);
      d.animate([{ transform: "scale(.55)", opacity: 1 }, { transform: "scale(1.35)", opacity: 0 }], { duration: 480 }).onfinish = () => d.remove();
    },
    { capture: true },
  );
  // __snState / __snNav changes
  let ls = "", ln = "";
  setInterval(() => {
    const s = w.__snState;
    const sk = s ? JSON.stringify({ scene: s.scene, beat: s.beat, next: s.next, busy: s.busy, asked: s.asked, locked: s.locked, picked: s.picked, tapIdx: s.tapIdx, page: s.page, phase: typeof s.phase === "string" ? s.phase : undefined }) : "";
    if (sk !== ls) {
      ls = sk;
      push({ k: "state", s: sk ? JSON.parse(sk) : null });
    }
    const n = w.__snNav;
    const nk = n ? JSON.stringify({ next: n.next, pres: n.pres?.id ?? null, step: n.pres?.step ?? null, show: n.show, again: n.again, ready: n.ready ?? null }) : "";
    if (nk !== ln) {
      ln = nk;
      push({ k: "nav", n: nk ? JSON.parse(nk) : null });
    }
  }, 100);
}

// ------------------------------------------------------------------------------------------------ the camera
interface Frame { ts: number; buf: Buffer }
function encoder(file: string) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "pipe:0",
    "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-g", String(FPS), "-an", file], { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  p.stderr.on("data", (d) => (err += d));
  const done = new Promise<void>((ok, bad) => p.on("close", (code) => (code === 0 ? ok() : bad(new Error(`encoder: ${err}`)))));
  return { write: (b: Buffer) => p.stdin.write(b), close: () => (p.stdin.end(), done) };
}
/** Constant 30 fps: slot k (t0 + k/30 s) shows the last frame drawn by then. */
class Cfr {
  slot = 0;
  prev: Frame | null = null;
  slots = 0;
  constructor(public t0: number, private out: (b: Buffer) => void) {}
  push(f: Frame) {
    if (this.prev && f.ts <= this.prev.ts) return;
    if (this.prev) this.fill(f.ts - 8);
    this.prev = f;
  }
  private fill(until: number) {
    while (this.t0 + (this.slot * 1000) / FPS < until) {
      this.out(this.prev!.buf);
      this.slot++;
    }
  }
  end(t: number) {
    if (this.prev) this.fill(t);
  }
}

async function main() {
  const browser = await chromium.launch({
    args: ["--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
  });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DSF, hasTouch: true, isMobile: true });
  await ctx.addInitScript(probe, { save });
  const page = await ctx.newPage();
  const consoleLog: string[] = [];
  page.on("console", (m) => consoleLog.push(`${m.type()}: ${m.text()}`.slice(0, 300)));
  await page.goto("data:text/html,<body style='margin:0;background:#000'></body>");

  const video = join(dir, "raw.mp4");
  const enc = encoder(video);
  const cdp = await ctx.newCDPSession(page);
  let cfr: Cfr | null = null;
  let firstTs = 0;
  const frameTs: number[] = [];
  cdp.on("Page.screencastFrame", (f: any) => {
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    const ts = f.metadata.timestamp ? f.metadata.timestamp * 1000 : Date.now();
    frameTs.push(ts);
    const fr = { ts, buf: Buffer.from(f.data, "base64") };
    if (!cfr) {
      firstTs = ts;
      cfr = new Cfr(ts, (b) => enc.write(b));
    }
    cfr.push(fr);
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: W * DSF, maxHeight: H * DSF, everyNthFrame: 1 });

  const url = BASE + c!.url;
  const loadAt = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  const loaded = Date.now();

  // ---- the child
  const taps: { t: number; what: string }[] = [];
  let answered = 0;
  let quietSince = Date.now();
  let lastSpeechEnd = 0;
  const pause = c!.pause ?? 1500;
  const stopAt = loadAt + c!.seconds * 1000;
  let doneAt = 0;
  while (Date.now() < stopAt) {
    await page.waitForTimeout(120);
    const s: any = await page
      .evaluate(() => {
        const w = window as any;
        const log: any[] = w.__audioLog ?? [];
        let last = 0;
        for (let i = log.length - 1; i >= 0 && i > log.length - 40; i--) if (log[i].kind === "speech") { last = Math.max(last, log[i].t); break; }
        return { st: w.__snState ?? null, nav: w.__snNav ?? null, talking: !!document.querySelector(".help-btn.talking"), cap: !!document.querySelector(".bubble"), lastSpeech: last, now: Date.now() };
      })
      .catch(() => null);
    if (!s) continue;
    const speaking = s.talking || s.cap;
    if (speaking) quietSince = s.now;
    if (s.lastSpeech > lastSpeechEnd) lastSpeechEnd = s.lastSpeech;
    const quiet = s.now - quietSince;
    if (doneAt) {
      if (Date.now() > doneAt) break;
      continue;
    }
    if (c!.watchOnly) continue;
    const st = s.st ?? {};
    const nav = s.nav ?? {};
    // a turn is open: something to answer (or a held Next), nothing busy
    const heldNext = nav.next === "ready";
    const turn = heldNext || (st.next != null && st.next !== "" && st.busy !== true && st.locked !== true) || st.tapIdx != null || (st.scene === "story" && !speaking) || (st.scene === "run" && !st.finished);
    if (!turn) continue;
    const need = heldNext ? c!.nextPause ?? 1200 : pause;
    if (quiet < need) continue;
    const before = await page.evaluate(() => ((window as any).__inv ?? []).length).catch(() => 0);
    await botStep(page).catch(() => {});
    const tapped = await page.evaluate((n) => ((window as any).__inv ?? []).slice(n).filter((e: any) => e.k === "tap").map((e: any) => e.el), before).catch(() => []);
    if (tapped.length) {
      taps.push({ t: Date.now(), what: tapped.join(",") });
      if (!heldNext) answered++;
      quietSince = Date.now();
      if (c!.turns && answered >= c!.turns) doneAt = Date.now() + (c!.tail ?? 6000);
    } else {
      // the bot found nothing to tap: look again a moment later
      quietSince = Date.now() - need + 400;
    }
  }
  const endAt = Date.now();
  await cdp.send("Page.stopScreencast").catch(() => {});
  (cfr as Cfr | null)?.end(endAt);
  await enc.close();

  const inv: any[] = await page.evaluate(() => Array.from((window as any).__inv ?? [])).catch(() => []);
  const audio: any[] = await page.evaluate(() => Array.from((window as any).__audioLog ?? [])).catch(() => []);
  // the sound effects the game played, rendered by the build itself (for the soundtrack)
  const sfxDir = join(dir, "sfx");
  mkdirSync(sfxDir, { recursive: true });
  for (const name of new Set(audio.filter((e) => e.kind === "sfx").map((e) => String(e.url).slice(4)))) {
    try {
      const bytes: number[] = await page.evaluate((n) => (window as any).__renderSfx(n), name);
      writeFileSync(join(sfxDir, `${name}.wav`), Buffer.from(bytes));
    } catch {}
  }
  const meta = { name: c!.name, title: c!.title, url, base: BASE, viewport: [W, H], dsf: DSF, loadAt, loaded, endAt, videoT0: firstTs, frames: frameTs.length, fps: FPS, taps, answered, save };
  writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 1));
  writeFileSync(join(dir, "events.json"), JSON.stringify(inv));
  writeFileSync(join(dir, "audio.json"), JSON.stringify(audio));
  writeFileSync(join(dir, "console.txt"), consoleLog.join("\n"));
  console.log(`${c!.name}: ${((endAt - loadAt) / 1000).toFixed(1)} s, ${frameTs.length} frames, ${inv.length} events, ${audio.length} clips, ${answered} answers`);
  await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 3000))]);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
