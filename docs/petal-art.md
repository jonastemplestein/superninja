# Petal pictures

**Status:** the art review for the World Flower chart rebuild ([SCROLL_DESIGN.md](SCROLL_DESIGN.md)), 27 September 2026. The 19 pictures listed below were redrawn the same day and are in `public/a/i/petal_<id>.webp`; the old ones (and their `assets-src/art` and `assets-src/cut` sources) are in `.trash/petal-art-2026-09-27/`. Nothing in `src/` has changed.

**The rule:** each petal's corner picture shows **the same subject as the school's Extended Code chart**, drawn in our own style, because the children already know the chart's pictures from class. That holds even where a 3-year-old might name the picture with another sound. Where a picture was unreadable at petal size (72 stage px, about 36 CSS px on a phone), it is redrawn more clearly. The 12 sounds the chart doesn't have were judged on two things: is the picture clear to a 3-year-old, and does it suit the sound's example words? The side-by-side pairs are in `playtest/runs/petal-art/` (git-ignored, because they contain crops of the chart). The chart image never goes into the repo.

## What changes (19 pictures)

| Sound | Was | Now | Why |
|---|---|---|---|
| /oy/ | a wooden toy robot | a schoolboy with a backpack (**boy**) | the chart's picture |
| /ie/ | a kite | a pie in a purple dish (**pie**) | the chart's picture |
| /uu/ | a rubber duck | an open book (**book**) | the chart's picture; a duck is a /u/ word |
| /oo/ | a crescent moon | a red balloon (**balloon**) | the chart's picture |
| /i/ | a toy building brick | a packet of biscuits (**biscuit**) | the chart's picture |
| /j/ | a giraffe | a friendly blue genie rising from a lamp (**genie**) | the chart's picture |
| /t/ | a tiger | a pile of envelopes (**letter**) | the chart's picture (a tiny line drawing: most likely letters, possibly bills) |
| /z/ | a zebra | golden sand dunes under a turquoise sky (**desert**) | the chart's picture |
| /s/ | a solid red disc | a hollow red circle | the same subject; the disc read as a ball, like /b/ |
| /ue/ | a folded cream cloth | a newspaper with a masthead and lines of print | the same subject; it looked like a towel |
| /o/ | a honeybee | a slim black-and-yellow wasp | the same subject; "bee" is an /ee/ word |
| /v/ | a standing pigeon | a white dove flying, wings raised | the same subject, in the chart's pose; it read as /er/'s "bird" |
| /g/ | a white blob | a white ghost with eyes and an "oo" mouth | the same subject; it had no face, so it wasn't a ghost at petal size |
| /b/ | a plain red disc | a striped beach ball | not on the chart; the disc was the same as /s/'s |
| /sh/ | a sailing ship | a scallop **shell** | not on the chart; a 3-year-old calls the ship "boat" (/oe/'s picture); "shell" is in its recorded examples |
| /ch/ | a chick from behind | a chick facing us | not on the chart; from behind it was a yellow blob |
| /th/ | three stars | a hand showing three fingers | not on the chart; a child said "stars", while three fingers is how a 3-year-old shows "three" |
| /ng/ | a plain gold band | a gold ring with a diamond | not on the chart; a plain band could be taken for /s/'s circle |
| /zh/ | a closed chest | an open chest full of treasure | not on the chart; a closed one is "box" |

**Kept (25):** /ae/ train, /ee/ tree, /oe/ boat, /er/ bird, /ar/ car, /ou/ mouse, /or/ corn, /air/ chair, /l/ castle, /f/ dolphin, /e/ bread, /u/ heart, /d/ dog, /n/ knight, /m/ thumbs-up, /h/ speech bubble with a "?", /k/ anchor, /r/ rhino, /eer/ ear (all the chart's subjects), and /a/ apple, /p/ pig, /w/ whale, /y/ yo-yo, /dh/ feather, /schwa/ banana (not on the chart, and clear).

## Still to do in code (owner of `src/content/flower.ts`)

`CHART_PETALS` feeds the art prompts and the rule that a turn never offers a card of the petal's own word (`iconWordOf`). It needs the new `icon` text for all 19 and a new `iconWord` for eight: oy **boy**, ie **pie**, oo **balloon**, i **biscuit**, j **genie**, t **letter**, z **desert**, sh **shell**. The prompts used are in `playtest/runs/petal-art/compare.md`.

## How the new pictures were drawn

Each picture had 4 candidates from gemini-3-pro-image (the brief's model) and 2 from gemini-3.1-flash-image (the model the other petals were made with), all as `<subject>. PIC_STYLE`, then the same cut as the petal jobs in `scripts/post-art.py` (rembg isnet-anime, trimmed, 256 px wide, WEBP q86). The best was picked by eye at 200 px and at 48 and 36 px on the petal's colour. 12 picks came from the pro model and 7 from the flash model; they sit together as one set. The raw and cut sources replaced `assets-src/art/petal_<id>.png` and `assets-src/cut/petal_<id>.png`, so a later `post-art.py petal` run rebuilds the new pictures, not the old ones.

- **/j/:** Gemini refuses almost every prompt with a blue *genie* and a lamp (PROHIBITED_CONTENT or IMAGE_RECITATION: 24 of 27 tries on the two models refused), as it reads as the film character. 5 of 6 tries without the word went through. The picture came from a prompt that never says "genie": *a small shiny golden magic oil lamp at the bottom, and rising tall out of its spout a big friendly blue magic spirit made of smoke: a round smiling blue face with big kind eyes, a pink turban with a feather, two blue arms waving hello, his body a curling tail of blue smoke joining the spout*. The pink turban makes it our own design. **When `flower.ts` gets the new /j/ `icon`, keep the word "genie" out of it**, or `gen-art.ts petal_j --force` will be refused.
- **/i/:** the first round's square packets read as a red box or a brick at 36 px. The new picture is the chart's shape: a red roll-packet with a plain blue band, torn open with the biscuits showing, and one biscuit (with a bite out of it) beside it.
- **/s/:** the first round's rings were thick and read as a doughnut. The new one is a thinner, flatter ring. rembg left the middle of the ring (and of /ng/'s ring) white, so it was cleared by hand (`playtest/runs/petal-art/redraw/holes.py`); the petal's colour now shows through.
- **/th/:** index, middle and ring finger up, the thumb holding the little finger down: three fingers, checked.
- **/oy/** and **/th/** are tall pictures (256 × 464 and 256 × 445), so in a square box they sit a little smaller than the others.

The working files (every candidate and the review sheets) are in `playtest/runs/petal-art/redraw/`, and `playtest/runs/petal-art/redraw.png` shows the chart's picture, the old picture and the new one side by side. Git ignores both, because the sheets hold chart crops.

