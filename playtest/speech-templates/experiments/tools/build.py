"""Speech-template experiment, step 2: assemble every method's clip for 6 templates × their slot values.

Methods (docs/speech-templates/experiments.md):
  A   whole sentence per combination (Gemini TTS); T3/T4: the words around a pause, the pure clip in the pause
  B   today's lead-in style: "Say this word slowly..." + 400 ms + the library clip
  C   naive splice: one master carrier, the library word clip dropped into the filler's place (10 ms fades)
  C2  C's citation clip, but with D's processing (pitch, duration, level, optimal-coupling joins)
  D   prosody-matched splice: the word cut from a take of the same sentence, spliced into the master with
      optimal-coupling joins at zero crossings, 8 ms crossfades, Praat PSOLA pitch/duration and K-weighted level
      matching; T3/T4: the master's words, a 150 ms micro-pause, the pure clip, the carrier's tail glided in pitch
  D2  D's processing, but the word cut from one of two generic donors per word ("I think {w} is next." for a
      medial slot, "The last word is {w}." for a final one), shared by every template: the scalable variant
(E, F5-TTS speech editing, is made by f5_edit.py from the jobs this script writes.)

Run: playtest/runs/speech-templates/.venv/bin/python playtest/speech-templates/experiments/tools/build.py
"""
from __future__ import annotations

import math
import sys
import time
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from lib import *  # noqa: E402,F403
from splice import splice  # noqa: E402
import os  # noqa: E402

VARIANTS = tuple(v for v in os.environ.get("VARIANTS", "").split(",") if v)

TTS = json.loads((RUNS / "tts/tts.json").read_text())
WORDS = ["mat", "sun", "ship", "rain", "frog", "sock"]
T6P = [(w, WORDS[(i + 1) % 6]) for i, w in enumerate(WORDS)]
T4P = [("a", "ie"), ("s", "m"), ("m", "d"), ("sh", "s"), ("d", "m"), ("ie", "a")]
SOUNDS = ["a", "s", "m", "sh", "d", "ie"]
NAMES = ["kai", "suki"]
IPA = {"a": "/a/", "s": "/s/", "m": "/m/", "sh": "/sh/", "d": "/d/", "ie": "/ie/"}

# template: master id, master words, slot indices, the words of an item's A take (X = slot)
TPL = {
    "T1": dict(master="M_T1", words="say pig slowly", slots=[1], a="say X slowly", text="Say {0} slowly."),
    "T2": dict(master="M_T2", words="can you find the pig", slots=[4], a="can you find the X", text="Can you find the {0}?"),
    "T3": dict(master="M_T3", words="say the sound ah", slots=[3], text="Say the sound {0}."),
    "T4": dict(master="M_T4", words="change ah to ee", slots=[1, 3], text="Change {0} to {1}."),
    "T5": dict(master="M_T5", words="tom read it right", slots=[0], a="X read it right", text="{0} read it right!"),
    "T6": dict(master="M_T6", words="tap pig then tap cup", slots=[1, 4], a="tap X then tap Y", text="Tap {0}, then tap {1}."),
}


def items(t):
    if t in ("T1", "T2"):
        return [(w,) for w in WORDS]
    if t == "T3":
        return [(s,) for s in SOUNDS]
    if t == "T4":
        return T4P
    if t == "T5":
        return [(n,) for n in NAMES]
    return T6P


def take(i, k=None):
    m = TTS[i]
    return ROOT / m["takes"][m["best"] if k is None else k]["file"]


def ntakes(i):
    return len(TTS[i]["takes"])


@lru_cache(None)
def clip(path):
    x, _ = trim(load(path))
    return x


@lru_cache(None)
def aligned(path, words):
    x = clip(path)
    sp = align(x, words.split())
    return sp


def bounds(path, words, i):
    x = clip(path)
    return word_bounds(x, aligned(path, words), i)


def pure(s):
    return clip(ROOT / f"public/a/p/{s}.mp3")


def lib_word(w):
    return clip(ROOT / f"public/a/w/{w}.mp3")


def name_clip(n):
    return clip(take(f"W_{n}"))


def has_pause(x, a, b, need=0.13):
    """Is there at least `need` s of silence (40 dB under the take's loudest frame) between a and b?"""
    t, db = frame_db(x, 0.005, 0.02)
    quiet = (db < db.max() - 40) & (t >= a) & (t <= b)
    run = best = 0
    for q in quiet:
        run = run + 1 if q else 0
        best = max(best, run)
    return best * 0.005 >= need


