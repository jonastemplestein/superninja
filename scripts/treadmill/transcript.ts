// The game as a text adventure: bots play the journey in order (training, placement, then every level), and we record
// everything the game SAID (Sensei/Baron lines as text, pure sounds, words, stretched words, story pages) and everything
// the child DID (every tap), plus key sounds (right/wrong). Two personas: "perfect" and "learner" (about 1 in 3 first
// tries wrong, so corrections and help appear). Output: playtest/transcripts/<run>/{journey-<persona>.md,.json}.
// This is the material for the explanation audit ("is anything never explained? mentioned once but needed three times?").
// Navigation (docs/NAVIGATION.md §5.E): taps on the nav controls read "TAP Next", "TAP Hear it again"...; each wait on a
// ready Next is a line "[holds on Next: <step>, 1.2 s]", so the audit sees where a child sat; and the game's own nav log
// (window.__snNavLog: every nav tap and step change) is written beside the journey as navlog-<persona>.json.
// The teacher's voice (TEACHER_SCRIPT §2.3, FIX_PLAN §13 TV-F4.2): a Ready hold (a held step whose id starts "ready:") is
// written as "[ready: <id>: TAP Next after 1.4 s]", or TAP Show me again, TAP board: sock, TAP answer: sock (the nav log's
// own answer when it logs one, else the first tap); the paw's moves in a demo (nav log "paw") are written too.
// Besides training, placement and the levels, it plays the shows around them: the film, Choose, the opt-in, a level's
// reward and a sticker reward, the World Flower's first visit and its trips, and the finale. A show case is over once the
// child has left it with Next (`leave`: window.__snRoute is no longer that route) or once it has settled (`done`).
// Usage: bun scripts/treadmill/transcript.ts [--base http://localhost:5173] [--only w1-wu1,w1-2] [--persona perfect,learner] [--out dir]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../../src/content/worlds";
import { LINES } from "../../src/content/lines";
import { STORIES } from "../../src/content/stories";
import { decodeForTranscript } from "../../src/content/templates-decode";
import { save, step, FLOWER_SAVE, unlockAudio } from "./bot";
import { helpGuard } from "../lib/help";
helpGuard(import.meta.url); // --help prints the usage above and exits, before anything runs

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
const PAGE = new Map<string, string>(STORIES.flatMap((st) => st.pages.map((p) => [`${st.id}_${p.id}`, p.text] as const)));

/** `url`: the clip that played (speech events), so scripts/treadmill/joins.ts can rebuild what the child heard. */
type Ev = { t: number; kind: "say" | "sound" | "word" | "stretch" | "onset" | "story" | "tap" | "nav" | "hold" | "ready" | "paw" | "sfx" | "scene"; who?: string; text: string; url?: string };
/** `leave`: the case is over once the route (window.__snRoute) is no longer this one; the bot taps Next at the end (even
 *  beside a reward's Play again). `done`: runs in the page; the case is over once it is true. */
type Case = { name: string; url: string; title: string; save: object; leave?: string; done?: () => boolean };
const CASES: Case[] = [
  // the first minutes, in play order (docs/FIRST_MINUTES.md): the film, Choose, the opt-in, then the welcome
  { name: "intro", url: "/play/?scene=intro", title: "The opening film (8 shots, each on Next)", save: save({ seenIntro: false, hero: null }), leave: "intro" },
  { name: "choose", url: "/play/?scene=choose", title: "Choose your ninja", save: save({ seenIntro: false, hero: null }), leave: "choose" },
  { name: "optin", url: "/play/?scene=optin", title: "Opt-in: \"Do you go to big school yet?\" (not yet)", save: save({ seenPlacement: false, seenTraining: false, stars: {} }), leave: "optin" },
  { name: "training", url: "/play/?scene=training", title: "Ninja Training (tutorial)", save: save({ seenTraining: false }) },
  { name: "placement", url: "/play/?scene=placement", title: "Show Sensei (placement)", save: save({ seenPlacement: false }) },
  ...LEVELS.map((l): Case => ({ name: l.id, url: `/play/?level=${l.id}`, title: `${WORLDS[l.world - 1].name} ${l.id}: ${l.kind}`, save: save() })),
  // the rewards on their own, played to their Next: a warm-up's sticker reward and a level's reward
  { name: "reward-stickers", url: "/play/?scene=reward&id=w1-wu1", title: "Sticker reward (after warm-up 1)", save: save({ stars: {} }), leave: "reward" },
  { name: "reward", url: "/play/?scene=reward&id=w1-6", title: "Level reward (w1-6)", save: save(), leave: "reward" },
  // the World Flower: the first visit's intro (over once the flower is free to explore), and the trips (over on Next)
  { name: "flower-intro", url: "/play/?scene=tree", title: "World Flower: the first visit", save: { ...FLOWER_SAVE, seenFlower: false }, done: () => (window as any).__snState?.scene === "tree" && (window as any).__snState.step === "free" },
  { name: "trip-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", title: "World Flower trip: new spellings found", save: FLOWER_SAVE, leave: "tree" },
  { name: "trip-world", url: "/play/?scene=tree&visit=world:3", title: "World Flower trip: the start of a new land", save: FLOWER_SAVE, leave: "tree" },
  { name: "trip-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", title: "World Flower trip: a gem won", save: FLOWER_SAVE, leave: "tree" },
  { name: "finale", url: "/play/?scene=finale", title: "The finale", save: save(), leave: "finale" },
].filter((c) => !ONLY || ONLY.includes(c.name));

