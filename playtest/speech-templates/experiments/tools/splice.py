"""The word splice used by C2, D and D2 (second version, after the first judge round heard "the" cut off, closure gaps
and clicks at the joins).

A slot word from a donor take replaces the filler in a master carrier. Where the cuts go:
- Pause join (the master has 130 ms+ of silence between the filler and its neighbour): cut in the silence, keeping the
  master's whole pause, and the donor's own stop closure/release (up to 50 ms of its silence).
- Tight join, no shared context (C2, D2): the master is cut where its neighbour's voicing stops (so a /p/ closure made
  for the filler "pig" doesn't sit in front of "ship"), the donor at its own boundary, keeping up to 70 ms of its own
  closure before a stop.
- Tight join, shared context (D: the donor is a take of the same sentence): the join goes inside the neighbouring word,
  which both takes say, at the pair of points where the two takes are most alike (MFCC, level, F0), so the transition
  into the slot word is the donor's own ("diphone"-style joining, the classic unit-selection trick).
Pitch, per `mode`:
- "transplant": the donor gets the master's own F0 over the replaced stretch, mapped through the join/word anchors,
  so the melody is the master's and continuous at every join.
- "own": the donor keeps its contour, shifted by a ramp that makes it continuous at tight joins.
Level: K-weighted active level matched to the filler's. Duration: a factor (tempo or calibrated). Joins: rising zero
crossings and 8 ms raised-cosine crossfades.
"""
from __future__ import annotations

import math

from lib import *  # noqa: F403

PAUSE = 0.13
LONG_PAUSE = 0.35   # a silence this long before the slot is a real pause, kept whole
FILLER_CLOSURE = 0.08  # the masters' fillers (pig, Tom, cup) start with a stop: its closure is not part of the pause


def runs(x: np.ndarray, rel: float = 35.0) -> list[tuple[float, float]]:
    """Silent stretches: frames more than `rel` dB under the take's loudest frame."""
    t, db = frame_db(x, 0.005, 0.02)
    q = db < db.max() - rel
    out, start = [], None
    for i, v in enumerate(q):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((float(t[start] - 0.0075), float(t[i - 1] + 0.0075))); start = None
    if start is not None:
        out.append((float(t[start] - 0.0075), float(len(x) / SR)))
    return out


def run_at(x: np.ndarray, t0: float, reach: float = 0.03):
    best = None
    for a, b in runs(x):
        if a - reach <= t0 <= b + reach:
            if best is None or (b - a) > (best[1] - best[0]):
                best = (a, b)
    return best


def f0_at(x: np.ndarray, t0: float, span: float = 0.04):
    t, f = pitch(x)
    sel = (np.abs(t - t0) <= span) & (f > 0)
    return float(np.median(f[sel])) if sel.sum() >= 2 else None


def cut_search(P, p_rng, Q, q_rng, anchor=None, step=0.0025):
    """Minimum join cost over p in p_rng (in P) × q in q_rng (in Q). `anchor` (p0, p1, q0, q1): prefer the same relative
    place in the shared word in both takes."""
    tp, mp = mfcc(P); tq, mq = mfcc(Q)
    _, ep = frame_db(P); _, eq = frame_db(Q)
    fpt, fp = pitch(P); fqt, fq = pitch(Q)

    def at(t, arr):
        return arr[min(len(arr) - 1, max(0, int(round(t / 0.005))))]

    def f(t, times, arr):
        return arr[np.argmin(np.abs(times - t))]

    best = (p_rng[0], q_rng[0], float("inf"))
    for p in np.arange(p_rng[0], p_rng[1] + 1e-9, step):
        vp, dp, f_p = at(p, mp), at(p, ep), f(p, fpt, fp)
        for q in np.arange(q_rng[0], q_rng[1] + 1e-9, step):
            c = np.linalg.norm(vp - at(q, mq)) / 10 + abs(dp - at(q, eq)) / 3
            f_q = f(q, fqt, fq)
            if f_p > 0 and f_q > 0:
                c += min(abs(st(f_p, f_q)), 12) / 1.5
            elif (f_p > 0) != (f_q > 0):
                c += 2
            if anchor:
                p0, p1, q0, q1 = anchor
                c += 4 * abs((p - p0) / max(1e-3, p1 - p0) - (q - q0) / max(1e-3, q1 - q0))
            if c < best[2]:
                best = (float(p), float(q), float(c))
    return best


