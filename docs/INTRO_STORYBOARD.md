# Intro film storyboard (v3: the World Flower)

The opening film is 8 shots, about 44 s in game (45.4 s as the website film). It tells the lore in one breath:

> At the heart of the Island of Sounds grows the **World Flower**. Its 44 petals are the island's sounds, one per sound, each in its colour from the school's petal chart, round a golden heart. Everything on the island lives on its light: rivers sing, bamboo grows, and the islanders can talk, read and share stories. **Baron Muddle** tears the petals off in a storm and scatters them across every land. The flower goes dark, colour drains from the island, the islanders cower, and books go blank. **Sensei Maple** stands up to him, never looking away, and calls on the Super Ninjas (Kai and Suki) to win back every petal, one sound at a time.

v2 (7 Veo shots about a pink blossom tree) had two problems Jonas called out: the tree meant nothing, and in the wind shot Sensei looked away from the action. v3 fixes both. The flower is the lore object (the same flower the child rebuilds on the World Flower screen), and **Sensei watches the action in every shot**. The one exception is the moment she turns to the viewer to ask for help.

- **Design of the flower:** `assets-src/world-flower/model_sheet.png` (glorious, destroyed, partly regrown, restored). See [ART_STYLE.md](ART_STYLE.md#the-world-flower).
- **Start frames:** `assets-src/intro-v3/shotN_frame.png` (gemini-3-pro-image, 2K). The candidates are `shotN_frame_K.png`, and `chosen_frames.jpg` is the contact sheet.
- **Renders:** Gemini Omni 1.1 Flash image-to-video, 1080p, with the model's own music and SFX. Shots 3 and 4, where Baron speaks, are **lip-synced Seedance 2.5 takes** (see [Lip-sync](#lip-sync)). Takes are `shotN_takeK.mp4`, and the chosen take is copied to `shotN_raw.mp4`. The filmstrips are `strip_N_K.jpg`.
- **Sensei pose refs:** `assets-src/intro-v3/refs/sensei_{brave,back,wonder,point}.png`. These are profile and rear views facing right. Frames made from the front-facing idle sprite alone put her looking at the camera, so every Sensei shot uses one of these.
- **Villager refs:** `assets-src/intro-v2/refs/{panda,panda_kid,fox,owl,rabbit,tanuki}.png`.
- **Prompts:** `scripts/gen-intro-v2.ts` (`refs`, `poses`, `frames`, `video`, `finale`). Cuts and encodes are in `scripts/intro-v2-encode.sh`. The narrated website film is built by `scripts/intro-film.py`.
- **In game (silent, 720p):** `public/a/v/intro_1.mp4` … `intro_8.mp4`, plus `intro_timing.json`. `src/scenes/IntroFilm.tsx` plays each shot with its line (`film_1` … `film_8`). The Choose-your-ninja screen then says `intro_8`.
- **With the model's sound:** `public/media/intro_N_sound.mp4`. The whole narrated film is `public/media/intro_film.mp4`.

**Omni notes.**
- A take's length follows the `[mm:ss]` timestamps in the prompt (3–7 s here), so every prompt front-loads its key action.
- The takes rejected for this film:
  - shot 3 take 2 cut to a new angle and redesigned both characters;
  - shot 4 take 1 orbited the camera so Sensei faced the viewer and the bloom vanished;
  - shot 7 take 1 morphed the bare core into a black flower;
  - shot 8 take 1 re-bloomed the flower too early.
- The fixes were explicit constraints in the prompt: "the camera never orbits", "the bare round centre stays exactly as it is", "no petals grow". 14 renders were used for the film and the finale.

## Timing

Each shot is cut so its key action lands on its narration words (word times from Whisper large-v3-turbo, `assets-src/world-flower/film_words.json`). `scripts/intro-v2-encode.sh` holds the cut list: raw in/out, line delay, and an optional slow-motion ramp over the raw take. It writes `public/a/v/intro_timing.json` (`[{shot, lineDelayMs, minMs}]`). The game holds the last frame until both the video and the line are done.

| Shot | Take | Cut | Line starts | Lands on |
|---|---|---|---|---|
| 1 | take 1 | 0–5 s at 0.88× (5.7 s) | 0.2 s | push-in reaches the glowing flower on "magic World Flower" |
| 2 | take 2 | 0–4.3 s at 0.8× (5.4 s) | 0 s | petal glows on "petal", light ribbon reaches the book and the page sparkles on "read" |
| 3 | Seedance t3_2 | 0–6 s (never retimed) | 0.419 s | lip-synced: his mouth says every word; he stomps and jabs on each "words", lightning after "WORDS!", fists of purple flame on "HATE them" |
| 4 | Seedance t4_2 | 0–7.7 s (never retimed) | 0.2 s | one continuous lip-synced take: he gloats "I am Baron Muddle! Every sound on this island is…" with the fan raised, sweeps it on "MINE!", the whirlwind rips every petal into a rainbow vortex, and he laughs over the bare flower on "Mwa-ha-ha-ha!" |
| 5 | take 1 | 0–4 s | 0.2 s | petal ribbons burst out on "blew away", land in the lands on "island" |
| 6 | take 1 | 0–4 s | 0.2 s | the last glow fades on "gone dark", the panda looks up from the blank book on "nobody can read" |
| 7 | take 2 | 0–4 s | 0.3 s | glares after Baron on "We need a hero", turns to the viewer on "We need…", holds out her paw on "a Super Ninja!" |
| 8 | take 2 | 0–2.85 s at 0.85× (3.35 s) + hold | 0.25 s | ninjas land, Sensei points out across the island on "Win back every petal" (cut before Sensei turns away at 2.9 s) |

---

## Shot 1: The Island of Sounds

- **We see:** a high three-quarter aerial of the round island in a turquoise sea at sunrise. The six lands sit round the edge: the bamboo village, the blossom hills with a pagoda, the snowy mountains, the river with red bridges, the purple castle and the sky temple. At the **very centre**, on a green hill, towers the World Flower, glowing, with rainbow light washing over every land and tiny islanders gathered at its roots.
- **Action / camera:** a slow push-in to the flower. It shimmers, and light ripples out across the lands.
- **Narration (Sensei):** *film_1* "Long ago, on the Island of Sounds, there grew a magic World Flower."

## Shot 2: Every petal is a sound

- **We see:** the foot of the flower on a happy morning. Its enormous bloom fills the top right. A crowd of islanders sits at its roots (two pandas sharing a picture book, a panda child, a fox, an owl and a rabbit). **Sensei Maple** stands in the left foreground in profile, **gazing up at the flower**.
- **Action:** one petal glows, and a ribbon of coloured light floats down into the pandas' book. The page lights up and everyone laughs and sings.
- **Narration (Sensei):** *film_2* "Every petal was a sound. With sounds, we could talk, and read, and sing!"

## Shot 3: Baron Muddle's storm arrives (lip-synced)

- **We see:** the same hilltop under a purple storm. The flower is still whole in the centre. **Baron Muddle** has landed on a storm cloud on the right. **Sensei** has stepped forward on the left, in profile, frowning, braced on her staff and **glaring straight at him**, with frightened islanders huddled behind her.
- **Action:** Baron **says the line on screen, lip-synced**: he stomps and jabs a claw at the flower on each "words", lightning cracks, and on "How I HATE them!" he clenches fists of purple flame. Sensei never steps back.
- **Narration (Baron):** *film_3* "Words, words, WORDS! How I HATE them!"

## Shot 4: The petals are torn away (one continuous lip-synced take)

- **We see:** an over-the-shoulder shot. **Sensei** is in the left foreground **seen from behind, facing Baron and the flower**, shielding two panda children. The whole flower is in the centre, and Baron stands on a rock on the right with his war fan raised.
- **Action:** one continuous clip. Baron gloats his line with his mouth moving to every word, fan raised and lightning crackling. On "MINE!" he sweeps the fan down, a purple whirlwind hits the flower, and its rainbow petals are ripped off into a spinning rainbow vortex that scatters across the sky. The bare centre is left on its stem, and he throws his head back and laughs. Sensei holds her ground, watching.
- **Narration (Baron):** *film_4* "I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!"

## Shot 5: The petals scatter over the island

- **We see:** a high aerial from above the flower's hilltop under a stormy sky. A river of rainbow petals pours off the flower (bottom left).
- **Action:** it bursts into six ribbons that arc like shooting stars to the six lands and land there with a sparkle.
- **Narration (Sensei):** *film_5* "Oh no! The petals blew away, all over the island!"

## Shot 6: The flower goes dark

- **We see:** the hilltop after the storm, grey and drizzly, all colour drained. The World Flower stands behind, bare and drooping (the destroyed state). In front, **dozens of islanders cower together**: pandas hugging, a little panda crying, foxes with their ears flat, owls hiding behind their wings, rabbits trembling, a tanuki clutching his hat, and a panda holding a book with blank grey pages.
- **Action:** the last glow in the flower's centre flickers out. The crowd huddles closer, and the panda turns a blank page and looks up sadly.
- **Narration (Sensei):** *film_6* "The World Flower has gone dark. Now nobody can read!"

## Shot 7: Sensei stands up to Baron, and calls for help

- **We see:** the first ray of dawn over the hilltop. The dark flower is behind on the right, and Baron is riding off on his storm cloud, laughing. **Sensei** stands in the foreground in profile, **glaring up at him**, staff planted.
- **Action:** she watches him go, then turns to face the viewer, smiles and holds out her paw: *will you help?*
- **Narration (Sensei):** *film_7* "We need a hero. We need... a Super Ninja!"

## Shot 8: The heroes

- **We see:** golden dawn on the hilltop. **Kai and Suki** land in ninja stances with golden magic at their hands. **Sensei**, in profile, turns to them and points her staff out across the island. The dark flower is behind them with one tiny golden spark in its centre.
- **Action:** a landing, a spin into stances, and Sensei nods and points. The frame holds on the three of them.
- **Narration (Sensei):** *film_8* "Win back every petal, one sound at a time!" The Choose-your-ninja screen follows (*intro_8*: "I am Sensei Maple. I will train you. Now, choose your ninja!").

---

## The finale

`public/a/v/finale.mp4` (silent) and `public/media/finale_sound.mp4` (with sound, used by the trailer) are one Omni take made from a first frame and a last frame.
- **First frame:** `assets-src/intro-v3/finale_frame.png`, the festival village with the bare dark flower on its rock and rainbow ribbons of petals streaming home.
- **Last frame:** `finale_last.png`, which is `public/a/i/story_s6_bloom.webp`, so the video ends exactly on the still that `src/scenes/Intro.tsx` shows under it.
- **Action:** the petals spiral in and land in two rings, the heart lights gold, the flower blooms, bunting appears and the villagers cheer.
- **Narration:** `finale` ("You did it, Super Ninja! Every petal is back on the World Flower. The whole island can read and spell again!"), then `baron_final`.

## Lip-sync

Jonas asked for Baron to lip-sync and for the destruction to play as one real video clip, rather than a voice laid over a picture of a closed-mouthed toad. Shots 3 and 4 do that. The tools are in `assets-src/intro-v3/lipsync/`:
- `lipsync.ts`: the engines;
- `retime.py`: the re-timer;
- `t3_*` / `t4_*`: every take tried, with a `.request.json` of each gateway call;
- `strip_*.jpg`: filmstrips.

**Engines tried** (start frame plus the game's own Baron line, Gemini TTS Algenib):

| Engine | Result |
|---|---|
| Gemini Omni 1.1 Flash, audio input (Gemini API and Cloudflare) | Rejected by both: "Audio input modality is not enabled for this model". |
| Pruna p-video-avatar (Cloudflare, audio-driven) | Excellent lip-sync, and it keeps our audio exactly. But it only animates a talking shot: asked for the fan blast, it turned the World Flower into a purple ball or a small bulb. Pruna models on the gateway accept only HTTP(S) URLs (data URIs fail with "property input is required"). `lipsync/host.ts` gets a hosted copy of a frame through Nano Banana Pro on the gateway. |
| Pruna p-video (image + audio) | Weak mouth movement, and Baron's pose morphs mid-shot. |
| **ByteDance Seedance 2.5** (Cloudflare, `reference_audios`) | **Chosen.** Action and lip-sync in one continuous take, with Baron on-model (charcoal-green toad, crown, cloak) and the flower's petals ripped into a vortex. 720p. Its lips follow its own re-performance of our line: our recording for the speech, with its own pauses and its own laugh. One call in three returned "Upstream service unavailable"; a retry works. |

**Keeping the game's own voice in sync.** The game plays our recording (`public/a/l/film_3.mp3`, `film_4.mp3`), not Seedance's soundtrack.
- `retime.py` aligns our line with the take's voice (Demucs `htdemucs` vocals stem) by DTW on MFCC features. It then places each phrase of our recording where Baron's mouth says it, stretching a phrase by up to about 20 % (pitch-preserving) only where Seedance's pacing differs.
- The re-timed lines replace `film_3.mp3` and `film_4.mp3`; the untouched takes are `lipsync/film_{3,4}_original.mp3`.
- The line delays in `intro_timing.json` (419 ms and 200 ms) are the offsets of those files in the takes.
- `IntroFilm.tsx` starts each line on the video's own clock (`currentTime`), so the sync holds even when a video starts late.
- Checks: word times in the final film match the takes to within about 0.05 s (Whisper), and 10 fps mouth crops were inspected against the words. Gemini can't judge lip-sync (it samples video at about 1 fps).

**Sound.** Seedance's soundtrack includes Baron's voice, so `shotN_raw.mp4` for shots 3 and 4 carries the Demucs `no_vocals` stem instead: storm, whoosh and music, with no speech (`check-speech.ts`: no speech). The website film and the trailer then lay our own line on top.

**Overlay fix.** During the film, the game's Sensei help button (App-level, bottom-right) kept glowing and moving its mouth whenever Sensei narrated: a second talking Sensei on top of the picture. `IntroFilm.tsx` now shows it small, faded and still. The villain cut-in portrait was already suppressed by `useBaronOnScreen()`; no caption bubble renders in the film.

## Lines

`s` = Sensei (Sulafat), `b` = Baron (Algenib); see `src/content/lines.ts`. `film_3`, `film_4` and `film_7` reuse the v2 takes, whose text is unchanged. The others were generated by `scripts/gen-audio.ts` and judge-checked. `film_1`, `film_6` and `film_8` are the best of 4–6 takes, as ranked by Gemini for delivery: enchanting, gently sad and rousing respectively.

| Shot | Line | Length |
|---|---|---|
| 1 | `s("film_1", "Long ago, on the Island of Sounds, there grew a magic World Flower.")` | 5.7 s |
| 2 | `s("film_2", "Every petal was a sound. With sounds, we could talk, and read, and sing!")` | 5.9 s |
| 3 | `b("film_3", "Words, words, WORDS! How I HATE them!")` | 5.2 s (re-timed to the take) |
| 4 | `b("film_4", "I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!")` | 7.2 s (re-timed to the take) |
| 5 | `s("film_5", "Oh no! The petals blew away, all over the island!")` | 4.2 s |
| 6 | `s("film_6", "The World Flower has gone dark. Now nobody can read!")` | 3.5 s |
| 7 | `s("film_7", "We need a hero. We need... a Super Ninja!")` | 4.4 s |
| 8 | `s("film_8", "Win back every petal, one sound at a time!")` | 3.6 s |
