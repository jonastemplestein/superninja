// The landing page's claim audit (docs/midgame/MARKETING_PLAN.md §6, MK5): a claim ships with the slice that makes it
// true. Every block whose truth depends on the game carries `data-needs` in index.html; this checks each one against
// the build's content (src/content/worlds.ts) and fails when a claim runs ahead of the game, or when the game has moved
// on and the copy (a badge, the lede, the boss block) is due its next version. It also fails on the words we never use.
//
//   bun landing/claims.ts [page.html]   (exit 1 on any failure; meant for scripts/release.sh step 3, beside stats.ts)
//
// data-needs is a list of conditions separated by ";", all of which must hold; "!" negates one:
//   level:<id>            the level exists                      e.g. level:w6-1
//   land:<name>           a land with that name exists           e.g. !land:Star Dunes
//   land:~<text>          a land whose name contains the text    e.g. !land:~Library
//   kind:<kind>           a level of that kind exists            e.g. !kind:dragon (Slice 1a, the Syllable Dragon)
//   boss:<id>=<monster>   that level's monster is this one       e.g. boss:w6-11=boss_baron (until the Sky Magpie, 1b)
import { readFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../src/content/worlds";

const html = readFileSync(process.argv[2] ?? new URL("../index.html", import.meta.url), "utf8"); // (or another copy of the page)

function holds(cond: string): boolean {
  const neg = cond.startsWith("!");
  const c = neg ? cond.slice(1) : cond;
  const [type, arg = ""] = c.split(/:(.*)/s);
  let v: boolean;
  if (type === "level") v = LEVELS.some((l) => l.id === arg);
  else if (type === "land") v = arg.startsWith("~") ? WORLDS.some((w) => w.name.includes(arg.slice(1))) : WORLDS.some((w) => w.name === arg);
  else if (type === "kind") v = LEVELS.some((l) => l.kind === arg);
  else if (type === "boss") {
    const [id, monster] = arg.split("=");
    v = LEVELS.find((l) => l.id === id)?.monster === monster;
  } else throw new Error(`unknown condition "${cond}"`);
  return neg ? !v : v;
}

const text = (s: string) => s.replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
let failed = 0;
const fail = (msg: string) => { failed++; console.log(`  ✗ ${msg}`); };

console.log("Claims that depend on the build (data-needs):");
for (const m of html.matchAll(/<(\w+)([^>]*?)\sdata-needs="([^"]+)"([^>]*)>/g)) {
  const [tag, , needs] = [m[1], m[2], m[3]];
  const attrs = m[2] + m[4];
  const content = /content="([^"]*)"/.exec(attrs)?.[1];
  const from = m.index! + m[0].length;
  const end = html.indexOf(`</${tag}>`, from);
  const snippet = (content ?? text(html.slice(from, end > 0 ? Math.min(end, from + 400) : from + 400))).slice(0, 90);
  const bad = needs.split(";").map((s) => s.trim()).filter(Boolean).filter((c) => !holds(c));
  console.log(`  ${bad.length ? "✗" : "✓"} <${tag}> [${needs}] ${snippet}…`);
  if (bad.length) { failed++; console.log(`      no longer (or not yet) true: ${bad.join("; ")}. Update this block (MARKETING_PLAN §1, §3, §5).`); }
}

console.log("Words and claims the page must not use yet (or ever):");
const page = text(html) + " " + [...html.matchAll(/content="([^"]*)"/g)].map((m) => m[1]).join(" ");
const never: [RegExp, string][] = [
  [/sounds?,? every spelling|every spelling of (every|each) sound|(teaches|learns?) every spelling/i, "\"every spelling\" as coverage (only at Muddle Castle, as \"all 44 sounds and the whole Extended Code\")"],
  [/all 44 sounds/i, "\"all 44 sounds\" (Muddle Castle)"],
  [/cracked the code/i, "\"cracked the code\""],
  [/\ba[‑-]e\b|\bi[‑-]e\b|\bo[‑-]e\b|\bu[‑-]e\b/, "a split spelling (< a‑e >): the 2024 Sounds~Write guidance has none"],
  [/tricky words?|sight words?|magic e\b|silent letters?|letters make sounds/i, "a word we never use (MARKETING_PLAN §1)"],
];
if (!holds("kind:dragon")) never.push([/\bmagician\b[^.]*\b(playable|in the game)\b/i, "magician as playable (the Library)"]);
if (holds("boss:w6-11=boss_baron")) never.push([/choosing a spelling|choose a spelling/i, "\"choosing a spelling\" (Slice 1b: rival spellings on the bank)"]);
if (!holds("land:Muddle Castle")) never.push([/cracked|whole Extended Code|end of Year 2 is playable/i, "a Year 2 completion claim (Muddle Castle)"]);
for (const [re, why] of never) {
  const hit = re.exec(page);
  if (hit) fail(`${why}: "…${page.slice(Math.max(0, hit.index - 40), hit.index + 40)}…"`);
}
if (/Sounds~Write/.test(page) && !/not made, endorsed or approved by Sounds-Write Ltd/.test(page)) fail("Sounds~Write is named but the independence line is missing");
if (!failed) console.log("  ✓ none");

console.log(failed ? `\n✗ ${failed} claim problem(s)` : "\n✓ every claim holds for this build");
process.exit(failed ? 1 : 0);
