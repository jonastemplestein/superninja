# Speech templates: shipping and playing tens of thousands of clips

*For Jonas's request of 27 Sep: "templatize the recordings and thus create more natural speech … 'say the sound a' … 'say mat slowly' … This needs to work super well."*

Written 27 Sep 2026 by the delivery lane of the speech-templates workflow. The [inventory](inventory.md) counts how many whole-sentence clips templating needs. [prior-art.md](prior-art.md) covers how other systems do it. This document covers how that many short clips get from the build to a child's ear: hosting, file format, decode memory, the service worker's cache, and preloading. Everything below was measured on this machine or checked against the live account. The scripts are listed in [How it was measured](#how-it-was-measured).

---

## The short version

- **File count is not the problem.** Jonas's Cloudflare account is on **Workers Paid** (checked through the API: subscription `workers_paid`, $5 a month). That allows **100,000 static-asset files per version**, with 25 MiB per file. Our wrangler is 4.140.0; the higher limit needs 4.34.0 or later. The whole programme's full set of whole-sentence clips (inventory: about 36,400) plus today's roughly 4,200 files comes to about **40,600 files, 41% of the cap**. Wrangler reads and hashes 60,000 files in 12.6 s, and it uploads only files that changed. So we stay on Workers static assets, **one file per clip**, in `/a/t/<template>/<member>.mp3`. A deploy gate fails at 80,000 files. Past that, `/a/t/` moves to R2 (§2.4).
- **No audio sprites.** Web Audio decodes a whole file into float32. A sprite of one template across the vocabulary would decode to about 480 MiB. Per-unit sprites fit, but they hold every member in memory for as long as any one is needed. Safari also shifts MP3 offsets by 576 samples, which we measured, so sprite offsets drift between browsers. The file-count reason for sprites (the Free plan's 20,000 cap) doesn't apply to us. If we ever need fewer files, we should pack complete MP3s into a bundle that the service worker splits back into one cache entry per clip. That is not a sprite (§4.3).
- **Keep MP3, but encode new clips at 24 kHz, 48 kbps.** Gemini's TTS is 24 kHz, so these clips have nothing above 12 kHz: the energy up there is 0.03% on average. A 1.25 s sentence goes from 13.8 KB to **7.9 KB (57%)**. Opus would get it to 3.8–5.7 KB, but:
  - Ogg Opus needs iOS 18.4, and WebM Opus in `<audio>` needs iOS 17.4.
  - CAF Opus doesn't decode in Chromium at all (measured).
  - Old iPads stuck on iPadOS 15–16 are common hand-me-downs for small children.

  Pure sounds (`/a/p/`) are never re-encoded.
- **Decode speech at 24 kHz and halve decode memory.** `decodeAudioData` on an `OfflineAudioContext(1, 1, 24000)` returns a 24 kHz buffer, and that buffer plays in the 48 kHz game context. We tested this in Chromium and WebKit, for every format. An average line drops from **525 KiB to 262 KiB** decoded, and a 1.25 s sentence from 234 KiB to 117 KiB. The 40 MiB least-recently-used store then holds about 350 templated sentences instead of 175. Pure sounds keep the full rate.
- **Rebuild the service worker's cache so that one re-recorded clip doesn't empty every phone.** Today any change under `public/a/` drops the whole audio cache. That happens on almost every deploy: `public/a/` changed in 5 backup commits in 7 days, and `preview.sh` ships every passing build to production. The new design:
  - Split each folder into 16 hash buckets.
  - Give each bucket its own cache, named after the bucket's content hash.
  - When a deploy lands, drop only the caches whose hash changed.

  Tested in Chromium and WebKit: after one clip changed, **17 of 300 cached clips went back to the network, exactly that clip's bucket**. The page code doesn't change at all (§5).
- **Two bugs today, found while measuring:**
  1. A missing clip comes back as **`200 text/html`**: Cloudflare's single-page-app fallback serves `index.html` for anything it can't find. The service worker then **caches that HTML under the clip's URL** until the next asset change. Templates that fall back to a splice when a whole sentence is missing would hit this all the time. The fix is a content-type guard in the service worker and in `load()`, plus a 10-line Worker that returns 404 for missing `/a/*` files (§7).
  2. `docs/PERF.md` says clips are 56 kbps and decode to 27× their download. Today's clips are about 86 kbps (`-q:a 4`), and they decode to **17.9×** their download.
- **Preload by fetching, not by decoding.** A new `warm(urls)` fetches the next level's clips at low priority into the service worker's cache without decoding them. Clips are decoded just in time, at most two at once, because WebKit bug 227636 shows iOS killing a tab during parallel decodes. A level with 40 templated sentences costs about **320 KB** to download and **4.6 MiB** decoded.

---

## 1. What we ship today (measured 27 Sep)

| folder | files | mean size | mean length | decoded at 48 kHz, float32 | decode ÷ download |
|---|---:|---:|---:|---:|---:|
| `l` lines | 1,170 MP3s (+35 word-timing JSON) | **30.1 KB** (median 28.7, p90 50.4) | 2.80 s | **525 KiB** (median 513) | 17.9× |
| `w` words | 1,238 | 7.7 KB | 0.68 s | 127 KiB | 17.0× |
| `p` pure sounds | 46 | 5.7 KB | 0.50 s | 94 KiB | 16.8× |
| `x` slow words | 163 at 06:40, 997 by 07:05 (being generated by the other workflow) | 12.7 KB | 1.18 s | 222 KiB | 17.9× |
| `s` story pages | 65 | 45.6 KB | 4.35 s | 816 KiB | 18.3× |
| whole-sentence family `fm_name_*` ("This is a sock.") | 56 | 13.8 KB | 1.25 s | 234 KiB | 17× |

- Every clip is 44.1 kHz mono MP3, LAME VBR `-q:a 4` (`scripts/gen-audio.ts` `finishLine`, `scripts/tts.ts` `finishAudio`), about 86 kbps. No WAV masters are kept.
- The phone's AudioContext runs at 48 kHz, so each clip decodes to `seconds × 48,000 × 4` bytes. The codec and bitrate don't matter.
- **The speech has almost nothing above 12 kHz**, because Gemini's TTS is 24 kHz. We measured the spectrum of 30 lines, 20 words and all 46 pure sounds. Energy above 12 kHz averages 0.03–0.04%, with a maximum of 0.27% for lines. Pure sounds reach 0.55%, from the fricatives.
- **File count:** `public/` has 3,288 files at the start of this run and 4,146 an hour later. `dist/` had 3,296 at its last build. `public/a/` is tracked in git (3,229 files), and `.git` is 367 MB.
- **Hosting.** `wrangler.jsonc` is assets-only with `not_found_handling: "single-page-application"`. Clips are served with `Cache-Control: public, max-age=0, must-revalidate` and an ETag. The server ignores a query string: `/a/p/a.mp3?v=abc` serves the file.
- **The service worker** (`src/pwa/sw.template.js`) keeps one cache, `sn-assets-<hash of every file under public/a>`. Any changed clip, picture or video gives a new hash, and `activate` deletes the whole cache. Clips then re-download one by one as they're next played. A phone that updates while online and then goes offline has **no cached audio**.

---

## 2. Where tens of thousands of files can live

### 2.1 The limits

| | Workers Free | **Workers Paid (our account)** |
|---|---|---|
| files per Worker version | 20,000 | **100,000** (wrangler ≥ 4.34.0; ours is 4.140.0) |
| file size | 25 MiB | 25 MiB |
| requests for static assets | free, unlimited | free, unlimited |
| requests that run a Worker | 100,000 a day | 10 million a month included, then $0.30 a million |

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/#static-assets), [the Sep 2025 changelog](https://developers.cloudflare.com/changelog/post/2025-09-02-increased-static-asset-limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/). The plan was read from `GET /accounts/05958bb7…/subscriptions`, which lists `workers_paid` and `r2_paid`.

### 2.2 How many files, and how big

Clip counts come from the inventory's `playtest/speech-templates/estimate.json` (whole-sentence renders; "lean" means the top templates with one phrasing each). Sizes assume 7.9 KB per clip at 24 kHz and 48 kbps. That is the measured mean for a 1.25 s sentence; the inventory's 0.8 GB figure assumed 22 KB per clip at today's encoding.

| tier | clips, full (lean) | files with today's ~4,200 | share of 100,000 | bytes, full (lean) | bytes at today's encoding |
|---|---:|---:|---:|---:|---:|
| Year R | 6,618 (3,941) | 10.8k | 11% | 52 MB (31 MB) | 91 MB |
| to the end of Year 1 | 14,222 (8,506) | 18.4k | 18% | 112 MB (67 MB) | 196 MB |
| whole programme | 36,429 (21,129) | 40.6k | 41% | **≈ 290 MB** (170 MB) | ≈ 515 MB |

### 2.3 What that costs to build and deploy

- **Wrangler:** a dry run read and hashed 60,033 files (469 MB) in **12.6 s**. Uploads skip any file whose hash the account already has, so after the first time a deploy uploads only new or re-recorded clips.
- **`vite build`** copies `public/` into `dist/`, and the service-worker plugin hashes all of `public/a/`. The bucket script (§5) hashed today's 4,086 files in 134 ms; expect about 1–2 s at 40k.
- **`scripts/preview.sh`** copies `dist/` into `playtest/.promote/dist` with `cp -R`. For 60,000 files that took 18 s and used another ~470 MB. `cp -cR` (an APFS clone) took 10 s and uses no extra space until files change. Each preview also moves the previous promote copy into `.trash/`, which is already 7.2 GB.
- **Git:** the full programme adds about 290 MB once, and every full re-render of a family adds its size again. That's fine for now. If `.git` passes about 1.5 GB, move `/a/t/` to R2 (below) and ignore it in git.

### 2.4 The way out if we ever pass 80,000 files: R2 behind the same origin

- Put `/a/t/*` in an R2 bucket.
- Serve it through a Worker route on `superninja.templestein.com/a/t/*` with an R2 binding and the Cache API. Keeping the same origin means no CORS and no service-worker changes.
- Upload R2 objects **before** deploying the build whose service-worker table names them. With the bucketed versions in §5, a newer clip can then only ever land in an older bucket's cache, which is dropped on the next activation. It can never land in a newer bucket's cache, where it would stick.
- **Cost at our scale is about $0.** 1,000 children × 100 clip fetches a day is 3 million Worker requests a month, inside the 10 million included. Clip reads are R2 Class B operations, 10 million free a month (the Cache API absorbs most of them). About 0.3 GB of storage is inside the 10 GB free tier. Egress is free ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)).
- **The real cost is operational:**
  - a second upload pipeline;
  - updates that aren't atomic with the deploy;
  - `vite dev` needs a proxy or a local mirror.

  Not worth it below the gate.

