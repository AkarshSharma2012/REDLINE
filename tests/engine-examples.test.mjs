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
  assert.equal(output, (await readFile(new URL('docs/engine-examples.md', root), 'utf8')).replace(/\r\n/g, '\n'));
  assert.match(output, /https:\/\/psi\.nasa\.gov\//);
  assert.match(output, /https:\/\/ntrs\.nasa\.gov\//);
  assert.match(output, /Evidence rows used \/ cited by the engine:/);
  assert.doesNotMatch(output, /\bsafe\b|never burns|never tested|stub/i);
  console.log(output);
});

test('real engine returns rule diagnostics and only cites candidate rows', () => {
  for (const example of buildExamples(data)) {
    assert.ok(example.rows.length > 0, `example ${example.number} has candidate rows`);
    assert.ok(example.rows.every(item => item.comparison.rules.length > 0));
    const ids = new Set(example.rows.map(item => item.row.evidence_id));
    assert.ok(example.result.cited.every(id => ids.has(id)));
    assert.equal(typeof example.result.wording, 'string');
    const synthetic = /^SYNTHETIC query:/.test(example.title);
    const changed = Object.keys(example.query).some(key => example.query[key] !== (example.seed[key] ?? null));
    assert.equal(synthetic, changed, `example ${example.number} synthetic labeling`);
  }
});

test('lunar example is an estimate bounded by separate 0 g and 1 g results', () => {
  const lunar = buildExamples(data).find(example => example.query.gravity_g === 0.16);
  assert.ok(lunar.result.estimate);
  assert.match(lunar.result.wording, /^Estimate between 0 g and 1 g results:/);
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
