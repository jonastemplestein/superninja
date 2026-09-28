// Shared bot brain: reads window.__snState and taps what a perfect child would tap. Used by smoke.ts and the treadmill.
// Personas (window.__botPersona, set by the harness; unset is the default child): "watcher" taps the paw once at every
// Ready hold (TEACHER_SCRIPT §2.3: Show me again, then "Are you ready to have a go now?"); "splitter" splits two-letter
// spellings on purpose (FIX_PLAN §4.4 F4.4); every persona answers one hand-over Ready in three with a right-answer tap
// (TEACHER_SCRIPT §8.2 T4: it counts as ready and as the first answer). With no Ready holds on screen and no persona set,
// the bot does exactly what it always did. Every persona taps Move 1's live rabbit (TEACHER_SCRIPT §9.2) at once.
import type { Page } from "playwright";
import { clipMs } from "./durations";
export const save = (extra = {}) => ({ v: 1, hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, captionsV2: true, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: false, unlockAll: true }, minutes: 0, sessions: 1, ...extra });

/** A child part-way through Blossom Hills who has met ai and ay (the World Flower's petal detail and its trips). */
export const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});

/** Per page: the persona (read once), the Ready holds seen (did the watcher tap the paw yet?), how many hand-over
 *  Readies there have been, and the slots the splitter has already split. */
type Mind = { persona: string | null | undefined; pawed: Set<string>; handovers: number; answered: Set<string>; split: Set<string>; waiting: Map<string, number>; none: Set<string>; rabbitSince?: number; readyKey?: string; joinSince?: number; fast?: number };
const minds = new WeakMap<Page, Mind>();
const mindOf = (page: Page): Mind => {
  let m = minds.get(page);
  if (!m) minds.set(page, (m = { persona: undefined, pawed: new Set(), handovers: 0, answered: new Set(), split: new Set(), waiting: new Map(), none: new Set() }));
  return m;
};
/** The page's ?fast=N (game time runs N× faster), read once per page. */
async function fastOf(page: Page, m: Mind) {
  if (m.fast === undefined) m.fast = await page.evaluate(() => Number(new URLSearchParams(location.search).get("fast")) || 1).catch(() => 1);
  return Math.min(8, Math.max(1, m.fast ?? 1));
}

/** The first gesture, which lets the game start its audio (engine/audio.ts resumes on any pointerdown or keydown), made
 *  where no screen can take it: a pointerdown on <html>, which the window's capture listeners hear and no scene's
 *  handler does (they sit under the React root). A real click at the top of the screen landed on whatever was there:
 *  on the petal card's backdrop it closed the card before the case began (the sweep's tree-practise-tap, sound-display's
 *  tree-petal: verify round 1). The browser runs with --autoplay-policy=no-user-gesture-required, so no trusted gesture
 *  is needed. */
export async function unlockAudio(page: Page) {
  await page
    .evaluate(() => {
      const html = document.documentElement;
      html.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true }));
      html.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true }));
    })
    .catch(() => {});
}

async function personaOf(page: Page, m: Mind) {
  if (m.persona === undefined) m.persona = await page.evaluate(() => ((window as any).__botPersona as string | undefined) ?? null).catch(() => null);
  return m.persona;
}

/** A Ready hold (__snNav.pres.id "ready:<key>", F3's holdReady): the watcher's paw first; then, on one hand-over Ready in
 *  three, the right answer on the board (the scene publishes it as __snState.next, or `answer`, while the hold is up);
 *  otherwise the green arrow. */
async function readyStep(page: Page, st: any, nav: any, down: (sel: string) => Promise<boolean>) {
  const m = mindOf(page);
  const persona = await personaOf(page, m);
  const key = `${nav.pres.id}#${nav.pres.step ?? 0}`;
  // a child hears the Ready question start before tapping: on first sight of a hold, wait 300 ms (an instant tap at 0.0 s
  // cut the Ready line before it began, and no hold was recorded; D2 and D5's requests, integration 27 Sep)
  if (m.readyKey !== key) {
    m.readyKey = key;
    await page.waitForTimeout(300);
    return true;
  }
  if (persona === "watcher" && nav.show && !m.pawed.has(key)) {
    m.pawed.add(key);
    if (await down('[data-nav="show"]')) return true;
  }
  const handover = nav.ready?.handover === true || nav.handover === true || st.handover === true;
  const answer: string | undefined = st.answer ?? nav.ready?.answer ?? (typeof st.next === "string" ? st.next : undefined);
  if (handover && answer && !m.answered.has(key)) {
    m.answered.add(key);
    if (m.handovers++ % 3 === 0) {
      for (const sel of [`.wu .wu-slot:not(.out) [aria-label="${answer}"]`, `.pick-row [aria-label="${answer}"]`, `.row button[aria-label="${answer}"]`, `button[aria-label="${answer}"]`, `[aria-label="${answer}"]`])
        if (await down(sel)) return true;
    }
  }
  return down('[data-nav="next"]');
}

