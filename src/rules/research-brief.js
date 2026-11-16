// Portable research brief and scenario change summary (issue #322).
// Pure ES module: no DOM, network or dependencies. Input is an A2 triage
// snapshot; output is a cloned, source-linked research handoff. It is not a
// risk model and makes no safety claim.

export const BOUNDARY = 'Not a safety assessment, recommendation, certification or prediction.';
export const PSI_REPOSITORY = 'https://psi.nasa.gov/';

const CONDITION_KEYS = ['o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2'];
const STATUSES = ['NO_CANDIDATES', 'REVIEW_REQUIRED', 'REVIEW_READY'];
const GRADES = ['OK', 'FLAG', 'INVALID'];
const MISSING = Symbol('missing');

const FIXED_LIMITATIONS = [
  BOUNDARY,
  'Requested conditions are research assumptions; source conditions are those reported by each cited NASA source and can differ from what was requested.',
  'Draft evidence rows are not verified and need review against the cited source before use.',
  'Changes describe research assumptions (requested conditions and BOM lines) and the resulting candidate evidence triage between two triage snapshots, not real-time spacecraft telemetry.',
  'Fewer flags, conflicts or missing fields is not a claim of lower fire risk; it only reflects how the cited evidence matches the requested assumptions.',
];
const PARTIAL_G_LIMITATION = 'Lunar or other partial gravity (between 0 g and 1 g) has no direct flammability data in the sources reviewed; behavior there can only be estimated as a range bounded by 0 g and 1 g results, not measured.';

// ---------- validation helpers ----------

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
function fail(path, msg) { throw new TypeError(`${path} ${msg}`); }
function str(v, path, { nullable = false, nonEmpty = false } = {}) {
  if (nullable && (v === null || v === undefined)) return null;
  if (typeof v !== 'string' || (nonEmpty && v.length === 0)) fail(path, `must be a ${nonEmpty ? 'non-empty ' : ''}string${nullable ? ' or null' : ''}`);
  return v;
}
function strArray(v, path) {
  if (!Array.isArray(v)) fail(path, 'must be an array of strings');
  return v.map((s, i) => str(s, `${path}[${i}]`));
}
function count(v, path) {
  if (!Number.isInteger(v) || v < 0) fail(path, 'must be a non-negative integer');
  return v;
}

// Deep clone of a JSON value; rejects anything JSON cannot round-trip.
function cloneJson(v, path, depth = 0) {
  if (depth > 32) fail(path, 'is nested too deeply');
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) fail(path, 'must be a finite number');
    return v === 0 ? 0 : v; // normalise -0
  }
  if (Array.isArray(v)) return v.map((x, i) => cloneJson(x, `${path}[${i}]`, depth + 1));
  if (isObj(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null)) {
    const out = {};
    for (const k of Object.keys(v)) out[k] = cloneJson(v[k], `${path}.${k}`, depth + 1);
    return out;
  }
  return fail(path, 'must be a JSON value (string, finite number, boolean, null, array or plain object)');
}

function validateConditions(c, path) {
  if (!isObj(c)) fail(path, 'must be an object');
  const out = cloneJson(c, path);
  for (const k of CONDITION_KEYS) {
    if (!(k in out)) continue;
    const v = out[k];
    if (k === 'flow_direction') { if (v !== null && typeof v !== 'string') fail(`${path}.${k}`, 'must be a string or null'); }
    else if (v !== null && typeof v !== 'number') fail(`${path}.${k}`, 'must be a finite number or null');
  }
  return out;
}

function validateCandidate(c, path) {
  if (!isObj(c)) fail(path, 'must be an object');
  const evidence_id = str(c.evidence_id, `${path}.evidence_id`, { nonEmpty: true });
  const review_status = str(c.review_status, `${path}.review_status`, { nonEmpty: true });
  if (!isObj(c.source)) fail(`${path}.source`, 'must be an object');
  const title = str(c.source.title, `${path}.source.title`);
  const url = str(c.source.url, `${path}.source.url`, { nullable: true });
  const locator = str(c.source.locator, `${path}.source.locator`, { nullable: true });
  if (!GRADES.includes(c.grade)) fail(`${path}.grade`, `must be one of ${GRADES.join(', ')}`);
  if (!Array.isArray(c.rules)) fail(`${path}.rules`, 'must be an array');
  const rules = c.rules.map((r, i) => {
    const p = `${path}.rules[${i}]`;
    if (!isObj(r)) fail(p, 'must be an object');
    if (!GRADES.includes(r.grade)) fail(`${p}.grade`, `must be one of ${GRADES.join(', ')}`);
    return { rule: str(r.rule, `${p}.rule`, { nonEmpty: true }), grade: r.grade, why: str(r.why, `${p}.why`) };
  });
  if (typeof c.review_ready !== 'boolean') fail(`${path}.review_ready`, 'must be boolean');
  if (c.review_ready && review_status !== 'verified') fail(`${path}.review_ready`, `is true but review_status is ${JSON.stringify(review_status)}, not "verified"`);
  const safe = safeUrl(url);
  return {
    evidence_id, review_status, draft: review_status !== 'verified', grade: c.grade, review_ready: c.review_ready,
    source: { title, url: safe, url_status: safe ? 'available' : 'unavailable', locator },
    rules, missing_fields: strArray(c.missing_fields, `${path}.missing_fields`),
    conflicts: strArray(c.conflicts, `${path}.conflicts`),
  };
}

