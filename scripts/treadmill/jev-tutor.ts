// Offline prototype of a live adaptive tutor: could Jev, called from a Worker between items, decide what Sensei
// does next? Runs the decision questions over seeded synthetic learner histories whose intended answers are known,
// in two state formats (raw attempt log vs log + precomputed features), against a 10-minute heuristic baseline.
//   doppler run -p os -c dev -- bun scripts/treadmill/jev-tutor.ts [--variants 6]     → playtest/jev/tutor.json
// Nothing here is wired into src/. ~120 calls, ~$0.01.
import { ask, choice, noul, pool, r2, score, usage, writeOut, type JevAnswer } from "./jev-lib";

// ---------------------------------------------------------------- synthetic learners
const rng = (seed: number) => () => ((seed = (seed + 0x6d2b79f5) | 0), (((seed ^ (seed >>> 15)) * (1 | seed)) >>> 0) / 4294967296);
const WORDS = [
  ["sat", "sit"], ["mat", "map"], ["pin", "pan"], ["top", "tap"], ["pot", "pit"], ["mop", "map"], ["tin", "tan"], ["nap", "nip"],
  ["sit", "sat"], ["pat", "pot"], ["on", "an"], ["not", "nit"], ["tip", "top"], ["pop", "pip"], ["man", "mat"], ["it", "at"],
];
const VOWEL = (w: string) => w.match(/[aeiou]/)?.[0] ?? "";
interface Attempt { n: number; minute: number; game: "read" | "first-sound"; target: string; options: string[]; picked: string; ok: boolean; ms: number }
type Archetype = "secure" | "guesser" | "left_bias" | "o_confusion" | "fatigue" | "struggling" | "too_easy" | "improving" | "frustrated" | "new_p";
interface Truth { guessing: boolean; offerBreak: boolean; next: string[]; reteach: string }
const TRUTH: Record<Archetype, Truth> = {
  secure: { guessing: false, offerBreak: false, next: ["harder"], reteach: "none" },
  guesser: { guessing: true, offerBreak: false, next: ["remodel", "easier"], reteach: "none" },
  left_bias: { guessing: true, offerBreak: false, next: ["remodel", "easier"], reteach: "none" },
  o_confusion: { guessing: false, offerBreak: false, next: ["same", "remodel"], reteach: "o" },
  fatigue: { guessing: false, offerBreak: true, next: ["easier", "same"], reteach: "none" },
  struggling: { guessing: false, offerBreak: false, next: ["easier", "remodel"], reteach: "none" },
  too_easy: { guessing: false, offerBreak: false, next: ["jump", "harder"], reteach: "none" },
  improving: { guessing: false, offerBreak: false, next: ["same", "harder"], reteach: "none" },
  frustrated: { guessing: true, offerBreak: true, next: ["easier", "remodel"], reteach: "none" },
  new_p: { guessing: false, offerBreak: false, next: ["same", "remodel"], reteach: "p" },
};

function history(kind: Archetype, seed: number): Attempt[] {
  const r = rng(seed);
  const norm = (m: number, sd: number) => Math.max(250, Math.round(m + sd * (r() + r() + r() - 1.5) * 1.4));
  const out: Attempt[] = [];
  let minute = kind === "fatigue" ? 3 : kind === "frustrated" ? 4 : 1 + r() * 2;
  let lastWrong = false;
  for (let n = 1; n <= 20; n++) {
    const [a, b] = WORDS[Math.floor(r() * WORDS.length)];
    const [target, other] = r() < 0.5 ? [a, b] : [b, a];
    const options = r() < 0.5 ? [target, other] : [other, target];
    let p = 0.9, ms = norm(3500, 900);
    switch (kind) {
      case "secure": p = 0.93; break;
      case "guesser": p = 0.5; ms = norm(650, 200); break;
      case "left_bias": p = -1; ms = norm(1400, 400); break;
      case "o_confusion": p = VOWEL(target) === "o" ? 0.2 : 0.92; if (VOWEL(target) === "o") ms = norm(4200, 900); break;
      case "fatigue": p = n <= 11 ? 0.9 : 0.45; ms = n <= 11 ? norm(3200, 700) : norm(4000 + (n - 11) * 700, 1200); break;
      case "struggling": p = 0.42; ms = norm(7500, 1800); break;
      case "too_easy": p = 1; ms = norm(1500, 250); break;
      case "improving": p = n <= 10 ? 0.5 : 0.9; ms = n <= 10 ? norm(6000, 1200) : norm(3600, 700); break;
      case "frustrated": p = lastWrong ? 0.45 : 0.7; ms = lastWrong ? norm(450, 120) : norm(3800, 900); break;
      case "new_p": p = target.includes("p") ? 0.25 : 0.93; if (target.includes("p")) ms = norm(5200, 900); break;
    }
    const picked = p < 0 ? options[0] : r() < p ? target : other;
    const ok = picked === target;
    lastWrong = !ok;
    minute += (ms + 4500) / 60000;
    if (kind === "fatigue" && n > 11) minute += 0.6;
    out.push({ n, minute: r2(minute), game: r() < 0.6 ? "read" : "first-sound", target, options, picked, ok, ms });
  }
  if (kind === "fatigue") out.at(-1)!.minute = Math.max(out.at(-1)!.minute, 13);
  return out;
}

