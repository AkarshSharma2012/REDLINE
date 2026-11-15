import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRow } from '../src/rules/compare.js';
import { labelMaterial, labelCabin } from '../src/rules/label.js';
import { baselineLabel } from '../src/rules/baseline.js';

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

// Acceptance starts from S4's published goldens, with reviewed corrections below.
// Issue #234 applies reviewed U1 oxygen coverage; U2 pressure coverage is applied in #235; U4 remains separate.
// Observation points above query oxygen do not establish a no-burning result.
// Review U5 supplies the otherwise undefined labelCabin query envelope.
const ids = {
  b19: 'LINK2018-UG-B19', ug: 'LINK2018-UG-17', earth: 'LINK2018-1G-18',
  etfe1: 'OSORIO2014-ETFE-1G', etfe0: 'OSORIO2014-ETFE-UG', sibal: 'ZHAO2015-SIBAL-T4',
};
const pmma = { material_id: 'pmma', form: 'rod', thickness_mm: 6.4, width_mm: null,
  o2_pct: 21, pressure_kpa: 56.5, flow_speed_cm_s: 2, flow_direction: 'opposed',
  gravity_g: 0, external_heat_flux_kw_m2: 0 };
const etfe = { ...pmma, material_id: 'etfe', form: 'wire', thickness_mm: 0.3,
  o2_pct: 34, pressure_kpa: 100, flow_speed_cm_s: 12, gravity_g: 1 };
const out = (label, reason, cited, flags, cross_gravity = false) => ({
  label, reason, cited, flags: flags ? flags.split(' ') : [], cross_gravity,
});
const burned = (cited, flags) => out('BURNED', null, cited, flags);
const ne = (reason, cited, flags, cross = false) => out('NOT_ESTABLISHED', reason, cited, flags, cross);
const cases = [
  ['T1', pmma, burned([ids.b19, ids.ug], 'M P T V')],
  ['T2', { ...pmma, o2_pct: 16.5 }, ne('NE-incompatible', [ids.b19, ids.ug], 'M P T V')],
  ['T3', { ...pmma, o2_pct: 17.5, pressure_kpa: null, flow_speed_cm_s: null, gravity_g: 1 },
    ne('NE-incompatible', [ids.earth], 'M P T U V')],
  ['T4', { ...pmma, o2_pct: 34, gravity_g: 0.16 },
    out('BURNED', null, [ids.b19, ids.ug, ids.earth], 'G M P T U V', true)],
  ['T5', etfe, burned([ids.etfe1], 'M')],
  ['T6', { ...etfe, o2_pct: 30.8 }, out('NEAR', null, [ids.etfe1], 'M')],
  ['T7', { ...etfe, o2_pct: 30.5 }, out('NEAR', null, [ids.etfe1], 'M')],
  ['T8', { ...etfe, o2_pct: 30 }, ne('NE-no-burn', [ids.etfe1], 'M')],
  ['T9', { ...etfe, o2_pct: 27, gravity_g: 0 }, burned([ids.etfe0], 'M X')],
  ['T10', { ...etfe, external_heat_flux_kw_m2: 25 },
    ne('NE-incompatible', [ids.etfe1, ids.etfe0], 'G H M X', true)],
  ['T11', { ...pmma, material_id: 'sibal', form: 'fabric', thickness_mm: 0.32,
    width_mm: 22, pressure_kpa: 101.3, flow_speed_cm_s: 2.2, flow_direction: 'concurrent' },
    ne('NE-incompatible', [ids.sibal], 'E M U')],
  ['T12', { ...pmma, material_id: 'nomex', form: 'fabric', thickness_mm: null,
    o2_pct: 34, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16 },
    ne('NE-no-data', [], '', true)],
  ['T13', { ...pmma, form: 'sheet', thickness_mm: 0.2, width_mm: 10,
    pressure_kpa: null, flow_speed_cm_s: null },
    ne('NE-incompatible', [ids.earth, ids.ug, ids.b19], 'F G M P T U V', true)],
  ['T14', { ...pmma, flow_direction: 'concurrent' },
    ne('NE-incompatible', [ids.earth, ids.ug, ids.b19], 'D G M P T U V', true)],
];
const wording = {
  BURNED: 'Burned in testing at these conditions',
  NEAR: 'Close to a measured limit',
  'NE-no-burn': 'No burning found in comparable tests at or below this oxygen level in the sources reviewed',
  'NE-incompatible': 'Not established: tests were found, but none is comparable to this cabin',
  'NE-no-data': 'Not found in the sources reviewed',
};
const project = result => Object.fromEntries(
  ['label', 'reason', 'cited', 'flags', 'cross_gravity'].map(key => [key, result[key]]));
