import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { field, facetValues, filterInvestigations, rankInvestigations, scoreInvestigation } from '../src/rules/rank-investigations.js';

const catalog = JSON.parse(await readFile(new URL('../data/investigations.json', import.meta.url), 'utf8'));
const { investigations, sources } = catalog;
const bass = investigations.find(i => i.id === 'bass');

test('production adapter resolves every supplied PSI accession provenance, including unknown values', () => {
  assert.equal(investigations.length, 26);
  for (const inv of investigations) {
    const f = field(inv, 'psi_id', sources);
    const ref = inv.provenance.psi_id.sources[0];
    assert.equal(f.value, inv.psi_id);
    assert.equal(f.source?.url, sources[ref.source_id].url, inv.id);
    assert.equal(f.source.locator, ref.locator);
  }
});

test('production aliases preserve values, scopes, provenance notes and genuine unknowns', () => {
  for (const [alias, key] of Object.entries({ fire_safety_areas: 'fire_safety_area', o2_pct: 'oxygen_range_pct', pressure_kpa: 'pressure_range_kpa', airflow_cm_s: 'airflow_range_cm_s', variables_varied: 'varied', variables_fixed: 'fixed', sensors: 'measurements' })) {
    const f = field(bass, alias, sources);
    assert.deepEqual(f.value, bass[key]);
    assert.equal(f.note, bass.provenance[key].note ?? '');
    assert.ok(f.source?.url);
  }
  const missing = structuredClone(bass);
  delete missing.provenance.psi_id;
  assert.equal(field(missing, 'psi_id', sources).source, null);
  assert.match(field(missing, 'psi_id', sources).note, /no source/i);
  missing.provenance.psi_id = { sources: [{ source_id: 'absent' }] };
  assert.equal(field(missing, 'psi_id', sources).source, null);
  assert.equal(field(bass, 'habitat_relevance', sources).value, null);
  assert.equal(field(bass, 'airflow_cm_s', sources).value, null);
});

test('production filters and rover rankings use supplied fields without inventing planetary relevance', () => {
  assert.deepEqual(facetValues(investigations, 'fire_safety_areas'), ['detection', 'prevention', 'suppression']);
  assert.deepEqual(filterInvestigations(investigations, { area: 'suppression' }).map(i => i.id), investigations.filter(i => i.fire_safety_area?.includes('suppression')).map(i => i.id));
  const ranked = rankInvestigations(investigations, { habitat: 'pressurized-rover', need: 'suppression' }, sources);
  assert.ok(new Set(ranked.map(r => r.score)).size > 1);
  const scored = scoreInvestigation(bass, { habitat: 'pressurized-rover', need: 'suppression' }, sources);
  assert.equal(scored.reasons.find(r => r.factor === 'need').points, 3);
  assert.equal(scored.reasons.find(r => r.factor === 'gravity').points, 1);
  assert.equal(scored.reasons.find(r => r.factor === 'habitat').points, 0);
  for (const inv of investigations.filter(i => i.record_type !== 'flight')) {
    assert.equal(scoreInvestigation(inv, { habitat: 'station' }, sources).reasons.find(r => r.factor === 'gravity').points, 0, inv.id);
  }
  const planned = investigations.find(i => i.oxygen_range_pct?.scope === 'planned');
  assert.equal(scoreInvestigation(planned, { habitat: 'station' }, sources).reasons.find(r => r.factor === 'o2').points, 0);
});
