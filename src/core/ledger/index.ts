import type { AttemptError, GameEvent, Key, Ledger, LedgerApi, LedgerEntry, Need, NotionReadiness, NotionRegistry, Dosage, DosageDue } from '../types';
import { knownGpcsAt, SW_SEQUENCE, type GpcKey } from '../../content/sw';
import { DAY, expectedUnit } from '../kernel/time';
import { notions } from '../content/notions';

const empty = (key: Key): LedgerEntry => ({ key, assumed: false, explained: 0, demonstrated: 0, reminded: 0, mentioned: 0, interrupted: 0, practised: 0, usedCorrectly: 0, correctUseSessions: 0, sessions: 0, beatsSince: 0, sessionsSince: 0, thisSession: 0, useSessions: 0 });
export const initial = (): Ledger => ({ v: 1, asOf: 0, lastSeq: 0, session: null, entries: {}, lines: {}, moments: {} });
export const entry = (l: Ledger, key: Key): LedgerEntry => l.entries[key] ?? empty(key);
const kcKey = (kc: string): Key | null => kc.startsWith('gpc:') || kc.startsWith('word:') ? kc.replace(/:(read|spell)$/, '') as Key : kc.startsWith('sound:') ? kc.replace(/:hear$/, '') as Key : kc.startsWith('mech:') || kc.startsWith('concept:') ? kc as Key : null;

