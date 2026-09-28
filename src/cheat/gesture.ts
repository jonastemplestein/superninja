// The cheat menu's ways in (docs/CHEATS.md): five taps in the top-right corner (60 × 60 CSS px) within 2.5 s, the
// backquote key, or ?cheat=1 in the address. This is all that runs while the menu is closed: a pointerdown and a keydown
// listener, each an O(1) check (no timers, no animation frames). The menu is its own chunk, loaded on first open.
export const ZONE = 60;
const TAPS = 5;
const WITHIN_MS = 2500;
/** The menu's host element (CheatMenu.tsx) and the state overlay's: taps inside them are never counted. */
export const HOST_ID = "sn-cheat";
export const OVERLAY_ID = "sn-cheat-state";
/** localStorage key: the __snState overlay stays on across reloads (it loads the menu's chunk at start-up). */
export const OVERLAY_KEY = "sn.cheat.overlay";

type Menu = typeof import("./CheatMenu");
let menu: Promise<Menu> | null = null;
const load = () =>
  (menu ??= import("./CheatMenu").catch((e) => {
    menu = null; // a failed chunk load (offline) can be tried again
    throw e;
  }));

/** Open (true), close (false) or toggle the menu. */
export function cheatMenu(open?: boolean) {
  load()
    .then((m) => m.toggle(open))
    .catch((e) => console.error("cheat menu:", e));
}

const taps: number[] = [];
/** Taps on a control never count: on a screen where the stage reaches the corner (16:9), a child mashing a corner
 *  button (Hear it again, the map's gear) must not open the menu. On a phone held sideways the corner is outside the
 *  letterboxed stage, so a grown-up's taps land on the bare background. */
const CONTROL = `#${HOST_ID}, button, a, input, select, textarea, [role="button"], [data-nav]`;
function onPointerDown(e: PointerEvent) {
  if (e.clientX < innerWidth - ZONE || e.clientY > ZONE) return;
  if ((e.target as Element | null)?.closest?.(CONTROL)) return;
  const now = performance.now();
  while (taps.length && now - taps[0] > WITHIN_MS) taps.shift();
  taps.push(now);
  if (taps.length < TAPS) return;
  taps.length = 0;
  // the fifth tap opens the menu and goes no further (the first four reached the game: a corner button's hint at most)
  e.stopPropagation();
  e.preventDefault();
  cheatMenu(true);
}
function onKeyDown(e: KeyboardEvent) {
  if ((e.code !== "Backquote" && e.key !== "`") || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target as HTMLElement | null;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  e.preventDefault();
  cheatMenu();
}

/** Called once from main.tsx. */
export function installCheatGesture() {
  addEventListener("pointerdown", onPointerDown, { capture: true });
  addEventListener("keydown", onKeyDown, { capture: true });
  (window as unknown as { __snCheat: typeof cheatMenu }).__snCheat = cheatMenu;
  let q = "";
  let overlay = false;
  try {
    q = location.search;
    overlay = localStorage.getItem(OVERLAY_KEY) === "1";
  } catch {}
  if (new URLSearchParams(q).get("cheat") === "1") cheatMenu(true);
  else if (overlay) load().then((m) => m.showOverlay(true)).catch(() => {});
}
