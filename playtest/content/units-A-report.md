# Sounds~Write phase A: Initial Code and Bridging content

Generated from the official September 2024 no-split-spelling policy. The word files were checked against all 15 validator rules; no published entry fails a rule. Counts below compare the generated data with `contentQuota()` in `sw.ts`. Quotas are design targets, not validator gates.

## Counts and rule failures

| Unit | Words | Pictureable | Chains | Dictation sentences | Failed rules |
|---|---:|---:|---:|---:|---:|
| IC1 | 6/6 | 2/2 | 1/1 | 0/3 | 0 |
| IC2 | 20/20 | 10/8 | 2/2 | 0/8 | 0 |
| IC3 | 23/30 | 10/12 | 2/2 | 2/8 | 0 |
| IC4 | 26/30 | 13/12 | 2/2 | 8/8 | 0 |
| IC5 | 30/30 | 21/12 | 2/2 | 8/8 | 0 |
| IC6 | 11/30 | 9/12 | 2/2 | 8/8 | 0 |
| IC7 | 30/30 | 12/12 | 2/2 | 8/8 | 0 |
| IC8 | 40/40 | 15/12 | 3/3 | 8/8 | 0 |
| IC9 | 40/40 | 13/12 | 3/3 | 8/8 | 0 |
| IC10 | 40/40 | 14/12 | 3/3 | 8/8 | 0 |
| IC11 | 60/60 | 27/20 | 2/2 | 8/8 | 0 |
| BR | 30/30 | 18/9 | 0/0 | 6/6 | 0 |
| **Total** | **356** | **164** | **24** | **72** | **0** |

Rule-failure statistics: **0 failed unit-rule checks out of 180**. Every word, chain, sentence and picture prompt in the published files passes the applicable rules. The candidate pool was filtered first; excluded candidates are not counted as published failures.

The word quota is short in IC3 (23/30), IC4 (26/30), IC6 (11/30) after excluding unfamiliar, unsafe, accent-sensitive or otherwise invalid candidates. The curated pool yielded every eligible new word for these units. IC1 uses all six valid words in its small code. IC1 and IC2 cannot have sentences two units behind; IC3 can form only two natural lagged sentences. More text should be added only when code at the required lag allows it.

IC8 includes one explicitly flagged pseudo-word, `vimp`, in a chain with insert/delete. No pseudo-word appears in IC1–7. BR words are tagged `review`, as its lesson teaches choices among previously taught spellings.

## Spelling coverage needing review

- **IC11** sort-tagged words by spelling: sh: 7, ch: 9, th: 7, ck: 10, ng: 10, n: 2, wh: 2, q: 2, u: 1, ve: 2, tch: 6. The target is 8 per new spelling for IC11 and 10 per BR spelling; see model gaps below.
- **BR** sort-tagged words by spelling: c: 4, k: 3, ck: 4, w: 4, wh: 3, ch: 3, tch: 3, l: 3, ll: 3. The target is 8 per new spelling for IC11 and 10 per BR spelling; see model gaps below.

## Human review

- IC2 **pin**: Jev unfamiliar 0.51, unsuitable 0.11.
- IC2 **map**: Jev unfamiliar 0.55, unsuitable 0.04.
- IC2 **pip**: Jev unfamiliar 0.55, unsuitable 0.10.
- IC2 **nip**: Jev unfamiliar 0.56, unsuitable 0.16.
- IC3 **gas**: Jev unfamiliar 0.33, unsuitable 0.37.
- IC3 **hip**: Jev unfamiliar 0.52, unsuitable 0.12.
- IC3 **gap**: Jev unfamiliar 0.54, unsuitable 0.11.
- IC4 **fin**: Jev unfamiliar 0.57, unsuitable 0.08.
- IC4 **set**: Jev unfamiliar 0.54, unsuitable 0.05.
- IC4 **beg**: Jev unfamiliar 0.58, unsuitable 0.10.
- IC4 **dab**: Jev unfamiliar 0.58, unsuitable 0.20.
- IC6 **web**: Jev unfamiliar 0.56, unsuitable 0.06.
- IC6 **wad**: Jev unfamiliar 0.58, unsuitable 0.31.
- IC7 **mill**: Jev unfamiliar 0.58, unsuitable 0.05.
- IC8 **dent**: Jev unfamiliar 0.52, unsuitable 0.05.
- IC9 **plod**: Jev unfamiliar 0.57, unsuitable 0.04.
- IC10 **scrap**: Jev unfamiliar 0.55, unsuitable 0.12.
- IC10 **swept**: Jev unfamiliar 0.50, unsuitable 0.04.
- IC10 **plump**: Jev unfamiliar 0.54, unsuitable 0.06.
- IC10 **spend**: Jev unfamiliar 0.56, unsuitable 0.06.
- IC10 **crept**: Jev unfamiliar 0.59, unsuitable 0.07.
- IC11 **match**: Jev unfamiliar 0.58, unsuitable 0.18.
- IC11 **pitch**: Jev unfamiliar 0.57, unsuitable 0.09.
- BR **scrap**: Jev unfamiliar 0.55, unsuitable 0.12.
- BR **web**: Jev unfamiliar 0.56, unsuitable 0.06.
- BR **pitch**: Jev unfamiliar 0.57, unsuitable 0.09.
- BR **pill**: Jev unfamiliar 0.35, unsuitable 0.37.

Southern British pronunciation checks are cached for the selected doubtful words, including `with`, `sink` and `wink`. The model judgement is a screen; a teacher should listen to these and a 10% word sample before recording audio. The existing blind picture audit found several pictures that children named differently. Replacement prompts below need fresh artwork and a new blind naming check.

