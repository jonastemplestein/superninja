// Cheat menu check on a frozen build (docs/CHEATS.md): a phone held sideways (844×390, touch). Opens the menu with the
// corner taps, jumps to several places, applies two presets, and screenshots each step into playtest/cheat/.
// Usage (from the repo root, with a frozen build on 4901): bun playtest/cheat/verify.ts [--base http://127.0.0.1:4901]
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = (k: string, d: string) => (process.argv.includes(`--${k}`) ? process.argv[process.argv.indexOf(`--${k}`) + 1] : d);
const BASE = `${arg("base", "http://127.0.0.1:4901")}/play/`;
const OUT = "playtest/cheat";
mkdirSync(OUT, { recursive: true });

const log: string[] = [];
const note = (s: string) => (console.log(s), log.push(s));
const fails: string[] = [];
const check = (ok: unknown, what: string) => (ok ? note(`  ok   ${what}`) : (fails.push(what), note(`  FAIL ${what}`)));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
const chunks: string[] = [];
page.on("request", (r) => /CheatMenu-.*\.js/.test(r.url()) && chunks.push(r.url()));

let n = 0;
const shot = async (name: string) => {
  const f = `${OUT}/${String(++n).padStart(2, "0")}-${name}.png`;
  await page.screenshot({ path: f });
  note(`  shot ${f}`);
};
const wait = (ms: number) => page.waitForTimeout(ms);
const route = () => page.evaluate(() => (window as any).__snRoute as string);
const save = () => page.evaluate(() => (window as any).__sn.store.get());
const menuOpen = () => page.locator("#sn-cheat .ch").isVisible().catch(() => false);

async function corner() {
  for (let i = 0; i < 5; i++) {
    await page.touchscreen.tap(844 - 22, 22);
    await wait(160);
  }
  await page.locator("#sn-cheat .ch").waitFor({ timeout: 5000 });
}
async function tab(label: string) {
  await page.locator(".ch-tab", { hasText: label }).tap();
  await wait(250);
}
async function tapBtn(text: RegExp, scope = ".ch-btn") {
  const b = page.locator(scope, { hasText: text }).first();
  await b.scrollIntoViewIfNeeded();
  await b.tap();
}

note(`cheat menu check on ${BASE}`);
await page.goto(`${BASE}?scene=title`);
await wait(2500);
await shot("title-before");
check(chunks.length === 0, "the menu's chunk is not loaded before the first open");
check(!(await page.locator("#sn-cheat").count()), "no menu element while closed");

// ---- opening: four corner taps do nothing, the fifth opens it
note("open by five corner taps");
for (let i = 0; i < 4; i++) await page.touchscreen.tap(844 - 22, 22), await wait(160);
await wait(400);
check(!(await menuOpen()), "four taps: still closed");
await wait(2600); // the window has passed: the next five start afresh
await corner();
check(await menuOpen(), "five taps in the corner open the menu");
check(chunks.length === 1, `the chunk loads on the first open (${chunks.length})`);
await wait(400);
await shot("menu-jump-tab");
await page.locator(".ch-sec h3", { hasText: "World Flower (gem" }).scrollIntoViewIfNeeded();
await shot("menu-jump-flower");
await page.locator(".ch-sec h3", { hasText: "Teacher voice" }).evaluate((el) => el.scrollIntoView({ block: "start" }));
await shot("menu-jump-voice");

// ---- jump 1: a level from the grid
note("jump 1: level w1-7 (Sound Hunt)");
await page.locator(".ch-lv", { hasText: "soundhunt" }).first().tap();
await wait(3500);
check(!(await menuOpen()), "the menu closes on a jump");
check((await route()) === "level:w1-7", `route ${await route()}`);
await shot("jump-level-w1-7");

// ---- jump 2: a map
note("jump 2: Map: Shadow Castle");
await corner();
await tapBtn(/^Map: Shadow Castle/);
await wait(2500);
check((await route()) === "map", `route ${await route()}`);
check((await page.evaluate(() => (window as any).__snState?.world)) === 5, "the map shows land 5");
await shot("jump-map-castle");

// ---- jump 3: the petal detail (gem ai>ae)
note("jump 3: World Flower petal detail");
await corner();
await tapBtn(/^Petal detail/);
await wait(3000);
const tree = await page.evaluate(() => (window as any).__snState);
check(tree?.scene === "tree" && tree?.open === "ae", `tree open on /ae/ (${JSON.stringify(tree)})`);
await wait(1000);
check(!(await page.evaluate(() => location.search)).includes("open=1"), "the petal detail's transient URL is taken down");
await shot("jump-petal-detail");

// ---- jump 4: the gem-won celebration
note("jump 4: gem won");
await corner();
await tapBtn(/^Gem won/);
await wait(4500);
check((await page.evaluate(() => (window as any).__snState))?.visit === "gem", "the tree plays the gem visit");
check((await save()).gems.includes("ai>ae"), "the gem is won in the save");
await shot("jump-gem-won");

// ---- jump 5: a reward with new stickers and gems filling
note("jump 5: reward with stickers and gems");
await corner();
await page.locator(".ch-selects select").nth(1).selectOption("w2-4");
await tapBtn(/^Reward: new stickers/);
await wait(4200);
check((await route()) === "reward:w2-4", `route ${await route()}`);
const book = await page.locator(".rw-book-n").innerText().catch(() => "?");
check(Number(book) === (await save()).stickers.length, `the reward's book counts up to the book's total (${book})`);
await shot("jump-reward-stickers");

