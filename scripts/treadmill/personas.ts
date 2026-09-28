// Treadmill stage 3: persona playtesters. Each persona is a Codex agent (gpt-6-sol) driving its own headless browser,
// playing the game in character and filing structured findings. Runs in parallel; never touches the user's Chrome.
// Usage: bun scripts/treadmill/personas.ts <runDir> [--who maya,oscar] [--base http://localhost:5173] [--effort xhigh]
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { helpGuard } from "../lib/help";
if (import.meta.main) helpGuard(import.meta.url); // --help prints the usage above and exits

const [runDir] = process.argv.slice(2);
const arg = (k: string, d?: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const BASE = arg("base", "http://localhost:5173")!;
const EFFORT = arg("effort", "xhigh")!;

export const PERSONAS: Record<string, { who: string; brief: string }> = {
  maya: {
    who: "Maya, 3¾, cannot read, first time playing",
    brief: `You are Maya. You can't read. You tap fast, tap pictures and characters, tap while Sensei is still talking, sometimes
tap the same thing five times, and you give up (tap something else, or the home button) if nothing obvious happens within about
5 seconds. Start from ${BASE}/play/ as a brand-new player (fresh browser profile) and go through setup → profile → intro → training
→ the first Bamboo Village levels as far as you can get in ~20 minutes of game time. Report every dead end, every moment where
it's not obvious what to tap, anything that punishes random tapping, and whether success feels rewarding.`,
  },
  oscar: {
    who: "Oscar, 6, confident reader, impatient",
    brief: `You are Oscar. You can read CVC words and some digraphs, you're bored by slow bits and you try to skip, break or
speed-run things. Use ${BASE}/play/?level=<id> deep links (ids like w1-wu1 … w1-wu6, w1-8, w2-3, w3-2 … w6-11; see src/content/worlds.ts) to play at
least one level of every kind across worlds 2–6, including a sort, a swap, a run, a story and a boss. Try the jump-ahead offer and
the Word Book / World Flower (a swipeable scroll of petals). Report pacing problems (waiting too long, repetition), exploits, softlocks and anything too easy/hard.`,
  },
  patel: {
    who: "Ms Patel, Reception teacher trained in Sounds~Write",
    brief: `You are a Reception teacher trained in Sounds~Write, checking whether the game teaches the way you do. Read
docs/PEDAGOGY.md first. Play ${BASE}/play/?level=w1-wu1 through w1-wu6, then w1-2 through w1-15, in order, making deliberate mistakes. You can't hear audio, so
read the caption bubbles AND after each screen run \`window.__audioLog\` in the page: entries like /a/l/<id>.mp3 are lines whose text is
in src/content/lines.ts, /a/p/<x>.mp3 are pure sounds, /a/w/<word>.mp3 words, /a/x/<word>.mp3 stretched words. Check: sounds before
letters; no letter names; no "says"/"makes"; errorless correction (1st error → listen again, 2nd → show); child never gets the
segmentation done for them when spelling; two-sound before three-sound words; the vocabulary is right for 3–5 year olds;
only taught sounds are used. Report every deviation with the exact level, moment and clip ids.`,
  },
  parent: {
    who: "A parent setting it up on an iPhone for their 4-year-old",
    brief: `You are a busy parent. Start at ${BASE}/ (the landing page) on a phone-landscape and then phone-portrait viewport.
Decide whether you trust it and understand what it is, then go to /play/, follow the Get-ready (add to home screen) page, make two
player profiles, play two minutes, find the grown-ups area (hold the gear button for 2 seconds), try jump-ahead to "end of
Reception", delete a player. Report anything confusing, untrustworthy, broken, or that would make you give up.`,
  },
};

function prompt(id: string) {
  const p = PERSONAS[id];
  const out = `${runDir}/persona-${id}`;
  return `You are a playtester for "Super Ninja", a Sounds~Write phonics game for British children aged 3–8 (repo: this directory;
design docs in docs/). The dev server is running at ${BASE}.

PERSONA: ${p.who}
${p.brief}

HOW TO PLAY: drive your OWN headless browser — do not use computer use and do not touch the user's Chrome. Use the playwriter CLI
(\`playwriter skill\` prints its API; create a session with \`playwriter session new --browser headless\`) or small Playwright scripts
run with bun (playwright is installed in node_modules). Use a phone viewport (844×390 landscape unless your brief says otherwise) and
dispatch taps/pointerdown like a finger. Append \`fast=2\` to /play/ URLs to speed up waiting (it only speeds up time). Before playing
levels directly, you may seed a save by putting JSON in localStorage "superninja.save.v1" (see scripts/treadmill/bot.ts \`save()\` —
set settings.captions true so caption bubbles show). Look at your screenshots — judge what a child would SEE.
Save screenshots in ${out}/ (create it). Don't modify any source files.

OUTPUT: write ${out}.json — a JSON array of findings, each:
{"sig": "persona:${id}:<short-kebab-slug>", "source": "persona", "severity": "blocker|major|minor|polish", "case": "<level id or scene>",
 "title": "<one line>", "detail": "<what happened, what you expected, why it matters for this child>", "evidence": ["persona-${id}/<file>.png"],
 "repro": "<url + steps>"}
Concrete, visible problems only (no generic advice); most severe first; 5–25 findings. Include 1–3 "polish" findings for the
best ideas that would make it more delightful. Finish by printing a 5-line summary.`;
}

if (import.meta.main) {
  if (!runDir) throw new Error("usage: personas.ts <runDir>");
  mkdirSync(runDir, { recursive: true });
  const who = arg("who")?.split(",") ?? Object.keys(PERSONAS);
  await Promise.all(
    who.map(
      (id) =>
        new Promise<void>((resolve) => {
          const t0 = Date.now();
          const log = `${runDir}/persona-${id}.log`;
          const child = spawn(
            "codex",
            ["exec", "-m", "gpt-6-sol", "-c", `model_reasoning_effort=${EFFORT}`, "--dangerously-bypass-approvals-and-sandbox", "-C", process.cwd(), "-o", `${runDir}/persona-${id}.md`, prompt(id)],
            { stdio: ["ignore", "pipe", "pipe"] },
          );
          const chunks: Buffer[] = [];
          child.stdout.on("data", (d) => chunks.push(d));
          child.stderr.on("data", (d) => chunks.push(d));
          child.on("close", (code) => {
            writeFileSync(log, Buffer.concat(chunks));
            const f = `${runDir}/persona-${id}.json`;
            let n = 0;
            try { n = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")).length : 0; } catch { writeFileSync(f, "[]"); }
            console.log(`${code === 0 ? "✓" : "✗"} persona ${id.padEnd(7)} ${Math.round((Date.now() - t0) / 60000)} min · ${n} findings`);
            resolve();
          });
        }),
    ),
  );
}
