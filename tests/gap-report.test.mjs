import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildGapMatrix, renderGapReport } from '../scripts/gap-report.mjs';

// Synthetic S1 fixture kept inline because this issue owns only this test file.
function fixture() {
  const row = {
    evidence_id: 'fixture-1', material: 'Cotton', material_id: 'cotton', form: 'fabric',
    thickness_mm: null, width_mm: null, flow_speed_cm_s: null, flow_direction: 'opposed',
    o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0, facility: 'ISS', endpoint: 'burn/no-burn',
    value: null, value_unit: null, outcome: 'spread', uncertainty: 'not stated', run_id: 'fixture',
    source_key: 'NASA', source_locator: 'Synthetic fixture, not a scientific extraction',
    external_heat_flux_kw_m2: 0, holdout_group: 'fixture', review_status: 'verified',
  };
  return { schema_version: '1.0.0', built_at: '2026-11-14T00:00:00Z', built_from: 'synthetic',
    sources: { NASA: { title: 'NASA fixture link', url: 'https://ntrs.nasa.gov/citations/20130010991' } },
    materials: [{ material_id: 'cotton', display_name: 'Cotton' }, { material_id: 'absent', display_name: 'Absent | material' }],
    cabin_presets: [], evidence: [row,
      { ...row, evidence_id: 'draft', review_status: 'draft' },
      { ...row, evidence_id: 'lunar', gravity_g: 1 / 6, o2_pct: 26.5, pressure_kpa: 70.329 },
      { ...row, evidence_id: 'earth', gravity_g: 1, o2_pct: 21, pressure_kpa: 101.352 },
      { ...row, evidence_id: 'unknown', pressure_kpa: null },
      { ...row, evidence_id: 'mars', gravity_g: 0.38 },
      { ...row, evidence_id: 'wrong-oxygen', o2_pct: 33 },
    ] };
}

test('fixture counts all nine bins per material, preserves drafts, excludes unknown and mismatched conditions', () => {
  const data = fixture();
  const before = structuredClone(data);
  const matrix = buildGapMatrix(data);
  assert.deepEqual(matrix.materials[0].cells.map((a) => a.map((r) => r.length)), [[2, 0, 0], [0, 1, 0], [0, 0, 1]]);
  assert.ok(matrix.materials[1].cells.flat().every((rows) => rows.length === 0));
  assert.deepEqual(matrix.unmatched.map((r) => r.evidence_id), ['unknown', 'mars', 'wrong-oxygen']);
  assert.deepEqual(data, before);
});

test('report distinguishes verified coverage, marks empty cells, and cites rows with locators', () => {
  const report = renderGapReport(fixture());
  assert.match(report, /\[2 \/ 1\]\(#material-1\)/);
  assert.match(report, /Empty cells: \*\*15 of 18\*\*/);
  assert.match(report, /\*\*3 of 7\*\*/);
  assert.match(report, /Absent &#124; material/);
  assert.match(report, /https:\/\/ntrs.nasa.gov\/citations\/20130010991/);
  assert.match(report, /Synthetic fixture, not a scientific extraction/);
  assert.match(report, /simulated-lunar records, not lunar-surface measurements/);
  assert.equal(report, renderGapReport(fixture()));
  const data = fixture();
  data.evidence = [];
  assert.match(renderGapReport(data), /\*\*18 of 18\*\*/);
});

test('missing provenance and unknown materials fail explicitly', () => {
  const data = fixture();
  data.evidence[0].source_locator = '';
  assert.throws(() => renderGapReport(data), /Missing source URL or locator/);
  data.evidence[0].material_id = 'unknown';
  assert.throws(() => buildGapMatrix(data), /Unknown material_id/);
});

test('CLI reads a fixture and writes the report; invalid input fails without overwriting output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-gap-'));
  try {
    const input = join(dir, 'evidence.json');
    const output = join(dir, 'docs', 'report.md');
    await writeFile(input, JSON.stringify(fixture()));
    const script = new URL('../scripts/gap-report.mjs', import.meta.url);
    execFileSync(process.execPath, [fileURLToPath(script), input, output]);
    assert.equal(await readFile(output, 'utf8'), renderGapReport(fixture()));
    await writeFile(input, '{}');
    assert.throws(() => execFileSync(process.execPath, [fileURLToPath(script), input, output], { stdio: 'pipe' }));
    assert.equal(await readFile(output, 'utf8'), renderGapReport(fixture()));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
