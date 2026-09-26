// Super Ninja's game core: the shared types. Design: docs/ARCHITECTURE.md. Contracts and test lists per module:
// docs/architecture/*.md.
//
// The whole game is one pure function over these types:
//
//     step(state, input, env) → { state, outputs, events }
//
// - Inputs come from adapters (a tap, "that utterance finished", "timer idle-1 fired", the app went hidden). Every
//   input carries its time `t`. Nothing under src/core reads the clock, calls Math.random, or touches React, the DOM,
//   window, localStorage, fetch or audio. Randomness comes from a seeded Rng built from a Seed string.
// - Outputs go to adapters: speech, cues (semantic animation moments), timers, persistence. Adapters answer with inputs.
// - Events go into one append-only log per child. The learner model (what the child can do), the ledger (what the
//   child has been told and shown), the rewards and the story state are all pure folds over that log. The transcript
//   is a rendering of it; the audits read it.
// - The same core runs in the browser and headless (scripts/sim), where scripted bots, simulated children, Jev, LLMs
//   and Jonas at a terminal play it as a text adventure.
//
// Rules for this file: types only, no runtime values (defaults live in src/core/config/defaults.ts). Reuse the ids of
// src/content/sw.ts and src/content/phonics.ts; never re-declare them.
//
// Built in stages (docs/ARCHITECTURE.md §14). Codex builds only what a stage lists. When stage 1 starts, this file is
// split into src/core/types/<module>.ts files, re-exported from here, so each stage adds only its own types:
//   Stage 1  audit today's game:   §1 primitives, §2 keys and tags, §3 speech, §5 events, §6 content (LineMeta, LineBook,
//                                  notions), §8 ledger, §14 transcripts and audits
//   Stage 2  learner v1:           §7, and Curriculum from §6
//   Stage 3  the warm-ups headless: §4 inputs, §11 activities (pick, rail, choose), §12 engine (no snapshots), §13 runner
//                                  (scripted, perfect, random and simulated-child players only), and from §10 the
//                                  authoring types a minimal director needs (Chapter, Episode, BeatTemplate, Beat)
//   Stage 4  planner:              §9 (hard constraints first; ranking once real attempts exist)
//   Stage 7  the director drives:  §10
//   Stage 8  Save v2:              CoreSnapshot, StoragePort
//   Deferred, marked "Deferred" where they appear: exact replay (InputEvent), adjust and split, quests and Baron's
//   cadence, Jev and LLM players, cohorts and model-recovery metrics.

import type { PhonemeId } from "../content/phonics";
import type {
  ConceptId, ErrorType, Evidence, GpcKey, ItemSpec, MasteryConfig, MasteryModel, ProficiencyStatus,
  SplitPolicy, SwActivityId, SwLessonId, SwSeg, SwSkillId, SwUnitId, TeachPhase, UnitFacet, WordStructure,
} from "../content/sw";

// =============================================================================================== 1. primitives

/** Milliseconds since the Unix epoch. Virtual in headless runs. Only ever passed IN to the core. */
export type EpochMs = number;
/** A duration in milliseconds. */
export type Ms = number;
/** A probability, 0..1. */
export type Prob = number;
/** Seed text for a deterministic Rng: "<session seed>:<purpose>", e.g. "s7:beat3:planner". */
export type Seed = string;

/** Seeded randomness (kernel/rng.ts: `rng(seed)`). Functions that need randomness take a Seed or an Rng; the same seed
 *  always gives the same sequence, so a run replays exactly. `fork` gives an independent stream, so a new draw in one
 *  place never changes the words chosen in another. */
export interface Rng {
  readonly seed: Seed;
  next(): number;
  int(n: number): number;
  pick<T>(xs: readonly T[]): T;
  shuffle<T>(xs: readonly T[]): T[];
  weighted<T>(xs: readonly T[], weight: (x: T) => number): T;
  fork(label: string): Rng;
}

export type ProfileId = string;
/** `${profile}:s${n}` */
export type SessionId = string;
/** `${session}:b${n}` */
export type BeatId = string;
/** `${beat}:i${n}` (n counts requeued items too) */
export type ItemId = string;
/** One output the core sent and may wait for: "o412". */
export type OutId = string;
export type TimerId = string;
/** An id in src/content/lines.ts (LINES). */
export type LineId = string;
/** Something the child can act on right now. The same ids in React (`data-aff`), in the text adventure and for bots:
 *  "pic:pan", "tile:2:m", "slot:1", "reader:kai", "basket:ck", "sound-btn:0", "page:next", "stone:bamboo/05",
 *  "petal:ae", "option:reception", and the fixed ids "help", "replay", "home", "next". */
export type AffordanceId = string;
export type ChapterId = string;
export type EpisodeId = string;
export type StoryId = string;
export type FrameId = string;
export type TemplateId = string;

/** Limits, budgets and priors are keyed by this, but nobody is asked their age. `ageBandFor(profile, now)`
 *  (kernel/age.ts) derives it at every session.start from the school year and the date it was declared: none, unsure
 *  and unset → 3; R → 4; Y1 → 5; Y2 → 6 (the youngest age in each class), plus one for every 1 September since the
 *  declaration, up to 7+. An exact age entered in the grown-ups area (ProfileChange "age") wins. */
export type AgeBand = "3" | "4" | "5" | "6" | "7+";
/** FIRST_MINUTES §4's saved `schoolYear`, the answer to "Do you go to big school yet?" and "Which class are you in?".
 *  "none" = not yet (the teddy); "unsure" = the "Not sure?" cloud; "unset" = an older save, before the opt-in.
 *  Silence on screen A saves "none"; silence on screen B saves "R". */
export type SchoolYear = "none" | "unsure" | "R" | "Y1" | "Y2" | "unset";
/** FIRST_MINUTES §4 and §10's `band`: the track the child starts on ("none" = the warm-ups W1–W6). The check drops it one
 *  step (Y2 → Y1 → R → none); only a grown-up moves it up. */
export type SchoolBand = "none" | "R" | "Y1" | "Y2";
export type Speaker = "sensei" | "baron" | "kai" | "suki" | "ninja" | "narrator";
export type Hero = "kai" | "suki";

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

// =============================================================================================== 2. keys and tags
// One vocabulary for everything that can be taught, shown, explained, asked about or observed. The ledger, line tags,
// the notion registry, the director and the audits all speak in Keys; the learner model speaks in KcIds (a Key plus a
// direction). That is what turns "was this ever explained?" into a query.

/** Game-side ideas a child must be told (Sounds~Write's four concepts are `concept:1..4`; an idea may belong to one). */
export type IdeaId =
  | "words-are-made-of-sounds" | "fast-and-slow-saying" | "notice-the-sound" | "left-to-right" | "sounds-in-order"
  | "first-sound" | "middle-sound" | "last-sound" | "one-line-per-sound" | "sounds-have-spellings" | "say-the-sounds-read-the-word"
  | "two-letters-one-sound" | "three-letters-one-sound" | "four-letters-one-sound" | "double-consonant" | "one-spelling-two-sounds"
  | "same-sound-different-spellings" | "same-spelling-different-sounds" | "change-one-sound" | "adjacent-consonants"
  | "special-word" | "nonsense-word" | "syllables"
  | "gems-fill-with-practice" | "petals-come-home" | "stickers-for-pictures" | "streak";

/** How to play something, independent of the phonics. Each is a notion (explained by an I do demonstration) and a
 *  knowledge component (`mech:*`), so a mis-tap by a child who hasn't understood the tiles is not blamed on /a/. */
export type MechanicId =
  | "tap-picture" | "tap-tile" | "tile-to-line" | "tap-sound-buttons" | "tap-reader" | "swap-two-taps" | "basket-sort"
  | "run-catch" | "page-turn" | "story-choice" | "help-button" | "replay-button" | "map-stone" | "flower-scroll"
  | "sticker-book" | "timer-bar" | "battle-hearts" | "left-to-right";

export type CharacterId = "sensei" | "baron" | "hero" | "kai" | "suki" | `monster:${string}` | `npc:${string}`;

export type Key =
  | `gpc:${GpcKey}`            // a spelling→sound correspondence: "gpc:ck>k"
  | `sound:${PhonemeId}`
  | `spelling:${string}`
  | `word:${string}`
  | `special:${string}`        // a special (not yet decodable) word, taught whole
  | `concept:${ConceptId}`     // Sounds~Write concepts 1–4 (sw.ts CONCEPTS)
  | `idea:${IdeaId}`
  | `mech:${MechanicId}`
  | `term:${string}`           // a word Sensei uses that a 3–4-year-old may not know: "sound", "spelling", "dojo", "gem"
  | `char:${CharacterId}`
  | `place:${string}`          // "place:bamboo-village", "place:dojo"
  | `fact:${string}`           // a story fact: "fact:petals-scattered"
  | `obj:${string}`            // a game-world object: "obj:world-flower", "obj:petal", "obj:gem", "obj:sticker-book"
  | `lesson:${SwLessonId}`
  | `unit:${SwUnitId}`;

/** How an utterance, a screen, a cue or a demonstration relates to a key. Only `explain` (and, for `mech:` keys, an I do
 *  demonstration) can meet an "explained" need. To the ledger, every other role is a mention at most. */
export type TagRole =
  | "explain"      // says what it is or how it works, in full: "It's two letters, but it's one sound."
  | "demonstrate"  // exp.modelled only: Sensei plays a whole item (the paw builds "mat" while Sensei says the sounds)
  | "model"        // gives this item's answer: "It's this one!" (a mention; it explains nothing)
  | "remind"       // the short form of an earlier explanation: "Two letters, one sound!"
  | "mention"      // names it without explaining: "Tap the gem!", "This is a pan."
  | "show"         // visible on screen: a spelling, a picture, a word, a gem ring
  | "ask"          // the child is asked to do or recall it: "Tap the... pan" (a mention)
  | "use";         // the child did it (from attempts; never an explanation)

export interface Tag { key: Key; as: TagRole }

/** What a need asks of the ledger. "explained": at least one completed full explanation; or, for a `mech:` key, an I do
 *  demonstration; or an assumed entry (taught at school). "mentioned": any completed exposure (a picture named before
 *  it is asked about). Attempts never meet either. "secure" is not a need: it is a learner status (KcStatus). */
export type NeedLevel = "mentioned" | "explained";

/** A precondition: before this line, screen, frame or machine, the child must have reached `level` on `key`. */
export interface Need {
  key: Key;
  /** default "explained" */
  level: NeedLevel;
  /** also require an explanation or reminder within this many days */
  freshDays?: number;
  /** what the director does if it is unmet (default "insert": explain it first) */
  onUnmet?: "insert" | "remind" | "defer" | "block";
}

// ---------------------------------------------------------------- knowledge components (the learner model's keys)

export type Direction = "read" | "spell";
/** Oral phonological awareness (game-only; sw.ts Decision 3: never counts towards a Sounds~Write unit). */
export type PaSkill = "discriminate" | "oral-blend" | "oral-segment" | "first-sound" | "middle-sound" | "left-to-right";
export type ManipOp = "substitute" | "insert" | "delete";

/** The smallest things the learner model estimates. */
export type KcId =
  | `gpc:${GpcKey}:${Direction}`                          // code, per direction: "gpc:ai>ae:read"
  | `skill:${SwSkillId}:${WordStructure | "poly" | ManipOp}` // "skill:blending:CCVC", "skill:phoneme-manipulation:insert"
  | `pa:${PaSkill}`
  | `sound:${PhonemeId}:hear`                              // hearing this sound in spoken words (oral games)
  | `word:${string}:${Direction}`                          // word-specific (Sticker Book word stickers; which /ae/ in "rain")
  | `special:${string}`
  | `concept:${ConceptId}`                                 // a concept shown in use (choosing between two spellings)
  | `mech:${MechanicId}`;                                  // can the child operate this mechanic?

export type KcFamily = "gpc-read" | "gpc-spell" | "skill" | "pa" | "sound" | "word" | "special" | "concept" | "mech";

/** How an attempt bears on a KC. target: what this decision tests (the slot's GPC; the contrast position).
 *  component: also needed to succeed (the other GPCs of a word being read; the mechanic). context: present but not
 *  needed. One function builds these (curriculum.evidenceFor), so the planner, machines and audits always agree. */
export interface EvidenceRef {
  kc: KcId;
  role: "target" | "component" | "context";
  /** sound position in the word, for credit assignment when the error position is known */
  position?: number;
}

// =============================================================================================== 3. speech and presentation

export type UttPurpose =
  | "exposition"   // story and world: "Baron Muddle blew the petals away"
  | "instruction"  // how to play: "Tap the right picture"
  | "explanation"  // teaching: "This is the way we spell /ae/ in rain"
  | "reminder"     // the short form of an explanation
  | "naming"       // "This is a pan"
  | "prompt"       // this item's question: "Tap the... pan"
  | "model"        // Sensei does it: "/m/ /a/ /p/... I can hear map!"
  | "correction"   // Teaching Through Errors: "Listen again... what do you hear here?"
  | "hint"         // Help button and idle help
  | "praise" | "reward" | "story" | "banter" | "transition" | "meta";

/** One piece of speech. Maps 1:1 onto `Say` in src/engine/audio.ts (the audio adapter is a switch). Serialisable: a
 *  lit sound button is `light: true`, which the adapter turns into `light-seg` cues from `onSeg`. */
export type UttPart =
  | { line: LineId }
  | { word: string }
  | { stretch: string }
  | { sound: PhonemeId }
  | { sounds: SwSeg[]; gapMs?: Ms; light?: boolean }
  | { story: StoryId; page: string }
  | { gap: Ms };

/** The part of an utterance the folds read (ledger, learner, dosage, coverage). Kept for ever (Retention "compact"). */
export interface UtteranceCore {
  who: Speaker;
  purpose: UttPurpose;
  /** what it teaches or presents: its lines' tags (LineMeta) plus the words, sounds and spellings in its parts */
  tags: Tag[];
  /** what a child must already understand to follow it: its lines' needs plus the builder's */
  needs: Need[];
  /** the line ids in `parts`, in order (spliced-speech audit, line counts, rotation) */
  lines: LineId[];
  /** planned duration from the clip manifest (public/a/durations.json); headless time and listening load use it */
  estMs: Ms;
  /** teach.ts moment ("gem:ai>ae"): phrasings rotate by how often the ledger has heard this moment */
  moment?: string;
}

