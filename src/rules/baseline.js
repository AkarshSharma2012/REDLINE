// R8 §5 naive name-only lookup, for the accuracy run only (S1 §3.1, S4 §5.5). Pure, no DOM.
// This is a project-designed comparison baseline, not a NASA method. It deliberately ignores
// form, thickness, width, flow, direction, pressure, gravity, facility, heat flux, endpoint and
// pass criterion, and it never refuses for incompatibility.

// R8 §5 step 1: words dropped after lowercasing. Synonyms are NOT merged ("teflon" != "ptfe").
export const BASELINE_DROP_WORDS = Object.freeze([
  'film', 'sheet', 'rod', 'fabric', 'wire', 'black', 'clear', 'cast', 'wide', 'thick',
]);
// Units dropped with the digits ("100 micron PMMA film 2 cm wide" -> "pmma").
export const BASELINE_DROP_UNITS = Object.freeze([
  'nm', 'um', 'µm', 'micron', 'microns', 'mm', 'cm', 'm', 'in', 'inch', 'inches',
  'kpa', 'pa', 'psi', 'psia', 'kw', 'w', 'g', 's', '%',
]);
// R8 §5 step 3: limit endpoints read as "burns at and above this value".
export const BASELINE_LIMIT_ENDPOINTS = Object.freeze(['LOC-FS', 'LOC-FR', 'LOI-D2863', 'MOC-T1']);
// R8 §5 step 4: NEAR band below b, in O2 percentage points.
export const BASELINE_NEAR_POINTS = 1;

const DROP = new Set([...BASELINE_DROP_WORDS, ...BASELINE_DROP_UNITS]);

// normalizeBaselineName("100 micron PMMA film 2 cm wide") -> "pmma"
export function normalizeBaselineName(name) {
  if (typeof name !== 'string') return '';
  const head = name.toLowerCase().split(/[,(]/)[0];
  return head
    .replace(/[0-9]+([.][0-9]+)?/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-/]+|[.\-/]+$/g, ''))
    .filter((w) => w && !DROP.has(w))
    .join(' ');
}

// The O2 at which a matched row says "burns", or null if the row sets no threshold.
function burnO2(row) {
  if (BASELINE_LIMIT_ENDPOINTS.includes(row.endpoint)) {
    if (Number.isFinite(row.value) && row.value_unit === '% O2') return row.value;
    if (Number.isFinite(row.o2_pct)) return row.o2_pct;
  }
  if (row.outcome === 'spread' && Number.isFinite(row.o2_pct)) return row.o2_pct;
  return null;
}

function result(label, reason, cited) {
  return { label, reason, cited, flags: [], flag_details: [], cross_gravity: false, estimate: null };
}

// baselineLabel(query, rows) -> same shape as labelMaterial, never NE-incompatible.
// Query name = display_name (S4 §5.5), falling back to material, then material_id.
export function baselineLabel(query, rows) {
  const name = normalizeBaselineName(query?.display_name ?? query?.material ?? query?.material_id);
  const matched = name ? (rows ?? []).filter((r) => normalizeBaselineName(r.material) === name) : [];
  if (!matched.length) return result('NOT_ESTABLISHED', 'NE-no-data', []);

  let setter = null;
  let b = Infinity;
  for (const row of matched) {
    const o2 = burnO2(row);
    if (o2 !== null && o2 < b) { b = o2; setter = row; }
  }
  // Matched rows but none sets a threshold: no burn found by this lookup; cite what matched.
  if (!setter) return result('NOT_ESTABLISHED', 'NE-no-burn', matched.map((r) => r.evidence_id));

  const o2 = query.o2_pct;
  const cited = [setter.evidence_id];
  if (Number.isFinite(o2) && o2 >= b) return result('BURNED', null, cited);
  if (Number.isFinite(o2) && o2 >= b - BASELINE_NEAR_POINTS) return result('NEAR', null, cited);
  return result('NOT_ESTABLISHED', 'NE-no-burn', cited);
}
