// Web Audio engine: speech clips (queued, cancellable, with captions), looping music with ducking,
// and synthesised sound effects. Everything is decoded into AudioBuffers for instant, gapless playback.
import { LINES } from "../content/lines";
import { attachLipsync, setSpeaker } from "./lipsync";
import { FAST } from "./fast";
import { PHONEMES, type PhonemeId, type Seg } from "../content/phonics";
import { STRETCHED } from "../content/stretch";

let ctx: AudioContext | null = null;
let master: GainNode, speechBus: GainNode, musicBus: GainNode, sfxBus: GainNode;

export function audioCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.connect(ctx.destination);
    speechBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    speechBus.gain.value = 1.0;
    musicBus.gain.value = settings.music;
    sfxBus.gain.value = SFX_GAIN;
    speechBus.connect(master);
    attachLipsync(ctx, speechBus);
    musicBus.connect(master);
    sfxBus.connect(master);
  }
  return ctx;
}

/** Must be called from a user gesture (iOS). */
export async function unlockAudio() {
  // iOS: play through the ringer/silent switch like a video would
  try {
    const nav = navigator as any;
    // (no silent <audio> loop: iOS shows a media player for it on the lock screen)
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {}
  const c = audioCtx();
  if (c.state !== "running") await c.resume();
}

export const settings = { music: 0.32 };

// Resume audio on any touch (first gesture, and after iOS interruptions like switching apps).
if (typeof window !== "undefined") {
  const resume = () => {
    if (!ctx || ctx.state !== "running") unlockAudio();
  };
  window.addEventListener("pointerdown", resume, { capture: true });
  window.addEventListener("keydown", resume, { capture: true });
  // Leaving the game (home button, app switcher, lock): stop ALL sound so iOS doesn't keep a media player going.
  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      hush();
      musicEl?.el.pause();
      ctx?.suspend().catch(() => {});
    } else {
      ctx?.resume().catch(() => {});
      musicEl?.el.play().catch(() => {});
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", () => {
    musicEl?.el.pause();
    ctx?.suspend().catch(() => {});
  });
}
export function setMusicVolume(v: number) {
  settings.music = v;
  if (musicBus) musicBus.gain.setTargetAtTime(v, audioCtx().currentTime, 0.1);
}

// ---------- clip loading
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const bufferUrl = new WeakMap<AudioBuffer, string>();
/** Recording hook (landing-page clips): when window.__audioLog exists, log every clip played. */
const logAudio = (url: string, kind: "speech" | "music" | "sfx") => {
  const log = (window as any).__audioLog as any[] | undefined;
  if (log) log.push({ t: Date.now(), url, kind });
};
export function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(url))))
      .then((ab) => audioCtx().decodeAudioData(ab))
      .then((b) => {
        bufferUrl.set(b, url);
        return b;
      })
      .catch((e) => {
        console.warn("audio load failed", url, e);
        return null;
      });
    buffers.set(url, p);
  }
  return p;
}

const fid = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "_");
export const urls = {
  line: (id: string) => `/a/l/${id}.mp3`,
  word: (w: string) => `/a/w/${fid(w)}.mp3`,
  sound: (p: PhonemeId) => `/a/p/${p}.mp3`,
  story: (story: string, page: string) => `/a/s/${story}_${page}.mp3`,
  music: (id: string) => `/a/m/${id}.mp3`,
};

export function preload(list: string[]) {
  return Promise.all(list.map(load));
}

// ---------- speech queue
export type Say =
  | { line: string }
  | { word: string }
  | { stretch: string }
  | { sound: PhonemeId }
  | { story: string; page: string; caption?: string }
  | { gap: number }
  | { sounds: Seg[]; gap?: number; onSeg?: (i: number) => void };

type Caption = { text: string; who: "sensei" | "baron" } | null;
type CaptionListener = (c: Caption) => void;
const captionListeners = new Set<CaptionListener>();
export function onCaption(fn: CaptionListener) {
  captionListeners.add(fn);
  return () => void captionListeners.delete(fn);
}
let caption: Caption = null;
/** The caption showing right now (for a bubble that mounts mid-line, e.g. after a scene's first say()). */
export const currentCaption = () => caption;
const emitCaption = (c: Caption) => {
  caption = c;
  captionListeners.forEach((f) => f(c));
};

