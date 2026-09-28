# Work queue (orchestrator's running list, 27 Sep)

What's running, and what must happen after it, so nothing Jonas asked for gets lost between workflows.

## Running
- **Budget**: Claude weekly usage is at 90% (resets Thu 1 Oct 10:00 BST). Spend it on finishing and shipping the big fix plus the voice; the heavier follow-up (the Year 1–2 build and the like) waits for the reset unless Jonas switches accounts.
- **midgame-endgame-deep-dive**: DONE. docs/MIDGAME_ENDGAME.md (rev 2) and docs/midgame/{BUILD_PLAN,MARKETING_PLAN,PLAYTEST_PLAN}.md. Maps: Sensei's Garden, the Island of Sounds, the Sky Isles (Y1), the Muddle Isles (Y2), the Library of Long Words.
- **marketing-stage-a**: DONE and live. The website is honest (no overclaims, no < a-e >), with the "From first sounds to multiplication" road and truthful badges; stats.json is corrected to 74 levels and 411 words. The next stages follow docs/midgame/MARKETING_PLAN.md as the slices ship.
- **revoice-erinome**: RESUMED 28 Sep 08:13 (second pass: the 197 lines and 562 words still old; then film, derive, verify and the listening page). tts-retakes-28sep records the rest of docs/tts-retakes.md in parallel. THEN: `bun scripts/ops/check-voice.ts` must pass, then scripts/preview.sh (the big fix is finished and waiting), then send Jonas the Erinome listening page.
- **teacher-voice-petals-scroll** (the big fix): DONE, NOT SHIPPED. Integrated and verified (petals and perf pass; the script is much better). The ship was blocked by the mixed voice and the w2-1 silent sound. pre-ship-fixes (running overnight) fixes the silent sound, the demo contradiction, the reward monologue, pacing and the fast/slow logic. MORNING (the 08:12 cron): revoice second pass + all docs/tts-retakes.md (including the "Pre-ship fixes" lines), one verify, then scripts/preview.sh.
- **fast-and-slow**: slow words with gaps (public/a/x + SLOW_TIMES), fast/slow lines, TS §9, requests for the lanes.
- **speech-templates-research-pilot**: prior art, inventory, experiments, docs/SPEECH_TEMPLATES.md, the infrastructure (new files), and a listening pilot on R2.
- **title-screen-design**: docs/TITLE_DESIGN.md. B1 builds it inside the big fix if the spec is ready (it polls for up to 2 h); otherwise it goes to the follow-up.
- **cheat-menu**: DONE, verified (the jumps, the presets and Jump ahead; 23 tests). It goes live with the next ship.
- **game-clips-and-enemy-supercut**: 3 clips per level type plus the enemy supercut, on R2.
- **landing-fixes**: DONE and live (the fold, the clips, the run clip; the trailer had no pure sounds). Polish later: on the iPhone SE Sensei sits partly behind Play; in landscape Baron's head is cropped and "Watch the story" overlaps the ninjas.
- **voice-picker**: DONE. The app is live and picks save to the Worker; read them with scripts/voice-picker/read-picks.sh.
- **petal-art-match**: every petal picture checked against the school chart; mismatches redrawn (e.g. /uu/ book, /s/ red circle).
- **flower-progress-v2 and its fixes**: DONE. docs/SCROLL_DESIGN.md v2 is released (no number in the heart; readable gem meters), and B2 is building it. scripts/accent-judge.ts is calibrated and documented.
- **map-and-confirm**: DONE. docs/MAP_DESIGN.md with its mockup, and src/ui/Confirm.tsx; wired in by the follow-up.

