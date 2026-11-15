import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRow } from '../src/rules/compare.js';

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

const order = 'E M F T W D V P G X H A U'.split(' ');
function golden(q, r, expected, ctx) {
  const before = structuredClone({ q, r, ctx });
  const actual = compareRow(q, r, ctx);
  assert.equal(actual.grade, expected.some(([, g]) => g === 'INVALID') ? 'INVALID' : expected.length ? 'FLAG' : 'OK');
  assert.deepEqual(actual.rules.map(({ rule, grade }) => [rule, grade]),
    order.map(rule => [rule, expected.find(([letter]) => letter === rule)?.[1] ?? 'OK']));
  for (const entry of actual.rules) {
    assert.equal(typeof entry.why, 'string');
    assert.ok(entry.why.trim(), entry.rule + ' must explain both compared values');
  }
  assert.deepEqual({ q, r, ctx }, before, 'comparison must not mutate inputs');
  assert.deepEqual(compareRow(q, r, ctx), actual, 'comparison must be deterministic');
}
const flags = letters => letters.split(' ').map(letter => [letter, 'FLAG']);
test('S4 §7.3 C1 / R1 Example 1: PMMA 0 g versus 1 g', () =>
  golden({ ...rows[1] }, rows[2], flags('A G P T U V')));
test('S4 §7.3 C2 / R1 Example 2: ETFE ground versus aircraft', () =>
  golden({ ...rows[3] }, rows[4], flags('A G X')));
test('S4 §7.3 C3 / R1 Example 3: synthetic Test 1 versus SIBAL quench', () => {
  const q = { ...rows[5], endpoint: 'MOC-T1', flow_direction: 'upward-buoyant',
    flow_speed_cm_s: null, pressure_kpa: null, width_mm: 65, gravity_g: 1, facility: 'ground' };
  delete q.uncertainty;
  golden(q, rows[5], [...flags('G P U V W'), ['D', 'INVALID'], ['E', 'INVALID']]);
});

// Synthetic perturbations isolate each S4 rule; numbers below are test inputs,
// not additional published measurements. Explicit material avoids registry ambiguity.
const base = { ...rows[0], material: 'PMMA (acrylic)', thickness_mm: 2, width_mm: 20,
  form: 'sheet', flow_speed_cm_s: 2, pressure_kpa: 100, o2_pct: 21,
  uncertainty: '±0.3', facility: 'ISS', limit_approach: 'fixed' };
const query = { ...base, o2_pct: 24 };
const cases = [];
const c = (name, rule, grade, q = {}, r = {}, ctx) =>
  cases.push({ name, q: { ...query, ...q }, r: { ...base, ...r }, expected: grade === 'OK' ? [] : [[rule, grade]], ctx });
c('all identical known conditions', 'E', 'OK');
for (const endpoint of ['LOC-FS', 'burn/no-burn', 'spread-rate'])
  c('E cabin accepts ' + endpoint, 'E', 'OK', { endpoint: null }, { endpoint });
for (const endpoint of ['LOC-FR', 'quench-limit', 'blowoff-limit', 'MOC-T1', 'LOI-D2863', 'ignition', null])
  c('E cabin rejects ' + endpoint, 'E', 'INVALID', { endpoint: null }, { endpoint });
c('E explicit endpoint mismatch', 'E', 'INVALID', { endpoint: 'LOC-FS' });
c('E explicit matching non-spread endpoint', 'E', 'OK', { endpoint: 'MOC-T1' }, { endpoint: 'MOC-T1' });
c('M different ID overrides matching name', 'M', 'INVALID', { material_id: 'etfe' });
c('M same ID different source name', 'M', 'FLAG', { material: 'PMMA, clear' });
c('M missing source name matches trimmed display name', 'M', 'OK',
  { material: null, display_name: 'PMMA (acrylic)', aliases: ['acrylic'] }, { material: '  pmma (ACRYLIC)  ' });
c('M missing source name matches alias', 'M', 'OK',
  { material: null, display_name: 'PMMA (acrylic)', aliases: ['acrylic'] }, { material: ' ACRYLIC ' });
c('M unrecognized source name', 'M', 'FLAG', { material: null, display_name: 'PMMA (acrylic)', aliases: ['acrylic'] },
  { material: 'PMMA, cast black' });
c('F different forms', 'F', 'INVALID', { form: 'fabric' });
c('F unspecified query form', 'F', 'FLAG', { form: null });
c('T null query', 'T', 'FLAG', { thickness_mm: null });
c('T null row', 'T', 'FLAG', {}, { thickness_mm: null });
c('T ratio exactly two', 'T', 'OK', { thickness_mm: 4 });
c('T ratio above two', 'T', 'FLAG', { thickness_mm: 4.01 });
c('T reciprocal ratio above two', 'T', 'FLAG', { thickness_mm: 0.9 });
c('W null query sheet', 'W', 'FLAG', { width_mm: null });
c('W null row sheet', 'W', 'FLAG', {}, { width_mm: null });
c('W ratio exactly two', 'W', 'OK', { width_mm: 40 });
c('W ratio above two', 'W', 'FLAG', { width_mm: 41 });
for (const form of ['rod', 'wire'])
  c('W ' + form + ' ignores missing widths', 'W', 'OK', { form, width_mm: null }, { form, width_mm: null });
