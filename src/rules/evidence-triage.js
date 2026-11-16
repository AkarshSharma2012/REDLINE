// Evidence triage (#321, B1 takeover). Pure ES module: no DOM, network, time or randomness.
// For each BOM line, lists candidate evidence rows with exact source, the compare.js heuristic
// grade, and which requested/source conditions are unknown or differ. Research-review readiness
// only: never a burn prediction, certification or safety assessment. Missing stays unknown.
import { compareRow, SPREAD_ENDPOINTS } from './compare.js';

export const TRIAGE_FIELDS = Object.freeze(['form', 'thickness_mm', 'width_mm', 'o2_pct', 'pressure_kpa',
  'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2', 'endpoint']);
const CONDITION_KEYS = ['o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2'];
const STRING_FIELDS = ['form', 'flow_direction'];
const WIDTH_EXEMPT = ['rod', 'wire'];
const LABEL = { form: 'form', thickness_mm: 'thickness (mm)', width_mm: 'width (mm)', o2_pct: 'oxygen (%)', pressure_kpa: 'pressure (kPa)',
  flow_speed_cm_s: 'flow speed (cm/s)', flow_direction: 'flow direction', gravity_g: 'gravity (g)',
  external_heat_flux_kw_m2: 'external heat flux (kW/m2)', endpoint: 'endpoint' };

const LIMITATIONS = Object.freeze([
  'Research-review triage only: not a burn prediction, certification, safety assessment or recommendation.',
  'REVIEW_READY means a verified row whose stated conditions all match the request, ready for bounded exact-context source review; it does not mean safe.',
  'Compare grades come from heuristic research rules (compare.js), not a scientific validity gate. Oxygen has no standalone compare rule, so triage compares it directly.',
  'Unknown requested or source conditions stay unknown; no missing value, including heat flux, is treated as 0.',
  'Materials match by exact material_id only; no alias mapping. Candidates come from the loaded sources only, not all published literature.',
  'Summary counts are per candidate occurrence across BOM lines: a row matched on two lines counts twice. verified_count counts verified rows; review_ready_count counts review-ready candidates.',
]);

function fail(path, msg) { throw new TypeError(`${path} ${msg}`); }
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function number(v, path, { positive = false } = {}) {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(path, 'must be a finite number or null');
  if (positive && v <= 0) fail(path, 'must be greater than 0 or null');
  if (v < 0) fail(path, 'must not be negative');
  return v;
}
function text(v, path) {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') fail(path, 'must be a string or null');
  return v.trim() === '' ? null : v;
}

function normalizeConditions(c) {
  if (c !== undefined && !isObj(c)) fail('query.conditions', 'must be an object');
  const src = c ?? {};
  const out = {};
  for (const k of CONDITION_KEYS) out[k] = STRING_FIELDS.includes(k) ? text(src[k], `query.conditions.${k}`) : number(src[k], `query.conditions.${k}`);
  return out;
}

function normalizeMaterial(m, i) {
  const p = `query.materials[${i}]`;
  if (!isObj(m)) fail(p, 'must be an object');
  if (typeof m.material_id !== 'string' || !m.material_id.trim()) fail(`${p}.material_id`, 'must be a non-empty string');
  const out = { material_id: m.material_id, form: text(m.form, `${p}.form`),
    thickness_mm: number(m.thickness_mm, `${p}.thickness_mm`, { positive: true }),
    width_mm: number(m.width_mm, `${p}.width_mm`, { positive: true }) };
  const name = text(m.name, `${p}.name`);
  return { material: out, name };
}

const present = (v) => v !== null && v !== undefined && v !== '';
const same = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) : a === b);

function sourceOf(row, sources) {
  const reg = isObj(sources) && typeof row.source_key === 'string' && isObj(sources[row.source_key]) ? sources[row.source_key] : {};
  const pick = (...vs) => vs.find((v) => typeof v === 'string' && v.trim()) ?? null;
  return {
    title: pick(row.observation_source_title, row.condition_source_title, row.source_title, reg.title, row.source_key) ?? 'Untitled source',
    url: pick(row.observation_source_url, row.condition_source_url, row.source_url, reg.url),
    locator: pick(row.observation_source_locator, row.source_locator, row.condition_source_locator),
  };
}

// Field-by-field gaps. Request endpoint is implied: a cabin question asks about flame spread.
function gaps(request, row) {
  const missing = [];
  const conflicts = [];
  for (const k of TRIAGE_FIELDS) {
    if (k === 'endpoint') {
      if (!present(row.endpoint)) missing.push('source.endpoint');
      else if (!SPREAD_ENDPOINTS.includes(row.endpoint)) conflicts.push('endpoint');
      continue;
    }
    if (k === 'width_mm' && WIDTH_EXEMPT.includes(row.form)) continue; // not applicable, explicit in rule W
    const q = request[k];
    const r = row[k];
    if (!present(q)) missing.push(`request.${k}`);
    else if (!present(r)) missing.push(`source.${k}`);
    else if (!same(q, r)) conflicts.push(k);
  }
  return { missing, conflicts };
}

function fmt(v) { return present(v) ? String(v) : 'not stated'; }

