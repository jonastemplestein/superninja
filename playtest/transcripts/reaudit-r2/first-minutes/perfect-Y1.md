# The first five minutes (perfect child, opt-in: Y1)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.0 s | 45 s |  | within target |
| choose | 0:46.3 | 3.7 s | 6 s |  | within target |
| opt-in | 0:50.0 | 30.8 s | 28 s | 30 s | settled in 22.2 s |
| dojo welcome | 1:20.8 | 18.8 s | 12 s |  | over target |
| ? | 1:39.6 | 0.6 s |  |  |  |
| lesson 1 | 1:40.2 | 95.1 s | 85 s | 100 s | over target |
| reward 1 | 3:15.3 | 14.8 s | 21 s | 26 s | within target |
| lesson 2 | 3:30.1 | 73.2 s | 60 s | 75 s | over target |
| reward 2 | 4:43.3 | 4.9 s | 26 s | 30 s | within target |
| map | 4:48.2 | 6.1 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 22.2 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 4:48.2** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "Y1",
 "band": "Y1",
 "seenPlacement": true,
 "stickers": [
  "rain",
  "spray",
  "say",
  "paint",
  "tray",
  "train",
  "nail",
  "play",
  "snail"
 ],
 "shiny": [],
 "firstSession": null,
 "adjustLog": [
  {
   "at": 1790438740342,
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
0:20.1 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:28.1 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.9 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:37.1 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.9 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:46.1 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
        🔊 "[sfx great]" · "[sfx charge]"
0:46.3    > child taps: kai

0:46.3 ===== choose =====
0:46.4 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
        🔊 "[sfx powerup]" · "[sfx kiai]"
0:47.0    > child taps: kai
0:47.6    > child taps: kai
        🔊 "[sfx twinkle]"
0:48.2    > child taps: kai
0:48.8    > child taps: kai
0:49.4    > child taps: kai

0:50.0 ===== opt-in =====
0:50.4 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.6 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:55.5 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
0:58.8 SENSEI: Big school!  ‹fm_opt_echo_school›
0:58.8    > child taps: school
        🔊 "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]"
1:01.1 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:02.2 SENSEI: Reception!  ‹fm_opt_rec›
1:03.5 SENSEI: Year One!  ‹fm_opt_y1›
1:04.8 SENSEI: Year Two!  ‹fm_opt_y2›
1:06.5 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
        🔊 "[sfx pop]"
1:10.4 SENSEI: Year One!  ‹fm_opt_y1›
1:10.4    > child taps: Year One
        🔊 "[sfx jump]" · "[sfx spin]"
1:12.3 SENSEI: I've set up the game for Year One, with new ways to spell the sounds you know!  ‹fm_opt_ok_y1›
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx great]"
1:16.9 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:20.4 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:20.8 ===== dojo welcome =====
1:24.5    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:25.0 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:30.1 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:30.1    > child taps: Help
        🔊 "[sfx twinkle]"
1:32.7 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:36.9 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:36.9    > child taps: Hear it again
        🔊 "[sfx twinkle]"

1:39.6 ===== ? =====
1:39.9 SENSEI: This is the dojo. A dojo is where ninjas practise! Let's practise some sounds.  ‹dojo_hello›

1:40.2 ===== lesson 1 =====
1:45.5 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/ · "[sfx charge]" · "[sfx magic]" · "[sfx sparkle]" · "[sfx pop]"
1:49.1 SENSEI: We hear the sound. Now look: this is how we spell it.  ‹audit_hear_see›
1:49.5    > child taps: ai
        🔊 "[sfx tap]" · "[sfx tink]"
1:50.2    > child taps: ai
        🔊 "[sfx tap]"
1:50.8    > child taps: ai
1:51.4    > child taps: ai
        🔊 "[sfx tap]"
1:52.0    > child taps: ai
1:52.7    > child taps: ai
        🔊 /ae/ · "[sfx tap]"
1:53.3    > child taps: ai
1:53.9    > child taps: ai
1:54.1 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx tap]"
1:54.5    > child taps: ai
1:55.1    > child taps: ai
        🔊 "[sfx tap]"
1:55.8    > child taps: ai
1:56.4    > child taps: ai
        🔊 "[sfx tap]"
1:57.0    > child taps: ai
1:57.3 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
1:57.6    > child taps: ai
        🔊 "[sfx tap]"
1:58.2    > child taps: ai
1:58.9    > child taps: ai
        🔊 /ae/ · "[sfx shuriken]" · "[sfx tap]" · /ae/
1:59.5    > child taps: ai
        🔊 "[sfx swish]" · "[sfx tink]" · "[sfx thwack]" · "[sfx good]"
2:00.0 SENSEI: Super!  ‹yay_2›
2:00.1    > child taps: ai
        🔊 "[sfx tap]"
