I updated 24 picture prompts and their images, then regenerated [pic-names.ts](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/pic-names.ts) from the [full blind audit](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/pics-v2/pics-all.json). I used 46 image generations, stayed within the budget, and made no commit.

**Fourteen of the 24 retained new pictures now pass** the exact-name test. The full audit rose from 92/160 to 113/160 exact passes; seven of that net gain came from unchanged pictures receiving different names on the repeat audit. I restored takes that were visibly worse, including a dot whose cutout lost most of the mark.

I judged these unlikely to get a reliable *exact first name* from a single picture: **sit, nap, hop, hot, fog, jump, swim, night** (actions or conditions), and **cab, cob, cub, pup, bulb, chest, chimp, fin, hen, hob, ship, tusk** (children tended to use a related object, part, or synonym). Dot and beach remain failures but could benefit from purpose-drawn art.

An unrelated `dictationSafe` addition appeared in [phonics.ts](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/phonics.ts) during this work; I left it untouched. The table uses the original and final **full** audits. Some pictures were restored unchanged, so a changed name in those rows reflects audit variation.

| Word | Old name | New name | Result |
|---|---|---|---|
| sit | boy | sitting down | Fail |
| nap | cat | cat | Fail |
| cob | sweetcorn | sweetcorn | Fail |
| hob | pan | cooker | Fail |
| hop | bunny | jumping | Fail |
| hot | soup | soup | Fail |
| dot | ball | ball | Fail |
| fog | tree | tree | Fail |
| vet | stethoscope | vet | Pass |
| cub | bear | bear | Fail |
| leg | shoe | leg | Pass |
| pup | puppy | doggy | Fail |
| bulb | lightbulb | lightbulb | Fail |
| jump | ninja | jumping | Fail |
| tusk | elephant | horn | Fail |
| swim | swimming | swimming | Fail |
| crisp | potato | crisp | Pass |
| chest | treasure chest | treasure chest | Fail |
| chimp | monkey | monkey | Fail |
| king | crown | king | Pass |
| witch | witch hat | witch | Pass |
| beach | bucket | bucket | Fail |
| night | moon | moon | Fail |
| cab | taxi | taxi | Fail |
| cup | mug | cup | Pass |
| van | car | van | Pass |
| fin | shark | shark | Fail |
| wig | hair | wig | Pass |
| fig | plum | fruit | Fail |
| box | block | box | Pass |
| rat | mouse | rat | Pass |
| nut | acorn | nut | Pass |
| bun | bread | bun | Pass |
| hut | house | hut | Pass |
| dress | vest | dress | Pass |
| vest | waistcoat | vest | Pass |
| ship | boat | boat | Fail |
| hen | chicken | chicken | Fail |