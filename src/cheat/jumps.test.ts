/// <reference types="node" />
// The cheat menu's jumps (src/cheat/jumps.ts, docs/CHEATS.md): with "Reload the page on jump" on, every jump lands on the
// screen it names (one whose screen needs more than its deep link carries goes in-app instead), and "Reward with Jump
// ahead" opens a reward that offers Jump ahead by the game's own rule (shouldOfferJump), or says why it can't.
// Run: bun test src/cheat/jumps.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// store.ts, fast.ts and ui.tsx expect a browser: a minimal one, recording where a reload goes and what App's go() is given
const mem = new Map<string, string>();
const assigned: string[] = [];
const gone: unknown[] = [];
const g = globalThis as Record<string, unknown>;
g.localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
g.document ??= { addEventListener() {}, visibilityState: "visible" };
g.window ??= globalThis;
g.addEventListener ??= () => {};
g.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.Image ??= class { src = ""; onload = null; onerror = null; decode = () => Promise.resolve(); };
g.location = { search: "", pathname: "/play/", assign: (u: string) => void assigned.push(u) };
g.history = { state: null, replaceState() {} };

const J = await import("./jumps");
const A = await import("./actions");
const { store } = await import("../engine/store");
const { shouldOfferJump, frontier } = await import("../engine/gems");
const { LEVELS, WORLDS, levelById } = await import("../content/worlds");
type Route = import("./jumps").AppRoute;
type Jump = import("./jumps").Jump;

const NOW = Date.UTC(2026, 8, 27, 9);
/** a route without its undefined fields (App's parser writes closing: undefined) */
const plain = (r: unknown) => JSON.parse(JSON.stringify(r));
const isJump = (j: unknown): j is Jump => !!j && typeof j === "object";
const load = (s: ReturnType<typeof A.blankSave>) => A.commit(s);
const worldId = (name: string) => WORLDS.find((w) => w.name === name)!.id;

/** The route App starts on for an address: its useState initialiser, as the first test pins it (it reads only these). */
function landing(q: string): Route {
  const p = new URLSearchParams(q);
  const lv = p.get("level");
  if (p.get("practise") || p.get("trial")) return { name: "level", id: "trial" };
  if (lv && (lv === "review" || levelById(lv))) return { name: "level", id: lv };
  const sc = p.get("scene");
  if (sc === "reward") return { name: "reward", id: levelById(p.get("id") ?? "") ? p.get("id")! : "w2-1", stars: Number(p.get("stars") ?? 3), closing: p.get("closing") ?? undefined };
  if (sc) return { name: sc } as Route;
  return { name: "title" };
}

test("App's deep links still read only ?level, ?trial, ?practise, ?scene, and the reward's id, stars and closing", () => {
  const src = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const start = src.indexOf("useState<Route>(() => {");
  assert.ok(start > 0, "App's first route is a useState initialiser");
  const block = src.slice(start, src.indexOf("\n  });", start));
  const keys = [...new Set([...block.matchAll(/q\.get\("(\w+)"\)/g)].map((m) => m[1]))].sort();
  // a new key here (a map's world, the opt-in's mode…) means survivesReload and landing() above can carry more
  assert.deepEqual(keys, ["closing", "id", "level", "practise", "scene", "stars", "trial"]);
});

test("with reload on, every jump in the catalogue lands on the screen it names, or goes in-app", () => {
  const saves = { new: A.blankSave(), "mid-reception": A.presetSave("mid-reception", A.blankSave(), NOW), "end-year-2": A.presetSave("end-year-2", A.blankSave(), NOW) };
  for (const [name, s] of Object.entries(saves)) {
    load(s);
    let reloads = 0;
    for (const grp of J.catalogue({ gem: "ai>ae", level: "w2-3" }))
      for (const it of grp.items) {
        const j = it.jump();
        if (!isJump(j) || J.inAppOnly(j)) continue;
        reloads++;
        assert.deepEqual(plain(landing(j.url ?? J.urlOf(j.route))), plain(j.route), `${name}: ${it.id} (${j.url ?? J.urlOf(j.route)})`);
      }
    assert.ok(reloads > 30, `${name}: most jumps reload (${reloads})`);
  }
});

test("the verifier's wrong landings (27 Sep) go in-app with their whole route", () => {
  load(A.presetSave("mid-reception", A.blankSave(), NOW)); // the next stone, w4-1, is in Dragon River
  assert.equal(frontier().id, "w4-1");
  const items = new Map(J.catalogue({ gem: "ai>ae", level: "w2-3" }).flatMap((grp) => grp.items.map((it) => [it.id, it] as const)));
  const jump = (id: string) => items.get(id)!.jump() as Jump;
  for (const id of [`map-${worldId("Shadow Castle")}`, `map-${worldId("Sky Temple")}`, "map-welcome", "map-super", "map-again", "map-first", "optin-year"])
    assert.equal(J.inAppOnly(jump(id)), true, id);
  // the next stone's own land is a plain ?scene=map, which a reload carries
  const river = jump(`map-${worldId("Dragon River")}`);
  assert.equal(J.inAppOnly(river), false);
  assert.deepEqual(plain(landing(J.urlOf(river.route))), { name: "map" });

  g.__sn = { go: (r: unknown) => void gone.push(r) };
  g.__snRoute = "title";
  const before = assigned.length;
  const cases: [string, Route][] = [
    [`map-${worldId("Shadow Castle")}`, { name: "map", world: worldId("Shadow Castle") }],
    [`map-${worldId("Sky Temple")}`, { name: "map", world: worldId("Sky Temple") }],
    ["map-welcome", { name: "map", world: 4, intro: "welcome" }],
    ["map-super", { name: "map", world: 4, intro: "super" }],
    ["map-again", { name: "map", world: 4, intro: "again" }],
    ["map-first", { name: "map", world: 4, intro: "stickerbook" }],
    ["optin-year", { name: "optin", mode: "newyear" }],
  ];
  for (const [id, want] of cases) {
    assert.equal(J.runJump(jump(id), { reload: true }), "in-app", id);
    assert.deepEqual(gone.at(-1), want, id);
  }
  assert.equal(assigned.length, before, "no reload");
  // an ordinary jump still reloads
  assert.equal(J.runJump(J.levelJump("w2-1"), { reload: true }), "reload");
  assert.equal(assigned.at(-1), "/play/?level=w2-1");
});