const lineById = new Map(LINES.map((l) => [l.id, l]));
let speakToken = 0;
let current: AudioBufferSourceNode | null = null;
let speaking = 0;
/** A target sound, a blend or a modelled word is playing: what the child must hear. */
let teaching = 0;
const SFX_GAIN = 0.55;

/** Mix: music ducks under speech; sound effects duck a little under any speech and right down under a target sound or
 *  word, so no scene's impact or whoosh can land on the sound the child is learning. While the phone is upright the
 *  game's sound effects are silent (the turn-your-phone prompt plays its own through sfxOver). */
function mix() {
  if (!musicBus) return;
  const t = audioCtx().currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setTargetAtTime(speaking > 0 ? settings.music * 0.35 : settings.music, t, 0.15);
  sfxBus.gain.cancelScheduledValues(t);
  sfxBus.gain.setTargetAtTime(gate ? 0 : teaching > 0 ? SFX_GAIN * 0.15 : speaking > 0 ? SFX_GAIN * 0.5 : SFX_GAIN, t, 0.03);
}
function duck(on: boolean) {
  speaking = Math.max(0, speaking + (on ? 1 : -1));
  mix();
}
function teach(on: boolean) {
  teaching = Math.max(0, teaching + (on ? 1 : -1));
  mix();
}

