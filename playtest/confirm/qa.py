# QA for the confirm lines (docs/CONFIRM.md §3.6): a blind Whisper transcript matched word for word against the script,
# the pace (words a second over the finished clip, ≤ 3.3), the loudness (−16 LUFS for sentences, −19 under 1.2 s:
# scripts/gen-audio.ts) and the true peak. Writes playtest/confirm/logs/qa.json and prints a table.
# Run: uv run -q --with faster-whisper python playtest/confirm/qa.py
import json, re, subprocess, sys
from pathlib import Path

# (the lines the confirm says today; tv_confirm_no, _how, _again and _replay were superseded in the fix round)
IDS = sys.argv[1:] or ["tv_confirm_yes", "tv_confirm_leave", "tv_confirm_leave_boss", "tv_confirm_leave_trial",
                       "tv_confirm_play_again", "tv_confirm_how_pic", "tv_confirm_how_home", "tv_confirm_how_flower",
                       "tv_confirm_keep", "tv_confirm_bye", "tv_confirm_home_nudge", "tv_confirm_flower_nudge"]
src = Path("src/content/lines.ts").read_text()
text = {i: re.search(r's\("%s", "([^"]+)"\)' % i, src).group(1) for i in IDS}
norm = lambda s: re.sub(r"[^a-z' ]+", " ", s.lower()).split()

def loud(p):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])
    tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)[-1])
    return i, tp

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)

from faster_whisper import WhisperModel
model = WhisperModel("small.en", device="cpu", compute_type="int8")
rows = []
for i in IDS:
    p = f"public/a/l/{i}.mp3"
    segs, _ = model.transcribe(p, language="en", beam_size=5)
    heard = " ".join(s.text.strip() for s in segs)
    a, b = norm(text[i]), norm(heard)
    words = len(a)
    d = dur(p)
    lufs, tp = loud(p)
    target = -19 if d < 1.25 else -16
    row = dict(id=i, script=text[i], heard=heard, match=a == b, seconds=round(d, 2), wps=round(words / d, 2),
               lufs=lufs, target=target, lufs_ok=abs(lufs - target) <= 1.0, true_peak=tp, wps_ok=words / d <= 3.3)
    rows.append(row)
    print(f"{i:24} match={row['match']!s:5} wps={row['wps']:4} lufs={lufs:6} (target {target}) tp={tp:5}  heard: {heard}")
Path("playtest/confirm/logs/qa.json").write_text(json.dumps(rows, indent=1) + "\n")
print("ALL OK" if all(r["match"] and r["wps_ok"] and r["lufs_ok"] for r in rows) else "PROBLEMS")
