// Nav verify probe (docs/NAVIGATION.md): plays scenarios at 844x390 like a patient child. On every held step it
// (1) idles 20 s of game time and checks nothing moved on, the arrow glowed by ~9 s and nav_ready played by ~17 s,
// (2) taps Hear it again and checks something is said, (3) taps Back (once per show) and checks the step went back,
// then taps Next. On every screen it checks Home (one, >= 44 px, in the Home zone, not covered). It films frames.
// Usage: bun playtest/nav-verify/probe.ts [outDir] [scenario,scenario]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { isInstruction } from "../../src/content/instructions";
import { step as botStep, save } from "../../scripts/treadmill/bot";

const BASE = "http://localhost:5173";
const FAST = 4;
const OUT = process.argv[2] ?? "playtest/nav-verify/r1";
const ONLY = process.argv[3]?.split(",");
const LINE = new Map(LINES.map((l) => [l.id, l.text]));
const G = (gameMs: number) => gameMs / FAST; // game ms -> real ms

type Issue = { scenario: string; kind: string; at: string; detail: string; shot?: string };
const issues: Issue[] = [];

const FRESH = { v: 1, hero: null, seenIntro: false, stars: {}, read: {}, spell: {}, words: {}, petals: [], energy: {}, gems: [], placed: [], settings: { relaxed: false, music: 0, captions: true, unlockAll: false }, minutes: 0, sessions: 0, stickers: [], shiny: [], adjustLog: [], captionsV2: true };
const FLOWER = {
  petals: ["a", "i", "m", "s", "t", "n", "o", "p", "b", "c", "g", "h", "d", "e", "f", "v", "k", "l", "r", "u", "ff", "ll", "ss", "ai", "ay"],
  gems: ["a>a", "t>t", "m>m", "s>s", "ay>ae"],
  energy: { "ai>ae": 8, "i>i": 5, "n>n": 3, "ss>s": 4 },
  words: { rain: { n: 2, ok: 2, last: 3 }, tail: { n: 1, ok: 1, last: 2 }, day: { n: 1, ok: 1, last: 1 } },
};

interface Scenario {
  name: string;
  url: string;
  /** profile save (written as a real profile) */
  save: object;
  maxS: number; // real seconds
  stop: (s: Snap) => boolean;
  /** idle-test at most this many held steps (default all) */
  idle?: number;
}
const SCEN: Scenario[] = [
  { name: "first-session", url: "/play/", save: FRESH, maxS: 330, stop: (s) => s.route?.startsWith("map") && s.stScene === "map" },
  { name: "story-w1-14", url: "/play/?level=w1-14", save: save(), maxS: 200, stop: (s) => s.route?.startsWith("map") },
  { name: "flower-first-visit", url: "/play/?scene=tree", save: save({ ...FLOWER, seenFlower: false }), maxS: 120, stop: (s) => s.stScene === "tree" && s.stStep === "free" && s.heldCount > 0 },
  { name: "flower-found", url: "/play/?scene=tree&visit=spelling:ai>ae,ay>ae", save: save(FLOWER), maxS: 120, stop: (s) => !!s.route?.startsWith("map") },
  { name: "flower-world", url: "/play/?scene=tree&visit=world:3", save: save(FLOWER), maxS: 120, stop: (s) => !!s.route?.startsWith("map") },
  { name: "flower-victory", url: "/play/?scene=tree&gem=ai>ae&celebrate=1", save: save(FLOWER), maxS: 150, stop: (s) => !!s.route?.startsWith("map") },
  { name: "training", url: "/play/?scene=training", save: save({ seenTraining: false }), maxS: 90, stop: (s) => !!s.route && !s.route.startsWith("training") },
  { name: "finale", url: "/play/?scene=finale", save: save(), maxS: 90, stop: (s) => !!s.route?.startsWith("map") },
  { name: "book", url: "/play/?scene=book", save: save({ seenBook: false, stickers: ["sun", "sock", "cat"] }), maxS: 12, stop: () => false },
  { name: "grownups", url: "/play/?scene=grownups", save: save(), maxS: 8, stop: () => false },
  { name: "reward-w2-1", url: "/play/?scene=reward&id=w2-1&stars=3&closing=dojo_done", save: save(), maxS: 60, stop: (s) => !!s.route?.startsWith("map") || !!s.route?.startsWith("tree") },
].filter((s) => !ONLY || ONLY.includes(s.name));