---

## 3. File format: MP3 stays, new clips go to 24 kHz

### 3.1 Sizes

We re-encoded 150 random lines, 150 random words and the 56 `fm_name_*` sentences from 24 kHz WAV.

| format | lines (2.8 s) | words (0.7 s) | 1.25 s sentences | vs today |
|---|---:|---:|---:|---:|
| **today:** MP3 44.1 kHz VBR q4 | 29.8 KB | 7.4 KB | 13.8 KB | 100% |
| MP3 24 kHz VBR q4 / q5 | – | – | 10.4 / 9.1 KB | 75 / 66% |
| **MP3 24 kHz CBR 48 kbps** (recommended) | – | – | **7.9 KB** | **57%** |
| MP3 24 kHz CBR 40 kbps | 14.4 KB | 3.8 KB | – | 48–51% |
| AAC-LC 24 kHz 32 kbps (`.m4a`, Apple encoder) | 12.7 KB | 4.0 KB | – | 43–54% |
| Opus 32 kbps in WebM | 12.3 KB | 3.3 KB | 5.7 KB | 41–45% |
| Opus 24 kbps in WebM / Ogg / MP4 | 9.6 / 8.5 / 9.5 KB | 2.7 / 2.1 / 2.8 KB | – / 3.8 / – | 29–38% |
| Opus 24 kbps in CAF (`afconvert`) | 12.2 KB | 5.9 KB | – | 41–81% (about 4 KB of header) |

