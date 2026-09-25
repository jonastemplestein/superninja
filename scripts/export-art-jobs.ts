import { ART } from "./art-manifest";
import { writeFileSync } from "node:fs";
writeFileSync("assets-src/art-jobs.json", JSON.stringify(ART.map(({ id, cut, w }) => ({ id, cut: !!cut, w })), null, 1));
console.log(ART.length, "art jobs");
