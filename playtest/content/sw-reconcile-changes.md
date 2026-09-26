# sw.ts reconciliation with the research dossier: what changed for content

Date: 26 September 2026. Compared: `src/content/sw.ts` before the reconciliation and after it, using `gpcsOfUnit`, `newGpcsIn`, `knownGpcsAt`, `contentQuota`, `INITIAL_CODE_UNITS[].specialWords`, `BRIDGING_UNIT` and `EXTENDED_CODE_UNITS[].examples` for every unit in `SW_SEQUENCE`. The policy is the default (`DEFAULT_SPLIT = "consonant-e"`, `psc: false`) unless it says "split".

Nothing changed in: unit ids, `SW_SEQUENCE`, unit titles and target sounds or spellings (`EXTENDED_CODE_UNITS[].title/sound/spelling`), Initial Code `newCode` and `structures`, `structureOf`, `isDecodableAt`'s rules, `renderSegs`, `VALIDATOR_RULES`, and the quotas of every unit not listed in section 4.

## 1. Unit GPC sets (`gpcsOfUnit`)

| Unit | Added | Removed | Why |
|---|---|---|---|
| BR | v>v, ve>v | l>l, ll>l, u>w | Bridging Unit is now /k/, /ch/, /w/, /v/ (07.2024 IC timeline linked from the 2026 Handbook; 10.2024 Year 1 guidance; 2024 Bridging Unit stories). /l/ and optional < u > moved to `BRIDGING_UNIT.earlier`. |
| EC1 | – | be>b, ce>s, de>d, fe>f, ge>j, ne>n, se>s, se>z, the>dh, ve>v, ze>z | Consonant + e spellings are no longer all added at EC1. EC1 keeps te, me, ke, le (the 2024 guidance's /ae/ examples) and pe. |
| EC2 | the>dh | – | consonant + e placement |
| EC4 | be>b, de>d, ne>n, se>s, ze>z | – | consonant + e placement (post-2024 official EC4 material) |
| EC6 | fe>f | – | consonant + e placement ('safe' in Bert's Plan, EC6) |
| EC17 | se>z | – | consonant + e placement (with < s > = /z/) |
| EC19 | oor>or | – | 06.2025 HFW chart and the 2026 progress checks (door, poor, floor are Unit 19 words) |
| EC21 | eu>ue | – | record sheet: ue u-e u ew eu (feud) |
| EC34 | re>er | – | 2026 checks FAQ: Unit 34 teaches < re >, < ar >, < our > (litre) |
| EC36 | – | o>oo | the record sheet and word lists for Unit 36 have no < o > (still taught in EC10) |
| EC37 | gg>j | – | record sheet: j g ge gg dge |
| EC39 | gg>g, gg>j | – | record sheet: "Spellings < g > and < gg >" |
| EC43 | oor>or | – | cumulative list follows EC19 |
| EC47 | ed>t | – | 2026 checks read 'stopped' as a Unit 47 word; 12.2025 analysis files < ed > = /t/ here |

Under `split: "split"` only BR, EC19, EC21, EC34, EC36, EC37, EC39, EC43 and EC47 change (the same rows minus the consonant + e ones).

Where each consonant + e spelling now enters (`SPLIT_SPELLING.consonantE[].unit`): te, me, ke, le, pe → EC1; ve → IC11 (unchanged); the → EC2; de, ne, ze, se (/s/), be → EC4; fe → EC6; ce → EC16; se (/z/) → EC17; ge → EC37.

## 2. New GPCs per unit (`newGpcsIn`)

| Unit | Before | After |
|---|---|---|
| EC1 | a ai ay ea ke le me te pe + be ce de fe ge ne se>s se>z the ze | a ai ay ea ke le me pe te |
| EC2 | ee ea e y | ee ea e y + the |
| EC4 | o oa ow oe | o oa ow oe + be de ne se>s ze |
| EC6 | er ir ur or | er ir ur or + fe |
| EC16 | c sc st | c sc st + ce |
| EC17 | s>z | s>z + se>z |
| EC19 | or aw au a ar al | or aw au a ar al + oor |
| EC21 | ue ew u | ue ew u + eu |
| EC34 | ar ear our | ar ear our + re |
| EC37 | dge g>j | dge g>j + ge + gg>j |
| EC47 | tt bt | tt bt + ed>t |

## 3. Code known at each unit (`knownGpcsAt`)

Every Extended Code unit changed. Initial Code units and BR did not.

| Units | Removed from the known set | Added |
|---|---|---|
| EC1 | be, ce, de, fe, ge, ne, se>s, se>z, the, ze | – |
| EC2–EC3 | be, ce, de, fe, ge, ne, se>s, se>z, ze | – |
| EC4–EC5 | ce, fe, ge, se>z | – |
| EC6–EC15 | ce, ge, se>z | – |
| EC16 | ge, se>z | – |
| EC17–EC18 | ge | – |
| EC19–EC20 | ge | oor>or |
| EC21–EC33 | ge | eu>ue, oor>or |
| EC34–EC36 | ge | eu>ue, oor>or, re>er |
| EC37–EC46 | – | eu>ue, gg>j, oor>or, re>er |
| EC47–EC49 | – | ed>t, eu>ue, gg>j, oor>or, re>er |

## 4. Quotas (`contentQuota`)

Only units whose `gpcs` length changed:

| Unit | words | pictures |
|---|---|---|
| EC19 | 48 → 56 | 18 → 21 |
| EC21 | 32 → 40 | 12 → 15 |
| EC34 | 56 → 64 | 21 → 24 |
| EC36 | 72 → 64 | 27 → 24 |
| EC37 | 32 → 40 | 12 → 15 |
| EC39 | 16 → 32 | 6 → 12 |
| EC43 | 88 → 96 | 33 → 36 |
| EC47 | 32 → 40 | 12 → 15 |

No other quota changed (BR, all IC units, EC1–EC18, EC20, EC22–EC33, EC35, EC38, EC40–EC42, EC44–EC46, EC48–EC49 and PW1–PW9 are identical).

## 5. Special words (`INITIAL_CODE_UNITS[].specialWords`)

| Unit | Before | After | Source |
|---|---|---|---|
| IC5 | to, are | are | manual Part 3 table; 2026 Egyptian Adventures stories treat 'to' as a help word up to Unit 8 |
| IC9 | – | to | manual p.99: "High-frequency word to introduce: to." |
| IC11 | there, their, these, what, where, who | + she | 2024 Bridging Unit stories list 'she' as previously taught |

`FRESHFORD_SPECIAL_WORDS` did not change.

## 6. Bridging Unit targets (`BRIDGING_UNIT.sounds`)

Before: /k/ (c k ck), /w/ (w wh, optional u), /ch/ (ch tch), /l/ (l ll). After, in teaching order: /k/ (c k ck), /ch/ (ch tch), /w/ (w wh), /v/ (v: van, vest, vet; ve: live, give, have, twelve, solve). `weeksPerSound` stays 1.

## 7. Example words (`EXTENDED_CODE_UNITS[].examples`, used by build-unit as candidates)

Added official 2026 progress-check words to EC2, EC4, EC6, EC7, EC8, EC10, EC11, EC12, EC14, EC16, EC18, EC19, EC20, EC21, EC23, EC24, EC25, EC27, EC28, EC29, EC30, EC32, EC33, EC34, EC35, EC36, EC37, EC38, EC40, EC42, EC43, EC44, EC45, EC46, EC47, EC48. Removed: 'huge' (EC21; needs < ge >, EC37), and the unsourced 'ladder' (EC28), 'hammer' (EC42), 'rhino' (EC46).

## 8. What this does to the content generated so far (checked 26 Sep 2026, 09:25)

Checked every word, chain and sentence in `src/content/units/{IC1–IC11,BR,EC1–EC26}.ts` with the old and new `isDecodableAt`:

- **EC21**: 'huge' (h.u=ue.ge=j) is no longer decodable at EC21 (< ge > enters at EC37).
- **EC4**: sentence "A hawk sat on the fence." (maxUnit EC2): 'fence' needs < ce > (EC16).
- **EC8**: sentence "A little bird sat on the fence." (maxUnit EC6): same, 'fence'.
- **EC19**: 'door', 'floor', 'poor' are now decodable at EC19, and < oor > is a new sort target there.
- **EC21**: < eu > is a new sort target (feud); the quota rose to 40 words, 15 pictures.
- **BR**: the file already uses /k/, /ch/, /w/, /v/ sort tags (c, k, ck, ch, tch, w, wh, v, ve); no /l/ tags remain. No change needed beyond revalidation.
- No IC sentence uses 'to' before IC9, so the special-word move breaks nothing.
- Every other word, chain and sentence stays decodable at its unit.

Revalidate: all of EC1–EC26 (the known set changed at every EC unit), plus BR, IC5, IC9 and IC11 for the special words. Units EC27–EC49 have no content yet; build them from the new sets.

## 9. API changes (all additive, apart from the Bridging type)

- `Source.ref` (dossier bibliography id); about 60 new `SourceId`s, including the official free downloads in `assets-src/sw-sources/downloads/`.
- `BridgingUnit.earlier` (required) holds the older /l/ and < u > content; `sounds[].optional` is no longer used.
- `ExtendedCodeUnit.weeks` (1 or 2, the Handbook's one-week units); `EcOpts.also` for extra spelling-unit pairs.
- `SPLIT_SPELLING.consonantE` entries now carry `unit`, `conf` and `why`; `gpcsOfUnit` adds each at its unit.
- `ErrorType` gains "letter-name", "said-separately", "guess", "wrong-order"; `ErrorScript.trackerTag`.
- New exports: `PROGRESS_CHECKS`, `TANGENTIAL_TEACHING`, `LEXICON_AUDIT`. `PACING` gains `oneWeekUnits`, `year3Terms` and more `lags`; `SESSION.lessonsPerSession` is now [3, 4] (Handbook) and gains `ks2`; `SwActivity.nurseryElement`; `EC50_SCHWA.current = false`.
- Lesson names: L14 "Reading Polysyllabic Words", L15 "Analysing Polysyllabic Words" (L15 was null).
