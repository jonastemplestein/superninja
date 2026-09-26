p="/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/intro-v3/lipsync/lipsync.ts"
s=open(p).read()
s=s.replace('''} else if (engine === "seedance") {''','''} else if (engine === "omnicf") {
  const r = await cfRun("google/gemini-omni-1.1-flash", {
    text: prompt,
    image: dataUri(frame),
    ...(flags.last ? { last_frame: dataUri(flags.last) } : {}),
    audio: dataUri(audio),
    aspect_ratio: "16:9",
    resolution: flags.res ?? "1080p",
  });
  await download(r.video);
} else if (engine === "seedance") {''',1)
open(p,"w").write(s)
