# The first five minutes (learner child, opt-in: Y1)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.0 s | 45 s |  | within target |
| choose | 0:46.3 | 7.5 s | 6 s |  | over target |
| opt-in | 0:53.8 | 30.0 s | 28 s | 30 s | settled in 21.4 s |
| dojo welcome | 1:23.8 | 23.0 s | 12 s |  | over target |
| ? | 1:46.8 | 0.6 s |  |  |  |
| lesson 1 | 1:47.4 | 100.7 s | 85 s | 100 s | over the cap |
| reward 1 | 3:28.1 | 14.2 s | 21 s | 26 s | within target |
| lesson 2 | 3:42.3 | 65.8 s | 60 s | 75 s | over target |
| reward 2 | 4:48.1 | 4.3 s | 26 s | 30 s | within target |
| map | 4:52.4 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 21.4 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 4:52.4** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "Y1",
 "band": "Y1",
 "seenPlacement": true,
 "stickers": [
  "paint",
  "play",
  "day",
  "say",
  "cash",
  "train",
  "stay",
  "tray",
  "nail",
  "tail"
 ],
 "shiny": [],
 "firstSession": null,
 "adjustLog": [
  {
   "at": 1790438741102,
   "text": "Chose \"Year One\": started at Year One"
  }
 ]
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {}
- **lesson 2**: {}

## Everything said and done


0:00.0 ===== title =====
        🔊 "[sfx tap]" · "[sfx gong]" · "[sfx whoosh]" · "[sfx gong]" · "[sfx whoosh]"
0:00.1    > child taps: Start
        🔊 "[sfx great]" · "[sfx jump]"
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.7 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.5 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:14.0 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:19.8 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:27.8 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.5 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:36.7 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.7 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:45.9 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
        🔊 "[sfx great]" · "[sfx charge]"
0:46.3    > child taps: kai

0:46.3 ===== choose =====
0:46.4 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
        🔊 "[sfx powerup]" · "[sfx kiai]"
0:47.0    > child taps: kai
        🔊 "[sfx twinkle]"
0:47.6    > child taps: kai
0:48.2    > child taps: kai
0:48.8    > child taps: kai
0:49.4    > child taps: kai
0:50.5 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.6 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›

0:53.8 ===== opt-in =====
0:55.5 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
1:00.4 SENSEI: Big school!  ‹fm_opt_echo_school›
1:00.4    > child taps: school
        🔊 "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]"
1:02.6 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:03.8 SENSEI: Reception!  ‹fm_opt_rec›
1:05.1 SENSEI: Year One!  ‹fm_opt_y1›
1:06.4 SENSEI: Year Two!  ‹fm_opt_y2›
1:08.1 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
        🔊 "[sfx pop]"
1:13.4 SENSEI: Year One!  ‹fm_opt_y1›
1:13.4    > child taps: Year One
        🔊 "[sfx jump]" · "[sfx spin]"
1:15.3 SENSEI: I've set up the game for Year One, with new ways to spell the sounds you know!  ‹fm_opt_ok_y1›
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx great]"
1:19.9 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:23.5 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:23.8 ===== dojo welcome =====
1:28.9    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:29.4 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:35.9 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:35.9    > child taps: Help
        🔊 "[sfx twinkle]"
1:38.6 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:44.1 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:44.1    > child taps: Hear it again
        🔊 "[sfx twinkle]"

1:46.8 ===== ? =====
1:47.1 SENSEI: This is the dojo. A dojo is where ninjas practise! Let's practise some sounds.  ‹dojo_hello›

1:47.4 ===== lesson 1 =====
1:52.7 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/ · "[sfx charge]" · "[sfx magic]" · "[sfx sparkle]" · "[sfx pop]"
1:56.3 SENSEI: We hear the sound. Now look: this is how we spell it.  ‹audit_hear_see›
        🔊 "[sfx tap]" · "[sfx tink]"
1:56.7    > child taps: ai
1:57.4    > child taps: ai
        🔊 "[sfx tap]"
1:58.0    > child taps: ai
1:58.6    > child taps: ai
        🔊 "[sfx tap]"
1:59.2    > child taps: ai
1:59.9    > child taps: ai
        🔊 "[sfx tap]" · /ae/
2:00.5    > child taps: ai
2:01.1    > child taps: ai
2:01.3 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx tap]"
2:01.7    > child taps: ai
2:02.3    > child taps: ai
        🔊 "[sfx tap]"
2:03.0    > child taps: ai
2:03.6    > child taps: ai
        🔊 "[sfx tap]"
2:04.2    > child taps: ai
2:04.5 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
2:04.8    > child taps: ai
        🔊 "[sfx tap]"
2:05.4    > child taps: ai
2:06.1    > child taps: ai
        🔊 /ae/ · "[sfx swish]" · "[sfx tap]" · /ae/ · "[sfx charge]"