def plan_cuts(M, mb, msp, mi, X, xb, xsp=None, xi=None, shared=False):
    """Cut points: (p_left in M, q_left in X, p_right in X, q_right in M) and the join kinds."""
    ml, mr = mb
    xl, xr = xb
    L = len(M) / SR
    kinds = {}
    # ---- left
    if ml <= 1e-3:
        p_l = q_l = None
        kinds["left"] = "edge"
    else:
        mrun = run_at(M, ml)
        xrun = run_at(X, xl) if xl > 1e-3 else None
        mlen = (mrun[1] - mrun[0]) if mrun else 0.0
        if mlen >= LONG_PAUSE:
            # a deliberate pause in the master: keep it, and the donor's own closure
            p_l = mrun[1] - 0.02
            q_l = max(xrun[0], xrun[1] - 0.05) if xrun else xl
            kinds["left"] = "pause"
        else:
            # the master's silence here is the filler's stop closure (FILLER_CLOSURE) plus any short pause: keep only
            # the pause, and let the donor bring its own onset (its closure, up to 70 ms, if it starts with a stop)
            keep = max(0.0, mlen - FILLER_CLOSURE)
            p_l = (mrun[0] + 0.005 + keep) if mrun else ml
            q_l = max(xrun[0], xrun[1] - 0.07) if xrun else xl
            kinds["left"] = "gap" if keep > 0.03 else "tight"
            if shared and xsp is not None and mi > 0:
                # join inside the neighbouring word both takes say, before any silence: the donor then brings its
                # own gap and transition into the slot word
                n0, n1 = msp[mi - 1]; d0, d1 = xsp[xi - 1]
                m_end = min(n1 + 0.04, ml, mrun[0] if mrun else ml)
                x_end = min(d1 + 0.04, xl, xrun[0] if xrun else xl)
                pr = (n0 + 0.35 * (n1 - n0), max(n0 + 0.36 * (n1 - n0), m_end))
                qr = (d0 + 0.35 * (d1 - d0), max(d0 + 0.36 * (d1 - d0), x_end))
                p, q, c = cut_search(M, pr, X, qr, anchor=(n0, ml, d0, xl))
                p_l, q_l = p, q
                kinds["left"] = "shared"
    # ---- right
    if mr >= L - 1e-3:
        p_r = q_r = None
        kinds["right"] = "edge"
    else:
        mrun = run_at(M, mr)
        xrun = run_at(X, xr) if xr < len(X) / SR - 1e-3 else None
        if mrun and mrun[1] - mrun[0] >= PAUSE:
            q_r = mrun[0] + 0.02
            p_r = (xrun[0] + 0.03) if xrun else xr
            kinds["right"] = "pause"
        else:
            q_r = mrun[0] + 0.005 if mrun else mr
            p_r = (xrun[0] + 0.005) if xrun else xr
            kinds["right"] = "tight"
            if shared and xsp is not None and mi + 1 < len(msp):
                n0, n1 = msp[mi + 1]; d0, d1 = xsp[xi + 1]
                m_beg = max(mr - 0.04, n0 - 0.04, mrun[1] if mrun else 0.0)
                x_beg = max(xr - 0.04, d0 - 0.04, xrun[1] if xrun else 0.0)
                qr = (min(m_beg, n0 + 0.49 * (n1 - n0)), n0 + 0.5 * (n1 - n0))
                pr = (min(x_beg, d0 + 0.49 * (d1 - d0)), d0 + 0.5 * (d1 - d0))
                p, q, c = cut_search(X, pr, M, qr, anchor=(d0 - 0.04, d1, n0 - 0.04, n1))
                p_r, q_r = p, q
                kinds["right"] = "shared"
    return p_l, q_l, p_r, q_r, kinds