// ---- jump 6: teacher voice, a Monster Battle's recap after a struggle
note("jump 6: teacher voice: Monster Battle, recap after a struggle");
await corner();
await page.locator(".ch-chip", { hasText: /^Recap, struggled$/ }).tap();
await tapBtn(/^a Monster Battle/);
await wait(3000);
const battle = (await save()).narr?.["game:battle"];
check(battle?.struggled === true && battle?.n === 2, `ledger game:battle ${JSON.stringify(battle)}`);
check((await route()) === "level:w1-6", `route ${await route()}`);
await shot("jump-battle-recap");

// ---- preset 1: middle of Reception
note("preset 1: Middle of Reception");
await corner();
await tab("Mastery");
await wait(300);
await shot("menu-mastery-before");
await tapBtn(/^Middle of Reception/);
await wait(3000);
let s = await save();
check(s.stars["w3-12"] === 3 && !s.stars["w4-1"], "stars up to w3-12, none from w4-1");
check(s.gems.includes("m>m") && !s.gems.includes("ff>f"), "units 1–6 gems won, unit 7 charging");
check(Object.keys(s.words).length > 50 && s.stickers.includes("sun"), `${Object.keys(s.words).length} words found, warm-up stickers in the book`);
check((await route()) === "map" && (await page.evaluate(() => (window as any).__snState?.world)) === 4, "on the map of Dragon River");
await shot("preset-mid-reception-map");
await corner();
await tab("Mastery");
await wait(500);
await shot("menu-mastery-mid-reception");
await page.locator(".ch-sounds").evaluate((el) => el.scrollIntoView({ block: "start" }));
await wait(200);
await shot("menu-mastery-sounds");
await page.locator(".ch-gemrows").scrollIntoViewIfNeeded();
await wait(300);
await shot("menu-mastery-gems");

// ---- a sound tapped: /sh/ none → met
note("mastery: tap /sh/ (not met → met)");
const sh = page.locator(".ch-snd", { hasText: "/sh/" });
await sh.scrollIntoViewIfNeeded();
await sh.tap();
await wait(300);
check((await sh.getAttribute("class"))?.includes("met"), `/sh/ is met (${await sh.getAttribute("class")})`);
check((await save()).petals.includes("sh"), "sh is in the petals");

// ---- preset 2: end of Year 2 (the whole game)
note("preset 2: End of Year 2");
await tapBtn(/^End of Year 2/);
await wait(3000);
s = await save();
check(Object.keys(s.stars).length === (await page.evaluate(() => (window as any).__sn.LEVELS.length)), "every level finished");
await shot("preset-end-year-2-map");
note("jump 7: the World Flower, complete");
await corner();
await tab("Jump");
await tapBtn(/^A look \(free\)/);
await wait(3500);
await shot("jump-flower-complete");

// ---- the other tabs
note("tabs: Time and voice, Play, Save");
await corner();
await tab("Time and voice");
await wait(400);
await shot("menu-time");
await tapBtn(/^22 \(recaps\)/, ".ch-chip");
await wait(300);
check((await page.locator(".ch-game", { hasText: "Ninja Run" }).innerText()).includes("now recap"), "22 days away: the Ninja Run's intro is a recap");
await tab("Play");
await shot("menu-play");
await page.locator(".ch-toggle", { hasText: "Show __snState" }).tap();
await tab("Save");
await shot("menu-save");
await page.locator(".ch-close").tap();
await wait(600);
check(!(await page.locator("#sn-cheat").count()), "Close removes the menu");
check(await page.locator("#sn-cheat-state").isVisible(), "the __snState overlay is up");
await shot("state-overlay");

// ---- backquote, Escape, ?cheat=1, a reload-mode jump
note("keyboard: backquote opens, Escape closes");
await page.keyboard.press("Backquote");
await page.locator("#sn-cheat .ch").waitFor({ timeout: 3000 });
check(await menuOpen(), "backquote opens");
await page.keyboard.press("Escape");
await wait(300);
check(!(await menuOpen()), "Escape closes");

note("reload-mode jump: level w2-4");
await page.keyboard.press("Backquote");
await page.locator("#sn-cheat .ch").waitFor();
await tab("Jump"); // (the menu opens on the tab used last)
await page.locator(".ch-toggle", { hasText: "Reload the page on jump" }).tap();
await page.locator(".ch-lv", { hasText: "dojo" }).nth(2).tap(); // w1-4, w1-5, then w2-1
await page.waitForLoadState("load");
await wait(3000);
check((await page.evaluate(() => location.search)).includes("level=w2-1"), `reloaded on ${await page.evaluate(() => location.search)}`);
check((await route()) === "level:w2-1", `route ${await route()}`);
check(await page.locator("#sn-cheat-state").isVisible(), "the overlay came back after the reload");
await shot("reload-jump-w2-1");
await page.keyboard.press("Backquote");
await page.locator("#sn-cheat .ch").waitFor();
await tab("Jump");
await page.locator(".ch-toggle", { hasText: "Reload the page on jump" }).tap(); // back off
await tab("Play");
await page.locator(".ch-toggle", { hasText: "Show __snState" }).tap(); // overlay off
await page.keyboard.press("Escape");

note("?cheat=1 opens it on load");
await page.goto(`${BASE}?scene=title&cheat=1`);
await page.locator("#sn-cheat .ch").waitFor({ timeout: 8000 });
check(await menuOpen(), "?cheat=1 opens the menu");
await shot("cheat-param");

check(!errors.length, `no page errors (${errors.length})`);
for (const e of errors) note(`  ${e}`);
note(fails.length ? `\n${fails.length} FAILED:\n- ${fails.join("\n- ")}` : "\nall checks passed");
writeFileSync(`${OUT}/verify-log.txt`, log.join("\n") + "\n");
await browser.close();
process.exit(fails.length ? 1 : 0);
