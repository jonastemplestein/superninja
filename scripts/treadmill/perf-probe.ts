// The perf invariants of docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §4.4 F4.2, for sweep.ts --petals (all minor): an in-page
// sampler (an init script) and the judge over its samples. Counted as soak.ts counts them.
//   anim-main-thread  more than 2 endless running animations the compositor can't run at once (a property such as
//                     z-index or box-shadow, or an SVG target), named, in 2 or more samples
//   anim-hidden       more than 2 endless animations running on hidden elements at once, named, in 2 or more samples. An
//                     opacity that is an animation's own (a fade in progress, an animation's delay, a twinkle at its dark
//                     end) isn't hidden: the element is on its way to being seen
//   raf-at-rest       a screen's median rAF requests a second above 5, once nothing has been said, tapped or changed
//                     (route, scene, step) for 2 s (PERF.md §5), in 2 or more samples. Real seconds, not game seconds:
//                     ?fast=N speeds up timers and CSS, but a canvas effect's frames run in real time. A clip is being
//                     said until its recorded length (at ?fast=N) has played

/** One sample a second: the screen (route|scene|step), whether the page was at rest, rAF requests a second since the last
 *  sample, and the endless running animations by name: the compositor can't run them (`main`), or on hidden elements. */
export type PerfSample = { t: number; key: string; rest: boolean; raf: number; main: Record<string, number>; hid: Record<string, number> };
export type PerfIssue = { kind: "anim-main-thread" | "anim-hidden" | "raf-at-rest"; sel: string; detail: string };

/** The in-page sampler: `page.addInitScript(perfSampler, { dur, fast })` before the page loads, with `dur` the clip
 *  lengths (public/a/durations.json, ms at 1×) and `fast` the ?fast=N the page plays at. Samples go to
 *  window.__perfSamples (the newest 900). window.__perfAct(url?) marks activity: the sweep's audio log calls it as each
 *  clip starts, and a speech clip keeps the page busy for its whole length (a story page read aloud, with its words
 *  lighting up, is not at rest). Taps, changes of screen and the Help button's `talking` are seen here. */
