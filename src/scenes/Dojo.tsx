// Dojo: a lesson of new sounds (New Sounds), then Ninja Eyes with them, then Word Building (docs/TEACHER_SCRIPT.md
// §3.26, §4.6; FIX_PLAN §9 D1 and §13 TV-D1). Slow, calm, no timers.
//
// The teacher's voice (TEACHER_SCRIPT §0.1): the lesson says what it is and who does what before anything happens,
// and asks whether the child is ready (the Ready hold). The lesson's new sounds wait above the middle as misty petals
// ("?"), nothing pulsing. Each one floats down, and blooms on its sound (SOUND_DISPLAY §4.6): "Here it comes… /b/ …
// /b/". The child taps the petal and says it; the ninja writes the spelling beside the petal; the child taps the
// letters and says it twice (two mini petals light under them, Dec6). The lead-ins shorten as a series ("Here's the
// next new sound…", "Here's the last new sound…"), and so do the instructions: the first sound says each one in full,
// the next ones their short forms ("Tap its petal, and say it." · "And this is how we write…" · "Now you tap it, and say
// it."), never going back to the first sound's long forms, and "Now watch my ninja write it." only for the first two
// (the verify round: the lesson sounded as if it restarted at the third sound). The series is a Sounds~Write routine
// (SCRIPT_STYLE §5.1), exempt from the 60 s rule: every new sound is taught with words. A recap or short form fades the join-ins from the third sound.
// The lesson counts sounds, not spellings (Dec8, Sounds~Write's "same sound, different spellings"): the row has one petal
// per sound, with all its new spellings under it at the close; a second spelling of a sound the lesson has just brought
// in is "And here's another way to spell it…", never a new sound or "one you know". New sounds come first, then new
// ways to write sounds the child knew before ("Here's the sound…", "Our next sound is one you know…"). No bare
// "Listen…" and no ear anywhere (Jonas, 27 Sep).
// Then Ninja Eyes ("Now let's play Ninja Eyes, with your new sounds.") and Word Building ("Your word is…"), with the
// Sounds~Write read-back and fast and slow (TEACHER_SCRIPT §9: the rabbit read-back on the session's first built word).
// A Word Building met for the first time here (a school path), or on a later day, gets its narrated demo on the first
// word: "This card is my word…", "I say it slowly…", "The first sound is…", "Can you find the last one?".
//
// A sound is shown as its petal (SoundBadge), never as letters, whenever it is presented; a tile's own voice and the
// read-back's sounds are the letters' ("tile"); "Which sound?" while spelling names nothing (FIX_PLAN §3.1, SD §1).
//
// The player's ninja (docs/HERO.md) stands bottom-left for the whole level and answers every right answer with a move:
// a spell writes each new spelling, a strike lands on the spelling the child found, and every letter tile of a word
// hops up out of the bank, gets kicked, punched, starred or spelled, and flies into its slot. First-try answers build
// the streak (Dec2: a word's letters count as parts; the word, once built with no miss, as the answer).
// Order matters: start the move, THEN count the hit, so a tier-up's power-up waits for the move instead of being
// cancelled by it. A wrong answer says "Keep going, ninja." FIRST (streak.miss({ line: false })), before Sensei's
// correction, so the last thing a child hears before trying again is the target.
// Layout (stage 1280×720): the play area is centred on x 722, between the ninja zone (x 0-330) and Sensei's Help
// corner (x 1116+); rows of tiles stay inside x 340-1100.
// A tap while Sensei explains or corrects nods the tile or petal with a tink and never cuts her off (SD §4.3).
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { LevelProps } from "../App";
import { GRAPHEMES, teachEntry, type Word, type Seg, type PhonemeId } from "../content/phonics";
import { knownSpellings, type Level } from "../content/worlds";
import { say, sfx, playMusic, preload, urls, isSpeaking, nextClip, onClip, onSpeaking, type Say } from "../engine/audio";
import { speak } from "../engine/speech";
import { FAST } from "../engine/fast";
import { chooseWords, tileBank, shuffle } from "../engine/learner";
import { recordFoundation, recordSpell, recordWordSpelt, store } from "../engine/store";
import { pickPraise, pictureCorrection, praiseBy, praiseFor } from "../engine/feedback";
import { PIC_NAMES } from "../content/pic-names";
import { streak, tierOf, streakLine, tierLineEarned, type Tier } from "../engine/streak";
import { NinjaSpot, ninja, type Move } from "../ui/Ninja";
import { Tile, img, Progress, fx, fxDom, stageRect, sleep, TapHint, useHelp, WordCard, SenseiDock, tapProps, Icon } from "../ui/ui";
import { SLOW_TIMES } from "../content/stretch";
import { NUMBER_WORDS, STEMS, adjacentSlots, adjacentUnit, clusterFirst, fadeForm, lettersKey, otherSound, sortWaysLine, splitsSpelling, stemFor, twoSoundsKey, type FrameForm } from "../content/narrative";
import {
  NarrOverlay, SlotPointer, afterWordSay, beginLevel, correctionFor, framed, fsIdea, fsPair, fsPraise, fsReadback, fsSaid, fsStuckSay, gameForm, heard, isDue, lettersFor,
  lettersReminder, onceInSave, played, readThisWay, readyAsk, revealsNow, sameSpellingSay, struggledIn, sweepUnder, twoSoundsReminder,
} from "./narrate";
import { fillLine, levelWrap } from "../content/games";
import { hearIn } from "../content/teach";
import { LINES } from "../content/lines";
import { wordAt } from "../content/word-times";
import { TEACH_WORD_TIMES } from "../content/teach-word-times.gen";
import { useLessonClock } from "../engine/lessonClock";
import { useNav, useHeld, ReplayButton, TopBar, navAgain, holdReady, navLog, navSpeed, rabbitTap } from "../ui/nav";
import { SoundBadge, SoundRow, badgeHeight, soundWidth, PAIRS } from "../ui/SoundBadge";
import "../styles/dojo.css";
import "../styles/nav-D.css";

const HAS = new Set(LINES.map((l) => l.id));
/** A line, if it is recorded (every caller guards: the wording can ship before its audio). */
const L = (id: string | null | undefined): Say[] => (id && HAS.has(id) ? [{ line: id }] : []);
/** Lines in a row, a gap between them (the unrecorded ones left out). */
const lines = (ids: (string | null | undefined)[], gap = 350): Say[] => ids.flatMap((id) => L(id)).flatMap((it, k) => (k ? [{ gap } as Say, it] : [it]));

/** When each line started in the last minute of game time (performance.now() ms, from onClip, whoever said it). A
 *  sentence is said at most twice in 60 s (SCRIPT_STYLE §5): the Learn's join-ins take turns between their recorded
 *  forms, and Word Building's hand-over steps back to the word alone, rather than say one sentence a third time. */
const lineStarts = new Map<string, number[]>();
const minute = () => 60_000 / FAST;
onClip((id) => {
  if (id.includes(":")) return; // (words, stretched words and sounds)
  const now = performance.now();
  lineStarts.set(id, [...(lineStarts.get(id) ?? []).filter((t) => now - t < minute()), now]);
});
/** A recorded line said fewer than twice in the last minute (so once more is allowed). */
const roomFor = (id: string): boolean => HAS.has(id) && (lineStarts.get(id) ?? []).filter((t) => performance.now() - t < minute()).length < 2;
/** Said at all in the last minute (a letters sentence is never said twice in 60 s: SCRIPT_FIXES A2). */
const saidLately = (id: string): boolean => (lineStarts.get(id) ?? []).some((t) => performance.now() - t < minute());

/** `done.last`: the word that stays up for the finish (a cut lesson can end before the last word) */
type Phase = { k: "intro" } | { k: "learn"; i: number } | { k: "all" } | { k: "find"; i: number } | { k: "build"; i: number } | { k: "done"; last: number };

/** Centre of the play area (between the ninja and the Help corner), in stage px. */
const MID = 722;
/** Once-per-save moments (narrate.tsx onceInSave / heard). */
const PETAL_HINT = "dojo:petal-hint";
const ONCE_MORE = "dojo:once-more";
const DJ_ROOM = "dojo:room";

/**
 * What one spelling of the lesson is to the child: the first spelling of a sound they meet now (`new`); a new spelling
 * of a sound they knew before this level (`known`: "This is another way to spell the sound…"); < x >, one spelling of
 * two sounds they know (`pair`); or another spelling of a sound this lesson has just brought in (`same`: w6-1's < ay >
 * after < ai >, "And here's another way to spell it…").
 */
type ItemKind = "new" | "known" | "pair" | "same";
/** One spelling of the lesson (a teach entry) and what the child knows about its sound. */
interface LessonItem {
  g: string;
  p: PhonemeId;
  kind: ItemKind;
  /** a sound the child meets now: the introduction animation (the misty petal blooms), "You can hear it in…" */
  isNew: boolean;
  /** the spelling was taught a moment ago with its other sound (< th > as /dh/ after /th/): that sound */
  second?: PhonemeId | null;
  /** its sound's place in the row (LessonGroup) */
  slot: number;
  /** how the sound is brought in (below) */
  lead: Lead;
  /** a known sound's place among the lesson's known sounds (the first two may say "Ooh, you already know this sound!"),
   *  and whether its lead-in's turn is "Here's the sound…" (else "Our next sound is one you know…") */
  knownN: number;
  knownHere: boolean;
  /** how many spellings of this sound the lesson teaches ("This sound can be spelt in two ways.") */
  ways: number;
}
/** One sound of the lesson: its petal in the row, and its spellings (items). */
interface LessonGroup {
  p: PhonemeId;
  isNew: boolean;
  items: number[];
}
/**
 * The lesson's shape, which its frame and its close say (Dec8: sounds, not spellings):
 * - `sounds`: two or more new sounds ("Today there are four new sounds." · "Four new sounds! You said every one.");
 *   a known sound among them is greeted as known when it comes.
 * - `one-ways`: one new sound and more than one way to write it (w6-1's /ae/, < ai > and < ay >).
 * - `mixed`: one new sound, and new ways to write sounds the child knows (w5-3: < ng >, with < ck > and < wh >).
 * - `ways`: new ways to write one sound the child knows (TEACHER_SCRIPT §4.6's `tv_learn_frame_ways`).
 * - `ways-many`: new ways to write several sounds the child knows (w5-6: < q >, < u >, < ve >, < tch >).
 * - `one`: a single new sound.
 */
type LessonKind = "sounds" | "one-ways" | "mixed" | "ways" | "ways-many" | "one";
interface Lesson {
  items: LessonItem[];
  groups: LessonGroup[];
  kind: LessonKind;
  /** the new sounds (not spellings) */
  count: number;
}
/**
 * The lesson: the level's teach entries grouped by sound, with what the child knows about each. The new sounds come
 * first (the frame's order: "a new sound, and new ways to write sounds you know"), then the sounds the child knew
 * before this level; a sound's spellings stay together. The new sounds keep the series ("Here's the first new
 * sound…", next, another, last: SF C2), or, when the lesson has only one, "Here it comes…" (TEACHER_SCRIPT keeps it for
 * the first sound, which that one always is). A known sound is never called new (the verify round's "Here's the first
 * new sound… /k/ · Ooh, you already know this sound!"), and a second spelling of a sound brought in a moment ago is
 * neither new nor "one you know" (the verify round's "Our next sound is one you know… /ae/", 20 s after /ae/).
 */
function lessonOf(level: Level, teach: Seg[], short: boolean): Lesson {
  const known = [...knownSpellings(level)];
  const before = known.filter((k) => !teach.some((t) => t.g === k));
  const soundBefore = (p: PhonemeId) => (PAIRS[p] ?? [p]).every((q) => before.some((k) => GRAPHEMES[k] === q));
  const byP = new Map<PhonemeId, Seg[]>();
  for (const t of teach) byP.set(t.p, [...(byP.get(t.p) ?? []), t]);
  const sounds = [...byP].map(([p, segs]) => ({ p, segs, isNew: !soundBefore(p) }));
  const ordered = [...sounds.filter((s) => s.isNew), ...sounds.filter((s) => !s.isNew)];
  const newN = sounds.filter((s) => s.isNew).length;
  const items: LessonItem[] = [];
  const groups: LessonGroup[] = [];
  let j = 0, kn = 0, turn = 0;
  for (const [slot, s] of ordered.entries()) {
    const idx: number[] = [];
    for (const [m, t] of s.segs.entries()) {
      const o = otherSound(t);
      const second = o && items.some((x) => x.g === t.g && x.p === o) ? o : null;
      const kind: ItemKind = m > 0 ? "same" : s.isNew ? "new" : PAIRS[t.p] ? "pair" : "known";
      let lead: Lead = "same";
      let knownN = -1, knownHere = false;
      if (kind === "new") {
        const jj = j++;
        lead = newN === 1 ? "lone" : jj === 0 ? (short ? "first-short" : "first") : newN >= 3 && jj === newN - 1 ? "last" : jj % 2 ? "next" : "another";
      } else if (kind === "known" || kind === "pair") {
        lead = "known";
        knownN = kn++;
        // (a lesson that opens on a known sound opens with "Here's the sound…"; after that the two take turns)
        knownHere = items.length === 0 || turn++ % 2 === 1;
      }
      idx.push(items.length);
      items.push({ g: t.g, p: t.p, kind, isNew: kind === "new", second, slot, lead, knownN, knownHere, ways: s.segs.length });
    }
    groups.push({ p: s.p, isNew: s.isNew, items: idx });
  }
  const knownSounds = groups.filter((g) => !g.isNew).length;
  const kind: LessonKind =
    newN >= 2 ? "sounds" : newN === 1 ? (knownSounds ? "mixed" : items.length > 1 ? "one-ways" : "one") : knownSounds === 1 ? "ways" : "ways-many";
  return { items, groups, kind, count: newN };
}
/**
 * The lesson's frame line for its form (TEACHER_SCRIPT §3.26 A, §4.6), or null when no recorded line says what this
 * lesson is. Then the opening is "I'll say each sound, and show you how we write it. Then you say it with me." on its
 * own (the recap's line, true of every lesson), never a line that miscounts ("two new sounds" for one sound with two
 * spellings) or the full frame on a later play (script-audit's over-framed). The lines for the other shapes are
 * requested (docs/tts-retakes.md, via integration): tv_learn_{frame,short}_one_<m>_ways, _mixed, _ways_many,
 * tv_learn_short_ways.
 */
function frameLine(lesson: Lesson, form: FrameForm): string | null {
  const f = form === "full" ? "frame" : "short";
  const m = lesson.groups.find((g) => g.isNew)?.items.length ?? 0;
  const id =
    lesson.kind === "sounds" ? fillLine(form === "full" ? "tv_learn_frame_<n>" : form === "recap" ? "tv_learn_recap_<n>" : "tv_learn_short_<n>", { n: lesson.count })
    : lesson.kind === "one-ways" ? `tv_learn_${f}_one_${NUMBER_WORDS[m] ?? m}_ways`
    : lesson.kind === "mixed" ? `tv_learn_${f}_mixed`
    : lesson.kind === "ways" ? (form === "full" ? "tv_learn_frame_ways" : "tv_learn_short_ways")
    : lesson.kind === "ways-many" ? `tv_learn_${f}_ways_many`
    : `tv_learn_${f}_one`;
  return HAS.has(id) ? id : null;
}

