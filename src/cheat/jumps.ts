// The cheat menu's jumps (docs/CHEATS.md): every place in the game, with the save state it needs and the module state
// the screen reads as it opens. A jump commits its save edit (actions.ts commit: store.set, then store.flush), then goes
// there with App's own go() (window.__sn, in-app: the sound stays unlocked), or reloads the page on its deep link. A
// jump whose screen needs more than its deep link says (module state, a map's land or intro, the opt-in's mode) always
// goes in-app (inAppOnly).
import { store, levelGains, levelNewWords, resetLevelGains, ENERGY_FULL, type Save } from "../engine/store";
import { LEVELS, WORLDS, MILESTONES, levelById, levelWords, makeReview, startFor, startLevelAfter, worldOf, type Level } from "../content/worlds";
import { GAMES, gamesOfLevel, type GameId } from "../content/games";
import { gemByKey } from "../content/flower";
import { FAST } from "../engine/fast";
import { frontier, makeTrial, makePractice, placeAtUnit, canPractise, gemKeyOfTeach, gemState, knownNow, JUMP_OFFER } from "../engine/gems";
import { jumpOfferDue } from "../content/narrative";
import { WARMUPS } from "../content/warmups";
import { flushSync } from "react-dom";
import { visitFlower, focusGem } from "../scenes/Tree";
import { mapAnim } from "../App";
import { commit, IN_PLAY, spellingOf, withGameForm, type CheatSave, type GameForm } from "./actions";

/** The routes App's go() takes (App.tsx Route, which isn't exported). */
export type AppRoute =
  | { name: "title" | "intro" | "choose" | "picparade" | "placement" | "training" | "book" | "setup" | "profiles" | "grownups" | "finale" | "ninja-demo" | "nav-demo" }
  | { name: "optin"; mode?: "new" | "newyear" }
  | { name: "map"; world?: number; intro?: "stickerbook" | "welcome" | "super" | "again" }
  | { name: "level"; id: string }
  | { name: "reward"; id: string; stars: number; closing?: string }
  | { name: "tree"; celebrate?: { gem: string; won: boolean } };

export interface Jump {
  route: AppRoute;
  /** the save state the screen needs: edits a copy of the save, committed before going */
  save?: (s: CheatSave) => void;
  /** store functions to run after the save edit (placeAtUnit…); flushed before going */
  before?: () => void;
  /** module state the screen reads as it opens (a World Flower trip, a Gem Trial, the reward's gains): in-app only */
  prep?: () => void;
  /** the deep link a reload uses (default: from the route, when App's parser gives the route back: survivesReload);
   *  null: it only works in-app (module state) */
  url?: string | null;
  /** a URL the screen reads as it opens (the petal detail's &open=1), put up for the jump and taken down after */
  transient?: string;
  /** always reload: the screen reads the URL as the page loads (the film's shot, the ninja demo, ?fast) */
  reload?: boolean;
}

/** The deep link for a route (App.tsx reads ?level=, ?scene= and ?scene=reward&id=&stars= as the page loads). */
export function urlOf(r: AppRoute): string {
  if (r.name === "level") return `?level=${encodeURIComponent(r.id)}`;
  if (r.name === "reward") return `?scene=reward&id=${encodeURIComponent(r.id)}&stars=${r.stars}${r.closing ? `&closing=${encodeURIComponent(r.closing)}` : ""}`;
  return `?scene=${r.name}`;
}
/**
 * Does App's deep-link parser give this route back as the page loads? It reads ?level=, ?trial=, ?practise=, ?scene=<name>
 * and ?scene=reward&id=&stars=[&closing=] (App.tsx, the route's first state), and nothing else: not a map's land or its
 * intro, the opt-in's mode, or a World Flower celebration. (jumps.test.ts checks App still reads only those.)
 */
export function survivesReload(r: AppRoute): boolean {
  if (r.name === "map") return r.world === undefined && r.intro === undefined;
  if (r.name === "optin") return r.mode === undefined;
  if (r.name === "tree") return r.celebrate === undefined;
  return true;
}
/** A jump that always goes in-app, even with "Reload the page on jump" on: its screen reads module state (url: null), or
 *  its route has more in it than its deep link can carry. */
