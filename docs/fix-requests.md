# Cross-lane requests (collected 27 Sep)

Requests that earlier lanes left for files they didn't own. The fix workflow's owners apply the ones for their files; integration applies the rest and ticks them off here.

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
