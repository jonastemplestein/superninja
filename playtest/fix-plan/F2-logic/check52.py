# §5.2 transcript checks for the F2 logic lane (FIX_PLAN_PERF_SCRIPT_SOUNDS.md §5.2)
import json, sys, glob, os
root = sys.argv[1]
out = []
def load(pat):
    fs = glob.glob(os.path.join(root, pat))
    return json.load(open(fs[0])) if fs else None
def scene_at(evs, i):
    for j in range(i, -1, -1):
        if evs[j]['kind'] == 'scene': return evs[j]['text']
    return '?'
LISTEN = {'tv_listen_here', 'listen_here', 'audit_listen_slowly', 'audit_listen_next', 'listen', 'listen_again'}
# 1. splitter
d = load('splitter-w5-1/continuous-splitter*.json')
if d:
    evs = d['evs']
    splits = [i for i, e in enumerate(evs) if e['kind'] == 'split']
    out.append(f"## splitter --from w5-1 --levels 6: {len(splits)} deliberate splits")
    seen = set()
    for i in splits:
        sc = scene_at(evs, i)
        seq = []
        for e in evs[i+1:]:
            if e['kind'] in ('word', 'turn', 'split', 'scene'): break
            if e['kind'] in ('say', 'sound'): seq.append((e.get('id') or e['text']) + (' (cut)' if e.get('cut') else ''))
            if len(seq) >= 8: break
        ids = [x.replace('sound:', '/').replace(' (cut)', '') + ('/' if x.startswith('sound:') else '') for x in seq]
        before_thats = ids[:ids.index('thats')] if 'thats' in ids else ids
        ok = 'thats' in ids and 'we_need' in ids and 't_two_letters' in ids and not (set(before_thats) & LISTEN)
        tag = f"{sc}"
        first = tag not in seen
        seen.add(tag)
        out.append(f"- {'FIRST ' if first else ''}{sc} at {evs[i]['t']} s: tapped < {evs[i].get('tapped', evs[i]['text'])} >: {' · '.join(ids)} → {'PASS' if ok else 'FAIL'}")
# 2. perfect from w6-br1
d = load('perfect-w6-br1/continuous-perfect*.json')
if d:
    evs = d['evs']
    taught = set()
    rem = []
    for i, e in enumerate(evs):
        sc = scene_at(evs, i)
        if e['kind'] == 'sound' and sc == 'learn': taught.add(e['id'])
        if e['kind'] == 'say' and e.get('id') in ('t_two_letters', 't_three_letters', 't_four_letters') and sc not in ('learn', 'sort', 'tree', 'flower', 'intro'):
            nxt = next((x for x in evs[i+1:i+6] if x['kind'] == 'sound'), None)
            rem.append((e['t'], sc, e['id'], nxt and nxt['id'], nxt and nxt['id'] in taught))
    jumps = [e for e in evs if e['kind'] == 'say' and e.get('id') in ('jump_offer', 'tv_jump_offer')]
    trips = [e for i, e in enumerate(evs) if e['kind'] == 'say' and e.get('id') in ('t_two_letters', 't_three_letters', 't_four_letters') and scene_at(evs, i) in ('tree', 'flower', 'intro')]
    out.append(f"## perfect --from w6-br1 --levels 13: {d.get('stones')} stones")
    out.append(f"- (World Flower trips: {len(trips)} letters lines; they go once B3's GemFound passes justTaught to foundScript, SF C3.5)")
    out.append(f"- read-back reminders (letters lines outside a Learn or a sort): {len(rem)} (target ≤ 2) → {'PASS' if len(rem) <= 2 else 'FAIL'}")
    for r in rem: out.append(f"  - {r[0]} s, {r[1]}: {r[2]} then {r[3]}; taught earlier this session: {r[4]}")
    out.append(f"- none for a spelling taught this session → {'PASS' if not any(r[4] for r in rem) else 'FAIL'}")
    out.append(f"- jump offers: {len(jumps)} at {[e['t'] for e in jumps]} s (this child is in session 9 with no earlier offer: Dec9 allows one; plan §5.2 asks for 0)")
    allLetters = [e for e in evs if e['kind'] == 'say' and e.get('id') in ('t_two_letters', 't_three_letters', 't_four_letters', 'st_two_letters_too')]
    out.append(f"- all letters lines in the run: {len(allLetters)} (plan §11.2 target ≤ 12 once D1/D4 land)")
# 3. day one
d = load('perfect-day1/continuous-perfect*.json')
if d:
    evs = d['evs']
    jumps = [e for e in evs if e['kind'] == 'say' and e.get('id') in ('jump_offer', 'tv_jump_offer')]
    out.append(f"## perfect --levels 12 (day one): {d.get('stones')} stones")
    out.append(f"- jump offers: {len(jumps)} (target 0) → {'PASS' if not jumps else 'FAIL'}")
print("\n".join(out))
