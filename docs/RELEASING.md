# Releasing Super Ninja

Every version of the game ships together with an updated landing page: fresh gameplay videos, screenshots, a share image and numbers. One command does the mechanical part:

```sh
scripts/release.sh            # patch: 1.0.0 → 1.0.1
scripts/release.sh minor      # new features: 1.0.0 → 1.1.0
```

The site is live at **https://superninja.templestein.com** (landing page at `/`, game at `/play/`).

## What the script does

| Step | What | Why |
|---|---|---|
| 1 | Bumps `package.json` version | The version shows in the landing footer, grown-ups area and `stats.json` |
| 2 | `gen-audio`, `gen-art`, `post-art` | New words, lines, stories or art are generated. Existing files are kept, so this is cheap when nothing changed |
| 3 | Typecheck, story decodability check, **asset check**, stats | Fails fast if any word, sound, line, picture or clip is missing |
| 4 | Starts a local Vite server on :5174 | |
| 5 | **Smoke test** (`scripts/smoke.ts`) | A bot plays a Dojo, Battle, Run, Swap, Story, Boss, Sort, Ninja Training and the placement game to the end, and fails on any page error |
| 6 | `record-clips.ts`, `screenshots.ts`, `og.ts`, `shoot-landing.ts` | Re-records every landing-page video and still **from the current build**, so the page always shows the game as it is |
| 7–8 | `vite build` + `wrangler deploy` | Uses the Cloudflare token in Doppler `os`/`dev` |
| 9 | Checks production URLs and that `stats.json` shows the new version | |

## The human part (every release)

1. **Look at the landing screenshots** the script prints (desktop and phone). Check the videos show the new feature, and that nothing overlaps or is cut off.
2. **Update the copy** in `index.html` if a feature was added, changed or removed. Numbers (worlds, levels, words, stories, Muddlings) come from `public/media/stats.json` automatically. Anything else is hand-written, so check:
   - the hero line and promises (British sounds, ages 3–8),
   - "Every move is a reading move": one card per game mode, each with a clip,
   - "Grow the Sound Flower": how gems and trials work,
   - "No reading needed to play": the help button, training and placement,
   - "For parents & teachers": teaching claims must stay true,
   - the FAQ.
3. **New game mode?** Add a clip to `CLIPS` in `scripts/record-clips.ts` (a URL, a saved game state and the bot does the rest), add a card in `index.html`, and add a still in `scripts/screenshots.ts` plus a `<figure>` in the gallery.
4. **Add a `CHANGELOG.md` entry** in plain words for parents, and tick items off in `docs/FEEDBACK.md`.
5. **Play it on a real phone** once (`/play/`, sideways, sound on).

## Rules for the landing page

- Never claim anything the game doesn't do. If it's not in the build, it's not on the page.
- Sounds~Write is a registered trade mark. Refer to it by name and link to sounds-write.co.uk, keep the "independent project, not endorsed" line, and don't use their logo or materials without written permission.
- Don't advertise "free", "no sign-up" or "no ads" (Jonas: "of course it's free"). Age guidance is 3–8.
- Videos are muted, autoplay only while visible, and have posters (phones on data plans).

## Useful single commands

```sh
bun scripts/record-clips.ts http://localhost:5173 battle flower   # re-record just some clips
bun scripts/screenshots.ts                                          # all gallery stills
bun scripts/smoke.ts                                                # just the bot test
bun scripts/check-assets.ts                                         # missing files?
```
