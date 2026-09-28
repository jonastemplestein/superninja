// The confirm's evidence run (docs/CONFIRM.md §3.6): drives the standalone demo (playtest/confirm/, a frozen build served
// by serve.ts) at 844×390 with touch, screenshots every step into playtest/confirm/shots/, and writes what it measured to
// playtest/confirm/logs/shoot.json: each answer's box in CSS px, __snState, the nav log, the confirm's own audio, the
// animations running while it waits (their properties), requestAnimationFrame calls while it is quiet, and the checks
// (`checks`: each one { name, ok, detail }; the run exits 1 if any fails).
// Usage: bun playtest/confirm/shoot.ts --port 49xx   (the server must be up: bun playtest/confirm/serve.ts --port 49xx)
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const port = Number(process.argv[process.argv.indexOf("--port") + 1] || 4961);
const BASE = `http://127.0.0.1:${port}/`;
const SHOTS = "playtest/confirm/shots";
mkdirSync(SHOTS, { recursive: true });
mkdirSync("playtest/confirm/logs", { recursive: true });
const out: Record<string, unknown> = {};
const checks: { name: string; ok: boolean; detail?: unknown }[] = [];
const check = (name: string, ok: boolean, detail?: unknown) => (checks.push({ name, ok, detail }), console.log(`${ok ? "✓" : "✗"} ${name}${detail === undefined ? "" : " " + JSON.stringify(detail)}`));
let n = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: false, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  // count animation frames asked for (the confirm must ask for none while it waits)
  const raf = window.requestAnimationFrame.bind(window);
  (window as any).__rafN = 0;
  window.requestAnimationFrame = (f) => ((window as any).__rafN++, raf(f));
  (window as any).__audioLog = [];
});