test("Reward with Jump ahead: the reward of the last level finished after the warm-ups, offering Jump ahead by the game's rule", () => {
  // the warm-ups done and three levels after them finished imperfectly, in session 1: the stars and session are set
  const early = { ...A.presetSave("warmups", A.blankSave(), NOW), sessions: 1 };
  for (const id of ["w1-2", "w1-3", "w1-4"]) early.stars[id] = 2;
  const cases: [string, ReturnType<typeof A.blankSave>, string][] = [
    ["early", early, "w1-4"],
    ["mid-reception", A.presetSave("mid-reception", A.blankSave(), NOW), "w3-12"],
    ["mid-reception, offered this session", { ...A.presetSave("mid-reception", A.blankSave(), NOW), narr: { ...A.presetSave("mid-reception", A.blankSave(), NOW).narr, "jump-offer": { n: 1, at: [3], s: [18] } } }, "w3-12"],
  ];
  for (const [name, s, want] of cases) {
    const r = J.jumpOfferReward(s);
    assert.ok(isJump(r), `${name}: ${String(r)}`);
    assert.deepEqual(r.route, { name: "reward", id: want, stars: 3 }, name);
    const x = structuredClone(s) as ReturnType<typeof A.blankSave>;
    r.save!(x);
    // not a sticker reward (App's stickerReward: a warm-up, or a lesson of the first session), which has no Jump ahead
    assert.equal(!!levelById(want).warmup || !!x.firstSession?.lessons.includes(want), false, name);
    assert.equal(J.offerHolds(x), true, name);
    load(x);
    const st = store.get();
    assert.equal(shouldOfferJump({ ...st, stars: { ...st.stars, [want]: Math.max(st.stars[want] ?? 0, 3) } }), true, `${name}: the game offers it`);
  }
});

test("Reward with Jump ahead says why when no star edit can make the offer show", () => {
  const cases: [string, ReturnType<typeof A.blankSave>, RegExp][] = [
    ["new", A.blankSave(), /three levels finished after the warm-ups \(0 so far\)/],
    ["warm-ups done", A.presetSave("warmups", A.blankSave(), NOW), /three levels finished after the warm-ups \(0 so far\)/],
    ["placed", A.presetSave("mid-reception", A.blankSave(), NOW, { placed: true }), /three levels/],
    ["end of Reception", A.presetSave("end-reception", A.blankSave(), NOW), /no further than w6-1, and the next stone is w6-1/],
    ["middle of Year 1", A.presetSave("mid-year-1", A.blankSave(), NOW), /no further than w6-1/],
    ["end of Year 1", A.presetSave("end-year-1", A.blankSave(), NOW), /no further than w6-1/],
    ["end of Year 2", A.presetSave("end-year-2", A.blankSave(), NOW), /no further than w6-1, and every level is finished/],
  ];
  for (const [name, s, why] of cases) {
    const r = J.jumpOfferReward(s);
    assert.equal(typeof r, "string", name);
    assert.match(r as string, why, name);
    const x = structuredClone(s) as ReturnType<typeof A.blankSave>;
    const done = LEVELS.filter((l) => (x.stars[l.id] ?? 0) > 0);
    if (/three levels/.test(why.source)) {
      // any reward there is to show is a warm-up's sticker reward, which never offers Jump ahead
      assert.ok(done.every((l) => l.warmup), name);
      continue;
    }
    // and the game agrees: even with the last three levels perfect, sessions past 2 and the offer forgotten, no offer
    for (const l of done.slice(-3)) x.stars[l.id] = 3;
    x.sessions = Math.max(3, x.sessions);
    delete x.narr?.["jump-offer"];
    assert.equal(J.offerHolds(x), false, name);
    assert.equal(shouldOfferJump(x), false, `${name}: the game doesn't offer it either`);
  }
});

test("offerHolds is the game's rule (shouldOfferJump) without its side effects", () => {
  const base = A.presetSave("mid-reception", A.blankSave(), NOW);
  const variants: [string, (x: ReturnType<typeof A.blankSave>) => void, boolean][] = [
    ["as it is", () => {}, true],
    ["a 2-star level among the last three", (x) => void (x.stars["w3-11"] = 2), false],
    ["session 2", (x) => void (x.sessions = 2), false],
    ["offered last session", (x) => void ((x.narr ??= {})["jump-offer"] = { n: 1, at: [3], s: [x.sessions - 1] }), false],
    ["offered two sessions ago", (x) => void ((x.narr ??= {})["jump-offer"] = { n: 1, at: [3], s: [x.sessions - 2] }), true],
    ["placed at the End of Reception", (x) => void (x.placedAt = "w6-1"), false],
  ];
  for (const [name, f, want] of variants) {
    const x = structuredClone(base);
    x.sessions = 40 + variants.findIndex((v) => v[0] === name); // (a session of its own: shouldOfferJump remembers its last offer)
    f(x);
    assert.equal(J.offerHolds(x), want, name);
    assert.equal(shouldOfferJump(x), want, `${name}: the game`);
  }
});
