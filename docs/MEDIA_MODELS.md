# Media models (September 2026)

This page covers which generative models to use for Super Ninja's video, music, sound effects and voice, and how to call each one with our credentials. It was researched on 25 Sep 2026 from public leaderboards (Artificial Analysis Video Arena, LLMBoard, modelgrep), vendor posts, and live API listings. Every "✓ verified" below was actually called with our keys.

## Where our access comes from

- **Gemini API** (`APP_CONFIG_GEMINI_API_KEY`, doppler `os-legacy-2026-04/dev`).
  - Relevant models from `GET https://generativelanguage.googleapis.com/v1beta/models?pageSize=300`:
    - video: `gemini-omni-1.1-flash`, `gemini-omni-flash-preview` (deprecated 30 Sep 2026), `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite-generate-preview`
    - music: `lyria-3.5`, `lyria-3-pro-preview`, `lyria-3-clip-preview`, `lyria-realtime-exp`
    - voice: `gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`
    - images: `gemini-3-pro-image` (Nano Banana Pro), `gemini-3.1-flash-image` (Nano Banana 2)
  - No Veo 4 is listed. Gemini Omni is the newer video model.
- **Cloudflare AI Gateway unified catalogue**: `POST https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run` with `{model, input}`. Third-party models are billed through Unified Billing.
  - Credentials are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from doppler `os/dev`. That is the "iterate (dev/preview)" account, which has balance.
  - The personal account `05958bb7…` returns `Insufficient balance; add money to your gateway or use BYOK` (code 2021) until it is topped up.
  - Workers AI's own `@cf/*` models include no video or music. The catalogue ([developers.cloudflare.com/ai/models](https://developers.cloudflare.com/ai/models/)) adds:
    - video: Google Veo 3.1 and Omni; ByteDance Seedance 2.0 and 2.5; Alibaba Wan 3.0 and HappyHorse 1.1; MiniMax H3 and Hailuo 2.3; Runway Gen-4.5 and Aleph-2; Vidu Q3; PixVerse v6; LTX-2.5; FLUX 3 Video; Grok Imagine
    - music: ElevenLabs Music v2, MiniMax Music 2.6
    - voice: ElevenLabs v3, Flash and Multilingual; MiniMax Speech 2.8; Inworld TTS; OpenAI TTS; Deepgram Aura
  - The catalogue has **no** Kling, Sora, Luma, Stable Audio or ElevenLabs sound-effects model.

## 1. Video: pick **Gemini Omni 1.1 Flash** ✓ verified

| Rank | Model | Why | Access | Price |
|---|---|---|---|---|
| 1 | **Gemini Omni 1.1 Flash** (`gemini-omni-1.1-flash`) | #1–2 in the Artificial Analysis text-to-video arena (Elo ≈1238–1330, tied with Wan 3.0) and #1 without audio in image-to-video; #1 on LLMBoard. It keeps our hand-painted style from a start frame very well, supports first+last frame, extend and conversational edits, and makes 10 s shots with native audio. | Gemini API, Interactions endpoint (also on Cloudflare as `google/gemini-omni-1.1-flash`) | $0.10/s at 720p. 1080p and 4K are upscales. |
| 2 | Wan 3.0 (Alibaba) | Ties Omni on text-to-video. | Cloudflare `alibaba/wan-3.0` | ~$0.20/s |
| 3 | Seedance 2.0 (ByteDance) | Top-5 in image-to-video; takes up to 30 reference images, good for multi-character consistency. | Cloudflare `bytedance/seedance-2.0` | ~$0.15/s |
| 4 | MiniMax H3 / H3 Max | #1 with audio in image-to-video, cheap, first+last frame. | Cloudflare `minimax/h3` | ~$0.04–0.13/s |
| 5 | Veo 3.1 / Fast | Made our intro. It ranks well below Omni now, and costs more. | Gemini API `predictLongRunning` | $0.40/s (Fast $0.15/s) |

**How to call it.** Send `POST v1beta/interactions` with:

```json
{
  "model": "gemini-omni-1.1-flash",
  "input": [{"type": "image", "data": "<b64>", "mime_type": "image/png"}, {"type": "text", "text": "<motion prompt>"}],
  "response_format": {"type": "video", "aspect_ratio": "16:9", "resolution": "1080p", "delivery": "uri"},
  "generation_config": {"video_config": {"task": "image_to_video"}}
}
```

- The call is synchronous (about 20–60 s).
- The video is in `steps[].content[]` with `type: "video"`. It comes back as base64 `data`, or as a Files API `uri`: poll `files/{id}` until it is ACTIVE, then download `…/download/v1beta/files/{id}:download?alt=media`.
- The code is `genOmni()` in `scripts/trailer/providers.ts`.