export const inAppOnly = (j: Jump): boolean => !j.reload && (j.url === null || (j.url === undefined && !survivesReload(j.route)));
/** A land's map: without `world` when it is the next stone's land (the map's default), so its deep link carries it. */
const mapOf = (world: number, s: Save = store.get()): AppRoute => (world === frontier(s).world ? { name: "map" } : { name: "map", world });

/** Keep the page's speed across a reload (FAST is read as the page loads). */
const withFast = (q: string) => (FAST > 1 && !/[?&]fast=/.test(q) ? `${q}${q ? "&" : "?"}fast=${FAST}` : q);

/** A route App has no screen for: it renders only the stage (runJump leaves a screen through it). */
const LEAVE = { name: "cheat-leave" } as unknown as AppRoute;
/** The screen on show now, and its id (App publishes window.__snRoute: "level:w2-1", "map", …). */
const here = () => String((window as unknown as { __snRoute?: string }).__snRoute ?? "").split(":");
const routeName = () => here()[0];

/**
 * Go. The save edit is committed first (so a reload starts from it, and the screen reads it as it opens). In-app
 * (the default, when App has published window.__sn): the module state is set, the address bar is changed to the jump's
 * deep link (a reload replays it), and App's go() changes screen. `reload`: the page is reloaded on the deep link
 * instead, which also clears every in-memory cache (the letters said this session, the streak, the trips pending); a
 * jump the deep link can't carry (inAppOnly) goes in-app all the same.
 */
export function runJump(j: Jump, o: { reload?: boolean } = {}): "in-app" | "reload" {
  if (j.save) {
    const next = structuredClone(store.get()) as CheatSave;
    j.save(next);
    commit(next);
  }
  if (j.before) {
    j.before();
    store.flush();
  }
  const sn = (window as unknown as { __sn?: { go?: (r: AppRoute) => void } }).__sn;
  const deep = j.url ?? urlOf(j.route);
  if (j.reload || (o.reload && !inAppOnly(j)) || typeof sn?.go !== "function") {
    store.flush();
    location.assign(location.pathname + withFast(deep));
    return "reload";
  }
  // the same screen again (a reward from a reward, the Sticker Book from the Sticker Book): App keys only some screens on
  // its fade count (Reward isn't, App.tsx 242), and one it doesn't would keep what it read as it first opened. So leave
  // it first, for a route that shows nothing, rendered at once, and only then set the module state the new one reads.
  const go = sn.go;
  if (routeName() === j.route.name) flushSync(() => go(LEAVE));
  j.prep?.();
  const path = location.pathname;
  try {
    history.replaceState(history.state, "", path + withFast(j.transient ?? deep));
  } catch {}
  go(j.route);
  // the screen has read its transient URL in its first render: put the plain link back, so a later visit doesn't
  if (j.transient) setTimeout(() => history.replaceState(history.state, "", path + withFast(deep)), 1200);
  return "in-app";
}

/** The deep link for the screen on show now; a Gem Trial, a practice or Sensei's Challenge (one-off levels) comes back
 *  as the map. */
export function hereUrl(): string {
  const [name, id] = here();
  if (name === "level") return id && id !== "trial" && id !== "review" ? `?level=${encodeURIComponent(id)}` : "?scene=map";
  if (name === "reward") return id && id !== "trial" && id !== "review" ? `?scene=reward&id=${encodeURIComponent(id)}&stars=3` : "?scene=map";
  return name ? `?scene=${name}` : "";
}
/** Reload the page on this screen, at `fast` speed (default: the speed it has now; 1 turns it off). */
export function reloadHere(fast = FAST) {
  store.flush();
  const q = hereUrl();
  location.assign(location.pathname + (fast > 1 ? `${q}${q ? "&" : "?"}fast=${fast}` : q));
}

