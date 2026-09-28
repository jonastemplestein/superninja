import sys, re, json
from faster_whisper import WhisperModel
model = WhisperModel("medium.en", device="cpu", compute_type="int8")
LETTER = re.compile(r"^(b|bee|be|kay|k|c|cee|see|sea|dee|d|tee|t|pee|p|gee|g|jay|j|ef|eff|f|el|l|em|m|en|n|ess|s|ar|r|double[- ]?u|w|why|y|zed|zee|z|aitch|h|ex|x|queue|cue|q|vee|v)$", re.I)
for path in sys.argv[1:]:
    segs, info = model.transcribe(path, language="en", beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    print(f"===== {path}")
    words = []
    for s in segs:
        print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        for w in s.words or []:
            words.append((w.start, w.end, w.word.strip(), w.probability))
    flags = [w for w in words if LETTER.match(re.sub(r"[^A-Za-z-]", "", w[2]) or "_")]
    print("  letter-like tokens:", [(round(a,2), t, round(p,2)) for a,b,t,p in flags])
