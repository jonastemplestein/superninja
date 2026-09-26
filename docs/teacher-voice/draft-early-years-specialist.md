# Sensei's teacher voice: the complete script (Early Years specialist's draft)

**Status:** a draft script for the teacher-voice workflow, written on 26–27 September 2026 by the Early Years and child-language specialist. It answers Jonas's playtest with his 3- and 4-year-old (docs/FEEDBACK.md, Round 14). It builds on [current.md](current.md) (what a child hears today), [research.md](research.md) (how good Nursery and Reception teachers introduce a game) and [mechanics.md](mechanics.md) (the Ready hold, frame forms and state). No game code was changed. Every line below is proposed final wording, to be merged with the other drafts and recorded the usual way.

> Jonas: "I find that this extremely abbreviated way of talking, it doesn't help at all. … They say, so first, I'm going to show you how to do it. Are you ready? And this is how this game goes. I will show you this, and you will do that. Do you want to give it a go now? … Teachers explain what they're doing."
>
> Round 13: the first game was "too long and boring" for the 3-year-old.

**Contents**
- §0 How I wrote it, the notation, and two samples read aloud
- §1 The preschool path, every line in play order (opt-in to w2-1, the first Dojo)
- §2 Every other game type: the first-time introduction and the replay forms
- §3 The recurring moves: ready, show me again, praise, correction, idle, Help, wrap-up, the moment before a reward
- §4 Notes for integration: where this differs from mechanics.md, timings, line inventory, recording, decisions

---

## 0. How I wrote it

### 0.1 Five rules for a 3-year-old

1. **Talk, stop, then the child acts.** A 3-year-old can attend to one thing at a time. No run of talk is longer than about 8 s (about 20 words) without something new happening on screen. Nothing runs past 12 s before the child does something. On a first meeting, the talk before the first tap is 10–12 s at most. The Ready tap counts as that first tap.
2. **One idea per sentence.** Sentences are 4–10 words, with a subject and a verb, in the present tense. Sensei is "I" and the child is "you". An instruction has at most two steps. The nouns are things the child can see: "the green arrow", "my paw", "the tortoise", "these pockets". Where Sensei uses a metaphor, she says what it means.
3. **Explain what we're doing, in the order it happens.** Every first meeting follows Jonas's order: *what this game is* → *how it goes: "I'll… Then you…"* → *"Ready? Tap the green arrow."* → *"I'll go first. Watch my paw."* (a narrated demo) → *"Now it's your turn."* and a real question.
4. **Every "?" gets an answer.** Sensei asks a question only when the child can answer it with a tap or by saying something aloud. There are no rhetorical questions ("Remember…?", "Shall we have a break?"). When nothing is to be answered, she uses a statement ("You know this game.").
5. **The voice is calm, and only celebrations get "!".** Frames and instructions end in full stops and are recorded warm and unhurried. Questions end in "?". Exclamation marks are only for celebrations and surprises.

Also, throughout:
- **No bare "Listen!".** "Listen" always comes with what to listen *for* ("Listen for the word…", "Listen right to the end of the word…"). A lead-in that carries a sound ends suspended, but it isn't an order: "Here's the sound…", "My sound is…".
- **Every symbol is explained the first time it matters,** at the moment it matters: the arrow, the paw, the tortoise and rabbit, the petal, the pockets, the monster's bar, the hearts, the tick.
- **The Sounds~Write words stay exact.** Sounds are pure. On the preschool path Sensei says "This is the way we write…" /s/ (the official Lesson 1 wording is "the way we write /s/"). "Say the sounds, and read the word." · "It's two letters, but it's one sound." · "Same sound, different spellings." Spellings never "say" or "make" sounds, and there are no letter names.
- **Framing is paid for by cutting repeats,** never by dropping the frame. The full frame plays once. On later plays it shrinks to a "You know this game" line, then to the game's name, then to nothing (§2).

### 0.2 The notation in the tables

| Mark | Meaning |
|---|---|
| `/s/` | a pure sound, played as its own clip: always at the end of a sentence or alone between sentences, never inside one. When it's a sound Sensei *presents*, its petal is on screen (docs/SOUND_DISPLAY.md) |
| «sun» | the plain word clip, in its own slot (a card or tile saying itself, or a read-back) |
| «sun~» | the stretched word ("sssuuunnn"), in its own slot |
| «s-sun» | the held first sound ("sssun"), in its own slot |
| `{sock}` | a template: one whole recording per word, generated like today's `fm_name_*` and `fs_*` lines. The word list is in §4.3 |
| `…` at the end of a line | a lead-in recorded to end suspended, so a sound or word can follow in its own slot |
| **▶** | the Ready hold: the green Next arrow pops in, pulsing; the child's ninja turns to it in its ready stance and bows when it's tapped. A tap on the board also counts as ready (the card says its own name). Nothing starts by itself (§3.1) |
| (paw) | Show me again, the paw button in the nav row. It replays the demo during the turn (§3.2) |
| kept | an existing line id, used unchanged |
| ◇ | an optional beat the time governor may drop |

Ids that start with `tv_` are new ("teacher voice"). Every Sensei row is one recorded clip, plus any sound or word slots shown after it.

### 0.3 Two samples, read aloud

**The first game (W1, Ninja Ears), the first 25 seconds:**

> Our first game is a listening game. It's called Ninja Ears. · I'll say a word. Then you find its picture. · Are you ready to play? Tap the green arrow. · *(taps; the ninja bows)* Here we go. · This is a sock. · This is a cat. · I'll go first. Watch my paw. · My word is sun. There's the sun. *(paw taps; the ninja kicks)* · Now it's your turn. · Where's the sock? *(taps)* «sock» · You found the sock.

**The first Dojo lesson (w2-1), which today opens on "Listen…" and a pulsing ear:**

> Today you'll learn four new sounds. *(four misty petals twinkle)* · I'll say each one, and show you how we write it. · Then you say it with me. · Ready? Tap the green arrow. · *(taps)* Here's the first new sound. /b/ … /b/ *(the petal blooms)* · Now watch my ninja write it. *(the letter appears)* · This is the way we write… /b/ · Now it's your turn. Tap it, and say it with me. *(taps, says /b/)* · And once more. *(taps)* · You said that sound really well.

---

## 1. The preschool path, every line in play order

This is a brand-new child who answers "not yet", playing from the opt-in through w2-1. The levels are in map order. I've assumed they're played in one continuous sitting, as in the listener's run. If a level falls in a later session, its games use the **recap** form from §2 in place of the **short** form shown here. Each game ends with a budget line: the talk before the first tap (at Sensei's 2.7 words a second), and the longest run of talk.

### 1.1 The opt-in: "Do you go to big school yet?" (OptIn.tsx)

