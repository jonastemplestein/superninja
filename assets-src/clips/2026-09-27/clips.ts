// The 27 Sep 2026 clip kit: every final clip, in play order (the order a child meets each kind of level), with the
// one-line notes the page shows. Used by ./page.ts (index.html) and ./zips.sh reads the same groups via `bun clips.ts`.
//
//   bun assets-src/clips/2026-09-27/clips.ts groups     prints "<key> <file> <file> ..." per group (for zips.sh)

export interface Clip {
  file: string; // basename, without .mp4 (poster: <file>.jpg)
  level: string; // level id, land, hero (and opponent)
  text: string; // what happens, one line
}
export interface Group {
  key: string; // zip suffix and anchor
  name: string;
  about: string;
  clips: Clip[];
}

export const DATE = "2026-09-27";
export const ALL_ZIP = `superninja-clips-${DATE}.zip`;
export const zipOf = (g: Group) => `superninja-clips-${DATE}-${g.key}.zip`;

export const GROUPS: Group[] = [
  {
    key: "supercut",
    name: "Enemy supercut",
    about: "All 19 monsters and bosses, each with one big hit and its knockout, cut to the beat of the boss music.",
    clips: [
      { file: "enemies-supercut", level: "All 19 enemies · long version", text: "The little monsters fill the first two phrases, the bosses the third, and Baron Muddle lands as the music lifts: \"Nooo! My muddle! … I will be back!\"" },
      { file: "enemies-supercut-short", level: "All 19 enemies · short version", text: "The same 19 enemies in 20 seconds, about a second each, ending on Baron Muddle." },
    ],
  },
  {
    key: "ears",
    name: "Ninja Ears",
    about: "The listening warm-ups: hearing the sounds in words, before any letters.",
    clips: [
      { file: "ears-1", level: "w1-wu1 · Bamboo Village · Suki", text: "Tap every picture that starts with /s/: Sensei finds the sun, the child finds the sock and the sausage, and taps the moon by mistake once (\"Moon starts with a different sound. Listen again.\")." },
      { file: "ears-2", level: "w1-wu3 · Bamboo Village · Kai", text: "\"This is a mug.\" Sensei says it fast (the rabbit) and slowly (the tortoise); asked for the tortoise, the child taps the rabbit first, hears the ask again, then taps the tortoise for the slow \"mmmuuug\"." },
      { file: "ears-3", level: "w1-wu5 · Bamboo Village · Suki", text: "\"Remember? Words are made of sounds!\" Sensei says the sounds and the child picks the word: sun (shown first), then map, not mop." },
    ],
  },
  {
    key: "picread",
    name: "Ninjas Read This Way",
    about: "The picture-reading warm-ups: pictures read from left to right, the way ninjas read.",
    clips: [
      { file: "picread-1", level: "w1-wu2 · Bamboo Village · Suki", text: "\"Fish… dog. Fish dog!\" Sensei reads the two pictures and they merge into the fish-dog; then the child reads them, starting on the wrong side once (\"Start here, on this side!\")." },
      { file: "picread-2", level: "w1-wu4 · Bamboo Village · Kai", text: "\"Fish… dog… cat. Which one did I read?\" Then rain and bow merge into a rainbow." },
      { file: "picread-3", level: "w1-wu6 · Bamboo Village · Suki", text: "Sound dots: the child taps the dots this way for c-a-t, then d-o-g after one slip (\"Start here, on this side!\")." },
    ],
  },
  {
    key: "firstsound",
    name: "First Sounds",
    about: "Two pictures: which one starts with the sound?",
    clips: [
      { file: "firstsound-1", level: "w1-2 · Bamboo Village · Kai · 720p", text: "A together turn: sock or zip for /s/ (the sock glows as a hint), a spell writes the s, and three right in a row powers the ninja up." },
      { file: "firstsound-2", level: "w1-3 · Bamboo Village · Suki · 720p", text: "Ant or bed for /a/: the child taps the bed first, hears \"Listen again. Aaant.\" and then gets it right." },
      { file: "firstsound-3", level: "w1-10 · Bamboo Village · Kai · 720p", text: "Three turns alone: pin, nest and pond, each letter written by a spell, ending on \"Wow! Super ninja streak!\"" },
    ],
  },
  {
    key: "dojo",
    name: "The Dojo",
    about: "New sounds heard, spelt and tapped, then the first words built from them.",
    clips: [
      { file: "dojo-1", level: "w2-1 · Blossom Hills · Kai · 720p", text: "\"This is the dojo. A dojo is where ninjas practise!\" Then two new sounds, /b/ and /k/: heard, spelt (b, c), tapped twice and struck." },
      { file: "dojo-2", level: "w3-4 · Misty Mountains · Suki · 720p", text: "Finds the last new sound (z), then builds \"jug\": a slip on the middle sound (\"Keep going, ninja. Let's listen again.\"), then j-u-g, \"Lovely!\"" },
      { file: "dojo-3", level: "w1-4 · Bamboo Village · Suki · 720p", text: "Building \"am\": the child taps m first (\"Let's listen again. What can you hear here?\"), then a, m, \"Say the sounds, and read the word.\" \"Well done.\"" },
    ],
  },
  {
    key: "battle",
    name: "Monster Battle",
    about: "Hear the word and spell it sound by sound: every right sound is a hit, and the last word sends the monster flying.",
    clips: [
      { file: "battle-1", level: "w2-2 · Blossom Hills · Suki vs Crabble", text: "cot, cat and hot, the streak flames go rainbow at ten in a row, and the crab spins off into the sky: \"Hooray! The monster ran away!\"" },
      { file: "battle-2", level: "w3-9 · Misty Mountains · Kai vs the rock golem", text: "fox, with one slip and \"Keep going, ninja. Let's listen again.\", then well (two letters, one sound) and the golem runs away." },
      { file: "battle-3", level: "w5-9 · Shadow Castle · Suki vs the shadow bat", text: "twist (five sounds), \"Ten in a row! Look how your ninja is glowing!\", then give and shut from sound-only cards, and the bat runs away." },
    ],
  },
  {
    key: "soundhunt",
    name: "Sound Hunt",
    about: "Two pictures: which one has this sound in it?",
    clips: [
      { file: "soundhunt-1", level: "w1-7 · Bamboo Village · Kai", text: "/i/ in the middle: tap or tin together, then lid or mat alone, with a spell writing i under each find." },
      { file: "soundhunt-2", level: "w1-11 · Bamboo Village · Suki", text: "/o/ in the middle: tap or top together (\"This is how we spell… /o/\"), then cat or cot alone." },
      { file: "soundhunt-3", level: "w1-7 · Bamboo Village · Suki", text: "/i/ again: the child taps the mat first and hears \"Listen again.\", finds the lid, then the pig, and the i is written." },
    ],
  },
  {
    key: "swap",
    name: "Word Swap",
    about: "Baron Muddle has mixed up the words: change one sound at a time to fix them.",
    clips: [
      { file: "swap-1", level: "w1-8 · Bamboo Village · Kai", text: "Sensei's introduction (\"Baron Muddle has mixed up these words!\"), then mat → sat: a spin kick knocks out the m and a spell carries in the s." },
      { file: "swap-2", level: "w3-2 · Misty Mountains · Suki", text: "hat → hut, with a slip on the h (\"That sound stays the same. Listen… hat… hut.\"), then a out, u in." },
      { file: "swap-3", level: "w5-8 · Shadow Castle · Kai", text: "wig → wing: the last sound changes (\"It's two letters, but it's one sound.\"), then \"Wow! Super ninja streak!\" and a spell on the Baron." },
    ],
  },
  {
    key: "run",
    name: "Ninja Run",
    about: "Run, jump and catch the word the sounds make.",
    clips: [
      { file: "run-1", level: "w1-9 · Bamboo Village · Kai · 720p", text: "\"Ninja Run! Tap to jump, and catch the right word!\" /m/ /a/ /t/ → mat, then /i/ /t/ → it." },
      { file: "run-2", level: "w3-5 · Misty Mountains · Suki · 720p", text: "A picture group read the ninja way (zip), then web from its sounds, catching wet by mistake first." },
      { file: "run-3", level: "w6-9 · Sky Temple · Kai · 720p", text: "road, then pram, the six-in-a-row power-up and the gong at the finish." },
    ],
  },
  {
    key: "story",
    name: "Story Time",
    about: "Decodable stories: the child reads, chooses what happens, and Sensei reads it back.",
    clips: [
      { file: "story-1", level: "w1-14 · Bamboo Village · Suki · \"The Missing Pot\"", text: "Choose where to look (mat), a help tap on \"Pot\", \"Pot! Pot on mat!\", then the pandas' feast page read in full." },
      { file: "story-2", level: "w3-11 · Misty Mountains · Kai · \"The Yak's Bell\"", text: "\"The bell is in the box. Yes!\", the reunion page, the question (the box first, then the bell) and \"The end! What a story!\"" },
      { file: "story-3", level: "w5-10 · Shadow Castle · Suki · \"The Baron's Chest\"", text: "The child picks \"kick\" first and the flying kick bounces off the chest: \"Kick! Thud! It is still shut.\" \"Ouch… Try again.\"" },
    ],
  },
  {
    key: "boss",
    name: "Boss Battle",
    about: "The big fight at the end of each land.",
    clips: [
      { file: "boss-1", level: "w1-15 · Bamboo Village · Suki vs the sumo panda · 720p", text: "Baron Muddle's threat, \"A big boss monster! Listen carefully, and spell your best!\", then top and not." },
      { file: "boss-2", level: "w3-12 · Misty Mountains · Kai vs the yeti · 720p", text: "Mid-fight, with one slip and Sensei's correction, then the half-way roar: \"Grrrr… You dare to fight ME?\"" },
      { file: "boss-3", level: "w6-11 · Sky Temple · Suki vs Baron Muddle · 720p", text: "The last words (the Baron's taunt, then wax) and the win: \"Nooo! My muddle! … I will be back!\" and \"You beat the boss! What a ninja!\"" },
    ],
  },
  {
    key: "gemtrial",
    name: "Gem Trial",
    about: "A timed battle against the Gem Guardian to win a spelling gem for the World Flower.",
    clips: [
      { file: "gemtrial-1", level: "w2-6 · Blossom Hills · Kai · the e gem", text: "The child's first gem battle: Sensei explains the purple bar, then pen and tent." },
      { file: "gemtrial-2", level: "w5-7 · Shadow Castle · Suki · the sh gem", text: "shop (one slip, and the bar jumps), shed, the Guardian knocked out and the gem flying over the ninja." },
      { file: "gemtrial-3", level: "World Flower · Suki · the ee gem", text: "The victory: \"You won the gem! It's going into its petal!\", the dive, the bloom, and the petal flying home onto the World Flower." },
    ],
  },
  {
    key: "sort",
    name: "Sorting",
    about: "Sort words into chests by how their sound is spelt.",
    clips: [
      { file: "sort-1", level: "w6-br1 · Sky Temple · Kai", text: "c, k or ck: stuck, kid, silk, sock and scab, with a word in every chest." },
      { file: "sort-2", level: "w6-2 · Sky Temple · Suki", text: "The opening of an ai / ay sort, with a slip on tail (\"Listen… tail. t-ae-l, tail.\"), then say and nail." },
      { file: "sort-3", level: "w6-8 · Sky Temple · Suki", text: "The end of an oa / ow sort: slow, coat, a streak, snow, blow and \"Sorted! What a clever ninja.\"" },
    ],
  },
];

if (import.meta.main && process.argv[2] === "groups") {
  for (const g of GROUPS) console.log([g.key, ...g.clips.map((c) => c.file)].join(" "));
}
