# Script fixes: the exact list

26 September 2026. What to change so the game speaks the way [SCRIPT_STYLE.md](SCRIPT_STYLE.md) says. Each fix names the file, the function, the change, any new lines (whole sentences, Sounds~Write wording) and what the transcript should say afterwards. The evidence (runs C-P, C-L, C5-P, C5-L, C6-P, C6-L, J-P, J-L) is described in SCRIPT_STYLE §1.

**Who applies these.** Nothing here has been applied: another workflow is editing `src/scenes`, `src/App.tsx` and `src/ui` right now. The helpers in Part A are pure content (`src/content/narrative.ts`, tested in `src/content/narrative.test.ts`) and can land first; the scene changes land after the current scene work, one small change each. Line numbers are for the source at about 21:30 on 26 Sep; search for the quoted code if they have moved.

**How this fits the architecture.** ARCHITECTURE §4.2 and §6.2 give each notion a dosage (full explanations, their spacing in sessions, reminders, a per-session cap), counted by the ledger from *completed* explanations only. Until the director owns dosage (stage 7), the game's interim ledger is the per-save `narr` map in `src/scenes/narrate.tsx`. These fixes make that interim ledger behave like the designed one: spacing counted in **sessions**, short forms after the full ones, reminders only on errors once the full explanations are done, and never re-queuing an explanation that was cut off. Part E says what to change in the core so the director inherits the same rules.

Priorities: **P1** is Jonas's complaint (the two-letter family and the sort); **P2** is everything else a child hears every few minutes; **P3** is rarer or smaller.

---

## Part A. Small pure helpers (`src/content/narrative.ts`)

All pure, no React, no audio, no storage; the scenes pass in what they know. Each comes with tests in `narrative.test.ts`.

### A1. Spacing in sessions

The save counts sessions already (`store.sessions`, +1 at each title tap, `App.tsx:374`). An exposure also remembers the sessions it fell in.

```ts
/** Where a notion has been explained: level indices (for the level-spaced notions) and, from 26 Sep, the sessions. */
export interface Exposure { n: number; at: number[]; s?: number[] }
/** The exposure after one more telling at level index `at`, in session `session`. */
export const told = (e: Exposure | undefined, at: number, session?: number): Exposure => ({
  n: (e?.n ?? 0) + 1,
  at: [...(e?.at ?? []), at],
  s: [...(e?.s ?? []), ...(session === undefined ? [] : [session])],
});
/** Session schedules (SCRIPT_STYLE §4): entry k is the least number of sessions between telling k and telling k+1. */
export const SESSIONS = {
  /** a spelling's "two letters, one sound", and concept 4's "This can be…": its teach moment, then the first word
   *  with it in each of the next two sessions; after that, only on an error */
  reminder: [0, 1, 1],
} as const;
export function dueInSessions(e: Exposure | undefined, session: number, gaps: readonly number[]): boolean {
  const n = e?.n ?? 0;
  if (n >= gaps.length) return false;
  const last = e?.s?.at(-1);
  return n === 0 || last === undefined || session - last >= gaps[n];
}
```

Tests: told at session 4 → not due again in session 4, due in 5; told again in 5 → due in 6, not in 5; three tellings → never due (retired); an old exposure without `s` → due (so old saves get one telling, then the new spacing).

### A2. The letters line at a teach moment

```ts
/** How a spelling's letters are said at its teach moment (SCRIPT_STYLE §4.2 and §11.2): in full; as "This one's two
 *  letters too…" when the two-letter sentence was said in full under two minutes ago (the second spelling in a row);
 *  and not at all when two two-letter lines already fell in the last minute (the letters are on screen to see).
 *  `recent`: the letters lines said so far (game-time ms, and how many letters), oldest first. A three- or four-letter
 *  spelling is always said in full: it is different news, and it never makes the next one "two letters too". */
export type LettersForm = "full" | "too" | "none";
export function lettersForm(seg: Pick<Seg, "g" | "p">, recent: readonly { at: number; form: LettersForm; n: number }[], now: number): LettersForm {
  const n = seg.g.replace(/-/g, "").length;
  if (n !== 2 || seg.g === "x") return "full";
  const twos = recent.filter((r) => r.n === 2);
  if (twos.filter((r) => r.form !== "none" && now - r.at < 60_000).length >= 2) return "none";
  const full = twos.filter((r) => r.form === "full").at(-1);
  return full && now - full.at < 120_000 ? "too" : "full";
}
```

Tests: nothing recent → full; a two-letter full 15 s ago → too; full 15 s and too 5 s ago → none; full 3 minutes ago → full; < tch > → full whatever came before; < ie > 20 s after < igh > (three letters) → full.

### A3. Is this wrong tile a two-letter mistake?

```ts
/** A wrong tile that splits a two-letter (or longer) spelling: one of its letters, or a shorter part of it
 *  (< s > or < h > for < sh >, < a > for < ai >, < ch > for < tch >). SCRIPT_STYLE §10. */
export function splitsSpelling(tile: string, need: Pick<Seg, "g">): boolean {
  const g = need.g.replace(/-/g, "");
  return g.length >= 2 && need.g !== "x" && tile.length < g.length && g.includes(tile);
}
```

Tests: ("s", sh) true; ("h", sh) true; ("a", ai) true; ("ch", tch) true; ("t", sh) false; ("sh", sh) false; ("k", x) false.

### A4. Praise that is rationed

```ts
/** Everyday praise after a right answer (SCRIPT_STYLE §8): never when the answer's own line is the praise (a streak
 *  tier-up, a gem's first fill, a reminder), never straight before a closing line, otherwise every `every`-th right
 *  answer (2; the warm-ups keep their 3). */
export function praiseDue(o: { rightSincePraise: number; replaced?: boolean; closingNext?: boolean; every?: number }): boolean {
  if (o.replaced || o.closingNext) return false;
  return o.rightSincePraise + 1 >= (o.every ?? 2);
}
```

`engine/feedback.ts` keeps the counter: `pickPraise()` stays as it is, and a new `praiseFor(o: { replaced?: boolean; closingNext?: boolean }): string | null` counts right answers, returns `pickPraise()` when `praiseDue(...)`, else null, and resets its count when it praises. Every call site in §C15 uses it.

### A5. Question stems that rotate

