import { ART } from "./art-manifest";
import { writeFileSync } from "node:fs";
writeFileSync("assets-src/art-jobs.json", JSON.stringify(ART.map(({ id, cut, w, plate }) => ({ id, cut: !!cut, w, ...(plate ? { plate } : {}) })), null, 1));
console.log(ART.length, "art jobs");