2:06.7    > child taps: ai
        🔊 "[sfx thwack]" · "[sfx magic]" · "[sfx good]"
2:07.2 SENSEI: Ace!  ‹yay_10›
2:07.3    > child taps: ai
        🔊 "[sfx sparkle]" · "[sfx tap]"
2:07.9    > child taps: ai
2:08.0 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/ · "[sfx charge]" · "[sfx magic]" · "[sfx sparkle]" · "[sfx pop]"
2:11.6 SENSEI: And this is how we spell it.  ‹audit_spell_it›
        🔊 "[sfx tap]" · "[sfx tink]"
2:11.6    > child taps: ay
2:12.3    > child taps: ay
        🔊 "[sfx tap]"
2:12.9    > child taps: ay
        🔊 /ae/
2:13.5    > child taps: ay
        🔊 "[sfx tap]"
2:14.1    > child taps: ay
2:14.3 SENSEI: Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling.  ‹same_sound_new›
2:14.8    > child taps: ay
        🔊 "[sfx tap]"
2:15.4    > child taps: ay
2:16.0    > child taps: ay
        🔊 "[sfx tap]"
2:16.6    > child taps: ay
2:17.2    > child taps: ay
        🔊 "[sfx tap]"
2:17.9    > child taps: ay
2:18.5    > child taps: ay
        🔊 "[sfx tap]"
2:19.1    > child taps: ay
2:19.7    > child taps: ay
        🔊 "[sfx tap]"
2:20.3    > child taps: ay
2:21.0    > child taps: ay
2:21.1 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx tap]"
2:21.6    > child taps: ay
2:22.2    > child taps: ay
        🔊 "[sfx tap]"
2:22.8    > child taps: ay
2:23.5    > child taps: ay
        🔊 "[sfx tap]"
2:24.1    > child taps: ay
2:24.3 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
2:24.7    > child taps: ay
        🔊 "[sfx tap]"
2:25.3    > child taps: ay
2:25.9    > child taps: ay
        🔊 /ae/ · "[sfx jump]" · "[sfx tap]" · /ae/
2:26.6    > child taps: ay
        🔊 "[sfx shuriken]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx tink]" · "[sfx good]"
2:27.1 SENSEI: Amazing!  ‹yay_5›
2:27.2    > child taps: ay
        🔊 "[sfx tap]"
2:27.8    > child taps: ay
2:28.4 SENSEI: Can you find...  ‹dojo_find›
        🔊 "[sfx tap]" · "[sfx good]" · /ae/
2:28.4    > child taps: ai
        🔊 "[sfx shuriken]" · "[sfx tink]"
2:29.1 SENSEI: Ace!  ‹yay_10›
2:29.1    > child taps: ai
        🔊 "[sfx tap]"
2:29.7    > child taps: ai
2:29.9 SENSEI: Can you find...  ‹dojo_find›
        🔊 "[sfx tap]" · "[sfx good]" · /ae/
2:30.3    > child taps: ay
        🔊 "[sfx kick]" · "[sfx thwack]"
2:30.9    > child taps: ay
        🔊 "[sfx charge]" · "[sfx powerup]"
2:31.3 SENSEI: Three right answers in a row! Your ninja is getting stronger.  ‹audit_streak_first›
        🔊 "[sfx tap]"
2:31.5    > child taps: ay
2:32.2    > child taps: ay
        🔊 "[sfx tap]"
2:32.8    > child taps: ay
2:33.4    > child taps: ay
        🔊 "[sfx tap]"
2:34.0    > child taps: ay
2:34.6    > child taps: ay
2:34.9 SENSEI: Now let's make words! First, listen to the word. Then tap its sounds, one at a time.  ‹dojo_build›
        🔊 "[sfx tap]" · /p/
2:35.3    > child taps: p
        🔊 "[sfx spin]" · "[sfx land]" · "[sfx tap]" · "[sfx magic]" · /ae/
2:35.9    > child taps: ai
        🔊 "[sfx thwack]" · "[sfx place]" · "[sfx place]" · "[sfx tap]"
2:36.5    > child taps: n
        🔊 /n/ · "[sfx swish]" · "[sfx swish]" · "[sfx thwack]" · "[sfx thwack]" · "[sfx tap]" · /t/
2:37.2    > child taps: t
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx place]" · "[sfx boom]" · "[sfx land]" · "[sfx place]" · "[sfx charge]"
2:38.0 SENSEI: Wow! Super ninja streak!  ‹streak_6›
        🔊 "[sfx powerup]"
2:40.7 SENSEI: Ninjas read this way!  ‹fm_l2_way›
        🔊 /p/ · /ae/ · /n/ · /t/ · "paint" · "[sfx great]"
