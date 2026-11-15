import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeErrors, rowDistance } from '../scripts/eval-errors.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/holdout-evidence.json', import.meta.url), 'utf8'));

test('errors preserve citations and rank only retained, verified, uncited material rows', () => {
  const original = fixture.evidence[0];
  const held = { ...original, evidence_id: 'held', source_key: 'held', holdout_group: 'held', run_id: '-' };
  const used = { ...held, evidence_id: 'used', source_key: 'used', holdout_group: 'used' };
  const near = { ...used, evidence_id: 'near', o2_pct: 18 };
  const far = { ...used, evidence_id: 'far', o2_pct: 50 };
  const draft = { ...used, evidence_id: 'draft', review_status: 'draft' };
  const evidence = { ...fixture, evidence: [held, used, far, near, draft],
    sources: { held: { url: 'https://ntrs.nasa.gov/citations/fixture-held' },
      used: { url: 'https://ntrs.nasa.gov/citations/fixture-used' } } };
  const query = { ...held, query_id: 'error', query_type: 'answerable', from_evidence_id: 'held',
    truth: 'burned', truth_source_key: 'held', truth_source_locator: 'fixture only' };
  const report = analyzeErrors({ evidence, queries: [query, { ...query, query_id: 'correct' }], redline(q, rows) {
    assert.deepEqual(rows.map((r) => r.evidence_id), ['used', 'far', 'near']);
    return q.query_id === 'correct' ? { label: 'BURNED', cited: ['used'] }
      : { label: 'NOT_ESTABLISHED', reason: 'NE-no-burn', cited: ['used'] };
  } });
  assert.equal(report.evaluated, 2);
  assert.equal(report.errors.length, 1);
  const error = report.errors[0];
  assert.equal(error.score, 'under-warning');
  assert.equal(error.expected, 'BURNED');
  assert.equal(error.used_rows[0].source_url, evidence.sources.used.url);
  assert.equal(error.nearest_unused_row.evidence_id, 'near');
  assert.equal(error.truth_source_url, evidence.sources.held.url);
  assert.ok(rowDistance(query, near) < rowDistance(query, far));
});

test('refusals, controls, excluded queries and empty candidate pools are explicit', () => {
  const report = analyzeErrors({ evidence: fixture, queries: [
    { query_id: 'refusal', query_type: 'absent', material_id: 'missing' },
    { query_id: 'correct', query_type: 'absent', material_id: 'missing' },
    { query_id: 'excluded', query_type: 'answerable', from_evidence_id: 'missing' },
  ], redline: (q) => q.query_id === 'correct' ? { label: 'NOT_ESTABLISHED', reason: 'NE-no-data', cited: [] }
    : { label: 'BURNED', cited: [] } });
  assert.equal(report.errors.length, 1);
  assert.equal(report.errors[0].expected, 'NE-no-data');
  assert.deepEqual(report.errors[0].used_rows, []);
  assert.equal(report.errors[0].nearest_unused_row, null);
  assert.equal(report.excluded[0].query_id, 'excluded');
});
