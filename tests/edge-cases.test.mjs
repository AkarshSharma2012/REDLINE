// These tests describe the binding rules (compareRow, normalize, labels). They are marked todo until the F1 Evidence Engine (#55) implements them; remove ".todo" when F1 lands.
// Issue #81: executable S1/S4 contracts, including V2 U1/U2 corrections.
// Deliberately ordinary tests (no skips/TODOs): scaffold implementations must fail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareRow } from '../src/rules/compare.js';
import { labelMaterial, labelCabin } from '../src/rules/label.js';
import { baselineLabel } from '../src/rules/baseline.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/holdout-evidence.json', import.meta.url), 'utf8'));
// All numbers below are SYNTHETIC boundary inputs, not NASA measurements.
// Reuse S1 row shape and the fixture's NASA source register; the locator explicitly
// distinguishes invented inputs from the source's actual quench-limit observation.
const query = (overrides = {}) => ({
  material_id: 'sibal', display_name: 'SIBAL', material: 'SIBAL', form: 'fabric',
  thickness_mm: 0.32, width_mm: 22, flow_speed_cm_s: 2.2,
  flow_direction: 'concurrent', o2_pct: 20, pressure_kpa: 100, gravity_g: 0,
  external_heat_flux_kw_m2: 0, ...overrides,
});
const row = (overrides = {}) => ({
  ...fixture.evidence.find((r) => r.evidence_id === 'ZHAO2015-SIBAL-T4'),
  evidence_id: 'SYNTHETIC-SPREAD', material: 'SIBAL', o2_pct: 20,
  pressure_kpa: 100, endpoint: 'burn/no-burn', value: null, value_unit: null,
  outcome: 'spread', uncertainty: '+/-0', verified_by: 'fixture-only',
  source_locator: 'Synthetic boundary inputs only; original fixture locator: pp. 2, 3, 5; p. 9 appendix',
  ...overrides,
});
const limit = (overrides = {}) => row({
  evidence_id: 'SYNTHETIC-LIMIT', endpoint: 'LOC-FS', value: 21,
  value_unit: '% O2', o2_pct: 21, outcome: null, ...overrides,
});
const evidence = (rows) => ({ ...fixture, evidence: rows });
const cabin = (materials = [{ material_id: 'sibal', form: 'fabric', thickness_mm: 0.32, width_mm: 22 }], conditions = query()) => ({ conditions, materials });
const answer = (result, label, reason = null, cited) => {
  assert.equal(result.label, label);
  assert.equal(result.reason, reason);
  if (cited) assert.deepEqual(result.cited, cited);
};
function rule(result, letter, grade) {
  const found = result.rules.find((r) => r.rule === letter);
  assert.ok(found, `missing rule ${letter}`);
  assert.equal(found.grade, grade, `${letter}: ${found.why}`);
  assert.equal(typeof found.why, 'string');
  assert.ok(found.why.length > 0);
}

test.todo('compareRow: one fully specified comparable row has all 13 rules in binding order', () => {
  const result = compareRow(query(), row());
  assert.deepEqual(result.rules.map((r) => r.rule), ['E', 'M', 'F', 'T', 'W', 'D', 'V', 'P', 'G', 'X', 'H', 'A', 'U']);
  assert.equal(result.grade, 'OK');
});

for (const side of ['query', 'row']) {
  test.todo(`compareRow: missing ${side} pressure raises P without invalidating burning evidence`, () => {
    const result = compareRow(query(side === 'query' ? { pressure_kpa: null } : {}), row(side === 'row' ? { pressure_kpa: null } : {}));
    rule(result, 'P', 'FLAG');
    assert.equal(result.grade, 'FLAG');
  });
}
test.todo('compareRow: pressure gap of exactly 10 kPa is allowed; larger gap flags', () => {
  rule(compareRow(query(), row({ pressure_kpa: 110 })), 'P', 'OK');
  rule(compareRow(query(), row({ pressure_kpa: 110.001 })), 'P', 'FLAG');
});
test.todo('compareRow: dimensions in mm and flow in cm/s use strict ratio > 2', () => {
  for (const [field, value] of [['thickness_mm', 0.32], ['width_mm', 22], ['flow_speed_cm_s', 2.2]]) {
    const letter = { thickness_mm: 'T', width_mm: 'W', flow_speed_cm_s: 'V' }[field];
    rule(compareRow(query(), row({ [field]: value * 2 })), letter, 'OK');
    rule(compareRow(query(), row({ [field]: value * 2.01 })), letter, 'FLAG');
  }
});
test.todo('compareRow: quench speed at the upper endpoint invalidates; at the lower endpoint it does not', () => {
  const context = { quench_speeds_cm_s: [2.2] };
  rule(compareRow(query({ flow_speed_cm_s: 2.2 }), row({ flow_speed_cm_s: 3 }), context), 'V', 'OK');
  const crossing = compareRow(query({ flow_speed_cm_s: 2.1 }), row(), context);
  rule(crossing, 'V', 'INVALID');
  assert.equal(crossing.grade, 'INVALID');
});

