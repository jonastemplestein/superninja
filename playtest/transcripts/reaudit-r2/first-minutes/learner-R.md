# The first five minutes (learner child, opt-in: R)

Game seconds from the title tap (played at 4× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.

| Piece | Starts | Took | Target | Hard cap | Verdict |
|---|---|---|---|---|---|
| title | 0:00.0 | 0.7 s | 3 s |  | within target |
| profiles | 0:00.7 | 0.6 s |  |  |  |
| intro film | 0:01.3 | 45.3 s | 45 s |  | over target |
| choose | 0:46.6 | 3.7 s | 6 s |  | within target |
| opt-in | 0:50.3 | 32.9 s | 28 s | 30 s | settled in 24.9 s |
| dojo welcome | 1:23.2 | 23.0 s | 12 s |  | over target |
| ? | 1:46.2 | 0.6 s |  |  |  |
| lesson 1 | 1:46.8 | 97.5 s | 85 s | 100 s | over target |
| reward 1 | 3:24.3 | 16.0 s | 21 s | 26 s | within target |
| lesson 2 | 3:40.3 | 87.4 s | 60 s | 75 s | over the cap |
| reward 2 | 5:07.7 | 29.4 s | 26 s | 30 s | over target |
| map | 5:37.1 | 6.0 s |  |  |  |

The opt-in's cap is 30 s from first sight to a settled choice: **settled after 24.9 s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).

**Title to the map: 5:37.1** (target 4:34, cap 5:00).

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
   "at": 1790438653808,
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

- **lesson 1**: {"beats":[{"i":0,"kind":"hello","at":0},{"i":1,"kind":"name","at":3.1},{"i":2,"kind":"tap","at":7.5},{"i":3,"kind":"fastslow","at":15.8},{"i":4,"kind":"fastslow","at":31.2,"skipped":"behind"},{"i":5,"kind":"slowpick","at":31.2},{"i":6,"kind":"notice","at":42.9},{"i":7,"kind":"tapall","at":56.3},{"i":8,"kind":"done","at":93.3}],"result":{"key":"W1","version":"R","secs":97,"score":{"first":3,"total":5,"right":2},"closedByPaw":false,"skipped":["fastslow (behind)"]}}
- **lesson 2**: {"beats":[{"i":0,"kind":"rail","at":0},{"i":1,"kind":"rail","at":9.5},{"i":2,"kind":"swap","at":24.7,"skipped":"behind"},{"i":3,"kind":"which","at":24.7,"skipped":"demo"},{"i":4,"kind":"compound","at":34.7},{"i":5,"kind":"compound","at":44.9},{"i":6,"kind":"tapall","at":57.5},{"i":7,"kind":"done","at":84.2}],"result":{"key":"W2","version":"R","secs":88,"score":{"first":3,"total":6,"right":0},"closedByPaw":true,"skipped":["swap (behind)","which (demo)"]}}

## Everything said and done

        🔊 "[sfx tap]" · "[sfx gong]"
0:00.0    > child taps: Start

0:00.0 ===== title =====
        🔊 "[sfx whoosh]" · "[sfx gong]" · "[sfx whoosh]" · "[sfx great]" · "[sfx jump]"
0:00.7    > child taps: player Ninja

0:00.7 ===== profiles =====

0:01.3 ===== intro film =====
0:01.8 SENSEI: Long ago, on the Island of Sounds, there grew a magic World Flower.  ‹film_1›
0:07.5 SENSEI: Every petal was a sound. With sounds, we could talk, and read, and sing!  ‹film_2›
0:13.9 SENSEI: Words, words, WORDS! How I HATE them!  ‹film_3›
0:20.1 SENSEI: I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!  ‹film_4›
0:28.1 SENSEI: Oh no! The petals blew away, all over the island!  ‹film_5›
0:32.9 SENSEI: The World Flower has gone dark. Now nobody can read!  ‹film_6›
0:37.1 SENSEI: We need a hero. We need... a Super Ninja!  ‹film_7›
0:42.1 SENSEI: Win back every petal, one sound at a time!  ‹film_8›
0:46.4 SENSEI: I am Sensei Maple. I will train you. Now, choose your ninja!  ‹intro_8›
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
0:55.8 SENSEI: Yes? Tap the school!  ‹fm_opt_yes›
        🔊 "[sfx pop]"
1:00.5 SENSEI: Big school!  ‹fm_opt_echo_school›
1:00.5    > child taps: school
        🔊 "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]"
1:02.7 SENSEI: Which class are you in?  ‹fm_opt_q2›
1:03.8 SENSEI: Reception!  ‹fm_opt_rec›
1:05.2 SENSEI: Year One!  ‹fm_opt_y1›
1:06.5 SENSEI: Year Two!  ‹fm_opt_y2›
1:08.2 SENSEI: Not sure? Tap the cloud!  ‹fm_opt_unsure›
        🔊 "[sfx pop]"
1:13.4 SENSEI: Reception!  ‹fm_opt_rec›
1:13.4    > child taps: Reception
        🔊 "[sfx jump]" · "[sfx spin]"
1:15.3 SENSEI: I've set up the game for Reception, with sounds just like at school!  ‹fm_opt_ok_rec›
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx land]" · "[sfx tink]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx place]" · "[sfx great]"
1:19.3 SENSEI: Your grown-ups can change this later, in the grown-ups' settings.  ‹fm_opt_grownups›
1:22.8 SENSEI: Ninja training! First, tap the big gong!  ‹tut_1›

