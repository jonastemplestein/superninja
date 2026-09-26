# The first five minutes (learner child)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 44.6 s | 45 s |  | within target |
| choose | 0:45.9 | 3.7 s | 6 s |  | within target |
| opt-in | 0:49.6 | 18.7 s | 16 s | 30 s | settled in 12 s |
| dojo welcome | 1:08.3 | 23.4 s | 12 s |  | over target |
| ? | 1:31.7 | 0.6 s |  |  |  |
| lesson 1 | 1:32.3 | 93.6 s | 85 s | 100 s | over target |
| reward 1 | 3:05.9 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:21.9 | 69.0 s | 60 s | 75 s | over target |
| reward 2 | 4:30.9 | 29.4 s | 26 s | 30 s | over target |
| map | 5:00.2 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 12 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:00.2** (target 4:34, cap 5:00).

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
   "at": 1790438532959,
   "text": "Chose \"not at school yet\": started at the warm-ups"
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

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":15.8},{"i":4,"kind":"fastslow","at":31.2},{"i":5,"kind":"fastslow","at":40.6},{"i":6,"kind":"notice","at":51.1},{"i":7,"kind":"tapall","at":64.5},{"i":8,"kind":"done","at":89.4}],"result":{"key":"W1","version":"W","secs":93,"score":{"first":4,"total":5,"right":1},"closedByPaw":false,"skipped":[]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":24.6,"skipped":"behind"},{"i":3,"kind":"which","at":24.6},{"i":4,"kind":"compound","at":39.2},{"i":5,"kind":"compound","at":49.4},{"i":6,"kind":"tapall","at":65.4,"skipped":"cap"},{"i":7,"kind":"done","at":65.4}],"result":{"key":"W2","version":"W","secs":69,"score":{"first":1,"total":3,"right":1},"closedByPaw":false,"skipped":["swap (behind)","tapall (cap)"]}}

## Everything said and done

        🔊 "[sfx tap]" · "[sfx gong]" · "[sfx whoosh]"
0:00.0    > child taps: Start

0:00.0 ===== title =====
        🔊 "[sfx gong]" · "[sfx whoosh]" · "[sfx great]" · "[sfx jump]"
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.7 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.4 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:14.0 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:19.8 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:27.7 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.4 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:36.6 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.4 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:45.6 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
        🔊 "[sfx great]"
0:45.9    > child taps: kai

0:45.9 ===== choose =====
        🔊 "[sfx charge]"
0:46.0 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
        🔊 "[sfx powerup]" · "[sfx kiai]"
0:46.5    > child taps: kai
        🔊 "[sfx twinkle]"
0:47.2    > child taps: kai
0:47.8    > child taps: kai
0:48.4    > child taps: kai
0:49.0    > child taps: kai

0:49.6 ===== opt-in =====
0:50.0 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.2 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:55.1 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
0:59.7    > child taps: teddy
0:59.8 SENSEI: Not yet!  ‹fm_opt_echo_notyet›
        🔊 "[sfx twinkle]"
1:01.6 SENSEI: Then I've set up some listening games, just for you!  ‹fm_opt_ok_notyet›
        🔊 "[sfx place]" · "[sfx great]"
1:04.7 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:08.2 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:08.3 ===== dojo welcome =====
1:13.9    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:14.3 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:20.8 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:20.8    > child taps: Help
        🔊 "[sfx twinkle]"
1:23.4 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:29.0 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:29.0    > child taps: Hear it again
        🔊 "[sfx twinkle]"

1:31.7 ===== ? =====
1:32.3 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:32.3 ===== lesson 1 =====
1:35.5 SENSEI: This is the sun.  ‹fm_name_sun›
1:37.3 SENSEI: This is a sock.  ‹fm_name_sock›
1:38.5 SENSEI: This is a cat.  ‹fm_name_cat›
1:39.8 SENSEI: Let me show you!  ‹fm_show_me›
1:41.0 SENSEI: Tap the sun!  ‹fm_tap_sun›
        🔊 "[sfx tap]" · "[sfx good]" · "[sfx tink]"
1:42.5 SENSEI: Now you try!  ‹fm_you_try›
1:43.4 SENSEI: Tap the sock!  ‹fm_tap_sock›
        🔊 "[sfx good]"
1:47.5    > child taps: sock
        🔊 "[sfx tink]"
1:48.1 SENSEI: Watch me first!  ‹fm_show_me_2›
1:49.5 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
        🔊 "[sfx tap]" · "[sfx whoosh]"
