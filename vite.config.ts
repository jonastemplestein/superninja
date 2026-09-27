import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";

// Two pages: the landing page at / and the game at /play/
import pkg from "./package.json" with { type: "json" };

/** Emits /sw.js from src/pwa/sw.template.js, stamped with a hash of every file under public/a/, so phones drop cached
 *  audio and pictures whenever any of them changes (they're re-recorded and redrawn at the same URLs). */
function swVersion(): Plugin {
  return {
    name: "sn-sw-version",
    apply: "build",
    generateBundle() {
      const assets = resolve(import.meta.dirname, "public/a");
      const h = createHash("sha1");
      const walk = (d: string) => {
        for (const n of readdirSync(d).sort()) {
          const p = join(d, n);
          if (statSync(p).isDirectory()) walk(p);
          else h.update(p.slice(assets.length)).update(readFileSync(p));
        }
      };
      if (existsSync(assets)) walk(assets);
      const source = readFileSync(resolve(import.meta.dirname, "src/pwa/sw.template.js"), "utf8").replaceAll("__SN_ASSETS__", h.digest("hex").slice(0, 12));
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

export default defineConfig({
  plugins: [react(), swVersion()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      input: { landing: resolve(__dirname, "index.html"), play: resolve(__dirname, "play/index.html") },
    },
  },
});