2:00.7    > child taps: ai
2:00.8 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/ · "[sfx charge]" · "[sfx magic]" · "[sfx sparkle]" · "[sfx pop]"
2:04.4 SENSEI: And this is how we spell it.  ‹audit_spell_it›
        🔊 "[sfx tap]" · "[sfx tink]"
2:04.5    > child taps: ay
2:05.1    > child taps: ay
        🔊 "[sfx tap]"
2:05.7    > child taps: ay
        🔊 /ae/
2:06.3    > child taps: ay
2:06.9    > child taps: ay
        🔊 "[sfx tap]"
2:07.1 SENSEI: Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling.  ‹same_sound_new›
2:07.6    > child taps: ay
        🔊 "[sfx tap]"
2:08.2    > child taps: ay
2:08.8    > child taps: ay
        🔊 "[sfx tap]"
2:09.4    > child taps: ay
2:10.1    > child taps: ay
        🔊 "[sfx tap]"
2:10.7    > child taps: ay
2:11.3    > child taps: ay
        🔊 "[sfx tap]"
2:11.9    > child taps: ay
2:12.5    > child taps: ay
        🔊 "[sfx tap]"
2:13.2    > child taps: ay
2:13.8    > child taps: ay
2:14.0 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx tap]"
2:14.4    > child taps: ay
2:15.0    > child taps: ay
        🔊 "[sfx tap]"
2:15.7    > child taps: ay
2:16.3    > child taps: ay
        🔊 "[sfx tap]"
2:16.9    > child taps: ay
2:17.2 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
2:17.5    > child taps: ay
        🔊 "[sfx tap]"
2:18.1    > child taps: ay
2:18.8    > child taps: ay
        🔊 /ae/ · "[sfx swish]" · "[sfx tap]" · /ae/
2:19.4    > child taps: ay
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx thwack]" · "[sfx good]"
2:19.9 SENSEI: Smashing!  ‹yay_9›
2:20.0    > child taps: ay
        🔊 "[sfx tap]"
2:20.6    > child taps: ay
2:20.8 SENSEI: Can you find...  ‹dojo_find›
        🔊 "[sfx tap]" · "[sfx good]" · /ae/
2:21.3    > child taps: ai
        🔊 "[sfx kick]" · "[sfx thwack]"
2:21.9 SENSEI: Amazing!  ‹yay_5›
2:21.9    > child taps: ai
        🔊 "[sfx tap]"
2:22.5    > child taps: ai
2:23.1    > child taps: ai
2:23.2 SENSEI: Can you find...  ‹dojo_find›
        🔊 "[sfx tap]" · "[sfx good]" · /ae/
2:23.7    > child taps: ay
        🔊 "[sfx shuriken]" · "[sfx tink]" · "[sfx charge]"
2:24.4    > child taps: ay
        🔊 "[sfx powerup]"
2:24.6 SENSEI: Three right answers in a row! Your ninja is getting stronger.  ‹audit_streak_first›
        🔊 "[sfx tap]"
2:25.0    > child taps: ay
2:25.6    > child taps: ay
        🔊 "[sfx tap]"
2:26.2    > child taps: ay
2:26.8    > child taps: ay
        🔊 "[sfx tap]"
2:27.5    > child taps: ay
2:28.1    > child taps: ay
2:28.3 SENSEI: Now let's make words! First, listen to the word. Then tap its sounds, one at a time.  ‹dojo_build›
        🔊 "[sfx tap]" · /r/
2:28.7    > child taps: r
        🔊 "[sfx jump]" · "[sfx tap]" · "[sfx magic]" · /ae/
2:29.3    > child taps: ai
        🔊 "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx place]" · "[sfx tap]" · /n/
2:30.0    > child taps: n
        🔊 "[sfx swish]" · "[sfx thwack]" · "[sfx swish]" · "[sfx thwack]" · "[sfx place]" · "[sfx charge]"
2:30.9 SENSEI: Wow! Super ninja streak!  ‹streak_6›
        🔊 "[sfx powerup]"
2:33.5 SENSEI: Ninjas read this way!  ‹fm_l2_way›
        🔊 /r/ · /ae/ · /n/ · "rain" · "[sfx great]"
2:38.4 SENSEI: Fantastic!  ‹yay_3›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx sparkle]"
2:39.6 SENSEI: Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.  ‹audit_gem_first›
        🔊 "spray" · "[sfx tap]"
2:47.3    > child taps: s
        🔊 /s/ · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tap]" · "[sfx tink]" · /p/ · "[sfx tink]"
2:48.0    > child taps: p
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx place]" · "[sfx boom]" · "[sfx land]" · "[sfx tap]" · "[sfx magic]" · /r/
2:48.6    > child taps: r
        🔊 "[sfx place]" · "[sfx place]" · "[sfx tap]" · /ae/
