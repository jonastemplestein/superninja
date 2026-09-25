# Jev for Super Ninja

What TypeSafe's Jev model (`jev-1.13.0`) is good for in this game, measured on 25 September 2026. Every number here comes from a script in `scripts/treadmill/jev-*.ts`, and its raw output is in `playtest/jev/`.

**Verdict.** Jev is a fast, cheap and very stable *judge of text against a rule you spell out*. It is weak at anything that needs pronunciation knowledge, numeric reasoning over logs, or recalling facts you didn't name. Use it for linting and triage gates. Don't use it as a tutor brain or a pronunciation checker.

## What it is

Jev is a decision model that doesn't generate text. You send one `state` and a record of typed questions. It returns calibrated answers:

- `noul` returns p(true).
- `choice` returns the chosen key, a confidence and a probability per key.
- `score` returns the expected level, a confidence and a probability per level.

All the questions in one request are answered in parallel.

## The API that works

```
POST https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run      (doppler -p os -c dev)
{ "model": "typesafe/jev",
  "input": { "state": <string | object | array>,
             "questions": { "<key>": { "type": "noul",   "instructions": "...", "criteria": { "true": "...", "false": "..." } },
                            "<key>": { "type": "choice", "instructions": "...", "criteria": { "a": "...", "b": "..." } },
                            "<key>": { "type": "score",  "instructions": "...", "criteria": ["level 0", "level 1", ...] } } } }
→ result.result = { model: "jev-1.13.0", answers: { <key>: ... }, usage: { input_tokens, output_tokens } }
```

- **Only `state` and `questions` are accepted.** Sending `temperature`, `seed`, `system`, `context`, `examples` or `stream` returns 400 ("Unsupported field"). `questions` must be a record, not an array, and the only valid types are `noul`, `choice` and `score`.
- **State size.** A state of about 30k tokens works; about 45k returns 400 `max_tokens_exceeded`.
- **Text only.** A base64 image, sent as a data URL, an image part or an OpenAI-style `image_url` part, is billed as about 18k text tokens and answered as "no picture": p(dog) = 0.03 for a dog picture. An image URL is judged by its filename alone (`pic_dog.webp` → p(dog) = 0.87).
- **Rate limit.** 1,200 requests a minute per account, shared with every process. Bursts of about 50 requests a second are fine; going past the per-minute budget returns 429 (code 971). `jev-lib.ts` paces requests with a sliding window and backs off on 429.
- **Client.** `scripts/treadmill/jev-lib.ts` (`ask()`, `pool()`) wraps the call with metering for latency, tokens, cost and model version. `jev.ts` is still the minimal client.

## Latency and cost

| Measured | Result |
|---|---|
| One request, 1 question | p50 ≈ 400 ms |
| One request, 10 → 214 questions (4k-token state) | 406 → 618 ms, **flat** |
| State of 4k → 30k tokens | 411 → 625–800 ms |
| Fixed overhead | ≈ 300 input tokens per request; each question adds its own instruction length |
| Line linter (248 lines × 11 questions) | 248 calls, 431k tokens, **$0.018, 5.2 s** wall clock |
| Word auditor (418 words × 6 questions) | 418 calls, 358k tokens, **$0.015, 7.8 s** |
| Triage of a full run (104 findings) | 65 calls, **$0.002, 2.2 s** |
| Full calibration suite | ≈ 1,150 calls, **$0.036**, about 2 minutes with rate limiting |
| This whole investigation | ≈ 9,000 calls, **under $0.40** |

Output tokens are free. A pedagogy gate on every commit costs about 3p a day even at 10 commits.

## Can we trust it as a gate?

The suite lives in `jev-calibrate.ts` and writes `playtest/jev/calibration.json`. Re-run it when the model version changes.

**Stability is excellent.**

- **Repeats.** The same request 5 times gives a maximum spread of 0.11 and a mean spread of 0.00–0.04 across 11 questions × 12 lines. A value only flipped across 0.5 when it sat within ±0.05 of it.
- **Negation.** A negated `noul` (swapped criteria) gives p + p′ ≈ 1 (mean |1 − sum| ≤ 0.05).
- **Scale order.** Reversing a `score` scale changes the result by ≤ 0.05.
- **Batching.** A question asked alone versus batched with 10 others differs by ≤ 0.01, so there is no cross-talk.
- **State format.** JSON versus prose state differs by ≤ 0.07.

**Accuracy depends on the wording.**

