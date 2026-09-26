import type { BeatId, ItemId, ProfileId, SessionId, OutId } from '../types';
export const sessionId = (profile: ProfileId, n: number): SessionId => `${profile}:s${n}`;
export const beatId = (session: SessionId, n: number): BeatId => `${session}:b${n}`;
export const itemId = (beat: BeatId, n: number): ItemId => `${beat}:i${n}`;
export const outId = (n: number): OutId => `o${n}`;
