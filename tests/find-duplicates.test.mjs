import test from 'node:test';
import assert from 'node:assert/strict';
import { findDuplicates, renderDuplicatesReport } from '../scripts/find-duplicates.mjs';

// Synthetic S1 rows; these are software fixtures, not experimental findings.
const row = (evidence_id, extra = {}) => ({ evidence_id, material_id: 'pmma',
  material: 'PMMA, cast black', form: 'rod', thickness_mm: 6.4, width_mm: null,
  o2_pct: 21, pressure_kpa: 101.3, gravity_g: 0, flow_speed_cm_s: 2,
  flow_direction: 'opposed', external_heat_flux_kw_m2: 0, facility: 'ISS',
  endpoint: 'burn/no-burn', outcome: 'spread', value: null, value_unit: null,
  limit_approach: 'fixed', pass_criterion: null, test_duration_s: null,
  review_status: 'verified', source_key: 'NASA', source_locator: 'fixture only', ...extra });
const data = (...evidence) => ({ evidence, sources: { NASA: {
  url: 'https://ntrs.nasa.gov/citations/20210011385', title: 'Synthetic fixture citation' } } });

test('exact duplicates and conflicts are distinct; input is unchanged', () => {
  const input = data(row('a'), row('b'), row('c', { outcome: 'no-spread' }));
  const before = structuredClone(input);
  const result = findDuplicates(input);
  assert.deepEqual(result.pairs.map(p => p.kind), ['duplicate', 'conflict', 'conflict']);
  assert.ok(result.pairs.every(p => p.match === 'exact'));
  assert.deepEqual(input, before);
});
test('near thresholds are inclusive and differences are reported', () => {
  const result = findDuplicates(data(row('a'), row('b', { o2_pct: 21.1 })));
  assert.equal(result.pairs[0].match, 'near');
  assert.deepEqual(result.pairs[0].differences, ['o2_pct']);
  assert.equal(findDuplicates(data(row('a'), row('b', { o2_pct: 21.101 }))).pairs.length, 0);
});
test('different material grades, directions, gravity, endpoints and criteria do not match', () => {
  for (const extra of [{ material: 'PMMA, clear' }, { material_id: 'etfe' },
    { flow_direction: 'concurrent' }, { gravity_g: 1 }, { endpoint: 'LOC-FS' },
    { pass_criterion: '100 mm' }, { external_heat_flux_kw_m2: 10 }]) {
    assert.equal(findDuplicates(data(row('a'), row('b', extra))).pairs.length, 0);
  }
});
test('missing conditions and absent results are excluded, never coerced to zero', () => {
  for (const extra of [{ o2_pct: null }, { flow_speed_cm_s: '' },
    { pressure_kpa: undefined }, { gravity_g: NaN }, { outcome: null }]) {
    const result = findDuplicates(data(row('a', extra), row('b', extra)));
    assert.equal(result.pairs.length, 0);
    assert.equal(result.excluded.length, 2);
  }
  assert.equal(findDuplicates(data(row('a', { flow_speed_cm_s: 0 }),
    row('b', { flow_speed_cm_s: 0 }))).pairs.length, 1);
});
test('numeric endpoints compare units and values rather than two null outcomes', () => {
  const numeric = { endpoint: 'LOC-FS', outcome: null, value: 18, value_unit: '% O2' };
  assert.equal(findDuplicates(data(row('a', numeric), row('b', { ...numeric, value: 19 }))).pairs[0].kind, 'conflict');
  assert.equal(findDuplicates(data(row('a', numeric), row('b', { ...numeric, value_unit: 'kPa O2' }))).pairs.length, 0);
});
test('normalization, ordering, citations and incomplete-context warnings are deterministic', () => {
  const input = data(row('b', { material: ' PMMA,  CAST black ' }), row('a'));
  assert.deepEqual(findDuplicates(input), findDuplicates({ ...input, evidence: [...input.evidence].reverse() }));
  const report = renderDuplicatesReport(input);
  assert.match(report, /https:\/\/ntrs.nasa.gov/);
  assert.match(report, /fixture only/);
  assert.match(report, /test_duration_s/);
  assert.throws(() => renderDuplicatesReport({ ...input, sources: {} }), /source/i);
  assert.throws(() => findDuplicates(data(row('a'), row('a'))), /evidence_id/);
});
