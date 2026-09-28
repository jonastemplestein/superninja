// The accent test script (the same for every candidate voice) and the casts the accent audit renders it with.
// See playtest/voice-picker/audit.md.

export type Role = "sensei" | "narrator" | "baron";
export interface TestLine { id: string; role: Role; text: string; probes?: string }

export const TEST_SCRIPT: TestLine[] = [
  { id: "sensei-1", role: "sensei", text: "Hello, ninja! Today I'm going to show you how to read a brand new word. Are you ready?" },
  { id: "sensei-2", role: "sensei", text: "Can you find the car? It's by the grass, next to the bath.", probes: "non-rhotic car; BATH vowel in grass, bath" },
  { id: "sensei-3", role: "sensei", text: "Let's say it the slow way first, then the fast way. Brilliant, you did it!" },
  { id: "sensei-4", role: "sensei", text: "Say mat slowly. Now say it fast.", probes: "TRAP in mat vs BATH in fast" },
  { id: "sensei-5", role: "sensei", text: "Oh dear, that's not quite right. Shall we have another go together?" },
  { id: "sensei-6", role: "sensei", text: "Water, butter, tomato, dance, can't, half past four.", probes: "T-voicing, TRAP-BATH, tomato, non-rhotic four" },
  { id: "narrator-1", role: "narrator", text: "Once upon a time, on an island far across the sea, grew the World Flower." },
  { id: "narrator-2", role: "narrator", text: "But one stormy night, Baron Muddle crept up the mountain…" },
  { id: "narrator-3", role: "narrator", text: "And every child on the island could read again." },
  { id: "baron-1", role: "baron", text: "Words, words, WORDS! How I hate them!" },
  { id: "baron-2", role: "baron", text: "Every sound on this island is MINE!" },
];

/** A cast: who renders which roles. `kind` says whether it is a voice the game uses today, or a calibration control. */
export interface Cast {
  key: string;
  label: string;
  kind: "current" | "diagnostic" | "control-british" | "control-american";
  engine: "gemini" | "eleven" | "openai" | "macos";
  voice: string;
  lang?: string;
  roles: Role[];
  lines?: string[];
  takes: number;
}

export const CASTS: Cast[] = [
  // What the game ships today (scripts/gen-audio.ts VOICES; stories and the film are narrated by Sensei).
  { key: "sulafat", label: "Gemini Sulafat, en-GB (Sensei; also narrates stories and the film)", kind: "current", engine: "gemini", voice: "Sulafat", lang: "en-GB", roles: ["sensei", "narrator"], takes: 3 },
  { key: "algenib", label: "Gemini Algenib, en-GB (Baron Muddle)", kind: "current", engine: "gemini", voice: "Algenib", lang: "en-GB", roles: ["baron"], takes: 3 },
  // The trailer's narrator (trailer/trailer.config.ts voiceCast.narrator).
  { key: "george", label: "ElevenLabs v3 George (the trailer's narrator)", kind: "current", engine: "eleven", voice: "JBFqnCBsd6RMkjVDRZzb", roles: ["narrator"], takes: 1 },
  // Diagnostic: the same voice asked for en-US, to see what en-GB buys.
  { key: "sulafat-en-us", label: "Gemini Sulafat, en-US (diagnostic)", kind: "diagnostic", engine: "gemini", voice: "Sulafat", lang: "en-US", roles: ["sensei"], lines: ["sensei-2", "sensei-4", "sensei-6"], takes: 2 },
  // Controls with a known accent, to calibrate the judge and the measurements.
  { key: "mac-daniel", label: "macOS Daniel (en_GB, British male)", kind: "control-british", engine: "macos", voice: "Daniel", roles: ["sensei", "narrator", "baron"], takes: 1 },
  { key: "eleven-alice", label: "ElevenLabs v3 Alice (British female)", kind: "control-british", engine: "eleven", voice: "Xb7hH8MSUJpSbSDYk0k2", roles: ["sensei", "narrator"], takes: 1 },
  { key: "eleven-george-baron", label: "ElevenLabs v3 George reading the Baron (British male)", kind: "control-british", engine: "eleven", voice: "JBFqnCBsd6RMkjVDRZzb", roles: ["baron"], takes: 1 },
  { key: "mac-samantha", label: "macOS Samantha (en_US, American female)", kind: "control-american", engine: "macos", voice: "Samantha", roles: ["sensei", "narrator"], takes: 1 },
  { key: "openai-coral", label: "OpenAI gpt-4o-mini-tts coral, no accent instruction (American)", kind: "control-american", engine: "openai", voice: "coral", roles: ["sensei", "narrator"], takes: 1 },
  { key: "openai-ash", label: "OpenAI gpt-4o-mini-tts ash, no accent instruction (American male)", kind: "control-american", engine: "openai", voice: "ash", roles: ["baron"], takes: 1 },
];
