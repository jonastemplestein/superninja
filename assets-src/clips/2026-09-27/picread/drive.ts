// "picread" clips (27 Sep): normal gameplay of Ninjas Read This Way, the picture-reading warm-ups, from PRODUCTION at
// real speed with captions on. One level per clip, so Jonas can choose between them:
//   wu2  w1-wu2  fish... dog → the fish-dog (Sensei shows, then the child reads them, starting on the wrong side once)
//   wu4  w1-wu4  three in a row: "Which one did I read?" (fish dog cat), then a picture word (rain + bow → rainbow)
//   wu6  w1-wu6  sound dots: the child taps the dots this way (one slip on the dog: "Start here, on this side!")
//
//   bun assets-src/clips/2026-09-27/picread/drive.ts <wu2|wu4|wu6> <take>    → raw/<wuN>-<take>.master.mp4 (+ timeline, sheet)
//
// The drive, for the rig in scripts/tweet-clips.ts (same trick as the tweet kit's fish-dog/drive.ts):
// - The warm-up starts talking as the page loads, under the rig's head clapper, so once the clapper is done the drive
//   clears the browser's storage (the init script writes the same fresh save again) and reloads: the lesson starts again
//   from the top, clean. The audio log is per document, so the first load's sounds are not in the soundtrack.
// - Taps like a child who listens: only once the turn is open (window.__snState: next set, asked, not busy), about a
//   second after (per game: pace below); a held Next (window.__snNav.next === "ready") is tapped after 1.5 s.
// - `slips`: the n-th time a turn wants `want` in beat `beat`, the child taps `tap` instead (once), so the game's
//   gentle correction shows; then the right answer after the correction.
import type { Page } from "playwright";
import { spawnSync } from "node:child_process";
import { loadavg } from "node:os";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";

export const PROD = "https://superninja.templestein.com";

interface Slip { beat: string; want: string; tap: string; nth?: number }
interface Plan { level: string; hero: "kai" | "suki"; seconds: number; slips: Slip[] }
export const PLANS: Record<string, Plan> = {
  wu2: { level: "w1-wu2", hero: "suki", seconds: 36, slips: [{ beat: "rail", want: "fish", tap: "dog" }] },
  wu4: { level: "w1-wu4", hero: "kai", seconds: 62, slips: [] },
  wu6: { level: "w1-wu6", hero: "suki", seconds: 52, slips: [{ beat: "dots", want: "dot 0", tap: "dot 2", nth: 2 }] },
};
/** how long after the turn opens the child taps (ms), per beat */
const PACE: Record<string, number> = { rail: 1050, which: 1350, compound: 1150, dots: 750 };

export const saveFor = (hero: string) =>
  tweetSave({ hero, schoolYear: "none", stickers: [], shiny: [], settings: { captions: true, music: 0.32, unlockAll: false } });

const selector = (label: string) =>
  /^(rail|dot) \d+$/.test(label) || label === "rabbit" || label === "tortoise"
    ? `.wu [aria-label="${label}"]`
    : `.wu .wu-slot:not(.out) [aria-label="${label}"]`;

