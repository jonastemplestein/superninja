# Builds the teacher-voice LINES blocks from docs/TEACHER_SCRIPT.md (TS §7.1, §7.2, §7.3) and SCRIPT_FIXES Part B.
# Writes:
#   playtest/voice/manifest.json   every new or re-recorded line: id, text, TS section, tier, page group, jev heading
#   playtest/voice/block-tv.ts     the "// --- Teacher voice" block (paste at the end of LINES)
#   playtest/voice/block-sf.ts     the "// --- Script style" block (SF Part B, where TS keeps the line)
#   playtest/voice/block-retired.ts the RETIRED_LINES export (TS §7.3)
# Usage: python3 playtest/voice/make-block.py
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
doc = (ROOT / "docs/TEACHER_SCRIPT.md").read_text()
OUT = ROOT / "playtest/voice"

# ---------------------------------------------------------------- TS §7.1: the 339 ids
table = doc.split("### 7.1 New lines to record")[1].split("**The generated families")[0]
rows = re.findall(r"^\| (\d+) \| ([\d.]+) \| `([^`]+)` \| (.+?) \|$", table, re.M)
assert len(rows) == 339, len(rows)
ascii_ = lambda t: t.replace("…", "...").strip()

# section titles, for the listening page
titles = dict(re.findall(r"^### (\d+\.\d+) (.+)$", doc, re.M))
titles = {k: re.sub(r"`", "", v) for k, v in titles.items()}

# ---------------------------------------------------------------- the 25 families: one whole recording per member
ARTICLE = {"map": "a map", "hat": "a hat", "bed": "a bed", "sock": "a sock", "cat": "a cat", "ant": "an ant", "jam": "some jam",
           "tent": "a tent", "nut": "a nut", "bus": "a bus", "pig": "a pig", "pan": "a pan", "pin": "a pin", "mop": "a mop"}
NUM = ["two", "three", "four"]
GAME_PREVIEW = {  # TS §5.8, word for word
    "sounds": "Next is a new game, called Guess My Word. Tap the glowing stone to play.",
    "dots": "Next is a new game, called Sound Dots. Tap the glowing stone to play.",
    "firstsound": "Next is a new game, called First Sounds. Tap the glowing stone to play.",
    "build": "Next is a new game, called Word Building. Tap the glowing stone to play.",
    "battle": "Next is a Monster Battle. Baron Muddle's monsters are guarding the sounds. Tap the glowing stone, if you're brave.",
    "soundhunt": "Next is a new game, called Sound Hunt. Tap the glowing stone to play.",
    "swap": "Next is a new game, called Sound Swap. Baron Muddle has mixed up some words! Tap the glowing stone to fix them.",
    "run": "Next is a new game, called Ninja Run. Tap the glowing stone to play.",
    "story": "Next is Story Time. Tap the glowing stone to open the book.",
    "boss": "Next is the boss of Bamboo Village. Tap the glowing stone, if you're ready.",
    "learn": "Next is the dojo. You'll learn some new sounds there. Tap the glowing stone to go.",
    "sort": "Next is a new game, called Sorting. Tap the glowing stone to play.",
}
# every sort chest's canonical example word (TEACH_EXAMPLES[gem][0]) plus TS's "kit", so any chest order is covered
SPELT = ["kit", "cat", "yak", "duck", "chick", "match", "rain", "tray", "bee", "leaf", "boat", "snow", "light", "pie"]
cap = lambda s: s[0].upper() + s[1:]
FAMILIES = {
    "tv_your_word_<w>": [(w, f"Your word is {w}. Can you find the {w}?") for w in ["sock"]],
    "tv_find_again_<w>": [(w, f"Can you find the {w}?") for w in ["sock"]],
    "tv_idle_look_<w>": [(w, f"Have a look at each picture. Where's the {w}?") for w in ["sock"]],
    "tv_tap_hear_<w>": [(w, f"Tap the {w}, and listen to how it starts.") for w in ["sun"]],
    "tv_now_tap_hear_<w>": [(w, f"Now tap the {w}, and listen to how it starts.") for w in ["sock"]],
    "tv_pocket_ready_<n>": [(n, f"Now you find the other {n}. Are you ready?") for n in ["two", "three"]],
    "tv_pocket_more_<p>": [(p, "One more Pocket Hunt. Find the pictures that start with...") for p in ["s", "m"]],
    "tv_pocket_middle_more_<p>": [(p, "One more Pocket Hunt. Find the pictures with this sound in the middle...") for p in ["o"]],
    "tv_which_q_<pair>": [("cat_dog", "Here I go. Cat... dog. Which row did I read?")],
    "tv_which_fix_<pair>": [("cat_dog", "Let's listen again. Cat... dog. Which row has the cat first?")],
    "tv_which_q_<three>": [("fish_dog_cat", "Here I go. Fish... dog... cat. Which row did I read?")],
    "tv_which_fix_<three>": [("fish_dog_cat", "Let's listen again. Fish... dog... cat. Which row has the fish first?")],
    "tv_i_hear_<w>": [(w, f"I can hear {w}!") for w in ["mug", "sun"]],
    "tv_guess_so_<w>": [(w, f"I can hear {w}. So I tap the {w}.") for w in ["sun"]],
    "tv_ido_pair_<pair>": [(f"{a}_{b}", f"I'll go first. Here's {ARTICLE[a]} and {ARTICLE[b]}.")
                           for a, b in [("map", "hat"), ("bed", "sock"), ("cat", "ant"), ("jam", "tent"), ("nut", "hat"), ("bus", "pig"), ("pan", "pin"), ("map", "mop")]],
    "tv_yes_<reader>": [(r, f"Yes! {cap(r)} read it right.") for r in ["kai", "suki"]],
    "tv_right_<reader>": [(r, f"{cap(r)} read it right.") for r in ["kai", "suki"]],
    "tv_won_<n>": [(n, f"You won back {n} sounds...") for n in NUM],
    "tv_learn_frame_<n>": [(n, f"Today in the dojo, I'm going to teach you {n} new sounds.") for n in NUM],
    "tv_learn_all_<n>": [(n, f"{cap(n)} new sounds! You said every one.") for n in NUM],
    "tv_learn_recap_<n>": [(n, f"Back to the dojo, for {n} new sounds. You know how this goes.") for n in NUM],
    "tv_learn_short_<n>": [(n, f"Back to the dojo. Today there are {n} new sounds.") for n in NUM],
    "tv_map_next_<game>": list(GAME_PREVIEW.items()),
    "tv_spelt_like_this_<w>": [(w, f"In {w}, it's spelt like this.") for w in SPELT],
    "tv_hear_in_<w>": [(w, f"I can hear it in {w}.") for w in ["rain"]],
}
assert len(FAMILIES) == 25

