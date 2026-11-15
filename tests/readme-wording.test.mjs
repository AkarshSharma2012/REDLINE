import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('public README avoids prohibited absence and unsupported risk claims', () => {
  assert.doesNotMatch(readme, /never tested|never burns|close to the burn limit/i);
  assert.doesNotMatch(readme, /hospitals|30% oxygen|become a fire risk|cap the oxygen|upcoming Moon fire tests/i);
  assert.match(readme, /not found in the sources reviewed/);
  assert.match(readme, /close to a measured limit/);
});

test('public README qualifies oxygen exploration and verified evidence', () => {
  assert.match(readme, /https:\/\/psi\.nasa\.gov\//);
  assert.match(readme, /only verified evidence rows/);
  assert.match(readme, /no verified evidence is loaded/);
  assert.match(readme, /subject to comparability checks/);
  assert.match(readme, /not a physical fire-risk score/);
  assert.match(readme, /does not establish an oxygen operating limit, certify a material/);
});
