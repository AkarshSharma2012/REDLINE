import test from 'node:test';
import assert from 'node:assert/strict';
import { benchmark, syntheticData, exceedsBudget, formatReport } from '../scripts/bench-retrieve.mjs';

test('retrieval benchmark smoke uses small synthetic datasets', () => {
  const results = benchmark([5, 20]);
  assert.deepEqual(results.map(r => r.rows), [5, 20]);
  for (const result of results) {
    assert.ok(Number.isFinite(result.elapsedMs) && result.elapsedMs >= 0);
    assert.equal(result.hits, Math.min(result.rows, 8));
  }
  const report = formatReport(results);
  assert.match(report, /Rows\s+Time \(ms\)\s+Hits/);
  assert.match(report, /20\s+\d+\.\d{2}\s+8/);
});

test('synthetic rows have unique deterministic identities', () => {
  const data = syntheticData(12);
  assert.deepEqual(data, syntheticData(12));
  assert.equal(new Set(data.evidence.evidence.map(r => r.evidence_id)).size, 12);
  assert.throws(() => syntheticData(0), RangeError);
});

test('only a 10k measurement strictly over 200 ms fails', () => {
  assert.equal(exceedsBudget([{ rows: 10_000, elapsedMs: 200 }]), false);
  const slow = [{ rows: 10_000, elapsedMs: 200.01 }];
  assert.equal(exceedsBudget(slow), true);
  assert.match(formatReport(slow), /FAIL/);
  assert.equal(exceedsBudget([{ rows: 50_000, elapsedMs: 900 }]), false);
});
