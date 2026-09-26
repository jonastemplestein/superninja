// Battle: spelling is spellcasting. Hear a word and spell it sound by sound while the child's ninja (src/ui/Ninja.tsx)
// fights the monster: every correct sound is a hit that travels and lands (kicks, spells, shuriken). The move starts
// as the pure sound ends, so its whooshes and thwacks never sit on the sound the child earned. When the word is
// blended, the letters light one by one; then, as the whole word is said, each sound flies from its slot into the
// ninja's hands as a glowing orb, and the finisher carries that power into the monster.
// First-try answers build the streak (src/engine/streak.ts): auras, flames, bigger moves, and at the super tier bosses
// take combos. A tier-up always comes with a word's finisher (never in the middle of spelling a word): the word's held
// hits show as pale flames that light as the finisher goes, and however many tiers they cross there is one power-up and
// one line (the top tier's), heard in full in place of the praise. While a pure sound plays, audio.ts ducks sound
// effects right down, so the sound the child earned is always heard clean. Mistakes get a gentle "hm?" from the ninja,
// then "Keep going, ninja!" if a streak was lost, then specific correction ending on the model; in Gem Trials they also
// let the monster charge, and a monster attack is the only time the ninja is hurt. Layout contract (docs/HERO.md): the ninja stands bottom-left,
// Sensei's Help button bottom-right, the monster above Sensei's corner, and the letter tiles between x 340 and 1100,
// drawn above the ninja, so a lunge never hides a letter.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { LevelProps } from "../App";
import type { Word } from "../content/phonics";
import { MONSTER_INFO, worldOf } from "../content/worlds";
import { say, sayBlend, sfx, playMusic, preload, urls, hush, load } from "../engine/audio";
import { chooseWords, tileBank, pick, shuffle } from "../engine/learner";
import { WORD_BY_TEXT, PHONEMES } from "../content/phonics";
import { recordSpell, recordWordSpelt, useSave, store, ENERGY_FULL } from "../engine/store";
import { trialWords, gemByKey } from "../engine/gems";
import { FAST } from "../engine/fast";
import { streak, useStreak, tierOf, streakLine, type Tier } from "../engine/streak";
import { STRETCHED } from "../content/stretch";
import { correction, pickPraise } from "../engine/feedback";
import { GemIcon } from "../ui/Gem";
import { BARON_TAUNTS } from "../content/lines";
import { SenseiDock, Tile, img, RoundButton, Icon, Hearts, fx, fxDom, stageRect, sleep, shakeStage, useIdlePrompt, useHelp, useBaronOnScreen, useUpright, WordCard } from "../ui/ui";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { useKeyTiles } from "../ui/keys";
import "../styles/battle.css";

const MAX_HEARTS = 3;
/** The letter row sits between the ninja zone and the help zone. */
const ROW_L = 340;
const ROW_R = 1100;
/** Centre of the picture card and the sound slots. */
const TOP_CX = 636;
/** The monster's feet: on the ground, above Sensei's corner and the letter row. */
const MON_FEET = 574;
/** Where a blasted-off Baron Muddle vanishes, and pops back up to shake his fist (his caption bubble points here). */
const SKY = { x: 1150, y: 150 };
/** A taunt from Baron Muddle after a boss word: now and then, never two words running, never right after he roars. */
const TAUNT_CHANCE = 0.2;

type Pt = { x: number; y: number };


/** Size the letter tiles so the row fits between the zones, as big as possible: 90 stage px is about 44 px on a phone.
 *  A tile is --size wide at least; longer spellings grow with their letters (widths measured in the letter font). */
const glyph = (c: string) => ("mw".includes(c) ? 0.84 : "iljtfr".includes(c) ? 0.36 : 0.56);
const tileW = (g: string, px: number) => Math.max(px, [...g].reduce((s, c) => s + glyph(c), 0) * 0.62 * px + 42);
function rowFit(tiles: string[]): { px: number; gap: number } {
  const room = ROW_R - ROW_L - 12;
  for (const [px, gap] of [[104, 14], [96, 10], [90, 8], [84, 6], [80, 6]]) if (tiles.reduce((s, g) => s + tileW(g, px), 0) + gap * (tiles.length - 1) <= room) return { px, gap };
  return { px: 76, gap: 4 };
}

// ---------------------------------------------------------------- moves
/** A sound's hit: quick moves that land within about half a second of the sound ending, so a hit is over before the
 *  child's next sound (the slow, showy spells and somersaults are the word's finisher). Never one of the last two. */
const TAP_MOVES: Record<Tier, Move[]> = { 0: ["kick", "punch", "throw"], 1: ["kick", "punch", "throw", "jump"], 2: ["kick", "throw", "punch", "spin"], 3: ["kick", "spin", "throw", "punch"] };
const tapRecent: Move[] = [];
function tapMove(tier: Tier): Move {
  const pool = TAP_MOVES[tier].filter((m) => !tapRecent.includes(m));
  const m = pool[(Math.random() * pool.length) | 0] ?? TAP_MOVES[tier][0];
  tapRecent.push(m);
  if (tapRecent.length > 2) tapRecent.shift();
  return m;
}
/** The move that finishes a word, by streak tier (never the same twice running). */
const FINISH: Record<Tier, Move[]> = { 0: ["cast", "kick"], 1: ["cast", "kick", "punch"], 2: ["kick", "cast", "flip"], 3: ["flip", "cast", "kick", "spin"] };
/** Bosses at the super tier take a combo; at the master tier, a three-hit combo. */
const COMBO: Move[][] = [["punch", "kick"], ["spin", "cast"], ["throw", "flip"], ["jump", "kick"], ["kick", "spin"]];
const COMBO3: Move[][] = [["punch", "spin", "kick"], ["throw", "kick", "cast"], ["jump", "spin", "flip"], ["punch", "flip", "cast"]];
function pickNot<T>(list: T[], last: { current: string }): T {
  const pool = list.filter((m) => JSON.stringify(m) !== last.current);
  const m = pool[(Math.random() * pool.length) | 0] ?? list[0];
  last.current = JSON.stringify(m);
  return m;
}