# ---------------------------------------------------------------- tiers (FIX_PLAN §13.4)
p1_text = open(ROOT / "docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md").read().split("**TV-P1:")[1].split("- **TV-P2:")[0]
P1 = set(re.findall(r"`(tv_[a-z_<>]+)`", p1_text))
def tier(fam_id, sec):
    if fam_id in P1 or fam_id.startswith("tv_praise_"):
        return 1
    return 3 if sec.startswith("4.") else 2

# ---------------------------------------------------------------- where each line is said: the jev heading (lines.ts
# sub-heading, whose prefix picks jev-lint-lines' screen context) and the listening page's group
def heading(i, sec):
    if sec == "2.3" or sec == "5.2": return "Early learning"
    if sec == "3.1": return "Title"
    if sec in ("3.2", "3.3", "3.5", "3.7", "3.9", "3.10", "3.11", "3.12"): return "First minutes"
    if sec == "3.4": return "Ninja Training"
    if sec == "3.6": return "Sticker Book"
    if sec == "3.8": return "Map" if i.startswith("tv_map") else "World Flower"
    if sec == "3.14": return "Rewards" if i.startswith(("tv_to_reward", "tv_won")) else "World Flower"
    if sec in ("3.13", "3.15", "3.16", "3.17", "3.19", "4.7"): return "Early learning"
    if sec in ("3.18", "3.24", "4.2", "4.4"): return "Battle"
    if sec == "3.20": return "Swap"
    if sec in ("3.21", "4.5"): return "Run"
    if sec == "3.22":
        return "Swap" if "swap" in i or i == "tv_show_offer_short" else "Battle" if "battle" in i else "Early learning"
    if sec == "3.23": return "Story"
    if sec == "3.25": return "Map" if i.startswith("tv_map") else "World Flower"
    if sec in ("3.26", "4.6", "4.10"): return "Dojo"
    if sec == "4.1":
        if re.match(r"tv_(pocket|slow|guess|dots)_", i): return "First minutes"
        if re.match(r"tv_(battle|boss)_", i): return "Battle"
        if i.startswith("tv_run"): return "Run"
        if i.startswith("tv_story"): return "Story"
        if i.startswith("tv_learn"): return "Dojo"
        return "Early learning"
    if sec == "4.3": return "Sort"
    if sec == "4.9": return "Placement"
    if sec == "5.3": return "Praise"
    if sec in ("5.4", "5.5"): return "Correction"
    if sec in ("5.6", "5.7"): return "Rewards"
    if sec == "5.8": return "Map"
    raise ValueError((i, sec))