/** stage (1280×720) → page CSS px */
async function toPage(page: Page, x: number, y: number) {
  return page.evaluate(([x, y]) => {
    const s = document.querySelector(".stage")!.getBoundingClientRect();
    const k = s.width / 1280;
    return { x: s.left + x * k, y: s.top + y * k };
  }, [x, y] as const);
}
async function tapStage(page: Page, x: number, y: number) {
  const p = await toPage(page, x, y);
  await page.touchscreen.tap(p.x, p.y);
}
async function shot(page: Page, name: string, note: string) {
  const file = `${SHOTS}/${String(++n).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: file });
  const st = await state(page);
  (out.steps as unknown[]).push({ n, name, note, file, ...st });
  console.log(`${n} ${name}: ${note} | ${JSON.stringify(st.snState)} ${st.results.length ? JSON.stringify(st.results.at(-1)) : ""}`);
  return st;
}
async function state(page: Page) {
  return page.evaluate(() => {
    const w = window as any;
    const box = (sel: string) => {
      const r = document.querySelector(sel)?.getBoundingClientRect();
      return r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null;
    };
    return {
      snState: w.__snState ?? null,
      point: document.querySelector(".cf-root")?.getAttribute("data-point") ?? null,
      hand: !!document.querySelector(".cf-root svg path[d^='M26 30']"),
      yes: box('[data-confirm="yes"]'),
      no: box('[data-confirm="no"]'),
      bubblePic: box(".cf-bubble .cf-pic"),
      bubbleQ: !!document.querySelector(".cf-bubble .cf-q"),
      yesPic: box('[data-confirm="yes"] .cf-btn-pic'),
      ninja: box(".cf-ninja"),
      home: box('[data-nav="home"]'),
      results: w.__cfDemo?.results ?? [],
      navLog: (w.__snNavLog ?? []).filter((e: any) => String(e.id ?? "").startsWith("confirm:")),
      confirmAudio: (w.__audioLog ?? []).filter((e: any) => e.confirm).map((e: any) => String(e.url).replace(/^.*\/l\//, "").replace(/\.mp3.*$/, "")),
    };
  });
}
async function open(q: string) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await page.goto(BASE + q);
  await page.waitForSelector(".stage");
  await sleep(900);
  return page;
}
const tapSel = async (page: Page, sel: string) => {
  const r = await page.locator(sel).first().boundingBox();
  if (!r) throw new Error(`no ${sel}`);
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
};
const quietNow = (page: Page) => page.waitForSelector(".cf-face:not(.talking)", { timeout: 15000 });
const saidSince = (before: string[], after: string[]) => after.slice(before.length);
const overlap = (a: { x: number; y: number; w: number; h: number } | null, b: { x: number; y: number; w: number; h: number } | null) =>
  !a || !b ? 0 : Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
out.steps = [];

// ---- 1. the map: a finished stone asks (the generic `replay`); the glowing stone doesn't
{
  const page = await open("?cf=map");
  await tapStage(page, 1150, 300); // an empty spot: unlocks audio
  await shot(page, "map", "the demo map: three finished stones, the story, the glowing stone, two locked");
  await tapStage(page, 730, 548);
  await sleep(300);
  await shot(page, "map-current", "the glowing stone starts at once: no question");
  await tapStage(page, 440, 572); // a finished stone on the bottom row
  await sleep(450);
  const o = await shot(page, "replay-open", "a finished stone: Sensei asks. YES is the stone's picture (left), the ▶ \"keep playing\" (right, bigger, the ninja's thumbs up); her bubble shows \"?\" (the picture is never drawn twice)");
  check("the answers are ≥ 96 CSS px, and the ▶ is the bigger", !!o.yes && !!o.no && o.yes.w >= 96 && o.no.w > o.yes.w, { yes: o.yes?.w, no: o.no?.w });
  check("the map's question: the bubble shows \"?\", not the stone's picture again", o.bubbleQ && !o.bubblePic);
  check("the thumbs-up ninja stands by the ▶ and covers neither answer", !!o.ninja && o.ninja.x >= (o.no?.x ?? 0) + (o.no?.w ?? 0) - 2 && overlap(o.ninja, o.yes) === 0 && overlap(o.ninja, o.no) === 0, o.ninja);
  await tapStage(page, 440, 572); // the same spot again, inside the guard
  await sleep(100);
  await tapStage(page, 440, 572); // and again, after it: the backdrop
  await sleep(900);
  const m = await shot(page, "replay-mash", "two more taps on the same spot: still asking (the guard, then the backdrop, which points at the ▶)");
  check("mashing the spot that opened it never answers", m.snState?.scene === "confirm" && m.results.length === 0);
  await page.waitForSelector(".cf-ans.yes.spot", { timeout: 12000 });
  await shot(page, "replay-spot-pic", "\"Tap the picture for yes…\": the picture is spotlit as it is named");
  await page.waitForSelector(".cf-ans.no.spot", { timeout: 6000 });
  await shot(page, "replay-spot-arrow", "\"…Or tap the green arrow to keep playing.\": the ▶ is spotlit");
  await quietNow(page);
  await sleep(600);
  await tapStage(page, 1100, 150); // a tap anywhere: the ladder starts again from 0 (and the hand goes)
  await sleep(1200);
  await shot(page, "replay-asked", "asked; quiet now (the idle ladder counts from here)");
  // quiet: count frames asked for over 2 s, and list the running animations' properties
  const quiet = await page.evaluate(async () => {
    const w = window as any;
    const n0 = w.__rafN;
    await new Promise((r) => setTimeout(r, 2000));
    const props = [...new Set(document.getAnimations().flatMap((a) => ((a.effect as KeyframeEffect)?.getKeyframes?.() ?? []).flatMap((k) => Object.keys(k).filter((p) => !["offset", "easing", "composite", "computedOffset"].includes(p)))))];
    return { rafIn2s: w.__rafN - n0, animatedProps: props, running: document.getAnimations().length };
  });
  out.quiet = quiet;
  check("no animation frames while it waits; transform and opacity only", quiet.rafIn2s === 0 && quiet.animatedProps.every((p: string) => ["transform", "opacity", "scale", "translate"].includes(p)), quiet);
  await sleep(6500); // 8 s of quiet after the last tap: the glow and the hand on the ▶
  const g = await shot(page, "replay-glow", "8 s of quiet: the ▶ (the safe answer) glows and hops with the hand; the picture stays still");
  check("8 s: the hand and the glow on NO", g.point === "no" && g.hand && g.snState?.point === "no");
  const glowing = await page.evaluate(() => ({
    no: getComputedStyle(document.querySelector(".cf-ans.no")!, "::after").animationName,
    yes: getComputedStyle(document.querySelector(".cf-ans.yes")!, "::after").animationName,
  }));
  check("only the ▶ glows", glowing.no === "cf-glow" && glowing.yes === "none", glowing);
  await tapSel(page, '[data-confirm="no"]');
  await sleep(250);
  await shot(page, "replay-no", "▶ tapped: it swells, the ninja cheers, \"Let's keep going!\"");
  await sleep(1600);
  const nc = await shot(page, "replay-no-closed", "closed (how: no; on the real map the call site starts the next game)");
  check("▶ says \"Let's keep going!\" and resolves no", nc.confirmAudio.includes("tv_confirm_keep") && nc.results.at(-1)?.how === "no");
  // the bubble and the face: a tap there shows the way (was: nothing)
  await tapStage(page, 295, 548);
  await sleep(700);
  await quietNow(page);
  const before = (await state(page)).confirmAudio;
  await tapSel(page, "[data-confirm-bubble]");
  await sleep(300);
  const bt = await shot(page, "replay-bubble-tap", "a tap on Sensei's bubble: the hand onto the ▶ at once, and she names the answers again");
  await sleep(600);
  const after = (await state(page)).confirmAudio;
  check("a tap on the bubble brings the hand to NO and says how", bt.point === "no" && bt.hand && saidSince(before, after).includes("tv_confirm_how_pic"), saidSince(before, after));
  await sleep(4000);
  await tapSel(page, '[data-confirm="yes"]');
  await sleep(250);
  await shot(page, "replay-yes", "YES (the stone's picture) tapped: it swells, \"Yes, please!\"");
  await sleep(1500);
  await tapStage(page, 150, 560);
  await sleep(1200);
  await tapSel(page, '[data-nav="home"]'); // inside Home's own guard (2.5 s): ignored
  await sleep(300);
  const hg = await shot(page, "replay-home-guard", "Home 1.2 s in: ignored (a child mashing Home can't open and close it)");
  check("Home inside its guard is ignored", hg.snState?.scene === "confirm");
  await sleep(1400);
  await tapSel(page, '[data-nav="home"]');
  await sleep(400);
  const hh = await shot(page, "replay-home", "Home after 2.5 s under the map's question: counts as NO, stays on the map");
  check("Home under the map's question: NO", hh.results.at(-1)?.how === "home" && hh.snState?.scene !== "confirm");
  out.map = await state(page);
  await page.close();
}

// ---- 2. the map redesign's own lines: each stone asks its own kind's question (MAP_DESIGN §7)
{
  const page = await open("?cf=map&look=map");
  await tapStage(page, 1150, 300);
  const asked: Record<string, string | undefined> = {};
  for (const [x, y, kind] of [[150, 560, "picread"], [295, 548, "firstsound"], [440, 572, "swap"], [585, 560, "story"]] as const) {
    const before = (await state(page)).confirmAudio;
    await tapStage(page, x, y);
    await sleep(1300);
    asked[kind] = saidSince(before, (await state(page)).confirmAudio)[0];
    if (kind !== "story") {
      await sleep(400);
      await tapSel(page, '[data-confirm="no"]');
      await sleep(2300);
    }
  }
  out.mapAsked = asked;
  check("look=map: each stone asks its own question", Object.entries(asked).every(([k, v]) => v === `tv_map_replay_${k}`), asked);
  await shot(page, "replay-maplook", "look=map, the story stone: \"Do you want to read that story again?\", then tv_map_replay_how");
  await page.waitForSelector(".cf-root.point-no", { timeout: 30000 });
  await sleep(300);
  await shot(page, "replay-maplook-glow", "look=map, 8 s of quiet: the ▶ glows with the hand");
  await tapSel(page, '[data-confirm="no"]');
  await sleep(1800);
  const r = await shot(page, "replay-maplook-next", "▶ tapped: \"Off to your next game!\" (how: no → the call site starts the next game)");
  check("look=map: ▶ says tv_map_replay_next", r.confirmAudio.includes("tv_map_replay_next"));
  await page.close();
}

// ---- 3. a level: Home before the first answer leaves at once; after it, Sensei asks, and Home points at the house
{
  const page = await open("?cf=level");
  await tapStage(page, 1150, 200);
  await sleep(300);
  await shot(page, "level", "a turn, no answer yet");
  await tapSel(page, '[data-nav="home"]');
  await sleep(400);
  const s = await shot(page, "level-home-first", "Home before the first answer: leaves at once, no question");
  check("Home before the first answer: no question", s.results.length === 0 && s.snState?.scene !== "confirm");
  await page.close();
}
{
  const page = await open("?cf=level");
  await tapStage(page, 1150, 200);
  await tapSel(page, '[aria-label="sun"]');
  await sleep(400);
  await tapSel(page, '[data-nav="home"]');
  await sleep(120);
  await tapSel(page, '[data-nav="home"]'); // a second Home tap, inside the guard: ignored, and no hand on the house
  await sleep(200);
  const g = await state(page);
  check("a Home mash as it opens: ignored, no hand on the house", g.snState?.scene === "confirm" && g.point !== "yes", g.point);
  await quietNow(page);
  const lo = await shot(page, "leave-open", "Home after an answer: \"Do you want to stop this game and go home? Tap the house to go home. Or tap the green arrow to keep playing.\" (the level in the bubble)");
  check("leave: the question, then how by pictures (no \"go back\")", lo.confirmAudio.join() === "tv_confirm_leave,tv_confirm_how_home", lo.confirmAudio);
  check("leave: the level in the bubble, smaller than YES's picture", !!lo.bubblePic && !!lo.yesPic && lo.bubblePic.w < lo.yesPic.w, { bubble: lo.bubblePic?.w, yes: lo.yesPic?.w });
  await tapSel(page, '[data-nav="home"]'); // Home again, after the guard: the way to the house
  await sleep(500);
  const hn = await shot(page, "leave-home-nudge", "Home again: it doesn't answer; the hand and the glow go to the house, \"To go home, tap this house.\"");
  await sleep(2400);
  const hn2 = await state(page);
  check("Home under leave: still asking, the hand on the house, the nudge said", hn.snState?.scene === "confirm" && hn.point === "yes" && hn.hand && hn2.confirmAudio.includes("tv_confirm_home_nudge"), hn2.confirmAudio);
  await tapSel(page, '[aria-label="Hear it again"]');
  await sleep(500);
  await shot(page, "leave-again", "Hear it again: the question once more");
  await quietNow(page);
  await tapStage(page, 1200, 650); // the dimmed Help button (Sensei's corner): Help
  await sleep(300);
  await tapStage(page, 1200, 650);
  await sleep(600);
  const h = await shot(page, "leave-help", "Help twice (Sensei's corner): the question, then the hand on the ▶ and the question again");
  check("Help's second press: the hand on NO", h.point === "no");
  await quietNow(page);
  await tapSel(page, '[data-confirm="no"]');
  await sleep(2200);
  const ln = await shot(page, "leave-no", "▶: \"Let's keep going!\", back in the level, the turn's question asked again");
  check("leave, ▶: keep playing", ln.results.at(-1)?.how === "no" && ln.snState?.scene !== "confirm");
  await tapSel(page, '[data-nav="home"]');
  await sleep(1000);
  await tapSel(page, '[data-confirm="yes"]');
  await sleep(300);
  await shot(page, "leave-yes-said", "the house: \"Okay. See you soon!\"");
  await sleep(1800);
  const ly = await shot(page, "leave-yes", "…to the map");
  check("leave, the house: YES, \"Okay. See you soon!\"", ly.results.at(-1)?.how === "yes" && ly.confirmAudio.includes("tv_confirm_bye"));
  out.level = await state(page);
  await page.close();
}

// ---- 4. the boss and the gem battle; the self-mounted layer; the timeout
for (const [q, name, note] of [
  ["?cf=boss&open=leave-boss", "leave-boss", "the boss: \"Do you want to leave the boss battle? You can come back any time.\" (the boss in the bubble, the house on YES)"],
  ["?cf=trial&open=leave-trial", "leave-trial", "the gem battle: \"…Your gem will wait for you. Tap the flower to stop for now. Or tap the green arrow to keep battling.\""],
  ["?cf=level&open=leave&auto=1", "leave-automount", "no ConfirmLayer in the page: confirm() mounted its own"],
] as const) {
  const page = await open(q);
  await tapStage(page, 1150, 200);
  await sleep(1500);
  await shot(page, name, note);
  if (name === "leave-trial") {
    await sleep(1500);
    await tapSel(page, '[data-nav="home"]');
    await sleep(400);
    await shot(page, "leave-trial-home", "Home in the gem battle's question: the hand on the flower");
    await quietNow(page);
    await sleep(300);
    const t = await state(page);
    check("trial: Home points at the flower and says so", t.point === "yes" && t.confirmAudio.includes("tv_confirm_flower_nudge"), t.confirmAudio);
  }
  await page.close();
}
{
  const page = await open("?cf=level&open=leave&fast=8");
  await tapStage(page, 1150, 200);
  await page.waitForFunction(() => (window as any).__cfDemo.results.length > 0, null, { timeout: 30000 });
  await sleep(300);
  const t = await shot(page, "leave-timeout", "40 s of quiet (game time, ×8): counts as NO, back in the level");
  check("40 s of quiet: NO (timeout)", t.results.at(-1)?.how === "timeout");
  out.timeout = await state(page);
  await page.close();
}

out.checks = checks;
writeFileSync("playtest/confirm/logs/shoot.json", JSON.stringify(out, null, 1) + "\n");
await b.close();
const bad = checks.filter((c) => !c.ok);
console.log(bad.length ? `✗ ${bad.length} of ${checks.length} checks failed` : `all ${checks.length} checks pass`);
process.exit(bad.length ? 1 : 0);
