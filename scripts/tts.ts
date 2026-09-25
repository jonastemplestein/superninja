// Gemini TTS + audio QA helpers.
import { execFileSync } from "node:child_process";
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

/** Trim leading/trailing silence, normalise loudness, encode to mp3. */
export function finishAudio(wav: Buffer, outMp3: string, opts: { pad?: number } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sn-"));
  const inp = join(dir, "in.wav");
  writeFileSync(inp, wav);
  mkdirSync(dirname(outMp3), { recursive: true });
  const trim =
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03," +
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", inp,
    "-af", `${trim},loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=${opts.pad ?? 0.05}`,
    "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "4", outMp3,
  ]);
  return outMp3;
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
