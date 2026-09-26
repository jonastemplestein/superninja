// Vite config for the soak test (scripts/treadmill/soak.ts): the game's own config, plus
//  - a frozen snapshot: no HMR and no file watching, so edits made elsewhere while a long soak runs can't reload the page
//  - window.__snPerfMods: read-only probes appended to a few modules, so the soak can count module state that the game
//    never exposes (live particles, the ninja's effect nodes, listener sets, the decoded-audio cache). Test-only: this
//    config is never used for a release.
//  - with SOAK_FIXES=1 (soak.ts --patched): a preview of docs/PERF.md's fixes, patched into the snapshot at build time
//    (soak-fixes.ts); which patches applied is written to SOAK_FIXES_REPORT
// Used by soak.ts: `vite build --config scripts/treadmill/soak.vite.config.ts --outDir <dir>` + `vite preview`, or `vite`.
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { soakFixes } from "./soak-fixes.ts";

const ROOT = resolve(import.meta.dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

/** module (path under src/) → probes: name → expression evaluated inside that module's scope. Every expression is
 *  guarded, so a renamed variable reads null instead of breaking the build. */
const PROBES: Record<string, Record<string, string>> = {
  "ui/ui.tsx": {
    particles: "particles.length",
    particleKinds: "particles.reduce((m, p) => ((m[p.kind] = (m[p.kind] || 0) + 1), m), {})",
    glowCache: "glowCache.size",
    helpStack: "helpStack.length",
    nudgeListeners: "nudgeListeners.size",
    uprightSubs: "uprightSubs.size",
    imgCache: "Object.keys(imgs).length",
    fxDomChildren: "(fxDomEl ? fxDomEl.childElementCount : null)",
  },
  "ui/Ninja.tsx": {
    owned: "owned.size",
    ownedConnected: "[...owned].filter((e) => e.isConnected).length",
    busy: "busy.size",
    spotMounted: "(spot ? (spot.root.isConnected ? 1 : 'detached') : 0)",
    moveRunning: "(cur && !cur.done ? 1 : 0)",
    spotGen: "spotGen",
  },
  "engine/audio.ts": {
    bufferCache: "buffers.size",
    captionListeners: "captionListeners.size",
    clipListeners: "clipListeners.size",
    sayListeners: "sayListeners.size",
    music: "(musicEl ? 1 : 0)",
    speaking: "speaking",
  },
  "engine/lipsync.ts": { visemeListeners: "listeners.size" },
  "engine/streak.ts": { streakListeners: "listeners.size", streakSubs: "subs.size", streakN: "n" },
  "engine/store.ts": { storeListeners: "listeners.size", attemptSubs: "attemptSubs.size", saveBytes: "JSON.stringify(state).length" },
  "ui/nav.tsx": { navStack: "stack.length", navSubs: "subs.size", nudgeSubs: "nudgeSubs.size", holds: "holds.size" },
  "ui/poses.ts": { poseSubs: "subs.size" },
  "scenes/narrate.tsx": { narrateSubs: "subs.size" },
};

function perfProbes(): Plugin {
  return {
    name: "sn-perf-probes",
    enforce: "post",
    transform(code, id) {
      const path = id.split("?")[0].replace(/\\/g, "/");
      const key = Object.keys(PROBES).find((k) => path.endsWith(`/src/${k}`));
      if (!key) return null;
      const body = Object.entries(PROBES[key])
        .map(([k, e]) => `${JSON.stringify(k)}: (() => { try { return ${e}; } catch { return null; } })()`)
        .join(",\n");
      const probe = `\n;(() => { if (typeof window === "undefined") return; const m = (window.__snPerfMods ||= {}); m[${JSON.stringify(key)}] = () => ({\n${body}\n}); })();\n`;
      return { code: code + probe, map: null };
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [
    ...(process.env.SOAK_FIXES === "1"
      ? [
          soakFixes((applied, missed) => {
            console.log(`soak fixes: ${applied.length} applied, ${missed.length} not applied${missed.length ? "\n  " + missed.join("\n  ") : ""}`);
            if (process.env.SOAK_FIXES_REPORT) writeFileSync(process.env.SOAK_FIXES_REPORT, JSON.stringify({ applied, missed }, null, 1));
          }),
        ]
      : []),
    react(),
    perfProbes(),
  ],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { host: "127.0.0.1", hmr: false, watch: null },
  preview: { host: "127.0.0.1" },
  build: {
    emptyOutDir: true,
    rollupOptions: { input: { play: resolve(ROOT, "play/index.html") } },
  },
});