function playBuffer(buf: AudioBuffer, bus: GainNode, rate = 1): Promise<void> {
  rate *= FAST;
  return new Promise((resolve) => {
    // if audio is suspended (no gesture yet, iOS interruption), never hang the game: time out instead
    const guard = setTimeout(resolve, (buf.duration / rate) * 1000 * FAST + 250); // setTimeout is itself sped up by FAST
    const src = audioCtx().createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    src.connect(bus);
    src.onended = () => {
      clearTimeout(guard);
      resolve();
    };
    src.start();
    if (bus === speechBus) current = src;
    const u = bufferUrl.get(buf);
    if (u) logAudio(u, "speech");
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Stop whatever is being said. */
export function hush() {
  speakToken++;
  try {
    current?.stop();
  } catch {}
  current = null;
  emitCaption(null);
}

// ---------- turn-your-phone pause (RotatePrompt in ui/ui.tsx): while a phone is held upright, game speech waits at the
// next clip, so scripted scenes pause instead of carrying on unheard. A clip that was cut off is said again afterwards.
let gate: Promise<void> | null = null;
let openGate: (() => void) | null = null;
export function pauseSpeech(on: boolean) {
  if (on && !gate) {
    gate = new Promise<void>((r) => (openGate = r));
    try {
      current?.stop();
    } catch {}
  } else if (!on && gate) {
    const f = openGate;
    gate = null;
    openGate = null;
    f?.();
  }
  mix();
}
async function gated() {
  while (gate) await gate;
}
async function playGated(buf: AudioBuffer, token: number) {
  const before = gate;
  await playBuffer(buf, speechBus);
  if (gate && !before) {
    await gated();
    if (token === speakToken) await playBuffer(buf, speechBus);
  }
}

/** Say a sequence of clips. A new call interrupts the previous one. Resolves when done (or interrupted). */
export async function say(items: Say[] | Say, opts: { keep?: boolean; reveal?: boolean } = {}): Promise<boolean> {
  const list = Array.isArray(items) ? items : [items];
  if (gate) await gated();
  if (!opts.keep) hush();
  const token = ++speakToken;
  // resolve urls & start loading everything up front
  const loaders = list.map((it) => {
    if ("line" in it) return load(urls.line(it.line));
    if ("word" in it) return load(urls.word(it.word));
    if ("stretch" in it) return STRETCHED.has(it.stretch) ? load(`/a/x/${it.stretch}.mp3`).then((b) => b ?? load(urls.word(it.stretch))) : load(urls.word(it.stretch));
    if ("sound" in it) return load(urls.sound(it.sound));
    if ("story" in it) return load(urls.story(it.story, it.page));
    if ("sounds" in it) return Promise.all(it.sounds.map((s) => load(urls.sound(s.p))));
    return Promise.resolve(null);
  });
  // one caption for the whole sequence; target sounds/words are hidden unless revealed (e.g. after a mistake)
  let who: "sensei" | "baron" = "sensei";
  const parts: string[] = [];
  let hasLine = false;
  for (const it of list) {
    if ("line" in it) {
      const l = lineById.get(it.line);
      if (l) {
        parts.push(l.text);
        who = l.who ?? "sensei";
        hasLine = true;
      }
    } else if ("story" in it && it.caption) {
      parts.push(it.caption);
      hasLine = true;
    } else if ("sound" in it) parts.push(opts.reveal ? `/${PHONEMES[it.sound].label}/` : "🔊");
    else if ("word" in it) parts.push(opts.reveal ? `“${it.word}”` : "🔊");
    else if ("stretch" in it) parts.push(opts.reveal ? `“${it.stretch}”` : "🔊");
    else if ("sounds" in it && opts.reveal) parts.push(it.sounds.map((s) => `/${PHONEMES[s.p].label}/`).join(" "));
  }
  // a line's trailing "..." leads into what follows ("Let's think about the story... What made the Baron happy?"); at the
  // very end it is dropped
  const caption = hasLine ? parts.join(" ").replace(/\.\.\.$/, "").replace(/ +([!?.,])/g, "$1").replace(/([/”]) ([A-Z])/g, "$1. $2") : null;
  duck(true);
  if (caption) emitCaption({ text: caption, who });
  try {
    for (let i = 0; i < list.length; i++) {
      if (gate) await gated();
      if (token !== speakToken) return false;
      const it = list[i];
      if ("gap" in it && !("sounds" in it)) {
        await sleep(it.gap);
        continue;
      }
      if ("sounds" in it) {
        setSpeaker("sensei");
        const bufs = (await loaders[i]) as (AudioBuffer | null)[];
        for (let k = 0; k < bufs.length; k++) {
          if (gate) await gated();
          if (token !== speakToken) return false;
          it.onSeg?.(k);
          const b = bufs[k];
          if (b) {
            teach(true);
            try {
              await playGated(b, token);
            } finally {
              teach(false);
            }
          }
          await sleep(it.gap ?? 320);
        }
        it.onSeg?.(-1);
        continue;
      }
      const buf = (await loaders[i]) as AudioBuffer | null;
      if (token !== speakToken) return false;
      setSpeaker("line" in it && lineById.get(it.line)?.who === "baron" ? "baron" : "sensei");
      if ("line" in it) {
        const l = lineById.get(it.line);
        if (l && l.who !== who) emitCaption({ text: l.text, who: l.who ?? "sensei" });
      }
      const target = "sound" in it || "word" in it || "stretch" in it;
      if (buf) {
        if (target) teach(true);
        try {
          await playGated(buf, token);
        } finally {
          if (target) teach(false);
        }
      }
    }
    return token === speakToken;
  } finally {
    duck(false);
    if (token === speakToken) emitCaption(null);
  }
}

/** "c... a... t... cat!" */
export function sayBlend(segs: Seg[], word: string, onSeg?: (i: number) => void) {
  return say([{ sounds: segs, onSeg, gap: 260 }, { gap: 150 }, { word }]);
}

export const soundLabel = (p: PhonemeId) => PHONEMES[p].label;

// ---------- music: streamed <audio> elements routed through Web Audio (low memory on phones; gain works on iOS)
let musicId: string | null = null;
let musicEl: { el: HTMLAudioElement; gain: GainNode } | null = null;
export async function playMusic(id: string | null) {
  if (id === musicId) return;
  musicId = id;
  const c = audioCtx();
  if (musicEl) {
    const old = musicEl;
    old.gain.gain.setTargetAtTime(0, c.currentTime, 0.35);
    setTimeout(() => {
      old.el.pause();
      old.el.removeAttribute("src");
      old.el.load();
      old.gain.disconnect();
    }, 1800);
  }
  musicEl = null;
  if (!id) return;
  logAudio(urls.music(id), "music");
  const el = new Audio(urls.music(id));
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: "Super Ninja", artist: "Sensei Maple", artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }] });
    }
  } catch {}
  el.loop = true;
  el.preload = "auto";
  el.crossOrigin = "anonymous";
  const gain = c.createGain();
  gain.gain.value = 0;
  try {
    c.createMediaElementSource(el).connect(gain);
  } catch {}
  gain.connect(musicBus);
  musicEl = { el, gain };
  try {
    await el.play();
  } catch {
    return;
  }
  if (musicId === id) gain.gain.setTargetAtTime(1, c.currentTime, 0.6);
}

