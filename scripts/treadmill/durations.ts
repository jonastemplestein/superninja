// Clip lengths for the treadmill (ms, keyed "l/<id>", "w/<word>", "x/<word>", "p/<sound>", "o/<word>", "s/<id>"), as
// public/a/durations.json has them, except where the file on disk is newer than that table or missing from it: those
// are measured from the mp3 itself. The slow words (x/) are always measured: on 27 Sep they became the pure sounds with
// 250 ms gaps (997 words, 0.5–4.7 s), while durations.json still held the 163 old stretched lengths (x/sun 2440 ms,
// where the gapped sun is 1896). Measured lazily, one file at a time, cached; the same length ffprobe reports (the
// Xing/Info frame count less the encoder's delay and padding), without spawning ffprobe (170 ms a file).
import { existsSync, readFileSync, statSync } from "node:fs";
import { mp3Duration } from "../gen-durations";

const ROOT = new URL("../../public/a/", import.meta.url);
let table: Record<string, number> | null = null;
let tableAt = 0;
const measured = new Map<string, number | null>();

function load() {
  if (table) return table;
  try {
    table = JSON.parse(readFileSync(new URL("durations.json", ROOT), "utf8"));
    tableAt = statSync(new URL("durations.json", ROOT)).mtimeMs;
  } catch {
    table = {};
  }
  return table!;
}

/** An mp3's playing length in ms: from its Xing/Info header (frames × samples, less the LAME/Lavc tag's encoder delay
 *  and padding), else the sum of its frames (scripts/gen-durations.ts). */
export function mp3Ms(bytes: Uint8Array): number {
  let at = 0;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) at = 10 + ((bytes[6] & 0x7f) << 21) + ((bytes[7] & 0x7f) << 14) + ((bytes[8] & 0x7f) << 7) + (bytes[9] & 0x7f);
  while (at + 4 <= bytes.length && !(bytes[at] === 0xff && (bytes[at + 1] & 0xe0) === 0xe0)) at++;
  if (at + 4 <= bytes.length) {
    const h = (bytes[at] * 0x1000000 + bytes[at + 1] * 0x10000 + bytes[at + 2] * 0x100 + bytes[at + 3]) >>> 0;
    const version = (h >>> 19) & 3, sampleIndex = (h >>> 10) & 3;
    if (version !== 1 && sampleIndex !== 3) {
      const sr = [44100, 48000, 32000][sampleIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
      const spf = version === 3 ? 1152 : 576;
      const head = new TextDecoder("latin1").decode(bytes.slice(at, at + 400));
      const xi = Math.max(head.indexOf("Xing"), head.indexOf("Info"));
      if (xi >= 0 && bytes[at + xi + 7] & 1) {
        const p = at + xi;
        const frames = ((bytes[p + 8] << 24) | (bytes[p + 9] << 16) | (bytes[p + 10] << 8) | bytes[p + 11]) >>> 0;
        const li = [head.indexOf("LAME", xi), head.indexOf("Lavc", xi), head.indexOf("Lavf", xi)].filter((x) => x >= 0).sort((a, b) => a - b)[0];
        let trim = 0;
        if (li !== undefined) {
          const q = at + li + 21;
          trim = ((bytes[q] << 4) | (bytes[q + 1] >> 4)) + (((bytes[q + 1] & 0xf) << 8) | bytes[q + 2]);
        }
        if (frames > 0) return Math.round(((frames * spf - trim) / sr) * 1000);
      }
    }
  }
  return mp3Duration(bytes);
}

/** The length of one clip in ms ("x/sun"), or undefined when there is no such clip. */
export function clipMs(key: string): number | undefined {
  const t = load();
  if (measured.has(key)) return measured.get(key) ?? t[key];
  const file = new URL(`${key}.mp3`, ROOT);
  let ms: number | null = null;
  try {
    if (existsSync(file) && (key.startsWith("x/") || t[key] === undefined || statSync(file).mtimeMs > tableAt)) ms = mp3Ms(readFileSync(file));
  } catch {
    ms = null;
  }
  measured.set(key, ms);
  return ms ?? t[key];
}

/** durations.json as a plain object whose lookups go through clipMs (for code that indexes `DUR[key]`). */
export function durations(): Record<string, number> {
  const t = load();
  return new Proxy(t, { get: (_, k) => (typeof k === "string" ? clipMs(k) : undefined), has: (_, k) => typeof k === "string" && clipMs(k) !== undefined });
}