function check(result, expected, q) {
  assert.deepEqual(project(result), expected);
  if (q.gravity_g === 0.16) {
    assert.ok(result.estimate?.g0, 'partial gravity must expose 0 g result');
    assert.ok(result.estimate?.g1, 'partial gravity must expose 1 g result');
    assert.ok(result.wording.startsWith('Estimate between 0 g and 1 g results:'));
    if (q.material_id === 'pmma') {
      check(result.estimate.g0, burned([ids.b19, ids.ug], 'M P T V'), { ...q, gravity_g: 0 });
      check(result.estimate.g1, ne('NE-incompatible', [ids.earth], 'M P T U V'), { ...q, gravity_g: 1 });
    } else {
      for (const g of [0, 1]) check(result.estimate['g' + g], ne('NE-no-data', [], ''), { ...q, gravity_g: g });
    }
  } else {
    assert.equal(result.estimate, null);
    assert.equal(result.wording, wording[result.reason ?? result.label]);
  }
}
function cabin(q) {
  const { material_id, form, thickness_mm, width_mm, ...conditions } = q;
  return { conditions, materials: [{ material_id, form, thickness_mm, width_mm }] };
}
for (const [name, q, expected] of cases) {
  test('S4 §7.2 ' + name + ': labelMaterial exact label, reason, citations, flags and gravity', () =>
    check(labelMaterial(q, rows), expected, q));
  test('S4 §7.2 ' + name + ': labelCabin on the whole S4 §7.1 fixture', () => {
    const result = labelCabin(cabin(q), evidence);
    assert.equal(result.length, 1);
    assert.equal(result[0].material_id, q.material_id);
    check(result[0], expected, q);
  });
}
for (const [name, q, expected] of cases.filter(([name]) => ['T10', 'T13'].includes(name))) {
  test('S4 §7.4 ' + (name === 'T13' ? 'B1' : 'B2') + ': baseline contrast with ' + name, () => {
    check(labelMaterial(q, rows), expected, q);
    const display_name = materials.find(m => m.material_id === q.material_id).display_name;
    const result = baselineLabel({ ...q, display_name }, rows.filter(r => r.review_status === 'verified'));
    assert.equal(result.label, name === 'T13' ? 'BURNED' : 'NOT_ESTABLISHED');
    assert.equal(result.reason, name === 'T13' ? null : 'NE-no-data');
    assert.deepEqual(result.cited, name === 'T13' ? [ids.ug] : []);
  });
}
test('S4 §5.1, §8.7: draft and reviewed rows cannot change either labeling entry point', () => {
  for (const [, q] of cases) {
    const verified = rows.filter(r => r.review_status === 'verified');
    const dirty = [...verified, ...['draft', 'reviewed'].map(review_status => ({
      ...rows[0], ...q, evidence_id: 'UNAPPROVED-' + review_status,
      review_status, o2_pct: 0, outcome: 'spread', endpoint: 'burn/no-burn',
    }))];
    assert.deepEqual(labelMaterial(q, dirty), labelMaterial(q, verified));
    assert.deepEqual(labelCabin(cabin(q), { ...evidence, evidence: dirty }),
      labelCabin(cabin(q), { ...evidence, evidence: verified }));
  }
});
test('S4 §1.2, §8.8: zero verified rows gives NE-no-data for every material', () => {
  for (const material of materials) {
    const q = { ...pmma, material_id: material.material_id };
    for (const input of [[], rows.map(r => ({ ...r, review_status: 'draft' }))]) {
      const result = labelMaterial(q, input);
      check(result, ne('NE-no-data', [], ''), q);
      const [fromCabin] = labelCabin(cabin(q), { ...evidence, evidence: input });
      check(fromCabin, ne('NE-no-data', [], ''), q);
    }
  }
});
test('S4 §8.2: both labeling entry points are deterministic and do not mutate inputs', () => {
  for (const [, q] of cases) {
    const before = structuredClone({ q, evidence });
    assert.deepEqual(labelMaterial(q, rows), labelMaterial(q, rows));
    assert.deepEqual(labelCabin(cabin(q), evidence), labelCabin(cabin(q), evidence));
    assert.deepEqual({ q, evidence }, before);
  }
});
test('S4 §8.5: every non-OK comparison on a cited row is exposed in flag_details', () => {
  for (const [, q] of cases.filter(([, q]) => q.gravity_g !== 0.16)) {
    const result = labelMaterial(q, rows);
    assert.ok(result.cited.length || result.reason === 'NE-no-data');
    for (const id of result.cited) {
      const row = rows.find(r => r.evidence_id === id);
      const ctx = { quench_speeds_cm_s: rows.filter(r => r.review_status === 'verified'
        && r.material_id === row.material_id && r.gravity_g === row.gravity_g
        && r.endpoint === 'quench-limit' && r.value_unit === 'cm/s').map(r => r.value) };
      const details = compareRow(q, row, ctx).rules.filter(r => r.grade !== 'OK');
      for (const detail of details) assert.ok(result.flag_details.some(d =>
        d.evidence_id === id && d.rule === detail.rule && d.grade === detail.grade && d.why === detail.why));
    }
  }
});