// ---------- synthesised sfx
type Wave = OscillatorType;
/** Where the synthesised sounds go: the sfx bus (ducked with the game), or straight out (sfxOver). */
let out: GainNode | null = null;
const sfxOut = () => out ?? sfxBus;
function tone(freq: number, dur: number, opts: { type?: Wave; vol?: number; slide?: number; delay?: number; attack?: number } = {}) {
  const c = audioCtx();
  const t = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * opts.slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.3, t + (opts.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(sfxOut());
  o.start(t);
  o.stop(t + dur + 0.05);
}
function noise(dur: number, opts: { vol?: number; freq?: number; q?: number; delay?: number; sweep?: number } = {}) {
  const c = audioCtx();
  const t = c.currentTime + (opts.delay ?? 0);
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(opts.freq ?? 1200, t);
  if (opts.sweep) f.frequency.exponentialRampToValueAtTime(opts.sweep, t + dur);
  f.Q.value = opts.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(sfxOut());
  src.start(t);
}

export const sfx: Record<string, () => void> = {
  tap: () => tone(660, 0.08, { type: "triangle", vol: 0.25, slide: 1.5 }),
  pop: () => {
    tone(520, 0.12, { type: "sine", vol: 0.35, slide: 2.2 });
    noise(0.05, { vol: 0.15, freq: 3000 });
  },
  place: () => {
    tone(300, 0.1, { type: "triangle", vol: 0.3, slide: 0.7 });
    noise(0.06, { vol: 0.2, freq: 800 });
  },
  good: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, { type: "triangle", vol: 0.25, delay: i * 0.07 })),
  great: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { type: "triangle", vol: 0.22, delay: i * 0.075 })),
  wrong: () => {
    tone(220, 0.18, { type: "sine", vol: 0.3, slide: 0.8 });
    tone(196, 0.22, { type: "sine", vol: 0.25, slide: 0.8, delay: 0.12 });
  },
  whoosh: () => noise(0.35, { vol: 0.35, freq: 400, sweep: 3000, q: 0.8 }),
  swish: () => noise(0.18, { vol: 0.3, freq: 2500, sweep: 6000, q: 2 }),
  hit: () => {
    noise(0.15, { vol: 0.5, freq: 600, sweep: 200 });
    tone(140, 0.2, { type: "square", vol: 0.18, slide: 0.5 });
  },
  zap: () => {
    tone(880, 0.35, { type: "sawtooth", vol: 0.12, slide: 0.25 });
    tone(1320, 0.3, { type: "square", vol: 0.08, slide: 0.3, delay: 0.03 });
    noise(0.3, { vol: 0.2, freq: 5000, sweep: 800 });
  },
  jump: () => tone(360, 0.18, { type: "square", vol: 0.12, slide: 2.4 }),
  coin: () => {
    tone(988, 0.08, { type: "square", vol: 0.12 });
    tone(1319, 0.25, { type: "square", vol: 0.12, delay: 0.07 });
  },
  hurt: () => {
    tone(300, 0.3, { type: "sawtooth", vol: 0.15, slide: 0.4 });
    noise(0.2, { vol: 0.3, freq: 500 });
  },
  charge: () => tone(200, 0.5, { type: "sawtooth", vol: 0.06, slide: 3 }),
  gong: () => {
    [110, 220.5, 331, 443].forEach((f, i) => tone(f, 3.2 - i * 0.5, { type: "sine", vol: 0.25 / (i + 1), attack: 0.005 }));
    noise(0.4, { vol: 0.2, freq: 900 });
  },
  petal: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.4, { type: "sine", vol: 0.12, delay: i * 0.06 })),
  fanfare: () => {
    const n = [392, 523, 659, 784, 659, 784, 1047];
    n.forEach((f, i) => tone(f, i === n.length - 1 ? 0.8 : 0.16, { type: "triangle", vol: 0.25, delay: i * 0.12 }));
    n.forEach((f, i) => tone(f / 2, i === n.length - 1 ? 0.8 : 0.16, { type: "square", vol: 0.05, delay: i * 0.12 }));
  },
  bounce: () => tone(200, 0.15, { type: "sine", vol: 0.3, slide: 1.8 }),
  page: () => noise(0.25, { vol: 0.2, freq: 3000, sweep: 1200, q: 0.5 }),
  thunder: () => {
    noise(1.8, { vol: 0.55, freq: 180, sweep: 60, q: 0.7 });
    noise(0.25, { vol: 0.35, freq: 1400, sweep: 300, q: 0.6 });
    tone(55, 1.6, { type: "sawtooth", vol: 0.12, slide: 0.7 });
    tone(62, 1.2, { type: "square", vol: 0.05, slide: 0.6, delay: 0.1 });
  },
  // ---- "uh-oh": two descending boops (the turn-your-phone prompt)
  oops: () => {
    tone(660, 0.17, { type: "triangle", vol: 0.34, slide: 0.9 });
    tone(1320, 0.12, { type: "sine", vol: 0.06, slide: 0.9 });
    tone(470, 0.36, { type: "triangle", vol: 0.34, slide: 0.8, delay: 0.21 });
    tone(940, 0.28, { type: "sine", vol: 0.06, slide: 0.8, delay: 0.21 });
  },
  // ---- the ninja's moves (src/ui/Ninja.tsx): a sound as the move goes, and a different one as it lands
  kick: () => {
    noise(0.16, { vol: 0.42, freq: 500, sweep: 3800, q: 1.2 });
    tone(170, 0.12, { type: "sine", vol: 0.12, slide: 2 });
  },
  thwack: () => {
    noise(0.09, { vol: 0.55, freq: 1800, sweep: 400, q: 0.9 });
    tone(210, 0.16, { type: "sine", vol: 0.45, slide: 0.35 });
    tone(95, 0.22, { type: "triangle", vol: 0.25, slide: 0.6 });
  },
  magic: () => {
    tone(480, 0.36, { type: "sine", vol: 0.13, slide: 3.4 });
    tone(720, 0.36, { type: "triangle", vol: 0.06, slide: 3.4, delay: 0.03 });
    noise(0.36, { vol: 0.12, freq: 3000, sweep: 9000, q: 3 });
  },
  sparkle: () => {
    [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, 0.3, { type: "sine", vol: 0.1, delay: i * 0.035 }));
    noise(0.25, { vol: 0.14, freq: 7000, sweep: 3000, q: 1.5 });
    tone(170, 0.22, { type: "sine", vol: 0.3, slide: 0.5 });
  },
  shuriken: () => {
    noise(0.22, { vol: 0.3, freq: 5000, sweep: 9000, q: 4 });
    tone(1400, 0.18, { type: "triangle", vol: 0.05, slide: 1.6 });
  },
  tink: () => {
    tone(2400, 0.12, { type: "square", vol: 0.05, slide: 0.9 });
    tone(3300, 0.22, { type: "sine", vol: 0.09 });
    noise(0.06, { vol: 0.3, freq: 4000 });
    tone(190, 0.14, { type: "sine", vol: 0.3, slide: 0.45 });
  },
  spin: () => {
    noise(0.14, { vol: 0.32, freq: 600, sweep: 4000, q: 1.5 });
    noise(0.16, { vol: 0.32, freq: 700, sweep: 4600, q: 1.5, delay: 0.13 });
  },
  land: () => {
    tone(110, 0.12, { type: "sine", vol: 0.35, slide: 0.5 });
    noise(0.12, { vol: 0.2, freq: 300, sweep: 120, q: 0.7 });
  },
  boom: () => {
    noise(0.5, { vol: 0.5, freq: 320, sweep: 60, q: 0.6 });
    tone(72, 0.5, { type: "sine", vol: 0.42, slide: 0.5 });
    [1319, 1760, 2349].forEach((f, i) => tone(f, 0.35, { type: "sine", vol: 0.07, delay: 0.04 + i * 0.04 }));
  },
  powerup: () => {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
      tone(f, 0.2, { type: "square", vol: 0.05, delay: i * 0.055 });
      tone(f, 0.24, { type: "triangle", vol: 0.14, delay: i * 0.055 });
    });
    noise(0.6, { vol: 0.16, freq: 500, sweep: 8000, q: 0.8 });
    tone(1568, 0.7, { type: "sine", vol: 0.1, delay: 0.33 });
    tone(2093, 0.7, { type: "sine", vol: 0.08, delay: 0.36 });
  },
  twinkle: () => [1319, 1568, 2093].forEach((f, i) => tone(f, 0.3, { type: "sine", vol: 0.11, delay: i * 0.06 })),
  hmm: () => {
    tone(330, 0.14, { type: "triangle", vol: 0.12, slide: 1.05 });
    tone(392, 0.24, { type: "triangle", vol: 0.12, slide: 1.25, delay: 0.16 });
  },
  fizzle: () => {
    noise(0.4, { vol: 0.12, freq: 2000, sweep: 300, q: 0.6 });
    tone(520, 0.3, { type: "sine", vol: 0.07, slide: 0.5 });
  },
  flame: () => {
    tone(260, 0.14, { type: "sine", vol: 0.1, slide: 2.2 });
    noise(0.12, { vol: 0.08, freq: 1200, sweep: 3000, q: 1 });
  },
  kiai: () => {
    noise(0.13, { vol: 0.3, freq: 900, sweep: 1400, q: 3 });
    tone(300, 0.13, { type: "square", vol: 0.06, slide: 1.5 });
  },
};

