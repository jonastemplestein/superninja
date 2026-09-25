// Shared bot brain: reads window.__snState and taps what a perfect child would tap. Used by smoke.ts and the treadmill.
import type { Page } from "playwright";
export const save = (extra = {}) => ({ v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, captionsV2: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra });

export async function step(page: Page) {
  const st: any = await page.evaluate(() => (window as any).__snState || {});
  const down = async (sel: string) => {
    const el = page.locator(sel).first();
    if (!(await el.count())) return false;
    await el.dispatchEvent("pointerdown").catch(() => {});
    return true;
  };
  if (st.scene === "tut-gong") return down('[aria-label="gong"]');
  if (st.scene === "tut-help") return down('[aria-label="Help"]');
  if (st.scene === "tut-speaker") return down('[aria-label="Hear it again"]');
  if (st.scene === "place-ask") return down('[aria-label="Show Sensei what I know"]');
  if (st.scene === "read") {
    if (st.tapIdx != null) return down(`[aria-label="sound ${st.tapIdx}"]`);
    if (st.next) return down(`[aria-label="reader ${st.next}"]`);
    return;
  }
  if (st.scene === "pick" && st.next) return down(`.pick-row [aria-label="${st.next}"]`);
  if (["battle", "build", "find", "learn"].includes(st.scene) && st.next) return (await down(`.row button[aria-label="${st.next}"]`)) || down(`button[aria-label="${st.next}"]`);
  if (st.scene === "swap" && !st.busy) return st.picked == null ? down(`.slots .tile >> nth=${st.pos}`) : down(`.row .tile[aria-label="${st.next}"]`);
  if (st.scene === "sort" && st.next) return down(`button[aria-label="basket ${st.next}"]`);
  if (st.scene === "run") return page.evaluate(() => (window as any).__snRun?.());
  for (const l of ["Next page", "I read it!"]) if (await down(`button[aria-label="${l}"]`)) return true;
  const choices = page.locator("button.tile.lg");
  for (let k = (await choices.count()) - 1; k >= 0; k--) {
    const op = await choices.nth(k).evaluate((el) => getComputedStyle(el).opacity);
    if (op === "1") return choices.nth(k).dispatchEvent("pointerdown");
  }
  return down("button.card");
}

