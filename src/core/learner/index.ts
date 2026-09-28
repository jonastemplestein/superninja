import { emptyFoundations, observeFoundation } from './foundations';
import { foundationsForAttempt } from './foundation-evidence';
import { canMoveOn as swCanMoveOn, rollUp, SW_ACTIVITIES, type Evidence, type GpcKey } from '../../content/sw';
import type { Attempt, GameEvent, KcFamily, KcId, KcState, KcStatus, LearnerApi, LearnerEnv, LearnerState, WordState } from '../types';
import { HOUR, expectedUnit } from '../kernel/time';

const clamp = (x:number, lo=0, hi=1) => Math.min(hi,Math.max(lo,x));
export function family(kc: KcId): KcFamily { return kc.startsWith('gpc:') ? kc.endsWith(':read') ? 'gpc-read' : 'gpc-spell' : kc.startsWith('skill:') ? 'skill' : kc.startsWith('pa:') ? 'pa' : kc.startsWith('sound:') ? 'sound' : kc.startsWith('word:') ? 'word' : kc.startsWith('special:') ? 'special' : kc.startsWith('concept:') ? 'concept' : 'mech'; }
const emptyKc = (kc:KcId, env:LearnerEnv):KcState => ({ kc, family:family(kc), pL:env.cfg.bkt[family(kc)].pL0, tUpdated:0, halfLifeH:env.cfg.memory.initialHalfLifeH, lapses:0, exposures:0, explained:0, modelled:0, opportunities:0, independent:0, recent:[], sessions:0, source:'observed' });
const emptyWord = (t:number):WordState => ({ heard:0,seen:0,readOk:0,readTries:0,spellOk:0,spellTries:0,last:t });
export const initial:LearnerApi['initial'] = (profile, child, env) => ({ v:1,profile,asOf:0,lastSeq:0,child,foundations:emptyFoundations(),kcs:{},confusions:{},words:{},latency:{},evidence:[],sw:rollUp([],env.cfg.mastery),units:{},frontier:'IC1',affect:{ guessing:0,positionBias:null,fatigue:0,frustration:0,boredom:0,errorsInRow:0,firstTriesInRow:0,activeMsThisSession:0,strayTapsThisSession:0,recent:[] },totals:{sessions:0,activeMs:0,attempts:0,items:0,days:[]} });
export const recall:LearnerApi['recall'] = (s,kc,now) => { const x=s.kcs[kc]; return x?.tLastSuccess===undefined || x.tLastRetrieval===undefined ? null : Math.pow(2,-Math.max(0,now-x.tLastRetrieval)/(HOUR*x.halfLifeH)); };
export const pKnown:LearnerApi['pKnown'] = (s,kc,now,env) => { const x=s.kcs[kc] ?? emptyKc(kc,env); const r=recall(s,kc,now); return r===null ? x.pL : x.pL*(env.cfg.memory.rFloor+(1-env.cfg.memory.rFloor)*r); };
const median = (xs:readonly number[]) => { const a=[...xs].sort((a,b)=>a-b); return a.length ? (a[(a.length-1)>>1]+a[a.length>>1])/2 : 0; };
export const grade:LearnerApi['grade'] = (a,s,env) => {
  if(a.phase!=='you-do'||a.choices===1) return null;
  if(!a.correct || 'none' in a.response && a.response.none==='timeout') return 0;
  if(a.attemptNo>1||a.support.level>=2) return 1;
  const latency=s.latency[a.mechanic];
  const slow=a.timing.latencyMs>(latency && latency.n>=5 ? latency.median+env.cfg.grade.slowMads*latency.mad : 5000);
  return a.support.level===1 || a.timing.early && a.choices<=2 || slow ? 2 : 3;
};
export const toEvidence:LearnerApi['toEvidence'] = (a,t,env) => {
  const activity = SW_ACTIVITIES[a.activity as keyof typeof SW_ACTIVITIES];
  if(!activity || activity.gameOnly || a.choices===1 || a.phase!=='you-do' || 'origin' in a && a.origin==='shadow') return [];
  const refs=a.evidence.filter(x=>x.role==='target' && x.kc.startsWith('gpc:'));
  return refs.map(r=>{ const gpc=r.kc.slice(4).replace(/:(read|spell)$/,'') as GpcKey;
    return { t, activity:a.activity as Evidence['activity'],skill:activity.skill,direction:activity.direction,gpc,gpcs:a.target.segs?.map(s=>`${s.g}>${s.p}` as GpcKey),word:a.target.word,structure:a.target.structure,unit:((a.target.unit==='IC8'||a.target.unit==='IC9'||a.target.unit==='IC10')?a.target.unit:env.curriculum.firstTaught(gpc)??a.target.unit),correct:a.correct,firstTry:a.attemptNo===1&&a.correct,helped:a.support.level>=2,errors:a.errors?.filter((e):e is Exclude<typeof e,'split-spelling'>=>e!=='split-spelling'),phase:a.phase,ms:a.timing.latencyMs };
  });
};
function weight(a:Attempt,s:LearnerState,env:LearnerEnv):number {
  const c=env.cfg.weight;
  let w=c.phase[a.phase];
  if(!a.correct) w=c.phase[a.phase]*(a.attemptNo>1?c.retryWrong:1);
  else if(a.attemptNo>1) w=c.retryCorrect;
  else w*=c.helpedCorrect[a.support.level];
  if(a.choices===2 && (a.itemKind==='dictation'||a.itemKind==='word-building')) w*=c.eliminationFactor;
  if(a.correct && a.choices>=2 && (a.timing.early||a.timing.latencyMs<c.rapidMs)) w*=c.rapidFactor;
  if(s.affect.guessing>=.5) w*=c.guessingFactor;
  if('none' in a.response && a.response.none==='timeout') w*=.6;
  return w;
}
function shares(a:Attempt,s:LearnerState,env:LearnerEnv,t:number):Map<KcId,number> {
  const refs=a.evidence.filter(r=>r.role!=='context');
  const out=new Map<KcId,number>();
  if(a.correct) { for(const r of refs) out.set(r.kc,r.role==='target'?1:env.cfg.blame.componentCreditOnCorrect); return out; }
  const target=refs.filter(r=>r.role==='target'), comp=refs.filter(r=>r.role==='component');
  const located=a.target.slot!==undefined || a.target.gpc!==undefined && a.target.position!==undefined;
  const masses=refs.map(r=>({ r,m:(1-pKnown(s,r.kc,t,env))*(located && r.role==='target'?0:!located && r.role==='target'?2:1) }));
  if(located && target.length) {
    for(const r of target) out.set(r.kc,env.cfg.blame.targetShareWhenLocated/target.length);
    const sum=comp.reduce((n,r)=>n+1-pKnown(s,r.kc,t,env),0);
    for(const r of comp) out.set(r.kc,(1-env.cfg.blame.targetShareWhenLocated)*(1-pKnown(s,r.kc,t,env))/(sum||comp.length));
  } else { const sum=masses.reduce((n,x)=>n+x.m,0); for(const x of masses) out.set(x.r.kc,x.m/(sum||masses.length)); }
  return out;
}
function exposureKcs(key:string, explained:boolean):KcId[] {
  if(key.startsWith('gpc:')) return explained ? [`${key}:read` as KcId,`${key}:spell` as KcId] : [];
  if(key.startsWith('sound:')) return [`${key}:hear` as KcId];
  if(key.startsWith('concept:')||key.startsWith('mech:')) return [key as KcId];
  return [];
}
function prior(s:LearnerState,e:Extract<GameEvent,{kind:'profile.change'}>,env:LearnerEnv):LearnerState {
  const change=e.change;
  if(change.kind!=='school-year'&&change.kind!=='band'&&change.kind!=='placed'&&change.kind!=='legacy-import') return s;
  if(change.kind==='legacy-import') {
    const save=change.save as {read?:Record<string,{n:number;ok:number}>;spell?:Record<string,{n:number;ok:number}>};
    const kcs={...s.kcs};
    for(const direction of ['read','spell'] as const) for(const [g,stats] of Object.entries(save[direction]??{})) {
      const kc=`gpc:${g}:${direction}` as KcId,old=kcs[kc]??emptyKc(kc,env);
      if(!old.opportunities) kcs[kc]={...old,pL:clamp((stats.ok+1)/(stats.n+2),.2,.8),source:'assumed',halfLifeH:env.cfg.memory.assumedHalfLifeH};
    }
    return {...s,kcs};
  }
  const child={...s.child};
  if(change.kind==='school-year') { child.schoolYear=change.year; child.schoolYearAt=change.at; }
  if(change.kind==='band') child.band=change.band;
  const band=child.band==='none' && change.kind==='school-year' ? (change.year==='R'||change.year==='Y1'||change.year==='Y2'?change.year:'none') : child.band;
  const expected=change.kind==='placed'?change.unit:expectedUnit(band,e.t);
  const kcs={...s.kcs};
  if(change.kind==='band') for(const [kc,old] of Object.entries(kcs)) if(kc.startsWith('gpc:') && old.source==='assumed' && !old.opportunities) {
    const taught=env.curriculum.firstTaught(kc.slice(4).replace(/:(read|spell)$/,'') as GpcKey);
    if(!expected || taught && env.curriculum.index(taught)>env.curriculum.index(expected)) kcs[kc]={...old,pL:env.cfg.bkt[old.family].pL0,source:'observed',halfLifeH:env.cfg.memory.initialHalfLifeH};
  }
  if(expected) {
    const units=env.curriculum.sequence.filter(u=>!u.startsWith('PW'));
    const end=units.indexOf(expected);
    for(let i=0;i<=end;i++) for(const g of env.curriculum.unit(units[i]).newGpcs) for(const direction of ['read','spell'] as const) {
      const kc=`gpc:${g}:${direction}` as KcId, old=kcs[kc]??emptyKc(kc,env);
      if(old.source==='observed' && old.opportunities) continue;
      const value=change.kind==='placed'?env.cfg.priors.placed:i<=end-2?env.cfg.priors.wellBefore:env.cfg.priors.upToExpected;
      kcs[kc]={...old,pL:Math.max(old.pL,value),source:'assumed',halfLifeH:env.cfg.memory.assumedHalfLifeH};
    }
  }
  return {...s,child,kcs,...(change.kind==='placed'?{frontier:change.unit}:{})};
}
export const apply:LearnerApi['apply'] = (s,e,env) => {
  if(e.kind==='obs.attempt' && e.origin==='shadow') return s;
  if(e.kind==='session.start') {
    const day=new Date(e.t).toISOString().slice(0,10);
    return {...s,asOf:e.t,lastSeq:e.seq,child:{...s.child,ageBand:e.ageBand},confusions:Object.fromEntries(Object.entries(s.confusions).map(([k,v])=>[k,v*env.cfg.confusionDecayPerSession])),affect:{...s.affect,activeMsThisSession:0,strayTapsThisSession:0,recent:[],guessing:0,errorsInRow:0,firstTriesInRow:0},totals:{...s.totals,sessions:s.totals.sessions+1,days:s.totals.days.includes(day)?s.totals.days:[...s.totals.days,day]}};
  }
  if(e.kind==='profile.change') { const result=prior(s,e,env); return result===s?s:{...result,asOf:e.t,lastSeq:e.seq}; }
  if(e.kind==='exp.said'||e.kind==='exp.modelled'||e.kind==='exp.shown') {
    if(e.kind==='exp.said'&&!e.completed) return s;
    const kcs={...s.kcs}, words={...s.words};
    for(const tag of e.kind==='exp.said'?e.utt.tags:e.tags) {
      if(tag.key.startsWith('word:')) { const w=tag.key.slice(5), old=words[w]??emptyWord(e.t); words[w]={...old,heard:old.heard+(e.kind==='exp.said'?1:0),seen:old.seen+(e.kind==='exp.shown'?1:0),last:e.t}; }
      for(const kc of exposureKcs(tag.key,tag.as==='explain'||e.kind==='exp.modelled'&&tag.as==='demonstrate'||e.kind==='exp.shown'&&tag.as==='show')) {
        const old=kcs[kc]??emptyKc(kc,env); const learning=(tag.as==='explain'||e.kind==='exp.modelled'&&tag.as==='demonstrate') && old.exposureStepSession!==e.sid;
        const pT=tag.as==='explain'?env.cfg.bkt[old.family].pT.explained:env.cfg.bkt[old.family].pT.modelled;
        kcs[kc]={...old,exposures:old.exposures+1,firstExposed:old.firstExposed??e.t,explained:old.explained+(tag.as==='explain'?1:0),modelled:old.modelled+(e.kind==='exp.modelled'&&tag.as==='demonstrate'?1:0),pL:learning?old.pL+(1-old.pL)*pT:old.pL,exposureStepSession:learning?e.sid:old.exposureStepSession,tUpdated:learning?e.t:old.tUpdated};
      }
    }
    return {...s,asOf:e.t,lastSeq:e.seq,kcs,words};
  }
  if(e.kind==='obs.ignored') {
    const kcs={...s.kcs};
    if(e.mechanic && (e.why==='i-do'||e.why==='busy')) { const kc=`mech:${e.mechanic}` as KcId, old=kcs[kc]??emptyKc(kc,env), params=env.cfg.bkt.mech, p=old.pL, post=p*params.slip/(p*params.slip+(1-p)*(1-params.guessFloor)); kcs[kc]={...old,pL:clamp(p+.3*(post-p)),tUpdated:e.t}; }
    return {...s,asOf:e.t,lastSeq:e.seq,kcs,affect:{...s.affect,strayTapsThisSession:s.affect.strayTapsThisSession+1}};
  }
  if(e.kind==='item.end') return {...s,asOf:e.t,lastSeq:e.seq,totals:{...s.totals,items:s.totals.items+1}};
  if(e.kind==='session.end') return {...s,asOf:e.t,lastSeq:e.seq,totals:{...s.totals,activeMs:s.totals.activeMs+e.activeMs}};
  if(e.kind==='game.progress' && (e.what.kind==='unit-started'||e.what.kind==='unit-passed')) { const u=e.what.unit, old=s.units[u]??{unit:u,sessions:0}; return {...s,asOf:e.t,lastSeq:e.seq,frontier:u,units:{...s.units,[u]:{...old,started:old.started??e.t,...(e.what.kind==='unit-passed'?{passed:e.t,passedBy:e.what.by}:{})}}}; }
  if(e.kind!=='obs.attempt') return s;
  const a=e, kcs={...s.kcs}, score=a.choices!==1 && a.phase!=='i-do';
  const g=grade(a,s,env), w=weight(a,s,env), credit=shares(a,s,env,e.t);
  if(score) for(const r of a.evidence) {
    if(r.role==='context') continue;
    const old=kcs[r.kc]??emptyKc(r.kc,env), params=env.cfg.bkt[old.family];
    const p=old.pL, guess=a.choices>0?Math.max(params.guessFloor,1/a.choices):params.guessFloor;
    const slip=clamp(params.slip+(old.family==='mech'?0:env.cfg.weight.mechanicSlip*(1-pKnown(s,`mech:${a.mechanic}`,e.t,env))));
    const post=a.correct ? p*(1-slip)/(p*(1-slip)+(1-p)*guess) : p*slip/(p*slip+(1-p)*(1-guess));
    const weighted=p+w*(credit.get(r.kc)??0)*(post-p);
    const pT=a.correct && a.support.level>=2 ? 0 : params.pT[a.phase==='we-do'?'we-do':a.correct?'you-do':'corrected'];
    const updated=weighted+(1-weighted)*pT;
    let next:KcState={...old,pL:clamp(updated),tUpdated:e.t,source:'observed',firstYouDo:a.phase==='you-do'?old.firstYouDo??e.t:old.firstYouDo};
    if(r.role==='target'&&a.phase==='you-do'&&a.attemptNo===1&&a.choices>=2&&g!==null) {
      const h=old.halfLifeH, gap=old.tLastRetrieval===undefined?Infinity:(e.t-old.tLastRetrieval)/HOUR;
      let halfLifeH=h;
      if(g>=2 && old.tLastSuccess===undefined) halfLifeH=old.source==='assumed'?env.cfg.memory.assumedHalfLifeH:env.cfg.memory.initialHalfLifeH;
      else if(gap>=env.cfg.memory.minGapH && old.tLastSuccess!==undefined) { const r0=recall(s,r.kc,e.t)??1; halfLifeH=clamp(h*env.cfg.memory.factor[g]*(g?1+env.cfg.memory.lowRecallBonus*(1-r0):1),env.cfg.memory.minHalfLifeH,env.cfg.memory.maxHalfLifeH); }
      next={...next,halfLifeH,tLastRetrieval:e.t,tLastSuccess:g>=2?e.t:old.tLastSuccess,lastGrade:g,lapses:old.lapses+(g===0&&status(s,r.kc,e.t,env)==='secure'?1:0),opportunities:old.opportunities+1,independent:old.independent+(a.correct&&a.support.level<=1?1:0),recent:[...old.recent,g].slice(-env.cfg.detectors.window),sessions:old.lastSession===e.sid?old.sessions:old.sessions+1,lastSession:e.sid,fluencyMs:a.correct&&a.support.level<=1?(old.fluencyMs===undefined?a.timing.latencyMs:.7*old.fluencyMs+.3*a.timing.latencyMs):old.fluencyMs};
    }
    kcs[r.kc]=next;
  }
  const words={...s.words};
  if(a.target.word && score) { const old=words[a.target.word]??emptyWord(e.t), dir=a.activity.includes('dictation')||a.itemKind==='word-building'?'spell':'read'; words[a.target.word]={...old,last:e.t,[`${dir}Tries`]:old[`${dir}Tries`]+1,[`${dir}Ok`]:old[`${dir}Ok`]+(a.correct?1:0),firstOk:a.correct?old.firstOk??e.t:old.firstOk}; }
  const confusions={...s.confusions};
  if(score&&!a.correct&&a.confusedWith?.gpc&&a.target.spelling) { const dir=a.activity.includes('dictation')||a.itemKind==='word-building'?'spell':'read'; const got=a.confusedWith.spelling??a.confusedWith.gpc.split('>')[0]; const key=`${dir}:${a.target.spelling}>${got}`; confusions[key]=(confusions[key]??0)+1; }
  const added=score?toEvidence(a,e.t,env):[];
  const evidence=[...s.evidence,...added].filter((x, i, all) => all.slice(i+1).filter(y=>y.gpc===x.gpc&&y.direction===x.direction).length<env.cfg.evidenceCap);
  const latency={...s.latency};
  if(score&&a.phase==='you-do'&&!a.timing.early) { const old=latency[a.mechanic]; const recent=[...(old?.recent??[]),a.timing.latencyMs].slice(-20); const m=median(recent); latency[a.mechanic]={median:m,mad:median(recent.map(x=>Math.abs(x-m))),n:(old?.n??0)+1,recent}; }
  const recent=score&&a.phase==='you-do'&&a.choices>=2?[...s.affect.recent,{t:e.t,correct:a.correct,latencyMs:a.timing.latencyMs,choices:a.choices,screenPosition:'screenPosition' in a.response?a.response.screenPosition:undefined,level:a.support.level,early:a.timing.early}].slice(-env.cfg.detectors.window):s.affect.recent;
  const rapid=recent.filter(x=>x.early||x.latencyMs<env.cfg.weight.rapidMs).length/recent.length;
  const acc=recent.filter(x=>x.correct).length/recent.length;
  const chance=recent.reduce((n,x)=>n+1/x.choices,0)/recent.length;
  const guessing=recent.length>=env.cfg.detectors.window && rapid>=env.cfg.detectors.rapidShare && acc<=chance+.15?1:s.affect.guessing*.7;
  const affect={...s.affect,recent,guessing,errorsInRow:a.correct?0:s.affect.errorsInRow+1,firstTriesInRow:a.correct&&a.attemptNo===1?s.affect.firstTriesInRow+1:0};
  const foundations=foundationsForAttempt(a).reduce((f,observation)=>observeFoundation(f,observation,e.t,e.sid),s.foundations??emptyFoundations());
  return {...s,foundations,asOf:e.t,lastSeq:e.seq,kcs,words,confusions,evidence,sw:added.length?rollUp(evidence,env.cfg.mastery):s.sw,latency,affect,totals:{...s.totals,attempts:s.totals.attempts+1}};
};
export function fold(events:Iterable<GameEvent>,env:LearnerEnv,from?:LearnerState):LearnerState { const all=[...events].sort((a,b)=>a.seq-b.seq); if(!from&&!all.length) throw new Error('fold requires an initial state for an empty log'); let s=from??initial(all[0].sid.split(':s')[0],{schoolYear:'unset',band:'none',ageBand:'3'},env); for(const e of all) s=apply(s,e,env); return s; }
export const predict:LearnerApi['predict'] = (s,refs,choices,now,env) => { const target=refs.filter(r=>r.role==='target').reduce((p,r)=>p*pKnown(s,r.kc,now,env),1); const component=refs.filter(r=>r.role==='component').reduce((p,r)=>p*Math.sqrt(pKnown(s,r.kc,now,env)),1); const chance=choices>0?1/choices:.05; return chance+(1-chance)*target*component*(1-.1); };
export const status:LearnerApi['status'] = (s,kc,now,env):KcStatus => { const x=s.kcs[kc]; if(!x) return 'unseen'; if(!x.opportunities) return x.exposures?'exposed':'unseen'; const r=recall(s,kc,now); const prof=kc.startsWith('gpc:')?s.sw.gpc[kc.slice(4).replace(/:(read|spell)$/,'')]?.[kc.endsWith(':read')?'read':'spell']:undefined; if(prof?.status==='secure' && r!==null && r<env.cfg.memory.desiredRetention) return 'fading'; if(prof?.status==='secure'&&pKnown(s,kc,now,env)>=env.cfg.secure.pKnown&&x.sessions>=env.cfg.secure.minSessions) return 'secure'; if(prof?.status==='move-on'||prof?.status==='secure') return 'move-on'; return 'learning'; };
export const energy:LearnerApi['energy'] = (s,gpc) => { const x=s.kcs[`gpc:${gpc}:spell`]; return x ? x.recent.slice(-8).filter(g=>g>=2).length/8*Math.min(1,x.opportunities/8) : 0; };
export const learner:LearnerApi = { initial,apply,fold,grade,pKnown,recall,predict,status,toEvidence,canMoveOn:(s,u)=>swCanMoveOn(s.sw,u),facet:(s,u,f)=>s.sw.unit[u]?.[f]?.status??'not-started',energy };
