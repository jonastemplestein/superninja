import type { CoverageRow, GameEvent, Key, NotionRegistry } from '../types';
import { entry, initial, apply } from '../ledger';
import { dosageFor } from '../content/notions';
import { DAY } from '../kernel/time';
/** Summarise completed explanations and first real uses from the same durable event log. */
export function coverage(events: readonly GameEvent[], notions: NotionRegistry): CoverageRow[] {
  let ledger=initial();
  const firstExplained=new Map<Key,{session:number;at:number}>(), firstUsed=new Map<Key,{session:number;at:number}>();
  const over=new Set<Key>();
  const uses=new Map<Key,number[]>();
  const stale=new Set<Key>();
  for(const e of [...events].sort((a,b)=>a.seq-b.seq)) {
    const before=ledger;
    const usedKeys:Key[]=e.kind==='exp.said'?e.utt.needs.map(n=>n.key):e.kind==='exp.shown'?[...e.screen.needs,...e.screen.affordances.flatMap(a=>a.needs??[])].map(n=>n.key):e.kind==='exp.cue'?e.needs.map(n=>n.key):e.kind==='obs.attempt'&&!e.probe&&e.origin!=='shadow'?e.uses:[];
    for(const key of new Set(usedKeys)) {
      uses.set(key,[...(uses.get(key)??[]),e.t]);
      const d=notions[key]?.dosage;
      const previous=entry(before,key);
      if(d?.refreshAfterDays && previous.lastExplained!==undefined && e.t-Math.max(previous.lastExplained,previous.lastReminded??0)>d.refreshAfterDays*DAY) stale.add(key);
    }
    ledger=apply(ledger,e);
    const session=Number(e.sid.match(/:s(\d+)$/)?.[1]??0);
    for(const x of Object.values(ledger.entries)) {
      const old=entry(before,x.key);
      if(!firstExplained.has(x.key) && x.lastExplained!==undefined && (x.explained+x.demonstrated)>(old.explained+old.demonstrated)) firstExplained.set(x.key,{session,at:e.t});
      if(!firstUsed.has(x.key)&&x.firstUsed!==undefined&&old.firstUsed===undefined) firstUsed.set(x.key,{session,at:e.t});
      const d=notions[x.key]?.dosage ?? (x.key.startsWith('gpc:') ? {maxPerSession:2} : {maxPerSession:2});
      if(x.thisSession>d.maxPerSession) over.add(x.key);
    }
  }
  return Object.values(ledger.entries).map(x=>{
    const n=notions[x.key],d=n?.dosage??(x.key.startsWith('gpc:')?{...dosageFor('idea'),beforeUse:1,retireAfter:12,refreshAfterDays:10}:null);
    const full=x.explained+(x.key.startsWith('mech:')?x.demonstrated:0);
    const used=firstUsed.get(x.key),explained=firstExplained.get(x.key);
    const window=d ? Math.max(d.minSessions,1+d.spacing.filter(s=>s.after==='sessions').reduce((a,s)=>a+s.n,0)) : 1;
    const closed=x.useSessions>=window;
    let verdict:CoverageRow['verdict']='ok';
    if(used && (!explained||used.at<explained.at) && !x.assumed) verdict='used-before-explained';
    else if(over.has(x.key)) verdict='over-repeated';
    else if(used && d && !closed) verdict='open';
    else if(used && d && (full<d.full || x.sessions<d.minSessions)) verdict='under-dosed';
    else if(stale.has(x.key)) verdict='stale';
    else if(explained&&!used) verdict='explained-never-used';
    else if(!explained&&!used) verdict='never-met';
    return {key:x.key,label:n?.label??x.key,dosage:d,firstExplainedAt:explained,firstUsedAt:used,full,fullSessions:x.sessions,reminders:x.reminded,interrupted:x.interrupted,uses:(uses.get(x.key)??[]).length,usedCorrectly:x.usedCorrectly,correctUseSessions:x.correctUseSessions,longestGapH:(uses.get(x.key)??[]).slice(1).reduce((max,t,i)=>Math.max(max,(t-(uses.get(x.key)??[])[i])/(60*60*1000)),0),verdict};
  }).sort((a,b)=>a.key.localeCompare(b.key));
}
