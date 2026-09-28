# Frozen frames in a clip: each frame's largest difference from the one before (480x270 grey, ffmpeg's tblend +
# signalstats YMAX). A true repeat (a frozen picture) has max 0-3; the game's small motions (the ninja's glow, a sparkle)
# show 40+ even where check.ts's mean difference calls the frame "still". Lists every run of identical frames.
#   python3 assets-src/clips/2026-09-27/sort/still.py <clip.mp4>
import re, subprocess, sys
f = sys.argv[1]
out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-vf', 'scale=480:270:flags=area,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-', '-f', 'null', '-'], capture_output=True, text=True).stdout
vals = [int(float(v)) for v in re.findall(r'YMAX=([\d.]+)', out)]
runs, cur = [], 0
for k, v in enumerate(vals + [999]):
    if v <= 3: cur += 1
    else:
        if cur: runs.append((round((k - cur + 1) / 30, 2), cur))
        cur = 0
print(f'{len(vals)} frame pairs; identical frames: {sum(c for _, c in runs)}; runs (clip s, frames): {runs[:12]}; lowest max diffs: {sorted(vals)[:5]}')
