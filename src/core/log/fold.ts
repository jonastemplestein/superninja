import type { GameEvent } from '../types';
export type Reducer<S> = (state: S, event: GameEvent) => S;
export function fold<S>(events: Iterable<GameEvent>, reducer: Reducer<S>, initial: S): S {
  return [...events].sort((a,b) => a.seq - b.seq).reduce(reducer, initial);
}
