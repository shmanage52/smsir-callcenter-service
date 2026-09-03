import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIranianMobile, operatorMessage } from '../src/domain.js';

test('normalizes supported Iranian mobile forms', () => {
  assert.equal(normalizeIranianMobile('09121234567'), '09121234567');
  assert.equal(normalizeIranianMobile('+989121234567'), '09121234567');
  assert.equal(normalizeIranianMobile('9121234567'), null);
});
test('returns an actionable message for required provider failures', () => {
  assert.match(operatorMessage(102), /اعتبار/);
  assert.match(operatorMessage(113), /قالب/);
  assert.match(operatorMessage(115), /فهرست/);
});
