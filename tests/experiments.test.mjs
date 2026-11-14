import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestExperiments } from '../src/rules/experiments.js';
import { suggestFixes } from '../src/ui/fixes.js';

const conditions = { o2_pct: 34, pressure_kpa: 56.5, gravity_g: 1,
  flow_speed_cm_s: 0, flow_direction: 'quiescent', external_heat_flux_kw_m2: 0 };
const line = material_id => ({ material_id, form: 'fabric', thickness_mm: 1, width_mm: 20 });
const cabin = { conditions, materials: [line('a'), line('b')] };
const gap = material_id => ({ material_id, label: 'NOT_ESTABLISHED', reason: 'NE-no-data', cited: [] });
const row = { ...conditions, ...line('b'), evidence_id: 'r', review_status: 'verified',
  endpoint: 'burn/no-burn', outcome: 'no-spread', o2_pct: 36, source_key: 'NASA', source_locator: 'Table 1' };
const evidence = { sources: { NASA: { title: 'Test fixture', url: 'https://ntrs.nasa.gov/citations/123' } }, evidence: [row] };

test('gaps group by conditions, rank by distinct dependent materials and preserve missing values', () => {
  const cards = suggestExperiments([gap('a'), gap('b'), gap('a')], { cabinQuery: cabin, evidence });
  assert.equal(cards.length, 1);
  assert.equal(cards[0].dependency_count, 2);
  assert.equal(cards[0].conditions.pressure_kpa, 56.5);
  assert.match(cards[0].hypothesis, /REDLINE inference/);
  assert.equal(suggestExperiments([{ ...gap('a'), label: 'BURNED' }]).length, 0);
  assert.equal(suggestExperiments([{ ...gap('a'), reason: 'NE-no-burn' }]).length, 0);
  const lunar = suggestExperiments([gap('a')], { cabinQuery: { ...cabin, conditions: { ...conditions, gravity_g: 0.16 } } });
  assert.match(lunar[0].facility.name, /FM2/);
  assert.match(lunar[0].facility.note, /not a scheduled/);
});

test('swaps require covering verified NASA evidence at matching conditions', () => {
  const results = [{ material_id: 'a', label: 'BURNED', cited: [] }, { ...gap('b'), reason: 'NE-no-burn', cited: ['r'] }];
  assert.equal(suggestFixes(results, { cabinQuery: cabin, evidence }).length, 1);
  for (const patch of [{ pressure_kpa: null }, { pressure_kpa: 100 }, { o2_pct: 18 }, { review_status: 'draft' }, { form: 'rod' }, { gravity_g: 0 }]) {
    assert.equal(suggestFixes(results, { cabinQuery: cabin, evidence: { ...evidence, evidence: [{ ...row, ...patch }] } }).length, 0);
  }
  assert.deepEqual(suggestFixes(results), []);
});

test('oxygen suggestion uses all comparable spread points and never calls a point a limit', () => {
  const burn = { ...row, material_id: 'a', outcome: 'spread', o2_pct: 30 };
  const fixes = suggestFixes([{ material_id: 'a', label: 'BURNED', cited: ['r'] }], {
    cabinQuery: cabin, evidence: { ...evidence, evidence: [burn, { ...burn, evidence_id: 'r2', o2_pct: 28 }] }
  });
  assert.equal(fixes[0].o2_pct, 27.5);
  assert.match(fixes[0].text, /no burned-in-testing result applies/);
  assert.doesNotMatch(fixes[0].text, /cap|safe|limit/);
});
