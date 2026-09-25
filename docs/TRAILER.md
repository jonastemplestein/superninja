# Trailer pipeline

The trailer is built from one declarative edit list, `trailer/trailer.config.ts`. To change a line of text, swap a shot, re-time a cut or rewrite the score brief, edit that file and run:

```sh
bun scripts/trailer/build.ts            # everything
bun scripts/trailer/build.ts --landscape-only --no-teaser   # quicker iteration
bun scripts/trailer/build.ts --gen-only                      # only (re)generate model assets
bun scripts/trailer/build.ts --prune                         # also delete stale cached card frames/segments
bun scripts/trailer/review.ts           # contact sheet + Gemini listening notes for the render
bun scripts/trailer/review.ts --no-listen --file=public/media/trailer-vertical.mp4
bun scripts/trailer/check-speech.ts <audio or video...>      # did a model sneak speech or singing into a music or SFX asset?
```

A full build from a warm cache takes about 1 minute. From cold it takes 5–7 minutes plus model time: about 1 minute for images, 1 minute for Omni shots, and 20 s for the score.

No doppler wrapper is needed. Secrets come from the environment, or from `doppler secrets get` as a fallback: the Gemini key from `os-legacy-2026-04/dev`, the Cloudflare token and account from `os/dev`.

**Outputs** (in `public/media/`):

| File | What |
|---|---|
| `trailer.mp4` | 1920×1080, 30 fps, H.264 High, AAC 256k, −14 LUFS |
| `trailer-vertical.mp4` | 1080×1920 for X, TikTok and phones. Cards are re-laid-out for portrait. Footage shows as a 4:5 crop (or the full 16:9 frame for gameplay) over a blurred fill, with a small logo on top and the URL at the bottom. |
| `trailer-teaser.mp4` | The shot ranges in `config.teaser`, cut out of the finished trailer with the same mix |
| `trailer-poster.jpg` | A frame of the title card (`config.poster`) |

## How it works

```
trailer/trailer.config.ts ──► generate ──► cards ──► segments ──► concat ──► mux ──► public/media/*
   (the edit)                 (models)    (HTML)     (ffmpeg)                 ▲
                                                           mix (score + VO + SFX + source audio)
```

| Step | File | What it does | Cache |
|---|---|---|---|
| layout | `scripts/trailer/lib.ts` | Lays the shots end to end on a frame-accurate 30 fps timeline. Every time in the config is relative to a shot. | — |
| generate | `generate.ts`, `providers.ts` | Makes every model asset the config names: start frames (Nano Banana Pro), shots (Gemini Omni 1.1 Flash), voice lines (Gemini TTS / ElevenLabs v3), the score (ElevenLabs Music v2 composition plan) and synthesised SFX. | `assets-src/trailer/cache/<kind>/<id>-<hash>`. The hash covers the full recipe, including the contents of reference images. Change a prompt and only that asset regenerates. |
| cards | `cards.ts`, `trailer/cards/card.html` | Motion-graphics title cards. They are an HTML/canvas page whose animation is a pure function of `t`; Playwright calls `seek(t)` and screenshots every frame. Styles: `slam`, `stamp`, `whisper`, `logo`, `url`, `flower` (the Sound Flower filling up with gems), plus the vertical `vframe` chrome. Foreground petals never cross the text. The fonts (Luckiest Guy, Baloo 2) are vendored in `trailer/fonts/`. Lines auto-shrink to fit. | `cache/cards/<shot>-<format>-<hash>/` |
| segments | `assemble.ts` | One H.264 segment per shot per format: in-point, speed, `zoompan` push-in or pull-out with a focus point, shake, grade, letterbox, flash or fade, card overlay. | `cache/segments/`. The key includes the size and mtime of the source file, so re-rendered game footage is picked up. |
| mix | `mix.ts` | Four buses: score (per-shot gain automation, sidechain-ducked under voices), source audio, SFX, voices. Then a limiter and two-pass `loudnorm` to −14 LUFS / −1 dBTP. | `assets-src/trailer/build/` |
| review | `review.ts` | One frame per shot in a contact sheet, a 1 fps strip, the shot timeline, and Gemini 3.8 Flash listening to the mix with timestamps. | `assets-src/trailer/review/` |

## Editing the trailer

Everything below happens in `trailer/trailer.config.ts`.

