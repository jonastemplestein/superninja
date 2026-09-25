# Cut the initial unvoiced fricative from a word clip: stop where low-frequency (voiced) energy starts.
import sys, numpy as np, subprocess, io, wave
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg","-loglevel","error","-i",src,"-ac","1","-ar","24000","-f","s16le","-"],capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768
sr=24000; hop=240; win=480
# low band energy via simple moving-average low-pass
k=np.ones(12)/12; low=np.convolve(x,k,mode="same")
tot=np.array([np.sqrt(np.mean(x[i:i+win]**2)) for i in range(0,len(x)-win,hop)])
lo=np.array([np.sqrt(np.mean(low[i:i+win]**2)) for i in range(0,len(x)-win,hop)])
start=np.argmax(tot>0.01)
ratio=lo/(tot+1e-6)
v=start
while v<len(ratio) and not (ratio[v]>0.55 and tot[v]>0.03): v+=1
seg=x[start*hop:max(start*hop+hop, v*hop-hop)]
n=len(seg); fade=min(n//3, int(0.03*sr))
seg[-fade:]*=np.linspace(1,0,fade)
seg[:int(0.005*sr)]*=np.linspace(0,1,int(0.005*sr))
pcm=(np.clip(seg,-1,1)*32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar","24000","-ac","1","-i","-","-af","atempo=0.6,loudnorm=I=-18,apad=pad_dur=0.05","-ar","44100","-codec:a","libmp3lame","-q:a","4",out],input=pcm)
print(out, round(n/sr,3), "s before stretch")
