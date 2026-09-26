// Generate the ninja's extra move sprites (kick, punch, spin, power, think, ready, flip) for Kai and Suki.
// Same approach as gen-art.ts: image-to-image from the raw idle sprite, with the art-manifest STYLE.
//
// Pipeline (ids or prefixes are optional; "kick" selects both heroes' kick, "hero_suki" all of Suki's):
//   1. doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-hero-moves.ts [ids...] [--force]
//        Raw images → assets-src/art/<id>.png (where gen-art writes). With --force the current raw is first moved
//        to assets-src/hero-moves-rejected/<id>_take<n>.png, so no take is lost.
//      bun scripts/gen-hero-moves.ts --restore=assets-src/hero-moves-rejected/<id>_take<n>.png
//        Puts a backed-up take back (the current raw is backed up in its place).
//   2. uv run --with "rembg[cpu]" --with pillow python scripts/post-art.py <ids...>
//        Cut-out (cached in assets-src/cut/<id>.png) and a first webp export.
//   3. doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-hero-moves.ts --measure [ids...]
//        Gemini vision measures face width and pupil distance vs hero_<h>_idle → assets-src/hero-moves-scale.json.
//   4. bun scripts/gen-hero-moves.ts --export [ids...]
//        Re-exports public/a/i/<id>.webp from the cut at the SAME pixel scale as hero_<h>_idle.webp, so the game can
//        render every pose at width = naturalWidth × k and the ninja never changes size between poses.
//        (post-art.py can only shrink to a fixed width; wide poses like the flying kick need up to ~20% more.)
//
// The jobs are merged into assets-src/art-jobs.json so post-art.py knows them; art-manifest.ts is not touched.
//
// Optional kiai shouts: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/gen-hero-moves.ts --kiai
//   (writes judged candidates to assets-src/kiai/; pick by hand into public/a/fx/kiai_<hero>_<n>.mp3)
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, utimesSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { STYLE } from "./art-manifest";

const SPRITE = "A single full-body character, centred, on a plain flat pure white background, no ground, no shadow, no scenery, nothing else in the image.";
const NO_FX = "Draw only the character: no motion lines, no speed lines, no swoosh marks, no glow, no aura, no sparkles, no impact effects, no dust.";

export const HEROES = ["kai", "suki"] as const;

/** Identity reminders; dynamic poses drift off-model (loose hair, bluer outfit) without them. */
const KEEP: Record<(typeof HEROES)[number], string> = {
  kai: "Keep him exactly on-model: messy black top-knot, deep indigo (not blue) ninja outfit with golden trim, bright red headband with long tails, golden sash, white wrapped hands and feet, warm brown skin.",
  suki: "Keep her exactly on-model: both round bouncy auburn bunches stay on her head (never loose hair), freckles, teal ninja outfit with coral-pink trim, coral-pink headband with long tails, golden sash, white wrapped hands and feet.",
};

