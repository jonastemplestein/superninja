// The running orders (see ./edit.ts). Beats are the boss theme's (144 BPM, beat 0 at 0.158 s; a phrase every 32 beats,
// the lift at beat 96).
//
// Each enemy gets a block of 5–6 beats (2.1–2.5 s), cut hit to hit: one of its big hits mid-fight (the ninja's throw,
// the burst on the beat, the monster reeling), then its knockout two beats later (the finisher's stars, the burst on the
// beat, the monster spinning off into the sky). The film opens on the first monster's landing: the drop, the boom and
// the stage's shake on the bed's first hit. (The landings of the others are filmed too, but in every one Sensei's
// caption "Uh oh! One of Baron Muddle's monsters is in the way!" pops up over the monster as it lands.)
import type { Plan, Shot } from "./edit";

/** the take kept for each enemy */
export const TAKE: Record<string, string> = {
  gloop: "gloop-t2", bamboo_bandit: "bamboo_bandit-t2", crabble: "crabble-t1", petal_imp: "petal_imp-t1", snow_puff: "snow_puff-t1",
  rock_golem: "rock_golem-t1", kappa: "kappa-t1", puffer: "puffer-t1", lantern_ghost: "lantern_ghost-t1", thunder_drum: "thunder_drum-t1",
  shadow_bat: "shadow_bat-t1", cloud_sprite: "cloud_sprite-t1", gem_guardian: "gem_guardian-t1", boss_panda: "boss_panda-t1",
  boss_oni: "boss_oni-t1", boss_yeti: "boss_yeti-t1", boss_serpent: "boss_serpent-t1", boss_knight: "boss_knight-t1", boss_baron: "boss_baron-t1",
};
/** which big hit (0-based, of those before the knockout) each block shows */
export const HIT: Record<string, number> = {
  gloop: 1, bamboo_bandit: 1, crabble: 1, petal_imp: 0, snow_puff: 1, rock_golem: 2, kappa: 1, puffer: 2, lantern_ghost: 1,
  thunder_drum: 2, shadow_bat: 1, cloud_sprite: 3, gem_guardian: 1,
  // the bosses: a hit once they are enraged (the red glow) where it doesn't run into Baron Muddle's cut-in, and a mix of
  // the ninja's moves (comet, kick, orb). (The yeti's hit 4, a bigger burst, held one frame just before it: 48.70 s.)
  boss_panda: 9, boss_oni: 10, boss_yeti: 10, boss_serpent: 12, boss_knight: 15, boss_baron: 11,
};

/** An enemy's block on `beat`: its big hit on the beat, its knockout `split` beats later. */
export function block(enemy: string, beat: number, o: { split?: number; hit?: Shot["anchor"]; hitPre?: number; koPre?: number; koLines?: string[]; tail?: number } = {}): Shot[] {
  const take = TAKE[enemy];
  return [
    { enemy, take, anchor: o.hit ?? { hit: HIT[enemy] ?? 1 }, beat, pre: o.hitPre ?? 0.45 },
    { enemy, take, anchor: "ko", beat: beat + (o.split ?? 2), pre: o.koPre ?? 0.45, lines: o.koLines, tail: o.tail },
  ];
}
const landing = (enemy: string, beat: number, pre = 0.1576): Shot => ({ enemy, take: TAKE[enemy], anchor: "entrance", beat, pre });

const MINIONS = ["bamboo_bandit", "crabble", "petal_imp", "snow_puff", "rock_golem", "kappa", "puffer", "lantern_ghost", "thunder_drum", "shadow_bat", "cloud_sprite", "gem_guardian"];
const BOSSES = ["boss_panda", "boss_oni", "boss_yeti", "boss_serpent", "boss_knight"];

/** Baron Muddle's finale from `ko`: the star volley and the blast into the sky, his pop-up on a cloud and "Nooo! My
 *  muddle!" (8 beats, cut in the pause before "This is not over, ninja..."); then, from just before "...I will be
 *  back!", the ninja's leap and the star that bonks him, on `ko + 13`; the take cuts to the reward 0.46 s later. */
function baronFinale(ko: number): Shot[] {
  const take = TAKE.boss_baron;
  return [
    { enemy: "boss_baron", take, anchor: "ko", beat: ko, pre: 0.45, lines: ["baron_lose"] },
    // the bonk: the thwack of the ninja's star at 127.837 s in boss_baron-t1 (the jump at 127.124, the ding with it)
    { enemy: "boss_baron", take, anchor: { sfx: "thwack", after: "baron_lose" }, beat: ko + 13, pre: 5 * (60 / 144), lines: ["baron_lose"] },
  ];
}

export const LONG: Plan = {
  name: "enemies-supercut",
  shots: [
    // the opener: Gloop lands on the bed's first hit and is knocked out two beats later
    landing("gloop", 0), { enemy: "gloop", take: TAKE.gloop, anchor: "ko", beat: 2, pre: 0.45 },
    // the little monsters, 5 beats each (beats 5–60), in the order the lands bring them; the Gem Guardian 6 (its gem
    // lights as it goes)
    ...MINIONS.slice(0, -1).flatMap((e, i) => block(e, 5 + i * 5)),
    ...block("gem_guardian", 60),
    // the bosses, 6 beats each (66–96)
    ...BOSSES.flatMap((e, i) => block(e, 66 + i * 6, { split: 3 })),
    // Baron Muddle lands on the lift (beat 96: "So."), takes a hit, and is knocked out; his finale
    { ...landing("boss_baron", 96, 0.2), lines: ["baron_w6"] },
    { enemy: "boss_baron", take: TAKE.boss_baron, anchor: { hit: HIT.boss_baron }, beat: 99, pre: 0.45 },
    ...baronFinale(101),
  ],
  // (the take cuts to the reward 0.46 s after the bonk: the last frame is held, fading to black, as the bed fades)
  endBeat: 115.1,
  hold: 1.6,
  fadeOut: 1.9,
  videoFade: 1.4,
  // Baron Muddle, enraged, as the knockout's stars fly at him
  poster: 42.1,
  music: 0.5,
};

export const SHORT: Plan = {
  name: "enemies-supercut-short",
  shots: [
    landing("gloop", 0), { enemy: "gloop", take: TAKE.gloop, anchor: "ko", beat: 2, pre: 0.45 },
    ...block("crabble", 5), ...block("kappa", 10), ...block("shadow_bat", 15), ...block("gem_guardian", 20),
    ...block("boss_yeti", 25, { split: 3 }),
    { enemy: "boss_baron", take: TAKE.boss_baron, anchor: { hit: HIT.boss_baron }, beat: 31, pre: 0.45 },
    ...baronFinale(33),
  ],
  endBeat: 47.1,
  hold: 0.7,
  fadeOut: 1.3,
  videoFade: 0.9,
  poster: 13.77,
  music: 0.5,
};

export const TEST: Plan = {
  name: "test", dir: new URL("./.work", import.meta.url).pathname,
  shots: [landing("gloop", 0), ...block("gloop", 2), ...block("bamboo_bandit", 6), ...block("crabble", 11), ...block("petal_imp", 16), ...block("snow_puff", 21)],
  endBeat: 26, fadeOut: 1, videoFade: 0.5, poster: 1, music: 0.5,
};
