// Navigation inventory probe: plays screens at 844x390 and records, per sample, which navigation controls are on
// screen (Home, back, hear-again, Next), what was said, what was tapped, and screen changes with no tap before them.
// Usage: bun probe.ts <outDir> [case,case...]
import { chromium, type Page } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src/content/lines";
import { save, step } from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/bot";

const OUT = process.argv[2] ?? "probe-out";
const ONLY = process.argv[3]?.split(",");
const BASE = "http://localhost:5173";
const FAST = 3;
const LINE = new Map(LINES.map((l) => [l.id, l.text]));
const FLOWER_SAVE = save({
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
});

type Case = { name: string; url: string; save?: any; ms: number; first?: boolean; seen?: Record<string, boolean> };
const L = (id: string, ms = 70_000): Case => ({ name: id, url: `/play/?level=${id}`, ms });
const CASES: Case[] = [
  { name: "first-session", url: "/play/", ms: 330_000, first: true },
  { name: "setup", url: "/play/", ms: 6000 },
  { name: "title", url: "/play/?scene=title", ms: 5000 },
  { name: "profiles", url: "/play/?scene=profiles", ms: 5000 },
  { name: "map", url: "/play/?scene=map", ms: 8000 },
  { name: "book", url: "/play/?scene=book", save: save({ seenBook: true, stickers: ["sun", "sock", "cat", "sausage", "moon", "fish", "dog"] }), ms: 6000 },
  { name: "grownups", url: "/play/?scene=grownups", ms: 5000 },
  { name: "placement", url: "/play/?scene=placement", save: save({ seenPlacement: false }), ms: 40_000 },
  { name: "tree", url: "/play/?scene=tree", save: FLOWER_SAVE, ms: 9000 },
  { name: "tree-intro", url: "/play/?scene=tree", save: { ...FLOWER_SAVE, seenFlower: false }, ms: 40_000 },
  { name: "tree-petal", url: "/play/?scene=tree&gem=ai>ae&open=1", save: FLOWER_SAVE, ms: 12_000 },
  { name: "tree-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", save: FLOWER_SAVE, ms: 45_000 },
  { name: "tree-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", save: FLOWER_SAVE, ms: 45_000 },
  { name: "tree-world", url: "/play/?scene=tree&visit=world:3", save: FLOWER_SAVE, ms: 45_000 },
  { name: "finale", url: "/play/?scene=finale", ms: 30_000 },
  L("w1-wu3"), L("w1-wu4"), L("w1-wu5"), L("w1-wu6"),
  L("w1-2"), L("w1-4"), L("w1-6"), L("w1-7"), L("w1-8"), L("w1-9"), L("w1-14"), L("w1-15"),
  L("w2-1"), L("w2-2"), L("w6-br1"), L("w2-7"),
].filter((c) => !ONLY || ONLY.includes(c.name));

async function sample(page: Page) {
  return page.evaluate(() => {
    const vis = (el: Element) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.3 && r.width > 2 && r.height > 2;
    };
    const btns = [...document.querySelectorAll("button, [role=button]")].filter(vis);
    const lab = (el: Element) => el.getAttribute("aria-label") ?? (el.textContent ?? "").trim().slice(0, 20);
    const home = btns.filter((b) => b.querySelector('path[d^="M10 30 32 11"]')).map(lab);
    const back = btns.filter((b) => b.querySelector('path[d^="M38 14 20 32"]')).map(lab);
    const next = btns.filter((b) => b.querySelector('path[d^="M26 14l18 18"]')).map(lab);
    const hear = btns.filter((b) => /^(Hear|Read it|Sensei explains|petal sound)/.test(lab(b)) || b.querySelector('path[d^="M10 25h10l13-11"]')).map(lab);
    const q = (s: string) => !!document.querySelector(s);
    const st = (window as any).__snState ?? null;
    let piece = "?";
    if (q(".oi")) piece = "optin";
    else if (q(".wu")) piece = `warmup:${st?.key ?? "?"}`;
    else if (q(".st-reward")) piece = "sticker-reward";
    else if (q(".scene.reward")) piece = "reward";
    else if (q(".scene.map")) piece = "map";
    else if (q(".scene.choose")) piece = "choose";
    else if (q(".skip-film")) piece = "film";
    else if (q(".scene.title")) piece = "title";
    else if (q('[aria-label^="player "]') || q(".name-input")) piece = "profiles";
    else if (st?.scene) piece = String(st.scene);
    const modal = [...document.querySelectorAll("[data-modal]")].filter(vis).map((m) => m.className.split(" ").slice(0, 2).join("."));
    const video = (document.querySelector("video") as HTMLVideoElement | null)?.getAttribute("src") ?? null;
    const log = ((window as any).__audioLog ?? []) as { url: string; kind: string }[];
    const taps = ((window as any).__taps ?? []) as { t: number; label: string }[];
    return { piece, st, home, back, next, hear, modal, video, nlog: log.length, log: log.map((x) => x.url), taps };
  });
}

function decode(url: string): string | null {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) return `"${LINE.get(m[1]) ?? m[1]}"`;
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return `/${m[1]}/`;
  if ((m = url.match(/\/a\/w\/([^/]+)\.mp3/))) return `[${m[1]}]`;
  if ((m = url.match(/\/a\/x\/([^/]+)\.mp3/))) return `[${m[1]}~]`;
  if ((m = url.match(/\/a\/s\/([^/]+)\.mp3/))) return `(story ${m[1]})`;
  return null;
}

