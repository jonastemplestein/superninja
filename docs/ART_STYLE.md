# Super Ninja art style

The look is **painted characters living inside painted worlds**. Children aged 4 to 7 must be able to parse every screen in under a second. Foreground things they interact with look chunky, bright and outlined. The world behind them is softer and quieter.

## Layers and visual hierarchy

1. **Interactive layer** (letter tiles, word scrolls, buttons). The tiles are cream paper in the typeface Andika, which has kid-friendly letterforms: a single-storey *a* and *g*. Each has a thick ink border and a chunky press shadow. Nothing else on screen uses cream paper plus an ink border, so "tappable" is visually unique.
2. **Character layer** (ninja, sensei, monsters, Baron). The sprites are painted with bold dark-brown ink outlines. In-game every sprite gets only a soft ground shadow. There is no sticker rim; Jonas found the fat white borders cheap-looking. Characters are separated from backgrounds by their own ink outline and lighting.
3. **World layer** (backgrounds). Painted landscapes are shown slightly desaturated and lightened in game (`filter: saturate(.85) brightness(1.05)`), with a warm vignette, so they never compete with layers 1 and 2.

## Shared rules for all generated art

- Dark-brown ink outline of even weight. Rich cel-shaded colour: one shade tone, one highlight, and soft painterly grain.
- Chunky rounded silhouettes with few details, lit from the top-left.
- Characters use chibi proportions: roughly 2.5 heads tall with big eyes.
- No text, letters, numbers or flags anywhere. Objects have no faces; characters, monsters and **every living thing in a word picture** do (below).
- Japanese-inspired motifs in the world: swirl clouds, seigaiha waves, lanterns and blossom.

## Palette anchors

- Ink `#2b1d14`, paper `#fff4dc`, blossom pink `#ff7aa2` (UI accents, rewards), ninja indigo `#3b3a8f` and red `#e2412f` (the hero), gold `#ffc53d` (magic, stars, the World Flower's heart).
- Petals are never generic pink: each is its sound's colour from the school's petal chart (`CHART_PETALS` in `src/content/flower.ts`).
- Each world has a signature hue used in its UI accents: bamboo green, blossom pink, mountain ice blue, river turquoise, castle violet, and sky gold.

## The World Flower

The World Flower is the heart of the story and the most gorgeous thing in the game. It grows at the centre of the Island of Sounds, and everything on the island lives on its light. The child rebuilds it petal by petal on the World Flower screen (`src/scenes/Tree.tsx`).

- **Design:** its bloom is two rings of separate glassy **teardrop** petals: round outer tips, pointed where they meet the centre, the same shape as the school chart's petals.
  - The inner ring has the 20 vowel sounds and the outer ring the 24 consonants. Each ring runs round in rainbow order, and each petal is its sound's chart colour. The chart's ink-dark /or/ is painted deep bronze.
  - The centre is a glowing domed golden disc ringed by tiny stamens, with a thin golden halo and soft rays behind.
  - It has an S-curved jade stem with big curling leaves veined with glowing gold, and ancient roots gripping a mossy rock.
  - It is never a tree, the centre is never heart-shaped, and it has no face.
- **Model sheet:** `assets-src/world-flower/model_sheet.png`.
  - Glorious (before the storm).
  - Destroyed: every petal gone, the bare centre dull and drooping, the leaves grey.
  - Partly regrown: some petals glowing, the missing ones pale ghost outlines.
  - Fully restored: the finale, with rainbow ribbons and sparkles.
  - The source images are `world_flower_{glorious,destroyed,partial,restored}.png`. Use them as references in every prompt that shows the flower.
- **How it was chosen:** `assets-src/world-flower/rounds.ts` holds every prompt (10 concepts in round 1, then 3 directions, 2 polish rounds and the states). The contact sheets are `r1_contact.jpg` … `r4_contact.jpg` and `states_contact.jpg`. The colour and structure guide is `ref_petal_wheel*.png`, from `petals.py`.
- **In game:** `WorldFlower` in `src/scenes/Tree.tsx` draws the bloom in SVG to the same design, with each petal lit when its gems are won. It sits on the painted stem sprite `world_flower_stem` over `world_flower_bg`.
- **Sounds the child hasn't met** are mysterious, not just dim: on the petal scroll they are shrouded in ink mist with a shimmering "?" rune, and unmet spellings are dark crystals.
- **Scale in scenes:** as tall as a temple. Characters stand in the foreground with the flower towering behind them.
- **Sensei in scenes:** she always looks at the action (the flower, Baron or the ninjas). Frames made from the front-facing idle sprite alone put her looking at the camera, so use the profile pose refs in `assets-src/intro-v3/refs/`.

## Word picture cards

These use the *same* outline and painting rules as characters, centred on white with a wide margin. A word picture must be instantly recognisable to a **3-year-old** in the UK, without novelty props (docs/FIRST_MINUTES.md §11). There are two styles (`scripts/art-manifest.ts`):

- **`PIC_OBJECT`**: one object, drawn whole in its most typical view and usual colour, with no face.
- **`PIC_LIVING`**: one animal or person (or a character such as the snowman or the fish-dog), drawn whole from head to toe or tail, facing the viewer or in three-quarter front view, never from behind, **with a friendly face, two big clear eyes and a smile**. The old single style said "no face unless it is an animal or person", and the image model dropped the faces anyway: a faceless dog, a pig from behind. `src/content/living.ts` lists the living words; the picture audit (`scripts/treadmill/pic-audit.ts`, now with `--age 3` and `--warmups`) flags any living picture a child can't see a face on.

**Cards and plates.** In the game a picture sits on a coloured card, never plain white:
- Each picture gets the plate colour furthest in hue from its own main colour (`scripts/gen-pic-plates.py` → `src/content/pic-plates.gen.ts`), with ties rotated by word so a row of cards differs. `plate:` in the art manifest (`PLATE`) picks one by hand: the moon and stars sit on the night plate; dog and sunflower are lilac and starfish teal, so neighbours in the first lessons differ. post-art.py runs gen-pic-plates.py after every new word picture.
- The card fits the (tightly trimmed) picture into a 78% × 74% safe box with `contain`, with a halo and, for grounded things, a contact shadow. The picture is never clipped and never goes see-through; the five card states (named, found, right, wrong, dimmed) change the plate, not the picture's opacity.
- New pictures are trimmed like the old ones. `PAD=0.14` in post-art.py re-pads to a 14% margin, but only use it when re-cutting every picture, or the new ones sit smaller.
