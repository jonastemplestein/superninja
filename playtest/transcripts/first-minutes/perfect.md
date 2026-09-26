# The first five minutes (perfect child)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Holds on Next | Target | Hard cap | Verdict |
|---|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s |  | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |  |
| intro film | 0:01.3 | 57.2 s | 15.8 s | 45 s |  | over target |
| choose | 0:58.5 | 6.3 s | 2.0 s | 6 s |  | over target |
| opt-in | 1:04.8 | 18.8 s | 3.9 s | 16 s | 30 s | settled in 10.7 s |
| dojo welcome | 1:23.6 | 18.8 s |  | 12 s |  | over target |
| ? | 1:42.4 | 0.6 s |  |  |  |  |
| lesson 1 | 1:43.0 | 81.1 s | 2.0 s | 85 s | 100 s | within target |
| reward 1 | 3:04.1 | 19.9 s | 2.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:24.0 | 66.2 s |  | 65 s | 75 s | over target |
| reward 2 | 4:30.2 | 32.2 s | 10.6 s | 26 s | 30 s | over the cap |
| map | 5:02.4 | 6.0 s |  |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 10.7 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:02.4** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "none",
 "band": "W",
 "seenPlacement": true,
 "stickers": [
  "sun",
  "sock",
  "cat",
  "sausage",
  "moon",
  "fish",
  "dog",
  "flower",
  "sunflower",
  "star",
  "starfish",
  "fishdog"
 ],
 "shiny": [
  "fishdog"
 ],
 "firstSession": null,
 "adjustLog": [
  {
   "at": 1790460088683,
   "text": "Chose \"not at school yet\": started at the warm-ups"
  }
 ],
 "warmups": {
  "w1-wu1": {
   "first": 5,
   "total": 5
  },
  "w1-wu2": {
   "first": 3,
   "total": 3
  }
 }
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":11.7},{"i":4,"kind":"fastslow","at":27.1},{"i":5,"kind":"fastslow","at":35.3},{"i":6,"kind":"notice","at":39.8},{"i":7,"kind":"tapall","at":54.8,"held":1.8},{"i":8,"kind":"done","at":76.6}],"result":{"key":"W1","version":"W","secs":80,"score":{"first":5,"total":5,"right":1},"closedByPaw":false,"skipped":[]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":13},{"i":2,"kind":"swap","at":24.9,"skipped":"behind"},{"i":3,"kind":"which","at":24.9},{"i":4,"kind":"compound","at":38.2},{"i":5,"kind":"compound","at":49.9},{"i":6,"kind":"tapall","at":62.8,"skipped":"behind"},{"i":7,"kind":"done","at":62.8}],"result":{"key":"W2","version":"W","secs":66,"score":{"first":3,"total":3,"right":1},"closedByPaw":false,"skipped":["swap (behind)","tapall (behind)"]}}

## Everything said and done

0:00.0    > child taps: Start

0:00.0 ===== title =====
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.7 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:08.8    > child taps: Next
0:08.9 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:16.2    > child taps: Next
0:16.9 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:24.3    > child taps: Next
0:24.6 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:33.5    > child taps: Next
0:33.9 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:39.8    > child taps: Next
0:40.2 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:45.4    > child taps: Next
0:45.9 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:52.2    > child taps: Next
0:52.7 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:57.9 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
0:57.9    > child taps: Next

0:58.5 ===== choose =====
0:59.7 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
0:59.7    > child taps: kai
1:04.1    > child taps: Next
1:04.6 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›

1:04.8 ===== opt-in =====
1:06.7 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
1:09.6 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
1:12.9 SENSEI: Not yet!  ‹fm_opt_echo_notyet›
1:12.9    > child taps: teddy
1:14.8    > child taps: Next
1:15.2 SENSEI: Then I've set up some listening games, just for you!  ‹fm_opt_ok_notyet›
1:18.3 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:23.0 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›
1:23.0    > child taps: Next

1:23.6 ===== dojo welcome =====
1:27.3    > child taps: gong
1:27.7 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
1:32.9 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:32.9    > child taps: Help
1:35.5 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:39.7 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:39.7    > child taps: Hear it again

1:42.4 ===== ? =====
1:43.0 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:43.0 ===== lesson 1 =====
1:46.2 SENSEI: This is the sun.  ‹fm_name_sun›
1:47.9 SENSEI: This is a sock.  ‹fm_name_sock›
1:49.2 SENSEI: This is a cat.  ‹fm_name_cat›
1:50.5 SENSEI: Let me show you!  ‹fm_show_me›
1:51.6 SENSEI: Tap the sun!  ‹fm_tap_sun›
1:53.1 SENSEI: Now you try!  ‹fm_you_try›
1:54.1 SENSEI: Tap the sock!  ‹fm_tap_sock›
1:54.1    > child taps: sock
1:54.7 SENSEI: Watch me first!  ‹fm_show_me_2›
1:56.0 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
1:58.1 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "sun" (slowly)
2:02.4 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
2:05.7 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:10.1 SENSEI: Your turn! Tap the tortoise, and say it slowly with me.  ‹fm_tap_tortoise›
        🔊 "sun" (slowly)
2:15.5    > child taps: tortoise
2:18.2 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "sun"
2:21.9    > child taps: rabbit
2:22.9 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
2:27.5 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:32.7 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:38.0    > child taps: Next
2:38.4 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:40.3 SENSEI: This is the moon.  ‹fm_name_moon›
2:42.1 SENSEI: Let me show you!  ‹fm_show_me›
2:43.2 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/
2:48.2 SENSEI: Your turn!  ‹fm_you_try_2›
2:50.4    > child taps: sock
2:53.6    > child taps: sausage
2:55.9 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 /s/
2:59.9 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
3:03.7 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›

3:04.1 ===== reward 1 =====
3:07.5 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
3:08.9 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
3:13.9 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:16.6 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "sun"
3:17.0    > child taps: sticker sun
3:17.6    > child taps: sticker sun
        🔊 "sun" (slowly)
3:18.3    > child taps: sticker sun
3:18.9    > child taps: sticker sun
3:19.5    > child taps: sticker sun
3:20.1    > child taps: sticker sun
3:21.5 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
3:23.3    > child taps: Next

3:24.0 ===== lesson 2 =====
3:24.2 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:26.4 SENSEI: This is a fish.  ‹fm_name_fish›
3:27.9 SENSEI: This is a dog.  ‹fm_name_dog›
3:29.0 SENSEI: Let me show you!  ‹fm_show_me›
3:30.1 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
3:33.9 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
3:37.3 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
        🔊 "fish"
3:40.7    > child taps: fish
        🔊 "dog"
3:43.3    > child taps: dog
3:45.7 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
3:49.4 SENSEI: Watch me first!  ‹fm_show_me_2›
3:50.7 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
3:52.9 SENSEI: Now you try!  ‹fm_you_try›
3:54.3 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
4:00.3    > child taps: rail 0
4:00.8 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
4:01.9 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
4:04.9 SENSEI: This is a flower.  ‹fm_name_flower›
4:06.4 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
4:14.1 SENSEI: This is a star.  ‹fm_name_star›
4:16.0 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
4:21.6    > child taps: rabbit
4:23.7 SENSEI: Starfish!  ‹fm_starfish›
4:26.4 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›

4:30.2 ===== reward 2 =====
4:30.4 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
4:38.2 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
4:41.5 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/
4:50.0    > child taps: Next
4:50.9 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
4:56.8 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/
5:01.2    > child taps: Next
5:01.8    > child taps: Next
5:02.0 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:02.4 ===== map =====
5:04.9 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
