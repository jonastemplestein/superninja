"""Speech-template pilot (SPT11), step 2: render both sides of every sample in plan.json, and measure the joins.

today  the fallback as audio.ts plays it now: whole files back to back (onended -> start), `gap` items as silence, a
       petal sound's 150 ms rise before it, a `sounds` list with 320 ms after each sound.
new    the template as designed (docs/SPEECH_TEMPLATES.md §5.2): a `join` is timed from the end of one clip's speech to
       the start of the next's (speech edges: 5 ms frames, 40 dB under the clip's peak, as fix-requests asks audio.ts
       to find them), everything else as today.

Both sides are rendered at 44.1 kHz (today's lines, words and pure sounds are 44.1 kHz; the template pieces are
24 kHz and are upsampled, never altered) and written as 128 kbps MP3 to playtest/speech-templates/pilot/audio/.

Join metrics (new side, every join; today's side at the same boundaries for reference), on the assembled audio:
  gap_ms      speech end -> next speech start, by an independent detector (-45 dBFS absolute, 5 ms frames, audio.ts
              §5.2's first wording); design: breath 150 +/- 20, sentence 450 +/- 30 (§7.2, SPT3 at 150)
  level_db    a pure sound's K-weighted active level minus the lead-in's last 500 ms of speech; design +/- 3 dB (§7.2)
  f0_st       |F0 step| across the join (the experiment's measure: 3 voiced frames within 250 ms either side);
              the splice threshold is 2.5 st (§3.3), informational for a pause join
  longest_ms  the longest silence inside the whole utterance; design <= 600 ms (§7.2)
  fall_st     a lead-in's tail fall from the generator's journal; design <= 2 st (aim 1.5)
Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/pilot/assemble.py
"""
from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / "playtest/speech-templates/experiments/tools"))
import lib  # noqa: E402  (24 kHz measuring helpers: kweight, pitch, frame_db)

SR = 44100
PLAN = json.loads((HERE / "plan.json").read_text())
AUDIO = HERE / "audio"
AUDIO.mkdir(exist_ok=True)
JOURNAL = ROOT / PLAN["pilot"] / "_gen/journal.jsonl"
FALL = {}
if JOURNAL.exists():
    for line in JOURNAL.read_text().splitlines():
        try:
            e = json.loads(line)
        except ValueError:
            continue
        if e.get("ok"):
            FALL[f"{e['tpl']}/{e['pk']}"] = e.get("fall")

_cache: dict[str, np.ndarray] = {}


def load(p: str) -> np.ndarray:
    if p not in _cache:
        out = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(ROOT / p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                             check=True, capture_output=True).stdout
        _cache[p] = np.frombuffer(out, dtype=np.float32).copy()
    return _cache[p]


# The speech-edge rule for joins. fix-requests.md asks audio.ts for "40 dB under the clip's peak"; the pilot found that
# 39 of 151 lead-ins end in a faint tail (a lingering "with…" fricative or breath at -45 to -50 dBFS) that this counts
# as speech, so the pure sound lands up to 180 ms late (flower, sunflower, tap). The stricter of that and -45 dBFS
# (SPEECH_TEMPLATES.md §5.2's own wording) puts every join within tolerance. EDGE=rel40 reproduces the first rule.
import os
EDGE = os.environ.get("EDGE", "strict")


