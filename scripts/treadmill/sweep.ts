// Treadmill stage 1: bots sweep every level and scene at fast-forward on a phone-landscape viewport.
// Each case: a "perfect child" bot plays it to the end (or a monkey taps at random), while in-page invariant checks
// look for things a child would trip over. Output: <runDir>/sweep.json (Finding[] + per-case stats) and
// <runDir>/cases/<case>/{meta.json, f_*.png} filmstrips for the visual critic.
// Usage: bun scripts/treadmill/sweep.ts [--run dir] [--only w1-4,map] [--base http://localhost:5173] [--fast 3] [--par 6] [--monkey]
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LEVELS, WORLDS } from "../../src/content/worlds";
import { save, step } from "./bot";
import type { CaseMeta, Finding } from "./types";

const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const FAST = Number(arg("fast", "3"));
const PAR = Number(arg("par", "6"));
const MONKEY = process.argv.includes("--monkey");
const RUN = arg("run", `playtest/runs/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`)!;
const ONLY = arg("only")?.split(",");
const VIEW = { width: 844, height: 390 }; // iPhone 13-ish, landscape: what children actually hold
const MAX_MS = 150_000; // real time per case
const STUCK_MS = 25_000; // real time with no visible change and nothing for the bot to do
const FRAME_EVERY = 2500;

const INTENT: Record<string, string> = {
  listen: "Hear a word spoken slowly and tap the matching picture (sounds only, no letters).",
  firstsound: "Hear a word and tap the picture that starts with the target sound; then see how the sound is written; then find it.",
  soundhunt: "Hear two words and pick the one with the target sound in the middle; then build and read words.",
  dojo: "Sensei builds a word sound by sound (I do), then we do it together, then the child builds words from letter tiles on their own, then reads.",
  battle: "A monster appears; the child spells/reads words to beat it by tapping letter tiles.",
  swap: "Word chain: change one sound to turn one word into the next (mat → sat → sit).",
  run: "Endless runner: tap to jump and collect the letters that spell the word.",
  sort: "Sort words into baskets by which spelling of a sound they use.",
  story: "Interactive picture story: read along and choose what happens next.",
  boss: "Boss battle against Baron Muddle using everything learnt so far.",
  learn: "Learn a new spelling of a sound.",
  training: "First-time tutorial: learn to tap, the gong, the help button and the speaker button.",
  placement: "Get-to-know-you quiz that places the child at the right level.",
  map: "World map: tap the next level to play.",
  title: "Title screen: press play.",
  profiles: "Who's playing? Choose a player or make a new one.",
  tree: "The Sound Flower: see collected petals and spelling gems.",
  book: "The Word Book: a scrapbook of collected word stickers.",
  grownups: "Grown-ups settings page.",
};

interface Case { name: string; url: string; kind: string; title: string; save?: object; play: boolean }
const IS_LEVEL = new Set(LEVELS.map((l) => l.id));
const cases: Case[] = [
  ...LEVELS.map((l) => ({ name: l.id, url: `/play/?level=${l.id}`, kind: l.kind, title: `${WORLDS[l.world - 1].name} ${l.id} (${l.kind})`, play: true })),
  { name: "training", url: "/play/?scene=training", kind: "training", title: "Training", save: save({ seenTraining: false }), play: true },
  { name: "placement", url: "/play/?scene=placement", kind: "placement", title: "Placement", save: save({ seenPlacement: false }), play: true },
  ...["map", "title", "profiles", "tree", "book", "grownups"].map((s) => ({ name: s, url: `/play/?scene=${s}`, kind: s, title: s, play: false })),
].filter((c) => !ONLY || ONLY.includes(c.name));