export function Dojo({ level, onDone }: LevelProps) {
  useState(() => beginLevel(level)); // (during the first render, before Learn and Build ask what's due)
  const teach = useRef((level.teach ?? []).map(teachEntry)).current;
  // the forms, decided as the level opens (TEACHER_SCRIPT §2.2): the lesson opens the level, so it is never "none"; Ninja
  // Eyes and Word Building inside it are linked with their short line at least (§2.4 rule 12: "Now let's…")
  const [forms] = useState(() => {
    const learn = teach.length ? gameForm("learn", { opening: true }) : null;
    const f = teach.length ? gameForm("find") : null;
    const b = gameForm("build", { opening: !teach.length });
    const link = (x: FrameForm) => (x === "none" ? "short" : x);
    return { learn, find: f && link(f), build: link(b) };
  });
  const lesson = useRef(lessonOf(level, teach, forms.learn === "short")).current;
  // Word Building's narrated demo on the level's first word: its first meeting (a school path), or a later day's recap
  const demo = forms.build === "full" || forms.build === "recap";
  // (units 8-10: a word with sounds next to each other first, for the unit's explanation: clusterFirst; with a demo, a
  // short word goes first for it, and the explanation comes with the child's first word)
  // (after a lesson, "Now let's build some words with your new sounds.": every word uses one of them where the level has
  // enough, and words whose picture a 4-year-old names as something else ("cob" is sweetcorn to them: pic-names.ts) go
  // last; so the first word is never "tin" after a lesson of b, c, g and h)
  const words = useRef<Word[]>(
    (() => {
      const maxLen = level.units.some((u) => u >= 10) ? 5 : 4;
      const taught = new Set(teach.map((t) => t.g));
      const rank = (w: Word) => (taught.size && !w.segs.some((s) => taught.has(s.g)) ? 2 : 0) + (w.pic && PIC_NAMES[w.text]?.[1] === false ? 1 : 0);
      const pool = chooseWords(level, 12, "spell", { maxLen });
      const picked = [...pool.keys()].sort((a, b) => rank(pool[a]) - rank(pool[b]) || a - b).slice(0, 5).map((k) => pool[k]);
      const ws = clusterFirst(picked, level.units); // (chooseWords shuffles: within a rank the order is random)
      if (!demo || ws.length < 2) return ws;
      const k = [...ws.keys()].sort((a, b) => Math.abs(ws[a].segs.length - 3) - Math.abs(ws[b].segs.length - 3) || a - b)[0];
      return [ws[k], ...ws.filter((_, j) => j !== k)];
    })(),
  ).current;
  const [phase, setPhase] = useState<Phase>(teach.length ? { k: "intro" } : { k: "build", i: 0 });
  const mistakes = useRef(0);
  // a cut lesson (§9) ends after the word being built when its time is up; the teaching (Learn, Find) always plays
  const timeUp = useLessonClock(level);
  const total = teach.length * 2 + words.length;
  const doneCount = phase.k === "intro" ? 0 : phase.k === "learn" ? phase.i : phase.k === "all" ? teach.length : phase.k === "find" ? teach.length + phase.i : phase.k === "build" ? teach.length * 2 + phase.i : total;
  // a new level starts a new streak; the ninja mounts after the reset, so it never arrives wearing old flames
  const [fresh, setFresh] = useState(false);
  useLayoutEffect(() => {
    streak.reset();
    setFresh(true);
  }, []);
  const alive = useAlive();
  const rowSlots = useRef<(HTMLElement | null)[]>([]);
  const findTurns = useRef<boolean[]>([]);
  const findFirstTries = useRef(0);
  // "It's two letters…" lines said in this lesson, and whether "This one's two letters too…" was one: after "too", or
  // after two, the rest get nothing (TEACHER_SCRIPT §3.26 rules, SF A2)
  const lessonLetters = useRef<LessonLetters>({ n: 0, too: false, lastTwo: false });
  const buildTurns = useRef<boolean[]>([]);
  const firstTries = useRef(0); // words built right first time in a row (the stems fade after two: SCRIPT_FIXES A6)
  const missedLast = useRef(false);

  useEffect(() => {
    playMusic("dojo");
    preload([...teach.flatMap((t) => (PAIRS[t.p] ?? []).concat(t.p).map((p) => urls.sound(p))), ...words.map((w) => urls.word(w.text))]);
  }, []);

  // ---- the lesson's opening: what it is and who does what, then "Are you ready for the first one?" (§3.26 A)
  // (the count is the new sounds, not the spellings (Dec8): a sound the child knew before this level is "Here's the
  // sound…", never new, and a second spelling of a sound is "another way to spell it"; a lesson with no recorded line for
  // its shape opens on "I'll say each sound…" alone: frameLine)
  const n = lesson.count;
  const opening = useRef<Say[]>([]);
  const frameId = frameLine(lesson, forms.learn ?? "short");
  /** the line the waiting petals twinkle on, and the word they twinkle at ("four new sounds"; "each sound") */
  const twinkleId = frameId ?? "tv_learn_how";
  const countWord = frameId ? (lesson.kind === "sounds" ? NUMBER_WORDS[n] ?? "" : "ways") : "each";
  /** "This sound can be spelt in two ways.": the one new sound of a lesson of its spellings, when no frame said so */
  const waysSay = lesson.kind === "one-ways" && !frameId ? L(sortWaysLine(lesson.items[0].ways)) : [];
  /** the lesson's close: "Four new sounds! You said every one."; a lesson of one sound's spellings, "Now you know two
   *  ways to spell… /ae/" (the petal with its spellings under it); a lesson of new ways to write known sounds, an
   *  everyday praise line, since it taught no new sounds to count */
  const allSay = useRef<Say[]>([]);
  useEffect(() => {
    if (phase.k !== "intro") return;
    let live = true;
    (async () => {
      const f = forms.learn!;
      // a school path's first lesson: the dojo is also the child's first game, so the room is named first (§4.6)
      const room = f === "full" && isSchoolFirst(level) && onceInSave(DJ_ROOM) && HAS.has("tv_dj_room") ? "tv_dj_room" : null;
      // (no recorded frame for this lesson: "I'll say each sound…" frames it on its own, on every form)
      opening.current = lines([room, frameId, f === "short" && frameId ? null : "tv_learn_how"], 400);
      await sleep(350);
      if (!live) return;
      const ok = await say(opening.current);
      if (ok && room) heard(DJ_ROOM);
      if (!live || !alive.current) return;
      for (let k = 0; k < 150 && isSpeaking(); k++) await sleep(80); // (Help or Hear it again took over: let it finish)
      const ask = readyAsk("learn", f);
      if (ask && HAS.has(ask.line)) {
        const how = await holdReady("learn", { ask: [{ line: ask.line }], again: () => say([...opening.current, { gap: 300 }, { line: ask.line }]) });
        if (!live || how === false) return;
        framed("learn", ask);
      }
      if (live) setPhase({ k: "learn", i: 0 });
    })();
    return () => void (live = false);
  }, []);
  // the lesson's close: the petals line up with their letters beside them, "Four new sounds! You said every one."
  useEffect(() => {
    if (phase.k !== "all") return;
    let live = true;
    (async () => {
      played("learn");
      await sleep(750);
      if (!live) return;
      const one = lesson.groups[0];
      const ways = lesson.kind === "one-ways" ? `t_ways_${Math.min(10, one.items.length)}` : null;
      if (ways && HAS.has(ways)) {
        allSay.current = [{ line: ways }, { gap: 100 }, { sound: one.p, show: "petal" }];
        void ninja.act("cheer");
        await say(allSay.current);
      } else {
        const id = lesson.kind === "sounds" ? fillLine("tv_learn_all_<n>", { n }) : pickPraise();
        if (HAS.has(id)) {
          allSay.current = [{ line: id }];
          praiseBy(id);
          praisedAt = performance.now();
          void ninja.act("cheer");
          await say(allSay.current);
        }
      }
      await sleep(500);
      if (live && alive.current) setPhase({ k: "find", i: 0 });
    })();
    return () => void (live = false);
  }, [phase.k]);
  // Hear it again before the first sound: the opening (a Ready hold has its own)
  useNav({ again: phase.k === "intro" ? () => say(opening.current) : phase.k === "all" ? () => say(allSay.current) : undefined });

  const next = () => {
    setPhase((p) => {
      if (p.k === "learn") return p.i + 1 < teach.length ? { k: "learn", i: p.i + 1 } : { k: "all" };
      if (p.k === "find") return p.i + 1 < teach.length ? { k: "find", i: p.i + 1 } : { k: "build", i: 0 };
      if (p.k === "build") return p.i + 1 < words.length && !timeUp() ? { k: "build", i: p.i + 1 } : { k: "done", last: p.i };
      return p;
    });
  };
  useEffect(() => {
    if (phase.k === "build" && phase.i === 0 && teach.length) played("find", { struggled: struggledIn(findTurns.current) });
  }, [phase.k]);

  useEffect(() => {
    if (phase.k !== "done") return;
    (async () => {
      played("build", { struggled: struggledIn(buildTurns.current) });
      // the level's closing line (levelWrap: "You learnt four new sounds today, and you built words with them."), said
      // once, while the ninja's big finish plays and confetti fills the dojo
      const wrap = closingOf(level, n, lesson.kind !== "sounds");
      fx.rain("confetti", 70);
      // (a beat after a streak line or praise on the last word, so "Ninja power!" and the closing don't stack within
      // 5 s: script-audit's praise-stacks; the ninja's finish and the confetti fill it)
      const beat = Math.max(tierLineAt, praisedAt) + 5500 / FAST - performance.now();
      const closing = async () => {
        if (beat > 0) await sleep(beat * FAST);
        return say(lines(wrap, 300));
      };
      await Promise.all([closing(), ninja.celebrate()]);
      const m = mistakes.current;
      if (alive.current) onDone(m <= 1 ? 3 : m <= 4 ? 2 : 1, { closing: wrap[0] });
    })();
  }, [phase.k]);

  // ---- which form each word takes (full: the demo, the we do, then yours; a recap: the demo, then yours; short: yours)
  const buildWord = (i: number) => {
    const b = forms.build;
    const mode: BuildMode = demo && i === 0 ? "demo" : b === "full" && i === 1 ? "wedo" : "you";
    const firstChild = demo ? 1 : 0;
    const opener = i === 0 ? buildOpener(b, !!teach.length, lesson.kind === "sounds") : null;
    const ready = mode === "demo" ? readyAsk("build", b) : null;
    return {
      mode,
      opener,
      frame: i === 0 ? opener ?? [] : [],
      ready: ready && HAS.has(ready.line) ? ready : null,
      hand: mode === "wedo" ? ("our" as const) : ("your" as const),
      byYourself: b === "full" && i === 2,
      // the hand-over fades with the stems (SCRIPT_STYLE §5 "Instructions fade with success"): after two words right
      // first time in a row, just the word; a miss brings "Your word is…" back (the verify round: "Your word is…" three
      // times in 51 s, line-60s)
      handFades: mode === "you" && i > firstChild + 1 && !(b === "full" && i === 2) && fadeForm(firstTries.current) === "short",
      // "We start here, and go this way." (narrate.tsx readThisWay, lands 1 and 2) only where Word Building is met for
      // the first time: after a land of read-backs it came "out of nowhere" (the verify round, w2-1)
      leftRight: b === "full",
      // "What's the first sound?" / next / last: the we do and the child's first word (SCRIPT_STYLE §5.1), and again after
      // a word with a miss until two come right first time (A6)
      stems: mode === "wedo" || i === firstChild || (i > firstChild && fadeForm(firstTries.current) === "full" && missedLast.current),
      glowFirst: i === firstChild,
      neighbours: i === firstChild && !teach.length,
      // a recap with no hold: the telling counts at the child's first answer (§2.2)
      framesOnAnswer: b === "recap" && i === firstChild && !(demo && readyAsk("build", b)),
    };
  };
  const lessonRow = teach.length > 0 && (phase.k === "intro" || phase.k === "learn" || phase.k === "all" || phase.k === "find");
  return (
    <div className={`scene dojo ${phase.k === "done" ? "dj-over" : ""}`}>
      <img className="bg-img" src={img("dojo_bg")} alt="" />
      <div className="vignette" />
      <TopBar>
        <div className="spacer" />
        <Progress value={doneCount / total} />
        <div className="spacer" />
        <div style={{ width: 68 }} />
      </TopBar>
      {fresh && <NinjaSpot />}
      {lessonRow && (
        <LessonRow
          lesson={lesson}
          cur={phase.k === "learn" ? lesson.items[phase.i].slot : phase.k === "intro" ? -1 : lesson.groups.length}
          mode={phase.k === "all" ? "all" : phase.k === "find" ? "gone" : "row"}
          slotRef={(i, el) => void (rowSlots.current[i] = el)}
          twinkleOn={phase.k === "intro" ? twinkleId : undefined}
          twinkleAt={wordAt(twinkleId, countWord) ?? (frameId ? 2.6 : 0.9)}
          counted={(g) => !frameId || g.isNew || lesson.count === 0}
        />
      )}
      {phase.k === "intro" && <IntroState />}
      {phase.k === "learn" && (
        <Learn
          key={`l${phase.i}`}
          item={lesson.items[phase.i]}
          index={phase.i}
          full={forms.learn === "full"}
          streakOn={phase.i === 0}
          letters={lessonLetters}
          from={rowSlots.current[lesson.items[phase.i].slot] ?? null}
          waysSay={phase.i === 0 ? waysSay : []}
          onNext={next}
        />
      )}
      {phase.k === "all" && <AllState />}
      {phase.k === "find" && (
        <Find
          key={`f${phase.i}`}
          t={teach[phase.i]}
          index={phase.i}
          pool={[...knownSpellings(level)]}
          opener={phase.i === 0 ? findOpener(forms.find ?? "short", lesson.kind === "sounds") : null}
          tip={phase.i === 0 && HAS.has("tv_petal_hint") && onceInSave(PETAL_HINT)}
          fade={phase.i >= 4 && fadeForm(findFirstTries.current) === "short"}
          wedo={phase.i === 0 && forms.find === "full"}
          onFramed={phase.i === 0 && (forms.find === "full" || forms.find === "recap") ? () => framed("find") : null}
          onNext={(struggled, firstTry) => {
            findTurns.current.push(struggled);
            findFirstTries.current = firstTry ? findFirstTries.current + 1 : 0;
            next();
          }}
          onMiss={() => mistakes.current++}
        />
      )}
      {/* the last word stays up for the finish: the ninja's stars land on it while the confetti falls */}
      {(phase.k === "build" || (phase.k === "done" && words.length > 0)) &&
        ((i) => (
          <Build
            key={`b${i}`}
            word={words[i]}
            bank={tileBank(words[i], level, 2)}
            index={i}
            {...buildWord(i)}
            level={level}
            isLast={() => i + 1 >= words.length || timeUp()}
            onFramed={() => framed("build")}
            onNext={(r) => {
              if (!r.demo) {
                buildTurns.current.push(r.struggled);
                firstTries.current = r.firstTry ? firstTries.current + 1 : 0;
                missedLast.current = !r.firstTry;
              }
              next();
            }}
            onMiss={() => mistakes.current++}
          />
        ))(phase.k === "build" ? phase.i : phase.last)}
      {/* letters flying into their slots (see deliver); part of the scene, so they go with it if the child leaves */}
      <div className="dj-flies" aria-hidden="true" />
      <NarrOverlay />
      <SenseiDock />
    </div>
  );
}

