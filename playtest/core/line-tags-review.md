# Line tags review

Reviewed against the current `LINES` inventory, the Jev draft, the generated teach clips, the warm-up and scene call sites, `docs/PEDAGOGY.md`, and the Sounds-Write teacher-language research. The inventory changed while the draft was awaiting review: it now has **718 lines**, not 565.

## Changes

| Measure | Count |
| --- | ---: |
| Draft entries still in `LINES` | 553 |
| Those entries with changed notion tags or tag roles | **359** |
| Tag/key/role pairs added to those entries | 401 |
| Tag/key/role pairs removed from those entries | 167 |
| Those entries with a changed purpose | 96 |
| Those entries with changed prerequisites | 120 |
| Those entries changed in any metadata field | 491 |
| Current lines with no draft entry, now tagged | 165 |
| Draft entries for removed lines, omitted from runtime | 12 |

Every current line has a static text-and-speaker hash and a `LineMeta` entry in `src/core/content/line-tags.ts`. At review time the coverage report has no missing, stale, or removed entries. `createLineBook()` now uses these tags by default. The test gates **missing** runtime tags; stale and removed entries remain audit findings as the architecture specifies.

Main correction patterns:

- Jev assigned first-sound, middle-sound, and one-line-per-sound tags to unrelated prompts such as “Which sound comes next?”, as well as to spelling snippets and even Baron banter. Those were removed or changed to the particular idea actually used.
- A prompt, answer, praise line, or short recap is not a full explanation. For example, `fm_tap_all_in` mentions a sound in a word; `same_sound_diff` reminds; `timer_intro_1` explains a battle timer, not gem energy. `fm_same_word`, `fm_hear_sounds`, and the explicit middle/last-place lines carry the corresponding full explanations.
- `fm_l2_way` is a full left-to-right explanation in its guided rail beat because the ninja moves across the rail as the line is spoken. The later `audit_left_right` gives an explicit spoken version over the printed-word sweep.
- Generated `t_*`, `tp_*`, and `tg_*` clips often form a teaching utterance together. Generic fragments do not get unrelated notion tags. Sound-specific `tp_*` clips mention their sound; spelling-specific `tg_*` clips mention their GPC. The clause that states a relationship carries `explain` only where the composed use teaches it.
- The new `fm_name_*` lines name picture words. The new `fs_*` and `mid_*` lines model a first or middle sound after the paired sound clip; they do not explain the whole concept. New `wf_*`, `audit_*`, and special-word lines were classified from their text and call sites.
- Prerequisites now mean something the child must already know. The draft put unrelated needs on many lines and missed relevant needs on prompts. Multi-step instructions received `steps`; direct answer fragments and correction models received `givesAnswer`.
- The notion registry's stale references to `words_made`, `flower_i3`, and `gem_energy` were replaced with current lines. Providers that only ask or name an idea were corrected or removed. `idea:last-sound` was registered because current activity prompts need it and `audit_last_place` teaches it.

## Notions with no explaining line

| Notion | Current situation |
| --- | --- |
| `idea:one-line-per-sound` | No line says that each sound gets a line. `build_ido_1` says only “I say the word”; `fm_dots_intro` maps **dots** to sounds. A spoken explanation is needed. |
| `mech:tile-to-line` | `build_ido_3` is followed by a paw placing tiles, and the registry has a full I-do provider. No spoken line explains placing a tile on its line. The ledger can satisfy this mechanic through `exp.modelled`, but speech-only coverage cannot. |
| `term:sound-tile` | `help_tiles` uses “sound tiles” without defining the term. Its former full provider was removed. |
| `mech:tap-reader` | `read_intro` and `read_who` ask which character read correctly; neither says how to choose. The registry has a full I-do provider, but no explaining line. |

The activity-need test checks every registered need present in reviewed line metadata and core cues. Its speech gaps are `mech:tap-reader`, `mech:tile-to-line`, and `term:sound-tile`. The first two have explicit I-do providers; the term has no provider. `idea:one-line-per-sound` is a registry gap even though Stage 1 has not yet put it in a core activity need. The test pins these exceptions so another need cannot silently lose its explaining line.

## Unclassified lines and limits

**None.** Some short fragments (`this_is`, `t_in`, `t_or`, and similar) depend on an adjacent word, sound, or visual. They have a purpose but no invented notion tag. Other tagless lines are navigation, praise, flavour, or transitions with no relevant registered notion.

The current `LineMeta` type has speaker (`who`) and purpose but no audience field. Audience cannot be encoded in this sidecar without a type change outside this task's scope.
