# Transcripts and audits

Module: `src/core/transcript/`, `scripts/sim/audit.ts`, `scripts/sim/sweep.ts`. Types: `Transcript`, `TranscriptLine`, `TranscriptDetail`, `AuditRuleId`, `AuditRule`, `AuditFinding`, `AuditReport`, `CoverageRow`, `LineUsageRow`, `AuditEnv`, `Invariant` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §9–10](../ARCHITECTURE.md#9-transcripts).

This is the loop Jonas asked for. We read everything we said to the child, everything they did, and everything we showed them, and find:
- what is never explained;
- what is said once but should be said three times, or said far too often;
- what comes in the wrong order;
- where the challenge is wrong.

Then we fix it and prove the fix.

**Built in stage 1, over today's game.** The renderer, the coverage table and eight rules come first, because they answer Jonas's questions within days: `used-before-explained`, `under-dosed`, `over-repeated`, `listening-load`, `beat-too-long`, `stars-inflated`, `sw-language` and `untaught-code-shown`, plus the `untagged-line` report that shows how much of the game is tagged. On the stage 1 shadow log, levels stand in for beats, and `stars-inflated` and `beat-too-long` need the one agreed `usePickGame` sink ([engine.md §10](engine.md#10-ports-and-adapters-srcadapters)); until it lands they report "not measured", never a pass. The other rules switch on as the engine (stage 3) and the director (stage 7) produce what they read.

## 1. The renderer (`render.ts`, `markdown.ts`)

`renderTranscript(events, env, { detail, title, persona }): Transcript` reads the log only. It never sniffs audio URLs or DOM taps. It replays the ledger alongside the events, so every line knows what had been explained at that moment.

| Event | Line | Detail |
|---|---|---|
| `session.start` | `## Session 3 · Tue 16:05 · 1 day since the last · typical-4` | child |
| `beat.start` | `### Bamboo Village · Mat and sat (w1-5) · frame: dojo`, then a challenge line (band, p, new notions, choices, talk before the first action) and `why` | child (title); annotated (challenge, why) |
| `exp.said` | `SENSEI  <text>`, placed at the utterance's **start** (ack t − heardMs); `(cut off after 0.6 s)` when not completed | child |
| | the purpose, key tags, `first:` keys heard for the first time, and running full-explanation counts (`idea:…` ×2/3) | annotated |
| `exp.shown` | `SCREEN  [1] picture: pan   [2] picture: pin` | child |
| `exp.cue` | `GAME    (sock is spotlit)`, `GAME    (the answer glows)`, `GAME    (sticker: sock)`, `GAME    (the /s/ petal shines through the mist)` | child for hints, spotlights, stickers, petals and gem energy; annotated for the rest |
| `exp.modelled` | `NINJA   (Sensei shows: taps pan)` | child |
| `obs.attempt` | `CHILD   taps sun after 3.0 s ✓` / `✗` | child |
| | hints, help level, outcome, `early`, error types | annotated |
| `obs.ignored` | `CHILD   taps pan (too early)` | child |
| `obs.help`, `obs.replay` | `CHILD   presses Help` → `GAME (the answer glows)` | child |
| `obs.idle` | `GAME    (8 s: nothing) → the answer glows` | child |
| `obs.choice` | `CHILD   chooses Reception` | child |
| `game.reward` | `GAME    ★★☆`, `GAME    sticker: mat` (silent stars: annotated only) | child |
| `game.decision` | `· why: requeue mat (2 errors)` | annotated |
| learner deltas (the learner folded alongside) | `MODEL   gpc:a>a:spell 0.55 → 0.30 · confusion spell:a>i = 2` | annotated |
| policy notes | `NOTE    (Jev) unclear: p(tap a sound tile) = 0.41` | annotated |
| every other event | its JSON | debug |

`markdown.ts` renders a `Transcript` at a chosen detail level, with times as `m:ss.s` from the session start. The JSON form is the `Transcript` itself.

## 2. Reports

- **Explanation coverage** (`coverage.ts`): one `CoverageRow` per notion or content key met in the run. The verdict, first match wins:
  - `used-before-explained` if the first real use (the first utterance, screen or cue that needs the key, or the first attempt that uses it; [ledger.md §2](ledger.md#2-the-reducer)) came before the first completed full explanation (or demonstration, for a mechanic);
  - `over-repeated` if more than maxPerSession in any session, or any full explanation after retirement (all `full` given, `retireAfter` credited uses, uses in ≥ `minSessions` sessions);
  - `open` if the **dosage window** hasn't closed by the end of the run (no dosage verdict yet);
  - `under-dosed` if, when the window closed, full < dosage.full or the explanations fell in fewer than minSessions sessions;
  - `stale` if it was used after refreshAfterDays with no explanation or reminder;
  - `explained-never-used`;
  - `never-met`;
  - `ok`.

  **The dosage window** closes at the end of the w-th session in which the key was used, counting from the session of its first full explanation, where w = 1 + the session steps its spacing needs (idea 2, concept 3, term 2, mech 2, gpc 2; obj, char, place and fact 1). Counting sessions *with a use* matters: the director only explains a key when a beat relies on it, so a session without the key can't be blamed. A quick child who uses an idea 8 times in session 1 is therefore judged at the end of their second session with it, after the spaced explanations had their chance.

  Rendered as `coverage.md`, sorted by verdict severity:

  | Notion | First explained | Full (sessions) | Reminders | Interrupted | First used | Uses (independent) | Longest gap | Verdict |
  |---|---|---|---|---|---|---|---|---|

- **Line usage:** one `LineUsageRow` per line: count, maximum per minute, sessions, first time, and the share heard to the end. Rendered as `lines.md`, sorted by count.
- **Beats:** per beat, the predicted and observed success, band, length, talk share and stars.

## 3. The audit rules (`audits/<rule>.ts`)

Each rule is a pure function over a run's events, with the ledger and learner replayed alongside. Deterministic rules gate CI at blocker and major; `jev-clarity` and `llm-review` never gate. Limits come from `DirectorConfig.limits[age]` for the persona's age band.

| Rule | Severity | Fires when |
|---|---|---|
| **Not explained** | | |
| `used-before-explained` | major | at an `exp.said`, `exp.shown` or `exp.cue`, one of its needs is unmet by the ledger at that moment; or at an `obs.attempt` (not a probe), a key in its `uses` or a GPC in its evidence is unmet; or at `beat.start`, a `requires` key is unmet. Never at `beat.start` for `introduces`: the beat's own teaching is judged where it is first relied on |
| `interrupted-explanation` | major | an explain or remind tag with `completed: false`, and its key is used before a completed full explanation |
| `mechanic-without-demo` | major | a mechanic's first you-do attempt comes before any demonstration (`exp.modelled`) or completed explanation of `mech:M` (in the warm-ups, the instruction "Tap the sock!" with the glowing answer explains `mech:tap-picture`) |
| `picture-not-named` | major | an `ask` tag for `word:W`, shown as a picture, before any completed mention of `word:W` in the same beat |
| `narrative-order` | major | a need on a `char:`, `place:`, `fact:` or `obj:` key is unmet (reported apart from `used-before-explained`, for story authors) |
| `untaught-code-shown` | blocker | an `exp.shown` `print` entry contains a GPC outside `taughtCode` (special words that were taught, narration pages Sensei reads, and probe items from placement and the jump-ahead check are exempt) |
| `unframed` | minor | an activity beat whose intro has no frame pitch before the first prompt |
| **Dosage** | | |
| `under-dosed` | minor (major for `concept:` and `idea:`) | the coverage verdict `under-dosed` |
| `stale-no-refresh` | minor | the coverage verdict `stale` |
| `over-repeated` | minor | a `vary` line more than twice in 5 minutes; any line more than 3 times in a minute; an explanation after retirement; more than maxPerSession explanations of a key in a session |
| `same-praise-twice` | polish | two consecutive praise utterances with the same line |
| **Order and Sounds~Write** | | |
| `lag-violation` | major | Symbol Search or Sound Swap on current-unit code; dictation less than 2 units back; reading in text less than 1 back (from `item.start` specs) |
| `concept-too-early` | major | an item or explanation for a key whose `notBefore` is after the frontier (a sort before BR; "two letters, one sound" before IC7) |
| `moved-on-too-soon` | major | a `unit-passed` by mastery while `canMoveOn` (replayed) was false |
| `segmenting-for-speller` | major | during a build item with empty slots, any utterance whose `sounds` parts, or consecutive `sound` parts, spell the target word's sounds in order |
| `answer-given-early` | major | in you do, a `told`, `paw` or `givesAnswer` utterance before attemptNo 2 (the idle ladder's paw is exempt) |
| `sw-language` | major | the rendered text matches the banned list: "says" or "makes" about a spelling; letter names; "letter(s)" meaning spellings; "magic e"; "tricky word"; "silent letter"; "long/short vowel". The regexes live in `audits/sw-language.ts`, and the `jev-lint-lines.ts` rule checks run over new lines |
| `distractors-in-lesson-1` | major | a `word-building` or `word-building-digraph` item whose spec has distractors |
| **Challenge and pacing** | | |
| `out-of-band` | minor | a beat's observed independent rate is outside [0.6, 0.95] (simulated personas only), or predicted − observed differs by more than 0.2 on average over ≥ 5 beats (miscalibration) |
| `failure-run` | major | 3 failed items in a row with no change of scaffold or item difficulty between them |
| `choice-jump` | minor | a mechanic's first appearance with more than 2 choices, or choices growing by more than 1 between blocks |
| `listening-load` | major | talk before the first action above the limit; a speech run above `maxSpeechRun`; an instruction line with more `steps` than the limit |
| `talk-share` | minor | a beat's talk share above `maxTalkShare` |
| `dead-air` | minor | awaiting for more than 10 s with no speech, `exp.cue` or idle step |
| `beat-too-long` | major (age 3–4), minor otherwise | a beat longer than 1.3 × `beatMs`, or with more items than `itemsPerBeat` (per level on the shadow log) |
| `session-too-long` | minor | no rest offered by `sessionMs` |
| `reward-drought` | polish | longer than `rewardEveryMs` without praise or a reward |
| `stars-inflated` | major | stars that counted an item whose outcome was not `independent` |
| **Production** | | |
| `missing-audio` | major | `exp.said` with `missingAudio`, or a line without a clip in `durations.json` |
| `untagged-line` | minor until stage 7, then major | a line said without `LineMeta`, or whose meta `hash` no longer matches its text and speaker (the line was rewritten, so its tags may be wrong). A finding, never a failed build, until the director relies on tags; the gate date is agreed with the `lines.ts` owners |
| `spliced-speech` | polish | a prompt or instruction built from 3 or more clips (line + gap + word…). The list says which sentences to record whole (Round 13: "Tap the mat" is three recordings) |
| `unlit-naming` | polish | a naming utterance with no `name-card` `exp.cue` in the same script step |
| **Judgement (nightly)** | | |
| `jev-clarity` | minor | the Jev clarity probe's `unclear`, `unexplained` and `confused` notes, with the transcript window (deferred) |
| `llm-review` | minor | the LLM reader's findings, verified (§4) |

**Signatures** are `audit:<rule>:<case>:<keys or line>`, so a finding de-duplicates across personas and runs. The `case` is the episode (`bamboo/w1-5`) or scene. The `evidence` is the transcript excerpt (±5 lines) and the run directory. The `repro` is the command that replays it: `bun scripts/sim/run.ts --persona … --seed … --until <seq>`.

**Invariants are shared.** For every rule that is also a director guard ([director.md §7](director.md#7-invariants-guards)), the guard and the audit call the same predicate in `director/invariants.ts`. A guard can prevent a problem; the audit proves nothing slipped through: hand-authored lines, a bug in the director, or today's game before the director exists.

## 4. The LLM reader (`llm-review`)

Nightly, on the annotated transcripts of the first 2 sessions of `tapper-3` and `typical-4`, and on any exported real log. It reads 2-minute windows, with the coverage table and the notion registry's labels, and answers Jonas's questions:
1. What does a child need to understand here that was never explained?
2. What was explained only once, or all at once, and needs saying again later?
3. Where would a child of this age be lost, bored or overloaded?

Every claim must cite line times and keys. Before filing, the claim is checked against the replayed ledger: a claim that a key was never explained, when the ledger shows a completed explanation, is dropped. Verified claims become findings, and each proposes the data fix: a tag, a need or a provider.

**It also proposes new notions.** The deterministic rules can only judge keys that exist. So the reader is asked a fourth, open question: "Which words or ideas does a child of this age need here that are not in the notion list?" ("what's a lantern?"). Each answer becomes a proposed registry entry (`term:lantern`, with the lines that need it and a draft provider) for a person to accept. Accepted entries feed the ratchet (§5).

## 5. The loop

```
generate   ─► scripts/sim/sweep.ts            personas × the journey so far × 3 seeds × 10 sessions over 14 virtual days
             scripts/treadmill/transcript.ts  (stage 1+) today's game in the browser, from the shadow log
             grown-ups export                  a real child's log
render     ─► playtest/transcripts/<run>/journey-<persona>.{md,json} (child + annotated), coverage.md, lines.md
audit      ─► <run>/audit.json (AuditReport) ─► scripts/treadmill/inbox.ts ─► playtest/INBOX.md (new, regressed, open)
read       ─► Jonas weekly: the first two sessions of tapper-3 and typical-4 (annotated), plus coverage.md
fix        ─► data first (tags, needs, providers, dosage, lines to record), then code
prove      ─► the finding disappears on the next run and is auto-closed; a planted regression test keeps it closed
```

**The ratchet.** Every human or LLM finding that the deterministic rules missed is fixed as data, so the rules catch it from then on. For example, "what's a lantern?" becomes `term:lantern` in `run_start`'s needs, with a provider. That is how the loop gets stronger each week without anyone reading more.

**Cadence.**

| When | What |
|---|---|
| Every commit | the scripted personas and golden transcripts; every deterministic rule at blocker and major fails the build (except `untagged-line`, a finding until stage 7); `director.check` and `scripts/sim/check.ts` |
| Nightly | the full sweep, the shadow-log treadmill run, the LLM reader → the inbox; later, the Jev clarity probe |
| Weekly | Jonas reads the transcripts; later, the LLM personas play |

## 6. Tests (`src/core/transcript/**/*.test.ts`)

1. **The renderer:**
   - a fixture log renders a byte-identical Markdown snapshot at each detail level;
   - a cut-off utterance shows "(cut off after …)" at its start time;
   - an eager tap is placed during the prompt;
   - taps during naming show "(too early)".
2. **Firsts and counts:** the first explanation of `idea:words-are-made-of-sounds` shows `first:` and ×1/3, and the second ×2/3.
3. **Coverage:** a fixture with 3 full explanations in one session of a key with minSessions 2, used in two sessions → `under-dosed` when the window closes; with the third explanation in the next session → `ok`; the same log cut after session 1 → `open`, with no finding.
4. **One planted-defect fixture per rule:** each gives exactly the expected finding, and nothing else fires on the clean twin fixture.
5. **The clean director fixture** (next to the planted one): a beat with `introduces: ["idea:words-are-made-of-sounds"]` whose intro plays the inserted `words_made` explanation (completed), followed by a segmented prompt needing the idea and an independent answer → **zero** findings of any rule. The planted twin cuts the explanation off (`completed: false`) → exactly one `interrupted-explanation` and one `used-before-explained`, at the prompt, not at `beat.start`.
6. **A competent child trips nothing.** A perfect simulated child plays 3 sessions of the Bamboo Village warm-ups: zero `under-dosed` and zero `over-repeated` findings.
7. **Today's game** (the stage 1 shadow-log fixture of w1-1, learner persona):
   - `used-before-explained` for `idea:words-are-made-of-sounds` and `idea:fast-and-slow-saying`;
   - `beat-too-long` for age 3 (per level), once the `usePickGame` sink exists; "not measured" before;
   - `stars-inflated` when an idle glow preceded a counted answer, likewise;
   - `spliced-speech` for `listen_tap` + word.
8. **Tag drift:** a line whose text changed since it was tagged gives one `untagged-line` finding (case `stale`) and never fails the build before stage 7.
9. **Signatures** are stable across runs and personas for the same defect.
10. **Findings** convert to the treadmill `Finding` shape, and `inbox.ts` merges `audit.json` next to the other sources (with `"audit"` added to its `Source` union).
11. **The LLM reader's verification** drops a planted false claim ("the Help button is never explained", when `fm_help_short` completed).
12. **Cues in the transcript:** the idle glow, a name-card spotlight and a sticker appear at child level at their times, and `dead-air` counts a glow as something shown.
