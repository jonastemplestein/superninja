// Can we trust Jev as a gate? Stability and calibration of the line-linter questions (jev-lint-lines.ts).
//   doppler run -p os -c dev -- bun scripts/treadmill/jev-calibrate.ts      → playtest/jev/calibration.json
// 1. repeat: the same request 5×           2. perturb: negated noul, reversed score scale, question asked alone,
// 3. labelled set: hand-written violations vs real lines and near-miss negatives → AUC, accuracy, Brier, reliability.
// 4. words: labelled unsafe/American words, example leakage, homophone pairs, sound-by-sound checks, and (with
//    --aoa <kuperman-aoa-2012.csv>) correlation of word familiarity with published age-of-acquisition norms.
//    `--only lines|words` re-runs one half.
// Re-run when the model version (usage.model) changes. ~900 calls, ~$0.04.
import { LINE_QUESTIONS, lineState, spokenLines, value, type LineKey, type SpokenLine } from "./jev-lint-lines";
import { ask, noul, pool, r2, score, usage, writeOut, type JevAnswer, type JevQuestion } from "./jev-lib";
import { WORD_QUESTIONS, items as wordItems, wordState, type Item } from "./jev-words";
import { PHONEMES, WORD_BY_TEXT, type PhonemeId } from "../../src/content/phonics";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const lines = spokenLines();
const byId = Object.fromEntries(lines.map((l) => [l.id, l]));
const mk = (text: string, who: "sensei" | "baron" = "sensei", section = "Test"): SpokenLine => ({ id: "t", text, who, section, usedIn: [] });

// ---------------------------------------------------------------- 1. repeatability
const REPEAT_IDS = ["help_sort", "baron_w4", "baron_w6", "timer_intro_2", "tut_help", "place_sound", "kai_says", "two_letters_one_sound", "yay_9", "read_intro", "s1/1", "listen_here"];
async function repeatability(n = 5) {
  const runs = await pool(REPEAT_IDS.flatMap((id) => Array.from({ length: n }, () => id)), 20, async (id) => ({ id, a: await ask(lineState(byId[id]), LINE_QUESTIONS) }));
  const perQ: Record<string, { maxSpread: number; meanSpread: number; flips: number }> = {};
  const detail: Record<string, Record<string, number[]>> = {};
  for (const k of Object.keys(LINE_QUESTIONS) as LineKey[]) {
    let max = 0, sum = 0, flips = 0;
    for (const id of REPEAT_IDS) {
      const vs = runs.filter((r) => r.id === id).map((r) => r2(value(r.a[k])));
      (detail[id] ??= {})[k] = vs;
      const spread = Math.max(...vs) - Math.min(...vs);
      max = Math.max(max, spread);
      sum += spread;
      if (vs.some((v) => v >= 0.5) && vs.some((v) => v < 0.5)) flips++;
    }
    perQ[k] = { maxSpread: r2(max), meanSpread: r2(sum / REPEAT_IDS.length), flips };
  }
  return { n, ids: REPEAT_IDS, perQuestion: perQ, detail };
}

