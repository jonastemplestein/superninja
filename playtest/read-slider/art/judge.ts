// Picture reading v2: the Gemini vision judge on every candidate (playtest/read-slider/art/cand/<word>_<k>.webp), as a
// young British child (scripts/treadmill/pic-audit.ts's prompt, --age 3), 3 votes. Each vote sees a word's candidates
// on the cream card in a fresh order and names each one (three names with probabilities, and whether it has a face). A
// candidate's score: the votes where the intended word is the first name, then its mean probability. Living things
// must show a face. The gag pictures (bowrain, coatrain) are asked what they show instead (the things in it).
//   doppler run -p os-legacy-2026-04 -c dev -- bun playtest/read-slider/art/judge.ts [word...]
// Writes playtest/read-slider/art/judge.json.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { generate, pool, textOf } from "../../../scripts/gemini";
import { NEW_WORDS } from "../../../src/content/compounds";

const HERE = import.meta.dir;
const CAND = join(HERE, "cand");
const OUT = join(HERE, "judge.json");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const VOTES = 3;
/** names a British 3-year-old might fairly use for the word (compared without spaces or hyphens) */
const OK: Record<string, string[]> = {
  cupcake: ["cupcake", "fairycake"],
  ball: ["ball", "redball", "bouncyball"],
  football: ["football"],
  treehouse: ["treehouse"],
  cowboy: ["cowboy"],
  raincoat: ["raincoat", "coat", "yellowcoat"],
  pancake: ["pancake", "pancakes"],
  butter: ["butter"],
  fly: ["fly", "housefly", "bug"],
  butterfly: ["butterfly"],
  lady: ["lady", "lady", "woman", "mummy", "girl"],
  ladybird: ["ladybird", "ladybug"],
  jelly: ["jelly"],
  jellyfish: ["jellyfish"],
  tooth: ["tooth"],
  brush: ["brush", "hairbrush"],
  toothbrush: ["toothbrush"],
  hedgehog: ["hedgehog"],
  seahorse: ["seahorse"],
  "redraw-rain": ["rain", "raining", "raindrops", "rainycloud", "raincloud"],
  "redraw-sea": ["sea", "seaside", "beach", "ocean", "waves"],
};
/** the one name that counts as right first (the part a slider will say); the rest are "fair" */
const EXACT: Record<string, string[]> = { raincoat: ["raincoat"], lady: ["lady"], fly: ["fly", "housefly"], "redraw-rain": ["rain", "raining"], "redraw-sea": ["sea"] };
const norm = (s: string) => s.toLowerCase().replace(/^(a|an|the|some)\s+/, "").replace(/[^a-z]/g, "");

function jpeg(file: string): string {
  const py = `import base64,io,sys
from PIL import Image
im=Image.open(sys.argv[1]).convert("RGBA");c=Image.new("RGBA",im.size,"#fff4dc");c.alpha_composite(im)
b=io.BytesIO();c.convert("RGB").save(b,"JPEG",quality=88);print(base64.b64encode(b.getvalue()).decode())`;
  return execFileSync("uv", ["run", "-q", "--with", "pillow", "python", "-c", py, file], { maxBuffer: 1 << 26 }).toString().trim();
}
const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

const files = readdirSync(CAND).filter((f) => f.endsWith(".webp"));
const byWord = new Map<string, string[]>();
for (const f of files) {
  const w = f.replace(/_\d+\.webp$/, "");
  if (only.length && !only.includes(w)) continue;
  byWord.set(w, [...(byWord.get(w) ?? []), f].sort());
}
const prev: Record<string, unknown> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const result: Record<string, any> = { ...prev };
const NAMES = { type: "OBJECT", properties: { pictures: { type: "ARRAY", items: { type: "OBJECT", properties: { index: { type: "INTEGER" }, names: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, probability: { type: "NUMBER" } }, required: ["name", "probability"] } }, face: { type: "BOOLEAN" }, things: { type: "ARRAY", items: { type: "STRING" } } }, required: ["index", "names", "face", "things"] } } }, required: ["pictures"] };

