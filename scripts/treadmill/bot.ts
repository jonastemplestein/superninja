// Shared bot brain: reads window.__snState and taps what a perfect child would tap. Used by smoke.ts and the treadmill.
import type { Page } from "playwright";
export const save = (extra = {}) => ({ v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, captionsV2: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra });

/** A child part-way through Blossom Hills who has met ai and ay (the World Flower's petal detail and its trips). */
export const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});

export async function step(page: Page) {
  const st: any = await page.evaluate(() => (window as any).__snState || {});
  const down = async (sel: string) => {
    const el = page.locator(sel).first();
    if (!(await el.count())) return false;
    // (short timeout: the screen may change between finding the button and tapping it)
    await el.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    return true;
  };
  // a held step (docs/NAVIGATION.md: nothing moves on by itself): once the step has finished, the child has watched it
  // and taps the green arrow; while it is still playing, watch. src/ui/nav.tsx publishes __snNav (the nav layer) and a
  // presentation publishes __snState { scene: "present", canNext }.
  // (A level's end holds on Next with "Play again" beside it: the harness ends its case there, so the bot leaves it.)
  const nav: any = await page.evaluate(() => (window as any).__snNav ?? null).catch(() => null);
  if (nav?.next === "ready" || (st.scene === "present" && st.canNext)) return (await page.locator('button[aria-label="Play again"]').count()) ? undefined : down('[data-nav="next"]');
  if ((nav?.pres && nav.next === "wait") || st.scene === "present") return;
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
  // the picture games (Early.tsx usePickGame): answer once the question has been asked (busy false), as a child who
  // listens would; an eager tap during the question would also count, but then the sweep never sees the turn wait
  if (st.scene === "pick") return st.next && !st.busy ? down(`.pick-row [aria-label="${st.next}"]`) : undefined;
  // Choose your ninja (App.tsx): Kai; the Next rule above goes on once "Great choice!" has been said
  if (st.scene === "choose") return st.next ? down('[aria-label="kai"]') : undefined;
  if (["battle", "build", "find", "learn"].includes(st.scene) && st.next) return (await down(`.row button[aria-label="${st.next}"]`)) || down(`button[aria-label="${st.next}"]`);
  if (st.scene === "swap" && !st.busy) return st.picked == null ? down(`.slots .tile >> nth=${st.pos}`) : down(`.row .tile[aria-label="${st.next}"]`);
  if (st.scene === "sort" && st.next) return down(`button[aria-label="basket ${st.next}"]`);
  // the Ninja Run: fly at the right lantern (a child taps it on the canvas); the transcript's tap log (__taps, when it
  // is recording) gets the tap the bot's shortcut skips
  if (st.scene === "run")
    return page.evaluate(() => {
      const w = window as any;
      const r = w.__snRun?.();
      if (r?.flew && Array.isArray(w.__taps)) w.__taps.push({ t: Date.now(), label: `lantern "${r.flew}"`, nav: null });
      return r;
    });
  // the World Flower (Tree.tsx): its intro and trips are held steps (the Next rule above); a finished trip holds on Next
  // too, which the sweep's tree cases stop at before the bot would tap it
  if (st.scene === "tree") return;
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

