# Playtest inbox

Run `playtest/runs/2026-09-25-21-40-38-quick` · 2026-09-25T21:42 · bots finished 12/12 cases in 61s at 4× · sources: jev-lines.json, jev-words.json, jev-triage.json, sweep.json

**0 blockers · 0 major · 28 minor · 20 polish** — 0 new, 0 regressed, 0 auto-closed since last run.

Triage: fix, then rerun; mark false alarms with `bun scripts/treadmill/inbox.ts playtest/runs/2026-09-25-21-40-38-quick --wontfix <sig>`.

## Root causes (Jev triage)

- **[major] tiny-target: button.btn-round.go[aria-label="Next"]** — layout, 2 findings in w1-6

## Minor (28)

- **baron_w5: says 'letters' where it should say sounds or spellings (rule 3)** · `line:baron_w5` · jev
  "Welcome to my castle, little ninja! In here, some sounds are spelt with two letters. How muddling! Mwa-ha-ha!" (baron, story, Baron Muddle) — jev letter_word=0.62 (confidence 0.62); not referenced by id in src/ (may be built dynamically)
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:baron_w5:letter_word</sub>
- **dojo_build: too many steps to hold in mind when heard once** · `line:dojo_build` · jev
  "Now let's make words! First, listen to the word. Then tap its sounds, one at a time." (sensei, instruction, Dojo) — jev load=0.9 (confidence 0.71); used in src/scenes/Dojo.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:dojo_build:load</sub>
- **help_read: unclear instruction for a pre-reader** · `line:help_read` · jev
  "Read each word, then tap the green tick." (sensei, instruction, Help button) — jev unclear=0.74 (confidence 0.74); used in src/scenes/Story.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:help_read:unclear</sub>
- **help_sort: unclear instruction for a pre-reader** · `line:help_sort` · jev
  "Tap the chest with the same spelling." (sensei, instruction, Help button) — jev unclear=0.77 (confidence 0.77); used in src/scenes/Sort.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:help_sort:unclear</sub>
- **place_findall: unclear instruction for a pre-reader** · `line:place_findall` · jev
  "Tap every picture that has this sound." (sensei, instruction, Placement) — jev unclear=0.73 (confidence 0.73); used in src/scenes/Placement.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:place_findall:unclear</sub>
- **run_start: too many steps to hold in mind when heard once** · `line:run_start` · jev
  "Ninja Run! Tap to jump, and catch the right word!" (sensei, instruction, Run) — jev load=0.9 (confidence 0.7); used in src/scenes/Run.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:run_start:load</sub>
- **s1/5b: too many steps to hold in mind when heard once** · `line:s1/5b` · jev
  "Shhh! Let's tiptoe away and let Pip the panda sleep. Try the other place!" (sensei, instruction, Story "The Missing Pot") — jev load=0.93 (confidence 0.78); used in src/scenes/Story.tsx
  [stories.ts](runs/2026-09-25-21-40-38-quick/src/content/stories.ts)
  <sub>jev:line:s1/5b:load</sub>
- **s1/5b: unclear instruction for a pre-reader** · `line:s1/5b` · jev
  "Shhh! Let's tiptoe away and let Pip the panda sleep. Try the other place!" (sensei, instruction, Story "The Missing Pot") — jev unclear=0.71 (confidence 0.71); used in src/scenes/Story.tsx
  [stories.ts](runs/2026-09-25-21-40-38-quick/src/content/stories.ts)
  <sub>jev:line:s1/5b:unclear</sub>
- **s5/4: unclear instruction for a pre-reader** · `line:s5/4` · jev
  "What should Super Ninja do?" (sensei, instruction, Story "The Baron's Chest") — jev unclear=0.7 (confidence 0.7); used in src/scenes/Story.tsx
  [stories.ts](runs/2026-09-25-21-40-38-quick/src/content/stories.ts)
  <sub>jev:line:s5/4:unclear</sub>
- **s6/5: unclear instruction for a pre-reader** · `line:s6/5` · jev
  "Which story will you read to the Baron?" (sensei, instruction, Story "The Last Petal") — jev unclear=0.71 (confidence 0.71); used in src/scenes/Story.tsx
  [stories.ts](runs/2026-09-25-21-40-38-quick/src/content/stories.ts)
  <sub>jev:line:s6/5:unclear</sub>
