// Step 2: render motion-graphics cards (trailer/cards/card.html) to PNG sequences with Playwright.
// Frame-accurate: the page exposes seek(t); we call it for every frame and screenshot.
// Cached by hash of (card spec, duration, format, card.html + fonts).
import { chromium, type Browser } from "playwright";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Card } from "../../trailer/trailer.config";
import { CACHE, ensureDir, FPS, hashOf, log, p, type Placed } from "./lib";

export type Format = { name: "landscape" | "vertical"; w: number; h: number };
export const FORMATS: Record<Format["name"], Format> = {
  landscape: { name: "landscape", w: 1920, h: 1080 },
  vertical: { name: "vertical", w: 1080, h: 1920 },
};

const PAGE = p("trailer/cards/card.html");

export function cardDir(shot: Placed, fmt: Format): string {
  const card = shot.card!;
  const sprites = [card.sprite, card.sprite2].filter(Boolean) as string[];
  const h = hashOf({ card, frames: shot.frames, fmt, overlay: !!shot.video }, ["trailer/cards/card.html", "trailer/fonts/luckiest-guy.woff2", ...sprites]);
  return join(CACHE, "cards", `${shot.id}-${fmt.name}-${h}`);
}

export async function renderCards(shots: Placed[], fmts: Format[]) {
  const jobs: { shot: Placed; fmt: Format; dir: string }[] = [];
  for (const fmt of fmts) for (const s of shots) if (s.card) {
    const dir = cardDir(s, fmt);
    if (!existsSync(join(dir, "done"))) jobs.push({ shot: s, fmt, dir });
  }
  if (!jobs.length) return;
  const browser: Browser = await chromium.launch();
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < jobs.length) {
      const { shot, fmt, dir } = jobs[next++];
      log(`card ${shot.id} (${fmt.name}, ${shot.frames} frames)`);
      ensureDir(dir);
      const page = await browser.newPage({ viewport: { width: fmt.w, height: fmt.h }, deviceScaleFactor: 1 });
      const spec: Card & { dur: number } = { ...shot.card!, dur: shot.dur };
      await page.goto(pathToFileURL(PAGE).href + "#" + encodeURIComponent(JSON.stringify(spec)));
      await page.evaluate(() => (window as any).ready);
      for (let f = 0; f < shot.frames; f++) {
        await page.evaluate((t) => (window as any).seek(t), f / FPS);
        await page.screenshot({ path: join(dir, `${String(f).padStart(5, "0")}.png`), omitBackground: !!shot.video });
      }
      await page.close();
      writeFileSync(join(dir, "done"), String(readdirSync(dir).length));
    }
  }));
  await browser.close();
}
