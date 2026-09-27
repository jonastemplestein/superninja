# Writes playtest/voice/index.html: every new and re-recorded teacher-voice line, grouped by game in play order, with
# its text, its clip and its QA (Whisper's transcript, words a second, loudness). Open it from the repo (file://): the
# clips load from ../../public/a/l/, and a re-recorded line also plays its old take from .trash/voice-lane/old-clips/.
#   python3 playtest/voice/make-page.py
import html, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
V = ROOT / "playtest/voice"
man = json.loads((V / "manifest.json").read_text())
qa = json.loads((V / "qa.json").read_text())["clips"] if (V / "qa.json").exists() else {}
texts = json.loads((V / "texts.json").read_text())
old_dir = ROOT / ".trash/voice-lane/old-clips"
alt_dir = ROOT / "playtest/runs/voice/alt"
report = json.loads((ROOT / "assets-src/audio-report.json").read_text())
judge = json.loads((V / "judge.json").read_text()) if (V / "judge.json").exists() else {}

items = [dict(m) for m in man]
way = [i for i in texts if i.endswith("_way") and i.startswith("tg_")]
items += [dict(id=i, text=texts[i], group="World Flower: “This is the way we spell it in…” (tg_<g>_<p>_way, TS §3.14)", kind="way", tier=2) for i in way]
items += [dict(id=i, text=texts[i], group="World Flower: regenerated with “tap” first (SCRIPT_FIXES C3.4)", kind="regen", tier=2) for i in ("tg_t_t_in", "tg_t_t_see", "tg_t_t_like")]

groups: dict[str, list] = {}
for it in items:
    groups.setdefault(it["group"], []).append(it)

esc = html.escape
def badge(q, i):
    if not q: return '<span class="b warn">not checked</span>'
    if q.get("missing"): return '<span class="b bad">no clip</span>'
    out = []
    g = report.get(f"public/a/l/{i}.mp3", {})
    out.append(f'<span class="b {"ok" if q["exact"] else "bad"}" title="{esc(q["heard"])}">{"word-perfect" if q["exact"] else "heard: " + esc(q["heard"])}</span>')
    if q.get("wps"): out.append(f'<span class="b {"bad" if q["fast"] else "ok"}">{q["wps"]:.2f} words/s</span>')
    out.append(f'<span class="b {"ok" if q["lufs_ok"] else "bad"}">{q["lufs"]:.1f} LUFS</span>')
    if q.get("lead"):
        # measured, not the Gemini judge's "ending" (it called 11 of 12 lead-ins the gate passes "falling", 27 Sep)
        f, fl = q.get("fall"), q.get("fall_low")
        worst = max(x for x in (f, fl, -99) if x is not None)
        both = " / ".join("–" if x is None else f"{-x:+.1f}" for x in (f, fl))
        out.append(f'<span class="b {"ok" if worst <= 2 else "bad"}" title="pitch over the last 300 ms of voicing, semitones (gate measure / low-floor measure); suspended: falls no more than 2">ends {"suspended" if worst <= 2 else "falling"} ({both} st)</span>')
    if g.get("widened"): out.append(f'<span class="b warn" title="its own pauses lengthened to be unhurried">pauses +{g["widened"]:.2f} s</span>')
    if g.get("lengthened"): out.append(f'<span class="b {"bad" if g["lengthened"] > 1.3 else "warn"}" title="slowed with Praat PSOLA to reach 3.3 words a second">slowed ×{g["lengthened"]:.2f}</span>')
    j = judge.get(i, {})
    if isinstance(j.get("warmth"), int): out.append(f'<span class="b {"ok" if j["warmth"] >= 9 else "warn"}" title="{esc(j.get("notes", ""))}">warmth {j["warmth"]}</span>')
    return " ".join(out)

sec = []
nav = []
total = 0
for gi, (g, its) in enumerate(groups.items()):
    gid = f"g{gi}"
    nav.append(f'<a href="#{gid}">{esc(g)} <span class="n">{len(its)}</span></a>')
    rows = []
    for it in its:
        total += 1
        i = it["id"]
        old = ""
        if it.get("kind") == "rerecord" and (old_dir / f"{i}.mp3").exists():
            old = f'<div class="old"><span>before: “{esc(it.get("old", ""))}”</span><audio controls preload="none" src="../../.trash/voice-lane/old-clips/{i}.mp3"></audio></div>'
        if (alt_dir / f"{i}.natural.mp3").exists():
            old += f'<div class="old"><span>the same line, not slowed (for comparison)</span><audio controls preload="none" src="../runs/voice/alt/{i}.natural.mp3"></audio></div>'
        tier = f'<span class="t">P{it.get("tier", "")}</span>' if it.get("tier") else ""
        rows.append(f'''<li id="{i}"><div class="txt">{esc(it["text"])}</div><div class="meta"><code>{i}</code>{tier} {badge(qa.get(i), i)}</div>
<audio controls preload="none" src="../../public/a/l/{i}.mp3"></audio>{old}</li>''')
    sec.append(f'''<section id="{gid}"><h2>{esc(g)}</h2><button class="all" data-g="{gid}">Play the group</button><ol>{"".join(rows)}</ol></section>''')