/** The tappable letter tiles a split can use: every tile button on screen (the Dojo's and Early's banks, the battle row,
 *  Sound Swap's choices), not only a `.row`'s. */
const SPLIT_TILES = "button.tile[aria-label], .row button[aria-label]";
/** How long the splitter waits for a slot's letters to be on screen (a demo, a held explanation, the row popping in)
 *  before it lets the slot go (real ms). While it waits it answers nothing, so the default bot can't answer the slot
 *  with a tap on a hidden tile first. */
const SPLIT_WAIT_MS = 8000;

/** The splitter: on the first try of a slot whose spelling has two or more letters (< sh >, < ai >, < tch >), tap a
 *  tile that is part of it (< s > for < sh >; < t > or < ch > for < tch >: the game's own `splitsSpelling`), wherever it is
 *  on screen. A slot counts as split only once a part was tapped: while no letter is visible yet it waits (up to
 *  SPLIT_WAIT_MS), and a bank with no part of the spelling in it is looked at again on the next step (it can change).
 *  Logged in window.__botSplits for continuous.ts. */
async function splitStep(page: Page, st: any): Promise<boolean> {
  // (only a spelling: a join-in's `next` is its label, "The word card", whose letters aren't a spelling to split; verify
  // round 2, sound-display's first splitter run tapped < o >, < a > and < d > "for" it)
  if (!/^[a-z]+(-[a-z]+)*$/.test(String(st.next ?? ""))) return false;
  const g = String(st.next).replace(/-/g, "");
  if (g.length < 2 || st.busy) return false;
  const m = mindOf(page);
  const slot = `${st.scene}|${st.word ?? st.step ?? ""}|${st.pos ?? ""}|${st.next}`;
  if (m.split.has(slot)) return false;
  const seen = await page
    .evaluate(([g, sel]) => {
      const vis = (el: Element) => {
        const r = el.getBoundingClientRect();
        if (r.width < 3 || r.height < 3 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
        for (let e: Element | null = el; e; e = e.parentElement) {
          const s = getComputedStyle(e);
          if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.3) return false;
        }
        return true;
      };
      const bank: string[] = [];
      let part: string | null = null;
      for (const el of document.querySelectorAll(sel)) {
        const l = el.getAttribute("aria-label") ?? "";
        if (!l || !/^[a-z]+$/.test(l) || !vis(el)) continue;
        bank.push(l);
        if (!part && l.length < g.length && g.includes(l) && !(el as HTMLButtonElement).disabled && !el.classList.contains("used") && !el.classList.contains("right")) part = l;
      }
      return { visible: bank.length, part, bank };
    }, [g, SPLIT_TILES] as const)
    .catch(() => null);
  if (!seen) return false;
  if (!seen.part) {
    if (seen.visible) {
      // the letters are up and none is part of < g >: nothing to split here (yet: look again next step). Noted once per
      // slot in window.__botSplitNone, so a run can say how many two-letter slots offered no part to split with.
      if (!m.none.has(slot)) {
        m.none.add(slot);
        await page.evaluate(([next, word, bank]) => ((window as any).__botSplitNone ??= []).push({ t: Date.now(), next, word, bank }), [st.next, st.word ?? null, seen.bank] as const).catch(() => {});
      }
      return false;
    }
    // no letter on screen yet: wait (answer nothing) until they show, or give the slot up
    const since = (m.waiting.get(slot) ?? m.waiting.set(slot, Date.now()).get(slot))!;
    if (Date.now() - since < SPLIT_WAIT_MS) return true;
    m.split.add(slot);
    return false;
  }
  const tile = seen.part;
  m.split.add(slot);
  const since = await page.evaluate(() => Date.now()).catch(() => Date.now());
  const el = page.locator(`button.tile[aria-label="${tile}"]:not(.used), .row button[aria-label="${tile}"]`).first();
  await el.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
  await page.evaluate(([tapped, next, word]) => ((window as any).__botSplits ??= []).push({ t: Date.now(), tapped, next, word }), [tile, st.next, st.word ?? null] as const).catch(() => {});
  // then listen to the whole correction before trying again, as a child would ("Keep going, ninja." · "That's… /s/ We
  // need… /sh/ It's two letters, but it's one sound." runs about 8 game seconds in a Dojo build, which takes a tap
  // at any time: a fixed wait cut it off)
  await quietAfter(page, since);
  return true;
}

