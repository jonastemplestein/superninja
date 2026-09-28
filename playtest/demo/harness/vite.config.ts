// Sensei's demo harness (playtest/demo/harness/index.html): the game's React and CSS setup, one entry, no public/ copy
// (serve.ts serves /a/ straight from public/). A frozen build: never the shared dev server.
//   bunx vite build --config playtest/demo/harness/vite.config.ts   → playtest/runs/demo-harness/dist (git-ignored)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const ROOT = resolve(import.meta.dirname, "../../..");
const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
export default defineConfig({
  root: ROOT,
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: resolve(ROOT, "playtest/runs/demo-harness/dist"),
    emptyOutDir: true,
    rollupOptions: { input: { demo: resolve(ROOT, "playtest/demo/harness/index.html") } },
  },
});
