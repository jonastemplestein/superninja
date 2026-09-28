import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Stage, FxLayer, HelpButton, VillainCutIn, useHelp, SenseiDock, img, heroImg, useHero, Icon, RoundButton, fx, sleep, W, tapProps, TapHint, stageXY, stageRect, isUpright, Blossom } from "./ui/ui";
import { say, sfx, playMusic, hush, isSpeaking, onClip, nextClip, setMusicVolume, type Say } from "./engine/audio";
import { store, useSave, logAdjust, recordMet, profilesApi } from "./engine/store";
import { WORLDS, LEVELS, FINALE_LEVEL, TRICK_LEVEL, levelById, worldOf, makeReview, startFor, bandBelow, isWarmup, withBudget, WARMUP_IDS, AFTER_WARMUPS, type Level, type StartBand } from "./content/worlds";
import { WARMUPS, needsRepeat, superListener, warmupPictures } from "./content/warmups";
import { WarmupLevel } from "./scenes/Warmup";
import { OptIn, type OptInResult } from "./scenes/OptIn";
import { StickerReward, Sticker, stickerKind, moreStickersDue, moreStickersSaid } from "./scenes/Stickers";
import { PicCard } from "./scenes/Early";
import { STORIES } from "./content/stories";
import { Dojo } from "./scenes/Dojo";
import { ListenLevel, FirstSoundLevel, SoundHuntLevel, EarlyDojo } from "./scenes/Early";
import { Battle } from "./scenes/Battle";
import { Run } from "./scenes/Run";
import { Swap } from "./scenes/Swap";
import { Sort } from "./scenes/Sort";
import { StoryScene } from "./scenes/Story";
import { Tree, visitFlower } from "./scenes/Tree";
import { Grownups } from "./scenes/Grownups";
import { Intro } from "./scenes/Intro";
import { IntroFilm } from "./scenes/IntroFilm";
import { Placement } from "./scenes/Placement";
import { Training } from "./scenes/Training";
import { Book } from "./scenes/Book";
import { Setup, needsSetup } from "./scenes/Setup";
import { Profiles as ProfilesScreen } from "./scenes/Profiles";
import { Title } from "./scenes/Title";
import { makeTrial, makePractice, practiceGemOf, flowerVisitAfter, readyGems, energyOf, gemByKey, frontier, shouldOfferJump, placeAtUnit, type FlowerVisit } from "./engine/gems";
import { JumpAhead } from "./scenes/JumpAhead";
import { levelGains, levelNewWords, resetLevelGains, ENERGY_FULL } from "./engine/store";
import { GemIcon } from "./ui/Gem";
import { chartOf } from "./content/flower";
import { LINES } from "./content/lines";
import { NinjaDemo } from "./scenes/NinjaDemo";
import { NavDemo } from "./scenes/NavDemo";
import { NavLayer, useNav, useHome, usePresentation, NAV_SLOTS, slotStyle } from "./ui/nav";
import { setTripDue, tripDue } from "./scenes/Tree";
import { NinjaSpot, ninja } from "./ui/Ninja";
import { streak } from "./engine/streak";
import { heard, heardBefore, timesHeard, onceInSave, sessionNow, mapPreview, gemReadySay, toRewardDue, TO_REWARD, levelGames, played } from "./scenes/narrate";
import { arrivalLines, rewardLead, NUMBER_WORDS } from "./content/narrative";
import { teachEntry, type PhonemeId } from "./content/phonics";
import { wordAt } from "./content/word-times";
import { SoundBadge, badgeHeight, soundWidth, PAIRS } from "./ui/SoundBadge";
import { FAST } from "./engine/fast";
import "./styles/shell.css";
import "./styles/nav-B.css";

export type Route =
  | { name: "title" }
  | { name: "intro" }
  | { name: "choose" }
  | { name: "optin"; mode?: "new" | "newyear" }
  | { name: "picparade" }
  | { name: "placement" }
  | { name: "training" }
  | { name: "book" }
  | { name: "setup" }
  /** `naming`: open on the name screen (the title's "New ninja") */
  | { name: "profiles"; naming?: boolean }
  | { name: "map"; world?: number; intro?: "stickerbook" | "welcome" | "super" | "again" }
  | { name: "level"; id: string }
  /** `closing`: the level's closing line, which the reward's Hear it again says first (docs/NAVIGATION.md rule 7) */
  | { name: "reward"; id: string; stars: number; closing?: string }
  /** the World Flower; `then`: where its Next (and Home) go after a trip (default: the map) */
  | { name: "tree"; celebrate?: { gem: string; won: boolean }; then?: Route }
  /** `from`: the screen the gear was held on; Home (and the page's own way out) go back there */
  | { name: "grownups"; from?: Route }
  | { name: "finale" };

export interface LevelProps {
  level: Level;
  /** `closing`: the line the level ended on, for the reward's Hear it again (docs/NAVIGATION.md rule 7) */
  onDone: (stars: number, o?: { closing?: string }) => void;
  /** what Home does in a level (App's Home rule does the same; scenes needn't call it) */
  onQuit: () => void;
}

export function isUnlocked(l: Level) {
  const s = store.get();
  if (s.settings.unlockAll) return true;
  const i = LEVELS.indexOf(l);
  const placed = s.placedAt ? LEVELS.findIndex((x) => x.id === s.placedAt) : 0;
  return i <= placed || (s.stars[LEVELS[i - 1].id] ?? 0) > 0;
}
/** Set when a level is finished, so the map can animate the ninja to the next stone. */
export const mapAnim = { from: null as string | null };
export function currentLevel(): Level {
  return frontier();
}

let restNudged = false;
/** Which lines are recorded (the teacher's-voice lines replace older ones only once they have audio). */
const HAS = new Set(LINES.map((l) => l.id));
const has = (id: string) => HAS.has(id);
/** The land welcomed this session (SCRIPT_FIXES C6): forgotten when store.sessions changes; set once `world_N` (or the
 *  session's "Welcome back, ninja!", which stands in for it) has been said to its end. */
const welcome = { session: -1, world: null as number | null };
const welcomedWorld = () => (welcome.session === sessionNow() ? welcome.world : null);
const setWelcomed = (world: number) => void ((welcome.session = sessionNow()), (welcome.world = world));
/** A warm-up to play again (warmupPace's "again", §10): LevelHost says "That game was a bit tricky. Let's play it once
 *  more." as it opens, on screen, never over the map (TEACHER_SCRIPT §3.10, TV-B1.3). */
let practiseAgain: string | null = null;

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    const q = new URLSearchParams(location.search);
    const lv = q.get("level");
    if (lv === "review") makeReview(currentLevel());
    // deep links for testing the World Flower's routes: ?practise=<gem> (a practice dojo, then back to the flower) and
    // ?trial=<gem> (a Gem Trial, then its victory on the flower)
    const practise = q.get("practise"), trialKey = q.get("trial");
    if (practise && gemByKey(practise)) return makePractice(practise), { name: "level", id: "trial" };
    if (trialKey && gemByKey(trialKey)) return makeTrial(trialKey), { name: "level", id: "trial" };
    if (lv && levelById(lv)) return { name: "level", id: lv };
    const sc = q.get("scene") as Route["name"] | null;
    // a reward screen straight away, for testing: ?scene=reward&id=<level>[&stars=N][&closing=<line>]
    if (sc === "reward") return { name: "reward", id: levelById(q.get("id") ?? "") ? q.get("id")! : "w2-1", stars: Number(q.get("stars") ?? 3), closing: q.get("closing") ?? undefined };
    if (sc) return { name: sc } as Route;
    return needsSetup() ? { name: "setup" } : { name: "title" };
  });
  const [fade, setFade] = useState(0);
  const routeRef = useRef(route);
  routeRef.current = route;
  // leaving the title, the next screen fades in from the title's cream light, not from plum (TITLE_DESIGN §4.5)
  const fromTitle = useRef(false);
  const go = (r: Route) => {
    fromTitle.current = routeRef.current.name === "title";
    // a stone tapped while the map is still talking: the map's line may finish (LevelHost waits for it, at most 1.5 s,
    // before the level speaks: Dec5, SCRIPT_FIXES C18), so the hint is never cut by the next level
    if (!(routeRef.current.name === "map" && r.name === "level")) hush();
    // the next scene publishes its own state as it renders; one that doesn't (the title, the grown-ups page) must not
    // inherit the last scene's (bots and the treadmill read it)
    (window as any).__snState = null;
    setFade((f) => f + 1);
    setRoute(r);
  };
  const worldColour =
    route.name === "level" || route.name === "reward" ? worldOf(levelById(route.id)).colour : route.name === "map" ? WORLDS[(route.world ?? currentLevel().world) - 1].colour : "#ff7aa2";

  // expose for automated playtesting
  useEffect(() => {
    (window as any).__sn = { go, store, LEVELS };
  });
  // the save's music volume (the grown-ups' slider, the menu's Music off), applied at start; Profiles applies it again
  // on a switch (below)
  useEffect(() => setMusicVolume(store.get().settings.music), []);
  // the route, for the sweep's navigation checks (docs/NAVIGATION.md §6: where Home lands, what moved on by itself)
  (window as any).__snRoute = route.name + ("id" in route ? `:${route.id}` : "");

  /** Home in a level: the map of its land (a Gem Trial or a practice: the World Flower; the first session's lessons: the
   *  title, where Start resumes the lesson). The streak is dropped, as before. */
  const quitLevel = (id: string) => {
    streak.drop();
    // a Gem Trial or a practice started on the World Flower: Home goes back there
    if (id === "trial") return go({ name: "tree" });
    if (store.get().firstSession?.lessons.includes(id)) return go({ name: "title" });
    go({ name: "map", world: levelById(id).world });
  };
  /** Where Home goes on each screen (docs/NAVIGATION.md §3.3). A screen can say otherwise with useHome(). Nothing a
   *  child leaves is lost: the first session resumes from the title, a World Flower trip that was due stays due. */
  const homeFor = (r: Route): (() => void) | null => {
    switch (r.name) {
      case "title":
        return null; // the title is home
      case "setup":
      case "profiles":
      case "intro":
      case "choose":
      case "optin":
      case "training":
        return () => go({ name: "title" });
      case "level":
        return () => quitLevel(r.id);
      case "reward":
        return () => {
          // the stars are saved already; a trip to the World Flower that was due stays due (the map's flower pulses)
          const lv = levelById(r.id);
          const trip = flowerVisitAfter(lv);
          if (trip) setTripDue(trip);
          go({ name: "map", world: lv.world });
        };
      case "tree":
        return () => go(r.then ?? { name: "map" });
      case "grownups":
        return () => go(r.from ?? { name: "map" });
      case "finale":
        return () => go({ name: "map", world: WORLDS.length });
      case "map":
        return () => go({ name: "title" });
      default:
        return (r.name as string) === "ninja-demo" ? null : () => go({ name: "map" }); // the Sticker Book, placement, the picture parade
    }
  };

  return (
    <Stage worldColour={worldColour}>
      {route.name === "setup" && <Setup onDone={() => go({ name: "title" })} />}
      {route.name === "title" && (
        <Title
          onStart={() => {
            // straight on as the current player (Who's playing? only without one): TITLE_DESIGN §5, §9.2
            const cur = profilesApi.current();
            if (!cur) return go({ name: "profiles" });
            profilesApi.select(cur.id);
            setMusicVolume(store.get().settings.music);
            go(store.get().seenIntro && store.get().hero ? afterLaunch() : { name: "intro" });
          }}
          onNewPlayer={() => go({ name: "profiles", naming: true })}
          onGrownups={() => go({ name: "grownups", from: { name: "title" } })}
        />
      )}
      {route.name === "profiles" && (
        <Profiles
          naming={route.naming}
          onPlay={() => (setMusicVolume(store.get().settings.music), go(store.get().seenIntro && store.get().hero ? afterLaunch() : { name: "intro" }))}
          onNew={() => (setMusicVolume(store.get().settings.music), go({ name: "intro" }))}
          onHome={() => go({ name: "title" })}
        />
      )}
      {route.name === "intro" && <IntroFilm onDone={() => go({ name: "choose" })} />}
      {route.name === "choose" && <Choose onDone={() => go(afterChoose())} />}
      {route.name === "optin" && (
        <OptIn key={route.mode ?? "new"} mode={route.mode} lastYear={store.get().schoolYear} onGrownups={() => go({ name: "grownups", from: route })} onDone={(r) => go(applyOptIn(r, route.mode ?? "new"))} />
      )}
      {route.name === "training" && <Training onDone={() => go(nextInSession() ?? { name: "map" })} />}
      {route.name === "placement" && <Placement onDone={() => go({ name: "map" })} />}
      {route.name === "picparade" && <PicParade />}
      {route.name === "map" && (
        <WorldMap
          key={`${route.world}-${route.intro}-${fade}`}
          intro={route.intro}
          world={route.world}
          onLevel={(id) => go({ name: "level", id })}
          onTree={() => {
            // a trip that was due (the child left its reward, or the trip, with Home) plays now
            const due = tripDue();
            if (due) visitFlower(due);
            go({ name: "tree", then: due ? { name: "map", world: route.world } : undefined });
          }}
          onBook={() => go({ name: "book" })}
          onGrownups={() => go({ name: "grownups", from: { name: "map", world: route.world } })}
        />
      )}
      {route.name === "level" && (
        <LevelHost
          key={route.id + fade}
          level={levelById(route.id)}
          onDone={(stars, o) => {
            const lv = levelById(route.id);
            // a finished level's streak carries over into the next level (docs/HERO.md)
            if (stars > 0) streak.bank();
            else streak.drop();
            // a practice dojo (the World Flower's Practise gate) goes straight back to the flower, where its gem fills
            // up; it never reaches the reward screen (that would record stars and a map walk for the one-off slot)
            const practised = practiceGemOf(lv);
            if (practised) {
              visitFlower({ kind: "practised", gem: practised });
              return go({ name: "tree" });
            }
            // a Gem Trial won: the World Flower's victory (the gem dives into its petal, with the victory music)
            if (lv.trialGem) go({ name: "tree", celebrate: { gem: lv.trialGem, won: stars > 0 } });
            else go({ name: "reward", id: route.id, stars, closing: o?.closing });
          }}
          onQuit={() => quitLevel(route.id)}
          onDrop={(band) => {
            // the first check (§10): 0 or 1 right of the first three → one band down. LevelHost has already held the
            // child on "Let's do some warm-up training first!" until they tapped Next (nothing moves on by itself)
            dropBand(band);
            streak.drop();
            go({ name: "level", id: store.get().firstSession?.lessons[0] ?? "w1-wu1" });
          }}
        />
      )}
      {route.name === "reward" && stickerReward(levelById(route.id)) && (
        <StickerRoute
          key={route.id + fade}
          level={levelById(route.id)}
          stars={route.stars}
          closing={route.closing}
          onNext={(r) => go(r)}
          onReplay={() => go({ name: "level", id: route.id })}
        />
      )}
      {route.name === "reward" && !stickerReward(levelById(route.id)) && (
        <Reward
          key={route.id + fade}
          level={levelById(route.id)}
          stars={route.stars}
          closing={route.closing}
          onNext={(finale) => {
            const lv = levelById(route.id);
            const last = worldOf(lv).levels[worldOf(lv).levels.length - 1].id === lv.id;
            const next: Route = finale ? { name: "finale" } : { name: "map", world: last ? Math.min(WORLDS.length, lv.world + 1) : lv.world };
            // a trip to the World Flower first, when one is due (engine/gems.ts): the gems of spellings this level
            // taught for the first time crack open in their petals, or a new land's flower visit; each plays once. It
            // stays due until it has played to its end (Home mid-trip keeps it for the map's World Flower button)
            const trip = finale ? null : flowerVisitAfter(lv);
            if (trip) {
              setTripDue(trip);
              visitFlower(trip);
              return go({ name: "tree", then: next });
            }
            go(next);
          }}
          onReplay={() => go({ name: "level", id: route.id })}
          onFlower={() => go({ name: "tree" })}
          onJumped={() => setTimeout(() => go({ name: "map", world: frontier().world }), 1200)}
        />
      )}
      {route.name === "tree" && (
        <Tree
          key={`tree-${fade}`}
          celebrate={route.celebrate}
          onBack={() => go(route.then ?? { name: "map" })}
          onTrial={(key) => {
            makeTrial(key);
            go({ name: "level", id: "trial" });
          }}
          onPractice={(key) => {
            makePractice(key);
            go({ name: "level", id: "trial" });
          }}
        />
      )}
      {route.name === "grownups" && <Grownups onBack={() => go(route.from ?? { name: "map" })} />}
      {route.name === "book" && <Book />}
      {route.name === "finale" && <Intro finale onDone={() => go({ name: "map", world: WORLDS.length })} />}
      {(route.name as string) === "ninja-demo" && <NinjaDemo />}
      {(route.name as string) === "nav-demo" && <NavDemo onHome={() => go({ name: "title" })} />}
      <VillainCutIn />
      <HelpButton />
      {/* Home, Back, Hear it again, Show me again, the sound picture and Next (src/ui/nav.tsx). Home goes where App's
          rule says (homeFor, docs/NAVIGATION.md §3.3) unless the screen registers its own with useHome() */}
      <NavLayer home={homeFor(route)} scene={`${route.name}-${fade}`} />
      <FxLayer />
      <div className={`fullscreen-fade ${fromTitle.current ? "light" : ""}`} key={`fade-${fade}`} />
    </Stage>
  );
}

