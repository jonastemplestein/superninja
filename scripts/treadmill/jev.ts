// Jev (TypeSafe's typed decision model) through Cloudflare AI Gateway unified billing.
// One call evaluates one `state` against several typed questions at once; answers come back with probabilities.
// Credentials: run under `doppler run -p os -c dev --` (CLOUDFLARE_ACCOUNT_ID/API_TOKEN = the dev/preview account,
// which has AI Gateway credits; the personal account has none).
export type JevQuestion =
  | { type: "noul"; instructions: string; criteria: { true: string; false: string } }
  | { type: "choice"; instructions: string; criteria: Record<string, string> }
  | { type: "score"; instructions: string; criteria: string[] };
export type JevAnswer =
  | { type: "noul"; noul: number }
  | { type: "choice"; choice: string; confidence: number; probabilities: Record<string, number> }
  | { type: "score"; score: number; confidence: number; probabilities: Record<string, number>; legend: Record<string, string> };

const ACCOUNT = process.env.JEV_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.JEV_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;
export const JEV_MODEL = process.env.JEV_MODEL ?? "typesafe/jev";

export async function jev<Q extends Record<string, JevQuestion>>(state: unknown, questions: Q, tries = 4): Promise<{ [K in keyof Q]: JevAnswer }> {
  if (!ACCOUNT || !TOKEN) throw new Error("jev: run under `doppler run -p os -c dev --`");
  for (let i = 0; ; i++) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: JEV_MODEL, input: { state, questions } }),
    });
    const j: any = await r.json().catch(() => ({}));
    const answers = j?.result?.result?.answers;
    if (answers) return answers;
    if (i >= tries - 1) throw new Error(`jev failed: ${r.status} ${JSON.stringify(j?.errors ?? j).slice(0, 300)}`);
    await new Promise((res) => setTimeout(res, 500 * 2 ** i));
  }
}

/** true-probability of a noul answer, or the chosen key / expected score for the others */
export const p = (a: JevAnswer) => (a.type === "noul" ? a.noul : a.type === "choice" ? a.probabilities[a.choice] : a.score);
