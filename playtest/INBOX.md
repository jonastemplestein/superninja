# Playtest inbox

Run `playtest/runs/2026-09-28-10-20-45-quick` · 2026-09-28T10:22 · bots finished 13/13 cases in 74s at 4× · sources: sweep.json

**0 blockers · 1 major · 0 minor · 0 polish** — 1 new, 0 regressed, 4 auto-closed since last run.

Triage: fix, then rerun; mark false alarms with `bun scripts/treadmill/inbox.ts playtest/runs/2026-09-28-10-20-45-quick --wontfix <sig>`.

## Major (1)

- **overlapping-targets: button.sound-badge.tier-turn[aria-label="Hear the sound"] + button.card.rw-tap[aria-label="petal s"]** · `w1-2` · invariant · 🆕
  100% overlap
  [issue_0.png](runs/2026-09-28-10-20-45-quick/cases/w1-2/issue_0.png)
  repro: http://127.0.0.1:4180/play/?level=w1-2
  <sub>bot:w1-2:overlapping-targets:button.sound-badge.tier-turn[aria-label="Hear the sound"] + button.card.rw-tap[aria-label="petal s"]</sub>

## Auto-closed (no longer seen)

- ~~auto-answer: stickers turn~~ `w1-wu1` <sub>bot:w1-wu1:auto-answer:stickers turn</sub>
- ~~replay-stale: level/W2:next-game~~ `w1-wu2` <sub>bot:w1-wu2:replay-stale:level/W2:next-game</sub>
- ~~replay-stale: level/build~~ `w1-4` <sub>bot:w1-4:replay-stale:level/build</sub>
- ~~replay-stale: level/build~~ `w1-7` <sub>bot:w1-7:replay-stale:level/build</sub>
