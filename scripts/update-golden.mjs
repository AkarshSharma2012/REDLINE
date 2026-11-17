// Regenerate intentionally after reviewing engine/data changes:
// node scripts/update-golden.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { labelMaterial } from '../src/rules/label.js';

export const evidenceUrl = new URL('../data/evidence.json', import.meta.url);
export const goldenUrl = new URL('../tests/fixtures/labels.golden.json', import.meta.url);
const queryFields = [
  'material_id', 'form', 'thickness_mm', 'width_mm', 'o2_pct',
  'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g',
  'external_heat_flux_kw_m2',
];

export function snapshotLabels(data) {
  if (!Array.isArray(data.evidence) || !data.evidence.length) {
    throw new Error('Expected nonempty data/evidence.json evidence array');
  }
  const snapshots = {};
  for (const row of [...data.evidence].sort((a, b) => a.evidence_id < b.evidence_id ? -1 : a.evidence_id > b.evidence_id ? 1 : 0)) {
    if (!row.evidence_id || Object.hasOwn(snapshots, row.evidence_id)) {
      throw new Error(`Missing or duplicate evidence_id: ${row.evidence_id}`);
    }
    // Preserve unknown conditions as null. Every row supplies a query, including
    // drafts; only verified evidence for its material can supply a label (S1).
    const query = Object.fromEntries(queryFields.map((key) => [key, row[key] ?? null]));
    const candidates = data.evidence.filter((candidate) =>
      candidate.material_id === row.material_id && candidate.review_status === 'verified');
    snapshots[row.evidence_id] = { query, result: labelMaterial(query, candidates) };
  }
  return snapshots;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const snapshots = snapshotLabels(JSON.parse(readFileSync(evidenceUrl, 'utf8')));
  writeFileSync(goldenUrl, `${JSON.stringify(snapshots, null, 2)}\n`);
  console.log(`Updated ${Object.keys(snapshots).length} label snapshots in ${goldenUrl.pathname}`);
}