// Isolated synthetic variants exercise S4 §4.3/§5 branches absent from T1–T14.
const variant = patch => ({ ...rows[3], ...patch });
function expectKind(q, rs, label, reason = null) {
  const result = labelMaterial(q, rs);
  assert.equal(result.label, label);
  assert.equal(result.reason, reason);
  return result;
}
for (const [name, patch, o2, label, reason] of [
  ['LOC equality burns', {}, 31.5, 'BURNED', null],
  ['single burn point below oxygen is not NEAR', { endpoint: 'burn/no-burn', outcome: 'spread' }, 31, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['spread rate null outcome burns', { endpoint: 'spread-rate', value_unit: 'mm/s', value: 1 }, 34, 'BURNED', null],
  ['spread rate spread outcome burns', { endpoint: 'spread-rate', outcome: 'spread', value_unit: 'mm/s', value: 1 }, 34, 'BURNED', null],
  ['spread rate no-spread does not burn', { endpoint: 'spread-rate', outcome: 'no-spread', value_unit: 'mm/s', value: 1 }, 34, 'NOT_ESTABLISHED', 'NE-incompatible'],
  ['uncertainty widens NEAR', { uncertainty: '±2' }, 29.5, 'NEAR', null],
  ['ASCII uncertainty widens NEAR', { uncertainty: '+/-2' }, 29.5, 'NEAR', null],
  ['interval uncertainty widens NEAR', { uncertainty: 'between 29.5 and 33.5' }, 29.5, 'NEAR', null],
  ['small uncertainty cannot shrink one-point band', { uncertainty: '±0.1' }, 30.5, 'NEAR', null],
  ['unparseable uncertainty uses one point', { uncertainty: 'O2 drift < 1.0% of set value' }, 30, 'NOT_ESTABLISHED', 'NE-no-burn'],
]) test('S4 §4.3 / §5.2: ' + name, () => expectKind({ ...etfe, o2_pct: o2 }, [variant(patch)], label, reason));
for (const outcome of ['no-spread', 'quenched', 'blowoff', 'no-ignition', 'consumed', null])
  test('S4 §4.3 / §7.5 X2–X3: burn/no-burn ' + outcome + ' cannot prove burning or NEAR', () =>
    expectKind(etfe, [variant({ endpoint: 'burn/no-burn', outcome })], 'NOT_ESTABLISHED', 'NE-incompatible'));
for (const [o2_pct, pressure_kpa, expected, reason] of [
  [34, 50, 'BURNED', null], [31, 50, 'NEAR', null],
  [30, 50, 'NOT_ESTABLISHED', 'NE-incompatible'], [34, null, 'NOT_ESTABLISHED', 'NE-incompatible'],
]) test('S4 §4.3: kPa O2 limit at ' + o2_pct + '% and ' + pressure_kpa + ' kPa', () =>
  expectKind({ ...etfe, o2_pct, pressure_kpa }, [variant({ value: 16, value_unit: 'kPa O2' })], expected, reason));
test('S4 §5.1: BURNED takes precedence over NEAR and cites only winning rows', () => {
  const result = expectKind(etfe, [variant({ evidence_id: 'NEAR', value: 34.5 }),
    variant({ evidence_id: 'BURN' })], 'BURNED');
  assert.deepEqual(result.cited, ['BURN']);
});
test('S4 §5.3: citation ordering uses non-OK count then plain evidence_id', () => {
  const rs = [variant({ evidence_id: 'z', pressure_kpa: null }),
    variant({ evidence_id: 'b' }), variant({ evidence_id: 'a' })];
  assert.deepEqual(expectKind(etfe, rs, 'BURNED').cited, ['a', 'b', 'z']);
  assert.deepEqual(expectKind(etfe, [...rs].reverse(), 'BURNED').cited, ['a', 'b', 'z']);
});
test('S4 §5.1 / §9: cross-gravity-only rows refuse with G and cited evidence', () => {
  const result = expectKind(etfe, [rows[4]], 'NOT_ESTABLISHED', 'NE-incompatible');
  assert.equal(result.cross_gravity, true);
  assert.ok(result.flags.includes('G'));
  assert.deepEqual(result.cited, [ids.etfe0]);
});
test('S4 §4.2 V: only verified same-material same-row-gravity quench limits cross flow', () => {
  const spread = variant({ flow_speed_cm_s: 2 });
  const quench = variant({ evidence_id: 'QUENCH', endpoint: 'quench-limit', value: 3, value_unit: 'cm/s' });
  const q = { ...etfe, flow_speed_cm_s: 4 };
  expectKind(q, [spread, quench], 'NOT_ESTABLISHED', 'NE-incompatible');
  for (const patch of [{ review_status: 'draft' }, { review_status: 'reviewed' },
    { material_id: 'pmma' }, { gravity_g: 0 }, { value_unit: '% O2' }])
    expectKind(q, [spread, { ...quench, ...patch }], 'BURNED');
});
for (const gravity_g of [0.0101, 0.16, 0.38, 0.8999])
  test('S4 §5.4 / §8.6: partial gravity ' + gravity_g + ' exposes both estimates and deduplicates citations', () => {
    const result = labelMaterial({ ...etfe, gravity_g }, rows);
    assert.ok(result.estimate?.g0);
    assert.ok(result.estimate?.g1);
    assert.equal(result.cross_gravity, true);
    assert.ok(result.flags.includes('G'));
    assert.ok(result.wording.startsWith('Estimate between 0 g and 1 g results:'));
    assert.deepEqual(result.cited, [ids.etfe0, ids.etfe1]);
    assert.equal(result.label, 'BURNED');
  });