2:45.8 SENSEI: Amazing!  ‹yay_5›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx sparkle]"
2:47.1 SENSEI: Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.  ‹audit_gem_first›
        🔊 "play" · "[sfx tap]" · /p/
2:55.2    > child taps: p
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx tink]" · "[sfx tap]" · /l/
2:55.8    > child taps: l
        🔊 "[sfx swish]" · "[sfx place]" · "[sfx swish]" · "[sfx thwack]" · "[sfx thwack]" · "[sfx tap]" · "[sfx magic]" · /ae/
2:56.5    > child taps: ay
        🔊 "[sfx place]" · "[sfx place]" · "[sfx charge]"
2:57.0 SENSEI: Amazing! You're a ninja master!  ‹streak_10›
        🔊 "[sfx powerup]" · /p/ · /l/ · /ae/ · "play" · "[sfx great]"
3:03.4 SENSEI: Well done!  ‹yay_4›
        🔊 "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]" · "day"
3:05.1    > child taps: d
        🔊 "[sfx tap]" · /d/ · "[sfx jump]" · "[sfx spin]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tap]" · /ae/
3:05.8    > child taps: ay
        🔊 "[sfx tink]" · "[sfx swish]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx swish]" · "[sfx thwack]" · "[sfx place]" · "[sfx thwack]" · "[sfx place]" · /d/ · /ae/ · "day" · "[sfx great]"
3:08.8 SENSEI: Smashing!  ‹yay_9›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "say" · "[sfx tap]" · /s/
3:10.1    > child taps: s
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx boom]" · "[sfx land]" · "[sfx tap]" · /ae/
3:10.7    > child taps: ay
        🔊 "[sfx swish]" · "[sfx place]" · "[sfx thwack]" · "[sfx swish]" · "[sfx thwack]" · "[sfx place]" · /s/ · /ae/ · "say" · "[sfx great]"
3:14.1 SENSEI: Well done!  ‹yay_4›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "cash" · "[sfx tap]" · /k/
3:15.7    > child taps: c
        🔊 "[sfx jump]" · "[sfx spin]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tap]"
3:16.3    > child taps: a
        🔊 /a/ · "[sfx tink]" · "[sfx swish]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx swish]" · "[sfx thwack]" · "[sfx place]" · "[sfx thwack]" · "[sfx tap]" · /sh/
3:17.0    > child taps: sh
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx place]" · "[sfx boom]" · "[sfx land]" · "[sfx place]" · /k/ · /a/ · /sh/ · "cash"
3:21.1 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx great]"
3:24.0 SENSEI: Ace!  ‹yay_10›
        🔊 "[sfx jump]" · "[sfx spin]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx tink]" · "[sfx charge]"
3:24.8 SENSEI: Well done! You practised so hard!  ‹dojo_done›
        🔊 "[sfx twinkle]" · "[sfx thwack]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:28.1 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:28.1 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:31.9 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]" · "[sfx place]" · "paint" · "[sfx twinkle]" · "[sfx place]" · "play" · "[sfx jump]" · "[sfx place]" · "day" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "say" · "[sfx jump]" · "[sfx place]" · "cash" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx twinkle]" · "[sfx coin]"
3:36.5 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:39.2 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · /p/
3:39.2    > child taps: sticker paint
        🔊 "[sfx twinkle]" · /ae/
3:39.8    > child taps: sticker paint
        🔊 "[sfx pop]" · /p/
3:40.5    > child taps: sticker paint
        🔊 "[sfx twinkle]" · /ae/ · "[sfx place]" · "[sfx twinkle]" · "[sfx tap]"
3:41.7    > child taps: Next
        🔊 "[sfx pop]" · "[sfx pop]"
3:42.3 SENSEI: You know this sound! Now let's look at the different ways we spell it.  ‹audit_bridging_first›

3:42.3 ===== lesson 2 =====
3:46.4 SENSEI: Sorting time! These words have the same sound, but it's spelt in different ways.  ‹audit_sort_first›
3:51.7 SENSEI: This sound can be spelt in two ways.  ‹audit_sort_pair›
        🔊 "[sfx pop]" · /ae/
3:55.5 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx pop]" · /ae/
3:59.8 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
4:03.1 SENSEI: Tap the chest with the same spelling as the word.  ‹help_sort›
        🔊 "train" · "[sfx good]"
4:06.5    > child taps: basket ai
        🔊 /t/
4:07.2    > child taps: basket ai
        🔊 /r/
4:07.8    > child taps: basket ai
        🔊 /ae/
4:08.4    > child taps: basket ai
4:09.0    > child taps: basket ai
        🔊 /n/
4:09.6    > child taps: basket ai
        🔊 "train"
