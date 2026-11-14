// Turns NOT_ESTABLISHED results into suggested-experiment cards (S1 §5 B9). Pure, no DOM.

// suggestExperiments(results) -> [ { material_id, reason, missing: [field] } ]
export function suggestExperiments(results = [], { cabinQuery = {}, evidence = {} } = {}) {
  const groups = new Map();
  for (const result of results) {
    if (result.label !== 'NOT_ESTABLISHED' || !['NE-no-data', 'NE-incompatible'].includes(result.reason)) continue;
    const material = cabinQuery.materials?.find(m => m.material_id === result.material_id) ?? {};
    const conditions = { ...cabinQuery.conditions, ...material, ...result.query };
    delete conditions.material_id;
    const missing = fields.filter(field => conditions[field] == null);
    // A shared protocol is a planning group, not evidence that materials behave alike.
    const key = JSON.stringify(fields.map(field => conditions[field] ?? null));
    if (!groups.has(key)) groups.set(key, {
      material_id: result.material_id, material_ids: [], reason: result.reason, reasons: [],
      missing, conditions, hypothesis: 'REDLINE inference: does sustained flame spread occur for each listed specimen at the requested conditions?',
      facility: conditions.gravity_g === 0.16 ? {
        name: 'FM2 — candidate lunar facility context',
        note: 'REDLINE inference; not a scheduled or accepted experiment. The 2026 concept tests one fabric in four burns; compatibility requires review.',
        source_url: 'https://ntrs.nasa.gov/citations/20260001966', source_locator: 'PDF pp. 5–10',
      } : {
        name: 'Facility assignment not established',
        note: 'The reviewed future-facility context is FM2 on the lunar surface; no assignment is inferred for this gravity.',
        source_url: 'https://www.nasa.gov/flammability-of-materials-on-the-moon-fm2/', source_locator: 'Objectives; Approach and Hardware',
      },
      sources: Object.entries(evidence.sources ?? {}).filter(([, s]) => nasaURL(s.url)).map(([id, s]) => ({ id, ...s })),
      inventory: evidence.built_from ?? 'Source inventory version not provided',
    });
    const card = groups.get(key);
    if (!card.material_ids.includes(result.material_id)) card.material_ids.push(result.material_id);
    if (!card.reasons.includes(result.reason)) card.reasons.push(result.reason);
    card.dependency_count = card.material_ids.length;
  }
  return [...groups.values()].sort((a, b) => b.dependency_count - a.dependency_count || a.material_id.localeCompare(b.material_id));
}

export const fields = ['form', 'thickness_mm', 'width_mm', 'o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2'];

export function nasaURL(url) {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && (parsed.hostname === 'nasa.gov' || parsed.hostname.endsWith('.nasa.gov')); }
  catch { return false; }
}
