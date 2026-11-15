// UI module (S1 §2, DESIGN.md). Stub from the scaffold task; owner replaces the body.

import { suggestExperiments, fields, nasaURL } from '../rules/experiments.js';

// Deliberately require exact known specimen/conditions until the comparison engine lands.
// This withholds weaker suggestions rather than interpreting a FLAG as coverage.
function matches(query, row) {
  return fields.filter(f => f !== 'o2_pct').every(f => query[f] != null && row[f] === query[f]);
}

export function suggestFixes(results = [], context = {}) {
  // Judge click-through (#169): tolerate null/malformed inputs; an empty list is a valid answer.
  results = Array.isArray(results) ? results.filter(r => r && typeof r === 'object') : [];
  const cabinQuery = context?.cabinQuery ?? {};
  const evidence = context?.evidence ?? {};
  const rows = (Array.isArray(evidence.evidence) ? evidence.evidence : []).filter(row => row && row.review_status === 'verified' &&
    row.source_locator && nasaURL(evidence.sources?.[row.source_key]?.url));
  const queryFor = id => ({ ...cabinQuery.conditions, ...(Array.isArray(cabinQuery.materials) ? cabinQuery.materials : []).find(m => m?.material_id === id) });
  const citations = list => list.map(row => ({ evidence_id: row.evidence_id,
    url: evidence.sources[row.source_key].url, title: evidence.sources[row.source_key].title,
    locator: row.source_locator }));
  const fixes = [];
  for (const result of results.filter(r => r.label === 'BURNED')) {
    const query = queryFor(result.material_id);
    if (!Number.isFinite(query.o2_pct)) continue;
    for (const candidate of results.filter(r => r.reason === 'NE-no-burn' && r.label === 'NOT_ESTABLISHED' && r.material_id !== result.material_id)) {
      const target = queryFor(candidate.material_id);
      // A swap preserves the original use configuration as well as cabin conditions.
      if (!fields.every(f => target[f] === query[f])) continue;
      const covering = rows.filter(row => candidate.cited?.includes(row.evidence_id) && row.material_id === candidate.material_id && matches(target, row) &&
        ((row.endpoint === 'burn/no-burn' && row.outcome === 'no-spread' && row.o2_pct >= target.o2_pct) ||
         (row.endpoint === 'LOC-FS' && row.value_unit === '% O2' && row.value > target.o2_pct + 1 && row.uncertainty === '±1')));
      if (covering.length) fixes.push({ type: 'swap', material_id: result.material_id, replacement_id: candidate.material_id,
        text: `${candidate.material_id} has no burned-in-testing result at these conditions. REDLINE inference: candidate substitution requires configuration review.`, citations: citations(covering) });
    }
    const burns = rows.filter(row => row.material_id === result.material_id && matches(query, row) &&
      row.outcome === 'spread' && ['burn/no-burn', 'spread-rate'].includes(row.endpoint) && Number.isFinite(row.o2_pct));
    if (!burns.length) continue;
    const oxygen = Math.ceil(Math.min(...burns.map(row => row.o2_pct)) * 2) / 2 - 0.5;
    if (oxygen < 0 || oxygen >= query.o2_pct) continue;
    fixes.push({ type: 'oxygen-preview', material_id: result.material_id, o2_pct: oxygen,
      text: `At ≤ ${oxygen}% O2, no burned-in-testing result applies to this material in the sources reviewed. REDLINE inference; other labels may still apply. Pressure, airflow and specimen are held fixed.`, citations: citations(burns) });
  }
  return fixes;
}

// Optional context is additive to the scaffold's two-argument interface.
export function renderFixes(root, results = [], context = {}) {
  if (!root) return;
  results = Array.isArray(results) ? results.filter(r => r && typeof r === 'object') : [];
  context = { ...context, cabinQuery: context?.cabinQuery ?? {}, evidence: context?.evidence ?? {} };
  const doc = root.ownerDocument;
  root.replaceChildren();
  const add = (parent, tag, text, className) => {
    const node = doc.createElement(tag); node.textContent = text;
    if (className) node.className = className;
    parent.append(node); return node;
  };
  const link = (parent, url, title) => { if (nasaURL(url)) { const a = add(parent, 'a', title); a.href = url; } };
  add(root, 'h2', 'What changes the label', 'type-heading');
  const fixes = suggestFixes(results, context);
  if (!fixes.length) add(root, 'p', 'No evidence-supported change identified in the sources reviewed.', 'text-2');
  for (const fix of fixes) {
    const card = add(root, 'article', '', 'region');
    add(card, 'p', fix.text);
    for (const source of fix.citations) link(card, source.url, `${source.title} — ${source.locator} (${source.evidence_id})`);
  }
  // Experiment cards are optional: a malformed result must not take down the fixes above.
  let experiments = [];
  try { experiments = suggestExperiments(results, context); } catch { experiments = []; }
  for (const experiment of experiments) {
    const card = add(root, 'article', '', 'region');
    add(card, 'h3', 'Candidate experiment question / REDLINE inference', 'type-heading');
    add(card, 'p', (experiment.material_ids ?? []).join(', '));
    add(card, 'p', experiment.hypothesis);
    add(card, 'p', `Planning priority: ${experiment.dependency_count ?? experiment.material_ids?.length ?? 0} distinct cabin materials share this protocol gap. Each specimen needs its own measurement.`);
    const list = add(card, 'dl', '');
    for (const field of fields) { add(list, 'dt', field); add(list, 'dd', experiment.conditions?.[field] == null ? 'Not specified; define before testing' : `${experiment.conditions[field]} (requested scenario, not a measured result)`); }
    if (experiment.facility) {
      add(card, 'p', experiment.facility.note ?? '');
      link(card, experiment.facility.source_url, `${experiment.facility.name} — ${experiment.facility.source_locator}`);
    }
    add(card, 'p', `Not found in the sources reviewed. Inventory: ${experiment.inventory}.`);
    for (const source of experiment.sources ?? []) link(card, source.url, source.title);
  }
}
