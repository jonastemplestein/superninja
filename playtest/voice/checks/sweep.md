# sweep.ts: the default before and after, and --petals

Frozen build of today's tree on 127.0.0.1:4603 (`playtest/runs/voice/.build-checks`).

## Default flags, `--par 3`, six cases (the acceptance)

- **before** (the original sweep.ts and bot.ts): 6/6 finished in 90 s, 0 findings; per case: w1-wu1 33 s, w1-2 40 s, w1-4 42 s, w1-6 23 s, w1-8 39 s, w2-1 47 s
- **after** (the edited ones): 6/6 finished in 90 s, 0 findings; per case: w1-wu1 34 s, w1-2 39 s, w1-4 43 s, w1-6 23 s, w1-8 40 s, w2-1 46 s

## `--petals` (w1-3, w1-10, w2-1, w3-6; all minor until integration)

58 findings: sound-unclassified 47, petal-too-small 9, petal-giveaway 2.

- `w1-10` **petal-giveaway**: The /p/ petal (its picture is a pig) is on screen with an answer card "pig": the petal gives the answer away (SOUND_DISPLAY A12). Cards: fan, pig.
- `w1-3` **petal-giveaway**: The /a/ petal (its picture is a apple) is on screen with an answer card "apple": the petal gives the answer away (SOUND_DISPLAY A12). Cards: pig, apple.
- `w1-10` **petal-too-small**: The /n/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w1-10` **petal-too-small**: The /p/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w1-3` **petal-too-small**: The /a/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w1-3` **petal-too-small**: The /t/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w2-1` **petal-too-small**: The /k/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w2-1` **petal-too-small**: The /g/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w3-6` **petal-too-small**: The /ks/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w3-6` **petal-too-small**: The /f/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).
- `w3-6` **petal-too-small**: The /s/ petal's picture is 30 CSS px on the 844×390 phone (want ≥ 38; the badge is 49 px wide).

sound-unclassified, the first six:

- `w1-3` A lone sound /a/ (pick, after first_q) has no job (show: petal, tile or hidden).
- `w1-3` A lone sound /a/ (pick, after fs_ant) has no job (show: petal, tile or hidden).
- `w1-3` A lone sound /a/ (pick, after audit_hear_see) has no job (show: petal, tile or hidden).
- `w1-3` A lone sound /a/ (pick, after fs_apple) has no job (show: petal, tile or hidden).
- `w1-3` A lone sound /a/ (pick, after how_we_spell) has no job (show: petal, tile or hidden).
- `w1-3` A lone sound /t/ (pick, after fs_tent) has no job (show: petal, tile or hidden).
