# Decisions and open questions

Jonas's standing rule (26 Sep 2026): "Never block. Just keep going and do stuff and add big questions or decisions to a log to go over with me later." Agents decide, keep working, and record here what they decided on his behalf (why, the alternatives, how to reverse it) and what's worth his time. Newest first within each section. Mark items ✅ once reviewed with Jonas.

## Decisions made without asking (to review)

| Date | Decision | Why | Alternatives / how to reverse |
|---|---|---|---|
| 26 Sep | A streak carries over from one level to the next (it expires after 20 min, and Home drops it), so the "ninja master" tier (10 in a row) is reachable | Levels are short; without the carry-over the top tier never showed | streak.ts `bank()`/`drop()` in App.tsx |
| 26 Sep | Ninja "kiai" shouts (Hi-yah!) were made from Gemini voice Leda, pitched up 5–6 semitones, with public/a/fx/kiai_*.mp3 wired to `ninja.say()` | No natural child voice exists in Gemini TTS; an AI judge liked these, but no human has listened | **Jonas: listen on the preview.** If they sound chipmunky, remove the `ninja.say()` calls, or regenerate with `bun scripts/gen-hero-moves.ts --kiai` |
| 26 Sep | Warm-ups use "Let me show you!" → "Now you try!" (two phases); the full I do / we do / you do starts at IC Unit 1 | Jonas asked for the show/try mechanism in the warm-ups; three phases felt long for a 3-year-old's 85 s lesson | Use all three phases in the warm-ups too: change docs/FIRST_MINUTES.md (Amendment) |
| 26 Sep | Answered **No** to the Sounds-Write mailing list, and "not trained", on their free-resources form | Jonas asked for the downloads, not for marketing email | Resubmit the form with "Yes" to subscribe |
| 26 Sep | Downloaded 13 of the 42 free resources (Lexicon, First Steps readers, Early Years samples, unit stories, PSC guide, posters, activity packs) | The rest are seasonal extras; each one means another email in Jonas's inbox | Submit the form again for any other resource |
| 26 Sep | Two Chrome profiles found; jonas@templestein.com mail was read in the jonas.huckestein@gmail.com profile (a new tab, closed afterwards) | That's where templestein.com forwards | none needed |
| 26 Sep | Created the preview channel **next.superninja.templestein.com** (worker super-ninja-next) | Jonas wanted to see updates without a release | Delete the worker and its custom domain in Cloudflare |
| 26 Sep | Explanations use fixed, canonical example words per sound and spelling, recorded as whole sentences (teach-lines.gen.ts), not the child's own words | Spliced word lists sounded choppy; Sounds~Write says teachers choose the example words | The words-you've-met panel stays personalised; switch examples back to spliced personal words in teach.ts |
| 26 Sep | Regenerated the pure sound /ie/ (it said "eye-ee"); a one-part loudness check now guards every vowel clip | Blind audits plus an envelope check proved it was two sounds | The old clip is in assets-src/ie.before.mp3 |
| 26 Sep | Baron's lip-sync is done with Seedance 2.5, animated from his real TTS line | The only engine that does action plus lip-sync in one take; Omni rejects audio input | Other takes are in assets-src/intro-v3/lipsync/ |
| 25 Sep | The public GitHub repo excludes raw renders, bot screenshots and all downloaded Sounds~Write material | Size (GBs); copyright | .gitignore |
| 25 Sep | Sensei's Help button moved bottom-right, and the ninja stands bottom-left in every level | Jonas suggested it ("not sure"); it frees the left for the ninja | ui.tsx .help-btn and the layout contract in docs/HERO.md |
| 25 Sep | The link-preview (OG/Twitter) video is the trailer, not the story film | More exciting, and it shows gameplay | index.html between the SHARE_VIDEO markers |
| 25 Sep | World Flower design: 44 glassy teardrop petals, vowels in the inner ring and consonants outside, on a jade stem | Chosen from 4 design rounds (assets-src/world-flower/) | Pick another concept from the contact sheets |

## Decided by Jonas (for reference)

- **Sounds~Write:** official September 2024 guidance, with no split spellings; official unit order; keep the pre-letter warm-ups; cover the whole programme (docs/SOUNDS_WRITE_MODEL.md, Decisions).
- **Rewards and pace:** stickers first (stars in the background); I do / we do / you do; exported logs may be used by hand for calibration; pace follows mastery (docs/ARCHITECTURE.md §15).
- **Architecture:** logic decoupled from the UI; event log, learner model, planner, director; text-adventure transcripts and audits (docs/ARCHITECTURE.md).
- **Quota:** full speed; when the weekly limit hits, pause until the reset (the herdr watchdog wakes the session).
- **Dev tools:** Jev only in the development process, never in the product. Never `rm`; never ask questions, just log them here.

## Open questions (for later, nothing is blocked on them)

- **Freshford:** does it still teach split spellings? Which unit each week? How does it treat the Bridging Unit? Which readers go home, which assessments does it use, and is "tricky" said to children? (DOSSIER §16.18)
- **The official Udemy parent course:** free, but it needs enrolment on Jonas's own account. It would give us the official error-correction lectures and word lists. Worth doing?
- **Model constants** (learner parameters, dosage, limits by age, idle ladder): tune from real exported logs. When can we get a first log from the children?
- **worlds.ts past Bamboo Village:** how much of the hand-made level order should survive once the planner drives (ARCHITECTURE §15.7 proposes keeping only the authored anchors)?
- **Content scale:** reaching EC49 needs about 2,100 words and 800 pictures. Is the pace of generation, and the human sampling review (10% per unit), OK, and who samples?
