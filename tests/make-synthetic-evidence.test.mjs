import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEvidence } from '../src/schema/validate.js';

const script = fileURLToPath(new URL('../scripts/make-synthetic-evidence.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

test('CLI writes reproducible, schema-valid synthetic stress data', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'redline-generator-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const generate = (name, seed, rows = '1000') => {
    const out = join(dir, name, 'evidence.json');
    const result = run('--rows', rows, '--seed', seed, '--out', out);
    assert.equal(result.status, 0, result.stderr);
    const bytes = readFileSync(out, 'utf8');
    const data = JSON.parse(bytes);
    assert.deepEqual(validateEvidence(data), { ok: true, errors: [] });
    assert.equal(data.evidence.length, Number(rows));
    assert.ok(data.evidence.every(row => row.review_status === 'draft' && row.notes.includes('SYNTHETIC')));
    return bytes;
  };
  const first = generate('first', '42');
  assert.equal(first, generate('again', '42'));
  assert.notEqual(first, generate('different', '43'));
  generate('empty', '0', '0');
});

test('CLI rejects invalid arguments and data directory destinations without writing', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'redline-generator-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const out = join(dir, 'data', 'evidence.json');
  for (const args of [
    ['--rows', '-1'], ['--rows', '1.5'], ['--rows', 'NaN'],
    ['--seed', '-1'], ['--seed', '4294967296'], ['--seed'], ['--unknown'],
    ['--out', out],
  ]) {
    const result = run(...args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Error:/);
  }
  assert.equal(existsSync(out), false);
});