type Snap = {
  route: string | null; stScene: string | null; stNext: string | null; stBusy: boolean; stStep: string | null; st: any; nav: any;
  home: { n: number; w: number; h: number; x: number; y: number; hit: string | null } | null; title: boolean;
  talking: boolean; again: { w: number; covered: boolean } | null; next: { w: number; cls: string; covered: boolean } | null; back: boolean;
  audioN: number; now: number; heldCount: number;
};

const INIT = () => {
  const w = window as any;
  w.__audioLog = [];
  w.__snInput = [];
  w.__snTrack = [];
  const track = (k: string, v: unknown) => w.__snTrack.push({ t: performance.now(), k, v });
  let route: unknown, state: any = null, nav: any = null, turnKey = "", presKey: string | null = null;
  Object.defineProperty(w, "__snRoute", { configurable: true, get: () => route, set: (v) => void (v !== route && ((route = v), track("route", v))) });
  Object.defineProperty(w, "__snState", {
    configurable: true,
    get: () => state,
    set: (v) => {
      state = v;
      const next = v && typeof v.next === "string" ? v.next : null;
      const key = JSON.stringify([v?.scene ?? null, next, !!v?.busy, v?.step ?? null, v?.shot ?? null, v?.page ?? null]);
      if (key !== turnKey) (turnKey = key), track("turn", { scene: v?.scene ?? null, next, busy: !!v?.busy, step: v?.step ?? null, shot: v?.shot ?? null, page: v?.page ?? null });
    },
  });
  Object.defineProperty(w, "__snNav", {
    configurable: true,
    get: () => nav,
    set: (v) => {
      nav = v;
      const key = v?.pres ? `${v.pres.id}#${v.pres.step}` : null;
      if (key !== presKey) (presKey = key), track("pres", key);
    },
  });
  window.addEventListener("pointerdown", (e) => {
    const el = e.target instanceof Element ? e.target : null;
    const n = el?.closest("[data-nav]"), l = el?.closest("[aria-label]");
    w.__snInput.push({ t: performance.now(), nav: n?.getAttribute("data-nav") ?? null, label: l?.getAttribute("aria-label") ?? null });
  }, true);
};

async function snap(page: Page, heldCount: number): Promise<Snap | null> {
  return page
    .evaluate((hc) => {
      const w = window as any;
      const stage = document.querySelector(".stage");
      const sr = stage?.getBoundingClientRect();
      const sc = sr ? sr.width / 1280 : 1;
      const vis = (el: Element) => {
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return !(s.visibility === "hidden" || s.display === "none" || Number(s.opacity) <= 0.3 || r.width <= 2 || r.height <= 2);
      };
      const hitOf = (el: Element) => {
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !top || top === el || el.contains(top) ? null : `${top.tagName.toLowerCase()}.${String(top.className).split(" ")[0]}[${top.getAttribute("aria-label") ?? ""}]`;
      };
      const homes = [...document.querySelectorAll('[data-nav="home"]')].filter(vis);
      const h = homes[0];
      let home = null;
      if (h && sr) {
        const r = h.getBoundingClientRect();
        home = { n: homes.length, w: Math.round(r.width), h: Math.round(r.height), x: Math.round((r.left + r.width / 2 - sr.left) / sc), y: Math.round((r.top + r.height / 2 - sr.top) / sc), hit: hitOf(h) };
      } else if (homes.length === 0) home = null;
      const ag = [...document.querySelectorAll('[data-nav="again"]')].filter(vis)[0];
      const nx = [...document.querySelectorAll('[data-nav="next"]')].filter(vis)[0];
      const st = w.__snState ?? null;
      return {
        route: w.__snRoute ?? null,
        stScene: st?.scene ?? null,
        stNext: typeof st?.next === "string" ? st.next : null,
        stBusy: !!st?.busy,
        stStep: st?.step != null ? String(st.step) : null,
        st,
        nav: w.__snNav ?? null,
        home,
        title: !!document.querySelector(".scene.title"),
        talking: !!document.querySelector(".help-btn.talking, .bubble"),
        again: ag ? { w: Math.round(ag.getBoundingClientRect().width), covered: !!hitOf(ag) } : null,
        next: nx ? { w: Math.round(nx.getBoundingClientRect().width), cls: nx.className, covered: !!hitOf(nx) } : null,
        back: [...document.querySelectorAll('[data-nav="back"]')].some(vis),
        audioN: (w.__audioLog ?? []).length,
        now: performance.now(),
        heldCount: hc,
      };
    }, heldCount)
    .catch(() => null);
}