1:23.2 ===== dojo welcome =====
1:28.3    > child taps: gong
        🔊 "[sfx kick]" · "[sfx thwack]" · "[sfx gong]"
1:28.8 SENSEI: Stuck? Tap me, down here in the corner. Try it now!  ‹fm_help_short›
        🔊 "[sfx hmm]" · "[sfx tap]" · "[sfx great]"
1:35.3 SENSEI: That's it! I'm always here to help.  ‹fm_help_ok›
1:35.3    > child taps: Help
        🔊 "[sfx twinkle]"
1:37.9 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
        🔊 "[sfx tap]" · "[sfx good]"
1:43.5 SENSEI: And when you tap the speaker, I'll say it again!  ‹fm_speaker›
1:43.5    > child taps: Hear it again
        🔊 "[sfx twinkle]"

1:46.2 ===== ? =====
1:46.8 SENSEI: Ninja ears on! Let's listen to some words.  ‹fm_l1_hello›

1:46.8 ===== lesson 1 =====
1:50.0 SENSEI: This is the sun.  ‹fm_name_sun›
1:51.7 SENSEI: This is a sock.  ‹fm_name_sock›
1:53.0 SENSEI: This is a cat.  ‹fm_name_cat›
1:54.3 SENSEI: Let me show you!  ‹fm_show_me›
1:55.4 SENSEI: Tap the sun!  ‹fm_tap_sun›
        🔊 "[sfx tap]" · "[sfx good]" · "[sfx tink]"
1:56.9 SENSEI: Now you try!  ‹fm_you_try›
1:57.9 SENSEI: Tap the sock!  ‹fm_tap_sock›
        🔊 "[sfx good]"
2:02.0    > child taps: sock
        🔊 "[sfx tink]"
2:02.6 SENSEI: Watch me first!  ‹fm_show_me_2›
2:04.0 SENSEI: I can say a word fast. Sun!  ‹fm_fast_sun›
        🔊 "[sfx tap]" · "[sfx whoosh]"
2:06.0 SENSEI: Or I can say it slowly...  ‹fm_slow›
        🔊 "[sfx tap]" · "sun" (slowly) · "[sfx tink]"
2:10.3 SENSEI: Fast or slow, it's the same word. Sun!  ‹fm_same_word›
        🔊 "[sfx whoosh]"
2:13.6 SENSEI: Slowly, I hear its sounds. Words are made of sounds!  ‹fm_hear_sounds_short›
2:18.4 SENSEI: Listen to my slow word...  ‹fm_slow_listen›
        🔊 "cat" (slowly)
2:23.0 SENSEI: Which picture is it?  ‹fm_which_pic›
        🔊 "[sfx good]" · "cat" (slowly)
2:27.1    > child taps: cat
        🔊 "[sfx magic]" · "[sfx petal]" · "cat"
2:29.8 SENSEI: Listen to the very first sound.  ‹fm_first_listen›
        🔊 "sun (held first sound)" (slowly) · "sock (held first sound)" (slowly)
2:34.4 SENSEI: Did you notice? Sun and sock start with the same sound...  ‹fm_notice_sun_sock›
        🔊 /s/
