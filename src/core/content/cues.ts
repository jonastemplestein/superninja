import type { Cue, Key, Need, Tag } from '../types';
export function cueMeta(cue:Cue):{tags:Tag[];needs:Need[]} {
  const show=(key:Key):Tag=>({key,as:'show'});
  const need=(key:Key):Need=>({key,level:'explained'});
  switch(cue.cue) {
    case 'gem-energy': return {tags:[show('obj:gem'),show(`gpc:${cue.gpc}`)],needs:[need('obj:gem'),need('idea:gems-fill-with-practice')]};
    case 'sticker': return {tags:[show('obj:sticker-book'),show(`word:${cue.word}`)],needs:[need('obj:sticker-book')]};
    case 'petal': return {tags:[show('obj:petal'),show(`sound:${cue.p}`)],needs:[need('obj:world-flower')]};
    case 'hint': case 'name-card': return {tags:cue.target.startsWith('pic:')?[show(`word:${cue.target.slice(4)}`)]:[],needs:[]};
    case 'reveal-spelling': return {tags:[show(`spelling:${cue.g}`)],needs:[need('term:spelling')]};
    case 'sound-dots': return {tags:[],needs:[need('idea:words-are-made-of-sounds')]};
    case 'fast-slow': return {tags:[],needs:[]};
    case 'rail-light': return {tags:[],needs:[need('idea:left-to-right')]};
    case 'place-tile': return {tags:[],needs:[need('mech:tile-to-line')]};
    case 'scene': case 'right': case 'wrong': case 'dim': case 'clear': case 'paw': case 'echo': case 'too-early': case 'pocket': case 'merge': case 'beads': case 'light-seg': case 'sweep-lines': case 'word-done': case 'tier-up': case 'streak-lost': case 'celebrate': case 'fly': case 'monster': case 'baron': return {tags:[],needs:[]};
  }
}
