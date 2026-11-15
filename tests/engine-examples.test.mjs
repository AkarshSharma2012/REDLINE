import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { buildExamples, renderExamples } from '../scripts/engine-examples.mjs';
import { labelMaterial } from '../src/rules/label.js';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('tests/fixtures/holdout-evidence.json', root), 'utf8'));

test('CLI prints exactly 12 reproducible examples and matches the checked-in document', async () => {
  const output = execFileSync(process.execPath, ['scripts/engine-examples.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal((output.match(/^## Example \d+:/gm) ?? []).length, 12);
  assert.equal(output, renderExamples(data));
  assert.equal(output, await readFile(new URL('docs/engine-examples.md', root), 'utf8'));
  assert.match(output, /https:\/\/psi\.nasa\.gov\//);
  assert.match(output, /https:\/\/ntrs\.nasa\.gov\//);
  assert.match(output, /Evidence rows used \/ cited by the engine:/);
});

test('examples use actual engine results without changing fixture records', () => {
  const before = JSON.stringify(data);
  const examples = buildExamples(data);
  assert.equal(new Set(examples.map(example => JSON.stringify(example.query))).size, 12);
  for (const example of examples) {
    assert.deepEqual(example.result, labelMaterial(example.query, example.rows.map(item => item.row)));
    assert.ok(example.rows.every(item => item.row.review_status === 'verified'));
  }
  assert.equal(JSON.stringify(data), before);
});

test('missing source or fixture row fails instead of silently fabricating evidence', () => {
  assert.throws(() => buildExamples({ ...data, evidence: [] }), /Missing worked-example fixture row/);
  assert.throws(() => renderExamples({ ...data, sources: {} }), /Missing source/);
});