export interface Utterance extends UtteranceCore {
  parts: UttPart[];
  /** transcript and caption text, everything written out: 'Tap the... "pan"', '/m/ /a/ /p/', '"mmmaaat" (slowly)' */
  text: string;
  /** a tap on an answer while this plays counts as an answer and cuts it off (the question itself; never an
   *  explanation, never the naming of pictures) */
  interruptible: boolean;
  /** show target words and sounds in the caption (after a mistake), as audio.ts `reveal` */
  reveal?: boolean;
  variant?: number;
}

/** An exposure older than `recentSessions`: parts and text dropped, everything a fold reads kept. */
export interface CompactUtterance extends UtteranceCore { compacted: true }

/** How to build an utterance; LineBook.utter turns it into an Utterance with text, tags, needs and estMs filled in. */
export type UtteranceSpec =
  | { line: LineId; purpose?: UttPurpose; who?: Speaker }
  | { teach: TeachMoment }
  | { parts: UttPart[]; who: Speaker; purpose: UttPurpose; tags?: Tag[]; needs?: Need[]; interruptible?: boolean };

/** The teach.ts moments, as data (ported to core/content/teach.ts, rotation from the ledger instead of localStorage). */
export type TeachMoment =
  | { m: "intro-petal"; p: PhonemeId }
  | { m: "intro-gem"; gpc: GpcKey; knownWays: number; another: boolean }
  | { m: "new-gem"; gpc: GpcKey; knownWays: number }
  | { m: "same-sound"; p: PhonemeId; known: GpcKey[] }
  | { m: "same-spelling"; g: string; sounds: [PhonemeId, PhonemeId] }
  | { m: "can-be"; a: PhonemeId; b: PhonemeId }
  | { m: "say-here"; p: PhonemeId }
  | { m: "which-sound"; a: PhonemeId; b: PhonemeId }
  | { m: "revisit-flower" };

export type HintKind =
  | "replay"          // the child pressed "Hear it again"
  | "repeat-prompt"   // Sensei asked again (Help press 1; the idle step at 8 s)
  | "listen-again"    // first-miss correction: the word again, stretched
  | "place-of-error"  // "If this was 'sit', this would be /i/. Is it?"
  | "strategy"        // a how-to line said before the prompt on Help press 1, for mechanics that have one
  | "glow"            // the answer glows (we do, Help press 2)
  | "idle-glow"       // the answer glows after silence (8 s, with the question asked again)
  | "point-slot"      // the paw points at the slot to listen for
  | "reduced-choices" // other choices dimmed or removed
  | "told"            // "It's this one!", "This is /k/. Say /k/ here."
  | "paw";            // the paw taps the answer

/** Help level of a hint: 0 replay; 1 repeat-prompt, listen-again, place-of-error, strategy; 2 glow, idle-glow,
 *  point-slot, reduced-choices; 3 told, paw. An answer after level 2+ is "helped" (sw.ts Evidence.helped). */
export type HelpLevel = 0 | 1 | 2 | 3;

export interface Hint { kind: HintKind; at: EpochMs; by: "error" | "help-button" | "replay-button" | "idle" | "phase" }

/** Semantic presentation moments. The core says WHAT happens; the React adapter decides HOW it looks (which ninja
 *  move, which particles; src/ui/Ninja.tsx keeps its choreography). The text adventure prints them in brackets. Every
 *  cue is logged as an `exp.cue` event, so the transcript shows everything we showed. */
export type Cue =
  | { cue: "right"; target: AffordanceId; first: boolean; living?: boolean }
  | { cue: "wrong"; target: AffordanceId }
  | { cue: "hint"; target: AffordanceId; kind: HintKind }
  | { cue: "dim"; targets: AffordanceId[] }
  | { cue: "clear" }
  | { cue: "paw"; target: AffordanceId | null }
  | { cue: "name-card"; target: AffordanceId }          // spotlight the card being named (warm white, FIRST_MINUTES §11)
  | { cue: "echo"; target: AffordanceId }               // a tap during naming: the card is spotlit and says its name again
  | { cue: "too-early"; target: AffordanceId }          // a wiggle: "wait, I'm still talking"
  | { cue: "sound-dots"; target: AffordanceId; n: number; gold?: number[] } // dots under a picture; gold = the noticed sound
  | { cue: "fast-slow"; target: AffordanceId; speed: "fast" | "slow" }       // the elastic card and the sound ribbon
  | { cue: "pocket"; from: AffordanceId; filled: number; of: number }       // a tap-all find flies into its pocket
  | { cue: "rail-light"; target: AffordanceId }                             // the reading light under a card on the rail
  | { cue: "merge"; from: AffordanceId[]; into: string }                   // fish + dog → fish-dog; sun + flower → sunflower
  | { cue: "beads"; lit: number; of: number }                              // FIRST_MINUTES lesson beads
  | { cue: "petal"; p: PhonemeId; to: "met" | "home" }
  | { cue: "reveal-spelling"; slot: number; g: string }
  | { cue: "place-tile"; from: AffordanceId; slot: number }
  | { cue: "light-seg"; index: number }                 // -1 clears
  | { cue: "sweep-lines"; msPerSound: Ms }
  | { cue: "word-done" }
  | { cue: "tier-up"; tier: 1 | 2 | 3 }
  | { cue: "streak-lost" }
  | { cue: "celebrate"; size: "item" | "beat" | "gem" | "petal" | "land" }
  | { cue: "fly"; from: AffordanceId; to: AffordanceId }
  | { cue: "monster"; action: "enter" | "hit" | "charge" | "jump" | "flee"; hp?: number }
  | { cue: "baron"; mood: "cut-in" | "taunt" | "angry" | "defeated" }
  | { cue: "sticker"; word: string; tier: StickerTier }
  | { cue: "gem-energy"; gpc: GpcKey; to: number }
  | { cue: "scene"; bg: string };

/** What was shown to the child, summarised for the transcript and the screen audits. */
export interface ScreenSummary {
  screen: ScreenId;
  /** "two pictures: pan, pin" / "three lines under a picture of a mat; tiles: m a t" */
  text: string;
  affordances: { id: AffordanceId; label: string; kind: Affordance["kind"]; needs?: Need[] }[];
  /** what a child must understand to make sense of what is on screen: a gem ring needs `obj:gem`, a timer bar needs
   *  `mech:timer-bar`. `used-before-explained` checks these like an utterance's needs. */
  needs: Need[];
  /** written text the child is expected to read (decodability audit) */
  print?: { text: string; segs?: SwSeg[]; special?: boolean }[];
}

// =============================================================================================== 4. inputs (adapters → core)

export type ChildAction =
  /** a tap on an affordance. `during`: set by the audio adapter when speech was playing (which output, how much of
   *  it had been heard), so an eager answer's latency is exact; the engine estimates it when absent. */
  | { kind: "tap"; aff: AffordanceId; during?: { out: OutId; heardMs: Ms } }
  /** a tap on nothing, or on something disabled */
  | { kind: "stray"; where: string }
  | { kind: "text"; field: "name"; value: string };

export type GrownUpChange =
  /** the School year row (FIRST_MINUTES §4): records the year only; progress never moves by itself */
  | { kind: "school-year"; year: SchoolYear }
  /** "Start from here" (press and hold): placeAtUnit for that year and term */
  | { kind: "start-from-here" }
  /** an exact age, optional; wins over the age band derived from the school year */
  | { kind: "age"; years: number }
  | { kind: "jump-to"; unit: SwUnitId }
  | { kind: "settings"; settings: Partial<Settings> }
  | { kind: "reset" };

export type CoreInput =
  | { in: "act"; t: EpochMs; action: ChildAction }
  /** an output finished (or was cut off). Adapters ack every `say` and every cue sent with `ack: true`. */
  | { in: "ack"; t: EpochMs; out: OutId; completed: boolean; ms: Ms; missingAudio?: boolean }
  | { in: "timer"; t: EpochMs; id: TimerId }
  | { in: "life"; t: EpochMs; what: "boot" | "hidden" | "visible" | "rotated-away" | "rotated-back" | "quit" }
  | { in: "grown-up"; t: EpochMs; change: GrownUpChange }
  /** Embedded mode, for the migration: an old scene asks the core to run one beat or one activity, and gets control
   *  back with an `embed-done` output. The director is not consulted and the core does not route screens. */
  | { in: "embed"; t: EpochMs; what: BeatTemplate | ActivitySpec };

// =============================================================================================== 5. events (the log)
// One append-only log per profile. Families: session, profile, nav, beat/item, exp (what the child was given),
// obs (what the child did), game (the game's own decisions and rewards), input (raw inputs, for exact replay), sys.

export interface EventBase {
  v: 1;
  /** position in this profile's log, gapless and strictly increasing */
  seq: number;
  t: EpochMs;
  sid: SessionId;
  beat?: BeatId;
  item?: ItemId;
  /** "shadow": reconstructed by the stage 1 bridge from today's scenes (no timing, no hints, no choices). The learner
   *  never folds shadow attempts, and shadow events are never written to a child's IndexedDB (dev and treadmill only). */
  origin?: "shadow";
}

export interface Settings { relaxed: boolean; music: number; captions: boolean; unlockAll: boolean; split: SplitPolicy; timers: boolean }

// ---------------------------------------------------------------- session, profile, navigation

export interface SessionStartEvent extends EventBase {
  kind: "session.start";
  profile: ProfileId;
  build: { app: string; content: string; params: string };
  /** every Rng in the session derives from this, so the session replays exactly */
  seed: Seed;
  device: { kind: "phone" | "tablet" | "desktop" | "headless"; touch: boolean; w: number; h: number };
  player: "child" | `headless:${string}`;
  /** hours since the previous session ended; null for the first */
  gapH: number | null;
  localHour: number;
  /** derived by ageBandFor(profile, t) for this session: every limit and budget in it uses this */
  ageBand: AgeBand;
}
export interface SessionEndEvent extends EventBase {
  kind: "session.end";
  reason: "quit" | "hidden" | "rest" | "budget" | "profile-switch" | "crash" | "run-limit";
  activeMs: Ms;
}
export interface SessionPauseEvent extends EventBase {
  kind: "session.pause" | "session.resume";
  cause: "hidden" | "rotated" | "grown-ups" | "rest";
}

export type ProfileChange =
  | { kind: "created"; name: string }
  | { kind: "hero"; hero: Hero }
  /** the opt-in (child), the September moving-up moment, or the grown-ups' School year row. `at` is the date the age
   *  band counts from. */
  | { kind: "school-year"; year: SchoolYear; at: EpochMs; by: "child" | "silence" | "new-year" | "grown-up" }
  /** the start track; "check" = the first three you-do items dropped it one step (FIRST_MINUTES §10) */
  | { kind: "band"; band: SchoolBand; by: "opt-in" | "check" | "grown-up" }
  | { kind: "age"; years: number; at: EpochMs }
  | { kind: "placed"; unit: SwUnitId; by: "placement" | "jump-ahead" | "grown-up" | "school-year" }
  | { kind: "settings"; settings: Partial<Settings> }
  /** a pre-core localStorage Save (engine/store.ts), imported once; read by the folds as a prior */
  | { kind: "legacy-import"; save: unknown; evidence: Evidence[] };
export interface ProfileEvent extends EventBase { kind: "profile.change"; profile: ProfileId; change: ProfileChange }

export type ScreenId =
  | "setup" | "title" | "profiles" | "film" | "choose-hero" | "opt-in" | "training" | "placement" | "map" | "beat"
  | "reward" | "flower" | "book" | "grown-ups" | "jump-ahead" | "rest" | "finale";
export interface NavEvent extends EventBase { kind: "nav.screen"; from: ScreenId; to: ScreenId; by: "child" | "director" | "grown-up" }

// ---------------------------------------------------------------- beats and items

export interface BeatStartEvent extends EventBase {
  kind: "beat.start";
  beatId: BeatId;
  beatKind: BeatKind;
  chapter: ChapterId;
  episode: EpisodeId;
  template: TemplateId;
  frame?: FrameId;
  /** keys that must be met BEFORE the beat starts (characters, places, facts, dependency roots). Checked at beat.start. */
  requires: Key[];
  /** keys this beat explains itself, in its intro or its I do. They are judged at their first real use inside the beat
   *  (an utterance, screen or cue that needs them, or an attempt that uses them), never at beat.start. */
  introduces: Key[];
  /** why the director built it this way ("inserted idea:fast-and-slow-saying: never explained") */
  why: string[];
  challenge: ChallengeReport;
}
export interface BeatEndEvent extends EventBase {
  kind: "beat.end";
  beatId: BeatId;
  outcome: "complete" | "quit" | "skipped";
  stats: BeatStats;
  result?: ActivityResult;
}

export type ItemOutcome =
  | "independent" // first try, correct, help level ≤ 1: the only outcome stars and Sounds~Write proficiency count
  | "helped"      // correct at the first try after a level 2+ hint (idle glow, glow, reduced choices)
  | "corrected"   // correct after one or more errors
  | "modelled"    // I do, or given away by the protocol after the second error
  | "abandoned";  // the child left, or the item timed out

/** One option as the child saw it: the tiles m a t i s of a dictation bank, the two pictures of an oral item. */
export interface PresentedOption { aff: AffordanceId; value: string; label: string; position: number }

export interface ItemStartEvent extends EventBase {
  kind: "item.start";
  activity: SwActivityId | GameOnlyActivity;
  mechanic: MechanicId;
  phase: TeachPhase;
  /** the full spec, so a replay needs no generator */
  spec: CoreItemSpec;
  /** everything on offer when the item started, left to right (durable: the bank of a dictation lives here) */
  options: PresentedOption[];
  scaffold: Scaffold;
  choices: number;
  /** the planner's P(first-try success); null for I do */
  predicted: Prob | null;
  why: Why[];
  /** a placement or jump-ahead check: evidence only (no ledger change, no reward, no streak) */
  probe?: boolean;
}
export interface ItemEndEvent extends EventBase {
  kind: "item.end";
  outcome: ItemOutcome;
  phase: TeachPhase;
  attempts: number;
  ms: Ms;
  /** it will come back later in the block as you do */
  requeued: boolean;
}

// ---------------------------------------------------------------- exposure: what the child was given

/** Something was said. Written when the adapter acks the utterance, so it records what was HEARD: `completed: false`
 *  means cut off (an eager tap, a route change, the phone turned), which never counts as an explanation. An utterance
 *  that never started is never logged. */
