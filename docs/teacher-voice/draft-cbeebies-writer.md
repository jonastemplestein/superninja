# Sensei's teacher voice: the complete script (the CBeebies writer's draft)

**Status:** a draft for docs/TEACHER_SCRIPT.md, 26 September 2026, teacher-voice workflow. It covers every line Sensei says on the preschool path, from the film to the first Dojo lesson (w2-1), the first-time and replay introductions of every other game type, and the recurring moves. Inputs:
- [current.md](current.md) and [current-transcript.md](current-transcript.md): what a child hears today.
- [research.md](research.md): how good teachers introduce a game.
- [mechanics.md](mechanics.md): frame, show, Ready?, turn, and the four forms.
- SCRIPT_STYLE, SCRIPT_FIXES, SOUND_DISPLAY, FIRST_MINUTES, NAVIGATION and the Sounds~Write teacher language.

No game code was touched. Every line here is meant to be recorded as written.

**Jonas's bar:** "So first, I'm going to show you how to do it. Are you ready? And this is how this game goes. I will show you this, and you will do that. Do you want to give it a go now?" And Round 13's warning: the first game was "too long and boring". So this is real teacher talk in short, whole, warm sentences, with a turn for the child every few seconds, and never more than about 12 seconds of Sensei before the child does something.

**What the child hears at the moment Jonas found weird (w2-1), before and after:**

> *Today:* This is the dojo. A dojo is where ninjas practise! Let's practise some sounds. **Listen…** /b/ /b/ *(a big ear pulses)* And this is how we spell it. /b/ Tap it, and say it with me!
>
> *This script:* Today in the dojo, I'm going to teach you four new sounds. I'll say each sound, and show you how we write it. Then you say it with me. Are you ready for the first one? Tap the arrow. *(the child taps; the ninja bows)* Here's the first new sound. Get your ninja ears ready. *(the ninja cups its ear; a misty petal floats down)* Here it comes… /b/ … /b/ *(the petal blooms on the sound)* Tap the petal, and say it with me. *(the child taps and says /b/)* Now watch my ninja write it. *(the spell)* This is how we write… /b/ Now you tap it, and say the sound. *(the child taps twice, saying /b/)* Good, you said that sound really well.

---

## 0. How to read this script

### 0.1 Notation

- **Tables** are | id | when (trigger) | on screen | Sensei says (exact text) | the child does |. One row is one moment. A row can hold two or three clips said in a row, with their ids joined by " · ".
- **"Sensei says" holds only what is recorded, plus its slots.** Gemini TTS reads stage directions aloud (MEDIA_MODELS.md), so voice directions never go in that column. Each section has a *Voice* note instead.
- **Slots.** Each slot is its own clip, placed at the end of a sentence or alone between two sentences, never in the middle of one:

  | Slot | What plays |
  |---|---|
  | /s/ | a pure sound; its petal is on screen (SOUND_DISPLAY) |
  | [sun] | the word |
  | [sun, slowly] | the word stretched ("sssuuunnn") |
  | [sun, first] | the held first sound ("sssun") |

  A lead-in with a slot after it ends on "…" and is recorded suspended (FIRST_MINUTES §12). Any line with a word inside it is one whole recording (see `<w>` below).
- **Ids:**
  - `tv_…` is a new line.
  - A plain id is an existing clip, unchanged.
  - An id with ↻ is an existing id, re-recorded with the text shown. Usually a "!" becomes a full stop.
  - `<w>` or `<p>` in an id means one recording per word or sound, made by the line generator, as `fm_name_<w>` is today. The words needed are the ones on the path.
  - `st_…` ids are SCRIPT_FIXES Part B's new lines (not yet recorded), used exactly as written there.
- **▶** is the green arrow (Next). **Ready** is mechanics §4's `holdReady()`: ▶ means "I'm ready", the paw means "show me again", and a tap on the board also means ready. The ninja turns to ▶ in its ready stance while Sensei asks, and bows when the child answers.
- **Times** in "when" are game seconds from the start of the game or beat. They assume Sensei's measured pace of 2.7 words a second, a word clip of 0.6 s, a stretched word of 1.6 s, a held first sound of 0.8 s, a pure sound of 0.5 s and 0.3 s between clips. They are for the budget check (§4.1); the bot re-measures them.

### 0.2 Sensei's voice, in eleven rules

1. **Whole sentences** of 4–12 words, one idea each. No slogans used as instructions ("Ninja ears on!", "Spell…", "Watch me first!").
2. **Say what the game is and who does what, in order:** "I say a picture, and you find it." Every game has a name (§0.4), so it can come back as "It's Pocket Hunt again."
3. **Demonstrate in the first person, thinking aloud:** "I'll go first. I'm looking for the sun… There it is!" Sensei never gives the child's instruction during her own demo, and never asks a question in the demo that the paw then answers.
4. **A question mark means the child can answer now,** with a tap. Sensei asks "Are you ready?" only when ▶ is there to answer it, and then she waits. Otherwise she says "Here we go." or "Watch me."
5. **Full stops for instructions, "?" for real questions, "!" only for surprises and celebrations.** Today 177 of 440 lines end in "!", and the voice reads them as shouts.
6. **Never a bare "Listen".** Say what to listen for ("Let's listen for the very first sound.") or use a soft lead-in ("Here it comes…"). The one-word `listen` clip never opens anything.
7. **Explain every new thing on screen once, in one sentence, as it appears:** the green arrow, the paw, the petal, the rabbit and tortoise, the pockets, the reading rail, the lines, the word card, Kai and Suki, the power bar, the green tick. Then let it stand alone.
8. **Talk, then stop.** No more than about 12 s of Sensei before the child can act, and no more than about 8 s with nothing new on screen. When a demo would run longer, the child joins in part-way: tapping the petal and saying the sound, tapping the word card to hear the word, or a "Ready to watch?" tap.
9. **Praise the work, specifically, at most every second right answer.** The ninja's move is the praise in between. No trait praise ("You're a ninja master!").
10. **Correct gently.** Say what they tapped, give the answer, hand the turn back. Never "No" or "Wrong".
11. **Sounds~Write, always:**
    - pure sounds, and no letter names;
    - spellings "spell" or "write" sounds and never "say" or "make" them;
    - for a preschool child, "This is how we write /s/." (Early Years), and "spelling" is defined once (w1-2);
    - the fixed phrases stay word for word: "Say the sounds… and read the word.", "I'll say the sounds, and you listen for the word.", "It's two letters, but it's one sound.", "This is /X/. Say /X/ here.", "Good, you said that sound really well.", "If you say the sounds, you can hear the word."

### 0.3 The shape of every game

As mechanics §3: **frame · show · Ready? · turn**, in one of four forms chosen from the child's ledger (`game:<id>`):

| Form | When | What plays |
|---|---|---|
| **full** | the first time this profile meets the game type | frame (what it is, who does what), a narrated demo, Ready? (the long form the first time per save), the turn |
| **recap** | the first play in a later session, before two tellings are done; after 21 days away; after the child struggled with it | "It's X again" plus how it goes in one line, the demo, a short Ready?, the turn |
| **short** | a game's first play in a session once it has had two tellings | one line that names the game, then the turn |
| **none** | later plays inside the same level or beat | the question only |

**Three changes to mechanics.md** (decisions D3–D5 in §4.3):
- A **level always opens with at least the short line.** "None" applies only inside a level, so a new stone never opens cold.
- A **demo that runs past about 12 s from the child's last action gets a join-in** part-way. The join-in is a meaningful tap where one exists: the petal ("Tap the petal, and say it with me."), the word card ("Tap it, and hear the word."), or the cards themselves (the notice). Where none exists, Sensei asks "Are you ready to watch? Tap the arrow." That is Jonas's first "Are you ready?", used only for Sound Swap.
- **The paw ("Show me again") is introduced at the second Ready of the first lesson,** not the first, so the child meets one new control at a time.

### 0.4 The games and their names

| Game id | Name Sensei uses | First met (preschool path) | In one sentence to the child |
|---|---|---|---|
| `tap` | Find the Picture | W1 | I say a picture, and you find it. |
| `fastslow` | the rabbit and the tortoise | W1 | The rabbit says words fast. The tortoise says them slowly. |
| `notice` | (a show: ninja ears) | W1 | Let's listen for the very first sound. |
| `slowpick` | Slow Words | W3 | I say a word slowly, like the tortoise, and you find its picture. |
| `tapall` | Pocket Hunt | W1 | Find every picture that starts with… /s/ |
| `rail` | Ninja Reading | W2 | Ninjas read this way, starting at the arrow. |
| `which` | the two-rail game | W2 | I'll read one of them, and you tap the one I read. |
| `compound` | Word Squish | W2 | Two little words can make one big word. |
| `sounds` | Guess My Word | W5 | I'll say the sounds, and you listen for the word. |
| `dots` | Sound Dots | W6 | Every dot is one sound. |
| `firstsound` | First Sounds | w1-2 | I say a sound, and you find the picture that starts with it. |
| `find` | Letter Hunt | w1-2 | I say a sound, and you find how we write it. |
| `soundhunt` | Sound Hunt | w1-7 | The sound is hiding in the middle of the word. |
| `build` | Word Building | w1-4 | I say a word, and we build it with its sounds. |
| `readcheck` | Who Read It Right? | w1-4 | Kai and Suki read a word, and you spot who read it right. |
| `learn` | New Sounds (in the dojo) | w2-1 | I'll say each sound, and show you how we write it. |
| `battle` | a monster battle | w1-6 | I say a word, and you find its sounds to zap the monster. |
| `boss` | a boss battle | w1-15 | A boss needs lots of words to beat it. |
| `trial` | a gem battle | the first Gem Trial | Spell the words before the bar fills, and the gem is yours. |
| `review` | Sensei's Challenge | the map's button | Words from all your games, to see how many you can zap. |
| `swap` | Sound Swap | w1-8 | We change one sound, to make a new word. |
| `sort` | Sorting | w6-br1 | Every word goes in the chest with the same spelling. |
| `run` | Ninja Run | w1-9 | Your ninja runs, you tap to jump, and you catch the word. |
| `story` | Story Time | w1-14 | I read some pages to you, and you read some to me. |

---

## 1. The preschool path, in play order

### 1.1 The film and Choose your ninja

*Voice:* a storyteller for the film (unchanged). At Choose, a presenter meeting the child for the first time: warm, delighted and unhurried.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| film_1 | shot 1 | the World Flower | Long ago, on the Island of Sounds, there grew a magic World Flower. | — |
| tv_film_arrow | film_1 has ended; once per save | ▶ pops in, pulsing; the pointing hand on it | When you're ready to see what happens next, tap the green arrow. | taps ▶ |
| film_2 … film_8 | each shot, held on ▶ | unchanged | (unchanged) | taps ▶ after each |
| tv_choose_hello | Choose appears, 0.0 s | Sensei's portrait glows; the Kai and Suki cards | Hello, I'm Sensei Maple. I'm going to train you to be a Super Ninja. | — |
| tv_choose_q | 5.2 s | Kai spotlit on "Kai", Suki on "Suki" | First, choose your ninja. Will it be Kai, or Suki? | taps a ninja (live from 5.2 s) |
| chose | the tap | the chosen ninja bows | Great choice! Let's rescue those sounds! | — |
| (none) | the settle ring is full | ▶ pulses (the idle ladder, §3.1) | — | taps ▶ |

`intro_8` ("I am Sensei Maple. I will train you. Now, choose your ninja!") retires. Kai and Suki are now named at first sight, so the reading check can say "Look, it's Kai and Suki" later.

### 1.2 The opt-in: "Do you go to big school yet?"

*Voice:* a friendly question, not a quiz. "If not yet…" and "If you do…" go slowly, each landing on its spotlit card.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_opt_why | 0.0 s, the cards land | the teddy and school cards; ▶ dim | Before we start, I want to choose the right games for you. | — |
| fm_opt_q1 | 4.3 s | both cards bob once | Do you go to big school yet? | — |
| tv_opt_notyet | 7.2 s | the teddy spotlit | If not yet, tap the teddy. | taps (any time from landing) |
| tv_opt_yes | 9.7 s | the school spotlit | If you do, tap the school. | taps |
| fm_opt_echo_notyet ↻ | the teddy tapped | the settle ring fills | Not yet. | — |
| fm_opt_echo_school | the school tapped | the settle ring fills | Big school! | — |
| fm_opt_q1_again ↻ | 8 s, no tap | both cards bob | Teddy, or school? Tap one. | taps |
| fm_opt_ok_notyet ↻ | ▶ after the settle | the badge flies to the grown-ups' gear | Then I've set up some listening games, just for you. | — |
| tv_opt_grownups | straight after | the gear glows and wiggles | Grown-ups, you can change this later in the settings. | — |

- `tv_opt_grownups` replaces `fm_opt_grownups` and says out loud who it is for.
- Screen B keeps its lines, re-recorded with full stops where they are instructions: `fm_opt_unsure` ↻ "Not sure? Tap the cloud." and `fm_opt_q2_again` ↻ "Tap your class." The class labels ("Reception!") and confirmations keep their text; `fm_opt_ok_*` ↻ end in full stops.

### 1.3 The dojo welcome: three ninja tricks (the tutorial)

*Voice:* a teacher on a class's first morning. Brisk and playful on "Trick one / two / three". Slow and inviting on "Try it now." The rhyme is whispered, like a secret.

What's new: the three grey stars at the top now mean something (one star per trick), and the speaker gets something real to say again (SCRIPT_FIXES C19). The welcome ends on a real readiness check that leads into the first game.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_train_hello | 0.0 s, the dojo fades in | three grey stars appear at the top, one after another | Welcome to my dojo, ninja. I'll teach you three little ninja tricks. | — |
| tv_train_gong | 4.8 s | the gong glows; the pointing hand on it | Trick one is the gong. Can you tap the big gong? | taps the gong (at about 8.8 s) |
| tv_train_gong_ok | the kick lands: BONG, and the first star lights | the ninja lands its kick | Bong! That's how ninjas start their training. | — |
| tv_train_help | 2.6 s after the gong | the ninja scratches its head; the big arrow sweeps from the ninja to Sensei | Trick two. If you're ever stuck, tap me, down here in the corner. | — |
| tv_try_now | straight after | Sensei's button pulses | Try it now. | taps Help |
| fm_help_ok ↻ | Help tapped; the second star lights | Sensei waves | That's it! I'm always here to help. | — |
| tv_train_speaker | 2.5 s later | the speaker pops into the nav row, glowing | Trick three is the speaker. Here's a little ninja rhyme. | — |
| tv_rhyme | straight after | the ninja tiptoes on the spot | Tip, tap, tiptoe, quiet as a mouse. | — |
| tv_train_hear_again | straight after | the pointing hand on the speaker | To hear it again, tap the speaker. Try it now. | taps the speaker |
| tv_rhyme (again) | the speaker's replay | the ninja tiptoes again | Tip, tap, tiptoe, quiet as a mouse. | — |
| tv_train_speaker_ok | straight after; the third star lights | the stars shine | That's it! The speaker always says it again. | — |
| tv_train_done | straight after | the ninja powers up | Three tricks, three stars. Now you're ready for your first game. | — |
| tv_first_game | straight after | ▶ pops in; the ninja faces it in its ready stance | It's a listening game, called Ninja Ears. Tap the green arrow when you're ready. | taps ▶ |

- **Idle:**
  - The gong: 8 s, the gong glows; 16 s, `tv_train_gong` again.
  - The Help step: 8 s, `tv_try_now` again; nothing taps it for the child.
  - The speaker step: 8 s and 20 s, `tv_train_hear_again`.
- **Retired:** `tut_1`, `fm_help_short`, `fm_speaker`, `st_speaker_ok`.
- The rhyme seeds the first story ("Tip, tap, tip, tap.").

### 1.4 W1, Ninja Ears: the first lesson

*Voice:* calm and cosy, a picture-book pace. The only lifts are "There it is!", "Into the pocket it goes!" and the celebrations. Pause about a second before every held or stretched word.

The lesson is four small games, each framed. Its taps are ▶, the sock, ▶, the tortoise, the rabbit, the sun, the sock, the petal, ▶, and two finds. What it drops from today: "Ninja ears on!", "Let me show you!", "Now you try!", "Tap the sun!" in the demo, "Watch me first!" over an empty stage, "Did you notice?" and "Say that sound with me!" (the petal tap replaces it). The rabbit stops being optional here: it is the child's tap that splits the talk (D6).

