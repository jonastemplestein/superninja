#!/usr/bin/env python3
"""Wake a Claude Code agent running in a herdr pane after its usage limit resets.

Every minute: if the agent isn't working and its newest transcript entry is a usage-limit error (the last few
screen lines are the fallback), read the reset time ("resets 5pm", "reset at 4:30pm (Europe/London)",
"resets Mon 9am", or an epoch after "|"), sleep until two minutes after it, then
submit a clearly labelled auto-wake prompt with `herdr agent prompt`. Each reset fires only once. If no time
can be parsed, it retries every 30 minutes. Also logs the quota the status line records (scripts/ops/statusline.sh).

Usage (Jonas asked for this on 2026-09-25): run it in its own herdr tab:
  python3 scripts/ops/wake-watchdog.py <pane-id>        e.g. w9V:p1 (default: $HERDR_PANE_ID)
"""
import datetime as dt
import glob
import json
import os
import re
import subprocess
import sys
import time

PANE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HERDR_PANE_ID")
STATE = os.path.expanduser("~/.local/state/superninja")
LOG = f"{STATE}/watchdog.log"
USAGE = f"{STATE}/statusline.json"
os.makedirs(STATE, exist_ok=True)

WAKE_PROMPT = (
    "⏰ Auto-wake from the herdr watchdog (scripts/ops/wake-watchdog.py, set up at Jonas's request): your usage limit "
    "has reset. Carry on autonomously where you left off. (1) Check every background agent and workflow; resume any "
    "that died from the limit (Workflow resumeFromRunId, SendMessage to agents, rerun killed commands). (2) Then "
    "continue the queued plan in docs/FEEDBACK.md (the ⏳ items), and the polish rounds after it. Keep an eye on the quota."
)

LIMIT = re.compile(r"usage limit|limit reached|hit your (?:\w+ )?limit|limit will reset|out of (?:extra )?usage|rate limit reached", re.I)
RESET = re.compile(r"resets?\s*(?:at\s*)?(?:on\s*)?(?:(mon|tue|wed|thu|fri|sat|sun)[a-z]*,?\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", re.I)
DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def log(msg: str) -> None:
    line = f"{dt.datetime.now():%Y-%m-%d %H:%M:%S} {msg}"
    print(line, flush=True)
    with open(LOG, "a") as f:
        f.write(line + "\n")


def herdr(*args: str) -> str:
    r = subprocess.run(["herdr", *args], capture_output=True, text=True, timeout=30)
    return r.stdout


def status() -> str:
    try:
        return json.loads(herdr("agent", "get", PANE))["result"]["agent"]["agent_status"]
    except Exception:
        return "unreachable"


def screen_tail(lines: int = 40) -> str:
    out = herdr("agent", "read", PANE, "--source", "recent-unwrapped", "--lines", "120")
    return "\n".join(out.splitlines()[-lines:])


def transcript_limit() -> tuple[bool, dt.datetime | None]:
    """Is the session's newest transcript entry a usage-limit error? Reliable, unlike the screen, which may
    quote limit text (e.g. while testing this script). Returns (limited, reset time if known)."""
    try:
        sid = json.loads(herdr("agent", "get", PANE))["result"]["agent"]["agent_session"]["value"]
        paths = glob.glob(os.path.expanduser(f"~/.claude/projects/*/{sid}.jsonl"))
        if not paths:
            return False, None
        with open(paths[0], "rb") as f:
            f.seek(max(0, os.path.getsize(paths[0]) - 400_000))
            lines = f.read().decode("utf-8", "ignore").splitlines()[1:]
        for line in reversed(lines):
            try:
                e = json.loads(line)
            except ValueError:
                continue
            if e.get("type") not in ("assistant", "user", "system"):
                continue
            c = (e.get("message") or {}).get("content")
            text = c if isinstance(c, str) else " ".join(b.get("text", "") for b in (c or []) if isinstance(b, dict))
            text += " " + str(e.get("content", "")) + " " + str(e.get("error", ""))
            if e.get("isApiErrorMessage") or (e.get("type") == "system" and LIMIT.search(text)):
                if not LIMIT.search(text):
                    return False, None
                epoch = re.search(r"\|(\d{10})\b", text)  # older format: "Claude AI usage limit reached|1759186800"
                return True, dt.datetime.fromtimestamp(int(epoch.group(1))) if epoch else reset_time(text)
            return False, None  # newest real entry is ordinary conversation: not limited
    except Exception as ex:
        log(f"transcript check failed: {ex}")
    return False, None


