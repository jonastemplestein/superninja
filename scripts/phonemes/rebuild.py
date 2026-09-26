#!/usr/bin/env python3
"""Cut phonemes from Sulafat word recordings and prepare reviewable candidates.

Run after generate-source.ts: uv run --with numpy python scripts/phonemes/rebuild.py
Only --apply changes public/a/p, and it archives each previous MP3 first.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import wave

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "playtest/phonemes/candidates"
SOURCES = ROOT / "public/a/w"
ARCHIVE = ROOT / ".trash/phonemes-2026-09-26"
# Absolute intervals in the existing word recordings, chosen from 10 ms Praat
# voicing and formant tracks. Stops end before the vowel nucleus. The w/y
# teaching forms and all other passing clips remain as recorded.
# id: (carrier, start s, end s, target s, mode)
RECIPES = {
    "i": ("pig", .15, .28, .40, "vowel"),
    "t": ("tip", .02, .105, None, "stop"),
    "o": ("dog", .10, .21, .40, "vowel"),
    "p": ("pig", .02, .105, None, "stop"),
    "b": ("bed", .02, .080, None, "stop"),
    "k": ("kit", .02, .112, None, "stop"),
    "g": ("gap", .02, .095, None, "stop"),
    "h": ("hat", .02, .145, .27, "unvoiced"),
    "d": ("dog", .02, .095, None, "stop"),
    "r": ("red", .025, .084, .50, "continuant"),
    "u": ("cut", .10, .205, .40, "vowel"),
    "j": ("jam", .02, .105, None, "stop"),
    "w": ("wet", .050, .085, .50, "continuant"),
    "ks": ("box", .285, .485, None, "pair"),
    "ch": ("chip", .02, .135, None, "stop"),
    "kw": ("quick", .02, .105, None, "pair"),
    "oo": ("food", .26, .48, .43, "vowel"),
    "ou": ("cow", .12, .51, .45, "diphthong"),
    "air": ("chair", .19, .45, .43, "diphthong"),
    "schwa": ("sofa", .44, .555, .40, "vowel"),
}
IDS = ("a i m s t n o p b k g h d e f v l r u j w z ks y sh ch th dh ng kw "
       "ae ee ie oe oo ar or er ou oy ue uu air eer zh schwa").split()


def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def read_audio(source: Path, wav: Path) -> tuple[np.ndarray, int]:
    run("ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(source),
        "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", str(wav))
    with wave.open(str(wav), "rb") as f:
        sr = f.getframerate()
        x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float64)/32768
    return x, sr


def write_audio(path: Path, x: np.ndarray, sr: int):
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes((np.clip(x,-1,1)*32767).astype(np.int16).tobytes())


def smooth_loop(x: np.ndarray, sr: int, needed: int) -> np.ndarray:
    """Crossfade copies of a stable consonant core before modest time stretch."""
    overlap = min(round(.012*sr), len(x)//5)
    result = x.copy()
    while len(result) < needed:
        fade = np.linspace(0, 1, overlap)
        result[-overlap:] = result[-overlap:]*(1-fade) + x[:overlap]*fade
        result = np.r_[result, x[overlap:]]
    return result


def measured_lufs(path: Path) -> float | None:
    p = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", str(path),
                        "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       text=True, capture_output=True)
    vals = re.findall(r"I:\s+(-?[\d.]+) LUFS", p.stderr)
    if not vals: return None
    value = float(vals[-1])
    return value if value > -70 else None


def max_db(path: Path) -> float:
    p = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", str(path),
                        "-af", "volumedetect", "-f", "null", "-"],
                       text=True, capture_output=True)
    return float(re.findall(r"max_volume: (-?[\d.]+) dB",p.stderr)[-1])


def make(id: str, source: Path, start: float, end: float, target: float | None, mode: str):
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        x, sr = read_audio(source, td/"source.wav")
        x = x[round(start*sr):round(end*sr)].copy()
        if mode == "continuant": x = smooth_loop(x, sr, round(.24*sr))
        if target:
            write_audio(td/"segment.wav", x, sr)
            run("rubberband", "-q", "-3", "-F", f"-D{target}",
                str(td/"segment.wav"), str(td/"stretched.wav"))
            x, sr = read_audio(td/"stretched.wav", td/"read.wav")
        fade_in = min(round((.002 if mode == "stop" else .008)*sr),len(x)//4)
        fade_out = min(round((.008 if mode == "stop" else .025)*sr),len(x)//3)
        x[:fade_in] *= np.linspace(0,1,fade_in)
        x[-fade_out:] *= np.linspace(1,0,fade_out)
        x = np.r_[np.zeros(round(.025*sr)),x,np.zeros(round(.055*sr))]
        write_audio(td/"raw.wav",x,sr)
        # loudnorm is the library's speech leveller. A second gain compensates
        # for EBU R128's unstable integrated estimate on very short sounds.
        run("ffmpeg","-nostdin","-loglevel","error","-y","-i",str(td/"raw.wav"),
            "-af","loudnorm=I=-16:TP=-1.5:LRA=7","-ar","44100","-ac","1",str(td/"norm.wav"))
        loudness = measured_lufs(td/"norm.wav")
        gain = -16-loudness if loudness is not None else -1.5-max_db(td/"norm.wav")
        run("ffmpeg","-nostdin","-loglevel","error","-y","-i",str(td/"norm.wav"),
            "-af",f"volume={gain:.2f}dB,alimiter=limit=0.8414:level=disabled",
            "-ar","44100","-ac","1","-codec:a","libmp3lame","-q:a","4",str(OUT/f"{id}.mp3"))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--ids", nargs="*", help="limit generation or installation to these ids")
    args = ap.parse_args()
    selected = set(args.ids or RECIPES)
    if selected - RECIPES.keys(): raise SystemExit(f"Unknown recipe ids: {selected - RECIPES.keys()}")
    if args.apply:
        qa = json.loads((ROOT/"playtest/phonemes/qa-candidates.json").read_text())
        rejected = {id: qa["clips"][id]["after"]["reasons"] for id in selected
                    if qa["clips"][id]["after"]["verdict"] != "PASS"}
        if rejected: raise SystemExit(f"Candidates have QA failures: {rejected}")
        ARCHIVE.mkdir(parents=True,exist_ok=True)
        for id in selected:
            old = ROOT/"public/a/p"/f"{id}.mp3"
            archive = ARCHIVE/f"{id}.mp3"
            if archive.exists(): raise SystemExit(f"Archive exists, refusing overwrite: {archive}")
            old.rename(archive)
            shutil.copy2(OUT/f"{id}.mp3",old)
            print(f"{id}: archived previous clip and installed candidate")
        return
    OUT.mkdir(parents=True,exist_ok=True)
    for id in IDS:
        if id not in selected:
            shutil.copy2(ROOT/"public/a/p"/f"{id}.mp3",OUT/f"{id}.mp3")
            continue
        carrier,start,end,target,mode = RECIPES[id]
        source = (ROOT/"assets-src/phonemes/sofa.mp3" if carrier=="sofa"
                  else SOURCES/f"{carrier}.mp3")
        make(id,source,start,end,target,mode)
        print(f"{id}: {carrier} {start:.3f}–{end:.3f} s, {mode}, {target or 'natural'} s")
    (ROOT/"playtest/phonemes/recipes.json").write_text(json.dumps(
        {id:{"carrier":v[0],"start_s":v[1],"end_s":v[2],"target_s":v[3],"method":v[4]}
         for id,v in RECIPES.items()},indent=2)+"\n")


if __name__ == "__main__": main()
