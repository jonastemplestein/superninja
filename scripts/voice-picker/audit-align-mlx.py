"""Word alignment on the Apple GPU (mlx-whisper large-v3-turbo) for the library scan, in reverse order, to meet the
CPU aligner in audit-measure.py halfway. Writes playtest/runs/voice-picker/audit/align-library-mlx.json.
Run: uv run --with mlx-whisper python scripts/voice-picker/audit-align-mlx.py"""
import json, re
from pathlib import Path
import mlx_whisper
ROOT = Path(__file__).resolve().parents[2]
AUD = ROOT / "playtest/runs/voice-picker/audit"
import importlib.util
spec = importlib.util.spec_from_file_location("m", ROOT / "scripts/voice-picker/audit-measure.py")
texts = json.loads((AUD / "library-texts.json").read_text())
src = (ROOT / "scripts/voice-picker/audit-measure.py").read_text()
# the same target-word selection as audit-measure.py library
ns = {}
exec(src.split("def main_library")[0].split("# ------------------------------------------------------------------ the shipped library")[1], ns)
targets = ns["LIB_RHOTIC"] | ns["LIB_BATH"] | ns["LIB_TRAP"] | ns["LIB_START"] | ns["LIB_T"]
sel = [t for t in texts if set(re.findall(r"[a-z']+", t["text"].lower().replace("’", "'"))) & targets]
out_p = AUD / "align-library-mlx.json"
out = json.loads(out_p.read_text()) if out_p.exists() else {}
for n, t in enumerate(reversed(sel)):
    cpu = json.loads((AUD / "align-library.json").read_text())
    if t["file"] in cpu or t["file"] in out:
        continue
    r = mlx_whisper.transcribe(str(ROOT / t["file"]), path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                               word_timestamps=True, language="en", initial_prompt=t["text"])
    out[t["file"]] = [{"w": w["word"].strip(), "s": w["start"], "e": w["end"]} for s in r["segments"] for w in s.get("words", [])]
    out_p.write_text(json.dumps(out, indent=1))
    if n % 25 == 0:
        print(n, len(out), flush=True)
print("done", len(out))
