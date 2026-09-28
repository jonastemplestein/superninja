/** Direct evidence of early reading skills. Shared by the event core and the browser save.
 * Hearing a model or tapping a playback button is practice, never a speech assessment.
 * Times and session ids are supplied by the caller; this module has no browser dependencies. */
import type { PhonemeId } from '../../content/phonics';

export type DirectionAspect = 'start-left' | 'track-order' | 'return-sweep';
export type JoiningSpeed = 'slow' | 'fast';
export type FoundationTarget =
  | { kind: 'directionality'; aspect: DirectionAspect }
  | { kind: 'joining'; speed: JoiningSpeed; task: 'recognition' | 'production' }
  | { kind: 'letter'; letter: string; task: 'recognition' }
  | { kind: 'letter'; letter: string; task: 'letter-to-sound' | 'sound-to-letter'; sound: PhonemeId };
export interface FoundationObservation {
  target: FoundationTarget;
  result: 'correct' | 'incorrect' | 'unassessed';
  source: 'choice' | 'adult-observed' | 'speech-assessed' | 'practice';
  support: 'independent' | 'guided' | 'modelled';
}
export interface FoundationSkill {
  practice: number;
  attempts: number;
  correct: number;
  independentAttempts: number;
  independentCorrect: number;
  /** A bounded recent independent window; guided repetitions cannot turn a skill secure. */
  recent: boolean[];
  successfulSessions: string[];
  last: number;
}
export interface LetterSkills {
  recognition: FoundationSkill;
  sounds: Partial<Record<PhonemeId, { letterToSound: FoundationSkill; soundToLetter: FoundationSkill }>>;
}
export interface Foundations {
  version: 1;
  directionality: Record<DirectionAspect, FoundationSkill>;
  joining: Record<JoiningSpeed, { recognition: FoundationSkill; production: FoundationSkill }>;
  /** Case-sensitive: recognising lower-case b does not establish upper-case B. Digraphs also stay distinct. */
  letters: Record<string, LetterSkills>;
}
export const emptyFoundationSkill = (): FoundationSkill => ({ practice: 0, attempts: 0, correct: 0, independentAttempts: 0, independentCorrect: 0, recent: [], successfulSessions: [], last: 0 });
export const emptyFoundations = (): Foundations => ({
  version: 1,
  directionality: { 'start-left': emptyFoundationSkill(), 'track-order': emptyFoundationSkill(), 'return-sweep': emptyFoundationSkill() },
  joining: { slow: { recognition: emptyFoundationSkill(), production: emptyFoundationSkill() }, fast: { recognition: emptyFoundationSkill(), production: emptyFoundationSkill() } },
  letters: {},
});
const emptyLetter = (): LetterSkills => ({ recognition: emptyFoundationSkill(), sounds: {} });

export function observeFoundation(state: Foundations | undefined, observation: FoundationObservation, at: number, session: string): Foundations {
  const next = structuredClone(state ?? emptyFoundations());
  const t = observation.target;
  let sk: FoundationSkill;
  if (t.kind === 'directionality') sk = next.directionality[t.aspect];
  else if (t.kind === 'joining') sk = next.joining[t.speed][t.task];
  else {
    const letter = next.letters[t.letter] ??= emptyLetter();
    if (t.task === 'recognition') sk = letter.recognition;
    else {
      const pair = letter.sounds[t.sound] ??= { letterToSound: emptyFoundationSkill(), soundToLetter: emptyFoundationSkill() };
      sk = t.task === 'letter-to-sound' ? pair.letterToSound : pair.soundToLetter;
    }
  }
  sk.last = at;
  const productive = t.kind === 'joining' && t.task === 'production' || t.kind === 'letter' && t.task === 'letter-to-sound';
  const heardChild = observation.source === 'adult-observed' || observation.source === 'speech-assessed';
  if (observation.result === 'unassessed' || observation.source === 'practice' || observation.support === 'modelled' || productive && !heardChild) {
    sk.practice++;
    return next;
  }
  sk.attempts++;
  const correct = observation.result === 'correct';
  if (correct) sk.correct++;
  if (observation.support === 'independent') {
    sk.independentAttempts++;
    if (correct) sk.independentCorrect++;
    sk.recent = [...sk.recent, correct].slice(-8);
    if (correct && !sk.successfulSessions.includes(session)) sk.successfulSessions = [...sk.successfulSessions, session].slice(-2);
  }
  return next;
}
export function foundationEstimate(sk: FoundationSkill) {
  const n = sk.recent.length, correct = sk.recent.filter(Boolean).length;
  const status = n >= 5 && correct / n >= .8 && sk.successfulSessions.length >= 2 ? 'secure'
    : sk.attempts ? 'learning' : sk.practice ? 'practising' : 'unknown';
  return { status, accuracy: n ? correct / n : null, independentAttempts: sk.independentAttempts, practice: sk.practice } as const;
}
/** All 26 lower-case letters are queryable before first exposure. No evidence is explicitly unknown. */
export function letterKnowledge(state: Foundations | undefined, letter: string) {
  const data = state?.letters[letter] ?? emptyLetter();
  const sounds = Object.fromEntries(Object.entries(data.sounds).map(([sound, pair]) => [sound, {
    letterToSound: foundationEstimate(pair!.letterToSound), soundToLetter: foundationEstimate(pair!.soundToLetter),
  }]));
  return {
    letter, recognition: foundationEstimate(data.recognition), sounds,
    hasSecureLetterToSound: Object.values(sounds).some(s => s.letterToSound.status === 'secure'),
    hasSecureSoundToLetter: Object.values(sounds).some(s => s.soundToLetter.status === 'secure'),
    /** Both directions must be secure for the SAME sound of this letter. */
    hasSecureSoundBothWays: Object.values(sounds).some(s => s.letterToSound.status === 'secure' && s.soundToLetter.status === 'secure'),
  };
}
export const alphabetKnowledge = (state?: Foundations) => [...'abcdefghijklmnopqrstuvwxyz'].map(letter => letterKnowledge(state, letter));
