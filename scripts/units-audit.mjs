import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Review heuristics, not experimentally established limits or engine thresholds.
export const AUDIT_LIMITS = Object.freeze({
  psiaLikeMin: 5, psiaLikeMax: 20,
  thicknessMin: 0.001, thicknessMax: 100,
  positiveFlowMin: 0.01, flowMax: 1000,
});
const fields = ['o2_pct', 'pressure_kpa', 'gravity_g', 'thickness_mm', 'flow_speed_cm_s'];

/** Audit S1 evidence and cabin presets without changing or converting values. */
export function auditUnits(data) {
  if (!data || !Array.isArray(data.evidence)) throw new TypeError('Expected an S1 evidence array');
  if (data.cabin_presets !== undefined && !Array.isArray(data.cabin_presets)) {
    throw new TypeError('Expected cabin_presets to be an array');
  }
  const findings = [];
  for (const collection of ['evidence', 'cabin_presets']) {
    for (const [index, row] of (data[collection] ?? []).entries()) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new TypeError(`Invalid ${collection}[${index}]`);
      for (const field of fields) {
        const value = row[field];
        if (value === null || value === undefined) continue;
        const add = (severity, code, message) => findings.push({
          collection, index, id: row.evidence_id ?? row.preset_id ?? row.id ?? null,
          field, value, severity, code, message,
          source_url: row.source_url ?? data.sources?.[row.source_key]?.url ?? null,
          source_locator: row.source_locator ?? null,
        });
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          add('error', 'INVALID_NUMBER', 'Expected a finite number in the field’s named unit.');
          continue;
        }
        if (field === 'o2_pct' && (value < 0 || value > 100)) {
          add('error', 'O2_RANGE', 'O2 must be between 0 and 100 percent inclusive.');
        } else if (field === 'gravity_g' && (value < 0 || value > 1.1)) {
          add('error', 'GRAVITY_RANGE', 'Gravity is outside the audit range 0–1.1 g.');
        } else if (field === 'pressure_kpa') {
          if (value <= 0) add('error', 'PRESSURE_RANGE', 'Pressure must be positive in kPa.');
          else if (value >= AUDIT_LIMITS.psiaLikeMin && value <= AUDIT_LIMITS.psiaLikeMax) {
            add('warning', 'PRESSURE_PSIA_LIKE', 'Value resembles a cabin pressure in psia; check the source unit before converting. Low kPa pressure may be intentional.');
          }
        } else if (field === 'thickness_mm') {
          if (value <= 0) add('error', 'THICKNESS_RANGE', 'Thickness must be positive in mm.');
          else if (value < AUDIT_LIMITS.thicknessMin || value > AUDIT_LIMITS.thicknessMax) {
            add('warning', 'THICKNESS_MAGNITUDE', 'Unusual thickness magnitude in mm; check for m or micrometre transcription.');
          }
        } else if (field === 'flow_speed_cm_s') {
          if (value < 0) add('error', 'FLOW_RANGE', 'Flow speed must be nonnegative in cm/s.');
          else if ((value > 0 && value < AUDIT_LIMITS.positiveFlowMin) || value > AUDIT_LIMITS.flowMax) {
            add('warning', 'FLOW_MAGNITUDE', 'Unusual flow magnitude in cm/s; check the original unit.');
          }
        }
      }
    }
  }
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node scripts/units-audit.mjs [evidence.json]');
    const input = process.argv[2] ?? new URL('../data/evidence.json', import.meta.url);
    const findings = auditUnits(JSON.parse(await readFile(input, 'utf8')));
    console.log(JSON.stringify({ findings, errors: findings.filter(f => f.severity === 'error').length,
      warnings: findings.filter(f => f.severity === 'warning').length }, null, 2));
    if (findings.length) process.exitCode = 1;
  } catch (error) {
    console.error(`Units audit failed: ${error.message}`);
    process.exitCode = 2;
  }
}
