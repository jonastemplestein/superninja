// Sounds~Write model for Super Ninja: the programme's structure as typed data, plus the game-side types
// (activities, evidence, mastery, exercise items) that the game adopts. Prose, mapping and refactor plan:
// docs/SOUNDS_WRITE_MODEL.md.
//
// Sounds~Write is a registered trade mark of Sounds-Write Ltd. This file records the published structure of
// the programme (scope and sequence, lesson numbers, short quotations) with citations. It is not their material.
//
// Rules
// - Pure data and small pure helpers. The only import is the PhonemeId type from phonics.ts.
// - Every record says where it comes from (`src`, keys of SOURCES) and how sure we are (`conf`, a Tier).
// - Reconciled with the research dossier (assets-src/sw-sources/research/DOSSIER.md, September 2026). "DOSSIER §x"
//   points to its sections; SOURCES[].ref is the dossier's bibliography id (§17). A remaining `// TODO(verify)` marks
//   something the public sources cannot settle, and names the open question in DOSSIER §16.
// - Spellings are our grapheme strings, as in flower.ts. Split spellings are written "a-e".
// - Sounds are our PhonemeIds. Where Sounds~Write names a sound differently, see SW_SOUND_MAP.

import type { PhonemeId } from "./phonics";

// =============================================================================================== provenance

/** official: Sounds-Write Ltd documents and site. founder: John Walker (Sounds-Write director) on his blog.
 *  school: Freshford's own parent decks (Jonas's school). secondary: other schools' documents.
 *  inferred: our reading of the sources, not stated anywhere. */
export type Tier = "official" | "founder" | "school" | "secondary" | "inferred";

export type SourceId =
  | "sw-ss-initial" | "sw-ss-uk" | "sw-pedagogy" | "sw-planning" | "sw-impl-2020" | "sw-psc-2024" | "sw-psc-2023"
  | "sw-hfw-2023" | "sw-parents-yr-2023" | "sw-elg-faq" | "sw-deck-2017" | "sw-blog-cumulative" | "sw-blog-progress-checks"
  | "sw-blog-pa" | "sw-blog-psc-2024" | "sw-blog-psc-midyear"
  | "sw-plan-r-2023" | "sw-plan-y1-2023" | "sw-plan-y2-2023" | "sw-tte-psw" | "sw-diagnostic" | "sw-lexicon" | "sw-split-2024" | "grange-2026"
  | "sw-handbook-2026" | "sw-poster-2024" | "sw-ss-ec" | "sw-ss-psw" | "sw-record-sheet" | "sw-ic-vocab" | "sw-manual-99-100" | "sw-ic-words-2019"
  | "sw-ec-wordlists" | "sw-ec-worksheets" | "sw-checks-ic-2026" | "sw-checks-ec-2026" | "sw-checks-ec-2024" | "sw-checks-faq-2026"
  | "sw-ic-timeline-2024" | "sw-ec-timeline-2024" | "sw-y1-new-2024" | "sw-y2-start-2024" | "sw-hfw-2025" | "sw-tangential-2024"
  | "sw-bridging-sheet" | "sw-psw-intro-2024" | "sw-psw-tips" | "sw-doc47" | "sw-l11-demo" | "sw-l1-tips" | "sw-l5-tips" | "sw-l6-tips"
  | "sw-l15-tips" | "sw-l4a-page" | "sw-l10-pages" | "sw-l3-tips" | "sw-general-points" | "sw-readers-guide" | "sw-blending-masterclass"
  | "sw-parents-guide-2024" | "sw-parent-course" | "sw-tracker" | "sw-quizzing" | "sw-speedread" | "sw-psc-2025-blog" | "sw-statutory-2025"
  | "sw-mixed-age" | "sw-membership-2026" | "sw-tracking-form-2020"
  | "sw-bridging-stories-2024" | "sw-ec-xmas-2024" | "sw-ic-xmas-2024" | "sw-bert-2024" | "sw-glow-2025" | "sw-posters-2025" | "sw-egypt-2026"
  | "sw-first-steps-ic" | "sw-first-steps-ec" | "sw-seek-2023" | "sw-santa-ic3" | "sw-early-years-2025" | "sw-psc-reflective-2026"
  | "sw-podcast-ep20" | "sw-psw-doc25" | "sw-psw-doc45" | "sw-psw-cards" | "sw-autobiographical"
  | "walker-word-building" | "walker-lp-2014" | "walker-spelling-errors" | "walker-nonwords"
  | "freshford-yr" | "freshford-y1y2"
  | "grange-2024" | "fairfield" | "iford" | "stbedes" | "stbernadettes" | "stanleyroad" | "englishmartyrs"
  | "barleyhill" | "springgardens" | "newportgardens" | "concepts-schools" | "repo-pedagogy";

export interface Source {
  title: string; url: string; tier: Tier; date?: string;
  /** copy in assets-src/sw-sources/ */ local?: string;
  /** bibliography id in DOSSIER §17 (O = official, S = school, X = secondary) */ ref?: string;
}