```ts
/** Recorded stems for questions asked item after item (SCRIPT_STYLE §5): the first two items use the first stem, then
 *  they rotate, so no stem is said more than three times running. `has`: only stems whose audio exists. */
export const STEMS = {
  first: ["first_q", "st_first_q2", "st_first_q3"],
  find: ["dojo_find", "st_find_q2", "st_find_q3"],
} as const;
export function stemFor(stems: readonly string[], n: number, has: (id: string) => boolean): string {
  const ok = stems.filter(has);
  if (ok.length < 2 || n < 2) return ok[0] ?? stems[0];
  return ok[(n - 1) % ok.length];
}
```

Tests: n 0, 1 → stem 0; n 2, 3, 4 → stems 1, 2, 0; with only one stem recorded → always stem 0.

### A6. Instructions that fade with success

```ts
/** SCRIPT_STYLE §5: the full instruction until the child has got `after` items of this kind right first time in a row;
 *  then only the stimulus; any miss resets the run (the caller passes 0). */
export const fadeForm = (firstTriesInARow: number, after = 2): "full" | "short" => (firstTriesInARow >= after ? "short" : "full");
```

### A7. What follows a finished word

```ts
export type AfterWord = "reminder" | "gem-first" | "praise";
/** After a word's read-back (SCRIPT_STYLE §9): at most one of a reminder, the gem's first-fill explanation and
 *  everyday praise, in that order of priority; nothing when the streak tier-up or "Ninjas read this way!" already
 *  spoke for this word. What doesn't fit is deferred to the next word (not marked heard). */
export function afterWord(o: { tierUp: boolean; leftRight: boolean; reminder: boolean; gemFirst: boolean; praise: boolean }): { say: AfterWord | null; defer: AfterWord[] } {
  const want: AfterWord[] = [...(o.reminder ? ["reminder" as const] : []), ...(o.gemFirst ? ["gem-first" as const] : []), ...(o.praise ? ["praise" as const] : [])];
  const room = o.tierUp || o.leftRight ? 0 : 1;
  const say = room ? want[0] ?? null : null;
  return { say, defer: want.filter((w) => w !== say && w !== "praise") };
}
```

Tests: nothing else → praise; reminder and praise → reminder; tier-up and reminder → nothing now, reminder deferred; left-right and gem-first → gem-first deferred.

### A8. The map, the reward and the jump offer

```ts
/** What the map says on arrival (SCRIPT_STYLE §4.2): a lead that was asked for (welcome back, super listener,
 *  practise again), or the land's welcome when the land has changed since the last welcome this session; then
 *  "Tap the glowing stone…" only on a save's first two map visits (after that it is the map's idle nudge). */
export function arrivalLines(o: { world: number; welcomed: number | null; lead: string | null; hintsSaid: number }): string[] {
  const out: string[] = [];
  if (o.lead) out.push(o.lead);
  else if (o.welcomed !== o.world) out.push(`world_${o.world}`);
  if (o.hintsSaid < 2) out.push("map_hint");
  return out;
}
/** The reward's opening lines (SCRIPT_STYLE §8): the level's own closing line was its praise, so "You did it!" only
 *  when the level had none; then the news. */
export function rewardLead(o: { closingSaid: boolean; boss: boolean; newPetals: number; lastInWorld: boolean; finale: boolean }): string[] {
  const out: string[] = [];
  if (o.boss) out.push("battle_boss_win");
  else if (!o.closingSaid) out.push("yay_7");
  if (o.newPetals) out.push(o.newPetals > 1 ? "petals_got" : "petal_got");
  if (o.lastInWorld && !o.finale) out.push("world_done");
  return out;
}
/** The jump-ahead offer (SCRIPT_STYLE §4.2): never in a child's first two sessions; then at most once a session, with
 *  two sessions' rest after each offer. */
export function jumpOfferDue(e: Exposure | undefined, session: number): boolean {
  if (session < 3) return false;
  const last = e?.s?.at(-1);
  return last === undefined || session - last >= 2;
}
```

Tests: arrival after a level in the same land → `[]` once two hints are said; a new land → its welcome; reward after a dojo (closing said) → no `yay_7`; jump offer: session 2 → false, session 3 → true, offered in 3 → false in 4, true in 5.

### A9. Example words not already used

```ts
/** Example words for a spelling that aren't already used on this screen (SCRIPT_STYLE §6: never one word for two
 *  spellings in one breath). */
export const freshWords = <W extends { text: string }>(words: readonly W[], used: ReadonlySet<string>, n = words.length): W[] =>
  words.filter((w) => !used.has(w.text)).slice(0, n);
```

---

## Part B. New lines

