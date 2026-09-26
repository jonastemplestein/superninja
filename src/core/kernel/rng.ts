import type { Rng, Seed } from '../types';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed: Seed): Rng {
  let state = hash(seed);
  const next = () => {
    state += 0x6d2b79f5;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => {
    if (!Number.isInteger(n) || n <= 0) throw new RangeError('n must be a positive integer');
    return Math.floor(next() * n);
  };
  return {
    seed, next, int,
    pick<T>(xs: readonly T[]): T { if (!xs.length) throw new RangeError('Cannot pick from an empty list'); return xs[int(xs.length)]; },
    shuffle<T>(xs: readonly T[]): T[] { const out = [...xs]; for (let i = out.length - 1; i > 0; i--) { const j = int(i + 1); [out[i], out[j]] = [out[j], out[i]]; } return out; },
    weighted<T>(xs: readonly T[], weight: (x: T) => number): T {
      const weights = xs.map(weight);
      const total = weights.reduce((a, b) => a + b, 0);
      if (!xs.length || !Number.isFinite(total) || total <= 0 || weights.some(w => w < 0)) throw new RangeError('Invalid weights');
      let draw = next() * total;
      for (let i = 0; i < xs.length; i++) { draw -= weights[i]; if (draw < 0) return xs[i]; }
      return xs[xs.length - 1];
    },
    fork(label: string): Rng { return rng(`${seed}:${label}`); },
  };
}
