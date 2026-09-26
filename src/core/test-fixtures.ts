import type { AttemptEvent, GameEvent, Key, SaidEvent, Tag } from './types';
export const sid='p7:s3', beat='p7:s3:b2', item='p7:s3:b2:i4';
export function jonas(overrides:Partial<AttemptEvent>={}):AttemptEvent { return {
  v:1,seq:1843,t:1790000000000,sid,beat,item,kind:'obs.attempt',activity:'dictation-word',itemKind:'dictation',mechanic:'tile-to-line',phase:'you-do',step:1,attemptNo:1,
  target:{unit:'IC1',word:'mat',slot:1,sound:'a',spelling:'a',gpc:'a>a',structure:'CVC',position:'middle',answerPosition:1},
  response:{aff:'tile:3:i',value:'i',spelling:'i',sound:'i',screenPosition:3},correct:false,confusedWith:{gpc:'i>i',sound:'i'},errors:['wrong-sound-heard'],choices:4,
  timing:{shownMs:7400,askedBy:'o77',latencyMs:3000,idleMs:3000,early:false,tapsBefore:0},
  support:{hints:[{kind:'repeat-prompt',at:1789999995200,by:'help-button'},{kind:'glow',at:1789999997000,by:'help-button'}],level:2,helpPresses:2,replays:0,timed:false},
  evidence:[{kc:'gpc:a>a:spell',role:'target',position:1},{kc:'skill:segmenting:CVC',role:'component'},{kc:'mech:tile-to-line',role:'component'}],uses:['mech:tile-to-line'],...overrides
}; }
export function said(key:Key,role:Tag['as']='explain',completed=true,seq=1,t=1000,beatId=beat):SaidEvent { return {v:1,seq,t,sid,beat:beatId,kind:'exp.said',out:`o${seq}`,completed,heardMs:completed?1000:300,utt:{who:'sensei',purpose:'explanation',parts:[{line:'words_made'}],text:'Words are made of sounds. Listen!',tags:[{key,as:role}],needs:[],lines:['words_made'],estMs:1000,interruptible:false}}; }
export function start(seq=1,session=sid,t=1000):GameEvent {return {v:1,seq,t,sid:session,kind:'session.start',profile:'p7',build:{app:'test',content:'test',params:'test'},seed:'test',device:{kind:'headless',touch:false,w:800,h:600},player:'headless:test',gapH:null,localHour:9,ageBand:'4'};}
export function beatStart(seq=1,beatId=beat,t=1000):GameEvent {return {v:1,seq,t,sid,beat:beatId,kind:'beat.start',beatId,beatKind:'activity',chapter:'c',episode:'e',template:'t',requires:[],introduces:[],why:[],challenge:{ } as never};}