# the tv_map_next_<game> family's own row is in §3.25 but its lines are §5.8's
lines = []
seen = set()
for n, sec, fid, text in rows:
    if fid in FAMILIES:
        for member, t in FAMILIES[fid]:
            i = fid.split("<")[0] + member
            lines.append(dict(id=i, text=ascii_(t), sec=sec, family=fid, tier=tier(fid, sec)))
    else:
        lines.append(dict(id=fid, text=ascii_(text), sec=sec, family=None, tier=tier(fid, sec)))
for l in lines:
    assert l["id"] not in seen, l["id"]
    seen.add(l["id"])
    l["heading"] = heading(l["id"], l["sec"])
    l["group"] = f"TS §{l['sec']} {titles[l['sec']]}"
    l["kind"] = "tv"
    assert "…" not in l["text"] and "[" not in l["text"] and "/" not in l["text"].replace("s/", ""), l

# check against the §7.1 table: every single line's text is the table's, families match the table's sample member
fam_sample = {"tv_your_word_<w>": "sock", "tv_tap_hear_<w>": "sun", "tv_i_hear_<w>": "mug", "tv_guess_so_<w>": "sun",
              "tv_which_q_<pair>": "cat_dog", "tv_which_fix_<pair>": "cat_dog", "tv_which_q_<three>": "fish_dog_cat",
              "tv_which_fix_<three>": "fish_dog_cat", "tv_won_<n>": "two", "tv_learn_frame_<n>": "four", "tv_learn_all_<n>": "four",
              "tv_learn_recap_<n>": "three", "tv_learn_short_<n>": "three", "tv_hear_in_<w>": "rain", "tv_yes_<reader>": "suki",
              "tv_right_<reader>": "suki", "tv_find_again_<w>": "sock", "tv_idle_look_<w>": "sock", "tv_now_tap_hear_<w>": "sock",
              "tv_pocket_more_<p>": "s", "tv_pocket_middle_more_<p>": "o"}
by_id = {l["id"]: l for l in lines}
for n, sec, fid, text in rows:
    if fid in fam_sample:
        got = by_id[fid.split("<")[0] + fam_sample[fid]]["text"]
        assert got == ascii_(text), (fid, got, text)

# ---------------------------------------------------------------- TS §7.2: the 24 re-records (their new text)
t72 = doc.split("### 7.2 Kept lines")[1].split("### 7.3")[0]
rerec = []
for ids, old, new in re.findall(r"^\| ([a-z0-9_ ·]+) \| (.+?) \| (.+?) \|$", t72, re.M):
    if ids.strip() == "line id": continue
    for i in [x.strip() for x in ids.split("·")]:
        t = ascii_(new)
        if i in ("fm_rainbow_q", "fm_snowman_q"):  # the row's text is written for fm_starfish_q
            t = t.replace("Star... fish.", {"fm_rainbow_q": "Rain... bow.", "fm_snowman_q": "Snow... man."}[i])
        rerec.append(dict(id=i, text=t, old=ascii_(old), sec="7.2", family=None, tier=1, heading=None,
                          group="TS §7.2 Kept lines, re-recorded with calm punctuation", kind="rerecord"))
assert len(rerec) == 24, len(rerec)
_src = (ROOT / "src/content/lines.ts").read_text()
for r in rerec:  # the text recorded today (before this lane re-records it)
    m = re.search(r'[sb]\("' + r["id"] + r'",\s*"((?:[^"\\]|\\.)*)"\)', _src)
    if m and m.group(1) != r["text"]: r["old"] = m.group(1)

# ---------------------------------------------------------------- SCRIPT_FIXES Part B, where TS keeps the line
# Not recorded: st_speaker_ok, st_like_this_in, st_and_like_this_in (TS §7.3) and fm_fast_mug (TS §3.5 B: W3 needs none).
# TS's punctuation where TS says the line (st_hear_two "I can hear two sounds.") or rewrites its shape (§2.4 rule 2:
# "Last one." → "Here's the last one.").
SF = [
    ("Dojo", "st_two_letters_too", "This one's two letters too, but it's just one sound."),
    ("Dojo", "st_know_this_sound", "Ooh, you already know this sound!"),
    ("Dojo", "st_last_one", "Here's the last one."),
    ("Dojo", "st_find_q2", "Where's..."),
    ("Dojo", "st_find_q3", "Now find..."),
    ("Dojo", "st_th_moth_sometimes", "...in moth, and sometimes..."),
    ("Swap", "st_what_change", "What do we need to change?"),
    ("Swap", "st_first_changes", "Yes, the first sound changes!"),
    ("Swap", "st_middle_changes", "Yes, the middle sound changes!"),
    ("Swap", "st_last_changes", "Yes, the last sound changes!"),
    ("Early learning", "st_hear_two", "I can hear two sounds."),
    ("Early learning", "st_hear_three", "I can hear three sounds."),
    ("Early learning", "st_first_q2", "Which picture starts with..."),
    ("Early learning", "st_first_q3", "Find the one that starts with..."),
    ("World Flower", "st_found_new_sounds", "You found some new sounds! Look, here are their petals, shining through the mist."),
    ("World Flower", "st_another_new_sound", "And here's another new sound!"),
]
sf = [dict(id=i, text=t, sec="SF", family=None, tier=1 if i in ("st_hear_two", "st_first_q2", "st_first_q3", "st_what_change", "st_first_changes", "st_middle_changes", "st_last_changes", "st_know_this_sound", "st_two_letters_too", "st_found_new_sounds") else 2,
           heading=h, group="SCRIPT_FIXES Part B (the lines TS keeps)", kind="sf") for h, i, t in SF]