## After the big fix finishes (the follow-up "shell and speech" workflow)
00. FIRST: BARON FINAL ONLY (Jonas, 27 Sep). The interim swap (docs/fix-requests.md "Baron final only"): w6-11 becomes the Sky Magpie, the Baron's cut-in introduces her, and an "It was a trick!" escape replaces the reformed-Baron finale. (**In-game swap done 28 Sep**, verified on a frozen build: DECISIONS 28 Sep; left: `sfx.squawk` in audio.ts, row 8.) Then re-cut the enemy supercut's last block (it ends on a Baron fight over *coat* and *tea*), the TRAILER (its "THE FINAL SHOWDOWN" beats the Baron over *beg*: that's the site's share video), and the clips page's boss-3, and update the landing's boss copy.
0c. YEAR 1–2 BUILD (docs/midgame/BUILD_PLAN.md): Slice 0 (the content model), 1a (the Syllable Dragon / Word Dragon on the Sky Temple path, plus a "shun" preview), 1b (the Sky Magpie boss as a progress check, rival tiles by lag, the end-of-game loop fixed); then the Sky Temple as units 1–5, the weekly word list, and the maps with catch-up. Plus the PLAYTEST_PLAN Y1/Y2 personas. Marketing moves stage by stage per MARKETING_PLAN (never ahead of what's built).
0b. READ SLIDER (Jonas, 27 Sep; BUILT: src/ui/ReadSlider.tsx, src/content/compounds.ts, 47 lines, a fish-dog inventory; non-voice fixes running (slider-fixes-no-tts); voice retakes in docs/tts-retakes.md for 28 Sep): wire src/ui/ReadSlider.tsx into picture reading (W2 and friends: varied images), blending and read-backs (Early, Dojo, battles), the fast/slow moments, and stories. See docs/READ_SLIDER.md.
0. DEMO CHOREOGRAPHY everywhere (Jonas, 27 Sep; the helper is BUILT and judged: src/ui/SenseiDemo.tsx, with the harness video in docs/demo-choreography/harness/; three lines need retakes when the TTS quota resets: tv_demo_now_tap_sun, tv_demo_now_tap_ant, tv_demo_rule_tapall): every game's "I do" demo uses src/ui/SenseiDemo.tsx: a hypothetical rule, "Let me show you", the action announced, Sensei's paw or magic doing it slowly from her corner while the ninja watches (no ninja strikes in demos), then the effect and a beat. See docs/DEMO_CHOREOGRAPHY.md.
1. The map redesign in App.tsx (docs/MAP_DESIGN.md) and the Confirm wiring at every call site (docs/CONFIRM.md §1, docs/fix-requests.md).
2. The title screen (docs/TITLE_DESIGN.md), if B1 didn't build it.
3. The Grown-ups "Cheats" button (docs/CHEATS.md; the request in fix-requests.md).
4. The templated-speech migration (docs/SPEECH_TEMPLATES.md §6), lane by lane, once the pilot passes.
5. Build the multi-sound spelling game (docs/MULTI_SOUND.md): the scene, content, lines, level placement, App routing, bots and sweep.
6. The radial World Flower's life-cycle look in Intros.tsx (flights home), if B3 didn't do it.
7. The fast/slow and slow-word requests that the scene lanes didn't pick up.
8. Jonas's voice picks, read with scripts/voice-picker/read-picks.sh. If he picks a new Sensei voice: re-record every line and word, rebuild the pure sounds from the new voice, and have him check them by ear. **Either way:** add a calibrated accent gate to gen-audio (the voice-picker audit's A/B judge plus the acoustic checks for a rhotic r, T-flapping and the BATH vowel; playtest/voice-picker/audit.md), then sweep every shipped line, word and story page and retake the American-sounding ones (audit: Sulafat 7/10 as shipped; about 1 in 6 r-words and 1 in 4 BATH words slip).
9. Re-record the landing clips and the tweet and game clips after the voice and speech changes.
10. A full `release.sh` (version bump, landing media), then a backup push (PROMPTS.md refreshed, secret scan).
11. Then the polish rounds (motion design and production values), per the north star.

## Later (Jonas asked to queue)
- WEEKLY WORD LIST: a deep link (?list=…) turns the school's weekly list (a sound's spellings plus 1–3 tricky words) into a 5-minute daily challenge for the week, with a tricky-words game. Designed in docs/midgame/BUILD_PLAN.md.
