# Clip sizes, durations and decoded sizes per public/a folder (delivery.md §1). Run from the repo root: python3 playtest/speech-templates/delivery/measure/clip-stats.py l w p x o s
import sys; sys.path.insert(0, "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/speech-templates/experiments/tools")
from lib import *
import numpy as np
# pure sounds: duration, F0 edges, level
for s in ["a","s","m","sh","d","ie"]:
    x = load(ROOT/f"public/a/p/{s}.mp3"); y,_ = trim(x)
    print("pure", s, round(len(y)/SR,3), f0_edges(y, 0, len(y)/SR), round(active_level(y),1), round(lufs_of(y),1))
for w in ["mat","sun","ship","rain","frog","sock"]:
    x = load(ROOT/f"public/a/w/{w}.mp3"); y,_ = trim(x)
    print("cit", w, round(len(y)/SR,3), f0_edges(y, 0, len(y)/SR), round(active_level(y),1))
tts = json.loads((RUNS/"tts/tts.json").read_text())
def best(i): m = tts[i]; return ROOT/m["takes"][m["best"]]["file"]
for i, words in [("M_T1","say pig slowly"),("T1_mat","say mat slowly"),("M_T2","can you find the pig"),("M_T3","say the sound ah"),("M_T4","change ah to ee"),("M_T5","tom read it right"),("M_T6","tap pig then tap cup"),("T3A_a","say the sound"),("T4A_a_ie","change to")]:
    x,_ = trim(load(best(i))); sp = align(x, words.split())
    print(i, round(len(x)/SR,3), [(w, round(a,3), round(b,3)) for w,(a,b) in zip(words.split(), sp)])
    print("   bounds", [tuple(round(v,3) for v in word_bounds(x, sp, k)) for k in range(len(sp))])
    t, f = pitch(x, 0.01); print("   f0", [int(v) for v in f[::3]])