2:39.6 SENSEI: Say that sound with me!  ‹t_everyone_say›
        🔊 /s/
2:43.5 SENSEI: This is a sausage.  ‹fm_name_sausage›
2:45.4 SENSEI: This is the moon.  ‹fm_name_moon›
2:47.2 SENSEI: Let me show you!  ‹fm_show_me›
2:48.3 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/ · "[sfx tap]" · "[sfx good]" · "sun (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]"
2:53.5 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 "[sfx magic]" · "[sfx twinkle]" · /s/
2:56.0 SENSEI: Your turn!  ‹fm_you_try_2›
        🔊 "[sfx wrong]" · "cat" (slowly)
2:59.7    > child taps: cat
        🔊 "[sfx hmm]"
3:01.3 SENSEI: Cat starts with a different sound.  ‹fm_diff_cat›
3:04.0 SENSEI: Listen again.  ‹listen_again›
3:05.1 SENSEI: Tap all the pictures that start with...  ‹fm_tap_all_start›
        🔊 /s/ · "[sfx good]"
3:09.4    > child taps: sock
        🔊 "sock (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx good]"
3:13.9    > child taps: sausage
        🔊 "sausage (held first sound)" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx charge]"
3:16.1 SENSEI: You found them both! They both start with...  ‹fm_found_both›
        🔊 "[sfx magic]" · "[sfx sparkle]" · /s/ · "[sfx great]"
3:20.1 SENSEI: You can hear the sounds in words. Brilliant listening!  ‹fm_l1_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]"
3:23.9 SENSEI: Look! Your pictures are turning into stickers!  ‹fm_rw_look›
        🔊 "[sfx twinkle]"

3:24.3 ===== reward 1 =====
        🔊 "[sfx twinkle]" · "[sfx whoosh]" · "[sfx bounce]"
3:27.6 SENSEI: This is your Sticker Book!  ‹fm_rw_book›
        🔊 "[sfx pop]" · "[sfx charge]" · "[sfx powerup]"
3:29.1 SENSEI: Sun, sock, cat, sausage and moon!  ‹fm_rw1_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx coin]"
3:34.1 SENSEI: Every picture you play with becomes a sticker!  ‹fm_rw_every›
3:36.8 SENSEI: Tap a sticker!  ‹fm_rw_tap›
        🔊 "[sfx pop]" · "sun"
3:37.2    > child taps: sticker sun
        🔊 "[sfx twinkle]"
3:37.8    > child taps: sticker sun
        🔊 "sun" (slowly) · "[sfx pop]" · "sun"
3:38.4    > child taps: sticker sun
        🔊 "[sfx twinkle]" · "[sfx place]" · "[sfx twinkle]" · "sun" (slowly)
3:39.6 SENSEI: Ready for the next game? Tap the big arrow!  ‹fm_rw_next›
        🔊 "[sfx tap]"
3:39.7    > child taps: Next

3:40.3 ===== lesson 2 =====
3:40.5 SENSEI: Ninjas read this way!  ‹fm_l2_way›
3:42.7 SENSEI: This is a fish.  ‹fm_name_fish›
3:44.2 SENSEI: This is a dog.  ‹fm_name_dog›
3:45.3 SENSEI: Let me show you!  ‹fm_show_me›
3:46.4 SENSEI: Fish... dog. Fish dog!  ‹fm_read_fish_dog›
        🔊 "[sfx pop]" · "[sfx twinkle]" · "[sfx petal]"
3:50.1 SENSEI: Your turn! Tap them the ninja way.  ‹fm_l2_turn›
        🔊 "fish"
3:55.3    > child taps: fish
3:59.1    > child taps: fish
        🔊 "dog"
4:02.6    > child taps: dog
4:03.4 SENSEI: Fish dog!  ‹fm_pair_fish_dog›
        🔊 "[sfx pop]" · "[sfx magic]" · "[sfx petal]"
4:05.5 SENSEI: Listen. Cat... dog. Which one did I read?  ‹fm_which_cat_dog›
        🔊 "[sfx good]"
4:12.8    > child taps: rail 0
        🔊 "[sfx twinkle]"