Today it opens with the question and no reason. The answers are telegraphic ("Not yet? Tap the teddy!"), and the line about grown-ups is spoken to the child.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_opt_why | the cards land | the teddy card and the school card (the child's ninja at the gate); ▶ dim | First, let's find the right games for you. | watches (a tap on a card works from now) |
| fm_opt_q1 (kept) | | both cards | Do you go to big school yet? | |
| tv_opt_notyet | | the teddy spotlit | If you don't go yet, tap the teddy. | |
| tv_opt_yes | | the school spotlit | If you do, tap the school. | taps the teddy |
| tv_opt_echo_notyet | on a teddy tap | a gold ring round the teddy; ▶ turns green | Not yet. That's fine. | |
| tv_opt_echo_school | on a school tap | a gold ring round the school | You go to big school. | |
| tv_opt_check | 0.5 s after the echo | ▶ pulses | Is that right? Then tap the green arrow. | taps ▶ (or the other card, to change) |
| tv_opt_ok_notyet | after ▶ | the teddy shrinks into a badge and flies to the gear | Then we'll start with some listening games, just for you. | |
| tv_opt_grownups | | the gear glows and wiggles | Your grown-up can change this later, if they need to. | |
| tv_opt_to_dojo | the confirm hold (holdNext) | ▶ pulses | Now come with me to the dojo. Tap the green arrow. | taps ▶ |
| tv_opt_again | idle 8 s, no card chosen | both cards bob | Tap the teddy if you don't go to school yet. | |
| tv_opt_ask | idle 20 s | the gear glows | Ask a grown-up to help you choose. | |

**Screen B, "Which class?"** (only after the school card):

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_opt_q2 | the doors swing in | three class doors, with the child's ninja at three heights; the "Not sure?" cloud | Which class are you in? Tap your class. | |
| tv_opt_rec, tv_opt_y1, tv_opt_y2 | each door spotlit | | Reception. · Year One. · Year Two. | |
| fm_opt_unsure (kept) | the cloud spotlit | | Not sure? Tap the cloud! | taps a door |
| (the door's own label) | on a tap | a gold ring round the door | (Reception. / Year One. / Year Two.) | |
| tv_opt_check | | ▶ pulses | Is that right? Then tap the green arrow. | taps ▶ |
| fm_opt_ok_rec / _y1 / _y2 / _unsure (kept) | after ▶ | the badge flies to the gear | (as today) | |
| tv_opt_grownups, tv_opt_to_dojo | | | (as above) | taps ▶ |

*Budget: 10.8 s of talk before the labels end, but a card works from the first word.*

### 1.2 The dojo welcome: the tutorial (Training.tsx)

Today it says "Ninja training! First, tap the big gong!" with no word about what training is. The three stars at the top are never explained, and the speaker line repeats itself.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_tut_hello | the welcome starts | the dojo; a gong hanging; three grey stars at the top; the ninja bottom-left | Welcome to my dojo. This is where ninjas practise. | watches |
| tv_tut_gong_1 | | the gong swings gently | Let's start with a big bong. | |
| tv_tut_gong_2 | | the pointing hand on the gong | Tap the gong, and your ninja will kick it. | taps the gong |
| tv_tut_gong_ok | the kick lands; BONG; the first star lights | stars burst | What a kick! | |
| tv_tut_stars | | the first star shines | That's your first star. Two more to go. | |
| tv_tut_help_1 | | Sensei's portrait glows; a big arrow sweeps from the ninja to her | If you're ever stuck, tap me. I'm down here in the corner. | |
| tv_tut_help_2 | | Sensei's portrait pulses | Try it now. Tap me. | taps Help |
| fm_help_ok (kept) | the second star lights | | That's it! I'm always here to help. | |
| tv_tut_next_game | | the speaker pops into the nav row | Next, we're going to play a listening game. | |
| tv_tut_speaker | | the speaker pulses; the hand points at it | If you want to hear me again, tap the speaker. Try it now. | taps the speaker |
| (replay) | the speaker's tap | | (tv_tut_next_game again) Next, we're going to play a listening game. | |
| tv_tut_speaker_ok | the third star lights | | That's it. I'll always say it again. | |
| tv_tut_done | | all three stars glow | Three stars! Now let's play. | (W1 starts) |
| tv_tut_speaker_again | idle 8 s on the speaker step | the speaker glows | Tap the speaker, and I'll say it again. | |

*Budget: 6.3 s before the gong; every step after that is 3–5 s.*

### 1.3 W1, Ninja Ears (Warmup.tsx, content/warmups.ts W1)

W1 has three games (tap the picture, Tortoise and Rabbit, Fill the Pockets) and one show (the first sound).

**Game 1: find the picture, the first game of all.** It opens with the only "Are you ready to play?" in the game, because the child's first action has to come within 12 s (§4.1).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_w1_hello | W1 starts | Bamboo Village; the beads and the sticker bead appear; sun, sock and cat drop in on "listening game"; the ninja cups its ear on "Ninja Ears" | Our first game is a listening game. It's called Ninja Ears. | watches |
| tv_w1_how | | the three cards bounce, one after another | I'll say a word. Then you find its picture. | |
| tv_rdy_play | | ▶ pops in, pulsing; the ninja turns to it | Are you ready to play? Tap the green arrow. | taps ▶ (or a card) |
| tv_rdy_go | on the tap | the ninja bows | Here we go. | |
| fm_name_sock (kept) | | the sock spotlit | This is a sock. | |
| fm_name_cat (kept) | | the cat spotlit | This is a cat. | |
| tv_show_first | | the paw appears at the edge | I'll go first. Watch my paw. | watches |
| tv_w1_demo | | the paw sets off on "sun" and taps the sun on "There's"; the ninja kicks its corner; a star stamp | My word is sun. There's the sun. | |
| tv_turn | | the paw steps back; Show me again (the paw) and the speaker in the nav row | Now it's your turn. | |
| tv_where_sock | | the sock glows after 2 s (the first tap is guided) | Where's the sock? | taps the sock |
| (the card) | | «sock»; the ninja kicks; a star stamp | «sock» | |
| tv_w1_found | | | You found the sock. | |

*Budget: 7.4 s before ▶ is live, and 10.7 s by the end of the question. From the Ready tap to the sock: 9.5 s, in four visual beats. Longest run: 7.4 s.*

**Game 2: Tortoise and Rabbit (fast and slow).** It explains the two buttons, which today are never named.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_spd_rabbit | the next beat starts | sock and cat slide away; the sun grows to the centre; the rabbit button pops in on the right, spotlit, with a quick hop | This is my rabbit. Rabbits are fast. | |
| tv_spd_tortoise | | the tortoise pops in on the left, spotlit, with a slow nod | This is my tortoise. Tortoises are slow. | |
| tv_spd_how | | the sun glows | I'll say this word fast, and then slowly. Then it's your turn. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_fast_sun (kept) | | the paw taps the rabbit; the card hops; the ribbon zips across | I can say a word fast. Sun! | watches |
| fm_slow (kept) | | the paw taps the tortoise; the card stretches; three dots pop onto the ribbon as each sound begins | Or I can say it slowly... «sun~» | |
| fm_same_word (kept) | | the card snaps back | Fast or slow, it's the same word. Sun! | |
| tv_spd_sounds | | the three dots pulse in turn | When I say it slowly, I can hear its sounds. | |
| tv_turn | | the tortoise pulses | Now it's your turn. | |
| tv_spd_turn_slow | | | Tap the tortoise, and say it slowly with me. | taps the tortoise; says "sssuuunnn" |
| (the tortoise) | | «sun~»; the ninja's slow kata | «sun~» | |
| tv_spd_slow_ok | | | You said it slowly, like the tortoise. | |
| ◇ tv_spd_turn_fast | | the rabbit pulses | Now tap the rabbit, and say it fast. | taps; says "sun" |
| ◇ tv_spd_fast_ok | | «sun»; the ninja's dash | That was fast, like the rabbit. | |

*Budget: 11.5 s before the question ends; ▶ is live from 9.7 s. Two cards pop in during it. Longest run: 4.4 s.*

**The first sound (a show).** This is where the child meets their first petal, so Sensei names it. The Next hold that ends this beat today goes: the Ready hold of the next game does that job.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_ntc_start | | sun and sock slide side by side, each with its three dots; the ninja cups its ear | Now let's listen to the very start of sun and sock. | watches |
| (clips) | | the first dot of each swells gold as its word plays | «s-sun» «s-sock» | |
| tv_ntc_same | | | They both start with the same sound... /s/ | |
| (the petal) | on /s/ | the /s/ petal arrives in the nav row with its introduction animation (mist, colour, the picture pops) | | |
| tv_ntc_petal | | the petal breathes | Look, that sound has its own petal. | |
| tv_say_with_me | | the petal swells on /s/; then 1.5 s of quiet | Say it with me. /s/ | says /s/ |

**Game 3: Fill the Pockets (tap all that start with /s/).** Today the pockets are never explained, and the child's instruction is spoken inside Sensei's own demo.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pk_frame | | sausage and moon drop in beside sun, sock and cat; three dashed pockets appear on the right and glow | Now let's fill these pockets. | |
| tv_pk_start | | the /s/ petal swells | We're looking for pictures that start with... /s/ | |
| tv_pk_how | | | I'll find one first. Then you find the rest. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_sausage (kept) | | the sausage spotlit | This is a sausage. | |
| fm_name_moon (kept) | | the moon spotlit | This is the moon. | |
| tv_show_paw | | the paw goes to the sun | Watch my paw. | watches |
| (clip) | | the sun's first dot glows | «s-sun» | |
| fs_sun (kept) | | the petal swells | Sun starts with... /s/ | |
| tv_pk_in | | the paw taps the sun; a mini-card flies into the first pocket; a shuriken pins a star | So it goes in a pocket. | |
| tv_turn | | the two empty pockets pulse | Now it's your turn. | |
| tv_pk_turn_rest | | | Can you find the other two? | taps sock, then sausage |
| (each find) | | «s-sock» / «s-sausage»; a mini-card flies to a pocket; a shuriken | | |
| (a wrong card) | | the card wobbles and plays its held or plain word | «m-moon» · fm_diff_moon (kept): Moon starts with a different sound. | |
| tv_pk_keep | after a wrong card | the petal swells | Let's keep looking for... /s/ | |
| tv_w1_filled | both found | the pockets glow | You filled the pockets! Sock and sausage start with... /s/ | |

*Budget: 10.1 s before the question ends. From the Ready tap to the child's turn: 8.9 s. Longest run: 5.3 s.*

**The end of W1.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_w1_done | | every bead lit; the sticker bead bursts; the ninja celebrates | That's the end of Ninja Ears. You listened really carefully. | |
| tv_w1_link | | the five cards rise into a fan | Now watch what happens to your pictures. | (Reward 1) |

*W1 as a whole: about 235 words, or 87 s of speech plus about 8 s of sound and word clips. For a quick child with the rabbit dropped, that's about 105–110 s. §4.2 gives the order to cut in if the bot measures it over 115 s.*

### 1.4 Reward 1: the Sticker Book (Stickers.tsx)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_rw_look (kept) | | the cards flip into die-cut stickers | Look! Your pictures are turning into stickers! | |
| fm_rw_book (kept) | | the book swoops in and opens | This is your Sticker Book! | |
| fm_rw1_list (kept) | | each sticker lands on its word | Sun, sock, cat, sausage and moon! | |
| tv_rw_every | | the page glows; a big 5 badge | Every picture you play with becomes a sticker. | |
| tv_rw_tap | | the sun sticker wiggles; the hand points at it | Tap a sticker, and it will say its name. | taps a sticker |
| (the sticker) | | it pops and spins | «sun» «sun~» | |
| tv_rw1_link | | the book closes into the ninja's pack | Next, we're going to read some pictures, the ninja way. | |
| tv_rdy_next | | ▶ bounces | Are you ready for the next game? Tap the green arrow. | taps ▶ |

### 1.5 W2, Ninjas Read This Way (warmups.ts W2)

**Game 1: the reading rail.** Today "Ninjas read this way!" is a slogan said over an empty rail. Here the rail comes with its meaning, and the demo is Sensei's own reading.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rail_way | W2 starts | the bamboo rail slides in; the ninja runs along it, left to right, with a speed trail | Ninjas read this way. | watches |
| audit_left_right (kept) | | the arrow at the left end glows; a light sweeps along the rail | We start here, and go this way. | |
| tv_rail_how | | | I'll read some pictures first. Then you read them. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_fish (kept) | | the fish lands on the rail, spotlit | This is a fish. | |
| fm_name_dog (kept) | | the dog lands, spotlit | This is a dog. | |
| tv_rail_demo | | the ninja steps to the rail's start | I'll read them the ninja way. | watches |
| fm_read_fish_dog (kept) | | a light passes under each card on its word; the ninja runs along; the cards bump and merge into a fish-dog on "Fish dog!" | Fish... dog. Fish dog! | |
| tv_turn | | the fish-dog splits back; the fish pulses; the arrow glows | Now it's your turn. | |
| tv_rail_turn | | | Start here, and tap them this way. | taps fish, then dog |
| (the cards) | | «fish» «dog»; the merge | «fish» «dog» · fm_pair_fish_dog (kept): Fish dog! | |
| tv_rail_ok | | | You read them the ninja way. | |
| tv_rail_fix | the dog tapped first | the dog wiggles; the arrow pulses at the left; the fish glows | Ninjas start on this side. Tap this one first. | |

*Budget: 9.3 s before the question ends. Longest run: 3.3 s.*

**◇ The swap (a show).** fm_l2_swap (kept): "Whoops! Now they're the other way round. Dog... fish. Dog fish!" (the ninja leapfrogs the cards). Then r2_dog_fish (kept).

**Game 2: Which Row Did I Read?** Today this demo is dropped when the lesson is behind. On a first meeting it's never dropped (mechanics.md §5.4).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_which_frame | | two small rails stack up: fish-dog on top, dog-fish below | Now there are two rows of pictures. | |
| tv_which_how | | each row glows in turn | I'll read one row. You tap the row I read. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| fm_read_fish_dog (kept) | | a light passes under the top row, card by card | Fish... dog. Fish dog! | |
| tv_which_so | | the paw taps the top row; its light sweeps; a crown of stars | Fish came first. So I tap this row. | |
| tv_turn | | the rows change: cat-dog on top, dog-cat below | Now it's your turn. | |
| tv_which_cat_dog | | | Cat... dog. Which row did I read? | taps a row |
| fm_pair_cat_dog (kept) | right | the row's light sweeps; stars | Cat dog! | |
| tv_which_ok | | | Cat came first. You found the right row. | |
| tv_which_fix | a wrong row, first time | the rows wobble gently | Let's listen again. Cat... dog. Which row has the cat first? | taps |

*Budget: 8.5 s. Longest run: 3.7 s.*

**Game 3: Big Words (compound words).** The tortoise and rabbit come back, and Sensei's demo no longer gives the child orders ("Say them slowly…").

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_big_frame | | sun and flower slide onto the rail; the tortoise and rabbit pop up beside it | Two little words can make one big word. | |
| tv_big_how | | | I'll make one first. Then you make one. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_flower (kept) | | the flower spotlit | This is a flower. | |
| tv_big_demo | | the paw taps the tortoise on "Slowly" (the cards light in turn), then the rabbit on "Fast"; the cards zip together and bloom into a sunflower | Slowly, like the tortoise: sun... flower. Fast, like the rabbit: sunflower! | watches |
| tv_turn | | star and fish slide onto the rail | Now it's your turn. | |
| fm_name_star (kept) | | the star spotlit | This is a star. | |
| tv_big_starfish_q | | the rabbit pulses | Star... fish. Tap the rabbit, and say it fast. | taps the rabbit; says "starfish" |
| fm_starfish (kept) | | the ninja throws its golden star onto the fish: a waving starfish | Starfish! | |
| tv_big_ok | | | You made a big word. | |

*Budget: 7.8 s.*

**◇ Fill the Pockets, quick (the short form: the child played it minutes ago).**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pk_again | | sunflower, sock, fish and dog in a 2×2 grid; two pockets; the /s/ petal | Let's fill the pockets again. Find the pictures that start with... /s/ | taps sunflower and sock |
| fm_found_both (kept) | | | You found them both! They both start with... /s/ | |

**The end of W2.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_l2_done (kept) | | every bead lit | You read the pictures, just like a real reader! | |
| tv_rw_link_book | | the cards rise | Let's put your new pictures in your Sticker Book. | (Reward 2) |

### 1.6 Reward 2, the first petal and the first map

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_rw2_list (kept) | | the book opens; six stickers fly in | Fish, dog, flower, sunflower, star and starfish! | |
| fm_rw_shiny (kept) | | the shiny fish-dog lands with a rainbow sweep | Ooh, a shiny sticker! Fish dog! | |
| fm_rw2_s (kept) | | the /s/ stickers hop, their first dots gold | Sun, sock, sausage and sunflower. They all start with... /s/ | taps ▶ |
| fm_rw2_petal (kept) | | the World Flower; the /s/ petal blooms through the mist | You found your very first sound! Look, its petal is shining through the mist. | |
| audit_petal_means (kept) | | the petal lifts out of the flower and swells | This petal is for the sound... /s/ | taps ▶ |
| fm_rw2_map (kept) | | the book flies into the map's Sticker Book button | Your Sticker Book lives here, on the map! | |
| tv_map_first | first map, once per save | the stones glow in a wave from the first | This is the map. Every stone is a game. | |
| tv_map_hint | the first two map visits of a save | the next stone bounces; the hand points at it | The glowing stone is your next game. Tap it when you're ready. | taps the stone |

The map also says `world_1` once, on the child's first arrival in the land in a session. It never says it again after a level (SCRIPT_FIXES C6).

### 1.7 W3, Ninja Ears again (warmups.ts W3)

**Tortoise and Rabbit (the short form: the child played it minutes ago; mechanics.md §6.1 keeps W3's own teaching show).**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_ears_again | W3 starts | the mug drops in | It's Ninja Ears again. Let's listen to some more words. | |
| fm_name_mug (kept) | | the mug spotlit | This is a mug. | |
| tv_spd_back | | the rabbit and tortoise pop in either side | Here are my rabbit and my tortoise again. | |
| fm_fast_mug (SCRIPT_FIXES Part B) | | the paw taps the rabbit | I can say a word fast. Mug! | watches |
| fm_slow (kept) | | the paw taps the tortoise; the card stretches | Or I can say it slowly... «mug~» | |
| tv_turn, tv_spd_turn_slow | | the tortoise pulses | Now it's your turn. · Tap the tortoise, and say it slowly with me. | taps; says it |
| tv_spd_slow_ok | | | You said it slowly, like the tortoise. | |
| tv_spd_wrong_rabbit | the rabbit tapped instead | the rabbit plays «mug»; the tortoise pulses | That's my rabbit. It says words fast. Tap the tortoise to say it slowly. | taps the tortoise |

**Slow Words, the first meeting.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_slow_name | | van and bag drop in beside the mug | This game is called Slow Words. | |
| tv_slow_how | | the tortoise waves from the corner | I'll say a word slowly, like my tortoise. You find its picture. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_van, fm_name_bag (kept) | | each spotlit | This is a van. · This is a bag. | |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| tv_slow_demo | | the ninja in bullet time | My slow word is... «mug~» | |
| (clip) | | the paw taps the mug on the word | «mug» | |
| tv_slow_so | | | It's the mug. There it is. | |
| tv_turn | | | Now it's your turn. | |
| tv_slow_yours | | | Here's your slow word... «van~» | |
| fm_which_pic (kept) | | | Which picture is it? | taps the van |
| (the card) | | «van~» then «van»; a bullet-time gift | «van~» «van» | |
| tv_slow_ok | | | You heard the slow word. | |

*Budget: 8.5 s.*

**Fill the Pockets: a sound in the middle, the first meeting (`tapall:in`).** Today, "a sound in it" is new and never explained.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pk_again_short | | cat, bag, jam, van, sun and dog; four pockets | Let's fill the pockets again. | |
| tv_pk_in_how | | the middle dot under each card glows faintly | This time, we listen for a sound in the middle of the word. | |
| tv_here_sound | | the /a/ petal arrives with its introduction animation | Here's the sound... /a/ | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_jam (kept) | | the jam spotlit (the others are known) | This is some jam. | |
| tv_show_paw | | the paw goes to the cat | Watch my paw. | watches |
| (clip) | | the cat's middle dot glows under the stretch | «cat~» | |
| tv_pk_in_demo | | | I can hear it in the middle. | |
| tv_pk_in | | the paw taps the cat; a mini-card flies into a pocket | So it goes in a pocket. | |
| tv_turn | | | Now it's your turn. | |
| tv_pk_turn_three | | three pockets pulse | Can you find the other three? | taps bag, jam, van |
| fm_not_in_dog (kept) | a wrong card | «dog~»; the card wobbles | Dog doesn't have that sound in it. | |
| tv_pk_keep | | the petal swells | Let's keep looking for... /a/ | |
| fm_found_all (kept) · t_they_all_have (kept) | all found | | You found them all! · They all have the sound... /a/ | |

*Budget: 9.8 s.*

**Fill the Pockets: the first sound (the short form).**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_name_map (kept) | | the map drops in with mug, moon, sun and cat | This is a map. | |
| tv_pk_short_start | | the /m/ petal arrives with its introduction animation | Now fill the pockets with pictures that start with... /m/ | taps mug, moon, map |
| fm_all_start (kept) | | | They all start with... /m/ | |
| tv_w3_done | | every bead lit | You heard sounds at the start of words, and in the middle. | |

### 1.8 W4, Ninjas Read This Way again (warmups.ts W4)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rail_three | W4 starts | the rail slides in; the ninja runs it | Ninjas read this way. This time, there are three pictures. | |
| tv_rail_demo_short | | cat, dog and fish land on the rail | I'll read them first. | watches |
| fm_read_cat_dog_fish (kept) | | a light under each card | Cat... dog... fish. Cat-dog-fish! | |
| tv_turn, tv_rail_turn | | the cat pulses | Now it's your turn. · Start here, and tap them this way. | taps cat, dog, fish |
| fm_triple_cat_dog_fish (kept) | | | Cat dog fish! | |
| fm_l4_swap (kept) | a show | the ninja leapfrogs; the cards swap | Now they're the other way round. Fish... dog... cat. Fish dog cat! | |
| tv_which_short | | two rows stack | Two rows again. Tap the row I read. | |
| tv_which_fdc | | | Fish... dog... cat. Which row did I read? | taps a row |
| fm_triple_fish_dog_cat (kept) | right | | Fish dog cat! | |
| tv_big_again | | rain and bow slide onto the rail; the rabbit waits | Let's make some more big words. | |
| fm_name_rain, fm_name_bow (kept) | | | This is rain. · This is a bow. | |
| tv_big_rainbow_q | | the rabbit pulses | Rain... bow. Tap the rabbit, and say it fast. | taps; says it |
| fm_rainbow (kept) | | | Rainbow! | |
| fm_name_snow, fm_name_man (kept) · tv_big_snowman_q | | | This is snow. · This is a man. · Snow... man. Tap the rabbit, and say it fast. | taps; says it |
| fm_snowman (kept) | | | Snowman! | |
| tv_w4_done | | every bead lit | You read three pictures in a row, the ninja way. | |

**If W4 is repeated** (under 50% first try in two lessons), the repeat opens with **tv_repeat_why**: "That game was a bit tricky. Let's play it once more." It's said as the level opens, not on the map, where it's cut off today. The repeat then plays in the short forms.

### 1.9 W5, Guess My Word (the first meeting; warmups.ts W5)

Today there are 45 words and 17 s of talk before the first turn. The line that says who does what comes after "Let me show you!", and the naming runs straight into another word's sounds.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_guess_name | W5 starts | sun and dog drop in | This game is called Guess My Word. | |
| tv_guess_how_1 | | three grey dots appear under the cards | I'll say the sounds in a word. | |
| tv_guess_how_2 | | | You listen for the word, and find its picture. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_sun, fm_name_dog (kept) | | each spotlit | This is the sun. · This is a dog. | |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| tv_guess_demo_lead | | the dots light one per sound (no petals: Dec1) | The sounds are... /s/ /u/ /n/ | |
| tv_guess_demo_hear | | the paw taps the sun | I can hear sun. So I tap the sun. | |
| tv_turn | | map, mop and man drop in | Now it's your turn. | |
| fm_name_map, fm_name_mop, fm_name_man (kept) | | each spotlit | This is a map. · This is a mop. · This is a man. | |
| tv_guess_q | | the dots light as the sounds play | Listen for the word... /m/ /a/ /p/ | |
| fm_which_pic (kept) | | | Which picture is it? | taps the map |
| (the card) | | «map» | «map» | |
| tv_guess_together | the first right answer only | the dots light again | Let's say it together. /m/ /a/ /p/ «map» | says it |
| (each later item) | | new cards named as they appear | tv_guess_q + sounds (+ fm_which_pic, dropped after two first tries in a row) | taps |
| tv_guess_fix | a wrong card | the card says its word | That's the {mop}. Listen again... /m/ /a/ /p/ | taps |
| tv_w5_done | | every bead lit | You listened to the sounds, and heard every word. | |

*Budget: 10.4 s. Longest run: 3.3 s.*

### 1.10 W6, Sound Dots (the first meeting; warmups.ts W6)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_dots_frame | W6 starts | the sun card with three grey dots under it; the dots glow in turn | Look at the dots under this picture. | |
| tv_dots_what | | | Every dot is one sound in the word. | |
| tv_dots_how | | | I'll tap them first. Then it's your turn. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| tv_dots_demo | | the paw at the first dot; the arrow glows under the dots | I start here, and go this way. | watches |
| (clips) | | the paw taps each dot; each becomes its sound's mini petal as it sounds (SOUND_DISPLAY A4); then the paw sweeps under all three | /s/ /u/ /n/ «sun» | |
| tv_dots_hear | | the three mini petals glow together | If you say the sounds, you can hear the word. | |
| tv_turn | | the cat card and its dots; the first dot pulses | Now it's your turn. | |
| tv_dots_turn | | | Tap the dots this way, and say the sounds with me. | taps /k/ /a/ /t/; says them |
| tv_dots_word | | 1.5 s of quiet, then the sweep plays the word | Now say the whole word. «cat» | says "cat" |
| tv_dots_turn_short | the next words | the first dot pulses | Your turn. Tap the dots, and say the sounds. | taps |
| tv_dots_fix | a dot tapped out of order | the first dot pulses; the arrow glows | Ninjas start on this side. Tap this dot first. | |
| fm_l6_done (kept) | | every bead lit | Now you're ready to find out how we write the sounds! | |

*Budget: 10.4 s.*

### 1.11 w1-2, First Sounds (the first meeting) and the first letters (Early.tsx `FirstSoundLevel`)

Today the introduction is said over the map fade. The demo's question is answered by the paw, and the first letter a child sees arrives in one line. Here the level speaks only once it's on screen (Dec5), and the letter is shown being written.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_name | the level is on screen | the dojo room; two empty card spots | This game is called First Sounds. | |
| tv_first_what | | | Every word starts with a sound. | |
| tv_first_how | | | I'll say a sound. You find the picture that starts with it. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_map, fm_name_hat (kept) | | two cards drop in, each spotlit | This is a map. · This is a hat. | |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| tv_my_sound | | the /m/ petal arrives in the nav row with its introduction animation | My sound is... /m/ | |
| (clip) | | the paw goes to the map | «m-map» | |
| fs_map (kept) | | the paw taps the map; the ninja strikes | Map starts with... /m/ | |
| tv_ninja_write | | the ninja casts; the spell writes m on the first line under the map | Now watch my ninja write that sound. | |
| tv_way_write | | the letter glows; the petal swells on /m/ | This is the way we write... /m/ | |
| tv_together | | cup and mop drop in | Let's do the next one together. | |
| fm_name_cup, fm_name_mop (kept) | | each spotlit | This is a cup. · This is a mop. | |
| first_q (kept) | | the petal swells; after 2 s the mop glows (the "together") | Which one starts with... /m/ | taps the mop |
| fs_mop (kept) | | the m appears under the mop with no line (SCRIPT_FIXES C9) | Mop starts with... /m/ | |
| tv_on_your_own | | mug and zip drop in | Now try one all by yourself. | |
| fm_name_mug, fm_name_zip (kept) | | | This is a mug. · This is a zip. | |
| st_first_q2 (SCRIPT_FIXES A5) | | | Which picture starts with... /m/ | taps the mug |
| fs_mug (kept) | | | Mug starts with... /m/ | |
| tv_praise_start | | | You listened right to the start of the word. | |
| ◇ (a second "by yourself") | | two new cards | (names) · first_q /m/ · fs_{w} /m/ | taps |
| tv_new_sound | | the pictures fly off | Now here's a new sound. | |
| tv_watch_one | | the paw returns | Watch me do this one. | watches |
| fm_name_bed, fm_name_sock (kept) | | | This is a bed. · This is a sock. | |
| tv_my_sound | | the /s/ petal pops in (already known: no introduction) | My sound is... /s/ | |
| (clip) · fs_sock (kept) | | the paw taps the sock | «s-sock» · Sock starts with... /s/ | |
| tv_way_write | | the ninja writes s under the sock | This is the way we write... /s/ | |
| tv_together → sand/van → first_q → fs_sand | | the sand glows after 2 s | Let's do the next one together. · This is some sand. · This is a van. · Which one starts with... /s/ · Sand starts with... /s/ | taps the sand |
| tv_on_your_own → cat/sun → st_first_q3 → fs_sun | | | Now try one all by yourself. · (names) · Find the one that starts with... /s/ · Sun starts with... /s/ | taps the sun |
| tv_first_mixed | before the first mixed pair | mat and sand (one of each sound) | Now it could be either sound. Listen carefully to my sound. | |
| (4 mixed items) | | | first_q / st_first_q2 / st_first_q3, rotating (A5), + the sound · fs_{w} + the sound | taps |

**Find the Way We Write It (the find phase, the first meeting).** Today it says "Find this sound…" four times over letter tiles, with no word that the game has changed.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_find_frame | | the pictures fly away; two letter tiles drop in: m and s | Now let's find how we write each sound. | |
| tv_find_how | | | I'll say a sound. You tap the way we write it. | |
| tv_find_q | | the /m/ petal in the nav row; the m tile glows after 2 s on this first item (a "together": no show, no Ready hold, mechanics.md G13) | Which one is the way we write... /m/ | taps m |
| (the tile) | | it lights and says its sound; the ninja strikes | /m/ | |
| tv_find_q2, tv_find_q3 (rotating) | the next items | | Can you find the way we write... /s/ · Now find the way we write... /m/ | taps |
| tv_praise_find | every second right answer | | You know how we write that sound. | |
| tv_first_done | | the level's last tile glows | You found the first sound in every picture. | |
| tv_first_done_2 | | m and s glow side by side | And now you know how to write two sounds. | (the reward) |

*Budget: 10.7 s before the Ready question ends. The demo runs 9.6 s, with five visual events. The find frame is 7 s before the question.*

### 1.12 The reward after w1-2, and the first World Flower visit

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rw_lets_see | the reward opens | the reward panel | Let's see what you've won. | |
| tv_rw_won_2 | | two petals rise into the panel, each swelling on its sound (SOUND_DISPLAY r58, Dec8) | You won back two new sounds. /m/ /s/ | |
| tv_to_flower_first | | ▶ | Now let's go and see where your sounds live. Tap the green arrow. | taps ▶ |
| flower_i1 (kept) | | the World Flower, dark, its petals in the mist | This is the World Flower. Baron Muddle blew all its petals away! | taps ▶ |
| tv_flower_i2 | | the child's /s/ petal glows (not /a/: SCRIPT_FIXES C8) | Every petal is one sound. This is the petal for the sound... /s/ | taps ▶ |
| tv_flower_i3 | | a gem glints inside the petal | Inside each petal are shiny gems. Each gem is a way to write the sound. | taps ▶ |
| st_found_new_sounds (SCRIPT_FIXES Part B) | | the /m/ and /s/ petals shine through the mist | You found some new sounds! Look, here are their petals, shining through the mist. | taps ▶ |
| tv_way_write · tg_m_m_see (kept) | | the /m/ petal big; its gem shows m | This is the way we write... /m/ · We see this spelling in man and map. | taps ▶ |
| st_another_new_sound · tv_way_write · tg_s_s_see (kept) | | the /s/ petal big | And here's another new sound! · This is the way we write... /s/ · We see this spelling in sun and bus. | taps ▶ |

### 1.13 w1-3, First Sounds again (the short form)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_again | the level is on screen | | It's First Sounds again, with two new sounds. | |
| tv_watch_one | | the paw appears | Watch me do this one. | watches |
| fm_name_cat, fm_name_apple (kept) | | | This is a cat. · This is an apple. | |
| tv_my_sound | | the /a/ petal with its introduction animation | My sound is... /a/ | |
| (clip) · fs_apple (kept) | | the paw taps the apple | «a-apple» · Apple starts with... /a/ | |
| tv_learn_write · tv_way_write | | the ninja writes a | Now watch my ninja write it. · This is the way we write... /a/ | |
| tv_together … tv_on_your_own … | | as in w1-2 | (as in w1-2, with pig/ant, fan/apple) | taps |
| tv_new_sound · tv_watch_one · (tent/jam) · tv_my_sound /t/ · «tent» · fs_tent /t/ · tv_way_write /t/ | | /t/ can't be held, so the plain word plays | (as above) | watches |
| (the together, by yourself and mixed items) | | | (as in w1-2) | taps |
| tv_find_short | the find phase | letter tiles | Now find the way we write each sound. | |
| tv_find_q … | | | (rotating, as in w1-2) | taps |
| tv_first_done · tv_first_done_2 | | | You found the first sound in every picture. · And now you know how to write two sounds. | |

The reward and trip follow the pattern in §1.12, without flower_i1–i3: tv_rw_lets_see · tv_rw_won_2 /a/ /t/ · st_found_new_sounds · tv_way_write /a/ · tg_a_a_see · st_another_new_sound · tv_way_write /t/ · tg_t_t_see.

### 1.14 w1-4, Building Words and Who Read It Right? (the first meetings; Early.tsx `BuildSequence`, `ReadCheck`)

Today it's 75 words and 31 s before the child's first turn, and "This word has two sounds!" comes before there's a word on screen.

**Building Words.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_frame | the level is on screen | the dojo; a word card with a speaker; two dashed lines; the letters a and m in the bank (not tappable yet) | In the dojo, we build words. | |
| tv_build_how_1 | | the word card glows | I'll say a word. | |
| tv_build_how_2 | | the lines glow, then the letters | Then you find its sounds, and put them on these lines. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| tv_build_myword | | the word card glows | My word is... «am» | |
| tv_find_each | | the first line lights | Now I find each sound. | |
| (the demo) | | the first line lit: «am~»; the paw points at a; the ninja launches it onto the line; then the second line: «am~», the paw at m, and it goes home | «am~» /a/ · «am~» /m/ | |
| tv_read_i | | the paw sweeps under the word; the sound buttons light in turn | Now I say the sounds, and read the word. /a/ /m/ «am» | |
| tv_together_build | | the letters fly back to the bank | Now let's build it together. | |
| first_sound_q (kept) | | the first line glows; a glows after 2 s | What's the first sound? «am~» | taps a |
| (the tile) | | the ninja launches it home | /a/ | |
| tv_last_first | the first time per save | the last line glows | Now listen right to the end of the word... «am~» | |
| last_sound_q (kept) | | | What's the last sound? | taps m |
| (the tile) | | | /m/ | |
| tv_lr_words | the first read-back of a save | a light sweeps under the word, left to right | Just like the pictures, we read this way. | |
| say_sounds_read (kept, re-recorded calm) | | the sound buttons light in turn | Say the sounds, and read the word. /a/ /m/ «am» | says it |
| tv_gem_first (in place of audit_gem_first; held on ▶) | the first gem of the save | a gem pops up beside the word and fills | Look, a gem! Each gem holds a way to write a sound. When you build words, it fills up. | taps ▶ |
| tv_build_own | | the letters fly back | Now you build it, all by yourself. | |
| first_sound_q · last_sound_q · say_sounds_read | | no glow this time | (as above; "Listen right to the end" is not said again) | taps a, m; says it |
| tv_next_word · tv_build_word | | a new word card | Here's a new word. · Your word is... «at» | builds at |
| (later words) | | | tv_build_word «w»; the slot questions fade after two first tries in a row (SCRIPT_FIXES A6) | builds |

*Budget: 9.6 s. The demo runs 12–14 s: the paw and the ninja move all through it, and there are five visual events.*

**Who Read It Right? (Kai and Suki, the first meeting).** Today Kai and Suki are never introduced, and "Who read it right?" is asked before they've read.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rc_meet | | a written word (am) with sound buttons under it; Kai and Suki slide in either side, each waving as named | Here are Kai and Suki. | |
| tv_rc_how | | both readers look at the word | They'll both read this word. Only one of them reads it right. | |
| tv_rc_you_first | | the sound buttons glow | First, you read it. Tap each sound, and say it with me. | taps /a/ /m/; says them |
| tv_rc_listen | | Kai and Suki turn to the child | Now listen to Kai and Suki. | |
| kai_says, suki_says (kept) | | each reader lights as they read | Kai says... «at» · Suki says... «am» | |
| tv_rc_q | | both readers glow | Who read it right? Tap Kai, or tap Suki. | taps Suki |
| (right) | | Suki cheers; the buttons light | /a/ /m/ «am» | |
| tv_rc_ok_suki / tv_rc_ok_kai | | | Yes, Suki read it right. / Yes, Kai read it right. | |
| tv_rc_check | a wrong reader, first time | the buttons glow | Let's check. Say the sounds with me. /a/ /m/ «am» | says them; taps again |

*Budget: 10.7 s before the child can tap a button.*

**The end of w1-4:** tv_build_done "You built two words all by yourself. And you helped Kai and Suki." Then the reward (§3.9).

### 1.15 w1-5, Building Words again (the short form)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_again | the level is on screen | three dashed lines; the letters m, a, t | Let's build some more words. These ones have three sounds. | |
| tv_watch_one_build | | the paw appears | Watch me build the first one. | watches |
| tv_build_myword · «mat~» · tv_hear_three | | the three lines glow | My word is... «mat» · «mat~» · I can hear three sounds. | |
| tv_find_each · (the demo) · tv_read_i | | as in w1-4 | Now I find each sound. · «mat~» /m/ · «mat~» /a/ · «mat~» /t/ · Now I say the sounds, and read the word. /m/ /a/ /t/ «mat» | |
| tv_together_build · first_sound_q · next_sound_q · last_sound_q · say_sounds_read | | | (as in w1-4) | builds mat |
| tv_build_own · tv_build_word «sat» … | | | (as in w1-4) | builds |
| tv_rc_again | the reading check | Kai and Suki slide in | Kai and Suki are back. Tap each sound, and say it with me. | taps; then chooses a reader |
| tv_rc_listen · kai_says · suki_says · tv_rc_q | | | (as in w1-4) | |

### 1.16 w1-6, Monster Battle (the first meeting; Battle.tsx)

Today the letters can be tapped from the first frame, and the only framing is the stakes. The bar is never explained, and "Spell…" is the child's first instruction.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_bt_oh | the level is on screen | the monster drops in with a thud; a four-block bar top right; the word card; two lines; the letters s, a, t (locked) | Oh no. One of Baron Muddle's monsters is in the way. | |
| tv_bt_how | | the ninja takes its fighting stance | Let's zap it with words. I'll build the first one. | |
| tv_rdy_q | | ▶ in the right-hand column (the letters fill the nav row) | Ready? Tap the green arrow. | taps ▶ |
| tv_build_myword | | the word card glows | My word is... «at» | watches |
| tv_find_each | | | Now I find each sound. | |
| (the demo) | | «at~»; the paw at a; the ninja strikes the monster as /a/ plays; «at~»; the paw at t; a strike on /t/ | «at~» /a/ · «at~» /t/ | |
| (read) | | the sweep; the monster flinches; one block of the bar goes | /a/ /t/ «at» | |
| tv_bt_bar | | the bar glows | Zap! Look, its bar went down. | |
| tv_turn | | the letters shuffle and wake up; a new word card | Now it's your turn. | |
| tv_build_word | | | Your word is... «am» | builds am |
| (each right letter) | | a strike; the bar drops when the word is done | /a/ · /m/ · /a/ /m/ «am» | |
| tv_build_word, then tv_next_word_short | later words | | Your word is... «sat» · (after two first tries in a row:) Next word... «mat» | builds |
| battle_win (kept) | | the monster runs off | Hooray! The monster ran away! | |

*Budget: 9.3 s. The letters wake up only on "Now it's your turn."*

### 1.17 w1-7, Sound Hunt (the first meeting), then Building and Kai and Suki (the short forms)

Today there are 68 words before the first tap, with an abstract definition ("after the first sound, and before the last sound") said over an empty dojo. Here "the middle" is shown, not defined.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_hunt_name | the level is on screen | the dojo room | This game is called Sound Hunt. | |
| tv_hunt_how | | | I'll say a sound. You find the picture with that sound in the middle. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |
| fm_name_pan, fm_name_pin (kept) | | each spotlit | This is a pan. · This is a pin. | |
| tv_show_first | | the paw appears | I'll go first. Watch my paw. | watches |
| tv_my_sound | | the /i/ petal with its introduction animation | My sound is... /i/ | |
| tv_hunt_slow | | | I'll say them both slowly. | |
| (clips) | | each card spotlit as it's said; under the pin, three lines appear and the middle one glows through the stretch | «pin~» «pan~» | |
| mid_pin (kept) | | the paw taps the pin | Pin has this sound in the middle... /i/ | |
| tv_ninja_write · tv_way_write | | the spell writes i on the pin's middle line | Now watch my ninja write that sound. · This is the way we write... /i/ | |
| tv_together | | tap and tin | Let's do the next one together. | |
| tv_hunt_q | | the tin glows after 2 s | Which one has this sound in the middle... /i/ «tin~» «tap~» | taps the tin |
| mid_tin (kept) | | the i appears (no line) | Tin has this sound in the middle... /i/ | |
| tv_on_your_own · tv_hunt_q | | lid and mat | Now try one all by yourself. · Which one has this sound in the middle... /i/ «lid~» «mat~» | taps the lid |
| mid_lid · tv_praise_middle | | | Lid has this sound in the middle... /i/ · You heard it right in the middle. | |
| tv_build_with | the build phase | two lines; the letters i, t | Now let's build some words with that sound. | |
| tv_watch_one_build · (the demo on it) · tv_together_build · … | | | (as in §1.15) | builds it, sit |
| tv_rc_again … | the reading check | | (as in §1.15) | |
| tv_hunt_done | | | You found the sound in the middle. That was tricky! | |

*Budget: 9.3 s.*

### 1.18 w1-8, Sound Swap (the first meeting; Swap.tsx)

Today the tiles can be tapped during the introduction, there's no demo, and the line naming the place ("Yes, the first sound changes!") is cut off 3 times out of 3.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_swap_name | the level is on screen | mat on three lines, with its picture; Baron peeks in top right; the choice tiles are hidden; nothing can be tapped | This game is called Sound Swap. | |
| tv_swap_how | | the three letters glow in turn | We change one sound to make a new word. | |
| tv_rdy_first | | ▶ | I'll do the first one. Ready? Tap the green arrow. | taps ▶ |
| tv_swap_demo_1 | | the paw appears | This is mat. I want to change it to sat. | watches |
| (clips) | | the first line glows under each stretched word | «mat~» «sat~» | |
| tv_swap_demo_2 | | the paw taps m; the ninja kicks it out on "out" | The first sound changes. So I take it out. | |
| tv_swap_demo_3 | | the new letters pop up; the paw taps s; it flies into the gap | And I put in the new sound. /s/ | |
| tv_read_i | | the sweep; the picture turns into sat; a star bonks Baron | Now I say the sounds, and read the word. /s/ /a/ /t/ «sat» | |
| tv_turn | | | Now it's your turn. | |
| swap_make (kept) | | the target card | Change it to make... «sit» | |
| tv_swap_listen | | the lines glow under the stretches | Listen to them both... «sat~» «sit~» | |
| st_what_change (SCRIPT_FIXES Part B) | | the letters wake up | What do we need to change? | taps a |
| st_middle_changes (protected: the choices wait for it) | | the middle line glows; the ninja kicks a out | Yes, the middle sound changes. | |
| swap_pick (kept) | | the new letters pop up and wake | Now pick the new sound. | taps i |
| (read) | | the sweep; the picture changes | /s/ /i/ /t/ «sit» | |
| tv_praise_swap | every second step | | You changed just one sound. | |
| swap_make + «w» (the later steps) | | | Change it to make... «sat» (the stretched pair and the question come back after a miss: SCRIPT_FIXES C11) | taps twice |
| tv_swap_fresh · this_is (kept) | the chain starts again (mat → am) | a new word | Here's a new word. · This is... «am» | |
| tv_swap_done | | Baron runs off | You swapped one sound each time, and made new words. | |

*Budget: 9.3 s. The demo runs about 11 s, and every sentence lands on a movement.*

### 1.19 w1-9, Ninja Run (the first meeting; Run.tsx)

Today there's one line ("Ninja Run! Tap to jump, and catch the right word!"), and 114 words of cues follow it. Here the jump and the lanterns are each explained when they first appear.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_run_name | the level is on screen | the ninja on the start line, jogging on the spot; the world is still | This is Ninja Run. | |
| tv_run_how | | | Your ninja runs all by itself. You help it catch lanterns. | |
| tv_rdy_go | | ▶ | Ready? Tap the green arrow, and off we go. | taps ▶; the world starts moving |
| tv_run_jump | the first crate ahead, once per save | the ninja slows; the crate glows | Tap anywhere, and your ninja jumps. | taps; it jumps |
| tv_run_lanterns | the first lanterns arrive; the ninja stops in its ready stance | two lanterns with written words | Here come the lanterns. I'll say the sounds of a word. | |
| tv_run_which | | the lanterns bob | Tap the lantern with that word. | |
| tv_run_listen | | neutral dots light in the banner, one per sound (no petals: Dec1) | Listen for the word... /s/ /i/ /t/ | taps the sit lantern (it glows after 2 s the first time) |
| (catch) | | a flying leap; the lantern bursts; the word lights sound by sound | /s/ /i/ /t/ «sit» | |
| tv_run_listen, then tv_run_sounds | the next words | | Listen for the word... + sounds · Here are the sounds... + sounds · from the fourth word: the sounds alone | taps |
| tv_run_fix | a wrong lantern | the ninja hops back, puzzled | That's a different word. Listen again... /m/ /a/ /t/ | taps |
| run_end (kept) | | the gong | Bong! You made it to the gong! | |

*Budget: 8.5 s. The run's starting gun (▶) stays on every run (mechanics.md §10.8).*

### 1.20 w1-10, First Sounds with building; w1-11, Sound Hunt with building (the short forms)

These are the second plays in the land. In a later session they use the **recap** forms from §2 (G12, G14 and G15).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_again | w1-10 opens | | It's First Sounds again, with two new sounds. | |
| tv_watch_one · … /n/ … /p/ | | as in §1.13 (nut/hat, pig/bus) | (the I do for each new sound, then together, by yourself, mixed) | taps |
| tv_find_short · tv_find_q … | the find phase | | Now find the way we write each sound. · (rotating questions) | taps |
| tv_build_with · tv_watch_one_build · … | the build phase (an, nap, …) | | Now let's build some words with those sounds. · Watch me build the first one. · … | builds |
| tv_hunt_again | w1-11 opens | | It's Sound Hunt again, with a new sound. | |
| tv_watch_one · tv_my_sound /o/ · … | | map/mop, top/tap, cot/cat | (as in §1.17) | taps |
| tv_build_with · … · tv_rc_again · … | | on, pot, top, mop; top/tap … | (as in §1.15) | builds; reads |

### 1.21 w1-12, Sound Swap again; w1-13, Monster Battle again (the short forms)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_swap_short | w1-12 opens | sat, with its picture; Baron peeks in | It's Sound Swap. Baron Muddle has muddled some more words. Let's fix them. | |
| this_is · swap_make · tv_swap_listen · st_what_change · … | | | This is... «sat» · Change it to make... «sit» · … (the stretched pair and the question fade after two first tries) | taps |
| tv_bt_again | w1-13 opens | a new monster | Another monster. Let's zap it with words. | |
| tv_turn_short · tv_build_word | | the letters wake up | Your turn. · Your word is... «nip» | builds |
| battle_win (kept) | | | Hooray! The monster ran away! | |

### 1.22 w1-14, Story Time (the first meeting; Story.tsx)

Today "Story time! I'll read, and you read too." is said on the map. The ✓ "I read it!" is never explained, and "Let's think about the story…" is cut off.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_story_frame | the title page is on screen | the title page; ▶ in the right-hand column, dim | It's story time. I'll read some pages, and you'll read some pages too. | |
| (the title) | | the title highlights as it's read | [the story's title clip] | |
| tv_story_next | the first time per save | ▶ turns green and pulses | When you're ready, tap the green arrow to turn the page. | taps ▶ |
| (Sensei's page) | | karaoke highlight; the ninja acts it out; ▶ ready at the end | [the page clip] | taps ▶ |
| tv_story_yours | the child's first page | big words with sound buttons; the words glow in turn | This page is yours. Say the sounds, and read each word. | reads aloud |
| tv_story_tick | | the green tick ✓ spotlit | When you've read it, tap the green tick. | |
| tv_story_help | | a word wiggles | If you get stuck, tap the word, and I'll help. | taps ✓ |
| well_read (kept) | | | Well read! | |
| tv_story_yours_short | the child's later pages | | Your turn to read. | reads; taps ✓ |
| tv_story_choice | the first choice page | two words with pictures | Now you choose what happens. Read the two words, and tap one. | taps a word |
| tv_story_question | the first question page | three pictures | Now a question about the story. | |
| (the question) | | | [the story's question clip] | taps a picture |
| story_end (kept) | | | The end! What a story! | |

*Budget: 4.8 s plus the title.*

### 1.23 w1-15, Boss Battle (the first meeting)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| baron_w1 (kept, Baron) | the level is on screen | Baron's cut-in; the sumo panda lands; the letters are locked | So... a little ninja wants to stop me? My sumo panda will squash you! | |
| tv_boss_what | | the boss's long bar glows | This is a boss monster. It takes lots of words to zap it. | |
| tv_rdy_q | | ▶ in the column | Ready? Tap the green arrow. | taps ▶ |
| tv_turn_short · tv_build_word | | the letters wake up | Your turn. · Your word is... «top» | builds |
| battle_boss_win (kept) | | | You beat the boss! What a ninja! | |

*Budget: 5.7 s from Baron plus 6.7 s from Sensei, 12.4 s in all, with the cut-in and the landing as visual beats.*

### 1.24 The end of Bamboo Village

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| world_done (kept) | the boss's reward | | You found every sound in this land! Let's go to the next one! | |
| tv_to_flower | | ▶ | Let's go to the World Flower, and see your sounds. Tap the green arrow. | taps ▶ |
| wf_petals_you_know (kept) | | every met petal shines | Every shining petal is a sound that you know! | taps ▶ |
| tv_flower_recap | | the /o/ petal big | Here's a sound you learnt... /o/ | |
| tp_o_hear (kept) · tv_say_with_me | | | You can hear it in pot, top and mop. · Say it with me. /o/ | says /o/; taps ▶ |
| wf_world_new (kept) | | the next land's petals glint in the mist | New sounds are hiding in this land. Let's go and find them! | taps ▶ |
| world_2 (kept) | the map, Blossom Hills | | Welcome to Blossom Hills! | taps the stone |

(`t_remember_this`, "Do you remember this one?", goes: it's a question the child can't answer.)

### 1.25 w2-1, New Sounds: the first Dojo lesson (Dojo.tsx `Learn`, `Find`, `Build`)

This replaces the pulsing ear and the bare "Listen…" at the start of each sound. The screen opens with the lesson's petals in mist, not pulsing. No petal pulses before Sensei has said what it is (mechanics.md §7.4). The sounds come as a series, each shorter than the last (SCRIPT_FIXES C2).

**The frame.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_today_{n} | the level is on screen | the dojo; four petals in grey-lilac mist float in a row above the middle; the ninja bottom-left; nothing pulses | Today you'll learn four new sounds. | watches |
| (on "four new sounds") | | the misty petals twinkle one after another | | |
| tv_learn_how | | the ninja's hands glow | I'll say each one, and show you how we write it. | |
| tv_learn_you | | | Then you say it with me. | |
| tv_rdy_q | | ▶ | Ready? Tap the green arrow. | taps ▶ |

*Budget: 10.4 s; ▶ is live from 8.5 s.*

**The first sound, in full.**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_first | on the tap | the ninja bows; the first misty petal drifts down to the middle, still misty | Here's the first new sound. | watches |
| (the sound, twice) | after a 0.8 s beat | on the first /b/ the introduction animation plays (the mist wipes up, the colour fills, the ball pops, a ring and twinkles); on the second, the petal swells | /b/ … /b/ | |
| tv_learn_write | | the petal steps aside; the ninja casts; the letter b appears beside it | Now watch my ninja write it. | |
| tv_way_write | | the letter glows; the petal swells on /b/ | This is the way we write... /b/ | |
| tv_learn_turn_first | | the letter pulses | Now it's your turn. Tap it, and say it with me. | taps b; says /b/ |
| (the tap) | | the first mini-petal of the tally lights | /b/ | |
| tv_learn_once_more | | | And once more. | taps; says /b/ |
| (the tap) | | the second mini-petal lights; the ninja strikes | /b/ | |
| tv_praise_sound | | | You said that sound really well. | |
| tv_petal_tip | once per save | the /b/ petal pulses once | If you want to hear a sound again, tap its petal. | (may tap it: /b/) |

**The next sounds (the series: shorter each time).**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_next | | the second misty petal comes down | Here's the next new sound. | |
| (the sound, twice) | | the /k/ petal's introduction | /k/ … /k/ | |
| tv_learn_write | | the ninja casts; c appears | Now watch my ninja write it. | |
| tv_way_write | | | This is the way we write... /k/ | |
| tv_turn_short | | c pulses | Your turn. | taps twice; says /k/ |
| tv_learn_next · /g/ /g/ · tv_learn_write · tv_way_write /g/ · tv_turn_short | | the third petal; g | (as above) | taps twice; says /g/ |
| tv_learn_last | | the last misty petal comes down | Here's the last new sound. | |
| /h/ /h/ · tv_learn_write · tv_way_write /h/ · tv_turn_short | | h | (as above) | taps twice; says /h/ |
| tv_learn_all_{n} | | all four petals in a row, each with its letter | You've learnt all four new sounds. | |

**Find (the short form: the child met this game in w1-2).**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_find_dojo | | the letters b, c, g, h and a known one drop in as tiles; the petal slot in the nav row | Now let's find your new sounds. | |
| tv_find_how | | | I'll say a sound. You tap the way we write it. | |
| tv_find_q | | the /b/ petal | Which one is the way we write... /b/ | taps b |
| tv_find_q2, tv_find_q3, tv_find_q (rotating) | | | Can you find the way we write... /k/ · Now find the way we write... /g/ · Which one is the way we write... /h/ | taps |
| (corrections) | | | §3.4 | |

**Build (the short form: the child has built words in five earlier levels).** The taps stay locked until the word has been said (SCRIPT_FIXES C12).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_dojo | | three lines; the letter bank | Now let's build some words with your new sounds. | |
| tv_build_word · tv_build_slowly | the first word | the word card glows | Your word is... «cab» · Listen to it slowly... «cab~» | builds c, a, b |
| say_sounds_read (kept, calm) | the first read-back | the sound buttons light | Say the sounds, and read the word. /k/ /a/ /b/ «cab» | says it |
| tv_build_word «w» | the next words | | Your word is... «hob» (the slow version only after a miss) | builds |
| (corrections) | | | §3.4 | |
| tv_learn_done | | the four petals glow | You learnt four new sounds today, and built words with them. | (the reward) |

*The whole w2-1 frame and first sound: 10.4 s to the Ready tap, 12 s more to the child's first tap on b, and every sentence lands on its own movement. Today the child's first tap comes at 11.5 s, but after one room-framing sentence and a bare "Listen…".*

---

## 2. Every other game type: the first time, and the replays

Every game type has four forms (mechanics.md §3.2, with my change in §4.1):

| Form | When | What plays |
|---|---|---|
| **full** | the first time this profile meets the game | frame · ▶ · show · turn |
| **recap** | the first play in a later session while the game has had fewer than two full tellings; after 21 days without it; or after the child struggled with it last time | the "You know this game" line · show · turn. The ▶ hold is added only after a 21-day gap or a struggle |
| **short** | the first play in a session, once the game has had its two tellings | one line that names the game · turn |
| **none** | later plays in the same session | the question only, with its fading (SCRIPT_FIXES A5, A6) |

Games already written out in full in §1 give their full form by reference. Games a preschool child doesn't meet before w2-1 are written out in full here.

### 2.1 The warm-up games

| Game | Form | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|---|
| G1 find the picture (`tap`) | full | | §1.3 game 1 | | | |
| | recap | tv_tap_recap | the cards drop in | three cards | You know this game. I say a word, and you find its picture. | |
| | short | tv_tap_short | | | Let's find some pictures. | |
| | none | tv_where_{w} | | | Where's the {sock}? | taps |
| G2 Tortoise and Rabbit (`fastslow`) | full | | §1.3 game 2 | | | |
| | recap | tv_spd_back · fm_fast_{w} · fm_slow | | rabbit and tortoise pop in | Here are my rabbit and my tortoise again. · I can say a word fast. {Mug}! · Or I can say it slowly... «w~» | watches |
| | short | tv_spd_turn_slow | | the tortoise pulses | Tap the tortoise, and say it slowly with me. | taps |
| G3 the first sound (`notice`) | a show; no forms | | §1.3 | | | |
| G4 Slow Words (`slowpick`) | full | | §1.7 | | | |
| | recap | tv_slow_recap · tv_watch_one · (the demo) | | | You know Slow Words. I say a word slowly, and you find its picture. · Watch me do this one. | watches |
| | short | tv_slow_yours · fm_which_pic | | | Here's your slow word... «w~» · Which picture is it? | taps |
| G5 Fill the Pockets, first sound (`tapall:start`) | full | | §1.3 game 3 | | | |
| | recap | tv_pk_recap · tv_pk_start | | the pockets glow | You know Fill the Pockets. · We're looking for pictures that start with... /x/ | |
| | short | tv_pk_short_start | | | Now fill the pockets with pictures that start with... /x/ | taps |
| G5 Fill the Pockets, the middle (`tapall:in`) | full | | §1.7 | | | |
| | recap | tv_pk_recap · tv_pk_in_how · tv_here_sound | | | You know Fill the Pockets. · This time, we listen for a sound in the middle of the word. · Here's the sound... /x/ | |
| | short | tv_pk_short_in | | | Fill the pockets with pictures that have this sound in the middle... /x/ | taps |
| G6 the reading rail (`rail`) | full | | §1.5 game 1 | | | |
| | recap | tv_rail_way · audit_left_right · tv_rail_demo · (the reading) | | | Ninjas read this way. · We start here, and go this way. · I'll read them the ninja way. | watches |
| | short | tv_rail_way · tv_turn · tv_rail_turn | | | Ninjas read this way. · Now it's your turn. · Start here, and tap them this way. | taps |
| G7 the swap (`swap`, a show) | a show; no forms | | | | | |
| G8 Which Row Did I Read? (`which`) | full | | §1.5 game 2 | | | |
| | recap | tv_which_recap · tv_show_first · (the demo on its own rows) | | two rows | You know this game. I read one row, and you tap the row I read. | watches |
| | short | tv_which_short | | | Two rows again. Tap the row I read. | |
| | none | tv_which_{rows} | | | {Cat... dog.} Which row did I read? | taps |
| G9 Big Words (`compound`) | full | | §1.5 game 3 | | | |
| | recap | tv_big_frame · tv_big_demo (on the sunflower: the canonical demo) | | | Two little words can make one big word. · Slowly, like the tortoise: sun... flower. Fast, like the rabbit: sunflower! | watches |
| | short | tv_big_again | | | Let's make some more big words. | |
| G10 Guess My Word (`sounds`) | full | | §1.9 | | | |
| | recap | tv_guess_recap · tv_show_first · (the demo) | | | You know Guess My Word. I say the sounds, and you listen for the word. | watches |
| | short | tv_guess_q · fm_which_pic | | | Listen for the word... + sounds · Which picture is it? | taps |
| G11 Sound Dots (`dots`) | full | | §1.10 | | | |
| | recap | tv_dots_recap · (the demo) | | | Here are the sound dots again. Watch me tap them this way. | watches |
| | short | tv_dots_turn_short | | | Your turn. Tap the dots, and say the sounds. | taps |

### 2.2 The early games

| Game | Form | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|---|
| G12 First Sounds (`firstsound`) | full | | §1.11 | | | |
| | recap | tv_first_recap · tv_watch_one · (the I do for the first sound) | the level is on screen | | You know First Sounds. I say a sound, and you find the picture that starts with it. · Watch me do this one. | watches |
| | short | tv_first_again | | | It's First Sounds again, with two new sounds. | |
| | none | first_q / st_first_q2 / st_first_q3 | | | (rotating stems) + /x/ | taps |
| G13 Find the Way We Write It (`find`) | full | | §1.11 | | | |
| | recap | tv_find_frame · tv_find_how | | | Now let's find how we write each sound. · I'll say a sound. You tap the way we write it. | |
| | short | tv_find_short | | | Now find the way we write each sound. | |
| | none | tv_find_q / tv_find_q2 / tv_find_q3 | | | (rotating) + /x/ | taps |
| G14 Sound Hunt (`soundhunt`) | full | | §1.17 | | | |
| | recap | tv_hunt_recap · tv_watch_one · (the I do) | | | You know Sound Hunt. I say a sound, and you find the picture with that sound in the middle. · Watch me do this one. | watches |
| | short | tv_hunt_again | | | It's Sound Hunt again, with a new sound. | |
| G15 Building Words (`build`) | full | | §1.14 | | | |
| | recap | tv_build_recap · tv_watch_one_build · (the I do) | | | You know how we build words. I say a word, and you find its sounds. · Watch me build the first one. | watches |
| | short | tv_build_again_short | | | Let's build some words. | |
| | none | tv_build_word | | | Your word is... «w» | builds |
| G16 Who Read It Right? (`readcheck`) | full | | §1.14 | | | |
| | recap | tv_rc_recap · tv_rc_you_first | | Kai and Suki slide in | Kai and Suki are back. One of them reads it right. · First, you read it. Tap each sound, and say it with me. | taps |
| | short | tv_rc_again | | | Kai and Suki are back. Tap each sound, and say it with me. | taps |

### 2.3 The Dojo

**G17 New Sounds (`learn`).** The full form is §1.25.

| Form | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|
| recap | tv_learn_today_{n} · tv_learn_how_short · tv_rdy_q | the level is on screen | the lesson's petals in mist | Today you'll learn {three} new sounds. · You know how this goes. I say each one, then you say it with me. · Ready? Tap the green arrow. | taps ▶ |
| short | tv_learn_today_{n} | | | Today you'll learn {three} new sounds. | |
| (either) | tv_learn_first · … | | | then the series, as in §1.25 | |

**The special cases inside a Learn** (teaching shows, dosed by the spelling, not the game):

| Case | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|
| The first two-letter spelling | tv_way_write · t_two_letters (kept, calm) | after the spelling appears | the two letters glow together; the petal swells on "one sound" | This is the way we write... /sh/ · It's two letters, but it's one sound. | |
| The next two-letter spelling, within two minutes | st_two_letters_too (SCRIPT_FIXES Part B) | | | This one's two letters too, but it's just one sound. | |
| Three letters | t_three_letters (kept) | | | It's three letters, but it's just one sound. | |
| A new spelling of a sound the child knows (before the spell) | st_know_this_sound (SCRIPT_FIXES Part B) | after the sound, twice | the known petal (no introduction) | Ooh, you already know this sound! | |
| … then after the spell | t_another_way (kept) | the new spelling appears beside the old one | | This is another way to spell the sound... /ae/ | |
| < x >, two sounds together | tv_x_two · (the pair) | | the /k/ and /s/ petals with a "+" (Dec7) | This spelling is two sounds together. /k/ /s/ | |
| One spelling, two sounds (concept 4) | t_same_spelling_sometimes · /th/ · st_th_moth_sometimes · /dh/ · tg_th_dh_in | | a contrast pair | The same spelling can sometimes be... /th/ …in moth, and sometimes... /dh/ …in this. (SCRIPT_FIXES C20's five clips; this is the one place where a sound sits mid-sentence, because the Sounds~Write formula needs it) | |
| The series shape | tv_learn_next / tv_learn_last | | | Here's the next new sound. / Here's the last new sound. | |
| A school path's first lesson (a Year One child meets Learn with < ai >) | tv_learn_known_today | the level is on screen | | Today you'll learn new ways to write sounds you know. | |

**Find and Build in the Dojo, when they're a child's first meeting** (a school-path child, who never played the early levels):

| Game | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|
| G13 Find, full | tv_find_frame · tv_find_how · tv_find_q | | the first item's tile glows after 2 s | Now let's find how we write each sound. · I'll say a sound. You tap the way we write it. · Which one is the way we write... /x/ | taps |
| G15 Build in the Dojo, full | tv_build_frame · tv_build_how_1 · tv_build_how_2 · tv_rdy_q · then the I do from §1.14 (tv_show_first, tv_build_myword, tv_find_each, the demo, tv_read_i) · tv_turn · tv_build_word | | as in §1.14 | (as in §1.14). The Dojo's `Build` gets the I do on its full and recap forms (mechanics.md §10.9) | builds |

### 2.4 Battles, Swap, Sort, Run and Story

| Game | Form | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|---|
| G18 Monster Battle (`battle`) | full | | §1.16 | | | |
| | recap | tv_bt_recap · tv_turn · tv_build_word | | the letters locked until "your turn" | Oh no, another monster. You know how to zap it: build the words. · Now it's your turn. · Your word is... «w» | builds |
| | short | tv_bt_again | | | Another monster. Let's zap it with words. | |
| Boss Battle (`boss`) | full | | §1.23 | | | |
| | recap and short | tv_boss_again | after Baron's line | | A boss monster! It takes lots of words to zap it. | |
| Gem Battle (`trial`) | full | tv_trial_name | the level is on screen | the glowing gem over the monster; a purple bar; three hearts; the letters locked | This is a gem battle. If you win, the gem is yours. | |
| | | tv_trial_bar | | the purple bar glows | Build each word before this bar is full. | |
| | | tv_rdy_q | | ▶ in the column | Ready? Tap the green arrow. The bar starts only after this tap | taps ▶ |
| | | tv_trial_heart | the first heart lost (just in time) | a heart fades | The bar filled up, so you lost a heart. That's fine. Keep going. | |
| | | tv_trial_help | all the hearts gone | | You ran out of hearts. I'll help you with this one. | |
| | recap and short | tv_trial_again | | | Gem battle! Build each word before the bar is full. | |
| G19 Sound Swap (`swap`) | full | | §1.18 | | | |
| | recap | tv_swap_recap · (the demo on the demo pair) · tv_turn | | | You know Sound Swap. We change one sound to make a new word. · (the demo from §1.18) · Now it's your turn. | watches, then taps |
| | short | tv_swap_short | | | It's Sound Swap. Baron Muddle has muddled some more words. Let's fix them. | |
| G20 Sorting (`sort`) | full | tv_sort_name | the level is on screen | the chests (c, k, ck) land; a big /k/ petal stands above them (SOUND_DISPLAY r44) | This game is called Sorting. | |
| | | tv_sort_sound | | the petal swells | Every word here has this sound... /k/ | |
| | | tv_sort_chests | | each chest glows in turn | Each chest has a different way to spell it. | |
| | | tv_rdy_first | | ▶ in the column (the chests fill the row) | I'll do the first one. Ready? Tap the green arrow. | taps ▶ |
| | | tv_build_myword | | the word cat floats down and stops above the chests | My word is... «cat» | watches |
| | | tv_sort_see | | the c in cat and the c chest glow together | I can see this spelling in it. | |
| | | tv_sort_so | | the paw taps the c chest; the ninja kicks the word in | So it goes in this chest. | |
| | | tv_turn · (the next word) | | kit floats down | Now it's your turn. · «kit» | taps a chest |
| | | help_sort (kept, calm) | on the child's first word only | | Tap the chest with the same spelling as the word. | |
| | | t_two_letters (kept) | the first ck word, when the fact is due (SCRIPT_FIXES C1) | the ck chest glows | It's two letters, but it's one sound. | |
| | | tv_sort_done | | | Same sound, different spellings. You sorted them all. | |
| | recap | tv_sort_recap · tv_sort_sound | | | You know Sorting. · Every word here has this sound... /x/ | |
| | short | audit_sort_again (kept) · tv_sort_sound | | | Sorting time! Same sound, different spellings. · Every word here has this sound... /x/ | |
| G21 Ninja Run, sounds (`run:blend`) | full | | §1.19 | | | |
| | recap | tv_run_recap · tv_rdy_go | | | Ninja Run! Your ninja runs, and you catch the lanterns. · Ready? Tap the green arrow, and off we go. | taps ▶ |
| | short | tv_run_short | | | Ninja Run! Ready? Tap the green arrow, and off we go. | taps ▶ |
| Ninja Run, reading (`run:read`) | full, at its first reading group | tv_runread_1 | the ninja stops; a written word appears on the banner; lanterns with pictures | Now it's your turn to read. Read the word at the top. | reads |
| | | tv_runread_2 | | the lanterns bob | Then catch its picture. | taps a lantern |
| | short | tv_runread_short | | | Read the word, and catch its picture. | |
| G22 Story Time (`story`) | full | | §1.22 | | | |
| | recap | tv_story_frame | | | It's story time. I'll read some pages, and you'll read some pages too. | |
| | short | tv_story_short | | | It's story time. | |
| Story choice (`story:choice`) | full | tv_story_choice | | | Now you choose what happens. Read the two words, and tap one. | |
| | later | audit_story_choose_again (kept, calm) | | | Read the words, and tap one. | |

### 2.5 Other screens a child can meet

| Screen | id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|---|
| The practice dojo (from the World Flower's gate) | tv_practise_frame | the level is on screen | | Let's practise this sound in the dojo. We'll build some words with it. | |
| Sensei's Challenge (the sounds found tricky) | tv_challenge_frame | | | This is practice with me. We'll try the sounds you found tricky. | |
| Show Sensei (the placement quiz, opened by a grown-up) | tv_place_frame | | | Let's see which sounds you know. Just have a go. It's fine if you don't know one. | |
| The first check's band drop (a school path found too hard) | tv_drop_warmup | a held step over the level | | Let's start with some warm-up games first. Tap the green arrow. | taps ▶ |

---

## 3. The recurring moves

### 3.1 Ready

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rdy_play | the first game of all (W1) | ▶ pops in, pulsing; the ninja turns to it | Are you ready to play? Tap the green arrow. | taps ▶ |
| tv_rdy_q | every other full-form frame | ▶ | Ready? Tap the green arrow. | taps ▶ |
| tv_rdy_first | a frame without its own "I'll…" sentence | ▶ | I'll do the first one. Ready? Tap the green arrow. | taps ▶ |
| tv_rdy_go | on the tap, where no demo line follows at once | the ninja bows | Here we go. | |
| (a board tap) | during the hold | the tapped card spotlights and says its name | «w», then tv_rdy_go | counts as ready |
| (8 s) | idle | ▶ glows; the hand points at it | (nothing said) | |
| tv_rdy_nudge | idle 16 s, and again at 40 s | the ninja points its star at ▶ | When you're ready, tap the green arrow. | |
| tv_rdy_where | idle 24 s, once per save | ▶ bounces | The green arrow is down here. Tap it, and we'll start. | |

`nav_ready` ("Tap the arrow when you're ready!") is re-recorded as tv_rdy_nudge, so that every hold says "the green arrow" the same way.

**The ritual lines.** Each is recorded once and used by every game, so the child learns the routine by its sound:

| id | Sensei says (exact text) | Move |
|---|---|---|
| tv_show_first | I'll go first. Watch my paw. | the show begins (a paw demo) |
| tv_show_paw | Watch my paw. | the show begins, when the frame has already said "I'll find one first" |
| tv_watch_one | Watch me do this one. | the I do of a new sound on a short form |
| tv_watch_one_build | Watch me build the first one. | the I do of a building game on a short form |
| tv_turn | Now it's your turn. | the handover, always before the question |
| tv_turn_short | Your turn. | the handover on later items and short forms |
| tv_together | Let's do the next one together. | the we do (its answer glows after 2 s) |
| tv_together_build | Now let's build it together. | the we do in building |
| tv_on_your_own | Now try one all by yourself. | the first you do |
| tv_build_own | Now you build it, all by yourself. | the first you do in building |
| tv_say_with_me | Say it with me. | before a sound the child says aloud |
| tv_my_sound | My sound is... | + /x/ |
| tv_way_write | This is the way we write... | + /x/ |
| tv_ninja_write | Now watch my ninja write that sound. | the first letter of a new sound in a pick game |
| tv_learn_write | Now watch my ninja write it. | the spell in New Sounds, and short forms |
| tv_build_myword | My word is... | + «w» (Sensei's demo) |
| tv_build_word | Your word is... | + «w» (the child's turn) |
| tv_find_each | Now I find each sound. | the building demo |
| tv_read_i | Now I say the sounds, and read the word. | + sounds + «w» (Sensei's read-back) |
| tv_its_this | It's this one. | help, the second miss |
| tv_now_you_tap | Now you tap it. | the hand-back after help |

### 3.2 Show me again (the paw)

The paw appears in the nav row once a demo has played, and stays through the turn (NAVIGATION.md §3.6). It's explained when the child needs it, not up front.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_show_offer | idle 8 s in the first turn of a full-form game, once per save | the paw pulses | Not sure? Tap my paw, and I'll show you again. | may tap the paw |
| tv_show_offer_miss | the second miss on one of a first meeting's first two items | the paw pulses | Shall I show you again? Tap my paw. | taps the paw, or has another go |
| tv_show_again | the paw tapped | the demo's pictures come back | Here it is again. Watch my paw. | watches |
| (the demo replays, narrated as before) | | | | |
| tv_show_after | the replay ends | the turn's pictures come back; the paw stays | Do you want to have a go now? | taps an answer (or the paw again) |

### 3.3 Praise: specific, rationed, and never stacked

After a right answer, the model is the feedback: the card or tile says its word or sound, and the ninja moves. On top of that, Sensei says one praise line at most every second right answer (every third in the warm-ups; SCRIPT_FIXES A4). Only one praise line per moment. A streak tier-up, a reminder, the gem's first fill or the level's closing line each counts as the praise for its answer.

| Game | id | Sensei says (exact text) |
|---|---|---|
| any picture game | tv_praise_found | You found it. |
| First Sounds | tv_praise_start | You listened right to the start of the word. |
| Sound Hunt | tv_praise_middle | You heard it right in the middle. |
| Slow Words | tv_slow_ok | You heard the slow word. |
| Guess My Word | tv_praise_guess | You heard the sounds, and found the word. |
| the reading rail, Sound Dots | tv_rail_ok | You read them the ninja way. |
| Which Row | tv_praise_which | You remembered which came first. |
| Big Words | tv_big_ok | You made a big word. |
| New Sounds (Sounds~Write's own praise) | tv_praise_sound | You said that sound really well. |
| Find the Way We Write It | tv_praise_find | You know how we write that sound. |
| Building Words, battles | tv_praise_build | You found every sound in that word. |
| Building Words, the first word built alone | tv_praise_build_own | You built the whole word by yourself. |
| Who Read It Right? | tv_praise_rc | You listened carefully to them both. |
| Sound Swap | tv_praise_swap | You changed just one sound. |
| Sorting | tv_praise_sort | That's the right chest. |
| Ninja Run | tv_praise_catch | What a catch! |
| Story Time | tv_praise_page | You read that page all by yourself. |
| after a struggle (the second miss, then right) | tv_praise_effort | That was tricky, and you kept going. |
| after help (right once helped) | tv_praise_helped | Now you've got it. |
| short, general (rare) | yay_1 (kept), tv_praise_lovely, yay_4 (kept) | Brilliant! · Lovely. · Well done! |

**The streak lines stay** (audit_streak_first, streak_6, streak_10), but under Dec2 a tier line needs whole answers. "Amazing! You're a ninja master!" means ten real answers, never ten letter taps. Praise about the child as a person ("clever ninja") is kept to one closing line (`sort_done`) and is otherwise avoided.

### 3.4 Gentle correction

This follows Sounds~Write: no "No", no buzzer, never red. Sensei corrects exactly where the problem is and ends on the right answer. On the first miss she goes back to listening; on the second, she shows or does it together, then hands it back.

| Game | Miss | id | on screen | Sensei says (exact text) |
|---|---|---|---|---|
| a picture game (find, Slow Words, Guess My Word) | 1st | (the card's own word) · tv_fix_listen_{game} | the card wobbles (400 ms) and says its word | «moon» · Let's listen again. + the stimulus (the slow word, the sounds) |
| | 2nd | tv_fix_together · tv_its_this · tv_now_you_tap | the answer glows | Let's do it together. · It's this one. · Now you tap it. |
| First Sounds, Fill the Pockets | 1st | fm_diff_{w} (kept) · tv_fix_start | the card wobbles; «m-moon» | Moon starts with a different sound. · Listen for the start... /s/ |
| | 2nd | tv_fix_together · fs_{answer} · tv_now_you_tap | the answer glows | Let's do it together. · Sock starts with... /s/ · Now you tap it. |
| Sound Hunt, Fill the Pockets (the middle) | 1st | fm_not_in_{w} (kept) or tv_fix_middle | | Dog doesn't have that sound in it. · Listen for the middle... /a/ |
| a spelling tile (Find, Learn's Find) | 1st | tv_fix_sound_again | the tile wobbles and says its sound | Listen to my sound again... /m/ |
| | 2nd | thats (kept) · we_need (kept) | a petal pops over the wrong tile, then the right tile glows | That's... /s/ · We need... /m/ |
| a build slot (Build, battles) | 1st | audit_spelling_help_plain (kept) | the slot's line glows | Listen to the word again. What sound do you hear here? «w~» |
| | 2nd | thats · we_need | the right tile glows; the petals pop (SOUND_DISPLAY r27) | That's... /s/ · We need... /m/ |
| | a split two-letter spelling (SCRIPT_FIXES C5) | thats · we_need · t_two_letters | the two-letter tile glows | That's... /s/ · We need... /sh/ · It's two letters, but it's one sound. |
| Who Read It Right? | 1st | tv_rc_check | the buttons glow | Let's check. Say the sounds with me. + sounds + «w» |
| | 2nd | tv_rc_word_{w} · tv_rc_ok_{reader} | the right reader glows | The word is {am}. · Yes, Suki read it right. |
| Sound Swap, the wrong letter to change | 1st | tv_swap_fix | a petal pops over the tapped letter | That sound stays the same. Listen to them both... «a~» «b~» |
| Sound Swap, the wrong new letter | 1st | (the shared build correction) | | (as for a build slot) |
| the rail, Sound Dots (the wrong order) | any | tv_rail_fix / tv_dots_fix | the first card or dot pulses; the arrow glows | Ninjas start on this side. Tap this one first. |
| Tortoise and Rabbit (the wrong button) | any | tv_spd_wrong_rabbit / tv_spd_wrong_tortoise | the right button pulses | That's my rabbit. It says words fast. Tap the tortoise to say it slowly. / That's my tortoise. It says words slowly. Tap the rabbit to say it fast. |
| Sorting | 1st | tv_sort_fix | the word's spelling and the right chest glow | Look at the word. Which chest has the same spelling? |
| Ninja Run | any | tv_run_fix | | That's a different word. Listen again... + sounds |
| a streak of 3 or more lost | before the correction | streak_lost (kept) | the flames puff out | Keep going, ninja! |

**Taps that come too early:**
- A tap on a card during the frame or the naming: the card spotlights and says its name, and nothing else is said.
- A tap during the demo: the card nods, a soft tink plays, and Sensei carries on.
- Letters in a battle or swap stay locked until "Now it's your turn": a tap on them gives a wiggle, and no line.

### 3.5 When the child is quiet (a turn's idle ladder)

This follows the research: 5–6 s of silence, then Sensei *rephrases* rather than repeats, then helps. Nothing ever answers for the child (NAVIGATION rule 5).

| After | id | on screen | Sensei says (exact text) |
|---|---|---|---|
| 0–6 s | | nothing new | (quiet) |
| 8 s | tv_idle_{game} (the rephrase) | the answer glows gently | a picture game: Have a look at each picture. {Where's the sock?} · First Sounds: Listen to my sound again... /m/ · Which picture starts with it? · Find: Listen to my sound again... /m/ · Which one is the way we write it? · Build: Listen to the word again... «w~» · What sound do you hear here? · Swap: Listen to them both again... «a~» «b~» · Which sound changes? · New Sounds: Tap the letters, and say the sound with me. · Guess My Word: Listen for the word again... + sounds · Which picture is it? · Sorting: Look at the word. Which chest has the same spelling? · Story: When you've read it, tap the green tick. |
| 8 s, first full-form turn only | tv_show_offer | the paw pulses | Not sure? Tap my paw, and I'll show you again. |
| 16 s | tv_idle_point | the paw points at the answer (it never taps it) | Here it is. Tap it when you're ready. |
| 24 s, once | tv_take_time | | Take your time. |
| after that | | quiet; the glow and the paw stay | |

### 3.6 Help (Sensei in the corner)

| Press | id | on screen | Sensei says (exact text) |
|---|---|---|---|
| 1st | tv_help_again | | the question again, rephrased (the 8 s line above) |
| 2nd | tv_look_glow | the answer glows | Look for the glow. |
| 3rd | tv_idle_point | the paw points at the answer | Here it is. Tap it when you're ready. |
| On a held step or a Ready hold | 1st: the step again · 2nd on: tv_rdy_nudge | | When you're ready, tap the green arrow. |

### 3.7 Hear it again (the speaker)

The speaker replays the *bundle* (NAVIGATION.md §3.5). On a game's first turn that's the frame, the naming and the question. Later it's the naming and the question. On a Ready hold it's the frame. It never replays praise or corrections. Every frame line above is said with `told()` so it can be replayed.

### 3.8 Wrapping up, and moving on

Every game ends with one line that says what the child did. Where the next thing is a different game, a second line says what's next.

| id | when (trigger) | Sensei says (exact text) |
|---|---|---|
| tv_w1_done · tv_w1_link | W1 ends | That's the end of Ninja Ears. You listened really carefully. · Now watch what happens to your pictures. |
| fm_l2_done · tv_rw_link_book | W2 ends | You read the pictures, just like a real reader! · Let's put your new pictures in your Sticker Book. |
| tv_w3_done, tv_w4_done, tv_w5_done, fm_l6_done | W3–W6 end | (§1.7–1.10) |
| tv_first_done · tv_first_done_2 | First Sounds ends | You found the first sound in every picture. · And now you know how to write two sounds. |
| tv_hunt_done | Sound Hunt ends | You found the sound in the middle. That was tricky! |
| tv_build_done | an early dojo ends | You built words all by yourself. And you helped Kai and Suki. |
| tv_learn_done | a Dojo ends | You learnt {four} new sounds today, and built words with them. |
| battle_win / battle_boss_win (kept) | a battle ends | Hooray! The monster ran away! / You beat the boss! What a ninja! |
| tv_swap_done | Sound Swap ends | You swapped one sound each time, and made new words. |
| tv_sort_done | Sorting ends | Same sound, different spellings. You sorted them all. |
| run_end (kept) | a run ends | Bong! You made it to the gong! |
| story_end (kept) | a story ends | The end! What a story! |
| tv_next_game | between two games inside one level (First Sounds → Find, Sound Hunt → Build) | Next, we're going to {build some words}. (the frame of the next game follows) |
| tv_last_one | the last item of a game | Last one. |
| fm_last_one → tv_last_one_cap | at the hard cap, one answer left | Here's the last one. |

### 3.9 The moment before a reward

The level's closing line *is* the praise. The reward then opens on its news, not on "You did it!" (SCRIPT_FIXES A8).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rw_lets_see | the reward opens, when it has news | the reward panel | Let's see what you've won. | |
| tv_rw_won_1 | one new sound | its petal rises with the short introduction, then swells on its sound | You won back a new sound. /x/ | |
| tv_rw_won_{n} | two or more (counted by sounds, Dec8) | the petals rise in a row | You won back {two} new sounds. /x/ /y/ | |
| fm_rw_more (kept) | the first two rewards of a session | the stickers fly into the book | More stickers for your Sticker Book! | |
| audit_gem_more / r2_gems_more (kept) | a gem fills visibly | the gem lifts | Look, this gem has filled a little more. | |
| flower_i5 (kept) | the first gem ready of a save (SCRIPT_FIXES C8) | the gem glows | When a gem is full, it glows. Then you can win it in a gem battle! | |
| tv_rw_next | the first reward of a session | ▶ pulses | When you're ready, tap the green arrow. | taps ▶ |
| tv_to_flower | a trip is due | ▶ | Let's go to the World Flower, and see your new sounds. Tap the green arrow. | taps ▶ |
| yay_7 (kept) | only when the level had no closing line | | You did it! | |

**The map and the session:**

| id | when (trigger) | Sensei says (exact text) |
|---|---|---|
| tv_welcome_back | a returning child's first map of the session | Welcome back, ninja. I'm so happy to see you. |
| tv_map_next | straight after it | Your next game is on the glowing stone. |
| tv_map_hint | the first two map visits of a save | The glowing stone is your next game. Tap it when you're ready. |
| tv_map_nudge | the map's idle nudge, at 8 s | Tap the glowing stone to play. |
| tv_break | after a long session (in place of `dojo_nap`) | You've done lots of practice today. Ninjas need rest too. |
| tv_jump | the jump offer (in place of `jump_offer`; the grown-up's press-and-hold stays) | You got everything right. A grown-up can help you jump ahead, if you like. |

### 3.10 The lead-ins that replace a bare "Listen…"

`listen` ("Listen…") is never the first clip of a game, a beat or a turn (mechanics.md §9, the `bare-listen` check). These lead-ins take its place. Each one is recorded to end suspended, and each says what's coming.

| id | Text | Used for |
|---|---|---|
| tv_here_sound | Here's the sound... | a sound presented on its own (Fill the Pockets, the middle) |
| tv_my_sound | My sound is... | the sound in a demo, or a pick game's sound |
| tv_learn_first / tv_learn_next / tv_learn_last | Here's the first new sound. / Here's the next new sound. / Here's the last new sound. | New Sounds (a whole sentence, then the sound in its own slot) |
| tv_guess_q | Listen for the word... | oral blending (Sounds~Write's "listen for the word") |
| tv_slow_yours | Here's your slow word... | Slow Words |
| tv_build_slowly | Listen to it slowly... | Build, the first word |
| tv_fix_sound_again | Listen to my sound again... | a correction or an idle rephrase |
| tv_swap_listen | Listen to them both... | Sound Swap |
| tv_last_first | Now listen right to the end of the word... | the first "last sound" of a save |
| tv_fix_start / tv_fix_middle | Listen for the start... / Listen for the middle... | corrections in First Sounds, Fill the Pockets and Sound Hunt |

---

## 4. Notes for integration

### 4.1 Where this draft differs from mechanics.md, and why

1. **The Ready hold comes after the frame and before the show, not after the show.** The reasons:
   - The tap makes sure the child is looking just before the demo, which is the moment their attention matters most.
   - It keeps the talk before the first tap to 10–12 s in every game, where a post-show hold reaches 15–23 s on a first meeting (W1, w1-2, w1-4).
   - It follows Jonas's order: "I'm going to show you how to do it. Are you ready? … I will show you this, and you will do that."
   - It avoids an awkward moment: after a demo, an eager child taps the right card, and a post-show hold would take that as "ready" and then ask the same question again.

   `holdReady()` works the same way, only earlier. `show` isn't offered at a pre-show hold (there's nothing to show yet). The paw appears in the turn, as NAVIGATION §3.6 already does. Jonas's "Do you want to give it a go now?" is kept where the child can really answer it: after a Show me again replay (tv_show_after).
2. **W1's first game asks "Are you ready to play?"** It's the only game that opens with the question in its long form. Every other game uses "Ready? Tap the green arrow." There's still one hold per first meeting.
3. **The paw is explained when the child needs it.** That's at the 8 s idle point of the first full-form turn, and after a second miss. The first Ready hold doesn't name both answers: that would put a two-choice question in front of a 3-year-old before they've seen anything.
4. **The recap form has no Ready hold,** unless the child is coming back after 21 days or struggled last time. The stone tap on the map is the "I'm ready" for a routine second telling.
5. **The preschool path says "the way we write".** Sounds~Write's Lesson 1 says "the way we write /s/", and it's more concrete for a 3-year-old than "spell". "Spell" is kept in the fixed Sounds~Write phrases ("Same sound, different spellings.", "This is another way to spell the sound…") and in Sorting.
6. **Games have concrete names:** Ninja Ears, Tortoise and Rabbit, Fill the Pockets, Slow Words, Ninjas Read This Way, Which Row Did I Read?, Big Words, Guess My Word, Sound Dots, First Sounds, Find the Way We Write It, Sound Hunt, Building Words, Who Read It Right?, New Sounds, Monster Battle, Boss Battle, Gem Battle, Sound Swap, Sorting, Ninja Run, Story Time. The recap line needs a name ("You know First Sounds."), and a 3-year-old remembers a game by the thing in it.

### 4.2 Timings: talk before the first tap, on a first meeting

This is estimated at 2.7 words a second, with sound and word clips added. "Live" is when ▶ or the board first takes a tap. The age-3 limit is 12 s (ARCHITECTURE §6.4).

| Game | Today | This draft (to the end of the Ready question) | Live from |
|---|---|---|---|
| Opt-in | 6.2 s | 10.8 s (a card works from the first word) | 0 s |
| W1 find the picture | 10.7 s (33 words) | 10.7 s | 7.4 s |
| W1 Tortoise and Rabbit | (inside a 47-word turn) | 11.5 s | 9.7 s |
| W1 Fill the Pockets | (8.5 s, in the demo) | 10.1 s | 8.3 s |
| W2 reading rail | 10.2 s | 9.3 s | 7.5 s |
| W2 Which Row | (no demo) | 8.5 s | 6.7 s |
| W5 Guess My Word | 17.0 s (45 words) | 10.4 s | 8.5 s |
| W6 Sound Dots | 10.9 s | 10.4 s | 8.5 s |
| w1-2 First Sounds | 23.3 s (63 words) | 10.7 s | 8.9 s |
| w1-4 Building Words | 31.4 s (75 words) | 9.6 s | 7.8 s |
| w1-6 Monster Battle | 5.9 s (letters live from the first frame) | 9.3 s (letters locked until the turn) | 7.5 s |
| w1-7 Sound Hunt | 29.0 s (82 words) | 9.3 s | 7.5 s |
| w1-8 Sound Swap | 14.4 s (tiles live) | 9.3 s | 7.5 s |
| w1-9 Ninja Run | 8.4 s | 8.5 s | 6.7 s |
| w2-1 New Sounds | 10.6 s (with a bare "Listen…") | 10.4 s | 8.5 s |
| w6-br1 Sorting | 18.2 s (57 words) | 11 s | 9.2 s |

**The cost.** W1 is the tightest: about 105–110 s for a quick child, against today's 98 s and mechanics.md's proposed 100 s target and 115 s cap. If the bot measures it over 115 s, cut in this order:
1. The rabbit ◇ (4.5 s).
2. `fm_same_word` (3 s).
3. G1's naming of the cat, so the paw's demo uses the cat instead of the sun (1.3 s).
4. tv_ntc_petal (the petal is named again in Reward 2) (2.6 s).

The frames themselves are never cut.

### 4.3 Line inventory

- **New lines:** about 300 `tv_` ids (counting the template stems once), most of them 4–12 words. Almost every game uses the shared ritual lines (tv_rdy_q, tv_show_first, tv_turn, tv_together, tv_on_your_own, tv_way_write, tv_my_sound, tv_build_word, tv_read_i).
- **Templates** (one whole recording per word, generated like `fs_*`):
  - `tv_where_{w}`: sock (W1; also the Reception version).
  - `tv_rc_ok_{kai,suki}`.
  - `tv_rc_word_{w}`: am, at, mat, sat, it, sit, top, pot, mop and the other reading-check words (worlds.ts `read`).
  - `tv_learn_today_{n}`, `tv_learn_all_{n}` and `tv_rw_won_{n}`: 2, 3, 4, 6.
  - `tv_guess_fix`, `tv_which_{rows}` and `tv_fix_listen_{game}`: per board.
- **Word slots at the end of a lead-in** stay for open word lists: Build, battles, Swap, Sort and Run. There, the word always follows a lead-in that ends suspended ("Your word is…" «cab»), never in the middle of a sentence.
- **Kept unchanged:**
  - Every `fm_name_*`, `fs_*` and `mid_*`.
  - The Sounds~Write fixed phrases: `say_sounds_read`, `t_two_letters`, `t_three_letters`, `t_another_way`, `first_sound_q`, `next_sound_q`, `last_sound_q`, `thats`, `we_need`.
  - The story and Baron lines, and the reward celebrations: `fm_rw_*`, `battle_win`, `run_end`, `story_end`.
  - The SCRIPT_FIXES Part B lines.
- **Retired from these paths:**
  - `fm_show_me`, `fm_show_me_2`, `fm_you_try`, `fm_you_try_2`, `ido`, `wedo` and `youdo`: the bare labels.
  - `fm_tap_sun` and `fm_tap_sock`: the child's instruction said inside the demo.
  - `listen` as an opener.
  - `fm_l1_hello`, `fm_l2_turn`, `fm_dots_intro`, `fm_sounds_intro`, `first_intro`, `hunt_intro`, `audit_middle_place`, `two_sounds`, `three_sounds`, `dojo_hello`, `audit_dojo_back`, `audit_dojo_first`, `dojo_build`, `read_intro`, `swap_start`, `battle_start`, `run_start`, `story_start`, `audit_sort_first`.
  - `tut_1`, `fm_help_short`, `fm_speaker`, `fm_rw_tap`, `fm_rw_next`, `fm_which_cat_dog`, `fm_which_three`, `fm_opt_notyet`, `fm_opt_yes`, `fm_opt_q1_again`, `fm_opt_grownups`, `welcome_back`, `dojo_nap`, `jump_offer`, `t_remember_this`, `t_listen_for_word`, `fm_practise_again`, `flower_i2` (its "Listen!"), `nav_ready` (re-recorded as tv_rdy_nudge).
  - Retiring a line from the preschool path doesn't delete it: the ids stay in `lines.ts` until every caller has moved.

### 4.4 Recording direction

- **Frames and instructions** are warm, calm, smiling and conversational, a little slower than today (about 2.4 words a second), with a falling tone and a full stop. They should never be called out.
- **Questions** rise gently and then stop. The game waits.
- **Celebrations** ("!") are the only excited lines.
- **Lead-ins ending "…"** fall no more than 2 semitones over their last 300 ms (FIRST_MINUTES §12). Leave 350–450 ms before the slot and about 1 s before a new sound in New Sounds.
- **Loudness:** one-word and two-word clips sit 3 LU under the sentences around them (mechanics.md §7.4). That's what takes the bark out of "Listen…", "Last one." and "Your turn.".
- **Pauses:** 300–600 ms between sentences, and 0.8 s before a sound's introduction.

### 4.5 Decisions to log (for docs/DECISIONS.md, by integration)

1. The Ready hold comes after the frame and before the show. It supersedes mechanics.md's "after the show" (§4.1 above).
2. W1's first game opens with "Are you ready to play? Tap the green arrow." Every other first meeting uses "Ready? Tap the green arrow." There's one hold per first meeting.
3. Every "?" Sensei says can be answered with a tap or by saying something aloud. The rhetorical lines are replaced: `t_remember_this`, `welcome_back`, `dojo_nap`, `jump_offer`, `fm_notice_sun_sock`'s "Did you notice?".
4. "Listen" always carries its object. `listen` never opens a game, a beat or a turn (it supports the `bare-listen` check).
5. The preschool path uses "This is the way we write…" /x/ (Sounds~Write Lesson 1's wording). "Spell" stays in the fixed Sounds~Write phrases and in Sorting.
6. Each symbol is explained where it first matters: the tortoise and rabbit, the petal (W1's first sound), the pockets, the arrow in the rail, the monster's bar (after the demo's first zap), the gem battle's hearts (when the first heart is lost), the run's jump (at the first crate), the story's tick (on the first reading page), and Kai and Suki.
7. The paw (Show me again) is offered when the child needs it, never as a second button at the Ready hold.
8. The recap form's Ready hold only comes after a 21-day gap or a struggle.
9. Games have the concrete names in §4.1, item 6.
10. W1's cut order, if it measures over 115 s: the rabbit, then `fm_same_word`, then one naming, then the petal line. The frames are never cut.
11. This supersedes FIRST_MINUTES §3 rule 3 ("no mode announcements"), as mechanics.md §10.3 proposes. SCRIPT_STYLE §5.1's "'Listen…' before a stretched word, always" becomes "a lead-in that says what to listen for".
