// Speech-template pilot (SPT11), step 5: the listening page, playtest/speech-templates/pilot/index.html. For each
// template, 6 examples side by side (today against new) with their text, the judge's votes on the A/B pairs, the join
// measurements, and a Blind mode (A/B in random order, your pick, then the reveal).
//
//   bun playtest/speech-templates/pilot/page.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TEMPLATES, tierOf, type TemplateId } from "../../../src/content/templates";

const HERE = import.meta.dir;
const ROOT = join(HERE, "../../..");
const read = (p: string, d: unknown = null) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const plan = read(join(HERE, "plan.json"));
const joins: any[] = read(join(HERE, "joins.json"), []);
const votes: Record<string, any> = read(join(HERE, "judge.json"), {});
const report = read(join(HERE, "judge-report.json"), {});
const flags = read(join(HERE, "join-flags.json"), { flags: [], regenerated: [] });
const stats = read(join(HERE, "stats.json"), {});
const man = read(join(ROOT, plan.pilot, "manifest.json"), { templates: {} });

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const ORDER: TemplateId[] = ["w_say_slowly", "s_say_the_sound", "w_position_q", "w_your_word", "w_listen_again", "ww_change", "ws_way_we_spell", "ws_starts_with", "w_your_next_word", "w_next_q", "w_name_pic", "s_which_starts", "s_which_write", "s_how_write", "s_here_sound", "s_say_read"];
const WHY: Partial<Record<TemplateId, string>> = {
  w_say_slowly: "Jonas's example. “Today” is his “Say this word slowly: mat” (a carrier recorded for this pilot, then the word clip). The game's own fallback is Sensei modelling the slow way, a different act; it is the third clip.",
  s_say_the_sound: "Jonas's example. One lead-in, “Say the sound…”, then the checked pure sound 150 ms after the speech ends.",
  w_position_q: "The item's first question now names its word. No slow word after it (FS1: it would do the segmenting).",
  w_next_q: "Same words both sides, both single takes: a control for the judge.",
  w_name_pic: "Same sentence both sides (today's fm_name_ line): a control for the judge.",
  w_listen_again: "A whole sentence with the word inside, then the slow word standing alone after a 450 ms sentence join.",
  ws_way_we_spell: "The official formula with the sound back in the middle: two pieces around the pure sound.",
};
const byId = new Map(joins.map((j) => [j.id, j]));
const votesOf = (id: string) => Object.values(votes).filter((v: any) => v.id === id);
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : "–");

function row(s: any) {
  const j = byId.get(s.id);
  if (!j) return "";
  const vs = votesOf(s.id);
  const won = vs.filter((v: any) => v.winner === "new").length;
  const vals = Object.entries(s.values).filter(([k]) => k !== "spelling").map(([k, v]) => `<span class="val"><b>${esc(k)}</b> ${esc(v)}</span>`).join(" ");
  const jflags = (j.joins ?? []).map((x: any) => {
    const bad: string[] = [];
    if (x.gap_ms != null && Math.abs(x.gap_ms - x.design_ms) > (x.kind === "breath" ? 20 : 30)) bad.push(`gap ${x.gap_ms} ms`);
    if (x.level_db != null && Math.abs(x.level_db) > 3) bad.push(`level ${x.level_db > 0 ? "+" : ""}${x.level_db} dB`);
    if (x.fall_st != null && x.fall_st > 2) bad.push(`tail falls ${x.fall_st} st`);
    return `<span class="join ${bad.length ? "over" : ""}" title="${esc(`${x.from} → ${x.to}`)}">${esc(x.kind)} ${x.gap_ms ?? "?"} ms${x.level_db != null ? ` · ${x.level_db > 0 ? "+" : ""}${x.level_db} dB` : ""}${x.f0_st != null ? ` · ${x.f0_st} st` : ""}</span>`;
  }).join(" ");
  const verdict = vs.length ? `<span class="verdict ${won * 2 > vs.length ? "win" : won * 2 < vs.length ? "loss" : ""}">judge: new ${won}/${vs.length}</span>` : "";
  const reasons = vs.length ? `<details><summary>why</summary><ul>${vs.map((v: any) => `<li><b>${esc(v.winner)}</b>: ${esc(v.reason)}</li>`).join("")}</ul></details>` : "";
  const game = s.game ? `<div class="game"><span class="tag">the game now</span> <span class="said">${esc(s.gameText)}</span><audio controls preload="none" src="${esc(j.files.game)}"></audio></div>` : "";
  return `<article class="pair" data-ab="${s.ab ? 1 : 0}">
  <div class="vals">${vals} ${verdict}</div>
  <div class="sides">
    <div class="side" data-side="today"><span class="tag">today</span><span class="blindtag">A</span><p class="said">${esc(s.text.today)}</p><audio controls preload="none" src="${esc(j.files.today)}"></audio><button class="pick" type="button">Prefer this</button></div>
    <div class="side" data-side="new"><span class="tag new">new</span><span class="blindtag">B</span><p class="said">${esc(s.text.new)}</p><audio controls preload="none" src="${esc(j.files.new)}"></audio><button class="pick" type="button">Prefer this</button></div>
  </div>
  ${game}
  <div class="meta">${jflags}${(j.longest_ms ?? 0) > 600 ? ` <span class="join over">longest silence ${j.longest_ms} ms</span>` : ""} ${reasons}</div>
</article>`;
}

