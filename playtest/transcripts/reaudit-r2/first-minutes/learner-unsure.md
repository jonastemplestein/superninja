# The first five minutes (learner child, opt-in: unsure)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.0 s | 45 s |  | within target |
| choose | 0:46.3 | 4.3 s | 6 s |  | within target |
| opt-in | 0:50.6 | 32.4 s | 16 s | 30 s | settled in 24.4 s |
| dojo welcome | 1:23.0 | 23.0 s | 12 s |  | over target |
| ? | 1:46.0 | 0.6 s |  |  |  |
| lesson 1 | 1:46.6 | 93.3 s | 85 s | 100 s | over target |
| reward 1 | 3:19.9 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:35.8 | 68.8 s | 60 s | 75 s | over target |
| reward 2 | 4:44.7 | 29.3 s | 26 s | 30 s | over target |
| map | 5:14.0 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 24.4 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:14.0** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "unsure",
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
   "at": 1790438816807,
   "text": "Chose \"not sure\": started at the warm-ups"
  }
 ],
 "warmups": {
  "w1-wu1": {
   "first": 4,
   "total": 5
  },
  "w1-wu2": {
   "first": 1,
   "total": 3
  }
 }
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":15.4},{"i":4,"kind":"fastslow","at":30.8},{"i":5,"kind":"fastslow","at":40.2},{"i":6,"kind":"notice","at":50.8},{"i":7,"kind":"tapall","at":64.2},{"i":8,"kind":"done","at":89.1}],"result":{"key":"W1","version":"W","secs":93,"score":{"first":4,"total":5,"right":1},"closedByPaw":false,"skipped":[]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":24.6,"skipped":"behind"},{"i":3,"kind":"which","at":24.6},{"i":4,"kind":"compound","at":39.1},{"i":5,"kind":"compound","at":49.3},{"i":6,"kind":"tapall","at":65.3,"skipped":"cap"},{"i":7,"kind":"done","at":65.3}],"result":{"key":"W2","version":"W","secs":69,"score":{"first":1,"total":3,"right":1},"closedByPaw":false,"skipped":["swap (behind)","tapall (cap)"]}}

## Everything said and done


0:00.0 ===== title =====
        🔊 "[sfx tap]" · "[sfx gong]" · "[sfx whoosh]" · "[sfx gong]" · "[sfx whoosh]"
0:00.1    > child taps: Start
        🔊 "[sfx great]" · "[sfx jump]"
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.8 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.5 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:14.0 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:19.8 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:27.8 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.6 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:36.8 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.8 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:46.1 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
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
0:50.0    > child taps: kai
0:50.5 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›

0:50.6 ===== opt-in =====
0:52.6 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:55.5 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
1:00.2 SENSEI: Big school!  ‹fm_opt_echo_school›
1:00.2    > child taps: school
        🔊 "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]"
1:02.5 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:03.6 SENSEI: Reception!  ‹fm_opt_rec›
1:04.9 SENSEI: Year One!  ‹fm_opt_y1›
1:06.3 SENSEI: Year Two!  ‹fm_opt_y2›
1:07.9 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
        🔊 "[sfx pop]"
1:13.2 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
1:13.2    > child taps: Not sure
        🔊 "[sfx twinkle]"
1:15.1 SENSEI: That's fine! I've set up some listening games for you, and we'll see how you get on.  ‹fm_opt_ok_unsure›
        🔊 "[sfx place]" · "[sfx great]"
1:19.1 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:22.7 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:23.0 ===== dojo welcome =====
1:28.1    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:28.6 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:35.1 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:35.1    > child taps: Help
        🔊 "[sfx twinkle]"
1:37.7 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:43.3 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:43.3    > child taps: Hear it again
        🔊 "[sfx twinkle]"

1:46.0 ===== ? =====
1:46.6 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:46.6 ===== lesson 1 =====
1:49.8 SENSEI: This is the sun.  ‹fm_name_sun›
1:51.5 SENSEI: This is a sock.  ‹fm_name_sock›
1:52.7 SENSEI: This is a cat.  ‹fm_name_cat›
1:54.1 SENSEI: Let me show you!  ‹fm_show_me›
1:55.2 SENSEI: Tap the sun!  ‹fm_tap_sun›
        🔊 "[sfx tap]" · "[sfx good]" · "[sfx tink]"
1:56.7 SENSEI: Now you try!  ‹fm_you_try›
1:57.6 SENSEI: Tap the sock!  ‹fm_tap_sock›
        🔊 "[sfx good]"
2:01.4    > child taps: sock
        🔊 "[sfx tink]"
