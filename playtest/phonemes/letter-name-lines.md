# Spoken-line letter-name scan

Scanned the 721 effective `LINES` entries in `src/content/lines.ts`, including all 205 entries imported from `teach-lines.gen.ts`. Checked quoted single letters, bare spelling strings (`ck`, `ai`, `igh`, etc.), comma or hyphen separated letter sequences, and `/sound/` notation in the **spoken text**. Ordinary words such as “see”, “bee”, “I”, and the article “a” were checked in context.

| Offending line id | Suggested rewording |
|---|---|
| None | No line gives TTS a raw phoneme spelling or slash notation to pronounce as a letter name. |

`audit_special_i` says “This is 'I'. Just say 'I' here.” Its /aɪ/ pronunciation is the common **word** “I”, which is the intended target in that line. If its purpose changes to teach short /ɪ/, replace the quoted word with a carrier example such as “Listen to the middle sound in pig,” followed by the /ɪ/ clip; do not ask TTS to say a bare `i`.

The current teaching lines use lead-ins such as “This is the sound...” and join a separate phoneme clip at runtime. That keeps isolated spellings out of TTS text.
