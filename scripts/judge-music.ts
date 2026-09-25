import { generate, textOf } from "./gemini"; import { readFileSync } from "node:fs";
const f = process.argv[2];
const j = await generate("gemini-3.8-flash", { contents: [{ parts: [{ inlineData: { mimeType: "audio/mp3", data: readFileSync(f).toString("base64") } }, { text: "You are a game audio director. Describe this music track (instruments, mood, tempo, structure, any vocals) and rate 0-10 how well it would work as looping background music for a cheerful Japanese-flavoured kids' ninja adventure game world map. Also note whether the start and end would loop smoothly." }] }] });
console.log(textOf(j));
