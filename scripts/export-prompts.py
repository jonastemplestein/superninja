# Export every prompt Jonas gave Claude Code while building Super Ninja, verbatim, to PROMPTS.md.
# Reads the Claude Code session transcript(s): direct messages ("user" entries) and messages sent mid-turn
# ("queued_command" attachments). Skips tool/task notifications, messages from Claude's own sub-agents,
# slash commands and harness markers. Redacts internal account ids.
# Usage: python3 scripts/export-prompts.py [transcript.jsonl ...]   (defaults to this project's transcripts)
import glob, json, os, re, sys
from datetime import datetime, timedelta

DEFAULT = os.path.expanduser("~/.claude/projects/-Users-jonastemplestein-src-github-com-jonastemplestein-superninja/*.jsonl")
files = sys.argv[1:] or sorted(glob.glob(DEFAULT))

SKIP_PREFIXES = (
    "<task-notification>", "<agent-message", "<command-name>", "<local-command-stdout>", "<local-command-stderr>",
    "[Request interrupted", "This session is being continued", "Caveat:",
)
# notices relayed from Jonas's other sessions about other projects
OTHER_PROJECT = re.compile(r"^(Heads-up from|From) the [\w-]+ session \(")
REDACT = [(re.compile(r"(dashboard\.doppler\.com/workplace/)[0-9a-f]{12,}"), r"\1<workplace-id>")]
IMAGE_NOTES = {  # what the attached images were (the images themselves are not published)
    "Image #8": "photo of the school's laminated Sounds~Write petal chart",
    "Image #9": "screenshot: the two ninjas overlapping on the title screen",
    "Image #10": "screenshot of the landing page",
    "Image #13": "screenshot: Baron Muddle shown twice on the intro page",
}

def text_of(content):
    if isinstance(content, str):
        return content, 0
    texts, imgs = [], 0
    for b in content or []:
        if not isinstance(b, dict):
            continue
        if b.get("type") == "tool_result":
            return None, 0
        if b.get("type") == "text":
            texts.append(b.get("text", ""))
        if b.get("type") == "image":
            imgs += 1
    return "\n".join(texts), imgs

prompts, skipped = [], {"other-project": 0}
for f in files:
    for line in open(f):
        try:
            e = json.loads(line)
        except ValueError:
            continue
        t = e.get("type")
        if t == "user" and not e.get("isMeta") and not e.get("isCompactSummary"):
            text, imgs = text_of(e.get("message", {}).get("content"))
        elif t == "attachment" and e.get("attachment", {}).get("type") == "queued_command":
            text, imgs = text_of(e["attachment"].get("prompt"))
        else:
            continue
        if text is None or (not text.strip() and not imgs):
            continue
        s = text.strip()
        if s.startswith(SKIP_PREFIXES):
            continue
        if OTHER_PROJECT.match(s):
            skipped["other-project"] += 1
            continue
        # the harness wraps pasted text in <pasted_content> tags: keep the text, drop the tags
        s = re.sub(r"</?pasted_content[^>]*>", "", s).strip()
        s = re.sub(r"\n{3,}", "\n\n", s)
        for rx, rep in REDACT:
            s = rx.sub(rep, s)
        prompts.append({"ts": e.get("timestamp", ""), "text": s, "images": imgs, "mid_turn": t == "attachment"})

# de-duplicate (a queued message can also appear as a later user turn) and sort by time
seen, out = set(), []
for p in sorted(prompts, key=lambda p: p["ts"]):
    k = p["text"][:500]
    if k in seen:
        continue
    seen.add(k)
    out.append(p)

def uk(ts):  # transcript times are UTC; show UK time (BST in late September)
    d = datetime.fromisoformat(ts.replace("Z", "+00:00")) + timedelta(hours=1)
    return d.strftime("%a %-d %b %Y, %H:%M")

md = ["# Prompts", "",
      "Every prompt Jonas gave Claude (Claude Code) while making Super Ninja, **verbatim**, in order. Most were dictated by voice, so they contain dictation slips; they are left exactly as sent.",
      "",
      f"- {len(out)} prompts; times are UK time. \"(mid-turn)\" marks messages sent while Claude was already working.",
      "- Omitted: slash commands, tool and sub-agent notifications, and "
      + f"{skipped['other-project']} notices relayed from another project's session. Pasted text is shown without the harness's `<pasted_content>` wrapper. An internal Doppler workplace id is redacted. Attached images are described, not included.",
      "- Regenerate with `python3 scripts/export-prompts.py`.", ""]
for i, p in enumerate(out, 1):
    head = f"## {i}. {uk(p['ts'])}{' (mid-turn)' if p['mid_turn'] else ''}"
    body = p["text"]
    for tag, desc in IMAGE_NOTES.items():
        body = body.replace(f"[{tag}]", f"[{tag}: {desc}] ")
    if p["images"] and "[Image #" not in body:
        body = f"[{p['images']} image(s) attached] " + body
    quoted = "\n".join("> " + l if l.strip() else ">" for l in body.split("\n"))
    if len(body) > 8000:  # the long pasted research brief: keep it collapsible
        first = body.split("\n", 1)[0]
        md += [head, "", f"<details><summary>{first[:140]} ({len(body):,} characters, click to expand)</summary>", "", quoted, "", "</details>", ""]
    else:
        md += [head, "", quoted, ""]
open(os.path.join(os.path.dirname(__file__), "..", "PROMPTS.md"), "w").write("\n".join(md))
print(f"{len(out)} prompts → PROMPTS.md (skipped {skipped['other-project']} other-project notices)")
