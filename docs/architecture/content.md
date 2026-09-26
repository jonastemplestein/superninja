# Content adapters: curriculum, evidence, lines, notions, durations

Module: `src/core/content/`. Types: `Curriculum`, `WordEntry`, `LineMeta`, `LineBook`, `NotionInfo`, `Dosage`, `Provider`, `DurationTable` in `src/core/types.ts`. Stage 1 builds the line book, line tags, notions, cues and durations; the curriculum and `evidenceFor` come with the learner (stage 2); the warm-ups adapter with the engine (stage 3).

These are the only places the core reads content. All of them are pure and read-only, built once at start-up. They import only the pure content modules: `sw.ts`, `phonics.ts`, `units/*.ts`, `lines.ts`, `teach-lines.gen.ts`, `stories.ts`, `pic-names.ts`, `flower.ts` and, once it lands, `warmups.ts` (FIRST_MINUTES §15). They never import `teach.ts` (it reads localStorage when the module loads) or `worlds.ts`'s impure helpers.

## 1. Curriculum (`curriculum.ts`)

`createCurriculum({ split }): Curriculum` builds the whole thing.

- **`sequence`** is `SW_SEQUENCE` (IC1–IC11, BR, EC1–EC49), with the polysyllabic stages PW1… slotted in at their milestones (PW1 from week 2 of EC4).
- **Units** come from `src/content/units/*.ts` (IC1–IC11, BR today; EC units as the content pipeline produces them), parsed with the segs notation (`.` separates spellings, `=` overrides the sound, `:n` gives a split spelling's gap).
  - `UnitContent.newGpcs` is `newGpcsIn(unit, { split })`.
  - `lessons` comes from the sw.ts unit records.
  - `kind`: IC units are `initial`, BR is `bridging`, EC units are `ec-sound` or `ec-spelling`, and PW stages are `poly`.
- **Words** are the union of unit words and today's `phonics.ts` `WORDS`. The two are mapped by the rule in SOUNDS_WRITE_MODEL.md §7, step 1: phonics units 1–11 are IC1–IC11, and phonics unit 12 is split into EC1, EC2, EC4 and EC11 by GPC.
  - `WordEntry.unit` is the first unit where the word is decodable (`isDecodableAt`).
  - `picSafe` is true when `pic-names.ts` has no entry for the word, or has one whose first sound and vowel match.
  - `picSaysFirst` is true when there is no entry, or its first-sound flag is true.
  - `stretched` reads the list of recordings in `public/a/x/` (via the durations manifest).
  - `dictationSafe` follows `phonics.ts dictationSafe` (a picture, or no other word with the same sounds).
  - `continuantStart` is true when the first sound is one of m s f n l r v z sh th, or a vowel.
  - `ORAL_WORDS` become entries with `oralOnly: true`.
- **`knownAt(unit)`** is `knownGpcsAt(unit, { split })`.
- **`back(unit, n)`** is the unit n places back in `sequence`.
- **`lessons(unit, part)`** reads sw.ts `SESSION` for the unit's level.
- **`words(q)`** filters. `decodableWith` checks every seg's GPC is in the set. The result is sorted by text, so it is deterministic.
- **`contrasts(word, o)`**: words of the same length differing in exactly one segment (at `o.position` if given), decodable with `o.known` if given. Used for foils and Lesson 10.
- **`preCode`** holds the PEDAGOGY.md word sets: minimal pairs (pan/pin, map/mop, tap/top, cat/cot, hat/hot, pen/pin, peg/pig), first-sound targets per sound, and middle-sound pairs.

## 2. `evidenceFor`: which KCs an attempt bears on

`evidenceFor(item: ItemSpec, step: number, mechanic: MechanicId): EvidenceRef[]` in `evidence.ts`. This is the one place it is decided. The mechanic KC (`mech:${mechanic}`) is always a `component`.

| Item kind (activity) | Target | Components | Context |
|---|---|---|---|
| `word-building` / `dictation` word / `poly-spelling` (step = slot k) | `gpc:${seg_k}:spell` (position k) | `skill:segmenting:${structure}`; `word:${w}:spell` when the slot's sound has ≥ 2 taught spellings | – |
| `symbol-search` | `gpc:${answer}>${sound}:spell` | – | `word:${contextWord}:read` |
| `word-reading` / who read it right / `read-write-check` / `reading-in-text` per word / `timed-review` | `gpc:${seg at the contrast or error position}:read` (with position) | every other seg's `gpc:X:read`; `skill:blending:${structure}` | – |
| `sound-swap` step 2k (which sound changes) | `skill:phoneme-manipulation:${op}` | – | – |
| `sound-swap` step 2k+1 (which spelling) | `gpc:${toSeg}:spell` | `skill:phoneme-manipulation:${op}` | – |
| `sound-sort` | `gpc:${spelling of the target sound in the word}:read` | `concept:3` | – |
| `spelling-sort` | `gpc:${spelling}>${answer}:read` | `concept:4` | – |
| `spelling-choice` | `word:${w}:spell` and `gpc:${answer}>${sound}:spell` (both targets) | `concept:3` | – |
| `oral-first-sound` / `oral-middle-sound` | `pa:first-sound` or `pa:middle-sound`, and `sound:${p}:hear` | – | `word:${target}:read` |
| `oral-listening` / `oral-blending` / `oral-segmenting` | `pa:discriminate` / `pa:oral-blend` / `pa:oral-segment` | – | – |
| `tap-all` (a find, or a wrong tap) | `pa:first-sound` or `pa:middle-sound`, and `sound:${p}:hear` | – | `word:${card}:read` |
| `rail` judged on order; `choice` with an answer ("which did I read?") | `pa:left-to-right` | – | – |
| `rail` judged `none`, `tutorial`, `choice` without an answer | only `mech:${mechanic}` (as target) | – | – |

Special words in text are `special:${w}` targets and never GPC evidence.

## 3. Line tags (`line-tags.ts`) and the line book (`linebook.ts`)

**`LineMeta` for every line** in `LINES`, including the generated teach lines and FIRST_MINUTES's `fm_*` lines: speaker, purpose, tags, needs, steps, repetition, `givesAnswer`, and a `hash` of the line's text and speaker when it was tagged.
- It lives in a sidecar so `lines.ts` stays as it is while other agents edit it.
- **A missing or stale entry is an audit finding, not a failed build.** A line said without meta, or whose text or speaker changed since it was tagged (its meaning may have changed, so its tags may be wrong), gives an `untagged-line` finding. The build only fails on it from stage 7, when the director relies on tags, on a date agreed with the `lines.ts` owners.
- Meta that refers to a line that no longer exists is reported the same way.
- `LineMeta` never uses the roles `demonstrate` (only `exp.modelled` demonstrates) or `use` (only attempts).
- **One explaining line per provider.** A provider spread over several lines tags `explain` on the line that states the idea (`fm_same_word` for fast and slow; `fm_hear_sounds` for words made of sounds) and `mention` on the rest. The ledger also counts at most one explanation per key per beat.
- **Bootstrap** (`scripts/sim/tag-lines.ts`):
  1. Deterministic rules first:
     - lines whose ids start `yay_`, `well_` or `streak_` are `praise` with repetition `vary`;
     - `t_*` and `tg_*`/`tp_*` lines are `explanation`;
     - `help_*` are `hint`;
     - `film_*` are `exposition` with `char:` and `fact:` tags.
  2. For the rest, Jev (docs/JEV.md, rules 1–3) answers per line and per candidate key from the notion registry: a `choice` question, "Does this line explain, remind, mention, ask about, or not involve <label>?", with the line's section and screen context in the state; and a `noul` question per candidate need, "Would a child who had never been told about <label> be lost by this line?". Thresholds are calibrated on a labelled set of 30 lines.
  3. A person reviews the draft once.
  4. **New and rewritten lines:** `bun scripts/sim/tag-lines.ts --missing --stale` drafts meta for lines without it or with a stale hash, in the same change that adds or rewrites them (the FIRST_MINUTES block of about 90 `fm_*` lines first).
- **Seeds for the inventory:** `docs/NARRATIVE_AUDIT.md` and `playtest/narrative/audit.json` (a parallel workflow) list every concept a child must understand, with where each is first needed and explained. They seed both the notion registry and the tags.

**`LineBook.utter(spec, o)`** builds an `Utterance`:
- `text`: line texts (with a trailing "..." dropped when a word follows), sounds as `/m/`, words in quotes, stretched words as `"mmmaaat" (slowly)`, sounds lists as `/m/ /a/ /p/`.
- `tags`: the union of the lines' tags; plus `word:W` as `mention` for every `word` or `stretch` part; `sound:p` as `mention` for every `sound` part; and for `sounds` parts, `sound:p` for each. The builder may add more (e.g. `ask` for the prompt's target word).
- `needs`: the union of the lines' needs, plus the builder's.
- `lines`: the line ids in order.
- `estMs`: the sum of the clip durations from the `DurationTable` plus gaps. A `sounds` part is each sound plus `gapMs` (default 320). A missing clip costs 350 ms per word and is reported by the `missing-audio` audit.
- `interruptible`, `reveal` and `variant` come from the options; `moment` from a teach spec.