for (const [name, fn] of [['labelMaterial', labelMaterial], ['baselineLabel', baselineLabel]]) {
  test.todo(`${name}: empty evidence is NE-no-data with no citations`, () => {
    answer(fn(query(), []), 'NOT_ESTABLISHED', 'NE-no-data', []);
  });
  test.todo(`${name}: a single spread row at exactly query O2 is BURNED`, () => {
    answer(fn(query(), [row()]), 'BURNED', null, ['SYNTHETIC-SPREAD']);
  });
  test.todo(`${name}: duplicate spread rows do not change the answer or citation`, () => {
    const r = row();
    assert.deepEqual(fn(query(), [r, { ...r }]), fn(query(), [r]));
  });
  test.todo(`${name}: BURNED beats NEAR regardless of row order`, () => {
    const burn = row();
    const near = limit();
    answer(fn(query(), [near]), 'NEAR', null, [near.evidence_id]);
    for (const rows of [[burn, near], [near, burn]]) {
      answer(fn(query(), rows), 'BURNED', null, [burn.evidence_id]);
    }
  });
  for (const [o2, expected] of [[21, 'BURNED'], [20, 'NEAR'], [20.999, 'NEAR']]) {
    test.todo(`${name}: measured limit 21 % O2, query ${o2} % O2 => ${expected}`, () => {
      answer(fn(query({ o2_pct: o2 }), [limit()]), expected, null, ['SYNTHETIC-LIMIT']);
    });
  }
  test.todo(`${name}: missing spread-row O2 is unknown rather than zero`, () => {
    assert.equal(fn(query(), [row({ o2_pct: null })]).label, 'NOT_ESTABLISHED');
  });
  test.todo(`${name}: missing query O2 cannot produce BURNED or NEAR`, () => {
    for (const o2_pct of [null, undefined]) {
      assert.equal(fn(query({ o2_pct }), [row(), limit()]).label, 'NOT_ESTABLISHED');
    }
  });
}

test.todo('labelMaterial: duplicate NEAR rows do not duplicate citations', () => {
  const r = limit();
  assert.deepEqual(labelMaterial(query(), [r, { ...r }]), labelMaterial(query(), [r]));
  answer(labelMaterial(query(), [r, { ...r }]), 'NEAR', null, [r.evidence_id]);
});
test.todo('labelMaterial: draft and unrelated rows cannot supply a label', () => {
  answer(labelMaterial(query(), [row({ review_status: 'draft' }), row({ material_id: 'pmma' })]), 'NOT_ESTABLISHED', 'NE-no-data', []);
});
test('labelMaterial: a spread point above query O2 is not a measured limit or covering test (V2 U1)', () => {
  answer(labelMaterial(query({ o2_pct: 19.5 }), [row()]), 'NOT_ESTABLISHED', 'NE-incompatible', ['SYNTHETIC-SPREAD']);
});
test('labelMaterial: no-spread at query O2 covers; lower O2 does not (V2 U1)', () => {
  answer(labelMaterial(query(), [row({ outcome: 'no-spread' })]), 'NOT_ESTABLISHED', 'NE-no-burn', ['SYNTHETIC-SPREAD']);
  answer(labelMaterial(query(), [row({ outcome: 'no-spread', o2_pct: 19 })]), 'NOT_ESTABLISHED', 'NE-incompatible', ['SYNTHETIC-SPREAD']);
});
test('labelMaterial: oxygen coverage requires known oxygen and cites only covering rows (V2 U1)', () => {
  const covering = row({ evidence_id: 'SYNTHETIC-NO-SPREAD', outcome: 'no-spread', o2_pct: 21 });
  answer(labelMaterial(query(), [covering, row({ o2_pct: 22 })]), 'NOT_ESTABLISHED', 'NE-no-burn', [covering.evidence_id]);
  for (const o2_pct of [null, undefined]) {
    answer(labelMaterial(query(), [row({ outcome: 'no-spread', o2_pct })]), 'NOT_ESTABLISHED', 'NE-incompatible');
    answer(labelMaterial(query({ o2_pct }), [covering]), 'NOT_ESTABLISHED', 'NE-incompatible');
  }
  for (const r of [limit({ value: 22 }), limit({ value: 22, value_unit: 'kPa O2' })]) {
    answer(labelMaterial(query(), [r]), 'NOT_ESTABLISHED', 'NE-no-burn', [r.evidence_id]);
  }
});
for (const pressure_kpa of [null, 110.001]) {
  test.todo(`labelMaterial: pressure ${pressure_kpa} cannot cover no-spread but retains burning evidence (V2 U2)`, () => {
    answer(labelMaterial(query(), [row({ pressure_kpa, outcome: 'no-spread' })]), 'NOT_ESTABLISHED', 'NE-incompatible', ['SYNTHETIC-SPREAD']);
    const burned = labelMaterial(query(), [row({ pressure_kpa })]);
    answer(burned, 'BURNED', null, ['SYNTHETIC-SPREAD']);
    assert.ok(burned.flags.includes('P'));
  });
}
for (const [o2_pct, label, reason] of [[20, 'BURNED', null], [19, 'NEAR', null], [18.99, 'NOT_ESTABLISHED', 'NE-no-burn']]) {
  test.todo(`labelMaterial: kPa O2 limit uses partial pressure: ${o2_pct}% at 50 kPa`, () => {
    const r = limit({ value: 10, value_unit: 'kPa O2', o2_pct: null, pressure_kpa: 50 });
    answer(labelMaterial(query({ o2_pct, pressure_kpa: 50 }), [r]), label, reason, [r.evidence_id]);
  });
}
test.todo('labelMaterial: kPa O2 limit with missing query pressure cannot produce a numeric label', () => {
  assert.equal(labelMaterial(query({ pressure_kpa: null }), [limit({ value: 10, value_unit: 'kPa O2', o2_pct: null })]).label, 'NOT_ESTABLISHED');
});
test.todo('labelMaterial: a cm/s quench value cannot be interpreted as an oxygen limit', () => {
  answer(labelMaterial(query(), [row({ endpoint: 'quench-limit', value: 2.2, value_unit: 'cm/s', outcome: 'quenched' })]), 'NOT_ESTABLISHED', 'NE-incompatible', ['SYNTHETIC-SPREAD']);
});

