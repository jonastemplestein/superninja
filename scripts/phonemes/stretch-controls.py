#!/usr/bin/env python3
"""Controls for the stretch-artefact diagnosis (27 Sep): the 26 Sep rebuild's stretched recipes, re-made with and
without rubberband from the same word cut, plus synthetic noise stretched the same way. Same cut, fades and levelling
as scripts/phonemes/rebuild.py; only the stretch differs, so any difference in the measures is the stretch.

  uv run --with numpy python scripts/phonemes/stretch-controls.py
Writes playtest/runs/pure-sounds/controls/<id>.natural.mp3, <id>.stretched.mp3, noise.natural.mp3, noise.stretched.mp3.
Nothing in public/ is touched.
"""
from __future__ import annotations

from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rebuild  # noqa: E402

ROOT = rebuild.ROOT
OUT = ROOT / "playtest/runs/pure-sounds/controls"
# The recipes that were stretched on 26 Sep (rebuild.py RECIPES, as recipes.json had them before 27 Sep).
STRETCHED = {
    "h": ("hat", .02, .145, .27, "unvoiced"),
    "r": ("red", .025, .084, .50, "continuant"),
    "o": ("dog", .10, .21, .40, "vowel"),
    "u": ("cut", .10, .205, .40, "vowel"),
    "oo": ("food", .26, .48, .43, "vowel"),
    "ou": ("cow", .12, .51, .45, "diphthong"),
    "air": ("chair", .19, .45, .43, "diphthong"),
    "schwa": ("sofa", .44, .555, .40, "vowel"),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rebuild.OUT = OUT
    for id, (carrier, start, end, target, mode) in STRETCHED.items():
        source = ROOT/"assets-src/phonemes/sofa.mp3" if carrier == "sofa" else rebuild.SOURCES/f"{carrier}.mp3"
        rebuild.make(f"{id}.natural", source, start, end, None, mode)
        rebuild.make(f"{id}.stretched", source, start, end, target, mode)
        print(f"{id}: {carrier} {start}-{end} s, natural and stretched to {target} s")
    # Synthetic breath noise: Gaussian noise, 0.125 s (the /h/ cut), band-passed 400-9000 Hz like an /h/, and the same
    # noise stretched to 0.27 s with the /h/ command (rubberband -3 -F -D0.27). A natural 0.27 s noise is the reference.
    rng = np.random.default_rng(7)
    sr = 44100
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        for name, dur, target in (("noise.natural", .27, None), ("noise.stretched", .125, .27)):
            x = rng.standard_normal(round(dur*sr))*.1
            rebuild.write_audio(td/"raw.wav", x, sr)
            subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(td/"raw.wav"),
                            "-af", "highpass=f=400:poles=2,lowpass=f=9000:poles=2", str(td/"bp.wav")], check=True)
            src = td/"bp.wav"
            if target:
                subprocess.run(["rubberband", "-q", "-3", "-F", f"-D{target}", str(src), str(td/"st.wav")], check=True)
                src = td/"st.wav"
            rebuild.make(name, src, 0, 10, None, "unvoiced")
            print(name)


if __name__ == "__main__":
    main()