/** While the lesson is being framed and the Ready hold is up: nothing to tap on the board (bots wait; the hold's own ▶
 *  answers). */
function IntroState() {
  (window as any).__snState = { scene: "learn", game: "learn", next: null, busy: true, streak: streak.n };
  return null;
}
function AllState() {
  (window as any).__snState = { scene: "learn", game: "learn", next: null, busy: true, streak: streak.n };
  return null;
}

/** A school path's first lesson (TEACHER_SCRIPT §4.6): the first session's first lesson, on a school start point. */
function isSchoolFirst(level: Level): boolean {
  const s = store.get();
  return !!s.firstSession && s.firstSession.step === 0 && s.firstSession.lessons[0] === level.id && !!s.band && s.band !== "W";
}
/** The level's close (TEACHER_SCRIPT §5.6, games.ts levelWrap). `tv_learn_done` says "four new sounds": another count,
 *  or a lesson of new ways to write known sounds (`ways`), closes on Word Building's "You built words with their sounds,
 *  and you read them." until `tv_learn_done_<n>` is recorded (the retired "Well done! You practised so hard!" only if
 *  neither is). */
function closingOf(level: Level, n: number, ways = false): string[] {
  const counted = ways ? "" : fillLine("tv_learn_done_<n>", { n });
  const wrap = levelWrap(level)
    .map((id) => (id === "tv_learn_done" && (n !== 4 || ways) ? (HAS.has(counted) ? counted : HAS.has("tv_build_done") ? "tv_build_done" : "dojo_done") : id))
    .filter((id) => HAS.has(id));
  return wrap.length ? wrap : ["dojo_done"];
}
/** How a sound is brought in. The new sounds' lead-ins shorten as a series (SF C2, TEACHER_SCRIPT §3.26): the first, the
 *  next, another, the last. `lone`: a lesson's only new sound, which always comes first ("Here it comes…", then "It's a
 *  new sound. Tap its petal…"). `known`: a sound the child knew before this level is never "new" (the verify round,
 *  TEACHER_SCRIPT §4.6's contradiction): "Here's the sound…" and "Our next sound is one you know…" take turns (Learn,
 *  knownLead). `same`: another spelling of the sound just taught: no lead-in, the petal comes back and says its sound. */
type Lead = "first" | "first-short" | "next" | "another" | "last" | "lone" | "known" | "same";
const LEAD_LINES: Record<Exclude<Lead, "known">, string[]> = {
  first: ["tv_learn_first", "tv_here_it_comes"], "first-short": ["tv_learn_first_short"], next: ["tv_learn_next"], another: ["tv_learn_another"], last: ["tv_learn_last"],
  lone: ["tv_here_it_comes"], same: [],
};
/** A known sound's lead-in: "Here's the sound…" and "Our next sound is one you know…" take turns (the lesson's first
 *  known sound, if it opens the lesson, with "Here's the sound…"); never a third time in a minute (then the one with
 *  room, or none: the petal says its sound). */
function knownLead(item: LessonItem): string | null {
  return item.knownHere ? withRoom("tv_here_sound", "tv_next_sound_known") : withRoom("tv_next_sound_known", "tv_here_sound");
}
/** The first of these recorded lines that hasn't been said twice in the last minute (SCRIPT_STYLE §5), or null. */
const withRoom = (...ids: string[]): string | null => ids.find(roomFor) ?? null;
/** A Sounds~Write routine line (SCRIPT_STYLE §5.1: said the same way every time, exempt from the 60 s rule): the first
 *  with room, else the first recorded one. The Learn's series ("Tap its petal, and say it." · "And this is how we
 *  write…" · "Now you tap it, and say it.") is one: a new sound is never taught in silence (the verify round: w2-1's
 *  /h/, w5-1's /th/, w5-3 and w5-6's last sounds had only the petal's sound, the third sound in a minute). */
const routine = (...ids: string[]): string | null => withRoom(...ids) ?? ids.find((id) => HAS.has(id)) ?? null;
/** When the Dojo last praised (performance.now() ms): two praise lines never come within a few seconds of each other,
 *  however quickly the child answers (script-audit's praise-stacks: "That's it!" · "You know how we write that sound."
 *  4.7 s apart in Ninja Eyes). */
let praisedAt = -Infinity;
const PRAISE_GAP = 8000;
// (any praise line, whoever says it: Word Building's comes from narrate.tsx afterWordSay)
onClip((id) => void (/^(yay_\d+|tv_yay_\w+|tv_praise_\w+|tv_fs_praise_\w+|tv_said_well|tv_learn_all_\w+)$/.test(id) && (praisedAt = performance.now())));
/** Ninja Eyes in the dojo: its frame the first time (a school path), its recap on a later day, else "Now let's play
 *  Ninja Eyes, with your new sounds." (TEACHER_SCRIPT §3.26 B, §4.1), or "Now let's play Ninja Eyes." after a lesson
 *  that didn't teach new sounds, plural (one sound's spellings, or new ways to write known sounds: Dec8). */
const findOpener = (f: FrameForm, newSounds = true): Say[] =>
  f === "full" ? L("tv_ne_frame") : f === "recap" ? L("tv_ne_recap") : newSounds && L("tv_ne_new_sounds").length ? L("tv_ne_new_sounds") : L("tv_ne_again");
/** Word Building's opener (§3.26 C, §3.16 A): the frame and the lines at its first meeting; in a lesson's dojo "Now let's
 *  build some words with your new sounds." (after a lesson that didn't teach new sounds, plural: "Next, we're going to
 *  build some words."); in a dojo with no new sounds, its recap or "Let's build some more words." */
function buildOpener(f: FrameForm, teach: boolean, newSounds = true): Say[] {
  if (f === "full") return lines(["tv_build_frame", "tv_build_lines"], 350);
  if (teach) return newSounds || !HAS.has("tv_next_build_plain") ? L("tv_build_dojo") : L("tv_next_build_plain");
  return f === "recap" ? L("tv_build_recap") : L("tv_build_again_short");
}

/**
 * The word card with the screen's Hear it again (docs/NAVIGATION.md §3.1 "own"): a picture card has the speaker beside
 * it (the scene draws it); a word with no picture is a speaker card, and the card itself is Hear it again
 * (data-nav="again", running the screen's Hear it again). Used by the Dojo, battles and Sound Swap.
 * (ui.tsx's WordCard could take a `nav` prop instead of this wrapper.)
 */
export function WordCardAgain({ word, style, className = "" }: { word: { text: string; pic?: unknown }; style: CSSProperties; className?: string }) {
  // (while a held explanation waits on Next, the hold's own speaker is Hear it again: the card just says its word)
  const held = useHeld();
  const hear = () => (held ? void say({ word: word.text }) : navAgain());
  if (word.pic) return <WordCard word={word} style={style} className={className} onHear={hear} />;
  const { left, top, width, height, ...rest } = style;
  return (
    <div data-nav={held ? undefined : "again"} style={{ position: "absolute", left, top, width, height }}>
      <WordCard word={word} className={className} onHear={hear} style={{ ...rest, left: 0, top: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

/** Is this component still on screen? (Async sequences stop when the child leaves.) */
function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);
  return alive;
}

/**
 * A quiet-time ladder (TEACHER_SCRIPT §5.5): `fire(k)` once steps[k] game ms of quiet have passed, while `active`.
 * Quiet: nobody speaking; any tap starts it again. Nothing polls: the count banks the quiet time and sleeps until the
 * next step, and speech (onSpeaking) pauses it.
 */
function useQuietLadder(active: boolean, steps: readonly number[], fire: (k: number) => void, deps: unknown[] = []) {
  const f = useRef(fire);
  f.current = fire;
  useEffect(() => {
    if (!active) return;
    let idle = 0, from = 0, k = 0, t = 0, on = true;
    const sync = () => {
      if (!on) return;
      clearTimeout(t);
      if (from) idle += (performance.now() - from) * FAST;
      from = 0;
      while (k < steps.length && idle >= steps[k] - 5) f.current(k++);
      if (on && k < steps.length && !isSpeaking()) {
        from = performance.now();
        t = window.setTimeout(sync, steps[k] - idle);
      }
    };
    const reset = () => {
      idle = 0;
      k = 0;
      from = 0;
      sync();
    };
    const off = onSpeaking(sync);
    window.addEventListener("pointerdown", reset, true);
    sync();
    return () => {
      on = false;
      clearTimeout(t);
      off();
      window.removeEventListener("pointerdown", reset, true);
    };
  }, [active, ...deps]);
}
/** Wait while Sensei is speaking (a replay, Help), at most `ms` game ms. */
async function settle(ms = 12000) {
  for (let k = 0; k < ms / 80 && isSpeaking(); k++) await sleep(80);
}
/** Wait for `ms` game ms in which nobody speaks, or until `stop` resolves. Speech meanwhile (Hear it again, Help) starts
 *  the count again once it ends: a plain sleep let the join-in's next step ("/b/" from the petal) cut a replay off
 *  before it reached the question (the sweep's replay-stale). */
async function quietFor(ms: number, stop: Promise<void>): Promise<void> {
  let done = false;
  void stop.then(() => (done = true));
  for (;;) {
    let spoke = isSpeaking();
    const off = onSpeaking((on) => void (on && (spoke = true)));
    await Promise.race([stop, sleep(ms)]);
    off();
    if (done || (!spoke && !isSpeaking())) return;
    await Promise.race([stop, settle(30000)]);
    if (done) return;
  }
}

// ---------------------------------------------------------------- the ninja's part
/** Moves never repeat the last two; `pool` is already filtered by the streak tier. */
function chooser() {
  const recent: string[] = [];
  return <M extends string>(pool: M[]): M => {
    const fresh = pool.filter((m) => !recent.includes(m));
    const m = fresh[(Math.random() * fresh.length) | 0] ?? pool[0];
    recent.push(m);
    if (recent.length > 2) recent.shift();
    return m;
  };
}
const choose = chooser();

/** When a streak tier line ("Ninja power!", "Wow! Super ninja streak!", the first streak's explanation) last started. */
let tierLineAt = -Infinity;
onClip((id) => void (/^(streak_\d+|tv_streak_\d+|audit_streak_first)$/.test(id) && (tierLineAt = performance.now())));

/** A wrong answer. The ninja always tilts its head ("hmm?"), never a hurt look; its flames puff out, the aura fades
 *  and (from a streak of 3 or more) a soft fizzle plays, by themselves. "Keep going, ninja." comes back for the caller
 *  to say FIRST, ahead of the correction (left to the ninja, it would come after it, and the child would try again with
 *  the encouragement in their ears instead of the target). `line: false` when the correction starts "Yes, ...". */
function wrongAnswer(line = true): Say[] {
  const e = streak.miss({ line: false });
  if (e.prevN === 0) void ninja.act("think"); // (from a streak, the ninja thinks by itself)
  // (not a few seconds after the ninja's own tier line: "Ninja power!" · "Keep going, ninja." would stack two streak
  // lines on one breath; the correction alone follows)
  // (nor a few seconds after a praise line: "Well done." · "Keep going, ninja." is the praise-stacks the verify round heard
  // in Ninja Eyes when a quick child's next tap missed)
  const lost = line && performance.now() - tierLineAt > 5000 / FAST && performance.now() - praisedAt > 5000 / FAST ? streakLine(e) : null;
  return lost ? [{ line: lost }, { gap: 250 }] : [];
}

/** Where a strike on a spelling lands: just above its top edge. The spelling sits above the effects layer
 *  (.dj-front), so the impact star bursts out from behind it like a crown, and its letters stay readable while their
 *  sound is said. */
function crown(el: Element): Pt {
  const r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y - 14 };
}
/** The spelling that was hit squashes and bounces back. No white flash: its letters must stay readable. */
function wobble(el: Element | null | undefined) {
  try {
    const a = el?.animate([{ scale: "1" }, { scale: "1.1 0.9", offset: 0.2 }, { scale: "0.96 1.05", offset: 0.5 }, { scale: "1.02 0.98", offset: 0.75 }, { scale: "1" }] as Keyframe[], {
      duration: 420,
      easing: "ease-out",
    });
    if (a) a.playbackRate = FAST;
  } catch {}
}
/** A tap that can't count now (Sensei is explaining or correcting): it is felt, never silently ignored (SD §4.3). */
function nod(el: Element | null | undefined) {
  wobble(el);
  sfx.tink();
}
/** A gentle one-shot pulse (transform only), e.g. a slot on "Each line is for one sound". */
function pulse(el: Element | null | undefined, k = 1.08, ms = 420) {
  try {
    el?.animate([{ transform: "scale(1)" }, { transform: `scale(${k})`, offset: 0.4 }, { transform: "scale(1)" }], { duration: ms, easing: "ease-out" });
  } catch {}
}
/** "Find the sound" strikes. No star shot from mid-leap or flip volley: they fly level along the row, past the wrong
 *  spellings, and look as if they hit them. When the answer isn't the first in the row, only the moves whose effect
 *  arcs in from above (the spell, the shuriken) or rises steeply (the kick wave); anything that still crosses a
 *  wrong spelling passes behind it (.dj-front). */
function findMove(tier: Tier, first: boolean): Move {
  if (!first) return choose<Move>(["cast", "throw", "kick"]);
  return choose<Move>(tier === 0 ? ["kick", "punch", "cast", "throw"] : ["kick", "punch", "cast", "throw", "spin"]);
}

/** How a letter gets into its slot. "carry" is the spell that lifts it; every other move hits the tile, which hops up
 *  out of the bank to meet it and then flies home. */
type Deliver = Move | "carry";
const DELIVER: Record<Tier, Deliver[]> = {
  0: ["kick", "punch", "carry", "throw"],
  1: ["kick", "punch", "carry", "throw", "spin", "jump"],
  2: ["kick", "spin", "carry", "flip", "throw", "jump"],
  3: ["flip", "spin", "carry", "kick", "throw", "jump"],
};
/** The moves that land within about 0.6 s wherever the letter is (on a streak they still upgrade by themselves: a
 *  flying kick, a double jab, a fan of shuriken). */
const QUICK: Deliver[] = ["kick", "punch", "carry", "throw"];
/** Where the ninja's hand is (stage x), and how far away a letter counts as far. */
const HAND_X = 300;
const FAR = 450;
/** Pick the move for a letter. The showy ones (spin, flip, jump) launch late, so their effect takes up to 1.2 s to
 *  reach a letter far across the bank, and the child would be waiting on an empty slot. They are kept for letters near
 *  the ninja while nothing else is in the air; a far letter, a quick child's next letter and a word's last letter (it
 *  holds up the read-back) get a quick one. */
function deliveryFor(el: Element, last: boolean, busy: boolean): Deliver {
  const r = stageRect(el);
  const far = r.x + r.w / 2 - HAND_X > FAR;
  return choose<Deliver>(last || busy || far ? QUICK : DELIVER[streak.tier]);
}

const COLS: Record<Tier, string[]> = {
  0: ["#fff4dc", "#ffe38a", "#ffc53d"],
  1: ["#ffe38a", "#ffc53d", "#ff9a3d", "#fff4dc"],
  2: ["#ff7aa2", "#5ec8f2", "#b48cff", "#ffe38a"],
  3: ["#ff5a5a", "#ffb03d", "#ffe94a", "#5fd35f", "#4ab8ff", "#b48cff"],
};

type Pt = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };
const centre = (r: Box): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
/** Run `f(t)` for t 0→1 over `ms` (sped up with the bots' fast-forward). Stops early once `alive` goes false. */
async function tween(ms: number, f: (t: number) => void, alive?: { readonly current: boolean }) {
  const t0 = performance.now();
  for (;;) {
    if (alive && !alive.current) return;
    const t = Math.min(1, ((performance.now() - t0) * FAST) / ms);
    f(t);
    if (t >= 1) return;
    await frame();
  }
}

