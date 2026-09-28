# Feedback backlog

Every piece of feedback from Jonas, in the order received, with its status. ✅ done · 🔨 in progress · ⏳ queued · 🅿️ parked

## Round 1 (after first iPhone play)
- ✅ The /a/ sound was high-pitched and breathy, not a normal teacher "a". All vowels and 23 words were re-recorded with a pitch check (170–290 Hz).
- ✅ The screen zoomed weirdly when a monster hit you (screen-shake overwrote the stage scale).
- 🔨 Play from the home screen with no browser chrome. The manifest and iOS meta tags are done, and a tip is shown in Safari. iPhone Safari cannot hide its bars without an install. See round 3.
- ✅ Time pressure came too early and was scary. Early battles now have no timer; this is being reworked into Gem Trials (round 2).
- 🅿️ Work out the child's real level (parked by Jonas, then asked for in round 2 as a "get to know you" mini-game).

## Round 2 (gems, landing page)
- ✅ The timer is something you *earn*. You practise a spelling until its gem is full of energy, then take a timed Gem Trial to win the gem.
- 🔨 A petal-chart model: each petal is one sound (the /ae/ petal), and its gems are that sound's spellings (ai, ay, ea, a‑e …). All gems place the petal into the flower, and a complete flower beats the game. (The PDF mentioned never arrived; this is modelled on the published Sounds~Write Extended Code progression.)
- ✅ A starting-level "get to know you" mini-game (Show Sensei).
- ✅ A very strong landing page: story, mechanics and narrative, artsy, gameplay videos on a phone, free with no accounts, UK phonics, linked to Sounds~Write (no logo without permission, since it is a registered trade mark).
- ✅ A repeatable release process (`scripts/release.sh`, (docs/RELEASING.md) to go from each game version to an updated landing page and videos.

## Round 3 (map, bubbles, phone ergonomics)
- ✅ The map never makes it clear what to tap. The next stone is now big, gold and bouncing with a pointing hand, tapping the ninja also opens it, and locked stones recede.
- ✅ Speech bubbles cover the things that need tapping. Captions are now off by default (players can't read yet), and the map Sensei is voice-only.
- 🔨 Browser chrome gets in the way.
- ✅ Kids drag instead of tapping. Buttons now act on finger-down, and page drag, pinch-zoom and long-press are blocked.
- ✅ Tap targets near the top and bottom screen edges trigger iPhone system gestures. The game now fits inside a safe box away from the edges on touch screens.

## Round 4
- ✅ When the game is minimised, iPhone shows a media player. All sound now pauses when hidden, and the silent-audio trick was removed.
- ✅ One big, consistent help button on every screen that says what to do. Pressing it repeatedly gives more and more hints.
- ✅ A tutorial that teaches how the UI works (tapping, the help button, tiles, replay) and checks the child can use it.
- 🔨 32 petals is wrong; there are 44 sounds. The flower now has all 44 petals and 183 gems. The petal-chart PDF is still needed to match the look exactly.

## Round 5
- ✅ The landing page should show screenshots as well as videos.
- ✅ Introduce different spellings of the same sound early. There are now "same sound, different spelling" sorting levels from world 3 (c/k, l/ll, s/ss) and world 5 (c/k/ck, ch/tch), and Sensei points out each new spelling of a sound the child already knows.
- ✅ A Word Book: a scrapbook that collects the words a child has learned, with pictures.

## Round 6 (petal chart PDFs, villain, website sound)
- ✅ Model the petals on the school's laminated Extended Code sheet (two A4 pages of teardrop petals, each with an outline colour, a little picture, and its spellings stacked inside), with a glow-up. Source: Yr1/Yr2 parents' presentation, p23.
- ✅ Make it clear which character is speaking (animated portrait, name).
- ✅ Baron Muddle must look obviously evil and his arrivals must feel menacing. He was mistaken for the dojo master.
- ✅ The website and its videos should have sound from the start, even before playing.

## Round 7
- ✅ Title-screen ninjas overlapped.
- ✅ A "Get ready" page before playing: install / full screen on Android, Share → Add to Home Screen on iPhone.
- ✅ "Tap…" ran into the target word ("tap sat"). Prompts are now said once, with a pause, and then just the word.
- ✅ Starting-level game rebuilt from the school's own questions: which spelling makes this sound, minimal pairs (cat/cot/cap), spell a word, "which spelling of /ae/ is in rain?", and "tap every word with this sound".
- ✅ Player profiles: "Who's playing?", type a name with the real keyboard, each player's progress stored locally.
- 🔨 "Purple screen and music when pressing Play" on Jonas's iPhone. Can't reproduce in Chrome or WebKit. Added a crash screen showing the error with Try again / Choose player.
- ❓ "Remove the sort of copy. It's just…" (message cut off). Ask what to remove.

## Round 8
- ✅ "This is how we write the sound" had a stray /s/ at the end (TTS artefact). Re-recorded, and every line was audited with a blind transcription.
- ✅ The intro was confusing: no petals scattering, and the villain wasn't interacting with anyone. It is now a 7-shot storyboarded film (docs/INTRO_STORYBOARD.md): Sensei vs Baron, petals landing across the lands, confused villagers.
- ✅ Fat white borders around characters were removed from all sprites.
- ✅ The landing page must look like high-end children's art. Redesigned as an illustrated picture book with new key art.

## Round 9
- ✅ Hosted at https://superninja.templestein.com (Worker custom domain on the Jonas personal account).
- ✅ Share tags: og:video and a Twitter player card, the /watch/ player page, and film links at the bottom of the landing page.
- 🔨 A competing marketing trailer, built as a config-driven pipeline, after researching the best video and sound models (sub-agent).
- ✅ Remove all "free" wording.
- ✅ Age guidance is now 3–8.
- ✅ Baron appeared twice (cut-in portrait over his own video). The cut-in is now suppressed whenever he's on screen.
- ✅ A bearded Sensei with a female voice made no sense. Sensei Maple is now a grandmotherly female red panda (silver bun, spectacles, green robe): sprites, help-button face and mouth shapes, intro shots, landing art.

## Round 10 (lipsync, beginner progression, jump ahead, exposition)
- ✅ Real-time lipsync: 7 mouth shapes per character, driven by a frequency analyser on the speech bus (src/engine/lipsync.ts). Used on the help button, the villain cut-in and the intro.
- ✅ The Sensei in the corner didn't show when she was talking, and her face was off-centre. Face crops are now automatic, with a gold glow and sound waves while she talks.
- ✅ The jump from s, a, t to spelling three-sound words was far too fast. Bamboo Village is rebuilt sound-first (docs/PEDAGOGY.md):
  - listening, then first sound, then how that sound is written, then two-sound words, then three-sound words
  - I do / we do / you do, with stretched modelling ("mmmaaat")
  - errorless correction
  - "Who read it right?" reading checks, and middle-sound hunts
- ✅ Words 3–4 year olds don't know were replaced ("dojo" is explained first; "gem battle" replaces "trial"), and there's more exposition about words being made of sounds.
- ✅ The Sound Flower and the Word Book are introduced step by step with animations the first time.
- ✅ Jump ahead: the grown-ups area and the reward screen offer "end of Reception / Year 1 / Year 2" start points. The progression is built from units, so any start point works.
- ✅ Intro pacing and AV sync: every shot is re-cut so its key action lands on its narration word (Whisper-timed), and the in-game film reads public/a/v/intro_timing.json. The pandas are redrawn in the game's art style.
- ✅ "Hear the word" card for words without a picture is now one big bouncing listen button.
- ✅ The hint glow was too faint to notice; it's now a steady gold ring that bobs.
- ✅ A rest nudge ("Ninjas need rest too") for little ones after about 12 minutes.

## Round 11 (feedback treadmill)
- ✅ "How can you get a super tight feedback loop… put bots on a treadmill that produces feedback so humans don't have to." Built `scripts/treadmill/` (docs/TREADMILL.md):
  - fast-forward mode (`?fast=N`)
  - Playwright bots with invariant checks and a random-tapping monkey on every level
  - a Gemini visual critic over filmstrips (built by Codex)
  - Jev (TypeSafe's decision model, via Cloudflare AI Gateway) for linting and triage
  - Codex persona playtesters (a 3¾-year-old, an impatient 6-year-old, a Sounds~Write teacher, a parent)
  - one de-duplicated inbox, `playtest/INBOX.md`
- ✅ Use Codex (gpt-6-sol, extra-high reasoning) for well-specified tasks.
- ✅ Explore what Jev can do (docs/JEV.md). It's an excellent, stable judge of Sounds~Write wording rules and word familiarity at pennies per run. It's weak at picture naming from text, and no good as an adaptive tutor. "Use Jev in the development process, not in the product": it only runs in the treadmill.
- ✅ Fixes from the first treadmill and persona runs:
  - A Gem Trial with no words (after m and s only) stranded children. Trials now wait until three words exist.
  - Jump-ahead was lost on reload (debounced save). The reward-screen jump now needs a grown-up press-and-hold.
  - Errorless correction in battles, bosses and Swap: the first miss hears the word stretched again, the second shows "That's /s/. We need /m/."
  - The first-sound demo shows the spelling for picture-only words too, and says "This is an apple", not "a apple".
  - Captions in the early games; Kai and Suki light up when they read.
  - Decodable text in story s1; "which/witch" is no longer dictated without a picture; words with two /k/ spellings are left out of sorts; the sort highlight is now a hint rather than a giveaway.
  - Child-proofing: a child who can't type can play as "Ninja 2"; the hero choice can be changed; too-early taps wiggle; taps during the question count as answers.
  - Parents: Play fits on the first screen of a landscape phone; readable grown-ups page; "press and hold" hint on the gear; "Skip film"; clearer delete warning; profile badges.
  - Layout: a listen card for words with no picture; captions above the help button; battle slots clear of monsters; 44 px tap targets; stickers in a row; beginner runs have two lanterns; the progress bar moves item by item.
  - Pictures: a blind picture audit feeds pic-names.ts, so picture games avoid pictures children name differently (fin → "shark", wig → "hair", hot → "soup").

## Round 12 (World Flower, Sounds~Write model, full programme)
- ✅ "Why is there this pink tree?" The story is rebuilt around the **World Flower**: a many-coloured flower of sound petals at the heart of the island, which all life depends on. Baron blows it apart; islanders cower; Sensei faces him. The intro is re-directed with Gemini Omni, with several flower design iterations (sub-agent).
- 🔨 "Make our data model for challenges, evaluation and exercise generators align super closely with Sounds~Write." A typed Sounds~Write spec (concepts, skills, Initial Code, Bridging, 49 Extended Code units, Polysyllabic, lessons and error corrections) is being written from the official scope and sequence (sub-agent). The game will then be re-keyed onto it.
- 🔨 "Go all the way up to however far Sounds~Write goes": a content build-out plan for all Extended Code units and polysyllabic words. (Integration, 26 Sep: the game now follows the official order as far as its content goes: sorting starts in the Bridging Unit, and the Sky Temple runs EC1, EC2, EC4, then EC11. EC3 and the units between need words and pictures.)
- ✅ "Make the petal chart a scroll that is scrollable. Kids understand touch scrolling." One long ninja scroll you swipe through, with big petals; taps open a petal only if the finger didn't move (World Flower agent).
- ✅ "Make it a bit mysterious": sounds and spellings not yet met are hidden in mist; met-but-unwon spellings are unpolished; won gems shine. An overall progress vine along the scroll, and petals fill as their gems are won (World Flower agent).
- ✅ "Swelling epic victory music when you master a new gem": `public/a/m/gem_victory.mp3`, a 10 s sting that builds, bursts into brass and flute, and rings out. Made with `scripts/gen-sting.ts` (ElevenLabs Music via Cloudflare, 5 takes). Each take was judged 3 times with no voices allowed, plus a loudness-shape check.
- ✅ Next, once the ninja rework and the World Flower scroll land (World Flower 2.0, wired in by the integration):
  - ✅ an epic "gem mastered" sequence: winning a Gem Trial opens the World Flower, where the gem spins up, dives into its petal on the burst of the victory music, and the petal blooms
  - ✅ tapping a sound shows the words met with it (tap to hear), plus a green "Practise" gate that opens a short dojo for that spelling, then back to the flower as the gem fills
  - ✅ bring children to the flower often: after a level that first teaches spellings, and at the start of each new land (once each), in Sounds~Write teacher language with example words
- ⏳ "When you think you are done, do another few rounds of production values, motion design, polish. Kids should feel in their bones how amazing this game is. It's like dancing with phonics in an imaginary land of wonder." This becomes the closing phase after the current work: several critique → polish → verify rounds covering every screen, transition and tap, until independent reviewers find nothing that feels like a prototype.
- ✅ Left-to-right warm-up, built as warm-ups W2, W4 and W6 (reading pictures left to right, three in a row, picture words, sound dots). Not done: using it as a readiness check in the placement game. (Jonas: "games that help kids understand left to right order. Mentava … makes users 'read' images in order: a fish followed by a dog becomes 'fish dog', the other way round 'dog fish'. Then kids don't need to learn letter shapes and direction at the same time."). Mentava uses 🐶🐟 vs 🐟🐶 in its readiness check ("understanding that order matters"). Our version is a pre-letter warm-up world:
  1. **Read the pictures:** two pictures on a reading line. The ninja sweeps left to right ("Ninjas read this way!"), then the child taps them in order: fish… dog, "fish dog!". A tap on the right-hand picture first makes the arrow pulse from the left (a gentle, errorless correction).
  2. **Which did I read?:** [fish][dog] or [dog][fish]. Sensei says "dog fish", and the child picks the matching order.
  3. **Picture words:** compound words, blended orally as the first taste of blending: sun+flower, foot+ball, rain+bow, cup+cake, star+fish, pan+cake, snow+man, lady+bird, jelly+fish, butter+fly.
  4. **Three in a row**, and swapping the order ("cat dog fish" / "fish dog cat").
  5. **Bridge to letters:** sound dots under the pictures, read left to right exactly like the sound buttons under letters in Unit 1.
  It's also a quick readiness check in the placement game.
- ✅ Quota watch and auto-wake (Jonas: "keep an eye on token quota and trigger yourself to wake yourself up in herdr after session resets"):
  - `scripts/ops/statusline.py` (project-only status line) shows the 5-hour and 7-day quota and saves it.
  - `scripts/ops/wake-watchdog.py` runs in herdr tab "wake-watchdog" (pane w9V:p3) and watches this session (w9V:p1). When the session stops on a usage limit, it waits for the exact reset time and submits an auto-wake prompt.
- ✅ Loose ends from the World Flower rework (all done except the optional petal tint):
  - replace `Icon.tree` in ui.tsx (still a pink blossom) with Tree.tsx's `FlowerIcon`
  - sweep.ts: rename the tree intent to the World Flower, and skip targets that sit sideways off-screen inside a `.scrollable` container
  - record-clips.ts: show the scroll
  - optionally tint the fx petals in the chart colours

## Round 13 (Jonas playing the preview with his 3-year-old, 26 Sep)
- ✅ Picture cards are sometimes hard to recognise ("too abstract" for a 3-year-old) and sometimes weirdly clipped; every picture sits on a plain white card. Now: coloured plates chosen per picture, never clipped (a sweep invariant checks every card), no see-through dimming, living things always drawn with a face, and a 3-year-old picture audit.
- ✅ Intro film: Baron Muddle must lip-sync. (Now he speaks on screen in his real voice, with Seedance 2.5 animating from our recording. The destruction is one continuous 7.7 s take: the gloat, the fan sweep on "MINE!", the petal vortex and the laugh. The "overlay" was the talking Sensei help button glowing over the film; it now stays quiet and faded during the film.) When he destroys the flower it should be one real video clip, not one thing overlaid on another.
- ✅ When Sensei names the pictures ("This is a mat… this is a hat"), highlight the card being named. (A warm spotlight on each card while its name plays.)
- ✅ "Tap the mat" is three separate recordings spliced together; it must sound smooth (record whole sentences). Every picture in the warm-ups and the first-sound games is named and asked for in one whole sentence; only pure sounds and slow words are joined, and a new treadmill stage (`joins.ts`) asks an audio judge "one take, or joined?". Dictation ("Build the word… mat") still pauses before the word.
- ✅ Explain that there are fast and slow ways to say a word and how that works; that words are made of sounds; "notice the sound". New games: "tap all the words with /a/ in them", "tap all the words that start with /s/". (Warm-ups W1 and W3: the tortoise and the rabbit, "Words are made of sounds!", "Listen to the very first sound", tap-all games.)
- ✅ The first game was far too long for a 3-year-old: the same thing over and over, boring. (Lesson 1 is now about 90 s, Lesson 2 about 65 s, with a time governor and a hard cap.)
- ✅ Let children opt into a level on their own within about 30 seconds (a spoken school-year question with picture buttons; settles in 10–22 s; a first check moves a child back a band if it was too hard): "Are you in school yet? Which class: not yet / Reception / Year 1 / Year 2?", then set the game up accordingly and say that grown-ups can change it later in the grown-ups settings.
- ✅ The second game repeating the first is fine only if it's fast and has a really good reward (Reward 1: the pictures turn into stickers in the new Sticker Book; Reward 2: a shiny fish-dog and the first petal): a celebration after the first game, where the word cards just seen (pictures, not spellings) go into the sticker book, celebrated and introduced; then another short lesson.
- 🔨 Architecture (Jonas): logic modules separate from graphics and gameplay, each tested on its own.
  - An event log of exposures and observations (e.g. "3 s staring, 2 hints, wrong answer on this word, sound or spelling") feeds a learner model.
  - A separate exercise planner, with spaced repetition.
  - A narrative director that makes sure every interaction makes sense and challenge is right.
  - The game playable as a text adventure (Jev or bots can play it), producing transcripts of everything said and done.
  - Transcripts are audited: what's never explained, what's said once but needs three times.
  - Status:
    - `scripts/treadmill/transcript.ts` already turns bot play of today's game into text-adventure transcripts (perfect and learner personas).
    - The core architecture design workflow is running (it writes docs/ARCHITECTURE.md and src/core/types.ts).
    - Codex then builds the core with unit tests, the UI moves over to it, and the transcript audit loop runs.
- ✅ "Never ask me questions using your dumb question tool again. Never block … add big questions or decisions to a log": docs/DECISIONS.md (decisions made on Jonas's behalf, plus open questions), and saved as a standing rule.
- ✅ "Have the same let me show you, now you try mechanism in the warm ups": every warm-up game type opens with "Let me show you!" (the paw taps, the ninja moves), then "Now you try!".
- ⏳ Jonas: "make sure the home button is on any screen including tutorial. and it needs to not be possible to 'miss' something. should probs be back buttons or repeat etc in". Next workflow, after the integration lands:
  - (1) an inventory of every screen and moment: Home present? a way back? can every instruction, explanation, demo and celebration be heard again or replayed?
  - (2) one consistent pattern everywhere: Home top-left, "hear it again" beside every instruction, back and replay wherever something happens once (tutorial steps, story pages, intros, explanations, show/try demos)
  - (3) sweep.ts invariants ("home-missing", "no-replay-for-instruction") on every screen, so it can't regress
- ⏳ Jonas: "and in general best not to autoplay to next step of a presentation etc" (part of the same navigation workflow). Presentations never advance by themselves:
  - Tutorial steps, intros (World Flower, Word Book, dojo), explanations, reward and celebration sequences, story pages and the opt-in wait for the child's tap on a big pulsing Next.
  - An idle nudge (Next glows, then Sensei says "Tap the arrow when you're ready"); back and replay are always available.
  - The sweep gets an invariant that flags any scene step changing with no child input except in activities, the film and animations.
  - Also remove the first-minutes opt-in's "auto-pick after 20 s".
- ⏳ Jonas: "even the intro sequence should have buttons to go to next clip". The film also waits: each shot plays its clip and line, holds the last frame, and a big pulsing Next arrow (with back and replay) moves on. The website film is unchanged.
- 🔨 Jonas: "The phonics sounds are often wrong. Saying 'kay' instead of k (just the sound) and 'bee' instead of just the sound b etc. I think it's endemic." Confirmed objectively: /k/ has 280 ms of voicing (it should be about 0) and /b/ 310 ms (it should be ≤ 80). The Gemini blind listening we relied on was unreliable. Codex job: an objective phoneme QA (voicing, formants, loudness steps, Whisper), a rebuild of every failing sound from real word recordings (burst cuts for stops, stretched initial segments for continuants, vowel nuclei), a listening page for Jonas, and a scan of all lines for letters the TTS would read as names.
- ⏳ Jonas: "each petal has an image in the corner to illustrate the sound, because spelling sounds with letters can be confusing. I want that in the game." A sound is shown to children as its petal (chart colour plus picture) wherever it's introduced or referred to, and the petal pictures sit in the corner on the scroll like the school chart. It's part of the navigation workflow (SoundBadge).

## Round 14 (Jonas, 26 Sep evening: performance, transcript, petals, and playtesting the preschool levels with his 3- and 4-year-old)

- ✅ "there are huge performance issues … after I play for a while, my phone melts". Diagnosed in docs/PERF.md: it isn't a particle leak. Two rAF loops never stop, the ninja's endless animations run even when hidden, and decoded audio and music elements only grow. Fixed and live on 27 Sep (production `10052f02`; docs/PERF.md "Fixed (27 Sep)"). On a phone-speed CPU (Chrome, CPU 4× slower), with the look unchanged:
  - the still map: 7.5 % → 1.3 % of the main thread, and 120 → 0 frame requests a second;
  - the ninja standing still: 13–18 % → 3–5 %;
  - the runner: 35 → 58 fps;
  - the World Flower: 52 % → 30 %, longest task 87 → 62 ms, and the petal chart 47 % → 18 %;
  - decoded audio levels off at 40 MB (it was 64 MB after 12 levels and climbing);
  - Web Audio nodes stay at 11 (they grew 9 → 63 over 12 levels);
  - the title screen holds 0.1 MB of audio instead of 61 MB.
- 🔨 "if you just look at the transcript … It just says, A, two letters, one sound, A, two letters, one sound". Confirmed: said 34 times in 25 minutes. Fixes: docs/SCRIPT_STYLE.md and SCRIPT_FIXES.md (lane F2 and the scene lanes).
  - Fixed in the build but not live yet (28 Sep, 01:00). Every SCRIPT_FIXES check passes in the verifier's eight runs (playtest/runs/fix/V-script3/audit8-check.txt): no letters echoes, no sentence twice in 60 s, 7–10 letters lines a session and 0.6 praise lines a minute.
  - Left: the ship, which waits for the Erinome re-record (see the teacher-voice item below).
- 🔨 "when showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games with the image at the top of the petal or next to it". Audit and spec: docs/SOUND_DISPLAY.md (lane F3 and the scene lanes).
  - Built but not live yet (28 Sep, 01:00). The verifier's sound check (playtest/runs/fix/V-frames3/sound/check.md) found:
    - all 612 sounds that need a petal start with their petal on screen;
    - none of the 1,405 sounds is left without a job;
    - the tortoise and the rabbit light up on every slow and fast word.
  - Left:
    - the ship;
    - in w5-9 and w6-5, /n/'s petal sits half under Sensei's speech bubble (the sweep's only major finding);
    - 32 of 911 clips show a petal picture under 38 px (the smallest is 22 px);
    - F3's follow-ups: join-in petals the paw can find, < x > as a single /k/+/s/ button, and the rabbit staying lit after the fast word.
- 🔨 Playtest of the preschool levels with the 3- and 4-year-old: "this extremely abbreviated way of talking, it doesn't help at all … teachers … do way better explanations … 'So first, I'm going to show you how to do it. Are you ready? And this is how this game goes. I will show you this, and you will do that. Do you want to give it a go now?' … Or this weird shouted 'Listen!' … super weird in the first dojo level where it just starts with this, and this ear appears. Teachers explain what they're doing." So Sensei talks like a real Reception teacher:
  - frame each game ("This game is called… here's how it goes: I'll…, then you'll…")
  - narrate the demonstration ("Watch me first…")
  - check readiness ("Are you ready? Do you want to have a go?"), with a tap answer
  - explain what's happening and why, and never bark bare commands like "Listen!"
  The full framing comes the first time a game is met, then a short "Remember this one?" on later plays. The teacher-voice design workflow writes docs/TEACHER_SCRIPT.md, and the fix plan implements it.
  - Built but not live yet. The verifier's third round (playtest/runs/fix/V-script3) read W1, the tortoise and the rabbit, Word Building and the start of w2-1 against TEACHER_SCRIPT §0.2, and they match it:
    - a frame, then a narrated demo, then "Are you ready?" on ▶, then the hand-over;
    - no bare "Listen!", no ear icon and no shouted instructions.
  - Not shipped (28 Sep, 01:00), because of what's left:
    - Sensei's voice is still mixed. 759 clips (197 lines and 562 words) are still the old Sulafat voice, including the dojo welcome and w2-1's lesson, so `check-voice.ts` refuses the ship. The re-record resumes when Gemini's TTS quota resets (08:00 BST; a session cron fires at 08:12).
    - w2-1, the first Dojo lesson, teaches its last sound (/h/) in silence. The 60-second repeat rule drops the Learn's own lines. The same happens to /th/ and /dh/ in w5-1, and to /w/, /v/ and /ch/ in w5-3 and w5-6 (D1).
    - The rewards are monologues. After a level, Sensei talks for 16–37 s before the child can tap, and the talk-reward check fails in all 8 runs (B1).
    - In the "I'll go first" demos, Sensei says "Here it is. Tap it when you're ready." halfway through her own demo, 6–7 times a run (C1).
    - The spliced chains that SCRIPT_STYLE §7 forbids are back in w5-1 and w5-6 (the /th/–/dh/ one and a /u/–/w/ one).
    - Smaller items:
      - some fallback lines were never queued for recording;
      - Sound Swap drops "Now let's change it to…";
      - the first session takes 6:24–7:33 to reach the map, against a cap of 5:30;
      - the preschool corrections are unchecked, because the learner bot never taps a wrong picture.

## Round 15 (Jonas, 27 Sep)

- 🔨 "The 'd' sound sounds like 'duh' now; the previous version was better." The original /d/ is back in public/a/p/d.mp3 (the rebuilt one is in .trash/phonemes-2026-09-27/). recipes.json marks it kept-original, and it goes live with the next ship. Lesson: the acoustic gate isn't the judge of a pure sound; Jonas's ear is.
- 🔨 Found while fixing /d/: the service worker cached every /a/ file forever (cache-first, "they never change at a given URL"), so phones never got re-recorded sounds or redrawn pictures. Now the asset cache is versioned by a hash of public/a (src/pwa/sw.template.js, vite.config.ts `swVersion`), and old caches are dropped when anything changes.
- 🔨 "The purple monster faces the wrong way still." Four monsters faced away from the ninja: Gloop (the purple one), the bamboo bandit, the frog (kappa) and the sumo panda. worlds.ts MONSTER_INFO is corrected, checked by eye and by five-vote vision checks of pupils, nose and leading hand (playtest/runs/facing2.ts). Goes live with the next ship.
- 🔨 "The scroll is ugly as fuck and barely usable. Review that and make it more similar to what the kids are used to from the image I shared." That's the school's Extended Code chart (Yr1/Yr2 parents' presentation, p23): a white sheet, outlined downward petals, spellings stacked inside, a corner picture. Design workflow: an audit, three mockup directions, judges, then docs/SCROLL_DESIGN.md. Implementation follows in the fix workflow's World Flower lane.
  - Built but not live yet (28 Sep, 01:00). SCROLL_DESIGN v2 (B2) now looks like the school chart: a white sheet with outlined downward petals, the spellings stacked inside and a picture in each corner, swiped up and down a page at a time.
  - All 11 World Flower cases pass the verifier's sweep, including tree-practise-tap (the practice dojo that froze in the 17:32 treadmill run).
  - Left:
    - the ship;
    - seven new v2 lines waiting for the TTS quota (`help_flower_fill`, `petal_outline`, `petal_caught_up`, `gem_won_shine`, `gem_sparkle`, `gem_dusty`, `card_also_first`). Until they're recorded, Tree.tsx uses existing lines.
- ⏳ "Make me some normal clips of each of the games / level types. Maybe 3 of each so I can decide which to use." Plus "one that shows a supercut of all the enemies." These are recorded from production once the monster-facing fix is live, then go on an R2 page like the tweet kit.
- ⏳ Jonas: "you gotta read the 'slow way to say a word' with actual little gaps between the sounds. It is too smooth now." The slow words become the pure sounds one by one with short gaps (/c/ · /a/ · /t/), built from the QA'd pure sounds rather than a stretched ("elastic") TTS word. This replaces public/a/x/ and adds per-sound timings so cards and sound buttons can light up on each sound.
- 🔨 Jonas: "you need to explain more often that there are slow and fast ways to read words etc." Fast and slow gets its own script addendum (TEACHER_SCRIPT §9), with varied lines and a dosage of at least once per session in every game that says a word slowly. The tortoise and rabbit are the visual cue every time.
  - Built but not live yet (28 Sep, 01:00). TEACHER_SCRIPT §9 is in the game. In the verifier's runs (playtest/runs/fix/V-script3):
    - every game that says a word slowly explains fast and slow once a session (11 of 11 games);
    - no idea line is repeated;
    - the first read-back of each game leads slow, then fast;
    - the tortoise and the rabbit light up on every slow and fast word.
  - Left:
    - the ship;
    - a run of talk with a fast/slow line still goes over 12 s about once a run (fs-talk: 16.1 s from w1-4 into its reward, the same monologue as the teacher-voice item).
- ⏳ Jonas: "find an effective way to templatize the recordings and thus create more natural speech. So instead of saying 'say this sound: a' you can say 'say the sound a'. Or instead of 'say this word slowly: mat', you would say 'say mat slowly'. This needs to work super well and you need to research prior art and then work out how you can apply it everywhere in the game." Workflow: prior art, an inventory of every splice, experiments (whole-sentence renders, prosody-matched splicing, neural speech editing), then the design (docs/SPEECH_TEMPLATES.md), the new-files-only infrastructure and a listening pilot. Migrating every scene follows once the teacher-voice fix has landed.
- ⏳ Jonas: "give me a way to open a cheat menu to jump to different sections etc. … it's okay for people to find. Should have lots of ways to shortcut jump to places or modify mastery model." Cheat menu: tap the top-right corner 5 times, press the backquote key, or add ?cheat=1. Tabs: Jump (every level, scene and teacher-voice form), Mastery (presets, a grid of the 44 sounds, gem states), Time and voice (sessions, days away, intro state), Play (speed, streak, hero), Save (export, import, profiles). Built in new files mounted from main.tsx; documented in docs/CHEATS.md.
- ⏳ Jonas: "on my phone the play button is cropped by the fold on the homepage". The fold is fixed for real phone viewports (Safari and Chrome chrome included).
- ⏳ Jonas: "the website still features video clips that say 'bee' instead of 'b' and the ninja run segment is an image not a video". The landing clips are re-recorded from production with the fixed sounds, the run clip is fixed, and the trailer is audited (and rebuilt if it has letter names). It ships landing-only from the production commit, so the half-edited game isn't shipped.
- ⏳ Jonas: "the layout of the game start screen looks lame and boring and worse than the marketing site and the play button looks weird and little and out of place floating randomly." A title-screen design workflow (audit, three mockups, judges, docs/TITLE_DESIGN.md), then the fix workflow's App lane (B1) builds it.
- ⏳ Jonas: "are you sure the narrator and sensei have a proper british accent? … make me a mini app in r2 to pick between different voice settings and presets". An accent audit (a judge plus acoustic checks for a rhotic r, T-flapping and the BATH vowel), candidates from Gemini, OpenAI, ElevenLabs and Workers AI rendered with accent-revealing test lines, and a picker app on R2 whose picks save to a tiny Worker so Claude can read them.
- ⏳ Jonas: on the map "the kids can still never find the right button to press and their avatar weirdly overlays half of the button". Also: when going back to a previous lesson by accident, Sensei should ask if that's what we want, via "a simple reusable mechanic that lets us 'confirm' an action". The map redesign and the confirm component are built now; the wiring comes after the fix workflow.
- 🔨 Jonas on the scroll design: "looks good but a bit busy. Not clear what the green play button does … needs a bit of a glow up. But right direction." Also, the progress model: "Each petal on the flower starts missing, then comes back as a faint outline when you have encountered the sound and then you need to 'fill it up' to complete it … it should be possible to look visually at the flower easily to see progress. And in each spelling gem in a sound we also need to have a measure of progress towards mastery. In fact some spellings can even make multiple sounds. Like ea. That should also be something that is explicitly discussed and has a game." v1 is archived in docs/scroll-design/v1/ and B2 waits for v2 (docs/SCROLL_DESIGN.md). The progress model goes in src/content/progress.ts, and the multi-sound spellings get docs/MULTI_SOUND.md plus a new game, built in the follow-up.
  - Built but not live yet (28 Sep, 01:00): SCROLL_DESIGN v2 (B2), with the progress model in src/content/progress.ts.
    - A petal starts missing, comes back as a faint dotted outline once the sound is met, then fills in colour as it is learnt.
    - There is no number in the heart.
    - Every spelling gem has a readable meter.
    - The unclear green ▶ is gone. Each control shows what it does, and Sensei names it the first time: the dojo gate, and the gem guardian.
  - Left:
    - the ship;
    - the multi-sound spellings (< ea > and friends) and their game (docs/MULTI_SOUND.md; QUEUE item 5);
    - Sound Detective's magnifying glass (QUEUE item 6; not built yet).
- 🔨 Jonas: "The h sound for H sounds like there's some sort of duck quacking in the background or something. It sounds terrible." Cause (likely): the 26 Sep rebuild cut /h/ from "hat" and TIME-STRETCHED it, and stretching breath noise makes tonal, phasey artefacts. A workflow is measuring every stretched pure sound for the same artefact (/h/, /i/, /r/, /w/, /oo/, /air/, schwa), rebuilding the bad ones without stretching (natural cuts or noise-grain extension), rebuilding the slow words, and putting before/after on the listening page. Lesson: never phase-vocoder-stretch an unvoiced sound.
- ⏳ Jonas on demos: "when the sensei shows us something, the pacing is still not right. Lots of stuff suddenly happens. It says, look, it's just one quick word, and then it activates something, but it looks actually like the character does it, like the character is shooting. The sensei should be shooting at the word … it should say more carefully and slowly … So let's assume I say, find the sausage. Then you would have to tap on the sausage. Let me show you. I'm gonna tap on the sausage now. Look!" So every "I do" demo is slow and explicit: (1) the rule said as a hypothetical ("Let's say I say 'Find the sausage'. Then you'd tap the sausage."), (2) "Let me show you.", (3) the action announced before it happens ("I'm going to tap the sausage now… Look!"), (4) SENSEI does it (her paw or magic travels visibly from her corner to the target, slowly), and the child's ninja only watches, (5) the effect, then a beat. The ninja only strikes on the child's own actions. The shared helper and lines are built now (docs/DEMO_CHOREOGRAPHY.md, src/ui/SenseiDemo.tsx); every game's demo is rewired in the follow-up after the big fix.
- 🔨 Jonas: "And the S and the R sounds sound super robotic somehow." Folded into the pure-sound fix (pure-sounds-h-s-r) as must-fix alongside /h/. /r/ was stretched on 26 Sep; /s/ is the older generated clip, and its processing is being traced. Candidates: natural unprocessed cuts, noise-grain extension for /s/ and /h/, WORLD resynthesis with natural micro-variation for /r/; judged blind against the old clips. Option for Jonas: a British adult recording the 44 sounds on a phone (about 10 minutes) would beat any TTS cut; the pipeline could clean and level them.
- ⏳ Jonas (the start of the message was cut off): "…rather than from right to left. And as they go under a sound or a word, it says that word … you drag it from left to right … the task could be to say fish dog, though you should really use different emojis or different images. And then you have to go from left to right. If you go from right to left, it says, no, that's not the right way. You always go from left to right. And then we can have this sort of interface also with sounds where you slide across and the sensei says, say the sounds with me. Mop." A new "reading slider" mechanic: the child drags a finger (a big glowing handle) left to right under pictures, words or sound buttons; each item is spoken as the finger reaches it; a right-to-left drag gets a gentle correction; for sounds, "Say the sounds with me" (/m/ /o/ /p/), then the fast way ("mop!"). Built standalone now (src/ui/ReadSlider.tsx, docs/READ_SLIDER.md) and wired into the picture-reading warm-ups, blending, read-backs and stories in the follow-up.
- 🔨 Jonas: "the erinome voice is clearly the winner - use that". Sensei and the narrator are now Gemini Erinome (the pipeline switched at 09:33). revoice-erinome re-records every Sensei line (about 1,280), word (1,238), story page (65), onset and the film narration, rebuilds the 46 pure sounds (with the lessons from /d/, /o/, /u/, /h/, /s/ and /r/) and the slow words, with an accent gate, and makes a listening page.
- ⏳ Jonas: "in your marketing materials … videos … playtesting, you need to be way more focused on … year 1 and year 2 … are these games really good to learn how to spell magician and optician and division and multiplication and all the shuns … do a massive deep dive … prove it with the marketing materials updated … how the boss battles work. Is the panda just like the boss of lame sounds? … the middle and end game isn't really well thought through." Deep dive workflow: Sounds~Write Y1–Y2 (Extended Code, the polysyllabic routine, the /sh/ spellings < ti ci si ssi > with schwa), an audit of today's later levels (long words on a phone, bosses, challenge), prior art for 5–7s; then docs/MIDGAME_ENDGAME.md (progression, bosses with a story reason and rising tests, new mechanics: Syllable Slice, Spelling Choice, Long-word Build, Sound Detective, dictation, Proofread the Baron), judged three ways; build, marketing and playtest plans in docs/midgame/. Marketing claims only what's built.
- ⏳ Jonas on progression: "there should be maps that, broadly speaking, are preschool, reception, year one, and year two, but we don't call them that. Those are the overworld maps. And then there's game types, and some game types just only appear on some maps … if you say, I'm already in school, basically we say, okay, we'll walk you through and say, we assume that you know these things, but … no worries if not. You can go back to this like previous map and … collect them. It needs to be, like, really obvious how to … do catch-up learning." This is folded into the midgame deep dive's design and plans (the design step was edited before it ran).
- ⏳ Jonas, "for later": the weekly school word list (words with different spellings of the week's sound, plus 1–3 special or tricky words for sight reading); a game for the special words; "a deep link system where you can just have query params or something that encode the word list and then get a special sort of challenge levels to master that word list with like five minutes of practice a day". It's a slice in docs/midgame/BUILD_PLAN.md; build it after the Year 1–2 first slice.
- ⏳ Jonas: "how we have a video of a battle with Baron Muddle, with the final super boss, with like super simple words in it. That should be the final, final battle with really hard words always." Cause: today's game ends at the start of Year 1, so the Baron is the last land's (Sky Temple, w6-11) boss with unit-12 words. Fix: the Baron is fought ONLY ONCE, in the final battle at Muddle Castle (end of Year 2) with the hardest words; he appears only in cut-ins before that. w6-11 becomes the Sky Magpie; the design, the interim swap spec, the Magpie art and the new lines are being prepared now (baron-final-only), and the swap is the FIRST item after the big fix.
