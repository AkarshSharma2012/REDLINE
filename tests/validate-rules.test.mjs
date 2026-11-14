import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvidence, FIELDS, ENUMS, PROVENANCE_KEYS } from '../src/schema/validate.js';

// Synthetic schema fixtures; these numbers are test inputs, not scientific claims.
function fixture() {
  return {
    schema_version: '1.0.0', built_at: '2026-01-01T00:00:00Z', built_from: 'synthetic fixture',
    sources: { nasa: { title: 'Fixture source', url: 'https://nasa.gov/', authors: '', year: 1900 } },
    materials: [{ material_id: 'sample', display_name: 'Synthetic sample', aliases: ['sample'] }],
    evidence: [{
      evidence_id: 'row-1', material: 'Synthetic sample', material_id: 'sample', form: 'sheet',
      thickness_mm: 1, width_mm: 1, flow_speed_cm_s: 0, flow_direction: 'opposed',
      o2_pct: 21, pressure_kpa: 100, gravity_g: 0, facility: 'ISS', endpoint: 'spread-rate',
      value: 1, value_unit: 'cm/s', outcome: 'spread', uncertainty: 'Synthetic uncertainty',
      run_id: 'run-1', source_key: 'nasa', source_locator: 'fixture section',
      external_heat_flux_kw_m2: 0, limit_approach: 'fixed', pass_criterion: null,
      test_duration_s: 1, notes: null, holdout_group: 'group-1', review_status: 'verified', verified_by: null,
    }],
    cabin_presets: [{ preset_id: 'preset-1', label: 'Synthetic preset', status: 'fixture',
      context: 'Test only', source_key: 'nasa', source_locator: 'fixture section',
      pressure_kpa: 100, o2_pct: 21,
      prebreathe: [{ minutes: '1', regime: 'fixture', kind: 'fixture', assumptions: 'Test only',
        source_key: 'nasa', source_locator: 'fixture section' }] }],
  };
}
const row = (d) => d.evidence[0];
const preset = (d) => d.cabin_presets[0];
function accepts(name, mutate = () => {}) {
  test(name, () => {
    const data = fixture(); mutate(data);
    assert.deepEqual(validateEvidence(data), { ok: true, errors: [] });
  });
}
function rejects(name, mutate, message) {
  test(name, () => {
    const data = fixture(); const replacement = mutate(data);
    const result = validateEvidence(replacement === undefined ? data : replacement);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes(message)), JSON.stringify(result.errors));
  });
}
accepts('complete fixture satisfies all rules');
for (const bad of [null, [], 'text', 1]) {
  rejects(`top level rejects ${JSON.stringify(bad)}`, () => bad, 'top level must be an object');
}
for (const key of ['schema_version', 'built_at', 'built_from']) {
  for (const bad of [undefined, null, '', ' ', 1]) {
    rejects(`top-level ${key} rejects ${JSON.stringify(bad)}`, (d) => { d[key] = bad; }, `"${key}" must be a non-empty string`);
  }
}
rejects('unsupported version', (d) => { d.schema_version = '2.0.0'; }, 'unsupported schema_version');
for (const bad of ['2026-01-01', '2026-99-99T00:00:00Z', 'invalid']) {
  rejects(`invalid timestamp ${bad}`, (d) => { d.built_at = bad; }, 'built_at must be an ISO timestamp');
}
for (const key of ['sources', 'materials', 'evidence', 'cabin_presets']) {
  for (const bad of [null, 'text', ...(key === 'sources' ? [[]] : [{}])]) {
    rejects(`top-level ${key} rejects ${JSON.stringify(bad)}`, (d) => { d[key] = bad; }, `top level "${key}" must be`);
  }
}
accepts('empty collections allowed', (d) => { d.sources = {}; d.materials = []; d.evidence = []; d.cabin_presets = []; });

