import json, re, collections, sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from freq import load, norm, LINES, VARK
FAM = [
    (r"^fs_\w+$", "fs_<w>"), (r"^mid_\w+$", "mid_<w>"), (r"^fm_name_\w+$", "fm_name_<w>"), (r"^fm_diff_\w+$", "fm_diff_<w>"),
    (r"^fm_not_in_\w+$", "fm_not_in_<w>"), (r"^tg_.+_way$", "tg_<g>_<p>_way"), (r"^tg_.+_in$", "tg_<g>_<p>_in"), (r"^tg_.+_see$", "tg_<g>_<p>_see"),
    (r"^tg_.+_like$", "tg_<g>_<p>_like"), (r"^tp_.+_hear$", "tp_<p>_hear"), (r"^tp_.+_list$", "tp_<p>_list"), (r"^t_ways_\d+$", "t_ways_<n>"),
    (r"^yay_\d+$", "yay_<n>"), (r"^world_\d$", "world_<n>"), (r"^streak_\d+$", "streak_<n>"), (r"^tv_your_word_\w+$", "tv_your_word_<w>"),
    (r"^tv_find_again_\w+$", "tv_find_again_<w>"), (r"^tv_idle_look_\w+$", "tv_idle_look_<w>"), (r"^tv_ido_pair_\w+$", "tv_ido_pair_<pair>"),
    (r"^tv_which_(q|fix)_\w+$", r"tv_which_\1_<pair>"), (r"^tv_pocket_more_\w+$", "tv_pocket_more_<p>"), (r"^tv_spelt_like_this_\w+$", "tv_spelt_like_this_<w>"),
    (r"^fm_pair_\w+$", "fm_pair_<pair>"), (r"^fm_triple_\w+$", "fm_triple_<three>"), (r"^audit_special_\w+$", "audit_special_<w>"),
    (r"^tv_learn_(frame|all|recap|short)_\w+$", r"tv_learn_\1_<n>"), (r"^tv_won_\w+$", "tv_won_<n>"), (r"^tv_map_next_\w+$", "tv_map_next_<game>"),
    (r"^fm_read_\w+$", "fm_read_<pair>"), (r"^tv_(yes|right)_\w+$", r"tv_\1_<reader>"),
]
def fam(i):
    for rx, f in FAM:
        if re.match(rx, i or ""): return re.sub(rx, f, i)
    return i
def pairs(path, gap=0.7):
    after = collections.Counter(); before = collections.Counter(); T = 0; lc = collections.Counter(); examples = collections.defaultdict(set)
    for name, evs in load(path):
        if not evs: continue
        T += max(e["t"] for e in evs) - min(e["t"] for e in evs)
        prev = None; taps = []
        for e in evs:
            if e.get("kind") == "tap": taps.append((e["t"], str(e.get("text","")).lower())); continue
            n = norm(e)
            if not n: continue
            kind, i, txt, d = n; t = e["t"]
            if kind == "line": lc[fam(i)] += 1
            echo = kind != "line" and any(0 <= t - tt <= 0.9 and (tx == txt.lower() or kind == "sound") for tt, tx in taps[-4:])
            if prev and not echo:
                pk, pi, ptxt, pend = prev
                if t <= pend + gap:
                    if pk == "line" and kind != "line": after[(fam(pi), VARK[kind])] += 1; examples[(fam(pi), VARK[kind])].add(txt)
                    if pk != "line" and kind == "line": before[(fam(i), VARK[pk])] += 1
            if echo: prev = None; continue
            # a run of var clips extends the previous line's reach
            prev = (kind, i, txt, t + d)
    return after, before, T, lc, examples

if __name__ == "__main__":
    tot_after = collections.Counter(); tot_T = 0
    res = {}
    for path in sys.argv[1:]:
        a, b, T, lc, ex = pairs(path)
        res[path] = (a, b, T, lc, ex)
        print(f"\n### {path}  {T/60:.1f} min; {sum(lc.values())} lines ({sum(lc.values())/(T/600):.0f} per 10 min)")
        for (l, v), n in a.most_common(70):
            print(f"{n:4d} {n/(T/600):6.2f}/10m  {l} → {v}   «{LINES.get(l, LINES.get(l.replace('<w>','sock'),'?'))[:60]}»  e.g. {sorted(ex[(l,v)])[:4]}")
        print("-- var → line")
        for (l, v), n in b.most_common(25):
            print(f"{n:4d} {n/(T/600):6.2f}/10m  {v} → {l}")