### 3.2 Browser support and decode accuracy

We decoded each format with `decodeAudioData` in Playwright's Chromium 153 and WebKit (the Safari 26.6 engine on macOS). The table compares each decoded length with the 0.735 s source (35,284 samples at 48 kHz) and says where any extra samples go.

| format | Chromium | WebKit | iPhone / iPad support |
|---|---|---|---|
| MP3 | exact | **+576 samples of leading silence** (13 ms at 44.1 kHz, 24 ms at 24 kHz) and +33 ms at the end | every version |
| AAC `.m4a` | start exact, +33 ms at the end | start exact, +73 ms at the end | every version |
| Opus in WebM | exact | exact | `<audio>` from iOS 17.4. `decodeAudioData` worked earlier on some iPadOS versions, but `canPlayType` can't detect it ([WebKit 238546](https://bugs.webkit.org/show_bug.cgi?id=238546)) |
| Opus in Ogg | exact | exact | iOS 18.4 and later ([caniuse](https://caniuse.com/opus)) |
| Opus in CAF | **fails (EncodingError)** | exact | Safari only |

**Decision: MP3 for everything.** New templated clips use 24 kHz mono CBR 48 kbps, encoded from the TTS WAV:

```
ffmpeg -i in.wav -ar 24000 -ac 1 -c:a libmp3lame -b:a 48k out.mp3
```

- Never transcode an existing MP3.
- Never touch `/a/p/`.
- Jonas should ear-check 10 clips against today's encoding before the switch. If he hears artefacts, use VBR `-q:a 4` at 24 kHz (75%).
- Revisit Ogg Opus at 24 kbps (28% of today's size, sample-exact everywhere) once PostHog shows fewer than 1% of sessions on iOS below 18.4. Until then, Opus means two files per clip, or a WebAssembly decoder.

**For whoever builds the joins:** don't trust file boundaries, because WebKit's MP3 decode starts 13–24 ms late. Find each clip's true speech onset on the *decoded* buffer at run time: a threshold scan of the first ~100 ms takes microseconds. Ship build-time trim data only where the scan fails (soft onsets such as /h/ or /f/), as a small `/a/t/<template>/_trim.json` per folder. It goes through the same service-worker cache. A 36,000-entry table does not belong in the JS bundle.

---

## 4. Memory: decode speech at 24 kHz, one clip at a time

### 4.1 The budget

`docs/PERF.md` sets **64 MB of live decoded audio** as the ceiling. `audio.ts` keeps a **40 MiB** least-recently-used store (`DECODED_BUDGET`).

### 4.2 Decode at 24 kHz

```ts
// audio.ts: one shared decoder for speech; pure sounds and anything else use the game's context
const speechDecoder: BaseAudioContext | null = (() => {
  try { return new OfflineAudioContext(1, 1, 24000); } catch { return null; }
})();
const decoderFor = (url: string) => (url.startsWith("/a/p/") || !speechDecoder ? audioCtx() : speechDecoder);
```

- `decodeAudioData` resamples to the context it's called on. An `AudioBuffer` isn't tied to a context, and an `AudioBufferSourceNode` resamples on playback.
- Tested for MP3, AAC and Opus in Chromium and WebKit: each buffer came back at 24,000 Hz with half the length, and played in a 48 kHz context.
- **Halving the decode rate halves memory**:

| clip | decoded at 48 kHz | at 24 kHz | clips in the 40 MiB store, 48 → 24 kHz |
|---|---:|---:|---:|
| average line (2.8 s) | 525 KiB | 262 KiB | 78 → 156 |
| templated sentence (1.25 s) | 234 KiB | 117 KiB | 175 → 350 |
| a level's 40 templated sentences | 9.1 MiB | **4.6 MiB** | – |

- Pure sounds stay at the full rate. They are the clips whose fricative detail matters, and at 94 KiB each they're cheap.
- **Still to check on a real iPhone:** that `new OfflineAudioContext(1, 1, 24000)` works on iOS 15–18. The `try` falls back to today's behaviour if it doesn't.

### 4.3 Why not sprites

A sprite decodes as one buffer:

| sprite | length | decoded at 48 kHz (24 kHz) | verdict |
|---|---|---:|---|
| one template × 2,100 words | 44 min | 480 MiB (240) | impossible |
| one template family per unit (prior-art.md §4: 30–60 words) | 40–85 s | 7–16 MiB (4–8) | fits alone. A unit's activities use 5–10 families, which is 37–156 MiB if they're all resident |
| one level | ~50 s | 9 MiB (4.6) | fits, but every word that recurs across levels is stored again in each sprite, and any re-record re-downloads the whole sprite |

On top of that, WebKit's MP3 priming (§3.2) makes offsets inside a sprite browser-dependent. Individual files decode only what is said, when it is said, and share the one store.

**If the file count ever has to shrink, use a bundle instead:** complete, independently encoded MP3s concatenated with an index. The service worker fetches the bundle once and puts each slice into its bucket cache as its own `Response` (content type `audio/mpeg`). The rest of the game still sees one URL per clip, and nothing is decoded early. The same mechanism would work for a "download this world for offline play" button.

### 4.4 Limit parallel decodes

- `say()` starts loading every item of a sequence at once, and scenes `preload()` whole word lists. Each load decodes.
- [WebKit bug 227636](https://bugs.webkit.org/show_bug.cgi?id=227636) (cited in prior-art.md) shows iOS killing a tab during parallel `decodeAudioData` calls.
- Put decodes through a queue of 2. Fetches can stay parallel.

---

## 5. The service worker: hash-bucketed caches

### 5.1 Why not the obvious designs

- **One cache with a version per deploy (today).** Any change drops everything.
- **A version per folder.** Re-recording one clip in a 2,100-clip template drops all 2,100.
- **Content hashes in file names.** The client needs a manifest from each clip id to its hashed name. That's about 36,000 entries: roughly 1 MB of JSON for the page or the service worker to load, or a manifest per folder fetched before the folder's first clip can play.
- **One big cache swept entry by entry.** We measured Cache Storage with 2,000–30,000 entries on desktop:
  - **Chromium's `cache.keys()` throws "Operation too large" somewhere between 16,000 and 20,000 entries** (it takes 81 ms at 16,000).
  - `match(..., { ignoreSearch: true })` scans linearly: 31 ms at 20,000 entries and 49 ms at 30,000, before the ×4–5 phone slowdown.
  - WebKit lists 30,000 entries in 264 ms.

  So a single large cache can't be swept in Chrome.

### 5.2 The design (reference: `playtest/speech-templates/delivery/sw-buckets.template.js` and `buckets.ts`)

- **At build time.** Every file under `public/a/` belongs to a bucket: its folder (`l`, `w`, `t/say_slowly`, …) plus `fnv1a(file name) % 16`.
  - A bucket's version is the first 6 hex characters of a SHA-1 over its files' names and SHA-1s.
  - The table `{ folder: 16 × 6 chars }` goes into `sw.js`. Today it's 1,032 bytes for 10 folders; with about 40 template folders it will be about 5 KB.
  - The build also puts the list of `/assets/` files into `sw.js`.
- **At fetch time.** For `/a/<folder>/<file>`, the service worker computes the bucket and version and opens the cache `sn-a:<folder>:<bucket>:<version>`.
  - It matches the bare path.
  - On a miss it fetches `<path>?v=<version>`, which gets past any stale copy in the HTTP cache.
  - It stores the response **only if the status is 200 and the content type is `audio/`, `image/` or `video/`**.
  - Folders the build didn't see, and files sitting directly in `/a/`, go straight to the network.
- **At activation.** The service worker lists **cache names only** (at most a few hundred, never entries) and deletes every `sn-a:…` whose version isn't current, plus the old `sn-assets-*`.
  - Hashed `/assets/` files live in `sn-code`, which is pruned against the build's list.
  - The app-shell cache doesn't change.
- **The page doesn't change.** Without a service worker (localhost, first visit), the ETag revalidation we have today keeps clips fresh.
- **Caches are opened per request** (about 0.1 ms). Holding `Cache` handles across a worker update lost entries in WebKit's ephemeral (private-style) contexts.

### 5.3 Test (`node playtest/speech-templates/delivery/sw-test.mjs`)

The test builds a fake site with 2,000 clips in `/a/t/say_slowly/` and 100 in `/a/l/`, served the way Cloudflare serves it (a missing file gives `200 text/html`). It uses a persistent browser profile, like a phone:

1. Fetch 300 clips.
2. Reload and fetch them again.
3. Re-record `w7.mp3`, rebuild `sw.js`, update the worker, and fetch the 300 again.
4. Fetch the 300 once more.
5. Fetch a missing clip twice.

| | Chromium | WebKit |
|---|---|---|
| 1. first visit: network fetches | 300 | 300 |
| 2. after reload | **0** | **0** |
| 3. after the re-record: network fetches (expected: `w7`'s bucket) | **17 (17 expected, all from that bucket)** | **17 (17)** |
| 4. again | 0 | 0 |
| stale bucket cache after activation | deleted | deleted |
| missing clip | `200 text/html`, both fetches went to the network: **not cached** | same |

Chromium was exact in every run. WebKit with a persistent profile was exact in 7 of 8 runs. In the eighth, one clip was fetched again in passes 2 and 3, and pass 4 was 0.

In a Playwright ephemeral context with memoised `Cache` handles, WebKit lost entries across the update: 300 were re-fetched, then 283. The clips still played, because a miss just goes to the network, but they were all downloaded again. The reference template no longer memoises. Raw output: `playtest/speech-templates/delivery/sw-test.result.json`.

**What a re-record costs now:** 1/16 of that clip's folder. That's about 130 clips of a 2,100-clip template, about 1 MB if all of them were cached, re-fetched lazily. Today it's every cached clip, picture and video. Regenerating a whole template drops only that template's folder.

### 5.4 Storage on the phone

- **Quota.** From Safari 17 / iOS 17, an origin may use up to 60% of the disk, and a Home Screen web app gets the same quota ([WebKit: storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)).
- **Eviction** is least-recently-used, by whole origin, under storage pressure.
- A child who hears the entire programme caches at most about 290 MB of templated clips.
- Call `navigator.storage.persist()` once from the grown-ups screen. WebKit grants it by heuristics such as the site being opened as a Home Screen web app.

---

## 6. Getting clips there before they're needed

```ts
// audio.ts: fetch into the service worker's cache without decoding; 4 at a time, below the speech the child is hearing
const warmQueue = new Set<string>();
let warming = 0;
export function warm(list: string[]) {
  for (const u of list) if (!buffers.has(u)) warmQueue.add(u);
  pumpWarm();
}
function pumpWarm() {
  for (const u of warmQueue) {
    if (warming >= 4) return;
    warmQueue.delete(u);
    warming++;
    fetch(u, { priority: "low" } as RequestInit)
      .then((r) => r.arrayBuffer())
      .catch(() => {})
      .finally(() => (warming--, pumpWarm()));
  }
}
```

- **When to warm:**
  - When a level starts, warm all of its clips. That's the activity's templates × the words the planner chose. `say()` already loads a sequence's clips up front, so only the first clip of each sentence risks a wait.
  - When the map highlights the next node, warm that level's clips too.
  - Keep `preload()` (which decodes) for the first clip or two a scene needs instantly.
- **What it costs:** a level of 40 templated sentences is about 320 KB, and 4.6 MiB decoded (§4.2).
- **What each activity needs to declare:** a list of its templates, so that `clipsFor(activity, words)` can list its URLs without playing anything. The text-adventure runner in `src/core` can then check at build time that every URL exists.
- **Offline, later:** "download this world" is `warm(clipsFor(every level in the world))`. About 300 words × 8 templates is about 2,400 clips, or 19 MB.

---

## 7. Missing clips

The client guard is required. The Worker is optional but cheap.

- **Guard both caches.** In the service worker (above), and in `load()`:

  ```ts
  r.ok && /^audio\//.test(r.headers.get("content-type") ?? "") ? r.arrayBuffer() : Promise.reject(new Error(`missing ${url}`))
  ```

  A template can then fall back to its splice straight away, instead of logging a decode failure.
- **Return a real 404.** Static assets are matched before any Worker runs, so this runs only for requests that match no file, and only non-navigation ones. It costs nothing in practice:

  ```ts
  // worker/assets.ts (new)
  export default {
    fetch(req: Request, env: { ASSETS: Fetcher }) {
      if (new URL(req.url).pathname.startsWith("/a/")) return new Response(null, { status: 404 });
      return env.ASSETS.fetch(req); // everything else: the single-page-app fallback, as today
    },
  };
  ```

  Wire it up in `wrangler.jsonc` and `wrangler.next.jsonc` with `"main": "worker/assets.ts"` and `"assets": { …, "binding": "ASSETS" }`. Cloudflare's routing ([SPA docs](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)) sends navigations to the SPA fallback without invoking the Worker.

---

## 8. What would change, file by file

None of these files are mine to edit (they're shared, or the teacher-voice-petals-scroll workflow is editing them). In priority order:

1. **`src/pwa/sw.template.js`**: replace with `playtest/speech-templates/delivery/sw-buckets.template.js` (tested, §5.3). The first deploy drops the old `sn-assets-*` cache once.
2. **`vite.config.ts`**: replace the `swVersion` plugin. Promote `buckets.ts` to `scripts/lib/asset-buckets.ts`, then:

   ```ts
   generateBundle(_, bundle) {
     const { table } = assetBuckets(resolve(import.meta.dirname, "public/a"));
     const code = Object.keys(bundle).filter((f) => f.startsWith("assets/")).map((f) => `/${f}`);
     const source = readFileSync(resolve(import.meta.dirname, "src/pwa/sw.template.js"), "utf8")
       .replaceAll("__SN_BUCKETS__", JSON.stringify(table)).replaceAll("__SN_CODE__", JSON.stringify(code));
     this.emitFile({ type: "asset", fileName: "sw.js", source });
   }
   ```
3. **`src/engine/audio.ts`**:
   - the content-type guard in `load()` (§7);
   - decode speech at 24 kHz, except `/a/p/` (§4.2);
   - a decode queue of 2 (§4.4);
   - `warm()` (§6);
   - `urls.tpl = (t, m) => \`/a/t/${t}/${fid(m)}.mp3\``;
   - change `DECODED_BUDGET`'s comment from "about 130 speech clips" to about 156 average lines, or 350 templated sentences, at 24 kHz.
4. **`scripts/preview.sh`** and **`scripts/release.sh`**:
   - next to the 25 MiB check, add a file-count gate:

     ```sh
     n=$(find dist -type f | wc -l); [ "$n" -le 80000 ] || { echo "✗ $n files in dist: over the 80,000 budget (Workers Paid allows 100,000)"; exit 1; }
     ```
   - in `preview.sh`, use `cp -cR dist "$F/dist"`.
5. **`scripts/gen-audio.ts`, or the new template generator.** Templated clips go to `public/a/t/<template>/<member>.mp3`, with one folder per template family so that a re-render invalidates only that folder.
   - Encode with `-ar 24000 -ac 1 -c:a libmp3lame -b:a 48k` from the TTS WAV.
   - Keep a FLAC master in `assets-src/speech/<template>/<member>.flac`. That folder is git-ignored, so optionally sync it to R2: about 34 KB per clip, about 1.2 GB for the full programme, inside R2's free 10 GB.
   - `finishLine`/`finishAudio` and `/a/p/` stay as they are.
6. **`scripts/check-assets.ts`**:
   - every template × member the content can produce exists;
   - nothing in `/a/t/` is non-audio;
   - print the file count against the 80,000 budget.
7. **`wrangler.jsonc`, `wrangler.next.jsonc` and a new `worker/assets.ts`**: the 404 for missing `/a/*` (§7).
8. **Scenes (later, when the other workflow is done):**
   - big `preload()` word lists become `warm()`;
   - activities declare their templates for `clipsFor()`.
9. **`docs/PERF.md`**: correct "56 kbps … about 27× their download" to "about 86 kbps (`-q:a 4`) … 17.9×", and note the 24 kHz decode.
10. **`docs/DECISIONS.md`**: log these decisions:
    - Workers static assets, one file per clip, with an 80,000-file gate;
    - MP3 at 24 kHz and 48 kbps for new speech, with Opus revisited at iOS 18.4 and above 99%;
    - decode speech at 24 kHz;
    - hash-bucketed service-worker caches;
    - no sprites.

---

## 9. Open checks

- **On a real iPhone and an old iPad:**
  - the 24 kHz `OfflineAudioContext` decode;
  - the bucketed service worker surviving an update;
  - Cache Storage behaviour when opened as a Home Screen web app.
- **Jonas's ear:** 10 clips at 24 kHz / 48 kbps against today's encoding.
- **PostHog:** the share of sessions on iOS below 17.4 and below 18.4, before any move to Opus.

---

## How it was measured

All the scripts are in `playtest/speech-templates/delivery/`. Bulky outputs are in `playtest/runs/speech-templates/delivery/`, which is git-ignored.

| what | script |
|---|---|
| clip sizes, lengths, decoded sizes | `measure/clip-stats.py` (ffprobe) |
| energy above 12 kHz | `measure/bandwidth.py` |
| sizes per format (300 clips) | `measure/codec-sizes.py`; the 56 `fm_name_*` sentences were measured inline, same method |
| `decodeAudioData` support, 24 kHz decode and playback per engine | `measure/codec-decode.mjs` (Playwright Chromium 153, WebKit / Safari 26.6 engine; Firefox wasn't installed) |
| decoded lengths and where the extra samples go | `measure/codec-offsets.mjs` |
| Cache Storage limits and timings (2k–30k entries) | `measure/cache-limits.mjs` |
| bucket table for today's `public/a/` | `bun playtest/speech-templates/delivery/buckets.ts` |
| the bucketed service worker, end to end | `sw-test.mjs` → `sw-test.result.json` |
| Cloudflare plan and routes | API: `/accounts/…/subscriptions`, `/workers/scripts/super-ninja/settings`; `curl -I` against production |
| wrangler at 60,000 files | `wrangler deploy --dry-run` on a synthetic 60,000-file folder (7.5 KB random files, 469 MB) |
