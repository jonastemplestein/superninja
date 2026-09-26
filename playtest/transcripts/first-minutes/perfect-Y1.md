# The first five minutes (perfect child, opt-in: Y1)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.3 s | 45 s |  | over target |
| choose | 0:46.6 | 3.7 s | 6 s |  | within target |
| opt-in | 0:50.3 | 31.0 s | 28 s | 30 s | settled in 22.4 s |
| dojo welcome | 1:21.3 | 19.0 s | 12 s |  | over target |
| ? | 1:40.3 | 0.6 s |  |  |  |
| lesson 1 | 1:40.9 | 95.3 s | 85 s | 100 s | over target |
| reward 1 | 3:16.3 | 14.7 s | 21 s | 26 s | within target |
| lesson 2 | 3:31.0 | 67.0 s | 60 s | 75 s | over target |
| reward 2 | 4:37.9 | 4.3 s | 26 s | 30 s | within target |
| map | 4:42.2 | 6.1 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 22.4 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 4:42.2** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "Y1",
 "band": "Y1",
 "seenPlacement": true,
 "stickers": [
  "nail",
  "paint",
  "rain",
  "spray",
  "day",
  "stay",
  "play",
  "say",
  "snail"
 ],
 "shiny": [],
 "firstSession": null,
 "adjustLog": [
  {
   "at": 1790438333480,
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
0:00.1    > child taps: Start
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.7 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.5 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:14.0 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:20.1 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:28.1 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.6 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:37.0 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.9 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:46.1 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
0:46.6    > child taps: kai

0:46.6 ===== choose =====
0:46.7 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
0:47.2    > child taps: kai
0:47.9    > child taps: kai
0:48.5    > child taps: kai
0:49.1    > child taps: kai
0:49.7    > child taps: kai

0:50.3 ===== opt-in =====
0:50.8 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.9 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:55.8 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
0:59.2 SENSEI: Big school!  ‹fm_opt_echo_school›
0:59.2    > child taps: school
1:01.4 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:02.6 SENSEI: Reception!  ‹fm_opt_rec›
1:03.9 SENSEI: Year One!  ‹fm_opt_y1›
1:05.2 SENSEI: Year Two!  ‹fm_opt_y2›
1:06.9 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
1:10.9 SENSEI: Year One!  ‹fm_opt_y1›
1:10.9    > child taps: Year One
1:12.7 SENSEI: I've set up the game for Year One, with new ways to spell the sounds you know!  ‹fm_opt_ok_y1›
1:17.3 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:20.9 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:21.3 ===== dojo welcome =====
1:25.1    > child taps: gong
1:25.6 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
1:30.7    > child taps: Help
1:30.8 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:33.4 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:37.6 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:37.6    > child taps: Hear it again

1:40.3 ===== ? =====
1:40.6 SENSEI: This is the dojo. A dojo is where ninjas practise! Let's practise some sounds.  ‹dojo_hello›

1:40.9 ===== lesson 1 =====
1:46.2 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/
1:49.9 SENSEI: We hear the sound. Now look: this is how we spell it.  ‹audit_hear_see›
1:50.3    > child taps: ai
1:51.0    > child taps: ai
1:51.6    > child taps: ai
1:52.2    > child taps: ai
1:52.8    > child taps: ai
1:53.5    > child taps: ai
        🔊 /ae/
1:54.1    > child taps: ai
1:54.7    > child taps: ai
1:54.9 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
1:55.4    > child taps: ai
1:56.0    > child taps: ai
1:56.6    > child taps: ai
1:57.3    > child taps: ai
1:57.9    > child taps: ai
1:58.1 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
1:58.5    > child taps: ai
1:59.1    > child taps: ai
1:59.8    > child taps: ai
        🔊 /ae/ · /ae/
2:00.4    > child taps: ai
2:00.9 SENSEI: Ace!  ‹yay_10›
2:01.0    > child taps: ai
2:01.6    > child taps: ai
2:01.7 SENSEI: Listen...  ‹listen›
        🔊 /ae/ · /ae/
2:05.3 SENSEI: And this is how we spell it.  ‹audit_spell_it›
2:05.4    > child taps: ay
2:06.0    > child taps: ay
2:06.6    > child taps: ay
        🔊 /ae/
2:07.3    > child taps: ay
2:07.9    > child taps: ay
2:08.1 SENSEI: Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling.  ‹same_sound_new›
2:08.5    > child taps: ay
2:09.1    > child taps: ay
2:09.7    > child taps: ay
2:10.4    > child taps: ay
2:11.0    > child taps: ay
2:11.6    > child taps: ay
2:12.2    > child taps: ay
2:12.8    > child taps: ay
2:13.5    > child taps: ay
2:14.1    > child taps: ay
2:14.7    > child taps: ay
2:14.9 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
2:15.3    > child taps: ay
2:15.9    > child taps: ay
2:16.6    > child taps: ay
2:17.2    > child taps: ay
2:17.8    > child taps: ay
2:18.1 SENSEI: Tap it, and say it with me!  ‹dojo_tap_say›
2:18.4    > child taps: ay
2:19.1    > child taps: ay
2:19.7    > child taps: ay
        🔊 /ae/ · /ae/
2:20.3    > child taps: ay
2:20.9 SENSEI: Super!  ‹yay_2›
2:20.9    > child taps: ay
2:21.6 SENSEI: Can you find...  ‹dojo_find›
2:21.6    > child taps: ay
        🔊 /ae/
2:22.2    > child taps: ai
2:22.8    > child taps: ai
2:22.9 SENSEI: Smashing!  ‹yay_9›
2:23.5    > child taps: ai
2:23.8 SENSEI: Can you find...  ‹dojo_find›
        🔊 /ae/
2:24.1    > child taps: ay
2:24.7    > child taps: ay
2:25.0 SENSEI: Three right answers in a row! Your ninja is getting stronger.  ‹audit_streak_first›
2:25.3    > child taps: ay
2:25.9    > child taps: ay
2:26.6    > child taps: ay
2:27.2    > child taps: ay
2:27.8    > child taps: ay
2:28.4    > child taps: ay
2:28.7 SENSEI: Now let's make words! First, listen to the word. Then tap its sounds, one at a time.  ‹dojo_build›
2:29.0    > child taps: n
        🔊 /n/ · /ae/
2:29.7    > child taps: ai
        🔊 /l/
2:30.3    > child taps: l
2:31.1 SENSEI: Wow! Super ninja streak!  ‹streak_6›
2:33.8 SENSEI: Ninjas read this way!  ‹fm_l2_way›
        🔊 /n/ · /ae/ · /l/ · "nail"
2:38.7 SENSEI: Brilliant!  ‹yay_1›
2:39.8 SENSEI: Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.  ‹audit_gem_first›
        🔊 "paint" · /p/
2:47.7    > child taps: p
        🔊 /ae/
2:48.3    > child taps: ai
        🔊 /n/
2:48.9    > child taps: n
2:49.5    > child taps: t
        🔊 /t/
2:50.5 SENSEI: Amazing! You're a ninja master!  ‹streak_10›
        🔊 /p/ · /ae/ · /n/ · /t/ · "paint"
2:57.6 SENSEI: Smashing!  ‹yay_9›
        🔊 "rain" · /r/
2:58.9    > child taps: r
        🔊 /ae/
2:59.5    > child taps: ai
        🔊 /n/
3:00.1    > child taps: n
        🔊 /r/ · /ae/ · /n/ · "rain"
3:04.1 SENSEI: Ace!  ‹yay_10›
        🔊 "spray" · /s/
3:05.1    > child taps: s
        🔊 /p/
3:05.7    > child taps: p
        🔊 /r/
3:06.3    > child taps: r
        🔊 /ae/
3:06.9    > child taps: ay
        🔊 /s/ · /p/ · /r/ · /ae/ · "spray"
3:11.6 SENSEI: Brilliant!  ‹yay_1›
3:12.8 SENSEI: Well done! You practised so hard!  ‹dojo_done›
3:16.0 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›

3:16.3 ===== reward 1 =====
3:19.8 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "nail" · "paint" · "rain" · "spray"
3:24.2 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:26.9 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 /n/
3:27.3    > child taps: sticker nail
3:27.9    > child taps: sticker nail
        🔊 /ae/ · /n/
3:28.5    > child taps: sticker nail
        🔊 /ae/
3:29.9 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
3:30.4    > child taps: Next
3:31.0 SENSEI: You know this sound! Now let's look at the different ways we spell it.  ‹audit_bridging_first›

3:31.0 ===== lesson 2 =====
3:35.0 SENSEI: Sorting time! These words have the same sound, but it's spelt in different ways.  ‹audit_sort_first›
3:40.4 SENSEI: This sound can be spelt in two ways.  ‹audit_sort_pair›
        🔊 /ae/
3:44.2 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
        🔊 /ae/
3:48.4 SENSEI: It's two letters, but it's one sound.  ‹t_two_letters›
3:51.7 SENSEI: Tap the chest with the same spelling as the word.  ‹help_sort›
        🔊 "day"
3:55.2    > child taps: basket ay
        🔊 /d/
3:55.8    > child taps: basket ay
        🔊 /ae/
3:56.4    > child taps: basket ay
        🔊 "day"
3:57.0    > child taps: basket ay
3:57.6    > child taps: basket ay
3:58.3    > child taps: basket ay
        🔊 "stay"
3:58.9    > child taps: basket ay
        🔊 /s/
3:59.5    > child taps: basket ay
        🔊 /t/
4:00.1    > child taps: basket ay
4:00.7    > child taps: basket ay
        🔊 /ae/
4:01.4    > child taps: basket ay
        🔊 "stay"
4:02.0    > child taps: basket ay
4:02.6    > child taps: basket ay
4:03.2    > child taps: basket ay
4:03.9    > child taps: basket ai
        🔊 /r/
4:04.5    > child taps: basket ai
        🔊 /ae/
4:05.1    > child taps: basket ai
        🔊 /n/
4:05.7    > child taps: basket ai
4:06.3    > child taps: basket ai
        🔊 "rain"
4:06.9    > child taps: basket ai
4:07.6    > child taps: basket ai
4:08.2    > child taps: basket ai
4:08.8    > child taps: basket ay
        🔊 /p/
4:09.4    > child taps: basket ay
        🔊 /l/
4:10.1    > child taps: basket ay
        🔊 /ae/
4:10.7    > child taps: basket ay
4:11.3    > child taps: basket ay
        🔊 "play"
4:11.9    > child taps: basket ay
4:12.5    > child taps: basket ay
4:13.1    > child taps: basket ay
        🔊 "say"
4:13.8    > child taps: basket ay
        🔊 /s/
4:14.4    > child taps: basket ay
        🔊 /ae/
4:15.0    > child taps: basket ay
4:15.6    > child taps: basket ay
        🔊 "say"
4:16.3    > child taps: basket ay
4:16.9    > child taps: basket ay
4:17.5    > child taps: basket ay
        🔊 "snail"
4:18.1    > child taps: basket ai
        🔊 /s/
4:18.8    > child taps: basket ai
        🔊 /n/
4:19.4    > child taps: basket ai
4:20.0    > child taps: basket ai
        🔊 /ae/
4:20.6    > child taps: basket ai
        🔊 /l/
4:21.2    > child taps: basket ai
4:21.8    > child taps: basket ai
        🔊 "snail"
4:22.5    > child taps: basket ai
4:23.1    > child taps: basket ai
4:23.7    > child taps: basket ai
4:24.3    > child taps: basket ai
        🔊 "nail"
4:24.9    > child taps: basket ai
4:25.6    > child taps: basket ai
        🔊 /n/
4:26.2    > child taps: basket ai
        🔊 /ae/
4:26.8    > child taps: basket ai
        🔊 /l/
4:27.4    > child taps: basket ai
4:28.0    > child taps: basket ai
        🔊 "nail"
4:28.7    > child taps: basket ai
4:29.3    > child taps: basket ai
4:29.9    > child taps: basket ai
        🔊 "paint"
4:30.5    > child taps: basket ai
        🔊 /p/ · /ae/
4:31.2    > child taps: basket ai
4:31.8    > child taps: basket ai
        🔊 /n/
4:32.4    > child taps: basket ai
        🔊 /t/
4:33.0    > child taps: basket ai
4:33.6    > child taps: basket ai
        🔊 "paint"
4:34.2    > child taps: basket ai
4:34.9    > child taps: basket ai
4:35.4 SENSEI: Sorted! What a clever ninja.  ‹sort_done›
4:35.5    > child taps: basket ai
4:36.1    > child taps: basket ai
4:36.7    > child taps: basket ai
4:37.3    > child taps: basket ai

4:37.9 ===== reward 2 =====
        🔊 "day" · "stay" · "play" · "say" · "snail"

4:42.2 ===== map =====
4:42.3 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›
4:45.2 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