/** Play a sound effect at full volume whatever the game's mix (the turn-your-phone prompt, while the game is hushed). */
export function sfxOver(name: string) {
  audioCtx();
  const g = ctx!.createGain();
  g.gain.value = SFX_GAIN;
  g.connect(master);
  out = g;
  try {
    sfx[name]?.();
  } finally {
    out = null;
  }
}

/** Is a say() sequence in progress (including its gaps)? Read-only; lets the ninja wait for a quiet moment. */
export const isSpeaking = () => speaking > 0;

// log sound effects too (for landing-page clip soundtracks)
for (const k of Object.keys(sfx)) {
  const f = sfx[k];
  sfx[k] = () => {
    logAudio(`sfx:${k}`, "sfx");
    f();
  };
}

/** Render one synthesised sound effect to WAV bytes (used by scripts/record-clips.ts). */
export async function renderSfx(name: string): Promise<number[]> {
  const off = new OfflineAudioContext(1, 44100 * 3.5, 44100);
  audioCtx();
  const saved = { c: ctx, b: sfxBus };
  ctx = off as unknown as AudioContext;
  sfxBus = off.createGain();
  sfxBus.gain.value = 0.55;
  sfxBus.connect(off.destination);
  try {
    sfx[name]?.();
  } finally {
    ctx = saved.c;
    sfxBus = saved.b;
  }
  const buf = await off.startRendering();
  const data = buf.getChannelData(0);
  const pcm = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) pcm[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const w = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.byteLength, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 44100, true);
  v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, pcm.byteLength, true);
  return [...new Uint8Array(header), ...new Uint8Array(pcm.buffer)];
}
if (typeof window !== "undefined") (window as any).__renderSfx = renderSfx;