export async function drive(page: Page, rig: Rig, plan: Plan, o: { keepalive?: boolean; probe?: boolean; damage?: boolean } = {}) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  // (keepalive: a no-op requestAnimationFrame loop, the first guess at the freeze below; it made no difference)
  // (damage, on by default: the freeze fix. On the 27 Sep build every take froze for ~265 ms at the same moments (each
  // merge, "Your turn!", new pictures), at 1080p and 720p, with software compositing too, while the page's own
  // requestAnimationFrame never missed a beat (probe) and a trace showed the renderer and viz drawing every frame: only
  // the screencast's copy requests stopped. Chrome's video capturer samples on damage, and since the performance fixes
  // (the particle canvas sleeps) the damage is small and local, which trips its animated-content sampling; before, the
  // full-screen canvas damaged every frame. A full-screen layer at 0.1-0.2 % black, its opacity animated on the
  // compositor, damages the whole frame again: tested on w1-wu2, two 260 ms gaps without it, none with it. It changes
  // no pixel by more than one level of 255.)
  if (o.damage)
    await page.evaluate(() => {
      const d = document.createElement("div");
      d.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483645;background:#000;opacity:0.001";
      document.body.appendChild(d);
      d.animate([{ opacity: 0.001 }, { opacity: 0.002 }], { duration: 34, iterations: Infinity, direction: "alternate" });
    });
  if (o.keepalive) await page.evaluate(() => { const k = () => requestAnimationFrame(k); requestAnimationFrame(k); });
  // (probe: the page's own view of its frames: rAF gaps over 60 ms and long tasks, printed on the master's clock, to tell
  // page-side jank from a capture artefact)
  if (o.probe)
    await page.evaluate(() => {
      const w = window as any;
      w.__gaps = [];
      let last = performance.now();
      const k = (t: number) => {
        if (t - last > 60) w.__gaps.push(["raf", performance.timeOrigin + last, Math.round(t - last)]);
        last = t;
        requestAnimationFrame(k);
      };
      requestAnimationFrame(k);
      try {
        new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__gaps.push(["longtask", performance.timeOrigin + e.startTime, Math.round(e.duration)]); }).observe({ type: "longtask", buffered: true } as any);
      } catch {}
    });
  const used = new Set<Slip>();
  const turns = new Map<string, number>();
  let lastWant: string | null = null;
  let seen: string | null = null, since = 0;
  while (rig.live()) {
    const { st, nav } = await page
      .evaluate(() => ({ st: (window as any).__snState || {}, nav: (window as any).__snNav || null }))
      .catch(() => ({ st: {} as any, nav: null as any }));
    let key: string | null = null;
    if (nav?.next === "ready") key = "hold";
    else if (st.scene === "warmup" && st.next && st.asked && !st.busy) {
      key = `${st.beat}|${st.next}`;
      if (st.next !== lastWant) {
        lastWant = st.next;
        turns.set(key, (turns.get(key) ?? 0) + 1);
      }
    }
    if (key !== seen) {
      seen = key;
      since = Date.now();
    } else if (key === "hold" && Date.now() - since >= 1500) {
      await rig.tap('[data-nav="next"]');
      seen = null;
      await rig.wait(300);
      continue;
    } else if (key && key !== "hold" && Date.now() - since >= (PACE[st.beat] ?? 1100)) {
      const slip = plan.slips.find((s) => !used.has(s) && s.beat === st.beat && s.want === st.next && (s.nth ?? 1) === turns.get(key!));
      if (slip) used.add(slip);
      const label = slip ? slip.tap : st.next;
      rig.mark(slip ? `slip ${label}` : `tap ${label}`);
      await rig.tap(selector(label));
      seen = null;
      // (let the game take the tap before looking again)
      await rig.wait(200);
      continue;
    }
    await rig.wait(40);
  }
  if (o.probe) {
    const gaps: [string, number, number][] | null = await page.evaluate(() => (window as any).__gaps ?? null).catch(() => null);
    console.log(`[probe] ${gaps == null ? "no probe data" : `${gaps.length} gaps`}`);
    if (!gaps) return;
    const off = rig.elapsed() - Date.now() / 1000;
    console.log("[probe] " + gaps.map(([k, t, ms]) => `${k} ${(t / 1000 + off).toFixed(2)} ${ms}ms`).join("\n[probe] "));
  }
}

/** The machine is shared (other editors film with the same rig, bots and judges run): before filming, wait (up to
 *  `maxS`, env QUIET_S) until no other rig browser has been filming for 5 s and the 1-minute load is under `load`, so
 *  the take doesn't stutter (tested 27 Sep: with three other rig recordings on, a take drew 33 fps; gpu: true, 16). */
async function waitForQuiet(maxS = Number(process.env.QUIET_S ?? 1500), load = Number(process.env.QUIET_LOAD ?? 10)) {
  const t = Date.now();
  let calm = 0;
  for (;;) {
    const others = spawnSync("pgrep", ["-f", "chrome-headless-shell.*force-device-scale-factor"]).stdout.toString().trim();
    const la = loadavg()[0];
    calm = !others && la < load ? calm + 1 : 0;
    if (calm >= 5 || Date.now() - t > maxS * 1000) {
      console.log(`[picread] filming (waited ${Math.round((Date.now() - t) / 1000)} s; load ${la.toFixed(1)}; other rig browsers: ${others ? "yes" : "none"})`);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

if (import.meta.main) {
  const which = process.argv[2] ?? "wu2";
  const take = process.argv[3] ?? "take1";
  // options: "nodamage", "keepalive", "probe" (see drive()), "gpu" (ANGLE Metal instead of SwiftShader; worse on the busy
  // machine), "720p" (the same ~265 ms freezes as 1080p)
  const opts = process.argv.slice(4);
  const plan = PLANS[which];
  if (!plan) throw new Error(`unknown plan ${which}`);
  await waitForQuiet();
  const outDir = `${import.meta.dir}/raw`;
  const rec = await record({
    name: `${which}-${take}`, url: `/play/?level=${plan.level}`, base: PROD, save: saveFor(plan.hero), seconds: plan.seconds, outDir,
    drive: (p, r) => drive(p, r, plan, { keepalive: opts.includes("keepalive"), probe: opts.includes("probe"), damage: !opts.includes("nodamage") }), sheetEvery: 1, gpu: opts.includes("gpu"), size: opts.includes("720p") ? "720p" : "1080p",
  });
  const said = rec.events.filter((e) => ["speech", "tap", "mark", "hitch", "scene", "sting"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.text ? ` "${e.text}"` : ""}${e.dur ? ` (${e.dur})` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
