const root = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content";
const sw = await import(root + "/sw.ts");
const seq: string[] = [...sw.SW_SEQUENCE];
const gpcsOf = (id: string): { g: string; p: string }[] => id.startsWith("IC") ? sw.INITIAL_CODE_UNITS.find((u: any) => u.id === id).newCode : id === "BR" ? sw.BRIDGING_UNIT.sounds.flatMap((s: any) => s.spellings.map((g: string) => ({ g, p: s.p }))) : sw.EXTENDED_CODE_UNITS.find((u: any) => u.id === id).gpcs;
const tierOf = (id: string) => (id.startsWith("IC") || id === "BR" ? "R" : Number(id.slice(2)) <= 26 ? "Y1" : "Y2");
const all = new Map<string, Set<string>>(); const multi = new Set<string>(); const soundsBySpelling = new Map<string, Set<string>>(); const spellingsBySound = new Map<string, Set<string>>();
for (const t of ["R", "Y1", "Y2"]) {
  for (const id of seq.filter((i) => tierOf(i) === t)) for (const { g, p } of gpcsOf(id)) {
    if (g.replace(/-/g, "").length >= 2) multi.add(g + ">" + p);
    (soundsBySpelling.get(g) ?? soundsBySpelling.set(g, new Set()).get(g)!).add(p);
    (spellingsBySound.get(p) ?? spellingsBySound.set(p, new Set()).get(p)!).add(g);
  }
  const pairs = [...soundsBySpelling.values()].reduce((s, v) => s + (v.size * (v.size - 1)) / 2, 0);
  const multiSp = [...soundsBySpelling.values()].filter((v) => v.size > 1).length;
  const multiSound = [...spellingsBySound.values()].filter((v) => v.size > 1).length;
  const secondPlus = [...spellingsBySound.values()].reduce((s, v) => s + Math.max(0, v.size - 1), 0);
  console.log(t, "multi-letter GPCs", multi.size, "| spellings with >1 sound", multiSp, "sound pairs", pairs, "| sounds with >1 spelling", multiSound, "2nd+ spellings", secondPlus);
}
