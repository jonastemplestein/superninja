"""Summarise the ABX judge: mean P(British anchor) and British picks per tested voice and anchor pair; per line with -v."""
import json, sys, collections, statistics as st
d = json.load(open(sys.argv[1])); verbose = "-v" in sys.argv
agg = collections.defaultdict(list); per_line = collections.defaultdict(list)
for k, v in d.items():
    vs = [x for x in v["votes"] if x and "p_uk" in x]
    key = (v["role"], f'{v["uk"]}~{v["us"]}', v["cast"], v.get("truth"))
    agg[key].extend(vs)
    per_line[key + (v["line"],)].extend(vs)
print(f"{'role':9s} {'anchors (UK~US)':34s} {'voice':20s} truth votes  P(UK)  UK-picks")
for key, vs in sorted(agg.items()):
    role, pair, cast, truth = key
    print(f"{role:9s} {pair:34s} {cast:20s} {str(truth):5s} {len(vs):5d} {st.mean(x['p_uk'] for x in vs):6.1f}  {sum(x['pick']=='uk' for x in vs)}/{len(vs)}")
if verbose:
    for key, vs in sorted(per_line.items()):
        print("  ", key[1][:20], key[2], key[4], f"{st.mean(x['p_uk'] for x in vs):5.1f}", [x.get("reason", "")[:90] for x in vs if x["pick"] == "us"][:1])