## New pictures needed (33)

These picture-tagged words have no `public/a/i/pic_<word>.webp` asset yet. Each prompt describes one object or clear action without visible writing.

- **ham** (IC3): one slice of pink cooked ham on a plain white plate
- **lad** (IC5): one smiling young boy standing alone in ordinary clothes
- **ram** (IC5): one adult ram standing alone with large curled horns
- **wag** (IC6): one happy dog's tail wagging from side to side, full dog shown
- **win** (IC6): one child crossing a finish line first with both arms raised, no writing
- **jog** (IC6): one child jogging along a clear path in trainers, seen from the side
- **kiss** (IC7): two teddy bears touching noses in a gentle kiss, full bodies visible
- **yell** (IC7): one child calling out loudly with hands cupped round the mouth
- **mess** (IC7): one messy pile of coloured toy blocks scattered on the floor
- **puff** (IC7): one soft white puff of steam rising from a kettle
- **fix** (IC7): one child fixing a broken toy wheel with a small screwdriver, full action visible
- **mill** (IC7): one old windmill with four sails on a hill
- **mint** (IC8): one fresh mint plant with small bright green leaves in a pot
- **dent** (IC8): one clear dent in the side of a plain metal tin
- **flap** (IC9): one bird flapping its wings in mid-air, clearly seen from the side
- **slam** (IC9): one wooden door swinging shut, with motion lines and no person
- **plod** (IC9): one child walking slowly through shallow mud in wellies
- **stand** (IC10): one child standing upright with arms by their sides, full body visible
- **strap** (IC10): one plain blue fabric strap with a buckle, laid out alone
- **crust** (IC10): one crisp brown crust cut from a loaf of bread, alone
- **twist** (IC10): one twisted strip of bright paper, alone
- **frost** (IC10): one garden leaf edged with white frost crystals
- **scrub** (IC10): one hand scrubbing a dirty plate with a sponge
- **strip** (IC10): one long narrow strip of red cloth, alone
- **split** (IC10): one log split neatly into two matching halves
- **scrap** (IC10): one small scrap of blue cloth with frayed edges, alone
- **tents** (IC10): two small camping tents on grass, no people or writing
- **clump** (IC10): one clump of grass with roots and soil visible
- **wink** (IC11): one child winking one eye with a friendly smile, face shown close up
- **sink** (IC11): one plain white kitchen sink with a tap and drain, empty and clean
- **chunk** (IC11): one chunky piece of cheese cut from a block, no plate
- **hatch** (IC11): one little yellow chick hatching from a cracked egg
- **pitch** (IC11): one grassy sports pitch with white boundary lines and no words

## Existing pictures to replace (16)

- **nap** (IC2): one child asleep on a small bed in daylight, shoes off and blanket folded back
- **hen** (IC4): one adult brown hen standing alone, with a red comb and short beak
- **dot** (IC4): one small black round dot centred on a plain white square, no other marks
- **fog** (IC4): one patch of thick grey fog curling across a field, no trees or buildings
- **fin** (IC4): one single shark fin rising from blue water, with the shark's head and body hidden
- **hug** (IC5): two children facing each other in one clear hug, both full bodies visible
- **tub** (IC5): one freestanding bath tub with four little feet and no taps
- **pup** (IC5): one very young puppy standing alone with oversized paws and floppy ears
- **cub** (IC5): one young bear cub standing alone, small round ears and short snout, no adult bear
- **jet** (IC6): one grey jet aircraft with swept wings and two engines, flying alone
- **hill** (IC7): one smooth green grassy hill rising above a flat plain, no food or buildings
- **twig** (IC9): one thin twig with two small side branches and a few leaves, lying alone
- **stamp** (IC10): one postage stamp with a scalloped edge and a simple flower picture, no letters or numbers
- **ship** (IC11): one large ship with a tall funnel, decks and portholes, floating on water
- **quilt** (IC11): one stitched patchwork quilt folded on a plain bed, with a repeating square pattern
- **squid** (IC11): one squid swimming alone, with a long pointed mantle and ten trailing arms

## Model gaps and follow-up

- `contentQuota('BR')` asks for 30 words and 10 per spelling across nine official spellings. That would need at least 90 distinct sort items, while several official spelling lists in `BRIDGING_UNIT` contain fewer than ten words. The generated 30 cover every spelling with at least three sort-tagged examples except where a word's target sound occurs twice.
- `contentQuota('IC11')` asks for 60 words and eight per new spelling, but `newGpcsIn('IC11')` has twelve GPC pairs. A full eight-per-pair set would require at least 96 sort items; familiar one-syllable words for `<q>`, `<u>`, `<ve>`, `<wh>` and `<tch>` are especially limited.
- `INITIAL_CODE_UNITS` notes say `<sh>` begins in IC9 and `<ch>` in IC10, while `gpcsOfUnit()` introduces both in IC11. The files follow `gpcsOfUnit()` strictly, so IC9/10 omit those early lesson spellings.
- `SW_SEQUENCE` and `knownGpcsAt()` do not include PW stages; the validator's polysyllabic rule will need a model-supported code position before phase D. The phase A `poly` arrays are empty.
- `contentQuota()` has one story per IC unit, but the §6.4 unit file format has no story field. This phase created no stories or audio; connected text and artwork remain separate asset work.
- Some new picture prompts depict actions, such as `win`, `jog` and `wink`. They need child naming trials before use in a picture-choice game.

