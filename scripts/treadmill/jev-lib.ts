// Shared helpers for the jev-* prototypes: a metered Jev call (latency, tokens, cost, model version),
// a small concurrency pool, question builders and a JSON writer for playtest/jev/.
// jev.ts stays the canonical minimal client; this adds the metering that jev() throws away.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { JEV_MODEL, type JevAnswer, type JevQuestion } from "./jev";

export type { JevAnswer, JevQuestion };
export const ROOT = join(import.meta.dir, "../..");
export const OUT = join(ROOT, "playtest/jev");
/** USD per million input tokens (output is free) */
export const USD_PER_MTOK = 0.042;

const ACCOUNT = process.env.JEV_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.JEV_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;

export const meter = { calls: 0, retries: 0, retryCauses: {} as Record<string, number>, inTok: 0, outTok: 0, ms: [] as number[], model: "" };

export type Answers<Q> = { [K in keyof Q]: JevAnswer };

/**
 * The account allows 1,200 requests per minute. Short bursts of ~50 req/s are fine (a 250-call lint finishes in ~5 s),
 * but more than ~1,200 in a rolling minute returns 429 (code 971). Keep this process under the budget; other
 * processes on the same account (a concurrent treadmill run) still count against it.
 */
const PER_MINUTE = +(process.env.JEV_PER_MINUTE ?? 1100);
const starts: number[] = [];
async function slot() {
  for (;;) {
    const now = Date.now();
    while (starts.length && now - starts[0] > 60_000) starts.shift();
    if (starts.length < PER_MINUTE) return void starts.push(now);
    await new Promise((res) => setTimeout(res, 60_000 - (now - starts[0]) + 20));
  }
}

/** One Jev request. Same contract as jev(), plus metering. */
export async function ask<Q extends Record<string, JevQuestion>>(state: unknown, questions: Q, tries = 8): Promise<Answers<Q>> {
  if (!ACCOUNT || !TOKEN) throw new Error("jev: run under `doppler run -p os -c dev --`");
  for (let i = 0; ; i++) {
    await slot();
    const t0 = performance.now();
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: JEV_MODEL, input: { state, questions } }),
    });
    const j: any = await r.json().catch(() => ({}));
    const res = j?.result?.result;
    if (res?.answers) {
      meter.calls++;
      meter.ms.push(performance.now() - t0);
      meter.inTok += res.usage?.input_tokens ?? 0;
      meter.outTok += res.usage?.output_tokens ?? 0;
      meter.model = res.model ?? meter.model;
      return res.answers;
    }
    const msg = JSON.stringify(j?.errors ?? j).slice(0, 300);
    if (/insufficient|balance|credit/i.test(msg)) throw new Error(`jev: out of credit: ${msg}`);
    if (r.status === 400 || i >= tries - 1) throw new Error(`jev failed: ${r.status} ${msg}`);
    meter.retries++;
    const cause = String(r.status);
    meter.retryCauses[cause] = (meter.retryCauses[cause] ?? 0) + 1;
    const wait = r.status === 429 ? 2000 * 2 ** Math.min(i, 4) : 400 * 2 ** i;
    await new Promise((res) => setTimeout(res, wait * (0.75 + Math.random() / 2)));
  }
}

const pct = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(q * s.length))]) : 0;
};
export function usage(wallMs?: number) {
  return {
    model: meter.model,
    calls: meter.calls,
    retries: meter.retries,
    ...(meter.retries ? { retryCauses: meter.retryCauses } : {}),
    inputTokens: meter.inTok,
    outputTokens: meter.outTok,
    usd: +((meter.inTok * USD_PER_MTOK) / 1e6).toFixed(6),
    p50ms: pct(meter.ms, 0.5),
    p95ms: pct(meter.ms, 0.95),
    ...(wallMs != null ? { wallMs: Math.round(wallMs) } : {}),
  };
}

/** Run fn over items with at most n in flight. */
export async function pool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

export const noul = (instructions: string, yes: string, no: string): JevQuestion => ({ type: "noul", instructions, criteria: { true: yes, false: no } });
export const score = (instructions: string, levels: string[]): JevQuestion => ({ type: "score", instructions, criteria: levels });
export const choice = (instructions: string, criteria: Record<string, string>): JevQuestion => ({ type: "choice", instructions, criteria });

/** probability that the answer is "bad": noul → p(true); score → expected level / max level; choice → p(chosen) */
export function pBad(a: JevAnswer): number {
  if (a.type === "noul") return a.noul;
  if (a.type === "score") return a.score / Math.max(1, Object.keys(a.legend).length - 1);
  return a.probabilities[a.choice];
}

export function writeOut(name: string, data: unknown) {
  const f = join(OUT, name);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(data, null, 1) + "\n");
  return f;
}

export const r2 = (x: number) => Math.round(x * 100) / 100;