export interface SaidEvent extends EventBase {
  kind: "exp.said";
  out: OutId;
  /** compacted (parts and text dropped) once older than `recentSessions`; the folds read only UtteranceCore */
  utt: Utterance | CompactUtterance;
  completed: boolean;
  heardMs: Ms;
  missingAudio?: boolean;
}
/** Something became visible: logged when an item becomes answerable and on every screen change. Its `screen.needs`
 *  are checked by used-before-explained, and the first exp.shown of an item is a "first real use" of the keys its
 *  question relies on. */
export interface ShownEvent extends EventBase { kind: "exp.shown"; screen: ScreenSummary; tags: Tag[] }
/** A presentation cue was sent (a glow, a name-card spotlight, a sticker, gem energy, a petal). Tags and needs come
 *  from the cue table in core/content (a gem-energy cue shows obj:gem and needs it explained). Retention: durable for
 *  hint, gem-energy, sticker and petal cues; recent for the rest. */
export interface CueEvent extends EventBase { kind: "exp.cue"; out: OutId; cue: Cue; tags: Tag[]; needs: Need[] }
/** Sensei did a whole item (I do). An exposure (tags role "demonstrate"), never an attempt. The only event that counts
 *  as a demonstration: it meets "explained" needs for `mech:` keys. */
export interface ModelledEvent extends EventBase {
  kind: "exp.modelled";
  activity: SwActivityId | GameOnlyActivity;
  mechanic: MechanicId;
  spec?: CoreItemSpec;
  tags: Tag[];
}

// ---------------------------------------------------------------- observation: what the child did

/** What an attempt was about. */
export interface AttemptTarget {
  unit: SwUnitId;
  word?: string;
  segs?: SwSeg[];
  /** spelling: the slot being filled; reading: the position the foil differs at */
  slot?: number;
  sound?: PhonemeId;
  spelling?: string;
  gpc?: GpcKey;
  structure?: string;
  position?: "first" | "middle" | "last";
  /** where the right answer was on screen (left to right), for the position-bias detector */
  answerPosition?: number;
}

export type AttemptResponse =
  | { aff: AffordanceId; value: string; sound?: PhonemeId; spelling?: string; word?: string; screenPosition?: number }
  | { none: "timeout" | "skip" };

/** One decision by the child: Jonas's "after three seconds of staring and two hints, the wrong answer on this word,
 *  this sound, this spelling", as data. Spelling items give one attempt per slot, reading items one per word (gpc =
 *  the spelling at the contrast or error position), pick games one per tap, Sound Swap two per step (which sound
 *  changes, then which spelling). */
export interface Attempt {
  activity: SwActivityId | GameOnlyActivity;
  itemKind: CoreItemKind;
  mechanic: MechanicId;
  phase: TeachPhase;
  /** which decision inside the item: slot (spelling), step (swap chain), page (story); 0 for single-decision items */
  step: number;
  /** 1 = the first try at this step */
  attemptNo: number;
  target: AttemptTarget;
  response: AttemptResponse;
  correct: boolean;
  /** what the wrong answer was instead: feeds confusions, foils and the correction's contrast */
  confusedWith?: { gpc?: GpcKey; sound?: PhonemeId; spelling?: string; word?: string };
  /** Teaching Through Errors classification (sw.ts ErrorType), when wrong */
  errors?: ErrorType[];
  /** live options when the answer was given; 1/choices is the chance of a lucky tap (a slot: tiles left in the bank).
   *  choices ≤ 1 is a forced tap: logged, but never evidence (no BKT update, no Sounds~Write evidence, no grade). */
  choices: number;
  timing: {
    /** since the item (or slot) became answerable */
    shownMs: Ms;
    /** the utterance that asked the question this answers (the prompt, or a correction or hint that re-asked it) */
    askedBy?: OutId;
    /** since the end of `askedBy`; negative when the child answered during the prompt */
    latencyMs: Ms;
    /** time with nothing said and nothing tapped before this answer: Jonas's "staring" */
    idleMs: Ms;
    /** answered while the question was still being said */
    early: boolean;
    /** other taps since the item became answerable (dithering, strays) */
    tapsBefore: number;
  };
  support: {
    /** every hint given on this step before the answer, in order (idle ones included) */
    hints: Hint[];
    level: HelpLevel;
    helpPresses: number;
    replays: number;
    timed: boolean;
    limitMs?: Ms;
  };
  /** the KCs it bears on, with roles (curriculum.evidenceFor) */
  evidence: EvidenceRef[];
  /** the non-content keys the question relied on: the needs of `askedBy` plus `mech:${mechanic}` (filled by the
   *  engine). The ledger's first use and independent use come from these, never from a beat's or frame's keys. */
  uses: Key[];
  /** a placement or jump-ahead probe: evidence only (no ledger change, no reward, no streak) */
  probe?: boolean;
}
/** What a machine reports; the engine fills timing, support and uses from its awaiting record (no machine measures
 *  time). */
export type AttemptDraft = Omit<Attempt, "timing" | "support" | "uses"> & { timed?: boolean; limitMs?: Ms };

export interface AttemptEvent extends EventBase, Attempt { kind: "obs.attempt" }
export interface HelpEvent extends EventBase {
  kind: "obs.help";
  /** presses on this step so far, including this one */
  press: number;
  gave: HintKind;
  during: "prompt" | "awaiting" | "correction" | "exposition" | "map" | "other";
}
export interface ReplayEvent extends EventBase { kind: "obs.replay" }
/** An idle-ladder step fired (default: at 8 s the answer glows and the question is asked again; at 16 s the paw). */
export interface IdleEvent extends EventBase { kind: "obs.idle"; ms: Ms; step: number; gave: HintKind[] }
/** A tap the core did not take as an answer. Evidence about mechanics and attention, never about phonics. Durable
 *  (small, and the learner folds it). */
export interface IgnoredEvent extends EventBase {
  kind: "obs.ignored";
  aff?: AffordanceId;
  where?: string;
  /** "naming": a tap on a card while Sensei names the cards; with SupportPolicy.earlyTap "echo" it echoes the name */
  why: "too-early" | "naming" | "i-do" | "busy" | "not-a-target" | "paused";
  whileSpeaking: boolean;
  /** The active mechanic, when the tap happened during a teaching demonstration or while busy. */
  mechanic?: MechanicId;
  screenPosition?: number;
}
export type ChoiceKind =
  | "hero" | "school-year" | "story-branch" | "map-stone" | "flower-petal" | "book-word" | "rest" | "speed" | "sticker";
export interface ChoiceEvent extends EventBase { kind: "obs.choice"; choice: ChoiceKind; value: string }

// ---------------------------------------------------------------- the game's own decisions

/** Why the game did what it did: for the annotated transcript, the grown-ups report and "why this word?" */
export interface DecisionEvent extends EventBase {
  kind: "game.decision";
  by: "planner" | "director" | "protocol" | "detector" | "pacing";
  what: string;
  why: string[];
  data?: Record<string, string | number | boolean | null>;
}
/** FIRST_MINUTES §6: "picture" for every picture named in a lesson and played with (recordMet); it upgrades to "word"
 *  (gold edge, spelling shown) once the child reads or spells the word; "shiny" at most once per lesson, authored. */
export type StickerTier = "picture" | "word" | "shiny";
export type Reward =
  /** `shown: false` in the warm-ups: stars are saved so the map unlocks, but the child sees stickers instead */
  | { kind: "stars"; n: 1 | 2 | 3; shown: boolean }
  | { kind: "streak-tier"; tier: 1 | 2 | 3 }
  | { kind: "gem-energy"; gpc: GpcKey; to: number }
  | { kind: "gem"; gpc: GpcKey }
  | { kind: "petal"; p: PhonemeId }
  | { kind: "sticker"; word: string; tier: StickerTier }
  | { kind: "celebration"; what: string };
export interface RewardEvent extends EventBase { kind: "game.reward"; reward: Reward }
export type Milestone =
  | { kind: "unit-started"; unit: SwUnitId }
  | { kind: "unit-passed"; unit: SwUnitId; by: "mastery" | "keep-pace" | "placement" | "jump-ahead"; watch: string[] }
  | { kind: "story-finished"; story: StoryId }
  | { kind: "land-entered"; land: number }
  | { kind: "onboarding"; step: string };
export interface ProgressEvent extends EventBase { kind: "game.progress"; what: Milestone }

// ---------------------------------------------------------------- raw inputs and system

/** Deferred (exact replay). Every input the core received (snapshot + inputs → the same events). Recent only. */
export interface InputEvent extends EventBase { kind: "input"; input: CoreInput }
export interface ErrorEvent extends EventBase { kind: "sys.error"; where: string; message: string }
/** Stage 8. A snapshot was written, with each reducer's own version hash. */
export interface CheckpointEvent extends EventBase { kind: "sys.checkpoint"; reducers: Record<ReducerId, string> }

export type GameEvent =
  | SessionStartEvent | SessionEndEvent | SessionPauseEvent | ProfileEvent | NavEvent
  | BeatStartEvent | BeatEndEvent | ItemStartEvent | ItemEndEvent
  | SaidEvent | ShownEvent | CueEvent | ModelledEvent
  | AttemptEvent | HelpEvent | ReplayEvent | IdleEvent | IgnoredEvent | ChoiceEvent
  | DecisionEvent | RewardEvent | ProgressEvent
  | InputEvent | ErrorEvent | CheckpointEvent;
export type GameEventKind = GameEvent["kind"];
/** An event before the log stamps it (the engine adds v, seq, t and sid, and beat/item when absent). */
export type EventDraft = DistributiveOmit<GameEvent, "v" | "seq" | "t" | "sid">;

/** Retention. "durable": kept for ever. "compact": kept for ever, but once older than `recentSessions` sessions an
 *  exposure keeps only what the folds read (CompactUtterance: lines, tags, needs, purpose) and loses its parts and
 *  text. "recent": kept for the last `recentSessions` sessions only (raw `input` events and cosmetic cues). No fold
 *  reads a recent event, so re-folding a pruned log gives the same learner and ledger. */
export type Retention = "durable" | "compact" | "recent";
/** The folds, each with its own version hash, so a change to one re-folds only that one. */
export type ReducerId = "learner" | "ledger" | "director" | "meta";

// =============================================================================================== 6. content (read-only adapters over src/content)

export interface WordEntry {
  text: string;
  segs: SwSeg[];
  /** the first unit where it is decodable (validator rule unit-tag) */
  unit: SwUnitId;
  structure: string;
  pic?: string;
  /** a 4-year-old names the picture as intended (pic-names.ts): safe for picture-only sound games */
  picSafe: boolean;
  /** first sound as a child names the picture (pic-names.ts), for first-sound games */
  picSaysFirst: boolean;
  /** has a stretched recording in public/a/x */
  stretched: boolean;
  dictationSafe: boolean;
  /** starts with a sound you can stretch (m s f n l r v z sh th, a vowel) */
  continuantStart: boolean;
  special?: boolean;
  nonsense?: boolean;
  /** only for oral games (picture words from any unit; nothing is written) */
  oralOnly?: boolean;
  /** units/*.ts tags: "new", "picture", "dictation-safe", "sort:ai", "review" */
  tags: string[];
}

export interface WordQuery {
  decodableWith?: ReadonlySet<GpcKey>;
  units?: SwUnitId[];
  contains?: GpcKey[];
  picture?: boolean;
  picSafe?: boolean;
  stretched?: boolean;
  firstSound?: PhonemeId;
  maxSounds?: number;
  structures?: string[];
  dictationSafe?: boolean;
  exclude?: readonly string[];
}

export type UnitKind = "pre-code" | "initial" | "bridging" | "ec-sound" | "ec-spelling" | "poly";

export interface UnitContent {
  unit: SwUnitId;
  kind: UnitKind;
  lessons: SwLessonId[];
  newGpcs: GpcKey[];
  structures: string[];
  concepts: ConceptId[];
  target?: { sound?: PhonemeId; spelling?: string };
  sentences: { text: string; maxUnit: SwUnitId; special?: string[] }[];
  chains: { chain: string[]; nonsense: boolean; official: boolean }[];
  poly: { text: string; syllables: string[]; schwa?: number[] }[];
  specialWords: string[];
}

/** The curriculum adapter (core/content/curriculum.ts) over sw.ts, phonics.ts, units/*.ts, stories.ts, pic-names.ts
 *  and the clip manifest. Pure and read-only; the split policy is fixed at construction. */
export interface Curriculum {
  version: string;
  split: SplitPolicy;
  sequence: readonly SwUnitId[];
  index(unit: SwUnitId): number;
  /** the unit n places back (lags: review 1, reading in text 1, dictation 2, EC spelling accuracy 5–7) */
  back(unit: SwUnitId, n: number): SwUnitId | undefined;
  unit(unit: SwUnitId): UnitContent;
  knownAt(unit: SwUnitId): ReadonlySet<GpcKey>;
  firstTaught(gpc: GpcKey): SwUnitId | undefined;
  words(q: WordQuery): readonly WordEntry[];
  word(text: string): WordEntry | undefined;
  /** words differing from `word` by one sound (at `position` if given): foils and Lesson 10 contrasts */
  contrasts(word: WordEntry, o?: { position?: number; known?: ReadonlySet<GpcKey> }): { word: WordEntry; position: number }[];
  /** the KCs an item decision bears on, with roles. The one place this is decided. */
  evidenceFor(item: CoreItemSpec, step: number, mechanic: MechanicId): EvidenceRef[];
  /** the Sounds~Write lessons for a session part at this unit (sw.ts SESSION) */
  lessons(unit: SwUnitId, part: "review" | "current-unit" | "connected-text"): readonly SwLessonId[];
  stories(maxUnit: SwUnitId): readonly { id: StoryId; maxUnit: SwUnitId; land: number; title: string }[];
  /** game-only pre-code material (docs/PEDAGOGY.md) */
  preCode: { minimalPairs: [string, string][]; firstSound: Partial<Record<PhonemeId, string[]>>; middleSound: Partial<Record<PhonemeId, string[]>> };
}

/** Metadata for every line in LINES, in a sidecar (core/content/line-tags.ts) so lines.ts stays as it is while other
 *  agents edit it. A missing or stale entry is an `untagged-line` audit finding, not a failed build, until the director
 *  relies on tags (stage 7). `scripts/sim/tag-lines.ts --missing --stale` drafts meta for new or rewritten lines. */
export interface LineMeta {
  id: LineId;
  /** hash of the line's text and speaker when it was tagged: a rewritten line (new meaning) makes its meta stale */
  hash: string;
  who: Speaker;
  purpose: UttPurpose;
  /** what it teaches or presents */
  tags: Tag[];
  /** what it presupposes */
  needs: Need[];
  /** instructions the child must hold in mind at once; the audit flags more than 2 for under-fives */
  steps?: number;
  /** "routine": Sounds~Write teacher language where repetition is the point; "vary": praise and flavour, rotate */
  repetition: "routine" | "vary";
  /** gives the answer or does the child's job (never before their second try) */
  givesAnswer?: boolean;
}