def gapped(x, sp, i):
    """Does the filler meet its left/right neighbour across a pause (a pause join) in this take?"""
    left = i > 0 and has_pause(x, sp[i - 1][1], sp[i][0])
    right = i + 1 < len(sp) and has_pause(x, sp[i][1], sp[i + 1][0])
    return left, right


# ---------------------------------------------------------------- the word splice (C2, D, D2)
def plan(M, mb, msp, mi, X, xb):
    """Pitch plan for a donor word: semitone shifts at its start and end so it continues the master's voicing at
    tight joins (the filler's own F0 there); at a pause join only the register moves (a constant shift)."""
    fm = f0_edges(M, *mb)
    fx = f0_edges(X, *xb)
    if not fm or not fx:
        return 0.0, 0.0, 0.0
    gl, gr = gapped(M, msp, mi)
    sa = None if (gl or mi == 0) else st(fx[0], fm[0])
    sb = None if (gr or mi + 1 >= len(msp)) else st(fx[1], fm[1])
    if sa is None and sb is None:
        tm, fmv = pitch(M); tx, fxv = pitch(X)
        vm = fmv[(tm >= mb[0]) & (tm <= mb[1]) & (fmv > 0)]; vx = fxv[(tx >= xb[0]) & (tx <= xb[1]) & (fxv > 0)]
        reg = st(float(np.median(vx)), float(np.median(vm))) if len(vm) and len(vx) else 0.0
        sa = sb = max(-3, min(3, reg))
    elif sa is None:
        sa = sb
    elif sb is None:
        sb = sa
    sa, sb = max(-7, min(7, sa)), max(-7, min(7, sb))
    return sa, sb, abs(sa) + abs(sb)


def splice_words(M, slots, win):
    """slots: [(mb, msp, mi, X, xb, dur)] in order. Returns (signal, joins, info)."""
    parts = []
    cur = 0.0
    info = []
    for (mb, msp, mi, X, xb, dur) in slots:
        ml, mr = mb
        xl, xr = xb
        sa, sb, _ = plan(M, mb, msp, mi, X, xb)
        g = active_level(M[int(ml * SR):int(mr * SR)]) - active_level(X[int(xl * SR):int(xr * SR)])
        g = max(-12, min(12, g if math.isfinite(g) else 0))
        a = min(0.03, xl)
        final = mr >= len(M) / SR - 1e-3
        b = (len(X) / SR - xr) if final else min(0.03, len(X) / SR - xr)
        seg = X[int((xl - a) * SR):int((xr + b) * SR)] * 10 ** (g / 20)
        # prosody transplant: the donor's voiced stretch gets the master filler's own F0 contour (continuous with the
        # carrier around it by construction); falls back to the endpoint ramp if either side has too little voicing
        tmf, fmf = clean_f0(*pitch(M), ml, mr)
        txf, fxf = clean_f0(*pitch(X), xl, xr)
        if len(fmf) >= 4 and len(fxf) >= 4:
            contour = np.interp(np.linspace(0, 1, 24), (tmf - tmf[0]) / max(1e-3, tmf[-1] - tmf[0]), fmf)
            seg = transplant(seg, txf[0] - (xl - a), txf[-1] - (xl - a), contour, dur)
            sa = st(float(np.median(fxf)), float(np.median(fmf))); sb = sa
        else:
            seg = psola(seg, sa, sb, dur, ramp=(a, a + (xr - xl)))
        ql, pr = a * dur, (a + (xr - xl)) * dur
        # left join
        if ml <= 1e-3:
            p_l, q_l = 0.0, 0.0
            parts.append(None)
        else:
            p_l, q_l, _ = best_cut(M, ml, seg, ql, win)
        # right join
        if final:
            p_r, q_r = len(seg) / SR, None
        else:
            p_r, q_r, _ = best_cut(seg, pr, M, mr, win)
        info.append(dict(st_start=round(sa, 2), st_end=round(sb, 2), gain_db=round(g, 2), dur=round(dur, 3),
                         cut=[round(p_l, 4), round(q_l, 4), round(p_r, 4), None if q_r is None else round(q_r, 4)]))
        if ml > 1e-3:
            parts.append((M, int(cur * SR), int(p_l * SR)))
        parts.append((seg, int(q_l * SR), int(p_r * SR)))
        cur = q_r if q_r is not None else None
    if cur is not None:
        parts.append((M, int(cur * SR), len(M)))
    parts = [p for p in parts if p is not None]
    y, joins = xjoin(parts)
    return y, [(j, j) for j in joins], info


