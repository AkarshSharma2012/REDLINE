// Pure helpers for the evidence review cockpit (#323). No DOM. Reads the A2 triage
// contract (#321) and the loaded evidence rows; never grades, scores or predicts.
// "No gap listed" means triage listed no missing or conflicting field, not a match.

export const MATRIX_FIELDS = Object.freeze([
  { key: 'material_id', label: 'Material', rule: 'M' },
  { key: 'form', label: 'Form', rule: 'F' },
  { key: 'thickness_mm', label: 'Thickness', unit: 'mm', rule: 'T' },
  { key: 'width_mm', label: 'Width', unit: 'mm', rule: 'W' },
  { key: 'o2_pct', label: 'Oxygen', unit: '%', rule: null },
  { key: 'pressure_kpa', label: 'Pressure', unit: 'kPa', rule: 'P' },
  { key: 'flow_speed_cm_s', label: 'Flow speed', unit: 'cm/s', rule: 'V' },
  { key: 'flow_direction', label: 'Flow direction', rule: 'D' },
  { key: 'gravity_g', label: 'Gravity', unit: 'g', rule: 'G' },
  { key: 'external_heat_flux_kw_m2', label: 'External heat flux', unit: 'kW/m2', rule: 'H' },
  { key: 'endpoint', label: 'Endpoint', rule: 'E' },
]);

export const STATE_TEXT = Object.freeze({
  conflict: 'Conflict', unknown: 'Unknown', na: 'Not applicable', listed: 'No gap listed',
});

const KEYS = MATRIX_FIELDS.map((f) => f.key);
const WIDTH_EXEMPT = ['rod', 'wire'];

// 'source.pressure_kpa' -> { key: 'pressure_kpa', side: 'source' }; free text is matched by key.
export function parseFieldRef(entry) {
  if (typeof entry !== 'string') return null;
  const m = /^(request|source)\.(\w+)$/.exec(entry.trim());
  if (m && KEYS.includes(m[2])) return { key: m[2], side: m[1] };
  if (KEYS.includes(entry.trim())) return { key: entry.trim(), side: null };
  const key = [...KEYS].sort((a, b) => b.length - a.length).find((k) => entry.includes(k));
  return key ? { key, side: null, text: entry } : null;
}

export function formatValue(value, unit = '') {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? `${value}${unit ? ` ${unit}` : ''}` : null;
  return String(value);
}

export function rowIndex(evidence) {
  const map = new Map();
  for (const row of Array.isArray(evidence?.evidence) ? evidence.evidence : []) {
    if (row && typeof row.evidence_id === 'string') map.set(row.evidence_id, row);
  }
  return map;
}

// One row per condition: requested value, source value, triage state and the compare.js reason.
export function conditionMatrix(item, candidate, row) {
  const request = item?.request ?? {};
  const refs = (list) => (Array.isArray(list) ? list : []).map(parseFieldRef).filter(Boolean);
  const missing = refs(candidate?.missing_fields);
  const conflicts = refs(candidate?.conflicts);
  const rules = Array.isArray(candidate?.rules) ? candidate.rules : [];
  return MATRIX_FIELDS.map((field) => {
    const conflict = conflicts.find((r) => r.key === field.key);
    const gap = missing.find((r) => r.key === field.key);
    const rule = field.rule ? rules.find((r) => r?.rule === field.rule) : null;
    const sourceForm = row?.form ?? null;
    let state = 'listed';
    if (conflict) state = 'conflict';
    else if (gap) state = 'unknown';
    else if (field.key === 'width_mm' && WIDTH_EXEMPT.includes(sourceForm)) state = 'na';
    return {
      key: field.key,
      label: field.label,
      requested: formatValue(request[field.key], field.unit),
      source: formatValue(row?.[field.key], field.unit),
      state,
      side: gap?.side ?? conflict?.side ?? null,
      note: conflict?.text ?? gap?.text ?? null,
      grade: rule?.grade ?? null,
      why: typeof rule?.why === 'string' ? rule.why : null,
    };
  });
}

// Deep clone used for the pinned baseline: later edits can never reach it.
export function snapshot(value) {
  return value == null ? null : JSON.parse(JSON.stringify(value));
}

const candidateKey = (lineId, evidenceId) => `${lineId}\u0000${evidenceId}`;

