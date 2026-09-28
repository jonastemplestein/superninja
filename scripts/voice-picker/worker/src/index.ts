// superninja-voice-picks: stores the voice picker's ratings, notes and picks in R2 so Claude can read them.
//   POST /picks          body: the page's JSON state  -> voice-picker/picks/<iso-time>.json and voice-picker/picks/latest.json
//   GET  /picks/latest   the latest state ({} when there is none)
//   GET  /picks/history  the newest 100 saved states' keys
// Every call needs the key (the page's unguessable R2 prefix) as ?key= or an x-picker-key header. Browsers may only call
// it from ALLOWED_ORIGIN (the r2.dev origin that serves the page).

interface Env {
  BUCKET: R2Bucket;
  ALLOWED_ORIGIN: string;
  PICKER_KEY?: string;
}

const PREFIX = "voice-picker/picks/";
const LATEST = `${PREFIX}latest.json`;
const MAX_BYTES = 512 * 1024;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin");
    const allowed = origin !== null && origin === env.ALLOWED_ORIGIN;
    const cors: Record<string, string> = allowed
      ? {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "content-type, x-picker-key",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        }
      : { Vary: "Origin" };
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

    // A browser on any other site gets nothing (curl and scripts send no Origin).
    if (origin !== null && !allowed) return new Response("origin not allowed", { status: 403, headers: { Vary: "Origin" } });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/" && req.method === "GET") return new Response("superninja-voice-picks\n", { headers: cors });

    if (!env.PICKER_KEY) return json({ error: "PICKER_KEY is not set" }, 500);
    const key = url.searchParams.get("key") ?? req.headers.get("x-picker-key") ?? "";
    if (!safeEqual(key, env.PICKER_KEY)) return json({ error: "bad key" }, 401);

    if (url.pathname === "/picks" && req.method === "POST") {
      const text = await req.text();
      if (text.length > MAX_BYTES) return json({ error: "too big" }, 413);
      let state: unknown;
      try {
        state = JSON.parse(text);
      } catch {
        return json({ error: "not JSON" }, 400);
      }
      if (!state || typeof state !== "object" || Array.isArray(state)) return json({ error: "expected a JSON object" }, 400);
      const receivedAt = new Date().toISOString();
      const body = JSON.stringify({ ...(state as Record<string, unknown>), receivedAt }, null, 1);
      const opts = { httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: "no-store" } };
      const objectKey = `${PREFIX}${receivedAt}.json`;
      await Promise.all([env.BUCKET.put(objectKey, body, opts), env.BUCKET.put(LATEST, body, opts)]);
      return json({ ok: true, key: objectKey, receivedAt });
    }

    if (url.pathname === "/picks/latest" && req.method === "GET") {
      const obj = await env.BUCKET.get(LATEST);
      if (!obj) return json({});
      return new Response(obj.body, { headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }

    if (url.pathname === "/picks/history" && req.method === "GET") {
      const keys: { key: string; size: number; uploaded: string }[] = [];
      let cursor: string | undefined;
      do {
        const page = await env.BUCKET.list({ prefix: PREFIX, cursor, limit: 1000 });
        for (const o of page.objects) if (o.key !== LATEST) keys.push({ key: o.key, size: o.size, uploaded: o.uploaded.toISOString() });
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
      keys.sort((a, b) => (a.key < b.key ? 1 : -1));
      return json(keys.slice(0, 100));
    }

    return json({ error: "not found" }, 404);
  },
};

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
