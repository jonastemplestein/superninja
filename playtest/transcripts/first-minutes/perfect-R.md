# The first five minutes (perfect child, opt-in: R)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.1 s | 45 s |  | over target |
| choose | 0:46.4 | 7.5 s | 6 s |  | over target |
| opt-in | 0:54.0 | 26.8 s | 28 s | 30 s | settled in 18.8 s |
| dojo welcome | 1:20.8 | 19.0 s | 12 s |  | over target |
| ? | 1:39.8 | 0.6 s |  |  |  |
| lesson 1 | 1:40.4 | 83.7 s | 85 s | 100 s | within target |
| reward 1 | 3:04.2 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:20.2 | 74.7 s | 60 s | 75 s | over target |
| reward 2 | 4:34.9 | 29.5 s | 26 s | 30 s | over target |
| map | 5:04.4 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 18.8 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:04.4** (target 4:34, cap 5:00).

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
   "at": 1790436960412,
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

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.6},{"i":3,"kind":"fastslow","at":14.6},{"i":4,"kind":"fastslow","at":30,"skipped":"behind"},{"i":5,"kind":"slowpick","at":30},{"i":6,"kind":"notice","at":40.4},{"i":7,"kind":"tapall","at":54},{"i":8,"kind":"done","at":79.5}],"result":{"key":"W1","version":"R","secs":83,"score":{"first":4,"total":4,"right":2},"closedByPaw":false,"skipped":["fastslow (behind)"]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":18.5,"skipped":"behind"},{"i":3,"kind":"which","at":18.5,"skipped":"demo"},{"i":4,"kind":"compound","at":27.2},{"i":5,"kind":"compound","at":37.4},{"i":6,"kind":"tapall","at":48.9},{"i":7,"kind":"done","at":71.5}],"result":{"key":"W2","version":"R","secs":75,"score":{"first":5,"total":5,"right":0},"closedByPaw":false,"skipped":["swap (behind)","which (demo)"]}}

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
0:46.4    > child taps: kai

0:46.4 ===== choose =====
0:46.5 SENSEI: Great choice! Let's rescue those sounds!  ‹chose›
0:47.1    > child taps: kai
0:47.7    > child taps: kai
0:48.3    > child taps: kai
0:48.9    > child taps: kai
0:49.5    > child taps: kai
0:50.6 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.8 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›

0:54.0 ===== opt-in =====
0:55.6 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
0:59.3 SENSEI: Big school!  ‹fm_opt_echo_school›
0:59.3    > child taps: school
1:01.5 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:02.6 SENSEI: Reception!  ‹fm_opt_rec›
1:03.9 SENSEI: Year One!  ‹fm_opt_y1›
1:05.3 SENSEI: Year Two!  ‹fm_opt_y2›
1:07.0 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
1:10.9 SENSEI: Reception!  ‹fm_opt_rec›
1:10.9    > child taps: Reception
1:12.8 SENSEI: I've set up the game for Reception, with sounds just like at school!  ‹fm_opt_ok_rec›
1:16.8 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:20.4 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:20.8 ===== dojo welcome =====
1:24.6    > child taps: gong
1:25.0 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
1:30.2 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:30.2    > child taps: Help
1:32.9 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:37.1 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:37.1    > child taps: Hear it again

1:39.8 ===== ? =====
1:40.4 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:40.4 ===== lesson 1 =====
1:43.6 SENSEI: This is the sun.  ‹fm_name_sun›
1:45.4 SENSEI: This is a sock.  ‹fm_name_sock›
1:46.6 SENSEI: This is a cat.  ‹fm_name_cat›
1:48.0 SENSEI: Let me show you!  ‹fm_show_me›
1:49.1 SENSEI: Tap the sun!  ‹fm_tap_sun›
1:50.6 SENSEI: Now you try!  ‹fm_you_try›
1:51.5 SENSEI: Tap the sock!  ‹fm_tap_sock›
1:54.4    > child taps: sock
1:55.0 SENSEI: Watch me first!  ‹fm_show_me_2›
1:56.3 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
1:58.4 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "sun" (slowly)
2:02.7 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
2:06.0 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:10.9 SENSEI: Listen to my slow word...  ‹fm_slow_listen›
        🔊 "cat" (slowly)
2:15.4 SENSEI: Which picture is it?  ‹fm_which_pic›
        🔊 "cat" (slowly)
2:18.3    > child taps: cat
        🔊 "cat"
2:21.0 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
2:25.6 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:30.8 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:34.7 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:36.7 SENSEI: This is the moon.  ‹fm_name_moon›
2:38.4 SENSEI: Let me show you!  ‹fm_show_me›
2:39.6 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/
2:44.7 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 /s/
2:47.3 SENSEI: Your turn!  ‹fm_you_try_2›
2:49.9    > child taps: sock
2:53.7    > child taps: sausage
2:55.9 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 /s/
2:59.9 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
3:03.7 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›

3:04.2 ===== reward 1 =====
3:07.5 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
3:08.9 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
3:13.9 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:16.7 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "sun"
3:17.1    > child taps: sticker sun
3:17.7    > child taps: sticker sun
        🔊 "sun" (slowly) · "sun"
3:18.3    > child taps: sticker sun
        🔊 "sun" (slowly)
3:19.5 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
3:19.6    > child taps: Next

3:20.2 ===== lesson 2 =====
3:20.4 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:22.6 SENSEI: This is a fish.  ‹fm_name_fish›
3:24.2 SENSEI: This is a dog.  ‹fm_name_dog›
3:25.2 SENSEI: Let me show you!  ‹fm_show_me›
3:26.3 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
3:30.0 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
        🔊 "fish"
3:33.8    > child taps: fish
        🔊 "dog"
3:36.4    > child taps: dog
3:37.1 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
3:39.3 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
3:45.3    > child taps: rail 0
3:45.8 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
3:47.2 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
3:50.2 SENSEI: This is a flower.  ‹fm_name_flower›
3:51.7 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
3:58.0 SENSEI: This is a star.  ‹fm_name_star›
3:59.8 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
4:05.8    > child taps: rabbit
4:07.2 SENSEI: Starfish!  ‹fm_starfish›
4:09.2 SENSEI: This is a bag.  ‹fm_name_bag›
4:10.8 SENSEI: This is some jam.  ‹fm_name_jam›
4:12.7 SENSEI: Watch me first!  ‹fm_show_me_2›
4:14.1 SENSEI: Tap all the pictures with this sound in them...  ‹fm_tap_all_in›
        🔊 /a/ · "cat" (slowly)
4:18.8 SENSEI: Now you try!  ‹fm_you_try›
4:21.3    > child taps: bag
        🔊 "bag" (slowly)
4:23.9    > child taps: jam
        🔊 "jam" (slowly)
4:25.1 SENSEI: You found them all!  ‹fm_found_all›
4:26.6 SENSEI: They all have the sound...  ‹t_they_all_have›
        🔊 /a/
4:28.9 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 /a/
4:31.4 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›

4:34.9 ===== reward 2 =====
4:35.4 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
4:43.2 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
4:46.5 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/
4:54.6 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
5:00.4 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/
5:04.3 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:04.4 ===== map =====
5:07.2 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
