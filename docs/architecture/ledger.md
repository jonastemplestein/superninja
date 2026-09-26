# The ledger: what the child has been told and shown

Module: `src/core/ledger/`. Types: `Ledger`, `LedgerEntry`, `LedgerApi`, `NotionReadiness`, `DosageDue`, `Need`, `NeedLevel`, `Dosage` in `src/core/types.ts`. Overview: [ARCHITECTURE.md §4.2](../ARCHITECTURE.md#42-ledger). Built in stage 1.

The ledger is the exposure half of the student model. It answers "has this child been told this, how often, when, and did they talk over it?" for every `Key`. The director uses it to decide what to explain first and what reminders are owed, the planner uses it to show only code that has really been taught, and the audits replay it along the log to judge each moment. It is a pure reducer over the same log as the learner, and never reads the learner.

## 1. Facts, not levels

There is no single ranked level. Each entry keeps separate counts, because "the child tried it", "Sensei gave the answer" and "Sensei explained it" are different facts, and only the last one means the child was told.

| Fact | Raised by |
|---|---|
| `explained` | an `explain` tag on a **completed** `exp.said` (teach moments and the first-sound reveal included) |
| `demonstrated` | a `demonstrate` tag on an `exp.modelled` (an I do). Nothing else. |
| `reminded` | a `remind` tag on a completed `exp.said` |
| `mentioned` | a completed `mention`, `show`, `ask` or `model` tag ("It's this one!" is a mention); `show` tags on `exp.shown` and `exp.cue`; any tag on an interrupted `exp.said` |
| `interrupted` | an `explain` or `remind` tag on an `exp.said` with `completed: false` |
| `practised` | an attempt whose `uses` or evidence touches the key (a KC maps to its key by dropping the direction) |
| `usedCorrectly` | an independent correct you-do attempt (first try, help level ≤ 1, not a probe), for keys in the attempt's `uses` only, **at most once per beat** |
| `assumed` | the school year, placement or the legacy save says the child was taught it at school |

`LineMeta` never uses `demonstrate` or `use`: those roles belong to `exp.modelled` and attempts. The tag check in content.md rejects them.

**Meeting a need** (`meets(l, need, now)`):
- `explained`: `explained ≥ 1`; or, for a `mech:` key, `demonstrated ≥ 1`; or `assumed`.
- `mentioned`: any of `explained`, `demonstrated`, `reminded`, `mentioned` above 0, or `assumed`.
- If `need.freshDays` is set, the key must also have been explained or reminded within that many days.
- **Attempts never meet a need.** Neither does a model or a question.

## 2. The reducer

| Event | Effect |
|---|---|
| `session.start` | `session = sid`; every entry: `thisSession = 0`, `sessionsSince++`; every line: `thisSession = 0` |
| `profile.change school-year` / `band` / `placed` | for every notion with `assumedFrom` ≤ the unit, and every `gpc:X` taught up to the unit: `assumed = true` |
| `beat.start` | every entry: `beatsSince++`. Nothing else: `requires` and `introduces` are not uses. |
| `exp.said` | for each tag (below); for each need: a use (below); for each line: `lines[id].n++`, `last`, `thisSession++`; `moments[utt.moment]++` when set |
| `exp.shown`, `exp.cue` | `show` tags → `mentioned++`; each need in `screen.needs`, affordance needs and cue needs: a use |
| `exp.modelled` | `demonstrate` tags → `demonstrated++`; for `mech:` keys this is also a full explanation (below) |
| `obs.attempt` | ignored if `probe` or `origin: "shadow"`. Each key in `uses`, and each evidence key: `practised++` and a use. If independent, correct and you do: for each key in `uses` whose `lastCreditedBeat` ≠ this beat: `usedCorrectly++`, `lastCreditedBeat` = this beat, and `correctUseSessions++` when this session is new for it |
| `beat.end` | nothing per key |

**A use** of a key: `firstUsed ??= t`; `useSessions++` if `lastUseSession ≠ sid` (then `lastUseSession = sid`). A use is the first real use the audits judge: the first utterance, screen or cue that needs the key, or the first attempt that uses it. Never `beat.start`.

For each tag on a **completed** `exp.said`:
- the fact in §1 for its role; `first ??= t`.
- `explain` is a **full explanation**, counted **at most once per key per beat**: a show spread over several lines is one explanation, and a later `explain` tag on the same key in the same beat counts as a mention. It sets `lastExplained = t`; `beatsSince = 0`; `sessionsSince = 0`; `thisSession++`; if `lastSession ≠ sid`, `sessions++` and `lastSession = sid`.
- `remind`: `lastReminded = t`, `beatsSince = 0`, `sessionsSince = 0`, `thisSession++`.

A `demonstrate` tag on `exp.modelled` for a `mech:` key does the same bookkeeping as a full explanation. For other keys a demonstration is recorded in `demonstrated` but is not a full explanation.

**Full explanations** in the dosage sense are `explained` (plus `demonstrated` for `mech:` keys).

## 3. Queries

- **`entry(l, key)`**: the entry, or an empty one.
- **`meets(l, need, now)`**: §1.
- **`readiness(l, key, now, notions)`** is used by the director before a beat that relies on `key`. `d` is the notion's `Dosage` (or the built-in dosage for content keys, [director.md §2](director.md#2-dosage-defaults)); `full` is the full-explanation count. Checks run in this order:
  1. Any `dependsOn` key not ready → `{ ready: false, missing: "dependency", needs: [...] }`.
  2. `full < d.beforeUse`, and not assumed → `missing: "interrupted"` if `interrupted > 0`, else `"explanation"`.
  3. `d.refreshAfterDays` set, and now − max(`lastExplained`, `lastReminded`) > that → `missing: "stale"`.
  4. Otherwise `{ ready: true }`, with:
     - `retired`: (`full ≥ d.full` or assumed) **and** `usedCorrectly ≥ d.retireAfter` **and** `correctUseSessions ≥ d.minSessions`. A quick child who uses an idea 8 times in session 1 does not retire it: its spaced explanations still come.
     - `fullDue`: not assumed, `full < d.full`, and the spacing before the next full explanation has passed. `d.spacing[full − 1]` is measured in `beatsSince`, `sessionsSince` or days since `lastExplained`. If it isn't set, the spacing counts as passed.
     - `reminderDue`: (`full ≥ d.full` or assumed), `d.reminders = "short"`, not retired, and `beatsSince ≥ 1`.
- **`owed(l, keys, now, notions)`** gives the explanations and reminders owed for a beat that relies on `keys`:
  - not ready because of an explanation, interruption or staleness → `{ form: "full", reason: "before-use" | "refresh" }`;
  - `fullDue`, and `thisSession < d.maxPerSession` → `{ form: "full", reason: "spacing" }`;
  - `reminderDue`, and `thisSession < d.maxPerSession` → `{ form: "short", reason: "reminder" }`.

  The result is ordered before-use, then refresh, then spacing, then reminder, and within each by `overdue`: beats past the spacing for spacing, days past the refresh for refresh, and `beatsSince` for reminders. Ties break by key. The director applies the per-beat caps.
- **`taughtCode(l)`**: the `gpc:X` keys with `explained ≥ 1` (a completed teach moment or first-sound reveal) or `assumed`. Every decodability check in the planner and the `untaught-code-shown` audit use this, not a unit's nominal code. A probe, a component GPC in a word being read or a wrong answer never adds to it, so the director still plays the teach moment.

**Frame keys.** A key that only a frame or pitch relies on (`term:monster` in "One of Baron Muddle's monsters is in the way!") never appears in an attempt's `uses`, so a child spelling well never "retires" it. Frames reinforce their own keys through the full pitch and the short pitch ([director.md §1](director.md#1-content-model)).

## 4. Why interrupted explanations matter

Today, an eager tap hushes Sensei in the middle of whatever is playing. In the core, only prompts are interruptible ([engine.md §3](engine.md#3-eager-answers-and-too-early-taps)), so explanations are rarely cut. They still can be: the app goes to the background, the phone is turned, or the child goes home. An explanation that was cut off doesn't count. The director explains it again before the key is used, and the `interrupted-explanation` audit catches any path where that didn't happen.

## 5. Tests (`src/core/ledger/*.test.ts`)

1. A completed `explain` tag: `explained` = 1, `sessions` = 1, `beatsSince` = 0, and `meets({ level: "explained" })` is true.
2. The same tag with `completed: false`: `interrupted` = 1, `mentioned` = 1, `meets` explained is false, and `readiness` says `missing: "interrupted"`.
3. **Attempts never explain.** A wrong attempt, a correct attempt and a probe, each with evidence on `gpc:ai>ae:read`, leave `explained` 0; `taughtCode` doesn't contain `ai>ae`; and `owed(["gpc:ai>ae"])` still gives full / before-use (the intro-gem).
4. **A model is a mention.** "It's this one!" with a `model` tag on `gpc:a>a` gives `mentioned` 1 and `meets` explained false.
5. **Mechanics.** An `exp.modelled` with `demonstrate` on `mech:tile-to-line` meets explained. The same tag on an `exp.said` is rejected by the tag check and does nothing here.
6. Three full explanations in one session, with dosage `minSessions` 2: `sessions` = 1, and the `under-dosed` audit flags it once the window closes (a fixture shared with the audit tests).
7. **Spacing.** With spacing `[{ after: "beats", n: 2 }, { after: "sessions", n: 1 }]`:
   - after explanation 1, `fullDue` is false until 2 beats have started;
   - after explanation 2, it is false until the next session.
8. **Retirement needs all three conditions.** With `full` 3, `retireAfter` 8 and `minSessions` 2: 8 credited uses in session 1 with 2 explanations → not retired, `fullDue` true next session; after the third explanation and one more credited use in session 2 → retired.
9. **Once per beat, prompt needs only.** A 6-item beat whose every prompt needs `idea:words-are-made-of-sounds`, all answered independently → `usedCorrectly` +1. `term:monster`, needed only by the beat's frame → `usedCorrectly` unchanged.
10. **The per-session cap.** With `maxPerSession` 2, the third owed item in a session is dropped from `owed`.
11. **Refresh.** 15 days after the last explanation, with `refreshAfterDays` 14, `readiness` says `missing: "stale"`, and `owed` gives full / refresh.
12. **Assumed entries.** Placement at IC8 makes `gpc:m>m` assumed. `readiness` is ready with `reminderDue` true (a short reminder is enough), and `taughtCode` includes it.
13. **Dependencies.** `idea:words-are-made-of-sounds` depends on `idea:fast-and-slow-saying` (FIRST_MINUTES teaches fast and slow first), so with neither explained, readiness of the first is `missing: "dependency", needs: ["idea:fast-and-slow-saying"]`.
14. **First real use.** `beat.start` with `introduces: ["idea:words-are-made-of-sounds"]` sets no `firstUsed`. The intro's explanation completes, then a prompt needing the idea is said: `firstUsed` is the prompt's `t`, after `lastExplained`.
15. **Line and moment counts:** `lines.listen_sounds.n` equals the number of `exp.said` events containing it, and `moments["gem:ai>ae"]` drives the teach rotation.
16. **Purity and fold associativity** (as in learner.md test 15).
17. **Compaction:** folding a log whose old exposures are compacted gives a deep-equal ledger (events.md test 5).
18. **Replaying today's w1-1** (the stage 1 shadow-log fixture): `idea:words-are-made-of-sounds` has `explained` 0 while `listen_sounds` is said 6 or more times. The `used-before-explained` audit test uses the same fixture.
19. **One explanation per beat:** a scripted beat with three completed `explain` tags on `idea:fast-and-slow-saying` gives `explained` 1 and `mentioned` 2.