- **Explicit rules are near-perfect.** On hand-written violations versus real lines and near-misses, all 8 line checks scored AUC 1.0 (n = 8–24 each), with Brier 0.01–0.10. The worst near-misses were "Two letters, one sound!" at 0.57 and "I can see a bee!" at 0.64, hence the 0.6 threshold for rule checks.
- **Reliability.** Answers below 0.2 were never true (n = 42), 0.6–0.8 were true 92% of the time (n = 12), and 0.8+ always (n = 35).
- **Vague questions inflate p.** Rewording the "letters don't talk" rule tersely, without its exceptions, raised clean lines from about 0.05 to about 0.6 (a mean shift of 0.55). Violations stayed at about 0.97, so AUC survives but the threshold doesn't. **Every gating question needs its own labelled set.**
- **Named examples leak.** With examples in the instruction, the homophone question flagged exactly the pairs it was given: sea/see 0.89 and tail/tale 0.83 with one example set, then sell/cell 0.87 and sun/son 0.89 with another. Without examples, AUC was 0.79. For picture naming the *ranking* was stable across example sets (Spearman 0.96), but named items rose by 0.1–0.25. Use examples that aren't in the data.

**Knowledge it lacks.**

| Check | Result | Use instead |
|---|---|---|
| Homophone verification with the pair spelt out ("not/knot?") | AUC 0.76; misses not/knot, be/bee, hi/high, him/hymn | deterministic: identical sound sequences in `phonics.ts` (found **which = witch**) |
| Is this sound-by-sound breakdown right? | AUC 0.75 with the game's labels (12/20 correct breakdowns flagged), 0.85 with IPA (catches 13/20 corruptions) | the data in `phonics.ts` |
| Rude British slang | knob 0.10, shag 0.30, bum 0.45 (but swearing, violence and toilet words ≥ 0.71; AUC 0.97) | a small denylist (in `jev-words.ts`) |
| American words | AUC 1.0, but US words from 0.31 upward, so the threshold is 0.3, not 0.5 | fine at 0.3 |

**External validation.**

- **Word familiarity.** Jev's "would most children at this stage understand this word?" correlates with published age-of-acquisition ratings (Kuperman et al. 2012, n = 400 game words) at **Spearman 0.73**. Log word frequency manages 0.59. It flagged **0 of 124** words learnt by age 4½. On 60 hand-labelled words it scored AUC 0.99, with **precision 1.0 and recall 0.88 at 0.6**. At 0.5 it wrongly flagged map, zip, net, web and peg, which is why the first version was noisy.
- **Picture naming from the prompt text alone**, checked against blind vision naming of 160 real pictures (`pic-audit.ts`):
  - "the intended word isn't the top name": AUC 0.71;
  - "the top name starts with another sound": AUC 0.76;
  - prompt length on its own scores AUC 0.79.
  
  At 0.7 the questions are precise (0.93 and 1.0) but catch only 19% and 13% of problems. **Vision is the real check.** The Jev picture questions are only a pre-generation screen for new prompts, and they are skipped for words the vision audit has covered.

## Prototypes

The first three are treadmill stages: `@treadmill-stage` is in each header, `run.ts` runs them as `bun <file> <runDir>`, and they write `<runDir>/jev-<name>.json`. Jev judgements use `source: "jev"` and deterministic checks use `"invariant"`. Text-only judgements are at most `minor`.

- **`jev-lint-lines.ts`** checks 248 spoken lines: `lines.ts` plus story narration.
  - **Rule checks:** letters don't talk, no letter names, "letters" versus sounds/spellings, other Sounds~Write rules, American English.
  - **Tone:** scary, deflating.
  - **Judgement checks:** vocabulary, listening load, unclear instruction. These are routed by a `kind` question, so they only apply to instructions, and use high cut-offs.
  - **Context:** each line's state carries its lines.ts section and what the child sees there. Without that context, every "read the word" was flagged as unclear.
- **`jev-words.ts`** audits 418 words:
  - word familiarity at the child's age for that unit, unsuitable, American;
  - picture-prompt screens, only for words the vision audit hasn't covered;
  - deterministic same-sounds check (respects `dictationSafe`) and slang denylist.
- **`jev-triage.ts`** triages a run:
  - deterministic grouping by case-free signature (104 findings → 22 groups);
  - Jev rates each group: child-facing?, impact, area, severity;
  - for `did-not-finish` groups, reads the timeline and judges stuck versus slow;
  - pairwise "same root cause?" merges (22 groups → 16 clusters);
  - a small policy reconciles contradictory answers: child-facing < 0.35 becomes polish, and slow becomes minor.
  - It emits no findings. It writes `triage` (per sig) and `clusters` for the inbox to sort and collapse by.
  - On `full1` it merged the crash screens with their `TypeError`, the two React nesting warnings, and the three Word Book overlay groups. It made one dubious merge (two different tiny buttons) and missed one (`monkey-crash` versus `crash-screen` on w6-6, 0.41). It called both timeouts "slow", which matches the timeline, where targets keep changing.
