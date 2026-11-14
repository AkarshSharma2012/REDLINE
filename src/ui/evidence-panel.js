import { compareRow } from '../rules/compare.js';

const FIELDS = [
  ['material', 'Material', '', 'M'], ['material_grade', 'Grade', '', 'M'], ['form', 'Form', '', 'F'],
  ['thickness_mm', 'Thickness / diameter', 'mm', 'T'], ['width_mm', 'Width', 'mm', 'W'],
  ['o2_pct', 'Oxygen', '% O2', 'U'], ['pressure_kpa', 'Total pressure', 'kPa', 'P'],
  ['o2_partial_kpa', 'Oxygen partial pressure (computed)', 'kPa O2', 'P'],
  ['flow_speed_cm_s', 'Forced flow speed', 'cm/s', 'V'], ['flow_direction', 'Flow direction', '', 'D'],
  ['gravity_g', 'Gravity', 'g', 'G'], ['facility', 'Facility', '', 'X'], ['test_duration_s', 'Duration', 's', 'X'],
  ['external_heat_flux_kw_m2', 'External heat flux', 'kW/m²', 'H'], ['endpoint', 'Endpoint', '', 'E'],
  ['limit_approach', 'Approach', '', 'A'], ['pass_criterion', 'Pass criterion', '', 'A'], ['uncertainty', 'Uncertainty', '', 'U'],
];
const known = v => v !== null && v !== undefined && v !== '';
const format = (v, unit = '') => known(v) ? `${v}${unit ? ` ${unit}` : ''}` : 'Not stated';
const partial = r => Number.isFinite(r.o2_pct) && Number.isFinite(r.pressure_kpa)
  ? Number((r.o2_pct * r.pressure_kpa / 100).toFixed(4)) : null;
function sourceURL(source) {
  try { const u = new URL(source?.url); return ['https:', 'http:'].includes(u.protocol) ? u : null; }
  catch { return null; }
}
const isNASA = u => u && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov'));
const gravityClass = g => !Number.isFinite(g) ? null : g <= 0.01 ? 'micro' : g >= 0.9 ? 'earth' : 'partial';

