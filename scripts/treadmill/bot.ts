// Shared bot brain: reads window.__snState and taps what a perfect child would tap. Used by smoke.ts and the treadmill.
import type { Page } from "playwright";
export const save = (extra = {}) => ({ v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, captionsV2: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra });

export async function step(page: Page) {
  const st: any = await page.evaluate(() => (window as any).__snState || {});
  const down = async (sel: string) => {
    const el = page.locator(sel).first();
    if (!(await el.count())) return false;
    // (short timeout: the screen may change between finding the button and tapping it)
    await el.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    return true;
  };
  if (st.scene === "tut-gong") return down('[aria-label="gong"]');
  if (st.scene === "tut-help") return down('[aria-label="Help"]');
  if (st.scene === "tut-speaker") return down('[aria-label="Hear it again"]');
  if (st.scene === "place-ask") return down('[aria-label="Show Sensei what I know"]');
  // the school-year opt-in (docs/FIRST_MINUTES.md §4): window.__botOptIn picks the answer ("none" by default, or
  // "unsure", "R", "Y1", "Y2"); a tap starts the 1.5 s settling ring, so tap once and let it settle
  if (st.scene === "optin") {
    if (!st.next || st.settling || st.chosen) return;
    const want: string = (await page.evaluate(() => (window as any).__botOptIn).catch(() => null)) ?? "none";
    const label = st.screen === "A" ? (want === "none" ? "teddy" : "school") : ({ R: "Reception", Y1: "Year One", Y2: "Year Two", unsure: "Not sure" } as Record<string, string>)[want] ?? "Reception";
    return down(`.oi [aria-label="${label}"]`);
  }
  // the warm-ups: a card, the tortoise or rabbit, a whole rail, a sound dot (never a card that is leaving)
  if (st.scene === "warmup") {
    if (!st.next) return;
    return (await down(`.wu .wu-slot:not(.out) [aria-label="${st.next}"]`)) || down(`.wu [aria-label="${st.next}"]`);
  }
  // the Sticker Book reward: tap the wiggling sticker, then the big green arrow
  if (st.scene === "stickers") return st.next ? down(`[aria-label="${st.next}"]`) : undefined;
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
  // the World Flower (Tree.tsx): its first-visit intro steps on with Next; a trip plays by itself, then carries on
  if (st.scene === "tree") {
    if (st.intro) return down('[data-modal] [aria-label="Next"]');
    if (st.done) return down('[aria-label="Carry on"]');
    return;
  }
  // the map (App.tsx WorldMap publishes it): nothing to answer; a case that wants a level taps its stone itself
  if (st.scene === "map") return;
  for (const l of ["Next page", "I read it!"]) if (await down(`button[aria-label="${l}"]`)) return true;
  const choices = page.locator("button.tile.lg");
  for (let k = (await choices.count()) - 1; k >= 0; k--) {
    const op = await choices.nth(k).evaluate((el) => getComputedStyle(el).opacity);
    if (op === "1") return choices.nth(k).dispatchEvent("pointerdown");
  }
  return down("button.card");
}

