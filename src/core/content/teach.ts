import { WORDS, PHONEMES, type PhonemeId, type Word } from '../../content/phonics';
import { LINES } from '../../content/lines';
import { TEACH_EXAMPLES } from '../../content/teach-lines.gen';
import type { TeachMoment, UttPart } from '../types';
const has=new Set(LINES.map(x=>x.id));
const L=(line:string):UttPart[]=>has.has(line)?[{line}]:[];
const G=(gap:number):UttPart=>({gap});
const S=(sound:PhonemeId):UttPart=>({sound});
const W=(word:Word):UttPart=>({word:word.text});
const canon=(key:string)=>TEACH_EXAMPLES[key]?.map(text=>WORDS.find(w=>w.text===text)).filter((w):w is Word=>!!w)??[];
const examples=(g:string,p:PhonemeId,n=3,met:ReadonlySet<string>=new Set()):Word[]=>{ const ws=WORDS.filter(w=>w.segs.some(s=>s.g===g&&s.p===p)); return ws.sort((a,b)=>((met.has(b.text)?8:0)+(b.pic?4:0)-b.segs.length-b.unit*.3)-((met.has(a.text)?8:0)+(a.pic?4:0)-a.segs.length-a.unit*.3)).slice(0,n); };
const sounds=(p:PhonemeId,n=3,met:ReadonlySet<string>=new Set()):Word[]=>{ const ws=WORDS.filter(w=>w.segs.some(s=>s.p===p)); return ws.sort((a,b)=>((met.has(b.text)?6:0)+(b.pic?5:0)+(!PHONEMES[p].vowel&&b.segs[0].p===p?3:0)-b.segs.length-b.unit*.3)-((met.has(a.text)?6:0)+(a.pic?5:0)+(!PHONEMES[p].vowel&&a.segs[0].p===p?3:0)-a.segs.length-a.unit*.3)).slice(0,n); };
const list=(ws:Word[]):UttPart[]=>ws.flatMap((w,i)=>i>0&&i===ws.length-1?[...L('t_and'),W(w)]:[W(w),G(i<ws.length-1?260:0)]);
const clip=(id:string,fallback:UttPart[]):UttPart[]=>has.has(id)?[{line:id}]:fallback;
const safe=(key:string)=>key.replace('>','_').replace(/-/g,'');
const facts=(g:string,p:PhonemeId):UttPart[]=>g==='x'&&p==='ks'?L('t_one_spelling_two_sounds'):g.replace(/-/g,'').length===2?L('t_two_letters'):g.replace(/-/g,'').length===3?L('t_three_letters'):g.replace(/-/g,'').length===4?L('t_four_letters'):[];
const choose=<T>(variants:T[],rotation:number):T=>variants[((rotation%variants.length)+variants.length)%variants.length];
export function teachMoment(m:TeachMoment,rotation=0,met:ReadonlySet<string>=new Set()):UttPart[] {
  switch(m.m){
    case 'intro-petal': { const p=m.p, ex=canon(`petal:${p}`).length?canon(`petal:${p}`):sounds(p,3,met); const hear=clip(`tp_${p}_hear`,[...L('t_you_can_hear_it_in'),G(120),...list(ex)]); const words=clip(`tp_${p}_list`,list(ex)); return choose([
      [...L('t_petal_is'),G(120),S(p),G(450),...hear,G(400),...L('t_now_you_say_it'),G(900),S(p)],
      [...L('t_listen_can_you_hear'),G(100),S(p),G(80),...L('t_in_these_words'),G(350),...words,G(400),...L('t_they_all_have'),G(100),S(p)],
      [...L('t_listen_can_you_hear'),G(100),S(p),G(80),...L('t_in_these_words'),G(350),...words,G(400),...L('t_they_all_have'),G(100),S(p)],
      [...L('t_this_is_sound'),G(120),S(p),G(300),...L('t_everyone_say'),G(250),S(p),G(600),...hear]
    ],rotation); }
    case 'intro-gem': case 'new-gem': { const [g,p]=m.gpc.split('>') as [string,PhonemeId]; const ex=canon(`gem:${m.gpc}`).length?canon(`gem:${m.gpc}`):examples(g,p,3,met); const [first,...rest]=ex; const note=[...facts(g,p),...(['ff','ll','ss','zz'].includes(g)?L('t_often_end_short'):[])]; const fact=note.length?[G(350),...note]:[]; const ways=m.knownWays>=2?[G(450),...L(`t_ways_${Math.min(10,m.knownWays)}`),G(100),S(p),G(1)]:[]; const k=safe(m.gpc);
      const variants:UttPart[][]=first?[
        [...L('t_way_we_spell'),G(100),S(p),G(80),...clip(`tg_${k}_in`,[...L('t_in'),G(60),W(first)]),...fact,...(rest.length?[G(400),...clip(`tg_${k}_see`,[...L('t_we_see_it_in'),G(100),...list(rest)])]:[]),...ways],
        [...L('t_spelling_of'),G(100),S(p),...fact,G(300),...clip(`tg_${k}_like`,[...L('t_like_in'),G(80),...list(ex)]),...ways]
      ]:[[...L('t_spelling_of'),G(100),S(p),...fact,...ways]];
      if('another' in m&&m.another) variants.push([...L('t_another_way'),G(100),S(p),...fact,G(300),...clip(`tg_${k}_like`,[...L('t_like_in'),G(80),...list(ex)]),...ways]);
      const say=choose(variants,rotation); return m.m==='new-gem'?[...L('t_new_gem_here'),G(400),...say]:say;
    }
    case 'same-sound': { const ex=m.known.map(k=>{const [g,p]=k.split('>') as [string,PhonemeId];return examples(g,p,1,met)[0]}).filter(Boolean);return choose([[...L('t_diff_spellings_of'),G(80),S(m.p),G(80),...L('t_same_sound'),G(450),...list(ex)],[...L('t_lets_remember'),G(100),S(m.p),G(350),...list(ex),G(450),...L('t_diff_spellings_of'),G(80),S(m.p),G(80),...L('t_same_sound')]],rotation); }
    case 'same-spelling': { const [a,b]=m.sounds; return [...L('t_same_spelling_sometimes'),G(80),S(a),G(80),...examples(m.g,a,1,met).map(W),G(300),...L('t_and_sometimes'),G(80),S(b),G(80),...examples(m.g,b,1,met).map(W)]; }
    case 'can-be': return [...L('t_this_can_be'),G(80),S(m.a),G(80),...L('t_but_in_this_word'),G(80),S(m.b)];
    case 'say-here': return [...L('this_is'),G(80),S(m.p),G(350),...L('t_say_it_here')];
    case 'which-sound': return [...L('t_does_it_have'),G(80),S(m.a),G(80),...L('t_or'),G(80),S(m.b)];
    case 'revisit-flower': return choose([L('t_visit'),L('t_look_growing'),[...L('t_visit'),G(300),...L('t_look_growing')]],rotation);
  }
}
