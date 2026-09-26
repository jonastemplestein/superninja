// One continuous journey in ONE page, as a child really plays it: a brand-new child from the title tap through the
// first minutes (film, choose, opt-in, dojo welcome, W1, Sticker Book, W2, map), then every next stone from the map in
// order, with the rewards, World Flower trips and map walks between them. Nothing is reloaded between levels, so the
// in-memory state a real session builds up (teach.ts rotation counts, narrate.tsx's per-level caps, the streak, the
// particle layer) carries over exactly as it would on a phone. This is the transcript to read for repetition across
// levels ("A, two letters, one sound, A, two letters, one sound") that the one-level-per-page transcript.ts can't show.
//
// Records every clip said (line id and text, pure sounds, words, stretched words), every tap, every scene change, and
// which lines were CUT OFF (the next speech clip started before this clip's recorded duration had run: durations.json),
// plus a DOM-size sample every 10 game seconds (a cheap leak signal for the performance work).
//
// Output: playtest/transcripts/<out>/continuous-<persona>.{md,json}
// Usage: bun scripts/treadmill/continuous.ts [--base http://localhost:5173] [--persona learner,perfect] [--levels 12]
//        [--optin none] [--from w5-1] [--fast 4] [--out playtest/transcripts/<run>]
import { chromium, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { LEVELS } from "../../src/content/worlds";
import { teachEntry } from "../../src/content/phonics";
import { STORIES } from "../../src/content/stories";
import { step } from "./bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "4"));
const PERSONAS = arg("persona", "learner,perfect")!.split(",") as ("perfect" | "learner")[];
const OPTIN = arg("optin", "none")!;
/** stones to play from the map after the first minutes */
const LEVELS_AFTER = Number(arg("levels", "12"));
/** `--from w5-1`: skip the first minutes; the child has finished every level before this one (3 stars, their
 *  spellings met, their World Flower trips had) and starts at the map, where this is the next stone */
const FROM = arg("from");
const RUN = arg("out") ?? `playtest/transcripts/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
mkdirSync(RUN, { recursive: true });

const LINE = new Map(LINES.map((l) => [l.id, l]));
const PAGE = new Map(STORIES.flatMap((st) => st.pages.map((p) => [`${st.id}_${p.id}`, p.text] as const)));
const DUR: Record<string, number> = JSON.parse(readFileSync("public/a/durations.json", "utf8"));

type Ev = { t: number; kind: "say" | "sound" | "word" | "stretch" | "onset" | "story" | "tap" | "scene" | "piece"; who?: string; text: string; id?: string; dur?: number; cut?: boolean };

function decode(url: string): Omit<Ev, "t"> | null {
  let m;
  const dur = (k: string) => DUR[k];
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) {
    const l = LINE.get(m[1]);
    return { kind: "say", who: l?.who ?? "sensei", text: l?.text ?? `[line ${m[1]}]`, id: m[1], dur: dur(`l/${m[1]}`) };
  }
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return { kind: "sound", text: `/${m[1]}/`, id: `sound:${m[1]}`, dur: dur(`p/${m[1]}`) };
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return { kind: "word", text: m[1], id: `word:${m[1]}`, dur: dur(`w/${m[1]}`) };
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return { kind: "stretch", text: m[1], id: `stretch:${m[1]}`, dur: dur(`x/${m[1]}`) };
  if ((m = url.match(/\/a\/o\/([^/]+)\.mp3/))) return { kind: "onset", text: m[1], id: `onset:${m[1]}`, dur: dur(`o/${m[1]}`) };
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return { kind: "story", who: "sensei", text: PAGE.get(m[1]) ?? `[story ${m[1]}]`, id: `story:${m[1]}`, dur: dur(`s/${m[1]}`) };
  return null;
}

/** Which piece of the journey is on screen (the first minutes' pieces, then levels, rewards, trips and the map). */
const pieceNow = (page: Page) =>
  page.evaluate(() => {
    const q = (s: string) => !!document.querySelector(s);
    const st = (window as any).__snState ?? {};
    if (q(".oi")) return "opt-in";
    if (q(".st-reward")) return "sticker book";
    if (q(".scene.map")) return "map";
    if (st.scene === "reward") return "reward";
    if (st.scene === "tree") return "world flower";
    if (typeof st.scene === "string" && st.scene.startsWith("tut-")) return "dojo welcome";
    if (q(".scene.choose")) return "choose";
    if (q(".skip-film") || q("video")) return "intro film";
    if (q(".scene.title")) return "title";
    if (q('[aria-label^="player "]')) return "profiles";
    return "level";
  });

async function play(page: Page, persona: "perfect" | "learner") {
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  // a child part-way through: every earlier level done, its spellings met and its trips had
  const before = FROM ? LEVELS.slice(0, Math.max(0, LEVELS.findIndex((l) => l.id === FROM))) : [];
  const later = FROM
    ? {
        hero: "kai", seenIntro: true, seenTraining: true, seenPlacement: true, seenFlower: true, seenTimer: true, seenStreak: true, schoolYear: "R",
        stars: Object.fromEntries(before.map((l) => [l.id, 3])),
        petals: [...new Set(before.flatMap((l) => (l.teach ?? []).map((t) => t.split("=")[0])))],
        flowerSeen: [...new Set(before.flatMap((l) => (l.teach ?? []).map((t) => { const sg = teachEntry(t); return `spelling:${sg.g === "x" ? "x>ks" : `${sg.g}>${sg.p}`}`; })).concat(before.map((l) => `world:${l.world}`)))],
        sessions: 8, minutes: 90,
      }
    : {};
  await page.evaluate((later) => {
    localStorage.clear();
    const id = "pcont";
    localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: (later as any).hero ?? null, created: Date.now(), last: Date.now() }], current: id }));
    localStorage.setItem(`superninja.save.${id}`, JSON.stringify({ v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true, ...later }));
    sessionStorage.setItem("sn.setup", "done");
  }, later);
  await page.addInitScript((o) => {
    (window as any).__audioLog = [];
    (window as any).__taps = [];
    (window as any).__botOptIn = o;
    addEventListener("pointerdown", (e) => {
      const el = (e.target as Element).closest?.("[aria-label], button, .tile, .card");
      (window as any).__taps.push({ t: Date.now(), label: el?.getAttribute("aria-label") || (el?.textContent ?? "").trim().slice(0, 30) || "(somewhere)" });
    }, true);
  }, OPTIN);
  await page.goto(`${BASE}/play/?fast=${FAST}`);
  await page.waitForTimeout(600);
  const t0 = Date.now();
  const pieces: { t: number; text: string }[] = [];
  const scenes: { t: number; text: string }[] = [];
  const dom: { t: number; nodes: number; fx: number }[] = [];
  let last = "";
  let lastScene = "";
  let stones = 0;
  let lastStone = "";
  let item = 0;
  let lastNext = "";
  let wait = 0;
  let domAt = 0;
  let finished = false;
  const think = (persona === "perfect" ? 1200 : 2600) / FAST;
  const down = (sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).then(() => true).catch(() => false);
  while (Date.now() - t0 < (70 * 60_000) / FAST) {
    const now = await pieceNow(page).catch(() => "?");
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    if (now !== last) {
      pieces.push({ t: Date.now(), text: now === "level" ? `level ${lastStone || "(first minutes)"}` : now });
      last = now;
    }
    if (st.scene && st.scene !== lastScene) {
      scenes.push({ t: Date.now(), text: st.scene });
      lastScene = st.scene;
    }
    if (Date.now() - domAt > 10_000 / FAST) {
      domAt = Date.now();
      const s = await page.evaluate(() => ({ nodes: document.getElementsByTagName("*").length, fx: document.querySelector(".fx-layer, .fx")?.childElementCount ?? 0 })).catch(() => null);
      if (s) dom.push({ t: Date.now(), ...s });
    }
    // before the game: tap Start, pick the player, watch the film (each shot holds on Next), choose Kai and go on
    const pre: any = ["title", "profiles", "choose", "intro film"].includes(now) ? await page.evaluate(() => (window as any).__snNav ?? null).catch(() => null) : null;
    if (pre?.next === "ready") {
      await page.waitForTimeout(think);
      await down('[data-nav="next"]');
    } else if (now === "title") await down('button[aria-label="Start"]');
    else if (now === "profiles") await down('[aria-label="player Ninja"]');
    else if (now === "choose") {
      if (!st.picked) await down('[aria-label="kai"]');
    } else if (now === "intro film") {
      // the film plays its shot; the nav branch above taps Next when it holds
    } else if (now === "map") {
      if (stones >= LEVELS_AFTER && !finished) {
        finished = true;
        await page.waitForTimeout(6000 / FAST); // the map's arrival line
        break;
      }
      // wait for the map's arrival speech and the walk to the next stone, then tap the gold stone
      if (st.next && st.next !== lastStone) {
        await page.waitForTimeout(3500 / FAST);
        if (await down(`[aria-label="level ${st.next}"]`)) {
          lastStone = st.next;
          stones++;
          pieces.push({ t: Date.now(), text: `stone ${stones}: ${st.next}` });
        }
      } else if (st.next) await down(`[aria-label="level ${st.next}"]`);
    } else {
      // a held step: tap the green arrow once it's ready, even beside "Play again" (a child going on, not the harness
      // ending its case as bot.ts does)
      const nav: any = await page.evaluate(() => (window as any).__snNav ?? null).catch(() => null);
      if (nav?.next === "ready" && !(st.scene === "warmup" && st.next)) {
        await page.waitForTimeout(think);
        await down('[data-nav="next"]');
        await page.waitForTimeout(150);
        continue;
      }
      // warm-ups: answer after the question, with a think; the learner gets about 1 in 3 first tries wrong
      if (st.scene === "warmup" && st.next) {
        if (!st.asked && st.beat !== "rail" && st.beat !== "dots") { await page.waitForTimeout(120); continue; }
        const key = `${st.beat}:${st.next}`;
        if (key !== lastNext) {
          lastNext = key;
          wait = Date.now() + think;
          if (persona === "learner" && ++item % 3 === 0) {
            await page.waitForTimeout(think);
            const wrong = await page.evaluate((next) => {
              const opts = [...document.querySelectorAll(".wu .wu-slot:not(.out) button.pcard, .wu button.wu-speed, .wu button.wu-rail-btn, .wu button.wu-bigdot")].map((b) => b.getAttribute("aria-label")).filter((l) => l && l !== next);
              return opts.at(-1) ?? null;
            }, st.next);
            if (wrong) {
              await down(`.wu [aria-label="${wrong}"]`);
              await page.waitForTimeout(3500 / FAST);
              continue;
            }
          }
        }
        if (Date.now() < wait) { await page.waitForTimeout(80); continue; }
      } else if (st.next && st.scene !== "optin" && st.scene !== "map") {
        // other games: a new question, a think, and the learner's wrong first try on every third
        const key = `${st.scene}:${st.next}:${st.pos ?? ""}:${st.tapIdx ?? ""}`;
        if (key !== lastNext) {
          lastNext = key;
          wait = Date.now() + think;
          if (persona === "learner" && ++item % 3 === 0) {
            const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"])`).first();
            if (await wrong.count()) {
              await page.waitForTimeout(think);
              await wrong.dispatchEvent("pointerdown").catch(() => {});
              await page.waitForTimeout(3500 / FAST);
              continue;
            }
          }
        }
        if (Date.now() < wait) { await page.waitForTimeout(80); continue; }
      }
      if (typeof st.scene === "string" && st.scene.startsWith("tut-")) {
        if (await page.locator(".help-btn.talking").count()) { await page.waitForTimeout(100); continue; }
        await page.waitForTimeout(think);
      }
      if (st.scene === "optin" && st.next && !st.settling) {
        if (!st.asked) { await page.waitForTimeout(120); continue; }
        await page.waitForTimeout(think);
      }
      await step(page).catch(() => {});
    }
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);
  const { audio, taps } = await page.evaluate(() => ({ audio: (window as any).__audioLog ?? [], taps: (window as any).__taps ?? [] }));
  const game = (t: number) => Math.round(((t - t0) * FAST) / 100) / 10;
  const speech: Ev[] = audio.filter((a: any) => a.kind === "speech").map((a: any) => { const d = decode(a.url); return d ? { t: game(a.t), ...d } : null; }).filter(Boolean);
  // a clip is cut off when the next speech clip starts before it could have finished (its recorded length, less 150 ms)
  for (let i = 0; i + 1 < speech.length; i++) {
    const e = speech[i];
    if (e.dur && speech[i + 1].t < e.t + e.dur / 1000 - 0.15) e.cut = true;
  }
  const tapEvs: Ev[] = [];
  for (const x of taps.filter((x: any) => x.t >= t0 && x.label !== "(somewhere)")) {
    const t = game(x.t);
    if (tapEvs.some((o) => o.text === x.label && t - o.t < 2)) continue;
    tapEvs.push({ t, kind: "tap", text: x.label });
  }
  const evs: Ev[] = [
    ...speech,
    ...tapEvs,
    ...scenes.map((s) => ({ t: game(s.t), kind: "scene" as const, text: s.text })),
    ...pieces.map((p) => ({ t: game(p.t), kind: "piece" as const, text: p.text })),
  ].sort((a, b) => a.t - b.t);
  return { evs, dom: dom.map((d) => ({ t: game(d.t), nodes: d.nodes, fx: d.fx })), stones };
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
function render(persona: string, r: Awaited<ReturnType<typeof play>>): string {
  const out = [
    `# One continuous journey (${persona} child, ${FROM ? `from ${FROM}` : `opt-in: ${OPTIN}`})`,
    "",
    `${FROM ? `A child who has finished every level before ${FROM}, from the title tap` : "A brand-new child from the title tap through the first minutes"}, then ${r.stones} stones from the map, in one page. Game time (played at ${FAST}×). ✂ marks a clip cut off by the next one.`,
    "",
  ];
  let words: string[] = [];
  const flush = () => {
    if (words.length) out.push(`          🔊 ${words.join(" · ")}`);
    words = [];
  };
  for (const e of r.evs) {
    if (e.kind === "sound" || e.kind === "word" || e.kind === "stretch" || e.kind === "onset") {
      const w = e.kind === "word" ? `"${e.text}"` : e.kind === "stretch" ? `"${e.text}" (slowly)` : e.kind === "onset" ? `"${e.text}" (first sound held)` : e.text;
      words.push(e.cut ? `${w}✂` : w);
      continue;
    }
    flush();
    const ts = fmt(e.t).padStart(7);
    if (e.kind === "say") out.push(`${ts} ${e.who === "baron" ? "BARON" : "SENSEI"}: ${e.text}${e.cut ? " ✂" : ""}  ‹${e.id}›`);
    else if (e.kind === "story") out.push(`${ts} STORY: ${e.text}${e.cut ? " ✂" : ""}`);
    else if (e.kind === "tap") out.push(`${ts}     > child taps: ${e.text}`);
    else if (e.kind === "scene") out.push(`${ts}     --- ${e.text} ---`);
    else if (e.kind === "piece") out.push("", `${ts} ===== ${e.text} =====`);
  }
  flush();
  out.push("", "## Page size over time (DOM elements; fx layer children)", "", r.dom.map((d) => `${fmt(d.t)} ${d.nodes}/${d.fx}`).join(" · "));
  return out.join("\n") + "\n";
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
await Promise.all(
  PERSONAS.map(async (persona) => {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
    const page = await ctx.newPage();
    const r = await play(page, persona);
    writeFileSync(`${RUN}/continuous-${persona}${FROM ? `-from-${FROM}` : ""}.json`, JSON.stringify(r, null, 1));
    writeFileSync(`${RUN}/continuous-${persona}${FROM ? `-from-${FROM}` : ""}.md`, render(persona, r));
    console.log(`${persona}: ${r.stones} stones, ${r.evs.filter((e) => e.kind === "say").length} lines, ${r.evs.filter((e) => e.cut).length} cut off`);
    await ctx.close();
  }),
);
await b.close();
console.log(`→ ${RUN}`);