def naive(M, cuts, clips):
    """C: the master cut at the filler bounds, the clip as the library ships it, 10 ms fades, butt joins."""
    out, joins, cur = [], [], 0.0
    t = 0.0
    for (ml, mr), c in zip(cuts, clips):
        if ml > 1e-3:
            left = fade(M[int(cur * SR):int(ml * SR)], 0.01 if cur > 0 else 0, 0.01)
            out.append(left); t += len(left) / SR
            joins.append((t, t))
        out.append(c); t += len(c) / SR
        cur = mr
        if mr < len(M) / SR - 1e-3:
            joins.append((t, t))
    if cur < len(M) / SR - 1e-3:
        out.append(fade(M[int(cur * SR):], 0.01, 0))
    return np.concatenate(out), joins


def seq(parts):
    """Concatenate [signal | ('gap', s)], returning join pairs (end of speech before, start of speech after)."""
    out, joins, t = [], [], 0.0
    pend = None
    for p in parts:
        if isinstance(p, tuple):
            if pend is None:
                pend = t
            out.append(sil(p[1]) if len(p) < 3 else tone(p[2], p[1])); t += p[1]
        else:
            if t > 0:
                joins.append((pend if pend is not None else t, t))
            pend = None
            out.append(p); t += len(p) / SR
    return np.concatenate(out), joins


def tone(M, sec):
    """Room tone for a gap: the master's own quietest stretch (its noise floor), looped with 20 ms crossfades."""
    t, db = frame_db(M, 0.005, 0.02)
    quiet = db < db.max() - 40
    best, run, end = 0, 0, 0
    for i, q in enumerate(quiet):
        run = run + 1 if q else 0
        if run > best:
            best, end = run, i
    a, b = int(t[end - best + 1] * SR) + int(0.01 * SR), int(t[end] * SR) - int(0.01 * SR)
    src = M[a:b] if b - a > int(0.06 * SR) else np.zeros(int(0.06 * SR), dtype=np.float32)
    n = int(round(sec * SR))
    outp = np.zeros(0, dtype=np.float32)
    xf = int(0.02 * SR)
    while len(outp) < n:
        if len(outp) == 0:
            outp = src.copy()
        else:
            w = np.sin(np.linspace(0, np.pi / 2, xf)) ** 2
            outp = np.concatenate([outp[:-xf], outp[-xf:] * (1 - w) + src[:xf] * w, src[xf:]])
    return fade(outp[:n], 0.005, 0.005)


# ---------------------------------------------------------------- master selection (unit-selection style)
def choose_master(t):
    cfg = TPL[t]
    if t in ("T3", "T4"):
        return 0 if TTS[cfg["master"]]["best"] is None else TTS[cfg["master"]]["best"]
    best, bestk = float("inf"), 0
    for k in range(ntakes(cfg["master"])):
        mp = take(cfg["master"], k)
        M = clip(mp)
        msp = aligned(mp, cfg["words"])
        total = 0.0
        for it in items(t):
            for si, mi in enumerate(cfg["slots"]):
                aid = a_id(t, it)
                costs = []
                for kk in range(ntakes(aid)):
                    xp = take(aid, kk)
                    words = a_words(t, it)
                    xb = word_bounds(clip(xp), aligned(xp, words), mi)
                    costs.append(plan(M, word_bounds(M, msp, mi), msp, mi, clip(xp), xb)[2])
                total += min(costs)
        if TTS[cfg["master"]]["takes"][k]["score"] < 8:
            total += 100
        if total < best:
            best, bestk = total, k
    return bestk


def a_id(t, it):
    pre = {"T3": "T3A", "T4": "T4A"}.get(t, t)
    return f"{pre}_{'_'.join(it)}"


def a_words(t, it):
    w = TPL[t].get("a", "")
    return w.replace("X", it[0]).replace("Y", it[1] if len(it) > 1 else "")


