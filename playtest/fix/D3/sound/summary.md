# Sound display probe

Run playtest/runs/fix/D3/r8/sound, fast=3, 844×390, personas: perfect, learner. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.

| case | scene | context | kind | job | sounds | petal visible | drawn as | frame |
|---|---|---|---|---|---|---|---|---|
| w1-8 | swap | (inside a blend: sound after sound) | sound a t s i m | tile | 28 | 2/28 | SoundBadge | frames/w1-8-perfect-002-sound-a-NONE.png |
| w1-8 | swap | after tv_swap_pick | sound s a i | tile | 6 | 0/6 |  | frames/w1-8-perfect-017-sound-s-NONE.png |
| w1-8 | swap | line tv_which_changes | talk  |  | 5 | 0/5 |  | frames/w1-8-perfect-026-talk-tv_which_changes-NONE.png |
| w1-8 | swap | line tv_swap_read_first | talk  |  | 4 | 0/4 |  | frames/w1-8-perfect-000-talk-tv_swap_read_first-NONE.png |
| w1-8 | swap | after tv_swap_read_first | sound m a | tile | 4 | 0/4 |  | frames/w1-8-perfect-001-sound-m-NONE.png |
| w1-8 | swap | line st_middle_changes | talk  |  | 4 | 0/4 |  | frames/w1-8-perfect-016-talk-st_middle_changes-NONE.png |
| w1-8 | swap | line st_first_changes | talk  |  | 4 | 0/4 |  | frames/w1-8-perfect-027-talk-st_first_changes-NONE.png |
| w1-8 | swap | after st_first_changes | sound m i | tile | 3 | 0/3 |  | frames/w1-8-perfect-028-sound-m-NONE.png |
| w1-8 | swap | line tv_swap_frame | talk  |  | 2 | 0/2 |  | frames/w1-8-perfect-005-talk-tv_swap_frame-NONE.png |
| w1-8 | swap | line tv_swap_kick | talk  |  | 2 | 0/2 |  | frames/w1-8-perfect-008-talk-tv_swap_kick-NONE.png |
| w1-8 | swap | line st_last_changes | talk  |  | 2 | 0/2 |  | frames/w1-8-perfect-035-talk-st_last_changes-NONE.png |
| w1-8 | reward | line audit_gem_first | talk  |  | 2 | 0/2 |  | frames/w1-8-perfect-041-talk-audit_gem_first-NONE.png |
| w1-8 | swap | line swap_which | talk  |  | 2 | 0/2 |  | frames/w1-8-learner-038-talk-swap_which-NONE.png |
| w1-8 | swap | after st_last_changes | sound a | tile | 1 | 0/1 |  | frames/w1-8-perfect-036-sound-a-NONE.png |
| w1-8 | swap | after tv_swap_kick | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-8-perfect-009-sound-m-petal.png |
| w1-8 | swap | after tv_swap_in | sound s | petal | 2 | 2/2 | SoundBadge (+50 ms), SoundBadge | frames/w1-8-perfect-010-sound-s-petal.png |
| w1-8 | swap | after thats | sound s a t | petal | 4 | 4/4 | SoundBadge | frames/w1-8-learner-022-sound-s-petal.png |
| w1-8 | swap | line stays_same | talk s a t |  | 4 | 4/4 | SoundBadge | frames/w1-8-learner-023-talk-s-petal.png |