/** The layer letters fly in (.dj-flies, in the scene): above the effects and above the letters already in their slots,
 *  so a letter on its way is never hidden and the ninja's impact bursts out behind it, like the crown on a found
 *  spelling. Being part of the scene, whatever is in the air goes with it when the child leaves. */
const flyLayer = (): HTMLElement | null => document.querySelector<HTMLElement>(".dojo .dj-flies") ?? fxDom();

/** The copy made by the ninja's carry spell is only a picture: keep it away from screen readers and the bots, and move
 *  it into the fly layer with the other letters in the air. (It is made synchronously by ninja.carry().) */
function adoptCarry() {
  const to = flyLayer();
  fxDom()?.querySelectorAll(".fx-carry:not([aria-hidden])").forEach((c) => {
    c.setAttribute("aria-hidden", "true");
    c.classList.add("dj-fly");
    c.querySelectorAll("[aria-label]").forEach((e) => e.removeAttribute("aria-label"));
    if (to && c.parentElement !== to) to.appendChild(c);
  });
}

/** A glowing picture of a tile in the fly layer (stage coordinates). */
function tileCopy(el: HTMLElement, r: Box): HTMLDivElement {
  const box = document.createElement("div");
  box.className = "fx-carry dj-fly";
  box.setAttribute("aria-hidden", "true");
  box.style.width = `${r.w}px`;
  box.style.height = `${r.h}px`;
  const c = el.cloneNode(true) as HTMLElement;
  c.removeAttribute("aria-label");
  c.classList.remove("pressed", "hint", "wrong", "used", "pop-in", "drop-in");
  c.style.cssText += ";position:absolute;inset:0;margin:0;width:100%;height:100%;transform:none;translate:none;scale:none;animation:none;min-width:0";
  box.appendChild(c);
  flyLayer()?.appendChild(box);
  return box;
}

/** A letter lands in its slot. The letters in the slots sit above the effects, so these sparkles fall behind them
 *  and never change a letter's shape (a sparkle on l reads as i). */
function landing(p: Pt, tier: Tier) {
  sfx.place();
  fx.ring(p.x, p.y, { color: COLS[tier][0], r0: 30, r1: 100 + tier * 14, width: 10, life: 18 });
  fx.twinkle(p.x, p.y, COLS[tier], 8 + tier * 2, 6);
  fx.burst(p.x, p.y + 30, "sparks", 8);
}

type Alive = { readonly current: boolean };
/** The ninja delivers the tapped bank tile into its slot. Resolves when it has landed (about 0.6-0.9 s from the tap).
 *  If the child leaves meanwhile (`alive` goes false), the copy is dropped and nothing lands. */
async function deliver(el: HTMLElement, slot: HTMLElement, move: Deliver, alive: Alive): Promise<void> {
  const tier = streak.tier;
  const r0 = stageRect(el), r1 = stageRect(slot);
  if (!r0.w || !r1.w) return;
  const a = centre(r0), b = centre(r1);
  if (move === "carry") {
    const p = ninja.carry(el, slot, { react: false });
    adoptCarry();
    await p;
    if (alive.current) fx.burst(b.x, b.y + 30, "sparks", 8);
    return;
  }
  const box = tileCopy(el, r0);
  let pos = a, rot = 0, sx = 1, sy = 1, k = 1;
  const put = () => (box.style.transform = `translate(${pos.x - r0.w / 2}px, ${pos.y - r0.h / 2}px) rotate(${rot}deg) scale(${sx * k}, ${sy * k})`);
  put();
  // 1. the tile hops up out of the bank (straight away, so the tap feels instant) and hangs there until the hit lands
  const up = { x: a.x + (b.x - a.x) * 0.08, y: a.y - 86 };
  let hit = false;
  void Promise.race([ninja.act(move, up, { react: false }), sleep(1100)]).then(() => (hit = true));
  await tween(170, (t) => {
    const e = 1 - Math.pow(1 - t, 3);
    pos = { x: a.x + (up.x - a.x) * e, y: a.y + (up.y - a.y) * e };
    sx = 1 - 0.1 * Math.sin(Math.PI * t);
    sy = 1 + 0.14 * Math.sin(Math.PI * t);
    put();
  }, alive);
  const h0 = performance.now();
  while (!hit && alive.current) {
    await frame();
    const s = ((performance.now() - h0) * FAST) / 1000;
    pos = { x: up.x, y: up.y - Math.sin(s * 8) * 5 };
    rot = Math.sin(s * 11) * 4;
    put();
  }
  if (!alive.current) return void box.remove();
  // 2. the hit sends it home: an arc into the slot, leaning into the flight and settling upright as it lands.
  //    Letters never tumble: upside down, b is q and p is d.
  const dir = b.x >= up.x ? 1 : -1;
  const lean = (move === "kick" || move === "spin" ? 26 : move === "punch" ? 14 : 20) * dir;
  const end = Math.min(1.35, Math.max(0.7, r1.h / r0.h));
  const ctrl = { x: (up.x + b.x) / 2, y: Math.min(up.y, b.y) - 70 };
  const r = rot;
  const ms = Math.max(230, Math.min(330, Math.hypot(b.x - up.x, b.y - up.y) / 1.7));
  // the trail: one glow every 22 stage px travelled, whatever the frame rate (docs/PERF.md fix 7)
  const trail = fx.trail(COLS[tier], { every: 22, size: 36, drift: 0.6, life: 14 });
  await tween(ms, (t) => {
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    pos = bez(up, ctrl, b, e);
    rot = r * (1 - e) + lean * Math.sin(Math.PI * e);
    k = 1 + (end - 1) * e;
    const s = Math.sin(Math.PI * Math.min(1, t * 1.4));
    sx = 1 + 0.12 * s;
    sy = 1 - 0.08 * s;
    put();
    if (t < 0.92) trail(pos);
  }, alive);
  box.remove();
  if (alive.current) landing(b, tier);
}

// ---------------------------------------------------------------- the lesson's petals, waiting in the mist
/** The row's petals (stage px): mini, above the middle, clear of the top bar. */
const MINI = 72;
const ROW_TOP = 58;
/**
 * The lesson's sounds above the middle (TEACHER_SCRIPT §3.26 A): one petal per sound, not per spelling (Dec8: w6-1's
 * < ai > and < ay > are one /ae/ petal). Each waits as a misty petal ("?"; a sound the child knows shows its own petal),
 * nothing pulsing; they twinkle one after another on the frame's count ("four new sounds"). The sound being learnt has
 * floated down (its place stays empty while each of its spellings is taught; `slotRef` is where it floats from); a
 * learnt one comes back bloomed. `all`: the row comes down to the middle and each petal gets its spellings beneath it,
 * side by side (the lesson's close: the chart's "same sound, different spellings"); `gone`: it fades away (Ninja Eyes).
 * Passive: nothing here takes a tap. No endless animation.
 */