// ---------------------------------------------------------------- save edits the jumps share
/** A player who has chosen a ninja and seen the film. */
const player = (s: CheatSave) => {
  s.hero ??= "kai";
  s.seenIntro = true;
};
/** Playing outside the first session: no cut lessons, no first check, the usual rewards. */
const inGame = (s: CheatSave) => {
  player(s);
  s.seenTraining = true;
  s.seenPlacement = true;
  s.firstSession = null;
};
/** The gem's spelling met, so the gem shows its letters (added to `petals` only when the child doesn't know it yet). A
 *  gem already won stays won, and keeps its energy; `energy` sets the energy of a gem that isn't won. */
const metGem = (s: CheatSave, key: string, energy?: number) => {
  const g = gemByKey(key);
  if (!g) return;
  if (!knownNow(s).has(spellingOf(g))) s.petals.push(spellingOf(g));
  if (energy !== undefined && !s.gems.includes(key)) s.energy[key] = energy;
};
/** The gem met and NOT won: only for the screens that are about winning it (its Gem Trial, a practice for it, the trial
 *  lost, a reward's gem filling up to glow when the level has no gem left to win). The others leave a won gem won. */
const unwonGem = (s: CheatSave, key: string, energy?: number) => {
  s.gems = s.gems.filter((k) => k !== key);
  metGem(s, key, energy);
};
/** A look at the gem (the scroll, its petal): the save as it is, unless the gem is hidden (its spelling not met), when it
 *  is met with the energy it has (half, if none), so there is a gem to look at. */
const lookGem = (s: CheatSave, key: string) => {
  const g = gemByKey(key);
  if (g && gemState(g, s) === "hidden") metGem(s, key, s.energy[key] ?? ENERGY_FULL / 2);
};

// ---------------------------------------------------------------- levels
/** A level, as the map's stone plays it. `band`: a warm-up's version (W: preschool, R: Reception). */
export function levelJump(id: string, o: { band?: "W" | "R" } = {}): Jump {
  return {
    route: { name: "level", id },
    save: (s) => {
      inGame(s);
      if (o.band && levelById(id)?.warmup) s.band = o.band;
    },
  };
}
/** The level that plays a game type first (a warm-up game only in the Reception version: that version). */
export function levelOfGame(id: GameId): { level: Level; band?: "R" } | null {
  const l = LEVELS.find((x) => gamesOfLevel(x).includes(id));
  if (l) return { level: l };
  const r = LEVELS.find((x) => gamesOfLevel(x, { school: true }).includes(id));
  return r ? { level: r, band: "R" } : null;
}
/** A game type's introduction in one form (the ledger edited, actions.ts gameEntry), then the first level that plays it
 *  (a Gem Trial for `trial`, Sensei's Challenge for `review`). */
export function gameJump(id: GameId, form: GameForm, gem: string): Jump | null {
  const edit = (s: CheatSave) => Object.assign(s, withGameForm(s, form, [id]));
  if (id === "trial") {
    const t = trialJump(gem);
    return { ...t, save: (s) => (t.save?.(s), edit(s)) };
  }
  if (id === "review") return { ...reviewJump(), save: (s) => (inGame(s), edit(s)) };
  const at = levelOfGame(id);
  if (!at) return null;
  const j = levelJump(at.level.id, { band: at.band });
  return { ...j, save: (s) => (j.save?.(s), edit(s)) };
}
/** Sensei's Challenge: a review battle over everything so far (the map's target button). */
export const reviewJump = (): Jump => ({ route: { name: "level", id: "review" }, save: inGame, prep: () => void makeReview(frontier()), url: "?level=review" });
/** A Gem Trial for one gem (its gem full, glowing on the World Flower). */
export const trialJump = (key: string): Jump => ({
  route: { name: "level", id: "trial" },
  save: (s) => (inGame(s), unwonGem(s, key, ENERGY_FULL)),
  prep: () => void makeTrial(key),
  url: `?trial=${encodeURIComponent(key)}`,
});
/** The petal detail's Practise: a short practice dojo for one gem. */
export const practiceJump = (key: string): Jump => ({
  route: { name: "level", id: "trial" },
  save: (s) => (inGame(s), unwonGem(s, key)),
  prep: () => void makePractice(key),
  url: `?practise=${encodeURIComponent(key)}`,
});
export const canPractiseNow = (key: string, s: Save = store.get()) => {
  const c = structuredClone(s) as CheatSave;
  unwonGem(c, key);
  return canPractise(key, c);
};

