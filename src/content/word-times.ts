// When each word starts inside a multi-word clip (seconds into the clip), for spotlights, sticker landings and rail
// lights that follow the speech (docs/FIRST_MINUTES.md §12). engine/audio.ts wordTimes(id) serves them; a scene that
// wants them exactly on the clip's clock listens with onClip()/nextClip().
/** Speech islands measured on the recordings (Whisper's own word starts were ~0.5 s early on these lists;
 *  playtest/first-minutes-assets.md). */
export const WORD_TIMES: Record<string, number[]> = {
  fm_rw1_list: [0.04, 1.11, 2.23, 3.05, 3.98], // sun, sock, cat, sausage, moon
  fm_rw2_list: [0.05, 1.19, 2.23, 3.23, 4.62, 5.75], // fish, dog, flower, sunflower, star, starfish
  fm_read_fish_dog: [0.13, 1.14, 2.11], // fish... dog... fish dog!
  fm_l2_swap: [3.08, 4.05, 5.07], // dog... fish... dog fish! (dog: its speech island, 28 Sep; Whisper's 3.28 was mid-vowel)
  fm_which_cat_dog: [0.82, 1.5, 1.99], // cat... dog... which one (cat, which: speech islands, 28 Sep; Whisper's were 0.24 and 0.11 s late)
  fm_sunflower: [1.38, 2.67, 5.12], // sun... flower... sunflower!
  fm_starfish_q: [0.04, 1.16, 2.02], // star... fish... tap the rabbit (the 28 Sep Erinome take: its words.json)
  fm_rw2_s: [0.04, 1.37, 2.76, 4.05], // sun, sock, sausage, sunflower
  fm_read_cat_dog_fish: [0.02, 1.13, 2.15, 3.01], // cat... dog... fish... cat-dog-fish!
  fm_l4_swap: [2.42, 3.02, 4, 5.73], // fish... dog... cat... fish dog cat!
  fm_which_three: [0.97, 1.51, 1.98, 2.98], // fish... dog... cat... which one
  fm_sunflower_q: [0.03, 0.97, 1.97], // sun... flower... tap the rabbit (the 28 Sep Erinome take: speech islands)
  fm_rainbow_q: [0.02, 1.13, 1.97], // rain... bow... tap the rabbit (the 27 Sep take: its words.json)
  fm_snowman_q: [0.03, 1.28, 2.39], // snow... man... tap the rabbit (the 27 Sep take: its words.json)
};


/** Every word of a teacher-voice line that spotlights something as it is said (FIX_PLAN TV-F2.1: ▶ and the paw on
 *  their words, the ninjas on their names, the opt-in cards, the demo's paw), with when it starts (s into the clip).
 *  From public/a/l/<id>.words.json (Whisper's spans, a word after a pause moved to where its speech island starts), with
 *  the script's own spelling of each word where Whisper heard the same number of words. Re-take a line: re-time it. */
