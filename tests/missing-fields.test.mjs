import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { IMPORTANT_FIELDS, auditMissingFields, renderMissingFields } from '../scripts/missing-fields.mjs';

// Synthetic S1-shaped rows inline: this task does not own tests/fixtures/.
const complete = { evidence_id: 'a', source_key: 'NASA', uncertainty: 'not stated', source_locator: 'p. 1', pressure_kpa: 0, flow_speed_cm_s: 0, flow_direction: 'opposed', endpoint: 'LOC-FS' };
const fixture = () => ({ sources: { NASA: { url: 'https://ntrs.nasa.gov/citations/20130010991' } }, evidence: [
  { ...complete },
  { ...complete, evidence_id: 'b', uncertainty: null, source_locator: '  ', pressure_kpa: '', flow_speed_cm_s: undefined, flow_direction: '\t', endpoint: null },
  { ...complete, evidence_id: 'c', source_key: 'other', endpoint: undefined },
] });

test('audits every row, distinguishes blanks from zero, summarizes per source without mutation', () => {
  const data = fixture();
  const before = structuredClone(data);
  const result = auditMissingFields(data);
  assert.deepEqual(result.rows.map((r) => r.missing), [[], [...IMPORTANT_FIELDS], ['endpoint']]);
  assert.deepEqual(result.sources[0], { source_key: 'NASA', total: 2, incomplete: 1, missing: Object.fromEntries(IMPORTANT_FIELDS.map((f) => [f, 1])) });
  assert.equal(result.sources[1].missing.endpoint, 1);
  assert.deepEqual(data, before);
  assert.deepEqual(auditMissingFields({ evidence: [{}] }).rows[0].missing, [...IMPORTANT_FIELDS]);
  assert.equal(auditMissingFields({ evidence: [{}] }).sources[0].source_key, '(missing source_key)');
});

test('renders linked provenance, missing provenance, complete rows and escaped table text', () => {
  const data = fixture();
  data.evidence[0].evidence_id = 'a|b\nc';
  const report = renderMissingFields(data);
  assert.match(report, /a&#124;b c/);
  assert.match(report, /https:\/\/ntrs.nasa.gov\/citations\/20130010991/);
  assert.match(report, /other \(source URL missing or invalid\)/);
  assert.match(report, /\| p\. 1 \| None \|/);
  assert.match(report, /\(blank\)/);
  assert.equal(renderMissingFields(data), report);
  data.sources.NASA.url = 'javascript:alert(1)';
  assert.doesNotMatch(renderMissingFields(data), /javascript:/);
  assert.match(renderMissingFields({ evidence: [] }), /Rows: \*\*0\*\*/);
  assert.throws(() => auditMissingFields({}), /evidence array/);
  assert.throws(() => auditMissingFields({ evidence: [null] }), /row object/);
});

test('CLI writes deterministic report and reports malformed input with nonzero exit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-missing-'));
  const script = fileURLToPath(new URL('../scripts/missing-fields.mjs', import.meta.url));
  try {
    const input = join(dir, 'input.json');
    const output = join(dir, 'report.md');
    const data = fixture();
    await writeFile(input, JSON.stringify(data));
    execFileSync(process.execPath, [script, input, output], { cwd: dir });
    assert.equal(await readFile(output, 'utf8'), renderMissingFields(data));
    await writeFile(input, '{');
    const failed = spawnSync(process.execPath, [script, input, output], { encoding: 'utf8' });
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /Missing-field audit failed:/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('college student: checked-in report matches current evidence across checkout line endings', async () => {
  const data = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
  assert.equal((await readFile(new URL('../docs/missing-fields.md', import.meta.url), 'utf8')).replace(/\r\n/g, '\n'), renderMissingFields(data).replace(/\r\n/g, '\n'));
});