export function apply(l: Ledger, e: GameEvent): Ledger {
  if (e.kind === 'obs.attempt' && (e.probe || e.origin === 'shadow')) return l;
  if (!['session.start','profile.change','beat.start','exp.said','exp.shown','exp.cue','exp.modelled','obs.attempt'].includes(e.kind)) return l;
  const entries = { ...l.entries };
  const lines = { ...l.lines };
  const moments = { ...l.moments };
  const edit = (key: Key, f: (x: LedgerEntry) => LedgerEntry) => { entries[key] = f(entries[key] ?? empty(key)); };
  const use = (key: Key) => edit(key, x => ({ ...x, firstUsed: x.firstUsed ?? e.t, useSessions: x.lastUseSession === e.sid ? x.useSessions : x.useSessions + 1, lastUseSession: e.sid }));
  const full = (key: Key) => edit(key, x => x.lastExplainedBeat === e.beat && e.beat ? { ...x, mentioned: x.mentioned + 1 } : ({ ...x, explained: x.explained + (key.startsWith('mech:') && e.kind === 'exp.modelled' ? 0 : 1), lastExplained: e.t, lastExplainedBeat: e.beat, beatsSince: 0, sessionsSince: 0, thisSession: x.thisSession + 1, sessions: x.lastSession === e.sid ? x.sessions : x.sessions + 1, lastSession: e.sid, first: x.first ?? e.t }));
  if (e.kind === 'session.start') for (const [key, x] of Object.entries(entries)) entries[key] = { ...x, sessionsSince: x.sessionsSince + 1, thisSession: 0 };
  if (e.kind === 'profile.change' && (e.change.kind === 'school-year' || e.change.kind === 'band')) {
    const band = e.change.kind === 'band' ? e.change.band : e.change.year;
    const expected=expectedUnit(band==='R'||band==='Y1'||band==='Y2'?band:'none',e.t);
    if (e.change.kind==='band') for (const [key,x] of Object.entries(entries)) if(key.startsWith('gpc:') && x.assumed && !x.explained && (!expected || !knownGpcsAt(expected).has(key.slice(4) as GpcKey))) entries[key]={...x,assumed:false};
    if (expected) {
      for (const gpc of knownGpcsAt(expected)) edit(`gpc:${gpc}` as Key, x => ({ ...x, assumed: true }));
      for (const notion of Object.values(notions)) if(notion.assumedFrom && SW_SEQUENCE.indexOf(notion.assumedFrom)<=SW_SEQUENCE.indexOf(expected)) edit(notion.key,x=>({...x,assumed:true}));
    }
  }
  if (e.kind === 'beat.start') for (const [key, x] of Object.entries(entries)) entries[key] = { ...x, beatsSince: x.beatsSince + 1 };
  if (e.kind === 'profile.change' && e.change.kind === 'placed') {
    for (const gpc of knownGpcsAt(e.change.unit)) edit(`gpc:${gpc}` as Key, x => ({ ...x, assumed: true }));
    for(const notion of Object.values(notions)) if(notion.assumedFrom && SW_SEQUENCE.indexOf(notion.assumedFrom)<=SW_SEQUENCE.indexOf(e.change.unit)) edit(notion.key,x=>({...x,assumed:true}));
  }
  if (e.kind === 'exp.said') {
    for (const need of e.utt.needs) use(need.key);
    for (const id of e.utt.lines) { const x = lines[id]; lines[id] = { n: (x?.n ?? 0) + 1, last: e.t, thisSession: (x?.thisSession ?? 0) + 1 }; }
    if (e.utt.moment) moments[e.utt.moment] = (moments[e.utt.moment] ?? 0) + 1;
    for (const tag of e.utt.tags) {
      if (tag.as === 'demonstrate' || tag.as === 'use') continue;
      edit(tag.key, x => {
        if (!e.completed) return { ...x, mentioned: x.mentioned + 1, interrupted: x.interrupted + (tag.as === 'explain' || tag.as === 'remind' ? 1 : 0) };
        if (tag.as === 'remind') return { ...x, reminded: x.reminded + 1, lastReminded: e.t, beatsSince: 0, sessionsSince: 0, thisSession: x.thisSession + 1, first: x.first ?? e.t };
        return x;
      });
      if (e.completed && tag.as === 'explain') full(tag.key);
      else if (e.completed && tag.as !== 'remind') edit(tag.key, x => ({ ...x, mentioned: x.mentioned + 1, first: x.first ?? e.t }));
    }
  }
  if (e.kind === 'exp.shown' || e.kind === 'exp.cue') {
    const needs = e.kind === 'exp.shown' ? [...e.screen.needs, ...e.screen.affordances.flatMap(a => a.needs ?? [])] : e.needs;
    for (const need of needs) use(need.key);
    for (const tag of e.tags) if (tag.as === 'show') edit(tag.key, x => ({ ...x, mentioned: x.mentioned + 1, first: x.first ?? e.t }));
  }
  if (e.kind === 'exp.modelled') for (const tag of e.tags) if (tag.as === 'demonstrate') {
    edit(tag.key, x => ({ ...x, demonstrated: x.demonstrated + 1, first: x.first ?? e.t }));
    if (tag.key.startsWith('mech:')) full(tag.key);
  }
  if (e.kind === 'obs.attempt') {
    const keys = new Set<Key>([...e.uses, ...e.evidence.map(r => kcKey(r.kc)).filter((k): k is Key => k !== null)]);
    for (const key of keys) { use(key); edit(key, x => ({ ...x, practised: x.practised + 1 })); }
    if (e.correct && e.phase === 'you-do' && e.attemptNo === 1 && e.support.level <= 1 && e.choices > 1) for (const key of new Set(e.uses)) edit(key, x => x.lastCreditedBeat === e.beat ? x : ({ ...x, usedCorrectly: x.usedCorrectly + 1, lastCreditedBeat: e.beat, correctUseSessions: x.lastCorrectUseSession === e.sid ? x.correctUseSessions : x.correctUseSessions + 1, lastCorrectUseSession: e.sid }));
  }
  return { ...l, asOf: e.t, lastSeq: e.seq, session: e.kind === 'session.start' ? e.sid : l.session, entries, lines: e.kind === 'session.start' ? Object.fromEntries(Object.entries(lines).map(([id, x]) => [id, { ...x, thisSession: 0 }])) : lines, moments };
}
export function fold(events: Iterable<GameEvent>, from: Ledger = initial()): Ledger { let l = from; for (const e of [...events].sort((a,b) => a.seq-b.seq)) l = apply(l,e); return l; }
export function meets(l: Ledger, need: Need, now: number): boolean {
  const x = entry(l, need.key);
  const base = need.level === 'explained' ? x.explained > 0 || (need.key.startsWith('mech:') && x.demonstrated > 0) || x.assumed : x.assumed || x.explained + x.demonstrated + x.reminded + x.mentioned > 0;
  return base && (need.freshDays === undefined || Math.max(x.lastExplained ?? -Infinity, x.lastReminded ?? -Infinity) >= now - need.freshDays * DAY);
}
const gpcDosage: Dosage = { beforeUse:1, full:3, spacing:[{after:'beats',n:1},{after:'sessions',n:1}], minSessions:2, reminders:'short', retireAfter:12, refreshAfterDays:10, maxPerSession:2 };
const defaultDosage: Dosage = { beforeUse: 1, full: 1, spacing: [], minSessions: 1, reminders: 'none', retireAfter: 0, maxPerSession: 2 };
export function readiness(l: Ledger, key: Key, now: number, notions: NotionRegistry, seen = new Set<Key>()): NotionReadiness {
  const notion = notions[key], x = entry(l,key), d = notion?.dosage ?? (key.startsWith('gpc:') ? gpcDosage : defaultDosage);
  if (seen.has(key)) return { ready: true, fullDue: false, reminderDue: false, retired: false };
  seen.add(key);
  const missing = (notion?.dependsOn ?? []).filter(dep => !readiness(l,dep,now,notions,new Set(seen)).ready);
  if (missing.length) return { ready: false, missing: 'dependency', needs: missing };
  const full = x.explained + (key.startsWith('mech:') ? x.demonstrated : 0);
  if (full < d.beforeUse && !x.assumed) return { ready: false, missing: x.interrupted ? 'interrupted' : 'explanation', needs: [key] };
  if (d.refreshAfterDays && now - Math.max(x.lastExplained ?? -Infinity,x.lastReminded ?? -Infinity) > d.refreshAfterDays * DAY && !x.assumed) return { ready: false, missing: 'stale', needs: [key] };
  const retired = (full >= d.full || x.assumed) && x.usedCorrectly >= d.retireAfter && x.correctUseSessions >= d.minSessions;
  const space = d.spacing[full - 1];
  const passed = !space || (space.after === 'beats' ? x.beatsSince >= space.n : space.after === 'sessions' ? x.sessionsSince >= space.n : now - (x.lastExplained ?? -Infinity) >= space.n * DAY);
  return { ready: true, fullDue: !x.assumed && full < d.full && passed, reminderDue: (full >= d.full || x.assumed) && d.reminders === 'short' && !retired && (x.assumed || x.beatsSince >= 1), retired };
}
export function owed(l: Ledger, keys: readonly Key[], now: number, notions: NotionRegistry): DosageDue[] {
  const out: DosageDue[] = [];
  for (const key of new Set(keys)) {
    const r = readiness(l,key,now,notions), x = entry(l,key), d = notions[key]?.dosage ?? (key.startsWith('gpc:') ? gpcDosage : defaultDosage);
    if (x.thisSession >= d.maxPerSession) continue;
    if (!r.ready && r.missing !== 'dependency') out.push({ key, form: 'full', reason: r.missing === 'stale' ? 'refresh' : 'before-use', overdue: r.missing === 'stale' ? Math.floor((now - (x.lastExplained ?? now)) / DAY) : 0 });
    else if (r.ready && r.fullDue) out.push({ key, form: 'full', reason: 'spacing', overdue: x.beatsSince });
    else if (r.ready && r.reminderDue) out.push({ key, form: 'short', reason: 'reminder', overdue: x.beatsSince });
  }
  const rank = { 'before-use': 0, refresh: 1, spacing: 2, reminder: 3 };
  return out.sort((a,b) => rank[a.reason] - rank[b.reason] || b.overdue - a.overdue || a.key.localeCompare(b.key));
}
/** A notion whose reminders come only on errors (Dosage.reminders "error", SCRIPT_FIXES Part E): is a short reminder
 *  owed after an attempt with these errors? Only once its full explanations are done (or it is assumed), only for the
 *  notion's `remindOn` errors, and within its per-session cap. Before that, the schedule (owed) still explains it. */
export function errorReminderDue(l: Ledger, key: Key, errors: readonly AttemptError[] | undefined, notions: NotionRegistry): boolean {
  const n = notions[key], x = entry(l, key);
  if (!n || n.dosage.reminders !== 'error' || !errors?.some(e => n.remindOn?.includes(e))) return false;
  return (x.explained >= n.dosage.full || x.assumed) && x.thisSession < n.dosage.maxPerSession;
}
export function taughtCode(l: Ledger): ReadonlySet<GpcKey> { return new Set(Object.values(l.entries).filter(x => x.key.startsWith('gpc:') && (x.explained || x.assumed)).map(x => x.key.slice(4) as GpcKey)); }
export const ledger: LedgerApi = { initial, apply, entry, meets, readiness, owed, taughtCode };
