# Website film: the 8 intro shots (the World Flower story) with narration + the video model's own sound effects + title music.
# Timing comes from public/a/v/intro_timing.json (written by scripts/intro-v2-encode.sh):
# each shot is held for minMs (last frame frozen if the line runs longer than the clip) and its line starts lineDelayMs in.
# The model's SFX/music bed and the title music are ducked under the narration so the words stay clear.
import subprocess, json
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]).decode())
timing = {t["shot"]: t for t in json.load(open("public/a/v/intro_timing.json"))}
END_HOLD = 1.0  # extra hold on the final frame before the fade
# extra foley where the model's own audio misses a visible hit: (shot, seconds into shot, file, volume)
EXTRA_SFX = []
parts=[]; t=0.0
N=len(timing)
for n in range(1,N+1):
    v=f"public/a/v/intro_{n}.mp4"; snd=f"public/media/intro_{n}_sound.mp4"; line=f"public/a/l/film_{n}.mp3"
    D=timing[n]["minMs"]/1000 + (END_HOLD if n==N else 0)
    parts.append((v,snd,line,D,t,timing[n]["lineDelayMs"]/1000)); t+=D
cmd=["ffmpeg","-loglevel","error","-y"]
for v,snd,line,D,st,dl in parts: cmd+=["-i",v,"-i",snd,"-i",line]
cmd+=["-stream_loop","-1","-i","public/a/m/title.mp3"]
for sh,off,f,vol in EXTRA_SFX: cmd+=["-i",f]
fc=[]
for i,(v,snd,line,D,st,dl) in enumerate(parts):
    b=i*3; ms=int(st*1000); nms=int((st+dl)*1000)
    fc.append(f"[{b}:v]tpad=stop_mode=clone:stop_duration=10,trim=0:{D:.3f},setpts=PTS-STARTPTS,fps=30,scale=1280:720,setsar=1[v{i}]")
    fc.append(f"[{b+1}:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.55,apad,atrim=0:{D:.3f},adelay={ms}|{ms}[s{i}]")
    fc.append(f"[{b+2}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={nms}|{nms},volume=1.25[n{i}]")
m=len(parts)*3
fc.append(f"[{m}:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.16,atrim=0:{t:.3f}[mus]")
fc.append("".join(f"[v{i}]" for i in range(len(parts)))+f"concat=n={len(parts)}:v=1:a=0,fade=t=in:d=0.5,fade=t=out:st={t-0.7:.3f}:d=0.7[vout]")
fx=[]
for k,(sh,off,f,vol) in enumerate(EXTRA_SFX):
    at=int((parts[sh-1][4]+off)*1000)
    fc.append(f"[{m+1+k}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={at}|{at}[fx{k}]"); fx.append(f"[fx{k}]")
fc.append("".join(f"[s{i}]" for i in range(len(parts)))+"".join(fx)+f"[mus]amix=inputs={len(parts)+1+len(fx)}:normalize=0:duration=longest,atrim=0:{t:.3f}[bed]")
fc.append("".join(f"[n{i}]" for i in range(len(parts)))+f"amix=inputs={len(parts)}:normalize=0:duration=longest,apad,atrim=0:{t:.3f},asplit=2[nar][key]")
fc.append("[bed][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[duck]")
fc.append(f"[duck][nar]amix=inputs=2:normalize=0:duration=longest,atrim=0:{t:.3f},alimiter=limit=0.9,loudnorm=I=-17:TP=-1.5,afade=t=in:d=0.3,afade=t=out:st={t-0.7:.3f}:d=0.7[aout]")
cmd+=["-filter_complex",";".join(fc),"-map","[vout]","-map","[aout]","-c:v","libx264","-crf","26","-preset","slow","-pix_fmt","yuv420p","-c:a","aac","-b:a","112k","-ar","44100","-movflags","+faststart","public/media/intro_film.mp4"]
subprocess.run(cmd,check=True); print("film", round(t,1),"s")
