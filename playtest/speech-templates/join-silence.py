#!/usr/bin/env python3
"""Measure the near-silence at the start and end of the shipped speech clips.

Why: when two clips are played back to back (a carrier line, then a word or a pure sound), the listener hears the
first clip's trailing silence plus the second clip's leading silence, plus any scheduling delay. Pauses of about
80 ms or more are heard as a phrase boundary (see docs/speech-templates/prior-art.md, section 7), so this number
says whether a splice can ever sound like one continuous sentence.

Method: decode with ffmpeg (which honours the LAME encoder-delay tag) to 44.1 kHz mono, compute 5 ms RMS frames,
and count frames below -45 dBFS at each end (the same threshold scripts/tts.ts uses for trimming).

Usage: python3 playtest/speech-templates/join-silence.py [N per folder, default 200]
Standard library only (no numpy).
"""
import array
import glob
import math
import os
import random
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "a")
THR = 32768 * 10 ** (-45 / 20)
RATE = 44100
WIN = RATE // 200  # 5 ms


def edges(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"],
        capture_output=True,
        check=True,
    ).stdout
    s = array.array("h")
    s.frombytes(raw)
    frames = []
    for i in range(0, len(s) - WIN, WIN):
        chunk = s[i : i + WIN]
        frames.append(math.sqrt(sum(x * x for x in chunk) / WIN))
    lead = next((i for i, v in enumerate(frames) if v > THR), len(frames)) * 5
    trail = next((i for i, v in enumerate(reversed(frames)) if v > THR), len(frames)) * 5
    return lead, trail, len(s) / RATE


def pct(xs, p):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(p / 100 * len(xs)))]


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    random.seed(7)
    names = {"l": "lines", "w": "words", "p": "pure sounds", "x": "slow words"}
    for d, label in names.items():
        files = sorted(glob.glob(os.path.join(ROOT, d, "*.mp3")))
        pick = random.sample(files, min(n, len(files)))
        rows = [edges(f) for f in pick]
        lead = [r[0] for r in rows]
        trail = [r[1] for r in rows]
        dur = [r[2] for r in rows]
        print(
            f"{label:12s} n={len(rows):4d}  lead ms median {pct(lead, 50):3d} (p90 {pct(lead, 90):3d})"
            f"  trail ms median {pct(trail, 50):3d} (p90 {pct(trail, 90):3d})"
            f"  mean dur {sum(dur) / len(dur):.2f} s"
        )


if __name__ == "__main__":
    main()