def reset_time(text: str) -> dt.datetime | None:
    m = None
    for m in RESET.finditer(text):
        pass  # the last match on screen is the current one
    if not m:
        return None
    day, hh, mm, ampm = m.group(1), int(m.group(2)), int(m.group(3) or 0), (m.group(4) or "").lower()
    if ampm == "pm" and hh < 12:
        hh += 12
    if ampm == "am" and hh == 12:
        hh = 0
    if hh > 23 or mm > 59:
        return None
    now = dt.datetime.now()
    t = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
    if day:
        t += dt.timedelta(days=(DAYS.index(day.lower()[:3]) - now.weekday()) % 7)
        if t <= now:
            t += dt.timedelta(days=7)
    elif t <= now:
        t += dt.timedelta(days=1)
    return t


def quota() -> str:
    try:
        j = json.load(open(USAGE))
        rl = j.get("rate_limits") or {}
        parts = []
        for k, v in rl.items():
            if isinstance(v, dict):
                pct = v.get("used_percentage", v.get("utilization"))
                parts.append(f"{k} {pct}% (resets {v.get('resets_at', '?')})")
        return "; ".join(parts) or "no rate_limits in status line data"
    except Exception:
        return "no status line data yet"


def quota_reset() -> dt.datetime | None:
    """Reset time of whichever quota window is (nearly) used up, from the status line's rate_limits."""
    try:
        rl = json.load(open(USAGE)).get("rate_limits") or {}
        full = [v for v in rl.values() if isinstance(v, dict) and (v.get("used_percentage") or 0) >= 98 and isinstance(v.get("resets_at"), (int, float))]
        return dt.datetime.fromtimestamp(max(v["resets_at"] for v in full)) if full else None
    except Exception:
        return None


def main() -> None:
    if not PANE:
        sys.exit("usage: wake-watchdog.py <herdr-pane-id>")
    log(f"watching {PANE}; quota: {quota()}")
    handled: set[str] = set()
    last_quota_log = 0.0
    while True:
        try:
            st = status()
            if time.time() - last_quota_log > 1800:
                log(f"status {st}; quota: {quota()}")
                last_quota_log = time.time()
            if st in ("idle", "blocked", "done", "unknown"):
                limited, t = transcript_limit()
                if not limited:  # fallback: only the last few screen lines, where Claude Code shows the limit notice
                    tail = screen_tail(12)
                    limited = bool(LIMIT.search(tail)) and st == "blocked"
                    t = reset_time(tail) if limited else None
                if limited:
                    exact = quota_reset()
                    if exact:  # the status line's resets_at is exact; prefer it to text parsed off the screen
                        t = exact
                    key = t.isoformat() if t else f"retry-{int(time.time() // 1800)}"
                    if key not in handled:
                        handled.add(key)
                        wake = (t + dt.timedelta(minutes=2)) if t else dt.datetime.now() + dt.timedelta(minutes=30)
                        log(f"usage limit on screen; reset {t or 'unparsed'}; waking at {wake:%a %H:%M}")
                        while dt.datetime.now() < wake:
                            time.sleep(30)
                        if status() == "working":
                            log("agent already working again; no prompt needed")
                        else:
                            herdr("agent", "prompt", PANE, WAKE_PROMPT)
                            log("sent auto-wake prompt")
                            time.sleep(300)  # give it time to start before checking again
        except Exception as e:  # never die: herdr restarts, sleep/wake of the Mac, etc.
            log(f"error: {e}")
        time.sleep(60)


if __name__ == "__main__":
    main()
