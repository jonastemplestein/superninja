// Playwriter bot step: taps the correct answer for the current scene. Returns a status string.
const st = await page.evaluate(() => window.__snState || {});
const reward = await page.locator(`button[aria-label="Play again"]`).count();
if (reward) st.scene = "reward";
const byLabel = async (label) => { const el = page.locator(`button[aria-label="${label}"]`).first(); if (await el.count()) { await el.click({ timeout: 1000, force: true }).catch(() => {}); return true; } return false; };
let did = st.scene === "reward" ? "stop" : "";
if (st.scene === "battle" || st.scene === "build" || st.scene === "find") { const t = page.locator(`.row button[aria-label="${st.next}"]`).first(); if (st.next && await t.count()) { await t.click({ timeout: 1000, force: true }).catch(() => {}); did = "tile " + st.next; } }
else if (st.scene === "learn") { if (await byLabel(st.next)) did = "learn " + st.next; }
else if (st.scene === "swap") {
  if (!st.busy) {
    if (st.picked === null || st.picked === undefined) { const tiles = page.locator(".slots .tile"); if (await tiles.count() > st.pos) { await tiles.nth(st.pos).click({ timeout: 1000, force: true }).catch(()=>{}); did = "swap pos " + st.pos; } }
    else { const opt = page.locator(`.row .tile[aria-label="${st.next}"]`).first(); if (await opt.count()) { await opt.click({ timeout: 1000, force: true }).catch(()=>{}); did = "swap new " + st.next; } }
  }
}
else if (st.scene === "run") { const r = await page.evaluate(() => window.__snRun && window.__snRun()); did = "run " + JSON.stringify(r); }
else if (st.scene === "sort") { if (st.next && await byLabel("basket " + st.next)) did = "sort " + st.next; }
for (const l of ["Next page", "I read it!", "Next"]) if (!did && await byLabel(l)) did = "btn " + l;
if (!did) { const choices = page.locator("button.tile.lg"); const n = await choices.count(); for (let k = 0; k < n; k++) { const c = choices.nth(k); const op = await c.evaluate((el) => getComputedStyle(el).opacity).catch(() => "1"); if (op !== "1" && k < n - 1) continue; await c.click({ timeout: 1000, force: true }).catch(()=>{}); did = "choice " + k; break; } }
if (!did) { const q = page.locator("button.card").first(); if (await q.count()) { await q.click({ timeout: 1000, force: true }).catch(()=>{}); did = "question"; } }
console.log(JSON.stringify({ scene: st.scene, did, url: page.url() }));