// ---------------------------------------------------------------- 2. perturbations
const negate = (q: JevQuestion & { type: "noul" }, instr: string): JevQuestion => noul(instr, q.criteria.false, q.criteria.true);
const NEG: Partial<Record<LineKey, string>> = {
  letters_talk: "Sounds~Write rule: letters do not talk. Does the line avoid describing any letter, tile, spelling, petal or gem as 'saying', 'making' or 'going' a sound? People or characters saying things is fine.",
  letter_word: "When talking about tiles or sounds, does the line correctly avoid calling them 'letters' (using 'sounds', 'spellings' or 'sound tiles'; the phrases 'two letters, one sound' and 'three letters, one sound' are allowed)?",
  deflating: "Is this line encouraging or neutral for a young child, rather than something that could make them feel bad, stupid, rushed or like a failure?",
};
const PARA: Partial<Record<LineKey, JevQuestion>> = {
  letters_talk: noul("Is a written symbol (letter, spelling, tile) treated as if it speaks, i.e. said to 'say' or 'make' a sound?", "yes", "no"),
  scary: score("Rate the fear factor of this line for a nervous three-year-old.", ["none", "silly villain stuff, fine", "mildly scary", "really frightening"]),
};
async function perturbations() {
  const ids = REPEAT_IDS;
  const out: any = { negation: {}, reversedScale: {}, alone: {}, paraphrase: {}, stringState: {} };
  await pool(ids, 12, async (id) => {
    const st = lineState(byId[id]);
    const base = await ask(st, LINE_QUESTIONS);
    const negQs: Record<string, JevQuestion> = {};
    for (const [k, instr] of Object.entries(NEG)) negQs[k] = negate(LINE_QUESTIONS[k as LineKey] as any, instr!);
    const revQs: Record<string, JevQuestion> = {};
    for (const k of ["vocab", "load", "scary"] as const) revQs[k] = score((LINE_QUESTIONS[k] as any).instructions, [...(LINE_QUESTIONS[k] as any).criteria].reverse());
    const [neg, rev, para, strState] = await Promise.all([
      ask(st, negQs), ask(st, revQs), ask(st, PARA as Record<string, JevQuestion>),
      ask(`${st.game}\nSpeaker: ${st.speaker}. Where: ${st.where}.${"note" in st ? " " + st.note : ""}\nLine: "${st.line}"`, LINE_QUESTIONS),
    ]);
    const alone: Record<string, JevAnswer> = {};
    await Promise.all((["letters_talk", "scary", "load"] as const).map(async (k) => (alone[k] = (await ask(st, { [k]: LINE_QUESTIONS[k] }))[k])));
    for (const k of Object.keys(NEG)) (out.negation[k] ??= []).push({ id, p: r2(value(base[k as LineKey])), pNeg: r2((neg[k] as any).noul), sum: r2(value(base[k as LineKey]) + (neg[k] as any).noul) });
    for (const k of Object.keys(revQs)) (out.reversedScale[k] ??= []).push({ id, v: r2(value(base[k as LineKey])), vRev: r2(1 - value(rev[k] as any)) });
    for (const k of Object.keys(alone)) (out.alone[k] ??= []).push({ id, batched: r2(value(base[k as LineKey])), alone: r2(value(alone[k] as any)) });
    for (const k of Object.keys(PARA)) (out.paraphrase[k] ??= []).push({ id, v: r2(value(base[k as LineKey])), para: r2(value(para[k] as any)) });
    for (const k of Object.keys(LINE_QUESTIONS)) (out.stringState[k] ??= []).push(r2(Math.abs(value(base[k as LineKey]) - value(strState[k as LineKey]))));
  });
  const mad = (xs: number[]) => r2(xs.reduce((a, b) => a + b, 0) / xs.length);
  return {
    summary: {
      negation_meanAbs_1_minus_sum: Object.fromEntries(Object.entries(out.negation).map(([k, v]: any) => [k, mad(v.map((x: any) => Math.abs(1 - x.sum)))])),
      reversedScale_meanAbsDiff: Object.fromEntries(Object.entries(out.reversedScale).map(([k, v]: any) => [k, mad(v.map((x: any) => Math.abs(x.v - x.vRev)))])),
      alone_vs_batched_meanAbsDiff: Object.fromEntries(Object.entries(out.alone).map(([k, v]: any) => [k, mad(v.map((x: any) => Math.abs(x.batched - x.alone)))])),
      paraphrase_meanAbsDiff: Object.fromEntries(Object.entries(out.paraphrase).map(([k, v]: any) => [k, mad(v.map((x: any) => Math.abs(x.v - x.para)))])),
      stringVsJsonState_meanAbsDiff: Object.fromEntries(Object.entries(out.stringState).map(([k, v]: any) => [k, mad(v)])),
    },
    detail: out,
  };
}

