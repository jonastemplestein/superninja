// Pure sounds, round 3: the sounds TTS can't say alone (b → "bee", x → "ex", w → "woo", y → "yee"; k, th and i were
// split). Each sound gets two kinds of candidate, both in the teacher voice:
//   - fresh TTS takes of short spellings (as scripts/gen-phonemes.ts does), and
//   - the sound cut out of carrier words ("bat", "box", "wet", "yes"), with scripts/cut-sound.py, at several lengths.
// Every candidate is judged four times: twice blind (gen-phonemes' check: "identify exactly what you hear", with the
// letter name and an added vowel as penalties) and twice by a targeted judge that knows the target and scores 0 for a
// letter name or an added vowel (playtest/transcripts/reaudit-r2/sound-probe.ts; for /w/ and /y/ the school's "wwwoo"
// and "yyee" instead). A take "passes" only if every blind judgment names the right sound with no letter name, and both
// targeted judgments score at least 8. Then run scripts/pure-sound-finals.ts on the best (single judges are noisy).
//
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-pure-sounds.ts [ids…] [--apply]
// Without --apply it only writes assets-src/phonemes-r3/report.json and prints the table. --apply copies each winner
// to public/a/p/<id>.mp3 (the old clip goes to .trash/pure-sounds-r3/). The 26 Sep choices are in
// assets-src/phonemes-r3/final/ and docs/DECISIONS.md.
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PHONEMES, type PhonemeId } from "../src/content/phonics";
import { tts, finishAudio as finishSpeech, judgeAudio, durationOf, measureLufs } from "./tts";
import { generate, textOf, pool } from "./gemini";

const ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja";
const DIR = `${ROOT}/assets-src/phonemes-r3`;
const REPORT = `${DIR}/report.json`;
const VOICE = "Sulafat";
mkdirSync(DIR, { recursive: true });

type Cut = { word: string; mode: "onset" | "glide" | "burst" | "unvoiced" | "coda" | "vowel" | "tail" | "wcut" | "ycut"; ms?: number[]; takes?: number };
type Plan = { tts: string[]; cuts: Cut[]; target: string; ok: (ipa: string) => boolean };

