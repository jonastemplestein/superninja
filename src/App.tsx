import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Stage, FxLayer, HelpButton, VillainCutIn, useHelp, SenseiDock, img, heroImg, useHero, Icon, RoundButton, fx, sleep, W, tapProps, TapHint, stageXY } from "./ui/ui";
import { say, sfx, playMusic, unlockAudio, hush, preload, urls, isSpeaking } from "./engine/audio";
import { store, useSave } from "./engine/store";
import { WORLDS, LEVELS, levelById, worldOf, makeReview, type Level } from "./content/worlds";
import { STORIES } from "./content/stories";
import { Dojo } from "./scenes/Dojo";
import { ListenLevel, FirstSoundLevel, SoundHuntLevel, EarlyDojo } from "./scenes/Early";
import { Battle } from "./scenes/Battle";
import { Run } from "./scenes/Run";
import { Swap } from "./scenes/Swap";
import { Sort } from "./scenes/Sort";
import { StoryScene } from "./scenes/Story";
import { Tree } from "./scenes/Tree";
import { Grownups } from "./scenes/Grownups";
import { Intro } from "./scenes/Intro";
import { IntroFilm } from "./scenes/IntroFilm";
import { Placement } from "./scenes/Placement";
import { Training } from "./scenes/Training";
import { Book } from "./scenes/Book";
import { Setup, needsSetup } from "./scenes/Setup";
import { Profiles } from "./scenes/Profiles";
import { makeTrial, readyGems, energyOf, gemByKey, frontier, shouldOfferJump } from "./engine/gems";
import { JumpAhead } from "./scenes/JumpAhead";
import { levelGains, levelNewWords, resetLevelGains, ENERGY_FULL } from "./engine/store";
import { GemIcon } from "./ui/Gem";
import { PHONEMES, WORD_BY_TEXT } from "./content/phonics";
import { NinjaDemo } from "./scenes/NinjaDemo";
import { NinjaSpot, ninja, type Move } from "./ui/Ninja";
import { streak } from "./engine/streak";
import "./styles/shell.css";

type Route =
  | { name: "title" }
  | { name: "intro" }
  | { name: "choose" }
  | { name: "placement" }
  | { name: "training" }
  | { name: "book" }
  | { name: "setup" }
  | { name: "profiles" }
  | { name: "map"; world?: number }
  | { name: "level"; id: string }
  | { name: "reward"; id: string; stars: number }
  | { name: "tree"; celebrate?: { gem: string; won: boolean } }
  | { name: "grownups" }
  | { name: "finale" };