// ---------------------------------------------------------------- in-page checks
type Issue = { kind: string; sel: string; detail: string };
/** `level`: the case is a level, where the ninja always stands in the ninja zone (docs/HERO.md). */
function pageChecks(opts: { level?: boolean } = {}): Issue[] {
  const out: Issue[] = [];
  const W = innerWidth, H = innerHeight;
  const name = (el: Element) => {
    const a = el.getAttribute("aria-label");
    const c = (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
    const t = !a && !c ? (el.textContent ?? "").trim().slice(0, 24) : "";
    return `${el.tagName.toLowerCase()}${c}${a ? `[aria-label="${a}"]` : ""}${t ? `("${t}")` : ""}`;
  };
  // still popping in (a finite animation on it or a parent is running): its size isn't final yet
  const settling = (el: Element) => {
    for (let e: Element | null = el; e && e !== document.body; e = e.parentElement)
      if (e.getAnimations().some((a) => a.playState === "running" && Number.isFinite(a.effect?.getComputedTiming().endTime as number))) return true;
    return false;
  };
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.3 && r.width > 2 && r.height > 2;
  };
  // while a modal (first-visit intro, dialog) is open, only its own targets matter; the page under it is meant to be dimmed
  const modal = [...document.querySelectorAll("[data-modal]")].find(visible);
  const targets = [...(modal ?? document).querySelectorAll("button, [role=button], .hear-card, [data-tap]")].filter(
    (el) => visible(el) && !(el as HTMLButtonElement).disabled && !el.classList.contains("used") && !el.closest("[aria-hidden=true]"),
  );
  for (const el of targets) {
    const r = el.getBoundingClientRect();
    const n = name(el);
    const scrolls = !!el.closest(".scrollable"); // below the fold of a scrolling page is fine
    const adult = !!el.closest("[data-grownups]"); // grown-up controls may be ordinary web-sized
    if (scrolls && (r.bottom > H || r.top < 0)) continue;
    if (r.right < 4 || r.bottom < 4 || r.left > W - 4 || r.top > H - 4) out.push({ kind: "offscreen", sel: n, detail: `rect ${r.left | 0},${r.top | 0} ${r.width | 0}×${r.height | 0}` });
    else if (r.left < 0 || r.right > W || r.bottom > H) out.push({ kind: "clipped-target", sel: n, detail: `extends past the screen edge (${r.left | 0},${r.top | 0} ${r.width | 0}×${r.height | 0})` });
    if (!adult && Math.min(r.width, r.height) < 40 && !settling(el)) out.push({ kind: "tiny-target", sel: n, detail: `${r.width | 0}×${r.height | 0}px on a phone (want ≥ 44)` });
    if (r.left < 16 || r.right > W - 16) out.push({ kind: "edge-target", sel: n, detail: "within 16px of the side edge (iOS back-swipe zone)" });
    // what's actually under the centre?
    const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== el && !el.contains(top) && !top.contains(el) && !top.closest("[data-tap-proxy]")) out.push({ kind: "covered-target", sel: n, detail: `centre is covered by ${name(top)}` });
  }
  // zone conflicts (docs/HERO.md layout contract, stage coordinates 1280×720): nothing to tap in the ninja zone
  // (bottom-left, where the player's ninja stands in every level) or the help zone (bottom-right, Sensei's Help button)
  const stage = document.querySelector(".stage");
  if (stage) {
    const sr = stage.getBoundingClientRect();
    const sc = sr.width / 1280;
    const ninjaZone = !!opts.level || !!document.querySelector(".ninja-spot");
    for (const el of targets) {
      if (el.getAttribute("aria-label") === "Help" || el.closest("[data-tap-proxy]")) continue;
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2 - sr.left) / sc, y = (r.top + r.height / 2 - sr.top) / sc;
      const inNinja = ninjaZone && x >= 0 && x <= 330 && y >= 380 && y <= 720;
      const inHelp = x >= 1116 && x <= 1280 && y >= 556 && y <= 720;
      if (inNinja || inHelp)
        out.push({ kind: "zone-conflict", sel: name(el), detail: `centre at stage ${x | 0},${y | 0} is in the ${inNinja ? "ninja zone (x 0-330, y 380-720)" : "help zone (x 1116-1280, y 556-720)"}` });
    }
  }
  for (let i = 0; i < targets.length; i++)
    for (let j = i + 1; j < targets.length; j++) {
      if (targets[i].contains(targets[j]) || targets[j].contains(targets[i])) continue;
      const a = targets[i].getBoundingClientRect(), b = targets[j].getBoundingClientRect();
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const small = Math.min(a.width * a.height, b.width * b.height);
      if (ix * iy > 0.2 * small) out.push({ kind: "overlapping-targets", sel: `${name(targets[i])} + ${name(targets[j])}`, detail: `${Math.round((100 * ix * iy) / small)}% overlap` });
    }
  for (const el of document.querySelectorAll(".bubble, .tile, .card, button")) {
    if (!visible(el)) continue;
    const h = el as HTMLElement;
    if (h.scrollWidth > h.clientWidth + 3 && getComputedStyle(h).overflowX !== "visible") out.push({ kind: "text-overflow", sel: name(el), detail: `content ${h.scrollWidth}px in ${h.clientWidth}px` });
  }
  for (const img of document.querySelectorAll("img")) if (img.complete && img.naturalWidth === 0 && visible(img)) out.push({ kind: "broken-image", sel: name(img), detail: img.src.replace(location.origin, "") });
  const text = document.body.innerText;
  for (const bad of ["undefined", "NaN", "[object Object]", "null"]) if (new RegExp(`\\b${bad.replace(/[[\]]/g, "\\$&")}\\b`).test(text)) out.push({ kind: "junk-text", sel: "body", detail: `"${bad}" visible on screen` });
  if (/Oops! A muddle!/.test(text)) out.push({ kind: "crash-screen", sel: "body", detail: text.slice(0, 300) });
  return out;
}