function LessonRow({ lesson, cur, mode, slotRef, twinkleOn, twinkleAt = 0, counted = () => true }: { lesson: Lesson; cur: number; mode: "row" | "all" | "gone"; slotRef: (i: number, el: HTMLElement | null) => void; twinkleOn?: string; twinkleAt?: number; counted?: (g: LessonGroup) => boolean }) {
  const { groups, items } = lesson;
  const slots = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!twinkleOn) return;
    let t = 0;
    const timers: number[] = [];
    // (only the petals the frame counts: "three new sounds" twinkles three, not the known sound beside them)
    const sparkle = () =>
      slots.current.forEach((el, i) => {
        if (!groups[i] || !counted(groups[i])) return;
        timers.push(
          window.setTimeout(() => {
            if (!el?.isConnected || el.classList.contains("out")) return;
            pulse(el.firstElementChild, 1.14, 440);
            const r = stageRect(el);
            fx.twinkle(r.x + r.w / 2, r.y + r.w / 2, ["#f3eeff", "#fff4dc", "#cdbfe8"], 4, 3, 22);
          }, timers.length * 190),
        );
      });
    const off = onClip((id) => void (id === twinkleOn && (t = window.setTimeout(sparkle, twinkleAt * 1000))));
    return () => {
      off();
      clearTimeout(t);
      timers.forEach(clearTimeout);
    };
  }, [twinkleOn, twinkleAt]);
  const h = badgeHeight(MINI);
  const scale = groups.length > 4 ? 1.1 : 1.3;
  let tile = 0; // (the spellings drop in one after another, across the row)
  return (
    <div className={`dj-row ${mode}`} style={{ left: MID, top: ROW_TOP, ...(mode !== "row" ? { transform: `translateY(170px) scale(${scale})` } : null) }} aria-hidden="true">
      {groups.map((gr, i) => {
        const state = mode !== "row" || i < cur ? "done" : i === cur ? "out" : "wait";
        return (
          <span
            key={i}
            className={`dj-row-slot ${state}`}
            style={{ minWidth: soundWidth(gr.p, MINI, "mini") }}
            ref={(el) => {
              slots.current[i] = el;
              slotRef(i, el);
            }}
          >
            <span className="dj-row-petal" style={{ height: h }}>
              {state === "done" && <SoundBadge key="d" p={gr.p} tier="mini" size={MINI} passive className="dj-row-back" />}
              {state === "wait" && (gr.isNew ? <SoundBadge key="w" p={PAIRS[gr.p]?.[0] ?? gr.p} tier="mini" size={MINI} unknown passive /> : <SoundBadge key="k" p={gr.p} tier="mini" size={MINI} passive />)}
            </span>
            {mode !== "row" && (
              <span className="dj-row-gs">
                {gr.items.map((k) => (
                  <span key={k} className="dj-row-g" style={{ animationDelay: `${0.35 + tile++ * 0.12}s` }}>
                    <Tile g={items[k].g} size="sm" />
                  </span>
                ))}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- New Sounds: hear the sound, see how we write it, say it
// The sound is its petal (SoundBadge), in the middle while Sensei says it; as the ninja writes, the petal steps aside
// and the spelling appears beside it, and both stay: the sound, and how we write it.
/** Learn's row (stage px): the hero petal, a gap, and the room the spelling appears in; the petal's top edge. */
const HERO = 220;
const LEARN_GAP = 44;
const SPELL_W = 300;
const LEARN_TOP = 170;
type LearnStep = "listen" | "petal" | "cast" | "write" | "letter" | "over";
/** The lesson's letters lines so far (SF A2): how many, whether "This one's two letters too…" was one, and whether the
 *  last was a two-letter line (after "It's three letters…", a two-letter spelling's "too" would be wrong: nothing) */
interface LessonLetters {
  n: number;
  too: boolean;
  lastTwo: boolean;
}
const LETTERS_TWO = new Set(["t_two_letters", "st_two_letters_too"]);
const LETTERS_MORE = new Set(["t_three_letters", "t_four_letters"]);
function Learn({ item, index, full, streakOn, letters, from, waysSay, onNext }: { item: LearnItem; index: number; full: boolean; streakOn: boolean; letters: { current: LessonLetters }; from: Element | null; waysSay: Say[]; onNext: () => void }) {
  const { g, p, lead } = item;
  const same = item.kind === "same";
  const first = index === 0;
  const pair = !!PAIRS[p];
  const heroW = soundWidth(p, HERO, "hero");
  const heroH = badgeHeight(HERO);
  const [step, setStepS] = useState<LearnStep>("listen");
  const stepRef = useRef<LearnStep>("listen");
  const setStep = (s: LearnStep) => {
    stepRef.current = s;
    setStepS(s);
  };
  const [taps, setTaps] = useState(0);
  const tapsRef = useRef(0);
  const [hint, setHint] = useState(false);
  const [companion, setCompanion] = useState<{ p: PhonemeId; dim: boolean } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLElement | null>(null);
  /** Hear it again: this sound's whole teaching, as it has been said so far (TEACHER_SCRIPT §3.26 rules) */
  const bundle = useRef<Say[]>([]);
  /** the petal join-in is waiting: the tap resolves it */
  const petalWait = useRef<(() => void) | null>(null);
  const tapSaid = useRef<Promise<boolean> | null>(null);
  const alive = useAlive();
  const S = (): Say => ({ sound: p, show: "petal", at: () => heroRef.current });
  const shown = step === "write" || step === "letter" || step === "over";
  // What Sensei says for the child's two turns and the spell (TEACHER_SCRIPT §3.26 A). The first sound says each
  // instruction in full ("Tap the petal, and say it with me." · "Now watch my ninja write it." · "This is how we write…"
  // · "Now you tap it, and say the sound."); the next ones say the short forms, as a series ("Tap its petal, and say
  // it." · "And this is how we write…" · "Now you tap it, and say it."), and never go back to the long forms: the verify
  // round heard the lesson "restart" at /g/ when they took turns. "Now watch my ninja write it." is said for the first
  // two sounds only (it came four times in 38 s). The series is a Sounds~Write routine (SCRIPT_STYLE §5.1), so the 60 s
  // rule never leaves it out (`routine`): the verify round heard w2-1's /h/ taught in silence. On a recap or short form the join-ins fade from the third sound (DECISIONS D1). Another spelling of the sound
  // just taught (`same`) skips the petal: the child said it a moment ago.
  const [script] = useState(() => {
    const faded = !full && index >= 2;
    const leadIds = lead === "known" ? [knownLead(item)].filter((x): x is string => !!x) : LEAD_LINES[lead];
    const petal = same ? null : first ? (lead === "lone" && HAS.has("tv_new_petal_say") ? "tv_new_petal_say" : "tv_petal_say") : faded ? null : routine("tv_petal_say_short");
    const watch = index < 2 ? withRoom("tv_watch_write") : null;
    const tap = first ? "tv_tap_letter_say" : faded ? null : routine("tv_tap_it_say_short");
    return { lead: leadIds, petal, watch, tap };
  });
  /** the petal join-in's instruction as said (the line, or the faded line after 5 s), for Hear it again at the petal */
  const petalAsk = useRef<Say[]>([]);

  // < th > as /dh/, taught a moment after /th/ (SD r20): the /th/ petal appears beside the feather as "The same spelling
  // can sometimes be…" starts, and dims when /dh/ is said
  useEffect(() => {
    const other = item.second;
    if (!other) return;
    return onClip((id) => {
      if (id === "t_same_spelling_sometimes") setCompanion({ p: other, dim: false });
      else if (id === `sound:${p}`) setCompanion((c) => (c ? { ...c, dim: true } : c));
    });
  }, []);
  // the petal swells on the example words ("You can hear it in bat, bag and bin.")
  useEffect(
    () =>
      onClip((id) => {
        const ws = TEACH_WORD_TIMES[id];
        if (!ws || !id.startsWith("tp_")) return;
        ws.filter(([w]) => !["you", "can", "hear", "it", "in", "and"].includes(w.toLowerCase())).forEach(([, t]) => setTimeout(() => alive.current && pulse(heroRef.current, 1.07, 360), t * 1000));
      }),
    [],
  );

  const petalJoinIn = async (line: string | null): Promise<void> => {
    let tapped = false;
    const waitTap = new Promise<void>((r) => (petalWait.current = () => ((tapped = true), r())));
    petalAsk.current = L(line);
    setStep("petal");
    const lineDone = say(L(line));
    // no tap: 8 s after the line the petal swells and says its sound; 4 s later the lesson goes on (§3.5 C). With the
    // line faded (a recap or short form, the third sound on), it is said after 5 s of quiet first
    const ladder = (async () => {
      await lineDone;
      await settle();
      const steps = [...(line ? [] : [[5000, "line"] as const]), [8000, "sound"] as const, [4000, "go"] as const];
      for (const [ms, then] of steps) {
        await quietFor(ms, waitTap);
        if (tapped || !alive.current) return;
        if (then === "line") {
          petalAsk.current = L("tv_petal_say_short");
          await say(petalAsk.current);
        } else if (then === "sound") await say(S());
      }
    })();
    await Promise.race([waitTap, ladder]);
    petalWait.current = null;
    if (tapped && tapSaid.current) await tapSaid.current;
  };

  useEffect(() => {
    (async () => {
      // 1. here it comes: the misty petal floats down from the row, and blooms on the sound (SoundBadge `intro`); a
      //    sound the child knows comes in as known ("Here's the sound…", "Our next sound is one you know…": knownLead);
      //    another spelling of the sound just taught comes back and says its sound once. The words start as the petal
      //    lands (its float is 850 ms): mid-float its picture is a third of its size (sound-display's petal-picture-size)
      const ears = index === 0 && (lead === "first" || lead === "lone");
      const intro: Say[] = same ? [S()] : [...lines(script.lead, 300), ...(script.lead.length ? [{ gap: 300 } as Say] : []), S(), { gap: 750 }, S()];
      bundle.current = intro;
      await sleep(from ? 700 : 200);
      if (!alive.current) return;
      if (ears && ninja.mounted) ninja.pose("listen"); // "Get your ninja ears ready." (the ninja cups its ear)
      await say(intro);
      if (ears && ninja.mounted) ninja.pose(null);
      if (!alive.current) return;
      await settle();
      // 2. the news: where we hear it (the lesson's first new sound), or that the child already knows this sound (after
      //    "Here's the sound…", the lesson's first two known sounds; "Our next sound is one you know…" has said it)
      const firstNew = item.kind === "new" && (lead === "first" || lead === "first-short" || lead === "lone");
      const knownNews = item.kind === "known" && item.knownN < 2 && script.lead[0] !== "tv_next_sound_known" && roomFor("st_know_this_sound");
      const news: Say[] = knownNews ? L("st_know_this_sound") : firstNew && !item.second && !pair ? hearIn(p, g).say : [];
      if (news.length) {
        bundle.current = [...bundle.current, { gap: 350 }, ...news];
        await say([{ gap: 350 }, ...news]);
        if (!alive.current) return;
        await settle();
      }
      // 3. the child taps the petal and says the sound (a join-in: "Tap the petal, and say it with me."); not for another
      //    spelling of the sound just taught
      if (!same) await petalJoinIn(script.petal);
      if (!alive.current) return;
      // (a lesson of one new sound's spellings, framed by "I'll say each sound…" alone: "This sound can be spelt in two
      // ways.", before its first spelling is written)
      if (waysSay.length) {
        setStep("listen"); // (the petal's answer is in: a tap now nods, and never cuts the line off)
        bundle.current = [...bundle.current, { gap: 400 }, ...waysSay];
        await say([{ gap: 250 }, ...waysSay]);
        if (!alive.current) return;
        await settle();
      }
      // 4. "Now watch my ninja write it." (the first two sounds): the petal steps aside, and the spelling appears out of
      //    the ninja's spell
      setStep("cast");
      const watch = say(L(script.watch));
      await sleep(380);
      if (!alive.current) return;
      const where = spot.current ?? { x: MID + 117, y: 320 };
      await Promise.race([ninja.act("cast", where, { react: false }), sleep(1500)]);
      if (!alive.current) return;
      setStep("write");
      sfx.pop();
      await watch;
      if (!alive.current) return;
      await settle();
      // 5. how we write it, and what it is: "This is how we write… /b/" (the first sound), then "And this is how we
      //    write… /k/" for every sound after it; a known sound's, "This is another way to spell the sound…", then "And
      //    here's another way to spell it…", as is another spelling of the sound just taught (routine lines, always said).
      //    Then "It's two letters, but it's one sound.";
      //    < x > is two sounds together (/k/ + /s/); < th > as /dh/ after /th/: "The same spelling can sometimes be…"
      const writeId =
        item.kind === "known" ? (item.knownN === 0 ? routine("t_another_way", "tv_and_another_way") : routine("tv_and_another_way", "t_another_way"))
        : same ? routine("tv_and_another_way", "t_another_way")
        : first ? "tv_how_we_write"
        : routine("tv_and_how_we_write");
      let about: Say[] = [];
      let lettersTold = false;
      if (item.second) about = sameSpellingSay(g, item.second, p, () => heroRef.current);
      else {
        about = lettersFor({ g, p }, { at: () => tileRef.current });
        // a lesson's first two-letter spelling gets "It's two letters, but it's one sound.", the next "This one's two
        // letters too…", and the rest nothing (TEACHER_SCRIPT §3.26 rules, SF A2), however slowly the child goes. Once
        // "too" has been said, nothing more in this lesson: a lesson whose first two-letter spelling takes "too" (the last
        // level said "It's two letters…" a minute ago) would otherwise say "too" again 23 s later (the verify round). A
        // three-letter line counts too: after "It's three letters, but it's just one sound." (< igh >), < ie > gets
        // nothing, not the full two-letter line again for the same sound (the verify round's letters-twice, w6-ec11)
        const kind = about[0] && "line" in about[0] ? about[0].line : null;
        const two = !!kind && LETTERS_TWO.has(kind), more = !!kind && LETTERS_MORE.has(kind);
        const was = letters.current;
        if ((two || more) && (was.too || was.n >= 2)) about = [];
        else if (two && was.n === 1 && !was.lastTwo) about = [];
        else if (kind === "t_two_letters" && was.n === 1 && HAS.has("st_two_letters_too")) about = [{ line: "st_two_letters_too" }]; // (a slow child: over 2 minutes since the first)
        lettersTold = about.length > 0;
        if (lettersTold && (two || more)) letters.current = { n: was.n + 1, too: was.too || kind === "st_two_letters_too", lastTwo: two };
        const lead0 = about[0];
        if (lead0 && "line" in lead0 && lead0.line === "t_one_spelling_two_sounds" && HAS.has("tv_x_two_sounds")) about = [{ line: "tv_x_two_sounds" }, ...about.slice(1)];
      }
      // "This is how we write… /b/" is a speech template (docs/SPEECH_TEMPLATES.md, s_how_write); its fallback is the line
      // and the sound, as before
      const reveal: Say[] = writeId === "tv_how_we_write" ? speak("s_how_write", { sound: p }, { show: "petal", at: () => heroRef.current }) : writeId ? [...L(writeId), { gap: 200 }, S()] : [S()];
      const write: Say[] = [...reveal, ...(about.length ? [{ gap: 400 }, ...about] : [])];
      bundle.current = [...bundle.current, { gap: 400 }, ...write];
      const ok = await say(write);
      if (!alive.current) return;
      if (ok) {
        if (item.second) heard(twoSoundsKey(g));
        else if (lettersTold) heard(lettersKey(g));
      }
      await settle();
      if (!alive.current) return;
      setCompanion(null);
      // 6. the child taps the letters and says the sound, twice (the tile is live from the line's first word; faded, the
      //    pulsing letter is the cue, and the line comes after 5 s of quiet)
      bundle.current = [...bundle.current, { gap: 400 }, ...L(script.tap ?? "tv_tap_it_say_short")];
      setStep("letter");
      if (script.tap) void say(L(script.tap));
    })();
  }, []);

  // 8 s with no tap on the letter: "Tap the letter, and say the sound with me… /b/", and the letter glows (a faded
  // instruction comes back first, at 5 s)
  const faded = !script.tap;
  useQuietLadder(step === "letter" && taps < 2, faded ? [5000, 11000, 23000] : [8000, 20000], (k) => {
    if (faded && k === 0) return void say(L(tapsRef.current ? "tv_once_more" : "tv_tap_it_say_short"));
    setHint(true);
    void say([...L("tv_dojo_idle_say"), { gap: 150 }, S()]);
  });
  // Hear it again: this sound's teaching so far, and at the petal its join-in (the question the child is answering, not
  // the lead-in alone: the sweep's replay-stale); the letter's instruction is in the bundle from the letter step on
  useNav({
    again: () => {
      if (!bundle.current.length) return;
      const ask = stepRef.current === "petal" && petalAsk.current.length ? [{ gap: 400 } as Say, ...petalAsk.current] : [];
      return say([...bundle.current, ...ask]);
    },
  });
  useHelp((n) => {
    const s = stepRef.current;
    if (s === "cast" || s === "write") return; // Sensei is explaining it: Help never cuts her off
    if (s === "letter" || s === "over") {
      if (n > 1) setHint(true);
      return void say([...L("tv_dojo_idle_say"), { gap: 150 }, S()]);
    }
    void say([...L("tv_dojo_help_sound"), { gap: 150 }, S()]);
  });

  /** The petal: the join-in's tap, or (at other times) its sound. While Sensei explains, it nods (SoundBadge `busy`). */
  const tapBadge = () => {
    const w = petalWait.current;
    if (w) {
      petalWait.current = null;
      tapSaid.current = say(S());
      return w();
    }
    void say(S());
  };
  const tapLetter = async (el: HTMLElement) => {
    tileRef.current = el;
    if (stepRef.current !== "letter") return void (stepRef.current !== "over" && nod(el));
    if (tapsRef.current >= 2) return;
    const n = ++tapsRef.current;
    setTaps(n);
    setHint(false);
    const at = crown(el);
    fx.burst(at.x, at.y + 60, "blossoms", 10);
    // each "say it with me" gets a move; it lands on the top edge of the spelling, behind it, and the spelling bounces
    const move = n >= 2 ? ninja.strike(at, { react: false }) : ninja.act(choose<Move>(["jump", "punch", "throw"]), at, { react: false });
    void move.then(() => alive.current && wobble(el));
    // errorless teaching counts gently (Dec2: a part, never an answer): only the level's first new spelling adds to the
    // streak, so the glow still means "you're getting them right"
    const e = n >= 2 && streakOn ? streak.hit({ part: true }) : null;
    if (n === 1) {
      await say(S());
      await sleep(450);
      if (!alive.current || tapsRef.current !== 1) return;
      // "Tap it once more, and say it again." (once per save, unless the child is tapping again already; after that
      // the second mini petal is the cue). An instruction: it counts as said once it has started
      if (HAS.has("tv_once_more") && onceInSave(ONCE_MORE)) {
        heard(ONCE_MORE);
        void say({ line: "tv_once_more" });
      }
      return;
    }
    setStep("over");
    await say(S());
    if (!alive.current) return;
    sfx.good();
    if (e?.tierUp) await ninja.linesDone();
    // the lesson's first sound: "Good, you said that sound really well." (the ninja bows); later ones go straight on
    if (first && HAS.has("tv_said_well") && alive.current) {
      void ninja.act("bow", undefined, { react: false });
      praiseBy("tv_said_well");
      praisedAt = performance.now();
      await say({ line: "tv_said_well" });
    }
    if (alive.current) onNext();
  };

  const letterLive = step === "letter" && taps < 2;
  (window as any).__snState = { scene: "learn", game: "learn", next: step === "petal" ? "Hear the sound" : letterLive ? g : null, busy: !(step === "petal" || letterLive), streak: streak.n };
  // the petal is centred on its own, then steps aside (left) as the ninja writes
  const total = heroW + LEARN_GAP + SPELL_W;
  const shift = total / 2 - heroW / 2;
  const aside = step !== "listen" && step !== "petal";
  const busy = step === "listen" || step === "cast" || step === "write";
  return (
    <div className={`dj-learn ${shown ? "dj-front" : ""}`} style={{ left: MID - total / 2, top: LEARN_TOP, width: total }}>
      <div className="row dj-learn-row" style={{ gap: LEARN_GAP }}>
        <div ref={heroRef} className={`dj-badge ${aside ? "aside" : ""}`} style={{ width: heroW, height: heroH, translate: aside ? "0 0" : `${shift}px 0` }}>
          <SoundBadge p={p} tier="hero" size={HERO} intro={item.isNew} from={from} wait={step === "petal"} busy={busy} passive />
          {/* the petal's button (< x >'s pair of petals, Dec7, is one button and says /ks/): while Sensei waits for the
              join-in ("Tap the petal, and say it with me.") the tap is the child's answer, so it isn't marked as a sound
              replay (data-nav="sound") then; at other times it says the sound, and nods while Sensei explains */}
          <button className="dj-pairtap" aria-label="Hear the sound" data-nav={step === "petal" ? undefined : "sound"} {...tapProps(() => (busy ? nod(heroRef.current) : tapBadge()))} />
        </div>
        <div ref={spot} className="dj-spot" style={{ width: SPELL_W, height: heroH }}>
          {shown && (
            <span className="dj-reveal">
              <Tile g={g} size="xl" onTap={tapLetter} className={letterLive ? "hint" : step === "over" ? "right" : ""} withButtons={g.length > 1 || g === "x"} />
            </span>
          )}
        </div>
      </div>
      {/* the two mini petals under the letters: they light as the child taps and says the sound (Dec6) */}
      {shown && (
        <div className="dj-tally" style={{ left: heroW + LEARN_GAP + SPELL_W / 2, top: heroH / 2 + 132 }}>
          <SoundRow ps={[p, p]} lit={taps} gap={14} />
        </div>
      )}
      {companion && (
        <div className="dj-companion pop-in" style={{ left: -120, top: 40 }}>
          <SoundBadge p={companion.p} tier="pop" passive dim={companion.dim} />
        </div>
      )}
      <TapHint show={hint && letterLive} style={{ left: heroW + LEARN_GAP + SPELL_W / 2 + 40, top: heroH / 2 + 20 }} />
    </div>
  );
}
type LearnItem = LessonItem;

// ---------------------------------------------------------------- Ninja Eyes: which of these is how we write the sound?
/** When Ninja Eyes last said its full correction ("That's how we write… · We need…"), performance.now() ms. */
const findFixes: number[] = [];
function Find({ t, index, pool, opener, tip, fade, wedo, onFramed, onNext, onMiss }: { t: Seg; index: number; pool: string[]; opener: Say[] | null; tip: boolean; fade: boolean; wedo: boolean; onFramed: (() => void) | null; onNext: (struggled: boolean, firstTry: boolean) => void; onMiss: () => void }) {
  const { g, p } = t;
  const choices = useRef(shuffle([g, ...shuffle(pool.filter((x) => x !== g && GRAPHEMES[x] !== p && !(g === "u" && x === "w"))).slice(0, 3)])).current;
  const [state, setState] = useState<Record<string, "wrong" | "right">>({});
  const [blown, setBlown] = useState(false);
  const [live, setLive] = useState(false); // the question has started: taps count
  const [petal, setPetal] = useState(!opener); // the nav row's petal (its slot waits empty during the opener)
  const [glow, setGlow] = useState(false);
  const [paw, setPaw] = useState(false);
  const liveRef = useRef(false);
  const solved = useRef(false);
  const correcting = useRef(false);
  const attempts = useRef(0);
  const helped = useRef(false);
  const struggled = useRef(false);
  const tiles = useRef<Record<string, HTMLElement | null>>({});
  const alive = useAlive();
  // the stems rotate (SCRIPT_FIXES A5): "Which of these is the way we write…", "Find how we write…", "Now find how we write…"
  // (a lesson of five or more sounds: from the fifth item, after two right first time in a row, the stem drops and the
  // petal swells with its sound alone, SCRIPT_STYLE §5 "Question stems rotate or drop"; a miss brings the stems back.
  // Three stems over seven quick items would say one of them three times in a minute)
  const stem = index < 4 ? stemFor(STEMS.write, index, (id) => HAS.has(id)) : STEMS.write[1 + (index % 2)];
  const S: Say = { sound: p, show: "petal" };
  // (the first stem is a speech template, s_which_write: "Which of these is the way we write /b/?"; its fallback is the
  // line and the sound. The rotating stems stay lines until they have templates of their own)
  const full: Say[] = stem === "tv_which_write" ? speak("s_which_write", { sound: p }, { show: "petal" }) : [...L(stem), { gap: 150 }, S];
  const question: Say[] = fade ? [S] : full;
  const tipSaid = useRef(false);
  // Hear it again (the nav row, with the sound's petal beside it): the question, and the petal's tip if it was said here
  // (Hear it again always asks the whole question, even when it was faded to the sound)
  useNav({ again: () => say([...(tipSaid.current ? [...L("tv_petal_hint"), { gap: 300 }] : []), ...full]), sound: petal ? p : null });
  useEffect(() => {
    (async () => {
      if (opener?.length) {
        await say(opener);
        if (!alive.current) return;
        await settle();
      }
      setPetal(true);
      // "Tap the petal if you want to hear the sound again." before the first question, once per save in the dojo
      // (SF C10: never cut off; the petal pops into the nav row and pulses)
      if (tip) {
        await sleep(350);
        if (!alive.current) return;
        const el = document.querySelector(".nav-layer .nav-sound");
        [0, 900, 1800].forEach((ms) => setTimeout(() => alive.current && pulse(el, 1.14, 500), ms));
        const ok = await say({ line: "tv_petal_hint" }, { protect: true });
        if (ok) {
          heard(PETAL_HINT);
          tipSaid.current = true;
        }
        if (!alive.current) return;
      }
      liveRef.current = true;
      setLive(true);
      await say(question);
      // a first meeting's first item is a we do: the answer glows after 2 s
      if (wedo) setTimeout(() => alive.current && !solved.current && setGlow(true), 2000);
    })();
  }, []);
  const rephrase = () => say([...lines(["tv_listen_sound_again"]), { gap: 150 }, S, { gap: 300 }, ...L("tv_which_way_write_it")]);
  const point = () => {
    struggled.current = true;
    setGlow(true);
    setPaw(true);
    void say(L("tv_idle_point"));
  };
  // the quiet ladder (§5.5): 8 s the question in other words, 16 s the paw points at the answer, 24 s "Take your time."
  useQuietLadder(live && !solved.current, [8000, 16000, 24000], (k) => {
    if (correcting.current || solved.current) return;
    if (k === 0) void rephrase();
    else if (k === 1) point();
    else void say(L("tv_take_time"));
  });
  useHelp((n) => {
    if (!liveRef.current || solved.current || correcting.current) return;
    helped.current = true;
    if (n === 1) void rephrase();
    else if (n === 2) {
      setGlow(true);
      void say(L("tv_look_glow"));
    } else point();
  });
  // multi-letter spellings are wider: keep the row inside the play area
  const wide = choices.reduce((s, c) => s + Math.max(150, c.length * 54 + 44), 0) + 30 * (choices.length - 1) > 740;
  const tap = async (c: string, el: HTMLElement) => {
    if (solved.current) return;
    if (!liveRef.current || correcting.current) return nod(el);
    recordFoundation({ target: { kind: "letter", letter: g, sound: p, task: "sound-to-letter" }, result: choices.length === 1 ? "unassessed" : c === g ? "correct" : "incorrect", source: "choice", support: attempts.current === 0 && !helped.current ? "independent" : "guided" });
    if (c === g) {
      solved.current = true;
      setState((s) => ({ ...s, [c]: "right" }));
      setGlow(false);
      setPaw(false);
      sfx.good();
      onFramed?.();
      // the strike comes down on the top edge of the spelling they found (the row sits above the effects, so the
      // impact blooms behind it and its letters stay readable while its sound is said); the shockwave blows the
      // others back. Then the hit is counted: after the move has started (see the top of the file).
      void ninja.strike(crown(el), { move: findMove(streak.tier, choices[0] === g), react: false }).then(() => {
        if (!alive.current) return;
        wobble(el);
        setBlown(true);
      });
      const e = attempts.current === 0 ? streak.hit() : null;
      // the model answer is the feedback (/b/); a praise line at most every second right answer (TEACHER_SCRIPT §5.3),
      // and none soon after the ninja's own tier line (it is this answer's praise: the rhythm starts again from it)
      // (nor when the next right answer brings one: two praise lines would stack within a few seconds)
      const up = tierOf(streak.n + 1);
      const soon = up > streak.tier && tierLineEarned(up, { answers: streak.answers + 1, levelAnswers: streak.levelAnswers + 1 });
      // (nor within a few seconds of the last praise: a quick child answers two items in under 5 s)
      const lately = performance.now() - praisedAt < PRAISE_GAP / FAST;
      const praise = praiseFor({ game: "find", every: 2, replaced: !!e?.tierUp || soon || lately, keptGoing: attempts.current > 0, helped: helped.current });
      if (praise) praisedAt = performance.now();
      if (e?.tierUp) praiseBy("streak");
      await say([S, ...(praise ? [{ gap: 250 }, { line: praise } as Say] : [])]);
      if (e?.tierUp) await ninja.linesDone();
      recordFoundation({ target: { kind: "letter", letter: g, sound: p, task: "letter-to-sound" }, result: "unassessed", source: "practice", support: "guided" });
      if (alive.current) onNext(struggled.current, attempts.current === 0 && !helped.current);
    } else {
      attempts.current++;
      if (attempts.current >= 2) struggled.current = true;
      onMiss();
      correcting.current = true;
      const lead = wrongAnswer(); // "Keep going, ninja." first (from a streak), so the correction ends on the target
      setState((s) => ({ ...s, [c]: "wrong" }));
      sfx.wrong();
      // "That's how we write… /d/" (its petal pops above the tapped tile) · "We need… /b/" (the nav row's swells). A
      // third in a minute rephrases instead (SCRIPT_STYLE §5: no sentence three times in a minute): the tapped tile's
      // sound pops above it, then "Listen to my sound again… /b/ … Which one is the way we write it?"
      const now = performance.now();
      while (findFixes.length && now - findFixes[0] > 60_000 / FAST) findFixes.shift();
      const rephrased = findFixes.length >= 2 && HAS.has("tv_listen_sound_again") && HAS.has("tv_which_way_write_it");
      const fix = rephrased
        ? { echo: [] as Say[], say: [{ sound: GRAPHEMES[c] ?? p, show: "petal", at: el } as Say, { gap: 400 }, ...lines(["tv_listen_sound_again"]), { gap: 150 }, S, { gap: 300 }, ...L("tv_which_way_write_it")] }
        : pictureCorrection({ game: "find", tapped: c, target: g, attempt: attempts.current, p, at: el });
      if (!rephrased) findFixes.push(now);
      await say([...lead, ...fix.echo, ...fix.say]);
      correcting.current = false;
      if (!alive.current) return;
      if (attempts.current >= 2) setGlow(true);
      setState((s) => {
        const n = { ...s };
        delete n[c];
        return n;
      });
    }
  };
  const at = choices.indexOf(g);
  (window as any).__snState = { scene: "find", game: "find", next: live && !solved.current ? g : null, busy: !live || correcting.current || solved.current, streak: streak.n };
  const target = tiles.current[g];
  const tr = paw && target ? stageRect(target) : null;
  return (
    <>
      <div className="center dj-front" style={{ left: MID, top: "44%" }}>
        <div className="row" style={{ gap: wide ? 22 : 30, flexWrap: "nowrap" }}>
          {choices.map((c, i) => (
            <div
              key={c}
              ref={(el) => void (tiles.current[c] = el)}
              className={`drop-in ${state[g] === "right" && c !== g ? "dj-dim" : ""} ${blown && c !== g ? "dj-blown" : ""}`}
              style={{ animationDelay: `${i * 0.08}s`, "--dir": i < at ? -1 : 1 } as CSSProperties}
            >
              {/* (before the question the tiles are pictures: a tap nods them, and nothing answers early) */}
              {live ? (
                <Tile g={c} size="lg" state={state[c] ?? (glow && c === g ? "hint" : "")} onTap={(el) => tap(c, el)} style={wide ? ({ "--size": "132px" } as CSSProperties) : undefined} />
              ) : (
                <span className="dj-wait" {...tapProps((el) => nod(el))}>
                  <Tile g={c} size="lg" style={wide ? ({ "--size": "132px" } as CSSProperties) : undefined} />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      {tr && <TapHint show style={{ left: tr.x + tr.w / 2 - 53, top: tr.y + tr.h * 0.55 }} />}
    </>
  );
}

// ---------------------------------------------------------------- Word Building: hear the word, build it sound by sound, read it back
/** Where the row of slots sits (below the word card). */
const SLOT_ROW: CSSProperties = { position: "absolute", left: MID, top: 332, translate: "-50% 0" };
/** The word card (stage px). */
const CARD = { x: MID - 150, y: 90, w: 300, h: 214 };
/** The tortoise and the rabbit (drawn by the nav layer: TEACHER_SCRIPT §9.6) sit above the word card's top-right
 *  corner, beside its speaker, and clear of the petals that pop above the slots and the letters (a reminder, a
 *  correction, Help's "Look! I'll show you…"): the layer places the pair once, and can't see those coming. The live
 *  rabbit (Move 1) stands a little further right, over the corner of the speaker's circle. */
const SPEED = { at: { x: CARD.x + CARD.w + 78, y: 104 }, liveAt: { x: CARD.x + CARD.w + 140, y: 98 } };

/** A letter after a tier-up that is being held for the finished word (see Build): energy gathers into the ninja, a
 *  little more each time, so it reads as charging up for the power-up that comes with the word. Silent: the letter's
 *  sound is what the child should hear. */
function gather(k: number) {
  const s = document.querySelector(".dojo .ninja-spot");
  const r = s ? stageRect(s) : { x: 40, y: 340, w: 250, h: 362 };
  if (!r.w) return;
  const c = { x: r.x + r.w / 2, y: r.y + r.h - r.w * 0.66 };
  const cols = COLS[tierOf(streak.n)];
  fx.implode(c.x, c.y, cols, 12 + k * 5, 150 + k * 20, 22);
  fx.glow(c.x, c.y, cols, 4 + k * 2, 50, 1.5, 24);
}

/** Bank tile size: the row must fit between the ninja and the Help corner (x 340-1100). */
function bankSize(bank: string[]): { size: number; gap: number } {
  for (const [size, gap] of [[104, 16], [96, 14], [88, 12], [80, 10]] as const) {
    const w = bank.reduce((s, g) => s + Math.max(size, g.length * size * 0.36 + 42), 0) + gap * (bank.length - 1);
    if (w <= 730) return { size, gap };
  }
  return { size: 76, gap: 8 };
}
/** The question for a slot (Word Building's stems: TEACHER_SCRIPT §3.16 A, §3.26 C). */
/** "What's the first sound?" / next / last: the speech template w_next_q (its fallback: first_sound_q, next_sound_q,
 *  last_sound_q). The word has just been named ("Your word is… hip."), so the question doesn't name it again. */
const slotAsk = (i: number, n: number): Say[] => speak("w_next_q", { pos: i === 0 ? "first" : i === n - 1 ? "last" : "next" });

type BuildMode = "demo" | "wedo" | "you";
interface BuildResult { firstTry: boolean; struggled: boolean; demo?: boolean }
/**
 * Word building: hear the word, build it sound by sound in slots, then read it back with sound buttons lit.
 * - `demo`: Sensei builds it (TEACHER_SCRIPT §3.16 A's narrated demo, on the level's first word): the child taps the
 *   word card to hear it, Sensei says it slowly and finds the sounds (the paw points, the ninja launches), and the
 *   child finds the last one. On the full form a Ready hold follows (the paw replays the demo).
 * - `wedo`: "Here's our word…", each slot's answer glows after 2 s; `you`: "Your word is…".
 * The read-back is fast and slow's (TEACHER_SCRIPT §9.2): the rabbit read-back on the session's first built word,
 * Sounds~Write's "Say the sounds, and read the word." on the 2nd and 4th (and after any miss), Sensei's pair on the 3rd
 * and 5th, then the sounds and the word; the tortoise and the rabbit light on every slow and fast part.
 */
export function Build({
  word, bank: bankIn, index, mode, opener, frame: frameSay, ready, hand, byYourself, handFades = false, leftRight: sayLeftRight = true, stems, glowFirst, neighbours: explainNeighbours, framesOnAnswer, isLast, onFramed, onNext, onMiss, level,
}: {
  word: Word; bank: string[]; index: number; mode: BuildMode; opener: Say[] | null; frame: Say[]; ready: { line: string; once?: "ready:first" | "ready:paw" } | null; hand: "your" | "our"; byYourself: boolean;
  handFades?: boolean; leftRight?: boolean;
  stems: boolean; glowFirst: boolean; neighbours: boolean; framesOnAnswer: boolean; isLast: () => boolean; onFramed: () => void; onNext: (r: BuildResult) => void; onMiss: () => void; level: Level;
}) {
  const bank = useRef(bankIn).current;
  const { size, gap } = bankSize(bank);
  const [filled, setFilled] = useState<string[]>([]);
  const filledRef = useRef<string[]>([]);
  const [landed, setLanded] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [lit, setLit] = useState<number | "all">(-1);
  const [done, setDone] = useState(false);
  const [hop, setHop] = useState(false);
  const [glow, setGlow] = useState<string | null>(null);
  const [paw, setPaw] = useState<Pt | null>(null);
  const [cardLive, setCardLive] = useState(false);
  const wasLive = useRef(false); // (the card pops in once, not again when the join-in ends)
  if (cardLive) wasLive.current = true;
  const [busy, setBusyS] = useState(true);
  const busyRef = useRef(true);
  const setBusy = (b: boolean) => {
    busyRef.current = b;
    setBusyS(b);
  };
  const finishing = useRef(false);
  const correcting = useRef(false);
  const flights = useRef<Promise<void>[]>([]);
  const inAir = useRef(0); // letters on their way to a slot
  // letters since a tier-up was held for the finished word (see the top of the file): the ninja gathers power
  const gathering = useRef(0);
  const misses = useRef(0);
  const slotMisses = useRef(0); // misses on the current slot: 1st → listen again, 2nd → show
  const helped = useRef(false);
  const struggled = useRef(false);
  const answered = useRef(false);
  const demoing = useRef(false);
  /** the demo waits for the child's last letter ("Can you find the last one?") */
  const demoLast = useRef<(() => void) | null>(null);
  /** the demo waits for the child's tap on the word card */
  const cardWait = useRef<(() => void) | null>(null);
  const glowTimer = useRef(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const alive = useAlive();
  const isAlive = () => alive.current;
  // Adjacent consonants (units 8-10, NARRATIVE_AUDIT F12): at the first word in the level with sounds next to each
  // other (the Dojo puts one first: clusterFirst), once per unit, arrows point at the slots of the sounds that sit
  // next to each other as each is heard in the slow word, and Sensei says so. Taps wait for it: it is the one time
  // the idea is explained.
  const unit = adjacentUnit(level.units);
  const pairs = adjacentSlots(word.segs);
  const [neighbours] = useState(() => (explainNeighbours && !!unit && pairs.length > 1 && isDue(`adjacent:u${unit}`, "once") ? `adjacent:u${unit}` : null));
  const [pointAt, setPointAt] = useState<number[]>([]);
  // what was explained for this word, for Hear it again (the speaker beside the card): the adjacent-sounds explanation
  // (with its arrows), the game's opener on the level's first word, "Your word is…" and the word
  const explained = useRef<{ neighbours: Say[] | null; lead: Say[] }>({ neighbours: null, lead: [] });
  // the hand-over: "Here's our word…" (a we do), "Your word is…"; "Here's your next word…" takes turns with it; once the
  // stems have faded, just the word (SCRIPT_STYLE §5). Neither sentence comes a third time in a minute: at a quick
  // child's pace the other one, or just the word (lineStarts)
  // ("Your word is {word}." and "Your next word is {word}." are speech templates: w_your_word, w_your_next_word; their
  // fallbacks are the lines and the word, as before)
  const [handId] = useState<string | null>(() => {
    if (hand === "our") return "tv_our_word";
    if (handFades) return null;
    return (index % 2 === 0 ? ["tv_your_word", "tv_next_word"] : ["tv_next_word", "tv_your_word"]).find(roomFor) ?? null;
  });
  const handWord: Say[] =
    handId === "tv_our_word"
      ? [...L(handId), { gap: 150 }, { word: word.text }]
      : handId
        ? speak(handId === "tv_next_word" ? "w_your_next_word" : "w_your_word", { word: word.text })
        : [{ gap: 600 }, { word: word.text }]; // (a beat first: the new card pops in, so the word isn't heard as the last one's)
  const handSay: Say[] = [...(byYourself ? [...L("tv_by_yourself_build"), { gap: 350 } as Say] : []), ...handWord];
  const tileEl = (g: string): HTMLElement | null => {
    const j = bank.indexOf(g);
    return (bankRef.current?.querySelectorAll<HTMLElement>(".tile")[j] as HTMLElement | undefined) ?? null;
  };
  /** the slot's landed letter (a reminder's petal pops above it) */
  const slotTile = (i: number) => (): Element | null => slotsRef.current?.children[i]?.querySelector(".tile") ?? slotRefs.current[i] ?? null;
  const glowLater = (i: number, ms = 2000) => {
    clearTimeout(glowTimer.current);
    glowTimer.current = window.setTimeout(() => alive.current && filledRef.current.length === i && !finishing.current && setGlow(word.segs[i]?.g ?? null), ms);
  };
  /** the paw points at an element (Sensei's demo, or the 16 s idle point) */
  const pointPaw = (el: Element | null, demo?: string) => {
    if (!el) return setPaw(null);
    const r = stageRect(el);
    setPaw({ x: r.x + r.w / 2 - 53, y: r.y + r.h * 0.5 - 10 });
    if (demo) navLog({ kind: "paw", id: demo });
  };

  /** "These sounds sit next to each other…" with the slow word: each neighbour's arrow appears as its sound is heard. */
  const sayNeighbours = async (): Promise<boolean> => {
    const nb: Say[] = [{ line: "audit_neighbours" }, { gap: 300 }, { stretch: word.text }, { gap: 450 }];
    explained.current.neighbours = nb;
    setPointAt([]);
    const c = nextClip(`stretch:${word.text}`, 8000);
    const said = say(nb);
    void c.then((clip) => {
      if (!clip) return setPointAt(pairs);
      const el = (performance.now() - clip.start) * FAST;
      (SLOW_TIMES[word.text] ?? []).forEach((t, i) => pairs.includes(i) && setTimeout(() => alive.current && setPointAt((s) => [...s, i]), Math.max(0, t * 1000 - el)));
    });
    const ok = await said;
    if (alive.current) setPointAt([]);
    return ok;
  };

  // ---- the demo (§3.16 A: "I start, you finish"), on the level's first word of a first meeting or a later day's recap
  /** Put bank tile `g` into slot `i`: the ninja's move carries it (Sensei's demo uses the calm spell). */
  const putTile = (g: string, el: HTMLElement, i: number, move: Deliver): Promise<void> => {
    filledRef.current = [...filledRef.current, g];
    setFilled(filledRef.current);
    const slot = slotRefs.current[i];
    inAir.current++;
    const flight = (slot ? deliver(el, slot, move, alive) : Promise.resolve()).then(() => {
      inAir.current--;
      // the flying copy has just gone: put the letter in its slot before the next paint, or it blinks out for a
      // frame (a state update from here would otherwise render a frame later)
      if (alive.current) flushSync(() => setLanded((s) => new Set(s).add(i)));
    });
    flights.current.push(flight);
    return flight;
  };
  const clearBoard = () => {
    filledRef.current = [];
    flights.current = [];
    setFilled([]);
    setLanded(new Set());
    setDone(false);
    setHop(false);
    setLit(-1);
    setGlow(null);
  };
  /** The card join-in: "This card is my word. Tap it, and hear the word." (live from its first word; 8 s the hand
   *  points at it; 12 s Sensei taps it herself). */
  const cardJoinIn = async (live: () => boolean) => {
    let tapped = false;
    const waitTap = new Promise<void>((r) => (cardWait.current = () => ((tapped = true), r())));
    setCardLive(true);
    const lineDone = say(L("tv_word_card"));
    const ladder = (async () => {
      await lineDone;
      await settle();
      for (const [ms, then] of [[8000, "hand"], [4000, "go"]] as const) {
        await Promise.race([waitTap, sleep(ms)]);
        if (tapped || !live()) return;
        if (then === "hand") pointPaw(document.querySelector(".dojo .dj-cardtap"));
      }
    })();
    await Promise.race([waitTap, ladder]);
    cardWait.current = null;
    setCardLive(false);
    setPaw(null);
    if (live()) await say({ word: word.text }); // the card speaks
  };
  const onCard = () => {
    const w = cardWait.current;
    if (!w) return;
    cardWait.current = null;
    sfx.tap();
    pulse(document.querySelector(".dojo .dj-card"), 1.06, 380);
    w();
  };
  /** The read-back's parts: the tiles' sounds, each lit as it is said (the tortoise steps on each), and the whole word
   *  with every tile lit and the gold arrow sweeping under it (the rabbit hops on it). */
  const tileSounds = (): Say => ({ sounds: [...word.segs], gap: 300, show: "tile", onSeg: (k) => alive.current && setLit(k) });
  const fastWord = async () => {
    setLit("all");
    void sweepUnder(slotsRef.current, 900);
    await say({ word: word.text });
    if (alive.current) setLit(-1);
  };
  const sayTheSounds = async (lead: Say[]) => {
    navSpeed("slow");
    await say([...lead, ...(lead.length ? [{ gap: 250 } as Say] : []), tileSounds()]);
    navSpeed(null);
  };
  const runDemo = async (live: () => boolean, o: { join: boolean }): Promise<boolean> => {
    demoing.current = true;
    setBusy(true);
    if (o.join && HAS.has("tv_word_card")) await cardJoinIn(live);
    else await say({ word: word.text });
    if (!live()) return false;
    // "I say it slowly…" (the ninja cups its ear; the tortoise steps on each sound)
    if (ninja.mounted) ninja.pose("listen");
    await say([...L("tv_i_say_slowly"), { gap: 150 }, { stretch: word.text }]);
    if (ninja.mounted) ninja.pose(null);
    if (!live()) return false;
    const hearN = word.segs.length === 2 ? "st_hear_two" : word.segs.length === 3 ? "st_hear_three" : null;
    if (hearN && HAS.has(hearN)) {
      [...(bgRef.current?.children ?? [])].forEach((el, i) => setTimeout(() => pulse(el, 1.1, 420), 300 + i * 260));
      await say({ line: hearN });
      if (!live()) return false;
    }
    // Sensei finds the sounds: the paw points at each letter, and the ninja launches it onto its line
    const upto = word.segs.length - (o.join ? 1 : 0);
    for (let i = 0; i < upto; i++) {
      if (!live()) return false;
      if (i === 0) await say(L("tv_first_is"));
      if (!live()) return false;
      const el = tileEl(word.segs[i].g);
      pointPaw(el, `build:${word.text}:${i}`);
      await sleep(750);
      setPaw(null);
      if (!live() || !el) return false;
      await Promise.all([putTile(word.segs[i].g, el, i, "carry"), say({ sound: word.segs[i].p, show: "tile" })]);
      await sleep(250);
    }
    if (o.join) {
      // "I start, you finish": the last letter is the child's (its answer glows after 2 s)
      const i = word.segs.length - 1;
      const got = new Promise<void>((r) => (demoLast.current = r));
      setBusy(false);
      void say(L("tv_you_find_last"));
      glowLater(i);
      while (live() && demoLast.current) await Promise.race([got, sleep(500)]);
      demoLast.current = null;
      setBusy(true);
      if (!live()) return false;
    }
    await Promise.all([...flights.current, sleep(400)]);
    if (!live()) return false;
    // "Now let's say the sounds… and read the word." /a/ /m/ [am]
    setDone(true);
    await sayTheSounds(L("tv_lets_say_read"));
    if (!live()) return false;
    await fastWord();
    demoing.current = false;
    return live();
  };

  const prompt = async () => {
    setBusy(true);
    if (opener?.length) {
      explained.current.lead = opener;
      await say(opener);
      if (!alive.current) return;
      await settle();
    }
    if (neighbours) {
      if (await sayNeighbours()) heard(neighbours);
      if (!alive.current) return;
    }
    if (mode === "demo") {
      if (!(await runDemo(isAlive, { join: true }))) return;
      if (ready) {
        // the full form (or a recap after 21 days or a struggle): "Now let's build one together. Are you ready?"; the
        // paw shows the demo again
        // (▶, the speaker and the paw stand in the right-hand column: in the nav row they covered the letter bank's
        // tiles, which stay live through the hold; the sweep's covered-target and overlapping-targets)
        const how = await holdReady("build", {
          at: "column",
          ask: [{ line: ready.line }],
          again: () => say([...frameSay, ...(frameSay.length ? [{ gap: 300 } as Say] : []), { line: ready.line }]),
          show: async (live) => {
            clearBoard();
            await sleep(350);
            if (live()) await runDemo(live, { join: false });
          },
        });
        if (!alive.current || how === false) return;
        framed("build", ready);
      }
      await sleep(300);
      if (alive.current) onNext({ firstTry: true, struggled: false, demo: true });
      return;
    }
    // "Your word is… [hip]" (the letters wait until the word has been said: SF C12)
    explained.current.lead = [...(index === 0 ? opener ?? [] : []), ...(index === 0 && opener?.length ? [{ gap: 300 } as Say] : []), ...handSay];
    await say(handSay);
    if (!alive.current) return;
    setBusy(false);
    if (stems) void say(slotAsk(0, word.segs.length));
    if (glowFirst || mode === "wedo") glowLater(0);
  };
  useEffect(() => void prompt(), []);
  /** Hear it again: the word, with what was explained for it (the arrows point at the neighbours again). Not while the
   *  word is first being given, nor once it is built (it is being read back). During the card join-in, the card's tap. */
  const replay = async () => {
    // (during the card join-in, Hear it again says the instruction again; the card's own tap answers it)
    if (cardWait.current) return void say(L("tv_word_card"));
    if (busyRef.current || finishing.current) return;
    const { neighbours: nb, lead } = explained.current;
    if (nb) {
      setPointAt(pairs);
      const ok = await say(nb);
      if (!alive.current) return;
      setPointAt([]);
      if (!ok) return;
    }
    const i = filledRef.current.length;
    await say([...(lead.length ? lead : [{ word: word.text } as Say]), ...(stems && i < word.segs.length ? [{ gap: 250 } as Say, ...slotAsk(i, word.segs.length)] : [])]);
  };
  useNav({ again: replay, againAt: "own", speed: SPEED });

  // the quiet ladder while building (§5.5): 8 s "Let's listen again. What can you hear here?" and the word (or fast and
  // slow's "Let's say it the slow way first…", in turn); 16 s the paw points at the letter; 24 s "Take your time, ninja."
  const stuckSay = (): Say[] => fsStuckSay("build", word.text, { attempt: 1 }) ?? listenAgain(filledRef.current.length);
  /** "Let's listen again. What can you hear here?" and the word; a third time in a minute (a child stuck on word after
   *  word), "Let's listen again…", the word, and the slot's own question instead ("What's the first sound?"), so the
   *  same sentence never comes three times in 60 s (the verify re-run, C5-L and C6-L) */
  const listenAgain = (i: number): Say[] =>
    roomFor("tv_listen_here") || !HAS.has("tv_slow_again")
      ? [...L("tv_listen_here"), { gap: 150 }, { word: word.text }]
      : [...L("tv_slow_again"), { gap: 150 }, { word: word.text }, { gap: 300 }, ...slotAsk(i, word.segs.length)];
  /** Fast and slow's stuck recap ("Let's say it the slow way first…"): the tortoise lights as it starts, and walks on
   *  the sounds the child finds next (TEACHER_SCRIPT §9.4: "the tortoise walks"). The plain word after it (FS1: the
   *  child does the segmenting) is the fast way, and the nav lights the rabbit on it by itself. */
  const withTortoise = (items: Say[]): Say[] => {
    if (items.some((it) => "line" in it && it.line.startsWith("tv_fs_stuck_"))) navSpeed("slow");
    return items;
  };
  useQuietLadder(!busy && !done, [8000, 16000, 24000], (k) => {
    if (busyRef.current || correcting.current || finishing.current) return;
    const need = word.segs[filledRef.current.length];
    if (!need) return;
    if (k === 0) void say(withTortoise(stuckSay()));
    else if (k === 1) {
      struggled.current = true;
      setGlow(need.g);
      pointPaw(tileEl(need.g));
      void say(L("tv_idle_point"));
    } else void say(L("tv_take_time"));
  }, [filled.length]);
  useHelp(
    (n) => {
      if (busyRef.current || finishing.current || correcting.current) return;
      const i = filledRef.current.length;
      const need = word.segs[i];
      if (!need) return;
      helped.current = true;
      if (n === 1) void say(withTortoise(stuckSay()));
      else if (n === 2) {
        setGlow(need.g);
        void say(L("tv_look_glow"));
      } else {
        // "Let me show you… /m/": its petal pops above the slot, and the letter glows (SD r26)
        struggled.current = true;
        setGlow(need.g);
        void say([...L("help_look"), { gap: 100 }, { sound: need.p, show: "petal", at: () => slotRefs.current[filledRef.current.length] ?? null }]);
      }
    },
    [filled.length],
  );

  /** The finished word: stars (or a cheer) from the ninja, and the letters hop in a wave when they land. */
  const finisher = () => {
    const tier = streak.tier;
    const m: Move = tier === 0 ? "cheer" : choose<Move>(tier === 1 ? ["jump", "cheer"] : ["flip", "jump"]);
    const row = slotsRef.current;
    const c = row ? centre(stageRect(row)) : { x: MID, y: 382 };
    fx.burst(c.x, c.y, "blossoms", 24);
    if (m === "cheer" || !row) {
      void ninja.act("cheer");
      setHop(true);
    } else void ninja.act(m, row, { react: false }).then(() => alive.current && setHop(true)); // it bursts behind the word
  };

  /** The read-back (TEACHER_SCRIPT §9.2): which one fsReadback() says. */
  const readBack = async () => {
    const kind = fsReadback("build", { afterMiss: misses.current > 0 });
    if (kind === "rabbit") {
      // Move 1: "Let's say the sounds, the slow way…" /h/ /i/ /p/ · "Now tap the rabbit, and read the word fast." · the
      // child's tap · [hip] (the sweep) · an idea line ("There's a slow way to say a word, and a fast way.")
      await sayTheSounds(L("tv_fs_say_sounds_slow"));
      if (!alive.current) return;
      fsSaid("tv_fs_say_sounds_slow", "build");
      // the prompt starts, and the rabbit goes live as it does (its spotlight lands on "rabbit" in the line under way):
      // a rabbit that grows before a word has been said would be tapped before the child has been asked
      const ask = L("tv_fs_rabbit_read");
      if (ask.length) {
        const started = nextClip("tv_fs_rabbit_read", 4000);
        void say(ask);
        await started;
        if (!alive.current) return;
      }
      const how = await rabbitTap({ slow: () => say(tileSounds()) });
      if (!alive.current) return;
      fsSaid("tv_fs_rabbit_read", "build");
      if (how === "timeout") await say(L("tv_fs_now_fast"));
      await fastWord();
      const idea = fsIdea("build", "build", { tight: true });
      if (idea && alive.current && (await say({ line: idea }))) fsSaid(idea, "build");
      return;
    }
    if (kind === "pair") {
      // Move 5: "Let's say it the slow way…" [hip, slowly] (each tile lights on its sound) · "And now the fast way…" [hip]
      const [slow, fast] = fsPair();
      const c = nextClip(`stretch:${word.text}`, 8000);
      const said = say([...L(slow), { gap: 150 }, { stretch: word.text }, { gap: 400 }, ...L(fast), { gap: 100 }]);
      void c.then((clip) => {
        if (!clip) return;
        const el = (performance.now() - clip.start) * FAST;
        (SLOW_TIMES[word.text] ?? []).forEach((t, i) => setTimeout(() => alive.current && setLit(i), Math.max(0, t * 1000 - el)));
      });
      await said;
      if (!alive.current) return;
      return fastWord();
    }
    // Sounds~Write's routine ("Say the sounds, and read the word.") on the 2nd and 4th and after a miss; then just the
    // sounds and the word
    await sayTheSounds(kind === "sw" ? L("say_sounds_read") : []);
    if (!alive.current) return;
    await fastWord();
  };

  const finish = async () => {
    finishing.current = true;
    setBusy(true);
    clearTimeout(glowTimer.current);
    setGlow(null);
    setPaw(null);
    const firstTry = misses.current === 0;
    recordWordSpelt(word, firstTry);
    await Promise.all([...flights.current, sleep(500)]);
    if (!alive.current) return;
    // Dec2: the word is one whole answer (its letters were parts); then a tier-up on the word (the highest, if it
    // crossed two): the ninja powers up and says its line before the read-back (which would cut it off)
    if (firstTry) streak.answer();
    const tierUp = !!ninja.heldTier;
    if (tierUp) await ninja.streakLine();
    gathering.current = 0;
    if (!alive.current) return;
    setDone(true);
    // the first word read back at Word Building's first meeting (lands 1 and 2, once a land): "We start here, and go this
    // way."
    const leftRight = sayLeftRight ? await readThisWay(slotsRef.current, level.world) : false;
    if (!alive.current) return;
    await readBack();
    if (!alive.current) return;
    sfx.great();
    finisher();
    // then at most one thing (SCRIPT_FIXES A7): a spaced "two letters, one sound" reminder with its petal popping above
    // the lit tile (Dec4), or praise (fast and slow's building praise when it is its turn)
    // (not a letters sentence said in the last minute, as a split's correction is: "It's two letters, but it's one sound."
    // for < sh > at 3:01, then again for < ll > 20 s later, script-audit's letters-60s; the reminder waits for a later word)
    const letters = lettersReminder(word.segs, slotTile);
    const due = letters && !letters.say.some((s) => "line" in s && typeof s.line === "string" && saidLately(s.line)) ? letters : null;
    const remind = twoSoundsReminder(word.segs, slotTile) ?? due;
    if (remind && !tierUp && !leftRight) setLit(remind.i);
    await afterWordSay({ tierUp, leftRight, reminder: remind, gemFirst: null, closingNext: isLast(), game: "build", praise: { every: 2, keptGoing: misses.current > 0, helped: helped.current }, fs: fsPraise("build", "build") });
    if (!alive.current) return;
    setLit(-1);
    onNext({ firstTry, struggled: struggled.current });
  };

  const tap = async (g: string, el: HTMLElement) => {
    if (finishing.current) return;
    if (busyRef.current || correcting.current) return nod(el); // the word first, or a correction: felt, never cutting in
    const i = filledRef.current.length;
    const need = word.segs[i];
    if (!need) return;
    if (g === need.g) {
      const firstTry = slotMisses.current === 0; // a glowing hint still counts: it was their tap
      slotMisses.current = 0;
      clearTimeout(glowTimer.current);
      setGlow(null);
      setPaw(null);
      recordSpell(need, misses.current === 0);
      const last = i + 1 === word.segs.length;
      // putTile() starts the ninja's move straight away (before its first await); only then count the hit, so a
      // tier-up's power-up follows the move instead of being cancelled by it
      const flight = putTile(g, el, i, deliveryFor(el, last, inAir.current > 0));
      if (demoing.current) {
        // the demo's last letter: the child finished Sensei's word
        void say({ sound: need.p, show: "tile" });
        const r = demoLast.current;
        demoLast.current = null;
        return r?.();
      }
      // the letter counts at once (its flame lights: a part of the word, Dec2); a tier-up waits for the finished word,
      // because the child's next tap would cut the ninja's line off (every letter's sound interrupts what is said)
      if (firstTry) streak.hit({ defer: true, part: true });
      if (ninja.heldTier) {
        const k = ++gathering.current;
        void flight.then(() => alive.current && gather(k)); // meanwhile the ninja visibly gathers power
      }
      if (!answered.current) {
        answered.current = true;
        if (framesOnAnswer) onFramed();
      }
      // the tile's own voice (no petal: it is the letters' sound), then the next slot's question while stems are on
      const q = !last && stems ? slotAsk(i + 1, word.segs.length) : [];
      void say([{ sound: need.p, show: "tile" }, ...(q.length ? [{ gap: 300 } as Say, ...q] : [])]);
      if (!last && mode === "wedo") glowLater(i + 1);
      if (last) void finish();
    } else {
      misses.current++;
      slotMisses.current++;
      onMiss();
      recordSpell(need, false);
      const same = GRAPHEMES[g] === need.p; // that correction starts "Yes, that's a spelling of that sound too!"
      const split = splitsSpelling(g, need) && !same;
      const lead = wrongAnswer(!same);
      gathering.current = 0;
      correcting.current = true;
      setWrong(g);
      sfx.wrong();
      clearTimeout(glowTimer.current);
      if (slotMisses.current >= 2) struggled.current = true;
      // a split spelling (< s > for < sh >) reveals the right tile at once, a second miss always (SF C5)
      if (revealsNow(g, need, slotMisses.current)) setGlow(need.g);
      // "Keep going, ninja." (from a streak) first, so the last thing heard is the word or the target sound; the petals
      // pop above the tapped tile and the slot (SD r27); a split's explanation is protected (a quick tap can't cut it)
      const fix0 = correctionFor(g, need, word.text, slotMisses.current, word, { wrong: el, slot: () => slotRefs.current[i] ?? null }, { game: "build", item: word.text });
      // (on the first slot, "Let's listen again. What sound comes next?" asks about the wrong slot: "What can you hear
      // here?" instead; on the last slot, after "What's the last sound?", it would too: "Let's listen again…", the word,
      // "What's the last sound?" (the verify round: "What's the last sound?" · a miss · "…What sound comes next?"). And
      // "What can you hear here?" a third time in a minute (a learner missing word after word): "Let's listen again…",
      // the word, then the slot's own question, "What's the first sound?")
      const lastSlot = i === word.segs.length - 1 && i > 0;
      const leadAt = fix0.findIndex((it) => "line" in it && (it.line === "tv_listen_here" || ((i === 0 || lastSlot) && it.line === "audit_listen_next")));
      const lead0 = leadAt >= 0 ? fix0[leadAt] : null;
      const toEnd = lastSlot && !!lead0 && "line" in lead0 && lead0.line === "audit_listen_next" && HAS.has("tv_slow_again");
      const again = toEnd || (leadAt >= 0 && HAS.has("tv_listen_here") && !roomFor("tv_listen_here") && HAS.has("tv_slow_again"));
      // (a split's "It's two letters, but it's one sound." a second time in a minute, when a child splits word after
      // word: "This one's two letters too, but it's just one sound.", so no letters sentence comes twice in 60 s)
      const too = split && saidLately("t_two_letters") && HAS.has("st_two_letters_too") && !saidLately("st_two_letters_too");
      const fix = fix0
        .map((it, j): Say => {
          if (!("line" in it)) return it;
          if (j === leadAt && (again || HAS.has("tv_listen_here"))) return { ...it, line: again ? "tv_slow_again" : "tv_listen_here" };
          if (too && it.line === "t_two_letters") return { ...it, line: "st_two_letters_too" };
          return it;
        })
        .concat(again ? [{ gap: 300 }, ...slotAsk(i, word.segs.length)] : []);
      await say(withTortoise([...lead, ...fix]), { protect: split });
      correcting.current = false;
      if (alive.current) setWrong(null);
    }
  };

  const used = [...filled];
  const nextG = !busy && !correcting.current && !done ? word.segs[filled.length]?.g ?? null : null;
  (window as any).__snState = { scene: "build", game: "build", next: cardLive ? "The word card" : nextG, word: word.text, streak: streak.n, busy: cardLive ? false : busy || done || correcting.current };
  return (
    <>
      {/* Hear it again: beside a picture card, or the speaker card itself (docs/NAVIGATION.md §3.1 "own": the letter bank
          fills the bottom row) */}
      {/* the card join-in (the demo): "This card is my word. Tap it, and hear the word." The card is a picture then, and
          the whole card is one button (the child's answer); Hear it again stands beside it and says the instruction */}
      {cardLive ? (
        <div className={`card dj-card dj-card-live ${word.pic ? "" : "hear-card"}`} aria-hidden="true" style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h }}>
          {word.pic ? <img src={img(`pic_${word.text}`)} alt="" /> : <span className="hear-wave"><Icon.speaker /></span>}
        </div>
      ) : (
        <WordCardAgain word={word} className={`dj-card ${wasLive.current ? "" : "pop-in"}`} style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h }} />
      )}
      {(word.pic || cardLive) && <ReplayButton onReplay={replay} size={100} label="Hear the word" style={{ position: "absolute", left: MID + 172, top: 150 }} />}
      {cardLive && <button className="dj-cardtap" aria-label="The word card" style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h }} {...tapProps(onCard)} />}
      {/* the slots in two layers at the same spot. The empty slots sit below the effects, so a letter's glowing copy
          is seen arriving in them; the letters that have landed sit above the effects (.dj-slots), so sparkles and
          impacts fall behind them and never change a letter's shape, and the finishing stars burst behind the word */}
      <div className="slots dj-slotbg" style={SLOT_ROW} ref={bgRef}>
        {word.segs.map((_, i) => {
          const cls = landed.has(i) ? "filled" : i === filled.length && !done && !busy ? "active" : i < filled.length ? "incoming" : "";
          return (
            <div key={i} ref={(el) => void (slotRefs.current[i] = el)} className={`slot ${cls}`}>
              {pointAt.includes(i) && <SlotPointer />}
            </div>
          );
        })}
      </div>
      <div className="slots dj-slots" ref={slotsRef} style={SLOT_ROW}>
        {word.segs.map((_, i) => {
          const here = landed.has(i);
          return (
            <div key={i} className={`slot ${here ? "filled" : ""}`}>
              {here && (
                <span className={`dj-seat ${hop ? "dj-hop" : ""}`} style={{ animationDelay: `${i * 0.09}s` }}>
                  <Tile g={filled[i]} className={`dj-land ${done ? "right" : ""}`} withButtons={done} lit={lit === i || lit === "all"} />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div ref={bankRef} className={`row dj-bank ${done ? "dj-cleared" : ""}`} style={{ position: "absolute", left: 340, right: 180, bottom: 30, gap, flexWrap: "nowrap" }}>
        {bank.map((g) => {
          const idx = used.indexOf(g);
          if (idx >= 0) used.splice(idx, 1);
          const isUsed = idx >= 0 && !word.segs.slice(filled.length).some((s) => s.g === g);
          return <Tile key={g} g={g} style={size !== 104 ? ({ "--size": `${size}px` } as CSSProperties) : undefined} state={wrong === g ? "wrong" : isUsed ? "used" : glow === g ? "hint" : ""} onTap={(el) => tap(g, el)} />;
        })}
      </div>
      {paw && <TapHint show style={{ left: paw.x, top: paw.y }} />}
    </>
  );
}

export { store };
