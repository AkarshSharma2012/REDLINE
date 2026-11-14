// Checks evidence.json against S1 §4 (validator rules §4.3). Pure, no DOM.
// Amendments in force: S4 §9 / V2 C3 (verified rows may have null pressure_kpa),
// V2 C1 (endpoint codes MOC, ULOI, extinction-5s), V2 C6 (`reviewed` is excluded like `draft`).

// Evidence row fields in CSV column order. type: 'string' | 'number'; nullable: empty -> null.
export const FIELDS = [
  ['evidence_id', 'string', false],
  ['material', 'string', false],
  ['material_id', 'string', false],
  ['form', 'string', false],
  ['thickness_mm', 'number', true],
  ['width_mm', 'number', true],
  ['flow_speed_cm_s', 'number', true],
  ['flow_direction', 'string', false],
  ['o2_pct', 'number', true],
  ['pressure_kpa', 'number', true],
  ['gravity_g', 'number', false],
  ['facility', 'string', false],
  ['endpoint', 'string', true],
  ['value', 'number', true],
  ['value_unit', 'string', true],
  ['outcome', 'string', true],
  ['uncertainty', 'string', false],
  ['run_id', 'string', false],
  ['source_key', 'string', false],
  ['source_locator', 'string', false],
  // S1 says number, 0 if none; V1 says an absent flux is unknown, not zero, so null is allowed.
  ['external_heat_flux_kw_m2', 'number', true],
  ['limit_approach', 'string', true],
  ['pass_criterion', 'string', true],
  ['test_duration_s', 'number', true],
  ['notes', 'string', true],
  ['holdout_group', 'string', false],
  ['review_status', 'string', false],
  ['verified_by', 'string', true],
].map(([key, type, nullable]) => ({ key, type, nullable }));

// Optional free-text provenance keys: R2's list (S1 §4.2) plus the R3/R4 extras kept by B2.
export const PROVENANCE_KEYS = [
  'investigation', 'pi', 'as_run_number', 'sample_id', 'date_source', 'material_source',
  'gravity_regime', 'flow_configuration', 'flow_restrictor_source', 'fan_display_source',
  'air_display_source', 'o2_initial_calibrated_vol_pct', 'o2_final_calibrated_vol_pct',
  'observation_paraphrase', 'condition_source_title', 'condition_source_url',
  'condition_source_locator', 'observation_source_title', 'observation_source_url',
  'observation_source_locator', 'caveat',
  'source_keys_research', 'source_title', 'source_url', 'endpoint_source', 'gravity_source',
  'gravity_context', 'pressure_psia', 'extraction_method', 'evidence_kind', 'value_qualifier',
  'research_status',
];

export const ENUMS = {
  form: ['sheet', 'rod', 'fabric', 'tape', 'wire', 'slab', 'foam', 'other'],
  flow_direction: ['opposed', 'concurrent', 'quiescent', 'upward-buoyant'],
  facility: ['ISS', 'free-flyer', 'drop-tower', 'aircraft', 'ground'],
  endpoint: ['LOC-FS', 'LOC-FR', 'quench-limit', 'blowoff-limit', 'MOC-T1', 'LOI-D2863',
    'ignition', 'spread-rate', 'burn/no-burn', 'MOC', 'ULOI', 'extinction-5s'],
  value_unit: ['% O2', 'kPa O2', 'cm/s', 'mm/s', 'pass/fail'],
  outcome: ['spread', 'no-spread', 'quenched', 'blowoff', 'no-ignition', 'consumed'],
  limit_approach: ['lower-flow', 'raise-flow', 'lower-o2', 'fixed'],
  review_status: ['draft', 'reviewed', 'verified'],
};

const RANGES = {
  thickness_mm: (v) => v > 0,
  width_mm: (v) => v > 0,
  flow_speed_cm_s: (v) => v >= 0,
  o2_pct: (v) => v >= 0 && v <= 100,
  pressure_kpa: (v) => v > 0,
  gravity_g: (v) => v >= 0,
  external_heat_flux_kw_m2: (v) => v >= 0,
  test_duration_s: (v) => v > 0,
};