const SEV: Record<string, Finding["severity"]> = {
  "crash-screen": "blocker", pageerror: "blocker", stuck: "blocker", "did-not-finish": "major", "covered-target": "major", offscreen: "major", "zone-conflict": "major",
  "broken-image": "major", "junk-text": "major", "overlapping-targets": "major", "clipped-target": "minor", "tiny-target": "minor",
  "edge-target": "minor", "text-overflow": "minor", "console-error": "minor", "monkey-crash": "blocker",
};

// ---------------------------------------------------------------- run one case
async function runCase(b: Browser, c: Case, monkey: boolean): Promise<{ findings: Finding[]; secs: number; ok: boolean }> {
  const tag = monkey ? `${c.name}~monkey` : c.name;
  const dir = `${RUN}/cases/${tag}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: VIEW, hasTouch: true, isMobile: false });
  const page = await ctx.newPage();
  const findings = new Map<string, Finding>();
  const add = (kind: string, sel: string, detail: string, evidence: string[] = []) => {
    const sig = `bot:${c.name}:${kind}:${sel.replace(/\("[^"]*"\)/g, "")}`; // anonymous buttons' text is detail, not identity
    if (findings.has(sig)) return;
    findings.set(sig, { sig, source: kind.startsWith("monkey") || monkey ? "bot" : "invariant", severity: SEV[kind] ?? "minor", case: c.name, title: `${kind}: ${sel}`, detail, evidence, repro: `${BASE}${c.url}` });
  };
  page.on("pageerror", (e) => add("pageerror", e.message.slice(0, 80), e.stack?.slice(0, 600) ?? e.message));
  page.on("console", (m) => m.type() === "error" && !/favicon|404|net::ERR/.test(m.text()) && add("console-error", m.text().slice(0, 80), m.text().slice(0, 400)));
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => localStorage.setItem("superninja.save.v1", JSON.stringify(s)), { ...(c.save ?? save()), settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript(() => ((window as any).__audioLog = []));
  await page.goto(`${BASE}${c.url}${c.url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await page.mouse.click(VIEW.width / 2, 4);
  const meta: CaseMeta = { case: tag, url: c.url, kind: c.kind, title: c.title + (monkey ? " — random tapping" : ""), intent: INTENT[c.kind] ?? c.kind, frames: [] };
  const t0 = Date.now();
  let lastSig = "", lastChange = Date.now(), lastFrame = -1e9, ok = false, ticks = 0;
  const frame = async (why = "") => {
    const t = Date.now() - t0;
    if (t < 500 && !why) return ""; // the screen is still fading in
    const file = `f_${String(meta.frames.length).padStart(2, "0")}${why ? "_" + why : ""}.png`;
    await page.screenshot({ path: `${dir}/${file}` }).catch(() => {});
    const info = await page
      .evaluate(() => ({
        st: (window as any).__snState ?? null,
        cap: document.querySelector(".bubble")?.textContent ?? "",
        // things still popping or dropping in: layout claims on this frame are unreliable (the critic is told)
        settling: document.getAnimations().some((a) => a.playState === "running" && Number(a.effect?.getTiming().iterations) !== Infinity),
      }))
      .catch(() => ({ st: null, cap: "", settling: false }));
    meta.frames.push({ file, t, snState: info.st, caption: info.cap, settling: info.settling } as CaseMeta["frames"][number]);
    return file;
  };
  while (Date.now() - t0 < (c.play ? MAX_MS : 12_000)) {
    if (c.play && !monkey && (await page.locator('button[aria-label="Play again"]').count())) {
      ok = true;
      break;
    }
    if (c.name === "training" || c.name === "placement") {
      const done = await page.evaluate(() => { try { const pr = JSON.parse(localStorage.getItem("superninja.profiles.v1")!); const s = JSON.parse(localStorage.getItem("superninja.save." + pr.current)!); return s.seenTraining && s.seenPlacement; } catch { return false; } });
      if (done) { ok = true; break; }
    }
    if (Date.now() - lastFrame > FRAME_EVERY) {
      lastFrame = Date.now();
      ticks++;
      if (meta.frames.length < 40 || ticks % 4 === 0) await frame(); // long levels: thin the filmstrip out
      // monkeys wander into other screens: only crash-type signals count there (layout is the deterministic bot's job)
      const issues = (await page.evaluate(pageChecks, { level: IS_LEVEL.has(c.name) }).catch(() => [] as Issue[])).filter((i) => !monkey || ["crash-screen", "junk-text", "broken-image"].includes(i.kind));
      for (const i of issues) {
        const sig = `bot:${c.name}:${i.kind}:${i.sel.replace(/\("[^"]*"\)/g, "")}`;
        if (!findings.has(sig)) {
          // outline the culprit for the evidence shot
          const shot = `issue_${findings.size}.png`;
          await page.evaluate((sel) => { const m = sel.match(/\[aria-label="([^"]+)"\]/); const el = m ? document.querySelector(`[aria-label="${m[1]}"]`) : null; if (el) (el as HTMLElement).style.outline = "5px solid red"; }, i.sel).catch(() => {});
          await page.screenshot({ path: `${dir}/${shot}` }).catch(() => {});
          await page.evaluate(() => document.querySelectorAll("[style*='outline']").forEach((e) => ((e as HTMLElement).style.outline = ""))).catch(() => {});
          add(i.kind, i.sel, i.detail, [`cases/${tag}/${shot}`]);
        }
      }

    }
    if (!c.play) { await page.waitForTimeout(400); continue; }
    if (monkey) {
      for (let k = 0; k < 4; k++) await page.mouse.click(10 + Math.random() * (VIEW.width - 20), 10 + Math.random() * (VIEW.height - 20)).catch(() => {});
      if (Date.now() - t0 > 45_000) { ok = true; break; }
    } else await step(page).catch(() => {});
    const sig = await page.evaluate(() => JSON.stringify((window as any).__snState ?? null) + (document.querySelector(".bubble")?.textContent ?? "") + ((window as any).__audioLog?.length ?? 0) + document.querySelectorAll("*").length).catch(() => "");
    if (sig !== lastSig) (lastSig = sig), (lastChange = Date.now());
    else if (!monkey && Date.now() - lastChange > STUCK_MS) {
      const f = await frame("stuck");
      add("stuck", "no change", `Nothing changed on screen or in audio for ${STUCK_MS / 1000}s (real, at ${FAST}×) and the bot found nothing to tap. snState=${JSON.stringify(meta.frames.at(-1)?.snState)}`, [`cases/${tag}/${f}`]);
      break;
    }
    await page.waitForTimeout(monkey ? 250 : 350);
  }
  if (c.play && !monkey && !ok && ![...findings.values()].some((f) => f.title.startsWith("stuck"))) add("did-not-finish", "timeout", `The bot did not finish within ${MAX_MS / 1000}s real time.`);
  if (monkey && (await page.evaluate(() => /Oops! A muddle!/.test(document.body.innerText)).catch(() => false))) add("monkey-crash", "crash screen", "Random tapping crashed the game.");
  writeFileSync(`${dir}/meta.json`, JSON.stringify(meta, null, 1));
  await ctx.close();
  return { findings: [...findings.values()], secs: Math.round((Date.now() - t0) / 1000), ok: ok || !c.play };
}

// ---------------------------------------------------------------- main
mkdirSync(RUN, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const jobs = [...cases.map((c) => ({ c, monkey: false })), ...(MONKEY ? cases.filter((c) => c.play).map((c) => ({ c, monkey: true })) : [])];
const results: Record<string, { ok: boolean; secs: number; findings: number }> = {};
const all: Finding[] = [];
let next = 0;
const t0 = Date.now();
await Promise.all(
  Array.from({ length: PAR }, async () => {
    while (next < jobs.length) {
      const { c, monkey } = jobs[next++];
      const r = await runCase(b, c, monkey).catch((e) => ({ findings: [{ sig: `bot:${c.name}:harness`, source: "bot", severity: "minor", case: c.name, title: "harness error", detail: String(e).slice(0, 400), evidence: [] } as Finding], secs: 0, ok: false }));
      const tag = monkey ? `${c.name}~monkey` : c.name;
      results[tag] = { ok: r.ok, secs: r.secs, findings: r.findings.length };
      all.push(...r.findings);
      const worst = r.findings.filter((f) => f.severity === "blocker" || f.severity === "major").length;
      console.log(`${r.ok && !worst ? "✓" : r.ok ? "!" : "✗"} ${tag.padEnd(16)} ${String(r.secs).padStart(3)}s  ${r.findings.length} findings${worst ? ` (${worst} major+)` : ""}`);
    }
  }),
);
await b.close();
writeFileSync(`${RUN}/sweep.json`, JSON.stringify({ base: BASE, fast: FAST, secs: Math.round((Date.now() - t0) / 1000), results, findings: all }, null, 1));
console.log(`\n${Object.values(results).filter((r) => r.ok).length}/${jobs.length} finished · ${all.length} findings · ${Math.round((Date.now() - t0) / 1000)}s → ${RUN}/sweep.json`);