export function perfSampler(o: { dur: Record<string, number>; fast: number }) {
  const w = window as any;
  const raf0 = window.requestAnimationFrame.bind(window);
  let rafN = 0;
  window.requestAnimationFrame = (cb: FrameRequestCallback) => (rafN++, raf0(cb));
  let lastAct = performance.now(), lastKey = "", last = { t: performance.now(), n: 0 };
  const act = () => void (lastAct = performance.now());
  addEventListener("pointerdown", act, true);
  let speechUntil = 0;
  w.__perfAct = (url?: unknown) => {
    act();
    const m = typeof url === "string" ? url.match(/\/a\/([a-z])\/([^/?#]+)\.mp3/) : null;
    if (m) speechUntil = Math.max(speechUntil, performance.now() + (o?.dur?.[`${m[1]}/${decodeURIComponent(m[2])}`] ?? 1500) / Math.max(1, Number(o?.fast) || 1));
  };
  const restMs = 2000;
  const COMPOSITED = new Set(["transform", "translate", "rotate", "scale", "opacity", "filter", "offset", "easing", "composite", "computedOffset"]);
  const hidden = (el: Element) => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden") return true;
      if (Number(s.opacity) < 0.01 && !e.getAnimations().some((a) => a.playState === "running" && ((a.effect as KeyframeEffect | null)?.getKeyframes() ?? []).some((k) => "opacity" in k))) return true;
    }
    return false;
  };
  const nameOf = (a: Animation) => {
    const an = (a as any).animationName as string | undefined;
    if (an) return `@${an}`;
    const el = (a.effect as KeyframeEffect | null)?.target as Element | null;
    const cls = el ? String((el as any).className?.baseVal ?? el.className ?? "").split(" ").filter(Boolean)[0] ?? el.tagName.toLowerCase() : "?";
    return `.${cls} (script)`;
  };
  const samples: PerfSample[] = (w.__perfSamples = []);
  // (the page's own setInterval may be sped up by ?fast=N later; this one is taken before the page's scripts run)
  setInterval(() => {
    const now = performance.now();
    const key = `${String(w.__snRoute ?? "")}|${w.__snState?.scene ?? ""}|${w.__snNav?.pres?.id ?? ""}`;
    if (key !== lastKey) (lastKey = key), act();
    if (now < speechUntil || document.querySelector(".help-btn.talking")) act();
    const raf = (rafN - last.n) / Math.max(0.001, (now - last.t) / 1000);
    last = { t: now, n: rafN };
    const main: Record<string, number> = {}, hid: Record<string, number> = {};
    for (const a of document.getAnimations()) {
      const eff = a.effect as KeyframeEffect | null;
      if (!eff || a.playState !== "running" || eff.getTiming().iterations !== Infinity) continue;
      const el = eff.target as Element | null;
      const n = nameOf(a);
      if (el && hidden(el)) hid[n] = (hid[n] ?? 0) + 1;
      let props: string[] = [];
      try {
        props = eff.getKeyframes().flatMap((k) => Object.keys(k));
      } catch {}
      if (props.some((p) => !COMPOSITED.has(p)) || el instanceof SVGElement) main[n] = (main[n] ?? 0) + 1;
    }
    samples.push({ t: now, key, rest: now - lastAct >= restMs, raf: Math.round(raf * 10) / 10, main, hid });
    if (samples.length > 900) samples.splice(0, samples.length - 900);
  }, 1000);
}

/** A screen, from a sample's key (route|scene|step): "level/learn", "reward/ready:learn". */
export const screenOf = (key: string) => {
  const [route = "", scene = "", pres = ""] = key.split("|");
  return [route.split(":")[0] || "?", pres || scene].filter(Boolean).join("/");
};

/** The findings from one page's samples. */
export function perfIssues(samples: PerfSample[]): PerfIssue[] {
  const out: PerfIssue[] = [];
  const total = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  // raf-at-rest: per screen, the median of its rest samples (at least 2 of them; of an even count, the lower middle)
  const rest = new Map<string, number[]>();
  for (const s of samples) if (s.rest) rest.set(screenOf(s.key), [...(rest.get(screenOf(s.key)) ?? []), s.raf]);
  for (const [sc, rates] of rest) {
    if (rates.length < 2) continue;
    const med = rates.slice().sort((a, b) => a - b)[Math.floor((rates.length - 1) / 2)];
    if (med > 5) out.push({ kind: "raf-at-rest", sel: sc, detail: `${Math.round(med)} rAF requests a second on ${sc} at rest (the median of ${rates.length} one-second samples with no speech, tap or change of route, scene or step for 2 s; the most ${Math.round(Math.max(...rates))}). The budget is 5 (PERF.md §5): a loop that runs while nothing moves.` });
  }
  // anim-*: more than 2 at once in 2 or more samples; the worst sample's, by name
  for (const [kind, field, what] of [["anim-main-thread", "main", "endless animations the compositor can't run"], ["anim-hidden", "hid", "endless animations running on hidden elements"]] as const) {
    const over = samples.filter((s) => total(s[field]) > 2);
    if (over.length < 2) continue;
    const worst = over.reduce((a, b) => (total(b[field]) > total(a[field]) ? b : a));
    const names = Object.entries(worst[field]).sort((a, b) => b[1] - a[1]);
    out.push({ kind, sel: names.slice(0, 3).map(([n]) => n).sort().join(", "), detail: `${total(worst[field])} ${what} at once on ${screenOf(worst.key)} (over the budget of 2 in ${over.length} of ${samples.length} samples, on ${[...new Set(over.map((s) => screenOf(s.key)))].slice(0, 4).join(", ")}): ${names.map(([n, k]) => `${n} ×${k}`).join(", ")}.` });
  }
  return out;
}