/** `rotated`: the face is tilted, so scale is measured from pupil distance only. */
export const MOVES: Record<string, { how: string; aspect?: string; rotated?: boolean }> = {
  kick: {
    how: "doing a spectacular FLYING SIDE KICK to the right, like a taekwondo jump side kick: high in the air with the whole body laid out sideways, nearly parallel to the ground, torso leaning back to the left, the kicking leg locked out perfectly straight to the right with the heel and sole of the wrapped foot leading, the other leg bent and tucked up beneath, fists up guarding the chest, a fierce happy battle-cry face with mouth open, headband tails streaming out behind to the left, side view facing right",
    aspect: "4:3",
  },
  punch: {
    how: "throwing a POWERFUL STRAIGHT PUNCH to the right in a deep forward lunge: the punching arm fully extended straight out to the right with the wrapped fist leading, the other fist pulled back tight at the hip, front knee deeply bent, back leg straight behind, body leaning into the punch, a determined grin shouting a battle cry, headband tails flying out behind to the left, side view facing right",
    aspect: "4:3",
  },
  spin: {
    how: "caught mid-spin in a SPINNING CRESCENT KICK towards the right: the body twisted like a corkscrew, chest turned towards the viewer while the hips turn away, the kicking leg sweeping across high at shoulder height in a big arc towards the right, the standing leg up on tiptoe pivoting, arms flung out wide, the headband tails and sash ends wrapping round the body in a spiral from the spin, face turned to the right with an excited grin, dynamic and athletic. The hairstyle stays exactly as in the reference. No lines or arcs drawn anywhere, the spin is shown only by the twisted pose and the spiralling cloth",
    aspect: "4:3",
  },
  power: {
    how: "POWERING UP with all their might: standing firm with feet planted wide apart and knees bent, both fists clenched tight and held down at the sides by the hips, arms tense, chest puffed out, a fierce determined grin with gritted teeth, big bright ordinary eyes with normal dark pupils (the eyes do NOT glow), headband tails blowing upwards, front view facing the viewer",
  },
  think: {
    how: "THINKING, puzzled but smiling: head tilted to one side, one index finger resting on the chin, eyes looking up and to the side, a small curious lopsided smile, the other hand resting on the hip, standing relaxed, three-quarter view facing right",
  },
  ready: {
    how: "in a BOUNCY FIGHTING STANCE, clearly different from a normal standing pose: body turned side-on to the right in profile, feet wide apart with one foot in front of the other, knees bent low, springing up on tiptoes as if bouncing, lead fist pushed forward towards the right and the rear fist guarding the chin, an eager confident grin, headband tails fluttering behind, side view facing right",
  },
  flip: {
    how: "doing a MID-AIR SOMERSAULT forwards to the right: curled up in a tight round tuck high in the air, knees pulled up to the chest with both hands hugging the shins, back rounded, the whole tucked body tipped forward about 45 degrees with the head leading down and to the right (the head stays at the upper right of the ball with the face the right way up and fully visible, never upside down), a big joyful grin, the headband tails trailing behind in a short curl, facing right, a compact round silhouette",
    rotated: true,
  },
};

const raw = (id: string) => `assets-src/art/${id}.png`;
const cut = (id: string) => `assets-src/cut/${id}.png`;
const REJECTED = "assets-src/hero-moves-rejected";
const SCALE = "assets-src/hero-moves-scale.json";

type Scale = { face?: number; eyes?: number; rel?: number; w?: number; h?: number };
const loadScale = (): Record<string, Scale> => (existsSync(SCALE) ? JSON.parse(readFileSync(SCALE, "utf8")) : {});
const saveScale = (s: Record<string, Scale>) => writeFileSync(SCALE, JSON.stringify(s, null, 1) + "\n");

export const JOBS = HEROES.flatMap((h) =>
  Object.entries(MOVES).map(([pose, m]) => ({
    id: `hero_${h}_${pose}`,
    ref: `hero_${h}_idle`,
    aspect: m.aspect ?? "1:1",
    rotated: !!m.rotated,
    prompt: `Using the attached image as the exact character reference (same character, same outfit, same colours, same face, same art style and line weight), draw this character ${m.how}. ${KEEP[h]} ${SPRITE} ${NO_FX} ${STYLE}`,
  })),
);

/** post-art.py only processes ids listed in art-jobs.json; add ours (idempotent). `w` is the scale-matched width once exported. */
function registerJobs() {
  const path = "assets-src/art-jobs.json";
  const jobs: { id: string; cut: boolean; w: number }[] = JSON.parse(readFileSync(path, "utf8"));
  const scale = loadScale();
  let changed = false;
  for (const j of JOBS) {
    const w = scale[j.id]?.w ?? 640;
    const cur = jobs.find((x) => x.id === j.id);
    if (!cur) (jobs.push({ id: j.id, cut: true, w }), (changed = true));
    else if (cur.w !== w || !cur.cut) (Object.assign(cur, { cut: true, w }), (changed = true));
  }
  if (changed) writeFileSync(path, JSON.stringify(jobs, null, 1));
}

function backup(id: string) {
  mkdirSync(REJECTED, { recursive: true });
  const takes = readdirSync(REJECTED).map((f) => f.match(new RegExp(`^${id}_take(\\d+)\\.png$`))?.[1]).filter(Boolean);
  const n = Math.max(0, ...takes.map(Number)) + 1;
  const dest = `${REJECTED}/${id}_take${n}.png`;
  renameSync(raw(id), dest);
  return dest;
}

const median = (xs: number[]) => {
  const v = xs.filter(Number.isFinite).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : NaN;
};

