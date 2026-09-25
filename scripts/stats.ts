// Numbers quoted on the landing page, computed from the content so the copy never goes stale.
import { writeFileSync } from "node:fs";
import { WORDS } from "../src/content/phonics";
import { LEVELS, WORLDS, MONSTER_INFO } from "../src/content/worlds";
import { STORIES } from "../src/content/stories";
import { PETALS, GEMS } from "../src/content/flower";
import pkg from "../package.json" with { type: "json" };
const stats = {
  version: pkg.version, worlds: WORLDS.length, levels: LEVELS.length, words: WORDS.length, stories: STORIES.length,
  monsters: Object.keys(MONSTER_INFO).length, muddlings: Object.keys(MONSTER_INFO).filter((m) => m !== "gem_guardian").length, sounds: PETALS.length, gems: GEMS.length, gemsInPlay: GEMS.filter((g) => g.inPlay).length,
};
writeFileSync("public/media/stats.json", JSON.stringify(stats, null, 1));
console.log(stats);
