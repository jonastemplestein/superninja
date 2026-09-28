// Speech-template pilot (SPT11), step 1: choose the samples and write what each side plays.
//
// For every template rendered into the pilot root (playtest/runs/speech-templates/pilot, gen-templates.ts --unit IC4),
// 6 random members (seeded): "today" is the template's fallback as speech.ts plays it now (fallbackSay with the joins
// lowered to audio.ts gaps, a petal sound's 150 ms rise before it), "new" is the template as designed (speakParts: the
// recorded pieces, library clips, joins timed speech to speech). 40 of them (3 for the pilot seven and ws_starts_with,
// 2 for the rest) are the blind A/B. assemble.py renders both sides; judge.ts votes; page.ts builds the listening page.
//
//   bun playtest/speech-templates/pilot/plan.ts            → playtest/speech-templates/pilot/plan.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TEMPLATES, TEMPLATE_IDS, fid, parse, speechPieces, valuesFromKey, type TemplateId, type Values } from "../../../src/content/templates";
import { fallbackSay, speakParts, transcriptFor, JOIN_MS, isTplSay, isJoinSay, type SpeechSay } from "../../../src/engine/speech";
import { GRAPHEMES, ORAL_WORDS, WORD_BY_TEXT, PHONEMES, type PhonemeId, type Seg } from "../../../src/content/phonics";
import { STRETCHED, HELD_ONSET } from "../../../src/content/stretch";
import { LINES } from "../../../src/content/lines";
import { TEACH_EXAMPLES } from "../../../src/content/teach-lines.gen";
import { gpcsOfUnit, type SwUnitId } from "../../../src/content/sw";
import type { Say } from "../../../src/engine/audio";

const ROOT = join(import.meta.dir, "../../..");
const PILOT = "playtest/runs/speech-templates/pilot";
const OUT = join(import.meta.dir, "plan.json");
const UNITS: SwUnitId[] = ["IC1", "IC2", "IC3", "IC4"];
const PER_PAGE = 6;
const AB3 = new Set(["w_say_slowly", "s_say_the_sound", "w_position_q", "w_your_word", "w_listen_again", "ww_change", "ws_way_we_spell", "ws_starts_with"]);
/** audio.ts today: a petal pop asks the sequence to wait RISE ms before the sound (SoundBadge.tsx), and a `sounds`
 *  list sleeps 320 ms after each sound. */
const RISE = 150;
const SOUNDS_GAP = 320;
const CARRIER = "playtest/speech-templates/pilot/carrier/say_this_word_slowly.mp3";

// ---------------------------------------------------------------- seeded random
let seed = 20260927;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = <T>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------------------------------------------------------------- the content the pilot covers (IC1–IC4)
const unitSegs = new Map<string, Seg[]>();
for (const u of UNITS) {
  const mod = await import(`../../../src/content/units/${u}.ts`);
  for (const w of mod.words ?? []) {
    unitSegs.set(w.text, String(w.segs).split(".").map((part: string) => {
      const [g, p] = part.split("=");
      return { g, p: (p ?? GRAPHEMES[g] ?? g) as PhonemeId };
    }));
  }
}
const segsOf = (w: string): Seg[] | undefined => WORD_BY_TEXT[w]?.segs ?? unitSegs.get(w) ?? ORAL_WORDS[w]?.segs?.map((p) => ({ g: p, p }));
const firstSound = (w: string): PhonemeId | undefined => segsOf(w)?.[0]?.p ?? ORAL_WORDS[w]?.first;
const gpcs = UNITS.flatMap((u) => gpcsOfUnit(u) as string[]);
const SOUNDS = [...new Set(gpcs.map((k) => k.split(">")[1] as PhonemeId))].filter((p) => existsSync(join(ROOT, `public/a/p/${p}.mp3`)));

