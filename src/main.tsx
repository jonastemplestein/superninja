import "./engine/fast"; // must run first: patches timers for ?fast=N bot runs
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import { CrashGuard } from "./ui/Crash";
import { installCheatGesture } from "./cheat/gesture";
declare global {
  const __APP_VERSION__: string;
}

// Kid-proofing: no pinch-zoom, long-press menus, or dragging the page around.
for (const ev of ["gesturestart", "gesturechange", "contextmenu", "dragstart", "selectstart"]) {
  document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
}
document.addEventListener(
  "touchmove",
  (e) => {
    if (!(e.target as Element).closest?.(".scrollable")) e.preventDefault();
  },
  { passive: false },
);

// No StrictMode: scenes run scripted audio sequences in effects, and dev double-mounting makes them race.
createRoot(document.getElementById("root")!).render(
  <CrashGuard>
    <App />
  </CrashGuard>,
);

// The grown-ups' cheat menu (docs/CHEATS.md): five taps in the top-right corner, the ` key, or ?cheat=1. Only two event
// listeners run until it is opened; the menu itself is a separate chunk.
installCheatGesture();

if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

// Android/Chrome: keep the install prompt so the "Get ready" page can offer a one-tap install.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__installPrompt = e;
});