// ---------------------------------------------------------------- little effects (stage coordinates, in the fx layer)
const centre = (el: Element | null | undefined): Pt => {
  const r = stageRect(el ?? null);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
/** A point on the ninja at rest (as Ninja.tsx measures it): fw = fraction of its width from its left edge, fh =
 *  fraction of its width above its feet, plus a stage-px offset (a move's lunge or leap at that moment). */
function onNinja(fw: number, fh: number, dx = 0, dy = 0): Pt {
  const r = stageRect(document.querySelector(".ninja-spot"));
  const g = r.w ? { x: r.x, y: r.y + r.h, w: r.w } : { x: 40, y: 702, w: 250 };
  return { x: g.x + g.w * fw + dx, y: g.y - g.w * fh + dy };
}
/** Just above the ninja's open palm in the cast pose, where a spell is held (stage px). */
const ninjaHands = () => onNinja(0.93, 0.64);
const lerp = (a: Pt, b: Pt, e: number): Pt => ({ x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e });
/** A point on one of the ninja's ribbon swooshes (a circle squashed vertically, as Ninja.tsx draws them). */
const onRibbon = (c: Pt, r: number, squash: number, deg: number): Pt => ({ x: c.x + r * Math.cos((deg * Math.PI) / 180), y: c.y + r * Math.sin((deg * Math.PI) / 180) * (1 - squash) });
/** Move an fx element (S px square) along a path, with an optional glowing trail. Resolves on arrival. */
function glide(el: HTMLElement, S: number, path: (t: number) => Pt, ms: number, scale: (t: number) => number, trail?: string[], fade?: boolean): Promise<void> {
  const t0 = performance.now();
  return new Promise((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const p = path(t);
      el.style.transform = `translate(${p.x - S / 2}px, ${p.y - S / 2}px) scale(${scale(t)})`;
      if (fade) el.style.opacity = `${1 - t}`;
      if (trail) fx.glow(p.x, p.y, trail, 2, 30 + 20 * (1 - t), 0.5, 16);
      if (t < 1 && el.isConnected) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
function addFx(cls: string, w: number, h: number, html = ""): HTMLDivElement | null {
  const layer = fxDom();
  if (!layer) return null;
  const d = document.createElement("div");
  d.className = cls;
  d.style.width = `${w}px`;
  d.style.height = `${h}px`;
  d.innerHTML = html;
  layer.appendChild(d);
  return d;
}
const gone = (a: Animation | undefined, el: Element) => a?.finished.then(() => el.remove(), () => el.remove()) ?? el.remove();
const STAR4 = `<svg viewBox="0 0 100 100"><path d="M50 2 L60 40 L98 50 L60 60 L50 98 L40 60 L2 50 L40 40 Z" fill="#fff8d0" stroke="#2b1d14" stroke-width="6" stroke-linejoin="round"/></svg>`;
/** A spinning star of light flying along an arc (a sound becoming power). Resolves on arrival. */
function dot(a: Pt, b: Pt, ms: number, colors: string[]): Promise<void> {
  const S = 54;
  const el = addFx("bt-spark", S, S, STAR4);
  if (!el) return Promise.resolve();
  // drop out of the slot first, then swoop across to the hands (never across the other slots)
  const c = { x: a.x - (a.x - b.x) * 0.22, y: Math.max(a.y, b.y) + 30 };
  const t0 = performance.now();
  return new Promise((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, ((now - t0) * FAST) / ms);
      const e = t * t * (3 - 2 * t);
      const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * c.x + e * e * b.x;
      const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * c.y + e * e * b.y;
      el.style.transform = `translate(${x - S / 2}px, ${y - S / 2}px) rotate(${t * 400}deg) scale(${1.1 - t * 0.45})`;
      fx.glow(x, y, colors, 2, 40, 0.6, 16);
      if (t < 1 && el.isConnected) requestAnimationFrame(frame);
      else {
        el.remove();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
/** The health pip breaks into shards. */
function shatter(el: Element | null | undefined) {
  if (!el) return;
  const c = centre(el);
  for (let i = 0; i < 7; i++) {
    const d = addFx("bt-shard", 16, 16);
    if (!d) return;
    const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
    const r = 46 + Math.random() * 40;
    gone(
      d.animate(
        [
          { transform: `translate(${c.x - 8}px, ${c.y - 8}px) rotate(0deg) scale(1)`, opacity: 1 },
          { transform: `translate(${c.x - 8 + Math.cos(a) * r}px, ${c.y - 8 + Math.sin(a) * r * 0.6 + 70}px) rotate(${Math.random() * 600 - 300}deg) scale(.5)`, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      ),
      d,
    );
  }
  fx.ring(c.x, c.y, { color: "#ff9a8a", r0: 10, r1: 70, width: 8, life: 16 });
  fx.twinkle(c.x, c.y, ["#fff4dc", "#ff9a8a"], 6, 5, 20);
}
/** "Ding!": the twinkle where a blasted-off monster vanishes into the sky. */
function ding(p: Pt) {
  const S = 120;
  const d = addFx("bt-ding", S, S, STAR4);
  if (!d) return;
  const at = (s: number, r: number) => `translate(${p.x - S / 2}px, ${p.y - S / 2}px) rotate(${r}deg) scale(${s})`;
  gone(d.animate([{ transform: at(0, 0) }, { transform: at(1.25, 60), offset: 0.3 }, { transform: at(0.9, 90), offset: 0.6 }, { transform: at(0, 180) }], { duration: 700, easing: "ease-out", fill: "forwards" }), d);
  fx.twinkle(p.x, p.y, ["#fff4dc", "#ffe38a", "#ffc53d"], 12, 6, 24);
  sfx.twinkle();
}
/** Push the monster back (and tilt it) when something lands. */
const knockAnims = new WeakMap<Element, Animation>();
function knock(el: Element | null | undefined, px: number, tilt: number) {
  if (!el) return;
  knockAnims.get(el)?.cancel();
  const a = el.animate(
    [
      { translate: "0 0", rotate: "0deg" },
      { translate: `${px}px ${-px * 0.18}px`, rotate: `${tilt}deg`, offset: 0.22, easing: "ease-out" },
      { translate: `${-px * 0.12}px 0`, rotate: `${-tilt * 0.3}deg`, offset: 0.68, easing: "ease-in-out" },
      { translate: "0 0", rotate: "0deg" },
    ] as Keyframe[],
    { duration: 320 + px * 6 },
  );
  knockAnims.set(el, a);
}

/** Squash-and-flash the monster sprite as a hit lands (like the ninja's own impact reaction, keeping its shadow). */
function squash(el: Element | null | undefined, tier: Tier, big = false) {
  const k = (big ? 1.5 : 1) * (1 + tier * 0.2);
  const shade = "drop-shadow(0 10px 8px rgba(43, 29, 20, 0.28))";
  el?.animate(
    [
      { scale: "1", filter: `brightness(1) ${shade}` },
      { scale: `${1 + 0.14 * k} ${1 - 0.13 * k}`, filter: `brightness(${big ? 2.3 : 1.8}) ${shade}`, offset: 0.18 },
      { scale: `${1 - 0.06 * k} ${1 + 0.07 * k}`, filter: `brightness(1.2) ${shade}`, offset: 0.45 },
      { scale: "1.03 .97", offset: 0.7 },
      { scale: "1", filter: `brightness(1) ${shade}` },
    ] as Keyframe[],
    { duration: big ? 560 : 440, easing: "ease-out" },
  );
}

export function Battle({ level, onDone, onQuit }: LevelProps) {
  const boss = level.kind === "boss";
  const info = MONSTER_INFO[level.monster!];
  const world = worldOf(level);
  const relaxedSetting = useSave((s) => s.settings.relaxed);
  // Time pressure only exists in Gem Trials, which a child unlocks by filling a gem with practice.
  const trialKey = level.trialGem;
  const baronHere = level.monster === "boss_baron";
  useBaronOnScreen(baronHere);
  const timed = !!trialKey && !relaxedSetting;
  const relaxed = !timed;
  const firstTimed = useRef(timed && !store.get().seenTimer).current;
  const upright = useUpright();
  const { tier } = useStreak();
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
  const [chip, setChip] = useState(0); // sounds that have landed on this word: they wear its health pip down
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [dead, setDead] = useState(false);
  const [ko, setKo] = useState(false); // knocked out: the health bar goes as the monster blasts off
  const [gemFlown, setGemFlown] = useState(false);
  const [charge, setCharge] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [locked, setLocked] = useState(true);
  const [enraged, setEnraged] = useState(false);
  const [dizzy, setDizzy] = useState(0);
  const misses = useRef(0);
  const wordMisses = useRef(0);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const knockouts = useRef(0);
  /** Correct taps waiting for their sound to finish: `hits` first-try answers for the streak, `chips` hits on the
   *  monster. `seq` counts taps, so a tap that cuts a sound short carries its hit instead. A word's last sound is
   *  counted as its finisher goes, so a power-up never plays over the blending. */
  const pend = useRef({ seq: 0, hits: 0, chips: 0 });
  const [pendN, setPendN] = useState(0); // the held first-try answers, shown as pale flames
  const hold = (n: number) => {
    pend.current.hits = n;
    setPendN(n);
  };
  const tierWait = useRef<Promise<void> | null>(null); // a tier-up still playing out (its line, its power-up)
  const tFinish = useRef(0); // when the child tapped a word's last sound (a word's drama is kept short after it)
  const lastDrama = useRef<"" | "grr" | "taunt">(""); // Baron Muddle's cut-in after the previous boss word
  const [sky, setSky] = useState(0); // Baron Muddle, blasted off: 1 shaking his fist in the sky, 2 bonked away
  const skyRef = useRef<HTMLDivElement>(null);
  const lastFinish = useRef("");
  const alive = useRef(true);
  const idxRef = useRef(0);
  idxRef.current = idx;
  const monPos = useRef<HTMLDivElement>(null); // entrance, attack lunge, blast-off
  const monHit = useRef<HTMLDivElement>(null); // knockbacks and taunts
  const monRef = useRef<HTMLImageElement>(null); // what the ninja aims at
  const gemRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const word = words[idx];
  const bank = useRef<Record<number, string[]>>({});
  if (word && !bank.current[idx]) bank.current[idx] = tileBank(word, level, level.distractors ?? (boss ? 4 : 3));
  const tiles = word ? bank.current[idx] : [];

  const monScale = 1 + ((info.scale ?? 1) - 1) * 0.8;
  const monH = Math.round(286 * monScale);
  const monW = Math.round(monH * 1.18);
  const monCx = boss ? 1040 : 1020;
  /** Where the ninja's hits land: the monster's front, upper chest. (That keeps impacts above Sensei's caption bubble,
   *  which sits over the monster's feet when captions are on, and spells arcing under the sound slots.) */
  const aim = (): Pt => {
    const r = stageRect(monRef.current);
    return r.w ? { x: r.x + r.w * 0.4, y: r.y + r.h * 0.42 } : { x: monCx - 60, y: MON_FEET - monH * 0.58 };
  };

  // ---- intro: the monster drops in (flyers swoop in), the ninja shouts, Sensei explains
  useLayoutEffect(() => void streak.reset(), []);
  useEffect(() => {
    alive.current = true;
    playMusic(boss ? "boss" : "battle");
    preload(words.map((w) => urls.word(w.text)));
    preload(words.filter((w) => STRETCHED.has(w.text)).map((w) => `/a/x/${w.text}.mp3`));
    enter();
    let live = true;
    (async () => {
      await sleep(600);
      if (!live) return;
      if (boss && !trialKey) {
        // Baron Muddle's threat (the ninja stands on guard while he speaks); the ninja answers it by powering up as his
        // last words fade
        const threat = `baron_w${world.id}`;
        const said = say({ line: threat });
        const buf = await load(urls.line(threat));
        await Promise.race([said, sleep(Math.max(0, (buf ? (buf.duration * 1000) / FAST : 4000) - 400))]);
        if (!live) return;
        void ninja.act("power");
        await said;
        if (!live) return;
        await sleep(450); // Sensei speaks as the power-up's fanfare fades
        if (!live) return;
        await say({ line: "battle_boss" });
      } else await say({ line: trialKey ? "trial_start" : level.id === "review" ? "challenge_start" : "battle_start" });
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
      alive.current = false;
      hush();
    };
  }, []);

  const enter = () => {
    const el = monPos.current;
    if (!el) return;
    const flyer = !!info.float;
    const T = flyer ? 700 : 640;
    el.animate(
      flyer
        ? [
            { transform: "translate(620px, -160px) scale(.6) rotate(12deg)", opacity: 0, easing: "cubic-bezier(.2,.8,.3,1)" },
            { transform: "translate(-34px, 12px) scale(1.05) rotate(-4deg)", opacity: 1, offset: 0.72, easing: "ease-in-out" },
            { transform: "none", opacity: 1 },
          ]
        : [
            { transform: "translateY(-760px) scale(.9, 1.1)", easing: "cubic-bezier(.55,0,.9,.55)" },
            { transform: "translateY(0) scale(1.16, .82)", offset: 0.7, easing: "ease-out" },
            { transform: "translateY(-30px) scale(.96, 1.05)", offset: 0.85, easing: "ease-in" },
            { transform: "none" },
          ],
      { duration: T, delay: 150, fill: "backwards" },
    );
    setTimeout(() => {
      if (!alive.current) return;
      if (flyer) sfx.whoosh();
      else {
        sfx.boom();
        shakeStage();
        fx.puff(monCx, MON_FEET, 16);
      }
      ninja.say();
    }, 150 + T * 0.7);
  };

  const ask = async (w = word) => {
    setLocked(true);
    // (a boss's "...spell your best!" already said it: straight to the word)
    await say(w === words[0] && !trialKey && !boss ? [{ line: "battle_spell" }, { gap: 500 }, { word: w.text }] : [{ gap: 150 }, { word: w.text }]);
    setLocked(false);
  };

  // ---- charge timer (Gem Trials: the monster attacks when full). Waits while the phone is held upright.
  const chargeRef = useRef(0);
  useEffect(() => {
    if (relaxed || locked || dead || upright) return;
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
  }, [relaxed, locked, idx, dead, enraged, upright]);

  const monsterAttack = async () => {
    setLocked(true);
    chargeRef.current = 0;
    setCharge(0);
    sfx.charge();
    // wind up, then lunge across to the ninja
    const n = stageRect(document.querySelector(".ninja-spot"));
    const m = stageRect(monRef.current);
    const dx = n.w && m.w ? n.x + n.w * 0.92 - (m.x + m.w * 0.22) : -560;
    const dy = n.h && m.h ? (n.y + n.h - (m.y + m.h)) * 0.7 : 90;
    const T = 1000;
    monPos.current?.animate(
      [
        { transform: "none", easing: "ease-in-out" },
        { transform: "translate(40px, 4px) scale(1.1, .88)", offset: 0.38, easing: "cubic-bezier(.5,0,.9,.6)" },
        { transform: `translate(${dx}px, ${dy}px) scale(1.12, .94)`, offset: 0.56, easing: "ease-out" },
        { transform: `translate(${dx * 0.92}px, ${dy}px) scale(1)`, offset: 0.66, easing: "cubic-bezier(.3,0,.3,1)" },
        { transform: "none" },
      ],
      { duration: T },
    );
    setTimeout(() => sfx.whoosh(), T * 0.38);
    await sleep(T * 0.56);
    // the only time the ninja gets hurt
    void ninja.act("hurt");
    sfx.hit();
    shakeStage();
    fx.burst(n.x + n.w * 0.7, n.y + n.h * 0.5, "stars", 14);
    const h = hearts - 1;
    setHearts(h);
    await sleep(T * 0.44 + 250);
    if (h <= 0 && trialKey) {
      // trial failed: gentle, and the gem keeps most of its energy
      store.set((s) => void (s.energy[trialKey] = ENERGY_FULL * 0.6));
      await say({ line: "trial_fail" });
      if (alive.current) onDone(0);
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

  // ---- the letter the child tapped flies up into its slot
  const fit = rowFit(tiles);
  const flyToSlot = (from: Element | null | undefined, i: number, g: string) => {
    const to = slotRefs.current[i];
    if (!from || !to) return;
    const a = stageRect(from), b = stageRect(to);
    if (!a.w || !b.w) return;
    const d = addFx("tile bt-fly", a.w, a.h, `<span class="g"></span>`);
    if (!d) return;
    d.style.setProperty("--size", `${fit.px}px`);
    d.querySelector(".g")!.textContent = g;
    const k = b.h / a.h;
    const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 60 };
    gone(
      d.animate(
        [
          { transform: `translate(${a.x}px, ${a.y}px) scale(1)` },
          { transform: `translate(${mid.x}px, ${mid.y}px) scale(${((1 + k) / 2) * 1.12})`, offset: 0.55 },
          { transform: `translate(${b.x + (b.w - a.w * k) / 2}px, ${b.y}px) scale(${k})` },
        ],
        { duration: 250, easing: "ease-in-out", fill: "forwards" },
      ),
      d,
    );
  };

  // ---- sounds land on the monster: it flinches and its health pip wears down
  const chipHit = (forIdx: number, n = 1) => {
    if (idxRef.current !== forIdx || !alive.current || n <= 0) return;
    setChip((c) => c + n);
    squash(monRef.current, streak.tier);
    knock(monHit.current, 16 + streak.tier * 5, 3);
  };
  /** Count the waiting first-try answers into the streak, as one event: however many tiers they cross, only the top one
   *  is celebrated (one power-up, one line). A tier-up returns a promise for when it has played out. */
  const countHits = (): Promise<void> | null => {
    const k = pend.current.hits;
    if (k <= 0) return null;
    hold(0);
    const e = streak.hit({ count: k });
    return e.tierUp ? ninja.linesDone() : null; // the power-up and its line, played out
  };
  // ---- a wrong letter: the monster bounces with glee (it never hurts the ninja for a mistake)
  const gloat = () => {
    monHit.current?.animate(
      [
        { translate: "0 0", scale: "1 1" },
        { translate: "0 -30px", scale: ".94 1.08", offset: 0.22, easing: "ease-in" },
        { translate: "0 0", scale: "1.08 .92", offset: 0.42, easing: "ease-out" },
        { translate: "0 -16px", scale: ".97 1.04", offset: 0.62, easing: "ease-in" },
        { translate: "0 0", scale: "1.04 .96", offset: 0.82 },
        { translate: "0 0", scale: "1 1" },
      ] as Keyframe[],
      { duration: 700 },
    );
  };

  const tap = async (g: string, el?: HTMLElement) => {
    if (locked || !word) return;
    const i = filled.length;
    const need = word.segs[i];
    const P = pend.current;
    const mySeq = ++P.seq;
    const myIdx = idx;
    if (g === need.g) {
      const first = slotMisses.current === 0;
      slotMisses.current = 0;
      recordSpell(need, wordMisses.current === 0);
      const f = [...filled, g];
      setFilled(f);
      // the pure sound, heard clean: a quick child's previous hit still lands, silently, while it plays
      const said = say({ sound: need.p });
      flyToSlot(el ?? rowRef.current?.querySelector(`[aria-label="${CSS.escape(g)}"]`), i, g);
      if (first) hold(P.hits + 1); // a pale flame, lit as its hit goes
      if (f.length === word.segs.length) {
        tFinish.current = performance.now();
        return castSpell(said);
      }
      P.chips++;
      // Every correct sound is a hit on the monster. The move (and its whooshes and thwacks) starts as the pure sound
      // ends, so the sound the child earned is heard clean; the letter flying into its slot is the instant feedback.
      await said;
      if (P.seq !== mySeq || idxRef.current !== myIdx || !alive.current) return; // a later tap carries this hit
      const chips = P.chips;
      P.chips = 0;
      void ninja.strike(aim(), { move: tapMove(streak.tier), react: false }).then(() => chipHit(myIdx, chips));
      // The streak counts as each hit goes, except a hit that would power the ninja up: that one (and the rest of the
      // word's) waits, as a pale flame, for the word's finisher, so a tier-up (its power-up and its line) never breaks
      // into spelling a word the child is holding in their head, and its line is the word's praise.
      if (streak.tier === tierOf(streak.n + P.hits)) countHits();
    } else {
      // a hit still waiting for its sound lands quietly (its sound was cut short); its streak count is dropped
      chipHit(myIdx, P.chips);
      P.chips = 0;
      hold(0);
      misses.current++;
      wordMisses.current++;
      recordSpell(need, false);
      setWrong(g);
      // No buzzer: the ninja's own gentle "hm?" (and, if a streak of 3 or more was lost, its flames fizzling out) is the
      // sound of a miss. The ninja reacts by itself when a streak was going; "Keep going, ninja!" is said here, before
      // the correction, so the model is the last thing the child hears.
      const e = streak.miss({ line: false });
      const lost = streakLine(e);
      if (e.prevN === 0) void ninja.act("think");
      gloat();
      if (!relaxed) chargeRef.current = Math.min(0.95, chargeRef.current + 0.18);
      setLocked(true);
      slotMisses.current++;
      // Sensei's first word comes once the "hm?" and the fizzle are over, so it is clear.
      await say([{ gap: 450 }, ...(lost ? [{ line: lost }, { gap: 250 }] : []), ...correction(g, need, word.text, slotMisses.current)], { reveal: slotMisses.current > 1 });
      if (!alive.current) return;
      setWrong(null);
      setLocked(false);
    }
  };

  /** The word's power. While each sound is said its letter lights (and a ring pulses out of it, so the eye stays on the
   *  letter). Then, as the whole word is said, every sound flies from its slot into the ninja's hands, where a
   *  glowing orb grows; the finisher carries it into the monster. */
  const chargeUp = () => {
    const hand = ninjaHands();
    const t = streak.tier;
    const S = 76;
    const cols = t >= 3 ? ["#ff5a5a", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"] : t === 2 ? ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"] : ["#ffe38a", "#ffc53d", "#fff4dc"];
    const at = (s: number) => `translate(${hand.x - S / 2}px, ${hand.y - S / 2}px) scale(${s})`;
    let orb: HTMLDivElement | null = null;
    let size = 0, got = 0;
    return {
      cols,
      ping(el: Element | null | undefined) {
        if (!el) return;
        const p = centre(el);
        fx.ring(p.x, p.y, { color: "#ffe38a", r0: 44, r1: 96, width: 7, life: 16 });
      },
      gather(els: (Element | null | undefined)[]) {
        if (orb) return;
        ninja.pose("cast");
        orb = addFx(`fx-orb t${t} bt-orb`, S, S, "<i></i><b></b>");
        if (orb) orb.style.transform = at(0);
        const n = els.length;
        els.forEach((el, k) => {
          if (!el) return;
          // from below the letter (under its sound dot), so neither the dot nor its ring covers a letter as the word is said
          const r = stageRect(el);
          const p = { x: r.x + r.w / 2, y: r.y + r.h + 26 };
          setTimeout(() => {
            fx.ring(p.x, p.y, { color: cols[0], r0: 14, r1: 46, width: 7, life: 16 });
            void dot(p, hand, 400, cols).then(() => {
              got++;
              const to = 0.36 + (0.54 * got) / n;
              orb?.animate([{ transform: at(size) }, { transform: at(to * 1.3), offset: 0.45 }, { transform: at(to) }], { duration: 240, easing: "ease-out", fill: "forwards" });
              size = to;
              fx.ring(hand.x, hand.y, { color: "#fff4dc", r0: 24, r1: 90, width: 7, life: 14 });
              fx.twinkle(hand.x, hand.y, cols, 5, 4, 20);
            });
          }, k * 70);
        });
      },
      /** The orb goes into the move: a spell grows out of it; a kick or punch takes it into the foot or fist (it flashes
       *  as the blow is thrown); a spin or flip whirls it round the ninja along the ribbon; a power-up absorbs it. */
      release(move: Move) {
        ninja.pose(null);
        const o = orb;
        orb = null;
        if (!o) return;
        o.getAnimations().forEach((a) => a.cancel());
        const s0 = size || 0.4;
        const flashAt = (p: Pt) => {
          fx.ring(p.x, p.y, { color: cols[0], r0: 8, r1: 100, width: 10, life: 16 });
          fx.glow(p.x, p.y, cols, 12, 50, 4, 20);
        };
        const tier = streak.tier;
        const w = stageRect(document.querySelector(".ninja-spot")).w || 250;
        let path: (x: number) => Pt;
        let ms: number;
        let end: Pt;
        const straight = (to: Pt) => (x: number) => lerp(hand, to, x * x);
        // the striking fist or foot, read from the sprite as it moves (fw, fh: where it is on the pose's picture)
        const sprite = document.querySelector(".ninja-spot .nj-img");
        const limb = (to: Pt, fw: number, fh: number) => (x: number) => {
          const r = stageRect(sprite);
          return lerp(hand, r.w && x > 0.5 ? { x: r.x + r.w * fw, y: r.y + r.h * fh } : to, x * x);
        };
        switch (move) {
          case "cast": {
            // the ninja's own spell charges in the same hands: this one melts into it
            const hold = onNinja(0.86, 0.74, -12, -10);
            void glide(o, S, (x) => lerp(hand, hold, x), 260, (x) => s0 * (1 + 0.4 * x), undefined, true).then(() => o.remove());
            return;
          }
          case "power":
            end = onNinja(0.5, 0.66, 0, 6);
            ms = 190;
            path = straight(end);
            break;
          case "kick":
            end = tier >= 2 ? onNinja(1, 0.5, 124, -112) : onNinja(1, 0.5, 118, -46);
            ms = tier >= 2 ? 250 : 165;
            path = limb(end, 0.93, 0.52);
            break;
          case "punch":
            end = onNinja(0.9, 0.8, 74, -4);
            ms = 150;
            path = limb(end, 0.95, 0.47);
            break;
          case "jump":
            end = onNinja(0.9, 0.8, 60, -158);
            ms = 400;
            path = straight(end);
            break;
          case "spin": {
            const c = onNinja(0.5, 0.66, 24, -30), r = w * 0.66, sq = 0.62;
            end = onNinja(0.95, 0.66, 42, -62);
            ms = 420;
            path = (x) => (x < 0.26 ? lerp(hand, onRibbon(c, r, sq, 160), x / 0.26) : x < 0.86 ? onRibbon(c, r, sq, 160 + (340 * (x - 0.26)) / 0.6) : lerp(onRibbon(c, r, sq, 500), end, (x - 0.86) / 0.14));
            break;
          }
          case "flip": {
            const c = onNinja(0.5, 0.66, 30, -100), r = w * 0.7, sq = 0.1;
            end = onNinja(0.9, 0.9, 30, -104);
            ms = 520;
            path = (x) => (x < 0.23 ? lerp(hand, onRibbon(c, r, sq, 60), x / 0.23) : x < 0.84 ? onRibbon(c, r, sq, 60 - (320 * (x - 0.23)) / 0.61) : lerp(onRibbon(c, r, sq, -260), end, (x - 0.84) / 0.16));
            break;
          }
          default:
            end = onNinja(0.9, 0.8, 46, -6);
            ms = 150;
            path = straight(end);
        }
        const trail = move === "spin" || move === "flip" ? cols : undefined;
        void glide(o, S, path, ms, (x) => s0 * (1 - 0.5 * x), trail).then(() => {
          o.remove();
          if (alive.current) flashAt(path(1));
        });
      },
    };
  };
  type Charge = ReturnType<typeof chargeUp>;

  /** The finisher (or a boss combo). `first` resolves when the first blow lands, `last` when the last one does:
   *  a combo's later blows land while Sensei (or the Baron) is already talking, so combos never slow the level. */
  const finisher = (final: boolean, power: Charge): { first: Promise<void>; last: Promise<void> } => {
    // the word's first-try answers count now: a tier-up's power-up waits for this move to land
    const flush = () => void (tierWait.current = countHits() ?? tierWait.current);
    if (final && boss) {
      // the boss's last word: power up (absorbing the word's orb), and at its peak a somersault volley of stars
      const last = (async () => {
        power.release("power");
        void ninja.act("power");
        await sleep(650);
        const p = ninja.act("flip", aim(), { react: false });
        flush();
        await p;
      })();
      return { first: last, last };
    }
    const t = streak.tier;
    const plan = boss && t >= 2 ? pickNot(t >= 3 ? COMBO3 : COMBO, lastFinish) : [pickNot(FINISH[t], lastFinish)];
    power.release(plan[0]);
    let firstLanded = () => {};
    const first = new Promise<void>((r) => (firstLanded = r));
    const last = (async () => {
      for (let k = 0; k < plan.length; k++) {
        const p = ninja.act(plan[k], aim(), { react: false });
        if (k === plan.length - 1) flush();
        await p;
        if (k < plan.length - 1) {
          squash(monRef.current, streak.tier);
          knock(monHit.current, 26, 5);
          sfx.hit();
          firstLanded();
        }
      }
    })();
    return plan.length > 1 ? { first, last } : { first: last, last };
  };

  /** The word's big hit: the word's power bursts on the monster in its colours, its health pip shatters, it reels. */
  const bigHit = (final: boolean, nhp: number, cols: string[]) => {
    const c = centre(monRef.current);
    const a = aim();
    sfx.hit();
    shakeStage();
    fx.ring(a.x, a.y, { color: cols[0], r0: 30, r1: 260, width: 16, life: 24 });
    fx.glow(a.x, a.y, cols, 16, 66, 5, 30);
    fx.burst(c.x, c.y, "stars", final ? 30 : 20, final ? 1.5 : 1.2);
    fx.burst(c.x, c.y, "petals", 10);
    if (final) fx.ring(c.x, c.y, { color: "#fff4dc", r0: 40, r1: 420, width: 18, life: 30 });
    shatter(pipRefs.current[nhp]);
    squash(monRef.current, streak.tier, true);
    knock(monHit.current, 48, 9);
    setHp(nhp);
    setChip(0);
    chargeRef.current = Math.max(0, chargeRef.current - 0.35);
    setCharge(chargeRef.current);
    if (!final) setDizzy((d) => d + 1);
  };

  const castSpell = async (said: Promise<unknown>) => {
    setLocked(true);
    recordWordSpelt(word, wordMisses.current === 0);
    const P = pend.current;
    chipHit(idx, P.chips); // earlier hits whose sounds this tap cut short land quietly
    P.chips = 0;
    // the last pure sound is heard in full before the blend starts, and so is the blend's first sound: a quick child's
    // previous hit, still flying, lands first
    await Promise.all([said, sleep(350)]);
    for (let t = 0; ninja.busy && t < 700; t += 50) await sleep(50);
    if (!alive.current) return;
    const power = chargeUp();
    const slotEl = (k: number) => slotRefs.current[k]?.firstElementChild ?? slotRefs.current[k];
    await sayBlend(word.segs, word.text, (i) => {
      setLit(i);
      if (i >= 0) power.ping(slotEl(i));
      else power.gather(word.segs.map((_, k) => slotEl(k)));
    });
    setLit(-1);
    if (!alive.current) return;
    const nhp = hp - 1;
    const final = nhp <= 0;
    const hits = finisher(final, power);
    const landed = hits.last.then(() => void (alive.current && bigHit(final, nhp, power.cols)));
    if (final) {
      await landed;
      if (alive.current) await win();
      return;
    }
    await hits.first;
    if (!alive.current) return;
    await sleep(260);
    // A tier-up on this word: its own line ("Ninja power!") is the praise, heard in full before anything else.
    const powerUp = tierWait.current;
    tierWait.current = null;
    if (powerUp) await powerUp;
    if (!alive.current) return;
    // Boss drama. Sensei's praise overlaps a combo's last blows; Baron Muddle's cut-in darkens the screen, so a combo
    // finishes and its stars clear first (unless he is the boss on screen, when there is no cut-in). A word never gets
    // two big moments: a power-up's line is its praise, and his half-way roar and his (rare) taunts wait for a word
    // without one; taunts are never two words running, never right after he roars, and skipped on a long word.
    const busySince = (performance.now() - tFinish.current) * FAST;
    const grr = !powerUp && boss && !enraged && nhp <= hpMax / 2;
    const taunt = !grr && !powerUp && boss && !lastDrama.current && busySince < 5000 && Math.random() < TAUNT_CHANCE;
    lastDrama.current = grr ? "grr" : taunt ? "taunt" : "";
    if (grr || taunt) {
      // the combo lands (and, before a cut-in, its stars clear) before Baron Muddle speaks
      await landed;
      await sleep(baronHere ? 200 : 650);
      if (!alive.current) return;
    }
    if (grr) {
      setEnraged(true);
      roar();
      await say([{ line: "baron_grr" }]);
    } else if (taunt) {
      await say({ line: pick(BARON_TAUNTS) });
    } else if (!powerUp) {
      await say({ line: pickPraise() });
    }
    await landed;
    if (!alive.current) return;
    wordMisses.current = 0;
    setFilled([]);
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    await ask(words[nextIdx]);
  };

  /** Half-way through a boss: it puffs up and roars. */
  const roar = () => {
    monHit.current?.animate(
      [{ scale: "1" }, { scale: "1.14 1.1", offset: 0.25 }, { scale: ".96 1.02", offset: 0.45 }, { scale: "1.08", offset: 0.65 }, { scale: "1" }] as Keyframe[],
      { duration: 800, easing: "ease-in-out" },
    );
    shakeStage();
    if (baronHere) sfx.thunder();
  };

  /** Knocked out: the monster spins away into the sky and vanishes with a twinkle. */
  const blastOff = async () => {
    const el = monPos.current;
    const end = baronHere ? SKY : { x: 990, y: 120 }; // up into the sky
    const dx = end.x - monCx;
    const dy = end.y - (MON_FEET - monH / 2);
    setKo(true);
    sfx.whoosh();
    el?.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translate(70px, -30px) rotate(40deg) scale(1.05)", opacity: 1, offset: 0.14 },
        { transform: `translate(${dx}px, ${dy}px) rotate(640deg) scale(.1)`, opacity: 1, offset: 0.86 },
        { transform: `translate(${dx}px, ${dy}px) rotate(720deg) scale(.04)`, opacity: 0 },
      ],
      { duration: 1000, easing: "cubic-bezier(.3,.1,.5,1)", fill: "forwards" },
    );
    setTimeout(() => alive.current && ding(end), 860);
    await sleep(480);
  };

  /** Gem Trial won: the gem lights up in its colours and flies over the ninja's head as they land from the backflip,
   *  then is caught in a burst of sparkles. */
  const [gemLit, setGemLit] = useState(false);
  const gemToNinja = () => {
    const el = gemRef.current;
    if (!el) return;
    setGemLit(true);
    sfx.petal();
    const r = stageRect(document.querySelector(".ninja-spot"));
    const a = centre(el);
    const b = r.w ? { x: r.x + r.w * 0.54, y: r.y + r.h - r.w * 1.8 } : { x: 175, y: 252 }; // above the streak flames
    const d = { x: b.x - a.x, y: b.y - a.y };
    setTimeout(() => {
      if (!alive.current) return;
      sfx.twinkle();
      fx.ring(b.x, b.y, { color: "#fff4dc", r0: 30, r1: 150, width: 10, life: 22 });
      fx.glow(b.x, b.y, ["#fff4dc", "#ffe38a"], 10, 50, 3, 26);
    }, 400 + 1900 * 0.58);
    el.animate(
      [
        { translate: "0 0", scale: "1", opacity: 1 },
        { translate: `${d.x * 0.5}px ${d.y * 0.5 - 150}px`, scale: "1.35", opacity: 1, offset: 0.34 },
        { translate: `${d.x}px ${d.y}px`, scale: "1.1", opacity: 1, offset: 0.58 },
        { translate: `${d.x}px ${d.y - 14}px`, scale: "1.3", opacity: 1, offset: 0.72 },
        { translate: `${d.x}px ${d.y}px`, scale: "1.15", opacity: 1, offset: 0.86 },
        { translate: `${d.x}px ${d.y + 40}px`, scale: "0", opacity: 0 },
      ] as Keyframe[],
      { duration: 1900, delay: 400, easing: "ease-in-out", fill: "both" },
    ).finished.then(
      () => {
        if (!alive.current) return;
        setGemFlown(true);
        sfx.twinkle();
        fx.ring(b.x, b.y, { color: "#fff4dc", r0: 20, r1: 200, width: 14, life: 26 });
        fx.twinkle(b.x, b.y, ["#fff4dc", "#ffe38a", "#ff7aa2", "#5ec8f2"], 18, 9, 30);
        fx.glow(b.x, b.y, ["#fff4dc", "#ffe38a"], 14, 60, 4, 30);
      },
      () => {},
    );
  };

  /** Baron Muddle, blasted off, pops back up small in the sky shaking his fist while he promises to come back. Just as
   *  he finishes, the ninja leaps and flicks a star at him: bonk, ding, gone. */
  const baronFlees = async () => {
    setSky(1);
    sfx.pop();
    const said = say({ line: "baron_lose" });
    const buf = await load(urls.line("baron_lose"));
    await Promise.race([said, sleep(Math.max(0, (buf ? buf.duration * 1000 : 3800) - 600))]);
    if (!alive.current) return;
    const bonk = ninja.act("jump", skyRef.current ?? SKY, { react: false }).then(() => {
      if (!alive.current) return;
      setSky(2);
      ding(SKY);
    });
    await said;
    await bonk;
    await sleep(200);
    if (alive.current) void ninja.act("cheer");
  };

  const win = async () => {
    setLocked(true);
    const powerUp = tierWait.current;
    tierWait.current = null;
    await blastOff();
    if (!alive.current) return;
    setDead(true);
    sfx.great();
    fx.rain("petals", 50);
    // a tier-up on the winning word plays out (its power-up and its line) before the celebration
    if (powerUp) await powerUp;
    if (!alive.current) return;
    const party = ninja.celebrate();
    if (trialKey) {
      gemToNinja();
      store.set((s) => {
        if (!s.gems.includes(trialKey)) s.gems.push(trialKey);
      });
      // (the World Flower says "You won the gem!" as it arrives, so the gem's flight and the celebration carry it here)
      await party;
      await sleep(400);
      if (alive.current) onDone(3);
      return;
    }
    if (boss) {
      // let the backflip land before Baron Muddle storms in (his cut-in darkens the screen)
      await sleep(baronHere ? 500 : 900);
      if (!alive.current) return;
      if (baronHere) await baronFlees();
      else {
        await say({ line: "baron_lose" });
        void ninja.act("cheer");
      }
      if (!alive.current) return;
    }
    // (a boss's "You beat the boss!" is the reward screen's first line, so it is not said twice)
    await Promise.all([boss ? sleep(300) : say({ line: "battle_win" }), party]);
    const m = misses.current + knockouts.current * 3;
    if (alive.current) onDone(m <= 1 ? 3 : m <= 5 ? 2 : 1);
  };

  useKeyTiles(tiles, (g) => tap(g), () => word && !locked && ask());
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
  (window as any).__snState = { scene: "battle", locked, next: word?.segs[filled.length]?.g, word: word?.text, streak: streak.n, pending: pendN, hp };

  const slotPx = !word || word.segs.length <= 4 ? 104 : word.segs.length === 5 ? 92 : 80;
  const curPip = hp - 1;
  const pipFill = word ? 100 - (70 * Math.min(chip, word.segs.length)) / word.segs.length : 100;
  const gem = trialKey ? gemByKey(trialKey) : undefined;
  return (
    <div className={`scene bt ${baronHere ? "bt-baron" : ""} ${sky === 1 ? "bt-skyon" : ""}`}>
      <img className="bg-img" src={img(`bg_${world.key}`)} alt="" />
      <div className="vignette" />
      {enraged && <div className="bt-rage" style={{ "--mx": `${monCx}px` } as CSSProperties} />}

      {/* the monster: position (entrance, lunge, blast-off) > knockback > facing > sprite (breathing) */}
      <div className="shadow-blob bt-mon-shadow" style={{ left: monCx - monW * 0.38, top: MON_FEET - 12, width: monW * 0.76, opacity: dead ? 0 : 1 }} />
      <div ref={monPos} className="bt-mon" style={{ left: monCx - monW / 2, bottom: 720 - MON_FEET, width: monW }}>
        <div ref={monHit} className="bt-mon-hit">
          <div className={`bt-mon-face ${info.facing === "right" ? "flipped" : ""} ${enraged ? "angry" : tier >= 2 ? "scared" : ""}`}>
            <img ref={monRef} className={`bt-mon-img ${info.float ? "float" : "breathe"}`} src={img(`mon_${level.monster}`)} alt="" style={{ height: monH, maxWidth: monW }} />
          </div>
          {enraged && (
            <svg className="bt-vein" viewBox="0 0 100 100" aria-hidden="true">
              <g fill="none" strokeLinecap="round">
                {[0, 1].map((k) => (
                  <g key={k} stroke={k ? "#ff4a36" : "#2b1d14"} strokeWidth={k ? 11 : 21}>
                    <path d="M38 8 Q40 36 10 38" />
                    <path d="M62 8 Q60 36 90 38" />
                    <path d="M38 92 Q40 64 10 62" />
                    <path d="M62 92 Q60 64 90 62" />
                  </g>
                ))}
              </g>
            </svg>
          )}
          {dizzy > 0 && (
            <div key={dizzy} className="bt-dizzy">
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
      </div>

      {/* Baron Muddle, blasted off, shaking his fist in the sky (his caption bubble points up at him) */}
      {sky > 0 && (
        <div ref={skyRef} className={`bt-sky ${sky === 2 ? "bonk" : ""}`} style={{ left: SKY.x - 92, top: SKY.y - 92 }}>
          <div className="bt-sky-cloud" />
          <div className="bt-sky-fist">
            <img src={img(`mon_${level.monster}`)} alt="" />
          </div>
          <svg className="bt-vein" viewBox="0 0 100 100" aria-hidden="true">
            <g fill="none" strokeLinecap="round">
              {[0, 1].map((k) => (
                <g key={k} stroke={k ? "#ff4a36" : "#2b1d14"} strokeWidth={k ? 11 : 21}>
                  <path d="M38 8 Q40 36 10 38" />
                  <path d="M62 8 Q60 36 90 38" />
                  <path d="M38 92 Q40 64 10 62" />
                  <path d="M62 92 Q60 64 90 62" />
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* the monster's health: one pip per word; each sound wears the current pip down, the finisher shatters it.
          It stays right of the "hear the word" button (x 768-860) however many pips there are. */}
      <div className={`bt-hp ${ko ? "out" : ""} ${hpMax > 9 ? "lots" : hpMax > 6 ? "many" : ""}`}>
        <div className="bt-hp-face">
          <img src={img(`mon_${level.monster}`)} alt="" style={info.facing === "right" ? { scale: "-1 1" } : undefined} />
        </div>
        <div className="bt-hp-col">
          <div className="bt-pips">
            {Array.from({ length: hpMax }, (_, i) => (
              <div key={i} ref={(el) => void (pipRefs.current[i] = el)} className={`bt-pip ${i < hp ? "" : "gone"} ${i === curPip && !locked ? "cur" : ""}`}>
                <i style={i === curPip ? { width: `${pipFill}%` } : undefined} />
              </div>
            ))}
          </div>
          {!relaxed && (
            <div className={`bt-meter ${explain ? "explain" : ""} ${charge > 0.75 ? "hot" : ""}`}>
              <b style={{ width: `${charge * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* the prize gem in a Gem Trial, guarded by the monster */}
      {gem && !gemFlown && (
        <div ref={gemRef} className={`bt-gem ${gemLit ? "won" : ""}`} style={{ left: monCx - 55, top: MON_FEET - monH - 124 }}>
          <div className="float">
            <GemIcon g={gem.g} colour={PHONEMES[gem.p].colour} state={gemLit ? "won" : "ready"} size={110} />
          </div>
        </div>
      )}

      {/* topbar */}
      <div className="topbar">
        <RoundButton sm label="map" onClick={onQuit}>
          <Icon.home />
        </RoundButton>
        {timed && <Hearts n={hearts} max={MAX_HEARTS} />}
        <div className="spacer" />
      </div>

      {/* the word: picture card, sound slots, and the letter row between the ninja and Sensei */}
      {word && !dead && (
        <>
          <WordCard key={`c${idx}`} word={word} className="pop-in" onHear={() => !locked && ask()} style={{ left: TOP_CX - 115, top: 24, width: 230, height: 180 }} />
          {word.pic && (
            <div style={{ position: "absolute", left: TOP_CX + 132, top: 68 }}>
              <RoundButton sm label="Hear the word" onClick={() => !locked && ask()}>
                <Icon.speaker />
              </RoundButton>
            </div>
          )}
          <div className="slots bt-slots" style={{ left: TOP_CX - 330, width: 660, "--slot": `${slotPx}px` } as CSSProperties}>
            {word.segs.map((_, i) => (
              <div key={`${idx}-${i}`} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${i < filled.length ? "filled" : i === filled.length && !locked ? "active" : ""} ${lit === i ? "bt-say" : ""}`}>
                {i < filled.length && <Tile g={filled[i]} className="bt-land" withButtons={filled.length === word.segs.length} lit={lit === i} />}
              </div>
            ))}
          </div>
          <div ref={rowRef} className="row bt-row" style={{ left: ROW_L, width: ROW_R - ROW_L, gap: fit.gap }}>
            {tiles.map((g) => (
              <Tile
                key={`${idx}-${g}`}
                g={g}
                size={fit.px <= 80 ? "sm" : undefined}
                style={fit.px < 104 ? ({ "--size": `${fit.px}px` } as CSSProperties) : undefined}
                state={wrong === g ? "wrong" : (slotMisses.current >= 2 || helpLvl >= 3) && g === word.segs[filled.length]?.g ? "hint" : ""}
                onTap={(el) => tap(g, el)}
              />
            ))}
          </div>
        </>
      )}

      {/* the streak flames, plus pale ones for the word's first-try answers held until its finisher */}
      <NinjaSpot pose="ready" pending={pendN} />
      <SenseiDock />
    </div>
  );
}
