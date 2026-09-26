// One child's continuous journey through the given levels: the narrative ledger (save.narr) and the save's progress
// carry from level to level, so spaced explanations show as they would for a real child (transcript.ts starts every
// level from a fresh save). Output: <out>.json/.md in transcript.ts's format.
// bun journey.ts <out-prefix> <persona> <ids,...> [base]
import { chromium, type Page } from "playwright";
import { writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/worlds.ts";
import { LINES } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/lines.ts";
import { STORIES } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/stories.ts";
import { save, step } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/bot.ts";
const [out, persona, ids, BASE = "http://localhost:5173"] = process.argv.slice(2);
const FAST = 4;
const LINE = new Map(LINES.map((l) => [l.id, l]));
const PAGE = new Map(STORIES.flatMap((st) => st.pages.map((p) => [`${st.id}_${p.id}`, p.text] as const)));
function decode(url: string) {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) { const l = LINE.get(m[1]); return { kind: "say", who: l?.who ?? "sensei", text: l?.text ?? `[line ${m[1]}]` }; }
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { kind: "sound", text: `/${m[1]}/` };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { kind: "word", text: m[1] };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { kind: "stretch", text: m[1] };
  if ((m = url.match(/\/a\/o\/([^/]+)\.mp3/))) return { kind: "onset", text: m[1] };
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return { kind: "story", who: "sensei", text: PAGE.get(m[1]) ?? `[story ${m[1]}]` };
  return null;
}
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let carried: any = save();
const results: any[] = [];
for (const id of ids.split(",")) {
  const l = LEVELS.find((x) => x.id === id)!;
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  await page.addInitScript(() => ((window as any).__audioLog = []));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("superninja.save.v1", JSON.stringify(s)); }, { ...carried, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.goto(`${BASE}/play/?level=${id}&fast=${FAST}`);
  await page.mouse.click(420, 4);
  const t0 = Date.now();
  let item = 0;
  while (Date.now() - t0 < 150_000) {
    if (await page.locator('button[aria-label="Play again"]').count()) break;
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    if (persona === "learner" && st.next && ++item % 3 === 0) {
      const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
      if (await wrong.count()) { await wrong.dispatchEvent("pointerdown").catch(() => {}); await page.waitForTimeout(900); }
    }
    await step(page).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1500);
  const audio = await page.evaluate(() => (window as any).__audioLog ?? []);
  const evs = audio.map((a: any) => { const d = decode(a.url); return d ? { t: Math.round(((a.t - t0) * FAST) / 100) / 10, ...d, url: a.url } : null; }).filter(Boolean);
  // carry the save (with its ledger) into the next level
  carried = await page.evaluate(() => { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); return JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); });
  results.push({ name: id, title: `${WORLDS[l.world - 1].name} ${id}: ${l.kind}`, events: evs });
  console.log(`${persona} ${id}: ${evs.filter((e: any) => e.kind === "say").length} lines; ledger ${Object.keys(carried.narr ?? {}).length} keys`);
  await ctx.close();
}
writeFileSync(`${out}.json`, JSON.stringify(results, null, 1));
writeFileSync(`${out}.md`, results.map((r) => [`## ${r.title}`, "", ...r.events.map((e: any) => e.kind === "say" || e.kind === "story" ? `${e.t.toFixed(1).padStart(6)}s ${e.kind === "story" ? "STORY" : e.who === "baron" ? "BARON" : "SENSEI"}: ${e.text}` : `      🔊 ${e.kind === "word" ? `"${e.text}"` : e.text}`)].join("\n")).join("\n\n"));
await b.close();
console.log("done");
