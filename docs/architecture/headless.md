# The headless runner, players and the text adventure

Modules: `scripts/sim/`, `src/core/text/screen.ts`. Types: `Policy`, `PlayerView`, `Decision`, `PolicyCtx`, `PolicyNote`, `Persona`, `SimLearnerParams`, `RunConfig`, `RunResult`, `RunMetrics`, `DayPlan` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §8](../ARCHITECTURE.md#8-the-headless-runner-and-the-text-adventure).

The core is pure, so the real game logic runs without a browser, in virtual time. Every player sees the same `PlayerView` and chooses an affordance id or waits. The runner writes the log, from which transcripts and audits are made ([transcripts-and-audits.md](transcripts-and-audits.md)).

**Built in stage 3** with the scripted, perfect, random and simulated-child players and three personas (`tapper-3`, `typical-4`, `year1-6`), enough to play the FIRST_MINUTES warm-ups as a text adventure. The other personas follow with the planner. Deferred until the deterministic loop has run on real logs: the Jev clarity probe (§6), LLM players (§7), cohorts and the model-recovery metrics.

## 1. The runner (`scripts/sim/run.ts`)

```ts
async function run(cfg: RunConfig, env: CoreEnv, policy: Policy): Promise<RunResult> {
  const clock = virtualClock(startOf(cfg.schedule[0]));
  const timeline = new Timeline();                 // min-heap of { at, seq, input }; seq breaks ties in insertion order
  const core = createCore(env, { audio: presenter(timeline, clock), clock, storage: memoryStorage(cfg.start) });
  let ps = policy.init(cfg.seed, cfg.persona);
  let pending: { at: EpochMs; decision: Decision; viewKey: string } | null = null;
  for (const session of sessions(cfg.schedule)) {
    clock.set(session.start); core.dispatch({ in: "life", t: clock.now(), what: "boot" });
    while (!sessionOver(core, session, cfg.stop)) {
      const view = playerView(core, clock.now());
      if (!pending && canAct(view)) {                // accepting answers, or an interruptible prompt is playing
        const [d, next] = await policy.decide(ps, view, ctxFor(core, cfg)); ps = next;
        pending = { at: clock.now() + ("act" in d ? d.afterMs : d.wait), decision: d, viewKey: keyOf(view) };
      }
      const head = timeline.peek();
      if (head && (!pending || head.at <= pending.at)) {
        timeline.pop(); clock.set(head.at); dispatch(core, head.input);
        if (pending && keyOf(playerView(core, clock.now())) !== pending.viewKey) pending = null;   // a hint or new prompt: ask again
        continue;
      }
      if (!pending) break;                           // nothing scheduled and nothing to do: a softlock, reported as a finding
      clock.set(pending.at);
      if ("act" in pending.decision) dispatch(core, { in: "act", t: clock.now(), action: tapWithDuring(core, pending.decision.act) });
      pending = null;
    }
    ps = feedEvents(policy, ps, core.log());         // policy.observe for every new event
  }
  return finish(core, cfg, policy, ps);             // events, final snapshot, metrics, notes
}
```

- **`keyOf(view)`** is the affordance marks plus the last utterance heard. A decision is dropped when the view changes before it lands: an idle glow, a re-prompt, or the paw. The child is then asked again and now sees the hint. This is how a slow simulated child gets idle help exactly as a real one would.
- **`canAct(view)`** is true when the core is awaiting an answer, or when an interruptible utterance is playing. A policy that decides to tap during the prompt is thereby able to answer eagerly.
- **Softlock detection:** there is nothing on the timeline, nothing awaited, and the session is not over. The runner records a `sys.error` and stops the session. The `softlock` finding is reported by the sweep.
- **Speed:** a 10-minute session is a few hundred steps, which takes well under a second. A 50-child, 4-week cohort takes seconds to minutes.

## 2. The TextPresenter (`scripts/sim/presenter.ts`)

It implements `AudioPort`, `PresenterPort` and `ClockPort` over the timeline:
- **`say`:** push an ack at `now + utt.estMs` with `completed: true`, and remember `(out, startT)`. Utterances queue, so each one starts when the previous one ends.
- **`hush`:** the playing utterance's ack is replaced with `completed: false, ms: now − startT` at `now`. Queued ones are acked `completed: false, ms: 0`.
- **`cue` with `ack: true`:** an ack at `now + config.cueMs[cue]`. The defaults: `right` 900 ms, `celebrate` 1,500 ms, `tier-up` 1,200 ms, `place-tile` 600 ms, `reveal-spelling` 700 ms, `fly` 800 ms; any other cue 300 ms.
- **`timer`:** a timer input at `now + ms`. **`cancel-timer`** removes it.
- **`missing-audio`:** a clip absent from `durations.json` is estimated at 350 ms a word, and the utterance acks with `missingAudio: true`.

## 3. The player view and the text adventure (`src/core/text/screen.ts`)

`playerView(core, t): PlayerView`:
- **`header`:** the land, the episode title, `item / of`, and the phase in words ("your turn", "together", "watch").
- **`heard`:** the utterances heard since the player last acted, from `exp.said`, including cut-off ones.
- **`seen`:** one line per visible thing, from `view().activity` and the screen. For example `[1] picture: pan (glowing)` or `slots: m _ _`.
- **`affordances`:** the enabled ones.
- **`waitingMs`:** how long the current question has waited.
- **`tail`:** the last 40 child-level transcript lines.

The terminal renders it like this:

```
── Bamboo Village · Mat and sat · 2 of 6 · your turn ──────────────────── challenge: flow · p≈0.81
SENSEI  What's the next sound? "mmmaaat" (slowly)
On screen:  a picture of a mat · slots: m _ _ · tiles: [1] t  [2] a
Do:         1  2   ·  h help  ·  r hear it again  ·  w wait  ·  q home
>
```

## 4. Players (`scripts/sim/policies/`)

| Policy | `decide` | Notes |
|---|---|---|
| `scripted` | the next entry of a list: an affordance id, `wait:<ms>`, `help`, `replay`, or `wrong` (any enabled non-answer) | golden transcripts and regressions |
| `perfect` | `ctx.oracle.answers[0]` after 1,200 ms | smoke runs; browser parity; `scripts/sim/check.ts` |
| `random` | a uniform tap over every affordance, including disabled ones and strays, every 250 ms | Maya the monkey: softlocks, stray handling, inflated stars |
| `child` (simulated learner) | §5 | pacing, challenge, model recovery |
| `jev-probe` (deferred) | a simulated child plays; Jev is asked clarity questions at instruction moments (§6) | "did Sensei tell the child what to do?"; "did Sensei use a word the child wasn't told?" |
| `llm` (deferred) | §7 | exploratory play with think-aloud notes |
| `human` | the terminal: numbers tap, `h` help, `r` replay, `w` wait until the next timer, `q` home | `bun scripts/sim/play.ts` |

Only `perfect` and `child` (including the child under the Jev probe) may read `ctx.oracle`. Jev and LLM players get only what a child perceived, with no answers.

**`scripts/sim/check.ts`** plays every chapter with four scripted players (perfect; one error per item; two errors per item; silent for 30 s on every question) for each age band, and runs the deterministic audits on the logs ([director.md §8](director.md#8-check-two-ci-contract-checks)). It replaces the old idea of a dry run inside the director.

## 5. The simulated child (`policies/child.ts`)

The child keeps hidden truth, `truth[kc] = p`, initialised from `params.prior` (the longest matching prefix wins; the default is `prior[""]`).

**`observe(s, e)`, on each event:**
- A completed `exp.said` or `exp.modelled`, for every tag with role explain or demonstrate on a key that maps to KCs: p += (1 − p) × `learn.explained` (or `learn.modelled`).
- A mechanic demonstration: the child understands the mechanic with probability `comprehension`. If it doesn't, it taps at random for that mechanic until the next demonstration.
- The child's own attempt: correct → p += (1 − p) × `learn.practisedRight`; wrong and then corrected → p += (1 − p) × `learn.corrected`.
- Time: between events, p decays towards the prior with `forgetHalfLifeH`. That half-life doubles after each spaced (≥ 4 h) success, as people's memory does.
- Active minutes accumulate towards `attentionMin`.

**`decide(s, view, ctx)`:**
1. If the view is not awaiting and a prompt is playing: with probability `eager`, tap during the prompt (choosing as in step 3).
2. With probability `random` (× 3 after `attentionMin`): tap a uniformly random affordance.
3. Otherwise, on answer affordances:
   - `P_know` = Π over target and component KCs of `ctx.oracle.evidence` of `truth[kc] × (1 − slip)`;
   - with probability `P_know` → the answer;
   - otherwise a guess among the choices, preferring a confusion partner (`params.confusions`) with its probability, and the favoured screen position with `positionBias.share`.
4. When unsure (`P_know` < 0.5): press Help with probability `help`, and replay with probability `replay`.
5. **Latency:** log-normal with median `rt.knownMedianMs` (if the child knows) or `rt.unknownMedianMs`, and `sigma`; × 1.5 after `attentionMin`.
6. **Quits:** after `quitAfterErrorsInRow` errors in a row, or with probability 0.1 per minute after `attentionMin` + 5 minutes.

It never reads the learner model. Tests compare the model with `truth` (Brier, AUC, Spearman).

## 6. The Jev clarity probe (`policies/jev.ts`; deferred)

This is not a player. docs/JEV.md measured Jev as a stable, calibrated judge of text against explicit rules. It has no ears, weak pronunciation knowledge, and knows every word in text, so it would ace the phonics, and it can only judge the notions it is shown. So a **simulated child plays**, and Jev is a probe beside it: at each instruction moment it reads what the child actually heard and says whether a naive child of that age would know what to do.

**When Jev is asked:** only at instruction moments. These are:
- a beat's first prompt;
- the first appearance of a mechanic;
- the first prompt after a correction;
- the first decision on a new screen (map, flower, reward).

That is about 20–40 calls per 10-minute session, at about $0.00007 each, within the 1,200-a-minute rate limit. `scripts/treadmill/jev-lib.ts` `ask()` does the pacing and metering.

**State** (one object, within its 30k-token limit):
- `age` and `persona.brief`;
- `heard`: the **child-level transcript of the session so far**: every utterance as heard (cut-off ones marked), every cue and screen as shown, every tap. A 10-minute session fits. It is *not* given the ledger's claims about what was explained: those come from the same tags it is meant to check, and a mis-tagged line would make it agree;
- `screen`: what a child sees now, **by kind**, with the answers masked: "two pictures", "three empty lines under a picture", "five sound tiles", "the Help button (Sensei in the corner)", "the speaker button".

**Questions** (all in one request):

| Key | Type | Question and criteria |
|---|---|---|
| `when` | `choice` | "Should the child wait and listen, or act now?" Criteria: "act now: Sensei has finished asking and named what to tap"; "wait: Sensei is still explaining, or has not said what to do yet" |
| `stuck` | `choice` | "Would a {age}-year-old press the Help button, guess, or know?" Criteria spelled out per option. Many "guess" answers on one moment point at an unclear instruction |
| `clear` | `noul` | "From what the child heard so far, would a {age}-year-old know what to do now?" true: "the instruction names the action and the thing to act on in words a {age}-year-old knows"; false: "the action, the thing, or a word needed to follow it was never said" |
| `unexplained` | `noul` | "Did Sensei use a word or idea that this transcript never explained, and that a {age}-year-old would not know?" true and false are spelled out with two examples that are not in the game's data (JEV.md rule 1) |
| `feel` | `score` | "How is this going for the child?" ["bored", "fine", "stretched", "lost"] |

The old `kind` question ("which kind of thing does Sensei want?") is dropped: on most screens there is only one kind of thing to tap, so it told us little.

**Notes → findings:**
- `when` = wait with p ≥ 0.6 at a moment the core is awaiting an answer, or act with p ≥ 0.6 while an explanation plays → `unclear`;
- `stuck` = guess with p ≥ 0.5 → `unclear`;
- `clear` < 0.6 → `unclear`;
- `unexplained` ≥ 0.6 → `unexplained`;
- `feel` = lost with p ≥ 0.5 → `confused`; bored → `bored`.

The notes become `jev-clarity` findings, with the transcript window as evidence. **New words it can't judge** ("what's a lantern?") are the LLM reader's job, which proposes new notion keys ([transcripts-and-audits.md §4](transcripts-and-audits.md#4-the-llm-reader-llm-review)).

**Calibration before gating:** a new `--only player` suite in `scripts/treadmill/jev-calibrate.ts` runs the questions on 40 labelled instruction moments (20 fine, 20 broken: the `listen_sounds` prompt before `words_made`, `help_tiles` before tiles were introduced, and so on). It picks the thresholds from those. Until a question is calibrated, its findings are `minor` and nightly only.

## 7. The LLM player (`policies/llm.ts`; deferred)

Codex or Claude, in character from `persona.brief`. The state is the `PlayerView` as JSON, plus the last 40 transcript lines. It returns `{ act, afterMs, note }` (or wait). Notes become `NOTE` lines in the transcript. It is slow and costs a few pence per session, so it runs weekly on the first two sessions of two personas.

## 8. Personas (`scripts/sim/personas.ts`)

| Persona | Age | Opt-in answer (`schoolYear`) | Behaviour | Key params |
|---|---|---|---|---|
| `tapper-3` (Maya, 3¾) | 3 | none | knows nothing; very eager; taps at random; short attention | prior 0.05; comprehension 0.5; eager 0.3; random 0.15; rt 2.5 s / 5 s; attention 6 min |
| `typical-4` | 4 | none | steady learner | prior 0.1 (`pa:` 0.4); learn 0.06 / 0.08 / 0.15 / 0.12; slip 0.1; forgetting 72 h; attention 12 min |
| `reception-5` | 5 | R (spring) | knows IC1–IC6 | prior `gpc:` 0.7 up to IC6; attention 15 min |
| `struggling-4` | 4 | none | half the learning rates; forgets fast; asks for help | forgetting 24 h; help 0.4; slip 0.15 |
| `guesser-4` | 4 | unsure | fast random answers; left bias | rt 0.6 s; random 0.4; positionBias { 0, 0.8 } |
| `forgetful-5` | 5 | R | learns fine, forgets fast | forgetting 18 h |
| `year1-6` (Oscar) | 6 | Y1 | knows the Initial Code; impatient | prior `gpc:` 0.9 up to BR; eager 0.4; attention 10 min |
| `bluffer-3` | 3 | Y2 (taps the biggest door) | a 3-year-old who says Year Two | prior 0.05; the FIRST_MINUTES check must drop the band |

The game derives each persona's age band from its answer and the date, as for a real child, so a `typical-4` who answers "none" is limited as a 3-year-old until the next September. Thresholds use the persona's real age. A persona with `tellsAge` has a grown-up enter the exact age.

Every persona has a `brief` for Jev and LLM players, e.g. "Maya is 3¾. She can't read. She taps whatever is bright, and she loves the ninja."

## 9. Commands

```
bun scripts/sim/play.ts --age 4 --seed 7 [--persona typical-4] [--audio] [--detail annotated]   # Jonas plays
bun scripts/sim/run.ts --persona typical-4 --policy child --sessions 12 --gap 1d --seed 3        # one run → playtest/transcripts/<run>/
bun scripts/sim/sweep.ts [--quick] [--jev]                                                      # personas × journey × seeds → transcripts, audits, inbox
bun scripts/sim/check.ts [--chapter first-minutes]                                               # four scripted players per chapter and age band
bun scripts/sim/cohort.ts --n 50 --weeks 4                                                      # (deferred) pacing and calibration metrics
bun scripts/sim/audit.ts <runDir> | --log <exported.json>                                       # audits over any log, including a real child's
```

`--audio` plays each utterance's clips with `afplay` in real time, so Jonas hears what the child hears.

## 10. Tests

1. **Runner determinism:** the same config and seed give identical logs (policies without network).
2. **A decision is dropped when a hint arrives first.** A child with an 11 s response time sees the 8 s idle glow, is asked again, and answers with `helped` (not independent).
3. **Eager answers:** a policy tapping at 400 ms into a 1,200 ms prompt gives an attempt with `early` true and `latencyMs` −800, and the `exp.said` of the prompt shows `completed: false, heardMs: 400`.
4. **The presenter** queues utterances (never overlapping) and turns `hush` into the right acks.
5. **Softlock:** a planted machine that awaits nothing is reported, and the runner stops.
6. **The simulated child learns:** with explanations switched off in a fixture, `truth` for an idea-dependent KC stays low, and its accuracy stays near chance.
7. **Personas are within their ranges** after 100 simulated decisions (the guesser's median latency < 1 s, and so on).
8. **Jev probe** (deferred; offline, with a stubbed Jev): the state masks answers (no answer word appears in `screen`) and contains the child-level transcript, never the ledger; a `when` = wait answer while the core awaits produces an `unclear` note; Jev is called only at instruction moments.
9. **The player view** renders the §3 example exactly from a fixture state.
10. **Multi-day schedules:** a `DayPlan` of 5 days × 1 session advances the virtual clock by the gaps, and `session.start.gapH` matches.
