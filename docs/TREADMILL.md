# The playtest treadmill

The aim is for machines to produce feedback so humans don't have to. One command sends bots and AI playtesters through the whole game and turns everything they notice into one de-duplicated inbox: `playtest/INBOX.md`. Fix what's in it, rerun, and the fixed items close themselves.

```
bun run dev                                  # the treadmill plays the dev server
bun scripts/treadmill/run.ts --quick         # ~1–2 min: one level of each kind, bots + Jev
bun scripts/treadmill/run.ts                 # ~10–15 min: every level + monkey + visual critic + Jev
bun scripts/treadmill/run.ts --personas      # + Codex persona playtesters (30–60 min, run it while you sleep)
bun scripts/treadmill/run.ts --watch         # quick run after every change under src/
```

## Stages

| Stage | File | What it catches | Cost | Time |
|---|---|---|---|---|
| Fast-forward | `src/engine/fast.ts` | `?fast=N` speeds up speech, timers, CSS animations and video N× (bots only) | — | — |
| Bots | `sweep.ts` + `bot.ts` | A "perfect child" plays every level and scene on an 844×390 phone viewport. It flags crashes, console errors, softlocks (nothing changes and nothing to tap), levels that never finish, tap targets that are covered (by speech bubbles, characters and so on), off-screen, clipped, tiny, in the iOS edge-swipe zone or overlapping, text overflow, broken images, and "undefined"/"NaN" on screen. Each culprit is outlined in red in its evidence shot. The tiny-target check skips anything still popping in (a finite animation on it or a parent), so it never measures a card mid-flight. | free | ~10 min for 80 cases at 8× parallel |
| Monkey | `sweep.ts --monkey` | Random tapping at four taps a second for 45 s per level: crashes and stuck states that a 3-year-old would find | free | included |
| Visual critic | `critic.ts` (Gemini 3.8 Flash) | Filmstrip contact sheets judged as a children's UX designer plus a Reception teacher would: what to tap, clutter, style consistency, frozen screens, pedagogy red flags, delight | pennies | ~1 min |
| Picture audit | `pic-audit.ts --pics` (Gemini vision, blind) | Names every word picture the way a 4-year-old would, without being told the word. `pics-to-content.ts` turns that into `src/content/pic-names.ts`, so picture-only games automatically avoid pictures a child would name with a different sound (fin → "shark", wig → "hair"), and it warns about hand-picked pairs that fail | pennies | ~2 min |
| Jev | `jev-*.ts` marked `@treadmill-stage` | TypeSafe's typed decision model through Cloudflare AI Gateway: lints every spoken line for pedagogy and vocabulary, triages and de-duplicates findings (see docs/JEV.md) | fractions of a penny | seconds |
| Personas | `personas.ts` (Codex gpt-6-sol, headless browsers) | Maya (3¾, can't read, taps everything), Oscar (6, impatient, tries to break things), Ms Patel (Sounds~Write teacher, audits against docs/PEDAGOGY.md using `window.__audioLog`), and a parent setting it up on an iPhone | a few $ | 30–60 min |
| Inbox | `inbox.ts` | Merges everything by signature, tracks it across runs in `playtest/known.json` (open / fixed / wontfix), marks new and regressed items, and auto-closes deterministic findings that stopped appearing | — | instant |

Every source writes the same `Finding` shape (`types.ts`): `sig`, `source`, `severity`, `case`, `title`, `detail`, `evidence[]` and `repro`. Adding a new checker means writing `<runDir>/<name>.json` in that shape and adding it to the list in `inbox.ts`.

## Working the inbox

- Work down from blockers. Evidence links open the exact screenshot, and `repro` is a deep link (`/play/?level=w2-1`).
- For a false alarm, run `bun scripts/treadmill/inbox.ts <runDir> --wontfix <sig>`. It is remembered for every later run.
- Checker noise gets fixed in the checker, not by ignoring it. Example: the map hero deliberately covers its own node, so it carries `data-tap-proxy`.
- The bots' brain is `bot.ts: step()`, driven by `window.__snState`, which every scene publishes. When you add a scene, publish `__snState` and teach `step()` to play it, or the sweep reports it as stuck.

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
