// Shared Gemini REST helpers for the asset pipeline.
// Run scripts via: doppler run -p os-legacy-2026-04 -c dev -- bun scripts/<x>.ts
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";

const KEY = process.env.APP_CONFIG_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
if (!KEY) throw new Error("Missing APP_CONFIG_GEMINI_API_KEY (run under doppler)");

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export async function generate(model: string, body: unknown, tries = 5): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}/${model}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": KEY!, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: any = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${json?.error?.message ?? ""}`);
      return json;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** i));
    }
  }
  throw lastErr;
}

export function inlineParts(json: any): { mimeType: string; data: Buffer }[] {
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p: any) => p.inlineData)
    .map((p: any) => ({ mimeType: p.inlineData.mimeType, data: Buffer.from(p.inlineData.data, "base64") }));
}

export function textOf(json: any): string {
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: any) => p.text ?? "").join("");
}

export const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);

export function writeFile(path: string, data: Buffer | string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
}

export function fileToPart(path: string): Part {
  const mimeType = path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : path.endsWith(".wav") ? "audio/wav" : "image/jpeg";
  return { inlineData: { mimeType, data: readFileSync(path).toString("base64") } };
}

export { existsSync };

// Simple concurrency pool
export async function pool<T>(items: T[], n: number, fn: (t: T, i: number) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: n }, async () => {
    while (next < items.length) {
      const i = next++;
      try {
        await fn(items[i], i);
      } catch (e) {
        console.error("FAILED", i, e);
      }
    }
  });
  await Promise.all(workers);
}