4:13.4 SENSEI: Cat dog!  ‹fm_pair_cat_dog›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
4:14.7 SENSEI: Two little words can make one big word!  ‹fm_l2_big_word›
4:17.8 SENSEI: This is a flower.  ‹fm_name_flower›
4:19.2 SENSEI: Say them slowly: sun... flower. Say them fast: sunflower!  ‹fm_sunflower›
        🔊 "[sfx tap]" · "[sfx tap]" · "[sfx charge]" · "[sfx pop]" · "[sfx magic]" · "[sfx sparkle]"
4:25.4 SENSEI: This is a star.  ‹fm_name_star›
4:27.3 SENSEI: Star... fish. Tap the rabbit to say them fast!  ‹fm_starfish_q›
4:34.6    > child taps: rabbit
        🔊 "[sfx shuriken]" · "[sfx shuriken]" · "[sfx tink]" · "[sfx tink]" · "[sfx pop]" · "[sfx magic]"
4:35.9 SENSEI: Starfish!  ‹fm_starfish›
        🔊 "[sfx petal]" · "[sfx twinkle]" · "[sfx petal]"
4:37.9 SENSEI: This is a bag.  ‹fm_name_bag›
4:39.5 SENSEI: This is some jam.  ‹fm_name_jam›
4:41.4 SENSEI: Watch me first!  ‹fm_show_me_2›
4:42.7 SENSEI: Tap all the pictures with this sound in them...  ‹fm_tap_all_in›
        🔊 /a/ · "[sfx tap]" · "[sfx good]" · "cat" (slowly) · "[sfx tink]" · "[sfx place]"
4:47.5 SENSEI: Now you try!  ‹fm_you_try›
        🔊 "[sfx wrong]" · "[sfx fizzle]" · "dog" (slowly)
4:51.3    > child taps: dog
        🔊 "[sfx hmm]"
4:52.4 SENSEI: Dog doesn't have that sound in it.  ‹fm_not_in_dog›
        🔊 "[sfx tap]" · "[sfx good]" · "bag" (slowly) · "[sfx tink]" · "[sfx place]"
4:56.1 SENSEI: Here's the last one!  ‹fm_last_one›
        🔊 "[sfx tap]" · "[sfx good]" · "jam" (slowly) · "[sfx tink]" · "[sfx place]" · "[sfx charge]"
4:59.3 SENSEI: They all have the sound...  ‹t_they_all_have›
        🔊 "[sfx magic]" · "[sfx sparkle]" · /a/
5:01.7 SENSEI: This is how we spell...  ‹how_we_spell›
        🔊 "[sfx magic]" · "[sfx twinkle]" · /a/ · "[sfx great]"
5:04.2 SENSEI: You read the pictures, just like a real reader!  ‹fm_l2_done›
        🔊 "[sfx charge]" · "[sfx jump]" · "[sfx spin]" · "[sfx boom]" · "[sfx great]" · "[sfx twinkle]" · "[sfx twinkle]" · "[sfx gong]" · "[sfx charge]"

5:07.7 ===== reward 2 =====
        🔊 "[sfx powerup]"
5:08.2 SENSEI: Fish, dog, flower, sunflower, star and starfish!  ‹fm_rw2_list›
        🔊 "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx place]" · "[sfx twinkle]" · "[sfx place]" · "[sfx jump]" · "[sfx twinkle]" · "[sfx thwack]" · "[sfx land]" · "[sfx charge]" · "[sfx great]"
5:15.9 SENSEI: Ooh, a shiny sticker! Fish dog!  ‹fm_rw_shiny›
        🔊 "[sfx twinkle]"
5:19.2 SENSEI: Sun, sock, sausage and sunflower. They all start with...  ‹fm_rw2_s›
        🔊 /s/ · "[sfx whoosh]"
5:27.3 SENSEI: You found your very first sound! Look, its petal is shining through the mist.  ‹fm_rw2_petal›
        🔊 "[sfx petal]" · "[sfx charge]" · "[sfx powerup]"
5:33.1 SENSEI: This petal is for the sound...  ‹audit_petal_means›
        🔊 /s/ · "[sfx whoosh]"
5:37.0 SENSEI: Your Sticker Book lives here, on the map!  ‹fm_rw2_map›

5:37.1 ===== map =====
        🔊 "[sfx petal]" · "[sfx jump]"
5:39.8 SENSEI: Tap the glowing stone to start your next adventure.  ‹map_hint›
