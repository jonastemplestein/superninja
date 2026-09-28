# Sound display probe

Run playtest/runs/fix/C1/sound3, fast=3, 844×390, personas: perfect, learner. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.

| case | scene | context | kind | job | sounds | petal visible | drawn as | frame |
|---|---|---|---|---|---|---|---|---|
| w1-2 | pick | line tv_first_frame | talk  |  | 2 | 0/2 |  | frames/w1-2-perfect-000-talk-tv_first_frame-NONE.png |
| w1-2 | pick | line tv_ne_frame | talk  |  | 2 | 0/2 |  | frames/w1-2-perfect-030-talk-tv_ne_frame-NONE.png |
| w1-2 | pick | line tv_first_done | talk  |  | 2 | 0/2 |  | frames/w1-2-perfect-036-talk-tv_first_done-NONE.png |
| w1-2 | pick | line tv_first_sound | talk m |  | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-001-talk-m-petal.png |
| w1-2 | pick | after tv_first_sound | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-002-sound-m-petal.png |
| w1-2 | pick | line tv_petal_say | talk m s |  | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-003-talk-m-petal.png |
| w1-2 | pick | after tv_petal_say | sound m s | petal | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-004-sound-m-petal.png |
| w1-2 | pick | after fs_map | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-005-sound-m-petal.png |
| w1-2 | pick | after first_q | sound m s | petal | 7 | 7/7 | SoundBadge | frames/w1-2-perfect-006-sound-m-petal.png |
| w1-2 | pick | after fs_milk | sound m | petal | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-007-sound-m-petal.png |
| w1-2 | pick | after tv_how_we_write | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-008-sound-m-petal.png |
| w1-2 | pick | line tv_tap_it_say | talk m s |  | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-009-talk-m-petal.png |
| w1-2 | pick | after tv_tap_it_say | sound m s | tile | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-010-sound-m-petal.png |
| w1-2 | pick | after fs_man | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-012-sound-m-petal.png |
| w1-2 | pick | line tv_next_sound | talk s |  | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-013-talk-s-petal.png |
| w1-2 | pick | after tv_next_sound | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-014-sound-s-petal.png |
| w1-2 | pick | after fs_sock | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-017-sound-s-petal.png |
| w1-2 | pick | after st_first_q2 | sound s m | petal | 5 | 5/5 | SoundBadge | frames/w1-2-perfect-018-sound-s-petal.png |
| w1-2 | pick | after fs_sun | sound s | petal | 3 | 3/3 | SoundBadge | frames/w1-2-perfect-019-sound-s-petal.png |
| w1-2 | pick | after tv_and_how_we_write | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-020-sound-s-petal.png |
| w1-2 | pick | after st_first_q3 | sound s | petal | 3 | 3/3 | SoundBadge | frames/w1-2-perfect-023-sound-s-petal.png |
| w1-2 | pick | after fs_sit | sound s | petal | 3 | 3/3 | SoundBadge | frames/w1-2-perfect-024-sound-s-petal.png |
| w1-2 | pick | line tv_mix_up | talk m |  | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-025-talk-m-petal.png |
| w1-2 | pick | after fs_mug | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-027-sound-m-petal.png |
| w1-2 | pick | after tv_which_write | sound m s | petal | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-031-sound-m-petal.png |
| w1-2 | pick | (inside a blend: sound after sound) | sound m s | tile | 6 | 6/6 | SoundBadge | frames/w1-2-perfect-032-sound-m-petal.png |
| w1-2 | pick | line tv_praise_write | talk m |  | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-033-talk-m-petal.png |
| w1-2 | reward | line tv_won_two | talk m |  | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-037-talk-m-petal.png |
| w1-2 | reward | after tv_won_two | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-038-sound-m-petal.png |
| w1-2 | reward | (inside a blend: sound after sound) | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-039-sound-s-petal.png |
| w1-2 | reward | line tv_to_flower_first | talk m |  | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-040-talk-m-petal.png |
| w1-2 | pick | after fs_mop | sound m | petal | 1 | 1/1 | SoundBadge | frames/w1-2-learner-012-sound-m-petal.png |
| w1-2 | pick | after tv_fix_start | sound s m | petal | 4 | 4/4 | SoundBadge | frames/w1-2-learner-020-sound-s-petal.png |
| w1-2 | pick | after fs_sand | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-learner-027-sound-s-petal.png |
| w1-2 | pick | after fs_mat | sound m | petal | 1 | 1/1 | SoundBadge | frames/w1-2-learner-034-sound-m-petal.png |
| w1-2 | pick | line fm_diff_sun | talk m |  | 1 | 1/1 | SoundBadge | frames/w1-2-learner-038-talk-m-petal.png |
| w1-2 | pick | after tv_thats_write | sound s | petal | 2 | 2/2 | SoundBadge | frames/w1-2-learner-045-sound-s-petal.png |
| w1-2 | pick | after we_need | sound m | petal | 2 | 2/2 | SoundBadge | frames/w1-2-learner-046-sound-m-petal.png |
| w1-2 | pick | after tv_find_write | sound m | petal | 1 | 1/1 | SoundBadge | frames/w1-2-learner-050-sound-m-petal.png |
| w1-2 | pick | after tv_now_find | sound s | petal | 1 | 1/1 | SoundBadge | frames/w1-2-learner-054-sound-s-petal.png |
| w1-4 | build | (inside a blend: sound after sound) | sound m t a | tile | 12 | 0/12 |  | frames/w1-4-perfect-010-sound-m-NONE.png |
| w1-4 | build | line first_sound_q | talk  |  | 8 | 0/8 |  | frames/w1-4-perfect-011-talk-first_sound_q-NONE.png |
| w1-4 | read | (inside a blend: sound after sound) | sound m t | tile | 8 | 0/8 |  | frames/w1-4-perfect-035-sound-m-NONE.png |
| w1-4 | build | after w/at | sound t a | tile | 6 | 0/6 |  | frames/w1-4-perfect-014-sound-t-NONE.png |
| w1-4 | build | line last_sound_q | talk  |  | 6 | 0/6 |  | frames/w1-4-perfect-022-talk-last_sound_q-NONE.png |
| w1-4 | build | line say_sounds_read | talk  |  | 4 | 0/4 |  | frames/w1-4-perfect-024-talk-say_sounds_read-NONE.png |
| w1-4 | build | after say_sounds_read | sound a | tile | 4 | 0/4 |  | frames/w1-4-perfect-025-sound-a-NONE.png |
| w1-4 | build | after w/am | sound a m | tile | 4 | 0/4 |  | frames/w1-4-learner-021-sound-a-NONE.png |
| w1-4 | build | after first_sound_q | sound a | tile | 3 | 0/3 |  | frames/w1-4-perfect-012-sound-a-NONE.png |
| w1-4 | build | after last_sound_q | sound m t | tile | 3 | 0/3 |  | frames/w1-4-perfect-023-sound-m-NONE.png |
| w1-4 | read | after tv_fs_say_slow | sound a | tile | 3 | 0/3 |  | frames/w1-4-perfect-036-sound-a-NONE.png |
| w1-4 | build | line tv_build_frame | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-000-talk-tv_build_frame-NONE.png |
| w1-4 | build | line tv_build_lines | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-001-talk-tv_build_lines-NONE.png |
| w1-4 | build | line st_hear_two | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-003-talk-st_hear_two-NONE.png |
| w1-4 | build | line tv_first_is | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-005-talk-tv_first_is-NONE.png |
| w1-4 | build | after tv_first_is | sound a | tile | 2 | 0/2 |  | frames/w1-4-perfect-006-sound-a-NONE.png |
| w1-4 | build | after tv_you_find_last | sound m | tile | 2 | 0/2 |  | frames/w1-4-perfect-007-sound-m-NONE.png |
| w1-4 | build | line tv_lets_say_read | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-008-talk-tv_lets_say_read-NONE.png |
| w1-4 | build | after tv_lets_say_read | sound a | tile | 2 | 0/2 |  | frames/w1-4-perfect-009-sound-a-NONE.png |
| w1-4 | build | line tv_last_first | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-013-talk-tv_last_first-NONE.png |
| w1-4 | build | line tv_fs_say_sounds_slow | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-015-talk-tv_fs_say_sounds_slow-NONE.png |
| w1-4 | build | after tv_fs_say_sounds_slow | sound a | tile | 2 | 0/2 |  | frames/w1-4-perfect-016-sound-a-NONE.png |
| w1-4 | read | line tv_you_read_first | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-033-talk-tv_you_read_first-NONE.png |
| w1-4 | read | after tv_you_read_first | sound a | tile | 2 | 0/2 |  | frames/w1-4-perfect-034-sound-a-NONE.png |
| w1-4 | read | line tv_build_done | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-040-talk-tv_build_done-NONE.png |
| w1-4 | reward | line audit_gem_first | talk  |  | 2 | 0/2 |  | frames/w1-4-perfect-041-talk-audit_gem_first-NONE.png |
| w1-4 | build | line audit_listen_next | talk  |  | 2 | 0/2 |  | frames/w1-4-learner-023-talk-audit_listen_next-NONE.png |
| w1-4 | read | line read_tap_sounds | talk  |  | 2 | 0/2 |  | frames/w1-4-learner-059-talk-read_tap_sounds-NONE.png |
| w1-4 | read | after read_tap_sounds | sound a | tile | 2 | 0/2 |  | frames/w1-4-learner-060-sound-a-NONE.png |
| w1-4 | build | line tv_fs_praise_every | talk  |  | 1 | 0/1 |  | frames/w1-4-learner-043-talk-tv_fs_praise_every-NONE.png |
| w1-4 | read | after tv_rc_q | sound a | tile | 1 | 0/1 |  | frames/w1-4-learner-053-sound-a-NONE.png |
| w1-4 | read | line tv_fs_tortoise | talk  |  | 1 | 0/1 |  | frames/w1-4-learner-058-talk-tv_fs_tortoise-NONE.png |
| w1-4 | read | after tv_yes_kai | sound a | tile | 1 | 0/1 |  | frames/w1-4-learner-062-sound-a-NONE.png |
| w1-7 | build | (inside a blend: sound after sound) | sound t i s | tile | 15 | 0/15 |  | frames/w1-7-perfect-031-sound-t-NONE.png |
| w1-7 | read | (inside a blend: sound after sound) | sound i t | tile | 14 | 0/14 |  | frames/w1-7-perfect-053-sound-i-NONE.png |
| w1-7 | build | after w/sit | sound i t s | tile | 9 | 0/9 |  | frames/w1-7-perfect-035-sound-i-NONE.png |
| w1-7 | build | line first_sound_q | talk  |  | 7 | 0/7 |  | frames/w1-7-perfect-032-talk-first_sound_q-NONE.png |
| w1-7 | build | line last_sound_q | talk  |  | 5 | 0/5 |  | frames/w1-7-perfect-047-talk-last_sound_q-NONE.png |
| w1-7 | build | after w/it | sound i t | tile | 4 | 0/4 |  | frames/w1-7-learner-046-sound-i-NONE.png |
| w1-7 | build | after first_sound_q | sound s i | tile | 3 | 0/3 |  | frames/w1-7-perfect-033-sound-s-NONE.png |
| w1-7 | read | after tv_fs_say_slow | sound s | tile | 3 | 0/3 |  | frames/w1-7-perfect-055-sound-s-NONE.png |
| w1-7 | build | line audit_listen_next | talk  |  | 3 | 0/3 |  | frames/w1-7-learner-048-talk-audit_listen_next-NONE.png |
| w1-7 | build | line say_sounds_read | talk  |  | 3 | 0/3 |  | frames/w1-7-learner-050-talk-say_sounds_read-NONE.png |
| w1-7 | build | after say_sounds_read | sound i s | tile | 3 | 0/3 |  | frames/w1-7-learner-051-sound-i-NONE.png |
| w1-7 | pick | line tv_hunt_frame | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-000-talk-tv_hunt_frame-NONE.png |
| w1-7 | build | line tv_next_build | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-019-talk-tv_next_build-NONE.png |
| w1-7 | build | line tv_build_lines | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-022-talk-tv_build_lines-NONE.png |
| w1-7 | build | line st_hear_two | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-024-talk-st_hear_two-NONE.png |
| w1-7 | build | line tv_first_is | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-026-talk-tv_first_is-NONE.png |
| w1-7 | build | after tv_first_is | sound i | tile | 2 | 0/2 |  | frames/w1-7-perfect-027-sound-i-NONE.png |
| w1-7 | build | after tv_you_find_last | sound t | tile | 2 | 0/2 |  | frames/w1-7-perfect-028-sound-t-NONE.png |
| w1-7 | build | line tv_lets_say_read | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-029-talk-tv_lets_say_read-NONE.png |
| w1-7 | build | after tv_lets_say_read | sound i | tile | 2 | 0/2 |  | frames/w1-7-perfect-030-sound-i-NONE.png |
| w1-7 | build | line tv_next_middle | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-034-talk-tv_next_middle-NONE.png |
| w1-7 | build | line tv_last_first | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-036-talk-tv_last_first-NONE.png |
| w1-7 | build | line tv_fs_say_sounds_slow | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-038-talk-tv_fs_say_sounds_slow-NONE.png |
| w1-7 | build | after tv_fs_say_sounds_slow | sound s | tile | 2 | 0/2 |  | frames/w1-7-perfect-039-sound-s-NONE.png |
| w1-7 | build | line tv_fs_gaps | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-044-talk-tv_fs_gaps-NONE.png |
| w1-7 | build | after last_sound_q | sound t | tile | 2 | 0/2 |  | frames/w1-7-perfect-048-sound-t-NONE.png |
| w1-7 | read | line tv_you_read_first | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-051-talk-tv_you_read_first-NONE.png |
| w1-7 | read | after tv_you_read_first | sound s | tile | 2 | 0/2 |  | frames/w1-7-perfect-052-sound-s-NONE.png |
| w1-7 | read | line tv_hunt_done | talk  |  | 2 | 0/2 |  | frames/w1-7-perfect-060-talk-tv_hunt_done-NONE.png |
| w1-7 | build | line next_sound_q | talk  |  | 2 | 0/2 |  | frames/w1-7-learner-055-talk-next_sound_q-NONE.png |
| w1-7 | read | line read_tap_sounds | talk  |  | 2 | 0/2 |  | frames/w1-7-learner-091-talk-read_tap_sounds-NONE.png |
| w1-7 | read | after read_tap_sounds | sound i s | tile | 2 | 0/2 |  | frames/w1-7-learner-092-sound-i-NONE.png |
| w1-7 | read | after tv_rc_q | sound s | tile | 1 | 0/1 |  | frames/w1-7-learner-085-sound-s-NONE.png |
| w1-7 | read | after tv_yes_suki | sound i | tile | 1 | 0/1 |  | frames/w1-7-learner-094-sound-i-NONE.png |
| w1-7 | pick | line tv_here_sound | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-001-talk-i-petal.png |
| w1-7 | pick | after tv_here_sound | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-002-sound-i-petal.png |
| w1-7 | pick | line tv_petal_say | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-003-talk-i-petal.png |
| w1-7 | pick | after tv_petal_say | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-004-sound-i-petal.png |
| w1-7 | pick | line mid_pin | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-006-talk-i-petal.png |
| w1-7 | pick | after mid_pin | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-007-sound-i-petal.png |
| w1-7 | pick | line tv_hunt_q | talk i |  | 4 | 4/4 | SoundBadge | frames/w1-7-perfect-008-talk-i-petal.png |
| w1-7 | pick | after tv_hunt_q | sound i | petal | 4 | 4/4 | SoundBadge | frames/w1-7-perfect-009-sound-i-petal.png |
| w1-7 | pick | line mid_tin | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-010-talk-i-petal.png |
| w1-7 | pick | after mid_tin | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-011-sound-i-petal.png |
| w1-7 | pick | after tv_how_we_write | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-012-sound-i-petal.png |
| w1-7 | pick | line tv_tap_it_say | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-013-talk-i-petal.png |
| w1-7 | pick | after tv_tap_it_say | sound i | tile | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-014-sound-i-petal.png |
| w1-7 | pick | line mid_lid | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-017-talk-i-petal.png |
| w1-7 | pick | after mid_lid | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-018-sound-i-petal.png |
| w1-7 | build | after tv_next_build | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-020-sound-i-petal.png |
| w1-7 | build | line tv_build_frame | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-021-talk-i-petal.png |
| w1-7 | reward | line tv_won_one | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-061-talk-i-petal.png |
| w1-7 | reward | after tv_won_one | sound i | petal | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-062-sound-i-petal.png |
| w1-7 | reward | line audit_gem_first | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-063-talk-i-petal.png |
| w1-7 | reward | line tv_to_flower_first | talk i |  | 2 | 2/2 | SoundBadge | frames/w1-7-perfect-064-talk-i-petal.png |
