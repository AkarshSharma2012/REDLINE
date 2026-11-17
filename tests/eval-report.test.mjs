import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReport } from '../scripts/eval-report.mjs';

const row = { query_id: 'tiny', split: 'test', query_type: 'answerable', truth: 'burned',
  redline_answer: 'NOT_ESTABLISHED', redline_reason_code: 'NE-no-data', score: 'refusal',
  baseline_answer: 'BURNED', baseline_score: 'correct', evidence_kind: 'fixture',
  truth_source_key: 'NASA', truth_source_locator: 'Table 1 | row 2', material_id: 'tiny',
  holdout_group: 'NASA', gravity_g: '0', C1: 'n/a' };

test('tiny fixture: per-label denominator, refusal matrix, wrong answers and sources', () => {
  const report = renderReport([row, { ...row, query_id: 'dev-only', split: 'dev' },
    { ...row, query_id: 'excluded-only', split: 'excluded' }], { sources: { NASA: { url: 'https://ntrs.nasa.gov/citations/123' } } });
  assert.match(report, /Status: \*\*synthetic\*\*/);
  assert.match(report, /\| BURNED \| 0 \| 1 \| 0\/1 \(counts only\) \|/);
  assert.match(report, /\| BURNED \| 0 \| 0 \| 0 \| 0 \| 1 \|/);
  assert.match(report, /\| tiny \| test \| redline/);
  assert.match(report, /\| dev-only \| dev \| redline/);
  assert.doesNotMatch(report, /\| excluded-only \|/);
  assert.doesNotMatch(report, /\| tiny \| test \| baseline/);
  assert.match(report, /\[NASA\]\(<https:\/\/ntrs.nasa.gov\/citations\/123>\) Table 1 &#124; row 2/);
});

test('correct control refusal is correct and empty labels have undefined accuracy', () => {
  const report = renderReport([{ ...row, query_type: 'absent', score: 'correct-refusal',
    baseline_answer: 'NE-no-data', baseline_score: 'correct-refusal' }]);
  assert.match(report, /\| NE-no-data \| 1 \| 1 \| 1\/1 \(counts only\) \|/);
  assert.match(report, /\| NEAR \| 0 \| 0 \| n\/a \|/);
  assert.match(report, /No wrong answers/);
  assert.match(renderReport([]), /Status: \*\*not-run\*\*/);
});
