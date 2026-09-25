# Intro cutscene v2 storyboard

The intro is 7 Veo shots, about 39 s in total (40 s as the website film). It fixes two problems from v1: the villain now always has someone to confront (Sensei, the villagers and the tree), and the petals are shown flying off and landing in each of the six lands.

- **Start frames:** `assets-src/intro-v2/shotN_frame.png` (gemini-3-pro-image, 2752×1536)
- **Veo renders:** `assets-src/intro-v2/shotN_raw.mp4` (veo-3.1-generate-preview, image-to-video, 16:9, 720p, with Veo audio). Rejected takes are in `assets-src/intro-v2/rejected/`.
- **Sensei redesign (2026-09-25):** Sensei Maple is now a grandmotherly female red panda (silver bun with hair stick, spectacles, no beard). Shots 2, 3, 4 and 7 were re-rendered with the new sprites; the bearded takes are in `assets-src/intro-v2/rejected/v1-sensei/`.
- **Prompts:** `scripts/gen-intro-v2.ts` (`frames` / `video` modes). Trims and encodes: `scripts/intro-v2-encode.sh`.
- **In-game output (silent):** `public/a/v/intro_1.mp4` … `intro_7.mp4`
- **Output with Veo music and SFX:** `public/media/intro_N_sound.mp4`. The whole film is `public/media/intro_film.mp4`.

Veo was asked for music and SFX only, with no dialogue. A transcription check found no spoken words, only a few small cartoon grunts and gasps. Narration comes from the game's TTS lines (see [Proposed lines](#proposed-lines)).

**Wiring note:** some lines run close to their shot's length. Advance to the next shot when *both* the video and the line have finished, holding the last frame if the line is still playing. Shot 7 ends on Sensei waving at the viewer, which is a natural hold frame for "choose your ninja".

## Timing

Each shot is cut so its key action lands on the narration words (word times measured with Whisper). `scripts/intro-v2-encode.sh` holds the cut list (raw in/out, line delay, optional slow-motion ramp) and writes `public/a/v/intro_timing.json` (`[{shot, lineDelayMs, minMs}]`) for the game and for `scripts/intro-film.py`.

| Shot | Raw cut | Line starts | Lands on |
|---|---|---|---|
| 1 | 0–6.3 s | 0.4 s | push-in to the glowing tree on "Great Blossom Tree" |
| 2 | 0–6 s | 0 s | petal lands on "with sounds", page sparkles on "we make words" |
| 3 | 0–5 s | 0.2 s | stomp (extra foley at 1.0 s) on "words", lightning on "WORDS!", claw flame on "HATE them" |
| 4 | 0–1.4 s at 0.6x, then 1.4–7 s | 0 s | wind-up on "I am Baron Muddle", fan blast on "Every sound", petals ripped on "island is MINE", laugh on "Mwa-ha-ha" |
| 5 | 0.3–5.6 s | 0.3 s | petal ribbons arc out on "scattered all over the island", then land |
| 6 | 0–2.15 s at 0.8x | 0.2 s | blank book and shrug on "nobody can read" (cut before a sign-morph at 2.2 s) |
| 7 | 2.5–8 s | 0.4 s | looks at bare tree on "We need a hero", turns and waves on "Super Ninja" |

Villagers (pandas, fox, owl) are drawn from on-style reference sprites in `assets-src/intro-v2/refs/` (`gen-intro-v2.ts refs`). In the website film, the Veo SFX bed and title music are side-chain ducked under the narration.

---

## Shot 1: The Island of Sounds (6.3 s)

- **We see:** a high three-quarter aerial view of a round island in a turquoise sea at sunrise.
  - **Left:** the bamboo village (front), the cherry-blossom hills with a red pagoda, and the snowy mountains with a waterfall.
  - **Centre:** the dragon river with red bridges, and the purple castle behind it.
  - **Top right:** the golden temple on a cloud, with a rainbow.
  - **Right foreground:** the Great Blossom Tree on a cliff. It glows pink and is the brightest thing in the frame. Tiny villagers dance under it.
- **Action:** smoke curls up from the huts, the waterfall flows, birds fly past, and the tree gives a soft pink shimmer.
- **Camera:** a very slow push-in with a slight drift right towards the tree. The whole island stays in frame.
- **Narration (Sensei):** *intro_1*
- **Start frame recipe:** refs `art/worldmap.png`, `art/title_bg.png`, `art/story_s6_bloom.png`. The prompt re-lays the tall map as a wide island with the tree on a right-hand cliff. The frame was cropped 4% to remove a signature the model painted in.

## Shot 2: Every petal is a sound (6 s)

- **We see:**
  - **Left:** Sensei Maple on the grassy cliff, smiling, with one finger raised as if teaching.
  - **Centre/top:** the tree canopy in full pink bloom.
  - **Right:** villagers sit under the trunk. There are two pandas sharing an open picture book, a fox child with a scroll, and an owl in a robe.
- **Action:** a glowing petal drifts down onto the book. The page sparkles with golden light and the pandas and fox laugh.
- **Camera:** a gentle push-in towards the villagers.
- **Narration (Sensei):** *intro_2*
- **Start frame recipe:** refs `cut/sensei_talk.png`, `art/story_s6_bloom.png`, `art/story_s1_village.png` (panda villagers).

## Shot 3: Baron Muddle arrives (5 s)

