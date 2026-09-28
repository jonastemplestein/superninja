// The confirm's standalone page (playtest/confirm/index.html): the game's React and CSS setup, one entry, no public/
// copy (serve.ts serves /a/ straight from public/). Output: playtest/runs/confirm/dist (git-ignored).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const ROOT = resolve(import.meta.dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
export default defineConfig({
  root: ROOT,
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: resolve(ROOT, "playtest/runs/confirm/dist"),
    emptyOutDir: true,
    rollupOptions: { input: { confirm: resolve(ROOT, "playtest/confirm/index.html") } },
  },
});
