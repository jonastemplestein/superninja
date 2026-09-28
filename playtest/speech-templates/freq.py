import json, re, collections, sys
ROOT = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/"
DUR = json.load(open(ROOT + "public/a/durations.json"))
LINES = {}
for m in re.finditer(r'[sb]\("([a-z0-9_]+)",\s*"((?:[^"\\]|\\.)*)"\)', open(ROOT + "src/content/lines.ts").read()):
    LINES[m.group(1)] = m.group(2)
for m in re.finditer(r'"id": "([^"]+)",\s*"text": "([^"]*)"', open(ROOT + "src/content/teach-lines.gen.ts").read()):
    LINES[m.group(1)] = m.group(2)
VARK = {"sound": "[sound]", "word": "[word]", "stretch": "[slow]", "onset": "[first]", "story": "[story]"}

def norm(e):
    """-> (kind, id, text, dur_s) for speech events, else None"""
    k = e.get("kind")
    if k == "say":
        i = e.get("id")
        if not i and e.get("url"):
            i = re.sub(r"^/a/l/|\.mp3$", "", e["url"])
        d = e.get("dur")
        if d is None: d = DUR.get("l/" + (i or ""), 1500)
        return ("line", i, e.get("text", ""), d / 1000)
    if k in VARK:
        txt = e.get("text", "")
        if e.get("url"):
            m = re.match(r"/a/(\w)/(.+)\.mp3", e["url"]); key = f"{m.group(1)}/{m.group(2)}" if m else ""
        else:
            key = {"sound": "p/", "word": "w/", "stretch": "x/", "onset": "o/", "story": "s/"}[k] + txt.strip("/")
        d = e.get("dur")
        if d is None: d = DUR.get(key, 700)
        return (k, None, txt, d / 1000)
    return None

def load(path):
    d = json.load(open(ROOT + path))
    if isinstance(d, list):  # journey: levels
        return [(lv["name"], lv["events"]) for lv in d]
    return [("all", d["evs"])]

def analyse(path, gap=1.0):
    groups = []; total_t = 0.0; linecount = collections.Counter()
    for name, evs in load(path):
        if not evs: continue
        total_t += max(e["t"] for e in evs) - min(e["t"] for e in evs)
        cur = []; prev_end = -99; last_taps = []
        for e in evs:
            if e.get("kind") == "tap":
                last_taps.append((e["t"], str(e.get("text", "")).lower())); continue
            n = norm(e)
            if not n: continue
            kind, i, txt, d = n
            if kind == "line": linecount[i] += 1
            t = e["t"]
            echo = False
            if kind in ("word", "stretch", "onset", "sound"):
                for (tt, tx) in last_taps[-4:]:
                    if 0 <= t - tt <= 0.9 and (tx == txt.lower() or kind == "sound"):
                        echo = True
            if echo:
                if cur: groups.append((name, cur))
                cur = []; prev_end = -99; continue
            if cur and t <= prev_end + gap:
                cur.append((kind, i, txt))
            else:
                if cur: groups.append((name, cur))
                cur = [(kind, i, txt)]
            prev_end = max(prev_end, t + d) if cur and len(cur) > 1 else t + d
        if cur: groups.append((name, cur))
    return groups, total_t, linecount

def sig(g, collapse=True):
    toks = []
    for kind, i, txt in g:
        tok = i if kind == "line" else VARK[kind]
        if collapse and toks and tok == toks[-1] and tok.startswith("["):
            toks[-1] = tok  # a run of the same slot counts once, marked
            if not toks[-1].endswith("+]"): toks[-1] = tok[:-1] + "+]"
            continue
        if collapse and toks and toks[-1] == tok[:-1] + "+]": continue
        toks.append(tok)
    return toks

def bigrams(g):
    """(line, next var slot) and (var, next line) pairs inside a group"""
    out = []
    for a, b in zip(g, g[1:]):
        if a[0] == "line" and b[0] != "line": out.append((a[1], VARK[b[0]], "after"))
        if a[0] != "line" and b[0] == "line": out.append((b[1], VARK[a[0]], "before"))
    return out

if __name__ == "__main__":
    for path in sys.argv[1:]:
        groups, T, lc = analyse(path)
        mix = [g for n, g in groups if any(k == "line" for k, *_ in g) and any(k != "line" for k, *_ in g)]
        print(f"\n### {path}: game time {T/60:.1f} min, lines {sum(lc.values())}, mixed groups {len(mix)}")
        c = collections.Counter(" · ".join(sig(g)) for g in mix)
        for s, n in c.most_common(80): print(f"{n:4d}  {n/(T/600):6.2f}/10min  {s}")
        bg = collections.Counter()
        for g in mix:
            for b in bigrams(g): bg[b] += 1
        print("-- bigrams")
        for (l, v, w), n in bg.most_common(120): print(f"{n:4d} {n/(T/600):6.2f}/10min  {l} {w} {v}   «{LINES.get(l,'?')[:70]}»")
