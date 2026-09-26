// The game as a text adventure: bots play the journey in order (training, placement, then every level), and we record
// everything the game SAID (Sensei/Baron lines as text, pure sounds, words, stretched words, story pages) and everything
// the child DID (every tap), plus key sounds (right/wrong). Two personas: "perfect" and "learner" (about 1 in 3 first
// tries wrong, so corrections and help appear). Output: playtest/transcripts/<run>/{journey-<persona>.md,.json}.
// This is the material for the explanation audit ("is anything never explained? mentioned once but needed three times?").
// Usage: bun scripts/treadmill/transcript.ts [--base http://localhost:5173] [--only w1-wu1,w1-2] [--persona perfect,learner] [--out dir]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../../src/content/worlds";
import { LINES } from "../../src/content/lines";
import { STORIES } from "../../src/content/stories";
import { save, step } from "./bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = 4;
const ONLY = arg("only")?.split(",");
const PERSONAS = (arg("persona", "perfect,learner")!).split(",") as ("perfect" | "learner")[];
const RUN = arg("out") ?? `playtest/transcripts/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
mkdirSync(RUN, { recursive: true });

const LINE = new Map(LINES.map((l) => [l.id, l]));
const PAGE = new Map(STORIES.flatMap((st) => st.pages.map((p) => [`${st.id}_${p.id}`, p.text] as const)));

/** `url`: the clip that played (speech events), so scripts/treadmill/joins.ts can rebuild what the child heard. */
type Ev = { t: number; kind: "say" | "sound" | "word" | "stretch" | "onset" | "story" | "tap" | "sfx" | "scene"; who?: string; text: string; url?: string };
const CASES = [
  { name: "training", url: "/play/?scene=training", title: "Ninja Training (tutorial)", save: save({ seenTraining: false }) },
  { name: "placement", url: "/play/?scene=placement", title: "Show Sensei (placement)", save: save({ seenPlacement: false }) },
  ...LEVELS.map((l) => ({ name: l.id, url: `/play/?level=${l.id}`, title: `${WORLDS[l.world - 1].name} ${l.id}: ${l.kind}`, save: save() })),
].filter((c) => !ONLY || ONLY.includes(c.name));

function decode(url: string): Omit<Ev, "t"> | null {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) {
    const l = LINE.get(m[1]);
    return { kind: "say", who: l?.who ?? "sensei", text: l?.text ?? `[line ${m[1]}]` };
  }
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { kind: "sound", text: `/${m[1]}/` };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { kind: "word", text: m[1] };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { kind: "stretch", text: m[1] };
  if ((m = url.match(/\/a\/o\/([^/]+)\.mp3/))) return { kind: "onset", text: m[1] };
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return { kind: "story", who: "sensei", text: PAGE.get(m[1]) ?? `[story ${m[1]}]` };
  if ((m = url.match(/^sfx:(good|great|wrong|fanfare|petal|gong|hit|hurt)$/))) return { kind: "sfx", text: m[1] };
  return null;
}

async function play(page: Page, c: (typeof CASES)[number], persona: "perfect" | "learner"): Promise<Ev[]> {
  // the logs exist before the game's own code runs, so a level's very first line (dojo_hello, story_start, ...) is
  // recorded too (setting them after the page had loaded missed it)
  await page.addInitScript(() => {
    (window as any).__audioLog = [];
    (window as any).__taps = [];
    document.addEventListener("pointerdown", (e) => {
      const el = (e.target as Element).closest("[aria-label], button, .tile, .card");
      const label = el?.getAttribute("aria-label") || (el?.textContent ?? "").trim().slice(0, 30) || "(somewhere)";
      (window as any).__taps.push({ t: Date.now(), label });
    }, true);
  });
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...c.save, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.goto(`${BASE}${c.url}&fast=${FAST}`);
  await page.mouse.click(420, 4);
  const t0 = Date.now();
  let lastScene = "";
  const scenes: Ev[] = [];
  let item = 0;
  while (Date.now() - t0 < 150_000) {
    if (await page.locator('button[aria-label="Play again"]').count()) break;
    if (c.name === "training" || c.name === "placement") {
      const done = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return s.seenTraining && s.seenPlacement; } catch { return false; } });
      if (done) break;
    }
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    if (st.scene && st.scene !== lastScene) {
      scenes.push({ t: Date.now(), kind: "scene", text: st.scene });
      lastScene = st.scene;
    }
    // the learner gets about 1 in 3 answerable items wrong on the first try
    if (persona === "learner" && st.next && ++item % 3 === 0) {
      const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
      if (await wrong.count()) {
        await wrong.dispatchEvent("pointerdown").catch(() => {});
        await page.waitForTimeout(900);
      }
    }
    await step(page).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1500); // let the end-of-level speech land in the log
  const { audio, taps } = await page.evaluate(() => ({ audio: (window as any).__audioLog ?? [], taps: (window as any).__taps ?? [] }));
  const evs: Ev[] = [
    ...audio.map((a: any) => { const d = decode(a.url); return d ? { t: a.t, ...d, ...(a.url.startsWith("/a/") ? { url: a.url } : {}) } : null; }).filter(Boolean),
    ...taps.map((x: any) => ({ t: x.t, kind: "tap" as const, text: x.label })),
    ...scenes,
  ];
  const start = Math.min(...evs.map((e) => e.t), t0);
  const sorted = evs.sort((a, b) => a.t - b.t).map((e) => ({ ...e, t: Math.round(((e.t - start) * FAST) / 100) / 10 })); // game-time seconds
  // the bot re-taps while the game is still talking: keep one tap per thing per 2 s; drop the audio-unlock tap
  const out: Ev[] = [];
  for (const e of sorted) {
    if (e.kind === "tap" && (e.text === "(somewhere)" || out.some((o) => o.kind === "tap" && o.text === e.text && e.t - o.t < 2))) continue;
    out.push(e);
  }
  return out;
}

function render(title: string, evs: Ev[]): string {
  const out = [`## ${title}`, ""];
  let words: string[] = [];
  const flush = () => {
    if (words.length) out.push(`      🔊 ${words.join(" · ")}`);
    words = [];
  };
  for (const e of evs) {
    if (e.kind === "sound" || e.kind === "word" || e.kind === "stretch" || e.kind === "onset") {
      words.push(e.kind === "word" ? `"${e.text}"` : e.kind === "stretch" ? `"${e.text}" (slowly)` : e.kind === "onset" ? `"${e.text}" (first sound held)` : e.text);
      continue;
    }
    flush();
    const ts = `${e.t.toFixed(1).padStart(6)}s`;
    if (e.kind === "say") out.push(`${ts} ${e.who === "baron" ? "BARON" : "SENSEI"}: ${e.text}`);
    else if (e.kind === "story") out.push(`${ts} STORY: ${e.text}`);
    else if (e.kind === "tap") out.push(`${ts}   > child taps: ${e.text}`);
    else if (e.kind === "sfx") out.push(`${ts}   [${e.text}]`);
    else if (e.kind === "scene") out.push(`${ts}   --- ${e.text} ---`);
  }
  flush();
  return out.join("\n") + "\n";
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const persona of PERSONAS) {
  const results: { name: string; title: string; events: Ev[] }[] = new Array(CASES.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < CASES.length) {
        const i = next++;
        const c = CASES[i];
        const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
        const page = await ctx.newPage();
        const events = await play(page, c, persona).catch((e) => [{ t: 0, kind: "scene" as const, text: `ERROR ${String(e).slice(0, 120)}` }]);
        results[i] = { name: c.name, title: c.title, events };
        await ctx.close();
        console.log(`${persona} ${c.name}: ${events.filter((e) => e.kind === "say").length} lines, ${events.filter((e) => e.kind === "tap").length} taps`);
      }
    }),
  );
  writeFileSync(`${RUN}/journey-${persona}.json`, JSON.stringify(results, null, 1));
  writeFileSync(`${RUN}/journey-${persona}.md`, `# The journey as a text adventure (${persona} child)\n\nEverything the game said and everything the child did, level by level, in play order. Times are game seconds.\n\n` + results.map((r) => render(r.title, r.events)).join("\n"));
}
await b.close();
console.log(`→ ${RUN}`);
