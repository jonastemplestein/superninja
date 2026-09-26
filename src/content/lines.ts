// Every spoken line (besides pure sounds and single words). Generated to /a/l/<id>.mp3.
// Speakers: "sensei" (warm British teacher narrator) and "baron" (the villain: sinister, never gory).

export type Speaker = "sensei" | "baron";
export interface Line { id: string; text: string; who?: Speaker }

const s = (id: string, text: string): Line => ({ id, text, who: "sensei" });
const b = (id: string, text: string): Line => ({ id, text, who: "baron" });

import { TEACH_LINES } from "./teach-lines.gen";

export const LINES: Line[] = [
  // --- Title & intro
  s("tap_start", "Tap to start!"),
  s("turn_phone", "Oops! Turn your phone sideways, like this!"),
  // the opening film, one line per shot (src/scenes/IntroFilm.tsx, docs/INTRO_STORYBOARD.md)
  s("film_1", "Long ago, on the Island of Sounds, there grew a magic World Flower."),
  s("film_2", "Every petal was a sound. With sounds, we could talk, and read, and sing!"),
  b("film_3", "Words, words, WORDS! How I HATE them!"),
  b("film_4", "I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!"),
  s("film_5", "Oh no! The petals blew away, all over the island!"),
  s("film_6", "The World Flower has gone dark. Now nobody can read!"),
  s("film_7", "We need a hero. We need... a Super Ninja!"),
  s("film_8", "Win back every petal, one sound at a time!"),
  s("intro_8", "I am Sensei Maple. I will train you. Now, choose your ninja!"),
  s("chose", "Great choice! Let's rescue those sounds!"),
  s("welcome_back", "Welcome back, Super Ninja! Ready for more training?"),

  // --- Map
  s("map_hint", "Tap the glowing stone to start your next adventure."),
  s("map_locked", "Not yet! Play the big gold stone first."),
  s("map_tree", "This is the World Flower!"),
  s("tree_tap", "Tap a petal, and listen!"),
  s("world_1", "Welcome to Bamboo Village!"),
  s("world_2", "Welcome to Blossom Hills!"),
  s("world_3", "Welcome to the Misty Mountains! Brrr!"),
  s("world_4", "Welcome to Dragon River!"),
  s("world_5", "Welcome to Shadow Castle. Don't worry, I'm right beside you."),
  s("world_6", "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!"),

  // --- Praise
  s("yay_1", "Brilliant!"), s("yay_2", "Super!"), s("yay_3", "Fantastic!"), s("yay_4", "Well done!"),
  s("yay_5", "Amazing!"), s("yay_6", "Ninja power!"), s("yay_7", "You did it!"), s("yay_8", "Wow, great listening!"),
  s("yay_9", "Smashing!"), s("yay_10", "Ace!"),
  s("well_read", "Well read!"), s("well_spelt", "Well spelt!"),
  s("streak_3", "Ninja power!"),
  s("streak_6", "Wow! Super ninja streak!"),
  s("streak_10", "Amazing! You're a ninja master!"),
  s("streak_lost", "Keep going, ninja!"),

  // --- Correction language (always specific, composed with sound/word clips)
  s("thats", "That's..."),
  s("we_need", "We need..."),
  s("that_says", "That's..."),
  s("listen", "Listen..."),
  s("listen_again", "Listen again."),
  s("nearly", "Nearly! Let's try that one again."),
  s("not_quite", "Ooh, not quite. Have another go."),
  s("say_sounds", "Say the sounds..."),
  s("read_word", "Now read the word."),
  s("its", "It's..."),
  s("this_is", "This is..."),
  s("which_sound", "Which sound comes next?"),
  s("two_letters_one_sound", "Two letters, one sound!"),
  s("same_sound_diff", "Same sound, different spellings!"),
  s("same_sound_new", "Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling."),
  s("same_sound_spelling", "Yes, that's a spelling of that sound too! But in this word, we spell it like this..."),
  s("stays_same", "That sound stays the same."),

  // --- Dojo (learning new sounds + word building)
  s("dojo_hello", "This is the dojo. A dojo is where ninjas practise! Let's practise some sounds."),
  s("dojo_tap_say", "Tap it, and say it with me!"),
  s("dojo_find", "Can you find..."),
  s("dojo_build", "Now let's make words! First, listen to the word. Then tap its sounds, one at a time."),
  s("dojo_build_word", "Build the word..."),
  s("dojo_done", "Well done! You practised so hard!"),
  s("dojo_longer", "Longer words today! Some sounds sit very close together. Listen for every one."),
  s("challenge_start", "Practice time with Sensei! Let's try the sounds you found tricky. You can do it!"),

  // --- Battle
  s("battle_start", "Uh oh! One of Baron Muddle's monsters is in the way! Spell the words to zap it!"),
  s("battle_spell", "Spell..."),
  s("battle_boss", "A big boss monster! Listen carefully, and spell your best!"),
  s("battle_charge", "Watch out, it's charging up!"),
  s("timer_intro_1", "This is a gem battle! See this purple bar? It fills up slowly."),
  s("timer_intro_2", "Spell each word before the bar is full, or the monster jumps!"),
  s("timer_intro_3", "Don't worry. If you run out of hearts, I'll help you. Ready? Let's go!"),
  s("battle_win", "Hooray! The monster ran away!"),
  s("battle_boss_win", "You beat the boss! What a ninja!"),
  s("battle_oops", "Oof! You ran out of hearts. Don't worry, I'll help. Let's try again!"),
  s("battle_hint", "Here's a clue. Listen to the sounds."),

  // --- Run
  s("run_start", "Ninja Run! Tap to jump, and catch the right word!"),
  s("run_catch", "Catch the word..."),
  s("run_blend", "Listen to the sounds. What word do they make?"),
  s("run_end", "Bong! You made it to the gong!"),
  s("run_read", "Read the word, and catch the matching picture!"),

  // --- Swap
  s("swap_start", "Baron Muddle has mixed up these words! Can you fix them? Change one sound at a time."),
  s("swap_make", "Change it to make..."),
  s("swap_which", "Which sound needs to change?"),
  s("swap_pick", "Now pick the new sound."),
  s("swap_done", "You fixed them all!"),

  // --- Sort (same sound, different spellings)
  s("sort_done", "Sorted! What a clever ninja."),

  // --- Story
  s("story_start", "Story time! I'll read, and you read too."),
  s("story_your_turn", "Your turn to read! Tap a word if you need help."),
  s("story_question", "Let's think about the story..."),
  s("story_end", "The end! What a story!"),
  s("story_tap_help", "Tap any word and I'll help you read it."),

  // --- Rewards & session
  s("petal_got", "You won back a sound!"),
  s("petals_got", "You won back some sounds!"),
  s("world_done", "You found every sound in this land! Let's go to the next one!"),
  s("break_time", "Great ninja training today! Now, go and read a book with a grown-up."),
  s("finale", "You did it, Super Ninja! Every petal is back on the World Flower. The whole island can read and spell again!"),

  // --- World Flower & gems
  s("flower_intro", "This is the World Flower! Every petal is a sound. The gems inside are all the different ways to spell it."),
  s("flower_i1", "This is the World Flower. Baron Muddle blew all its petals away!"),
  s("flower_i2", "Every petal is one sound. Listen! This is the petal for the sound..."),
  s("flower_i4", "When you play and get it right, a gem fills up with ninja power."),
  s("flower_i5", "When a gem is full, it glows. Then you can win it in a gem battle!"),
  s("flower_i6", "Win all the gems in a petal, and the petal flies back onto the World Flower!"),
  s("flower_tap", "Tap a petal to see its gems."),
  s("gem_ready", "A gem is glowing! It's ready for a gem battle."),
  s("gem_charging", "This gem is filling up. Keep playing to fill it!"),
  s("gem_hidden", "This gem is still a secret. You'll find it later!"),
  s("gem_future", "This gem is far, far away. We'll find it one day!"),
  s("petal_secret", "This sound is still a secret. You'll find it on your adventure!"),
  s("trial_start", "Gem battle! Spell the words to win the gem!"),
  s("trial_win", "You won the gem! It's going into its petal!"),
  s("trial_fail", "So close! Keep playing, and try again soon!"),
  s("petal_complete", "All the gems are in! The petal flies back onto the World Flower!"),
  s("flower_complete", "The World Flower is glowing again! You are a true Super Ninja!"),

  // --- Sticker Book
  s("book_missing", "This sticker is still out on your adventure. Keep playing to find it!"),
  s("help_players", "Tap your picture to play. New ninja? Tap the big plus!"),
  s("help_name", "Ask a grown-up to help you type your name, then tap the green tick."),
  s("help_book", "Tap a sticker to hear its word. Tap the arrows to turn the pages."),

  // --- Early learning (docs/PEDAGOGY.md): watch me, together, your turn
  s("ido", "Watch me first!"),
  s("wedo", "Let's do it together!"),
  s("youdo", "Now it's your turn!"),
  s("this_is_a", "This is a..."),
  s("this_is_an", "This is an..."),
  s("i_can_hear", "I can hear..."),
  s("listen_intro", "Let's play a listening game! Listen carefully, then tap the right picture."),
  s("listen_tap", "Tap the..."),
  s("listen_slow", "Now I'll say it slowly. Tap the..."),
  s("listen_sounds", "Now I'll say it in sounds. Can you hear the word? Tap the..."),
  s("first_intro", "Every word starts with a sound. Let's listen for the very first sound!"),
  s("first_q", "Which one starts with..."),
  s("starts_with", "starts with..."),
  s("how_we_spell", "This is how we spell..."),
  s("hunt_intro", "Now let's listen for a sound in the middle of a word!"),
  s("hunt_q", "Which one has this sound in it?"),
  s("has_in_middle", "has this sound in the middle..."),
  s("find_q", "Find this sound..."),
  s("like_in", "like in..."),
  s("build_ido_1", "I say the word..."),
  s("build_ido_2", "I say it slowly..."),
  s("build_ido_3", "Now I find each sound, one at a time."),
  s("first_sound_q", "What's the first sound?"),
  s("next_sound_q", "What's the next sound?"),
  s("last_sound_q", "What's the last sound?"),
  s("listen_here", "Listen again... What do you hear here?"),
  s("its_this_one", "It's this one! Say it as you put it here."),
  s("say_sounds_read", "Say the sounds... and read the word!"),

  // ---- Teacher language for sounds and spellings (src/content/teach.ts). Wording follows the official Sounds~Write
  // scripts (assets-src/sw-sources/research/sections/teacher-language.md): spellings "spell" sounds, never "say" or "make"
  // them; no letter names, no "magic e", no rules. Each clip is a short phrase that joins with a pure sound or a word clip.
  // sounds (petals)
  s("t_this_is_sound", "This is the sound..."),
  s("t_petal_is", "This petal is the sound..."),
  s("t_listen_can_you_hear", "Listen. Can you hear..."),
  s("t_in_these_words", "...in these words?"),
  s("t_you_can_hear_it_in", "You can hear it in..."),
  s("t_and", "...and..."),
  s("t_they_all_have", "They all have the sound..."),
  s("t_now_you_say_it", "Now you say it!"),
  s("t_everyone_say", "Say that sound with me!"),
  // spellings (gems)
  s("t_way_we_spell", "This is the way we spell..."),
  s("t_in", "...in..."),
  s("t_like_in", "...like in..."),
  s("t_spelling_of", "This is a spelling of the sound..."),
  s("t_another_way", "This is another way to spell the sound..."),
  s("t_we_see_it_in", "We see this spelling in..."),
  s("t_two_letters", "It's two letters, but it's one sound."),
  s("t_three_letters", "It's three letters, but it's just one sound."),
  s("t_four_letters", "It's four letters, but it's just one sound."),
  s("t_one_spelling_two_sounds", "This spelling is two sounds together!"),
  s("t_often_end_short", "We often spell it like this at the end of short words."),
  s("t_ways_2", "Now you know two ways to spell..."),
  s("t_ways_3", "Now you know three ways to spell..."),
  s("t_ways_4", "Now you know four ways to spell..."),
  s("t_ways_5", "Now you know five ways to spell..."),
  s("t_ways_6", "Now you know six ways to spell..."),
  s("t_ways_7", "Now you know seven ways to spell..."),
  s("t_ways_8", "Now you know eight ways to spell..."),
  s("t_ways_9", "Now you know nine ways to spell..."),
  s("t_ways_10", "Now you know ten ways to spell..."),
  s("t_diff_spellings_of", "Different spellings of..."),
  s("t_same_sound", "...but it's the same sound!"),
  // one spelling, different sounds (Extended Code)
  s("t_this_can_be", "This can be..."),
  s("t_but_in_this_word", "...but in this word, it's..."),
  s("t_same_spelling_sometimes", "The same spelling can sometimes be..."),
  s("t_and_sometimes", "...and sometimes..."),
  // reading and checking
  s("t_say", "Say..."),
  s("t_here", "...here."),
  s("t_say_it_here", "Say it here!"),
  s("t_listen_for_word", "Say the sounds, and listen for the word."),
  s("t_if_you_say_sounds", "If you say the sounds, you can hear the word!"),
  s("t_in_this_word_this_is", "In this word, this is..."),
  s("t_does_it_have", "Does this word have..."),
  s("t_or", "...or..."),
  // coming back to the World Flower
  s("t_visit", "Let's visit the World Flower!"),
  s("t_look_growing", "Look how your World Flower is growing!"),
  s("t_remember_this", "Do you remember this one?"),
  s("t_lets_remember", "Let's remember the ways to spell..."),
  s("t_new_gem_here", "Your new gem goes right here!"),
  s("t_practise_invite", "Shall we practise this in the dojo?"),
  s("t_words_you_found", "Here are the words you found with this sound. Tap one to hear it!"),
  s("two_sounds", "This word has two sounds!"),
  s("three_sounds", "This word has three sounds!"),
  s("read_intro", "Who read it right? Listen to Kai and Suki!"),
  s("read_tap_sounds", "Tap each sound, and say it."),
  s("read_who", "Who read it right?"),
  s("kai_says", "Kai says..."),
  s("suki_says", "Suki says..."),
  s("if_it_was", "If it was..."),
  s("this_would_be", "this would be..."),
  s("is_it_no", "Is it? No! It's..."),
  s("again_practise", "Let's practise that one again!"),
  s("i_am_ninja", "I am a ninja!"),
  s("dojo_nap", "Wow, you've practised so much! Ninjas need rest too. Shall we have a little break?"),
  s("what_changed", "What changed? Listen here."),

  // --- Jump ahead
  s("jump_offer", "Wow! You got everything right. Is this too easy? You can jump ahead!"),
  s("jump_pick", "How far shall we jump? Ask a grown-up to help you choose."),
  s("jump_done", "Whoosh! Off we go!"),

  // --- Placement ("Show Sensei")
  s("place_ask", "Do you know some sounds already? Tap the little seed if you're just starting. Tap the star to show me what you know!"),
  s("place_intro", "Let's see what you know! Just have a go."),
  s("place_tap", "Which one is..."),
  s("place_sound", "Which is the spelling of this sound?"),
  s("place_spell", "Can you spell..."),
  s("place_gap", "Which spelling of"),
  s("place_gap_in", "is in the word..."),
  s("place_findall", "Tap every picture that has this sound."),
  s("place_done", "Wow! Now I know just where to start your adventure. Let's go!"),
  s("place_new", "Hooray! We'll start right at the beginning."),

  // --- Help button (Sensei in the corner): what to do on each screen, then bigger clues
  s("help_start", "Tap the big green button to start!"),
  s("help_choose", "Tap the ninja you want to be!"),
  s("help_map", "Tap the big, gold, bouncing stone to play!"),
  s("help_next", "Tap the green arrow to carry on!"),
  s("help_tiles", "Tap the sound tiles, one sound at a time."),
  s("help_look", "Look! I'll show you."),
  s("help_run", "Tap anywhere to jump. Tap a lantern to catch it!"),
  s("help_swap_pos", "First, tap the sound that changes."),
  s("help_swap_new", "Now tap the new sound."),
  s("help_sort", "Tap the chest with the same spelling as the word."),
  s("help_read", "Read each word, then tap the green tick."),
  s("help_story", "Tap the green arrow to turn the page."),
  s("help_question", "Tap the right picture!"),
  s("help_flower", "Tap a petal to see its gems. A bouncing gem is ready for a gem battle!"),
  s("help_listen", "Listen carefully. Tap the speaker to hear it again."),

  // --- Ninja Training (tutorial)
  s("tut_1", "Ninja training! First, tap the big gong!"),
  s("tut_good", "Great tapping!"),
  s("tut_help", "Whenever you're stuck, tap me! I'm always here in the corner, and I'll tell you what to do. Try it now. Tap me!"),
  s("tut_help_ok", "That's it! And if you're still stuck, tap me again, and again, and I'll give you bigger clues."),
  s("tut_tile", "Now find this sound..."),
  s("tut_speaker", "Tap the speaker to hear the sound again."),
  s("tut_test", "Last one. All by yourself! Find this sound..."),
  s("tut_stuck", "Not sure? Tap me for a clue!"),
  s("tut_done", "You're ready, ninja! Let's go!"),

  // --- Grown-ups
  s("grownups", "This part is for grown-ups. Hold the button to open."),

  // --- First minutes (docs/FIRST_MINUTES.md): the school-year opt-in, the dojo welcome, and warm-up games for 3-to-4-year-olds who can't read (big picture cards; Sensei shows one first, then the child tries), then the Sticker Book rewards
  // Every line that contains a word is one whole recording; only pure sounds, stretched words and held first sounds are
  // spliced, after a lead-in ending on "..." (§12).
  // opt-in (§4)
  s("fm_opt_q1", "Do you go to big school yet?"),
  s("fm_opt_notyet", "Not yet? Tap the teddy!"),
  s("fm_opt_yes", "Yes? Tap the school!"),
  s("fm_opt_q1_again", "Teddy, or school? Tap one!"),
  s("fm_opt_echo_notyet", "Not yet!"),
  s("fm_opt_echo_school", "Big school!"),
  s("fm_opt_q2", "Which class are you in?"),
  s("fm_opt_rec", "Reception!"),
  s("fm_opt_y1", "Year One!"),
  s("fm_opt_y2", "Year Two!"),
  s("fm_opt_unsure", "Not sure? Tap the cloud!"),
  s("fm_opt_q2_again", "Tap your class!"),
  s("fm_opt_ok_notyet", "Then I've set up some listening games, just for you!"),
  s("fm_opt_ok_unsure", "That's fine! I've set up some listening games for you, and we'll see how you get on."),
  s("fm_opt_ok_rec", "I've set up the game for Reception, with sounds just like at school!"),
  s("fm_opt_ok_y1", "I've set up the game for Year One, with new ways to spell the sounds you know!"),
  s("fm_opt_ok_y2", "I've set up the game for Year Two, with even more ways to spell the sounds you know!"),
  s("fm_opt_grownups", "Your grown-ups can change this later, in the grown-ups' settings."),
  s("fm_opt_default_home", "Let's start at the very beginning, with listening games!"),
  s("fm_opt_default_rec", "Let's start with the Reception games!"),
  s("fm_newyear_q", "It's a new school year! Which class are you in now?"),
  s("fm_newyear_up", "Hooray! You've moved up!"),
  // dojo welcome, help and the time governor
  s("fm_help_short", "Stuck? Tap me, down here in the corner. Try it now!"),
  s("fm_help_ok", "That's it! I'm always here to help."),
  s("fm_its_this", "It's this one!"),
  s("fm_last_one", "Here's the last one!"),
  // Lesson 1: Ninja Ears (§5)
  s("fm_l1_hello", "Ninja ears on! Let's listen to some words."),
  s("fm_name_sun", "This is the sun."),
  s("fm_name_sock", "This is a sock."),
  s("fm_name_cat", "This is a cat."),
  s("fm_tap_sock", "Tap the sock!"),
  s("fm_fast_sun", "I can say a word fast. Sun!"),
  s("fm_slow", "Or I can say it slowly..."),
  s("fm_same_word", "Fast or slow, it's the same word. Sun!"),
  s("fm_hear_sounds", "When I say a word slowly, I can hear the sounds that make up the word. Words are made of sounds!"),
  s("fm_tap_tortoise", "Your turn! Tap the tortoise, and say it slowly with me."),
  s("fm_tap_rabbit", "Now tap the rabbit, and say it fast!"),
  s("fm_slow_listen", "Listen to my slow word..."),
  s("fm_which_pic", "Which picture is it?"),
  s("fm_slow_another", "Here's another slow word..."),
  s("fm_first_listen", "Listen to the very first sound."),
  s("fm_notice_sun_sock", "Did you notice? Sun and sock start with the same sound..."),
  s("fm_name_sausage", "This is a sausage."),
  s("fm_name_moon", "This is the moon."),
  s("fm_tap_all_start", "Tap all the pictures that start with..."),
  s("fm_diff_moon", "Moon starts with a different sound."),
  s("fm_diff_cat", "Cat starts with a different sound."),
  s("fm_found_both", "You found them both! They both start with..."),
  s("fm_look_this", "Look! This one starts with..."),
  s("fm_l1_done", "You can hear the sounds in words. Brilliant listening!"),
  // Reward 1: the Sticker Book (§6)
  s("fm_rw_look", "Look! Your pictures are turning into stickers!"),
  s("fm_rw_book", "This is your Sticker Book!"),
  s("fm_rw1_list", "Sun, sock, cat, sausage and moon!"),
  s("fm_rw_every", "Every picture you play with becomes a sticker!"),
  s("fm_rw_tap", "Tap a sticker!"),
  s("fm_rw_next", "Ready for the next game? Tap the big arrow!"),
  s("fm_rw_more", "More stickers for your Sticker Book!"),
  // Lesson 2: Ninjas Read This Way (§7)
  s("fm_l2_way", "Ninjas read this way!"),
  s("fm_name_fish", "This is a fish."),
  s("fm_name_dog", "This is a dog."),
  s("fm_read_fish_dog", "Fish... dog. Fish dog!"),
  s("fm_l2_turn", "Your turn! Tap them the ninja way."),
  s("fm_pair_fish_dog", "Fish dog!"),
  s("fm_l2_start", "Start here, on this side!"),
  s("fm_l2_swap", "Whoops! Now they're the other way round. Dog... fish. Dog fish!"),
  s("fm_which_cat_dog", "Listen. Cat... dog. Which one did I read?"),
  s("fm_pair_cat_dog", "Cat dog!"),
  s("fm_l2_big_word", "Two little words can make one big word!"),
  s("fm_name_flower", "This is a flower."),
  s("fm_sunflower", "Say them slowly: sun... flower. Say them fast: sunflower!"),
  s("fm_name_star", "This is a star."),
  s("fm_starfish_q", "Star... fish. Tap the rabbit to say them fast!"),
  s("fm_starfish", "Starfish!"),
  s("fm_quick_tap_all", "Quick! Tap all the pictures that start with..."),
  s("fm_diff_fish", "Fish starts with a different sound."),
  s("fm_diff_dog", "Dog starts with a different sound."),
  s("fm_l2_done", "You read the pictures, just like a real reader!"),
  // Reward 2: shiny sticker, first petal, map (§8)
  s("fm_rw2_list", "Fish, dog, flower, sunflower, star and starfish!"),
  s("fm_rw_shiny", "Ooh, a shiny sticker! Fish dog!"),
  s("fm_rw2_s", "Sun, sock, sausage and sunflower. They all start with..."),
  s("fm_rw2_petal", "You found your very first sound! Look, its petal is shining through the mist."),
  s("fm_rw2_map", "Your Sticker Book lives here, on the map!"),
  // other starting points and adjusting (§9, §10)
  s("fm_tap_all_in", "Tap all the pictures with this sound in them..."),
  s("fm_not_in_sun", "Sun doesn't have that sound in it."),
  s("fm_not_in_dog", "Dog doesn't have that sound in it."),
  s("fm_found_all", "You found them all!"),
  s("fm_tap_all_words_in", "Tap all the words with this sound in them..."),
  s("fm_warm_up", "Let's do some warm-up training first!"),
  s("fm_super_listener", "You're a super listener! Now let's find out how we write the sounds."),
  // "Let me show you!" then "Now you try!" (the Amendment): every warm-up game type opens with Sensei and the ninja
  // doing one item, then the child's turn. The _2 lines are alternates for variety.
  s("fm_show_me", "Let me show you!"),
  s("fm_you_try", "Now you try!"),
  s("fm_show_me_2", "Watch me first!"),
  s("fm_you_try_2", "Your turn!"),
  s("fm_tap_sun", "Tap the sun!"),
  // the dojo welcome also shows the Hear it again button (docs/ARCHITECTURE.md §15.3)
  s("fm_speaker", "And when you tap the speaker, I'll say it again!"),
  // pace across the warm-ups (§10)
  s("fm_practise_again", "Let's practise that again!"),
  // W3 (ears): fast and slow on mug, "/a/ in it", first sound /m/
  s("fm_name_mug", "This is a mug."),
  s("fm_name_bag", "This is a bag."),
  s("fm_name_jam", "This is some jam."),
  s("fm_name_van", "This is a van."),
  s("fm_name_map", "This is a map."),
  s("fm_diff_sun", "Sun starts with a different sound."),
  s("fm_all_start", "They all start with..."),
  // W4 (picread): three in a row, and a picture word the child makes
  s("fm_read_cat_dog_fish", "Cat... dog... fish. Cat-dog-fish!"),
  s("fm_triple_cat_dog_fish", "Cat dog fish!"),
  s("fm_l4_swap", "Now they're the other way round. Fish... dog... cat. Fish dog cat!"),
  s("fm_which_three", "Listen. Fish... dog... cat. Which one did I read?"),
  s("fm_triple_fish_dog_cat", "Fish dog cat!"),
  s("fm_sunflower_q", "Sun... flower. Tap the rabbit to say them fast!"),
  s("fm_sunflower_fast", "Sunflower!"),
  // W5 (ears): Sensei says the sounds, the child listens for the word
  s("fm_sounds_intro", "I'll say the sounds. You listen for the word!"),
  s("fm_name_mop", "This is a mop."),
  s("fm_name_cap", "This is a cap."),
  s("fm_name_bug", "This is a bug."),
  s("fm_name_fan", "This is a fan."),
  s("fm_name_man", "This is a man."),
  s("fm_name_jug", "This is a jug."),
  s("fm_name_bun", "This is a bun."),
  s("fm_name_bus", "This is a bus."),
  s("fm_l5_done", "You heard the words in the sounds. Super listening!"),
  // W6 (picread): sound dots under pictures, tapped this way like the sound buttons in the dojo
  s("fm_dots_intro", "Every dot is a sound. Ninjas tap them this way!"),
  s("fm_dots_turn", "Your turn! Tap the dots this way, and say the sounds with me."),
  s("fm_dots_say", "Say the sounds... and say the word!"),
  s("fm_l6_done", "Now you're ready to find out how we write the sounds!"),

  // --- World Flower 2.0 (src/scenes/Tree.tsx, src/scenes/Intros.tsx; the scripts are in src/content/teach.ts)
  // trips to the World Flower (engine/gems.ts FlowerVisit), the petal detail's Practise gate, and the first-visit intro
  s("wf_i3", "Inside each petal are shiny gems. Each gem is a way to spell the sound."),
  s("wf_found_sound", "You found a new sound! Look, here is its petal, shining through the mist."),
  s("wf_found_gem", "You found a new gem! It's a spelling of the sound..."),
  s("wf_petals_you_know", "Every shining petal is a sound that you know!"),
  s("wf_world_new", "New sounds are hiding in this land. Let's go and find them!"),
  s("wf_practised", "Look! Your gem filled up with ninja power."),
  s("wf_help_petal", "Tap a gem to hear how it spells the sound. Tap the gate to practise it in the dojo!"),
  s("wf_new_gem_here", "Look! Your new gem goes here, in its petal."),
  s("wf_spelling_of", "This is a spelling of the sound..."),

  // ---- Narrative audit (docs/NARRATIVE_AUDIT.md, playtest/narrative/audit.json): explanations in the level scenes.
  // When each one plays is src/content/narrative.ts (spacing) and src/scenes/narrate.tsx (the per-save ledger). The
  // sub-headings below name the scene, so the line linter knows what is on screen.
  // --- Dojo (narrative audit): a new spelling, adjacent consonants (F12), and Help that never segments the word (F27)
  s("audit_spell_it", "And this is how we spell it."),
  s("audit_hear_see", "We hear the sound. Now look: this is how we spell it."),
  s("audit_dojo_back", "Back to the dojo! Let's learn some new sounds."),
  s("audit_neighbours", "These sounds sit next to each other. Listen for each one as we say the word slowly."),
  s("audit_neighbours_plain", "These sounds sit next to each other. Listen for every one!"),
  s("audit_spelling_help", "Listen to the word slowly. What sound do you hear here?"),
  s("audit_spelling_help_plain", "Listen to the word again. What sound do you hear here?"),
  // --- Correction (narrative audit): whole-sentence alternatives to listen_here, rotated; a stretched word follows
  s("audit_listen_slowly", "Let's listen to the word again, slowly."),
  s("audit_listen_next", "Hmm, listen again. What sound comes next?"),
  // --- Praise (narrative audit): the first time the child's right answers fill a gem, in any level (F04)
  s("audit_gem_first", "Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up."),
  // --- Battle (narrative audit): Baron Muddle's motive (F18), the first Gem Trial and its bar (F16)
  s("audit_baron_first", "Baron Muddle hid the sounds. Let's win them back from his monsters."),
  s("audit_trial_first", "Your gem is ready. Spell the words to win it."),
  s("audit_timer_short", "Watch the purple bar. Spell the word before it fills."),
  s("audit_timer_hearts", "If it fills, you lose a heart. I will help you try again."),
  s("audit_neighbours_short", "In these words, some sounds sit close together. Listen carefully for every one!"),
  // --- Run (narrative audit): a rotating cue before a word's sounds (with run_blend and t_listen_for_word)
  s("audit_sounds_again", "Listen to the sounds, and catch the word they make!"),
  // --- Sort (narrative audit): the chests' spellings, shown one by one with their sound (F13)
  s("audit_sort_first", "Sorting time! These words have the same sound, but it's spelt in different ways."),
  s("audit_sort_again", "Sorting time! Same sound, different spellings."),
  s("audit_sort_pair", "This sound can be spelt in two ways."),
  s("audit_sort_three", "This sound can be spelt in three ways."),
  // --- Swap (narrative audit): the place of the sound that changes (first, middle, last)
  s("audit_swap_first", "Yes, the first sound changes! Now pick the new sound."),
  s("audit_swap_middle", "Yes, the middle sound changes! Now pick the new sound."),
  s("audit_swap_last", "Yes, the last sound changes! Now pick the new sound."),
  // --- Story (narrative audit): choosing by reading (F14), and common words with untaught spellings (F15), in the
  // official parent wording "This is 'the', just say 'the' here"
  s("audit_story_choice", "Read the two words. Tap the one you choose."),
  s("audit_story_choose_again", "Read the words, and tap one!"),
  s("audit_special_the", "This is 'the'. Just say 'the' here."),
  s("audit_special_is", "This is 'is'. Just say 'is' here."),
  s("audit_special_his", "This is 'his'. Just say 'his' here."),
  s("audit_special_to", "This is 'to'. Just say 'to' here."),
  s("audit_special_i", "This is 'I'. Just say 'I' here."),
  s("audit_special_so", "This is 'so'. Just say 'so' here."),
  s("audit_special_he", "This is 'he'. Just say 'he' here."),
  s("audit_special_you", "This is 'you'. Just say 'you' here."),
  s("audit_special_go", "This is 'go'. Just say 'go' here."),

  // ---- Integration (26 Sep 2026): the narrative audit's explanations in the early games, the rewards and the
  // Bridging Unit (docs/NARRATIVE_AUDIT.md F02, F04, F08-F10, F17, F25). Sub-headings name the scene for the linter.
  // --- Dojo (integration): the first word-building dojo (w1-4): what a dojo is, left to right, and the last sound
  s("audit_dojo_first", "This is our dojo. Here we listen to sounds, make words, and read them."),
  s("audit_left_right", "We start here, and go this way."),
  s("audit_last_place", "The last sound is at the end of the word. Listen to the end."),
  // --- Early learning (integration): the middle sound (Sound Hunt), and a reminder before the sounds-to-words game
  s("audit_middle_place", "The middle sound comes after the first sound, and before the last sound."),
  s("audit_made_of_sounds", "Remember? Words are made of sounds!"),
  // --- Early learning (integration): each picture in the first-sound and sound-hunt games named in one whole sentence
  // (Round 13: no "This is a..." + [word] splices), like the warm-ups' fm_name_ lines
  s("fm_name_ant", "This is an ant."), s("fm_name_apple", "This is an apple."), s("fm_name_bed", "This is a bed."), s("fm_name_bin", "This is a bin."),
  s("fm_name_cot", "This is a cot."), s("fm_name_cup", "This is a cup."), s("fm_name_fox", "This is a fox."), s("fm_name_hat", "This is a hat."),
  s("fm_name_leg", "This is a leg."), s("fm_name_lid", "This is a lid."), s("fm_name_log", "This is a log."), s("fm_name_mat", "This is a mat."),
  s("fm_name_milk", "This is some milk."), s("fm_name_nest", "This is a nest."), s("fm_name_net", "This is a net."), s("fm_name_nut", "This is a nut."),
  s("fm_name_pan", "This is a pan."), s("fm_name_peg", "This is a peg."), s("fm_name_pen", "This is a pen."), s("fm_name_pig", "This is a pig."),
  s("fm_name_pin", "This is a pin."), s("fm_name_pond", "This is a pond."), s("fm_name_pot", "This is a pot."), s("fm_name_sand", "This is some sand."),
  s("fm_name_sit", "Look, she can sit."), s("fm_name_tap", "This is a tap."), s("fm_name_tent", "This is a tent."), s("fm_name_tin", "This is a tin."),
  s("fm_name_top", "This is a top."), s("fm_name_web", "This is a web."), s("fm_name_zip", "This is a zip."),
  // --- Early learning (integration): the answer's word and its lead-in in one recording, so only the pure sound is
  // joined ("Mop starts with..." [/m/], "Pin has this sound in the middle..." [/i/]; docs/FIRST_MINUTES.md §12 rule 1)
  s("fs_ant", "Ant starts with..."), s("fs_apple", "Apple starts with..."), s("fs_man", "Man starts with..."), s("fs_map", "Map starts with..."),
  s("fs_mat", "Mat starts with..."), s("fs_milk", "Milk starts with..."), s("fs_mop", "Mop starts with..."), s("fs_mug", "Mug starts with..."),
  s("fs_nest", "Nest starts with..."), s("fs_net", "Net starts with..."), s("fs_nut", "Nut starts with..."), s("fs_pan", "Pan starts with..."),
  s("fs_peg", "Peg starts with..."), s("fs_pen", "Pen starts with..."), s("fs_pig", "Pig starts with..."), s("fs_pin", "Pin starts with..."),
  s("fs_pond", "Pond starts with..."), s("fs_pot", "Pot starts with..."), s("fs_sand", "Sand starts with..."), s("fs_sit", "Sit starts with..."),
  s("fs_sock", "Sock starts with..."), s("fs_sun", "Sun starts with..."), s("fs_tap", "Tap starts with..."), s("fs_tent", "Tent starts with..."),
  s("fs_tin", "Tin starts with..."), s("fs_top", "Top starts with..."),
  s("mid_pin", "Pin has this sound in the middle..."), s("mid_tin", "Tin has this sound in the middle..."), s("mid_zip", "Zip has this sound in the middle..."),
  s("mid_lid", "Lid has this sound in the middle..."), s("mid_pig", "Pig has this sound in the middle..."), s("mid_milk", "Milk has this sound in the middle..."),
  s("mid_bin", "Bin has this sound in the middle..."), s("mid_mop", "Mop has this sound in the middle..."), s("mid_top", "Top has this sound in the middle..."),
  s("mid_pot", "Pot has this sound in the middle..."), s("mid_cot", "Cot has this sound in the middle..."), s("mid_log", "Log has this sound in the middle..."),
  s("mid_dog", "Dog has this sound in the middle..."), s("mid_fox", "Fox has this sound in the middle..."),
  // --- First minutes (integration): warm-up W4's picture words, rain + bow and snow + man (the child says them fast)
  s("fm_name_rain", "This is rain."), s("fm_name_bow", "This is a bow."), s("fm_name_snow", "This is snow."),
  s("fm_rainbow_q", "Rain... bow. Tap the rabbit to say them fast!"), s("fm_rainbow", "Rainbow!"),
  s("fm_snowman_q", "Snow... man. Tap the rabbit to say them fast!"), s("fm_snowman", "Snowman!"),
  // --- Rewards (integration): what the first petal means (F03), and gem energy only when a gem visibly fills (F04)
  s("audit_petal_means", "This petal is for the sound..."),
  s("audit_gem_more", "Look, this gem has filled a little more."),
  // --- Praise (integration): the first time a streak powers the ninja up (F17)
  s("audit_streak_first", "Three right answers in a row! Your ninja is getting stronger."),
  // --- Sort (integration): the Bridging Unit's first sort, after all the one-sound spellings (F25)
  s("audit_bridging_first", "You know this sound! Now let's look at the different ways we spell it."),

  // --- First minutes (review pass, 26 Sep): Lesson 1's "words are made of sounds" in about 4 s (the 7.2 s
  // fm_hear_sounds stays as the fallback). Owned by the first-minutes review fixes; edit only this block.
  s("fm_hear_sounds_short", "Slowly, I hear its sounds. Words are made of sounds!"),

  // --- Re-audit r2 fixes (26 Sep): whole sentences for a merged picture said again once it is clean (the dog-fish), and
  // the battle reward naming more than one gem. Owned by the re-audit r2 fix pass; edit only this block.
  s("r2_dog_fish", "Dog fish!"),
  s("r2_gems_more", "Look, these gems have filled a little more."),

  // --- Baron Muddle
  b("baron_taunt_1", "Mwa-ha-ha... I hid THAT sound very well, little ninja."),
  b("baron_taunt_2", "Muddle... muddle... muddle. Your sounds belong to ME now!"),
  b("baron_taunt_3", "Silence! No more words! Not ever!"),
  b("baron_grr", "Grrrr... You dare to fight ME?"),
  b("baron_lose", "Nooo! My muddle! This is not over, ninja... I will be back!"),
  b("baron_w1", "So... a little ninja wants to stop me? My sumo panda will squash you!"),
  b("baron_w2", "My big red monster is hungry, ninja. Hungry... for SOUNDS!"),
  b("baron_w3", "In my mountains, every word freezes solid. Mwa-ha-ha!"),
  b("baron_w4", "My river dragon gobbles up sounds. Slurp! Mwa-ha-ha!"),
  b("baron_w5", "Welcome to my castle, little ninja! In here, some sounds are spelt with two letters. How muddling! Mwa-ha-ha!"),
  b("baron_w6", "So. You came all this way. Same sound, different spellings? That was my best muddle of all! Grrr!"),
  b("baron_final", "Oh... Well... I suppose words ARE rather nice. Especially... stories. Sorry for all the muddle."),
];
// whole-sentence example clips for the teacher language (scripts/gen-teach-lines.ts → teach-lines.gen.ts)
LINES.push(...TEACH_LINES.map((l) => s(l.id, l.text)));

export const PRAISE = ["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10"];
export const BARON_TAUNTS = ["baron_taunt_1", "baron_taunt_2", "baron_taunt_3"];