function LevelHost({ onDrop, level: base, ...rest }: LevelProps & { onDrop: (band: StartBand) => void }) {
  // a school path's first lessons are cut (§9): the scenes end at the first item boundary after level.budgetMs
  const [level] = useState(() => withBudget(base, store.get().firstSession));
  const props = { ...rest, level };
  useState(() => resetLevelGains());
  // the first check's band drop (§10) waits for the item boundary, then holds on "Let's do some warm-up training
  // first!" until the child taps Next (docs/NAVIGATION.md §5.0): the level is never swapped mid-item
  const [drop, setDrop] = useState<StartBand | null>(null);
  useFirstCheck(level, setDrop);
  // Dec5 (SCRIPT_FIXES C18): a level speaks only once it is on screen. It mounts after App's fade has finished and the
  // map's line has ended (at most 1.5 s from the tap), so no level line starts over the map and the map's hint is never
  // cut by the level. A warm-up played again because it was tricky (§10) opens on "That game was a bit tricky…" first.
  const [on, setOn] = useState<"wait" | "again" | "on">("wait");
  useEffect(() => {
    let live = true;
    (async () => {
      const t0 = performance.now();
      await fadeDone();
      while (live && isSpeaking() && ((performance.now() - t0) * FAST) < 1500) await sleep(100);
      if (!live) return;
      hush();
      if (practiseAgain === level.id) {
        practiseAgain = null;
        if (has("tv_practise_again")) {
          setOn("again");
          await sleep(350);
          if (live) await say({ line: "tv_practise_again" });
          if (!live) return;
        }
      }
      // (the level publishes its own state as it renders; until it does, none: bots and the checks read it)
      (window as any).__snState = null;
      setOn("on");
    })();
    return () => void (live = false);
  }, []);
  if (drop) return <DropHold onNext={() => onDrop(drop)} />;
  if (on === "wait") {
    (window as any).__snState = { scene: "level-wait", busy: true };
    return <div className="scene level-wait" />;
  }
  if (on === "again") {
    (window as any).__snState = { scene: "level-wait", busy: true };
    return <LevelOpening level={level} />;
  }
  return (
    <>
      <LevelScene {...props} />
      <div className="level-reveal" />
    </>
  );
}

/** App's fade between screens (styles.css .fullscreen-fade: 0.6 s): resolves once it has finished (its own animation's
 *  end, so it holds at any playback rate), or after 0.6 s if there is none to wait for. */
const FADE_MS = 600;
async function fadeDone() {
  const anims = [...document.querySelectorAll(".fullscreen-fade")].flatMap((el) => el.getAnimations?.() ?? []);
  if (!anims.length) return sleep(FADE_MS);
  await Promise.race([Promise.all(anims.map((a) => a.finished.catch(() => {}))), sleep(FADE_MS * 2)]);
}
/** The moment before a warm-up played again: its land, the ninja in its corner, and Sensei's line. */
function LevelOpening({ level }: { level: Level }) {
  const w = worldOf(level);
  return (
    <div className="scene level-opening">
      <img className="bg-img" src={img(`bg_${w.key}`)} alt="" />
      <div className="vignette" />
      <NinjaSpot />
      <SenseiDock />
    </div>
  );
}

function LevelScene(props: LevelProps) {
  const { level } = props;
  switch (level.kind) {
    case "ears":
    case "picread":
      return <WarmupLevel {...props} />;
    case "dojo":
      return level.words ? <EarlyDojo {...props} /> : <Dojo {...props} />;
    case "listen":
      return <ListenLevel {...props} />;
    case "firstsound":
      return <FirstSoundLevel {...props} />;
    case "soundhunt":
      return <SoundHuntLevel {...props} />;
    case "battle":
    case "boss":
      return <Battle {...props} />;
    case "run":
      return <Run {...props} />;
    case "swap":
      return <Swap {...props} />;
    case "sort":
      return <Sort {...props} />;
    case "story":
      return <StoryScene {...props} />;
  }
}

/** The first check moved the child one band down: one held step ("Let's do some warm-up training first!"), and Next
 *  starts the warm-up. */
function DropHold({ onNext }: { onNext: () => void }) {
  usePresentation([{ key: "warm-up", run: () => say({ line: "fm_warm_up" }) }], { id: "first-check-drop", onDone: onNext });
  return (
    <div className="scene" style={{ background: "#2a5a3a" }}>
      <img className="bg-img" src={img("bg_bamboo")} alt="" style={{ filter: "blur(2px) brightness(.9)" }} />
      <div className="vignette" />
      <NinjaSpot />
      <SenseiDock />
    </div>
  );
}

// ---------------------------------------------------------------- the title: src/scenes/Title.tsx (docs/TITLE_DESIGN.md)
/** Blossom petals drifting down (the map, the finale). Round cherry-blossom petals with a notch, never the
 *  rainbow teardrop: a teardrop always means a sound (Dec6, SD r60). Each drifts on the compositor (transform only,
 *  shell.css .petal-drift), from above the stage to below it, so none sits hidden while it animates. */