2:49.2    > child taps: ay
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx tink]" · "[sfx place]" · "[sfx charge]"
2:50.2 SENSEI: Amazing! You're a ninja master!  ‹streak_10›
        🔊 "[sfx powerup]" · /s/ · /p/ · /r/ · /ae/ · "spray" · "[sfx great]"
2:57.7 SENSEI: Amazing!  ‹yay_5›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "say" · "[sfx tap]" · "[sfx magic]" · /s/
2:59.2    > child taps: s
        🔊 "[sfx place]" · "[sfx tap]" · /ae/
2:59.8    > child taps: ay
        🔊 "[sfx swish]" · "[sfx swish]" · "[sfx thwack]" · "[sfx thwack]" · "[sfx place]" · /s/ · /ae/ · "say" · "[sfx great]"
3:03.2 SENSEI: Smashing!  ‹yay_9›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "paint" · "[sfx tap]" · /p/
3:04.1    > child taps: p
        🔊 "[sfx spin]" · "[sfx land]" · "[sfx tap]" · /ae/ · "[sfx thwack]"
3:04.8    > child taps: ai
        🔊 "[sfx kick]" · "[sfx kiai]" · "[sfx place]" · "[sfx land]" · "[sfx boom]" · "[sfx tap]" · /n/
3:05.4    > child taps: n
        🔊 "[sfx swish]" · "[sfx place]" · "[sfx swish]" · "[sfx thwack]" · "[sfx thwack]" · "[sfx tap]" · /t/
3:06.0    > child taps: t
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx place]" · "[sfx tink]" · "[sfx tink]" · "[sfx tink]" · "[sfx place]" · /p/ · /ae/ · /n/ · /t/ · "paint" · "[sfx great]"
3:10.6 SENSEI: Brilliant!  ‹yay_1›
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx charge]"
3:11.7 SENSEI: Well done! You practised so hard!  ‹dojo_done›
        🔊 "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:15.0 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:15.3 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:18.8 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]" · "[sfx place]" · "rain" · "[sfx twinkle]" · "[sfx place]" · "spray" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "say" · "[sfx twinkle]" · "[sfx place]" · "paint" · "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx coin]"
3:23.1 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:25.9 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · /r/
3:26.4    > child taps: sticker rain
        🔊 "[sfx twinkle]"
3:27.0    > child taps: sticker rain
        🔊 /ae/ · "[sfx pop]" · /r/
3:27.6    > child taps: sticker rain
        🔊 "[sfx twinkle]" · /ae/ · "[sfx place]" · "[sfx twinkle]"
3:29.0 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
        🔊 "[sfx tap]"
3:29.5    > child taps: Next
        🔊 "[sfx pop]" · "[sfx pop]"
3:30.1 SENSEI: You know this sound! Now let's look at the different ways we spell it.  ‹audit_bridging_first›

3:30.1 ===== lesson 2 =====
3:34.1 SENSEI: Sorting time! These words have the same sound, but it's spelt in different ways.  ‹audit_sort_first›
3:39.5 SENSEI: This sound can be spelt in two ways.  ‹audit_sort_pair›
        🔊 "[sfx pop]" · /ae/
3:43.3 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 "[sfx pop]" · /ae/
3:47.5 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
3:50.8 SENSEI: Tap the chest with the same spelling as the word.  ‹help_sort›
        🔊 "tray" · "[sfx good]"
3:54.3    > child taps: basket ay
        🔊 /t/
3:54.9    > child taps: basket ay
        🔊 /r/
3:55.6    > child taps: basket ay
        🔊 /ae/
3:56.2    > child taps: basket ay
3:56.8    > child taps: basket ay
        🔊 "tray"
3:57.4    > child taps: basket ay
        🔊 "[sfx kick]" · "[sfx kiai]"
3:58.0    > child taps: basket ay
        🔊 "[sfx boom]" · "[sfx land]"
3:58.6    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "train" · "[sfx good]"
3:59.3    > child taps: basket ai
        🔊 /t/
3:59.9    > child taps: basket ai
        🔊 /r/
4:00.5    > child taps: basket ai
        🔊 /ae/
4:01.1    > child taps: basket ai
4:01.8    > child taps: basket ai
        🔊 /n/
4:02.4    > child taps: basket ai
        🔊 "train"
4:03.0    > child taps: basket ai
4:03.6    > child taps: basket ai
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx tink]"
4:04.2    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "nail"
4:04.8    > child taps: basket ai
        🔊 "[sfx good]"
4:05.5    > child taps: basket ai
        🔊 /n/
4:06.1    > child taps: basket ai
        🔊 /ae/
