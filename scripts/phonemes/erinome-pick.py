#!/usr/bin/env python3
"""Pick, level and install the Erinome pure sounds (27 Sep), and build the Sulafat-against-Erinome listening page.

  uv run -q --with numpy --with scipy --with pyloudnorm --with soundfile python scripts/phonemes/erinome-pick.py \
    [--shortlist N] [--install] [--page]

  (default)    writes playtest/runs/pure-sounds-erinome/shortlist.json: per sound the N best candidates by the acoustic
               measures (erinome-measure.py), at most two per carrier text and mode, for the Gemini judge
               (erinome-judge.ts)
  --install    ranks each sound's judged candidates by measures + judge (score(), lower is better; choices.json in
               playtest/phonemes/ overrides a pick by key), levels each winner to its class's loudness (below), writes
               it atomically over public/a/p/<id>.mp3 (the Sulafat clip is kept in .trash/sulafat-2026-09-27/public/a/p/),
               and rewrites playtest/phonemes/recipes.json
  --page       copies Sulafat (sulafat/) and Erinome (erinome/, alt/) clips next to playtest/phonemes/index.html and
               rebuilds it

Levelling, "loudness-matched per sound class, as before": every clip's loudness is measured the same way, BS.1770
(K-weighted, gated) over 100 ms blocks, since a stop is too short for the 400 ms blocks of integrated LUFS. The
target for a class (stops and pairs, short vowels, long vowels, unvoiced and voiced continuants, glides) is the median
of the Sulafat clips of that class, so the new sounds sit where the old ones did against every other clip; a
true-peak ceiling of -1.5 dBTP applies. Encoded like finishAudio: 44.1 kHz mono MP3, LAME -q:a 4, 25 ms of silence
before and 55 ms after.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "playtest/runs/pure-sounds-erinome"
PAGE = ROOT / "playtest/phonemes"
OLD = ROOT / ".trash/sulafat-2026-09-27/public/a/p"
PUB = ROOT / "public/a/p"
IDS = ("a i m s t n o p b k g h d e f v l r u j w z ks y sh ch th dh ng kw "
       "ae ee ie oe oo ar or er ou oy ue uu air eer zh schwa").split()
TOP6 = ["h", "s", "r", "d", "o", "u"]
CLASS = {**{k: "stop" for k in "p t k b d g ch j ks kw".split()},
         **{k: "short vowel" for k in "a e i o u uu schwa".split()},
         **{k: "long vowel" for k in "ae ee ie oe oo ar or er ou oy ue air eer".split()},
         **{k: "unvoiced continuant" for k in "s f sh th h".split()},
         **{k: "voiced continuant" for k in "m n ng l r v z zh dh".split()},
         "w": "glide", "y": "glide"}
IPA = {"a": "æ", "i": "ɪ", "o": "ɒ", "e": "e", "u": "ʌ", "m": "m", "n": "n", "s": "s", "t": "t", "p": "p", "b": "b",
       "k": "k", "g": "ɡ", "h": "h", "d": "d", "f": "f", "v": "v", "l": "l", "r": "ɹ", "j": "dʒ", "w": "w", "z": "z",
       "ks": "ks", "y": "j", "sh": "ʃ", "ch": "tʃ", "th": "θ", "dh": "ð", "ng": "ŋ", "kw": "kw", "ae": "eɪ", "ee": "iː",
       "ie": "aɪ", "oe": "əʊ", "oo": "uː", "ar": "ɑː", "or": "ɔː", "er": "ɜː", "ou": "aʊ", "oy": "ɔɪ", "ue": "juː",
       "uu": "ʊ", "air": "eə", "eer": "ɪə", "zh": "ʒ", "schwa": "ə"}
EXAMPLE = {"a": "ant", "i": "insect", "o": "octopus", "e": "egg", "u": "up", "m": "map", "n": "net", "s": "sun",
           "t": "top", "p": "pig", "b": "bat", "k": "cat", "g": "gap", "h": "hat", "d": "dog", "f": "fan", "v": "van",
           "l": "leg", "r": "red", "j": "jam", "w": "wet", "z": "zip", "ks": "fox", "y": "yes", "sh": "ship",
           "ch": "chip", "th": "thin", "dh": "this", "ng": "ring", "kw": "quick", "ae": "rain", "ee": "tree",
           "ie": "night", "oe": "boat", "oo": "moon", "ar": "car", "or": "fork", "er": "bird", "ou": "cloud",
           "oy": "boy", "ue": "cube", "uu": "book", "air": "chair", "eer": "deer", "zh": "treasure", "schwa": "sofa"}
CONSONANTS = set(CLASS) - {k for k, v in CLASS.items() if "vowel" in v}
NAME_IS_SOUND = {"ae", "ee", "ie", "oe", "ue", "ar"}


def norm_ipa(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "")
    s = re.sub(r"[\/\[\]ːˑ.ˈˌʰ̥̚ʷ̃ ()\-~ʔ]", "", s).replace("ɡ", "g").replace("r", "ɹ").replace("ɾ", "ɹ")
    s = s.replace("ɛ", "e").replace("ʤ", "dʒ").replace("ʧ", "tʃ").replace("ɐ", "ʌ").replace("ɑ", "ɑ")
    return s


def ipa_match(id: str, heard: str) -> bool:
    h = norm_ipa(heard)
    t = norm_ipa(IPA[id])
    if not h: return False
    alts = {t}
    alts |= {"a": {"a", "æ"}, "o": {"ɒ", "ɔ"}, "u": {"ʌ", "ɐ", "ə"}, "schwa": {"ə", "ɐ", "ʌ", "ɜ"}, "e": {"e"},
             "w": {"w", "wu", "wʊ", "u"}, "y": {"j", "ji", "jɪ", "i"}, "ar": {"ɑ", "a"}, "or": {"ɔ", "o"},
             "er": {"ɜ", "ə", "ɝ"}, "air": {"eə", "e", "ɛə"}, "eer": {"ɪə", "iə"}, "ue": {"ju", "jʉ", "u"},
             "oe": {"əʊ", "oʊ", "əu", "ɜʊ"}, "ou": {"aʊ", "æʊ", "au"}, "oo": {"u", "ʉ"}, "ee": {"i"},
             "ae": {"eɪ", "ei", "ɛɪ"}, "ie": {"aɪ", "ɑɪ", "ai"}, "oy": {"ɔɪ", "oɪ"}, "kw": {"kw", "kʷ"},
             "h": {"h", "hh", "hhh"}, "th": {"θ", "θθ"}}.get(id, set())
    # a held consonant written several times ("sss") is the same sound
    if id in CONSONANTS and len(t) == 1: h = re.sub(rf"({re.escape(t)})+", t, h)
    return h in alts


def norm_judge(j: dict | None) -> dict | None:
    """The cached verdict with its aggregates recomputed from the votes: a vote the model wrapped in a list
    ([{...}]) is that one vote (erinome-judge.ts first averaged it in as naturalness 0)."""
    if not j: return j
    vs = [(v[0] if v else {"error": "empty"}) if isinstance(v, list) else v for v in j["votes"]]
    ok = [v for v in vs if isinstance(v, dict) and not v.get("error")]
    mean = lambda k: round(sum(float(v.get(k) or 0) for v in ok) / len(ok), 2) if ok else None
    return {**j, "votes": ok, "ipa": [str(v.get("ipa", "")) for v in ok], "n": len(ok),
            "letter_name": sum(v.get("letter_name") is True for v in ok),
            "vowel_after": sum(v.get("vowel_after") is True for v in ok),
            "clean": sum(v.get("clean_pure_sound") is True for v in ok), "severity": mean("severity"),
            "naturalness": mean("naturalness"), "artefacts": [a for v in ok for a in (v.get("artefacts") or [])]}


def judge_penalty(id: str, j: dict | None) -> tuple[float, list[str]]:
    if not j or not j.get("n"): return 3.0, ["not judged (+3)"]
    n = j["n"]
    p, why = 0.0, []
    wrong = sum(0 if ipa_match(id, v.get("ipa", "")) else 1 for v in j["votes"] if not v.get("error"))
    if wrong: p += 2 * wrong; why.append(f"judge heard {'/'.join(j['ipa'])} ({wrong}/{n} not /{IPA[id]}/) (+{2 * wrong})")
    # /eɪ/ /iː/ /aɪ/ /əʊ/ /juː/ /ɑː/ ARE the names of A E I O U R: the judge (told "oh" and "you" are letter names)
    # flags a correct long vowel, so its letter-name vote is no fault here
    if j["letter_name"] and id not in NAME_IS_SOUND:
        p += 3 * j["letter_name"]; why.append(f"letter name {j['letter_name']}/{n} (+{3 * j['letter_name']})")
    if id in CONSONANTS and id not in ("w", "y", "kw") and j["vowel_after"]:
        p += 2 * j["vowel_after"]; why.append(f"vowel after {j['vowel_after']}/{n} (+{2 * j['vowel_after']})")
    sev = j.get("severity") or 0
    nat = j.get("naturalness") or 0
    p += .5 * sev + .3 * (10 - nat)
    why.append(f"severity {sev}, naturalness {nat} (+{.5 * sev + .3 * (10 - nat):.1f})")
    if j.get("artefacts"): why.append("artefacts: " + ",".join(sorted(set(j["artefacts"]))))
    return round(p, 2), why


def key(r: dict) -> str:
    return r["file"]


def shortlist(n: int, only: list[str] | None = None, judged: dict | None = None):
    """The N best per sound by the measures (N + 4 for the six Jonas flagged), at most two per text and mode.
    only: just these sounds; judged: skip clips already in this judge cache (a second round of carriers)."""
    items = []
    for id in only or IDS:
        rows = json.loads((WORK / "measures" / f"{id}.json").read_text())
        seen: dict[tuple, int] = {}
        picked = []
        for r in rows:
            if r["mode"] == "ref": continue
            if judged is not None and key(r) in judged: continue
            k2 = (r["text"], r["mode"])
            if seen.get(k2, 0) >= 2: continue
            seen[k2] = seen.get(k2, 0) + 1
            picked.append(r)
            if len(picked) >= n + (4 if id in TOP6 else 0): break
        ref = [r for r in rows if r["mode"] == "ref"]
        for r in picked + ref:
            items.append({"key": key(r), "id": id, "file": r["file"]})
    (WORK / "shortlist.json").write_text(json.dumps(items, indent=1) + "\n")
    print(f"{len(items)} clips in the shortlist")


def ranked(id: str, judge: dict) -> list[dict]:
    rows = json.loads((WORK / "measures" / f"{id}.json").read_text())
    out = []
    for r in rows:
        j = norm_judge(judge.get(key(r)))
        if not j or not j["n"]: continue
        jp, jwhy = judge_penalty(id, j)
        out.append({**r, "judge": j, "jp": jp, "jwhy": jwhy, "score": round(r["obj"] + jp, 2)})
    out.sort(key=lambda r: r["score"])
    return out


def block_loudness(x: np.ndarray, sr: int) -> float:
    m = pyln.Meter(sr, block_size=0.100)
    return float(m.integrated_loudness(x))


def decode(path: Path, sr=44100) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", str(sr),
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def class_targets() -> dict[str, float]:
    by: dict[str, list[float]] = {}
    for id in IDS:
        x = decode(OLD / f"{id}.mp3")
        by.setdefault(CLASS[id], []).append(block_loudness(x, 44100))
    return {c: round(float(np.median(v)), 2) for c, v in by.items()}


def true_peak_db(x: np.ndarray) -> float:
    from scipy.signal import resample_poly
    return float(20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12))


def render(id: str, src: Path, target: float, out: Path) -> dict:
    """Level a candidate wav to `target` (100 ms-block loudness) under a -1.5 dBTP ceiling; 44.1 kHz mono MP3."""
    x = decode(src)
    # the candidates carry 40/60 ms of silence; trim to the sound, then 25 ms before and 55 ms after
    e = np.convolve(x ** 2, np.ones(441) / 441, "same")
    on = np.flatnonzero(e > e.max() * 10 ** (-60 / 10))
    x = x[max(0, on[0] - 44): on[-1] + 44] if len(on) else x
    L = block_loudness(np.r_[np.zeros(4410), x, np.zeros(4410)], 44100)
    g = target - L
    y = x * 10 ** (g / 20)
    tp = true_peak_db(y)
    limited = 0.0
    if tp > -1.5:
        limited = tp + 1.5
        y = y * 10 ** (-limited / 20)
    y = np.r_[np.zeros(int(.025 * 44100)), y, np.zeros(int(.055 * 44100))]
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "a.wav"
        sf.write(str(wav), y, 44100, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(wav), "-ar", "44100", "-ac", "1",
                        "-codec:a", "libmp3lame", "-q:a", "4", str(out)], check=True)
    y2 = decode(out)
    return {"gain_db": round(g, 2), "peak_limited_db": round(limited, 2),
            "block_lufs": round(block_loudness(np.r_[np.zeros(4410), y2, np.zeros(4410)], 44100), 2),
            "true_peak_dbtp": round(true_peak_db(y2), 2), "dur_s": round(len(y2) / 44100, 3)}


def describe(r: dict) -> str:
    mode = {"iso": f"the take \"{r['text']}\" said on its own", "init_vl": f"the start of \"{r['text']}\", up to the voicing",
            "final_vl": f"the end of \"{r['text']}\", after the voicing", "init_hold": f"the held start of \"{r['text']}\", before the vowel",
            "final_vd": f"the end of \"{r['text']}\", after the vowel", "stop_final": f"the released stop at the end of \"{r['text']}\"",
            "stop_init": f"the release at the start of \"{r['text']}\", before the vowel",
            "vowel": f"the vowel of \"{r['text']}\"", "tail_vowel": f"the last vowel of \"{r['text']}\"",
            "medial": f"the consonant in the middle of \"{r['text']}\"", "glide": f"the take \"{r['text']}\" (school form)",
            "f3dip": f"the /r/ of \"{r['text']}\" (found by its low F3)",
            "vowel_f1": f"the vowel nucleus of \"{r['text']}\" (found by its F1)"}[r["mode"]]
    how = {"natural": "natural length, no processing", "natural-short": "natural length, no processing",
           "noise-shaped": "lengthened with fresh noise of its own spectrum (no stretching)",
           "noise-grains": "lengthened with random grains of its own noise (no stretching)",
           "world": "lengthened by WORLD resynthesis with natural pitch drift"}[r["how"]]
    return f"{mode} (take {r['take']}, {r['variant']}); {how}"


def merge_durations(ids: list[str]):
    """public/a/durations.json: the new p/<id> lengths (ms, ffprobe, as scripts/gen-durations.ts) merged into the file
    as it is now (other lanes write it too), written atomically."""
    f = ROOT / "public/a/durations.json"
    d = json.loads(f.read_text())
    for id in ids:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
                              "default=noprint_wrappers=1:nokey=1", str(PUB / f"{id}.mp3")], capture_output=True, text=True)
        d[f"p/{id}"] = round(float(out.stdout.strip()) * 1000)
    tmp = f.with_name(".durations.json.pure-sounds")
    tmp.write_text(json.dumps(d, indent=2) + "\n")  # keys keep their order (all p/ ids exist already)
    os.replace(tmp, f)


def install(judge: dict, choices: dict):
    targets = class_targets()
    print("class targets (100 ms-block LUFS of the Sulafat clips):", targets)
    final = WORK / "final"
    stage = WORK / "stage"
    final.mkdir(exist_ok=True)
    stage.mkdir(exist_ok=True)
    OLD.mkdir(parents=True, exist_ok=True)
    recipes, report = {}, {}
    for id in IDS:
        rs = ranked(id, judge)
        rs = [r for r in rs if r["mode"] != "ref"]
        pick = None
        if choices.get(id, {}).get("file"):
            pick = next((r for r in rs if r["file"] == choices[id]["file"]), None)
            if pick is None: raise SystemExit(f"{id}: choice {choices[id]['file']} not judged")
        pick = pick or rs[0]
        out = final / f"{id}.mp3"
        lv = render(id, ROOT / pick["file"], targets[CLASS[id]], out)
        if not (OLD / f"{id}.mp3").exists() and (PUB / f"{id}.mp3").exists():
            shutil.copy2(PUB / f"{id}.mp3", OLD / f"{id}.mp3")
        shutil.copy2(out, stage / f"{id}.mp3")
        os.replace(stage / f"{id}.mp3", PUB / f"{id}.mp3")
        a, q, j = pick["art"], pick["qa"], pick["judge"]
        recipes[id] = {"voice": "Erinome", "method": describe(pick), "text": pick["text"], "take": pick["take"],
                       "mode": pick["mode"], "variant": pick["variant"], "processing": pick["how"],
                       "source": pick["src"], "cut_s": pick["cut_s"], "natural_s": pick["natural_s"],
                       "why": choices.get(id, {}).get("why", "best by the measures and the blind judge"),
                       "levelled": {"class": CLASS[id], "target_block_lufs": targets[CLASS[id]], **lv}}
        report[id] = {"pick": pick["file"], "score": pick["score"], "obj": pick["obj"], "jp": pick["jp"],
                      "why": pick["why"] + pick["jwhy"], "qa": q["verdict"], "qa_reasons": q["reasons"],
                      "whisper": pick.get("whisper"), "judge_ipa": j.get("ipa"), "letter_name": j.get("letter_name"),
                      "vowel_after": j.get("vowel_after"), "severity": j.get("severity"), "naturalness": j.get("naturalness"),
                      "clean": j.get("clean"), "art": {k: a.get(k) for k in ("voiced_ms", "noise_std_db", "persist_r",
                      "tonal_z_max", "resid_r", "kurt", "jitter_pct", "f0_wobble_st", "warble_pct", "flux_spike",
                      "lead_click_db", "tail_click_db", "click_ratio")}, "ex": pick["ex"], "level": lv,
                      "runners_up": choices.get(id, {}).get("alts") or [r["file"] for r in rs if r is not pick][:3]}
        print(f"{id:6} {pick['score']:6} {pick['text']:12} {pick['mode']:10} {pick['variant']:28} {pick['how']:13} "
              f"{lv['dur_s']}s {lv['block_lufs']} LUFS(100ms) tp {lv['true_peak_dbtp']}")
    prev = json.loads((PAGE / "recipes.json").read_text()) if (PAGE / "recipes.json").exists() else {}
    doc = {"_doc": "Pure sounds, Erinome (27 Sep): how each public/a/p clip was made (scripts/phonemes/erinome-*.{ts,py}). "
                   "The Sulafat recipes that these replace are under _sulafat; the clips in .trash/sulafat-2026-09-27/public/a/p/.",
           **recipes, "_sulafat": prev.get("_sulafat", {k: v for k, v in prev.items() if not k.startswith("_")})}
    (PAGE / "recipes.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
    (WORK / "install-report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False) + "\n")
    merge_durations(IDS)


def page():
    import html as H
    rep = json.loads((WORK / "install-report.json").read_text())
    rec = json.loads((PAGE / "recipes.json").read_text())
    for d in ("sulafat", "erinome", "alt"):
        (PAGE / d).mkdir(exist_ok=True)
    for id in IDS:
        shutil.copy2(OLD / f"{id}.mp3", PAGE / "sulafat" / f"{id}.mp3")
        shutil.copy2(PUB / f"{id}.mp3", PAGE / "erinome" / f"{id}.mp3")
    targets = class_targets()
    alts: dict[str, list[tuple[str, str]]] = {}
    for id in TOP6:
        for i, f in enumerate(rep[id]["runners_up"][:2]):
            out = PAGE / "alt" / f"{id}.{i + 1}.mp3"
            render(id, ROOT / f, targets[CLASS[id]], out)
            rows = json.loads((WORK / "measures" / f"{id}.json").read_text())
            r = next(r for r in rows if r["file"] == f)
            alts.setdefault(id, []).append((f"alt/{id}.{i + 1}.mp3", describe(r)))
    e = H.escape

    def card(id: str, top: bool) -> str:
        r, c = rep[id], rec[id]
        heard = ", ".join(f"/{x}/" for x in (r.get("judge_ipa") or []))
        facts = [f"{r['level']['dur_s']:.2f} s", f"acoustic gate {r['qa']}"]
        if r.get("clean") is not None: facts.append(f"blind judge: clean {r['clean']}/3, heard {heard}")
        if r.get("severity") is not None: facts.append(f"artefact severity {r['severity']}/10, natural {r['naturalness']}/10")
        a = r["art"]
        if CLASS[id] == "unvoiced continuant":
            facts.append(f"noise texture {a.get('noise_std_db')} dB (5.6 = pure noise), voiced {a.get('voiced_ms')} ms")
        elif a.get("kurt") is not None:
            facts.append(f"pulse kurtosis {a.get('kurt')}, pitch wobble {a.get('f0_wobble_st')} st")
        if "post_voiced_ms" in r["ex"]: facts.append(f"voicing after the release {r['ex']['post_voiced_ms']} ms")
        altx = "".join(f'<div class="alt"><span>Erinome, another cut: {e(d)}</span><audio controls preload="none" src="{src}"></audio></div>'
                       for src, d in alts.get(id, [])) if top else ""
        return f"""<article class="row{' top' if top else ''}" data-search="{e((id + ' ' + EXAMPLE[id] + ' ' + c['method']).lower())}">
  <h3><span class="ipa">/{e(IPA[id])}/</span> <span class="id">{e(id)}</span> <span class="ex">as in <b>{e(EXAMPLE[id])}</b></span></h3>
  <div class="pair">
    <div class="side old"><span class="lab">Sulafat (old)</span><audio controls preload="none" src="sulafat/{id}.mp3"></audio></div>
    <div class="side new"><span class="lab">Erinome (new)</span><audio controls preload="none" src="erinome/{id}.mp3"></audio></div>
    <button class="ab" data-a="sulafat/{id}.mp3" data-b="erinome/{id}.mp3" aria-label="Play old then new">old → new</button>
  </div>
  <p class="how">{e(c['method'])}</p>
  <p class="facts">{e(' · '.join(facts))}</p>{altx}