// ---------------------------------------------------------------- the rendered members, as values
type Manifest = { templates: Record<string, { entries: Record<string, unknown>; failed?: Record<string, string> }> };
const man: Manifest = JSON.parse(readFileSync(join(ROOT, PILOT, "manifest.json"), "utf8"));
/** only what the IC1–IC4 plan asks for (the smoke run's seeded pieces include later words: stamp, yell, send) */
const PLANNED = new Set(readFileSync(join(ROOT, PILOT, "_gen/plan.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).clip as string));
const keysOf = (id: string, piece: number) => Object.keys(man.templates[id]?.entries ?? {}).filter((k) => k.startsWith(`${piece}-`) && PLANNED.has(`t:${id}/${k}`)).map((k) => k.slice(`${piece}-`.length));
const recorded = (id: string, piece: number, key: string) => !!man.templates[id]?.entries[`${piece}-${key}`] && PLANNED.has(`t:${id}/${piece}-${key}`);

function candidates(id: TemplateId): Values[] {
  const t = TEMPLATES[id];
  const p0 = speechPieces(t)[0];
  switch (id) {
    case "s_which_starts": case "s_which_write": case "s_how_write": case "s_here_sound": case "s_say_the_sound":
      return recorded(id, 0, "_") ? SOUNDS.map((sound) => ({ sound })) : [];
    case "s_say_read":
      return recorded(id, 0, "_") ? keysOf("w_your_word", 0).filter((w) => (segsOf(w)?.length ?? 0) >= 2).map((word) => ({ word })) : [];
    case "ws_starts_with":
      return keysOf(id, 0).flatMap((picture) => (firstSound(picture) ? [{ picture, sound: firstSound(picture)! }] : []));
    case "ws_way_we_spell": {
      if (!recorded(id, 0, "_")) return [];
      const out: Values[] = [];
      for (const key of gpcs) {
        const ex = (TEACH_EXAMPLES as Record<string, readonly string[]>)[`gem:${key}`]?.[0];
        if (ex && recorded(id, 1, fid(ex))) out.push({ spelling: key, sound: key.split(">")[1], word: ex });
      }
      return out;
    }
    default:
      return keysOf(id, 0).flatMap((k) => {
        const v = valuesFromKey(t, p0, k);
        return v ? [v] : [];
      });
  }
}

// ---------------------------------------------------------------- Say items → files
type Item =
  | { file: string; kind: "line" | "word" | "slow" | "onset" | "sound" | "tpl"; text: string; petal?: boolean }
  | { sounds: string[]; gap: number; text: string }
  | { gap: number }
  | { join: number; kind: "breath" | "sentence" };
const lineText = new Map(LINES.map((l) => [l.id, l.text]));
const f = (p: string) => (existsSync(join(ROOT, p)) ? p : null);
const wordFile = (w: string) => `public/a/w/${fid(w)}.mp3`;
const slowFile = (w: string) => (STRETCHED.has(w) && f(`public/a/x/${fid(w)}.mp3`)) || wordFile(w);
const label = (p: string) => `/${PHONEMES[p as PhonemeId]?.label ?? p}/`;
function items(list: readonly SpeechSay[], today: boolean): Item[] {
  const out: Item[] = [];
  for (const it of list) {
    if (isJoinSay(it)) out.push({ join: JOIN_MS[it.join], kind: it.join });
    else if (isTplSay(it)) out.push({ file: `${PILOT}/${it.tpl}/${it.piece}-${it.key}.mp3`, kind: "tpl", text: it.text });
    else if ("line" in it) out.push({ file: `public/a/l/${it.line}.mp3`, kind: "line", text: lineText.get(it.line) ?? it.line });
    else if ("word" in it) out.push({ file: wordFile(it.word), kind: "word", text: `“${it.word}”` });
    else if ("stretch" in it) out.push({ file: slowFile(it.stretch), kind: "slow", text: `“${it.stretch}” (slowly)` });
    else if ("onset" in it) out.push({ file: (HELD_ONSET.has(it.onset) && f(`public/a/o/${fid(it.onset)}.mp3`)) || slowFile(it.onset), kind: "onset", text: `“${it.onset}” (first sound held)` });
    else if ("sound" in it) {
      const petal = (it.show ?? "petal") === "petal";
      if (today && petal) out.push({ gap: RISE }); // the petal's rise, before the sound (audio.ts cueSound)
      out.push({ file: `public/a/p/${it.sound}.mp3`, kind: "sound", text: label(it.sound), petal });
    } else if ("sounds" in it) out.push({ sounds: it.sounds.map((s) => `public/a/p/${s.p}.mp3`), gap: it.gap ?? SOUNDS_GAP, text: it.sounds.map((s) => label(s.p)).join(" ") });
    else if ("gap" in it) out.push({ gap: it.gap });
  }
  return out;
}
const textOfItems = (xs: Item[]) => xs.flatMap((x) => ("text" in x ? [x.text] : [])).join(" ").replace(/\s+([,.?!])/g, "$1");

// ---------------------------------------------------------------- the samples
const samples: unknown[] = [];
const measure: unknown[] = [];
const missing: string[] = [];
for (const id of TEMPLATE_IDS) {
  const cands = candidates(id);
  const chosen = shuffle(cands).slice(0, PER_PAGE);
  const nAb = AB3.has(id) ? 3 : 2;
  chosen.forEach((v, i) => {
    const o = { segs: v.word ? segsOf(String(v.word)) : undefined };
    const game = items(fallbackSay(id, v as never, o, false) as Say[], true);
    // Jonas's own "before" for w_say_slowly ("Say this word slowly: mat"): the game's fallback is Sensei modelling the
    // slow way, a different speech act, so it goes on the page as a third clip, not into the A/B (carrier.ts)
    const today: Item[] = id === "w_say_slowly" ? [{ file: CARRIER, kind: "line", text: "Say this word slowly..." }, { file: wordFile(String(v.word)), kind: "word", text: `“${v.word}”` }] : game;
    const neu = items(speakParts(id, v as never, o), false);
    for (const x of [...today, ...neu]) {
      if ("file" in x && !existsSync(join(ROOT, x.file))) missing.push(`${id} ${JSON.stringify(v)}: ${x.file}`);
      if ("sounds" in x) for (const s of x.sounds) if (!existsSync(join(ROOT, s))) missing.push(`${id}: ${s}`);
    }
    const key = Object.entries(v).filter(([k]) => k !== "spelling").map(([, x]) => fid(String(x))).join(".");
    samples.push({
      id: `${id}.${key || "_"}`, tpl: id, template: TEMPLATES[id].text, values: v, ab: i < nAb,
      text: { today: textOfItems(today), new: transcriptFor(id, v as never, o) },
      today, new: neu, ...(today !== game ? { game, gameText: textOfItems(game) } : {}),
    });
  });
  // every member of a template with a designed join, new side only: assemble.py measures every join the pilot can play
  if (parse(TEMPLATES[id]).some((p) => p.kind === "join")) {
    for (const v of cands) {
      const o = { segs: v.word ? segsOf(String(v.word)) : undefined };
      const key = Object.entries(v).filter(([k]) => k !== "spelling").map(([, x]) => fid(String(x))).join(".");
      measure.push({ id: `${id}.${key || "_"}`, tpl: id, values: v, new: items(speakParts(id, v as never, o), false) });
    }
  }
  console.log(`${id.padEnd(18)} ${String(cands.length).padStart(3)} members recorded · ${chosen.length} on the page`);
}
writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), pilot: PILOT, join_ms: JOIN_MS, rise_ms: RISE, samples, measure }, null, 1) + "\n");
console.log(`${measure.length} join-bearing utterances to measure`);
console.log(`${samples.length} samples, ${samples.filter((s: any) => s.ab).length} in the A/B → ${OUT}`);
if (missing.length) console.log(`missing files:\n  ${missing.join("\n  ")}`);
