# The final contact sheet (FIX_PLAN §11.3, §13.3): every named still, beside the same screen in the P0 baseline.
# Run: python3 playtest/fix/final/contact.py   (writes playtest/fix/final/frames/ and contact.html)
import glob, html, os, re, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
FIX = f"{ROOT}/playtest/fix"
OUT = f"{FIX}/final"
BASE_SOUND = f"{ROOT}/playtest/runs/fix/baseline/sound/frames"
BASE_SWEEP = f"{ROOT}/playtest/runs/fix/baseline/sweep/cases"

# (group, name, lane, what it should show, baseline case, hint in the baseline frame's name)
STILLS = [
    ("Teacher's voice (§13.3)", "w1-ready-first", "C2", "▶ spotlit, the ninja in its ready stance facing it, the paw not yet shown", "w1-wu1", "talk"),
    ("Teacher's voice (§13.3)", "w1-ready-paw", "C2", "▶ and the paw, the paw spotlit on \"paw\"", "w1-wu1", "talk"),
    ("Teacher's voice (§13.3)", "w1-notice-petal-tap", "C2", "the /s/ petal blooming, waiting for the child's tap", "w1-wu1", "s-petal"),
    ("Teacher's voice (§13.3)", "w2-1-frame", "D1", "four misty petals in a row, nothing pulsing, no ear", "w2-1", "000"),
    ("Teacher's voice (§13.3)", "w2-1-first-bloom", "D1", "the /b/ petal mid-introduction on \"Here it comes…\"", "w2-1", "b-"),
    ("Teacher's voice (§13.3)", "w1-6-letters-dim", "D2", "the letter row dim during the frame, ▶ in the column", "w1-6", "000"),
    ("Teacher's voice (§13.3)", "w1-8-kick", "D3", "the first tile glowing on \"Can you tap it, and kick it out?\"", "w1-8", "000"),
    ("Fast and slow (§13.5)", "fs-rabbit-live", "C1", "Word Building's first read-back: the rabbit big, pulsing and spotlit beside the speaker", "w1-4", "talk"),
    ("Fast and slow (§13.5)", "fs-tortoise-step", "C1", "the tortoise lit mid-step during a slow word, the tile of the sound being said lit", "w1-4", "sound"),
    ("Fast and slow (§13.5)", "fs-w5-rabbit", "C2", "W5: the scene's own rabbit pulsing after the sounds", "w1-wu5", "000"),
    ("Shell and rewards (§7)", "title-blossoms", "B1", "no teardrops drifting on the title", "sweep:title", ""),
    ("Shell and rewards (§7)", "reward-w2-1-petals", "B1", "the won sounds' petals in the reward panel", "sweep:w2-1", "last"),
    ("Shell and rewards (§7)", "reward2-hero", "B4", "the /s/ hero petal lifted out of the flower, mid-introduction", "reward2", "s-petal"),
    ("Shell and rewards (§7)", "flower-intro-first-petal", "B3", "the first visit uses the child's own first petal", "flower-intro", "sound-a"),
    ("Shell and rewards (§7)", "trip-bigpetal-shoulder", "B3", "the BigPetal's picture on its top-right shoulder, no duplicate nav petal", "tree-found", "000"),
    ("Shell and rewards (§7)", "trip-th-pair", "B3", "a two-sounds trip shows the pair", "tree-found-th", "000"),
    ("Warm-ups and early levels (§8)", "w1-notice-intro", "C2", "the /s/ petal mid-introduction", "w1-wu1", "s-petal"),
    ("Warm-ups and early levels (§8)", "w5-dots", "C2", "during W5's /s/ /u/ /n/: three dots, the second lit, no petal (Dec1)", "w1-wu5", "sound-s"),
    ("Warm-ups and early levels (§8)", "w6-mini-petals", "C2", "after two dot taps: two mini petals and one plain dot", "w1-wu6", "sound"),
    ("Warm-ups and early levels (§8)", "reader-book", "C1", "the reader still bobs", "w1-4", "000"),
    ("Warm-ups and early levels (§8)", "readcheck-check", "C1", "(replaces readcheck-pair: TEACHER_SCRIPT §3.16 B's \"Let's check…\", the tiles lighting)", "sweep:w1-5", ""),
    ("Warm-ups and early levels (§8)", "w1-3-no-apple", "C1", "an /a/ turn with no apple card", "sweep:w1-3", ""),
    ("Dojo, battles and the rest (§9)", "dojo-learn-hero-intro", "D1", "the 220 hero petal mid-introduction; the tally as two mini petals", "w2-1", "talk-b"),
    ("Dojo, battles and the rest (§9)", "find-wrong-pop", "D1", "/d/ above the tapped tile, /b/ in the nav row", "w2-1", "sound-d"),
    ("Dojo, battles and the rest (§9)", "build-second-miss", "D1", "/s/ above the wrong tile (dimmed), /m/ above the slot", "w2-1", "sound"),
    ("Dojo, battles and the rest (§9)", "w3-6-x-pair", "D1", "/k/ + /s/ with \"+\", no blank petal", "w3-6", "sound-k"),
    ("Dojo, battles and the rest (§9)", "w5-1-th-pair", "D1", "the /th/ petal while /th/ plays, beside the /dh/ feather", "w5-1", "sound-th"),
    ("Dojo, battles and the rest (§9)", "w5-6-reminder-pop", "D1", "the petal above the lit two-letter tile on \"one sound\"", "w5-6", "t_two_letters"),
    ("Dojo, battles and the rest (§9)", "battle-help3", "D2", "Help's third step in a battle", "w1-6", "sound"),
    ("Dojo, battles and the rest (§9)", "trial-gem-colour", "D2", "the trial gem in its chart colour", "trial", "000"),
    ("Dojo, battles and the rest (§9)", "swap-thats-h", "D3", "\"That's… /h/\" pops above the tapped letter", "w1-8", "sound"),
    ("Dojo, battles and the rest (§9)", "swap-pick-no-petal", "D3", "the spelling choices show no petal", "w1-8", "talk"),
    ("Dojo, battles and the rest (§9)", "sort-intro-hero", "D4", "a 220 hero petal above the closed chests", "w6-br1", "000"),
    ("Dojo, battles and the rest (§9)", "sort-play-header", "D4", "the 104 header petal", "w6-br1", "sound"),
    ("Dojo, battles and the rest (§9)", "run-blend-dots", "D5", "blend mode: dots, not petals (Dec1)", "w1-9", "sound"),
    ("Dojo, battles and the rest (§9)", "run-counter-stars", "D5", "the counter and pickups are stars (Dec6)", "w1-9", "000"),
    ("Dojo, battles and the rest (§9)", "run-before-after", "D5", "the baked background and ground match at equal distance (its own before/after)", None, ""),
]


