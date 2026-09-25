// Step 4: the sound mix. Four buses: score (with per-shot gain automation, ducked under voices),
// source audio from the shots, sound effects, and voices. Then a limiter and two-pass loudnorm to -14 LUFS.
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import type { TrailerConfig } from "../../trailer/trailer.config";
import { srcPath } from "./assemble";
import type { Manifest } from "./generate";
import { AR, BUILD, duration, ffmpeg, hasAudio, log, type Placed } from "./lib";

interface Ev { file: string; at: number; gain: number; bus: "vo" | "sfx" | "src"; in?: number; dur?: number; speed?: number }

/** Piecewise-linear gain envelope as an ffmpeg expression of t. */
function envelope(points: [number, number][]): string {
  let e = String(points[points.length - 1][1]);
  for (let i = points.length - 2; i >= 0; i--) {
    const [t0, g0] = points[i], [t1, g1] = points[i + 1];
    const seg = t1 - t0 < 1e-3 ? String(g1) : `${g0}+(${g1 - g0})*(t-${t0.toFixed(3)})/${(t1 - t0).toFixed(3)}`;
    e = `if(lt(t,${t1.toFixed(3)}),${seg},${e})`;
  }
  return e;
}

export function mix(cfg: TrailerConfig, shots: Placed[], man: Manifest): string {
  const total = shots[shots.length - 1].end;
  const evs: Ev[] = [];
  for (const s of shots) {
    for (const v of s.vo ?? []) evs.push({ file: man.voices[v.line], at: s.start + (v.at ?? 0), gain: v.gain ?? 1, bus: "vo" });
    for (const x of s.sfx ?? []) evs.push({ file: man.sfx[x.name], at: s.start + (x.at ?? 0), gain: x.gain ?? 1, bus: "sfx" });
    const v = s.video;
    if (v?.audio) {
      const f = srcPath(v.src, man);
      if (hasAudio(f)) evs.push({ file: f, at: s.start, gain: v.audio, bus: "src", in: v.in ?? 0, dur: s.dur, speed: v.speed });
    }
  }
  for (const e of evs) if (!e.file) throw new Error("mix: missing audio file for an event (check voice/sfx names in trailer.config.ts)");

  // score gain automation: each shot's `music` value, with 60 ms ramps (hard cuts to silence stay tight)
  const pts: [number, number][] = [[0, shots[0].music ?? 1]];
  for (const s of shots.slice(1)) {
    const g = s.music ?? 1, prev = pts[pts.length - 1][1];
    if (g !== prev) pts.push([s.start - (g < prev ? 0.03 : 0.06), prev], [s.start + (g < prev ? 0.01 : 0.02), g]);
  }
  pts.push([total + 1, pts[pts.length - 1][1]]);

  const inputs: string[] = ["-i", man.music];
  const chains: string[] = [
    `[0:a]aresample=${AR},aformat=channel_layouts=stereo,volume=${cfg.music.gain},volume='${envelope(pts)}':eval=frame,apad,atrim=0:${total.toFixed(3)}[music]`,
  ];
  const buses: Record<string, string[]> = { vo: [], sfx: [], src: [] };
  evs.forEach((e, i) => {
    const idx = i + 1;
    const start = Math.max(0, e.at);
    const skip = e.at < 0 ? -e.at : 0; // events that start before t=0 are clipped
    inputs.push(...(e.in != null ? ["-ss", String(e.in)] : []), "-i", e.file);
    const trim = e.dur != null ? `atrim=0:${(e.dur * (e.speed ?? 1)).toFixed(3)},${e.speed && e.speed !== 1 ? `atempo=${e.speed},` : ""}afade=t=in:d=0.02,afade=t=out:st=${(e.dur - 0.05).toFixed(3)}:d=0.05,` : "";
    const ms = Math.round(start * 1000);
    chains.push(`[${idx}:a]aresample=${AR},aformat=channel_layouts=stereo,${skip ? `atrim=start=${skip},asetpts=PTS-STARTPTS,` : ""}${trim}volume=${e.gain},adelay=${ms}|${ms}[e${idx}]`);
    buses[e.bus].push(`[e${idx}]`);
  });
  for (const [bus, ins] of Object.entries(buses)) {
    if (ins.length) chains.push(`${ins.join("")}amix=inputs=${ins.length}:normalize=0:duration=longest,apad,atrim=0:${total.toFixed(3)}[${bus}]`);
    else chains.push(`anullsrc=r=${AR}:cl=stereo,atrim=0:${total.toFixed(3)}[${bus}]`);
  }
  // duck the score (and source audio) under the voices
  const ratio = Math.max(2, Math.min(20, cfg.music.duckDb));
  chains.push(`[vo]asplit=3[vo1][vosc1][vosc2]`);
  chains.push(`[music][vosc1]sidechaincompress=threshold=0.015:ratio=${ratio}:attack=12:release=380:makeup=1[mduck]`);
  chains.push(`[src][vosc2]sidechaincompress=threshold=0.015:ratio=${ratio}:attack=12:release=300[sduck]`);
  chains.push(`[mduck][sduck][sfx][vo1]amix=inputs=4:normalize=0:weights='1 1 1 1.15',alimiter=limit=0.89:attack=3:release=60[mix]`);

  const pre = join(BUILD, "mix-pre.wav");
  log(`mixing ${evs.length} audio events`);
  ffmpeg([...inputs, "-filter_complex", chains.join(";"), "-map", "[mix]", "-ar", String(AR), "-c:a", "pcm_s24le", pre]);

  // two-pass loudnorm to -14 LUFS integrated, -1 dBTP (social platforms)
  const json = measureLoudness(pre);
  const out = join(BUILD, "mix.wav");
  ffmpeg(["-i", pre, "-af", `loudnorm=I=-14:TP=-1:LRA=11:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true,aresample=${AR}`, "-c:a", "pcm_s24le", out]);
  if (Math.abs(duration(out) - total) > 0.1) log(`warning: mix is ${duration(out).toFixed(2)}s, timeline is ${total.toFixed(2)}s`);
  return out;
}

export function measureLoudness(file: string): Record<string, string> {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const m = String(r.stderr).match(/\{[\s\S]*?\}/g);
  if (!m) throw new Error("loudnorm: no measurement");
  return JSON.parse(m[m.length - 1]);
}
