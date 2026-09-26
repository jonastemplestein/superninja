// Short music stings with exact timing (ElevenLabs Music v2 via Cloudflare AI Gateway composition plans), several
// takes each; then a Gemini judge picks the best take, which is loudness-normalised into public/a/m/<id>.mp3.
//   doppler run -p os -c dev -- bun scripts/gen-sting.ts gen [id]              (Cloudflare account with AI credits)
//   doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-sting.ts judge [id]
// Section texts are short labels only: ElevenLabs sings long descriptions as lyrics (see docs/TRAILER.md).
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

type Chunk = { text: string; ms: number; styles: string[]; avoid?: string[] };
const AVOID = ["vocals", "singing", "choir words", "spoken word", "lyrics", "rap", "electronic drops", "dubstep"];
const JP = ["japanese-flavoured orchestral", "taiko", "koto", "shakuhachi bamboo flute", "warm strings", "family adventure film score"];

export const STINGS: Record<string, { takes: number; rubric: string; chunks: Chunk[] }> = {
  // a gem is mastered: it flies into its petal on the World Flower and the petal blooms
  gem_victory: {
    takes: 5,
    rubric: "a 10-second victory sting for a children's ninja phonics game, played when a child masters a new spelling (a gem flies into the magical World Flower). It must SWELL: start soft and magical, build with rising strings and a taiko roll, then burst into a triumphant, joyful, epic arrival with brass and a soaring flute melody, and END decisively on a big resolved chord with a sparkling tail. No vocals or words. Kid-friendly, uplifting, not scary.",
    chunks: [
      { text: "Anticipation", ms: 3000, styles: [...JP, "soft shimmering celesta and harp glissando", "rising string tremolo", "taiko roll crescendo", "magical build"], avoid: AVOID },
      { text: "Arrival", ms: 4000, styles: [...JP, "triumphant heroic brass fanfare", "soaring bamboo flute melody", "full orchestra", "big taiko hits", "joyful epic victory"], avoid: AVOID },
      { text: "Finale", ms: 3000, styles: [...JP, "big resolved major final chord", "cymbal swell", "glockenspiel sparkle tail", "decisive ending", "no loop"], avoid: AVOID },
    ],
  },
};

/** RMS loudness in dB per 0.5 s. */
function envelope(file: string): number[] {
  const pcm = execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], { maxBuffer: 1 << 26 });
  const x = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const out: number[] = [];
  for (let i = 0; i + 4000 <= x.length; i += 4000) {
    let e = 0;
    for (let k = i; k < i + 4000; k++) e += (x[k] / 32768) ** 2;
    out.push(20 * Math.log10(Math.sqrt(e / 4000) + 1e-9));
  }
  return out;
}

const mode = process.argv[2];
const only = process.argv[3];
const ids = Object.keys(STINGS).filter((k) => !only || k === only);
mkdirSync("assets-src/music/stings", { recursive: true });

if (mode === "gen") {
  const { genElevenMusic } = await import("./trailer/providers");
  for (const id of ids) {
    const s = STINGS[id];
    await Promise.all(
      Array.from({ length: s.takes }, async (_, i) => {
        const out = `assets-src/music/stings/${id}_${i + 1}.mp3`;
        if (existsSync(out)) return;
        try {
          await genElevenMusic(out, { chunks: s.chunks, seed: 1000 + i * 37 });
          console.log("✓", out);
        } catch (e) {
          console.log("✗", out, String(e).slice(0, 200));
        }
      }),
    );
  }
} else if (mode === "judge") {
  const { generate, textOf } = await import("./gemini");
  for (const id of ids) {
    const s = STINGS[id];
    const scores: { file: string; score: number; vocals: boolean; notes: string }[] = [];
    for (let i = 1; i <= s.takes; i++) {
      const file = `assets-src/music/stings/${id}_${i}.mp3`;
      if (!existsSync(file)) continue;
      // the judge is noisy (especially about faint choirs), so ask 3 times: any "vocals" disqualifies; median score
      const runs = await Promise.all(
        [0, 1, 2].map(async () => {
          const j = await generate("gemini-3.8-flash", {
            contents: [{ parts: [
              { inlineData: { mimeType: "audio/mp3", data: readFileSync(file).toString("base64") } },
              { text: `You are a game audio director. Judge this clip as ${s.rubric} Listen carefully for any singing, voices or words (even wordless "ooh" choirs count as vocals). Reply as JSON {"score": 0-10, "vocals": boolean, "swell": boolean, "ending": boolean, "notes": "one sentence"}.` },
            ] }],
            generationConfig: { responseMimeType: "application/json" },
          });
          return JSON.parse(textOf(j));
        }),
      );
      const med = (k: string) => [...runs].sort((x, y) => x[k] - y[k])[1][k];
      const r = { score: med("score"), vocals: runs.some((x) => x.vocals), swell: runs.filter((x) => x.swell).length >= 2, ending: runs.filter((x) => x.ending).length >= 2, notes: runs.map((x) => x.notes).join(" | ") };
      // objective shape check (the judge's scores bunch at the top): soft start, loud middle, a tail that rings out
      const env = envelope(file);
      const peak = Math.max(...env);
      const start = Math.max(...env.slice(0, 2)), end = Math.max(...env.slice(-1));
      const shape = (peak - start >= 15 ? 1 : 0) + (peak - end >= 15 ? 1 : 0); // 0-2
      scores.push({ file, score: r.vocals ? 0 : r.score - (r.swell ? 0 : 2) - (r.ending ? 0 : 2) + shape, vocals: r.vocals, notes: r.notes });
      console.log(`${file}: ${r.score}/10 vocals=${r.vocals} swell=${r.swell} ending=${r.ending} shape=${shape}/2 (start ${start.toFixed(0)} peak ${peak.toFixed(0)} end ${end.toFixed(0)} dB) — ${r.notes}`);
    }
    scores.sort((a, b) => b.score - a.score);
    writeFileSync(`assets-src/music/stings/${id}.judge.json`, JSON.stringify(scores, null, 1));
    const best = scores[0];
    if (!best || best.score < 6) {
      console.log(`⚠ ${id}: no take good enough (best ${best?.score}); generate more with a new seed`);
      continue;
    }
    // loudness-normalise to sit with the rest of the soundtrack; tiny fade-in so it never clicks
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", best.file, "-af", "afade=t=in:d=0.03,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "160k", `public/a/m/${id}.mp3`]);
    copyFileSync(best.file, `assets-src/music/stings/${id}.chosen.mp3`);
    console.log(`→ public/a/m/${id}.mp3 from ${best.file} (${best.score})`);
  }
} else console.log("usage: gen-sting.ts gen|judge [id]");
