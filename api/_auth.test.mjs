import assert from 'node:assert/strict';
import test from 'node:test';
import { sign, verify } from './_auth.js';

test('signed tokens verify until they expire', () => {
  const token = sign({ email: 'person@example.com', exp: Math.floor(Date.now() / 1000) + 60 }, 'test-secret');
  assert.equal(verify(token, 'test-secret').email, 'person@example.com');
  assert.equal(verify(token, 'different-secret'), null);
  assert.equal(verify('not-a-token', 'test-secret'), null);
});
