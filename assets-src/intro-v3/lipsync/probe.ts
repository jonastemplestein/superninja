// does p-video accept data URIs at all, and is it a size limit?
import { readFileSync } from "node:fs";
import { cfAccount, cfToken } from "../../../scripts/trailer/lib";
const L = "assets-src/intro-v3/lipsync/";
const [imgf] = process.argv.slice(2);
const input = { prompt: "test", image: `data:image/jpeg;base64,${readFileSync(L + imgf).toString("base64")}`, duration: 1, resolution: "720p", draft: true };
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run`, { method: "POST", headers: { authorization: `Bearer ${cfToken()}`, "content-type": "application/json" }, body: JSON.stringify({ model: "pruna/p-video", input }) });
console.log(imgf, res.status, (await res.text()).slice(0, 200));
