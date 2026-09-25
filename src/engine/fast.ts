// Fast-forward for bots: /play/?fast=3 runs speech, timers, CSS animations and videos 3× faster so the
// playtest treadmill (scripts/treadmill.ts) can sweep the whole game quickly. Never on for children.
const n = Number(new URLSearchParams(location.search).get("fast"));
export const FAST = n > 1 && n <= 8 ? n : 1;

if (FAST > 1) {
  const st = window.setTimeout;
  (window as any).setTimeout = (fn: TimerHandler, ms = 0, ...args: unknown[]) => st(fn, ms / FAST, ...args);
  const si = window.setInterval;
  (window as any).setInterval = (fn: TimerHandler, ms = 0, ...args: unknown[]) => si(fn, ms / FAST, ...args);
  si(() => {
    for (const a of document.getAnimations()) if (a.playbackRate !== FAST) a.playbackRate = FAST;
    document.querySelectorAll("video").forEach((v) => v.playbackRate !== FAST && (v.playbackRate = FAST));
  }, 100);
}