- **sort_start: too many steps to hold in mind when heard once** · `line:sort_start` · jev
  "Sorting time! These words have the same sound, but it's written in different ways. Put each word in the right chest!" (sensei, instruction, Sort) — jev load=0.9 (confidence 0.69); used in src/scenes/Sort.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:sort_start:load</sub>
- **sort_start: unclear instruction for a pre-reader** · `line:sort_start` · jev
  "Sorting time! These words have the same sound, but it's written in different ways. Put each word in the right chest!" (sensei, instruction, Sort) — jev unclear=0.77 (confidence 0.77); used in src/scenes/Sort.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:sort_start:unclear</sub>
- **story_choose: unclear instruction for a pre-reader** · `line:story_choose` · jev
  "What should Super Ninja do? Read the words and choose!" (sensei, instruction, Story) — jev unclear=0.74 (confidence 0.74); used in src/scenes/Story.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:story_choose:unclear</sub>
- **timer_intro_2: could make the child feel bad, rushed or like a failure** · `line:timer_intro_2` · jev
  "When it's full, the monster jumps, and you lose a heart. So spell each word before the bar is full." (sensei, instruction, Battle) — jev deflating=0.6 (confidence 0.6); used in src/scenes/Battle.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:timer_intro_2:deflating</sub>
- **timer_intro_2: too many steps to hold in mind when heard once** · `line:timer_intro_2` · jev
  "When it's full, the monster jumps, and you lose a heart. So spell each word before the bar is full." (sensei, instruction, Battle) — jev load=0.93 (confidence 0.79); used in src/scenes/Battle.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:timer_intro_2:load</sub>
- **timer_intro_3: too many steps to hold in mind when heard once** · `line:timer_intro_3` · jev
  "Don't worry. If you run out of hearts, I'll help you. Ready? Let's go!" (sensei, instruction, Battle) — jev load=0.9 (confidence 0.7); used in src/scenes/Battle.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:timer_intro_3:load</sub>
- **trial_start: unclear instruction for a pre-reader** · `line:trial_start` · jev
  "Gem battle! Spell the words to win the gem!" (sensei, instruction, World Flower & gems) — jev unclear=0.72 (confidence 0.72); used in src/scenes/Battle.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:trial_start:unclear</sub>
- **what_changed: unclear instruction for a pre-reader** · `line:what_changed` · jev
  "What changed? Listen here." (sensei, instruction, Early learning) — jev unclear=0.72 (confidence 0.72); used in src/scenes/Swap.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:what_changed:unclear</sub>
- **tiny-target: button.btn-round[aria-label="Play again"]** · `w1-6` · invariant
  13×13px on a phone (want ≥ 44)
  [issue_0.png](runs/2026-09-25-21-40-38-quick/cases/w1-6/issue_0.png)
  repro: http://localhost:4180/play/?level=w1-6
  <sub>bot:w1-6:tiny-target:button.btn-round[aria-label="Play again"]</sub>
- **tiny-target: button.btn-round.go[aria-label="Next"]** · `w1-6` · invariant
  17×17px on a phone (want ≥ 44)
  [issue_1.png](runs/2026-09-25-21-40-38-quick/cases/w1-6/issue_1.png)
  repro: http://localhost:4180/play/?level=w1-6
  <sub>bot:w1-6:tiny-target:button.btn-round.go[aria-label="Next"]</sub>
- **fig: most children at this stage won't know this word** · `word:fig` · jev
  "fig" (unit 4, picture: one whole purple fig fruit beside a cut half showing its distinctive pink seed-filled centre, short stem and teardrop shape) — jev known=0.68
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:fig:known</sub>
- **fight: unsuitable word for a young child** · `word:fight` · jev
  "fight" (unit 12) — jev unsafe=0.49
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:fight:unsafe</sub>
- **hob: most children at this stage won't know this word** · `word:hob` · jev
  "hob" (unit 3, picture: one built-in black glass kitchen hob seen from slightly above, a completely flat rectangular top with four circular electric cooking rings and four small controls along one edge, no raised cooker body, oven, pan or food) — jev known=0.74
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:hob:known</sub>
- **igloo: most children at this stage won't know this word** · `word:igloo` · jev
  "igloo" (unit oral, picture: a small snowy igloo) — jev known=0.67
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:igloo:known</sub>
- **moth: most children at this stage won't know this word** · `word:moth` · jev
  "moth" (unit 11, picture: a moth) — jev known=0.7; used in: first-sound game w1-2: "which one starts with /m/?" picture
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:moth:known</sub>
- **otter: most children at this stage won't know this word** · `word:otter` · jev
  "otter" (unit oral, picture: a cute brown otter floating on its back) — jev known=0.6
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:otter:known</sub>
- **tusk: most children at this stage won't know this word** · `word:tusk` · jev
  "tusk" (unit 8, picture: an elephant tusk in extreme close-up: one enormous long white ivory tusk curves upward from a tiny piece of grey elephant jaw visible at its base; the tusk dominates the image, elephant head and trunk are outside the frame) — jev known=0.74; used in: first-sound game w1-3: "which one starts with /t/?" picture
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:tusk:known</sub>
- **yak: most children at this stage won't know this word** · `word:yak` · jev
  "yak" (unit 7, picture: a yak) — jev known=0.7
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:yak:known</sub>

