// Sound display probe (docs/SOUND_DISPLAY.md): does the child SEE a sound's petal whenever the game presents that sound?
// Bots play levels and scenes on an 844×390 phone viewport. Every time a pure sound clip (/a/p/<id>.mp3) starts, an
// in-page hook checks, at that instant, whether that sound's petal is visible: a SoundBadge (.sound-badge[data-p]), a
// BigPetal ([data-petal]), a petal on the chart scroll, or a World Flower petal showing its picture. Lines that talk
// about sounds ("It's two letters, but it's one sound", "You won back a sound!") are checked the same way. Frames are
// taken for the first few misses per context. Output: playtest/runs/sound-display/<run>/{log.json, summary.md, frames/}
// (git-ignored: the frames run to hundreds of megabytes).
// Usage: bun scripts/treadmill/sound-display.ts [--base http://localhost:5173] [--only w1-2,w2-1] [--persona perfect,learner] [--fast 3]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { save, step } from "./bot";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "3"));
const ONLY = arg("only")?.split(",");
const PERSONAS = arg("persona", "perfect,learner")!.split(",") as ("perfect" | "learner")[];
const RUN = arg("out") ?? `playtest/runs/sound-display/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
mkdirSync(`${RUN}/frames`, { recursive: true });

const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});
type Case = { name: string; url: string; save?: object; ms?: number };
const CASES: Case[] = [
  { name: "w1-wu1", url: "/play/?level=w1-wu1" },
  { name: "w1-wu2", url: "/play/?level=w1-wu2" },
  // Reward 2 (the Sticker Book open, "They all start with... /s/", the first petal): the book has been seen before
  { name: "reward2", url: "/play/?level=w1-wu2", save: save({ seenBook: true, stickers: ["sun", "sock", "cat"] }) },
  { name: "w1-wu3", url: "/play/?level=w1-wu3" },
  { name: "w1-wu5", url: "/play/?level=w1-wu5" },
  { name: "w1-wu6", url: "/play/?level=w1-wu6" },
  { name: "w1-2", url: "/play/?level=w1-2" },
  { name: "w1-4", url: "/play/?level=w1-4" },
  { name: "w1-6", url: "/play/?level=w1-6" },
  { name: "w1-7", url: "/play/?level=w1-7" },
  { name: "w1-8", url: "/play/?level=w1-8" },
  { name: "w1-9", url: "/play/?level=w1-9" },
  { name: "w1-14", url: "/play/?level=w1-14" },
  { name: "w2-1", url: "/play/?level=w2-1" },
  { name: "w3-6", url: "/play/?level=w3-6" },
  { name: "w5-1", url: "/play/?level=w5-1" },
  { name: "w5-6", url: "/play/?level=w5-6" },
  { name: "w6-br1", url: "/play/?level=w6-br1" },
  { name: "w6-1", url: "/play/?level=w6-1" },
  { name: "w6-2", url: "/play/?level=w6-2" },
  { name: "placement", url: "/play/?scene=placement", save: save({ seenPlacement: false }) },
  { name: "training", url: "/play/?scene=training", save: save({ seenTraining: false }) },
  { name: "flower-intro", url: "/play/?scene=tree", save: save({ seenFlower: false }) },
  { name: "tree-free", url: "/play/?scene=tree", save: FLOWER_SAVE, ms: 25_000 },
  { name: "tree-petal", url: "/play/?scene=tree&gem=ai>ae&open=1", save: FLOWER_SAVE, ms: 25_000 },
  { name: "tree-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", save: FLOWER_SAVE },
  { name: "tree-found-th", url: "/play/?scene=tree&visit=spelling:th>dh", save: FLOWER_SAVE },
  { name: "tree-world", url: "/play/?scene=tree&visit=world:3", save: FLOWER_SAVE },
  { name: "tree-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", save: FLOWER_SAVE },
  { name: "trial", url: "/play/?trial=ai>ae", save: FLOWER_SAVE },
].filter((c) => !ONLY || ONLY.includes(c.name));

/** lines that talk about a sound: when one plays, is a petal on screen? */
const SOUND_TALK = LINES.filter((l) => /\bsounds?\b|\bpetals?\b/i.test(l.text)).map((l) => l.id);

type Ev = {
  t: number; kind: "sound" | "talk"; p: string; line?: string; prev: string | null; seen: boolean; how: string | null; others: string[];
  scene: string | null; route: string | null; pres: string | null; navSound: string | null; blend: boolean; persona?: string; case?: string; frame?: string;
};

async function play(page: Page, c: Case, persona: "perfect" | "learner") {
  await page.addInitScript((talk: string[]) => {
    const w = window as any;
    const TALK = new Set(talk);
    const log: any[] = [];
    w.__sdLog = log;
    let prev: string | null = null, prevT = 0, prevWasSound = false;
    const vis = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.25) return false;
      }
      return true;
    };
    /** Every sound petal on screen right now (with its picture), and how it is drawn. */
    const petals = () => {
      const out: { p: string; how: string }[] = [];
      document.querySelectorAll(".sound-badge[data-p]").forEach((e) => vis(e) && out.push({ p: e.getAttribute("data-p")!, how: `SoundBadge ${Math.round(e.getBoundingClientRect().width)}px` }));
      document.querySelectorAll("[data-petal]").forEach((e) => vis(e) && out.push({ p: e.getAttribute("data-petal")!, how: `BigPetal ${Math.round(e.getBoundingClientRect().width)}px` }));
      document.querySelectorAll('[role="button"][data-p]').forEach((e) => vis(e) && e.querySelector("img") && out.push({ p: e.getAttribute("data-p")!, how: "ScrollPetal" }));
      document.querySelectorAll("svg path[data-p]").forEach((e) => {
        const g = e.parentElement;
        if (g && g.querySelector("image") && vis(e)) out.push({ p: e.getAttribute("data-p")!, how: `WorldFlower petal ${Math.round(e.getBoundingClientRect().width)}px` });
      });
      return out;
    };
    const ctx = () => ({ scene: w.__snState?.scene ?? null, route: w.__snRoute ? String(w.__snRoute) : null, pres: w.__snNav?.pres ? `${w.__snNav.pres.id}#${w.__snNav.pres.step}` : null, navSound: w.__snNav?.sound ?? null });
    const arr: any[] = [];
    arr.push = function (...items: any[]) {
      for (const it of items) {
        const url: string = it?.url ?? "";
        let m = url.match(/\/a\/p\/([^/]+)\.mp3/);
        const now = performance.now();
        if (m) {
          const p = m[1];
          const all = petals();
          const mine = all.find((x) => x.p === p);
          const blend = prevWasSound && now - prevT < 1500;
          log.push({ t: now, kind: "sound", p, prev, seen: !!mine, how: mine?.how ?? null, others: all.filter((x) => x.p !== p).map((x) => x.p), blend, ...ctx() });
          prevWasSound = true;
          prevT = now;
          continue;
        }
        m = url.match(/\/a\/l\/([^/]+)\.mp3/);
        if (m) {
          const id = m[1];
          if (TALK.has(id)) {
            const all = petals();
            log.push({ t: now, kind: "talk", p: all[0]?.p ?? "", line: id, prev, seen: all.length > 0, how: all[0]?.how ?? null, others: all.slice(1).map((x) => x.p), blend: false, ...ctx() });
          }
          prev = id;
          prevWasSound = false;
          prevT = now;
        } else if (/\/a\/(w|x|o|s)\//.test(url)) {
          prev = url.split("/").slice(-2).join("/").replace(".mp3", "");
          prevWasSound = false;
        }
      }
      return Array.prototype.push.apply(this, items);
    };
    w.__audioLog = arr;
  }, SOUND_TALK);
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save ?? save()), settings: { relaxed: false, music: 0, captions: false, unlockAll: true } });
  await page.goto(`${BASE}${c.url}&fast=${FAST}`);
  await page.mouse.click(420, 4);
  const t0 = Date.now();
  let seenN = 0, item = 0, endAt = 0;
  const shots = new Map<string, number>();
  const evs: Ev[] = [];
  while (Date.now() - t0 < (c.ms ?? 170_000)) {
    // after the level: stay on the reward a while (what it says about sounds), then stop. (The Sticker Book reward's
    // steps hold on Next: the bot taps it, so its steps play through too.)
    if (!endAt && (await page.locator('button[aria-label="Play again"]').count())) endAt = Date.now();
    if (endAt && Date.now() - endAt > (c.name === "reward2" ? 40_000 : 9000)) break;
    const log: Ev[] = await page.evaluate(() => (window as any).__sdLog ?? []).catch(() => []);
    for (const e of log.slice(seenN)) {
      // a frame for the first two events per (scene, lead line, kind, seen): what the child saw as the sound played
      const k = `${e.kind}|${e.scene}|${e.line ?? e.prev}|${e.seen}|${e.blend}`;
      const n = shots.get(k) ?? 0;
      if (n < (e.seen ? 1 : 2)) {
        shots.set(k, n + 1);
        const file = `${c.name}-${persona}-${String(evs.length).padStart(3, "0")}-${e.kind}-${e.p || e.line}-${e.seen ? "petal" : "NONE"}.png`;
        await page.screenshot({ path: `${RUN}/frames/${file}` }).catch(() => {});
        e.frame = file;
      }
      evs.push({ ...e, persona, case: c.name });
    }
    seenN = log.length;
    if (endAt) {
      // Reward 2's held steps: Next once each step has finished (the stickers, then the first petal)
      if (c.name === "reward2" && (await page.evaluate(() => (window as any).__snNav?.next === "ready").catch(() => false)))
        await page.locator('[data-nav="next"]').first().dispatchEvent("pointerdown").catch(() => {});
      await page.waitForTimeout(250);
      continue;
    }
    const st: any = await page.evaluate(() => (window as any).__snState ?? {}).catch(() => ({}));
    if (persona === "learner" && st.next && !st.busy && ++item % 3 === 0) {
      const wrong = page.locator(`button.tile:not([aria-label="${st.next}"]), .pick-row button:not([aria-label="${st.next}"]), .wu-slot:not(.out) button:not([aria-label="${st.next}"])`).first();
      if (await wrong.count()) {
        await wrong.dispatchEvent("pointerdown").catch(() => {});
        await page.waitForTimeout(900);
      }
    }
    // the free World Flower: open a petal, then its panel, as a child exploring would
    if (c.name === "tree-free" && Date.now() - t0 > 6000 && Date.now() - t0 < 6400) await page.locator('svg path[data-p="a"]').first().dispatchEvent("pointerdown").catch(() => {});
    await step(page).catch(() => {});
    await page.waitForTimeout(200);
  }
  if (!evs.length || !evs.some((e) => e.frame)) await page.screenshot({ path: `${RUN}/frames/${c.name}-${persona}-end.png` }).catch(() => {});
  return evs;
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const all: Ev[] = [];
const jobs = PERSONAS.flatMap((persona) => CASES.map((c) => ({ c, persona })));
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < jobs.length) {
      const { c, persona } = jobs[next++];
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
      const page = await ctx.newPage();
      const evs = await play(page, c, persona).catch((e) => (console.log(`${c.name} ${persona}: ERROR ${String(e).slice(0, 200)}`), [] as Ev[]));
      all.push(...evs);
      await ctx.close();
      const s = evs.filter((e) => e.kind === "sound");
      console.log(`${persona} ${c.name}: ${s.length} sounds, ${s.filter((e) => !e.seen && !e.blend).length} alone without a petal, ${s.filter((e) => e.blend).length} in blends`);
    }
  }),
);
await b.close();
writeFileSync(`${RUN}/log.json`, JSON.stringify(all, null, 1));