#### A. Find the Picture (`tap`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_find_frame | 0.0 s | the sun, sock and cat drop in (220 px, one row); the lesson beads light at the top | In this game, I say a picture, and you find it. | — |
| fm_name_sock · fm_name_cat | 4.4 s | each card spotlit for its own clip (warm-white ring) | This is a sock. This is a cat. | (a tap on a card echoes its name) |
| tv_find_demo | 7.7 s | the paw sets off on "looking" and taps the sun on "There"; the sun is spotlit on "sun"; the ninja kicks the sun's corner; a star stamp | I'll go first. I'm looking for the sun… There it is! | watches |
| tv_ready_first | 11.7 s | ▶ pops in, pulsing; the ninja turns to face it in its ready stance; ▶ is live from the first word | Now it's your turn. Look, your ninja is ready. Are you ready too? Tap the green arrow. | taps ▶, or a card |
| (none) | the answer | the ninja bows; a soft chime | — | — |
| tv_where_<w> (sock) | after the bow | the cards stay live | Where's the sock? | taps the sock |
| [sock] · tv_found_<w> (sock) | a right tap | the sock goes green; the ninja's kick and a star stamp | [sock] You found the sock! | — |
| [cat] · tv_find_again_<w> (sock) | a wrong tap | the cat wobbles (400 ms, never red) and says its word | [cat] Can you find the sock? | taps again |
| tv_find_again_<w> | 8 s, no tap | the sock glows | Can you find the sock? | taps |
| tv_its_this | a second miss, or 16 s | the paw points at the sock and waits | It's this one. You tap it. | taps the sock |

#### B. The rabbit and the tortoise (`fastslow`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_ts_meet | 0.0 s | the sock and cat slide back; the sun moves to the centre (300 px) above its sound ribbon; the rabbit pops in on "rabbit" and the tortoise on "tortoise", each spotlit | Meet my friends, the rabbit and the tortoise. | — |
| tv_ts_fast | 3.3 s | the paw taps the rabbit as the clip starts: the card hops, the ribbon zips across, the ninja dashes out and back | The rabbit says words fast… [sun] | watches |
| tv_ts_slow | 6.4 s | the paw taps the tortoise: the card stretches like elastic, the ribbon draws left to right, three dots pop on as each sound begins, the ninja's slow-motion kata | The tortoise says them slowly… [sun, slowly] | watches |
| tv_ready_paw | 10.5 s | ▶ and the paw pop in; ▶ spotlit on "arrow", the paw on "paw" | Your turn next. Ready? Tap the arrow. Or, to see it again, tap my paw. | taps ▶ (or the paw) |
| tv_show_again | the paw tapped | the show replays exactly (the paw, the rabbit, the tortoise) | Of course. Watch again. | watches |
| tv_ready_now | the replay has ended | ▶ back, pulsing | Ready now? Tap the arrow when you want a go. | taps ▶ |
| fm_tap_tortoise ↻ | after the bow | the tortoise pulses | Tap the tortoise, and say it slowly with me. | taps the tortoise |
| (clip) | the tap | the stretch, the ribbon, the kata | [sun, slowly] | says "sssuuunnn" along |
| fm_same_word | 1 s after the tap | the card snaps back | Fast or slow, it's the same word. Sun! | — |
| fm_hear_sounds ↻ | straight after | the three dots pulse in turn | When I say a word slowly, I can hear the sounds that make up the word. | — |
| fm_tap_rabbit ↻ | straight after | the rabbit pulses | Now tap the rabbit, and say it fast. | taps the rabbit |
| (clip) | the tap | the hop, the dash | [sun] | says "sun" |

`fm_hear_sounds` loses its second sentence ("Words are made of sounds!"), which opens the next beat instead.

#### C. Ninja ears (`notice`, a show the child drives)

The child taps the two cards to hear their first sounds, so they notice the sound themselves. The first petal is named the moment it appears, not 2:45 later. This needs a Warmup.tsx change (lane C2): in this beat the cards are tappable and each says its held first sound.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_made_of_sounds | 0.0 s, after the rabbit's hop | the sun and sock slide side by side (260 px), each with its three dots | Words are made of sounds. Let's listen for the very first one. | — |
| tv_ears_on | 4.7 s | the ninja cups its hand behind its ear (the `listen` pose) | Look, your ninja has its ninja ears on. That means listening really carefully. | — |
| tv_tap_the_<w> (sun) | 10.2 s | the sun glows | Tap the sun. | taps the sun |
| (clip) | the tap | the sun's first dot swells gold | [sun, first] | listens |
| tv_now_tap_<w> (sock) | straight after | the sock glows | Now tap the sock. | taps the sock |
| (clip) | the tap | the sock's first dot swells to the same gold | [sock, first] | listens |
| fm_notice_sun_sock ↻ | straight after | both gold dots pulse; the /s/ petal arrives in the middle (hero size), misty, and blooms on the sound (SOUND_DISPLAY §4.6) | Sun and sock start with the same sound… /s/ | — |
| tv_petal_first | straight after | the petal breathes | That sound has its very own petal. Tap it, and say the sound with me. | taps the petal |
| (clip) | the tap | the petal swells, then glides to the nav row's sound slot | /s/ | says /s/ |

- `fm_notice_sun_sock` ↻ drops "Did you notice?".
- **Retired from this beat:** `fm_first_listen`, `t_everyone_say` and the Next hold (`W1:7`). The petal tap is the pause for the child's voice, and it ends the beat.
- **Idle:**
  - A card not tapped: at 8 s it glows again; at 16 s the paw points at it.
  - The petal not tapped: at 8 s it swells and says /s/; at 12 s the lesson goes on.

#### D. Pocket Hunt (`tapall`, start, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pocket_frame | 0.0 s | the sun, sausage, moon, sock and cat in two rows; three dashed pockets glow on the right | It's a pocket hunt! Find every picture that starts with… /s/ | — |
| fm_name_sausage · fm_name_moon | 4.6 s | the two new cards spotlit | This is a sausage. This is the moon. | (an early tap echoes) |
| tv_watch | 7.9 s | the paw sets off towards the sun | Watch. | watches |
| (clip) | the paw taps the sun | the sun's first dot glows | [sun, first] | — |
| tv_into_pocket | 9.8 s | a mini-sun flies into the first pocket; a shuriken pins a star on the card | Into the pocket it goes! | — |
| tv_pocket_ready_<n> (two) | 11.7 s | ▶ pops in; the ninja faces it | Now you find the other two. Ready? | taps ▶ |
| (none) | after the bow | the petal breathes; nothing is said | — | finds the sock and the sausage |
| (clip) | each find | the card's held first sound; a mini-card flies to a pocket; a shuriken | [sock, first] | — |
| [moon, first] · fm_diff_moon | a wrong tap (moon) | the moon wobbles | [moon, first] Moon starts with a different sound. | — |
| [cat] · fm_diff_cat | a wrong tap (cat) | the cat wobbles | [cat] Cat starts with a different sound. | — |
| tv_petal_hint | 8 s, no tap | the petal swells | Tap the petal if you want to hear the sound again. | — |
| fm_look_this ↻ | two misses, or 16 s | the targets left glow | Look. This one starts with… /s/ | taps |
| fm_found_both | both found | all three pockets glow; the ninja's biggest move; a spell burst | You found them both! They both start with… /s/ | — |
| fm_l1_done | straight after | every bead lit; the sticker bead bursts | You can hear the sounds in words. Brilliant listening! | — |

### 1.5 Reward 1: the Sticker Book

*Voice:* genuine delight: this is the first celebration, so the exclamation marks stay.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_rw_look | the last move lands; a gong and confetti | the five cards rise into a fan and flip into stickers | Look! Your pictures are turning into stickers! | — |
| fm_rw_book | the book swoops in | the book thumps, pops its clasp and opens | This is your Sticker Book! | — |
| fm_rw1_list | the stickers fly in, one per word | each sticker lands on its own word | Sun, sock, cat, sausage and moon! | — |
| fm_rw_every | the page glows | a big "5" badge thunks into the corner | Every picture you play with becomes a sticker! | — |
| tv_rw_tap | the sun sticker wiggles; the hand points at it | | Tap a sticker, and it will say its word. | taps a sticker |
| (clips) | the tap | the sticker pops and spins | [sun] [sun, slowly] | — |
| tv_rw_fast_slow | the first sticker tap only | the rabbit and tortoise peek in | Fast, then slow, like the rabbit and the tortoise! | — |
| fm_rw_next ↻ | the book tucks into the ninja's pack | ▶ bounces in the play area | Ready for the next game? Tap the green arrow. | taps ▶ |

`fm_rw_tap` ("Tap a sticker!") retires. With no sticker tap after 8 s, the hand wiggles again and `tv_rw_tap` is said once more. Nothing moves on by itself.

### 1.6 W2, Ninja Reading: the second lesson

*Voice:* bouncier than W1: mash-ups and magic tricks. A giggle in "Fish dog!". "Ninjas read this way!" is the one line allowed a big "!", because the ninja runs as it is said.

#### A. Ninja Reading (`rail`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rail_frame | 0.0 s | the bamboo reading rail slides in; the brush arrow at its left end glows | This is a reading rail. | — |
| fm_l2_way | 2.2 s | the ninja runs along the rail from the arrow to the end, with a speed trail | Ninjas read this way! | — |
| fm_name_fish · fm_name_dog | 4.0 s | the fish and the dog land on the rail, each spotlit | This is a fish. This is a dog. | — |
| tv_watch_me_read | 7.3 s | the ninja steps to the arrow | Watch me read them. | watches |
| fm_read_fish_dog | 9.1 s | a light passes under each card on its word; the two bump and merge into a fish-dog | Fish… dog. Fish dog! | — |
| tv_ready_q1 | 12.1 s | the fish-dog splits back; ▶ pops in | Now you read them. Ready? | taps ▶ |
| tv_rail_turn | after the bow | the fish pulses | Tap them the ninja way, starting at the arrow. | taps the fish, then the dog |
| (clips) | each tap | a hop under the tapped card | [fish] … [dog] | — |
| fm_pair_fish_dog · tv_silly | both tapped in order | the merge; the ninja laughs | Fish dog! What a silly animal! | — |
| tv_start_arrow | the dog tapped first | the dog wiggles; the arrow pulses | Ninjas always start at the arrow, on this side. | taps the fish |

The demo's second "Fish dog!" goes (SCRIPT_FIXES C17.4). `fm_l2_turn` and `fm_l2_start` retire.

#### B. The swap (a show, ◇)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_l2_swap | the beat starts | the ninja leapfrogs the cards; they swap and merge into a dog-fish | Whoops! Now they're the other way round. Dog... fish. Dog fish! | — |

#### C. The two-rail game (`which`, full: the demo is never dropped at the first meeting)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_which_frame | 0.0 s | two short stacked rails: fish–dog on top, dog–fish below | Now there are two rails. I'll read one of them, and you tap the one I read. | — |
| tv_which_demo | 6.3 s | a light passes under fish, then dog, on the top rail as each is said | I'll go first. Fish… dog. | watches |
| tv_which_demo_found | 8.8 s | the paw taps the top rail; it glows; a crown of stars | Fish, then dog. That's this one! | — |
| tv_ready_q2 | 11.0 s | new rails drop in: cat–dog and dog–cat; ▶ pops in | Do you want to have a go now? | taps ▶ |
| tv_which_q_<pair> (cat, dog) | after the bow | the two rails glow | Here I go. Cat… dog. Which one did I read? | taps a rail |
| fm_pair_cat_dog | a right tap | the rail's light sweeps left to right; the crown of stars | Cat dog! | — |
| tv_listen_again · tv_which_q_<pair> | a wrong tap | the rail wobbles | Let's listen again. Here I go. Cat… dog. Which one did I read? | taps |

#### D. Word Squish (`compound`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_l2_big_word | 0.0 s | the sun and a flower on the rail; the tortoise and rabbit under its right end | Two little words can make one big word! | — |
| tv_squish_name | 3.3 s | the two cards glow | Let's squish them together. | — |
| fm_name_flower | 5.2 s | the flower spotlit | This is a flower. | — |
| tv_squish_demo | 6.9 s | the paw taps the tortoise: each card lights in turn; then the rabbit: the cards zip together and bloom into a sunflower | Watch. I say them slowly: sun… flower. I say them fast: sunflower! | watches |
| tv_squish_ready | 11.9 s | the star and fish land on the rail; ▶ pops in | Now you make one. Ready? | taps ▶ |
| fm_name_star | after the bow | the star spotlit | This is a star. | — |
| fm_starfish_q ↻ | straight after | the rabbit pulses after a 1.5 s pause | Star… fish. Tap the rabbit to say them fast. | taps the rabbit |
| fm_starfish | the tap | the ninja throws its golden star onto the fish: a waving starfish | Starfish! | — |

`fm_sunflower` ("Say them slowly… Say them fast…", the child's command inside Sensei's demo) retires for `tv_squish_demo`.

#### E. One more pocket hunt (◇, the none form) and the close

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pocket_once_more | ◇, when the lesson isn't behind | a 2×2 grid: sunflower, sock, fish and dog; two pockets | One more pocket hunt. Find the pictures that start with… /s/ | finds two |
| fm_found_both | both found | the pockets glow | You found them both! They both start with… /s/ | — |
| fm_l2_done | the close | every bead lit | You read the pictures, just like a real reader! | — |

`fm_quick_tap_all` ("Quick! …") retires.

### 1.7 Reward 2, the World Flower's first glimpse, and the first map

*Voice:* celebration, then wonder (hushed on "shining through the mist"), then the practical calm of a map.

Three held steps, each ending on ▶. The petal step gets a turn (tap the petal), so the child isn't only watching for 38 s.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_rw2_list | step 1: a gong; the book pops open; six stickers fly in on their words | the counter flips from 5 to 11 | Fish, dog, flower, sunflower, star and starfish! | — |
| fm_rw_shiny | a drumroll | a shiny fish-dog sticker lands, with a rainbow sweep | Ooh, a shiny sticker! Fish dog! | — |
| fm_rw2_s | the /s/ stickers hop in turn, each first dot gold | the /s/ petal in the nav row swells on the sound | Sun, sock, sausage and sunflower. They all start with… /s/ | taps ▶ |
| fm_rw2_petal | step 2: the book flies to the map; a real World Flower (420 px), every petal in mist; the /s/ petal blooms into colour | the ninja powers up, facing the flower | You found your very first sound! Look, its petal is shining through the mist. | — |
| tv_rw2_flower | straight after | the flower's heart glows | This is the World Flower. Your sounds make it shine. | — |
| tv_rw2_tap_petal | straight after | the /s/ petal breathes | Tap your petal, and hear its sound. | taps the petal |
| (clip) | the tap | the petal swells | /s/ | says /s/, then taps ▶ |
| tv_map_intro | step 3: the flower flies into the map's flower button; the map fades in; the stones glow in a wave | the ninja stands on stone 2 | This is the map of Bamboo Village. Every stone is a game. | — |
| fm_rw2_map | the Sticker Book button bounces | | Your Sticker Book lives here, on the map! | — |
| tv_map_flower | the World Flower button glows | | And your World Flower lives here. | — |
| tv_map_hint | the ninja hops to stone 3; it bounces with the pointing hand | | The glowing stone is your next game. Tap it when you're ready. | taps the stone |

- `audit_petal_means` retires here (the petal was named in W1).
- `map_hint` retires for `tv_map_hint`.
- **Later map arrivals** follow SCRIPT_FIXES C6, with the arrival lines in §3.7:
  - the land's welcome once a session;
  - `tv_map_hint` on the save's first two arrivals only;
  - after that, silence while the ninja walks, and `tv_map_hint` as the map's 8 s idle nudge.

### 1.8 W3, Ninja Ears: slow words and sounds inside words

**Forms:** W3 usually opens the second session, so the rabbit and the tortoise are a recap; Slow Words and the "inside" pocket hunt are first meetings. If W3 comes in the same session as W1, the tortoise part is the short form: drop its ▶.

*Voice:* as W1. The new pocket hunt gets a little conspiratorial hush on "hiding inside the words".

#### A. The rabbit and the tortoise (`fastslow`, recap)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_w3_hello | 0.0 s | the mug drops in above its ribbon; the rabbit and the tortoise pop in either side | Ninja Ears again, with the rabbit and the tortoise. | — |
| fm_name_mug | 3.3 s | the mug spotlit | This is a mug. | — |
| tv_ts_fast | 5.1 s | the paw taps the rabbit: hop, zip, dash | The rabbit says words fast… [mug] | watches |
| tv_ts_slow | 8.2 s | the paw taps the tortoise: stretch, ribbon, dots, kata | The tortoise says them slowly… [mug, slowly] | watches |
| tv_ready_q3 | 11.9 s | ▶ and the paw | Ready to have a go? | taps ▶ |
| fm_tap_tortoise ↻ | after the bow | the tortoise pulses | Tap the tortoise, and say it slowly with me. | taps; says it |
| fm_hear_sounds ↻ | 1 s after the tap | the three dots pulse in turn | When I say a word slowly, I can hear the sounds that make up the word. | — |
| fm_tap_rabbit ↻ | ◇ here | the rabbit pulses | Now tap the rabbit, and say it fast. | taps |

The rabbit and tortoise lines are the same for every word, so W3 needs no `fm_fast_mug` (SCRIPT_FIXES C17.1 is solved without a new recording).

