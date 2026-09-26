import type { EpochMs, Ms, ProfileState, AgeBand } from '../types';
export const HOUR: Ms = 3_600_000;
export const DAY: Ms = 24 * HOUR;
export const elapsed = (from: EpochMs, to: EpochMs): Ms => Math.max(0, to - from);
export const hours = (from: EpochMs, to: EpochMs): number => elapsed(from, to) / HOUR;
export function ageBandFor(profile: ProfileState, now: EpochMs): AgeBand {
  if (profile.age) return band(profile.age.years + elapsed(profile.age.at, now) / (365.2425 * DAY));
  const base = { none: 3, unsure: 3, unset: 3, R: 4, Y1: 5, Y2: 6 }[profile.schoolYear];
  if (!profile.schoolYearAt || base === 3) return band(base);
  const septembers = (t: EpochMs) => { const d = new Date(t); return d.getUTCFullYear() - (d.getUTCMonth() < 8 ? 1 : 0); };
  return band(base + Math.max(0, septembers(now) - septembers(profile.schoolYearAt)));
}
const band = (n: number): AgeBand => n >= 7 ? '7+' : n >= 6 ? '6' : n >= 5 ? '5' : n >= 4 ? '4' : '3';
/** FIRST_MINUTES §4: the first unit for a declared school track, half a term behind school pace. */
export function expectedUnit(band: 'none'|'R'|'Y1'|'Y2', now: EpochMs): import('../../content/sw').SwUnitId | undefined {
  if(band==='none') return undefined;
  const month=new Date(now).getUTCMonth();
  const term=month>=8?0:month<=2?1:2;
  return ({R:['IC1','IC5','IC9'],Y1:['EC1','EC9','EC18'],Y2:['EC27','EC34','EC42']} as const)[band][term];
}
