import { generate, inlineParts, textOf, writeFile } from "./gemini";
const t = Date.now();
const json = await generate("lyria-3.5", { contents: [{ parts: [{ text: "A cheerful, bouncy instrumental loop for a children's ninja adventure game world map: plucked koto and shamisen melody, light taiko drums, pizzicato strings, flute, playful and warm, 110 bpm, seamless loop, no vocals." }] }] });
console.log((Date.now()-t)/1000, "s", JSON.stringify(json).slice(0, 300));
for (const p of inlineParts(json)) { console.log(p.mimeType, p.data.length); writeFile(`assets-src/music-test.${p.mimeType.split("/")[1]}`, p.data); }
console.log(textOf(json).slice(0,300));