- **We see:** the sky has gone dark purple and lightning is flashing.
  - **Left:** Sensei stands guard with her staff, and two little pandas peek out from behind her robe.
  - **Centre:** the tree, still pink, on the cliff edge.
  - **Right:** Baron Muddle, landing in purple smoke. He is bigger than Sensei, his red eyes glow, and he holds his fan.
  - The two characters face each other across the frame.
- **Action:** Baron stomps towards Sensei, grinning, and raises a claw with a purple flame in it towards the tree. Sensei plants her staff upright and stands firm, and the pandas duck. The shot is trimmed to cut on a lightning flash.
- **Camera:** a slight push-in between the two characters.
- **Narration (Baron):** *intro_3*
- **Start frame recipe:** refs `cut/baron_idle.png`, `cut/sensei_idle.png`, `art/story_s6_bloom.png`.

## Shot 4: The purple storm (7.9 s)

- **We see:**
  - **Left foreground:** Sensei, bracing against the wind and gripping her staff.
  - **Centre-left:** the tree, still full of pink petals.
  - **Right:** Baron, on the neighbouring cliff edge, mid-sweep of his war fan. A purple whirlwind blasts from the fan into the tree.
- **Action:** a purple blast hits the tree and every petal rips off in a huge pink cloud. Sensei is shoved back and the tree is left bare. Baron throws back his head and laughs. The pink cloud spirals off the cliff and away over the valley.
- **Camera:** it starts on the confrontation, then pulls back and follows the petal spiral as it leaves the cliff towards the distant island. This hands off to shot 5.
- **Narration (Baron):** *intro_4*
- **Start frame recipe:** refs `cut/baron_angry.png`, `cut/sensei_idle.png`, `art/title_bg.png`. The prompt insists that the tree is still fully pink with no face, and that Sensei is braced against the wind.

## Shot 5: The petals scatter across the island (5.3 s)

- **We see:** a high aerial view from the cliff over the stormy island.
  - **Left:** the bamboo village and the blossom hills with the pagoda.
  - **Centre:** the snowy mountains.
  - **Right:** the turquoise river, the purple castle, and the golden sky temple.
  - **Foreground:** a river of glowing petals pours off the cliff.
- **Action:** the petal river bursts into ribbons that arc out like shooting stars towards the lands. They swoop down and land as pink sparkle patches in the village, the hills, the mountains, beside the river and at the castle.
- **Camera:** a slight glide and settle.
- **Narration (Sensei):** *intro_5*
- **Start frame recipe:** refs `art/worldmap.png`, `art/title_bg.png`. The prompt asks for six lands laid out left to right, with one petal stream per land.

## Shot 6: Nobody can read (2.65 s)

- **We see:** the bamboo village on a dim, overcast day.
  - **Left:** a panda child holding up a blank wooden sign.
  - **Centre:** a grown-up panda at a table with an open book whose pages are blank and grey. He is scratching his head.
  - **Right background:** one pink petal glints, hidden among the bamboo.
- **Action:** the panda flips through the blank pages, puzzled. The child turns the sign round, confused. The hidden petal twinkles.
- **Camera:** a gentle drift.
- **Narration (Sensei):** *intro_6*
- **Start frame recipe:** refs `art/story_s1_village.png`, `art/bg_bamboo.png`.

## Shot 7: We need a hero (5.5 s + hold)

- **We see:** the cliff after the storm, with the sky clearing to a golden dawn.
  - **Left of centre:** Sensei, alone.
  - **Right:** the bare, grey Great Blossom Tree.
- **Action:** Sensei looks up at the bare tree, then turns to the viewer. She smiles hopefully and raises a paw as if inviting the child to help. A beam of sunlight falls on her and a single pink sparkle floats up past her face.
- **Camera:** a slow push-in to a medium shot, with the bare tree kept in frame and Sensei's spectacles on throughout.
- **Narration (Sensei):** *intro_7*, then *intro_8* over the Choose-your-ninja screen.
- **Start frame recipe:** refs `cut/sensei_idle.png`, `art/title_bg.png`.

---

## Proposed lines

These are proposed replacements for `src/content/lines.ts`, which has not been edited. `s` = Sensei (Sulafat), `b` = Baron (Algenib).

```ts
s("intro_1", "Long ago, on the Island of Sounds, there grew a Great Blossom Tree."),
s("intro_2", "Every petal was a sound. And with sounds... we make words!"),
b("intro_3", "Words, words, WORDS! How I HATE them!"),
b("intro_4", "I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!"),
s("intro_5", "Oh no! The sound petals are scattered all over the island!"),
s("intro_6", "Now nobody can read!"),
s("intro_7", "We need a hero. We need... a Super Ninja!"),
s("intro_8", "I am Sensei Maple. I will train you. Now, choose your ninja!"),
```

| Shot | Length | Line | Estimated speech |
|---|---|---|---|
| 1 | 6.5 s | intro_1 | ~5 s |
| 2 | 6 s | intro_2 | ~4.5 s |
| 3 | 5 s | intro_3 (Baron) | ~3.5 s |
| 4 | 8 s | intro_4 (Baron) | ~6 s |
| 5 | 8 s | intro_5 | ~4.5 s |
| 6 | 5 s | intro_6 | ~2 s |
| 7 | 8 s | intro_7 | ~4 s |
| (select screen) | n/a | intro_8 (old intro_4 text) | ~4 s |
