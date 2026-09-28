import { readdirSync, writeFileSync } from "fs";
const root = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content";
const sw = await import(root + "/sw.ts");
const seq: string[] = [...sw.SW_SEQUENCE];
const gpcsOf = (id: string): { g: string; p: string }[] => {
  if (id.startsWith("IC")) return sw.INITIAL_CODE_UNITS.find((u: any) => u.id === id).newCode;
  if (id === "BR") return sw.BRIDGING_UNIT.sounds.flatMap((s: any) => s.spellings.map((g: string) => ({ g, p: s.p })));
  return sw.EXTENDED_CODE_UNITS.find((u: any) => u.id === id).gpcs;
};
type Row = Record<string, number>;
const rows: Record<string, Row> = {};
const seenSounds = new Set<string>(), seenGpc = new Set<string>(), seenWords = new Set<string>();
const tierOf = (id: string) => (id.startsWith("IC") || id === "BR" ? "R" : Number(id.slice(2)) <= 26 ? "Y1" : "Y2");
for (const id of seq) {
  const m = await import(root + "/units/" + id + ".ts");
  const words = m.words as any[];
  const r: Row = {};
  const newWords = words.filter((w) => !seenWords.has(w.text));
  newWords.forEach((w) => seenWords.add(w.text));
  r.words = newWords.length;
  r.pics = newWords.filter((w) => w.pic).length;
  let wpos = 0, wgpc = 0, cvcPics = 0, first = 0, multi = 0;
  for (const w of newWords) {
    const segs = String(w.segs).split(".").map((s: string) => { const [g, p] = s.split("="); return { g, p: p ?? g }; });
    wpos += segs.length >= 3 ? 3 : 2; // first / next / last question kinds
    wgpc += segs.length;
    if (w.pic && segs.length === 3) cvcPics++;
    if (w.pic) first++;
    if (segs.some((s) => s.g.replace(/-/g, "").length >= 2)) multi++;
  }
  r.wordPositions = wpos; r.wordGpc = wgpc; r.cvcPics = cvcPics; r.picFirst = first; r.multiLetterWords = multi;
  r.steps = (m.chains ?? []).reduce((s: number, c: any[]) => s + c.length - 1, 0);
  r.sentences = (m.sentences ?? []).length;
  const g = gpcsOf(id);
  r.newGpcs = g.filter((x) => !seenGpc.has(x.g + ">" + x.p)).length;
  g.forEach((x) => seenGpc.add(x.g + ">" + x.p));
  r.newSounds = [...new Set(g.map((x) => x.p))].filter((p) => !seenSounds.has(p)).length;
  g.forEach((x) => seenSounds.add(x.p));
  r.unitGpcs = g.length;
  rows[id] = r;
}
const tiers: Record<string, string[]> = { R: seq.filter((i) => tierOf(i) === "R"), Y1: seq.filter((i) => tierOf(i) === "Y1"), Y2: seq.filter((i) => tierOf(i) === "Y2") };
const keys = Object.keys(rows[seq[0]]);
const stat = (ids: string[], k: string) => { const v = ids.map((i) => rows[i][k]).sort((a, b) => a - b); return { sum: v.reduce((a, b) => a + b, 0), med: v[Math.floor(v.length / 2)], min: v[0], max: v[v.length - 1] }; };
for (const k of keys) {
  const out = Object.entries(tiers).map(([t, ids]) => { const s = stat(ids, k); return `${t}: sum ${s.sum} med ${s.med} [${s.min}-${s.max}]`; });
  console.log(k.padEnd(18), out.join("   "));
}
writeFileSync("/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/speech-templates/spaces.json", JSON.stringify(rows, null, 1));