/** Resolves line ids, durations and tags, and builds utterances. Built from lines.ts + line-tags.ts + durations. */
export interface LineBook {
  has(id: LineId): boolean;
  text(id: LineId): string;
  meta(id: LineId): LineMeta | undefined;
  estMs(part: UttPart): Ms;
  /** fill text, tags (lines' tags + words, sounds and spellings in the parts), needs, lines and estMs */
  utter(spec: UtteranceSpec, o?: { interruptible?: boolean; reveal?: boolean; rotation?: number }): Utterance;
}

/** Clip durations for the headless clock (public/a/durations.json, generated from the mp3 files). */
export interface DurationTable {
  line(id: LineId): Ms | undefined;
  word(text: string): Ms | undefined;
  stretch(text: string): Ms | undefined;
  sound(p: PhonemeId): Ms | undefined;
  story(story: StoryId, page: string): Ms | undefined;
}

// ---------------------------------------------------------------- notions: what the director guarantees is explained

export type Spacing =
  | { after: "beats"; n: number }
  | { after: "sessions"; n: number }
  | { after: "days"; n: number };

/** "Is there something we're only mentioning once, but should mention three times?" as numbers, per notion. */
export interface Dosage {
  /** complete full explanations before the child must first act on it (usually 1) */
  beforeUse: number;
  /** full explanations in total (the "three times") */
  full: number;
  /** the gap before full explanation 2, 3, … (index 0 = before the 2nd) */
  spacing: Spacing[];
  /** the full explanations must be spread over at least this many sessions */
  minSessions: number;
  /** after the full explanations: a short reminder when the notion is used, until retired */
  reminders: "short" | "none";
  /** independent correct uses (at most one per beat, and only when the notion was a need of the question answered)
   *  that retire the reminders. Retirement also needs all `full` explanations given and uses in ≥ minSessions
   *  sessions, so a quick child never retires a notion before its spaced explanations. */
  retireAfter: number;
  /** explain in full again after this long without an explanation or reminder */
  refreshAfterDays?: number;
  /** at most this many explanations and reminders of it per session (no nagging) */
  maxPerSession: number;
}

/** How a notion is explained. The director turns this into utterances or a beat. */
export type Exposition =
  | { kind: "lines"; lines: LineId[]; show?: Key[] }
  | { kind: "teach"; moment: TeachMoment }
  /** a mechanic is explained by an I do demonstration: Sensei plays one item of this activity */
  | { kind: "demo"; activity: SwActivityId | GameOnlyActivity; mechanic: MechanicId }
  | { kind: "story"; story: StoryId; pages: string[] }
  | { kind: "film"; shots: LineId[] }
  /** an authored show-and-tell with cues: FIRST_MINUTES's fast/slow card, "notice the first sound", the rail read */
  | { kind: "script"; steps: ScriptStep[] };

export interface Provider {
  id: string;
  key: Key;
  /** a completed full form is an explanation (a demo, for a mechanic); a short form is a reminder */
  form: "full" | "short";
  exposition: Exposition;
  estMs: Ms;
  needs: Need[];
}

export type NotionKind = "idea" | "concept" | "term" | "mech" | "char" | "place" | "fact" | "obj";

/** A registry entry (core/content/notions.ts) for a non-content key. Content keys (gpc, sound, word, spelling) have
 *  built-in providers (teach.ts moments, naming). */
export interface NotionInfo {
  key: Key;
  kind: NotionKind;
  /** for grown-ups and audits: "'two letters, one sound'", "the Help button" */
  label: string;
  /** explained first, in dependency order */
  dependsOn: Key[];
  providers: Provider[];
  dosage: Dosage;
  /** explained by being on screen while its name is said (a monster appearing; a picture named) */
  selfEvident?: boolean;
  /** never introduce before this unit (two letters, one sound: IC7; same sound, different spellings: BR) */
  notBefore?: SwUnitId;
  /** a child placed at or beyond this unit (placement, declared stage) is assumed to have been taught it at school:
   *  an "assumed" ledger entry, satisfied by a short reminder instead of the full explanation */
  assumedFrom?: SwUnitId;
  sw?: { concept?: ConceptId; lessons?: SwLessonId[] };
  /** children below this age get the full form one extra time */
  gentleUnder?: AgeBand;
}
export type NotionRegistry = Readonly<Record<string, NotionInfo>>;

// =============================================================================================== 7. learner model (what the child can do)

/** 0 again (wrong, timeout); 1 hard (right after help or a retry); 2 good (right first try, slow for this child);
 *  3 easy (right first try, no help, at or below this child's median time). null = not scored (I do, we do). */
export type Grade = 0 | 1 | 2 | 3;

export interface KcState {
  kc: KcId;
  family: KcFamily;
  /** P(learned), Bayesian knowledge tracing. It never decays: forgetting is `recall`, kept apart. */
  pL: Prob;
  tUpdated: EpochMs;
  /** half-life memory: recall = 2^(−(now − tLastRetrieval) / halfLifeH) */
  halfLifeH: number;
  /** the recall clock: the last scored retrieval (you do, first try, a target ref, choices ≥ 2), right or wrong.
   *  Exposures, we do and component references never touch it. */
  tLastRetrieval?: EpochMs;
  /** the last successful scored retrieval. Undefined = never retrieved unaided: no forgetting is modelled yet, and the
   *  planner treats the KC as keep-up once it has been attempted. */
  tLastSuccess?: EpochMs;
  /** grade of the last scored retrieval (0 = lapsed: due at once) */
  lastGrade?: Grade;
  lapses: number;
  firstExposed?: EpochMs;
  firstYouDo?: EpochMs;
  /** exposure counters only; they are never evidence */
  exposures: number;
  explained: number;
  modelled: number;
  /** the session of the last exposure learning step: at most one small step per KC per session, from explain tags
   *  and demonstrations only */
  exposureStepSession?: SessionId;
  /** scored (you-do) opportunities and independent first tries */
  opportunities: number;
  independent: number;
  /** last N grades of scored attempts, newest last */
  recent: Grade[];
  /** EWMA latency of independent successes (fluency, Speed Read readiness) */
  fluencyMs?: Ms;
  /** distinct sessions with scored evidence (mastery must show on more than one day) */
  sessions: number;
  lastSession?: SessionId;
  /** "assumed" = a prior from the declared stage, placement or the legacy save, until evidence arrives */
  source: "observed" | "assumed";
}

export interface WordState { heard: number; seen: number; readOk: number; readTries: number; spellOk: number; spellTries: number; last: EpochMs; firstOk?: EpochMs }
export interface UnitState { unit: SwUnitId; started?: EpochMs; sessions: number; passed?: EpochMs; passedBy?: Extract<Milestone, { kind: "unit-passed" }>["by"] }
export interface LatencyStats { median: Ms; mad: Ms; n: number; recent: Ms[] }

/** Behaviour, not knowledge: pure detectors over the recent attempt window (learner/detectors.ts). */
export interface AffectState {
  guessing: Prob;
  positionBias: { position: number; share: number } | null;
  fatigue: Prob;
  frustration: Prob;
  boredom: Prob;
  errorsInRow: number;
  firstTriesInRow: number;
  activeMsThisSession: Ms;
  strayTapsThisSession: number;
  /** ring of the last `window` scored attempts */
  recent: { t: EpochMs; correct: boolean; latencyMs: Ms; choices: number; screenPosition?: number; level: HelpLevel; early: boolean }[];
}

export interface LearnerState {
  v: 1;
  profile: ProfileId;
  asOf: EpochMs;
  lastSeq: number;
  child: { schoolYear: SchoolYear; schoolYearAt?: EpochMs; band: SchoolBand; ageBand: AgeBand };
  kcs: Record<string, KcState>;
  /** `${direction}:${want}>${got}` → decayed count: "spell:a>i", "read:b>d" (foils, review, corrections) */
  confusions: Record<string, number>;
  words: Record<string, WordState>;
  /** this child's own response times per mechanic: "3 s staring" is judged against these */
  latency: Partial<Record<MechanicId, LatencyStats>>;
  /** Sounds~Write evidence (capped per key) and its roll-up: sw.ts rollUp()/canMoveOn() unchanged */
  evidence: Evidence[];
  sw: MasteryModel;
  units: Record<string, UnitState>;
  /** the current unit (set by unit-started, unit-passed and placed events; the decision is the planner's) */
  frontier: SwUnitId;
  affect: AffectState;
  totals: { sessions: number; activeMs: Ms; attempts: number; items: number; days: string[] };
}

export type KcStatus = "unseen" | "exposed" | "learning" | "move-on" | "secure" | "fading";

export interface BktParams {
  pL0: Prob;
  /** learning per opportunity kind */
  pT: Record<"exposure" | "explained" | "modelled" | "we-do" | "you-do" | "corrected", Prob>;
  slip: Prob;
  /** used when higher than the item's own chance level (1/choices) */
  guessFloor: Prob;
}

export interface LearnerConfig {
  mastery: MasteryConfig;
  bkt: Record<KcFamily, BktParams>;
  weight: {
    phase: Record<TeachPhase, number>;
    /** correct answers after help, by help level 0..3 */
    helpedCorrect: [number, number, number, number];
    retryCorrect: number;
    retryWrong: number;
    /** correct answers faster than this, or during the prompt, with ≥ 2 choices may be guesses */
    rapidMs: Ms;
    rapidFactor: number;
    guessingFactor: number;
    /** extra slip while the mechanic is unknown: slip + mechanicSlip × (1 − pKnown(mech)) */
    mechanicSlip: number;
    /** a bank slot with 2 tiles left, where elimination helps (0.5); slots with ≤ 1 tile are never scored */
    eliminationFactor: number;
  };
  blame: { targetShareWhenLocated: number; componentCreditOnCorrect: number };
  memory: {
    initialHalfLifeH: number;
    minHalfLifeH: number;
    maxHalfLifeH: number;
    /** growth factor per grade for a spaced retrieval: h × factor[g] × (1 + lowRecallBonus × (1 − recall)) */
    factor: Record<Grade, number>;
    lowRecallBonus: number;
    /** retrievals closer than this to the previous one are massed: they don't change the half-life */
    minGapH: number;
    /** pKnown = pL × (rFloor + (1 − rFloor) × recall) once retrieved: forgetting costs at most half (0.5) */
    rFloor: Prob;
    /** assumed priors (taught at school) don't decay below their prior until evidence contradicts them */
    assumedHalfLifeH: number;
    desiredRetention: Prob;
  };
  grade: { slowMads: number };
  secure: { pKnown: Prob; minSessions: number };
  detectors: { window: number; rapidShare: number; positionShare: number; frustrationErrors: number; boredomFirstTry: number };
  evidenceCap: number;
  confusionDecayPerSession: number;
  /** from the band and the date (half a term behind the Sounds~Write pace, FIRST_MINUTES §4): units well before the
   *  expected unit, and up to it; band "none" sets nothing */
  priors: { wellBefore: Prob; upToExpected: Prob; placed: Prob };
}

export interface LearnerEnv { curriculum: Curriculum; cfg: LearnerConfig }

/** core/learner: every function pure. apply(s, e) never mutates s; unknown events return s itself. */
export interface LearnerApi {
  initial(profile: ProfileId, child: LearnerState["child"], env: LearnerEnv): LearnerState;
  apply(s: LearnerState, e: GameEvent, env: LearnerEnv): LearnerState;
  fold(events: Iterable<GameEvent>, env: LearnerEnv, from?: LearnerState): LearnerState;
  grade(a: Attempt, s: LearnerState, env: LearnerEnv): Grade | null;
  /** pL × (rFloor + (1 − rFloor) × recall) once retrieved; pL before the first successful retrieval */
  pKnown(s: LearnerState, kc: KcId, now: EpochMs, env: LearnerEnv): Prob;
  /** from tLastRetrieval only; null when the KC has never been retrieved unaided */
  recall(s: LearnerState, kc: KcId, now: EpochMs): Prob | null;
  /** P(first-try success) of a decision needing these KCs with `choices` live options */
  predict(s: LearnerState, evidence: readonly EvidenceRef[], choices: number, now: EpochMs, env: LearnerEnv): Prob;
  status(s: LearnerState, kc: KcId, now: EpochMs, env: LearnerEnv): KcStatus;
  /** the bridge to sw.ts: an attempt as Evidence records. [] for game-only activities, forced taps (choices ≤ 1) and
   *  shadow attempts. Probes do give evidence (that is their job). */
  toEvidence(a: Attempt, t: EpochMs, env: LearnerEnv): Evidence[];
  canMoveOn(s: LearnerState, unit: SwUnitId): { ok: boolean; reasons: string[]; watch: string[] };
  facet(s: LearnerState, unit: SwUnitId, facet: UnitFacet): ProficiencyStatus;
  /** gem energy 0..1, derived (replaces Save.energy counters) */
  energy(s: LearnerState, gpc: GpcKey, now: EpochMs, env: LearnerEnv): number;
}

// =============================================================================================== 8. ledger (what the child has been told and shown)

/** Separate facts per key, never one ranked level: an attempt, a model ("It's this one!") or a question can never make a
 *  key count as explained. */
export interface LedgerEntry {
  key: Key;
  /** taught at school (school year, placement, legacy save): meets "explained" needs; a short reminder is enough */
  assumed: boolean;
  /** completed full explanations: explain tags on completed exp.said (teach moments and first-sound reveals included) */
  explained: number;
  /** completed I do demonstrations (exp.modelled only); for `mech:` keys these meet "explained" needs */
  demonstrated: number;
  /** completed short forms */
  reminded: number;
  /** completed mentions, shows, asks and models, and cue and screen shows */
  mentioned: number;
  /** explanations and reminders the child talked over or left (completed: false); they count as mentions */
  interrupted: number;
  /** attempts whose `uses` or evidence touched the key. Never meets any need. */
  practised: number;
  /** independent correct you-do uses: at most one per beat, only for keys in the answered question's `uses` */
  usedCorrectly: number;
  /** distinct sessions with an independent correct use (retirement needs ≥ minSessions) */
  correctUseSessions: number;
  lastCorrectUseSession?: SessionId;
  /** the beat of the last credited use (the once-per-beat rule) */
  lastCreditedBeat?: BeatId;
  first?: EpochMs;
  lastExplained?: EpochMs;
  /** at most one full explanation per key per beat: a show spread over several lines counts once */
  lastExplainedBeat?: BeatId;
  lastReminded?: EpochMs;
  /** distinct sessions with a full explanation or demonstration */
  sessions: number;
  lastSession?: SessionId;
  /** beats and sessions started since the last explanation or reminder (spacing) */
  beatsSince: number;
  sessionsSince: number;
  /** explanations and reminders this session (maxPerSession) */
  thisSession: number;
  /** the first real use: the first utterance, screen or cue needing it, or the first attempt using it (never beat.start) */
  firstUsed?: EpochMs;
  /** distinct sessions in which the key was used at all, from the first full explanation on (the dosage window) */
  useSessions: number;
  lastUseSession?: SessionId;
}

