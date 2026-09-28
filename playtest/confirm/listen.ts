// A second listen for the confirm's and the map's new clips (docs/CONFIRM.md §3.5): read-only, nothing is re-recorded.
// 1. Stretch artefacts: gen-audio lengthens a word-perfect take that is still faster than 3.3 words a second with Praat's
//    PSOLA (up to ×1.5). Every lengthened clip is played to the Gemini judge with a rubric about time-stretch artefacts,
//    beside unstretched clips of the same voice as controls, and deliberately ruined copies (playtest/confirm/listen/:
//    PSOLA ×2.2, ffmpeg atempo 0.55) as calibration. Finding (27 Sep): the judge gives 10/10 to all of them, the ruined
//    ones included, so it can't hear stretching and a person has to (playtest/confirm/listen.html).
// 2. Accent evidence: the clips whose report entry has a plain-text transcript instead of phonetics get a narrow IPA
//    transcript and an accent verdict.
// Writes playtest/confirm/logs/listen.json. Run: doppler run -p os-legacy-2026-04 -c dev -- bun playtest/confirm/listen.ts
import { readFileSync, writeFileSync } from "node:fs";
import { judgeAudio } from "../../scripts/tts";

const report: Record<string, any> = JSON.parse(readFileSync("assets-src/audio-report.json", "utf8"));
const PREFIXES = ["tv_confirm_", "tv_map_help", "tv_map_locked", "tv_map_away", "tv_map_replay_", "tv_map_other"];
const ours = Object.keys(report).filter((k) => PREFIXES.some((p) => k.startsWith(`public/a/l/${p}`)));
const id = (k: string) => k.replace(/^public\/a\/l\//, "").replace(/\.mp3$/, "");
const stretched = ours.filter((k) => report[k].lengthened);
const controls = ours.filter((k) => !report[k].lengthened && !report[k].widened && report[k].seconds > 1.4).slice(0, 6);
const plain = ours.filter((k) => /^[A-Za-z ,.?!']+$/.test(report[k].heard ?? ""));

const ARTEFACTS = (text: string) =>
  `The clip is a British teacher's voice saying: "${text}". It may have been slowed down after recording with a time-stretch (pitch-synchronous overlap-add). Listen only for processing artefacts: a warbly, phasey, metallic, buzzy or robotic quality; doubled, smeared or stuttering consonants; vowels drawn out unnaturally; a choppy or mechanical rhythm; a pitch that wobbles. Ignore the words and the accent. Score 10 if it sounds like natural, unprocessed speech at a calm pace; 8-9 if a trained ear might just notice processing but a child and a parent would not; 6-7 if a parent would notice something odd; 5 or less if it is clearly artificial. In "notes", name any artefact you hear and where (which word).`;
const ACCENT = (text: string) =>
  `The clip should be a British-accented voice reading exactly: "${text}". Transcribe it in narrow IPA in "heard" (not in spelling). Score 10 if it matches the script with a natural Southern British (RP-like) accent; score low for missing or added words or a non-British accent. In "notes", name the vowels that show the accent (for example the GOAT vowel /əʊ/, the LOT vowel /ɒ/, a non-rhotic r).`;

const CALIBRATION: [string, string][] = [
  ["playtest/confirm/listen/bad_psola_x2.2.mp3", "Do you want to stop the gem battle? Your gem will wait for you."],
  ["playtest/confirm/listen/bad_atempo_0.55.mp3", "Tap the house to go home. Or tap the green arrow to keep playing."],
  ["playtest/confirm/listen/psola_x1.36.mp3", "Do you want to stop the gem battle? Your gem will wait for you."],
];
const out: Record<string, unknown> = { stretched: [], controls: [], calibration: [], accent: [] };
for (const [file, text] of CALIBRATION) {
  const r = await judgeAudio(file, ARTEFACTS(text));
  (out.calibration as unknown[]).push({ file, score: r.score, notes: r.notes });
  console.log("calibration", file, r.score, r.notes);
}
for (const [group, keys] of [["stretched", stretched], ["controls", controls]] as const) {
  for (const k of keys) {
    const r = await judgeAudio(k, ARTEFACTS(report[k].text));
    const row = { id: id(k), lengthened: report[k].lengthened ?? null, widened: report[k].widened ?? null, score: r.score, notes: r.notes };
    (out[group] as unknown[]).push(row);
    console.log(group, row.id, row.lengthened ?? "-", r.score, r.notes);
  }
}
for (const k of plain) {
  const r = await judgeAudio(k, ACCENT(report[k].text));
  const row = { id: id(k), score: r.score, heard: r.heard, notes: r.notes };
  (out.accent as unknown[]).push(row);
  console.log("accent", row.id, r.score, r.heard, r.notes);
}
writeFileSync("playtest/confirm/logs/listen.json", JSON.stringify(out, null, 1) + "\n");