4:06.7    > child taps: basket ai
        🔊 /l/
4:07.3    > child taps: basket ai
4:08.0    > child taps: basket ai
        🔊 "nail"
4:08.6    > child taps: basket ai
        🔊 "[sfx jump]" · "[sfx spin]"
4:09.2    > child taps: basket ai
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]"
4:09.8    > child taps: basket ai
        🔊 "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx coin]" · "[sfx place]" · "[sfx fizzle]" · "[sfx hmm]"
4:10.5    > child taps: basket ai
4:10.8 SENSEI: Keep going, ninja!  ‹streak_lost›
4:11.1    > child taps: basket ay
4:11.7    > child taps: basket ay
4:12.3 SENSEI: Listen...  ‹listen›
4:12.3    > child taps: basket ay
4:12.9    > child taps: basket ay
        🔊 "play"
4:13.5    > child taps: basket ay
        🔊 /p/
4:14.2    > child taps: basket ay
        🔊 /l/
4:14.8    > child taps: basket ay
        🔊 /ae/
4:15.4    > child taps: basket ay
4:16.0    > child taps: basket ay
        🔊 "play"
4:16.6    > child taps: basket ay
        🔊 "[sfx good]"
4:17.2    > child taps: basket ay
        🔊 "play"
4:17.9    > child taps: basket ay
        🔊 "[sfx kick]" · "[sfx thwack]"
4:18.5    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "snail" · "[sfx good]"
4:19.1    > child taps: basket ai
        🔊 /s/
4:19.7    > child taps: basket ai
        🔊 /n/
4:20.4    > child taps: basket ai
4:21.0    > child taps: basket ai
        🔊 /ae/
4:21.6    > child taps: basket ai
        🔊 /l/
4:22.2    > child taps: basket ai
4:22.8    > child taps: basket ai
        🔊 "snail"
4:23.5    > child taps: basket ai
4:24.1    > child taps: basket ai
        🔊 "[sfx shuriken]" · "[sfx tink]"
4:24.7    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "say" · "[sfx good]"
4:25.3    > child taps: basket ay
        🔊 /s/
4:25.9    > child taps: basket ay
        🔊 /ae/
4:26.6    > child taps: basket ay
4:27.2    > child taps: basket ay
        🔊 "say"
4:27.8    > child taps: basket ay
        🔊 "[sfx swish]" · "[sfx thwack]"
4:28.4    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx good]"
4:29.0    > child taps: basket ay
        🔊 /s/
4:29.7    > child taps: basket ay
        🔊 /p/
4:30.3    > child taps: basket ay
        🔊 /r/
4:30.9    > child taps: basket ay
4:31.5    > child taps: basket ay
        🔊 /ae/
4:32.2    > child taps: basket ay
        🔊 "spray"
4:32.8    > child taps: basket ay
        🔊 "[sfx kick]"
4:33.4    > child taps: basket ay
        🔊 "[sfx thwack]"
4:34.0    > child taps: basket ay
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx charge]" · "[sfx powerup]"
4:34.6 SENSEI: Ninja power!  ‹streak_3›
        🔊 "[sfx good]"
4:34.6    > child taps: basket ai
4:35.3    > child taps: basket ai
        🔊 /r/
4:35.9    > child taps: basket ai
4:36.5    > child taps: basket ai
        🔊 /ae/
4:37.1    > child taps: basket ai
        🔊 /n/
4:37.7    > child taps: basket ai
4:38.3    > child taps: basket ai
        🔊 "rain"
4:38.9    > child taps: basket ai
        🔊 "[sfx jump]" · "[sfx spin]"
4:39.6    > child taps: basket ai
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]"
4:40.2    > child taps: basket ai
        🔊 "[sfx coin]" · "[sfx place]" · "[sfx boom]" · "[sfx charge]"
4:40.7 SENSEI: Sorted! What a clever ninja.  ‹sort_done›
4:40.8    > child taps: basket ai
        🔊 "[sfx jump]" · "[sfx spin]"
4:41.4    > child taps: basket ai
        🔊 "[sfx boom]" · "[sfx pop]" · "[sfx great]" · "[sfx pop]" · "[sfx twinkle]"
4:42.0    > child taps: basket ai
        🔊 "[sfx twinkle]"
4:42.7    > child taps: basket ai
        🔊 "[sfx gong]" · "[sfx charge]" · "[sfx powerup]"

4:43.3 ===== reward 2 =====
        🔊 "[sfx place]" · "tray" · "[sfx twinkle]" · "[sfx place]" · "train" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "nail" · "[sfx twinkle]" · "[sfx place]" · "play" · "[sfx jump]" · "[sfx place]" · "snail" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx whoosh]"
4:47.9 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

4:48.2 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
4:50.8 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