// ---- summary: per case, per context (scene + the line said before the sound), how often the petal was there
const rows = new Map<string, { case: string; scene: string | null; ctx: string; kind: string; n: number; seen: number; blend: number; how: Set<string>; ps: Set<string>; frame?: string }>();
for (const e of all) {
  const ctxt = e.kind === "talk" ? `line ${e.line}` : e.blend ? "(inside a blend: sound after sound)" : `after ${e.prev ?? "(nothing)"}`;
  const k = `${e.case}|${e.scene}|${ctxt}|${e.kind}`;
  const r = rows.get(k) ?? { case: e.case!, scene: e.scene, ctx: ctxt, kind: e.kind, n: 0, seen: 0, blend: 0, how: new Set<string>(), ps: new Set<string>() };
  r.n++;
  if (e.seen) r.seen++;
  if (e.blend) r.blend++;
  if (e.how) r.how.add(e.how.replace(/ \d+px/, ""));
  if (e.p) r.ps.add(e.p);
  if (!r.frame && e.frame) r.frame = e.frame;
  rows.set(k, r);
}
const lines = [
  "# Sound display probe",
  "",
  `Run ${RUN}, fast=${FAST}, 844×390, personas: ${PERSONAS.join(", ")}. A row is one context: the scene and the clip said just before the sound (or the line that talks about sounds). "Petal" counts the times the sound's own petal was visible as its clip started.`,
  "",
  "| case | scene | context | kind | sounds | petal visible | drawn as | frame |",
  "|---|---|---|---|---|---|---|---|",
  ...[...rows.values()].sort((a, b) => a.case.localeCompare(b.case) || b.n - b.seen - (a.n - a.seen)).map((r) => `| ${r.case} | ${r.scene ?? ""} | ${r.ctx} | ${r.kind} ${[...r.ps].slice(0, 6).join(" ")} | ${r.n} | ${r.seen}/${r.n} | ${[...r.how].join(", ")} | ${r.frame ? `frames/${r.frame}` : ""} |`),
];
writeFileSync(`${RUN}/summary.md`, lines.join("\n") + "\n");
const s = all.filter((e) => e.kind === "sound" && !e.blend);
console.log(`→ ${RUN}: ${s.length} sounds said on their own, petal visible for ${s.filter((e) => e.seen).length}`);
