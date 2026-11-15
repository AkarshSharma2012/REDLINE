import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRow } from '../src/rules/compare.js';
import { labelMaterial, labelCabin } from '../src/rules/label.js';

// Inline S1 §4 fixture: test-only verification, never a live-data approval.
// S4 §7.1 publications remain separate source keys; review D2's NASA-source
// conflict is not resolved by silently substituting a different publication.
const sources = {
  Link2018: { title: 'The Effect of Gravity on Flame Spread over PMMA Cylinders',
    authors: 'Link et al.', year: 2018, url: 'https://www.nature.com/articles/s41598-017-18398-4' },
  Osorio2014: { title: 'Effect of Environmental Variables on the Flammability of Fire Resistant Materials',
    authors: 'Osorio', year: 2014, url: 'https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf' },
  Zhao2015: { title: 'Concurrent flame growth, spread and extinction over composite fabric samples',
    authors: 'Zhao et al.', year: 2015, url: 'https://ntrs.nasa.gov/citations/20150008962' },
  PSI25: { title: 'NASA PSI BASS-II', authors: 'NASA', year: 2021,
    url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25' },
};
const materials = [
  { material_id: 'pmma', display_name: 'PMMA (acrylic)', aliases: ['acrylic'] },
  { material_id: 'etfe', display_name: 'ETFE', aliases: [] },
  { material_id: 'sibal', display_name: 'SIBAL (cotton/fiberglass)', aliases: [] },
  { material_id: 'nomex', display_name: 'Nomex', aliases: [] },
];
const common = { material_id: 'pmma', material: 'PMMA, cast black', form: 'rod',
  thickness_mm: null, width_mm: null, flow_speed_cm_s: null, flow_direction: 'opposed',
  o2_pct: 17, pressure_kpa: null, gravity_g: 0, facility: 'ISS', endpoint: 'burn/no-burn',
  value: null, value_unit: null, outcome: 'spread', uncertainty: '±0.3',
  external_heat_flux_kw_m2: 0, limit_approach: 'lower-flow', pass_criterion: null,
  test_duration_s: null, review_status: 'verified', verified_by: 'fixture-only', notes: '' };
const make = (evidence_id, source_key, source_locator, patch) => ({
  ...common, evidence_id, run_id: evidence_id, source_key, source_locator,
  holdout_group: source_key, ...patch,
});
const rows = [
  make('LINK2018-UG-B19', 'Link2018', 'Results, Figs. 4, 6a, 7 (B19)', { thickness_mm: 6.4, o2_pct: 17.5 }),
  make('LINK2018-UG-17', 'Link2018', 'Results, Fig. 8 discussion; Abstract', {}),
  make('LINK2018-1G-18', 'Link2018', 'Results, Fig. 8 discussion', {
    o2_pct: 18, gravity_g: 1, facility: 'ground', outcome: 'no-spread',
    uncertainty: 'not stated', limit_approach: 'raise-flow',
    notes: 'Fig. 6 caption reports <18.5% for a 1.27 cm rod; conflict retained, not reconciled.' }),
  ...[
    ['1G', 1, 'ground', 31.5, 'flame spread > 100 mm', 'pp. 74, 79, 84'],
    ['UG', 0, 'aircraft', 26, 'flame still present at end of µg period', 'pp. 84, 100'],
  ].map(([suffix, gravity_g, facility, value, pass_criterion, locator]) =>
    make('OSORIO2014-ETFE-' + suffix, 'Osorio2014', locator, {
      material_id: 'etfe', material: 'ETFE insulation on copper', form: 'wire',
      thickness_mm: 0.30, flow_speed_cm_s: 12, o2_pct: value, pressure_kpa: 100,
      gravity_g, facility, endpoint: 'LOC-FS', value, value_unit: '% O2', outcome: null,
      uncertainty: 'O2 drift < 1.0% of set value', limit_approach: null, pass_criterion })),
  make('ZHAO2015-SIBAL-T4', 'Zhao2015', 'pp. 2, 3, 5, p. 9 appendix; GMT45-T4', {
    material_id: 'sibal', material: 'SIBAL, 75% cotton / 25% fiberglass', form: 'fabric',
    thickness_mm: 0.32, width_mm: 22, flow_speed_cm_s: 2.2, flow_direction: 'concurrent',
    o2_pct: 18.7, pressure_kpa: 101.3, endpoint: 'quench-limit', value: 2.2,
    value_unit: 'cm/s', outcome: 'quenched', uncertainty: 'not stated', limit_approach: null }),
  ...['PSI25-B10', 'PSI25-B14'].map(id => make(id, 'PSI25', 'Table A.1, pp. 103–104', {
    form: 'sheet', thickness_mm: 0.2, width_mm: 10, o2_pct: null, pressure_kpa: null,
    endpoint: null, outcome: id === 'PSI25-B14' ? 'no-ignition' : null,
    uncertainty: 'not stated', review_status: 'draft', verified_by: null })),
];
const evidence = { schema_version: '1.0.0', built_at: '2026-11-14T00:00:00Z',
  built_from: 'inline S4 §7.1 test fixture', sources, materials, evidence: rows, cabin_presets: [] };

// S4 §3.2 / §8.3 explicitly exempt NE-no-data from evidence citations.
// Check actual outputs, not source text or a copied table of allowed strings.
const banned = /safe|never\s+burns|never\s+tested|will\s+burn\s+on\s+the\s+moon|nonflammable|fire[ -]safe/i;
const q = { material_id: 'pmma', form: 'rod', thickness_mm: 6.4, width_mm: null,
  o2_pct: 21, pressure_kpa: 56.5, flow_speed_cm_s: 2, flow_direction: 'opposed',
  gravity_g: 0, external_heat_flux_kw_m2: 0 };
const etfe = { ...q, material_id: 'etfe', form: 'wire', thickness_mm: 0.3,
  o2_pct: 34, pressure_kpa: 100, flow_speed_cm_s: 12, gravity_g: 1 };
const runs = [
  ['T1 BURNED', q, 'BURNED', null],
  ['T2 oxygen not covered (U1)', { ...q, o2_pct: 16.5 }, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['T3 ground no-spread', { ...q, o2_pct: 17.5, pressure_kpa: null, flow_speed_cm_s: null, gravity_g: 1 }, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['T4 lunar disagreement', { ...q, o2_pct: 34, gravity_g: 0.16 }, 'BURNED', null],
  ['T5 ETFE burned', etfe, 'BURNED', null],
  ['T6 NEAR', { ...etfe, o2_pct: 30.8 }, 'NEAR', null],
  ['T7 NEAR boundary', { ...etfe, o2_pct: 30.5 }, 'NEAR', null],
  ['T8 ETFE no-burn', { ...etfe, o2_pct: 30 }, 'NOT_ESTABLISHED', 'NE-no-burn'],
  ['T9 aircraft burned', { ...etfe, o2_pct: 27, gravity_g: 0 }, 'BURNED', null],
  ['T10 heat refusal', { ...etfe, external_heat_flux_kw_m2: 25 }, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['T11 endpoint refusal', { ...q, material_id: 'sibal', form: 'fabric',
    thickness_mm: 0.32, width_mm: 22, pressure_kpa: 101.3,
    flow_speed_cm_s: 2.2, flow_direction: 'concurrent' }, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['T12 no data', { ...q, material_id: 'nomex', form: 'fabric', thickness_mm: null,
    o2_pct: 34, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16 }, 'NOT_ESTABLISHED', 'NE-no-data'],
  ['T13 form refusal', { ...q, form: 'sheet', thickness_mm: 0.2, width_mm: 10,
    pressure_kpa: null, flow_speed_cm_s: null }, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['T14 direction refusal', { ...q, flow_direction: 'concurrent' }, 'NOT_ESTABLISHED', 'NE-incompatible'],
];
function inspect(result) {
  assert.equal(typeof result.wording, 'string');
  assert.ok(result.wording.trim(), 'labels must expose wording');
  assert.doesNotMatch(result.wording, banned);
  assert.ok(Array.isArray(result.flag_details), 'labels must expose flag explanations');
  for (const detail of result.flag_details) {
    assert.equal(typeof detail.why, 'string');
    assert.ok(detail.why.trim());
    assert.doesNotMatch(detail.why, banned);
  }
  assert.ok(Array.isArray(result.cited));
  if (result.reason === 'NE-no-data') {
    assert.deepEqual(result.cited, [], 'S4 §3.2: no-data has no invented evidence citation');
  } else {
    assert.ok(result.cited.length > 0, 'S4 §8.3: every evidence-backed label cites evidence');
  }
  assert.equal(new Set(result.cited).size, result.cited.length);
  for (const id of result.cited) {
    const row = rows.find(row => row.evidence_id === id);
    assert.ok(row, 'unknown cited evidence: ' + id);
    assert.equal(row.review_status, 'verified', 'unapproved evidence cited: ' + id);
    assert.ok(row.source_key?.trim());
    assert.ok(row.source_locator?.trim(), 'citation must resolve to a locator');
    assert.ok(sources[row.source_key], 'citation must resolve to a source');
    assert.match(sources[row.source_key].url, /^https:\/\//);
  }
  if (result.estimate) {
    assert.ok(result.estimate.g0);
    assert.ok(result.estimate.g1);
    assert.equal(result.cross_gravity, true);
    assert.ok(result.wording.startsWith('Estimate between 0 g and 1 g results:'));
    inspect(result.estimate.g0);
    inspect(result.estimate.g1);
  }
}
for (const [name, query, label, reason] of runs) {
  for (const api of ['labelMaterial', 'labelCabin']) {
    test('S4 §6 / §7.2 ' + name + ' / §8.3–8.4: ' + api + ' wording and resolvable citations', () => {
      const { material_id, form, thickness_mm, width_mm, ...conditions } = query;
      const result = api === 'labelMaterial' ? labelMaterial(query, rows)
        : labelCabin({ conditions, materials: [{ material_id, form, thickness_mm, width_mm }] }, evidence)[0];
      // An always-no-data stub must not make a citation test vacuously pass.
      assert.equal(result.label, label);
      assert.equal(result.reason, reason);
      inspect(result);
    });
  }
  test('S4 §4.2 / §6 / §8.4: comparison explanations contain no banned wording for ' + name, () => {
    for (const row of rows.filter(r => r.review_status === 'verified')) {
      const result = compareRow(query, row);
      assert.equal(result.rules.length, 13, 'all thirteen rule explanations must be present');
      for (const { why } of result.rules) {
        assert.equal(typeof why, 'string');
        assert.ok(why.trim());
        assert.doesNotMatch(why, banned);
      }
    }
  });
}
test('S4 §8.3: no-data exception preserves the exact absence wording', () => {
  const result = labelMaterial({ ...q, material_id: 'nomex' }, []);
  inspect(result);
  assert.equal(result.reason, 'NE-no-data');
  assert.equal(result.wording, 'Not found in the sources reviewed');
});

