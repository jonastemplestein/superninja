// Missing Sounds~Write unit word audio and picture cards. Run under Doppler.
// bun scripts/content/gen-unit-assets.ts [--audio] [--pictures] [--only=word,...] [--redo=word,...]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PIC_STYLE } from "../art-manifest";
import { generate, textOf } from "../gemini";
import { makeImage } from "../img";
import { tts, finishAudio, judgeAudio } from "../tts";
import { SW_SEQUENCE, type SwUnitId } from "../../src/content/sw";
import { loadUnit } from "./validate-units";

const ROOT = resolve(import.meta.dir, "../..");
const AUDIT_DIR = join(ROOT, "playtest/runs/pics-units");
const REPLACE = new Set("nap hen dot fog fin hug tub pup cub jet hill twig stamp ship quilt squid bug jump desk".split(" "));
const args = process.argv.slice(2);
const doAudio = args.includes("--audio") || !args.some(a => ["--pictures", "--audit"].includes(a));
const doPictures = args.includes("--pictures") || !args.some(a => ["--audio", "--audit"].includes(a));
const STATUS = join(ROOT, doAudio && !doPictures ? "playtest/content/unit-assets-audio.json" : "playtest/content/unit-assets.json");
const only = new Set((args.find(a => a.startsWith("--only="))?.slice(7) ?? "").split(",").filter(Boolean));
const redo = new Set((args.find(a => a.startsWith("--redo="))?.slice(7) ?? "").split(",").filter(Boolean));
const limit = +(args.find(a => a.startsWith("--limit="))?.slice(8) ?? "0");
const status: Record<string, { ok: boolean; attempts: number; detail?: string }> = existsSync(STATUS) ? JSON.parse(readFileSync(STATUS, "utf8")) : {};
const save = () => { mkdirSync(join(ROOT, "playtest/content"), { recursive: true }); writeFileSync(STATUS, JSON.stringify(status, null, 2) + "\n"); };

async function each<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < items.length) await fn(items[next++]);
  }));
}

const units = SW_SEQUENCE.slice(0, SW_SEQUENCE.indexOf("EC26") + 1) as SwUnitId[];
const words = new Map<string, { pic?: string }>();
for (const unit of units) {
  const data = await loadUnit(unit);
  for (const w of data.words) {
    const old = words.get(w.text);
    words.set(w.text, { pic: old?.pic ?? w.pic });
  }
  for (const p of data.poly) if (!words.has(p.text)) words.set(p.text, {});
}
const selected = <T extends { word: string }>(jobs: T[]) => {
  const filtered = only.size ? jobs.filter(j => only.has(j.word)) : jobs;
  return limit ? filtered.slice(0, limit) : filtered;
};

