import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Stage, FxLayer, HelpButton, VillainCutIn, useHelp, SenseiDock, img, heroImg, useHero, Icon, RoundButton, fx, sleep, W, tapProps, TapHint, stageXY, stageRect, isUpright } from "./ui/ui";
import { say, sfx, playMusic, unlockAudio, hush, preload, urls, isSpeaking, type Say } from "./engine/audio";
import { store, useSave, logAdjust, recordMet } from "./engine/store";
import { WORLDS, LEVELS, levelById, worldOf, makeReview, startFor, bandBelow, isWarmup, withBudget, WARMUP_IDS, AFTER_WARMUPS, type Level, type StartBand } from "./content/worlds";
import { WARMUPS, needsRepeat, superListener, warmupPictures } from "./content/warmups";
import { WarmupLevel } from "./scenes/Warmup";
import { OptIn, type OptInResult } from "./scenes/OptIn";
import { StickerReward, Sticker, stickerKind } from "./scenes/Stickers";
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
import { Profiles } from "./scenes/Profiles";
import { makeTrial, makePractice, practiceGemOf, flowerVisitAfter, readyGems, energyOf, gemByKey, frontier, shouldOfferJump, placeAtUnit } from "./engine/gems";
import { JumpAhead } from "./scenes/JumpAhead";
import { levelGains, levelNewWords, resetLevelGains, ENERGY_FULL } from "./engine/store";
import { GemIcon } from "./ui/Gem";
import { chartOf } from "./content/flower";
import { LINES } from "./content/lines";
import { NinjaDemo } from "./scenes/NinjaDemo";
import { NavDemo } from "./scenes/NavDemo";
import { NavLayer, useNav, useHome, usePresentation, told, NAV_SLOTS, slotStyle } from "./ui/nav";
import { setTripDue, tripDue } from "./scenes/Tree";
import { NinjaSpot, ninja } from "./ui/Ninja";
import { streak } from "./engine/streak";
import { heard, heardBefore } from "./scenes/narrate";
import { FAST } from "./engine/fast";
import "./styles/shell.css";
import "./styles/nav-B.css";

