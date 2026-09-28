# Sensei's teacher voice: the script

**27 September 2026. The final script for the teacher-voice work, written by the head writer.** It answers Jonas, after playtesting the preschool levels with his 3- and 4-year-old (26 Sep):

> "I find that this extremely abbreviated way of talking, it doesn't help at all. Like teachers give, do like way better explanations, right? They say, so first, I'm going to show you how to do it. Are you ready? And this is how this game goes. I will show you this, and you will do that. Do you want to give it a go now? … Or this like weird shouted, listen, I just said, listen. That's super weird in the first dojo level where it just starts with this, and this ear appears. Teachers explain what they're doing."

It also answers two earlier warnings. The first is "It just says, A, two letters, one sound, A, two letters, one sound": the robotic repetition that [SCRIPT_STYLE.md](SCRIPT_STYLE.md) and [SCRIPT_FIXES.md](SCRIPT_FIXES.md) fix. The second is Round 13: the first game was "too long and boring" for the 3-year-old. So the aim is not more talk. It is **real teacher talk**: frame the game, say who does what, narrate the demo, check readiness with a tap, and hand over. Every sentence is short and whole, and the child gets a turn every few seconds.

**How it was made.** Three drafts were written from the same brief: the CBeebies writer's ([draft-cbeebies-writer.md](teacher-voice/draft-cbeebies-writer.md), "CB"), the Early Years specialist's ("EYS") and the Reception teacher's ("RT"). Three judges scored them: [Jonas's bar](teacher-voice/judge-jonas-bar.md), [pedagogy](teacher-voice/judge-pedagogy.md) and [the three-year-old](teacher-voice/judge-three-year-old.md). All three judges put CB first, so it is the base. Each section below starts from its winning draft, with the judges' grafts and kill lists applied. The mechanics are [mechanics.md](teacher-voice/mechanics.md) (frame, show, Ready?, turn; `holdReady()`; the game ledger), with the changes logged in §8. The run estimates come from [`playtest/runs/teacher-voice/head-writer-runs.py`](../playtest/runs/teacher-voice/head-writer-runs.py). No game code was touched.

**Who builds it.** The fix plan's lanes, in [FIX_PLAN_PERF_SCRIPT_SOUNDS.md](FIX_PLAN_PERF_SCRIPT_SOUNDS.md) §13 "Teacher's voice (TV)". The house style is [SCRIPT_STYLE.md](SCRIPT_STYLE.md) §T. Six sample lines were recorded with the real voice and judged ([teacher-voice/samples/](teacher-voice/samples/), §7.4).

---

## 0. The short version

### 0.1 The anatomy of a first meeting

Every game, the first time a child meets it, goes like this:

1. **Frame.** Say what the game is and who does what, in one or two whole sentences, as the board arrives: "I'll say a word. Then you find its picture."
2. **Narrated demo.** Sensei does one, in the first person, thinking aloud, with a reason: "I'll go first. My word is sun… There it is!" · "Fish came first. So I tap this row." It is never the child's instruction said during Sensei's demo, and never a question that the paw then answers.
3. **Readiness.** A whole question, answered with a tap: "Do you want to have a go now?" The green arrow (▶) means "I'm ready" and the paw means "show me again". The child's ninja stands ready, facing ▶, and bows on the answer.
4. **Hand-over.** The child's version of the demo, in the same words: "Your word is sock. Can you find the sock?"
5. **Specific praise.** The model answer is the feedback ("Mop starts with… /m/"), plus a specific line at most every second right answer ("You listened right to the very start.").
6. **Wrap-up.** The game says it has ended, and what comes next: "That's the end of Ninja Ears. Now watch what happens to your pictures."

**Replays are short.** The full version plays the first time only. On a later day the child hears a one-line recap ("It's Sound Swap again. We change one sound to make a new word.") and the demo again. After two tellings, one line ("It's First Sounds again, with two new sounds."), and nothing on later plays that session (§2.2).

**About 12 s before a turn.** No stretch of Sensei's talk runs more than about 12 s before the child can do something the game registers: a tap on ▶, a card, the petal, the word card or a tile. Where a frame and demo would run longer, the child joins in part-way with a tap that means something (§6).

**Never a bare command.** No line under four words is an instruction. "Watch.", "Your turn.", "Listen…", "Tap the sun." and "Last one." become whole sentences. Instructions end in full stops, "?" is only for questions the child can answer, and "!" is only for celebrations. That is what stops the shouting.

### 0.2 Three moments, before and after

