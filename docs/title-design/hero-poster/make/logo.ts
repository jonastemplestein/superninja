// The title lockup, pre-rendered: "SUPER" gold over "NINJA" red in Luckiest Guy, as a die-cut sticker (gradient fill,
// ink line, cream rim, ink edge, a hard ink drop and a gloss), tilted -4 degrees. Rendering it once means the title never
// waits for the font (display=block hid the logo for ~1.5 s on 4G), and its alpha doubles as the glint's mask.
//
//   bun docs/title-design/hero-poster/make/logo.ts
//
// Writes logo.png (the lockup), logo-fill.png (the letters' fill only: the glint's mask) and play-word.png (Play's
// label) at 2x the stage size, next to index.html; make/pngs-to-webp.py turns them into .webp.
import { chromium } from "playwright";
import { join } from "node:path";

const OUT = join(import.meta.dir, "..");
// stage px: the lockup is ~560 x 330 on the 1280 x 720 stage
const html = (fillOnly: boolean) => `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=block" rel="stylesheet">
<style>html,body{margin:0;background:transparent} svg{display:block}</style></head><body>
<svg id="logo" width="640" height="430" viewBox="-20 -14 640 430" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6b8"/><stop offset=".32" stop-color="#ffd84a"/><stop offset=".7" stop-color="#ffb72e"/><stop offset="1" stop-color="#f08a12"/>
    </linearGradient>
    <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6a3d"/><stop offset=".35" stop-color="#ee4630"/><stop offset=".75" stop-color="#d9352a"/><stop offset="1" stop-color="#a8231c"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="#fff" stop-opacity=".12"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <filter id="drop" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="13" stdDeviation="0" flood-color="#2b1d14"/>
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#2b1d14" flood-opacity=".35"/>
    </filter>
  </defs>
  <g transform="rotate(-4 300 180)" font-family="Luckiest Guy" text-anchor="middle" stroke-linejoin="round" stroke-linecap="round">
    ${fillOnly ? "" : `
    <g filter="url(#drop)">
      <text x="300" y="148" font-size="136" letter-spacing="4" fill="#2b1d14" stroke="#2b1d14" stroke-width="42">Super</text>
      <text x="300" y="300" font-size="180" letter-spacing="4" fill="#2b1d14" stroke="#2b1d14" stroke-width="42">Ninja</text>
    </g>
    <text x="300" y="148" font-size="136" letter-spacing="4" fill="#fff4dc" stroke="#fff4dc" stroke-width="30">Super</text>
    <text x="300" y="300" font-size="180" letter-spacing="4" fill="#fff4dc" stroke="#fff4dc" stroke-width="30">Ninja</text>
    <text x="300" y="148" font-size="136" letter-spacing="4" fill="#2b1d14" stroke="#2b1d14" stroke-width="16">Super</text>
    <text x="300" y="300" font-size="180" letter-spacing="4" fill="#2b1d14" stroke="#2b1d14" stroke-width="16">Ninja</text>`}
    <text x="300" y="148" font-size="136" letter-spacing="4" fill="${fillOnly ? "#fff" : "url(#gold)"}">Super</text>
    <text x="300" y="300" font-size="180" letter-spacing="4" fill="${fillOnly ? "#fff" : "url(#red)"}">Ninja</text>
    ${fillOnly ? "" : `
    <text x="300" y="148" font-size="136" letter-spacing="4" fill="url(#gloss)">Super</text>
    <text x="300" y="300" font-size="180" letter-spacing="4" fill="url(#gloss)">Ninja</text>`}
  </g>
</svg></body></html>`;

// Play's word, pre-rendered too, so the button is whole at first paint (the fonts load with display=block)
const word = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=block" rel="stylesheet">
<style>html,body{margin:0;background:transparent} svg{display:block}</style></head><body>
<svg id="logo" width="360" height="170" viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Luckiest Guy" font-size="132" letter-spacing="4" stroke-linejoin="round">
    <text x="16" y="136" fill="#2b1d14" stroke="#2b1d14" stroke-width="13" transform="translate(0 9)">Play</text>
    <text x="16" y="136" fill="#fff" stroke="#2b1d14" stroke-width="13" paint-order="stroke fill">Play</text>
  </g>
</svg></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 760, height: 520 }, deviceScaleFactor: 2 });
for (const [name, fillOnly] of [["logo", false], ["logo-fill", true], ["play-word", null]] as const) {
  await page.setContent(fillOnly === null ? word : html(fillOnly), { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.load('100px "Luckiest Guy"');
    await document.fonts.ready;
  });
  await page.locator("#logo").screenshot({ path: join(OUT, `${name}.png`), omitBackground: true });
  console.log("wrote", `${name}.png`);
}
await browser.close();