const norm = (s: string) => (s ?? "").normalize("NFC").replace(/[\/\[\]ːˑ.ʰ̥̚ʷ ]/g, "").replace(/ɡ/g, "g");
const PLANS: Partial<Record<PhonemeId, Plan>> = {
  b: {
    tts: ["b", "bh", "b."],
    cuts: [
      ...["bat.", "bin.", "bus.", "bed."].map((word) => ({ word, mode: "burst" as const, ms: [20, 35, 50] })),
      // a released /b/ at the end of a word has no vowel after it
      ...["tub.", "cub.", "web.", "crab.", "rib."].map((word) => ({ word, mode: "tail" as const })),
      ...["web!", "cab.", "sob.", "grab.", "job."].map((word) => ({ word, mode: "tail" as const, takes: 4 })),
      // the short TTS "b" (heard as "bə"), with its vowel cut away
      ...["b", "b!"].map((word) => ({ word, mode: "burst" as const, ms: [25, 40, 55] })),
    ],
    target: "/b/ as in bat: a short voiced release (NOT the letter name 'bee', no 'buh')",
    ok: (i) => /^b$/.test(norm(i)),
  },
  ks: {
    tts: ["ks", "cks", "kss"],
    cuts: ["box.", "fox.", "six.", "mix."].map((word) => ({ word, mode: "coda" as const })),
    target: "/ks/ as at the end of box: a short k straight into s (NOT the letter name 'ex', no vowel before or after)",
    ok: (i) => /^ks$/.test(norm(i)),
  },
  w: {
    tts: ["w", "wh", "ww", "wwwoo", "wwwoo.", "wwoo!", "wwwu"],
    cuts: [
      ...["wet.", "win.", "web.", "wig."].map((word) => ({ word, mode: "onset" as const, ms: [60, 80, 100, 130] })),
      // a held /w/ ("wwwwet", like "thhhhin"): the start is the sound itself, held, before any vowel
      ...["wwwwet.", "wwwwin.", "wwwwater."].map((word) => ({ word, mode: "onset" as const, ms: [120, 170, 220, 280] })),
      ...["wet!", "win!", "web!", "wag."].map((word) => ({ word, mode: "glide" as const, ms: [110, 150, 190], takes: 3 })),
      // cut where the vowel's formants arrive (the "ms" here is the band ratio that says the vowel has come)
      ...["wwwwin.", "wwwwit.", "win.", "wig.", "wit."].map((word) => ({ word, mode: "wcut" as const, ms: [0.05, 0.1, 0.2], takes: 3 })),
    ],
    target: "/w/ said the school's way, 'wwwoo': lips tightly rounded and held, gliding into a very short 'oo' (NOT 'wuh', NOT the letter name 'double-u', NOT a long word-like 'wooo')",
    ok: (i) => /^w$/.test(norm(i)),
  },
  j: {
    tts: ["j", "dj", "juh"],
    cuts: ["jam.", "jet.", "jug.", "jog."].map((word) => ({ word, mode: "burst" as const, ms: [60, 80, 100] })),
    target: "/dʒ/ as at the start of jam: a short voiced affricate (NOT the letter name 'jay', no 'juh')",
    ok: (i) => /^dʒ$/.test(norm(i)),
  },
  y: {
    tts: ["y", "yy", "j"],
    cuts: [
      ...["yes.", "yak.", "yell.", "yum."].map((word) => ({ word, mode: "onset" as const, ms: [60, 80, 100, 130] })),
      ...["yyyyes.", "yyyyak.", "yyyyellow."].map((word) => ({ word, mode: "onset" as const, ms: [120, 170, 220, 280] })),
      ...["yes!", "yak!", "yell!", "yam."].map((word) => ({ word, mode: "glide" as const, ms: [110, 150, 190], takes: 3 })),
      ...["yyyyak.", "yyyyam.", "yak.", "yam.", "yap."].map((word) => ({ word, mode: "ycut" as const, ms: [0.3, 0.6, 1.2], takes: 3 })),
    ],
    target: "/y/ (IPA /j/) said the school's way, 'yyee': tongue high and held, gliding into a very short 'ee' (NOT 'yuh', NOT the letter name 'why', NOT a long word-like 'yeee')",
    ok: (i) => /^j$/.test(norm(i)),
  },
  k: {
    tts: ["k", "kh", "k."],
    cuts: ["cat.", "kit.", "cup.", "cot."].map((word) => ({ word, mode: "unvoiced" as const })),
    target: "/k/ as in cat: a short unvoiced release (NOT the letter name 'kay', no vowel after it)",
    ok: (i) => /^k$/.test(norm(i)),
  },
  th: {
    tts: ["thhhh", "θθθ", "thhhhhh"],
    cuts: ["thhhhin.", "thhhhick.", "thhhhhing.", "thhhumb."].map((word) => ({ word, mode: "unvoiced" as const })),
    target: "/θ/ as at the start of thin: a sustained unvoiced fricative with the tongue between the teeth (NOT f, NOT s, NOT t)",
    ok: (i) => /^θ+$/.test(norm(i)),
  },
  i: {
    tts: ["ih.", "ih", "i."],
    cuts: ["it.", "in.", "if."].map((word) => ({ word, mode: "vowel" as const })),
    target: "the short vowel /ɪ/ as in it and insect (NOT 'eye', NOT 'ee')",
    ok: (i) => /^ɪ$/.test(norm(i)),
  },
};

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const ids = (args.filter((a) => !a.startsWith("--")).length ? args.filter((a) => !a.startsWith("--")) : Object.keys(PLANS)) as PhonemeId[];
const TAKES = Number(process.env.TAKES ?? 2);
const report: Record<string, any[]> = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : {};

const py = (script: string, ...a: string[]) =>
  execFileSync("uv", ["run", "-q", "--with", "numpy", "python", `${ROOT}/scripts/${script}`, ...a]).toString().trim();

/** finishAudio, then: a clip too short to measure in LUFS (a stop) is peak-normalised to −1.5 dBFS like the control
 *  stops d, p and g, which can't be measured either. */
function finishAudio(wav: Buffer, out: string, opts: { pad?: number }) {
  finishSpeech(wav, out, opts);
  const l = measureLufs(out);
  if (Number.isFinite(l) && l > -70) return;
  const probe = Bun.spawnSync(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-af", "volumedetect", "-f", "null", "-"]);
  const max = parseFloat(String(probe.stderr).match(/max_volume: (-?[\d.]+) dB/)?.[1] ?? "NaN");
  if (!Number.isFinite(max)) return;
  const tmp = out.replace(/\.mp3$/, ".lvl.mp3");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", out, "-af", `volume=${(-1.5 - max).toFixed(2)}dB`, "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", tmp]);
  renameSync(tmp, out);
}

async function blind(file: string) {
  const r = await generate("gemini-3.8-flash", {
    contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
      { text: `This is one speech sound recorded for a British phonics game. Without any other context, identify exactly what you hear. Reply JSON only: {"ipa": "<IPA of everything you hear>", "addedVowel": <true if a schwa/'uh' or other vowel follows a consonant>, "isLetterName": <true if it sounds like an alphabet letter NAME (e.g. 'see', 'bee', 'jay', 'ex', 'wye')>, "clarity": <0-10>}` },
    ] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });
  try { return JSON.parse(textOf(r)); } catch { return { ipa: "?", addedVowel: true, isLetterName: true, clarity: 0 }; }
}

