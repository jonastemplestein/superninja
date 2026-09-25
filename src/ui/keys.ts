// Physical keyboard support: typing a letter taps the matching tile. Space/Enter repeats the prompt.
import { useEffect, useRef } from "react";

export function useKeyTiles(tiles: string[], onTap: (g: string) => void, onRepeat?: () => void) {
  const ref = useRef({ tiles, onTap, onRepeat, buf: "", t: 0 });
  ref.current.tiles = tiles;
  ref.current.onTap = onTap;
  ref.current.onRepeat = onRepeat;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = ref.current;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        r.onRepeat?.();
        return;
      }
      const k = e.key.toLowerCase();
      if (!/^[a-z]$/.test(k)) return;
      const now = performance.now();
      // multi-letter spellings: accumulate keys typed within 700ms
      r.buf = now - r.t < 700 ? r.buf + k : k;
      r.t = now;
      const exactMulti = r.tiles.find((g) => g.length > 1 && g === r.buf.slice(-g.length));
      if (exactMulti && r.buf.length >= exactMulti.length) {
        r.buf = "";
        r.onTap(exactMulti);
        return;
      }
      const prefixOfMulti = r.tiles.some((g) => g.length > 1 && g.startsWith(r.buf) && g !== r.buf);
      if (r.tiles.includes(k) && !(prefixOfMulti && r.buf.length > 1)) {
        if (prefixOfMulti) {
          // wait briefly to see if a multi-letter spelling is being typed
          const snapshot = r.buf;
          setTimeout(() => {
            if (r.buf === snapshot) {
              r.buf = "";
              r.onTap(k);
            }
          }, 450);
        } else {
          r.buf = "";
          r.onTap(k);
        }
      } else if (!prefixOfMulti) {
        const starts = r.tiles.find((g) => g.startsWith(k));
        if (starts && r.buf === k) {
          r.buf = "";
          r.onTap(starts);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
