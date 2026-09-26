// Get a hosted (24 h, gateway output URL) copy of a local start frame, so URL-only gateway models (Pruna) can use it:
// Nano Banana Pro through Cloudflare AI Gateway repaints the frame unchanged and returns an output URL.
// Run: doppler run -p os -c dev -- bun assets-src/intro-v3/lipsync/host.ts <frame.jpg> [prompt]
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { cfAccount, cfToken } from "../../../scripts/trailer/lib";
const [frame, prompt] = process.argv.slice(2);
const req = `${frame}.host.json`;
writeFileSync(req, JSON.stringify({ model: "google/nano-banana-pro", input: {
  prompt: prompt ?? "Output this exact image unchanged: same composition, same characters, same colours, same painting style, same framing. Do not add, remove or move anything. No text.",
  image_input: [`data:image/jpeg;base64,${readFileSync(frame).toString("base64")}`], aspect_ratio: "16:9", image_size: "2K", output_format: "jpg" } }));
const raw = execFileSync("curl", ["-s", "--max-time", "600", "-X", "POST", `https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run`, "-H", `Authorization: Bearer ${cfToken()}`, "-H", "Content-Type: application/json", "--data-binary", `@${req}`]).toString();
const json = JSON.parse(raw);
if (!json.success) throw new Error(JSON.stringify(json.errors).slice(0, 500));
const url = (json.result?.result ?? json.result).image;
execFileSync("curl", ["-s", "-o", frame.replace(/\.jpg$/, ".hosted.jpg"), url]);
writeFileSync(frame.replace(/\.jpg$/, ".url.txt"), url);
console.log(url.slice(0, 120));