- **`jev-tutor.ts`** is an offline adaptive-tutor experiment, not a stage. See below.
- **`jev-calibrate.ts`** is everything in the trust section. `--only lines|words`, and `--aoa <csv>` for the age-of-acquisition check.

## What it found (25 September)

- **Same sounds, no picture:** `which` = `witch` (unit 11), so a child can't spell `which` from hearing it. This came from the deterministic check and is now guarded in the game by `dictationSafe`.
- **First-sound pictures with another likely name:** `sea` (→ wave), `tea` (→ cup), `nap` (→ cat), `night` (→ moon), `tusk` (→ elephant) and `astronaut` (→ spaceman). Jev flagged these from the prompt text, and vision naming confirmed them (wave 70%, cup 60%, cat 65%, moon 75%, elephant 90%, spaceman 55%). Several prompts have since been rewritten.
- **Lines:**
  - `help_sort` ("Tap the treasure chest with the right letters.") and `baron_w6` ("different letters"): Sounds~Write rule 3.
  - `baron_w4` ("You're next!"): the only Baron line over the scary threshold.
  - `baron_taunt_1` ("You will never spell THAT one") and `baron_w5` ("Too tricky for you!"): deflating, and spoken just before the child spells.
  - `timer_intro_2` ("spell as quickly as you can!"): deflating, and 3+ steps.
  - Too many steps to follow when heard once: `help_read`, `run_start`, `read_intro`, `trial_start`, `timer_intro_3`, `place_intro`, `flower_i5`.
- **Words:** in the w1-2 /m/ first-sound game, `match` and `moth` are borderline for 3–4-year-olds (vision: moth → butterfly 55%). `cob`, `hob`, `fig`, `tusk` and `yak` are pictured words most children at that stage won't know. `fight` is borderline unsuitable. `hump` is on the slang denylist.

## Ranked ideas

| # | Idea | Recommendation | Why |
|---|---|---|---|
| 1 | Pedagogy linter over spoken lines | **Build** (done) | Rule checks are AUC 1.0, stable and about 5 s per run. It found real problems (below). Gate on the rule checks; treat vocabulary, load and unclear as a ranked review list. |
| 2 | Bug triage and root-cause merging | **Build** (done) | Grouping by code does most of the de-duplication. Jev adds child-facing discounting (React warnings sink), cross-group merges and stuck-versus-slow, for $0.002 a run. |
| 3 | Word-list auditor | **Build, narrowly** (done) | Familiarity is well calibrated. Picture-from-text is not, so vision replaces it. The biggest win was the deterministic homophone check it prompted. |
| 4 | Dialogue and story review before recording audio | Maybe | Same linter, run on new lines before TTS spend. Free to add as a pre-TTS hook. |
| 5 | Level-design critic (difficulty curve against PEDAGOGY.md) | Maybe | Not built. Most rules (taught sounds, 2 → 3 choices, continuant-first) are cheaper and exact in code; Jev would only add the "does this feel too fast?" judgement. |
| 6 | Parent progress summaries (choose a template from save data) | Maybe | Low-stakes choice questions suit Jev, but it reasons badly over numbers (see 7), so compute the stats in code and let Jev pick the tone. |
| 7 | Live adaptive tutor | **Skip** | Offline on 60 synthetic histories across 10 archetypes it missed fast random guessers (p ≈ 0.3) and always-left tappers, even when the summary said "20/20 answers under 1 s, 100% left". Guessing accuracy was 0.70 against 0.82 for a 10-minute heuristic, and "next item" 0.50–0.67 against 0.62. Fatigue (0.83–0.89) and a mastery score were sensible, but rules do the same for free, with no network hop. |
| 8 | Stuck or confusion detector over timelines | Skip as a separate tool | Bot timelines are too sparse to say more than "slow or stuck", which is folded into triage. Revisit if real sessions log taps and captions. |
| 9 | Image or pronunciation checks | Skip | Text only; pronunciation AUC is 0.75–0.85. |

## Rules for writing Jev questions

1. Spell out the rule, the exceptions and 1–2 examples that **aren't** in the data; name what counts as false. Bare "yes/no" criteria on a vague question inflate p.
2. Put context in the state (who speaks, what is on screen, the child's age at that point), and route judgement questions with a `choice` about what the item is.
3. Calibrate every gating question on a labelled set that includes near-misses, and pick its threshold from that. Rule checks sit at 0.6, American words at 0.3 and familiarity at 0.6.
4. Separate answers can contradict each other ("blocker" but not child-facing). Combine them with a few lines of explicit policy.
5. Anything countable or knowable from data (sounds, homophones, rates, streaks) belongs in code. Give Jev the judgement that is left.