for (const [left, right] of [['opposed', 'concurrent'], ['concurrent', 'opposed'],
  ['opposed', 'quiescent'], ['quiescent', 'concurrent'], ['opposed', 'upward-buoyant'], ['upward-buoyant', 'concurrent']])
  c('D ' + left + ' versus ' + right, 'D', 'INVALID', { flow_direction: left }, { flow_direction: right });
c('D unspecified query', 'D', 'FLAG', { flow_direction: null });
c('D nonforced pair', 'D', 'OK', { flow_direction: 'quiescent' }, { flow_direction: 'upward-buoyant' });
c('V missing query speed', 'V', 'FLAG', { flow_speed_cm_s: null });
c('V missing row speed', 'V', 'FLAG', {}, { flow_speed_cm_s: null });
c('V zero versus positive', 'V', 'FLAG', { flow_speed_cm_s: 0 });
c('V both zero', 'V', 'OK', { flow_speed_cm_s: 0 }, { flow_speed_cm_s: 0 });
c('V ratio exactly two', 'V', 'OK', { flow_speed_cm_s: 4 });
c('V ratio above two', 'V', 'FLAG', { flow_speed_cm_s: 4.01 });
c('V quench crossing includes upper endpoint', 'V', 'INVALID', { flow_speed_cm_s: 4 }, {}, { quench_speeds_cm_s: [4] });
c('V quench crossing excludes lower endpoint', 'V', 'OK', { flow_speed_cm_s: 4 }, {}, { quench_speeds_cm_s: [2] });
c('V reversed quench crossing', 'V', 'INVALID', {}, { flow_speed_cm_s: 4 }, { quench_speeds_cm_s: [3] });
c('P missing query', 'P', 'FLAG', { pressure_kpa: null });
c('P missing row', 'P', 'FLAG', {}, { pressure_kpa: null });
c('P exactly ten kPa', 'P', 'OK', { pressure_kpa: 90 });
c('P above ten kPa', 'P', 'FLAG', { pressure_kpa: 89.9 });
c('G 0.01 belongs to microgravity', 'G', 'OK', { gravity_g: 0.01 });
c('G just above 0.01 is partial', 'G', 'FLAG', { gravity_g: 0.0101 });
c('G 0.9 belongs to Earth class', 'G', 'OK', { gravity_g: 0.9 }, { gravity_g: 1 });
c('G just below 0.9 is partial', 'G', 'FLAG', { gravity_g: 0.8999 }, { gravity_g: 1 });
c('G two partial gravities', 'G', 'OK', { gravity_g: 0.16 }, { gravity_g: 0.38 });
c('G Earth versus microgravity', 'G', 'FLAG', { gravity_g: 1 });
for (const facility of ['aircraft', 'drop-tower'])
  c('X cabin versus ' + facility, 'X', 'FLAG', { facility: null }, { facility });
c('X long-duration cabin and ISS', 'X', 'OK', { facility: null });
c('X two short facilities', 'X', 'OK', { facility: 'aircraft' }, { facility: 'drop-tower' });
c('X only query short', 'X', 'FLAG', { facility: 'aircraft' });
c('H zero versus positive', 'H', 'INVALID', { external_heat_flux_kw_m2: 1 });
c('H positive versus zero', 'H', 'INVALID', {}, { external_heat_flux_kw_m2: 1 });
c('H null query means zero', 'H', 'OK', { external_heat_flux_kw_m2: null });
c('H exactly five difference', 'H', 'OK', { external_heat_flux_kw_m2: 6 }, { external_heat_flux_kw_m2: 1 });
c('H above five difference', 'H', 'INVALID', { external_heat_flux_kw_m2: 6.1 }, { external_heat_flux_kw_m2: 1 });
c('A different approaches', 'A', 'FLAG', { limit_approach: 'lower-o2' });
c('A different criteria', 'A', 'FLAG', { pass_criterion: '100 mm' }, { pass_criterion: 'end of period' });
c('A absent cabin fields', 'A', 'OK', { limit_approach: null, pass_criterion: null });
c('U row not stated', 'U', 'FLAG', {}, { uncertainty: 'not stated' });
c('U query not stated', 'U', 'FLAG', { uncertainty: 'not stated' });
c('U query absent is allowed', 'U', 'OK', { uncertainty: undefined });
c('U inclusive plus-minus boundary', 'U', 'FLAG', { o2_pct: 21.25 }, { uncertainty: '±0.25' });
c('U ASCII uncertainty', 'U', 'FLAG', { o2_pct: 21.25 }, { uncertainty: '+/-0.25' });
c('U interval half width', 'U', 'FLAG', { o2_pct: 22 }, { uncertainty: 'between 20 and 22' });
c('U outside stated uncertainty', 'U', 'OK', { o2_pct: 21.251 }, { uncertainty: '±0.25' });
c('U unparseable is not a missing statement', 'U', 'OK', { o2_pct: 21 }, { uncertainty: 'O2 drift < 1.0% of set value' });
for (const { name, q, r, expected, ctx } of cases)
  test('S4 §4.1–4.4: ' + name, () => golden(q, r, expected, ctx));
test('S4 §4.2: INVALID dominates FLAG and every rule is still returned', () =>
  golden({ ...query, form: 'fabric', pressure_kpa: null }, base, [['F', 'INVALID'], ['P', 'FLAG']]));