// ---------------------------------------------------------------- the catalogue
export interface JumpItem {
  id: string;
  label: string;
  note?: string;
  /** the jump; a string says why it can't be made from this save (the menu shows it); null: not possible */
  jump: () => Jump | string | null;
}
export interface JumpGroup {
  title: string;
  items: JumpItem[];
}
const FILM_SHOTS = 8;
/** A date in each school term, for the first-session starts (startFor reads the term from the date). */
const termDate = (term: "autumn" | "spring" | "summer") => {
  const y = new Date().getFullYear();
  return new Date(y, term === "autumn" ? 9 : term === "spring" ? 1 : 4, 1);
};
/** The first session from the opt-in: the start point's placement (placeAtUnit), its two lessons chained, lesson 1 (a cut
 *  lesson on a school path, with the first check); Training counts as seen. */
function firstSession(year: "none" | "R" | "Y1" | "Y2", term?: "autumn" | "spring" | "summer"): Jump {
  const start = startFor(year, term ? termDate(term) : undefined);
  return {
    route: { name: "level", id: start.lessons[0] },
    save: (s) => {
      player(s);
      Object.assign(s, { schoolYear: year, schoolYearAt: Date.now(), band: start.band, seenPlacement: true, seenTraining: true, firstSession: { lessons: start.lessons, step: 0 } });
    },
    before: () => start.unit > 0 && placeAtUnit(start.unit),
  };
}
/** Reward 1 and Reward 2 of the preschool first session (the Sticker Book arrives; the shiny fish-dog and the first
 *  petal). */
function firstReward(n: 1 | 2): Jump {
  const lessons: [string, string] = ["w1-wu1", "w1-wu2"];
  return {
    route: { name: "reward", id: lessons[n - 1], stars: 3 },
    save: (s) => {
      player(s);
      Object.assign(s, { band: "W", schoolYear: s.schoolYear ?? "none", firstSession: { lessons, step: n - 1 }, seenBook: n === 2 });
      s.shiny = (s.shiny ?? []).filter((w) => w !== "fishdog");
      if (n === 2) {
        s.petals = s.petals.filter((g) => g !== "s");
        // the book opens on the six stickers collected last (Stickers.tsx `prior`): make them lesson 1's, moved to the end
        // of the collection's order (none is taken away; a save with more stickers shows one of its own in the sixth slot)
        const w1 = WARMUPS.W1.stickers;
        s.stickers = [...(s.stickers ?? []).filter((w) => !w1.includes(w)), ...w1];
      }
    },
  };
}
/** A later level's reward. `show`: nothing new (its trophy); new stickers with two gems filling past half; a gem filling
 *  up to glowing (the World Flower button). The gems are the level's that aren't won; a won gem is never shown filling,
 *  except that "a gem glows" un-wins the level's first gem when every one of them is won (the button is its point). */
