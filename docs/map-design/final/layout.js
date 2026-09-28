// The map's layout: where every stone, the child's ninja and the pointing hand go (docs/MAP_DESIGN.md §5).
// Pure geometry in stage px (1280 × 720), no DOM. The mockup (index.html) and the checker (check.ts) both use it, and
// the implementation ports it to src/ui/mapLayout.ts as it is (types added), so the numbers checked here are the ones
// the game draws.
//
// The idea in one line: every row of the path is a line of slots; the glowing stone's slot also holds the ninja's
// place (on the side the path comes from) and a clear margin on the other side, and whatever room is left is shared
// out evenly between the stones. So the ninja always stands on the path just before the glowing stone, facing it,
// and its box can't touch the stone's box: they are side by side, GAP px apart, by construction.
(function (root) {
  const STAGE = { w: 1280, h: 720 };
  /** a row's stones and the ninja's place stay inside x 64–1104: clear of the side column (x ≥ 1146), the Help zone
   *  (x ≥ 1116, y ≥ 556) and the screen's edges */
  const EXT = { l: 64, r: 1104 };
  /** a row low on the screen (its centre line at y ≥ 520) ends sooner, at x 1050, so the glowing stone and its light
   *  never crowd Sensei's Help button (bottom-right; a dojo stone shows Sensei too) */
  const EXT_LOW_R = 1050;
  const extOf = (type, r) => ({ l: EXT.l, r: TYPES[type].rows[r] >= 520 ? EXT_LOW_R : EXT.r });
  /** the hero idle sprites are 640 × 858 */
  const SPRITE_ASPECT = 858 / 640;
  /** the ninja's box ↔ the glowing stone's box. Covers the stone's bounce (scale 1.05: 3.75–4.25 px a side) */
  const GAP = 12;
  /** the glowing stone's tap circle reaches this far past its disc (its light invites taps); less than GAP, so it never
   *  reaches the ninja's box */
  const NEXT_RING = 10;
  /** the ninja's box ↔ the stone behind it (or the row's end) */
  const GAP_BACK = 14;
  /** extra room on the glowing stone's other side, so its nearest neighbour ahead isn't crowding it */
  const CLEAR = 30;
  /** the ninja's feet stand this far below the path's centre line (on the path, not floating) */
  const FEET = 20;
  /** the glowing stone's bounce (transform only): up this many px, and scale */
  const BOUNCE = { up: 10, scale: 1.05 };
  /** the stage scale on the smallest phone we support (667 × 375 with the touch insets: (375 − 36) / 720) */
  const MIN_SCALE = (375 - 36) / 720;

  /** by row count: row centre lines, the path's wobble, and sizes (visible diameters; `doneHit` is a finished stone's
   *  tap circle, ≥ 44 CSS px at MIN_SCALE) */
  const TYPES = {
    1: { rows: [470], amp: 80, next: 170, done: 92, doneHit: 104, boss: 104, locked: 70, ninjaW: 124, hand: 110 },
    2: { rows: [560, 330], amp: 10, next: 160, done: 88, doneHit: 100, boss: 100, locked: 66, ninjaW: 116, hand: 106 },
    3: { rows: [596, 416, 244], amp: 4, next: 150, done: 80, doneHit: 96, boss: 92, locked: 60, ninjaW: 100, hand: 100 },
  };
  /** 1 row up to 7 stones, 2 rows up to 16, then 3 (Bamboo Village's 20) */
  const rowCount = (n) => (n <= 7 ? 1 : n <= 16 ? 2 : 3);

  /** the path's centre line at x on row r (a gentle wobble; one row: a long S) */
  function pathY(type, r, x) {
    const T = TYPES[type];
    const t = (x - EXT.l) / (EXT.r - EXT.l); // (the wobble's phase runs over the full width, so rows line up)
    if (type === 1) return T.rows[0] + Math.sin(t * Math.PI * 2.2 + 0.4) * T.amp;
    return T.rows[r] + Math.sin(t * Math.PI * 2) * T.amp;
  }

  /**
   * @param levels  the land's levels in path order: { id, kind, … }
   * @param state   (i) => "next" | "done" | "locked" | "open"   ("open": playable but not finished, e.g. Unlock every level)
   * @returns { type, stones, next, ninja, hand, rows }
   *   stones[i] = { i, id, kind, state, row, dir, x, y, size, hit }   (hit: the tap circle's diameter; 0 = not tappable)
   *   next      = the glowing stone (or null on a land without it)
   *   ninja     = { side, face, box: {l,t,r,b}, feet: {x,y}, w, h } (or null)
   *   hand      = { tip: {x,y}, rot, size, box, place }            (or null)
   */
  function layout(levels, state) {
    const n = levels.length;
    const type = rowCount(n);
    const T = TYPES[type];
    const per = type === 1 ? n : Math.ceil(n / type);
    const rows = [];
    for (let r = 0; r < type; r++) rows.push(levels.map((_, i) => i).slice(r * per, r === type - 1 ? n : (r + 1) * per));
    const ninjaW = T.ninjaW, ninjaH = Math.round(T.ninjaW * SPRITE_ASPECT);
    const stones = [];
    let next = null, ninja = null;
    rows.forEach((idx, r) => {
      const dir = r % 2 === 0 ? 1 : -1; // bottom row left→right, then snaking
      const items = idx.map((i) => {
        const l = levels[i];
        const st = state(i);
        const boss = l.kind === "boss";
        const size = st === "next" ? T.next : st === "locked" ? T.locked : boss ? T.boss : T.done;
        const hit = st === "next" ? T.next + 2 * NEXT_RING : st === "locked" ? 0 : Math.max(size, T.doneHit);
        // the glowing stone's slot also holds the ninja (behind it, on the side the path comes from) and a margin ahead
        const pre = st === "next" ? GAP_BACK + ninjaW + GAP : 0;
        const post = st === "next" ? CLEAR : 0;
        return { i, l, st, size, hit, pre, post };
      });
      const E = extOf(type, r);
      const L = E.r - E.l;
      const total = items.reduce((a, it) => a + it.pre + it.size + it.post, 0);
      const free = L - total;
      const spacer = items.length > 1 ? free / (items.length - 1) : 0;
      let u = items.length > 1 ? 0 : free / 2;
      for (const it of items) {
        u += it.pre;
        const cu = u + it.size / 2;
        u += it.size + it.post + spacer;
        const x = dir > 0 ? E.l + cu : E.r - cu;
        const y = pathY(type, r, x);
        const s = { i: it.i, id: it.l.id, kind: it.l.kind, monster: it.l.monster ?? null, warmup: it.l.warmup ?? null, state: it.st, row: r, dir, x: round(x), y: round(y), size: it.size, hit: it.hit };
        stones[it.i] = s;
        if (it.st === "next") {
          next = s;
          // the ninja: its box ends GAP px before the stone's box, on the path, facing the stone
          const R = it.size / 2;
          const l = dir > 0 ? x - R - GAP - ninjaW : x + R + GAP;
          const fx = l + ninjaW / 2;
          const fy = pathY(type, r, fx) + FEET;
          ninja = { side: -dir, face: dir, w: ninjaW, h: ninjaH, feet: { x: round(fx), y: round(fy) }, box: { l: round(l), r: round(l + ninjaW), t: round(fy - ninjaH), b: round(fy) } };
        }
      }
    });
    const hand = next ? placeHand(next, stones, T.hand) : null;
    return { type, rows, stones, next, ninja, hand, sizes: T };
  }

  /** The pointing hand (TapHint: its finger points up; the fingertip is at 48 %, 10 % of its box). It goes on the side
   *  AHEAD of the glowing stone (the ninja has the other side), fingertip on the stone's rim, and must not lie over any
   *  other stone a finger could tap. Candidates in order: below-ahead, beside-ahead, above-ahead. */
  function placeHand(next, stones, size) {
    const R = next.size / 2, d = next.dir;
    const cands = [
      { place: "below", tip: { x: next.x + d * R * 0.36, y: next.y + R * 0.52 }, rot: -d * 28 },
      { place: "beside", tip: { x: next.x + d * R * 0.62, y: next.y + R * 0.1 }, rot: -d * 80 },
      { place: "above", tip: { x: next.x + d * R * 0.36, y: next.y - R * 0.52 }, rot: 180 + d * 28 },
    ];
    let best = null;
    for (const c of cands) {
      const box = handBox(c.tip, c.rot, size);
      const inStage = box.l >= 0 && box.r <= STAGE.w && box.t >= 0 && box.b <= STAGE.h + 6;
      let worst = 0;
      for (const s of stones) if (s !== next && s.hit > 0) worst = Math.max(worst, circleRectDepth(s.x, s.y, s.hit / 2, box));
      const score = worst + (inStage ? 0 : 1000);
      const h = { ...c, tip: { x: round(c.tip.x), y: round(c.tip.y) }, size, box, overlap: round(worst) };
      if (score <= 0) return h;
      if (!best || score < best.score) best = { ...h, score };
    }
    return best;
  }
  /** the painted hand's bounding box (the palm and fingers, 18–84 % × 6–92 % of its box), rotated about the fingertip */
  function handBox(tip, rot, size) {
    const fx = 0.48 * size, fy = 0.1 * size;
    const pts = [[0.18, 0.06], [0.84, 0.06], [0.84, 0.92], [0.18, 0.92]].map(([px, py]) => [px * size - fx, py * size - fy]);
    const a = (rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const xs = pts.map(([x, y]) => tip.x + x * c - y * s), ys = pts.map(([x, y]) => tip.y + x * s + y * c);
    return { l: round(Math.min(...xs)), r: round(Math.max(...xs)), t: round(Math.min(...ys)), b: round(Math.max(...ys)) };
  }

  /** how far a circle reaches into a rect (px; ≤ 0: clear by that much) */
  function circleRectDepth(cx, cy, r, b) {
    const nx = Math.max(b.l, Math.min(cx, b.r)), ny = Math.max(b.t, Math.min(cy, b.b));
    const inside = cx >= b.l && cx <= b.r && cy >= b.t && cy <= b.b;
    const d = Math.hypot(cx - nx, cy - ny);
    return inside ? r + Math.min(cx - b.l, b.r - cx, cy - b.t, b.b - cy) : r - d;
  }
  /** the overlap of two rects, as w × h (0 × 0 when apart) */
  function rectOverlap(a, b) {
    const w = Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)), h = Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
    return { w: round(w), h: round(h), area: round(w * h) };
  }
  /** the glowing stone's box at the extremes of its bounce (the union of rest and top) */
  function nextBox(next) {
    const R = next.size / 2, Rb = R * BOUNCE.scale;
    return { l: round(next.x - Rb), r: round(next.x + Rb), t: round(next.y - BOUNCE.up - Rb), b: round(next.y + R) };
  }
  /** the SVG path through the stones, split where the ninja stands: walked (solid) and ahead (faint) */
  function pathD(L) {
    const pts = L.stones.map((s) => [s.x, s.y]);
    const at = L.next ? L.next.i : pts.length - 1;
    const walked = pts.slice(0, at + 1), ahead = pts.slice(at);
    const d = (p) => p.map(([x, y], k) => `${k ? "L" : "M"}${x},${y}`).join(" ");
    return { walked: walked.length > 1 ? d(walked) : "", ahead: ahead.length > 1 ? d(ahead) : "" };
  }
  const round = (v) => Math.round(v * 10) / 10;

  const api = { STAGE, EXT, EXT_LOW_R, extOf, TYPES, NEXT_RING, GAP, GAP_BACK, CLEAR, FEET, BOUNCE, MIN_SCALE, SPRITE_ASPECT, rowCount, pathY, layout, placeHand, handBox, circleRectDepth, rectOverlap, nextBox, pathD };
  root.MapLayout = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
