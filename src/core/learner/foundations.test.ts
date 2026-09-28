import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alphabetKnowledge, emptyFoundations, foundationEstimate, letterKnowledge, observeFoundation, type FoundationObservation, type FoundationTarget } from './foundations';
import { initial, apply, fold } from './index';
import { learnerConfig } from '../config/defaults';
import { createCurriculum } from '../content/curriculum';
import { jonas } from '../test-fixtures';
const env = { curriculum: createCurriculum({ split: 'consonant-e' }), cfg: learnerConfig };
const base = () => initial('p7', { schoolYear: 'unset', band: 'none', ageBand: '4' }, env);
const obs = (target: FoundationTarget, more: Partial<FoundationObservation> = {}): FoundationObservation => ({ target, result: 'correct', source: 'adult-observed', support: 'independent', ...more });
const produce: FoundationTarget = { kind: 'letter', letter: 'a', sound: 'a', task: 'letter-to-sound' };
const recognise: FoundationTarget = { ...produce, task: 'sound-to-letter' };

test('all alphabet letters and every direction/joining aspect begin unknown; old saves have no invented evidence', () => {
  assert.equal(alphabetKnowledge().length, 26);
  for (const l of alphabetKnowledge()) { assert.equal(l.recognition.status, 'unknown'); assert.equal(l.hasSecureSoundBothWays, false); }
  const s = emptyFoundations();
  for (const x of Object.values(s.directionality)) assert.equal(foundationEstimate(x).status, 'unknown');
  for (const x of Object.values(s.joining)) for (const y of Object.values(x)) assert.equal(foundationEstimate(y).accuracy, null);
});
test('both letter directions must be established for the same sound; other sounds/cases stay separate', () => {
  let s = emptyFoundations();
  for (let i = 0; i < 6; i++) {
    s = observeFoundation(s, obs(produce), i, String(i % 2));
    s = observeFoundation(s, obs({ ...recognise, sound: 'ae' }), i, String(i % 2));
  }
  let a = letterKnowledge(s, 'a');
  assert.equal(a.hasSecureLetterToSound, true); assert.equal(a.hasSecureSoundToLetter, true); assert.equal(a.hasSecureSoundBothWays, false);
  assert.equal(letterKnowledge(s, 'A').hasSecureLetterToSound, false);
  assert.equal(a.recognition.status, 'unknown');
  for (let i = 0; i < 6; i++) s = observeFoundation(s, obs(recognise), i, String(i % 2));
  a = letterKnowledge(s, 'a'); assert.equal(a.hasSecureSoundBothWays, true);
});
test('audio playback and a correct tap cannot establish spoken letter sounds or joining production', () => {
  let s = emptyFoundations();
  for (let i = 0; i < 20; i++) {
    s = observeFoundation(s, obs(produce, { source: 'choice' }), i, String(i));
    s = observeFoundation(s, obs({ kind: 'joining', speed: 'fast', task: 'production' }, { source: 'practice' }), i, String(i));
  }
  assert.equal(s.letters.a.sounds.a?.letterToSound.attempts, 0);
  assert.equal(letterKnowledge(s, 'a').sounds.a.letterToSound.status, 'practising');
  assert.equal(s.joining.fast.production.independentAttempts, 0);
});
test('recognising a letter shape is independently assessable without inferring a sound', () => {
  const s = observeFoundation(undefined, obs({ kind: 'letter', letter: 'b', task: 'recognition' }, { source: 'choice' }), 1, 's1');
  assert.equal(letterKnowledge(s, 'b').recognition.accuracy, 1);
  assert.deepEqual(letterKnowledge(s, 'b').sounds, {});
});
test('slow/fast and recognition/production are distinct; start, order and return sweep are distinct', () => {
  let s = observeFoundation(undefined, obs({ kind: 'joining', speed: 'slow', task: 'recognition' }, { source: 'choice' }), 1, 's1');
  s = observeFoundation(s, obs({ kind: 'directionality', aspect: 'start-left' }), 2, 's1');
  assert.equal(s.joining.slow.recognition.correct, 1);
  assert.equal(s.joining.fast.recognition.attempts, 0); assert.equal(s.joining.slow.production.attempts, 0);
  assert.equal(s.directionality['track-order'].attempts, 0); assert.equal(s.directionality['return-sweep'].attempts, 0);
});
test('guided answers and single-session repetitions cannot establish secure mastery; errors lower recent accuracy', () => {
  let s = emptyFoundations();
  for (let i = 0; i < 30; i++) s = observeFoundation(s, obs(produce, { support: 'guided' }), i, String(i));
  assert.equal(letterKnowledge(s, 'a').hasSecureLetterToSound, false);
  for (let i = 0; i < 6; i++) s = observeFoundation(s, obs(produce), i, 'same-session');
  assert.equal(letterKnowledge(s, 'a').hasSecureLetterToSound, false);
  s = observeFoundation(s, obs(produce), 31, 'second-session');
  assert.equal(letterKnowledge(s, 'a').hasSecureLetterToSound, true);
  for (let i = 0; i < 4; i++) s = observeFoundation(s, obs(produce, { result: 'incorrect' }), 32 + i, 'second-session');
  assert.equal(letterKnowledge(s, 'a').hasSecureLetterToSound, false);
});
test('pure observations survive serialization, never mutate another profile, and keep bounded histories', () => {
  const a = emptyFoundations(), b = emptyFoundations();
  Object.freeze(a.letters); Object.freeze(a);
  let next = a;
  for (let i = 0; i < 50; i++) next = observeFoundation(next, obs(produce), i, String(i));
  assert.deepEqual(a, b); assert.deepEqual(JSON.parse(JSON.stringify(next)), next);
  assert.equal(next.letters.a.sounds.a?.letterToSound.recent.length, 8);
  assert.equal(next.letters.a.sounds.a?.letterToSound.successfulSessions.length, 2);
});
test('core folds explicit evidence, preserves split replay, and ignores demos/shadows', () => {
  const a = jonas({ correct: true, foundations: [obs(produce)], support: { hints: [], level: 0, helpPresses: 0, replays: 0, timed: false } });
  const events = [a, { ...a, seq: a.seq + 1, t: a.t + 1 }];
  const s = fold(events, env, base());
  assert.equal(s.foundations?.letters.a.sounds.a?.letterToSound.correct, 2);
  assert.deepEqual(s, fold(events.slice(1), env, fold(events.slice(0, 1), env, base())));
  assert.equal(apply(base(), { ...a, origin: 'shadow' }, env).foundations?.letters.a, undefined);
  assert.equal(apply(base(), { ...a, phase: 'i-do' }, env).foundations?.letters.a, undefined);
  assert.equal(apply(base(), { ...a, choices: 1 }, env).foundations?.letters.a.sounds.a?.letterToSound.attempts, 0);
  assert.equal(apply(base(), { ...a, support: { ...a.support, level: 2 } }, env).foundations?.letters.a.sounds.a?.letterToSound.independentAttempts, 0);
});
test('isolated sound-to-letter answers are evidence; whole-word answers are not per-letter production', () => {
  const event = jonas({ itemKind: 'symbol-search', activity: 'symbol-search', target: { unit: 'IC1', spelling: 'a', sound: 'a' }, correct: true,
    support: { hints: [], level: 0, helpPresses: 0, replays: 0, timed: false } });
  const s = apply(base(), event, env);
  assert.equal(s.foundations?.letters.a.sounds.a?.soundToLetter.independentCorrect, 1);
  assert.equal(s.foundations?.letters.a.sounds.a?.letterToSound.attempts, 0);
  assert.deepEqual(apply(base(), jonas({ itemKind: 'word-reading', correct: true }), env).foundations?.letters, {});
});