const HOMOPHONES: Record<string, string[]> = {
  blue: ["blew"], blew: ["blue"], wood: ["would"], would: ["wood"],
  bear: ["bare"], bare: ["bear"], pear: ["pair"], pair: ["pear"],
  stair: ["stare"], stare: ["stair"], there: ["their"], their: ["there"],
  where: ["wear"], wear: ["where"], sea: ["see"], see: ["sea"],
  to: ["too", "two"], too: ["to", "two"], be: ["bee"], bee: ["be"],
  night: ["knight"], high: ["hi"], by: ["buy", "bye"],
  sail: ["sale"], kerb: ["curb"], herd: ["heard"], fir: ["fur"],
  threw: ["through"], son: ["sun"],
  won: ["one"], hare: ["hair"], few: ["phew"],
};
function sayText(word: string, attempt: number) {
  const capital = word[0].toUpperCase() + word.slice(1);
  return [`${word}.`, `${capital}.`, `${word}!`, word, `${capital}!`, `${word}...`][attempt - 1];
}
async function blindAudio(file: string, word: string) {
  const r = await generate("gemini-3.8-flash", {
    contents: [{ parts: [
      { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
      { text: "Transcribe this single spoken British English word. Reply only JSON: {\"word\":\"...\"}." },
    ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 },
  });
  const heard = String(JSON.parse(textOf(r)).word).toLowerCase().replace(/[^a-z]/g, "");
  return { heard, ok: heard === word || (HOMOPHONES[word] ?? []).includes(heard) };
}

if (doAudio) {
  const jobs = selected([...words.keys()].filter(word => !existsSync(join(ROOT, `public/a/w/${word}.mp3`))).map(word => ({ word })));
  console.log(`Audio: ${jobs.length} missing clips`);
  let finished = 0;
  await each(jobs, 8, async ({ word }) => {
    let detail = "";
    for (let attempt = 1; attempt <= 6; attempt++) {
      const tmp = join(tmpdir(), `sn-word-${process.pid}-${word}-${attempt}.mp3`);
      try {
        const wav = await tts({ text: sayText(word, attempt), voice: "Sulafat", lang: "en-GB" });
        finishAudio(wav, tmp);
        const rubric = `Exactly one naturally spoken Southern British English word, ${word}, once only, for a young child. Judge the phonetic word: ${HOMOPHONES[word]?.join(", ") ?? "no listed homophone"} would sound identical and is acceptable if transcribed that way. Score low for a genuinely different pronunciation, letter name, American accent, or added speech.`;
        const [judged, blind] = await Promise.all([judgeAudio(tmp, rubric), blindAudio(tmp, word)]);
        const hz = parseFloat(execFileSync("uv", ["run", "--with", "numpy", "python", "scripts/pitch.py", tmp], { cwd: ROOT }).toString()) || 0;
        const pitchOk = hz === 0 || (hz >= 140 && hz <= 290);
        detail = `score=${judged.score}, blind=${blind.heard}, pitch=${hz}`;
        if (judged.score >= 8 && blind.ok && pitchOk) {
          const out = join(ROOT, `public/a/w/${word}.mp3`);
          mkdirSync(join(ROOT, "public/a/w"), { recursive: true });
          renameSync(tmp, out);
          status[`audio:${word}`] = { ok: true, attempts: attempt, detail };
          save();
          break;
        }
      } catch (e) { detail = String(e).slice(0, 300); }
      if (attempt === 6) { status[`audio:${word}`] = { ok: false, attempts: attempt, detail }; save(); }
    }
    finished++;
    if (finished % 20 === 0) console.log(`Audio ${finished}/${jobs.length}`);
  });
}

function normalise(s: string) { return s.toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[^a-z\s]/g, "").trim(); }
async function blindPicture(file: string, word: string) {
  const r = await generate("gemini-3.8-flash", {
    contents: [{ parts: [
      { text: "You are a four-year-old British child looking at one picture card. What would you call the most prominent thing or action? Judge only what you see. Do not infer a target word. Reply only JSON: {\"name\":\"short everyday name\"}." },
      { inlineData: { mimeType: "image/webp", data: readFileSync(file).toString("base64") } },
    ] }], generationConfig: { responseMimeType: "application/json", temperature: 0 },
  });
  const name = normalise(String(JSON.parse(textOf(r)).name));
  const ok = new RegExp(`(^|\\s)${word}(s|es)?($|\\s)`).test(name);
  return { name, ok };
}

if (doPictures) {
  const jobs = selected([...words].filter(([word, w]) => w.pic &&
    (status[`picture:${word}`]?.attempts ?? 0) < 3 &&
    (redo.has(word) || !existsSync(join(ROOT, `public/a/i/pic_${word}.webp`)) || (REPLACE.has(word) && !status[`picture:${word}`]?.ok)))
    .map(([word, w]) => ({ word, pic: w.pic! })));
  console.log(`Pictures: ${jobs.length} missing or flagged cards`);
  mkdirSync(AUDIT_DIR, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "sn-unit-art-"));
  mkdirSync(join(work, "assets-src/art"), { recursive: true });
  mkdirSync(join(work, "public/a/i"), { recursive: true });
  writeFileSync(join(work, "assets-src/art-jobs.json"), JSON.stringify(jobs.map(({ word }) => ({ id: `pic_${word}`, w: 384, cut: true }))));
  const pending = new Map(jobs.map(j => [j.word, j]));
  const auditFile = join(AUDIT_DIR, "unit-asset-audit.json");
  const auditRows: { word: string; take: number; name?: string; ok: boolean; error?: string }[] =
    existsSync(auditFile) ? JSON.parse(readFileSync(auditFile, "utf8")) : [];
  for (let round = 1; pending.size; round++) {
    const active = [...pending.values()].filter(({ word }) => (status[`picture:${word}`]?.attempts ?? 0) < 3);
    if (!active.length) break;
    const take = new Map(active.map(({ word }) => [word, (status[`picture:${word}`]?.attempts ?? 0) + 1]));
    console.log(`Picture take ${round}: ${active.length}`);
    await each(active, 6, async ({ word, pic }) => {
      try {
        await makeImage({ out: join(work, `assets-src/art/pic_${word}.png`), prompt: `${pic}. ${PIC_STYLE}`, aspect: "1:1" });
      } catch (e) {
        const error = String(e).slice(0, 300);
        auditRows.push({ word, take: take.get(word)!, ok: false, error });
        status[`picture:${word}`] = { ok: false, attempts: take.get(word)!, detail: error }; save();
      }
    });
    const ready = active.map(({ word }) => word).filter(word => existsSync(join(work, `assets-src/art/pic_${word}.png`)));
    if (ready.length) {
      try {
        execFileSync("uv", ["run", "--with", "rembg[cpu]", "--with", "pillow", "python", join(ROOT, "scripts/post-art.py"), ...ready.map(w => `pic_${w}`)], { cwd: work, stdio: "ignore", maxBuffer: 32 * 1024 * 1024 });
      } catch (e) { console.log(`Post-art failed: ${String(e).slice(0, 300)}`); }
    }
    await each(ready, 6, async word => {
      const file = join(work, `public/a/i/pic_${word}.webp`);
      if (!existsSync(file)) return;
      try {
        const result = await blindPicture(file, word);
        auditRows.push({ word, take: take.get(word)!, ...result });
        if (result.ok) {
          const out = join(ROOT, `public/a/i/pic_${word}.webp`);
          if (existsSync(out)) {
            const trash = join(ROOT, ".trash");
            mkdirSync(trash, { recursive: true });
            renameSync(out, join(trash, `pic_${word}.${Date.now()}.webp`));
          }
          renameSync(file, out);
          status[`picture:${word}`] = { ok: true, attempts: take.get(word)!, detail: result.name };
          pending.delete(word);
        } else status[`picture:${word}`] = { ok: false, attempts: take.get(word)!, detail: `named ${result.name}` };
        save();
      } catch (e) {
        const error = String(e).slice(0, 300);
        auditRows.push({ word, take: take.get(word)!, ok: false, error });
        status[`picture:${word}`] = { ok: false, attempts: take.get(word)!, detail: error }; save();
      }
    });
    writeFileSync(auditFile, JSON.stringify(auditRows, null, 2) + "\n");
  }
  console.log(`Pictures unresolved: ${pending.size}`);
}

save();
console.log("Unit assets finished");
