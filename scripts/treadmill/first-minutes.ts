// The first five minutes as a text adventure (docs/FIRST_MINUTES.md §2, §14): a brand-new child plays ONE continuous
// session from the title tap to the map (title → intro film → choose → opt-in → dojo welcome → Lesson 1 → Reward 1 →
// Lesson 2 → Reward 2 → map). We record everything the game said and every tap, and time each piece against the spec's
// budgets. Personas: "perfect" (answers right, ~1.2 s after each question) and "learner" (about 1 in 3 first tries
// wrong, and slower). `--optin` picks the opt-in answer (none, unsure, R, Y1, Y2).
// Output: playtest/transcripts/first-minutes/<persona>[-<optin>].{md,json}
// Usage: bun scripts/treadmill/first-minutes.ts [--base http://localhost:5173] [--persona perfect,learner] [--optin none] [--fast 4]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { step } from "./bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "4"));
const PERSONAS = arg("persona", "perfect,learner")!.split(",") as ("perfect" | "learner")[];
const OPTIN = arg("optin", "none")!;
const OUT = "playtest/transcripts/first-minutes";
/** `--shots <dir>`: a phone-size screenshot every `--every` game seconds (default 4), named by time and piece */
const SHOTS = arg("shots");
const EVERY = Number(arg("every", "4"));
const VIEW = (arg("view", "844x390")!).split("x").map(Number) as [number, number];
mkdirSync(OUT, { recursive: true });
const LINE = new Map(LINES.map((l) => [l.id, l]));

/** The spec's budgets (§2, §14): target and hard cap, in seconds. */
const BUDGET: Record<string, { target: number; cap?: number; bot?: number }> = {
  "title": { target: 3 },
  "intro film": { target: 45 },
  "choose": { target: 6 },
  "opt-in": { target: OPTIN === "none" || OPTIN === "unsure" ? 16 : 28, cap: 30 },
  "dojo welcome": { target: 12 },
  "lesson 1": { target: 85, cap: 100, bot: 80 },
  "reward 1": { target: 21, cap: 26 },
  "lesson 2": { target: 65, cap: 75, bot: 66 }, // (target 65, bot 66 since the merged pictures hold clean: docs/DECISIONS.md)
  "reward 2": { target: 26, cap: 30 },
};

type Ev = { t: number; kind: "say" | "sound" | "word" | "stretch" | "tap" | "piece" | "beat"; who?: string; text: string };
function decode(url: string): Omit<Ev, "t"> | null {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) {
    const l = LINE.get(m[1]);
    return { kind: "say", who: l?.who ?? "sensei", text: `${l?.text ?? `[line ${m[1]}]`}  ‹${m[1]}›` };
  }
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { kind: "sound", text: `/${m[1]}/` };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { kind: "word", text: m[1] };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { kind: "stretch", text: m[1] };
  return null;
}

/** Which piece of the first five minutes is on screen. */
const pieceNow = (page: Page) =>
  page.evaluate(() => {
    const q = (s: string) => !!document.querySelector(s);
    const st = (window as any).__snState ?? {};
    if (q(".oi")) return "opt-in";
    if (q(".wu")) return `lesson:${st.key ?? "?"}`;
    if (q(".st-reward")) return "reward";
    if (typeof st.scene === "string" && ["learn", "find", "build", "battle", "sort", "read", "pick", "swap"].includes(st.scene)) return "lesson:school";
    if (q(".scene.map")) return "map";
    if (typeof st.scene === "string" && st.scene.startsWith("tut-")) return "dojo welcome";
    if (q(".scene.choose")) return "choose";
    if (q(".skip-film") || q("video")) return "intro film";
    if (q(".scene.title")) return "title";
    if (q('[aria-label^="player "]')) return "profiles";
    return "?";
  });

