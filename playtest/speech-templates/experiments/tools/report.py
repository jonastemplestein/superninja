"""Speech-template experiment, step 5: the results tables (markdown on stdout, numbers in experiments/results.json) and
the listening page (experiments/index.html).
Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/report.py
"""
from __future__ import annotations

import html
import json
import math
import random
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
RUNS = ROOT / "playtest/runs/speech-templates"
EXP = ROOT / "playtest/speech-templates/experiments"
METHODS = ["A", "B", "C", "C2", "D", "D2", "D3", "E"]
TEMPLATES = ["T1", "T2", "T3", "T4", "T5", "T6"]
TNAME = {"T1": "Say {word} slowly.", "T2": "Can you find the {word}?", "T3": "Say the sound {sound}.",
         "T4": "Change {sound} to {sound}.", "T5": "{name} read it right!", "T6": "Tap {word}, then tap {word2}."}
MNAME = {"A": "whole-sentence TTS", "B": "today's lead-in + clip", "C": "naive splice", "C2": "library clip + processing",
         "D": "prosody-matched splice (same-sentence donor)", "D2": "prosody-matched splice (2 generic donors per word)",
         "D3": "prosody-matched splice (cross-template donor sharing the neighbouring word)", "E": "F5-TTS speech edit"}

build = json.loads((RUNS / "build.json").read_text())
items = build["items"] + (json.loads((RUNS / "e_items.json").read_text()) if (RUNS / "e_items.json").exists() else [])
metrics = {(m["method"], m["id"]): m for m in json.loads((RUNS / "metrics.json").read_text())}
votes = list(json.loads((RUNS / "judge.json").read_text()).values()) if (RUNS / "judge.json").exists() else []
tts = json.loads((RUNS / "tts/tts.json").read_text())
f5 = json.loads((RUNS / "f5_report.json").read_text()) if (RUNS / "f5_report.json").exists() else {"jobs": []}


def mean(xs):
    xs = [x for x in xs if x is not None and not (isinstance(x, float) and math.isnan(x))]
    return sum(xs) / len(xs) if xs else float("nan")


