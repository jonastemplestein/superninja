// Nav verify: what Hear it again actually replays on turns (NAVIGATION.md §3.5, the sweep's unbuilt --nav mode).
// For the first few turns of each case: wait for quiet, tap Hear it again, record what it says, and compare with the
// instruction lines said since the previous turn (or the level's start). Usage: bun playtest/nav-verify/probe3.ts [out]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { LINES } from "../../src/content/lines";
import { isInstruction } from "../../src/content/instructions";
import { step as botStep, save } from "../../scripts/treadmill/bot";

const BASE = "http://localhost:5173";
const FAST = 4;
const OUT = process.argv[2] ?? "playtest/nav-verify/r1-replay";
mkdirSync(OUT, { recursive: true });
const TXT = new Map(LINES.map((l) => [l.id, l.text]));
const CASES = ["w1-wu1", "w1-wu2", "w1-2", "w1-7", "w1-4", "w2-1", "w1-6", "w1-8", "w1-9", "w6-br1", "w2-2", "placement"];
const TURNS = 4;
const out: string[] = [];

const id = (url: string) => {
  let m;
  if ((m = url.match(/\/a\/l\/([^/]+)\.mp3/))) return `L:${m[1]}`;
  if ((m = url.match(/\/a\/p\/([^/]+)\.mp3/))) return `/${m[1]}/`;
  if ((m = url.match(/\/a\/[wxo]\/([^/]+)\.mp3/))) return `"${m[1]}"`;
  return null;
};

async function run(b: any, name: string) {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
  const page: Page = await ctx.newPage();
  await page.goto(BASE + "/play/");
  const sv = name === "placement" ? save({ seenPlacement: false }) : save();
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem("superninja.save.v1", JSON.stringify(s));
    sessionStorage.setItem("sn.setup", "done");
  }, { ...sv, settings: { relaxed: false, music: 0, captions: true, unlockAll: true } });
  await page.addInitScript(() => void ((window as any).__audioLog = []));
  await page.goto(`${BASE}${name === "placement" ? "/play/?scene=placement" : `/play/?level=${name}`}&fast=${FAST}`);
  await page.waitForTimeout(600);
  await page.mouse.click(420, 4).catch(() => {});
  const t0 = Date.now();
  let turns = 0, lastTurn = "", mark = 0;
  const lines: string[] = [`## ${name}`];
  while (Date.now() - t0 < 90_000 && turns < TURNS) {
    if (await page.locator('button[aria-label="Play again"]').count()) break;
    const s: any = await page.evaluate(() => ({ st: (window as any).__snState, nav: (window as any).__snNav, n: (window as any).__audioLog.length })).catch(() => null);
    if (!s) continue;
    const key = s.st?.next && !s.st.busy ? `${s.st.scene}|${s.st.next}|${s.st.beat ?? ""}|${s.st.word ?? ""}` : "";
    if (key && key !== lastTurn) {
      lastTurn = key;
      // quiet
      for (let k = 0; k < 40; k++) {
        const loud = await page.evaluate(() => !!document.querySelector(".help-btn.talking, .bubble")).catch(() => false);
        if (!loud) break;
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(300);
      const before = await page.evaluate(() => (window as any).__audioLog.map((a: any) => a.url)).catch(() => []);
      const said = before.slice(mark).map(id).filter(Boolean) as string[];
      const instr = said.filter((x) => x.startsWith("L:") && isInstruction(x.slice(2)));
      const again = page.locator('[data-nav="again"]').first();
      if (!(await again.count())) {
        lines.push(`- turn ${key}: NO Hear it again. Instructions since last turn: ${instr.join(", ")}`);
      } else {
        const n0 = before.length;
        await again.dispatchEvent("pointerdown").catch(() => {});
        await page.waitForTimeout(400);
        for (let k = 0; k < 80; k++) {
          const loud = await page.evaluate(() => !!document.querySelector(".help-btn.talking, .bubble")).catch(() => false);
          if (!loud) break;
          await page.waitForTimeout(150);
        }
        const rep = ((await page.evaluate((n) => (window as any).__audioLog.slice(n).map((a: any) => a.url), n0).catch(() => [])) as string[]).map(id).filter(Boolean) as string[];
        const repL = new Set(rep.filter((x) => x.startsWith("L:")));
        const missing = instr.filter((x) => !repL.has(x));
        lines.push(`- turn ${key}\n    said since last turn: ${said.join(" ")}\n    Hear it again: ${rep.join(" ") || "(silent)"}\n    instructions not replayed: ${missing.map((m) => `${m} "${TXT.get(m.slice(2))?.slice(0, 60)}"`).join("; ") || "none"}`);
        const st2: any = await page.evaluate(() => (window as any).__snState).catch(() => null);
        if (st2?.next !== s.st.next) lines.push(`    !! the turn changed after Hear it again: ${JSON.stringify(st2)}`);
      }
      mark = (await page.evaluate(() => (window as any).__audioLog.length).catch(() => 0)) as number;
      turns++;
    }
    await botStep(page).catch(() => {});
    await page.waitForTimeout(250);
  }
  out.push(lines.join("\n"));
  console.log(lines.join("\n"));
  await ctx.close();
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const q = [...CASES];
await Promise.all(Array.from({ length: 4 }, async () => { while (q.length) await run(b, q.shift()!).catch((e) => console.error(e)); }));
await b.close();
writeFileSync(`${OUT}/replays.md`, out.join("\n\n"));
