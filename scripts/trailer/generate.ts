// Step 1: make sure every generated asset exists. Each asset lives at
// assets-src/trailer/cache/<kind>/<id>-<hash>.<ext>, where the hash covers its full recipe
// (prompt, model, reference file contents...). Change the recipe → new hash → regenerated.
// Nothing is regenerated if its file is already there.
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { TrailerConfig } from "../../trailer/trailer.config";
import { CACHE, ensureDir, ffmpeg, fresh, hashOf, layout, log, p, shotStart } from "./lib";
import { genElevenMusic, genElevenTts, genGeminiTts, genImage, genLyria, genOmni, genVeo, synthSfx } from "./providers";

export interface Manifest {
  images: Record<string, string>;
  videos: Record<string, string>;
  voices: Record<string, string>;
  sfx: Record<string, string>;
  music: string;
}

const IMAGE_MODEL = "gemini-3-pro-image";
const OMNI_MODEL = "gemini-omni-1.1-flash";

async function once(label: string, out: string, make: () => Promise<void> | void) {
  if (fresh(out)) return out;
  log(`generating ${label} → ${out.replace(p(""), "")}`);
  const t = Date.now();
  await make();
  log(`  done ${label} in ${((Date.now() - t) / 1000).toFixed(0)}s`);
  return out;
}

/** Pure: where each asset would live (lets `build --dry` show what is missing without generating). */
export function plan(cfg: TrailerConfig) {
  const images = Object.fromEntries(Object.entries(cfg.images).map(([id, r]) => {
    const recipe = { ...r, model: IMAGE_MODEL };
    return [id, { recipe, out: join(CACHE, "images", `${id}-${hashOf(recipe, r.refs)}.png`) }];
  }));
  const videos = Object.fromEntries(Object.entries(cfg.videos).map(([id, r]) => {
    const frame = r.frame.startsWith("img:") ? images[r.frame.slice(4)].out : p(r.frame);
    const recipe = { ...r, frame, model: r.engine === "omni" ? OMNI_MODEL : "veo-3.1-generate-preview" };
    return [id, { recipe, frame, out: join(CACHE, "videos", `${id}-${hashOf(recipe)}.mp4`) }];
  }));
  const voices = Object.fromEntries(Object.entries(cfg.voices).map(([id, v]) => {
    const cast = cfg.voiceCast[v.who];
    const recipe = v.file ? { file: v.file, in: v.in, dur: v.dur } : { text: v.text, cast };
    return [id, { recipe, out: join(CACHE, "voices", `${id}-${hashOf(recipe, v.file ? [v.file] : [])}.wav`) }];
  }));
  const sfx = Object.fromEntries(Object.entries(cfg.sfx).map(([id, s]) => {
    return [id, { recipe: s, out: join(CACHE, "sfx", `${id}-${hashOf(s, "file" in s ? [s.file] : [])}.wav`) }];
  }));
  const shots = layout(cfg);
  const total = shots[shots.length - 1].end;
  const bounds = cfg.music.sections.map((s) => shotStart(shots, s.from));
  // Chunk text is a section label + an inline instrumental cue only: any other words are sung or spoken as lyrics.
  const NO_VOICE = ["vocals", "lyrics", "singing", "spoken word", "voiceover", "choir words"];
  const chunks = cfg.music.sections.map((s, i) => ({
    text: `[${s.name}]\n{instrumental}`,
    styles: ["instrumental", ...s.styles],
    avoid: [...new Set([...(s.avoid ?? []), ...NO_VOICE])],
    ms: Math.round(((bounds[i + 1] ?? total) - bounds[i]) * 1000),
  }));
  for (const [i, c] of chunks.entries()) if (c.ms < 3000 || c.ms > 120000) throw new Error(`music section "${cfg.music.sections[i].name}" is ${c.ms} ms; ElevenLabs needs 3–120 s per section (move its \`from\` shot or lengthen the shots)`);
  const musicRecipe = { engine: cfg.music.engine, seed: cfg.music.seed, chunks, file: cfg.music.file, start: bounds[0] };
  const music = { recipe: musicRecipe, out: join(CACHE, "music", `score-${hashOf(musicRecipe)}.wav`) };
  return { images, videos, voices, sfx, music };
}

