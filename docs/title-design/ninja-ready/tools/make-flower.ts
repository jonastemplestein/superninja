// Renders the World Flower's bloom for the "ninja-ready" title mockup to a transparent WebP, using the game's own
// geometry (src/scenes/Tree.tsx RING/HEART, src/ui/petal.ts teardrop) and petal colours (src/content/flower.ts).
// The outer ring (the consonants) is lit in rainbow order; the inner ring (the vowels) is still pale: a flower partly
// regrown, as on the site's hero. One <img> on the title instead of ~100 SVG nodes.
//   bun docs/title-design/ninja-ready/tools/make-flower.ts
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const OUT = join(import.meta.dir, "..", "art");
const vowels: [string, string][] = [["ae", "#e8312f"], ["ee", "#f5821f"], ["oy", "#f59ac0"], ["ie", "#f3c74a"], ["oe", "#f7a23b"], ["uu", "#f1e45c"], ["er", "#2fa65a"], ["ar", "#9ae29a"], ["ou", "#c42fd1"], ["oo", "#8a3be0"], ["ue", "#c77de8"], ["or", "#7a4a24"], ["air", "#6ec9f2"], ["e", "#23208f"], ["u", "#d9482b"], ["o", "#e0356f"], ["i", "#f7a23b"], ["eer", "#1f9a9c"], ["a", "#ff6b5b"], ["schwa", "#a08a74"]];
const cons: [string, string][] = [["s", "#ee2e63"], ["l", "#6b1d73"], ["f", "#1e5f2e"], ["d", "#e8312f"], ["n", "#ece22a"], ["v", "#1f8a33"], ["j", "#4fe34f"], ["g", "#3a37b8"], ["m", "#7cc3f0"], ["h", "#8c1fa8"], ["k", "#c77de8"], ["r", "#f0226b"], ["t", "#c4671f"], ["z", "#c9ec5a"], ["p", "#ff8fb8"], ["b", "#4a7dff"], ["w", "#2ec4b6"], ["y", "#ffc53d"], ["sh", "#5ec8f2"], ["ch", "#f59b2b"], ["th", "#9b6cf0"], ["dh", "#6d4fd8"], ["ng", "#e56bd1"], ["zh", "#c98a00"]];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
function hue(h: string) {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (mx < 0.25 || d / (mx || 1) < 0.25) return 2;
  const x = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return x / 6;
}
const teardrop = (w: number, h: number) => {
  const r = w / 2, cy = -h / 2 + r;
  const P = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  return `M${P(0, h / 2)} C${P(-w * 0.12, h * 0.28)} ${P(-r, h * 0.06)} ${P(-r, cy)} A${r},${r} 0 0 1 ${P(r, cy)} C${P(r, h * 0.06)} ${P(w * 0.12, h * 0.28)} ${P(0, h / 2)} Z`;
};
const RING = [{ r0: 92, len: 176, w: 66, off: 0 }, { r0: 190, len: 252, w: 98, off: 360 / 48 }];
const rings = [vowels.sort((a, b) => hue(a[1]) - hue(b[1])), cons.sort((a, b) => hue(a[1]) - hue(b[1]))];
let defs = "", body = "";
const petal = (ri: number, i: number, p: string, col: string, lit: boolean) => {
  const g = RING[ri], a = (i / rings[ri].length) * 360 + g.off, d = teardrop(g.w, g.len);
  if (lit) defs += `<linearGradient id="g-${p}" x1=".5" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="${mix(col, "#ffffff", 0.42)}"/><stop offset=".55" stop-color="${col}"/><stop offset="1" stop-color="${mix(col, "#2b1d14", 0.18)}"/></linearGradient>`;
  const fill = lit ? `url(#g-${p})` : mix(col, "#fffaf0", 0.86);
  const stroke = lit ? "#2b1d14" : mix(col, "#e6cfa4", 0.7);
  return `<g transform="rotate(${a}) translate(0 ${-(g.r0 + g.len / 2)})"><path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${lit ? 5 : 4}"/>${lit ? `<ellipse cx="${-g.w * 0.16}" cy="${-g.len / 2 + g.w * 0.36}" rx="${g.w * 0.13}" ry="${g.w * 0.24}" fill="#fff" opacity=".55" transform="rotate(-18 ${-g.w * 0.16} ${-g.len / 2 + g.w * 0.36})"/>` : ""}</g>`;
};
body += `<circle r="458" fill="none" stroke="#ffe08a" stroke-width="6" opacity=".85"/>`;
body += `<g filter="url(#lit)">` + rings[1].map(([p, c], i) => petal(1, i, p, c, true)).join("") + `</g>`;
body += rings[0].map(([p, c], i) => petal(0, i, p, c, false)).join("");
const HEART = 104;
body += Array.from({ length: 28 }, (_, i) => `<circle cx="${Math.sin((i / 28) * Math.PI * 2) * (HEART + 10)}" cy="${-Math.cos((i / 28) * Math.PI * 2) * (HEART + 10)}" r="7" fill="#ffd35a" stroke="#2b1d14" stroke-width="2.5"/>`).join("");
body += `<circle r="${HEART}" fill="url(#heart)" stroke="#2b1d14" stroke-width="6"/><ellipse cx="-30" cy="-38" rx="34" ry="20" fill="#fff" opacity=".6" transform="rotate(-25 -30 -38)"/>`;
defs += `<radialGradient id="heart" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".55" stop-color="#ffc53d"/><stop offset="1" stop-color="#e08a12"/></radialGradient>`;
defs += `<filter id="lit" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-480 -480 960 960" width="1000" height="1000"><defs>${defs}</defs>${body}</svg>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
const png = join(OUT, "flower-bloom.png");
await p.locator("svg").screenshot({ path: png, omitBackground: true });
await b.close();
spawnSync("cwebp", ["-q", "82", "-alpha_q", "85", "-m", "6", "-resize", "760", "760", png, "-o", join(OUT, "flower-bloom.webp")], { stdio: "inherit" });
spawnSync("mkdir", ["-p", join(import.meta.dir, "..", "..", "..", "..", ".trash")]);
spawnSync("mv", [png, join(import.meta.dir, "..", "..", "..", "..", ".trash", `flower-bloom-${Date.now()}.png`)]);
console.log("wrote art/flower-bloom.webp");
