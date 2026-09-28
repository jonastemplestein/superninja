// Model providers for trailer assets. Every function writes exactly one output file.
// Picks and trade-offs are documented in docs/MEDIA_MODELS.md.
import { readFileSync, writeFileSync } from "node:fs";
import { cfAccount, cfToken, ensureDir, ffmpeg, geminiKey, log, p } from "./lib";
import { dirname } from "node:path";

const GEM = "https://generativelanguage.googleapis.com/v1beta";

async function retry<T>(label: string, fn: () => Promise<T>, tries = 3): Promise<T> {
  let err: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      log(`${label}: attempt ${i + 1} failed: ${String(e).slice(0, 300)}`);
      await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
    }
  }
  throw err;
}

const mimeOf = (f: string) => (f.endsWith(".png") ? "image/png" : f.endsWith(".webp") ? "image/webp" : "image/jpeg");
const b64 = (f: string) => readFileSync(p(f)).toString("base64");

async function gemJson(path: string, body: unknown) {
  const res = await fetch(`${GEM}/${path}`, {
    method: "POST",
    headers: { "x-goog-api-key": geminiKey(), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 500)}`);
  return json;
}

// ---------- images: Nano Banana Pro (gemini-3-pro-image) ----------
export async function genImage(out: string, r: { prompt: string; refs?: string[]; model?: string; aspect?: string; size?: string }) {
  const json = await retry("image", () =>
    gemJson(`models/${r.model ?? "gemini-3-pro-image"}:generateContent`, {
      contents: [{ parts: [...(r.refs ?? []).map((f) => ({ inlineData: { mimeType: mimeOf(f), data: b64(f) } })), { text: r.prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: r.aspect ?? "16:9", ...(r.size ? { imageSize: r.size } : {}) } },
    }),
  );
  const part = (json.candidates?.[0]?.content?.parts ?? []).find((x: any) => x.inlineData);
  if (!part) throw new Error("no image: " + JSON.stringify(json).slice(0, 400));
  ensureDir(dirname(out));
  writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
}

// ---------- video: Gemini Omni 1.1 Flash (Interactions API) ----------
export async function genOmni(out: string, r: { prompt: string; image?: string; lastFrame?: string; refs?: string[]; aspect?: "16:9" | "9:16"; resolution?: string; model?: string }) {
  const input: any[] = [];
  for (const f of [r.image, r.lastFrame, ...(r.refs ?? [])].filter(Boolean) as string[]) input.push({ type: "image", data: b64(f), mime_type: mimeOf(f) });
  input.push({ type: "text", text: r.prompt });
  const json = await retry("omni", () =>
    gemJson("interactions", {
      model: r.model ?? "gemini-omni-1.1-flash",
      input,
      response_format: { type: "video", aspect_ratio: r.aspect ?? "16:9", resolution: r.resolution ?? "1080p", delivery: "uri" },
      ...(r.image && !r.refs?.length ? { generation_config: { video_config: { task: "image_to_video" } } } : {}),
    }),
  );
  const vid = (json.steps ?? []).flatMap((s: any) => s.content ?? []).find((c: any) => c.type === "video");
  if (!vid) throw new Error("omni returned no video: " + JSON.stringify(json).slice(0, 600));
  let buf: Buffer;
  if (vid.data) buf = Buffer.from(vid.data, "base64");
  else {
    const id = String(vid.uri).match(/files\/([A-Za-z0-9_-]+)/)?.[1];
    if (!id) throw new Error("omni: unexpected uri " + vid.uri);
    for (let i = 0; i < 120; i++) {
      const f: any = await (await fetch(`${GEM}/files/${id}`, { headers: { "x-goog-api-key": geminiKey() } })).json();
      if (f.state === "ACTIVE") break;
      if (f.state === "FAILED") throw new Error("omni file failed");
      await new Promise((r) => setTimeout(r, 3000));
    }
    const res = await fetch(`https://generativelanguage.googleapis.com/download/v1beta/files/${id}:download?alt=media`, { headers: { "x-goog-api-key": geminiKey() } });
    if (!res.ok) throw new Error(`omni download ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }
  ensureDir(dirname(out));
  writeFileSync(out, buf);
}

// ---------- video fallback: Veo 3.1 (predictLongRunning) ----------
export async function genVeo(out: string, r: { prompt: string; image?: string; model?: string; aspect?: string; resolution?: string }) {
  const model = r.model ?? "veo-3.1-generate-preview";
  let op: any = await gemJson(`models/${model}:predictLongRunning`, {
    instances: [{ prompt: r.prompt, ...(r.image ? { image: { bytesBase64Encoded: b64(r.image), mimeType: mimeOf(r.image) } } : {}) }],
    parameters: { aspectRatio: r.aspect ?? "16:9", resolution: r.resolution ?? "1080p" },
  });
  while (!op.done) {
    await new Promise((res) => setTimeout(res, 10000));
    op = await (await fetch(`${GEM}/${op.name}`, { headers: { "x-goog-api-key": geminiKey() } })).json();
  }
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error("veo: " + JSON.stringify(op).slice(0, 500));
  const buf = Buffer.from(await (await fetch(uri, { headers: { "x-goog-api-key": geminiKey() }, redirect: "follow" })).arrayBuffer());
  ensureDir(dirname(out));
  writeFileSync(out, buf);
}

// ---------- Cloudflare AI Gateway unified catalogue (/ai/run) ----------
async function cfRun(model: string, input: unknown): Promise<any> {
  return retry(model, async () => {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run`, {
      method: "POST",
      headers: { authorization: `Bearer ${cfToken()}`, "content-type": "application/json" },
      body: JSON.stringify({ model, input }),
    });
    const json: any = await res.json();
    if (!json.success) throw new Error(`${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 400)}`);
    return json.result?.result ?? json.result;
  });
}