export async function generate(cfg: TrailerConfig): Promise<Manifest> {
  const pl = plan(cfg);
  ["images", "videos", "voices", "sfx", "music"].forEach((d) => ensureDir(join(CACHE, d)));

  // images first (videos depend on them), in parallel
  const settle = async (jobs: Promise<unknown>[]) => {
    const failed = (await Promise.allSettled(jobs)).filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed.length) throw new Error(`${failed.length} asset(s) failed:\n` + failed.map((f) => String(f.reason).slice(0, 600)).join("\n"));
  };
  await settle(Object.entries(pl.images).map(([id, a]) => once(`image ${id}`, a.out, () => genImage(a.out, { prompt: cfg.images[id].prompt, refs: cfg.images[id].refs, aspect: cfg.images[id].aspect ?? "16:9", size: "2K" }))));

  const videoJobs = Object.entries(pl.videos).map(([id, a]) =>
    once(`video ${id}`, a.out, async () => {
      const v = cfg.videos[id];
      const raw = a.out.replace(/\.mp4$/, ".raw.mp4");
      if (!fresh(raw)) {
        if (v.engine === "omni") await genOmni(raw, { prompt: v.prompt, image: a.frame.replace(p(""), ""), lastFrame: v.lastFrame, model: OMNI_MODEL });
        else await genVeo(raw, { prompt: v.prompt, image: a.frame.replace(p(""), "") });
      }
      // normalise: 1920×1080, 30 fps, keep audio (gen audio is used as texture under the score)
      ffmpeg(["-i", raw, "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", a.out]);
    }),
  );

  const voiceJobs = Object.entries(pl.voices).map(([id, a]) =>
    once(`voice ${id}`, a.out, async () => {
      const v = cfg.voices[id];
      if (v.file) {
        const trim = [...(v.in ? ["-ss", String(v.in)] : []), ...(v.dur ? ["-t", String(v.dur)] : [])];
        ffmpeg([...trim, "-i", p(v.file), "-ar", "48000", "-ac", "1", a.out]);
        return;
      }
      const cast = cfg.voiceCast[v.who];
      if (cast.engine === "gemini") await genGeminiTts(a.out, { text: v.text!, voice: cast.voice });
      else await genElevenTts(a.out, { text: v.text!, voiceId: cast.voice });
    }),
  );

  const sfxJobs = Object.entries(pl.sfx).map(([id, a]) =>
    once(`sfx ${id}`, a.out, () => {
      const s = cfg.sfx[id];
      if ("synth" in s) synthSfx(a.out, { kind: s.synth, dur: s.dur, pitch: s.pitch });
      else ffmpeg([...(s.in ? ["-ss", String(s.in)] : []), "-i", p(s.file), ...(s.dur ? ["-t", String(s.dur)] : []), "-ar", "48000", "-ac", "2", a.out]);
    }),
  );

  const musicJob = once("score", pl.music.out, async () => {
    const m = cfg.music;
    const raw = pl.music.out.replace(/\.wav$/, ".raw.mp3");
    if (m.engine === "file") copyFileSync(p(m.file!), raw);
    else if (m.engine === "eleven") await genElevenMusic(raw, { chunks: pl.music.recipe.chunks, seed: m.seed });
    else await genLyria(raw, { prompt: m.sections.map((s) => `${s.name}: ${s.styles.join(", ")}`).join(". Then ") + ". Instrumental only, no vocals." });
    ffmpeg(["-i", raw, "-ar", "48000", "-ac", "2", pl.music.out]);
  });

  await settle([...videoJobs, ...voiceJobs, ...sfxJobs, musicJob]);

  const pick = (o: Record<string, { out: string }>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.out]));
  const man: Manifest = { images: pick(pl.images), videos: pick(pl.videos), voices: pick(pl.voices), sfx: pick(pl.sfx), music: pl.music.out };
  for (const [k, f] of Object.entries(man.videos)) if (!existsSync(f)) throw new Error(`video ${k} missing`);
  return man;
}