function features(h: Attempt[]) {
  const acc = (xs: Attempt[]) => r2(xs.filter((x) => x.ok).length / Math.max(1, xs.length));
  const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const perSound: Record<string, { tries: number; errors: number }> = {};
  for (const a of h) for (const ch of new Set(a.target)) (perSound[ch] ??= { tries: 0, errors: 0 }).tries++, !a.ok && perSound[ch].errors++;
  return {
    accuracyAll: acc(h),
    accuracyFirst10: acc(h.slice(0, 10)),
    accuracyLast10: acc(h.slice(-10)),
    medianMsFirst10: med(h.slice(0, 10).map((x) => x.ms)),
    medianMsLast10: med(h.slice(-10).map((x) => x.ms)),
    fastAnswersUnder1s: h.filter((x) => x.ms < 1000).length,
    shareOfTapsOnLeftOption: r2(h.filter((x) => x.picked === x.options[0]).length / h.length),
    sessionMinutes: h.at(-1)!.minute,
    errorsBySound: Object.fromEntries(Object.entries(perSound).filter(([, v]) => v.errors > 0).map(([k, v]) => [k, `${v.errors}/${v.tries}`])),
  };
}

// ---------------------------------------------------------------- decision questions
const SOUNDS = ["none", "a", "i", "m", "s", "t", "n", "o", "p"];
export const TUTOR_QS = {
  guessing: noul(
    "Is the child mostly guessing (tapping without really listening or reading: very fast answers near chance, always tapping the same side, or rapid taps after mistakes) rather than genuinely trying?",
    "mostly guessing",
    "genuinely listening or reading, even if they make mistakes",
  ),
  offerBreak: noul(
    "Should Sensei gently offer a break now? Signs: a long session (over about 10-12 minutes for a 4-year-old) together with slowing down and more mistakes than earlier, or signs of frustration.",
    "offer a break now",
    "keep playing",
  ),
  next: choice("What should the next few items be?", {
    harder: "move on to harder items or the next level",
    same: "keep practising at this level",
    easier: "make it easier: fewer choices or easier words",
    remodel: "stop and show a worked example again ('watch me'), then try together",
    jump: "skip ahead: this is far too easy",
  }),
  reteach: choice(
    "Is there ONE sound the child keeps getting wrong that Sensei should re-teach? Only choose a sound if the mistakes concentrate on it; otherwise none.",
    Object.fromEntries(SOUNDS.map((s) => [s, s === "none" ? "no single sound stands out" : `the sound /${s}/`])),
  ),
  mastery: score("How secure is the child on this level's reading?", ["not yet", "emerging", "nearly secure", "secure"]),
};

// ---------------------------------------------------------------- baseline: what we'd write in ten minutes
function heuristic(f: ReturnType<typeof features>) {
  const worst = Object.entries(f.errorsBySound).map(([k, v]) => [k, +v.split("/")[0], +v.split("/")[1]] as const).filter(([k]) => "aiou".includes(k) || "mstnp".includes(k)).sort((a, b) => b[1] - a[1])[0];
  return {
    guessing: f.fastAnswersUnder1s >= 8 && f.accuracyAll < 0.7,
    offerBreak: f.sessionMinutes > 12 && f.accuracyLast10 < f.accuracyFirst10 - 0.2,
    next: f.accuracyAll >= 0.95 ? "jump" : f.accuracyLast10 >= 0.85 ? "harder" : f.accuracyAll < 0.6 ? "easier" : "same",
    reteach: worst && worst[1] >= 3 && worst[1] / worst[2] >= 0.5 ? worst[0] : "none",
  };
}