def find_after(name, lane):
    for ext in ("png", "jpg"):
        p = f"{FIX}/{lane}/frames/{name}.{ext}"
        if os.path.exists(p):
            return p
    hits = sorted(glob.glob(f"{FIX}/*/frames/{name}.*"))
    return hits[0] if hits else None


def find_before(case, hint):
    if not case:
        return None
    if case.startswith("sweep:"):
        fs = sorted(glob.glob(f"{BASE_SWEEP}/{case[6:]}/f_*.png"))
        if not fs:
            return None
        return fs[-1] if hint == "last" else fs[len(fs) // 2]
    fs = sorted(f for f in glob.glob(f"{BASE_SOUND}/{case}-perfect-*.png") if re.match(rf"{re.escape(case)}-perfect-\d", os.path.basename(f)))
    if not fs:
        fs = sorted(glob.glob(f"{BASE_SOUND}/{case}-learner-*.png"))
    if not fs:
        return None
    for f in fs:
        if hint and hint in os.path.basename(f):
            return f
    return fs[0]


os.makedirs(f"{OUT}/frames/before", exist_ok=True)
rows, missing = [], []
for group, name, lane, what, case, hint in STILLS:
    a = find_after(name, lane)
    if not a:
        missing.append(name)
        continue
    ext = os.path.splitext(a)[1]
    shutil.copyfile(a, f"{OUT}/frames/{name}{ext}")
    b = find_before(case, hint)
    bname = None
    if b:
        bname = f"before/{name}{os.path.splitext(b)[1]}"
        shutil.copyfile(b, f"{OUT}/frames/{bname}")
    rows.append((group, name, lane, what, f"frames/{name}{ext}", f"frames/{bname}" if bname else None, os.path.relpath(b, ROOT) if b else None))

# the final build's own Ready hold (integration's CSS change on ▶), and the lanes' other stills
extra = sorted(glob.glob(f"{OUT}/frames/final-build/*.png"))

out = ["<!doctype html><meta charset=utf-8><title>Fix workflow: named stills</title>",
       "<style>body{font:14px/1.4 system-ui;margin:24px;background:#faf7f2;color:#2b1d14}h1{font-size:22px}h2{margin-top:32px;font-size:17px}"
       ".row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0 26px}.row img{width:100%;border:1px solid #ccb;border-radius:6px;background:#fff}"
       ".cap{grid-column:1/3;font-weight:600}.cap small{font-weight:400;color:#6d6158}.none{display:grid;place-items:center;border:1px dashed #ccb;border-radius:6px;color:#8a7d70;min-height:120px}</style>",
       "<h1>The fix workflow's named stills (27 Sep)</h1>",
       "<p>Left: the P0 baseline, the same screen at the nearest captured moment (the sound check's or the sweep's own frames, so the moment is close but not exact). Right: the still the lane took on its frozen build at 844×390. Integration changed nothing that shows in these stills except ▶'s pop (the same look; see the last section, shot on the final build).</p>"]
cur = None
for group, name, lane, what, after, before, bsrc in rows:
    if group != cur:
        out.append(f"<h2>{html.escape(group)}</h2>")
        cur = group
    b = f'<img src="{before}" alt="before">' if before else '<div class="none">no baseline frame of this screen</div>'
    out.append(f'<div class="row"><div class="cap">{html.escape(name)} <small>({lane}) {html.escape(what)}{" · before: " + html.escape(bsrc) if bsrc else ""}</small></div>{b}<img src="{after}" alt="after"></div>')
if extra:
    out.append("<h2>The final build (integration): a Ready hold in NavDemo</h2><div class='row'>")
    for e in extra:
        rel = os.path.relpath(e, OUT)
        out.append(f'<div><div class="cap"><small>{html.escape(os.path.basename(e))}</small></div><img src="{rel}"></div>')
    out.append("</div>")
out.append("<h2>Every other still</h2><p>Each lane's folder has more: " + ", ".join(f'<code>playtest/fix/{l}/frames/</code>' for l in ["A", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4", "D5", "D6", "F1"]) + ".</p>")
open(f"{OUT}/contact.html", "w").write("\n".join(out))
print(f"{len(rows)} stills, {sum(1 for r in rows if r[5])} with a before frame; missing: {missing or 'none'}")
