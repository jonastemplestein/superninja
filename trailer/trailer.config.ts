// SUPER NINJA — trailer edit decision list.
// Edit this file and run `bun scripts/trailer/build.ts`. Only assets whose recipe changed are regenerated
// (content-hashed cache in assets-src/trailer/cache). See docs/TRAILER.md.
//
// Paths are repo-relative. Source footage is referenced by path (never copied), so when the game's
// intro shots or sprites are regenerated, a rebuild picks up the new versions automatically.

// ───────────────────────────── types ─────────────────────────────
export type Who = "sensei" | "baron" | "narrator";
export interface Voice { who: Who; text?: string; file?: string; in?: number; dur?: number }
export type Sfx =
  | { synth: "boom" | "hit" | "riser" | "whoosh" | "reverse" | "tick" | "shimmer"; dur?: number; pitch?: number }
  | { file: string; in?: number; dur?: number };
export interface GenImage { prompt: string; refs: string[]; aspect?: string }
export interface GenVideo { engine: "omni" | "veo"; frame: string /* "img:<id>" or a path */; lastFrame?: string; prompt: string }

export interface VideoSrc {
  src: string; // repo path, or "gen:<id>" for a generated video
  in?: number; // seconds into the source
  speed?: number; // 0.5 = half speed
  zoom?: [number, number]; // scale at shot start / end (1 = full frame), e.g. [1, 1.12] slow push-in
  focus?: [number, number]; // zoom centre, 0..1 (default centre)
  audio?: number; // gain for the source's own soundtrack (default 0 = muted)
  vfocus?: number; // vertical cut: horizontal crop centre 0..1 (default 0.5)
  vfit?: boolean; // vertical cut: letterbox the whole frame over a blurred copy instead of cropping
  grade?: "cold" | "dark" | "warm"; // quick colour grade
}

export interface Card {
  style: "slam" | "stamp" | "whisper" | "logo" | "url" | "flower";
  text: string; // use "\n" for line breaks
  sub?: string;
  url?: string; // shown as a big pill (end cards)
  sprite?: string; // optional character art that pops in (repo path)
  sprite2?: string;
  accent?: "pink" | "gold" | "purple" | "cream";
}

export interface Shot {
  id: string;
  dur: number; // seconds
  video?: VideoSrc; // omit for a full-screen card / black
  card?: Card; // full-screen card if there is no video, otherwise an overlay
  letterbox?: boolean; // 2.39:1 cinema bars (landscape cut only)
  flash?: "in" | "out"; // white flash on the cut in / out
  fadeIn?: number;
  fadeOut?: number;
  shake?: number; // seconds of camera shake from the start of the shot
  music?: number; // score gain during this shot (default 1). 0 = hard silence.
  vo?: { line: string; at?: number; gain?: number }[]; // at: seconds from shot start
  sfx?: { name: string; at?: number; gain?: number }[];
}

export interface MusicSection { from: string /* shot id */; name: string; styles: string[]; avoid?: string[] }

export interface TrailerConfig {
  title: string;
  images: Record<string, GenImage>;
  videos: Record<string, GenVideo>;
  voices: Record<string, Voice>;
  voiceCast: Record<Who, { engine: "gemini" | "eleven"; voice: string }>;
  sfx: Record<string, Sfx>;
  music: { engine: "eleven" | "lyria" | "file"; file?: string; seed?: number; gain: number; duckDb: number; sections: MusicSection[] };
  shots: Shot[];
  teaser: { from: string; to: string }[]; // ranges of shots (inclusive) cut together into the teaser
  poster: { shot: string; at: number };
}

// ───────────────────────────── art direction ─────────────────────────────
const STYLE =
  "Art style: premium hand-painted 2D children's video game art, exactly matching the reference images: bold clean dark-brown ink outlines, rich saturated cel-shaded colours with soft painterly texture, warm rim light, big readable silhouettes, expressive friendly faces. Cinematic widescreen 16:9 film still, dramatic movie-trailer lighting and composition. Characters must match the reference sprites exactly (same colours, costume, proportions, chibi about 2.5 heads tall). No other characters than the ones described (no red panda, no Sensei, no bystanders). No text, no letters, no logos, no watermark, no signature.";