export interface Ledger {
  v: 1;
  asOf: EpochMs;
  lastSeq: number;
  session: SessionId | null;
  entries: Record<string, LedgerEntry>;
  /** per line: phrasing rotation and the repetition audit (replaces teach.ts's localStorage counts) */
  lines: Record<LineId, { n: number; last: EpochMs; thisSession: number }>;
  /** teach.ts moment rotation */
  moments: Record<string, number>;
}

export type NotionReadiness =
  | { ready: true; reminderDue: boolean; fullDue: boolean; retired: boolean }
  | { ready: false; missing: "explanation" | "dependency" | "stale" | "interrupted"; needs: Key[] };

/** What the dosage says is owed for a key now. */
export interface DosageDue { key: Key; form: "full" | "short"; reason: "before-use" | "spacing" | "refresh" | "reminder"; overdue: number }

/** core/ledger: pure. */
export interface LedgerApi {
  initial(): Ledger;
  apply(l: Ledger, e: GameEvent): Ledger;
  /** the entry, or an empty one */
  entry(l: Ledger, key: Key): LedgerEntry;
  /** "explained": explained ≥ 1, or (mech: key) demonstrated ≥ 1, or assumed; "mentioned": any completed exposure or
   *  assumed; plus freshness when `freshDays` is set. Attempts never meet a need. */
  meets(l: Ledger, need: Need, now: EpochMs): boolean;
  readiness(l: Ledger, key: Key, now: EpochMs, notions: NotionRegistry): NotionReadiness;
  /** explanations and reminders owed for these keys now (full forms first, capped per session) */
  owed(l: Ledger, keys: readonly Key[], now: EpochMs, notions: NotionRegistry): DosageDue[];
  /** code the child has actually been taught: gpc keys with a completed teach moment or first-sound reveal
   *  (explained ≥ 1), or assumed. Attempts (a probe, a component GPC, a wrong answer) never add to it. */
  taughtCode(l: Ledger): ReadonlySet<GpcKey>;
}

// =============================================================================================== 9. planner (what to practise)

/** Presentation difficulty the planner controls, separately from what is taught. */
export interface Scaffold {
  /** pictures, readers or tiles on offer: 2 on a mechanic's first appearance, then 3, at most 4 in the Initial Code */
  choices: number;
  /** extra tiles beyond the word's own spellings (Sounds~Write Lesson 1 and 5: 0) */
  distractors: number;
  presentation: "whole" | "stretched" | "segmented";
  /** one line per sound under the slots */
  lines: boolean;
  /** only Gem Trials, Speed Read and later battles; never on new code */
  timerMs?: Ms;
  /** leading items in each phase (I do, then we do; the rest are you do) */
  release: { ido: number; wedo: number };
}

export type PlanPurpose = "warm-up" | "teach" | "practise" | "review" | "fluency" | "connected-text" | "assess" | "probe" | "remediate" | "trial";
export type SessionPart = "recap" | "warm-up" | "current-unit" | "review" | "connected-text" | "pre-code" | "trial";

/** A request for one activity block, before items exist. */
export interface BlockRequest {
  id: string;
  activity: SwActivityId | GameOnlyActivity;
  mechanic: MechanicId;
  purpose: PlanPurpose;
  /** the unit the block is about */
  unit: SwUnitId;
  /** the newest unit whose code may appear (lags applied) */
  maxUnit: SwUnitId;
  targets: KcId[];
  n: number;
  /** authored words in order (Bamboo Village pins its words, docs/PEDAGOGY.md); the planner still fills foils,
   *  phases and predictions */
  pinned?: { words: string[]; pairs?: [string, string][]; chain?: string[] };
  scaffold?: Partial<Scaffold>;
  /** mean predicted first-try success of the block's YOU-DO items (teach [0.6, 0.8]; review [0.8, 0.92]) */
  targetSuccess: [number, number];
  /** at most this many keys not yet explained in the ledger */
  maxNewKeys: number;
  needPicture?: boolean;
  seed: Seed;
}

export type Why =
  | { why: "pinned" }
  | { why: "new-code"; gpc: GpcKey }
  | { why: "due"; kc: KcId; recall: number }
  | { why: "weak"; kc: KcId; pKnown: number }
  | { why: "confusion"; a: GpcKey; b: GpcKey }
  | { why: "lag"; rule: string }
  | { why: "remediate"; kc: KcId }
  /** placement and jump-ahead checks only; never added because a beat looked too easy */
  | { why: "probe"; unit: SwUnitId }
  | { why: "requeue"; of: ItemId }
  | { why: "variety" }
  | { why: "filler" };

export interface PlannedItem {
  id: ItemId;
  spec: CoreItemSpec;
  phase: TeachPhase;
  choices: number;
  /** by phase: null for I do; the glow-assisted rate for we do; the model for you do */
  predicted: Prob | null;
  evidence: EvidenceRef[];
  why: Why[];
}

export interface Block {
  request: BlockRequest;
  scaffold: Scaffold;
  items: PlannedItem[];
  /** mean over the you-do items; null when there are none */
  predicted: Prob | null;
  /** why a constraint could not be met ("pool too small for the success band") */
  notes: string[];
}

export interface DueKc {
  kc: KcId;
  /** null: never retrieved unaided (keep-up or lapsed) */
  recall: Prob | null;
  pKnown: Prob;
  overdueH: number;
  /** (desiredRetention − recall) × importance; recall counts as 0 when null */
  urgency: number;
  /** "spelling-lag": an Extended Code spell KC inside the 5–7 unit lag window, watched but not a backlog */
  reason: "spaced" | "lapsed" | "blocking-move-on" | "watch" | "keep-up" | "spelling-lag";
  /** counts towards the due total that throttles new keys (false for spelling-lag) */
  backlog: boolean;
  /** the newest unit it may be reviewed with (lags) */
  reviewUnit: SwUnitId;
}

export interface PacingDecision {
  frontier: SwUnitId;
  /** band "none" and no IC1 evidence yet: the session is the warm-ups W1–W6 (game-only, sw.ts Decision 3) */
  preCode: boolean;
  /** move on now: canMoveOn + pKnown ≥ secure.pKnown for the new read GPCs + evidence from ≥ 2 sessions */
  advance: boolean;
  advanceBy?: Extract<Milestone, { kind: "unit-passed" }>["by"];
  reasons: string[];
  watch: string[];
  /** brand-new keys this session may introduce (small for 3–4 year olds; fewer with a review backlog) */
  newKeyBudget: number;
  reviewShare: number;
  offerJump?: SwUnitId;
  remediate?: KcId[];
}

export interface SessionOutline {
  now: EpochMs;
  budgetMs: Ms;
  pacing: PacingDecision;
  due: DueKc[];
  /** Sounds~Write's session shape (sw.ts SESSION), shortened for home play */
  parts: { part: SessionPart; requests: BlockRequest[] }[];
  why: string[];
}

export interface PlannerConfig {
  /** by purpose, over you-do items: teach (scaffolded new code) and review */
  targetSuccess: Record<"teach" | "review", [number, number]>;
  /** a we-do item's predicted success: the glow shows the answer */
  glowAssisted: Prob;
  newKeysPerBlock: Record<AgeBand, number>;
  choices: { first: number; maxInitialCode: number; max: number };
  release: { first: [number, number]; second: [number, number]; later: [number, number] };
  lags: { review: number; readingInText: number; dictation: number };
  itemsPerBlock: Record<AgeBand, number>;
  sessionMin: Record<AgeBand, number>;
  reviewShare: [number, number];
  keepPaceAfterSessions: number;
  remediateAfterSessions: number;
}

export interface PlannerContext {
  learner: LearnerState;
  ledger: Ledger;
  curriculum: Curriculum;
  learnerApi: LearnerApi;
  learnerEnv: LearnerEnv;
  ledgerApi: LedgerApi;
  now: EpochMs;
  /** from session.start (ageBandFor) */
  age: AgeBand;
  settings: Settings;
  /** words, items and answer positions used recently (no word twice within 5 items; spread answer positions) */
  recent: { words: readonly string[]; items: readonly ItemId[]; answerPositions: readonly number[] };
  msThisSession: Ms;
  cfg: PlannerConfig;
}

/** One generator per item kind: every candidate that meets the request's hard constraints. Ranking is separate. */
export interface ItemGenerator<K extends CoreItemKind = CoreItemKind> {
  kind: K;
  activities: readonly (SwActivityId | GameOnlyActivity)[];
  candidates(req: BlockRequest, ctx: PlannerContext, rng: Rng): (CoreItemSpec & { kind: K })[];
}

/** core/planner: pure. The same request and context always give the same result. */
export interface PlannerApi {
  pacing(ctx: PlannerContext): PacingDecision;
  due(ctx: PlannerContext): DueKc[];
  outline(ctx: PlannerContext, budgetMs: Ms, seed: Seed): SessionOutline;
  scaffoldFor(mechanic: MechanicId, activity: SwActivityId | GameOnlyActivity, ctx: PlannerContext): Scaffold;
  block(req: BlockRequest, ctx: PlannerContext): Block;
  /** at item boundaries only, on the items not yet started: ease off after 2 misses or frustration, step up on
   *  boredom. (Requeueing a failed item is the protocol's job, not this.) */
  adapt(block: Block, done: readonly { item: ItemId; outcome: ItemOutcome }[], ctx: PlannerContext): Block;
  /** P(first-try success) by phase: null for I do; max(model, glowAssisted) for we do; the model for you do */
  predict(spec: CoreItemSpec, choices: number, phase: TeachPhase, ctx: PlannerContext): Prob | null;
}

// =============================================================================================== 10. director (the narrative layer)

export type BeatKind =
  | "film" | "story" | "exposition" | "activity" | "choose" | "reward" | "celebration" | "recap" | "rest" | "screen"
  | "gate" | "session-end";

/** Why an activity is happening in the story, and how it is introduced. Every activity beat has one. */
export interface Frame {
  id: FrameId;
  /** said the first times (per the dosage of the frame's `char:`/`fact:` needs), then `shortPitch` */
  pitch: UtteranceSpec[];
  shortPitch?: UtteranceSpec[];
  /** said after: "The gate is open!" */
  payoff?: UtteranceSpec[];
  /** story facts, characters, places and terms the pitch relies on */
  needs: Need[];
  establishes?: Key[];
  /** Deferred (quests and Baron's cadence come after the director drives) */
  quest?: { arc: string; step: number };
  skin?: Skin;
  music?: string;
  bg?: string;
}

export type ItemSource =
  | { kind: "pinned"; words: string[]; pairs?: [string, string][]; chain?: string[] }
  | { kind: "fixed"; items: CoreItemSpec[]; phases?: TeachPhase[] }
  | { kind: "planned"; n?: number; targets?: KcId[] };

export interface ChoiceSpec {
  records: ChoiceKind;
  question: UtteranceSpec[];
  options: { aff: AffordanceId; label: string; value: string; say?: UtteranceSpec }[];
  /** FIRST_MINUTES's opt-in: every tap echoes its label; the last tap wins after this much quiet (1,500 ms) */
  settleMs?: Ms;
  /** silence: after `afterMs`, choose `value` and say `say` (the opt-in picks "none" after 20 s on screen A) */
  silence?: { afterMs: Ms; value: string; say: UtteranceSpec[] };
}

/** One step of an authored show-and-tell (a `scripted` beat or a `script` provider): Sensei's fast/slow card, "Did you
 *  notice? Sun and sock start with the same sound...", the rail read by Sensei. No answers are accepted. */
export type ScriptStep =
  | { say: UtteranceSpec }
  | { cue: Cue }
  | { wait: Ms }
  /** "Say that sound with me!": a pause for the child to answer aloud (never scored) */
  | { sayWithMe: Ms };

/** Shared by every template. FIRST_MINUTES's time governor: an `optional` template (◇) is skipped when the episode is
 *  more than 5 s behind its target clock (the sum of the earlier templates' `secs`). */
export interface TemplateCommon { id: TemplateId; optional?: boolean; secs?: number }

/** What authors write (core/director/chapters/*.ts, ported from worlds.ts; the warm-ups come from src/content/warmups.ts
 *  through the adapter in core/content/warmups.ts, never by hand). */
export type BeatTemplate = TemplateCommon & (
  | { kind: "film"; shots: LineId[]; establishes: Key[] }
  | { kind: "story"; story: StoryId; needs: Need[]; establishes: Key[] }
  /** explain these notions (the director picks providers and forms from the ledger) */
  | { kind: "exposition"; keys: Key[] }
  /** an authored show-and-tell with cues; `introduces` lists what it explains (the tags on its lines must agree) */
  | { kind: "scripted"; steps: ScriptStep[]; introduces: Key[] }
  | {
      kind: "activity";
      activity: SwActivityId | GameOnlyActivity;
      machine: MachineId;
      mechanic: MechanicId;
      frame: FrameId;
      items: ItemSource;
      scaffold?: Partial<Scaffold>;
      skin?: Skin;
      /** the warm-ups' protocol (no phase lines, glow after 2 s, no requeue, paw moves on) or the default */
      support?: SupportId;
      /** soft length budget; the planner sizes the block to fit */
      budgetMs?: Partial<Record<AgeBand, Ms>>;
    }
  /** filled by the planner at runtime: warm-ups, Sensei's Challenge, connected text */
  | { kind: "planned"; part: SessionPart; frame: FrameId }
  | { kind: "choose"; choice: ChoiceSpec }
  /** `stars: "silent"` in the warm-ups: saved so the map unlocks, never shown (FIRST_MINUTES rule 11) */
  | { kind: "reward"; reward: "episode-stars" | Reward; stars?: "shown" | "silent"; celebrate?: "stickers" | "petal" | "gem"; shiny?: string }
  /** Sounds~Write move-on: if canMoveOn fails, loop to `retry` with a practise-again frame */
  | { kind: "gate"; unit: SwUnitId; retry: TemplateId; frame: FrameId }
  /** a child-driven screen (World Flower, Sticker Book, map): the `screen` machine, whose speech is dosed like a beat's */
  | { kind: "screen"; screen: ScreenId }
);

