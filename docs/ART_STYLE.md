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
- No text, letters, numbers or flags anywhere. Objects have no faces; only characters and monsters do.
- Japanese-inspired motifs in the world: swirl clouds, seigaiha waves, lanterns and blossom.

## Palette anchors

- Ink `#2b1d14`, paper `#fff4dc`, blossom pink `#ff7aa2` (petals, rewards), ninja indigo `#3b3a8f` and red `#e2412f` (the hero), gold `#ffc53d` (magic, stars).
- Each world has a signature hue used in its UI accents: bamboo green, blossom pink, mountain ice blue, river turquoise, castle violet, and sky gold.

## Word picture cards

These use the *same* outline and painting rules as characters, but show a single object in three-quarter view, with no face, centred on white, with a generous margin. A word picture must be instantly recognisable to a 4-year-old in the UK, without novelty props.