**Notes from our shots.**
- Four trailer shots cost about $4 and were all usable.
- Takes run 10 s and sometimes contain a hard cut or drift off-model after about 4–5 s: Baron's crown vanished, and a headband changed colour. Review the take and pick in-points (the trailer config cuts around these).
- Always give it a Nano Banana Pro start frame that was made from the game's sprites.

## 2. Music: pick **ElevenLabs Music v2 with a composition plan** ✓ verified. Alternative: Lyria 3.5 ✓

| Rank | Model | Why | Access | Price |
|---|---|---|---|---|
| 1 | **ElevenLabs Music v2** (`elevenlabs/music-v2`) | Its **composition plan** gives every section an exact `duration_ms` and its own style tags. That is the one feature a trailer needs: the drop lands on the cut, and the score re-times itself when the edit changes. It has licensed training data (Merlin, Kobalt) and outputs WAV or MP3. | Cloudflare `/ai/run` | ~$0.15/min native; Cloudflare's price is in the dashboard |
| 2 | Lyria 3.5 (`lyria-3.5`) | Excellent cinematic and orchestral sound, up to about 3 min. But it has **no duration parameter**, so it can't hit cut points. We use it for the in-game loops (`scripts/gen-music.ts`). | Gemini `generateContent` | $0.08/song |
| 3 | MiniMax Music 2.6 | BPM and key control, cheap. | Cloudflare `minimax/music-2.6` | cheap |
| — | Suno v6 / v5.5 | Best for vocal songs. There is no official API. | none | — |

**How to call it.** Send `{"model": "elevenlabs/music-v2", "input": {"composition_plan": {"chunks": [{"text": "...", "duration_ms": 12600, "positive_styles": ["cinematic", "taiko"], "negative_styles": ["vocals"]}, …]}, "output_format": "mp3_44100_192"}}`. The response gives `result.audio`, a signed URL that you download.
- **Gotcha:** a chunk's `text` is *lyrics* (section label, lines, `{inline cues}`). Our first score sang the section briefs out loud. For instrumental scores, send `"[Section name]\n{instrumental}"` and put every description in `positive_styles`. Add `vocals`, `lyrics`, `singing` and `spoken word` to `negative_styles`.
- Each duration must be 3–120 s.
- In testing, sections landed within ±0.2 s of the requested boundaries.
- The music is billed to the `os/dev` Cloudflare account, about $0.15 a minute.
- The code is `genElevenMusic()`.

## 3. Sound effects: pick **synthesised trailer sound design (ffmpeg) + game SFX + native model audio**

There's no dedicated text-to-SFX model in either catalogue we can reach. ElevenLabs' sound-effects endpoint and Stable Audio aren't on Cloudflare.

What works:
1. **Synthesised hits** (`synthSfx()` in `scripts/trailer/providers.ts`): booms with a sub drop, taiko-style hits, risers, whooshes, reverse swells and shimmers, built from `aevalsrc` expressions. They're deterministic, free, and sit exactly on the frame.
2. **The game's own SFX**, rendered from its WebAudio synth by `scripts/record-clips.ts` into `assets-src/sfx/*.wav`: zap, petal, thunder, swish and others.
3. **Native audio from Omni and Veo shots**, mixed low under the score as texture.
4. If a bespoke stinger is needed (a "braam" or a gong), ask ElevenLabs Music v2 for a 3–5 s instrumental chunk.

If an ElevenLabs sound-effects API key is ever added (BYOK), that is the upgrade.

## 4. Voice: pick **Gemini 3.8 Flash TTS for characters** ✓ and **ElevenLabs v3 for the trailer narrator** ✓

| Use | Model | Voice | Notes |
|---|---|---|---|
| Sensei Maple, Baron Muddle | `gemini-3.8-flash-tts` (Gemini API) | Sulafat (Sensei, female), Algenib (Baron) | These are the same voices as in the game, so the trailer sounds like the game. Send plain text only: it reads stage directions aloud. `languageCode: en-GB`. |
| Trailer narrator | `elevenlabs/eleven-v3` via Cloudflare | `JBFqnCBsd6RMkjVDRZzb` ("George", warm British storyteller) | The most expressive TTS we can reach. Inline tags like `[whispers]` work in v3. |
| Alternatives | MiniMax Speech 2.8 HD, Inworld TTS 1.5 Max (Cloudflare) | — | Emotion control. Not needed yet. |

## Also: images

**Nano Banana Pro** (`gemini-3-pro-image`, 2K) ✓ makes start frames from the game's sprites (`assets-src/cut/*.png`) and backgrounds (`assets-src/art/*.png`). Nano Banana 2 (`gemini-3.1-flash-image`) is the cheaper alternative. On Cloudflare, Seedream 5 Pro takes up to 10 reference images.
