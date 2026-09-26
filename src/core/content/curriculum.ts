import { SW_SEQUENCE, POLYSYLLABIC, INITIAL_CODE_UNITS, BRIDGING_UNIT, EXTENDED_CODE_UNITS, knownGpcsAt, newGpcsIn, firstTaught, isDecodableAt, structureOf, SESSION, gpc, type SplitPolicy, type SwSeg, type SwUnitId } from '../../content/sw';
import { WORDS, ORAL_WORDS, GRAPHEMES, WORD_BY_TEXT, dictationSafe } from '../../content/phonics';
import { PIC_NAMES } from '../../content/pic-names';
import { STORIES } from '../../content/stories';
import { UNIT_DATA } from './unit-data';
import { durations } from './durations';
import { evidenceFor } from './evidence';
import type { Curriculum, WordEntry, WordQuery, UnitContent } from '../types';
const PW_AFTER = ['EC4','EC6','EC8','EC8','EC18','EC26','EC35','EC42','EC49'];
const sequence: SwUnitId[] = [...SW_SEQUENCE];
POLYSYLLABIC.forEach((p,i) => sequence.splice(sequence.indexOf(PW_AFTER[i] as SwUnitId) + 1,0,p.id));
function parseSegs(spec: string): SwSeg[] {
  return spec.split('.').map(part => { const match=part.match(/^([^=:]+)(?:=([^:]+))?(?::(\d+))?$/); if(!match) throw new Error(`Invalid segment: ${part}`); const [,g,p,gap]=match; return { g, p: (p || GRAPHEMES[g]) as SwSeg['p'], ...(gap ? { gap: Number(gap) } : {}) }; });
}
export function createCurriculum({ split }: { split: SplitPolicy }): Curriculum {
  const codeSequence = SW_SEQUENCE;
  const firstUnit = (segs: SwSeg[]): SwUnitId | undefined => codeSequence.find(u => isDecodableAt(segs,u,{split}));
  const byText = new Map<string, WordEntry>();
  for (const id of codeSequence) {
    const raw = UNIT_DATA[id as keyof typeof UNIT_DATA] as { words: readonly { text:string; segs:string; pic?:string; tags: readonly string[] }[] } | undefined;
    for (const w of raw?.words ?? []) {
      const segs = parseSegs(w.segs);
      const unit = firstUnit(segs);
      if (!unit || byText.has(w.text)) continue;
      const picName = PIC_NAMES[w.text];
      byText.set(w.text, { text:w.text, segs, unit, structure:structureOf(segs.map(s=>s.p)), pic:w.pic, picSafe: !picName || picName[1] && picName[2], picSaysFirst: !picName || picName[1], stretched: durations.stretch(w.text) !== undefined, dictationSafe: WORD_BY_TEXT[w.text] ? !!dictationSafe(WORD_BY_TEXT[w.text]) : !!w.pic || w.tags.includes('dictation-safe'), continuantStart: /^[msfnlrvz]|^(sh|th)/.test(segs[0]?.p ?? '') || 'aeiou'.includes(segs[0]?.p ?? ''), tags:[...w.tags] });
    }
  }
  for (const w of WORDS) if (!byText.has(w.text)) {
    const segs = w.segs.map(s => ({ ...s })); const unit = firstUnit(segs); if (!unit) continue;
    const picName = PIC_NAMES[w.text];
    byText.set(w.text, { text:w.text, segs, unit, structure:structureOf(segs.map(s=>s.p)), pic:w.pic, picSafe: !picName || picName[1] && picName[2], picSaysFirst: !picName || picName[1], stretched: durations.stretch(w.text) !== undefined, dictationSafe: !!dictationSafe(w), continuantStart: /^[msfnlrvz]|^(sh|th)/.test(segs[0]?.p ?? '') || 'aeiou'.includes(segs[0]?.p ?? ''), tags:[] });
  }
  for (const [text, info] of Object.entries(ORAL_WORDS)) if (!byText.has(text)) byText.set(text, { text, segs:[], unit:'IC1', structure:'', pic:info.pic, picSafe: !PIC_NAMES[text] || PIC_NAMES[text][1] && PIC_NAMES[text][2], picSaysFirst: !PIC_NAMES[text] || PIC_NAMES[text][1], stretched:durations.stretch(text)!==undefined, dictationSafe:false, continuantStart:true, oralOnly:true, tags:[] });
  const all = [...byText.values()].sort((a,b)=>a.text.localeCompare(b.text));
  const word = (text:string) => byText.get(text);
  const index = (u:SwUnitId) => sequence.indexOf(u);
  const unit = (u:SwUnitId): UnitContent => {
    const ic = INITIAL_CODE_UNITS.find(x=>x.id===u), ec = EXTENDED_CODE_UNITS.find(x=>x.id===u), pw = POLYSYLLABIC.find(x=>x.id===u);
    const raw = UNIT_DATA[u as keyof typeof UNIT_DATA];
    return { unit:u, kind:pw?'poly':ic?'initial':u==='BR'?'bridging':ec?.kind==='spelling'?'ec-spelling':'ec-sound', lessons:pw?.lessons ?? ic?.lessons ?? ec?.lessons ?? BRIDGING_UNIT.lessons, newGpcs:pw?[]:newGpcsIn(u,{split}), structures: pw?.structures ?? ic?.structures ?? [], concepts: ic?.concepts ?? [], ...(ec ? { target:{ sound:ec.sound, spelling:ec.spelling } } : {}), sentences: (raw?.sentences ?? []).map((s: {text: string})=>({ text:s.text, maxUnit:u })), chains:(raw?.chains ?? []).map((c: readonly string[])=>({ chain:[...c], nonsense:false, official:false })), poly:(raw?.poly ?? []).map((p: unknown)=>({ text:typeof p==='string'?p:'', syllables:[] })), specialWords: ic?.specialWords ?? [] };
  };
  const words = (q:WordQuery): readonly WordEntry[] => {
    const at = q.decodableWith ? codeSequence.find(u => { const known=knownGpcsAt(u,{split}); return known.size===q.decodableWith!.size && [...known].every(k=>q.decodableWith!.has(k)); }) : undefined;
    return all.filter(w =>
    (!q.decodableWith || !w.oralOnly && w.segs.every(s=>q.decodableWith!.has(gpc(s.g,s.p))) && (!at || codeSequence.indexOf(w.unit)<=codeSequence.indexOf(at))) &&
    (!q.units || q.units.includes(w.unit)) && (!q.contains || q.contains.every(k=>w.segs.some(s=>gpc(s.g,s.p)===k))) &&
    (q.picture===undefined || !!w.pic===q.picture) && (q.picSafe===undefined || w.picSafe===q.picSafe) &&
    (q.stretched===undefined || w.stretched===q.stretched) && (!q.firstSound || w.segs[0]?.p===q.firstSound) &&
    (!q.maxSounds || w.segs.length<=q.maxSounds) && (!q.structures || q.structures.includes(w.structure)) &&
    (q.dictationSafe===undefined || w.dictationSafe===q.dictationSafe) && (!q.exclude || !q.exclude.includes(w.text)));
  };
  return { version:'sw-2026-09', split, sequence, index, back:(u,n)=>sequence[index(u)-n], unit, knownAt:u=>knownGpcsAt(u.startsWith('PW')?(PW_AFTER[Number(u.slice(2))-1] as SwUnitId):u,{split}), firstTaught:k=>firstTaught(k,{split}), words, word,
    contrasts:(w,o={})=>all.flatMap(x=>{ if(x.oralOnly||x.segs.length!==w.segs.length||x.text.length!==w.text.length||x.text===w.text) return []; const diff=x.segs.map((s,i)=>s.p!==w.segs[i].p?i:-1).filter(i=>i>=0); return diff.length===1 && (o.position===undefined||o.position===diff[0]) && (!o.known||x.segs.every(s=>o.known!.has(gpc(s.g,s.p)))) ? [{word:x,position:diff[0]}] : []; }),
    evidenceFor, lessons:(u,part)=>{ const level=u.startsWith('EC')?'extended-code':'initial-code'; return SESSION.parts.find(p=>p.id===part)?.lessons[level] ?? []; },
    stories:max=>STORIES.filter(s=>SW_SEQUENCE.indexOf(`IC${s.maxUnit}` as SwUnitId)<=SW_SEQUENCE.indexOf(max)).map(s=>({ id:s.id, maxUnit:`IC${s.maxUnit}` as SwUnitId, land:s.world, title:s.title })),
    preCode:{ minimalPairs:[['pan','pin'],['map','mop'],['tap','top'],['cat','cot'],['hat','hot'],['pen','pin'],['peg','pig']], firstSound:Object.entries(ORAL_WORDS).reduce((out,[word,info])=>{(out[info.first]??=[]).push(word);return out;},{} as Curriculum['preCode']['firstSound']), middleSound:{ a:['pan','map','cat','hat'], i:['pin','pig','sit'], o:['mop','top','cot'] } },
  };
}
