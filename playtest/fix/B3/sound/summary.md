# Sound display probe

Run playtest/runs/fix/B3/sound-r3, fast=3, 844×390, personas: perfect, learner. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.

| case | scene | context | kind | job | sounds | petal visible | drawn as | frame |
|---|---|---|---|---|---|---|---|---|
| flower-intro | tree | line flower_i1 | talk  |  | 2 | 0/2 |  | frames/flower-intro-learner-000-talk-flower_i1-NONE.png |
| flower-intro | tree | line flower_tap | talk  |  | 2 | 0/2 |  | frames/flower-intro-learner-006-talk-flower_tap-NONE.png |
| flower-intro | tree | line tv_flower_petal | talk s |  | 2 | 2/2 | WorldFlower petal | frames/flower-intro-learner-001-talk-s-petal.png |
| flower-intro | tree | after tv_flower_petal | sound s | petal | 2 | 2/2 | SoundBadge | frames/flower-intro-learner-002-sound-s-petal.png |
| flower-intro | tree | line tv_flower_tap | talk s |  | 2 | 2/2 | SoundBadge | frames/flower-intro-learner-003-talk-s-petal.png |
| flower-intro | tree | after tv_flower_tap | sound s | petal | 2 | 2/2 | SoundBadge | frames/flower-intro-learner-004-sound-s-petal.png |
| flower-intro | tree | line wf_i3 | talk s |  | 2 | 2/2 | SoundBadge | frames/flower-intro-learner-005-talk-s-petal.png |
| tree-found | tree | line tv_flower_bye | talk  |  | 2 | 0/2 |  | frames/tree-found-learner-009-talk-tv_flower_bye-NONE.png |
| tree-found | tree | line wf_found_sound | talk ae |  | 2 | 2/2 | BigPetal | frames/tree-found-learner-000-talk-ae-petal.png |
| tree-found | tree | line tv_here_sound | talk ae |  | 4 | 4/4 | BigPetal | frames/tree-found-learner-001-talk-ae-petal.png |
| tree-found | tree | after tv_here_sound | sound ae | petal | 4 | 4/4 | BigPetal | frames/tree-found-learner-002-sound-ae-petal.png |
| tree-found | tree | line t_two_letters | talk ae |  | 4 | 4/4 | BigPetal | frames/tree-found-learner-003-talk-ae-petal.png |
| tree-found | tree | line same_sound_new | talk ae |  | 2 | 2/2 | BigPetal | frames/tree-found-learner-004-talk-ae-petal.png |
| tree-found | tree | after t_ways_2 | sound ae | petal | 2 | 2/2 | BigPetal | frames/tree-found-learner-008-sound-ae-petal.png |
| tree-found-th | tree | line tv_flower_bye | talk  |  | 2 | 0/2 |  | frames/tree-found-th-perfect-004-talk-tv_flower_bye-NONE.png |
| tree-found-th | tree | line wf_found_sound | talk dh |  | 2 | 2/2 | BigPetal | frames/tree-found-th-perfect-000-talk-dh-petal.png |
| tree-found-th | tree | line tv_here_sound | talk dh |  | 2 | 2/2 | BigPetal | frames/tree-found-th-perfect-001-talk-dh-petal.png |
| tree-found-th | tree | after tv_here_sound | sound dh | petal | 2 | 2/2 | BigPetal | frames/tree-found-th-perfect-002-sound-dh-petal.png |
| tree-found-th | tree | line t_two_letters | talk dh |  | 2 | 2/2 | BigPetal | frames/tree-found-th-perfect-003-talk-dh-petal.png |
| tree-world | tree | line wf_petals_you_know | talk d |  | 2 | 2/2 | WorldFlower petal | frames/tree-world-perfect-000-talk-d-petal.png |
| tree-world | tree | after t_diff_spellings_of | sound ae | petal | 2 | 2/2 | SoundBadge | frames/tree-world-perfect-001-sound-ae-petal.png |
| tree-world | tree | line t_same_sound | talk ae |  | 2 | 2/2 | SoundBadge | frames/tree-world-perfect-002-talk-ae-petal.png |
| tree-world | tree | line wf_world_new | talk d |  | 2 | 2/2 | WorldFlower petal | frames/tree-world-perfect-003-talk-d-petal.png |