type Route =
  | { name: "title" }
  | { name: "intro" }
  | { name: "choose" }
  | { name: "optin"; mode?: "new" | "newyear" }
  | { name: "picparade" }
  | { name: "placement" }
  | { name: "training" }
  | { name: "book" }
  | { name: "setup" }
  | { name: "profiles" }
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
  const go = (r: Route) => {
    hush();
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
      {route.name === "title" && <Title onStart={() => go({ name: "profiles" })} />}
      {route.name === "profiles" && (
        <Profiles onPlay={() => go(store.get().seenIntro && store.get().hero ? afterLaunch() : { name: "intro" })} onNew={() => go({ name: "intro" })} onHome={() => go({ name: "title" })} />
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
      <div className="fullscreen-fade" key={`fade-${fade}`} />
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
  if (drop) return <DropHold onNext={() => onDrop(drop)} />;
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

// ---------------------------------------------------------------- Title
function Title({ onStart }: { onStart: () => void }) {
  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState(false);
  useHelp(() => {
    unlockAudio();
    say({ line: "help_start" });
  });
  (window as any).__snState = { scene: "title" };
  useEffect(() => {
    preload([urls.line("tap_start")]);
    // the title music streams through an <audio> element once Start is tapped (engine/audio.ts playMusic), so it is never
    // decoded: decoding it here held 167 s of stereo PCM (61 MB) for nothing (docs/PERF.md fix 5). Fetching it warms
    // the HTTP cache instead, so the music starts as soon as the child taps Start; the body is thrown away as it arrives
    void fetch(urls.music("title"), { priority: "low" } as RequestInit)
      .then((r) => r.body?.pipeTo(new WritableStream()))
      .catch(() => {});
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);
  const start = async () => {
    if (going) return;
    await unlockAudio();
    sfx.gong();
    fx.burst(640, 560, "petals", 40, 1.5);
    // a ninja exit: both heroes crouch and vanish upwards in a puff of smoke
    setGoing(true);
    sfx.whoosh();
    fx.puff(835, 560, 12);
    fx.puff(1080, 608, 12);
    fx.twinkle(835, 420, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 8);
    fx.twinkle(1080, 440, ["#fff4dc", "#ffe38a", "#ffc53d"], 10, 8);
    playMusic("title");
    store.set((s) => void (s.sessions += 1));
    await sleep(500);
    onStart();
  };
  return (
    <div className="scene title" {...tapProps(start)}>
      <img className="bg-img" src={img("title_bg")} alt="" style={{ filter: "saturate(1) brightness(1)" }} />
      <div className="vignette" />
      <PetalDrift />
      <img className={`sprite title-hero ${going ? "vanish" : ""}`} src={heroImg("suki", "jump")} style={{ left: 700, top: 230, width: 270, animation: "floaty 3.2s ease-in-out infinite" }} alt="" />
      {/* Kai stands on the cliff, clear of Sensei's Help button (bottom-right) */}
      <img className={`sprite title-hero late ${going ? "vanish" : ""}`} src={heroImg("kai", "throw")} style={{ left: 930, top: 236, width: 262, animation: "floaty 2.7s ease-in-out -1s infinite" }} alt="" />
      <div className="logo" style={{ position: "absolute", left: 60, top: 70 }}>
        <span className="l1">Super</span>
        <span className="l2">Ninja</span>
      </div>
      <div style={{ position: "absolute", left: 250, top: 500 }} className={ready ? "title-start-in" : ""}>
        <RoundButton label="Start" className="go pulse" onClick={start} style={{ width: 150, height: 150 }}>
          <Icon.play />
        </RoundButton>
      </div>
    </div>
  );
}

export function PetalDrift({ n = 14 }: { n?: number }) {
  const petals = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ left: Math.random() * 100, delay: -Math.random() * 12, dur: 9 + Math.random() * 8, size: 22 + Math.random() * 22, i })),
    [n],
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{`@keyframes drift{0%{transform:translate(0,-60px) rotate(0)}100%{transform:translate(-180px,800px) rotate(540deg)}}`}</style>
      {petals.map((p) => (
        <img
          key={p.i}
          src={img("item_petal")}
          alt=""
          style={{ position: "absolute", left: `${p.left}%`, top: 0, width: p.size, animation: `drift ${p.dur}s linear ${p.delay}s infinite`, opacity: 0.9 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Choose your ninja
/** A tap picks a ninja (it powers up, "Great choice!…"; another tap changes it); the green Next confirms
 *  (docs/NAVIGATION.md: nothing moves on by itself). Hear it again says Sensei's lines again. */
function Choose({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<"kai" | "suki" | null>(null);
  const [talked, setTalked] = useState(false); // "Great choice!…" has been said for the pick
  useHelp((n) => (n === 1 || !picked ? say({ line: "help_choose" }) : say({ line: "help_next" })), [picked]);
  useEffect(() => {
    void told({ line: "intro_8" }, { fresh: true });
  }, []);
  useNav({ again: () => say(picked ? [{ line: "intro_8" }, { gap: 300 }, { line: "chose" }] : { line: "intro_8" }), next: { ready: !!picked && talked, go: onDone } });
  // idle help before the pick (a turn: docs/NAVIGATION.md §3.2): 8 s both cards bob and Sensei asks again; 16 s the
  // pointing hand shows on both cards; 30 s she asks once more; then quiet. It never picks. Game time, waiting while
  // anyone speaks or the phone is upright; any tap starts it again.
  const [idle, setIdle] = useState(0);
  useEffect(() => {
    setIdle(0);
    if (picked) return;
    let ms = 0, level = 0;
    const tick = window.setInterval(() => {
      if (isUpright() || isSpeaking()) return;
      ms += 250;
      if (ms >= 8000 && level < 1) (level = 1), setIdle(1), void say({ line: "help_choose" });
      else if (ms >= 16000 && level < 2) (level = 2), setIdle(2);
      else if (ms >= 30000 && level < 3) (level = 3), void say({ line: "help_choose" });
    }, 250);
    const reset = () => ((ms = 0), (level = 0), setIdle(0));
    window.addEventListener("pointerdown", reset, true);
    return () => {
      clearInterval(tick);
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [picked]);
  const latest = useRef(0);
  const choose = async (h: "kai" | "suki") => {
    if (picked === h) return;
    const my = ++latest.current;
    setPicked(h);
    setTalked(false);
    sfx.great();
    fx.burst(h === "kai" ? 325 : 715, 330, "stars", 30);
    store.set((s) => {
      s.hero = h;
      s.seenIntro = true;
    });
    await say({ line: "chose" });
    if (latest.current === my) setTalked(true);
  };
  (window as any).__snState = { scene: "choose", picked, next: picked ? null : "kai" };
  return (
    <div className="scene choose">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <div className="display" style={{ position: "absolute", top: 30, left: 130, right: 130, textAlign: "center", fontSize: 60 }}>
        Choose your ninja!
      </div>
      {(["kai", "suki"] as const).map((h, i) => (
        <button
          key={h}
          {...tapProps(() => choose(h))}
          aria-label={h}
          className={`panel pop-in choose-card ${picked && picked !== h ? "other" : ""} ${!picked && idle ? "nudge" : ""}`}
          style={{
            // the two cards sit left of centre, above the nav row; Sensei's caption bubble has the right-hand side
            position: "absolute", left: 150 + i * 390, top: 128, width: 350, height: 400, animationDelay: `${i * 0.12}s`,
            background: i ? "linear-gradient(180deg,#d7fbf3,#8fe0cf)" : "linear-gradient(180deg,#dfe0ff,#9ea3f0)",
            transform: picked === h ? "scale(1.06)" : picked ? "scale(0.9)" : undefined, opacity: picked && picked !== h ? 0.5 : 1, transition: "transform .3s, opacity .3s",
          }}
        >
          {picked === h ? (
            <PickedNinja key={h} />
          ) : (
            <img src={heroImg(h, "idle")} alt="" style={{ width: 260, position: "absolute", left: 45, bottom: 20 }} className="breathe" />
          )}
          <TapHint show={!picked && idle >= 2} style={{ left: 190, top: 250 }} />
        </button>
      ))}
      <SenseiDock />
    </div>
  );
}

/** The ninja the child just picked: it powers up on the spot (energy gathers, a flash and rings), then cheers. */
function PickedNinja() {
  useEffect(() => {
    let live = true;
    (async () => {
      const t = setTimeout(() => live && ninja.say(), 200); // kiai! as the power bursts
      await ninja.act("power");
      clearTimeout(t);
      if (live) await ninja.act("cheer");
    })();
    return () => void (live = false);
  }, []);
  return <NinjaSpot size={260} x={45} bottom={20} z={3} noFlames />;
}

// ---------------------------------------------------------------- World map
const MAP_HERO_W = 128, MAP_HERO_H = 172; // the idle sprites are ~1.34 tall per wide; the img's box is bottom-aligned
const KIND_ICON: Record<string, string> = { dojo: "sensei_idle", run: "item_gong", swap: "item_scroll", sort: "item_chest", story: "item_lantern", listen: "pic_sun", firstsound: "pic_mat", soundhunt: "pic_pig", ears: "ui_tortoise", picread: "pic_fishdog" };
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
  useEffect(() => {
    playMusic(w.music);
    const first = firstVisit.current;
    firstVisit.current = false;
    // the first session ends here: "Your Sticker Book lives here, on the map!" (the book button bounces), then the hint
    if (first && intro === "stickerbook") {
      setBookHint(true);
      arrival.current = [{ line: "fm_rw2_map" }, { gap: 300 }, { line: "map_hint" }];
      void say(arrival.current).then(() => setTimeout(() => setBookHint(false), 2500));
      return;
    }
    const lead = first && intro === "welcome" ? "welcome_back" : first && intro === "super" ? "fm_super_listener" : first && intro === "again" ? "fm_practise_again" : null;
    arrival.current = first && cur.world === w.id ? [...(lead ? [{ line: lead }, { gap: 250 }] : [{ line: `world_${w.id}` }, { gap: 200 }]), { line: "map_hint" }] : [{ line: `world_${w.id}` }];
    void say(arrival.current);
  }, [wi]);
  const [bookHint, setBookHint] = useState(false);
  const worldOpen = (i: number) => i >= 0 && i < WORLDS.length && isUnlocked(WORLDS[i].levels[0]);
  const heroAt = w.levels.findIndex((l) => l.id === cur.id);
  const readyCount = readyGems().length;
  const due = !!tripDue(); // a World Flower trip left unplayed (Home on its reward, or mid-trip): the flower pulses
  useHelp((n) => say(n === 1 ? { line: "help_map" } : [{ line: "help_map" }, { gap: 200 }, { line: "map_hint" }]));
  (window as any).__snState = { scene: "map", world: w.id, next: cur.id };
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
      fx.burst(p.x, p.y, "petals", 24);
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
            {...tapProps(() => {
              if (open) {
                sfx.pop();
                onLevel(l.id);
              } else {
                sfx.wrong();
                say({ line: "map_locked" });
              }
            })}
            className={isCur ? "map-next" : "pop-in"}
            style={{
              position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, borderRadius: "50%",
              background: isCur ? "radial-gradient(circle at 40% 30%, #fffbe6, #ffc53d 70%, #c98a00)" : open ? `radial-gradient(circle at 40% 30%, #fffaf0, ${w.colour} 75%)` : "radial-gradient(circle at 40% 30%, #cfc8d6, #6f6878)",
              border: `${isCur ? 7 : 5}px solid var(--ink)`, boxShadow: isCur ? "0 8px 0 var(--ink), 0 0 0 10px rgba(255,197,61,.45), 0 0 40px 14px rgba(255,230,140,.8)" : "0 6px 0 var(--ink), 0 12px 18px rgba(0,0,0,.3)",
              animationDelay: `${i * 0.05}s`, opacity: open ? 1 : 0.8, zIndex: isCur ? 7 : 5,
            } as CSSProperties}
          >
            <img src={img(icon)} alt="" style={{ width: "86%", height: "86%", objectFit: "contain", filter: open ? "none" : "grayscale(.85) opacity(.7)" }} />
            {!open && <span style={{ position: "absolute", right: -10, bottom: -10, width: 40, height: 40 }}><Icon.lock /></span>}
            {/* the pointing hand sits below-right, or straight below for stones near the right edge (Help corner) */}
            {isCur && <TapHint show style={p.x > 900 ? { left: "calc(50% - 50px)", bottom: -84 } : { right: -70, bottom: -60 }} />}
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
              sfx.pop();
              onLevel(cur.id);
            })}
            data-tap-proxy // the hero is a shortcut into the current level (treadmill: may cover a node)
            className="map-hero"
            style={{ left: p.x - MAP_HERO_W / 2, top: p.y + 26 - MAP_HERO_H }}
          >
            <img className={`sprite ${arrived ? "map-hero-hop" : walk === 2 ? "bob" : ""}`} src={heroImg(hero, arrived ? "cheer" : walk === 2 ? "idle" : "run")} alt="" />
          </div>
        );
      })()}
      {/* world banner */}
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <RoundButton sm label="previous world" onClick={() => setWi((i) => Math.max(0, i - 1))} style={{ visibility: wi > 0 ? "visible" : "hidden" }}><Icon.back /></RoundButton>
        <div className="panel" style={{ padding: "6px 34px", background: w.colour, minWidth: 460, textAlign: "center" }}>
          <span className="display" style={{ fontSize: 54 }}>{w.name}</span>
        </div>
        <RoundButton sm label="next world" onClick={() => worldOpen(wi + 1) ? setWi((i) => i + 1) : (sfx.wrong(), say({ line: "map_locked" }))} style={{ visibility: wi < WORLDS.length - 1 ? "visible" : "hidden", filter: worldOpen(wi + 1) ? undefined : "grayscale(1)" }}><Icon.next /></RoundButton>
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
          <RoundButton label="World Flower" className={`pink ${readyCount || due ? "pulse" : ""}`} onClick={onTree}><Icon.tree /></RoundButton>
          {readyCount > 0 && <span className="map-badge">{readyCount}</span>}
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
const HAS_LINE = (id: string) => LINES.some((l) => l.id === id);
/** What the reward says about gem energy, and which gems it is about (they lift and pulse while it is said, the others
 *  dim; several are pulsed in turn): a gem that has just filled, the first gem ever (the explanation), gems that crossed
 *  half full ("Look, these gems…" for more than one), or the land's first mention (the gem that gained most). */
export function rewardGemFocus<T extends { before: number; after: number }>(gains: T[], readyNow: boolean, world: number): { line: string | null; gems: T[] } {
  if (readyNow) return { line: "gem_ready", gems: gains.filter((g) => g.after >= 1 && g.before < 1) };
  if (!gains.length) return { line: null, gems: [] };
  if (!heardBefore("gem-energy")) return { line: "audit_gem_first", gems: gains.slice(0, 1) };
  const crossed = gains.filter((g) => g.before < 0.5 && g.after >= 0.5);
  if (crossed.length > 1) return { line: HAS_LINE("r2_gems_more") ? "r2_gems_more" : "audit_gem_more", gems: crossed };
  if (crossed.length) return { line: "audit_gem_more", gems: crossed };
  return !heardBefore(`gem-more:w${world}`) ? { line: "audit_gem_more", gems: gains.slice(0, 1) } : { line: null, gems: [] };
}
/** Every level's reward leads with stickers (ARCHITECTURE §15.1, FIRST_MINUTES §6 "every later reward"): the words
 *  the child met for the first time pop up as stickers, peel off and fly into the Sticker Book in the corner, "+N"
 *  ("More stickers for your Sticker Book!"), in 4–6 s. Gem energy fills below them. Stars stay in the background: they
 *  unlock the map and show as a small row for grown-ups only. */
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
  const talkTok = useRef(0);
  const alive = useRef(true);
  const w = worldOf(level);
  const newPetals = [...new Set((level.teach ?? []).map((t) => t.split("=")[0]))];
  const isLastInWorld = w.levels[w.levels.length - 1].id === level.id;
  const isFinale = level.id === LEVELS[LEVELS.length - 1].id;
  // what the speech says about gem energy, decided once (a replay says the same, even after "gem-energy" was heard)
  const [gemPlan] = useState(() => rewardGemFocus(gains, readyNow, w.id));
  // a rest nudge, once per session (a replay says it again if it was said)
  const [rest] = useState(() => {
    const mins = performance.now() / 60_000;
    if (restNudged || !(mins > 18 || (mins > 12 && w.key === WORLDS[0].key))) return null;
    restNudged = true;
    return mins > 18 ? "break_time" : "dojo_nap";
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
  /**
   * Sensei's reward speech. `first`: as the reward opens (it waits for the stickers to land, and the gem to fill);
   * otherwise Hear it again, which starts with the level's closing line (docs/NAVIGATION.md rule 7) and takes over from
   * a speech still playing. Next turns green once a speech has been said to its end.
   */
  const talk = async (first: boolean, flown?: Promise<unknown>) => {
    const my = ++talkTok.current;
    const live = () => alive.current && my === talkTok.current;
    const seq: Say[] = [...(!first && closing ? [{ line: closing }, { gap: 300 }] : []), { line: level.kind === "boss" ? "battle_boss_win" : "yay_7" }];
    if (newPetals.length) seq.push({ gap: 200 }, { line: newPetals.length > 1 ? "petals_got" : "petal_got" });
    if (isLastInWorld && !isFinale) seq.push({ gap: 200 }, { line: "world_done" });
    await say(seq);
    if (!live()) return false;
    // the Sticker Book, as the new stickers arrive in it (once per reward)
    if (newWords.length) {
      if (flown) await Promise.race([flown, sleep(2600)]);
      if (!live()) return false;
      await say({ line: "fm_rw_more" });
      if (!live()) return false;
    }
    // gem energy (NARRATIVE_AUDIT F04): explained once per child (in the level where it first fills, or here), then
    // only mentioned when a gem visibly gets somewhere: half full, or the first gem to fill in a new land
    setFilled(true);
    if (gemPlan.line) {
      if (first) {
        if (gemPlan.line === "gem_ready") sfx.petal();
        // the gem it is about lifts and pulses while it is said (several: in turn), once its energy has risen
        await sleep(900);
        if (!live()) return false;
      }
      const ok = await gemTalk(gemPlan.line, gemPlan.gems.map((g) => g.gem.key), live);
      if (ok && gemPlan.line === "audit_gem_first") heard("gem-energy");
      if (ok && (gemPlan.line === "audit_gem_more" || gemPlan.line === "r2_gems_more")) heard(`gem-more:w${w.id}`);
      if (!live()) return false;
    }
    if (offerJump) await say({ line: "jump_offer" });
    // gentle rest nudge: little ones (Bamboo Village) after ~12 minutes, everyone after ~18; once per session
    if (rest && live()) await say({ line: rest }, { keep: true });
    if (!live()) return false;
    setTalked(true);
    return true;
  };
  const replay = () => talk(false);
  useHelp((n) => (n === 1 && !talked ? void replay() : say({ line: "help_next" })), [talked]);
  useNav({ again: replay, next: { ready: talked, go: () => onNext(isFinale) } });
  useEffect(() => {
    if (level.id !== "review" && !(store.get().stars[level.id] > 0)) mapAnim.from = level.id;
    store.set((s) => {
      if (level.id === "review") return;
      s.stars[level.id] = Math.max(s.stars[level.id] ?? 0, stars);
      for (const g of newPetals) if (!s.petals.includes(g)) s.petals.push(g);
    });
    playMusic(null);
    let live = true;
    // the stickers pop up (the ninja cheers), peel off one by one and fly into the Sticker Book: "+N"
    const flown = (async () => {
      sfx.fanfare();
      fx.rain("confetti", 70);
      void ninja.act("cheer");
      if (!newWords.length) return;
      await sleep(350);
      if (!live) return;
      setStuck("in");
      sfx.pop();
      await sleep(1500);
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
    void sleep(600).then(() => live && talk(true, flown));
    return () => {
      live = false;
      alive.current = false;
    };
  }, []);
  (window as any).__snState = { scene: "reward", talked };
  const gemSize = gains.length > 4 ? 96 : 110;
  const stickerSize = newWords.length > 4 ? 100 : 118;
  // the panel fits what there is to show (new stickers, gem energy), centred in the space above the buttons; once the
  // stickers are in the book it closes up round the gems
  const showStickers = newWords.length > 0 && stuck !== "home";
  const gemsTop = showStickers ? 186 : 56;
  // nothing (more) to show in the panel: no gems filled, no stickers (still) to fly: the level's own trophy instead, so
  // the reward never looks empty (a story: its happy ending's picture; any other level: its map picture in a medal)
  const trophy = !showStickers && !gains.length;
  const panelH = trophy ? 340 : Math.max(214, gains.length ? gemsTop + gemSize + 36 : showStickers ? 206 : 0);
  const panelTop = 18 + Math.max(0, (402 - panelH) / 2);
  const count = bookTotal - (stuck === "home" ? 0 : newWords.length - landed);
  return (
    <div className="scene reward">
      <img className="bg-img" src={img(`bg_${w.key}`)} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      {/* the child's ninja, bottom-left as in every level, still wearing the level's streak */}
      <NinjaSpot size={270} x={34} />
      <div className="panel pop-in reward-panel" style={{ top: panelTop, height: panelH }}>
        {/* new stickers: they pop up, then peel off into the Sticker Book */}
        {showStickers && (
          <div className="rw-stickers" style={{ height: stickerSize }}>
            {newWords.map((t, i) => (
              <span key={t} ref={(el) => void (stickerEls.current[i] = el)} className={`rw-sticker ${stuck ? "in" : ""}`} style={{ "--i": i, rotate: `${(i % 3) * 5 - 5}deg` } as CSSProperties}>
                <Sticker w={t} kind={stickerKind(t)} size={stickerSize} />
              </span>
            ))}
          </div>
        )}
        {/* the Sticker Book in the corner: a big number with a sticker icon, and "+N" as the new ones land */}
        <div ref={bookEl} className={`rw-book ${landed ? "thunk" : ""}`} key={`b${landed}`} aria-hidden="true">
          <img src={img("item_sticker_book")} alt="" />
          <span className="rw-book-count"><span className="rw-book-n">{count}</span><Icon.sticker /></span>
          {landed > 0 && <span className="rw-plus">+{landed}</span>}
        </div>
        {/* gem energy earned this level: rings fill up; a full gem glows and offers its Gem Trial */}
        <div className={`reward-gems ${gemFocus ? "focusing" : ""}`} style={{ top: gemsTop }}>
          {gains.map(({ gem, before, after }, i) => {
            const full = after >= 1 && !store.get().gems.includes(gem.key);
            return (
              <div key={gem.key} className={`pop-in ${gemFocus === gem.key ? "rw-gem-focus" : ""}`} data-gem={gem.key} style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                <GemIcon g={gem.g} colour={chartOf(gem.p).colour} state={full && filled ? "ready" : "charging"} energy={filled ? after : before} size={gemSize} />
              </div>
            );
          })}
        </div>
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
    return onNext({ name: "map", world: level.world, intro: level.warmup ? warmupPace(level) : undefined });
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