await pool([...byWord.entries()], 4, async ([word, fs]) => {
  const imgs = new Map(fs.map((f) => [f, jpeg(join(CAND, f))]));
  const gag = !!(NEW_WORDS[word] as { gag?: boolean } | undefined)?.gag;
  const living = !!(NEW_WORDS[word] as { living?: boolean } | undefined)?.living;
  const votes: Record<string, { first: string; names: { name: string; probability: number }[]; face: boolean; things: string[] }[]> = {};
  for (let v = 0; v < VOTES; v++) {
    const order = shuffle(fs);
    const prompt = `You are a 3-year-old British child looking at picture cards. What is each picture of? For EACH numbered picture, give the three most likely short, everyday names a child would actually say, most likely first, with a probability from 0 to 1 for each. Judge only what you see. Do not infer a target word, read a filename, or use nearby pictures as clues. Prefer the ordinary name of the most salient visible thing. If it depicts an action or scene, name what a child would say for that picture. Use British English (e.g. bin, cot, pram, vest). Keep names distinct and probabilities in descending order, roughly summing to 1. Also say for each picture whether you can see a FACE on the main thing in it (eyes you could look into, from the front or the side): "face": true or false. And list the separate things you can see in it ("things", up to five short words). Return exactly one entry for every index 1–${order.length}.`;
    const parts: any[] = [{ text: prompt }];
    order.forEach((f, i) => parts.push({ text: `Picture ${i + 1}:` }, { inlineData: { mimeType: "image/jpeg", data: imgs.get(f)! } }));
    const r = await generate("gemini-3.8-flash", { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", responseSchema: NAMES, temperature: 0.7 } });
    const ans = JSON.parse(textOf(r)).pictures as { index: number; names: { name: string; probability: number }[]; face: boolean; things: string[] }[];
    for (const a of ans) {
      const f = order[a.index - 1];
      if (!f) continue;
      (votes[f] ??= []).push({ first: a.names[0]?.name ?? "", names: a.names, face: a.face, things: a.things ?? [] });
    }
  }
  const ok = (OK[word] ?? [word]).map(norm);
  const exact = (EXACT[word] ?? [word]).map(norm);
  const rows = fs.map((f) => {
    const vs = votes[f] ?? [];
    const firstExact = vs.filter((x) => exact.includes(norm(x.first))).length;
    const firstFair = vs.filter((x) => ok.includes(norm(x.first))).length;
    const p = vs.reduce((s, x) => s + (x.names.find((n) => ok.includes(norm(n.name)))?.probability ?? 0), 0) / Math.max(1, vs.length);
    const faces = vs.filter((x) => x.face).length;
    const things = [...new Set(vs.flatMap((x) => x.things.map((t) => t.toLowerCase())))];
    const gagOk = gag ? vs.filter((x) => { const t = x.things.join(" ").toLowerCase() + " " + x.names.map((n) => n.name).join(" ").toLowerCase(); return /cloud|rain/.test(t) && (word === "bowrain" ? /bow|ribbon/.test(t) : /coat|jacket/.test(t)); }).length : null;
    return { file: f, firstExact, firstFair, p: Math.round(p * 100) / 100, faces, gagOk, firsts: vs.map((x) => x.first), things };
  });
  rows.sort((a, b) => (gag ? (b.gagOk ?? 0) - (a.gagOk ?? 0) : b.firstExact - a.firstExact || b.firstFair - a.firstFair || b.p - a.p) || (living ? b.faces - a.faces : 0));
  result[word] = { living, gag, rows };
  console.log(word.padEnd(12), rows.map((r) => `${r.file.replace(/^.*_/, "#").replace(".webp", "")} ${gag ? `gag ${r.gagOk}/3` : `${r.firstExact}/${r.firstFair}/3 p${r.p}`}${living ? ` face${r.faces}` : ""} [${r.firsts.join(",")}]`).join(" | "));
});
writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log("→", OUT);