# ---------------------------------------------------------------- TS §7.3: retired from these paths
t73 = doc.split("### 7.3 Lines retired")[1].split("### 7.4")[0]
retired = {}
for bullet in re.findall(r"^- \*\*(.+?)\*\*:? (.+)$", t73, re.M):
    where, body = bullet
    if where.startswith("Families") or where.startswith("SCRIPT_FIXES"): continue
    for m in re.finditer(r"`([a-z0-9_]+)`(?: \(([^)]*)\)| and `audit_hear_see` \(on this path\))?", body):
        i, note = m.group(1), m.group(2)
        retired[i] = note or "retired on these paths"
retired["audit_hear_see"] = retired.get("audit_hear_see", "on this path")
retired["how_we_spell"] = "on this path"
retired["yay_7"] = "as a reward lead"
assert len(retired) == 125, len(retired)

# ---------------------------------------------------------------- write
man = lines + sf + rerec
(OUT / "manifest.json").write_text(json.dumps(man, indent=1, ensure_ascii=False) + "\n")

def js(s): return json.dumps(s, ensure_ascii=False)
out = ["  // --- Teacher voice (docs/TEACHER_SCRIPT.md, 27 Sep).",
       "  // Owned by the teacher-voice lines lane (docs/FIX_PLAN_PERF_SCRIPT_SOUNDS.md §13, TV-F2.1); edit only this block. The",
       "  // 339 ids of TS §7.1, generated from the script by playtest/voice/make-block.py; each generated family (TS's <w>,",
       "  // <n>, <p>, <pair>, <game>, <reader>) is one whole recording per member. A lead-in ends on \"...\" and is recorded",
       "  // suspended, so a pure sound or a word can follow it. Sub-headings name the screen for jev-lint-lines."]
cur = None
for l in lines:
    key = (l["heading"], l["sec"])
    if key != cur:
        cur = key
        out.append(f"  // --- {l['heading']} (teacher voice, TS §{l['sec']}): {titles[l['sec']]}")
    out.append(f"  s({js(l['id'])}, {js(l['text'])}),")
(OUT / "block-tv.ts").write_text("\n".join(out) + "\n")

out = ["  // ---- Script style (docs/SCRIPT_STYLE.md, 26 Sep). Owned by the script fixes; edit only this block. SCRIPT_FIXES",
       "  // Part B, where docs/TEACHER_SCRIPT.md keeps the line (not recorded: st_speaker_ok, st_like_this_in and",
       "  // st_and_like_this_in, TS §7.3; fm_fast_mug, TS §3.5 B). TS's calm punctuation for st_hear_two/three and st_last_one."]
cur = None
for l in sf:
    if l["heading"] != cur:
        cur = l["heading"]
        out.append(f"  // --- {cur} (script style): SCRIPT_FIXES Part B")
    out.append(f"  s({js(l['id'])}, {js(l['text'])}),")
(OUT / "block-sf.ts").write_text("\n".join(out) + "\n")

out = ["// --- Teacher voice: retired lines (docs/TEACHER_SCRIPT.md §7.3, 27 Sep). Owned by the teacher-voice lines lane.",
       "/** Lines the teacher's voice retires from the preschool and early paths. They stay in LINES (and keep their clips) until",
       " *  nothing calls them; the value says where they retire (\"retired on these paths\" everywhere TS covers). The tail",
       " *  clips `tg_<g>_<p>_in` retire too, replaced by `tg_<g>_<p>_way` (TS §3.14, T11). */",
       "export const RETIRED_LINES: Readonly<Record<string, string>> = {"]
for i, note in retired.items():
    out.append(f"  {i}: {js(note)},")
out.append("};")
(OUT / "block-retired.ts").write_text("\n".join(out) + "\n")

print(f"tv lines: {len(lines)} ({len([l for l in lines if l['family']])} family members), sf: {len(sf)}, re-records: {len(rerec)}, retired: {len(retired)}")
print("tiers:", {t: sum(1 for l in lines if l['tier'] == t) for t in (1, 2, 3)})