2:02.0 SENSEI: Watch me first!  ‹fm_show_me_2›
2:03.4 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
        🔊 "[sfx tap]" · "[sfx whoosh]"
2:05.4 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "[sfx tap]" · "sun" (slowly) · "[sfx tink]"
2:09.6 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
        🔊 "[sfx whoosh]"
2:13.0 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:17.4 SENSEI: Your turn! Tap the tortoise, and say it slowly with me.  ‹fm_tap_tortoise›
        🔊 "sun" (slowly)
2:24.1    > child taps: tortoise
        🔊 "[sfx tink]"
2:26.8 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "sun" (slowly)
2:31.8    > child taps: tortoise
        🔊 "[sfx tink]"
2:34.2 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "[sfx whoosh]" · "sun"
2:36.5    > child taps: rabbit
2:37.5 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
        🔊 "sun (held first sound)" (slowly) · "sock (held first sound)" (slowly)
2:42.1 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:47.3 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:51.1 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:53.1 SENSEI: This is the moon.  ‹fm_name_moon›
2:54.8 SENSEI: Let me show you!  ‹fm_show_me›
2:55.9 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/ · "[sfx tap]" · "[sfx good]" · "sun (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]"
3:00.9 SENSEI: Your turn!  ‹fm_you_try_2›
        🔊 "[sfx good]"
3:04.9    > child taps: sock
        🔊 "sock (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx good]"
3:09.4    > child taps: sausage
        🔊 "sausage (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx charge]" · "[sfx powerup]"
3:11.6 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 "[sfx spin]" · "[sfx land]" · "[sfx thwack]" · /s/ · "[sfx great]"
3:15.6 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:19.4 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:19.9 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:23.2 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]"
3:24.7 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx coin]"
3:29.7 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:32.4 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · "sun" · "[sfx twinkle]"
3:32.8    > child taps: sticker sun
3:33.4    > child taps: sticker sun
        🔊 "sun" (slowly) · "[sfx pop]" · "sun"
3:34.0    > child taps: sticker sun
        🔊 "[sfx twinkle]" · "[sfx place]" · "[sfx twinkle]" · "sun" (slowly)
3:35.1 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
        🔊 "[sfx tap]"
3:35.2    > child taps: Next

3:35.8 ===== lesson 2 =====
3:36.1 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:38.3 SENSEI: This is a fish.  ‹fm_name_fish›
3:39.8 SENSEI: This is a dog.  ‹fm_name_dog›
3:40.8 SENSEI: Let me show you!  ‹fm_show_me›
3:41.9 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx pop]" · "[sfx magic]" · "[sfx petal]"
3:45.6 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
3:50.7 SENSEI: Start here, on this side!  ‹fm_l2_start›
3:50.7    > child taps: dog
        🔊 "fish"
3:54.2    > child taps: fish
        🔊 "dog"
3:58.1    > child taps: dog
3:58.8 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
        🔊 "[sfx pop]" · "[sfx twinkle]" · "[sfx petal]"
4:01.0 SENSEI: Watch me first!  ‹fm_show_me_2›
4:02.3 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx tap]" · "[sfx good]"
4:04.5 SENSEI: Now you try!  ‹fm_you_try›
        🔊 "[sfx magic]" · "[sfx petal]"
4:05.9 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
        🔊 "[sfx good]"
4:13.1    > child taps: rail 0
        🔊 "[sfx twinkle]"
4:13.7 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
        🔊 "[sfx petal]"
4:14.8 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
4:17.8 SENSEI: This is a flower.  ‹fm_name_flower›
4:19.2 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
        🔊 "[sfx tap]" · "[sfx tap]" · "[sfx charge]" · "[sfx pop]" · "[sfx magic]" · "[sfx sparkle]"
4:25.5 SENSEI: This is a star.  ‹fm_name_star›
4:27.3 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
        🔊 "star"
4:34.4    > child taps: tortoise
        🔊 "fish"
4:37.9    > child taps: rabbit
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx pop]" · "[sfx magic]"
4:39.2 SENSEI: Starfish!  ‹fm_starfish›
        🔊 "[sfx petal]" · "[sfx twinkle]" · "[sfx great]"
4:40.8 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]" · "[sfx charge]" · "[sfx powerup]"

4:44.7 ===== reward 2 =====
4:44.9 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx charge]" · "[sfx great]"
4:52.6 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
        🔊 "[sfx twinkle]"
4:55.9 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/ · "[sfx whoosh]"
5:04.0 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
5:09.8 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/ · "[sfx whoosh]"
5:13.6 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:14.0 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
5:16.5 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