def splice(M, slots, mode="transplant"):
    """slots: [dict(mb, msp, mi, X, xb, xsp, xi, dur, shared)] left to right. Returns (signal, joins, info)."""
    parts, info = [], []
    cur = 0.0
    for s in slots:
        M_, mb, msp, mi, X, xb, dur = M, s["mb"], s["msp"], s["mi"], s["X"], s["xb"], s["dur"]
        ml, mr = mb
        xl, xr = xb
        p_l, q_l, p_r, q_r, kinds = plan_cuts(M, mb, msp, mi, X, xb, s.get("xsp"), s.get("xi"), s.get("shared", False))
        a0 = 0.0 if q_l is None else max(0.0, q_l - 0.02)
        a1 = len(X) / SR if p_r is None else min(len(X) / SR, p_r + 0.02)
        seg = X[int(a0 * SR):int(a1 * SR)].copy()
        # level
        g = active_level(M[int(ml * SR):int(mr * SR)]) - active_level(X[int(xl * SR):int(xr * SR)])
        g = max(-12.0, min(12.0, g if math.isfinite(g) else 0.0))
        seg *= 10 ** (g / 20)
        # pitch
        tx, fx = pitch(X)
        tm, fm = pitch(M)
        m_lo = p_l if p_l is not None else 0.0
        m_hi = q_r if q_r is not None else len(M) / SR
        x_lo = q_l if q_l is not None else 0.0
        x_hi = p_r if p_r is not None else len(X) / SR
        tmv, fmv = clean_f0(tm, fm, m_lo - 0.03, m_hi + 0.03)
        txv, fxv = clean_f0(tx, fx, x_lo, x_hi)
        shift_info = None
        use = s.get("mode", mode)
        if use == "auto":
            # a same-sentence donor keeps its own tune on an utterance-final word (the nuclear tune belongs to it);
            # elsewhere it takes the master's melody
            use = "own" if kinds["right"] == "edge" else "transplant"
        if use == "transplant" and len(fmv) >= 4 and len(txv) >= 4:
            # a monotone time map, donor → master: the slot word's voiced stretch onto the filler's voiced stretch,
            # and any shared context (before/after the word) by its offset from the join
            ms0, ms1 = msp[mi]
            xs0, xs1 = (s["xsp"][s["xi"]] if s.get("xsp") is not None else (xl, xr))
            mv = tmv[(tmv >= ms0 - 0.05) & (tmv <= ms1 + 0.05)]
            xv = txv[(txv >= xs0 - 0.05) & (txv <= xs1 + 0.05)]
            if len(mv) >= 2 and len(xv) >= 2:
                xa, ma = [float(xv[0]), float(xv[-1])], [float(mv[0]), float(mv[-1])]
            else:
                xa, ma = [xs0, xs1], [ms0, ms1]
            if x_lo < xa[0] - 0.01 and m_lo < ma[0] - 0.01:
                xa.insert(0, x_lo); ma.insert(0, m_lo)
            if x_hi > xa[-1] + 0.01 and m_hi > ma[-1] + 0.01:
                xa.append(x_hi); ma.append(m_hi)
            # only the master's F0 near the filler (and the shared context) is used
            use_m = (tmv >= ma[0] - 0.03) & (tmv <= ma[-1] + 0.03)
            tmu, fmu = (tmv[use_m], fmv[use_m]) if use_m.sum() >= 3 else (tmv, fmv)
            pts = []
            for tv in txv:
                if tv < xa[0] - 0.03 or tv > xa[-1] + 0.03:
                    continue
                if tv <= xa[0]:
                    tmap = ma[0] - (xa[0] - tv)
                elif tv >= xa[-1]:
                    tmap = ma[-1] + (tv - xa[-1])
                else:
                    tmap = float(np.interp(tv, xa, ma))
                pts.append((tv - a0, float(np.interp(tmap, tmu, fmu))))
            seg = transplant_pts(seg, pts, dur)
            shift_info = "transplant"
        else:
            fl = f0_at(X, x_lo) if kinds["left"] in ("tight", "shared") else None
            ml_f = f0_at(M, m_lo) if kinds["left"] in ("tight", "shared") else None
            fr = f0_at(X, x_hi) if kinds["right"] in ("tight", "shared") else None
            mr_f = f0_at(M, m_hi) if kinds["right"] in ("tight", "shared") else None
            sa = st(fl, ml_f) if fl and ml_f else None
            sb = st(fr, mr_f) if fr and mr_f else None
            if sa is None and sb is None:
                vm = fmv; vx = fxv
                sa = sb = max(-3, min(3, st(float(np.median(vx)), float(np.median(vm))))) if len(vm) and len(vx) else 0.0
            sa = sb if sa is None else sa
            sb = sa if sb is None else sb
            sa, sb = max(-7, min(7, sa)), max(-7, min(7, sb))
            seg = psola(seg, sa, sb, dur)
            shift_info = [round(sa, 2), round(sb, 2)]
        # cut points inside the processed segment (uniform duration scaling)
        ql_seg = 0.0 if q_l is None else (q_l - a0) * dur
        pr_seg = len(seg) / SR if p_r is None else (p_r - a0) * dur
        if p_l is not None:
            parts.append((M, int(cur * SR), int(p_l * SR)))
        parts.append((seg, int(ql_seg * SR), int(min(len(seg), pr_seg * SR))))
        cur = q_r
        info.append(dict(kinds=kinds, gain_db=round(g, 2), dur=round(dur, 3), pitch=shift_info,
                         cuts=[None if v is None else round(v, 4) for v in (p_l, q_l, p_r, q_r)]))
    if cur is not None:
        parts.append((M, int(cur * SR), len(M)))
    y, joins = xjoin(parts)
    return y, [(j, j) for j in joins], info


def transplant_pts(seg: np.ndarray, pts, dur: float = 1.0) -> np.ndarray:
    s = parselmouth.Sound(np.concatenate([seg, np.zeros(1)]).astype(np.float64), SR)
    d = s.duration
    m = call(s, "To Manipulation", 0.005, 75, 600)
    pt = call("Create PitchTier", "p", 0, d)
    for t, f in pts:
        if 0 <= t <= d and f > 0:
            call(pt, "Add point", float(t), float(f))
    call([pt, m], "Replace pitch tier")
    if abs(dur - 1) >= 0.01:
        dt = call("Create DurationTier", "d", 0, d)
        call(dt, "Add point", d / 2, dur)
        call([dt, m], "Replace duration tier")
    o = call(m, "Get resynthesis (overlap-add)")
    return o.values[0].astype(np.float32)