4:10.3    > child taps: basket ai
        🔊 "[sfx kick]" · "[sfx kiai]"
4:10.9    > child taps: basket ai
        🔊 "[sfx boom]" · "[sfx land]"
4:11.5    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "stay" · "[sfx good]"
4:12.1    > child taps: basket ay
        🔊 /s/
4:12.7    > child taps: basket ay
        🔊 /t/
4:13.4    > child taps: basket ay
        🔊 /ae/
4:14.0    > child taps: basket ay
4:14.6    > child taps: basket ay
        🔊 "stay"
4:15.2    > child taps: basket ay
        🔊 "[sfx jump]" · "[sfx spin]"
4:15.8    > child taps: basket ay
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]"
4:16.4    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx good]"
4:17.1    > child taps: basket ay
        🔊 /t/
4:17.7    > child taps: basket ay
        🔊 /r/
4:18.3    > child taps: basket ay
        🔊 /ae/
4:18.9    > child taps: basket ay
4:19.6    > child taps: basket ay
        🔊 "tray"
4:20.2    > child taps: basket ay
        🔊 "[sfx spin]"
4:20.8    > child taps: basket ay
        🔊 "[sfx land]" · "[sfx thwack]"
4:21.4    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "nail" · "[sfx good]"
4:22.0    > child taps: basket ai
        🔊 /n/
4:22.7    > child taps: basket ai
        🔊 /ae/
4:23.3    > child taps: basket ai
        🔊 /l/
4:23.9    > child taps: basket ai
4:24.5    > child taps: basket ai
        🔊 "nail"
4:25.1    > child taps: basket ai
        🔊 "[sfx charge]"
4:25.8    > child taps: basket ai
        🔊 "[sfx magic]" · "[sfx boom]"
4:26.4    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx good]"
4:27.0    > child taps: basket ay
        🔊 /p/ · /l/
4:27.6    > child taps: basket ay
4:28.2    > child taps: basket ay
        🔊 /ae/
4:28.9    > child taps: basket ay
4:29.5    > child taps: basket ay
        🔊 "play"
4:30.1    > child taps: basket ay
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx boom]"
4:30.7    > child taps: basket ay
        🔊 "[sfx land]" · "[sfx coin]" · "[sfx place]"
4:31.4    > child taps: basket ay
        🔊 "day" · "[sfx good]"
4:32.0    > child taps: basket ay
        🔊 /d/
4:32.6    > child taps: basket ay
        🔊 /ae/
4:33.2    > child taps: basket ay
        🔊 "day"
4:33.9    > child taps: basket ay
        🔊 "[sfx jump]" · "[sfx spin]"
4:34.5    > child taps: basket ay
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]"
4:35.1    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx good]"
4:35.7    > child taps: basket ai
        🔊 /t/
4:36.3    > child taps: basket ai
        🔊 /ae/
4:37.0    > child taps: basket ai
        🔊 /l/
4:37.6    > child taps: basket ai
4:38.2    > child taps: basket ai
        🔊 "tail"
4:38.8    > child taps: basket ai
        🔊 "[sfx charge]" · "[sfx magic]"
4:39.4    > child taps: basket ai
        🔊 "[sfx boom]"
4:40.0    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx good]"
4:40.7    > child taps: basket ai
        🔊 /p/ · /ae/
4:41.3    > child taps: basket ai
4:41.9    > child taps: basket ai
        🔊 /n/
4:42.5    > child taps: basket ai
        🔊 /t/
4:43.1    > child taps: basket ai
        🔊 "paint"
4:43.8    > child taps: basket ai
4:44.4    > child taps: basket ai
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx boom]"
4:45.0    > child taps: basket ai
        🔊 "[sfx land]" · "[sfx coin]" · "[sfx place]" · "[sfx boom]" · "[sfx charge]"
4:45.5 SENSEI: Sorted! What a clever ninja.  ‹sort_done›
4:45.6    > child taps: basket ai
        🔊 "[sfx jump]" · "[sfx spin]"
4:46.2    > child taps: basket ai
        🔊 "[sfx boom]" · "[sfx pop]" · "[sfx great]" · "[sfx pop]" · "[sfx twinkle]" · "[sfx twinkle]"
4:46.9    > child taps: basket ai
4:47.5    > child taps: basket ai
        🔊 "[sfx gong]" · "[sfx charge]" · "[sfx powerup]"

4:48.1 ===== reward 2 =====
        🔊 "[sfx place]" · "train" · "[sfx twinkle]" · "[sfx place]" · "stay" · "[sfx jump]" · "[sfx place]" · "tray" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx twinkle]" · "[sfx place]" · "nail" · "[sfx jump]" · "[sfx place]" · "tail" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx twinkle]" · "[sfx whoosh]"
4:52.4 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

4:52.4 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
4:55.3 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
