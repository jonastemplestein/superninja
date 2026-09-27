import type { AuditFinding, GameEvent, LineId, UttPart } from '../types';
/** An utterance's shape: its parts with every sound, word, stretched word and gap abstracted, so "/ae/ It's two
 *  letters, but it's one sound." said for two spellings is one shape said twice. */
export function shapeOf(parts: readonly UttPart[]): string {
  return parts.flatMap(p => 'line' in p ? [p.line] : 'sound' in p || 'sounds' in p ? ['/·/'] : 'word' in p || 'stretch' in p ? ['"·"'] : 'story' in p ? [`story:${p.page}`] : []).join(' · ');
}
/**
 * The `echo` audit (SCRIPT_FIXES Part E; ARCHITECTURE §10.2's family of over-repeated): the same utterance shape said
 * twice within `windowMs` (30 s) in one beat. It catches the composed shape Jonas heard ("/ae/ It's two letters, but it's
 * one sound. /ae/ It's two letters, but it's one sound."), which `over-repeated` misses when each line alone is under its
 * cap. A shape made only of a routine the child is meant to hear again (`allow`: SCRIPT_STYLE §5.1's "Say the sounds, and
 * read the word.", "What's the first sound?"…) and a shape with no line at all (a word, the sounds) aren't echoes.
 * Compacted utterances (no parts) are skipped.
 */
export function echoes(events: readonly GameEvent[], o: { windowMs?: number; allow?: ReadonlySet<LineId>; run?: string; persona?: string } = {}): AuditFinding[] {
  const windowMs = o.windowMs ?? 30_000;
  const last = new Map<string, { t: number; seq: number }>();
  const out: AuditFinding[] = [];
  for (const e of [...events].sort((a, b) => a.seq - b.seq)) {
    if (e.kind !== 'exp.said' || !('parts' in e.utt)) continue;
    const lines = e.utt.lines;
    if (!lines.length || lines.every(id => o.allow?.has(id))) continue;
    const shape = shapeOf(e.utt.parts);
    const k = `${e.beat ?? e.sid}|${shape}`;
    const prev = last.get(k);
    if (prev && e.t - prev.t <= windowMs) {
      out.push({
        sig: `audit:echo:${shape}`, source: 'audit', severity: 'major', case: o.run ?? e.sid, rule: 'echo',
        title: `The same shape twice in ${Math.round((e.t - prev.t) / 1000)} s: ${shape}`,
        detail: `"${e.utt.text}" was said in the same shape ${Math.round((e.t - prev.t) / 1000)} s after seq ${prev.seq}, in one beat. A per-item composition needs a first and a next form (SCRIPT_STYLE §5).`,
        evidence: [`seq ${prev.seq}`, `seq ${e.seq}`], where: { run: o.run ?? e.sid, session: Number(e.sid.match(/:s(\d+)$/)?.[1] ?? 0), at: e.t, seq: e.seq, ...(e.beat ? { beat: e.beat } : {}), line: lines[0] },
        personas: o.persona ? [o.persona] : [],
      });
    }
    last.set(k, { t: e.t, seq: e.seq });
  }
  return out;
}