const MOTION =
  "Hand-painted 2D cartoon animation in exactly the same illustrated style as the image: bold ink outlines, rich cel-shaded colours, painterly texture. Keep every character exactly on-model for the whole shot. One continuous shot, no cuts. No text, no captions, no subtitles. No speech, no talking, no voices: only epic music and sound effects. Exciting like a blockbuster movie trailer, but friendly for young children: no gore, nothing truly scary.";
const KAI = "Kai: a small boy ninja with spiky black hair in a top knot, a long red headband with flowing tails, navy-purple ninja gi with a gold sash, bandaged wrists and feet (exactly like the boy reference)";
const SUKI = "Suki: a small girl ninja with two big auburn hair buns, a pink headband with flowing tails, freckles, teal trousers, cream-and-pink top with a gold sash (exactly like the girl reference)";
const BARON = "Baron Muddle: a dark charcoal-green toad sorcerer with glowing red eyes, a jagged black iron crown with a purple gem, torn black-and-crimson cloak, clawed hands crackling with purple magic, holding a dark tattered war fan (exactly like the toad reference)";
const CUT = "assets-src/cut/";

// ───────────────────────────── the edit ─────────────────────────────
const config: TrailerConfig = {
  title: "Super Ninja — trailer",

  // Start frames (Nano Banana Pro). Sensei is being redesigned, so no new shot includes her.
  images: {
    hero: {
      refs: [CUT + "hero_kai_jump.png", CUT + "hero_suki_cast.png", "assets-src/art/title_bg.png"],
      prompt: `${STYLE} Low heroic angle on the grassy cliff top at golden dawn, the bare grey Great Blossom Tree behind them (the environment reference: cliff, bare tree, valley). ${KAI} on the LEFT and ${SUKI} on the RIGHT have just landed side by side in bold ninja fighting stances, fists and palms ready, determined confident grins, headband tails whipping in the wind. Swirls of glowing golden magic light spiral around their hands, a few glowing pink blossom petals drift past, sun rays burst behind them. Epic hero reveal.`,
    },
    baron: {
      refs: [CUT + "baron_angry.png", CUT + "mon_boss_baron.png", "assets-src/art/title_bg.png"],
      prompt: `${STYLE} Dramatic close-up of ${BARON}, framed from the chest up, filling the right two-thirds of the frame, leaning towards the camera with a slow sly villain grin, glowing red eyes narrowed, purple lightning crackling in the stormy night sky behind him, purple magic flickering between his raised claws. Moody purple and crimson lighting. Menacing like a cartoon movie villain, but not scary for small children.`,
    },
    clash: {
      refs: [CUT + "hero_kai_cast.png", CUT + "baron_angry.png", "assets-src/art/title_bg.png"],
      prompt: `${STYLE} Wide showdown on the stormy cliff top at night, the bare Great Blossom Tree in the centre background. LEFT: ${KAI}, feet planted, both palms thrust forward firing a blazing beam of golden light full of glowing golden sparkles. RIGHT: ${BARON}, sweeping his war fan and firing a crackling purple magic blast. The golden beam and the purple blast collide exactly in the centre in a huge bright burst of light and sparks. Wind whips cloaks and headband tails. Epic, bright, exciting.`,
    },
    win: {
      refs: [CUT + "hero_suki_throw.png", CUT + "hero_kai_cast.png", CUT + "baron_defeated.png", "assets-src/art/title_bg.png"],
      prompt: `${STYLE} On the cliff top as the storm breaks into golden sunrise: ${SUKI} and ${KAI} stand together on the LEFT, arms raised in triumph as their golden magic fades to sparkles. On the RIGHT, ${BARON} has been knocked onto his bottom in a puff of purple smoke, dizzy, crown tilted, looking silly and defeated (like the defeated toad reference). Hundreds of glowing pink blossom petals burst out of the purple smoke and stream up and back towards the bare Great Blossom Tree in the background. Joyful and triumphant.`,
    },
  },

  // Generated shots (Gemini Omni 1.1 Flash image-to-video, 1080p).
  videos: {
    hero: { engine: "omni", frame: "img:hero", prompt: `${MOTION} The two little ninjas have just landed: dust and petals burst up around their feet, they snap into their fighting stances with a cool spin of their hands, golden magic swirling brighter, headband tails whipping in the wind. The camera does a fast dramatic push-in and slight low-angle tilt up. Sun rays flare. Big heroic whoosh and boom.` },
    baron: { engine: "omni", frame: "img:baron", prompt: `${MOTION} Baron Muddle slowly leans towards the camera, his red eyes glow brighter and narrow, his grin widens into a sly villain smile, purple magic crackles between his claws and lightning flashes behind him lighting up his crown. Very slow ominous push-in. Low rumbling thunder.` },
    clash: { engine: "omni", frame: "img:clash", prompt: `${MOTION} The golden beam from the little ninja and the purple blast from Baron Muddle push against each other in the centre, sparks flying, the ground shaking; the golden light surges forward and starts winning, pushing the purple magic back towards the Baron, who strains and grimaces. Fast dynamic camera push-in with slight shake. Huge magical energy crackle and wind.` },
    win: { engine: "omni", frame: "img:win", prompt: `${MOTION} Baron Muddle wobbles dizzily in the purple smoke and flops back comically; a fountain of glowing pink petals pours out of the smoke and swirls up into the sky in a spiral, streaming back to the Great Blossom Tree, which starts to glow pink. The ninjas cheer and jump. Golden sunrise breaks through the clouds. Camera cranes up to follow the petals. Triumphant.` },
  },

  // Casting: Sensei and Baron use the game's own Gemini TTS voices, so the trailer sounds like the game.
  voiceCast: {
    sensei: { engine: "gemini", voice: "Sulafat" },
    baron: { engine: "gemini", voice: "Algenib" },
    narrator: { engine: "eleven", voice: "JBFqnCBsd6RMkjVDRZzb" }, // ElevenLabs "George": warm British storyteller
  },
  voices: {
    intro_1: { who: "sensei", file: "public/a/l/intro_1.mp3" }, // "Long ago, on the Island of Sounds, there grew a Great Blossom Tree."
    intro_2: { who: "sensei", file: "public/a/l/intro_2.mp3" }, // "Every petal was a sound. And with sounds... we make words!"
    intro_3: { who: "baron", file: "public/a/l/intro_3.mp3" }, // "Words, words, WORDS! How I HATE them!"
    intro_4: { who: "baron", file: "public/a/l/intro_4.mp3" }, // "I am Baron Muddle! Every sound on this island is MINE! Mwa-ha-ha-ha!"
    intro_6: { who: "sensei", file: "public/a/l/intro_6.mp3" }, // "Now nobody can read!"
    cold_1: { who: "sensei", text: "On the Island of Sounds... every petal is a sound." },
    mine: { who: "baron", text: "Every sound on this island... is MINE!" },
    need_hero: { who: "sensei", text: "We need a hero." },
    super_ninja: { who: "sensei", text: "We need... a Super Ninja!" },
    strongest: { who: "sensei", text: "Listen carefully... and spell your strongest spells!" },
    gem: { who: "sensei", text: "You won the gem!" },
    come_far: { who: "baron", text: "You have come far... little ninja." },
    dare: { who: "baron", file: "public/a/l/baron_grr.mp3" }, // "Grrrr... You dare to fight ME?"
    title: { who: "narrator", text: "Super Ninja. Read. Spell. Save the island." },
    back: { who: "baron", file: "public/a/l/baron_lose.mp3", in: 2.55 }, // the game's own take: "This is not over, ninja... I will be back!"
  },

  sfx: {
    boom: { synth: "boom" },
    boom_low: { synth: "boom", pitch: 0.8, dur: 4.5 },
    hit: { synth: "hit" },
    riser: { synth: "riser", dur: 3 },
    riser_long: { synth: "riser", dur: 5 },
    whoosh: { synth: "whoosh" },
    reverse: { synth: "reverse", dur: 1.2 },
    tick: { synth: "tick" },
    shimmer: { synth: "shimmer" },
    thunder: { file: "assets-src/sfx/thunder.wav" },
    zap: { file: "assets-src/sfx/zap.wav" },
    petal: { file: "assets-src/sfx/petal.wav" },
    great: { file: "assets-src/sfx/great.wav" },
    swish: { file: "assets-src/sfx/swish.wav" },
  },

  // Score: ElevenLabs Music v2 composition plan. Each section runs from its `from` shot to the next
  // section, so re-timing the edit re-times the score (and regenerates it).
  music: {
    engine: "eleven",
    seed: 7,
    gain: 0.9,
    duckDb: 9,
    // `name` becomes the chunk label ("[Intro] {instrumental}"); everything descriptive goes in `styles`,
    // because ElevenLabs sings/speaks any other text in a chunk as lyrics.
    sections: [
      { from: "o_black", name: "Magical Intro", styles: ["cinematic orchestral fairy-tale score", "shimmering celesta", "soft koto plucks", "airy strings", "gentle bamboo flute phrase", "sense of wonder", "Japanese-flavoured", "great production quality"], avoid: ["drums", "vocals"] },
      { from: "o_baron", name: "Villain Arrives", styles: ["sudden dark turn", "ominous low brass stabs", "thunderous taiko hits", "sneaky villain motif on bassoon and cellos", "rising menace", "movie villain entrance"], avoid: ["vocals", "horror"] },
      { from: "o_noread", name: "Hush", styles: ["sad and sparse", "lone shakuhachi flute", "soft low string drone", "quiet hope", "almost silence at the end"], avoid: ["drums", "vocals"] },
      { from: "r_hero", name: "Hero Reveal", styles: ["massive trailer impact on the downbeat", "bold heroic brass fanfare", "big taiko hits", "the hero theme is born"], avoid: ["vocals"] },
      { from: "c_train", name: "Adventure Build", styles: ["driving epic trailer build", "pulsing staccato strings", "relentless taiko ostinato", "fast shamisen riffs", "heroic flute melody", "rising intensity", "more percussion every few bars", "140 BPM"], avoid: ["vocals", "slow"] },
      { from: "x_silence", name: "Tension", styles: ["sudden hush", "low ominous rumble", "slow heartbeat drum", "dark string tremolo creeping upwards", "quiet and tense"], avoid: ["vocals", "melody", "loud"] },
      { from: "c_final", name: "Final Battle Climax", styles: ["orchestra erupts", "epic trailer climax", "huge taiko", "soaring brass", "racing strings", "cymbal swells", "building to the loudest peak of the piece", "maximum intensity"], avoid: ["vocals"] },
      { from: "e_logo", name: "Title Theme", styles: ["final huge hit", "triumphant heroic main theme", "warm brass and strings", "bells", "proud last statement", "big final chord ringing out"], avoid: ["vocals"] },
      { from: "e_url", name: "Outro", styles: ["soft magical sparkle tail", "gentle celesta and koto echo of the hero theme", "fading out"], avoid: ["drums", "vocals"] },
    ],

  },

  shots: [
    // ── ACT 1 · COLD OPEN (letterboxed) ─────────────────────────────
    { id: "o_black", dur: 0.6, letterbox: true, sfx: [{ name: "shimmer", at: 0.1, gain: 0.4 }] },
    { id: "o_island", dur: 3.0, letterbox: true, fadeIn: 0.4, video: { src: "public/media/intro_1_sound.mp4", in: 0.8, zoom: [1.0, 1.1], focus: [0.62, 0.5], audio: 0.35, vfocus: 0.7 }, vo: [{ line: "cold_1", at: 0.1 }] },
    { id: "o_petals", dur: 2.2, letterbox: true, video: { src: "public/media/intro_2_sound.mp4", in: 2.4, zoom: [1.04, 1.12], focus: [0.6, 0.5], audio: 0.3, vfocus: 0.6 } },
    { id: "o_baron", dur: 3.7, letterbox: true, flash: "in", shake: 0.5, video: { src: "public/media/intro_3_sound.mp4", in: 1.0, zoom: [1.05, 1.15], focus: [0.7, 0.45], audio: 0.5, vfocus: 0.72 }, vo: [{ line: "intro_3", at: 0.1 }], sfx: [{ name: "boom", at: 0 }, { name: "thunder", at: 0.05, gain: 0.8 }] },
    { id: "o_storm", dur: 4.6, letterbox: true, video: { src: "public/media/intro_4_sound.mp4", in: 1.2, zoom: [1.0, 1.08], audio: 0.7, vfocus: 0.6 }, vo: [{ line: "mine", at: 0.75 }], sfx: [{ name: "whoosh", at: 0.3, gain: 0.8 }, { name: "hit", at: 0.35, gain: 0.6 }] },
    { id: "o_scatter", dur: 1.8, letterbox: true, video: { src: "public/media/intro_5_sound.mp4", in: 1.2, speed: 1.3, audio: 0.5, vfocus: 0.4 } },
    { id: "o_noread", dur: 1.8, letterbox: true, video: { src: "public/media/intro_6_sound.mp4", in: 1.2, zoom: [1.0, 1.06], audio: 0.2, vfocus: 0.5 }, vo: [{ line: "intro_6", at: 0.0 }] },
    { id: "o_beat", dur: 1.4, letterbox: true, music: 0, vo: [{ line: "super_ninja", at: 0.0 }], sfx: [{ name: "reverse", at: 0.2, gain: 0.8 }] },

    // ── ACT 2 · HERO REVEAL ───────────────────────────────────────
    { id: "r_hero", dur: 3.0, flash: "in", shake: 0.4, video: { src: "gen:hero", in: 1.9, zoom: [1.02, 1.1], audio: 0.25, vfocus: 0.5 }, sfx: [{ name: "boom", at: 0 }, { name: "hit", at: 0 }] },

    // ── ACT 3 · THE BUILD (cuts get shorter and shorter) ─────────────
    { id: "c_train", dur: 1.7, card: { style: "slam", text: "MASTER\nEVERY SOUND", sprite: "public/a/i/sensei_cheer.webp", accent: "gold" }, sfx: [{ name: "hit", at: 0 }] },
    { id: "g_dojo", dur: 2.0, video: { src: "assets-src/trailer/clips/tr_dojo.mp4", in: 9.6, zoom: [1.0, 1.08], vfit: true }, sfx: [{ name: "great", at: 1.6, gain: 0.6 }] },
    { id: "c_spell", dur: 1.5, card: { style: "slam", text: "LISTEN.\nSPELL. CAST!", sprite: "public/a/i/hero_kai_cast.webp", accent: "pink" }, sfx: [{ name: "hit", at: 0 }] },
    { id: "g_battle", dur: 2.9, video: { src: "assets-src/trailer/clips/tr_battle.mp4", in: 9.4, zoom: [1.0, 1.1], focus: [0.5, 0.4], vfit: true }, vo: [{ line: "strongest", at: 0.0, gain: 0.9 }], sfx: [{ name: "zap", at: 1.9, gain: 0.8 }] },
    { id: "g_castle", dur: 1.5, video: { src: "assets-src/trailer/clips/tr_battle_castle.mp4", in: 6.2, zoom: [1.08, 1.0], vfit: true }, sfx: [{ name: "zap", at: 0.8, gain: 0.7 }] },
    { id: "c_run", dur: 1.2, card: { style: "slam", text: "RUN! JUMP! READ!", sprite: "public/a/i/hero_suki_run.webp", accent: "gold" }, sfx: [{ name: "hit", at: 0 }] },
    { id: "g_run", dur: 1.3, video: { src: "assets-src/trailer/clips/tr_run.mp4", in: 8.6, zoom: [1.05, 1.12], vfit: true }, sfx: [{ name: "whoosh", at: 0.1, gain: 0.6 }] },
    { id: "g_run2", dur: 1.1, video: { src: "assets-src/trailer/clips/tr_run_mountain.mp4", in: 1.0, zoom: [1.05, 1.12], vfit: true } },
    { id: "g_run3", dur: 1.1, video: { src: "assets-src/trailer/clips/tr_run_sky.mp4", in: 2.0, zoom: [1.05, 1.12], vfit: true }, sfx: [{ name: "whoosh", at: 0.1, gain: 0.6 }] },
    { id: "c_story", dur: 1.1, card: { style: "slam", text: "READ MAGICAL STORIES", accent: "cream" }, sfx: [{ name: "hit", at: 0 }] },
    { id: "g_story", dur: 1.5, video: { src: "assets-src/trailer/clips/tr_story.mp4", in: 11.2, zoom: [1.0, 1.08], vfit: true } },
    { id: "g_swap", dur: 1.3, video: { src: "assets-src/trailer/clips/tr_swap.mp4", in: 7.6, zoom: [1.0, 1.08], vfit: true }, sfx: [{ name: "swish", at: 0.2, gain: 0.6 }] },
    { id: "c_boss", dur: 1.1, card: { style: "slam", text: "BEAT THE\nBARON'S BOSSES", sprite: "public/a/i/mon_boss_oni.webp", accent: "purple" }, sfx: [{ name: "hit", at: 0 }] },
    { id: "g_bpanda", dur: 0.8, shake: 0.2, video: { src: "assets-src/trailer/clips/tr_boss_panda.mp4", in: 13.3, zoom: [1.1, 1.2], focus: [0.7, 0.5], vfocus: 0.72 }, sfx: [{ name: "hit", at: 0, gain: 0.7 }] },
    { id: "g_boni", dur: 0.7, shake: 0.2, video: { src: "assets-src/trailer/clips/tr_boss.mp4", in: 8.0, zoom: [1.1, 1.2], focus: [0.7, 0.5], vfocus: 0.72 }, sfx: [{ name: "hit", at: 0, gain: 0.7 }] },
    { id: "g_byeti", dur: 0.6, shake: 0.2, video: { src: "assets-src/trailer/clips/tr_boss_yeti.mp4", in: 12.5, zoom: [1.1, 1.2], focus: [0.7, 0.5], vfocus: 0.72 }, sfx: [{ name: "hit", at: 0, gain: 0.7 }] },
    { id: "g_bserpent", dur: 0.6, shake: 0.2, video: { src: "assets-src/trailer/clips/tr_boss_serpent.mp4", in: 11.5, zoom: [1.1, 1.2], focus: [0.7, 0.5], vfocus: 0.72 }, sfx: [{ name: "hit", at: 0, gain: 0.7 }] },
    { id: "g_bknight", dur: 0.5, shake: 0.2, video: { src: "assets-src/trailer/clips/tr_boss_knight.mp4", in: 14.4, zoom: [1.1, 1.2], focus: [0.7, 0.5], vfocus: 0.72 }, sfx: [{ name: "hit", at: 0, gain: 0.7 }] },
    { id: "g_trial", dur: 1.4, video: { src: "assets-src/trailer/clips/tr_trial.mp4", in: 10.8, zoom: [1.05, 1.18], focus: [0.4, 0.5], vfit: true }, sfx: [{ name: "zap", at: 0.3, gain: 0.7 }] },
    { id: "c_gems", dur: 2.0, card: { style: "flower", text: "WIN THE GEMS", accent: "gold" }, vo: [{ line: "gem", at: 0.75, gain: 1.4 }], sfx: [{ name: "shimmer", at: 0.2, gain: 0.6 }, { name: "petal", at: 0.45, gain: 0.5 }, { name: "petal", at: 0.8, gain: 0.5 }, { name: "petal", at: 1.05, gain: 0.5 }, { name: "petal", at: 1.25, gain: 0.5 }, { name: "boom", at: 1.36, gain: 0.8 }, { name: "shimmer", at: 1.38, gain: 0.8 }, { name: "riser", at: -1.0, gain: 0.5 }] },

    // ── ACT 4 · THE SHOWDOWN ─────────────────────────────────────
    { id: "x_silence", dur: 0.6, music: 0.15, vo: [{ line: "come_far", at: 0.3 }], sfx: [{ name: "boom_low", at: 0, gain: 0.8 }] },
    { id: "x_baron", dur: 2.7, fadeIn: 0.3, video: { src: "gen:baron", in: 5.6, zoom: [1.0, 1.08], focus: [0.65, 0.45], audio: 0.2, vfocus: 0.65 }, music: 0.3 },
    { id: "c_final", dur: 1.2, card: { style: "slam", text: "THE FINAL\nSHOWDOWN", accent: "purple" }, sfx: [{ name: "boom", at: 0 }] },
    // clash: Omni loses Baron's crown between ~1.5 s and ~3 s of the take, so we cut around it
    { id: "x_clash", dur: 1.4, shake: 0.6, video: { src: "gen:clash", in: 0.0, zoom: [1.0, 1.08], audio: 0.35, vfocus: 0.5 }, vo: [{ line: "dare", at: 0.1, gain: 0.9 }], sfx: [{ name: "hit", at: 0 }] },
    { id: "x_clash2", dur: 1.6, shake: 0.3, video: { src: "gen:clash", in: 3.0, zoom: [1.1, 1.2], focus: [0.55, 0.5], audio: 0.35, vfocus: 0.6 }, sfx: [{ name: "zap", at: 0, gain: 0.8 }] },
    { id: "g_baron1", dur: 0.55, flash: "in", video: { src: "assets-src/trailer/clips/tr_boss_baron.mp4", in: 24.6, zoom: [1.1, 1.2], focus: [0.6, 0.45], vfocus: 0.75 }, sfx: [{ name: "hit", at: 0, gain: 0.8 }] },
    { id: "g_baron2", dur: 0.5, video: { src: "assets-src/trailer/clips/tr_boss_baron.mp4", in: 26.0, zoom: [1.1, 1.2], focus: [0.6, 0.45], vfocus: 0.7 }, sfx: [{ name: "zap", at: 0, gain: 0.8 }] },
    { id: "g_baron3", dur: 0.45, video: { src: "assets-src/trailer/clips/tr_boss_baron.mp4", in: 55.8, zoom: [1.1, 1.2], focus: [0.6, 0.45], vfocus: 0.7 }, sfx: [{ name: "hit", at: 0, gain: 0.8 }] },
    { id: "x_win", dur: 3.0, flash: "in", video: { src: "gen:win", in: 0.3, zoom: [1.0, 1.05], audio: 0.3, vfocus: 0.45 }, sfx: [{ name: "boom", at: 0 }, { name: "riser_long", at: 0.4, gain: 0.7 }] },
    { id: "x_bloom", dur: 2.0, fadeOut: 0.15, video: { src: "public/media/finale_sound.mp4", in: 2.2, zoom: [1.0, 1.08], audio: 0.3, vfocus: 0.5 }, sfx: [{ name: "shimmer", at: 0.2, gain: 0.6 }] },

    // ── ACT 5 · TITLE ────────────────────────────────────────────
    { id: "e_logo", dur: 5.0, flash: "in", card: { style: "logo", text: "SUPER NINJA", sub: "READ. SPELL. SAVE THE ISLAND.", url: "superninja.templestein.com", sprite: "public/a/i/hero_kai_cheer.webp", sprite2: "public/a/i/hero_suki_cheer.webp" }, vo: [{ line: "title", at: 0.35 }], sfx: [{ name: "boom", at: 0 }, { name: "hit", at: 0 }] },
    { id: "e_button", dur: 2.8, video: { src: "assets-src/trailer/clips/tr_boss_panda.mp4", in: 3.0, zoom: [1.3, 1.55], focus: [0.82, 0.2], vfocus: 0.8 }, music: 0.25, vo: [{ line: "back", at: 0.4 }] },
    { id: "e_url", dur: 3.4, card: { style: "url", text: "superninja.templestein.com", sub: "The phonics adventure for children aged 3 to 8", sprite: "public/a/i/hero_kai_idle.webp", sprite2: "public/a/i/hero_suki_idle.webp" }, sfx: [{ name: "hit", at: 0, gain: 0.8 }], fadeOut: 0.5 },
  ],

  teaser: [
    { from: "o_baron", to: "o_baron" },
    { from: "r_hero", to: "r_hero" },
    { from: "g_bpanda", to: "g_bserpent" },
    { from: "x_clash", to: "x_clash" },
    { from: "e_logo", to: "e_logo" },
  ],
  poster: { shot: "e_logo", at: 4.4 },
};

export default config;
