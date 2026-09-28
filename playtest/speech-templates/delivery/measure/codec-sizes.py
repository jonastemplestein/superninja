# Sizes of 150 lines + 150 words re-encoded per candidate format (delivery.md §3). Run from the repo root.
import subprocess, os, glob, random, tempfile, statistics as st, json
random.seed(7)
R="/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/public/a"
sets = {"l": random.sample(glob.glob(R+"/l/*.mp3"), 150), "w": random.sample(glob.glob(R+"/w/*.mp3"), 150)}
fmts = {
 "mp3_24k_40cbr": (["-c:a","libmp3lame","-ar","24000","-b:a","40k"], ".mp3"),
 "mp3_24k_q6": (["-c:a","libmp3lame","-ar","24000","-q:a","6"], ".mp3"),
 "aac_lc_24k_32k.m4a": (["-c:a","aac_at","-ar","24000","-b:a","32k"], ".m4a"),
 "opus_24k.webm": (["-c:a","libopus","-b:a","24k"], ".webm"),
 "opus_32k.webm": (["-c:a","libopus","-b:a","32k"], ".webm"),
 "opus_24k.ogg": (["-c:a","libopus","-b:a","24k"], ".ogg"),
 "opus_24k.mp4": (["-c:a","libopus","-b:a","24k"], ".mp4"),
}
td = tempfile.mkdtemp(dir=os.environ.get("S", "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/speech-templates/delivery"))
res = {}
for k, files in sets.items():
    for f in files:
        wav = os.path.join(td, "src.wav")
        subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-ar","24000","-ac","1",wav],check=True)
        res.setdefault(k, {}).setdefault("current_mp3", []).append(os.path.getsize(f))
        for name,(args,ext) in fmts.items():
            o = os.path.join(td, "o"+ext)
            subprocess.run(["ffmpeg","-v","error","-y","-i",wav]+args+[o],check=True)
            res[k].setdefault(name, []).append(os.path.getsize(o))
        o = os.path.join(td, "o.caf")
        subprocess.run(["afconvert","-f","caff","-d","opus","-b","24000",wav,o],check=True)
        res[k].setdefault("opus_24k.caf(afconvert)", []).append(os.path.getsize(o))
for k,v in res.items():
    base = st.mean(v["current_mp3"])
    print(f"== {k} (n={len(v['current_mp3'])})")
    for name, sizes in v.items():
        print(f"  {name:28s} mean {st.mean(sizes)/1024:6.1f} KB  ({st.mean(sizes)/base*100:5.1f}% of current)")
