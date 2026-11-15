import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareRow } from '../src/rules/compare.js';
import { labelMaterial } from '../src/rules/label.js';

// Synthetic inputs only: the fixture supplies schema/provenance, not these values.
const fixture = JSON.parse(readFileSync(new URL('./fixtures/holdout-evidence.json', import.meta.url), 'utf8'));
const template = fixture.evidence.find((r) => r.material_id === 'sibal');
const SEED = 0x133c0ffe;
const CASES = 3000;
const letters = ['E', 'M', 'F', 'T', 'W', 'D', 'V', 'P', 'G', 'X', 'H', 'A', 'U'];
const grades = ['OK', 'FLAG', 'INVALID'];
const labels = ['NOT_ESTABLISHED', 'NEAR', 'BURNED'];

// Mulberry32: fixed unsigned arithmetic, no clock or external dependencies.
function generator(seed) {
  let state = seed >>> 0;
  return () => {
    let x = state = (state + 0x6d2b79f5) >>> 0;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function fuzz(name, offset, check) {
  const seed = (SEED + offset) >>> 0;
  test(`${name} (seed=${seed}, cases=${CASES})`, () => {
    const random = generator(seed);
    const pick = (values) => values[Math.floor(random() * values.length)];
    for (let i = 0; i < CASES; i++) {
      try {
        check({ random, pick, i });
      } catch (error) {
        error.message = `seed=${seed} case=${i}: ${error.message}`;
        throw error;
      }
    }
  });
}

function sample({ random, pick, i }) {
  return {
    ...template, evidence_id: `SYNTHETIC-FUZZ-${i}`,
    source_locator: 'Synthetic randomized inputs; not a NASA measurement',
    display_name: 'SIBAL', material: 'SIBAL',
    material_id: pick(['sibal', 'pmma', 'nomex']),
    form: pick(['fabric', 'rod', 'sheet', null]),
    thickness_mm: pick([null, 0, 0.32, random() * 10]),
    width_mm: pick([null, 0, 22, random() * 100]),
    flow_speed_cm_s: pick([null, 0, 2.2, random() * 30]),
    flow_direction: pick([null, 'opposed', 'concurrent', 'quiescent', 'upward-buoyant']),
    o2_pct: pick([null, 0, 100, random() * 100]),
    pressure_kpa: pick([null, 50, 100, random() * 120 + 1]),
    gravity_g: pick([0, 0.01, 0.16, 0.9, 1]),
    external_heat_flux_kw_m2: pick([0, 5, 6, random() * 30]),
    facility: pick(['ISS', 'ground', 'aircraft', 'drop-tower']),
    endpoint: pick(['LOC-FS', 'burn/no-burn', 'spread-rate', 'quench-limit']),
    value: random() * 100, value_unit: pick(['% O2', 'kPa O2', 'cm/s']),
    outcome: pick([null, 'spread', 'no-spread', 'quenched', 'blowoff']),
    uncertainty: pick(['not stated', '+/-0', '+/-0.3', 'between 1 and 3']),
    review_status: pick(['verified', 'draft', 'reviewed']),
  };
}

fuzz('random comparisons and labels never throw and obey result contracts', 0, (g) => {
  const query = sample(g);
  // Cabin queries omit these optional row-only descriptors, or leave fields absent.
  if (g.random() < 0.5) delete query.endpoint;
  if (g.random() < 0.5) delete query.uncertainty;
  if (g.random() < 0.5) delete query.pressure_kpa;
  const rows = Array.from({ length: 1 + Math.floor(g.random() * 5) }, () => sample(g));
  const context = { quench_speeds_cm_s: [g.random() * 30] };
  for (const row of rows) {
    const result = compareRow(query, row, context);
    assert.deepEqual(result.rules.map((r) => r.rule), letters);
    for (const rule of result.rules) {
      assert.ok(grades.includes(rule.grade));
      assert.equal(typeof rule.why, 'string');
      assert.ok(rule.why.trim().length > 0);
    }
    const worst = Math.max(...result.rules.map((r) => grades.indexOf(r.grade)));
    assert.equal(result.grade, grades[worst]);
  }
  assert.ok(labels.includes(labelMaterial(query, rows).label));
});

fuzz('symmetric field rules keep their grade when operands swap', 1, (g) => {
  const a = sample(g);
  const b = sample(g);
  // F flags missing query form; W exempts a row-side rod/wire. Hold forms equal
  // and present so neither query-side defaults nor row-side exemptions differ.
  a.form = b.form = g.pick(['fabric', 'sheet', 'rod']);
  const context = { quench_speeds_cm_s: [g.random() * 30] };
  const forward = compareRow(a, b, context);
  const reverse = compareRow(b, a, context);
  // E/M/D/U have query-side defaults or row-side uncertainty; do not assume symmetry.
  // X is symmetric here because both facilities are explicitly supplied.
  for (const letter of ['F', 'T', 'W', 'V', 'P', 'G', 'X', 'H', 'A']) {
    const f = forward.rules.find((r) => r.rule === letter);
    const r = reverse.rules.find((r) => r.rule === letter);
    assert.ok(f && r, `missing symmetric rule ${letter}`);
    assert.equal(f.grade, r.grade, `rule ${letter}`);
  }
});

fuzz('fixed compatible evidence has monotonic labels as query O2 rises', 2, (g) => {
  const threshold = 5 + g.random() * 90;
  const row = {
    ...sample(g), material_id: 'sibal', material: 'SIBAL', form: 'fabric',
    thickness_mm: 0.32, width_mm: 22, flow_speed_cm_s: 2.2,
    flow_direction: 'concurrent', pressure_kpa: 100, gravity_g: 0,
    external_heat_flux_kw_m2: 0, facility: 'ISS', uncertainty: '+/-0',
    review_status: 'verified', endpoint: g.pick(['LOC-FS', 'burn/no-burn', 'spread-rate']),
    o2_pct: threshold, value: threshold, value_unit: '% O2', outcome: 'spread',
  };
  const query = { ...row, display_name: 'SIBAL' };
  delete query.endpoint;
  const oxygen = [0, threshold - 2, threshold - 0.5, threshold, 100, g.random() * 100].sort((a, b) => a - b);
  let previous = -1;
  for (const o2_pct of oxygen) {
    const result = labelMaterial({ ...query, o2_pct }, [row]);
    const rank = labels.indexOf(result.label);
    assert.ok(rank >= 0, `unknown label ${result.label}`);
    assert.ok(rank >= previous, `O2=${o2_pct}: label regressed to ${result.label}`);
    previous = rank;
    // Anchors prevent an always-NOT_ESTABLISHED stub from passing monotonicity.
    if (o2_pct >= threshold) assert.equal(result.label, 'BURNED');
    if (o2_pct === threshold - 0.5 && row.endpoint === 'LOC-FS') assert.equal(result.label, 'NEAR');
    if (o2_pct === 0) assert.equal(result.label, 'NOT_ESTABLISHED');
  }
});