def edges(x: np.ndarray, below: float = 40.0) -> tuple[int, int]:
    """Speech on/off (samples): 5 ms frames over the clip's peak frame minus `below` dB (and, strict, over -45 dBFS)."""
    hop = SR * 5 // 1000
    n = len(x) // hop
    if n < 2:
        return 0, len(x)
    db = 10 * np.log10((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    thr = db.max() - below
    if EDGE == "strict":
        thr = max(thr, -45.0)
    idx = np.where(db > thr)[0]
    if not len(idx):
        idx = np.where(db > db.max() - below)[0]
    return int(idx[0]) * hop, (int(idx[-1]) + 1) * hop


class Track:
    def __init__(self):
        self.buf = np.zeros(0, dtype=np.float32)
        self.end = 0  # the end of the last file placed (samples)
        self.speech_end = 0  # the end of the last clip's speech (samples)
        self.marks: list[dict] = []  # every clip placed: file, kind, start, on, off (samples, absolute)

    def put(self, x: np.ndarray, at: int, file: str, kind: str):
        at = max(0, at)
        need = at + len(x)
        if need > len(self.buf):
            self.buf = np.concatenate([self.buf, np.zeros(need - len(self.buf), dtype=np.float32)])
        self.buf[at:need] += x
        on, off = edges(x)
        self.marks.append({"file": file, "kind": kind, "start": at, "on": at + on, "off": at + off})
        self.end = max(self.end, need)
        self.speech_end = at + off


def render(items: list[dict], side: str) -> tuple[np.ndarray, list[dict], list[dict]]:
    t = Track()
    joins: list[dict] = []
    pending: dict | None = None
    gap = 0
    for it in items:
        if "join" in it:
            pending = it
            continue
        if "gap" in it and "sounds" not in it:
            gap += int(round(it["gap"] * SR / 1000))
            continue
        files = it["sounds"] if "sounds" in it else [it["file"]]
        for k, f in enumerate(files):
            x = load(f)
            kind = "sound" if "sounds" in it else it["kind"]
            if pending is not None and k == 0:
                on, _ = edges(x)
                at = t.speech_end + int(round(pending["join"] * SR / 1000)) - on
                joins.append({"kind": pending["kind"], "design_ms": pending["join"], "i": len(t.marks)})
                pending = None
            else:
                at = t.end + gap
            gap = 0
            t.put(x, at, f, kind)
            if "sounds" in it:
                gap = int(round(it["gap"] * SR / 1000))  # audio.ts sleeps after each sound, the last one too
    return t.buf, t.marks, joins


def mp3(x: np.ndarray, path: Path):
    peak = float(np.max(np.abs(x))) if len(x) else 0.0
    if peak > 0.99:
        x = x * (0.99 / peak)
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "128k", str(path)], input=x.astype(np.float32).tobytes(), check=True)


def to24(x: np.ndarray) -> np.ndarray:
    out = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ar", "24000", "-f", "f32le", "-"],
                         input=x.astype(np.float32).tobytes(), check=True, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def abs_gap(x24: np.ndarray, a: float, b: float) -> float:
    """Speech end before and start after the join's middle, -45 dBFS absolute on 5 ms frames (ms)."""
    t, db = lib.frame_db(x24, 0.005, 0.005)
    mid = (a + b) / 2
    loud = db > -45
    before = np.where(loud & (t < mid))[0]
    after = np.where(loud & (t > mid))[0]
    if not len(before) or not len(after):
        return float("nan")
    return round((t[after[0]] - t[before[-1]]) * 1000 - 5, 1)


def level(x24: np.ndarray, lo: float, hi: float) -> float:
    seg = x24[max(0, int(lo * 24000)): int(hi * 24000)]
    return lib.active_level(seg) if len(seg) > 480 else float("nan")


def f0_step(x24: np.ndarray, a: float, b: float) -> float:
    t, f = lib.pitch(x24)
    before = f[(t < a) & (t >= a - 0.25) & (f > 0)]
    after = f[(t > b) & (t <= b + 0.25) & (f > 0)]
    if len(before) >= 3 and len(after) >= 3:
        return round(abs(lib.st(float(np.median(before[-3:])), float(np.median(after[:3])))), 2)
    return float("nan")


def longest(x24: np.ndarray, below: float = 40.0) -> float:
    t, db = lib.frame_db(x24, 0.005, 0.005)
    loud = np.where(db > db.max() - below)[0]
    if len(loud) < 2:
        return 0.0
    gaps = np.diff(loud) - 1
    return float(gaps.max() * 5)


def fin(v: float) -> float | None:
    return None if v is None or (isinstance(v, float) and not math.isfinite(v)) else round(v, 2)


