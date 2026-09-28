// The demo-slider lane's listening page (28 Sep retakes, docs/tts-retakes.md "Demo choreography" and "Picture reading
// v2 / the read slider"): each id's clip before and after, its gate numbers, and, for an id with no passing take, its
// best takes "for your ear". Run: bun playtest/retakes-2026-09-28/slider-demo/listen/make.ts, then upload.sh.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../../..");
const HERE = import.meta.dir;
const RUN = join(ROOT, "playtest/runs/retakes-2026-09-28/slider-demo");
const TRASH = join(ROOT, ".trash/retakes-2026-09-28");
const state = JSON.parse(readFileSync(join(RUN, "state.json"), "utf8")).takes as any[];
const { LINES } = await import(`${ROOT}/src/content/lines.ts`);
const text: Record<string, string> = Object.fromEntries(LINES.map((l: any) => [l.id, l.text]));
const IDS = ["tv_demo_now_tap_sun", "tv_demo_now_tap_ant", "tv_demo_rule_tapall", "pr_back_snowman", "pr_back_cupcake", "pr_back_football", "pr_back_pancake", "rs_back_1", "pr_frame", "pr_what_football"];
const OLD_TEXT: Record<string, string> = {
  pr_back_snowman: "Man snow! That's silly. We always start on this side.",
  pr_back_cupcake: "Cake cup! That's silly. We always start on this side.",
  pr_back_football: "Ball foot! That's silly. We always start on this side.",
  pr_back_pancake: "Cake pan! That's silly. We always start on this side.",
};
const WHY: Record<string, string> = {
  tv_demo_now_tap_sun: "heard as “I'm gonna”", tv_demo_now_tap_ant: "heard as “I'm gonna”", tv_demo_rule_tapall: "heard as “I say as sound”",
  pr_back_snowman: "stern (“That's silly.”): reworded", pr_back_cupcake: "stern (“That's silly.”): reworded", pr_back_football: "stern (“That's silly.”): reworded", pr_back_pancake: "stern (“That's silly.”): reworded",
  rs_back_1: "warmth 4.0, 2 of 15 “told off”", pr_frame: "warmth 4.2 (borderline)", pr_what_football: "American r in “your” (20 % British)",
};
for (const d of ["old", "new", "ear"]) mkdirSync(join(HERE, d), { recursive: true });
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const nums = (t: any) => [t.accent != null ? `accent ${Math.round(t.accent * 100)} %` : "accent –", t.warmth != null ? `warmth ${t.warmth}` : "", t.scold != null ? `told off ${t.scold}/${t.n}` : "", `${t.wps} w/s`, `${t.lufs} LUFS`, t.fall != null ? `fall ${t.fall}` : "", t.gonna != null && /going to/.test(t.text) ? `gonna ${t.gonna}/${t.n}` : ""].filter(Boolean).join(" · ");
const cards: string[] = [];
let passedN = 0;
for (const id of IDS) {
  const mine = state.filter((t) => t.id === id && t.text === text[id]);
  const pass = mine.filter((t) => t.pass);
  const olds = existsSync(TRASH) ? readdirSync(TRASH).filter((f) => f.startsWith(`${id}.`) && f.endsWith(".mp3")).sort() : [];
  if (olds.length) copyFileSync(join(TRASH, olds[0]), join(HERE, "old", `${id}.mp3`));
  else copyFileSync(join(ROOT, "public/a/l", `${id}.mp3`), join(HERE, "old", `${id}.mp3`)); // not replaced: the clip kept
  const installed = pass.length > 0;
  if (installed) {
    passedN++;
    copyFileSync(join(ROOT, "public/a/l", `${id}.mp3`), join(HERE, "new", `${id}.mp3`));
  }
  const best = installed ? pass.sort((a, b) => (b.accent ?? 1) - (a.accent ?? 1) || b.warmth - a.warmth)[0] : null;
  // no passing take: the best-judged takes for Jonas's ear
  const ear = installed ? [] : [
    ...mine.filter((t) => t.judge != null).sort((a, b) => (b.accent ?? 0) - (a.accent ?? 0) || (b.warmth ?? 0) - (a.warmth ?? 0)),
    ...mine.filter((t) => t.judge == null && !String(t.why).startsWith("whisper")).sort((a, b) => Math.abs(a.fall ?? 0) - Math.abs(b.fall ?? 0) || a.wps - b.wps),
  ].slice(0, 3);
  const earClips = ear.map((t, k) => {
    const f = `ear/${id}-${k + 1}.mp3`;
    copyFileSync(t.file, join(HERE, f));
    return `<div class="take"><audio controls preload="none" src="${f}"></audio><span class="n">take ${k + 1}: ${esc(nums(t))}${t.why ? ` · failed: ${esc(t.why)}` : ""}</span></div>`;
  });
  cards.push(`<section class="card ${installed ? "ok" : "ear"}">
  <h2><code>${id}</code> <span class="chip">${installed ? "passed, installed" : "for your ear"}</span></h2>
  <p class="why">${esc(WHY[id] ?? "")} · ${mine.length} take${mine.length === 1 ? "" : "s"}${id === "pr_back_snowman" ? " · the take's 3.3 s pause after “men!” cut to 0.7 s (8.0 s → 5.4 s)" : ""}</p>
  <div class="pair">
    <div><h3>${olds.length ? "Before" : "Now (kept)"}</h3><audio controls preload="none" src="old/${id}.mp3"></audio><p class="t">${esc(OLD_TEXT[id] ?? text[id])}</p></div>
    <div><h3>After</h3>${installed ? `<audio controls preload="none" src="new/${id}.mp3"></audio><p class="t">${esc(text[id])}</p><p class="n">${esc(nums(best))}</p>` : `<p class="t">${esc(text[id])}</p>${earClips.join("") || "<p class=\"n\">no take reached the judge</p>"}`}</div>
  </div>
</section>`);
}
const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slider and Demo Retakes</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
  :root { --ground:#f4f5fa; --surface:#fff; --ink:#1b2030; --muted:#5b6278; --line:#dde0ec; --ok:#1d7f4e; --ear:#b35c00; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme:dark; --ground:#10131c; --surface:#171b27; --ink:#e7eaf4; --muted:#9aa1b8; --line:#2a3148; --ok:#6fd39c; --ear:#ffb561; } }
  :root[data-theme="dark"] { color-scheme:dark; --ground:#10131c; --surface:#171b27; --ink:#e7eaf4; --muted:#9aa1b8; --line:#2a3148; --ok:#6fd39c; --ear:#ffb561; }
  body { background:var(--ground); color:var(--ink); font:16px/1.5 "Atkinson Hyperlegible", system-ui, sans-serif; margin:0; padding:0 16px 48px; }
  main { max-width:860px; margin:0 auto; }
  h1 { font:700 30px/1.2 "Baloo 2", system-ui, sans-serif; margin:28px 0 4px; }
  .lede { color:var(--muted); margin:0 0 20px; }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:14px 16px; margin:0 0 14px; }
  .card h2 { font-size:17px; margin:0; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .chip { font-size:12px; font-weight:700; padding:2px 8px; border-radius:99px; border:1px solid currentColor; }
  .ok .chip { color:var(--ok); } .ear .chip { color:var(--ear); }
  .why, .n { color:var(--muted); font-size:14px; margin:4px 0; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:8px; }
  @media (max-width:640px) { .pair { grid-template-columns:1fr; } }
  h3 { font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:0 0 4px; }
  audio { width:100%; max-width:100%; }
  .t { margin:4px 0; }
  .take { margin:6px 0; }
</style>
<main>
<h1>Slider and demo retakes</h1>
<p class="lede">28 Sep. Sensei (Erinome, en-GB). ${passedN} of ${IDS.length} passed every gate: faster-whisper word for word, ≤ 3.3 words a second, −16 LUFS, a clean lead-in tail, the rubric judge, the calibrated accent judge, and the warmth listen (≥ 4.3 with at most one “told off” in 15 for the corrections, the frame and the backwards gags).</p>
${cards.join("\n")}
</main>
</html>
`;
writeFileSync(join(HERE, "index.html.tmp"), html);
renameSync(join(HERE, "index.html.tmp"), join(HERE, "index.html"));
console.log(`${passedN}/${IDS.length} passed; page written`);