function rewardJump(id: string, show: "trophy" | "stickers" | "ready"): Jump {
  const l = levelById(id);
  const all = [...new Set([...(l.teach ?? []).map(gemKeyOfTeach), ...levelWords(l).flatMap((w) => w.segs.map((sg) => `${sg.g}>${sg.p}`))])].filter((k) => IN_PLAY.some((g) => g.key === k));
  const won = new Set(store.get().gems);
  const open = all.filter((k) => !won.has(k));
  const gems = show === "trophy" ? [] : show === "ready" ? (open.length ? open : all).slice(0, 1) : open.slice(0, 2);
  const words = levelWords(l).map((w) => w.text).slice(0, 3);
  return {
    route: { name: "reward", id, stars: 3 },
    save: (s) => {
      inGame(s);
      for (const k of gems) unwonGem(s, k, show === "ready" ? ENERGY_FULL : ENERGY_FULL * 0.625);
      // the level's new words, as recordRead leaves them: read right once, already in the Sticker Book (the reward flies
      // them in and counts up to the book's total)
      if (show === "stickers")
        for (const w of words) {
          s.words[w] = { n: 1, ok: 1, last: Date.now(), met: Date.now() };
          if (!s.stickers.includes(w)) s.stickers.push(w);
        }
    },
    prep: () => {
      resetLevelGains();
      if (show === "trophy") return;
      if (show === "stickers") levelNewWords.push(...words);
      for (const k of gems) levelGains[k] = 3;
    },
    url: show === "trophy" ? undefined : null,
  };
}
/** The first level of the furthest place Jump ahead can take a child (a milestone's start level). */
const furthestJump = () => MILESTONES.map((m) => startLevelAfter(m.unit)).reduce((a, b) => (LEVELS.indexOf(b) > LEVELS.indexOf(a) ? b : a));
/**
 * Would the reward for the last level finished offer Jump ahead (engine/gems.ts shouldOfferJump, without its side
 * effects)? The last three levels with stars all have 3, a milestone starts past the next stone, a session past the
 * second, and the offer not made in the last two sessions. jumps.test.ts checks it against the game's own rule.
 */
export function offerHolds(s: Save): boolean {
  const last3 = LEVELS.filter((l) => (s.stars[l.id] ?? 0) > 0).slice(-3);
  const at = LEVELS.indexOf(frontier(s));
  const narr = (s as CheatSave).narr;
  return (
    last3.length === 3 && last3.every((l) => s.stars[l.id] === 3) && LEVELS.indexOf(furthestJump()) > at && jumpOfferDue(narr?.[JUMP_OFFER], s.sessions ?? 0)
  );
}
/**
 * The jump-ahead offer on a reward (Dec9): the reward of the last level finished, with the last three levels finished
 * set to 3 stars, sessions at least 3 and the offer forgotten. The warm-ups don't count: their reward is the sticker one,
 * which never offers Jump ahead, so the three are the last three finished that aren't warm-ups. A string (why) when no
 * edit of the stars can make the offer show: fewer than three of them finished, or no milestone left past the next
 * stone (from the End of Reception on, today's content has none).
 */
export function jumpOfferReward(s: Save = store.get()): Jump | string {
  const done = LEVELS.filter((l) => !l.warmup && (s.stars[l.id] ?? 0) > 0);
  if (done.length < 3) return `it needs three levels finished after the warm-ups (${done.length} so far): try a Mastery preset`;
  const last3 = done.slice(-3);
  const save = (x: CheatSave) => {
    inGame(x);
    for (const l of last3) x.stars[l.id] = 3;
    x.sessions = Math.max(3, x.sessions ?? 0);
    delete x.narr?.[JUMP_OFFER];
  };
  const next = structuredClone(s) as CheatSave;
  save(next);
  if (!offerHolds(next)) {
    const far = furthestJump();
    const f = frontier(next);
    const at = LEVELS.every((l) => (next.stars[l.id] ?? 0) > 0) ? "every level is finished" : `the next stone is ${f.id}`;
    return `Jump ahead goes no further than ${far.id}, and ${at}: it needs a save before ${far.id}`;
  }
  return { route: { name: "reward", id: last3[2].id, stars: 3 }, save, prep: () => resetLevelGains() };
}