page = f'''<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sensei's New Lines</title>
<style>
:root {{ --bg:#fbf8f3; --fg:#26221d; --mute:#7a7066; --card:#fff; --line:#e7dfd4; --ok:#2f7d4f; --okbg:#e6f3ea; --bad:#a3342a; --badbg:#fbe7e4; --warn:#8a5a00; --warnbg:#fdf1d8; --accent:#c2562e; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#1b1916; --fg:#efe9e1; --mute:#a59b90; --card:#24211d; --line:#3a352f; --okbg:#1e3527; --ok:#8fd3a8; --badbg:#3d2320; --bad:#f0a399; --warnbg:#3a2f18; --warn:#f0c46a; }} }}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--bg); color:var(--fg); font:16px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }}
header {{ padding:24px 16px 8px; max-width:960px; margin:auto }}
h1 {{ font-size:26px; margin:0 0 6px }}
header p {{ color:var(--mute); margin:4px 0 }}
nav {{ max-width:960px; margin:8px auto 0; padding:0 16px; display:flex; flex-wrap:wrap; gap:6px }}
nav a {{ font-size:13px; text-decoration:none; color:var(--fg); background:var(--card); border:1px solid var(--line); border-radius:999px; padding:3px 10px }}
nav a .n {{ color:var(--mute) }}
main {{ max-width:960px; margin:auto; padding:8px 16px 64px }}
section {{ margin-top:28px }}
h2 {{ font-size:18px; margin:0 0 8px; color:var(--accent) }}
ol {{ list-style:none; padding:0; margin:0; display:grid; gap:8px }}
li {{ background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 12px }}
.txt {{ font-size:17px }}
.meta {{ font-size:12px; color:var(--mute); margin:4px 0 6px; display:flex; flex-wrap:wrap; gap:6px; align-items:center }}
code {{ font-size:12px }}
.t {{ font-size:11px; border:1px solid var(--line); border-radius:4px; padding:0 4px }}
.b {{ border-radius:4px; padding:1px 6px }}
.ok {{ background:var(--okbg); color:var(--ok) }} .bad {{ background:var(--badbg); color:var(--bad) }} .warn {{ background:var(--warnbg); color:var(--warn) }}
audio {{ width:100%; max-width:420px; height:34px }}
.old {{ font-size:13px; color:var(--mute); margin-top:4px }} .old span {{ display:block }}
button.all {{ font:inherit; font-size:13px; border:1px solid var(--line); background:var(--card); color:var(--fg); border-radius:6px; padding:3px 10px; margin-bottom:8px; cursor:pointer }}
</style></head><body>
<header><h1>Sensei's new lines</h1>
<p>The teacher's voice (docs/TEACHER_SCRIPT.md): {total} clips, in play order, grouped by game. Each shows the exact script, the clip, and its checks: Whisper's word-for-word match, words a second (at most 3.3), loudness (−16 LUFS, or −19 for a clip under 1.2 s) and, for a lead-in that a sound follows, whether it ends suspended (the listening judge; hover for the measured pitch).</p>
<p>P1 is the first session and the w2-1 lesson, P2 the rest of Bamboo Village, P3 the recaps and later games. A re-recorded line plays its old take underneath. “Play the group” plays a group's clips one after another.</p>
<p>Where no take came in at 3.3 words a second, the kept take was helped: “pauses” means its own pauses were made a little longer; “slowed” means the whole clip was lengthened with Praat's PSOLA, which keeps the voice and pitch. Red “slowed” badges (over ×1.3) are the ones to listen to first: <a href="#tv_ready_go">tv_ready_go</a> and <a href="#tv_ready_now">tv_ready_now</a>, each with its natural take underneath.</p></header>
<nav>{"".join(nav)}</nav>
<main>{"".join(sec)}</main>
<script>
document.addEventListener("play", (e) => {{ for (const a of document.querySelectorAll("audio")) if (a !== e.target) a.pause(); }}, true);
for (const b of document.querySelectorAll("button.all")) b.addEventListener("click", () => {{
  const list = [...document.getElementById(b.dataset.g).querySelectorAll("li > audio")];
  let i = 0;
  const next = () => {{ if (i >= list.length) return; const a = list[i++]; a.currentTime = 0; a.onended = () => setTimeout(next, 600); a.play(); a.closest("li").scrollIntoView({{ block: "nearest", behavior: "smooth" }}); }};
  next();
}});
</script></body></html>
'''
(V / "index.html").write_text(page)
print(f"{total} clips in {len(groups)} groups → playtest/voice/index.html")