function validateItem(it, path, index) {
  if (!isObj(it)) fail(path, 'must be an object');
  const id = it.line_id;
  if (!((typeof id === 'string' && id.length > 0) || (Number.isInteger(id) && id >= 0))) fail(`${path}.line_id`, 'must be a non-empty string or non-negative integer');
  const material_id = str(it.material_id, `${path}.material_id`, { nullable: true });
  const name = str(it.name, `${path}.name`);
  if (!isObj(it.request)) fail(`${path}.request`, 'must be an object');
  const requested = cloneJson(it.request, `${path}.request`);
  if (!STATUSES.includes(it.status)) fail(`${path}.status`, `must be one of ${STATUSES.join(', ')}`);
  if (!Array.isArray(it.candidates)) fail(`${path}.candidates`, 'must be an array');
  const candidates = it.candidates.map((c, i) => validateCandidate(c, `${path}.candidates[${i}]`));
  const n = candidates.length;
  const ids = new Set();
  for (const c of candidates) {
    if (ids.has(c.evidence_id)) fail(`${path}.candidates`, `has duplicate evidence_id ${JSON.stringify(c.evidence_id)}; candidate identity within a line must be unique`);
    ids.add(c.evidence_id);
  }
  if (it.status === 'NO_CANDIDATES' && n > 0) fail(`${path}.status`, `is NO_CANDIDATES but the line has ${n} candidates`);
  if (it.status !== 'NO_CANDIDATES' && n === 0) fail(`${path}.status`, `is ${it.status} but the line has no candidates (expected NO_CANDIDATES)`);
  if (it.status === 'REVIEW_READY' && !candidates.some((c) => c.review_ready)) fail(`${path}.status`, 'is REVIEW_READY but no candidate is review_ready');
  if (!Array.isArray(it.next_actions)) fail(`${path}.next_actions`, 'must be an array');
  const next_actions = it.next_actions.map((a, i) => {
    const p = `${path}.next_actions[${i}]`;
    if (!isObj(a)) fail(p, 'must be an object');
    return { kind: str(a.kind, `${p}.kind`, { nonEmpty: true }), field: str(a.field, `${p}.field`, { nullable: true }),
      message: str(a.message, `${p}.message`, { nonEmpty: true }), evidence_ids: strArray(a.evidence_ids, `${p}.evidence_ids`) };
  });
  return { line_index: index, line_id: id, material_id, name, status: it.status, requested, candidates, next_actions,
    next_research_action: nextResearchAction(it.status, next_actions) };
}

function nextResearchAction(status, actions) {
  if (actions.length) return actions[0].message;
  if (status === 'NO_CANDIDATES') return 'Candidate evidence not found in the sources reviewed for this material at the requested conditions; search the PSI Data Repository and NTRS for test reports on this material.';
  if (status === 'REVIEW_READY') return 'Compare the source conditions of the review-ready rows with the requested conditions before citing them.';
  return 'Review the draft or flagged rows against the cited source before citing them.';
}