def fmt(x, d=1, pct=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    return f"{100 * x:.0f}%" if pct else f"{x:.{d}f}"


def table(head, rows):
    out = ["| " + " | ".join(head) + " |", "|" + "|".join("---" for _ in head) + "|"]
    out += ["| " + " | ".join(r) + " |" for r in rows]
    return "\n".join(out)


def bradley_terry(pairs, methods, iters=200):
    """pairs: [(winner, loser)]. MM algorithm; returns strengths normalised to sum 1 (a prior of 0.5 win each way)."""
    w = defaultdict(float); n = defaultdict(float)
    for a, b in pairs:
        w[a] += 1; n[(a, b)] += 1; n[(b, a)] += 1
    for m in methods:
        w[m] += 0.5
    p = {m: 1.0 for m in methods}
    for _ in range(iters):
        new = {}
        for i in methods:
            den = sum((n[(i, j)] + 1) / (p[i] + p[j]) for j in methods if j != i)
            new[i] = w[i] / den if den else p[i]
        s = sum(new.values())
        p = {m: v / s for m, v in new.items()}
    return p


res = {"judge": {}, "whisper": {}, "joins": {}, "cost": {}}
out = []

# ---------------------------------------------------------------- judge
win = defaultdict(lambda: [0, 0])          # (t, m) -> [wins, votes]
spl = defaultdict(lambda: [0, 0])          # (t, m) -> [heard spliced, votes]
h2h = defaultdict(lambda: [0, 0])          # (t, m, other) -> [m wins, votes]
bt_pairs = defaultdict(list)
for v in votes:
    if not v["winner"]:
        continue
    t = v["template"]
    loser = v["b"] if v["winner"] == v["a"] else v["a"]
    for m in (v["a"], v["b"]):
        win[(t, m)][1] += 1
        spl[(t, m)][1] += 1
        spl[(t, m)][0] += int(bool(v["spliced"].get(m)))
    win[(t, v["winner"])][0] += 1
    h2h[(t, v["winner"], loser)][0] += 1
    h2h[(t, v["winner"], loser)][1] += 1
    h2h[(t, loser, v["winner"])][1] += 1
    bt_pairs[t].append((v["winner"], loser))

rows = []
for m in METHODS:
    r = [f"**{m}** {MNAME[m]}"]
    for t in TEMPLATES:
        w, n = win[(t, m)]
        r.append(f"{fmt(w / n, pct=True)}" if n else "–")
    W = sum(win[(t, m)][0] for t in TEMPLATES); N = sum(win[(t, m)][1] for t in TEMPLATES)
    r.append(fmt(W / N, pct=True) if N else "–")
    rows.append(r)
    res["judge"][m] = {t: dict(wins=win[(t, m)][0], votes=win[(t, m)][1]) for t in TEMPLATES}
out.append("### Blind judge: share of paired votes won\n")
out.append(table(["method"] + TEMPLATES + ["all"], rows))

rows = []
for m in METHODS:
    r = [f"**{m}**"]
    for t in TEMPLATES:
        s, n = spl[(t, m)]
        r.append(fmt(s / n, pct=True) if n else "–")
    rows.append(r)
out.append("\n### Blind judge: share of votes where the clip was called spliced\n")
out.append(table(["method"] + TEMPLATES, rows))

rows = []
bt_all = {}
for t in TEMPLATES:
    ms = sorted({m for (tt, m) in win if tt == t and win[(tt, m)][1]}, key=METHODS.index)
    if not ms:
        continue
    bt = bradley_terry(bt_pairs[t], ms)
    bt_all[t] = bt
    order = sorted(ms, key=lambda m: -bt[m])
    rows.append([t, " > ".join(f"{m} ({bt[m]:.2f})" for m in order)])
res["judge_bt"] = bt_all
out.append("\n### Bradley–Terry ranking per template (strengths sum to 1)\n")
out.append(table(["template", "ranking"], rows))

rows = []
for t in TEMPLATES:
    r = [t]
    for m in METHODS:
        if m == "A":
            r.append("·"); continue
        w, n = h2h[(t, m, "A")]
        r.append(f"{fmt(w / n, pct=True)} ({n})" if n else "–")
    rows.append(r)
out.append("\n### Head to head against A (whole-sentence TTS): share of votes the method won (votes)\n")
out.append(table(["template"] + METHODS, rows))

rows = []
for t in TEMPLATES:
    r = [t]
    for m in METHODS:
        if m == "D":
            r.append("·"); continue
        w, n = h2h[(t, "D", m)]
        r.append(f"{fmt(w / n, pct=True)} ({n})" if n else "–")
    rows.append(r)
out.append("\n### Head to head: D's share of votes against each method (votes)\n")
out.append(table(["template"] + METHODS, rows))

# ---------------------------------------------------------------- second opinion: Gemini 3.1 Pro on key pairs
pro = list(json.loads((RUNS / "judge_pro.json").read_text()).values()) if (RUNS / "judge_pro.json").exists() else []
if pro:
    def share(vs, a, b, t):
        sel = [v for v in vs if v["template"] == t and {v["a"], v["b"]} == {a, b} and v["winner"]]
        return (sum(v["winner"] == a for v in sel), len(sel))
    KEY = [("A", "B"), ("A", "C"), ("A", "C2"), ("A", "D"), ("A", "D3"), ("A", "E"), ("B", "D"), ("B", "C"), ("C", "D"), ("D", "E")]
    rows, agree, total = [], 0, 0
    for a, b in KEY:
        r = [f"{a} vs {b}"]
        for t in TEMPLATES:
            w1, n1 = share(votes, a, b, t)
            w2, n2 = share(pro, a, b, t)
            if not n2:
                r.append("–"); continue
            r.append(f"{fmt(w1 / n1, pct=True) if n1 else '–'} / {fmt(w2 / n2, pct=True)}")
            # agreement per item: majority of each judge's 3 votes
            for iid in {v["id"] for v in pro if v["template"] == t and {v["a"], v["b"]} == {a, b}}:
                f = [v for v in votes if v["id"] == iid and {v["a"], v["b"]} == {a, b} and v["winner"]]
                q = [v for v in pro if v["id"] == iid and {v["a"], v["b"]} == {a, b} and v["winner"]]
                if f and q:
                    total += 1
                    agree += (sum(v["winner"] == a for v in f) * 2 > len(f)) == (sum(v["winner"] == a for v in q) * 2 > len(q))
        rows.append(r)
    res["pro_agreement"] = dict(agree=agree, total=total)
    out.append(f"\n### Second opinion: share of votes the first method won, Gemini 3.8 Flash / Gemini 3.1 Pro (items where the two judges' majorities agree: {agree}/{total})\n")
    out.append(table(["pair"] + TEMPLATES, rows))

# ---------------------------------------------------------------- whisper
rows = []
for m in METHODS:
    r = [f"**{m}**"]
    for t in TEMPLATES:
        ms = [metrics[(m, it["id"])] for it in items if it["method"] == m and it["template"] == t and (m, it["id"]) in metrics]
        if not ms:
            r.append("–"); continue
        wer = mean([x["wer"] for x in ms])
        sl = [x["slot_ok"] for x in ms if x["slot_ok"] is not None]
        r.append(f"{fmt(1 - wer, pct=True)}" + (f" / {sum(sl)}/{len(sl)}" if sl else ""))
        res["whisper"].setdefault(m, {})[t] = dict(acc=1 - wer, slot=sum(sl) if sl else None, n=len(ms))
    rows.append(r)
out.append("\n### Whisper word accuracy (1 − WER) / slot words heard (T3, T4: the carrier words only)\n")
out.append(table(["method"] + TEMPLATES, rows))

# ---------------------------------------------------------------- joins
def jstats(m, t=None):
    js = []
    for it in items:
        if it["method"] != m or (t and it["template"] != t) or (m, it["id"]) not in metrics:
            continue
        js += metrics[(m, it["id"])]["joins"]
    tight = [j for j in js if j["tight"]]
    return dict(n=len(js), f0=mean([j["f0_st"] for j in js]), level=mean([j["level_db"] for j in js]),
                energy=mean([j["energy_db"] for j in tight]), spec=mean([j["spec"] for j in tight]),
                n_tight=len([j for j in tight if not math.isnan(j["energy_db"])]))


rows = []
for m in METHODS:
    r = [f"**{m}**"]
    for t in TEMPLATES:
        s = jstats(m, t)
        r.append(fmt(s["f0"]) if s["n"] else "–")
    rows.append(r)
out.append("\n### Join F0 step, mean |semitones| (A = the natural word boundaries in one take)\n")
out.append(table(["method"] + TEMPLATES, rows))

rows = []
for m in METHODS:
    s = jstats(m)
    ws = jstats(m, None)
    res["joins"][m] = s
    r = [f"**{m}**", str(s["n"]), fmt(s["f0"]), fmt(s["level"]), str(s["n_tight"]), fmt(s["energy"]), fmt(s["spec"])]
    rows.append(r)
out.append("\n### Join metrics, all templates\n")
out.append(table(["method", "joins", "|F0 step| st", "|level step| dB", "tight live joins", "|energy step| dB (tight)",
                  "MFCC distance (tight)"], rows))

for grp, ts in (("word templates (T1, T2, T5, T6)", ["T1", "T2", "T5", "T6"]), ("sound templates (T3, T4)", ["T3", "T4"])):
    rows = []
    for m in METHODS:
        js = []
        for t in ts:
            for it in items:
                if it["method"] == m and it["template"] == t and (m, it["id"]) in metrics:
                    js += metrics[(m, it["id"])]["joins"]
        if not js:
            continue
        tight = [j for j in js if j["tight"]]
        rows.append([f"**{m}**", str(len(js)), fmt(mean([j["f0_st"] for j in js])), fmt(mean([j["level_db"] for j in js])),
                     fmt(mean([j["energy_db"] for j in tight])), fmt(mean([j["spec"] for j in tight]))])
    out.append(f"\n#### Joins, {grp}\n")
    out.append(table(["method", "joins", "|F0 step| st", "|level step| dB", "|energy step| dB (tight)", "MFCC dist (tight)"], rows))

# ---------------------------------------------------------------- cost
tts_ms = [t["ms"] for m in tts.values() for t in m["takes"] if t]
f5_s = [j["seconds"] for j in f5.get("jobs", [])]
timing = build["timing"]
res["cost"] = dict(tts_mean_ms=mean(tts_ms), tts_calls=len(tts_ms), f5_mean_s=mean(f5_s), f5_load_s=f5.get("load_s"),
                   assemble=timing)
out.append("\n### Generation time\n")
out.append(table(["step", "mean per clip", "n"], [
    ["Gemini TTS call (Sulafat, one take)", f"{mean(tts_ms) / 1000:.2f} s", str(len(tts_ms))],
    ["F5-TTS edit on M4 Max MPS (32 NFE, one seed)", f"{mean(f5_s):.2f} s" if f5_s else "–", str(len(f5_s))],
    ["F5-TTS model load (once)", f"{f5.get('load_s', float('nan'))} s", "1"],
] + [[f"assemble {k.replace('_assemble', '')} (align, cut, PSOLA, joins, finish)", f"{v['mean_ms'] / 1000:.2f} s", str(v["n"])]
     for k, v in timing.items()]))

(EXP / "results.json").write_text(json.dumps(res, indent=1, default=float))
print("\n".join(out))

# ---------------------------------------------------------------- listening page
by = defaultdict(dict)
for it in items:
    by[(it["template"], it["id"], it["label"])][it["method"]] = it
rows_html = []
for t in TEMPLATES:
    rows_html.append(f'<h2>{t} <span class="tpl">{html.escape(TNAME[t])}</span></h2><table><thead><tr><th>item</th>' +
                     "".join(f'<th class="m" data-m="{m}">{m}<small>{html.escape(MNAME[m])}</small></th>' for m in METHODS) + "</tr></thead><tbody>")
    for (tt, iid, lab), ms in sorted(by.items(), key=lambda kv: kv[0][1]):
        if tt != t:
            continue
        cells = []
        for m in METHODS:
            it = ms.get(m)
            if not it:
                cells.append('<td class="na">–</td>')
                continue
            rel = Path(it["mp3"]).relative_to(EXP.relative_to(ROOT))
            mt = metrics.get((m, iid), {})
            heard = html.escape(mt.get("heard", ""))
            cells.append(f'<td data-m="{m}"><button class="play" data-src="{rel}" title="{heard}">&#9654;</button>'
                         f'<span class="lab">{m}</span></td>')
        rows_html.append(f'<tr><td class="item">{html.escape(lab)}</td>{"".join(cells)}</tr>')
    rows_html.append("</tbody></table>")

wr = {m: sum(win[(t, m)][0] for t in TEMPLATES) / max(1, sum(win[(t, m)][1] for t in TEMPLATES)) for m in METHODS}
page = f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Speech template experiments</title>
<style>
:root{{--bg:#fbfaf7;--fg:#1d1c1a;--mut:#6d6a63;--line:#e3dfd6;--acc:#2f6f5e;--chip:#efece5}}
@media (prefers-color-scheme:dark){{:root{{--bg:#161614;--fg:#ecebe6;--mut:#a09d95;--line:#33322e;--acc:#7cc4ae;--chip:#24231f}}}}
body{{background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif;margin:0 auto;max-width:1100px;padding:16px}}
h1{{font-size:22px;margin:.2em 0}} h2{{font-size:17px;margin:1.6em 0 .4em}} .tpl{{color:var(--mut);font-weight:400}}
p{{color:var(--mut);max-width:70ch}} table{{border-collapse:collapse;width:100%;overflow-x:auto;display:block}}
th,td{{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;white-space:nowrap}}
th small{{display:block;color:var(--mut);font-weight:400;font-size:11px;white-space:normal;max-width:120px}}
td.item{{font-weight:600}} td.na{{color:var(--mut)}}
button.play{{background:var(--chip);color:var(--fg);border:1px solid var(--line);border-radius:999px;width:34px;height:34px;cursor:pointer}}
button.play.on{{background:var(--acc);color:var(--bg)}} .lab{{margin-left:6px;color:var(--mut);font-size:12px}}
.bar{{display:flex;gap:8px;flex-wrap:wrap;align-items:center;position:sticky;top:0;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line)}}
.bar button{{background:var(--chip);color:var(--fg);border:1px solid var(--line);border-radius:8px;padding:6px 10px;cursor:pointer}}
body.blind .lab, body.blind th.m {{visibility:hidden}}
</style></head><body>
<h1>Speech template experiments</h1>
<p>Six templates, each slot value rendered by every method. Press &#9654; to play (hover shows what Whisper heard).
<b>Blind</b> shuffles the columns in each row and hides the method names, so you can pick your favourite by ear first; <b>Reveal</b> shows them.
Write-up: docs/speech-templates/experiments.md. Judge win rates: {", ".join(f"{m} {100 * wr[m]:.0f}%" for m in METHODS)}.</p>
<div class="bar"><button id="blind">Blind</button><button id="reveal">Reveal</button><span id="now" class="tpl"></span></div>
{"".join(rows_html)}
<script>
const a=new Audio();let cur=null;
document.addEventListener('click',e=>{{const b=e.target.closest('button.play');if(!b)return;
 if(cur===b&&!a.paused){{a.pause();b.classList.remove('on');return}}
 if(cur)cur.classList.remove('on');cur=b;a.src=b.dataset.src;a.play();b.classList.add('on');}});
a.addEventListener('ended',()=>cur&&cur.classList.remove('on'));
document.getElementById('blind').onclick=()=>{{document.body.classList.add('blind');
 document.querySelectorAll('tbody tr').forEach(tr=>{{const tds=[...tr.querySelectorAll('td[data-m]')];
  for(let i=tds.length-1;i>0;i--){{const j=Math.floor(Math.random()*(i+1));[tds[i],tds[j]]=[tds[j],tds[i]]}}
  tds.forEach(td=>tr.appendChild(td));}});}};
document.getElementById('reveal').onclick=()=>{{document.body.classList.remove('blind');
 document.querySelectorAll('tbody tr').forEach(tr=>{{const order={json.dumps(METHODS)};
  [...tr.querySelectorAll('td[data-m]')].sort((x,y)=>order.indexOf(x.dataset.m)-order.indexOf(y.dataset.m)).forEach(td=>tr.appendChild(td));
  tr.querySelectorAll('td.na').forEach(td=>tr.appendChild(td));}});}};
</script></body></html>"""
(EXP / "index.html").write_text(page)
