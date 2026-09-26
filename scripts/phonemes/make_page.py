#!/usr/bin/env python3
"""Build a self-contained local A/B listening page for every phoneme."""
import html
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / "playtest/phonemes"
CURRENT = ROOT / "public/a/p"
ARCHIVE = ROOT / ".trash/phonemes-2026-09-26"
before = json.loads((DIR/"qa-before.json").read_text())["clips"]
after = json.loads((DIR/"qa.json").read_text())["clips"]
recipes = json.loads((DIR/"recipes.json").read_text())
for side in ("before", "after"):
    (DIR/side).mkdir(exist_ok=True)
for id in after:
    shutil.copy2(ARCHIVE/f"{id}.mp3" if (ARCHIVE/f"{id}.mp3").exists() else CURRENT/f"{id}.mp3",
                 DIR/"before"/f"{id}.mp3")
    shutil.copy2(CURRENT/f"{id}.mp3", DIR/"after"/f"{id}.mp3")

rows=[]
for id, entry in after.items():
    b=before[id]["after"]
    a=entry["after"]
    why="; ".join(b["reasons"]) or "Within acoustic limits"
    recipe=recipes.get(id)
    method=(f"{recipe['method']} from {recipe['carrier']} "
            f"({recipe['start_s']:.3f}–{recipe['end_s']:.3f} s)" if recipe else "Kept original")
    search=html.escape(f"{id} {why} {method}")
    rows.append(f'''<tr data-search="{search.lower()}">
      <th scope="row">/{html.escape(id)}/</th>
      <td><span class="badge {b['verdict'].lower()}">{b['verdict']}</span>
        <small>{html.escape(why)}</small><audio controls preload="none" src="before/{id}.mp3"></audio></td>
      <td><span class="badge pass">{a['verdict']}</span>
        <small>{a['metrics']['active_ms']} ms active; {a['metrics']['voiced_ms']} ms voiced</small>
        <audio controls preload="none" src="after/{id}.mp3"></audio></td>
      <td>{html.escape(method)}</td>
    </tr>''')

page='''<!doctype html><html lang="en-GB"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Super Ninja phoneme A/B</title>
<style>
:root{font:16px system-ui,sans-serif;color:#17243b;background:#f5f8fc}*{box-sizing:border-box}
body{margin:0}header{padding:2rem max(1rem,calc((100vw - 1100px)/2));background:#132c50;color:white}
h1{font-size:1.8rem;margin:.2rem 0}.lead{max-width:65ch;line-height:1.5;color:#d9e5f5}
main{max-width:1160px;margin:auto;padding:1.25rem}.controls{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
input{font:inherit;padding:.7rem;border:1px solid #9aacc5;border-radius:.55rem;min-width:18rem}
table{border-collapse:collapse;width:100%;background:white;border-radius:.8rem;overflow:hidden;box-shadow:0 3px 20px #142b4a12}
th,td{text-align:left;vertical-align:top;padding:.8rem;border-bottom:1px solid #e4eaf3}thead{background:#e7effb}
tbody th{font-size:1.25rem;white-space:nowrap}td{min-width:200px}td:last-child{min-width:160px}
audio{display:block;width:min(100%,260px);height:42px;margin-top:.45rem}small{display:block;line-height:1.35;margin-top:.35rem}
.badge{display:inline-block;border-radius:1rem;padding:.15rem .55rem;font-size:.72rem;font-weight:750;letter-spacing:.06em}
.pass{background:#d9f2df;color:#145b2b}.fail{background:#ffe2df;color:#8a281e}
footer{padding:1.5rem;color:#52627b;line-height:1.5}@media(max-width:700px){table{display:block;overflow-x:auto}th,td{min-width:170px}}
</style>
<header><h1>Pure sounds · before and after</h1><p class="lead">All 46 clips. The original is on the left and the current clip is on the right. Acoustic verdicts come from Praat; Whisper letter-name flags are included in the reasons. Short sounds are hard for speech recognition, so please use your ears.</p></header>
<main><div class="controls"><label>Find a sound or reason <input id="filter" type="search" placeholder="e.g. k, voiced, vowel"></label><span id="count"></span></div>
<table><thead><tr><th>Sound</th><th>Before</th><th>After</th><th>Source and cut</th></tr></thead><tbody>
'''+"\n".join(rows)+'''</tbody></table><footer>Files here are local copies for easy playback. Replaced originals remain in <code>.trash/phonemes-2026-09-26/</code>. See <a href="qa.json">qa.json</a> for frame and formant measurements.</footer></main>
<script>const q=document.querySelector('#filter'),rows=[...document.querySelectorAll('tbody tr')],count=document.querySelector('#count');
function show(){let n=0;for(const row of rows){const ok=row.dataset.search.includes(q.value.toLowerCase().trim());row.hidden=!ok;if(ok)n++}count.textContent=`${n} of ${rows.length} sounds`}
q.addEventListener('input',show);show();document.addEventListener('play',e=>{for(const a of document.querySelectorAll('audio'))if(a!==e.target)a.pause()},true);
</script></html>'''
(DIR/"index.html").write_text(page)
print(f"Wrote {DIR/'index.html'} with {len(rows)} A/B rows")
