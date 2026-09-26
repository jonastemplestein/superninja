import { LINES } from '../../content/lines';
import type { DurationTable, Key, LineBook, LineMeta, Need, NotionRegistry, Tag, UttPart, Utterance, UtteranceSpec } from '../types';
import { durations } from './durations';
import { lineTags } from './line-tags';
import { teachMoment } from './teach';
export function lineHash(text:string,who:string):string { let h=2166136261; for(const c of `${who}\n${text}`) h=Math.imul(h^c.charCodeAt(0),16777619); return (h>>>0).toString(16).padStart(8,'0'); }
const indexed=Object.fromEntries(LINES.map(l=>[l.id,l]));
export function tagCoverage(meta:Readonly<Record<string,LineMeta>>) {
  return { missing:LINES.filter(l=>!meta[l.id]).map(l=>l.id), stale:LINES.filter(l=>meta[l.id]&&meta[l.id].hash!==lineHash(l.text,l.who??'sensei')).map(l=>l.id), removed:Object.keys(meta).filter(id=>!indexed[id]) };
}
export function validateLineTags(meta:Readonly<Record<string,LineMeta>>, notions:NotionRegistry):string[] {
  const errors:string[]=[];
  const valid=(key:Key)=>/^(gpc|sound|spelling|word|special|concept|idea|mech|term|char|place|fact|obj|lesson|unit):[^:]+/.test(key);
  for(const m of Object.values(meta)) {
    for(const tag of m.tags) { if(!valid(tag.key)) errors.push(`${m.id}: invalid key ${tag.key}`); if(tag.as==='demonstrate'||tag.as==='use') errors.push(`${m.id}: invalid role ${tag.as}`); }
    for(const need of m.needs) { if(!valid(need.key)) errors.push(`${m.id}: invalid need ${need.key}`); else if(!/^(gpc|sound|spelling|word|special|lesson|unit):/.test(need.key)&&!notions[need.key]) errors.push(`${m.id}: unregistered need ${need.key}`); }
  }
  return errors;
}
export function createLineBook(meta:Readonly<Record<string,LineMeta>>=lineTags,duration:DurationTable=durations):LineBook {
  const partMs=(part:UttPart):number => 'gap' in part?part.gap:'line' in part?duration.line(part.line)??350*(indexed[part.line]?.text.trim().split(/\s+/).length??1):'word' in part?duration.word(part.word)??350:'stretch' in part?duration.stretch(part.stretch)??350:'sound' in part?duration.sound(part.sound)??350:'sounds' in part?part.sounds.reduce((n,s,i)=>n+(duration.sound(s.p)??350)+(i?part.gapMs??320:0),0):duration.story(part.story,part.page)??350;
  const utter=(spec:UtteranceSpec,o:{interruptible?:boolean;reveal?:boolean;rotation?:number}={}):Utterance => {
    const parts:UttPart[]='line' in spec?[{line:spec.line}]:'teach' in spec?teachMoment(spec.teach,o.rotation??0):spec.parts;
    const lines=parts.flatMap(p=>'line' in p?[p.line]:[]);
    const first=lines.map(id=>meta[id]).find(Boolean);
    const who='who' in spec&&spec.who?spec.who:first?.who??'sensei';
    const purpose='purpose' in spec&&spec.purpose?spec.purpose:first?.purpose??'instruction';
    const tags:Tag[]=[...('tags' in spec?spec.tags??[]:[]),...lines.flatMap(id=>meta[id]?.tags??[])];
    const needs:Need[]=[...('needs' in spec?spec.needs??[]:[]),...lines.flatMap(id=>meta[id]?.needs??[])];
    const texts:string[]=[];
    for(const p of parts) {
      if('line' in p) texts.push(indexed[p.line]?.text??p.line);
      else if('word' in p || 'stretch' in p) { const w='word' in p?p.word:p.stretch; texts.push('word' in p?`"${w}"`:`"${w}" (slowly)`); tags.push({key:`word:${w}`,as:'mention'}); }
      else if('sound' in p) { texts.push(`/${p.sound}/`); tags.push({key:`sound:${p.sound}`,as:'mention'}); }
      else if('sounds' in p) { texts.push(p.sounds.map(s=>`/${s.p}/`).join(' ')); for(const s of p.sounds) { tags.push({key:`sound:${s.p}`,as:'mention'},{key:`spelling:${s.g}`,as:'show'}); } }
    }
    for(let i=0;i<texts.length-1;i++) if(texts[i].endsWith('...')&&texts[i+1].startsWith('"')) texts[i]=texts[i].slice(0,-3)+'...';
    const unique=<T>(xs:T[],key:(x:T)=>string):T[]=>[...new Map(xs.map(x=>[key(x),x])).values()];
    const moment='teach' in spec ? spec.teach.m==='intro-gem'||spec.teach.m==='new-gem'?`gem:${spec.teach.gpc}`:spec.teach.m==='intro-petal'?`petal:${spec.teach.p}`:spec.teach.m==='same-sound'?`same:${spec.teach.p}`:spec.teach.m==='revisit-flower'?'visit:any':spec.teach.m : undefined;
    return {who,purpose,parts,...(moment?{moment}:{}),text:texts.join(' ').replace(/\s+([.,!?])/g,'$1'),tags:unique(tags,x=>`${x.key}/${x.as}`),needs:unique(needs,x=>`${x.key}/${x.level}`),lines,estMs:parts.reduce((n,p)=>n+partMs(p),0),interruptible:o.interruptible??('interruptible' in spec?spec.interruptible??false:false),...(o.reveal?{reveal:true}:{}),...(o.rotation!==undefined?{variant:o.rotation}:{})};
  };
  return {has:id=>!!indexed[id],text:id=>indexed[id]?.text??'',meta:id=>meta[id],estMs:partMs,utter};
}
