// Lip-sync experiments for Baron Muddle's lines in the intro film (docs/INTRO_STORYBOARD.md, "Lip-sync").
// Each engine takes a start frame + the game's own Baron line (Gemini TTS, Algenib) and returns a video whose
// mouth movements follow that audio.
//   omni     Gemini Omni 1.1 Flash, Interactions API, with the line as an audio input part
//   seedance ByteDance Seedance 2.5 via Cloudflare AI Gateway (reference_audios)
//   avatar   Pruna p-video-avatar via Cloudflare AI Gateway (audio-driven talking video; rejects data URIs)
//   pvideo   Pruna p-video via Cloudflare AI Gateway (image-to-video conditioned on an audio clip)
// Run: doppler run -p os -c dev -- bun assets-src/intro-v3/lipsync/lipsync.ts <engine> <frame.png> <audio.mp3|wav> <out.mp4> "<prompt>" [--last=frame.png] [--dur=N] [--res=720p]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { geminiKey, cfAccount, cfToken } from "../../../scripts/trailer/lib";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const i = a.indexOf("="); return [a.slice(2, i < 0 ? undefined : i), i < 0 ? "1" : a.slice(i + 1)]; }));
const [engine, frame, audio, out, prompt] = args.filter((a) => !a.startsWith("--"));
const mime = (f: string) => (f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") ? "image/jpeg" : f.endsWith(".mp3") ? "audio/mpeg" : f.endsWith(".wav") ? "audio/wav" : "application/octet-stream");
const b64 = (f: string) => readFileSync(f).toString("base64");
const dataUri = (f: string) => `data:${mime(f)};base64,${b64(f)}`;
mkdirSync(dirname(out), { recursive: true });
const t0 = Date.now();

async function download(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`download ${res.status} ${url.slice(0, 120)}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

// Cloudflare AI Gateway /ai/run is synchronous and video models can take several minutes, longer than fetch's
// idle timeout, so the call goes through curl with a 30-minute limit.
async function cfRun(model: string, input: unknown) {
  const tmp = `${out}.request.json`; // kept next to the output as a record of the call
  writeFileSync(tmp, JSON.stringify({ model, input }));
  const raw = execFileSync("curl", ["-s", "--max-time", "1800", "-X", "POST", `https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run`,
    "-H", `Authorization: Bearer ${cfToken()}`, "-H", "Content-Type: application/json", "--data-binary", `@${tmp}`], { maxBuffer: 1 << 26 }).toString();
  const json: any = JSON.parse(raw);
  if (!json.success) throw new Error(`${JSON.stringify(json.errors ?? json).slice(0, 800)}`);
  return json.result?.result ?? json.result;
}

if (engine === "omni") {
  const input: any[] = [{ type: "image", data: b64(frame), mime_type: mime(frame) }];
  if (flags.last) input.push({ type: "image", data: b64(flags.last), mime_type: mime(flags.last) });
  input.push({ type: "audio", data: b64(audio), mime_type: mime(audio) });
  input.push({ type: "text", text: prompt });
  const body: any = {
    model: "gemini-omni-1.1-flash",
    input,
    response_format: { type: "video", aspect_ratio: "16:9", resolution: flags.res ?? "1080p", delivery: "uri" },
  };
  if (flags.task) body.generation_config = { video_config: { task: flags.task } };
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": geminiKey(), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json).slice(0, 800)}`);
  const vid = (json.steps ?? []).flatMap((s: any) => s.content ?? []).find((c: any) => c.type === "video");
  if (!vid) throw new Error("no video: " + JSON.stringify(json).slice(0, 800));
  if (vid.data) writeFileSync(out, Buffer.from(vid.data, "base64"));
  else {
    const id = String(vid.uri).match(/files\/([A-Za-z0-9_-]+)/)![1];
    for (let i = 0; i < 120; i++) {
      const f: any = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${id}`, { headers: { "x-goog-api-key": geminiKey() } })).json();
      if (f.state === "ACTIVE") break;
      await new Promise((r) => setTimeout(r, 3000));
    }
    await download(`https://generativelanguage.googleapis.com/download/v1beta/files/${id}:download?alt=media`, { "x-goog-api-key": geminiKey() });
  }
} else if (engine === "omnicf") {
  const r = await cfRun("google/gemini-omni-1.1-flash", {
    text: prompt,
    image: dataUri(frame),
    ...(flags.last ? { last_frame: dataUri(flags.last) } : {}),
    audio: dataUri(audio),
    aspect_ratio: "16:9",
    resolution: flags.res ?? "1080p",
  });
  await download(r.video);
} else if (engine === "seedance") {
  const r = await cfRun("bytedance/seedance-2.5", {
    prompt,
    image: dataUri(frame),
    ...(flags.last ? { last_frame_image: dataUri(flags.last) } : {}),
    reference_audios: [dataUri(audio)],
    duration: Number(flags.dur ?? 8),
    resolution: flags.res ?? "720p",
    generate_audio: true,
  });
  await download(r.video);
} else if (engine === "avatar") {
  const r = await cfRun("pruna/p-video-avatar", {
    image: flags.imgurl ?? dataUri(frame),
    audio: flags.audurl ?? dataUri(audio),
    voice: "Algenib (Male)",
    voice_script: "",
    voice_language: "English (UK)",
    resolution: flags.res ?? "1080p",
    video_prompt: prompt,
    voice_prompt: "Say the following.",
    negative_prompt: "photorealistic, 3D render, blurry, extra characters, text",
    strength_negative_prompt: 0.5,
    disable_safety_filter: true,
    disable_prompt_upsampling: false,
  });
  await download(r.video);
} else if (engine === "pvideo") {
  const r = await cfRun("pruna/p-video", {
    prompt,
    image: flags.imgurl ?? dataUri(frame),
    audio: flags.audurl ?? dataUri(audio),
    ...(flags.last ? { last_frame_image: dataUri(flags.last) } : {}),
    resolution: flags.res ?? "1080p",
    fps: 24,
    save_audio: true,
    prompt_upsampling: false,
    disable_safety_filter: true,
  });
  await download(r.video);
} else throw new Error("engine: omni | omnicf | seedance | avatar | pvideo");
console.log("wrote", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
