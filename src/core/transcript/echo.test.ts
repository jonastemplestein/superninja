/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { echoes, shapeOf } from './echo';
import { said } from '../test-fixtures';
import type { GameEvent, UttPart } from '../types';
const utter = (seq: number, t: number, parts: UttPart[], beat = 'p7:s3:b2'): GameEvent => {
  const e = said('idea:two-letters-one-sound', 'remind', true, seq, t, beat);
  return { ...e, utt: { ...e.utt, parts, lines: parts.flatMap(p => ('line' in p ? [p.line] : [])), text: parts.map(p => ('line' in p ? p.line : '·')).join(' ') } } as GameEvent;
};
test('echo: "/ae/ two letters · /ae/ two letters" in one beat is one shape said twice', () => {
  const a: UttPart[] = [{ sound: 'ae' }, { gap: 200 }, { line: 't_two_letters' }];
  assert.equal(shapeOf(a), '/·/ · t_two_letters');
  const f = echoes([utter(1, 1000, a), utter(2, 6000, [{ sound: 'ae' }, { line: 't_two_letters' }])]);
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, 'echo');
  assert.equal(f[0].where?.seq, 2);
});
test('echo: not across beats, not after 30 s, not for an allowed routine or a bare word', () => {
  const a: UttPart[] = [{ sound: 'ae' }, { line: 't_two_letters' }];
  assert.equal(echoes([utter(1, 1000, a), utter(2, 2000, a, 'p7:s3:b3')]).length, 0);
  assert.equal(echoes([utter(1, 1000, a), utter(2, 40_000, a)]).length, 0);
  const r: UttPart[] = [{ line: 'say_sounds_read' }, { sounds: [] }];
  assert.equal(echoes([utter(1, 1000, r), utter(2, 3000, r)], { allow: new Set(['say_sounds_read']) }).length, 0);
  assert.equal(echoes([utter(1, 1000, [{ word: 'mat' }]), utter(2, 3000, [{ word: 'sat' }])]).length, 0);
});