def label(t, it):
    if t in ("T3", "T4"):
        return TPL[t]["text"].format(*[IPA[s] for s in it])
    return TPL[t]["text"].format(*[w.capitalize() if t == "T5" else w for w in it])


def main():
    manifest = {"items": [], "timing": {}, "masters": {}, "calib": {}}
    timing: dict[str, list[float]] = {}
    f5_jobs = []

    def out(method, t, it, y, joins, extra=None):
        y2 = finish(y)
        # finish() trims up to 10 ms of lead-in: shift the join times by what it removed
        _, off = trim(y)
        joins = [(round(a - off, 4), round(b - off, 4)) for a, b in joins]
        name = f"{t}_{'_'.join(it)}"
        wav = RUNS / f"out/{method}/{name}.wav"
        save_wav(y2, wav)
        save_mp3(wav, EXP / method / f"{name}.mp3")
        manifest["items"].append(dict(method=method, template=t, item=list(it), id=name, label=label(t, it),
                                      wav=str(wav.relative_to(ROOT)), mp3=str((EXP / method / f"{name}.mp3").relative_to(ROOT)),
                                      joins=joins, **(extra or {})))

    for t, cfg in TPL.items():
        k = choose_master(t)
        mp = take(cfg["master"], k)
        M0 = clip(mp)
        M = normalise(M0)  # the carrier at the library's −16 LUFS (C ships it this way; the others level-match anyway)
        msp = aligned(mp, cfg["words"])
        mb = [word_bounds(M0, msp, i) for i in cfg["slots"]]
        manifest["masters"][t] = dict(take=str(mp.relative_to(ROOT)), spans=[[round(a, 3), round(b, 3)] for a, b in msp],
                                      slot_bounds=[[round(a, 3), round(b, 3)] for a, b in mb])
        print(t, "master take", k, mb, flush=True)

        # calibration for C2/D2/E durations: median (word in its A take / donor word) per slot position
        calib = {}
        if t not in ("T3", "T4"):
            for si, mi in enumerate(cfg["slots"]):
                rc, rd, re_ = [], [], []
                for it in items(t):
                    aid = a_id(t, it); xp = take(aid)
                    sp = aligned(xp, a_words(t, it))[mi]
                    w = it[si]
                    cp = take(f"W_{w}") if t == "T5" else ROOT / f"public/a/w/{w}.mp3"
                    csp = aligned(cp, w)[0]
                    rc.append((sp[1] - sp[0]) / (csp[1] - csp[0]))
                    re_.append((sp[1] - sp[0]) / (len(clip(cp)) / SR))
                    if t != "T5":
                        did, dw, di = donor2(t, si, w)
                        dsp = aligned(take(did), dw)[di]
                        rd.append((sp[1] - sp[0]) / (dsp[1] - dsp[0]))
                calib[si] = dict(C2=float(np.clip(np.median(rc), 0.6, 1.25)), E=float(np.median(re_)),
                                 D2=float(np.clip(np.median(rd), 0.7, 1.3)) if rd else 1.0)
            manifest["calib"][t] = calib

        for it in items(t):
            aid = a_id(t, it)
            # ---- A
            t0 = time.perf_counter()
            if t in ("T3", "T4"):
                X = clip(take(aid))
                if t == "T3":
                    y, joins = seq([library_level(X), ("gap", 0.40), pure(it[0])])
                else:
                    sp = align(X, ["change", "to"])
                    L = X[:int(min(len(X) / SR, sp[0][1] + 0.06) * SR)]
                    R = X[int(max(0, sp[1][0] - 0.06) * SR):]
                    L, _ = trim(L); R, _ = trim(R)
                    lev = library_level(X)
                    g = 10 ** ((lufs_of(lev) - lufs_of(X)) / 20) if math.isfinite(lufs_of(X)) else 1
                    y, joins = seq([fade(L * g, 0.025, 0.025), ("gap", 0.40), pure(it[0]), ("gap", 0.30),
                                    fade(R * g, 0.025, 0.025), ("gap", 0.40), pure(it[1])])
                out("A", t, it, y, joins)
            else:
                xp = take(aid)
                X = clip(xp)
                sp = aligned(xp, a_words(t, it))
                joins = []
                for mi in cfg["slots"]:
                    l, r = word_bounds(X, sp, mi)
                    if l > 1e-3:
                        joins.append((l, l))
                    if r < len(X) / SR - 1e-3:
                        joins.append((r, r))
                out("A", t, it, X, joins, dict(natural=True))
            timing.setdefault("A_assemble", []).append(time.perf_counter() - t0)

            # ---- B
            t0 = time.perf_counter()
            B = lambda i: library_level(clip(take(i)))  # noqa: E731
            if t == "T1":
                parts = [B("B_T1"), ("gap", 0.4), lib_word(it[0])]
            elif t == "T2":
                parts = [B("B_T2"), ("gap", 0.4), lib_word(it[0])]
            elif t == "T3":
                parts = [B("B_T3"), ("gap", 0.4), pure(it[0])]
            elif t == "T4":
                parts = [B("B_T4a"), ("gap", 0.4), pure(it[0]), ("gap", 0.3), B("B_T4b"), ("gap", 0.4), pure(it[1])]
            elif t == "T5":
                parts = [B("B_T5"), ("gap", 0.4), library_level(name_clip(it[0]))]
            else:
                parts = [B("B_T6a"), ("gap", 0.4), lib_word(it[0]), ("gap", 0.3), B("B_T6b"), ("gap", 0.4), lib_word(it[1])]
            y, joins = seq(parts)
            out("B", t, it, y, joins)
            timing.setdefault("B_assemble", []).append(time.perf_counter() - t0)

            # ---- C (naive)
            t0 = time.perf_counter()
            if t in ("T3", "T4"):
                clips = [pure(s) for s in it]
            elif t == "T5":
                clips = [library_level(name_clip(it[0]))]
            else:
                clips = [lib_word(w) for w in it]
            y, joins = naive(M, mb, clips)
            out("C", t, it, y, joins)
            timing.setdefault("C_assemble", []).append(time.perf_counter() - t0)

            if t in ("T3", "T4"):
                # ---- D for sounds: the master's words, micro-pauses, level-matched pure clips, the carrier's tail
                # glided towards the sound's pitch (the pure clip itself is never touched but for gain)
                t0 = time.perf_counter()
                words = cfg["words"].split()
                parts = []
                for si, mi in enumerate(cfg["slots"]):
                    # carrier piece before this slot: from the previous slot's end word to this slot's left neighbour
                    a0 = 0.0 if si == 0 else msp[cfg["slots"][si - 1] + 1][0] - 0.05
                    b0 = msp[mi - 1][1] + 0.05
                    piece, _ = trim(M[int(max(0, a0) * SR):int(b0 * SR)])
                    P = pure(it[si])
                    lvl = active_level(piece)
                    gsnd = lvl - active_level(P) - (2.0 if it[si] in ("s", "sh") else 0.0)
                    gsnd = max(-9, min(9, gsnd))
                    fe = f0_edges(P, 0, len(P) / SR)
                    tp, fp = clean_f0(*pitch(piece), 0, len(piece) / SR)
                    shift = 0.0
                    if fe and len(fp) >= 3:
                        end_f0 = float(np.median(fp[-3:]))
                        target = fe[0] * 2 ** (-1.0 / 12)
                        shift = max(-3, min(3, st(end_f0, target)))
                        tend = float(tp[-1])
                        piece = psola(piece, 0.0, shift, 1.0, ramp=(max(0, tend - 0.25), tend))
                    parts += [fade(piece, 0.01 if si else 0.0, 0.01), ("gap", 0.15, M), P * 10 ** (gsnd / 20)]
                    if si + 1 < len(cfg["slots"]):
                        parts.append(("gap", 0.12, M))
                    manifest.setdefault("d_sound", []).append(dict(item=list(it), slot=si, glide_st=round(shift, 2), gain_db=round(gsnd, 2)))
                y, joins = seq(parts)
                out("D", t, it, y, joins)
                timing.setdefault("D_sound_assemble", []).append(time.perf_counter() - t0)
                continue

            # ---- word templates: C2, D, D2 (splice.py), plus the tuning variants in VARIANTS
            for method in ("C2", "D", "D2", "D3") + VARIANTS:
                base = method.rstrip("x")
                mode = "own" if method.endswith("x") else ("auto" if base in ("D", "D3") else "transplant")
                if base in ("D2", "D3") and t == "T5":
                    continue
                t0 = time.perf_counter()
                slots = []
                for si, mi in enumerate(cfg["slots"]):
                    w = it[si]
                    if base == "C2":
                        X = name_clip(w) if t == "T5" else lib_word(w)
                        slots.append(dict(mb=mb[si], msp=msp, mi=mi, X=X, xb=(0.0, len(X) / SR), dur=calib[si]["C2"]))
                        continue
                    if base == "D":
                        cands = [(take(aid, kk), a_words(t, it), mi) for kk in range(ntakes(aid))]
                    elif base == "D3":
                        did, dw, di = donor3(t, si, w)
                        cands = [(take(did, kk), dw, di) for kk in range(ntakes(did))]
                    else:
                        did, dw, di = donor2(t, si, w)
                        cands = [(take(did, kk), dw, di) for kk in range(ntakes(did))]
                    # the take (of 2) whose word needs the least pitch change for this master (unit selection)
                    best = None
                    for xp, words, xi in cands:
                        Xk = clip(xp)
                        xsp = aligned(xp, words)
                        xbk = word_bounds(Xk, xsp, xi)
                        c = plan(M0, mb[si], msp, mi, Xk, xbk)[2]
                        if best is None or c < best[0]:
                            best = (c, Xk, xbk, xsp, xi)
                    _, X, xb, xsp, xi = best
                    if base in ("D", "D3"):
                        mc = len(M0) / SR - (mb[si][1] - mb[si][0])
                        xc = len(X) / SR - (xb[1] - xb[0])
                        dur = float(np.clip(mc / xc, 0.85, 1.15))
                    else:
                        dur = calib[si]["D2"]
                    sl = dict(mb=mb[si], msp=msp, mi=mi, X=X, xb=xb, xsp=xsp, xi=xi, dur=dur, shared=base in ("D", "D3"))
                    if base == "D3" and t == "T2":
                        sl["mode"] = "transplant"  # a statement donor in a question: take the master's tune
                    slots.append(sl)
                y, joins, info = splice(M, slots, mode)
                out(method, t, it, y, joins, dict(processing=info))
                timing.setdefault(f"{method}_assemble", []).append(time.perf_counter() - t0)

            # ---- E job (F5-TTS edit of the master)
            parts, durs = [], []
            for si, mi in enumerate(cfg["slots"]):
                s0, s1 = msp[mi]
                a = max(mb[si][0], s0 - 0.08); b = min(mb[si][1], s1 + 0.08)
                c = name_clip(it[si]) if t == "T5" else lib_word(it[si])
                est = calib[si]["E"] * len(c) / SR
                parts.append([round(a, 3), round(b, 3)])
                durs.append(round((b - a) - (s1 - s0) + est, 3))
            words = cfg["words"].split()
            tgt = list(words)
            for si, mi in enumerate(cfg["slots"]):
                tgt[mi] = it[si]
            master_wav = RUNS / f"masters/{t}.wav"
            save_wav(M, master_wav)
            f5_jobs.append(dict(id=f"{t}_{'_'.join(it)}", template=t, item=list(it), label=label(t, it), audio=str(master_wav),
                                origin=TPL[t]["text"].format(*["Tom" if t == "T5" else "pig", "cup"][:len(cfg["slots"])]) if t != "T6"
                                else "Tap pig, then tap cup.",
                                target=label(t, it), parts=parts, durs=durs))
    manifest["timing"] = {k: dict(n=len(v), mean_ms=round(1000 * float(np.mean(v)), 1)) for k, v in timing.items()}
    dump(manifest, RUNS / "build.json")
    dump(f5_jobs, RUNS / "f5_jobs.json")
    print(json.dumps(manifest["timing"], indent=1))


def donor3(t, si, w):
    """D3's cross-template donor: another sentence with the same word before the slot (say/the/tap)."""
    if t == "T1":
        return f"D3say_{w}", f"say {w} now", 1
    if t == "T2":
        return f"D3the_{w}", f"look at the {w}", 3
    return (f"D3tap_{w}", f"tap {w} now", 1) if si == 0 else (f"D3ntap_{w}", f"now tap {w}", 2)


def donor2(t, si, w):
    """D2's generic donor for a slot: medial (T1, T6's first word) or final (T2, T6's second word)."""
    medial = (t == "T1") or (t == "T6" and si == 0)
    return (f"D2m_{w}", f"i think {w} is next", 2) if medial else (f"D2f_{w}", f"the last word is {w}", 4)


if __name__ == "__main__":
    main()
