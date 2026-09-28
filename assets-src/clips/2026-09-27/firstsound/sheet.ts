// A labelled contact sheet of part of a take (the 26 Sep battle-streak kit's rangeSheet): one frame every `every` s.
//   bun assets-src/clips/2026-09-27/firstsound/sheet.ts <file.mp4> <from> <to> [every=0.5] [out.jpg]
import { rangeSheet } from "../../../tweet/2026-09-26/battle-streak/drive";
const [f, a, b, e, o] = process.argv.slice(2);
console.log(rangeSheet(f, Number(a), Number(b), Number(e ?? 0.5), o));
process.exit(0);