/** One stone on the map: what today's worlds.ts `Level` is. A few beats in a row, ending in a reward. The director
 *  may insert beats inside it (an explanation, a warm-up, a recap). */
export interface Episode {
  id: EpisodeId;
  stone: { icon: string; label: string };
  beats: BeatTemplate[];
  /** the worlds.ts level it replaces while both exist ("w1-2", "w1-wu1") */
  legacyLevel?: string;
  /** a warm-up lesson built from src/content/warmups.ts WARMUPS[id] */
  warmup?: string;
  /** FIRST_MINUTES's time governor: optional templates are skipped when behind; at the cap the paw finishes the
   *  current template ("Here's the last one!") and the episode closes */
  budget?: { targetMs: Ms; capMs: Ms };
}

export interface Chapter {
  id: ChapterId;
  /** land number on the map (0 = the first minutes, docs/FIRST_MINUTES.md) */
  land: number;
  title: string;
  units: SwUnitId[];
  arc: string;
  /** said or shown on entering the land for the first time */
  enter: BeatTemplate[];
  episodes: Episode[];
  frames: Record<FrameId, Frame>;
}

/** Budgets by age (docs/architecture/director.md has the defaults; Round 13: the first game was far too long). */
export interface BeatLimits {
  /** Sensei's talk before the child can first act */
  talkBeforeActionMs: Ms;
  /** longest stretch of speech with nothing to act on and nothing new on screen: a visual cue (a spotlight, the card
   *  stretching, the sound dots popping) splits a run, so FIRST_MINUTES's fast/slow show is several short runs */
  maxSpeechRunMs: Ms;
  itemsPerBeat: number;
  beatMs: Ms;
  sessionMs: Ms;
  newNotionsPerBeat: number;
  remindersPerBeat: number;
  rewardEveryMs: Ms;
  maxTalkShare: number;
  instructionSteps: number;
}

export type ChallengeBand = "too-easy" | "flow" | "stretch" | "too-hard";

/** How hard a beat is for this child now. Predicted on beat.start; observed values are filled on beat.end. The talk
 *  figures come from Beat.intro plus the machine's pure `estimate`, never from running the engine. */
export interface ChallengeReport {
  /** mean predicted first-try success of the YOU-DO items (null when there are none: no band) */
  predicted: Prob | null;
  observed?: Prob;
  /** which bands apply: teaching new code is scaffolded (0.6–0.8), review should feel easy (0.8–0.92) */
  purpose: "teach" | "review" | "none";
  band: ChallengeBand | null;
  newNotions: Key[];
  newKcs: KcId[];
  reviewKcs: KcId[];
  choices: number;
  release: { ido: number; wedo: number; youdo: number };
  items: number;
  talkBeforeActionMs: Ms;
  maxSpeechRunMs: Ms;
  talkShare: number;
  estMs: Ms;
  timed: boolean;
  sameMechanicRun: number;
  reasons: string[];
}

export interface BeatStats {
  ms: Ms;
  talkMs: Ms;
  talkBeforeActionMs: Ms;
  maxSpeechRunMs: Ms;
  actions: number;
  attempts: number;
  independent: number;
  youDo: number;
  helps: number;
  idleHints: number;
  strayTaps: number;
  longestNoPraiseMs: Ms;
  deadAirMs: Ms;
}

/** A beat ready to play: the template with its frame, the explanations the child still needs, and the activity. */
export interface Beat {
  id: BeatId;
  chapter: ChapterId;
  episode: EpisodeId;
  template: TemplateId;
  kind: BeatKind;
  frame?: FrameId;
  /** pitch, then any explanations and reminders the director inserted, in order */
  intro: Utterance[];
  activity?: ActivitySpec;
  /** film, story, exposition, recap and reward beats */
  body?: Utterance[];
  /** scripted beats: the show-and-tell steps, with their utterances built */
  script?: ScriptStep[];
  outro: Utterance[];
  tags: Tag[];
  /** must be met before beat.start (the director inserts story, film or recap beats BEFORE this one) */
  requires: Need[];
  /** explained inside this beat, in its intro or its I do, before their first real use */
  introduces: Key[];
  challenge: ChallengeReport;
  estMs: Ms;
  why: string[];
}

/** Story continuity: a fold over the log (facts themselves are ledger entries for `fact:*` keys). */
export interface StoryState {
  land: number;
  location: string;
  quests: Record<string, { step: number; done: boolean }>;
  lastVisit: Record<string, EpochMs>;
  baron: { appearances: number; lastBeat?: BeatId };
}

export interface DirectorState {
  chapter: ChapterId;
  cursor: { episode: number; beat: number };
  story: StoryState;
  /** the next beats; the map shows the first as the glowing stone */
  queue: Beat[];
  history: { beat: BeatId; template: TemplateId; kind: BeatKind; outcome: BeatEndEvent["outcome"]; t: EpochMs; stars?: number }[];
  onboarding: { done: string[] };
  session: { id: SessionId; start: EpochMs; beats: number; restOffered: boolean; lastRewardT: EpochMs; talkMs: Ms } | null;
  outline?: SessionOutline;
}

/** Bands over the you-do items' mean predicted success: too-hard < tooHardBelow ≤ stretch < flow[0] ≤ flow ≤ flow[1]
 *  < too-easy. */
export interface ChallengeBands { tooHardBelow: Prob; flow: [Prob, Prob] }

export interface DirectorConfig {
  limits: Record<AgeBand, BeatLimits>;
  /** teach: { 0.5, [0.6, 0.8] }; review: { 0.7, [0.8, 0.92] } */
  bands: Record<"teach" | "review", ChallengeBands>;
  recapAfterDays: number;
  /** Deferred */
  baronEveryBeats: [number, number];
  maxSameMechanicRun: number;
  /** Deferred (adjust and split): until then, a beat outside its limits is reported, and authors fix it */
  maxAdjustments: number;
}

export interface DirectorContext {
  learner: LearnerState;
  ledger: Ledger;
  planner: PlannerApi;
  plannerCtx: PlannerContext;
  ledgerApi: LedgerApi;
  curriculum: Curriculum;
  notions: NotionRegistry;
  lines: LineBook;
  chapters: readonly Chapter[];
  machines: MachineRegistry;
  now: EpochMs;
  age: AgeBand;
  seed: Seed;
  cfg: DirectorConfig;
}

export interface DirectorNote {
  rule: AuditRuleId;
  action: "inserted" | "reminded" | "adjusted" | "split" | "deferred" | "violated";
  detail: string;
  keys?: Key[];
}

/** A guarantee, as ONE predicate used twice: as a guard before a beat runs (the director inserts, adjusts or defers)
 *  and as an audit over a finished log (to catch anything that slipped through). */
export interface Invariant {
  id: AuditRuleId;
  description: string;
  severity: Severity;
  guard?(beat: Beat, ctx: DirectorContext): Violation[];
  audit?(log: readonly GameEvent[], env: AuditEnv): Violation[];
}
export interface Violation {
  rule: AuditRuleId;
  message: string;
  seq?: number;
  beat?: BeatId;
  keys?: Key[];
  fix?: { insert?: Key[]; adjust?: string; defer?: boolean };
}

/** core/director: pure. */
export interface DirectorApi {
  initial(profile: ProfileId, now: EpochMs): DirectorState;
  apply(d: DirectorState, e: GameEvent): DirectorState;
  /** the next beats: obligations (onboarding, story beats unlocked by progress), recap after days away, due warm-up,
   *  the cursor's beat or a planned one, with every explanation it needs inserted first and due reminders attached */
  next(d: DirectorState, ctx: DirectorContext): { director: DirectorState; beats: Beat[]; notes: DirectorNote[] };
  /** what a set of needs requires first, prerequisites first (cycles and gaps are content bugs) */
  resolve(needs: readonly Need[], ctx: DirectorContext): { insert: Provider[]; unresolved: Need[] };
  /** reminders and full explanations owed for these keys, as utterance specs, capped by the beat limits */
  reinforce(keys: readonly Key[], ctx: DirectorContext): UtteranceSpec[];
  /** from Beat.intro and the machine's `estimate`; pure, no engine */
  challenge(beat: Beat, ctx: DirectorContext): ChallengeReport;
  /** Deferred. Reshape a beat outside its band (fewer choices, more we do, easier items, split; or the reverse). */
  adjust(beat: Beat, report: ChallengeReport, ctx: DirectorContext): Beat;
  invariants: readonly Invariant[];
  /** CI, static: build a chapter's beats against a start model (blank, or a persona's) and check every line any path
   *  of each machine can say (`voice`) against the ledger after the beat's intro, plus the hard limits (talk, items,
   *  new notions). Never fails on predicted bands. The dynamic twin, four scripted players through the real engine,
   *  is scripts/sim/check.ts. */
  check(chapter: Chapter, ctx: DirectorContext): DirectorNote[];
}

// =============================================================================================== 11. activities (pure state machines)

export type MachineId = "pick" | "rail" | "build" | "read" | "swap" | "sort" | "story" | "run" | "choose" | "screen";

/** Game-only formats that are not Sounds~Write activities (they never produce Sounds~Write evidence). */
export type GameOnlyActivity =
  | "tutorial" | "left-to-right" | "fast-slow" | "compound-word" | "story-question" | "story-choice" | "choose";

// ---------------------------------------------------------------- items the machines play
// sw.ts ItemSpec covers the Sounds~Write activities and the oral games. These cover the rest: FIRST_MINUTES's warm-ups
// (a first guided tap, tap all, rails, "which did I read?"), story questions and choices.

interface GameItemBase {
  activity: SwActivityId | GameOnlyActivity;
  /** the unit it belongs to; absent before the code (warm-ups) */
  unit?: SwUnitId;
  /** GPCs it is evidence for (usually none) */
  targets: GpcKey[];
}

/** "Tap the sock!": a named picture among named pictures. Evidence: `mech:tap-picture` only. */
export interface TutorialItem extends GameItemBase { kind: "tutorial"; target: string; options: string[] }

/** One choice among options. `answer` absent = no right or wrong (hero, school year, rest, story branch). "Which did I
 *  read?" is a ChoiceItem whose options are two rails. */
export interface ChoiceItem extends GameItemBase {
  kind: "choice";
  options: { value: string; label: string; cards?: string[] }[];
  answer?: string;
}

export interface StoryQuestionItem extends GameItemBase {
  kind: "story-question";
  story: StoryId;
  page: string;
  options: string[];
  answer: number;
}

/** "Tap all the pictures that start with /s/": several right answers, with a pocket for each. Every find and every
 *  wrong tap is an attempt; done when all are found. */
export interface TapAllItem extends GameItemBase {
  kind: "tap-all";
  activity: "oral-first-sound" | "oral-middle-sound";
  how: "start" | "in";
  sound: PhonemeId;
  cards: string[];
  answers: string[];
  /** Reception: write the sound's spelling on the card's first line after each find */
  spell?: boolean;
  /** "Quick!": no naming (every card is known) */
  quick?: boolean;
}

/** Taps in a fixed order: the reading rail (left to right), the tortoise then the rabbit, the rabbit that makes a
 *  compound word. `by: "sensei"` is an I do (exp.modelled). `judged: "order"` makes each tap an attempt on left to
 *  right; "none" is a guided tap on the one pulsing thing (choices 1: logged, never evidence). */
export interface RailItem extends GameItemBase {
  kind: "rail";
  taps: { value: string; label: string; say?: UtteranceSpec }[];
  by: "sensei" | "child";
  judged: "order" | "none";
  /** what the cards merge into afterwards (fish + dog → fish-dog) */
  merge?: string;
}

/** Everything a machine can play. PlannedItem, item.start, evidenceFor and the generators all take this. */
export type CoreItemSpec = ItemSpec | TutorialItem | ChoiceItem | StoryQuestionItem | TapAllItem | RailItem;
export type CoreItemKind = CoreItemSpec["kind"];

/** Game feel around an activity. Pedagogy lives in the machine and the protocol; a skin adds hit points, lanterns or
 *  a timer. */
export type Skin =
  | { kind: "plain" }
  | { kind: "dojo" }
  | { kind: "battle"; monster: string; hp: number; timerMs?: Ms }
  | { kind: "boss"; monster: string; hp: number }
  | { kind: "trial"; gpc: GpcKey; monster: string; timerMs: Ms }
  | { kind: "run"; lanterns: number; speed: number }
  | { kind: "swap-fix" };

/** The Sounds~Write-shaped support every machine shares (docs/PEDAGOGY.md, "Rules that apply to every mini-game";
 *  docs/FIRST_MINUTES.md §3 for the warm-ups). Two policies exist: "default" and "warm-up". */
export interface SupportPolicy {
  /** "Watch me first!" / "Let's do it together!" / "Now it's your turn!" when the phase changes. false in the warm-ups
   *  (FIRST_MINUTES rule 3: Sensei's explanation is the I do; the first tap is the we do; the next is the you do). */
  phaseLines: boolean;
  /** we do: the glow delay per we-do item, in order (default [0, 2000]; warm-ups [2000]). Items past the list: none. */
  wedoGlowMs: Ms[];
  /** "say it with me": a pause for the child to answer aloud */
  sayItWithMeMs: Ms;
  /** you do: what happens after silence, measured from the end of the last asking utterance. Every step is a hint on
   *  the attempt, so a child who waits for the glow is not "independent". Default and warm-ups: at 8 s the answer
   *  glows and the question is asked again; at 16 s the paw. */
  idle: IdleStep[];
  /** 1st error → corrections[0], 2nd → corrections[1] */
  corrections: ["listen-again" | "place-of-error", "reduce-and-model"];
  /** a wrong card plays its own word, held or stretched ("mmmoon… Moon starts with a different sound.") */
  echoWrong: boolean;
  /** Help presses by count: [repeat-prompt, glow, model]. Press 1 says the mechanic's strategy line first, for
   *  mechanics that have one (hint `strategy`, level 1). */
  help: ("repeat-prompt" | "glow" | "model")[];
  eagerAnswers: boolean;
  /** a tap on a card while Sensei names the cards: "wiggle" (too early) or "echo" (it says its name, spotlit) */
  earlyTap: "wiggle" | "echo";
  /** a twice-missed item comes back once as you do (false in the warm-ups) */
  requeueMissed: boolean;
  /** name every picture aloud the first time it appears in the beat, with a name-card cue */
  namePictures: boolean;
  /** Sensei's praise line after at most every n-th right answer, never over a streak beat (warm-ups: 3) */
  praiseEvery: number;
}
export type SupportId = "default" | "warm-up";
/** One idle step. `paw: "tap"` (warm-ups) taps the answer and moves on: the item ends `modelled` and counts as a we do,
 *  not a miss. `paw: "point"` points, and the child still taps (level 3, helped). */
