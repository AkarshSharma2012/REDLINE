// Labels, reason codes and the wording table (S1 §3.1-3.2, S4 §5-6). Pure, no DOM. Owner: B4.
import { EPS, num, o2PartialKpa, gravityClass, parseUncertainty } from './normalize.js';
import { compareRow } from './compare.js';
import { lunarLabel } from './lunar.js';

// "Close" band below a measured limit, in O2 percentage points (S4 §4.4).
// R1 inference awaiting science-lead review; change it here only.
export const NEAR_MARGIN_PP = 1.0;

// The only place UI strings come from (S4 §6). Keys are the label, or the reason code for NOT_ESTABLISHED.
export const WORDING = Object.freeze({
  BURNED: 'Burned in testing at these conditions',
  NEAR: 'Close to a measured limit',
  'NE-no-burn': 'No burning found in comparable tests at or below this oxygen level in the sources reviewed',
  'NE-incompatible': 'Not established: tests were found, but none is comparable to this cabin',
  'NE-no-data': 'Not found in the sources reviewed',
});
export const LUNAR_PREFIX = 'Estimate between 0 g and 1 g results:';
export const CROSS_GRAVITY_TAG = 'Cross-gravity comparison';

export function wordingFor(result) {
  return WORDING[result.reason ?? result.label];
}

const byId = (a, b) => (a.evidence_id < b.evidence_id ? -1 : a.evidence_id > b.evidence_id ? 1 : 0);

// Verified rows only, one per evidence_id, in evidence_id order so input order never matters.
function verifiedRows(rows) {
  const seen = new Set();
  const kept = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || row.review_status !== 'verified' || seen.has(row.evidence_id)) continue;
    seen.add(row.evidence_id);
    kept.push(row);
  }
  return kept.sort(byId);
}

// What one row can prove at the query's oxygen level (S4 §4.3): "BURNED", "NEAR" or null.
function support(query, row) {
  const o = num(query.o2_pct);
  if (o === null) return null;
  const rowO2 = num(row.o2_pct);
  if (row.endpoint === 'burn/no-burn') {
    return row.outcome === 'spread' && rowO2 !== null && rowO2 <= o + EPS ? 'BURNED' : null;
  }
  if (row.endpoint === 'spread-rate') {
    const spread = row.outcome === null || row.outcome === undefined || row.outcome === 'spread';
    return spread && rowO2 !== null && rowO2 <= o + EPS ? 'BURNED' : null;
  }
  if (row.endpoint !== 'LOC-FS') return null;
  const limit = num(row.value);
  if (limit === null) return null;
  if (row.value_unit === '% O2') {
    // Spread was observed at the limit value itself.
    if (limit <= o + EPS) return 'BURNED';
    // A stated error bar can widen the "close" band, never shrink it below NEAR_MARGIN_PP.
    const margin = Math.max(NEAR_MARGIN_PP, parseUncertainty(row.uncertainty) ?? 0);
    return limit - o <= margin + EPS ? 'NEAR' : null;
  }
  if (row.value_unit === 'kPa O2') {
    const pressure = num(query.pressure_kpa);
    const partial = o2PartialKpa(o, pressure);
    if (partial === null) return null;
    if (limit <= partial + EPS) return 'BURNED';
    return limit - partial <= NEAR_MARGIN_PP * pressure / 100 + EPS ? 'NEAR' : null;
  }
  return null;
}

function result(label, reason, graded, queryClass) {
  const flags = new Set();
  const flag_details = [];
  for (const { row, rules } of graded) {
    for (const { rule, grade, why } of rules) {
      if (grade === 'OK') continue;
      flags.add(rule);
      flag_details.push({ evidence_id: row.evidence_id, rule, grade, why });
    }
  }
  const out = {
    label,
    reason,
    cited: graded.map(({ row }) => row.evidence_id),
    flags: [...flags].sort(),
    flag_details,
    cross_gravity: graded.some(({ row }) => gravityClass(row.gravity_g) !== queryClass),
    estimate: null,
  };
  return { ...out, wording: wordingFor(out) };
}

// S4 §5.1: label one material against rows in the query's own gravity class.
export function labelSameGravity(query, rows) {
  const q = query ?? {};
  const queryClass = gravityClass(q.gravity_g);
  const mine = verifiedRows(rows).filter((row) => row.material_id === q.material_id);
  if (!mine.length) return result('NOT_ESTABLISHED', 'NE-no-data', [], queryClass);

  // Rule V context: reported quench speeds for this material in the row's own gravity class.
  const quench = mine.filter((row) => row.endpoint === 'quench-limit' && row.value_unit === 'cm/s' && num(row.value) !== null);
  const graded = mine.map((row) => {
    const rowClass = gravityClass(row.gravity_g);
    const ctx = { quench_speeds_cm_s: quench.filter((s) => gravityClass(s.gravity_g) === rowClass).map((s) => s.value) };
    const { grade, rules } = compareRow(q, row, ctx);
    return { row, grade, rules, nonOk: rules.filter((r) => r.grade !== 'OK').length };
  });

  const eligible = graded.filter((g) => g.grade !== 'INVALID' && gravityClass(g.row.gravity_g) === queryClass);
  if (!eligible.length) return result('NOT_ESTABLISHED', 'NE-incompatible', graded, queryClass);

  // S4 §5.3: fewest non-OK rules first, then evidence_id.
  eligible.sort((a, b) => a.nonOk - b.nonOk || byId(a.row, b.row));
  const burn = eligible.filter((g) => support(q, g.row) === 'BURNED');
  if (burn.length) return result('BURNED', null, burn, queryClass);
  const near = eligible.filter((g) => support(q, g.row) === 'NEAR');
  if (near.length) return result('NEAR', null, near, queryClass);
  return result('NOT_ESTABLISHED', 'NE-no-burn', eligible, queryClass);
}

// labelMaterial(query, rows) -> { label, reason, cited, flags, flag_details, cross_gravity, estimate, wording }
export function labelMaterial(query, rows) {
  // Lunar and other partial-gravity cabins are answered twice, with 0 g and with 1 g rows (S4 §5.4).
  if (gravityClass(query?.gravity_g) === 'partial') return lunarLabel(query, rows);
  return labelSameGravity(query, rows);
}

// labelCabin(cabinQuery, evidence) -> [ { material_id, ...labelMaterial result } ]
// cabinQuery shape (V2 U5): { conditions: {...}, materials: [{ material_id, form, thickness_mm, width_mm }] }
export function labelCabin(cabinQuery, evidence) {
  const rows = (Array.isArray(evidence?.evidence) ? evidence.evidence : [])
    .filter((row) => row?.review_status === 'verified');
  const registry = Array.isArray(evidence?.materials) ? evidence.materials : [];
  const lines = Array.isArray(cabinQuery?.materials) ? cabinQuery.materials : [];
  return lines.map((line) => {
    const m = line ?? {};
    // Rule M reads the material's display name and aliases from the evidence file's registry.
    const known = registry.find((entry) => entry?.material_id === m.material_id);
    const names = known ? { display_name: known.display_name, aliases: known.aliases } : {};
    const query = { ...cabinQuery.conditions, ...names, ...m };
    return {
      material_id: m.material_id,
      ...labelMaterial(query, rows.filter((row) => row.material_id === m.material_id)),
    };
  });
}
