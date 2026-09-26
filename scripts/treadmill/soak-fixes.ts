// A PREVIEW of the performance fixes proposed in docs/PERF.md, applied as build-time source patches to the soak's snapshot
// only (soak.ts --patched), so their effect can be measured before anyone changes the game. Nothing on disk is edited.
// Each patch is an exact find/replace on today's source; when the source has moved on, the patch reports "not applied"
// and the preview is incomplete (the build log says which). Once the real fixes land, delete this file and --patched.
import type { Plugin } from "vite";

type Patch = { file: string; fix: string; find: string; replace: string };

const FLAME_CSS_OLD = `.nj-flame svg { width: 100%; height: 100%; overflow: visible; transform-origin: 50% 92%; animation: nj-flicker 0.46s ease-in-out infinite alternate; animation-delay: var(--d); }`;
const PALE_CSS_OLD = `.nj-flame.pale svg { filter: drop-shadow(0 0 4px rgba(255, 244, 220, 0.9)); animation: nj-pend 0.7s ease-in-out infinite alternate; }`;

export const PATCHES: Patch[] = [
  // ---- fix 1: the particle canvas loop sleeps when there are no particles (ui.tsx FxLayer)
  {
    file: "src/ui/ui.tsx",
    fix: "1 particle loop sleeps",
    find: `const particles: Particle[] = [];`,
    replace: `const particles: Particle[] = [];
let wakeFx: (() => void) | null = null;
{
  const push0 = particles.push;
  (particles as any).push = function (this: Particle[], ...a: Particle[]) {
    const n = push0.apply(this, a);
    wakeFx?.();
    return n;
  };
}`,
  },
  {
    file: "src/ui/ui.tsx",
    fix: "1 particle loop sleeps",
    find: `      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);`,
    replace: `      raf = particles.length ? requestAnimationFrame(loop) : 0;
    };
    wakeFx = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    wakeFx();
    return () => {
      wakeFx = null;
      cancelAnimationFrame(raf);`,
  },
  // ---- fix 2: the lip-sync analyser loop runs only while speech plays (lipsync.ts, woken by audio.ts playBuffer)
  {
    file: "src/engine/lipsync.ts",
    fix: "2 lip-sync loop sleeps",
    find: `const listeners = new Set<(v: Viseme, s: Speaker) => void>();`,
    replace: `const listeners = new Set<(v: Viseme, s: Speaker) => void>();
let lipRunning = false, quietFrames = 0;
export let lipWake = () => {};`,
  },
  {
    file: "src/engine/lipsync.ts",
    fix: "2 lip-sync loop sleeps",
    find: `  const tick = (t: number) => {
    requestAnimationFrame(tick);
    if (!analyser || !listeners.size) return;`,
    replace: `  const tick = (t: number) => {
    if (!analyser || !listeners.size || (quietFrames > 30 && current === "rest")) {
      lipRunning = false;
      return;
    }
    requestAnimationFrame(tick);`,
  },
  {
    file: "src/engine/lipsync.ts",
    fix: "2 lip-sync loop sleeps",
    find: `    rms = Math.sqrt(rms / time.length);`,
    replace: `    rms = Math.sqrt(rms / time.length);
    quietFrames = rms > 0.012 ? 0 : quietFrames + 1;`,
  },
  {
    file: "src/engine/lipsync.ts",
    fix: "2 lip-sync loop sleeps",
    find: `  };
  requestAnimationFrame(tick);
}`,
    replace: `  };
  lipWake = () => {
    if (lipRunning) return;
    lipRunning = true;
    quietFrames = 0;
    requestAnimationFrame(tick);
  };
  lipWake();
}`,
  },
  {
    file: "src/engine/audio.ts",
    fix: "2 lip-sync loop sleeps",
    find: `import { attachLipsync, setSpeaker } from "./lipsync";`,
    replace: `import { attachLipsync, setSpeaker, lipWake } from "./lipsync";`,
  },
  {
    file: "src/engine/audio.ts",
    fix: "2 lip-sync loop sleeps",
    find: `    src.start();
    if (bus === speechBus) current = src;`,
    replace: `    src.start();
    if (bus === speechBus) (current = src), lipWake();`,
  },
  // ---- fix 3: decoded clips are kept up to a byte budget, least recently used out first (audio.ts load)
  {
    file: "src/engine/audio.ts",
    fix: "3 decoded-audio budget",
    find: `export function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);`,
    replace: `const DECODED_BUDGET = 40 * 1048576;
const decodedLru = new Map<string, number>();
let decodedTotal = 0;
function remember(url: string, b: AudioBuffer) {
  const bytes = b.length * b.numberOfChannels * 4;
  decodedTotal += bytes - (decodedLru.get(url) ?? 0);
  decodedLru.delete(url);
  decodedLru.set(url, bytes);
  for (const [u, n] of decodedLru) {
    if (decodedTotal <= DECODED_BUDGET || u === url) break;
    decodedLru.delete(u);
    buffers.delete(u);
    decodedTotal -= n;
  }
}
export function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  const seen = decodedLru.get(url);
  if (p && seen != null) {
    decodedLru.delete(url);
    decodedLru.set(url, seen);
  }`,
  },
  {
    file: "src/engine/audio.ts",
    fix: "3 decoded-audio budget",
    find: `      .then((b) => {
        bufferUrl.set(b, url);
        return b;
      })`,
    replace: `      .then((b) => {
        bufferUrl.set(b, url);
        remember(url, b);
        return b;
      })`,
  },
  // ---- fix 4: two music decks made once, reused for every track (audio.ts playMusic)
  {
    file: "src/engine/audio.ts",
    fix: "4 music decks",
    find: `  const c = audioCtx();
  if (musicEl) {
    const old = musicEl;
    old.gain.gain.setTargetAtTime(0, c.currentTime, 0.35);
    setTimeout(() => {
      old.el.pause();
      old.el.removeAttribute("src");
      old.el.load();
      old.gain.disconnect();
    }, 1800);
  }
  musicEl = null;
  if (!id) return;
  logAudio(urls.music(id), "music");
  const el = new Audio(urls.music(id));`,
    replace: `  const c = audioCtx();
  if (!decks.length)
    for (let i = 0; i < 2; i++) {
      const del = new Audio();
      del.loop = true;
      del.preload = "auto";
      del.crossOrigin = "anonymous";
      const g = c.createGain();
      g.gain.value = 0;
      try {
        c.createMediaElementSource(del).connect(g);
      } catch {}
      g.connect(musicBus);
      decks.push({ el: del, gain: g });
    }
  const next = musicEl === decks[0] ? decks[1] : decks[0];
  if (musicEl) {
    const old = musicEl;
    old.gain.gain.setTargetAtTime(0, c.currentTime, 0.35);
    setTimeout(() => {
      if (musicEl === old) return;
      old.el.pause();
      old.el.removeAttribute("src");
      old.el.load();
    }, 1800);
  }
  musicEl = null;
  if (!id) return;
  logAudio(urls.music(id), "music");
  const el = next.el;
  el.src = urls.music(id);`,
  },
  {
    file: "src/engine/audio.ts",
    fix: "4 music decks",
    find: `  el.loop = true;
  el.preload = "auto";
  el.crossOrigin = "anonymous";
  const gain = c.createGain();
  gain.gain.value = 0;
  try {
    c.createMediaElementSource(el).connect(gain);
  } catch {}
  gain.connect(musicBus);
  musicEl = { el, gain };`,
    replace: `  const gain = next.gain;
  gain.gain.cancelScheduledValues(c.currentTime);
  gain.gain.value = 0;
  musicEl = next;`,
  },
  {
    file: "src/engine/audio.ts",
    fix: "4 music decks",
    find: `let musicEl: { el: HTMLAudioElement; gain: GainNode } | null = null;`,
    replace: `let musicEl: { el: HTMLAudioElement; gain: GainNode } | null = null;
const decks: { el: HTMLAudioElement; gain: GainNode }[] = [];`,
  },
  // ---- fix 5: the aura's hidden decorations don't animate below their tier; the orbit loses z-index (styles.css)
  {
    file: "src/styles.css",
    fix: "5 aura animates only what shows",
    find: `  animation: nj-swirl 14s linear infinite; transform-origin: 50% 58%;
}`,
    replace: `  animation: nj-swirl 14s linear infinite paused; transform-origin: 50% 58%;
}
.ninja-spot:is(.tier-1, .tier-2, .tier-3) .nj-rays { animation-play-state: running; }`,
  },
  {
    file: "src/styles.css",
    fix: "5 aura animates only what shows",
    find: `filter: drop-shadow(0 0 4px rgba(var(--glow), 1)); animation: nj-rise 2.4s linear infinite;`,
    replace: `filter: drop-shadow(0 0 4px rgba(var(--glow), 1)); animation: nj-rise 2.4s linear infinite paused;`,
  },
  {
    file: "src/styles.css",
    fix: "5 aura animates only what shows",
    find: `.nj-sparks i:nth-child(3n) { background: rgb(var(--glow)); }`,
    replace: `.nj-sparks i:nth-child(3n) { background: rgb(var(--glow)); }
.ninja-spot:is(.tier-1, .tier-2, .tier-3) .nj-sparks i { animation-play-state: running; }`,
  },
  {
    file: "src/styles.css",
    fix: "5 aura animates only what shows",
    find: `  animation: nj-orbit 2.4s linear infinite;`,
    replace: `  animation: nj-orbit 2.4s linear infinite paused;`,
  },
  {
    file: "src/styles.css",
    fix: "5 aura animates only what shows",
    find: `.ninja-spot.tier-3 .nj-orbit { opacity: 1; }`,
    replace: `.ninja-spot.tier-3 .nj-orbit { opacity: 1; z-index: 3; }
.ninja-spot.tier-3 .nj-orbit i { animation-play-state: running; }`,
  },
  // ---- fix 6: the flame flicker runs on an HTML wrapper (composited), not on the <svg> (repainted every frame)
  {
    file: "src/styles.css",
    fix: "6 flames on the compositor",
    find: FLAME_CSS_OLD,
    replace: `.nj-flame svg { width: 100%; height: 100%; overflow: visible; }
.nj-flick { display: block; width: 100%; height: 100%; transform-origin: 50% 92%; animation: nj-flicker 0.46s ease-in-out infinite alternate; animation-delay: var(--d); }`,
  },
  {
    file: "src/styles.css",
    fix: "6 flames on the compositor",
    find: PALE_CSS_OLD,
    replace: `.nj-flame.pale svg { filter: drop-shadow(0 0 4px rgba(255, 244, 220, 0.9)); }
.nj-flame.pale .nj-flick { animation: nj-pend 0.7s ease-in-out infinite alternate; }`,
  },
  {
    file: "src/ui/Ninja.tsx",
    fix: "6 flames on the compositor",
    find: `      <svg viewBox="0 0 40 54">`,
    replace: `      <i className="nj-flick"><svg viewBox="0 0 40 54">`,
  },
  {
    file: "src/ui/Ninja.tsx",
    fix: "6 flames on the compositor",
    find: `      </svg>
    </span>
  );
}
function Flames(`,
    replace: `      </svg></i>
    </span>
  );
}
function Flames(`,
  },
];

/** z-index out of the orbit keyframes (they can then run on the compositor). */
const stripOrbitZ = (css: string) =>
  css.replace(/@keyframes nj-orbit \{[\s\S]*?\n\}/, (kf) => kf.replace(/ z-index: \d;/g, ""));

export function soakFixes(report: (applied: string[], missed: string[]) => void): Plugin {
  const applied: string[] = [], missed: string[] = [];
  return {
    name: "sn-soak-fixes",
    enforce: "pre",
    transform(code, id) {
      const path = id.split("?")[0].replace(/\\/g, "/");
      const mine = PATCHES.filter((p) => path.endsWith("/" + p.file));
      if (!mine.length) return null;
      let out = code;
      for (const p of mine) {
        if (out.includes(p.find)) {
          out = out.replace(p.find, p.replace);
          applied.push(`${p.fix} (${p.file})`);
        } else missed.push(`${p.fix} (${p.file}): ${p.find.split("\n")[0].slice(0, 70)}`);
      }
      if (path.endsWith("/src/styles.css")) out = stripOrbitZ(out);
      return { code: out, map: null };
    },
    buildEnd() {
      report(applied, missed);
    },
  };
}
