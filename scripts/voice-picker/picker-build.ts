// Voice picker: builds the app's data from the four providers' candidate files and embeds it in
// playtest/voice-picker/index.html (between the <script id="picker-data"> tags), so the page is self-contained.
//
//   bun scripts/voice-picker/picker-build.ts
//
// Scores, so the four providers compare:
//   british: the CALIBRATED accent score out of 10 (the ABX judge against known British and American anchors, plus the
//            audit's acoustic checks). Gemini byRole.accent10, ElevenLabs accentScore, OpenAI britishCalibrated; for
//            Workers AI (which has no single score) the mean of its ABX British share and its acoustic clean share,
//            the same formula as gemini.ts. Judge 1's britishScore is not used: the audit found it passes American voices.
//   fit:     the role judge out of 10: warmth for Sensei, storytelling for the narrator, villainy for the Baron.
//   top3:    each provider's own top 3 for the role, as its workflow ranked them.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { TEST_SCRIPT, type Role } from "./audit-script";

const ROOT = join(import.meta.dir, "../..");
const APP = join(ROOT, "playtest/voice-picker");
const read = (f: string) => JSON.parse(readFileSync(join(APP, f), "utf8")) as any[];
const ROLES: Role[] = ["sensei", "narrator", "baron"];
const LINES_OF = (r: Role) => TEST_SCRIPT.filter((l) => l.role === r).map((l) => l.id);
const r1 = (x: number | null | undefined) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10) / 10);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Drop the sentences every candidate repeats (the page says them once, at the top). */
const cleanNotes = (s: string | undefined) =>
  String(s ?? "")
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .filter((x) => !/re-recording every line|britishScore is the audit's Judge 1|^Accent, calibrated:/.test(x))
    .join(" ")
    .replace(/\s*britishScore is the audit's Judge 1[^.]*\./g, "")
    .trim();

/** "playtest/voice-picker/audio/x/y.mp3" or "audio/x/y.mp3" -> "audio/x/y.mp3" (relative to the page). */
const rel = (p: string) => p.replace(/^playtest\/voice-picker\//, "");

let missing = 0;
/** Take 1 from the candidate's file list, plus any <line>.take2/3.mp3 next to it on disk. */
function linesFor(files: string[] | undefined, role: Role) {
  if (!files?.length) return null;
  const out: { line: string; takes: string[] }[] = [];
  for (const line of LINES_OF(role)) {
    const f = files.find((x) => basename(x) === `${line}.mp3`);
    if (!f) continue;
    const p = rel(f);
    if (!existsSync(join(APP, p))) { missing++; console.warn("missing", p); continue; }
    const takes = [p];
    for (const k of [2, 3, 4]) {
      const t = join(dirname(p), `${line}.take${k}.mp3`);
      if (existsSync(join(APP, t))) takes.push(t);
    }
    out.push({ line, takes });
  }
  return out.length ? out : null;
}

/** Pull "sensei-4 take 2" / "[narrator-1.t3]" / "(sensei-2.t3, …)" out of a slip, to mark that take's button. */
function slipTake(s: string): { line: string; take: number } | null {
  const m = s.match(/\b((?:sensei|narrator|baron)-\d)(?:\.t(\d)| take (\d))/);
  return m ? { line: m[1], take: Number(m[2] ?? m[3]) } : null;
}

const verdict = (b: number | null) => (b == null ? "not scored" : b >= 8.5 ? "British" : b >= 7 ? "mostly British" : b >= 5 ? "mixed" : "American");
const FIT_WORD: Record<Role, string> = { sensei: "warmth", narrator: "storytelling", baron: "villainy" };

interface RoleEntry {
  british: number | null; verdict: string; fit: number | null; natural: number | null;
  rank: number | null; evidence: string; slips: string[]; fitNotes?: string[];
  lines: { line: string; takes: string[] }[];
}
interface Cand {
  id: string; provider: string; providerLabel: string; model: string; name: string; desc: string; settings: string;
  instructions?: string; cost: number | null; notes: string; current: Role[]; roles: Partial<Record<Role, RoleEntry>>;
}
const cands: Cand[] = [];

// ---- Gemini
for (const c of read("candidates-gemini.json")) {
  const roles: Cand["roles"] = {};
  for (const r of c.roles as Role[]) {
    const b = c.byRole?.[r];
    const lines = linesFor(c.files?.[r], r);
    if (!b || !lines) continue;
    const fitKey = r === "sensei" ? "warmth" : r === "narrator" ? "storytelling" : "villain";
    roles[r] = {
      british: r1(b.accent10), verdict: verdict(r1(b.accent10)), fit: r1(b[fitKey]), natural: r1(b.natural), rank: null,
      evidence: `A/B judge: ${b.abxBritish} votes British. Acoustics: ${[b.acoustic?.rhotic, b.acoustic?.bath, b.acoustic?.t].filter(Boolean).join(", ")}.`,
      slips: b.americanFeatures ?? [], fitNotes: (b.fitNotes ?? []).slice(0, 2), lines,
    };
    (roles[r] as any)._rankKey = b.overall ?? 0;
  }
  const m = /\(([^)]+)\)/.exec(c.label);
  const s = c.settings;
  cands.push({
    id: c.id, provider: "gemini", providerLabel: "Gemini", model: s.model, name: c.voice,
    desc: [m?.[1], s.languageCode ?? "no language code"].filter(Boolean).join(" · "),
    settings: `${s.model}, ${s.languageCode ? `languageCode ${s.languageCode}` : "no languageCode"}, plain text (no style prompt)`,
    cost: c.costPerMinuteUSD ?? null, notes: cleanNotes(c.notes), current: c.current ?? [], roles,
  });
}

// ---- ElevenLabs
for (const c of read("candidates-elevenlabs.json")) {
  const roles: Cand["roles"] = {};
  for (const r of c.roles as Role[]) {
    const lines = linesFor(c.files?.[r], r);
    if (!lines) continue;
    const fit = c.roleFit?.[r];
    roles[r] = {
      british: r1(c.accentScore), verdict: verdict(r1(c.accentScore)), fit: r1(fit?.score), natural: r1(fit?.naturalness), rank: null,
      evidence: `A/B judge: ${c.abxBritish} votes British (${c.abxAuditPair} with the audit's anchors). Acoustics: ${c.acoustic?.american ?? "?"} of ${c.acoustic?.markerWords ?? "?"} marker words American.`,
      slips: [...(c.acoustic?.flags ?? []), ...(c.americanFeatures ?? []).map((f: any) => (typeof f === "string" ? f : `${f.feature} in "${f.word}" (${f.line})`))],
      lines,
    };
    (roles[r] as any)._rankKey = c.overall?.[r] ?? 0;
  }
  const [name, ...rest] = String(c.voice).split(" – ");
  const s = c.settings;
  cands.push({
    id: c.id, provider: "elevenlabs", providerLabel: "ElevenLabs", model: c.model, name: name.trim(),
    desc: rest.join(" – ").trim(),
    settings: `${c.model}, "${s.preset}" preset: stability ${s.stability}, style ${s.style}, speed ${s.speed}, similarity ${s.similarity_boost}, seed ${s.seed} · ${c.voiceSource}`,
    cost: c.costPerMinuteUSD ?? null, notes: cleanNotes(c.notes), current: [], roles,
  });
}

// ---- OpenAI (one role per candidate)
for (const c of read("candidates-openai.json")) {
  const r = c.role as Role;
  const lines = linesFor(c.files?.[r], r);
  if (!lines) continue;
  const roles: Cand["roles"] = {
    [r]: {
      british: r1(c.britishCalibrated), verdict: verdict(r1(c.britishCalibrated)), fit: r1(c.mannerScore), natural: r1(c.naturalScore), rank: null,
      evidence: `A/B judge: ${c.abx?.britishVotes} votes British (${c.abx?.pBritish}/100). Acoustics: ${c.acousticAmericanShare ?? "?"} marker words American.`,
      slips: c.acousticFlags ?? [], lines,
    },
  };
  (roles[r] as any)._rankKey = -(c.rankInRole ?? 999);
  cands.push({
    id: c.id, provider: "openai", providerLabel: "OpenAI", model: c.model, name: cap(c.voice),
    desc: c.settings?.preset && c.settings.preset !== "none" ? `"${c.settings.preset}" preset` : "no direction",
    settings: `${c.model}${c.settings?.endpoint ? `, ${c.settings.endpoint.split(" (")[0]}` : ""}`,
    instructions: c.settings?.instructions, cost: c.costPerMinuteUSD ?? null, notes: cleanNotes(c.notes), current: [], roles,
  });
}

// ---- Workers AI
const WAI_MODEL: Record<string, string> = {
  "inworld/tts-2": "Inworld TTS-2", "minimax/speech-2.8-hd": "MiniMax Speech 2.8 HD", "xai/grok-tts": "xAI Grok TTS",
  "@cf/deepgram/aura-1": "Deepgram Aura-1", "@cf/deepgram/aura-2-en": "Deepgram Aura-2",
};
const frac = (s: string | undefined) => { const m = /^(\d+)\/(\d+)/.exec(s ?? ""); return m ? [Number(m[1]), Number(m[2])] : null; };
for (const c of read("candidates-workers-ai.json")) {
  const ac = c.acoustics ?? {};
  const parts = [frac(ac.rColoured), frac(ac.bathFlat), frac(ac.tFlapped)].filter(Boolean) as number[][];
  const flags = parts.reduce((s, p) => s + p[0], 0), tokens = parts.reduce((s, p) => s + p[1], 0);
  const clean = tokens ? 1 - flags / tokens : null;
  const roles: Cand["roles"] = {};
  for (const r of c.roles as Role[]) {
    const lines = linesFor(c.files?.[r], r);
    if (!lines) continue;
    const abx = r === "baron" ? c.abx?.baronLine : c.abx?.accentLines;
    const abxShare = abx?.votes ? abx.britishVotes / abx.votes : null;
    const p = [abxShare, clean].filter((x): x is number => x != null);
    const british = p.length ? r1((p.reduce((a, b) => a + b, 0) / p.length) * 10) : null;
    const fit = r === "sensei" ? c.warmth : r === "narrator" ? c.storytelling : c.villainy;
    roles[r] = {
      british, verdict: verdict(british), fit: r1(fit), natural: r1(c.naturalness), rank: null,
      evidence: `A/B judge: ${abx?.britishVotes}/${abx?.votes} votes British. Acoustics: r-coloured ${ac.rColoured}, flat bath ${ac.bathFlat}, flapped t ${ac.tFlapped}.`,
      slips: c.americanFeatures ?? [], lines,
    };
    (roles[r] as any)._rankKey = c.rank?.[r] ? 100 - c.rank[r] : -1;
  }
  const modelName = WAI_MODEL[c.model] ?? c.model;
  const tail = String(c.label).replace(modelName, "").trim();
  const name = tail.split(/[,(]/)[0].trim();
  const desc = tail.slice(name.length).replace(/^[,\s]+/, "").replace(/^\((.*)\)$/, "$1").trim();
  const st = c.settings ?? {};
  const settingBits = Object.entries(st).filter(([k]) => !["encoding", "container", "sample_rate", "steer"].includes(k)).map(([k, v]) => `${k} ${v}`);
  if (st.steer) settingBits.push(`steering tags: ${Object.entries(st.steer).map(([k, v]) => `${k} ${v}`).join("; ")}`);
  cands.push({
    id: c.id, provider: "workers-ai", providerLabel: "Workers AI", model: modelName, name, desc,
    settings: `${c.model} on Cloudflare Workers AI${settingBits.length ? `, ${settingBits.join(", ")}` : ""}`,
    cost: c.costPerMinuteUSD ?? null, notes: cleanNotes(c.notes), current: [], roles,
  });
}

// ---- each provider's own top 3 per role
for (const p of ["gemini", "elevenlabs", "openai", "workers-ai"]) {
  for (const r of ROLES) {
    const list = cands.filter((c) => c.provider === p && c.roles[r]).sort((a, b) => (b.roles[r] as any)._rankKey - (a.roles[r] as any)._rankKey);
    list.forEach((c, i) => { const e = c.roles[r]!; e.rank = (e as any)._rankKey === -1 ? null : i + 1; });
  }
}
for (const c of cands) for (const r of ROLES) if (c.roles[r]) delete (c.roles[r] as any)._rankKey;

// ---- per-take slip marks (line -> take -> slips)
const takeSlips = (e: RoleEntry) => {
  const m: Record<string, Record<number, string[]>> = {};
  for (const s of e.slips) { const t = slipTake(s); if (t) ((m[t.line] ??= {})[t.take] ??= []).push(s); }
  return m;
};
for (const c of cands) for (const r of ROLES) if (c.roles[r]) (c.roles[r] as any).takeSlips = takeSlips(c.roles[r]!);

// ---- the audit's "listen for yourself" pairs (today's voices; the shipped clips were copied on 27 Sep at 08:41)
const listen = [
  { title: "“Now say it fast”", a: { label: "take 1: flat “fast”", src: "audio/current/sensei-4.mp3" }, b: { label: "take 2: British “fahst”", src: "audio/current/sensei-4.take2.mp3" }, note: "The same voice, the same line, two takes. The first has the flat “a” of “tap” (American or Northern); the second has the long British “ah”." },
  { title: "The finale and the film", a: { label: "finale (in the game)", src: "audio/shipped/l_finale.mp3" }, b: { label: "film_1 (in the game)", src: "audio/shipped/l_film_1.mp3" }, note: "An American “World Flower” (with an r) and a “peddle” for petal, then a British “World Flower”." },
  { title: "bird and her", a: { label: "bird (in the game)", src: "audio/shipped/w_bird.mp3" }, b: { label: "her (in the game)", src: "audio/shipped/w_her.mp3" }, note: "An American r in “bird”, then a British “her” with no r. Also American in the game: fur, girl, corn, are, jar, flower." },
  { title: "Pure sounds ar and or", a: { label: "ar, then or (pure sounds)", src: ["audio/shipped/p_ar.mp3", "audio/shipped/p_or.mp3"] }, b: { label: "car, then four (words)", src: ["audio/shipped/w_car.mp3", "audio/shipped/w_four.mp3"] }, note: "The pure sounds end in an r glide; the words don’t. Children are taught /ar/ and /or/ with no r." },
  { title: "The film’s “petals”", a: { label: "film_5 (in the game)", src: "audio/shipped/l_film_5.mp3" }, b: { label: "film_2 (in the game)", src: "audio/shipped/l_film_2.mp3" }, note: "A soft American t (“peddles”), then a crisp British “petal”." },
  { title: "Baron Muddle’s “words”", a: { label: "take 3: American r", src: "audio/current/baron-1.take3.mp3" }, b: { label: "take 1: British", src: "audio/current/baron-1.mp3" }, note: "Words, words, WORDS! The r slips in on one take in three." },
];
for (const p of listen) for (const side of [p.a, p.b]) for (const s of [side.src].flat()) if (!existsSync(join(APP, s))) { missing++; console.warn("missing", s); }

const SHORT: Record<string, string> = {
  "sensei-1": "Hello, ninja", "sensei-2": "car, grass, bath", "sensei-3": "slow, fast", "sensei-4": "mat, fast",
  "sensei-5": "Oh dear", "sensei-6": "water, tomato", "narrator-1": "Once upon a time", "narrator-2": "stormy night",
  "narrator-3": "read again", "baron-1": "Words!", "baron-2": "MINE!",
};
// What each accent-test line listens for, in plain words (the audit's probes, plus the lines it judged for the narrator and Baron).
const PROBES: Record<string, string> = {
  "sensei-2": "“car” with no r; a long “ah” in grass and bath",
  "sensei-4": "a short “a” in mat, then a long “ah” in fast",
  "sensei-6": "a crisp t in water and butter; “tomahto”; a long “ah” in dance, can’t, half and past; no r in four",
  "narrator-1": "no r in far, World and Flower",
  "baron-1": "no r in words",
};
const data = {
  built: new Date().toISOString(),
  lines: TEST_SCRIPT.map((l) => ({ id: l.id, role: l.role, text: l.text, probes: PROBES[l.id] ?? null, short: SHORT[l.id] })),
  fitWord: FIT_WORD,
  listen,
  candidates: cands,
};

const page = join(APP, "index.html");
const html = readFileSync(page, "utf8");
const re = /(<script id="picker-data" type="application\/json">)[\s\S]*?(<\/script>)/;
if (!re.test(html)) throw new Error("index.html has no <script id=\"picker-data\"> block");
const json = JSON.stringify(data).replace(/</g, "\\u003c");
writeFileSync(page, html.replace(re, (_m, a, b) => `${a}${json}${b}`));

const count = (r: Role) => cands.filter((c) => c.roles[r]).length;
const clips = new Set<string>();
for (const c of cands) for (const r of ROLES) for (const l of c.roles[r]?.lines ?? []) for (const t of l.takes) clips.add(t);
console.log(`candidates ${cands.length}: sensei ${count("sensei")}, narrator ${count("narrator")}, baron ${count("baron")}; ${clips.size} clips; missing ${missing}; data ${(json.length / 1024).toFixed(0)} KB`);
if (missing) process.exitCode = 1;