async function play(page: Page, persona: "perfect" | "learner", shots?: string) {
  // the grown-up handover (the Get Ready page, the profile) is not counted: a fresh profile is ready at the title
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  await page.evaluate(() => {
    localStorage.clear();
    const id = "pfm";
    localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: null, created: Date.now(), last: Date.now() }], current: id }));
    localStorage.setItem(`superninja.save.${id}`, JSON.stringify({ v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true }));
    sessionStorage.setItem("sn.setup", "done");
  });
  await page.addInitScript((o) => {
    (window as any).__audioLog = [];
    (window as any).__taps = [];
    (window as any).__botOptIn = o;
    addEventListener("pointerdown", (e) => {
      const el = (e.target as Element).closest?.("[aria-label], button");
      (window as any).__taps.push({ t: Date.now(), label: el?.getAttribute("aria-label") || (el?.textContent ?? "").trim().slice(0, 30) || "(somewhere)" });
    }, true);
  }, OPTIN);
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  await page.waitForTimeout(600);
  const t0 = Date.now();
  const pieces: { piece: string; t: number }[] = [];
  const beats: Record<string, unknown> = {};
  let last = "";
  let rewards = 0, lessons = 0;
  let item = 0;
  let lastNext = "";
  let wait = 0;
  let shotAt = 0;
  let optinFrom = 0, optinSettled = 0;
  if (shots) mkdirSync(shots, { recursive: true });
  const think = (persona === "perfect" ? 1200 : 2600) / FAST;
  while (Date.now() - t0 < (8 * 60_000) / FAST) {
    const now = await pieceNow(page).catch(() => "?");
    let piece = now;
    if (now.startsWith("lesson:")) piece = now !== last && !last.startsWith("lesson:") ? `lesson ${++lessons}` : pieces.at(-1)!.piece;
    else if (now === "reward") piece = last !== "reward" ? `reward ${++rewards}` : pieces.at(-1)!.piece;
    if (now !== last) {
      if (last.startsWith("lesson:")) beats[pieces.at(-1)!.piece] = await page.evaluate(() => ({ beats: (window as any).__snBeats, result: (window as any).__snWarmup })).catch(() => null);
      pieces.push({ piece, t: Date.now() });
      last = now;
    }
    if (shots && Date.now() - shotAt > (EVERY * 1000) / FAST) {
      shotAt = Date.now();
      const g = Math.round(((Date.now() - t0) * FAST) / 1000);
      await page.screenshot({ path: `${shots}/${String(g).padStart(3, "0")}_${piece.replace(/[^a-z0-9]+/gi, "-")}.png` }).catch(() => {});
    }
    if (now === "map") {
      await page.waitForTimeout(6000 / FAST); // "Your Sticker Book lives here, on the map!"
      break;
    }
    // the screens before the game: tap Start, pick the player, let the film play (it can't be skipped the first
    // time), choose Kai
    if (now === "title") await page.locator('button[aria-label="Start"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    else if (now === "profiles") await page.locator('[aria-label="player Ninja"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    else if (now === "choose") await page.locator('[aria-label="kai"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    else if (now === "intro film") {
      // the film moves on by itself (a new child can't skip it): just watch
    } else {
      const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
      // a child answers after the question has been said, taking a moment to think
      if (st.scene === "warmup" && st.next) {
        if (!st.asked && st.beat !== "rail" && st.beat !== "dots") { await page.waitForTimeout(120); continue; }
        const key = `${st.beat}:${st.next}`;
        if (key !== lastNext) {
          lastNext = key;
          wait = Date.now() + think;
          // the learner gets about 1 in 3 first tries wrong
          if (persona === "learner" && ++item % 3 === 0) {
            await page.waitForTimeout(think);
            const wrong = await page.evaluate((next) => {
              const opts = [...document.querySelectorAll(".wu .wu-slot:not(.out) button.pcard, .wu button.wu-speed, .wu button.wu-rail-btn, .wu button.wu-bigdot")].map((b) => b.getAttribute("aria-label")).filter((l) => l && l !== next);
              return opts.at(-1) ?? null;
            }, st.next);
            if (wrong) {
              await page.locator(`.wu [aria-label="${wrong}"]`).first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
              await page.waitForTimeout(3500 / FAST);
              continue;
            }
          }
        }
        if (Date.now() < wait) { await page.waitForTimeout(80); continue; }
      }
      // the welcome: a child taps once Sensei has finished (her Help portrait stops talking), after a moment
      if (typeof st.scene === "string" && st.scene.startsWith("tut-")) {
        if (await page.locator(".help-btn.talking").count()) { await page.waitForTimeout(100); continue; }
        await page.waitForTimeout(think);
      }
      if (st.scene === "optin" && !optinFrom) optinFrom = Date.now();
      if (st.scene === "optin" && st.chosen && !optinSettled) optinSettled = Date.now();
      if (st.scene === "optin" && st.next && !st.settling) {
        if (!st.asked) { await page.waitForTimeout(120); continue; }
        await page.waitForTimeout(think);
      }
      await step(page).catch(() => {});
    }
    await page.waitForTimeout(150);
  }
  const { audio, taps } = await page.evaluate(() => ({ audio: (window as any).__audioLog ?? [], taps: (window as any).__taps ?? [] }));
  const save = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); return JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); } catch { return null; } });
  const game = (t: number) => Math.round(((t - t0) * FAST) / 100) / 10;
  const evs: Ev[] = [
    ...audio.map((a: any) => { const d = decode(a.url); return d ? { t: game(a.t), ...d } : null; }).filter(Boolean),
    ...taps.filter((x: any) => x.t >= t0).map((x: any) => ({ t: game(x.t), kind: "tap" as const, text: x.label })),
    ...pieces.map((p) => ({ t: game(p.t), kind: "piece" as const, text: p.piece })),
  ].sort((a, b) => a.t - b.t);
  const spans = pieces.map((p, i) => ({ piece: p.piece, start: game(p.t), secs: Math.round((((pieces[i + 1]?.t ?? Date.now()) - p.t) * FAST) / 100) / 10 }));
  const optinSettledS = optinSettled ? Math.round(((optinSettled - optinFrom) * FAST) / 100) / 10 : null;
  return { evs, spans, beats, optinSettledS, save: save && { schoolYear: save.schoolYear, band: save.band, seenPlacement: save.seenPlacement, stickers: save.stickers, shiny: save.shiny, firstSession: save.firstSession, adjustLog: save.adjustLog, warmups: save.warmups } };
}

