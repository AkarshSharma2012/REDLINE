import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { lintCsv, renderReport } from '../scripts/lint-csv.mjs';
import { toCsv } from '../src/schema/csv.js';

const columns = ['evidence_id', 'material_id', 'source_locator', 'endpoint', 'value', 'value_unit', 'thickness_mm', 'notes', 'condition_source_url', 'condition_source_locator'];
const good = { evidence_id: 'E1', material_id: 'pmma', source_locator: 'Table 1', endpoint: 'spread-rate', value: '1e-2', value_unit: 'mm/s', thickness_mm: '0.1', notes: 'Quoted, text\nwith "quotes" and café, µm, °C' };
const csv = (...rows) => toCsv(columns, rows);
const codes = text => lintCsv(text).errors.map(e => e.code);

test('clean quoted multiline UTF-8 fixture and CRLF/BOM pass', () => {
  for (const text of [csv(good), '\uFEFF' + csv(good).replaceAll('\n', '\r\n')]) assert.deepEqual(codes(text), []);
});
test('detects each requested hygiene error without editing input', () => {
  const text = csv(good, { ...good, material_id: 'PMMA', source_locator: ' ', thickness_mm: '1 cm', notes: 'broken \u00C3\u00A9 ' });
  const found = codes(text);
  for (const code of ['trailing-space', 'mojibake', 'mixed-units', 'material-case', 'blank-locator', 'duplicate-id']) assert.ok(found.includes(code), code);
});
test('units are compared per endpoint, not globally or within source prose', () => {
  assert.deepEqual(codes(csv(good, { ...good, evidence_id: 'E2', endpoint: 'LOC-FS', value_unit: '% O2' })), []);
  assert.ok(codes(csv(good, { ...good, evidence_id: 'E2', value_unit: 'cm/s' })).includes('mixed-units'));
  assert.ok(codes(csv({ ...good, value_unit: 'm/s' })).includes('mixed-units'));
  assert.ok(codes(csv({ ...good, value_unit: '' })).includes('mixed-units'));
});
test('secondary locator required only when its source is populated', () => {
  assert.ok(codes(csv({ ...good, condition_source_url: 'https://nasa.gov/example' })).includes('blank-locator'));
  assert.deepEqual(codes(csv({ ...good, condition_source_url: 'https://nasa.gov/example', condition_source_locator: 'p. 2' })), []);
});
test('malformed, empty, missing-column and header-only input fail closed', () => {
  for (const text of ['', 'evidence_id\n', 'evidence_id\nE1', 'a,b\n1', 'a\n"unterminated']) assert.ok(lintCsv(text).errors.length);
});
test('report escapes table cells and uses data record numbers', () => {
  const result = lintCsv(csv(good, { ...good, evidence_id: 'E|2', value_unit: 'x|y' }));
  assert.ok(result.errors.every(e => e.row === 2));
  assert.match(renderReport(result), /x\\\|y/);
});
test('CLI writes reports and exits nonzero for lint, parse and read failures', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-lint-'));
  try {
    const input = join(dir, 'fixture.csv');
    const report = join(dir, 'report.md');
    for (const [text, status] of [[csv(good), 0], [csv({ ...good, source_locator: '' }), 1], ['a,b\n1', 1]]) {
      await writeFile(input, text);
      const run = spawnSync(process.execPath, ['scripts/lint-csv.mjs', input, report], { encoding: 'utf8' });
      assert.equal(run.status, status, run.stderr);
      assert.match(await readFile(report, 'utf8'), /CSV lint report/);
    }
    await rm(input);
    assert.equal(spawnSync(process.execPath, ['scripts/lint-csv.mjs', input, report]).status, 1);
    assert.match(await readFile(report, 'utf8'), /read-error/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
