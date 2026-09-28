// A second listen to the map's recorded lines (and, read-only, the confirm's), after the judge's note that many were
// slowed with Praat PSOLA (gen-audio's `lengthened`, up to ×1.36) to meet the 3.3 words-a-second cap, and that three
// had plain-text transcripts instead of phonetics (docs/MAP_DESIGN.md §11.1).
//   doppler run -p os-legacy-2026-04 -c dev -- bun docs/map-design/final/scripts/audio-check.ts
// For every clip, Gemini (the model gen-audio's judge uses) listens to the finished MP3 and returns:
//   - a narrow IPA transcription (IPA only, never spelling) and the accent it hears, with the vowels that show it;
//   - how natural it sounds (0–10) and any processing artefacts (slowed, drawly, warbly, metallic, echoey, smeared).
// For a lengthened clip it also runs a blind A/B: the finished clip and one untouched take of the same line
// (assets-src/tmp/l/<id>.try0.mp3), in a random order: which one was slowed, and how audible is it (0–10)?
// And two controls, so the A/B can be read: the same standalone listen on the untouched take (`raw`), and the same A/B
// on two untouched takes of the line (`abControl`: nothing was slowed, so a good listener says "neither").
// Writes docs/map-design/final/shots/audio-check.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { generate, textOf } from "../../../../scripts/gemini";

const ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja";
const report = JSON.parse(readFileSync(`${ROOT}/assets-src/audio-report.json`, "utf8"));
const MAP = ["tv_map_help", "tv_map_locked", "tv_map_away", ...["ears", "picread", "firstsound", "soundhunt", "dojo", "battle", "boss", "run", "swap", "story", "sort", "how", "yes", "next"].map((k) => `tv_map_replay_${k}`), "tv_map_other", "tv_map_other_how"];
const CONFIRM = ["yes", "no", "how", "again", "replay", "leave", "leave_boss", "leave_trial"].map((k) => `tv_confirm_${k}`);
const only = process.argv.slice(2);
const ids = only.length ? only : [...MAP, ...CONFIRM];
const mp3 = (p: string) => ({ inlineData: { mimeType: "audio/mp3", data: readFileSync(p).toString("base64") } });

async function ask(parts: unknown[]): Promise<any> {
  const json = await generate("gemini-3.8-flash", { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  try {
    return JSON.parse(textOf(json));
  } catch {
    return { error: textOf(json).slice(0, 300) };
  }
}

async function standalone(file: string, text: string) {
  return ask([
    mp3(file),
    {
      text:
        `You are a phonetician and a sound engineer checking a voice line for a phonics game for British children aged 3 to 8. The script is: "${text}". Listen carefully to the clip.\n` +
        `1. heard_ipa: a narrow IPA transcription of exactly what is said. IPA symbols only, never English spelling (if you write ordinary words, the answer is rejected).\n` +
        `2. accent: which accent this is ("Southern British English (RP-like)", "other British English", "General American", "Australian", or "other"), and accent_evidence: the words whose vowels or /r/ show it (for example GOAT /əʊ/ vs /oʊ/, LOT /ɒ/ vs /ɑ/, BATH /ɑː/ vs /æ/, a non-rhotic ending).\n` +
        `3. natural: 0–10, how natural and warm the delivery sounds (10: a real person speaking calmly). processed: 0–10, how audible any digital processing is (0: none; 10: obvious): time-stretching or slowing, drawn-out vowels, warble, a metallic or phasey sound, echo, smeared or doubled consonants, clicks. artefacts: a short list of what you hear and where, or [].\n` +
        `Reply ONLY with JSON: {"heard_ipa": "...", "accent": "...", "accent_evidence": "...", "natural": n, "processed": n, "artefacts": ["..."]}`,
    },
  ]);
}
function abTest(a: string, b: string, text: string) {
  return ask([
    { text: "Clip A:" },
    mp3(a),
    { text: "Clip B:" },
    mp3(b),
    {
      text:
        `Clips A and B are the same sentence ("${text}") in the same voice. One of them may have been digitally slowed down (time-stretched) afterwards. ` +
        `Which one sounds slowed or processed ("A", "B", or "neither")? How audible is the slowing or processing in that clip, 0–10 (0: can't tell; 10: obvious and unpleasant)? What gives it away? ` +
        `Reply ONLY with JSON: {"slowed": "A" | "B" | "neither", "audible": n, "why": "..."}`,
    },
  ]);
}
async function listen(id: string) {
  const file = `${ROOT}/public/a/l/${id}.mp3`;
  const r = report[`public/a/l/${id}.mp3`] ?? {};
  const text: string = r.text ?? "";
  const out: any = { id, text, lengthened: r.lengthened ?? null, widened: r.widened ?? null, seconds: r.seconds ?? null, wps: r.wps ?? null, ...(await standalone(file, text)) };
  const raw = `${ROOT}/assets-src/tmp/l/${id}.try0.mp3`, raw2 = `${ROOT}/assets-src/tmp/l/${id}.try1.mp3`;
  if (r.lengthened && existsSync(raw)) {
    const swap = Math.random() < 0.5;
    const ab = await abTest(swap ? raw : file, swap ? file : raw, text);
    out.ab = { finished: swap ? "B" : "A", ...ab, picked_finished: ab.slowed === (swap ? "B" : "A") };
    const s = await standalone(raw, text);
    out.raw = { natural: s.natural, processed: s.processed, artefacts: s.artefacts };
    if (existsSync(raw2)) out.abControl = await abTest(raw, raw2, text);
  }
  return out;
}

const results: any[] = [];
for (let i = 0; i < ids.length; i += 6) results.push(...(await Promise.all(ids.slice(i, i + 6).map(listen))));
for (const x of results)
  console.log(
    `${x.id.padEnd(26)} ×${(x.lengthened ?? 1).toFixed(2)} natural ${x.natural} processed ${x.processed}${x.raw ? ` (raw take: ${x.raw.natural}/${x.raw.processed})` : ""}${x.ab ? ` | A/B: picked ${x.ab.slowed} (finished ${x.ab.finished}) audible ${x.ab.audible}; control ${x.abControl?.slowed} ${x.abControl?.audible}` : ""} | ${x.accent} | ${x.heard_ipa}`,
  );
const out = `${ROOT}/docs/map-design/final/shots/audio-check.json`;
const prev = only.length && existsSync(out) ? JSON.parse(readFileSync(out, "utf8")).clips ?? [] : [];
const merged = [...prev.filter((p: any) => !ids.includes(p.id)), ...results];
writeFileSync(out, JSON.stringify({ made: new Date().toISOString(), model: "gemini-3.8-flash", clips: merged }, null, 1));
console.log("wrote", out);