// Validates a triage snapshot and returns a normalised clone. Never trusts counts.
function validateTriage(t, label) {
  if (!isObj(t)) fail(label, 'must be an object (triage snapshot unavailable or malformed)');
  if (t.version !== 1) fail(`${label}.version`, 'must be 1');
  const conditions = validateConditions(t.conditions, `${label}.conditions`);
  if (!Array.isArray(t.items)) fail(`${label}.items`, 'must be an array');
  const items = t.items.map((it, i) => validateItem(it, `${label}.items[${i}]`, i));
  const seen = new Set();
  for (const it of items) {
    const key = `${typeof it.line_id}:${it.line_id}`;
    if (seen.has(key)) fail(`${label}.items`, `has duplicate line_id ${JSON.stringify(it.line_id)}; line identity must be unique`);
    seen.add(key);
  }
  if (!isObj(t.summary)) fail(`${label}.summary`, 'must be an object');
  const all = items.flatMap((it) => it.candidates);
  const actual = { line_count: items.length, candidate_count: all.length,
    verified_count: all.filter((c) => c.review_status === 'verified').length,
    review_ready_count: all.filter((c) => c.review_ready).length };
  for (const [k, v] of Object.entries(actual)) {
    const claimed = count(t.summary[k], `${label}.summary.${k}`);
    if (claimed !== v) fail(`${label}.summary.${k}`, `is ${claimed} but the items contain ${v}`);
  }
  const limitations = strArray(t.limitations, `${label}.limitations`);
  return { conditions, items, limitations, counts: actual };
}

// ---------- URL and text safety ----------

