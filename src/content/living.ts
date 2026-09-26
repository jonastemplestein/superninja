// Pictures of living things: animals, people, and people doing things (and the characters the warm-ups invent). The
// ninja never kicks or hits them (a friendly gift instead: src/scenes/Early.tsx), and their pictures always have a
// friendly face (scripts/art-manifest.ts PIC_LIVING; docs/FIRST_MINUTES.md §11).
export const LIVING_WORDS: ReadonlySet<string> = new Set(
  (
    "ant astronaut bat bee bug cat chick chimp crab crow cub dog duck elf fish fox frog goat hen hog insect king man moth " +
    "octopus otter pig pup queen rat sheep snail squid vet witch yak hug run sit swim jump nap hop " +
    "fishdog dogfish starfish snowman"
  ).split(" "),
);
