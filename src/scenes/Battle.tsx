// Battle: spelling is spellcasting. Hear a word, spell it sound-by-sound; each correct sound throws a shuriken,
// the finished word is cast as a spell. Mistakes get specific correction and let the monster charge.
import { useEffect, useRef, useState } from "react";
import type { LevelProps } from "../App";
import type { Word } from "../content/phonics";
import { MONSTER_INFO, worldOf } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, hush } from "../engine/audio";
import { chooseWords, tileBank, pick, shuffle } from "../engine/learner";
import { WORD_BY_TEXT } from "../content/phonics";
import { recordSpell, recordWordSpelt, useSave, store, ENERGY_FULL } from "../engine/store";
import { trialWords, gemByKey } from "../engine/gems";
import { GemIcon } from "../ui/Gem";
import { PHONEMES } from "../content/phonics";
import { BARON_TAUNTS } from "../content/lines";
import { SenseiDock, Tile, img, RoundButton, Icon, Hearts, fx, stageXY, sleep, heroImg, useHero, shakeStage, useIdlePrompt, useHelp, useBaronOnScreen, WordCard } from "../ui/ui";
import { useKeyTiles } from "../ui/keys";
import { pickPraise, correction } from "./Dojo";

const MAX_HEARTS = 3;

export function Battle({ level, onDone, onQuit }: LevelProps) {
  const boss = level.kind === "boss";
  const info = MONSTER_INFO[level.monster!];
  const world = worldOf(level);
  const hero = useHero();
  const relaxedSetting = useSave((s) => s.settings.relaxed);
  // Time pressure only exists in Gem Trials, which a child unlocks by filling a gem with practice.
  const trialKey = level.trialGem;
  useBaronOnScreen(level.monster === "boss_baron");
  const timed = !!trialKey && !relaxedSetting;
  const relaxed = !timed;
  const firstTimed = useRef(timed && !store.get().seenTimer).current;
  const [explain, setExplain] = useState(false);
  const words = useRef<Word[]>(
    trialKey
      ? trialWords(trialKey, info.hp)
      : level.words
        ? shuffle(Array.from({ length: info.hp }, (_, k) => WORD_BY_TEXT[level.words![k % level.words!.length]]))
        : chooseWords(level, info.hp, "spell", { maxLen: boss ? 6 : 5 }),
  ).current;
  const hpMax = words.length;
  // never strand a child in a battle with nothing to spell: go back to the map
  useEffect(() => {
    if (!words.length) onQuit();
  }, []);
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(hpMax);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [pose, setPose] = useState<"idle" | "throw" | "cast" | "hurt" | "cheer">("idle");
  const [monState, setMonState] = useState<"" | "hit" | "attack" | "dead">("");
  const [charge, setCharge] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [locked, setLocked] = useState(true);
  const [spell, setSpell] = useState<string | null>(null);
  const [enraged, setEnraged] = useState(false);
  const misses = useRef(0);
  const wordMisses = useRef(0);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const knockouts = useRef(0);
  const heroRef = useRef<HTMLImageElement>(null);
  const monRef = useRef<HTMLImageElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const word = words[idx];
  const bank = useRef<Record<number, string[]>>({});
  if (word && !bank.current[idx]) bank.current[idx] = tileBank(word, level, level.distractors ?? (boss ? 4 : 3));
  const tiles = word ? bank.current[idx] : [];

  // ---- intro
  useEffect(() => {
    playMusic(boss ? "boss" : "battle");
    preload(words.map((w) => urls.word(w.text)));
    let live = true;
    (async () => {
      await sleep(600);
      if (!live) return;
      const seq: any[] = trialKey ? [{ line: "trial_start" }] : boss ? [{ line: `baron_w${world.id}` }, { gap: 300 }, { line: "battle_boss" }] : [{ line: level.id === "review" ? "challenge_start" : "battle_start" }];
      await say(seq);
      if (!live) return;
      if (firstTimed) {
        setExplain(true);
        await say({ line: "timer_intro_1" });
        // demo: fill the bar a little so they see it move
        for (let k = 0; k <= 30; k++) {
          setCharge(k / 100);
          await sleep(30);
        }
        await say({ line: "timer_intro_2" });
        await say({ line: "timer_intro_3" });
        setCharge(0);
        setExplain(false);
        store.set((s) => void (s.seenTimer = true));
      }
      if (live) await ask();
    })();
    return () => {
      live = false;
      hush();
    };
  }, []);

  const ask = async (w = word) => {
    setLocked(true);
    await say(w === words[0] && !trialKey ? [{ line: "battle_spell" }, { gap: 500 }, { word: w.text }] : [{ gap: 150 }, { word: w.text }]);
    setLocked(false);
  };

  // ---- charge timer (monster attacks when full)
  const chargeRef = useRef(0);
  useEffect(() => {
    if (relaxed || locked || monState === "dead") return;
    const per = (boss ? 7000 : 9000) + word.segs.length * 2200;
    const speed = (enraged ? 1.35 : 1) * (firstTimed ? 0.6 : 1);
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      chargeRef.current = Math.min(1, chargeRef.current + (dt / per) * speed);
      setCharge(chargeRef.current);
      if (chargeRef.current >= 1) {
        monsterAttack();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [relaxed, locked, idx, monState, enraged]);

  const monsterAttack = async () => {
    setLocked(true);
    chargeRef.current = 0;
    setCharge(0);
    sfx.charge();
    setMonState("attack");
    await sleep(380);
    sfx.hurt();
    shakeStage();
    setPose("hurt");
    const xy = stageXY(heroRef.current);
    fx.burst(xy.x, xy.y, "stars", 14);
    setMonState("");
    const h = hearts - 1;
    setHearts(h);
    await sleep(700);
    setPose("idle");
    if (h <= 0 && trialKey) {
      // trial failed: gentle, and the gem keeps most of its energy
      setMonState("dead");
      store.set((s) => void (s.energy[trialKey] = ENERGY_FULL * 0.6));
      await say({ line: "trial_fail" });
      onDone(0);
      return;
    }
    if (h <= 0) {
      knockouts.current++;
      await say({ line: "battle_oops" });
      setHearts(MAX_HEARTS);
      // model the word so they can succeed
      await say([{ line: "battle_hint" }, { gap: 100 }]);
      await sayBlend(word.segs, word.text);
    } else {
      await say([{ line: "listen_again" }, { gap: 80 }, { word: word.text }]);
    }
    setLocked(false);
  };

  const throwShuriken = (target: HTMLElement | null) => {
    const from = stageXY(heroRef.current);
    const to = stageXY(target);
    const el = document.createElement("img");
    el.src = img("item_shuriken");
    el.className = "sprite";
    Object.assign(el.style, { width: "70px", left: "0px", top: "0px", zIndex: "40" });
    heroRef.current?.parentElement?.appendChild(el);
    el.animate(
      [
        { transform: `translate(${from.x + 40}px, ${from.y - 40}px) rotate(0deg) scale(.6)` },
        { transform: `translate(${(from.x + to.x) / 2}px, ${Math.min(from.y, to.y) - 120}px) rotate(540deg) scale(1)` },
        { transform: `translate(${to.x - 35}px, ${to.y - 35}px) rotate(1080deg) scale(.9)` },
      ],
      { duration: 420, easing: "cubic-bezier(.3,.1,.5,1)" },
    ).onfinish = () => {
      el.remove();
      fx.burst(to.x, to.y, "sparks", 10);
    };
  };

  const tap = async (g: string) => {
    if (locked || !word) return;
    const i = filled.length;
    const need = word.segs[i];
    if (g === need.g) {
      slotMisses.current = 0;
      recordSpell(need, wordMisses.current === 0);
      const f = [...filled, g];
      setFilled(f);
      setPose("throw");
      sfx.swish();
      throwShuriken(monRef.current);
      setTimeout(() => {
        sfx.hit();
        setMonState("hit");
        setTimeout(() => setMonState(""), 300);
      }, 400);
      setTimeout(() => setPose("idle"), 350);
      say({ sound: need.p });
      if (f.length === word.segs.length) await castSpell(f);
    } else {
      misses.current++;
      wordMisses.current++;
      recordSpell(need, false);
      setWrong(g);
      sfx.wrong();
      if (!relaxed) chargeRef.current = Math.min(0.95, chargeRef.current + 0.18);
      setLocked(true);
      slotMisses.current++;
      await say(correction(g, need, word.text, slotMisses.current), { reveal: slotMisses.current > 1 });
      setWrong(null);
      setLocked(false);
    }
  };

  const castSpell = async (f: string[]) => {
    setLocked(true);
    recordWordSpelt(word, wordMisses.current === 0);
    await sleep(350);
    setPose("cast");
    await sayBlend(word.segs, word.text, setLit);
    setLit(-1);
    // the word flies as a spell
    setSpell(f.join(""));
    sfx.zap();
    await sleep(520);
    setSpell(null);
    sfx.hit();
    shakeStage();
    const xy = stageXY(monRef.current);
    fx.burst(xy.x, xy.y, "stars", 26, 1.3);
    fx.burst(xy.x, xy.y, "petals", 12);
    setMonState("hit");
    const nhp = hp - 1;
    setHp(nhp);
    await sleep(450);
    setMonState("");
    setPose("idle");
    chargeRef.current = Math.max(0, chargeRef.current - 0.35);
    setCharge(chargeRef.current);
    if (nhp <= 0) return win();
    // boss drama
    if (boss && !enraged && nhp <= hpMax / 2) {
      setEnraged(true);
      await say([{ line: "baron_grr" }]);
    } else if (boss && Math.random() < 0.45) {
      await say({ line: pick(BARON_TAUNTS) });
    } else {
      await say({ line: pickPraise() });
    }
    wordMisses.current = 0;
    setFilled([]);
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    await ask(words[nextIdx]);
  };

  const win = async () => {
    setMonState("dead");
    sfx.great();
    fx.rain("petals", 50);
    setPose("cheer");
    await sleep(900);
    if (trialKey) {
      store.set((s) => {
        if (!s.gems.includes(trialKey)) s.gems.push(trialKey);
      });
      await say({ line: "trial_win" });
      onDone(3);
      return;
    }
    if (boss) await say({ line: "baron_lose" });
    await say({ line: "battle_win" });
    const m = misses.current + knockouts.current * 3;
    onDone(m <= 1 ? 3 : m <= 5 ? 2 : 1);
  };

  useKeyTiles(tiles, tap, () => word && !locked && ask());
  useIdlePrompt(!locked && !!word, 9000, () => say([{ line: "listen" }, { word: word.text }]), [idx]);
  const [helpLvl, setHelpLvl] = useState(0);
  useEffect(() => setHelpLvl(0), [idx, filled.length]);
  useHelp(
    (n) => {
      if (!word || locked) return;
      setHelpLvl(n);
      if (n === 1) say([{ word: word.text }, { gap: 350 }, { line: "help_tiles" }]);
      else if (n === 2) say([{ line: "say_sounds" }, { sounds: word.segs, gap: 300 }, { word: word.text }]);
      else say([{ line: "help_look" }, { gap: 100 }, { sound: word.segs[filled.length]?.p ?? word.segs[0].p }], { reveal: true });
    },
    [idx, filled.length, locked],
  );
  (window as any).__snState = { scene: "battle", locked, next: word?.segs[filled.length]?.g, word: word?.text };

  const monH = 300 * (info.scale ?? 1);
  const monW = 360 * (info.scale ?? 1);
  const monFlip = info.facing === "right";
  return (
    <div className="scene">
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      {enraged && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 60%, rgba(226,65,47,.25), transparent 60%)", pointerEvents: "none" }} />}

      {/* hero */}
      <div className="shadow-blob" style={{ left: 60, top: 598, width: 230 }} />
      <img
        ref={heroRef}
        className={`sprite ${pose === "idle" ? "breathe" : ""}`}
        src={heroImg(hero, pose)}
        alt=""
        style={{ left: 40, bottom: 110, width: 270, transition: "transform .15s", transform: pose === "hurt" ? "translateX(-30px) rotate(-8deg)" : pose === "throw" ? "translateX(12px)" : undefined, zIndex: 4 }}
      />

      {/* monster */}
      <div className="shadow-blob" style={{ left: 1040 - monW / 2 + 20, top: 600, width: monW * 0.8, opacity: monState === "dead" ? 0 : 1 }} />
      <div
        style={{
          position: "absolute", left: 1040 - monW / 2, bottom: 115, width: monW, zIndex: 3,
          transition: monState === "attack" ? "transform .35s cubic-bezier(.5,-0.4,.7,1.4)" : "transform .5s, opacity .8s",
          transform: monState === "attack" ? "translateX(-520px) scale(1.1)" : monState === "dead" ? "translate(260px,-420px) rotate(720deg) scale(.2)" : undefined,
          opacity: monState === "dead" ? 0 : 1,
        }}
      >
        <img
          ref={monRef}
          className={`sprite ${monState === "hit" ? "hit" : info.float ? "float" : "breathe"}`}
          src={img(`mon_${level.monster}`)}
          alt=""
          style={{ position: "relative", height: monH, width: "auto", maxWidth: monW, objectFit: "contain", display: "block", margin: "0 auto", transform: monFlip ? "scaleX(-1)" : undefined, filter: enraged ? "drop-shadow(0 0 18px rgba(226,65,47,.9))" : undefined }}
        />
      </div>

      {/* monster HP + charge */}
      <div style={{ position: "absolute", right: 60, top: 104, width: 330, zIndex: 6 }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
          {Array.from({ length: hpMax }, (_, i) => (
            <div key={i} style={{ width: 30, height: 30, borderRadius: 8, border: "4px solid var(--ink)", background: i < hp ? "linear-gradient(180deg,#ff9a8a,#e2412f)" : "rgba(43,29,20,.35)", transition: "background .3s", transform: i === hp ? "scale(.8)" : undefined }} />
          ))}
        </div>
        {!relaxed && (
          <div className={explain ? "pulse" : ""} style={{ marginTop: 10, height: 22, borderRadius: 12, border: "4px solid var(--ink)", background: "rgba(43,29,20,.35)", overflow: "hidden", boxShadow: explain ? "0 0 0 8px rgba(255,197,61,.9)" : undefined }}>
            <div style={{ height: "100%", width: `${charge * 100}%`, background: charge > 0.75 ? "linear-gradient(90deg,#ff8a3d,#e2412f)" : "linear-gradient(90deg,#b692ff,#7a4fe0)", transition: "background .3s" }} />
          </div>
        )}
      </div>

      {/* the prize gem in a Gem Trial */}
      {trialKey && gemByKey(trialKey) && monState !== "dead" && (
        <div className="float" style={{ position: "absolute", right: 60, top: 150, zIndex: 6 }}>
          <GemIcon g={gemByKey(trialKey)!.g} colour={PHONEMES[gemByKey(trialKey)!.p].colour} state="ready" size={120} />
        </div>
      )}
      {/* topbar */}
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}><Icon.home /></RoundButton>
        {timed && <Hearts n={hearts} max={MAX_HEARTS} />}
        <div className="spacer" />
      </div>

      {/* word prompt */}
      {word && monState !== "dead" && (
        <>
          <WordCard key={`c${idx}`} word={word} className="pop-in" onHear={() => !locked && ask()} style={{ left: 525, top: 30, width: 230, height: 180 }} />
          {word.pic && (
            <div style={{ position: "absolute", left: 770, top: 80 }}>
              <RoundButton sm label="Hear the word" onClick={() => !locked && ask()}><Icon.speaker /></RoundButton>
            </div>
          )}
          {/* between the hero (≈40–310) and the monster (centred at 1040): long words get smaller slots so the monster never covers them */}
          <div className={`slots ${word.segs.length >= 4 ? "compact" : ""}`} style={{ position: "absolute", left: 300, right: 420, top: 262, zIndex: 5 }}>
            {word.segs.map((_, i) => (
              <div key={`${idx}-${i}`} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : i === filled.length && !locked ? "active" : ""}`}>
                {i < filled.length && <Tile g={filled[i]} className="pop-in" withButtons={filled.length === word.segs.length} lit={lit === i} />}
              </div>
            ))}
          </div>
          <div className="row" style={{ position: "absolute", left: 300, right: 40, bottom: 26, gap: tiles.length > 7 ? 10 : 14, flexWrap: "nowrap", zIndex: 10 }}>
            {tiles.map((g) => (
              <Tile key={`${idx}-${g}`} g={g} size={tiles.length > 7 ? "sm" : undefined} state={wrong === g ? "wrong" : (slotMisses.current >= 2 || helpLvl >= 3) && g === word.segs[filled.length]?.g ? "hint" : ""} onTap={() => tap(g)} />
            ))}
          </div>
        </>
      )}

      {/* the spell */}
      {spell && (
        <div
          style={{
            position: "absolute", left: 280, top: 330, zIndex: 50, fontFamily: "var(--font-letters)", fontWeight: 700, fontSize: 110, color: "#fff8d0",
            textShadow: "0 0 20px #ffc53d, 0 0 40px #ff7aa2, 0 6px 0 #2b1d14", animation: "spellfly .52s cubic-bezier(.4,0,.8,.4) forwards",
          }}
        >
          {spell}
          <style>{`@keyframes spellfly{from{transform:translate(0,0) scale(.6);opacity:.4}40%{opacity:1;transform:translate(160px,-30px) scale(1.2)}to{transform:translate(620px,20px) scale(.5);opacity:.8}}`}</style>
        </div>
      )}
      <SenseiDock hidden />
      <CaptionTop />
    </div>
  );
}

/** Captions without the sensei sprite (for busy scenes). */
import { onCaption } from "../engine/audio";
export function CaptionTop({ top = 410 }: { top?: number }) {
  const [cap, setCap] = useState<{ text: string; who: string } | null>(null);
  const captions = useSave((s) => s.settings.captions);
  useEffect(() => onCaption(setCap), []);
  if (!cap || !captions) return null;
  return (
    <div
      key={cap.text}
      className={`bubble notail ${cap.who === "baron" ? "baron" : ""}`}
      style={{ left: "50%", translate: "-50% 0", top, bottom: "auto", maxWidth: 640, textAlign: "center", zIndex: 60 }}
    >
      {cap.text}
    </div>
  );
}
