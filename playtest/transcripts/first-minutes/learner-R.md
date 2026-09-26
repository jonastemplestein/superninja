# The first five minutes (learner child, opt-in: R)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.1 s | 45 s |  | over target |
| choose | 0:46.4 | 7.5 s | 6 s |  | over target |
| opt-in | 0:53.9 | 29.6 s | 28 s | 30 s | settled in 21.6 s |
| dojo welcome | 1:23.6 | 23.2 s | 12 s |  | over target |
| ? | 1:46.7 | 0.6 s |  |  |  |
| lesson 1 | 1:47.4 | 98.1 s | 85 s | 100 s | over target |
| reward 1 | 3:25.4 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:41.5 | 87.6 s | 60 s | 75 s | over the cap |
| reward 2 | 5:09.1 | 29.6 s | 26 s | 30 s | over target |
| map | 5:38.7 | 6.1 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 21.6 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:38.7** (target 4:34, cap 5:00).

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
   "at": 1790436961108,
   "text": "Chose \"Reception\": started at Reception (autumn term)"
  }
 ],
 "warmups": {
  "w1-wu1": {
   "first": 3,
   "total": 5
  },
  "w1-wu2": {
   "first": 3,
   "total": 6
  }
 }
}
```

## Beats in each lesson (lesson seconds; the governor's skips)

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.6},{"i":3,"kind":"fastslow","at":16},{"i":4,"kind":"fastslow","at":31.4,"skipped":"behind"},{"i":5,"kind":"slowpick","at":31.4},{"i":6,"kind":"notice","at":43.2},{"i":7,"kind":"tapall","at":56.7},{"i":8,"kind":"done","at":93.9}],"result":{"key":"W1","version":"R","secs":98,"score":{"first":3,"total":5,"right":2},"closedByPaw":false,"skipped":["fastslow (behind)"]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":24.7,"skipped":"behind"},{"i":3,"kind":"which","at":24.7,"skipped":"demo"},{"i":4,"kind":"compound","at":34.7},{"i":5,"kind":"compound","at":44.9},{"i":6,"kind":"tapall","at":57.6},{"i":7,"kind":"done","at":84.3}],"result":{"key":"W2","version":"R","secs":88,"score":{"first":3,"total":6,"right":0},"closedByPaw":true,"skipped":["swap (behind)","which (demo)"]}}

## Everything said and done


0:00.0 ===== title =====
0:00.1    > child taps: Start
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.8 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
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
0:47.0    > child taps: kai
0:47.7    > child taps: kai
0:48.3    > child taps: kai
0:48.9    > child taps: kai
0:49.5    > child taps: kai
0:50.6 SENSEI: Do you go to big school yet?  ‹fm_opt_q1›
0:52.7 SENSEI: Not yet? Tap the teddy!  ‹fm_opt_notyet›

0:53.9 ===== opt-in =====
0:55.6 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
1:00.6 SENSEI: Big school!  ‹fm_opt_echo_school›
1:00.6    > child taps: school
1:02.9 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:04.0 SENSEI: Reception!  ‹fm_opt_rec›
1:05.3 SENSEI: Year One!  ‹fm_opt_y1›
1:06.6 SENSEI: Year Two!  ‹fm_opt_y2›
1:08.3 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
1:13.7 SENSEI: Reception!  ‹fm_opt_rec›
1:13.7    > child taps: Reception
1:15.5 SENSEI: I've set up the game for Reception, with sounds just like at school!  ‹fm_opt_ok_rec›
1:19.5 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:23.1 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:23.6 ===== dojo welcome =====
1:28.7    > child taps: gong
1:29.2 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
1:35.7    > child taps: Help
1:35.8 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:38.4 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:44.0 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:44.0    > child taps: Hear it again

1:46.7 ===== ? =====
1:47.3 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:47.4 ===== lesson 1 =====
1:50.5 SENSEI: This is the sun.  ‹fm_name_sun›
1:52.3 SENSEI: This is a sock.  ‹fm_name_sock›
1:53.5 SENSEI: This is a cat.  ‹fm_name_cat›
1:54.9 SENSEI: Let me show you!  ‹fm_show_me›
1:56.0 SENSEI: Tap the sun!  ‹fm_tap_sun›
1:57.5 SENSEI: Now you try!  ‹fm_you_try›
1:58.4 SENSEI: Tap the sock!  ‹fm_tap_sock›
2:02.6    > child taps: sock
2:03.3 SENSEI: Watch me first!  ‹fm_show_me_2›
2:04.6 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
2:06.7 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "sun" (slowly)
2:10.9 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
2:14.3 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:19.1 SENSEI: Listen to my slow word...  ‹fm_slow_listen›
        🔊 "cat" (slowly)
2:23.7 SENSEI: Which picture is it?  ‹fm_which_pic›
        🔊 "cat" (slowly)
2:27.9    > child taps: cat
        🔊 "cat"
2:30.7 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
2:35.3 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:40.5 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:44.4 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:46.3 SENSEI: This is the moon.  ‹fm_name_moon›
2:48.1 SENSEI: Let me show you!  ‹fm_show_me›
2:49.2 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/
2:54.4 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 /s/
2:56.9 SENSEI: Your turn!  ‹fm_you_try_2›
        🔊 "cat" (slowly)
3:00.8    > child taps: cat
3:02.4 SENSEI: Cat starts with a different sound.  ‹fm_diff_cat›
3:05.0 SENSEI: Listen again.  ‹listen_again›
3:06.2 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/
3:10.5    > child taps: sock
3:15.0    > child taps: sausage
3:17.2 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 /s/
3:21.2 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
3:25.0 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›

3:25.4 ===== reward 1 =====
3:28.8 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
3:30.2 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
3:35.2 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:37.9 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "sun"
3:38.3    > child taps: sticker sun
3:39.0    > child taps: sticker sun
        🔊 "sun" (slowly) · "sun"
3:39.6    > child taps: sticker sun
        🔊 "sun" (slowly)
3:40.7 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
3:40.8    > child taps: Next

3:41.5 ===== lesson 2 =====
3:41.7 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:43.9 SENSEI: This is a fish.  ‹fm_name_fish›
3:45.4 SENSEI: This is a dog.  ‹fm_name_dog›
3:46.4 SENSEI: Let me show you!  ‹fm_show_me›
3:47.6 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
3:51.3 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
3:56.4    > child taps: fish
        🔊 "fish"
4:00.3    > child taps: fish
        🔊 "dog"
4:03.8    > child taps: dog
4:04.6 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
4:06.7 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
4:14.0    > child taps: rail 0
4:14.6 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
4:15.9 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
4:19.0 SENSEI: This is a flower.  ‹fm_name_flower›
4:20.4 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
4:26.7 SENSEI: This is a star.  ‹fm_name_star›
4:28.5 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
4:35.9    > child taps: rabbit
4:37.2 SENSEI: Starfish!  ‹fm_starfish›
4:39.2 SENSEI: This is a bag.  ‹fm_name_bag›
4:40.8 SENSEI: This is some jam.  ‹fm_name_jam›
4:42.6 SENSEI: Watch me first!  ‹fm_show_me_2›
4:44.0 SENSEI: Tap all the pictures with this sound in them...  ‹fm_tap_all_in›
        🔊 /a/ · "cat" (slowly)
4:48.8 SENSEI: Now you try!  ‹fm_you_try›
4:52.6    > child taps: dog
        🔊 "dog" (slowly)
4:53.8 SENSEI: Dog doesn't have that sound in it.  ‹fm_not_in_dog›
        🔊 "bag" (slowly)
4:57.4 SENSEI: Here's the last one!  ‹fm_last_one›
        🔊 "jam" (slowly)
5:00.6 SENSEI: They all have the sound...  ‹t_they_all_have›
        🔊 /a/
5:03.0 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 /a/
5:05.5 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›

5:09.1 ===== reward 2 =====
5:09.5 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
5:17.3 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
5:20.6 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/
5:28.7 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
5:34.6 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/
5:38.4 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:38.7 ===== map =====
5:41.3 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