const optionalKeys = new Set(['limit_approach', 'pass_criterion', 'test_duration_s', 'notes', 'verified_by']);
for (const { key, type, nullable } of FIELDS) {
  accepts(`${key}: valid typed value`);
  if (optionalKeys.has(key)) accepts(`${key}: may be absent`, (d) => { delete row(d)[key]; });
  else rejects(`${key}: required key`, (d) => { delete row(d)[key]; }, `missing required key "${key}"`);
  if (nullable) accepts(`${key}: accepts null in draft`, (d) => { row(d).review_status = 'draft'; row(d).value = null; row(d)[key] = null; });
  else rejects(`${key}: rejects null`, (d) => { row(d)[key] = null; }, `"${key}" must not be null`);
  rejects(`${key}: rejects wrong type`, (d) => { row(d)[key] = type === 'number' ? '1' : 1; }, `"${key}" must be a ${type}`);
  if (type === 'number') {
    for (const bad of [NaN, Infinity, -Infinity]) rejects(`${key}: rejects ${bad}`, (d) => { row(d)[key] = bad; }, `"${key}" must be a number`);
  } else if (!nullable) {
    for (const bad of ['', ' ']) rejects(`${key}: rejects blank ${JSON.stringify(bad)}`, (d) => { row(d)[key] = bad; }, `"${key}" must not be empty`);
  }
}
for (const [key, values] of Object.entries(ENUMS)) {
  for (const value of values) accepts(`${key}: enum ${value}`, (d) => { row(d)[key] = value; });
  rejects(`${key}: rejects unknown enum`, (d) => { row(d)[key] = 'unknown'; }, `"${key}" value "unknown" not in`);
}
const ranges = {
  thickness_mm: [[0.1], [0, -1]], width_mm: [[0.1], [0, -1]],
  flow_speed_cm_s: [[0, 1], [-1]], o2_pct: [[0, 100], [-1, 100.1]],
  pressure_kpa: [[0.1], [0, -1]], gravity_g: [[0, 1], [-1]],
  external_heat_flux_kw_m2: [[0, 1], [-1]], test_duration_s: [[0.1], [0, -1]],
};
for (const [key, [valid, invalid]] of Object.entries(ranges)) {
  for (const value of valid) accepts(`${key}: range accepts ${value}`, (d) => { row(d)[key] = value; });
  for (const value of invalid) rejects(`${key}: range rejects ${value}`, (d) => { row(d)[key] = value; }, `"${key}" value ${value} out of range`);
}
for (const key of PROVENANCE_KEYS) {
  for (const value of ['fixture text', null]) accepts(`${key}: provenance ${value}`, (d) => { row(d)[key] = value; });
  rejects(`${key}: provenance rejects number`, (d) => { row(d)[key] = 1; }, `provenance "${key}" must be a string or null`);
}
rejects('unknown row key', (d) => { row(d).unexpected = ''; }, 'unknown key "unexpected"');
rejects('row must be object', (d) => { d.evidence = [null]; }, 'row is not an object');
accepts('unique evidence ids', (d) => { d.evidence.push({ ...row(d), evidence_id: 'row-2' }); });
rejects('duplicate evidence ids', (d) => { d.evidence.push({ ...row(d) }); }, 'duplicate evidence_id');
for (const key of ['source_key', 'material_id']) {
  rejects(`unresolved evidence ${key}`, (d) => { row(d)[key] = 'missing'; }, `${key} "missing" not in`);
}
for (const key of ['endpoint', 'o2_pct']) {
  rejects(`verified needs ${key}`, (d) => { row(d)[key] = null; }, `verified row needs "${key}"`);
}
accepts('verified allows unknown pressure', (d) => { row(d).pressure_kpa = null; });
accepts('verified permits value only', (d) => { row(d).outcome = null; });
accepts('verified permits outcome only', (d) => { row(d).value = null; row(d).value_unit = null; });
rejects('verified needs value or outcome', (d) => { row(d).value = null; row(d).outcome = null; }, 'verified row needs "value" or "outcome"');
for (const status of ['draft', 'reviewed']) accepts(`${status} permits incomplete label data`, (d) => {
  Object.assign(row(d), { review_status: status, endpoint: null, o2_pct: null, value: null, value_unit: null, outcome: null });
});
rejects('value needs unit', (d) => { row(d).value_unit = null; }, '"value" is set but "value_unit" is empty');
accepts('burn/no-burn with outcome', (d) => { row(d).endpoint = 'burn/no-burn'; });
rejects('burn/no-burn needs outcome even in draft', (d) => { Object.assign(row(d), { review_status: 'draft', endpoint: 'burn/no-burn', outcome: null }); }, 'endpoint "burn/no-burn" requires "outcome"');