/** Recorded clip lengths (game ms): durations.json, with the gapped slow words and newer clips measured (durations.ts). */
const lengthOf = (url: string) => {
  const m = url.match(/\/a\/([a-z])\/([^/?#]+)\.mp3/);
  return (m && clipMs(`${m[1]}/${decodeURIComponent(m[2])}`)) || 1500;
};
/** Wait until Sensei has said everything the tap at `since` (page ms) set off: the correction has started (a speech clip
 *  in window.__audioLog, or her caption) or 3 game seconds have gone by with nothing, then every clip since the tap has
 *  run its recorded length, her caption is down, the scene isn't busy, and 1.5 game seconds have passed with nothing
 *  new (the correction's clips follow each other within 0.5 s; a battle's "Which sound comes next?" comes 1.3 s after
 *  it, and is heard too). Without an audio log it goes by the caption alone. At most 20 game seconds. */
async function quietAfter(page: Page, since: number) {
  const fast = await page.evaluate(() => Number(new URLSearchParams(location.search).get("fast")) || 1).catch(() => 1);
  const g = (ms: number) => ms / Math.min(8, Math.max(1, fast));
  const start = Date.now();
  let heard = false;
  while (Date.now() - start < g(20_000)) {
    const s = await page
      .evaluate((since) => {
        const w = window as any;
        const log: any[] | null = Array.isArray(w.__audioLog) ? w.__audioLog : null;
        const clips: [string, number][] = [];
        for (let i = (log?.length ?? 0) - 1; i >= 0; i--) {
          const a = log![i];
          if (a.t < since) break;
          if (a.kind === "speech") clips.push([String(a.url), a.t]);
        }
        return { now: Date.now(), clips, talking: !!document.querySelector(".help-btn.talking"), busy: w.__snState?.busy === true };
      }, since)
      .catch(() => null);
    if (!s) return;
    heard ||= s.clips.length > 0 || s.talking;
    const end = Math.max(since, ...s.clips.map(([u, t]) => t + g(lengthOf(u))));
    const waiting = heard ? s.talking || s.busy || s.now < end + g(1500) : s.now < since + g(3000);
    if (!waiting) return;
    await page.waitForTimeout(g(250));
  }
}

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
  // Move 1 (TEACHER_SCRIPT §9.2, §9.6): the nav layer's rabbit is live while it waits for the child to push the word
  // fast (rabbitTap(): __snNav.speed.rabbit "live", `[data-fs="rabbit"].live`); tap it as a child would, once it has
  // grown (its finite animations done; at most 1.5 s), so the probes see it at its full size. (A warm-up's own rabbit is
  // the scene's answer: `st.next`, below.)
  const RABBIT = '[data-fs="rabbit"].live';
  if (nav?.speed?.rabbit === "live" || (await page.locator(RABBIT).count().catch(() => 0))) {
    const m = mindOf(page);
    const growing = await page
      .evaluate((sel) => {
        for (let e: Element | null = document.querySelector(sel) ?? document.querySelector('[data-fs="rabbit"]'); e && e !== document.body; e = e.parentElement)
          if (e.getAnimations().some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime as number))) return true;
        return false;
      }, RABBIT)
      .catch(() => false);
    // (and at least 1 s after it went live, so the prompt "Now tap the rabbit…" has started, as a child hears it: an
    // instant tap came before the prompt and the checks logged a rabbit tap with no prompt; C1's finding)
    const since = Date.now() - (m.rabbitSince ??= Date.now());
    if ((growing && since < 1500) || since < 1000) return true;
    m.rabbitSince = undefined;
    if ((await down(RABBIT)) || (await down('[data-fs="rabbit"]'))) return true;
  } else mindOf(page).rabbitSince = undefined; // (no live rabbit: the next one waits its second again)
  if (nav?.next === "ready" && typeof nav.pres?.id === "string" && nav.pres.id.startsWith("ready:")) return readyStep(page, st, nav, down);
  mindOf(page).readyKey = undefined; // (no Ready hold up: the next one, even with the same key, waits its 300 ms again)
  if (nav?.next === "ready" || (st.scene === "present" && st.canNext)) return (await page.locator('button[aria-label="Play again"]').count()) ? undefined : down('[data-nav="next"]');
  // the World Flower's petal join-ins (Intros.tsx useJoin: "Tap it, and hear its sound.", "Tap the petal, and say it with
  // me."): the waiting petal's box is marked data-join="petal", and it is the child's to tap while the step still plays
  // (Next waits on it), so this comes before the wait below, which had returned first: no bot ever tapped one (verify
  // round 1). A child hears the ask first: the tap comes once Sensei has stopped talking, at least 0.3 s after the petal
  // went live, and at most 5 game seconds after (at 8 s the petal says its own sound).
  if (st.scene === "tree" && (await page.locator('[data-join="petal"] button').count().catch(() => 0))) {
    const m = mindOf(page);
    const g = 1000 / (await fastOf(page, m));
    const since = Date.now() - (m.joinSince ??= Date.now());
    const talking = await page.locator(".help-btn.talking").count().catch(() => 0);
    if (since < 300 || (talking && since < 5 * g)) return true;
    m.joinSince = undefined;
    if (await down('[data-join="petal"] button')) return true;
  } else mindOf(page).joinSince = undefined;
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
  // the splitter: a building or spelling slot's first try splits its two-letter spelling (only with the persona set)
  if ((["battle", "build"].includes(st.scene) || (st.scene === "swap" && st.picked != null)) && st.next && (await personaOf(page, mindOf(page))) === "splitter" && (await splitStep(page, st))) return true;
  if (["battle", "build", "find", "learn"].includes(st.scene) && st.next) return (await down(`.row button[aria-label="${st.next}"]`)) || down(`button[aria-label="${st.next}"]`);
  if (st.scene === "swap" && !st.busy) return st.picked == null ? down(`.slots .tile >> nth=${st.pos}`) : down(`.row .tile[aria-label="${st.next}"]`);
  // (Sorting: only once the word is the child's to sort, and re-read just before the tap, so a stale answer from before
  // the awaits above never lands on the next word: D4's request)
  if (st.scene === "sort" && st.next && !st.busy) {
    const now: any = await page.evaluate(() => (window as any).__snState || {}).catch(() => ({}));
    if (now.scene !== "sort" || now.next !== st.next || now.busy) return true;
    return down(`button[aria-label="basket ${st.next}"]`);
  }
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
  // (a petal join-in, "Tap the petal…": data-join="petal" marks the waiting petal; tap it as a child would: B3's request)
  // (a join-in's tap is above, before the held step's wait)
  if (st.scene === "tree") return;
  // the map (App.tsx WorldMap publishes it): nothing to answer; a case that wants a level taps its stone itself
  if (st.scene === "map") return;
  for (const l of ["Next page", "I read it!"]) if (await down(`button[aria-label="${l}"]`)) return true;
  // the last big choice that is fully shown: looked at in one evaluate and tapped with a short timeout. (It was a count,
  // then a locator evaluate per choice with Playwright's 30 s default: when the choices left between the two, as Ninja
  // Eyes' tiles do when the dojo goes on to Word Building, the bot hung for 30 s, 2 game minutes at 4×, while the game
  // waited on the child and its idle ladder spoke: D1's and verify round 1's fs-talk failures of 38 s.)
  const k = await page
    .evaluate(() => {
      const cs = [...document.querySelectorAll("button.tile.lg")];
      for (let i = cs.length - 1; i >= 0; i--) if (getComputedStyle(cs[i]).opacity === "1") return i;
      return -1;
    })
    .catch(() => -1);
  if (k >= 0) return page.locator("button.tile.lg").nth(k).dispatchEvent("pointerdown", undefined, { timeout: 800 }).then(() => true, () => false);
  return down("button.card");
}
