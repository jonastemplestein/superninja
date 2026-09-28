import type { Say } from './audio';
export type SpeakingContext = 'sound' | 'word' | 'slow';
/** First encounter, then every third interaction of this kind. Leave space for the child's own voice. */
export function speakAlongStep(count: number, context: SpeakingContext): { count: number; say: Say[] } {
  const line = context === 'sound' ? 't_everyone_say' : context === 'slow' ? 'tv_fs_say_slow' : 'tv_now_say_word';
  return { count: count + 1, say: count % 3 === 0 ? [{ line }, { gap: 1200 }] : [] };
}
const counts: Record<SpeakingContext, number> = { sound: 0, word: 0, slow: 0 };
export function speakAlong(context: SpeakingContext): Say[] {
  const next = speakAlongStep(counts[context], context);
  counts[context] = next.count;
  return next.say;
}
export function resetSpeakAlong() { counts.sound = counts.word = counts.slow = 0; }