export const SOURCES: Record<SourceId, Source> = {
  "sw-ss-initial": { title: "Sounds-Write sequence: Initial Code (scope and sequence)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/11/Initial-Code-Scope-and-Sequence.pdf", tier: "official", date: "2023-11", local: "initial-code-scope-sequence.pdf", ref: "O9" },
  "sw-ss-uk": { title: "UK Scope and Sequence: Initial Code, Extended Code, Polysyllabic Words", url: "https://portal-api.sounds-write.co.uk/files/89947211-513d-449b-9a7a-fdde75184863/content?u=vjfsdb2dvz3la8oi8er4stxkw2h546m3", tier: "official", local: "uk-scope-sequence.pdf", ref: "O10" },
  "sw-pedagogy": { title: "Our Pedagogy", url: "https://sounds-write.co.uk/our-pedagogy/", tier: "official", date: "2025-03", ref: "O24" },
  "sw-planning": { title: "Planning Phonics Lessons", url: "https://sounds-write.co.uk/planning-phonics-lessons/", tier: "official", ref: "O41" },
  "sw-impl-2020": { title: "Suggested implementation of the Initial Code (Foundation, UK), Lyra, Walker and Beaven", url: "https://www.ckschool.leics.sch.uk/attachments/documents.asp?id=108", tier: "official", date: "2020", local: "sw-suggested-implementation-initial-code-2020.pdf", ref: "O19/O203" },
  "sw-psc-2024": { title: "The Phonics Screening Check Guidance (England)", url: "https://portal-api.sounds-write.co.uk/files/73a9e258-4e6e-494e-b1fe-e48d9f124730/content?u=gcjxkctcz9fa5u8d558dc0q0ffztaecz", tier: "official", date: "2024-09", local: "sw-psc-guidance-england-2024.pdf", ref: "O11" },
  "sw-psc-2023": { title: "The Phonics Screening Check Guidance (England), 2023 edition", url: "https://www.grangeprimaryacademy.org.uk/Portals/0/adam/Content/DTRy4OSOsUa4-hYSJE0izg/Link/The%20Phonics%20Screening%20Check%20Guidance%20%20England%20UK%20Sept%202023.pdf", tier: "official", date: "2023-06", ref: "O245" },
  "sw-hfw-2023": { title: "High Frequency Words in Sounds-Write", url: "https://portal-api.sounds-write.co.uk/files/069381a8-8e69-41d6-bf73-e46b4fdc0d54/content?u=3z838tvqll7rtlvz61zyh7sm0xf7csgc", tier: "official", date: "2023-06", local: "sw-hfw-manual-extract.pdf", ref: "O145" },
  "sw-parents-yr-2023": { title: "Sounds-Write: A guide for parents (Reception)", url: "https://files.schudio.com/farcet-c-of-e-primary-school/files/documents/Sounds-Write-a-Guide-for-Reception-Parents.pdf", tier: "official", date: "2023-06", local: "farcet-sw-guide-reception-parents.pdf", ref: "O143/O196" },
  "sw-elg-faq": { title: "FAQ: Does Sounds-Write meet the Early Learning Goals (2021)?", url: "https://sounds-write.co.uk/wp-content/uploads/2023/02/faq_sounds-write_and_the_elgs.pdf", tier: "official", local: "sw-elg-faq.pdf", ref: "O190" },
  "sw-deck-2017": { title: "Sounds-Write: help your child to read and write (parent presentation, © Sounds-Write 2017)", url: "https://lanchester.eschools.co.uk/storage/secure_download/TW1nbzRyV0V2YW1SQ3V1Tk1xcThpZz09", tier: "official", date: "2017", local: "lanchester-sw-real-phonic-programme.pdf", ref: "O4" },
  "sw-blog-cumulative": { title: "The Cumulative Nature of Sounds-Write", url: "https://sounds-write.co.uk/the-cumulative-teaching-in-phonics-sounds-write/", tier: "official", date: "2024-12", ref: "O210" },
  "sw-blog-progress-checks": { title: "Supporting Student Reading Success Through Assessment", url: "https://sounds-write.co.uk/supporting-student-reading-success-through-assessment/", tier: "official", date: "2025-08" },
  "sw-blog-pa": { title: "Mastering Phonemic Awareness: Your Key to PSC Success", url: "https://sounds-write.co.uk/mastering-phonemic-awareness-your-key-to-psc-success/", tier: "official", date: "2024-10", ref: "O23" },
  "sw-blog-psc-2024": { title: "The Phonics Screening Check 2024: Our Analysis", url: "https://sounds-write.co.uk/the-phonics-screening-check-2024-our-analysis/", tier: "official", date: "2024-07", ref: "O76" },
  "sw-blog-psc-midyear": { title: "PSC: Mid-Year Strategies to Ensure Everyone is On Track", url: "https://sounds-write.co.uk/psc-mid-year-strategies-to-ensure-students-are-on-track/", tier: "official", date: "2024-11", ref: "O262" },
  "sw-plan-r-2023": { title: "Planning Guidance: first year of school (Reception – England)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/07/IC-Planning-Guidance-first-year-of-school-Reception-England-06.2023.docx.pdf", tier: "official", date: "2023-06", local: "research/official-pdfs/2023-07-IC-Planning-Guidance-first-year-of-school-Reception-England-06.2023.docx.txt", ref: "O30" },
  "sw-plan-y1-2023": { title: "EC & PSW Planning Guidance: second year of school (Year 1 – England)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/07/EC-PSW-Planning-Guidance-second-year-of-school-Year-1-England-06.2023.docx-1.pdf", tier: "official", date: "2023-06", local: "research/official-pdfs/2023-07-EC-PSW-Planning-Guidance-second-year-of-school-Year-1-England-06.2023.docx-1.txt", ref: "O60" },
  "sw-plan-y2-2023": { title: "EC & PSW Planning Guidance: third year of school (Year 2 – England)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/07/EC-PSW-Planning-Guidance-third-year-of-school-Year-2-England-06.2023-.pdf", tier: "official", date: "2023-06", local: "research/official-pdfs/2023-07-EC-PSW-Planning-Guidance-third-year-of-school-Year-2-England-06.2023-.txt", ref: "O64" },
  "sw-tte-psw": { title: "Error Correction: Lessons Eleven to Fourteen (© Sounds-Write 2021; published as 'Teaching Through Errors')", url: "https://sounds-write.co.uk/wp-content/uploads/2024/08/Teaching-Through-Errors-.pdf", tier: "official", date: "2021", local: "research/official-pdfs/2024-08-Teaching-Through-Errors-.ocr.txt", ref: "O68/O149" },
  "sw-diagnostic": { title: "Criterion-Referenced Phoneme Skills Tests; Alphabet Code Knowledge Test (Four-Day Course handout d)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/21-the-diagnostic-tests.pdf", tier: "official", local: "research/official-pdfs/2023-01-21-the-diagnostic-tests.txt", ref: "O338" },
  "sw-lexicon": { title: "English Spellings: A Lexicon (Philpot, Walker & Case, © Sounds~Write Ltd; first published 2007, this edition April 2011)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/02/49-sounds_write_english_spellings_lexicon.pdf", tier: "official", date: "2011-04", local: "downloads/sw-lexicon-of-english-spellings.pdf", ref: "O17" },
  "sw-split-2024": { title: "Changes to guidance on the split spelling – September 2024 (Sounds-Write, school-hosted)", url: "https://files.schudio.com/anthony-curton-cofe-primary-school/files/documents/Phonics_Split_Spelling_Guidance.pdf", tier: "official", date: "2024-09", local: "research/extended-code/sw-split-spelling-guidance-2024-anthonycurton.txt", ref: "O18" },
  "grange-2026": { title: "Grange Primary: Sounds Write Phonics Expectations 2026-2027 (post-split-spelling unit lists)", url: "https://www.grangeprimaryacademy.org.uk/Portals/0/adam/Content/OBjxeTSsS0KeHZI1P_ORqw/Link/Sounds%20Write%20Expectations%202026%202027.pdf", tier: "secondary", local: "research/extended-code/grange-sw-expectations-2026-27.txt", ref: "S80" },
  // ---- added in the dossier reconciliation (September 2026); all official unless the tier says otherwise
  "sw-handbook-2026": { title: "Phonics Lead Handbook (September 2026)", url: "https://sounds-write.co.uk/wp-content/uploads/2026/09/Phonics-Lead-Handbook-September-2026.pdf", tier: "official", date: "2026-09", local: "research/official-pdfs/2026-09-Phonics-Lead-Handbook-September-2026.txt", ref: "O1" },
  "sw-poster-2024": { title: "Skills and Concepts A3 staffroom posters (product image)", url: "https://sounds-write.co.uk/wp-content/uploads/2024/09/Poster-marketing-image-white-background.png", tier: "official", date: "2024-09", ref: "O3" },
  "sw-ss-ec": { title: "Sounds-Write sequence: Extended Code (scope and sequence, Units 1-49)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/11/Extended-Code-Scope-and-Sequence.pdf", tier: "official", date: "2023-11", ref: "O238" },
  "sw-ss-psw": { title: "Polysyllabic Words – Scope and Sequence", url: "https://sounds-write.co.uk/wp-content/uploads/2023/11/Polysyllabic-Words-Scope-and-Sequence.pdf", tier: "official", date: "2023-11", ref: "O261" },
  "sw-record-sheet": { title: "Manual Part 3, Section 3: record sheets (Initial Code, Extended Code 1-49, Polysyllabic stages; pre-2024)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/manual-part-3-section-3.pdf", tier: "official", ref: "O14" },
  "sw-ic-vocab": { title: "Manual Part 3: Initial Code new vocabulary and high-frequency words by unit", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/manual-part-3-section-1.pdf", tier: "official", local: "research/official-pdfs/TRANSCRIBED-manual-part-3-initial-code-word-lists.txt", ref: "O198" },
  "sw-manual-99-100": { title: "Revised manual pp. 99-100 (April 2018): Initial Code Units 9-11", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/46-revised-pp-99-100-for-manual-april-2018.pdf", tier: "official", date: "2018-04", ref: "O199" },
  "sw-ic-words-2019": { title: "The Initial Code: words for reading and spelling (revised July 2019)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/23-initial-code-words-to-read-and-spell.pdf", tier: "official", date: "2019-07", ref: "O160" },
  "sw-ec-wordlists": { title: "Manual pp. 147-153: word lists for teaching the Extended Code (pre-2024)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/44-word-lists-for-extended-code-pp147-53.pdf", tier: "official", ref: "O240" },
  "sw-ec-worksheets": { title: "Manual Part 3, Section 2: Extended Code worksheets, Units 1-49 (pre-2024)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/manual-part-3-section-2.pdf", tier: "official", ref: "O243" },
  "sw-checks-ic-2026": { title: "Progress Checks for the Initial Code (2026)", url: "https://sounds-write.co.uk/wp-content/uploads/2026/08/Progress-Checks-for-the-Initial-Code-2026.pdf", tier: "official", date: "2026-08", local: "research/official-pdfs/2026-08-Progress-Checks-for-the-Initial-Code-2026.txt", ref: "O152" },
  "sw-checks-ec-2026": { title: "Progress checks for the Extended Code (2026) and its reading spreadsheet", url: "https://sounds-write.co.uk/wp-content/uploads/2026/08/Progress-checks-for-the-Extended-Code-2026.pdf", tier: "official", date: "2026-08", local: "research/official-pdfs/2026-08-Progress-checks-for-the-Extended-Code-2026.txt", ref: "O153/O242" },
  "sw-checks-ec-2024": { title: "Progress checks for the Extended Code, October 2024", url: "https://sounds-write.co.uk/wp-content/uploads/2026/06/Progress-checks-for-the-Extended-Code-October-2024.pdf", tier: "official", date: "2024-10", ref: "O241" },
  "sw-checks-faq-2026": { title: "Progress checks FAQs (2026)", url: "https://sounds-write.co.uk/wp-content/uploads/2026/08/Progress-checks-FAQs-2026.pdf", tier: "official", date: "2026-08", ref: "O122" },
  "sw-ic-timeline-2024": { title: "IC Sounds-Write Timeline 07.2024 (linked from the Phonics Lead Handbook 2026)", url: "https://portal-api.sounds-write.co.uk/files/0482ad1f-efb5-41eb-bda8-f6a6d0faf19c/content?u=7xw2q61s3pdxj9kr9nrlpen0ky30gzlb", tier: "official", date: "2024-07", ref: "O200" },
  "sw-ec-timeline-2024": { title: "EC PSW Sounds-Write Timeline 07.2024 (linked from the Phonics Lead Handbook 2026)", url: "https://portal-api.sounds-write.co.uk/files/b295235c-2172-4085-b877-f4c8e07c2e11/content?u=lvq2t87qao3anbx3ow4uew16d0uhjzjx", tier: "official", date: "2024-07", ref: "O239" },
  "sw-y1-new-2024": { title: "Schools new to Sounds-Write in Year 1 (England) 10.2024", url: "https://portal-api.sounds-write.co.uk/files/b7ba8c99-047a-4f3d-ba6e-cdb2d3204cdd/content?u=nd5ufxbj3tj2i56fy6zuwb0aan5nyp1k", tier: "official", date: "2024-10", ref: "O201" },
  "sw-y2-start-2024": { title: "Starting Sounds-Write in Year 2 or beyond, 10.2024", url: "https://portal-api.sounds-write.co.uk/files/fa465ea1-48f3-49a8-a4ba-ae3afb397c58/content?u=45ve3q61hdshq6oao0cfo5e4fixhovj2", tier: "official", date: "2024-10", ref: "O233" },
  "sw-hfw-2025": { title: "High Frequency Words in Sounds-Write (06.2025; file 'May 2026')", url: "https://sounds-write.co.uk/wp-content/uploads/2026/06/High-Frequency-Words-May-2026.pdf", tier: "official", date: "2025-06", ref: "O91" },
  "sw-tangential-2024": { title: "Tangential Teaching (09.2024, linked from the Handbook)", url: "https://portal-api.sounds-write.co.uk/files/8dee8957-3d2f-4a2e-97f8-c04ad33fda85/content?u=6np39v5i9cs0kfg80zcjtrg1w6g7wu0k", tier: "official", date: "2024-09", ref: "O244" },
  "sw-bridging-sheet": { title: "Lesson 6 – Bridging Lesson (word lists; older, includes /l/)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/39-lesson-6-bridging-lesson.pdf", tier: "official", ref: "O28" },
  "sw-psw-intro-2024": { title: "Introducing Polysyllabic Words (10.2024, linked from the Handbook)", url: "https://portal-api.sounds-write.co.uk/files/6d394151-7b9c-4b14-9334-4686b9ab7cb4/content?u=r7fvpq95p3zc9ytaql2syfx1cg83bicf", tier: "official", date: "2024-10", ref: "O226" },
  "sw-psw-tips": { title: "Five Top Tips for the Polysyllabic Word Lessons (2021)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-for-polysyllabic-word-lessons.pdf", tier: "official", date: "2021", ref: "O58" },
  "sw-doc47": { title: "How should the teaching of polysyllabic words proceed? (doc 47)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/47-how-should-the-teaching-of-polysyllabic-words-proceed.pdf", tier: "official", ref: "O67" },
  "sw-l11-demo": { title: "PSW L11: repeat after me (Sounds-Write trainer demonstration, 2020; machine transcript)", url: "https://player.vimeo.com/video/414550020?h=15d98b6fa8", tier: "official", date: "2020-05", ref: "O264" },
  "sw-l1-tips": { title: "Top Tips for Lesson 1, with the Lesson One: Word-Building script extract", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-for-lesson-1.pdf", tier: "official", date: "2022", ref: "O36" },
  "sw-l3-tips": { title: "Top Tips for Lesson 3 Sound-Swap", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-for-lesson-3.pdf", tier: "official", date: "2022", ref: "O25" },
  "sw-l5-tips": { title: "Top Tips for Lesson 5", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-lesson-5.pdf", tier: "official", ref: "O45" },
  "sw-l6-tips": { title: "Top Tips for Lesson 6 (2021; pre-2024 Part 2)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-for-lesson-6.pdf", tier: "official", date: "2021", ref: "O61" },
  "sw-l15-tips": { title: "Top Tips for Lesson 15", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/top-tips-for-lesson-15.pdf", tier: "official", ref: "O70" },
  "sw-l4a-page": { title: "Manual pp. 92A-92B: The Initial Code Lesson Four(a): Dictation, with its error corrections", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/manual-new-page-lesson-4a-dictation.pdf", tier: "official", ref: "O35/O117" },
  "sw-l10-pages": { title: "Manual pp. 145-6: Extended Code Lesson 10 (One Spelling, Different Sounds)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/98-lesson-10-pp45-6-update-jan-17.pdf", tier: "official", ref: "O37" },
  "sw-general-points": { title: "Teaching Sounds-Write – some general points to remember", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/34-teaching-sounds-write-some-general-points.pdf", tier: "official", ref: "O16" },
  "sw-readers-guide": { title: "How to use Sounds-Write readers (2012, archived)", url: "https://web.archive.org/web/20160705054920/http://www.sounds-write.co.uk:80/docs/how_to_use_sounds_write_readers.pdf", tier: "official", date: "2012", ref: "O110" },
  "sw-blending-masterclass": { title: "Blending Strategies – Interventions Masterclass (03.2026)", url: "https://sounds-write.co.uk/wp-content/uploads/2026/04/Blending-Strategies-Interventions-Masterclass.pdf", tier: "official", date: "2026-03", ref: "O102" },
  "sw-parents-guide-2024": { title: "Sounds-Write: A guide for parents (Reception), 09.2024", url: "https://www.wildridingsprimary.co.uk/attachments/download.asp?file=152&type=pdf", tier: "official", date: "2024-09", ref: "O112" },
  "sw-parent-course": { title: "Help your child to read and write, Parts 1 and 2 (John Walker, free Udemy course; free-preview captions)", url: "https://www.udemy.com/course/help-your-child-to-read-and-write-part-2/", tier: "official", ref: "O20/O44/O104/O106" },
  "sw-tracker": { title: "Progress Tracker for UK Members (demo video and screenshots, 2026)", url: "https://vimeo.com/1189379941", tier: "official", date: "2026-05", ref: "O137/O138/O108" },
  "sw-quizzing": { title: "Quizzing (2019)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/48-quizzing-2019.pdf", tier: "official", date: "2019", ref: "O95" },
  "sw-speedread": { title: "SpeedRead: how to smile, have fun and learn at the same time", url: "https://sounds-write.co.uk/wp-content/uploads/2023/02/75-speedread-complete.pdf", tier: "official", date: "2023", ref: "O94" },
  "sw-psc-2025-blog": { title: "The Phonics Screening Check 2025 (England): Our Analysis", url: "https://sounds-write.co.uk/the-phonics-screening-check-2025-our-analysis/", tier: "official", date: "2025", ref: "O197" },
  "sw-statutory-2025": { title: "Word lists for Years 3-6: analysis of the DfE statutory spelling lists (12.2025)", url: "https://sounds-write.co.uk/wp-content/uploads/2026/01/Formatted-Statutory-spellings-Years-3-4-5-6-Word-list-2025.pdf", tier: "official", date: "2025-12", ref: "X71" },
  "sw-mixed-age": { title: "Teaching Sounds-Write in a school with mixed-age classes (06.2023)", url: "https://portal-api.sounds-write.co.uk/files/dd7dd7b2-0880-4b1f-967e-a5818f51084d/content?u=a0bcg75goa1z6ffxeodxnp8lkwjuq0ln", tier: "official", date: "2023-06", ref: "O255" },
  "sw-membership-2026": { title: "Sounds-Write membership video (2026; portal whiteboard screens)", url: "https://vimeo.com/1197743125", tier: "official", date: "2026", ref: "O48" },
  "sw-tracking-form-2020": { title: "Sounds-Write tracking form (2020)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/sw-tracking-form-1-2020.pdf", tier: "official", date: "2020", ref: "O206" },
  // ---- official free downloads (Sounds-Write free-resources form, 26 Sep 2026; assets-src/sw-sources/downloads/, text in _text/)
  "sw-bridging-stories-2024": { title: "Bridging Unit Christmas Stories: < c k ck > /k/, < ch tch > /ch/, < w wh > /w/, < v ve > /v/ (Text © Sounds-Write 2024)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2024-11", local: "downloads/bridging-unit-christmas-stories/Bridging Unit Christmas Stories.pdf" },
  "sw-ec-xmas-2024": { title: "Christmas Edition Phonics Activities for the Extended Code (EC1, EC4, EC 1-2-4 polysyllabic)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2024-12", local: "downloads/extended-code-christmas-activities/activities.pdf" },
  "sw-ic-xmas-2024": { title: "Christmas Edition Phonics Activities for the Initial Code (Units 10-11)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2024-12", local: "downloads/initial-code-christmas-activities/activities.pdf" },
  "sw-bert-2024": { title: "Bert's Plan – Extended Code Unit 6 /er/ (Text © Sounds-Write 2024)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2024-12", local: "downloads/bert-s-plan-extended-code-unit-6-er/Bert's Plan - Extended Code Unit 6 _er_.pdf" },
  "sw-glow-2025": { title: "The Glow in the Snow – Extended Code Unit 4 /oe/", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2025-11", local: "downloads/the-glow-in-the-snow-ec4/story.pdf" },
  "sw-posters-2025": { title: "Extended Code Printable Sounds Posters (older readers; Australia)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2025-09", local: "downloads/extended-code-sound-posters-for-older-learners/Extended Code Printable Sounds Posters Sounds-Write.pdf" },
  "sw-egypt-2026": { title: "Initial Code Egyptian Adventures (one story per unit, Units 1-11, with previously taught HFWs)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2026-02", local: "downloads/initial-code-egyptian-adventures/Sounds-Write | Initial Code Egyptian Adventures.pdf" },
  "sw-first-steps-ic": { title: "Initial Code First Steps e-books, Units 4-11 (Text © Sounds-Write 2021)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2021", local: "downloads/first-steps-collection/" },
  "sw-first-steps-ec": { title: "Extended Code First Steps e-books, Units 1-14 (Text © Sounds-Write 2022; pre-2024 split spellings)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2022", local: "downloads/first-steps-collection/", ref: "O285-O294" },
  "sw-seek-2023": { title: "Seek the Sounds texts, Extended Code Units 6, 11, 12 (2023)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2023", local: "downloads/seek-the-sounds-extended-code/", ref: "O251" },
  "sw-santa-ic3": { title: "Santa's Snack – Initial Code Unit 3 (reading together)", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", local: "downloads/santa-s-snack-initial-code-unit-3/" },
  "sw-early-years-2025": { title: "Sounds-Write in the Early Years: Getting Ready for Reading, free lesson samples (Element 1, Activities 1.1-1.3)", url: "https://sounds-write.co.uk/sounds-write-in-the-early-years/", tier: "official", date: "2025-07", local: "downloads/sounds-write-in-the-early-years-lesson-samples/", ref: "O166/O169" },
  "sw-podcast-ep20": { title: "The Sounds-Write Podcast Ep 20: Polysyllabic Words with Caroline Hardisty", url: "https://sounds-write.buzzsprout.com/2026282/episodes/14870922-episode-20-polysyllabic-words-with-caroline-hardisty", tier: "official", date: "2024-04", ref: "O65" },
  "sw-psw-doc25": { title: "Polysyllabic words: for reading and spelling (doc 25)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/25-polysyllabic-words-to-read-and-spell.pdf", tier: "official", ref: "O150" },
  "sw-psw-doc45": { title: "Polysyllabic Words: word lists syllabified (doc 45)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/45-polysyllabic-words-split.pdf", tier: "official", ref: "O273" },
  "sw-psw-cards": { title: "Polysyllabic word building and whole-word reading stimulus cards (doc 07)", url: "https://sounds-write.co.uk/wp-content/uploads/2023/01/07-polysyllabic-word-building-reading.pdf", tier: "official", ref: "O268" },
  "sw-autobiographical": { title: "'autobiographical': Lesson 12 demonstration from the Sounds-Write Y3-6 course (John Walker, 2020; machine transcript)", url: "https://player.vimeo.com/video/421223785", tier: "official", date: "2020-05", ref: "O266" },
  "sw-psc-reflective-2026": { title: "Phonics Screening Check (England) Reflective Practice Guide", url: "https://sounds-write.co.uk/free-downloads/", tier: "official", date: "2026-01", local: "downloads/psc-reflective-practice-guide/guide.pdf", ref: "O343" },
  "walker-word-building": { title: "Word building: the foundation stones of beginning literacy (John Walker)", url: "https://theliteracyblog.com/2020/12/20/word-building-the-foundation-stone-of-beginning-literacy/", tier: "founder", date: "2020-12" },
  "walker-lp-2014": { title: "Linguistic phonics: a practical example (John Walker)", url: "https://theliteracyblog.com/2014/01/12/linguistic-phonics-a-practical-example/", tier: "founder", date: "2014-01" },
  "walker-spelling-errors": { title: "How to correct common spelling errors (John Walker)", url: "https://theliteracyblog.com/2016/03/18/how-to-correct-common-spelling-errors/", tier: "founder", date: "2016-03" },
  "walker-nonwords": { title: "The whys and hows of using non-words (John Walker)", url: "https://theliteracyblog.com/2015/11/29/the-whys-and-hows-of-using-non-words/", tier: "founder", date: "2015-11" },
  "freshford-yr": { title: "Freshford: Learning to read and write with Sounds~Write (Reception parents)", url: "~/.moshi/uploads/Phonics presentation for YR parents Sept 23 2026.pdf", tier: "school", date: "2026-09", local: "Phonics presentation for YR parents Sept 23 2026.pdf", ref: "S40" },
  "freshford-y1y2": { title: "Freshford: fluent reader and proficient speller (Year 1 and Year 2 parents)", url: "~/.moshi/uploads/Phonics Presentation for Yr1 Yr 2 parents Sep 2026.pdf", tier: "school", date: "2026-09", local: "Phonics Presentation for Yr1 Yr 2 parents Sep 2026.pdf", ref: "S41" },
  "grange-2024": { title: "Grange Primary Academy: Phonics Expectations 2024-2025 (closely follows Sounds-Write planning guidance)", url: "https://www.grangeprimaryacademy.org.uk/Portals/0/adam/Content/OBjxeTSsS0KeHZI1P_ORqw/Link/Phonics%20Expectations%202024-2025.pdf", tier: "secondary", local: "grange-expectations-2024-25.pdf" },
  "fairfield": { title: "Fairfield CP School: Phonics - Sounds Write Units", url: "https://fairfieldcpschool.co.uk/uploads/ae2ca4b2-0295-41ec-b8b7-a1ab0c7d1a03.pdf", tier: "secondary", local: "fairfield-sw-units.pdf" },
  "iford": { title: "Iford and Kingston: Sounds Write Units & Progression", url: "https://ifordandkingstoncofeschool.eschools.co.uk/storage/secure_download/eDAwMm9NSi9ZYTJBR3M4Vm93L21nUT09", tier: "secondary", local: "iford-sw-units.pdf" },
  "stbedes": { title: "St Bede's: Sounds-Write Progression", url: "https://files.schudio.com/st-bede-s-catholic-primary/files/documents/Sounds-Write_Progression.pdf", tier: "secondary", local: "stbedes-sw-progression.pdf" },
  "stbernadettes": { title: "St Bernadette's, Wigan: Sounds~Write Progression Map", url: "https://saintbernadettes.wigan.sch.uk/wp-content/uploads/2025/11/SoundsWrite-Progression-With-Nursery.pdf", tier: "secondary", local: "stbernadettes-progression.pdf" },
  "stanleyroad": { title: "Stanley Road: Sounds-Write Phonic Teaching Sequence", url: "http://www.stanleyroad.oldham.sch.uk/uploads/4/0/2/8/40289551/phonics_scheme.pdf", tier: "secondary", local: "stanleyroad-phonics-scheme.pdf" },
  "englishmartyrs": { title: "English Martyrs: Sounds Write Medium Term Plan Year 2", url: "https://files.schudio.com/english-martyrs-catholic-primary/files/documents/Sounds_Write_Medium_Term_Planning_-_Year_2.pdf", tier: "secondary", local: "englishmartyrs-y2-mtp.pdf" },
  "barleyhill": { title: "Barley Hill Primary: Phonics: Sounds Write", url: "https://www.barley-hill.oxon.sch.uk/parents/phonics-sounds-write", tier: "secondary" },
  "springgardens": { title: "Spring Gardens Primary: Reading and Phonics", url: "https://www.springgardensprimary.org.uk/subjects/reading-and-phonics/", tier: "secondary" },
  "newportgardens": { title: "Newport Gardens PS (Australia): Sounds-Write parent information", url: "http://www.newportgardensps.vic.edu.au/wp-content/uploads/2024/03/Sounds-Write-Presentation-Parent-Info.pdf", tier: "secondary", local: "newportgardens-parent-info.pdf" },
  "concepts-schools": { title: "School pages quoting the four concepts (St Teresa's Hartlepool, Grange Primary, Iford and Kingston, St Oswald's Durham)", url: "https://stteresashartlepool.bhcet.org.uk/curriculum/phonics", tier: "secondary" },
  "repo-pedagogy": { title: "Super Ninja docs/PEDAGOGY.md (our research notes)", url: "docs/PEDAGOGY.md", tier: "inferred" },
};

// =============================================================================================== ids

export type SwLevelId = "initial-code" | "extended-code" | "polysyllabic";
/** IC1..IC11, BR (Bridging Unit), EC1..EC49 (+ EC50 schwa, see EC50_SCHWA), PW1.. (polysyllabic stages) */
export type SwUnitId = `IC${number}` | "BR" | `EC${number}` | `PW${number}`;
export type SwLessonId = "L1" | "L2" | "L3" | "L4" | "L4a" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10" | "L11" | "L12" | "L13" | "L14" | "L15";
export type ConceptId = 1 | 2 | 3 | 4;
export type SwSkillId = "segmenting" | "blending" | "phoneme-manipulation";
/** a spelling→sound pair, the unit of code knowledge, e.g. "ck>k", "a-e>ae". Same format as gpcKey() in phonics.ts. */
export type GpcKey = `${string}>${PhonemeId}`;
export const gpc = (g: string, p: PhonemeId): GpcKey => `${g}>${p}`;

export interface SpellingRef { g: string; p: PhonemeId; note?: string }
/** a spelling in a word. `gap` (split spellings only): how many following segments sit inside it. c.a-e.k = "cake"
 *  (gap 1, the default); p.a-e.s.t = "paste" (gap 2). */
export interface SwSeg { g: string; p: PhonemeId; gap?: number }

/** Sounds~Write word structures: C = consonant sound, V = vowel sound (x counts as one C, see structureOf). */
export type WordStructure =
  | "V" | "CV" | "VC" | "CVC" | "VCC" | "CVCC" | "CCV" | "CCVC" | "CCVCC" | "CVCCC" | "CCCVC" | "CCCVCC" | "CCVCCC" | "CCCVCCC";

// =============================================================================================== concepts

export interface Concept {
  id: ConceptId;
  /** official wording: Phonics Lead Handbook, September 2026 (DOSSIER §1.1). The Manual itself is not public (§16.3 q1). */
  wording: string;
  /** short label used in official planning ("Concept 3: One Sound – Different Spellings") or by schools */
  short: string;
  examples: string[];
  /** other wordings, each from one source */
  variants: { text: string; src: SourceId }[];
  /** where it is first met, and where it is taught formally */
  introduced: SwUnitId;
  formally: SwUnitId;
  src: SourceId[];
  conf: Tier;
}

// Wording and numbering: Phonics Lead Handbook (Sept 2026), same as the 2024 staffroom poster except concept 2
// ("A sound can be spelled with 1, 2, 3 or 4 letters"). DOSSIER §1.1–1.2.
export const CONCEPTS: Concept[] = [
  {
    id: 1, wording: "Letters are symbols (spellings) that represent sounds.", short: "Letters are spellings of sounds",
    examples: ["mat", "sat"],
    variants: [
      { text: "Letters are used to spell individual sounds (one at a time, from left to right across the page).", src: "sw-deck-2017" },
      { text: "the concept that letters are symbols that represent sounds", src: "sw-psc-2024" },
      { text: "Sounds can be represented by spellings with one letter", src: "sw-ss-uk" },
      { text: "We spell sounds one at a time from left to right across the page. (Handbook: a separate Initial Code outcome)", src: "sw-handbook-2026" },
    ],
    introduced: "IC1", formally: "IC1", src: ["sw-handbook-2026", "sw-poster-2024", "sw-deck-2017", "sw-psc-2024"], conf: "official",
  },
  {
    id: 2, wording: "A sound may be spelled by 1, 2, 3 or 4 letters.", short: "One sound, one or more letters",
    examples: ["dog", "street", "night", "dough"],
    variants: [
      { text: "Each sound may be spelled by one or more letters.", src: "sw-deck-2017" },
      { text: "Some spellings are written with a double consonant.", src: "sw-ss-uk" },
      { text: "Some spellings are written with two or three different letters", src: "sw-ss-uk" },
      { text: "A sound may be spelled by 1, 2 or 3 letters. (Handbook: Initial Code outcome; four-letter spellings come in the Extended Code)", src: "sw-handbook-2026" },
      { text: "A sound can be spelled with 1, 2, 3 or 4 letters.", src: "sw-poster-2024" },
    ],
    introduced: "IC7", formally: "IC11", src: ["sw-handbook-2026", "sw-poster-2024", "sw-deck-2017", "sw-ss-uk"], conf: "official",
  },
  {
    id: 3, wording: "The same sound can be spelled in more than one way.", short: "One sound, different spellings",
    examples: ["rain", "break", "gate", "stay"],
    variants: [
      { text: "Sounds may be written in more than one way", src: "sw-deck-2017" },
      { text: "Concept 3: One Sound – Different Spellings", src: "sw-impl-2020" },
      { text: "The same sound can be spelled in more than one way", src: "sw-ss-uk" },
      { text: "a sound can be represented by more than one spelling", src: "sw-ss-uk" },
    ],
    introduced: "IC11", formally: "BR", src: ["sw-handbook-2026", "sw-poster-2024", "sw-ss-uk", "sw-impl-2020"], conf: "official",
  },
  {
    id: 4, wording: "Many spellings can represent more than one sound.", short: "One spelling, different sounds",
    examples: ["head", "seat", "break"],
    variants: [
      { text: "Many spellings represent more than one sound.", src: "sw-deck-2017" },
      { text: "a spelling can represent more than one sound", src: "sw-ss-uk" },
      { text: "some sound spellings can represent more than one sound", src: "freshford-y1y2" },
    ],
    // The Handbook says pupils "begin to have an understanding" of concepts 3 and 4 in the Initial Code; no Initial Code
    // unit names concept 4 as its objective (DOSSIER §16.3 q2).
    introduced: "EC3", formally: "EC3", src: ["sw-handbook-2026", "sw-poster-2024", "sw-ss-uk", "sw-deck-2017"], conf: "official",
  },
];

// =============================================================================================== skills

export interface Skill {
  id: SwSkillId;
  name: string;
  /** used for reading (read), spelling (spell), or testing alternatives while reading (both) */
  serves: "read" | "spell" | "both";
  definition: string;
  /** exact wording of the scope and sequence at each level */
  perLevel: Partial<Record<SwLevelId, string>>;
  /** Freshford's parent wording */
  school?: string;
  src: SourceId[];
  conf: Tier;
}

export const SKILLS: Skill[] = [
  {
    id: "segmenting", name: "Segmenting", serves: "spell",
    definition: "the ability to pull apart the individual sounds in words",
    perLevel: {
      "initial-code": "Segment, blend and manipulate sounds in CVC words",
      "extended-code": "segment: to spell words containing the target sound",
      polysyllabic: "segment: to spell polysyllabic words by segmenting them first into syllables, and then each syllable, in turn, into sounds",
    },
    school: "Segmenting (separating) individual sounds in speech in order to spell accurately, eg. 'dog' becomes d o g",
    src: ["sw-handbook-2026", "sw-poster-2024", "sw-ss-uk", "freshford-yr"], conf: "official",
  },
  {
    id: "blending", name: "Blending", serves: "read",
    definition: "the ability to push sounds together to build words",
    perLevel: {
      "initial-code": "Segment, blend and manipulate sounds in CVC words",
      "extended-code": "blend: to read words containing the target sound",
      polysyllabic: "blend: to read words by first blending sounds into syllables, and then syllables, in turn, into words",
    },
    school: "Blending – saying individual sounds and hearing the word they make eg. d o g becomes 'dog'",
    src: ["sw-handbook-2026", "sw-poster-2024", "sw-ss-uk", "freshford-yr"], conf: "official",
  },
  {
    // Definition: Handbook and poster; its purpose in reading ("test out alternatives ...") is from the poster and podcast.
    id: "phoneme-manipulation", name: "Phoneme manipulation", serves: "both",
    definition: "the ability to insert sounds into and delete sounds out of words; necessary to test out alternatives for spellings that represent more than one sound",
    perLevel: {
      "initial-code": "Segment, blend and manipulate sounds in CVC words",
      "extended-code": "to manipulate alternative sounds in and out of words",
      // polysyllabic: not specified in the scope and sequence
    },
    school: "the ability to separate and substitute sounds in a word ... essential when reading unfamiliar words, for example ... 'brown', ow could be the sound /oe/ as in 'snow' or /ow/ as in 'cow'",
    src: ["sw-handbook-2026", "sw-poster-2024", "sw-ss-uk", "freshford-yr"], conf: "official",
  },
];

// =============================================================================================== levels

export interface SwLevel {
  id: SwLevelId;
  name: string;
  summary: string;
  /** exact KNOWLEDGE / SEQUENCE wording from the scope and sequence */
  knowledge: string[];
  years: string;
  units: string;
  src: SourceId[];
  conf: Tier;
}

export const LEVELS: SwLevel[] = [
  {
    id: "initial-code", name: "Initial Code",
    summary: "One-letter spellings in CVC words (Units 1–6), double consonants (Unit 7), adjacent consonants (Units 8–10), then two- and three-letter spellings (Unit 11). The Bridging Unit then formally introduces 'the same sound can be spelled in more than one way'.",
    knowledge: ["Sounds can be represented by spellings with one letter", "Some spellings are written with a double consonant.", "Some spellings are written with two or three different letters", "< q > and < u > represent the sounds /k/ and /w/", "The same sound can be spelled in more than one way"],
    years: "Reception", units: "IC1–IC11, then the Bridging Unit", src: ["sw-ss-uk", "sw-ss-initial"], conf: "official",
  },
  {
    id: "extended-code", name: "Extended Code",
    summary: "49 units: 38 sound units teach the common spellings of one sound (six sounds come twice, as 'first spellings' and later 'more spellings': /ae/ 1 & 27, /ee/ 2 & 29, /oe/ 4 & 32, /er/ 6 & 34, m/oo/n 10 & 36, /or/ 19 & 43); 11 spelling units (3, 5, 9, 13, 15, 17, 22, 26, 31, 39, 41) teach the sounds one spelling can represent, with Lesson 10, alongside the sound unit before them. Unit 50 (schwa) is not current (DOSSIER §9.1).",
    knowledge: [
      "a sound can be represented by more than one spelling;", "the most common spellings which represent the target sound.",
      "a spelling can represent more than one sound;", "the most common sounds represented by the target spelling.",
    ],
    years: "Year 1 (EC1–EC26) and Year 2 (EC27–EC49); Year 3 reviews it one sound a week", units: "EC1–EC49", src: ["sw-ss-ec", "sw-ss-uk", "sw-handbook-2026", "sw-checks-ec-2026"], conf: "official",
  },
  {
    id: "polysyllabic", name: "Polysyllabic Words",
    summary: "A separate strand with no numbered units. Starts at around week 2 of EC4 /oe/ in Year 1 ('Don't be tempted to start earlier', even for older starters) and runs to Year 6 and beyond: sound-level work (Lessons 11–12), then syllable-level work (13–14), and analysing spelling difficulties including schwas (15). Always Lessons 11–15, never Lesson 6 (DOSSIER §10.1).",
    knowledge: [
      "some words are made up of more than one syllable;", "the spelling of some common syllables, such as prefixes and suffixes;", "some polysyllabic words contain schwas.",
      "In the Polysyllabic Words Lessons we start by working at sound-level, then move to syllable-level work, and we also analyse spelling difficulties in Polysyllabic Words, including schwas. Polysyllabic words are presented in a logical sequence, from simple to complex.",
    ],
    years: "Year 1 to Year 6 and beyond", units: "PW1–PW9 (our staging; the public sequence has no numbered stages; the record sheet has five: 2-, 3-, 4-, 5-syllable words, common suffixes)", src: ["sw-ss-psw", "sw-ss-uk", "sw-handbook-2026", "sw-psw-intro-2024", "sw-record-sheet"], conf: "official",
  },
];

// =============================================================================================== Initial Code

export interface InitialCodeUnit {
  id: SwUnitId;
  unit: number;
  /** NEW CODE KNOWLEDGE, as our spelling→sound pairs */
  newCode: SpellingRef[];
  /** exact cell text of the UK scope and sequence */
  newCodeText: string;
  structureText: string;
  conceptText?: string;
  /** structures in play by the end of the unit (cumulative) */
  structures: WordStructure[];
  concepts: ConceptId[];
  /** words the sources place in this unit */
  examples: string[];
  examplesSrc: SourceId[];
  /** high-frequency words with untaught code introduced in this unit: manual Part 3 vocabulary table and revised p.100
   *  (DOSSIER §11.4), confirmed unit by unit by the "previously taught high-frequency words" lines of the official
   *  Egyptian Adventures stories (2026). The teacher "takes responsibility" for the untaught part; never sight words. */
  specialWords: string[];
  lessons: SwLessonId[];
  weeks: number;
  notes: string[];
  src: SourceId[];
  conf: Tier;
}

const ic = (u: Omit<InitialCodeUnit, "id" | "src" | "conf" | "weeks"> & { weeks?: number }): InitialCodeUnit => ({
  id: `IC${u.unit}`, weeks: 2, src: ["sw-ss-initial", "sw-ss-uk", "sw-record-sheet", "sw-ic-vocab", "sw-handbook-2026"], conf: "official", ...u,
});
const CVC_STRUCTS: WordStructure[] = ["VC", "CVC"];
const IC_CORE: SwLessonId[] = ["L1", "L2", "L3", "L4", "L4a"];

export const INITIAL_CODE_UNITS: InitialCodeUnit[] = [
  ic({
    unit: 1, newCode: [{ g: "a", p: "a" }, { g: "i", p: "i" }, { g: "m", p: "m" }, { g: "s", p: "s" }, { g: "t", p: "t" }],
    newCodeText: "a, i, m, s, t", structureText: "Segment, blend and manipulate sounds in CVC words", conceptText: "Sounds can be represented by spellings with one letter",
    structures: CVC_STRUCTS, concepts: [1],
    examples: ["it", "at", "sat", "sit", "mat", "am"], examplesSrc: ["sw-ic-vocab", "sw-checks-ic-2026", "sw-hfw-2023", "walker-word-building"],
    specialWords: [], lessons: IC_CORE,
    notes: [
      "The first word built is mat ('because … mat begins with a continuant'), then sat, then sit, 'by which time, you'll have introduced all five sound-spelling correspondences in Unit 1'. Only the word's own spellings are on the board, jumbled.",
      "Sound Swap (Lesson 3) starts around the end of week 1 or the start of week 2; Unit 1 swaps go 'from CVC to CVC to CVC to VC'.",
      "'To begin with, children are taught to segment, blend and manipulate sounds in two- and three-sound words, such as mat' (official parents' guide).",
    ],
  }),
  ic({
    unit: 2, newCode: [{ g: "n", p: "n" }, { g: "o", p: "o" }, { g: "p", p: "p" }], newCodeText: "n, o, p", structureText: "CVC",
    structures: CVC_STRUCTS, concepts: [1],
    examples: ["in", "on", "not", "an", "tin", "mat", "pot", "mop", "map"], examplesSrc: ["sw-hfw-2023", "sw-elg-faq"],
    specialWords: ["is", "a"], lessons: IC_CORE,
    notes: ["Sentence reading from Unit 2 in the resource book: 'Is the tin on a mat?' (yes/no), 'Pip sat in a pot.' (cut and stick)."],
  }),
  ic({
    unit: 3, newCode: [{ g: "b", p: "b" }, { g: "c", p: "k" }, { g: "g", p: "g" }, { g: "h", p: "h" }], newCodeText: "b, c, g, h", structureText: "CVC",
    structures: CVC_STRUCTS, concepts: [1], examples: ["can", "big", "him", "got", "bag", "tag", "sag", "cat", "bat", "bit", "pig", "pit"], examplesSrc: ["sw-hfw-2023", "sw-plan-r-2023"],
    specialWords: ["the", "I"], lessons: IC_CORE,
    notes: ["Progress Checks start after Unit 3 (none before)."],
  }),
  ic({
    unit: 4, newCode: [{ g: "d", p: "d" }, { g: "e", p: "e" }, { g: "f", p: "f" }, { g: "v", p: "v" }], newCodeText: "d, e, f, v", structureText: "CVC",
    structures: CVC_STRUCTS, concepts: [1],
    examples: ["had", "dad", "get", "if", "met", "set", "net", "vet", "van", "pet", "fed", "sad", "fig", "hen", "bed", "did", "fat", "fog"], examplesSrc: ["sw-hfw-2023", "sw-plan-r-2023", "freshford-yr"],
    specialWords: ["for", "of"], lessons: IC_CORE,
    notes: [
      "The scope and sequence and record sheet say 'd, e, f, v'; the parents' guide 'd, f, v, e' and the PSC guidance 'd, f, e, v'. The 2023 plan brings in e and d first (met, dig, dad), then v and f (vet, van, pet, fed).",
      "Any child who cannot independently segment and blend by Unit 4 is at risk of not passing the PSC (Sounds-Write).",
    ],
  }),
  ic({
    unit: 5, newCode: [{ g: "k", p: "k" }, { g: "l", p: "l" }, { g: "r", p: "r" }, { g: "u", p: "u" }], newCodeText: "k, l, r, u",
    structureText: "Segment, blend and manipulate sounds in CVC words", conceptText: "Sounds can be represented by spellings with one letter",
    structures: CVC_STRUCTS, concepts: [1],
    examples: ["but", "up", "mum", "rat", "kid", "log", "red", "kit", "lip", "run", "dug"], examplesSrc: ["sw-hfw-2023", "freshford-yr"],
    specialWords: ["are"], lessons: IC_CORE, notes: ["< k > is a 'new spelling of /k/' (after < c > in Unit 3). The manual introduces 'to' in Unit 9, not here (some schools put it in Unit 5); the 2026 Egyptian Adventures stories list 'to' as a help word up to Unit 8 and as taught from Unit 9."],
  }),
  ic({
    unit: 6, newCode: [{ g: "j", p: "j" }, { g: "w", p: "w" }, { g: "z", p: "z" }], newCodeText: "j, w, z", structureText: "CVC",
    structures: CVC_STRUCTS, concepts: [1], examples: ["jug", "wig", "zip"], examplesSrc: ["sw-parents-yr-2023"],
    specialWords: ["was"], lessons: IC_CORE,
    notes: ["Sounds~Write pronunciations (Freshford): w = 'wwoo' not 'wuh'."],
  }),
  ic({
    unit: 7,
    newCode: [
      { g: "x", p: "ks", note: "one spelling, two sounds: /k/ /s/ ('box')" }, { g: "y", p: "y" },
      { g: "ff", p: "f" }, { g: "ll", p: "l" }, { g: "ss", p: "s" }, { g: "zz", p: "z" },
    ],
    newCodeText: "x, y, < ff >, < ll >, < ss >, < zz >", structureText: "CVC", conceptText: "Some spellings are written with a double consonant.",
    structures: CVC_STRUCTS, concepts: [1, 2],
    examples: ["will", "off", "box", "yes", "huff", "hill", "miss", "buzz", "fell", "fuzz"], examplesSrc: ["sw-hfw-2023", "sw-parents-yr-2023", "sw-plan-r-2023"],
    specialWords: ["all"], lessons: ["L5", "L1", "L2", "L3", "L4", "L4a"],
    notes: [
      "Word building with Lesson 5 and Lesson 1. By the end of Unit 7 all single letters except q are taught, plus < ff >, < ll >, < ss >, < zz > ('two letters, one sound'; they are not 'blends').",
      "< x > spells two sounds, /k/ /s/, yet the unit is labelled CVC. How an x word is laid out in Lesson 1 is not public; we count x as one C (see structureOf).", // TODO(verify): DOSSIER §16.9 q6
      "y = 'yyee' not 'yuh' (Freshford).",
    ],
  }),
  ic({
    unit: 8, newCode: [], newCodeText: "No new code knowledge", structureText: "VCC and CVCC / 2 consonants in final position / 3- & 4-sound words",
    structures: ["VC", "CVC", "VCC", "CVCC"], concepts: [1, 2],
    examples: ["and", "went", "it's", "just", "help", "lift", "limp", "left", "nest", "soft", "wind", "jump", "tusk"], examplesSrc: ["sw-hfw-2023", "sw-psc-2024", "sw-plan-r-2023"],
    specialWords: ["come", "some"], lessons: IC_CORE,
    notes: [
      "From Unit 8, Sound Swap also uses pseudo (nonsense) words (official 2023 plan: in the review part from week 2 of Unit 9).",
      "Units 8–10 add no new code: 'The key aspect to focus on for Units 8 to 11 is mastery of the skills of segmenting and blending of adjacent consonants.'",
      "'some' is not in the manual's table; the official HFW documents say 'the', 'a', 'is' and 'some' need introducing before they are taught, and the founder lists it after 'come'.",
      "< n > before /k/ (ink, bank, pink, zinc) sits in the official Unit 8 lists, but Sounds~Write treats that < n > as /ng/, taught in Unit 11.", // TODO(verify): DOSSIER §16.9 q7
    ],
  }),
  ic({
    unit: 9, newCode: [], newCodeText: "", structureText: "CCVC / 2 consonants in initial position",
    structures: ["VC", "CVC", "VCC", "CVCC", "CCVC"], concepts: [1, 2],
    examples: ["from", "frog", "slip", "smell", "clap", "drop", "stop", "spot", "trap", "plan", "plug", "twin", "slam", "plum", "clip"], examplesSrc: ["sw-hfw-2023", "sw-impl-2020", "sw-plan-r-2023", "sw-plan-y1-2023"],
    specialWords: ["to"], lessons: IC_CORE,
    notes: [
      "Week 1: adjacent consonants that are continuants (frog, slip, smell). Week 2: continuant/non-continuant pairs (clap, drop, stop).",
      "Manual p.99: 'High-frequency word to introduce: to.'",
      "< sh > is introduced with Lesson 5 in CVC words (fish, mash, shop) in week 2 of Unit 9; < ch > follows during Unit 10.",
    ],
  }),
  ic({
    unit: 10, newCode: [], newCodeText: "No new code knowledge",
    structureText: "CCVCC, CVCCC, and CCCVC / 3 adjacent consonants / 5-7 sound words",
    structures: ["VC", "CVC", "VCC", "CVCC", "CCVC", "CCVCC", "CVCCC", "CCCVC"], concepts: [1, 2],
    examples: ["swift", "scrap", "slump", "swept", "stink", "plank", "grand", "twist", "print", "spend", "trust", "stump"], examplesSrc: ["sw-psc-2024", "sw-plan-y1-2023"], specialWords: [], lessons: IC_CORE,
    notes: [
      "The Initial Code scope and sequence says '5-sound words'; the UK scope and sequence says '5-7 sound words'; the 2024 timeline shows only ccvcc and cvccc; the parents' course adds 'sprigs' (CCCVCC). We keep CCVCC, CVCCC and CCCVC.", // TODO(verify): DOSSIER §16.9 q5
      "Target: 'At around the Easter break students should be reading and spelling words like lift (CVCC), frog (CCVC), swift (CCVCC) and scrap (CCCVC), until their skills are perfect or near perfect.'",
      "Manual p.99: 'There are no high-frequency words to introduce in this Unit.'",
    ],
  }),
  ic({
    unit: 11,
    newCode: [
      { g: "sh", p: "sh" }, { g: "ch", p: "ch" }, { g: "th", p: "th", note: "unvoiced" }, { g: "th", p: "dh", note: "voiced; Sounds~Write writes both as /th/" },
      // < n > for /ng/: the 2020 plan lists '< ng > & < n >'; the 2025 PSC analysis says the < n > in clang/bunk 'represents the sound /ng/'.
      // '/ng/ should only be taught as one sound if it accurately represents the accents of the children' (DOSSIER §7.3.3).
      { g: "ck", p: "k" }, { g: "ng", p: "ng" }, { g: "n", p: "ng", note: "< n > for /ng/ (think, bank); listed as '< ng > & < n >'" },
      { g: "wh", p: "w" }, { g: "q", p: "k" }, { g: "u", p: "w", note: "< q > and < u > represent the sounds /k/ and /w/" },
      { g: "ve", p: "v" }, { g: "tch", p: "ch" },
    ],
    newCodeText: "sh, ch, th, ck, ng, wh, <q>, <u>, ve, and tch", structureText: "VC, CVC, CVCC, CCVC, CCVCC, CVCCC and CCCVC",
    conceptText: "Some spellings are written with two or three different letters / < q > and < u > represent the sounds /k/ and /w/",
    structures: ["VC", "CVC", "VCC", "CVCC", "CCVC", "CCVCC", "CVCCC", "CCCVC"], concepts: [2],
    examples: ["that", "with", "this", "then", "them", "when", "back", "fish", "mash", "ship", "shop", "shed", "shell", "flush", "brush", "check", "quit", "quiz", "quack", "quick", "squid", "sing"],
    examplesSrc: ["sw-hfw-2023", "sw-impl-2020", "sw-psc-2024", "sw-plan-r-2023", "sw-plan-y1-2023"],
    specialWords: ["there", "their", "these", "what", "where", "who", "she"], lessons: ["L5", "L1", "L2", "L3", "L4", "L4a"],
    notes: [
      "No single current official order. 2023 Reception plan: sh (from IC9 week 2), ch (from IC10 week 2), th, ng, ck, wh, tch, then q and u (no ve); 10.2024 Year 1 plan: sh, ch, tch, th, ck, wh, ng, ve, q u; the scope and sequence lists sh, ch, th, ck, ng, wh, q u, ve, tch. Start at CVC, then increase word complexity.",
      "< ve > is taught here from September 2024 through 'have', 'live', 'give', 'twelve': 'This is /v/. It's two letters but it's just one sound.' The 2026 checks dictate 'have' as an IC Unit 11 word.",
      "Manual p.100: 'after < th >: there their these. after < wh >: what where who.' The Part 3 vocabulary page omits 'their'. 'she' is not in the manual's table, but the 2024 Bridging Unit stories list it among 'previously taught high-frequency words' (with is, a, the, I, for, of, was, all, come, some, to); 'we', 'me', 'you', 'he' are still help words there.",
      "'When introducing < q > and < u >, care will need to be taken to ensure that students have a clear understanding that these are new spellings of /k/ and /w/ and that they represent separate sounds.'",
      "Introduce < tch > with Lesson 5 (three letters, one sound) before the Bridging Unit's /ch/ spellings.",
      "Freshford: qu used to be taught as 'cooo'; 'new this year: q = k + u = w', matching Sounds~Write.",
    ],
  }),
];

// =============================================================================================== Bridging Unit

export interface BridgingUnit {
  id: "BR";
  conceptText: string;
  concept: ConceptId;
  /** current content in teaching order: /k/, /ch/, /w/, /v/ (IC timeline 07.2024, linked from the 2026 Handbook; 10.2024
   *  Year 1 guidance). `words`: the official example lists (2023 Reception planning; /v/ from the 10.2024 guidance). */
  sounds: { p: PhonemeId; spellings: string[]; optional?: string[]; words: Record<string, string[]>; src: SourceId[]; conf: Tier }[];
  /** earlier official versions of the unit's content; not current, not used by gpcsOfUnit */
  earlier: { p: PhonemeId; spellings: string[]; words?: Record<string, string[]>; note: string; src: SourceId[] }[];
  /** extra spellings some schools add; not in the official sequence */
  schoolAdditions: { p: PhonemeId; spellings: string[]; src: SourceId[] }[];
  lessons: SwLessonId[];
  weeksPerSound: number;
  notes: string[];
  src: SourceId[];
  conf: Tier;
}

export const BRIDGING_UNIT: BridgingUnit = {
  id: "BR", conceptText: "The same sound can be spelled in more than one way", concept: 3,
  sounds: [
    {
      p: "k", spellings: ["c", "k", "ck"], src: ["sw-ss-initial", "sw-ic-timeline-2024", "sw-y1-new-2024", "sw-plan-r-2023"], conf: "official",
      words: {
        c: ["can", "cap", "camp", "clump", "cost", "crust", "scrap"], k: ["kit", "kilt", "king", "kelp", "milk", "skill", "skip", "skimp", "skull"],
        ck: ["pack", "neck", "lick", "flick", "flock", "sock", "duck", "black", "brick", "truck"],
      },
    },
    {
      p: "ch", spellings: ["ch", "tch"], src: ["sw-ss-initial", "sw-ic-timeline-2024", "sw-y1-new-2024", "sw-plan-r-2023"], conf: "official",
      words: { ch: ["champ", "chant", "chat", "check", "chop", "rich", "such", "chug"], tch: ["patch", "fetch", "ditch", "hutch", "pitch", "splotch", "thatch", "witch"] },
    },
    {
      p: "w", spellings: ["w", "wh"], src: ["sw-ss-initial", "sw-ic-timeline-2024", "sw-y1-new-2024", "sw-plan-r-2023"], conf: "official",
      words: { w: ["wax", "web", "well", "wept", "wig", "will", "wilt", "with"], wh: ["wham", "whack", "whiff", "whelk", "when", "whet", "which", "whip", "whit", "whomp", "whisk"] },
    },
    {
      p: "v", spellings: ["v", "ve"], src: ["sw-ic-timeline-2024", "sw-y1-new-2024"], conf: "official",
      words: { v: ["van", "vest", "vet"], ve: ["live", "give", "have", "twelve", "solve"] },
    },
  ],
  earlier: [
    {
      p: "l", spellings: ["l", "ll", "le"], src: ["sw-plan-r-2023", "sw-bridging-sheet"],
      words: {
        l: ["lad", "lamp", "leg", "lent", "let", "lift", "list", "loft", "lug"], ll: ["shall", "shell", "tell", "chill", "pill", "thrill", "krill", "dull", "lull"],
        le: ["rattle", "pebble", "middle", "topple", "muffle", "raffle", "puzzle", "mumble", "cackle", "waggle", "stumble", "tremble", "thimble"],
      },
      note: "06.2023 Reception plan: 'The sound /l/ spelled as < l > and < ll > is also taught' (order /k/, /w/, /ch/, /l/); the older Bridging Lesson sheet and timeline add < le >. Dropped by 07.2024, when /v/ came in; no source says why (DOSSIER §16.10).",
    },
    { p: "w", spellings: ["u"], src: ["sw-impl-2020"], note: "The 2020 guidance makes < u > an optional third /w/ spelling; no later source repeats it (DOSSIER §16.10)." },
  ],
  schoolAdditions: [
    { p: "l", spellings: ["le"], src: ["stbedes", "stanleyroad", "stbernadettes"] },
  ],
  lessons: ["L6", "L7", "L8", "L4"], weeksPerSound: 1,
  notes: [
    "Taught in the summer term of Reception, after Unit 11, 'alongside review, practice and consolidation of the Initial Code units, with plenty of opportunities to read and write in connected text'.",
    "'It should be introduced using Lesson 6, and Lessons 7 and 8 can also be used along with Lesson 4.' 'The new content for them to be introduced to at this point is the format of Lesson 6.' The spellings were all met informally in Unit 11.",
    "Versions: the scope and sequence files and the 06.2023 timeline list /k/, /ch/, /w/ only; the 06.2023 Reception plan adds /l/; the 07.2024 IC timeline linked from the 2026 Handbook and the 10.2024 Year 1 guidance give /k/, /ch/, /w/, /v/ (< v >, < ve >). We follow the newest (DOSSIER §7.3.4, §8).",
    "About a week per sound (2020); the 10.2024 Year 1 catch-up plan fits all four sounds into two weeks. Before Lesson 6 on /ch/, introduce < tch > with Lesson 5 (2020).",
    "The split-spelling Part 2 of Lesson 6 never applies here. Progress check 10 is used halfway through the unit, check 11 after it.",
    "The bridging-level Lesson 6 script, its summing-up questions and word lists for Lessons 7 and 8 are not public.", // TODO(verify): DOSSIER §16.10
  ],
  src: ["sw-ss-initial", "sw-ic-timeline-2024", "sw-y1-new-2024", "sw-plan-r-2023", "sw-handbook-2026", "sw-impl-2020"], conf: "official",
};

// =============================================================================================== Extended Code

export interface ExtendedCodeUnit {
  id: SwUnitId;
  unit: number;
  kind: "sound" | "spelling";
  /** exact row text of the UK scope and sequence */
  title: string;
  sound?: PhonemeId;
  spelling?: string;
  /** "first spellings" / "more spellings"; absent when the sound has a single unit */
  visit?: "first" | "more";
  firstUnit?: SwUnitId;
  /** sound unit: every spelling of the sound in scope by the end of the unit (cumulative).
   *  spelling unit: each sound the spelling represents. Source: the manual's record sheet and word-list headings
   *  (official, pre-2024; DOSSIER §9.2), with split spellings stored as "a-e" and mapped by applySplitPolicy, plus the
   *  few spellings the 2026 progress checks, their FAQ or the 06.2025 HFW chart add (noted per unit). */
  gpcs: SpellingRef[];
  gpcsSrc: SourceId[];
  gpcsConf: Tier;
  /** spellings other sources put here (official HFW charts, single schools); not in the consensus list */
  otherSpellings?: { g: string; p: PhonemeId; why: string; src: SourceId[] }[];
  /** official PSC guidance (England): teach these alongside the unit in Year 1 */
  pscAdditions?: { g: string; p: PhonemeId; example: string }[];
  examples: string[];
  examplesSrc: SourceId[];
  /** high-frequency words the official HFW document files under this sound */
  hfw?: string[];
  /** units this unit contrasts or reuses (besides everything before it, which the sequence always assumes) */
  needs: SwUnitId[];
  lessons: SwLessonId[];
  /** official aim: EC1–26 in Year 1, EC27–49 in Year 2 */
  year: 1 | 2;
  /** sound units: about two weeks; the Handbook lets 7, 8, 23, 25 (Year 1) and 29, 30, 35, 44, 46 (Year 2) take one.
   *  Spelling units have no weeks of their own (Lesson 10 in week 2 of the sound unit before them). */
  weeks?: 1 | 2;
  /** term in the official planning guidance (Y1: autumn 1–9, spring 10–18, summer 19–26; Y2: 27–34, 35–42, 43–49) */
  term: "autumn" | "spring" | "summer";
  notes?: string[];
}

/** official per-unit spelling lists (pre-2024 manual; the 2024 guidance only removes the split spellings) */
const RECORD: SourceId[] = ["sw-record-sheet", "sw-ec-wordlists", "sw-ss-ec"];
/** Handbook 2026: sound units that may take one week */
const ONE_WEEK = new Set([7, 8, 23, 25, 29, 30, 35, 44, 46]);
/** 2023 planning: current unit taught with Lessons 6, 7, 9; reviewed later with 3, 4, 8, 9, 10, 11–15, quizzing; dictation 4a. */
const SOUND_LESSONS: SwLessonId[] = ["L6", "L7", "L9", "L8", "L4", "L4a", "L3"];
/** 2023 planning: spelling units are taught with Lesson 10 in week 2 of the preceding sound unit, then reviewed with it. */
const SPELLING_LESSONS: SwLessonId[] = ["L10", "L4", "L4a"];
const termOf = (unit: number): ExtendedCodeUnit["term"] =>
  unit <= 9 || (unit >= 27 && unit <= 34) ? "autumn" : unit <= 18 || (unit >= 35 && unit <= 42) ? "spring" : "summer";

type EcOpts = Partial<Pick<ExtendedCodeUnit, "otherSpellings" | "pscAdditions" | "hfw" | "needs" | "notes" | "firstUnit">> & {
  ex?: string[]; exSrc?: SourceId[]; src?: SourceId[]; conf?: Tier;
  /** spelling units: further spelling→sound pairs the unit covers (EC39 covers < g > and < gg >) */
  also?: SpellingRef[];
};

function soundUnit(unit: number, p: PhonemeId, label: string, visit: "first" | "more" | undefined, spellings: string, o: EcOpts = {}): ExtendedCodeUnit {
  return {
    id: `EC${unit}`, unit, kind: "sound", title: `Sound ${label}${visit ? ` ${visit} spellings` : ""}`, sound: p, visit, firstUnit: o.firstUnit,
    gpcs: spellings.split(" ").map((g) => ({ g, p })), gpcsSrc: [...new Set([...RECORD, ...(o.src ?? [])])], gpcsConf: o.conf ?? "official",
    otherSpellings: o.otherSpellings, pscAdditions: o.pscAdditions, examples: o.ex ?? [], examplesSrc: o.exSrc ?? [], hfw: o.hfw,
    needs: o.needs ?? [], lessons: SOUND_LESSONS, year: unit <= 26 ? 1 : 2, term: termOf(unit), weeks: ONE_WEEK.has(unit) ? 1 : 2, notes: o.notes,
  };
}
function spellingUnit(unit: number, g: string, sounds: [PhonemeId, string][], o: EcOpts = {}): ExtendedCodeUnit {
  return {
    id: `EC${unit}`, unit, kind: "spelling", title: `Spelling < ${g} >`, spelling: g,
    gpcs: [...sounds.map(([p, ex]) => ({ g, p, note: `as in '${ex}'` })), ...(o.also ?? [])], gpcsSrc: [...new Set([...RECORD, ...(o.src ?? [])])], gpcsConf: o.conf ?? "official",
    otherSpellings: o.otherSpellings, examples: o.ex ?? sounds.map(([, ex]) => ex), examplesSrc: o.exSrc ?? RECORD, hfw: o.hfw,
    needs: o.needs ?? [], lessons: SPELLING_LESSONS, year: unit <= 26 ? 1 : 2, term: termOf(unit), notes: o.notes,
  };
}
const moon = "/oo/ (as in 'moon')";
const book = "/oo/ (as in 'book')";

export const EXTENDED_CODE_UNITS: ExtendedCodeUnit[] = [
  soundUnit(1, "ae", "/ae/", "first", "ai ay a-e ea", {
    src: ["sw-split-2024", "sw-pedagogy", "sw-plan-y1-2023", "sw-psc-2024"],
    ex: ["rain", "say", "great", "make", "tail", "day", "break", "gate", "pail", "play", "game", "pain", "way", "take", "train", "tray", "steak", "drain", "spray", "came", "sprain", "clay", "whale", "bait"],
    exSrc: ["sw-plan-y1-2023", "sw-psc-2024", "sw-split-2024", "sw-checks-ec-2026"],
    hfw: ["they", "came", "day", "made", "make", "away", "play", "take", "way", "may", "say", "great"],
    otherSpellings: [
      { g: "a", p: "ae", why: "Replaces a-e under the 2024 guidance (cave = c.a.ve); Our Pedagogy: first spellings '< a >, < ay >, < ai > and < ea >'", src: ["sw-split-2024", "sw-pedagogy"] },
      { g: "ey", p: "ae", why: "'they': 'not a common spelling for /ae/'; teach it as it comes up and add it to the /ae/ poster (formally Unit 27)", src: ["sw-hfw-2025", "sw-tangential-2024"] },
      { g: "eigh", p: "ae", why: "taught in Unit 27; may be taught tangentially earlier", src: ["sw-tangential-2024"] },
    ],
    notes: [
      "2023 planning: Lesson 6 uses 'one word for each spelling of /ae/: rain, say, great, make'.",
      "Since September 2024: 'The list of spellings taught in Unit 1 will now be < ay >, < ai >, < a > and < ea >', with < te >, < me >, < ke > and < le > (gate, game, take, tale) as consonant + e spellings, 'introduced gradually'; < ve > (cave) was taught in IC11. See SPLIT_SPELLING. Freshford still teaches a-e.",
      "2026 progress-check words for Unit 1 (reading and dictation): take steak play rain shake came tail way train day cake sprain make stray may whale same great tray game break flame spray bake.",
      "Expected lag: end of Unit 1 all can name the sound and ~90% can do Lessons 6 and 7; end of Unit 2 over 80% read the four spellings in connected text; end of Unit 7 spelling transfer begins.",
    ],
  }),
  soundUnit(2, "ee", "/ee/", "first", "ee ea e y", {
    src: ["sw-hfw-2025", "walker-spelling-errors", "freshford-y1y2"],
    ex: ["see", "she", "bead", "green", "teeth", "eat", "mummy", "daddy", "me", "feet", "tree", "seat", "meal", "keep", "dream"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "freshford-y1y2"],
    hfw: ["he", "she", "we", "be", "me", "see", "eat", "tree", "been", "sea", "need", "three", "keep", "sleep", "feet", "queen", "each", "green", "tea", "please"],
    pscAdditions: [{ g: "ie", p: "ee", example: "chief" }, { g: "e-e", p: "ee", example: "scheme" }],
    otherSpellings: [
      { g: "ie", p: "ee", why: "PSC guidance: include < ie > (chief) here; the same table also puts it in Unit 29", src: ["sw-psc-2024"] },
      { g: "e-e", p: "ee", why: "2023 PSC addition (scheme); post-2024 'complete' is coded with < e >", src: ["sw-psc-2023", "sw-statutory-2025"] },
      { g: "ey", p: "ee", why: "06.2025 HFW chart lists < ey > (key) for Unit 2; formally Unit 29", src: ["sw-hfw-2025"] },
      { g: "eo", p: "ee", why: "'people': 'should be taught tangentially when it arises'", src: ["sw-hfw-2025"] },
    ],
    notes: ["The 06.2025 HFW chart lists < e > < ea > < ee > < y > < ey > < eo > for Unit 2. Grange 2026–27 (school) teaches < e, ea, ee, ie, ey >, without < y >."],
  }),
  spellingUnit(3, "ea", [["ee", "team"], ["ae", "great"]], {
    needs: ["EC1", "EC2"], ex: ["team", "great", "tea", "break"], exSrc: ["sw-ec-wordlists", "freshford-yr"],
    notes: ["Taught with Lesson 10 at the start of week 2 of Unit 2 (spelling units run alongside sound units).", "Word lists: 'After Unit 7 introduce and discuss: bread head thread' (< ea > as /e/)."],
  }),
  soundUnit(4, "oe", "/oe/", "first", "o oa o-e ow oe", {
    src: ["sw-split-2024", "sw-plan-y1-2023", "sw-hfw-2025"],
    ex: ["cold", "float", "Joe", "snow", "pole", "so", "boat", "bowl", "toe", "bone", "cone", "blow", "coat", "go", "grow", "home", "hope"], exSrc: ["sw-plan-y1-2023", "sw-psc-2024", "sw-checks-ec-2026", "sw-ec-xmas-2024"],
    hfw: ["so", "go", "no", "don't", "oh", "old", "going", "home", "only", "told", "clothes", "boat", "window", "snow", "most", "cold", "grow"],
    pscAdditions: [{ g: "ou", p: "oe", example: "mould" }, { g: "ph", p: "f", example: "phone" }],
    otherSpellings: [
      { g: "ou", p: "oe", why: "PSC guidance: include < ou > (mould) here; formally Unit 32", src: ["sw-psc-2024"] },
      { g: "oh", p: "oe", why: "'oh' 'should be taught tangentially as a spelling of /oe/ when it arises'", src: ["sw-hfw-2025"] },
      { g: "kn", p: "n", why: "tangential with Unit 4 (know): 'This is two letters, but it's… one sound'", src: ["sw-tangential-2024"] },
      { g: "wr", p: "r", why: "tangential with Unit 4 (wrote)", src: ["sw-tangential-2024"] },
    ],
    notes: [
      "Since September 2024 the unit's spellings are < o >, < oa >, < ow >, < oe >. Consonant + e words appear from here in official post-2024 material: < de > (a tile on the members' Unit 4 Lesson 6 board; 'fades'), < ne > ('bone', 'lane'), < pe > ('h o pe'), < ze > ('froze'), < se > ('close'), < be > ('snowglobe'). See SPLIT_SPELLING.",
      "2023 planning: 'one word for each spelling of /oe/: cold, float, Joe, snow, pole'.",
      "Polysyllabic words start in week 2 of Unit 4 (Lessons 11 and 12, Initial Code Set 1).",
      "Teach < ph > for /f/ tangentially here ('phone', later 'graph'), with < kn > and < wr > (PSC and tangential-teaching guidance).",
    ],
  }),
  spellingUnit(5, "o", [["oe", "no"], ["o", "hot"]], { needs: ["EC4", "IC2"], notes: ["Word lists: 'After Unit 11 discuss: do to'."] }),
  soundUnit(6, "er", "/er/", "first", "er ir ur or", {
    src: ["sw-membership-2026"],
    ex: ["fern", "girl", "turn", "bird", "her", "hurt", "worm", "church", "shirt", "curl", "work"], exSrc: ["sw-psc-2024", "sw-checks-ec-2026"],
    hfw: ["her", "were", "over", "after", "never", "first", "work", "different", "girl", "under", "better", "ever", "birds", "river"],
    otherSpellings: [
      { g: "ere", p: "er", why: "06.2025 HFW chart files 'were' under Unit 6", src: ["sw-hfw-2025", "sw-hfw-2023"] },
      // TODO(verify): DOSSIER §16.11 q4. The checks read 'learn' as a Unit 6 word and the 12.2025 analysis maps < ear > to
      // Unit 6, but the record sheet has it only in Unit 34 and a 2026 official Unit 6 board shows er, ir, ur, or only.
      { g: "ear", p: "er", why: "'learn' is a Unit 6 word in both editions of the progress checks; record sheet: Unit 34", src: ["sw-checks-ec-2026", "sw-statutory-2025", "grange-2026"] },
    ],
    notes: ["An official 2026 photo of an 'EC Unit 6 /er/' board sorts under < er > fern, kerb, jerk; < ir > dirt, girl, whirl, bird; < ur > church, burn; < or > work, worm, doctor.", "Tangential: < g > for /j/ in 'germ'."],
  }),
  soundUnit(7, "e", "/e/", undefined, "e ea ai", {
    src: ["sw-hfw-2025"], needs: ["EC3"],
    ex: ["hen", "head", "red", "bread", "said", "thread", "spread", "chest", "shed", "deaf"], exSrc: ["sw-checks-ec-2026", "sw-blog-cumulative", "sw-hfw-2023"],
    hfw: ["said", "again", "head", "many", "any", "friends"],
    otherSpellings: [
      { g: "a", p: "e", why: "HFW chart (many, any)", src: ["sw-hfw-2025"] },
      { g: "ie", p: "e", why: "HFW chart (friends); the 2025 /e/ poster uses 'friend'; Grange 2026–27 teaches ie and ai as 'unusual spellings'", src: ["sw-hfw-2025", "sw-posters-2025", "grange-2026"] },
      { g: "ei", p: "e", why: "'leisure': 'an unusual spelling of /e/ and may be added to Unit 7 /e/ as one of More Spellings'", src: ["sw-statutory-2025"] },
    ],
    notes: ["May take one week (Handbook). Scaffold: a child at CVC level builds 'red' rather than 'bread'."],
  }),
  soundUnit(8, "ou", "/ow/", undefined, "ou ow", {
    src: ["sw-handbook-2026"], ex: ["out", "cow", "round", "crowd", "how", "clown", "cloud", "loud", "brown", "mouth", "ground", "town", "shout"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "freshford-y1y2"],
    hfw: ["out", "down", "now", "about", "house", "how", "our", "round", "shouted", "mouse", "around"],
    notes: ["Sounds~Write writes this sound /ow/; our PhonemeId is \"ou\".", "'/oy/ can be taught after /ow/. As there are only two spellings of each of these two sounds in First spellings, each unit can be taught in a single week' (Handbook)."],
  }),
  spellingUnit(9, "ow", [["ou", "cow"], ["oe", "snow"]], { needs: ["EC4", "EC8"] }),
  soundUnit(10, "oo", moon, "first", "oo ew ue u-e o", {
    src: ["sw-checks-ec-2026"], ex: ["room", "blue", "brute", "you", "moon", "rude", "flew", "clue", "rule", "chew", "flute", "true", "spoon", "June", "food", "do", "to"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024"],
    hfw: ["to", "you", "do", "into", "too", "school", "who", "food", "soon", "room"],
    pscAdditions: [{ g: "ou", p: "oo", example: "you" }],
    otherSpellings: [
      { g: "ou", p: "oo", why: "PSC and tangential-teaching guidance: include < ou > (you) here; formally Unit 36", src: ["sw-psc-2024", "sw-tangential-2024"] },
      // TODO(verify): DOSSIER §16.11 q1. 'shoe' is dictated as a Unit 10 word in both editions of the checks; < oe > for
      // m/oo/n is not on the record sheet, and the post-2024 Unit 10 list is not public.
      { g: "oe", p: "oo", why: "'shoe' is a Unit 10 dictation word in both editions of the progress checks", src: ["sw-checks-ec-2026", "sw-checks-ec-2024"] },
      { g: "ui", p: "oo", why: "the 12.2025 analysis maps 'fruit' to Unit 10; the record sheet and the checks put < ui > in Unit 36", src: ["sw-statutory-2025"] },
    ],
    notes: ["Tangential with Unit 10: < ch > for /k/ in 'school', < tw > for /t/ in 'two'. The 2024 PSC analysis puts < u-e > (clune) in 'Unit 10 or Unit 21'."],
  }),
  soundUnit(11, "ie", "/ie/", undefined, "i igh y ie i-e", {
    src: ["sw-hfw-2025", "sw-statutory-2025"], ex: ["mind", "fine", "pie", "high", "night", "cry", "five", "tie", "smile", "wild", "bright", "my", "sky", "side", "light", "bite", "kind", "nine"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024"],
    hfw: ["I", "my", "like", "by", "time", "find", "right", "night", "why", "cried", "inside", "white", "fly"],
    otherSpellings: [
      { g: "eye", p: "ie", why: "06.2025 HFW chart lists < i > < ie > < y > < igh > < eye > for Unit 11 (eyes)", src: ["sw-hfw-2025"] },
      { g: "eigh", p: "ie", why: "'height': 'can be taught tangentially or formally once it arises'", src: ["sw-statutory-2025", "sw-tangential-2024"] },
    ],
    notes: ["Post-2024 coding: 'decide', 'describe', 'arrive' use 'the spelling < i > of the sound /ie/'."],
  }),
  soundUnit(12, "uu", book, undefined, "oo u oul", {
    src: ["sw-plan-y1-2023"],
    ex: ["hook", "put", "should", "rook", "full", "could", "cook", "bull", "would", "shook", "bush", "wood", "pull", "book", "push", "foot"], exSrc: ["sw-plan-y1-2023", "sw-psc-2024", "sw-checks-ec-2026"],
    hfw: ["looked", "look", "put", "could", "good", "would", "took", "book", "pulled"],
    notes: ["Sounds~Write writes both oo sounds /oo/ and tells them apart by an example word; our ids are \"oo\" (moon) and \"uu\" (book).", "'In some regions the < oo > in book represents the same sound as the < oo > in room … All regional pronunciations are acceptable' (PSC guidance)."],
  }),
  spellingUnit(13, "oo", [["oo", "moon"], ["uu", "book"]], { needs: ["EC10", "EC12"] }),
  soundUnit(14, "u", "/u/", undefined, "u o ou", {
    src: ["sw-hfw-2025"], ex: ["some", "come", "mother", "touch", "month", "son", "young", "love", "done", "front", "shove"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    hfw: ["some", "come", "other", "something", "suddenly", "another", "jumped", "mother", "coming"],
    notes: ["Tangential with Unit 14: < oo > for /u/ (blood, flood) and < gh > for /f/ (rough, tough). The manual's worksheet prints 'l o ve', 'c o me', 's o me' with < ve > and < me > as one unit."],
  }),
  spellingUnit(15, "ou", [["ou", "loud"], ["u", "double"], ["oo", "soup"]], { needs: ["EC8", "EC14", "EC10"] }),
  soundUnit(16, "s", "/s/", undefined, "s ss st c ce se sc", {
    src: ["sw-checks-ec-2026"], ex: ["sit", "miss", "cell", "house", "mouse", "fence", "face", "ice", "nice", "space", "press", "listen"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-ec-wordlists"],
    notes: [
      "Record sheet: s sc se ss c ce; the word lists add < st > (bristle, listen, thistle).",
      "< ce > is first placed here (its formal unit; no earlier official use found). < se > for /s/ appears earlier in post-2024 texts ('close' in an EC4 story).",
      "PSC guidance: leave < sc > until after the PSC (s + c is a common consonant pair); teach < c > for /s/ ('cell') tangentially earlier.",
    ],
  }),
  spellingUnit(17, "s", [["s", "bricks"], ["z", "his"]], { needs: ["EC16"], notes: ["< s > as /z/ is also taught tangentially for the PSC ('hens'); the checks let some plurals with < s > = /z/ break their lag because it 'will have come up tangentially quite early on'."] }),
  soundUnit(18, "l", "/l/", undefined, "l ll le al el il ol", {
    src: ["sw-handbook-2026", "sw-checks-faq-2026"], ex: ["little", "pencil", "medal", "table", "camel", "apple", "hole", "pedal", "model", "travel"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    notes: [
      "One of the units where new spellings need polysyllabic words: 'in Unit 18 polysyllabic words are taught with < al >, < el >, < il > and < ol >' (Handbook; checks FAQ).",
      "Record sheet: l le ll el al il; the word lists add < ol >. St Bede's lists Unit 19 as /l/ again; every other source has /or/ first spellings.",
    ],
  }),
  soundUnit(19, "or", "/or/", "first", "or aw au a ar al oor", {
    src: ["sw-checks-ec-2026", "sw-hfw-2025"], ex: ["born", "launch", "raw", "saw", "water", "small", "warm", "door", "walk", "claw", "sauce", "talk", "poor", "floor"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-hfw-2023"],
    hfw: ["for", "all", "your", "called", "saw", "water", "or", "door", "small", "because", "morning", "horse"],
    otherSpellings: [
      { g: "our", p: "or", why: "'your', 'four': formally Unit 43; 'teach it tangentially whenever it appears'", src: ["sw-hfw-2025", "sw-tangential-2024"] },
      { g: "ore", p: "or", why: "Stanley Road teaches or/aw/au/ore here; officially Unit 43", src: ["stanleyroad"] },
    ],
    notes: [
      "< oor > (door, poor, floor) is added here: the 06.2025 HFW chart lists it for Unit 19 and the 2026 checks read 'door', 'poor' and dictate 'floor' as Unit 19 words. The pre-2024 record sheet (or aw a au ar) and word lists (+ al) do not have it.",
      "Walker codes 'ball', 'tall' as < a > + < ll > but 'chalk', 'talk' with < al >; the manual's Unit 19 worksheet does the same.",
      "2023 Year 2 planning reviews Unit 19 with Au|gust, au|thor, wa|ter and autumn, crawling, taller, because.",
    ],
  }),
  soundUnit(20, "air", "/air/", undefined, "air are ear ere eir", {
    src: ["sw-checks-ec-2026"], ex: ["air", "flair", "their", "there", "pair", "pear", "hair", "heir", "chair", "wear", "share", "bear", "where", "square", "haircut", "staircase"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-plan-y2-2023"],
    hfw: ["there", "their", "where", "bear", "air"],
    otherSpellings: [
      { g: "ayer", p: "air", why: "record sheet, bracketed (prayer); 'not very common spellings of the sound /air/. You can teach them tangentially'", src: ["sw-record-sheet", "sw-tangential-2024"] },
      { g: "ayor", p: "air", why: "record sheet, bracketed (mayor); tangential", src: ["sw-record-sheet", "sw-tangential-2024"] },
    ],
    notes: ["PSC guidance: consider moving Units 20 /air/ and 24 /ar/ earlier in Year 1."],
  }),
  soundUnit(21, "ue", "/ue/", undefined, "ue ew u u-e eu", {
    src: ["sw-checks-ec-2026"], ex: ["stew", "unit", "cue", "new", "use", "few", "news", "fuel", "tune", "due", "cube", "dune", "duke", "cute", "tube", "feud"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-plan-y2-2023", "sw-ec-wordlists"],
    notes: [
      "Record sheet: ue u-e u ew eu; the word lists (ue ew u u-e) include 'feud'.",
      "Sounds~Write keeps /ue/ as one sound, a deliberate 'fiction' (lexicon), though < ue > and < u > can be /y/ /oo/: < u > is 'treated as one spelling for simplicity and to prevent students spelling it as < y > < oo >'. Stanley Road (school) teaches it as y + oo.",
    ],
  }),
  spellingUnit(22, "ew", [["oo", "blew"], ["ue", "new"]], { needs: ["EC10", "EC21"] }),
  soundUnit(23, "oy", "/oy/", undefined, "oi oy", {
    src: ["sw-handbook-2026"], ex: ["coin", "boy", "joy", "soil", "toy", "choice", "voice", "point", "join", "boil"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024"],
    notes: ["May take one week; can follow Unit 8 /ow/ (Handbook). PSC guidance: consider teaching it alongside Unit 8, a week each."],
  }),
  soundUnit(24, "ar", "/ar/", undefined, "ar a al au", {
    src: ["sw-hfw-2025"], ex: ["arm", "father", "car", "garden", "dark", "park", "star", "card", "half", "palm", "calm", "farm"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-hfw-2023"],
    hfw: ["are", "asked", "can't", "after", "car", "garden", "fast", "laughed", "last", "dark", "hard", "park"],
    otherSpellings: [{ g: "are", p: "ar", why: "HFW chart (are)", src: ["sw-hfw-2025"] }, { g: "ear", p: "ar", why: "tangential: 'heart'", src: ["sw-tangential-2024"] }],
    notes: ["Accent dependent: the word lists star ask, draught, grasp, laugh, path, rather … 'In some regions these words are pronounced with the /a/ sound … and are therefore not taught with /ar/'. Our game avoids these words."],
  }),
  soundUnit(25, "o", "/o/", undefined, "o a", {
    src: ["sw-handbook-2026"], ex: ["was", "what", "want", "hot", "wasp", "watch", "wash", "swan", "squash", "clock"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    hfw: ["was", "what", "want", "wanted", "because"],
    otherSpellings: [{ g: "au", p: "o", why: "HFW chart (because)", src: ["sw-hfw-2025"] }, { g: "ou", p: "o", why: "tangential: 'cough'", src: ["sw-tangential-2024"] }],
    notes: ["May take one week (Handbook; Grange: 'as there are only two spellings to introduce'). < ach > in 'yacht' is 'a one-off spelling of /o/'."],
  }),
  spellingUnit(26, "a", [["o", "was"], ["a", "cat"], ["ae", "apron"], ["ar", "father"]], {
    needs: ["EC24", "EC25", "IC1"],
    otherSpellings: [{ g: "a", p: "or", why: "Freshford YR deck: water (Unit 19 in the sequence)", src: ["freshford-yr"] }, { g: "a", p: "e", why: "Freshford YR deck and HFW chart: any, many (Unit 7)", src: ["freshford-yr", "sw-hfw-2025"] }],
    notes: ["Official aim: Unit 26 by the end of Year 1."],
  }),
  soundUnit(27, "ae", "/ae/", "more", "ai ay a-e ea a ei ey eigh", {
    firstUnit: "EC1", src: ["sw-plan-y2-2023", "sw-pedagogy"],
    ex: ["clay", "fail", "great", "vein", "prey", "sleigh", "taste", "vane", "grey", "reign", "weigh", "eight", "they", "veil", "neigh", "whey", "baby", "made", "graze", "cane", "cake", "freight", "rein"],
    exSrc: ["sw-plan-y2-2023", "sw-checks-ec-2026", "sw-hfw-2023"], hfw: ["baby", "gave", "place"],
    notes: [
      "Record sheet: more spellings a ei ey eigh; the word lists give all eight, 'ai ay ea a-e a ei ey eigh'. The 2023 Year 2 guidance's 'eight spellings of /ae/' counts < a-e > and < a > separately; under the 2024 guidance they merge, leaving seven (Our Pedagogy: first < a ay ai ea >, more < ei eigh ey >).",
      "2023 Year 2 planning: Lesson 6 sets such as 'clay, fail, great, vein, prey, sleigh, taste, vane'.",
      "Tangential with Unit 27: < aigh > (straight), < gn > for /n/ (reign). Year 2 starts here.",
    ],
  }),
  soundUnit(28, "d", "/d/", undefined, "d dd ed", {
    src: ["sw-checks-ec-2026"], ex: ["add", "odd", "played", "tugged", "sobbed", "called", "rolled", "slide", "code", "pond"], exSrc: ["sw-checks-ec-2026", "sw-checks-ec-2024"],
    notes: [
      "< ed > is one spelling ('p l ay ed', 'o p e n ed'); the manual's /d/ worksheet also prints 'l oo k ed', 'j u m p ed' there, and the 2024 checks dictated 'jumped' at Unit 28. The 2026 checks read 'stopped' under Unit 47 /t/ instead.",
      "Tangential: < dh > (dhal, Gandhi).",
    ],
  }),
  soundUnit(29, "ee", "/ee/", "more", "ee ea e y ey ie i", {
    firstUnit: "EC2", src: ["sw-checks-ec-2026"], ex: ["key", "chief", "ski", "shield", "field", "thief", "brief", "each", "shriek", "happy", "Indian"], exSrc: ["sw-checks-ec-2026", "freshford-yr", "sw-psc-2024"],
    otherSpellings: [
      { g: "ei", p: "ee", why: "tangential: receive, receipt, perceive (Freshford YR deck: receipt)", src: ["sw-tangential-2024", "freshford-yr"] },
      { g: "i-e", p: "ee", why: "Freshford YR deck (machine); post-2024 'machine' is m.a.ch.i.ne", src: ["freshford-yr"] },
      { g: "eo", p: "ee", why: "tangential: people", src: ["sw-tangential-2024", "sw-hfw-2025"] },
      { g: "e-e", p: "ee", why: "PSC 2023 addition (scheme); post-2024 coded with < e >", src: ["sw-psc-2023"] },
    ],
    notes: ["Record sheet: more spellings ey ie i; the word lists give all: e ee ea y ey ie i. May take one week (Handbook). Tangential: < kn > (knee, kneel)."],
  }),
  soundUnit(30, "i", "/i/", undefined, "i ui e y", {
    src: ["sw-checks-ec-2026"], ex: ["myth", "build", "built", "gym", "hymn", "pretty"], exSrc: ["sw-checks-ec-2026", "sw-checks-ec-2024"],
    notes: ["May take one week (Handbook). Unusual: < u > in busy, business, minute; < o > in 'women', 'a highly unusual spelling of the sound /i/'."],
  }),
  spellingUnit(31, "y", [["y", "yellow"], ["i", "hymn"], ["ie", "cry"], ["ee", "happy"]], { needs: ["IC7", "EC30", "EC11", "EC2"] }),
  soundUnit(32, "oe", "/oe/", "more", "oa ow o-e o oe ou ough", {
    firstUnit: "EC4", src: ["sw-checks-ec-2026"], ex: ["mould", "though", "dough", "soul", "fold", "cloak", "stone", "throw", "both"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024"],
    notes: ["Record sheet: more spellings ou ough; the word lists give all: oe o-e ow oa ou ough o."],
  }),
  soundUnit(33, "n", "/n/", undefined, "n nn ne gn kn", {
    src: ["sw-checks-ec-2026"], ex: ["know", "gone", "kneel", "none", "gnome", "knock", "gnash", "knife", "knew", "gnat", "knee", "sign"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    notes: ["Record sheet: n nn gn kn; the word lists add < ne >."],
  }),
  soundUnit(34, "er", "/er/", "more", "er ir ur or ar ear our re", {
    firstUnit: "EC6", src: ["sw-checks-faq-2026", "sw-handbook-2026", "sw-checks-ec-2026"],
    ex: ["collar", "learn", "journey", "dollar", "journal", "search", "heard", "favour", "solar", "litre", "earth", "world"], exSrc: ["sw-checks-ec-2026"],
    notes: [
      "Record sheet: more spellings ar ear our; the 2026 checks FAQ: 'in Unit 34 polysyllabic words are taught with < re >, < ar > and < our >', so < re > (litre, centre) is added here. It is a schwa in most accents; Sounds~Write files it under /er/.",
      "One of the units where new spellings need polysyllabic words (Handbook: Units 18 and 34; the FAQ adds 35).",
    ],
  }),
  soundUnit(35, "v", "/v/", undefined, "v vv ve", {
    src: ["sw-checks-faq-2026"], ex: ["of", "have", "gave", "live", "dive", "twelve", "groove", "sleeve", "nerve", "brave", "savvy"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    otherSpellings: [{ g: "f", p: "v", why: "'of': 'a very rare spelling of the sound /v/, as it occurs only in the word of'; point it out tangentially", src: ["sw-tangential-2024", "sw-hfw-2025"] }],
    notes: ["'In Unit 35 the words savvy and skivvy are taught to introduce the spelling < vv >' (checks FAQ). < ve > starts in Initial Code Unit 11. May take one week (Handbook)."],
  }),
  soundUnit(36, "oo", moon, "more", "oo ew ue u-e u ui ou ough", {
    firstUnit: "EC10", src: ["sw-checks-ec-2026"], ex: ["through", "fruit", "truth", "group", "screw", "soup", "youth", "route", "suit", "prune", "prove", "juice"], exSrc: ["sw-checks-ec-2026", "sw-hfw-2023"],
    notes: ["Record sheet: more spellings ui ou ough u u-e; the word lists give all: oo ew u ue u-e ui ou ough. Neither lists < o > (do, to, prove), which Unit 10 taught; the Freshford petal includes it."],
  }),
  soundUnit(37, "j", "/j/", undefined, "j g ge gg dge", {
    src: ["sw-statutory-2025"], ex: ["jug", "gem", "magic", "germ", "huge", "badge", "gym", "edge", "fridge", "large", "judge", "strange"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-hfw-2023"],
    notes: ["Record sheet: j g ge gg dge (the word lists omit < gg >; the 12.2025 analysis maps < gg > = /j/ in 'exaggerate', 'suggest' here). < di > (soldier) is 'a rare spelling of /j/'. PSC guidance: teach < g > for /j/ ('gem') tangentially earlier."],
  }),
  soundUnit(38, "g", "/g/", undefined, "g gg gh gu", {
    src: ["sw-checks-ec-2026"], ex: ["ghost", "guest", "guide", "guard", "guilt", "guess", "league"], exSrc: ["sw-checks-ec-2026"],
    notes: ["Both editions of the checks dictate 'league' here; how its < gue > is coded is not stated."],
  }),
  spellingUnit(39, "g", [["g", "gum"], ["j", "gem"]], {
    needs: ["IC3", "EC37"], exSrc: ["sw-psc-2024"],
    also: [{ g: "gg", p: "g", note: "as in 'egg'" }, { g: "gg", p: "j", note: "as in 'suggest'" }],
    notes: ["Record sheet: 'Spellings < g > and < gg >' representing /j/ and /g/ (word lists: 'Spelling < g >').", "School lists print '/j/ (angel) & /g/ (gym)', which swaps the examples (gym is /j/). We use gum and gem."],
  }),
  soundUnit(40, "f", "/f/", undefined, "f ff ph gh", { src: ["sw-checks-ec-2026"], ex: ["if", "puff", "photo", "graph", "laugh", "phone", "rough", "tough", "cough", "whiff"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024"] }),
  spellingUnit(41, "gh", [["f", "cough"], ["g", "ghost"]], { needs: ["EC40", "EC38"] }),
  soundUnit(42, "m", "/m/", undefined, "m mm mb mn", {
    src: ["sw-checks-ec-2026"], ex: ["climb", "lamb", "comb", "thumb", "crumb", "hymn", "jammed", "numb", "limb", "autumn"], exSrc: ["sw-checks-ec-2026"],
    otherSpellings: [
      { g: "me", p: "m", why: "HFW chart files some/come under < me >; consonant + e from EC1 (SPLIT_SPELLING)", src: ["sw-hfw-2025", "sw-split-2024"] },
      { g: "mme", p: "m", why: "'programme'", src: ["sw-statutory-2025", "sw-lexicon"] },
    ],
  }),
  soundUnit(43, "or", "/or/", "more", "or aw au a ar al oor oar ore our augh ough", {
    firstUnit: "EC19", src: ["sw-checks-ec-2026"],
    ex: ["roar", "caught", "bought", "four", "score", "door", "thought", "more", "source", "taught", "board", "shore", "fourth", "ought"], exSrc: ["sw-checks-ec-2026", "freshford-y1y2", "sw-hfw-2023"],
    notes: ["Record sheet and word lists: more spellings ore oar our augh ough (< oor > now comes with Unit 19). Tangential: < oa > in 'broad', 'abroad'."],
  }),
  soundUnit(44, "h", "/h/", undefined, "h wh", { src: ["sw-checks-ec-2026"], ex: ["who", "whole", "whom", "whose"], exSrc: ["sw-checks-ec-2026", "englishmartyrs"], notes: ["May take one week (Handbook)."] }),
  soundUnit(45, "k", "/k/", undefined, "c k ck ch cc", {
    src: ["sw-checks-ec-2026"], ex: ["cat", "key", "check", "school", "scheme", "chrome", "chord", "tech", "strike"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-hfw-2023"],
    notes: [
      "PSC guidance: < ch > for /k/ (school) belongs here; use Lesson 10 to teach < ch > as /ch/, /sh/ and /k/ (lunch, chef, school) in Year 1.",
      "The checks also read 'quite', 'squint', 'cheque' and dictate 'queen' here; the 12.2025 analysis gives < qu > for /k/ (mosquito). How these are coded is not stated.",
    ],
  }),
  soundUnit(46, "r", "/r/", undefined, "r rr rh wr", { src: ["sw-checks-ec-2026"], ex: ["wrap", "wrong", "wrist", "rhyme", "write", "wreck", "wreath", "wrote", "carrot"], exSrc: ["sw-checks-ec-2026"], notes: ["May take one week (Handbook)."] }),
  soundUnit(47, "t", "/t/", undefined, "t tt te bt ed", {
    src: ["sw-checks-ec-2026", "sw-statutory-2025"], ex: ["debt", "doubt", "taste", "stopped", "mitt", "kitten"], exSrc: ["sw-checks-ec-2026"],
    notes: ["Record sheet: t tt te bt. < ed > for /t/ is added here: the 2026 checks read 'stopped' as a Unit 47 word and the 12.2025 analysis files < ed > = /t/ ('attached') here. The pre-2024 manual lists 'jumped', 'looked' under Unit 28 /d/. 'route' (Unit 36 < ou >) is also a Unit 47 check word."],
  }),
  soundUnit(48, "z", "/z/", undefined, "z zz ze s se ss", {
    src: ["sw-checks-ec-2026"], ex: ["zip", "buzz", "hens", "is", "his", "please", "use", "fizz", "legs", "breeze", "snooze", "choose"], exSrc: ["sw-checks-ec-2026", "sw-psc-2024", "sw-hfw-2023"],
    hfw: ["is", "his", "was", "as", "these", "please", "use"],
    notes: ["In the 2023 Year 2 plan Units 48 and 49 share weeks 11–12."],
  }),
  soundUnit(49, "eer", "/eer/", undefined, "eer ere ear", {
    src: ["sw-hfw-2025"], ex: ["here", "deer", "ear"], exSrc: ["sw-hfw-2023", "sw-ec-wordlists"], hfw: ["here"],
    notes: [
      "Official aim: Unit 49 by the end of Year 2. No progress check tests Unit 49 (check 38 reads Units 46–48).", // TODO(verify): DOSSIER §16.11 q5
      "Accent: 'year' may be /y/ /er/ and 'cheer', 'fear' two syllables; the lexicon treats 'eer' as /ee/ + schwa.",
    ],
  }),
];

/** Schwa. NOT a current unit: older official documents give it an Extended Code Unit 50 (02.2023 objectives; 06.2023 HFW
 *  chart "Spellings of 'schwa' /Ə/ (accent dependent)"; 09.2024 PSC guidance "/schwa/ farmer EC 50"), but the 11.2023
 *  scope and sequence, the 2026 Handbook, the 06.2025 HFW chart and the 2026 progress checks all end at Unit 49. Schwa is
 *  taught in the Polysyllabic Words strand ("some polysyllabic words contain schwas") (DOSSIER §9.1, §10.5). */
export const EC50_SCHWA = {
  id: "EC50" as SwUnitId, title: "Spellings of 'schwa' /Ə/ (accent dependent)", sound: "schwa" as PhonemeId,
  hfw: ["the", "a", "children", "around", "garden", "across", "along", "dragon"],
  pscNote: "Teach the spelling < er > for the schwa sound 'uh' in polysyllabic lessons (farmer, baker, faster, after).",
  current: false, onScopeAndSequence: false, src: ["sw-hfw-2023", "sw-psc-2024", "sw-ss-ec", "sw-hfw-2025", "sw-ss-psw"] as SourceId[], conf: "official" as Tier,
};

// =============================================================================================== Polysyllabic Words

export interface PolyStage {
  id: SwUnitId;
  stage: number;
  title: string;
  /** code in scope */
  code: string;
  /** syllable structures, written C/V per syllable with | between syllables */
  structures: string[];
  syllables: [number, number];
  level: "sound" | "syllable" | "analysis";
  examples: string[];
  lessons: SwLessonId[];
  when: string;
  notes: string[];
  src: SourceId[];
  conf: Tier;
}

// Stage numbers are ours. PW1–PW3 follow the Handbook's seven-step structure sequence (2026, repeated in "Introducing
// Polysyllabic Words" 10.2024) and its Initial Code word sets; PW4–PW6 the review of the Extended Code, syllable-level
// lessons and suffixes/schwas; PW7–PW9 the Handbook's Years 3–6 guidance. The record sheet has five stages: two-,
// three-, four-, five-syllable words, then common suffixes (DOSSIER §10.4, §10.9).
export const POLYSYLLABIC: PolyStage[] = [
  {
    id: "PW1", stage: 1, title: "Two-syllable Initial Code words, CVC|CVC and VC|CVC, many compounds (Sets 1–2)", code: "Initial Code", structures: ["VC|CVC", "CVC|CVC"], syllables: [2, 2], level: "sound",
    examples: ["sun|set", "up|set", "co|mic", "zig|zag", "sun|lit", "wig|wam", "cob|web", "nut|meg", "bed|bug", "hot|dog", "kid|nap", "pig|pen", "dog|leg", "Bat|man", "ad|mit", "ca|bin"],
    lessons: ["L11", "L12"], when: "Year 1 from week 2 of EC4 /oe/ (Lesson 11 then Lesson 12, in the current-unit part); 'Don't be tempted to start earlier even though the students are older'",
    notes: [
      "Handbook step 1: 'CVC | CVC (e.g., sunset) and VC | CVC (e.g., upset) words with sound-spelling correspondences from the Initial Code … many of them are compound words.'",
      "Progress check 3 (after Unit 4) reads sunset, zigzag, batman, hotdog, cobweb.",
      "Introduced in the 'current unit' part of the session because it is new learning; later used for review. Prime children to find the strong syllable.",
      "Freshford already meets two-syllable and compound words in Reception (school); several schools do the same, which departs from the official timing.",
    ],
    src: ["sw-handbook-2026", "sw-psw-intro-2024", "sw-plan-y1-2023", "sw-checks-ec-2026", "freshford-yr"], conf: "official",
  },
  {
    id: "PW2", stage: 2, title: "More complex Initial Code structures and two-letter spellings (Sets 3–5)", code: "Initial Code",
    structures: ["VC|CVCC", "CVC|CVCC", "CVCC|CVC", "CCV|CVCC", "VC|CCVCC", "CVC|CCVC"], syllables: [2, 2], level: "sound",
    examples: ["in|sect", "den|tist", "desk|top", "pro|ject", "in|vent", "ob|ject", "him|self", "egg|shell", "jack|pot", "chop|stick", "dish|cloth", "ac|ting", "pad|lock", "back|pack", "lip|stick", "wing|span", "sand|pit", "plas|tic", "fi|nish"],
    lessons: ["L11", "L12"], when: "Year 1, about EC4–EC6",
    notes: ["Handbook steps 2–3: VC|CVCC (insect), CVC|CVCC (dentist), CVCC|CVC (desktop), CCV|CVCC (project); then two-letter spellings, CVC|CVC (eggshell, jackpot) up to chopstick, dishcloth.", "Progress checks 4–5 read finish, insect, backpack, lipstick, dentist, padlock, backdrop, chopstick, dustpan."],
    src: ["sw-handbook-2026", "sw-psw-intro-2024", "sw-plan-y1-2023", "sw-checks-ec-2026"], conf: "official",
  },
  {
    id: "PW3", stage: 3, title: "Adjacent consonants, three syllables and schwa priming, still Initial Code (Set 6; words with schwas)", code: "Initial Code",
    structures: ["VC|CCVCC", "CCCVC|CVC", "CVC|CVC|CVC", "CV|CV|CVC", "CVC|CCV|CVCC"], syllables: [2, 3], level: "sound",
    examples: ["in|spect", "ab|stract", "splen|did", "fan|tas|tic", "be|ne|fit", "ha|bi|tat", "com|pli|ment", "tri|plet", "sun|lit", "a|ddress", "ca|rrot", "hun|dred", "ki|tchen", "le|mon", "le|sson", "sa|lad", "se|ven", "co|llect", "e|quip|ment", "con|tra|dict"],
    lessons: ["L11", "L12"], when: "Year 1, before Extended Code spellings enter polysyllabic work (about EC8)",
    notes: [
      "Handbook step 4: adjacent consonants (inspect, abstract, splendid) and CVC|CVC|CVC (fantastic). Step 5: weak and strong syllables, first without schwas (sunlit), then with (collect). Step 6: three-syllable Initial Code words that may contain schwas (equipment, contradict).",
      "Stress game before schwas: 'Is it SUNlit, or sunLIT? Is it batMAN or BATman?' (doc 47).",
    ],
    src: ["sw-handbook-2026", "sw-psw-intro-2024", "sw-plan-y1-2023", "sw-doc47"], conf: "official",
  },
  {
    id: "PW4", stage: 4, title: "Extended Code spellings in polysyllabic words (review, well behind the current unit)", code: "Extended Code units already reviewed, typically 4–7 units behind", structures: ["any"], syllables: [2, 4], level: "sound",
    examples: ["day|break", "pain|ting", "Sun|day", "rea|ding", "in|deed", "land|scape", "hand|shake", "mea|ning", "win|dow", "ye|llow", "fish|bowl", "snow|flake", "pass|word", "sun|burn", "dir|ty", "Au|gust", "au|thor", "wa|ter"],
    lessons: ["L11", "L12", "L13", "L14"], when: "Year 1 from about EC8 (first /ae/, then /ee/, /oe/ …), then throughout Years 1–2",
    notes: [
      "'Polysyllabic words should never be taught when the sound-spelling correspondences for a particular unit are first introduced', except Units 18, 34 and 35 (checks FAQ).",
      "The 2026 progress checks show the lag: after Unit 8 they read EC 1–2 words; after Unit 25, EC 18–20; after Unit 49, EC 43–45.",
      "Our Pedagogy: first spellings in single-syllable words, then 'return to those spellings in polysyllabic words', then more spellings the same way.",
    ],
    src: ["sw-handbook-2026", "sw-checks-faq-2026", "sw-checks-ec-2026", "sw-ec-timeline-2024", "sw-plan-y1-2023", "sw-plan-y2-2023", "sw-pedagogy"], conf: "official",
  },
  {
    id: "PW5", stage: 5, title: "Syllable-level building and reading (Lessons 13 and 14)", code: "code taught so far", structures: ["any"], syllables: [2, 6], level: "syllable",
    examples: ["fan|tas|tic", "Sep|tem|ber", "de|mon|strate", "win|dow", "At|lan|tic", "mul|ti|pli|ca|tion"], lessons: ["L13", "L14"], when: "'When students are achieving a reasonable level of proficiency' (Years 1–2 onward)",
    notes: [
      "Not one-way: go back to Lessons 11 and 12 for 4-, 5- and 6-syllable words, less common spellings, domain words, or any pupil who needs support.",
      "Children say and build or read syllables rather than sounds; if they keep sounding every sound, 'go back to Lesson 12' with the lines.",
    ],
    src: ["sw-psw-intro-2024", "sw-podcast-ep20", "sw-tte-psw", "sw-hfw-2025"], conf: "official",
  },
  {
    id: "PW6", stage: 6, title: "Common suffixes and schwas", code: "code taught so far + common syllables", structures: ["any"], syllables: [2, 5], level: "sound",
    examples: ["far|mer", "ba|ker", "fas|ter", "af|ter", "chil|dren", "a|bout", "mul|ti|ply", "pic|ture", "lo|ca|tion", "e|nor|mous", "mu|si|cian"], lessons: ["L11", "L12", "L13", "L14", "L15"], when: "Year 1 (< er > as schwa) onward; suffixes and words of more than three syllables later",
    notes: [
      "Knowledge objective: 'the spelling of some common syllables, such as prefixes and suffixes'; record-sheet stage 5 'Common suffixes'; the 12.2025 analysis calls -tion, -sion, -ssion, -cial, -cient, -ssure, -ture 'special endings'.",
      "Schwa: 'in our talking voice we say multiply, but in our spelling voice we say mul-ti-ply'. Schwas are accent dependent; 'consistent teaching based on the accents of the students'.",
    ],
    src: ["sw-ss-psw", "sw-record-sheet", "sw-statutory-2025", "sw-psc-2024", "sw-tte-psw", "sw-hfw-2025"], conf: "official",
  },
  {
    id: "PW7", stage: 7, title: "Year 3: the Extended Code reviewed one sound a week, with polysyllabic words", code: "whole Extended Code, First and More spellings combined", structures: ["any"], syllables: [2, 4], level: "syllable",
    examples: [], lessons: ["L11", "L12", "L13", "L14", "L15"], when: "Year 3 (and Year 4 if necessary), daily",
    notes: [
      "Handbook: 'spending a week on each sound', 33 'sound' units. Autumn Units 1–17 (+ More 27, 29, 32, 34, 36); spring 18–37 (+ 43); summer 38–49. Review includes 'Polysyllabic words from previously taught units'; statutory spellings 'as they come up in the relevant units'.",
      "A count of the published sequence gives 32 sound units after merging the six First/More pairs, not 33.", // TODO(verify): DOSSIER §16.11 q6
    ],
    src: ["sw-handbook-2026", "sw-mixed-age", "grange-2024"], conf: "official",
  },
  {
    id: "PW8", stage: 8, title: "Year 4: review if needed, then discrete spelling sessions", code: "whole Extended Code", structures: ["any"], syllables: [3, 5], level: "syllable",
    examples: [], lessons: ["L11", "L12", "L13", "L14", "L15"], when: "Year 4",
    notes: [
      "Handbook: Year 3-style review only 'if necessary'; otherwise 2–3 discrete 15-minute sessions a week plus 'incidental and tangential teaching across the curriculum'.",
      "'Using three-, four- and five-syllable words' is a school document's wording (Grange), not the Handbook's.",
    ],
    src: ["sw-handbook-2026", "grange-2024"], conf: "official",
  },
  {
    id: "PW9", stage: 9, title: "Years 5–6 and beyond: domain vocabulary, statutory spellings and analysis", code: "whole code", structures: ["any"], syllables: [2, 7], level: "analysis",
    examples: ["chlo|ro|phyll", "mul|ti|pli|ca|tion", "au|to|bi|o|gra|phi|cal", "di|sas|trous"], lessons: ["L15", "L10", "L12"], when: "Years 5–6 and beyond",
    notes: [
      "Handbook: 2–3 × 15-minute sessions a week; lessons teach 'domain-specific vocabulary as it is encountered in the wider curriculum' and the statutory spellings; tangentially, 'Lesson 15 to analyse the spellings within a polysyllabic word or Lesson 10 to look at two or more sounds that can be represented by a particular spelling'.",
      "Syllables first, meaning after: morphology 'can run in parallel to phonics but it doesn't precede phonics teaching' (founder, Y3–6 course).",
      "Barley Hill (school): find the tricky part of each syllable (mul|ti|ply: < y > for /ie/) and other words with that spelling (my, by, sky).",
    ],
    src: ["sw-handbook-2026", "sw-l15-tips", "sw-autobiographical", "barleyhill"], conf: "official",
  },
];

/** Syllable division (official guidance, not rules: 'there isn't a hard and fast rule'; 'listen, don't look'):
 *  'wherever possible … try to start the syllable with a consonant sound', so a double-consonant spelling stays whole
 *  and starts the next syllable (ru|bbish, di|ffe|rent) and a single consonant starts the next syllable (co|mic,
 *  e|ve|ry); CVCV splits help ('ba|by|si|tter', 'se|pa|rate'); compounds split at the join (egg|shell). Splits follow
 *  speech, not morphology, and may be accent dependent (DOSSIER §10.6). */
export const SYLLABLE_EXAMPLES: { word: string; split: string; src: SourceId }[] = [
  { word: "everyone", split: "e|ve|ry|one", src: "sw-hfw-2023" }, { word: "every", split: "e|ve|ry", src: "sw-hfw-2023" },
  { word: "different", split: "di|ffe|rent", src: "sw-hfw-2023" }, { word: "animals", split: "a|ni|mals", src: "sw-hfw-2023" },
  { word: "narrator", split: "na|rra|tor", src: "sw-hfw-2023" }, { word: "government", split: "go|vern|ment", src: "sw-hfw-2025" },
  { word: "window", split: "win|dow", src: "sw-l11-demo" }, { word: "Atlantic", split: "At|lan|tic", src: "barleyhill" },
  { word: "multiplication", split: "mul|ti|pli|ca|tion", src: "barleyhill" },
  { word: "comic", split: "co|mic", src: "sw-plan-y1-2023" }, { word: "cabin", split: "ca|bin", src: "sw-plan-y1-2023" },
  { word: "acting", split: "ac|ting", src: "sw-plan-y1-2023" }, { word: "benefit", split: "be|ne|fit", src: "sw-plan-y1-2023" },
  { word: "habitat", split: "ha|bi|tat", src: "sw-plan-y1-2023" }, { word: "compliment", split: "com|pli|ment", src: "sw-plan-y1-2023" },
  { word: "triplet", split: "tri|plet", src: "sw-plan-y1-2023" }, { word: "dandruff", split: "dan|druff", src: "sw-plan-y1-2023" },
  { word: "rubbish", split: "ru|bbish", src: "sw-psw-doc45" }, { word: "coffee", split: "co|ffee", src: "sw-psw-doc45" },
  { word: "happy", split: "ha|ppy", src: "sw-psw-doc45" }, { word: "mirror", split: "mi|rror", src: "sw-psw-doc45" },
  { word: "grateful", split: "grate|ful", src: "sw-psc-2025-blog" }, { word: "statue", split: "sta|tue", src: "sw-psc-2025-blog" },
  { word: "babysitter", split: "ba|by|si|tter", src: "sw-psw-doc25" }, { word: "separate", split: "se|pa|rate", src: "sw-psw-doc25" },
  { word: "finish", split: "fi|nish", src: "sw-checks-ec-2026" }, { word: "listen", split: "li|sten", src: "sw-checks-ec-2026" },
  { word: "success", split: "suc|cess", src: "sw-checks-ec-2026" }, { word: "autobiographical", split: "au|to|bi|o|gra|phi|cal", src: "sw-autobiographical" },
];

// =============================================================================================== Teaching Through Errors

export type ErrorType =
  | "misread-sound" | "added-sound" | "omitted-sound" | "alternative-sound" | "untaught-spelling" | "cannot-blend" | "impure-sound" | "special-word"
  | "wrong-sound-heard" | "spelling-not-known" | "wrong-spelling" | "valid-alternative-spelling" | "missing-sound-in-spelling" | "untaught-spelling-in-writing"
  | "swap-wrong-position" | "letter-formation" | "schwa-spelling"
  // added in the dossier reconciliation: Progress Tracker tags and the Lesson 4(a) list
  | "letter-name" | "said-separately" | "guess" | "wrong-order"
  // polysyllabic (official, Lessons 13 and 14)
  | "syllable-division" | "sounding-when-building" | "imprecise-pronunciation" | "syllable-break" | "syllable-wrong-sound" | "reads-through" | "capital-letter";

export interface ErrorScript {
  id: ErrorType;
  direction: "reading" | "spelling" | "both";
  when: string;
  /** scripted steps; [brackets] are actions, quotes are what the teacher (Sensei) says */
  steps: string[];
  example?: string;
  /** how the game should run it */
  game: string;
  /** the Progress Tracker (2026) tag this matches, if any */
  trackerTag?: string;
  src: SourceId[];
  conf: Tier;
}

/** Teaching Through Errors: short scripted "mini scripts", the same at every level. Pattern: correct at once at the exact
 *  place of the error; give only the missing piece (a sound, a spelling); hand the task straight back ("Say the sounds
 *  and read the word"); precise, non-negative language (DOSSIER §4.1). The Manual's full set is not public (§16.6 q1). */
export const TEACHING_THROUGH_ERRORS: Record<ErrorType, ErrorScript> = {
  "misread-sound": {
    id: "misread-sound", direction: "reading", when: "The child says the wrong sound for a taught spelling and reads a different word.",
    steps: [
      "[Point to the spelling they misread, not the whole word.]",
      "\"If this was 'big', this would be /g/. Is it?\" (school wording; the official 'If this …' template is published only for an omitted sound and for wrong order in writing)",
      "[If the child doesn't know:] \"This is /n/. Say /n/ here.\" (official pattern for a stumble on a taught spelling)",
      "\"Say the sounds and read the word.\"",
    ],
    example: "bin read as 'big' (Freshford Reception deck)",
    game: "Highlight the misread spelling; play the script with the child's word; replay the sound on tap; the child reads again. Never say the target word first.",
    trackerTag: "Wrong sound",
    src: ["freshford-yr", "sw-readers-guide", "sw-tracker"], conf: "school", // TODO(verify): DOSSIER §16.6 q9 (the 'If this was …' template for a misread)
  },
  "added-sound": {
    id: "added-sound", direction: "reading", when: "The child reads a sound that is not in the word.",
    steps: ["[Point to where the extra sound would be.]", "\"If this were 'flight', there would be an < l > here. Is there?\"", "\"Say the sounds and read the word.\""],
    example: "fight read as 'flight' (Freshford Y1/Y2 deck)", game: "Mark the empty gap between spellings; same flow as misread-sound.",
    trackerTag: "+ Sound added",
    src: ["freshford-y1y2", "sw-tracker"], conf: "school", // TODO(verify): DOSSIER §16.6 q9: no official script; the Tracker only records the tag
  },
  "omitted-sound": {
    id: "omitted-sound", direction: "reading", when: "The child leaves out a sound (frog → 'fog').",
    steps: ["[Point to the spelling they left out.]", "\"If this word was 'fog', this [< r >] wouldn't be here. You left it out. Let's say the sounds and read the word.\""],
    game: "Highlight the skipped spelling; play the script; the child reads again.", trackerTag: "Not said",
    src: ["sw-readers-guide", "sw-tracker"], conf: "official",
  },
  "alternative-sound": {
    id: "alternative-sound", direction: "reading", when: "Extended Code: the child uses a real sound of the spelling, but the wrong one for this word (cave read with /a/).",
    steps: [
      "[Point to the spelling.] \"This can be /a/, but in this word, it's /ae/. Say /ae/ here. Say the sounds and read the word.\" (official, Concept 4)",
      "[School alternative (Freshford), asking the child to try the other sounds first: \"Does that make sense? Try it a different way. Can < ea > be a different sound?\"]",
    ],
    example: "cave read with /a/ (Sounds-Write 2024); 'Gemma': \"This can be /g/ but in this word, it's /j/. Say /j/ here.\" (founder)",
    game: "Say the official line with the spelling highlighted. Where the game wants the child to test alternatives (phoneme manipulation), offer the spelling's taught sounds as buttons first; either way the child then reads the word.",
    trackerTag: "Wrong sound",
    src: ["sw-split-2024", "sw-tte-psw", "freshford-y1y2", "walker-nonwords"], conf: "official",
  },
  "untaught-spelling": {
    id: "untaught-spelling", direction: "reading", when: "A word contains a spelling not taught yet.",
    steps: [
      "[Run your pencil under the spelling.] One letter: \"This is /v/, say /v/ here.\" Several letters: \"This is one sound. It's /k/. Say /k/ here.\"",
      "[Extended Code spelling not yet covered:] \"We haven't covered this before. This is /air/. Say /air/ here.\"",
      "[The child says the sounds and reads the word.] Only give the whole word when it holds more than one untaught complex spelling.",
    ],
    game: "Underline the spelling, play its sound, let the child blend. Record as helped, not as an error on that GPC.",
    src: ["sw-hfw-2025", "sw-readers-guide", "sw-hfw-2023"], conf: "official",
  },
  "said-separately": {
    id: "said-separately", direction: "reading", when: "A taught multi-letter spelling read as separate sounds (fish read /f/ /i/ /s/ /h/).",
    steps: ["[Run the pencil under < sh >.] \"Do you remember that sometimes we spell a sound with two letters like this one. It's two letters but it's one sound. It's /sh/. Say /sh/ here.\"", "\"Say the sounds and read the word.\""],
    game: "Glow the whole tile; play the script; the child reads again.", trackerTag: "Said separately",
    src: ["sw-readers-guide", "sw-tracker"], conf: "official",
  },
  "cannot-blend": {
    id: "cannot-blend", direction: "reading", when: "The child says the sounds but cannot hear the word.",
    steps: [
      "Word choice: continuants, well-known spellings, words in the child's spoken vocabulary. \"If you say the sounds accurately, you should be able to hear what the word is.\" 'Listen for the word.'",
      "Trained scripts: with continuants, Error Correction 4.2 ('follow my finger'); without, Error Correction 4.3 ('cover and blend'). Both keep the first sound from being forgotten; then 'say the sounds and read the word'. Parent course wording: \"Say the sounds and listen for the word. Stay with my finger.\"",
      "Choice of words: \"This word is 'cat' or 'cup'. Say the sounds and listen for the word.\" All choices start with the same letter; widen to 3–4, then words differing by one sound (cat/cot).",
      "Provide the sounds: \"I'll say the sounds and you listen for the word.\" [Point to each spelling.] Then: \"Say the sounds and read the word.\"",
      "Provide the word: \"This word is 'man'. Say the sounds and listen for the word 'man'.\" / \"I'm going to say the sounds in a word: /m/ /a/ /n/. I can hear the word 'man'. Did you hear 'man'? … Now you have a go.\" Then move back up the ladder.",
      "In class, ask the child after they have heard it modelled by others.",
    ],
    game: "Help levels in this order; the child's success after a model counts as helped. The exact EC 4.2/4.3 wording is not public, so the finger step uses the parent-course line.", // TODO(verify): DOSSIER §16.6 q3
    trackerTag: "Unable to blend",
    src: ["sw-blending-masterclass", "sw-blog-pa", "sw-parent-course", "sw-tracker"], conf: "official",
  },
  "impure-sound": {
    id: "impure-sound", direction: "both", when: "The child adds 'uh' to a sound ('muh', 'suh').",
    steps: ["[Point to your mouth.] \"Say it like me.\" [Model the pure sound: /m/.]", "[The child says it again.]"],
    game: "The game can't hear the child; model pure sounds everywhere.", src: ["sw-l4a-page", "walker-word-building"], conf: "official",
  },
  "letter-name": {
    id: "letter-name", direction: "both", when: "The child says a letter name instead of the sound ('em', 'ess').",
    steps: ["\"'Em' is a letter name. We want you to say the sound /m/ as you write it.\" [The child rubs it out and rewrites it, saying the sound.]", "(Sounds-Write training numbers this correction 'Error Correction 4.1'.)"],
    game: "Never play letter names before late Reception; when a letter-name choice is offered, answer with this line.", trackerTag: "Letter name",
    src: ["sw-l4a-page", "sw-tracker", "sw-handbook-2026"], conf: "official",
  },
  "guess": {
    id: "guess", direction: "reading", when: "The child says a different word from memory, the picture or the context.",
    steps: ["[Point to the first place the guess differs.] \"If this were 'van', that would be a /v/.\" (secondary wording)", "\"Say the sounds and read the word.\"", "'We don't encourage guessing, looking at pictures, or using context to try and work out what a word is.'"],
    game: "Treat like misread-sound at the first differing spelling; never reward a guess.", trackerTag: "Guess",
    src: ["sw-pedagogy", "sw-tracker"], conf: "inferred", // TODO(verify): DOSSIER §16.6 q8: no official script for a guess
  },
  "special-word": {
    id: "special-word", direction: "reading", when: "A high-frequency word with code not yet taught.",
    steps: ["Early on the teacher takes responsibility for the word: \"This is 'the', just say 'the' here.\"", "Later, give only the untaught part: \"This is /e/ [gesture to < ai >], say /e/ here, /s/ /e/ /d/, 'said'.\""],
    game: "Tap the word to hear it; show the untaught spelling underlined. Never call it 'tricky' or 'a sight word'.", src: ["sw-handbook-2026", "sw-hfw-2025", "freshford-yr"], conf: "official",
  },
  "wrong-sound-heard": {
    id: "wrong-sound-heard", direction: "spelling", when: "Word building: the child names the wrong sound for a line.",
    steps: ["\"What is the first sound (gesturing to the first line) you hear in 'sat'? Listen to what you hear when my finger is under this line.\"", "Say the word slowly, stretched, sweeping your finger under the lines, without segmenting it; repeat the question two or three times."],
    game: "Replay the stretched word with the paw on the line. Never play the segmented sounds when the child is spelling.", src: ["sw-l1-tips", "sw-general-points", "walker-word-building"], conf: "official",
  },
  "spelling-not-known": {
    id: "spelling-not-known", direction: "spelling", when: "Word building or writing: the child doesn't know which spelling is the sound.",
    steps: ["Building: \"If they do not know, simply tell them, 'It's this one' as you point to it.\" [Everyone says the sound as it goes on the line.]", "Writing: [on your whiteboard] \"You spell /m/ like this.\" / \"This is the way we spell /f/.\""],
    game: "Second miss: glow the answer and play the line.", src: ["sw-l1-tips", "sw-l4a-page", "sw-parent-course"], conf: "official",
  },
  "wrong-spelling": {
    id: "wrong-spelling", direction: "spelling", when: "Initial Code: a taught sound spelt with the wrong taught spelling (/k/ as < k > in 'cat'; 'buz').",
    steps: [
      "[Point to the place of the error, not the whole word.] /k/: \"This is /k/, but in this word you need this spelling of /k/.\" [Model it.]",
      "Double consonants: \"We often spell the sound /z/ like this < zz > at the end of some short words.\" \"It's two letters but it's one sound!\"",
      "[The child rewrites it, saying the sound.]",
    ],
    game: "Only the wrong slot shakes; the child re-chooses that slot.", src: ["sw-l4a-page", "walker-spelling-errors"], conf: "official",
  },
  "valid-alternative-spelling": {
    id: "valid-alternative-spelling", direction: "spelling", when: "Extended Code: a taught spelling of the right sound, but not the one this word uses ('steem', 'sed').",
    steps: [
      "[Point to the spelling.] \"This can be a spelling of /er/ but in this word we need this spelling of /er/: < er >.\" / \"That's one way of spelling /k/, but in this word we use this spelling.\"",
      "[Write it on your board:] \"This is the way we spell /e/ in this word. That is a way of spelling /e/ … But in this word, we need this spelling of /e/.\"",
      "[The child corrects it, saying the sound.]",
    ],
    game: "Accept as a correct sound (segmenting) but not a correct spelling (code). Record both.", src: ["sw-tte-psw", "walker-spelling-errors", "freshford-y1y2"], conf: "official",
  },
  "wrong-order": {
    id: "wrong-order", direction: "spelling", when: "Writing: sounds in the wrong order or a wrong letter ('tab' for 'bat').",
    steps: ["[Point to the first spelling.] \"If this were 'bat', this would be a … /b/. Is this /b/?\" [Hesitate to see if the child hears the error.]", "[The child rewrites the word, saying the sounds.]"],
    game: "Point at the first wrong slot; play the script; the child rebuilds.", src: ["sw-l4a-page"], conf: "official",
  },
  "missing-sound-in-spelling": {
    id: "missing-sound-in-spelling", direction: "spelling", when: "A sound is missing from the child's spelling ('sap' for 'snap').",
    steps: ["Say the word slowly, stretched, and point to where the sound belongs.", "\"Listen: sssnnnap. What do you hear here?\" (lines for each sound help)"],
    game: "Show an empty line where the missing sound goes.", src: ["walker-word-building", "sw-parent-course"], conf: "inferred", // TODO(verify): DOSSIER §16.6 q15 (Part 2 lecture wording not public)
  },
  "untaught-spelling-in-writing": {
    id: "untaught-spelling-in-writing", direction: "spelling", when: "The child needs a spelling not yet taught.",
    steps: ["Before the dictation, write untaught words or spellings on the board: \"this is the way we write it\".", "When modelling: \"This is the way we spell /e/ in this word.\"", "Freshford (school) accepts a plausible spelling ('chclt') in Reception free writing."],
    game: "Don't mark as wrong; show the spelling as a gift.", src: ["sw-hfw-2025", "freshford-yr", "freshford-y1y2"], conf: "official", // TODO(verify): DOSSIER §16.6 q11: when untaught spellings in free writing get corrected
  },
  "swap-wrong-position": {
    id: "swap-wrong-position", direction: "both", when: "Sound Swap: the child changes the wrong sound or can't hear the change.",
    steps: ["Use gesture and voice emphasis, 'perhaps emphasising stretching the changing sound. You only need to question and repeat if they can't get it. REMEMBER — you do not segment the word for the student at all.'", "Then: say the sounds and listen for the word; 'make them do the work!'"],
    game: "Stretch the changing sound and point at its line; never play the segmented sounds.", src: ["sw-l3-tips", "repo-pedagogy"], conf: "official",
  },
  "letter-formation": {
    id: "letter-formation", direction: "spelling", when: "A letter is reversed or misformed (b/d, a/o, a reversed s).",
    steps: ["[Write it correctly on your mini whiteboard, point to the letter:] \"Does yours look like mine? What do you need to change?\"", "Keep it short; 'the focus should remain on phonics rather than handwriting'. Manual 4(a): then point to the < d >: \"Is this /b/?\""],
    game: "Not applicable (tiles).", src: ["sw-handbook-2026", "sw-l4a-page", "sw-elg-faq"], conf: "official",
  },
  "schwa-spelling": {
    id: "schwa-spelling", direction: "spelling", when: "The child spells a schwa with the wrong spelling (Saturday, multiply).",
    steps: [
      "\"We need to say the word precisely in its syllables, so we hear the 'ti' because in our talking voice we say 'multiply', but in our spelling voice we say mul-ti-ply.\"",
      "Test it out: try each spelling of the sound and see which one looks right (school).",
    ],
    game: "Play the word in its 'spelling voice' syllables; offer the spellings of the sound as choices for that syllable.", src: ["sw-tte-psw", "sw-hfw-2025", "freshford-y1y2"], conf: "official",
  },
  "syllable-division": {
    id: "syllable-division", direction: "spelling", when: "Lesson 13: the child says 'fan-tas-tic' but builds 'fant-as-tic'.",
    steps: ["\"When you split the word you said 'fan-tas-tic' [gesture to the syllable lines] but you've built fant-as-tic. Read the word. Which one do you prefer?\"", "If they can't choose, go back to \"You said...\""],
    game: "Show the child's split against the spoken split; let them choose.", src: ["sw-tte-psw"], conf: "official",
  },
  "sounding-when-building": {
    id: "sounding-when-building", direction: "spelling", when: "Lesson 13: the child says every sound while building instead of the syllable.",
    steps: ["\"You don't need to say the sounds any more, I want you to say the syllable.\"", "(A weaker child may keep saying the sounds if they can't manage a syllable.)"],
    game: "Syllable-level items play syllables, not sounds.", src: ["sw-tte-psw"], conf: "official",
  },
  "imprecise-pronunciation": {
    id: "imprecise-pronunciation", direction: "both", when: "Lesson 14: said 'Sep-tem-buh' and wrote 'Septemba'.",
    steps: ["\"Let's say it again precisely in its syllables.\" [Use gestures.]"],
    game: "Replay the word in spelling-voice syllables.", src: ["sw-tte-psw"], conf: "official",
  },
  "syllable-break": {
    id: "syllable-break", direction: "reading", when: "Lesson 14: the child doesn't know where to stop for a syllable (S… Se… Sep… Sept…).",
    steps: [
      "\"I want you to say the sounds until my finger stops.\" OR \"You need to say the sounds and listen until you hear a syllable and say the syllable.\"",
      "The child says 'Sep'. \"OK, now forget 'Sep' [cover it] and let's go on to the next syllable.\" Repeat for each syllable.",
      "\"Say it precisely in its syllables.\" [Cover each syllable to help.]",
      "If the difficulty continues, the teacher has moved on too fast: go back to Lesson 12.",
    ],
    game: "Reveal one syllable at a time; fall back to sound-level items with lines.", src: ["sw-tte-psw"], conf: "official",
  },
  "syllable-wrong-sound": {
    id: "syllable-wrong-sound", direction: "reading", when: "Lesson 14: the child reads 'dee-mon-strate' for 'demonstrate'.",
    steps: ["Wait until the end of the word to see if they self-correct.", "\"Yes, it is 'demonstrate'. At first you said /ee/ here [point to < e >]. It can be /ee/ in some words, but in this word it's /e/. De-mon-strate. Demonstrate.\""],
    game: "Don't interrupt mid-word; correct the one spelling afterwards.", src: ["sw-tte-psw"], conf: "official",
  },
  "reads-through": {
    id: "reads-through", direction: "reading", when: "Lesson 14: the child reads all the sounds in the word without stopping at syllables.",
    steps: [
      "\"We need to say the sounds and listen until we hear a syllable and say the syllable again.\"",
      "Prompt: say /S/ /e/ /p/, put the sounds together and say the syllable; then step back and see what happens with the next syllable.",
      "If the child still reads sound by sound through the word, go back to Lesson 12 with the lines.",
    ],
    game: "Mark syllable ends; drop back to Lesson 12-style items.", src: ["sw-tte-psw"], conf: "official",
  },
  "capital-letter": {
    id: "capital-letter", direction: "spelling", when: "A proper noun written without a capital letter.",
    steps: ["\"Remember that this word is a proper noun, what do we need?\""],
    game: "Only relevant if the game asks children to spell names.", src: ["sw-tte-psw"], conf: "official",
  },
};

// =============================================================================================== lessons

export interface Lesson {
  id: SwLessonId;
  /** official name: 2023 planning guidance; Lesson 14 from the error-correction sheet, Lesson 15 from the Top Tips
   *  (DOSSIER §2.1.1). null if no source gives one. */
  name: string | null;
  /** other names used for the same lesson */
  aka: string[];
  nameSrc: SourceId[];
  purpose: string;
  skills: SwSkillId[];
  concepts: ConceptId[];
  levels: SwLevelId[];
  /** where it sits in a session (official planning guidance) */
  use: string;
  teacherLanguage: string[];
  steps: string[];
  stepsConf: Tier;
  errors: { reading: ErrorType[]; spelling: ErrorType[] };
  notes: string[];
  src: SourceId[];
}

const PLAN: SourceId[] = ["sw-plan-r-2023", "sw-plan-y1-2023", "sw-plan-y2-2023"];

export const LESSONS: Record<SwLessonId, Lesson> = {
  L1: {
    id: "L1", name: "Word Building", aka: ["Word-Building (manual header)"], nameSrc: [...PLAN, "sw-l1-tips"],
    purpose: "Teach new code in a real, known word: segment the spoken word, find each sound's spelling, build it, read it back, write it. Teaches that 'letters are symbols which represent sounds'.",
    skills: ["segmenting", "blending"], concepts: [1], levels: ["initial-code"],
    use: "Current unit, Units 1–10 (with Lesson 4); new code is always introduced with Lesson 1, 5 or 6.",
    teacherLanguage: [
      "I'm going to say the word 'sat' very slowly. Listen carefully to hear the sounds that make up the word 'sat'.",
      "What is the first sound (gesturing to the first line) you hear in 'sat'? Listen to what you hear when my finger is under this line.",
      "What is the next sound you hear when my finger is under this line?",
      "Yes, you can hear /s/. Everyone, say that sound /s/.",
      "Which of these is the way we write /s/?",
      "It's this one! (if they do not know, 'simply tell them')",
      "Say /s/ as you pull it onto the line.",
      "Say the sounds and read the word.",
      "(Faster version) These are all the sounds we need to build the word…",
    ],
    steps: [
      "Put only the word's spellings on the board, jumbled and slightly out of line; draw one line per sound.",
      "Say the word stretched ('sssaaat'), sweeping a finger under the lines, without pausing between sounds; never segment it for the children.",
      "Ask for the first sound with the finger under line 1; repeat the question two or three times if needed.",
      "A child names the sound; everyone says it; correct 'suh'/'ess' by pointing to your mouth: 'Say it like me.'",
      "'Which of these is the way we write /s/?' A child pulls it onto the line, saying the sound; the class echoes.",
      "Repeat for each sound.",
      "Everyone says the sounds and reads the word; then several children individually.",
      "Remove the cards; the children tell the sounds while the teacher writes them; say the sounds and read the word.",
      "Children draw the lines and write the word, saying each sound; then finger under line 1, say the sounds and read the word.",
    ],
    stepsConf: "official", errors: { reading: ["cannot-blend", "impure-sound"], spelling: ["wrong-sound-heard", "spelling-not-known", "impure-sound", "letter-name"] },
    notes: [
      "Steps 1–3 of the manual script are public (Top Tips for Lesson 1); the rest follows the founder's and parent-course accounts, which match (DOSSIER §2.2.1).",
      "No distractor cards: only the word's own spellings.",
      "Scaffolds to differentiate: word structure, more or fewer continuants, lines or no lines, more or fewer gestures, more or less of the script.",
      "Unit 1 week 1 (2023 planning): Mon build mat, Tue build sat, Wed build sit, Fri build at; sessions start at about 10 minutes.",
    ],
    src: ["sw-l1-tips", "walker-word-building", "walker-lp-2014", "sw-plan-r-2023", "sw-parent-course"],
  },
  L2: {
    id: "L2", name: "Symbol Search", aka: [], nameSrc: PLAN,
    purpose: "Review recall of code: match 'spellings to sounds and sounds to spellings'; 'specifically designed to support your letter formation teaching' (Handbook).",
    skills: [], concepts: [1], levels: ["initial-code"],
    use: "Review, with a one-unit lag, 'for as long as is necessary'.",
    teacherLanguage: ["I'm going to say the word 'lad'. What's the first sound you hear in 'lad'? (school script)", "Now write over it. Say the sound as you write. (school script)"],
    steps: [
      "A grid of the unit's and earlier spellings in mixed order (official printables: 3×3 cards).",
      "The teacher says a word (school script) or a sound (other schools); the children find its first sound, searching left to right, top to bottom.",
      "Everyone says the sound, then writes over the spelling saying the sound.",
    ],
    stepsConf: "school", errors: { reading: [], spelling: ["spelling-not-known", "impure-sound", "letter-formation"] },
    notes: ["Official further activities: write over each grey letter saying its sound; find the first /s/ in a line of letters; write over the sounds in a word and blend it.", "The official main script is not public; schools differ on whether the adult says a word or an isolated sound."], // TODO(verify): DOSSIER §16.4 q2
    src: ["sw-plan-r-2023", "sw-handbook-2026", "sw-impl-2020", "barleyhill"],
  },
  L3: {
    id: "L3", name: "Sound Swap", aka: ["Sound-Swap", "Nonsense Word Sound Swap"], nameSrc: [...PLAN, "sw-l3-tips"],
    purpose: "Phoneme manipulation: change one sound to make a new word (substitute, insert, delete); also more segmenting, blending and code practice, and faster error correction.",
    skills: ["phoneme-manipulation", "segmenting", "blending"], concepts: [1], levels: ["initial-code", "extended-code"],
    use: "Review, one unit behind (from week 2 of Unit 1 at about 80% accuracy); nonsense words from week 2 of Unit 9; in the Extended Code 'with Initial Code words only' and nonsense words throughout.",
    teacherLanguage: ["Now we're going to change 'mat' to 'sat' … what do you think we need to change?", "Say the sounds and read the word.", "Say the sounds and listen for the word."],
    steps: [
      "Part 1: the children say the sounds as the teacher puts the spellings on the board.",
      "Part 2: the teacher builds the first word; the children say the sounds and read it. Say the new word; sweep a finger under the old word, then under the new one, 'perhaps emphasising stretching the changing sound'. Never segment the word for them.",
      "A child makes the change (swap, add or take away a spelling), saying the sound.",
      "Part 3: the children check: 'say the sounds and listen for the word'. 'Try to turn off your voice … make them do the work!'",
    ],
    stepsConf: "official", errors: { reading: ["misread-sound"], spelling: ["swap-wrong-position"] },
    notes: [
      "Nonsense-word rules: one change at a time; one syllable; only Initial Code single-letter spellings, no < r > after a vowel; vary length and position; no clusters English doesn't use; an occasional real word is fine; no lines needed.",
      "See OFFICIAL_SWAP_CHAINS; the manual's lists (pp. 101–102) are not public.", // TODO(verify): DOSSIER §16.4 q9
    ],
    src: ["sw-l3-tips", "sw-plan-r-2023", "sw-plan-y1-2023", "sw-handbook-2026", "walker-nonwords", "sw-psc-2024"],
  },
  L4: {
    id: "L4", name: "Reading and Spelling Words", aka: ["Word Reading", "Reading in text (2020)", "Sentence Reading"], nameSrc: PLAN,
    purpose: "Read words (and sentences) by saying the sounds and blending; then write them saying the sounds, and re-read.",
    skills: ["blending", "segmenting"], concepts: [1], levels: ["initial-code", "extended-code"],
    use: "Current unit (with Lesson 1 or 5) and review at any level; the script for word-reading progress checks.",
    teacherLanguage: ["Say the sounds and read the word.", "Say the sounds and listen for the word. Stay with my finger.", "Now let's say the sounds (point to each spelling) and read the word (slide your finger along under the word)."],
    steps: [
      "Show a word; the children say the sounds and read it, together and then individually. Tell them 'if they say the sounds, they will be able to hear the word'.",
      "One-to-one: the child puts a finger under each spelling as they say the sounds; repeat 'a bit quicker', then quicker still.",
      "Write the word, 'as always, saying the sounds', then re-read it: 'don't skip the writing element'.",
      "In text: re-read from the start of the sentence as each new word is added.",
    ],
    stepsConf: "official",
    errors: { reading: ["misread-sound", "added-sound", "omitted-sound", "said-separately", "untaught-spelling", "cannot-blend", "special-word", "alternative-sound", "guess", "letter-name"], spelling: ["wrong-spelling", "wrong-order"] },
    notes: ["The official main script is not public; the steps are from official descriptions (YR weeks 1–2, podcast, parent course). Follow-up 'Pass it on': word cards passed round a circle, read and written.", "Words from at least one unit behind for the follow-up."],
    src: ["sw-plan-r-2023", "sw-impl-2020", "sw-parent-course", "sw-handbook-2026", "freshford-yr"],
  },
  L4a: {
    id: "L4a", name: "Dictation", aka: ["Lesson Four(a)", "Quizzing (dictation of single words)"], nameSrc: [...PLAN, "sw-l4a-page"],
    purpose: "Writing in connected text: dictated words, sentences or texts with code from at least two units behind.",
    skills: ["segmenting"], concepts: [1], levels: ["initial-code", "extended-code", "polysyllabic"],
    use: "The connected-text part of the session, at least two units behind the current unit. Single-word 'Quizzing' (IC ≥2, EC ≥4 units behind) is an additional review activity.",
    teacherLanguage: ["Now, I'm going to read the sentence one word at a time. I'd like you to write each word, saying the sounds as you write them."],
    steps: [
      "Read the sentence and make sure it is understood; model any word with untaught code on the board.",
      "Dictate word by word (later, all or part of the sentence); the children say the sounds as they write each word.",
      "The children read back what they wrote, two or three times, while the teacher goes round error-correcting with a whiteboard.",
      "Whiteboards: 'chin it' to show they have finished.",
    ],
    stepsConf: "official",
    errors: { reading: [], spelling: ["spelling-not-known", "letter-name", "impure-sound", "letter-formation", "wrong-order", "wrong-spelling", "valid-alternative-spelling", "missing-sound-in-spelling", "untaught-spelling-in-writing"] },
    notes: ["Examples (2023 planning): Unit 4 week 1 dictates 'A man sat on a map' (Unit 2); Unit 9: 'A fox met a fat hen and the hen bit the fox on the leg.' (Unit 7); Year 1: 'Kate will paint the gate in the rain all day.'", "'Aim to end each Sounds-Write session with reading or with a dictation.'"],
    src: ["sw-l4a-page", "sw-plan-r-2023", "sw-plan-y1-2023", "sw-quizzing", "sw-blog-progress-checks"],
  },
  L5: {
    id: "L5", name: "Word Building", aka: ["Lesson 5: Word Building … or Three Letters (2026 script page, title partly hidden)", "Word building with two-letter spellings"], nameSrc: ["sw-plan-r-2023", "sw-l5-tips"],
    purpose: "Word building for sounds spelled with more than one letter: 'that one sound can be represented by more than one letter' (double consonants in Unit 7; sh, ch, th, ng, ck, wh, tch in Unit 11).",
    skills: ["segmenting", "blending"], concepts: [2], levels: ["initial-code"],
    use: "'Lesson 5 (rather than Lesson 1) would be used when teaching sounds spelled with two letters'; Units 7 and 9–11; < tch > at the end of the Initial Code. Also review.",
    teacherLanguage: ["This is /sh/. Do you remember sometimes we spell a sound with two letters? It's two letters but it's one sound.", "Pull it down and say /sh/ and now say the sounds and read the word please.", "What was the word we wanted? Let's see if we got that word. We can tell by saying the sounds and listening for the word."],
    steps: [
      "As Lesson 1, with the spellings jumbled and a multi-letter spelling on one tile and one line; start with CVC words with the new spelling at the end ('fish').",
      "At the multi-letter spelling, 'use your fingers to gesture the concept of two letters, one sound'.",
      "The children say the sounds and read the word, with the gesture again.",
      "The teacher models writing 'the target sound on one line'; the children write the word saying the sounds and re-read it.",
    ],
    stepsConf: "official", errors: { reading: ["cannot-blend", "said-separately"], spelling: ["wrong-sound-heard", "spelling-not-known"] },
    notes: ["Unit 9 week 2 example: Lesson 5 with fish, mash, ship.", "The full official title is only partly visible."], // TODO(verify): DOSSIER §16.4 q3
    src: ["sw-l5-tips", "sw-plan-r-2023", "sw-impl-2020", "freshford-y1y2"],
  },
  L6: {
    id: "L6", name: "One Sound, Different Spellings – Word Puzzles", aka: ["word-building (Lesson 6)"], nameSrc: PLAN,
    purpose: "Formally teach 'the same sound can be spelled in more than one way': build one word for each spelling of the target sound; sum up 'different spellings of /ae/ NOT different /ae/ sounds!'",
    skills: ["segmenting", "blending"], concepts: [3], levels: ["initial-code", "extended-code"],
    use: "Introduces the Bridging Unit and every Extended Code sound unit (weeks 1–2). Polysyllabic words are never taught with Lesson 6.",
    teacherLanguage: [
      "We are going to find some of the different ways to spell the sound /er/, so what sound are we listening for?",
      "These are the sounds we need to build the word 'world'.",
      "How many different ways do we have on the board to spell the sound /er/?",
      "The spellings are different but the sound is the same.",
    ],
    steps: [
      "Part 1: a child builds a word from jumbled tiles (one sound per tile), saying each sound; everyone says the sounds and reads it; point out the spelling of the target sound; move the word up and out of the way.",
      "Part 3 (after each word): point out that the spellings are different but the sound is the same. Repeat for one word per spelling (EC1: rain, say, great, make).",
      "Part 4: the children read, then write each word saying the sounds, underline the target spelling and show their boards; final summing-up of 'the different spellings of the same sound'.",
      "Part 2 (the split spelling) is dropped since September 2024: 'When you teach Lesson 6 now, simply take out Part 2.' Build 'cave' as c + a + ve and 'gate' as g + a + te.",
    ],
    stepsConf: "official", errors: { reading: ["alternative-sound"], spelling: ["valid-alternative-spelling"] },
    notes: ["Parts 1, 3 and 4 of the post-2024 script have not been published in full; the steps are from the 2021 Top Tips minus Part 2.", "Before the PSC, choose words with adjacent consonants (start, draft)."], // TODO(verify): DOSSIER §16.4 q5
    src: [...PLAN, "sw-l6-tips", "sw-split-2024", "sw-membership-2026", "sw-psc-2024"],
  },
  L7: {
    id: "L7", name: "One Sound, Different Spellings – Reading and Writing", aka: [], nameSrc: PLAN,
    purpose: "Read and write words using the unit's spellings, sorting them into columns by the spelling of the sound; also the end-of-unit word reading and writing check.",
    skills: ["blending", "segmenting"], concepts: [3], levels: ["initial-code", "extended-code"],
    use: "Current unit; Bridging Unit; final days of a unit (with Lesson 4 in the Initial Code).",
    teacherLanguage: ["We are going to read and write some words with the sound /er/ in them. So, what sound are we listening for? (school script)", "Write on this line the way we spell < or > in 'world'. Say /er/ as you write it. (school script)", "This is /er/. (pointing to the target spelling when a child misreads; school script)"],
    steps: [
      "Words from the unit word list (EC1: rain, pain, say, way, great, make, take), written on whiteboards (not cards: that is Lesson 8).",
      "A child reads a word; if they misread, point to the target spelling and say its sound, but don't give the whole word.",
      "Write the spelling of the sound as a column heading, then the word under it, saying the sounds; add a new column for each new spelling.",
    ],
    stepsConf: "school", errors: { reading: ["alternative-sound", "misread-sound"], spelling: ["valid-alternative-spelling"] },
    notes: ["The official main script is not public; follow-up: silly sentences 'on the back page of your main script for Lesson 7'."],
    src: [...PLAN, "sw-blog-cumulative", "sw-impl-2020"],
  },
  L8: {
    id: "L8", name: "Sound Review", aka: [], nameSrc: PLAN,
    purpose: "Review an earlier sound: children place word cards 'in the correct category' (the spelling of the sound) on the board, then copy them.",
    skills: ["blending", "segmenting"], concepts: [3], levels: ["initial-code", "extended-code"],
    use: "Review of earlier sound units; Bridging Unit.",
    teacherLanguage: [],
    steps: [
      "Column headings: the spellings of the sound (members' board, EC25 /o/: < o > and < a >).",
      "Children read each word card and place it under the right spelling ('Words on cards: from Unit 1 word list'; in Y1 Unit 1: 'all words from Bridging Unit for /ch/ < ch > & < tch >').",
      "When the sort is done, children copy the words into a writing book.",
    ],
    stepsConf: "official", errors: { reading: ["alternative-sound"], spelling: ["valid-alternative-spelling"] },
    notes: ["The script itself is not public."], // TODO(verify): DOSSIER §16.4 q4
    src: [...PLAN, "sw-impl-2020", "sw-membership-2026"],
  },
  L9: {
    id: "L9", name: "Seek the Sound", aka: [], nameSrc: PLAN,
    purpose: "Find words with the target sound in a decodable text and write each word and its spelling of the sound.",
    skills: ["blending"], concepts: [3], levels: ["extended-code"],
    use: "Current unit (week 1 or 2) and review; 'most students will be working with a decodable passage'.",
    teacherLanguage: ["Listen carefully for words with the sound /er/. Call out the words when you hear them and I'll underline them. (school script; the same wording in Australian training footage)"],
    steps: [
      "Read the text for enjoyment and comprehension (e.g. 'Crow's Note' for Unit 4; the free Seek the Sounds texts for Units 6, 11, 12).",
      "Read it again one sentence at a time; the children call out words with the sound and the teacher underlines them.",
      "Two columns, 'word' and 'spelling': write each word, saying the sound, and its spelling of the sound.",
    ],
    stepsConf: "school", errors: { reading: ["alternative-sound", "misread-sound"], spelling: [] },
    notes: ["The members' board (EC24 /ar/, 2026) shows the same word/spelling layout."], src: [...PLAN, "sw-membership-2026", "sw-seek-2023", "barleyhill"],
  },
  L10: {
    id: "L10", name: "One Spelling, Different Sounds", aka: [], nameSrc: [...PLAN, "sw-l10-pages"],
    purpose: "Spelling units: 'a spelling can represent more than one sound' (< o > as /o/ and /oe/; < ch > as /ch/, /sh/, /k/).",
    skills: ["phoneme-manipulation", "blending"], concepts: [4], levels: ["extended-code"],
    use: "Introduced in week 2 of the sound unit before the spelling unit (EC3 < ea > in week 2 of EC2), in the current-unit part; then in review; 'a couple of times a unit'.",
    teacherLanguage: [
      "Today we are going to read some words that have this spelling (pointing to < o >).",
      "In this word, what sound is this?",
      "In some words, this spelling can be a different sound.",
      "Does this word have the /o/ sound or the /oe/ sound in it? So, should it go in the column with 'hot' or the column with 'no'?",
      "So, the same spelling can sometimes be the sound /o/ and sometimes the sound /oe/.",
    ],
    steps: [
      "Step 1: write and underline the target spelling; show 'hot': 'In this word, what sound is this?'; start a column headed < o >; add 'Tom'. Then 'no' in a new column: /oe/.",
      "Step 2: read and sort: a child reads a new word; the class decides the column; everyone writes it saying the sounds and reads it. A third sound gets a third column.",
      "Sum up at the end. Target spelling in a different (red) pen.",
    ],
    stepsConf: "official", errors: { reading: ["alternative-sound"], spelling: [] },
    notes: ["'Don't allow students to come up with their own words.' Vet the words for the pupils' accents.", "Helping a pupil: 'It can be /ae/ but, in this word, it's /ee/.'"],
    src: ["sw-l10-pages", ...PLAN, "sw-psc-2024"],
  },
  L11: {
    id: "L11", name: "Building Polysyllabic Words, Sound Level", aka: ["Word Building: Sound Level", "Lesson 11/13: Building Polysyllabic Words (generator screen)"], nameSrc: [...PLAN, "sw-l11-demo"],
    purpose: "Spell polysyllabic words: the teacher splits the word into syllables; children build and write each syllable sound by sound, then the whole word.",
    skills: ["segmenting"], concepts: [1, 2], levels: ["polysyllabic"],
    use: "From week 2 of EC4 in the current-unit part; later in review; the fallback when syllable-level work breaks down.",
    teacherLanguage: [
      "These are all the sounds we need to build the word 'window'. When I say 'window', you can hear two syllables.",
      "What's the first syllable you hear when I say 'window'? … Let's build that syllable.",
      "Now let's say the sounds and read each syllable. Now say the syllables and read the word.",
      "Now let's say the word very precisely in its syllables. Now write the first syllable, 'win', and say all the sounds as you do.",
      "Please say the word again very precisely in its syllables and write the word without the gap between the syllables.",
    ],
    steps: [
      "Tiles for the word's sounds (one sound per tile), jumbled; one line per syllable.",
      "For each syllable: 'What's the first/next syllable you hear…?'; build it; say the sounds and read the syllable.",
      "Step 3, 'Read the word': say the sounds and read each syllable; say the syllables; read the word.",
      "Step 4: say the word precisely in its syllables; write each syllable on its line saying the sounds; then write the whole word without gaps.",
    ],
    stepsConf: "official", errors: { reading: [], spelling: ["imprecise-pronunciation", "valid-alternative-spelling", "schwa-spelling"] },
    notes: ["'Don't be tempted to miss out any of the steps.' Many errors here are of the Initial and Extended Code kinds.", "From the official 2020 demonstration (machine transcript) and the Top Tips; how building splits into Steps 1 and 2 is not shown."], // TODO(verify): DOSSIER §16.12 q1
    src: ["sw-l11-demo", "sw-psw-tips", ...PLAN, "sw-hfw-2023", "sw-tte-psw"],
  },
  L12: {
    id: "L12", name: "Reading Polysyllabic Words, Sound Level", aka: ["Word Reading: Sound Level"], nameSrc: PLAN,
    purpose: "Read polysyllabic words: the teacher puts in the syllable lines; children say the sounds, read up to the line, say the syllable, then read the word.",
    skills: ["blending"], concepts: [1, 2], levels: ["polysyllabic"],
    use: "From week 2 of EC4; later in review; the fallback when syllable-level reading breaks down ('go back to Lesson 12').",
    teacherLanguage: ["Say the sounds and read the syllable; say the syllables and read the word.", "Read up to the line and say the syllable."],
    steps: ["The teacher puts a line between the syllables (frog|man).", "The child says the sounds of the first syllable, reads up to the line and says the syllable; then the next.", "The child says the syllables and reads the word; notice where the word said normally has a schwa ('the ideal time to practise locating schwas')."],
    stepsConf: "official", errors: { reading: ["reads-through", "syllable-break", "misread-sound"], spelling: [] },
    notes: ["A step-by-step script is not public; the procedure is from doc 47 and two official demonstrations."], // TODO(verify): DOSSIER §16.12 q1
    src: ["sw-doc47", "sw-psw-intro-2024", "sw-autobiographical", ...PLAN, "sw-tte-psw"],
  },
  L13: {
    id: "L13", name: "Building Polysyllabic Words, Syllable Level", aka: ["Lesson Thirteen: Building Polysyllabic Words (error-correction sheet)"], nameSrc: ["sw-plan-y2-2023", "sw-tte-psw"],
    purpose: "Spell polysyllabic words syllable by syllable; the children take over splitting the word, saying syllables rather than sounds.",
    skills: ["segmenting"], concepts: [1, 2, 3], levels: ["polysyllabic"],
    use: "'When students are achieving a reasonable level of proficiency'; not one-way: go back to Lessons 11–12 for longer or rarer words.",
    teacherLanguage: ["You don't need to say the sounds any more, I want you to say the syllable."], steps: [], stepsConf: "official",
    errors: { reading: [], spelling: ["syllable-division", "sounding-when-building", "valid-alternative-spelling"] },
    notes: ["No step-by-step script is public; only the error corrections."], // TODO(verify): DOSSIER §16.12 q1
    src: ["sw-tte-psw", "sw-plan-y2-2023", "sw-psw-intro-2024", "sw-podcast-ep20"],
  },
  L14: {
    id: "L14", name: "Reading Polysyllabic Words", aka: ["Lesson Fourteen: Reading Polysyllabic Words", "Lesson 14 - Reading PSWs syllable level (practice map)"], nameSrc: ["sw-tte-psw"],
    purpose: "Read polysyllabic words syllable by syllable, the children finding the syllable breaks themselves.",
    skills: ["blending"], concepts: [1, 2, 3], levels: ["polysyllabic"],
    use: "With Lesson 13; recommended over Lesson 12 as PSC practice.",
    teacherLanguage: ["Let's say it again precisely in its syllables.", "You need to say the sounds and listen until you hear a syllable and say the syllable."], steps: [], stepsConf: "official",
    errors: { reading: ["imprecise-pronunciation", "syllable-break", "syllable-wrong-sound", "reads-through"], spelling: ["valid-alternative-spelling", "capital-letter", "schwa-spelling"] },
    notes: ["If a child keeps struggling, 'the teacher has moved on too fast and needs to go back to Lesson 12'. No step-by-step script is public."], // TODO(verify): DOSSIER §16.12 q1
    src: ["sw-tte-psw", "sw-psw-intro-2024"],
  },
  L15: {
    id: "L15", name: "Analysing Polysyllabic Words", aka: [], nameSrc: ["sw-psw-tips", "sw-l15-tips"],
    purpose: "Analyse the hard spellings in a polysyllabic word the children can already read (including schwas), analogised to easy words with the same spelling; also subject vocabulary.",
    skills: ["segmenting"], concepts: [3, 4], levels: ["polysyllabic"],
    use: "Review in Years 1–2; central from Year 3; tangential teaching and domain vocabulary. Never to introduce new words (use Lessons 11–14).",
    teacherLanguage: [
      "Say the word very precisely in its syllables.",
      "Are there any sounds in [syllable] that you might find difficult to spell?",
      "That's the same sound, but it is a different spelling. (a child offers 'monkey' for < y > in 'happy')",
      "That's the same spelling, but it represents a different sound in this word. (a child offers 'yes')",
    ],
    steps: [
      "Part 1: choose a word the children can read with ease.",
      "Part 2: say it precisely in its syllables; for each syllable ask about sounds that might be difficult to spell; underline the spelling; find other words with it ('happy': silly, funny, daddy).",
      "Part 4: rub the word out; the children say it precisely in its syllables and write each syllable (saying the sounds or the syllables, depending on confidence).",
    ],
    stepsConf: "official", errors: { reading: [], spelling: ["schwa-spelling", "valid-alternative-spelling"] },
    notes: ["Part 3 is missing from the public Top Tips.", "Scope and sequence: 'we also analyse spelling difficulties in Polysyllabic Words, including schwas'."], // TODO(verify): DOSSIER §16.12 q3
    src: ["sw-l15-tips", "sw-psw-tips", "sw-ss-psw", "sw-handbook-2026", "barleyhill"],
  },
};

/** A Sounds~Write session (2023 planning guidance; Handbook 2026): daily, 30 minutes, three parts, "3 or 4 Sounds-Write
 *  lessons" (DOSSIER §5). */
export const SESSION = {
  minutes: 30,
  firstWeeks: "At the very start of Reception sessions may be only 10 minutes, building to 30 by the end of Unit 1 (2023 plan; the official blog: all classes by the end of Unit 4). The 2026 accreditation audit asks for 'a minimum of 20 minutes … from the outset'.",
  parts: [
    {
      id: "review", text: "Begin each phonics session by reviewing previously taught content.",
      lessons: { "initial-code": ["L2", "L3", "L4", "L5"], "extended-code": ["L3", "L4", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15"] } as Partial<Record<SwLevelId, SwLessonId[]>>,
      plus: ["Quizzing (dictation of single words; IC words ≥2 units behind, EC ≥4)", "SpeedRead (fluency; '20 words read correctly in 30 seconds = achieved')"],
    },
    {
      id: "current-unit", text: "Then teach the current unit.",
      lessons: { "initial-code": ["L1", "L4", "L5", "L6", "L7", "L8"], "extended-code": ["L6", "L7", "L9", "L10", "L11", "L12"] } as Partial<Record<SwLevelId, SwLessonId[]>>,
      plus: ["Initial Code: Lessons 1 and 4 (Lesson 5 for sounds spelled with two letters; Lesson 6, then 7 and 8, for the Bridging Unit).", "Extended Code: Lessons 6, 7 and 9; Lesson 10 when a spelling unit is introduced; Lessons 11 and 12 when polysyllabic words are introduced."],
    },
    {
      id: "connected-text", text: "Finish with an opportunity for reading or writing in connected text.",
      lessons: { "initial-code": ["L4", "L4a"], "extended-code": ["L4", "L4a"] } as Partial<Record<SwLevelId, SwLessonId[]>>,
      plus: ["Reading: decodable texts one unit behind the current unit.", "Writing: Lesson 4a dictation at least two units behind.", "Home readers: two units behind (read in school first)."],
    },
  ],
  /** Handbook 2026: "3 or 4 Sounds-Write lessons"; the public planning page says two or three; every official example
   *  week uses three. Freshford: "3 component parts from a choice of 6". (DOSSIER §16.7 q1) */
  lessonsPerSession: [3, 4] as [number, number],
  /** Years 4–6: 2–3 discrete 15-minute spelling sessions a week (Handbook); Year 3 daily, length not given */
  ks2: "Year 3 (and Year 4 if necessary): daily review of the Extended Code, one sound a week. Years 4–6: 2–3 × 15-minute discrete sessions a week plus tangential teaching across the curriculum.",
  src: ["sw-handbook-2026", "sw-plan-r-2023", "sw-plan-y1-2023", "sw-plan-y2-2023", "sw-planning", "grange-2024", "freshford-yr"] as SourceId[],
};

/** Sound Swap chains from the 2023 planning guidance (real words, then nonsense words from Unit 8). */
export const OFFICIAL_SWAP_CHAINS: { unit: SwUnitId; chain: string[]; nonsense: boolean; src: SourceId }[] = [
  { unit: "IC3", chain: ["bag", "tag", "sag", "sat", "cat", "mat"], nonsense: false, src: "sw-plan-r-2023" },
  { unit: "IC3", chain: ["bat", "bit", "big", "pig", "pit"], nonsense: false, src: "sw-plan-r-2023" },
  { unit: "IC8", chain: ["blop", "blip", "brip", "bip", "bop", "lop"], nonsense: true, src: "sw-plan-r-2023" },
  { unit: "IC8", chain: ["clop", "cop", "op", "ip", "ipt", "lipt"], nonsense: true, src: "sw-plan-r-2023" },
  { unit: "IC11", chain: ["trop", "brop", "shrop", "shrip", "shrib", "shrob"], nonsense: true, src: "sw-plan-r-2023" },
  { unit: "IC11", chain: ["shlot", "blot", "bot", "bosh", "tosh", "trosh"], nonsense: true, src: "sw-plan-r-2023" },
  { unit: "IC11", chain: ["prosh", "plosh", "plish", "plash", "prash", "trash", "brash"], nonsense: true, src: "sw-plan-r-2023" },
  { unit: "IC11", chain: ["chim", "cham", "ram", "dram", "drim", "drish", "frish", "frosh"], nonsense: true, src: "sw-plan-y1-2023" },
  { unit: "IC8", chain: ["grop", "glop", "gop", "op", "nop", "snop"], nonsense: true, src: "walker-nonwords" },
];

// =============================================================================================== assessment

export interface Assessment {
  id: string;
  name: string;
  what: string;
  how: string[];
  when: string;
  src: SourceId[];
  conf: Tier;
}

/** Assessment (DOSSIER §13). Formative assessment is the main form; progress checks are "in addition to, not as a
 *  replacement for" it. No official per-child pass mark exists for any check. */
export const ASSESSMENTS: Assessment[] = [
  {
    id: "formative", name: "Ongoing formative assessment ('responsive teaching')", what: "Every lesson: questioning, listening to reading, what pupils write, common errors, quizzes; minute-by-minute decisions on what to re-teach.",
    how: [
      "Handbook questions: how secure are code knowledge, conceptual knowledge, and segmenting, blending and manipulation ('with special emphasis in the Initial Code on segmenting and blending adjacent consonants')? How well do pupils write and read? How much scaffolding (lines, gestures, script) do they need?",
      "Live signals: frequent error correction means pupils are 'still in that learning pit'; reading the word without saying the sounds shows automaticity.",
      "If two pupils can't answer, re-teach; stop practice that goes wrong.",
    ],
    when: "every session", src: ["sw-handbook-2026", "sw-general-points", "sw-blog-cumulative", "sw-blog-psc-midyear"], conf: "official",
  },
  {
    id: "end-of-unit", name: "End-of-unit check", what: "Whether the unit's sound–spelling correspondences are mastered.",
    how: [
      "Final days of each two-week unit: Lesson 4 (Initial Code) or Lesson 7 (Extended Code).",
      "Extended Code expectation: by the end of a unit all can name the sound and about 90% can engage in Lessons 6 and 7; by the end of the next unit over 80% read the spellings in connected text; spelling transfer begins after a 5–7 unit lag.",
    ],
    when: "final days of each unit", src: ["sw-blog-cumulative", "sw-plan-y1-2023", "sw-plan-y2-2023"], conf: "official",
  },
  {
    id: "move-on", name: "Move-on rule", what: "When to start the next unit.",
    how: [
      "'Moving on when 75-80% of your class has achieved 75-80% proficiency in the current unit'; 'it is not necessary for 100% of students to have mastered 100% of the sound-spelling correspondences' (blog, Dec 2024). Handbook: 'around 80% of the class'.",
      "Before the Extended Code, skills 'should be perfect or near perfect'; for classes new to the programme, start the Extended Code 'when, and only when' most of the class have 80% accuracy segmenting, blending and manipulating Initial Code words.",
      "Children below the band get scaffolding in class (easier word structures, e.g. 'red' not 'bread') and keep-up or catch-up interventions outside the lesson; the class keeps the pace.",
    ],
    when: "end of each unit", src: ["sw-blog-cumulative", "sw-handbook-2026", "sw-y1-new-2024", "sw-tracking-form-2020"], conf: "official",
  },
  {
    id: "progress-checks", name: "Progress checks (2026)", what: "What pupils can do independently; who is not making expected progress and what they need.",
    how: [
      "Choose the check by the last unit completed. Initial Code: 11 checks, none before Unit 3 (Unit 3 → check 1 … Unit 11 → check 9; halfway through the Bridging Unit → 10; Bridging Unit → 11). Extended Code: 38 checks, one per sound unit (Unit 1 → 1 … Unit 49 → 38); a spelling unit shares the check of the sound unit before it. See PROGRESS_CHECKS.",
      "Word reading, one-to-one, with the Lesson 4 script ('Say the sounds and read the word'); after an unsuccessful attempt, a Teaching Through Errors script, but the word is still noted as an error. Initial Code: six words rising to ten; Extended Code: 20 words.",
      "Word dictation, whole class in the Review part ('The word is trick. Sam played a trick on me. Write the word trick, say the sounds as you do.'); Extended Code adds one sentence with the Lesson 4(a) script. Lags: at least one unit for reading, two for spelling.",
      "Recording: ✔ read correctly; underline code recognised but not blended; circle unfamiliar code. Spreadsheets: reading Y / N / S (segmenting not blending) / R (read on further attempts); spelling C / I / N / S. Only accept a word 'correctly spelled in its entirety'.",
      "Progress Tracker (members, from September 2026): word reading only, tags 'No attempt', 'Unable to blend', 'Guess', and per spelling 'Not said', 'Wrong sound', 'Letter name', 'Said separately', plus '+ Sound added'. Score is a plain fraction; no pass band.",
    ],
    when: "every 6–8 weeks", src: ["sw-checks-ic-2026", "sw-checks-ec-2026", "sw-checks-faq-2026", "sw-tracker", "sw-handbook-2026", "sw-blog-progress-checks"], conf: "official",
  },
  {
    id: "mastery-timeline", name: "Mastery timeline (Initial Code, 2020)", what: "When most Tier 1 children should be secure in each skill for a unit.",
    how: ["Recognise code, read and write single words (Lessons 1 & 2): end of the unit.", "Read code fluently (Lesson 4, decodable books) and manipulate code (Lesson 3): end of the next unit or mid the one after.", "Write code in connected text (Lesson 4a): end of the unit three later.", "'You should not expect the majority of Tier 1 students to be achieving 80% accuracy as soon as you teach a specific unit.'"],
    when: "Units 1–7; for Units 8–11 'timelines … will vary'", src: ["sw-impl-2020"], conf: "official",
  },
  {
    id: "quizzing", name: "Quizzing", what: "Single-word spelling from memory: spaced practice for long-term memory.",
    how: ["A short 'warmer' in the Review part: four to six words in Reception, more from Year 1.", "Words at least two units behind in the Initial Code and at least four behind in the Extended Code ('recall memory is a deeper kind of memory than recognition memory').", "Error-correct as you move round or after the last word."],
    when: "Review part, regularly", src: ["sw-quizzing", "sw-handbook-2026"], conf: "official",
  },
  {
    id: "speedread", name: "SpeedRead", what: "Fluency with words already taught.",
    how: ["'Can you read 10 (or 20) words correctly in 30 seconds?' Criterion: '20 words read correctly in 30 seconds = achieved'.", "Units 1–7 sheets print 10 words; Units 9–10 and most Unit 11 sheets print 20. If there is no improvement after 3 or 4 attempts, reduce the words or add time.", "Follow up by spelling the same words, saying the sounds."],
    when: "optional warm-up in Review", src: ["sw-speedread"], conf: "official",
  },
  {
    id: "diagnostic", name: "Diagnostic tests: Criterion-Referenced Phoneme Skills Tests and Alphabet Code Knowledge Test",
    what: "Skills (blending, segmenting, phoneme deletion) and code knowledge, for pupils falling behind or new to the school. Not for Reception, not for whole classes.",
    how: [
      "Blending (14 words): 'I'm going to say some sounds and I want you to put them together to make a word' — sounds one second apart (d-o-g … c-l-o-s-ed).",
      "Segmenting (20 words, scored per sound, /69): real and nonsense words.",
      "Phoneme deletion (/10): 'Say speed without the p' (seed).",
      "Alphabet Code Knowledge (/50): the sound(s) of a spelling in words (ea: beak / break / bread).",
      "Give it without prompts or second attempts. Placement: 'skills take precedence over code knowledge'; a pupil secure in the code who cannot segment and blend adjacent consonants starts at Initial Code Unit 8.",
    ],
    when: "as needed; re-test after about three months, then every 6–12 months", src: ["sw-diagnostic", "sw-handbook-2026", "sw-plan-y1-2023", "springgardens"], conf: "official",
  },
  {
    id: "adapted-psc", name: "Adapted Phonics Screening Checks", what: "PSC-style checks limited to code taught so far.",
    how: ["One with Initial Code only (first month of Year 1).", "Two with code up to Extended Code Unit 8 or 9 (usually December or January of Year 1).", "No official pass mark; one case-study school used 19/21 and 30/35."], when: "Year 1",
    src: ["sw-blog-psc-midyear", "sw-handbook-2026"], conf: "official",
  },
  {
    id: "psc", name: "Phonics Screening Check (DfE)", what: "40 words (20 real, 20 pseudo); threshold 32. Heavy on adjacent consonants; includes polysyllabic words.",
    how: ["Pseudo-words: accept any plausible sound for a spelling with more than one (meast: /ee/ or /ae/).", "Children who cannot blend CVC words by the end of Unit 3 are 'likely to struggle to pass the PSC'; any child who cannot independently segment and blend by Unit 4 is at risk."], when: "June of Year 1",
    src: ["sw-blog-psc-2024", "sw-psc-2024", "sw-blog-pa", "sw-psc-reflective-2026"], conf: "official",
  },
  {
    id: "freshford-lists", name: "Freshford spelling lists and tests", what: "Reception: unit word lists plus special words. Years 1–2: the spellings of the target sound and words using them, plus special words.",
    how: ["Reception: lists checked fortnightly, 1:1 at first, then small groups.", "Years 1–2: weekly test; expect all or almost all right; retest next week if not; move on every 2–3 weeks regardless."],
    when: "fortnightly (R), weekly (Y1–2)", src: ["freshford-yr", "freshford-y1y2"], conf: "school",
  },
];

/** Which progress check to use after each unit (2026). Initial Code checks read and dictate the two or three units
 *  before; Extended Code checks read with at least a one-unit lag and dictate with at least two (DOSSIER §13.5). */
export const PROGRESS_CHECKS: { level: "initial-code" | "extended-code"; check: number; afterUnit: SwUnitId; alsoAfter?: SwUnitId; note?: string }[] = [
  ...[3, 4, 5, 6, 7, 8, 9, 10, 11].map((u, i) => ({ level: "initial-code" as const, check: i + 1, afterUnit: `IC${u}` as SwUnitId })),
  { level: "initial-code", check: 10, afterUnit: "BR", note: "halfway through the Bridging Unit" },
  { level: "initial-code", check: 11, afterUnit: "BR", note: "after the Bridging Unit" },
  ...[1, 2, 4, 6, 7, 8, 10, 11, 12, 14, 16, 18, 19, 20, 21, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 40, 42, 43, 44, 45, 46, 47, 48, 49].map((u, i) => {
    const spelling: Record<number, number> = { 2: 3, 4: 5, 8: 9, 12: 13, 14: 15, 16: 17, 21: 22, 25: 26, 30: 31, 38: 39, 40: 41 };
    return { level: "extended-code" as const, check: i + 1, afterUnit: `EC${u}` as SwUnitId, ...(spelling[u] ? { alsoAfter: `EC${spelling[u]}` as SwUnitId } : {}) };
  }),
];

// =============================================================================================== pacing

export interface Milestone { year: "R" | 1 | 2 | 3 | 4 | 5 | 6; when: string; unit: SwUnitId; text: string; src: SourceId[]; conf: Tier }

export const PACING = {
  weeksPerUnit: 2,
  weeksPerUnitText: "Each current unit should last for approximately two weeks (Initial and Extended Code). Extended Code sound units with fewer spellings may take one week: 7, 8, 23, 25 (Year 1) and 29, 30, 35, 44, 46 (Year 2).",
  /** Handbook 2026. The 10.2024 Year 1 catch-up guidance lists 7, 8, 12, 14 and 23 instead (DOSSIER §14.9, §16.16 q2). */
  oneWeekUnits: [7, 8, 23, 25, 29, 30, 35, 44, 46],
  /** Extended Code spelling units run parallel to sound units ("Unit 3 < ea > would be taught at the beginning of the second week of Unit 2") */
  spellingUnitsRunInParallel: true,
  milestones: [
    { year: "R", when: "first 14–16 weeks", unit: "IC7", text: "aim to cover Units 1-7 in the first 14 – 16 weeks of school", src: ["sw-blog-cumulative"], conf: "official" },
    { year: "R", when: "end of autumn term", unit: "IC7", text: "Unit 6 or Unit 7 by the end of the Autumn Term", src: ["sw-handbook-2026", "sw-plan-r-2023"], conf: "official" },
    { year: "R", when: "end of Unit 3 / early Unit 4", unit: "IC3", text: "identify children not competent with Units 1-2 for keep-up support; children who cannot blend CVC words by the end of Unit 3 are 'likely to struggle to pass the PSC'", src: ["sw-plan-r-2023", "sw-psc-2025-blog"], conf: "official" },
    { year: "R", when: "around Easter", unit: "IC10", text: "reading and spelling words like 'lift' (CVCC), 'frog' (CCVC), 'swift' (CCVCC) and 'scrap' (CCCVC), until their skills are perfect or near perfect", src: ["sw-psc-2024"], conf: "official" },
    { year: "R", when: "end of spring term / start of summer", unit: "IC11", text: "Unit 11 by the end of the Spring Term or the start of the Summer Term", src: ["sw-handbook-2026", "sw-plan-r-2023"], conf: "official" },
    { year: "R", when: "summer term", unit: "BR", text: "Bridging Unit & consolidation: the Bridging Unit taught alongside review, practice and consolidation of the Initial Code units", src: ["sw-handbook-2026", "sw-plan-r-2023"], conf: "official" },
    { year: 1, when: "autumn term", unit: "EC9", text: "Review of Initial Code; Extended Code Units 1-9; Introduction of polysyllabic words (the 2023 grid starts Unit 1 in week 3)", src: ["sw-handbook-2026", "sw-plan-y1-2023"], conf: "official" },
    { year: 1, when: "week 2 of EC4", unit: "PW1", text: "Polysyllabic words should be introduced at around the second week of Unit 4 /oe/.", src: ["sw-handbook-2026", "sw-psw-intro-2024"], conf: "official" },
    { year: 1, when: "start, end of autumn, start of spring", unit: "EC8", text: "three adapted PSCs: Initial Code only in the first month; two with code up to Unit 8 in December or January", src: ["sw-handbook-2026", "sw-blog-psc-midyear"], conf: "official" },
    { year: 1, when: "spring term", unit: "EC18", text: "Extended Code Units 10-18", src: ["sw-handbook-2026", "sw-plan-y1-2023"], conf: "official" },
    { year: 1, when: "summer term / end of Year 1", unit: "EC26", text: "Extended Code Units 19-26; 'Aim to have taught Unit 26 by the end of Year 1' (code for 233 of the 300 Letters and Sounds HFWs taught)", src: ["sw-handbook-2026", "sw-plan-y1-2023", "sw-hfw-2025"], conf: "official" },
    { year: 2, when: "autumn term", unit: "EC34", text: "Extended Code Units 27-34", src: ["sw-handbook-2026", "sw-plan-y2-2023"], conf: "official" },
    { year: 2, when: "spring term", unit: "EC42", text: "Extended Code Units 35-42", src: ["sw-handbook-2026", "sw-plan-y2-2023"], conf: "official" },
    { year: 2, when: "summer term / end of Year 2", unit: "EC49", text: "Extended Code Units 43-49 (Units 48 & 49 share weeks 11-12); 'Unit 49 by the end of Year 2'", src: ["sw-handbook-2026", "sw-plan-y2-2023"], conf: "official" },
    { year: 3, when: "Year 3", unit: "PW7", text: "daily review of the Extended Code, a week per sound, First and More spellings combined (33 'sound' units); polysyllabic words from taught units", src: ["sw-handbook-2026"], conf: "official" },
    { year: 4, when: "Year 4", unit: "PW8", text: "Year 3-style review only if necessary; otherwise 2-3 × 15-minute discrete sessions a week", src: ["sw-handbook-2026"], conf: "official" },
    { year: 5, when: "Years 5–6", unit: "PW9", text: "2-3 × 15-minute sessions a week: domain-specific vocabulary, statutory spellings, tangential teaching (Lessons 15 and 10)", src: ["sw-handbook-2026"], conf: "official" },
  ] as Milestone[],
  /** Reception term plan (Handbook 2026 and the 2023 planning guidance; a 14-week autumn term assumed) */
  receptionTerms: [
    { term: "autumn", units: "IC1–IC7, 2 weeks each (Unit 6 or 7 by the end of term)" },
    { term: "spring", units: "IC8; IC9 (week 1 continuant clusters, week 2 non-continuants + < sh > in CVC); IC10 + < ch >; then IC11 spellings one by one (2023 plan: th, ng, ck, wh, tch, q & u; < ve > from September 2024)" },
    { term: "summer", units: "Bridging Unit (/k/, /ch/, /w/, /v/), about a week per sound, with consolidation of the Initial Code" },
  ],
  /** Year 3 (Handbook 2026): First and More spellings combined, one week per sound */
  year3Terms: [
    { term: "autumn", units: "EC1–EC17, with More spellings Units 27, 29, 32, 34, 36 combined into their First spellings units" },
    { term: "spring", units: "EC18–EC37, with Unit 43 combined into Unit 19" },
    { term: "summer", units: "EC38–EC49" },
  ],
  /** lags between teaching new code and using it (official; DOSSIER §13.4, §14.5) */
  lags: {
    reviewSymbolSearchSoundSwap: "Lessons 2 and 3 review code with a one-unit lag (may start in week 2 of the current unit).",
    readingInConnectedText: 1,
    writingInConnectedText: 2,
    homeReaders: 2,
    /** quizzing: 'at least two units behind … in the Initial Code and at least four units behind … in the Extended Code' */
    quizzingInitialCode: 2,
    quizzingExtendedCode: 4,
    /** progress checks: at least one unit for reading, two for spelling */
    checkReading: 1,
    checkSpelling: 2,
    /** Extended Code: 'around a 5-7 unit lag before accuracy of spelling is beginning to be achieved' */
    extendedCodeSpellingAccuracy: [5, 7] as [number, number],
    /** Initial Code (2020): dictation mastery three units after teaching */
    initialCodeDictationMastery: 3,
    /** polysyllabic review of Extended Code spellings: from about Unit 8; in the 2026 checks about 4–7 units behind */
    polysyllabicReview: [4, 7] as [number, number],
  },
  conflicts: [
    "Year 1 end point: 'first 25 units' (HFW documents) vs Unit 26 (Handbook, planning guidance, PSC analysis). The Handbook is current.",
    "The Initial Code finished 'by Easter' (2020, HFW) vs Unit 11 'by the end of the Spring Term or the start of the Summer Term' (Handbook). The Handbook is current.",
    "One-week Year 1 units: 7, 8, 23, 25 (Handbook) vs 7, 8, 12, 14, 23 (10.2024 Year 1 guidance); the Handbook gives no updated week grid.", // TODO(verify): DOSSIER §16.16 q1–q2
    "Dictation lag: 1 unit (older manual page), at least 2 (2023 plans, Handbook), 2–3 (podcasts), 3–4 (2020 tracking form). Current: at least 2.",
  ],
  src: ["sw-handbook-2026", "sw-plan-r-2023", "sw-plan-y1-2023", "sw-plan-y2-2023", "sw-impl-2020", "sw-blog-cumulative", "sw-hfw-2025", "sw-quizzing", "sw-checks-faq-2026"] as SourceId[],
};

/** Freshford's own timeline (Y1/Y2 parents' deck, 'Initial Code to Extended Code … a journey'). Differs from the
 *  official order: EC5, 9, 13, 15, 17, 22, 25, 26 and 39 are not named, and Reception summer starts some EC spellings. */
export const FRESHFORD_TIMELINE: { year: "R" | 1 | 2; term: "autumn" | "spring" | "summer"; text: string; units: SwUnitId[] }[] = [
  { year: "R", term: "autumn", text: "Phase 1 rhymes and alliteration; Initial code: s a t i m, n o p, b c g h, d e f v, k l r u; Special words: is a A the I to for of are was", units: ["IC1", "IC2", "IC3", "IC4", "IC5"] },
  { year: "R", term: "spring", text: "Initial code: jwzxy ll zz ff ss ck ch sh th ng qu; Adjacent consonants: vcc cvcc ccvc ccvcc cccvcc; Two syllable words, compound words; Special words: all, my, me, she, he, we, be, go, no, said, come, some, have, you, your, her, like, saw", units: ["IC6", "IC7", "IC8", "IC9", "IC10", "IC11", "PW1"] },
  { year: "R", term: "summer", text: "Initial code: wh ph; Begin Extended code: /ae/ /ee/ /oo/ /igh/; Special words: where when what who there their these + consolidate all YR words", units: ["IC11", "EC1", "EC2", "EC10", "EC11"] },
  { year: 1, term: "autumn", text: "Revise adjacent consonants, compound words and YR special words; Extended code: /ae/ /ee/ <ea> /oe/ /er/ /e/ /ow/", units: ["EC1", "EC2", "EC3", "EC4", "EC6", "EC7", "EC8"] },
  { year: 1, term: "spring", text: "Extended code: /oy/ /oo/(moon) /ue/ /oo/(book) /ie/ /or/ /u/ /ar/", units: ["EC23", "EC10", "EC21", "EC12", "EC11", "EC19", "EC14", "EC24"] },
  { year: 1, term: "summer", text: "Extended code: /s/ /air/ /l/", units: ["EC16", "EC20", "EC18"] },
  { year: 2, term: "autumn", text: "Extended code: /d/ /i/ <y> /n/ plus more spellings of /ae/ /ee/ /oe/ /er/", units: ["EC28", "EC30", "EC31", "EC33", "EC27", "EC29", "EC32", "EC34"] },
  { year: 2, term: "spring", text: "Extended code: /v/ /j/ /g/ /f/ <gh> /m/ plus more spellings of /oo/ (moon) /or/ /ar/ /k/", units: ["EC35", "EC37", "EC38", "EC40", "EC41", "EC42", "EC36", "EC43", "EC45"] },
  { year: 2, term: "summer", text: "Extended code: /h/ /r/ /t/ /z/ /eer/", units: ["EC44", "EC46", "EC47", "EC48", "EC49"] },
];

/** Freshford's special words (school). */
export const FRESHFORD_SPECIAL_WORDS = {
  reception: ["is", "a", "the", "I", "to", "for", "of", "are", "was", "my", "me", "we", "be", "she", "he", "said", "all", "come", "some", "go", "no", "have", "you", "your", "yours", "her", "like", "when", "what", "where", "they", "there", "these", "who"],
  year1and2: ["ask", "by", "do", "friend", "full", "here", "house", "love", "once", "one", "our", "pull", "push", "put", "says", "school", "so", "today", "were", "beautiful", "because", "busy", "children", "Christmas", "climb", "clothes", "could", "everybody", "eye", "even", "father", "find", "floor", "great", "improve", "many", "money", "Mr", "Mrs", "only", "parents", "people", "pretty", "prove", "sugar", "sure", "water", "whole", "wild"],
  src: ["freshford-yr", "freshford-y1y2"] as SourceId[],
};

/** Freshford's key phrases for parents (Y1/Y2 deck) and pronunciation notes (both decks). */
export const FRESHFORD_LANGUAGE = {
  phrases: ["two letters, one sound", "three letters, one sound", "four letters, one sound", "split spelling (gate, also written as a-e)", "that's a spelling of the sound…", "does that make sense? Try sounding it a different way?", "Say the sounds, read the word.", "say the sound, write the word"],
  pronunciation: ["no extra 'uh': 'mmm' not 'muh', 'sss' not 'suh'", "w = wwwoo not wuh", "y = yyee not yuh", "qu = cooo not cwuh, or … new this year… q = k + u = w"],
  letterNames: "Not used until late in Reception; used in Year 1 to tell single sounds from 'two letters one sound'.",
  src: ["freshford-yr", "freshford-y1y2"] as SourceId[],
};

/** Official PSC guidance (England, 09.2024) for adjusting Year 1 (DOSSIER §9.13). */
export const PSC_ADJUSTMENTS: { text: string; units: SwUnitId[]; gpcs?: SpellingRef[] }[] = [
  { text: "When teaching Unit 2 /ee/, include the less common < ie > spelling as in 'chief' (2023 edition: and < e-e > as in 'scheme').", units: ["EC2"], gpcs: [{ g: "ie", p: "ee" }, { g: "e-e", p: "ee" }] },
  { text: "When teaching Unit 4 /oe/, include the less common < ou > spelling as in 'mould'.", units: ["EC4"], gpcs: [{ g: "ou", p: "oe" }] },
  { text: "Teach < ph > for /f/ as in 'phone' and 'photo' within Unit 4 /oe/.", units: ["EC4"], gpcs: [{ g: "ph", p: "f" }] },
  { text: "When teaching Unit 10 /oo/, include the < ou > spelling as in 'you'.", units: ["EC10"], gpcs: [{ g: "ou", p: "oo" }] },
  { text: "Tangentially teach < ch > as a spelling of /sh/ (chef); use Lesson 10 for < ch > as /ch/, /sh/, /k/ (lunch, chef, school).", units: ["EC45"], gpcs: [{ g: "ch", p: "sh" }, { g: "ch", p: "k" }] },
  { text: "Tangentially teach < g > for /j/ as in 'gem'.", units: ["EC37"], gpcs: [{ g: "g", p: "j" }] },
  { text: "Tangentially teach < s > for /z/ as in 'hens'.", units: ["EC17"], gpcs: [{ g: "s", p: "z" }] },
  { text: "Tangentially teach < c > for /s/ as in 'cell'.", units: ["EC16"], gpcs: [{ g: "c", p: "s" }] },
  { text: "Consider moving Unit 20 /air/ and Unit 24 /ar/ earlier in the year.", units: ["EC20", "EC24"] },
  { text: "Consider moving Unit 23 /oy/ to be covered along with Unit 8 /ow/.", units: ["EC23", "EC8"] },
  { text: "Units 16, 18, 19, 20: teach all spellings with Lesson 6, then focus Lessons 7, 8 and 9 on the PSC spellings; return to all spellings after the PSC.", units: ["EC16", "EC18", "EC19", "EC20"] },
  { text: "Leave < sc > for /s/ in Unit 16 until after the PSC.", units: ["EC16"] },
  { text: "Teach < er > for the schwa sound in polysyllabic lessons (farmer, baker, faster, after).", units: ["PW6"], gpcs: [{ g: "er", p: "schwa" }] },
  { text: "In nonsense words, accept the alternatives: 'meast' with < ea > as /ee/ or /ae/; 'strow' with < ow > as /ow/ or /oe/.", units: [] },
];

/** Tangential teaching (official sheet, 09.2024, linked from the Handbook): spellings to point out when they come up,
 *  alongside a unit, without formal teaching. "Early on, the teacher will simply take responsibility for the word …
 *  Teachers should be judicious in their choice of what is taught so as not to overload students' working memories."
 *  None of these is in gpcsOfUnit; a word using one is decodable only with the teacher's (or Sensei's) help. */
export const TANGENTIAL_TEACHING: { unit: SwUnitId; gpcs: SpellingRef[]; words: string[]; formally?: SwUnitId }[] = [
  { unit: "EC1", gpcs: [{ g: "ey", p: "ae" }, { g: "eigh", p: "ae" }], words: ["they"], formally: "EC27" },
  { unit: "EC4", gpcs: [{ g: "ph", p: "f" }, { g: "kn", p: "n" }, { g: "wr", p: "r" }], words: ["phone", "know", "wrote"] },
  { unit: "EC6", gpcs: [{ g: "g", p: "j" }], words: ["germ"], formally: "EC37" },
  { unit: "EC10", gpcs: [{ g: "ou", p: "oo" }, { g: "ch", p: "k" }, { g: "tw", p: "t" }], words: ["you", "school", "two"] },
  { unit: "EC11", gpcs: [{ g: "eigh", p: "ie" }], words: ["height"] },
  { unit: "EC14", gpcs: [{ g: "oo", p: "u" }, { g: "gh", p: "f" }], words: ["blood", "flood", "rough", "tough"] },
  { unit: "EC19", gpcs: [{ g: "our", p: "or" }], words: ["four", "fourth", "your"], formally: "EC43" },
  { unit: "EC20", gpcs: [{ g: "ayer", p: "air" }, { g: "ayor", p: "air" }], words: ["prayer", "mayor"] },
  { unit: "EC24", gpcs: [{ g: "ear", p: "ar" }], words: ["heart"] },
  { unit: "EC25", gpcs: [{ g: "ou", p: "o" }], words: ["cough"] },
  { unit: "EC27", gpcs: [{ g: "gn", p: "n" }, { g: "aigh", p: "ae" }], words: ["reign", "straight"] },
  { unit: "EC28", gpcs: [{ g: "dh", p: "d" }], words: ["dhal", "Gandhi"] },
  { unit: "EC29", gpcs: [{ g: "ei", p: "ee" }, { g: "eo", p: "ee" }, { g: "kn", p: "n" }], words: ["receive", "receipt", "people", "knee", "kneel"] },
  { unit: "EC35", gpcs: [{ g: "f", p: "v" }], words: ["of"] },
  { unit: "EC43", gpcs: [{ g: "oa", p: "or" }], words: ["broad", "abroad"] },
];

// =============================================================================================== sound mapping

/** The speech sounds in Sounds~Write's lexicon (Table One): 19 vowels and 25 consonants, with its example words.
 *  It lists < x > as a consonant 'that encodes two sounds' and has no /eer/: "an 'ee' running into a schwa … we …
 *  treat them as two distinct sounds" (the scope and sequence nevertheless has EC49 /eer/). The lexicon's Part 2 is the
 *  authority for which spellings each sound has; see LEXICON_AUDIT. */
export const SW_LEXICON_SOUNDS: { sw: string; example: string; vowel: boolean }[] = [
  ...[["a", "flat"], ["ae", "lady"], ["ar", "star"], ["air", "pair"], ["e", "pet"], ["ee", "me"], ["er", "her"], ["i", "pin"], ["ie", "pie"], ["o", "pot"], ["oe", "toe"], ["or", "for"], ["oy", "toy"], ["ow", "cow"], ["u", "bun"], ["ue", "cue"], ["oo", "book"], ["oo", "moon"], ["schwa", "about"]]
    .map(([sw, example]) => ({ sw, example, vowel: true })),
  ...[["b", "big"], ["ch", "chop"], ["d", "dog"], ["f", "fig"], ["g", "go"], ["h", "hat"], ["j", "jug"], ["k", "kit"], ["l", "lip"], ["m", "mop"], ["n", "no"], ["ng", "sing"], ["p", "pig"], ["r", "run"], ["s", "sit"], ["sh", "shop"], ["t", "tap"], ["th (not voiced)", "thin"], ["th (voiced)", "the"], ["v", "van"], ["w", "wet"], ["x", "box / exam"], ["y", "yet"], ["z", "zoo"], ["zh", "azure"]]
    .map(([sw, example]) => ({ sw, example, vowel: false })),
];

/** The model's spellings checked against the lexicon's Part 2 (words listed by sound and spelling; 2011, before the
 *  split-spelling change). Every other spelling in gpcsOfUnit, TANGENTIAL_TEACHING and otherSpellings is listed there
 *  as a common spelling of the same sound. Run of 26 September 2026 (DOSSIER §9.2; downloads/sw-lexicon-of-english-spellings.pdf). */
export const LEXICON_AUDIT: { gpcs: GpcKey[]; lexicon: "absent" | "unusual" | "schwa" | "no-such-sound"; note: string }[] = [
  { gpcs: ["ke>k", "pe>p", "de>d", "be>b", "fe>f"], lexicon: "absent", note: "the 2011 lexicon codes 'cake' with a split vowel (c a-e k); these consonant + e spellings exist only under the September 2024 guidance. < te >, < me >, < le >, < ne >, < ce >, < se >, < ze >, < ge >, < ve >, < the > are already in the lexicon" },
  { gpcs: ["ai>e", "ie>e"], lexicon: "unusual", note: "'said', 'says', 'friend' are 'Unusual/unique spellings' of 'e'; the record sheet still puts < ai > in Unit 7" },
  { gpcs: ["eir>air", "ayer>air", "ayor>air"], lexicon: "unusual", note: "'heir', 'mayor', 'prayer', 'their' are unusual/unique; the record sheet has < eir > in Unit 20 and brackets < ayer >, < ayor >" },
  { gpcs: ["our>er", "ere>er"], lexicon: "unusual", note: "'journey', 'were' are unusual/unique; the record sheet has < our > in Unit 34 and the HFW chart files 'were' under Unit 6" },
  { gpcs: ["e>i"], lexicon: "unusual", note: "'English' is unusual/unique; the record sheet has < e > in Unit 30 (pretty)" },
  { gpcs: ["ol>l"], lexicon: "unusual", note: "'symbol' is unusual/unique; the word lists add < ol > to Unit 18" },
  { gpcs: ["ough>oo"], lexicon: "unusual", note: "'through' is unusual/unique; the record sheet has < ough > in Unit 36" },
  { gpcs: ["eigh>ie", "ou>o", "aigh>ae", "eo>ee", "oa>or"], lexicon: "unusual", note: "height, cough, straight, people, broad: unusual/unique, matching their place on the tangential-teaching sheet" },
  { gpcs: ["ar>er", "re>er"], lexicon: "schwa", note: "the lexicon lists < ar > (vicar) and < re > (kilometre) as schwa spellings; Sounds~Write files them under /er/ in Unit 34" },
  { gpcs: ["eer>eer", "ere>eer", "ear>eer"], lexicon: "no-such-sound", note: "the lexicon has no 'eer' sound ('ee' running into a schwa); the scope and sequence has Unit 49 /eer/" },
  { gpcs: ["oh>oe", "tw>t"], lexicon: "absent", note: "'oh' and 'two' are not listed; both are tangential" },
];

/** Every one of our PhonemeIds against Sounds~Write. `units`: where Sounds~Write teaches spellings of the sound.
 *  The lexicon also has 'gz' (< x > in 'exam'), 'wu' (< o > in 'one', 'once') and 'zh' (treasure, vision, genre),
 *  which have no unit and no PhonemeId here. */
export const SW_SOUND_MAP: { ours: PhonemeId; sw: string | null; units: SwUnitId[]; note?: string }[] = [
  { ours: "a", sw: "/a/", units: ["IC1", "EC26"] }, { ours: "i", sw: "/i/", units: ["IC1", "EC30"] }, { ours: "m", sw: "/m/", units: ["IC1", "EC42"] },
  { ours: "s", sw: "/s/", units: ["IC1", "IC7", "EC16", "EC17"] }, { ours: "t", sw: "/t/", units: ["IC1", "EC47"] }, { ours: "n", sw: "/n/", units: ["IC2", "EC33"] },
  { ours: "o", sw: "/o/", units: ["IC2", "EC5", "EC25"] }, { ours: "p", sw: "/p/", units: ["IC2"], note: "no Extended Code unit; < pp > only meets children in polysyllabic words" },
  { ours: "b", sw: "/b/", units: ["IC3"], note: "no Extended Code unit; < bb > only in polysyllabic words" },
  { ours: "k", sw: "/k/", units: ["IC3", "IC5", "IC11", "BR", "EC45"] }, { ours: "g", sw: "/g/", units: ["IC3", "EC38", "EC39", "EC41"] }, { ours: "h", sw: "/h/", units: ["IC3", "EC44"] },
  { ours: "d", sw: "/d/", units: ["IC4", "EC28"] }, { ours: "e", sw: "/e/", units: ["IC4", "EC7"] }, { ours: "f", sw: "/f/", units: ["IC4", "IC7", "EC40", "EC41"] },
  { ours: "v", sw: "/v/", units: ["IC4", "IC11", "BR", "EC35"] }, { ours: "l", sw: "/l/", units: ["IC5", "IC7", "EC18"] }, { ours: "r", sw: "/r/", units: ["IC5", "EC46"] },
  { ours: "u", sw: "/u/", units: ["IC5", "EC14", "EC15"] }, { ours: "j", sw: "/j/", units: ["IC6", "EC37", "EC39"] }, { ours: "w", sw: "/w/", units: ["IC6", "IC11", "BR"] },
  { ours: "z", sw: "/z/", units: ["IC6", "IC7", "EC17", "EC48"] },
  { ours: "ks", sw: null, units: ["IC7"], note: "not a sound: < x > 'encodes two sounds, pronounced as either ks or gz' (lexicon); IC7 teaches /k/ /s/" },
  { ours: "y", sw: "/y/", units: ["IC7", "EC31"] }, { ours: "sh", sw: "/sh/", units: ["IC11"], note: "no Extended Code unit; < ch > for /sh/ via Lesson 10; -tion etc. in polysyllabic work" },
  { ours: "ch", sw: "/ch/", units: ["IC11", "BR"] }, { ours: "th", sw: "/th/", units: ["IC11"], note: "Sounds~Write writes voiced and unvoiced both as /th/" },
  { ours: "dh", sw: "/th/", units: ["IC11"], note: "voiced th; same label as th in Sounds~Write" }, { ours: "ng", sw: "/ng/", units: ["IC11"], note: "< ng > and < n > (think)" },
  { ours: "kw", sw: null, units: ["IC11"], note: "not a sound: < q > spells /k/ and < u > spells /w/. Retire this id." },
  { ours: "ae", sw: "/ae/", units: ["EC1", "EC3", "EC26", "EC27"] }, { ours: "ee", sw: "/ee/", units: ["EC2", "EC3", "EC29", "EC31"] }, { ours: "ie", sw: "/ie/", units: ["EC11", "EC31"] },
  { ours: "oe", sw: "/oe/", units: ["EC4", "EC5", "EC9", "EC32"] }, { ours: "oo", sw: "/oo/ (as in 'moon')", units: ["EC10", "EC13", "EC15", "EC22", "EC36"] },
  { ours: "ar", sw: "/ar/", units: ["EC24", "EC26"] }, { ours: "or", sw: "/or/", units: ["EC19", "EC43"] }, { ours: "er", sw: "/er/", units: ["EC6", "EC34"] },
  { ours: "ou", sw: "/ow/", units: ["EC8", "EC9", "EC15"], note: "we call it 'ou'; Sounds~Write writes /ow/" }, { ours: "oy", sw: "/oy/", units: ["EC23"] },
  { ours: "ue", sw: "/ue/", units: ["EC21", "EC22"] }, { ours: "uu", sw: "/oo/ (as in 'book')", units: ["EC12", "EC13"], note: "we call it 'uu' (label 'oo')" },
  { ours: "air", sw: "/air/", units: ["EC20"] }, { ours: "eer", sw: "/eer/", units: ["EC49"], note: "a scope-and-sequence unit, but not in the lexicon's table of sounds" },
  { ours: "zh", sw: "/zh/", units: [], note: "in the lexicon (azure, treasure) and the manual's appendix, but no Extended Code unit; when it is taught is not public (DOSSIER §16.11 q8)" },
  { ours: "schwa", sw: "schwa /Ə/", units: ["PW3", "PW6"], note: "taught in the Polysyllabic Words strand; the older 'EC50' is not current (see EC50_SCHWA)" },
];

// =============================================================================================== split spellings

/** "split": a-e, i-e, o-e, u-e, e-e are spellings (cake = c.a-e.k). "consonant-e": no split spellings; the vowel is a
 *  single letter and the final e joins the consonant before it (cake = c.a.ke, gate = g.a.te, cave = c.a.ve). */
export type SplitPolicy = "split" | "consonant-e";

export const SPLIT_SPELLING = {
  /** Sounds~Write's current advice */
  swNow: "consonant-e" as SplitPolicy,
  since: "2024-09",
  /** Freshford's 2026 Y1/Y2 deck still says "split spelling e.g. gate, also written as a-e" and its petal chart lists a-e, i-e, o-e, u-e */
  freshford: "split" as SplitPolicy,
  quotes: [
    "From September 2024, Sounds-Write will no longer advise the teaching of the split spelling.",
    "The list of spellings taught in Unit 1 will now be < ay >, < ai >, < a > and < ea >.",
    "Similarly, in Unit 4, the list of alternative spellings will now be < o >, < oa > < ow > and < oe>, and so on for all of the units that previously had a split spelling.",
    "When you teach Lesson 6 now, simply take out Part 2.",
    "if you feel that the split spelling works for your students, then it's also fine to keep teaching it!",
  ],
  replace: { "a-e": "a", "e-e": "e", "i-e": "i", "o-e": "o", "u-e": "u" } as Record<string, string>,
  /** consonant + e spellings ('two letters, one sound', like < ve >), each with the unit where gpcsOfUnit adds it.
   *  The guidance names < ve >, < te >, < me >, < ke >, < le > (with /ae/ in Unit 1) and the "correlated" < ce >, < ge >,
   *  < the >, < ze >, and says to introduce them "gradually, not all at once", but gives no per-unit order. We place
   *  each at the first unit where official post-2024 material uses it without help, or at its formal unit on the
   *  record sheet when no earlier use is found. The lexicon (2011) already lists < ce >, < ge >, < se >, < ze >,
   *  < the >, < ve >, < me >, < ne >, < le >, < te > as consonant spellings; < de >, < pe >, < be >, < fe >, < ke >
   *  exist only in the post-2024 coding. */
  // TODO(verify): DOSSIER §16.11 q2: which consonant + e spellings are formally taught in which unit is not public.
  consonantE: [
    { g: "te", p: "t", unit: "EC1", conf: "official", why: "guidance: '/te/ in gate, Kate, late, plate, state' (Unit 1)" },
    { g: "me", p: "m", unit: "EC1", conf: "official", why: "guidance: '/me/ in game, same, name, frame'" },
    { g: "ke", p: "k", unit: "EC1", conf: "official", why: "guidance: '/ke/ in take, cake, shake, quake'" },
    { g: "le", p: "l", unit: "EC1", conf: "official", why: "guidance: '/le/ in tale, pale, whale, scale'" },
    { g: "pe", p: "p", unit: "EC1", conf: "inferred", why: "'cape' on the 2025 /ae/ poster; coded 'h o pe' (< pe > on one line) in the 2024 Unit 4 activities" },
    { g: "ve", p: "v", unit: "IC11", conf: "official", why: "guidance: taught in Initial Code Unit 11 (have, live, give, twelve)" },
    { g: "the", p: "dh", unit: "EC2", conf: "inferred", why: "guidance names < the > (breathe, soothe); lexicon lists it for voiced /th/; no unit or use found, so placed where 'breathe' becomes decodable" },
    { g: "de", p: "d", unit: "EC4", conf: "inferred", why: "a < de > tile on the members' Unit 4 Lesson 6 board (2026); 'fades' unflagged in The Glow in the Snow (EC4, 2025); 'rude', 'side' in the Unit 10/11 checks" },
    { g: "ne", p: "n", unit: "EC4", conf: "inferred", why: "'bone', 'zone' are Unit 4 check words (2026); 'bone', 'lane' in The Glow in the Snow (EC4)" },
    { g: "ze", p: "z", unit: "EC4", conf: "inferred", why: "'froze' in the 2024 Unit 4 word analysis; formal unit 48 (record sheet); 'graze' a Unit 27 check word" },
    { g: "se", p: "s", unit: "EC4", conf: "inferred", why: "'close' in The Glow in the Snow (EC4); 'tense', 'else', 'worse' in Bert's Plan (EC6, 2024); formal unit 16" },
    { g: "be", p: "b", unit: "EC4", conf: "inferred", why: "'snowglobe' among the 2024 'Extended Code Units 1, 2 & 4' polysyllabic words; 'cube', 'tube' are Unit 21 check words" },
    { g: "fe", p: "f", unit: "EC6", conf: "inferred", why: "'safe', 'safely' unflagged in Bert's Plan (EC6, 2024); 'knife' a Unit 33 check word" },
    { g: "ce", p: "s", unit: "EC16", conf: "inferred", why: "formal unit (record sheet: /s/ Unit 16); 'ice', 'face', 'nice' are Unit 16 check words; no earlier post-2024 use found" },
    { g: "se", p: "z", unit: "EC17", conf: "inferred", why: "with < s > as /z/ (spelling Unit 17); formal unit 48 (record sheet); 'please', 'choose' are Unit 48 check words" },
    { g: "ge", p: "j", unit: "EC37", conf: "inferred", why: "formal unit (record sheet: /j/ Unit 37); 'huge', 'large', 'strange' are Unit 37 check words" },
  ] as (SpellingRef & { unit: SwUnitId; conf: Tier; why: string })[],
  src: ["sw-split-2024", "sw-pedagogy", "sw-membership-2026", "sw-checks-ec-2026", "sw-ec-xmas-2024", "sw-glow-2025", "sw-bert-2024", "sw-posters-2025", "sw-record-sheet", "sw-lexicon", "grange-2026", "freshford-y1y2"] as SourceId[],
};

/** Translate GPC keys to a split-spelling policy (keys are stored in "split" form). */
export function applySplitPolicy(keys: GpcKey[], policy: SplitPolicy): GpcKey[] {
  if (policy === "split") return keys;
  const out = keys.map((k) => {
    const [g, p] = k.split(">") as [string, PhonemeId];
    return gpc(SPLIT_SPELLING.replace[g] ?? g, p);
  });
  return [...new Set(out)];
}

// =============================================================================================== sequence helpers

export const SW_SEQUENCE: SwUnitId[] = [...INITIAL_CODE_UNITS.map((u) => u.id), "BR", ...EXTENDED_CODE_UNITS.map((u) => u.id)];
export const unitIndex = (id: SwUnitId): number => SW_SEQUENCE.indexOf(id);
export const icUnit = (n: number) => INITIAL_CODE_UNITS.find((u) => u.unit === n);
export const ecUnit = (n: number) => EXTENDED_CODE_UNITS.find((u) => u.unit === n);

/** Official Sounds~Write September 2024 guidance: no split spellings (gate = g·a·te). See docs/SOUNDS_WRITE_MODEL.md, Decisions. */
export const DEFAULT_SPLIT: SplitPolicy = "consonant-e";

export interface GpcOpts {
  /** include the official PSC additions (England, Year 1) */
  psc?: boolean;
  /** Sounds~Write's consonant + e (2024; the DEFAULT, Jonas's decision on 25 Sep 2026) or split spellings as Freshford still teaches */
  split?: SplitPolicy;
}

/** The spelling→sound pairs a unit teaches (or contrasts, for spelling units). Under "consonant-e" (the default) each
 *  consonant + e spelling is added at its SPLIT_SPELLING.consonantE unit. */
export function gpcsOfUnit(id: SwUnitId, opts: GpcOpts = {}): GpcKey[] {
  const pol = (keys: GpcKey[]) => applySplitPolicy(keys, opts.split ?? DEFAULT_SPLIT);
  if (id === "BR") return BRIDGING_UNIT.sounds.flatMap((s) => [...s.spellings, ...(s.optional ?? [])].map((g) => gpc(g, s.p)));
  const i = INITIAL_CODE_UNITS.find((u) => u.id === id);
  if (i) return i.newCode.map((r) => gpc(r.g, r.p));
  const e = EXTENDED_CODE_UNITS.find((u) => u.id === id);
  if (!e) return [];
  const extra = (opts.split ?? DEFAULT_SPLIT) === "consonant-e" ? SPLIT_SPELLING.consonantE.filter((c) => c.unit === id) : [];
  return pol([...e.gpcs, ...(opts.psc ? e.pscAdditions ?? [] : []), ...extra].map((r) => gpc(r.g, r.p)));
}

/** Every GPC taught up to and including a unit, in sequence order. */
export function knownGpcsAt(id: SwUnitId, opts: GpcOpts = {}): Set<GpcKey> {
  const end = unitIndex(id);
  const known = new Set<GpcKey>();
  for (const u of SW_SEQUENCE.slice(0, end + 1)) for (const k of gpcsOfUnit(u, opts)) known.add(k);
  return known;
}

/** The unit that first teaches a GPC. */
export function firstTaught(key: GpcKey, opts: GpcOpts = {}): SwUnitId | undefined {
  return SW_SEQUENCE.find((u) => gpcsOfUnit(u, opts).includes(key));
}

/** GPCs new in this unit (not taught by any earlier unit). */
export function newGpcsIn(id: SwUnitId, opts: GpcOpts = {}): GpcKey[] {
  const i = unitIndex(id);
  const before = i > 0 ? knownGpcsAt(SW_SEQUENCE[i - 1], opts) : new Set<GpcKey>();
  return gpcsOfUnit(id, opts).filter((k) => !before.has(k));
}

/** Letters of a word from its segments, placing split spellings around the segments they enclose. */
export function renderSegs(segs: { g: string; gap?: number }[]): string {
  const out: string[] = [];
  const pending: { at: number; tail: string }[] = [];
  segs.forEach((s, i) => {
    const split = /^([a-z]+)-([a-z]+)$/.exec(s.g);
    out.push(split ? split[1] : s.g);
    if (split) pending.push({ at: i + (s.gap ?? 1), tail: split[2] });
    for (const p of pending.filter((x) => x.at === i)) out.push(p.tail);
  });
  for (const p of pending.filter((x) => x.at >= segs.length)) out.push(p.tail);
  return out.join("");
}

const VOWELS = new Set<PhonemeId>(["a", "e", "i", "o", "u", "ae", "ee", "ie", "oe", "oo", "ar", "or", "er", "ou", "oy", "ue", "uu", "air", "eer", "schwa"]);
/** Sounds~Write C/V structure of a one-syllable word from its sounds. x ("ks") counts as one C, as the scope and
 *  sequence puts x words in CVC units; pass splitX to count its two sounds. */
export function structureOf(sounds: PhonemeId[], opts: { splitX?: boolean } = {}): string {
  return sounds.map((p) => (VOWELS.has(p) ? "V" : (p === "ks" || p === "kw") && opts.splitX ? "CC" : "C")).join("");
}

/** Decodable at a unit: every GPC taught by then, and (one-syllable words) a structure the unit allows. */
export function isDecodableAt(segs: SwSeg[], id: SwUnitId, opts: GpcOpts & { checkStructure?: boolean } = {}): boolean {
  const known = knownGpcsAt(id, opts);
  if (!segs.every((s) => known.has(gpc(s.g, s.p)))) return false;
  if (opts.checkStructure === false) return true;
  const ic = INITIAL_CODE_UNITS.find((u) => u.id === id) ?? (unitIndex(id) > unitIndex("IC11") ? INITIAL_CODE_UNITS[10] : undefined);
  return !ic || unitIndex(id) > unitIndex("IC11") || (ic.structures as string[]).includes(structureOf(segs.map((s) => s.p)));
}

// =============================================================================================== game side: activities

/** What the child does. Most are Sounds~Write lessons; `gameOnly` ones are pre-code oral games (docs/PEDAGOGY.md), not
 *  numbered lessons. Sounds-Write's own nursery course (Getting Ready for Reading, 2025) has seven "elements":
 *  1 sound discrimination, 2 word awareness, 3 rhyme detection, 4 rhyme production, 5 sound detection, 6 segmenting
 *  and blending, 7 phoneme manipulation; only Element 1-2 samples are public (DOSSIER §6.3). Its Reception guidance
 *  says environmental-sound listening "should not be part of your phonics lesson", so these stay game-only warm-ups. */
export type SwActivityId =
  // game-only, pre-code oral work
  | "oral-listening" | "oral-blending" | "oral-segmenting" | "oral-first-sound" | "oral-middle-sound"
  // Initial Code lessons
  | "word-building" | "word-building-digraph" | "symbol-search" | "sound-swap" | "nonsense-sound-swap" | "word-reading" | "who-read-it-right"
  | "reading-in-text" | "sentence-yes-no" | "dictation-word" | "dictation-sentence"
  // Extended Code lessons
  | "word-puzzle" | "sound-sort" | "spelling-choice" | "read-write-check" | "sound-review" | "seek-the-sound" | "spelling-sort" | "alternative-reading"
  // Polysyllabic lessons
  | "poly-reading" | "poly-spelling" | "poly-analysis"
  // game-only practice formats
  | "timed-review";

export type EvidenceSkill = SwSkillId | "code-knowledge" | "phonological";

export interface SwActivity {
  id: SwActivityId;
  lessons: SwLessonId[];
  /** the evidence it produces */
  skill: EvidenceSkill;
  direction: "read" | "spell" | "manipulate" | "oral";
  gameOnly: boolean;
  /** the Sounds-Write nursery element the oral game is closest to */
  nurseryElement?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Sounds~Write practice the game adapts rather than copies */
  adaptation?: string;
  levels: SwLevelId[];
}

export const SW_ACTIVITIES: Record<SwActivityId, SwActivity> = {
  "oral-listening": { id: "oral-listening", lessons: [], skill: "phonological", direction: "oral", gameOnly: true, nurseryElement: 1, levels: ["initial-code"], adaptation: "minimal-pair word discrimination (pan/pin); the official Element 1 samples use environmental and object sounds" },
  "oral-blending": { id: "oral-blending", lessons: [], skill: "phonological", direction: "oral", gameOnly: true, nurseryElement: 6, levels: ["initial-code"], adaptation: "tap the picture for a stretched or segmented word; S~W's own oral blending activity uses objects and a board with dashes ('m…u…g is mug, isn't it?'); its reading scaffold (two pictured choices) is in cannot-blend" },
  "oral-segmenting": { id: "oral-segmenting", lessons: [], skill: "phonological", direction: "oral", gameOnly: true, nurseryElement: 6, levels: ["initial-code"], adaptation: "'I spy a c-a-t' (Freshford home games)" },
  "oral-first-sound": { id: "oral-first-sound", lessons: [], skill: "phonological", direction: "oral", gameOnly: true, nurseryElement: 5, levels: ["initial-code"], adaptation: "phoneme identity (Sound Foundations); reveal the spelling on a line afterwards" },
  "oral-middle-sound": { id: "oral-middle-sound", lessons: [], skill: "phonological", direction: "oral", gameOnly: true, nurseryElement: 5, levels: ["initial-code"] },
  "word-building": { id: "word-building", lessons: ["L1"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["initial-code"] },
  "word-building-digraph": { id: "word-building-digraph", lessons: ["L5"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["initial-code"] },
  "symbol-search": { id: "symbol-search", lessons: ["L2"], skill: "code-knowledge", direction: "spell", gameOnly: false, levels: ["initial-code"] },
  "sound-swap": { id: "sound-swap", lessons: ["L3"], skill: "phoneme-manipulation", direction: "manipulate", gameOnly: false, levels: ["initial-code", "extended-code"] },
  "nonsense-sound-swap": { id: "nonsense-sound-swap", lessons: ["L3"], skill: "phoneme-manipulation", direction: "manipulate", gameOnly: false, levels: ["initial-code"] },
  "word-reading": { id: "word-reading", lessons: ["L4"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code"] },
  "who-read-it-right": { id: "who-read-it-right", lessons: ["L4"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code"], adaptation: "the child can't be heard, so two characters read and the child picks the right one" },
  "reading-in-text": { id: "reading-in-text", lessons: ["L4"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code", "polysyllabic"] },
  "sentence-yes-no": { id: "sentence-yes-no", lessons: ["L4"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code"] },
  "dictation-word": { id: "dictation-word", lessons: ["L4a"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["initial-code", "extended-code"], adaptation: "'Quizzing (dictation of single words)', an official additional review activity" },
  "dictation-sentence": { id: "dictation-sentence", lessons: ["L4a"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["initial-code", "extended-code"] },
  "word-puzzle": { id: "word-puzzle", lessons: ["L6"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["initial-code", "extended-code"], adaptation: "Lesson 6 'Word Puzzles': build one word for each spelling of the sound from jumbled tiles, one sound per tile, then sum up 'different spellings, same sound'" },
  "sound-sort": { id: "sound-sort", lessons: ["L8"], skill: "code-knowledge", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code"], adaptation: "Lesson 8: read each word card and place it under the heading for its spelling of the sound (members' board, EC25: < o > / < a >)" },
  "spelling-choice": { id: "spelling-choice", lessons: ["L7"], skill: "code-knowledge", direction: "spell", gameOnly: false, levels: ["extended-code"], adaptation: "game adaptation of Lesson 7's column choice ('Where shall we write it? Do we have that spelling of /er/ already?'): which spelling of /ae/ is in 'rain'? r _ n" },
  "read-write-check": { id: "read-write-check", lessons: ["L7"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code"] },
  "sound-review": { id: "sound-review", lessons: ["L8"], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code"], adaptation: "read word cards for an earlier sound's spellings" },
  "seek-the-sound": { id: "seek-the-sound", lessons: ["L9"], skill: "code-knowledge", direction: "read", gameOnly: false, levels: ["extended-code"], adaptation: "find words with the sound in a decodable passage and note the spelling" },
  "spelling-sort": { id: "spelling-sort", lessons: ["L10"], skill: "phoneme-manipulation", direction: "manipulate", gameOnly: false, levels: ["extended-code"] },
  "alternative-reading": { id: "alternative-reading", lessons: ["L10", "L4"], skill: "phoneme-manipulation", direction: "manipulate", gameOnly: false, levels: ["extended-code"], adaptation: "try the spelling's sounds until the word makes sense" },
  "poly-reading": { id: "poly-reading", lessons: ["L12", "L14"], skill: "blending", direction: "read", gameOnly: false, levels: ["polysyllabic"] },
  "poly-spelling": { id: "poly-spelling", lessons: ["L11", "L13"], skill: "segmenting", direction: "spell", gameOnly: false, levels: ["polysyllabic"] },
  "poly-analysis": { id: "poly-analysis", lessons: ["L15"], skill: "code-knowledge", direction: "spell", gameOnly: false, levels: ["polysyllabic"] },
  "timed-review": { id: "timed-review", lessons: [], skill: "blending", direction: "read", gameOnly: false, levels: ["initial-code", "extended-code"], adaptation: "SpeedRead, an official additional activity (not a numbered lesson): 'Can you read 10 (or 20) words correctly in 30 seconds?'; words already taught; follow with spelling the words" },
};

// =============================================================================================== game side: evidence

export type TeachPhase = "i-do" | "we-do" | "you-do";

/** One attempt. Spelling items record one per slot (gpc = that slot). Reading items record one per word (gpc = the
 *  spelling at the contrast or error position, gpcs = all of the word). */
export interface Evidence {
  t: number;
  activity: SwActivityId;
  skill: EvidenceSkill;
  direction: SwActivity["direction"];
  gpc?: GpcKey;
  gpcs?: GpcKey[];
  word?: string;
  structure?: string;
  /** the unit this attempt is evidence for: the unit that taught `gpc`, or the item's unit for structure units IC8–10 */
  unit: SwUnitId;
  correct: boolean;
  /** correct at the first attempt, before any Teaching Through Errors step */
  firstTry: boolean;
  /** any help shown before the answer (glow, model, reduced choice) */
  helped: boolean;
  errors?: ErrorType[];
  phase?: TeachPhase;
  ms?: number;
}

// =============================================================================================== game side: mastery

export interface MasteryConfig {
  /** last N scored attempts per key */
  window: number;
  /** fewer attempts than this: status stays "learning" */
  minAttempts: number;
  /** Sounds~Write's 75–80% rule: 0.75 = may move on, 0.8 = secure */
  moveOn: number;
  secure: number;
  /** credit for a correct answer that needed help (0: only independent first tries count) */
  helpedCredit: number;
  /** teaching phases that are scored */
  scoredPhases: TeachPhase[];
}

export const MASTERY_CONFIG: MasteryConfig = { window: 10, minAttempts: 5, moveOn: 0.75, secure: 0.8, helpedCredit: 0, scoredPhases: ["you-do"] };

export type ProficiencyStatus = "not-started" | "learning" | "move-on" | "secure";
export interface Proficiency { attempts: number; value: number; status: ProficiencyStatus }

/** Unit facets, following the 2020 mastery timeline: code (recognise), reading (blend), spelling (segment),
 *  manipulation (Sound Swap, alternatives), dictation (connected text, lags three units). */
export type UnitFacet = "code" | "reading" | "spelling" | "manipulation" | "dictation";

export interface MasteryModel {
  gpc: Record<string, { read: Proficiency; spell: Proficiency }>;
  skill: Record<string, Record<string, Proficiency>>;
  unit: Record<string, Partial<Record<UnitFacet, Proficiency>> & { overall: Proficiency }>;
}

/** 1 for an independent first-try success, helpedCredit for a helped success, 0 for a miss, null if not scored. */
export function evidenceScore(e: Evidence, c: MasteryConfig = MASTERY_CONFIG): number | null {
  if (e.phase && !c.scoredPhases.includes(e.phase)) return null;
  if (!e.correct) return 0;
  return e.firstTry && !e.helped ? 1 : c.helpedCredit;
}

export function proficiency(evs: Evidence[], c: MasteryConfig = MASTERY_CONFIG): Proficiency {
  const scores = evs.slice().sort((a, b) => a.t - b.t).map((e) => evidenceScore(e, c)).filter((s): s is number => s !== null).slice(-c.window);
  const attempts = scores.length;
  const value = attempts ? scores.reduce((a, b) => a + b, 0) / attempts : 0;
  const status: ProficiencyStatus = !attempts ? "not-started" : attempts < c.minAttempts ? "learning" : value >= c.secure ? "secure" : value >= c.moveOn ? "move-on" : "learning";
  return { attempts, value, status };
}

const facetOf = (e: Evidence): UnitFacet | null =>
  e.activity === "dictation-word" || e.activity === "dictation-sentence" ? "dictation"
  : e.skill === "code-knowledge" ? "code"
  : e.skill === "blending" ? "reading"
  : e.skill === "segmenting" ? "spelling"
  : e.skill === "phoneme-manipulation" ? "manipulation"
  : null;

function groupBy<K extends string>(evs: Evidence[], key: (e: Evidence) => K | null | undefined): Map<K, Evidence[]> {
  const m = new Map<K, Evidence[]>();
  for (const e of evs) {
    const k = key(e);
    if (k == null) continue;
    const list = m.get(k);
    if (list) list.push(e);
    else m.set(k, [e]);
  }
  return m;
}

/** Roll evidence up per GPC (read vs spell), per skill (by word structure) and per unit (by facet). */
export function rollUp(evs: Evidence[], c: MasteryConfig = MASTERY_CONFIG): MasteryModel {
  const model: MasteryModel = { gpc: {}, skill: {}, unit: {} };
  for (const [k, list] of groupBy(evs, (e) => e.gpc)) {
    model.gpc[k] = {
      read: proficiency(list.filter((e) => e.direction === "read" || e.direction === "manipulate"), c),
      spell: proficiency(list.filter((e) => e.direction === "spell"), c),
    };
  }
  for (const [k, list] of groupBy(evs, (e) => e.skill)) {
    model.skill[k] = {};
    for (const [s, l2] of groupBy(list, (e) => e.structure ?? "any")) model.skill[k][s] = proficiency(l2, c);
  }
  for (const [u, list] of groupBy(evs, (e) => e.unit)) {
    const facets: Partial<Record<UnitFacet, Proficiency>> = {};
    for (const [f, l2] of groupBy(list, facetOf)) facets[f] = proficiency(l2, c);
    model.unit[u] = { ...facets, overall: proficiency(list.filter((e) => facetOf(e) !== "dictation"), c) };
  }
  return model;
}

/** May the child start the unit after `id`? Adapts "75–80% of the class at 75–80% proficiency" to one child, with the
 *  official lags. Initial Code (2020 timeline): the current unit's code, reading and spelling must be at moveOn, and
 *  the previous unit's reading and manipulation too; dictation lags three units and only goes on the watch list.
 *  Extended Code (2023 planning): the current unit's code and reading (Lessons 6 and 7) must be at moveOn and the
 *  previous unit's reading too; spelling accuracy lags 5–7 units, so it never blocks and is watched from 5 units back. */
export function canMoveOn(model: MasteryModel, id: SwUnitId): { ok: boolean; reasons: string[]; watch: string[] } {
  const reasons: string[] = [];
  const watch: string[] = [];
  const good = (p?: Proficiency) => !p || p.status === "move-on" || p.status === "secure";
  const i = unitIndex(id);
  const back = (n: number) => (i - n >= 0 ? SW_SEQUENCE[i - n] : undefined);
  const check = (u: SwUnitId | undefined, facets: UnitFacet[], into: string[]) => {
    const m = u ? model.unit[u] : undefined;
    if (m) for (const f of facets) if (m[f] && !good(m[f])) into.push(`${u} ${f} below ${MASTERY_CONFIG.moveOn}`);
  };
  if (!model.unit[id]) return { ok: false, reasons: [`no evidence for ${id}`], watch };
  const ec = id.startsWith("EC");
  check(id, ec ? ["code", "reading"] : ["code", "reading", "spelling"], reasons);
  if (!good(model.unit[id].overall)) reasons.push(`${id} overall below ${MASTERY_CONFIG.moveOn}`);
  check(back(1), ec ? ["reading"] : ["reading", "manipulation"], reasons);
  if (ec) check(back(PACING.lags.extendedCodeSpellingAccuracy[0]), ["spelling", "dictation"], watch);
  else check(back(PACING.lags.initialCodeDictationMastery), ["dictation"], watch);
  return { ok: reasons.length === 0, reasons, watch };
}

// =============================================================================================== game side: items

interface ItemBase {
  activity: SwActivityId;
  unit: SwUnitId;
  /** GPCs this item is evidence for */
  targets: GpcKey[];
}

export interface WordBuildingItem extends ItemBase {
  kind: "word-building";
  word: string;
  segs: SwSeg[];
  /** tiles on the board: the word's spellings, jumbled, plus `distractors`. Sounds~Write Lesson 1 uses none. */
  bank: string[];
  distractors: string[];
  /** say the word stretched (continuant-first words) with the pointer sweeping the lines */
  stretch: boolean;
  /** finish by writing the word saying the sounds (tap-to-write in the game) */
  write: boolean;
}

export interface SymbolSearchItem extends ItemBase {
  kind: "symbol-search";
  sound: PhonemeId;
  answer: string;
  choices: string[];
  /** a word the sound was met in ("/a/ … like in 'am'") */
  contextWord?: string;
}

export type SwapOp = "substitute" | "insert" | "delete";
export interface SwapStep {
  from: string;
  to: string;
  op: SwapOp;
  /** segment index in `from` (substitute, delete) or insertion index (insert) */
  position: number;
  fromSeg?: SwSeg;
  toSeg?: SwSeg;
  nonsense?: boolean;
}
export interface SoundSwapItem extends ItemBase {
  kind: "sound-swap";
  chain: SwapStep[];
  /** spellings offered for the new sound (game help); omit for free choice from known code */
  choices?: string[];
}

export interface WordReadingItem extends ItemBase {
  kind: "word-reading";
  word: string;
  segs: SwSeg[];
  /** "who read it right?": wrong readings, each differing at one position */
  foils?: { text: string; at: number }[];
  /** choose the matching picture instead of a reader */
  pictures?: string[];
}

export interface ReadingInTextItem extends ItemBase {
  kind: "reading-in-text";
  text: string;
  words: { text: string; segs: SwSeg[]; special?: boolean }[];
  check?: { kind: "yes-no"; answer: boolean } | { kind: "picture"; options: string[]; answer: number };
}

export interface DictationItem extends ItemBase {
  kind: "dictation";
  mode: "word" | "sentence";
  text: string;
  words: { text: string; segs: SwSeg[]; special?: boolean }[];
  /** newest unit whose code may appear: at least two units behind the current one */
  maxUnit: SwUnitId;
  /** untaught words shown on the board */
  board: string[];
}

export interface SoundSortItem extends ItemBase {
  kind: "sound-sort";
  sound: PhonemeId;
  /** baskets: spellings of the sound */
  spellings: string[];
  word: string;
  segs: SwSeg[];
  answer: string;
}

export interface SpellingSortItem extends ItemBase {
  kind: "spelling-sort";
  spelling: string;
  /** baskets: sounds of the spelling */
  sounds: PhonemeId[];
  word: string;
  segs: SwSeg[];
  answer: PhonemeId;
}

export interface SpellingChoiceItem extends ItemBase {
  kind: "spelling-choice";
  word: string;
  segs: SwSeg[];
  slot: number;
  choices: string[];
  answer: string;
}

export interface PolyItem extends ItemBase {
  kind: "poly-reading" | "poly-spelling";
  word: string;
  syllables: { text: string; segs: SwSeg[]; schwa?: boolean }[];
  level: "sound" | "syllable";
}

export interface OralItem extends ItemBase {
  kind: "oral-listening" | "oral-blending" | "oral-first-sound" | "oral-middle-sound" | "oral-segmenting";
  /** picture words, named aloud; any unit's words are allowed because nothing is written */
  target: string;
  foils: string[];
  presentation: "whole" | "stretched" | "segmented";
  sound?: PhonemeId;
  /** after success, show this spelling on a line (letters appear only as the reveal of a sound heard in a word) */
  reveal?: string;
}

export type ItemSpec =
  | WordBuildingItem | SymbolSearchItem | SoundSwapItem | WordReadingItem | ReadingInTextItem | DictationItem
  | SoundSortItem | SpellingSortItem | SpellingChoiceItem | PolyItem | OralItem;
export type ItemKind = ItemSpec["kind"];

/** Classify a one-step change between two segment lists (for Sound Swap chains). null if not exactly one change. */
export function swapBetween(a: SwSeg[], b: SwSeg[]): { op: SwapOp; position: number } | null {
  const same = (x: SwSeg, y: SwSeg) => x.g === y.g && x.p === y.p;
  if (a.length === b.length) {
    const diffs = a.map((s, i) => (same(s, b[i]) ? -1 : i)).filter((i) => i >= 0);
    return diffs.length === 1 ? { op: "substitute", position: diffs[0] } : null;
  }
  const [long, short, op] = a.length > b.length ? [a, b, "delete" as SwapOp] : [b, a, "insert" as SwapOp];
  if (long.length !== short.length + 1) return null;
  for (let i = 0; i < long.length; i++) {
    const rest = [...long.slice(0, i), ...long.slice(i + 1)];
    if (rest.every((s, j) => same(s, short[j]))) return { op, position: i };
  }
  return null;
}

// =============================================================================================== content build-out spec

/** Minimum content per unit for the game to teach it the Sounds~Write way. The counts are our design choice, not a
 *  Sounds~Write figure (the progress checks use 6–10 Initial Code and 20 Extended Code reading words per check). */
export interface ContentQuota {
  /** real words decodable at the unit that use at least one of its new GPCs (or its new structure) */
  words: number;
  /** of which pictureable nouns or clear actions */
  pictures: number;
  /** sound units: per spelling, one-syllable words where the target sound occurs exactly once */
  perSpelling?: number;
  /** spelling units: per sound of the spelling */
  perSound?: number;
  swapChains: number;
  swapChainLength: number;
  sentences: number;
  /** polysyllabic words using only code up to here (from EC4) */
  polysyllabic: number;
  stories: number;
}

export function contentQuota(id: SwUnitId): ContentQuota {
  const base: ContentQuota = { words: 30, pictures: 12, swapChains: 2, swapChainLength: 6, sentences: 8, polysyllabic: 0, stories: 1 };
  if (id === "IC1") return { ...base, words: 6, pictures: 2, swapChains: 1, swapChainLength: 5, sentences: 3 };
  if (id === "IC2") return { ...base, words: 20, pictures: 8 };
  if (id === "IC8" || id === "IC9" || id === "IC10") return { ...base, words: 40, swapChains: 3, swapChainLength: 8 };
  if (id === "IC11") return { ...base, words: 60, pictures: 20, perSpelling: 8 };
  if (id === "BR") return { ...base, words: 30, pictures: 9, perSpelling: 10, swapChains: 0, sentences: 6, stories: 0 };
  if (id.startsWith("PW")) return { ...base, words: 30, pictures: 10, swapChains: 0, polysyllabic: 30 };
  const ec = EXTENDED_CODE_UNITS.find((u) => u.id === id);
  if (!ec) return base;
  const poly = ec.unit >= 4 ? 10 : 0;
  return ec.kind === "sound"
    ? { ...base, words: Math.max(30, ec.gpcs.length * 8), pictures: Math.max(12, ec.gpcs.length * 3), perSpelling: 8, swapChains: 1, swapChainLength: 5, polysyllabic: poly }
    : { ...base, words: ec.gpcs.length * 8, pictures: ec.gpcs.length * 3, perSound: 8, swapChains: 0, sentences: 6, polysyllabic: poly, stories: 0 };
}

export type ValidatorRuleId =
  | "segmentation" | "gpc-known" | "decodable" | "structure" | "british-spelling" | "british-pronunciation" | "age-appropriate"
  | "no-slang" | "homophone" | "sort-single-occurrence" | "swap-one-change" | "special-words" | "picture" | "polysyllabic-syllables" | "unit-tag";

/** Rules the word-list validator enforces. docs/SOUNDS_WRITE_MODEL.md has the full wording. */
export const VALIDATOR_RULES: Record<ValidatorRuleId, string> = {
  segmentation: "renderSegs(segs) === text (lower-case); every seg is one spelling from SW GPC tables; split spellings use g 'a-e' with gap.",
  "gpc-known": "every (g,p) is a GPC somewhere in the sequence (gpcsOfUnit over SW_SEQUENCE, psc additions allowed only when flagged).",
  decodable: "every (g,p) is in knownGpcsAt(unit); unit = the word's tagged unit; special words exempt only if listed.",
  structure: "IC units: structureOf(sounds) is in the unit's structures; EC one-syllable words: at most 3 adjacent consonants per side.",
  "british-spelling": "in a British English word list; no US spellings (color, gray, mom, candy, diaper).",
  "british-pronunciation": "segs follow Southern British (non-rhotic) pronunciation; exclude accent-dependent words (bath, grass, path, fast, last, castle) and words whose vowel differs by region unless tagged.",
  "age-appropriate": "in a children's vocabulary list (ages 3–8); concrete and known to a Reception child for early units.",
  "no-slang": "no slang, brand names, rude, scary, violent or body words; no proper nouns except taught names.",
  homophone: "words sharing a sound sequence with another word in the pool need a picture or a sentence before they can be dictated.",
  "sort-single-occurrence": "sort words contain the target sound exactly once and its spelling exactly once.",
  "swap-one-change": "each chain step is exactly one substitute/insert/delete (swapBetween); every word decodable at the unit; nonsense words only from IC8 and flagged.",
  "special-words": "special words come from the school's list for the current point; each is flagged special with its untaught spelling marked.",
  picture: "pictureable words have a picture prompt showing one unambiguous thing, with no written words in the picture.",
  "polysyllabic-syllables": "syllables given with the split convention of SYLLABLE_EXAMPLES; each syllable decodable; schwa syllables flagged.",
  "unit-tag": "word.unit === firstUnitWhereDecodable(word) unless deliberately used for review later.",
};
