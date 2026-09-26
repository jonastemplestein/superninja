# The first five minutes (learner child)

Game seconds from the title tap (played at 2× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.6 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 43.9 s | 45 s |  | within target |
| choose | 0:45.1 | 3.7 s | 6 s |  | within target |
| opt-in | 0:48.8 | 18.9 s | 16 s | 30 s | settled in 11.8 s |
| dojo welcome | 1:07.7 | 19.0 s | 12 s |  | over target |
| ? | 1:26.7 | 0.3 s |  |  |  |
| lesson 1 | 1:27.0 | 92.4 s | 85 s | 100 s | over target |
| reward 1 | 2:59.4 | 15.4 s | 21 s | 26 s | within target |
| lesson 2 | 3:14.8 | 66.9 s | 60 s | 75 s | over target |
| reward 2 | 4:21.7 | 29.7 s | 26 s | 30 s | over target |
| map | 4:51.4 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 11.8 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 4:51.4** (target 4:34, cap 5:00).

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
   "at": 1790445000382,
   "text": "Chose \"not at school yet\": started at the warm-ups"
  }
 ],
 "warmups": {
  "w1-wu1": {
   "first": 4,
   "total": 5
  },
  "w1-wu2": {
   "first": 2,
   "total": 3
  }
 }
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":15.5},{"i":4,"kind":"fastslow","at":30.9},{"i":5,"kind":"fastslow","at":40.3},{"i":6,"kind":"notice","at":50.8},{"i":7,"kind":"tapall","at":64.2},{"i":8,"kind":"done","at":88.3}],"result":{"key":"W1","version":"W","secs":92,"score":{"first":4,"total":5,"right":1},"closedByPaw":false,"skipped":[]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":13.1},{"i":2,"kind":"swap","at":30.7,"skipped":"behind"},{"i":3,"kind":"which","at":30.7,"skipped":"demo"},{"i":4,"kind":"compound","at":40.3},{"i":5,"kind":"compound","at":51.9},{"i":6,"kind":"tapall","at":63.2,"skipped":"behind"},{"i":7,"kind":"done","at":63.2}],"result":{"key":"W2","version":"W","secs":67,"score":{"first":2,"total":3,"right":1},"closedByPaw":false,"skipped":["swap (behind)","which (demo)","tapall (behind)"]}}

## Everything said and done

0:00.0    > child taps: Start

0:00.0 ===== title =====
0:00.4    > child taps: Start
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====
0:01.0    > child taps: player Ninja

0:01.3 ===== intro film =====
0:01.6 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.3 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:13.7 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:19.6 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:27.4 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:31.8 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:36.0 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:40.8 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:45.0 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
0:45.1    > child taps: kai

0:45.1 ===== choose =====
0:45.2 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
0:45.5    > child taps: kai
0:45.8    > child taps: kai
0:46.1    > child taps: kai
0:46.4    > child taps: kai
0:46.7    > child taps: kai
0:47.0    > child taps: kai
0:47.3    > child taps: kai
0:47.6    > child taps: kai
0:47.9    > child taps: kai
0:48.2    > child taps: kai
0:48.5    > child taps: kai

0:48.8 ===== opt-in =====
0:49.2 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:51.4 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:54.3 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
0:59.0 SENSEI: Not yet!  ‹fm_opt_echo_notyet›
0:59.0    > child taps: teddy
1:00.9 SENSEI: Then I've set up some listening games, just for you!  ‹fm_opt_ok_notyet›
1:04.0 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:07.5 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:07.7 ===== dojo welcome =====
1:13.0    > child taps: gong
1:13.4 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
1:16.0 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:16.0    > child taps: Help
1:18.6 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:23.9 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:23.9    > child taps: Hear it again

1:26.7 ===== ? =====

1:27.0 ===== lesson 1 =====
1:27.2 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›
1:30.3 SENSEI: This is the sun.  ‹fm_name_sun›
1:32.1 SENSEI: This is a sock.  ‹fm_name_sock›
1:33.3 SENSEI: This is a cat.  ‹fm_name_cat›
1:34.7 SENSEI: Let me show you!  ‹fm_show_me›
1:35.8 SENSEI: Tap the sun!  ‹fm_tap_sun›
1:37.3 SENSEI: Now you try!  ‹fm_you_try›
1:38.2 SENSEI: Tap the sock!  ‹fm_tap_sock›
1:42.1    > child taps: sock
1:42.7 SENSEI: Watch me first!  ‹fm_show_me_2›
1:44.1 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
1:46.1 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "sun" (slowly)
1:50.3 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
1:53.7 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
1:58.1 SENSEI: Your turn! Tap the tortoise, and say it slowly with me.  ‹fm_tap_tortoise›
        🔊 "sun" (slowly)
2:04.8    > child taps: tortoise
2:07.5 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "sun" (slowly)
2:12.4    > child taps: tortoise
2:14.8 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "sun"
2:17.1    > child taps: rabbit
2:18.1 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
2:22.7 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:27.9 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:31.8 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:33.7 SENSEI: This is the moon.  ‹fm_name_moon›
2:35.5 SENSEI: Let me show you!  ‹fm_show_me›
2:36.6 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/
2:41.5 SENSEI: Your turn!  ‹fm_you_try_2›
2:45.0    > child taps: sock
2:49.3    > child taps: sausage
2:51.5 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 /s/
2:55.5 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
2:59.2 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›

2:59.4 ===== reward 1 =====
3:03.0 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
3:04.5 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
3:09.4 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:12.2 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "sun"
3:12.3    > child taps: sticker sun
3:12.6    > child taps: sticker sun
3:12.9    > child taps: sticker sun
        🔊 "sun"
3:13.3    > child taps: sticker sun
        🔊 "sun" (slowly)
3:14.4 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
3:14.5    > child taps: Next

3:14.8 ===== lesson 2 =====
3:15.3 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:17.5 SENSEI: This is a fish.  ‹fm_name_fish›
3:19.1 SENSEI: This is a dog.  ‹fm_name_dog›
3:20.1 SENSEI: Let me show you!  ‹fm_show_me›
3:21.2 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
3:25.1 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
3:28.5 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
3:33.4 SENSEI: Start here, on this side!  ‹fm_l2_start›
3:33.4    > child taps: dog
        🔊 "fish"
3:36.9    > child taps: fish
        🔊 "dog"
3:40.5    > child taps: dog
3:42.7 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
3:46.3 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
3:53.5    > child taps: rail 0
3:54.0 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
3:55.1 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
3:58.2 SENSEI: This is a flower.  ‹fm_name_flower›
3:59.6 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
4:07.3 SENSEI: This is a star.  ‹fm_name_star›
4:09.1    > child taps: rabbit
4:15.4 SENSEI: Starfish!  ‹fm_starfish›
4:18.1 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›

4:21.7 ===== reward 2 =====
4:22.1 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
4:29.8 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
4:33.0 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/
4:41.0 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
4:46.9 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/
4:51.4 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

4:51.4 ===== map =====
4:54.3 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
