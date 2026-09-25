// Step 3: render every shot to a normalised segment (H.264, 30 fps, exact frame count) and concatenate.
// Segments are cached by a hash of the shot, the format, and the size+mtime of every file they read.
import { statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { TrailerConfig } from "../../trailer/trailer.config";
import { cardDir, type Format } from "./cards";
import type { Manifest } from "./generate";
import { BUILD, CACHE, duration, ensureDir, ffmpeg, FPS, fresh, hashOf, log, p, type Placed } from "./lib";

const LETTERBOX = 0.128; // (1 - (16/9)/2.39) / 2 of the frame height, top and bottom
const ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), "-video_track_timescale", "30000", "-an"];

export const srcPath = (src: string, man: Manifest) => (src.startsWith("gen:") ? man.videos[src.slice(4)] : p(src));
const stamp = (f: string) => { const s = statSync(f); return `${s.size}:${s.mtimeMs}`; };

/** zoompan does smooth push-ins/pull-outs and shake on a 2× upscaled frame. */
function motion(shot: Placed, w: number, h: number): string {
  const v = shot.video!;
  const [z0, z1] = v.zoom ?? [1, 1];
  const shake = shot.shake ? Math.round(shot.shake * FPS) : 0;
  const n = Math.max(1, shot.frames - 1);
  const margin = shake ? 1.035 : 1;
  const z = `(${z0}+(${z1 - z0})*on/${n})*${margin}`;
  const [fx, fy] = v.focus ?? [0.5, 0.5];
  const amp = 0.012; // of the frame
  const jx = shake ? `+if(lt(on,${shake}),iw*${amp}*sin(on*2.7)*(1-on/${shake}),0)` : "";
  const jy = shake ? `+if(lt(on,${shake}),ih*${amp}*cos(on*3.3)*(1-on/${shake}),0)` : "";
  const x = `max(0,min(iw-iw/zoom,(iw-iw/zoom)*${fx}${jx}))`;
  const y = `max(0,min(ih-ih/zoom,(ih-ih/zoom)*${fy}${jy}))`;
  return `scale=${w * 2}:${h * 2}:flags=lanczos,zoompan=z='${z}':x='${x}':y='${y}':d=1:s=${w}x${h}:fps=${FPS}`;
}

const GRADE: Record<string, string> = {
  dark: "eq=brightness=-0.06:contrast=1.08:saturation=0.9",
  cold: "colorbalance=bs=0.08:rs=-0.05",
  warm: "colorbalance=rs=0.06:bs=-0.05",
};

export function renderSegment(shot: Placed, fmt: Format, man: Manifest, vframe?: string): string {
  const { w, h } = fmt;
  const v = shot.video;
  const src = v ? srcPath(v.src, man) : null;
  const card = shot.card ? cardDir(shot, fmt) : null;
  const key = hashOf({ shot, fmt, src: src && stamp(src), card, vframe, v: 3 });
  const out = join(CACHE, "segments", `${String(shot.index).padStart(2, "0")}-${shot.id}-${fmt.name}-${key}.mp4`);
  if (fresh(out)) return out;
  log(`segment ${shot.id} (${fmt.name})`);

  const inputs: string[] = [];
  const chains: string[] = [];
  let last = "";

  if (v && src) {
    const speed = v.speed ?? 1;
    const need = shot.dur * speed + 0.5;
    const avail = duration(src) - (v.in ?? 0);
    inputs.push("-ss", String(v.in ?? 0), "-t", String(Math.min(need, avail)), "-i", src);
    const pad = avail < need ? `,tpad=stop_mode=clone:stop_duration=${(need - avail + 1).toFixed(2)}` : "";
    const grade = v.grade ? `,${GRADE[v.grade]}` : "";
    const base = `[0:v]setpts=(PTS-STARTPTS)/${speed},fps=${FPS}${pad}${grade},setsar=1`;
    if (fmt.name === "landscape") {
      chains.push(`${base},scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},${motion(shot, w, h)}[v0]`);
    } else {
      // vertical: foreground (4:5 crop, or the whole 16:9 frame for gameplay) over a blurred, darkened fill
      const aspect = v.vfit ? 16 / 9 : 4 / 5;
      const fh = Math.round(w / aspect / 2) * 2;
      const vf = v.vfocus ?? 0.5;
      const crop = v.vfit ? "" : `crop=ih*${aspect}:ih:(iw-ih*${aspect})*${vf}:0,`;
      chains.push(`${base},split[a][b]`);
      chains.push(`[a]${crop}scale=${w}:${fh},${motion(shot, w, fh)}[fg]`);
      chains.push(`[b]scale=-2:480,crop=270:480,gblur=sigma=18,eq=brightness=-0.18:saturation=1.2,scale=${w}:${h}[bg]`);
      chains.push(`[bg][fg]overlay=0:(H-h)/2[v0]`);
    }
    last = "v0";
  } else if (card) {
    inputs.push("-framerate", String(FPS), "-i", join(card, "%05d.png"));
    chains.push(`[0:v]format=yuv420p,scale=${w}:${h}[v0]`);
    last = "v0";
  } else {
    inputs.push("-f", "lavfi", "-i", `color=black:s=${w}x${h}:r=${FPS}:d=${shot.dur + 0.1}`);
    chains.push(`[0:v]null[v0]`);
    last = "v0";
  }

  let k = 1;
  if (v && card) {
    inputs.push("-framerate", String(FPS), "-i", join(card, "%05d.png"));
    chains.push(`[${last}][${k}:v]overlay=0:0:format=auto[v${k}]`);
    last = `v${k++}`;
  }
  if (v && vframe && fmt.name === "vertical") {
    inputs.push("-loop", "1", "-framerate", String(FPS), "-i", vframe);
    chains.push(`[${last}][${k}:v]overlay=0:0:shortest=1[v${k}]`);
    last = `v${k++}`;
  }
  const post: string[] = [];
  if (shot.letterbox && fmt.name === "landscape") {
    const bh = Math.round(h * LETTERBOX);
    post.push(`drawbox=x=0:y=0:w=iw:h=${bh}:color=black:t=fill`, `drawbox=x=0:y=ih-${bh}:w=iw:h=${bh}:color=black:t=fill`);
  }
  if (shot.fadeIn) post.push(`fade=t=in:st=0:d=${shot.fadeIn}`);
  if (shot.fadeOut) post.push(`fade=t=out:st=${(shot.dur - shot.fadeOut).toFixed(3)}:d=${shot.fadeOut}`);
  if (shot.flash === "in") post.push(`fade=t=in:st=0:d=0.18:color=white`);
  if (shot.flash === "out") post.push(`fade=t=out:st=${(shot.dur - 0.12).toFixed(3)}:d=0.12:color=white`);
  post.push("format=yuv420p");
  chains.push(`[${last}]${post.join(",")}[vout]`);

  ensureDir(join(CACHE, "segments"));
  ffmpeg([...inputs, "-filter_complex", chains.join(";"), "-map", "[vout]", "-frames:v", String(shot.frames), ...ENC, out]);
  return out;
}

export function assemble(cfg: TrailerConfig, shots: Placed[], fmt: Format, man: Manifest, vframe?: string): string {
  const segs = shots.map((s) => renderSegment(s, fmt, man, vframe));
  const list = join(BUILD, `concat-${fmt.name}.txt`);
  ensureDir(BUILD);
  writeFileSync(list, segs.map((s) => `file '${s}'`).join("\n"));
  const out = join(BUILD, `video-${fmt.name}.mp4`);
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", out]);
  return out;
}
