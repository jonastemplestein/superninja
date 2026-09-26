# Sound display probe

Run playtest/sound-display/run1, fast=3, 844×390, personas: perfect, learner. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.

| case | scene | context | kind | sounds | petal visible | drawn as | frame |
|---|---|---|---|---|---|---|---|
| flower-intro | tree | line flower_tap | talk  | 6 | 0/6 |  | frames/flower-intro-perfect-005-talk-flower_tap-NONE.png |
| flower-intro | tree | line flower_i1 | talk  | 2 | 0/2 |  | frames/flower-intro-perfect-000-talk-flower_i1-NONE.png |
| flower-intro | tree | line flower_i2 | talk  | 2 | 0/2 |  | frames/flower-intro-perfect-001-talk-flower_i2-NONE.png |
| flower-intro | tree | line flower_i6 | talk  | 2 | 0/2 |  | frames/flower-intro-perfect-004-talk-flower_i6-NONE.png |
| flower-intro | tree | after flower_i2 | sound a | 2 | 2/2 | SoundBadge | frames/flower-intro-perfect-002-sound-a-petal.png |
| flower-intro | tree | line wf_i3 | talk a | 2 | 2/2 | SoundBadge | frames/flower-intro-perfect-003-talk-a-petal.png |
| placement | find | (inside a blend: sound after sound) | sound e n t | 6 | 0/6 |  | frames/placement-perfect-003-sound-e-NONE.png |
| placement | find | after place_spell | sound p h v | 3 | 0/3 |  | frames/placement-perfect-002-sound-p-NONE.png |
| placement | find | after place_sound | sound o | 1 | 0/1 |  | frames/placement-learner-001-sound-o-NONE.png |
| placement | find | line place_sound | talk m p t s | 8 | 8/8 | SoundBadge | frames/placement-perfect-000-talk-m-petal.png |
| placement | find | line place_findall | talk ae | 1 | 1/1 | SoundBadge | frames/placement-perfect-005-talk-ae-petal.png |
| tree-found | tree | line wf_found_sound | talk ae d | 6 | 6/6 | BigPetal, WorldFlower petal | frames/tree-found-perfect-000-talk-ae-petal.png |
| tree-found | tree | after t_way_we_spell | sound ae | 10 | 10/10 | SoundBadge | frames/tree-found-perfect-001-sound-ae-petal.png |
| tree-found | tree | line t_two_letters | talk ae | 10 | 10/10 | SoundBadge | frames/tree-found-perfect-002-talk-ae-petal.png |
| tree-found | tree | line same_sound_new | talk ae | 5 | 5/5 | BigPetal | frames/tree-found-perfect-003-talk-ae-petal.png |
| tree-found | tree | after t_ways_2 | sound ae | 4 | 4/4 | SoundBadge | frames/tree-found-perfect-006-sound-ae-petal.png |
| tree-found-th | tree | line wf_found_sound | talk dh | 6 | 6/6 | BigPetal | frames/tree-found-th-perfect-000-talk-dh-petal.png |
| tree-found-th | tree | after t_way_we_spell | sound dh | 5 | 5/5 | SoundBadge | frames/tree-found-th-perfect-001-sound-dh-petal.png |
| tree-found-th | tree | line t_two_letters | talk dh | 5 | 5/5 | SoundBadge | frames/tree-found-th-perfect-002-talk-dh-petal.png |
| tree-free | tree | line flower_tap | talk  | 2 | 0/2 |  | frames/tree-free-perfect-000-talk-flower_tap-NONE.png |
| tree-free | tree | after flower_tap | sound a | 2 | 2/2 | WorldFlower petal | frames/tree-free-perfect-001-sound-a-petal.png |
| tree-free | tree | line t_petal_is | talk a | 2 | 2/2 | SoundBadge | frames/tree-free-perfect-002-talk-a-petal.png |
| tree-free | tree | after t_petal_is | sound a | 2 | 2/2 | SoundBadge | frames/tree-free-perfect-003-sound-a-petal.png |
| tree-free | tree | after t_now_you_say_it | sound a | 1 | 1/1 | SoundBadge | frames/tree-free-perfect-004-sound-a-petal.png |
| tree-petal | tree | line flower_tap | talk ae | 2 | 2/2 | SoundBadge | frames/tree-petal-perfect-000-talk-ae-petal.png |
| tree-petal | tree | line t_another_way | talk ae | 2 | 2/2 | SoundBadge | frames/tree-petal-perfect-001-talk-ae-petal.png |
| tree-petal | tree | after t_another_way | sound ae | 2 | 2/2 | SoundBadge | frames/tree-petal-perfect-002-sound-ae-petal.png |
| tree-petal | tree | line t_two_letters | talk ae | 2 | 2/2 | SoundBadge | frames/tree-petal-perfect-003-talk-ae-petal.png |
| tree-victory | tree | line trial_win | talk d | 3 | 2/3 | WorldFlower petal | frames/tree-victory-perfect-000-talk-d-petal.png |
| tree-victory | tree | line wf_new_gem_here | talk ae | 3 | 3/3 | BigPetal | frames/tree-victory-perfect-001-talk-ae-petal.png |
| tree-victory | tree | line t_another_way | talk ae | 2 | 2/2 | SoundBadge | frames/tree-victory-perfect-002-talk-ae-petal.png |
| tree-victory | tree | after t_another_way | sound ae | 2 | 2/2 | SoundBadge | frames/tree-victory-perfect-003-sound-ae-petal.png |
| tree-victory | tree | line t_two_letters | talk ae | 2 | 2/2 | SoundBadge | frames/tree-victory-perfect-004-talk-ae-petal.png |
| tree-victory | tree | after t_ways_2 | sound ae | 2 | 2/2 | SoundBadge | frames/tree-victory-perfect-005-sound-ae-petal.png |
| tree-victory | tree | line petal_complete | talk ae | 2 | 2/2 | BigPetal | frames/tree-victory-perfect-006-talk-ae-petal.png |
| tree-victory | tree | after t_way_we_spell | sound ae | 1 | 1/1 | SoundBadge | frames/tree-victory-perfect-009-sound-ae-petal.png |
| tree-world | tree | line wf_petals_you_know | talk d | 6 | 6/6 | WorldFlower petal | frames/tree-world-perfect-000-talk-d-petal.png |
| tree-world | tree | after t_diff_spellings_of | sound ae s l | 4 | 4/4 | SoundBadge | frames/tree-world-perfect-001-sound-ae-petal.png |
| tree-world | tree | line t_same_sound | talk ae s l | 4 | 4/4 | SoundBadge | frames/tree-world-perfect-002-talk-ae-petal.png |
| tree-world | tree | line wf_world_new | talk d | 5 | 5/5 | WorldFlower petal | frames/tree-world-perfect-003-talk-d-petal.png |
| tree-world | tree | line t_petal_is | talk e | 1 | 1/1 | SoundBadge | frames/tree-world-perfect-014-talk-e-petal.png |
| tree-world | tree | after t_petal_is | sound e | 1 | 1/1 | SoundBadge | frames/tree-world-perfect-015-sound-e-petal.png |
| tree-world | tree | after t_now_you_say_it | sound e | 1 | 1/1 | SoundBadge | frames/tree-world-perfect-016-sound-e-petal.png |
| trial | battle | (inside a blend: sound after sound) | sound ae n r t p l | 61 | 0/61 |  | frames/trial-perfect-001-sound-ae-NONE.png |
| trial | battle | after w/snail | sound s n l | 5 | 0/5 |  | frames/trial-perfect-022-sound-s-NONE.png |
| trial | battle | after w/train | sound t ae | 3 | 0/3 |  | frames/trial-perfect-006-sound-t-NONE.png |
| trial | battle | after w/paint | sound p ae | 3 | 0/3 |  | frames/trial-perfect-014-sound-p-NONE.png |
| trial | battle | after w/tail | sound t ae | 3 | 0/3 |  | frames/trial-perfect-030-sound-t-NONE.png |
| trial | battle | after w/nail | sound n ae | 3 | 0/3 |  | frames/trial-perfect-043-sound-n-NONE.png |
| trial | battle | line audit_listen_next | talk  | 3 | 0/3 |  | frames/trial-learner-014-talk-audit_listen_next-NONE.png |
| trial | tree | line trial_win | talk  | 2 | 0/2 |  | frames/trial-perfect-036-talk-trial_win-NONE.png |
| trial | battle | after w/rain | sound r | 1 | 0/1 |  | frames/trial-perfect-000-sound-r-NONE.png |
| trial | tree | line wf_new_gem_here | talk ae | 2 | 2/2 | BigPetal | frames/trial-perfect-037-talk-ae-petal.png |
| trial | tree | line t_another_way | talk ae | 2 | 2/2 | SoundBadge | frames/trial-perfect-038-talk-ae-petal.png |
| trial | tree | after t_another_way | sound ae | 2 | 2/2 | SoundBadge | frames/trial-perfect-039-sound-ae-petal.png |
| trial | tree | line t_two_letters | talk ae | 2 | 2/2 | SoundBadge | frames/trial-perfect-040-talk-ae-petal.png |
| trial | tree | after t_ways_2 | sound ae | 2 | 2/2 | SoundBadge | frames/trial-perfect-041-sound-ae-petal.png |
| trial | tree | line petal_complete | talk ae | 2 | 2/2 | BigPetal | frames/trial-perfect-042-talk-ae-petal.png |
| w1-14 | story | (inside a blend: sound after sound) | sound a t | 6 | 0/6 |  | frames/w1-14-perfect-001-sound-a-NONE.png |
| w1-14 | story | after audit_story_choice | sound m | 2 | 0/2 |  | frames/w1-14-perfect-000-sound-m-NONE.png |
| w1-14 | story | after s/s1_5 | sound m | 1 | 0/1 |  | frames/w1-14-learner-003-sound-m-NONE.png |
| w1-2 | pick | line find_q | talk  | 4 | 0/4 |  | frames/w1-2-perfect-016-talk-find_q-NONE.png |
| w1-2 |  | line first_intro | talk  | 2 | 0/2 |  | frames/w1-2-perfect-000-talk-first_intro-NONE.png |
| w1-2 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w1-2-perfect-019-talk-petals_got-NONE.png |
| w1-2 | pick | after first_q | sound m s | 4 | 4/4 | SoundBadge | frames/w1-2-perfect-001-sound-m-petal.png |
| w1-2 | pick | after fs_mop | sound m | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-002-sound-m-petal.png |
| w1-2 | pick | line audit_hear_see | talk m | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-003-talk-m-petal.png |
| w1-2 | pick | after audit_hear_see | sound m | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-004-sound-m-petal.png |
| w1-2 | pick | after fs_milk | sound m | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-005-sound-m-petal.png |
| w1-2 | pick | after how_we_spell | sound m s | 6 | 6/6 | SoundBadge | frames/w1-2-perfect-006-sound-m-petal.png |
| w1-2 | pick | after fs_mug | sound m | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-007-sound-m-petal.png |
| w1-2 | pick | after fs_sit | sound s | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-009-sound-s-petal.png |
| w1-2 | pick | after fs_sand | sound s | 2 | 2/2 | SoundBadge | frames/w1-2-perfect-011-sound-s-petal.png |
| w1-2 | pick | after fs_sock | sound s | 3 | 3/3 | SoundBadge | frames/w1-2-perfect-013-sound-s-petal.png |
| w1-2 | pick | after fs_man | sound m | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-014-sound-m-petal.png |
| w1-2 | pick | after find_q | sound m | 1 | 1/1 | SoundBadge | frames/w1-2-perfect-017-sound-m-petal.png |
| w1-2 | pick | after fs_map | sound m | 1 | 1/1 | SoundBadge | frames/w1-2-learner-002-sound-m-petal.png |
| w1-2 | pick | after fs_mat | sound m | 1 | 1/1 | SoundBadge | frames/w1-2-learner-007-sound-m-petal.png |
| w1-2 | pick | after fs_sun | sound s | 2 | 2/2 | SoundBadge | frames/w1-2-learner-009-sound-s-petal.png |
| w1-4 | build | after x/am | sound a m | 19 | 0/19 |  | frames/w1-4-perfect-003-sound-a-NONE.png |
| w1-4 | build | line say_sounds_read | talk  | 13 | 0/13 |  | frames/w1-4-perfect-005-talk-say_sounds_read-NONE.png |
| w1-4 | build | after say_sounds_read | sound a | 13 | 0/13 |  | frames/w1-4-perfect-006-sound-a-NONE.png |
| w1-4 | build | (inside a blend: sound after sound) | sound m t | 13 | 0/13 |  | frames/w1-4-perfect-007-sound-m-NONE.png |
| w1-4 | build | line first_sound_q | talk  | 11 | 0/11 |  | frames/w1-4-perfect-008-talk-first_sound_q-NONE.png |
| w1-4 | build | line last_sound_q | talk  | 10 | 0/10 |  | frames/w1-4-perfect-011-talk-last_sound_q-NONE.png |
| w1-4 | read | (inside a blend: sound after sound) | sound m a t | 9 | 0/9 |  | frames/w1-4-perfect-055-sound-m-NONE.png |
| w1-4 | build | after x/at | sound a t | 4 | 0/4 |  | frames/w1-4-perfect-047-sound-a-NONE.png |
| w1-4 | read | line read_tap_sounds | talk  | 4 | 0/4 |  | frames/w1-4-perfect-053-talk-read_tap_sounds-NONE.png |
| w1-4 | read | after read_tap_sounds | sound a | 4 | 0/4 |  | frames/w1-4-perfect-054-sound-a-NONE.png |
| w1-4 |  | line two_sounds | talk  | 3 | 0/3 |  | frames/w1-4-perfect-001-talk-two_sounds-NONE.png |
| w1-4 | build | line build_ido_3 | talk  | 3 | 0/3 |  | frames/w1-4-perfect-002-talk-build_ido_3-NONE.png |
| w1-4 | read | after w/at | sound a | 3 | 0/3 |  | frames/w1-4-perfect-056-sound-a-NONE.png |
| w1-4 | build | after its_this_one | sound t m | 3 | 0/3 |  | frames/w1-4-learner-027-sound-t-NONE.png |
| w1-4 |  | line audit_dojo_first | talk  | 2 | 0/2 |  | frames/w1-4-perfect-000-talk-audit_dojo_first-NONE.png |
| w1-4 | build | line audit_last_place | talk  | 2 | 0/2 |  | frames/w1-4-perfect-010-talk-audit_last_place-NONE.png |
| w1-4 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w1-4-perfect-016-talk-audit_gem_first-NONE.png |
| w1-4 | build | line audit_listen_next | talk  | 1 | 0/1 |  | frames/w1-4-learner-032-talk-audit_listen_next-NONE.png |
| w1-4 | read | after w/am | sound a | 1 | 0/1 |  | frames/w1-4-learner-055-sound-a-NONE.png |
| w1-6 | battle | (inside a blend: sound after sound) | sound a t s m | 29 | 0/29 |  | frames/w1-6-perfect-002-sound-a-NONE.png |
| w1-6 | battle | after x/sat | sound s a t | 3 | 0/3 |  | frames/w1-6-learner-010-sound-s-NONE.png |
| w1-6 | battle | line audit_baron_first | talk  | 2 | 0/2 |  | frames/w1-6-perfect-000-talk-audit_baron_first-NONE.png |
| w1-6 | battle | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w1-6-perfect-007-talk-audit_gem_first-NONE.png |
| w1-6 | battle | after w/at | sound a | 2 | 0/2 |  | frames/w1-6-perfect-008-sound-a-NONE.png |
| w1-6 | battle | after x/mat | sound m t | 2 | 0/2 |  | frames/w1-6-learner-016-sound-m-NONE.png |
| w1-6 | battle | after w/sat | sound s | 1 | 0/1 |  | frames/w1-6-perfect-001-sound-s-NONE.png |
| w1-6 | battle | after w/mat | sound m | 1 | 0/1 |  | frames/w1-6-perfect-012-sound-m-NONE.png |
| w1-6 | battle | after w/am | sound a | 1 | 0/1 |  | frames/w1-6-perfect-018-sound-a-NONE.png |
| w1-6 | battle | after x/am | sound a | 1 | 0/1 |  | frames/w1-6-learner-006-sound-a-NONE.png |
| w1-7 | build | (inside a blend: sound after sound) | sound t i | 23 | 0/23 |  | frames/w1-7-perfect-019-sound-t-NONE.png |
| w1-7 | build | after x/it | sound i t | 20 | 0/20 |  | frames/w1-7-perfect-015-sound-i-NONE.png |
| w1-7 | build | line say_sounds_read | talk  | 17 | 0/17 |  | frames/w1-7-perfect-017-talk-say_sounds_read-NONE.png |
| w1-7 | build | after say_sounds_read | sound i s | 17 | 0/17 |  | frames/w1-7-perfect-018-sound-i-NONE.png |
| w1-7 | read | (inside a blend: sound after sound) | sound i t s | 15 | 0/15 |  | frames/w1-7-perfect-038-sound-i-NONE.png |
| w1-7 | build | line first_sound_q | talk  | 14 | 0/14 |  | frames/w1-7-perfect-020-talk-first_sound_q-NONE.png |
| w1-7 | build | line last_sound_q | talk  | 14 | 0/14 |  | frames/w1-7-perfect-023-talk-last_sound_q-NONE.png |
| w1-7 | build | after x/sit | sound s t i | 12 | 0/12 |  | frames/w1-7-learner-030-sound-s-NONE.png |
| w1-7 | pick | line hunt_q | talk  | 9 | 0/9 |  | frames/w1-7-perfect-002-talk-hunt_q-NONE.png |
| w1-7 | build | after its_this_one | sound i t | 8 | 0/8 |  | frames/w1-7-learner-032-sound-i-NONE.png |
| w1-7 | build | line next_sound_q | talk  | 6 | 0/6 |  | frames/w1-7-learner-031-talk-next_sound_q-NONE.png |
| w1-7 | build | line audit_listen_next | talk  | 5 | 0/5 |  | frames/w1-7-learner-034-talk-audit_listen_next-NONE.png |
| w1-7 | read | line read_tap_sounds | talk  | 4 | 0/4 |  | frames/w1-7-perfect-036-talk-read_tap_sounds-NONE.png |
| w1-7 | read | after read_tap_sounds | sound s i | 4 | 0/4 |  | frames/w1-7-perfect-037-sound-s-NONE.png |
| w1-7 |  | line hunt_intro | talk  | 3 | 0/3 |  | frames/w1-7-perfect-000-talk-hunt_intro-NONE.png |
| w1-7 | build | line build_ido_3 | talk  | 3 | 0/3 |  | frames/w1-7-perfect-014-talk-build_ido_3-NONE.png |
| w1-7 |  | line audit_middle_place | talk  | 2 | 0/2 |  | frames/w1-7-perfect-001-talk-audit_middle_place-NONE.png |
| w1-7 | build | line audit_last_place | talk  | 2 | 0/2 |  | frames/w1-7-perfect-022-talk-audit_last_place-NONE.png |
| w1-7 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w1-7-perfect-028-talk-audit_gem_first-NONE.png |
| w1-7 | read | after w/sat | sound s | 2 | 0/2 |  | frames/w1-7-perfect-040-sound-s-NONE.png |
| w1-7 | reward | line petal_got | talk  | 2 | 0/2 |  | frames/w1-7-perfect-043-talk-petal_got-NONE.png |
| w1-7 | read | after w/it | sound i | 1 | 0/1 |  | frames/w1-7-learner-159-sound-i-NONE.png |
| w1-7 | read | after w/sit | sound s | 1 | 0/1 |  | frames/w1-7-learner-165-sound-s-NONE.png |
| w1-7 | pick | after hunt_q | sound i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-003-sound-i-petal.png |
| w1-7 | pick | line mid_pin | talk i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-004-talk-i-petal.png |
| w1-7 | pick | after mid_pin | sound i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-005-sound-i-petal.png |
| w1-7 | pick | after how_we_spell | sound i | 6 | 6/6 | SoundBadge | frames/w1-7-perfect-006-sound-i-petal.png |
| w1-7 | pick | line mid_tin | talk i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-008-talk-i-petal.png |
| w1-7 | pick | after mid_tin | sound i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-009-sound-i-petal.png |
| w1-7 | pick | line mid_lid | talk i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-012-talk-i-petal.png |
| w1-7 | pick | after mid_lid | sound i | 3 | 3/3 | SoundBadge | frames/w1-7-perfect-013-sound-i-petal.png |
| w1-8 | swap | (inside a blend: sound after sound) | sound a t i | 20 | 0/20 |  | frames/w1-8-perfect-003-sound-a-NONE.png |
| w1-8 | swap | line swap_pick | talk  | 6 | 0/6 |  | frames/w1-8-perfect-010-talk-swap_pick-NONE.png |
| w1-8 | swap | after swap_pick | sound s m i | 6 | 0/6 |  | frames/w1-8-perfect-011-sound-s-NONE.png |
| w1-8 | swap | line swap_start | talk  | 2 | 0/2 |  | frames/w1-8-perfect-000-talk-swap_start-NONE.png |
| w1-8 | swap | line audit_swap_first | talk  | 2 | 0/2 |  | frames/w1-8-perfect-001-talk-audit_swap_first-NONE.png |
| w1-8 | swap | after audit_swap_first | sound s | 2 | 0/2 |  | frames/w1-8-perfect-002-sound-s-NONE.png |
| w1-8 | swap | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w1-8-perfect-005-talk-audit_gem_first-NONE.png |
| w1-8 | swap | line audit_swap_middle | talk  | 2 | 0/2 |  | frames/w1-8-perfect-006-talk-audit_swap_middle-NONE.png |
| w1-8 | swap | after audit_swap_middle | sound s | 2 | 0/2 |  | frames/w1-8-perfect-007-sound-s-NONE.png |
| w1-8 | swap | line audit_swap_last | talk  | 2 | 0/2 |  | frames/w1-8-perfect-018-talk-audit_swap_last-NONE.png |
| w1-8 | swap | after audit_swap_last | sound a | 2 | 0/2 |  | frames/w1-8-perfect-019-sound-a-NONE.png |
| w1-8 | swap | after thats | sound s | 2 | 0/2 |  | frames/w1-8-learner-006-sound-s-NONE.png |
| w1-8 | swap | line stays_same | talk  | 2 | 0/2 |  | frames/w1-8-learner-007-talk-stays_same-NONE.png |
| w1-9 | run | (inside a blend: sound after sound) | sound m a t i s | 44 | 0/44 |  | frames/w1-9-perfect-002-sound-m-NONE.png |
| w1-9 | run | after t_listen_for_word | sound a s i | 8 | 0/8 |  | frames/w1-9-perfect-012-sound-a-NONE.png |
| w1-9 | run | line run_blend | talk  | 4 | 0/4 |  | frames/w1-9-perfect-000-talk-run_blend-NONE.png |
| w1-9 | run | after run_blend | sound a s | 4 | 0/4 |  | frames/w1-9-perfect-001-sound-a-NONE.png |
| w1-9 | run | line audit_sounds_again | talk  | 4 | 0/4 |  | frames/w1-9-perfect-006-talk-audit_sounds_again-NONE.png |
| w1-9 | run | after audit_sounds_again | sound i m a | 4 | 0/4 |  | frames/w1-9-perfect-007-sound-i-NONE.png |
| w1-9 | run | line t_listen_for_word | talk  | 4 | 0/4 |  | frames/w1-9-perfect-011-talk-t_listen_for_word-NONE.png |
| w1-9 | run | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w1-9-perfect-005-talk-audit_gem_first-NONE.png |
| w1-wu1 | warmup | line fm_hear_sounds_short | talk  | 2 | 0/2 |  | frames/w1-wu1-perfect-000-talk-fm_hear_sounds_short-NONE.png |
| w1-wu1 | warmup | line fm_first_listen | talk  | 2 | 0/2 |  | frames/w1-wu1-perfect-001-talk-fm_first_listen-NONE.png |
| w1-wu1 | warmup | line fm_notice_sun_sock | talk  | 2 | 0/2 |  | frames/w1-wu1-perfect-002-talk-fm_notice_sun_sock-NONE.png |
| w1-wu1 | warmup | after fm_notice_sun_sock | sound s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-003-sound-s-petal.png |
| w1-wu1 | warmup | line t_everyone_say | talk s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-004-talk-s-petal.png |
| w1-wu1 | warmup | after t_everyone_say | sound s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-005-sound-s-petal.png |
| w1-wu1 | warmup | after fm_tap_all_start | sound s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-006-sound-s-petal.png |
| w1-wu1 | warmup | after fm_found_both | sound s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-007-sound-s-petal.png |
| w1-wu1 | warmup | line fm_l1_done | talk s | 2 | 2/2 | SoundBadge | frames/w1-wu1-perfect-008-talk-s-petal.png |
| w1-wu3 | warmup | line fm_tap_all_in | talk  | 2 | 0/2 |  | frames/w1-wu3-perfect-000-talk-fm_tap_all_in-NONE.png |
| w1-wu3 | warmup | after fm_tap_all_in | sound a | 2 | 2/2 | SoundBadge | frames/w1-wu3-perfect-001-sound-a-petal.png |
| w1-wu3 | warmup | line t_they_all_have | talk a | 2 | 2/2 | SoundBadge | frames/w1-wu3-perfect-002-talk-a-petal.png |
| w1-wu3 | warmup | after t_they_all_have | sound a | 2 | 2/2 | SoundBadge | frames/w1-wu3-perfect-003-sound-a-petal.png |
| w1-wu3 | warmup | after fm_all_start | sound m | 2 | 2/2 | SoundBadge | frames/w1-wu3-perfect-004-sound-m-petal.png |
| w1-wu3 | warmup | line fm_l1_done | talk m | 2 | 2/2 | SoundBadge | frames/w1-wu3-perfect-005-talk-m-petal.png |
| w1-wu5 | warmup | (inside a blend: sound after sound) | sound u n m a p k | 49 | 0/49 |  | frames/w1-wu5-perfect-003-sound-u-NONE.png |
| w1-wu5 | warmup | line audit_made_of_sounds | talk  | 2 | 0/2 |  | frames/w1-wu5-perfect-000-talk-audit_made_of_sounds-NONE.png |
| w1-wu5 | warmup | line fm_sounds_intro | talk  | 2 | 0/2 |  | frames/w1-wu5-perfect-001-talk-fm_sounds_intro-NONE.png |
| w1-wu5 | warmup | after fm_sounds_intro | sound s | 2 | 0/2 |  | frames/w1-wu5-perfect-002-sound-s-NONE.png |
| w1-wu5 | warmup | after fm_name_mop | sound m | 2 | 0/2 |  | frames/w1-wu5-perfect-005-sound-m-NONE.png |
| w1-wu5 | warmup | after fm_name_cap | sound k | 2 | 0/2 |  | frames/w1-wu5-perfect-009-sound-k-NONE.png |
| w1-wu5 | warmup | after fm_name_bun | sound b | 2 | 0/2 |  | frames/w1-wu5-perfect-014-sound-b-NONE.png |
| w1-wu5 | warmup | after fm_name_fan | sound f | 2 | 0/2 |  | frames/w1-wu5-perfect-018-sound-f-NONE.png |
| w1-wu5 | warmup | after fm_name_mug | sound j | 2 | 0/2 |  | frames/w1-wu5-perfect-022-sound-j-NONE.png |
| w1-wu5 | warmup | after fm_name_bus | sound b | 2 | 0/2 |  | frames/w1-wu5-perfect-027-sound-b-NONE.png |
| w1-wu5 | warmup | line fm_l5_done | talk  | 2 | 0/2 |  | frames/w1-wu5-perfect-032-talk-fm_l5_done-NONE.png |
| w1-wu5 | warmup | after listen_again | sound b j | 2 | 0/2 |  | frames/w1-wu5-learner-015-sound-b-NONE.png |
| w1-wu6 | warmup | (inside a blend: sound after sound) | sound u n a t o g | 16 | 0/16 |  | frames/w1-wu6-perfect-002-sound-u-NONE.png |
| w1-wu6 | warmup | line fm_dots_intro | talk  | 2 | 0/2 |  | frames/w1-wu6-perfect-000-talk-fm_dots_intro-NONE.png |
| w1-wu6 | warmup | after fm_dots_intro | sound s | 2 | 0/2 |  | frames/w1-wu6-perfect-001-sound-s-NONE.png |
| w1-wu6 | warmup | line fm_dots_turn | talk  | 2 | 0/2 |  | frames/w1-wu6-perfect-004-talk-fm_dots_turn-NONE.png |
| w1-wu6 | warmup | after fm_dots_turn | sound k | 2 | 0/2 |  | frames/w1-wu6-perfect-005-sound-k-NONE.png |
| w1-wu6 | warmup | line fm_dots_say | talk  | 2 | 0/2 |  | frames/w1-wu6-perfect-008-talk-fm_dots_say-NONE.png |
| w1-wu6 | warmup | after fm_name_dog | sound d | 2 | 0/2 |  | frames/w1-wu6-perfect-009-sound-d-NONE.png |
| w1-wu6 | warmup | after fm_name_mug | sound m | 2 | 0/2 |  | frames/w1-wu6-perfect-012-sound-m-NONE.png |
| w1-wu6 | warmup | line fm_l6_done | talk  | 2 | 0/2 |  | frames/w1-wu6-perfect-015-talk-fm_l6_done-NONE.png |
| w2-1 | build | (inside a blend: sound after sound) | sound a t i n h b | 47 | 0/47 |  | frames/w2-1-perfect-027-sound-a-NONE.png |
| w2-1 | build | line dojo_build | talk  | 2 | 0/2 |  | frames/w2-1-perfect-025-talk-dojo_build-NONE.png |
| w2-1 | build | after dojo_build | sound k b | 2 | 0/2 |  | frames/w2-1-perfect-026-sound-k-NONE.png |
| w2-1 | build | after fm_l2_way | sound k b | 2 | 0/2 |  | frames/w2-1-perfect-029-sound-k-NONE.png |
| w2-1 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w2-1-perfect-032-talk-audit_gem_first-NONE.png |
| w2-1 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w2-1-perfect-057-talk-petals_got-NONE.png |
| w2-1 | build | line audit_listen_next | talk  | 2 | 0/2 |  | frames/w2-1-learner-059-talk-audit_listen_next-NONE.png |
| w2-1 | build | after audit_listen_next | sound b g | 2 | 0/2 |  | frames/w2-1-learner-060-sound-b-NONE.png |
| w2-1 | build | after w/tin | sound t | 1 | 0/1 |  | frames/w2-1-perfect-033-sound-t-NONE.png |
| w2-1 | build | after streak_10 | sound t | 1 | 0/1 |  | frames/w2-1-perfect-036-sound-t-NONE.png |
| w2-1 | build | after w/hat | sound h | 1 | 0/1 |  | frames/w2-1-perfect-039-sound-h-NONE.png |
| w2-1 | build | after w/bin | sound b | 1 | 0/1 |  | frames/w2-1-perfect-045-sound-b-NONE.png |
| w2-1 | build | after w/cob | sound k | 1 | 0/1 |  | frames/w2-1-perfect-051-sound-k-NONE.png |
| w2-1 | build | after listen_here | sound k | 1 | 0/1 |  | frames/w2-1-learner-053-sound-k-NONE.png |
| w2-1 | build | after x/tip | sound t | 1 | 0/1 |  | frames/w2-1-learner-066-sound-t-NONE.png |
| w2-1 | learn | line dojo_hello | talk b | 2 | 2/2 | SoundBadge | frames/w2-1-perfect-000-talk-b-petal.png |
| w2-1 | learn | after listen | sound b k g h | 12 | 12/12 | SoundBadge | frames/w2-1-perfect-001-sound-b-petal.png |
| w2-1 | learn | (inside a blend: sound after sound) | sound b k g h | 23 | 23/23 | SoundBadge | frames/w2-1-perfect-002-sound-b-petal.png |
| w2-1 | learn | after audit_spell_it | sound b k g h | 11 | 11/11 | SoundBadge | frames/w2-1-perfect-003-sound-b-petal.png |
| w2-1 | learn | after dojo_tap_say | sound b k g h | 11 | 11/11 | SoundBadge | frames/w2-1-perfect-004-sound-b-petal.png |
| w2-1 | find | after dojo_find | sound b k g h | 8 | 8/8 | SoundBadge | frames/w2-1-perfect-021-sound-b-petal.png |
| w2-1 | learn | line audit_dojo_back | talk b | 1 | 1/1 | SoundBadge | frames/w2-1-learner-018-talk-b-petal.png |
| w2-1 | find | line tut_speaker | talk k | 1 | 1/1 | SoundBadge | frames/w2-1-learner-041-talk-k-petal.png |
| w2-1 | find | after tut_speaker | sound k | 1 | 1/1 | SoundBadge | frames/w2-1-learner-042-sound-k-petal.png |
| w3-6 | build | (inside a blend: sound after sound) | sound e l u z b i | 48 | 0/48 |  | frames/w3-6-perfect-051-sound-e-NONE.png |
| w3-6 | learn | (inside a blend: sound after sound) | sound ks s y f l z | 27 | 25/27 | SoundBadge | frames/w3-6-perfect-002-sound-ks-petal.png |
| w3-6 | learn | after t_one_spelling_two_sounds | sound k | 2 | 0/2 |  | frames/w3-6-perfect-005-sound-k-NONE.png |
| w3-6 | build | line dojo_build | talk  | 2 | 0/2 |  | frames/w3-6-perfect-049-talk-dojo_build-NONE.png |
| w3-6 | build | after dojo_build | sound s b | 2 | 0/2 |  | frames/w3-6-perfect-050-sound-s-NONE.png |
| w3-6 | build | after fm_l2_way | sound s b | 2 | 0/2 |  | frames/w3-6-perfect-053-sound-s-NONE.png |
| w3-6 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w3-6-perfect-056-talk-audit_gem_first-NONE.png |
| w3-6 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w3-6-perfect-081-talk-petals_got-NONE.png |
| w3-6 | build | line audit_listen_next | talk  | 2 | 0/2 |  | frames/w3-6-learner-069-talk-audit_listen_next-NONE.png |
| w3-6 | build | after audit_listen_next | sound m w | 2 | 0/2 |  | frames/w3-6-learner-070-sound-m-NONE.png |
| w3-6 | build | after w/buzz | sound b | 1 | 0/1 |  | frames/w3-6-perfect-057-sound-b-NONE.png |
| w3-6 | build | after w/hill | sound h | 1 | 0/1 |  | frames/w3-6-perfect-063-sound-h-NONE.png |
| w3-6 | build | after w/fizz | sound f | 1 | 0/1 |  | frames/w3-6-perfect-069-sound-f-NONE.png |
| w3-6 | build | after w/pan | sound p | 1 | 0/1 |  | frames/w3-6-perfect-075-sound-p-NONE.png |
| w3-6 | find | after thats | sound z | 1 | 0/1 |  | frames/w3-6-learner-051-sound-z-NONE.png |
| w3-6 | build | after listen_here | sound j | 1 | 0/1 |  | frames/w3-6-learner-063-sound-j-NONE.png |
| w3-6 | build | after w/hiss | sound h | 1 | 0/1 |  | frames/w3-6-learner-076-sound-h-NONE.png |
| w3-6 | learn | line dojo_hello | talk ks | 2 | 2/2 | SoundBadge | frames/w3-6-perfect-000-talk-ks-petal.png |
| w3-6 | learn | after listen | sound ks y f l s z | 13 | 13/13 | SoundBadge | frames/w3-6-perfect-001-sound-ks-petal.png |
| w3-6 | learn | after audit_spell_it | sound ks y l s z | 10 | 10/10 | SoundBadge | frames/w3-6-perfect-003-sound-ks-petal.png |
| w3-6 | learn | line t_one_spelling_two_sounds | talk ks | 2 | 2/2 | SoundBadge | frames/w3-6-perfect-004-talk-ks-petal.png |
| w3-6 | learn | after dojo_tap_say | sound ks y f l s z | 12 | 12/12 | SoundBadge | frames/w3-6-perfect-007-sound-ks-petal.png |
| w3-6 | learn | line audit_hear_see | talk f | 2 | 2/2 | SoundBadge | frames/w3-6-perfect-016-talk-f-petal.png |
| w3-6 | learn | after audit_hear_see | sound f | 2 | 2/2 | SoundBadge | frames/w3-6-perfect-017-sound-f-petal.png |
| w3-6 | learn | line same_sound_new | talk f | 2 | 2/2 | SoundBadge | frames/w3-6-perfect-018-talk-f-petal.png |
| w3-6 | learn | line t_two_letters | talk f l s z | 8 | 8/8 | SoundBadge | frames/w3-6-perfect-019-talk-f-petal.png |
| w3-6 | learn | line same_sound_diff | talk l s z | 6 | 6/6 | SoundBadge | frames/w3-6-perfect-025-talk-l-petal.png |
| w3-6 | find | after dojo_find | sound ks y f l s z | 11 | 11/11 | SoundBadge | frames/w3-6-perfect-043-sound-ks-petal.png |
| w3-6 | learn | line audit_dojo_back | talk ks | 1 | 1/1 | SoundBadge | frames/w3-6-learner-003-talk-ks-petal.png |
| w3-6 | find | line tut_speaker | talk y | 1 | 1/1 | SoundBadge | frames/w3-6-learner-048-talk-y-petal.png |
| w3-6 | find | after tut_speaker | sound y | 1 | 1/1 | SoundBadge | frames/w3-6-learner-049-sound-y-petal.png |
| w3-6 | find | (inside a blend: sound after sound) | sound l | 1 | 1/1 | SoundBadge | frames/w3-6-learner-052-sound-l-petal.png |
| w5-1 | build | (inside a blend: sound after sound) | sound u n ch a sh e | 52 | 0/52 |  | frames/w5-1-perfect-033-sound-u-NONE.png |
| w5-1 | learn | after t_same_spelling_sometimes | sound th | 2 | 0/2 |  | frames/w5-1-perfect-023-sound-th-NONE.png |
| w5-1 | build | line dojo_build | talk  | 2 | 0/2 |  | frames/w5-1-perfect-031-talk-dojo_build-NONE.png |
| w5-1 | build | after fm_l2_way | sound l dh | 2 | 0/2 |  | frames/w5-1-perfect-036-sound-l-NONE.png |
| w5-1 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w5-1-perfect-040-talk-audit_gem_first-NONE.png |
| w5-1 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w5-1-perfect-066-talk-petals_got-NONE.png |
| w5-1 | find | after thats | sound m ks | 2 | 0/2 |  | frames/w5-1-learner-027-sound-m-NONE.png |
| w5-1 | build | line audit_listen_next | talk  | 2 | 0/2 |  | frames/w5-1-learner-044-talk-audit_listen_next-NONE.png |
| w5-1 | build | after audit_listen_next | sound dh e | 2 | 0/2 |  | frames/w5-1-learner-045-sound-dh-NONE.png |
| w5-1 | build | after w/cloth | sound k th | 2 | 0/2 |  | frames/w5-1-learner-051-sound-k-NONE.png |
| w5-1 | build | after dojo_build | sound l | 1 | 0/1 |  | frames/w5-1-perfect-032-sound-l-NONE.png |
| w5-1 | build | after w/cash | sound k | 1 | 0/1 |  | frames/w5-1-perfect-041-sound-k-NONE.png |
| w5-1 | build | after streak_10 | sound k | 1 | 0/1 |  | frames/w5-1-perfect-044-sound-k-NONE.png |
| w5-1 | build | after w/less | sound l | 1 | 0/1 |  | frames/w5-1-perfect-047-sound-l-NONE.png |
| w5-1 | build | line t_two_letters | talk  | 1 | 0/1 |  | frames/w5-1-perfect-053-talk-t_two_letters-NONE.png |
| w5-1 | build | after w/chop | sound ch | 1 | 0/1 |  | frames/w5-1-perfect-054-sound-ch-NONE.png |
| w5-1 | build | after w/much | sound m | 1 | 0/1 |  | frames/w5-1-perfect-060-sound-m-NONE.png |
| w5-1 | build | after w/that | sound dh | 1 | 0/1 |  | frames/w5-1-learner-037-sound-dh-NONE.png |
| w5-1 | build | after w/lamp | sound l | 1 | 0/1 |  | frames/w5-1-learner-059-sound-l-NONE.png |
| w5-1 | build | after x/lamp | sound m | 1 | 0/1 |  | frames/w5-1-learner-061-sound-m-NONE.png |
| w5-1 | build | after w/bench | sound b | 1 | 0/1 |  | frames/w5-1-learner-067-sound-b-NONE.png |
| w5-1 | learn | line dojo_hello | talk sh | 2 | 2/2 | SoundBadge | frames/w5-1-perfect-000-talk-sh-petal.png |
| w5-1 | learn | after listen | sound sh ch th dh | 8 | 8/8 | SoundBadge | frames/w5-1-perfect-001-sound-sh-petal.png |
| w5-1 | learn | (inside a blend: sound after sound) | sound sh ch th dh | 16 | 16/16 | SoundBadge | frames/w5-1-perfect-002-sound-sh-petal.png |
| w5-1 | learn | line audit_hear_see | talk sh | 2 | 2/2 | SoundBadge | frames/w5-1-perfect-003-talk-sh-petal.png |
| w5-1 | learn | after audit_hear_see | sound sh | 2 | 2/2 | SoundBadge | frames/w5-1-perfect-004-sound-sh-petal.png |
| w5-1 | learn | line t_two_letters | talk sh ch th | 6 | 6/6 | SoundBadge | frames/w5-1-perfect-005-talk-sh-petal.png |
| w5-1 | learn | after dojo_tap_say | sound sh ch th dh | 8 | 8/8 | SoundBadge | frames/w5-1-perfect-006-sound-sh-petal.png |
| w5-1 | learn | after audit_spell_it | sound ch th dh | 6 | 6/6 | SoundBadge | frames/w5-1-perfect-010-sound-ch-petal.png |
| w5-1 | learn | after t_and_sometimes | sound dh | 2 | 2/2 | SoundBadge | frames/w5-1-perfect-024-sound-dh-petal.png |
| w5-1 | find | after dojo_find | sound sh ch th dh | 6 | 6/6 | SoundBadge | frames/w5-1-perfect-027-sound-sh-petal.png |
| w5-1 | find | after listen | sound sh dh | 2 | 2/2 | SoundBadge | frames/w5-1-learner-028-sound-sh-petal.png |
| w5-1 | find | (inside a blend: sound after sound) | sound sh th dh | 3 | 3/3 | SoundBadge | frames/w5-1-learner-029-sound-sh-petal.png |
| w5-6 | build | (inside a blend: sound after sound) | sound w i t r u m | 51 | 0/51 |  | frames/w5-6-perfect-034-sound-w-NONE.png |
| w5-6 | build | line t_two_letters | talk  | 3 | 0/3 |  | frames/w5-6-perfect-056-talk-t_two_letters-NONE.png |
| w5-6 | build | line audit_listen_next | talk  | 3 | 0/3 |  | frames/w5-6-learner-045-talk-audit_listen_next-NONE.png |
| w5-6 | build | after audit_listen_next | sound w ch n | 3 | 0/3 |  | frames/w5-6-learner-046-sound-w-NONE.png |
| w5-6 | build | line dojo_build | talk  | 2 | 0/2 |  | frames/w5-6-perfect-032-talk-dojo_build-NONE.png |
| w5-6 | build | after dojo_build | sound k h | 2 | 0/2 |  | frames/w5-6-perfect-033-sound-k-NONE.png |
| w5-6 | build | after fm_l2_way | sound k h | 2 | 0/2 |  | frames/w5-6-perfect-037-sound-k-NONE.png |
| w5-6 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w5-6-perfect-041-talk-audit_gem_first-NONE.png |
| w5-6 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w5-6-perfect-071-talk-petals_got-NONE.png |
| w5-6 | build | after w/drum | sound d | 1 | 0/1 |  | frames/w5-6-perfect-042-sound-d-NONE.png |
| w5-6 | build | after streak_10 | sound d | 1 | 0/1 |  | frames/w5-6-perfect-046-sound-d-NONE.png |
| w5-6 | build | after w/bang | sound b | 1 | 0/1 |  | frames/w5-6-perfect-050-sound-b-NONE.png |
| w5-6 | build | after w/them | sound dh | 1 | 0/1 |  | frames/w5-6-perfect-057-sound-dh-NONE.png |
| w5-6 | build | after t_this_can_be | sound th | 1 | 0/1 |  | frames/w5-6-perfect-063-sound-th-NONE.png |
| w5-6 | build | after t_but_in_this_word | sound dh | 1 | 0/1 |  | frames/w5-6-perfect-064-sound-dh-NONE.png |
| w5-6 | build | after w/duck | sound d | 1 | 0/1 |  | frames/w5-6-perfect-065-sound-d-NONE.png |
| w5-6 | build | after listen_here | sound a | 1 | 0/1 |  | frames/w5-6-learner-037-sound-a-NONE.png |
| w5-6 | build | after w/quit | sound k | 1 | 0/1 |  | frames/w5-6-learner-044-sound-k-NONE.png |
| w5-6 | build | after w/fetch | sound f | 1 | 0/1 |  | frames/w5-6-learner-053-sound-f-NONE.png |
| w5-6 | build | after w/chest | sound t | 1 | 0/1 |  | frames/w5-6-learner-063-sound-t-NONE.png |
| w5-6 | build | after w/then | sound dh | 1 | 0/1 |  | frames/w5-6-learner-069-sound-dh-NONE.png |
| w5-6 | learn | line dojo_hello | talk k | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-000-talk-k-petal.png |
| w5-6 | learn | after listen | sound k w v ch | 8 | 8/8 | SoundBadge | frames/w5-6-perfect-001-sound-k-petal.png |
| w5-6 | learn | (inside a blend: sound after sound) | sound k w v ch | 16 | 16/16 | SoundBadge | frames/w5-6-perfect-002-sound-k-petal.png |
| w5-6 | learn | after audit_spell_it | sound k w ch | 6 | 6/6 | SoundBadge | frames/w5-6-perfect-003-sound-k-petal.png |
| w5-6 | learn | line same_sound_new | talk k | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-004-talk-k-petal.png |
| w5-6 | learn | after dojo_tap_say | sound k w v ch | 8 | 8/8 | SoundBadge | frames/w5-6-perfect-005-sound-k-petal.png |
| w5-6 | learn | line same_sound_diff | talk w v ch | 6 | 6/6 | SoundBadge | frames/w5-6-perfect-010-talk-w-petal.png |
| w5-6 | learn | line audit_hear_see | talk v | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-015-talk-v-petal.png |
| w5-6 | learn | after audit_hear_see | sound v | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-016-sound-v-petal.png |
| w5-6 | learn | line t_two_letters | talk v | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-018-talk-v-petal.png |
| w5-6 | learn | line t_three_letters | talk ch | 2 | 2/2 | SoundBadge | frames/w5-6-perfect-025-talk-ch-petal.png |
| w5-6 | find | after dojo_find | sound k w v ch | 8 | 8/8 | SoundBadge | frames/w5-6-perfect-028-sound-k-petal.png |
| w5-6 | find | (inside a blend: sound after sound) | sound w | 1 | 1/1 | SoundBadge | frames/w5-6-learner-030-sound-w-petal.png |
| w5-6 | find | line tut_speaker | talk ch | 1 | 1/1 | SoundBadge | frames/w5-6-learner-033-talk-ch-petal.png |
| w5-6 | find | after tut_speaker | sound ch | 1 | 1/1 | SoundBadge | frames/w5-6-learner-034-sound-ch-petal.png |
| w6-1 | build | (inside a blend: sound after sound) | sound ae r e s t n | 47 | 0/47 |  | frames/w6-1-perfect-019-sound-ae-NONE.png |
| w6-1 | build | line dojo_build | talk  | 2 | 0/2 |  | frames/w6-1-perfect-017-talk-dojo_build-NONE.png |
| w6-1 | build | after dojo_build | sound d s | 2 | 0/2 |  | frames/w6-1-perfect-018-sound-d-NONE.png |
| w6-1 | build | after fm_l2_way | sound d s | 2 | 0/2 |  | frames/w6-1-perfect-020-sound-d-NONE.png |
| w6-1 | build | line audit_gem_first | talk  | 2 | 0/2 |  | frames/w6-1-perfect-022-talk-audit_gem_first-NONE.png |
| w6-1 | reward | line petals_got | talk  | 2 | 0/2 |  | frames/w6-1-perfect-051-talk-petals_got-NONE.png |
| w6-1 | build | after w/paint | sound p t | 2 | 0/2 |  | frames/w6-1-learner-039-sound-p-NONE.png |
| w6-1 | build | after w/tray | sound t | 1 | 0/1 |  | frames/w6-1-perfect-023-sound-t-NONE.png |
| w6-1 | build | after streak_6 | sound t | 1 | 0/1 |  | frames/w6-1-perfect-026-sound-t-NONE.png |
| w6-1 | build | after w/vest | sound v | 1 | 0/1 |  | frames/w6-1-perfect-029-sound-v-NONE.png |
| w6-1 | build | after streak_10 | sound v | 1 | 0/1 |  | frames/w6-1-perfect-033-sound-v-NONE.png |
| w6-1 | build | after w/snail | sound s | 1 | 0/1 |  | frames/w6-1-perfect-037-sound-s-NONE.png |
| w6-1 | build | after w/tail | sound t | 1 | 0/1 |  | frames/w6-1-perfect-045-sound-t-NONE.png |
| w6-1 | build | after listen_here | sound ae | 1 | 0/1 |  | frames/w6-1-learner-022-sound-ae-NONE.png |
| w6-1 | build | after w/day | sound d | 1 | 0/1 |  | frames/w6-1-learner-028-sound-d-NONE.png |
| w6-1 | build | line audit_listen_next | talk  | 1 | 0/1 |  | frames/w6-1-learner-032-talk-audit_listen_next-NONE.png |
| w6-1 | build | after audit_listen_next | sound t | 1 | 0/1 |  | frames/w6-1-learner-033-sound-t-NONE.png |
| w6-1 | build | after w/sit | sound s | 1 | 0/1 |  | frames/w6-1-learner-047-sound-s-NONE.png |
| w6-1 | build | after x/sit | sound t | 1 | 0/1 |  | frames/w6-1-learner-049-sound-t-NONE.png |
| w6-1 | learn | line dojo_hello | talk ae | 2 | 2/2 | SoundBadge | frames/w6-1-perfect-000-talk-ae-petal.png |
| w6-1 | learn | after listen | sound ae | 4 | 4/4 | SoundBadge | frames/w6-1-perfect-001-sound-ae-petal.png |
| w6-1 | learn | (inside a blend: sound after sound) | sound ae | 8 | 8/8 | SoundBadge | frames/w6-1-perfect-002-sound-ae-petal.png |
| w6-1 | learn | line audit_hear_see | talk ae | 2 | 2/2 | SoundBadge | frames/w6-1-perfect-003-talk-ae-petal.png |
| w6-1 | learn | after audit_hear_see | sound ae | 2 | 2/2 | SoundBadge | frames/w6-1-perfect-004-sound-ae-petal.png |
| w6-1 | learn | line t_two_letters | talk ae | 4 | 4/4 | SoundBadge | frames/w6-1-perfect-005-talk-ae-petal.png |
| w6-1 | learn | after dojo_tap_say | sound ae | 4 | 4/4 | SoundBadge | frames/w6-1-perfect-006-sound-ae-petal.png |
| w6-1 | learn | after audit_spell_it | sound ae | 2 | 2/2 | SoundBadge | frames/w6-1-perfect-010-sound-ae-petal.png |
| w6-1 | learn | line same_sound_new | talk ae | 2 | 2/2 | SoundBadge | frames/w6-1-perfect-011-talk-ae-petal.png |
| w6-1 | find | after dojo_find | sound ae | 4 | 4/4 | SoundBadge | frames/w6-1-perfect-015-sound-ae-petal.png |
| w6-1 | find | (inside a blend: sound after sound) | sound ae | 1 | 1/1 | SoundBadge | frames/w6-1-learner-017-sound-ae-petal.png |
| w6-2 | sort | (inside a blend: sound after sound) | sound n ae l p r t | 37 | 16/37 | SoundBadge | frames/w6-2-perfect-008-sound-n-NONE.png |
| w6-2 | sort | after w/snail | sound s | 2 | 0/2 |  | frames/w6-2-perfect-007-sound-s-NONE.png |
| w6-2 | sort | after w/rain | sound r p | 2 | 0/2 |  | frames/w6-2-perfect-012-sound-r-NONE.png |
| w6-2 | sort | after audit_streak_first | sound s t | 2 | 0/2 |  | frames/w6-2-perfect-018-sound-s-NONE.png |
| w6-2 | sort | after streak_6 | sound s r | 2 | 0/2 |  | frames/w6-2-perfect-027-sound-s-NONE.png |
| w6-2 | sort | after w/stay | sound p s | 2 | 0/2 |  | frames/w6-2-perfect-030-sound-p-NONE.png |
| w6-2 | sort | after w/say | sound s | 1 | 0/1 |  | frames/w6-2-perfect-022-sound-s-NONE.png |
| w6-2 | sort | after w/tail | sound t | 1 | 0/1 |  | frames/w6-2-perfect-024-sound-t-NONE.png |
| w6-2 | sort | after audit_gem_first | sound s | 1 | 0/1 |  | frames/w6-2-learner-012-sound-s-NONE.png |
| w6-2 | sort | after w/paint | sound p | 1 | 0/1 |  | frames/w6-2-learner-016-sound-p-NONE.png |
| w6-2 | sort | after w/day | sound d | 1 | 0/1 |  | frames/w6-2-learner-024-sound-d-NONE.png |
| w6-2 | sort | after w/tray | sound t | 1 | 0/1 |  | frames/w6-2-learner-026-sound-t-NONE.png |
| w6-2 | sort | line audit_bridging_first | talk ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-000-talk-ae-petal.png |
| w6-2 | sort | line audit_sort_first | talk ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-001-talk-ae-petal.png |
| w6-2 | sort | line audit_sort_pair | talk ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-002-talk-ae-petal.png |
| w6-2 | sort | after audit_sort_pair | sound ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-003-sound-ae-petal.png |
| w6-2 | sort | line t_two_letters | talk ae | 4 | 4/4 | SoundBadge | frames/w6-2-perfect-004-talk-ae-petal.png |
| w6-2 | sort | after t_two_letters | sound ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-005-sound-ae-petal.png |
| w6-2 | sort | line audit_gem_first | talk ae | 2 | 2/2 | SoundBadge | frames/w6-2-perfect-011-talk-ae-petal.png |
| w6-br1 | sort | (inside a blend: sound after sound) | sound k o t i s e | 43 | 12/43 | SoundBadge | frames/w6-br1-perfect-004-sound-k-petal.png |
| w6-br1 | sort | after w/check | sound ch | 2 | 0/2 |  | frames/w6-br1-perfect-014-sound-ch-NONE.png |
| w6-br1 | sort | after audit_streak_first | sound n w | 2 | 0/2 |  | frames/w6-br1-perfect-017-sound-n-NONE.png |
| w6-br1 | sort | after w/thick | sound th k | 2 | 1/2 | SoundBadge | frames/w6-br1-perfect-020-sound-th-NONE.png |
| w6-br1 | sort | after streak_6 | sound y | 1 | 0/1 |  | frames/w6-br1-perfect-028-sound-y-NONE.png |
| w6-br1 | sort | after w/skip | sound s | 1 | 0/1 |  | frames/w6-br1-perfect-031-sound-s-NONE.png |
| w6-br1 | sort | after help_sort | sound d | 1 | 0/1 |  | frames/w6-br1-learner-007-sound-d-NONE.png |
| w6-br1 | sort | line audit_bridging_first | talk k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-000-talk-k-petal.png |
| w6-br1 | sort | line audit_sort_first | talk k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-001-talk-k-petal.png |
| w6-br1 | sort | line audit_sort_three | talk k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-002-talk-k-petal.png |
| w6-br1 | sort | after audit_sort_three | sound k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-003-sound-k-petal.png |
| w6-br1 | sort | line t_two_letters | talk k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-006-talk-k-petal.png |
| w6-br1 | sort | after w/cot | sound k | 1 | 1/1 | SoundBadge | frames/w6-br1-perfect-007-sound-k-petal.png |
| w6-br1 | sort | line audit_gem_first | talk k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-010-talk-k-petal.png |
| w6-br1 | sort | after audit_gem_first | sound k | 2 | 2/2 | SoundBadge | frames/w6-br1-perfect-011-sound-k-petal.png |
| w6-br1 | sort | after w/cost | sound k | 1 | 1/1 | SoundBadge | frames/w6-br1-learner-016-sound-k-petal.png |
| w6-br1 | sort | after w/kit | sound k | 1 | 1/1 | SoundBadge | frames/w6-br1-learner-027-sound-k-petal.png |
| w6-br1 | sort | after w/kin | sound k | 2 | 2/2 | SoundBadge | frames/w6-br1-learner-030-sound-k-petal.png |