/** Every screen, grouped. `gem`: the gem the World Flower's jumps are about; `level`: the level the rewards are for. */
export function catalogue(o: { gem: string; level: string }): JumpGroup[] {
  const gem = o.gem;
  const f = frontier();
  const prev = LEVELS[Math.max(0, LEVELS.indexOf(f) - 1)];
  const lv = levelById(o.level) ?? prev;
  const land = worldOf(lv);
  const boss = land.levels[land.levels.length - 1];
  // (a map with an intro always goes in-app: App's deep links carry no intro)
  const map = (intro: "stickerbook" | "welcome" | "super" | "again"): Jump => ({ route: { name: "map", world: f.world, intro }, save: inGame });
  const offer = jumpOfferReward();
  const tree = (j: Partial<Jump> & { save?: (s: CheatSave) => void }): Jump => ({
    route: { name: "tree" },
    ...j,
    save: (s) => {
      inGame(s);
      s.seenFlower = true;
      j.save?.(s);
    },
  });
  return [
    {
      title: "Start",
      items: [
        { id: "setup", label: "Get ready (install)", jump: () => ({ route: { name: "setup" } }) },
        { id: "title", label: "Title", jump: () => ({ route: { name: "title" } }) },
        { id: "profiles", label: "Who's playing?", note: "name a new player with +", jump: () => ({ route: { name: "profiles" } }) },
        ...Array.from({ length: FILM_SHOTS }, (_, i): JumpItem => ({
          id: `film-${i + 1}`,
          label: i ? `Film, shot ${i + 1}` : "Intro film",
          note: i ? "reloads; needs IntroFilm to read ?shot=" : undefined,
          jump: () => (i ? { route: { name: "intro" }, url: `?scene=intro&shot=${i + 1}`, reload: true } : { route: { name: "intro" } }),
        })),
        { id: "choose", label: "Choose your ninja", jump: () => ({ route: { name: "choose" } }) },
        { id: "optin", label: "Opt-in (new child)", jump: () => ({ route: { name: "optin" }, save: player }) },
        {
          id: "optin-year", label: "Opt-in (new school year)", note: "moving up",
          jump: () => ({
            route: { name: "optin", mode: "newyear" },
            save: (s) => {
              player(s);
              if (!["R", "Y1", "Y2"].includes(s.schoolYear ?? "")) s.schoolYear = "R";
              s.schoolYearAt = Date.now() - 365 * 86_400_000;
            },
          }),
        },
        { id: "training", label: "Training (the dojo welcome)", jump: () => ({ route: { name: "training" }, save: player }) },
        { id: "placement", label: "Placement (Show Sensei)", jump: () => ({ route: { name: "placement" }, save: player }) },
        { id: "picparade", label: "Picture parade", jump: () => ({ route: { name: "picparade" } }) },
      ],
    },
    {
      title: "First session",
      items: [
        { id: "fs-w", label: "Lesson 1: preschool", note: "warm-up W1", jump: () => firstSession("none") },
        { id: "fs-r-aut", label: "Lesson 1: Reception, autumn", note: "warm-ups, Reception version", jump: () => firstSession("R", "autumn") },
        { id: "fs-r-spr", label: "Lesson 1: Reception, spring", note: "cut lesson, first check", jump: () => firstSession("R", "spring") },
        { id: "fs-r-sum", label: "Lesson 1: Reception, summer", jump: () => firstSession("R", "summer") },
        { id: "fs-y1", label: "Lesson 1: Year 1", jump: () => firstSession("Y1") },
        { id: "fs-y2", label: "Lesson 1: Year 2", jump: () => firstSession("Y2") },
        { id: "reward-1", label: "Reward 1", note: "the Sticker Book arrives", jump: () => firstReward(1) },
        { id: "reward-2", label: "Reward 2", note: "the shiny fish-dog, the first petal", jump: () => firstReward(2) },
        { id: "map-first", label: "Map after the first session", note: "your Sticker Book lives here", jump: () => map("stickerbook") },
      ],
    },
    {
      title: "Map",
      items: [
        ...WORLDS.map((w): JumpItem => ({ id: `map-${w.id}`, label: `Map: ${w.name}`, note: w.id === f.world ? "the next stone's land" : undefined, jump: () => ({ route: mapOf(w.id), save: inGame }) })),
        { id: "map-welcome", label: "Map: welcome back", jump: () => map("welcome") },
        { id: "map-super", label: "Map: super listener", jump: () => map("super") },
        { id: "map-again", label: "Map: practise again", jump: () => map("again") },
        {
          id: "map-walk", label: "Map: walk to the next stone", note: prev.id !== f.id && prev.world === f.world ? `${prev.id} → ${f.id}` : "needs a stone finished in this land",
          jump: () => (prev.id !== f.id && prev.world === f.world ? { route: mapOf(f.world), save: inGame, prep: () => void (mapAnim.from = prev.id), url: null } : "it needs a stone finished in the next stone's land"),
        },
        {
          id: "map-trip", label: "Map: a World Flower trip due", note: "the flower pulses",
          jump: () => ({ route: mapOf(f.world), save: (s) => (inGame(s), metGem(s, gem), (s.tripDue = { kind: "spelling", gems: [gem] }), (s.flowerSeen = (s.flowerSeen ?? []).filter((k) => k !== `spelling:${gem}`))) }),
        },
        { id: "review", label: "Sensei's Challenge", note: "a review battle", jump: reviewJump },
      ],
    },
    {
      title: `World Flower (gem ${gem})`,
      items: [
        { id: "tree-first", label: "First visit", note: "the introduction", jump: () => ({ ...tree({}), save: (s) => (inGame(s), (s.seenFlower = false)) }) },
        { id: "tree", label: "A look (free)", jump: () => tree({}) },
        {
          id: "tree-trip", label: "Trip: new spelling", note: "its gem appears",
          jump: () => tree({ save: (s) => (metGem(s, gem), (s.flowerSeen = (s.flowerSeen ?? []).filter((k) => k !== `spelling:${gem}`))), prep: () => visitFlower({ kind: "spelling", gems: [gem] }), url: null }),
        },
        ...WORLDS.slice(1).map((w): JumpItem => ({
          id: `tree-land-${w.id}`, label: `Trip: arriving in ${w.name}`,
          jump: () => tree({ save: (s) => void (s.flowerSeen = (s.flowerSeen ?? []).filter((k) => k !== `world:${w.id}`)), prep: () => visitFlower({ kind: "world", world: w.id }), url: null }),
        })),
        { id: "tree-practised", label: "Trip: back from practice", note: "the gem fills up", jump: () => tree({ save: (s) => metGem(s, gem, ENERGY_FULL * 0.75), prep: () => visitFlower({ kind: "practised", gem, from: 0.25 }), url: null }) },
        { id: "tree-scroll", label: "The scroll (the school chart)", jump: () => tree({ save: (s) => lookGem(s, gem), prep: () => focusGem(gem), url: null }) },
        { id: "tree-petal", label: "Petal detail", jump: () => tree({ save: (s) => lookGem(s, gem), transient: `?scene=tree&gem=${encodeURIComponent(gem)}&open=1`, url: null }) },
        {
          id: "tree-won", label: "Gem won (the celebration)",
          jump: () => ({ ...tree({ save: (s) => (metGem(s, gem, ENERGY_FULL), s.gems.push(gem)), url: null }), route: { name: "tree", celebrate: { gem, won: true } } }),
        },
        // the Gem Trial's two endings: won adds the gem to `gems`, lost takes it out (a trial is for a gem not won yet)
        { id: "tree-lost", label: "Gem battle lost", note: "un-wins the gem", jump: () => ({ ...tree({ save: (s) => unwonGem(s, gem, ENERGY_FULL), url: null }), route: { name: "tree", celebrate: { gem, won: false } } }) },
        { id: "trial", label: "Gem Trial (its battle)", note: "un-wins the gem", jump: () => trialJump(gem) },
        { id: "practise", label: "Practice dojo", note: canPractiseNow(gem) ? "un-wins the gem" : "no words for this gem yet", jump: () => (canPractiseNow(gem) ? practiceJump(gem) : `the gem ${gem} has no words to build yet`) },
      ],
    },
    {
      title: `Rewards (level ${lv.id})`,
      items: [
        { id: "rw-trophy", label: "Reward: nothing new", note: "its trophy", jump: () => rewardJump(lv.id, "trophy") },
        { id: "rw-stickers", label: "Reward: new stickers, gems filling", jump: () => rewardJump(lv.id, "stickers") },
        { id: "rw-ready", label: "Reward: a gem glows", note: "the World Flower button", jump: () => rewardJump(lv.id, "ready") },
        { id: "rw-boss", label: `Reward: ${land.name} finished`, note: boss.id, jump: () => rewardJump(boss.id, "trophy") },
        {
          id: "rw-jump", label: "Reward with Jump ahead",
          note: typeof offer === "string" ? "not from this save (tap: why)" : `${(offer.route as { id: string }).id}: the last level finished after the warm-ups`,
          jump: () => jumpOfferReward(),
        },
        { id: "rw-sticker", label: "Sticker reward (a later warm-up)", jump: () => ({ route: { name: "reward", id: "w1-wu3", stars: 3 }, save: (s) => (inGame(s), (s.seenBook = true)) }) },
        { id: "reward-1b", label: "Reward 1", jump: () => firstReward(1) },
        { id: "reward-2b", label: "Reward 2", jump: () => firstReward(2) },
        { id: "finale", label: "The finale", jump: () => ({ route: { name: "finale" }, save: inGame }) },
      ],
    },
    {
      title: "Sticker Book",
      items: [
        { id: "book", label: "Sticker Book", jump: () => ({ route: { name: "book" }, save: (s) => (inGame(s), (s.seenBook = true)) }) },
        { id: "book-first", label: "Sticker Book, first look", jump: () => ({ route: { name: "book" }, save: (s) => (inGame(s), (s.seenBook = false)) }) },
      ],
    },
    {
      title: "Grown-ups and demos",
      items: [
        { id: "grownups", label: "Grown-ups", jump: () => ({ route: { name: "grownups" } }) },
        { id: "nav-demo", label: "NavDemo", jump: () => ({ route: { name: "nav-demo" }, reload: true }) },
        { id: "nav-badges", label: "NavDemo: sound badges", jump: () => ({ route: { name: "nav-demo" }, url: "?scene=nav-demo&badges=1", reload: true }) },
        { id: "nav-ready", label: "NavDemo: Ready hold", jump: () => ({ route: { name: "nav-demo" }, url: "?scene=nav-demo&ready=1", reload: true }) },
        { id: "nav-ready-first", label: "NavDemo: first Ready", jump: () => ({ route: { name: "nav-demo" }, url: "?scene=nav-demo&ready=1&first=1", reload: true }) },
        { id: "nav-ready-col", label: "NavDemo: Ready in the column", jump: () => ({ route: { name: "nav-demo" }, url: "?scene=nav-demo&ready=1&col=1", reload: true }) },
        { id: "ninja-demo", label: "NinjaDemo", jump: () => ({ route: { name: "ninja-demo" }, reload: true }) },
        ...[1, 2, 3].map((t): JumpItem => ({ id: `ninja-tier-${t}`, label: `NinjaDemo: tier ${t}`, jump: () => ({ route: { name: "ninja-demo" }, url: `?scene=ninja-demo&tier=${t}`, reload: true }) })),
        { id: "ninja-strike", label: "NinjaDemo: a strike", jump: () => ({ route: { name: "ninja-demo" }, url: "?scene=ninja-demo&strike=1", reload: true }) },
        { id: "ninja-ready", label: "NinjaDemo: Ready and bow", jump: () => ({ route: { name: "ninja-demo" }, url: "?scene=ninja-demo&ready=bow", reload: true }) },
        { id: "ninja-caption", label: "NinjaDemo: caption", jump: () => ({ route: { name: "ninja-demo" }, url: "?scene=ninja-demo&caption=1", reload: true }) },
      ],
    },
  ];
}

/** Every game type, with the level its jump opens (for the Teacher voice list). */
export const GAME_ROWS = (Object.keys(GAMES) as GameId[]).map((id) => ({
  id,
  name: GAMES[id].name ?? id,
  where: id === "trial" ? "a Gem Trial" : id === "review" ? "Sensei's Challenge" : levelOfGame(id)?.level.id ?? "—",
}));