const FIELD_KEYS = new Set(FIELDS.map((f) => f.key));
const PROV_KEYS = new Set(PROVENANCE_KEYS);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';
const nasaUrl = (v) => {
  try { const u = new URL(v); return u.protocol === 'https:' && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov') || u.hostname === 'taskbook.nasaprs.com'); }
  catch { return false; }
};

function checkRow(row, i, ctx, errors) {
  const id = isObj(row) && nonEmpty(row.evidence_id) ? row.evidence_id : `#${i}`;
  const err = (msg) => errors.push(`evidence[${id}]: ${msg}`);
  if (!isObj(row)) { err('row is not an object'); return; }

  // Rule 1: required keys, types, enums, ranges; no unknown keys.
  for (const { key, type, nullable } of FIELDS) {
    if (!(key in row)) {
      if (nullable && !['endpoint', 'value', 'value_unit', 'outcome', 'thickness_mm', 'width_mm',
        'flow_speed_cm_s', 'o2_pct', 'pressure_kpa', 'external_heat_flux_kw_m2'].includes(key)) continue;
      err(`missing required key "${key}"`);
      continue;
    }
    const v = row[key];
    if (v === null) { if (!nullable) err(`"${key}" must not be null`); continue; }
    if (type === 'number' && (typeof v !== 'number' || !Number.isFinite(v))) { err(`"${key}" must be a number, got ${JSON.stringify(v)}`); continue; }
    if (type === 'string' && typeof v !== 'string') { err(`"${key}" must be a string`); continue; }
    if (type === 'string' && !nullable && !nonEmpty(v)) { err(`"${key}" must not be empty`); continue; }
    if (ENUMS[key] && !ENUMS[key].includes(v)) err(`"${key}" value "${v}" not in [${ENUMS[key].join(', ')}]`);
    if (RANGES[key] && !RANGES[key](v)) err(`"${key}" value ${v} out of range`);
  }
  for (const key of Object.keys(row)) {
    if (FIELD_KEYS.has(key)) continue;
    if (!PROV_KEYS.has(key)) err(`unknown key "${key}"`);
    else if (row[key] !== null && typeof row[key] !== 'string') err(`provenance "${key}" must be a string or null`);
  }

  // Rule 2: unique id; keys resolve.
  if (nonEmpty(row.evidence_id)) {
    if (ctx.ids.has(row.evidence_id)) err('duplicate evidence_id');
    ctx.ids.add(row.evidence_id);
  }
  if (nonEmpty(row.source_key) && !ctx.sources.has(row.source_key)) err(`source_key "${row.source_key}" not in sources`);
  if (nonEmpty(row.material_id) && !ctx.materials.has(row.material_id)) err(`material_id "${row.material_id}" not in materials`);

  // Rule 3 (source_locator, uncertainty non-empty) is enforced by rule 1: both are non-nullable strings.

  // Rule 4: a verified row must be able to support a label. pressure_kpa may be null (S4 §9).
  if (row.review_status === 'verified') {
    for (const key of ['endpoint', 'o2_pct']) if (row[key] === null || row[key] === undefined) err(`verified row needs "${key}"`);
    if ((row.value ?? null) === null && (row.outcome ?? null) === null) err('verified row needs "value" or "outcome"');
  }
  // Rule 5.
  if ((row.value ?? null) !== null && (row.value_unit ?? null) === null) err('"value" is set but "value_unit" is empty');
  // Rule 6.
  if (row.endpoint === 'burn/no-burn' && (row.outcome ?? null) === null) err('endpoint "burn/no-burn" requires "outcome"');
}

function checkPreset(p, i, ctx, errors) {
  const id = isObj(p) && nonEmpty(p.preset_id) ? p.preset_id : `#${i}`;
  const err = (msg) => errors.push(`cabin_presets[${id}]: ${msg}`);
  if (!isObj(p)) { err('preset is not an object'); return; }
  for (const key of ['preset_id', 'label', 'status', 'context', 'source_key', 'source_locator']) {
    if (!nonEmpty(p[key])) err(`"${key}" must be a non-empty string`);
  }
  if (!Number.isFinite(p.pressure_kpa) || !(p.pressure_kpa > 0)) err('"pressure_kpa" must be a number > 0');
  if (typeof p.o2_pct !== 'number' || !(p.o2_pct >= 0 && p.o2_pct <= 100)) err('"o2_pct" must be a number in 0-100');
  if (nonEmpty(p.source_key) && !ctx.sources.has(p.source_key)) err(`source_key "${p.source_key}" not in sources`);
  if (!Array.isArray(p.prebreathe)) { err('"prebreathe" must be an array'); return; }
  p.prebreathe.forEach((b, j) => {
    for (const key of ['minutes', 'regime', 'kind', 'assumptions', 'source_key', 'source_locator']) {
      if (!isObj(b) || !nonEmpty(b[key])) err(`prebreathe[${j}] "${key}" must be a non-empty string`);
    }
    if (isObj(b) && nonEmpty(b.source_key) && !ctx.sources.has(b.source_key)) err(`prebreathe[${j}] source_key "${b.source_key}" not in sources`);
  });
}

// validateEvidence(data) -> { ok: boolean, errors: [string] }
export function validateEvidence(data) {
  const errors = [];
  if (!isObj(data)) return { ok: false, errors: ['top level must be an object'] };
  for (const key of ['schema_version', 'built_at', 'built_from']) {
    if (!nonEmpty(data[key])) errors.push(`top level "${key}" must be a non-empty string`);
  }
  if (!isObj(data.sources)) errors.push('top level "sources" must be an object');
  for (const key of ['materials', 'evidence', 'cabin_presets']) {
    if (!Array.isArray(data[key])) errors.push(`top level "${key}" must be an array`);
  }
  if (errors.length) return { ok: false, errors };
  if (data.schema_version !== '1.0.0') errors.push('unsupported schema_version');
  if (!/^\d{4}-\d\d-\d\dT/.test(data.built_at) || !Number.isFinite(Date.parse(data.built_at))) errors.push('built_at must be an ISO timestamp');

  for (const [key, s] of Object.entries(data.sources)) {
    if (!isObj(s) || !nonEmpty(s.title) || !nonEmpty(s.url)) errors.push(`sources[${key}]: needs non-empty "title" and "url"`);
    if (isObj(s)) {
      if (!nasaUrl(s.url)) errors.push(`sources[${key}]: url must link to a NASA source`);
      if (typeof s.authors !== 'string') errors.push(`sources[${key}]: authors must be a string`);
      if (!Number.isInteger(s.year) || s.year < 1900) errors.push(`sources[${key}]: year must be a publication year`);
    }
  }
  const materials = new Set();
  data.materials.forEach((m, i) => {
    if (!isObj(m) || !nonEmpty(m.material_id) || !nonEmpty(m.display_name)) {
      errors.push(`materials[#${i}]: needs non-empty "material_id" and "display_name"`);
      return;
    }
    if (materials.has(m.material_id)) errors.push(`materials[${m.material_id}]: duplicate material_id`);
    if (!(Array.isArray(m.aliases) && m.aliases.every(nonEmpty))) {
      errors.push(`materials[${m.material_id}]: "aliases" must be an array of strings`);
    }
    materials.add(m.material_id);
  });

  const ctx = { ids: new Set(), sources: new Set(Object.keys(data.sources)), materials };
  data.evidence.forEach((row, i) => checkRow(row, i, ctx, errors));
  const presetIds = new Set();
  data.cabin_presets.forEach((p, i) => {
    checkPreset(p, i, ctx, errors);
    if (isObj(p)) {
      if (presetIds.has(p.preset_id)) errors.push(`duplicate preset_id ${p.preset_id}`);
      presetIds.add(p.preset_id);
    }
  });
  return { ok: errors.length === 0, errors };
}
