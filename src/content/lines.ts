// Every spoken line (besides pure sounds and single words). Generated to /a/l/<id>.mp3.
// Speakers: "sensei" (warm British teacher narrator) and "baron" (the villain: sinister, never gory).

export type Speaker = "sensei" | "baron";
export interface Line { id: string; text: string; who?: Speaker }

const s = (id: string, text: string): Line => ({ id, text, who: "sensei" });
const b = (id: string, text: string): Line => ({ id, text, who: "baron" });

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
  s("tree_tap", "Tap a petal to hear its sound."),
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
  s("three_letters_one_sound", "Three letters, one sound!"),
  s("same_sound_diff", "Same sound, different spellings!"),
  s("same_sound_new", "Ooh! You already know this sound. Here's another way to spell it! Same sound, different spelling."),
  s("same_sound_spelling", "Yes, that's a spelling of that sound too! But in this word, we spell it like this..."),
  s("stays_same", "That sound stays the same."),

  // --- Dojo (learning new sounds + word building)
  s("dojo_hello", "This is the dojo. A dojo is where ninjas practise! Let's practise some sounds."),
  s("dojo_this_sound", "And this is how we write it."),
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
  s("timer_intro_2", "When it's full, the monster jumps, and you lose a heart. So spell each word before the bar is full."),
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
  s("sort_start", "Sorting time! These words have the same sound, but it's written in different ways. Put each word in the right chest!"),
  s("sort_done", "Sorted! What a clever ninja."),

  // --- Story
  s("story_start", "Story time! I'll read, and you read too."),
  s("story_your_turn", "Your turn to read! Tap a word if you need help."),
  s("story_choose", "What should Super Ninja do? Read the words and choose!"),
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
  s("flower_i3", "Inside each petal are shiny gems. Each gem is a way to write the sound."),
  s("flower_i4", "When you play and get it right, a gem fills up with ninja power."),
  s("flower_i5", "When a gem is full, it glows. Then you can win it in a gem battle!"),
  s("flower_i6", "Win all the gems in a petal, and the petal flies back onto the World Flower!"),
  s("book_i1", "This is your Word Book. It's a book of stickers!"),
  s("book_i2", "Every time you read or spell a word, you win its sticker."),
  s("book_i3", "Can you fill the whole book?"),
  s("flower_tap", "Tap a petal to see its gems."),
  s("gem_energy", "Look! Your gems are filling up with ninja energy!"),
  s("gem_ready", "A gem is glowing! It's ready for a gem battle."),
  s("gem_charging", "This gem is filling up. Keep playing to fill it!"),
  s("gem_hidden", "This gem is still a secret. You'll find it later!"),
  s("gem_future", "This gem is far, far away. We'll find it one day!"),
  s("trial_start", "Gem battle! Spell the words to win the gem!"),
  s("trial_win", "You won the gem! It's going into its petal!"),
  s("trial_fail", "So close! Keep playing, and try again soon!"),
  s("petal_complete", "All the gems are in! The petal flies back onto the World Flower!"),
  s("flower_complete", "The World Flower is glowing again! You are a true Super Ninja!"),

  // --- Word Book
  s("book_intro", "This is your Word Book! Every word you read or spell goes in here as a sticker."),
  s("book_missing", "This sticker is still out on your adventure. Keep playing to find it!"),
  s("book_new", "New stickers for your Word Book!"),
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
  s("words_made", "Words are made of sounds. Listen!"),
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
  s("help_sort", "Tap the chest with the same spelling."),
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

export const PRAISE = ["yay_1", "yay_2", "yay_3", "yay_4", "yay_5", "yay_6", "yay_7", "yay_8", "yay_9", "yay_10"];
export const BARON_TAUNTS = ["baron_taunt_1", "baron_taunt_2", "baron_taunt_3"];