function safeUrl(u) {
  if (typeof u !== 'string' || u.length === 0 || u.length > 2048) return null;
  if (!/^https?:\/\//i.test(u) || /[\s\u0000-\u001f\u007f-\u009f<>"`\\]/.test(u)) return null;
  try {
    const p = new URL(u);
    return (p.protocol === 'http:' || p.protocol === 'https:') && p.hostname ? u : null;
  } catch { return null; }
}

// Collapse any line breaks / control / bidi characters to a single line.
const STRIP = new RegExp(`[${[[0x00, 0x1f], [0x7f, 0x9f], [0x200e, 0x200f], [0x2028, 0x2029], [0x202a, 0x202e], [0x2066, 0x2069]]
  .map(([a, b]) => `${String.fromCharCode(a)}-${String.fromCharCode(b)}`).join('')}]+`, 'g');
const oneLine = (s) => String(s).replace(STRIP, ' ');

// Inline Markdown text: untrusted values can never start a block, link, image,
// HTML tag, code span or table cell.
function esc(s) {
  return oneLine(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/[\\`*[\]()#|!~{}]/g, (m) => `\\${m}`);
}
const href = (u) => u.replace(/\(/g, '%28').replace(/\)/g, '%29');

// ---------- change detection ----------

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const get = (o, k) => (has(o, k) ? o[k] : MISSING);
const same = (a, b) => (a === MISSING || b === MISSING ? a === b : JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b)));
const out = (v) => (v === MISSING ? null : v);
function change(field, before, after) {
  const kind = before === MISSING ? 'added' : after === MISSING ? 'removed' : 'changed';
  return { field, change: kind, before: out(before), after: out(after) };
}
const keyUnion = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
const lineSummary = (it) => ({ line_id: it.line_id, line_index: it.line_index, material_id: it.material_id, name: it.name });
const lineKey = (it) => `${typeof it.line_id}:${it.line_id}`;
const fieldId = (it) => `lines[${it.line_id}]`;
const CANDIDATE_FIELDS = ['review_status', 'grade', 'review_ready', 'conflicts', 'missing_fields'];
const candSummary = (c) => ({ evidence_id: c.evidence_id, review_status: c.review_status, grade: c.grade,
  review_ready: c.review_ready, source_title: c.source.title, source_url: c.source.url });

// Candidates are matched by evidence_id within a line matched by line_id.
// Order: current candidates in triage order (added or changed), then removed
// baseline candidates in baseline order.
function diffCandidates(f, old, it, changes) {
  const before = new Map(old.candidates.map((c) => [c.evidence_id, c]));
  const now = new Set(it.candidates.map((c) => c.evidence_id));
  for (const c of it.candidates) {
    const cf = `${f}.candidates[${c.evidence_id}]`;
    const o = before.get(c.evidence_id);
    if (!o) { changes.push(change(cf, MISSING, candSummary(c))); continue; }
    for (const k of CANDIDATE_FIELDS) if (!same(o[k], c[k])) changes.push(change(`${cf}.${k}`, o[k], c[k]));
  }
  for (const o of old.candidates) {
    if (!now.has(o.evidence_id)) changes.push(change(`${f}.candidates[${o.evidence_id}]`, candSummary(o), MISSING));
  }
}

function diff(base, cur) {
  const changes = [];
  const condKeys = [...CONDITION_KEYS, ...keyUnion(base.conditions, cur.conditions).filter((k) => !CONDITION_KEYS.includes(k))];
  for (const k of condKeys) {
    const a = get(base.conditions, k); const b = get(cur.conditions, k);
    if (!same(a, b)) changes.push(change(`conditions.${k}`, a, b));
  }
  const before = new Map(base.items.map((it) => [lineKey(it), it]));
  const curKeys = new Set(cur.items.map(lineKey));
  for (const it of cur.items) {
    const old = before.get(lineKey(it));
    const f = fieldId(it);
    if (!old) { changes.push(change(f, MISSING, lineSummary(it))); continue; }
    for (const k of ['line_index', 'material_id', 'name', 'status']) {
      if (!same(old[k], it[k])) changes.push(change(`${f}.${k}`, old[k], it[k]));
    }
    for (const k of keyUnion(old.requested, it.requested)) {
      const a = get(old.requested, k); const b = get(it.requested, k);
      if (same(a, b)) continue;
      // Condition keys copied into each request are reported once, at conditions.*.
      if (CONDITION_KEYS.includes(k) && same(a, get(base.conditions, k)) && same(b, get(cur.conditions, k))) continue;
      changes.push(change(`${f}.request.${k}`, a, b));
    }
    diffCandidates(f, old, it, changes);
  }
  for (const it of base.items) if (!curKeys.has(lineKey(it))) changes.push(change(fieldId(it), lineSummary(it), MISSING));
  return changes;
}

// ---------- public API ----------

export function buildResearchBrief(triage, options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) fail('options', 'must be an object');
  const { scenarioName = '', baseline = null } = options;
  if (typeof scenarioName !== 'string') fail('options.scenarioName', 'must be a string');
  const cur = validateTriage(triage, 'triage');
  const base = baseline === null || baseline === undefined ? null : validateTriage(baseline, 'baseline');
  const scenario = oneLine(scenarioName).trim().slice(0, 200);
  const all = cur.items.flatMap((it) => it.candidates);
  const status_counts = Object.fromEntries(STATUSES.map((s) => [s, cur.items.filter((it) => it.status === s).length]));
  const gravities = [cur.conditions.gravity_g, ...cur.items.map((it) => it.requested.gravity_g)];
  const limitations = [...FIXED_LIMITATIONS];
  if (gravities.some((g) => typeof g === 'number' && g > 0 && g < 1)) limitations.push(PARTIAL_G_LIMITATION);
  for (const l of cur.limitations) if (!limitations.includes(l)) limitations.push(l);
  return {
    version: 1,
    title: scenario ? `REDLINE research brief: ${scenario}` : 'REDLINE research brief',
    scenario_name: scenario,
    boundary: BOUNDARY,
    dataset: { name: 'NASA Physical Sciences Informatics (PSI) Data Repository', url: PSI_REPOSITORY },
    conditions: cur.conditions,
    summary: {
      line_count: cur.counts.line_count, candidate_count: cur.counts.candidate_count,
      draft_count: all.filter((c) => c.draft).length, verified_count: cur.counts.verified_count,
      review_ready_count: cur.counts.review_ready_count, status_counts,
    },
    items: cur.items,
    has_baseline: base !== null,
    changes: base ? diff(base, cur) : [],
    limitations,
  };
}

function validateBrief(b) {
  if (!isObj(b) || b.version !== 1) fail('brief', 'must be a version 1 research brief from buildResearchBrief');
  for (const k of ['items', 'changes', 'limitations']) if (!Array.isArray(b[k])) fail(`brief.${k}`, 'must be an array');
  if (typeof b.title !== 'string') fail('brief.title', 'must be a string');
  if (!isObj(b.summary) || !isObj(b.conditions)) fail('brief', 'must have summary and conditions objects');
  if (b.boundary !== BOUNDARY || !b.limitations.includes(BOUNDARY)) fail('brief', 'must carry the research boundary statement');
  b.items.forEach((it, i) => {
    if (!isObj(it) || !isObj(it.requested) || !Array.isArray(it.candidates) || !Array.isArray(it.next_actions)) fail(`brief.items[${i}]`, 'is malformed');
    it.candidates.forEach((c, j) => { if (!isObj(c) || !isObj(c.source)) fail(`brief.items[${i}].candidates[${j}]`, 'is malformed'); });
  });
  b.changes.forEach((c, i) => { if (!isObj(c) || typeof c.field !== 'string') fail(`brief.changes[${i}]`, 'is malformed'); });
}

function fmt(v, present = true) {
  if (!present) return '(missing)';
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return esc(JSON.stringify(v));
}

function citation(c) {
  const s = c.source;
  const title = esc(s.title || 'Untitled source');
  const url = safeUrl(s.url); // re-check: briefs may come from JSON
  const link = url ? `[${title}](${href(url)})` : `${title} (link unavailable: URL missing or not http/https)`;
  return `Citation: ${link}; locator: ${s.locator ? esc(s.locator) : 'not given'}`;
}

export function researchBriefMarkdown(brief) {
  validateBrief(brief);
  const s = brief.summary;
  const L = [];
  L.push(`# ${esc(brief.title)}`, '', '## Boundary', '', `**${BOUNDARY}**`, '',
    'This brief is a research handoff built from a REDLINE evidence triage. Requested conditions are research assumptions entered by the user. Source conditions are those reported by each cited source; they can differ and are compared by the triage rules listed per row.',
    '', `Primary dataset: ${esc(brief.dataset?.name ?? 'NASA PSI Data Repository')} <${PSI_REPOSITORY}>`, '',
    '## Summary', '',
    `- ${s.line_count} BOM lines; ${s.candidate_count} candidate evidence rows: ${s.draft_count} draft (not verified), ${s.verified_count} verified, ${s.review_ready_count} review-ready.`);
  if (isObj(s.status_counts)) L.push(`- Line status: ${STATUSES.map((k) => `${k} ${Number(s.status_counts[k]) || 0}`).join(', ')}.`);
  L.push('', '## Requested conditions (research assumptions)', '');
  const ck = [...CONDITION_KEYS, ...Object.keys(brief.conditions).filter((k) => !CONDITION_KEYS.includes(k)).sort()];
  for (const k of ck) L.push(`- ${esc(k)} (requested): ${fmt(brief.conditions[k], has(brief.conditions, k))}`);
  L.push('', '## Lines', '');
  brief.items.forEach((it, i) => {
    L.push(`### Line ${i + 1}: ${esc(it.name)}`, '',
      `- line_id: ${fmt(it.line_id)}; material_id: ${it.material_id == null ? 'unknown' : fmt(it.material_id)}; status: ${esc(it.status)}`);
    const req = Object.keys(it.requested).sort().filter((k) => !(CONDITION_KEYS.includes(k) && same(it.requested[k], get(brief.conditions, k))));
    L.push(`- Requested for this line (assumption): ${req.length ? req.map((k) => `${esc(k)} = ${fmt(it.requested[k])}`).join('; ') : 'same as requested conditions'}`);
    L.push(`- Next research action: ${esc(it.next_research_action)}`);
    for (const a of it.next_actions.slice(1)) L.push(`- Further research action: ${esc(a.message)}`);
    if (!it.candidates.length) L.push('- No candidate evidence rows: not found in the sources reviewed.');
    for (const c of it.candidates) {
      L.push(`- Evidence ${esc(c.evidence_id)}: review status ${esc(c.review_status)}${c.review_status === 'verified' ? '' : ' (draft, not verified)'}; grade ${esc(c.grade)}; review-ready ${c.review_ready === true ? 'yes' : 'no'}`,
        `  - ${citation(c)}`);
      for (const r of c.rules || []) L.push(`  - Rule ${esc(r.rule)}: ${esc(r.grade)}; ${esc(r.why)}`);
      if (c.missing_fields?.length) L.push(`  - Missing or unknown fields (request or source side): ${c.missing_fields.map(esc).join(', ')}`);
      if (c.conflicts?.length) L.push(`  - Conflicts: ${c.conflicts.map(esc).join('; ')}`);
    }
    L.push('');
  });
  L.push('## Changes from baseline (research assumptions only)', '',
    'These changes compare two triage snapshots of research assumptions, not real-time spacecraft telemetry. A change in flags or review counts is not a change in fire risk.', '');
  if (!brief.has_baseline) L.push('- No baseline snapshot provided.');
  else if (!brief.changes.length) L.push('- No changes in requested conditions, BOM lines or candidate evidence rows.');
  for (const c of brief.changes) {
    L.push(`- ${esc(c.field)}: ${fmt(c.before, c.change !== 'added')} → ${fmt(c.after, c.change !== 'removed')}`);
  }
  L.push('', '## Limitations', '');
  for (const l of brief.limitations) L.push(`- ${esc(l)}`);
  return `${L.join('\n')}\n`;
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (isObj(v)) return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}

export function serializeResearchBrief(brief) {
  validateBrief(brief);
  return JSON.stringify(sortKeys(cloneJson(brief, 'brief')), null, 2);
}