export interface IdleStep { afterMs: Ms; glow?: boolean; reask?: boolean; paw?: "point" | "tap" }

export interface ActivitySpec {
  beat: BeatId;
  activity: SwActivityId | GameOnlyActivity;
  machine: MachineId;
  mechanic: MechanicId;
  items: PlannedItem[];
  scaffold: Scaffold;
  support: SupportPolicy;
  skin: Skin;
  choice?: ChoiceSpec;
  seed: Seed;
}

export interface Affordance {
  id: AffordanceId;
  kind:
    | "picture" | "tile" | "slot" | "reader" | "basket" | "sound-button" | "word" | "option" | "page" | "lantern" | "stone"
    | "petal" | "gem" | "sticker" | "rail" | "speed" | "arrow" | "help" | "replay" | "home" | "next";
  /** what a child perceives, for the text adventure: "picture: pan", "tile: sh", "Kai", "the tortoise" */
  label: string;
  /** the content value: a word, a spelling, a phoneme, an option value */
  value?: string;
  enabled: boolean;
  mark?: "glow" | "dim" | "right" | "wrong" | "used" | "lit" | "paw" | "found" | "pulse" | "spotlight";
  /** left-to-right order among the choices (position-bias detector) */
  position?: number;
  /** what a child must understand to use it (a gem needs `obj:gem`); checked with the screen's needs */
  needs?: Need[];
}

export interface ViewBase {
  phase: TeachPhase;
  progress: { item: number; of: number };
  /** false while Sensei talks, during I do and during animations: taps are then "too early" unless the current
   *  utterance is interruptible */
  accepting: boolean;
  affordances: Affordance[];
  flags: Record<string, string | number | boolean | null>;
}

/** What the React scene renders and the text adventure prints: a pure projection of the machine's state. */
export type ActivityView =
  | (ViewBase & { machine: "pick"; of: "picture" | "tile" | "reader" | "spelling" | "rail"; reveal?: { word: string; segs: SwSeg[]; shown: number[] }; pockets?: { filled: number; of: number } })
  | (ViewBase & { machine: "rail"; next: number; merged?: string })
  | (ViewBase & { machine: "screen"; screen: ScreenId })
  | (ViewBase & { machine: "build"; word: { text: string; pic?: string; listenCard: boolean }; slots: { g: string | null; state: "empty" | "active" | "filled" | "hint" }[]; lit: number; skin: Skin; hp?: { hero: number; monster: number }; timer?: { totalMs: Ms; endsT: EpochMs } })
  | (ViewBase & { machine: "read"; word: { text: string; segs: SwSeg[] }; tapped: number[] })
  | (ViewBase & { machine: "swap"; from: SwSeg[]; to: SwSeg[]; pos: number | null; step: number; of: number })
  | (ViewBase & { machine: "sort"; word: { text: string; segs: SwSeg[] } | null; lit: number | null })
  | (ViewBase & { machine: "story"; story: StoryId; page: string; pageKind: "narr" | "read" | "choice" | "question"; text: string; scene: string })
  | (ViewBase & { machine: "run"; mode: "blend" | "read"; incoming: { aff: AffordanceId; dueT: EpochMs }[]; lanterns: number })
  | (ViewBase & { machine: "choose"; question: string });

/** One step of a machine's script. The engine runs ops in order; a `barrier` op waits for the adapter's ack. */
export type Op =
  | { op: "say"; utt: Utterance; barrier: boolean }
  | { op: "cue"; cue: Cue; barrier: boolean }
  | { op: "sfx"; name: string }
  | { op: "wait"; ms: Ms }
  /** change a view flag when this point of the script is reached (reveal the spelling after the strike lands) */
  | { op: "flag"; key: string; value: string | number | boolean | null }
  /** a response to log; the engine completes it into an obs.attempt and updates the streak */
  | { op: "attempt"; attempt: AttemptDraft }
  /** the engine says a praise line (rotating, never the same twice running) or, when the last attempt took the streak
   *  into a new tier, the tier-up cue and the ninja's streak line instead, so "Ninja power!" never talks over Sensei */
  | { op: "praise"; barrier: boolean }
  | { op: "event"; event: EventDraft }
  | { op: "timer"; id: TimerId; ms: Ms }
  | { op: "cancel-timer"; id: TimerId }
  | { op: "hush" };

/** What the machine waits for once its ops have run. */
export interface AwaitSpec {
  /** the affordances that count as answers now; any other tap is logged as obs.ignored */
  answers: AffordanceId[];
  /** a tap on an answer during the preceding interruptible utterance counts (the eager-answer rule) */
  acceptEarly: boolean;
  /** you do: the idle ladder the engine runs (it calls machine.timer with "idle:<n>") */
  idle: IdleStep[];
  /** the utterance that asked the question, for latency (engine tracks re-asks) */
  askedBy?: OutId;
}

export type MachineThen = { resume: string } | { await: AwaitSpec } | { done: ActivityResult };

/** One transition: the new state, a script to run, then what next. */
export interface MachineStep<S> {
  state: S;
  ops: Op[];
  then: MachineThen;
}

export interface ActivityCtx {
  t: EpochMs;
  learner: LearnerState;
  ledger: Ledger;
  curriculum: Curriculum;
  lines: LineBook;
  age: AgeBand;
  rng: Rng;
  /** the director's resolve + reinforce as utterances (pure). Child-driven screens (the `screen` machine: flower,
   *  Sticker Book, map) call it before each moment they say, so a teach moment on the flower is dosed like a beat's. */
  explainFirst(needs: readonly Need[]): Utterance[];
}

/** A machine's own talk figures, from its naming and prompt utterances (no engine run): the challenge report's input. */
export interface TalkEstimate {
  talkBeforeActionMs: Ms;
  maxSpeechRunMs: Ms;
  /** the whole activity for a perfect child at this child's median latency */
  estMs: Ms;
}

/** A game mechanic as a pure state machine. It never sleeps or reads the clock: it asks for timers and acks and gets
 *  them back as calls, so the browser and the headless runner drive the same code. Every method is total: an input
 *  that makes no sense in the current state returns the state unchanged with no ops. */
export interface ActivityMachine<S> {
  id: MachineId;
  /** every line ANY path can say for this spec, by path: prompt, naming, listen-again or place-of-error, model, each
   *  Help press, each idle step, praise, the skin's lines (help_tiles, battle_oops, timer_intro_*, its_this_one…).
   *  A test drives every path and fails on any line said that is not listed here. */
  voice(spec: ActivitySpec): { path: string; lines: LineId[] }[];
  /** the needs of every line in `voice(spec)` plus the mechanic's: what any path presupposes */
  needs(spec: ActivitySpec): Need[];
  /** pure talk figures from the naming and prompt utterances; ChallengeReport uses this, never an engine run */
  estimate(spec: ActivitySpec, ctx: ActivityCtx): TalkEstimate;
  init(spec: ActivitySpec, ctx: ActivityCtx): MachineStep<S>;
  /** the ops for `tag` have finished */
  resume(s: S, tag: string, ctx: ActivityCtx): MachineStep<S>;
  /** a tap the engine accepted as an answer (or a help / replay press) */
  act(s: S, aff: AffordanceId, ctx: ActivityCtx): MachineStep<S>;
  timer(s: S, id: TimerId, ctx: ActivityCtx): MachineStep<S>;
  /** replace the items not yet started (the engine calls it at item boundaries with planner.adapt's result) */
  replan(s: S, remaining: readonly PlannedItem[]): S;
  view(s: S): ActivityView;
  /** simulated children and bots only: what a perfect child would tap now and what it tests. Never shown to Jev or
   *  an LLM player. */
  oracle(s: S): { answers: AffordanceId[]; evidence: EvidenceRef[]; choices: number; item?: PlannedItem } | null;
}
/** Machines of different state types (method parameters are bivariant, so ActivityMachine<PickState> fits). */
export type MachineRegistry = Readonly<Record<MachineId, ActivityMachine<unknown>>>;

/** The shared teaching protocol (core/activities/protocol.ts) implements I do / we do / you do, naming pictures,
 *  errorless correction, requeueing, the Help ladder and idle help ONCE. Each machine supplies these parts. */
export interface ProtocolParts<I extends CoreItemSpec> {
  /** decisions in the item (slots when spelling, steps in a swap chain); 1 for a pick */
  steps(item: I): number;
  affordances(item: I, step: number, marks: Record<AffordanceId, Affordance["mark"]>): Affordance[];
  /** pictures to name before the prompt (the protocol names each once per beat) */
  pictures(item: I): { aff: AffordanceId; word: string }[];
  prompt(item: I, step: number, phase: TeachPhase, ctx: ActivityCtx): Utterance[];
  /** first miss: back to listening, or place of error when reading */
  listenAgain(item: I, step: number, wrong: AttemptResponse, ctx: ActivityCtx): Utterance[];
  /** second miss: reduce to the answer plus one and model it (build: its_this_one "It's this one! Say it as you put it
   *  here."; picture games: fm_its_this "It's this one!") */
  model(item: I, step: number, ctx: ActivityCtx): Op[];
  /** I do: Sensei's whole demonstration of the item */
  demonstrate(item: I, ctx: ActivityCtx): Op[];
  /** after a right answer (the reveal, "I can hear map", "Say the sounds... and read the word") */
  onRight(item: I, step: number, ctx: ActivityCtx): Op[];
  check(item: I, step: number, aff: AffordanceId): { correct: boolean; response: AttemptResponse; errors?: ErrorType[]; confusedWith?: Attempt["confusedWith"] };
  target(item: I, step: number): AttemptTarget;
  /** Help press n (1: the strategy line, if the mechanic has one, then the question again; 2: glow; 3: the paw).
   *  Never segments a word the child is spelling. */
  help(item: I, step: number, press: number, ctx: ActivityCtx): Op[];
  /** the mechanic's how-to line for Help press 1 ("help_tiles"), if it has one */
  strategy?(item: I, ctx: ActivityCtx): Utterance | null;
}

export interface ItemResult { item: ItemId; phase: TeachPhase; outcome: ItemOutcome; attempts: number; ms: Ms }

export interface ActivityResult {
  items: ItemResult[];
  /** independent you-do items / you-do items; stars count only these */
  independent: number;
  youDo: number;
  stars: 1 | 2 | 3;
  ms: Ms;
  quit: boolean;
}

// =============================================================================================== 12. engine (the whole core)

/** Rewards and unlocks: a fold over the log. */
export interface MetaState {
  hero: Hero | null;
  stars: Record<string, 1 | 2 | 3>;
  gems: GpcKey[];
  petals: PhonemeId[];
  /** in collection order (FIRST_MINUTES §6), each at its best tier */
  stickers: { word: string; tier: StickerTier; t: EpochMs }[];
  stories: StoryId[];
  lands: number[];
  streak: { n: number; tier: 0 | 1 | 2 | 3 };
  seen: Record<string, EpochMs>;
}

export interface ProfileState {
  id: ProfileId;
  name: string;
  hero: Hero | null;
  schoolYear: SchoolYear;
  /** when the school year was declared: ageBandFor counts 1 Septembers from here */
  schoolYearAt?: EpochMs;
  band: SchoolBand;
  /** optional exact age from the grown-ups area */
  age?: { years: number; at: EpochMs };
  settings: Settings;
  created: EpochMs;
}

export interface PendingScript {
  ops: Op[];
  /** index of the op being run */
  at: number;
  /** the barrier output being waited for */
  waitingFor?: OutId;
  then: MachineThen | { beat: "intro-done" | "body-done" | "outro-done" };
}

/** The engine's record of the question being waited on: what fills an attempt's timing and support. */
export interface Awaiting extends AwaitSpec {
  since: EpochMs;
  itemShownT: EpochMs;
  askedEndT?: EpochMs;
  /** the needs of the asking utterance (non-content keys): the attempt's `uses` */
  askedNeeds: Key[];
  lastActivityT: EpochMs;
  hints: Hint[];
  helpPresses: number;
  replays: number;
  tapsBefore: number;
  idleStep: number;
}

export interface RunningBeat {
  beat: Beat;
  stage: "intro" | "activity" | "outro" | "done";
  machine?: { id: MachineId; state: unknown };
  /** view flags set by `flag` ops as the script reaches them (merged into ActivityView.flags) */
  flags: Record<string, string | number | boolean | null>;
  startedAt: EpochMs;
  stats: BeatStats;
}

export interface CoreState {
  v: 1;
  profile: ProfileState | null;
  sid: SessionId | null;
  seq: number;
  /** output counter */
  out: number;
  t: EpochMs;
  seed: Seed;
  screen: ScreenId;
  learner: LearnerState;
  ledger: Ledger;
  director: DirectorState;
  meta: MetaState;
  beat?: RunningBeat;
  script?: PendingScript;
  awaiting?: Awaiting;
  timers: Record<TimerId, EpochMs>;
  /** say outputs sent and not yet acked (exp.said is written from the ack) */
  speaking: Record<OutId, { utt: Utterance; sentT: EpochMs }>;
  caption?: { who: Speaker; text: string };
  paused: boolean;
}

/** What the engine asks the outside world to do. */
export type Output =
  | { out: OutId; kind: "say"; utt: Utterance }
  | { out: OutId; kind: "cue"; cue: Cue; ack: boolean }
  | { out: OutId; kind: "hush" }
  | { out: OutId; kind: "sfx"; name: string }
  | { out: OutId; kind: "music"; track: string | null }
  | { out: OutId; kind: "timer"; id: TimerId; ms: Ms }
  | { out: OutId; kind: "cancel-timer"; id: TimerId }
  | { out: OutId; kind: "preload"; urls: string[] }
  | { out: OutId; kind: "persist"; events: GameEvent[]; snapshot?: CoreSnapshot }
  /** embedded mode: the beat or activity asked for by an `embed` input has ended; the old scene takes its result to
   *  its own reward flow and store.ts (until Save v2) */
  | { out: OutId; kind: "embed-done"; result: ActivityResult };