- **Change card text.** Edit `card.text`. Use `\n` for a line break.
- **Swap or re-trim a shot.** Change `video.src` to any repo path or `gen:<id>`. `in` is the in-point in seconds and `dur` is the shot length. `zoom: [from, to]` and `focus: [x, y]` set the camera move. `vfocus` sets the horizontal crop centre for the vertical cut, and `vfit: true` shows the whole 16:9 frame there instead.
- **Add a voice line.** Add it to `voices`, either as `{ who, text }` (generated) or `{ who, file }` (an existing game line). Then place it on a shot: `vo: [{ line, at }]`.
- **Add sound design.** Place `sfx: [{ name, at, gain }]` on a shot. `at` can be negative, for example a riser that should peak on a cut. Define new sounds in `sfx`, either synthesised (`boom`, `hit`, `riser`, `whoosh`, `reverse`, `tick`, `shimmer`) or taken from a file.
- **Shape the score.** Each entry in `music.sections` has `{ from: <shot id>, name, styles, avoid }`. Each section's length is derived from the edit, so changing shot durations regenerates the score to the new timing.
  - Put every descriptive word in `styles`. **ElevenLabs sings or speaks any text in a chunk as lyrics.** The pipeline sends only `[<name>]\n{instrumental}` and always adds anti-vocal negatives. Run `check-speech.ts` on a new score anyway.
  - Each section must last 3–120 s, and the build fails loudly if one doesn't.
  - To keep a score you like while you re-cut, set `music: { engine: "file", file: "<path to a cached score>", … }`.
  - `music` on a shot (0..1) automates the score level: `0` gives a hard silence for a dramatic beat.
- **Make a new generated shot.** Add a start frame to `images` (prompt + reference sprites) and a shot to `videos` (`engine: "omni"`, `frame: "img:<id>"`, motion prompt). Then use `video: { src: "gen:<id>" }`. Check the take with the contact sheet: Omni takes are 10 s long and can drift off-model late, so choose `in` accordingly.
- **Re-record gameplay.** Trailer footage comes from `scripts/record-clips.ts`: the `tr_*` entries record at 1920×1080 into `assets-src/trailer/clips/`. Start the dev server first with `bunx vite --port 5173`, then run `bun scripts/record-clips.ts tr_boss_baron`. The game's bot plays each scene. The recordings aren't identical run to run, so re-check in-points afterwards.

## Current cut (73 s; teaser 16 s)

| Time | Act | What happens |
|---|---|---|
| 0–19 s | **Cold open**, letterboxed | Sensei: "On the Island of Sounds… every petal is a sound." A thunder boom and white flash, then Baron Muddle: "Words, words, WORDS! How I HATE them!" He rips the petals off the tree: "Every sound on this island… is MINE!" The petals scatter. "Now nobody can read!" The score cuts to silence and Sensei says "We need… a Super Ninja!" |
| 19–22 s | **Hero reveal** | A boom and flash; Kai and Suki land on the cliff with golden magic swirling (Omni shot). |
| 22–47 s | **Build** | Slam cards and 1080p gameplay, with cuts shortening from 2.9 s to 0.5 s: MASTER EVERY SOUND (the Dojo), LISTEN. SPELL. CAST! (spell battles, "…spell your strongest spells!"), RUN! JUMP! READ! (Ninja Run in three worlds), READ MAGICAL STORIES (a story page, Sound Swap). Then BEAT THE BARON'S BOSSES: sumo panda, oni, yeti, river serpent and samurai knight at 0.8 s down to 0.5 s. Then a Gem Trial, and the **Sound Flower card**: the game's teardrop petals charge and glow one by one, accelerating to a burst, with "You won the gem!" |
| 47–63 s | **Showdown** | A hush, then Baron in close-up: "You have come far… little ninja." THE FINAL SHOWDOWN, and the score erupts. The golden and purple magic clash ("You dare to fight ME?"), rapid Baron-battle gameplay, then Baron flops over dizzy, the petals stream home and the tree blooms. |
| 63–73 s | **Title** | The SUPER NINJA logo slams in with "READ. SPELL. SAVE THE ISLAND." and superninja.templestein.com, and the narrator reads the same line. A Baron button follows ("This is not over, ninja… I will be back!", the game's own take). The end card shows PLAY NOW, the URL, and "The phonics adventure for children aged 3 to 8". |

The teaser is `o_baron` + `r_hero` + four bosses + the first clash + the logo card.

## Rebuild when the Sensei assets change

Sensei Maple is being redesigned as a female red panda master. The trailer references her art by path:
- `public/media/intro_{1..7}_sound.mp4` (cold open)
- `public/a/i/sensei_cheer.webp` (the "TRAIN WITH SENSEI MAPLE" card)

**Once the updated Sensei sprites and intro shots are in, rebuild the trailer** (`bun scripts/trailer/build.ts`). The segment cache is keyed on file mtime and size, so exactly the affected shots re-render. If the new intro shots have different timing, re-check the `in` points of the `o_*` shots in the contact sheet.
- The regenerated intro shots and the female Sensei sprite (on 25 Sep, 21:28) are already in the current render.
- If any Sensei asset changes again, rebuild. If the intro takes change length, re-pick the `in` points: a shot that runs past the end of its source freezes on the last frame. That is safe, but it looks static.

No generated trailer shot contains Sensei.

## Output sizes

`build.ts` writes full-quality 1080p masters to `assets-src/trailer/out/`, which is not deployed. It writes 720p web encodes to `public/media/trailer.mp4` and `public/media/trailer-vertical.mp4`, which the landing page, the `/watch/` player and the link-preview tags (`SHARE_VIDEO` in index.html) all use. Cloudflare Workers assets are capped at 25 MiB per file, and `scripts/release.sh` refuses to deploy anything larger.