</article>"""

    top = "\n".join(card(i, True) for i in TOP6)
    rest = "\n".join(card(i, False) for i in IDS if i not in TOP6)
    doc = f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Pure Sounds: Erinome</title>
<style>
:root{{--bg:#f5f7fb;--card:#fff;--ink:#17243b;--mute:#52627b;--line:#e1e7f0;--head:#132c50;--headink:#fff;--lead:#d9e5f5;--old:#8a5a00;--new:#0f6b3a;--top:#fff7e0;--btn:#e7effb}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#0f1520;--card:#18212f;--ink:#e6edf7;--mute:#9aabc2;--line:#2a3547;--head:#0b1a30;--headink:#fff;--lead:#b8c8de;--old:#f0b44c;--new:#5fd495;--top:#2a2515;--btn:#243249}}}}
:root[data-theme="dark"]{{--bg:#0f1520;--card:#18212f;--ink:#e6edf7;--mute:#9aabc2;--line:#2a3547;--head:#0b1a30;--headink:#fff;--lead:#b8c8de;--old:#f0b44c;--new:#5fd495;--top:#2a2515;--btn:#243249}}
*{{box-sizing:border-box}}body{{margin:0;font:16px/1.45 system-ui,sans-serif;color:var(--ink);background:var(--bg)}}
header{{padding:1.6rem 16px;background:var(--head);color:var(--headink)}}header>div,main{{max-width:980px;margin:auto}}
h1{{font-size:1.6rem;margin:.1rem 0 .5rem}}.lead{{color:var(--lead);max-width:70ch;margin:.3rem 0}}
main{{padding:1rem 16px 3rem}}h2{{font-size:1.15rem;margin:1.6rem 0 .6rem}}
.controls{{display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;margin:.5rem 0 1rem}}
input{{font:inherit;padding:.6rem .7rem;border:1px solid var(--line);border-radius:.5rem;background:var(--card);color:var(--ink);width:min(100%,20rem)}}
.row{{background:var(--card);border:1px solid var(--line);border-radius:.8rem;padding:.8rem .9rem;margin:.6rem 0}}
.row.top{{background:var(--top)}}h3{{margin:0 0 .4rem;font-size:1.1rem;display:flex;gap:.6rem;align-items:baseline;flex-wrap:wrap}}
.ipa{{font-size:1.35rem}}.id{{color:var(--mute);font-size:.85rem}}.ex{{font-weight:400;color:var(--mute);font-size:.95rem}}
.pair{{display:grid;grid-template-columns:1fr 1fr auto;gap:.6rem;align-items:end}}
.side{{min-width:0}}.lab{{display:block;font-size:.8rem;font-weight:650;letter-spacing:.02em}}.old .lab{{color:var(--old)}}.new .lab{{color:var(--new)}}
audio{{width:100%;height:40px;display:block;margin-top:.2rem}}
.ab{{font:inherit;font-size:.85rem;padding:.55rem .7rem;border-radius:.5rem;border:1px solid var(--line);background:var(--btn);color:var(--ink);cursor:pointer;white-space:nowrap}}
.how{{margin:.5rem 0 .15rem;font-size:.92rem}}.facts{{margin:0;color:var(--mute);font-size:.8rem}}
.alt{{margin-top:.5rem;font-size:.82rem;color:var(--mute)}}.alt audio{{max-width:420px}}
footer{{color:var(--mute);font-size:.85rem;max-width:980px;margin:auto;padding:0 16px 2rem}}
@media (max-width:620px){{.pair{{grid-template-columns:1fr}}.ab{{justify-self:start}}}}
</style></head><body>
<header><div><h1>Pure sounds · Sulafat (old) against Erinome (new)</h1>
<p class="lead">All 46 phonics sounds, rebuilt in the Erinome voice. The old Sulafat clip is on the left, the new Erinome one on the right; "old → new" plays them one after the other. The six sounds you flagged come first (/h/, /s/, /r/, /d/, /o/, /u/), each with two other Erinome cuts to compare.</p>
<p class="lead">How they were made: stops are only the burst and a short release, never a vowel after it; short vowels are the natural nucleus at 0.15-0.22 s; nothing unvoiced is time-stretched. 43 of the 46 are untouched natural Erinome audio, most of them Erinome saying the sound on its own or the start or end of a word; /l/ and /z/ were lengthened by WORLD resynthesis with a natural pitch drift, and /th/ with fresh noise of its own spectrum. /r/ is a natural 0.2 s cut from "red": every longer /r/, whether Erinome held it or WORLD lengthened it, came out trilled or robotic.</p>
<p class="lead">Worth your ear: /r/ (short, as above); /j/ (every Erinome /dʒ/ risks sounding like /ch/, since the voiced ones came with a "juh"); /b/ and /g/ (voice bar and release, like /d/); /th/ and /dh/ against /f/ and /v/; /kw/.</p></div></header>
<main>
<h2>Listen to these first</h2>
{top}
<h2>All the other sounds</h2>
<div class="controls"><label>Find a sound <input id="q" type="search" placeholder="e.g. sh, ship, vowel"></label><span id="count"></span></div>
{rest}
</main>
<footer>Measures: scripts/phonemes/erinome-measure.py (Praat and artefact measures), a blind Gemini judge (3 votes, 400 ms of silence in front) and Whisper for letter names; about 1,900 candidates cut from 648 Erinome takes, 535 of them judged, plus the 46 Sulafat clips. Every Sulafat clip is kept in .trash/sulafat-2026-09-27/public/a/p/; recipes in playtest/phonemes/recipes.json.</footer>
<script>
const q=document.querySelector('#q'),rows=[...document.querySelectorAll('main > .row:not(.top)')],count=document.querySelector('#count');
function show(){{let n=0;const v=q.value.toLowerCase().trim();for(const r of rows){{const ok=r.dataset.search.includes(v);r.hidden=!ok;if(ok)n++}}count.textContent=n+' of '+rows.length}}
q.addEventListener('input',show);show();
document.addEventListener('play',e=>{{for(const a of document.querySelectorAll('audio'))if(a!==e.target)a.pause()}},true);
let player=null;
for(const b of document.querySelectorAll('.ab'))b.addEventListener('click',()=>{{
  for(const a of document.querySelectorAll('audio'))a.pause();
  if(player)player.pause();
  const a=new Audio(b.dataset.a),n=new Audio(b.dataset.b);player=a;
  a.onended=()=>setTimeout(()=>{{player=n;n.play()}},600);a.play();
}});
</script></body></html>
"""
    (PAGE / "index.html").write_text(doc)
    print("wrote", PAGE / "index.html")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--shortlist", type=int, default=0)
    ap.add_argument("--only", nargs="*", help="--shortlist: just these sounds")
    ap.add_argument("--unjudged", action="store_true", help="--shortlist: only clips not yet in judge.json")
    ap.add_argument("--install", action="store_true")
    ap.add_argument("--rank", nargs="*")
    ap.add_argument("--page", action="store_true")
    args = ap.parse_args()
    judge = json.loads((WORK / "judge.json").read_text()) if (WORK / "judge.json").exists() else {}
    if args.shortlist: shortlist(args.shortlist, args.only, judge if args.unjudged else None)
    if args.rank is not None:
        for id in args.rank or IDS:
            for r in ranked(id, judge)[:6]:
                print(f"{id:5} {r['score']:6} obj {r['obj']:5} jp {r['jp']:5} {r['text']:12} {r['take']} {r['mode']:10} "
                      f"{r['variant']:26} {r['how']:12} {r['ex']['active_s']}s ipa={'/'.join(r['judge']['ipa'])} "
                      f"wh={r.get('whisper')!r}")
    if args.install:
        choices = json.loads((PAGE / "choices.json").read_text()) if (PAGE / "choices.json").exists() else {}
        install(judge, {k: v for k, v in choices.items() if not k.startswith("_")})
    if args.page:
        page()
