import type { CueEvent, EventDraft, GameEvent, Retention } from '../types';
export interface StampContext { seq: number; t: number; sid: string; beat?: string; item?: string }
export function stamp(draft: EventDraft, s: StampContext): GameEvent {
  return { v: 1, seq: s.seq + 1, t: s.t, sid: s.sid, ...(s.beat ? { beat: s.beat } : {}), ...(s.item ? { item: s.item } : {}), ...draft } as GameEvent;
}
function canonical(value: unknown): string {
  if(Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if(value && typeof value==='object') return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function append(log: readonly GameEvent[], event: GameEvent): GameEvent[] {
  const old = log.find(e => e.seq === event.seq);
  if (old) { if (canonical(old) !== canonical(event)) throw new Error(`Conflicting event at seq ${event.seq}`); return [...log]; }
  if (event.seq !== (log.at(-1)?.seq ?? 0) + 1) throw new Error(`Non-gapless seq ${event.seq}`);
  return [...log, event];
}
const durableCues = new Set<CueEvent['cue']['cue']>(['hint', 'gem-energy', 'sticker', 'petal']);
export function retention(e: GameEvent): Retention {
  if (e.kind === 'input') return 'recent';
  if (e.kind === 'exp.cue') return durableCues.has(e.cue.cue) ? 'durable' : 'recent';
  if (e.kind === 'exp.said' || e.kind === 'exp.shown') return 'compact';
  return 'durable';
}
export function compact(e: GameEvent): GameEvent {
  if (e.kind !== 'exp.said' || 'compacted' in e.utt) return e;
  const { who, purpose, tags, needs, lines, estMs, moment } = e.utt;
  return { ...e, utt: { who, purpose, tags, needs, lines, estMs, ...(moment ? { moment } : {}), compacted: true } };
}
/** Shadow data is a development observation and cannot be persisted to a child's log. */
export const forStorage = (events: readonly GameEvent[]): GameEvent[] => events.filter(e => e.origin !== 'shadow');
