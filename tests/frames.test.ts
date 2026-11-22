import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameForProgress, nearestLoaded } from '../src/lib/frames.ts';

test('frameForProgress leva o progresso do scroll ao quadro 1..40', () => {
  assert.equal(frameForProgress(0), 1);
  assert.equal(frameForProgress(1), 40);
  assert.equal(frameForProgress(0.5), 21);
  assert.equal(frameForProgress(-1), 1);
  assert.equal(frameForProgress(2), 40);
});

test('nearestLoaded devolve o quadro carregado mais próximo', () => {
  assert.equal(nearestLoaded(10, new Set([1, 9, 12])), 9);
  assert.equal(nearestLoaded(10, new Set([8, 12])), 8);
  assert.equal(nearestLoaded(5, new Set()), 1);
  assert.equal(nearestLoaded(7, new Set([7])), 7);
});
