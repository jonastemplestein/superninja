// Accent audit: the ABX judge's anchors for the 20 real game clips. Each game clip's words are read by a known British
// and a known American voice (Sensei, story and word clips: ElevenLabs Alice / OpenAI coral; Baron: ElevenLabs George /
// OpenAI ash), so the judge can compare the game's own take against both.
//   doppler run -p os -c dev -- bun scripts/voice-picker/audit-render-anchors.ts
// Out: playtest/runs/voice-picker/audit/anchors/<cast>/<clip id with / as _>.wav
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { GAME_CLIPS } from "./audit-game-clips";

const ROOT = join(import.meta.dir, "../..");
const OUT = join(ROOT, "playtest/runs/voice-picker/audit/anchors");

async function eleven(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "elevenlabs/eleven-v3", input: { text, voice_id: voiceId, output_format: "mp3_44100_192", language_code: "en" } }),
  });
  const json: any = await res.json();
  if (!json.success) throw new Error(`eleven ${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 300)}`);
  const r = json.result?.result ?? json.result;
  return Buffer.from(await (await fetch(r.audio)).arrayBuffer());
}
async function openai(text: string, voice: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice, input: text, response_format: "wav" }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const jobs: Promise<void>[] = [];
for (const g of GAME_CLIPS) {
  const baron = g.who.startsWith("baron");
  const text = g.id.startsWith("w/") ? `${g.text[0].toUpperCase()}${g.text.slice(1)}.` : g.text;
  const pairs: [string, () => Promise<Buffer>][] = baron
    ? [["eleven-george-baron", () => eleven(text, "JBFqnCBsd6RMkjVDRZzb")], ["openai-ash", () => openai(text, "ash")]]
    : [["eleven-alice", () => eleven(text, "Xb7hH8MSUJpSbSDYk0k2")], ["openai-coral", () => openai(text, "coral")]];
  for (const [cast, fn] of pairs) {
    const out = join(OUT, cast, `${g.id.replace("/", "_")}.wav`);
    if (existsSync(out)) continue;
    jobs.push((async () => {
      for (let i = 0; ; i++) {
        try {
          const buf = await fn();
          mkdirSync(dirname(out), { recursive: true });
          writeFileSync(out + ".src", buf);
          execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", out + ".src", "-ac", "1", "-ar", "44100", out]);
          return;
        } catch (e) {
          if (i >= 3) { console.error("FAILED", out, e); return; }
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        }
      }
    })());
  }
}
await Promise.all(jobs);
console.log(`rendered ${jobs.length} anchors`);
