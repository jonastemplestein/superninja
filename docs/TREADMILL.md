# The playtest treadmill

The aim is for machines to produce feedback so humans don't have to. One command sends bots and AI playtesters through the whole game and turns everything they notice into one de-duplicated inbox: `playtest/INBOX.md`. Fix what's in it, rerun, and the fixed items close themselves.

```
bun scripts/treadmill/run.ts --quick         # ~1–2 min: one level of each kind, bots + Jev
bun scripts/treadmill/run.ts                 # ~10–15 min: every level + monkey + visual critic + Jev
bun scripts/treadmill/run.ts --personas      # + Codex persona playtesters (30–60 min, run it while you sleep)
bun scripts/treadmill/run.ts --watch         # quick run after every change under src/
bun scripts/treadmill/run.ts --joins         # + "one take, or joined?": spliced speech judged by ear (~3 min)
bun scripts/treadmill/run.ts --soak          # + the soak check: 8 levels in one page, judged against the perf budgets (~12 min)
bun scripts/treadmill/run.ts --soak-phone    # + the same on a slow phone (CPU 4× slower), 12 levels (~25 min, nightly)
```

By default a run plays a frozen build of the working tree (`frozen.ts`, served on :4180), so edits made mid-run can't reload its pages. `--live` and `--watch` play the dev server on :5173 instead (`bun run dev`).

## Stages