export interface LevelProps {
  level: Level;
  onDone: (stars: number) => void;
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
    if (lv && levelById(lv)) return { name: "level", id: lv };
    const sc = q.get("scene") as Route["name"] | null;
    if (sc) return { name: sc } as Route;
    return needsSetup() ? { name: "setup" } : { name: "title" };
  });
  const [fade, setFade] = useState(0);
  const go = (r: Route) => {
    hush();
    setFade((f) => f + 1);
    setRoute(r);
  };
  const worldColour =
    route.name === "level" || route.name === "reward" ? worldOf(levelById(route.id)).colour : route.name === "map" ? WORLDS[(route.world ?? currentLevel().world) - 1].colour : "#ff7aa2";

  // expose for automated playtesting
  useEffect(() => {
    (window as any).__sn = { go, store, LEVELS };
  });

  return (
    <Stage worldColour={worldColour}>
      {route.name === "setup" && <Setup onDone={() => go({ name: "title" })} />}
      {route.name === "title" && <Title onStart={() => go({ name: "profiles" })} />}
      {route.name === "profiles" && (
        <Profiles onPlay={() => go(store.get().seenIntro && store.get().hero ? { name: "map" } : { name: "intro" })} onNew={() => go({ name: "intro" })} />
      )}
      {route.name === "intro" && <IntroFilm onDone={() => go({ name: "choose" })} />}
      {route.name === "choose" && <Choose onDone={() => go(!store.get().seenTraining ? { name: "training" } : store.get().seenPlacement ? { name: "map" } : { name: "placement" })} />}
      {route.name === "training" && <Training onDone={() => go(store.get().seenPlacement ? { name: "map" } : { name: "placement" })} />}
      {route.name === "placement" && <Placement onDone={() => go({ name: "map" })} />}
      {route.name === "map" && (
        <WorldMap
          world={route.world}
          onLevel={(id) => go({ name: "level", id })}
          onTree={() => go({ name: "tree" })}
          onBook={() => go({ name: "book" })}
          onGrownups={() => go({ name: "grownups" })}
          onTitle={() => go({ name: "title" })}
        />
      )}
      {route.name === "level" && (
        <LevelHost
          key={route.id + fade}
          level={levelById(route.id)}
          onDone={(stars) => {
            const lv = levelById(route.id);
            // a finished level's streak carries over into the next level (docs/HERO.md)
            if (stars > 0) streak.bank();
            else streak.drop();
            if (lv.trialGem) go({ name: "tree", celebrate: { gem: lv.trialGem, won: stars > 0 } });
            else go({ name: "reward", id: route.id, stars });
          }}
          onQuit={() => {
            streak.drop();
            go({ name: "map", world: levelById(route.id).world });
          }}
        />
      )}
      {route.name === "reward" && (
        <Reward
          level={levelById(route.id)}
          stars={route.stars}
          onNext={(finale) => {
            const lv = levelById(route.id);
            const last = worldOf(lv).levels[worldOf(lv).levels.length - 1].id === lv.id;
            go(finale ? { name: "finale" } : { name: "map", world: last ? Math.min(WORLDS.length, lv.world + 1) : lv.world });
          }}
          onReplay={() => go({ name: "level", id: route.id })}
          onFlower={() => go({ name: "tree" })}
          onJumped={() => setTimeout(() => go({ name: "map", world: frontier().world }), 1200)}
        />
      )}
      {route.name === "tree" && (
        <Tree
          celebrate={route.celebrate}
          onBack={() => go({ name: "map" })}
          onTrial={(key) => {
            makeTrial(key);
            go({ name: "level", id: "trial" });
          }}
        />
      )}
      {route.name === "grownups" && <Grownups onBack={() => go({ name: "map" })} />}
      {route.name === "book" && <Book onBack={() => go({ name: "map" })} />}
      {route.name === "finale" && <Intro finale onDone={() => go({ name: "map", world: 6 })} />}
      {(route.name as string) === "ninja-demo" && <NinjaDemo />}
      <VillainCutIn />
      <HelpButton />
      <FxLayer />
      <div className="fullscreen-fade" key={fade} />
    </Stage>
  );
}

