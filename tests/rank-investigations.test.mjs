// B11: investigation ranking, filters and comparison (src/rules/rank-investigations.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HABITATS, NEEDS, WEIGHTS, field, facetValues, filterInvestigations,
  scoreInvestigation, rankInvestigations, compareInvestigations, COMPARE_FIELDS,
} from '../src/rules/rank-investigations.js';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('tests/fixtures/investigations.json', root), 'utf8'));
const { investigations: invs, sources } = catalog;
const byId = (id) => invs.find((i) => i.id === id);

test('every habitat has an O2 range, pressure range and a NASA source link', () => {
  assert.deepEqual(HABITATS.map((h) => h.id), ['spacecraft', 'station', 'lunar-base', 'mars-base', 'pressurized-rover']);
  for (const h of HABITATS) {
    assert.ok(h.o2_pct.min <= h.o2_pct.max && h.pressure_kpa.min <= h.pressure_kpa.max, h.id);
    assert.ok(['0g', 'partial'].includes(h.gravity), h.id);
    assert.ok(h.sources.length > 0, h.id);
    for (const s of h.sources) assert.match(s.url, /^https:\/\/(ntrs\.nasa\.gov|www\.nasa\.gov)\//, h.id);
  }
  assert.deepEqual(NEEDS, ['prevention', 'detection', 'suppression']);
});

test('field() resolves source ids, keeps notes, and marks unknowns', () => {
  const f = field(byId('saffire-vi'), 'o2_pct', sources);
  assert.deepEqual(f.value, { min: 28.8, max: 31.0 });
  assert.equal(f.source.locator, 'Table 1, p. 3');
  assert.match(f.source.url, /20240002981/);
  const unknown = field(byId('bass-ii'), 'pressure_kpa', sources);
  assert.equal(unknown.value, null);
  assert.match(unknown.note, /not found in the sources reviewed/i);
  assert.equal(field({}, 'o2_pct').note, 'not found in the sources reviewed');
  assert.equal(field({ o2_pct: 21 }, 'o2_pct').source, null);
});

test('fixture: every catalog field value cites a source that exists', () => {
  for (const inv of invs) {
    for (const [key, raw] of Object.entries(inv)) {
      if (key === 'id' || key === 'name') continue;
      assert.ok(raw && typeof raw === 'object' && 'value' in raw, `${inv.id}.${key} is a sourced field`);
      assert.ok(sources[raw.source], `${inv.id}.${key} source ${raw.source} exists`);
      if (raw.value == null) assert.ok(raw.note, `${inv.id}.${key} null has a note`);
    }
  }
});

test('filters by fire-safety area, fuel type and hardware', () => {
  assert.deepEqual(filterInvestigations(invs, { area: 'suppression' }).map((i) => i.id), ['bass-ii']);
  assert.equal(filterInvestigations(invs, { area: 'detection' }).length, 3);
  assert.equal(filterInvestigations(invs, { fuelType: 'solid', hardware: 'all' }).length, invs.length);
  assert.deepEqual(filterInvestigations(invs, { hardware: 'msg' }).map((i) => i.id), ['bass-ii']);
  assert.deepEqual(filterInvestigations(invs, { area: 'suppression', hardware: 'Saffire flow unit (Cygnus)' }), []);
  assert.deepEqual(facetValues(invs, 'fire_safety_areas'), ['detection', 'prevention', 'suppression']);
});

test('score is the sum of visible factor points, each with a reason', () => {
  const s = scoreInvestigation(byId('saffire-vi'), { habitat: 'lunar-base', need: 'detection' }, sources);
  assert.equal(s.max, WEIGHTS.need + WEIGHTS.habitat + WEIGHTS.o2 + WEIGHTS.pressure + WEIGHTS.gravity);
  assert.equal(s.score, s.reasons.reduce((n, r) => n + r.points, 0));
  const by = Object.fromEntries(s.reasons.map((r) => [r.factor, r]));
  assert.equal(by.need.points, 3);
  assert.equal(by.habitat.points, 2);
  assert.equal(by.o2.points, 2, by.o2.why); // 28.8-31 overlaps 26.5-34
  assert.equal(by.pressure.points, 0, by.pressure.why); // 54.1-55.2 vs 56.5-70.3
  assert.match(by.pressure.why, /1\.3 kPa apart/);
  assert.equal(by.gravity.points, 1);
  assert.match(by.gravity.why, /No partial-gravity tests in PSI yet/);
  assert.match(by.gravity.why, /estimate/);
  for (const r of s.reasons) assert.ok(r.sources.length > 0, `${r.factor} cites a source`);
});

test('O2 close to the habitat range earns a partial point; unknown earns none', () => {
  const s = scoreInvestigation(byId('saffire-v'), { habitat: 'mars-base' }, sources); // 25.4-26.2 vs 34
  assert.equal(s.reasons.find((r) => r.factor === 'o2').points, 0);
  const near = scoreInvestigation({ id: 'x', name: 'X', o2_pct: { value: { min: 31, max: 31 } } }, { habitat: 'mars-base' });
  assert.equal(near.reasons.find((r) => r.factor === 'o2').points, 1);
  const b = scoreInvestigation(byId('bass-ii'), { habitat: 'station' }, sources);
  const o2 = b.reasons.find((r) => r.factor === 'o2');
  assert.equal(o2.points, 0);
  assert.match(o2.why, /not found in the sources reviewed/);
});

test('need "any" drops the need factor from the score', () => {
  const s = scoreInvestigation(byId('bass-ii'), { habitat: 'station', need: 'any' }, sources);
  assert.ok(!s.reasons.some((r) => r.factor === 'need'));
  assert.equal(s.max, 7);
});

test('partial gravity: 0 g + 1 g bounds and analogs score, capped', () => {
  const g = (value) => scoreInvestigation({ id: 'g', name: 'G', gravity: { value } }, { habitat: 'lunar-base' })
    .reasons.find((r) => r.factor === 'gravity');
  assert.equal(g(['0g']).points, 1);
  assert.equal(g(['0g', '1g']).points, 2);
  assert.equal(g(['1g', 'partial-analog']).points, 1);
  assert.equal(g(['0g', '1g', 'partial-analog']).points, 2);
  assert.equal(g(['partial']).points, 2);
  assert.equal(g(['1g']).points, 0);
  const station = scoreInvestigation({ id: 'g', name: 'G', gravity: { value: ['1g'] } }, { habitat: 'station' });
  assert.equal(station.reasons.find((r) => r.factor === 'gravity').points, 0);
});

test('ranking: best first, ties share a rank and sort by name', () => {
  const ranked = rankInvestigations(invs, { habitat: 'station', need: 'prevention' }, sources);
  assert.equal(ranked.length, invs.length);
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(ranked[i - 1].score >= ranked[i].score);
    if (ranked[i - 1].score === ranked[i].score) {
      assert.equal(ranked[i].rank, ranked[i - 1].rank);
      assert.ok(ranked[i - 1].name.localeCompare(ranked[i].name) <= 0);
    } else assert.equal(ranked[i].rank, i + 1);
  }
  // Saffire-II and -IV tie (both ~22% O2 vs station 20.8-21%): same rank, name order.
  assert.deepEqual(ranked.slice(0, 2).map((r) => [r.id, r.rank]), [['saffire-ii', 1], ['saffire-iv', 1]]);
  assert.equal(ranked[2].rank, 3);
  const lunar = rankInvestigations(invs, { habitat: 'lunar-base', need: 'detection' }, sources);
  assert.equal(lunar[0].id, 'saffire-vi');
  assert.throws(() => rankInvestigations(invs, { habitat: 'venus' }), /Unknown habitat/);
});

