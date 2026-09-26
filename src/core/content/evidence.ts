import type { CoreItemSpec, EvidenceRef, MechanicId, KcId } from '../types';
import { gpc, type SwSeg } from '../../content/sw';
const ref = (kc: KcId, role: EvidenceRef['role'], position?: number): EvidenceRef => ({ kc, role, ...(position === undefined ? {} : { position }) });
export function evidenceFor(item: CoreItemSpec, step: number, mechanic: MechanicId): EvidenceRef[] {
  const out: EvidenceRef[] = [];
  const add = (kc: KcId, role: EvidenceRef['role'], position?: number) => out.push(ref(kc,role,position));
  const segs = ('segs' in item ? item.segs : 'words' in item ? item.words.flatMap(w=>w.segs) : undefined) as SwSeg[] | undefined;
  const structure = segs ? segs.map(s => /[aeiou]/.test(s.p[0]) ? 'V' : 'C').join('') : 'CVC';
  switch (item.kind) {
    case 'word-building': case 'dictation': case 'poly-spelling': {
      const s = item.kind === 'poly-spelling' ? item.syllables.flatMap(x => x.segs)[step] : segs?.[step];
      if (s) add(`gpc:${gpc(s.g,s.p)}:spell`, 'target',step);
      add(`skill:segmenting:${structure}` as KcId,'component');
      break;
    }
    case 'symbol-search': add(`gpc:${gpc(item.answer,item.sound)}:spell`,'target'); if (item.contextWord) add(`word:${item.contextWord}:read`,'context'); break;
    case 'word-reading': case 'reading-in-text': case 'poly-reading': {
      if(item.kind==='reading-in-text' && item.words[step]?.special) { add(`special:${item.words[step].text}`,'target'); break; }
      const reading = item.kind === 'poly-reading' ? item.syllables.flatMap(x => x.segs) : segs ?? [];
      reading.forEach((s,i) => add(`gpc:${gpc(s.g,s.p)}:read`,i === step ? 'target' : 'component',i));
      add(`skill:blending:${structure}` as KcId,'component'); break;
    }
    case 'sound-swap': {
      const chain = item.chain[Math.floor(step / 2)];
      if (step % 2 === 0) add(`skill:phoneme-manipulation:${chain?.op ?? 'substitute'}`,'target');
      else { if (chain?.toSeg) add(`gpc:${gpc(chain.toSeg.g,chain.toSeg.p)}:spell`,'target',chain.position); add(`skill:phoneme-manipulation:${chain?.op ?? 'substitute'}`,'component'); }
      break;
    }
    case 'sound-sort': { const s = item.segs.find(s => s.p === item.sound); if (s) add(`gpc:${gpc(s.g,s.p)}:read`,'target'); add('concept:3','component'); break; }
    case 'spelling-sort': add(`gpc:${gpc(item.spelling,item.answer)}:read`,'target'); add('concept:4','component'); break;
    case 'spelling-choice': { const s = item.segs[item.slot]; add(`word:${item.word}:spell`,'target'); if (s) add(`gpc:${gpc(item.answer,s.p)}:spell`,'target',item.slot); add('concept:3','component'); break; }
    case 'oral-first-sound': case 'oral-middle-sound': case 'tap-all': {
      const middle = item.kind === 'oral-middle-sound' || item.kind === 'tap-all' && item.activity === 'oral-middle-sound';
      add(middle ? 'pa:middle-sound' : 'pa:first-sound','target');
      if ('sound' in item && item.sound) add(`sound:${item.sound}:hear`,'target');
      if ('target' in item && typeof item.target === 'string') add(`word:${item.target}:read`,'context');
      if(item.kind==='tap-all' && item.cards[step]) add(`word:${item.cards[step]}:read`,'context');
      break;
    }
    case 'oral-listening': add('pa:discriminate','target'); break;
    case 'oral-blending': add('pa:oral-blend','target'); break;
    case 'oral-segmenting': add('pa:oral-segment','target'); break;
    case 'rail': if (item.judged === 'order') add('pa:left-to-right','target'); break;
    case 'choice': if (item.answer !== undefined) add('pa:left-to-right','target'); break;
  }
  add(`mech:${mechanic}`,out.some(r=>r.role==='target')?'component':'target');
  return out;
}
