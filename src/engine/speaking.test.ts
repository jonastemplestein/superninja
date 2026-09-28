import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { LINES } from '../content/lines';
import { speakAlongStep, speakAlong, resetSpeakAlong } from './speaking';
test('speaking reminders use recorded lines, recur every third interaction, and allow time to respond', () => {
  for (const context of ['sound', 'word', 'slow'] as const) {
    const steps = Array.from({ length: 7 }, (_, count) => speakAlongStep(count, context));
    assert.deepEqual(steps.map(s => !!s.say.length), [true, false, false, true, false, false, true]);
    for (const part of steps[0].say) if ('line' in part) {
      assert.ok(LINES.some(l => l.id === part.line));
      assert.ok(existsSync(`public/a/l/${part.line}.mp3`));
    }
    assert.deepEqual(steps[0].say.at(-1), { gap: 1200 });
  }
});
test('a new level resets reminders for each context', () => {
  resetSpeakAlong(); assert.ok(speakAlong('sound').length); assert.equal(speakAlong('sound').length, 0);
  assert.ok(speakAlong('word').length); resetSpeakAlong(); assert.ok(speakAlong('sound').length);
});
