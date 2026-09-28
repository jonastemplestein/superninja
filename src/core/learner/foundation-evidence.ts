import type { Attempt } from '../types';
import type { FoundationObservation } from './foundations';

/** Only isolated, directly identified skills are credited. Whole-word success is not a letter-production test. */
export function foundationsForAttempt(a: Attempt): FoundationObservation[] {
  if (a.phase === 'i-do') return [];
  const guided = a.phase !== 'you-do' || a.attemptNo > 1 || a.support.level > 0 || a.choices === 1;
  const base = { result: a.correct ? 'correct' : 'incorrect', source: 'choice', support: guided ? 'guided' : 'independent' } as const;
  const explicit = (a.foundations ?? []).map(o => ({ ...o, support: guided ? 'guided' as const : o.support,
    result: a.choices === 1 ? 'unassessed' as const : o.result }));
  if (explicit.length) return explicit;
  if (a.choices === 1) return [];
  if (a.itemKind === 'symbol-search' && a.target.spelling && a.target.sound) return [{ ...base,
    target: { kind: 'letter', letter: a.target.spelling, sound: a.target.sound, task: 'sound-to-letter' } }];
  // Legacy rail evidence establishes sequence order only, not the starting edge or a return to the next line.
  if (a.evidence.some(r => r.kc === 'pa:left-to-right' && r.role === 'target')) return [{ ...base,
    target: { kind: 'directionality', aspect: 'track-order' } }];
  return [];
}
