p="/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/assets-src/intro-v3/lipsync/lipsync.ts"
s=open(p).read()
old=s[s.index("async function cfRun("):s.index("if (engine === \"omni\") {")]
new='''// Cloudflare AI Gateway /ai/run is synchronous and video models can take several minutes, longer than fetch's
// idle timeout, so the call goes through curl with a 30-minute limit.
async function cfRun(model: string, input: unknown) {
  const tmp = `${out}.request.json`;
  writeFileSync(tmp, JSON.stringify({ model, input }));
  const raw = execFileSync("curl", ["-s", "--max-time", "1800", "-X", "POST", `https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run`,
    "-H", `Authorization: Bearer ${cfToken()}`, "-H", "Content-Type: application/json", "--data-binary", `@${tmp}`], { maxBuffer: 1 << 26 }).toString();
  renameSync(tmp, `${out}.request.done.json`.replace(/\\/([^/]+)$/, "/.$1"));
  const json: any = JSON.parse(raw);
  if (!json.success) throw new Error(`${JSON.stringify(json.errors ?? json).slice(0, 800)}`);
  return json.result?.result ?? json.result;
}

'''
s=s.replace(old,new)
s=s.replace('import { readFileSync, writeFileSync, mkdirSync } from "node:fs";','import { readFileSync, writeFileSync, mkdirSync, renameSync } from "node:fs";\nimport { execFileSync } from "node:child_process";')
s=s.replace('''} else throw new Error("engine: omni | seedance | avatar");''','''} else if (engine === "pvideo") {
  const r = await cfRun("pruna/p-video", {
    prompt,
    image: flags.imgurl ?? dataUri(frame),
    audio: flags.audurl ?? dataUri(audio),
    ...(flags.last ? { last_frame_image: dataUri(flags.last) } : {}),
    resolution: flags.res ?? "1080p",
    fps: 24,
    save_audio: true,
    prompt_upsampling: false,
    disable_safety_filter: true,
  });
  await download(r.video);
} else throw new Error("engine: omni | omnicf | seedance | avatar | pvideo");''')
s=s.replace("//   avatar   Pruna p-video-avatar via Cloudflare AI Gateway (audio-driven talking video)","//   avatar   Pruna p-video-avatar via Cloudflare AI Gateway (audio-driven talking video; rejects data URIs)\n//   pvideo   Pruna p-video via Cloudflare AI Gateway (image-to-video conditioned on an audio clip)")
open(p,"w").write(s)
