# The first five minutes (perfect child, opt-in: R)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.3 s | 45 s |  | over target |
| choose | 0:46.6 | 3.7 s | 6 s |  | within target |
| opt-in | 0:50.3 | 30.1 s | 28 s | 30 s | settled in 22.2 s |
| dojo welcome | 1:20.4 | 18.8 s | 12 s |  | over target |
| ? | 1:39.1 | 0.6 s |  |  |  |
| lesson 1 | 1:39.8 | 83.3 s | 85 s | 100 s | within target |
| reward 1 | 3:03.0 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:19.0 | 74.2 s | 60 s | 75 s | over target |
| reward 2 | 4:33.2 | 29.4 s | 26 s | 30 s | over target |
| map | 5:02.6 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 22.2 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:02.6** (target 4:34, cap 5:00).

After the session the save holds:

```json
{
 "schoolYear": "R",
 "band": "R",
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
   "at": 1790438653196,
   "text": "Chose \"Reception\": started at Reception (autumn term)"
  }
 ],
 "warmups": {
  "w1-wu1": {
   "first": 4,
   "total": 4
  },
  "w1-wu2": {
   "first": 5,
   "total": 5
  }
 }
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":14.5},{"i":4,"kind":"fastslow","at":29.9,"skipped":"behind"},{"i":5,"kind":"slowpick","at":29.9},{"i":6,"kind":"notice","at":40.2},{"i":7,"kind":"tapall","at":53.7},{"i":8,"kind":"done","at":79}],"result":{"key":"W1","version":"R","secs":83,"score":{"first":4,"total":4,"right":2},"closedByPaw":false,"skipped":["fastslow (behind)"]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":18.5,"skipped":"behind"},{"i":3,"kind":"which","at":18.5,"skipped":"demo"},{"i":4,"kind":"compound","at":27.2},{"i":5,"kind":"compound","at":37.3},{"i":6,"kind":"tapall","at":48.3},{"i":7,"kind":"done","at":70.9}],"result":{"key":"W2","version":"R","secs":74,"score":{"first":5,"total":5,"right":0},"closedByPaw":false,"skipped":["swap (behind)","which (demo)"]}}

## Everything said and done

        🔊 "[sfx tap]" · "[sfx gong]" · "[sfx whoosh]" · "[sfx gong]"
0:00.0    > child taps: Start

0:00.0 ===== title =====
        🔊 "[sfx whoosh]" · "[sfx great]" · "[sfx jump]"
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.8 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.5 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:14.0 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:20.1 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:28.2 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.9 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:37.1 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:41.9 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:46.1 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
        🔊 "[sfx great]" · "[sfx charge]"
0:46.6 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
0:46.6    > child taps: kai

0:46.6 ===== choose =====
        🔊 "[sfx powerup]" · "[sfx kiai]"
0:47.2    > child taps: kai
0:47.8    > child taps: kai
        🔊 "[sfx twinkle]"
0:48.4    > child taps: kai
0:49.0    > child taps: kai
0:49.7    > child taps: kai

0:50.3 ===== opt-in =====
0:50.7 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.9 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›
0:55.7 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
0:59.1 SENSEI: Big school!  ‹fm_opt_echo_school›
0:59.1    > child taps: school
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]"
1:01.3 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:02.4 SENSEI: Reception!  ‹fm_opt_rec›
1:03.7 SENSEI: Year One!  ‹fm_opt_y1›
1:05.1 SENSEI: Year Two!  ‹fm_opt_y2›
1:06.8 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
        🔊 "[sfx pop]"
1:10.6 SENSEI: Reception!  ‹fm_opt_rec›
1:10.6    > child taps: Reception
        🔊 "[sfx jump]" · "[sfx spin]"
1:12.5 SENSEI: I've set up the game for Reception, with sounds just like at school!  ‹fm_opt_ok_rec›
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx great]"
1:16.5 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:20.0 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:20.4 ===== dojo welcome =====
1:24.1    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:24.6 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:29.7 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:29.7    > child taps: Help
        🔊 "[sfx twinkle]"
1:32.3 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:36.5 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx twinkle]"
1:36.5    > child taps: Hear it again

1:39.1 ===== ? =====
1:39.7 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:39.8 ===== lesson 1 =====
1:42.9 SENSEI: This is the sun.  ‹fm_name_sun›
1:44.7 SENSEI: This is a sock.  ‹fm_name_sock›
1:45.9 SENSEI: This is a cat.  ‹fm_name_cat›
1:47.3 SENSEI: Let me show you!  ‹fm_show_me›
1:48.4 SENSEI: Tap the sun!  ‹fm_tap_sun›
        🔊 "[sfx tap]" · "[sfx good]" · "[sfx tink]"
1:49.9 SENSEI: Now you try!  ‹fm_you_try›
1:50.8 SENSEI: Tap the sock!  ‹fm_tap_sock›
        🔊 "[sfx good]"
1:53.6    > child taps: sock
        🔊 "[sfx tink]"
1:54.2 SENSEI: Watch me first!  ‹fm_show_me_2›
1:55.6 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
        🔊 "[sfx tap]" · "[sfx whoosh]"
1:57.6 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "[sfx tap]" · "sun" (slowly) · "[sfx tink]"
2:01.8 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
        🔊 "[sfx whoosh]"
2:05.2 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:10.0 SENSEI: Listen to my slow word...  ‹fm_slow_listen›
        🔊 "cat" (slowly)
2:14.6 SENSEI: Which picture is it?  ‹fm_which_pic›
        🔊 "[sfx good]" · "cat" (slowly)
2:17.4    > child taps: cat
        🔊 "[sfx twinkle]" · "[sfx petal]" · "cat"
2:20.1 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
        🔊 "sun (held first sound)" (slowly) · "sock (held first sound)" (slowly)
2:24.7 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:29.9 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:33.8 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:35.7 SENSEI: This is the moon.  ‹fm_name_moon›
2:37.5 SENSEI: Let me show you!  ‹fm_show_me›
2:38.6 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/ · "[sfx tap]" · "[sfx good]" · "sun (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]"
2:43.8 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 "[sfx magic]" · "[sfx twinkle]" · /s/
2:46.3 SENSEI: Your turn!  ‹fm_you_try_2›
        🔊 "[sfx good]"
2:48.8    > child taps: sock
        🔊 "sock (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx charge]" · "[sfx powerup]" · "[sfx good]"
2:52.6    > child taps: sausage
        🔊 "sausage (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]"
2:54.8 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 "[sfx spin]" · "[sfx land]" · "[sfx thwack]" · /s/ · "[sfx great]"
2:58.8 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:02.6 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:03.0 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:06.4 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]"
3:07.8 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx coin]"
3:12.8 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:15.5 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · "sun"
3:15.9    > child taps: sticker sun
        🔊 "[sfx twinkle]"
3:16.5    > child taps: sticker sun
        🔊 "sun" (slowly) · "[sfx pop]" · "sun"
3:17.1    > child taps: sticker sun
        🔊 "[sfx twinkle]" · "[sfx place]" · "[sfx twinkle]" · "sun" (slowly)
3:18.3 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
        🔊 "[sfx tap]"
3:18.4    > child taps: Next

3:19.0 ===== lesson 2 =====
3:19.2 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:21.4 SENSEI: This is a fish.  ‹fm_name_fish›
3:23.0 SENSEI: This is a dog.  ‹fm_name_dog›
3:24.0 SENSEI: Let me show you!  ‹fm_show_me›
3:25.1 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx pop]" · "[sfx magic]" · "[sfx petal]"
3:28.8 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
3:32.6    > child taps: fish
        🔊 "fish" · "dog"
3:35.2    > child taps: dog
3:35.9 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
        🔊 "[sfx pop]" · "[sfx twinkle]" · "[sfx petal]"
3:38.1 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
        🔊 "[sfx good]"
3:44.0    > child taps: rail 0
        🔊 "[sfx magic]"
3:44.6 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
3:45.9 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
3:49.0 SENSEI: This is a flower.  ‹fm_name_flower›
3:50.4 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
        🔊 "[sfx tap]" · "[sfx tap]" · "[sfx charge]" · "[sfx pop]" · "[sfx magic]" · "[sfx boom]"
3:56.6 SENSEI: This is a star.  ‹fm_name_star›
3:58.5 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
4:04.0    > child taps: rabbit
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx tink]" · "[sfx pop]" · "[sfx twinkle]"
4:05.4 SENSEI: Starfish!  ‹fm_starfish›
        🔊 "[sfx petal]" · "[sfx magic]" · "[sfx petal]"
4:07.4 SENSEI: This is a bag.  ‹fm_name_bag›
4:09.0 SENSEI: This is some jam.  ‹fm_name_jam›
4:10.9 SENSEI: Watch me first!  ‹fm_show_me_2›
4:12.2 SENSEI: Tap all the pictures with this sound in them...  ‹fm_tap_all_in›
        🔊 /a/ · "[sfx tap]" · "[sfx good]" · "cat" (slowly) · "[sfx place]" · "[sfx tink]"
4:17.0 SENSEI: Now you try!  ‹fm_you_try›
        🔊 "[sfx good]"
4:19.5    > child taps: bag
        🔊 "bag" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx good]"
4:22.1    > child taps: jam
        🔊 "jam" (slowly) · "[sfx tink]" · "[sfx place]"
4:23.3 SENSEI: You found them all!  ‹fm_found_all›
        🔊 "[sfx jump]" · "[sfx spin]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]"
4:24.8 SENSEI: They all have the sound...  ‹t_they_all_have›
        🔊 /a/
4:27.2 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 "[sfx magic]" · "[sfx twinkle]" · /a/ · "[sfx great]"
4:29.7 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]" · "[sfx charge]"

4:33.2 ===== reward 2 =====
        🔊 "[sfx powerup]"
4:33.7 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx land]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx charge]" · "[sfx great]"
4:41.4 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
        🔊 "[sfx twinkle]"
4:44.7 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/ · "[sfx whoosh]"
4:52.8 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
4:58.6 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/ · "[sfx whoosh]"
5:02.5 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:02.6 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
5:05.4 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
