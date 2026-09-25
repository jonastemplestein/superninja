// Real-time lip sync from the speech audio (the approach of wawa-lipsync, adapted to our Web Audio graph):
// an AnalyserNode on the speech bus measures loudness and three frequency bands every frame —
//   F1 region (250–900 Hz: how open the jaw is), F2 region (900–2500 Hz: spread "ee" vs rounded "oo"),
//   and 3.5–8 kHz (hiss: "s", "sh", "f") — and maps them to a mouth shape (viseme).
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
    requestAnimationFrame(tick);
    if (!analyser || !listeners.size) return;
    analyser.getFloatTimeDomainData(time);
    let rms = 0;
    for (let i = 0; i < time.length; i++) rms += time[i] * time[i];
    rms = Math.sqrt(rms / time.length);
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
      listeners.forEach((f) => f(current, speaker));
    }
  };
  requestAnimationFrame(tick);
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
    return () => void listeners.delete(f);
  }, [who]);
  return v;
}

export const VISEMES: Viseme[] = ["rest", "ah", "ee", "eh", "oh", "oo", "ss"];