function render(persona: string, r: Awaited<ReturnType<typeof play>>): string {
  const out = [`# The first five minutes (${persona} child${OPTIN !== "none" ? `, opt-in: ${OPTIN}` : ""})`, "", `Game seconds from the title tap (played at ${FAST}× and converted). Budgets from docs/FIRST_MINUTES.md §2 and §14.`, ""];
  out.push("| Piece | Starts | Took | Target | Hard cap | Verdict |", "|---|---|---|---|---|---|");
  let total = 0;
  for (const s of r.spans) {
    const base = s.piece.replace(/ \d$/, (m) => m);
    const b = BUDGET[base] ?? BUDGET[s.piece];
    if (s.piece !== "map" && s.piece !== "profiles") total += s.secs;
    const verdict = !b ? "" : s.piece === "opt-in" && r.optinSettledS != null ? (r.optinSettledS > 30 ? "settled after the cap" : `settled in ${r.optinSettledS} s`) : b.cap && s.secs > b.cap ? "over the cap" : s.secs > b.target ? "over target" : "within target";
    out.push(`| ${s.piece} | ${fmt(s.start)} | ${s.secs.toFixed(1)} s | ${b ? `${b.target} s` : ""} | ${b?.cap ? `${b.cap} s` : ""} | ${verdict} |`);
  }
  const mapAt = r.spans.find((s) => s.piece === "map")?.start;
  if (r.optinSettledS != null) out.push("", `The opt-in's cap is 30 s from first sight to a settled choice: **settled after ${r.optinSettledS} s** (the rest of the piece is Sensei confirming it and saying that grown-ups can change it).`);
  out.push("", `**Title to the map: ${mapAt != null ? fmt(mapAt) : "not reached"}** (target 4:34, cap 5:00).`, "");
  out.push("After the session the save holds:", "", "```json", JSON.stringify(r.save, null, 1), "```", "");
  out.push("## Beats in each lesson (lesson seconds; the governor's skips)", "");
  for (const [k, v] of Object.entries(r.beats)) out.push(`- **${k}**: ${JSON.stringify(v)}`);
  out.push("", "## Everything said and done", "");
  let words: string[] = [];
  const flush = () => {
    if (words.length) out.push(`        🔊 ${words.join(" · ")}`);
    words = [];
  };
  for (const e of r.evs) {
    if (e.kind === "sound" || e.kind === "word" || e.kind === "stretch") {
      words.push(e.kind === "word" ? `"${e.text}"` : e.kind === "stretch" ? `"${e.text}" (slowly)` : e.text);
      continue;
    }
    flush();
    const ts = `${fmt(e.t).padStart(6)}`;
    if (e.kind === "say") out.push(`${ts} SENSEI: ${e.text}`);
    else if (e.kind === "tap") out.push(`${ts}    > child taps: ${e.text}`);
    else if (e.kind === "piece") out.push("", `${ts} ===== ${e.text} =====`);
  }
  flush();
  return out.join("\n") + "\n";
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
await Promise.all(
  PERSONAS.map(async (persona) => {
    const ctx = await b.newContext({ viewport: { width: VIEW[0], height: VIEW[1] }, hasTouch: true });
    const page = await ctx.newPage();
    const r = await play(page, persona, SHOTS && `${SHOTS}/${persona}`);
    const name = `${persona}${OPTIN !== "none" ? `-${OPTIN}` : ""}`;
    writeFileSync(`${OUT}/${name}.json`, JSON.stringify(r, null, 1));
    writeFileSync(`${OUT}/${name}.md`, render(persona, r));
    console.log(`${name}: ${r.spans.map((s) => `${s.piece} ${s.secs}s`).join(" · ")}`);
    await ctx.close();
  }),
);
await b.close();
console.log(`→ ${OUT}`);