type Cand = { id: string; file: string; how: string };
const cands: Cand[] = [];
const jobs: (() => Promise<void>)[] = [];
for (const id of ids) {
  const plan = PLANS[id];
  if (!plan) { console.log("no plan for", id); continue; }
  mkdirSync(`${DIR}/${id}`, { recursive: true });
  for (const [si, text] of plan.tts.entries())
    for (let t = 0; t < TAKES; t++) {
      const file = `${DIR}/${id}/tts_${si}_${t}.mp3`;
      cands.push({ id, file, how: `tts ${JSON.stringify(text)}` });
      if (!existsSync(file)) jobs.push(async () => { finishAudio(await tts({ text, voice: VOICE }), file, { pad: 0.02 }); });
    }
  for (const cut of plan.cuts)
    for (let t = 0; t < (cut.takes ?? TAKES); t++) {
      const base = `${DIR}/${id}/w_${cut.word.replace(/\W/g, "")}${cut.word.endsWith("!") ? "X" : ""}_${t}`;
      const lens = cut.ms ?? [0];
      for (const ms of lens) cands.push({ id, file: `${base}_${cut.mode}${ms || ""}.mp3`, how: `${cut.mode}${ms ? " " + ms + " ms" : ""} of ${cut.word}` });
      if (lens.every((ms) => existsSync(`${base}_${cut.mode}${ms || ""}.mp3`))) continue;
      jobs.push(async () => {
        const word = `${base}.mp3`;
        if (!existsSync(word)) finishAudio(await tts({ text: cut.word, voice: VOICE }), word, { pad: 0.05 });
        for (const ms of lens) {
          const wav = `${base}_${cut.mode}${ms || ""}.wav`;
          try {
            py("cut-sound.py", word, wav, cut.mode, String(ms));
            finishAudio(readFileSync(wav), wav.replace(/\.wav$/, ".mp3"), { pad: 0.02 });
          } catch (e) { console.log("cut failed", wav, String(e).slice(0, 120)); }
        }
      });
    }
}
console.log(`${jobs.length} generation jobs, ${cands.length} candidates`);
await pool(jobs, 6, (j) => j());

await pool(cands.filter((c) => existsSync(c.file) && !report[c.id]?.some((r) => r.file === c.file && r.judged)), 8, async (c) => {
  const plan = PLANS[c.id as PhonemeId]!;
  const bl = [await blind(c.file), await blind(c.file)];
  const tg = [
    await judgeAudio(c.file, `The clip should be ONE pure speech sound for a Sounds~Write phonics game: ${plan.target}. Transcribe exactly what is said. Score 10 if it is exactly that pure sound, 0 if it is a letter name or has a vowel added.`),
    await judgeAudio(c.file, `A British phonics teacher wants the pure sound ${plan.target}. Is this clip exactly that sound on its own? Score 10 if yes; score 0 for a letter name, for any vowel added before or after, or for the wrong sound.`),
  ];
  const blindOk = bl.filter((b) => plan.ok(b.ipa) && !b.isLetterName && !b.addedVowel).length;
  const row = {
    file: c.file, how: c.how, dur: +durationOf(c.file).toFixed(3), judged: true,
    blind: bl.map((b) => `${b.ipa}${b.isLetterName ? " NAME" : ""}${b.addedVowel ? " +V" : ""}`).join(" | "), blindOk,
    target: tg.map((t) => t.score), heard: tg.map((t) => t.heard).join(" | "),
    score: blindOk * 10 + tg.reduce((a, t) => a + (t.score ?? 0), 0),
  };
  report[c.id] = (report[c.id] ?? []).filter((r) => r.file !== c.file);
  report[c.id].push(row);
  console.log(c.id.padEnd(3), row.how.padEnd(28), String(row.dur).padEnd(6), `blind ${blindOk}/2 [${row.blind}]`, `target ${row.target.join(",")} [${row.heard}]`);
  writeFileSync(REPORT, JSON.stringify(report, null, 1));
});
writeFileSync(REPORT, JSON.stringify(report, null, 1));

const summary: any[] = [];
for (const id of ids) {
  const rows = (report[id] ?? []).filter((r) => existsSync(r.file)).sort((a, b) => b.score - a.score || Math.abs(a.dur - 0.35) - Math.abs(b.dur - 0.35));
  const pass = rows.filter((r) => r.blindOk === 2 && Math.min(...r.target) >= 8);
  const best = pass[0];
  summary.push({ id, pass: pass.length, of: rows.length, best: best?.how ?? "-", dur: best?.dur, blind: best?.blind, target: best?.target?.join(",") });
  if (apply && best) {
    const dst = `${ROOT}/public/a/p/${id}.mp3`;
    mkdirSync(`${ROOT}/.trash/pure-sounds-r3`, { recursive: true });
    if (existsSync(dst)) renameSync(dst, `${ROOT}/.trash/pure-sounds-r3/${id}.before-${Date.now()}.mp3`);
    copyFileSync(best.file, dst);
    console.log("applied", id, "←", best.file);
  }
}
console.table(summary);
