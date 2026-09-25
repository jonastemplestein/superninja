import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Two pages: the landing page at / and the game at /play/
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      input: { landing: resolve(__dirname, "index.html"), play: resolve(__dirname, "play/index.html") },
    },
  },
});
