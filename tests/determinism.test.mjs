import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { labelCabin } from '../src/rules/label.js';
import { baselineLabel } from '../src/rules/baseline.js';
import { lunarEstimate } from '../src/rules/lunar.js';

// Existing fixture values are test inputs, not independently validated measurements.
const fixture = JSON.parse(readFileSync(new URL('./fixtures/holdout-evidence.json', import.meta.url), 'utf8'));
const query = {
  material_id: 'pmma', display_name: 'PMMA (acrylic)', form: 'rod',
  thickness_mm: 6.4, width_mm: null, o2_pct: 21, pressure_kpa: 100,
  flow_speed_cm_s: 12, flow_direction: 'opposed', gravity_g: 0.16,
  external_heat_flux_kw_m2: 0,
};
const cabin = {
  conditions: { ...query },
  materials: [
    { material_id: 'pmma', form: 'rod', thickness_mm: 6.4, width_mm: null },
    { material_id: 'sibal', form: 'fabric', thickness_mm: 0.32, width_mm: 22 },
    { material_id: 'nomex', form: 'fabric', thickness_mm: null, width_mm: null },
  ],
};

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

// Fixed permutations keep the test itself reproducible; never sort inputs or outputs.
function orders(rows) {
  return [rows, [...rows].reverse(), [...rows.slice(2), ...rows.slice(0, 2)],
    rows.filter((_, i) => i % 2).concat(rows.filter((_, i) => !(i % 2)))];
}

function checkPure(fn, args, expected) {
  for (const frozen of [false, true]) {
    const inputs = structuredClone(args);
    const before = structuredClone(inputs);
    if (frozen) deepFreeze(inputs);
    const first = structuredClone(fn(...inputs));
    assert.deepEqual(inputs, before, 'first call mutated an input');
    assert.deepEqual(first, expected, 'evidence order changed the result');
    const second = fn(...inputs);
    assert.deepEqual(inputs, before, 'second call mutated an input');
    assert.deepEqual(second, first, 'identical input changed the result');
  }
}

for (const [name, fn, input, wrap] of [
  ['labelCabin', labelCabin, cabin, (rows) => ({ ...structuredClone(fixture), evidence: rows })],
  ['baselineLabel', baselineLabel, query, (rows) => rows],
  ['lunarEstimate', lunarEstimate, query, (rows) => rows],
]) {
  for (const [scenario, rows] of [
    ['mixed materials and 0 g / 1 g evidence', fixture.evidence],
    ['empty evidence', []],
    ['non-burning evidence', fixture.evidence.filter((r) => r.outcome === 'no-spread' || r.outcome === 'quenched')],
  ]) {
    test(`${name}: ${scenario} is repeatable, order independent and does not mutate inputs`, () => {
      const expected = structuredClone(fn(structuredClone(input), wrap(structuredClone(rows))));
      for (const ordered of orders(rows)) checkPure(fn, [input, wrap(ordered)], expected);
    });
  }
}

for (const o2_pct of [15, 16.5, 21]) {
  test(`baselineLabel: O2 ${o2_pct} remains deterministic across evidence permutations`, () => {
    const input = { ...query, o2_pct };
    const expected = baselineLabel(input, fixture.evidence);
    for (const rows of orders(fixture.evidence)) checkPure(baselineLabel, [input, rows], expected);
  });
}
