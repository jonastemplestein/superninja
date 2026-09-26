// When each word starts inside a multi-word clip (seconds into the clip), for spotlights, sticker landings and rail
// lights that follow the speech (docs/FIRST_MINUTES.md §12). engine/audio.ts wordTimes(id) serves them; a scene that
// wants them exactly on the clip's clock listens with onClip()/nextClip().
/** Speech islands measured on the recordings (Whisper's own word starts were ~0.5 s early on these lists;
 *  playtest/first-minutes-assets.md). */
export const WORD_TIMES: Record<string, number[]> = {
  fm_rw1_list: [0.02, 1.0, 2.04, 2.98, 4.3], // sun, sock, cat, sausage, moon
  fm_rw2_list: [0.06, 1.36, 2.48, 3.62, 4.86, 5.8], // fish, dog, flower, sunflower, star, starfish
  fm_read_fish_dog: [0.04, 0.62, 1.68], // fish... dog... fish dog!
  fm_l2_swap: [2.92, 3.62, 5.2], // dog... fish... dog fish!
  fm_which_cat_dog: [1.62, 2.24, 3.38], // cat... dog... which one
  fm_sunflower: [1.52, 2.6, 4.96], // sun... flower... sunflower!
  fm_starfish_q: [0.02, 1.28, 2.32], // star... fish... tap the rabbit
  fm_rw2_s: [0.02, 1.04, 2.12, 3.06], // sun, sock, sausage, sunflower
  fm_read_cat_dog_fish: [0.02, 1.08, 2.02, 3.5], // cat... dog... fish... cat-dog-fish!
  fm_l4_swap: [1.92, 2.76, 3.5, 4.38], // fish... dog... cat... fish dog cat!
  fm_which_three: [1.04, 1.8, 2.48, 3.54], // fish... dog... cat... which one
  fm_sunflower_q: [0.02, 1.2, 2.34], // sun... flower... tap the rabbit
  fm_rainbow_q: [0.02, 1.52, 2.7], // rain... bow... tap the rabbit (silencedetect -38 dB, 26 Sep)
  fm_snowman_q: [0.1, 1.28, 2.47], // snow... man... tap the rabbit
};