async function act(page: Page, s: any, c: Case) {
  const down = (sel: string) => page.locator(sel).first().dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
  if (s.piece === "title") return down('button[aria-label="Start"]');
  if (s.piece === "profiles") {
    if (await page.locator('[aria-label="player Ninja"]').count()) return down('[aria-label="player Ninja"]');
    return;
  }
  if (s.piece === "film") return; // let it play: what does it do on its own?
  if (s.piece === "choose") return down('[aria-label="kai"]');
  if (s.piece === "map") return;
  if (c.name === "setup" || c.name === "grownups" || c.name === "book" || c.name === "tree" || c.name === "tree-petal") return;
  return step(page);
}

async function run(b: any, c: Case) {
  const dir = `${OUT}/${c.name}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e: Error) => errors.push(e.message));
  await page.goto(BASE + "/play/");
  await page.evaluate(({ s, first, setup }) => {
    localStorage.clear();
    if (first) {
      const id = "pfm";
      localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: null, created: Date.now(), last: Date.now() }], current: id }));
      localStorage.setItem(`superninja.save.${id}`, JSON.stringify({ v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true }));
    } else localStorage.setItem("superninja.save.v1", JSON.stringify({ ...s, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } }));
    if (!setup) sessionStorage.setItem("sn.setup", "done");
  }, { s: c.save ?? save(), first: !!c.first, setup: c.name === "setup" });
  await page.addInitScript(() => {
    (window as any).__audioLog = [];
    (window as any).__taps = [];
    (window as any).__botOptIn = "none";
    addEventListener("pointerdown", (e) => {
      const el = (e.target as Element).closest?.("[aria-label], button");
      (window as any).__taps.push({ t: Date.now(), label: el?.getAttribute("aria-label") || (el?.textContent ?? "").trim().slice(0, 30) || "(somewhere)" });
    }, true);
  });
  await page.goto(`${BASE}${c.url}${c.url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await page.waitForTimeout(500);
  const t0 = Date.now();
  const rows: any[] = [];
  let lastSig = "", lastShot = 0, nlog = 0, ntaps = 0, lastTapAt = 0, shots = 0;
  while (Date.now() - t0 < c.ms / FAST + 4000) {
    const s = await sample(page).catch(() => null);
    if (!s) break;
    const said = s.log.slice(nlog).map(decode).filter(Boolean);
    nlog = s.log.length;
    const newTaps = s.taps.slice(ntaps);
    ntaps = s.taps.length;
    if (newTaps.length) lastTapAt = Date.now();
    const stKey = s.st ? JSON.stringify({ ...s.st, streak: undefined, busy: undefined, asked: undefined, tier: undefined, glow: undefined, event: undefined }) : "";
    const sig = `${s.piece}|${stKey}|${s.video}|${s.modal.join()}`;
    const g = Math.round(((Date.now() - t0) * FAST) / 100) / 10;
    const changed = sig !== lastSig;
    const auto = changed && lastSig !== "" && Date.now() - lastTapAt > 1500;
    if (changed || said.length || newTaps.length) rows.push({ g, piece: s.piece, st: s.st, home: s.home, back: s.back, next: s.next, hear: s.hear, modal: s.modal, video: s.video, said, taps: newTaps.map((x: any) => x.label), changed, auto });
    if ((changed && Date.now() - lastShot > 500) || Date.now() - lastShot > 3000) {
      lastShot = Date.now();
      await page.screenshot({ path: `${dir}/${String(shots++).padStart(3, "0")}_${String(g).padStart(5, "0")}_${s.piece.replace(/[^a-z0-9]+/gi, "-")}.png` }).catch(() => {});
    }
    lastSig = sig;
    if (c.first && s.piece === "map") {
      await page.waitForTimeout(2000);
      break;
    }
    if (!c.first && (await page.locator('button[aria-label="Play again"]').count())) {
      await page.screenshot({ path: `${dir}/zz_end.png` }).catch(() => {});
      rows.push({ g, piece: "END (Play again visible)" });
      break;
    }
    await act(page, s, c).catch(() => {});
    await page.waitForTimeout(300);
  }
  writeFileSync(`${dir}/rows.json`, JSON.stringify({ errors, rows }, null, 1));
  // a compact text log
  const txt = rows.map((r) => `${String(r.g).padStart(6)}s ${r.auto ? "AUTO " : r.changed ? "chg  " : "     "}${(r.piece ?? "").padEnd(16)} H:${r.home?.length ? "Y" : "-"} B:${r.back?.length ? "Y" : "-"} N:${r.next?.length ? r.next.join("/") : "-"} S:${r.hear?.length ? r.hear.join("/") : "-"}${r.modal?.length ? ` M:${r.modal.join()}` : ""}${r.video ? ` V:${r.video.split("/").pop()}` : ""}${r.taps?.length ? `  TAP ${r.taps.join(", ")}` : ""}${r.said?.length ? `  SAY ${r.said.join(" ")}` : ""}${r.st ? `  st=${JSON.stringify(r.st).slice(0, 140)}` : ""}`).join("\n");
  writeFileSync(`${dir}/log.txt`, (errors.length ? `ERRORS: ${errors.join(" | ")}\n` : "") + txt + "\n");
  await ctx.close();
  console.log(`${c.name}: ${rows.length} rows, ${shots} shots${errors.length ? `, ${errors.length} errors` : ""}`);
}

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let i = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < CASES.length) await run(b, CASES[i++]).catch((e) => console.log("ERR", e));
}));
await b.close();
