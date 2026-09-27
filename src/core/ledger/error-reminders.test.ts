/// <reference types="node" />
// SCRIPT_FIXES Part E: "two letters, one sound" is told at its teach moment and in the next two sessions, then only on
// an error that splits a two-letter spelling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initial, apply, owed, readiness, errorReminderDue } from './index';
import { said, start, sid } from '../test-fixtures';
import { notions } from '../content/notions';
import type { Key, NotionRegistry } from '../types';
const key: Key = 'idea:two-letters-one-sound';
/** the idea alone (its dependency, term:spelling, is another test's business) */
const reg: NotionRegistry = { ...notions, [key]: { ...notions[key], dependsOn: [] } };
test('Part E: the idea has its own dosage: three full tellings a session apart, then reminders only on errors', () => {
  const d = notions[key].dosage;
  assert.deepEqual({ full: d.full, minSessions: d.minSessions, reminders: d.reminders, retireAfter: d.retireAfter, maxPerSession: d.maxPerSession }, { full: 3, minSessions: 3, reminders: 'error', retireAfter: 6, maxPerSession: 2 });
  assert.deepEqual(d.spacing, [{ after: 'sessions', n: 1 }, { after: 'sessions', n: 1 }]);
  assert.deepEqual(notions[key].remindOn, ['split-spelling']);
});
test('Part E: after the full tellings the schedule owes nothing; a split-spelling error brings a reminder', () => {
  let l = initial();
  l = apply(l, said(key, 'explain', true, 1, 1000, `${sid}:b1`));
  assert.equal(errorReminderDue(l, key, ['split-spelling'], reg), false, 'not before the full tellings');
  l = apply(l, start(2, 'p7:s4', 2000));
  l = apply(l, { ...said(key, 'explain', true, 3, 2100, 'p7:s4:b1'), sid: 'p7:s4' });
  l = apply(l, start(4, 'p7:s5', 3000));
  l = apply(l, { ...said(key, 'explain', true, 5, 3100, 'p7:s5:b1'), sid: 'p7:s5' });
  l = apply(l, start(6, 'p7:s6', 4000));
  const r = readiness(l, key, 4000, reg) as { ready: boolean; reminderDue: boolean; fullDue: boolean };
  assert.equal(r.ready, true);
  assert.equal(r.fullDue, false);
  assert.equal(r.reminderDue, false, 'no scheduled reminder');
  assert.deepEqual(owed(l, [key], 4000, reg), []);
  assert.equal(errorReminderDue(l, key, ['split-spelling'], reg), true);
  assert.equal(errorReminderDue(l, key, ['wrong-spelling'], reg), false, 'another error is about listening');
  assert.equal(errorReminderDue(l, 'idea:first-sound', ['split-spelling'], reg), false, 'a notion with scheduled reminders');
});