async function download(url: string, out: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url.slice(0, 120)}`);
  ensureDir(dirname(out));
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

export interface MusicChunk { text: string; ms: number; styles: string[]; avoid?: string[] }
/** ElevenLabs Music v2: a composition plan gives each section an exact length, so the score lands on the cut. */
export async function genElevenMusic(out: string, r: { chunks?: MusicChunk[]; prompt?: string; ms?: number; seed?: number; instrumental?: boolean }) {
  const input: any = { output_format: "mp3_44100_192", ...(r.seed != null ? { seed: r.seed } : {}) };
  if (r.chunks) {
    input.composition_plan = {
      chunks: r.chunks.map((c) => ({ text: c.text, duration_ms: Math.max(3000, Math.round(c.ms)), positive_styles: c.styles, negative_styles: c.avoid ?? [] })),
    };
  } else {
    input.prompt = r.prompt;
    input.music_length_ms = Math.max(3000, Math.round(r.ms ?? 10000));
    input.force_instrumental = r.instrumental ?? true;
  }
  const res = await cfRun("elevenlabs/music-v2", input);
  if (!res?.audio) throw new Error("music: no audio " + JSON.stringify(res).slice(0, 300));
  await download(res.audio, out);
}

/** Lyria 3.5 via Gemini API: great sound, but no duration control (kept as an alternative engine). */
export async function genLyria(out: string, r: { prompt: string }) {
  const json = await retry("lyria", () => gemJson("models/lyria-3.5:generateContent", { contents: [{ parts: [{ text: r.prompt }] }] }));
  const part = (json.candidates?.[0]?.content?.parts ?? []).find((x: any) => x.inlineData?.mimeType?.startsWith("audio/"));
  if (!part) throw new Error("lyria: no audio");
  ensureDir(dirname(out));
  writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
}

// ---------- voices ----------
/** Gemini TTS (same voices as the game: Sensei = Erinome, Baron = Algenib). Plain text only: it reads directions aloud. */
export async function genGeminiTts(out: string, r: { text: string; voice: string; model?: string }) {
  const json = await retry("tts", () =>
    gemJson(`models/${r.model ?? "gemini-3.8-flash-tts"}:generateContent`, {
      contents: [{ parts: [{ text: r.text }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { languageCode: "en-GB", voiceConfig: { prebuiltVoiceConfig: { voiceName: r.voice } } } },
    }),
  );
  const part = (json.candidates?.[0]?.content?.parts ?? []).find((x: any) => x.inlineData?.mimeType?.startsWith("audio/"));
  if (!part) throw new Error("tts: no audio");
  let buf = Buffer.from(part.inlineData.data, "base64");
  const raw = out.replace(/\.\w+$/, ".raw.wav");
  if (buf.subarray(0, 4).toString() !== "RIFF") buf = pcmToWav(buf);
  ensureDir(dirname(out));
  writeFileSync(raw, buf);
  finishVoice(raw, out);
}

/** ElevenLabs v3 via Cloudflare (used for the trailer narrator). */
export async function genElevenTts(out: string, r: { text: string; voiceId: string; model?: string }) {
  const res = await cfRun(r.model ?? "elevenlabs/eleven-v3", { text: r.text, voice_id: r.voiceId, output_format: "mp3_44100_192", language_code: "en" });
  if (!res?.audio) throw new Error("eleven tts: no audio " + JSON.stringify(res).slice(0, 300));
  const raw = out.replace(/\.\w+$/, ".raw.mp3");
  await download(res.audio, raw);
  finishVoice(raw, out);
}

function finishVoice(raw: string, out: string) {
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse";
  ffmpeg(["-i", raw, "-af", `${trim},loudnorm=I=-16:TP=-1.5:LRA=11`, "-ar", "48000", "-ac", "1", out]);
}

function pcmToWav(pcm: Buffer, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// ---------- synthesised trailer sound design (deterministic, free) ----------
export type SynthKind = "boom" | "hit" | "riser" | "whoosh" | "reverse" | "tick" | "shimmer";
export function synthSfx(out: string, r: { kind: SynthKind; dur?: number; pitch?: number }) {
  const d = r.dur ?? ({ boom: 3.5, hit: 1.6, riser: 3, whoosh: 0.7, reverse: 1.5, tick: 0.25, shimmer: 2 } as const)[r.kind];
  const f = r.pitch ?? 1;
  const n = "(random(0)*2-1)";
  const exprs: Record<SynthKind, string> = {
    // sub drop + body + noisy transient
    boom: `0.95*sin(2*PI*(${38 * f}*t+${30 * f}*(1-exp(-t*6))/6))*exp(-t*1.1)+0.5*sin(2*PI*${75 * f}*t)*exp(-t*5)+0.6*${n}*exp(-t*28)`,
    hit: `0.8*sin(2*PI*(${62 * f}*t+${80 * f}*(1-exp(-t*18))/18))*exp(-t*4)+0.55*${n}*exp(-t*22)`,
    riser: `(0.35*${n}+0.4*sin(2*PI*(${120 * f}*t+${700 * f}*t*t/(2*${d}))))*pow(t/${d},2.2)`,
    whoosh: `${n}*sin(PI*t/${d})*0.8`,
    reverse: `${n}*pow(t/${d},3)*0.9`,
    tick: `sin(2*PI*${1400 * f}*t)*exp(-t*40)*0.7`,
    shimmer: `(sin(2*PI*${1320 * f}*t)+sin(2*PI*${1980 * f}*t)*0.6+sin(2*PI*${2640 * f}*t)*0.4)*exp(-t*1.6)*0.25*(1+0.3*sin(2*PI*9*t))`,
  };
  const post: Record<SynthKind, string> = {
    boom: "lowpass=f=900,aecho=0.6:0.5:60|120:0.3|0.2",
    hit: "lowpass=f=2500,aecho=0.7:0.5:40|90:0.25|0.15",
    riser: `highpass=f=200,lowpass=f=9000`,
    whoosh: "bandpass=f=900:width_type=o:w=2.5",
    reverse: "highpass=f=1500",
    tick: "highpass=f=400",
    shimmer: "aecho=0.8:0.7:80|160:0.4|0.3",
  };
  ffmpeg(["-f", "lavfi", "-i", `aevalsrc=${exprs[r.kind].replace(/,/g, "\\,")}:s=48000:d=${d}`, "-af", `${post[r.kind]},aformat=channel_layouts=stereo,alimiter=limit=0.95`, "-ar", "48000", out]);
}
