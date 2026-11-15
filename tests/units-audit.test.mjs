import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditUnits } from '../scripts/units-audit.mjs';

// Synthetic S1-shaped conditions; no experimental findings are asserted.
const dataset = row => ({ sources: { TEST: { url: 'https://psi.nasa.gov/' } },
  evidence: [{ evidence_id: 'SYNTHETIC', source_key: 'TEST', source_locator: 'synthetic test', ...row }] });

test('valid boundaries, unknowns and zero flow pass without mutation', () => {
  for (const row of [
    { o2_pct: 0, pressure_kpa: 56.5, gravity_g: 0, thickness_mm: 0.001, flow_speed_cm_s: 0 },
    { o2_pct: 100, pressure_kpa: 101.3, gravity_g: 1.1, thickness_mm: 100, flow_speed_cm_s: 1000 },
    { o2_pct: null, gravity_g: 0.16, thickness_mm: null, flow_speed_cm_s: 0.01 },
  ]) {
    const data = dataset(row), before = structuredClone(data);
    assert.deepEqual(auditUnits(data), []);
    assert.deepEqual(data, before);
  }
});

test('out-of-range values are errors with provenance and location', () => {
  const findings = auditUnits(dataset({ o2_pct: 101, pressure_kpa: 0, gravity_g: -0.1, thickness_mm: 0, flow_speed_cm_s: -1 }));
  assert.deepEqual(findings.map(f => f.code), ['O2_RANGE', 'PRESSURE_RANGE', 'GRAVITY_RANGE', 'THICKNESS_RANGE', 'FLOW_RANGE']);
  for (const finding of findings) {
    assert.equal(finding.severity, 'error');
    assert.equal(finding.source_url, 'https://psi.nasa.gov/');
    assert.equal(finding.source_locator, 'synthetic test');
    assert.equal(finding.id, 'SYNTHETIC');
    assert.equal(finding.index, 0);
  }
  assert.equal(auditUnits(dataset({ o2_pct: -1, gravity_g: 1.1001 })).length, 2);
});

test('suspected unit mistakes are review warnings at documented thresholds', () => {
  for (const pressure of [5, 8.2, 10.2, 14.7, 20]) {
    assert.equal(auditUnits(dataset({ pressure_kpa: pressure }))[0].code, 'PRESSURE_PSIA_LIKE');
  }
  for (const thickness of [0.0003, 101]) {
    assert.equal(auditUnits(dataset({ thickness_mm: thickness }))[0].code, 'THICKNESS_MAGNITUDE');
  }
  for (const flow of [0.001, 1001]) {
    assert.equal(auditUnits(dataset({ flow_speed_cm_s: flow }))[0].code, 'FLOW_MAGNITUDE');
  }
  assert.deepEqual(auditUnits(dataset({ pressure_kpa: 20.01 })), []);
});

test('invalid numeric types do not silently coerce; malformed input fails', () => {
  for (const value of ['21', '', false, NaN, Infinity, {}, []]) {
    assert.equal(auditUnits(dataset({ o2_pct: value }))[0].code, 'INVALID_NUMBER');
  }
  for (const data of [null, {}, { evidence: [null] }, { evidence: [], cabin_presets: {} }]) {
    assert.throws(() => auditUnits(data), TypeError);
  }
});

test('presets are audited and absent provenance remains explicit', () => {
  const findings = auditUnits({ evidence: [], cabin_presets: [{ preset_id: 'test', pressure_kpa: 14.7 }] });
  assert.equal(findings[0].collection, 'cabin_presets');
  assert.equal(findings[0].id, 'test');
  assert.equal(findings[0].source_url, null);
});

test('CLI reports JSON and distinguishes clean, flagged and malformed input', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redline-units-'));
  try {
    const file = join(dir, 'input.json');
    for (const [contents, status] of [[JSON.stringify(dataset({ o2_pct: 21 })), 0],
      [JSON.stringify(dataset({ pressure_kpa: 14.7 })), 1], ['{', 2], ['{}', 2]]) {
      writeFileSync(file, contents);
      const result = spawnSync(process.execPath, ['scripts/units-audit.mjs', file], { encoding: 'utf8' });
      assert.equal(result.status, status, result.stderr);
      if (status < 2) assert.equal(JSON.parse(result.stdout).findings.length, status);
      else assert.match(result.stderr, /Units audit failed/);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