#### B. Slow Words (`slowpick`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_slow_frame | 0.0 s | the rabbit and tortoise tuck away; the van and bag drop in beside the mug | Next, I say a word slowly, like the tortoise. You find its picture. | — |
| fm_name_van · fm_name_bag | 5.1 s | each spotlit | This is a van. This is a bag. | — |
| tv_first_go | 8.4 s | the paw lifts | I'll go first. | watches |
| (clips) | 9.8 s | the paw glides to the mug in bullet time under the stretched word, then taps it on the fast word; a gift | [mug, slowly] … [mug] | — |
| tv_ready_q1 | 12.6 s | ▶ pops in | Now you. Ready? | taps ▶ |
| tv_slow_q | after the bow | the cards glow faintly | Here's a slow word for you… [van, slowly] | — |
| fm_which_pic | straight after | | Which picture is it? | taps the van |
| (clips) | a right tap | a bullet-time gift, snapping to full speed on the fast word | [van, slowly] … [van] | — |
| [bag] · tv_slow_again | a wrong tap | the bag wobbles and says its word | [bag] Let's listen again… [van, slowly] | taps |
| tv_its_this | a second miss, or 16 s | the paw points at the van | It's this one. You tap it. | taps |

`fm_slow_listen` and `fm_slow_another` retire.

#### C. Pocket Hunt, inside the words (`tapall`, in: the full form of a new variant)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pocket_in_frame | 0.0 s | the cat, bag, jam, van, sun and dog in two rows; four pockets glow | A new pocket hunt! This time, the sound is hiding inside the words. | — |
| tv_find_in | 4.7 s | the /a/ petal arrives in the middle, misty, and blooms on the sound (a new sound) | Find every picture with this sound in it… /a/ | — |
| tv_new_petal | 8.2 s | the petal breathes | A new sound! Tap its petal, and say it with me. | taps the petal (live from 7.9 s) |
| (clip) | the tap | the petal swells, then glides to the nav slot | /a/ | says /a/ |
| fm_name_jam | straight after | the jam spotlit | This is some jam. | — |
| tv_watch | straight after | the paw sets off to the cat | Watch. | watches |
| (clip) | the paw taps the cat | three dots under the cat; the middle one glows as /a/ is held | [cat, slowly] | — |
| tv_hear_in_<w> (cat) · tv_into_pocket | straight after | a mini-cat flies to the first pocket | I can hear it in cat. Into the pocket it goes! | — |
| tv_pocket_ready_<n> (three) | about 9 s after the petal tap | ▶ pops in | Now you find the other three. Ready? | taps ▶ |
| (clip) | each find | a mini-card to a pocket | [bag, slowly] | — |
| [dog, slowly] · fm_not_in_dog | a wrong tap | the dog wobbles | [dog, slowly] Dog doesn't have that sound in it. | — |
| fm_found_all · t_they_all_have | all found | the pockets glow | You found them all! They all have the sound… /a/ | — |

`fm_tap_all_in` ("Tap all the pictures with this sound in them…") retires for `tv_find_in`.

#### D. Pocket Hunt again (`tapall`, start, short) and the close

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pocket_again | 0.0 s | the mug, moon, map, sun and cat; three pockets; the /m/ petal arrives misty and blooms (a new sound, no tap) | One more pocket hunt. Find every picture that starts with… /m/ | — |
| fm_name_map | straight after | the map spotlit | This is a map. | finds three |
| fm_found_all · fm_all_start | all found | the pockets glow | You found them all! They all start with… /m/ | — |
| tv_w3_done | the close | every bead lit | You heard sounds at the start of words, and inside them. Super listening! | — |

`fm_l1_done` is no longer said twice (SCRIPT_FIXES C17.5).

### 1.9 W4, Ninja Reading: three in a row

**Forms:** recap in a later session. In the same session as W2 it is the short form: drop the ▶s, and Word Squish loses its demo.

*Voice:* as W2.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rail_recap | 0.0 s | the rail slides in; the cat, dog and fish land on it | It's Ninja Reading again. This time, there are three pictures! | — |
| tv_watch_me_read | 4.0 s | the ninja steps to the arrow | Watch me read them. | watches |
| fm_read_cat_dog_fish | 5.5 s | the light passes under each card on its word | Cat… dog… fish. Cat-dog-fish! | — |
| tv_ready_q1 | 9.2 s | ▶ pops in | Now you read them. Ready? | taps ▶ |
| tv_rail_turn | after the bow | the cat pulses | Tap them the ninja way, starting at the arrow. | taps the three in order |
| fm_triple_cat_dog_fish | all three in order | a hop under each card | Cat dog fish! | — |
| tv_start_arrow | a wrong order | the card wiggles; the arrow pulses | Ninjas always start at the arrow, on this side. | — |
| fm_l4_swap | the swap show | the ninja leapfrogs; the cards swap | Now they're the other way round. Fish... dog... cat. Fish dog cat! | — |
| tv_which_recap | two rails drop in: fish–dog–cat and cat–dog–fish | the swap show was the demo | It's the two-rail game again. Tap the one I read. | — |
| tv_ready_q3 | straight after | ▶ | Ready to have a go? | taps ▶ |
| tv_which_q_<three> (fish, dog, cat) | after the bow | both rails glow | Here I go. Fish… dog… cat. Which one did I read? | taps a rail |
| fm_triple_fish_dog_cat | a right tap | the light sweeps; the crown of stars | Fish dog cat! | — |
| tv_squish_recap | the rain and bow land on the rail | the tortoise and rabbit under it | It's Word Squish again. Two little words make one big word. | — |
| tv_squish_demo · tv_squish_ready | the recap form only | the canonical sunflower demo on its own cards, then ▶ | (as §1.6 D) | taps ▶ |
| fm_name_rain · fm_name_bow | straight after | each spotlit | This is rain. This is a bow. | — |
| fm_rainbow_q ↻ | straight after | the rabbit pulses | Rain… bow. Tap the rabbit to say them fast. | taps the rabbit |
| fm_rainbow | the tap | the bloom | Rainbow! | — |
| fm_name_snow · fm_name_man · fm_snowman_q ↻ · fm_snowman | the second word | as above | This is snow. This is a man. Snow… man. Tap the rabbit to say them fast. … Snowman! | taps the rabbit |
| tv_w4_done | the close | every bead lit | You read three pictures in a row, just like a real reader! | — |
| tv_practise_again | the reward, when the lesson repeats (`needsRepeat`); said on the held reward step, never over the map | the stickers settle | That game was a bit tricky. Let's play it again, and it will feel easier. | taps ▶ |

`fm_practise_again` retires, because it was always cut off on the map. The repeated W4 plays in the none form: the names, the reading and the questions only.

### 1.10 W5, Guess My Word

*Voice:* playful mystery. A tiny pause after "Here are my sounds…", and each sound crisp and pure.

The sounds are the question here, so **no petals** while they play; neutral dots light one per sound (SOUND_DISPLAY A1).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_guess_frame | 0.0 s | the sun and a dog drop in; a row of three grey dots under the stage | Guess My Word! I'll say the sounds, and you listen for the word. | — |
| fm_name_sun · fm_name_dog | 4.7 s | each spotlit | This is the sun. This is a dog. | — |
| tv_my_sounds | 8.0 s | the paw lifts; a dot lights on each sound | My sounds are… /s/ /u/ /n/ | watches |
| tv_i_hear_<w> (sun) | 11.2 s | the paw taps the sun; it bounces | I can hear sun! | — |
| tv_ready_q2 | 12.9 s | ▶ pops in | Do you want to have a go now? | taps ▶ |
| fm_name_map · fm_name_mop · fm_name_man | after the bow | three cards drop in, each spotlit | This is a map. This is a mop. This is a man. | — |
| tv_here_my_sounds | 1 s later | the dots light one per sound | Here are my sounds… /m/ /a/ /p/ | — |
| fm_which_pic | straight after | | Which picture is it? | taps a picture |
| (clips) | a right tap | the dots bloom into small petals under the map | /m/ /a/ /p/ [map] | — |
| [mop] · tv_guess_again | a wrong tap | the mop wobbles and says its word | [mop] Let's listen again… /m/ /a/ /p/ | taps |
| tv_its_this | a second miss, or 16 s | the paw points at the map | It's this one. You tap it. | taps |
| (items 2–6) | as the first; after two first-try answers in a row, "Which picture is it?" drops (SCRIPT_FIXES A6) | | This is a cap. … Here are my sounds… /k/ /a/ /t/ | taps |
| fm_last_one ↻ | before the last item | | Here's the last one. | — |
| tv_w5_done | the close | every bead lit | You listened to the sounds, and you heard the words. | — |
| t_if_you_say_sounds ↻ | straight after | the ninja nods | If you say the sounds, you can hear the word. | — |

- **Retired:** `fm_l1_hello` from W5, `audit_made_of_sounds` ("Remember? …", a question nobody can answer), `fm_sounds_intro` and `fm_l5_done`.
- `t_if_you_say_sounds` is Sounds~Write's explicit reminder, which no run had ever said.

### 1.11 W6, Sound Dots

*Voice:* crisp and rhythmic. The dots are tapped like a drum; the word at the end is a small "ta-da".

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_dots_frame | 0.0 s | the sun card; under it a ribbon with three grey dots, the arrow at its left end | Sound Dots! Every dot is one sound in the word. | — |
| tv_dots_demo | 4.0 s | the paw goes to the first dot | Watch me tap each dot, and say its sound. | watches |
| (clips) | 7.3 s | the paw taps each dot; each one lights and becomes a mini petal of its sound | /s/ /u/ /n/ | — |
| tv_dots_word_ido | 9.7 s | the paw sweeps along the ribbon | Then I say the word… [sun] | — |
| tv_dots_ready | 12.2 s | the cat drops in with three grey dots; ▶ pops in | Now you tap the dots, and say the sounds with me. Ready? | taps ▶ |
| fm_name_cat | after the bow | the cat spotlit; the first dot pulses | This is a cat. | taps the three dots |
| (clips) | each dot | the dot lights and turns into its mini petal | /k/ /a/ /t/ | says them |
| tv_now_say_word | the third dot | the sweep | Now say the word… [cat] | says "cat" |
| tv_start_arrow | a dot tapped out of order | the dot wiggles; the arrow pulses | Ninjas always start at the arrow, on this side. | — |
| fm_name_dog · fm_name_mug | items 2 and 3, with no stems | as above | This is a dog. … This is a mug. | taps the dots |
| fm_l6_done | the close | every bead lit | Now you're ready to find out how we write the sounds! | — |

`fm_dots_intro`, `fm_dots_turn` and `fm_dots_say` retire.

### 1.12 Between the stones: level rewards and the map

- **Every level ends on its own closing line**, which is its praise and wrap-up (the per-game closes are in §3.5).
- **Then comes the level reward** (§3.6):
  - it leads with the news, not "You did it!";
  - it names won sounds as sounds, and their petals rise as each sound plays;
  - the stickers fly silently after the session's second reward;
  - it holds on ▶.
- **The map follows** (§3.7): a land's welcome once a session, and otherwise the ninja walks to the next stone without a word.
- **Levels start after the map has faded** (SCRIPT_FIXES C18), so no introduction is ever said over the map.

### 1.13 w1-2, First Sounds, and the first letters

*Voice:* a teacher sitting beside the child at a little table. "Hmm, let me listen" is real thinking, with a beat before the held word. "Now watch my ninja write it" has a spark of magic.

This is the child's first meeting with First Sounds, with letters and with Letter Hunt. The demo is split by a join-in (the petal tap), so no run passes 12 s. Letters appear on the child's own first right answer (the "we do"), not in Sensei's demo, which keeps each run short and puts the first letter under a picture the child found.

#### A. First Sounds (`firstsound`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_frame | 0.0 s, the level on screen | the dojo room; the ninja bottom left | First Sounds! I say a sound, and you find the picture that starts with it. | — |
| tv_first_ido | 5.9 s | the /m/ petal arrives in the middle, misty, and blooms on the sound (a new sound) | I'll go first. My sound is… /m/ | watches |
| tv_petal_say | 8.9 s | the petal breathes | Tap the petal, and say it with me. | taps the petal (live from 8.6 s) |
| (clip) | the tap | the petal swells, then glides to the nav row's sound slot | /m/ | says /m/ |
| fm_name_map · fm_name_hat | 0.0 s after the tap | the map and the hat drop in, each spotlit | This is a map. This is a hat. | — |
| tv_let_me_listen | 3.3 s | the ninja cups its ear | Hmm, let me listen. | watches |
| (clip) | 5.1 s | the map spotlit | [map, first] | — |
| fs_map | 6.2 s | the petal swells on the sound | Map starts with… /m/ | — |
| tv_so_i_tap | 8.5 s | the paw taps the map; it goes green; the ninja's kick | So I'll tap it. | — |
| tv_ready_q2 | 10.3 s | the map slides away; ▶ pops in; the ninja faces it | Do you want to have a go now? | taps ▶ |
| fm_name_cup · fm_name_mop | after the bow | a cup and a mop drop in, each spotlit | This is a cup. This is a mop. | — |
| first_q | straight after; the answer glows after 2 s (the "we do") | the petal swells | Which one starts with… /m/ | taps the mop |
| fs_mop | the right tap | the mop goes green | Mop starts with… /m/ | — |
| tv_watch_write | straight after | the ninja casts; a line appears under the mop and < m > is written on it | Now watch my ninja write it. | watches |
| tv_how_we_write | the letter lands | < m > glows, with the petal beside it | This is how we write… /m/ | — |
| tv_tap_it_say | straight after | < m > pulses | Tap it, and say the sound. | taps < m >; says /m/ |
| tv_spelling_is | the tap; once per save | the letter shines | Writing a sound down is called spelling. | — |
| tv_by_yourself | the third item (the "you do") | a mug and a zip drop in | All by yourself this time. | — |
| fm_name_mug · fm_name_zip | straight after | each spotlit | This is a mug. This is a zip. | — |
| st_first_q2 | straight after; no glow | the petal swells | Which picture starts with… /m/ | taps the mug |
| fs_mug | the right tap | < m > is written under the mug, silently (SCRIPT_FIXES C9) | Mug starts with… /m/ | — |
| tv_praise_start | only if praise is due (§3.3) | the ninja's move | You listened right to the very start. | — |