// Condition-by-condition difference between a pinned triage and the current one.
// Lines are matched by line_id, candidates by evidence_id. Returns only real changes.
export function compareSnapshots(baseline, current, evidence) {
  if (!baseline || !current) return { conditions: [], lines: [], fields: [], counts: null };
  const rows = rowIndex(evidence);
  const conditions = [];
  for (const key of ['o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2']) {
    const field = MATRIX_FIELDS.find((f) => f.key === key);
    const before = baseline.conditions?.[key] ?? null;
    const after = current.conditions?.[key] ?? null;
    if (before !== after) conditions.push({ key, label: field.label, before: formatValue(before, field.unit), after: formatValue(after, field.unit) });
  }
  const baseLines = new Map((baseline.items ?? []).map((it) => [it.line_id, it]));
  const curLines = new Map((current.items ?? []).map((it) => [it.line_id, it]));
  const lines = [];
  for (const [id, it] of curLines) {
    const was = baseLines.get(id);
    if (!was) lines.push({ line_id: id, name: it.name, change: 'added', before: null, after: it.status });
    else if (was.status !== it.status || was.material_id !== it.material_id) {
      lines.push({ line_id: id, name: it.name, change: 'status', before: was.status, after: it.status });
    }
  }
  for (const [id, was] of baseLines) {
    if (!curLines.has(id)) lines.push({ line_id: id, name: was.name, change: 'removed', before: was.status, after: null });
  }
  const before = new Map();
  for (const it of baseline.items ?? []) {
    for (const c of it.candidates ?? []) {
      before.set(candidateKey(it.line_id, c.evidence_id), conditionMatrix(it, c, rows.get(c.evidence_id)));
    }
  }
  const fields = [];
  for (const it of current.items ?? []) {
    for (const c of it.candidates ?? []) {
      const was = before.get(candidateKey(it.line_id, c.evidence_id));
      if (!was) continue;
      const now = conditionMatrix(it, c, rows.get(c.evidence_id));
      now.forEach((cell, i) => {
        const old = was[i];
        if (old.state !== cell.state || old.requested !== cell.requested) {
          fields.push({ line_id: it.line_id, name: it.name, evidence_id: c.evidence_id, key: cell.key, label: cell.label,
            before: { state: old.state, requested: old.requested }, after: { state: cell.state, requested: cell.requested },
            source: cell.source, why: cell.why });
        }
      });
    }
  }
  const count = (t) => ({ ...t.summary });
  return { conditions, lines, fields, counts: { before: count(baseline), after: count(current) } };
}

// Changes that move a candidate further from or closer to the requested context come first.
const RANK = { conflict: 0, unknown: 1, na: 2, listed: 3 };
export function orderFieldChanges(fields) {
  return [...fields].sort((a, b) => (RANK[a.after.state] - RANK[b.after.state])
    || a.line_id.localeCompare(b.line_id) || a.evidence_id.localeCompare(b.evidence_id));
}

// Plain-language sentence for one field change. Describes research context only.
export function describeFieldChange(change) {
  const req = (v) => v ?? 'not specified';
  const src = change.source ?? 'not stated';
  const head = `${change.evidence_id} · ${change.label}`;
  const reqText = change.before.requested === change.after.requested ? `requested ${req(change.after.requested)}`
    : `requested ${req(change.before.requested)} → ${req(change.after.requested)}`;
  return `${head}: ${reqText} vs source ${src}; ${transition(change.before.state, change.after.state)}.`;
}

function transition(before, after) {
  if (before === after) return `still ${STATE_TEXT[after].toLowerCase()}`;
  if (after === 'conflict') return `${STATE_TEXT[before].toLowerCase()} → conflict, so it cannot support exact-context review`;
  if (after === 'unknown') return `${STATE_TEXT[before].toLowerCase()} → unknown, so it cannot support exact-context review`;
  return `${STATE_TEXT[before].toLowerCase()} → ${STATE_TEXT[after].toLowerCase()} (triage lists no gap; not a safety finding)`;
}

// Groups record changes that share field, transition, requested change and source value,
// so "18 records tested at 0 g became conflicts" reads as one line with exact IDs.
export function groupFieldChanges(fields) {
  const groups = new Map();
  for (const f of orderFieldChanges(fields)) {
    const k = [f.key, f.before.state, f.after.state, f.before.requested, f.after.requested, f.source].join(' ');
    if (!groups.has(k)) groups.set(k, { ...f, evidence_ids: [], lines: [] });
    const g = groups.get(k);
    if (!g.evidence_ids.includes(f.evidence_id)) g.evidence_ids.push(f.evidence_id);
    if (!g.lines.includes(f.line_id)) g.lines.push(f.line_id);
  }
  return [...groups.values()].map((g) => {
    const req = (v) => v ?? 'not specified';
    const reqText = g.before.requested === g.after.requested ? `requested ${req(g.after.requested)}`
      : `requested ${req(g.before.requested)} → ${req(g.after.requested)}`;
    const n = g.evidence_ids.length;
    const on = g.lines.length > 1 ? ` on ${g.lines.length} BOM lines` : '';
    return { ...g, text: `${g.label}: ${n} record${n === 1 ? '' : 's'}${on} with source ${g.source ?? 'not stated'} (${reqText}): ${transition(g.before.state, g.after.state)}.` };
  });
}

// Triage input from the cabin form: conditions + one line per BOM row, duplicates preserved.
export function triageQuery(cabinQuery, formState) {
  const names = Array.isArray(formState?.materials) ? formState.materials : [];
  return {
    conditions: { ...cabinQuery.conditions },
    materials: cabinQuery.materials.map((m, i) => {
      const name = typeof names[i]?.name === 'string' && names[i].name.trim() ? names[i].name.trim() : undefined;
      return name ? { ...m, name } : { ...m };
    }),
  };
}

export function safeFilename(name, ext) {
  const slug = String(name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `redline-brief-${slug || 'scenario'}.${ext}`;
}
