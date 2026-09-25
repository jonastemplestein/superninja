# Word timings for the film narration (mlx-whisper large-v3-turbo). Writes assets-src/world-flower/film_words.json.
# Run: uv run --with mlx-whisper python assets-src/world-flower/words.py
import json, mlx_whisper
out = {}
for n in range(1, 9):
    f = f"public/a/l/film_{n}.mp3"
    r = mlx_whisper.transcribe(f, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", word_timestamps=True, language="en")
    ws = [(w["word"].strip(), round(w["start"], 2), round(w["end"], 2)) for s in r["segments"] for w in s["words"]]
    out[f"film_{n}"] = ws
    print(f"film_{n}:", " ".join(f"{w}@{s}" for w, s, e in ws))
json.dump(out, open("assets-src/world-flower/film_words.json", "w"), indent=1)