export const LINE_WORDS: Record<string, readonly (readonly [string, number])[]> = {
  // (partial: the one word each scene times an action on; measured by B4 on the current takes, 27 Sep. Re-time on a retake)
  fm_rw2_petal: [["its", 3.14]],
  tv_rw_next: [["Tap", 4.21]],
  tv_next_game: [["tap", 1.84]], // the Erinome take (28 Sep: 2.05 was the Sulafat take's)
  tv_choose_q: [["First", 0.06], ["choose", 0.62], ["your", 0.86], ["ninja", 1.12], ["Will", 1.9], ["it", 2.0], ["be", 2.15], ["Kai", 2.28], ["or", 2.94], ["Suki", 3.28]],
  tv_choose_q_now: [["Now", 0.02], ["choose", 0.66], ["your", 0.88], ["ninja", 1.14], ["Will", 2.1], ["it", 2.22], ["be", 2.34], ["Kai", 2.51], ["or", 3.22], ["Suki", 3.63]], // the fix lanes, 28 Sep
  tv_ears_demo: [["I'll", 0.02], ["go", 0.18], ["first", 0.3], ["My", 1.47], ["word", 1.68], ["is", 1.92], ["sun", 2.14], ["There", 3.5], ["it", 3.64], ["is", 3.72]],
  tv_ido_pair_bed_sock: [["I'll", 0.07], ["go", 0.22], ["first", 0.34], ["Here's", 1.29], ["a", 1.6], ["bed", 1.8], ["and", 2.75], ["a", 3.08], ["sock", 3.22]],
  tv_ido_pair_bus_pan: [["I'll", 0.02], ["go", 0.2], ["first", 0.42], ["Here's", 1.28], ["a", 1.62], ["bus", 1.74], ["and", 2.19], ["a", 2.3], ["pan", 2.42]], // the fix lanes, 28 Sep
  tv_ido_pair_bus_pig: [["I'll", 0.02], ["go", 0.2], ["first", 0.32], ["Here's", 1.58], ["a", 2.5], ["bus", 2.83], ["and", 3.7], ["a", 3.8], ["pig", 3.92]],
  tv_ido_pair_cat_ant: [["I'll", 0.08], ["go", 0.2], ["first", 0.32], ["Here's", 1.22], ["a", 1.65], ["cat", 1.96], ["and", 2.35], ["an", 3.09], ["ant", 3.32]],
  tv_ido_pair_jam_tent: [["I'll", 0.02], ["go", 0.18], ["first", 0.3], ["Here's", 1.2], ["some", 1.5], ["jam", 1.64], ["and", 2.34], ["a", 2.62], ["tent", 2.72]],
  tv_ido_pair_map_hat: [["I'll", 0.02], ["go", 0.22], ["first", 0.32], ["Here's", 1.22], ["a", 1.5], ["map", 1.58], ["and", 2.12], ["a", 2.32], ["hat", 2.46]],
  tv_ido_pair_map_mop: [["I'll", 0.02], ["go", 0.22], ["first", 0.49], ["Here's", 1.38], ["a", 1.78], ["map", 1.9], ["and", 2.18], ["a", 2.52], ["mop", 2.62]],
  tv_ido_pair_nut_hat: [["I'll", 0.02], ["go", 0.22], ["first", 0.46], ["Here's", 1.28], ["a", 1.44], ["nut", 1.58], ["and", 1.87], ["a", 2.69], ["hat", 2.8]],
  tv_ido_pair_pan_pin: [["I'll", 0.06], ["go", 0.22], ["first", 0.42], ["Here's", 1.25], ["a", 1.48], ["pan", 1.6], ["and", 2.12], ["a", 2.24], ["pin", 2.35]],
  tv_learn_frame_four: [["Today", 0.02], ["in", 0.73], ["the", 0.86], ["dojo", 0.98], ["I'm", 1.86], ["going", 2.06], ["to", 2.18], ["teach", 2.38], ["you", 2.58], ["four", 3.03], ["new", 3.49], ["sounds", 3.68]],
  tv_learn_frame_three: [["Today", 0.02], ["in", 0.4], ["the", 0.76], ["dojo", 0.88], ["I'm", 1.8], ["going", 1.9], ["to", 1.98], ["teach", 2.08], ["you", 2.3], ["three", 2.72], ["new", 3.18], ["sounds", 3.62]],
  tv_learn_frame_two: [["Today", 0.02], ["in", 0.48], ["the", 0.6], ["dojo", 0.7], ["I'm", 1.38], ["going", 1.48], ["to", 1.58], ["teach", 1.73], ["you", 1.9], ["two", 2.22], ["new", 2.67], ["sounds", 2.88]],
  tv_opt_again: [["If", 0.02], ["you", 0.15], ["don't", 0.3], ["go", 0.66], ["yet", 0.82], ["tap", 1.62], ["the", 1.72], ["teddy", 1.84], ["If", 2.64], ["you", 2.78], ["do", 2.95], ["tap", 3.6], ["the", 3.78], ["school", 4.03]],
  tv_opt_notyet: [["If", 0.02], ["you", 0.14], ["don't", 0.24], ["go", 0.48], ["yet", 0.66], ["tap", 1.48], ["the", 1.78], ["teddy", 1.98]],
  tv_opt_yes: [["If", 0.02], ["you", 0.18], ["do", 0.34], ["tap", 1.07], ["the", 1.32], ["school", 1.4]],
  tv_pocket_frame: [["In", 0.02], ["Pocket", 0.35], ["Hunt", 0.64], ["we", 1.38], ["find", 1.63], ["pictures", 1.92], ["that", 2.45], ["start", 2.56], ["with", 3.14], ["this", 3.36], ["sound", 3.52]],
  tv_rc_q: [["Who", 0.05], ["read", 0.16], ["it", 0.32], ["right", 0.46], ["Tap", 1.4], ["Kai", 1.52], ["or", 2.02], ["tap", 2.2], ["Suki", 2.42]],
  tv_ready_first: [["Look", 0.02], ["your", 0.53], ["ninja", 0.68], ["is", 1.04], ["ready", 1.36], ["Are", 2.41], ["you", 2.5], ["ready", 2.72], ["too", 2.92], ["Tap", 4.06], ["the", 4.38], ["green", 4.48], ["arrow", 4.92]],
  tv_ready_help: [["When", 0.02], ["you're", 0.16], ["ready", 0.38], ["tap", 1.04], ["the", 1.33], ["green", 1.44], ["arrow", 1.93], ["To", 2.92], ["see", 3.0], ["it", 3.18], ["again", 3.26], ["tap", 4.04], ["my", 4.09], ["paw", 4.28]],
  tv_ready_paw: [["Do", 0.02], ["you", 0.12], ["want", 0.3], ["to", 0.46], ["have", 0.6], ["a", 0.74], ["go", 0.84], ["now", 1], ["Tap", 2.02], ["the", 2.19], ["green", 2.3], ["arrow", 2.7], ["Or", 3.74], ["tap", 4.4], ["my", 4.62], ["paw", 4.85], ["to", 5.26], ["see", 5.36], ["it", 5.54], ["again", 5.68]],
  tv_squish_fast: [["Then", 0.04], ["I", 0.66], ["tap", 0.86], ["the", 1.17], ["rabbit", 1.28], ["and", 1.6], ["squish", 2.62], ["them", 2.9], ["Sunflower", 3.61]],
  tv_squish_slow: [["I", 0.02], ["tap", 0.2], ["the", 0.51], ["tortoise", 0.64], ["and", 1.27], ["say", 1.4], ["them", 1.7], ["slowly", 1.9], ["sunflower", 3.21]],
  tv_to_flower_one: [["Let's", 0.02], ["take", 0.4], ["what", 0.58], ["you", 0.91], ["learnt", 1.1], ["to", 1.56], ["the", 1.68], ["World", 1.82], ["Flower", 2.34], ["Tap", 3.09], ["the", 3.32], ["green", 3.46], ["arrow", 3.66]], // the fix lanes, 28 Sep
  tv_ts_meet: [["Here", 0.1], ["are", 0.28], ["my", 0.42], ["friends", 0.69], ["the", 1.13], ["rabbit", 1.24], ["and", 1.63], ["the", 1.9], ["tortoise", 2.06]],
  tv_which_demo: [["I'll", 0.02], ["go", 0.16], ["first", 0.28], ["Fish", 1.26], ["dog", 2.54]],
  tv_which_fix_cat_dog: [["Let's", 0.02], ["listen", 0.34], ["again", 0.54], ["Cat", 1.84], ["dog", 2.88], ["Which", 4.06], ["row", 4.24], ["has", 4.48], ["the", 4.79], ["cat", 4.9], ["first", 5.19]],
  tv_which_fix_fish_dog_cat: [["Let's", 0.02], ["listen", 0.32], ["again", 0.5], ["Fish", 1.96], ["dog", 3.17], ["cat", 4.34], ["Which", 5.73], ["row", 5.88], ["has", 6.16], ["the", 6.57], ["fish", 6.76], ["first", 7.26]],
  tv_which_q_cat_dog: [["Here", 0.03], ["I", 0.26], ["go", 0.42], ["Cat", 1.5], ["dog", 3.42], ["Which", 4.32], ["row", 4.58], ["did", 4.76], ["I", 4.9], ["read", 5.04]],
  tv_which_q_fish_dog_cat: [["Here", 0.04], ["I", 0.18], ["go", 0.3], ["Fish", 1.19], ["dog", 2.14], ["cat", 3.07], ["Which", 4.08], ["row", 4.24], ["did", 4.46], ["I", 4.6], ["read", 4.72]],
};

const bare = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
/** When `word` starts in line `id` (seconds into the clip), for a spotlight or `holdReady`'s `spot`: the `nth` time
 *  the word is said (from 0), matched without case or punctuation. undefined when the line has no timings or not that
 *  word. `wordAt("tv_ready_first", "arrow")` → 4.92; `wordAt("tv_ready_paw", "paw")`. */
export function wordAt(id: string, word: string, nth = 0): number | undefined {
  const want = bare(word);
  return LINE_WORDS[id]?.filter(([w]) => bare(w) === want)[nth]?.[1];
}
