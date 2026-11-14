import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateEvidence, FIELDS, ENUMS } from '../src/schema/validate.js';
import { parseCsv, toCsv } from '../src/schema/csv.js';
import { convertRows, buildEvidence } from '../scripts/build-evidence.mjs';

const artifact = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url)));
const csv = await readFile(new URL('../data/evidence.csv', import.meta.url), 'utf8');
// Synthetic verified fixture, deliberately separate from the published draft evidence.
function fixture() {
  const data = structuredClone(artifact);
  data.evidence = [{ ...data.evidence[0], evidence_id: 'SYNTHETIC-TEST', endpoint: 'LOC-FS', o2_pct: 20, pressure_kpa: null, value: 20, value_unit: '% O2', review_status: 'verified' }];
  return data;
}
test('published CSV and JSON agree; every imported row is source-linked draft evidence', () => {
  assert.deepEqual(validateEvidence(artifact), { ok: true, errors: [] });
  assert.deepEqual(convertRows(csv), artifact.evidence);
  assert.equal(artifact.evidence.length, 29);
  assert.ok(artifact.evidence.every((r) => r.review_status === 'draft' && r.source_locator.trim() && artifact.sources[r.source_key]));
  assert.ok(!artifact.evidence.some((r) => /-E0$|-E35$|-CF$|INTERCEPT|M25-FR|STABLE/.test(r.evidence_id)));
  assert.ok(!artifact.materials.find((m) => m.material_id === 'etfe').aliases.includes('Teflon'));
});
test('V1 preserves unknowns, oxygen provenance and the B16 discrepancy', () => {
  const rows = artifact.evidence.filter((r) => r.evidence_id.startsWith('PSI25-'));
  assert.equal(rows.length, 15);
  for (const r of rows) for (const key of ['endpoint', 'value', 'value_unit', 'o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'external_heat_flux_kw_m2', 'outcome']) assert.equal(r[key], null);
  assert.equal(rows.find((r) => r.evidence_id === 'PSI25-B14').o2_final_calibrated_vol_pct, null);
  const b16 = rows.find((r) => r.evidence_id === 'PSI25-B16');
  assert.match(b16.air_display_source, /0\.5 pot/);
  assert.match(b16.notes + b16.caveat, /discrepancy|conflict/i);
});
test('V2 lunar mappings retain distinct original endpoints and simulated gravity context', () => {
  const r = artifact.evidence.find((r) => r.evidence_id === 'OF12-NOMEX-L-MOCSTAR');
  assert.equal(r.gravity_g, 0.16); assert.equal(r.pressure_kpa, 101.3);
  assert.equal(r.endpoint, 'MOC'); assert.equal(r.endpoint_source, 'MOC*');
  assert.match(r.gravity_context, /centrifuge/);
  assert.equal(artifact.evidence.find((r) => r.evidence_id === 'U25-04-L').endpoint_source, 'smolder-extinction-5s');
});
test('verified fixture permits unknown pressure per S4/V2 C3', () => assert.equal(validateEvidence(fixture()).ok, true));
test('all required fields, enums and numeric types are enforced', () => {
  const optional = new Set(['limit_approach', 'pass_criterion', 'test_duration_s', 'notes', 'verified_by']);
  for (const { key } of FIELDS) {
    if (optional.has(key)) continue;
    const d = fixture(); delete d.evidence[0][key];
    assert.equal(validateEvidence(d).ok, false, key);
  }
  for (const key of Object.keys(ENUMS)) {
    const d = fixture(); d.evidence[0][key] = 'invalid-code';
    assert.equal(validateEvidence(d).ok, false, key);
  }
  for (const value of [NaN, Infinity, '20', -1, 101]) {
    const d = fixture(); d.evidence[0].o2_pct = value;
    assert.equal(validateEvidence(d).ok, false, String(value));
  }
});
test('invalid references, duplicate IDs, empty locators and verified incompleteness fail', () => {
  const changes = [d => d.evidence.push(structuredClone(d.evidence[0])), d => d.evidence[0].source_key = 'missing', d => d.evidence[0].material_id = 'missing', d => d.evidence[0].source_locator = ' ', d => d.evidence[0].uncertainty = '', d => d.evidence[0].endpoint = null, d => d.evidence[0].o2_pct = null, d => d.evidence[0].value = null, d => d.evidence[0].value_unit = null, d => d.evidence[0].endpoint = 'burn/no-burn', d => d.sources['BASS2-TM'].url = 'https://example.org/paper', d => d.materials[0].aliases = null, d => d.cabin_presets[0].pressure_kpa = Infinity, d => d.cabin_presets[0].prebreathe[0].source_locator = ''];
  for (const mutate of changes) { const d = fixture(); mutate(d); assert.equal(validateEvidence(d).ok, false, mutate.toString()); }
});
test('CSV supports BOM, escaped quotes, commas, CRLF and multiline provenance', () => {
  const rows = [{ a: 'line 1\nline 2, "quoted"', b: '' }];
  assert.deepEqual(parseCsv('\uFEFF' + toCsv(['a', 'b'], rows).replaceAll('\n', '\r\n')), [{ a: 'line 1\r\nline 2, "quoted"', b: '' }]);
  for (const bad of ['a,a\n1,2', 'a,\n1,2', 'a,b\n1', 'a\n"open', 'a\n"closed"x', 'a\nbad"quote']) assert.throws(() => parseCsv(bad));
  for (const bad of [' ', '0x10', 'NaN', 'Infinity', '12cm']) assert.throws(() => convertRows(`o2_pct\n${bad}`));
});
test('build validates before replacing output and supports an explicit output path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-schema-'));
  try {
    const output = join(dir, 'evidence.json');
    const data = await buildEvidence({ output, builtAt: '2026-11-14T12:00:00Z' });
    assert.equal(data.evidence.length, 29);
    const before = await readFile(output, 'utf8');
    const input = join(dir, 'invalid.csv');
    await writeFile(input, csv.replace('"draft"', '"invalid-status"'));
    await assert.rejects(buildEvidence({ input, output }), /validation failed/);
    assert.equal(await readFile(output, 'utf8'), before);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