def measure(x: np.ndarray, marks: list[dict], joins: list[dict]) -> tuple[float, list[dict]]:
    x24 = to24(x)
    js = []
    for j in joins:
        prev, nxt = marks[j["i"] - 1], marks[j["i"]]
        a, b = prev["off"] / SR, nxt["on"] / SR
        m = {"kind": j["kind"], "design_ms": j["design_ms"], "from": "/".join(Path(prev["file"]).parts[-2:]), "to": "/".join(Path(nxt["file"]).parts[-2:]),
             "from_kind": prev["kind"], "to_kind": nxt["kind"], "gap_ms": fin(abs_gap(x24, a, b)), "f0_st": fin(f0_step(x24, a, b))}
        if nxt["kind"] == "sound" and prev["kind"] == "tpl":  # a lead-in, then the pure sound
            m["level_db"] = fin(level(x24, b, nxt["off"] / SR) - level(x24, max(prev["on"] / SR, a - 0.5), a))
        if prev["kind"] == "sound" and nxt["kind"] == "tpl":  # the pure sound, then the words that carry on
            m["level_db"] = fin(level(x24, prev["on"] / SR, a) - level(x24, b, min(nxt["off"] / SR, b + 0.5)))
        if prev["kind"] == "tpl":
            m["fall_st"] = FALL.get("/".join(Path(prev["file"]).with_suffix("").parts[-2:]))
        js.append(m)
    return longest(x24), js


results = []
for s in PLAN["samples"]:
    row = {"id": s["id"], "tpl": s["tpl"], "ab": s["ab"], "files": {}}
    for side in ("today", "new", "game"):
        if side not in s:
            continue
        x, marks, joins = render(s[side], side)
        out = AUDIO / f"{s['id']}.{side}.mp3"
        mp3(x, out)
        row["files"][side] = str(out.relative_to(HERE))
        row[f"{side}_ms"] = round(len(x) / SR * 1000)
        if side == "new":
            row["longest_ms"], row["joins"] = measure(x, marks, joins)
        # speech to speech between consecutive clips, for comparing today's pauses with the designed joins
        row[f"{side}_gaps_ms"] = [round((b["on"] - a["off"]) / SR * 1000) for a, b in zip(marks, marks[1:])]
        # a lead-in (line or template piece), then a pure sound: the sound's level against the lead-in's last 500 ms
        x24 = to24(x)
        row[f"{side}_sound_level_db"] = [fin(level(x24, b["on"] / SR, b["off"] / SR) - level(x24, max(a["on"] / SR, a["off"] / SR - 0.5), a["off"] / SR))
                                        for a, b in zip(marks, marks[1:]) if a["kind"] in ("line", "tpl") and b["kind"] == "sound"]
    results.append(row)
    print(row["id"], row["today_ms"], row["new_ms"], [(j["kind"], j["gap_ms"], j.get("level_db"), j["f0_st"]) for j in row.get("joins", [])], flush=True)
(HERE / "joins.json").write_text(json.dumps(results, indent=1) + "\n")
print(f"{len(results)} samples -> {HERE / 'audio'}, joins -> {HERE / 'joins.json'}")

# every join-bearing member the pilot rendered (new side only): the audio goes to the git-ignored run folder
ALL = ROOT / PLAN["pilot"] / "_joins"
ALL.mkdir(exist_ok=True)
rows = []
for s in PLAN.get("measure", []):
    x, marks, joins = render(s["new"], "new")
    mp3(x, ALL / f"{s['id']}.new.mp3")
    lg, js = measure(x, marks, joins)
    rows.append({"id": s["id"], "tpl": s["tpl"], "values": s["values"], "file": str((ALL / f"{s['id']}.new.mp3").relative_to(ROOT)), "longest_ms": lg, "joins": js})
(HERE / "joins-all.json").write_text(json.dumps(rows, indent=1) + "\n")
print(f"{len(rows)} join-bearing utterances measured -> {HERE / 'joins-all.json'}")