| Stage | File | What it catches | Cost | Time |
|---|---|---|---|---|
| Fast-forward | `src/engine/fast.ts` | `?fast=N` speeds up speech, timers, CSS animations and video N× (bots only) | — | — |
| Bots | `sweep.ts` + `bot.ts` | A "perfect child" plays every level and scene on an 844×390 phone viewport. It flags crashes, console errors, softlocks (nothing changes and nothing to tap), levels that never finish, tap targets that are covered (by speech bubbles, characters and so on), off-screen, clipped, tiny, in the iOS edge-swipe zone or overlapping, text overflow, broken images, and "undefined"/"NaN" on screen. Each culprit is outlined in red in its evidence shot. The tiny-target check skips anything still popping in (a finite animation on it or a parent), so it never measures a card mid-flight. In the warm-ups it also checks the **card box** (every settled picture card inside the play area, clear of other cards, the ninja and Help zones and the speaker, never clipped, its picture inside its plate) and that each lesson closed by its **hard cap** (`window.__snWarmup`). Cases include the school-year opt-in with three answers (`window.__botOptIn`), the Sticker Book, and deep links into the World Flower's routes (`?practise=ai>ae`, `?trial=ai>ae`). **Navigation** (docs/NAVIGATION.md §6), on every case: **home-missing** / -covered / -misplaced / -duplicate (one Home, ≥ 44 px, in the Home zone x 0–130, y 0–130, nothing over it; the title and the turn-your-phone prompt are exempt), **no-replay-for-instruction** (the screen waits after an instruction, quiet for 1 s of game time, with no Hear it again; the bot holds back on each screen's first three waits so this doesn't depend on its speed), **auto-advance** (a step or a show's route moved on without Next, Back or Home) and **auto-answer** (a turn ended with no answer). They read `__snRoute`, `__snState`, `__snNav` and an input log the sweep records; home-\* and auto-\* are blockers in the first-session cases. The `nav-demo` case (`?scene=nav-demo`) must pass all of them. The shows before the map and the finale have cases (`intro`, `choose`, `finale`, played on Next until the child leaves), `idle-next` leaves the film's first shot alone for 20 s (**idle-nudge**: nav_ready must play and Next glow, and the shot must hold), and the `home-*` cases tap Home part-way through each kind of screen and check where it lands. | free | ~10 min for 80 cases at 8× parallel |
| Nav replays | `sweep.ts --nav` | In each new waiting position the bot first taps Hear it again (and Show me again) with a real tap: **replay-silent** (nothing said within 2 s of game time), **replay-stale** (it said none of this position's instructions), **show-again-broken** (nothing said, or it answered the turn) | free | slower (each replay plays to its end) |
| Monkey | `sweep.ts --monkey` | Random tapping at four taps a second for 45 s per level: crashes and stuck states that a 3-year-old would find | free | included |
| Visual critic | `critic.ts` (Gemini 3.8 Flash) | Filmstrip contact sheets judged as a children's UX designer plus a Reception teacher would: what to tap, clutter, style consistency, frozen screens, pedagogy red flags, delight | pennies | ~1 min |
| Picture audit | `pic-audit.ts --pics` (Gemini vision, blind; `--age 3 --warmups` for the warm-up pictures) | Names every word picture the way a 4-year-old (or 3-year-old) would, without being told the word, and flags any living thing drawn without a face. `pics-to-content.ts` turns that into `src/content/pic-names.ts`, so picture-only games automatically avoid pictures a child would name with a different sound (fin → "shark", wig → "hair"), and it warns about hand-picked pairs that fail | pennies | ~2 min |
| Jev | `jev-*.ts` marked `@treadmill-stage` | TypeSafe's typed decision model through Cloudflare AI Gateway: lints every spoken line for pedagogy and vocabulary, triages and de-duplicates findings (see docs/JEV.md) | fractions of a penny | seconds |
| Joins | `joins.ts --joins` (Gemini audio) | Rebuilds each splice the first minutes play (a lead-in ending "...", then a pure sound, a stretched or held word) from a transcript's audio log, with the real gaps, and asks "one take, or joined?". An audible jump in loudness or voice is a finding | pennies | ~3 min |
| Soak | `soak.ts --check` (`--soak`, `--soak-phone`) | Does the game get slower or heavier the longer a child plays? The bot plays level after level in **one page with no reloads**, through the map, rewards, Next and World Flower trips, as a child does. Then it leaves the map still, leaves a reward with Next ready (Next's idle nudge), stands the ninja still at streak 0 and 10, and fires a burst of streak-10 strikes. The run is judged against the perf budgets (below) and writes `<runDir>/soak/summary.md` (the budget table, then every metric), `report.html` (charts) and `checks.json`. Failed budgets become findings (`soak:<check>`) in `<runDir>/soak.json`, and the run prints them at the end. (`inbox.ts` merges them once `soak` is in its file pattern.) | free | ~12 min (phone: ~25) |
| Personas | `personas.ts` (Codex gpt-6-sol, headless browsers) | Maya (3¾, can't read, taps everything), Oscar (6, impatient, tries to break things), Ms Patel (Sounds~Write teacher, audits against docs/PEDAGOGY.md using `window.__audioLog`), and a parent setting it up on an iPhone | a few $ | 30–60 min |
| Inbox | `inbox.ts` | Merges everything by signature, tracks it across runs in `playtest/known.json` (open / fixed / wontfix), marks new and regressed items, and auto-closes deterministic findings that stopped appearing | — | instant |

Every source writes the same `Finding` shape (`types.ts`): `sig`, `source`, `severity`, `case`, `title`, `detail`, `evidence[]` and `repro`. Adding a new checker means writing `<runDir>/<name>.json` in that shape and adding it to the list in `inbox.ts`.

## Frozen builds

Test on a frozen build, never on the shared dev server, which reloads the page whenever anyone saves:

```
bun scripts/treadmill/frozen.ts --port 4404                    # build into playtest/runs/frozen/.build-4404, serve it, print the URL
bun scripts/treadmill/frozen.ts --port 4404 --probes --detach  # with soak.ts's module probes; leave it running in the background
bun scripts/treadmill/frozen.ts --port 4404 --stop             # stop a detached one
```

`--out <dir>` picks the folder. `--no-build` serves what is already there. `--retry N` waits 45 s and rebuilds when another agent's half-finished edit breaks the build. `--probes` builds with `soak.vite.config.ts`, which is the game plus read-only probes into module state (live particles, the ninja's effect nodes, listener sets, the decoded-audio cache, the save's `adjustLog`), exposed as `window.__snPerfMods`. That's for test builds only. `soak.ts` and `run.ts` use the same code (`import { frozen } from "./frozen"`).

## The soak check

```
bun scripts/treadmill/soak.ts --mobile --cpu 4 --fast 2 --levels 12 --idle 60 --stress 150 --check   # the phone, ~25 min
bun scripts/treadmill/soak.ts --fast 2 --levels 20 --check                                             # desktop, ~30 min
bun scripts/treadmill/soak.ts --levels 4 --idle 20 --stress 60 --check                                 # a smoke, ~7 min
bun scripts/treadmill/soak.ts --serve none --base http://127.0.0.1:4404 ...   # play a frozen build that is already up (built with --probes)
bun scripts/treadmill/soak.ts --analyse <run dir> --check                     # re-judge a finished run, e.g. after a budget changes
```

`--check` prints the budget table and exits 1 if any budget fails. Each row says what was measured, where it first went over, and the owner. An animation row names each offending animation, how many ran at once, the file that defines its `@keyframes`, and the screens it ran on. The phone rows are only judged with `--cpu` > 1; on desktop they show their values marked "not judged". `n/a` means the run didn't measure that row: no World Flower visit, `--idle 0`, `--idle-next 0`, `--stress 0`, `--no-title`, `--no-aura`, or a build without the probes. Each run also writes `checks.json` (every row, machine-readable) and records its own flags in `levels.json`, so `--analyse` judges it the same way. `--findings <file>` writes the failures as treadmill findings.

| When | Budget (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §11.1, docs/PERF.md §5) |
|---|---|
| after each level, back on the map after a forced GC, compared with the first map sample | DOM nodes ≤ start + 600, JS heap ≤ start + 8 MB, listeners ≤ start + 40, map animations ≤ start + 5, intervals ≤ start + 1; particles ≤ 5, fx nodes 0; **rAF requests ≤ 5/s**; **live decoded audio ≤ 64 MB**; **Web Audio nodes ≤ start + 8**, **`<audio>` elements ≤ start + 2**; `__snNavLog` ≤ 500, `adjustLog` ≤ 200 |
| the title, untouched for 5 s | live decoded audio ≤ 2 MB (the title music streams; it is never decoded) |
| every sample while playing, and on still screens (the title, the map, a held Next) | ≤ 2 endless animations the compositor can't run (a non-compositable property such as `z-index`, `box-shadow`, `filter`, or an SVG target), ≤ 2 endless animations on hidden elements |
| the still map (`--idle` s untouched), and a reward with Next ready (`--idle-next` s untouched: Next's idle nudge, with the glow at 8 s, the hand and the ninja's leap at 16 s, and the line again at 40 s) | rAF requests ≤ 5/s (median). Between its moments the nudge must ask for no frames |
| phone ×4 | every screen's median fps ≥ 50; the still map ≤ 5 % main thread; a held Next (the reward, with the nudge) ≤ 6 %; the ninja standing still ≤ 6 % at streak 0 and ≤ 14 % at streak 10; the World Flower ≤ 30 % median main thread, longest task ≤ 120 ms |
| the strike stress | particle peak ≤ 350; 10 s later 0 particles and 0 fx nodes |
| the whole soak | no page reloads; the bot finished every level |

Footprint and RSS are reported but not judged: under Playwright they include DevTools' copies of every response body and Chrome's image cache (PERF.md §2.2). The phone profile is headless Chrome with a 4× CPU throttle, not WebKit on an iPhone. Read its percentages as "how close to the edge", and compare runs made on the same machine. The bot is `bot.ts`'s `step()`, so it taps Next through held steps and presentations. `--patched` previews PERF.md's fixes 1–6 (`soak-fixes.ts`), a whole fix at a time. The build skips any fix that has already landed in the source or whose text has moved on, and `<out>/fixes.json` says which were applied. It retires once the real fixes are all in.

## Phoneme audio gate

After regenerating any `public/a/p/*.mp3`, run `uv run --with numpy --with praat-parselmouth --with faster-whisper python scripts/phonemes/qa.py`. Review every `FAIL` in `playtest/phonemes/qa.json`: the checker measures 10 ms voicing, intensity steps, vowel F1/F2 and duration, and flags Whisper letter-name transcriptions. Rebuild a failing sound from a spoken word, rerun until it passes, then listen to the before/after pair in `playtest/phonemes/index.html`. Whisper and blind Gemini results are secondary signals for these tiny clips; the acoustic gate and human listening remain necessary. Then give the clips you changed to the listening judges too: `doppler run -p os-legacy-2026-04 -c dev -- bun scripts/pure-sound-finals.ts <ids>` (6 targeted and 6 blind judgments each, against the clip in the game) and `bun playtest/transcripts/reaudit-r2/sound-probe.ts`. A clip goes in only when it passes both the gate and the judges (26 Sep: the gate alone let through a /b/ heard as "buh" and an /ɪ/ heard as "pen"). /w/ and /y/ are judged against the school's forms, "wwwoo" and "yyee", not "no vowel at all" (docs/DECISIONS.md). New candidates: `scripts/gen-pure-sounds.ts` (TTS takes and sounds cut from carrier words).

## Working the inbox

- Work down from blockers. Evidence links open the exact screenshot, and `repro` is a deep link (`/play/?level=w2-1`).
- For a false alarm, run `bun scripts/treadmill/inbox.ts <runDir> --wontfix <sig>`. It is remembered for every later run.
- Checker noise gets fixed in the checker, not by ignoring it. Example: the map hero deliberately covers its own node, so it carries `data-tap-proxy`.
- The bots' brain is `bot.ts: step()`, driven by `window.__snState`, which every scene publishes. When you add a scene, publish `__snState` and teach `step()` to play it, or the sweep reports it as stuck. A held step needs nothing: `step()` taps Next whenever `window.__snNav.next` is `"ready"` (or `__snState` is `{ scene: "present", canNext: true }`), waits while a step is still playing, and leaves Next alone once "Play again" shows (the harness ends the case there).

## Credentials

- The critic uses Gemini: `doppler -p os-legacy-2026-04 -c dev` (`APP_CONFIG_GEMINI_API_KEY`).
- Jev uses Cloudflare AI Gateway Unified Billing on the dev/preview account: `doppler -p os -c dev`. The personal account has no AI credits.
- Personas use the local `codex` login.

## What the first runs found

These all came from machines, with no human playtesting, on the first day:
- **Crash:** the map's hidden "next world" arrow looked up a seventh world. Found by the monkey.
- **Blocker:** "Jump ahead" was lost, because the save was debounced and the grown-ups page reloaded straight away. Found by the parent persona.
- **Layout:** letter tiles wrapped and overlapped in "find the sound" (a `.center` width bug), and monsters covered the last slot of four- and five-letter words.
- **Invalid markup:** an SVG `<polyline>` with a path command in it, and buttons nested inside buttons in Sort.
- **Teaching:** "which"/"witch" dictated with no picture (Jev homophone check). Pictures that break sound games: fin/shark, wig/hair, hot/soup, sand as a mound (picture audit and critic). The "how we write it" letter was tiny, and story questions had no replay button (critic).
- **Parents:** Play was four screens down on a landscape phone, the grown-ups text was about 9 px, there was no clue that the gear must be held, and adding a sibling replayed the whole film (parent persona).

Checker false alarms are fixed in the checker. Examples: modals (`data-modal`), the map hero shortcut (`data-tap-proxy`), scrolling pages, and grown-up pages (`data-grownups`). The visual critic re-checks each major claim against the full-resolution frame before reporting it.
