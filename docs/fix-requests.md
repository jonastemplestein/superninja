# Cross-lane requests (collected 27 Sep)

Requests that earlier lanes left for files they didn't own. The fix workflow's owners apply the ones for their files; integration applies the rest and ticks them off here.

## Integration status (27 Sep, evening: FIX_PLAN §10 I.4)

The fix workflow's integration step ticked off every request below and in the lanes' final messages. "Done (X)" means lane X did it; "Done at integration" means integration applied it; "Follow-up" means the follow-up workflow (docs/QUEUE.md) owns it; "Left" says why it wasn't done. Findings from the final acceptance are in `playtest/fix/final/` (`script-compare.md`: every script check before and after; `sound-check.md`; `contact.html`) and the integration step's report and `playtest/INBOX.md`.

**The sections below, in order**

| Section | Status |
|---|---|
| voice-foundation, the logic foundation (D1/D2 `revealsNow`, `protect`, anchors, `afterWordSay`, `part: true`; D1 `lettersFor`; D3 `correctionFor`; B3 `foundScript`; B1 `arrivalLines`, `rewardLead`, `gemReadyLead`; C2 `beginLevel`; the FEEDBACK set) | Done (D1, D2, D3, B3, B1, C2, F2). The §5.2 jump-offer row is restated: done at integration |
| voice-foundation, the checks (`holdReady` log; `__snState.game`, paw `navLog`, `busy`; `__snStreak`; `run.ts --script`, `--sounds`; `--petals` default) | Done (F3, every scene lane, F2, F4). `--petals` is the default: done at integration |
| voice-foundation, the lines (word times; `teach-word-times.gen.ts`; `foundScript`'s `_way`; `tp_<p>_hear`'s spelling filter; one-word clips at −19 LUFS) | Done (F2). `fm_snowman_q` checked at integration: its current values match the clip's speech islands. `notions.ts` providers: Left (optional; the game doesn't use those providers yet) |
| voice-foundation, blocking issues (C2's closes; `levelWrap`; D1 `STEMS.write`, taps during a correction; D3's bare "listen"; FIX_PLAN §13.1's `ready: string \| null`; §5.2's jump row; content 6b's snapshot copies) | Done (C2, all lanes, D1, D3). The two FIX_PLAN edits: done at integration. Content 6b: resolved by running the tests in the `./src/…` form (the snapshot copies are other workflows' run output) |
| voice-foundation, checks fixes (`wordsIn` shared; re-run durations; D3 split correction; D1 taps during a correction) | Done (F2: `scripts/lib/words.ts`; D3; D1). `durations.json`: regenerated at integration |
| voice-foundation, lines fixes (`wordCount` export; `tailFalls`; older lead-ins; `tv_learn_frame_ways`) | Done (F4). The rest: Left (the older lead-ins are caught when re-recorded; `tv_learn_frame_ways` highlights no word) |
| perf-first, the soak (`inbox.ts` soak pattern; Dec10; F1's orbits; other lanes' animations) | Done (F4, F1, B2, D2, C1). Dec10 (`soak-fixes.ts`, `--patched`, the `PATCHES` import): done at integration |
| perf-first, the core (B1's preload; blossoms; trails; `wffocus`; scene CSS loops) | Done (B1; every scene lane, and F1 made `"petals"` draw blossoms; C1, D2 trails; B2: `wffocus` is gone in v2). narrate.tsx's `sweepUnder` twinkles rather than trails: Left (minor) |
| perf-first, the screens (`gemwon`; Training's arrow wrapper; SVG pause in frames) | Done (F1, A, F4's `sound-shots --freeze`) |
| perf-first, the frames (`playtest/runs/perf/frames.ts` shift; longhands; F4's opacity rule) | F4's rule: done (F4). `frames.ts`: Left (a scratch script, not the treadmill's) |
| Title screen redesign (B1) | Done (B1). TITLE_DESIGN §9.6's supporting changes (preload and dawn in `play/index.html`, the pose probe at 2.5 s, `playMusic`'s reset) and §9.5's Profiles `naming` prop and shared colours: done at integration |
| Map redesign and confirm | Follow-up (not this workflow), except: the four superseded confirm lines are in `RETIRED_LINES` and NAVIGATION has the confirm's z 87 (done at integration); lane A's confirm-inventory items (Show Sensei only moves forward, Delete player's second step, Profiles' "Ninja N", Jump ahead's confirm and undo) and B3's 2 s Skip film are done (A, B3) |
| Fast and slow | Done (F2 helpers and the praise rule; F2 `instructions.ts`; F3 badges; F4 checks; the slow-word lane; C1, C2, D1, D2, D3, D5, D6). FS1–FS6 logged: done at integration. The three stale `line-tags.ts` hashes: done at integration (34 refreshed in all). The BATH retakes: done (the voice lane) |
| Slow words | Done (C2's `SLOW_TIMES` and comments; C1's pool and comments; D2's `urls.stretch`; B4's comment; F2's `feedback.ts` and `types.ts`). `durations.json`: done at integration. Framing the unframed slow words (stickers, Swap's early chains): Left (F2's decision: §9's five moves cover Jonas's ask) |
| Cheat menu | Done (A's Cheats button; B3's `?shot=N`; B1's music volume, `key` on `<Reward>`, exported `Route`). Profiles' `naming`: done at integration (A had `?naming=1`). `store.ts` `freshSave`: Left (optional; a unit test guards the mirror) |
| FS1: the slow word in help and questions | Done (F2, C1, C2, D1, D2, D3, D5) |
| Speech templates | Scene call sites: done where the audio stays as scripted (A, C1, C2, D1, D2; C1's `s_say_read` and D3's `ww_change` wait for per-piece timings and a slow-pair option). `transcript.ts` (and `continuous.ts`, `first-minutes.ts`) decode template clips, and `package.json`'s `test` runs the speech tests: done at integration. The decisions are logged: done at integration. `audio.ts` template playback, the service worker, `nouns.ts`, the asset gates, `src/core`'s `UttPart` and the pilot: Follow-up (QUEUE 4) |
| Demo choreography | Follow-up (QUEUE 0). The 54 `tv_demo_*` tags appended by that lane are kept (decided at integration: without them content 6b fails) |
| Picture reading v2 and the read slider | Follow-up, in one release (QUEUE 0b), except: the bow's `TWEAK` (done, F1's file), `poses.ts`'s header and HERO.md's Sprites (done at integration), the three stale read-slider hashes and `durations.json` (done at integration), DECISIONS PR1–PR15 and RSL1–RSL13 (done at integration) and TEACHER_SCRIPT §10 (appended at integration with a status line: not in the game yet; §3.7, §3.8, §3.10 and §3.12 are marked superseded by it) |
| B2 note: SCROLL_DESIGN v2 released | Done (B2) |

**The lanes' final messages (27 Sep)**

| From | Request | Status |
|---|---|---|
| A, B1, B3 | The title's "Who's playing?" chip is in the sweep's Home zone | Done at integration: the sweep exempts the title (TITLE_DESIGN §9.7) |
| A | `game: null` means "not a game" in `continuous.ts`, `script-audit`, `transcript.ts` | Done at integration in `continuous.ts` (script-audit reads what it records). The journey transcripts' `master-early` proxy: Left (minor) |
| A | `store.ts`: `jumpUndo?` on `Save` | Left: `JumpUndo` lives in JumpAhead.tsx and the store mustn't import scenes; the local cast works |
| A, D3 | /s/'s petal picture reads as an empty petal | For Jonas (DECISIONS, open questions) |
| A | tag the `rs_*` lines; fix `sensei-demo.test.ts`'s types | Done (the read-slider lane's tags; the test's types are clean now) |
| B1, D6 | Take the soak's after-level sample once Sensei has stopped speaking | Done at integration (it waits up to 15 s) |
| B1 | Early.tsx's join-wait interval outlives the level | Checked: it clears itself within 500 ms once the scene is gone (`!live() && finish()`); the final soak's interval row is the test |
| B1 | `playMusic` reset; the pose probe at 2.5 s; Profiles' `naming` and `NAME_COLOURS`; `play/index.html`'s preload and dawn; NAVIGATION §3.3 and FIRST_MINUTES' 1.05 s exit | Done at integration. Profiles and Setup on `title_key_1600`: Left (optional look change) |
| B2 | Record the seven v2 lines | Queued in docs/tts-retakes.md (the TTS quota is out until 08:00) |
| B2 | `tree-practise-tap` with `gem=ss>s` | Changed at integration to `gem=a>a` (in the bots' save /s/'s < ss > isn't met, so `ss>s` opened no card; /a/'s card offers the dojo). The case still fails: `?scene=tree&gem=…&open=1` opens the card only on the second load after a fresh save, not the first (a finding for B2). The new cases `tree-chart`, `tree-land`, `tree-fork`, the INTENT texts and the soak's §8.5 rows: Left (follow-up checks) |
| B2 | Swipe vertically in `record-clips.ts` and the tweet kit's drivers | Left (the clips workflow's scripts) |
| B2 | B3 `look` (SCROLL_DESIGN §5.6); App `onDetective` | Follow-up (QUEUE 6; Sound Detective isn't built) |
| B2 | Docs: NAVIGATION §2.3 and §4, SOUND_DISPLAY rows 52–53, PERF fix 9, DECISIONS | Done at integration |
| B3 | Tree's `busy` from the shows' held steps | Done at integration (`onStep`) |
| B3 | The bots tap the petal join-in | Done at integration (`bot.ts`) |
| B3 | `tv_to_flower_first` said twice | B1 already counts it once it starts (B3's run predated that); checked in the final C-P transcript |
| B3 | "Watch the film" from the book or the grown-ups page | Follow-up (the confirm inventory) |
| B4 | The reward lists' word times | Done (already updated before integration) |
| B4 | `LINE_WORDS` for `fm_rw2_petal`, `tv_rw_next`, `tv_next_game` | Done at integration |
| B4, C2, D4, F4 | Re-run `gen-durations.ts` | Done at integration (834 stale slow words, 65 new clips) |
| C1 | Record `tv_ido_pair_bus_pan` | Queued in docs/tts-retakes.md |
| C1 | The fast/slow cap clash in First Sounds and Sound Hunt | Done at integration (`FS_IDEA_ONLY` in `narrative.ts`, with a test; the audit reads it) |
| C1, C2, D1 | A `data-nav` prop for join-in SoundBadges; /k/+/s/ as one button; the rabbit going live before its prompt | Left (F3's files; follow-up) |
| C1 | ▶ in the column covers a two-line caption's end | Left (follow-up) |
| C1, B1, D1 | The reward's talk charged to the level's last game in `talk-before-action` / fs-talk | Left (script-audit; follow-up) |
| C1 | "How we spell ≤ 5" can't be met (8 new spellings, each said once) | Noted in the summary: the target was written before the teacher voice |
| C2 | `continuous.ts`: Ready holds from the nav log, taps logged in the page | Left (follow-up checks) |
| C2 | script-audit: `tv_guess_q` and `fm_which_pic` as routines | Done at integration. `readBacks`' 8 s gap and optional shows in `talk-before-action`: Left |
| C2 | sweep: a Ready answered by a board or answer tap isn't auto-advance; the join-in's own label is its answer | Done at integration |
| C2 | Retake `tv_squish_slow` and `tv_squish_fast` shorter | Queued (optional: both retire with picture reading v2) |
| C2 | `fm_snowman_q` = [0.03, 1.38, 2.25] | Checked at integration: kept at [0.03, 1.28, 2.39], which matches the clip's own speech islands (1.29, 2.41) |
| C2 | B1: the super-listener skip line before W6 repeats W6's close | Left: a finding for B1's App.tsx (follow-up) |
| D1 | F2: `lettersForm` repeats within 60 s; the first-miss lead should be position-aware | Left (D1 works around both in Dojo.tsx) |
| D1 | Record `tv_learn_done_two` and `tv_learn_done_three` | Queued in docs/tts-retakes.md |
| D1 | F4: `continuous.ts` hangs about 30 s at Ninja Eyes → Build; fs-badges should skip a tapped tile's voice | Left (follow-up checks) |
| D2 | script-audit: the boss, gem battle and review hand over with the Ready line itself | Done at integration (`unframed-turn` times the hold from its Ready line) |
| D2, D5 | The bot waits for the Ready line before tapping ▶ | Done at integration (300 ms at each new hold) |
| D2 | `tv_demo_now_tap_map` is too fast | Queued in docs/tts-retakes.md |
| D2 | NAVIGATION §5.D: Battle's replay after a Ready hold | Done at integration |
| D2 | The intermittent missing /ch/ petal in w5-11 | Left (not reproduced in two more sweeps) |
| D2, C1 | "Let's say it the slow way first…" is followed by the plain word | For Jonas (DECISIONS, open questions) |
| D3 | `unframed-turn`: Sound Swap's "Ready to watch" before the demo | Done at integration (the hold after the demo is the one checked) |
| D3 | `readBacks`: a tap logged just after its own sound | Left |
| D3 | F2: a split correction should mark the reminder heard | Left (Swap works around it) |
| D3 | `st_*_changes` and `audit_swap_*` are feedback | Done at integration (`instructions.ts`) |
| D3 | `ww_change` needs a slow-pair option | Follow-up (templates) |
| D4 | ▶'s pulse restyles every frame in a Ready hold | Done at integration: the pop moved to `scale`; measured 3.9 % → 0.4 % main thread on the phone profile |
| D4 | The Sorting bot taps a stale answer | Done at integration |
| D4 | `unframed-turn`'s 1 s order tolerance | Done at integration (1.5 s) |
| D4, D1, D5 | Art: /k/'s anchor, /h/'s "?" bubble, a log for the practice jump | For Jonas (DECISIONS, open questions) |
| D5 | The learner never taps a wrong lantern; more run cases in `sound-display` | Left (follow-up checks) |
| D5 | The rabbit badge stays lit after the fast word | Left (F3; follow-up) |
| D6 | script-audit: the book's own text isn't Sensei's instruction | Done at integration |
| D6 | `tv_fs_two_ways` counts as an instruction | Done at integration: the sweep now judges Hear it again by the game's own register (`isRegisterable`), which already treated it as an aside |
| D6 | The map hint cut on w2-7 | Left: the bot tapped the next stone early (a bot artefact) |
| F2 | `gen-teach-word-times.py` should align to the script; the new `tp_` clips on the listening page | Left (optional) |
| F2 | Placement's `?? "streak_3"` | Checked: `powerBeat` only waits for a caption and never says the line, so the fallback is harmless; Sort's is gone (D4) |
| F1 | Early.tsx re-exports `PLAY`/`PLAY_CX` from ui.tsx | Left (Early keeps an identical copy; no behaviour change) |
| P0 | Every treadmill script needs `--help` | Done at integration (`scripts/lib/help.ts`) |


## From voice-foundation: The logic foundation is done and the unit acceptance is green: `bun test ./src/core ./src/content ./src/engine
- **D1 (Dojo) and D2 (Battle):** use `revealsNow(g, need, attempt)` for `reveal`, and add `protect: true` on a split, so a quick right tap can't cut the explanation. Pass `{wrong, slot}` anchors and use `afterWordSay`. Pass `part: true` on letter hits, then `streak.answer()` before `ninja.streakLine()`.
- **D1:** the Learn uses `lettersFor(t, {at})` and records `heard(lettersKey(g))` only when that returned something; the first sound uses `hearIn(p, g)`.
- **D3 (Swap):** the wrong-spelling path should go through `correctionFor`, so "n for ng" gets the two-letter correction.
- **B3 (Intros GemFound):** pass `justTaught`, `used` and `world` to `foundScript`, and `petalTap: true` to `worldScript` once the petal tap is wired.
- **B1 (App):**
  - Map: `arrivalLines({…, preview: mapPreview(level)?.line, has})`.
  - Reward: `rewardLead({…, toReward: toRewardDue(), has})`, recording `heard(TO_REWARD)` and the preview's key.
  - `gemReadyLead()`.
- **C2 (Warm-ups):** `Warmup.tsx` doesn't call `beginLevel`, so the reminder caps and the praise rhythm aren't reset per warm-up; please call it.
- **Owner of `src/content/instructions.ts`:** the FEEDBACK set may want the new correction lines (`tv_fix_*`, `tv_slow_again`, `tv_guess_again`, …).
- **Integration:** the §5.2 row "w6-br1 jump offers: 0" conflicts with Dec9 / SF A8 for a child in session ≥ 3; please restate it as "≤ 1 a session".

## From voice-foundation: Every new `--check` fails on today's build, and names the things Jonas complained about. The default sweep and
- **F3 (`nav.tsx`):** `holdReady` should log `navLog({ kind: "ready", id, how, label })` with how ∈ next | show | board | answer. For hand-over Readies, publish `__snNav.ready = { handover: true, answer }`, or have scenes set `__snState.handover` and `answer`.
- **Scene lanes:**
  - Publish `__snState.game` (the registry's game id).
  - Call `navLog({ kind: "paw", id })` when the demo paw moves.
  - Keep `busy` accurate during demos.
- **F2 (`streak.ts`):** expose whole answers, for example `window.__snStreak = { n, answers, tier }`, so `master-early` can be exact.
- **Integration (`run.ts`, `TREADMILL.md`):**
  - Wire a `--script` stage (the four continuous runs, then `script-audit --check --findings <run>/script.json`).
  - Wire a `--sounds` stage (`sound-display --check --findings <run>/sound.json`).
  - Make `--petals` the sweep default.

**Files changed** (all in `/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/`): `script-audit.ts`, `continuous.ts`, `bot.ts`, `sweep.ts`, `sound-display.ts`, `sound-shots.ts`, `transcript.ts`, `first-minutes.ts`, `inbox.ts`, `types.ts`. `bot.ts` and `sweep.ts` were saved atomically. The report is `playtest/voice/checks-baseline.md` with its evidence in `playtest/voice/checks/`; bulky runs are in `playtest/runs/voice/`, which git ignores. One stray bun temp file went to `.trash/`.

## From voice-foundation: The lines lane is finished: every one of the 339 TS §7.1 ids is in `lines.ts` with a recorded clip. All 475 ne
- **Owner of `src/content/word-times.ts` (C2 or integration):** set `fm_starfish_q` to [0.02, 1.22, 2.59], `fm_rainbow_q` to [0.02, 1.68, 2.84] and `fm_snowman_q` to [0.03, 1.03, 2.06]; the current values point at the old takes. Scenes that light up words as they're said can read `public/a/l/<id>.words.json`.
- **`teach-word-times.gen.ts`:** re-run `uv run -q --with mlx-whisper --with numpy python scripts/gen-teach-word-times.py`, or drop in `playtest/runs/voice/teach-word-times.gen.ts`. This adds the 47 `_way` lines and fixes `tg_t_t_*`.
- **Logic lane:**
  - `teach.ts` `foundScript` can now use `tv_here_sound` + the sound + `tg_<g>_<p>_way`. I didn't do TV-F2.5's `tp_<p>_hear` spelling filter.
  - `notions.ts` providers can move to the new lines; their tags are already "explain": `tv_choose_hello`, `tv_train_help`, `tv_train_hear_again`, `tv_ears_frame`, `tv_same_word`, `tv_rail_frame`, `tv_petal_first`, `tv_rw_book`, `tv_rw_every`, `tv_swap_frame`, `tv_train_hello`, `tv_how_we_write`, `tv_build_lines`, `tv_last_first`, `tv_next_middle`, `tv_battle_ready`, `tv_sort_open`, `tv_rw2_flower`. Moving `idea:one-line-per-sound` means updating content test 9.
- **Integration (optional):** existing one-word clips such as `listen`, `thats` and `yay_*` are still at −16 LUFS. Re-running them through `gen-audio.ts lines --only … --force` would bring them to −19. I left them because they aren't this lane's clips.

## From voice-foundation: None of the three blocking issues were mine. The pitch fall is the lines lane's, the splitter wait is the chec
- **C2 (`warmups.ts`):** the `done` beats now carry TS §5.6's closes on their own, because the registry no longer holds them:
  - W1 `tv_w1_end`
  - W2 `fm_l2_done` + `tv_rw_link_book`
  - W3 `tv_w3_done`
  - W4 `tv_w4_done`
  - W5 `tv_w5_done` + `t_if_you_say_sounds`
  - W6 `fm_l6_done`

  Today they say `fm_l1_done`, `fm_l2_done`, `fm_l5_done` and `fm_l6_done`, and `done` holds only one line. For W3's `fastslow` recap or short form, use `openingLines` + `demoLines`.
- **All scene lanes:** close a level once with `levelWrap(level)`. Don't say each game's `wrap`.
- **D1 (`Dojo.tsx`):**
  - Use `STEMS.write` with `stemFor` for Ninja Eyes; lines 582, 589 and 611 still say the retired `dojo_find`.
  - Ignore taps while a correction is playing, as Battle does (the gate's "logic → D1").
- **D3 (`Swap.tsx`):** the first-miss path says a bare "listen" (the gate's "logic → D3").
- **Integration:**
  - Change FIX_PLAN §13.1's sketch to `ready: string | null`.
  - Change the §5.2 row "jump offers 0" for `--from w6-br1` to "at most 1 a session", as Dec9 and §11.2 say.
  - The stale `content 6b` tests are in the snapshot copies under `playtest/runs/teacher-voice/snap` and `playtest/runs/perf/screens-b/ab`, not in `src`. Either set a test root or move those snapshots to `.trash/`.

## From voice-foundation: I fixed both blocking items assigned to the checks lane (#2 and #3). Issue #1, the lead-ins that fall at the e
- **Lines lane:**
  - Better still, put `wordsIn` in a small shared module that gen-audio and script-audit both import, so the counts can't drift apart again.
  - After the 16 lead-in retakes, re-run `durations.json` and `fast-line`. Many lines sit right at the limit (`tv_ts_again` 3.296, `tv_guess_frame` 3.296, `tv_dots_ready` 3.295 words a second).
- **D3:** make Swap's split say the two-letter correction (That's… · We need… · It's two letters, but it's one sound.) instead of "Listen...". This is the last thing stopping `split-correction` from passing.
- **D1:** make the Dojo build ignore taps during a correction, as Battle does. The bot no longer depends on it, but a real child's tap would still cut the correction off.

## From voice-foundation: I fixed both blocking issues assigned to the lines lane: the falling lead-ins and the word-count disagreement.
- **Checks lane:** keep `wordCount` exported from `script-audit.ts`, because `gen-audio` imports it.
- **Integration and gate:** for future checks, use `gen-audio`'s `tailFalls()` or `qa.py`, not the single-measure `f0.py`, for the reasons above.
- **Outside TS:** 43% of the 130 older lead-ins (not `tv_`) fall more than 2 on the new measure. `gen-audio` will now catch them whenever they're re-recorded.
- **Minor:** I left `tv_learn_frame_ways` without word timings. TS doesn't highlight words on that line.

## From perf-first: The soak is now a real regression check. `soak.ts --check` judges every §11.1 budget, prints a table showing e
- **`inbox.ts`:** add `soak` to the findings pattern (`/^(sweep|critic|pics|joins|soak|persona-.*|jev-.*)\.json$/`). Until then soak findings are only printed, not merged into INBOX.md.
- **Integration (Dec10):** retire `soak-fixes.ts` and `--patched`; they now do nothing. Also drop the `PATCHES` import from `soak.vite.config.ts`.
- **F1:** in the 01:01 build the new WAAPI orbits `nj-orbit-back` (×6) and `nj-orbit-front` (×4) ran on hidden elements. `nj-orbit`, `nj-flicker` and `nj-rise` are still in the 00:52 tree; `wave` ran ×6 non-compositable.
- **Other lanes:** B2 for the World Flower main thread; D2 for `bt-orbit`, `bt-pip` and `bt-tremble`; C1 for `early-book`.

My ports were 4404 and 4504; both servers are stopped. The baseline server on 4400 was only read.

Evidence is in `/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/perf/checks/`:
- `current-phone/`, `current-desktop/`: the final soaks on the current tree
- `before-phone-analysed/`, `before-desktop-analysed/`: the baseline runs re-judged
- `before-title/`, `before-idle-next/`: the new phases on the before build
- `pre-f1-desktop/`: an earlier desktop run from before F1 landed

Each folder has a `summary.md`, `checks.json` and `soak.json`.

## From perf-first: The CORE lane is done: PERF fixes 1–7 plus "minor" in my ten files. The §3.1 sound-job contract went in first,
- **B1 (App.tsx):** drop `urls.music("title")` from `preload` (B1.1); the title already measured 0.1 MB decoded, so this may be done.
- **Decorative petal bursts → `"blossoms"`:** App.tsx:365/597, Run.tsx:776/945, Battle.tsx:865/1058, Sort.tsx:534, Early.tsx:1669, Story.tsx:355, Dojo.tsx:525, Tree.tsx:987, Intros.tsx:74. Keep `"petals"` in Intro.tsx:36.
- **Trails:** Battle `glide()`/`dot()`, Early `flyTo()`/`floatTo()` and narrate `sweepUnder` should use `fx.trail`.
- **B2:** `wffocus` → `.glow-pulse` with `--glow-r: 18px; --glow-b: 2.5px`.
- **All scene CSS:** an endless CSS animation with staggered delays costs main-thread time in engines that fire iteration events. Chrome is handled now, but WebKit is unmeasured, so for many-element loops use shared phases, long iterations or Web Animations.
- **F3:** the §3.1 contract is in; code against note 1 above.

## From perf-first: I've done the three screens in my lane: the title no longer decodes its music, the World Flower dropped from a
- **Owner of `src/styles.css`**:
  - With the earlier fixes preview, the ready and won gem animations cost about 17 % on the chart and 23 % on a trip.
  - Your new ready-gem glow already brings the chart to 0.1 % on the full tree.
  - The won-gem animation (`gemwon`) still animates `filter: brightness`; please move it to opacity like the ready one.
- **Lane A, `src/scenes/Training.tsx`**: please wrap `<svg className="tut-arrow">` in `<div className="tut-arrow-wrap">`. It's a full-screen arrow with a drop shadow, repainted every frame; the CSS for the wrapper is already in shell.css.
- **Owner of the frames script**: for before-shots of SVG animations, `__frames.freeze` should also call `svg.pauseAnimations()` and `svg.setCurrentTime()`, as `phase.ts` does.

Ports 4402 and 4502 are stopped. `rebuild.sh` rebuilds the before-snapshot-plus-my-files builds and serves the one with fixes 1–6 on 4402.

Files are in `/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/perf/screens-a/`:
- soak-before-f1-final2 and soak-mine-f1-final2 (the final side-by-side runs)
- probe-before-f1-final.log, probe-after-f1-final.log, probe-tree
- after-frames/compare.html (with diff images in after-frames/diff/)
- phase-before/, phase-after/, crops/
- the scripts: probe.ts, entry.ts, fling.ts, phase.ts, glow.ts, shimmer.ts, rebuild.sh

## From perf-first: Every row my lane owns now passes on a frozen build of my changes, and the before/after frames look the same. 
- **Whoever owns `playtest/runs/perf/frames.ts`:** `shift()` doesn't move `fixed`, and `refreeze()` before each snap resets endless animations to `fixed`. So every "-b" shot is identical to its plain shot (the ninja, flower-focus and shiny-sticker "-b" shots). Fix: `w.__frames.fixed += ms` in `shift()`, as in my copy.
- **All lanes:** the minifier turns a nameless `animation: 1.6s linear infinite` into `animation: none`. Use longhands when `animation-name` is set in another rule.
- **F1:** Early's reader waves no longer use `wave`, so you can change those keyframes freely.
- **F4:** the soak counts compositor fades at exactly opacity 0 as "hidden" (fade-in frames, animation delays). Worth knowing for the ≤ 2 budget.

Port 4403 still serves my build (PID 69773; the build is `playtest/runs/perf/.build-screens-b`). I stopped the 4503 servers and moved scratch files to `/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/.trash/screens-b/`. I didn't commit.

Everything is in `/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/perf/screens-b/`:
- `frames-after/compare.html` and `frames-after-std/compare.html`: every shot beside its before.
- `pairs/`: the close-ups I looked at.
- `soak-phone/summary.md`: the 12-level soak on my build.
- `before-a`, `before-b`, `final-a`, `final-b`: the animation and fps probe results.
- `probe.ts`, `frames-b.ts`, `trialcharge.ts`, `sortfall.ts`, `runparts.ts`: the measuring scripts.

## Title screen redesign (27 Sep): for B1 (App.tsx, shell.css)
- Jonas: "the layout of the game start screen looks lame and boring and worse than the marketing site and the play button looks weird and little and out of place floating randomly."
- Implement docs/TITLE_DESIGN.md exactly (final mockup: docs/title-design/final/index.html and shots/). It's being designed right now by the title-design workflow. If it doesn't exist yet when you start, do your other B1 work first and poll for it (a Bash until-loop, 60 s per check, giving up after 2 hours). Its acceptance stills are part of your acceptance.

## Map redesign and confirm (27 Sep): NOT for B1 in this workflow
- Jonas: on the overworld map "the kids can still never find the right button to press and their avatar weirdly overlays half of the button", and: "going back to a previous lesson accidentally, the sensei asks if that's what we want … a simple reusable mechanic that lets us 'confirm' an action".
- The map redesign (docs/MAP_DESIGN.md) and the reusable confirm (src/ui/Confirm.tsx, docs/CONFIRM.md) are being designed and built separately. A follow-up workflow wires them into App.tsx and the other scenes after this fix workflow finishes. B1: do your planned map items (TV-B1.2's lines), but don't restructure the map's layout.
- **From the confirm inventory (docs/CONFIRM.md §1; for the follow-up workflow, not B1):** these costs are fixes, not questions.
  - **App.tsx `warmupPace` + Warmup.tsx score write (note a):** an accidental replay of an old warm-up with a low score can delete its star and move `frontier()` back to it. The replay also overwrites `s.warmups[id]`, dropping `repeated`. Pace only on a warm-up's first play, or keep the first score.
  - **Scenes' finish (`useFinish` in Early.tsx, Battle's victory, Dojo/Sort/Swap/Run ends):** Home between the last answer and `onDone` throws away a won level (no star, no reward). Count the level as won at the last answer: Home then goes to the reward, or save the star first.
  - **App.tsx `HoldButton` + lines.ts `grownups`:** every press of the gear says "Hold the button to open", which teaches a child the gate. Say only "This part is for grown-ups." (new line, recorded).
  - **Grownups.tsx Delete player:** the second tap is on the same button, so a double tap deletes a child's whole save. Put the second step in a different place, and disarm after ~5 s or on any other tap.
  - **App.tsx `Reward` Jump ahead + JumpAhead.tsx + Grownups.tsx:** the child-facing button sits in the paw's slot, and a 1.5 s hold is a toddler's normal tap. There's no undo, and no `logAdjust`. Per TEACHER_SCRIPT `tv_jump_offer`, move jumping to the grown-ups page, with a text confirm naming where the child lands, a log line and "Move back to where they were".
  - **Placement.tsx `finish` / gems.ts `placeAtUnit`:** a miss after stage 1 overwrites `placedAt` with a lower unit, closing stones that were open. Only move forward unless a grown-up confirms.
  - **IntroFilm.tsx `SkipFilm`:** 1 s is too short a hold for a toddler, and the film can't be watched again after Choose. Make it 2 s, and offer "Watch the film" (from the Sticker Book or the grown-ups page).
  - **Profiles.tsx `tryGo`:** when other players exist, two empty Go taps shouldn't make "Ninja N". Keep that fallback for a device's first player only.
  - **The cheat menu (src/cheat/, docs/CHEATS.md):** five taps on the top-right corner is how toddlers mash, and the map's gear is in that corner. Open it only with `?cheat=1`, the key, or from inside the grown-ups page.
- **From the map designer (docs/MAP_DESIGN.md, for the follow-up workflow, not B1).** The spec is MAP_DESIGN.md §6–§8. The mockup (docs/map-design/final/index.html) and the ported layout code (docs/map-design/final/layout.js) are the reference.
  - **New `src/ui/mapLayout.ts`:** port `docs/map-design/final/layout.js` as it is, with types. Port `docs/map-design/final/check.ts` to `src/ui/mapLayout.test.ts`: all 74 layouts, and the ninja's box over the glowing stone must be 0 × 0.
  - **App.tsx `WorldMap`:** rewrite the render per MAP_DESIGN §6.2:
    - the stones come from `layout()`; the ninja stands beside the glowing stone, never on it;
    - the hand (`MapHand`) is its own element in the scene at z 9, not inside the stone's button, with its fingertip on the stone's rim (MAP_DESIGN §5.4 says exactly how);
    - the walk moves on `transform` (§6.4);
    - add the idle ladder `useMapLadder` (8/16/40 s) and "show the way" on wrong taps, the ninja and locked stones;
    - Help says `tv_map_help`, and another land says `tv_map_away`, with the glowing arrow back: a big gold arrow, with the ninja's face as a small badge (§2.10);
    - a finished or open stone opens `confirmWith({ id: "replay", … })` (§7), with the stone's picture on YES only and no bubble `pic`, so Sensei's bubble shows "?";
    - remove `nodePos`, `MAP_HERO_W/H`, the hero's `data-tap-proxy` shortcut and `map_locked` on the map;
    - hide ▶ when the next land is locked;
    - lay out Blossom Hills and Dragon River in two rows.
  - **Styles:** a new `src/styles/map.css` (MAP_DESIGN §6.3).
    - Remove `.map-hero*` and `map-hop` from shell.css, and `.map-next` / `mapnext` from styles.css.
    - `.map-challenge` goes indigo.
    - ◀ ▶ get the calm paper look.
  - **`src/content/instructions.ts`:** add to `ASIDES` `tv_map_help`, `tv_map_locked`, `tv_map_replay_*`, `tv_map_other` and `tv_map_other_how`, so Hear it again never replays Help's clue or the question.
  - **`public/a/durations.json` and `src/core/content/line-tags.ts`: nothing to do.**
    - The 19 map clips are measured in `durations.json`.
    - Their metadata is in `line-tags.ts` (block `// Map redesign`).
    - `bun test ./src/core/content/content.test.ts` passes, 15 of 15 (checked 27 Sep, 08:40). An earlier version of this note said the clips weren't measured. That was wrong.
  - **scripts/treadmill (continuous.ts, bot.ts, sweep.ts):**
    - map taps become real touch taps at the centre of `[data-map-next] .disc` (or `[data-map-way]` when `__snState.here` is false), not `dispatchEvent`;
    - remove the `[data-tap-proxy]` exemption (sweep.ts l. 205, 215, and HERO.md's text);
    - add the map cases and invariants in MAP_DESIGN §8.3 (`map-ninja-overlap` 0 px, `map-next-covered` 100 %, `map-replay-asks`, `map-locked-inert`, `map-idle-ladder`, …).
  - **App.tsx `KIND_ICON`:** `dojo: "item_dojo"` in place of `"sensei_idle"`. This is needed, not optional.
    - The new art is `public/a/i/item_dojo.webp`, a small dojo hall (MAP_DESIGN §10 decision 7).
    - Without it, the glowing dojo stone shows Sensei about 75 CSS px from the Sensei Help button.
    - The map's stones and the reward's medal (`RewardTrophy`) both read `KIND_ICON`.
  - **scripts/art-manifest.ts (optional):** add `["dojo", …]` to `items`, with the prompt in `docs/map-design/final/scripts/gen-dojo-icon.ts` (`DOJO_PROMPT`), so a full regeneration keeps the picture. The raw take it was cut from is `assets-src/art/item_dojo.png`.
- **From the confirm builder (docs/CONFIRM.md §3; for the follow-up workflow, not B1).** `src/ui/Confirm.tsx` is built and tested (`confirm()`, `confirmWith()`, `QUESTIONS`, `<ConfirmLayer/>`), with its lines recorded (`tv_confirm_*`), its demo `src/scenes/ConfirmDemo.tsx`, and its standalone page `playtest/confirm/`. **Changed after the judge's round (27 Sep):** the answers are now the map's pattern. YES is a picture of where the tap goes (the house, the World Flower, the stone's picture); NO is the green ▶, "keep playing", bigger, with the child's ninja, the glow and the hand. Under a leave question Home points at the house and never answers. The questions are presets (`QUESTIONS.leave`, `.leaveFirst`, `.leaveBoss`, `.leaveTrial`, `.replay`). Nothing the fix workflow owns was touched: the lines were appended to `LINES`, and their tags to `line-tags.ts`. The call sites are CONFIRM §3.3.
  - **App.tsx, once:**
    - render `<ConfirmLayer />` right after `<NavLayer … />`;
    - call `cancelConfirm()` at the top of `go()`;
    - route the demo: `{(route.name as string) === "confirm-demo" && <ConfirmDemo onHome={() => go({ name: "title" })} />}` (it registers its own Home).
  - **App.tsx `homeFor`, `case "level"` (CONFIRM rows 2, 4, 5):** `() => quitLevel(r.id)` becomes `() => leaveLevel(r.id)` (the snippet is CONFIRM §3.3).
    - A module-level `levelAnswers`, counted by `onAttempt()` (engine/store) and set to 0 in `go()`.
    - While it's 0, Home leaves at once.
    - Otherwise it calls `confirmWith(ask({ pic: img(levelIcon(lv)) }))`, where `ask` is:
      - `QUESTIONS.leaveTrial` when `lv.trialGem` (YES is the World Flower);
      - `QUESTIONS.leaveBoss` when `lv.kind === "boss"`;
      - `QUESTIONS.leaveFirst` for a first-session lesson, else `QUESTIONS.leave` (YES is the house).
      - The presets set `from` (Home's centre), the `how` line, the nudge and `home: "yes"`.
    - On YES, `quitLevel(id)`. When `how === "no"` (the ▶), `replayTold()` (the turn's question again). A timeout just carries on. Home under the question needs nothing: it points at the house.
    - A scene that records no answer through `recordSpell` / `recordRead` / `recordWordSpelt` / `noteAttempt` keeps today's instant Home. That's the safe default.
  - **App.tsx `WorldMap` stones (CONFIRM rows 1 and 10):** use MAP_DESIGN §7's `ask()`, which the map lane keeps in step with this API. The plain form, without the map's own lines: `confirm(QUESTIONS.replay({ pic: img(icon), from: el })).then((yes) => yes && onLevel(id))`.
  - **Battle.tsx:** the charge and the trial's bar wait while `useConfirmOpen()` is true, as they do while `useUpright()` is. Speech needs nothing: the confirm gates the game's speech queue, so a scripted scene waits at its next line.
  - **scripts/treadmill/bot.ts:** `if (st.scene === "confirm") return st.ready ? down('[data-confirm="no"]') : undefined;` (NO is the ▶). A bot never means to leave. A sweep case that tests leaving taps `[data-confirm="yes"]`.
  - **scripts/treadmill/sweep.ts:**
    - a close with `via: "timeout"` on `id: "confirm:*"` isn't `auto-advance`, because it returns to where the child was;
    - add a `confirm-demo` case once App routes it: `?scene=confirm-demo&cf=level`, answer, then Home. Check that `__snState.scene === "confirm"`, that the answers are ≥ 96 CSS px and clear of the Home and Help zones, that NO restores the level's `__snState`, that a second Home leaves the question up with `__snState.point === "yes"`, and that it asks for 0 animation frames while waiting (`playtest/confirm/shoot.ts` does all of this today, 23 checks).
  - **`src/content/lines.ts`, its owner: retire four superseded confirm lines.** Nothing calls `tv_confirm_no`, `tv_confirm_how`, `tv_confirm_again` or `tv_confirm_replay` any more. Their tick-and-back-arrow wording made "go back" mean YES in one line and NO in the next. Add them to `RETIRED_LINES` ("retired on these paths"), or remove them with their tags and move their clips to `.trash/`. (The confirm lane appends only, so it left them in place.)
  - **`src/core/content/line-tags.ts`: nothing to do** (corrected by the map lane, 27 Sep, 08:40). All 19 `tv_map_*` lines are tagged, and so are all 16 `tv_confirm_*` lines (the 8 new ones in block `// Confirm, fix round`). `bun test ./src/core/content/content.test.ts` passes, 15 of 15 (27 Sep, after the confirm's fix round).
  - **The audio judge can't hear time-stretching (the owner of scripts/gen-audio.ts and scripts/tts.ts).** gen-audio lengthens a word-perfect take that is too fast with PSOLA (up to ×1.5), and only `judgeAudio` checks the result. It gave 10/10 to a PSOLA ×2.2 copy on one run and 7 on the next, and 10/10 twice to an ffmpeg `atempo 0.55` copy (`playtest/confirm/listen.ts`, `logs/listen.json`). So a `lengthened` clip has no machine check for artefacts. 14 lines of the confirm and the map are stretched ×1.03–1.36 (two of them the confirm's in use: `tv_confirm_leave` ×1.25, `tv_confirm_leave_boss` ×1.10).
    - Someone should listen: `open playtest/confirm/listen.html` has ruined calibration clips first, then every stretched clip (about 2 minutes). The map lane's A/B test agrees that the judge can't tell (MAP_DESIGN §12.2).
    - Consider lowering `MAX_LENGTHEN`, or failing a line that needs more than ×1.2 so it is reworded with a natural pause. The confirm's new lines were written that way, and none needed stretching.
  - **docs/NAVIGATION.md §3.1, z-order (optional):** add the confirm at z 87, over the scene layers, the nav row and Help, and under Home (88).

## Fast and slow (27 Sep)

Jonas: "you gotta read the 'slow way to say a word' with actual little gaps between the sounds … And you need to explain more often that there are slow and fast ways to read words etc." The script is docs/TEACHER_SCRIPT.md §9 (the five moves in §9.2, each game in §9.3, the lines in §9.4, the dosage in §9.5, the tortoise and rabbit in §9.6). The 24 `tv_fs_*` lines are recorded (block `// --- Fast and slow` at the end of `LINES`), with their tags in line-tags.ts and their lengths in durations.json. Every caller guards with `HAS` / `L()`. Game ids are games.ts's. Acceptance: FIX_PLAN §13.5.

- **F2 (`narrate.tsx`), one helper for every lane.** Keep the per-session record in memory, like `perSession`, keyed by `sessionNow()`:
  - `fsReadback(game: GameId): "rabbit" | "sw" | "pair" | "plain"`: which read-back this is. "rabbit" is the first read-back of this game type this session (Move 1). Then "sw" (S~W's `say_sounds_read`) on the 2nd and 4th, "pair" (Move 5) on the 3rd and 5th, and "plain" (the faded form) after that. From land 3 on, "rabbit" only for the session's first game.
  - `fsIdea(game, bank: "listen" | "read" | "build", o?: { tight?: boolean }): string | null`: the next idea line (TS §9.5's banks and order), walked by one save-wide pointer (`timesHeard("fs:idea")`). It skips lines already said this session, and with `tight` it skips `tv_fs_tortoise`, `tv_fs_rabbit`, `tv_fs_ninja` and `tv_fs_mantra`. The save's first is `tv_fs_two_ways`. Null once this game has had one this session, or the caps are reached (2 a level, 4 a session).
  - `fsStuck(game, kind: "slow" | "again" | "push"): string | null`: the `tv_fs_stuck_*` line when it's its turn, or null (the game's own line's turn).
  - `fsPraise(game, kind: "letters" | "listen" | "build"): string | null`: once per game per session.
  - `fsPair(): [slow: string, fast: string]`: the two pairs, taking turns.
  - `fsSaid(id, game)`: records a line heard in full (`heard("fs:idea")` for idea lines).
  - `afterWordSay({ …, fs?: string | null })`: when praise is due and `fs` is given, say that line in the praise slot and count the rhythm (the idea or fs praise line takes the slot, and nothing is stacked).
  - **Until the helper lands**, a lane can use `onceInSave(\`fs:${game}:${sessionNow()}\`)` plus `heard()` for Move 1, and `(timesHeard("fs:idea") + i) % bank.length` for the idea.
- **Owner of `src/content/instructions.ts`:** add `"tv_fs_praise_"` and `"tv_fs_stuck_"` to `FEEDBACK_FAMILIES`. Add the idea lines and the read-back lead-ins (`tv_fs_*` except `tv_fs_rabbit_read` and `tv_fs_run`) to `ASIDES`, so Hear it again replays the turn's question, never "Let's say it the slow way…".
- **F3 (`nav.tsx`, `nav.css`): the tortoise and rabbit badges (TS §9.6).**
  - Add `FastSlowBadges` to `NavLayer`, beside the speaker in the row (in the column under the speaker), using `ui_tortoise` and `ui_rabbit`. They never cover ▶, the paw, the petal or the caption.
  - `NavSpec.speed?: { own?: boolean } | null`: shown dim while a scene has a fast/slow moment; `own` hides them where the scene draws its own (the warm-ups).
  - `navSpeed("slow" | "fast" | null)`: lights the tortoise (a slow step on each sound) or the rabbit (one hop). Any `stretch:` clip (`onClip`) lights the tortoise by itself.
  - `rabbitTap(o: { timeoutMs?: number }): Promise<"tap" | "timeout">` for Move 1:
    - the rabbit grows to at least 100 stage px, pulses, and is spotlit on "rabbit" (from `tv_fs_rabbit_read`'s word timings);
    - at 8 s it hops and glows; at 12 s it resolves "timeout", and the scene says `tv_fs_now_fast` · [w];
    - it is live only while it waits, and a tap at any other time only wiggles it;
    - a tap on the tortoise while it waits replays the slow way (the scene passes it in).
  - Log `navLog({ kind: "speed", which: "slow" | "fast" })` and `navLog({ kind: "rabbit", how: "tap" | "timeout" })`; the rabbit's tap counts as a child action for `talk-before-action`.
- **F4 (`script-audit.ts`, `sound-display.ts`):** the §13.5 checks: `fs-per-session`, `fs-repeat`, `fs-readback`, `fs-badges`, `fs-answer-leak`. Also re-measure `talk-before-action` once the gapped slow words land (TS §9.7, FS3).
- **The slow-word audio lane (`public/a/x`, the gapped slow way; FEEDBACK Round 15):**
  - Build the slow way from the pure sounds with short gaps. No sound may trail into a vowel, and Jonas's ear judges.
  - Publish per-sound timings, so the tortoise can step on each sound and the tiles or dots can light.
  - Keep today's stretched clips beside the new ones (FS1: the building games' prompts may need to go back to them).
- **C1 (`Early.tsx`):**
  - **Word Building** (`BuildSequence`, `build`): on the first word read back after the Ready, or the first word on a recap or short form (`fsReadback("build") === "rabbit"`), say `tv_fs_say_sounds_slow` · the tiles' sounds (each tile lights; `navSpeed("slow")`) · `tv_fs_rabbit_read` · `await rabbitTap()` · [w] with the sweep (`navSpeed("fast")`). Then `fsIdea("build", "build", { tight: true })`, in place of that word's `say_sounds_read`.
    - "pair": `fsPair()` around the sounds and the word.
    - First miss: `fsStuck("build", "slow")` · [w, slowly], taking turns with `tv_listen_here`.
    - Praise: `fsPraise("build", "build")` through `afterWordSay({ fs })`.
  - **Kai and Suki** (`ReadCheck`, `readcheck`): on the first right-reader answer of the session, `tv_yes_<reader>` · `tv_fs_say_slow` · the sounds · `tv_fs_now_fast` · [w]. **No rabbit tap here.** The idea goes in the first praise slot (`fsIdea("readcheck", "read")` via `afterWordSay({ fs })`); Move 5 on the 3rd resolution.
  - **First Sounds** (`firstsound`) and **Sound Hunt** (`soundhunt`): the idea (`"build"` bank, tight) in the first praise slot of the session.
    - First Sounds' first miss, taking turns with §5.4's: [w] · `tv_fs_stuck_slow` · [w, slowly] · `fm_diff_<w>` · `tv_fix_start` · the sound.
    - Sound Hunt's build phase is Word Building's.
  - Show the nav badges (`speed: {}`) in all of these.
- **C2 (`Warmup.tsx`, `warmups.ts`):** the scene's own big tortoise and rabbit (`speed`) are the cue and the join-in, so pass `speed: { own: true }`.
  - **W1:** no change. `tv_same_word` counts as the telling (record `fsSaid`), and `tv_ts_slow` plays the gapped slow way.
  - **W3 `fastslow` recap:** after the child's tortoise tap and [mug, slowly], say `fsIdea("fastslow", "listen")`, which gives `tv_fs_two_ways` on the save's first, in place of `tv_praise_slowly` when both are due. Then `fm_tap_rabbit`.
  - **W3 Slow Words:** on the first right answer, [w, slowly] · `fsIdea(…, { tight: true })` · `fm_tap_rabbit` (the rabbit comes back from its corner) · the tap · [w].
    - First miss: `tv_fs_stuck_again` · [w, slowly], taking turns with `tv_slow_again`.
    - 8 s idle: `tv_fs_stuck_again` · [w, slowly], **never `tv_idle_look_<w>`** (it names the answer).
    - Praise: `tv_fs_praise_found`.
  - **W3 Pocket Hunt, the middle** (`tapall:in`): on the child's first find, [w, slowly] · `fsIdea("tapall:in", "build")`.
  - **W5 Guess My Word:** on the first right answer, [w] · `tv_fs_say_sounds_slow` · the sounds (neutral dots) · `fsIdea(…, { tight: true })` · `fm_tap_rabbit` · the tap · [w]. On the full form this goes **in place of `tv_guess_together`**.
    - First miss: `tv_fs_stuck_push` + the sounds, taking turns with `tv_guess_again`.
    - 8 s idle: `tv_fs_stuck_push` + the sounds, **never a line that names the word**.
    - Praise: `tv_fs_praise_found`.
  - **W6 Sound Dots:** on the first word, after the last dot, `fm_tap_rabbit` in place of `tv_now_say_word` · the tap · [w] with the sweep · `t_if_you_say_sounds` (once per save) or `fsIdea("dots", "listen")`.
  - **Re-measure `secs`** with the gapped slow words (TV-C2.4).
- **D1 (`Dojo.tsx`, `Build`):** as C1's Word Building, on the dojo's first built word of the session (`fsReadback("build")`), with `tv_fs_rabbit_read` and `rabbitTap()`. Also Move 5, the stuck recap taking turns with `tv_listen_here`, `tv_fs_praise_every`, and the nav badges.
- **D2 (`Battle.tsx`):**
  - **Battles, bosses and Sensei's Challenge:** as Word Building, on the first word zapped in the session. **The rabbit's tap is the finishing zap**: the rabbit hops at the monster and the bar drops.
    - The idea goes after the tap (`"build"` bank, tight), and Move 5 on the 3rd and 5th words.
    - The stuck recap takes turns with `tv_listen_here`.
    - The badges sit in the column.
  - **Gem battles** (`trial`): no rabbit tap and no pair while the purple bar runs. Only the badges, the stuck recap, and the idea in the first praise slot.
- **D3 (`Swap.tsx`):**
  - After the child's sound taps on the start word (`tv_swap_read_first`), say `tv_fs_rabbit_read` · `rabbitTap()` · [w] with the sweep, in place of the bare sweep, once per session.
  - The idea goes in the first praise slot of the session (`"build"` bank, never `tv_fs_same`).
  - No Move 5: the turn with two gapped slow words is about 11 s.
  - The badges light on `tv_swap_both`'s two slow words.
- **D5 (`Run.tsx`):**
  - `tv_fs_run` before `tv_guess_q` at the first lantern group of every run except the save's first, whose `tv_run_lanterns` says it.
  - On the first catch of the session, `tv_fs_say_slow` · the sounds · `tv_fs_now_fast` · [w] in place of the bare sounds and word. **No rabbit tap** (a tap anywhere is a jump).
  - A wrong lantern: `tv_fs_stuck_again` + the sounds, taking turns with `tv_run_fix`.
  - Praise: `tv_fs_praise_found`. The badges go beside the speaker.
- **D6 (`Story.tsx`):**
  - On the session's first child page, say `fsIdea("story", "read")` after `tv_story_yours` or `story_your_turn` (the page stays live).
  - On the first word tapped for help in a session, say `tv_fs_say_slow` · the letters light one per sound with the sounds · `tv_fs_now_fast` · [w].
  - Praise: `tv_fs_praise_both`. The badges go in the column.
- **A (Training, Show Sensei):** nothing. No slow words there.
- **Integration:** log FS1–FS6 (TS §9.7) in docs/DECISIONS.md. FS1 is the Sounds~Write difference (gaps segment the word for a speller), for Jonas to see.

**More lines, and praise once a session (27 Sep, later; TS §9.4–§9.5).** 16 new `tv_fs_*` ids are recorded in the same block, with their lengths in durations.json:
- **Idea lines (Move 2), all under 3.5 s,** so a tight run never skips them: `tv_fs_hiding`, `tv_fs_whole`, `tv_fs_push`, `tv_fs_turn`, `tv_fs_ninjas_can`, `tv_fs_next`, `tv_fs_start_end`, `tv_fs_count`. `fsIdea`'s banks, in this order (a tight run skips `tortoise`, `rabbit`, `ninja` and `mantra`):
  - listen: `two_ways`, `tortoise`, `gaps`, `hiding`, `rabbit`, `whole`, `read`, `turn`, `same`, `push`, `made`, `ninjas_can`, `ninja`
  - read: `two_ways`, `tortoise`, `gaps`, `hiding`, `rabbit`, `whole`, `read`, `push`, `same`, `ninja`, `mantra`
  - build: `two_ways`, `tortoise`, `gaps`, `next`, `made`, `start_end`, `same` (not in Swap), `turn`, `spell`, `count`, `find`
- **Praise (Move 4):** letters `tv_fs_praise_both`, `tv_fs_praise_both_2`, `tv_fs_praise_both_3`; listen `tv_fs_praise_found`, `tv_fs_praise_found_2`, `tv_fs_praise_found_3`, `tv_fs_praise_found_4`; build `tv_fs_praise_every`, `tv_fs_praise_every_2`, `tv_fs_praise_every_3`, `tv_fs_praise_every_4`.
- **F2, the rule: each praise line at most once a session.** `fsPraise(game, kind)` returns the next line of that kind not yet said this session (one save-wide pointer per kind, `timesHeard("fs:praise:<kind>")`), and null once the kind's lines have all been said (that game then has its ordinary praise). It is still at most once per game per session. Until now one line per kind could play 4 times in a session (`tv_fs_praise_found` in Slow Words, Guess My Word, Sound Dots and Ninja Run).
- **C1, C2, D1, D2, D5, D6:** wherever the notes above name `tv_fs_praise_found`, `tv_fs_praise_every` or `tv_fs_praise_both`, call `fsPraise` with its kind instead.
- **Owner of `src/core/content/line-tags.ts`:** the 16 new ids are tagged already, but three were tagged before their text changed (the takes failed the BATH or length check, so they were rewritten), so their hashes are stale: `tv_fs_start_end` (now "The slow way shows us where each sound goes."; the id is kept because `narrative.ts` uses it), `tv_fs_praise_both_2` and `tv_fs_praise_found_4`. The right entries are in `playtest/voice/fast-slow/line-tags-new.txt`.
- **Owner of `src/content/instructions.ts`:** add the 8 new idea lines to `ASIDES`, like the first 11. The praise ids start with `tv_fs_praise_`.
- **Owner of `src/content/word-times.ts`:** `fm_snowman_q` was taken again (its "fast" was American): set it to `[0.03, 1.38, 2.25]` (its words.json).
- **Taken again for the BATH vowel, same ids and text:** `tv_fs_two_ways`, `tv_fs_made`, `tv_fs_mantra`, `tv_fs_now_fast`, `tv_fs_stuck_push`, `tv_fs_praise_both`, `tv_ts_fast`, `tv_learn_last`, `tv_opt_ask`, `fm_last_one`, `fm_fast_sun`, `fm_tap_rabbit`, `fm_snowman_q`. Read lengths from durations.json, not from memory: `tv_ts_fast` is now 1.83 s (was 1.54), `fm_fast_sun` 2.36 s (was 2.01) and `fm_snowman_q` 4.48 s (was 4.22).

## Slow words (27 Sep)

From the slow-word sound editor. Jonas: "read the 'slow way to say a word' with actual little gaps between the sounds. It is too smooth now." So `public/a/x/<word>.mp3` (what `say({ stretch: w })` plays) is now the word's own pure sounds one by one with a **250 ms** gap ("c · a · t"), spliced from `public/a/p/` by `scripts/gen-slow-words.ts`. It exists for **997 words** (every word with a segmentation), not 163, and `STRETCHED` / `canStretch()` now say yes to all of them. The clips are 0.5–4.7 s, 1.8 s on average (the old 163 averaged 1.2 s; the same words are now 1.8 s). Listen: `playtest/slow-words/index.html`.

**New: `SLOW_TIMES` and `SLOW_GAP_MS`** (export from `src/content/stretch.ts` or `src/content/slow-times.gen.ts`). `SLOW_TIMES[w]` is each sound's onset in seconds from the clip's start, one per sound in the word's `segs` order (x in fox is one sound, as its card is). A sound lasts until `SLOW_GAP_MS` before the next onset; the last lasts until the clip ends. To light a card or sound button on each sound, follow the clip's own clock, as Warmup's `readAlong` does with `WORD_TIMES`: `const c = nextClip(\`stretch:${w}\`, 1500); say({ stretch: w }); const t0 = (await c)?.start;` then light sound i at `SLOW_TIMES[w][i]` after `t0`, and unlight it at the next onset. Never time lights from a fixed length or `ms / n`: the sounds differ in length (a /t/ is 0.08 s, an /s/ 0.45 s).

- **Warmup.tsx (scene lane):**
  - `STRETCH_MS` (line ~1792) holds the OLD clip lengths: sun 2440, sock 900, cat 1330, dog 810, mug 1500 ms, else 1400. They are now sun 1896, sock 1547, cat 1000, dog 1379, mug 1521. Please drop the table and use `SLOW_TIMES` (the end comes from `onClip`).
  - `slowWord()` (~1505–1524): the card stretches like elastic (`fx: "stretch"`) over the whole clip and the ribbon's dots pop at even `ms / n` steps. The clip isn't smooth any more, so the elastic no longer matches what's heard. Pop dot i, and pulse the card or step it one notch wider, on `SLOW_TIMES[w][i]`. The slow kata could beat on each onset too.
  - Stale comments: "sssuuunnn" (1341, 1363), "mmmuuug… mug!" (632), "bullet time under the stretched word" (679). The bullet time still works.
  - `findSay` (719) now gives every "in" find a slow clip, so the middle sound is heard on its own. That's good for that game.
- **Early.tsx (scene lane):**
  - The first-sound picture pool (~1303) filters on `STRETCHED.has(w.text)`, which is now every word, so it grows from 57 to 122 picture words (new: cap, bat, bed, hen, fish, duck, ring, rain, boat, night, and more). `src/content/validate.ts:66` has the same filter. The comments at 49–50 and 1298 promise a "long first sound" after a slip. The slow clip now says the first sound on its own and then the rest ("d · o · g"), which makes it clearer, not longer. Please decide whether you want the bigger pool (check picSaysFirst), and update the comments.
  - 1431, "the middle sound must be heard long": it's now heard alone between gaps. Update the comment.
  - 1829 (a spelling slip) says `x(word.text)`: see the pedagogy item below.
- **Pedagogy, for the owners of `src/engine/feedback.ts`, `src/scenes/narrate.tsx` (F2) and Early.tsx:** the first-miss spelling correction (`correction()` attempt 1: `listenLead` + `{ stretch: word }`), `spellingHelp()` in narrate.tsx and Early 1829 are all documented as "never do the segmenting for the child" (TEACHER_SCRIPT §5.4). A slow word with gaps now *is* the segmenting (m · a · t), played just before the child picks the sound for the glowing slot. My recommendation: in spelling corrections, play the plain word (`{ word }`) and keep "What can you hear here?", and use the slow word everywhere the child *listens*: Slow Words, Sound Hunt, Swap's "what changed", stickers and Dojo's neighbours. `LISTEN_AGAIN.stretched` ("Let's listen to the word again, slowly.") now rotates for every word; if the correction goes plain, that set must go plain too.
- **Dojo.tsx (scene lane):** the adjacent-sounds explanation (731–733: `audit_neighbours` + the slow word) now plays for every word, where before it was 102 of the Unit 8–10 words. The arrows (`setPointAt(pairs)`) could light each pair as its two sounds play: pair (i, i+1) from `SLOW_TIMES[w][i]` to the end of sound i+1.
- **Swap.tsx (scene lane):** `early` (294, 545–546) holds on to "slow clips exist for the early chains' words only". Every chain word has one now, so all chains can use `{ stretch }`. The changed sound stands alone between gaps, so "what changed" is easy to hear. Light the changed tile on its onset.
- **Battle.tsx (scene lane):** line 373 preloads `/a/x/` for every word in the battle now, not just the old 163-word subset. A decoded slow clip is about 1.8 s, roughly 300 KB of float audio, so please check the decode budget (docs/PERF.md). Use `urls.stretch(w)` rather than a hand-built path.
- **Stickers.tsx (scene lane):** every picture sticker now says "sun… s · u · n" (line 76). Update the "sssuuunnn" comment (73).
- **F2, durations.json:** please run `bun scripts/gen-durations.ts` once my clips are in (they are). The `x/` entries still hold the 163 old lengths (x/sun is 2440, now 1896) and miss 834 words. So the core curriculum's `stretched` (`durations.stretch(w) !== undefined`, curriculum.ts 26/32/34) is false for them, and linebook's `partMs` guesses 350 ms for a slow word that really takes 1–4.7 s.
- **Core (`src/core/types.ts`):** `WordEntry.stretched` ("has a stretched recording in public/a/x") and `presentation: "stretched" | "segmented"`: the clip is now segmented, so "stretched" presentations sound segmented. Rename or re-document it.
- **Lines (F2) and scenes, Jonas's second ask** ("explain more often that there are slow and fast ways to read words"): a slow word often plays with no framing. The candidates are stickers (word, then the slow word), Swap's early chains, the tap-all "in" and Sound Hunt echoes (feedback.ts 79, 93, 95), and the correction leads. A short beat such as "That's the slow way… [s · u · n]. And fast: sun!" (the tortoise and rabbit of `tv_same_word`) around those would do it. I've added no lines.
- **Scripts:** `scripts/gen-stretch.ts` wasn't touched. Its default mode now walks all 997 `STRETCH_WORDS` and skips existing files, but `WORDS=<w> bun scripts/gen-stretch.ts` would overwrite a slow clip with a smooth TTS take. Use `bun scripts/gen-slow-words.ts --only <w>` instead. `--onset` (public/a/o/) is unaffected.

## Cheat menu (27 Sep)

The grown-ups' cheat menu is in `src/cheat/` (docs/CHEATS.md). It opens with five taps in the top-right corner, the backquote key or `?cheat=1`. It needs these hooks in files other lanes own. Nothing breaks without them: each item lists what the menu does in the meantime.

- **Grownups.tsx (scene lane): a "Cheats" button.** Put it in the Settings panel next to "Jump ahead", styled like its neighbours: `<button onClick={() => cheatMenu(true)}>Cheats (for testing)</button>`, with `import { cheatMenu } from "../cheat/gesture";`. That module is tiny and already in the main bundle, and it lazy-loads the menu. `window.__snCheat(true)` does the same thing. *Meanwhile:* the corner taps and the backquote key open the menu from any screen, the Grown-ups page included.
- **IntroFilm.tsx (scene lane): start at a shot.** `usePresentation` already takes `start`. Please read `?shot=N` (1–8) and pass `start: N - 1`: `const q = new URLSearchParams(location.search); const s = Number(q.get("shot")); … usePresentation(steps, { id: "film", start: s >= 1 && s <= 8 ? s - 1 : 0, … })`. The menu's "Film, shot N" jumps already reload on `?scene=intro&shot=N`. *Meanwhile:* they start at shot 1.
- **Music volume at start-up (owner of engine/audio.ts or App.tsx).** `settings.music` in audio.ts starts at 0.32 on every page load, and nothing applies the save's `settings.music`. So the Grown-ups music slider, and the menu's Music off, last only until the next reload. Please call `setMusicVolume(store.get().settings.music)` once at start (App's first effect), and again after a profile switch. *Meanwhile:* the menu applies it live with `setMusicVolume` and writes the save.
- **App.tsx (B1), optional: `key={route.id + fade}` on `<Reward>` (line 242),** as `StickerRoute`, Level and Tree have. Without it, `go()` from one reward to another (same or different level) reuses the mounted Reward, which keeps the gains, new words and trophy it read as it first opened. *Meanwhile:* a menu jump to the screen already on show first leaves it for an empty route (`flushSync`), so the jumps are right either way.
- **App.tsx (B1), optional:** please export the `Route` type. `src/cheat/jumps.ts` mirrors it as `AppRoute`, and a route added to App without being added there will simply not be offered.
- **store.ts, optional:** please export `fresh()` (as `freshSave`), so `blankSave()` in src/cheat/actions.ts needn't mirror it. A unit test checks the mirror for missing keys.
- **Profiles.tsx, optional:** a way to open straight on the new-player name screen (a prop or `?naming=1`). The menu's "Who's playing?" jump lands on the list, one tap on + away from it.

## FS1: the slow word in help and questions (decided 27 Sep, docs/DECISIONS.md), for C1, C2, D1, D2, D3, D5
- Reading and blending moments: the gapped slow word (public/a/x) is right.
- Spelling moments (word building, battles, the dojo's build), FIRST miss: `tv_fs_stuck_slow` (or the game's own correction) plus the PLAIN word, public/a/w, not the gapped one. The child segments. SECOND miss: model with the gapped slow word.
- First-sound and sound-hunt questions (Early.tsx's first-sound listenAgain, around line 1320, and its picture pool; the Sound Hunt): NEVER the gapped slow word, because it hands over the answer. Use the plain word or the held-onset clip (public/a/o) where one exists.

## Speech templates (27 Sep)

The template infrastructure from docs/SPEECH_TEMPLATES.md is in new files: `src/content/templates.ts` (the registry: 16 templates, the grammar, members), `src/engine/speech.ts` (the runtime resolver), `src/content/templates-decode.ts` (clip ids back to text), `scripts/gen-templates.ts` (the generator) and `public/a/t/manifest.json` (empty until the first render). Tests: `bun test ./src/engine/speech.test.ts ./src/content/templates.test.ts`.

**Nothing changes audibly yet.** `speak(id, values)` returns today's `Say[]` shape. Until audio.ts plays templates, and the manifest lists every piece of one, it returns the template's fallback: today's composition, made only from recorded lines and library clips. So lanes can move call sites to `say(speak(…))` in any order, and each template switches over as its recordings land. The switch happens per template and whole: a template is never half recorded pieces and half fallback.

- **`src/engine/audio.ts` (F1).** docs/SPEECH_TEMPLATES.md §5.2, trimmed to what the resolver needs:
  - Add the two kinds to `Say`: `import type { TplSay, JoinSay } from "./speech";` then `| TplSay | JoinSay` (type-only, so no import cycle at run time).
  - Loaders: `if ("tpl" in it) return load(it.url);`. A `{ join }` loads nothing.
  - `{ join: "breath" | "sentence" }`: a pause of `JOIN_MS[join]` (150 and 450 ms), measured from the end of one clip's speech to the start of the next's.
    - Minimum: sleep for the join, less the silence the two buffers carry at that edge. Find the edges with a 5 ms-frame scan of each decoded buffer's first and last 150 ms, 40 dB under its peak, cached in a `WeakMap`.
    - Better (§5.2.3): `src.start(when)` on the audio clock. `hush()` and the upright gate must then stop every scheduled source.
    - `{ gap }` keeps its meaning.
  - Fallback swap: if any `{ tpl }` loader resolves to `null` (a 404, Cloudflare's `200 text/html`, or offline), play `it.fallback` in place of the whole list, once, and push `{ url: "tpl-miss:<id>" }` to `__audioLog`.
  - Guard `load()` on the content type (`/^audio\//`), so the single-page fallback is never decoded.
  - Captions: a `{ tpl }` adds its `text`, with each `hide` value replaced by 🔊 unless `reveal`. As today, a trailing "..." is dropped at the very end.
  - `clipId()`: a `{ tpl }` is `t:<tpl>/<piece>-<key>`, for `onClip`, `nextClip` and spotlights.
  - At boot, once the above ships: `void loadManifest().then(() => setTemplatePlayback(true))` (both from `./speech`).
  - Template clips are 24 kHz, 48 kbps MP3. delivery.md §8.3 applies: decode speech at 24 kHz except `/a/p/`, a decode queue of 2, and `warm()` (`clipsFor(id, values)` lists the URLs).
- **`src/pwa/sw.template.js`.**
  - Today's worker serves `/a/t/` clips and `manifest.json` unchanged, because they sit under `/a/` and are versioned by the hash of `public/a`.
  - Store a response only when its content type is `audio/`, `image/`, `video/` or JSON. Today a missing `/a/t/…mp3` caches the single-page HTML until the next deploy, and plays the fallback until then.
  - Before the Year R render, move to delivery.md's hash-bucketed caches. Otherwise every re-render of a template makes every phone fetch every asset again.
  - Precache the fallback lines and `/a/p/` (critic, §2.5).
- **`scripts/treadmill/transcript.ts` (F4).**
  - At the top of `decode(url)`: `const t = decodeForTranscript(url); if (t) return t;` (from `src/content/templates-decode`). It returns `{ kind: "say", who: "sensei", text }` for a `/a/t/` clip, and `[t:<id>]` for one this build can't decode.
  - Render a `tpl-miss:<id>` log entry as `[template fallback: <id>]`.
  - The §7.3 audits (`carrier-colon`, `word-after-lead`, `template-fallback`, `clip-text`) and the listening pages per template are still to build.
- **The scenes (P2 lanes).** Replace each composition with `say(speak(id, values, opts))`. Options:
  - `show` and `at`: a sound's job and anchor.
  - `reveal`.
  - `slow: false`, for FS1: the plain word in place of the gapped slow word.
  - `segs`: a read-back's sounds.

  Use `clipsFor(id, values)` for `preload()` and `warm()` in place of hand-built URLs. The 16:
  - C1 `Early.tsx`:
    - `BuildOne.ask`, on the item's first ask: `w_position_q` `{ pos: "first", word }`.
    - Later asks, and `again()`: `w_next_q` `{ pos: "next" | "last" }`. Add `{ word }` after it only where FS1 allows.
    - The dictation effect: `w_your_word`, then `w_your_next_word`. Keep the fade to the bare word.
    - `readBack`: `s_say_read` with `{ segs: word.segs }`.
    - `FirstSoundLevel.mk`: `s_which_starts`, with `show` as today.
    - `onRight`: `ws_starts_with`.
    - Ninja Eyes: `s_which_write`.
    - `usePickGame.present`: `w_name_pic`. Delete the `this_is_a` fallback.
  - D1 `Dojo.tsx`:
    - `Build.prompt`: `w_your_word` or `w_your_next_word`.
    - `Find.prompt`: `s_which_write`.
    - `Learn`: `s_here_sound`, `s_how_write` and `s_say_the_sound`.
  - D2 `Battle.tsx`:
    - `question()`: `w_your_word` when `n === 0`, else `w_your_next_word`.
    - `monsterAttack`: `w_listen_again` with `slow: attempt > 1`.
  - D3 `Swap.tsx`: `ask` and `hear` → `ww_change`.
  - C2 `Warmup.tsx`: `nameCards` → `w_name_pic`.
  - A `Placement.tsx`: `place_spell` → `w_your_word`, and `place_sound` → `s_which_write`.
  - F2:
    - `feedback.ts` `correction()`, attempt 1: `w_listen_again` with `slow: false`.
    - `narrate.tsx` `spellingHelp`: `w_listen_again`.
    - `teach.ts` `wayWeSpell`: `ws_way_we_spell` `{ sound: p, word: <canonical example>, spelling: "g>p" }`.
    - `teach.ts` "Here's the sound…": `s_here_sound`.
    - `teach.ts` `t_say` + a sound: `s_say_the_sound`.
- **`src/content/lines.ts` (F2).** Add `tv_listen_word`: "Listen to your word." `w_your_word` and `w_your_next_word` prefer it as their fallback the moment it is in `LINES`. Until then they fall back to "Your word is…" + the word.
- **`src/content/nouns.ts` (new, content owner; R9).**
  - 101 Year R pictures have no noun phrase, so "This is {picture~a}." skips them (`sit`, `swim`, `astronaut`…). Today the only checked source is the `fm_name_<w>` family: 56 sentences, 53 of them Year R pictures.
  - Shape: `{ [picture]: { np: "a sock" | "some jam" | "the sun"; number: "sg" | "pl" | "mass"; kind: "thing" | "action" | "quality" } }`.
  - Then `nounPhrase()` in `templates.ts` reads it first, and only `kind: "thing"` fills a noun-phrase slot.
- **`scripts/check-assets.ts`, `scripts/release.sh`, `scripts/preview.sh`.** Once scenes call `speak()`:
  - add `bun scripts/gen-templates.ts --check --unit <R|Y1|all>` for the build's highest unit. It exits 1 on any piece the content can reach that isn't recorded;
  - add the 80,000-file gate (delivery.md §8.4).
- **`package.json`.** Add `./src/engine/speech.test.ts ./src/content/templates.test.ts` to `"test"`.
- **`src/core/**` (F2), §5.3:**
  - `UttPart` gains `{ tpl; piece; key; text }` and `{ join }`.
  - `LineBook.utter` builds template utterances from `speakParts()` and `transcriptFor()`.
  - `estMs`: the manifest's `ms` plus `JOIN_MS`.
- **`docs/DECISIONS.md` (integration): log these.**
  - **Sensei's template voice is the game's, Erinome.** The workflow brief said Sulafat, but DECISIONS 27 Sep moved Sensei to Erinome. The generator reads `VOICES.sensei` from `gen-audio.ts`, and the voice is in each clip's input hash.
  - **FS1 overrides the design in two places.**
    - `w_position_q` is "What's the {pos} sound in {word}?" with no gapped slow word after it. The design had `{word~slow}`, which does the segmenting for the child. `w_next_q` names no word.
    - `w_listen_again` takes `slow: false` for a first spelling miss.
  - **Fallbacks are today's compositions**, not the design's three new lines. So the migration is silent, and a template switches on per template, whole, when the manifest lists all its pieces and audio.ts plays templates.
  - **One `public/a/t/manifest.json`.**
    - Entries are `{ h, ms, on, off }`, plus `failed`.
    - Stale entries are dropped on load: a changed text, voice, model or finishing, or a missing file.
    - Split it per template once it passes about 500 KB. Year R is about 2,500 pieces, roughly 150 KB.
  - **The fluency repair is on by default** (`--tighten 100`). When no take gets its odd pauses under 150 ms, the best take's odd pauses are cut to 100 ms, in silence only, and the result is gated again. `--tighten 0` turns it off. Jonas's pilot decides whether it stays.
  - **The Whisper gate runs float32**, which is about 5× faster than int8 on Apple silicon.
  - **The first 16 templates** are the inventory's top 12 rows, the companions rows 1 and 2 need (`w_next_q`, `w_your_next_word`), and Jonas's two examples.
- **Pilot (SPT11), for whoever runs it:**

  ```
  doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-templates.ts --only w_say_slowly,s_say_the_sound,w_position_q,w_your_word,w_listen_again,ww_change,ws_way_we_spell --limit 20 --spread --root playtest/runs/speech-templates/pilot
  ```

  Then build the blind page for Jonas's ear. The Year R plan is 2,545 pieces (`--dry --unit R`).

  In the smoke run (27 Sep, 15 pieces, `playtest/runs/speech-templates/smoke/`), "Say sit slowly." and "Say mat slowly." kept an odd pause of 185–205 ms after 6 takes, at 1.4 words a second: Gemini acts out "slowly". That is Jonas's own example. A second run found takes under 150 ms within 4, and the repair cuts 255 ms and 215 ms pauses to 95 ms and 90 ms. Listen to these first.
- **Not built yet:**
  - the placeholder-cut lead-in (§1.6, pilot arm a);
  - the D splice repair;
  - the ECAPA voice-drift gate;
  - per-template `_index.json` with word timings;
  - the R2 master sync;
  - the listening pages.

## Demo choreography (27 Sep)

From the demo choreographer (docs/DEMO_CHOREOGRAPHY.md). The shared helper is built (`src/ui/SenseiDemo.tsx`: `senseiDemo()`, `<SenseiDemoLayer/>`, `cancelDemo()`), its 54 lines are recorded (`tv_demo_*`, the end of `LINES`), and a harness plays one full demo (playtest/demo/harness/). No scene uses it yet: every scene file belonged to the big fix's lanes today. These are for the follow-up (QUEUE item 0) and the owners named.

- **The shell (App.tsx, and every standalone Stage: IntroFilm, NavDemo, NinjaDemo, the treadmill's pages):** mount `<SenseiDemoLayer />` once inside the Stage, **right after the scene and before `<HelpButton/>` and `<NavLayer/>`** (updated 27 Sep, fix round). It is z 84: the same as the caption bubble, so the DOM order puts the paw over the scene's caption (a wide caption never hides the paw) and under the nav buttons (84, later) and the portrait (85). `display: none` when idle. Without it `senseiDemo()` still sequences the speech and the effect, with no paw.
- **Every scene's "I do" (Warmup.tsx, Early.tsx, Dojo.tsx, Battle.tsx, Swap.tsx, Sort.tsx):** replace `pawAt()` / `setPaw(answer); await sleep(1100)` / `DemoPaw` / `pawTap()` / `bt-paw` with `senseiDemo()` as DEMO_CHOREOGRAPHY §6 lays out, game by game:
  - the effect goes in `press` (it runs at the bottom of the press, never on arrival), the word or pure sound in `sound`, the model answer in `then`;
  - **no ninja move in a demo**: remove `rightAnswer()`'s strike, `gift()`, `fastHop`'s dash, `slowWord`'s cast, `readAlong`'s run, Early's `launch()`/`carry()` and `castSpelling()` from the I do paths (they stay on the child's own answers). Anything that travels in a demo (a tile to its line, a mini-card to its pocket, a word into its chest, a letter being written) travels on Sensei's magic: a copy of it flying on the same arc with her trail (a request below);
  - Show me again: pass the same options with `replay: true`, and `showSay: null` to `holdReady()` (the demo says "Of course. Watch my paw again." itself, and the paw comes out on "paw"); reset the demo's target first; `cancelDemo()` when a tap on an answer stops the replay;
  - `onWatch` → the ninja's watch pose (below). Until it lands: `(t, phase) => phase === "done" ? ninja.pose(null) : ninja.pose("listen", { face: t ?? "next" })`, as the harness does (`think`, a hand on the chin, read as puzzled);
  - **the board stays live through the names and the demo** (TEACHER_SCRIPT §0.1; DEMO_CHOREOGRAPHY T15): wrap the names and the demo in `demoTalk()`, call `demoPause()` between the names, and on a card tap before the turn light the card at once (Warmup's `earlyTap` spotlight and `sfx.tap()`) and call `demoTap([{ word: id }], { onSay: () => spot(id), onDone: () => unspot(id) })`: the word comes at Sensei's next pause and the demo carries on. This replaces Warmup's `earlyTap` "say it only if she's quiet" during a demo. Pass `clear` (the demo's result cleared after the calm beat) so a waiting word isn't said over a greyed-out row. Name only the cards the demo doesn't use (mechanics §5.4);
  - no `sfx.good()` in the demo's `press` (the success chime is the child's reward; it masked the word);
  - the lines that narrate a tap as it happens, or ask a question the paw answers, retire from the demo paths (§6: `tv_ears_demo`, `tv_so_i_tap`, `tv_guess_so_<w>` on the full form, `tv_ts_fast`/`tv_ts_slow` on the full form, `tv_squish_slow`/`tv_squish_fast`, `tv_which_demo`/`tv_which_so`, `tv_pocket_ido`, `tv_watch_write` in the Dojo lesson).
- **Battle.tsx (and the boss, the Gem Trial, Sensei's Challenge), first meetings:** the monster's crash-in (the drop, the boom, the shake) lands on the first line's start ("Oh no!"), not in silence before it, and `ninja.say()` (the "!" shout) goes from the entrance (DEMO_CHOREOGRAPHY T13). The first letter of the battle's demo flies to its line on Sensei's trail; the child's own letters keep the ninja's strikes.
- **Dojo.tsx New Sounds:** the letter is written by Sensei, after the words that announce it: `senseiDemo({ show: false, announce: [L("tv_demo_watch_write")], go: "write", target: <the space beside the petal>, press: () => showLetter() })`, then `tv_how_we_write`. Not the ninja's cast before "And this is how we spell it." (inventory §4.8).
- **Ninja.tsx (`ninja`):** a watch API for demos: `ninja.watch(target: Element | Pt | null)`: a curious, attentive pose (a new sprite `hero_<kai|suki>_watch.webp`: "the same character watching something closely with interest, hands relaxed, head turned, facing the viewer at three-quarters", until then `listen`; `think` reads as puzzled), turned to face the target with the small turn `pose(p, { face })` already has. It needn't follow the moving paw: the paw stops where it matters. `ninja.watch(null)` returns to rest. And `ninja.nod()`: a small nod (0.4 s, an idle-kind move) for the end of a demo. No effects, sounds or flames from either.
- **Art:** a painted `sensei_paw.webp` to replace the inline SVG (Sensei Maple's paw: a red panda's dark paw with four round toes, her red fur at the wrist, the green sleeve of her robe with its cream trim and a pink blossom, pointing up; the fingertip at the top centre; ink outline, the character layer's style; about 360 × 456 px, transparent). SenseiDemo.tsx's `PAW_SVG` is the reference.
- **ui.tsx (`fx`):** `fx.carry(el, to, { trail: "sensei" })`, or an export from SenseiDemo.tsx if preferred: a copy of `el` flying on the paw's arc with her trail, for the effects that travel (a tile to its line, a card to its pocket, a word to its chest). SenseiDemo.tsx exports `arcPath()` for it.
- **games.ts (the registry):** a `choreo` field per game: `{ rule: string; announce: string; target: "answer" | "row" | "chest" | "card" | "dots" | "tile" }`, so the scenes and the transcripts read one place (the ids are DEMO_CHOREOGRAPHY §5/§6).
- **bot.ts / sweep.ts:** while `__snState.scene === "demo"` (with `busy: true`), wait. The nav log gets `{ kind: "paw", id: "<demo>:<i>", via: "fly" | "press" }`. Checks worth adding to script-audit: `demo-unannounced` (a demo press with no `tv_demo_now_*` in the 4 s before), `demo-sudden` (a press within 400 ms of the end of the announcing line), `demo-ninja` (a ninja move between a demo's `rule` and `done` steps). `playtest/demo/inventory/` re-run with `--base` on a frozen build is the "after" measurement.
- **Audio, when the Gemini TTS quota resets** (it ran out on 27 Sep, and was still out at 13:05): retake `tv_demo_rule_tapall` (Whisper small and medium, and 3 of 3 of the judge's Gemini votes, hear "I say **as** sound"), `tv_demo_now_tap_sun` (W1's real demo line: "I'm **gonna**" in 2 of 3 votes) and `tv_demo_now_tap_ant` ("gonna" 3 of 3) with `doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-audio.ts lines --only tv_demo_rule_tapall,tv_demo_now_tap_sun,tv_demo_now_tap_ant --force`; keep a take only if it says "going to" / "a sound" (gen-audio's own judge passes "gonna"); then `uv run -q --with numpy --with praat-parselmouth --with faster-whisper python playtest/voice/qa.py --texts playtest/demo/audio/texts.json --ids tv_demo_rule_tapall,tv_demo_now_tap_sun,tv_demo_now_tap_ant --words tv_demo_now_tap_sun,tv_demo_now_tap_ant --out playtest/demo/audio/qa.json --merge` (the two announcements need new word timings: the paw sets off on their "now") and `bun playtest/demo/audio/durations.ts`. The takes they replace are in `.trash/demo-choreography/*.before-fix2.mp3`. And a BATH round for `tv_demo_now_last_sound` ("last" 15/21 British; `scripts/accent-judge.ts tv_demo_now_last_sound --features bath`; keep the best).
- **line tags (outside this lane's files):** the 54 `tv_demo_*` ids were appended to `src/core/content/line-tags.ts` by `playtest/demo/audio/tags.ts`, which this lane was not given. They are left in place (without them the tag check fails for 54 recorded lines); **the file's owner should review the block and keep it or move it.** `content 6b` still fails, on the read slider's `rs_*`/`pr_*` lines, which have no tags yet (not mine).
- **TEACHER_SCRIPT / lines.ts (`tv_ready_first`):** after a demo that ends on "Look!", the save's first Ready question opens "Look, your ninja is ready…" about 2.8 s later: two "Look"s. When the demos are wired, drop the "Look," there (a re-record: "Your ninja is ready. Are you ready too? Tap the green arrow."), or use it only where the demo's action didn't say "Look!".
- **Word timings for `tv_show_again`** (not a `tv_demo_*` line): `qa.py --words tv_show_again` would give it a `words.json`, so the replay's paw comes out on the measured "paw". Until then SenseiDemo times it from the clip's own pauses (2.06 s; Whisper: 2.02 s).

## Picture reading v2 and the read slider (27 Sep)

From the read-slider workflow (fix round 1: 27 Sep, 14:00). The design is docs/PICTURE_READING.md (the W2, W4 and W6 scripts: §3–§5; Reward 2 and the save: §7); the mechanic is docs/READ_SLIDER.md. **TEACHER_SCRIPT has no §10 yet** (earlier drafts of this section said it was appended; it is not in the file): its text is `docs/read-slider/teacher-script-10.md`, to append as §10 (under Docs, below). Row ids (S1, T1, P3, D7…) are docs/read-slider/fishdog-inventory.md's. **The reference implementation of W2's flow is the harness**, `playtest/read-slider/main.tsx` `compound()`, with videos in docs/read-slider/videos/.

**Ready to use (new files, nothing to merge):** `src/ui/ReadSlider.tsx` (+ `src/styles/read-slider.css`, `src/ui/read-slider.test.ts`, 20 tests, `bun test ./src/ui/read-slider.test.ts`); the ninja's bow, `public/a/i/hero_kai_bow.webp` and `hero_suki_bow.webp` (27 Sep, fix round 2; see "F1: `src/ui/poses.ts`" below); `src/content/compounds.ts` (`COMPOUNDS`, `COMPOUND_BY_ID`, `FIRST_MEETING`, `SECOND_MEETING`, `SHINY = "rainbow"`, `RENAMED_STICKERS`, `W2_STICKERS`, `NEW_WORDS`, `NEW_SLOW_TIMES`); 21 pictures `public/a/i/pic_<w>.webp`; 17 word clips `public/a/w/` and 18 slow words `public/a/x/`; 47 lines in the block "// --- Picture reading v2 and the read slider (27 Sep)" in `LINES` (no longer the last block: the demo choreography's follows it), recorded in `public/a/l/` with their `.words.json`.

**Ship in one release, in this order** (inventory §10): (1) F1's migration, B1's `firstW2`, the cheat constants and F4's sweep save; (2) C2's W2, W4 and W6 on the slider, B1's map icon, B4's Reward 2, F2's retirements and tags; (3) the follow-up's content lists; (4) only then P1–P26 move to `.trash/`, and their `LINES` and `RETIRED_LINES` entries go with them. **Then run inventory §10's check**, which is now a command with its standing exceptions (the rename map, the migration, the new block's comment).

### C2: `src/content/warmups.ts` (S1)
- **A `slide` beat** in place of `rail`, `swap`, `which` and `compound` (and `dots`). The fields that matter (PICTURE_READING §3.1): who drives it (`by: "sensei" | "child"`), the compound ids (or the sound word for sounds), the lead-in line, `gag: true` for Sensei's backwards show, `ready` for the hold before the child's turn. Suggested:
  ```ts
  | { kind: "slide"; by: "sensei"; compound: string; frame?: LineId; lead: LineId; gag?: true; fast?: "rabbit" | "auto" }
  | { kind: "slide"; by: "child"; compounds: string[]; ready?: LineId }
  | { kind: "slide"; by: "sensei" | "child"; sounds: string | string[]; demo?: string; lead?: LineId }
  ```
- **W2** (both versions) per PICTURE_READING §3.1: `stickers: [...W2_STICKERS]`, `list: "pr_rw2_list"`, `shiny: SHINY`, and a new field `shinyLine: "pr_rw_shiny"` (so the next change needs no scene edit). The beats: Sensei on rainbow (frame `pr_frame`, lead `pr_demo`, `gag: true`); the child on snowman and cupcake (`ready: "tv_squish_ready"`); ◇ Sensei's sound bridge on mop (`pr_sounds_too`); the Pocket Hunt ◇ with `cards: ["sunflower", "sock", "cake", "bow"]`; the close.
- **W2 Reception version:** the same, with the mop bridge **not optional**, `pr_last_word` · `pr_what_cupcake` after cupcake, and its own /a/ Pocket Hunt last. `schoolBudget.R`: target 125, cap 140.
- **W4** per PICTURE_READING §4: `stickers: ["coat", "raincoat", "foot", "ball", "football"]`; Sensei's canonical rainbow demo (`fast: "auto"`, no gag), the child on raincoat (then Sensei's `coatrain` gag) and football, ◇ treehouse, `done: ["pr_w4_done"]`.
- **W6**: `{ kind: "slide", by: "child", sounds: ["cat", "bus", "mug"], demo: "sun", lead: "pr_sounds_demo" }` (PICTURE_READING §5).
- Delete `WHICH_DEMO`, `SQUISH_DEMO` and `rail.silly`. `warmupPictures()`: a slide's parts and wholes (`COMPOUND_BY_ID[id].parts`, `id`), its sound word, and `reverse.pic` for a gag beat (`pic_bowrain`, `pic_coatrain`). `CHILD_KINDS` and `beadsOf`: a child's `slide` is one bead per compound or word.

### C2: `src/scenes/Warmup.tsx` (S2)
- **Render `<ReadSlider>` for a `slide` beat**, one per compound, `key` = its id: `items = COMPOUND_BY_ID[id].parts.map((w) => ({ kind: "word", w }))`, `mode: "words"`, `whole: id`. Sounds: `segs.map((p, i) => ({ kind: "sound", p, word, i }))` (`WORD_BY_TEXT[word]?.segs.map((s) => s.p) ?? ORAL_WORDS[word].segs`), `mode: "sounds"`.
- **Sensei's beat** (A–C), as `compound()` in the harness does it (`sayAt` / `sayDemo` there: a line, and an action on one of its words from `public/a/l/<id>.words.json`):
  1. `say(pr_frame)`; on its word "this" (`pr_frame.words.json`), `readSlider.cue()` (the start dot and the arrow pulse, a light runs the rail left to right) and the ninja's run along the rail left to right, a smoke puff at the right-hand end, back home in a puff (the ninja's run is the scene's: Ninja.tsx has no dash yet). **When W2 follows Reward 1's `tv_rw_next`** (the first meeting), PR15 proposes the cue and the run silently as the rail lands, then straight into step 2 (see "Timing" below).
  2. `say(pr_demo)` ("Two little words can make one long word. I'll read this one slowly first. Watch my paw..."), and **on its word "Watch" call `slideDemo()`** (do not await it before the line ends): the slider's own paw (Sensei's red panda's paw) comes out of her portrait, lands on the tortoise, waits for her to finish, presses and slides. **Do not also run `senseiDemo()` for this beat** (it would put a second paw on screen: the slider's paw is DEMO_CHOREOGRAPHY's requested flight from her corner). The slider is mounted with `demo`, `fast: "rabbit"`, `rabbitAsk: "rs_now_fast"`. The child taps the rabbit (`onDone`).
  3. Full form only: `say(pr_demo_back)`, and on its word "watch" `slideDemo({ backwards: true, gag: COMPOUND_BY_ID.rainbow.reverse.pic })`; await both, then `say(pr_back_rainbow)` with `readSlider.home({ whole: true })` on its word "We" (`pr_back_rainbow.words.json`: 3.16 s; her paw then rides the rail left to right and goes home). The ninja: `think` as the tortoise walks back, then a laugh on "Bow rain!".
- **Timing (PICTURE_READING §3.2 and PR15, proposed 27 Sep).** The read-slider judge measured both of W2's watching runs at about 14 s: 14.2 s from `pr_frame` to `rs_now_fast`, and 13.96 s from the demo's rabbit tap to `tv_squish_ready`. The re-run gives 14.4 s from the lesson's ▶ and 13.8 s. TEACHER_SCRIPT §0.1 allows about 12 s. Jonas asked for slow, explicit demos, so `pr_demo`, the paw's slow slide and the backwards show stay as they are, and the scene's half of the cut is this:
  - after `tv_rw_next`, no `pr_frame`: the rail's cue and the ninja's dash run silently as the rail lands, then `pr_demo` (−1.89 s; `pr_frame` stays when W2 is entered any other way);
  - the first line starts as the rail starts to slide in, not after a mount-and-350 ms wait (−0.45 s);
  - 350 ms, not 700, after the child's [rainbow] before `pr_demo_back` (−0.35 s);
  - the Ready's ▶ pops in on `pr_back_rainbow`'s "We" (3.16 s in, with `home()`), not after the line and a 300 ms wait (−1.9 s). A tap on ▶ during the line's end lets "…start on this side." finish, skips `tv_squish_ready`, and goes to `rs_how`.
  The slider's half is four constants in `ReadSlider.tsx`: `PAW_MS.hover` 0 for the forward demo, the rabbit's beat 300 ms (not 700) when the slider has `demo`, `quiet(0)` before the backwards walk, and no part gap after the backwards show's last part. That half is the read-slider workflow's, and it lands with the scene's so the harness (the reference) and the game change together. The result is 11.4 s and 11.0 s. If Jonas wants the spoken frame kept, keep `pr_frame` and use tomorrow's 3.8-flash re-take of `pr_demo` (F2, below) instead: about 11.9 s.
- **Show me again** in the child's turn: B only (`tv_show_again` in place of `pr_demo`, with `slideDemo()` called on its word "paw", `fast: "auto"`), never C.
- **The child's beat**: the Ready hold with `tv_squish_ready`, then per compound `rs_how` (the save's first slide) or `pr_another`; `rabbitAsk: first ? "rs_now_fast" : null`; `coachSpeed: true`; after the save's first fast word `rs_praise_1` (later sessions rotate `rs_praise_2`, `rs_praise_3`, `tv_fs_praise_both`: §9.5, each at most once a session). **Praise only when `onDone`'s `how === "tap"`** (the child made the fast word); after `"timeout"` Sensei has said it herself, so no praise line.
- **The ninja**: the slider sets `listen` during the slow way and `cheer` on the child's rabbit tap. Optionally, on a child's fast word, one straight dash along the rail left to right, then `fx.puff` away and back home with no visible return. Remove the rail's per-card hops, `swapShow()` and its leapfrog, the `which` rows, the fish-dog merge and `tv_silly`.
- `childRight()` and `merge()`: `LIVING.has(w)` only (drop the `fishdog`/`dogfish` literals); `merge()`'s doc example "rain + bow → the rainbow".
- The slider publishes `window.__snState` (`scene: "slider"`, READ_SLIDER §9) and honours nav holds and the upright phone itself.

### Demo choreography lane: `src/ui/SenseiDemo.tsx`
- **Export `PAW_SVG`** (today `const PAW_SVG = (…)`, about line 604). `ReadSlider.tsx` has a copy (`SENSEI_PAW`, with the comment saying so); once it is exported, ReadSlider imports it and drops the copy (one Edit in ReadSlider: `import { PAW_SVG } from "./SenseiDemo"`, and render it at `PAW_K` 0.95 by wrapping it in a `scale(0.79)` box, or add a `size` prop). The slider's paw leans +8° and rests on the back of the tortoise's shell, so a slide demo shows the tortoise's head and shell.
- `tv_show_again` ("Of course. Watch my paw again.", this lane's line, which the slider's Show me again uses): the read-slider judge's warmth listen (27 Sep, 8 votes) gave it 3.0/5, and 5 of 8 said a child would feel told off ("curt and impatient"). Worth a re-take through `playtest/read-slider/audio/retake.ts`'s warmth gate (it takes any line id).
- DEMO_CHOREOGRAPHY §6's row for Ninja Reading ("request its first move to be SenseiDemo's flight from her corner to the tortoise") is done inside the slider (READ_SLIDER §5); the row's quoted `pr_demo` text is now "Two little words can make one long word. I'll read this one slowly first. Watch my paw...".

### C2: `src/styles/warmup.css` (S3)
- The comment "A merged picture (the fish-dog) bounces with joy" → "A picture word (the rainbow) bounces with joy". Drop the rail, swap and which styles once nothing uses them.

### C1: `src/scenes/Early.tsx` (S4)
- The comment "(the fish-dog)" → "(the starfish)".

### B1: `src/App.tsx` (S6)
- `KIND_ICON.picread: "pic_rainbow"`.
- `StickerRoute`'s `firstW2`: `!s.shiny?.includes(WARMUPS.W2.shiny!)`, not the literal (it keeps working through F1's rename).

### B4: `src/scenes/Stickers.tsx` (S7)
- Reward 2 takes W2's new `list` (`pr_rw2_list`), `shiny` and `shinyLine` from `WARMUPS.W2`: replace `say({ line: "fm_rw_shiny" })` with `say({ line: WARMUPS.W2.shinyLine })`, and the /s/ question `fm_rw2_s` with `pr_rw2_s`.
- The landings read `WORD_TIMES[p.list]`; until the follow-up adds them (below), these are the onsets from the `.words.json` files: `pr_rw2_list` [0.02, 1.22, 2.2, 2.81, 3.54, 4.62, 5.22, 6.2] (rain … cupcake); `pr_rw_shiny` "Rainbow" at 1.93; `pr_rw2_s` sun 0.04, sock 1.56, sausage 2.13, snowman 3.36.
- Comments: "the shiny sticker". The counter goes 5 → 13, and 14 with the shiny rainbow.

### F1: `src/engine/store.ts` (S5)
- `migrate()`: inventory §6's `renameStickers` step with `RENAMED = { fishdog: "rainbow", dogfish: null }` (the same map as compounds.ts `RENAMED_STICKERS`, written out here), run on every load **before** the early return, safe to run twice. The four tests in §6, plus one that the literal equals `WARMUPS.W2.shiny`. The `Save.stickers` and `Save.shiny` docs name "rainbow".

### F1: `src/ui/poses.ts` (the bow art, 27 Sep)
- **The art is in:** `public/a/i/hero_kai_bow.webp` (613×864) and `hero_suki_bow.webp` (549×877), new files. Every harness run had 404'd on them since the big fix's `ninja.act("bow")`. The probe now finds them, so `bow` stops falling back to `ready` and the move's own-art branch (Ninja.tsx `bow`) plays. It shows a dojo bow (rei) facing right, the ninja's fists pressed together in front of the chest and the face visible, made as `gen-hero-moves.ts` makes a move pose: image-to-image from the raw idle, its KEEP / SPRITE / NO_FX / STYLE prompt, rembg isnet-anime, trimmed with a 6 px pad, and exported at the idle sprite's own pixel scale (×0.899 of the raw, WebP q86). I picked them by eye at game size beside `ready`, `cheer` and `think` from 12 candidates for Kai and 16 for Suki, and checked them in the real move. The raws, cuts, prompts and sheets are in `docs/read-slider/art/bow/` (`picks.json`).
- **Add `bow: 0.915` to `TWEAK`** (one line). `poseFit()` sizes a pose by its painted area. A bow folds the arms over the chest, so it covers less than a standing pose and is drawn 8–10% larger than idle: ×1.084 for Kai and ×1.102 for Suki, against ×1.00 ± 0.01 for `ready`, `think` and `listen`. In the move, the bowing ninja visibly grows and its head rises above its standing height. With 0.915 both land within 1% (×0.992, ×1.008). This is the same fix as `flip: 0.9`. Every candidate that clearly bowed measured ×1.08–1.15; the ones at ×1.03–1.04 barely bowed.
- The file's header comment ("`bow` … has no art yet …, facing the viewer") becomes: "`bow` (a ninja's rei, docs/TEACHER_SCRIPT.md §2.3): hero_<kai|suki>_bow.webp, a dojo bow facing right with the fists together (27 Sep; TWEAK 0.915: a bow covers less than a standing pose)". HERO.md's "Sprites" paragraph gets `bow` (→ `ready`) in the move poses and their fallbacks. `gen-hero-moves.ts` has no `bow` in `MOVES`: Suki's pick is an edit of Kai's, which the script can't make, so the provenance is `picks.json`.

### F2: `src/content/lines.ts`, `games.ts`, `src/core/**`, `public/a/l`, `durations.json` (S8–S13)
- **`RETIRED_LINES`**, "retired: picture reading v2 (27 Sep)": `fm_read_fish_dog`, `fm_pair_fish_dog`, `fm_l2_swap`, `r2_dog_fish`, `tv_silly`, `fm_rw2_list`, `fm_rw_shiny`, `fm_rw2_s`, `tv_rail_frame`, `tv_rail_ido`, `tv_rail_ready`, `tv_rail_turn`, `tv_rail_start`, `tv_rail_again`, `tv_rail_yours`, `tv_which_frame`, `tv_which_demo`, `tv_which_so`, `tv_which_again`, `tv_which_q_cat_dog`, `tv_which_fix_cat_dog`, `tv_which_q_fish_dog_cat`, `tv_which_fix_fish_dog_cat`, `fm_pair_cat_dog`, `fm_read_cat_dog_fish`, `fm_triple_cat_dog_fish`, `fm_triple_fish_dog_cat`, `fm_l4_swap`, `tv_squish_frame`, `tv_squish_slow`, `tv_squish_fast`, `tv_squish_again`, `fm_starfish_q`, `fm_starfish`, `tv_praise_squish`, `fm_rainbow_q`, `fm_rainbow`, `fm_snowman_q`, `fm_snowman`, `tv_w4_done` (`fm_which_three` is already there, "retired on these paths"; "on these paths" for `fm_name_rain`, `fm_name_bow`, `fm_name_snow`, `fm_name_man` and `fm_name_star` if nothing else calls them). **Keep:** `tv_squish_ready`, `fm_tap_rabbit`, `tv_fs_now_fast`, `tv_fs_fast_rabbit`, `tv_show_again`, `tv_ready_go`, `tv_next_game`, `fm_l2_done`, `tv_rw_link_book`, `tv_dots_frame`, `t_if_you_say_sounds`.
- **`tv_map_replay_picread`**: the text becomes "Do you want to play Ninja Reading again?", and its clip is `public/a/l/pr_map_replay.mp3` (recorded and QA'd with that text) copied over it, or re-recorded.
- **`games.ts`** (S10): `rail` becomes the slider game "Ninja Reading" (`mech:left-to-right`; full: frame `pr_frame`, demo `pr_demo`, ready `tv_squish_ready`; recap `pr_recap`; short `pr_short`). `which` and `compound` go. `dots` becomes "Sound Slider" (frame `tv_dots_frame`, demo `pr_sounds_demo`, hand-over `rs_sounds_with_me`).
- **`src/core/content/line-tags.ts`** (S12): the 47 `rs_*`/`pr_*` entries are **already appended** (by `playtest/read-slider/audio/tags-merge.ts`, my ids only, as the demo lane did for `tv_demo_*`), because `content.test.ts` 6b failed without them. Drop the retired ids' tags with their lines; refresh `tv_map_replay_picread`'s hash when its text changes. **Fix round 1 changed three texts**, so refresh the `hash` of `rs_back_2`, `rs_start_here` and `pr_demo` (the values are in `docs/read-slider/line-tags.json`; or run `bun playtest/read-slider/audio/meta.ts && bun playtest/read-slider/audio/tags-merge.ts`, which rewrites only the read-slider ids' entries). Nothing fails meanwhile: content 6b checks `missing`, not `stale`.
- **`src/core/content/line-tags.draft.ts`** (S13): in the same change as the `RETIRED_LINES` entries, delete the draft entry (each a `"<id>": { … },` block) of every id in that list that has one. The eleven with fish or dog in them are `fm_l2_swap` (line 1051), `fm_pair_fish_dog` (1444), `fm_read_fish_dog` (1476), `fm_rw_shiny` (1567), `r2_dog_fish` (2752), `tv_silly` (10422), `tv_which_fix_cat_dog` (11555), `tv_which_fix_fish_dog_cat` (11569), `tv_which_q_cat_dog` (11597), `tv_which_q_fish_dog_cat` (11611) and `tv_which_so` (11625). (An earlier version of this bullet kept `fm_rw_shiny` and `tv_which_so`, but both are in the `RETIRED_LINES` list above. They retire with the rest, because their last callers, Stickers.tsx's `say({ line: "fm_rw_shiny" })` (B4, S7) and games.ts's `which` (S10), change in the same release.)
- **The r2 block's comment** (lines.ts line 551, S9): "Re-audit r2 fixes (26 Sep): whole sentences for a merged picture said again once it is clean (the dog-fish), and the battle reward naming more than one gem." names the dog-fish. When `r2_dog_fish` leaves `LINES` with its clip (P5, step 4 above), the comment becomes "// --- Re-audit r2 fixes (26 Sep): the battle reward naming more than one gem. Owned by the re-audit r2 fix pass; edit only this block." Until then it is one of the §10 check's exceptions.
- **`public/a/durations.json`**: rerun `scripts/gen-durations.ts` (it picks up the 47 line clips, 17 words and 18 slow words); the same values are in `docs/read-slider/durations.json` (fix round 1's seven retakes included).
- **Seven clips were re-recorded on `gemini-3.8-flash-lite-tts`** in fix round 1 (`rs_praise_1`, `pr_what_treehouse`, `pr_w4_done`, `pr_demo`, `rs_back_2`, `rs_start_here`, `pr_frame`): the shared key's `gemini-3.8-flash-tts` quota (10,000 requests a day) ran out at 13:20 BST. Same voice (Erinome, en-GB), the same finishing and gates as gen-audio, plus the calibrated accent judge and the warmth listen (TEACHER_SCRIPT §10.3's table, in `docs/read-slider/teacher-script-10.md`). When the quota is back, re-take them on `gemini-3.8-flash-tts` with the same gates: `MODEL=gemini-3.8-flash-tts doppler run -p os-legacy-2026-04 -c dev -- bun playtest/read-slider/audio/retake.ts rs_praise_1 pr_what_treehouse pr_w4_done pr_demo rs_back_2 rs_start_here pr_frame`, then `--install`, then `qa.py --words` for `pr_demo` and `pr_frame` (the harness and C2 time actions on their words), or keep the lite takes if Jonas's ear prefers them.
- `feedback.ts` (S8) and `src/core/types.ts` (S11): the comment examples say "rain + bow → rainbow".

### F4: `scripts/treadmill/bot.ts`, `sweep.ts`, `script-audit.ts` (T1, T2)
- **`bot.ts` `step()`**, the slider (READ_SLIDER §9): `scene === "slider"` and not `busy` → `next === "drag"`: a touch drag from `from` to `to` (stage px through the `.stage` rect), or `window.__snSlider.drag()`; `next === "rabbit"`: tap `rabbit`. Personas: a flick (`drag({ ms: 150 })`), a backwards swipe first (`drag({ from: to.x - 20, to: from.x + 120 })`), taps on the cards in order.
- **`sweep.ts`**: the `picread` brief → "the child slides the tortoise left to right under two pictures; each part is said as the tortoise reaches it; the rabbit's tap says the whole word; a right-to-left slide reads nothing and gets a gentle line". The `book-stickers` save uses `"rainbow"`.
- **`script-audit.ts`**: the `which` game's expected lines go; the slider game's are `pr_frame`, `pr_demo`, `tv_squish_ready`, `rs_how`.

### The follow-up (content lists; not in §2)
- **`src/content/phonics.ts` `ORAL_WORDS`** (S14): remove `fishdog` and `dogfish` (lines 265–266), and the comment above them (line 258: "// first minutes (docs/FIRST_MINUTES.md): Lesson 1 and 2 pictures, the compound words and the fish-dog gag") becomes "// first minutes (docs/FIRST_MINUTES.md): Lesson 1 and 2 pictures and the compound words"; add compounds.ts `NEW_WORDS` without its two `gag` entries (they are ORAL_WORDS-shaped: `pic`, `first`, `segs`, `living`). Then rerun `gen-slow-words.ts` for them, and `NEW_SLOW_TIMES` (and ReadSlider's fallback to it) can go.
- **`src/content/living.ts`** (S15): drop `fishdog` and `dogfish`; add cowboy, fly, butterfly, lady, ladybird, jellyfish, hedgehog and seahorse.
- **`src/content/word-times.ts`** (S16): drop the retired ids; add `pr_rw2_list`, `pr_rw_shiny` and `pr_rw2_s` from their `.words.json` (the values are under B4 above).
- **`src/content/pic-names.ts`** (S17): rerun `scripts/treadmill/pic-audit.ts` and `pics-to-content.ts` over the 21 new pictures (and rain, after the redraw).
- **`src/content/pic-plates.gen.ts`** (S18) and `scripts/gen-pic-plates.py` (T3): rerun it (the new pictures use the sky plate until then), dropping `fishdog` from `FLOATING`, and give the slider's neighbours different plates: rain/bow, snow/man, cup/cake, rain/coat, foot/ball, tree/house. In `PLATE_OVERRIDE` (line 26) drop `"dog": "lilac"` (it kept dog apart from fish on the old rail) and add the pairs' overrides, e.g. `"bow": "lilac"`, `"man": "lilac"`, `"cake": "lilac"`, `"coat": "lilac"`, `"ball": "lilac"`, `"house": "lilac"` (the first part keeps its computed plate).
- **`src/content/slow-times.gen.ts`** (S19): its `dogfish` (line 214) and `fishdog` (line 279) entries go when `scripts/gen-slow-words.ts` is rerun after `ORAL_WORDS` loses the two words (above) and P15–P16 (`public/a/x/fishdog.mp3`, `dogfish.mp3`) have moved to `.trash/`. Generated: don't hand-edit it.
- **`scripts/art-manifest.ts`** (T4): art jobs for the 21 new pictures (the prompts are compounds.ts `NEW_WORDS[w].pic`; the raws are `playtest/read-slider/art/raw/<w>_<k>.png`, the picks are in PICTURE_READING §9.1). And the `PLATE` mirror of T3 (lines 129–135): the doc comment's "(fish and dog on the reading rail, sun and sunflower, star and starfish)" → "(the read slider's neighbours, rain and bow, snow and man…; sun and sunflower, star and starfish)", and `PLATE` itself the same change as `PLATE_OVERRIDE` above (drop `dog: "lilac"`, add the pairs).
- **Replace `public/a/i/pic_rain.webp`** with `docs/read-slider/art/pic_rain.webp` (and `assets-src/art/pic_rain.png` with `docs/read-slider/art/pic_rain.png`). Today's rain is named "cloud" by the picture audit; the redraw is named "rain" 3 of 3, and rain is the first part a child hears on the slider.
- **`pic_sea`** (named "wave") needs a redraw with a better prompt; this workflow's four came back as buckets and a labelled tile. Only the reserve's seahorse uses sea.

### The cheat menu (S20–S23) and map-and-confirm (S24, S25, D14, D15)
- Every `"fishdog"` becomes `WARMUPS.W2.shiny`; the toggle label "Shiny sticker (W2)"; the Reward 2 jump's note "the shiny sticker, the first petal".
- **`src/scenes/ConfirmDemo.tsx`** (S24), all four places: line 8's comment "(tv_map_replay_<kind>: the fish-dog game, First Sounds, Sound Swap, the story)" → "(tv_map_replay_<kind>: Ninja Reading, First Sounds, Sound Swap, the story)"; lines 40 and 41, `img("pic_fishdog")` for `replay` and `replay-map` → `img("pic_rainbow")`; line 90, the demo map's picread stone `icon: "pic_fishdog"` → `icon: "pic_rainbow"`. `confirm.test.ts` (S25): the stone `/a/i/pic_rainbow.webp`. The map mockup's `KIND_ICON.picread` and its `tv_map_replay_picread` text.

### Docs (the integration step)
- TEACHER_SCRIPT §3.7, §3.8, §3.10 and §3.12 are superseded by §10 (read §10.1). FIRST_MINUTES §7 and §8 (the count 5 → 13 → 14), NAVIGATION, CONFIRM, CHEATS, MAP_DESIGN, ART_STYLE and `docs/architecture/*` per inventory D1–D15.
- DECISIONS: PR1–PR15 (PICTURE_READING §10; PR15, the timing proposal, once C2 takes it) and RSL1–RSL13 (READ_SLIDER §11). HERO.md's "Sprites": `bow` (see F1, `poses.ts`, above).
- The live clips and the showcase (X2–X5): reshoot picture reading from the harness or the game once v2 ships.
- **TEACHER_SCRIPT §10**: append `docs/read-slider/teacher-script-10.md` as `## 10.` (it points to PICTURE_READING and READ_SLIDER for the beats, lists the rows it replaces in §3.7, §3.8, §3.10 and §3.12 and §7's tables, and the 47 lines with their clip numbers). Then the §3.7/§3.10/§3.12 rows that name fish or dog get a "superseded by §10" note.

### The orchestrator: public copies and local kits (X2, X3, X5; they act on Jonas's Cloudflare account or on other workflows' files)
- **X2, the tweet kit on R2** (bucket `superninja-share`, prefix in `assets-src/tweet/2026-09-26/r2-prefix.txt`: `tweet-2026-09-26-<private-prefix>`): `fish-dog.mp4` and `fish-dog.jpg` still answer 200. Delete them: `npx wrangler r2 object delete superninja-share/tweet-2026-09-26-<private-prefix>/fish-dog.mp4 --remote` and the same for `fish-dog.jpg` (Jonas's personal account, via Doppler as `upload-kit.sh` does). Then `assets-src/tweet/2026-09-26/tweet.md` line 20: "The fish-dog clip is withdrawn: fish-dog is being replaced in the game (too close to Mentava)." → "The picture-reading clip is withdrawn while the game changes." (the public file must not name Mentava), and re-upload `tweet.md` with `upload-kit.sh`'s `put` (the zip has no fish-dog).
- **X3, the tweet kit locally** (`assets-src/tweet/2026-09-26/`): move `fish-dog.mp4`, `fish-dog.jpg`, the folder `fish-dog/` (`cut.ts`, `drive.ts`, 24 raw takes) and `recipe-tests/fish-dog.{jpg,master.mp4,master.wav,mp4,sheet.jpg,timeline.json}` to `.trash/tweet-2026-09-26-fish-dog/` (never `rm`). In `clip-recipes.ts` remove the `fish-dog` recipe (the object from `{` on line 136 to `},` on line 149, `name: "fish-dog"`, which waits for `fm_pair_fish_dog`) so no kit rebuild picks it up.
- **X5, the showcase on R2** (`playtest/showcase/index.html`, uploaded by `playtest/showcase/upload.sh` to `superninja-share/showcase-2026-09-27-<private-prefix>/`, the prefix in `playtest/showcase/.r2-prefix`): until v2's clips exist, delete the "Picture reading" `<section>` from `index.html` (the one whose caption is "left to right: fish… dog → fish-dog", with `clips/picread-1..3`), re-upload `index.html`, and delete the six objects `clips/picread-{1,2,3}.{mp4,jpg}` under that prefix with `npx wrangler r2 object delete … --remote`. Move the local `playtest/showcase/clips/picread-*` to `.trash/showcase-picread-2026-09-27/`. When v2 ships, the section comes back with X4's new clips and the caption "left to right: rain… bow → rainbow".
- (added 27 Sep, the checker's two missed fish-dog comments) `src/cheat/jumps.ts` line 251: the `firstReward()` doc comment "the shiny fish-dog …" becomes "the shiny rainbow …". `src/cheat/actions.test.ts` line 60: the test title "…and the shiny fish-dog, no letters" becomes "…and the shiny rainbow, no letters". Also, S17: `pics-to-content.ts` rewrites all of `pic-names.ts` from one run, so run it over EVERYTHING after S14, P1 and P2, not just the 21 new pictures.

## B2 note (27 Sep): SCROLL_DESIGN.md v2 is released
- It is final, with the heart-number and gem-meter fixes (§3.2, §3.5, §7, §8.6). Two orchestrator notes were added at 11:30 in §7.5 (the `.dsc` class) and §8.6 (how to run the vision checks on the game rather than the mockup). If you started from an earlier copy, re-read §3.2, §3.5, §7.5, §7.8 and §8.6.

## Baron final only: the interim swap (27 Sep)

**Jonas (27 Sep), verbatim:** "I don't really understand one thing, which is how we have a video of a battle with Baron Muddle, with the final super boss, with like super simple words in it. That should be the final, final battle with really hard words always."

**Why it happens today.** The Sky Temple's boss, `w6-11`, is `boss_baron`, fought over unit 12's words, and the finale (the reformed Baron, the flower in bloom) plays after it. So every video of the game's last fight shows the Baron losing to Year 1's first words. Checked on the footage: the trailer's "THE FINAL SHOWDOWN" (`tr_boss_baron.mp4` at 24.6 s) shows him beaten with *beg*, a Reception word, and the enemy supercut's last block (40–42 s) with *coat* and *tea*. The design is now "the Baron is fought once, in the final battle at Muddle Castle, with the hardest words" (docs/MIDGAME_ENDGAME.md, R.3 and §2.5.3). Until the Muddle Isles exist there is **no Baron fight in the game at all**.

**What this section is.** The smallest safe change that makes `w6-11` stop being a Baron fight, for the follow-up workflow to do **first** (docs/QUEUE.md item 00), right after the big fix's integration and before Slice 1b. It keeps today's boss kit: a longer spelling battle over the land's words, no phases and no Word Dragon (those come with 1b, docs/midgame/BUILD_PLAN.md §5). Rules: never `rm` (move to `.trash/`), no `cd … &&` chains, never ask or wait (decide and log in docs/DECISIONS.md), British English, don't commit unless the brief says so.

### What the child gets

1. **`w6-10`, the story "The Last Petal"**: the same, except its last page. The Baron no longer gives the petal back and the flower no longer blooms: he grins, whistles, and "something big and shiny swooped down from the temple roof…". That sets up the fight.
2. **`w6-11`**: the Baron's cut-in (his portrait, thunder, his own voice) introduces her: "Mwa-ha-ha! Meet my Sky Magpie, little ninja. She'll steal every gem you know!" The **Sky Magpie** lands (the boss entrance as today), squawks "You want my gems? Come and get them!" in a caption bubble, and the fight is today's boss battle over the Sky Temple's words (9 words, `hp: 9`). The Baron's random taunts still cut in, as in every boss fight. At half health the **Magpie** roars ("Squawk! Hands off my shiny gems!"), not the Baron's "You dare to fight ME?".
3. **The knockout**: the Magpie spins off into the sky ("My lovely gems! Oh, all right, take them."). Then, **the first win only** (once per save), the Baron's balloon rises into the top right: "Did you think I'd turned nice? Mwa-ha-ha! It was a trick! I've still got the rarest gems!", then "Catch me if you can, little ninja! My Sky Isles are full of spellings you've never seen!", and the balloon drifts up and away. Sensei: "He tricked us! Don't worry. We'll follow his balloon to the Sky Isles soon." A replay ends as every other boss does, with the Baron's "Nooo! My muddle! … I will be back!".
4. **The reward**, then the map of the Sky Temple. **No finale.** The finale film (`Intro.tsx`, `/a/v/finale.mp4`, `baron_final`) is kept, untouched, for the real end: the cheat menu's "The finale" jump still plays it.

### The changes, file by file

| # | File | Change |
|---|---|---|
| 1 | `src/content/worlds.ts` `WORLDS` (world 6) | `L(6, 11, "boss", { units: [12], monster: "boss_magpie" })`. The id stays `w6-11` (saves keep stars by id). Comment above it: "// the Sky Magpie: the Sky Temple's guardian. Baron Muddle is fought once, in the final battle (docs/MIDGAME_ENDGAME.md R.3)" |
| 2 | `src/content/worlds.ts` `MONSTER_INFO` | add `boss_magpie: { hp: 9, facing: "left", scale: 1.5 },` after `thunder_drum`. **Keep `boss_baron`**: the cheat menu, the trailer's recipes and the final battle use it, and `scripts/check-assets.ts` checks every entry's `mon_<id>.webp` |
| 3 | `src/content/worlds.ts`, new export | `/** The final battle's level id: the finale plays only when it is first won. null until Muddle Castle exists (MIDGAME_ENDGAME §2.2). */ export const FINALE_LEVEL: string \| null = null;` and `export const TRICK_LEVEL = "w6-11";` ("the first win here plays the Baron's escape, once per save") |
| 4 | art (**done**, new files) | `public/a/i/mon_boss_magpie.webp` (720 × 733, faces left) and `public/a/i/baron_balloon.webp` (520 × 704: the Baron in his balloon, facing left, waving a sack of gems). Raws, picks and the cut script are in `assets-src/midgame/art/` (`picks.json`, `cut.py`, `sheets/interim-preview.jpg` shows both on the Sky Temple beside Kai). The Magpie is also Slice 1b's sprite; Jonas approves it there (BUILD_PLAN §5.2), and the swap may ship with it |
| 5 | `src/content/lines.ts`, a new block at the end of the Baron's block | `// --- Baron final only (27 Sep, docs/fix-requests.md): the Sky Magpie's introduction and the Baron's escape` then `b("baron_intro_sky_temple", …)`, `b("baron_trick_1", …)`, `b("baron_escape_sky", …)`, `s("tv_trick_soon", …)` with the texts in the table below. **Record first** (docs/tts-retakes.md, "Baron final only"): `L()` in Battle.tsx is "the id is in `LINES`", not "the clip exists", so the lines go into `LINES` in the same change as their clips. `baron_w6` stays in `LINES` (nothing in the game plays it after this; old recipes name it) |
| 6 | `src/content/lines.ts`, new export beside `BARON_TAUNTS` | `/** A boss's own words: captions with a squawk or growl, no voice (MIDGAME_ENDGAME §2.3 F14). */ export const BOSS_CAPTIONS: Record<string, { start?: string; grr?: string; beaten?: string }> = { boss_magpie: { start: "You want my gems? Come and get them!", grr: "Squawk! Hands off my shiny gems!", beaten: "My lovely gems! Oh, all right, take them." } };` Not in `LINES` (no clip, so content test 6b doesn't expect one) |
| 7 | `src/core/content/line-tags.ts` | entries for the four new ids, as `sim/tag-lines.ts --missing` writes them (content test 6b fails without them): the three Baron lines `who: "baron"`, `purpose: "banter"`, `char:baron`; `tv_trick_soon` `who: "sensei"`, `purpose: "exposition"` |
| 8 | `src/engine/audio.ts` `sfx` | `squawk`: a synthesised magpie "chak-chak" (two sawtooth chirps, e.g. `tone(1500, 0.07, { type: "sawtooth", vol: 0.14, slide: 0.55 }); tone(1350, 0.09, { type: "sawtooth", vol: 0.14, slide: 0.5, delay: 0.11 }); noise(0.12, { vol: 0.12, freq: 2600 });`). Tune by ear against `sfx.thunder` |
| 9 | `src/scenes/Battle.tsx`, the boss intro (today line ~478, "Baron Muddle's threat") | `const threat = level.monster === "boss_magpie" ? "baron_intro_sky_temple" : "baron_w" + world.id;` (the rest of the block is unchanged: the ninja powers up as his last words fade). Then, for a boss with `BOSS_CAPTIONS[level.monster]?.start`: `await bossSays(start)` before the frame |
| 10 | `Battle.tsx`, new `bossSays(text)` and one piece of markup | `bossSays` sets a `bossLine` state for max(1800, 55 × characters) ms, plays `sfx.squawk()` and gives the monster a small hop (`monHit.current?.animate`, transform only). Markup: `{bossLine && <div className="bubble bt-boss-say" style={{ left: monCx - 170, top: Math.max(96, MON_FEET - monH - 70) }}>{bossLine}</div>}`. It shows whatever the captions setting is: it is the boss's only voice, not a caption of one (Decision, below) |
| 11 | `Battle.tsx`, the half-way roar (today line ~1383, `if (grr)`) | `if (grr) { setEnraged(true); roar(); const g = BOSS_CAPTIONS[level.monster!]?.grr; await (g ? bossSays(g) : say([{ line: "baron_grr" }])); }`. The taunts (`BARON_TAUNTS`) are unchanged |
| 12 | `Battle.tsx` `blastOff` | as today for a non-Baron boss (spins off to 990, 120); if `BOSS_CAPTIONS[level.monster!]?.beaten`, start `bossSays(beaten)` as she goes (keep its promise in a ref, `beatenSaid`), so the caption shows at the knock point while she spins; `win()` awaits `beatenSaid.current` before the Baron speaks, so the two bubbles never overlap |
| 13 | `Battle.tsx` `win()`, the `if (boss)` block (today line ~1555) | `if (baronHere) await baronFlees(); else if (level.id === TRICK_LEVEL && onceInSave("story:trick") && L("baron_trick_1")) { await baronEscapes(); heard("story:trick"); } else { await say({ line: "baron_lose" }); void ninja.act("cheer"); }` |
| 14 | `Battle.tsx`, new `baronEscapes()` beside `baronFlees()` | `setBalloon(1)` (the balloon rises in at the top right), `await say({ line: "baron_trick_1" })`, `await say({ line: "baron_escape_sky" })`, `setBalloon(2)` with `sfx.whoosh()` (it drifts up and out, 2 s), `await sleep(900)`, `await say({ line: "tv_trick_soon" })`, `void ninja.act("cheer")`. While `balloon > 0` the scene has the `bt-skyon` class (his caption bubble points up at him, as for today's fist-shaking Baron) and the cut-in is off: `useBaronOnScreen(baronHere \|\| balloon === 1)`. Markup: `{balloon > 0 && <div className={"bt-balloon" + (balloon === 2 ? " away" : "")}><img src={img("baron_balloon")} alt="" /></div>}` |
| 15 | `src/styles/battle.css` | `.bt-balloon { position: absolute; z-index: 6; left: 1010px; top: 20px; width: 200px; pointer-events: none; animation: bt-balloon-in 1.3s cubic-bezier(.2,.8,.3,1) both; }` `.bt-balloon img { width: 100%; animation: bt-bob 1.6s ease-in-out infinite alternate; }` `.bt-balloon.away { animation: bt-balloon-away 2s ease-in forwards; }` `@keyframes bt-balloon-in { from { translate: 140px 520px; } to { translate: 0 0; } }` `@keyframes bt-balloon-away { to { translate: 260px -460px; scale: .55; opacity: 0; } }` `@keyframes bt-bob { from { translate: 0 -4px; } to { translate: 0 6px; } }` and `.bt .bubble.bt-boss-say { position: absolute; bottom: auto; right: auto; max-width: 340px; z-index: 84; }` with its tail pointing down at the monster. Transform and opacity only (PERF.md); the balloon is unmounted when the level ends. Check the balloon (x 1010–1210, y 20–290) clears the hp bar and Home at 844 × 390, 667 × 375 and 740 × 360 |
| 16 | `src/App.tsx` `Reward` | `const isFinale = level.id === FINALE_LEVEL;` (was `LEVELS[LEVELS.length - 1].id`, the audit's loop, §2.4). APPEND `&& w.id < WORLDS.length` to the live condition, giving `lastInWorld: isLastInWorld && !trip && w.id < WORLDS.length` (keep verify round 1's `!trip`, or the last level of lands 1–5 says "Let's go to the next one!" before the new land's flower visit), passed to `rewardLead`, so the last built land never says "Let's go to the next one!" when there is none. `onNext(false)` then goes to the Sky Temple's map, as for any land's last level, and `flowerVisitAfter` may now run after `w6-11` |
| 17 | `src/App.tsx`, the map arrival (**optional, recommended**) | Old saves that already saw today's finale (`stars["w6-11"] > 0` before the swap) and don't replay the boss would never hear the trick. On the first map arrival after the update: `if ((s.stars["w6-11"] ?? 0) > 0 && onceInSave("story:trick") && L("baron_trick_1")) { await say([{ line: "baron_trick_1" }, { gap: 300 }, { line: "baron_escape_sky" }, { gap: 400 }, { line: "tv_trick_soon" }]); heard("story:trick"); }` (the cut-in shows the Baron; no balloon here). It shares `story:trick` with row 13, so a save hears it once, whichever comes first. If the map redesign holds App.tsx's map, this row can wait for it; the replay path (row 13) already covers a child who taps the glowing stone, which after the end points at `w6-11` |
| 18 | `src/content/stories.ts` `s6` | page `7`: `{ id: "7", kind: "narr", scene: "happy", hero: "idle", text: "The Baron grinned a big, sly grin. Then he gave a long, sneaky whistle, and something big and shiny swooped down from the temple roof..." }`; page `q`: `scene: "happy"` (it was `bloom`: the flower isn't complete). Re-record `public/a/s/s6_7.mp3` (move the old clip to `.trash/baron-final-only/`, then `gen-audio.ts stories`, which makes only the missing one). The `story_s6_bloom` picture stays: the finale uses it |
| 19 | `scripts/treadmill/sweep.ts` INTENT | `boss: "A boss battle: the land's guardian (the Sky Magpie at the Sky Temple), a longer spelling battle over the land's words. Baron Muddle cuts in to introduce her and to taunt; on the first win he escapes in his balloon."` The `finale` case stays (the cheat jump). `scripts/record-clips.ts`: `tr_boss_baron` → `tr_boss_magpie` (same url) |
| 20 | docs, at integration | DECISIONS (the rows below); NARRATIVE_AUDIT and SCRIPT_STYLE mentions of "the Baron as the last boss", if any; docs/midgame/MARKETING_PLAN.md §4.1 for the site and videos |

### The lines

| id | who (voice) | when | exact text |
|---|---|---|---|
| `baron_intro_sky_temple` | Baron (Algenib) | `w6-11`'s intro, every fight (the old `baron_w6` slot) | Mwa-ha-ha! Meet my Sky Magpie, little ninja. She'll steal every gem you know! |
| `baron_trick_1` | Baron (Algenib) | the first `w6-11` win (and row 17's map arrival), once per save | Did you think I'd turned nice? Mwa-ha-ha! It was a trick! I've still got the rarest gems! |
| `baron_escape_sky` | Baron (Algenib) | straight after, as the balloon rises | Catch me if you can, little ninja! My Sky Isles are full of spellings you've never seen! |
| `tv_trick_soon` | Sensei (Erinome) | straight after, as the balloon drifts away | He tricked us! Don't worry. We'll follow his balloon to the Sky Isles soon. |
| `s6_7` (story page) | Sensei (Erinome), storyteller | "The Last Petal", page 7 | The Baron grinned a big, sly grin. Then he gave a long, sneaky whistle, and something big and shiny swooped down from the temple roof... |
| `BOSS_CAPTIONS.boss_magpie.start` | the Magpie: caption and squawk, no voice (F14) | after the Baron's intro | You want my gems? Come and get them! |
| `BOSS_CAPTIONS.boss_magpie.grr` | caption and squawk | half health | Squawk! Hands off my shiny gems! |
| `BOSS_CAPTIONS.boss_magpie.beaten` | caption and squawk | the knockout | My lovely gems! Oh, all right, take them. |

`baron_trick_1` is worded for both kinds of save: a new child has just read the Baron looking sad and grinning in "The Last Petal"; an old save heard him say "Sorry for all the muddle". The spec's §2.2 uses the same two clips for 1b's map-arrival scene, so nothing is recorded twice.

### Decisions (for docs/DECISIONS.md)

| Decision | Why | To change it |
|---|---|---|
| The Baron is fought only once, in the final battle at Muddle Castle; until it exists the game has no Baron fight | Jonas, 27 Sep: "the final, final battle with really hard words always" | – |
| The interim ships before Slice 1b, with today's boss kit | stop the "final boss with *beg*" at once; the kit is 1b's work | – |
| The Baron's line says "gem", not "vowel" ("She'll steal every gem you know!") | the game never says "vowel" to a child (TEACHER_SCRIPT and lines.ts have no such word); gems are the game's word for spellings | the line |
| The Magpie's caption bubble shows even with captions off | it is her only voice (F14), not a caption of speech | `bossSays` |
| The finale is gated by `FINALE_LEVEL` (null for now), not "the last level" | the finale plays once, at the real end (spec §2.2); no loop (audit §2.4) | `worlds.ts` |
| The trick plays once per save (`story:trick`), on the first `w6-11` win or, for an old save, the first map arrival | a trick told twice isn't a trick; replays keep `baron_lose` | the ledger key |
| "The Last Petal" loses its "burst into bloom… The end!" | the story can't end the game before its boss; it now sets up the Magpie | `stories.ts` |

### Acceptance

1. `bun test ./src/core ./src/content ./src/engine` green (content 6b with the four new tags); `bun scripts/check-assets.ts` green (it needs `mon_boss_magpie.webp`, which exists).
2. `continuous.ts --from w6-1 --levels 14 --persona learner` on the preview: the transcript's BARON lines are only `baron_intro_sky_temple`, taunts, `baron_trick_1`, `baron_escape_sky` (and `baron_lose` on replays); **no `finale`, no `baron_final`, no `baron_grr`** in a Magpie fight; following the glowing stone past the end fights the Magpie again with `baron_lose`, never the finale (the audit's run: 9 finales in 70 minutes → 0).
3. The sweep's boss case at `w6-11` at 844 × 390, 667 × 375 and 740 × 360: no overlap of the balloon or the Magpie's bubble with Home, the hp bar or the nav row; the bubble is on screen.
4. The phone soak with `w6-11` in its levels: no new animation on the main thread (`anim-main-thread`, `anim-hidden` 0).
5. A save with `stars["w6-11"] = 3` and the old finale seen: the trick plays once (row 13 or 17), never again.
6. `bun landing/claims.ts` **fails** on the two `boss:w6-11=boss_baron` blocks. That is by design: the landing's copy changes in the same release (docs/midgame/MARKETING_PLAN.md §4.1).
7. Nothing for Jonas's ear beyond the gen-audio judge; the Magpie sprite is his to glance at (`assets-src/midgame/art/sheets/interim-preview.jpg`).

### Known leftovers (Slice 1b fixes them; none is a Baron fight)

- After the end, the glowing stone still falls back to `w6-11` (`frontier()`), so a child who follows it fights the Magpie again (with `baron_lose`, never the finale). 1b points it at a ready Gem Trial or Sensei's Challenge (audit §11.1 E).
- `world_6` still says "Baron Muddle is hiding up here somewhere!" on the Sky Temple's map, even after his balloon has gone. 1b keys the land's lines to story state.
- The Magpie fights with today's kit (nine words, one pip each); her phases, the Word Dragon and the sentence come with 1b.

### Then (same release or the next): the videos and the site

docs/midgame/MARKETING_PLAN.md §4.1 lists every asset that shows a Baron fight with simple words and what to change: the landing's Boss Battles card and the "How the boss battles work" block (with new copy), the meta description's "beat Baron Muddle", the trailer's "THE FINAL SHOWDOWN" gameplay (*beg*), the enemy supercut's last block (*coat*, *tea*), the game-clips page's `boss-3` and the trailer's `tr_boss_baron` footage. The tweet kit of 26 Sep has no Baron fight (checked) and needs nothing.

## The Sky Magpie, redrawn (27 Sep, the artist)

**Art only; nothing in `src/` changes.** The Sky Magpie is redrawn in the house monster style: a big, chunky magpie lady in a purple ninja-thief's mask, her wings on her hips, a laughing cocky grin, and a twiggy nest full of stolen vowel gems strapped to her back. She is cheeky, not scary. The file name and facing are the same as before, so the interim swap above needs no change. This section updates row 4's size and raws, and acceptance 7's sheet.

| File | What |
|---|---|
| `public/a/i/mon_boss_magpie.webp` | **Replaced** (720 × 691, was 720 × 733). **Faces left**, towards the ninja: `boss_magpie: { hp: 9, facing: "left", scale: 1.5 }` (row 2) stands. The interim drawing it replaces is kept byte for byte at `assets-src/midgame/magpie/prev/mon_boss_magpie.interim-2026-09-27-1922.webp`; to go back, copy that file over it |
| `public/a/i/mon_boss_magpie_face.webp` | **New**, 256 × 256: a head-and-mask portrait for the HP bar, framed for `.bt-hp-face`'s CSS as it is. **The game does not use it yet**: every HP face today is the whole sprite, cropped by CSS, and the Magpie reads well enough that way (see the sheet). It is optional. To use it: `MONSTER_INFO` gets `face?: boolean` (`boss_magpie: { …, face: true }`), and the `.bt-hp-face` img in `Battle.tsx` becomes ``img(info.face ? `mon_${level.monster}_face` : `mon_${level.monster}`)`` |
| no staggered sprite | No boss has one. Version 1 poses bosses by transform and tint (MIDGAME_ENDGAME, asset table, "Bosses") |
| `assets-src/midgame/magpie/` | `gen-magpie.ts` (both prompts), `raw/` (8 candidates), `cut/` (transparent masters), `cut.py` (cutting and export), `picks.json` (the pick and why), `contact.py` → `sheets/contact.jpg` (**Jonas's glance**: the Magpie at game size beside the panda, the knight and Gloop, on the Sky Temple with Kai, and her HP faces) and `sheets/candidates.jpg` |

**Decisions (for docs/DECISIONS.md).** (1) The pick replaces the interim sprite at the same path, not a new file. The brief named that path, the interim drawing was only 20 minutes old and not yet approved, and the old one is kept. (2) The mask is **purple**, not black, because a black mask disappeared on her black head in all four first-round candidates. Purple is also the Baron's colour, so she reads as his. (3) The beak is black like a real magpie's; a candidate with a yellow beak looked like a duck. (4) Jonas still approves the Magpie before Slice 1b (BUILD_PLAN §5.2), from `sheets/contact.jpg`.