const tap = async (page: Page, sel: string) => {
  const el = page.locator(sel).first();
  if (!(await el.count())) return false;
  await el.dispatchEvent("pointerdown", undefined, { timeout: 800 }).catch(() => {});
  return true;
};
const audioSince = (page: Page, n: number) => page.evaluate((k) => ((window as any).__audioLog ?? []).slice(k), n).catch(() => [] as any[]);
const decode = (a: any) => {
  let m;
  if ((m = a.url.match(/\/a\/l\/([^/]+)\.mp3/))) return `line:${m[1]}`;
  if ((m = a.url.match(/\/a\/s\/([^/]+)\.mp3/))) return `story:${m[1]}`;
  if ((m = a.url.match(/\/a\/p\/([^/]+)\.mp3/))) return `sound:${m[1]}`;
  if ((m = a.url.match(/\/a\/[wxo]\/([^/]+)\.mp3/))) return `word:${m[1]}`;
  return a.kind === "speech" ? `speech:${a.url}` : null;
};

async function runScenario(browser: any, sc: Scenario) {
  const dir = `${OUT}/${sc.name}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  const log: string[] = [];
  const t0 = Date.now();
  const gt = () => (((Date.now() - t0) * FAST) / 1000).toFixed(1).padStart(6);
  const note = (s: string) => log.push(`${gt()}s ${s}`);
  const issue = (kind: string, at: string, detail: string, shot?: string) => {
    if (issues.some((i) => i.scenario === sc.name && i.kind === kind && i.at === at)) return;
    issues.push({ scenario: sc.name, kind, at, detail, shot });
    note(`!! ${kind} @ ${at}: ${detail}`);
  };
  page.on("pageerror", (e) => issue("pageerror", e.message.slice(0, 60), e.message));
  let shotN = 0;
  const shoot = async (why: string) => {
    const f = `${String(shotN++).padStart(3, "0")}_${why.replace(/[^a-z0-9#:.-]+/gi, "-").replace(/[:#]/g, "_")}.png`;
    await page.screenshot({ path: `${dir}/${f}` }).catch(() => {});
    return f;
  };
  await page.goto(BASE + "/play/");
  await page.evaluate((s) => {
    localStorage.clear();
    const id = "pnav";
    localStorage.setItem("superninja.profiles.v1", JSON.stringify({ list: [{ id, name: "Ninja", hero: (s as any).hero ?? null, created: Date.now(), last: Date.now() }], current: id }));
    localStorage.setItem(`superninja.save.${id}`, JSON.stringify(s));
    sessionStorage.setItem("sn.setup", "done");
  }, { ...sc.save, settings: { ...((sc.save as any).settings ?? {}), relaxed: false, music: 0, captions: true } });
  await page.addInitScript(INIT);
  await page.goto(`${BASE}${sc.url}${sc.url.includes("?") ? "&" : "?"}fast=${FAST}`);
  await page.waitForTimeout(700);
  await page.mouse.click(420, 4).catch(() => {}); // unlock audio (a tap on the stage's top edge)

  const seenPos = new Set<string>();
  const homeChecked = new Set<string>();
  const backTested = new Set<string>();
  let held = 0, idleTests = 0;
  let lastKey = "";
  let turnSeen = new Set<string>();
  while (Date.now() - t0 < sc.maxS * 1000) {
    const s = await snap(page, held);
    if (!s) { await page.waitForTimeout(200); continue; }
    if (sc.stop(s)) { note(`stop: route ${s.route} scene ${s.stScene}`); await page.waitForTimeout(G(3000)); await shoot(`end-${s.route}`); const s2 = await snap(page, held); if (s2 && !s2.title && !s2.home) issue("home-missing", `${s2.route}`, "no Home at the end screen"); break; }
    const pres = s.nav?.pres ? `${s.nav.pres.id}#${s.nav.pres.step}/${s.nav.pres.of}` : null;
    const key = `${s.route}|${pres}|${s.stScene}|${s.stNext}|${s.stStep}|${s.nav?.next}`;
    if (key !== lastKey) {
      note(`pos route=${s.route} pres=${pres} scene=${s.stScene} next=${s.stNext} step=${s.stStep} nav.next=${s.nav?.next} again=${!!s.again} back=${s.back} home=${s.home ? `${s.home.w}px@${s.home.x},${s.home.y}${s.home.hit ? " COVERED by " + s.home.hit : ""}` : "none"}`);
      lastKey = key;
    }
    // Home on every screen (not the title); checked once per position after the fade (300 ms real)
    const hk = `${s.route}|${pres}|${s.stScene}`;
    if (!homeChecked.has(hk) && !s.title) {
      await page.waitForTimeout(250);
      const s2 = await snap(page, held);
      if (s2 && `${s2.route}|${s2.nav?.pres ? `${s2.nav.pres.id}#${s2.nav.pres.step}/${s2.nav.pres.of}` : null}|${s2.stScene}` === hk && !s2.title) {
        homeChecked.add(hk);
        if (!s2.home) issue("home-missing", hk, "no visible Home", await shoot(`home-missing-${hk}`));
        else {
          if (s2.home.n > 1) issue("home-duplicate", hk, `${s2.home.n} Homes`);
          if (s2.home.w < 44 || s2.home.x > 130 || s2.home.y > 130) issue("home-misplaced", hk, JSON.stringify(s2.home));
          if (s2.home.hit) issue("home-covered", hk, `covered by ${s2.home.hit}`, await shoot(`home-covered-${hk}`));
        }
      }
    }
    const t = s.stScene;
    // the pre-game screens
    if (s.title) { await page.waitForTimeout(G(1500)); await shoot("title"); await tap(page, 'button[aria-label="Start"]'); await page.waitForTimeout(G(1200)); continue; }
    if (s.route?.startsWith("profiles")) { await shoot("profiles"); await tap(page, '[aria-label^="player "]'); await page.waitForTimeout(G(1500)); continue; }
    if (t === "choose" && !s.st?.picked && !s.talking) { await shoot("choose"); await page.waitForTimeout(G(1200)); await tap(page, '[aria-label="kai"]'); await page.waitForTimeout(G(800)); continue; }

    // a held step: Next is ready
    if (s.nav?.next === "ready") {
      const pos = `${s.route}|${pres ?? s.stScene}|${s.stNext ?? ""}|${s.stStep ?? ""}|${s.st?.shot ?? ""}|${s.st?.page ?? ""}`;
      if (!seenPos.has(pos)) {
        seenPos.add(pos);
        held++;
        const f0 = await shoot(`held-${pres ?? s.stScene}`);
        note(`HELD ${pos} (Next ${s.next?.w}px on the phone, again=${s.again ? s.again.w + "px" : "NONE"}, back=${s.back})`);
        if (s.next && s.next.w < 44) issue("next-small", pos, `Next ${s.next.w}px`);
        if (s.next?.covered) issue("next-covered", pos, "Next is covered", f0);
        // (1) idle 20 s of game time: nothing moves on, the arrow glows, Sensei says nav_ready
        if (sc.idle == null || idleTests < sc.idle) {
          idleTests++;
          const n0 = s.audioN;
          let moved = false, glowed = false, s9: string | undefined;
          const start = Date.now();
          while (Date.now() - start < G(20500)) {
            await page.waitForTimeout(200);
            const q = await snap(page, held);
            if (!q) continue;
            const qp = q.nav?.pres ? `${q.nav.pres.id}#${q.nav.pres.step}/${q.nav.pres.of}` : null;
            const qpos = `${q.route}|${qp ?? q.stScene}|${q.stNext ?? ""}|${q.stStep ?? ""}|${q.st?.shot ?? ""}|${q.st?.page ?? ""}`;
            if (qpos !== pos || q.nav?.next !== "ready") { moved = true; issue("auto-advance-idle", pos, `while the child idled it went to ${qpos} (nav.next=${q.nav?.next})`, await shoot(`moved-${pres}`)); break; }
            if (q.next?.cls.includes("glow")) glowed = true;
            if (!s9 && Date.now() - start > G(10000)) s9 = await shoot(`idle10s-${pres ?? s.stScene}`);
          }
          if (!moved) {
            const heard = (await audioSince(page, n0)).map(decode).filter(Boolean);
            const f = await shoot(`idle20s-${pres ?? s.stScene}`);
            note(`  idle 20s: still held; glow=${glowed}; said: ${heard.join(", ") || "nothing"}`);
            if (!glowed) issue("idle-no-glow", pos, "the Next arrow never glowed in 20 s idle", s9);
            if (!heard.includes("line:nav_ready")) issue("idle-no-nav-ready", pos, `nav_ready not said in 20 s idle (said: ${heard.join(", ") || "nothing"})`, f);
          } else continue;
        }
        // (2) Hear it again
        const q = await snap(page, held);
        if (q && q.again) {
          const n0 = q.audioN;
          await tap(page, '[data-nav="again"]');
          await page.waitForTimeout(G(3000));
          const heard = (await audioSince(page, n0)).map(decode).filter(Boolean) as string[];
          note(`  Hear it again → ${heard.join(", ") || "SILENT"}`);
          if (!heard.length) issue("replay-silent", pos, "Hear it again said nothing within 3 s game time");
          else if (heard.every((h) => h === "line:nav_ready")) issue("replay-stale", pos, "Hear it again only said nav_ready");
          // wait for the step to be ready again
          for (let k = 0; k < 60; k++) {
            const z = await snap(page, held);
            if (z && z.nav?.next === "ready" && !z.talking) break;
            await page.waitForTimeout(250);
          }
        } else if (q) issue("no-replay-on-held-step", pos, "a held step with no visible Hear it again", await shoot(`noreplay-${pres ?? s.stScene}`));
        // (3) Back, once per show, from a step > 0
        const showId = s.nav?.pres?.id;
        if (showId && s.nav.pres.step > 0 && !backTested.has(showId)) {
          backTested.add(showId);
          if (!s.back) issue("no-back", pos, `step ${s.nav.pres.step} of ${showId} has no Back`);
          else {
            await tap(page, '[data-nav="back"]');
            await page.waitForTimeout(G(800));
            const z = await snap(page, held);
            const zs = z?.nav?.pres;
            note(`  Back → ${zs ? `${zs.id}#${zs.step}` : "(no show)"}`);
            if (!zs || zs.id !== showId || zs.step !== s.nav.pres.step - 1) issue("back-broken", pos, `Back went to ${JSON.stringify(zs)}`);
            // wait until that step is ready, then Next back to where we were
            for (let k = 0; k < 160; k++) {
              const y = await snap(page, held);
              if (y && y.nav?.next === "ready") break;
              await page.waitForTimeout(250);
            }
            await shoot(`back-${showId}`);
            await tap(page, '[data-nav="next"]');
            await page.waitForTimeout(G(600));
            continue;
          }
        }
      }
      if (await page.locator('button[aria-label="Play again"]').count()) {
        // a level's reward: Next leaves it
        note("reward: tap Next");
      }
      await page.waitForTimeout(G(600));
      await tap(page, '[data-nav="next"]');
      note("  > Next");
      await page.waitForTimeout(G(700));
      continue;
    }
    // a turn: wait for the quiet, check Hear it again, then let the bot answer
    if (s.stNext && !s.stBusy) {
      const tk = `${s.route}|${s.stScene}|${s.stNext}|${s.st?.beat ?? ""}`;
      if (!turnSeen.has(tk)) {
        turnSeen.add(tk);
        for (let k = 0; k < 20; k++) {
          const z = await snap(page, held);
          if (!z || !z.talking) break;
          await page.waitForTimeout(150);
        }
        await page.waitForTimeout(G(1000));
        const z = await snap(page, held);
        if (z && z.stNext === s.stNext && !z.again && !["map", "optin", "choose", "tut-gong", "tut-help"].includes(z.stScene ?? ""))
          issue("turn-no-replay", tk, "a turn waits with no visible Hear it again", await shoot(`turn-noreplay-${s.stScene}`));
        if (turnSeen.size % 3 === 1) await shoot(`turn-${s.stScene}-${s.stNext}`);
      }
    }
    await botStep(page).catch(() => {});
    await page.waitForTimeout(G(900));
  }
  // post hoc: every show step change and every route change needs a child tap since the last change
  const { tr, inp, audio } = await page.evaluate(() => ({ tr: (window as any).__snTrack ?? [], inp: (window as any).__snInput ?? [], audio: (window as any).__audioLog ?? [] })).catch(() => ({ tr: [], inp: [], audio: [] }));
  let lastPres: { v: string | null; t: number } = { v: null, t: 0 };
  let lastRoute: { v: string | null; t: number } = { v: null, t: 0 };
  const between = (a: number, b: number) => inp.filter((i: any) => i.t >= a && i.t <= b);
  for (const ev of tr) {
    if (ev.k === "pres") {
      if (lastPres.v && ev.v !== lastPres.v) {
        const ins = between(lastPres.t, ev.t);
        if (!ins.some((i: any) => ["next", "back", "home", "again"].includes(i.nav))) issue("auto-advance", `${lastPres.v} → ${ev.v}`, `step changed with no Next/Back/Home tap (taps: ${ins.map((i: any) => i.nav ?? i.label).join(", ") || "none"})`);
      }
      lastPres = { v: ev.v, t: ev.t };
    }
    if (ev.k === "route") {
      if (lastRoute.v && ev.v !== lastRoute.v) {
        const ins = between(lastRoute.t, ev.t);
        if (!ins.length) issue("auto-advance-route", `${lastRoute.v} → ${ev.v}`, "route changed with no tap at all");
      }
      lastRoute = { v: ev.v, t: ev.t };
    }
  }
  const tl = [
    ...tr.map((e: any) => ({ t: e.t, s: `track ${e.k} ${JSON.stringify(e.v)}` })),
    ...inp.map((e: any) => ({ t: e.t, s: `  TAP ${e.nav ?? ""} ${e.label ?? ""}` })),
  ].sort((a: any, b: any) => a.t - b.t);
  const off = tl.length ? tl[0].t : 0;
  writeFileSync(`${dir}/timeline.txt`, tl.map((e: any) => `${(((e.t - off) * FAST) / 1000).toFixed(1).padStart(7)} ${e.s}`).join("\n"));
  writeFileSync(`${dir}/audio.txt`, audio.map((a: any) => `${decode(a) ?? a.url} ${a.kind}${decode(a)?.startsWith("line:") ? "  " + (LINE.get(decode(a)!.slice(5)) ?? "") : ""}`).join("\n"));
  writeFileSync(`${dir}/log.txt`, log.join("\n"));
  console.log(`${sc.name}: ${held} held steps, ${idleTests} idle tests, ${issues.filter((i) => i.scenario === sc.name).length} issues`);
  await ctx.close();
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const queue = [...SCEN];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) await runScenario(browser, queue.shift()!).catch((e) => console.error("scenario failed", e));
  }),
);
await browser.close();
writeFileSync(`${OUT}/issues.json`, JSON.stringify(issues, null, 1));
console.log(`${issues.length} issues → ${OUT}/issues.json`);