function section(id: TemplateId) {
  const ss = plan.samples.filter((s: any) => s.tpl === id);
  const t = TEMPLATES[id];
  const m = man.templates[id] ?? { entries: {} };
  const rendered = Object.keys(m.entries ?? {}).length;
  const failed = Object.keys(m.failed ?? {}).length;
  const r = report.by_template?.[id];
  return `<section id="${id}">
  <h2><code>${esc(id)}</code> <span class="tpl">${esc(t.text)}</span></h2>
  <p class="sub">${esc(tierOf(t))} tier · ${rendered} pieces recorded${failed ? `, <b>${failed} failed every take</b>` : ""}${r ? ` · judge: new won ${r.new} of ${r.votes} votes (${pct(r.new, r.votes)})` : ""}</p>
  ${WHY[id] ? `<p class="why">${esc(WHY[id])}</p>` : ""}
  ${ss.length ? ss.map(row).join("\n") : `<p class="why">Nothing recorded for this template.</p>`}
</section>`;
}

const hidden = (flags.flags ?? []).filter((f: any) => f.where.startsWith("s_say_read") || f.kind === "longest");
const shown = (flags.flags ?? []).filter((f: any) => !hidden.includes(f));
const FINDINGS: string[] = read(join(HERE, "findings.json"), []);
const o = report.overall ?? {};
const nc = report.no_controls ?? {};
const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Speech templates pilot</title>
<style>
:root{--bg:#f6f7fb;--card:#fff;--ink:#16223a;--muted:#5a6882;--line:#e2e7f0;--accent:#2f5bd3;--new:#0f7a4a;--newbg:#dcf3e7;--bad:#9c2a1d;--badbg:#fde4e0;--tag:#e8edf7;--code:#eef1f7}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0f1420;--card:#171e2d;--ink:#e6ebf5;--muted:#9aa7bf;--line:#283246;--accent:#8fb0ff;--new:#6fd8a3;--newbg:#15392a;--bad:#ff9d8f;--badbg:#44211c;--tag:#232c3f;--code:#1f2738}}
:root[data-theme="dark"]{--bg:#0f1420;--card:#171e2d;--ink:#e6ebf5;--muted:#9aa7bf;--line:#283246;--accent:#8fb0ff;--new:#6fd8a3;--newbg:#15392a;--bad:#ff9d8f;--badbg:#44211c;--tag:#232c3f;--code:#1f2738}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
header,main,footer{max-width:1080px;margin:0 auto;padding:0 16px}header{padding-top:28px}
h1{font-size:1.7rem;margin:0 0 .3rem}h2{font-size:1.15rem;margin:0 0 .2rem;display:flex;flex-wrap:wrap;gap:.5rem;align-items:baseline}
code{background:var(--code);padding:.05rem .35rem;border-radius:.3rem;font-size:.85em}.tpl{font-weight:600}
.lead{color:var(--muted);max-width:70ch;margin:.3rem 0 1rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:1rem 0}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}.stat b{display:block;font-size:1.5rem}.stat span{color:var(--muted);font-size:.85rem}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.bar button,.pick{font:inherit;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:.35rem .9rem;cursor:pointer}
.bar button[aria-pressed="true"]{background:var(--accent);color:var(--bg);border-color:var(--accent)}
nav{display:flex;flex-wrap:wrap;gap:6px;margin:.5rem 0 1rem}nav a{font-size:.8rem;color:var(--accent);text-decoration:none;background:var(--tag);padding:.15rem .5rem;border-radius:.4rem}
section{margin:28px 0}.sub{color:var(--muted);margin:.1rem 0 .4rem;font-size:.92rem}.why{margin:.2rem 0 .8rem;max-width:75ch}
.pair{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0}
.vals{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}.val{background:var(--tag);border-radius:.4rem;padding:.05rem .45rem;font-size:.85rem}.val b{color:var(--muted);font-weight:500}
.sides{display:grid;grid-template-columns:1fr 1fr;gap:12px}.side{border:1px solid var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}
.tag,.blindtag{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.tag.new{color:var(--new)}
.blindtag{display:none}.said{margin:0;font-size:.98rem;min-height:1.5em}audio{width:100%;height:40px}
.pick{display:none;align-self:flex-start;font-size:.85rem}
.game{margin-top:8px;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;font-size:.9rem;color:var(--muted)}.game audio{grid-column:1/-1}
.meta{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:.8rem;color:var(--muted)}
.join{background:var(--tag);border-radius:.4rem;padding:.05rem .45rem}.join.over{background:var(--badbg);color:var(--bad)}
.verdict{font-size:.8rem;font-weight:700;border-radius:.4rem;padding:.05rem .45rem;background:var(--tag)}.verdict.win{background:var(--newbg);color:var(--new)}.verdict.loss{background:var(--badbg);color:var(--bad)}
details{font-size:.85rem}details ul{margin:.3rem 0;padding-left:1.1rem}
table{border-collapse:collapse;width:100%;background:var(--card);border-radius:12px;overflow:hidden;font-size:.9rem}th,td{text-align:left;padding:.45rem .6rem;border-bottom:1px solid var(--line);vertical-align:top}
.scroll{overflow-x:auto}
body.blind .tag,body.blind .said,body.blind .verdict,body.blind .meta,body.blind .game,body.blind .why,body.blind .sub{display:none}
body.blind .blindtag{display:block}body.blind .pick{display:inline-block}body.blind .pair.done .tag,body.blind .pair.done .said,body.blind .pair.done .verdict{display:revert}
body.blind .pair.done .pick{display:none}body.blind .pair.done .side.chosen{outline:3px solid var(--accent)}
footer{color:var(--muted);font-size:.85rem;padding-bottom:40px}
.findings{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin:0 0 8px}.findings ul{margin:.4rem 0 0;padding-left:1.1rem}.findings li{margin:.35rem 0;max-width:80ch}
@media (max-width:640px){.sides{grid-template-columns:1fr}h1{font-size:1.4rem}}
</style></head><body>
<header>
<h1>Speech templates · pilot</h1>
<p class="lead">Jonas, 27 Sep: “instead of ‘say this sound: a’ you can say ‘say the sound a’ … instead of ‘say this word slowly: mat’, you would say ‘say mat slowly’.” Each pair is the same moment in the game said two ways: <b>today</b> (the recorded carrier line, then the word or sound clip, as the game joins them now) and <b>new</b> (the template: the word said inside one recorded take, or a lead-in with the checked pure sound after it). Both are Erinome. Units IC1–IC4 (the first two worlds). Blind mode hides which is which.</p>
<div class="stats">
<div class="stat"><b>${pct(o.new ?? 0, o.votes ?? 0)}</b><span>judge votes for new, all ${o.votes ?? 0} votes (${report.pairs_won ?? 0} of ${report.pairs ?? 0} pairs)</span></div>
<div class="stat"><b>${pct(nc.new ?? 0, nc.votes ?? 0)}</b><span>without the two same-words controls (${nc.votes ?? 0} votes)</span></div>
<div class="stat"><b>${pct(report.word_templates?.new ?? 0, report.word_templates?.votes ?? 0)}</b><span>word templates (${report.word_templates?.votes ?? 0} votes)</span></div>
<div class="stat"><b>${pct(report.sound_templates?.new ?? 0, report.sound_templates?.votes ?? 0)}</b><span>sound templates (${report.sound_templates?.votes ?? 0} votes)</span></div>
<div class="stat"><b>${stats.recorded ?? "?"}</b><span>clips recorded of ${stats.pieces ?? "?"}; ${stats.failed ?? 0} failed every take</span></div>
<div class="stat"><b>${stats.minutes ?? "?"} min</b><span>to render (${(stats.takes ?? 0).toLocaleString("en-GB")} TTS takes, ${stats.judged ?? "?"} judged)</span></div>
</div>
${FINDINGS.length ? `<section class="findings"><h2>What the pilot found</h2><ul>${FINDINGS.map((f) => `<li>${f}</li>`).join("")}</ul></section>` : ""}
</header>
<main>
<div class="bar"><button id="blind" type="button" aria-pressed="false">Blind mode</button><span id="tally"></span><button id="reset" type="button" hidden>Clear my picks</button></div>
<nav>${ORDER.map((id) => `<a href="#${id}">${id}</a>`).join("")}<a href="#failures">failures</a></nav>
${ORDER.map(section).join("\n")}
<section id="failures"><h2>Failures</h2>
<p class="sub">Pairs the judge gave to today (a majority of its 3 votes).</p>
<div class="scroll"><table><thead><tr><th>pair</th><th>votes for new</th><th>why</th></tr></thead><tbody>
${(report.losses ?? []).map((l: any) => `<tr><td><a href="#${esc(l.tpl)}">${esc(l.id)}</a><br><small>${esc(l.text?.today)} → ${esc(l.text?.new)}</small></td><td>${l.new}/${l.of}</td><td>${l.reasons.map(esc).join("<br>")}</td></tr>`).join("") || `<tr><td colspan="3">None.</td></tr>`}
</tbody></table></div>
<p class="sub">Pieces no take passed (the template plays its fallback for these).</p>
<div class="scroll"><table><thead><tr><th>piece</th><th>why</th></tr></thead><tbody>
${Object.entries(man.templates).flatMap(([id, t]: [string, any]) => Object.entries(t.failed ?? {}).map(([pk, why]) => `<tr><td><code>${esc(id)}/${esc(pk)}</code></td><td>${esc(why)}</td></tr>`)).join("") || `<tr><td colspan="2">None.</td></tr>`}
</tbody></table></div>
<p class="sub">Joins over the design's limits (breath 150 ± 20 ms, sentence 450 ± 30 ms, a pure sound within ± 3 dB of the lead-in's last 500 ms, lead-in tail fall ≤ 2 st).</p>
<div class="scroll"><table><thead><tr><th>where</th><th>measured</th><th>what was done</th></tr></thead><tbody>
${shown.map((f: any) => `<tr><td>${esc(f.where)}</td><td>${esc(f.what)}</td><td>${esc(f.done)}</td></tr>`).join("") || `<tr><td colspan="3">None.</td></tr>`}
</tbody></table></div>
<p class="sub">Not listed: ${hidden.length} flags on <code>s_say_read</code>, whose tiles stand alone after a whole sentence (the ± 3 dB limit is for a sound inside a sentence; today's version sits the same way), and the 320 ms tile gaps. All ${(flags.flags ?? []).length} are in join-flags.json. Proposed gain table (dB, a sound after a lead-in): ${esc(Object.entries(flags.gain_table_db ?? {}).map(([p, g]) => `/${p}/ ${g}`).join(", "))}.</p>
</section>
</main>
<footer>Generated ${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} by playtest/speech-templates/pilot/page.ts. Judge: ${esc(report.model ?? "gemini-3.8-flash")}, 3 votes a pair (new first, today first, a coin toss), temperature 1. The assembled clips are 44.1 kHz MP3s of exactly what each side plays; the template pieces themselves are 24 kHz, 48 kbps.</footer>
<script>
(function(){
  var KEY="speech-pilot-picks-v1", picks={};
  try{picks=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){picks={}}
  var save=function(){try{localStorage.setItem(KEY,JSON.stringify(picks))}catch(e){}};
  var pairs=[].slice.call(document.querySelectorAll(".pair"));
  pairs.forEach(function(p,i){
    p.dataset.key=(p.closest("section")||{}).id+":"+i;
    var sides=p.querySelector(".sides");
    if(Math.random()<.5){sides.insertBefore(sides.children[1],sides.children[0])}
    var tags=p.querySelectorAll(".blindtag");tags[0].textContent="A";tags[1].textContent="B";
    [].forEach.call(p.querySelectorAll(".side"),function(s){
      s.querySelector(".pick").addEventListener("click",function(){picks[p.dataset.key]=s.dataset.side;save();mark(p);tally()});
    });
    mark(p);
  });
  function mark(p){var k=picks[p.dataset.key];p.classList.toggle("done",!!k);[].forEach.call(p.querySelectorAll(".side"),function(s){s.classList.toggle("chosen",s.dataset.side===k)})}
  function tally(){var ks=Object.keys(picks),n=ks.filter(function(k){return picks[k]==="new"}).length;document.getElementById("tally").textContent=ks.length?("Your picks: new "+n+" of "+ks.length):"";document.getElementById("reset").hidden=!ks.length}
  document.getElementById("blind").addEventListener("click",function(){var on=document.body.classList.toggle("blind");this.setAttribute("aria-pressed",on)});
  document.getElementById("reset").addEventListener("click",function(){picks={};save();pairs.forEach(mark);tally()});
  document.addEventListener("play",function(e){[].forEach.call(document.querySelectorAll("audio"),function(a){if(a!==e.target)a.pause()})},true);
  tally();
})();
</script>
</body></html>
`;
writeFileSync(join(HERE, "index.html"), html);
console.log(`index.html: ${plan.samples.length} pairs`);
