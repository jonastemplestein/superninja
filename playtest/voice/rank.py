# Ranks the recorded clips worst first, for "take the worst 10% again": the QA (Whisper, pace, loudness, tail), the
# listening judge (warmth, pace, naturalness, a lead-in's ending) and how much the take had to be helped (pauses
# widened, PSOLA lengthening). Writes playtest/voice/worst.json and the ids to re-take (playtest/voice/ids-worst.txt).
#   python3 playtest/voice/rank.py [judge.json] [share, default 0.10]
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
V = ROOT / "playtest/voice"

def score(q: dict, j: dict, g: dict) -> dict:
    """What is wrong with one take, and how much (0 = nothing found)."""
    why = {}
    if not q["exact"]: why["whisper"] = 10
    if q.get("letters"): why["letters"] = 10
    if q.get("fast"): why["fast"] = 5
    if not q["lufs_ok"]: why["loudness"] = 3
    if q.get("blip") is not None: why["tail blip"] = 5
    for k, w in (("warmth", 1), ("pace", 1), ("natural", 1.5)):
        v = j.get(k)
        if isinstance(v, (int, float)) and v < 9: why[f"judge {k} {v}"] = (9 - v) * w
    if j.get("shouted"): why["shouted"] = 5
    if j.get("exact") is False: why["judge: not exact"] = 3
    if q.get("lead") and (j.get("ending") == "falling"): why["ending falls (judge)"] = 1.5
    if q.get("lead") and (q.get("fall") or 0) > 2: why[f"tail falls {q['fall']} st"] = min(2, q["fall"] / 5)
    if g.get("lengthened"): why[f"lengthened ×{g['lengthened']}"] = (g["lengthened"] - 1) * 10
    if g.get("widened"): why[f"pauses +{g['widened']} s"] = 0.5
    if isinstance(g.get("score"), (int, float)) and g["score"] < 10: why[f"gen judge {g['score']}"] = (10 - g["score"]) * 0.5
    lp = q.get("logprob")
    if isinstance(lp, (int, float)) and lp < -0.4: why[f"whisper logprob {lp}"] = (-0.4 - lp) * 3
    return why


def main():
    qa = json.loads((V / "qa.json").read_text())["clips"]
    judge = json.loads(pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else V / "judge.json").read_text())
    share = float(sys.argv[2]) if len(sys.argv) > 2 else 0.10
    rep = json.loads((ROOT / "assets-src/audio-report.json").read_text())
    rows = []
    for i, q in qa.items():
        if q.get("missing"): continue
        why = score(q, judge.get(i, {}), rep.get(f"public/a/l/{i}.mp3", {}))
        rows.append({"id": i, "score": round(sum(why.values()), 2), "why": why, "text": q["text"]})
    rows.sort(key=lambda r: -r["score"])
    n = max(1, round(len(rows) * share))
    worst = [r for r in rows[:n] if r["score"] > 0]
    (V / "worst.json").write_text(json.dumps({"clips": len(rows), "share": share, "worst": worst}, indent=1) + "\n")
    (V / "ids-worst.txt").write_text("\n".join(r["id"] for r in worst) + "\n")
    print(f"{len(worst)} of {len(rows)} clips to take again")
    for r in worst: print(f"{r['score']:6.2f} {r['id']:28} {', '.join(r['why'])}")


if __name__ == "__main__":
    main()
