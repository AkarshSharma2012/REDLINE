import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const catalog = JSON.parse(await readFile(new URL('../data/investigations.json', import.meta.url), 'utf8'));
const fields = ['id', 'name', 'psi_id', 'psi_url', 'record_type', 'parent_id', 'objectives',
  'platform', 'hardware', 'fire_safety_area', 'fuel_type', 'sample_shape', 'sample_size',
  'oxygen_range_pct', 'pressure_range_kpa', 'airflow_range_cm_s', 'gravity', 'varied', 'fixed',
  'measurements', 'key_findings', 'spacecraft_relevance', 'station_relevance',
  'lunar_base_relevance', 'mars_base_relevance', 'pressurized_rover_relevance', 'earth_applications'];
const required = ['bass', 'bass-ii', 'saffire-i', 'saffire-ii', 'saffire-iii', 'same', 'same-r',
  'daft', 'daft-2', 'flex', 'flex-2', 'cfi', 'acme', 'acme-bre', 'acme-e-field', 'acme-cfi-g',
  'acme-cld', 'acme-flame-design', 'acme-s-flame', 'spice', 'slice'];
const nasa = (s) => { try { const u = new URL(s); return u.protocol === 'https:' && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov')); } catch { return false; } };
function validate(data) {
  assert.equal(data.schema_version, 1);
  assert.ok(Array.isArray(data.investigations) && data.investigations.length > 0);
  const ids = new Set();
  for (const [key, source] of Object.entries(data.sources)) {
    assert.ok(nasa(source.url), `${key}: NASA URL`);
    assert.ok(source.title?.trim(), `${key}: source title`);
    if (source.metadata_url) assert.ok(nasa(source.metadata_url));
  }
  for (const row of data.investigations) {
    assert.match(row.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!ids.has(row.id), `duplicate ${row.id}`); ids.add(row.id);
    assert.deepEqual(Object.keys(row).sort(), [...fields, 'provenance'].sort());
    assert.deepEqual(Object.keys(row.provenance).sort(), [...fields].sort());
    assert.ok(row.name?.trim());
    assert.ok(['flight', 'derived-study', 'umbrella'].includes(row.record_type));
    assert.ok(row.parent_id === null || typeof row.parent_id === 'string');
    if (row.psi_id !== null) {
      assert.match(row.psi_id, /^PSI-\d+$/);
      assert.equal(row.psi_url, `https://psi.nasa.gov/physci/repo/data/investigations/${row.psi_id}`);
    } else assert.equal(row.psi_url, null);
    for (const field of fields) {
      const p = row.provenance[field];
      assert.ok(['reported', 'interpretation', 'editorial', 'unknown'].includes(p.basis), `${row.id}.${field}: basis`);
      assert.ok(Array.isArray(p.sources) && p.sources.length > 0, `${row.id}.${field}: source required`);
      for (const ref of p.sources) {
        assert.ok(data.sources[ref.source_id], `${row.id}.${field}: unresolved source`);
        assert.ok(ref.locator?.trim(), `${row.id}.${field}: locator required`);
      }
      if (row[field] === null) {
        assert.equal(p.basis, 'unknown');
        assert.ok(p.note?.trim(), `${row.id}.${field}: null needs explanation`);
      } else {
        assert.notEqual(p.basis, 'unknown');
        if (p.basis !== 'reported') assert.ok(p.note?.trim(), `${row.id}.${field}: distinguish interpretation`);
        if (typeof row[field] === 'string') assert.ok(row[field].trim());
      }
    }
    for (const field of ['fire_safety_area', 'varied', 'fixed', 'measurements', 'key_findings']) {
      assert.ok(row[field] === null || (Array.isArray(row[field]) && row[field].length > 0 && row[field].every(s => typeof s === 'string' && s.trim())));
    }
    const structured = new Set(['fire_safety_area', 'varied', 'fixed', 'measurements', 'key_findings', 'oxygen_range_pct', 'pressure_range_kpa', 'airflow_range_cm_s']);
    for (const field of fields.filter(f => !structured.has(f))) assert.ok(row[field] === null || typeof row[field] === 'string', `${row.id}.${field}: string or null`);
    if (row.fire_safety_area) for (const area of row.fire_safety_area) assert.ok(['prevention', 'detection', 'suppression'].includes(area));
    for (const field of ['oxygen_range_pct', 'pressure_range_kpa', 'airflow_range_cm_s']) {
      const range = row[field]; if (range === null) continue;
      assert.deepEqual(Object.keys(range).sort(), ['min', 'max', 'scope'].sort());
      assert.ok(Number.isFinite(range.min) && Number.isFinite(range.max));
      assert.ok(range.min >= 0 && range.max >= range.min);
      if (field === 'oxygen_range_pct') assert.ok(range.max <= 100);
      if (field === 'pressure_range_kpa') assert.ok(range.min > 0);
      assert.ok(['reported-test-conditions', 'protocol', 'planned'].includes(range.scope));
      assert.ok(row.provenance[field].note?.trim(), `${field}: scope/unit explanation`);
    }
  }
  for (const id of required) assert.ok(ids.has(id), `missing ${id}`);
  for (const row of data.investigations) if (row.parent_id !== null) assert.ok(ids.has(row.parent_id));
}

test('catalog schema, coverage and every field has resolvable NASA provenance', () => validate(catalog));
test('reject missing provenance, missing locator, unknown without note, foreign source and invalid ranges', () => {
  const mutations = [
    d => { delete d.investigations[0].provenance.hardware; },
    d => { d.investigations[0].provenance.name.sources[0].locator = ''; },
    d => { d.investigations[0].hardware = null; d.investigations[0].provenance.hardware = { basis: 'unknown', sources: d.investigations[0].provenance.name.sources }; },
    d => { Object.values(d.sources)[0].url = 'https://nasa.gov.example.org/fake'; },
    d => { d.investigations[0].oxygen_range_pct = { min: 40, max: 20, scope: 'protocol' }; },
    d => { d.investigations[1].id = d.investigations[0].id; },
    d => { d.investigations[0].name = ''; },
    d => { d.investigations[0].hardware = 42; },
  ];
  for (const mutate of mutations) { const d = structuredClone(catalog); mutate(d); assert.throws(() => validate(d)); }
});
test('ACME children, shared DAFT accession and research-only studies remain distinct', () => {
  assert.equal(catalog.investigations.filter(r => r.parent_id === 'acme').length, 6);
  const byId = Object.fromEntries(catalog.investigations.map(r => [r.id, r]));
  assert.equal(byId.acme.record_type, 'umbrella'); assert.equal(byId.acme.psi_id, null);
  assert.equal(byId.daft.psi_id, 'PSI-47'); assert.equal(byId['daft-2'].psi_id, 'PSI-47');
  assert.equal(new Set(catalog.investigations.map(r => r.psi_id).filter(Boolean)).size, 24);
  assert.equal(catalog.investigations.filter(r => r.record_type === 'derived-study').length, 5);
  assert.equal(byId.cfi.pressure_range_kpa, null);
  assert.match(byId.cfi.provenance.pressure_range_kpa.note, /conflict/i);
});
test('catalog avoids unsupported predictions and keeps planetary application unknown', () => {
  const text = catalog.investigations.map(r => fields.map(f => JSON.stringify(r[f])).join(' ')).join(' ');
  assert.doesNotMatch(text, /\b(?:safe|never tested|never burns|will burn on the Moon)\b/i);
  for (const row of catalog.investigations) {
    for (const field of ['lunar_base_relevance', 'mars_base_relevance', 'pressurized_rover_relevance']) assert.equal(row[field], null);
    if (row.key_findings !== null) assert.equal(row.provenance.key_findings.basis, 'reported');
  }
});
