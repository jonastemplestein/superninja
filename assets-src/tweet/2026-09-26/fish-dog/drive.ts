// Clip #4, "fish-dog": warm-up 2 (w1-wu2), "Ninjas read this way!". Sensei shows ("Let me show you!"): fish... dog,
// and the two pictures merge into a fish-dog; then "Your turn!" and the child taps fish, then dog, and makes the
// fish-dog themselves.
//
//   bun assets-src/tweet/2026-09-26/fish-dog/drive.ts <take>            records raw/fish-dog-<take>.master.mp4 (+ timeline, sheet)
//
// The drive, for the rig in scripts/tweet-clips.ts:
// - The warm-up starts talking as soon as the page loads, which is while the rig's head clapper is still flashing (a
//   white square bottom left, 12 kHz beeps), so "Ninjas read this way!" would start under it. So once the clapper is
//   done, the drive clears the browser's storage (so the init script writes the same fresh save again: the first load
//   turned it into a profile and noted what Sensei said) and reloads: the warm-up starts again from the top, clean. The
//   head claps still measured the picture delay over this same scene; the first load's sounds are not in the soundtrack
//   (the audio log is per document).
// - Taps like a child: only when window.__snState.next is set, about 1.1 s after it appears, on
//   .wu .wu-slot:not(.out) [aria-label=<next>]: the fish, then the dog. Then hands off.
import type { Page } from "playwright";
import { record, tweetSave, type Rig } from "../../../../scripts/tweet-clips";

export const SAVE = tweetSave({ schoolYear: "none", stickers: [], shiny: [], settings: { captions: true, music: 0.32, unlockAll: false } });
export const URL = "/play/?level=w1-wu2";

export async function drive(page: Page, rig: Rig, { pace = 1100, taps = 2 } = {}) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  rig.mark("reload");
  await page.reload({ waitUntil: "load", timeout: 60_000 });
  rig.mark("loaded");
  let seen: string | null = null, since = 0, n = 0;
  while (rig.live() && n < taps) {
    const st: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
    const next: string | null = st.scene === "warmup" && st.next ? st.next : null;
    if (next !== seen) {
      seen = next;
      since = Date.now();
    } else if (next && Date.now() - since >= pace) {
      await rig.tap(`.wu .wu-slot:not(.out) [aria-label="${next}"]`);
      n++;
      seen = null;
      // (let the game take the tap before looking again)
      await rig.wait(150);
      continue;
    }
    await rig.wait(40);
  }
}

if (import.meta.main) {
  const take = process.argv[2] ?? "take1";
  const outDir = "assets-src/tweet/2026-09-26/fish-dog/raw";
  const rec = await record({ name: `fish-dog-${take}`, url: URL, save: SAVE, seconds: 31, outDir, drive: (p, r) => drive(p, r), sheetEvery: 1 });
  const said = rec.events.filter((e) => ["speech", "tap", "mark", "hitch", "scene"].includes(e.kind)).map((e) => `${e.t.toFixed(2)} ${e.kind} ${e.id}${e.dur ? ` (${e.dur})` : ""}`);
  console.log(JSON.stringify({ master: rec.master, sheet: rec.sheet, game: rec.game, frames: rec.frames, sync: rec.sync, advice: rec.advice }, null, 1));
  console.log(said.join("\n"));
  process.exit(0);
}
