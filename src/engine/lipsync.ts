// Real-time lip sync from the speech audio (the approach of wawa-lipsync, adapted to our Web Audio graph):
// an AnalyserNode on the speech bus measures loudness and three frequency bands every frame —
//   F1 region (250–900 Hz: how open the jaw is), F2 region (900–2500 Hz: spread "ee" vs rounded "oo"),
//   and 3.5–8 kHz (hiss: "s", "sh", "f") — and maps them to a mouth shape (viseme).
// The loop only runs while speech plays: audio.ts reports each speech clip as it starts and as it ends (speechStarted),
// and the loop never sleeps while a clip is playing, however long a pause inside it. Once no clip is playing it sleeps
// after half a second of silence with the mouth shut, so a still screen asks for no frames (docs/PERF.md fix 2).
import { useEffect, useState } from "react";

export type Viseme = "rest" | "ah" | "ee" | "eh" | "oh" | "oo" | "ss";
export type Speaker = "sensei" | "baron";

let analyser: AnalyserNode | null = null;
let freq: Float32Array<ArrayBuffer>;
let time: Float32Array<ArrayBuffer>;
let speaker: Speaker = "sensei";
let current: Viseme = "rest";
let since = 0;
const listeners = new Set<(v: Viseme, s: Speaker) => void>();
/** The analyser loop is running (a frame is requested). */
let running = false;
/** Speech clips playing right now (started and not yet ended or stopped). */
let playing = 0;
/** When the speech was last above the threshold (or the loop was last woken), in rAF/performance.now() time. */
let loudAt = 0;
/** How long the loop waits, once no clip is playing, in silence with the mouth at rest before it sleeps (a time rather
 *  than a frame count, so a 120 Hz screen waits as long as a 60 Hz one). */
const SLEEP_AFTER_MS = 500;
let wake: () => void = () => {};
/** Viseme changes so far (window.__snVisemes): a test can check the mouth moved during speech. */
let changes = 0;

/** A speech clip has started (audio.ts): the loop wakes and stays awake until every clip is over. Returns the call
 *  that marks this clip as over (its onended, its time-out guard, or a hush()); calling it again does nothing. */
export function speechStarted(): () => void {
  playing++;
  wake();
  let over = false;
  return () => {
    if (over) return;
    over = true;
    playing = Math.max(0, playing - 1);
    loudAt = performance.now(); // the half-second grace counts from the clip's end, not from its last loud frame
  };
}

export function attachLipsync(ctx: AudioContext, speechBus: AudioNode) {
  analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.35;
  speechBus.connect(analyser);
  freq = new Float32Array(analyser.frequencyBinCount);
  time = new Float32Array(analyser.fftSize);
  const hz = ctx.sampleRate / analyser.fftSize;
  const band = (lo: number, hi: number) => {
    let s = 0;
    for (let i = Math.floor(lo / hz); i <= Math.ceil(hi / hz) && i < freq.length; i++) s += Math.pow(10, freq[i] / 20);
    return s;
  };
  const tick = (t: number) => {
    // nobody to animate, or no clip playing and half a second of silence with the mouth shut: sleep until the next clip
    if (!analyser || !listeners.size || (!playing && current === "rest" && t - loudAt > SLEEP_AFTER_MS)) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
    analyser.getFloatTimeDomainData(time);
    let rms = 0;
    for (let i = 0; i < time.length; i++) rms += time[i] * time[i];
    rms = Math.sqrt(rms / time.length);
    if (rms > 0.012) loudAt = t;
    let v: Viseme = "rest";
    if (rms > 0.012) {
      analyser.getFloatFrequencyData(freq);
      const f1 = band(250, 900);
      const f2 = band(900, 2500);
      const hiss = band(3500, 8000);
      if (hiss > (f1 + f2) * 0.9) v = "ss";
      else {
        const spread = f2 / (f1 + 1e-6);
        const loud = rms > 0.06;
        if (spread > 1.25) v = "ee";
        else if (spread < 0.35) v = loud ? "oh" : "oo";
        else v = loud ? "ah" : "eh";
      }
    }
    // hold each shape at least 70 ms so the mouth reads clearly and doesn't flicker
    if (v !== current && t - since > 70) {
      current = v;
      since = t;
      changes++;
      if (typeof window !== "undefined") (window as any).__snVisemes = changes;
      listeners.forEach((f) => f(current, speaker));
    }
  };
  wake = () => {
    loudAt = performance.now(); // always, even when a frame is already requested: that frame must not put it to sleep
    if (running || !analyser) return;
    running = true;
    requestAnimationFrame(tick);
  };
}

export function setSpeaker(s: Speaker) {
  speaker = s;
}

/** The current mouth shape for a character (rest when someone else is talking). */
export function useViseme(who: Speaker): Viseme {
  const [v, setV] = useState<Viseme>("rest");
  useEffect(() => {
    const f = (vis: Viseme, s: Speaker) => setV(s === who ? vis : "rest");
    listeners.add(f);
    wake(); // a face that appears mid-line (Baron's cut-in) picks the line up; in silence the loop is asleep in 0.5 s
    return () => void listeners.delete(f);
  }, [who]);
  return v;
}

export const VISEMES: Viseme[] = ["rest", "ah", "ee", "eh", "oh", "oo", "ss"];
