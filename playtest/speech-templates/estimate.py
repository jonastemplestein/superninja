# Whole-sentence clip estimate per tier. Value spaces: the unit data today (src/content/units/*.ts, via spaces.ts), and
# the planned programme (docs/DECISIONS.md: ~2,100 words and ~800 pictures to EC49; the brief: ~850 words for R-1).
import json, os
here = os.path.dirname(os.path.abspath(__file__))
rows = json.load(open(os.path.join(here, "spaces.json")))
def tier(i): return "R" if i.startswith("IC") or i == "BR" else ("Y1" if int(i[2:]) <= 26 else "Y2")
cum = {}
acc = {k: 0 for k in rows["IC1"]}
for t in ["R", "Y1", "Y2"]:
    for i, r in rows.items():
        if tier(i) == t:
            for k, v in r.items(): acc[k] += v
    cum[t] = dict(acc)
ORAL = 17
# planned scaling (words and pictures), sounds and spellings from the official sequence
plan = {
  "R":  {"words": cum["R"]["words"], "pics": cum["R"]["pics"] + ORAL, "sounds": 29, "gpcs": 41},
  "Y1": {"words": 850, "pics": round((cum["Y1"]["pics"] + ORAL) * 850 / cum["Y1"]["words"]), "sounds": 42, "gpcs": 114},
  "Y2": {"words": 2100, "pics": 800, "sounds": 44, "gpcs": 172},
}
for t in plan:
    f = plan[t]["words"] / cum[t]["words"]; fp = plan[t]["pics"] / (cum[t]["pics"] + ORAL)
    plan[t]["wordPos"] = round(cum[t]["wordPositions"] * f)
    plan[t]["wordGpc"] = round(cum[t]["wordGpc"] * f)
    plan[t]["cvcPics"] = round(cum[t]["cvcPics"] * fp)
    plan[t]["steps"] = round(cum[t]["steps"] * f)
    plan[t]["data_words"] = cum[t]["words"]; plan[t]["data_pics"] = cum[t]["pics"] + ORAL
SOUND_CARRIERS = 150  # ~35 sound templates x ~2 phrasings x up to 2 halves (pre/post the pure sound)
FAMILIES = {"R": 60, "Y1": 80, "Y2": 110}  # names, numbers, games, pairs
SPECIAL = {"R": 15, "Y1": 35, "Y2": 60}
def full(t):
    p = plan[t]
    items = {
      "picture sentences (name, find x3, starts-with, different-sound, tap-and-hear, I-can-hear): 8 per picture": 8 * p["pics"],
      "middle-sound prefixes (has / doesn't have ... in it): 2 per CVC picture": 2 * p["cvcPics"],
      "word sentences (your word x2, listen again, say slowly x2, Kai/Suki says x2, in-{word} suffix, spelt like this, if it was): 10 per word": 10 * p["words"],
      "position questions (first/next/last sound in {word})": p["wordPos"],
      "swap steps (change {a} to {b}, x2)": 2 * p["steps"],
      "example lists (tp_<p>_hear per sound; tg_see/like per spelling)": p["sounds"] + 2 * p["gpcs"],
      "special words": SPECIAL[t], "name/number/game families": FAMILIES[t], "sound-slot carriers (pre/post halves)": SOUND_CARRIERS,
    }
    return items
def lean(t):
    p = plan[t]
    return {
      "picture sentences (name, starts-with): 2 per picture": 2 * p["pics"],
      "word sentences (your word, listen again, say slowly, Kai says, Suki says, in-{word} suffix): 6 per word": 6 * p["words"],
      "position questions": p["wordPos"], "swap steps (x1)": p["steps"], "sound-slot carriers": SOUND_CARRIERS, "families": FAMILIES[t],
    }
out = {"plan": plan, "data": cum}
for t, name in [("R", "Year R (IC1-11 + Bridging)"), ("Y1", "to the end of Year 1 (EC26)"), ("Y2", "whole programme (EC49)")]:
    f, l = full(t), lean(t)
    print(f"\n## {name}: values {plan[t]}")
    for k, v in f.items(): print(f"  {v:7d}  {k}")
    print(f"  FULL {sum(f.values()):,}   LEAN {sum(l.values()):,}   (~{sum(f.values())*22/1024:.0f} MB full at 22 KB/clip)")
    out[t] = {"full": sum(f.values()), "lean": sum(l.values()), "items": f}
json.dump(out, open(os.path.join(here, "estimate.json"), "w"), indent=1)