function LevelHost(props: LevelProps) {
  const { level } = props;
  useState(() => resetLevelGains());
  switch (level.kind) {
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

// ---------------------------------------------------------------- Title
function Title({ onStart }: { onStart: () => void }) {
  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState(false);
  useHelp(() => {
    unlockAudio();
    say({ line: "help_start" });
  });
  useEffect(() => {
    preload([urls.line("tap_start"), urls.music("title")]);
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
function Choose({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useHelp(() => say({ line: "help_choose" }));
  useEffect(() => {
    say({ line: "intro_8" });
  }, []);
  // a child can change their mind: the last ninja tapped wins, and we only move on after a quiet moment
  const latest = useRef(0);
  const choose = async (h: "kai" | "suki") => {
    if (picked === h) return;
    const my = ++latest.current;
    setPicked(h);
    sfx.great();
    fx.burst(h === "kai" ? 400 : 880, 380, "stars", 30);
    store.set((s) => {
      s.hero = h;
      s.seenIntro = true;
    });
    await say({ line: "chose" });
    await sleep(1200);
    if (latest.current === my) onDone();
  };
  return (
    <div className="scene choose">
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <div className="display" style={{ position: "absolute", top: 34, width: "100%", textAlign: "center", fontSize: 64 }}>
        Choose your ninja!
      </div>
      {(["kai", "suki"] as const).map((h, i) => (
        <button
          key={h}
          {...tapProps(() => choose(h))}
          aria-label={h}
          className={`panel pop-in choose-card ${picked && picked !== h ? "other" : ""}`}
          style={{
            // the two cards sit left of centre; Sensei's caption bubble has the right-hand side, above his Help button
            position: "absolute", left: 150 + i * 390, top: 140, width: 350, height: 440, animationDelay: `${i * 0.12}s`,
            background: i ? "linear-gradient(180deg,#d7fbf3,#8fe0cf)" : "linear-gradient(180deg,#dfe0ff,#9ea3f0)",
            transform: picked === h ? "scale(1.06)" : picked ? "scale(0.9)" : undefined, opacity: picked && picked !== h ? 0.5 : 1, transition: "transform .3s, opacity .3s",
          }}
        >
          {picked === h ? (
            <PickedNinja key={h} />
          ) : (
            <img src={heroImg(h, "idle")} alt="" style={{ width: 280, position: "absolute", left: 35, bottom: 22 }} className="breathe" />
          )}
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
  return <NinjaSpot size={280} x={35} bottom={22} z={3} noFlames />;
}

// ---------------------------------------------------------------- World map
const MAP_HERO_W = 128, MAP_HERO_H = 172; // the idle sprites are ~1.34 tall per wide; the img's box is bottom-aligned
const KIND_ICON: Record<string, string> = { dojo: "sensei_idle", run: "item_gong", swap: "item_scroll", sort: "item_chest", story: "item_lantern", listen: "pic_sun", firstsound: "pic_mat", soundhunt: "pic_pig" };
function nodePos(i: number, n: number) {
  if (n > 10) {
    // two rows, snaking: along the bottom left→right, then back along the top right→left
    const half = Math.ceil(n / 2);
    const row = i < half ? 0 : 1;
    const j = row ? i - half : i;
    const cnt = row ? n - half : half;
    const t = cnt === 1 ? 0.5 : j / (cnt - 1);
    // the bottom row stops at x 1020, so even the big current stone and its pointing hand stay clear of Sensei's
    // Help button (bottom-right); the top row starts left of the Word Book / Flower column (right edge). Both rows
    // start far enough left that neighbouring stones don't overlap (8 stones: ~124 px apart)
    const x = row ? 1060 - t * 880 : 150 + t * 870;
    return { x, y: (row ? 330 : 540) + Math.sin(t * Math.PI * 2) * 18 };
  }
  const t = n === 1 ? 0.5 : i / (n - 1);
  const x = 130 + t * (1050 - 130); // the last stone stays clear of Sensei's Help button (bottom-right)
  const y = 470 + Math.sin(t * Math.PI * 2.2 + 0.4) * 80;
  return { x, y };
}

function WorldMap({ world, onLevel, onTree, onBook, onGrownups, onTitle }: { world?: number; onLevel: (id: string) => void; onTree: () => void; onBook: () => void; onGrownups: () => void; onTitle: () => void }) {
  const stars = useSave((s) => s.stars);
  const hero = useHero();
  const cur = currentLevel();
  const [wi, setWi] = useState((world ?? cur.world) - 1);
  const w = WORLDS[wi];
  const firstVisit = useRef(true);
  useEffect(() => {
    playMusic(w.music);
    const first = firstVisit.current;
    firstVisit.current = false;
    say(first && cur.world === w.id ? [{ line: `world_${w.id}` }, { gap: 200 }, { line: "map_hint" }] : [{ line: `world_${w.id}` }]);
  }, [wi]);
  const worldOpen = (i: number) => i >= 0 && i < WORLDS.length && isUnlocked(WORLDS[i].levels[0]);
  const heroAt = w.levels.findIndex((l) => l.id === cur.id);
  const readyCount = readyGems().length;
  useHelp((n) => say(n === 1 ? { line: "help_map" } : [{ line: "help_map" }, { gap: 200 }, { line: "map_hint" }]));
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
        const size = isCur ? (w.levels.length > 10 ? 146 : 158) : !open ? 84 : boss ? 128 : 104; // two-row maps are tighter
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
            {st > 0 && (
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
      <div style={{ position: "absolute", top: 18, left: 18, display: "flex", gap: 12 }}>
        <RoundButton sm label="title" onClick={onTitle}><Icon.home /></RoundButton>
      </div>
      <div style={{ position: "absolute", top: 18, right: 18 }}>
        <HoldButton onHold={onGrownups} />
      </div>
      {/* the Word Book, the World Flower and Sensei's Challenge stack down the right edge (the Help button owns bottom-right) */}
      <div className="map-side">
        <RoundButton label="Word Book" onClick={onBook} style={{ background: "radial-gradient(circle at 35% 30%, #ffd9c9 0%, #c9553f 55%, #7a2e2a 100%)" }}>
          <svg viewBox="0 0 64 64"><path fill="#fff4dc" stroke="#2b1d14" strokeWidth={5} strokeLinejoin="round" d="M8 14c8-3 16-3 24 2v36c-8-5-16-5-24-2zM56 14c-8-3-16-3-24 2v36c8-5 16-5 24-2z" /></svg>
        </RoundButton>
        <div style={{ position: "relative" }}>
          <RoundButton label="World Flower" className={`pink ${readyCount ? "pulse" : ""}`} onClick={onTree}><Icon.tree /></RoundButton>
          {readyCount > 0 && <span className="map-badge">{readyCount}</span>}
        </div>
        {LEVELS.indexOf(cur) >= 2 && (
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
/** The moves that fill the stars, left to right: a leaping star shot, a shuriken, then the big one. */
const STAR_MOVES: Move[][] = [["jump"], ["throw", "punch"], ["cast", "kick"]];
function Reward({ level, stars, onNext, onReplay, onFlower, onJumped }: { level: Level; stars: number; onNext: (finale: boolean) => void; onReplay: () => void; onFlower: () => void; onJumped: () => void }) {
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
  const [newWords] = useState(() => levelNewWords.slice(0, 4).map((t) => WORD_BY_TEXT[t]).filter(Boolean));
  useHelp(() => say({ line: "help_next" }));
  const [filled, setFilled] = useState(false);
  const [lit, setLit] = useState(0); // stars the ninja has filled so far
  const starEls = useRef<(HTMLDivElement | null)[]>([]);
  const [offerJump] = useState(() => level.id !== "review" && !level.trialGem && shouldOfferJump({ ...store.get(), stars: { ...store.get().stars, [level.id]: Math.max(store.get().stars[level.id] ?? 0, stars) } }));
  const [jumping, setJumping] = useState(false);
  const [talked, setTalked] = useState(false); // Sensei has finished the reward speech: from now on, nudge towards Next
  const [nudge, setNudge] = useState(false);
  const nextEl = useRef<HTMLDivElement>(null);
  const w = worldOf(level);
  const newPetals = [...new Set((level.teach ?? []).map((t) => t.split("=")[0]))];
  const isLastInWorld = w.levels[w.levels.length - 1].id === level.id;
  const isFinale = level.id === LEVELS[LEVELS.length - 1].id;
  useEffect(() => {
    if (level.id !== "review" && !(store.get().stars[level.id] > 0)) mapAnim.from = level.id;
    store.set((s) => {
      if (level.id === "review") return;
      s.stars[level.id] = Math.max(s.stars[level.id] ?? 0, stars);
      for (const g of newPetals) if (!s.petals.includes(g)) s.petals.push(g);
    });
    playMusic(null);
    let live = true;
    // the ninja fills each star it earned with a different move (the level's streak still glowing), then celebrates
    (async () => {
      await sleep(420);
      for (let i = 0; i < stars && live; i++) {
        const pool = STAR_MOVES[i];
        const move = pool[streak.tier >= 2 ? pool.length - 1 : 0];
        await ninja.act(move, starEls.current[i]);
        if (!live) return;
        setLit(i + 1);
        sfx.coin();
        const p = stageXY(starEls.current[i]);
        fx.burst(p.x, p.y, "stars", 10 + i * 4, 1.1);
        fx.ring(p.x, p.y, { color: "#ffe38a", r0: 30, r1: 150 + i * 30, width: 12 });
        await sleep(140);
      }
      if (!live) return;
      sfx.fanfare();
      fx.rain("confetti", 90);
      if (stars >= 3) await ninja.act("power");
      if (live) await ninja.act("cheer");
    })();
    (async () => {
      await sleep(600);
      const seq: any[] = [{ line: level.kind === "boss" ? "battle_boss_win" : "yay_7" }];
      if (newPetals.length) seq.push({ gap: 200 }, { line: newPetals.length > 1 ? "petals_got" : "petal_got" });
      if (isLastInWorld && !isFinale) seq.push({ gap: 200 }, { line: "world_done" });
      setFilled(true);
      await say(seq);
      if (readyNow) {
        sfx.petal();
        await say({ line: "gem_ready" });
      } else if (gains.length) await say({ line: "gem_energy" });
      if (newWords.length) await say({ line: "book_new" });
      if (offerJump) await say({ line: "jump_offer" });
      // gentle rest nudge: little ones (Bamboo Village) after ~12 minutes, everyone after ~18; once per session
      const mins = performance.now() / 60_000;
      if (!restNudged && (mins > 18 || (mins > 12 && w.key === WORLDS[0].key))) {
        restNudged = true;
        await say({ line: mins > 18 ? "break_time" : "dojo_nap" }, { keep: true });
      }
      if (live) setTalked(true);
    })();
    return () => void (live = false);
  }, []);
  // A child who doesn't know what to do next isn't left staring at a still screen: after ~3 s a hand points at the
  // green Next arrow, and after ~6 s the ninja leaps and points at it with a star while Sensei says "Tap the green
  // arrow to carry on!". Once more after ~14 s, then it stays quiet. (Leaving the screen clears the timers.)
  useEffect(() => {
    if (!talked || jumping) return;
    const nudgeNext = () => {
      if (isSpeaking()) return;
      void ninja.act("jump", nextEl.current?.querySelector("button") ?? undefined);
      say({ line: "help_next" });
    };
    const ts = [setTimeout(() => setNudge(true), 3000), setTimeout(nudgeNext, 6000), setTimeout(nudgeNext, 14000)];
    return () => ts.forEach(clearTimeout);
  }, [talked, jumping]);
  const gemSize = gains.length > 4 || newWords.length ? 96 : 118;
  // the panel fits what there is to show (stars; new Word Book stickers; gem energy), centred in the space above the bubble
  const gemsTop = newWords.length ? 250 : 176;
  const panelH = gains.length ? gemsTop + gemSize + 24 : newWords.length ? 254 : 186;
  const panelTop = 18 + Math.max(0, (402 - panelH) / 2);
  return (
    <div className="scene reward">
      <img className="bg-img" src={img(`bg_${w.key}`)} alt="" style={{ filter: "blur(3px) brightness(.8)" }} />
      <div className="vignette" />
      {/* the child's ninja, bottom-left as in every level, still wearing the level's streak */}
      <NinjaSpot size={270} x={34} />
      <div className="panel pop-in reward-panel" style={{ top: panelTop, height: panelH }}>
        {/* three star slots: the ninja strikes each star the child earned, and it lights up */}
        <div className="reward-stars">
          {[0, 1, 2].map((i) => (
            <div key={i} ref={(el) => void (starEls.current[i] = el)} className={`reward-star ${i < lit ? "on" : ""}`}>
              <span className="empty"><Icon.star on={false} /></span>
              <span className="full"><Icon.star on /></span>
            </div>
          ))}
        </div>
        {/* new Word Book stickers */}
        {newWords.length > 0 && (
          <div className="reward-words">
            {newWords.map((w, i) => (
              <div key={w.text} className="pop-in reward-word" style={{ animationDelay: `${1 + i * 0.12}s`, rotate: `${(i % 3) * 4 - 4}deg` }}>
                {w.pic ? <img src={img(`pic_${w.text}`)} alt="" /> : <span>{w.text}</span>}
              </div>
            ))}
          </div>
        )}
        {/* gem energy earned this level: rings fill up; a full gem glows and offers its Gem Trial */}
        <div className="reward-gems" style={{ top: gemsTop }}>
          {gains.map(({ gem, before, after }, i) => {
            const full = after >= 1 && !store.get().gems.includes(gem.key);
            return (
              <div key={gem.key} className="pop-in" style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                <GemIcon g={gem.g} colour={PHONEMES[gem.p].colour} state={full && filled ? "ready" : "charging"} energy={filled ? after : before} size={gemSize} />
              </div>
            );
          })}
        </div>
      </div>
      {/* below the panel, clear of the ninja (bottom-left), Sensei's Help button (bottom-right) and his caption bubble */}
      <div className="reward-buttons">
        {offerJump && filled && (
          <RoundButton label="Jump ahead" className="pulse" onClick={() => setJumping(true)} style={{ width: 110, height: 110, background: "radial-gradient(circle at 35% 30%, #e6f0ff 0%, #6aa8ff 55%, #2d5fb8 100%)" }}>
            <svg viewBox="0 0 64 64"><path fill="#fff4dc" stroke="#2b1d14" strokeWidth={5} strokeLinejoin="round" d="M10 40l14-14 10 10 20-22v14h6V6H38v6h14L34 32 24 22 6 40z" /></svg>
          </RoundButton>
        )}
        {readyNow && filled && (
          <RoundButton label="Go to the World Flower" className="pink pulse" onClick={onFlower} style={{ width: 110, height: 110 }}><Icon.tree /></RoundButton>
        )}
        <RoundButton label="Play again" onClick={onReplay}><svg viewBox="0 0 64 64"><path fill="none" stroke="#2b1d14" strokeWidth={7} strokeLinecap="round" d="M48 34a16 16 0 1 1-6-13M44 10v12H32" /></svg></RoundButton>
        <div ref={nextEl} style={{ position: "relative" }}>
          <RoundButton label="Next" className="go pulse" onClick={() => onNext(isFinale)} style={{ width: 128, height: 128 }}><Icon.next /></RoundButton>
          <TapHint show={nudge && !jumping} style={{ right: -84, bottom: -12 }} />
        </div>
      </div>
      {jumping && <JumpAhead gated onClose={() => setJumping(false)} onJumped={onJumped} />}
      <SenseiDock />
    </div>
  );
}

export { STORIES };
