import { MASTERY_CONFIG } from '../../content/sw';
import type { CoreConfig, KcFamily, LearnerConfig, BktParams } from '../types';
const bkt = (pL0: number, slip: number, guessFloor: number, steps: [number, number, number, number, number]): BktParams => ({ pL0, slip, guessFloor, pT: { exposure: 0, 'you-do': steps[0], 'we-do': steps[1], corrected: steps[2], explained: steps[3], modelled: steps[4] } });
export const learnerConfig: LearnerConfig = {
  mastery: MASTERY_CONFIG,
  bkt: {
    'gpc-read': bkt(.1,.1,.05,[.1,.06,.08,.02,.03]), 'gpc-spell': bkt(.1,.1,.05,[.1,.06,.08,.02,.03]),
    skill: bkt(.2,.1,.05,[.08,.05,.06,.02,.03]), pa: bkt(.3,.1,.1,[.12,.08,.08,.03,.04]),
    sound: bkt(.3,.1,.1,[.12,.08,.08,.03,.04]), word: bkt(.15,.1,.05,[.1,.06,.08,0,.03]),
    special: bkt(.1,.1,.05,[.15,.1,.1,.05,.05]), concept: bkt(.1,.1,.1,[.08,.05,.06,.04,.04]),
    mech: bkt(.3,.05,.1,[.3,.2,.2,.05,.25]),
  } satisfies Record<KcFamily, BktParams>,
  weight: { phase: { 'i-do': 0, 'we-do': .2, 'you-do': 1 }, helpedCorrect: [1,.6,.25,0], retryCorrect: .3, retryWrong: .6, rapidMs: 800, rapidFactor: .5, guessingFactor: .3, mechanicSlip: .2, eliminationFactor: .5 },
  blame: { targetShareWhenLocated: .8, componentCreditOnCorrect: .3 },
  memory: { initialHalfLifeH: 24, minHalfLifeH: 1, maxHalfLifeH: 4320, factor: { 0:.5, 1:1.2, 2:1.8, 3:2.5 }, lowRecallBonus: 1, minGapH: 4, rFloor: .5, assumedHalfLifeH: 720, desiredRetention: .8 },
  grade: { slowMads: 2 }, secure: { pKnown: .8, minSessions: 2 },
  detectors: { window: 10, rapidShare: .5, positionShare: .8, frustrationErrors: 3, boredomFirstTry: .95 },
  evidenceCap: 30, confusionDecayPerSession: .8, priors: { wellBefore: .6, upToExpected: .4, placed: .6 },
};
const limits = (talkBeforeActionMs:number,maxSpeechRunMs:number,itemsPerBeat:number,beatMs:number,sessionMs:number,newNotionsPerBeat:number,remindersPerBeat:number,rewardEveryMs:number,maxTalkShare:number,instructionSteps:number) => ({talkBeforeActionMs,maxSpeechRunMs,itemsPerBeat,beatMs,sessionMs,newNotionsPerBeat,remindersPerBeat,rewardEveryMs,maxTalkShare,instructionSteps});
const commonSupport = {sayItWithMeMs:900,idle:[{afterMs:8000,glow:true,reask:true},{afterMs:16000,paw:'point' as const}],corrections:['listen-again','reduce-and-model'] as ['listen-again','reduce-and-model'],help:['repeat-prompt' as const,'glow' as const,'model' as const],eagerAnswers:true,namePictures:true};
export const defaultConfig: CoreConfig = {
  app:'superninja',learner:learnerConfig,
  planner:{targetSuccess:{teach:[.6,.8],review:[.8,.92]},glowAssisted:.9,newKeysPerBlock:{'3':2,'4':3,'5':4,'6':4,'7+':4},choices:{first:2,maxInitialCode:4,max:6},release:{first:[1,2],second:[1,1],later:[0,1]},lags:{review:1,readingInText:1,dictation:2},itemsPerBlock:{'3':6,'4':8,'5':10,'6':12,'7+':14},sessionMin:{'3':10,'4':12,'5':15,'6':20,'7+':25},reviewShare:[.25,.5],keepPaceAfterSessions:8,remediateAfterSessions:4},
  director:{limits:{'3':limits(12000,8000,6,150000,600000,1,1,45000,.45,1),'4':limits(15000,8000,8,240000,720000,1,2,60000,.45,2),'5':limits(18000,12000,10,300000,900000,2,2,75000,.5,2),'6':limits(20000,12000,12,360000,1200000,2,2,90000,.5,2),'7+':limits(25000,15000,14,420000,1500000,3,2,120000,.55,3)},bands:{teach:{tooHardBelow:.5,flow:[.6,.8]},review:{tooHardBelow:.7,flow:[.8,.92]}},recapAfterDays:3,baronEveryBeats:[4,7],maxSameMechanicRun:3,maxAdjustments:2},
  support:{default:{...commonSupport,phaseLines:true,wedoGlowMs:[0,2000],echoWrong:false,earlyTap:'wiggle',requeueMissed:true,praiseEvery:1},'warm-up':{...commonSupport,phaseLines:false,wedoGlowMs:[2000],idle:[{afterMs:8000,glow:true,reask:true},{afterMs:16000,paw:'tap'}],echoWrong:true,earlyTap:'echo',requeueMissed:false,praiseEvery:3}},
  cueMs:{},debugAnswers:false,coreMachines:[],recentSessions:10,
};
