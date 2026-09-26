// The finals for scripts/gen-pure-sounds.ts: its best candidates for each sound, plus the clip in the game now, judged
// again many times (short glides and stops split single judges): 6 targeted judgments ("is this exactly /b/, with no
// letter name and no vowel?"; for /w/ and /y/ the school's "wwwoo" and "yyee", docs/DECISIONS.md), at temperature 0.7,
// and 6 blind ones ("what do you hear?"). A candidate's final score is its mean targeted score, minus 3 for each blind
// judgment that heard a letter name and 1.5 for each that heard a vowel added (not for /w/ and /y/). Also run
// scripts/phonemes/qa.py on a winner before it goes in (docs/TREADMILL.md). Prints the table; --apply puts each winner in public/a/p/ (the old clip goes to .trash/pure-sounds-r3/) when it
// beats the clip in the game.
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/pure-sound-finals.ts b w y [--top 8] [--apply]
import { existsSync, readFileSync, mkdirSync, copyFileSync, renameSync, writeFileSync } from "node:fs";
import { generate, textOf, pool } from "./gemini";

const ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja";
const REPORT = `${ROOT}/assets-src/phonemes-r3/report.json`;
const FINALS = `${ROOT}/assets-src/phonemes-r3/finals.json`;
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const top = Number(args[args.indexOf("--top") + 1]) || 8;
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--top");
const TARGET: Record<string, string> = {
  b: "/b/ as in bat: a short voiced release (NOT the letter name 'bee', no 'buh')",
  ks: "/ks/ as at the end of box: a short k straight into s (NOT the letter name 'ex', no vowel before or after)",
  w: "/w/ said the school's way, 'wwwoo': lips tightly rounded and held, gliding into a very short 'oo' (NOT 'wuh', NOT the letter name 'double-u', NOT a long word-like 'wooo')",
  y: "/y/ (IPA /j/) said the school's way, 'yyee': tongue high and held, gliding into a very short 'ee' (NOT 'yuh', NOT the letter name 'why', NOT a long word-like 'yeee')",
  k: "/k/ as in cat: a short unvoiced release (NOT the letter name 'kay', no vowel after it)",
  th: "/θ/ as at the start of thin: a sustained unvoiced fricative with the tongue between the teeth (NOT f, NOT s, NOT t)",
  i: "the short vowel /ɪ/ as in it and insect (NOT 'eye', NOT 'ee')",
  j: "/dʒ/ as at the start of jam: a short voiced affricate (NOT the letter name 'jay', no 'juh')",
};

async function ask(file: string, text: string): Promise<any> {
  const r = await generate("gemini-3.8-flash", {
    contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } }, { text }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });
  try { return JSON.parse(textOf(r)); } catch { return null; }
}
const targeted = (file: string, id: string) =>
  ask(file, `You are an expert UK synthetic-phonics teacher and phonetician. The clip should be ONE pure speech sound for a Sounds~Write phonics game: ${TARGET[id]}. Listen carefully. Reply ONLY with JSON: {"heard": "<narrow IPA of exactly what you hear>", "score": <0-10: 10 if it is exactly that pure sound; 0 if it is a letter name, has a vowel added, or is the wrong sound>}`);
const blind = (file: string) =>
  ask(file, `This is one speech sound recorded for a British phonics game. Without any other context, identify exactly what you hear. Reply JSON only: {"ipa": "<IPA of everything you hear>", "addedVowel": <true if a schwa/'uh' or other vowel follows a consonant>, "isLetterName": <true if it sounds like an alphabet letter NAME (e.g. 'see', 'bee', 'jay', 'ex', 'wye', 'double-u')>}`);

const report: Record<string, any[]> = JSON.parse(readFileSync(REPORT, "utf8"));
const finals: Record<string, any[]> = existsSync(FINALS) ? JSON.parse(readFileSync(FINALS, "utf8")) : {};
for (const id of ids) {
  const cands = (report[id] ?? []).filter((r) => existsSync(r.file)).sort((a, b) => b.score - a.score).slice(0, top).map((r) => ({ file: r.file, how: r.how }));
  cands.push({ file: `${ROOT}/public/a/p/${id}.mp3`, how: "IN THE GAME NOW" });
  const rows: any[] = [];
  await pool(cands, 6, async (c) => {
    const t = await Promise.all(Array.from({ length: 6 }, () => targeted(c.file, id)));
    const bl = await Promise.all(Array.from({ length: 6 }, () => blind(c.file)));
    const tScores = t.map((x) => Number(x?.score ?? 0));
    const names = bl.filter((x) => x?.isLetterName).length, vowels = bl.filter((x) => x?.addedVowel).length;
    const mean = tScores.reduce((a, b) => a + b, 0) / tScores.length;
    // (/w/ and /y/ are taught with a short vowel after them, "wwwoo" and "yyee": a blind "vowel added" is no fault there)
    const vowelCost = id === "w" || id === "y" ? 0 : 1.5;
    rows.push({ ...c, mean: +mean.toFixed(2), names, vowels, final: +(mean - 3 * names - vowelCost * vowels).toFixed(2), heard: t.map((x) => x?.heard).join(" "), blind: bl.map((x) => x?.ipa).join(" ") });
  });
  rows.sort((a, b) => b.final - a.final);
  finals[id] = rows;
  console.log(`\n${id}`);
  for (const r of rows) console.log(`  ${String(r.final).padStart(6)}  mean ${r.mean} names ${r.names} vowels ${r.vowels}  ${r.how.padEnd(26)} ${r.file.split("/").slice(-2).join("/")}  [${r.heard}] blind [${r.blind}]`);
  const now = rows.find((r) => r.how === "IN THE GAME NOW")!;
  const best = rows[0];
  if (apply && best && best.how !== "IN THE GAME NOW" && best.final > now.final) {
    const dst = `${ROOT}/public/a/p/${id}.mp3`;
    mkdirSync(`${ROOT}/.trash/pure-sounds-r3`, { recursive: true });
    // the clip it replaces is kept (never overwritten): <id>.before.mp3, then <id>.before-<time>.mp3
    const keep = `${ROOT}/.trash/pure-sounds-r3/${id}.before${existsSync(`${ROOT}/.trash/pure-sounds-r3/${id}.before.mp3`) ? `-${Date.now()}` : ""}.mp3`;
    renameSync(dst, keep);
    copyFileSync(best.file, dst);
    console.log(`  applied ${id} ← ${best.file} (${best.final} over ${now.final})`);
  }
}
writeFileSync(FINALS, JSON.stringify(finals, null, 1));