**The first Dojo lesson (w2-1: Jonas's "Listen!" and the ear).**

> *Today:* This is the dojo. A dojo is where ninjas practise! Let's practise some sounds. **Listen…** /b/ /b/ *(a big golden ear pulses)* And this is how we spell it. /b/ Tap it, and say it with me! · *(then)* **Listen…** /k/ /k/ …
>
> *Now:* Today in the dojo, I'm going to teach you four new sounds. *(four misty petals twinkle above)* I'll say each sound, and show you how we write it. Then you say it with me. Are you ready for the first one? Tap the green arrow. *(▶; the ninja bows)* Here's the first new sound. Get your ninja ears ready. *(the ninja cups its ear; a misty petal floats down)* Here it comes… /b/ … /b/ *(the petal blooms on the sound)* You can hear it in bat, bag and bin. Tap the petal, and say it with me. *(taps; says /b/)* Now watch my ninja write it. *(the spell)* This is how we write… /b/ Now you tap it, and say the sound. *(taps twice)* Good, you said that sound really well. · *(then)* Here's the next new sound… /k/ … /k/ Tap its petal, and say it. …

**The very first game (W1).**

> *Today:* Ninja ears on! Let's listen to some words. This is the sun. This is a sock. This is a cat. Let me show you! **Tap the sun!** Now you try! Tap the sock!
>
> *Now:* *(the welcome ends)* It's a listening game, called Ninja Ears. Tap the green arrow when you're ready. *(▶)* I'll say a word. Then you find its picture. This is a sock. This is a cat. I'll go first. My word is sun… There it is! *(the paw taps; the ninja kicks)* Look, your ninja is ready. Are you ready too? Tap the green arrow. *(▶; the ninja bows)* Your word is sock. Can you find the sock?

**The first Word Building (w1-4).**

> *Today:* This is our dojo. Here we listen to sounds, make words, and read them. This word has two sounds! *(said over an empty room)* Watch me first! I say the word… am. I say it slowly… aaammm. Ninjas read this way! We start here, and go this way. Now I find each sound, one at a time. … *(31 s before the child's first turn)*
>
> *Now:* This game is called Word Building. I say a word, and we build it with its sounds. Each line is for one sound. This card is my word. Tap it, and hear the word. *(taps: "am")* I say it slowly… aaammm. I can hear two sounds. aaammm. The first sound is… /a/ *(the paw; the ninja launches it)* Can you find the last one? *(taps < m >)* Now let's say the sounds… and read the word. /a/ /m/ am. Now let's build one together. Are you ready?

### 0.3 The numbers

- **339 new line ids to record** (`tv_…`): 314 single lines and 25 generated families (about 59 recordings for the words on this path), plus one new generated `tg_` family. The median line is 9 words. The full list is §7.1; the recording plan is the fix plan's §13.
- **24 kept lines re-recorded** with calmer punctuation (↻, §7.2), and **125 lines retired** from these paths (§7.3).
- **Of the new lines,** 246 are on the preschool path from the film to w2-1, 54 are recap and short forms or games a preschool child doesn't meet before w2-1, and 39 are the recurring moves (Ready, the paw, praise, correction, idle, wraps).
- **Every first-meeting run is estimated at 12.3 s or less** before the child can act (one age-5 run at 12.8 s). Five runs of 12.1–12.3 s are named, each with its cut ready (§6). Today's worst runs were 23–31 s.
- **Six sample lines were recorded** with the real voice. All six were word-perfect, British and warm on the first take, with no letter names and nothing shouted (§7.4).

---

## 1. How to read the tables

| Column | What it holds |
|---|---|
| **line id** | `tv_…` is a new line to record. A plain id is an existing clip, kept as it is. **↻** marks an existing id re-recorded with the text shown (usually a "!" that becomes a full stop). *(replaces `x`)* names the existing line this one takes over from; `x` retires on this path (§7.3). `<w>`, `<p>`, `<pair>`, `<n>`, `<game>` and `<reader>` mark a **generated family**: one whole recording per word, sound, pair, count, game or reader, made by the line generator the way `fm_name_<w>` and `fs_<w>` are today. |
| **trigger** | When it is said: game seconds from the start of the beat, or the event ("the tap", "a wrong tap", "8 s idle"). **↳** marks a branch (a miss, idle, Help), not the main line of play. |
| **on screen** | What the child sees as it is said. The thing named is on screen, lit, before or as it is named. |
| **exact text** | **Exactly what is recorded**, plus its slots. Gemini TTS reads stage directions aloud, so nothing else goes in this column. Clips said in a row are joined with " · ". |
| **the child does** | "—" means the child watches and listens. |
| **first time or replay** | **full** (the first meeting of the game), **recap** (a later day, §2.2), **short** (the game is known), **none** (a later play in the same level), **every time**, **once per save**, or a count ("first two per save"). |

**Slots.** Each slot is its own clip, placed at the end of a sentence or alone between two sentences, never inside one:

| Slot | What plays |
|---|---|
| /s/ | a pure sound; its petal is on screen and swells as it plays ([SOUND_DISPLAY.md](SOUND_DISPLAY.md)), except where the sounds are the question (oral blending: neutral dots, Dec1) |
| [sun] | the word |
| [sun, slowly] | the stretched word ("sssuuunnn") |
| [sun, first] | the held first sound ("sssun") |

A line with a slot after it ends on "…" and is recorded suspended: the pitch falls no more than 2 semitones over its last 300 ms (FIRST_MINUTES §12). In `lines.ts` it ends on ASCII "...", so `gen-audio.ts` checks its tail. A line with "…" in the middle and no slot ("My word is sun… There it is!") is one recording with a natural pause.

**▶** is the green Next arrow. **Ready** is the readiness hold (§2.3). **The paw** is Show me again. **The petal** is a sound (SOUND_DISPLAY), and **letters** are a spelling.

---

## 2. The rules that shape every line

### 2.1 The anatomy, and what each step may say

| Step | On screen | Sensei | Shape and budget |
|---|---|---|---|
| **Frame** | the board arrives (cards drop in, the rail slides in, the monster lands) | what the game is and who does what: "In Pocket Hunt, we find pictures that start with this sound." · "I'll say a word. Then you find its picture." | 1–2 whole sentences, about 4 s. Present tense; "I" for Sensei, "you" for the child, in the order it happens. The game's name goes inside a sentence ("Let's play Ninja Reading.", "This game is called Word Building."), or on the map's preview when the level's own budget is tight (§5.8) |
| **Demo** | the paw taps, the ninja moves, the result shows | the first person, thinking aloud, with a reason: "I'll go first." · "Hmm, let me listen." · "So I'll tap it." | about 5 s. Never the child's instruction; never a question the paw answers. When frame + demo would pass 12 s, the child joins in part-way with a tap that means something: the petal ("Tap the petal, and say it with me."), the word card ("Tap it, and hear the word."), or "I'll start, and you finish" ("Can you find the last one?") |
| **Readiness** | ▶ and the paw; the ninja faces ▶ in its ready stance | a whole question: "Do you want to have a go now?", or a hand-over that names the task: "Now you find the other two. Are you ready?" | ≤ 2 s (the save's first two: ≤ 5 s). §2.3 |
| **Hand-over** | the turn's own board | the child's version of the demo: "Your word is sock. Can you find the sock?" | the turn's first line is the answer to the child's "yes"; no extra "Here we go" |
| **Feedback and praise** | the answer lands | the model answer first ("Mop starts with… /m/"); a specific praise line at most every second right answer (every third in the warm-ups) | §5.3 |
| **Wrap-up** | the game ends | what the child did, and what comes next: "That's the end of Ninja Ears. Now watch what happens to your pictures." · "Next, we're going to build some words." | one line; it is the game's praise, so nothing is stacked on it |

**Where Jonas's two "ready" moments go.** His "Are you ready?" before the demo is an attention-getter. It is spoken as a statement with no tap ("I'll go first."), because a question the child can't answer teaches them that questions don't need answers. There are two exceptions, where it is a real question answered on ▶: the Dojo lesson's "Are you ready for the first one?" (§3.26) and Sound Swap's "Are you ready to watch?" (§3.20), before the one demo too long to split any other way. His "Do you want to give it a go now?" is the Ready after the demo, on every full form.

### 2.2 The four forms, and the "introduced" state rule

Each game type has one entry in the child's ledger, `narr["game:<id>"]` (the existing `narrate.tsx` ledger, per profile, wiped with the save), holding `{ n, at[], s[], lastAt, lastSession, struggled }`. The form is chosen from it by `frameForm()` (mechanics §5.2, with the changes below):

| Form | When | What plays |
|---|---|---|
| **full** | `n === 0`: the child has never been introduced to this game | frame · demo · **Ready** (the long form, if it is one of the save's first two Readies) · hand-over · turn |
| **recap** | the first play in a later session while `n < 2`; or after 21 days without it; or `struggled` last time | the one-line recap (a statement, §2.4 rule 9; the lines are in §4.1) · the demo · a spoken hand-over · turn. **Ready is added only after 21 days away or a struggle** (then: "Do you want to have a go now?") |
| **short** | the first play in a session once `n >= 2` | one line that names the game · turn. The paw still offers the game's canonical demo where it uses its own pictures (§4) |
| **none** | a later play of the same game in the same session, **inside a level** | the question only (SCRIPT_FIXES A5, A6 fade the stems). **A level never opens on "none"**: it opens with at least the short line |

**When a game counts as introduced.** A telling (`framed(id)`) is recorded:
- on a **full** form, when the child answers the Ready hold (▶, a board tap, or a right-answer tap during a hand-over Ready);
- on a **recap** form without a hold, when the child gives their first answer in the turn.

A frame cut off by Home, a turned phone or a crash doesn't count, so the next visit frames the game in full again (ARCHITECTURE §3: log what was heard). `played(id, { struggled })` sets `lastAt`, `lastSession` and `struggled` at the end of the game's beat. `struggled` means the second-miss help or the 16 s idle point was reached on two of the game's first three turns.

**Teaching shows follow their own dosage, not the game's.** A new sound's I do in First Sounds, Sound Hunt or the Dojo, a new spelling's reveal, and the fast/slow insight are dosed by the idea or the spelling (ARCHITECTURE §6.2). So a known game with a new sound still shows the new sound, but with no Ready hold.

**The save's firsts.** Some lines are once per save, keyed in the same ledger: `ready:first` (`tv_ready_first`), `ready:paw` (`tv_ready_paw`), each symbol's explanation (`sym:<name>`, §2.5), `map:next:<game>` (§5.8) and the reward leads (§5.7).

**Old saves.** When the ledger is first read, each game type with stars on any level that plays it gets `{ n: 2, s: [0, 0], lastSession: -1 }`, so it plays short and a returning child isn't walked through every game again. `dojo:welcome` and `dojo:back` fold into `game:learn`, and `dojo:first` into `game:build`.

### 2.3 The readiness interaction

This is mechanics §4's `holdReady()` in `src/ui/nav.tsx`, built on `holdNext()`, with three changes (§8, T3–T5).

**Where it is used:**
- after the demo on every **full** form, and on a recap after 21 days away or a struggle;
- before the Dojo lesson's first sound (§3.26), whose Learn is the show and the turn in one;
- before Sound Swap's first demo ("Are you ready to watch?", §3.20);
- as the **starting gun** of every Ninja Run, boss and gem battle, and of a Monster Battle's full and recap forms: the world, the letters and the bar wake only on ▶ (in the right-hand column where the letters fill the nav row). A Monster Battle's short form has no hold: its letters wake as its one line ends.

**The answers:**

| The child taps | It means | What happens |
|---|---|---|
| ▶ (Next) | "I'm ready" | the ninja bows (a ninja's *rei*); the turn's first line follows |
| the paw | "show me again" | `tv_show_again`, then the demo replays exactly, narrated, while ▶ goes dim. Then `tv_ready_now`, and ▶ comes back. There is no limit on replays |
| a card or tile on the board | "I'm ready" | the tapped card says its word, then the turn starts |
| **the right answer, during a hand-over Ready** ("Now you find the other two. Are you ready?") | "I'm ready", **and** the answer | it counts as the first answer. The child isn't asked again for something they just found (the three-year-old judge's §6.1) |

**The lines:**

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ready_first | the save's first Ready (W1's first game) | ▶ pops in, pulsing and spotlit on "green arrow"; the ninja turns to it in its ready stance with a small bounce | Look, your ninja is ready. Are you ready too? Tap the green arrow. | taps ▶ (or a card) | once per save |
| tv_ready_paw | the save's second Ready (W1's Fast and Slow): it introduces the paw | ▶ spotlit on "green arrow", then the paw on "paw" | Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. | taps ▶ or the paw | once per save |
| tv_ready_go | every later Ready with no hand-over line of its own | ▶ and the paw | Do you want to have a go now? | taps ▶ | full; recap after 21 days or a struggle |
| tv_ready_together | after an I do, when the next item is a "we do" | ▶ and the paw | Let's do the next one together. Are you ready? | taps ▶ | full |
| tv_ready_yours | after an I do, when the next item is the child's own | ▶ and the paw | Now you do one. Are you ready? | taps ▶ | full |
| (per game) | a hand-over that names the task: `tv_pocket_ready_<n>`, `tv_rail_ready`, `tv_squish_ready`, `tv_dots_ready`, `tv_swap_ready`, `tv_battle_ready`, `tv_boss_ready`, `tv_learn_ready`, `tv_run_ready`, `tv_trial_ready` | ▶ (in the column where the letters or chests fill the row) | (in each game's table) | taps ▶ | full |
| tv_ready_to_watch | before Sound Swap's first demo | ▶ | I'll show you first. Are you ready to watch? Tap the green arrow. | taps ▶ | full (Sound Swap only) |
| tv_show_again | ↳ the paw tapped, in a hold or a turn | ▶ dims; the demo replays on its own pictures | Of course. Watch my paw again. | watches | every time |
| tv_ready_now | ↳ a replay has ended, in a hold | ▶ back, pulsing | Are you ready to have a go now? | taps ▶ | every time |
| tv_turn_again | ↳ a replay has ended, in a turn | the turn's pictures are back | Now it's your turn again. | (the turn's question follows) | every time |
| nav_ready ↻ | ↳ 16 s with no tap, and again at 40 s (at 8 s ▶ glows and the pointing hand sits on it, with no line) | the ninja jumps and points its star at ▶ | Tap the green arrow when you're ready. | — | every time |
| tv_offer_show | ↳ 24 s with no tap, once per hold | the paw pulses | Or I can show you again. Just tap my paw. | — | every time |
| tv_ready_help | ↳ Help's first press during a hold (later presses nudge ▶) | ▶, then the paw, spotlit | When you're ready, tap the green arrow. To see it again, tap my paw. | — | every time |

After 40 s the hold goes quiet: nothing starts the turn by itself (NAVIGATION rule 5), and the lesson clocks stop after 1.5 s held. **Hear it again** during a hold replays the frame and the Ready question, never the demo (that is the paw). Home leaves, and nothing is recorded.

### 2.4 Sensei's voice: the rules

1. **Whole sentences** of 4–12 words, with a subject and a verb, one idea each, about what the child can see.
2. **Never a bare command.** No line under four words is an instruction. "Watch." → "Now watch my ninja write it." · "Your turn." → "Now you tap it, and say it." · "Tap the sun." → "Tap the sun, and listen to how it starts." · "Last one." → "Here's the last one." Praise and celebrations may be short ("Brilliant!", "Starfish!", "Hooray!").
3. **Punctuation carries the voice.** Frames, instructions and demos end in full stops. "?" only where the child can answer now, with a tap or out loud ("Can you find the sock?", "Are you ready too?"). "!" only for surprises and celebrations ("There it is!", "Fish dog!").
4. **A pure sound only ever ends a sentence or stands alone,** after a lead-in recorded suspended ("Our first sound is…" /m/). A word inside a sentence means one whole recording per word, in a generated family.
5. **The demo is Sensei's, in the first person, with a reason.** "I'll go first." · "Hmm, let me listen." · "Fish came first. So I tap this row." Never the child's instruction during Sensei's demo; never a question that the paw answers.
6. **"Listen" always has its object:** "Listen for the word…", "Listen for the start…", "Now the last sound. Listen right to the end…". The one-word `listen` clip never opens a game, a beat or a level (the lead-ins are in §5.9).
7. **Every symbol is explained once, where it is first used** (§2.5), in one sentence, as it appears.
8. **Every game has a name,** said inside a sentence and never shouted alone ("This game is called Word Building.", not "Word Building!"). A name used in a recap must have been said at the first meeting.
9. **Recaps are statements,** not rhetorical questions: "It's Sound Swap again. We change one sound to make a new word." or "You know this game." Never "Remember Sound Swap?".
10. **Praise the work, specifically, at most every second right answer,** never stacked, never trait praise ("clever ninja", "ninja master"). The model answer is the feedback.
11. **Correct gently.** The tapped card says its own word; Sensei rephrases (never repeats), ends on the answer, and hands the turn back. Never "No", "Wrong", a buzzer or red.
12. **Games link.** A game ends by saying it has ended; the next starts with "Next…" or "Now let's…". Two games in one level are joined by `tv_next_game` or `tv_next_build` (§5.6).
13. **Sounds~Write, always:**
    - pure sounds, and never letter names;
    - a spelling never "says" or "makes" a sound;
    - the early games say "This is how we write… /s/" (the Early Years wording);
    - "spell" arrives at the first battle ("That's how we spell a word.") and in the official phrases, word for word: "This is the way we spell it in mat.", "It's two letters, but it's one sound.", "Say the sounds, and read the word.", "Same sound, different spellings.", "I'll say the sounds, and you listen for the word.", "If you say the sounds, you can hear the word.", "Good, you said that sound really well."

### 2.5 Every symbol, and where it is explained

| Symbol | First seen | Explained by | § |
|---|---|---|---|
| The green arrow ▶ | the film, shot 1 | `tv_film_arrow` "When you're ready to see what happens next, tap the green arrow." | 3.1 |
| The three stars (the welcome) | the welcome | `tv_train_tricks` "…Each one wins a star." | 3.4 |
| Sensei in the corner (Help) | the welcome | `tv_train_help` | 3.4 |
| The speaker | the welcome | `tv_train_speaker` + the rhyme said again | 3.4 |
| The rabbit and the tortoise | W1 | `tv_ts_meet`, `tv_ts_fast`, `tv_ts_slow` | 3.5 B |
| The paw | W1, the second Ready | `tv_ready_paw` | 2.3 |
| Ninja ears (the ninja's listening pose) | W1 | `tv_ears_on` "…That means listening really carefully." | 3.5 C |
| The petal | W1, the first sound | `tv_petal_first` "That sound has its very own petal…" | 3.5 C |
| The pockets | W1, Pocket Hunt | `tv_pocket_frame` + `tv_so_pocket` | 3.5 D |
| The Sticker Book | Reward 1 | `tv_rw_book` | 3.6 |
| The rail's start (reading this way) | W2 | `tv_rail_frame` "Ninjas always start on this side, and go this way." | 3.7 A |
| Two rows | W2 | `tv_which_frame` | 3.7 C |
| The World Flower, the map and its stones | Reward 2 | `tv_rw2_flower`, `tv_map_intro` | 3.8 |
| The sound dots | W6 | `tv_dots_frame` | 3.12 |
| Letters | w1-2 | `tv_watch_write` + `tv_how_we_write` "This is how we write… /m/" | 3.13 |
| The lines and the word card | w1-4 | `tv_build_lines`, `tv_word_card` | 3.16 |
| Gems | w1-4's reward | `audit_gem_first` (moved out of the we do) | 3.16 |
| Kai and Suki | named at Choose; met in w1-4 | `tv_choose_q`, `tv_readers_meet` | 3.2, 3.16 |
| The monster's bar | w1-6 | `tv_bar_down` "Zap! Look, its bar went down." | 3.18 |
| The lanterns | w1-9 | `tv_run_lanterns` | 3.21 |
| The green tick | w1-14 | `tv_story_tick` | 3.23 |
| The misty petals in the Dojo | w2-1 | `tv_learn_frame_<n>` (they twinkle on "four new sounds") | 3.26 |
| Hearts | the first gem battle | `tv_trial_heart`, when the first heart is lost | 4.2 |

**No ear icon anywhere.** The listening cue is the ninja cupping its ear, explained once in W1. `Icon.ear` goes (mechanics §7.4).

### 2.6 The games and their names

| Game id | Name Sensei uses | First met (preschool path) | Who does what, in one sentence |
|---|---|---|---|
| `tap` | Ninja Ears | W1 | I'll say a word. Then you find its picture. |
| `fastslow` | the rabbit and the tortoise | W1 | The rabbit says words fast, and the tortoise says them slowly. |
| `notice` | (a show the child drives: ninja ears) | W1 | Let's listen for the very first sound. |
| `tapall` | Pocket Hunt | W1 | We find pictures that start with this sound. |
| `rail` | Ninja Reading | W2 | Ninjas always start on this side, and go this way. |
| `which` | (two rows) | W2 | I'll read one row, and you tap it. |
| `compound` | Word Squish | W2 | Two little words make one big word. |
| `slowpick` | Slow Words | W3 | I say a word slowly. You find its picture. |
| `sounds` | Guess My Word | W5 | I'll say the sounds, and you listen for the word. |
| `dots` | Sound Dots | W6 | Every dot is one sound in the word. |
| `firstsound` | First Sounds | w1-2 | I say a sound, and you find the picture that starts with it. |
| `find` | Ninja Eyes | w1-2 | I say a sound, and you find how we write it. |
| `build` | Word Building | w1-4 | I say a word, and we build it with its sounds. |
| `readcheck` | Kai and Suki (Who Read It Right) | w1-4 | They'll both read this word. Only one of them reads it right. |
| `battle` | a Monster Battle | w1-6 | I say a word, and you find its sounds to zap the monster. |
| `soundhunt` | Sound Hunt | w1-7 | The sound is hiding in the middle of the word. |
| `swap` | Sound Swap | w1-8 | We change just one sound, to make a new word. |
| `run` | Ninja Run | w1-9 | Your ninja runs all by itself, and you catch the word. |
| `story` | Story Time | w1-14 | I'll read some pages to you, and you'll read some pages to me. |
| `boss` | a boss | w1-15 | A boss takes lots of words to beat. |
| `learn` | New Sounds (in the dojo) | w2-1 | I'll say each sound, and show you how we write it. Then you say it with me. |
| `sort` | Sorting | w6-br1 | Every word goes in the chest with the same spelling. |
| `trial` | a gem battle | the first Gem Trial | Spell each word before this purple bar is full. |
| `review` | Sensei's Challenge | the map's button | Words from all the games you've played. |

"Which Row" and "Who Read It Right" are the registry's names, but Sensei never says them: a name with a question inside it lifts like a question. The two-rows game is introduced by its rows, and the reading check by Kai and Suki.

---
## 3. The preschool path, in play order

A brand-new child who answers "not yet", from the film to the first Dojo lesson (w2-1). Levels are in map order. Each game is written in its **full** form, with the forms it takes on this path when it comes back. Levels speak only once they are on screen (Dec5).

### 3.1 The film

*Voice:* a storyteller, unchanged.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| film_1 | shot 1 | the World Flower | Long ago, on the Island of Sounds, there grew a magic World Flower. | — | every time |
| tv_film_arrow | 1 s after `film_1` ends | ▶ pops in, pulsing, with the pointing hand on it | When you're ready to see what happens next, tap the green arrow. | taps ▶ | once per save |
| film_2 … film_8 | each shot, held on ▶ | the film | (unchanged) | taps ▶ after each | every time |

### 3.2 Choose your ninja

*Voice:* a teacher meeting a new child: warm, delighted, unhurried.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_choose_hello (replaces `intro_8`) | Choose appears | Sensei's portrait glows; the Kai and Suki cards | Hello! I'm Sensei Maple, and I'm going to be your teacher. | — | once per save |
| tv_choose_q | 4.4 s | Kai spotlit on "Kai", Suki on "Suki" (word timings) | First, choose your ninja. Will it be Kai, or Suki? | taps a ninja (live from the first word) | once per save |
| chose ↻ | the tap | the chosen ninja bows | Great choice! | — | once per save |
| tv_choose_why | straight after | the lost petals of the film drift across the sky | Baron Muddle took the sounds away. We'll win them back by playing games together. | — | once per save |
| tv_choose_ninja | the chosen ninja walks to its corner, bottom left | ▶ pops in | Your ninja will play every game with you. | taps ▶ | once per save |

`chose` loses "Let's rescue those sounds!", which nothing explained; `tv_choose_why` says what the games are for, and sets up "You won back two sounds" at the rewards.

### 3.3 The opt-in: "Do you go to big school yet?"

*Voice:* a friendly question, not a quiz. Each "If…" line lands slowly on its spotlit card.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_opt_why | the cards land | the teddy card and the school card; ▶ dim | First, let's find the right games for you. | (a card works from now) | once per save |
| fm_opt_q1 | straight after | both cards bob once | Do you go to big school yet? | — | once per save |
| tv_opt_notyet (replaces `fm_opt_notyet`) | straight after | the teddy spotlit | If you don't go yet, tap the teddy. | taps a card | once per save |
| tv_opt_yes (replaces `fm_opt_yes`) | straight after | the school spotlit | If you do, tap the school. | taps a card | once per save |
| tv_opt_echo_notyet (replaces `fm_opt_echo_notyet`) | a teddy tap | a gold ring fills round the teddy | Not yet. That's fine. | — | every time |
| tv_opt_echo_school (replaces `fm_opt_echo_school`) | a school tap | a gold ring fills round the school | You go to big school. | — | every time |
| tv_opt_again (replaces `fm_opt_q1_again`) | ↳ 8 s with no tap | both cards bob | If you don't go yet, tap the teddy. If you do, tap the school. | taps | every time |
| tv_opt_ask | ↳ 20 s with no tap | the gear glows | Ask a grown-up to help you choose. | — | every time |
| tv_opt_ok_notyet (replaces `fm_opt_ok_notyet`) | ▶ after the ring | the teddy shrinks into a badge and flies to the gear | Then we'll start with some listening games, just for you. | — | once per save |
| tv_opt_grownups (replaces `fm_opt_grownups`) | straight after | the gear glows and wiggles | Grown-ups, you can change this later in the settings. | — | once per save |
| tv_opt_to_dojo | the confirm hold | ▶ pulses | Now come with me to the dojo. Tap the green arrow. | taps ▶ | once per save |

**Screen B** (after the school card) keeps its lines, with calm punctuation: `fm_opt_q2` ↻ "Which class are you in? Tap your class.", the door labels ("Reception." · "Year One." · "Year Two."), `fm_opt_unsure` ↻ "Not sure? Tap the cloud.", `fm_opt_q2_again` ↻ "Tap your class, or the cloud.", the `fm_opt_ok_*` confirmations with full stops, then `tv_opt_grownups` and `tv_opt_to_dojo`. The existing 40 s default (`fm_opt_default_home`) stays.

### 3.4 The dojo welcome: three ninja tricks (Training.tsx)

*Voice:* a teacher on a class's first morning: brisk and playful on the tricks, slow and inviting on each "Can you…?". The rhyme is whispered, like a secret.

The three grey stars now mean something (one per trick), and the speaker has something real to say again. The welcome ends on a real readiness question that names the first game.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_train_hello (replaces `tut_1`) | the dojo fades in | the dojo; the ninja bottom left | Welcome to my dojo. A dojo is a school for ninjas. | — | once per save |
| tv_train_tricks | straight after | three grey stars appear at the top, one after another | I'll teach you three ninja tricks. Each one wins a star. | — | once per save |
| tv_train_gong | 8.8 s | the gong glows; the pointing hand on it | Trick one is the gong. Tap it, and your ninja will kick it. | taps the gong | once per save |
| tv_train_gong_ok | the kick lands: BONG; the first star lights | stars burst | Bong! That's your first star. | — | once per save |
| tv_train_help (replaces `fm_help_short`) | 1 s later | the ninja scratches its head; the big arrow sweeps from the ninja to Sensei | Here's trick two. If you're ever stuck, tap me, down here in the corner. | — | once per save |
| tv_train_try_help | straight after | Sensei's button pulses | Can you tap me now? | taps Help | once per save |
| fm_help_ok | Help tapped; the second star lights | Sensei waves | That's it! I'm always here to help. | — | once per save |
| tv_train_speaker (replaces `fm_speaker`) | 1 s later | the speaker pops into the nav row, glowing | Here's trick three, the speaker. First, listen to my little ninja rhyme. | — | once per save |
| tv_rhyme | straight after | the ninja tiptoes on the spot | Tip, tap, tiptoe, quiet as a mouse. | — | once per save |
| tv_train_hear_again | straight after | the pointing hand on the speaker | Tap the speaker, and I'll say it again. | taps the speaker | once per save |
| tv_rhyme | the speaker's replay | the ninja tiptoes again | Tip, tap, tiptoe, quiet as a mouse. | — | once per save |
| tv_train_speaker_ok (replaces `st_speaker_ok`) | straight after; the third star lights | the stars shine | That's it! The speaker always says it again. | — | once per save |
| tv_train_done | straight after | the ninja powers up | Three tricks, three stars. Now you're ready for your first game. | — | once per save |
| tv_first_game | straight after | ▶ pops in; the ninja faces it in its ready stance | It's a listening game, called Ninja Ears. Tap the green arrow when you're ready. | taps ▶ | once per save |
| ↳ tv_train_gong | 16 s, no gong tap (at 8 s the gong glows) | the gong glows | Trick one is the gong. Tap it, and your ninja will kick it. | taps | every time |
| ↳ tv_train_hear_again | 8 s and 20 s on the speaker step | the speaker glows | Tap the speaker, and I'll say it again. | taps | every time |

The rhyme seeds the first story ("Tip, tap, tip, tap."). This welcome supersedes the fix plan's A.1 (SF C19's "This is the sun." as the speaker's content).

### 3.5 W1, Ninja Ears: the first lesson

*Voice:* calm and cosy, a picture-book pace. The only lifts are "There it is!", "So into the pocket it goes!" and the celebrations. Pause about a second before every held or stretched word.

W1 is four small beats, each framed: **Ninja Ears** (find the picture), **the rabbit and the tortoise**, **ninja ears** (the first sound, which the child drives) and **Pocket Hunt**. The child taps ▶, the sock, ▶, the tortoise, the rabbit, the sun, the sock, the petal, ▶ and two finds: 11 actions, against 5 today. The rabbit stops being optional in W1 (§8, T9): its tap splits the talk.

**Dropped from today:** "Ninja ears on!", "Let me show you!", "Now you try!", "Tap the sun!" said during the demo, "Watch me first!" over an empty stage, "Did you notice?", "Say that sound with me!" (the petal tap replaces it) and the Next hold after the notice (`W1:7`).

#### A. Ninja Ears (`tap`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ears_frame (replaces `fm_l1_hello`) | 0 s | the sun, sock and cat drop in (220 px, one row); the lesson beads light at the top | I'll say a word. Then you find its picture. | (a tap on a card says its word) | full |
| fm_name_sock · fm_name_cat | 3.6 s | each card spotlit for its own clip | This is a sock. · This is a cat. | — | full |
| tv_ears_demo (replaces `fm_show_me`, `fm_tap_sun`) | 7.2 s | the paw sets off on "sun" and taps the sun on "There"; the ninja kicks its corner; a star stamp | I'll go first. My word is sun… There it is! | watches | full |
| tv_ready_first | 11.4 s | ▶ pops in, spotlit; the ninja faces it in its ready stance | Look, your ninja is ready. Are you ready too? Tap the green arrow. | taps ▶ (or a card) | once per save |
| tv_your_word_<w> (sock) (replaces `fm_you_try`, `fm_tap_sock`) | the ninja bows | the cards stay live; the sock glows after 2 s (the first turn is guided) | Your word is sock. Can you find the sock? | taps the sock | full |
| [sock] | a right tap | the sock goes green; the ninja's kick and a star stamp | [sock] | — | every time |
| ↳ [cat] · tv_find_again_<w> (sock) | a wrong tap | the cat wobbles (400 ms, never red) and says its word | [cat] · Can you find the sock? | taps again | every time |
| ↳ tv_idle_look_<w> (sock) | 8 s, no tap | the sock glows gently | Have a look at each picture. Where's the sock? | taps | every time |
| ↳ tv_show_offer | 12 s, no tap; the save's first full-form turn only | the paw pulses | Not sure? Tap my paw, and I'll show you again. | may tap the paw | once per save |
| ↳ tv_idle_point | 16 s, no tap | the paw points at the sock and waits | Here it is. Tap it when you're ready. | taps | every time |
| ↳ tv_fix_together | a second miss | the sock glows; the paw points | Let's do it together. It's this one. Now you tap it. | taps the sock | every time |

`tap` is met only in W1 (and Reception's W1), so it has no recap or short form on the preschool path. The model answer ([sock], the kick and the stamp) is the feedback for this one right answer: no praise line, so the next game starts inside the budget.

#### B. The rabbit and the tortoise (`fastslow`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ts_meet | 0 s, after the sock | the sock and cat slide back; the sun moves to the centre (300 px) above its sound ribbon; the rabbit pops in on "rabbit", the tortoise on "tortoise", each spotlit | Here are my friends, the rabbit and the tortoise. | — | full, recap |
| tv_ts_fast | 3.3 s | the paw taps the rabbit as the clip starts: the card hops, the ribbon zips across, the ninja dashes out and back | The rabbit says words fast… [sun] | watches | full |
| tv_ts_slow | 6.4 s | the paw taps the tortoise: the card stretches like elastic, the ribbon draws left to right, three dots pop on as each sound begins, the ninja's slow-motion kata | The tortoise says them slowly… [sun, slowly] | watches | full |
| tv_ready_paw | 12.1 s | ▶ and the paw pop in; ▶ spotlit on "green arrow", the paw on "paw" | Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. | taps ▶ (or the paw) | once per save |
| fm_tap_tortoise ↻ | after the bow | the tortoise pulses | Now you tap the tortoise, and say it slowly with me. | taps the tortoise | full, recap |
| [sun, slowly] | the tap | the stretch, the ribbon, the kata | [sun, slowly] | says "sssuuunnn" along | every time |
| tv_same_word (replaces `fm_same_word`, `fm_hear_sounds`, `fm_hear_sounds_short`) | 1 s after | the card snaps back; the three dots pulse in turn | Fast or slow, it's the same word. When I say it slowly, I can hear its sounds. | — | full |
| fm_tap_rabbit ↻ | straight after | the rabbit pulses | Now tap the rabbit, and say it fast. | taps the rabbit | full, recap |
| [sun] | the tap | the hop, the dash | [sun] | says "sun" | every time |
| ↳ tv_ts_wrong_rabbit | the rabbit tapped for the tortoise | the rabbit plays [sun]; the tortoise pulses | That's my rabbit. It says words fast. Now tap the tortoise to say it slowly. | taps the tortoise | every time |
| ↳ tv_ts_wrong_tortoise | the tortoise tapped for the rabbit | the tortoise plays [sun, slowly]; the rabbit pulses | That's my tortoise. It says words slowly. Now tap the rabbit to say it fast. | taps the rabbit | every time |

The rabbit and tortoise lines are the same for every word, so W3 needs no `fm_fast_mug` (SCRIPT_FIXES C17.1 is solved without a new recording).

#### C. Ninja ears: the first sound (`notice`, a show the child drives)

The child taps the two cards to hear how they start, so they notice the sound themselves, and the first petal is named the moment it appears (today, 2:45 later). This needs the cards to be tappable in this beat (lane C2).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_notice_frame (replaces `fm_first_listen`) | 0 s, after the rabbit | the sun and sock slide side by side (260 px), each with its three dots | Now let's listen for the very first sound. | — | once per save |
| tv_ears_on | straight after | the ninja cups its hand behind its ear (the `listen` pose) | Look, your ninja has its ninja ears on. That means listening really carefully. | — | once per save |
| tv_tap_hear_<w> (sun) | 9.5 s | the sun glows | Tap the sun, and listen to how it starts. | taps the sun | once per save |
| [sun, first] | the tap | the sun's first dot swells gold | [sun, first] | listens | once per save |
| tv_now_tap_hear_<w> (sock) | straight after | the sock glows | Now tap the sock, and listen to how it starts. | taps the sock | once per save |
| [sock, first] | the tap | the sock's first dot swells to the same gold | [sock, first] | listens | once per save |
| fm_notice_sun_sock ↻ | straight after | both gold dots pulse; the /s/ petal arrives in the middle (hero size), misty, and blooms on the sound (the introduction animation, SOUND_DISPLAY §4.6) | Sun and sock start with the same sound… /s/ | — | once per save |
| tv_petal_first | straight after | the petal breathes | That sound has its very own petal. Tap the petal, and say the sound with me. | taps the petal | once per save |
| /s/ | the tap | the petal swells, then glides to the nav row's sound slot | /s/ | says /s/ | once per save |
| ↳ (idle) | a card not tapped: 8 s it glows again, 16 s the paw points at it. The petal not tapped: 8 s it swells and says /s/, 12 s the lesson goes on | | — | — | every time |

`fm_notice_sun_sock` ↻ drops "Did you notice?". `t_everyone_say` and the `W1:7` hold retire from this beat: the petal tap is the child's voice and it ends the beat.

#### D. Pocket Hunt (`tapall`, first sound, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_pocket_frame (replaces `fm_tap_all_start`, `fm_show_me`, `fm_you_try`) | 0 s, after the petal | the sun, sausage, moon, sock and cat in two rows; three dashed pockets glow on "Pocket"; the /s/ petal in the nav slot swells on "this sound" | In Pocket Hunt, we find pictures that start with this sound. | — | full |
| tv_pocket_ido | 4.5 s | the paw sets off towards the sun | I'll find one first. | watches | full, recap |
| fs_sun | the paw taps the sun; its first dot glows | the petal swells on /s/ | Sun starts with… /s/ | — | every time |
| tv_so_pocket | straight after | a mini-sun flies into the first pocket; a shuriken pins a star on the card | So into the pocket it goes! | — | every time |
| tv_pocket_ready_<n> (two) | 12.1 s | ▶ pops in; the ninja faces it | Now you find the other two. Are you ready? | taps ▶, or a right picture (§2.3) | full |
| fm_name_sausage · fm_name_moon | after the bow | the two new cards spotlit | This is a sausage. · This is the moon. | finds the sock and the sausage | full, recap |
| [sock, first] | each find | the card's held first sound; a mini-card flies to a pocket; a shuriken | [sock, first] | — | every time |
| ↳ [moon, first] · fm_diff_moon · tv_fix_start | a wrong tap (moon) | the moon wobbles; the petal swells | [moon, first] · Moon starts with a different sound. · Listen for the start… /s/ | taps again | every time |
| ↳ tv_petal_hint | 8 s, no tap; once per save | the petal swells | Tap the petal if you want to hear the sound again. | — | once per save |
| ↳ tv_idle_point | 16 s, no tap | the paw points at a target | Here it is. Tap it when you're ready. | taps | every time |
| fm_found_both | both found | all three pockets glow; the ninja's biggest move; a spell burst | You found them both! They both start with… /s/ | — | every time |
| tv_w1_end (replaces `fm_l1_done` in W1) | straight after | every bead lit; the sticker bead bursts; the five cards rise into a fan | That's the end of Ninja Ears. Now watch what happens to your pictures. | — | every time |

`fm_found_both` is the praise and `tv_w1_end` is the wrap-up and the link, so nothing is stacked. A tap on the sock or sausage during `tv_pocket_ready_two` counts as ready and as the first find.

### 3.6 Reward 1: the Sticker Book

*Voice:* genuine delight. This is the first celebration, so the exclamation marks stay.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| fm_rw_look | the last move lands; a gong and confetti | the five cards flip into stickers | Look! Your pictures are turning into stickers! | — | once per save |
| tv_rw_book (replaces `fm_rw_book`) | the book swoops in closed and bounces; the pointing hand on its clasp | | This is your Sticker Book! Tap it to open it. | taps the book: it pops its clasp and opens | once per save |
| fm_rw1_list | the stickers fly in, one per word | each sticker lands on its word | Sun, sock, cat, sausage and moon! | — | once per save |
| tv_rw_every (replaces `fm_rw_every`) | the page glows | a big "5" badge thunks into the corner | Every picture you play with becomes a sticker. | — | once per save |
| tv_rw_tap (replaces `fm_rw_tap`) | the sun sticker wiggles; the hand points at it | | Tap a sticker, and it will say its word. | taps a sticker | once per save |
| [sun] · [sun, slowly] | the tap | the sticker pops and spins | [sun] · [sun, slowly] | — | every time |
| tv_rw_fast_slow | the first sticker tap only | the rabbit and tortoise peek in | Fast, then slow, like the rabbit and the tortoise! | — | once per save |
| tv_rw_next (replaces `fm_rw_next`) | the book tucks into the ninja's pack | ▶ bounces in the play area | Next, we're going to read some pictures, the ninja way. Tap the green arrow when you're ready. | taps ▶ | once per save |

With no sticker tap after 8 s, the hand wiggles again and `tv_rw_tap` is said once more. Nothing moves on by itself.

### 3.7 W2, Ninja Reading: the second lesson

> *Superseded by §10 (27 Sep): picture reading v2 and the read slider replace the fish-dog, the swap and the which-rows game. **Until the follow-up workflow wires §10 in (docs/QUEUE.md 0b), the game still plays this section.***

*Voice:* bouncier than W1: mash-ups and magic tricks, and a giggle in "Fish dog!".

#### A. Ninja Reading (`rail`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_rail_frame (replaces `fm_l2_way` as the opener) | 0 s | the bamboo rail slides in; its brush arrow glows at the left end; on "this way" the ninja runs the rail left to right with a speed trail | Let's play Ninja Reading. Ninjas always start on this side, and go this way. | — | full |
| tv_rail_ido | 5.5 s | the fish and the dog land on the rail | I'll read them first. Then you read them. | — | full, recap |
| fm_read_fish_dog | 8.8 s | a light passes under each card on its word; they bump and merge into a fish-dog | Fish… dog. Fish dog! | — | full, recap |
| tv_rail_ready | 10.7 s | the fish-dog splits back; ▶ and the paw pop in | Now you read them. Do you want to have a go? | taps ▶, or the fish | full |
| tv_rail_turn (replaces `fm_l2_turn`) | after the bow | the fish pulses | Tap each picture, starting on this side. | taps the fish, then the dog | full, recap |
| [fish] · [dog] | each tap | a hop under the tapped card | [fish] · [dog] | — | every time |
| fm_pair_fish_dog · tv_silly | both tapped in order | the merge; the ninja laughs | Fish dog! · What a silly animal! | — | full |
| ↳ tv_rail_start (replaces `fm_l2_start`) | the dog tapped first | the dog wiggles; the arrow pulses at the left; the fish glows | Ninjas start on this side. Tap this one first. | taps the fish | every time |

The demo's second "Fish dog!" goes (SCRIPT_FIXES C17.4).

#### B. The swap (a show, ◇)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| fm_l2_swap | the beat starts, when the lesson isn't behind | the ninja leapfrogs the cards; they swap and merge into a dog-fish | Whoops! Now they're the other way round. Dog… fish. Dog fish! | — | full |
| tv_next_game | the held step after the show | ▶ pulses | When you're ready for the next game, tap the green arrow. | taps ▶ | every time |

#### C. Two rows (`which`, full: the demo is never dropped at a first meeting)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_which_frame | 0 s | two short rows slide in: fish–dog on top, dog–fish below; each row glows in turn | Here are two rows of pictures. I'll read one, and you tap it. | — | full |
| tv_which_demo | 4.8 s | a light passes under the fish, then the dog, on the top row | I'll go first. Fish… dog. | watches | full, recap |
| tv_which_so | 7.6 s | the paw taps the top row; it glows; a crown of stars | Fish came first. So I tap this row. | — | full, recap |
| tv_ready_go | 10.7 s | new rows drop in: cat–dog and dog–cat; ▶ | Do you want to have a go now? | taps ▶ | full |
| tv_which_q_<pair> (cat_dog) (replaces `fm_which_cat_dog`) | after the bow | both rows glow | Here I go. Cat… dog. Which row did I read? | taps a row | every time |
| fm_pair_cat_dog | a right tap | the row's light sweeps left to right; the crown of stars | Cat dog! | — | every time |
| ↳ tv_which_fix_<pair> (cat_dog) | a wrong tap | the row wobbles gently | Let's listen again. Cat… dog. Which row has the cat first? | taps | every time |

#### D. Word Squish (`compound`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_squish_frame (replaces `fm_l2_big_word` as the opener) | 0 s | the sun and a flower land on the rail; the tortoise and the rabbit under its right end | Here's a new game, called Word Squish. | — | full |
| tv_squish_slow (replaces `fm_sunflower`, `fm_sunflower_q`, `fm_sunflower_fast`) | 2.9 s | the paw taps the tortoise; each card lights in turn | I tap the tortoise, and say them slowly. Sun… flower. | watches | full, recap |
| tv_squish_fast | 6.9 s | the paw taps the rabbit; the cards zip together and bloom into a sunflower | Then I tap the rabbit, and squish them. Sunflower! | watches | full, recap |
| tv_squish_ready | 11.7 s | the star and fish land on the rail; ▶ | Two little words make one big word. Now you make one. Are you ready? | taps ▶ | full |
| fm_name_star | after the bow | the star spotlit | This is a star. | — | every time |
| fm_starfish_q ↻ | straight after; the rabbit pulses after a 1.5 s pause | | Star… fish. Tap the rabbit, and say them fast. | taps the rabbit | every time |
| fm_starfish | the tap | the ninja throws its golden star onto the fish: a waving starfish | Starfish! | — | every time |
| tv_praise_squish | the first squish only | the ninja's move | You squished them into one big word! | — | once per save |

#### E. One more Pocket Hunt (◇, the none form) and the close

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_pocket_more_<p> (s) (replaces `fm_quick_tap_all`) | ◇, when the lesson isn't behind | a 2×2 grid: sunflower, sock, fish and dog; two pockets; the /s/ petal swells | One more Pocket Hunt. Find the pictures that start with… /s/ | finds two | short, none |
| fm_found_both | both found | the pockets glow | You found them both! They both start with… /s/ | — | every time |
| fm_l2_done | the close | every bead lit | You read the pictures, just like a real reader! | — | every time |
| tv_rw_link_book | straight after | the cards rise | Let's put your new pictures in your Sticker Book. | — | every time |

### 3.8 Reward 2, the World Flower's first glimpse, and the first map

> *Superseded by §10 (27 Sep): picture reading v2 and the read slider replace the fish-dog, the swap and the which-rows game. **Until the follow-up workflow wires §10 in (docs/QUEUE.md 0b), the game still plays this section.***

*Voice:* celebration, then wonder (hushed on "shining through the mist"), then the practical calm of a map.

Three held steps, each ending on ▶. The petal step gets a turn, so the child isn't only watching for 38 s. For a warm-up child's first session, steps 1 and 2 may merge into one held step (mechanics §5.4).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| fm_rw2_list | step 1: a gong; the book pops open; six stickers fly in on their words | the counter flips from 5 to 11 | Fish, dog, flower, sunflower, star and starfish! | — | once per save |
| fm_rw_shiny | a drumroll | a shiny fish-dog sticker lands with a rainbow sweep | Ooh, a shiny sticker! Fish dog! | — | once per save |
| fm_rw2_s | the /s/ stickers hop in turn, each first dot gold | the /s/ petal swells on the sound | Sun, sock, sausage and sunflower. They all start with… /s/ | taps ▶ | once per save |
| fm_rw2_petal | step 2: the book flies to the map; a real World Flower (420 px), every petal in mist; the /s/ petal blooms into colour | the ninja powers up, facing the flower | You found your very first sound! Look, its petal is shining through the mist. | — | once per save |
| tv_rw2_flower (replaces `audit_petal_means`) | straight after | the flower's heart glows | This is the World Flower. Your sounds make it shine. | — | once per save |
| tv_rw2_tap_petal | straight after | the /s/ petal breathes | Tap your petal, and hear its sound. | taps the petal | once per save |
| /s/ | the tap | the petal swells | /s/ | says /s/, then taps ▶ | once per save |
| tv_map_intro | step 3: the flower flies into the map's flower button; the map fades in; the stones glow in a wave | the ninja stands on stone 2 | This is the map of Bamboo Village. Every stone is a game. | — | once per save |
| fm_rw2_map | the Sticker Book button bounces | | Your Sticker Book lives here, on the map! | — | once per save |
| tv_map_flower | the World Flower button glows | | And your World Flower lives here. | — | once per save |
| tv_map_hint (replaces `map_hint`) | the ninja hops to stone 3; it bounces, with the pointing hand | | The glowing stone is your next game. Tap it when you're ready. | taps the stone | first two map arrivals per save; then as the map's 8 s idle nudge |

From now on the map follows SCRIPT_FIXES C6 (§5.8): the land's welcome once a session, `tv_map_hint` on the save's first two arrivals, and a one-line preview before a stone whose game the child has never played.

### 3.9 W3, Ninja Ears again: Slow Words, and sounds in the middle

**Forms.** W3 usually opens the child's second session, so the rabbit and the tortoise are a **recap** (no Ready hold), and Slow Words and the middle-sound Pocket Hunt are first meetings. In the same session as W1 the rabbit and the tortoise are the short form, with the same lines. The rabbit is compulsory here too: its tap splits the talk before Slow Words.

*Voice:* as W1. A little conspiratorial hush on "hiding in the middle".

#### A. The rabbit and the tortoise (`fastslow`, recap)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ts_again (replaces `fm_l1_hello` in W3) | 0 s | the mug drops in above its ribbon; the rabbit and the tortoise pop in either side | Here come the rabbit and the tortoise again. | — | recap, short |
| fm_name_mug | 2.9 s | the mug spotlit | This is a mug. | — | every time |
| tv_ts_slow_one | 4.8 s | the paw taps the tortoise: the stretch, the ribbon, the dots, the kata | The tortoise says it slowly… [mug, slowly] | watches | recap, short |
| fm_tap_tortoise ↻ | 9.3 s | the tortoise pulses | Now you tap the tortoise, and say it slowly with me. | taps; says it | every time |
| tv_praise_slowly | 1 s after the tap | the kata | You said it slowly, just like the tortoise. | — | once per save |
| fm_tap_rabbit ↻ | straight after | the rabbit pulses | Now tap the rabbit, and say it fast. | taps the rabbit | every time |
| [mug] | the tap | the hop, the dash | [mug] | says "mug" | every time |

The insight ("When I say it slowly, I can hear its sounds.") is not said again: it was said in W1 (the three-year-old judge's §5.5).

#### B. Slow Words (`slowpick`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_slow_frame | 0 s, after the rabbit | the rabbit and tortoise tuck away (the tortoise waves from the corner); the van and bag drop in beside the mug | Let's play Slow Words. I say a word slowly. You find its picture. | — | full |
| tv_slow_demo | 4.8 s | the ninja goes into bullet time; the paw glides towards the mug under the stretch | Here's my slow word… [mug, slowly] | watches | full, recap |
| tv_i_hear_<w> (mug) | 8.4 s | the paw taps the mug; a bullet-time gift, snapping to full speed | I can hear mug! | — | full, recap |
| tv_ready_go | 12.2 s | ▶ pops in | Do you want to have a go now? | taps ▶ | full |
| fm_name_van · fm_name_bag | after the bow | each spotlit | This is a van. · This is a bag. | — | every time |
| tv_slow_yours (replaces `fm_slow_listen`, `fm_slow_another`) | straight after | the cards glow faintly | Here's your slow word… [van, slowly] | — | every time |
| fm_which_pic | straight after; dropped after two first tries in a row (SF A6) | | Which picture is it? | taps the van | every time |
| [van, slowly] · [van] | a right tap | the bullet-time gift | [van, slowly] · [van] | — | every time |
| ↳ [bag] · tv_slow_again | a wrong tap | the bag wobbles and says its word | [bag] · Let's listen again… [van, slowly] | taps again | every time |

#### C. Pocket Hunt: the sound in the middle (`tapall`, in the middle: the full form of a new variant)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_pocket_middle (replaces `fm_tap_all_in`) | 0 s | the cat, bag, jam, van, sun and dog in two rows; four pockets glow | It's Pocket Hunt again. This time, the sound is hiding in the middle of the words. | — | full |
| tv_here_sound | 6.3 s | the /a/ petal arrives in the middle, misty, and blooms on the sound | Here's the sound… /a/ | — | every time |
| tv_new_petal_say | straight after | the petal breathes | It's a new sound. Tap its petal, and say it with me. | taps the petal; says /a/ | a new sound's first petal in a game |
| /a/ | the tap | the petal swells, then glides to the nav slot | /a/ | — | every time |
| tv_pocket_ido | straight after | the paw sets off to the cat | I'll find one first. | watches | full, recap |
| [cat, slowly] | the paw on the cat | three dots under the cat; the middle one glows while /a/ is held | [cat, slowly] | — | full, recap |
| tv_hear_middle | straight after | | I can hear it in the middle. | — | full, recap |
| tv_so_pocket | the paw taps the cat | a mini-cat flies into the first pocket | So into the pocket it goes! | — | every time |
| tv_pocket_ready_<n> (three) | 10.2 s after the petal tap | ▶ pops in | Now you find the other three. Are you ready? | taps ▶, or a right picture | full |
| fm_name_jam | after the bow | the jam spotlit (the others are known) | This is some jam. | finds the bag, jam and van | every time |
| [bag, slowly] | each find | a mini-card flies to a pocket | [bag, slowly] | — | every time |
| ↳ [dog, slowly] · fm_not_in_dog · tv_fix_middle | a wrong tap | the dog wobbles; the petal swells | [dog, slowly] · Dog doesn't have that sound in it. · Listen for the middle… /a/ | taps again | every time |
| fm_found_all · t_they_all_have | all found | the pockets glow | You found them all! · They all have the sound… /a/ | — | every time |

#### D. One more Pocket Hunt (first sound, short) and the close

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_pocket_more_<p> (m) | 0 s | the mug, moon, map, sun and cat; three pockets; the /m/ petal arrives misty and blooms (a new sound) | One more Pocket Hunt. Find the pictures that start with… /m/ | — | short |
| tv_new_petal_say | straight after | the petal breathes | It's a new sound. Tap its petal, and say it with me. | taps; says /m/ | a new sound's first petal in a game |
| fm_name_map | straight after | the map spotlit | This is a map. | finds three | every time |
| fm_found_all · fm_all_start | all found | the pockets glow | You found them all! · They all start with… /m/ | — | every time |
| tv_w3_done (replaces `fm_l1_done` in W3) | the close | every bead lit | You heard sounds at the start of words, and in the middle. Super listening! | — | every time |

### 3.10 W4, Ninja Reading again: three in a row

> *Superseded by §10 (27 Sep): picture reading v2 and the read slider replace the fish-dog, the swap and the which-rows game. **Until the follow-up workflow wires §10 in (docs/QUEUE.md 0b), the game still plays this section.***

**Forms.** In a later session (the usual case for a 3-year-old) each game is a **recap**: its one line, the canonical demo on its own pictures, and a spoken hand-over, with no Ready hold. In the same session as W2 each game is **short**: the one line, then the turn, with the paw offering the demo.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_rail_again | 0 s | the rail slides in; the ninja runs it; the cat, dog and fish land on it | It's Ninja Reading again. This time, there are three pictures. | — | recap, short |
| tv_rail_ido · fm_read_cat_dog_fish | 4.4 s | a light passes under each card on its word | I'll read them first. Then you read them. · Cat… dog… fish. Cat-dog-fish! | — | recap |
| tv_rail_yours · tv_rail_turn | after the reading (recap), or straight after `tv_rail_again` (short) | the cat pulses | Now you read them. · Tap each picture, starting on this side. | taps the three in order | recap, short |
| fm_triple_cat_dog_fish | all three in order | a hop under each card | Cat dog fish! | — | every time |
| fm_l4_swap | the swap show | the ninja leapfrogs; the cards swap | Now they're the other way round. Fish… dog… cat. Fish dog cat! | — | every time |
| tv_next_game | the held step after the show | ▶ pulses | When you're ready for the next game, tap the green arrow. | taps ▶ | every time |
| tv_which_again | two rows drop in: fish–dog–cat and cat–dog–fish | | Here are two rows again. I'll read one, and you tap it. | — | recap, short |
| tv_which_demo · tv_which_so | the recap form only | the canonical fish–dog rows (W2's own), the paw | I'll go first. Fish… dog. · Fish came first. So I tap this row. | watches | recap |
| tv_which_q_<three> (fish_dog_cat) (replaces `fm_which_three`) | the turn | both rows glow | Here I go. Fish… dog… cat. Which row did I read? | taps a row | every time |
| fm_triple_fish_dog_cat | a right tap | the light sweeps; the crown of stars | Fish dog cat! | — | every time |
| ↳ tv_which_fix_<three> (fish_dog_cat) | a wrong tap | the row wobbles | Let's listen again. Fish… dog… cat. Which row has the fish first? | taps | every time |
| tv_squish_again | the rain and the bow land on the rail | the tortoise and rabbit under it | It's Word Squish again. Two little words make one big word. | — | recap, short |
| tv_squish_slow · tv_squish_fast | the recap form only | the canonical sunflower demo on its own cards | I tap the tortoise, and say them slowly. Sun… flower. · Then I tap the rabbit, and squish them. Sunflower! | watches | recap |
| fm_name_rain · fm_name_bow · fm_rainbow_q ↻ | straight after | each spotlit; the rabbit pulses | This is rain. · This is a bow. · Rain… bow. Tap the rabbit, and say them fast. | taps the rabbit | every time |
| fm_rainbow | the tap | the bloom | Rainbow! | — | every time |
| fm_name_snow · fm_name_man · fm_snowman_q ↻ · fm_snowman | the second word | as above | This is snow. · This is a man. · Snow… man. Tap the rabbit, and say them fast. · Snowman! | taps the rabbit | every time |
| tv_w4_done | the close | every bead lit | You read three pictures in a row, the ninja way. | — | every time |
| tv_practise_again (replaces `fm_practise_again`) | the repeated lesson opens (`needsRepeat`), on screen, never over the map | the cards arrive | That game was a bit tricky. Let's play it once more. | — | the repeat |

The repeat is the "struggled" case (§2.2), so its games play their **recap** forms **with** the Ready hold.

### 3.11 W5, Guess My Word (`sounds`, full)

On the map: `tv_map_next_<game>` (sounds) "Next is a new game, called Guess My Word. Tap the glowing stone to play." (§5.8). So the level's own frame can start with who does what.

*Voice:* playful mystery. A tiny pause after "My sounds are…", and each sound crisp and pure. The sounds are the question, so **no petals** play with them: neutral dots light one per sound (Dec1).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_guess_frame (replaces `fm_l1_hello` in W5, `audit_made_of_sounds`, `fm_sounds_intro`) | 0 s | the sun and a dog drop in; three grey dots under the stage | I'll say the sounds, and you listen for the word. | — | full |
| tv_my_sounds | 4.0 s | the paw lifts; a dot lights on each sound | My sounds are… /s/ /u/ /n/ | watches | full, recap |
| tv_guess_so_<w> (sun) | 8.3 s | the paw taps the sun; it bounces; the dots bloom into small petals under it | I can hear sun. So I tap the sun. | — | full, recap |
| tv_ready_go | 11.9 s | the map, mop and man drop in; ▶ | Do you want to have a go now? | taps ▶ | full |
| fm_name_map · fm_name_mop · fm_name_man | after the bow | each spotlit | This is a map. · This is a mop. · This is a man. | — | every time |
| tv_guess_q (replaces the W5 use of `listen`) | 1 s later | the dots light one per sound | Listen for the word… /m/ /a/ /p/ | (a picture works from the first sound) | every time |
| fm_which_pic | straight after; dropped after two first tries in a row | | Which picture is it? | taps the map | every time |
| [map] | a right tap | the dots bloom into small petals under the map | [map] | — | every time |
| tv_guess_together | the first right answer only | the dots light again, one per sound | Let's say it together. /m/ /a/ /p/ [map] | says the sounds, then the word | full |
| ↳ [mop] · tv_guess_again | a wrong tap | the mop wobbles and says its word; the dots light again | [mop] · Let's listen again… /m/ /a/ /p/ | taps again | every time |
| (items 2–6) | new pictures named as they land; then `tv_guess_q` + the sounds | | This is a cap. · … · Listen for the word… /k/ /a/ /t/ | taps | every time |
| fm_last_one ↻ | before the last item | | Here's the last one. | — | every time |
| tv_w5_done (replaces `fm_l5_done`) · t_if_you_say_sounds ↻ | the close | every bead lit; the ninja nods | You listened to the sounds, and you heard the words. · If you say the sounds, you can hear the word. | — | every time |

`t_if_you_say_sounds` is Sounds~Write's explicit reminder, which no run has ever said.

### 3.12 W6, Sound Dots (`dots`, full)

> *Superseded by §10 (27 Sep): picture reading v2 and the read slider replace the fish-dog, the swap and the which-rows game. **Until the follow-up workflow wires §10 in (docs/QUEUE.md 0b), the game still plays this section.***

On the map: `tv_map_next_<game>` (dots) "Next is a new game, called Sound Dots. Tap the glowing stone to play."

*Voice:* crisp and rhythmic. The dots are tapped like a drum; the word at the end is a small "ta-da".

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_dots_frame (replaces `fm_dots_intro`) | 0 s | the sun card; under it a ribbon with three grey dots and a small arrow at its left end; the dots glow in turn | Every dot is one sound in the word. | — | full |
| tv_dots_ido | 3.3 s | the paw at the first dot; the arrow glows | I start here, and go this way. | watches | full, recap |
| /s/ /u/ /n/ | 6.3 s | the paw taps each dot; each lights and turns into a mini petal of its sound | /s/ /u/ /n/ | — | full, recap |
| tv_dots_word_ido | 8.4 s | the paw sweeps along the ribbon | Then I say the word… [sun] | — | full, recap |
| tv_dots_ready (replaces `fm_dots_turn`) | 12.2 s | the cat drops in with three grey dots; ▶ | Now you tap the dots, and say the sounds with me. Are you ready? | taps ▶ | full |
| fm_name_cat | after the bow | the cat spotlit; the first dot pulses | This is a cat. | taps the three dots | every time |
| /k/ /a/ /t/ | each dot | the dot lights and turns into its mini petal | /k/ /a/ /t/ | says them | every time |
| tv_now_say_word (replaces `fm_dots_say`) | the third dot; 1.5 s of quiet, then the sweep | | Now say the whole word… [cat] | says "cat" | the first two words |
| t_if_you_say_sounds ↻ | the first word only | the three mini petals glow together | If you say the sounds, you can hear the word. | — | once per save |
| ↳ tv_rail_start | a dot tapped out of order | the first dot pulses; the arrow glows | Ninjas start on this side. Tap this one first. | taps | every time |
| fm_name_dog · fm_name_mug | words 2 and 3, with no stems | as above | This is a dog. · This is a mug. | taps the dots | every time |
| fm_l6_done | the close | every bead lit | Now you're ready to find out how we write the sounds! | — | every time |

### 3.13 w1-2, First Sounds, and the first letters

On the map: `tv_map_next_<game>` (firstsound) "Next is a new game, called First Sounds. Tap the glowing stone to play."

*Voice:* a teacher sitting beside the child at a little table. "Hmm, let me listen" is real thinking, with a beat before the held word. "Now watch my ninja write it" has a spark of magic.

This is the child's first meeting with First Sounds, with letters and with Ninja Eyes. The demo is split by a join-in (the petal tap). The first letter is written on the child's own first right answer (the "we do"), under a picture they found, not in Sensei's demo.

#### A. First Sounds (`firstsound`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_first_frame (replaces `first_intro`, `ido`) | 0 s, the level on screen | the dojo room; the ninja bottom left | In First Sounds, I say a sound, and you find the picture that starts with it. | — | full |
| tv_first_sound | 5.9 s | the /m/ petal arrives in the middle, misty, and blooms on the sound | Our first sound is… /m/ | — | every time |
| tv_petal_say | 8.3 s | the petal breathes | Tap the petal, and say it with me. | taps the petal; says /m/ | a new sound |
| /m/ | the tap | the petal swells, then glides to the nav row's sound slot | /m/ | — | every time |
| tv_ido_pair_<pair> (map_hat) | straight after | the map and the hat drop in, each spotlit on its word (word timings) | I'll go first. Here's a map and a hat. | watches | a new sound's I do |
| tv_let_me_listen | straight after | the ninja cups its ear | Hmm, let me listen. | — | a new sound's I do |
| [map, first] | straight after | the map spotlit | [map, first] | — | a new sound's I do |
| fs_map | straight after | the petal swells on the sound | Map starts with… /m/ | — | every time |
| tv_so_i_tap | straight after | the paw taps the map; it goes green; the ninja's kick | So I'll tap it. | — | a new sound's I do |
| tv_ready_together | 11.9 s after the petal tap | the map and hat slide away; ▶ pops in; the ninja faces it | Let's do the next one together. Are you ready? | taps ▶ | full |
| fm_name_cup · fm_name_mop | after the bow | a cup and a mop drop in, each spotlit | This is a cup. · This is a mop. | — | every time |
| first_q | straight after; the mop glows after 2 s (the "we do") | the petal swells | Which one starts with… /m/ | taps the mop | every time |
| fs_mop | the right tap | the mop goes green | Mop starts with… /m/ | — | every time |
| tv_watch_write | straight after | the ninja casts; a line appears under the mop and < m > is written on it | Now watch my ninja write it. | watches | a new spelling, once a level |
| tv_how_we_write (replaces `audit_hear_see`, `how_we_spell` on this path) | the letter lands | < m > glows, with the petal beside it | This is how we write… /m/ | — | a new spelling, once a level |
| tv_tap_it_say | straight after | < m > pulses | Now you tap it, and say the sound. | taps < m >; says /m/ | a new spelling, once a level |
| tv_by_yourself (replaces `youdo`) | the third item (the "you do") | a mug and a zip drop in | Now you do one all by yourself. | — | every time |
| fm_name_mug · fm_name_zip | straight after | each spotlit | This is a mug. · This is a zip. | — | every time |
| st_first_q2 | straight after; no glow | the petal swells | Which picture starts with… /m/ | taps the mug | every time |
| fs_mug | the right tap | < m > is written under the mug, silently (SF C9) | Mug starts with… /m/ | — | every time |
| tv_praise_start | only if praise is due (§5.3) | the ninja's move | You listened right to the very start. | — | every time |

**The second sound, /s/.** A new spelling, so its I do plays, but with no Ready hold (§2.2). Then a we do and a you do:

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_next_sound_known | after the mug | the /m/ cards slide away; the /s/ petal pops in (known: no mist) | Our next sound is one you know… /s/ | may tap the petal | every time |
| tv_ido_pair_<pair> (bed_sock) · tv_let_me_listen · [sock, first] · fs_sock · tv_so_i_tap | straight after | as the /m/ demo | I'll go first. Here's a bed and a sock. · Hmm, let me listen. · [sock, first] · Sock starts with… /s/ · So I'll tap it. | watches | a new spelling's I do |
| tv_together (replaces `wedo`) · fm_name_sand · fm_name_van · first_q | the we do; the sand glows after 2 s | | Let's do this one together. · This is some sand. · This is a van. · Which one starts with… /s/ | taps the sand | every time |
| fs_sand · tv_and_how_we_write · tv_tap_it_say | the right tap | the ninja writes < s > under the sand | Sand starts with… /s/ · And this is how we write… /s/ · Now you tap it, and say the sound. | taps < s >; says /s/ | a new spelling, once a level |
| tv_by_yourself · fm_name_cat · fm_name_sun · st_first_q3 · fs_sun | the you do | < s > appears silently | Now you do one all by yourself. · This is a cat. · This is the sun. · Find the one that starts with… /s/ · Sun starts with… /s/ | taps the sun | every time |
| tv_mix_up | before the four mixed items | the two petals sit side by side in the nav row | Now it could be either sound. Listen carefully to my sound. | — | every time |
| (four mixed items) | the stems rotate (SF A5) | the item's petal swells | This is a mat. · This is some sand. · Which one starts with… /m/ | taps | every time |

#### B. Ninja Eyes (`find`, full; the first item is a we do)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ne_frame (replaces `find_q`) | the pictures slide away; the letter tiles m and s drop in | | Next, a game called Ninja Eyes. I say a sound, and you find how we write it. | — | full |
| tv_which_write | 5.9 s; the answer glows after 2 s | the /m/ petal swells | Which of these is the way we write… /m/ | taps m | every time |
| /m/ | the right tap | the tile lights; the ninja strikes | /m/ | — | every time |
| tv_find_write · tv_now_find | the next items, rotating with `tv_which_write`; no glow | the item's petal swells | Find how we write… /s/ · Now find how we write… /m/ | taps | every time |
| ↳ tv_thats_write · we_need | a wrong tile | the tapped tile's petal pops above it, then the target's swells | That's how we write… /s/ · We need… /m/ | taps | every time |
| tv_first_done | the close | the tiles glow side by side | You listened for the first sound in every word, and you found how we write it. | — | every time |

`zip` (w1-2) and `top` (w1-3) are on FIRST_MINUTES' list of words a 3-year-old doesn't know: flagged for C1's decks.

### 3.14 The reward, and the World Flower's first visit (after w1-2)

*Voice:* the reward bright; the flower hushed and wondering.

SCRIPT_FIXES C8's three facts, about the child's own petals, with a turn: the child taps their first petal.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_to_reward | after the closing line; the save's first three rewards that bring a new sound | the screen softens; a chime | Let's see what you won back from Baron Muddle. | — | first three per save |
| tv_won_<n> (two) (replaces `petals_got`) | the reward panel opens | the /m/ petal rises and swells on /m/, then the /s/ petal on /s/ | You won back two sounds… /m/ /s/ | — | every time |
| fm_rw_more | straight after | the stickers fly into the book | More stickers for your Sticker Book! | taps ▶ | the session's first two rewards |
| tv_to_flower_first | the first World Flower trip of the save | ▶ | Now let's go and see where your sounds live. Tap the green arrow. | taps ▶ | once per save |
| flower_i1 ↻ | the World Flower, dark, its petals in mist | the ninja gazes up | This is the World Flower. Baron Muddle blew all its petals away. | taps ▶ | once per save |
| tv_flower_petal (replaces `flower_i2`) | the child's first petal (/s/) glows in the flower | | Every petal is one sound. This is the petal for… /s/ | — | once per save |
| tv_flower_tap | straight after | the petal breathes | Tap it, and hear its sound. | taps the petal | once per save |
| /s/ | the tap | the petal swells | /s/ | taps ▶ | once per save |
| wf_i3 | the petal opens to show its gem sockets | | Inside each petal are shiny gems. Each gem is a way to spell the sound. | taps ▶ | once per save |
| st_found_new_sounds | the /m/ petal blooms out of the mist | | You found some new sounds! Look, here are their petals, shining through the mist. | taps ▶ | every trip with two or more |
| tv_here_sound · tg_<g>_<p>_way (m_m) | the /m/ petal swells; its < m > gem sparkles | | Here's the sound… /m/ · This is the way we spell it in mat. | taps ▶ | every trip |
| tv_another_sound · tg_<g>_<p>_way (s_s) | the /s/ petal swells; its < s > gem sparkles | | And here's another new sound… /s/ · This is the way we spell it in sit. | taps ▶ | every trip |
| tv_flower_bye | the flower flies into the map's flower button | | Your World Flower is waiting for more sounds. Let's go and find them! | taps ▶ | once per save |

- **The Sounds~Write formula stays word for word, with the sound ending its sentence.** "This is the way we spell /m/ in mat." becomes "Here's the sound…" /m/ · "This is the way we spell it in mat." That needs a new generated family, `tg_<g>_<p>_way`, beside today's `tg_<g>_<p>_in`, whose "…in mat." tail clips retire (SF C1 and C3 follow).
- **On the preschool path's trips, before land 2, `tg_<g>_<p>_see` ("We see this spelling in man and map.") is left out:** these children can't read yet (the three-year-old judge's §3.18).
- **Retired from the first visit:** `flower_i2` (a bare "Listen!" and a hard-coded /a/), and `flower_i4` and `flower_i6`, which are said when they happen. `flower_i5` moves to the first gem that is ready (§5.7).

### 3.15 w1-3, First Sounds again (/a/, /t/)

**Forms.** Short in the same session as w1-2, recap in a later one. Each new sound's I do still plays (it teaches a new spelling), with no Ready hold.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_first_again_new (replaces `first_intro` in w1-3) | 0 s | the dojo room | It's First Sounds again, with two new sounds. | — | short |
| tv_first_recap | 0 s, in place of the line above | | It's First Sounds again. I say a sound, and you find the picture that starts with it. | — | recap |
| tv_first_sound · tv_petal_say | straight after | the /a/ petal arrives misty and blooms | Our first sound is… /a/ · Tap the petal, and say it with me. | taps; says /a/ | every time |
| tv_ido_pair_<pair> (cat_ant) · tv_let_me_listen · [ant, first] · fs_ant · tv_so_i_tap | straight after | the cat and the ant; the paw taps the ant | I'll go first. Here's a cat and an ant. · Hmm, let me listen. · [ant, first] · Ant starts with… /a/ · So I'll tap it. | watches | a new sound's I do |
| tv_together · … | the we do and the you do | | (as w1-2) | taps | every time |
| tv_next_sound | the second new sound | the /t/ petal arrives misty and blooms | Our next sound is… /t/ | — | every time |
| tv_petal_say · tv_ido_pair_<pair> (jam_tent) · tv_let_me_listen · [tent] · fs_tent · tv_so_i_tap | straight after (/t/ can't be held, so the plain word plays) | the jam and the tent | Tap the petal, and say it with me. · I'll go first. Here's some jam and a tent. · Hmm, let me listen. · [tent] · Tent starts with… /t/ · So I'll tap it. | taps the petal; then watches | a new sound's I do |
| (the rest) | the we do, the you do, the mixed items, then Ninja Eyes | | (as w1-2) | taps | every time |
| tv_ne_again | Ninja Eyes, short | the letter tiles drop in | Now let's play Ninja Eyes. | taps | short |
| tv_first_done | the close | | You listened for the first sound in every word, and you found how we write it. | — | every time |

**Flag for C1 (SOUND_DISPLAY A12):** w1-3's apple card goes. The /a/ petal's picture is an apple, so the child would match two pictures instead of listening; the I do uses the ant.

### 3.16 w1-4, Word Building, then Kai and Suki

On the map: `tv_map_next_<game>` (build) "Next is a new game, called Word Building. Tap the glowing stone to play."

*Voice:* practical and clear, like building with blocks together. "Each line is for one sound" goes slowly, pointing. Kai and Suki arrive like two friends at the door.

#### A. Word Building (`build`, full)

The word card and the lines are explained. The demo has two join-ins, so no run passes about 12 s: the child taps the card to hear the word, and "I start, you finish" (Sensei finds the first sound, the child finds the last). It ends on the Sounds~Write read-back, said together.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_build_frame (replaces `audit_dojo_first`, `two_sounds`) | 0 s, the level on screen | the dojo; two dashed lines; the tiles a and m, dim; the word card (a yellow speaker) | This game is called Word Building. I say a word, and we build it with its sounds. | — | full |
| tv_build_lines | 5.5 s | the two lines glow in turn | Each line is for one sound. | — | full |
| tv_word_card (replaces `build_ido_1`) | 8.8 s | the word card pulses; the pointing hand on it | This card is my word. Tap it, and hear the word. | taps the card (live from its first word) | full |
| [am] | the tap | the card speaks | [am] | — | every time |
| tv_i_say_slowly (replaces `build_ido_2`) | straight after | the ninja cups its ear; the card stretches | I say it slowly… [am, slowly] | watches | full, recap |
| st_hear_two | straight after | the two lines pulse | I can hear two sounds. | — | full, recap |
| [am, slowly] · tv_first_is (replaces `build_ido_3`) | straight after | the first line lit; the paw points at < a > on /a/; the ninja launches it onto the line | [am, slowly] · The first sound is… /a/ | — | full, recap |
| tv_you_find_last | 11.8 s after the card tap; < m > glows after 2 s | the last line glows | Can you find the last one? | taps < m > | full |
| /m/ | the tap | < m > flies onto line 2 | /m/ | says it | every time |
| tv_lets_say_read | straight after | the arrow under the lines glows; the tiles light in turn; the sweep | Now let's say the sounds… and read the word. /a/ /m/ [am] | says them, then the word | full, recap |
| tv_build_ready | straight after | the tiles fly back; ▶ | Now let's build one together. Are you ready? | taps ▶ | full |
| tv_our_word | after the bow (the we do) | the lines are empty; the tiles a and t | Here's our word… [at] | — | every time |
| first_sound_q | straight after; the answer glows after 2 s | the first line glows | What's the first sound? | taps < a > | every time |
| tv_last_first (replaces `audit_last_place` on first use) | the right tap; the first time per save | the last line glows | Now the last sound. Listen right to the end… [at, slowly] | taps < t > | once per save |
| say_sounds_read ↻ | the word is built | the tiles light in turn; the sweep | Say the sounds, and read the word. /a/ /t/ [at] | says them | every time |
| tv_by_yourself_build · tv_your_word | the you do | the lines empty; the tiles a and m | Now you build one all by yourself. · Your word is… [am] | — | every time |
| first_sound_q · last_sound_q | as the child builds; no glows | the line lights | What's the first sound? · What's the last sound? | taps | every time |
| tv_praise_built | the first word built alone, if praise is due | the ninja's move | You built that whole word by yourself! | — | once a level |

**The gem's first fill** (`audit_gem_first`) no longer interrupts the we do as a held step. It is said at this level's reward (§5.7).

#### B. Kai and Suki: who read it right? (`readcheck`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_readers_meet (replaces `read_intro`) | 0 s | the reading card slides in: "am" with sound buttons; Kai and Suki slide in from the sides and wave | Look, it's Kai and Suki. They're learning to read, like you. | — | full |
| tv_rc_how | 4.4 s | both readers look at the word | They'll both read this word. Only one of them reads it right. | — | full, recap |
| tv_you_read_first | 8.9 s | the sound buttons glow | First, you read it. Tap each sound, and say it with me. | taps each sound | full, recap |
| /a/ /m/ | each tap | the button lights | /a/ /m/ | says them | every time |
| tv_now_readers | the last tap | Kai and Suki step forward | Now listen to Kai and Suki read it. | — | full, recap |
| kai_says · suki_says | straight after (SF C14: the readers read before the question) | each reader glows as they read | Kai says… [at] · Suki says… [am] | — | every time |
| tv_rc_q (replaces `read_who` on the first item) | straight after | both readers pulse | Who read it right? Tap Kai, or tap Suki. | taps a reader | full |
| read_who | later items | both readers pulse | Who read it right? | taps a reader | every time |
| tv_yes_<reader> (suki) | the right reader | Suki cheers; the sounds light in turn | Yes! Suki read it right. /a/ /m/ [am] | — | every time |
| ↳ tv_lets_check · tv_right_<reader> (suki) | the wrong reader | Kai scratches his head; the sounds light in turn | Let's check. Say the sounds with me… /a/ /m/ [am] · Suki read it right. | — | every time |
| read_tap_sounds | the second and third words | the new word slides in | Tap each sound, and say it. | taps | every time |
| tv_build_done | the close | | You built words with their sounds, and you read them. | — | every time |

**Flag:** the readers are Kai and Suki whichever ninja the child chose, so a child who picked Kai may watch Kai read it wrong. Two other readers would avoid it; the lines change only in their names (the `<reader>` families). Left to Jonas (§8, T19).

### 3.17 w1-5, Word Building with three sounds

**Forms.** Word Building's short form (same session) or recap (a later day), with the one new idea in one sentence. The short form has no I do: the paw offers w1-4's canonical `am` demo, and the first word is a we do. The recap plays the canonical demo, card tap and all, then hands over with no hold.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_build_again_3 | 0 s | three dashed lines; the tiles m, a and t; the word card | It's Word Building again. This word has three sounds, so there are three lines. | — | short, recap |
| tv_our_word · first_sound_q | 5.9 s; the answer glows after 2 s | the first line glows | Here's our word… [mat] · What's the first sound? | taps < m > | every time |
| tv_next_middle | the first time per save | the middle line glows | Now the next sound. It's in the middle… [mat, slowly] | taps < a > | once per save |
| last_sound_q | straight after | the last line glows | What's the last sound? | taps < t > | every time |
| tv_lets_say_read | the word is built | the sweep | Now let's say the sounds… and read the word. /m/ /a/ /t/ [mat] | says them | every time |
| tv_by_yourself_build · tv_your_word | the next word (the you do) | | Now you build one all by yourself. · Your word is… [sat] | builds it | every time |
| tv_readers_back | Kai and Suki, short | Kai and Suki wave | Kai and Suki are back. You read it first, then they read it. | taps the sounds | short, recap |
| tv_build_done | the close | | You built words with their sounds, and you read them. | — | every time |

### 3.18 w1-6, the first Monster Battle (`battle`, full)

On the map: `tv_map_next_<game>` (battle) "Next is a Monster Battle. Baron Muddle's monsters are guarding the sounds. Tap the glowing stone, if you're brave."

*Voice:* a little dramatic on "Oh no!", then calm and confident: the child can do this. Never scary.

The battle is framed by comparison ("just like Word Building"), and it gets a demo (mechanics §6.4) with the same two join-ins as Word Building: the child taps the word card, and finds the last sound. The monster's bar is explained the moment it moves. "Spell" is named here, after the child has seen it done. The letter row stays dim and can't be tapped until ▶ (in the right-hand column), which fixes today's taps during the introduction.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_battle_oh_no (replaces `battle_start` on first meeting) | 0 s | the monster lands with a wobble; its bar sits at the top right; the word card and two lines; the letter row is dim | Oh no! One of Baron Muddle's monsters is in the way! | — | full |
| tv_battle_frame | 4.0 s | the letter row glows, but stays dim | We zap it with words, just like Word Building. | — | full |
| tv_battle_card | 8.1 s | the word card pulses; the pointing hand | I'll zap the first one. Tap my word card, and hear the word. | taps the card | full, recap |
| [at] | the tap | the card speaks | [at] | — | every time |
| tv_first_is | straight after | the paw taps < a >; it flies to line 1; the ninja strikes; the monster flinches; the bar drops a block | The first sound is… /a/ | — | full, recap |
| tv_bar_down | straight after | the bar glows where it dropped | Zap! Look, its bar went down. | — | once per save |
| tv_you_find_last | 6.3 s after the card tap; < t > glows after 2 s | the last line glows | Can you find the last one? | taps < t >: another zap | full, recap |
| /a/ /t/ [at] | the word is built | the tiles light in turn; the sweep | /a/ /t/ [at] | — | every time |
| tv_battle_ready | straight after | ▶ in the right-hand column (the letters fill the nav row); the ninja in its ready stance | That's how we spell a word. Now you spell one. Are you ready to zap it? | taps ▶: the letters wake | full |
| tv_your_word (replaces `battle_spell`) | after the bow | the word card and two lines | Your word is… [am] | — | every time |
| first_sound_q | the first word only | the first line glows | What's the first sound? | taps < a > | full |
| /a/ | each right sound | the tile flies to its line; the ninja strikes; the bar drops | /a/ | — | every time |
| tv_next_word | the next words; from the third word only the word itself | | Here's your next word… [sat] | builds | every time |
| battle_win · tv_battle_why (replaces `audit_baron_first`) | the last zap | the monster runs away; the stickers begin to fly | Hooray! The monster ran away! · Every monster you beat helps us win back the sounds. | — | every time · once per save |

### 3.19 w1-7, Sound Hunt: a sound in the middle (`soundhunt`, full)

On the map: `tv_map_next_<game>` (soundhunt) "Next is a new game, called Sound Hunt. Tap the glowing stone to play."

*Voice:* a whisper of adventure: we're hunting.

"The middle" is shown, not defined: under each demo word three dots appear, and the middle one glows while its sound is held. The I do stretches only the pin (the budget); the we do compares both words ("Listen to them both…").

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_hunt_frame (replaces `hunt_intro`, `audit_middle_place`) | 0 s, the level on screen | the dojo room | In Sound Hunt, the sound is hiding in the middle of the word. | — | full |
| tv_here_sound | 4.8 s | the /i/ petal arrives misty and blooms (a new sound) | Here's the sound… /i/ | — | every time |
| tv_petal_say | 7.5 s | the petal breathes | Tap the petal, and say it with me. | taps; says /i/ | a new sound |
| /i/ | the tap | the petal glides to the nav slot | /i/ | — | every time |
| tv_ido_pair_<pair> (pan_pin) | straight after | the pan and the pin drop in, each spotlit on its word | I'll go first. Here's a pan and a pin. | watches | a new sound's I do |
| tv_let_me_listen · [pin, slowly] | straight after | three dots under the pin; the middle one glows while /i/ is held | Hmm, let me listen. · [pin, slowly] | — | a new sound's I do |
| mid_pin | straight after | the petal swells; the paw taps the pin on "middle"; the ninja's kick | Pin has this sound in the middle… /i/ | — | every time |
| tv_ready_together | 12.3 s after the petal tap | ▶ | Let's do the next one together. Are you ready? | taps ▶ | full |
| fm_name_tap · fm_name_tin · tv_swap_both | the we do | the two cards light in turn as each is stretched | This is a tap. · This is a tin. · Listen to them both… [tin, slowly] [tap, slowly] | — | every time |
| tv_hunt_q (replaces `hunt_q`) | straight after; the tin glows after 2 s | the petal swells | Which one has this sound in the middle… /i/ | taps the tin | every time |
| mid_tin · tv_watch_write · tv_how_we_write · tv_tap_it_say | the right tap | the ninja writes < i > on the tin's middle line | Tin has this sound in the middle… /i/ · Now watch my ninja write it. · This is how we write… /i/ · Now you tap it, and say the sound. | taps < i >; says /i/ | a new spelling, once a level |
| tv_by_yourself · fm_name_lid · fm_name_mat · tv_swap_both · tv_hunt_q | the you do | | Now you do one all by yourself. · This is a lid. · This is a mat. · Listen to them both… [lid, slowly] [mat, slowly] · Which one has this sound in the middle… /i/ | taps the lid | every time |
| mid_lid · tv_praise_middle | the right tap | < i > appears silently | Lid has this sound in the middle… /i/ · You heard it, right in the middle. | — | every time (praise when due) |
| ↳ [mat, slowly] · tv_not_in_middle · tv_fix_middle | a wrong tap | the card wobbles | [mat, slowly] · That one has a different sound in the middle. · Listen for the middle… /i/ | taps again | every time |
| tv_next_build | the build phase | the lines and tiles slide in | Next, we're going to build some words with this sound… /i/ | — | every time |
| tv_our_word · (Word Building's stems) | the we do, then the you do | | Here's our word… [it] · What's the first sound? · … | builds | every time |
| tv_readers_back · (Kai and Suki, short) | the reading check | | Kai and Suki are back. You read it first, then they read it. | taps | short |
| tv_hunt_done | the close | | You heard a sound right in the middle of words. That's tricky, and you did it! | — | every time |

`pin`, `tin` and `lid` are on FIRST_MINUTES' list of words a 3-year-old doesn't know: flagged for C1 (a swap needs new art).

### 3.20 w1-8, Sound Swap (`swap`, full)

On the map: `tv_map_next_<game>` (swap) "Next is a new game, called Sound Swap. Baron Muddle has mixed up some words! Tap the glowing stone to fix them."

*Voice:* playful: fixing Baron's mischief. "So out goes…" and "And in goes…" have a magician's rhythm.

Sound Swap is the hardest mechanic in Bamboo Village, so it gets the full shape with three child actions before the child's own swap:
- **the child reads the start word first**, as Sounds~Write asks ("say the sounds and read the word before the sound swapping begins");
- **"Are you ready to watch?"**: Jonas's first "Are you ready?", the one place a Ready comes before a demo;
- **the child kicks out the old sound** inside Sensei's swap (the three-year-old judge's split).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_swap_oh_dear (replaces `swap_start`) | 0 s | the word card with < m a t > on its lines; Baron's muddle swirl blows past; nothing tappable | Oh dear. Baron Muddle has been muddling up words. | — | full |
| tv_swap_read_first (replaces `this_is` in Sound Swap) | 3.7 s | the three tiles become sound buttons and glow | First, let's read this word. Tap each sound, and say it with me. | taps m, a, t | full, recap, short |
| /m/ /a/ /t/ · [mat] | each tap, then the sweep | the tile lights; the sweep | /m/ /a/ /t/ · [mat] | says them, then the word | every time |
| tv_swap_frame | straight after | the ninja crouches, ready | In Sound Swap, we change just one sound, to make a new word. | — | full |
| tv_ready_to_watch | 6.2 s after the read | ▶ pops in | I'll show you first. Are you ready to watch? Tap the green arrow. | taps ▶ | full |
| tv_swap_change_to | after the bow | the target word's speaker glows | I'll change it to… [sat] | watches | full, recap |
| [mat, slowly] · [sat, slowly] | straight after | the first line pulses on each held first sound | [mat, slowly] · [sat, slowly] | — | full, recap |
| tv_swap_kick | 8.7 s after ▶ | the first tile glows | The first sound changes. Can you tap it, and kick it out? | taps < m >: the ninja kicks it off the line; a small /m/ petal pops above it | full, recap |
| /m/ | the tap | the petal pops, then fades | /m/ | — | every time |
| tv_swap_in | straight after | the paw taps < s > in the letter row; it flies onto the first line; a small /s/ petal | And in goes… /s/ | — | full, recap |
| /s/ /a/ /t/ · [sat] | straight after | the tiles light in turn; the sweep | /s/ /a/ /t/ · [sat] | — | every time |
| tv_swap_ready | 7.0 s after the kick | ▶ pops in | Now you swap one. Do you want to have a go? | taps ▶ | full |
| tv_swap_now_change (replaces `swap_make`) | after the bow | the word: sat; the target's speaker glows | Now let's change it to… [sit] | — | every time |
| tv_swap_both (replaces `what_changed`) | straight after | the lines pulse on the held sounds | Listen to them both… [sat, slowly] [sit, slowly] | — | every time (fades, SF C11) |
| st_what_change | straight after | the tiles glow faintly | What do we need to change? | taps < a > | every time (fades) |
| st_middle_changes | the right tile; protected (no tap cuts it, SF C11) | < a > lifts off its line | Yes, the middle sound changes! | — | every time |
| tv_swap_pick (replaces `swap_pick`) | straight after; the choices wake as it starts | the choices glow | Now tap the new one. | taps < i > | every time |
| /s/ /i/ /t/ · [sit] | the right pick | the tiles light; the sweep | /s/ /i/ /t/ · [sit] | — | every time |
| tv_praise_swap | every second step, when due | | You changed just one sound. | — | every time |
| tv_swap_done (replaces `swap_done`) | the close | the words shine, unmuddled | You fixed all of Baron's muddled words! | — | every time |

From the third step, after two first-try steps in a row, `tv_swap_both` and `st_what_change` drop, and come back after a miss (SF C11, A6). **Retired here:** `swap_start`, `this_is`, `swap_make`, `what_changed`, `audit_swap_first`, `audit_swap_middle`, `audit_swap_last` (the `st_*_changes` lines replace them) and `swap_done`.

### 3.21 w1-9, Ninja Run (`run`, full)

On the map: `tv_map_next_<game>` (run) "Next is a new game, called Ninja Run. Tap the glowing stone to play."

*Voice:* sporty and bright. The start is a starting gun, so "off we go!" keeps its "!".

The lanterns carry written words and the sounds are the question, so no petals appear: neutral dots light in the banner (Dec1). The world starts only when the child taps ▶, on every run.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_run_frame (replaces `run_start`) | 0 s | the ninja on the start line, jogging on the spot; the world is still | This game is called Ninja Run. Your ninja runs all by itself. | — | full |
| tv_run_jump | 4.8 s | a log bobs ahead; the pointing hand taps the play area | Tap anywhere to make your ninja jump. Can you try it now? | taps: the ninja jumps on the spot | full, recap |
| tv_run_jump_ok | the jump | stars | Good jumping! | — | full, recap |
| tv_run_lanterns_how | straight after | two lanterns float past, lit, as an example | When the lanterns come, I'll say some sounds, and you catch the word. | — | full |
| tv_run_ready | 6.3 s after the jump | ▶ pops in | Are you ready? Tap the green arrow, and off we go! | taps ▶: the world moves | every time |
| tv_run_lanterns | the first lantern group; the ninja stops under the lanterns in its ready stance | two lanterns, each with a written word | Here come the lanterns. I'll say the sounds of a word. | — | full |
| tv_guess_q (replaces `run_blend`, `audit_sounds_again`, `t_listen_for_word`) | straight after | the banner's dots light one per sound | Listen for the word… /s/ /i/ /t/ | — | groups 1–3 |
| tv_run_which | straight after; the first group's answer glows after 2 s | the lanterns bob | Tap the lantern with my word. | taps a lantern | groups 1–3 |
| /s/ /i/ /t/ · [sit] | the right lantern | a flying leap and a POW; the word rises out of it, lighting sound by sound | /s/ /i/ /t/ · [sit] | — | every time |
| ↳ tv_run_fix | a wrong lantern | the ninja hops back, puzzled; the lantern's word lights | That's a different word. Listen again… /s/ /i/ /t/ | taps | every time |
| (group 4 on) | | the sounds alone (SF C16) | /m/ /a/ /t/ | taps | every time |
| run_end | the gong | the ninja strikes the gong | Bong! You made it to the gong! | — | every time |

`help_run` ↻ becomes "Tap anywhere to jump. Tap a lantern to catch it." **Flag for content:** `run:blend` asks a non-reader to match heard sounds to *written* lantern words; the pedagogy judge asks whether a w1-9 child can read them (a content question, not a script one).

### 3.22 w1-10 to w1-13: the second meetings

These stones replay known games. Each opens on its short line (or its recap line on a later day), then plays with the stems rotating and fading (SF A5, A6). Only what differs from the first meeting is shown.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_first_again_new | w1-10, 0 s (/n/, /p/) | the dojo room | It's First Sounds again, with two new sounds. | — | short |
| tv_first_sound · tv_petal_say · tv_ido_pair_<pair> (nut_hat) · … | each new sound's I do (no hold) | the new petal arrives misty and blooms | Our first sound is… /n/ · Tap the petal, and say it with me. · I'll go first. Here's a nut and a hat. · … | taps; says /n/; watches | every time |
| tv_ne_again | w1-10's Ninja Eyes | the letter tiles drop in | Now let's play Ninja Eyes. | taps | short |
| tv_next_build_plain | w1-10's build phase | the lines and tiles | Next, we're going to build some words. | builds | every time |
| tv_hunt_again | w1-11, 0 s (/o/) | the dojo room | It's Sound Hunt again, with a new sound. | — | short |
| tv_swap_again | w1-12, 0 s | the word card: sat | It's Sound Swap again. We change one sound to make a new word. | — | short, recap |
| tv_swap_read_first | straight after | the tiles become sound buttons | First, let's read this word. Tap each sound, and say it with me. | taps the sounds | every time |
| tv_show_offer_short | w1-12, the short form (the paw offers mat to sat) | the paw pulses beside the word | If you'd like to see me do one first, tap my paw. | may tap the paw | short |
| tv_battle_again (replaces `battle_start` on short forms) | w1-13, 0 s | a new monster lands; the letters wake as the line ends | Another monster! Let's zap it with words. | builds | short |

### 3.23 w1-14, Story Time (`story`, full)

On the map: `tv_map_next_<game>` (story) "Next is Story Time. Tap the glowing stone to open the book."

*Voice:* Sensei's pages like a bedtime story, with a character voice or two. On the child's pages, an encouraging near-whisper: a grown-up leaning in beside them.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_story_frame (replaces `story_start`) | 0 s, the title page (held) | the book opens; the title glows | Story time! I'll read some pages to you, and you'll read some pages to me. | — | full |
| tv_story_title · (the title) | 5.5 s | the title words light as they're said | This story is called… · (the title clip) | — | every time |
| tv_story_begin | straight after | ▶ pulses in the right-hand column | Tap the green arrow, and let's begin. | taps ▶ | every time |
| story:s1_1 … | Sensei's pages (held) | the picture, then the text lights as she reads | (the page) | taps ▶ | every time |
| tv_story_yours (replaces the first `story_your_turn`) | the child's first page: "Map! Tap it!" in big letters | each word glows once | This page is yours. Say the sounds, and read each word. | — | full |
| tv_story_help | straight after | the words glow again | If you get stuck, tap a word, and I'll help. | — | full |
| tv_story_tick | straight after | the green tick pulses in the column | When you've read it all, tap the green tick. | reads aloud; taps ✓ | full |
| ↳ tv_story_together | 8 s with no tap, the save's first child page | the words light sound by sound as Sensei says them | Let's read it together. | reads along | once per save |
| [w] sounds · [w] | a word tapped (or `tv_story_together`) | its letters light sound by sound | /m/ /a/ /p/ · [map] | — | every time |
| well_read | the tick | the page glows | Well read! | taps ▶ | every time |
| story_your_turn ↻ | the child's later pages | the words glow once | Your turn to read. | reads; taps ✓ | every time |
| tv_story_choice (replaces `audit_story_choice`) | the first choice page | the two words, each with its picture | Now you choose what happens. Read the two words, and tap one. | reads; taps a word | full |
| tv_story_q (replaces `story_question`) | the question page; the pictures appear only after the line (the fix for today's cut-off) | | Now a question about the story. | — | every time |
| story:q | straight after | the pictures glow | (the story's question) | taps a picture | every time |
| ↳ tv_story_tick_idle | 10 s with no tap, on any child page | the tick pulses | When you've read it, tap the green tick. | taps ✓ | every time |
| story_end | the last page | the book closes | The end! What a story! | — | every time |

### 3.24 w1-15, the first boss (`boss`, full)

On the map: `tv_map_next_<game>` (boss) "Next is the boss of Bamboo Village. Tap the glowing stone, if you're ready."

*Voice:* reassuring after Baron's bluster: steady and warm, with a twinkle.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| baron_w1 | 0 s, Baron's cut-in | the screen darkens; the letters dim | So... a little ninja wants to stop me? My sumo panda will squash you! | — | every time |
| tv_boss_calm | the cut-in ends | the sumo panda stomps in with its long bar | Don't worry, ninja. You know what to do. | — | full |
| tv_boss_frame (replaces `battle_boss`) | straight after | the long bar glows | A boss takes lots of words to beat. | — | full |
| tv_boss_ready | 12.3 s, with Baron's line | ▶ in the column; the ninja in its ready stance | Are you ready to beat the boss? Tap the green arrow. | taps ▶: the letters wake | every time |
| tv_your_word | after the bow | | Your word is… [top] | builds | every time |
| (the battle) | as w1-6, with the stems fading | | … | … | every time |
| battle_boss_win | the boss falls | confetti | You beat the boss! What a ninja! | — | every time |

Baron's lines are his own; "will squash you" is a threat, and a gentler version is offered to Jonas ("My sumo panda will sit on your words!", §8, T20).

### 3.25 The land is done: the World Flower, then Blossom Hills

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| world_done | the boss's reward | the land's stones all glow | You found every sound in this land! Let's go to the next one! | taps ▶ | every land |
| t_visit | straight after | the World Flower | Let's visit the World Flower! | taps ▶ | every land |
| wf_petals_you_know | the flower, with its lit petals | | Every shining petal is a sound that you know! | taps ▶ | every land |
| tv_flower_recap (replaces `t_remember_this`) | the /o/ petal lifts out and glows | | Here's a sound you learnt… /o/ | — | every land |
| tp_<p>_hear (o) · tv_petal_say | straight after | the petal breathes | You can hear it in pot, top and mop. · Tap the petal, and say it with me. | taps; says /o/ | every land |
| wf_world_new | the next land's petals wait in the mist | | New sounds are hiding in this land. Let's go and find them! | taps ▶ | every land |
| world_2 | the map of Blossom Hills | the ninja arrives on stone 1 | Welcome to Blossom Hills! | — | first arrival |
| tv_map_next_<game> (learn) | straight after | stone 1 glows | Next is the dojo. You'll learn some new sounds there. Tap the glowing stone to go. | taps the stone | once per save |

`t_now_you_say_it` retires with `t_remember_this` ("Do you remember this one?", a question nobody can answer).

### 3.26 w2-1, the first Dojo lesson: New Sounds (Jonas's "Listen!" and the ear)

*Voice:*
- **The frame:** a teacher setting out today's lesson, with real excitement but quietly.
- **Each sound:** "Here it comes…" is hushed and suspended, like the moment before a magic trick. The two sounds are crisp and pure, with a beat of silence between them.
- **"Now watch my ninja write it":** anticipation.
- **Never a bark.** The one-word `listen` clip is gone from the lesson.

**What changes from today** (mechanics §7):
- **The lesson says what it is, and who does what, before anything happens,** and asks whether the child is ready. The level no longer "just starts with 'Listen!'".
- **No ear anywhere.** The listening cue is the ninja cupping its ear, which the child has known since W1 ("ninja ears"). "Get your ninja ears ready." is said for the first sound only.
- **The four petals wait in the mist above, and nothing pulses before it has been explained.** Each petal floats down and blooms on its sound (SOUND_DISPLAY §4.6).
- **The first sound is linked to words the child knows** ("You can hear it in bat, bag and bin."). The later sounds skip it: `tp_k_hear` includes "king" and "duck", which aren't spelt with < c >.
- **The child acts twice per sound:** they tap the petal and say the sound, then tap the letter (twice) and say it.
- **The sounds shorten as a series** (SF C2): "Here's the first new sound…", "Here's the next new sound…", "Here's another new sound…", "Here's the last new sound…".
- **Art flag:** the /g/ petal, a white faceless ghost, reads as an ear. It needs a redraw (SOUND_DISPLAY A13).

#### A. New Sounds (`learn`, full)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_learn_frame_<n> (four) (replaces `dojo_hello`, `listen` as the opener) | 0 s, the level on screen | the dojo; four misty petals float in a row above the middle and twinkle one after another on "four new sounds"; nothing pulses | Today in the dojo, I'm going to teach you four new sounds. | — | full |
| tv_learn_how | 4.4 s | the ninja sits up, attentive; its hands glow | I'll say each sound, and show you how we write it. Then you say it with me. | — | full, recap |
| tv_learn_ready | 11.4 s | ▶ pops in; the ninja faces it in its ready stance | Are you ready for the first one? Tap the green arrow. | taps ▶ | full, recap |
| tv_learn_first | after the bow | the first misty petal floats down to the middle; the ninja cups its ear | Here's the first new sound. Get your ninja ears ready. | — | every time |
| tv_here_it_comes | 3.6 s | on the sound: the mist wipes up, the colour fills, the ball pops; a ring of light; on the second, the petal swells | Here it comes… /b/ … /b/ | listens | every time |
| tp_<p>_hear (b) | straight after | the petal swells on "bat, bag and bin" | You can hear it in bat, bag and bin. | — | the first sound of a lesson |
| tv_petal_say | 11.5 s after ▶ | the petal breathes | Tap the petal, and say it with me. | taps; says /b/ | every time |
| /b/ | the tap | the petal swells | /b/ | — | every time |
| tv_watch_write | straight after | the petal steps aside; the ninja casts; < b > appears beside the petal | Now watch my ninja write it. | watches | every time |
| tv_how_we_write | the letter lands | < b > glows | This is how we write… /b/ | — | the first sound of a lesson |
| tv_tap_letter_say (replaces `dojo_tap_say`) | straight after | < b > pulses; two mini /b/ petals wait under it | Now you tap it, and say the sound. | taps < b >; says /b/ | the first sound of a lesson |
| /b/ | the first tap | the first mini petal lights; the ninja moves | /b/ | — | every time |
| tv_once_more | straight after | < b > pulses again | Tap it once more, and say it again. | taps; says /b/ | once per save |
| /b/ | the second tap | the second mini petal lights | /b/ | — | every time |
| tv_said_well | the first sound only | the ninja bows | Good, you said that sound really well. | — | the first sound of a lesson |
| tv_learn_next | the second sound | the next misty petal floats down | Here's the next new sound… /k/ … /k/ | listens | every time |
| tv_petal_say_short | straight after | the petal breathes | Tap its petal, and say it. | taps; says /k/ | every time |
| tv_watch_write · tv_and_how_we_write | straight after | the cast; < c > appears beside the petal | Now watch my ninja write it. · And this is how we write… /k/ | — | every time |
| tv_tap_it_say_short (replaces `dojo_tap_say` from the second sound) | straight after | < c > pulses; two mini petals | Now you tap it, and say it. | taps twice; says /k/ | every time |
| tv_learn_another | the third sound | the next petal | Here's another new sound… /g/ … /g/ | listens | every time |
| tv_petal_say_short · tv_watch_write · tv_and_how_we_write · tv_tap_it_say_short | as the second | < g > | Tap its petal, and say it. · Now watch my ninja write it. · And this is how we write… /g/ · Now you tap it, and say it. | taps; says /g/ | every time |
| tv_learn_last | the last sound | the last petal | Here's the last new sound… /h/ … /h/ | listens | every time |
| tv_petal_say_short · tv_watch_write · tv_and_how_we_write · tv_tap_it_say_short | as the second | < h > | Tap its petal, and say it. · Now watch my ninja write it. · And this is how we write… /h/ · Now you tap it, and say it. | taps; says /h/ | every time |
| tv_learn_all_<n> (four) | straight after | the four petals line up with their letters beside them | Four new sounds! You said every one. | — | every time |
| ↳ tv_dojo_idle_say | 8 s with no tap on the letter | the letter glows | Tap the letter, and say the sound with me… /b/ | taps | every time |
| ↳ tv_dojo_help_sound | Help, before the letter is up | the petal swells | Here's the sound again… /b/ | — | every time |
| tv_x_two_sounds | a Learn of < x > (a later dojo), after `tv_how_we_write` | the /k/ and /s/ petals with a "+" (Dec7) | This spelling is two sounds together. /k/ /s/ | — | every time |

**Rules for this game:**
- **A tap on a petal or a letter while Sensei is explaining** nods it and plays a tink; it never cuts her off (SOUND_DISPLAY §4.3).
- **Hear it again** replays the current sound's whole teaching.
- **A two-letter spelling** (from w3-6: < ff >, < ll >, < ss >, < zz >): `t_two_letters` "It's two letters, but it's one sound." follows `tv_how_we_write`. The next two-letter spelling within two minutes gets `st_two_letters_too`, and the rest get nothing (SF A2).
- **< x >** is taught as a sound pair (SOUND_DISPLAY §4.5), with `tv_x_two_sounds` (below).

#### B. Ninja Eyes in the dojo (`find`, short: met in w1-2)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_ne_new_sounds (replaces `dojo_find` as the opener) | 0 s | the letter tiles drop in; the petal slot empty | Now let's play Ninja Eyes, with your new sounds. | — | short |
| tv_petal_hint | 3.0 s; once per save in the dojo, before the question (SF C10: never cut off) | the petal pops into the nav row and pulses | Tap the petal if you want to hear the sound again. | — | once per save |
| tv_which_write | straight after | the petal swells | Which of these is the way we write… /b/ | taps < b > | every time |
| tv_find_write · tv_now_find | the next items, rotating | | Find how we write… /k/ · Now find how we write… /g/ | taps | every time |
| ↳ tv_thats_write · we_need | a wrong tile | its sound's petal pops above it, then the target's swells | That's how we write… /m/ · We need… /k/ | taps | every time |

#### C. Word Building in the dojo (`build`, short or recap)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_build_dojo (replaces `dojo_build`) | 0 s | the lines, the letter row and the word card; the tiles locked until the word has been said (SF C12) | Now let's build some words with your new sounds. | — | short, recap |
| (recap only) tv_word_card · … · tv_lets_say_read | a later day: the canonical demo on the level's first word, with its card tap and "Can you find the last one?" | | (as w1-4) | taps the card; finds the last sound | recap |
| tv_your_word (replaces `dojo_build_word`) | straight after | the word card speaks | Your word is… [hip] | — | every time |
| first_sound_q | the first word only; the answer glows after 2 s | the first line glows | What's the first sound? | taps < h > | every time |
| (the build) | Word Building's stems, fading after two first tries | | What's the next sound? · What's the last sound? | builds | every time |
| say_sounds_read ↻ | each built word (the first two, and after any miss) | the tiles light; the sweep | Say the sounds, and read the word. /h/ /i/ /p/ [hip] | — | every time |
| tv_learn_done (replaces `dojo_done`) | the close | the new petals shine above the dojo | You learnt four new sounds today, and you built words with them. | — | every time |

**Retired from the Dojo:** `dojo_hello` and `audit_dojo_back`; `listen` as an opener; `audit_spell_it`, `audit_hear_see` and `dojo_tap_say` from the Learn; `dojo_find`, `tut_speaker` and `dojo_build`; `dojo_done`; the rainbow tally petals, which become the two mini petals (Dec6).

---
## 4. Every game type: the first time, and every time after

### 4.1 The registry (the content of `src/content/games.ts`)

One row per game type: its full form (where it is written out), its recap and short lines, the paw's canonical demo (for Show me again when no demo has played: mechanics §4.5), and where its Ready sits. **On a recap, the hand-over is the turn's own "your" line** where one exists ("Your word is…", "Here's your slow word…", "Now you read them."), and otherwise `tv_now_your_turn` "Now it's your turn."

| Game id | Full | Recap (a later day; no Ready unless 21 days or a struggle) | Short (known) | Paw's canonical demo | Ready at |
|---|---|---|---|---|---|
| `tap` | §3.5 A | – (W1 only) | – | – (it would answer for the child) | row |
| `fastslow` | §3.5 B | `tv_ts_again` + `fm_name_<w>` + `tv_ts_slow_one` | as recap | the W1 show (sun) | row |
| `tapall` (start) | §3.5 D | `tv_pocket_recap` + `tv_pocket_ido` + the demo | `tv_pocket_more_<p>` | – (it would take an answer) | row |
| `tapall` (middle) | §3.9 C | `tv_pocket_middle` + `tv_here_sound` + the demo | `tv_pocket_middle_more_<p>` | – | row |
| `rail` | §3.7 A | `tv_rail_again` + `tv_rail_ido` + the reading | `tv_rail_again` | the rail's own reading | row |
| `which` | §3.7 C | `tv_which_again` + `tv_which_demo` + `tv_which_so` | `tv_which_again` | the fish–dog rows | row |
| `compound` | §3.7 D | `tv_squish_again` + `tv_squish_slow` + `tv_squish_fast` | `tv_squish_again` | the sunflower | row |
| `slowpick` | §3.9 B | `tv_slow_recap` + `tv_slow_demo` + `tv_i_hear_<w>` | `tv_slow_short` | the mug | row |
| `sounds` | §3.11 | `tv_guess_recap` + `tv_my_sounds` + `tv_guess_so_<w>` | `tv_guess_short` | the sun | row |
| `dots` | §3.12 | `tv_dots_recap` + `tv_dots_ido` + the dots + `tv_dots_word_ido` | `tv_dots_short` | the sun's dots | row |
| `firstsound` | §3.13 A | `tv_first_recap` + each new sound's I do | `tv_first_again_new` or `tv_first_again_known` | – (the new sound's I do plays anyway) | row |
| `find` | §3.13 B | `tv_ne_recap` | `tv_ne_again` / `tv_ne_new_sounds` | – (the first item is a we do) | – |
| `soundhunt` | §3.19 | `tv_hunt_recap` + the new sound's I do | `tv_hunt_again` | – | row |
| `build` | §3.16 A | `tv_build_recap` + the canonical demo with its card tap and "Can you find the last one?" | `tv_build_again_short`, `tv_build_again_3`, `tv_build_dojo`, `tv_next_build`, `tv_next_build_plain` | the `am` demo | row |
| `readcheck` | §3.16 B | `tv_readers_back` + `tv_rc_how` | `tv_readers_back` | – (guided) | – |
| `battle` | §3.18 | `tv_battle_recap` + `tv_battle_go` (the starting gun) | `tv_battle_again` (no hold) | Word Building's `am` demo | column |
| `boss` | §3.24 | Baron's line + `tv_boss_again` + `tv_boss_ready` | as recap (a boss always gets its ▶) | – | column |
| `swap` | §3.20 | `tv_swap_again` + `tv_swap_read_first` + the canonical demo (mat to sat, with the kick) | `tv_swap_again` + `tv_swap_read_first` + `tv_show_offer_short` | mat to sat | row |
| `run` | §3.21 | `tv_run_again` (the starting gun) + `tv_run_jump` | `tv_run_again` | – | row |
| `story` | §3.23 | `tv_story_recap` + the title + `tv_story_begin` | `tv_story_short` + the title + `tv_story_begin` | – | column |
| `learn` | §3.26 A | `tv_learn_recap_<n>` + `tv_learn_how` + `tv_learn_ready` | `tv_learn_short_<n>` + `tv_learn_first_short` | – (the Learn is its own show) | row |
| `sort` | §4.3 | `tv_sort_recap` + the chests + the demo | `audit_sort_again` + the chests (SF C1) | the first word | column |
| `trial` | §4.2 | `tv_trial_short` | `tv_trial_short` | – | column |
| `review` | §4.4 | `tv_review_short` | `tv_review_short` | – | column |

**The recap and short lines** (the ones not already in §3):

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_now_your_turn | a recap's hand-over, where the turn has no "your" line of its own | the turn's board | Now it's your turn. | — | recap |
| tv_pocket_recap | Pocket Hunt (start), a later day | the grid and the pockets; the petal | It's Pocket Hunt again. We find pictures that start with this sound. | — | recap |
| tv_pocket_middle_more_<p> (o) | Pocket Hunt (middle), known | the grid; the /o/ petal | One more Pocket Hunt. Find the pictures with this sound in the middle… /o/ | finds | short |
| tv_slow_recap | Slow Words, a later day | the cards land | It's Slow Words again. I say a word slowly, and you find its picture. | — | recap |
| tv_slow_short | Slow Words, known | the cards land | Let's play Slow Words again. | — | short |
| tv_guess_recap | Guess My Word, a later day | the demo cards | It's Guess My Word again. I'll say the sounds, and you listen for the word. | — | recap |
| tv_guess_short | Guess My Word, known | | Let's play Guess My Word again. | — | short |
| tv_dots_recap | Sound Dots, a later day | the demo card and its dots | It's Sound Dots again. Every dot is one sound in the word. | — | recap |
| tv_dots_short | Sound Dots, known | the first dot pulses | It's Sound Dots again. Tap the dots, and say the sounds with me. | taps | short |
| tv_first_recap | First Sounds, a later day (§3.15) | | It's First Sounds again. I say a sound, and you find the picture that starts with it. | — | recap |
| tv_first_again_known | First Sounds, a review level with no new sounds | | It's First Sounds again. Let's see which sounds you know. | — | short |
| tv_ne_recap | Ninja Eyes, a later day | the letter tiles | It's Ninja Eyes again. I say a sound, and you find how we write it. | — | recap |
| tv_hunt_recap | Sound Hunt, a later day | | It's Sound Hunt again. The sound is hiding in the middle of the word. | — | recap |
| tv_build_recap | Word Building, a later day | the lines and tiles | It's Word Building again. I say a word, and we build it with its sounds. | — | recap |
| tv_build_again_short | Word Building, known | the lines and tiles | Let's build some more words. | builds | short |
| tv_battle_recap | a Monster Battle, a later day | the monster lands; the letters dim | Another of Baron's monsters! You know how to zap it. Find the sounds in each word. | — | recap |
| tv_battle_go | straight after | ▶ in the column | Are you ready to zap it? Tap the green arrow. | taps ▶: the letters wake | recap |
| tv_boss_again | every boss after the first, after Baron's line | the boss stomps in | Oh no, another boss! Don't worry. You know just what to do. | — | recap, short |
| tv_run_again | every run after the first | the start line; the world still; ▶ | It's Ninja Run again! Are you ready? Tap the green arrow, and off we go! | taps ▶ | recap, short |
| tv_story_recap | Story Time, a later day: the title page | the book opens | Story time! I'll read some pages, and you'll read some too. | — | recap |
| tv_story_short | Story Time, known | the book opens | Story time! | — | short |
| tv_learn_recap_<n> (three) | the first dojo in a new land, or after 21 days | the misty petals above | Back to the dojo, for three new sounds. You know how this goes. | — | recap |
| tv_learn_short_<n> (three) | a known dojo | the misty petals | Back to the dojo. Today there are three new sounds. | — | short |
| tv_learn_first_short | the short form's first sound | the first petal floats down | Here's the first new sound… /d/ … /d/ | listens | short |

### 4.2 Gem battles (`trial`, full: the first Gem Trial; a child of 5 or more)

*Voice:* exciting but safe. "That's fine" is said like a hand on the shoulder. The bar never starts before ▶, and the hearts are explained when the first one is lost, not before.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_trial_frame (replaces `audit_trial_first`, `timer_intro_1`, `timer_intro_2`, `timer_intro_3`, `trial_start` on first meeting) | 0 s | the glowing gem over the monster; the letters locked | This is a gem battle. Win it, and the gem is yours. | — | full |
| tv_trial_bar (replaces `audit_timer_short`) | 4.1 s | the purple bar glows (not moving yet) | Spell each word before this purple bar is full. | — | full |
| tv_trial_ready | 8.5 s | ▶ in the column | The bar starts when you're ready. Tap the green arrow. | taps ▶: the bar starts | every time |
| tv_your_word | straight after | | Your word is… [ship] | builds | every time |
| tv_trial_heart (replaces `audit_timer_hearts`) | the first heart lost, once per save | a heart fades | The bar filled up, so you lost a heart. That's fine. Keep going. | — | once per save |
| trial_win | the gem is won | the gem flies up | You won the gem! It's going into its petal! | — | every time |
| trial_fail ↻ | the hearts run out | the monster hops away | So close! Keep playing, and try again soon. | — | every time |
| tv_trial_short (replaces `trial_start`) | later trials | ▶ in the column | It's a gem battle! Spell each word before the bar is full. Tap the green arrow when you're ready. | taps ▶ | recap, short |

### 4.3 Sorting (`sort`, full: w6-br1, a Year One child of 5 or more)

*Voice:* a treasure hunter opening chests: curious and pleased. Age 5's limits are 18 s of talk before the first action and about 12 s for the longest run (ARCHITECTURE §6.4).

The chests open one at a time on the child's taps, so the example sentences are the child's discovery, not a lecture. The chest lines are SF C1's (one sentence each, one example word each, the letters line only on the chest whose spelling is due).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| audit_bridging_first | 0 s | the /k/ petal stands big (hero) above three closed chests labelled < c >, < k > and < ck > | You know this sound! Now let's look at the different ways we spell it. | — | full |
| tv_sort_frame (replaces `audit_sort_first`) | 5.5 s | the chests glow | This game is called Sorting. Every word goes in the chest with the same spelling. | — | full |
| tv_sort_open (replaces `audit_sort_three` on first meeting) | 11.4 s | the first chest wiggles | This sound can be spelt in three ways. Tap each chest to open it. | taps a chest | full |
| tg_<g>_<p>_way (c_k) | the < c > chest opens | the petal swells | This is the way we spell it in cat. | taps the next chest | every time |
| tv_spelt_like_this_<w> (kit) | the < k > chest opens | the chest hops | In kit, it's spelt like this. | taps the next chest | every time |
| tv_spelt_like_this_<w> (duck) · t_two_letters | the < ck > chest opens; the letters line only if due (SF C1) | < ck > glows as one tile | In duck, it's spelt like this. · It's two letters, but it's one sound. | — | every time · when due |
| tv_sort_ido | straight after | the big petal shrinks into the top bar; a word falls and stops above the chests: "back" | I'll sort the first one. My word is… [back] | watches | full, recap |
| tv_sort_see | 3.6 s | < ck > in the word lights | I can see this spelling at the end. | — | full, recap |
| tv_sort_so | 6.1 s | the paw taps the < ck > chest; the ninja kicks the word in | So it goes in this chest. | — | full, recap |
| tv_ready_yours | 12.8 s after the last chest | ▶ in the column (the chests fill the row) | Now you do one. Are you ready? | taps ▶ | full |
| [cap] · help_sort | the first word | the word falls and stops above the chests | [cap] · Tap the chest with the same spelling as the word. | taps a chest | every time |
| [kit] | later words, with no stem | | [kit] | taps | every time |
| ↳ tv_sort_fix | a wrong chest | the word bounces back out; its spelling lights | Let's look again. Which chest has the same spelling? | taps | every time |
| tv_sort_done (replaces `sort_done`) | the close | the chests close, glowing | Same sound, different spellings. You sorted them all. | — | every time |
| tv_sort_recap | a later day | the chests land | It's Sorting again. Every word goes in the chest with the same spelling. | — | recap |

`st_like_this_in` and `st_and_like_this_in` (SF Part B's "…like this, in…" fragments) are replaced by `tv_spelt_like_this_<w>`, whole sentences, on the first sort. The short form keeps SF C1's lines.

### 4.4 Sensei's Challenge (`review`, full: the first time the map's button is tapped)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_review_frame | 0 s | Sensei's banner; a monster made of mixed-up letters | This is Sensei's Challenge. It has words from all the games you've played. | — | full |
| tv_review_how | 5.2 s | the letters glow | Find the sounds in each word to zap it. Let's see how many you can do! | — | full |
| tv_battle_go | 10.6 s | ▶ in the column | Are you ready to zap it? Tap the green arrow. | taps ▶ | full |
| tv_review_short | later | ▶ | It's Sensei's Challenge! Are you ready? Tap the green arrow. | taps ▶ | short |
| tv_review_done | the close | | You zapped so many words! That was a real challenge. | — | every time |

### 4.5 Ninja Run's reading groups (`run`, reading: the first time)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_run_read_first | mid-run, the first reading group; the ninja stops under the lanterns | a word on the banner; the lanterns carry pictures | Now it's your turn to read. Read the word at the top, and catch its picture. | reads; taps a lantern | full |
| run_read ↻ | later reading groups | | Read the word, and catch the matching picture. | taps | short |

### 4.6 A school path's first Dojo (Reception after the autumn, Years One and Two)

For a child who starts here, the Dojo is also the first game. One line names the room before the frame: `tv_dj_room`. Then §3.26 A's frame, with the count. The Year One version meets new spellings of sounds the child already knows (SCRIPT_STYLE §11.3), so the known sound is greeted as known before the spell.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_dj_room | 0 s, before the frame | the dojo | This is the dojo, a school for ninjas. Here, you learn new sounds. | — | full (a school path's first lesson) |
| tv_learn_frame_ways | 0 s | the /ae/ petal (known: no mist) above two gem sockets | Today in the dojo, I'm going to teach you new ways to write a sound you know. | — | full |
| tv_learn_how · tv_learn_ready | straight after | ▶ | I'll say each sound, and show you how we write it. Then you say it with me. · Are you ready for the first one? Tap the green arrow. | taps ▶ | full |
| tv_learn_first · tv_here_it_comes | after the bow | the petal floats down | Here's the first new sound. Get your ninja ears ready. · Here it comes… /ae/ … /ae/ | listens | every time |
| st_know_this_sound | straight after (the news before the reveal) | the petal glows | Ooh, you already know this sound! | taps the petal; says it | every time |
| tv_watch_write · t_another_way | the spell: < ai > appears beside the petal | | Now watch my ninja write it. · This is another way to spell the sound… /ae/ | — | every time |
| t_two_letters | straight after (the full form, SF A2) | < ai > glows as one tile | It's two letters, but it's one sound. | — | when due |
| tv_tap_letter_say | straight after | < ai > pulses | Now you tap it, and say the sound. | taps; says /ae/ | every time |
| tv_learn_next · st_know_this_sound · tv_and_another_way · st_two_letters_too · tv_tap_it_say_short | the second spelling (< ay >) | | Here's the next new sound… /ae/ … /ae/ · Ooh, you already know this sound! · And here's another way to spell it… /ae/ · This one's two letters too, but it's just one sound. · Now you tap it, and say it. | taps; says /ae/ | every time |

The school child's first Word Building in the dojo gets the I do (mechanics decision 9): §3.16 A's demo on the level's first word, with `Dojo.tsx` `Build` borrowing `BuildOne.runDemo`'s pattern.

### 4.7 The Year One and Two word hunt (`tapall`, words, the first time)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_word_hunt_frame (replaces `fm_tap_all_words_in`) | 0 s | written words with pictures: rain, tray, snail, bed and fish; three pockets | It's a word hunt. Every word with our sound in it goes in a pocket. | — | full |
| tv_find_words_in | 4.8 s | the /ae/ petal | Find every word with this sound in it… /ae/ | — | full |
| tv_pocket_ido · [rain] · tv_hear_in_<w> (rain) · tv_so_pocket | 7.5 s | the paw finds "rain" | I'll find one first. · [rain] · I can hear it in rain. · So into the pocket it goes! | watches | full |
| tv_pocket_ready_<n> (two) | 12.0 s | ▶ | Now you find the other two. Are you ready? | taps ▶ | full |

### 4.8 The Reception versions of W1 and W2 (`spell: true`)

Beats and lines as §3.5 and §3.7. What Reception adds:
- **The first /s/ find in Pocket Hunt:** the ninja writes < s > on the card's first line, with `tv_watch_write` and `tv_how_we_write`. Later finds show the letter silently.
- **W2's last beat is the middle-sound Pocket Hunt on /a/,** with §3.9 C's lines. < a > is written on the cat's middle line the same way.
- **W1 R's slow-word pick** is Slow Words' full form (§3.9 B) on the W1 cards: `tv_slow_frame`, `tv_slow_demo` [sun, slowly], `tv_i_hear_<w>` (sun), `tv_ready_go`, then `tv_slow_yours` [cat, slowly].

### 4.9 Show Sensei (the placement quiz, started by a grown-up)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_place_frame | 0 s | Sensei's portrait | Let's play a quick game, so I can see what you know already. | — | every time |
| tv_place_ok | 4.1 s | | Some might be tricky. That's fine. Just have a go. | — | every time |
| tv_place_sound_round | the sound round | the petal; the spelling tiles | I say a sound, and you find how we write it. | taps | every time |
| tv_place_findall_round | the find-all round | the petal; the pictures | Find every picture with this sound in it… /ee/ | taps | every time |
| tv_place_done | the end | | Thank you, ninja. Now I know just where to start. | — | every time |

### 4.10 The practice dojo (the World Flower's Practise gate)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_practise_gem | 0 s | the gem glows over the lines | Let's practise this gem. I say a word, and you build it. | — | every time |
| tv_our_word | 3.9 s | the word card | Here's our word… [rain] | builds | every time |

---

## 5. The recurring moves

### 5.1 Ready

§2.3 has the interaction and every line.

### 5.2 Show me again (the paw)

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_show_again | the paw tapped (in a hold or a turn) | the demo replays exactly, narrated, on its own pictures | Of course. Watch my paw again. | watches | every time |
| tv_ready_now | the replay has ended, in a hold | ▶ back | Are you ready to have a go now? | taps ▶ | every time |
| tv_turn_again | the replay has ended, in a turn | the turn's pictures are back | Now it's your turn again. | (the question follows) | every time |
| tv_show_offer | 12 s idle in the save's first full-form turn | the paw pulses | Not sure? Tap my paw, and I'll show you again. | — | once per save |
| tv_offer_show_miss | a second miss on one of a first meeting's first two items | the paw pulses | Shall I show you again? Tap my paw. | taps the paw, or answers | once a game |
| tv_show_offer_short | a short form whose game has a canonical demo, at its first turn | the paw pulses | If you'd like to see me do one first, tap my paw. | — | short |

### 5.3 Praise

**The rules** (SCRIPT_STYLE §8, kept):
- **The model is the feedback.** After every right answer the child hears the answer back: "Mop starts with… /m/", [sock], or /s/ /a/ /t/ [sat].
- **A praise line comes at most every second right answer** (every third in the warm-ups), where the ninja's move is the praise in between. Never stacked, never straight before a closing line, never on a streak tier-up.
- **Specific over generic.** Generic words are at most half of the praise lines.
- **No trait praise,** except the boss win's "What a ninja!", a rare milestone.
- **Celebrations keep their "!",** said with a smile, never shouted.

**Specific praise:**

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_praise_found | Ninja Ears, Slow Words, Guess My Word | the ninja's move | You found it! | — | when due |
| tv_praise_slowly | the rabbit and the tortoise | the kata | You said it slowly, just like the tortoise. | — | when due |
| tv_praise_start | First Sounds, Pocket Hunt (start) | | You listened right to the very start. | — | when due |
| tv_praise_middle | Sound Hunt, Pocket Hunt (middle) | | You heard it, right in the middle. | — | when due |
| tv_praise_order | Ninja Reading, two rows, Sound Dots | | You read them the ninja way. | — | when due |
| tv_praise_row | two rows | | You remembered which came first. | — | when due |
| tv_praise_squish | Word Squish | | You squished them into one big word! | — | when due |
| tv_praise_heard_word | Guess My Word, Ninja Run | | You heard the word in the sounds. | — | when due |
| tv_praise_write | Ninja Eyes | | You know how we write that sound. | — | when due |
| tv_said_well | New Sounds, and any "say it with me" | | Good, you said that sound really well. | — | when due |
| tv_praise_built | Word Building, a you-do word | | You built that whole word by yourself! | — | when due |
| tv_praise_judge | Kai and Suki | | You checked their reading, like a real teacher! | — | when due |
| tv_praise_swap | Sound Swap | | You changed just one sound. | — | when due |
| tv_praise_sorted | Sorting | | That's the right chest. | — | when due |
| tv_praise_read | Story Time, the read-backs | | Lovely reading! | — | when due |
| tv_praise_kept_going | any game: right after a miss on the same item | the ninja's biggest move | That was a tricky one, and you kept going. | — | when due |
| tv_praise_helped | right after help (the glow or the paw) | | Now you've got it. | — | when due |
| tv_yay_lovely | generic, calm (a Sounds~Write favourite) | | Lovely! | — | when due |
| tv_yay_thats_it | generic, calm | | That's it! | — | when due |

**Generic praise, the rotation:** `yay_1` "Brilliant!", `yay_2` "Super!", `yay_4` ↻ "Well done.", `yay_8` "Wow, great listening!", and the new `tv_yay_lovely` and `tv_yay_thats_it` above. **Out of the everyday rotation:** `yay_3` "Fantastic!", `yay_5` "Amazing!", `yay_6` "Ninja power!" (streak_3's line), `yay_9` "Smashing!" and `yay_10` "Ace!" (kept for rewards only, one at a time).

**Streaks** (Dec2's whole-answer gating):

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| audit_streak_first | the save's first three in a row | the ninja's first flames | Three right answers in a row! Your ninja is getting stronger. | — | once per save |
| streak_3 | later threes | the flames | Ninja power! | — | every time |
| streak_6 | sixes | the multicolour aura | Wow! Super ninja streak! | — | every time |
| tv_streak_10 (replaces `streak_10`) | ten whole answers in a row (Dec2) | the rainbow aura | Ten in a row! Look how your ninja is glowing! | — | every time |
| streak_lost ↻ | a streak of three or more is lost; said before the correction | the flames fade gently | Keep going, ninja. | — | every time |

### 5.4 Gentle correction

**The rules:** the tapped card says its own word; rephrase, don't repeat; end on the answer; hand the turn back. On the first miss, back to listening; on the second, show or do it together, then hand it back. Never "No", "Wrong", "Oops", a buzzer or red.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| [w] · tv_find_again_<w> | Ninja Ears, first miss | the card wobbles (400 ms) and says its word | [cat] · Can you find the sock? | taps | every time |
| [w] · tv_slow_again | Slow Words, first miss | | [bag] · Let's listen again… [van, slowly] | taps | every time |
| [w] · tv_guess_again | Guess My Word, first miss | the neutral dots light again | [mop] · Let's listen again… /m/ /a/ /p/ | taps | every time |
| [w, first] · fm_diff_<w> · tv_fix_start | First Sounds and Pocket Hunt (start), first miss | the petal swells | [cat] · Cat starts with a different sound. · Listen for the start… /s/ | taps | every time |
| [w, slowly] · fm_not_in_<w> · tv_fix_middle | Pocket Hunt (middle), first miss | | [dog, slowly] · Dog doesn't have that sound in it. · Listen for the middle… /a/ | taps | every time |
| [w, slowly] · tv_not_in_middle · tv_fix_middle | Sound Hunt, first miss | | [mat, slowly] · That one has a different sound in the middle. · Listen for the middle… /i/ | taps | every time |
| tv_fix_together · (the model) | any picture game: a second miss | the answer glows; the paw points and waits | Let's do it together. It's this one. Now you tap it. | taps; then hears e.g. "Sock starts with… /s/" | every time |
| tv_offer_show_miss | the first two items of a first meeting, a second miss | the paw pulses | Shall I show you again? Tap my paw. | — | once a game |
| tv_listen_here (replaces `listen_again`, `listen_here`) | Word Building, battles, the dojo's building: first miss | the tile wobbles; the slot glows | Let's listen again. What can you hear here? [mat, slowly] | taps | every time |
| audit_listen_next ↻ | the same, when the next sound is the problem | the slot glows | Let's listen again. What sound comes next? | taps | every time |
| thats · we_need · its_this_one ↻ | the same, second miss | the wrong tile's petal pops, then the right tile's; the right tile glows | That's… /s/ · We need… /m/ · It's this one. Say the sound as you put it on the line. | taps; says it | every time |
| thats · we_need · t_two_letters | a two-letter split (SF C5) | < sh > glows as one tile | That's… /s/ · We need… /sh/ · It's two letters, but it's one sound. | taps | every time |
| help_look ↻ | Help, third press, while building | the petal pops above the slot | Let me show you… /m/ | taps | every time |
| tv_thats_write · we_need | Ninja Eyes, a wrong tile | the tile's petal pops, then the target's | That's how we write… /s/ · We need… /m/ | taps | every time |
| tv_lets_check · tv_right_<reader> | Kai and Suki, the wrong reader | the sounds light in turn | Let's check. Say the sounds with me… /a/ /m/ [am] · Suki read it right. | — | every time |
| tv_run_fix | Ninja Run, a wrong lantern | the lantern's word lights sound by sound | That's a different word. Listen again… /s/ /i/ /t/ | taps | every time |
| tv_rail_start | Ninja Reading, Sound Dots: the wrong order | the arrow pulses | Ninjas start on this side. Tap this one first. | taps | every time |
| tv_which_fix_<pair> | two rows, a wrong row | | Let's listen again. Cat… dog. Which row has the cat first? | taps | every time |
| thats · stays_same · tv_swap_both · st_what_change | Sound Swap, the wrong tile to change | the tile wobbles; its petal pops | That's… /t/ · That sound stays the same. · Listen to them both… [pat, slowly] [mat, slowly] · What do we need to change? | taps | every time |
| tv_sort_fix | Sorting, the wrong chest | the word bounces back out; its spelling lights | Let's look again. Which chest has the same spelling? | taps | every time |

`fm_its_this` "It's this one!" becomes `tv_fix_together`, which hands the turn back.

### 5.5 When the child is quiet (a turn's idle ladder), and Help

Game time: nothing counts while anyone speaks, and any tap starts it again. Nothing ever answers for the child (NAVIGATION rule 5).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| (quiet) | 0–8 s | nothing new | — | — | every time |
| tv_idle_look_<w> | 8 s, a picture game | the answer glows gently | Have a look at each picture. Where's the sock? | — | every time |
| tv_listen_sound_again · tv_which_starts_it | 8 s, First Sounds | the petal swells | Listen to my sound again… /m/ · Which picture starts with it? | — | every time |
| tv_listen_sound_again · tv_which_way_write_it | 8 s, Ninja Eyes | the petal swells | Listen to my sound again… /m/ · Which one is the way we write it? | — | every time |
| tv_listen_here | 8 s, building | the slot glows | Let's listen again. What can you hear here? [mat, slowly] | — | every time |
| tv_both_again · tv_which_changes | 8 s, Sound Swap | | Listen to them both again… [sat, slowly] [sit, slowly] · Which sound changes? | — | every time |
| tv_dojo_idle_say | 8 s, New Sounds | the letter glows | Tap the letter, and say the sound with me… /b/ | — | every time |
| tv_show_offer | 12 s, the save's first full-form turn only | the paw pulses | Not sure? Tap my paw, and I'll show you again. | — | once per save |
| tv_idle_point | 16 s | the paw points at the answer (it never taps it) | Here it is. Tap it when you're ready. | — | every time |
| tv_take_time | 24 s, once | the glow and the paw stay | Take your time, ninja. | — | every time |
| tv_look_glow | ↳ Help, the second press | the answer glows | Look for the glow. | — | every time |

**Help** (Sensei in the corner): the first press says the 8 s rephrase; the second makes the answer glow, with `tv_look_glow`; the third, `tv_idle_point`. On a held step or a Ready hold, the first press says the step again (or `tv_ready_help`) and later presses nudge ▶.

**Hear it again** (the speaker) replays the turn's bundle (NAVIGATION §3.5): the frame on a game's first turn, the naming and the question; never praise or corrections. On a New Sounds turn it is the current sound's whole teaching.

### 5.6 Wrapping up, and moving on

Each closing line says what the child did (specific), is the level's only praise (SCRIPT_STYLE §8), and hands over to the reward by itself (NAVIGATION rule 7).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_w1_end | W1 | every bead lit | That's the end of Ninja Ears. Now watch what happens to your pictures. | — | every time |
| fm_l2_done · tv_rw_link_book | W2 | | You read the pictures, just like a real reader! · Let's put your new pictures in your Sticker Book. | — | every time |
| tv_w3_done | W3 | | You heard sounds at the start of words, and in the middle. Super listening! | — | every time |
| tv_w4_done | W4 | | You read three pictures in a row, the ninja way. | — | every time |
| tv_w5_done · t_if_you_say_sounds ↻ | W5 | | You listened to the sounds, and you heard the words. · If you say the sounds, you can hear the word. | — | every time |
| fm_l6_done | W6 | | Now you're ready to find out how we write the sounds! | — | every time |
| tv_first_done | First Sounds and its Ninja Eyes | | You listened for the first sound in every word, and you found how we write it. | — | every time |
| tv_hunt_done | Sound Hunt | | You heard a sound right in the middle of words. That's tricky, and you did it! | — | every time |
| tv_build_done | an early Word Building level | | You built words with their sounds, and you read them. | — | every time |
| tv_learn_done | a dojo with New Sounds | | You learnt four new sounds today, and you built words with them. | — | every time |
| tv_dojo_review_done | a dojo with no new sounds | | You built lots of words. Your ninja is getting stronger. | — | every time |
| battle_win · tv_battle_why | a monster battle (`tv_battle_why` once per save) | the monster runs away | Hooray! The monster ran away! · Every monster you beat helps us win back the sounds. | — | every time |
| battle_boss_win | a boss | | You beat the boss! What a ninja! | — | every time |
| tv_swap_done | Sound Swap | | You fixed all of Baron's muddled words! | — | every time |
| run_end | Ninja Run | | Bong! You made it to the gong! | — | every time |
| story_end | Story Time | | The end! What a story! | — | every time |
| tv_sort_done | Sorting | | Same sound, different spellings. You sorted them all. | — | every time |
| trial_win | a gem battle | | You won the gem! It's going into its petal! | — | every time |
| tv_review_done | Sensei's Challenge | | You zapped so many words! That was a real challenge. | — | every time |

**Links between two games inside one level** (the jonas-bar judge reversed CB's "no link lines"): a game ends on its wrap, and the next opens with "Next…" or "Now let's…".

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_next_game | a held step between a show and a different game (W2's swap, W4's swap) | ▶ pulses | When you're ready for the next game, tap the green arrow. | taps ▶ | every time |
| tv_next_build | a sound game's level moves on to building (w1-7, w1-11) | the lines and tiles slide in | Next, we're going to build some words with this sound… /i/ | — | every time |
| tv_next_build_plain | the same, with two sounds or none (w1-10) | | Next, we're going to build some words. | — | every time |
| fm_last_one ↻ | before a game's last item, when more than one answer is left (SF C17.3) | | Here's the last one. | — | every time |

First Sounds hands over to Ninja Eyes with `tv_ne_frame` (§3.13 B) or `tv_ne_again` (§3.22).

### 5.7 The moment before a reward, and the reward

*Voice:* a drumroll in the voice for the anticipation line, then plain delight. The reward leads with its news, never "You did it!" (SF C7).

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_to_reward | after the closing line; the save's first three rewards that bring a new sound | the screen softens; a chime | Let's see what you won back from Baron Muddle. | — | first three per save |
| tv_won_one (replaces `petal_got`) | one new sound (Dec8: counted as sounds) | its petal rises and swells on the sound | You won back a sound… /i/ | — | every time |
| tv_won_<n> (replaces `petals_got`) | two to four new sounds | each petal rises on its own sound | You won back two sounds… /m/ /s/ | — | every time |
| fm_rw_more | the session's first two rewards | the stickers fly into the book | More stickers for your Sticker Book! | — | first two per session |
| audit_gem_first | the save's first gem to fill (moved here from w1-4's we do) | a gem pops up and fills | Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up. | taps ▶ | once per save |
| audit_gem_more / r2_gems_more | a gem crosses half full | the gem lifts | Look, this gem has filled a little more. | — | every time |
| flower_i5 | the save's first gem ready (in place of `gem_ready`) | the gem glows | When a gem is full, it glows. Then you can win it in a gem battle! | — | once per save |
| gem_ready | later gems ready | | A gem is glowing! It's ready for a gem battle. | — | every time |
| tv_to_flower | a World Flower trip is due (not the first) | ▶ | Let's take your new sounds to the World Flower. Tap the green arrow. | taps ▶ | every time |
| tv_rest (replaces `dojo_nap`) | where `dojo_nap` was (a long session) | the ninja yawns and stretches | You've practised so much today! Ninjas need rest too. You can stop here, and your ninja will wait for you. | taps ▶ or Home | every time |
| tv_jump_offer (replaces `jump_offer`) | at most once a session, never in the first two (Dec9) | the grown-ups' gear glows | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. | — | Dec9 |
| (none) | the reward holds on ▶, with the idle ladder (§2.3) | ▶ pulses | — | taps ▶ | every time |

**Retired:** `yay_7` "You did it!" as a reward lead after a level with its own closing line; `petal_got` and `petals_got`; `dojo_nap` ("Shall we have a little break?", a question with no answer); `jump_offer` ("Is this too easy?", asked of a 3-year-old).

### 5.8 The map, and coming back

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_welcome_back (replaces `welcome_back`) | the first map of a session | the ninja waves | Welcome back, ninja! I'm so happy to see you. | — | every session |
| world_<n> | the first arrival in a land this session | the land's banner | Welcome to Bamboo Village! | — | once a session |
| tv_map_hint | the save's first two map arrivals; later, as the map's 8 s idle nudge | the next stone bounces, with the pointing hand | The glowing stone is your next game. Tap it when you're ready. | taps the stone | first two per save |
| tv_map_next_<game> | the glowing stone is a game this profile has never played; said after the arrival line, never over the next level | the stone glows | (one recording per game: the table below) | taps the stone | once per save, per game |
| (none) | every other arrival | the ninja walks to the next stone | — | taps the stone | every time |

**The map previews** (`tv_map_next_<game>`, one whole recording each):

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_map_next_<game> (sounds) | before W5 | the stone glows | Next is a new game, called Guess My Word. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (dots) | before W6 | the stone glows | Next is a new game, called Sound Dots. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (firstsound) | before w1-2 | the stone glows | Next is a new game, called First Sounds. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (build) | before w1-4 | the stone glows | Next is a new game, called Word Building. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (battle) | before w1-6 | the stone glows | Next is a Monster Battle. Baron Muddle's monsters are guarding the sounds. Tap the glowing stone, if you're brave. | taps the stone | once per save |
| tv_map_next_<game> (soundhunt) | before w1-7 | the stone glows | Next is a new game, called Sound Hunt. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (swap) | before w1-8 | the stone glows | Next is a new game, called Sound Swap. Baron Muddle has mixed up some words! Tap the glowing stone to fix them. | taps the stone | once per save |
| tv_map_next_<game> (run) | before w1-9 | the stone glows | Next is a new game, called Ninja Run. Tap the glowing stone to play. | taps the stone | once per save |
| tv_map_next_<game> (story) | before w1-14 | the stone glows | Next is Story Time. Tap the glowing stone to open the book. | taps the stone | once per save |
| tv_map_next_<game> (boss) | before w1-15 | the stone glows | Next is the boss of Bamboo Village. Tap the glowing stone, if you're ready. | taps the stone | once per save |
| tv_map_next_<game> (learn) | before w2-1 | the stone glows | Next is the dojo. You'll learn some new sounds there. Tap the glowing stone to go. | taps the stone | once per save |
| tv_map_next_<game> (sort) | before w6-br1 | the stone glows | Next is a new game, called Sorting. Tap the glowing stone to play. | taps the stone | once per save |

The stone tap is the child's "yes" to a map preview, so the level itself can start with who does what. `map_hint` "…start your next adventure" retires ("adventure" is abstract).

### 5.9 The lead-ins that replace a bare "Listen…"

`listen` ("Listen…") never opens a game, a beat, a turn or a level (F4's `bare-listen` check). These take its place. Each ends suspended and says what is coming.

| line id | trigger | on screen | exact text | the child does | first time or replay |
|---|---|---|---|---|---|
| tv_first_sound / tv_next_sound | a sound game's sound | the petal | Our first sound is… / Our next sound is… | — | every time |
| tv_here_sound | a sound presented on its own | the petal | Here's the sound… | — | every time |
| tv_learn_first / tv_learn_next / tv_learn_another / tv_learn_last | New Sounds | the misty petal | Here's the first new sound. Get your ninja ears ready. / Here's the next new sound… / Here's another new sound… / Here's the last new sound… | — | every time |
| tv_here_it_comes | New Sounds, the first sound | | Here it comes… | — | every time |
| tv_guess_q | oral blending (Sounds~Write's "listen for the word"): Guess My Word and Ninja Run | the dots | Listen for the word… | — | every time |
| tv_slow_yours | Slow Words | | Here's your slow word… | — | every time |
| tv_swap_both | Sound Swap, Sound Hunt | the lines, or the cards | Listen to them both… | — | every time |
| tv_last_first | the first "last sound" of a save | the last line | Now the last sound. Listen right to the end… | — | once per save |
| tv_fix_start / tv_fix_middle | corrections | the petal | Listen for the start… / Listen for the middle… | — | every time |
| tv_listen_sound_again | an idle rephrase | the petal | Listen to my sound again… | — | every time |


---
## 6. Timings: talk before the child can act, first meetings

Estimated from the tables by [`head-writer-runs.py`](../playtest/runs/teacher-voice/head-writer-runs.py), with the drafts' and judges' constants: 2.7 words a second, 0.35 s between clips, a pure sound 0.55 s, a word 0.65 s, a stretched word 1.65 s, a held first sound 0.9 s. A run starts at a tap the game registers and ends where the line that cues the next one **starts** (the child can act from its first word). A "say it with me" is **not** counted as a break, because the game can't hear it (the three-year-old judge's rule). The recorded samples ran at 2.1–3.8 words a second (§7.4), so these are estimates. F4's `talk-before-action` check on a frozen build is the judge.

| Run (first meeting) | Words | Est. s | Today |
|---|---|---|---|
| Choose: the screen → the ninja cards live | 11 | 4.4 | – |
| Opt-in: the cards land → the spotlit teddy line (the cards work from 0 s) | 15 | 6.3 | 6.2 |
| Welcome: the start → the gong | 22 | 8.8 | 2.9 |
| W1 Ninja Ears: ▶ → Ready | 27 | 11.4 | 10.7 (no frame, no real demo) |
| W1 the rabbit and the tortoise: the sock → Ready | 19 | 12.1 | 19.5 |
| W1 the tortoise → the rabbit | 17 | 8.6 | – |
| W1 the rabbit → "Tap the sun" | 21 | 9.5 | – |
| W1 the sock → the petal | 8 | 5.5 | 11.7 |
| W1 Pocket Hunt: the petal → Ready | 24 | 12.1 | 8.5 |
| W2 Ninja Reading: ▶ → Ready | 26 | 10.7 | 10.2 |
| W2 two rows: ▶ → Ready | 26 | 10.7 | (no demo) |
| W2 Word Squish: the last row → Ready | 26 | 11.7 | – |
| W3 the rabbit and the tortoise (recap): the stone → the tortoise | 17 | 9.3 | 12.1 |
| W3 Slow Words: the rabbit → Ready | 21 | 11.8 | 17.5 |
| W3 Pocket Hunt (middle): the last tap → the petal | 19 | 9.6 | 9.8 |
| W3 Pocket Hunt (middle): the petal → Ready | 17 | 10.2 | – |
| W5 Guess My Word: the stone → Ready | 22 | 11.9 | 17.0 |
| W6 Sound Dots: the stone → Ready | 20 | 12.2 | 10.9 |
| w1-2 First Sounds: the stone → the petal | 20 | 9.0 | 23.3 |
| w1-2 the petal → Ready | 20 | 11.9 | – |
| w1-2 Ninja Eyes: the last find → the first tile | 20 | 9.0 | – |
| w1-4 Word Building: the stone → the word card | 23 | 9.2 | 31.4 |
| w1-4 the card → "Can you find the last one?" | 13 | 11.8 | – |
| w1-4 the last tile → Ready | 9 | 7.4 | – |
| w1-4 Kai and Suki: the last build → the sound buttons | 23 | 12.0 | – |
| w1-6 Monster Battle: the stone → the word card | 20 | 8.1 | 5.9 (the letters live from the first frame) |
| w1-6 the card → "Can you find the last one?" | 10 | 6.3 | – |
| w1-7 Sound Hunt: the stone → the petal | 16 | 7.5 | 29.0 |
| w1-7 the petal → Ready | 20 | 12.3 | – |
| w1-8 Sound Swap: the stone → the sound buttons | 9 | 3.7 | 14.4 |
| w1-8 the read → Ready to watch | 13 | 6.2 | – |
| w1-8 ▶ → "Can you tap it, and kick it out?" | 8 | 8.7 | – |
| w1-8 the kick → Ready | 3 | 7.0 | – |
| w1-9 Ninja Run: the stone → the practice jump | 12 | 4.8 | 8.4 |
| w1-9 the jump → Ready | 15 | 6.3 | – |
| w1-14 Story Time: the stone → ▶ | 19 | 10.7 | 16.8 |
| w1-15 the boss: the stone → Ready (5.7 s of it is Baron's cut-in) | 16 | 12.3 | 10.7 |
| **w2-1 New Sounds: the stone → Ready** | **29** | **11.4** | **10.6, ending on a bare "Listen…"** |
| **w2-1 ▶ → the petal (the first sound)** | **22** | **11.5** | – |
| w2-1 the petal → the letter (with a 2 s spell) | 11 | 8.6 | – |
| w2-1 the next sound: the last letter → the petal | 12 | 8.3 | – |
| w6-br1 Sorting (age 5): the stone → the first chest | 29 | 11.4 | 18.2 |
| w6-br1 the last chest → Ready (age 5; the letters line not due) | 28 | 12.8 | – |
| The first gem battle (age 5+): the stone → Ready | 21 | 8.5 | – |

**The runs estimated over 12.0 s, and why they stay:**
- **W1 the rabbit and the tortoise (12.1 s) and Pocket Hunt (12.1 s):** within estimate noise, with a new visual every 3 s (the rabbit and tortoise pop in, the hop, the stretch; the paw, the pocket). If the bot measures more than 12.5 s, cut `tv_ts_meet` to "Meet the rabbit and the tortoise." and `tv_pocket_frame` to "In Pocket Hunt, we find pictures with this sound."
- **W6 Sound Dots (12.2 s):** the demo is the dots lighting one by one. If over, drop "Then" from `tv_dots_word_ido`.
- **w1-7 Sound Hunt (12.3 s):** if over, `tv_ido_pair_pan_pin` drops "I'll go first." (the child has met the I do routine in three First Sounds levels).
- **w1-15 the boss (12.3 s):** 5.7 s of it is Baron's cut-in, which is spectacle, not explanation.
- **w6-br1 Sorting (12.8 s):** a 5-year-old's game, within age 5's limits (18 s before the first action).

**What it costs.** W1 goes from 5 child actions to 11, and from about 180 to about 215 words of Sensei; every extra word is paid for with a tap (the three-year-old judge's §2). The first-minutes clock (title to map, FIRST_MINUTES §14) grows by about 25 s for a quick child, all of it the child's own turns: the cap moves from 5:00 to 5:30, once the bot has re-measured it (mechanics §5.4). Replays get shorter than today: one line in place of the labels, stems and stacked praise.

---

## 7. The lines

### 7.1 New lines to record (339 ids)

**339 new ids:** 314 single lines and 25 generated families (about 59 recordings for the words, sounds, pairs, counts and games on this path). Of them, 246 are on the preschool path (§3), 54 are recap and short forms or games a preschool child doesn't meet before w2-1 (§4), and 39 are the recurring moves (§2.3, §5). The median line is 9 words. The only lines under 4 words are lead-ins that end on a slot ("Here it comes…"), questions ("Which sound changes?") and praise ("You found it!", "Good jumping!").

Record them as whole sentences with `gen-audio.ts` (Sulafat, en-GB, plain text only: Gemini TTS reads directions aloud), in one owned block at the end of `LINES`: `// --- Teacher voice (docs/TEACHER_SCRIPT.md, 27 Sep).` A lead-in ends on ASCII "..." so `gen-audio.ts` checks its tail. Generated families are made by the line generator, one whole recording per member, the way `fm_name_<w>` and `fs_<w>` are.

The table below is generated from this document's tables by [`extract-lines.py`](../playtest/runs/teacher-voice/extract-lines.py), which also checks that every id has one text, and that every kept, re-recorded and replaced id exists in `src/content`. Rerun it after any change.

| # | § | line id | exact text (slots removed; a lead-in ends on "…") |
|---|---|---|---|
| 1 | 2.3 | `tv_ready_first` | Look, your ninja is ready. Are you ready too? Tap the green arrow. |
| 2 | 2.3 | `tv_ready_paw` | Do you want to have a go now? Tap the green arrow. Or tap my paw to see it again. |
| 3 | 2.3 | `tv_show_again` | Of course. Watch my paw again. |
| 4 | 2.3 | `tv_ready_now` | Are you ready to have a go now? |
| 5 | 2.3 | `tv_ready_go` | Do you want to have a go now? |
| 6 | 2.3 | `tv_ready_together` | Let's do the next one together. Are you ready? |
| 7 | 2.3 | `tv_ready_yours` | Now you do one. Are you ready? |
| 8 | 2.3 | `tv_ready_to_watch` | I'll show you first. Are you ready to watch? Tap the green arrow. |
| 9 | 2.3 | `tv_turn_again` | Now it's your turn again. |
| 10 | 2.3 | `tv_offer_show` | Or I can show you again. Just tap my paw. |
| 11 | 2.3 | `tv_ready_help` | When you're ready, tap the green arrow. To see it again, tap my paw. |
| 12 | 3.1 | `tv_film_arrow` | When you're ready to see what happens next, tap the green arrow. |
| 13 | 3.2 | `tv_choose_q` | First, choose your ninja. Will it be Kai, or Suki? |
| 14 | 3.2 | `tv_choose_hello` | Hello! I'm Sensei Maple, and I'm going to be your teacher. |
| 15 | 3.2 | `tv_choose_why` | Baron Muddle took the sounds away. We'll win them back by playing games together. |
| 16 | 3.2 | `tv_choose_ninja` | Your ninja will play every game with you. |
| 17 | 3.3 | `tv_opt_why` | First, let's find the right games for you. |
| 18 | 3.3 | `tv_opt_notyet` | If you don't go yet, tap the teddy. |
| 19 | 3.3 | `tv_opt_yes` | If you do, tap the school. |
| 20 | 3.3 | `tv_opt_echo_notyet` | Not yet. That's fine. |
| 21 | 3.3 | `tv_opt_echo_school` | You go to big school. |
| 22 | 3.3 | `tv_opt_again` | If you don't go yet, tap the teddy. If you do, tap the school. |
| 23 | 3.3 | `tv_opt_ask` | Ask a grown-up to help you choose. |
| 24 | 3.3 | `tv_opt_ok_notyet` | Then we'll start with some listening games, just for you. |
| 25 | 3.3 | `tv_opt_grownups` | Grown-ups, you can change this later in the settings. |
| 26 | 3.3 | `tv_opt_to_dojo` | Now come with me to the dojo. Tap the green arrow. |
| 27 | 3.4 | `tv_train_tricks` | I'll teach you three ninja tricks. Each one wins a star. |
| 28 | 3.4 | `tv_train_help` | Here's trick two. If you're ever stuck, tap me, down here in the corner. |
| 29 | 3.4 | `tv_train_speaker` | Here's trick three, the speaker. First, listen to my little ninja rhyme. |
| 30 | 3.4 | `tv_train_hello` | Welcome to my dojo. A dojo is a school for ninjas. |
| 31 | 3.4 | `tv_train_gong` | Trick one is the gong. Tap it, and your ninja will kick it. |
| 32 | 3.4 | `tv_train_gong_ok` | Bong! That's your first star. |
| 33 | 3.4 | `tv_train_try_help` | Can you tap me now? |
| 34 | 3.4 | `tv_rhyme` | Tip, tap, tiptoe, quiet as a mouse. |
| 35 | 3.4 | `tv_train_hear_again` | Tap the speaker, and I'll say it again. |
| 36 | 3.4 | `tv_train_speaker_ok` | That's it! The speaker always says it again. |
| 37 | 3.4 | `tv_train_done` | Three tricks, three stars. Now you're ready for your first game. |
| 38 | 3.4 | `tv_first_game` | It's a listening game, called Ninja Ears. Tap the green arrow when you're ready. |
| 39 | 3.5 | `tv_pocket_ready_<n>` | Now you find the other three. Are you ready? / Now you find the other two. Are you ready? |
| 40 | 3.5 | `tv_ts_meet` | Here are my friends, the rabbit and the tortoise. |
| 41 | 3.5 | `tv_ts_fast` | The rabbit says words fast… |
| 42 | 3.5 | `tv_ts_slow` | The tortoise says them slowly… |
| 43 | 3.5 | `tv_ears_on` | Look, your ninja has its ninja ears on. That means listening really carefully. |
| 44 | 3.5 | `tv_petal_first` | That sound has its very own petal. Tap the petal, and say the sound with me. |
| 45 | 3.5 | `tv_pocket_frame` | In Pocket Hunt, we find pictures that start with this sound. |
| 46 | 3.5 | `tv_so_pocket` | So into the pocket it goes! |
| 47 | 3.5 | `tv_ears_frame` | I'll say a word. Then you find its picture. |
| 48 | 3.5 | `tv_ears_demo` | I'll go first. My word is sun… There it is! |
| 49 | 3.5 | `tv_your_word_<w>` | Your word is sock. Can you find the sock? |
| 50 | 3.5 | `tv_find_again_<w>` | Can you find the sock? |
| 51 | 3.5 | `tv_idle_look_<w>` | Have a look at each picture. Where's the sock? |
| 52 | 3.5 | `tv_show_offer` | Not sure? Tap my paw, and I'll show you again. |
| 53 | 3.5 | `tv_idle_point` | Here it is. Tap it when you're ready. |
| 54 | 3.5 | `tv_fix_together` | Let's do it together. It's this one. Now you tap it. |
| 55 | 3.5 | `tv_same_word` | Fast or slow, it's the same word. When I say it slowly, I can hear its sounds. |
| 56 | 3.5 | `tv_ts_wrong_rabbit` | That's my rabbit. It says words fast. Now tap the tortoise to say it slowly. |
| 57 | 3.5 | `tv_ts_wrong_tortoise` | That's my tortoise. It says words slowly. Now tap the rabbit to say it fast. |
| 58 | 3.5 | `tv_notice_frame` | Now let's listen for the very first sound. |
| 59 | 3.5 | `tv_tap_hear_<w>` | Tap the sun, and listen to how it starts. |
| 60 | 3.5 | `tv_now_tap_hear_<w>` | Now tap the sock, and listen to how it starts. |
| 61 | 3.5 | `tv_pocket_ido` | I'll find one first. |
| 62 | 3.5 | `tv_fix_start` | Listen for the start… |
| 63 | 3.5 | `tv_petal_hint` | Tap the petal if you want to hear the sound again. |
| 64 | 3.5 | `tv_w1_end` | That's the end of Ninja Ears. Now watch what happens to your pictures. |
| 65 | 3.6 | `tv_rw_book` | This is your Sticker Book! Tap it to open it. |
| 66 | 3.6 | `tv_rw_every` | Every picture you play with becomes a sticker. |
| 67 | 3.6 | `tv_rw_tap` | Tap a sticker, and it will say its word. |
| 68 | 3.6 | `tv_rw_fast_slow` | Fast, then slow, like the rabbit and the tortoise! |
| 69 | 3.6 | `tv_rw_next` | Next, we're going to read some pictures, the ninja way. Tap the green arrow when you're ready. |
| 70 | 3.7 | `tv_rail_ready` | Now you read them. Do you want to have a go? |
| 71 | 3.7 | `tv_squish_ready` | Two little words make one big word. Now you make one. Are you ready? |
| 72 | 3.7 | `tv_next_game` | When you're ready for the next game, tap the green arrow. |
| 73 | 3.7 | `tv_rail_frame` | Let's play Ninja Reading. Ninjas always start on this side, and go this way. |
| 74 | 3.7 | `tv_which_frame` | Here are two rows of pictures. I'll read one, and you tap it. |
| 75 | 3.7 | `tv_rail_ido` | I'll read them first. Then you read them. |
| 76 | 3.7 | `tv_rail_turn` | Tap each picture, starting on this side. |
| 77 | 3.7 | `tv_silly` | What a silly animal! |
| 78 | 3.7 | `tv_rail_start` | Ninjas start on this side. Tap this one first. |
| 79 | 3.7 | `tv_which_demo` | I'll go first. Fish… dog. |
| 80 | 3.7 | `tv_which_so` | Fish came first. So I tap this row. |
| 81 | 3.7 | `tv_which_q_<pair>` | Here I go. Cat… dog. Which row did I read? |
| 82 | 3.7 | `tv_which_fix_<pair>` | Let's listen again. Cat… dog. Which row has the cat first? |
| 83 | 3.7 | `tv_squish_frame` | Here's a new game, called Word Squish. |
| 84 | 3.7 | `tv_squish_slow` | I tap the tortoise, and say them slowly. Sun… flower. |
| 85 | 3.7 | `tv_squish_fast` | Then I tap the rabbit, and squish them. Sunflower! |
| 86 | 3.7 | `tv_praise_squish` | You squished them into one big word! |
| 87 | 3.7 | `tv_pocket_more_<p>` | One more Pocket Hunt. Find the pictures that start with… |
| 88 | 3.7 | `tv_rw_link_book` | Let's put your new pictures in your Sticker Book. |
| 89 | 3.8 | `tv_rw2_flower` | This is the World Flower. Your sounds make it shine. |
| 90 | 3.8 | `tv_map_intro` | This is the map of Bamboo Village. Every stone is a game. |
| 91 | 3.8 | `tv_rw2_tap_petal` | Tap your petal, and hear its sound. |
| 92 | 3.8 | `tv_map_flower` | And your World Flower lives here. |
| 93 | 3.8 | `tv_map_hint` | The glowing stone is your next game. Tap it when you're ready. |
| 94 | 3.9 | `tv_ts_again` | Here come the rabbit and the tortoise again. |
| 95 | 3.9 | `tv_ts_slow_one` | The tortoise says it slowly… |
| 96 | 3.9 | `tv_praise_slowly` | You said it slowly, just like the tortoise. |
| 97 | 3.9 | `tv_slow_frame` | Let's play Slow Words. I say a word slowly. You find its picture. |
| 98 | 3.9 | `tv_slow_demo` | Here's my slow word… |
| 99 | 3.9 | `tv_i_hear_<w>` | I can hear mug! |
| 100 | 3.9 | `tv_slow_yours` | Here's your slow word… |
| 101 | 3.9 | `tv_slow_again` | Let's listen again… |
| 102 | 3.9 | `tv_pocket_middle` | It's Pocket Hunt again. This time, the sound is hiding in the middle of the words. |
| 103 | 3.9 | `tv_here_sound` | Here's the sound… |
| 104 | 3.9 | `tv_new_petal_say` | It's a new sound. Tap its petal, and say it with me. |
| 105 | 3.9 | `tv_hear_middle` | I can hear it in the middle. |
| 106 | 3.9 | `tv_fix_middle` | Listen for the middle… |
| 107 | 3.9 | `tv_w3_done` | You heard sounds at the start of words, and in the middle. Super listening! |
| 108 | 3.10 | `tv_rail_again` | It's Ninja Reading again. This time, there are three pictures. |
| 109 | 3.10 | `tv_rail_yours` | Now you read them. |
| 110 | 3.10 | `tv_which_again` | Here are two rows again. I'll read one, and you tap it. |
| 111 | 3.10 | `tv_which_q_<three>` | Here I go. Fish… dog… cat. Which row did I read? |
| 112 | 3.10 | `tv_which_fix_<three>` | Let's listen again. Fish… dog… cat. Which row has the fish first? |
| 113 | 3.10 | `tv_squish_again` | It's Word Squish again. Two little words make one big word. |
| 114 | 3.10 | `tv_w4_done` | You read three pictures in a row, the ninja way. |
| 115 | 3.10 | `tv_practise_again` | That game was a bit tricky. Let's play it once more. |
| 116 | 3.11 | `tv_guess_frame` | I'll say the sounds, and you listen for the word. |
| 117 | 3.11 | `tv_my_sounds` | My sounds are… |
| 118 | 3.11 | `tv_guess_so_<w>` | I can hear sun. So I tap the sun. |
| 119 | 3.11 | `tv_guess_q` | Listen for the word… |
| 120 | 3.11 | `tv_guess_together` | Let's say it together. |
| 121 | 3.11 | `tv_guess_again` | Let's listen again… |
| 122 | 3.11 | `tv_w5_done` | You listened to the sounds, and you heard the words. |
| 123 | 3.12 | `tv_dots_ready` | Now you tap the dots, and say the sounds with me. Are you ready? |
| 124 | 3.12 | `tv_dots_frame` | Every dot is one sound in the word. |
| 125 | 3.12 | `tv_dots_ido` | I start here, and go this way. |
| 126 | 3.12 | `tv_dots_word_ido` | Then I say the word… |
| 127 | 3.12 | `tv_now_say_word` | Now say the whole word… |
| 128 | 3.13 | `tv_watch_write` | Now watch my ninja write it. |
| 129 | 3.13 | `tv_how_we_write` | This is how we write… |
| 130 | 3.13 | `tv_first_frame` | In First Sounds, I say a sound, and you find the picture that starts with it. |
| 131 | 3.13 | `tv_first_sound` | Our first sound is… |
| 132 | 3.13 | `tv_petal_say` | Tap the petal, and say it with me. |
| 133 | 3.13 | `tv_ido_pair_<pair>` | I'll go first. Here's a bed and a sock. (and the other variants in its section) |
| 134 | 3.13 | `tv_let_me_listen` | Hmm, let me listen. |
| 135 | 3.13 | `tv_so_i_tap` | So I'll tap it. |
| 136 | 3.13 | `tv_tap_it_say` | Now you tap it, and say the sound. |
| 137 | 3.13 | `tv_by_yourself` | Now you do one all by yourself. |
| 138 | 3.13 | `tv_praise_start` | You listened right to the very start. |
| 139 | 3.13 | `tv_next_sound_known` | Our next sound is one you know… |
| 140 | 3.13 | `tv_together` | Let's do this one together. |
| 141 | 3.13 | `tv_and_how_we_write` | And this is how we write… |
| 142 | 3.13 | `tv_mix_up` | Now it could be either sound. Listen carefully to my sound. |
| 143 | 3.13 | `tv_ne_frame` | Next, a game called Ninja Eyes. I say a sound, and you find how we write it. |
| 144 | 3.13 | `tv_which_write` | Which of these is the way we write… |
| 145 | 3.13 | `tv_find_write` | Find how we write… |
| 146 | 3.13 | `tv_now_find` | Now find how we write… |
| 147 | 3.13 | `tv_thats_write` | That's how we write… |
| 148 | 3.13 | `tv_first_done` | You listened for the first sound in every word, and you found how we write it. |
| 149 | 3.14 | `tv_to_reward` | Let's see what you won back from Baron Muddle. |
| 150 | 3.14 | `tv_won_<n>` | You won back two sounds… |
| 151 | 3.14 | `tv_to_flower_first` | Now let's go and see where your sounds live. Tap the green arrow. |
| 152 | 3.14 | `tv_flower_petal` | Every petal is one sound. This is the petal for… |
| 153 | 3.14 | `tv_flower_tap` | Tap it, and hear its sound. |
| 154 | 3.14 | `tv_another_sound` | And here's another new sound… |
| 155 | 3.14 | `tv_flower_bye` | Your World Flower is waiting for more sounds. Let's go and find them! |
| 156 | 3.15 | `tv_next_sound` | Our next sound is… |
| 157 | 3.15 | `tv_first_again_new` | It's First Sounds again, with two new sounds. |
| 158 | 3.15 | `tv_first_recap` | It's First Sounds again. I say a sound, and you find the picture that starts with it. |
| 159 | 3.15 | `tv_ne_again` | Now let's play Ninja Eyes. |
| 160 | 3.16 | `tv_build_lines` | Each line is for one sound. |
| 161 | 3.16 | `tv_word_card` | This card is my word. Tap it, and hear the word. |
| 162 | 3.16 | `tv_readers_meet` | Look, it's Kai and Suki. They're learning to read, like you. |
| 163 | 3.16 | `tv_your_word` | Your word is… |
| 164 | 3.16 | `tv_build_frame` | This game is called Word Building. I say a word, and we build it with its sounds. |
| 165 | 3.16 | `tv_i_say_slowly` | I say it slowly… |
| 166 | 3.16 | `tv_first_is` | The first sound is… |
| 167 | 3.16 | `tv_you_find_last` | Can you find the last one? |
| 168 | 3.16 | `tv_lets_say_read` | Now let's say the sounds… and read the word. |
| 169 | 3.16 | `tv_build_ready` | Now let's build one together. Are you ready? |
| 170 | 3.16 | `tv_our_word` | Here's our word… |
| 171 | 3.16 | `tv_last_first` | Now the last sound. Listen right to the end… |
| 172 | 3.16 | `tv_by_yourself_build` | Now you build one all by yourself. |
| 173 | 3.16 | `tv_praise_built` | You built that whole word by yourself! |
| 174 | 3.16 | `tv_rc_how` | They'll both read this word. Only one of them reads it right. |
| 175 | 3.16 | `tv_you_read_first` | First, you read it. Tap each sound, and say it with me. |
| 176 | 3.16 | `tv_now_readers` | Now listen to Kai and Suki read it. |
| 177 | 3.16 | `tv_rc_q` | Who read it right? Tap Kai, or tap Suki. |
| 178 | 3.16 | `tv_yes_<reader>` | Yes! Suki read it right. |
| 179 | 3.16 | `tv_lets_check` | Let's check. Say the sounds with me… |
| 180 | 3.16 | `tv_right_<reader>` | Suki read it right. |
| 181 | 3.16 | `tv_build_done` | You built words with their sounds, and you read them. |
| 182 | 3.17 | `tv_build_again_3` | It's Word Building again. This word has three sounds, so there are three lines. |
| 183 | 3.17 | `tv_next_middle` | Now the next sound. It's in the middle… |
| 184 | 3.17 | `tv_readers_back` | Kai and Suki are back. You read it first, then they read it. |
| 185 | 3.18 | `tv_battle_ready` | That's how we spell a word. Now you spell one. Are you ready to zap it? |
| 186 | 3.18 | `tv_bar_down` | Zap! Look, its bar went down. |
| 187 | 3.18 | `tv_battle_oh_no` | Oh no! One of Baron Muddle's monsters is in the way! |
| 188 | 3.18 | `tv_battle_frame` | We zap it with words, just like Word Building. |
| 189 | 3.18 | `tv_battle_card` | I'll zap the first one. Tap my word card, and hear the word. |
| 190 | 3.18 | `tv_next_word` | Here's your next word… |
| 191 | 3.18 | `tv_battle_why` | Every monster you beat helps us win back the sounds. |
| 192 | 3.19 | `tv_next_build` | Next, we're going to build some words with this sound… |
| 193 | 3.19 | `tv_hunt_frame` | In Sound Hunt, the sound is hiding in the middle of the word. |
| 194 | 3.19 | `tv_swap_both` | Listen to them both… |
| 195 | 3.19 | `tv_hunt_q` | Which one has this sound in the middle… |
| 196 | 3.19 | `tv_praise_middle` | You heard it, right in the middle. |
| 197 | 3.19 | `tv_not_in_middle` | That one has a different sound in the middle. |
| 198 | 3.19 | `tv_hunt_done` | You heard a sound right in the middle of words. That's tricky, and you did it! |
| 199 | 3.20 | `tv_swap_ready` | Now you swap one. Do you want to have a go? |
| 200 | 3.20 | `tv_swap_oh_dear` | Oh dear. Baron Muddle has been muddling up words. |
| 201 | 3.20 | `tv_swap_read_first` | First, let's read this word. Tap each sound, and say it with me. |
| 202 | 3.20 | `tv_swap_frame` | In Sound Swap, we change just one sound, to make a new word. |
| 203 | 3.20 | `tv_swap_change_to` | I'll change it to… |
| 204 | 3.20 | `tv_swap_kick` | The first sound changes. Can you tap it, and kick it out? |
| 205 | 3.20 | `tv_swap_in` | And in goes… |
| 206 | 3.20 | `tv_swap_now_change` | Now let's change it to… |
| 207 | 3.20 | `tv_swap_pick` | Now tap the new one. |
| 208 | 3.20 | `tv_praise_swap` | You changed just one sound. |
| 209 | 3.20 | `tv_swap_done` | You fixed all of Baron's muddled words! |
| 210 | 3.21 | `tv_run_ready` | Are you ready? Tap the green arrow, and off we go! |
| 211 | 3.21 | `tv_run_lanterns` | Here come the lanterns. I'll say the sounds of a word. |
| 212 | 3.21 | `tv_run_frame` | This game is called Ninja Run. Your ninja runs all by itself. |
| 213 | 3.21 | `tv_run_jump` | Tap anywhere to make your ninja jump. Can you try it now? |
| 214 | 3.21 | `tv_run_jump_ok` | Good jumping! |
| 215 | 3.21 | `tv_run_lanterns_how` | When the lanterns come, I'll say some sounds, and you catch the word. |
| 216 | 3.21 | `tv_run_which` | Tap the lantern with my word. |
| 217 | 3.21 | `tv_run_fix` | That's a different word. Listen again… |
| 218 | 3.22 | `tv_next_build_plain` | Next, we're going to build some words. |
| 219 | 3.22 | `tv_hunt_again` | It's Sound Hunt again, with a new sound. |
| 220 | 3.22 | `tv_swap_again` | It's Sound Swap again. We change one sound to make a new word. |
| 221 | 3.22 | `tv_show_offer_short` | If you'd like to see me do one first, tap my paw. |
| 222 | 3.22 | `tv_battle_again` | Another monster! Let's zap it with words. |
| 223 | 3.23 | `tv_story_tick` | When you've read it all, tap the green tick. |
| 224 | 3.23 | `tv_story_frame` | Story time! I'll read some pages to you, and you'll read some pages to me. |
| 225 | 3.23 | `tv_story_title` | This story is called… |
| 226 | 3.23 | `tv_story_begin` | Tap the green arrow, and let's begin. |
| 227 | 3.23 | `tv_story_yours` | This page is yours. Say the sounds, and read each word. |
| 228 | 3.23 | `tv_story_help` | If you get stuck, tap a word, and I'll help. |
| 229 | 3.23 | `tv_story_together` | Let's read it together. |
| 230 | 3.23 | `tv_story_choice` | Now you choose what happens. Read the two words, and tap one. |
| 231 | 3.23 | `tv_story_q` | Now a question about the story. |
| 232 | 3.23 | `tv_story_tick_idle` | When you've read it, tap the green tick. |
| 233 | 3.24 | `tv_boss_ready` | Are you ready to beat the boss? Tap the green arrow. |
| 234 | 3.24 | `tv_boss_calm` | Don't worry, ninja. You know what to do. |
| 235 | 3.24 | `tv_boss_frame` | A boss takes lots of words to beat. |
| 236 | 3.25 | `tv_map_next_<game>` | (one recording per game: the table below) (and the other variants in its section) |
| 237 | 3.25 | `tv_flower_recap` | Here's a sound you learnt… |
| 238 | 3.26 | `tv_learn_ready` | Are you ready for the first one? Tap the green arrow. |
| 239 | 3.26 | `tv_learn_frame_<n>` | Today in the dojo, I'm going to teach you four new sounds. |
| 240 | 3.26 | `tv_learn_how` | I'll say each sound, and show you how we write it. Then you say it with me. |
| 241 | 3.26 | `tv_learn_first` | Here's the first new sound. Get your ninja ears ready. |
| 242 | 3.26 | `tv_here_it_comes` | Here it comes… |
| 243 | 3.26 | `tv_tap_letter_say` | Now you tap it, and say the sound. |
| 244 | 3.26 | `tv_once_more` | Tap it once more, and say it again. |
| 245 | 3.26 | `tv_said_well` | Good, you said that sound really well. |
| 246 | 3.26 | `tv_learn_next` | Here's the next new sound… |
| 247 | 3.26 | `tv_petal_say_short` | Tap its petal, and say it. |
| 248 | 3.26 | `tv_tap_it_say_short` | Now you tap it, and say it. |
| 249 | 3.26 | `tv_learn_another` | Here's another new sound… |
| 250 | 3.26 | `tv_learn_last` | Here's the last new sound… |
| 251 | 3.26 | `tv_learn_all_<n>` | Four new sounds! You said every one. |
| 252 | 3.26 | `tv_dojo_idle_say` | Tap the letter, and say the sound with me… |
| 253 | 3.26 | `tv_dojo_help_sound` | Here's the sound again… |
| 254 | 3.26 | `tv_x_two_sounds` | This spelling is two sounds together. |
| 255 | 3.26 | `tv_ne_new_sounds` | Now let's play Ninja Eyes, with your new sounds. |
| 256 | 3.26 | `tv_build_dojo` | Now let's build some words with your new sounds. |
| 257 | 3.26 | `tv_learn_done` | You learnt four new sounds today, and you built words with them. |
| 258 | 4.1 | `tv_now_your_turn` | Now it's your turn. |
| 259 | 4.1 | `tv_pocket_recap` | It's Pocket Hunt again. We find pictures that start with this sound. |
| 260 | 4.1 | `tv_pocket_middle_more_<p>` | One more Pocket Hunt. Find the pictures with this sound in the middle… |
| 261 | 4.1 | `tv_slow_recap` | It's Slow Words again. I say a word slowly, and you find its picture. |
| 262 | 4.1 | `tv_slow_short` | Let's play Slow Words again. |
| 263 | 4.1 | `tv_guess_recap` | It's Guess My Word again. I'll say the sounds, and you listen for the word. |
| 264 | 4.1 | `tv_guess_short` | Let's play Guess My Word again. |
| 265 | 4.1 | `tv_dots_recap` | It's Sound Dots again. Every dot is one sound in the word. |
| 266 | 4.1 | `tv_dots_short` | It's Sound Dots again. Tap the dots, and say the sounds with me. |
| 267 | 4.1 | `tv_first_again_known` | It's First Sounds again. Let's see which sounds you know. |
| 268 | 4.1 | `tv_ne_recap` | It's Ninja Eyes again. I say a sound, and you find how we write it. |
| 269 | 4.1 | `tv_hunt_recap` | It's Sound Hunt again. The sound is hiding in the middle of the word. |
| 270 | 4.1 | `tv_build_recap` | It's Word Building again. I say a word, and we build it with its sounds. |
| 271 | 4.1 | `tv_build_again_short` | Let's build some more words. |
| 272 | 4.1 | `tv_battle_recap` | Another of Baron's monsters! You know how to zap it. Find the sounds in each word. |
| 273 | 4.1 | `tv_battle_go` | Are you ready to zap it? Tap the green arrow. |
| 274 | 4.1 | `tv_boss_again` | Oh no, another boss! Don't worry. You know just what to do. |
| 275 | 4.1 | `tv_run_again` | It's Ninja Run again! Are you ready? Tap the green arrow, and off we go! |
| 276 | 4.1 | `tv_story_recap` | Story time! I'll read some pages, and you'll read some too. |
| 277 | 4.1 | `tv_story_short` | Story time! |
| 278 | 4.1 | `tv_learn_recap_<n>` | Back to the dojo, for three new sounds. You know how this goes. |
| 279 | 4.1 | `tv_learn_short_<n>` | Back to the dojo. Today there are three new sounds. |
| 280 | 4.1 | `tv_learn_first_short` | Here's the first new sound… |
| 281 | 4.2 | `tv_trial_ready` | The bar starts when you're ready. Tap the green arrow. |
| 282 | 4.2 | `tv_trial_heart` | The bar filled up, so you lost a heart. That's fine. Keep going. |
| 283 | 4.2 | `tv_trial_short` | It's a gem battle! Spell each word before the bar is full. Tap the green arrow when you're ready. |
| 284 | 4.2 | `tv_trial_frame` | This is a gem battle. Win it, and the gem is yours. |
| 285 | 4.2 | `tv_trial_bar` | Spell each word before this purple bar is full. |
| 286 | 4.3 | `tv_sort_recap` | It's Sorting again. Every word goes in the chest with the same spelling. |
| 287 | 4.3 | `tv_sort_frame` | This game is called Sorting. Every word goes in the chest with the same spelling. |
| 288 | 4.3 | `tv_sort_open` | This sound can be spelt in three ways. Tap each chest to open it. |
| 289 | 4.3 | `tv_spelt_like_this_<w>` | In duck, it's spelt like this. / In kit, it's spelt like this. |
| 290 | 4.3 | `tv_sort_ido` | I'll sort the first one. My word is… |
| 291 | 4.3 | `tv_sort_see` | I can see this spelling at the end. |
| 292 | 4.3 | `tv_sort_so` | So it goes in this chest. |
| 293 | 4.3 | `tv_sort_fix` | Let's look again. Which chest has the same spelling? |
| 294 | 4.3 | `tv_sort_done` | Same sound, different spellings. You sorted them all. |
| 295 | 4.4 | `tv_review_short` | It's Sensei's Challenge! Are you ready? Tap the green arrow. |
| 296 | 4.4 | `tv_review_frame` | This is Sensei's Challenge. It has words from all the games you've played. |
| 297 | 4.4 | `tv_review_how` | Find the sounds in each word to zap it. Let's see how many you can do! |
| 298 | 4.4 | `tv_review_done` | You zapped so many words! That was a real challenge. |
| 299 | 4.5 | `tv_run_read_first` | Now it's your turn to read. Read the word at the top, and catch its picture. |
| 300 | 4.6 | `tv_dj_room` | This is the dojo, a school for ninjas. Here, you learn new sounds. |
| 301 | 4.6 | `tv_learn_frame_ways` | Today in the dojo, I'm going to teach you new ways to write a sound you know. |
| 302 | 4.6 | `tv_and_another_way` | And here's another way to spell it… |
| 303 | 4.7 | `tv_word_hunt_frame` | It's a word hunt. Every word with our sound in it goes in a pocket. |
| 304 | 4.7 | `tv_find_words_in` | Find every word with this sound in it… |
| 305 | 4.7 | `tv_hear_in_<w>` | I can hear it in rain. |
| 306 | 4.9 | `tv_place_frame` | Let's play a quick game, so I can see what you know already. |
| 307 | 4.9 | `tv_place_ok` | Some might be tricky. That's fine. Just have a go. |
| 308 | 4.9 | `tv_place_sound_round` | I say a sound, and you find how we write it. |
| 309 | 4.9 | `tv_place_findall_round` | Find every picture with this sound in it… |
| 310 | 4.9 | `tv_place_done` | Thank you, ninja. Now I know just where to start. |
| 311 | 4.10 | `tv_practise_gem` | Let's practise this gem. I say a word, and you build it. |
| 312 | 5.2 | `tv_offer_show_miss` | Shall I show you again? Tap my paw. |
| 313 | 5.3 | `tv_praise_found` | You found it! |
| 314 | 5.3 | `tv_praise_order` | You read them the ninja way. |
| 315 | 5.3 | `tv_praise_row` | You remembered which came first. |
| 316 | 5.3 | `tv_praise_heard_word` | You heard the word in the sounds. |
| 317 | 5.3 | `tv_praise_write` | You know how we write that sound. |
| 318 | 5.3 | `tv_praise_judge` | You checked their reading, like a real teacher! |
| 319 | 5.3 | `tv_praise_sorted` | That's the right chest. |
| 320 | 5.3 | `tv_praise_read` | Lovely reading! |
| 321 | 5.3 | `tv_praise_kept_going` | That was a tricky one, and you kept going. |
| 322 | 5.3 | `tv_praise_helped` | Now you've got it. |
| 323 | 5.3 | `tv_yay_lovely` | Lovely! |
| 324 | 5.3 | `tv_yay_thats_it` | That's it! |
| 325 | 5.3 | `tv_streak_10` | Ten in a row! Look how your ninja is glowing! |
| 326 | 5.4 | `tv_listen_here` | Let's listen again. What can you hear here? |
| 327 | 5.5 | `tv_listen_sound_again` | Listen to my sound again… |
| 328 | 5.5 | `tv_which_starts_it` | Which picture starts with it? |
| 329 | 5.5 | `tv_which_way_write_it` | Which one is the way we write it? |
| 330 | 5.5 | `tv_both_again` | Listen to them both again… |
| 331 | 5.5 | `tv_which_changes` | Which sound changes? |
| 332 | 5.5 | `tv_take_time` | Take your time, ninja. |
| 333 | 5.5 | `tv_look_glow` | Look for the glow. |
| 334 | 5.6 | `tv_dojo_review_done` | You built lots of words. Your ninja is getting stronger. |
| 335 | 5.7 | `tv_to_flower` | Let's take your new sounds to the World Flower. Tap the green arrow. |
| 336 | 5.7 | `tv_won_one` | You won back a sound… |
| 337 | 5.7 | `tv_rest` | You've practised so much today! Ninjas need rest too. You can stop here, and your ninja will wait for you. |
| 338 | 5.7 | `tv_jump_offer` | Wow, you got everything right! Grown-ups, if this is too easy, you can jump ahead. |
| 339 | 5.8 | `tv_welcome_back` | Welcome back, ninja! I'm so happy to see you. |

**The generated families and their members on this path:** `tv_your_word_<w>`, `tv_find_again_<w>`, `tv_idle_look_<w>` (sock) · `tv_tap_hear_<w>` (sun), `tv_now_tap_hear_<w>` (sock) · `tv_pocket_ready_<n>` (two, three) · `tv_pocket_more_<p>` (s, m) · `tv_pocket_middle_more_<p>` (o) · `tv_which_q_<pair>`, `tv_which_fix_<pair>` (cat_dog) · `tv_which_q_<three>`, `tv_which_fix_<three>` (fish_dog_cat) · `tv_i_hear_<w>` (mug; sun for Reception) · `tv_guess_so_<w>` (sun) · `tv_ido_pair_<pair>` (map_hat, bed_sock, cat_ant, jam_tent, nut_hat, bus_pig, pan_pin, map_mop) · `tv_yes_<reader>`, `tv_right_<reader>` (kai, suki) · `tv_won_<n>` (two, three, four) · `tv_learn_frame_<n>`, `tv_learn_all_<n>`, `tv_learn_recap_<n>`, `tv_learn_short_<n>` (two, three, four) · `tv_map_next_<game>` (the 12 in §5.8) · `tv_spelt_like_this_<w>` (kit, duck, and each sort's words from SF C1) · `tv_hear_in_<w>` (rain). One non-`tv_` family is also new: **`tg_<g>_<p>_way`** ("This is the way we spell it in mat."), one per spelling, beside today's `tg_<g>_<p>_in`.

### 7.2 Kept lines to re-record with calm punctuation (24)

| line id | today | new text |
|---|---|---|
| chose | Great choice! Let's rescue those sounds! | Great choice! |
| nav_ready | Tap the arrow when you're ready! | Tap the green arrow when you're ready. |
| fm_opt_q2 | Which class are you in? | Which class are you in? Tap your class. |
| fm_opt_unsure | Not sure? Tap the cloud! | Not sure? Tap the cloud. |
| fm_opt_q2_again | Tap your class! | Tap your class, or the cloud. |
| fm_notice_sun_sock | Did you notice? Sun and sock start with the same sound... | Sun and sock start with the same sound... |
| fm_tap_tortoise | Your turn! Tap the tortoise, and say it slowly with me. | Now you tap the tortoise, and say it slowly with me. |
| fm_tap_rabbit | Now tap the rabbit, and say it fast! | Now tap the rabbit, and say it fast. |
| fm_starfish_q · fm_rainbow_q · fm_snowman_q | Star... fish. Tap the rabbit to say them fast! | Star... fish. Tap the rabbit, and say them fast. |
| flower_i1 | This is the World Flower. Baron Muddle blew all its petals away! | This is the World Flower. Baron Muddle blew all its petals away. |
| say_sounds_read | Say the sounds... and read the word! | Say the sounds, and read the word. |
| t_if_you_say_sounds | If you say the sounds, you can hear the word! | If you say the sounds, you can hear the word. |
| fm_last_one | Here's the last one! | Here's the last one. |
| audit_listen_next | Hmm, listen again. What sound comes next? | Let's listen again. What sound comes next? |
| its_this_one | It's this one! Say it as you put it here. | It's this one. Say the sound as you put it on the line. |
| help_look | Look! I'll show you. | Let me show you... |
| story_your_turn | Your turn to read! Tap a word if you need help. | Your turn to read. |
| run_read | Read the word, and catch the matching picture! | Read the word, and catch the matching picture. |
| help_run | Tap anywhere to jump. Tap a lantern to catch it! | Tap anywhere to jump. Tap a lantern to catch it. |
| trial_fail | So close! Keep playing, and try again soon! | So close! Keep playing, and try again soon. |
| streak_lost | Keep going, ninja! | Keep going, ninja. |
| yay_4 | Well done! | Well done. |

### 7.3 Lines retired from these paths (125, plus a family and three unrecorded lines)

A retired line stays in `lines.ts` until nothing calls it, and every call site guards with `HAS` / `L()` (SCRIPT_FIXES Part B), so the new wording can ship before its audio.

- **The first minutes:** `intro_8`, `tut_1`, `fm_help_short`, `fm_speaker`, `fm_opt_notyet`, `fm_opt_yes`, `fm_opt_q1_again`, `fm_opt_echo_notyet`, `fm_opt_echo_school`, `fm_opt_ok_notyet`, `fm_opt_grownups`.
- **The show/try labels and the demo commands:** `fm_show_me`, `fm_show_me_2`, `fm_you_try`, `fm_you_try_2`, `ido`, `wedo`, `youdo`, `fm_tap_sun`, `fm_tap_sock`.
- **The warm-ups:** `fm_l1_hello`, `fm_same_word`, `fm_hear_sounds`, `fm_hear_sounds_short`, `fm_first_listen`, `t_everyone_say`, `fm_tap_all_start`, `fm_l1_done`, `fm_rw_book`, `fm_rw_every`, `fm_rw_tap`, `fm_rw_next`, `fm_l2_way`, `fm_l2_turn`, `fm_l2_start`, `fm_which_cat_dog`, `fm_which_three`, `fm_l2_big_word`, `fm_sunflower`, `fm_sunflower_q`, `fm_sunflower_fast`, `fm_quick_tap_all`, `fm_slow_listen`, `fm_slow_another`, `fm_tap_all_in`, `fm_tap_all_words_in`, `audit_made_of_sounds`, `fm_sounds_intro`, `fm_l5_done`, `fm_dots_intro`, `fm_dots_turn`, `fm_dots_say`, `fm_practise_again`, `audit_petal_means`, `map_hint`, `fm_its_this`.
- **The early levels:** `first_intro`, `find_q`, `how_we_spell` and `audit_hear_see` (on this path), `hunt_intro`, `hunt_q`, `audit_middle_place`, `audit_last_place`, `audit_dojo_first`, `two_sounds`, `three_sounds`, `build_ido_1`, `build_ido_2`, `build_ido_3`, `read_intro`, `listen_again`, `listen_here`.
- **The Dojo:** `dojo_hello`, `audit_dojo_back`, `listen` (as any opener), `audit_spell_it`, `dojo_tap_say`, `dojo_find`, `tut_speaker`, `dojo_build`, `dojo_build_word`, `dojo_done`.
- **Battles:** `battle_start`, `battle_spell`, `battle_boss`, `audit_baron_first`, `timer_intro_1`, `timer_intro_2`, `timer_intro_3`, `audit_trial_first`, `audit_timer_short`, `audit_timer_hearts`, `trial_start`.
- **Sound Swap:** `swap_start`, `this_is` (in Sound Swap), `swap_make`, `swap_pick`, `what_changed`, `audit_swap_first`, `audit_swap_middle`, `audit_swap_last`, `swap_done`.
- **Ninja Run:** `run_start`, `run_blend`, `audit_sounds_again`, `t_listen_for_word`.
- **Story Time:** `story_start`, `story_question`, `audit_story_choice`.
- **Sorting:** `audit_sort_first`, `audit_sort_three` (on the first sort), `sort_done`.
- **The shell:** `flower_i2`, `flower_i4`, `flower_i6`, `t_remember_this`, `t_now_you_say_it`, `petal_got`, `petals_got`, `dojo_nap`, `jump_offer`, `welcome_back`, `streak_10`, and `yay_7` as a reward lead.
- **Families:** the tail clips `tg_<g>_<p>_in` (replaced by `tg_<g>_<p>_way`).
- **SCRIPT_FIXES Part B lines not to record:** `st_speaker_ok`, `st_like_this_in`, `st_and_like_this_in` (replaced by `tv_train_speaker_ok` and `tv_spelt_like_this_<w>`).

### 7.4 The six recorded samples

Six representative new lines were recorded with the real voice (`tts()` in `scripts/tts.ts`: Gemini `gemini-3.8-flash-tts`, Sulafat, en-GB, the plain text only), finished with `finishAudio()` (trimmed, −16 LUFS, 25 ms fades), and judged by Gemini audio understanding (`gemini-3.8-flash` via `scripts/gemini.ts`) for exactness, warmth, pace, shouting, letter names, accent and the lead-in's tail. The files and the full judgements are in [teacher-voice/samples/](teacher-voice/samples/) (`results.json`). Every line passed on its first take.

| line id | kind | length | words/s | exact | warmth | pace | shouted | letter names | the judge's note |
|---|---|---|---|---|---|---|---|---|---|
| `tv_learn_frame_four` | frame (the first Dojo lesson) | 3.8 s | 3.1 | yes | 9 | 9 | no | no | "Lovely, warm delivery with clear enunciation and a welcoming pace for Reception age." |
| `tv_learn_how` | frame: who does what | 4.5 s | 3.8 | yes | 9 | 9 | no | no | "Clear, warm pedagogical tone and excellent pacing for young children." |
| `tv_here_it_comes` | lead-in before a pure sound | 1.0 s | 3.0 | yes | 9 | 9 | no | no | "An anticipatory, warm tone that leaves the sound suspended perfectly for a splice." Tail: clean (no blip) |
| `tv_ears_demo` | narrated demo | 4.8 s | 2.1 | yes | 9 | 9 | no | no | "Great warmth, natural pauses, and gentle enthusiasm." |
| `tv_ready_first` | readiness question | 4.6 s | 2.8 | yes | 9 | 9 | no | no | "Lovely warm delivery with engaging, encouraging phrasing." |
| `tv_your_word_sock` | hand-over | 3.7 s | 2.4 | yes | 9 | 9 | no | no | "Great warmth, friendly intonation, and clear unhurried pacing." |

**The Dojo opening, spliced as the game would play it** (`composite_dojo_opening_after.mp3`: the frame, then "Here it comes…" /b/ … /b/ and the existing `tp_b_hear`), against today's (`composite_dojo_opening_before.mp3`: `dojo_hello`, `listen`, /b/ /b/, `audit_spell_it`, /b/, `dojo_tap_say`). The judge heard the new opening as explaining what happens and who does what before the first sound (true; today's: false), with a clean pure /b/ and no letter names, and rated it 10 for "would a warm Reception teacher talk like this?" (today's: 8).

**What the samples tell the recording lane:**
- **Warmth and accuracy are there:** six of six exact, British, warm, with no letter names and no shouting, on the first take. Whole sentences suit this voice.
- **Pace varies more than the estimator assumes** (2.1–3.8 words a second against 2.7). `tv_learn_how`, at 3.8, is the fastest: it is the longest line of the lesson's frame, and it's the one a 3-year-old most needs to follow. Take it again slower, or split it into its two sentences (`tv_learn_how` + `tv_learn_then_you` "Then you say it with me."). F4 should flag any sentence line faster than 3.3 words a second.
- **The lead-in works as designed:** "Here it comes…" ends suspended with a clean tail, and /b/ joins it without a click.
- **The judge is lenient on shouting.** It heard nothing barked in today's opening either, so it can't stand in for the loudness rule: one-word clips 3 LU under the sentences around them (mechanics §7.3–7.4) stays a `gen-audio.ts` check, and F4's `bare-listen` and `bare-command` checks do the rest.

---

## 8. Where each section came from, and the decisions

### 8.1 Where each section came from

The base is CB throughout (all three judges ranked it first). Where a judge majority gave a section to another draft, that draft's structure leads and CB's best lines are kept.

| Section | Led by | Main grafts |
|---|---|---|
| Film, Choose | RT + CB | RT's "I'm going to be your teacher", CB's "Will it be Kai, or Suki?", the three-year-old judge's "what rescuing means" line |
| Opt-in | EYS | the reason first, whole "If…" lines, "Not yet. That's fine.", "Ask a grown-up…"; EYS's confirm check cut |
| Dojo welcome | CB | RT's "A dojo is a school for ninjas.", EYS's "Tap it, and your ninja will kick it." and the star lines |
| W1 Ninja Ears | CB | EYS's frame, RT's "My word is sun." / "Your word is sock." mirror, the jonas-bar judge's Ready line kept |
| W1 the rabbit and the tortoise | CB | EYS's wrong-button lines; the insight after the child's tap |
| W1 the first sound | CB | the child-driven notice and the petal turn; RT's "listen to how it starts" |
| W1 Pocket Hunt | CB name + EYS spine | EYS's "I'll find one first." and "So it goes in a pocket." as "So into the pocket it goes!" |
| W2 | RT (rail, big words) + EYS (two rows) | RT's rail frame and button narration; EYS's "Fish came first. So I tap this row."; CB's "What a silly animal!" and Word Squish |
| W3–W6 | EYS / RT / CB by section | RT's "Here's my slow word…", EYS's "Let's say it together.", EYS's "I start here, and go this way." and "If you say the sounds…" |
| w1-2 First Sounds | CB | the join-in moved before the demo (jonas-bar), RT's "Let's do the next one together. Are you ready?", R's Ninja Eyes, EYS's "Now it could be either sound." |
| World Flower, first visit | CB | EYS's "Now let's go and see where your sounds live.", RT's split formula |
| w1-4 Word Building, Kai and Suki | CB | EYS's "They'll both read this word. Only one of them reads it right." and "Tap Kai, or tap Suki." |
| w1-6 first battle | RT (a demo) + CB's frame | EYS's "Zap! Look, its bar went down.", RT's "That's how we spell a word.", CB's join-ins |
| w1-7 Sound Hunt | CB | EYS's "Listen to them both…" in the we do, RT's "shown, not defined" middle |
| w1-8 Sound Swap | CB | the child's kick (the three-year-old judge), E's "The first sound changes." |
| w1-9 Ninja Run | RT | the practice jump, EYS's lanterns line at the first lanterns |
| w1-14 Story Time, w1-15 boss | CB | EYS's choice line; "read it together" on the first page (the three-year-old judge) |
| w2-1 New Sounds | CB | RT's "You can hear it in bat, bag and bin." (first sound only), EYS's second tap, whole sentences in place of "Your turn." |
| Recaps and shorts | CB + EYS | statements, not "Remember X?"; EYS's no-hold recap |
| Ready | CB + RT | RT's whole questions and hand-over variants; CB's first two |
| Correction, idle, Help, lead-ins | EYS | CB's `its_this_one` wording; EYS's rephrase ladder and lead-in table |
| Praise | RT + CB | Sounds~Write's own praise; CB's specific lines; the superlatives out |
| Wraps and transitions | EYS | "That's the end of…", "Next, we're going to…" |

### 8.2 Decisions made without asking (for docs/DECISIONS.md, by integration)

| # | Decision | Why |
|---|---|---|
| T1 | **CB's draft is the base,** with per-section leads and grafts as §8.1. | All three judges ranked it first; its faults were mechanical (barks, clipped Readies, no links). |
| T2 | **The Ready hold comes after the demo** on every full form, as a whole question. Before the demo, Jonas's "Are you ready?" is a statement ("I'll go first."), except the Dojo's "Are you ready for the first one?" and Sound Swap's "Are you ready to watch?", which are real holds. | Mechanics §3; EYS's pre-demo hold left 16–33 s of talk after the child said "ready" (three-year-old judge); RT's Watch? holds added empty taps (pedagogy judge). |
| T3 | **A recap has no Ready hold** unless the child has been away 21 days or struggled; its telling counts on the child's first answer. *Changes mechanics §3.2 and §5.2's `framed()`.* | Arrow fatigue (25–30 ▶ taps before w2-1); the stone tap is the "yes". |
| T4 | **A right answer tapped during a hand-over Ready counts as ready and as the answer.** *Changes mechanics §4.2.* | A child who found the sock shouldn't be asked to find it again (three-year-old judge §6.1). |
| T5 | **The paw is introduced at the save's second Ready** (`tv_ready_paw`), and offered once in the first full-form turn at 12 s idle (`tv_show_offer`). | One new control at a time; W1's first Ready stays inside 12 s. |
| T6 | **Recaps are statements** ("It's Sound Swap again. …"). No "Remember X?". | A question with no answer teaches that questions don't need answers (pedagogy judge); overrides the jonas-bar judge's allowance. |
| T7 | **No line under four words is an instruction; "?" only where the child can answer; "!" only for celebrations.** | Jonas's "weird shouted, listen"; research §4 #16. |
| T8 | **A game's name is said inside a sentence.** Where a level's budget is tight, the name is said by the map's preview (`tv_map_next_<game>`), and the level opens with who does what. "Which Row" and "Who Read It Right" are never said aloud. | Names let replays be one line; the preview is also the teacher's "here's what we're doing next". |
| T9 | **The rabbit tap is compulsory in W1 and W3.** | It is the child's tap that splits the talk (CB D6). |
| T10 | **Letters arrive at the child's own first right answer (the we do). "Write" in the early games; "spell" from the first battle ("That's how we spell a word."); the World Flower keeps the official "This is the way we spell it in mat."** No definition of "spelling" in w1-2. | Sounds~Write's Early Years wording; the three-year-old judge (a definition a 3-year-old won't hold). |
| T11 | **The official formula is split so the sound ends its sentence:** "Here's the sound…" /m/ · "This is the way we spell it in mat." (new family `tg_<g>_<p>_way`; `tg_<g>_<p>_in` retires). | The house rule (no sound mid-sentence) and natural English (jonas-bar judge over CB's "In mat, this is…"). |
| T12 | **No ear icon anywhere.** "Ninja ears" is explained in W1 and used once in the Dojo ("Get your ninja ears ready.", the first sound only). | Jonas's "this ear appears"; kept against the pedagogy judge's leave-out, because W1 explains it. |
| T13 | **The first Monster Battle has a demo,** with the word-card tap and "Can you find the last one?" as join-ins; the letters stay dim until ▶. | Mechanics §6.4 (pedagogy judge), inside the budget (three-year-old judge). |
| T14 | **Sound Swap's first meeting:** the child reads the start word, taps "Ready to watch", and kicks out the old sound inside Sensei's swap. | Sounds~Write Lesson 3; splits the longest demo (16.7 s in CB) into runs of 6–9 s. |
| T15 | **W1's first-sound beat is driven by the child** (tappable cards, a petal tap), and the `W1:7` Next hold goes. | Noticing works better when the child finds it; the petal is named the moment it appears. |
| T16 | **Games link:** a game ends by saying it has ended, and the next opens with "Next…" or "Now let's…" (`tv_next_game`, `tv_next_build`). | Reverses CB's "no link lines" (jonas-bar judge: teachers explain what they're doing). |
| T17 | **Praise:** Sounds~Write's own ("Good, you said that sound really well."), specific lines, and "Smashing!", "Ace!", "Amazing!" and "Fantastic!" out of the everyday rotation; no trait praise. | SCRIPT_STYLE §8; pedagogy judge. |
| T18 | **The welcome's speaker says a rhyme** ("Tip, tap, tiptoe, quiet as a mouse."), which the first story echoes. *Supersedes the fix plan's A.1 (SF C19's "This is the sun.").* | The speaker needs something worth hearing again; the three-year-old judge. |
| T19 | **Kai and Suki stay the readers for now,** flagged: a child who chose Kai may watch Kai read it wrong. Two other readers need only new names in the `<reader>` families. | Art exists; the choice is Jonas's. |
| T20 | **Baron's "will squash you" stays,** with "My sumo panda will sit on your words!" offered as a gentler line. | Baron's lines are outside this brief. |
| T21 | **Before land 2, the World Flower's trips leave out "We see this spelling in…".** | The child can't read yet (three-year-old judge §3.18). |
| T22 | **The first-minutes cap moves from 5:00 to 5:30** once the bot has re-measured it. | The extra time is the child's own turns (mechanics §5.4). |
| T23 | **Estimated runs aim at ≤ 12 s; five named runs of 12.1–12.3 s stay** (§6), each with its cut ready if the bot measures more than 12.5 s. | Whole sentences cost words; the cuts keep the teacher voice. |

---

## 9. Fast and slow, more often (Jonas, 27 Sep)

**Added 27 September 2026, after Jonas's playtest:**

> "Oh yeah and you gotta read the 'slow way to say a word' with actual little gaps between the sounds. It is too smooth now. And you need to explain more often that there are slow and fast ways to read words etc."

Before this section, the idea was said once, in W1 (the rabbit and the tortoise, §3.5 B), and hinted at in W5 (`t_if_you_say_sounds`). W3's recap even skipped it on purpose (§3.9 A: "The insight is not said again"). This section overrides that: **every game that says a word slowly, or asks the child to blend or segment, names the slow way and the fast way in every session**, with the tortoise and the rabbit on screen each time. It adds 40 recorded lines (`tv_fs_*`, §9.4: the first 24, then 8 more short idea lines and 8 more praise lines the same day, so a child doesn't hear the same few again and again) and changes no line in §3–§5. Where it takes a moment from a line in those sections, the row says so.

### 9.1 The idea, and what the slow way now sounds like

What Sensei teaches, in the child's words:
- **Every word is made of sounds.**
- **There's a slow way to say a word, and a fast way.** The slow way is the tortoise: the sounds one by one, with little gaps. The fast way is the rabbit: the whole word.
- **We read** by saying the sounds (the slow way), then pushing them together (the fast way). That is Sounds~Write's "Say the sounds, and read the word." and "If you say the sounds, you can hear the word.", which stay word for word.
- **We spell** by saying the word slowly, so we can hear each sound. That is Sounds~Write's "I'm going to say the word 'sat' very slowly. Listen carefully to hear the sounds…" (teacher-language §10.7).

**The slow way has real gaps.** The `[w, slowly]` slot is no longer a stretched ("elastic") word. It is the word's pure sounds, one by one, 250 ms apart (/k/ · /a/ · /t/), spliced from the checked pure sounds in `public/a/p` by `scripts/gen-slow-words.ts` (FEEDBACK Round 15). The clips are `public/a/x/<w>.mp3`, one for each of the 997 words with a segmentation, and `SLOW_TIMES` (`src/content/slow-times.gen.ts`) gives each sound's onset, so the tortoise can step, and a tile or dot can light, on each sound. Every pure sound in it follows the /d/ lesson from the same day: **no sound may trail into a vowel ("duh"), and Jonas's ear, not the acoustic gate, is the judge.** In a read-back the slow part is the tiles' own sounds, one per tile, lit in turn, as before.

**How long the slow way is** (measured on 27 Sep over all 997 clips, by the number of sounds): three sounds 1.57 s on average (0.9–2.3 s; 543 words), and 1.53 s once /o/ and /u/ were rebuilt shorter the same morning; four sounds 2.1 s (1.3–2.9 s); five sounds 2.5 s (2.0–3.2 s); two sounds 1.1 s. So a four- or five-sound word takes about 2.4–2.7 s at the long end. The old stretched clips (163 words) averaged 1.2 s. §9.3's runs use 1.6 s for a three-sound word (§9.7, FS3).

**Short vowels stay short, and /g/ and /b/ are voiced** (27 Sep, the same day). In British English length is what tells /o/ (hot) from /or/ (fork), and /u/ (cup) from /ar/ (car). The pure /o/ and /u/ had been stretched to 0.41 s, and a blind listener heard hot as "ought", cup as "carp" and bus as "pass". They are now natural short vowels cut from Sensei's own "hop" and "up" (0.13 s and 0.11 s, not stretched), and `gen-slow-words.ts` cuts every short vowel (a e i o u) in a slow word at 0.24 s. A /g/ or /b/ said alone was heard as /k/ or /p/, so in a slow word each starts with a 45 ms voiced closure made from its own voicing (the pure clips themselves are unchanged). Every slow word is -16 LUFS with its true peak at or under -1.5 dBTP. The before and after are on the slow-words listening page for Jonas's ear.

### 9.2 Five moves

| Move | What happens | When | Lines |
|---|---|---|---|
| **1. The rabbit read-back** (the child pushes it fast) | Sensei says the slow way while the tortoise walks. Then she asks the child to tap the rabbit, and the rabbit says the word fast. The child's tap is a registered action, so it splits the talk (§0.1, the 12 s rule) | the first word read back in each game, each session: after the Ready on a full form, the first read-back on a recap or short form | `tv_fs_say_sounds_slow` · the slow slot · `tv_fs_rabbit_read` (a game with letters) or `fm_tap_rabbit` (a listening game) · the tap · [w] |
| **2. The idea** | one whole sentence that says the idea out loud | once per game per session, beside Move 1 (before the rabbit prompt, or after the tap, whichever run has room), or in the game's first praise slot where there is no Move 1 | 19 lines in rotation (§9.5) |
| **3. The stuck recap** | back to the slow way when the child is stuck | a first miss or the 8 s idle, taking turns with the game's own line (never the same one twice in a row, never twice on one item) | `tv_fs_stuck_slow`, `tv_fs_stuck_again`, `tv_fs_stuck_push` |
| **4. Fast and slow praise** | praise that names the slow way | once per game per session, in the game's praise slot (§5.3's rhythm), never where the idea line took the slot; **each praise line at most once a session** | 11 lines in three kinds (§9.5): letters `tv_fs_praise_both`, `_both_2`, `_both_3`; listening `tv_fs_praise_found`, `_found_2` to `_found_4`; building `tv_fs_praise_every`, `_every_2` to `_every_4` |
| **5. Sensei's pair** | "Let's say it the slow way…" · the slow slot · "And now, fast…" · the word | the 3rd and 5th read-backs in a game in a session, where §9.3 allows it; never after a miss (S~W's `say_sounds_read` has those) | `tv_fs_say_slow` + `tv_fs_now_fast`, or `tv_fs_slow_tortoise` + `tv_fs_fast_rabbit` (they take turns) |

Every other read-back stays as §3–§5 have it: S~W's `say_sounds_read` on the 2nd and 4th, and after any miss, then the faded form (the sounds and the word, no stem). **The tortoise and the rabbit light on every slow slot and every fast word, whichever line leads in** (§9.6).

### 9.3 Where, game by game

Runs are estimated as in §6: the recorded length of each clip (§9.8), 0.35 s between clips, 0.55 s a pure sound (0.3 s between sounds), 0.65 s a word, **1.6 s the slow way** (a three-sound word's measured mean, §9.1; about 0.5 s more for four sounds and 1.0 s more for five). A run ends where the line that cues the child's next action starts.

| Game (lane) | The session's fast/slow moment | What plays | Est. run | The rest of the session |
|---|---|---|---|---|
| **W1, the rabbit and the tortoise** (`fastslow`, C2) | unchanged: §3.5 B is the first telling (`tv_ts_fast`, `tv_ts_slow`, `tv_same_word`) | the scene's own big tortoise and rabbit; `tv_ts_slow` now plays the slow way with gaps | – | `tv_same_word` counts as W1's idea line |
| **W3, the rabbit and the tortoise** (`fastslow` recap or short, C2) | after the child's tortoise tap | [mug, slowly] · **idea** (the save's first idea line is always `tv_fs_two_ways`) · `fm_tap_rabbit` · the tap · [mug]. **The idea takes `tv_praise_slowly`'s place** when both are due (the praise moves to a later slow word) | tortoise tap → the rabbit prompt ≤ 7.0 s | – |
| **W3, Slow Words** (`slowpick`, C2) | the first right answer | [van, slowly] · **idea** (≤ 3.9 s) · `fm_tap_rabbit` · the tap (the rabbit comes back from its corner) · [van] | the tap → the prompt 6.2 s; the rabbit → the next question 9.5 s | 1st miss: `tv_fs_stuck_again` [van, slowly] (6.8 s), taking turns with `tv_slow_again`. **8 s idle: `tv_fs_stuck_again` [van, slowly], in place of `tv_idle_look_<w>`**, which would say the answer (flag 2). Praise: a listening praise line (§9.5) |
| **W3, Pocket Hunt, the middle** (`tapall:in`, C2) | the child's first find | [bag, slowly] · **idea** (spell bank) | the find → the hunt goes on 5.8 s (the cards stay live) | – |
| **W5, Guess My Word** (`sounds`, C2) | the first right answer (on the full form, **in place of `tv_guess_together`**) | [map] · `tv_fs_say_sounds_slow` · /m/ /a/ /p/ (neutral dots, Dec1) · **idea** (≤ 3.9 s) · `fm_tap_rabbit` · the tap · [map] | the tap → the prompt 10.8 s; the rabbit → the next question 9.6 s | 1st miss: `tv_fs_stuck_push` + the sounds (7.6 s), taking turns with `tv_guess_again`. **8 s idle: `tv_fs_stuck_push` + the sounds, never a line that names the word.** Praise: a listening praise line (§9.5) |
| **W6, Sound Dots** (`dots`, C2) | the first word, after the last dot | `fm_tap_rabbit` (**in place of `tv_now_say_word`**) · the tap · [cat] (the sweep) · `t_if_you_say_sounds` (once per save; it counts as the idea) or **idea** | the rabbit → the next word's first dot ≤ 6.9 s | Praise: a listening praise line (§9.5) |
| **First Sounds** (`firstsound`, C1) | the first praise slot of the session | **idea** (spell bank, ≤ 3.9 s), in place of the praise line | – (praise-sized) | 1st miss: [cat] · `tv_fs_stuck_slow` [cat, slowly] · `fm_diff_cat` · `tv_fix_start` /s/, taking turns with §5.4's [cat, first] version (10.8 s, the cards live throughout). The slow way puts the first sound out on its own |
| **Word Building** (`build`, C1: `BuildSequence`) | the first word built after the Ready (the we do), or the first word on a recap or short form | `tv_fs_say_sounds_slow` · the tiles' sounds · `tv_fs_rabbit_read` · the tap · [at] (the sweep) · **idea** (spell bank, ≤ 3.9 s). **In place of that word's `say_sounds_read`** | last tile → the prompt 4.7 s; the rabbit → the next question 10.7 s | Read-back 2: `say_sounds_read`; 3 and 5: Move 5. 1st miss: `tv_fs_stuck_slow` [mat, slowly], taking turns with `tv_listen_here`. Praise: a building praise line (§9.5) |
| **Kai and Suki** (`readcheck`, C1: `ReadCheck`) | the first right-reader answer. **No rabbit tap here**: the fast word before the readers would answer the check | `tv_yes_<reader>` · `tv_fs_say_slow` · the sounds · `tv_fs_now_fast` · [am] (in place of the bare sounds and word) | → `read_tap_sounds` 9.9 s (two sounds), 10.7 s (three) | idea: the first praise slot (letters bank). Later resolutions: Move 5 on the 3rd |
| **Sound Hunt** (`soundhunt`, C1) | the first praise slot of the session | **idea** (spell bank), in place of the praise line | – | its build phase is Word Building's |
| **Dojo, Word Building** (`build`, D1: `Build`) | the first built word of the session | as Word Building, with `tv_fs_rabbit_read` | the rabbit → `first_sound_q` 8.2 s | as Word Building |
| **Monster Battle, boss, Sensei's Challenge** (`battle`, `boss`, `review`, D2) | the first word the child zaps in the session | as Word Building. **The rabbit's tap is the finishing zap**: the rabbit hops at the monster and the bar drops | the rabbit → the next word 7.6 s | 1st miss: `tv_fs_stuck_slow` taking turns with `tv_listen_here`. Move 5 on the 3rd and 5th words. **A gem battle** (`trial`) has **no Move 1 and no Move 5** (the purple bar runs): only the tortoise and rabbit lighting, the stuck recap, and the idea in its first praise slot |
| **Sound Swap** (`swap`, D3) | the start word, after the child's sound taps (`tv_swap_read_first`) | the child's taps (the slow way) · `tv_fs_rabbit_read` (in place of the bare [mat] sweep) · the tap · [mat] | the rabbit → `tv_ready_to_watch` 5.7 s | idea: the first praise slot (spell bank, but not `tv_fs_same`: Swap changes the word). No Move 5: the turn is already 11 s with two slow words (flag 3) |
| **Ninja Run** (`run`, D5) | the first lantern group of every run but the first (whose `tv_run_lanterns` says it) | `tv_fs_run` · `tv_guess_q` · the sounds · `tv_run_which` | → `tv_run_which` 8.1 s | The first catch of the session: `tv_fs_say_slow` · the sounds · `tv_fs_now_fast` · [sit] (7.8 s, then the run goes on; no rabbit tap, because a tap anywhere is a jump). Wrong lantern: `tv_fs_stuck_again` + the sounds, taking turns with `tv_run_fix` |
| **Story Time** (`story`, D6) | the first child page of the session, straight after `tv_story_yours` or `story_your_turn` | **idea** (letters bank). The page is live, so no run | – | The first word tapped for help: `tv_fs_say_slow` · the word's letters light, one per sound · `tv_fs_now_fast` · [w]. Later taps as §3.23 |
| **Word Squish** (`compound`, C2) | no change: its tortoise and rabbit already say two words slowly, then fast | – | – | – |
| **Training, Show Sensei** (A) | nothing: no slow words there | – | – | – |

**The rabbit's idle ladder** (Move 1): at 8 s the rabbit hops and glows (no line); at 12 s Sensei says `tv_fs_now_fast` · [w] herself and the game goes on, as the petal join-in does (§3.5 C). A tap on the tortoise instead replays the slow way, and the rabbit pulses again.

### 9.4 The lines

| id (tv_fs_*) | trigger | on screen | exact text | the child does | dosage |
|---|---|---|---|---|---|
| tv_fs_two_ways | Move 2: the save's first idea line (W3, usually); then in turn | the tortoise lights on "slow way", the rabbit on "fast way" | There's a slow way to say a word, and a fast way. | — | the save's first idea line, then in rotation |
| tv_fs_tortoise | Move 2 (a long line, 5–6.5 s: not in a tight run) | the tortoise walks | The tortoise says each word slowly, one sound at a time. (was "a word": §9.8) | — | rotation |
| tv_fs_gaps | Move 2 | the tortoise walks; the slow word's sound dots pulse one by one, with gaps | The slow way has little gaps between the sounds. | — | rotation |
| tv_fs_rabbit | Move 2 (a long line, 4.4 s; 3.8 s since its retake, §9.8) | the rabbit hops | The rabbit pushes the sounds together, and says the word fast. | — | rotation (listening and reading games) |
| tv_fs_read | Move 2 | the tortoise, then the rabbit | When we read, we say the sounds first, then the word. | — | rotation (listening and reading games) |
| tv_fs_same | Move 2 | both light together | The tortoise and the rabbit say the very same word. | — | rotation (not in Sound Swap) |
| tv_fs_made | Move 2 | the word's sound dots or tiles light in turn | Every word is made of little sounds, one by one. (was "…of sounds, one after another.": §9.8) | — | rotation |
| tv_fs_ninja | Move 2 (a long line, 4.7 s) | the tortoise, then the rabbit; the ninja does a slow kata, then a dash | Slow first, then fast. That's how ninjas read words. | — | rotation (listening and reading games) |
| tv_fs_mantra | Move 2 (a long line, 4.7 s) | the tiles light, then the sweep | We say the sounds slowly. Then we read the word fast. | — | rotation (games with letters: Kai and Suki, Story Time) |
| tv_fs_spell | Move 2 | the lines under the word glow | To build a word, we say it slowly first. | — | rotation (building games) |
| tv_fs_find | Move 2 | the tortoise walks | Saying it slowly helps us find every sound. | — | rotation (building and hunting games) |
| tv_fs_hiding | Move 2 (added 27 Sep, like the seven below: all under 3.5 s) | the tortoise walks, then the rabbit hops | There's a fast word hiding in every slow word. | — | rotation (listening and reading games) |
| tv_fs_whole | Move 2 | the rabbit hops | The rabbit says the whole word, all at once. | — | rotation (listening and reading games) |
| tv_fs_push | Move 2 | the sound dots or tiles slide together | We push the sounds together to make the word. | — | rotation (listening and reading games) |
| tv_fs_turn | Move 2 | the sound dots or tiles light one by one | The slow way gives every sound a turn. | — | rotation (listening and building games) |
| tv_fs_ninjas_can | Move 2 | the ninja does a slow kata, then a dash | Ninjas can say a word slowly, and fast too. | — | rotation (listening games) |
| tv_fs_next | Move 2 | the tortoise walks; the next empty slot glows | Saying it slowly tells us which sound comes next. | — | rotation (building and hunting games) |
| tv_fs_start_end | Move 2 | the tortoise walks; each slot or card glows as its sound plays | The slow way shows us where each sound goes. | — | rotation (building and hunting games) |
| tv_fs_count | Move 2 | the sound dots or tiles light one by one | The slow way helps us count the sounds. | — | rotation (building and hunting games) |
| tv_fs_say_sounds_slow | Move 1, the read-back's slow half | the tortoise walks; the tiles (or dots) light one by one as each sound plays | Let's say the sounds, the slow way… /s/ /a/ /t/ | says the sounds | once per game per session |
| tv_fs_rabbit_read | Move 1, the fast half, in a game with letters | the rabbit grows, pulses and is spotlit on "rabbit" | Now tap the rabbit, and read the word fast. | taps the rabbit: [sat], the sweep and the rabbit's hop | once per game per session |
| fm_tap_rabbit (kept, ↻ in §7.2) | Move 1, the fast half, in a listening game (W3, W5, W6) | the scene's rabbit pulses | Now tap the rabbit, and say it fast. | taps the rabbit: [w] | once per game per session |
| tv_fs_say_slow | Move 5's slow half; Kai and Suki, Run and Story's first pair | the tortoise walks; the sounds light in turn | Let's say it the slow way… [sat, slowly] | says it along | the 3rd and 5th read-backs |
| tv_fs_now_fast | Move 5's fast half; the rabbit's 12 s idle | the rabbit hops; the sweep | And now, fast… [sat] (was "And now the fast way…": §9.8) | says the word | with `tv_fs_say_slow` |
| tv_fs_slow_tortoise | Move 5's slow half, taking turns with `tv_fs_say_slow` | the tortoise walks | First the slow way, like the tortoise… [sat, slowly] | says it along | the 3rd and 5th read-backs, in turn |
| tv_fs_fast_rabbit | Move 5's fast half, with `tv_fs_slow_tortoise` | the rabbit hops | Now the fast way, like the rabbit… [sat] | says the word | with `tv_fs_slow_tortoise` |
| tv_fs_run | Ninja Run, the first lantern group of a run (not the save's first run) | the lanterns float in; the tortoise and rabbit badges light in turn | I'll say it the slow way, and you catch the whole word. (was two sentences: §9.8) | — (then catches a lantern) | once per session |
| tv_fs_stuck_slow | Move 3: a first miss or 8 s idle while building, battling or in First Sounds | the slot (or the card) glows; the tortoise walks | Let's say it the slow way first… [mat, slowly] | taps again | every other stuck moment |
| tv_fs_stuck_again | Move 3: Slow Words and Ninja Run, a first miss or 8 s idle | the tortoise walks; the sound dots light in turn | Here's the slow way again, one sound at a time… [van, slowly] | taps again | every other stuck moment |
| tv_fs_stuck_push | Move 3: Guess My Word, a first miss or 8 s idle | the neutral dots light one per sound (Dec1), then the rabbit badge pulses once | Say the sounds with me. Then push them together, fast. · /m/ /a/ /p/ | says the sounds, taps a picture | every other stuck moment; always at the 8 s idle |
| tv_fs_praise_both | Move 4, a game with letters | the rabbit hops | Slow, then fast. That's real reading! | — | the first of its kind; at most once a session |
| tv_fs_praise_found | Move 4, a listening game (Slow Words, Guess My Word, Sound Dots, Ninja Run) | the tortoise and rabbit light | You heard the slow way, and found the word. | — | the first of its kind; at most once a session |
| tv_fs_praise_every | Move 4, a building game (Word Building, the Dojo, battles) | the tortoise walks | You said it slowly, and found every sound. | — | the first of its kind; at most once a session |
| tv_fs_praise_both_2 | Move 4, a game with letters (added 27 Sep, like the six below) | the tortoise, then the rabbit | You said each sound slowly, then read the whole word. | — | the letters kind, in turn; at most once a session |
| tv_fs_praise_both_3 | Move 4, a game with letters | the tortoise, then the rabbit hops | The slow way, then the fast way. You read it! | — | the letters kind, in turn; at most once a session |
| tv_fs_praise_found_2 | Move 4, a listening game | the rabbit hops | You pushed the sounds together, and heard the word. | — | the listening kind, in turn; at most once a session |
| tv_fs_praise_found_3 | Move 4, a listening game | the tortoise and rabbit light | Those little sounds made a word, and you found it! | — | the listening kind, in turn; at most once a session |
| tv_fs_praise_found_4 | Move 4, a listening game | the tortoise, then the rabbit hops | You listened to every sound, and caught the word! | — | the listening kind, in turn; at most once a session |
| tv_fs_praise_every_2 | Move 4, a building game | the tortoise walks | Slowly does it! Every sound is in its place. | — | the building kind, in turn; at most once a session |
| tv_fs_praise_every_3 | Move 4, a building game | the tortoise walks | Sound by sound, the slow way. Well built! | — | the building kind, in turn; at most once a session |
| tv_fs_praise_every_4 | Move 4, a building game | the tortoise walks | You listened slowly, and got the sounds in order. | — | the building kind, in turn; at most once a session |

The slots are the house's (§1): a pure sound or the slow word always stands in its own clip, after a lead-in recorded suspended, or alone after a full stop (`tv_fs_stuck_push`). No sound sits inside a sentence.

### 9.5 Dosage and rotation

- **By sessions, per game type.** Moves 1, 2 and 4 happen at most once per game type per session (`game:<id>` as in §2.2; `tapall:in` and `tapall` count separately). The same game in two levels of one session gets them in the first level only.
- **Idea lines:** at most **2 a level and 4 a session**, and **never the same sentence twice in a session**. `t_if_you_say_sounds` (W5, W6) and W1's `tv_same_word` count as idea lines where they play.
- **The rotation.** One save-wide pointer (`timesHeard("fs:idea")`) walks the list in §9.4's order. Each game takes the next line from its bank that hasn't been said this session:
  - **Listening games** (W3, Slow Words, W5, W6, Ninja Run): `two_ways`, `tortoise`, `gaps`, `hiding`, `rabbit`, `whole`, `read`, `turn`, `same`, `push`, `made`, `ninjas_can`, `ninja` (13 lines, 10 of them short).
  - **Reading games** (Kai and Suki, Story Time): `two_ways`, `tortoise`, `gaps`, `hiding`, `rabbit`, `whole`, `read`, `push`, `same`, `ninja`, `mantra` (11 lines, 7 short; these games have no tight run).
  - **Building and hunting games** (Word Building, the Dojo, battles, Sound Swap, First Sounds, Sound Hunt, Pocket Hunt in the middle): `two_ways`, `tortoise`, `gaps`, `next`, `made`, `start_end`, `same` (not in Swap), `turn`, `spell`, `count`, `find` (11 lines, 10 short, 9 in Swap).
  - **In a tight run** (§9.3's "≤ 3.9 s") the four long lines are skipped: `tortoise` (6.2 s since the accent fix, §9.8), `rabbit` (4.4 s then; 3.8 s since its retake, still skipped: `FS_LONG` in `narrative.ts`), `ninja` 4.7 s and `mantra` 4.7 s. Every other idea line is under 3.9 s, and the eight added on 27 Sep are under 3.5 s (§9.8), so a tight run has at least 8 different lines to walk through (9 in Swap).
  - The long and short lines alternate in each bank, so the pointer never has to skip far in a tight run.
- **Praise lines (Move 4): at most once a session each.** Three kinds, by the game:
  - **letters** (Kai and Suki, Story Time): `praise_both`, `praise_both_2`, `praise_both_3`;
  - **listening** (Slow Words, Guess My Word, Sound Dots, Ninja Run): `praise_found`, `praise_found_2`, `praise_found_3`, `praise_found_4`;
  - **building** (Word Building, the Dojo, battles, bosses, Sensei's Challenge): `praise_every`, `praise_every_2`, `praise_every_3`, `praise_every_4`.

  A game's Move 4 takes the next line of its kind that hasn't been said this session, walked by one save-wide pointer per kind (`timesHeard("fs:praise:<kind>")`), so the next session starts on a different line. **No praise line is said twice in a session.** When a kind's lines have all been said, that game has no Move 4, and its praise slot has its ordinary praise (§5.3). With 3–4 lines a kind, that happens only in a session with more games of one kind than it has lines.
- **The read-back lead-ins are routines,** like Sounds~Write's own: they may repeat, but the two pairs take turns, and both fade with the read-backs (§5.1, SCRIPT_STYLE §5).
- **The stuck lines take turns with the game's own line,** so neither is said twice running. A stuck line is never said twice on one item.
- **As the child grows.** In lands 1–2 (Bamboo Village and Blossom Hills), all of the above. From land 3, Moves 1 and 2 happen once per session (the session's first game with a read-back), and Moves 3–5 and the tortoise and rabbit stay. The child reads fluently by then, and the moves become the reminder, not the lesson.
- **Only what is heard counts** (ARCHITECTURE §3): a line cut off by Home or a crash isn't recorded, so it comes again.
- **The helper** (FIX_PLAN §13.5, F2): `narrate.tsx` keeps the per-session record in memory, as `perSession` does, since a session is one run of the page. Until it lands, a lane can use `onceInSave(\`fs:${game}:${sessionNow()}\`)` and `heard()`.

### 9.6 The tortoise and the rabbit on screen

- **Where the scene has its own big tortoise and rabbit** (the warm-ups' `speed` buttons: W1, W3, W4 and, for §9.3, W5 and W6), those are the cue and the join-in (lane C2). The nav badges hide, as `againAt: "own"` hides the speaker.
- **Everywhere else,** two small badges sit **beside the speaker (Hear it again)** in the nav row: the tortoise on the left, the rabbit on the right (`ui_tortoise`, `ui_rabbit`), drawn by the nav layer (F3). In a "column" screen (battles, Story Time) they sit in the column, under the speaker. They never cover ▶, the paw, the petal or the caption.
  - **The slow way:** while a slow slot or the read-back's sounds play, the tortoise lights and takes a slow step on each sound. Any `stretch:` clip lights it by itself.
  - **The fast way:** on the fast word after it, the rabbit lights and hops once.
  - **Move 1:** the rabbit grows to a full tap target (at least 100 stage px, like every nav control), pulses, and is spotlit on the word "rabbit". It is live only then. At other times a tap on a badge does nothing but wiggle it. In Slow Words, Guess My Word and Ninja Run it would give the answer away.
  - **The ninja moves with them:** a slow-motion kata on the slow way, a dash on the fast way (W1's moves, §3.5 B).

### 9.7 Rules, flags and decisions

**The rules** (with TS's):
1. **Sounds only at a sentence end or in their own slot.** The slow word and the pure sounds are always their own clips.
2. **"Read" only where there are letters.** A listening game says "say it fast" (`fm_tap_rabbit`), and a game with tiles says "read the word fast" (`tv_fs_rabbit_read`).
3. **Never give the answer before the child's answer.** In Slow Words, Guess My Word, Ninja Run and Kai and Suki, the fast word comes only after the child has answered.
4. **The 12 s rule holds** (§0.1). Every run in §9.3 is estimated at 10.8 s or less (the longest are First Sounds' stuck recap, with the cards live throughout, and Guess My Word's rabbit prompt, both 10.8 s). The idea line goes on whichever side of the rabbit's tap has room, and takes the praise slot where there is no tap.
5. **Sounds~Write's words stay exact.** `say_sounds_read`, `t_if_you_say_sounds` and "Listen for the word…" are not replaced. The fast/slow words go around them, and `tv_fs_say_sounds_slow` and `tv_fs_mantra` keep S~W's "say the sounds" and "read the word".
6. **Fast/slow lines are never Hear it again's instruction.** The speaker replays the turn's question. The stuck and praise lines are feedback (FIX_PLAN §13.5).

**Flags and decisions** (for docs/DECISIONS.md, by integration):

| # | Decision or flag | Why |
|---|---|---|
| FS1 | **The slow way has gaps everywhere it plays,** including the spelling games' listening prompts (`tv_listen_here`, `tv_last_first`, `tv_swap_both`, the stuck recap). *Flag:* Sounds~Write stretches without gaps when the **child** is to segment ("Say the word slowly but don't segment it", "you do not segment the word for the student"). With gaps, a building prompt does the segmenting, and the child only matches sounds to tiles. **Reversible by the audio lane:** keep today's stretched clip beside the gapped one (`public/a/x/<w>.mp3` and a new folder), so the building games' prompts can go back to the stretched word if Jonas prefers, without new lines. | Jonas asked for gaps, and his ear decides. The S~W difference is real, so it is logged, not hidden. |
| FS2 | **Slow Words and Guess My Word never use `tv_idle_look_<w>`** ("Where's the sock?") at 8 s: it names the answer. The 8 s idle there is `tv_fs_stuck_again` + [w, slowly] or `tv_fs_stuck_push` + the sounds. | §5.5's picture-game idle line gives the answer in the two games where the word *is* the question. |
| FS3 | **The gapped slow way makes TS runs that contain a slow word longer, by about 0.4 s a word on average.** W1's sock → Ready (12.1 s in §6) becomes about 12.5 s (sock's slow way is 1.27 s since the short-vowel fix, where the stretched sock was 0.9 s), so its named cut (`tv_ts_meet` → "Meet the rabbit and the tortoise.") applies. Sound Swap's turn (two slow words) is about 10 s, and Swap still gets no Move 5. F4 re-measures `talk-before-action` with the new clips. | The slow way is three pure sounds and two 250 ms gaps: 1.53 s on average for a three-sound word (measured, §9.1), where the old stretched words averaged 1.2 s. |
| FS4 | **W3's recap says the idea again,** reversing §3.9 A's "not said again". | Jonas: "explain more often". |
| FS5 | **The rabbit is the one new join-in.** The child taps it to say the word fast, once per game per session. The rabbit in the nav row is live only when asked. | A registered tap splits the talk, and the fast way becomes the child's own. This is W1's move carried into every game. |
| FS6 | **Gem battles get no rabbit tap and no pair,** because the purple bar is running. | A wait for a tap, or 3 s of talk, costs the child time on the clock. |

### 9.8 Recorded, and the QA

The 40 lines are recorded in one block at the end of `LINES`: `// --- Fast and slow (docs/TEACHER_SCRIPT.md §9, 27 Sep)`. Each take is made with `gen-audio.ts lines --only …` (en-GB, plain text), with Gemini's judge, the pace and tail gates and the loudness rule, then checked with faster-whisper (`playtest/voice/qa.py`, `small.en`) word for word, and for letter names, pace, loudness and the lead-ins' tails. The first recording's QA is in [`playtest/voice/fast-slow/qa.json`](../playtest/voice/fast-slow/qa.json). `durations.json` has the lengths. The 16 lines added on 27 Sep still need their tags in `src/core/content/line-tags.ts` (docs/fix-requests.md, "Fast and slow"), and its hashes for the four reworded lines below are of the old texts (their tags still fit).

**The voice.** Sensei has been Gemini's Erinome since 27 Sep, 09:33 (docs/DECISIONS.md). The lines retaken for their accent (below) are Erinome takes. The rest were first recorded in Sulafat, and the Erinome re-record of every Sensei line (`playtest/runs/revoice/shard-*.txt`) replaces them, with the same gates and the accent judge's 80 % bar. At 12:15 on 27 Sep, 22 of the 40 were still Sulafat.

**The accent.** Every take with a BATH word (fast, last, after, ask), an r after a vowel (word, first, tortoise) or a t between vowels (little, tortoise) is judged by `scripts/accent-judge.ts` (docs/TREADMILL.md, "The accent judge"): Gemini 3.1 Pro, word by word, 21 votes a word, calibrated every run on British (ElevenLabs Alice and George) and American (OpenAI coral) readings of the same sentences, and refusing to judge when they don't separate. A take is kept at 80 % British or more on every word over 42 votes (21 to pick it and 21 fresh ones, because the best of 20 takes on 21 votes is often lucky), from up to 20 takes of a wording. The first check (3 votes, "British /ɑː/ or American /æ/?", no calibration), whose table this section had until now, passed takes this judge hears as American or in between.

**15 lines retaken (27 Sep):** the seven the fast-and-slow checker heard as American or in between, and eight more where this judge heard an American r when it judged all 40. "Before" is the Sulafat clip before this fix; "now" is what the game plays. The before and now votes are all from one run of the judge, after the takes were picked.

| id | the line now | before (Sulafat) | now (Erinome) | British now | takes | picked on |
|---|---|---|---|---|---|---|
| `tv_fs_made` | Every word is made of little sounds, one by one. | "after" 7/21; r in "word" 20/21; r in "another" 21/21 | r in "word" 20/21; t in "little" 20/21 | 95 % | 42 (20 of the old words, 20 of "one by one", 2 of these) | 93 % on 42 ("word" 40, "little" 39) |
| `tv_fs_rabbit` | The rabbit pushes the sounds together, and says the word fast. | "fast" 0/21; r in "word" 0/21 | "fast" 20/21; r in "word" 19/21 | 90 % | 1 | 88 % on 42 ("fast" 20 + 17) |
| `tv_fs_now_fast` | And now, fast… | "fast" 14/21 | "fast" 19/21 | 90 % | 25 (20 of the old words, 5 of these) | 90 % on 42 ("fast" 38) |
| `tv_fs_ninjas_can` | Ninjas can say a word slowly, and fast too. | "fast" 7/21; r in "word" 19/21 | "fast" 18/21; r in "word" 20/21 | 86 % | 17 | 88 % on 42 ("fast" 19 + 18) |
| `tv_ts_fast` | The rabbit says words fast… | "fast" 14/21; r in "words" 21/21 | "fast" 14/21; r in "words" 20/21 | 67 % | 20 | 74 % on 42 ("fast" 16 + 15): the best of 20, none reached 80 % |
| `tv_learn_last` | Here's the last new sound… | "last" 11/21 | "last" 21/21 | 100 % | 5 | 95 % on 42 ("last" 20 + 20) |
| `tv_opt_ask` | Ask a grown-up to help you choose. | "ask" 18/21 | (kept) | 86 % | 0 | not retaken: 90 % on 21 ("ask" 19), over the 70 % bar |
| `tv_fs_spell` | To build a word, we say it slowly first. | r in "word" 0/21; r in "first" 0/21 | r in "word" 21/21; r in "first" 21/21 | 100 % | 3 | 95 % on 21, then 100 % on 21 fresh |
| `tv_fs_praise_both_2` | You said each sound slowly, then read the whole word. | r in "word" 0/21 | r in "word" 21/21 | 100 % | 9 | 100 % on 21, then 100 % on 21 fresh |
| `tv_fs_praise_found_2` | You pushed the sounds together, and heard the word. | r in "heard" 0/21; r in "word" 0/21 | r in "heard" 17/21; r in "word" 17/21 | 81 % | 15 | 86 % on 21, then 90 % on 42 fresh |
| `tv_fs_praise_every_4` | You listened slowly, and got the sounds in order. | r in "order" 0/21 | r in "order" 21/21 | 100 % | 2 | 100 % on 21, then 100 % on 21 fresh |
| `tv_fs_stuck_slow` | Let's say it the slow way first… | r in "first" 19/21 | r in "first" 19/21 | 90 % | 15 | 95 % on 21, then 90 % on 21 fresh |
| `tv_fs_praise_both` | Slow, then fast. That's real reading! | "fast" 11/21 | "fast" 20/21 | 95 % | 6 | 95 % on 21, then 86 % on 21 fresh |
| `tv_fs_tortoise` | The tortoise says each word slowly, one sound at a time. | r in "tortoise" 4/21; r in "word" 4/20; t in "tortoise" 20/21 | r in "tortoise" 21/21; r in "word" 21/21; t in "tortoise" 20/20 | 100 % | 17 (15 of the old words, 2 of these) | 100 % on 42 |
| `tv_fs_run` | I'll say it the slow way, and you catch the whole word. | r in "word" 0/21 | r in "word" 20/21 | 95 % | 20 (15 of the old words, 5 of these) | 95 % on 42 ("word" 40) |

- **Four lines are lightly reworded** (§9.4, docs/DECISIONS.md), because Erinome's accent depends on the whole sentence. She gave "word" an American r in all 20 takes of "Every word is made of sounds, one by one." (the F3 measure agrees: 0.54–0.75 of her usual F3, against 0.93–0.97 in "…one after another.") and in all 15 of "…You catch the whole word.", and "after" stayed in between over 20 takes of "one after another". A few raw takes of each candidate wording (6 a wording, 6 votes a word) showed which ones she says British: "…made of little sounds, one by one." in 5 of 6 (against 1 of 6 for "one by one" alone), "…says each word slowly…" and "…the slow way, and you catch the whole word." in 2 of 6 (the old wordings 0 of 6). "And now, fast…" was the best of five wordings for `tv_fs_now_fast` ("fast" at the end).
- **`tv_ts_fast`** ("The rabbit says words fast…", §7, so its text stays): Erinome's "fast" was /æ/ or in between in all 20 takes. The best (74 % on 42 votes, 67 % on the run above) replaces the Sulafat clip, which is no better, and is still in between: one for Jonas's ear. A light rewording would be the next thing to try.
- **`tv_opt_ask`** was 86–90 % British as it was, so it is not retaken here. It is Sulafat, and the Erinome re-record (shard 0) takes it again with the 80 % gate.
- **`tv_fs_tortoise` is now 6.2 s** (it was 4.7 s): the British takes were the slow ones. It was already kept out of tight runs (§9.5).

**The other 25 lines**, as the listening page has them (12:15, 27 Sep):

| id | voice | length | British votes (21 a word) | British |
|---|---|---|---|---|
| `tv_fs_two_ways` | Sulafat | 3.69 s | "fast" 20/21; r in "word" 21/21 | 95 % |
| `tv_fs_gaps` | Sulafat | 3.42 s | t in "little" 17/21 | 81 % |
| `tv_fs_read` | Sulafat | 3.60 s | r in "first" 21/21; r in "word" 21/21 | 100 % |
| `tv_fs_same` | Sulafat | 3.61 s | r in "tortoise" 20/21; r in "word" 21/21; t in "tortoise" 20/20 | 95 % |
| `tv_fs_ninja` | Sulafat | 4.67 s | "fast" 18/21; r in "first" 21/21; r in "words" 21/21 | 86 % |
| `tv_fs_mantra` | Sulafat | 4.67 s | "fast" 18/21; r in "word" 19/21 | 86 % |
| `tv_fs_find` | Sulafat | 3.80 s | no target words | – |
| `tv_fs_hiding` | Erinome | 3.34 s | "fast" 15/21; r in "word" 19/21 | 71 % |
| `tv_fs_whole` | Sulafat | 2.94 s | r in "word" 21/21 | 100 % |
| `tv_fs_push` | Erinome | 2.74 s | r in "together" 21/21; r in "word" 19/21 | 90 % |
| `tv_fs_turn` | Sulafat | 3.43 s | r in "turn" 20/21 | 95 % |
| `tv_fs_next` | Erinome | 4.02 s | no target words | – |
| `tv_fs_start_end` | Sulafat | 3.12 s | no target words | – |
| `tv_fs_count` | Sulafat | 3.37 s | no target words | – |
| `tv_fs_say_sounds_slow` | Sulafat | 2.62 s | no target words | – |
| `tv_fs_rabbit_read` | Sulafat | 3.49 s | "fast" 21/21; r in "word" 21/21 | 100 % |
| `tv_fs_say_slow` | Erinome | 2.40 s | no target words | – |
| `tv_fs_slow_tortoise` | Sulafat | 2.94 s | r in "first" 20/21; r in "tortoise" 21/21; t in "tortoise" 21/21 | 95 % |
| `tv_fs_fast_rabbit` | Sulafat | 2.86 s | "fast" 20/21 | 95 % |
| `tv_fs_stuck_again` | Sulafat | 3.83 s | no target words | – |
| `tv_fs_stuck_push` | Erinome | 4.09 s | "fast" 14/21; r in "together" 21/21 | 67 % |
| `tv_fs_praise_found` | Sulafat | 2.90 s | r in "heard" 18/21; r in "word" 18/21 | 86 % |
| `tv_fs_praise_every` | Sulafat | 3.37 s | no target words | – |
| `tv_fs_praise_both_3` | Sulafat | 3.71 s | "fast" 13/21 | 62 % |
| `tv_fs_praise_found_3` | Sulafat | 3.44 s | r in "word" 21/21; t in "little" 19/21 | 90 % |
| `tv_fs_praise_found_4` | Sulafat | 3.17 s | r in "word" 21/21 | 100 % |
| `tv_fs_praise_every_2` | Sulafat | 4.05 s | no target words | – |
| `tv_fs_praise_every_3` | Erinome | 4.83 s | no target words | – |

Below 80 %: `tv_fs_hiding` (71 %) and `tv_fs_stuck_push` (67 %), both Erinome takes installed by the re-record at 12:05–12:10, and `tv_fs_praise_both_3` (62 %, Sulafat, not yet re-recorded). Their "fast" is in between. The re-record gates at 80 % on 21 votes, and a pick on 21 votes can be lucky, so these three want 21 fresh votes and, if they hold, a retake.

**Listen.** The slow-words listening page (`playtest/slow-words/`, on R2; `upload.sh` prints its URL) has all 40 lines as the game plays them, and "For your ear: British or not?": the 15 retaken lines, old against new, with these votes.

**History.** The first BATH check (the morning of 27 Sep) retook 14 lines, up to 8 rounds each, on its 3-vote judge, and two new praise lines were rewritten without "fast" rather than fight it (`tv_fs_praise_both_2` and `tv_fs_praise_found_4`); `tv_fs_start_end` ("Slowly, we hear the start, middle and end.") never came in under 3.5 s, so it now says "The slow way shows us where each sound goes." (the id stays, since `narrative.ts` uses it). Notes on the first recording (Sulafat): `tv_fs_mantra` was once heard as "sound" for "sounds"; `tv_fs_fast_rabbit`'s 6.8-semitone rise came down to 0.1; three lead-ins rose and were kept as suspended statements, under gen-audio's 8-semitone limit (`tv_fs_say_sounds_slow`, `tv_fs_stuck_again` and `tv_fs_say_slow`).

---

## 10. Picture reading v2 and the read slider (Jonas, 27 Sep)

> **Status (27 Sep, appended by the fix workflow's integration step):** designed and built as a component (`src/ui/ReadSlider.tsx`, 47 lines recorded), **not yet in the game**. The follow-up workflow wires it into W2, W4 and W6 in one release (docs/fix-requests.md, "Picture reading v2 and the read slider"; docs/QUEUE.md 0b). Until then §3.7, §3.8, §3.10 and §3.12 are what plays.

> "I don't want you to use fish dog. I want you to use other words because I don't want it to come across as stealing from Mentava. … I think you should use it as a way to introduce the slow and the fast reading, right? You could say, okay, we can also read longer words made from shorter words. … It's like rainbow, not bow rain. … I think one thing that you could ask the user to do is drag their finger from left to right … And then we can have this sort of interface also with sounds where you slide across and the sensei says, say the sounds with me."

W2's and W4's picture reading are rebuilt on the **read slider** with real compound words, and W6's Sound Dots become the **Sound Slider**. The child slides the tortoise from left to right under two pictures (or under a picture's sound dots); each part is said once as the tortoise reaches it (the slow way); the rabbit's tap says the whole word (the fast way). A right-to-left slide reads nothing and gets a gentle line. Sensei's paw does every demo, slowly, in the first person, and she alone ever reads backwards ("Bow rain! It's raining bows!").

- **The beats** (the anatomy tables for W2, W4 and W6): docs/PICTURE_READING.md §3–§5. **The mechanic** (its rules, the wrong way, the idle ladders, Help, demo mode, the bot contract): docs/READ_SLIDER.md. The words: `src/content/compounds.ts`. This section is the index and the list of lines.
- **§9 (fast and slow, more often) holds**: the slider is its tortoise and rabbit made physical, and the new praise lines join §9.5's rotation (each at most once a session).

### 10.1 What it replaces

| Here | Rows | Becomes |
|---|---|---|
| §3.7 A, Ninja Reading (`rail`) | `tv_rail_frame`, `tv_rail_ido`, `fm_read_fish_dog`, `tv_rail_ready`, `tv_rail_turn`, `fm_pair_fish_dog` | PICTURE_READING §3 A–C: `pr_frame`, `pr_demo` and Sensei's slow read of rain + bow, the child's rabbit, `pr_demo_back` and her backwards show, `pr_back_rainbow` |
| §3.7 B, the swap | `fm_l2_swap` | gone (the backwards show is the only reversal, and it is Sensei's) |
| §3.7 C, two rows (`which`) | `tv_which_frame`, `tv_which_demo`, `tv_which_so`, `tv_which_q_*`, `fm_pair_cat_dog` | gone (Mentava's readiness check: research §2) |
| §3.7 D, Word Squish (`compound`) | `tv_squish_frame`, `tv_squish_slow`, `tv_squish_fast`, `fm_name_star`, `fm_starfish_q`, `fm_starfish`, `tv_praise_squish` | folded into Ninja Reading; **`tv_squish_ready` stays** as the Ready ("Two little words make one big word. Now you make one. Are you ready?"), then the child's slides (§3 D–E) |
| §3.7 E, Pocket Hunt | the 2×2 grid with fish and dog | sunflower, sock, cake and bow (no fish next to a dog anywhere) |
| §3.8, Reward 2 | `fm_rw2_list`, `fm_rw_shiny`, `fm_rw2_s` | `pr_rw2_list`, `pr_rw_shiny` (the shiny sticker is the rainbow), `pr_rw2_s` |
| §3.10, W4 | `tv_rail_again`, `tv_rail_yours`, `fm_triple_cat_dog_fish`, `fm_l4_swap`, `tv_which_again`, `fm_triple_fish_dog_cat`, `tv_squish_again`, `fm_rainbow`, `tv_w4_done` | PICTURE_READING §4: `pr_recap`, Sensei's canonical demo, `pr_your_turn`, raincoat (with the `coatrain` show), football, ◇ treehouse, `pr_w4_done` |
| §3.12, W6 Sound Dots | the child taps each dot (`tv_dots_ido`, `tv_dots_word_ido`, `tv_dots_ready`) | PICTURE_READING §5, the Sound Slider: `tv_dots_frame` stays, `pr_sounds_demo`, `rs_sounds_with_me` |
| §2's table of "first meetings" and §4's frames | `tv_rail_frame` "Ninjas always start on this side, and go this way." | `pr_frame` "Ninjas always read this way." (with the rail's light and the ninja's run on "this") |
| §7's lists | every id above that goes | `RETIRED_LINES`, "retired: picture reading v2 (27 Sep)" (docs/fix-requests.md lists them) |

### 10.2 The rules for these lines

- **The idea comes first**: "Two little words can make one long word." opens Sensei's demo, and `tv_squish_ready` says it again at the hand-over (Jonas: "we can also read longer words made from shorter words").
- **Demos**: the lead-in in the first person, and the paw sets off on "Watch" (READ_SLIDER §5). The paw is Sensei's own; the cream glove is only ever the ghost hand, "your turn".
- **The wrong way**: three lines in turn, none says "wrong" or "No", "left to right" only in the first; the corrections lead with "Let's" (27 Sep: the rule first was heard as stern).
- **Praise** only for the child's own fast word (the rabbit tapped), never after Sensei said it herself.
- **"Fast"** is said only in `rs_now_fast` (a BATH word, checked /ɑː/).

### 10.3 The lines and their clips

Recorded in Erinome (en-GB), plain text; every clip word-perfect by Whisper, at most 3.3 words a second, −16 LUFS. **Accent**: the calibrated judge (`scripts/accent-judge.ts`: r after a vowel, t between vowels, the BATH vowel), the clip's lowest word, British share of votes (votes a word). **Warmth**: a Gemini listen, "a kind old red panda talking to a 3-year-old", 1–5 (votes). The seven fix-round-1 clips were taken on `gemini-3.8-flash-lite-tts` (the 3.8-flash quota ran out) with `playtest/read-slider/audio/retake.ts`, and pass ≥ 80 % British on every word, warmth ≥ 4.0 (≥ 4.3 with at most one "told off" for the corrections and the frame); the rest are the first round's, with the judge's 7-vote accent and 3-vote warmth.

| id | text | s | words/s | accent | warmth | model |
|---|---|---|---|---|---|---|
| `rs_how` | Put your finger on the tortoise, and slide it this way. | 3.45 | 3.19 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `rs_back_1` | That way is backwards. We always read from left to right. | 3.83 | 2.88 | 100 % (7) | 3.3 (3) | 3.8-flash |
| `rs_back_2` | Let's try again from the tortoise. Ninjas always start on this side. | 4.84 | 2.48 | 100 % (21) | 4.88 (8) | 3.8-flash-lite, fix round 1 |
| `rs_back_3` | The tortoise only walks this way. Start here, and slide it along. | 4.59 | 2.61 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_start_here` | Let's start on this side. Put your finger on the tortoise. | 4.11 | 2.67 | 100 % (21) | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `rs_idle` | Put your finger on the tortoise when you're ready. | 2.76 | 3.26 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `rs_keep_going` | Keep going, all the way to the rabbit. | 2.44 | 3.28 | no target words | 4.7 (3) | 3.8-flash |
| `rs_again` | Let's slide it again, from the very start. | 2.75 | 2.91 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_sounds_with_me` | Now you slide it, and say the sounds with me. | 3.08 | 3.25 | no target words | 5.0 (3) | 3.8-flash |
| `rs_now_fast` | That was the slow way. Now tap the rabbit, and say it fast. | 4.17 | 3.12 | 71 % (7) | 3.3 (3) | 3.8-flash |
| `rs_slowly` | The tortoise likes to go slowly. Try it slowly, like me. | 5.74 | 1.92 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `rs_praise_1` | You read each little word, then the whole big word. | 3.61 | 2.77 | 95 % (21) | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `rs_praise_2` | Tortoise first, then the rabbit. That's ninja reading! | 4.14 | 1.93 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `rs_praise_3` | You started at the beginning, and went all the way. | 3.27 | 3.06 | 71 % (7) | 4.0 (3) | 3.8-flash |
| `pr_frame` | Ninjas always read this way. | 1.88 | 2.66 | no target words | 4.75 (8) | 3.8-flash-lite, fix round 1 |
| `pr_demo` | Two little words can make one long word. I'll read this one slowly first. Watch my paw... | 6.86 | 2.48 | 90 % (21) | 4.88 (8) | 3.8-flash-lite, fix round 1 |
| `pr_demo_back` | Now watch what happens if I start on the other side... | 3.35 | 3.28 | 100 % (7) | 4.3 (3) | 3.8-flash |
| `pr_back_rainbow` | Bow rain! It's raining bows! We always start on this side. | 4.76 | 2.31 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_back_raincoat` | Coat rain! It's raining coats! We always start on this side. | 4.10 | 2.68 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_snowman` | Man snow! It's snowing tiny men! We always start on this side. | 5.44 | 2.02 | 100 % (21) | 4.40 (15), 0 told off | 3.8-flash, 28 Sep retake (a 3.3 s pause cut to 0.7 s) |
| `pr_back_cupcake` | Cake cup! A cup made of cake! We always start on this side. | 4.02 | 3.23 | 100 % (21) | 4.80 (15), 0 told off | 3.8-flash, 28 Sep retake |
| `pr_back_football` | Ball foot! A ball with toes! We always start on this side. | 4.33 | 2.77 | 100 % (21) | 4.53 (15), 1 told off | 3.8-flash, 28 Sep retake |
| `pr_back_treehouse` | House tree! That's silly. We always start on this side. | 3.99 | 2.51 | 86 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_cowboy` | Boy cow! That's silly. We always start on this side. | 4.56 | 2.19 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_back_sunflower` | Flower sun! That's silly. We always start on this side. | 4.64 | 2.15 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_back_pancake` | Cake pan! A frying pan made of cake! We always start on this side. | 6.28 | 2.23 | 100 % (21) | 5.00 (15), 0 told off | 3.8-flash, 28 Sep retake |
| `pr_another` | Here's another long word. | 1.29 | 3.10 | 86 % (7) | 4.7 (3) | 3.8-flash |
| `pr_sounds_too` | Words are made of sounds, too. Let me show you... | 3.19 | 3.14 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_sounds_demo` | Let's say I want to read this word. I'll say its sounds first. Watch my paw... | 5.05 | 3.17 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_recap` | It's Ninja Reading again. Little words make long words. | 4.02 | 2.24 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `pr_your_turn` | Now it's your turn. Slide the tortoise this way. | 3.26 | 2.76 | 100 % (7) | 3.7 (3) | 3.8-flash |
| `pr_short` | It's Ninja Reading again. Slide the tortoise this way. | 3.83 | 2.35 | 100 % (7) | 4.7 (3) | 3.8-flash |
| `pr_w4_done` | You read lots of long words, the ninja way. | 2.93 | 3.07 | 100 % (21) | 5 (8) | 3.8-flash-lite, fix round 1 |
| `pr_last_word` | The last little word tells you what it is. | 2.88 | 3.13 | 86 % (7) | 5.0 (3) | 3.8-flash |
| `pr_what_rainbow` | A rainbow is a big bow of colours in the rain. | 3.70 | 2.97 | 100 % (7) | 3.3 (3) | 3.8-flash |
| `pr_what_snowman` | A snowman is a man made of snow. | 2.76 | 2.89 | no target words | 4.7 (3) | 3.8-flash |
| `pr_what_cupcake` | A cupcake is a little cake in a paper cup. | 3.07 | 3.25 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_what_raincoat` | A raincoat is a coat for the rain. | 2.56 | 3.12 | no target words | 3.7 (3) | 3.8-flash |
| `pr_what_football` | A football is a ball you kick with your foot. | 3.51 | 2.85 | no target words | 3.3 (3) | 3.8-flash |
| `pr_what_treehouse` | A treehouse is a little house up in a tree. | 3.15 | 3.17 | 86 % (21) | 4.63 (8) | 3.8-flash-lite, fix round 1 |
| `pr_what_cowboy` | A cowboy is a boy who looks after cows. | 2.91 | 3.09 | 100 % (7) | 3.7 (3) | 3.8-flash |
| `pr_what_sunflower` | A sunflower is a big flower that looks like the sun. | 4.13 | 2.67 | 86 % (7) | 3.7 (3) | 3.8-flash |
| `pr_what_pancake` | A pancake is a flat cake you make in a pan. | 3.43 | 3.21 | no target words | 5.0 (3) | 3.8-flash |
| `pr_rw2_list` | Rain, bow, snow, man, snowman, cup, cake and cupcake! | 6.62 | 1.36 | no target words | 4.0 (3) | 3.8-flash |
| `pr_rw_shiny` | Ooh, a shiny sticker! Rainbow! | 2.56 | 1.96 | 100 % (7) | 5.0 (3) | 3.8-flash |
| `pr_rw2_s` | Sun, sock, sausage and snowman. They all start with... | 5.61 | 1.61 | 100 % (7) | 4.3 (3) | 3.8-flash |
| `pr_map_replay` | Do you want to play Ninja Reading again? | 2.45 | 3.26 | no target words | 4.7 (3) | 3.8-flash |

Still to watch (not blocking, first-round clips): `rs_now_fast` and `rs_praise_3` at 71 % on 7 votes, `rs_back_1`, `rs_now_fast`, `pr_back_snowman` and `pr_what_rainbow` at 3.3 warmth on 3 votes, `pr_back_cupcake` (1.3 on 3 votes; 4.3 on the judge's 8); and one listener heard `pr_what_rainbow`'s "bow" as the bow of bowing down (/baʊ/): check it by ear. The next re-take on 3.8-flash (docs/fix-requests.md) should take them through `retake.ts`'s gates too.
