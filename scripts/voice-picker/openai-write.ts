// Voice picker, OpenAI renderer: writes playtest/voice-picker/candidates-openai.json from openai.ts summarise().
// Called by `openai.ts write`. Paths in `files` are relative to the repo root.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../..");
const OUT = join(ROOT, "playtest/voice-picker/candidates-openai.json");
const RUN = join(ROOT, "playtest/runs/voice-picker/openai");

const COST: Record<string, number> = { "gpt-4o-mini-tts-2025-12-15": 0.015, "gpt-audio-1.5": 0.077, "gpt-audio-mini-2025-12-15": 0.024, "gpt-realtime-2.1": 0.077 };
const SENSEI_SWITCH =
  "Choosing this for Sensei means re-recording every line (about 1,250 clips and 65 story pages) and every word (about 1,240, plus the stretched and held words), and rebuilding all 46 pure sounds in public/a/p, which are cut from Sulafat.";

/** Marker words measured (r after a vowel, BATH words, t between vowels, tomato) and the share that measured American. */
function acousticRate(m: any): { tokens: number; american: number; rate: number | null } {
  if (!m) return { tokens: 0, american: 0, rate: null };
  const ms: any[] = m.measures ?? [];
  // one token per feature measured (a "water" gives an r and a t), as each can raise one flag
  const tokens = ms.reduce((n, x) => n + (x.f3_ratio != null ? 1 : 0) + (x.bath_index != null ? 1 : 0) + (x.t ? 1 : 0), 0);
  const american = (m.flags ?? []).length;
  return { tokens, american, rate: tokens ? american / tokens : null };
}

/** Accent from the calibrated evidence, 1-10: the mean of the ABX judge (P(British) over every judged take, against
 *  the ElevenLabs/OpenAI anchors) and the acoustics (10 x the share of marker words that measured British). British
 *  controls and Sulafat score about 9-9.5 on each (the audit; about 1 acoustic flag in 20 is a tracking error).
 *  Judge 1 (britishScore) is reported but not used: the audit showed it calls an American voice British. */
function calibrated(x: any): { score: number | null; verdict: string } {
  if (x.abxUK == null) return { score: null, verdict: "not judged" };
  const ac = acousticRate(x.acoustic);
  const parts = [x.abxUK / 10, ...(ac.rate != null ? [10 * (1 - ac.rate)] : [])];
  const score = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10;
  const verdict = score >= 8.5 ? "British" : score >= 7 ? "mostly British" : score >= 4 ? "mixed British and American" : "American";
  return { score, verdict };
}