test.todo('labelCabin: empty material list returns no results', () => {
  assert.deepEqual(labelCabin(cabin([]), evidence([row()])), []);
});
test.todo('labelCabin: empty evidence preserves requested materials in input order', () => {
  const materials = [{ material_id: 'sibal' }, { material_id: 'pmma' }];
  const result = labelCabin(cabin(materials), evidence([]));
  assert.deepEqual(result.map((r) => r.material_id), ['sibal', 'pmma']);
  for (const r of result) answer(r, 'NOT_ESTABLISHED', 'NE-no-data', []);
});
test.todo('labelCabin: routes one verified row and excludes unrelated and draft rows', () => {
  const materials = [{ ...query() }, { material_id: 'pmma' }, { material_id: 'nomex' }];
  const result = labelCabin(cabin(materials), evidence([row(), row({ material_id: 'pmma', review_status: 'draft' })]));
  assert.deepEqual(result.map((r) => r.material_id), ['sibal', 'pmma', 'nomex']);
  answer(result[0], 'BURNED', null, ['SYNTHETIC-SPREAD']);
  for (const r of result.slice(1)) answer(r, 'NOT_ESTABLISHED', 'NE-no-data', []);
});
test.todo('labelCabin: duplicates and conflicting rows retain BURNED precedence', () => {
  const result = labelCabin(cabin(), evidence([limit(), row(), row()]));
  assert.equal(result.length, 1);
  answer(result[0], 'BURNED', null, ['SYNTHETIC-SPREAD']);
});
test.todo('labelCabin: shared O2 and pressure reach the kPa O2 limit calculation', () => {
  const r = limit({ value: 10, value_unit: 'kPa O2', o2_pct: null, pressure_kpa: 50 });
  const result = labelCabin(cabin(undefined, query({ o2_pct: 20, pressure_kpa: 50 })), evidence([r]));
  answer(result[0], 'BURNED', null, [r.evidence_id]);
});
test.todo('labelMaterial: winning citations resolve through the NASA source register and retain wording', () => {
  const r = row();
  const result = labelMaterial(query(), [r]);
  answer(result, 'BURNED', null, [r.evidence_id]);
  assert.equal(result.wording, 'Burned in testing at these conditions');
  for (const id of result.cited) {
    const cited = [r].find((candidate) => candidate.evidence_id === id);
    assert.ok(cited?.source_locator);
    assert.equal(new URL(fixture.sources[cited.source_key].url).hostname, 'ntrs.nasa.gov');
  }
});
test.todo('baselineLabel: units in names normalize, and missing pressure is deliberately ignored', () => {
  const r = row({ material: '100 micron SIBAL fabric 2 cm wide' });
  answer(baselineLabel(query({ pressure_kpa: null }), [r]), 'BURNED', null, [r.evidence_id]);
});
test.todo('baselineLabel: kPa O2 value is not treated as % O2 (uses reported row O2)', () => {
  const r = limit({ value: 10, value_unit: 'kPa O2', o2_pct: 25 });
  answer(baselineLabel(query(), [r]), 'NOT_ESTABLISHED', 'NE-no-burn', [r.evidence_id]);
  answer(baselineLabel(query(), [{ ...r, o2_pct: null }]), 'NOT_ESTABLISHED', 'NE-no-burn', [r.evidence_id]);
});