test('compare: same vs differ, unknowns never count as same', () => {
  const { same, differ } = compareInvestigations(byId('saffire-iv'), byId('saffire-v'), sources);
  assert.equal(same.length + differ.length, COMPARE_FIELDS.length);
  const s = same.map((r) => r.key);
  const d = differ.map((r) => r.key);
  for (const k of ['objectives', 'hardware', 'fuel_type', 'airflow_cm_s', 'gravity', 'sensors']) assert.ok(s.includes(k), k);
  for (const k of ['o2_pct', 'pressure_kpa', 'fuel_sample', 'variables_varied']) assert.ok(d.includes(k), k);
  const varied = differ.find((r) => r.key === 'variables_varied');
  assert.deepEqual(varied.shared, ['sample material']);
  const unk = compareInvestigations(byId('bass-ii'), byId('saffire-ii'), sources);
  assert.ok(unk.differ.some((r) => r.key === 'pressure_kpa'), 'both unknown is not "same"');
  for (const row of [...same, ...differ]) assert.ok(row.a.source && row.b.source, `${row.key} sourced on both sides`);
});

test('no banned science wording in B11 code or fixture', async () => {
  const banned = /\b(safe|never burns|never tested|nonflammable|fire-safe|will burn on the moon)\b/i;
  for (const file of ['src/rules/rank-investigations.js', 'src/ui/investigations.js', 'tests/fixtures/investigations.json']) {
    const text = await readFile(new URL(file, root), 'utf8');
    const hits = text.split('\n').filter((l) => banned.test(l) && !/banned/i.test(l));
    assert.deepEqual(hits, [], file);
  }
});