// ---------------------------------------------------------------- 3. labelled set (positives = violations)
type Case = [text: string, bad: boolean, who?: "sensei" | "baron"];
const LABELLED: Partial<Record<LineKey, Case[]>> = {
  letters_talk: [
    ["Which letter says /s/?", true], ["Tap the tile that says /m/.", true], ["This letter makes the sound /a/.", true], ["Which spelling makes this sound?", true],
    ["The letter t goes /t/.", true], ["Listen! The petal says /ee/.", true], ["c and k both make the /k/ sound.", true], ["Can you find the one that says /i/?", true],
    ["These two letters make one sound!", true], ["That spelling can make that sound too.", true], ["What sound does this letter make?", true], ["ee says /ee/, like in tree.", true],
    ["Kai says...", false], ["Say it with me!", false], ["This is how we spell /s/.", false], ["Which one is /s/?", false], ["Two letters, one sound!", false],
    ["That's a spelling of /i/ too.", false], ["Say the sounds... and read the word!", false], ["What sound can you hear at the start?", false], ["Find the spelling of /m/.", false],
    ["Every petal was a sound. And with sounds... we make words!", false], ["Sensei says: tap the gong!", false], ["Tap the speaker to hear the sound again.", false],
  ],
  letter_names: [
    ["Find the letter ess.", true], ["This is the letter bee. It's a spelling of /b/.", true], ["Tap the capital A!", true], ["Let's sing the ABC!", true],
    ["The word cat starts with see.", true], ["Zed is a tricky one!", true], ["Double-u is next.", true], ["Aitch, aitch, aitch!", true], ["Look, it's the letter P!", true], ["Can you find the letter em?", true],
    ["Find /s/.", false], ["This is how we spell /b/.", false], ["Tap the tile for /a/.", false], ["Which one is /m/?", false], ["Well spelt!", false],
    ["I can see a bee!", false], ["Are you ready?", false], ["Oh, you are a star!", false], ["Why not try again?", false], ["The sea is big and blue.", false],
  ],
  letter_word: [
    ["Tap the letters to spell mat.", true], ["Which letter comes next?", true], ["Put the right letter on each line.", true], ["Tap the letter tiles!", true],
    ["Look at the letters in this word.", true], ["Spell sat with the letters.", true], ["Oops, that's the wrong letter.", true], ["Find the letter for /s/.", true],
    ["Two letters, one sound!", false], ["Three letters, one sound!", false], ["Tap the sound tiles.", false], ["Which spelling comes next?", false],
    ["Spell the word with the sound tiles.", false], ["Put each sound on its line.", false], ["Ask a grown-up to help you type your name.", false], ["Every petal is a sound.", false],
  ],
  american: [
    ["Awesome job, buddy!", true], ["Go read a book with your mom.", true], ["Time for recess!", true], ["You earned a cookie!", true], ["What's your favorite color?", true],
    ["Toss it in the trash can.", true], ["Welcome to kindergarten ninja school!", true], ["Grab your sneakers, it's Ninja Run!", true], ["The pandas ate cookies and candy.", true], ["Turn on the faucet.", true],
    ["Smashing!", false], ["Ace!", false], ["Go and read a book with a grown-up.", false], ["Let's practise some sounds.", false], ["Brilliant!", false], ["Mum heard the bell.", false],
    ["Cheeky pig!", false], ["Baron Muddle had pinched their lunch pot!", false], ["Put your wellies on!", false], ["Tap the kitchen tap.", false], ["Wow! You can jump ahead!", false],
  ],
  scary: [
    ["I will eat you up, bones and all!", true, "baron"], ["Nobody will ever find you. You'll be alone in the dark for ever.", true, "baron"], ["Your mummy isn't coming back.", true, "baron"],
    ["I'll hurt you if you spell that word!", true, "baron"], ["My monster will bite your fingers off!", true, "baron"], ["I'm coming to get you tonight, while you sleep.", true, "baron"],
    ["Mwa-ha-ha! These sounds are mine now!", false, "baron"], ["Grrrr... You dare to fight ME?", false, "baron"], ["Nooo! My muddle! I will be back!", false, "baron"],
    ["My big red monster is hungry... for SOUNDS!", false, "baron"], ["In my mountains, every word freezes solid!", false, "baron"], ["Words, words, WORDS! How I HATE them!", false, "baron"],
    ["Silly ninja! Catch me if you can!", false, "baron"], ["Welcome to Shadow Castle. Don't worry, I'm right beside you.", false],
  ],
  deflating: [
    ["Wrong! Try harder.", true], ["That was a bad answer.", true], ["Hurry up! You're too slow.", true], ["Even a baby could spell that.", true], ["You lost. Game over.", true],
    ["Hmm, I thought you were cleverer than that.", true], ["Everyone else got that one right.", true],
    ["Ooh, not quite. Have another go.", false], ["Nearly! Let's try that one again.", false], ["So close! Keep playing, and try again soon!", false], ["Don't worry, I'll help.", false],
    ["Oof! You ran out of hearts. Don't worry, I'll help. Let's try again!", false], ["Brilliant!", false], ["Let's practise that one again!", false],
  ],
  vocab: [
    ["Segment each phoneme, then blend.", true], ["Identify the corresponding grapheme.", true], ["Excellent articulation. Nevertheless, persevere.", true], ["Commence the tutorial sequence.", true],
    ["Your proficiency is commendable.", true], ["Select the appropriate receptacle.", true],
    ["Tap the big gong!", false], ["Well done!", false], ["Find the cat.", false], ["Tap the sound tiles.", false], ["Let's go!", false], ["Listen carefully.", false],
  ],
  load: [
    ["First tap the gong, then find the sound at the start of the word, then put it on the first line, then tap the speaker if you forget, and then do the next one.", true],
    ["When the bar is full, the monster jumps, you lose a heart, and if you lose all your hearts the level starts again, unless a grown-up has turned timers off.", true],
    ["Tap a petal, look at its gems, find a glowing one, tap it for a gem battle, and win it to fill the flower.", true],
    ["Tap the gong!", false], ["Find this sound...", false], ["Well done!", false], ["Listen...", false], ["Tap the ninja you want to be!", false],
  ],
};
function auc(pos: number[], neg: number[]) {
  let s = 0;
  for (const p of pos) for (const n of neg) s += p > n ? 1 : p === n ? 0.5 : 0;
  return r2(s / (pos.length * neg.length));
}
async function labelled() {
  const all = Object.entries(LABELLED).flatMap(([k, cs]) => cs!.map(([text, bad, who]) => ({ k: k as LineKey, text, bad, who: who ?? "sensei" })));
  const res = await pool(all, 24, async (c) => ({ ...c, a: await ask(lineState(mk(c.text, c.who as any, c.who === "baron" ? "Baron Muddle" : "Test")), LINE_QUESTIONS) }));
  const perQ: Record<string, unknown> = {};
  const rel: { p: number; y: number }[] = [];
  for (const k of Object.keys(LABELLED) as LineKey[]) {
    const rs = res.filter((r) => r.k === k).map((r) => ({ text: r.text, bad: r.bad, v: r2(value(r.a[k])) }));
    const pos = rs.filter((r) => r.bad).map((r) => r.v), neg = rs.filter((r) => !r.bad).map((r) => r.v);
    const acc = rs.filter((r) => (r.v >= 0.5) === r.bad).length / rs.length;
    const brier = rs.reduce((s, r) => s + (r.v - (r.bad ? 1 : 0)) ** 2, 0) / rs.length;
    // best threshold on this set
    let best = { at: 0.5, acc: 0 };
    for (let t = 0.05; t < 1; t += 0.05) {
      const a = rs.filter((r) => (r.v >= t) === r.bad).length / rs.length;
      if (a > best.acc) best = { at: r2(t), acc: r2(a) };
    }
    if (LINE_QUESTIONS[k].type === "noul") rel.push(...rs.map((r) => ({ p: r.v, y: r.bad ? 1 : 0 })));
    perQ[k] = { n: rs.length, auc: auc(pos, neg), accAt05: r2(acc), brier: r2(brier), bestThreshold: best, misses: rs.filter((r) => (r.v >= 0.5) !== r.bad) };
  }
  // reliability over all noul answers on the labelled set
  const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.01].slice(0, -1).map((lo, i, a) => {
    const hi = [0.2, 0.4, 0.6, 0.8, 1.01][i];
    const inBin = rel.filter((x) => x.p >= lo && x.p < hi);
    return { bin: `${lo}-${Math.min(1, hi)}`, n: inBin.length, meanP: inBin.length ? r2(inBin.reduce((s, x) => s + x.p, 0) / inBin.length) : null, fracTrue: inBin.length ? r2(inBin.reduce((s, x) => s + x.y, 0) / inBin.length) : null };
  });
  return { perQuestion: perQ, reliability: bins };
}

