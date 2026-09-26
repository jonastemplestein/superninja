// Gemini TTS + audio QA helpers.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { generate, inlineParts, textOf } from "./gemini";

export const TTS_MODEL = "gemini-3.8-flash-tts";

export async function tts(opts: { text: string; voice?: string; lang?: string; model?: string }): Promise<Buffer> {
  const json = await generate(opts.model ?? TTS_MODEL, {
    contents: [{ parts: [{ text: opts.text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        languageCode: opts.lang ?? "en-GB",
        voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice ?? "Sulafat" } },
      },
    },
  });
  const a = inlineParts(json).find((p) => p.mimeType.startsWith("audio/"));
  if (!a) throw new Error("no audio: " + JSON.stringify(json).slice(0, 300));
  // 3.8 returns a RIFF wav; older models return raw 24k PCM
  if (a.data.subarray(0, 4).toString() === "RIFF") return a.data;
  return pcmToWav(a.data);
}

function pcmToWav(pcm: Buffer, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/**
 * Speech loudness. docs/FIRST_MINUTES.md §12 asks for −18 LUFS ±1 LU; what matters is that every clip matches the
 * others, and the whole library (about 1,900 clips: lines, words, sounds, stretched words, story pages) is finished at
 * −16, so new clips are too (docs/DECISIONS.md, 26 Sep: re-levelling everything would re-encode every MP3).
 * checkLoudness() holds every new clip to ±1 LU of it.
 */
export const SPEECH_LUFS = -16;

/** Trim leading/trailing silence, normalise loudness, 25 ms fades at both ends (so a join never clicks), encode to mp3.
 *  Loudness is two-pass: measure the trimmed take, then one exact gain to SPEECH_LUFS (a single-pass loudnorm left short
 *  clips anywhere from −14.5 to −19.8), with a true-peak limiter at −1.5 dBTP. */
export function finishAudio(wav: Buffer, outMp3: string, opts: { pad?: number } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sn-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim =
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  const fades = "afade=t=in:d=0.025,areverse,afade=t=in:d=0.025,areverse";
  const trimmed = join(dir, "trim.wav");
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", inp, "-af", `${trim},${fades}`, "-ar", "44100", "-ac", "1", trimmed]);
  const gain = gainTo(trimmed, SPEECH_LUFS);
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", trimmed,
    "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, -1.5 / 20).toFixed(4)}:level=disabled,apad=pad_dur=${opts.pad ?? 0.05}`,
    "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", outMp3,
  ]);
  return outMp3;
}

/** The gain (dB) that brings a clip to `target` LUFS (0 if it can't be measured: a very short pure /t/). */
export function gainTo(file: string, target = SPEECH_LUFS): number {
  const lufs = measureLufs(file);
  return Number.isFinite(lufs) && lufs > -70 ? target - lufs : 0;
}
/** Integrated loudness (LUFS, EBU R128), NaN if it can't be measured. */
export function measureLufs(file: string): number {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=framelog=quiet", "-f", "null", "-"]);
  const m = String(r.stderr).match(/I:\s+(-?[\d.]+) LUFS/g);
  return m ? parseFloat(m[m.length - 1].replace(/[^-\d.]/g, "")) : NaN;
}

/** Is a clip within ±1 LU of the library's speech loudness? (Very short clips, a pure /t/, can't be measured: true.) */
export function checkLoudness(file: string, tolerance = 1): { ok: boolean; lufs: number } {
  const lufs = measureLufs(file);
  return { ok: !Number.isFinite(lufs) || lufs < -60 || Math.abs(lufs - SPEECH_LUFS) <= tolerance, lufs };
}

/**
 * A lead-in that ends on "..." is followed by a spliced pure sound or word, so its tail must be clean: no breath, "shh"
 * or stray consonant after the last word (docs/FIRST_MINUTES.md §12; wf_found_gem's first takes ended in a "shh" and
 * t_spelling_of in a stray /k/). Those show as a short last burst of sound after a pause. Returns its length (s), or
 * null if the clip ends on its words. (Tested on those rejected takes: 0.6 s, 0.55 s and 0.23 s; the kept takes: null.)
 */
export function trailingBlip(file: string): number | null {
  const dur = durationOf(file);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "silencedetect=noise=-42dB:d=0.1", "-f", "null", "-"]);
  const ends = [...String(r.stderr).matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => ({ end: parseFloat(m[1]), gap: parseFloat(m[2]) }));
  const last = ends.at(-1);
  if (!last || last.end >= dur - 0.02) return null; // no pause, or the file ends in silence
  const island = dur - last.end;
  return last.gap >= 0.2 && island < 0.7 && last.end > dur * 0.55 ? Math.round(island * 100) / 100 : null;
}

export function durationOf(file: string): number {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString();
  return parseFloat(out);
}

/** Ask Gemini to listen to a clip and judge it. Returns {score 0-10, notes}. */
export async function judgeAudio(file: string, rubric: string): Promise<{ score: number; heard: string; notes: string }> {
  const mime = file.endsWith(".mp3") ? "audio/mp3" : "audio/wav";
  const json = await generate("gemini-3.8-flash", {
    contents: [
      {
        parts: [
          { inlineData: { mimeType: mime, data: readFileSync(file).toString("base64") } },
          {
            text:
              `You are an expert UK synthetic-phonics teacher and phonetician auditing audio for a phonics game for British 4-7 year olds. Listen very carefully to the clip.\n\n${rubric}\n\n` +
              `Reply ONLY with JSON: {"heard": "<narrow IPA-ish transcription of exactly what you hear>", "score": <0-10 integer>, "notes": "<short reason>"}`,
          },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", temperature: 0 },
  });
  try {
    return JSON.parse(textOf(json));
  } catch {
    return { score: 0, heard: "?", notes: "unparseable: " + textOf(json).slice(0, 200) };
  }
}