**`teach.ts` (the port):** `introPetal`, `introGem`, `newGem`, `sameSound`, `sameSpelling`, `canBe`, `sayHere`, `whichSound` and `revisitIntro` become pure functions `(moment, rotation, curriculum, met: ReadonlySet<string>) → UtteranceSpec`. Rotation comes from `ledger.moments[moment]` instead of localStorage. They keep the Sounds~Write wording and the example choice rules (`examplesFor`, `soundExamples`) exactly.

## 4. Cues (`cues.ts`)

A table of tags and needs per cue kind, so the log and the audits see what was shown, not only what was said. For example: `gem-energy` shows `obj:gem` and needs `idea:gems-fill-with-practice`; `sticker` shows `word:W` and needs `obj:sticker-book`; `petal` shows `obj:petal` and needs `obj:world-flower`; `hint` and `name-card` show the target's `word:W`. The engine attaches them to each `exp.cue`.

## 5. The notion registry (`notions.ts`)

A `NotionInfo` for every non-content key a child must understand: ideas, concepts, terms, mechanics, characters, places, story facts and game objects.
- Each has a label, dependencies, providers, a dosage (the defaults per kind are in [director.md §2](director.md#2-dosage-defaults)), `notBefore`, `assumedFrom` and `selfEvident`.
- **Content keys** (`gpc:`, `sound:`, `word:`, `spelling:`, `special:`) have built-in providers:
  - `gpc:X`: the `intro-gem` teach moment, or the first-sound reveal (`how_we_spell` + sound) in the Initial Code;
  - `sound:p`: `intro-petal`;
  - `word:W`: naming ("This is a…" + word);
  - `special:W`: "This is W. Say W." (the `this_is` line + word + `t_say`).

**Starter entries** (the minimum for Chapter 0, the warm-ups and Bamboo Village; the rest come from the narrative audit). Chapter 0 and the warm-ups use FIRST_MINUTES.md's own lines as providers; nothing here invents a rival line.

| Key | Depends on | Full provider | Short provider | Notes |
|---|---|---|---|---|
| `char:sensei` | – | `intro_8` | – | |
| `char:baron`, `fact:petals-scattered`, `obj:world-flower` | – | film shots `film_1`–`film_6` | recap line (new) | recap after 2–3 days away |
| `mech:help-button` | `char:sensei` | the dojo welcome: `fm_help_short`, the child's tap, `fm_help_ok` | – | replaces `tut_help` |
| `mech:replay-button` | – | **none yet**: FIRST_MINUTES retires `tut_speaker` without a replacement | – | the first coverage report will show it; a question for the FIRST_MINUTES owner |
| `mech:tap-picture` | – | the first guided tap: `fm_tap_sock` (tagged explain) with its answer glowing after 2 s | – | |
| `idea:fast-and-slow-saying` | – | W1's fast/slow show, a `script` provider: `fm_fast_sun`, `fm_slow` + the stretched word, `fm_same_word`, with `fast-slow` cues | the fast/slow recap of W3 on a new word | |
| `idea:words-are-made-of-sounds` | `idea:fast-and-slow-saying` | `fm_hear_sounds` ("…the sounds that make up the word. Words are made of sounds!") with the sound dots | `words_made` ("Words are made of sounds. Listen!") | today: never played |
| `idea:first-sound` | `idea:words-are-made-of-sounds` | W1's notice beat: `fm_first_listen` + the held first sounds, `fm_notice_sun_sock` + /s/ | `first_q` context | |
| `idea:left-to-right` | – | W2: `fm_l2_way` with the ninja's run along the rail, then Sensei's rail read (`fm_read_fish_dog`) | – | |
| `idea:middle-sound` | `idea:first-sound` | W3's "/a/ in it" (`fm_tap_all_in` + /a/, with the stretched words); `hunt_intro` later | – | |
| `idea:sounds-have-spellings` / `term:spelling` | `idea:first-sound` | the first-sound reveal: `how_we_spell` + sound, with the spelling cast onto its line | "This is how we spell…" | |
| `idea:one-line-per-sound`, `mech:tile-to-line` | `term:spelling` | I do: `build_ido_1`–`build_ido_3` | `help_tiles` | Dojo `Build` has no I do today |
| `idea:say-the-sounds-read-the-word` | `idea:words-are-made-of-sounds` | `say_sounds_read`, modelled twice before the child is asked | – | repetition `routine` |
| `term:sound-tile` | `term:spelling` | new line "These are sound tiles. Each one is a spelling of a sound." | `help_tiles` | |
| `mech:tap-reader`, `mech:tap-sound-buttons` | `idea:say-the-sounds-read-the-word` | I do of who read it right | `read_tap_sounds` | |
| `idea:change-one-sound` | `idea:words-are-made-of-sounds` | new demo: Sensei changes one sound of a word | `swap_start` | |
| `term:dojo` | – | `dojo_hello` | – | |
| `obj:sticker-book`, `idea:stickers-for-pictures` | – | Reward 1: `fm_rw_book`, `fm_rw_every` | `fm_rw_more` | replaces `obj:word-book` (`book_i1`–`book_i3` are retired) |
| `obj:petal` | `obj:world-flower` | Reward 2: `fm_rw2_petal` | – | |
| `obj:gem`, `idea:gems-fill-with-practice` | `obj:world-flower` | `flower_i3`–`flower_i5`, through the `screen` machine | `gem_energy` | the gem ring and energy cues need these; today they are explained only on the flower, and late (NARRATIVE_AUDIT) |
| `idea:two-letters-one-sound` (concept 2) | `term:spelling` | `t_two_letters` in the first intro-gem of a two-letter spelling | `two_letters_one_sound` | `notBefore: IC7` |
| `idea:same-sound-different-spellings` (concept 3) | `idea:two-letters-one-sound` | `sameSound()` | `same_sound_diff` | `notBefore: BR` |

## 6. Durations (`durations.ts`, `scripts/gen-durations.ts`)

- **`scripts/gen-durations.ts`** measures every mp3 under `public/a/{l,w,x,p,s}` into `public/a/durations.json` (`{ "l/tap_start": 812, … }`). It uses ffprobe when present, and otherwise a minimal MP3 frame-header parser.
- **`DurationTable`** reads that JSON and answers per part. It returns `undefined` for a missing clip.

## 7. Tests (`src/core/content/*.test.ts`)

1. The curriculum's `sequence` equals `SW_SEQUENCE` (plus PW stages at their milestones), and `knownAt` equals `knownGpcsAt` for every unit under both split policies.
2. Every `WordEntry` is decodable at its `unit`, and at no earlier unit.
3. `words({ decodableWith: knownAt(IC1) })` returns exactly the IC1 words, sorted.
4. `contrasts("sat")` includes "sit" at position 1 and "mat" at 0, and never words of another length.
5. `evidenceFor`: one test per row of the table in §2, plus: the mechanic KC is always a component; spelling targets have `position` equal to the slot.
6. **Tag coverage is reported, not gated** (until stage 7): the report lists lines without meta, meta with a stale `hash`, and meta ids missing from `LINES`. What does fail: a key in tags or needs that isn't a valid `Key`, a non-content need without a registry entry, and a `demonstrate` or `use` role in `LineMeta`.
7. `utter({ line: "listen_tap" } + word "pan")`: the text is `Tap the... "pan"`; tags include `word:pan`; estMs is the sum of the clip durations and the gap.
8. The ported teach moments give the same `Say` sequences as today's `teach.ts` for rotation 0, 1 and 2 (golden comparison), with no localStorage.
9. Registry: every notion has at least one full provider; `dependsOn` has no cycles; every provider line exists.
10. Durations: a missing clip gives `undefined`, and `utter` falls back to 350 ms per word.
11. **Cues:** every `Cue` kind has an entry in the cue table.
12. **The warm-ups adapter** reads a WARMUPS fixture: every beat kind maps as in [director.md §1](director.md#1-content-model), and each `fm_*` line has meta (or is listed by `tag-lines --missing`).