export interface CoreConfig {
  app: string;
  learner: LearnerConfig;
  planner: PlannerConfig;
  director: DirectorConfig;
  support: Record<SupportId, SupportPolicy>;
  /** cue durations for the headless clock */
  cueMs: Partial<Record<Cue["cue"], Ms>>;
  /** expose view.debug.answers (tests, bots and headless policies only; never for children) */
  debugAnswers: boolean;
  /** during the migration: the machines the core runs; other level kinds stay in the old scenes */
  coreMachines: MachineId[];
  recentSessions: number;
}

export interface CoreEnv {
  curriculum: Curriculum;
  lines: LineBook;
  notions: NotionRegistry;
  chapters: readonly Chapter[];
  machines: MachineRegistry;
  learner: LearnerApi;
  ledger: LedgerApi;
  planner: PlannerApi;
  director: DirectorApi;
  config: CoreConfig;
}

/** The whole core in one pure function. Everything else is plumbing around it. */
export type CoreStep = (s: CoreState, input: CoreInput, env: CoreEnv) => { state: CoreState; outputs: Output[]; events: GameEvent[] };
export type CoreBoot = (args: { snapshot: CoreSnapshot | null; tail: readonly GameEvent[]; t: EpochMs; seed: Seed }, env: CoreEnv) => { state: CoreState; outputs: Output[]; events: GameEvent[] };

export interface MapView {
  land: number;
  stones: { aff: AffordanceId; episode: EpisodeId; icon: string; state: "done" | "next" | "locked" | "replay"; stars?: 1 | 2 | 3 }[];
}

export interface CoreView {
  screen: ScreenId;
  beat?: { id: BeatId; kind: BeatKind; frame?: FrameId; challenge: ChallengeReport };
  activity?: ActivityView;
  map?: MapView;
  caption?: { who: Speaker; text: string };
  affordances: Affordance[];
  hud: { streak: MetaState["streak"]; progress?: number };
  debug: { beat?: BeatId; unit: SwUnitId; seq: number; answers?: AffordanceId[] };
}

/** Stage 8 (Save v2). Until then the core folds the log from scratch at boot, which is cheap. */
export interface CoreSnapshot {
  v: 1;
  profile: ProfileId;
  atSeq: number;
  t: EpochMs;
  /** each reducer's own version hash. A mismatch re-folds only that reducer, lazily after the first frame, from the
   *  durable and compact events (never from recent ones, which may be pruned). */
  reducers: Record<ReducerId, string>;
  learner: LearnerState;
  ledger: Ledger;
  director: DirectorState;
  meta: MetaState;
  profileState: ProfileState;
}

/** The stateful wrapper that adapters, bots and the headless runner hold (core/index.ts createCore). */
export interface GameCore {
  dispatch(input: CoreInput): Output[];
  state(): CoreState;
  view(): CoreView;
  log(): readonly GameEvent[];
  subscribe(fn: () => void): () => void;
  onOutput(fn: (o: Output) => void): () => void;
  /** Embedded mode (stages 5–6): dispatch an `embed` input and resolve with the `embed-done` result. While it runs,
   *  the audio adapter owns say() alone; the old scene renders `view().activity` and plays its own reward after. */
  runBeat(what: BeatTemplate | ActivitySpec): Promise<ActivityResult>;
}

// ---------------------------------------------------------------- ports (implemented by adapters, never by the core)

export interface AudioPort {
  /** queue an utterance (plays after anything already queued); report how it ended */
  play(utt: Utterance, done: (r: { completed: boolean; heardMs: Ms; missingAudio: boolean }) => void, onPart?: (part: number) => void): void;
  /** stop the current utterance and clear the queue */
  hush(): void;
  sfx(name: string): void;
  music(track: string | null): void;
}
export interface PresenterPort {
  /** run a cue's animation; resolves when it has landed */
  cue(c: Cue): Promise<void>;
}
export interface ClockPort {
  now(): EpochMs;
  set(id: TimerId, ms: Ms, fire: () => void): void;
  clear(id: TimerId): void;
}
export interface StoragePort {
  profiles(): Promise<ProfileState[]>;
  load(profile: ProfileId): Promise<{ snapshot: CoreSnapshot | null; tail: GameEvent[] }>;
  append(profile: ProfileId, events: readonly GameEvent[]): Promise<void>;
  saveSnapshot(profile: ProfileId, s: CoreSnapshot): Promise<void>;
  /** the grown-ups "Download play log" button */
  export(profile: ProfileId, sessions: number): Promise<GameEvent[]>;
}

// =============================================================================================== 13. headless runner and players

/** What a player perceives at a decision point: speech as text, the screen as labelled things, the legal actions.
 *  core/text/screen.ts renders it; the terminal, Jev, LLM players and transcripts all use the same rendering. */
export interface PlayerView {
  t: EpochMs;
  /** "Bamboo Village · Listening Ears · 3 of 12 · your turn" */
  header: string;
  screen: ScreenId;
  /** everything said since the player last acted */
  heard: { who: Speaker; text: string; purpose: UttPurpose; completed: boolean }[];
  /** one line per visible thing: "[1] picture: pan", "slots: m _ _" */
  seen: string[];
  affordances: Affordance[];
  /** ms since the child could first act on this question */
  waitingMs: Ms;
  /** the last ~40 lines of the child-level transcript (Jev and LLM state) */
  tail: string[];
}

export type Decision =
  | { act: AffordanceId; afterMs: Ms; note?: string; probs?: Record<string, number> }
  | { wait: Ms; note?: string };

export interface PolicyNote {
  t: EpochMs;
  seq: number;
  kind: "unclear" | "unexplained" | "too-hard" | "bored" | "confused" | "upset" | "delight";
  p: Prob;
  text?: string;
}

export interface PolicyCtx {
  rng: Rng;
  persona: Persona;
  /** the simulated child only (also when the Jev probe watches it) */
  oracle?: ReturnType<ActivityMachine<unknown>["oracle"]>;
}

/** A player. `decide` may be async (an LLM, a person at a terminal). State is explicit, so a seeded run replays.
 *  "jev-probe" (Deferred) is not a player: a simulated child plays, and Jev is asked clarity questions at instruction
 *  moments from the child-level transcript of what was heard. "llm" is Deferred too. */
export interface Policy<S = unknown> {
  id: string;
  kind: "scripted" | "perfect" | "random" | "sim" | "jev-probe" | "llm" | "human";
  init(seed: Seed, persona: Persona): S;
  decide(s: S, view: PlayerView, ctx: PolicyCtx): [Decision, S] | Promise<[Decision, S]>;
  /** simulated children learn from what they hear and do */
  observe?(s: S, e: GameEvent): S;
  notes?(s: S): PolicyNote[];
}

/** A simulated child: hidden knowledge that learns and forgets, plus behaviour. The game never sees it; tests compare
 *  the learner model against it. */
export interface SimLearnerParams {
  /** starting p(correct) per KC prefix ("gpc:m>m:read", "gpc:", "pa:first-sound"), longest prefix wins */
  prior: Record<string, Prob>;
  learn: { explained: number; modelled: number; practisedRight: number; corrected: number };
  forgetHalfLifeH: number;
  slip: Prob;
  /** p(understands a new mechanic) after one demonstration; otherwise taps at random until shown again */
  comprehension: Prob;
  /** p(follows an instruction it has heard in full); below 1 = sometimes taps the wrong kind of thing */
  followsInstructions: Prob;
  rt: { knownMedianMs: Ms; unknownMedianMs: Ms; sigma: number };
  /** per decision: tapping during the prompt, a random tap, pressing Help when unsure, replaying */
  eager: Prob;
  random: Prob;
  help: Prob;
  replay: Prob;
  positionBias?: { position: number; share: Prob };
  /** want>got pairs it confuses, with p(choosing the confusion when wrong) */
  confusions: [string, string, Prob][];
  /** active minutes until attention drops (slower, more random taps, quits) */
  attentionMin: number;
  quitAfterErrorsInRow?: number;
}

export interface Persona {
  id: string;
  label: string;
  /** what the persona answers in the opt-in; the age band is derived from it, as for a real child */
  schoolYear: SchoolYear;
  /** the persona's real age, for thresholds and the brief (the game never sees it unless `tellsAge`) */
  age: AgeBand;
  /** the grown-up enters the exact age in the grown-ups area */
  tellsAge?: boolean;
  params: SimLearnerParams;
  /** in-character brief for Jev and LLM players */
  brief: string;
}

export interface DayPlan { day: number; sessions: { hour: number; minutes: number }[] }
export type StopRule = { minutes: number } | { sessions: number } | { unit: SwUnitId } | { chapter: ChapterId } | { days: number };

export interface RunConfig {
  name: string;
  seed: Seed;
  persona: Persona;
  policy: string;
  /** start fresh, from a snapshot fixture, from a real child's exported log, or placed at a unit */
  start: { from: "fresh" } | { from: "snapshot"; file: string } | { from: "log"; file: string } | { from: "unit"; unit: SwUnitId };
  schedule: DayPlan[];
  stop: StopRule;
  config: CoreConfig;
}

export interface RunMetrics {
  minutes: number;
  sessions: number;
  actions: number;
  firstTryRate: number;
  /** rolling-10 independent rate per you-do item */
  rolling: number[];
  talkShare: number;
  longestTalkBeforeActionMs: Ms;
  idleHints: number;
  helpPresses: number;
  strayTaps: number;
  beats: { id: BeatId; ms: Ms; stars?: number; band: ChallengeBand; predicted: Prob; observed?: Prob }[];
  units: { unit: SwUnitId; minute: number; session: number; by: Extract<Milestone, { kind: "unit-passed" }>["by"] }[];
  /** simulated children only: how well the learner model tracks the hidden truth */
  calibration?: { brier: number; auc: number; spearman: number };
  cost?: { calls: number; usd: number };
}

export interface RunResult {
  config: Omit<RunConfig, "config">;
  events: GameEvent[];
  final: CoreSnapshot;
  metrics: RunMetrics;
  notes: PolicyNote[];
  wallMs: Ms;
}

// =============================================================================================== 14. transcripts and audits

export type TranscriptDetail = "child" | "annotated" | "debug";
export type TranscriptWho = "SENSEI" | "BARON" | "KAI" | "SUKI" | "NINJA" | "NARRATOR" | "CHILD" | "SCREEN" | "GAME" | "MODEL" | "NOTE";

export interface TranscriptLine {
  seq: number;
  /** ms since the session started */
  at: Ms;
  session: number;
  who: TranscriptWho;
  text: string;
  /** the lowest detail level that shows this line */
  detail: TranscriptDetail;
  purpose?: UttPurpose;
  beat?: BeatId;
  item?: ItemId;
  tags?: Tag[];
  /** keys heard, shown or explained for the first time here */
  firsts?: Key[];
  /** running full-explanation counts for explained keys: { "idea:two-letters-one-sound": 2 } */
  counts?: Partial<Record<Key, number>>;
  interrupted?: boolean;
}

export interface Transcript { title: string; persona: string; lines: TranscriptLine[] }

export type Severity = "blocker" | "major" | "minor" | "polish";

/** Every audit rule. Deterministic ones gate CI; "jev-clarity" and "llm-review" run nightly and never gate. */
export type AuditRuleId =
  // not explained
  | "used-before-explained" | "interrupted-explanation" | "mechanic-without-demo" | "picture-not-named"
  | "narrative-order" | "untaught-code-shown" | "unframed"
  // not repeated enough, or too much
  | "under-dosed" | "stale-no-refresh" | "over-repeated" | "same-praise-twice"
  // order and Sounds~Write fidelity
  | "lag-violation" | "concept-too-early" | "moved-on-too-soon" | "segmenting-for-speller" | "answer-given-early"
  | "sw-language" | "distractors-in-lesson-1"
  // challenge and pacing
  | "out-of-band" | "failure-run" | "choice-jump" | "listening-load" | "talk-share" | "dead-air" | "beat-too-long"
  | "session-too-long" | "reward-drought" | "stars-inflated"
  // production
  | "missing-audio" | "untagged-line" | "spliced-speech" | "unlit-naming"
  // judgement (nightly)
  | "jev-clarity" | "llm-review";

/** Same shape as scripts/treadmill/types.ts Finding (source "audit"), plus the rule and where it happened, so audits
 *  land in playtest/INBOX.md. */
export interface AuditFinding {
  sig: string;
  source: "audit";
  severity: Severity;
  case: string;
  title: string;
  detail: string;
  evidence: string[];
  repro?: string;
  rule: AuditRuleId;
  where?: { run: string; session: number; at: Ms; seq: number; beat?: BeatId; line?: LineId };
  keys?: Key[];
  personas: string[];
}

/** One row of the explanation coverage report: Jonas's question, per notion, in one table. */
export interface CoverageRow {
  key: Key;
  label: string;
  dosage: Dosage | null;
  firstExplainedAt?: { session: number; at: Ms };
  firstUsedAt?: { session: number; at: Ms };
  full: number;
  fullSessions: number;
  reminders: number;
  interrupted: number;
  uses: number;
  usedCorrectly: number;
  /** sessions with an independent correct use */
  correctUseSessions: number;
  longestGapH: number;
  /** "open": the dosage window (the sessions the spacing needs, counted in sessions where the key was used) has not
   *  closed by the end of the run, so no dosage verdict yet */
  verdict: "ok" | "open" | "used-before-explained" | "under-dosed" | "over-repeated" | "explained-never-used" | "never-met" | "stale";
}

export interface LineUsageRow { line: LineId; n: number; maxPerMinute: number; sessions: number; firstAt: Ms; completedShare: number }

export interface AuditReport {
  run: string;
  findings: AuditFinding[];
  coverage: CoverageRow[];
  lines: LineUsageRow[];
  beats: RunMetrics["beats"];
  summary: { minutes: number; talkShare: number; firstTryRate: number; bands: Record<ChallengeBand, number> };
}

export interface AuditEnv {
  curriculum: Curriculum;
  lines: LineBook;
  notions: NotionRegistry;
  chapters: readonly Chapter[];
  cfg: CoreConfig;
  ages: Record<string, AgeBand>;
}

export interface AuditRule {
  id: AuditRuleId;
  severity: Severity;
  /** one line for the inbox legend */
  describe: string;
  run(runs: readonly RunResult[], env: AuditEnv): AuditFinding[] | Promise<AuditFinding[]>;
}

export type RenderTranscript = (events: readonly GameEvent[], env: AuditEnv, o: { detail: TranscriptDetail; title: string; persona: string }) => Transcript;