// Ordered research steps: supply query fields, gravity mismatch, other conflicts, source gaps, human check.
function nextActions(item, materialId) {
  const cands = item.candidates;
  if (!cands.length) {
    return [{ kind: 'search_sources', field: null, evidence_ids: [],
      message: `No record for material "${materialId}" in the loaded sources. Search the PSI Data Repository and NTRS for tests of this material at the requested conditions.` }];
  }
  const actions = [];
  const ids = (pred) => cands.filter(pred).map((c) => c.evidence_id);
  for (const k of TRIAGE_FIELDS) {
    const hit = ids((c) => c.missing_fields.includes(`request.${k}`));
    if (hit.length) actions.push({ kind: 'supply_query_field', field: k, evidence_ids: hit,
      message: `Specify the requested ${LABEL[k]} for this line; ${hit.length} candidate record${hit.length === 1 ? '' : 's'} cannot be compared on it until you do.` });
  }
  const g = ids((c) => c.conflicts.includes('gravity_g'));
  if (g.length) {
    const tested = [...new Set(g.map((id) => `${fmt(item.rows.get(id)?.gravity_g)} g`))].join(' or ');
    actions.push({ kind: 'investigate_gravity_mismatch', field: 'gravity_g', evidence_ids: g,
      message: `Investigate the gravity mismatch: requested ${fmt(item.request.gravity_g)} g vs tested ${tested} in ${g.length} record${g.length === 1 ? '' : 's'}. Partial gravity has no direct data in these sources; results can only bound it between 0 g and 1 g.` });
  }
  for (const k of TRIAGE_FIELDS.filter((f) => f !== 'gravity_g')) {
    const hit = ids((c) => c.conflicts.includes(k));
    if (hit.length) actions.push({ kind: 'inspect_source_condition', field: k, evidence_ids: hit,
      message: k === 'endpoint'
        ? `${hit.length} record${hit.length === 1 ? ' reports' : 's report'} a non-spread endpoint; check in the cited source whether it answers a flame-spread question.`
        : `Requested ${LABEL[k]} ${fmt(item.request[k])} differs from the tested value in ${hit.length} record${hit.length === 1 ? '' : 's'}; confirm the tested condition at the cited locator.` });
  }
  for (const k of TRIAGE_FIELDS) {
    const hit = ids((c) => c.missing_fields.includes(`source.${k}`));
    if (hit.length) actions.push({ kind: 'inspect_source_condition', field: k, evidence_ids: hit,
      message: `${hit.length} record${hit.length === 1 ? ' does' : 's do'} not state ${LABEL[k]} in the dataset; check the cited source locator for it.` });
  }
  const drafts = ids((c) => c.review_status !== 'verified');
  if (drafts.length) actions.push({ kind: 'request_human_source_check', field: null, evidence_ids: drafts,
    message: `${drafts.length} draft record${drafts.length === 1 ? ' needs' : 's need'} a human check against the cited source before any review use.` });
  return actions;
}

/**
 * buildEvidenceTriage(cabinQuery, dataset) -> triage contract v1 (#321).
 * cabinQuery: { conditions: {...}, materials: [{ material_id, form, thickness_mm, width_mm, name? }] }
 * dataset: loaded evidence.json ({ evidence: [...], sources?, materials? }). Inputs are never mutated.
 */
export function buildEvidenceTriage(cabinQuery, dataset) {
  if (!isObj(cabinQuery)) fail('query', 'must be an object');
  if (!Array.isArray(cabinQuery.materials)) fail('query.materials', 'must be an array');
  if (!isObj(dataset) || !Array.isArray(dataset.evidence)) throw new TypeError('evidence dataset unavailable or malformed');
  const conditions = normalizeConditions(cabinQuery.conditions);
  const lines = cabinQuery.materials.map(normalizeMaterial);
  const registry = new Map((Array.isArray(dataset.materials) ? dataset.materials : []).filter(isObj).map((m) => [m.material_id, m]));
  const rows = dataset.evidence.filter((r) => isObj(r) && typeof r.evidence_id === 'string' && typeof r.material_id === 'string');

  const items = lines.map(({ material, name }, i) => {
    const request = { ...conditions, ...material };
    const reg = registry.get(material.material_id);
    // Registry names let compare.js's material rule recognise the same material by name.
    const query = { ...request, display_name: reg?.display_name ?? null, aliases: Array.isArray(reg?.aliases) ? [...reg.aliases] : [] };
    const matched = rows.filter((r) => r.material_id === material.material_id);
    const candidates = matched.map((row) => {
      const { grade, rules } = compareRow(query, row);
      const { missing, conflicts } = gaps(request, row);
      const review_status = typeof row.review_status === 'string' ? row.review_status : 'unknown';
      return { evidence_id: row.evidence_id, review_status, source: sourceOf(row, dataset.sources),
        grade, rules: rules.map((r) => ({ rule: r.rule, grade: r.grade, why: r.why })),
        missing_fields: missing, conflicts,
        review_ready: review_status === 'verified' && grade === 'OK' && !missing.length && !conflicts.length };
    });
    const status = !candidates.length ? 'NO_CANDIDATES' : candidates.some((c) => c.review_ready) ? 'REVIEW_READY' : 'REVIEW_REQUIRED';
    const item = { line_id: `line-${i + 1}`, material_id: material.material_id, name: name ?? reg?.display_name ?? material.material_id,
      request, status, candidates };
    item.next_actions = nextActions({ ...item, rows: new Map(matched.map((r) => [r.evidence_id, r])) }, material.material_id);
    return item;
  });

  const all = items.flatMap((it) => it.candidates);
  const limitations = [...LIMITATIONS];
  if (!lines.length) limitations.push('No BOM lines were supplied, so no evidence was triaged.');
  if (!rows.length) limitations.push('The loaded dataset contains 0 evidence rows; every line reports no candidates.');
  return {
    version: 1,
    conditions,
    items,
    summary: { line_count: items.length, candidate_count: all.length,
      verified_count: all.filter((c) => c.review_status === 'verified').length,
      review_ready_count: all.filter((c) => c.review_ready).length },
    limitations,
  };
}
