/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SW_SEQUENCE, knownGpcsAt, isDecodableAt } from '../../content/sw';
import { LINES } from '../../content/lines';
import { createCurriculum } from './curriculum';
import { evidenceFor } from './evidence';
import { createLineBook, lineHash, tagCoverage, validateLineTags } from './linebook';
import { draftLineTags } from './line-tags.draft';
import { notions } from './notions';
import { durations, durationTable } from './durations';
import { cueMeta } from './cues';
import { teachMoment } from './teach';
import type { CoreItemSpec, Cue, LineMeta } from '../types';
const c=createCurriculum({split:'consonant-e'});
test('content 1 sequence adds PW stages and knownAt agrees with Sounds~Write',()=>{assert.deepEqual(c.sequence.filter(u=>!u.startsWith('PW')),SW_SEQUENCE);for(const split of ['split','consonant-e'] as const){const cur=createCurriculum({split});for(const u of SW_SEQUENCE)assert.deepEqual(cur.knownAt(u),knownGpcsAt(u,{split}));}});
test('content 2 every written word is first decodable at its assigned unit',()=>{for(const w of c.words({})){if(w.oralOnly)continue;assert.equal(isDecodableAt(w.segs,w.unit,{split:c.split}),true,w.text);const index=SW_SEQUENCE.indexOf(w.unit);for(let i=0;i<index;i++)assert.equal(isDecodableAt(w.segs,SW_SEQUENCE[i],{split:c.split}),false,`${w.text} at ${SW_SEQUENCE[i]}`);}});
test('content 3 IC1 decodable words are exactly the unit words, sorted',()=>{assert.deepEqual(c.words({decodableWith:c.knownAt('IC1')}).map(w=>w.text),['am','at','it','mat','sat','sit']);});
test('content 4 sat contrasts sit at middle and mat at first',()=>{const xs=c.contrasts(c.word('sat')!);assert.ok(xs.some(x=>x.word.text==='sit'&&x.position===1));assert.ok(xs.some(x=>x.word.text==='mat'&&x.position===0));assert.ok(xs.every(x=>x.word.text.length===3));});
test('content 5 evidence maps spelling, reading, oral, sorts and swaps',()=>{const segs=[{g:'m',p:'m'},{g:'a',p:'a'},{g:'t',p:'t'}] as const;const word={kind:'word-building',activity:'word-building',unit:'IC1',targets:['a>a'],word:'mat',segs:[...segs],bank:['m','a','t'],distractors:[],stretch:false,write:false} as CoreItemSpec;const refs=evidenceFor(word,1,'tile-to-line');assert.deepEqual(refs[0],{kc:'gpc:a>a:spell',role:'target',position:1});assert.ok(refs.some(r=>r.kc==='mech:tile-to-line'&&r.role==='component'));const read={kind:'word-reading',activity:'word-reading',unit:'IC1',targets:[],word:'mat',segs:[...segs]} as CoreItemSpec;assert.ok(evidenceFor(read,1,'tap-reader').some(r=>r.kc==='gpc:a>a:read'&&r.role==='target'));const oral={kind:'oral-first-sound',activity:'oral-first-sound',unit:'IC1',targets:[],target:'sun',foils:['dog'],presentation:'whole',sound:'s'} as CoreItemSpec;assert.ok(evidenceFor(oral,0,'tap-picture').some(r=>r.kc==='pa:first-sound'));const sort={kind:'sound-sort',activity:'sound-sort',unit:'BR',targets:[],sound:'a',spellings:['a'],word:'mat',segs:[...segs],answer:'a'} as CoreItemSpec;assert.ok(evidenceFor(sort,0,'basket-sort').some(r=>r.kc==='concept:3'));});
test('content 6 tag coverage reports missing, stale and removed; invalid roles fail',()=>{const one=LINES[0];const meta:Record<string,LineMeta>={ [one.id]:{id:one.id,hash:'stale',who:'sensei',purpose:'instruction',tags:[{key:'idea:fast-and-slow-saying',as:'demonstrate'}],needs:[],repetition:'routine'}, gone:{id:'gone',hash:'x',who:'sensei',purpose:'instruction',tags:[],needs:[],repetition:'routine'} };const report=tagCoverage(meta);assert.ok(report.missing.length>0);assert.ok(report.stale.includes(one.id));assert.deepEqual(report.removed,['gone']);assert.ok(validateLineTags(meta,notions).some(x=>x.includes('invalid role')));assert.equal(Object.keys(draftLineTags).length,LINES.length);});
test('content 7 utterance joins lines, words, tags and durations',()=>{const l=LINES.find(x=>x.id==='listen_tap')!;const meta:LineMeta={id:l.id,hash:lineHash(l.text,l.who??'sensei'),who:'sensei',purpose:'prompt',tags:[],needs:[],repetition:'routine'};const book=createLineBook({listen_tap:meta},durationTable({'l/listen_tap':800,'w/pan':600}));const u=book.utter({parts:[{line:'listen_tap'},{gap:100},{word:'pan'}],who:'sensei',purpose:'prompt'});assert.equal(u.text,'Tap the... "pan"');assert.equal(u.estMs,1500);assert.ok(u.tags.some(t=>t.key==='word:pan'));});
test('content 8 teach rotation preserves Sounds~Write phrasing',()=>{const moment={m:'intro-gem',gpc:'ai>ae',knownWays:2,another:true} as const;const first=teachMoment(moment,0),second=teachMoment(moment,1),third=teachMoment(moment,2);assert.ok(first.some(p=>'line' in p&&p.line==='t_way_we_spell'));assert.ok(second.some(p=>'line' in p&&p.line==='t_spelling_of'));assert.ok(third.some(p=>'line' in p&&p.line==='t_another_way'));assert.deepEqual(teachMoment(moment,3),first);});
test('content 9 registry has acyclic dependencies and existing provider lines',()=>{const seen=new Set<string>();const visit=(key:string,trail=new Set<string>())=>{assert.equal(trail.has(key),false,key);if(seen.has(key))return;trail.add(key);for(const dep of notions[key]?.dependsOn??[])visit(dep,new Set(trail));seen.add(key);};for(const n of Object.values(notions)){visit(n.key);for(const p of n.providers)if(p.exposition.kind==='lines')for(const id of p.exposition.lines)assert.ok(LINES.some(l=>l.id===id),id);}assert.deepEqual(Object.values(notions).filter(n=>!n.providers.some(p=>p.form==='full')).map(n=>n.key),['mech:replay-button']);});
test('content 10 duration lookup and missing clip word-count fallback',()=>{assert.equal(durations.line('nonexistent'),undefined);const book=createLineBook({},durationTable({}));assert.equal(book.estMs({line:'fm_hear_sounds'}),350*LINES.find(l=>l.id==='fm_hear_sounds')!.text.split(/\s+/).length);});
test('content 11 every cue kind resolves metadata',()=>{const names=['right','wrong','hint','dim','clear','paw','name-card','echo','too-early','sound-dots','fast-slow','pocket','rail-light','merge','beads','petal','reveal-spelling','place-tile','light-seg','sweep-lines','word-done','tier-up','streak-lost','celebrate','fly','monster','baron','sticker','gem-energy','scene'];for(const cue of names){const c={cue,target:'x',kind:'glow',p:'s',word:'sun',tier:'picture',g:'a',gpc:'a>a'} as unknown as Cue;assert.ok(cueMeta(c));}assert.ok(cueMeta({cue:'gem-energy',gpc:'a>a',to:.5}).needs.some(n=>n.key==='idea:gems-fill-with-practice'));});