export function PetalDrift({ n = 14 }: { n?: number }) {
  const petals = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ left: Math.random() * 100, delay: -Math.random() * 12, dur: 9 + Math.random() * 8, size: 22 + Math.random() * 20, sway: Math.random() < 0.5 ? -1 : 1, i })),
    [n],
  );
  return (
    <div className="petal-drift" aria-hidden="true">
      {petals.map((p) => (
        <span key={p.i} className={p.sway < 0 ? "left" : "right"} style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          <Blossom k={p.i} size={p.size} />
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Choose your ninja
/** The two cards: where they stand (stage px), and where each card's ninja stands in it (docs/HERO.md sizes). */
const CARD = { left: (i: number) => 150 + i * 390, top: 128, w: 350, h: 400 } as const;
const CARD_NINJA = { x: 45, bottom: 20, size: 260 } as const;
/**
 * Choose your ninja (TEACHER_SCRIPT §3.2): a teacher meeting a new child. "Hello! I'm Sensei Maple, and I'm going to be
 * your teacher." (once per save, her portrait glowing) · "First, choose your ninja. Will it be Kai, or Suki?" (each card
 * spotlit on its name, from the line's word timings; the cards work from the first word). A tap picks a ninja: it powers
 * up and bows, "Great choice!" (another tap changes it until it walks off). Then "Baron Muddle took the sounds away.
 * We'll win them back by playing games together." as the film's lost petals drift across the sky, and "Your ninja will
 * play every game with you." as the ninja walks to its corner, bottom left, where it stands in every game, ready and
 * facing the green arrow, which pops in. Nothing moves on by itself (docs/NAVIGATION.md): ▶ confirms.
 */
function Choose({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<"kai" | "suki" | null>(null);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  // ask: the question; chose: "Great choice!…" (a tap can still change it); walk: the ninja walks to its corner; ready: ▶
  const [phase, setPhase] = useState<"ask" | "chose" | "walk" | "ready">("ask");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [hello, setHello] = useState(false); // Sensei's portrait glows while she says hello
  // the question has started: the cards are live from its first word (TEACHER_SCRIPT §3.2); a tap during the hello only
  // wiggles the card. The idle help starts from then too
  const [asked, setAsked] = useState(false);
  const askedRef = useRef(asked);
  askedRef.current = asked;
  const cardEls = useRef<Record<string, HTMLElement | null>>({});
  const [spot, setSpot] = useState<"kai" | "suki" | null>(null);
  // ("Now, choose your ninja…" once recorded: the opt-in that follows opens "First, let's find the right games for
  // you.", and two "First, …" openers in a row read as a list that never gets a second: lane A's note, 28 Sep)
  const question = has("tv_choose_q_now") ? "tv_choose_q_now" : has("tv_choose_q") ? "tv_choose_q" : "intro_8";
  const ask = () => say({ line: question });
  const lastSay = (): Say[] => (has("tv_choose_ninja") ? [{ line: "chose" }, { gap: 300 }, { line: "tv_choose_ninja" }] : [{ line: "chose" }]);
  useHelp(() => (phaseRef.current === "ready" ? say({ line: "nav_ready" }) : phaseRef.current === "ask" ? void ask() : undefined), []);
  useNav({
    again: () => (phaseRef.current === "ask" ? ask() : say(lastSay())),
    next: phase === "ready" ? { ready: true, go: onDone } : null,
  });
  // the opening: hello (once per save), then the question; a tap during the hello cuts it and picks at once
  useEffect(() => {
    let live = true;
    (async () => {
      if (onceInSave("choose:hello") && has("tv_choose_hello")) {
        setHello(true);
        const ok = await say({ line: "tv_choose_hello" });
        if (!live) return;
        setHello(false);
        if (ok) heard("choose:hello");
        if (pickedRef.current) return;
        // (the gaps in Choose are short: its four once-per-save lines are already about 13 s of Sensei, against a 6 s
        // budget, FIRST_MINUTES §2; verify round 2 measured 15.5 s for a quick child)
        await sleep(100);
        if (!live || pickedRef.current) return;
      }
      // the cards go live (and the turn opens) as the question's first word is heard, not before it
      const open = () => {
        if (!live || askedRef.current) return;
        setAsked(true);
        askedRef.current = true;
      };
      void nextClip(question, 3000).then(open);
      await ask();
      open();
    })();
    return () => void (live = false);
  }, []);
  // the spotlights: Kai's card on "Kai", Suki's on "Suki", whenever the question is said (Hear it again, the idle help)
  useEffect(() => {
    const timers: number[] = [];
    const off = onClip((id, start, end) => {
      if (id !== question) return;
      timers.forEach(clearTimeout);
      const k = wordAt(question, "Kai"), s = wordAt(question, "Suki");
      if (k == null || s == null) return;
      const dur = (end - start) * FAST; // (clip times are real ms; timers run in game ms)
      timers.push(
        window.setTimeout(() => setSpot("kai"), k * 1000),
        window.setTimeout(() => setSpot("suki"), s * 1000),
        window.setTimeout(() => setSpot(null), Math.max(s * 1000 + 900, dur + 500)),
      );
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
  }, []);
  // idle help before the pick (a turn: docs/NAVIGATION.md §3.2): 8 s both cards bob and Sensei asks again; 16 s the
  // pointing hand shows on both cards; 30 s she asks once more; then quiet. It never picks. Game time, waiting while
  // anyone speaks or the phone is upright; any tap starts it again.
  const [idle, setIdle] = useState(0);
  useEffect(() => {
    setIdle(0);
    if (picked || !asked) return;
    let ms = 0, level = 0;
    const tick = window.setInterval(() => {
      if (isUpright() || isSpeaking()) return;
      ms += 250;
      if (ms >= 8000 && level < 1) (level = 1), setIdle(1), void ask();
      else if (ms >= 16000 && level < 2) (level = 2), setIdle(2);
      else if (ms >= 30000 && level < 3) (level = 3), void ask();
    }, 250);
    const reset = () => ((ms = 0), (level = 0), setIdle(0));
    window.addEventListener("pointerdown", reset, true);
    return () => {
      clearInterval(tick);
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [picked, asked]);
  const latest = useRef(0);
  const choose = async (h: "kai" | "suki") => {
    if (!askedRef.current) {
      sfx.tink();
      cardEls.current[h]?.animate([{ rotate: "0deg" }, { rotate: "-3deg", offset: 0.3 }, { rotate: "2deg", offset: 0.65 }, { rotate: "0deg" }], { duration: 400, easing: "ease-in-out" });
      return;
    }
    if (picked === h || phaseRef.current === "walk" || phaseRef.current === "ready") return;
    const my = ++latest.current;
    const mine = () => latest.current === my;
    setPicked(h);
    setPhase("chose");
    setSpot(null);
    setHello(false);
    sfx.great();
    fx.burst(h === "kai" ? 325 : 715, 330, "stars", 30);
    store.set((s) => {
      s.hero = h;
      s.seenIntro = true;
    });
    await say({ line: "chose" });
    if (!mine()) return;
    // why we play (once per save): the film's lost petals (every sound: the rainbow teardrop) drift across the sky
    if (onceInSave("choose:why") && has("tv_choose_why")) {
      await sleep(100);
      if (!mine()) return;
      fx.rain("rainbow", 16);
      const ok = await say({ line: "tv_choose_why" });
      if (!mine()) return;
      if (ok) heard("choose:why");
    }
    // the ninja walks to its corner, where it stands in every game; ▶ pops in as it arrives
    await sleep(100);
    if (!mine()) return;
    setPhase("walk");
    const line = onceInSave("choose:ninja") && has("tv_choose_ninja");
    const said = line ? say({ line: "tv_choose_ninja" }).then((ok) => ok && heard("choose:ninja")) : null;
    await sleep(WALK_MS + 150);
    if (!mine()) return;
    setPhase("ready");
    await said;
  };
  (window as any).__snState = { scene: "choose", picked, next: phase === "ask" && asked ? "kai" : null, busy: !asked || phase === "chose" || phase === "walk" };
  const gone = phase === "walk" || phase === "ready";
  return (
    <div className="scene choose">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <div className={`choose-sensei ${hello ? "on" : ""}`} aria-hidden="true" />
      <div className={`display choose-title ${gone ? "gone" : ""}`}>Choose your ninja!</div>
      {(["kai", "suki"] as const).map((h, i) => (
        <button
          key={h}
          ref={(el) => void (cardEls.current[h] = el)}
          {...tapProps(() => choose(h))}
          aria-label={h}
          disabled={gone}
          className={`panel pop-in choose-card ${picked && picked !== h ? "other" : ""} ${!picked && idle ? "nudge" : ""} ${spot === h ? "spot" : ""} ${gone ? "gone" : ""}`}
          style={{
            // the two cards sit left of centre, above the nav row; Sensei's caption bubble has the right-hand side
            position: "absolute", left: CARD.left(i), top: CARD.top, width: CARD.w, height: CARD.h, animationDelay: `${i * 0.12}s`,
            background: i ? "linear-gradient(180deg,#d7fbf3,#8fe0cf)" : "linear-gradient(180deg,#dfe0ff,#9ea3f0)",
            transform: picked === h ? "scale(1.06)" : picked ? "scale(0.9)" : undefined, opacity: picked && picked !== h ? 0.5 : 1,
          }}
        >
          <span className="choose-spot" aria-hidden="true" />
          {picked === h && !gone ? (
            <PickedNinja key={h} />
          ) : picked === h ? null : (
            <img src={heroImg(h, "idle")} alt="" style={{ width: 260, position: "absolute", left: 45, bottom: 20 }} className="breathe" />
          )}
          <TapHint show={!picked && idle >= 2} style={{ left: 190, top: 250 }} />
        </button>
      ))}
      {gone && picked && <ChooseWalk card={picked === "kai" ? 0 : 1} ready={phase === "ready"} />}
      <SenseiDock />
    </div>
  );
}

/** The ninja the child just picked: it powers up on the spot (energy gathers, a flash and rings), then bows. */
function PickedNinja() {
  useEffect(() => {
    let live = true;
    (async () => {
      const t = setTimeout(() => live && ninja.say(), 200); // kiai! as the power bursts
      await ninja.act("power");
      clearTimeout(t);
      if (live) await ninja.act("bow");
    })();
    return () => void (live = false);
  }, []);
  return <NinjaSpot size={CARD_NINJA.size} x={CARD_NINJA.x} bottom={CARD_NINJA.bottom} z={3} noFlames />;
}

const WALK_MS = 1300;
/** The chosen ninja walks out of its card to its corner (docs/HERO.md: x 40, feet 18 above the floor, 250 wide), where
 *  it stands in every game: a FLIP from where it stood in the card, on the compositor (transform only). Then it turns to
 *  the green arrow in its ready stance. */
function ChooseWalk({ card, ready }: { card: number; ready: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // the card's ninja, in stage px (the picked card is scaled 1.06 about its centre)
    const k = 1.06, cx = CARD.left(card) + CARD.w / 2, cy = CARD.top + CARD.h / 2;
    const left = cx + (CARD.left(card) + CARD_NINJA.x - cx) * k;
    const feet = cy + (CARD.top + CARD.h - CARD_NINJA.bottom - cy) * k;
    const s = (CARD_NINJA.size * k) / 250;
    const dx = left - 40, dy = feet - (720 - 18);
    ninja.pose("run", { face: { x: 0, y: 600 }, now: true });
    const a = ref.current?.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: "none" }], { duration: WALK_MS, easing: "cubic-bezier(.45,.05,.35,1)" });
    const done = () => ninja.mounted && ninja.pose(null, { now: true });
    a?.finished.then(done, () => {});
    if (!a) done();
    return () => a?.cancel();
  }, []);
  // ▶ has popped in: the ninja drops into its ready stance, facing it
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => ninja.mounted && ninja.pose("ready", { face: "next" }), 80);
    return () => clearTimeout(t);
  }, [ready]);
  // (the next screen's ninja starts in its own resting pose, facing right)
  useEffect(() => () => ninja.pose(null), []);
  return (
    <div ref={ref} className="choose-walk">
      <NinjaSpot />
    </div>
  );
}

// ---------------------------------------------------------------- World map
const MAP_HERO_W = 128, MAP_HERO_H = 172; // the idle sprites are ~1.34 tall per wide; the img's box is bottom-aligned
const KIND_ICON: Record<string, string> = { dojo: "item_dojo", run: "item_gong", swap: "item_scroll", sort: "item_chest", story: "item_lantern", listen: "pic_sun", firstsound: "pic_mat", soundhunt: "pic_pig", ears: "ui_tortoise", picread: "pic_fishdog" };
function nodePos(i: number, n: number) {
  if (n > 16) {
    // three rows, snaking (Bamboo Village with its warm-up stones): bottom left→right, middle right→left, top left→right
    const per = Math.ceil(n / 3);
    const row = Math.floor(i / per);
    const j = i - row * per;
    const cnt = row < 2 ? per : n - 2 * per;
    const t = cnt === 1 ? 0.5 : j / (cnt - 1);
    const x = row === 1 ? 1020 - t * 870 : 150 + t * 870;
    return { x, y: [560, 392, 222][row] + Math.sin(t * Math.PI * 2) * 12 };
  }
  if (n > 10) {
    // two rows, snaking: along the bottom left→right, then back along the top right→left
    const half = Math.ceil(n / 2);
    const row = i < half ? 0 : 1;
    const j = row ? i - half : i;
    const cnt = row ? n - half : half;
    const t = cnt === 1 ? 0.5 : j / (cnt - 1);
    // the bottom row stops at x 1020, so even the big current stone and its pointing hand stay clear of Sensei's
    // Help button (bottom-right); the top row starts left of the Sticker Book / Flower column (right edge). Both rows
    // start far enough left that neighbouring stones don't overlap (8 stones: ~124 px apart)
    const x = row ? 1060 - t * 880 : 150 + t * 870;
    return { x, y: (row ? 330 : 540) + Math.sin(t * Math.PI * 2) * 18 };
  }
  const t = n === 1 ? 0.5 : i / (n - 1);
  const x = 130 + t * (1050 - 130); // the last stone stays clear of Sensei's Help button (bottom-right)
  const y = 470 + Math.sin(t * Math.PI * 2.2 + 0.4) * 80;
  return { x, y };
}

function WorldMap({ world, intro, onLevel, onTree, onBook, onGrownups }: { world?: number; intro?: "stickerbook" | "welcome" | "super" | "again"; onLevel: (id: string) => void; onTree: () => void; onBook: () => void; onGrownups: () => void }) {
  const stars = useSave((s) => s.stars);
  const hero = useHero();
  const cur = currentLevel();
  const [wi, setWi] = useState((world ?? cur.world) - 1);
  const w = WORLDS[wi];
  const firstVisit = useRef(true);
  // what Sensei said on arriving here (or on turning to this land): Hear it again says it again (docs/NAVIGATION.md §3.5)
  const arrival = useRef<Say[]>([]);
  useNav({ again: () => arrival.current.length && say(arrival.current), againAt: "side" });
  // what the map says (SCRIPT_FIXES C6, TEACHER_SCRIPT §3.8, §5.8): on the first arrival of a session "Welcome back,
  // ninja!", or the land's welcome once a session; then a one-line preview before a game this child has never played,
  // or "The glowing stone is your next game…" on the save's first two arrivals (after that it is the 8 s idle nudge).
  // Each is recorded only once it has been said to its end. Turning to another land names it.
  const [cue, setCue] = useState<"stones" | "flower" | "wave" | null>(null);
  const [talking, setTalking] = useState(false); // the arrival lines are playing (the idle nudge waits for them)
  // the first map (Reward 2's third step) introduces the map before its stones are live: they wake on "The glowing stone
  // is your next game…" (a tap before that is taken and waits: `take`, below). An arrival with a game's preview ("Next
  // is a new game, called Sound Dots. Tap the glowing stone to play.") wakes them in its last 1.5 s, so a child who taps
  // the bouncing stone straight away still hears what the new game is (a tap during the land's lead-in dropped the
  // preview: verify round 1, 27 Sep). Any other arrival: live at once
  const [stonesLive, setStonesLive] = useState(() => intro !== "stickerbook" && !(cur.world === w.id && mapPreview(cur)));
  const stoneEls = useRef<Record<string, HTMLElement | null>>({});
  // A stone tapped before the stones wake is TAKEN, not dropped (verify round 2: the taps only nodded, so the child
  // tapped stone 1 three times and heard "…Tap it when you're ready." after tapping). It lights up at once (a pop, a
  // golden ring, the ninja's hop); Sensei finishes what the child still needs (the first map's Sticker Book and World
  // Flower, a new game's preview); the hint that asks for the tap is left out; then the level starts, with no second tap.
  const queued = useRef<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const pendingLine = useRef<string | null>(null); // an arrival line asked for but not yet started
  const previewOn = useRef(false); // a game's preview asked for or playing
  const onLevelRef = useRef(onLevel);
  onLevelRef.current = onLevel;
  const isHint = (line: string | null) => line === "tv_map_hint" || line === "map_hint";
  useEffect(() => {
    playMusic(w.music);
    const first = firstVisit.current;
    firstVisit.current = false;
    let live = true;
    const here = cur.world === w.id;
    // the stones wake; a stone already tapped is played now (once). (Turning to another land forgets a stone taken in
    // the last one.)
    queued.current = null;
    setChosen(null);
    let gone = false;
    const wake = () => {
      if (!live) return;
      setStonesLive(true);
      const id = queued.current;
      if (id && !gone) {
        gone = true;
        onLevelRef.current(id);
      }
    };
    /** `started`: recorded as soon as the line starts (the land's welcome: a child who taps a stone during "Welcome to
     *  the Sky Temple!" has been welcomed; recorded only at its end, it came back at every arrival, 13 times in one
     *  session for the learner bot: integration, 27 Sep). `done`: recorded once said to its end. */
    type Beat = { line: string; cue?: () => void; done?: () => void; started?: () => void; preview?: boolean };
    const beats: Beat[] = [];
    const hint = (): Beat => ({ line: has("tv_map_hint") ? "tv_map_hint" : "map_hint", done: () => heard("map-hint") });
    if (first && intro === "stickerbook") {
      // the first session ends here (Reward 2's third step): the map and its stones, the Sticker Book's and the World
      // Flower's buttons, then the glowing stone
      if (onceInSave("sym:map") && has("tv_map_intro")) beats.push({ line: "tv_map_intro", cue: () => setCue("stones"), done: () => (heard("sym:map"), setWelcomed(w.id)) });
      beats.push({ line: "fm_rw2_map", cue: () => (setCue(null), setBookHint(true)) });
      if (has("tv_map_flower")) beats.push({ line: "tv_map_flower", cue: () => (setBookHint(false), setCue("flower")) });
      // the stones wake on "Tap it when you're ready.", the hint's last 1.2 s: a stone tapped then leaves the rest of the
      // hint to finish while the level fades up (LevelHost waits up to 1.5 s for it), so it is never cut by the level
      if (timesHeard("map-hint") < 2) {
        const h = hint();
        beats.push({
          ...h,
          cue: () => {
            setBookHint(false);
            setCue(null);
            void nextClip(h.line, 3000).then((c) => {
              if (!live) return;
              if (!c) return wake();
              window.setTimeout(wake, Math.max(0, (c.end - c.start) * FAST - 1200));
            });
          },
        });
      }
    } else if (first && here) {
      // (the super listener's skip, W4 and W5, has no lead of its own: `fm_super_listener`'s "Now let's find out how we
      // write the sounds." was untrue before W6's Sound Dots, and W6's close says it; the preview names the next game)
      const lead = intro === "welcome" ? (has("tv_welcome_back") ? "tv_welcome_back" : "welcome_back") : null;
      const pv = mapPreview(cur);
      for (const line of arrivalLines({ world: w.id, welcomed: welcomedWorld(), lead, hintsSaid: timesHeard("map-hint"), preview: pv?.line ?? null, has })) {
        if (line === "tv_map_hint" || line === "map_hint") beats.push(hint());
        else if (pv && line === pv.line) {
          // the stones wake in its last 1.5 s, on "…glowing stone to play." (its "Tap" is 1.5–3 s from the end in every
          // take): the level waits up to 1.5 s for a line still playing, so a stone tapped as soon as it wakes never
          // cuts the preview
          beats.push({
            line,
            preview: true,
            done: () => heard(pv.key),
            cue: () =>
              void nextClip(line, 3000).then((c) => {
                if (!live) return;
                if (!c) return wake();
                window.setTimeout(wake, Math.max(0, (c.end - c.start) * FAST - 1500));
              }),
          });
        }
        // ("Welcome back, ninja!" stands in for the land's welcome this session: one welcome, not two in a row)
        else if (line === lead) beats.push({ line, cue: () => lead.endsWith("welcome_back") && setCue("wave"), done: () => lead.endsWith("welcome_back") && setWelcomed(w.id) });
        else beats.push({ line, started: () => line.startsWith("world_") && setWelcomed(w.id) });
      }
    } else if (!first || welcomedWorld() !== w.id) beats.push({ line: `world_${w.id}`, started: () => here && setWelcomed(w.id) });
    // a save that beat the Sky Temple's boss before the Baron final only swap (it saw the old finale, "Sorry for all the
    // muddle") and hasn't heard the trick: on its first map arrival, it was a trick! (docs/fix-requests.md row 17; the
    // cut-in shows the Baron, no balloon here). It shares `story:trick` with the Sky Magpie's first win, so a save hears
    // it once, whichever comes first; recorded once Sensei's promise has been said to its end
    if (first && intro !== "stickerbook" && (store.get().stars[TRICK_LEVEL] ?? 0) > 0 && onceInSave("story:trick") && has("baron_trick_1")) {
      // (after the welcome, if there is one: "Welcome back, ninja!", then the Baron storms in)
      const at = beats[0] && (beats[0].line.endsWith("welcome_back") || beats[0].line.startsWith("world_")) ? 1 : 0;
      beats.splice(at, 0, { line: "baron_trick_1" }, { line: "baron_escape_sky" }, { line: "tv_trick_soon", done: () => heard("story:trick") });
    }
    arrival.current =beats.flatMap((b, i): Say[] => (i ? [{ gap: 250 }, { line: b.line }] : [{ line: b.line }]));
    // a beat asked for but not yet started (its gap, its load) when a stone is tapped: it is dropped, so it never starts
    // over the level (a line already playing may finish: LevelHost waits for it)
    let waiting = false;
    (async () => {
      setTalking(beats.length > 0);
      for (let i = 0; i < beats.length && live; i++) {
        const b = beats[i];
        // (a stone already tapped: "Tap it when you're ready." has been answered, and a game's preview, "…Tap the
        // glowing stone to play.", comes too late: the level's own frame names the game. Verify, 28 Sep: w6-br1's
        // preview played after the child's tap, queued behind "Welcome back, ninja!")
        if (queued.current && (isHint(b.line) || b.preview)) continue;
        b.cue?.();
        waiting = true;
        pendingLine.current = b.line;
        previewOn.current = !!b.preview;
        void nextClip(b.line, 3000).then((c) => {
          waiting = false;
          if (pendingLine.current === b.line) pendingLine.current = null;
          if (c && live) b.started?.();
        });
        const ok = await say(i ? [{ gap: 250 }, { line: b.line }] : [{ line: b.line }]);
        waiting = false;
        pendingLine.current = null;
        previewOn.current = false;
        // (cut: by Help or Hear it again, or by a stone tapped as the hint was about to start: take(), below)
        if (!live || !ok) break;
        b.done?.();
      }
      if (!live) return;
      setTalking(false);
      setCue(null);
      wake();
      setTimeout(() => live && setBookHint(false), 2500);
    })();
    return () => {
      live = false;
      pendingLine.current = null;
      if (waiting) hush();
    };
  }, [wi]);
  /** A stone (or the ninja on it) tapped before the stones wake: taken, and played once Sensei has finished (above). */
  const take = (id: string) => {
    if (queued.current) return void sfx.tink(); // (already on its way)
    queued.current = id;
    setChosen(id);
    sfx.pop();
    setArrived(true);
    window.setTimeout(() => setArrived(false), 800);
    // the hint about to start would ask for the tap just made: it is left out; so is a game's preview, about to start or
    // playing (the stone is tapped: the level starts, and its frame names the game)
    if (isHint(pendingLine.current) || previewOn.current) hush();
  };
  const [bookHint, setBookHint] = useState(false);
  const worldOpen = (i: number) => i >= 0 && i < WORLDS.length && isUnlocked(WORLDS[i].levels[0]);
  const heroAt = w.levels.findIndex((l) => l.id === cur.id);
  const readyCount = readyGems().length;
  const due = !!tripDue(); // a World Flower trip left unplayed (Home on its reward, or mid-trip): the flower pulses
  const hintLine = has("tv_map_hint") ? "tv_map_hint" : "map_hint";
  const lockedLine = has("tv_map_locked") ? "tv_map_locked" : "map_locked";
  useHelp(() => say({ line: hintLine }));
  // the idle nudge (TEACHER_SCRIPT §5.8, laddered like a hold's, §2.3): 8 s with no tap once the arrival has been
  // said, the ninja hops beside the glowing stone; 16 s the stone's hint ("The glowing stone is your next game…"); 40 s
  // the hint once more; then quiet. Game time, waiting while anyone speaks or the phone is upright; any tap starts it
  // again. Timeouts only (no interval, no rAF): a still map costs nothing (docs/PERF.md).
  useEffect(() => {
    if (talking || heroAt < 0) return;
    const STEPS = [8000, 16000, 40000];
    let base = performance.now(), k = 0, t = 0, live = true;
    const arm = () => {
      clearTimeout(t);
      if (k < STEPS.length) t = window.setTimeout(fire, Math.max(0, STEPS[k] - (performance.now() - base) * FAST));
    };
    const fire = () => {
      if (!live) return;
      // (someone is talking, or the phone is upright: this second doesn't count)
      if (isUpright() || isSpeaking()) return void ((base += 1000 / FAST), arm());
      setCue("wave");
      if (k === 0) window.setTimeout(() => live && setCue(null), 1200);
      else void say({ line: hintLine }).then(() => live && setCue(null));
      k++;
      arm();
    };
    const reset = () => ((base = performance.now()), (k = 0), arm());
    arm();
    window.addEventListener("pointerdown", reset, true);
    return () => {
      live = false;
      clearTimeout(t);
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [talking, heroAt, wi]);
  // (a stone is never ignored now: one tapped during the arrival lines is taken, so the map is never `busy`; once one has
  // been taken there is nothing left to answer (`next` null, `chosen` set) until the level starts. Bots and the checks
  // read it: script-audit ignores taps made while busy)
  (window as any).__snState = { scene: "map", world: w.id, next: chosen ? null : cur.id, busy: false, ...(chosen ? { chosen } : {}) };
  const fromIdx = useRef(w.levels.findIndex((l) => l.id === mapAnim.from)).current;
  // 0 = at the finished stone, 1 = running to the next, 2 = arrived
  const [walk, setWalk] = useState(fromIdx < 0 || heroAt < 0 ? 2 : 0);
  const [arrived, setArrived] = useState(false); // the little victory hop on reaching the next stone
  useEffect(() => {
    mapAnim.from = null;
    if (walk === 2) return;
    const t1 = setTimeout(() => setWalk(1), 450);
    let t3 = 0;
    const t2 = setTimeout(() => {
      setWalk(2);
      setArrived(true);
      t3 = window.setTimeout(() => setArrived(false), 800);
      const p = nodePos(heroAt, w.levels.length);
      sfx.petal();
      sfx.jump();
      fx.burst(p.x, p.y, "blossoms", 24);
      fx.ring(p.x, p.y - 20, { color: "#ffe38a", r0: 20, r1: 130, width: 10 });
      fx.twinkle(p.x, p.y - 130, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 6);
    }, 1350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="scene map">
      <img className="bg-img" src={img(`bg_${w.key}`)} alt="" key={w.key} style={{ animation: "fadein .5s" }} />
      <div className="vignette" />
      <PetalDrift n={6} />
      {/* path */}
      <svg width={W} height={720} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {(() => {
          const d = w.levels.map((_, i) => { const p = nodePos(i, w.levels.length); return `${i ? "L" : "M"}${p.x},${p.y}`; }).join(" ");
          return (
            <>
              <path d={d} fill="none" stroke="rgba(43,29,20,.55)" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#f6e3bb" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#2b1d14" strokeWidth={6} strokeLinecap="round" strokeDasharray="1 22" opacity={0.5} />
            </>
          );
        })()}
      </svg>
      {w.levels.map((l, i) => {
        const p = nodePos(i, w.levels.length);
        const open = isUnlocked(l);
        const st = stars[l.id] ?? 0;
        const isCur = l.id === cur.id;
        const boss = l.kind === "boss";
        // the ONE thing to tap is big, gold and bouncing; finished stones are normal; locked ones recede
        const size = isCur ? (w.levels.length > 16 ? 132 : w.levels.length > 10 ? 146 : 158) : !open ? (w.levels.length > 16 ? 76 : 84) : boss ? (w.levels.length > 16 ? 112 : 128) : w.levels.length > 16 ? 94 : 104; // two- and three-row maps are tighter
        const icon = l.kind === "battle" || l.kind === "boss" ? `mon_${l.monster}` : KIND_ICON[l.kind];
        return (
          <button
            key={l.id}
            aria-label={`level ${l.id}`}
            ref={(el) => void (stoneEls.current[l.id] = el)}
            {...tapProps(() => {
              if (open && !stonesLive) take(l.id);
              else if (open) {
                sfx.pop();
                onLevel(l.id);
              } else {
                sfx.wrong();
                say({ line: lockedLine });
              }
            })}
            className={chosen === l.id ? "map-chosen" : isCur ? "map-next" : "pop-in"}
            style={{
              position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, borderRadius: "50%",
              background: isCur ? "radial-gradient(circle at 40% 30%, #fffbe6, #ffc53d 70%, #c98a00)" : open ? `radial-gradient(circle at 40% 30%, #fffaf0, ${w.colour} 75%)` : "radial-gradient(circle at 40% 30%, #cfc8d6, #6f6878)",
              border: `${isCur ? 7 : 5}px solid var(--ink)`, boxShadow: isCur ? "0 8px 0 var(--ink), 0 0 0 10px rgba(255,197,61,.45), 0 0 40px 14px rgba(255,230,140,.8)" : "0 6px 0 var(--ink), 0 12px 18px rgba(0,0,0,.3)",
              animationDelay: `${i * 0.05}s`, opacity: open ? 1 : 0.8, zIndex: isCur ? 7 : 5,
            } as CSSProperties}
          >
            {/* "Every stone is a game.": the stones glow in a wave (one-shot, transform and opacity only) */}
            {cue === "stones" && <span className="map-wave" style={{ animationDelay: `${0.15 + i * 0.07}s` }} aria-hidden="true" />}
            {/* taken before the stones woke: a golden ring (one-shot) as it lights up */}
            {chosen === l.id && <span className="map-wave" aria-hidden="true" />}
            <img src={img(icon)} alt="" style={{ width: "86%", height: "86%", objectFit: "contain", filter: open ? "none" : "grayscale(.85) opacity(.7)" }} />
            {!open && <span style={{ position: "absolute", right: -10, bottom: -10, width: 40, height: 40 }}><Icon.lock /></span>}
            {/* the pointing hand sits below-right, or straight below for stones near the right edge (Help corner) */}
            {isCur && <TapHint show={!chosen} style={p.x > 900 ? { left: "calc(50% - 50px)", bottom: -84 } : { right: -70, bottom: -60 }} />}
            {st > 0 && !l.warmup && (
              <span style={{ position: "absolute", left: "50%", bottom: -34, translate: "-50% 0", display: "flex", gap: 0 }}>
                {[1, 2, 3].map((k) => <span key={k} style={{ width: 34, height: 34 }}><Icon.star on={k <= st} /></span>)}
              </span>
            )}
          </button>
        );
      })}
      {heroAt >= 0 && (() => {
        const p = nodePos(walk === 0 ? fromIdx : heroAt, w.levels.length);
        // the ninja stands ON its stone like a game piece (feet just below the stone's centre, in front of it), so on
        // two-row maps it never drifts up among the other row's stones
        return (
          <div
            {...tapProps(() => {
              if (!stonesLive) return take(cur.id);
              sfx.pop();
              onLevel(cur.id);
            })}
            data-tap-proxy // the hero is a shortcut into the current level (treadmill: may cover a node)
            className="map-hero"
            // (placed with a transform, so its run to the next stone is on the compositor: docs/PERF.md minor)
            style={{ transform: `translate(${p.x - MAP_HERO_W / 2}px, ${p.y + 26 - MAP_HERO_H}px)` }}
          >
            <img key={cue === "wave" ? "wave" : "stand"} className={`sprite ${arrived || cue === "wave" ? "map-hero-hop" : walk === 2 ? "bob" : ""}`} src={heroImg(hero, arrived || cue === "wave" ? "cheer" : walk === 2 ? "idle" : "run")} alt="" />
          </div>
        );
      })()}
      {/* world banner */}
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <RoundButton sm label="previous world" onClick={() => setWi((i) => Math.max(0, i - 1))} style={{ visibility: wi > 0 ? "visible" : "hidden" }}><Icon.back /></RoundButton>
        <div className="panel" style={{ padding: "6px 34px", background: w.colour, minWidth: 460, textAlign: "center" }}>
          <span className="display" style={{ fontSize: 54 }}>{w.name}</span>
        </div>
        <RoundButton sm label="next world" onClick={() => worldOpen(wi + 1) ? setWi((i) => i + 1) : (sfx.wrong(), say({ line: lockedLine }))} style={{ visibility: wi < WORLDS.length - 1 ? "visible" : "hidden", filter: worldOpen(wi + 1) ? undefined : "grayscale(1)" }}><Icon.next /></RoundButton>
      </div>
      <div style={{ position: "absolute", top: 18, right: 18 }}>
        <HoldButton onHold={onGrownups} />
      </div>
      {/* the Sticker Book, the World Flower and Sensei's Challenge stack down the right edge (the Help button owns bottom-right) */}
      <div className="map-side">
        <div style={{ position: "relative" }}>
          <RoundButton label="Sticker Book" className={bookHint ? "pulse" : ""} onClick={onBook} style={{ background: "radial-gradient(circle at 35% 30%, #ffd9c9 0%, #c9553f 55%, #7a2e2a 100%)" }}>
            <img src={img("item_sticker_book")} alt="" style={{ width: "92%", height: "92%", objectFit: "contain" }} />
          </RoundButton>
          {bookHint && <TapHint show style={{ left: -70, bottom: -40 }} />}
        </div>
        <div style={{ position: "relative" }}>
          <RoundButton label="World Flower" className={`pink ${readyCount || due || cue === "flower" ? "pulse" : ""}`} onClick={onTree}><Icon.tree /></RoundButton>
          {readyCount > 0 && <span className="map-badge">{readyCount}</span>}
          {cue === "flower" && <TapHint show style={{ left: -70, bottom: -40 }} />}
        </div>
        {LEVELS.indexOf(cur) >= LEVELS.findIndex((l) => l.id === AFTER_WARMUPS) + 2 && (
          <RoundButton label="Sensei's Challenge" className="map-challenge" onClick={() => { makeReview(cur); onLevel("review"); }}>
            {/* a target with a shuriken stuck in the bullseye: "a challenge", with no second Sensei face on screen */}
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="26" fill="#fff4dc" stroke="#2b1d14" strokeWidth="4" />
              <circle cx="32" cy="32" r="18.5" fill="#e8453c" stroke="#2b1d14" strokeWidth="3" />
              <circle cx="32" cy="32" r="11" fill="#fff4dc" stroke="#2b1d14" strokeWidth="3" />
              <circle cx="32" cy="32" r="4.5" fill="#e8453c" stroke="#2b1d14" strokeWidth="2.5" />
            </svg>
            <img src={img("item_shuriken")} alt="" className="map-challenge-star" />
          </RoundButton>
        )}
      </div>
      <SenseiDock hidden />
    </div>
  );
}

/** Grown-ups gate: press and hold for 2 seconds. */
function HoldButton({ onHold }: { onHold: () => void }) {
  const [p, setP] = useState(0);
  const [hint, setHint] = useState(false); // a short tap shows how to get in, for grown-ups with the sound off
  const t = useRef<number | undefined>(undefined);
  const pRef = useRef(0);
  const start = () => {
    const t0 = performance.now();
    say({ line: "grownups" });
    const tick = () => {
      const v = (performance.now() - t0) / 2000;
      setP(v);
      pRef.current = v;
      if (v >= 1) {
        stop();
        onHold();
      } else t.current = requestAnimationFrame(tick);
    };
    t.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(t.current!);
    if (pRef.current > 0 && pRef.current < 1) {
      setHint(true);
      setTimeout(() => setHint(false), 2600);
    }
    pRef.current = 0;
    setP(0);
  };
  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn-round sm"
        aria-label="Grown-ups (hold)"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        style={{ background: `conic-gradient(var(--good) ${p * 360}deg, #d8cfc0 0)` }}
      >
        <Icon.gear />
      </button>
      {hint && <div className="hold-hint pop-in">Grown-ups: press and hold</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Reward
/** What Sensei says about the gems on a reward screen (NARRATIVE_AUDIT F04; it used to say "Your gems are filling up
 *  with ninja energy!" after every level): a gem ready for its battle; the explanation, once per child, if the level
 *  itself didn't give it; "Look, this gem has filled a little more." when a gem crosses half full, or at the first
 *  reward in a land that fills one; otherwise nothing (the rings fill in silence). */
export function rewardGemLine(gains: { before: number; after: number }[], readyNow: boolean, world: number): string | null {
  return rewardGemFocus(gains, readyNow, world).line;
}
/** What the reward says about gem energy, and which gems it is about (they lift and pulse while it is said, the others
 *  dim; several are pulsed in turn): a gem that has just filled, in gemReadySay()'s words (the save's first: "When a
 *  gem is full, it glows. Then you can win it in a gem battle!", SCRIPT_FIXES C8.2; later "A gem is glowing!…", at
 *  most once a session; `key` is recorded once it has been said), only to a child who can be offered a gem battle (5 or
 *  more: a preschool child heard the promise six times in one session, verify round 2); otherwise, as for any gem, the
 *  first gem ever (the explanation, moved here from w1-4's we do: TEACHER_SCRIPT §5.7), gems that crossed half full
 *  ("Look, these gems…" for more than one), or the land's first mention (the gem that gained most). */
export function rewardGemFocus<T extends { before: number; after: number }>(gains: T[], readyNow: boolean, world: number): { line: string | null; gems: T[]; key?: string | null } {
  const ready = readyNow ? gemReadySay() : null;
  if (ready) return { line: ready.line, gems: gains.filter((g) => g.after >= 1 && g.before < 1), key: ready.key };
  // (a ready gem no battle can be promised for yet, or this session's news already said: it glows in silence, and the
  // energy lines below apply as they would to any gem)
  if (!gains.length) return { line: null, gems: [] };
  if (!heardBefore("gem-energy")) return { line: "audit_gem_first", gems: gains.slice(0, 1) };
  const crossed = gains.filter((g) => g.before < 0.5 && g.after >= 0.5);
  if (crossed.length > 1) return { line: has("r2_gems_more") ? "r2_gems_more" : "audit_gem_more", gems: crossed };
  if (crossed.length) return { line: "audit_gem_more", gems: crossed };
  return !heardBefore(`gem-more:w${world}`) ? { line: "audit_gem_more", gems: gains.slice(0, 1) } : { line: null, gems: [] };
}
/** The sounds a level wins back (Dec8, SD r58, A10): the distinct sounds of what it teaches, counted as sounds, not
 *  spellings (< ai > and < ay > are one sound, /ae/). A level played again wins nothing new. */
export function wonSoundsOf(level: Pick<Level, "teach">, firstWin: boolean): PhonemeId[] {
  return firstWin ? [...new Set((level.teach ?? []).map((t) => teachEntry(t).p))] : [];
}
/**
 * Where the green arrow goes next, said last on a reward when a World Flower trip follows (TEACHER_SCRIPT §3.14, §5.7):
 * - the save's first trip: "Now let's go and see where your sounds live. Tap the green arrow." (any number of sounds);
 * - a trip with two or more won sounds: "Let's take your new sounds to the World Flower. Tap the green arrow.";
 * - one won sound, or a new spelling of a sound the child knows: the same line in the singular, `tv_to_flower_one`
 *   ("Let's take your new sound to the World Flower. Tap the green arrow.") once it is recorded; until then the first
 *   trip's words, which are true of any trip ("…where your sounds live. Tap the green arrow."). (`tv_to_flower`'s "your
 *   new sounds" was untrue after "You won back a sound…", verify round 1; and "Let's visit the World Flower! · Tap the
 *   green arrow when you're ready." after one sound but one line after two was inconsistent, verify round 2);
 * - a new land's visit (after the boss): nothing. The boss wins no sounds, and the visit opens with its own "Let's
 *   visit the World Flower!" (or "Look how your World Flower is growing!") as the flower appears.
 * So every trip is led the same way: one line, ending "Tap the green arrow.", with ▶ lit on "green arrow" (ARROW_LINES).
 * The first trip's line is recorded as heard once it starts (the caller). The last resort (none of those recorded) is
 * the old pair.
 */
export function toFlowerLines(trip: FlowerVisit | null, won: number, o: { first?: boolean; has?: (id: string) => boolean } = {}): string[] {
  const ok = o.has ?? has;
  if (!trip || trip.kind === "world") return [];
  if ((o.first ?? onceInSave("reward:to-flower")) && ok("tv_to_flower_first")) return ["tv_to_flower_first"];
  if (won >= 2 && ok("tv_to_flower")) return ["tv_to_flower"];
  if (won < 2 && ok("tv_to_flower_one")) return ["tv_to_flower_one"];
  if (ok("tv_to_flower_first")) return ["tv_to_flower_first"];
  return ["t_visit", "nav_ready"];
}
/** The reward's ask for the won petals (TEACHER_SCRIPT §5.7, the 12 s rule; B1 pre-ship, 28 Sep): one line, "You won
 *  back two sounds! Tap each petal, and hear its sound." (`tv_won_tap_<n>`, `tv_won_tap_many` for five or more), once
 *  recorded; until then the won line ("You won back two sounds…") and "Tap your petal, and hear its sound." The petals
 *  are the child's to tap from the ask's (last) line. */
export function wonTapLines(n: number, wonLine: string | null, ok: (id: string) => boolean = has): string[] {
  if (!n) return [];
  const id = n <= 4 ? `tv_won_tap_${NUMBER_WORDS[n]}` : "tv_won_tap_many";
  if (ok(id)) return [id];
  return [...(wonLine ? [wonLine] : []), ...(ok("tv_rw2_tap_petal") ? ["tv_rw2_tap_petal"] : [])];
}
/** The reward's lines that name the green arrow: ▶ lights, spotlit, as Sensei says "green arrow" (as a Ready's
 *  `tv_ready_first` does), not after the line (verify round 2: "Tap the green arrow." while ▶ was still grey). */
const ARROW_LINES = new Set(["tv_to_flower_first", "tv_to_flower", "tv_to_flower_one", "nav_ready"]);
const LINE_TEXT = new Map(LINES.map((l) => [l.id, l.text]));
/** When `word` is said in line `id` (game ms from the clip's start): its measured time (content/word-times.ts) if the
 *  line has word timings, else estimated from the text (letters, with a pause at each full stop or comma) and the
 *  clip's length `durMs` (game ms), as nav.tsx's holds do. Null if the line doesn't say it. */
function wordMs(id: string, word: string, durMs: number): number | null {
  const measured = wordAt(id, word);
  if (measured !== undefined) return measured * 1000;
  const toks = (LINE_TEXT.get(id) ?? "").split(/\s+/).filter(Boolean);
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z']/g, "");
  const i = toks.findIndex((t) => norm(t) === word.toLowerCase());
  if (i < 0) return null;
  const weight = (t: string) => t.replace(/[^A-Za-z']/g, "").length + (/[.!?…]$/.test(t) ? 7 : /[,;:]$/.test(t) ? 3 : 1);
  const all = toks.reduce((n, t) => n + weight(t), 0);
  return all ? (durMs * toks.slice(0, i).reduce((n, t) => n + weight(t), 0)) / all : null;
}
/** The won sounds' petals: a turn-size petal each (104: its picture ≥ 38 CSS px on a phone), in a row left of the
 *  Sticker Book (the panel's 740 less `.rw-won`'s 24 and 170 insets). < x >'s /k/ + /s/ is drawn at full size (spread:
 *  each half a 104 petal, its pictures ≥ 38 CSS px too) and given its real width in the row. A row too wide for the room
 *  (w3-6's six sounds, the pair among them: 889 px) becomes two rows, the first no shorter than the second (verify round
 *  2: it stuck 39 CSS px out of the panel's left edge, the pair overlapped /y/, and /z/ hid behind the book). */
const WON_PETAL = 104;
const WON_GAP = 26;
const WON_ROW_GAP = 6;
const WON_ROOM = 740 - 24 - 170;
const wonWidth = (p: string) => (PAIRS[p] ? soundWidth(p, WON_PETAL, "turn", true) : WON_PETAL);
const rowWidth = (row: readonly string[]) => row.reduce((n, p) => n + wonWidth(p), 0) + Math.max(0, row.length - 1) * WON_GAP;
function wonRows<T extends string>(won: readonly T[]): T[][] {
  if (won.length < 2 || rowWidth(won) <= WON_ROOM) return won.length ? [[...won]] : [];
  for (let k = Math.ceil(won.length / 2); k < won.length; k++) {
    const a = won.slice(0, k), b = won.slice(k);
    if (rowWidth(a) <= WON_ROOM && rowWidth(b) <= WON_ROOM) return [a, b];
  }
  return [won.slice(0, Math.ceil(won.length / 2)), won.slice(Math.ceil(won.length / 2))];
}
/**
 * A level's reward (TEACHER_SCRIPT §5.7, SCRIPT_FIXES C7, SOUND_DISPLAY r58), never a monologue (the 12 s rule; B1
 * pre-ship, 28 Sep: it ran 16–37 s before the child could tap): the news first, and the child's tap within about 3 s.
 * The won sounds' petals rise into the panel in the mist (a chime and a warm light on the save's first three) · "You won
 * back two sounds! Tap each petal, and hear its sound.": each blooms on its own sound as it is tapped (8 s idle: the rest
 * bloom in turn). Then the new stickers: on the session's first two rewards "More stickers for your Sticker Book! Tap
 * them, and they'll jump in." (they wiggle; a tap, or 8 s, sends them into the book), later ones fly in silence. Gem
 * energy fills below, and, when a World Flower trip is due, "Let's take your new sounds to the World Flower. Tap the
 * green arrow." ▶ is live from there: the rest nudge is said while the child can go on.
 * Stars stay in the background: they unlock the map and show as a small row for grown-ups. "You did it!" only when the
 * level had no closing line of its own (the closing line was its praise).
 */
function Reward({ level, stars, closing, onNext, onReplay, onFlower, onJumped }: { level: Level; stars: number; closing?: string; onNext: (finale: boolean) => void; onReplay: () => void; onFlower: () => void; onJumped: () => void }) {
  // snapshot this level's energy gains (largest first)
  const [gains] = useState(() =>
    Object.entries(levelGains)
      .map(([key, g]) => {
        const gem = gemByKey(key);
        const after = energyOf(key);
        return gem && g > 0 ? { gem, after, before: Math.max(0, after - g / ENERGY_FULL) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => b.after - b.before - (a.after - a.before))
      .slice(0, 5),
  );
  const readyNow = gains.some((x) => x.after >= 1 && x.before < 1);
  // the words met for the first time in this level: new stickers (the store added them to the Sticker Book already)
  const [newWords] = useState(() => levelNewWords.slice(0, 5));
  const [bookTotal] = useState(() => (store.get().stickers ?? []).length);
  const [filled, setFilled] = useState(false);
  // the gem Sensei is talking about (it lifts and pulses; the others dim), while she talks about it
  const [gemFocus, setGemFocus] = useState<string | null>(null);
  // the stickers: "" not yet, "in" popped up, "fly" peeling off into the book, "home" all in the book
  const [stuck, setStuck] = useState<"" | "in" | "fly" | "home">("");
  const [landed, setLanded] = useState(0);
  const stickerEls = useRef<(HTMLElement | null)[]>([]);
  const bookEl = useRef<HTMLDivElement>(null);
  const [offerJump] = useState(() => level.id !== "review" && !level.trialGem && shouldOfferJump({ ...store.get(), stars: { ...store.get().stars, [level.id]: Math.max(store.get().stars[level.id] ?? 0, stars) } }));
  const [jumping, setJumping] = useState(false);
  const [talked, setTalked] = useState(false); // Sensei has finished the reward speech: Next turns green
  // ...or earlier, as she names it: ▶ lights (and is spotlit for 1.7 s) on "green arrow" in "…Tap the green arrow."
  const [lit, setLit] = useState(false);
  const [spot, setSpot] = useState(false);
  const talkTok = useRef(0);
  const alive = useRef(true);
  const w = worldOf(level);
  const newPetals = [...new Set((level.teach ?? []).map((t) => t.split("=")[0]))]; // spellings, for the save
  const isLastInWorld = w.levels[w.levels.length - 1].id === level.id;
  // the finale plays once, at the real end: the final battle at Muddle Castle (null until it exists; audit §2.4)
  const isFinale = level.id === FINALE_LEVEL;
  // the sounds won back (Dec8): a level's first win only (read before this reward records its stars)
  const [won] = useState(() => wonSoundsOf(level, level.id !== "review" && !level.trialGem && !((store.get().stars[level.id] ?? 0) > 0)));
  const petalEls = useRef<(HTMLElement | null)[]>([]);
  // the won sounds' petals rise into the panel in the mist as the speech starts ("Let's see what you won back from Baron
  // Muddle."), and each blooms on its own sound after "You won back…"
  const [petalsUp, setPetalsUp] = useState(false);
  const [soft, setSoft] = useState(false); // "Let's see what you won back…": a warm light over the scene
  // what the speech says, decided once (Hear it again says the same, even after a once-per-save line was heard)
  const [plan] = useState(() => {
    const trip = isFinale ? null : flowerVisitAfter(level);
    // the land's "You found every sound in this land! Let's go to the next one!" only when the next land's map comes
    // straight after (a boss played again): the first time, the new land's World Flower visit comes first, and it
    // closes with "New sounds are hiding in this land. Let's go and find them!" (verify round 1, 27 Sep)
    // (the spoken drumroll, "Let's see what you won back from Baron Muddle.", is left out: the chime and the warm light
    // stay, and the child opens the news with a tap instead, within about 3 s: the 12 s rule, B1 pre-ship 28 Sep)
    const full = rewardLead({ closingSaid: !!closing, boss: level.kind === "boss", newPetals: won.length, lastInWorld: isLastInWorld && !trip && w.id < WORLDS.length, finale: isFinale, toReward: toRewardDue(), has });
    const lead = full.filter((id) => id !== "tv_to_reward");
    const wonLine = lead.find((id) => id.startsWith("tv_won_") || id === "petal_got" || id === "petals_got") ?? null;
    return { lead, wonLine, soft: full.includes("tv_to_reward"), tapWon: wonTapLines(won.length, wonLine), more: newWords.length > 0 && moreStickersDue(), gem: rewardGemFocus(gains, readyNow, w.id), toFlower: toFlowerLines(trip, won.length) };
  });
  // the child's own taps (TEACHER_SCRIPT §0.1, §5.7): the won petals ("Tap each petal, and hear its sound.": each
  // blooms on its own sound as it is tapped), then the new stickers ("…Tap them, and they'll jump in."). `petalLive` /
  // `stickLive`: that tap is open (the petals breathe, the stickers wiggle); an 8 s idle does it for the child
  const [petalLive, setPetalLive] = useState(false);
  const petalLiveRef = useRef(false);
  const bloomedRef = useRef<boolean[]>(won.map(() => false));
  const [bloomed, setBloomed] = useState<boolean[]>(() => won.map(() => false));
  const petalWaiter = useRef<((said: Promise<boolean>) => void) | null>(null);
  const [stickLive, setStickLive] = useState(false);
  const stickWaiter = useRef<(() => void) | null>(null);
  const openPetals = (on: boolean) => {
    petalLiveRef.current = on;
    setPetalLive(on);
  };
  const bloom = (ks: number[]) => {
    ks.forEach((k) => (bloomedRef.current[k] = true));
    setBloomed([...bloomedRef.current]);
  };
  const petalSay = (k: number): Say => ({ sound: won[k], show: "petal", at: () => petalEls.current[k] ?? null });
  /** A won petal tapped while the tap is open: it blooms on its own sound. */
  const tapPetal = (k: number) => {
    if (!petalLiveRef.current || bloomedRef.current[k]) return;
    bloom([k]);
    const said = say(petalSay(k));
    petalWaiter.current?.(said);
  };
  /** The petals' tap: each petal as the child taps it; after 8 s with no tap, the rest bloom in turn by themselves. */
  const petalStage = async (live: () => boolean) => {
    openPetals(true);
    while (live() && bloomedRef.current.some((b) => !b)) {
      const tapped = await Promise.race([new Promise<Promise<boolean>>((r) => (petalWaiter.current = r)), sleep(8000).then(() => null)]);
      petalWaiter.current = null;
      if (!live()) return false;
      if (tapped) {
        await tapped;
        await sleep(250);
        continue;
      }
      const rest = won.map((_, k) => k).filter((k) => !bloomedRef.current[k]);
      bloom(rest);
      await say(rest.flatMap((k, i): Say[] => [...(i ? [{ gap: 450 }] : []), petalSay(k)]));
    }
    openPetals(false);
    return live();
  };
  // a rest nudge, once per session (a replay says it again if it was said)
  const [rest] = useState(() => {
    const mins = performance.now() / 60_000;
    if (restNudged || !(mins > 18 || (mins > 12 && w.key === WORLDS[0].key))) return null;
    restNudged = true;
    return mins > 18 ? "break_time" : has("tv_rest") ? "tv_rest" : "dojo_nap";
  });
  /** Say the gem line with its gem(s) lifted and pulsing (several: in turn). */
  const gemTalk = async (line: string, keys: string[], live: () => boolean) => {
    setGemFocus(keys[0] ?? null);
    const turns = keys.slice(1).map((k, i) => setTimeout(() => live() && setGemFocus(k), 900 * (i + 1)));
    const ok = await say({ line });
    turns.forEach(clearTimeout);
    await sleep(400);
    if (live()) setGemFocus(null);
    return ok;
  };
  // the stickers wait in the panel until the news has been said (TEACHER_SCRIPT §5.7: the won sounds first, then the
  // stickers fly into the book); with no sounds won they peel off straight away
  const flyGate = useRef<() => void>(() => {});
  const [flyOpen] = useState(() => new Promise<void>((r) => (flyGate.current = r)));
  /** The lead: the celebration (if the level had no closing line), then the news, each won sound after its line. */
  const leadSay = (): Say[] => {
    const seq: Say[] = [];
    for (const id of plan.lead) {
      if (seq.length) seq.push({ gap: 250 });
      seq.push({ line: id });
      if (id === plan.wonLine) won.forEach((p, k) => seq.push({ gap: k ? 450 : 200 }, { sound: p, show: "petal", at: () => petalEls.current[k] ?? null }));
    }
    return seq;
  };
  /**
   * Sensei's reward speech. `first`: as the reward opens (the stickers wait for the news, then fly; the gem fills);
   * otherwise Hear it again, which starts with the level's closing line (docs/NAVIGATION.md rule 7) and takes over from
   * a speech still playing. Next turns green once a speech has been said to its end.
   */
  const talk = async (first: boolean, flown?: Promise<unknown>) => {
    const my = ++talkTok.current;
    const live = () => alive.current && my === talkTok.current;
    if (plan.wonLine) setPetalsUp(true);
    const lines = (ids: string[]): Say[] => ids.flatMap((id, i): Say[] => [...(i ? [{ gap: 250 }] : []), { line: id }]);
    if (first) {
      // the news: a chime and a warm light as the petals rise in the mist (the save's first three rewards with a new
      // sound), the celebration if the level had no closing line, then "You won back two sounds! Tap each petal, and
      // hear its sound.": the petals are the child's to tap from that line's first word
      if (plan.soft) {
        sfx.twinkle();
        setSoft(true);
        heard(TO_REWARD);
      }
      const wi = plan.wonLine ? plan.lead.indexOf(plan.wonLine) : -1;
      const pre = wi >= 0 ? plan.lead.slice(0, wi) : plan.lead;
      const post = wi >= 0 ? plan.lead.slice(wi + 1) : [];
      const ask = won.length ? plan.tapWon : [];
      if (ask.length) void nextClip(ask[ask.length - 1], 15000).then((c) => c && live() && openPetals(true));
      if (pre.length || ask.length) await say(lines([...pre, ...ask]));
      if (!live()) return false;
      if (won.length && !(await petalStage(live))) return false;
      // ("You found every sound in this land!…")
      if (post.length) await say([{ gap: 250 }, ...lines(post)]);
      if (!live()) return false;
    } else {
      // Hear it again: the level's closing line, then the news as Sensei says it, each petal on its own sound
      openPetals(false);
      bloom(won.map((_, k) => k));
      setStickLive(false);
      const seq: Say[] = [...(closing ? [{ line: closing }, { gap: 300 }] : []), ...leadSay()];
      if (seq.length) await say(seq);
      if (!live()) return false;
    }
    // the Sticker Book, as the new stickers fly into it. On the session's first two rewards Sensei says so, and the
    // stickers are the child's to tap into the book ("More stickers for your Sticker Book! Tap them, and they'll jump
    // in."; until that line is recorded, "More stickers for your Sticker Book!" and a shorter wait); later ones fly in
    // silence
    if (newWords.length) {
      if (first && plan.more) {
        await sleep(250);
        if (!live()) return false;
        const line = has("tv_rw_stickers_tap") ? "tv_rw_stickers_tap" : "fm_rw_more";
        let tapped = false;
        const tap = new Promise<void>((r) => (stickWaiter.current = () => ((tapped = true), r())));
        void nextClip(line, 4000).then((c) => c && live() && !tapped && setStickLive(true));
        const said = await say({ line });
        if (said) moreStickersSaid();
        if (!live()) return false;
        if (!tapped) {
          setStickLive(true);
          await Promise.race([tap, sleep(line === "tv_rw_stickers_tap" ? 8000 : 3000)]);
        }
        stickWaiter.current = null;
        setStickLive(false);
        flyGate.current();
      } else {
        flyGate.current();
        if (plan.more && !first) await say({ line: "fm_rw_more" });
      }
      if (flown) await Promise.race([flown, sleep(2600)]);
      if (!live()) return false;
    } else flyGate.current();
    // gem energy (NARRATIVE_AUDIT F04): explained once per child (in the level where it first fills, or here), then
    // only mentioned when a gem visibly gets somewhere: half full, full, or the first gem to fill in a new land
    setFilled(true);
    const g = plan.gem;
    if (g.line) {
      if (first) {
        if (readyNow) sfx.petal();
        // the gem it is about lifts and pulses while it is said (several: in turn), once its energy has risen
        await sleep(900);
        if (!live()) return false;
      }
      const ok = await gemTalk(g.line, g.gems.map((x) => x.gem.key), live);
      if (ok && g.line === "audit_gem_first") heard("gem-energy");
      if (ok && (g.line === "audit_gem_more" || g.line === "r2_gems_more")) heard(`gem-more:w${w.id}`);
      if (ok && g.key) heard(g.key);
      if (!live()) return false;
    }
    // the grown-ups' aside (Dec9), with the Jump ahead button glowing: before "…Tap the green arrow.", so a child who
    // goes on at once never cuts it off (at most once a session, never in the first two)
    if (offerJump) await say({ line: has("tv_jump_offer") ? "tv_jump_offer" : "jump_offer" });
    if (!live()) return false;
    // a World Flower trip is due: where the green arrow goes next ("…Tap the green arrow.", ▶ lighting on "green")
    if (plan.toFlower.length) {
      // (the save's first counts once it has started, so a child who goes on as soon as ▶ is green doesn't hear it again)
      if (first && plan.toFlower[0] === "tv_to_flower_first") void nextClip(plan.toFlower[0]).then((c) => c && heard("reward:to-flower"));
      await say(plan.toFlower.flatMap((line, i): Say[] => [{ gap: i ? 250 : 200 }, { line }]));
      if (!live()) return false;
    }
    // ▶ is live from here: what follows is said while the child can go on (the 12 s rule, B1 pre-ship 28 Sep)
    setLit(true);
    // gentle rest nudge: little ones (Bamboo Village) after ~12 minutes, everyone after ~18; once per session. The ninja
    // bows as Sensei says it ("…your ninja will wait for you": there is no yawn in the art yet)
    if (rest && live()) {
      void nextClip(rest, 3000).then((c) => c && live() && ninja.mounted && void ninja.act("bow"));
      await say([{ gap: 300 }, { line: rest }], { keep: true });
    }
    if (!live()) return false;
    setTalked(true);
    return true;
  };
  const replay = () => talk(false);
  // Help while a tap is open asks for it again; otherwise the first Help says the reward again
  useHelp((n) => (petalLiveRef.current && plan.tapWon.length ? say({ line: plan.tapWon[plan.tapWon.length - 1] }) : stickLive ? say({ line: has("tv_rw_stickers_tap") ? "tv_rw_stickers_tap" : "fm_rw_more" }) : n === 1 && !talked ? void replay() : say({ line: "nav_ready" })), [talked, stickLive]);
  useNav({ again: replay, next: { ready: talked || lit, go: () => onNext(isFinale) }, spot: spot ? "next" : null });
  // "Tap the green arrow.": ▶ turns green and is spotlit as she says "green" (a moment before, so it has lit as the
  // word lands), whichever line says it (the trip's lead, or Help's "Tap the green arrow when you're ready.")
  useEffect(() => {
    const timers: number[] = [];
    const off = onClip((id, start, end) => {
      if (!ARROW_LINES.has(id)) return;
      const at = wordMs(id, "green", (end - start) * FAST) ?? 0;
      timers.push(
        window.setTimeout(() => {
          if (!alive.current) return;
          setLit(true);
          setSpot(true);
          timers.push(window.setTimeout(() => alive.current && setSpot(false), 1700));
        }, Math.max(0, at - 150)),
      );
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (level.id !== "review" && !(store.get().stars[level.id] > 0)) mapAnim.from = level.id;
    store.set((s) => {
      if (level.id === "review") return;
      s.stars[level.id] = Math.max(s.stars[level.id] ?? 0, stars);
      for (const g of newPetals) if (!s.petals.includes(g)) s.petals.push(g);
    });
    playMusic(null);
    let live = true;
    // the stickers pop up (the ninja cheers), wait for the news, then peel off one by one into the Sticker Book: "+N"
    const flown = (async () => {
      sfx.fanfare();
      fx.rain("confetti", 70);
      void ninja.act("cheer");
      if (!newWords.length) return;
      await sleep(350);
      if (!live) return;
      setStuck("in");
      sfx.pop();
      await Promise.all([sleep(1500), flyOpen]);
      if (!live) return;
      setStuck("fly");
      const book = bookEl.current ? stageRect(bookEl.current) : null;
      const flights = stickerEls.current.slice(0, newWords.length).map((el, i) => {
        if (!el || !book) return Promise.resolve();
        const r = stageRect(el);
        const dx = book.x + book.w / 2 - (r.x + r.w / 2), dy = book.y + book.h * 0.45 - (r.y + r.h / 2);
        const a = el.animate(
          [
            { translate: "0 0", rotate: "0deg", scale: "1", opacity: 1 },
            { translate: "0 -22px", rotate: "-9deg", scale: "1.1", opacity: 1, offset: 0.28 },
            { translate: `${dx}px ${dy}px`, rotate: "14deg", scale: "0.22", opacity: 0.35 },
          ],
          { duration: 820, delay: i * 130, easing: "cubic-bezier(.45,0,.6,1)", fill: "forwards" },
        );
        return a.finished.then(() => {
          if (!live) return;
          setLanded((n) => n + 1);
          sfx.place();
          const p = stageXY(bookEl.current);
          fx.twinkle(p.x, p.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 8, 4);
        }).catch(() => {});
      });
      await Promise.all(flights);
      if (!live) return;
      setStuck("home");
      void ninja.act("jump");
    })();
    alive.current = true;
    void sleep(400).then(() => live && talk(true, flown));
    return () => {
      live = false;
      alive.current = false;
    };
  }, []);
  // (the bots: `next` is the tap that is open, the first petal still in the mist or the stickers; its overlay is a button.card)
  const nextPetal = petalLive ? won.findIndex((_, k) => !bloomed[k]) : -1;
  (window as any).__snState = { scene: "reward", talked, ...(nextPetal >= 0 ? { next: `petal ${won[nextPetal]}` } : stickLive ? { next: "new stickers" } : {}) };
  // the won sounds' rows: one, or two when they don't fit left of the Sticker Book (w3-6); two rows leave less room
  // below, so the stickers and gems come a little smaller and the panel may reach 8 px from the top (its bottom at y 420
  // stays clear of Sensei's caption bubble, whose top is at about y 430 with three lines)
  const rows = wonRows(won);
  const two = rows.length > 1;
  const gemSize = two ? 86 : gains.length > 4 ? 96 : 110;
  // the panel fits what there is to show (the won sounds, new stickers, gem energy), centred in the space above the
  // buttons; once the stickers are in the book it closes up round the petals and the gems
  const petalsH = rows.length ? rows.length * badgeHeight(WON_PETAL) + (rows.length - 1) * WON_ROW_GAP : 0;
  const showStickers = newWords.length > 0 && stuck !== "home";
  const stickerSize = two ? 86 : won.length ? 92 : newWords.length > 4 ? 100 : 118;
  const petalsAlone = won.length > 0 && !showStickers && !gains.length; // (then they sit in the middle of the panel)
  const petalsTop = petalsAlone ? 36 : two ? 14 : 22;
  const belowPetals = won.length ? petalsTop + petalsH + (two ? 10 : 16) : 0;
  const stickersTop = won.length ? belowPetals : 40;
  // (with won sounds, the gems wait below the stickers' place until the stickers are in the book)
  const showGems = !(won.length && showStickers);
  const gemsTop = won.length ? belowPetals : showStickers ? 186 : 56;
  // nothing (more) to show in the panel: no sounds won, no gems filled, no stickers (still) to fly: the level's own
  // trophy instead, so the reward never looks empty (a story: its happy ending's picture; any other level: its map
  // picture in a medal)
  const trophy = !won.length && !showStickers && !gains.length;
  const panelH = trophy
    ? 340
    : petalsAlone
    ? petalsH + 72
    : Math.max(214, won.length ? Math.max(belowPetals + 14, showStickers ? stickersTop + stickerSize + (two ? 10 : 24) : 0, showGems && gains.length ? gemsTop + gemSize + (two ? 10 : 30) : 0) : gains.length ? gemsTop + gemSize + 36 : showStickers ? 206 : 0);
  const panelTop = Math.max(8, 18 + (402 - panelH) / 2);
  const count = bookTotal - (stuck === "home" ? 0 : newWords.length - landed);
  return (
    <div className="scene reward">
      <img className="bg-img" src={img(`bg_${w.key}`)} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      <div className={`rw-soft ${soft ? "on" : ""}`} aria-hidden="true" />
      {/* the child's ninja, bottom-left as in every level, still wearing the level's streak */}
      <NinjaSpot size={270} x={34} />
      <div className="panel pop-in reward-panel" style={{ top: panelTop, height: panelH }}>
        {/* the sounds won back (Dec8, SD r58): each petal rises into the panel in the mist as Sensei starts, and blooms on
            its own sound after "You won back…" */}
        {won.length > 0 && petalsUp && (
          <div className="rw-won" style={{ top: petalsTop, height: petalsH, gap: WON_ROW_GAP }}>
            {rows.map((row, r) => (
              <div key={r} className="rw-won-row" style={{ gap: WON_GAP }}>
                {row.map((p) => {
                  const k = won.indexOf(p);
                  return (
                    <span key={p} ref={(el) => void (petalEls.current[k] = el)} className="rw-won-petal" style={{ "--k": k, width: wonWidth(p) } as CSSProperties}>
                      <SoundBadge p={p} tier="turn" size={WON_PETAL} intro wait={petalLive && !bloomed[k]} spread={!!PAIRS[p]} />
                      {/* the tap that is open: a petal still in the mist blooms on its sound */}
                      {petalLive && !bloomed[k] && <button className="card rw-tap" data-tap-proxy aria-label={`petal ${p}`} {...tapProps(() => tapPetal(k))} />}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {/* new stickers: they pop up, then peel off into the Sticker Book */}
        {showStickers && (
          <div className={`rw-stickers ${stickLive && stuck === "in" ? "live" : ""}`} style={{ top: stickersTop, height: stickerSize }}>
            {newWords.map((t, i) => (
              <span key={t} ref={(el) => void (stickerEls.current[i] = el)} className={`rw-sticker ${stuck ? "in" : ""}`} style={{ "--i": i, rotate: `${(i % 3) * 5 - 5}deg` } as CSSProperties}>
                <Sticker w={t} kind={stickerKind(t)} size={stickerSize} />
              </span>
            ))}
            {stickLive && stuck === "in" && <button className="card rw-tap" data-tap-proxy aria-label="new stickers" {...tapProps(() => stickWaiter.current?.())} />}
          </div>
        )}
        {/* the Sticker Book in the corner: a big number with a sticker icon, and "+N" as the new ones land */}
        <div ref={bookEl} className={`rw-book ${landed ? "thunk" : ""}`} key={`b${landed}`} aria-hidden="true">
          <img src={img("item_sticker_book")} alt="" />
          <span className="rw-book-count"><span className="rw-book-n">{count}</span><Icon.sticker /></span>
          {landed > 0 && <span className="rw-plus">+{landed}</span>}
        </div>
        {/* gem energy earned this level: rings fill up; a full gem glows and offers its Gem Trial */}
        {showGems && (
          <div className={`reward-gems ${gemFocus ? "focusing" : ""}`} style={{ top: gemsTop }}>
            {gains.map(({ gem, before, after }, i) => {
              const full = after >= 1 && !store.get().gems.includes(gem.key);
              return (
                <div key={gem.key} className={`pop-in ${gemFocus === gem.key ? "rw-gem-focus" : ""}`} data-gem={gem.key} style={{ animationDelay: `${(won.length ? 0.1 : 0.5) + i * 0.18}s` }}>
                  <GemIcon g={gem.g} colour={chartOf(gem.p).colour} state={full && filled ? "ready" : "charging"} energy={filled ? after : before} size={gemSize} />
                </div>
              );
            })}
          </div>
        )}
        {trophy && <RewardTrophy level={level} />}
        {/* stars, in the background: a small row for grown-ups (independent answers only) */}
        <div className="rw-grownup-stars" data-grownups aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((k) => <span key={k}><Icon.star on={k <= stars} /></span>)}
        </div>
      </div>
      {/* the nav row (src/ui/nav.tsx) has Hear it again and Next; a reward has no Back, so its own buttons take the row's
          free slots: Play again (↻, once Sensei has finished, with the green Next) where Back goes, Jump ahead where Show me again goes, and the World Flower (a gem
          is ready) where the sound picture goes (docs/NAVIGATION.md §5.B) */}
      {talked && <RoundButton label="Play again" onClick={onReplay} className="rw-again pop-in" style={slotStyle(NAV_SLOTS.row.back)}><Icon.again /></RoundButton>}
      {offerJump && filled && (
        <RoundButton label="Jump ahead" className="pulse rw-jump" onClick={() => setJumping(true)} style={{ ...slotStyle(NAV_SLOTS.row.show), background: "radial-gradient(circle at 35% 30%, #e6f0ff 0%, #6aa8ff 55%, #2d5fb8 100%)" }}>
          <svg viewBox="0 0 64 64"><path fill="#fff4dc" stroke="#2b1d14" strokeWidth={5} strokeLinejoin="round" d="M10 40l14-14 10 10 20-22v14h6V6H38v6h14L34 32 24 22 6 40z" /></svg>
        </RoundButton>
      )}
      {readyNow && filled && (
        <RoundButton label="Go to the World Flower" className="pink pulse rw-flower" onClick={onFlower} style={slotStyle(NAV_SLOTS.row.sound)}><Icon.tree /></RoundButton>
      )}
      {jumping && <JumpAhead gated onClose={() => setJumping(false)} onJumped={onJumped} />}
      <SenseiDock />
    </div>
  );
}

/** A reward with nothing new to show (no gems filled, no new stickers): the level's own trophy. A story's reward is its
 *  happy ending's picture, framed; any other level's is its map picture (the monster it beat, the gong, the chest...)
 *  in a gold medal. Not a button. */
function RewardTrophy({ level }: { level: Level }) {
  const story = level.story ? STORIES.find((st) => st.id === level.story) : undefined;
  const ending = story?.pages[story.pages.length - 1]?.scene;
  if (story && ending)
    return (
      <div className="rw-trophy story pop-in" aria-hidden="true">
        <img src={img(`story_${story.id}_${ending}`)} alt="" />
      </div>
    );
  const icon = level.kind === "battle" || level.kind === "boss" ? `mon_${level.monster}` : KIND_ICON[level.kind] ?? "item_star";
  return (
    <div className="rw-trophy medal pop-in" aria-hidden="true">
      <span className="rw-medal-ribbon" />
      <span className="rw-medal">
        <img src={img(icon)} alt="" />
      </span>
    </div>
  );
}

/** Who's playing? (Profiles.tsx). `naming` opens it on the name screen (TITLE_DESIGN §9.5). */
const Profiles = ProfilesScreen;

// ---------------------------------------------------------------- the first minutes (docs/FIRST_MINUTES.md)
// choose → the opt-in (a brand-new child only) → the dojo welcome → the first lesson for the child's band → Reward 1
// (the Sticker Book arrives) → straight on to lesson 2 → Reward 2 → the map. Returning children are never asked:
// "Welcome back" and their next stone (and, on the first launch on or after 1 September, the moving-up question).
const brandNew = (s = store.get()) => !s.seenPlacement && !s.placedAt && !Object.values(s.stars).some((n) => n > 0);
function afterChoose(): Route {
  const s = store.get();
  if (brandNew(s)) return { name: "optin" };
  if (!s.seenTraining) return { name: "training" };
  return nextInSession() ?? { name: "map" };
}
/** The first session's next lesson (null outside the first session). */
function nextInSession(): Route | null {
  const f = store.get().firstSession;
  return f ? { name: "level", id: f.lessons[Math.min(1, f.step)] } : null;
}
/** Start, for a child who has seen the film: resume where they were (Home before the map goes to the title, so a child
 *  who left the opt-in or the dojo welcome comes back to it; docs/NAVIGATION.md §3.3). */
function afterLaunch(): Route {
  const s = store.get();
  if (brandNew(s)) return { name: "optin" };
  if (s.firstSession && !s.seenTraining) return { name: "training" };
  if (movingUpDue()) return { name: "optin", mode: "newyear" };
  return nextInSession() ?? { name: "map", intro: "welcome" };
}
/** The first launch on or after 1 September, for a child with a school year set before it. */
export function movingUpDue(s = store.get(), now = new Date()): boolean {
  const y = s.schoolYear;
  if (!y || y === "unset" || !s.schoolYearAt) return false;
  const sep1 = new Date(now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1, 8, 1).getTime();
  return s.schoolYearAt < sep1 && now.getTime() >= sep1;
}
const YEAR_NAME: Record<string, string> = { none: "not at school yet", unsure: "not sure", R: "Reception", Y1: "Year One", Y2: "Year Two", unset: "not set" };
/** Before a school start point is applied, so the first check can undo it if the child drops a band. */
let beforeStart: { petals: string[]; energy: Record<string, number>; placedAt?: string } | null = null;
function applyOptIn(r: OptInResult, mode: "new" | "newyear"): Route {
  if (mode === "newyear") {
    const was = store.get().schoolYear;
    store.set((s) => {
      s.schoolYear = r.year;
      s.schoolYearAt = Date.now();
    });
    // a new class: a shiny moving-up sticker; progress never moves by itself (the grown-ups' settings show any gap)
    if (r.movedUp) {
      recordMet("star", true);
      logAdjust(`New school year: moved up to ${YEAR_NAME[r.year]}`);
    } else logAdjust(`New school year: stayed in ${YEAR_NAME[was ?? "unset"]}`);
    return nextInSession() ?? { name: "map", intro: "welcome" };
  }
  const start = startFor(r.year);
  const s0 = store.get();
  beforeStart = { petals: [...s0.petals], energy: { ...s0.energy }, placedAt: s0.placedAt };
  if (start.unit > 0) placeAtUnit(start.unit);
  store.set((s) => {
    s.schoolYear = r.year;
    s.schoolYearAt = Date.now();
    s.band = start.band;
    s.seenPlacement = true;
    s.firstSession = { lessons: start.lessons, step: 0 };
  });
  logAdjust(`${r.silent ? "No answer, so Sensei chose" : "Chose"} "${YEAR_NAME[r.year]}": started at ${start.label}`);
  return store.get().seenTraining ? { name: "level", id: start.lessons[0] } : { name: "training" };
}
/** One band down after the first check: the new band's lesson 1 starts at once (the caller says "Let's do some
 *  warm-up training first!"). A school start point that was applied is undone. */
function dropBand(band: StartBand) {
  const from = store.get().band ?? "W";
  const start = startFor(band === "W" ? "none" : band);
  const undo = beforeStart;
  store.set((s) => {
    if (undo && start.unit === 0) {
      s.petals = undo.petals;
      s.energy = undo.energy;
      s.placedAt = undo.placedAt;
    }
    s.band = band;
    s.firstSession = { lessons: start.lessons, step: 0 };
  });
  if (start.unit > 0) placeAtUnit(start.unit);
  logAdjust(`Started at ${YEAR_NAME[from === "W" ? "none" : from] ?? from}; moved to ${start.label} after the first check`);
}
/** The first check (§10): the first three answers at a school start point (or Reception's warm-ups). 0 or 1 right on
 *  the first try → one band down, on the spot. Every scene publishes the answer it is waiting for (window.__snState
 *  .next, as the treadmill bots read it), so the check compares the child's first tap at each item with it. */
function useFirstCheck(level: Level, onDrop: (band: StartBand) => void) {
  useEffect(() => {
    const s = store.get();
    const f = s.firstSession;
    const band = s.band;
    if (!f || f.step !== 0 || f.lessons[0] !== level.id || !band || band === "W") return;
    const seen = new Set<string>();
    const got: boolean[] = [];
    let done = false;
    let poll = 0;
    const onTap = (e: PointerEvent) => {
      const st = (window as any).__snState;
      const next = st?.next;
      // ("learn": tapping a new spelling to hear it is not a question)
      if (done || typeof next !== "string" || st.busy || ["learn", "stickers", "optin"].includes(st.scene) || String(st.scene).startsWith("tut-")) return;
      // (the nav controls, src/ui/nav.tsx: Home, Back, Hear it again, Show me again, the sound picture, Next, are never answers)
      if ((e.target as Element).closest?.("[data-nav]")) return;
      const label = (e.target as Element).closest?.("[aria-label]")?.getAttribute("aria-label");
      if (!label || /^(Help|Hear it again|Hear the word|map|Grown-ups)/.test(label) || seen.has(next)) return;
      seen.add(next); // only the first try at each item counts
      got.push(label === next);
      if (got.length < 3) return;
      done = true;
      if (got.filter(Boolean).length > 1) return;
      // one band down, at the item boundary: once the scene asks its next question (or has nothing left to ask), at most
      // 12 s later (game time)
      const t0 = performance.now();
      poll = window.setInterval(() => {
        const now = (window as any).__snState;
        const moved = !now || now.scene !== st.scene || (typeof now.next === "string" && now.next !== next) || (now.next == null && !now.busy);
        if (moved || (performance.now() - t0) * FAST > 12_000) {
          clearInterval(poll);
          onDrop(bandBelow(band));
        }
      }, 150);
    };
    document.addEventListener("pointerdown", onTap, true);
    return () => {
      document.removeEventListener("pointerdown", onTap, true);
      clearInterval(poll);
    };
  }, [level.id]);
}
/** Warm-up stones, and the first session on any path, get the Sticker Book reward. */
function stickerReward(level: Level) {
  const f = store.get().firstSession;
  return isWarmup(level) || (!!f && f.lessons.includes(level.id));
}
const S_WORDS = ["sun", "sock", "sausage", "sunflower"];
function StickerRoute({ level, stars, closing, onNext, onReplay }: { level: Level; stars: number; closing?: string; onNext: (r: Route) => void; onReplay: () => void }) {
  const [plan] = useState(() => {
    const s = store.get();
    const f = s.firstSession;
    const step = f ? f.lessons.indexOf(level.id) : -1;
    const w = level.warmup ? WARMUPS[level.warmup] : null;
    const words = w ? w.stickers : levelNewWords.slice(0, 6);
    const firstW2 = level.warmup === "W2" && !s.shiny?.includes("fishdog");
    const mode: "intro" | "open" | "short" = !words.length ? "short" : !s.seenBook ? "intro" : step === 1 || firstW2 ? "open" : "short";
    if (!(s.stars[level.id] > 0)) mapAnim.from = level.id;
    const open = mode === "open" && !!w;
    return {
      step, words, mode,
      list: w?.list,
      shiny: open ? w?.shiny : undefined,
      sound: open && level.warmup === "W2" ? { p: "s" as const, words: S_WORDS, line: "fm_rw2_s" } : undefined,
      petal: open && level.warmup === "W2" && !s.petals.includes("s") ? ("s" as const) : undefined,
    };
  });
  useEffect(() => {
    // stars stay in the background (so the map unlocks); petals as usual (after the first render: a store write while
    // rendering would update other screens' subscribers mid-render)
    store.set((x) => {
      x.stars[level.id] = Math.max(x.stars[level.id] ?? 0, isWarmup(level) ? 1 : Math.max(1, stars));
      for (const t of level.teach ?? []) {
        const g = t.split("=")[0];
        if (!x.petals.includes(g)) x.petals.push(g);
      }
    });
  }, []);
  const next = () => {
    const s = store.get();
    if (plan.step === 0) {
      store.set((x) => void (x.firstSession = x.firstSession && { ...x.firstSession, step: 1 }));
      return onNext({ name: "level", id: s.firstSession!.lessons[1] });
    }
    if (plan.step === 1) {
      // Reception (autumn) goes on at w1-2: W3–W6 are marked done
      store.set((x) => {
        if (x.band === "R" && level.warmup) for (const id of WARMUP_IDS) x.stars[id] = Math.max(x.stars[id] ?? 0, 1);
        x.firstSession = null;
      });
      mapAnim.from = level.id;
      return onNext({ name: "map", world: level.world, intro: "stickerbook" });
    }
    const pace = level.warmup ? warmupPace(level) : undefined;
    // played again: the warm-up says so as it opens, on screen, never over the map (LevelHost); the repeat is the
    // "struggled" case, so its games play their recap forms with the Ready hold (TEACHER_SCRIPT §2.2, §3.10)
    if (pace === "again") {
      practiseAgain = level.id;
      for (const g of levelGames(level)) played(g, { struggled: true });
    }
    return onNext({ name: "map", world: level.world, intro: pace });
  };
  // Home (docs/NAVIGATION.md §3.3): Reward 1 counts Lesson 1 as done and goes to the title (Start resumes at Lesson 2);
  // Reward 2 and later rewards do what their Next does (Reward 2: the first session is over, the map with its Sticker
  // Book introduction), so nothing is lost
  useHome(() => {
    if (plan.step !== 0) return next();
    store.set((x) => void (x.firstSession = x.firstSession && { ...x.firstSession, step: 1 }));
    onNext({ name: "title" });
  });
  return (
    <StickerReward
      closing={closing}
      words={plan.words}
      mode={plan.mode}
      list={plan.list}
      shiny={plan.shiny}
      sound={plan.sound}
      petal={plan.petal}
      then={plan.step === 0 ? "arrow" : plan.step === 1 ? "map" : "next"}
      onNext={next}
      onReplay={plan.step < 0 ? onReplay : undefined}
    />
  );
}
/** Pace across the warm-ups (§10), after a warm-up outside the first session. */
function warmupPace(level: Level): "super" | "again" | undefined {
  const s = store.get();
  const idx = WARMUP_IDS.indexOf(level.id);
  const scores = WARMUP_IDS.slice(0, idx + 1).map((id) => s.warmups?.[id]).filter((x): x is NonNullable<typeof x> => !!x);
  // 90% or more across three warm-ups: W4 and W5 are skipped
  if (level.warmup === "W3" && superListener(scores.slice(-3))) {
    store.set((x) => {
      for (const k of ["W4", "W5"]) {
        const id = LEVELS.find((l) => l.warmup === k)?.id;
        if (id) x.stars[id] = Math.max(x.stars[id] ?? 0, 1);
      }
    });
    logAdjust("Super listener: skipped two warm-ups");
    return "super";
  }
  // under 50% in two warm-ups in a row: this one again, once
  const mine = s.warmups?.[level.id];
  if (needsRepeat(scores.slice(-2)) && mine && !mine.repeated) {
    store.set((x) => {
      delete x.stars[level.id];
      if (x.warmups?.[level.id]) x.warmups[level.id].repeated = true;
    });
    return "again";
  }
  return undefined;
}

// ---------------------------------------------------------------- the picture parade (?scene=picparade, §11 rule 7)
/** The family test: every warm-up picture full screen, with ✓/✗ for a grown-up to mark whether the child named it. */
function PicParade() {
  const KEY = "superninja.picparade.v1";
  const [words] = useState(() => warmupPictures());
  const [i, setI] = useState(0);
  const [marks, setMarks] = useState<Record<string, "yes" | "no">>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "{}").marks ?? {};
    } catch {
      return {};
    }
  });
  const mark = (v: "yes" | "no") => {
    const m = { ...marks, [words[i]]: v };
    setMarks(m);
    try {
      localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), marks: m }));
    } catch {}
    sfx.pop();
    setI((k) => k + 1);
  };
  const w = words[i];
  (window as any).__snState = { scene: "picparade", i, n: words.length };
  return (
    <div className="scene" data-grownups style={{ background: "linear-gradient(180deg,#fff4dc,#f6e3bb)" }}>
      {w ? (
        <>
          <div style={{ position: "absolute", left: 340, top: 70 }}>
            <PicCard w={w} size={430} gutter={20} onTap={() => void say({ word: w })} />
          </div>
          <div style={{ position: "absolute", left: 870, top: 180, display: "flex", flexDirection: "column", gap: 30 }}>
            <RoundButton label="named it" onClick={() => mark("yes")} style={{ width: 140, height: 140, background: "#3fbf6a" }}><Icon.check /></RoundButton>
            <RoundButton label="didn't name it" onClick={() => mark("no")} style={{ width: 140, height: 140, background: "#d8cfc0" }}><span style={{ fontSize: 70, fontWeight: 800 }}>✗</span></RoundButton>
          </div>
          <div style={{ position: "absolute", left: 870, top: 540, fontSize: 26, fontWeight: 700 }}>{i + 1} / {words.length}</div>
        </>
      ) : (
        <div className="panel" style={{ position: "absolute", left: 340, top: 90, width: 760, padding: 30, fontSize: 24 }}>
          <h2 style={{ marginTop: 0 }}>Picture parade: done</h2>
          <p>Named: {words.filter((x) => marks[x] === "yes").length} of {words.length}.</p>
          <p>Not named: {words.filter((x) => marks[x] === "no").join(", ") || "none"}.</p>
          <button onClick={() => setI(0)} style={{ padding: "10px 18px", borderRadius: 14, border: "3px solid var(--ink)", background: "#fff", fontWeight: 700, fontSize: 20 }}>Start again</button>
        </div>
      )}
    </div>
  );
}

export { STORIES };