// ---------------------------------------------------------------- 4. words
const aucOf = (rs: { v: number; t: boolean }[]) => ({
  n: rs.length,
  auc: auc(rs.filter((r) => r.t).map((r) => r.v), rs.filter((r) => !r.t).map((r) => r.v)),
  recallAt05: `${rs.filter((r) => r.t && r.v >= 0.5).length}/${rs.filter((r) => r.t).length}`,
  falsePosAt05: `${rs.filter((r) => !r.t && r.v >= 0.5).length}/${rs.filter((r) => !r.t).length}`,
});
const fake = (text: string, pic?: string): Item => ({ text, unit: 5, pic, uses: [] });
async function words(aoaCsv?: string) {
  const out: any = {};
  // unsafe + American, asked with the production questions on made-up word entries
  const UNSAFE: [string, boolean][] = [
    ["bum", true], ["willy", true], ["shag", true], ["knob", true], ["slag", true], ["piss", true], ["crap", true], ["kill", true], ["stab", true], ["gun", true], ["fart", true], ["snog", true],
    ["cat", false], ["dog", false], ["sun", false], ["bin", false], ["gas", false], ["pop", false], ["pot", false], ["nip", false], ["hug", false], ["jam", false], ["tub", false], ["pump", false],
  ];
  const AMER: [string, boolean][] = [
    ["faucet", true], ["candy", true], ["cookie", true], ["diaper", true], ["stroller", true], ["sidewalk", true], ["trash", true], ["mom", true], ["flashlight", true], ["eraser", true], ["fries", true], ["pacifier", true],
    ["tap", false], ["sweets", false], ["biscuit", false], ["nappy", false], ["pram", false], ["pavement", false], ["rubbish", false], ["mum", false], ["torch", false], ["crisps", false], ["jumper", false], ["dummy", false],
  ];
  const [u, a] = await Promise.all([
    pool(UNSAFE, 12, async ([w, t]) => ({ w, t, v: r2(((await ask(wordState(fake(w)), { unsafe: WORD_QUESTIONS.unsafe })).unsafe as any).noul) })),
    pool(AMER, 12, async ([w, t]) => ({ w, t, v: r2(((await ask(wordState(fake(w)), { american: WORD_QUESTIONS.american })).american as any).noul) })),
  ]);
  out.unsafe = { ...aucOf(u), rows: u };
  out.american = { ...aucOf(a), rows: a };

  // example leakage: the same questions with different worked examples
  const HOMO_T = ["which", "high", "not", "in", "mist", "red", "sell", "check", "sun", "ring", "rain", "tail", "sea", "tea", "bee", "night", "pie", "tie", "road", "beach", "lie", "witch"];
  const HOMO_F = ["cat", "dog", "mat", "sit", "pan", "hen", "bed", "fox", "cup", "bus", "jam", "lamp", "frog", "ship", "fish", "duck", "milk", "tent", "pig", "log"];
  const H = (ex: string) => noul(`Spoken in Southern British English, does this word sound exactly the same as a different common English word with a different spelling${ex}?`, "sounds identical to another common word spelt differently", "no common word sounds identical");
  const homoQs = { examplesA: H(" (for example sea/see, night/knight, which/witch, tail/tale, be/bee)"), examplesB: H(" (for example knot/not, red/read, son/sun, rode/road, cell/sell)"), none: H("") };
  const all = wordItems();
  const by = Object.fromEntries(all.map((i) => [i.text, i]));
  const hs = await pool([...HOMO_T, ...HOMO_F].filter((w) => by[w]), 20, async (w) => ({ w, t: HOMO_T.includes(w), a: await ask(wordState(by[w]), homoQs) }));
  out.homophoneRecall = Object.fromEntries(Object.keys(homoQs).map((k) => [k, { ...aucOf(hs.map((h) => ({ t: h.t, v: (h.a as any)[k].noul }))), positives: Object.fromEntries(hs.filter((h) => h.t).map((h) => [h.w, r2((h.a as any)[k].noul)])) }]));
  const A = (ex: string) => noul(`Picture naming risk for a first-sound game. Is there a likely OTHER name a young child would give this picture that starts with a DIFFERENT first sound from the target word${ex}? If there is no picture, answer false.`, "a likely other name starts with a different sound", "no likely other name, or it starts with the same sound");
  const altQs = { examplesA: A(" (for example 'sea' drawn as a wave → 'wave'; 'tea' drawn as a cup → 'cup'; 'nap' drawn as a sleeping cat → 'cat')"), examplesB: A(" (for example 'hop' drawn as a rabbit → 'rabbit'; 'fin' drawn as a shark → 'shark')"), none: A("") };
  const pics = all.filter((i) => i.pic);
  const as = await pool(pics, 24, async (i) => ({ w: i.text, a: await ask(wordState(i), altQs) }));
  const rankOf = (k: string) => Object.fromEntries([...as].sort((x: any, y: any) => y.a[k].noul - x.a[k].noul).map((x, i) => [x.w, i]));
  const spear = (r1: any, r2_: any) => r2(1 - (6 * as.reduce((d, x) => d + (r1[x.w] - r2_[x.w]) ** 2, 0)) / (as.length * (as.length ** 2 - 1)));
  const [rA, rB, rN] = ["examplesA", "examplesB", "none"].map(rankOf);
  out.altFirstLeakage = {
    spearman: { A_B: spear(rA, rB), A_none: spear(rA, rN), B_none: spear(rB, rN) },
    top10: Object.fromEntries(Object.keys(altQs).map((k) => [k, [...as].sort((x: any, y: any) => y.a[k].noul - x.a[k].noul).slice(0, 10).map((x: any) => `${x.w}:${r2(x.a[k].noul)}`)])),
  };

  // homophone verification with the pair spelled out
  const PT = [["which", "witch"], ["not", "knot"], ["mist", "missed"], ["red", "read (past tense)"], ["sell", "cell"], ["check", "cheque"], ["sun", "son"], ["ring", "wring"], ["rain", "reign"], ["tail", "tale"], ["sea", "see"], ["tea", "tee"], ["bee", "be"], ["night", "knight"], ["pie", "pi"], ["road", "rode"], ["beach", "beech"], ["high", "hi"], ["in", "inn"], ["him", "hymn"]];
  const PF = [["cat", "cut"], ["bed", "bad"], ["pin", "pen"], ["ship", "sip"], ["fish", "fist"], ["moth", "mouth"], ["rain", "ran"], ["not", "note"], ["red", "reed"], ["sit", "seat"], ["hop", "hope"], ["tap", "tape"], ["pan", "pain"], ["cot", "coat"], ["bit", "bite"], ["fox", "fax"], ["mist", "mast"], ["sell", "sale"], ["check", "chuck"], ["sun", "soon"]];
  const same = { same: noul("In Southern British English, are these two words pronounced exactly the same (homophones)?", "pronounced identically", "pronounced differently") };
  const ps = await pool([...PT.map((p) => ({ p, t: true })), ...PF.map((p) => ({ p, t: false }))], 20, async (x) => ({ pair: x.p.join("/"), t: x.t, v: r2(((await ask({ word_a: x.p[0], word_b: x.p[1] }, same)).same as any).noul) }));
  out.homophonePairs = { ...aucOf(ps), rows: ps };

  // sound-by-sound check: correct breakdowns vs one corrupted sound, with the game's labels and with IPA
  const fmt = (segs: { g: string; p: PhonemeId }[], ipa: boolean) => segs.map((x) => (ipa ? `${x.g} = /${PHONEMES[x.p].ipa}/` : `${x.g} = /${PHONEMES[x.p].label}/ (as in '${PHONEMES[x.p].example}')`)).join(", ");
  const good = ["squid", "quiz", "fox", "duck", "dusk", "have", "long", "strong", "soft", "moth", "much", "cat", "ship", "rain", "night", "boat", "tree", "chick", "thin", "witch"];
  const bad: [string, number, PhonemeId][] = [["cat", 1, "oe"], ["ship", 0, "s"], ["rain", 1, "a"], ["night", 1, "i"], ["boat", 1, "o"], ["tree", 2, "e"], ["fox", 2, "s"], ["duck", 1, "oo"], ["moth", 2, "f"], ["thin", 0, "dh"], ["long", 2, "n"], ["much", 1, "ue"], ["quiz", 1, "oo"], ["have", 1, "ae"], ["soft", 1, "oe"], ["chick", 0, "sh"], ["witch", 1, "ie"], ["dusk", 2, "sh"], ["strong", 3, "oe"], ["squid", 3, "ee"]];
  const segQ = { wrong: noul("Check the sound-by-sound breakdown of the word against how it is said in Southern British English. Is any sound wrong, missing or extra?", "the breakdown has a wrong, missing or extra sound", "every sound is right") };
  const segItems = [
    ...good.flatMap((w) => [true, false].map((ipa) => ({ w, ipa, t: false, segs: WORD_BY_TEXT[w].segs }))),
    ...bad.flatMap(([w, i, p]) => [true, false].map((ipa) => ({ w, ipa, t: true, segs: WORD_BY_TEXT[w].segs.map((x, k) => (k === i ? { ...x, p } : x)) }))),
  ];
  const ss = await pool(segItems, 20, async (x) => ({ ...x, v: ((await ask({ word: x.w, sound_by_sound: fmt(x.segs, x.ipa) }, segQ)).wrong as any).noul as number }));
  out.segments = { gameLabels: aucOf(ss.filter((x) => !x.ipa)), ipa: aucOf(ss.filter((x) => x.ipa)) };

  // familiarity: 60 hand-labelled words (for a British 4-year-old), asked as a unit-1 word
  const KNOWN = ["cat", "dog", "sun", "bed", "hat", "cup", "bus", "pig", "jam", "van", "pan", "mop", "tap", "box", "fox", "duck", "sock", "fish", "ship", "milk", "hand", "leg", "frog", "tent", "jump", "map", "zip", "net", "web", "tie", "peg", "nest", "nail", "pin", "match"];
  const UNKNOWN = ["kin", "jab", "jig", "imp", "dusk", "rust", "silk", "prop", "smug", "glum", "brisk", "crept", "stun", "grub", "trim", "cuff", "blot", "skid", "cab", "tusk", "hob", "swept", "vat", "brag", "quilt"];
  const kn = await pool([...KNOWN.map((w) => ({ w, t: false })), ...UNKNOWN.map((w) => ({ w, t: true }))], 20, async (x) => ({ ...x, v: r2(1 - ((await ask(wordState({ text: x.w, unit: 1, uses: [] }), { known: WORD_QUESTIONS.known })).known as any).noul) }));
  const prAt = (rs: { v: number; t: boolean }[], at: number) => { const tp = rs.filter((r) => r.t && r.v >= at).length, fp = rs.filter((r) => !r.t && r.v >= at).length; return { at, precision: tp + fp ? r2(tp / (tp + fp)) : null, recall: r2(tp / rs.filter((r) => r.t).length), flagged: tp + fp }; };
  out.knownLabelled = { ...aucOf(kn), at: [0.5, 0.6, 0.7].map((t) => prAt(kn, t)), knownWordsAbove04: kn.filter((r) => !r.t && r.v >= 0.4).map((r) => `${r.w}:${r.v}`), unknownMissedAt06: kn.filter((r) => r.t && r.v < 0.6).map((r) => `${r.w}:${r.v}`) };

  // picture questions vs blind vision naming of the real pictures (pic-audit.ts output), if a run has it
  const picsFile = readdirSync("playtest/runs")
    .map((d) => `playtest/runs/${d}/pics-all.json`)
    .filter((f) => existsSync(f))
    .sort((a, b) => JSON.parse(readFileSync(b, "utf8")).length - JSON.parse(readFileSync(a, "utf8")).length)[0];
  if (picsFile) {
    const gt: any[] = JSON.parse(readFileSync(picsFile, "utf8"));
    const covered = gt.filter((g) => by[g.word]?.pic);
    const pq = { name_agree: WORD_QUESTIONS.name_agree, alt_first: WORD_QUESTIONS.alt_first };
    const pr = await pool(covered, 24, async (g) => ({ g, a: (await ask(wordState(by[g.word]), pq)) as any }));
    const nameRows = pr.map(({ g, a }) => ({ t: g.intendedRank !== 1, v: r2(1 - a.name_agree.score / 3) }));
    const altRows = pr.map(({ g, a }) => ({ t: g.intendedRank !== 1 && !g.sharesFirstSound, v: r2(a.alt_first.noul) }));
    const lenRows = pr.map(({ g }) => ({ t: g.intendedRank !== 1, v: by[g.word].pic!.split(" ").length / 20 }));
    out.picturesVsVision = {
      source: picsFile,
      name_agree: { truth: "intended word is not the most likely name", ...aucOf(nameRows), at: [0.5, 0.6, 0.7].map((t) => prAt(nameRows, t)) },
      alt_first: { truth: "top name is another word with a different first sound", ...aucOf(altRows), at: [0.5, 0.6, 0.7].map((t) => prAt(altRows, t)) },
      baselinePromptLength: { truth: "same as name_agree", auc: aucOf(lenRows).auc },
    };
  }

  // familiarity vs Kuperman et al. (2012) age-of-acquisition ratings
  if (aoaCsv && existsSync(aoaCsv)) {
    const aoa: Record<string, number> = {};
    for (const row of readFileSync(aoaCsv, "utf8").split("\n").slice(1)) {
      const c = row.split(",");
      if (c[4] && c[4] !== "NA" && !isNaN(+c[4])) aoa[c[0]] = +c[4];
    }
    const ks = await pool(all.filter((i) => aoa[i.text] != null), 24, async (i) => {
      const k = (await ask(wordState(i), { known: WORD_QUESTIONS.known })).known as any;
      return { w: i.text, aoa: aoa[i.text], unknown: 1 - k.noul };
    });
    const rank = (xs: number[]) => { const s = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r: number[] = []; s.forEach(([, i], k) => (r[i] = k)); return r; };
    const pear = (a: number[], b: number[]) => { const n = a.length, ma = a.reduce((x, y) => x + y) / n, mb = b.reduce((x, y) => x + y) / n; let c = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; } return c / Math.sqrt(va * vb); };
    out.familiarityVsAoA = {
      n: ks.length,
      spearman: r2(pear(rank(ks.map((k) => k.unknown)), rank(ks.map((k) => k.aoa)))),
      flaggedAmongAoAunder4_5: `${ks.filter((k) => k.aoa <= 4.5 && k.unknown >= 0.5).length}/${ks.filter((k) => k.aoa <= 4.5).length}`,
      flaggedAmongAoAover7: `${ks.filter((k) => k.aoa >= 7 && k.unknown >= 0.5).length}/${ks.filter((k) => k.aoa >= 7).length}`,
    };
  }
  return out;
}

