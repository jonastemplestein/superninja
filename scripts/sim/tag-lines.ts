// Draft only. A person reviews this file before it becomes the runtime line-tags sidecar.
import { LINES } from '../../src/content/lines';
import { notions } from '../../src/core/content/notions';
import { lineHash } from '../../src/core/content/linebook';
import type { Key, LineMeta, Need, Tag, UttPurpose } from '../../src/core/types';
import { ask, choice, noul, pool, usage } from '../treadmill/jev-lib';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root=join(import.meta.dir,'../../src/core/content');
const path=join(root,'line-tags.draft.ts');
const old:Record<string,LineMeta>=existsSync(path)?(await import(path+`?t=${performance.now()}`)).draftLineTags:{};
const onlyMissing=process.argv.includes('--missing'), onlyStale=process.argv.includes('--stale');
const selected=LINES.filter(l=>!onlyMissing&&!onlyStale || (onlyMissing&&!old[l.id]) || (onlyStale&&old[l.id]?.hash!==lineHash(l.text,l.who??'sensei')));
const purposeRule=(id:string):UttPurpose|undefined => /^(yay_|well_|streak_)/.test(id)?'praise':/^(t_|tg_|tp_)/.test(id)?'explanation':/^help_/.test(id)?'hint':/^film_/.test(id)?'exposition':undefined;
const keyFor=(id:string,text:string):Key[]=>{
  const out=new Set<Key>();
  const direct:Record<string,Key>={ fm_same_word:'idea:fast-and-slow-saying',fm_hear_sounds:'idea:words-are-made-of-sounds',words_made:'idea:words-are-made-of-sounds',fm_notice_sun_sock:'idea:first-sound',fm_l2_way:'idea:left-to-right',fm_tap_all_in:'idea:middle-sound',how_we_spell:'idea:sounds-have-spellings',t_two_letters:'idea:two-letters-one-sound',t_same_sound:'idea:same-sound-different-spellings',fm_rw_book:'obj:sticker-book',fm_rw_every:'idea:stickers-for-pictures',fm_rw2_petal:'obj:petal',intro_8:'char:sensei',film_4:'char:baron',film_5:'fact:petals-scattered',film_1:'obj:world-flower',fm_help_short:'mech:help-button',fm_tap_sock:'mech:tap-picture',say_sounds_read:'idea:say-the-sounds-read-the-word' };
  if(direct[id]) out.add(direct[id]);
  if(/^tg_/.test(id)){const bits=id.split('_');if(bits.length>2)out.add(`gpc:${bits[1]}>${bits[2]}` as Key);}
  if(/^tp_/.test(id)){const bits=id.split('_');if(bits.length>2)out.add(`sound:${bits[1]}` as Key);}
  const lower=text.toLowerCase();
  for(const n of Object.values(notions)) {const significant=n.label.toLowerCase().split(/\W+/).filter(w=>w.length>3);if(significant.length&&significant.some(w=>lower.includes(w)))out.add(n.key);}
  return [...out].slice(0,4);
};
const purposes=['exposition','instruction','explanation','reminder','naming','prompt','model','correction','hint','praise','reward','story','banter','transition','meta'] as const;
const draft=await pool(selected,24,async(l)=>{
  const who=l.who??'sensei', rule=purposeRule(l.id), candidates=keyFor(l.id,l.text);
  const questions:Record<string,ReturnType<typeof choice>|ReturnType<typeof noul>>={
    purpose:choice('Classify this game speech line by its primary purpose. Explanation teaches a general idea, model supplies this item’s answer, prompt asks the child to act, naming names a picture, exposition gives story context.',Object.fromEntries(purposes.map(p=>[p,p]))),
  };
  candidates.forEach((key,i)=>{const n=notions[key]; const label=n?.label??key;
    questions[`tag${i}`]=choice(`Does this exact line explain, remind, mention, ask about, or not involve ${label}? Explain requires a complete idea or instruction, not just naming or asking.`,{explain:'Explains fully',remind:'Short recap of something already explained',mention:'Names or refers to it',ask:'Asks the child about it',none:'Not involved'});
    questions[`need${i}`]=noul(`Would a child who had never been told about ${label} be lost by this line? Judge the line itself, not a later answer.`, 'Yes, this prior explanation is needed','No, the line works without it');
  });
  const a=await ask({id:l.id,text:l.text,who,section:l.id.split('_')[0],screen:l.id.startsWith('film_')?'opening film':l.id.startsWith('fm_')?'first minutes':'game'},questions);
  const tags:Tag[]=[],needs:Need[]=[];
  candidates.forEach((key,i)=>{const tag=a[`tag${i}`];if(tag?.type==='choice'&&tag.choice!=='none'&&tag.probabilities[tag.choice]>=.6)tags.push({key,as:tag.choice as Tag['as']});const need=a[`need${i}`];if(need?.type==='noul'&&need.noul>=.75&&tag?.type==='choice'&&tag.choice!=='explain')needs.push({key,level:'explained'});});
  const judged=a.purpose?.type==='choice'&&a.purpose.probabilities[a.purpose.choice]>=.6?a.purpose.choice as UttPurpose:'instruction';
  return {id:l.id,hash:lineHash(l.text,who),who,purpose:rule??judged,tags,needs,repetition:/^(yay_|well_|streak_)/.test(l.id)?'vary':'routine'} satisfies LineMeta;
});
const all={...old,...Object.fromEntries(draft.map(x=>[x.id,x]))};
writeFileSync(path,'// Jev draft for human review. Do not import as the runtime tags until reviewed.\nimport type { LineMeta } from "../types";\nexport const draftLineTags: Record<string, LineMeta> = '+JSON.stringify(Object.fromEntries(Object.entries(all).sort(([a],[b])=>a.localeCompare(b))),null,2)+';\n');
console.log(JSON.stringify({drafted:draft.length,total:Object.keys(all).length,...usage()}));
