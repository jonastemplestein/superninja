// Vite config for the soak test (scripts/treadmill/soak.ts): the game's own config, plus
//  - a frozen snapshot: no HMR and no file watching, so edits made elsewhere while a long soak runs can't reload the page
//  - window.__snPerfMods: read-only probes appended to a few modules, so the soak can count module state that the game
//    never exposes (live particles, the ninja's effect nodes, listener sets, the decoded-audio cache). Test-only: this
//    config is never used for a release.
//  - with SOAK_FIXES=1 (soak.ts --patched): a preview of docs/PERF.md's fixes, patched into the snapshot at build time
//    (soak-fixes.ts's PATCHES); which patches applied is written to SOAK_FIXES_REPORT. A fix is previewed whole or not at
//    all: it is skipped once the real fix has landed (a patch would declare a name the source already declares) or when
//    the source has moved on (a patch's text is gone), so the preview never breaks the build as the real fixes land
// Used by soak.ts (through frozen.ts --probes): `vite build --config scripts/treadmill/soak.vite.config.ts --outDir <dir>`
// + `vite preview`, or `vite`.
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { PATCHES } from "./soak-fixes.ts";

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
    // PERF 5 and 6 (read as null until they land): the decoded-audio LRU's bytes, and the two reused music decks
    decodedLruMB: "Math.round(decodedTotal / 104857.6) / 10",
    musicDecks: "decks.length",
  },
  "engine/lipsync.ts": { visemeListeners: "listeners.size" },
  "engine/streak.ts": { streakListeners: "listeners.size", streakSubs: "subs.size", streakN: "n" },
  "engine/store.ts": { storeListeners: "listeners.size", attemptSubs: "attemptSubs.size", saveBytes: "JSON.stringify(state).length", adjustLog: "(state.adjustLog ? state.adjustLog.length : 0)" },
  "ui/nav.tsx": { navStack: "stack.length", navSubs: "subs.size", nudgeSubs: "nudgeSubs.size", holds: "holds.size" },
  "ui/poses.ts": { poseSubs: "subs.size" },
  "scenes/narrate.tsx": { narrateSubs: "subs.size" },
};

/** soak.ts --patched: the soak-fixes.ts preview, one whole fix at a time. Decided up front from the source on disk, so a
 *  fix that spans files (the lip-sync loop is in lipsync.ts and audio.ts) is applied everywhere or nowhere. */
function previewFixes(): Plugin {
  const src = new Map<string, string>();
  const read = (f: string) => src.get(f) ?? (src.set(f, existsSync(resolve(ROOT, f)) ? readFileSync(resolve(ROOT, f), "utf8") : ""), src.get(f)!);
  const declared = (code: string, name: string) => new RegExp(`\\b(?:let|const|var|function|class)\\s+${name.replace(/[$]/g, "\\$")}\\b`).test(code);
  const why = new Map<string, string>(); // fix → why it's skipped
  for (const p of PATCHES) {
    if (why.has(p.fix)) continue;
    const code = read(p.file);
    if (!code.includes(p.find)) why.set(p.fix, `the source has moved on (${p.file}: ${p.find.split("\n")[0].slice(0, 60)})`);
    else
      for (const m of p.replace.matchAll(/\b(?:let|const|var|function|class)\s+([A-Za-z_$][\w$]*)/g))
        if (!p.find.includes(m[0]) && declared(code, m[1])) {
          why.set(p.fix, `already in the source (${p.file} declares ${m[1]})`);
          break;
        }
  }
  const applied: string[] = [];
  return {
    name: "sn-soak-fixes-preview",
    enforce: "pre",
    transform(code, id) {
      const path = id.split("?")[0].replace(/\\/g, "/");
      const mine = PATCHES.filter((p) => path.endsWith("/" + p.file) && !why.has(p.fix));
      let out = code;
      for (const p of mine)
        if (out.includes(p.find)) {
          out = out.replace(p.find, p.replace);
          applied.push(`${p.fix} (${p.file})`);
        }
      // (fix 5's other half: the orbit keyframes without z-index; a no-op once the real fix has taken it out)
      if (path.endsWith("/src/styles.css") && !why.has("5 aura animates only what shows")) out = out.replace(/@keyframes nj-orbit \{[\s\S]*?\n\}/, (kf) => kf.replace(/ z-index: \d;/g, ""));
      return out === code ? null : { code: out, map: null };
    },
    buildEnd() {
      const skipped = [...why].map(([fix, reason]) => `${fix}: ${reason}`);
      console.log(`soak fixes preview: ${applied.length} patches applied, ${why.size} fixes skipped${skipped.length ? "\n  " + skipped.join("\n  ") : ""}`);
      if (process.env.SOAK_FIXES_REPORT) writeFileSync(process.env.SOAK_FIXES_REPORT, JSON.stringify({ applied, skipped }, null, 1));
    },
  };
}

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
    ...(process.env.SOAK_FIXES === "1" ? [previewFixes()] : []),
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