if (import.meta.main) {
  const t0 = performance.now();
  const args = process.argv.slice(2);
  const aoaCsv = args.includes("--aoa") ? args[args.indexOf("--aoa") + 1] : undefined;
  // --only lines|words re-runs one half and keeps the other half from the previous calibration.json
  const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : "";
  let prev: any = {};
  try { prev = JSON.parse(readFileSync("playtest/jev/calibration.json", "utf8")); } catch {}
  const doLines = only !== "words", doWords = only !== "lines";
  const rep = doLines ? await repeatability() : prev.repeatability;
  const per = doLines ? await perturbations() : prev.perturbations;
  const lab = doLines ? await labelled() : prev.labelled;
  const wd = doWords ? await words(aoaCsv) : prev.words;
  const u = usage(performance.now() - t0);
  const f = writeOut("calibration.json", { generated: new Date().toISOString(), usage: u, ...(only ? { partialRerun: only, previousUsage: prev.usage } : {}), repeatability: rep, perturbations: per, labelled: lab, words: wd });
  console.log("usage", JSON.stringify(u));
  console.log("\nREPEAT (5×)", JSON.stringify(rep?.perQuestion, null, 0));
  console.log("\nPERTURB", JSON.stringify(per?.summary, null, 1));
  for (const [k, v] of Object.entries(lab?.perQuestion ?? {}) as any) console.log(`LABELLED ${k.padEnd(13)} n=${v.n} auc=${v.auc} acc@.5=${v.accAt05} brier=${v.brier} best=${JSON.stringify(v.bestThreshold)} misses=${v.misses.map((m: any) => `${m.bad ? "FN" : "FP"} ${m.v} "${m.text.slice(0, 40)}"`).join(" | ")}`);
  console.log("RELIABILITY", JSON.stringify(lab?.reliability));
  console.log("\nWORDS", JSON.stringify({ ...wd, unsafe: { ...wd.unsafe, rows: undefined }, american: { ...wd.american, rows: undefined }, homophonePairs: { ...wd.homophonePairs, rows: undefined } }, null, 1));
  console.log(`→ ${f}`);
}