test('content 5b evidence table covers remaining activity rows',()=>{
  const segs=[{g:'m',p:'m'},{g:'a',p:'a'},{g:'t',p:'t'}];
  const rows:[CoreItemSpec,number,string][]=[
    [{kind:'dictation',activity:'dictation-word',unit:'IC1',targets:[],mode:'word',text:'mat',words:[{text:'mat',segs}],maxUnit:'IC1',board:[]} as CoreItemSpec,1,'gpc:a>a:spell'],
    [{kind:'symbol-search',activity:'symbol-search',unit:'IC1',targets:[],sound:'a',answer:'a',choices:['a','i'],contextWord:'mat'} as CoreItemSpec,0,'gpc:a>a:spell'],
    [{kind:'sound-swap',activity:'sound-swap',unit:'IC1',targets:[],chain:[{from:'mat',to:'mit',op:'substitute',position:1,toSeg:{g:'i',p:'i'}}]} as CoreItemSpec,0,'skill:phoneme-manipulation:substitute'],
    [{kind:'sound-swap',activity:'sound-swap',unit:'IC1',targets:[],chain:[{from:'mat',to:'mit',op:'substitute',position:1,toSeg:{g:'i',p:'i'}}]} as CoreItemSpec,1,'gpc:i>i:spell'],
    [{kind:'spelling-sort',activity:'spelling-sort',unit:'EC1',targets:[],spelling:'a',sounds:['a'],word:'mat',segs,answer:'a'} as CoreItemSpec,0,'concept:4'],
    [{kind:'spelling-choice',activity:'spelling-choice',unit:'IC1',targets:[],word:'mat',segs,slot:1,choices:['a','i'],answer:'a'} as CoreItemSpec,1,'word:mat:spell'],
    [{kind:'oral-listening',activity:'oral-listening',unit:'IC1',targets:[],target:'pan',foils:['pin'],presentation:'whole'} as CoreItemSpec,0,'pa:discriminate'],
    [{kind:'oral-blending',activity:'oral-blending',unit:'IC1',targets:[],target:'pan',foils:['pin'],presentation:'segmented'} as CoreItemSpec,0,'pa:oral-blend'],
    [{kind:'oral-middle-sound',activity:'oral-middle-sound',unit:'IC1',targets:[],target:'pan',foils:['pin'],presentation:'whole',sound:'a'} as CoreItemSpec,0,'pa:middle-sound'],
    [{kind:'tap-all',activity:'oral-first-sound',targets:[],how:'start',sound:'s',cards:['sock','sun'],answers:['sock']} as CoreItemSpec,0,'pa:first-sound'],
    [{kind:'rail',activity:'left-to-right',targets:[],taps:[{value:'sun',label:'sun'}],by:'child',judged:'order'} as CoreItemSpec,0,'pa:left-to-right'],
    [{kind:'tutorial',activity:'tutorial',targets:[],target:'sock',options:['sock']} as CoreItemSpec,0,'mech:tap-picture'],
  ];
  for(const [item,step,target] of rows)assert.ok(evidenceFor(item,step,'tap-picture').some(r=>r.kc===target&&r.role===(target==='concept:4'?'component':'target')),`${item.kind}: ${target}`);
});
