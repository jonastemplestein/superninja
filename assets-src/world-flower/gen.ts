// World Flower design iterations (Nano Banana Pro). Outputs go to assets-src/world-flower/<round>/<id>_<v>.png
// Run: doppler run -p os-legacy-2026-04 -c dev -- bun assets-src/world-flower/gen.ts <round> [ids...] [--v=2] [--size=1K]
// Rounds and prompts live in ./rounds.ts so each round's recipe stays on record.
import { makeImage } from "../../scripts/img";
import { pool } from "../../scripts/gemini";
import { ROUNDS } from "./rounds";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const [round, ...ids] = args.filter((a) => !a.startsWith("--"));
const jobs = ROUNDS[round];
if (!jobs) throw new Error(`unknown round ${round}; have ${Object.keys(ROUNDS)}`);
const pick = jobs.filter((j) => !ids.length || ids.includes(j.id));
const variants = Number(flags.v ?? 2);
const start = Number(flags.from ?? 1);
const todo = pick.flatMap((j) => Array.from({ length: variants }, (_, i) => ({ j, v: start + i })));
await pool(todo, 8, async ({ j, v }) => {
  const out = `assets-src/world-flower/${round}/${j.id}_${v}.png`;
  const t = Date.now();
  await makeImage({ out, prompt: j.prompt, refs: j.refs, aspect: j.aspect ?? "1:1", size: flags.size ?? j.size });
  console.log("✓", out, ((Date.now() - t) / 1000).toFixed(0) + "s");
});