**The second sound, /s/** is an I do (no ▶), then a we do, then a you do:

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_new_sound_ido | after the mug | the /m/ cards slide away | Now a new sound. I'll go first again. | — |
| tv_my_sound | straight after | the /s/ petal pops in (known: no mist) | My sound is… /s/ | — |
| tv_know_this_<p> (s) | straight after | the petal shows its picture | You know this one, from sun and sock! | taps the petal if they like |
| fm_name_bed · fm_name_sock | straight after | each spotlit | This is a bed. This is a sock. | — |
| tv_let_me_listen · [sock, first] · fs_sock · tv_so_i_tap | straight after | as the /m/ demo | Hmm, let me listen. [sock, first] Sock starts with… /s/ So I'll tap it. | watches |
| fm_name_sand · fm_name_van · first_q | the we do; the answer glows after 2 s | | This is some sand. This is a van. Which one starts with… /s/ | taps the sand |
| fs_sand · tv_and_how_we_write · tv_tap_it_say | the right tap | the ninja writes < s > under the sand | Sand starts with… /s/ And this is how we write… /s/ Tap it, and say the sound. | taps < s >; says /s/ |
| tv_by_yourself · fm_name_cat · fm_name_sun · st_first_q3 | the you do | | All by yourself this time. This is a cat. This is the sun. Find the one that starts with… /s/ | taps the sun |
| fs_sun | the right tap | < s > appears silently | Sun starts with… /s/ | — |
| tv_mix_up | before the four mixed items | the two petals sit side by side in the nav row | Now I'll mix them up. Listen carefully for my sound. | — |
| fm_name_<w> · first_q / st_first_q2 / st_first_q3 | each mixed item; the stems rotate (SCRIPT_FIXES A5) | the item's petal swells | This is a mat. This is some sand. Which one starts with… /m/ | taps |

#### B. Letter Hunt (`find`, full; the first item is a we do)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_letter_hunt_frame | 0.0 s | the pictures slide away; the letter tiles m and s drop in | Now it's a letter hunt. I say a sound, and you find how we write it. | — |
| tv_which_write | 5.9 s; the answer glows after 2 s | the /m/ petal swells | Which of these is the way we write… /m/ | taps m |
| (clip) | the right tap | the tile lights | /m/ | — |
| tv_find_write | the next item; no glow | | Find how we write… /s/ | taps s |
| tv_now_find | the item after | | Now find… /m/ | taps |
| tv_thats_write · we_need | a wrong tile | the tile wobbles; its sound's petal pops above it, then the target's | That's how we write… /s/ We need… /m/ | taps |
| tv_first_done | the close | | You listened for the first sound in every word, and you found how we write it. | — |

`first_intro`, `ido`, `wedo`, `youdo`, `audit_hear_see`, `how_we_spell` (on this path) and `find_q` retire. The `fm_name_zip` card is on FIRST_MINUTES's list of words a 3-year-old doesn't know, so flag it for the deck (C1 lane).

### 1.14 The level reward, then the World Flower's first visit (after w1-2)

*Voice:* the reward bright; the flower hushed and wondering.

The first visit is SCRIPT_FIXES C8 with a turn added: the child taps their own petal. Every fact is about the child's own petals.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_won_<n> (two) | the reward panel opens | the /m/ petal rises and swells on /m/, then the /s/ petal on /s/ | You won back two sounds… /m/ … /s/ | — |
| fm_rw_more | straight after | the stickers fly into the book | More stickers for your Sticker Book! | taps ▶ |
| flower_i1 ↻ | the World Flower, dark, its petals in mist | the ninja gazes up | This is the World Flower. Baron Muddle blew all its petals away. | taps ▶ |
| tv_flower_petal | the child's first petal (/s/) glows in the flower | | Every petal is one sound. This is the petal for… /s/ | — |
| tv_flower_tap | straight after | the petal breathes | Tap it, and hear its sound. | taps the petal |
| (clip) | the tap | the petal swells | /s/ | taps ▶ |
| wf_i3 | the petal opens to show its gem sockets | | Inside each petal are shiny gems. Each gem is a way to spell the sound. | taps ▶ |
| wf_found_sound | the /m/ petal blooms out of the mist | | You found a new sound! Look, here is its petal, shining through the mist. | taps ▶ |
| tv_in_<w>_way_we_spell (mat) · tg_m_m_see | the < m > gem sparkles in the /m/ petal | | In mat, this is the way we spell… /m/ We see this spelling in man and map. | taps ▶ |
| tv_in_<w>_way_we_spell (sit) · tg_s_s_see | the < s > gem sparkles in the /s/ petal | | In sit, this is the way we spell… /s/ We see this spelling in sun and bus. | taps ▶ |
| tv_flower_bye | the flower flies into the map's flower button | | Your World Flower is waiting for more sounds. Let's go and find them! | taps ▶ |

- **Retired:**
  - `flower_i2`, with its bare "Listen!" and hard-coded /a/;
  - `flower_i4` and `flower_i6` (said when they happen: the first gem fill and the first petal home), while `flower_i5` moves to the first gem that's ready (§3.6; SCRIPT_FIXES C8);
  - `yay_7` "You did it!" after a level that has its own closing line;
  - `petals_got`, which counted spellings rather than sounds.
- **The Sounds~Write formula becomes whole sentences.** "This is the way we spell /m/ in mat" is said as "In mat, this is the way we spell… /m/", so the sound ends the sentence and no tail clip ("…in mat.") is needed. It is a new generated family, `tv_in_<w>_way_we_spell`, one recording per example word; the old tail clips `tg_<g>_<p>_in` retire.

### 1.15 w1-3, First Sounds again (/a/, /t/)

**Forms:** short in the same session as w1-2, recap in a later one. For each new sound the I do stays: it teaches a new spelling (SCRIPT_FIXES C9), but it gets no ▶ in the short form.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_short | the short form, 0.0 s | the dojo room | It's First Sounds again, with two new sounds. | — |
| tv_first_recap | the recap form, instead | | It's First Sounds again. I say a sound, and you find the picture that starts with it. | — |
| tv_first_ido · tv_petal_say | straight after | the /a/ petal arrives misty and blooms (a new sound) | I'll go first. My sound is… /a/ Tap the petal, and say it with me. | taps; says /a/ |
| (the demo) | as w1-2 | | This is a cat. This is an ant. Hmm, let me listen. [ant, first] Ant starts with… /a/ So I'll tap it. | watches |
| tv_ready_q3 | the recap form only | ▶ | Ready to have a go? | taps ▶ |
| (the we do, you do, the second sound, the mixed items and Letter Hunt) | as w1-2, with stems rotating | | … | … |
| tv_letter_hunt_short | Letter Hunt's short form | the letter tiles drop in | Now it's a letter hunt. | taps |
| tv_first_done | the close | | You listened for the first sound in every word, and you found how we write it. | — |

- **Flag for the deck (SOUND_DISPLAY A12):** w1-3's apple card must go. The /a/ petal's picture is an apple, so the child would be matching two pictures instead of listening. The demo above uses the ant.
- **Flag:** w1-3's top card (a spinning top) is on FIRST_MINUTES's list of words a 3-year-old doesn't know.

### 1.16 w1-4, Word Building and Who Read It Right?

*Voice:* practical and clear, like building with blocks together. "Each line is for one sound" goes slowly, pointing. Kai and Suki are introduced like two friends arriving at the door.

#### A. Word Building (`build`, full)

The word card (a yellow speaker) and the lines are explained. Sensei's demo has two join-ins, so no run passes 11 s:
- the child taps the card to hear the word;
- "I'll start, and you finish": Sensei finds the first sound, and the child finds the last (research §1 step 7).

It ends with the Sounds~Write read-back, said together.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_frame | 0.0 s, the level on screen | the dojo; two dashed lines; the tiles a and m; the word card | Word Building! I say a word, and we build it with its sounds. | — |
| tv_build_lines | 4.7 s | the two lines glow in turn | Each line is for one sound. | — |
| tv_word_card | 7.2 s | the word card pulses; the pointing hand | This card is my word. Tap it, and hear the word. | taps the card (live from 7.2 s) |
| (clip) | the tap | the card speaks | [am] | — |
| tv_i_say_slowly | 0.0 s after the tap | the ninja cups its ear | I say it slowly… [am, slowly] | watches |
| st_hear_two | 3.7 s | the two lines pulse | I can hear two sounds. | — |
| tv_i_find_first | 5.9 s | the paw goes to the tiles | I'll find the first sound. | watches |
| (clips) | 7.7 s | the paw points at < a > on /a/; the ninja launches it onto line 1 | [am, slowly] /a/ | — |
| tv_you_find_last | 10.4 s; < m > glows after 2 s | the last line glows | Can you find the last one? | taps < m > (at about 11 s) |
| (clip) | the tap | < m > flies onto line 2 | /m/ | says it |
| tv_lets_say_read | straight after | the arrow under the lines glows; the tiles light in turn; the sweep | Now let's say the sounds… and read the word. /a/ /m/ [am] | says them, then the word |
| tv_build_ready | straight after | the tiles fly back; ▶ pops in | Let's build another one. Ready? | taps ▶ |
| tv_our_word | after the bow (the we do) | the lines are empty; the tiles a and t | Here's our word… [at] | — |
| first_sound_q | straight after; the answer glows after 2 s | the first line glows | What's the first sound? | taps < a > |
| tv_last_first | the right tap; the first time per save | the last line glows | Now the last sound. Listen right to the end… [at, slowly] | taps < t > |
| tv_lets_say_read | the word is built | the tiles light in turn; the sweep | Now let's say the sounds… and read the word. /a/ /t/ [at] | says them |
| tv_by_yourself · tv_your_word | the you do | the lines empty; the tiles a and m | All by yourself this time. Your word is… [am] | — |
| first_sound_q · last_sound_q | as the child builds; no glows | the line lights | What's the first sound? … What's the last sound? | taps |
| say_sounds_read ↻ | the word is built | the tiles light; the sweep | Say the sounds… and read the word. /a/ /m/ [am] | — |
| audit_gem_first | after the you-do word, in place of its praise | a gem pops up and fills | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. | taps ▶ |

**Retired:** `audit_dojo_first` (said over the map), `two_sounds` (said before any word existed), `ido`, `wedo`, `youdo`, `build_ido_1` and `build_ido_3`, plus the first-time use of `audit_last_place`.

#### B. Who Read It Right? (`readcheck`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_readers_meet | 0.0 s | the reading card slides in: "am" with sound buttons; Kai and Suki slide in from the sides and wave | Look, it's Kai and Suki. They're learning to read, just like you. | — |
| tv_you_read_first | 4.7 s | the sound buttons glow | First, you read this word. Tap each sound, and say it. | taps each sound (from 4.7 s) |
| (clips) | each tap | the button lights | /a/ /m/ | says them, and the word |
| tv_now_readers | the last tap | Kai and Suki step forward | Now listen to Kai and Suki read it. | — |
| kai_says · suki_says | straight after (SCRIPT_FIXES C14: the readers before the question) | each reader glows as it reads | Kai says… [at] Suki says… [am] | — |
| read_who | straight after | both readers pulse | Who read it right? | taps a reader |
| tv_yes_<reader> (suki) | the right reader | Suki cheers; the sounds light in turn | Yes! Suki read it right. /a/ /m/ [am] | — |
| tv_lets_check · tv_right_<reader> | the wrong reader | Kai scratches his head; the sounds light in turn | Let's check. Say the sounds with me… /a/ /m/ [am] Suki read it right. | — |
| read_tap_sounds ↻ | the second and third words | the new word slides in | Tap each sound, and say it. | taps |
| tv_build_done | the close | | You built words with their sounds, and you read them. | — |

`read_intro` retires.

**Flag:** the readers are Kai and Suki whichever ninja the child chose, so a child who picked Kai watches Kai read against Suki. Two other readers would avoid this (for example two panda cubs, named once). The lines above then change only in their names.

### 1.17 w1-5, Word Building with three sounds

**Forms:** Word Building's recap or short form, with the new idea (three sounds, three lines) said in one sentence. There is no I do. The paw offers the canonical `am` demo, and the first word is a we do.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_again_3 | 0.0 s | three dashed lines; the tiles m, a and t; the word card | It's Word Building again. This word has three sounds, so there are three lines. | — |
| tv_our_word | 5.9 s; the answer glows after 2 s | | Here's our word… [mat] | — |
| first_sound_q | straight after | the first line glows | What's the first sound? | taps < m > |
| tv_next_middle | the first time per save | the middle line glows | Now the next sound. It's in the middle… [mat, slowly] | taps < a > |
| last_sound_q | straight after | the last line glows | What's the last sound? | taps < t > |
| tv_lets_say_read | the word is built | the sweep | Now let's say the sounds… and read the word. /m/ /a/ /t/ [mat] | says them |
| tv_by_yourself · tv_your_word | the next word (the you do) | | All by yourself this time. Your word is… [sat] | builds it |
| tv_readers_back | Who Read It Right?, short form | Kai and Suki wave | Kai and Suki are back. First, you read the word. | taps the sounds |
| tv_build_done | the close | | You built words with their sounds, and you read them. | — |

### 1.18 w1-6, the first monster battle

*Voice:* a little dramatic on "Oh no!", then calm and confident: the child can do this. Never scary.

The first battle frames itself by comparison ("just like Word Building"). The child has built words twice, so there is no demo (the paw offers Word Building's). The letter row stays dim and can't be tapped until the child answers ▶, which fixes today's taps during the introduction.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_battle_oh_no | 0.0 s | the monster lands with a wobble; its power bar sits at the top right; the letter row is dim | Oh no! One of Baron Muddle's monsters is in the way! | — |
| tv_battle_like_build | 4.0 s | the letter row glows but stays dim | We can zap it with spelling, just like Word Building. | — |
| tv_battle_power | 7.7 s | the power bar glows and shakes | Every sound you get right zaps its power. | — |
| tv_battle_ready | 10.7 s | ▶ in the right-hand column (the letters fill the nav row); the ninja in its ready stance | Are you ready to zap it? Tap the arrow. | taps ▶; the letters wake |
| tv_battle_word | after the bow | the word card and two slots | Here's your first word… [at] | — |
| first_sound_q | the first word only | the first slot glows | What's the first sound? | taps < a > |
| (clip) | each right sound | the tile flies to its slot; the ninja strikes; the monster flinches; a chunk of power goes | /a/ | — |
| last_sound_q | straight after | the last slot glows | What's the last sound? | taps < t > |
| (clips) | the word is built | the tiles light; the sweep | /a/ /t/ [at] | — |
| tv_next_word | the next words; only the word itself from the third word on | | Here's your next word… [am] | builds |
| battle_win | the last zap | the monster runs away | Hooray! The monster ran away! | — |
| tv_battle_why | the first battle only | the stickers begin to fly | Every monster you beat helps us win back the sounds. | — |

- **Retired:**
  - `battle_start`, which framed the stakes but not the game;
  - `battle_spell` ("Spell…");
  - `audit_baron_first` from the intro. It becomes `tv_battle_why` at the first win, where it makes sense.
- The corrections are in §3.4.

### 1.19 w1-7, Sound Hunt (a sound in the middle)

*Voice:* a whisper of adventure: we're hunting.

"The middle" is shown, not defined. Under the demo word, three dots appear and the middle one glows while its sound is held.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_hunt_frame | 0.0 s | the dojo room | Sound Hunt! This time, the sound is hiding in the middle of the word. | — |
| tv_first_ido | 5.5 s | the /i/ petal arrives misty and blooms (a new sound) | I'll go first. My sound is… /i/ | watches |
| tv_petal_say | 8.5 s | the petal breathes | Tap the petal, and say it with me. | taps; says /i/ |
| fm_name_pan · fm_name_pin | after the tap | each spotlit | This is a pan. This is a pin. | — |
| tv_let_me_listen · (clip) | 3.3 s | three dots under the pin; the middle one glows while /i/ is held | Hmm, let me listen. [pin, slowly] | — |
| mid_pin | 6.8 s | the petal swells | Pin has this sound in the middle… /i/ | — |
| tv_so_i_tap | 9.3 s | the paw taps the pin | So I'll tap it. | — |
| tv_ready_q1 | 11.1 s | ▶ | Now you. Ready? | taps ▶ |
| fm_name_tap · fm_name_tin · tv_hunt_q | the we do; the answer glows after 2 s | | This is a tap. This is a tin. Which one has this sound in the middle… /i/ | — |
| tv_hear_both | straight after | the two cards light in turn | Listen to them both… [tin, slowly] [tap, slowly] | taps the tin |
| mid_tin · tv_watch_write · tv_how_we_write · tv_tap_it_say | the right tap | the ninja writes < i > under the tin | Tin has this sound in the middle… /i/ Now watch my ninja write it. This is how we write… /i/ Tap it, and say the sound. | taps < i >; says /i/ |
| tv_by_yourself · fm_name_lid · fm_name_mat · tv_hunt_q · tv_hear_both | the you do | | All by yourself this time. This is a lid. This is a mat. Which one has this sound in the middle… /i/ Listen to them both… [lid, slowly] [mat, slowly] | taps the lid |
| mid_lid | the right tap | < i > appears silently | Lid has this sound in the middle… /i/ | — |
| tv_build_with | the build phase (short form) | the lines and tiles | Now let's build some words with… /i/ | — |
| tv_our_word · (Word Building's stems) | the we do, then the you do | | Here's our word… [it] What's the first sound? … | builds |
| tv_readers_back · (Who Read It Right?, short) | the reading check | | Kai and Suki are back. First, you read the word. | taps |
| tv_hunt_done | the close | | You heard a sound right in the middle of words. That's tricky, and you did it! | — |

`hunt_intro` (said over the map), `audit_middle_place` (an abstract definition said over an empty stage) and `hunt_q` retire. `mid_<w>` stays.

### 1.20 w1-8, Sound Swap

*Voice:* playful: fixing Baron's mischief. "So out goes…" and "…and in goes…" have a magician's rhythm.

Sound Swap is the hardest mechanic in Bamboo Village. So it gets the full shape, with two join-ins:
- **The child reads the start word first.** Sounds~Write: pupils "say the sounds and read the word before the sound swapping begins".
- **"Are you ready to watch?"** comes before Sensei's swap. This is Jonas's first "Are you ready?" and the one place this script uses it.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_swap_oh_dear | 0.0 s | the word card with < m a t > on its lines; Baron's muddle swirl blows past | Oh dear. Baron Muddle has been muddling up words. | — |
| tv_swap_name | 3.6 s | | This game is called Sound Swap. | — |
| tv_swap_read_first | 5.9 s | the three tiles become sound buttons | First, let's read this word. Tap each sound, and say it with me. | taps m, a, t (from 5.9 s) |
| (clips) | each tap, then the sweep | the tile lights; the sweep | /m/ /a/ /t/ … [mat] | says them |
| tv_swap_frame | 0.0 s after the read | the ninja crouches, ready | In Sound Swap, we change just one sound, to make a new word. | — |
| tv_ready_to_watch | 4.7 s | ▶ pops in | I'll show you. Are you ready to watch? Tap the arrow. | taps ▶ |
| tv_swap_change_to | 0.0 s after the bow | | I'll change it to… [sat] | watches |
| (clips) | 2.0 s | the first line pulses on each held first sound | [mat, slowly] … [sat, slowly] | — |
| tv_swap_first_changes | 5.8 s | the first tile glows | The first sound changes. | — |
| tv_swap_out | 7.6 s | the paw taps < m >; the ninja kicks it off the line; a small /m/ petal pops above it | So out goes… /m/ | — |
| tv_swap_in | 9.5 s | the paw taps < s > in the letter row; it flies onto the first line; a small /s/ petal | …and in goes… /s/ | — |
| (clips) | 11.4 s | the tiles light in turn; the sweep | /s/ /a/ /t/ … [sat] | — |
| tv_swap_ready | 14.0 s | ▶ | Now you swap one. Ready? | taps ▶ |
| tv_swap_now_change | after the bow | the word: sat | Now change it to… [sit] | — |
| tv_here_slowly | straight after | the lines pulse on the held sounds | Here they are, slowly… [sat, slowly] [sit, slowly] | — |
| st_what_change | straight after | the tiles glow faintly | What do we need to change? | taps < a > |
| st_middle_changes | the right tile; protected (no tap cuts it: SCRIPT_FIXES C11) | < a > lifts off its line | Yes, the middle sound changes! | — |
| swap_pick | straight after; the choices wake as it starts | the choices glow | Now pick the new sound. | taps < i > |
| (clips) | the right pick | the tiles light; the sweep | /s/ /i/ /t/ … [sit] | — |
| tv_swap_now_change | later swaps; after two first tries in a row, the stretched pair and the question drop (A6) | | Now change it to… [sat] | taps twice |
| tv_swap_done | the close | the words shine, unmuddled | You fixed all of Baron's muddled words! | — |

- **Retired:** `swap_start`, `this_is` (in Sound Swap), `swap_make`, `what_changed` (said after the words), `audit_swap_first`, `audit_swap_middle`, `audit_swap_last` and `swap_done`.
- The demo's run from the ▶ tap to "Now you swap one" is about 14 s, the longest in the script. It passes the 8 s rule because something new lands on screen every 2 s (the stretch, the glow, the kick, the flight and the sweep). It is also the one run over 12 s; see §4.1.

### 1.21 w1-9, Ninja Run

*Voice:* sporty and bright. The run's start is a starting gun: "off we go!" is allowed its "!".

The lanterns carry written words, and the sounds are the question, so no petals appear; neutral dots light in the banner (SOUND_DISPLAY A1). The world starts only when the child taps ▶, on every run.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_run_frame | 0.0 s | the start line; the ninja in its ready stance; the world is still | It's Ninja Run! Your ninja runs all by itself. | — |
| tv_run_jump | 3.6 s | a log bobs ahead; the pointing hand taps the screen | Tap anywhere to make it jump. | — |
| tv_run_lanterns | 6.1 s | two lanterns float in, each with a written word | When lanterns come, I'll say some sounds. Catch the lantern with my word. | — |
| tv_run_ready | 11.2 s | ▶ pops in | Ready? Tap the arrow, and off we go! | taps ▶; the world moves |
| tv_run_sounds | the first lantern group; the ninja stops under the lanterns | the banner's dots light one per sound | Here are my sounds… /s/ /i/ /t/ | — |
| tv_run_which | straight after; the first group's answer glows after 2 s | the lanterns bob | Which lantern has that word? | taps a lantern |
| (clips) | the right lantern | a flying leap and a POW; the word rises out of it, lighting sound by sound | /s/ /i/ /t/ … [sit] | — |
| that_says · tv_run_sounds_again | a wrong lantern | its word lights sound by sound | That's… /s/ /a/ /t/ [sat] Here are my sounds again… /s/ /i/ /t/ | taps |
| run_blend ↻ · audit_sounds_again ↻ | groups 2 and 3, rotating (SCRIPT_FIXES C16); from group 4, the sounds only | | Listen to the sounds. What word do they make? … Listen to the sounds, and catch the word they make. | taps |
| run_end | the gong | the ninja strikes the gong | Bong! You made it to the gong! | — |

`run_start` and `t_listen_for_word` (which told the child to say the sounds while Sensei said them) retire. `help_run` ↻ becomes "Tap anywhere to jump. Tap a lantern to catch it."

### 1.22 w1-10 to w1-13: the second meetings

These stones replay games the child has met. Each opens with its short line, or with its recap line in a later session (the full registry is in §2.1), and then plays its items with the stems rotating and fading. Only what differs from the first meeting is shown here.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_short | w1-10, 0.0 s (/n/, /p/) | the dojo room | It's First Sounds again, with two new sounds. | — |
| tv_first_ido · tv_petal_say | each new sound's I do (no ▶ in the short form) | the new petal arrives misty and blooms | I'll go first. My sound is… /n/ Tap the petal, and say it with me. | taps; says /n/ |
| tv_letter_hunt_short | w1-10's Letter Hunt | the letter tiles drop in | Now it's a letter hunt. | taps |
| tv_build_short | w1-10's build phase | the lines and tiles | Now let's build some words. | builds |
| tv_hunt_short | w1-11, 0.0 s (/o/) | the dojo room | It's Sound Hunt again. The sound is hiding in the middle. | — |
| tv_swap_short | w1-12, 0.0 s | the word card: sat | It's Sound Swap again. We change one sound, to make a new word. | — |
| tv_swap_read_first_short | straight after | the tiles become sound buttons | First, let's read this word. | taps the sounds |
| tv_show_offer | w1-12, the recap form only (a later session) | the paw pulses beside ▶ | If you'd like to see me do one first, tap my paw. Or tap the arrow to start. | taps ▶ or the paw |
| tv_battle_short | w1-13, 0.0 s | a new monster lands; the letters wake as the line ends | Another monster! Let's zap it with spelling. | builds |

- **The same session:** a game's second level opens on its short line.
- **A later session:** it opens on the recap line with the ▶ (§2.1).
- **Inside a level:** after the first item, the question stems fade (SCRIPT_FIXES A5 and A6).

### 1.23 w1-14, Story Time

*Voice:*
- Sensei's pages are read like a bedtime story, with a character voice or two.
- On the child's pages she drops to an encouraging near-whisper, a grown-up leaning in beside them.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_story_frame | 0.0 s, the title page (held) | the book opens; the title glows | Story time! I'll read some pages to you, and you'll read some pages to me. | — |
| tv_story_title · story:s1_title | 5.9 s | the title words light as said | This story is called… The Missing Pot. | — |
| tv_story_begin | 9.2 s | ▶ pulses in the right-hand column | Tap the arrow, and let's begin. | taps ▶ |
| story:s1_1 | Sensei's page (held) | the picture, then the text lights as she reads | In Bamboo Village, the pandas were having a terrible day. Baron Muddle had pinched their lunch pot and hidden it! But Super Ninja had a clue... | taps ▶ |
| tv_story_your_page | the child's first page: "Map! Tap it!" in big letters | each word glows once | Now it's your turn to read. Say the sounds, and read each word. | — |
| tv_story_help | 5.1 s | the words glow again | If you get stuck, tap the word, and I'll help. | — |
| tv_story_tick | 9.1 s | the green tick pulses in the column | When you've read it all, tap the green tick. | reads aloud; taps a word if stuck; taps ✓ |
| (clips) | a word tapped | its letters light sound by sound | /t/ /a/ /p/ [tap] | — |
| well_read | the tick | the page glows | Well read! | taps ▶ |
| tv_story_your_turn | the child's later pages | the words glow once | Your turn to read. | reads; taps ✓ |
| story:s1_5 · tv_story_choice | the choice page | the pit and the mat, each a word | Two places to look! Where is the pot hidden? … Read both words. Then tap the place you want to look. | reads; taps a word |
| tv_story_q | the question page; the pictures appear after the line | the pot, map and pan pictures fade in | Now a question about the story. | — |
| story:q | straight after | the pictures glow | What did Baron Muddle hide? | taps a picture |
| story_end | the last page | the book closes | The end! What a story! | — |

- **Retired:**
  - `story_start`, said on the map as the stone was tapped;
  - `story_your_turn`, which was cut off every time and never explained the tick;
  - `story_question`, cut off by the child's taps;
  - `audit_story_choice`.
- **The question page's pictures stay out of reach** until `tv_story_q` has ended, which fixes today's cut-off.

### 1.24 w1-15, the first boss battle

*Voice:* reassuring after Baron's bluster: steady and warm, with a twinkle.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| baron_w1 | 0.0 s, Baron's cut-in | the screen darkens; the letters dim | BARON: So... a little ninja wants to stop me? My sumo panda will squash you! | — |
| tv_boss_calm | 5.7 s, the cut-in ends | the sumo panda stomps in; its big power bar | Don't worry, ninja. You know what to do. | — |
| tv_boss_frame | 8.9 s | the power bar glows | A boss takes lots of words to beat. | — |
| tv_boss_ready | 11.5 s | ▶ in the column; the ninja in its ready stance | Are you ready to beat the boss? Tap the arrow. | taps ▶; the letters wake |
| tv_battle_word | after the bow | | Here's your first word… [top] | builds |
| (the battle) | as w1-6, with the stems fading | | … | … |
| battle_boss_win | the boss falls | confetti | You beat the boss! What a ninja! | — |

- **Retired:** `battle_boss`.
- **Baron's lines are his own,** but "will squash you" is a threat. A gentler version (see research §4 #18): "My sumo panda will sit on your words!"

### 1.25 The land is done: the World Flower, then Blossom Hills

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| world_done | the boss's reward | the land's stones all glow | You found every sound in this land! Let's go to the next one! | taps ▶ |
| t_visit | straight after | the World Flower | Let's visit the World Flower! | taps ▶ |
| wf_petals_you_know | the flower, lit petals shining | | Every shining petal is a sound that you know! | taps ▶ |
| t_petal_is · tp_o_hear | the /o/ petal lifts out and glows | | This petal is the sound… /o/ You can hear it in pot, top and mop. | — |
| tv_tap_say_with_me | straight after | the petal breathes | Tap it, and say it with me. | taps; says /o/ |
| wf_world_new | the next land's petals wait in the mist | | New sounds are hiding in this land. Let's go and find them! | taps ▶ |
| world_2 | the map of Blossom Hills | the ninja arrives on stone 1 | Welcome to Blossom Hills! | taps the stone |

`t_remember_this` ("Do you remember this one?", a question nobody could answer) and `t_now_you_say_it` retire.

### 1.26 w2-1: the first Dojo lesson (New Sounds), the one with "Listen!" and the ear

*Voice:*
- **The frame:** a teacher setting out a lesson plan with real excitement, but quietly.
- **Each sound:** the lead-in "Here it comes…" is hushed and suspended, like the moment before a magic trick. The two sounds are crisp and pure, with a beat of silence between them.
- **"Now watch my ninja write it":** anticipation.
- **Never a bark.** The one-word `listen` clip is gone from the lesson.

**What changes from today** (mechanics §7):
- **The lesson has a frame and a Ready?**, so the child knows what will happen and who does what.
- **No ear anywhere.** The listening cue is the ninja cupping its ear, which the child has known since W1 ("ninja ears").
- **Each petal arrives misty, and blooms on its sound** (SOUND_DISPLAY §4.6). It never pulses before it has been explained.
- **The child acts twice per sound.** They tap the petal and say the sound, then tap the letter and say the sound. So no run is longer than about 10 s.
- **Short form for the later sounds.** From the second sound on it's "Here's the next new sound…", "Your turn." (SCRIPT_FIXES C2's series shape), not the same four sentences again.
- **Art flag:** the /g/ petal, a white faceless ghost, reads as an ear. Its picture needs a redraw (SOUND_DISPLAY A13).

#### A. New Sounds (`learn`, full)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_frame_<n> (four) | 0.0 s, the level on screen | the dojo; four misty petals float above; nothing pulses | Today in the dojo, I'm going to teach you four new sounds. | — |
| tv_learn_how | 4.7 s | the ninja sits up, attentive | I'll say each sound, and show you how we write it. Then you say it with me. | — |
| tv_learn_ready | 11.3 s | ▶ pops in; the ninja faces it in its ready stance | Are you ready for the first one? Tap the arrow. | taps ▶ |
| tv_learn_first | after the bow | the first misty petal floats down to the middle; the ninja cups its ear | Here's the first new sound. Get your ninja ears ready. | — |
| tv_here_it_comes | 3.9 s | on the sound: the mist wipes up, the colour fills, the ball picture pops; a ring of light | Here it comes… /b/ … /b/ | listens |
| tv_petal_say | 7.2 s | the petal breathes | Tap the petal, and say it with me. | taps; says /b/ (at about 10 s) |
| (clip) | the tap | the petal swells | /b/ | — |
| tv_watch_write | straight after | the petal steps aside; the ninja casts; < b > appears beside the petal | Now watch my ninja write it. | watches |
| tv_how_we_write | the letter lands | < b > glows | This is how we write… /b/ | — |
| tv_tap_letter_say | straight after | < b > pulses; two mini /b/ petals wait under it | Now you tap it, and say the sound. | taps < b > twice; says /b/ each time |
| (clips) | each tap | a mini petal lights | /b/ … /b/ | — |
| tv_said_well | the first sound only | the ninja bows | Good, you said that sound really well. | — |
| tv_learn_next | the second sound | the next misty petal floats down | Here's the next new sound… /k/ … /k/ | listens |
| tv_petal_say_short | straight after | the petal breathes | Tap its petal, and say it. | taps; says /k/ |
| tv_and_how_we_write | the spell | < c > appears beside the petal | And this is how we write… /k/ | — |
| tv_your_turn | straight after | < c > pulses | Your turn. | taps twice; says /k/ |
| tv_learn_another | the third sound | the next petal | Here's another new sound… /g/ … /g/ | listens |
| tv_petal_say_short · tv_and_how_we_write · tv_your_turn | as the second | < g > | Tap its petal, and say it. … And this is how we write… /g/ Your turn. | taps; says /g/ |
| tv_learn_last | the last sound | the last petal | Here's the last new sound… /h/ … /h/ | listens |
| tv_petal_say_short · tv_and_how_we_write · tv_your_turn | as the second | < h > | Tap its petal, and say it. … And this is how we write… /h/ Your turn. | taps; says /h/ |
| tv_learn_all_<n> (four) | straight after | the four petals line up with their letters beside them | Four new sounds! You said every one. | — |

**Rules for this game:**
- **A tap on a petal or letter while Sensei is explaining** nods it and plays a tink; it never cuts her off (SOUND_DISPLAY §4.3).
- **Hear it again** replays the current sound's whole teaching.
- **For a two-letter spelling** (from w3-6: < ff >, < ll >, < ss >, < zz >), `t_two_letters` "It's two letters, but it's one sound." follows `tv_how_we_write`. The next two-letter spelling within two minutes gets `st_two_letters_too`, and the rest get nothing (SCRIPT_FIXES A2).
- **< x >** is taught as a sound pair (SOUND_DISPLAY §4.5), with `tv_x_two_sounds`: "This spelling is two sounds together." Then /k/ /s/.

#### B. Letter Hunt in the dojo (`find`, short: met in w1-2)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_letter_hunt_new | 0.0 s | the letter tiles drop in; the petal slot empty | Now it's a letter hunt, with your new sounds. | — |
| tv_petal_hint | 3.0 s; once per save in the dojo (SCRIPT_FIXES C10: before the question, never cut off) | the petal pops into the nav row and pulses | Tap the petal if you want to hear the sound again. | — |
| tv_which_write | straight after | the petal swells | Which of these is the way we write… /b/ | taps < b > |
| tv_find_write · tv_now_find | the next items, rotating | | Find how we write… /k/ … Now find… /g/ | taps |
| tv_thats_write · we_need | a wrong tile | its sound's petal pops above it, then the target's swells | That's how we write… /m/ We need… /k/ | taps |

#### C. Word Building in the dojo (`build`, recap)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_dojo | 0.0 s | the lines, the letter row and the word card; the tiles locked until the word has been said (SCRIPT_FIXES C12) | Now let's build words with your new sounds. I say a word, and you find its sounds, one at a time. | — |
| tv_your_word | 7.2 s | the word card speaks | Your first word is… [hip] | — |
| first_sound_q | straight after; the answer glows after 2 s (the first word only) | the first slot glows | What's the first sound? | taps < h > |
| (the build) | Word Building's stems, fading after two first tries | | What's the next sound? … What's the last sound? | builds |
| say_sounds_read ↻ | each built word (the first two, and after any miss) | the tiles light; the sweep | Say the sounds… and read the word. /h/ /i/ /p/ [hip] | — |
| tv_learn_done | the close | the new petals shine above the dojo | You learnt four new sounds, and you built words with them. | — |

- **Retired from the Dojo:**
  - `dojo_hello` and `audit_dojo_back`;
  - `listen` as an opener;
  - `audit_spell_it`, `audit_hear_see` and `dojo_tap_say` from the Learn;
  - `dojo_find`, `tut_speaker` and `dojo_build`;
  - `dojo_done`;
  - the rainbow tally petals, which become the two mini petals.
- **Later dojos** use `learn`'s recap or short lines (§2.1).

---

## 2. Every game type: first time, and every time after

### 2.1 The replay introductions (recap and short) for every game

- **The full form** of each preschool-path game is in Part 1 (see §0.4 for where). This section gives the **recap** and **short** forms, and the paw's canonical demo where there is one (for Show me again on a short form: mechanics §4.5).
- **Recap** = one line of "It's X again" and how it goes, then the demo, then a short ▶.
- **Short** = one line, then the turn.
- The Ready questions rotate: `tv_ready_q1` "Now you. Ready?", `tv_ready_q2` "Do you want to have a go now?" and `tv_ready_q3` "Ready to have a go?" (§3.1).

#### Find the Picture (`tap`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_find_recap | recap | the cards land | It's Find the Picture again. I say a picture, and you find it. | — |
| tv_find_demo · tv_ready_q1 | recap, straight after | the paw finds the demo card | I'll go first. I'm looking for the sun… There it is! Now you. Ready? | taps ▶ |
| tv_find_short | short | the cards land | It's Find the Picture. | — |
| tv_where_<w> | the turn | | Where's the sock? | taps |

#### The rabbit and the tortoise (`fastslow`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_w3_hello · tv_ts_fast · tv_ts_slow · tv_ready_q3 | recap (§1.8 A) | the word's card; the paw on each button | Ninja Ears again, with the rabbit and the tortoise. … The rabbit says words fast… [mug] The tortoise says them slowly… [mug, slowly] Ready to have a go? | taps ▶ |
| tv_ts_short | short | the rabbit and tortoise pop in | Here come the rabbit and the tortoise. | — |
| fm_tap_tortoise ↻ | the turn | the tortoise pulses | Tap the tortoise, and say it slowly with me. | taps |

#### Slow Words (`slowpick`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_slow_recap | recap | the cards land | It's Slow Words again. I say a word slowly, and you find its picture. | — |
| tv_first_go · (the demo) · tv_ready_q2 | recap, straight after | the paw in bullet time | I'll go first. [mug, slowly] … [mug] Do you want to have a go now? | taps ▶ |
| tv_slow_short | short | | It's Slow Words. | — |
| tv_slow_q · fm_which_pic | the turn | | Here's a slow word for you… [van, slowly] Which picture is it? | taps |

#### Pocket Hunt (`tapall`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_pocket_recap | recap, start | the grid and pockets; the petal | It's a pocket hunt again. Find every picture that starts with… /p/ | — |
| tv_watch · [w, first] · tv_into_pocket · tv_pocket_ready_<n> | recap, straight after | the paw finds one | Watch. [pig, first] Into the pocket it goes! Now you find the other two. Ready? | taps ▶ |
| tv_pocket_in_recap · tv_find_in | recap, inside the words | | It's a pocket hunt again. The sound is hiding inside the words. Find every picture with this sound in it… /a/ | — |
| tv_pocket_again | short, start | | One more pocket hunt. Find every picture that starts with… /m/ | finds |
| tv_pocket_in_short | short, inside the words | | One more pocket hunt. Find every picture with this sound in it… /o/ | finds |

The paw is not offered on the short form: its demo would take one of the child's answers.

#### Ninja Reading (`rail`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_rail_recap · tv_watch_me_read · (the reading) · tv_ready_q1 | recap (§1.9) | the rail and its cards | It's Ninja Reading again. … Watch me read them. Cat… dog… fish. Cat-dog-fish! Now you read them. Ready? | taps ▶ |
| tv_rail_short | short | the rail slides in | It's Ninja Reading. | — |
| tv_rail_turn | the turn | the first card pulses | Tap them the ninja way, starting at the arrow. | taps in order |

The paw's canonical demo: the reading of the rail's own pictures.

#### The two-rail game (`which`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_which_recap · tv_ready_q3 | recap | two rails | It's the two-rail game again. Tap the one I read. Ready to have a go? | taps ▶ |
| tv_which_q_<pair> | short, straight into the question | two rails | Here I go. Cat… dog. Which one did I read? | taps a rail |

The paw's canonical demo: `tv_which_demo` on the fish and dog rails (its own pictures).

#### Word Squish (`compound`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_squish_recap · tv_squish_demo · tv_squish_ready | recap | the canonical sunflower demo on its own cards | It's Word Squish again. Two little words make one big word. … Watch. I say them slowly: sun… flower. I say them fast: sunflower! Now you make one. Ready? | taps ▶ |
| tv_squish_short | short | | Let's squish some more words. | — |

The paw's canonical demo: the sunflower.

#### Guess My Word (`sounds`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_guess_recap | recap | the demo cards | It's Guess My Word again. I'll say the sounds, and you listen for the word. | — |
| tv_my_sounds · tv_i_hear_<w> · tv_ready_q2 | recap, straight after | the neutral dots light | My sounds are… /s/ /u/ /n/ I can hear sun! Do you want to have a go now? | taps ▶ |
| tv_guess_short | short | | It's Guess My Word. | — |
| tv_here_my_sounds · fm_which_pic | the turn | | Here are my sounds… /m/ /a/ /p/ Which picture is it? | taps |

The paw's canonical demo: the sun.

#### Sound Dots (`dots`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_dots_recap | recap | the demo card and its dots | It's Sound Dots again. Every dot is one sound in the word. | — |
| tv_dots_demo · (clips) · tv_dots_word_ido · tv_dots_ready | recap, straight after | the paw taps the dots | Watch me tap each dot, and say its sound. /s/ /u/ /n/ Then I say the word… [sun] Now you tap the dots, and say the sounds with me. Ready? | taps ▶ |
| tv_dots_short | short | | It's Sound Dots. Tap the dots, and say the sounds with me. | taps |

#### First Sounds (`firstsound`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_first_recap · (the first I do) · tv_ready_q3 | recap (§1.15) | | It's First Sounds again. I say a sound, and you find the picture that starts with it. … Ready to have a go? | taps ▶ |
| tv_first_short | short | | It's First Sounds again, with two new sounds. | — |
| tv_first_short_known | short, with no new sounds (a review level) | | It's First Sounds again. | — |

#### Letter Hunt (`find`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_letter_hunt_frame | recap | the tiles | Now it's a letter hunt. I say a sound, and you find how we write it. | — |
| tv_letter_hunt_short / tv_letter_hunt_new | short / in the dojo | the tiles | Now it's a letter hunt. / Now it's a letter hunt, with your new sounds. | — |
| tv_which_write / tv_find_write / tv_now_find | the questions, rotating | the petal swells | Which of these is the way we write… /s/ / Find how we write… /s/ / Now find… /s/ | taps |

#### Sound Hunt (`soundhunt`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_hunt_recap | recap | | It's Sound Hunt again. I say a sound, and you find the picture with that sound in the middle. | — |
| tv_first_ido · tv_petal_say · (the demo) · tv_ready_q1 | recap, straight after | as §1.19 | I'll go first. My sound is… /o/ Tap the petal, and say it with me. … Now you. Ready? | taps ▶ |
| tv_hunt_short | short | | It's Sound Hunt again. The sound is hiding in the middle. | — |

#### Word Building (`build`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_build_recap | recap | the lines and tiles | It's Word Building again. I say a word, and you build it with its sounds. | — |
| tv_show_offer | recap, straight after | the paw pulses beside ▶ | If you'd like to see me do one first, tap my paw. Or tap the arrow to start. | taps ▶ or the paw |
| tv_build_short / tv_build_with | short / after a sound game | | Now let's build some words. / Now let's build some words with… /i/ | builds |
| tv_our_word · first_sound_q | the first word, a we do | the answer glows after 2 s | Here's our word… [mat] What's the first sound? | taps |

The paw's canonical demo: w1-4's `am` (§1.16 A), with Sensei finding both sounds.

#### Who Read It Right? (`readcheck`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_readers_back | recap and short | Kai and Suki wave | Kai and Suki are back. First, you read the word. | taps the sounds |
| read_tap_sounds ↻ | later words | | Tap each sound, and say it. | taps |

#### New Sounds in the dojo (`learn`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_recap | recap: the first dojo in a new land, or after 21 days | the misty petals above | Back to the dojo, for some new sounds. You know how this goes. | — |
| tv_learn_how · tv_learn_ready | recap, straight after | ▶ | I'll say each sound, and show you how we write it. Then you say it with me. Are you ready for the first one? Tap the arrow. | taps ▶ |
| tv_learn_short_<n> (three) | short | the misty petals | Back to the dojo. Today there are three new sounds. | — |
| tv_learn_first_short | short, the first sound | the first petal floats down | Here's the first one… /d/ … /d/ | listens |

A known sound with a new spelling is covered in §2.2 E.

#### Monster battles (`battle`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_battle_recap | recap | the monster lands; the letters dim | Another of Baron's monsters! Find the sounds in each word, and zap it. | — |
| tv_battle_ready | recap, straight after | ▶ in the column | Are you ready to zap it? Tap the arrow. | taps ▶ |
| tv_battle_short | short | the letters wake as the line ends | Another monster! Let's zap it with spelling. | builds |

#### Boss battles (`boss`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| (Baron's threat) · tv_boss_calm_2 | every boss after the first | the cut-in, then the boss | Oh no, another boss! Don't worry. You know just what to do. | — |
| tv_boss_ready | always (a boss always gets its ▶) | ▶ in the column | Are you ready to beat the boss? Tap the arrow. | taps ▶ |

#### Sound Swap (`swap`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_swap_short · tv_swap_read_first_short | short, and recap | the start word | It's Sound Swap again. We change one sound, to make a new word. First, let's read this word. | taps the sounds |
| tv_show_offer | recap only | the paw pulses beside ▶ | If you'd like to see me do one first, tap my paw. Or tap the arrow to start. | taps ▶ or the paw |
| tv_swap_now_change | the turn | | Now change it to… [sit] | taps twice |

The paw's canonical demo: mat to sat (§1.20).

#### Ninja Run (`run`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_run_short | recap and short: every run keeps its start tap | the start line | It's Ninja Run! Ready? Tap the arrow, and off we go! | taps ▶ |
| tv_run_jump | recap only, straight after the name | | Tap anywhere to make it jump. | — |

#### Story Time (`story`)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_story_recap | recap: the title page | the book opens | Story time! I'll read some pages, and you'll read some too. | — |
| tv_story_short | short: the title page | | Story time! | — |
| tv_story_title · tv_story_begin | straight after | ▶ | This story is called… Peg in the Fog. Tap the arrow, and let's begin. | taps ▶ |
| tv_story_your_turn | the child's pages | | Your turn to read. | reads; taps ✓ |
| tv_story_tick_idle | 10 s on a child's page, no tap | the tick pulses | When you've read it, tap the green tick. | taps ✓ |

### 2.2 First-time introductions for the games that aren't on the preschool path

#### A. Sorting (`sort`, full: w6-br1, a Year One child aged 5 or more)

*Voice:* a treasure hunter opening chests, curious and pleased.

Age 5's limits are 18 s of talk before the first action and 12 s for the longest run (ARCHITECTURE §6.4).
- **The chests open one at a time as the child taps them**, so their three example sentences are the child's discovery, not a lecture. This replaces today's 57 words before the first word.
- **The letters line is said on the chest whose fact is due** (SCRIPT_FIXES C1).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| audit_bridging_first | 0.0 s | the /k/ petal stands big above three closed chests labelled < c >, < k > and < ck > | You know this sound! Now let's look at the different ways we spell it. | — |
| tv_sort_frame | 4.9 s | the chests glow | This game is called Sorting. Every word goes in the chest with the same spelling. | — |
| tv_sort_open | 10.4 s | the first chest wiggles | This sound can be spelt in three ways. Tap each chest to open it. | taps a chest (from 10.4 s) |
| tv_in_<w>_way_we_spell (cat) | the < c > chest opens | the petal swells on the sound | In cat, this is the way we spell… /k/ | taps the next chest |
| tv_in_<w>_spelt_like_this (kit) | the < k > chest opens | the chest hops | In kit, it's spelt like this. | taps the next chest |
| tv_in_<w>_spelt_like_this (duck) · t_two_letters | the < ck > chest opens; the letters line only if due | < ck > glows | In duck, it's spelt like this. It's two letters, but it's one sound. | — |
| tv_sort_demo_1 | straight after | the big petal shrinks into the top bar; a word falls: "back" | I'll sort the first word. My word is… [back] | watches |
| tv_sort_demo_2 | 3.6 s | < ck > in the word lights | Here's the spelling of our sound. | — |
| tv_sort_demo_3 | 6.1 s | the paw taps the < ck > chest; the ninja kicks the word in | It matches this chest. In it goes! | — |
| tv_ready_q3 | 8.7 s | ▶ in the column (the chests fill the row) | Ready to have a go? | taps ▶ |
| help_sort ↻ · [w] | the first word | the word falls and stops above the chests | Tap the chest with the same spelling as the word. [cap] | taps a chest |
| [w] | later words (no stem) | | [kit] | taps |
| sort_done | the close | the chests close, glowing | Sorted! What a clever ninja. | — |

`audit_sort_first` and `audit_sort_three` retire. On later sorts, the short form is `tv_sort_short` "Sorting time! Same sound, different spellings." (SCRIPT_STYLE §11.4), then the chests open by themselves with their lines (SCRIPT_FIXES C1), and the first word falls.

#### B. Gem battles (`trial`, full: the first Gem Trial)

*Voice:* exciting but safe. "Don't worry" is said like a hand on the shoulder.

The bar never starts before the child taps ▶ (mechanics §6.4).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_trial_frame | 0.0 s | the gem glows over the monster | Your gem is ready! Win this gem battle, and the gem is yours. | — |
| tv_trial_bar | 4.4 s | the purple bar glows at the top | This purple bar fills up slowly. Spell each word before it's full. | — |
| tv_trial_hearts | 9.2 s | the hearts glow | If it fills, you lose a heart. Don't worry, I'll help you. | — |
| tv_trial_ready | 13.3 s | ▶ in the column | Ready? The bar starts when you tap the arrow. | taps ▶; the bar starts |
| trial_win | the gem is won | the gem flies up | You won the gem! It's going into its petal! | — |
| trial_fail ↻ | the hearts run out | the monster hops away | So close! Keep playing, and try again soon. | — |
| tv_trial_short | later trials | ▶ in the column | Gem battle! Spell each word before the bar fills. Ready? Tap the arrow. | taps ▶ |

`timer_intro_1`–`3`, `audit_trial_first`, `audit_timer_short`, `audit_timer_hearts` and `trial_start` retire.

#### C. Sensei's Challenge (`review`, full: the first time the map's button is tapped)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_review_frame | 0.0 s | Sensei's banner; a monster made of mixed-up letters | This is Sensei's Challenge. It has words from all the games you've played. | — |
| tv_review_how | 5.2 s | the letters glow | Find the sounds in each word to zap it. Let's see how many you can do! | — |
| tv_battle_ready | 10.6 s | ▶ in the column | Are you ready to zap it? Tap the arrow. | taps ▶ |
| tv_review_short | later | ▶ | Sensei's Challenge! Ready? Tap the arrow. | taps ▶ |

#### D. Ninja Run's reading groups (`run`, read: the first time)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_run_read_first | mid-run, the first reading group; the ninja stops under the lanterns | a word on the banner; the lanterns carry pictures | Now a reading one. Read the word on the banner, and catch its picture. | reads; taps a lantern |
| run_read ↻ | later reading groups | | Read the word, and catch the matching picture. | taps |

#### E. The school paths' first Dojo lesson (`learn`, full; Reception after the autumn, Years One and Two)

The frame is §1.26 A's, with the count. The Year One version meets new spellings of sounds the child already knows (SCRIPT_STYLE §11.3), so a sound the child knows is greeted as known before the spell:

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_learn_frame_ways | 0.0 s | the dojo; the /ae/ petal (known: no mist) above two gem sockets | Today in the dojo, I'm going to teach you two new ways to write a sound you know. | — |
| tv_learn_how | 5.9 s | | I'll say each sound, and show you how we write it. Then you say it with me. | — |
| tv_learn_ready | 12.2 s | ▶ | Are you ready for the first one? Tap the arrow. | taps ▶ |
| tv_learn_first · tv_here_it_comes | after the bow | the petal floats down | Here's the first one. Get your ninja ears ready. Here it comes… /ae/ … /ae/ | listens |
| st_know_this_sound | straight after (the news before the reveal) | the petal glows | Ooh, you already know this sound! | taps the petal; says it |
| tv_watch_write · t_another_way | the spell: < ai > appears beside the petal | | Now watch my ninja write it. This is another way to spell the sound… /ae/ | — |
| t_two_letters | straight after (the full form, SCRIPT_FIXES A2) | < ai > glows as a single tile | It's two letters, but it's one sound. | — |
| tv_tap_letter_say | straight after | < ai > pulses | Now you tap it, and say the sound. | taps; says /ae/ |
| tv_learn_next · st_know_this_sound · tv_and_another_way · st_two_letters_too · tv_your_turn | the second spelling (< ay >) | | Here's the next one… /ae/ … /ae/ Ooh, you already know this sound! And here's another way to spell it… /ae/ This one's two letters too, but it's just one sound. Your turn. | taps; says /ae/ |

The school child's first Word Building in the dojo gets the I do (mechanics decision 9). It is §1.16 A's demo on the level's first word, with Dojo.tsx `Build` borrowing `BuildOne.runDemo`'s pattern.

#### F. The Year One and Two word hunt (`tapall`, words in: the first time)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_word_hunt_frame | 0.0 s | written words with pictures: rain, tray, snail, bed and fish; three pockets | It's a word hunt. Every word with our sound in it goes in a pocket. | — |
| tv_find_words_in | 4.8 s | the /ae/ petal | Find every word with this sound in it… /ae/ | — |
| tv_watch · tv_hear_in_<w> (rain) · tv_into_pocket | 7.5 s | the paw finds "rain" | Watch. [rain] I can hear it in rain. Into the pocket it goes! | watches |
| tv_pocket_ready_<n> (two) | 12.0 s | ▶ | Now you find the other two. Ready? | taps ▶ |

`fm_tap_all_words_in` retires.

#### G. The Reception versions of W1 and W2 (`spell: true`)

Beats and lines as §1.4 and §1.6. What Reception adds:
- **The first /s/ find in Pocket Hunt:** the ninja writes < s > on the card's first line, with `tv_watch_write` "Now watch my ninja write it." and `tv_how_we_write` "This is how we write… /s/". Later finds show the letter silently.
- **W2's last beat is the "inside the words" pocket hunt on /a/,** which is §1.8 C's lines. < a > is written on the cat's middle line the same way.

#### H. Show Sensei (the placement quiz, started by a grown-up)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_place_frame | 0.0 s | Sensei's portrait | Let's play a quick game, so I can see what you know already. | — |
| tv_place_ok | 4.1 s | | Some might be tricky. That's fine. Just have a go. | — |
| tv_place_sound_round | the sound round | the petal; the spelling tiles | I say a sound, and you find how we write it. | taps |
| tv_place_findall_round | the find-all round | the petal; the pictures | Find every picture with this sound in it… /ee/ | taps |
| tv_place_done | the end | | Thank you, ninja. Now I know just where to start. | — |

#### I. The practice dojo (the World Flower's Practise gate)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_practise_gem | 0.0 s | the gem glows over the lines | Let's practise this gem. I say a word, and you build it. | — |
| tv_our_word | 3.9 s | the word card | Here's our word… [rain] | builds |

---

## 3. The recurring moves

### 3.1 "Are you ready?" (the Ready hold)

*Voice:* an invitation, not a test. It rises on "ready" and then leaves real silence. The ninja's ready stance does half the asking.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_ready_first | the save's first Ready (W1's first game) | ▶ pops in, pulsing; the ninja turns to it in its ready stance; ▶ spotlit on "green arrow" | Now it's your turn. Look, your ninja is ready. Are you ready too? Tap the green arrow. | taps ▶ |
| tv_ready_paw | the save's second Ready (it introduces the paw) | ▶ spotlit on "arrow", then the paw on "paw" | Your turn next. Ready? Tap the arrow. Or, to see it again, tap my paw. | taps ▶ or the paw |
| tv_ready_q1 / tv_ready_q2 / tv_ready_q3 | every later Ready, rotating | ▶ and the paw | Now you. Ready? / Do you want to have a go now? / Ready to have a go? | taps ▶ |
| (per game) | where the hand-over needs its own words | ▶ | e.g. `tv_pocket_ready_<n>` "Now you find the other two. Ready?", `tv_squish_ready` "Now you make one. Ready?", `tv_battle_ready` "Are you ready to zap it? Tap the arrow." | taps ▶ |
| tv_ready_to_watch | before a long demo (Sound Swap's first meeting only) | ▶ | I'll show you. Are you ready to watch? Tap the arrow. | taps ▶ |
| (none) | ▶ tapped | the ninja bows (a ninja's *rei*); a soft chime | — (the next line is the turn's question) | — |
| [w] | a card tapped during the hold (it counts as ready: mechanics §4.2) | the card spotlights and says its word | [sock] | — |
| nav_ready ↻ | 16 s with no tap (at 8 s ▶ glows and the hand points) | the ninja jumps and points its star at ▶ | Tap the arrow when you're ready. | — |
| tv_offer_show | 24 s, once | the paw pulses | Or I can show you again. Just tap my paw. | — |
| nav_ready ↻ | 40 s, then quiet; nothing starts by itself | | Tap the arrow when you're ready. | — |
| tv_ready_help | Help's first press during a hold | ▶ then the paw spotlit | When you're ready, tap the green arrow. To see it again, tap my paw. | — |

### 3.2 Show me again (the paw)

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_show_again | the paw tapped (in a Ready hold or a turn) | the demo replays exactly, narrated, on its own pictures | Of course. Watch again. | watches |
| tv_ready_now | the replay has ended, in a Ready hold | ▶ back, pulsing | Ready now? Tap the arrow when you want a go. | taps ▶ |
| tv_turn_again | the replay has ended, in a turn | the turn's pictures are back | Now it's your turn again. | (the turn's question follows) |
| tv_offer_show_miss | a second miss on one of the first two items of a first meeting | the paw pulses | Shall I show you again? Tap my paw. | taps the paw, or answers |
| tv_show_offer | a recap form with no demo played (Word Building, Sound Swap) | the paw pulses beside ▶ | If you'd like to see me do one first, tap my paw. Or tap the arrow to start. | taps either |

### 3.3 Praise

**The rules** (SCRIPT_STYLE §8; research §2.11):
- **The model is the feedback.** After every right answer the child hears the answer back: "Mop starts with… /m/", [sock], or /s/ /a/ /t/ [sat].
- **A praise line comes at most every second right answer** (every third in the warm-ups), where the ninja's move is the praise in between. It is never stacked, never straight before a closing line, and never on a streak tier-up.
- **Specific over generic.** Generic words are at most half of the praise lines.
- **No trait praise**, except the boss win's "What a ninja!", a rare milestone.
- **Celebrations keep their "!", said with a smile, never shouted.**

**Specific praise** (whole sentences, no spliced words):

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_praise_found | Find the Picture, Slow Words, Guess My Word | the ninja's move | You found it! | — |
| tv_praise_slowly | the rabbit and the tortoise | the kata | You said it slowly, just like the tortoise. | — |
| tv_praise_start | First Sounds, Pocket Hunt (start) | | You listened right to the very start. | — |
| tv_praise_middle | Sound Hunt, Pocket Hunt (inside) | | You heard it, right in the middle. | — |
| tv_praise_order | Ninja Reading, the two-rail game | | You read them the ninja way. | — |
| tv_praise_squish | Word Squish | | You squished them into one big word! | — |
| tv_praise_heard_word | Guess My Word, Ninja Run | | You heard the word in the sounds. | — |
| tv_praise_dots | Sound Dots | | You tapped every dot, the ninja way. | — |
| tv_praise_write | Letter Hunt | | You know how we write that sound. | — |
| tv_said_well | New Sounds, and any "say it with me" | | Good, you said that sound really well. | — |
| tv_praise_built | Word Building, a you-do word | | You built that whole word by yourself! | — |
| tv_praise_judge | Who Read It Right? | | You checked their reading, like a real teacher! | — |
| tv_praise_swap | Sound Swap | | You changed just one sound. Clever swapping! | — |
| tv_praise_sorted | Sorting | | That's the right chest. | — |
| tv_praise_read | Story Time, and the read-backs | | Lovely reading. | — |
| tv_praise_kept_going | any game: right after a miss on the same item | the ninja's biggest move | That was a tricky one, and you kept going. | — |

**Generic praise** (the rotation):
- **Kept:** `yay_1` "Brilliant!", `yay_2` "Super!", `yay_4` "Well done!", `yay_9` "Smashing!", `yay_10` "Ace!".
- **Re-recorded:** `yay_8` ↻ "Great listening!".
- **New:** `tv_yay_lovely` "Lovely!", `tv_yay_thats_it` "That's it!".
- **Out of the rotation:** `yay_3` "Fantastic!", `yay_5` "Amazing!" and `yay_6` "Ninja power!" (streak_3's line).

**Streaks:**

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| audit_streak_first | the save's first three in a row | the ninja's first flames | Three right answers in a row! Your ninja is getting stronger. | — |
| streak_3 | later threes | the flames | Ninja power! | — |
| tv_streak_6_first | the save's first six in a row | the multicolour aura | Six in a row! Look at your ninja's flames. | — |
| streak_6 ↻ | later sixes | | Six in a row! | — |
| tv_streak_10 | ten independent right answers (not errorless taps) | the rainbow aura | Ten in a row! Your ninja is glowing with power! | — |
| streak_lost ↻ | a streak of three or more is lost; said before the correction, so the correction ends on the target | the flames fade gently | Keep going, ninja. | — |

`streak_10` ("Amazing! You're a ninja master!", trait praise after about three words) retires.

### 3.4 Gentle correction

**The rules:**
- **Say what they tapped** (the card says its own word).
- **Rephrase, don't repeat.**
- **End on the answer.**
- **Hand the turn back.**
- **Never** "No", "Wrong", "Oops", a buzzer or red. Sounds~Write: correction "avoids the use of negative comments" (research §2.10).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| [w] · tv_find_again_<w> | Find the Picture, first miss | the card wobbles (400 ms) and says its word | [cat] Can you find the sock? | taps |
| [w] · tv_slow_again | Slow Words, first miss | | [bag] Let's listen again… [van, slowly] | taps |
| [w] · tv_guess_again | Guess My Word, first miss | the neutral dots light again | [mop] Let's listen again… /m/ /a/ /p/ | taps |
| [w, first] · fm_diff_<w> · st_first_q2 | First Sounds and Pocket Hunt (start), first miss | the petal swells | [cat] Cat starts with a different sound. Which picture starts with… /s/ | taps |
| [w, slowly] · fm_not_in_<w> | Pocket Hunt (inside) and Sound Hunt, first miss | | [dog, slowly] Dog doesn't have that sound in it. | taps |
| tv_its_this · (the model) | any picture game: a second miss, or 16 s | the answer glows; the paw points and waits | It's this one. You tap it. | taps; then hears e.g. "Sock starts with… /s/" |
| tv_offer_show_miss | the first two items of a first meeting, a second miss | the paw pulses | Shall I show you again? Tap my paw. | — |
| tv_listen_here | Word Building, battles, the dojo's building: first miss | the tile wobbles; the slot glows | Let's listen again. What can you hear here? [mat, slowly] | taps |
| audit_listen_next ↻ | the same, when the next sound is the problem | the slot glows | Hmm, let's listen again. What sound comes next? | taps |
| thats · we_need · its_this_one ↻ | the same, second miss | the wrong tile's petal pops, then the right tile's; the right tile glows | That's… /s/ We need… /m/ It's this one. Say the sound as you put it on the line. | taps; says it |
| thats · we_need · t_two_letters | a two-letter split (SCRIPT_FIXES C5) | < sh > glows as one tile | That's… /s/ We need… /sh/ It's two letters, but it's one sound. | taps |
| help_look ↻ | Help, third press, while building | the petal pops above the slot | Look. I'll show you… /m/ | taps |
| tv_thats_write · we_need | Letter Hunt, a wrong tile | the tile's petal pops, then the target's | That's how we write… /s/ We need… /m/ | taps |
| tv_lets_check · tv_right_<reader> | Who Read It Right?, the wrong reader | the sounds light in turn | Let's check. Say the sounds with me… /a/ /m/ [am] Suki read it right. | — |
| that_says · tv_run_sounds_again | Ninja Run, a wrong lantern | the lantern's word lights sound by sound | That's… /s/ /a/ /t/ [sat] Here are my sounds again… /s/ /i/ /t/ | taps |
| tv_start_arrow | Ninja Reading, Sound Dots: the wrong order | the arrow pulses | Ninjas always start at the arrow, on this side. | taps |
| tv_listen_again · tv_which_q_<pair> | the two-rail game, a wrong rail | | Let's listen again. Here I go. Cat… dog. Which one did I read? | taps |
| thats · stays_same · tv_here_slowly · st_what_change | Sound Swap, the wrong tile to change | the tile wobbles; its petal pops | That's… /t/ That sound stays the same. Here they are, slowly… [pat, slowly] [mat, slowly] What do we need to change? | taps |
| tv_sort_look | Sorting, the wrong chest | the word bounces back out; its spelling lights | Let's look again. Which chest has the same spelling? | taps |
| tv_take_time | any turn, 30 s with no tap, once | the answer glows softly | Take your time, ninja. | — |

`listen_again` (a bare "Listen again.") and `listen_here` retire. `fm_its_this` "It's this one!" becomes `tv_its_this`, which hands the turn back.

### 3.5 Wrapping up: the closing line of every game

Each closing line says what the child did (specific), is the level's only praise (SCRIPT_STYLE §8), and hands over to the reward by itself (NAVIGATION rule 7).

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| fm_l1_done | W1 | every bead lit | You can hear the sounds in words. Brilliant listening! | — |
| fm_l2_done | W2 | | You read the pictures, just like a real reader! | — |
| tv_w3_done | W3 | | You heard sounds at the start of words, and inside them. Super listening! | — |
| tv_w4_done | W4 | | You read three pictures in a row, just like a real reader! | — |
| tv_w5_done · t_if_you_say_sounds ↻ | W5 | | You listened to the sounds, and you heard the words. If you say the sounds, you can hear the word. | — |
| fm_l6_done | W6 | | Now you're ready to find out how we write the sounds! | — |
| tv_first_done | First Sounds (and its Letter Hunt) | | You listened for the first sound in every word, and you found how we write it. | — |
| tv_hunt_done | Sound Hunt | | You heard a sound right in the middle of words. That's tricky, and you did it! | — |
| tv_build_done | an early Word Building level | | You built words with their sounds, and you read them. | — |
| tv_learn_done | a dojo with New Sounds | | You learnt four new sounds, and you built words with them. | — |
| tv_dojo_review_done | a dojo with no new sounds | | You built lots of words. Your ninja is getting stronger. | — |
| battle_win · tv_battle_why | a monster battle (tv_battle_why only the first time) | the monster runs away | Hooray! The monster ran away! Every monster you beat helps us win back the sounds. | — |
| battle_boss_win | a boss | | You beat the boss! What a ninja! | — |
| tv_swap_done | Sound Swap | | You fixed all of Baron's muddled words! | — |
| run_end | Ninja Run | | Bong! You made it to the gong! | — |
| story_end | Story Time | | The end! What a story! | — |
| sort_done | Sorting | | Sorted! What a clever ninja. | — |
| trial_win | a gem battle | | You won the gem! It's going into its petal! | — |
| tv_review_done | Sensei's Challenge | | You zapped so many words! That was a real challenge. | — |

- **"Last one" announcements:** `fm_last_one` ↻ "Here's the last one." before a lesson's or level's last item. The time governor uses it only where several answers are left (SCRIPT_FIXES C17.3). The Dojo's last new sound says `tv_learn_last`.
- **Transitions between games inside a lesson** need no link lines: each game's frame opens with "Now…", "Next…", or its name.

### 3.6 The moment before a reward, and the reward itself

*Voice:* a drumroll in the voice for the anticipation line, then plain delight.

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_to_reward | after the closing line; the save's first three level rewards that bring a new sound | the screen softens; a chime | Let's see what you won back from Baron Muddle. | — |
| tv_won_1 (was `petal_got`) | the reward opens with one new sound | its petal rises and swells on the sound | You won back a sound… /i/ | — |
| tv_won_<n> (two to four) | several new sounds (counted as sounds, not spellings: SOUND_DISPLAY A10) | each petal rises on its own sound | You won back two sounds… /m/ … /s/ | — |
| fm_rw_more | the session's first two rewards | the stickers fly into the book | More stickers for your Sticker Book! | — |
| audit_gem_more / r2_gems_more | a gem has filled | the gem lifts | Look, this gem has filled a little more. | — |
| flower_i5 | the save's first gem ready (in place of `gem_ready`) | the gem glows | When a gem is full, it glows. Then you can win it in a gem battle! | — |
| gem_ready | later gems ready | | A gem is glowing! It's ready for a gem battle. | — |
| tv_practise_again | the lesson repeats (§1.9) | | That game was a bit tricky. Let's play it again, and it will feel easier. | — |
| tv_rest | where `dojo_nap` was (a long session) | the ninja yawns and stretches | You've practised so much today! Ninjas need rest too. You can stop here, and your ninja will wait for you. | taps ▶ or Home |
| tv_jump_offer | at most once a session, never on day one (SCRIPT_FIXES C7) | the grown-ups' gear glows | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. | — |
| (none) | the reward holds on ▶ with the idle ladder (§3.1) | ▶ pulses | — | taps ▶ |

- **Retired:**
  - `yay_7` "You did it!" as a reward lead after a level that has its own closing line (SCRIPT_FIXES C7);
  - `petal_got` and `petals_got`;
  - `dojo_nap` ("Shall we have a little break?", a question with no answer);
  - `jump_offer` ("Is this too easy?", asked of a 3-year-old).

### 3.7 The map, and coming back

| id | when (trigger) | on screen | Sensei says (exact text) | the child does |
|---|---|---|---|---|
| tv_welcome_back | the first map of a session | the ninja waves | Welcome back, ninja! I'm so happy to see you. | — |
| world_<n> | the first arrival in a land this session | the land's banner | Welcome to Bamboo Village! | — |
| tv_map_hint | the save's first two map arrivals; later, as the map's 8 s idle nudge | the next stone bounces with the pointing hand | The glowing stone is your next game. Tap it when you're ready. | taps the stone |
| (none) | every other arrival | the ninja walks to the next stone | — | taps the stone |

`welcome_back` ("…Ready for more training?", with nothing to answer it) retires.

### 3.8 Help (Sensei's corner) and Hear it again (the speaker)

- **Help's ladder is unchanged:**
  - 1 press: the turn's question again.
  - 2 presses: the answer glows.
  - 3 presses: the paw points (never answers).
- **On a Ready hold,** Help's first press says `tv_ready_help`.
- **Hear it again replays the turn's bundle** (NAVIGATION §3.5): the frame on its first turn, the naming, and the question, never praise or corrections. On a New Sounds turn it is the current sound's whole teaching.

---

## 4. Checks, retirements and decisions

### 4.1 The budget check: first meetings

**How it was measured:**
- Estimated from the tables at 2.7 words a second plus clip lengths (§0.1).
- **"Can first act"** is the moment the child's first action is live and cued (▶ pops in, the petal blooms, the card or sound buttons glow). A child may act before Sensei finishes her sentence, and a tap cuts the question short (FIRST_MINUTES §3 rule 4).
- **"Longest run"** is the longest stretch of Sensei between two child actions during the introduction.
- **"Today"** is current.md §1's "talk before the first turn".
- **The limits** (ARCHITECTURE §6.4) are 12 s at age 3, 15 s at 4 and 18 s at 5.

| Game (first meeting) | Can first act | Longest run | Today | Notes |
|---|---|---|---|---|
| Choose | 5.2 s | 5.2 s | — | Kai and Suki named |
| Opt-in | 0 s (the cards are live) | 11.9 s | 6.2 s | the reason comes first; each card is named as it's spotlit |
| Dojo welcome | 8.5 s | 10.2 s | 2.9 s | three tricks, then a real "ready" into the first game |
| W1 Find the Picture | 11.7 s | 11.7 s | 10.7 s | now with a frame, a narrated demo and a Ready? |
| W1 rabbit and tortoise | 10.5 s | about 12 s | 19.5 s | the insight moved after the child's tortoise tap |
| W1 ninja ears (notice) | 10.2 s | 10.2 s | 11.7 s | the child taps the cards and the petal |
| W1 Pocket Hunt | 11.7 s | 11.7 s | 8.5 s | the demo is no longer the child's command |
| W2 Ninja Reading | 12.1 s | 12.1 s | 10.2 s | |
| W2 two-rail game | 11.0 s | 11.0 s | no demo | the demo is never dropped at a first meeting |
| W2 Word Squish | 11.9 s | 11.9 s | — | |
| W3 Slow Words | about 12 s | about 12 s | — | |
| W3 Pocket Hunt, inside | 7.9 s (the petal) | 9 s | 9.8 s | |
| W5 Guess My Word | 12.9 s | 12.9 s | 17.0 s | ⚠ 1 s over; see below |
| W6 Sound Dots | 12.2 s | 12.2 s | 10.9 s | |
| w1-2 First Sounds | 8.6 s (the petal) | 10.3 s | 23.3 s | |
| w1-4 Word Building | 7.2 s (the word card) | 10.4 s | 31.4 s | |
| w1-4 Who Read It Right? | 4.7 s | 9.5 s | — | the readers read before the question |
| w1-6 first battle | 10.7 s | 10.7 s | 5.9 s, with the letters live during the intro | the letters stay dim until ▶ |
| w1-7 Sound Hunt | 8.2 s (the petal) | 11.1 s | 29.0 s | |
| w1-8 Sound Swap | 5.9 s (reading the start word) | about 14 s (the demo) | 14.4 s | ⚠ a new thing lands on screen every 2 s in the demo |
| w1-9 Ninja Run | 11.2 s | 11.2 s | 8.4 s | the world waits for ▶ |
| w1-14 Story Time | 9.2 s | 11.8 s (the first child page, with the words live throughout) | 16.8 s | |
| w1-15 first boss | 11.5 s, including Baron's 5.7 s | 11.5 s | 10.7 s, with the letters live during Baron | |
| **w2-1 New Sounds** | **11.3 s** | **about 8 s per sound** | **10.6 s, ending on a bare "Listen…"** | two child actions per sound |
| w6-br1 Sorting (age 5) | 10.4 s | about 12 s | 18.2 s | the chests open on the child's taps |
| First gem battle (age 5+) | 13.3 s | 13.3 s | — | within 18 s; the bar waits for ▶ |

**Over about 12 s at age 3, and why they stay:**
- **W5's frame and demo (12.9 s).** The Sounds~Write sentence "I'll say the sounds, and you listen for the word." and the think-aloud "I can hear sun!" are both essential. If the bot measures more than 13 s, cut the name ("Guess My Word!") from the frame and say it in the close.
- **Sound Swap's demo (about 14 s after the "Ready to watch?" tap).** Every line lands a new visual beat: the stretch, the glow, the kick, the flight, the sweep.
- **Reward 1's opening show (about 14 s over five animated beats).** It is a celebration show, not a lesson.

**What it costs.**
- **W1:** the child now makes about 11 taps (was 5) and says the sound twice. Sensei says about 20 s more in all, but no stretch of talk is longer than 12 s.
- **Where the time comes back from repeats:**
  - W1's slow-word pick stays out;
  - no "Let me show you!" / "Now you try!" labels;
  - no second "Fish dog!";
  - no "Say that sound with me!" (the petal tap replaces it);
  - no Next hold after the notice;
  - Reward 2's petal step is one tap, not two held steps of facts.
- **The first-minutes clock** (FIRST_MINUTES §14, title to map 5:00) will probably land about 5:20 for a quick child. I recommend mechanics §5.4's move: raise the cap to 5:15–5:30, because the extra time is the child's own turns. The bot should re-measure it first.

### 4.2 Lines that retire

- **The first minutes:**
  - `intro_8`, `tut_1`, `fm_help_short`, `fm_speaker`, `st_speaker_ok`, `fm_opt_grownups`;
  - `fm_l1_hello` ("Ninja ears on! Let's listen to some words.");
  - `fm_show_me`, `fm_show_me_2`, `fm_you_try`, `fm_you_try_2`;
  - `fm_tap_sun` (the demo's command) and `fm_tap_sock`;
  - `fm_first_listen`, `t_everyone_say` (in W1), `fm_rw_tap`;
  - `fm_l2_turn`, `fm_l2_start`, `fm_sunflower`, `fm_quick_tap_all`, `fm_which_cat_dog` (its bare "Listen.");
  - `fm_slow_listen`, `fm_slow_another`, `fm_tap_all_in`, `fm_tap_all_words_in`;
  - `audit_made_of_sounds`, `fm_sounds_intro`, `fm_l5_done`;
  - `fm_dots_intro`, `fm_dots_turn`, `fm_dots_say`;
  - `fm_practise_again`, `audit_petal_means`, `map_hint`, `fm_its_this`.
- **The early levels:**
  - `first_intro`, `hunt_intro`, `audit_middle_place`, `audit_last_place` (the first use), `hunt_q`, `find_q`;
  - `ido`, `wedo`, `youdo`, `how_we_spell` (on the preschool path), `audit_hear_see`;
  - `audit_dojo_first`, `two_sounds`, `three_sounds`, `build_ido_1`, `build_ido_3`;
  - `read_intro`, `listen_again`, `listen_here`.
- **The Dojo:**
  - `dojo_hello`, `audit_dojo_back`, `listen` (as any opener), `audit_spell_it`, `dojo_tap_say`;
  - `dojo_find`, `tut_speaker`, `dojo_build`, `dojo_done`.
- **The battles:**
  - `battle_start`, `battle_spell`, `battle_boss`, `audit_baron_first` (it becomes `tv_battle_why`);
  - `timer_intro_1`–`3`, `audit_trial_first`, `audit_timer_short`, `audit_timer_hearts`, `trial_start`.
- **Sound Swap:** `swap_start`, `this_is` (in Sound Swap), `swap_make`, `what_changed`, `audit_swap_first`, `audit_swap_middle`, `audit_swap_last`, `swap_done`.
- **Ninja Run:** `run_start`, `t_listen_for_word`.
- **Story Time:** `story_start`, `story_your_turn`, `story_question`, `audit_story_choice`.
- **Sorting:** `audit_sort_first`, `audit_sort_three`.
- **The shell:**
  - `flower_i2`, `flower_i4`, `flower_i6`;
  - `t_remember_this`, `t_now_you_say_it`;
  - `yay_7` as a reward lead, `petal_got`, `petals_got`;
  - `dojo_nap`, `jump_offer`, `welcome_back`, `streak_10`;
  - the tail clips `tg_<g>_<p>_in` (replaced by `tv_in_<w>_way_we_spell`).

Nothing is deleted until nothing calls it, and every call site guards with `HAS` / `L()`, as SCRIPT_FIXES Part B does. So the wording can ship before its audio.

### 4.3 Decisions I made without asking (for docs/DECISIONS.md)

| # | Decision | Why |
|---|---|---|
| D1 | **Every game type has a name** a child can remember (§0.4): Find the Picture, Pocket Hunt, Ninja Reading, Word Squish, Guess My Word, Sound Dots, First Sounds, Letter Hunt, Sound Hunt, Word Building, Who Read It Right?, New Sounds, Sound Swap, and so on. | So "It's Pocket Hunt again" can replace a second full explanation (research §1 step 3). |
| D2 | **A question mark means the child can answer now.** "Are you ready?" is asked only when ▶ is there to answer it. Rhetorical questions go: "Did you notice?", "Remember?", "Do you remember this one?", "Shall we have a little break?", "Is this too easy?", "Ready for more training?". | A question followed by more talk teaches a child that questions don't need answers (research §4 #7). |
| D3 | **A level always opens with at least its game's short line.** mechanics' "none" form applies only inside a level. | So no stone opens cold, on a stem like "Which one starts with…". |
| D4 | **Long demos get a join-in.** Where it exists, it is a tap that means something: the petal ("say it with me"), the word card, the notice's cards, reading the start word, Sensei starts and the child finishes, or the chests. "Are you ready to watch?" + ▶ is used only for Sound Swap. | Jonas's first "Are you ready?", without adding empty taps. Every run stays near 12 s. |
| D5 | **The paw (Show me again) is introduced at the save's second Ready,** not the first. | One new control at a time, and W1's first Ready stays under 12 s. |
| D6 | **W1's rabbit tap is no longer optional.** | It is the child's action that splits the fast/slow insight from the notice. It costs about 4 s. |
| D7 | **In First Sounds, the first letter is written on the child's own first right answer (the we do), not in Sensei's demo.** "Writing a sound down is called spelling." is said once per save. | It keeps the I do under 12 s. The first letter lands under a picture the child found, and the word "spell" is explained before the battles use it. |
| D8 | **"Write" for a preschool child** ("This is how we write… /s/", the Early Years wording). "Spell" is used after w1-2's definition, and in the official Sounds~Write phrases. | The brief and Sounds~Write's Early Years samples. |
| D9 | **A sound ends its sentence.** "This is the way we spell /m/ in mat" is recorded as "In mat, this is the way we spell… /m/". The "…in mat." tail clips retire. | The brief's rule: no sound in the middle of a sentence. The Sounds~Write meaning and words are kept. |
| D10 | **No ear icon anywhere.** The listening cue is the ninja cupping its ear, explained once in W1 ("That means listening really carefully."). The Dojo's lead-in is "Get your ninja ears ready." then "Here it comes…". | Jonas's "weird shouted Listen" and the unexplained ear. |
| D11 | **Punctuation.** Instructions end in full stops, and every ↻ line is re-recorded. "!" is kept only for surprises, celebrations and Ninja Run's starting gun. | Jonas heard the "!" lines as shouting (research §4 #16). |
| D12 | **The first battle has no demo.** It is framed as "just like Word Building", and the paw offers Word Building's demo. The letters stay dim until ▶. | The child has built words twice already. Today's first battle lets the child tap letters during the intro. |
| D13 | **Sound Swap's first meeting starts with the child reading the start word.** Sensei's swap follows a "Ready to watch?" tap. | Sounds~Write: pupils "say the sounds and read the word before the sound swapping begins". It also splits the longest demo. |
| D14 | **Kai and Suki are named at Choose** ("Will it be Kai, or Suki?"). | So they're known when they turn up as the readers in w1-4. |
| D15 | **W1's notice is driven by the child.** The child taps the sun and the sock to hear their first sounds, and the first petal is named, and tapped, the moment it appears. | Noticing works better when the child finds it. The petal was unexplained for 2:45. |
| D16 | **The first World Flower visit and Reward 2 each give the child a petal to tap.** | They were 38 s and 45 s of facts with nothing to do. |
| D17 | **Lines for grown-ups say so** ("Grown-ups, you can change this later…", "Grown-ups, if this is too easy…"). | They were said to the child. |
| D18 | **The Learn's series shape.** The first sound is taught in full; the next are "Here's the next new sound…", "Tap its petal, and say it.", "And this is how we write…", "Your turn."; the last is "Here's the last new sound…". | SCRIPT_FIXES C2, and Jonas's "robotic repetition". |
| D19 | **The Sticker Book's first sticker tap echoes fast, then slow, with a callback to the rabbit and the tortoise.** | It links the reward to the lesson it came from. |
| D20 | **Baron's "will squash you" is only a suggestion to soften** (§1.24). | Baron's lines are outside this brief. |

### 4.4 What the build lanes need beyond mechanics.md

| Lane | What this script needs |
|---|---|
| **F2 Voice** (`lines.ts`) | A new block, "Teacher voice (docs/TEACHER_SCRIPT.md)". About 270 new single lines, the 29 re-recordings marked ↻, and 19 generated families: `tv_where_<w>`, `tv_found_<w>`, `tv_find_again_<w>`, `tv_tap_the_<w>`, `tv_now_tap_<w>`, `tv_hear_in_<w>`, `tv_i_hear_<w>`, `tv_which_q_<pair>`, `tv_which_q_<three>`, `tv_know_this_<p>`, `tv_in_<w>_way_we_spell`, `tv_in_<w>_spelt_like_this`, `tv_yes_<reader>`, `tv_right_<reader>`, `tv_pocket_ready_<n>`, `tv_won_<n>`, `tv_learn_frame_<n>`, `tv_learn_all_<n>`, `tv_learn_short_<n>`. Rotations: `tv_ready_q1`–`q3`, the praise bank, and the Letter Hunt and First Sounds stems. |
| **F3 Petals** | `holdReady()` as mechanics §4.6, plus `tv_ready_to_watch` as a Ready variant whose answer starts a show. Petals are tappable join-ins while Sensei waits for them (the nod-and-tink rule still protects explanations). Misty petals above the Dojo that float down one at a time. The mini petals for the Learn tally and Sound Dots. |
| **C2 Warm-ups** | The notice with tappable cards (held first sounds) and a petal tap to finish it; no `W1:7` hold. The rabbit is not optional in W1. The two-rail demo is never skipped at a first meeting. W3's rabbit and tortoise use the word-independent lines. W5's naming separated from its sounds. W6's dots turn into mini petals. |
| **C1 Early** | The I do with a petal tap join-in for each new sound. The letter written at the we do, then a letter tap. Build's word-card tap and "I'll start, you finish". Read-back tiles as sound buttons. Kai and Suki read before the question. Decks: remove the apple from w1-3 (SOUND_DISPLAY A12), and flag zip and top. |
| **D1 Dojo** | The Learn frame and ▶; the misty petals; two child actions per sound; Find's petal tip before the first question; Build's first-word lock and its I do for school paths. |
| **D2 Battle** | The letter row dim until ▶ (▶ in the column); `tv_battle_why` at the first win; the trial's bar waits for ▶. |
| **D3 Swap** | Reading the start word as sound buttons; the "Ready to watch?" hold; the paw's demo of mat to sat; the protected place line. |
| **D4 Sort** | In the first sort, the chests open on the child's taps. |
| **D5 Run** | The start ▶ on every run; neutral dots in the banner. |
| **D6 Story** | The question's pictures appear after `tv_story_q`; the tick explained on the first child page. |
| **B lanes** | The film's arrow line; Choose's two lines; the map lines (§3.7); the reward leads (§3.6); Reward 1's sticker line; Reward 2's petal tap; the first World Flower visit's petal tap. |
| **A lane** (Training) | The three tricks, the stars that light, the rhyme and the speaker's replay of it, and the ▶ into W1. |
| **Art** | Redraw the /g/ petal (a white faceless ghost that reads as an ear). |
| **F4 Checks** | Three new audits besides mechanics §9's:<br>• `rhetorical-question`: a "?" line not followed by a hold or turn that can answer it;<br>• `shouted-instruction`: an instruction line, starting with a verb such as Tap, Find, Say or Listen, that ends in "!";<br>• `demo-command`: a line addressed to the child inside a show whose paw is moving. |

### 4.5 Recording notes

- **One voice** (Sensei: Sulafat, en-GB, plain text only), at −18 LUFS for whole sentences (FIRST_MINUTES §12).
- **The few one-word clips that remain** (`thats`, `we_need`) are matched about 3 LU under the sentences around them (mechanics §7.4). None of them opens a beat.
- **Lead-ins ending "…" are recorded suspended:** the pitch falls no more than 2 semitones over the last 300 ms. `tv_here_it_comes` should sound like a held breath, not a command.
- **Lines with a "…" in the middle** ("I'm looking for the sun… There it is!", "Now let's say the sounds… and read the word.") are one recording with a natural pause.
- **Word timings** (Whisper) drive the spotlights and the paw for every line that names a card or a control: `tv_find_demo`, `tv_ts_meet`, `tv_ready_first`, `tv_ready_paw`, `tv_opt_notyet` and `tv_opt_yes`, and the Dojo's `tv_learn_how`.
- **After recording**, run `continuous.ts` on a frozen build for the learner and perfect personas from the title to w2-1. The script-audit targets are SCRIPT_STYLE §12's, plus:
  - no "!" instruction;
  - no rhetorical question;
  - no bare `listen` opener;
  - no run over 12 s at age 3 except the three named in §4.1;
  - every first meeting has frame, show, Ready and turn, in that order.