function decode(url: string): Omit<Ev, "t"> | null {
  let m;
  // a templated clip (/a/t/, docs/SPEECH_TEMPLATES.md): its text, from the template registry
  const tpl = decodeForTranscript(url);
  if (tpl) return tpl;
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
      const nav = (e.target as Element).closest("[data-nav]")?.getAttribute("data-nav") ?? null;
      (window as any).__taps.push({ t: Date.now(), label, nav });
    }, true);
  });
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...c.save, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.goto(`${BASE}${c.url}&fast=${FAST}`);
  await unlockAudio(page); // (not a click at the top: it landed on whatever was there)
  const t0 = Date.now();
  let lastScene = "";
  const scenes: Ev[] = [];
  // waits on a ready Next: when it turned ready, which step, and when the loop saw it go (the Next tap, if any, ends it)
  const seen: { t: number; step: string; end: number | null }[] = [];
  let hold: { t: number; step: string } | null = null;
  let item = 0;
  while (Date.now() - t0 < 150_000) {
    const again = (await page.locator('button[aria-label="Play again"]').count()) > 0;
    if (c.leave) {
      const r = await page.evaluate(() => String((window as any).__snRoute ?? "")).catch(() => "");
      if (r && r.split(":")[0] !== c.leave) break;
    } else if (again) break;
    if (c.done && (await page.evaluate(c.done).catch(() => false))) break;
    if (c.name === "training" || c.name === "placement") {
      const done = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return s.seenTraining && s.seenPlacement; } catch { return false; } });
      if (done) break;
    }
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    const nav: any = await page.evaluate(() => (window as any).__snNav ?? null).catch(() => null);
    if (nav?.next === "ready" && !hold) hold = { t: Date.now(), step: nav.pres ? `${nav.pres.id} ${nav.pres.step + 1}/${nav.pres.of}` : st.scene ?? "?" };
    else if (nav?.next !== "ready" && hold) {
      seen.push({ ...hold, end: Date.now() });
      hold = null;
    }
    if (st.scene && st.scene !== lastScene) {
      scenes.push({ t: Date.now(), kind: "scene", text: st.scene });
      lastScene = st.scene;
    }
    // the learner gets about 1 in 3 answerable items wrong on the first try
    if (persona === "learner" && st.next && ++item % 3 === 0) {
      const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
      if (await wrong.count()) {
        await wrong.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
        await page.waitForTimeout(900);
      }
    }
    // (the bot leaves Next alone beside Play again, where a level's case ends; a show case goes on with it)
    if (c.leave && again && nav?.next === "ready") await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
    else await step(page).catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1500); // let the end-of-level speech land in the log
  if (hold) seen.push({ ...hold, end: null });
  const { audio, taps, navlog, off } = await page.evaluate(() => ({ audio: (window as any).__audioLog ?? [], taps: (window as any).__taps ?? [], navlog: (window as any).__snNavLog ?? [], off: Date.now() - performance.now() }));
  navlogs[c.name] = navlog.map((e: any) => ({ ...e, t: Math.round(e.t + off) }));
  const secs = (a: number, b: number) => `${((Math.max(0, b - a) * FAST) / 1000).toFixed(1)} s`;
  const holds: Ev[] = seen.map((h) => {
    if (/^ready:/.test(h.step)) {
      // a Ready: how the child answered it (the nav log's { kind: "ready", how, label }, else the first tap)
      const logged = navlog.map((e: any) => ({ ...e, t: e.t + off })).find((e: any) => e.kind === "ready" && e.how && e.t >= h.t - 100 && (h.end == null || e.t <= h.end + 800));
      const tap = taps.find((x: any) => x.t >= h.t - 50 && (h.end == null || x.t <= h.end + 800));
      const how = logged ? ({ next: "TAP Next", show: "TAP Show me again", board: `TAP board: ${logged.label ?? "?"}`, answer: `TAP answer: ${logged.label ?? "?"}` } as Record<string, string>)[logged.how] ?? logged.how : tap ? (tap.nav === "next" ? "TAP Next" : tap.nav === "show" ? "TAP Show me again" : `TAP board: ${tap.label}`) : null;
      const end = logged?.t ?? tap?.t ?? h.end;
      return { t: h.t, kind: "ready" as const, text: `${h.step.replace(/^ready:/, "").replace(/ 1\/1$/, "")}: ${how ?? "no tap"}${end == null ? ", still waiting at the end" : ` after ${secs(h.t, end)}`}` };
    }
    const tap = taps.find((x: any) => x.nav === "next" && x.t >= h.t - 50 && (h.end == null || x.t <= h.end));
    const end = tap?.t ?? h.end;
    return { t: h.t, kind: "hold" as const, text: end == null ? `${h.step}, still waiting at the end` : `${h.step}, ${secs(h.t, end)}` };
  });
  const paws: Ev[] = navlog.filter((e: any) => e.kind === "paw" || e.kind === "demo").map((e: any) => ({ t: e.t + off, kind: "paw" as const, text: e.id ?? e.to ?? e.kind }));
  const evs: Ev[] = [
    ...audio.map((a: any) => { const d = decode(a.url); return d ? { t: a.t, ...d, ...(a.url.startsWith("/a/") ? { url: a.url } : {}) } : null; }).filter(Boolean),
    ...taps.map((x: any) => ({ t: x.t, kind: x.nav ? ("nav" as const) : ("tap" as const), text: x.label })),
    ...holds,
    ...paws,
    ...scenes,
  ];
  const start = Math.min(...evs.map((e) => e.t), t0);
  const sorted = evs.sort((a, b) => a.t - b.t).map((e) => ({ ...e, t: Math.round(((e.t - start) * FAST) / 100) / 10 })); // game-time seconds
  // the bot re-taps while the game is still talking: keep one tap per thing per 2 s; drop the audio-unlock tap
  const out: Ev[] = [];
  for (const e of sorted) {
    if ((e.kind === "tap" || e.kind === "nav") && (e.text === "(somewhere)" || out.some((o) => o.kind === e.kind && o.text === e.text && e.t - o.t < 2))) continue;
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
    else if (e.kind === "nav") out.push(`${ts}   > TAP ${e.text}`);
    else if (e.kind === "hold") out.push(`${ts}   [holds on Next: ${e.text}]`);
    else if (e.kind === "ready") out.push(`${ts}   [ready: ${e.text}]`);
    else if (e.kind === "paw") out.push(`${ts}   (the paw: ${e.text})`);
    else if (e.kind === "sfx") out.push(`${ts}   [${e.text}]`);
    else if (e.kind === "scene") out.push(`${ts}   --- ${e.text} ---`);
  }
  flush();
  return out.join("\n") + "\n";
}

/** The game's nav log per case (window.__snNavLog, times on Date.now()), for the current persona. */
let navlogs: Record<string, unknown[]> = {};
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const persona of PERSONAS) {
  navlogs = {};
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
  writeFileSync(`${RUN}/navlog-${persona}.json`, JSON.stringify(navlogs, null, 1));
  writeFileSync(`${RUN}/journey-${persona}.md`, `# The journey as a text adventure (${persona} child)\n\nEverything the game said and everything the child did, level by level, in play order. Times are game seconds.\n\n` + results.map((r) => render(r.title, r.events)).join("\n"));
}
await b.close();
console.log(`→ ${RUN}`);