One new owned block at the end of `LINES` in `src/content/lines.ts`: `// --- Script style (docs/SCRIPT_STYLE.md, 26 Sep). Owned by the script fixes; edit only this block.` Record them with the usual audio script (whole sentences, Sensei's British voice), then run `scripts/gen-durations.ts` and draft their tags (`tag-lines.ts --missing`). Every call site guards with `HAS`/`L()`, so code can land before the audio.

| Id | Text | Used by | Why this wording |
|---|---|---|---|
| `st_two_letters_too` | This one's two letters too, but it's just one sound. | Dojo Learn, the second two-letter spelling within two minutes | SW "It's two letters but it's just one sound" [15][101], with "too" pointing back |
| `st_know_this_sound` | Ooh, you already know this sound! | Dojo Learn, before the spell, for a new spelling of a known sound | the news before the reveal; the reveal then uses the official `t_another_way` |
| `st_like_this_in` | …like this, in… | Sort, a middle chest | a teacher pointing along the chests |
| `st_and_like_this_in` | …and like this, in… | Sort, the last chest | |
| `st_what_change` | What do we need to change? | Sound Swap | SW "What do you think we need to change?" [77] |
| `st_first_changes` | Yes, the first sound changes! | Sound Swap (split from `audit_swap_first`) | protected half of the old line |
| `st_middle_changes` | Yes, the middle sound changes! | Sound Swap | |
| `st_last_changes` | Yes, the last sound changes! | Sound Swap | |
| `st_hear_two` | I can hear two sounds! | Early word building, after the slow word | SW "How many sounds can you hear in X?" [30] |
| `st_hear_three` | I can hear three sounds! | ditto | |
| `st_found_new_sounds` | You found some new sounds! Look, here are their petals, shining through the mist. | World Flower trip with two or more new sounds | |
| `st_another_new_sound` | And here's another new sound! | the trip's second new sound | |
| `st_first_q2` | Which picture starts with… | first-sound games (A5) | |
| `st_first_q3` | Find the one that starts with… | first-sound games (A5) | |
| `st_find_q2` | Where's… | Dojo Find (A5) | |
| `st_find_q3` | Now find… | Dojo Find (A5) | |
| `st_last_one` | Last one! | Dojo Learn, the last of three or more spellings | series shape (SCRIPT_STYLE §5) |
| `st_th_moth_sometimes` | …in moth, and sometimes… | concept 4 for < th > (with `t_same_spelling_sometimes`, /th/, /dh/ and the existing `tg_th_dh_in` "…in this.") | 5 clips, no bare "…in…" |
| `st_speaker_ok` | That's it! I'll always say it again. | the dojo welcome's speaker step (C19) | |
| `fm_fast_mug` | I can say a word fast. Mug! | W3's fast and slow recap | same shape as `fm_fast_sun`; `Warmup.tsx` already looks for `fm_fast_${word}` |

No new line is needed for the two-letter error correction (`thats`, `we_need`, `t_two_letters`) or the speaker tip (`tut_speaker`, moved).

---

## Part C. The fixes

### C1 (P1). The sort's introduction: one sentence per chest, no letters list

**File** `src/scenes/Sort.tsx`, the intro script in the mount `useEffect` (`chests: spellings.map(...)`, 428-431) and `playIntro` (383-404).

**Change**
- Say the sound once, with the petal (it is already on screen, `Sort.tsx:802`), in the lead.
- Each chest, as it lights and hops, gets one example word in a sentence: the first "This is the way we spell…" /ae/ "…in rain." (`t_way_we_spell`, sound, `tg_<g>_<p>_in` or `t_in` + word), the middle ones "…like this, in…" + word (`st_like_this_in`), the last "…and like this, in…" + word (`st_and_like_this_in`). The example word is each spelling's canonical first example (`exampleWords(p, g)[0]`, which has a recorded "…in *word*." clip for the first chest); no two chests share a word (`freshWords()`).
- The letters fact is said only on the chest whose spelling is **due** under A1 (`dueInSessions(narr[lettersKey(g)], session, SESSIONS.reminder)`), at most one chest per sort, and recorded with the session. For a child who met < ai > and < ay > in the dojo a minute ago, none is due.
- `told(lettersKey(g), LETTERS)` at 395 moves to that one chest.

**Transcript after** (C6-P w6-2):
> Sorting time! Same sound, different spellings. · This sound can be spelt in two ways. · *(< ai > lit)* This is the way we spell… /ae/ …in rain. · *(< ay > lit)* …and like this, in tray. · Tap the chest with the same spelling as the word.

(C6-P w6-br1, a child who has never heard < ck >'s fact:)
> …This sound can be spelt in three ways. · *(< c >)* This is the way we spell… /k/ …in cat. · *(< k >)* …like this, in kit. · *(< ck >)* …and like this, in duck. It's two letters, but it's one sound. · Tap the chest…

### C2 (P1). The Dojo's Learn: a series, not a loop

**File** `src/scenes/Dojo.tsx`, `Learn` (about 395-560) and its caller (`Dojo`, the `teach[phase.i]` props).

**Change**
1. Pass the series position: `index={phase.i}`, `count={teach.length}`.
2. `letters` (412): compute the form with `lettersForm(t, recentLetters(), gameNow())` (A2), where `recentLetters()` is a small module-level list in `narrate.tsx` that `Learn`, `Build`'s reminder and `correctionFor` push to (`{ at, form, n }`, game time = `performance.now() * FAST`, `n` the spelling's letters). `full` → `lettersSay(t)`; `too` → `[{ line: "st_two_letters_too" }]`; `none` → `[]`.
3. A new spelling of a known sound (`alsoSpelt`, 416): don't put `same_sound_new` / `same_sound_diff` in `about`. Instead, in the `intro` (443), after the sound twice: `{ line: "st_know_this_sound" }` (every time `alsoSpelt` is set; it is short). After the spell, `spellIt` (463) leads with `t_another_way` + sound in place of `audit_spell_it` + sound.
4. `dojo_tap_say` (463, 420 `recap`, 490 idle prompt): for `index > 0` use `fm_you_try_2` ("Your turn!"). The idle prompt and Help keep `dojo_tap_say` (they are for a child who didn't act).
5. The last of three or more (`index === count - 1 && count >= 3`): `st_last_one` before "Listen…".
6. Record the letters telling with the session (`heard(lettersKey(g))` at 470 passes the session through A1's `told`).

**Transcript after** (C5-P w5-1, 0:10 on):
> Listen… /sh/ /sh/ · *(spell)* We hear the sound. Now look: this is how we spell it. /sh/ · It's two letters, but it's one sound. · Tap it, and say it with me! · /sh/ /sh/ · Well done!
> Listen… /ch/ /ch/ · *(spell)* And this is how we spell it. /ch/ · This one's two letters too, but it's just one sound. · Your turn! · /ch/ /ch/
> Listen… /th/ /th/ · *(spell)* And this is how we spell it. /th/ · Your turn! · /th/ /th/ · Brilliant!
> Last one! Listen… /dh/ /dh/ · *(spell)* And this is how we spell it. /dh/ · The same spelling can sometimes be… /th/ …in moth, and sometimes… /dh/ …in this. · Your turn! · /dh/ /dh/

(C6-P w6-1, 2:56 on:)
> Listen… /ae/ /ae/ · *(spell)* We hear the sound. Now look: this is how we spell it. /ae/ · It's two letters, but it's one sound. · Tap it, and say it with me! · /ae/ /ae/ · Smashing!
> Listen… /ae/ /ae/ · Ooh, you already know this sound! · *(spell)* This is another way to spell the sound… /ae/ · This one's two letters too, but it's just one sound. · Your turn! · /ae/ /ae/

Letters lines in the Learn: 2 (was 3) in w5-1, 2 in w6-1, and never the same sentence twice.

### C3 (P1). The World Flower trip: show and count, don't re-teach

**Files** `src/content/teach.ts`, `foundScript()` (252-275) and `introGem()` (144-174); `src/scenes/Intros.tsx`, `GemFound` (the `foundScript(items, …)` call, 130).

**Change**
1. `introGem()` gains `ctx.facts?: boolean` (default true). When false, `factsSay` is empty (no letters line, no double note, no "Say that sound with me!").
2. `foundScript()` gains `ctx.justTaught?: ReadonlySet<string>`: the gem keys whose teach moment the child has just heard (the level that sent them here taught them). For those: `facts: false`, and for a known sound's new gem the lead is `wf_found_gem` + sound ("You found a new gem! It's a spelling of the sound… /ae/") followed by `tg_<k>_like` ("…like in tray, day and say."), not `same_sound_new` and not a second "This is the way we spell…".
3. Two or more new sounds in one trip: the first lead is `st_found_new_sounds`; the second new sound gets `st_another_new_sound`; the third and later get no lead (their petal appearing is enough).
4. Example words: pass a `used` set through the gems of one trip and pick with `freshWords()`; and in the generated examples (`scripts/gen-teach-lines.ts` → `teach-lines.gen.ts`), give `gem:t>t` a first example that isn't "mat" (for example "tap"), so the recorded "…in…" clips don't repeat a word within a level's trip (C-P 12:01 and 12:09 both say "…in mat.").
5. `GemFound` passes `justTaught` = the level's `teach` keys when the trip follows that level (`flowerVisitAfter` → `{ kind: "spelling" }`).

**Transcript after** (C6-P 5:00, after w6-1):
> You found a new sound! Look, here is its petal, shining through the mist. · This is the way we spell… /ae/ …in rain. · We see this spelling in tail and nail. · You found a new gem! It's a spelling of the sound… /ae/ · …like in tray, day and say. · Now you know two ways to spell… /ae/

(C-P 11:52, after w1-3:)
> You found some new sounds! Look, here are their petals, shining through the mist. · This is the way we spell… /a/ …in mat. · We see this spelling in man and pan. · And here's another new sound! · This is the way we spell… /t/ …in tap. · We see this spelling in sit and tent.

### C4 (P1). Read-back reminders: later sessions only, one a level

**Files** `src/scenes/narrate.tsx`, `isDue` (48), `heard` (53), `LETTERS` (45), `lettersReminder` (77-85), `twoSoundsReminder` (87-96); callers `Dojo.tsx:837`, `Swap.tsx:489-490`, `Run.tsx:822`, `Battle.tsx:933`, `Story.tsx:570`.

**Change**
1. `heard(key)` records the session: `told(l[key], cur.index, store.get().sessions)`.
2. `lettersReminder` and `twoSoundsReminder` use `dueInSessions(ledger()[key], store.get().sessions, SESSIONS.reminder)` in place of `due(…, "concept")`, and **skip a spelling taught in this session** (its teach moment was telling 1; the reminder is for another day).
3. `LETTERS.cap` becomes 1 (one reminder a level), and a session cap of 2 across all spellings (a module-level counter reset when `store.sessions` changes).
4. In `Dojo.tsx` `Build` (826-850), use `afterWord()` (A7): a reminder that doesn't fit this word (a tier-up or "Ninjas read this way!" just spoke) is not said and not marked heard, so it comes with the next word; when it is said, there is no praise and the gem's first-fill waits a word. The same in `Swap.tsx`, `Run.tsx` and `Battle.tsx` at their reminder sites.

**Transcript after** (C6-P, the whole session w6-br1 → w6-10): "It's two letters, but it's one sound." at the teach moments and first meetings only: < ck > (sort chest, if due), < ai >, < ee >, < oa > and < ie > (each Learn's first two-letter spelling); "This one's two letters too…" for < ay >, < ea > and < ow >; three-letter < tch > and < igh > once each; at most two read-back reminders for spellings from earlier sessions. **About 10–12 letters lines in 25 minutes (was 34 + 4), no spelling told twice, and never the same sentence twice within a minute.**

(A later session, the first word with < ss >, lit:)
> /h/ /i/ /s/ "hiss" · It's two letters, but it's one sound.

### C5 (P1). The two-letter error correction

**File** `src/engine/feedback.ts`, `correction()` (22-27); `src/scenes/narrate.tsx`, `correctionFor()` (104-111).

**Change** Before the attempt-based branches:

```ts
// a two-letter mistake (< s > for /sh/): the Sounds~Write correction is about the spelling, not about listening
if (splitsSpelling(g, need)) return [{ line: "thats" }, { sound: GRAPHEMES[g] ?? need.p }, { gap: 200 }, { line: "we_need" }, { sound: need.p }, { gap: 250 }, ...lettersSay(need)];
```

and the callers reveal and glow the right tile for it on the first miss (they already do on the second). It counts as a telling of `lettersKey(need.g)` only for `recentLetters()` (A2), not for the session schedule: an error telling never uses up a reminder.

**Transcript after** (building "shop", the child taps < s >):
> *(< s > wobbles)* That's… /s/ We need… /sh/ It's two letters, but it's one sound. *(< sh > glows)* · *(child taps < sh >)* /sh/

### C6 (P2). The map: welcome once, hint twice, then quiet

**File** `src/App.tsx`, `WorldMap`, the arrival effect (547-549).

**Change** `arrival.current = arrivalLines({ world: w.id, welcomed, lead, hintsSaid: timesHeard("map-hint") })` (A8), where `welcomed` is a module-level `let welcomedWorld: number | null` reset when `store.sessions` changes and set whenever a `world_N` line is said to its end; `heard("map-hint")` after `map_hint` is said to its end. The map's idle nudge (`useIdlePrompt` or the nav layer's) says `map_hint` after 8 s without a tap. A level's introduction waits for the arrival line (C18).

**Transcript after** (C-P, every arrival after the first two): *(the ninja walks to the next stone; music; no line)*. First arrival in the Sky Temple: "Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!" and nothing on the next 12. Map lines per land: 1 (was 11–13).

### C7 (P2). The reward: one celebration, then the news; the jump offer once

**File** `src/App.tsx`, `Reward`, `talk()` (the `seq` that starts with `yay_7`, and `if (offerJump)`), and `offerJump`'s `useState` (800); `src/engine/gems.ts`, `shouldOfferJump()` (228).

**Change**
1. `const seq = rewardLead({ closingSaid: !!closing, boss: level.kind === "boss", newPetals: newPetals.length, lastInWorld: isLastInWorld, finale: isFinale })` (A8). Hear it again keeps saying the closing line first (NAVIGATION rule 7).
2. `offerJump` also needs `jumpOfferDue(narr["jump-offer"], store.get().sessions)`; `heard("jump-offer")` once it has been said.
3. "More stickers for your Sticker Book!": say it on the first two rewards of a session; later rewards let the stickers fly into the book silently (the "+N" on the book says it).

**Transcript after** (C6-P, after w6-br1):
> Sorted! What a clever ninja. · *(stickers fly)* More stickers for your Sticker Book! · *(the < ck > gem lifts)* Look, this gem has filled a little more.

(C5-P, after w5-2, a battle:) Hooray! The monster ran away! · *(stickers fly)* · Look, these gems have filled a little more.

"You did it!" stays only where the level had no closing line of its own (7 of the 11 in C-P: the first-sound, sound-hunt and early dojo levels), and never straight after another praise line (was stacked at all 11: "Ace!" → "You did it!", "Hooray! The monster ran away!" → "You did it!"). Optional (P3): rotate it with two more recorded celebrations, so a session doesn't hear it seven times. Jump offers: at most one a session, none on day one (was 8 in C-P and 12 in C5-P).

### C8 (P2). The first World Flower visit: the child's own petal, three facts

**File** `src/scenes/Intros.tsx`, `FlowerIntro` (58-110).

**Change**
1. The petal is the child's first petal, not /a/: `const p0 = (store.get().petals.map(soundOf)[0] ?? "s")` (the Sticker Book reward gives /s/ first), used in `lines[1]`, the `SoundBadge`, the `GemIcon` (its first spelling) and the landing petal.
2. Keep steps 1–3 (`flower_i1`, `flower_i2` + sound, `wf_i3`). Drop steps 4–6 from the intro; they are said when they happen:
   - `flower_i4` is already covered by `audit_gem_first` at the first fill;
   - `flower_i5` ("When a gem is full, it glows. Then you can win it in a gem battle!") replaces `gem_ready` the first time a gem is ready (`rewardGemFocus` in `App.tsx` and `Tree.tsx:1427`; once per save, key `gem-battle`);
   - `flower_i6` is covered by `petal_complete` when the first petal comes home.

**Transcript after** (C-P 9:22, after w1-2):
> This is the World Flower. Baron Muddle blew all its petals away! · Every petal is one sound. Listen! This is the petal for the sound… /s/ · Inside each petal are shiny gems. Each gem is a way to spell the sound. · You found some new sounds! …

(3 facts in about 15 s, was 6 in 31 s.)

### C9 (P2). First-sound and sound-hunt games: one spelling line per spelling, rotating stems

**File** `src/scenes/Early.tsx`, `FirstSoundLevel`'s `mk()` (1301-1335) and `SoundHuntLevel`'s items (1425-1450).

**Change**
1. 1319: `if (!introduced.current.has(g) || mode !== "youdo")` → `if (!introduced.current.has(g))`. The first reveal of each spelling says "We hear the sound…" or "This is how we spell…"; later reveals are silent (`setRevealShow` at once, the spell still writes it).
2. Sound hunt 1442 (`if (k < 3)`) → only `k === 0` says "This is how we spell…"; items 1–2 cast the spelling silently.
3. `prompt: [{ line: stemFor(STEMS.first, n, HAS_LINE) }, …]` where `n` is the item's index in the level (A5). `listenAgain` keeps `first_q` (after a miss, the familiar stem).
4. `usePickGame`'s praise (1047) uses `praiseFor()` (A4).

**Transcript after** (C-P w1-2, 7:46–8:30):
> Watch me first! This is a mop. This is a bus. Which one starts with… /m/ · *(paw)* Mop starts with… /m/ · We hear the sound. Now look: this is how we spell it. /m/
> Let's do it together! This is a pig. This is a mat. Which one starts with… /m/ · *(tap)* Mat starts with… /m/ *(< m > is written, no line)*
> Now it's your turn! This is some milk. This is a cup. Which picture starts with… /m/ · *(tap)* Milk starts with… /m/ · Super!
> Watch me first! This is the sun. This is a fox. Find the one that starts with… /s/ · *(paw)* Sun starts with… /s/ · This is how we spell… /s/

"This is how we spell…" in C-P: 5 (one per spelling), was 15.

### C10 (P2). Dojo Find: the speaker tip before the question, rotating stems

**File** `src/scenes/Dojo.tsx`, `Find` (569-640).

**Change**
1. The tip moves **before** the first question, while the speaker pulses: `if (isDue("hear-again", "twice") && index === 0)` → `await explain("hear-again", "twice", [{ line: "tut_speaker" }, { gap: 300 }])`, then `prompt()`. The child can't answer during it (the choices drop in after it). If it is cut off anyway (Home, turning the phone), it is not tried again in this level.
2. `prompt` uses `stemFor(STEMS.find, index, HAS)` (A5); Help and Hear it again keep `dojo_find`.
3. Praise through `praiseFor()` (225 `praiseAfter`).

**Transcript after** (C5-L w5-1):
> *(the speaker pulses)* Tap the speaker to hear the sound again. · Can you find… /sh/ · *(tap)* /sh/ · Ace! · Can you find… /ch/ · *(tap)* /ch/ · Where's… /th/ · *(tap)* /th/ · Brilliant! · Now find… /dh/

"Tap the speaker…": 2 in the save, both heard in full (was 10 in C5-L, 8 cut off).

### C11 (P2). Sound Swap: the question after the words, the place line protected, then fade

**File** `src/scenes/Swap.tsx`, `ask()` (283-297), `sayPick()` (335-347), the correction (407).

**Change**
1. `ask()`, early swaps: `[swap_make, to-word, gap 300, listen, stretch(from), gap 350, stretch(to), gap 250, st_what_change]`. Later swaps unchanged (`swap_which`).
2. From the third step, once the child has got two steps right first time in a row (`fadeForm`, A6): just `[swap_make, to-word]`; the stretched pair and the question come back after a miss.
3. `sayPick()`: say the place line **protected** and the prompt after it: `await say({ line: st_<place>_changes }, { protect: true })` (tiles for the new sound become tappable as it ends), then `say({ line: "swap_pick" })`. `audit_swap_*` stay for Hear it again until `st_*_changes` are recorded.
4. 407: the correction `[thats, sound, stays_same, listen, from, to]` gets a petal on screen for "That's /s/" (C21).

**Transcript after** (C-P w1-8):
> This is… "mat" · Change it to make… "sat" · Listen… "mmmat"… "sssat". What do we need to change? · *(tap < m >)* Yes, the first sound changes! · Now pick the new sound. · *(tap < s >)* /s/ /a/ /t/ "sat" · Brilliant!
> Change it to make… "sit" · Listen… "sssat"… "sssit". What do we need to change? · *(tap < a >)* Yes, the middle sound changes! · Now pick the new sound. · *(tap < i >)* /s/ /i/ /t/ "sit"
> Change it to make… "sat" · *(tap < i >, then < a >)* /s/ /a/ /t/ "sat" · Super!

Place lines heard to the end: 3 of 3 (was 0 of 3).

### C12 (P2). Dojo Build: the word before the taps; one thing after each word

**File** `src/scenes/Dojo.tsx`, `Build` (700-900).

**Change**
1. The first word's introduction ("Now let's make words! First, listen to the word…" and the word) locks the taps like the adjacent-sounds introduction does: `introLock.current = true` for `intro && first`, released after the word has been said (C6-L 4:11: the first tile cut the introduction before the child had heard "play").
2. After the read-back, `afterWord()` (A7) decides between the reminder, the gem's first-fill and praise (C4 item 4).
3. "Ninjas read this way!" (`readThisWay`, 831): only in lands 1 and 2 (`narrate.tsx` `readThisWay` returns false for `world > 2`).

**Transcript after** (J-P w4-3, Dragon River, the first word):
> Three right answers in a row! Your ninja is getting stronger. · /d/ /r/ /e/ /s/ "dress" · *(the tier line was this word's praise; the < ss > reminder, if due, comes with the next word, and the gem's first fill with the word after that)*

### C13 (P3). Early word building: "I can hear three sounds" after the slow word

**File** `src/scenes/Early.tsx`, `BuildSequence` (1539-1543) and `BuildOne`'s I do (1684).

**Change** Drop `two_sounds`/`three_sounds` from the sequence's start. In the I do, after `build_ido_2` + the stretched word: `{ line: word.segs.length === 2 ? "st_hear_two" : "st_hear_three" }` (the slots are on screen as it is said), then `build_ido_3`.

**Transcript after** (C-P w1-5):
> *(the dojo is on screen)* Watch me first! · I say the word… "mat" · I say it slowly… "mmmaaat" · I can hear three sounds! · Now I find each sound, one at a time.

### C14 (P3). Who read it right: the readers first, then the question

**File** `src/scenes/Early.tsx`, `ReadCheck` (1893-1900) and `ReadOne` (`readersRead`, 1953-1960).

**Change** `read_intro` only on the save's first reading check (`isDue("read-check", "twice")`), and said as the readers appear. In `readersRead`, move `read_who` after both readers: `kai_says` + word, `suki_says` + word, then "Who read it right?".

**Transcript after** (C-P w1-4):
> Tap each sound, and say it. · *(child taps)* /a/ /m/ · Kai says… "am" · Suki says… "at" · Who read it right?

### C15 (P2). Praise across the scenes

**Files** every `pickPraise()` call: `Dojo.tsx:225, 534, 846`; `Swap.tsx:513, 522`; `Early.tsx:1047, 1677, 2043`; `Battle.tsx:943`; `Run.tsx:832`; `Story.tsx:945`.

**Change** Use `praiseFor({ replaced, closingNext })` (A4): `replaced` when a tier line, a reminder or a first-fill explanation has spoken for this answer; `closingNext` on the level's last item (the closing line follows). `Warmup.tsx:464` keeps its every-third rule.

**After**: praise lines about 1–1.5 a minute (was 2.0–4.0), no stacks within 5 s (was 6–79 per run). Dojo end: "*(last word)* /p/ /ae/ /n/ /t/ "paint" · Well done! You practised so hard!" (was "Well done! · Well done! You practised so hard!").

### C16 (P3). Ninja Run: the right cue, then fade

**File** `src/content/narrative.ts`, `RUN_BLEND_CUES` (111); `src/scenes/Run.tsx` where the cue is picked.

**Change** Remove `t_listen_for_word` ("Say the sounds, and listen for the word."): it tells the child to say the sounds while Sensei says them. Rotate `run_blend` and `audit_sounds_again` for the first three words; from the fourth, no cue (the sounds alone, as the lantern comes).

**Transcript after** (C-P w1-9): "Listen to the sounds. What word do they make? /m/ /a/ /t/…" · "Listen to the sounds, and catch the word they make! /s/ /i/ /t/…" · "Listen to the sounds. What word do they make? /a/ /m/…" · "/s/ /a/ /t/…"

### C17 (P3). The warm-ups

**File** `src/scenes/Warmup.tsx` and `src/content/warmups.ts`.

**Change**
1. W3 recap (1350-1360, `fastSlowShow`, `show: "recap"`): say `fm_fast_${word}` when it exists (record `fm_fast_mug`), so "Or I can say it slowly…" has its first half: "I can say a word fast. Mug! · Or I can say it slowly… "mmmuuug"" (C-P 5:18: "mug" · "Or I can say it slowly…").
2. W5 (1201): `const q = [{ line: "listen" }, { gap: 250 }, ...sayWord(it.target), { gap: 300 }, { line: "fm_which_pic" }]`, so the naming of a new picture doesn't run into another word's sounds: "This is a mop. · Listen… /m/ /a/ /p/. Which picture is it?"
3. `pawClose` (280-290): "Here's the last one!" only for tap-all beats (several answers); a single-answer beat says `fm_its_this` ("It's this one!").
4. W2's demo (`warmups.ts:129, 148`): drop `after: "fm_pair_fish_dog"` on the Sensei rail (its line already ends "Fish dog!"), so "Fish dog!" isn't said twice in a row.
5. `fm_l1_done` closes W1 and W3 alike: give W3 its own closing (`fm_l5_done`'s shape: "You heard the sounds in words. Super listening!") or skip the praise half on the second use.

### C18 (P3). Speak when the screen is there

**Files** `src/App.tsx`, `LevelHost` and the route change (`go()`, the `fade` key); every level scene's first `say()` on mount.

**Change** A level's first line waits for the level to be on screen and for the map's arrival line: one shared `afterFade(): Promise<void>` in `src/ui/ui.tsx` that resolves when App's fullscreen fade has finished (and `isSpeaking()` is false, or after 1.5 s), awaited by each scene's opening `say()` (Dojo `Learn` intro, `FirstSoundLevel`, `SoundHuntLevel`, `BuildSequence`, `Swap`, `Battle`, `Sort`, `Run`). Or, simpler, `LevelHost` mounts the level after the fade.

**After**: no level line starts over the map (was 10 of 12 stones in C-P), and the map hint is never cut by the level (was 9 of 12).

### C19 (P3). The Hear it again lesson in the dojo welcome

**File** `src/scenes/Training.tsx`, the speaker step (`play("speaker")` 112-113, `tapSpeaker` 169-178).

**Change** Give the speaker something to say again: the speaker step opens with the ninja's word, then the instruction; the tap says the word again, then Sensei confirms. Lines: `fm_name_sun` ("This is the sun."), `fm_speaker` ("And when you tap the speaker, I'll say it again!"), and on the tap `fm_name_sun` again, then `st_speaker_ok` ("That's it! I'll always say it again.", Part B).

**Transcript after**: "This is the sun. · And when you tap the speaker, I'll say it again! · *(tap)* This is the sun. · That's it! I'll always say it again." (was the same instruction twice, C-P 1:32–1:36).

### C20 (P3). Concept 4 as fewer fragments

**File** `src/content/teach.ts`, `sameSpelling()` (193-200).

**Change** For < th > (the only pair in play), use `[t_same_spelling_sometimes, /th/, st_th_moth_sometimes, /dh/, tg_th_dh_in]`: "The same spelling can sometimes be… /th/ …in moth, and sometimes… /dh/ …in this." (5 clips, was 7 with two bare "…in…"). Other pairs keep the generic form until they get recordings. `canBe()` ("This can be… /dh/ …but in this word, it's… /th/") stays: it is the Sounds~Write formula, with two sound slots.

### C21 (P2). Show a petal whenever a sound is said as a sound

Jonas: "when showing the student a sound as opposed to a spelling, you always have to show it in the petal shape in all games with the image at the top of the petal or next to it."

**Files** and the moment in each where a sound is said as a sound with no petal on screen today:

| File | Moment | Fix |
|---|---|---|
| `Warmup.tsx` | tap-all ("Tap all the pictures that start with… /s/", "…with this sound in them… /a/"), the notice beat ("…start with the same sound… /s/", "Say that sound with me! /s/"), "You found them both! They both start with… /s/", "They all have the sound… /a/" | the nav layer's sound slot (`useNav({ sound: p })`) for the beat, or a `SoundBadge` above the cards; it swells on the sound by itself (`onClip`) |
| `Placement.tsx` | "Which is the spelling of this sound?" /h/; "Tap every picture that has this sound." | `useNav({ sound })` for the round |
| `Swap.tsx:407` | "That's… /s/ That sound stays the same." | a small `SoundBadge` over the tapped tile while it is said |
| `Battle.tsx:1107`, `Dojo.tsx` `Build` Help 3, `Early.tsx` `BuildOne` Help | "Look! I'll show you. /s/" | the petal beside the glowing tile |
| `Sort.tsx` intro | the chest lines (C1) | the petal already there (`Sort.tsx:802`) swells on each /ae/ |

**Check**: a new sweep invariant in `scripts/treadmill/sweep.ts`, `sound-without-petal`: whenever a `sound:<p>` clip starts (the `onClip` hook, or `__audioLog` `/a/p/<p>.mp3`), a visible `[data-nav="sound"][data-p="<p>"]` or `SoundBadge` with that `data-p` must be on screen, except inside a word's read-back (sound buttons under letters) and Ninja Run's blend.

---

## Part D. The expected transcripts, end to end

### D1. The Sky Temple session (C6-P, after all fixes)

```
0:01  Welcome back, Super Ninja! Ready for more training?
      (map, first visit of the session) Tap the glowing stone to start your next adventure.
w6-br1  You know this sound! Now let's look at the different ways we spell it.
        Sorting time! These words have the same sound, but it's spelt in different ways.
        This sound can be spelt in three ways.
        (c) This is the way we spell... /k/ ...in cat.  (k) ...like this, in kit.
        (ck) ...and like this, in duck. It's two letters, but it's one sound.
        Tap the chest with the same spelling as the word.
        "back"  (a gem pops up and fills) Look, a gem! Each gem holds a way to spell a sound. When you get words right, it fills up.
        "cot" ... Super! ... "camp" ... Ninja power! ...
        Sorted! What a clever ninja.
reward  (stickers fly) More stickers for your Sticker Book!
        (the < ck > gem lifts) Look, this gem has filled a little more.
map     Welcome to the Sky Temple! Baron Muddle is hiding up here somewhere!
w6-br2  Sorting time! Same sound, different spellings.
        This sound can be spelt in two ways.
        (ch) This is the way we spell... /ch/ ...in chick.  (tch) ...and like this, in itch. It's three letters, but it's just one sound.
        Tap the chest with the same spelling as the word.  ...  Sorted! What a clever ninja.
reward  (stickers fly) More stickers for your Sticker Book!
map     (the ninja walks; no line)
w6-1    Back to the dojo! Let's learn some new sounds.
        Listen... /ae/ /ae/   (spell) We hear the sound. Now look: this is how we spell it. /ae/
        It's two letters, but it's one sound.   Tap it, and say it with me!  /ae/ /ae/  Smashing!
        Listen... /ae/ /ae/   Ooh, you already know this sound!
        (spell) This is another way to spell the sound... /ae/   This one's two letters too, but it's just one sound.
        Your turn!  /ae/ /ae/
        Can you find... /ae/ ... Can you find... /ae/ ... Super!
        Now let's make words! First, listen to the word. Then tap its sounds, one at a time. Build the word... "snail"
        /s/ /n/ /ae/ /l/ "snail"  ...  "train" ... Ace! ... "tray" ... "hug" ... Smashing! ... "paint"
        Well done! You practised so hard!
reward  You won back some sounds!  (stickers fly, silently: third reward of the session)
trip    You found a new sound! Look, here is its petal, shining through the mist.
        This is the way we spell... /ae/ ...in rain. We see this spelling in tail and nail.
        You found a new gem! It's a spelling of the sound... /ae/ ...like in tray, day and say.
        Now you know two ways to spell... /ae/
w6-2    Sorting time! Same sound, different spellings.
        This sound can be spelt in two ways.
        (ai) This is the way we spell... /ae/ ...in rain.  (ay) ...and like this, in tray.
        Tap the chest with the same spelling as the word.  ...  Sorted! What a clever ninja.
w6-3    Listen... /ee/ /ee/  (spell) And this is how we spell it. /ee/  It's two letters, but it's one sound. ...
```

Counts over the whole session (w6-br1 to w6-10): letters lines about 10–12 (was 38), `st_know_this_sound` 4, each before its reveal (was `same_sound_new` 8, after the reveal and again on the trips), world welcomes 1 (was 13), "You did it!" 0 (was 13: every level here has its own closing line), jump offers 0 (was 1), praise about 1.2 a minute (was 3.7).

### D2. Bamboo Village, first session (C-P from w1-2, after all fixes)

```
map     (after W6) ... (first two visits say:) Tap the glowing stone to start your next adventure.
w1-2    Every word starts with a sound. Let's listen for the very first sound!   (the level is on screen)
        Watch me first! This is a mop. This is a bus. Which one starts with... /m/
        Mop starts with... /m/  We hear the sound. Now look: this is how we spell it. /m/
        Let's do it together! This is a pig. This is a mat. Which one starts with... /m/   Mat starts with... /m/
        Now it's your turn! This is some milk. This is a cup. Which picture starts with... /m/   Milk starts with... /m/  Super!
        Watch me first! This is the sun. This is a fox. Find the one that starts with... /s/   Sun starts with... /s/  This is how we spell... /s/
        ...
reward  You did it! You won back some sounds!
flower  This is the World Flower. Baron Muddle blew all its petals away!
        Every petal is one sound. Listen! This is the petal for the sound... /s/
        Inside each petal are shiny gems. Each gem is a way to spell the sound.
        You found some new sounds! Look, here are their petals, shining through the mist.
        This is the way we spell... /m/ ...in mat. We see this spelling in man and map.
        And here's another new sound!
        This is the way we spell... /s/ ...in sit. We see this spelling in sun and bus.
map     (no line)
w1-4    This is our dojo. Here we listen to sounds, make words, and read them.
        Watch me first! I say the word... "am"  I say it slowly... "aaam"  I can hear two sounds!
        Ninjas read this way! We start here, and go this way.  Now I find each sound, one at a time. ...
reward  (stickers fly) More stickers for your Sticker Book!  Look, this gem has filled a little more.
        (no jump offer on day one)
map     (no line)
```

### D3. A two-letter error, and a reminder on another day

```
(session 8, Shadow Castle, building "shop"; < sh > was taught earlier in this session, so no reminder is due today)
        Build the word... "shop"
        (taps < s >) That's... /s/ We need... /sh/ It's two letters, but it's one sound.  (< sh > glows)
        (taps < sh >) /sh/  (taps < o >) /o/  (taps < p >) /p/   /sh/ /o/ /p/ "shop"
(session 9, the first word with < sh > in any level)
        /f/ /i/ /sh/ "fish"  It's two letters, but it's one sound.   (< sh > lit; no praise for this word)
(session 10, the first word with < sh >)
        /sh/ /e/ /l/ "shell"  It's two letters, but it's one sound.
(session 11 on: only on an error)
```

---

## Part E. The core (so the director inherits the same rules)

1. **Dosage for the letters idea** (`src/core/content/notions.ts:44`, `idea:two-letters-one-sound`, today `defaults.idea`): give it its own dosage: `beforeUse 1, full 3, spacing [{ after: "sessions", n: 1 }, { after: "sessions", n: 1 }], minSessions 3, reminders "error", retireAfter 6, maxPerSession 2`. Add `"error"` to `Dosage.reminders` in `src/core/types.ts` (after the full explanations: only on an attempt whose error is a split spelling; the attempt's error types, `Attempt.errors` in the same file, gain `split-spelling`, decided by A3). The per-spelling teach moment (`gpc:sh>sh`, the `intro-gem` moment in `src/core/content/teach.ts`) carries the letters line as part of its full explanation, in the A2 form.
2. **Short forms**: tag `st_two_letters_too` and `two_letters_one_sound` as `remind` for the idea; `st_know_this_sound` + `t_another_way` as `explain` for `idea:same-sound-different-spellings`.
3. **Audit rules** already designed catch this in future (ARCHITECTURE §10.2): `over-repeated` (a line more than twice in 5 minutes when it is a `vary` line; "It's two letters…" should be `vary: false` but counted per key with the session cap) and `under-dosed`. Add one: `echo` (the same utterance shape twice within 30 s in one beat), which `scripts/treadmill/script-audit.ts` already counts on today's transcripts.
4. **Line tags** for every Part B line, drafted with `tag-lines.ts --missing` in the same change that adds them.

---

## Part F. Acceptance

Re-run on a non-reloading server (the shared dev server reloads the page whenever another agent saves a file; see SCRIPT_STYLE §1). The one used for these runs: copy `src/`, `play/`, `package.json` and the three `tsconfig*.json` into a scratch folder, symlink `public/` and `node_modules/` into it, and start `vite` there with a config that sets `server: { host: "127.0.0.1", port: 5287, strictPort: true, hmr: false, watch: null }` and its own `cacheDir` (so it never touches the shared server's dependency cache).

```sh
bun scripts/treadmill/continuous.ts --base <server> --persona perfect,learner --levels 12 --out playtest/transcripts/<run>
bun scripts/treadmill/continuous.ts --base <server> --persona perfect,learner --levels 12 --from w5-1 --out playtest/transcripts/<run>
bun scripts/treadmill/continuous.ts --base <server> --persona perfect,learner --levels 13 --from w6-br1 --out playtest/transcripts/<run>
bun scripts/treadmill/script-audit.ts playtest/transcripts/<run>/continuous-*.json --out playtest/transcripts/<run>/script-audit.md
```

| Measure (run) | Before | After |
|---|---|---|
| "It's two letters, but it's one sound." (C6-P) | 34 (+4 three-letter) | ≤ 12 letters lines in all; no spelling told twice; the same sentence never twice within 60 s |
| "/ae/ It's two letters… /ae/ It's two letters…" in a sort (C6-P) | 5 sorts | 0 |
| `same_sound_new` after the reveal (C5-P, C6-P) | 8, 8 | 0 (the news comes before) |
| World welcomes (C-P, C5-P, C6-P) | 11, 10, 13 | 1 per land |
| "You did it!" straight after another praise line (C-P) | 11 of 11 | 0 |
| Jump offers (C5-P) | 12 | ≤ 1 a session, 0 on day one |
| "This is how we spell…" (C-P) | 15 | 5 |
| Tip "Tap the speaker…" (C5-L) | 10, 8 cut | ≤ 2 a save, 0 cut |
| Swap place lines heard to the end (C-P) | 0 of 3 | 3 of 3 |
| Map hint cut by the next level (C-P) | 9 of 12 | 0 |
| Praise lines a minute (all) | 2.0–4.0 | ≤ 1.5, no stacks within 5 s |
| Sounds said with no petal on screen | warm-ups, Placement, Swap, Help | 0 (sweep invariant C21) |