1:51.5 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "[sfx tap]" · "sun" (slowly) · "[sfx tink]"
1:55.8 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
        🔊 "[sfx whoosh]"
1:59.2 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:03.6 SENSEI: Your turn! Tap the tortoise, and say it slowly with me.  ‹fm_tap_tortoise›
        🔊 "sun" (slowly)
2:10.2    > child taps: tortoise
        🔊 "[sfx tink]"
2:12.9 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "sun" (slowly)
2:17.8    > child taps: tortoise
        🔊 "[sfx tink]"
2:20.3 SENSEI: Now tap the rabbit, and say it fast!  ‹fm_tap_rabbit›
        🔊 "[sfx whoosh]" · "sun"
2:22.6    > child taps: rabbit
2:23.5 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
        🔊 "sun (held first sound)" (slowly) · "sock (held first sound)" (slowly)
2:28.1 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:33.3 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:37.2 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:39.1 SENSEI: This is the moon.  ‹fm_name_moon›
2:40.9 SENSEI: Let me show you!  ‹fm_show_me›
2:42.0 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/ · "[sfx tap]" · "[sfx good]" · "sun (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]"
2:47.0 SENSEI: Your turn!  ‹fm_you_try_2›
        🔊 "[sfx good]"
2:51.0    > child taps: sock
        🔊 "sock (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx good]"
2:55.5    > child taps: sausage
        🔊 "sausage (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx charge]" · "[sfx powerup]"
2:57.7 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 "[sfx spin]" · "[sfx land]" · "[sfx thwack]" · /s/ · "[sfx great]"
3:01.7 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:05.5 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:05.9 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:09.3 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]"
3:10.8 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx coin]"
3:15.8 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:18.5 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · "sun"
3:18.8    > child taps: sticker sun
        🔊 "[sfx twinkle]"
3:19.4    > child taps: sticker sun
        🔊 "sun" (slowly) · "[sfx pop]" · "sun" · "[sfx twinkle]"
3:20.1    > child taps: sticker sun
        🔊 "[sfx place]" · "[sfx twinkle]" · "sun" (slowly)
3:21.2 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
        🔊 "[sfx tap]"
3:21.3    > child taps: Next

3:21.9 ===== lesson 2 =====
3:22.1 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:24.3 SENSEI: This is a fish.  ‹fm_name_fish›
3:25.9 SENSEI: This is a dog.  ‹fm_name_dog›
3:26.9 SENSEI: Let me show you!  ‹fm_show_me›
3:28.0 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx pop]" · "[sfx twinkle]" · "[sfx petal]"
3:31.7 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
3:36.8 SENSEI: Start here, on this side!  ‹fm_l2_start›
3:36.8    > child taps: dog
        🔊 "fish"
3:40.3    > child taps: fish
        🔊 "dog"
3:44.2    > child taps: dog
3:44.9 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
        🔊 "[sfx pop]" · "[sfx magic]" · "[sfx petal]"
3:47.1 SENSEI: Watch me first!  ‹fm_show_me_2›
3:48.4 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx tap]" · "[sfx good]"
3:50.6 SENSEI: Now you try!  ‹fm_you_try›
        🔊 "[sfx twinkle]" · "[sfx petal]"
3:52.0 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
        🔊 "[sfx good]"
3:59.3    > child taps: rail 0
        🔊 "[sfx magic]"
3:59.8 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
        🔊 "[sfx petal]"
4:00.9 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
4:04.0 SENSEI: This is a flower.  ‹fm_name_flower›
4:05.4 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
        🔊 "[sfx tap]" · "[sfx tap]" · "[sfx charge]" · "[sfx pop]" · "[sfx magic]" · "[sfx sparkle]"
4:11.6 SENSEI: This is a star.  ‹fm_name_star›
4:13.5 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
        🔊 "star"
4:20.6    > child taps: tortoise
        🔊 "fish"
4:24.1    > child taps: rabbit
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx pop]" · "[sfx twinkle]"
4:25.4 SENSEI: Starfish!  ‹fm_starfish›
        🔊 "[sfx petal]" · "[sfx magic]" · "[sfx great]"
4:27.0 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]" · "[sfx charge]" · "[sfx powerup]"

4:30.9 ===== reward 2 =====
4:31.0 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx charge]" · "[sfx great]"
4:38.8 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
        🔊 "[sfx twinkle]"
4:42.0 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/ · "[sfx whoosh]"
4:50.1 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
4:56.0 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/ · "[sfx whoosh]"
4:59.8 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:00.2 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
5:02.7 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
