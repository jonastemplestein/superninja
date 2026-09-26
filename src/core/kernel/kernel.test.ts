/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng } from './rng';
import { sessionId, beatId, itemId, outId } from './ids';
import { ageBandFor, expectedUnit, hours } from './time';
import type { ProfileState } from '../types';
test('kernel RNG repeats by seed and forks without consuming the parent stream',()=>{const a=rng('s1'),b=rng('s1');assert.deepEqual([a.next(),a.int(10),a.pick(['x','y']),a.shuffle([1,2,3])],[b.next(),b.int(10),b.pick(['x','y']),b.shuffle([1,2,3])]);assert.deepEqual(rng('s1').fork('words').shuffle([1,2,3]),rng('s1').fork('words').shuffle([1,2,3]));assert.notEqual(rng('s1').fork('words').next(),rng('s1').fork('praise').next());});
test('kernel ids are explicit and stable',()=>{const s=sessionId('p7',3),b=beatId(s,2);assert.equal(s,'p7:s3');assert.equal(b,'p7:s3:b2');assert.equal(itemId(b,4),'p7:s3:b2:i4');assert.equal(outId(88),'o88');});
test('kernel age moves up on 1 September and explicit age wins',()=>{const t=Date.UTC(2026,8,2);const profile={schoolYear:'R',schoolYearAt:t,age:undefined} as ProfileState;assert.equal(ageBandFor(profile,t),'4');assert.equal(ageBandFor(profile,Date.UTC(2027,8,1)),'5');assert.equal(ageBandFor({...profile,age:{years:6,at:t}},t),'6');assert.equal(hours(0,3600000),1);});
test('kernel school tracks follow the FIRST_MINUTES term table',()=>{assert.equal(expectedUnit('R',Date.UTC(2026,2,1)),'IC5');assert.equal(expectedUnit('R',Date.UTC(2026,8,1)),'IC1');assert.equal(expectedUnit('Y1',Date.UTC(2026,4,1)),'EC18');assert.equal(expectedUnit('Y2',Date.UTC(2026,0,1)),'EC34');assert.equal(expectedUnit('none',Date.UTC(2026,2,1)),undefined);});