/** Face width (box) and pupil distance in raw pixels, median of 3 Gemini vision reads each. */
async function measure(id: string): Promise<{ face: number; eyes: number }> {
  const { generate, textOf, fileToPart } = await import("./gemini");
  const [W, H] = execFileSync("uv", ["run", "-q", "--with", "pillow", "python", "-c", `from PIL import Image;print(*Image.open('${raw(id)}').size)`])
    .toString().trim().split(" ").map(Number);
  const ask = async (text: string) => {
    const json = await generate("gemini-3.8-flash", {
      contents: [{ parts: [fileToPart(raw(id)), { text }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });
    return JSON.parse(textOf(json));
  };
  const faces: number[] = [], eyes: number[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const r = await ask('Detect the cartoon character\'s FACE only: the skin area from the bottom of the chin up to the lower edge of the headband, and from ear to ear (include the ears, exclude hair, hair buns, headband and headband tails). Reply ONLY with JSON {"box_2d":[ymin,xmin,ymax,xmax]} normalised to 0-1000.');
      const [, x0, , x1] = (Array.isArray(r) ? r[0] : r).box_2d;
      faces.push(((x1 - x0) / 1000) * W);
    } catch {}
    try {
      const r = await ask('Point to the centre of the pupil of each of the cartoon character\'s two eyes. Reply ONLY with JSON [{"point":[y,x],"label":"eye"},{"point":[y,x],"label":"eye"}] normalised to 0-1000.');
      const [a, b] = r.map((p: any) => p.point);
      eyes.push(Math.hypot(((a[0] - b[0]) / 1000) * H, ((a[1] - b[1]) / 1000) * W));
    } catch {}
  }
  return { face: Math.round(median(faces)), eyes: Math.round(median(eyes)) };
}

// Trim exactly like post-art.py, then resize the cut by f = (idle webp scale) / rel.
const EXPORT_PY = `
import json, sys
from PIL import Image
def trimmed(path):
    im = Image.open(path).convert("RGBA")
    a = im.split()[3].point(lambda v: 0 if v < 12 else v)
    im.putalpha(a)
    b = a.getbbox(); pad = 6
    return im.crop((max(0, b[0]-pad), max(0, b[1]-pad), min(im.width, b[2]+pad), min(im.height, b[3]+pad)))
out = {}
for j in json.loads(sys.argv[1]):
    idle = trimmed(j["idleCut"])
    s_idle = min(1.0, 640 / idle.width)  # post-art shrinks idle to 640 wide
    im = trimmed(j["cut"])
    f = s_idle / j["rel"]
    im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    im.save(j["out"], "WEBP", quality=86, method=6)
    out[j["id"]] = [im.width, im.height, round(f, 3)]
print(json.dumps(out))
`;

if (import.meta.main) {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const restore = args.find((a) => a.startsWith("--restore="))?.slice("--restore=".length);
  const sel = args.filter((a) => !a.startsWith("--"));
  const picked = JOBS.filter((j) => !sel.length || sel.some((s) => j.id.startsWith(s) || j.id.endsWith(`_${s}`)));
  registerJobs();

  if (restore) {
    const id = basename(restore).replace(/_take\d+\.png$/, "");
    const prev = existsSync(raw(id)) ? backup(id) : null;
    renameSync(restore, raw(id));
    const now = new Date();
    utimesSync(raw(id), now, now); // fresh mtime, so post-art re-cuts it instead of reusing the old take's cut
    console.log(`restored ${restore} → ${raw(id)}${prev ? ` (previous take kept at ${prev})` : ""}`);
  } else if (args.includes("--measure")) {
    const { pool } = await import("./gemini");
    const scale = loadScale();
    const refs = [...new Set(picked.map((j) => j.ref))].filter((r) => !scale[r]?.face || force);
    await pool(refs, 4, async (r) => void (scale[r] = { ...scale[r], ...(await measure(r)) }));
    await pool(picked, 6, async (j) => {
      const m = await measure(j.id);
      const idle = scale[j.ref];
      const byFace = m.face / idle.face!, byEyes = m.eyes / idle.eyes!;
      // Upright faces: average both cues. Tilted faces: pupil distance is rotation-invariant, a face box is not.
      const rel = j.rotated || !Number.isFinite(byFace) ? byEyes : Number.isFinite(byEyes) ? (byFace + byEyes) / 2 : byFace;
      scale[j.id] = { ...scale[j.id], ...m, rel: Math.round(rel * 1000) / 1000 };
      console.log(j.id, `face ${m.face} (${byFace.toFixed(2)})`, `eyes ${m.eyes} (${byEyes.toFixed(2)})`, `→ rel ${rel.toFixed(3)}`);
    });
    saveScale(scale);
  } else if (args.includes("--kiai")) {
    // Kiai shout CANDIDATES → assets-src/kiai/. Most TTS voices read as "a woman doing a child voice"; what judged
    // consistently as a real 5-7-year-old was voice Leda pitched up 5-6 semitones with rubberband (formants shift too).
    // The judge is noisy (the same clip can score 10 then 3), so each clip is judged 3× per gender; only copy clips
    // that score ≥ 9 every time to public/a/fx/kiai_<hero>_<n>.mp3, and listen before shipping.
    const { tts, finishAudio, judgeAudio } = await import("./tts");
    const { pool } = await import("./gemini");
    const D = "assets-src/kiai";
    mkdirSync(D, { recursive: true });
    const texts = ["Hi-yah!", "Hyah!", "Yah!"];
    const rub = (who: string) => `Who is speaking in this clip? Is it a real young child aged about 5-7, or an adult (for example a woman doing a child voice), or a teenager? And is it an energetic karate-style battle cry like "hi-yah!"? The intended speaker is ${who}. Score 10 only if you are confident it is a genuine young child giving an energetic battle cry; score 0-5 if it sounds adult, teenage, pitch-shifted, chipmunk-like or odd. In notes state perceived age and gender.`;
    const jobs = texts.flatMap((t, i) => [0, 1, 2].map((k) => ({ t, base: `${D}/leda_${i}_${k}` })));
    await pool(jobs, 5, async ({ t, base }) => {
      writeFileSync(`${base}.wav`, await tts({ text: t, voice: "Leda" }));
      for (const st of [4, 5, 6]) {
        execFileSync("rubberband", ["-q", "-p", String(st), `${base}.wav`, `${base}_p${st}.wav`], { stdio: "ignore" });
        const mp3 = finishAudio(readFileSync(`${base}_p${st}.wav`), `${base}_p${st}.mp3`);
        const boy: number[] = [], girl: number[] = [];
        for (let n = 0; n < 3; n++) {
          boy.push((await judgeAudio(mp3, rub("a 6-year-old BOY"))).score);
          girl.push((await judgeAudio(mp3, rub("a 6-year-old GIRL"))).score);
        }
        console.log(`boy ${boy} girl ${girl}`, JSON.stringify(t), `+${st}`, mp3);
      }
    });
  } else if (args.includes("--export")) {
    const scale = loadScale();
    const todo = picked.filter((j) => existsSync(cut(j.id)) && scale[j.id]?.rel);
    for (const j of picked.filter((j) => !todo.includes(j))) console.warn(`skip ${j.id}: run post-art.py and --measure first`);
    const res = JSON.parse(
      execFileSync("uv", ["run", "-q", "--with", "pillow", "python", "-c", EXPORT_PY,
        JSON.stringify(todo.map((j) => ({ id: j.id, cut: cut(j.id), idleCut: cut(j.ref), rel: scale[j.id].rel, out: `public/a/i/${j.id}.webp` })))]).toString(),
    );
    for (const [id, [w, h, f]] of Object.entries(res) as [string, number[]][]) {
      Object.assign(scale[id], { w, h });
      console.log("✓", id, `${w}×${h}`, `(×${f} of raw)`);
    }
    saveScale(scale);
    registerJobs();
  } else {
    const { makeImage } = await import("./img");
    const { pool } = await import("./gemini");
    const todo = picked.filter((j) => force || !existsSync(raw(j.id)));
    console.log(`${todo.length} to generate of ${picked.length}`);
    await pool(todo, 8, async (j) => {
      if (!existsSync(raw(j.ref))) throw new Error(`missing ref ${raw(j.ref)}`);
      const tmp = `assets-src/art/.${j.id}.tmp.png`;
      const t = Date.now();
      await makeImage({ out: tmp, prompt: j.prompt, refs: [raw(j.ref)], aspect: j.aspect });
      const prev = existsSync(raw(j.id)) ? backup(j.id) : null;
      renameSync(tmp, raw(j.id));
      console.log("✓", j.id, ((Date.now() - t) / 1000).toFixed(0) + "s", prev ? `(previous take → ${prev})` : "");
    });
    const ids = todo.map((j) => j.id).join(" ");
    console.log(`next: uv run --with "rembg[cpu]" --with pillow python scripts/post-art.py ${ids}`);
    console.log(`then: bun scripts/gen-hero-moves.ts --measure ${ids} && bun scripts/gen-hero-moves.ts --export ${ids}`);
  }
}