## Polish (20)

- **timer_intro_2: vocabulary too hard for a 3–4 year old** · `line:timer_intro_2` · jev
  "When it's full, the monster jumps, and you lose a heart. So spell each word before the bar is full." (sensei, instruction, Battle) — jev vocab=0.76 (confidence 0.28); used in src/scenes/Battle.tsx
  [lines.ts](runs/2026-09-25-21-40-38-quick/src/content/lines.ts)
  <sub>jev:line:timer_intro_2:vocab</sub>
- **beg: most children at this stage won't know this word** · `word:beg` · jev
  "beg" (unit 4) — jev known=0.61
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:beg:known</sub>
- **blend: most children at this stage won't know this word** · `word:blend` · jev
  "blend" (unit 10) — jev known=0.7
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:blend:known</sub>
- **brisk: most children at this stage won't know this word** · `word:brisk` · jev
  "brisk" (unit 10) — jev known=0.69
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:brisk:known</sub>
- **crept: most children at this stage won't know this word** · `word:crept` · jev
  "crept" (unit 10) — jev known=0.6
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:crept:known</sub>
- **cuff: most children at this stage won't know this word** · `word:cuff` · jev
  "cuff" (unit 7) — jev known=0.62
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:cuff:known</sub>
- **glum: most children at this stage won't know this word** · `word:glum` · jev
  "glum" (unit 9) — jev known=0.62
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:glum:known</sub>
- **imp: most children at this stage won't know this word** · `word:imp` · jev
  "imp" (unit 8) — jev known=0.6
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:imp:known</sub>
- **jab: most children at this stage won't know this word** · `word:jab` · jev
  "jab" (unit 6) — jev known=0.69
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:jab:known</sub>
- **jazz: most children at this stage won't know this word** · `word:jazz` · jev
  "jazz" (unit 7) — jev known=0.61
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:jazz:known</sub>
- **jig: most children at this stage won't know this word** · `word:jig` · jev
  "jig" (unit 6) — jev known=0.64
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:jig:known</sub>
- **pit: most children at this stage won't know this word** · `word:pit` · jev
  "pit" (unit 2) — jev known=0.6; used in: "who read it right?" in w1-11; sound-swap chain in w1-12
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:pit:known</sub>
- **prop: most children at this stage won't know this word** · `word:prop` · jev
  "prop" (unit 9) — jev known=0.6
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:prop:known</sub>
- **rust: most children at this stage won't know this word** · `word:rust` · jev
  "rust" (unit 8) — jev known=0.61
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:rust:known</sub>
- **skid: most children at this stage won't know this word** · `word:skid` · jev
  "skid" (unit 9) — jev known=0.62
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:skid:known</sub>
- **smug: most children at this stage won't know this word** · `word:smug` · jev
  "smug" (unit 9) — jev known=0.74
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:smug:known</sub>
- **stun: most children at this stage won't know this word** · `word:stun` · jev
  "stun" (unit 9) — jev known=0.64
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:stun:known</sub>
- **tan: most children at this stage won't know this word** · `word:tan` · jev
  "tan" (unit 2) — jev known=0.61; used in: sound-swap chain in w1-12
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:tan:known</sub>
- **text: most children at this stage won't know this word** · `word:text` · jev
  "text" (unit 10) — jev known=0.71
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:text:known</sub>
- **trim: most children at this stage won't know this word** · `word:trim` · jev
  "trim" (unit 9) — jev known=0.61
  [phonics.ts](runs/2026-09-25-21-40-38-quick/src/content/phonics.ts)
  <sub>jev:word:trim:known</sub>