// S1 entry point. Supply result.query (immutable selected-item snapshot), or options.query.
// options.compareRow is an integration/test adapter; eligibility and wording stay in the engine.
export function renderEvidencePanel(root, result, evidence, options = {}) {
  const doc = root.ownerDocument;
  const make = (tag, text, cls) => {
    const n = doc.createElement(tag);
    if (text !== undefined) n.textContent = String(text);
    if (cls) n.className = cls;
    return n;
  };
  const p = (parent, text, cls) => parent.append(make('p', text, cls));
  const button = (parent, text, action) => {
    const n = make('button', text); n.type = 'button'; n.addEventListener('click', action); parent.append(n); return n;
  };
  root.replaceChildren();
  if (!result) { p(root, 'Choose a cabin item to inspect its evidence.'); return; }
  const query = options.query ?? result.query;
  if (!query?.material_id) { p(root, 'Choose a cabin item with a request snapshot. Comparison unavailable without cabin conditions.'); return; }
  const snapshot = { ...query };
  const compare = options.compareRow ?? compareRow;
  const sourceFor = row => evidence?.sources?.[row.source_key];
  let filter = 'all', drafts = false, selected = options.selectedId ?? null;
  function source(parent, row) {
    const s = sourceFor(row), u = sourceURL(s);
    if (!u || !row.source_locator) { p(parent, 'Source URL or locator unavailable; scientific values withheld.'); return false; }
    const a = make('a', s.title ?? row.source_key); a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a);
    p(parent, `${s.authors ?? 'Authors not stated'} · ${s.year ?? 'Year not stated'} · ${row.source_locator}`);
    if (!isNASA(u)) p(parent, '[non-NASA publication — not used for the label]');
    return true;
  }
  function label(parent, value, prefix = '') {
    const rows = (evidence?.evidence ?? []).filter(r => value?.cited?.includes(r.evidence_id)
      && r.review_status === 'verified' && isNASA(sourceURL(sourceFor(r))) && r.source_locator);
    if (rows.length && value?.wording) { p(parent, `${prefix}${value.wording}`); rows.forEach(r => source(parent, r)); }
    else p(parent, `${prefix}Not found in the sources reviewed; no sourced statement available.`);
  }
  function draw() {
    root.replaceChildren(); root.append(make('h3', `Evidence: ${snapshot.material_id}`));
    p(root, `Request: ${result.item_id ?? snapshot.material_id} · revision ${result.revision ?? 'not stated'}. Cabin values are user inputs.`);
    p(root, FIELDS.map(([key, name, unit]) => `${name}: ${format(key === 'o2_partial_kpa' ? partial(snapshot) : snapshot[key], unit)}`).join('; '));
    if (result.cross_gravity) p(root, 'Cross-gravity comparison', 'tag-cross-gravity');
    if (result.estimate) {
      p(root, 'Lunar estimate shown beside 0 g and 1 g results; these references are not a verified lunar bound.', 'caveat');
      label(root, result.estimate.g0, '0 g: '); label(root, result.estimate.g1, '1 g: ');
      if (result.estimate.gP) label(root, result.estimate.gP, 'Partial gravity: ');
      p(root, 'Short-duration measurements do not establish long-duration cabin behavior.');
    } else label(root, result);
    let candidates;
    try {
      if (!Array.isArray(evidence?.evidence)) throw new Error('Missing evidence');
      candidates = evidence.evidence.filter(r => r.material_id === snapshot.material_id).map(row => {
        const ctx = { quench_speeds_cm_s: evidence.evidence.filter(r => r.material_id === row.material_id
          && r.review_status === 'verified' && gravityClass(r.gravity_g) === gravityClass(row.gravity_g) && r.endpoint === 'quench-limit'
          && r.value_unit === 'cm/s').map(r => r.value) };
        const comparison = compare({ ...snapshot }, row, ctx);
        if (!['OK', 'FLAG', 'INVALID'].includes(comparison?.grade) || !comparison.rules?.length) throw new Error('Comparison unavailable');
        return { row, comparison, inspectOnly: row.review_status !== 'verified' || !isNASA(sourceURL(sourceFor(row))) || !row.source_locator };
      });
    } catch {
      p(root, 'Comparison unavailable. This is a data or engine failure, not a coverage conclusion.', 'caveat');
      button(root, 'Retry comparison', draw); return;
    }
    const count = grade => candidates.filter(c => !c.inspectOnly && c.comparison.grade === grade).length;
    p(root, `Verified NASA records: ${count('OK') + count('FLAG') + count('INVALID')}; comparable: ${count('OK')}; with notes: ${count('FLAG')}; excluded: ${count('INVALID')}; inspection only: ${candidates.filter(c => c.inspectOnly).length}.`);
    p(root, 'Why order: comparable, comparable with notes, excluded, then inspection-only records. Within each group: fewer non-OK rules, then evidence ID. REDLINE editorial ranking; sorting does not change eligibility.');
    const lab = make('label', 'Filter experiments'), select = make('select'); lab.append(select); root.append(lab);
    for (const [value, text] of [['all', 'All reviewed'], ['OK', 'Comparable'], ['FLAG', 'With mismatches'], ['INVALID', 'Excluded']]) {
      const o = make('option', text); o.value = value; select.append(o);
    }
    select.value = filter; select.addEventListener('change', () => { filter = select.value; draw(); });
    const toggle = button(root, drafts ? 'Hide inspection-only records' : 'Inspect drafts / non-NASA records', () => { drafts = !drafts; draw(); });
    toggle.setAttribute('aria-pressed', String(drafts));
    const group = c => c.inspectOnly ? 3 : { OK: 0, FLAG: 1, INVALID: 2 }[c.comparison.grade];
    const notes = c => c.comparison.rules.filter(r => r.grade !== 'OK').length;
    candidates.sort((a, b) => group(a) - group(b) || notes(a) - notes(b)
      || (a.row.evidence_id < b.row.evidence_id ? -1 : a.row.evidence_id > b.row.evidence_id ? 1 : 0));
    if (!candidates.length) { p(root, 'Not found in the sources reviewed for this material.'); return; }
    const visible = candidates.filter(c => (!c.inspectOnly || drafts) && (filter === 'all' || c.comparison.grade === filter));
    if (!visible.length) {
      p(root, 'No experiments in this view.'); button(root, 'Clear filters / inspect records', () => { filter = 'all'; drafts = true; draw(); }); return;
    }
    if (selected && !candidates.some(c => c.row.evidence_id === selected)) p(root, 'Selected experiment unavailable in this revision. Choose an experiment.');
    const list = make('ol'); root.append(list);
    visible.forEach(c => {
      const li = make('li'); list.append(li);
      const b = button(li, `${c.row.evidence_id} · ${c.inspectOnly ? 'Inspection only' : { OK: 'Comparable', FLAG: 'Comparable with notes', INVALID: 'Excluded' }[c.comparison.grade]}`, () => { selected = c.row.evidence_id; draw(); });
      b.setAttribute('aria-pressed', String(selected === c.row.evidence_id));
      p(li, `${sourceFor(c.row)?.title ?? 'Source not stated'} · ${c.comparison.rules.find(r => r.grade !== 'OK')?.why ?? 'No comparison notes'}`);
      source(li, c.row);
      p(li, `${c.row.material} · ${c.row.form} · ${c.row.facility} · ${format(c.row.gravity_g, 'g')} · ${c.row.endpoint} · ${c.row.outcome ?? 'Outcome not stated'} · ${c.row.review_status}`);
      if (result.conflicts?.includes(c.row.evidence_id)) p(li, 'Other comparable tests disagree');
      if (c.comparison.rules.some(r => r.rule === 'E' && r.grade === 'INVALID')) p(li, 'Related test (different endpoint, not used for the label)');
    });
    const active = visible.find(c => c.row.evidence_id === selected) ?? (!selected ? visible[0] : null);
    if (!active) return;
    const { row, comparison, inspectOnly } = active;
    const detail = make('section'); detail.setAttribute('aria-label', 'Selected experiment'); root.append(detail);
    detail.append(make('h4', row.evidence_id));
    p(detail, `Review status: ${row.review_status}; verifier: ${row.verified_by ?? 'Not stated'}; run: ${format(row.run_id)}; sample: ${format(row.sample_id)}.`);
    if (!source(detail, row)) return;
    p(detail, `Recorded outcome: ${format(row.outcome)}; endpoint: ${format(row.endpoint)}; value: ${format(row.value, row.value_unit)}.`);
    p(detail, `Applicability to this request: ${comparison.grade}${inspectOnly ? '; inspection only, not used for the label' : ''}.`);
    if (comparison.rules.some(r => r.rule === 'G' && r.grade !== 'OK')) p(detail, 'Cross-gravity comparison', 'tag-cross-gravity');
    if (['aircraft', 'drop-tower'].includes(row.facility)) p(detail, 'Short-duration facility; not a long-duration cabin measurement.', 'caveat');
    const scroll = make('div', undefined, 'table-scroll'), table = make('table'); detail.append(scroll); scroll.append(table);
    table.append(make('caption', 'Cabin request versus recorded experiment'));
    const head = make('thead'), hr = make('tr'); head.append(hr); table.append(head);
    ['Field', 'Requested (user input)', 'Tested (source above)', 'Verdict / reason'].forEach(t => { const th = make('th', t); th.scope = 'col'; hr.append(th); });
    const body = make('tbody'); table.append(body);
    const q = { ...snapshot, o2_partial_kpa: partial(snapshot) }, r = { ...row, o2_partial_kpa: partial(row) };
    FIELDS.forEach(([key, name, unit, rule]) => {
      const tr = make('tr'), th = make('th', name); th.scope = 'row'; tr.append(th);
      tr.append(make('td', format(q[key], unit)), make('td', format(r[key], unit)));
      const v = comparison.rules.find(n => n.rule === rule);
      tr.append(make('td', `${!known(q[key]) || !known(r[key]) ? 'Unknown; ' : ''}${v ? `${v.grade}: ${v.why}` : 'Context only; no field verdict'}`)); body.append(tr);
    });
    detail.append(make('h4', 'Every comparison note'));
    comparison.rules.filter(r => r.grade !== 'OK').forEach(r => p(detail, `${r.why} (${r.rule}: ${r.grade})`, 'caveat'));
    p(detail, 'Does not establish: certification or behavior outside the recorded conditions.');
    if (row.notes) p(detail, row.notes);
    if (row.caveat) p(detail, row.caveat, 'caveat');
    const psi = make('a', 'NASA PSI Data Repository (primary dataset)'); psi.href = 'https://www.nasa.gov/psi/';
    psi.target = '_blank'; psi.rel = 'noopener noreferrer'; detail.append(psi);
  }
  draw();
}