for (const bad of [null, [], 'text']) rejects(`source object rejects ${JSON.stringify(bad)}`, (d) => { d.sources.nasa = bad; }, 'needs non-empty "title" and "url"');
for (const key of ['title', 'url']) {
  for (const bad of [undefined, '', ' ', null, 1]) rejects(`source ${key} rejects ${JSON.stringify(bad)}`, (d) => { d.sources.nasa[key] = bad; }, 'needs non-empty "title" and "url"');
}
for (const url of ['https://nasa.gov/', 'https://ntrs.nasa.gov/', 'https://taskbook.nasaprs.com/']) accepts(`NASA URL accepts ${url}`, (d) => { d.sources.nasa.url = url; });
for (const url of ['http://nasa.gov/', 'https://nasa.gov.example.com/', 'https://fakenasa.gov/', 'https://example.com/', 'invalid']) rejects(`NASA URL rejects ${url}`, (d) => { d.sources.nasa.url = url; }, 'url must link to a NASA source');
rejects('source authors must be string', (d) => { d.sources.nasa.authors = null; }, 'authors must be a string');
for (const year of [1899, 2000.5, '2000', null]) rejects(`source year rejects ${year}`, (d) => { d.sources.nasa.year = year; }, 'year must be a publication year');
for (const key of ['material_id', 'display_name']) rejects(`material requires ${key}`, (d) => { d.materials[0][key] = ''; }, 'needs non-empty "material_id" and "display_name"');
rejects('material must be object', (d) => { d.materials = [null]; }, 'needs non-empty "material_id" and "display_name"');
accepts('unique materials and empty aliases', (d) => { d.materials.push({ material_id: 'other', display_name: 'Other', aliases: [] }); });
rejects('duplicate material ids', (d) => { d.materials.push({ ...d.materials[0] }); }, 'duplicate material_id');
for (const aliases of [null, 'sample', [''], [' '], [1]]) rejects(`invalid aliases ${JSON.stringify(aliases)}`, (d) => { d.materials[0].aliases = aliases; }, '"aliases" must be an array of strings');

rejects('preset must be object', (d) => { d.cabin_presets = [null]; }, 'preset is not an object');
for (const key of ['preset_id', 'label', 'status', 'context', 'source_key', 'source_locator']) {
  accepts(`preset ${key}: non-empty string`);
  for (const bad of [undefined, '', ' ', null, 1]) rejects(`preset ${key} rejects ${JSON.stringify(bad)}`, (d) => { preset(d)[key] = bad; }, `"${key}" must be a non-empty string`);
}
for (const [key, valid, invalid, message] of [
  ['pressure_kpa', [0.1], [0, -1, '1', null, Infinity, NaN], '"pressure_kpa" must be a number > 0'],
  ['o2_pct', [0, 100], [-1, 101, '21', null, Infinity, NaN], '"o2_pct" must be a number in 0-100'],
]) {
  for (const value of valid) accepts(`preset ${key} accepts ${value}`, (d) => { preset(d)[key] = value; });
  for (const value of invalid) rejects(`preset ${key} rejects ${value}`, (d) => { preset(d)[key] = value; }, message);
}
rejects('preset source must resolve', (d) => { preset(d).source_key = 'missing'; }, 'source_key "missing" not in sources');
accepts('empty prebreathe allowed', (d) => { preset(d).prebreathe = []; });
rejects('prebreathe must be array', (d) => { preset(d).prebreathe = {}; }, '"prebreathe" must be an array');
rejects('prebreathe entry must be object', (d) => { preset(d).prebreathe = [null]; }, 'prebreathe[0] "minutes" must be a non-empty string');
for (const key of ['minutes', 'regime', 'kind', 'assumptions', 'source_key', 'source_locator']) {
  accepts(`prebreathe ${key}: non-empty string`);
  for (const bad of [undefined, '', ' ', null, 1]) rejects(`prebreathe ${key} rejects ${JSON.stringify(bad)}`, (d) => { preset(d).prebreathe[0][key] = bad; }, `prebreathe[0] "${key}" must be a non-empty string`);
}
rejects('prebreathe source must resolve', (d) => { preset(d).prebreathe[0].source_key = 'missing'; }, 'prebreathe[0] source_key "missing" not in sources');
accepts('unique preset ids', (d) => { d.cabin_presets.push({ ...preset(d), preset_id: 'preset-2' }); });
rejects('duplicate preset ids', (d) => { d.cabin_presets.push({ ...preset(d) }); }, 'duplicate preset_id');