export function writeCandidates(summary: any[]) {
  const renders: Record<string, any> = JSON.parse(readFileSync(join(RUN, "renders.json"), "utf8"));
  const rows = summary.filter((x) => x.c.set !== "pilot").map((x) => {
    const c = x.c;
    const takes = Object.values(renders).filter((r: any) => r.id === c.id);
    const files = takes.filter((r: any) => r.take === 1 && r.mp3).sort((a: any, b: any) => a.line.localeCompare(b.line)).map((r: any) => r.mp3);
    let cost = COST[c.model];
    if (c.model === "tts-1-hd") {
      const t1 = takes.filter((r: any) => r.take === 1);
      const chars = t1.reduce((s: number, r: any) => s + r.text.length, 0), mins = t1.reduce((s: number, r: any) => s + r.seconds, 0) / 60;
      cost = Math.round(((chars * 30e-6) / mins) * 1000) / 1000;
    }
    const cal = calibrated(x);
    const extraTakes = x.takes - files.length;
    // Whisper's spelling of homophones ("matt", "barren", "cant") is not a changed word
    const SAME: Record<string, string[]> = { mat: ["matt"], baron: ["barren", "baren"], "can't": ["cant"] };
    const fid = (x.acoustic?.fidelity ?? []).filter((f: any) => {
      const missing = f.missing.filter((w: string) => !(SAME[w] ?? []).some((h) => f.extra.includes(h)));
      // a dropped phrase or an ad-lib; a one-for-one mishearing ("Whirlflower" for "World Flower") is Whisper's
      return f.clip.endsWith(".t1") && (missing.length - f.extra.length >= 2 || f.extra.length - missing.length >= 3);
    });
    const notes = [
      `${c.model}, voice ${c.voice}` + (c.instructions ? `, preset "${c.preset}" plus a Southern British accent block (see settings.instructions)` : ", no instructions (tts-1-hd takes none)") + ".",
      `Accent, calibrated: ${cal.verdict}. ABX judge ${x.abxUK}/100 British (${x.abxUKPicks} votes, anchors ElevenLabs ${c.role === "baron" ? "George" : "Alice"} (British) and OpenAI ${c.role === "baron" ? "ash" : "coral"} (American)${x.abxUK2 != null ? `; ${x.abxUK2}/100, ${x.abxUK2Picks} vs macOS Daniel/Samantha` : ""})` +
        (extraTakes > 0 ? `, over ${1 + Math.round(extraTakes / (c.role === "narrator" ? 1 : 2))} takes of the judged lines` : "") + (x.abxWorstTake ? `; weakest take ${x.abxWorstTake}` : "") + ".",
      (() => { const ac = acousticRate(x.acoustic); return x.acoustic?.flags?.length ? `Acoustics: ${ac.american} of ${ac.tokens} marker words measured American (${x.acoustic.flags.join("; ")}).` : x.acoustic ? `Acoustics: none of ${ac.tokens} marker words measured American (r after a vowel, BATH vowel, t between vowels).` : ""; })(),
      `britishScore is the audit's Judge 1, which the audit found passes American voices; trust the calibrated score.`,
      fid.length ? `Words changed: ${fid.map((f: any) => `${f.clip} heard "${f.heard}"`).join("; ")}.` : "",
      c.role === "sensei" ? SENSEI_SWITCH : "",
    ].filter(Boolean).join(" ");
    return {
      id: c.id,
      provider: "openai",
      voice: c.voice,
      model: c.model,
      settings: {
        model: c.model,
        endpoint: c.model.startsWith("gpt-audio") ? "chat/completions (modalities audio; the line is read verbatim, checked against the transcript)" : c.model.startsWith("gpt-realtime") ? "realtime WebSocket (the line is read verbatim, checked against the transcript)" : "audio/speech",
        voice: c.voice, preset: c.preset, instructions: c.instructions,
      },
      role: c.role,
      roles: [c.role],
      files: { [c.role]: files },
      britishScore: x.britishScore,
      americanFeatures: x.americanFeatures,
      warmth: c.role === "sensei" ? x.manner : null,
      costPerMinuteUSD: cost,
      notes,
      // extra evidence (not in the brief's schema)
      britishCalibrated: cal.score,
      accentVerdict: cal.verdict,
      abx: { pBritish: x.abxUK, britishVotes: x.abxUKPicks, pBritishMacAnchors: x.abxUK2, britishVotesMacAnchors: x.abxUK2Picks, weakestTake: x.abxWorstTake },
      acousticFlags: x.acoustic?.flags ?? null,
      acousticAmericanShare: (() => { const ac = acousticRate(x.acoustic); return ac.rate == null ? null : `${ac.american}/${ac.tokens}`; })(),
      mannerScore: x.manner,
      mannerRubric: c.role === "sensei" ? "teacher warmth to a 4-year-old" : c.role === "narrator" ? "enchanting storyteller for small children" : "fun pantomime villain, not frightening",
      naturalScore: x.natural,
      takesRendered: x.takes, // take 1 of every line, plus takes 2 and 3 of the judged lines for the leaders
    };
  });
  // Rank within each role: British on the calibrated evidence first (held over 3 takes beats 1 take), then warmth or
  // manner, then naturalness, then the calibrated accent score.
  const gate = (x: any) => ((x.britishCalibrated ?? 0) >= 8.5 ? (x.takesRendered > (x.files[x.role]?.length ?? 0) ? 2 : 1) : 0);
  rows.sort((a, b) => a.role.localeCompare(b.role) || gate(b) - gate(a) || (b.mannerScore ?? 0) - (a.mannerScore ?? 0) || (b.naturalScore ?? 0) - (a.naturalScore ?? 0) || (b.britishCalibrated ?? 0) - (a.britishCalibrated ?? 0));
  const seen: Record<string, number> = {};
  for (const r of rows as any[]) r.rankInRole = (seen[r.role] = (seen[r.role] ?? 0) + 1);
  writeFileSync(OUT, JSON.stringify(rows, null, 1));
  console.log(`wrote ${rows.length} candidates to ${OUT}`);
  for (const role of ["sensei", "narrator", "baron"]) {
    const r = rows.filter((x) => x.role === role);
    console.log(`\n${role}: ${r.length} candidates (${r.filter((x) => (x.britishCalibrated ?? 0) >= 8.5).length} British on the calibrated evidence); top:`);
    for (const x of r.slice(0, 8)) console.log(`  ${x.id.padEnd(46)} cal ${x.britishCalibrated} (${x.accentVerdict}) ABX ${x.abx.pBritish} ${x.abx.britishVotes} J1 ${x.britishScore} manner ${x.mannerScore} nat ${x.naturalScore} ac ${x.acousticAmericanShare} takes ${x.takesRendered}`);
  }
}