// ---------------------------------------------------------------- run
if (import.meta.main) {
  const args = process.argv.slice(2);
  const variants = +(args[args.indexOf("--variants") + 1] || 6) || 6;
  const kinds = Object.keys(TRUTH) as Archetype[];
  const cases = kinds.flatMap((k, ki) => Array.from({ length: variants }, (_, v) => ({ kind: k, seed: 1000 * ki + v + 1 })));
  const ctx = { child: "4-year-old", level: "Bamboo Village w1-11: reading two-choice 'who read it right?' and first-sound items", soundsTaught: ["s", "a", "t", "i", "m", "n", "o", "p"], newestSound: "p (and o)" };
  const t0 = performance.now();
  const res = await pool(cases, 20, async (c) => {
    const h = history(c.kind, c.seed);
    const f = features(h);
    const [raw, feat] = await Promise.all([
      ask({ ...ctx, attempts: h }, TUTOR_QS),
      ask({ ...ctx, summary: f, attempts: h }, TUTOR_QS),
    ]);
    return { ...c, f, raw, feat, base: heuristic(f) };
  });
  const grade = (a: Record<string, JevAnswer>, t: Truth) => ({
    guessing: ((a.guessing as any).noul >= 0.5) === t.guessing,
    offerBreak: ((a.offerBreak as any).noul >= 0.5) === t.offerBreak,
    next: t.next.includes((a.next as any).choice),
    reteach: (a.reteach as any).choice === t.reteach,
  });
  const gradeBase = (b: ReturnType<typeof heuristic>, t: Truth) => ({ guessing: b.guessing === t.guessing, offerBreak: b.offerBreak === t.offerBreak, next: t.next.includes(b.next), reteach: b.reteach === t.reteach });
  const Q = ["guessing", "offerBreak", "next", "reteach"] as const;
  const summary: Record<string, Record<string, number>> = { raw: {}, withFeatures: {}, heuristic: {} };
  const brier: Record<string, Record<string, number>> = { raw: {}, withFeatures: {} };
  for (const q of Q) {
    summary.raw[q] = r2(res.filter((x) => grade(x.raw, TRUTH[x.kind])[q]).length / res.length);
    summary.withFeatures[q] = r2(res.filter((x) => grade(x.feat, TRUTH[x.kind])[q]).length / res.length);
    summary.heuristic[q] = r2(res.filter((x) => gradeBase(x.base, TRUTH[x.kind])[q]).length / res.length);
  }
  for (const q of ["guessing", "offerBreak"] as const)
    for (const [k, fmt] of [["raw", "raw"], ["withFeatures", "feat"]] as const)
      brier[k][q] = r2(res.reduce((s, x) => s + ((x as any)[fmt][q].noul - (TRUTH[x.kind][q] ? 1 : 0)) ** 2, 0) / res.length);
  const byKind = Object.fromEntries(
    kinds.map((k) => {
      const rs = res.filter((x) => x.kind === k);
      const pick = (fmt: "raw" | "feat") => ({
        guessingP: r2(rs.reduce((s, x) => s + (x[fmt].guessing as any).noul, 0) / rs.length),
        breakP: r2(rs.reduce((s, x) => s + (x[fmt].offerBreak as any).noul, 0) / rs.length),
        next: rs.map((x) => (x[fmt].next as any).choice).join(","),
        reteach: rs.map((x) => (x[fmt].reteach as any).choice).join(","),
        mastery: r2(rs.reduce((s, x) => s + (x[fmt].mastery as any).score, 0) / rs.length),
      });
      return [k, { truth: TRUTH[k], raw: pick("raw"), withFeatures: pick("feat"), heuristic: rs.map((x) => `${x.base.guessing ? "G" : "-"}${x.base.offerBreak ? "B" : "-"} ${x.base.next} ${x.base.reteach}`).join(" | ") }];
    }),
  );
  const u = usage(performance.now() - t0);
  const f = writeOut("tutor.json", { generated: new Date().toISOString(), usage: u, variantsPerArchetype: variants, accuracy: summary, brier, byKind, example: { state: { ...ctx, summary: res[0].f, attempts: history(res[0].kind, res[0].seed).slice(0, 3) }, questions: TUTOR_QS } });
  console.log(JSON.stringify(u));
  console.log("ACCURACY vs intended decisions", JSON.stringify(summary));
  console.log("BRIER (noul)", JSON.stringify(brier));
  for (const [k, v] of Object.entries(byKind) as any) console.log(`${k.padEnd(12)} truth G=${+v.truth.guessing} B=${+v.truth.offerBreak} next=${v.truth.next} re=${v.truth.reteach}\n   raw  G=${v.raw.guessingP} B=${v.raw.breakP} next=${v.raw.next} re=${v.raw.reteach} m=${v.raw.mastery}\n   feat G=${v.withFeatures.guessingP} B=${v.withFeatures.breakP} next=${v.withFeatures.next} re=${v.withFeatures.reteach} m=${v.withFeatures.mastery}\n   heur ${v.heuristic}`);
  console.log(`→ ${f}`);
}
