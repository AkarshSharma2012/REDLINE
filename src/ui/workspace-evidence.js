import { reviewedGravity, reviewedForm, reviewedEndpoint } from './evidence-provenance.js';
// #277 workspace source browser: filters, counts, record cards, record detail and the
// HTML cabin-material controls. Reads the loaded evidence file only; never changes review
// state, never promotes drafts and never derives a label. All data goes in via textContent.

const PSI_URL = 'https://www.nasa.gov/psi/';
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const known = v => v !== null && v !== undefined && v !== '';
const str = v => (known(v) ? String(v) : '');

export function formatCondition(value, unit = '') {
  return known(value) ? `${value}${unit ? ` ${unit}` : ''}` : 'Not stated';
}

function httpURL(raw) {
  try { const u = new URL(String(raw)); return ['https:', 'http:'].includes(u.protocol) ? u : null; } catch { return null; }
}
const isNASA = u => Boolean(u && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov')));

// Valid rows only; a missing or malformed file is "unavailable", never zero coverage.
function index(evidence) {
  if (!isObject(evidence) || !Array.isArray(evidence.evidence)) return { ok: false, rows: [], sources: {} };
  const rows = evidence.evidence.filter(r => isObject(r) && typeof r.evidence_id === 'string' && r.evidence_id);
  return { ok: true, rows, sources: isObject(evidence.sources) ? evidence.sources : {} };
}

export function reviewOptions(evidence) {
  const statuses = [...new Set(index(evidence).rows.map(r => str(r.review_status)).filter(Boolean))].sort();
  return ['all', ...statuses];
}

function haystack(row, sources) {
  const s = sources[row.source_key];
  return [row.evidence_id, row.material, row.material_id, row.investigation, row.source_key, row.pi,
    isObject(s) ? s.title : ''].map(str).join(' ').toLowerCase();
}

export function filterSources(evidence, { text = '', review = 'all', materialId = null } = {}) {
  const { ok, rows, sources } = index(evidence);
  const needle = String(text ?? '').trim().toLowerCase();
  const matchedRows = rows.filter(r => (review === 'all' || r.review_status === review)
    && (!materialId || r.material_id === materialId)
    && (!needle || haystack(r, sources).includes(needle)));
  return {
    ok, total: rows.length, matched: matchedRows.length,
    verified: rows.filter(r => r.review_status === 'verified').length,
    rows: matchedRows,
  };
}

export function describeRecord(row, sources = {}) {
  const r = isObject(row) ? row : {};
  const s = isObject(sources?.[r.source_key]) ? sources[r.source_key] : {};
  const u = httpURL(s.url);
  return {
    id: str(r.evidence_id),
    investigation: str(r.investigation) || 'Investigation not stated',
    material: str(r.material) || str(r.material_id) || 'Material not stated',
    materialId: str(r.material_id),
    status: str(r.review_status) || 'not stated',
    inspectOnly: r.review_status !== 'verified',
    locator: str(r.source_locator),
    conditions: [
      ['Oxygen', formatCondition(r.o2_pct, '% O2')],
      ['Pressure', formatCondition(r.pressure_kpa, 'kPa')],
      ['Gravity', (reviewedGravity(r) ?? formatCondition(r.gravity_g, 'g'))],
      ['Form', reviewedForm(r) ?? formatCondition(r.form)],
      ['Facility', formatCondition(r.facility)],
      ...(reviewedEndpoint(r) ? [['Endpoint', reviewedEndpoint(r)]] : []),
    ],
    citation: { title: str(s.title) || str(r.source_key) || 'Source not stated', authors: str(s.authors), year: str(s.year), url: u ? u.href : null, nasa: isNASA(u) },
  };
}

function maker(doc) {
  return (tag, text, cls) => {
    const n = doc.createElement(tag);
    if (text !== undefined) n.textContent = String(text);
    if (cls) n.className = cls;
    return n;
  };
}

function conditionList(make, conditions, cls = 'ws-conditions') {
  const dl = make('dl', undefined, cls);
  for (const [k, v] of conditions) { const div = make('div'); div.append(make('dt', k), make('dd', v, 'type-data')); dl.append(div); }
  return dl;
}

function link(make, text, href) {
  const a = make('a', text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
}

// Browser = filter controls, the three counts and one card button per matched record.
export function renderSourceBrowser(root, { evidence, state = {}, onSelect = () => {}, onFilter = () => {} } = {}) {
  const doc = root.ownerDocument, make = maker(doc);
  const options = reviewOptions(evidence);
  const filters = { text: String(state.text ?? ''), review: options.includes(state.review) ? state.review : 'all', materialId: state.materialId ?? null };
  const result = filterSources(evidence, filters);
  root.replaceChildren();
  if (!result.ok) {
    root.append(make('p', 'Source records unavailable: the evidence file did not load. Use Retry in Results; no counts are shown.', 'caveat'));
    return { ...result, cards: new Map() };
  }
  const cards = new Map();
  const form = make('div', undefined, 'ws-filters');
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Filter NASA source records');
  const textLabel = make('label', 'Material, investigation or source');
  const search = make('input'); search.setAttribute('type', 'search'); search.id = 'ws-filter-text';
  search.value = filters.text; search.setAttribute('autocomplete', 'off');
  textLabel.setAttribute('for', search.id);
  const reviewLabel = make('label', 'Review status');
  const select = make('select'); select.id = 'ws-filter-review'; reviewLabel.setAttribute('for', select.id);
  for (const value of options) { const o = make('option', value === 'all' ? 'All statuses' : value); o.value = value; select.append(o); }
  select.value = filters.review;
  const emit = patch => onFilter({ ...filters, ...patch });
  search.addEventListener('input', () => emit({ text: String(search.value ?? '').trim() }));
  select.addEventListener('change', () => emit({ review: options.includes(select.value) ? select.value : 'all' }));
  const textField = make('div'), reviewField = make('div');
  textField.append(textLabel, search); reviewField.append(reviewLabel, select);
  form.append(textField, reviewField);
  root.append(form);
  if (filters.materialId) {
    const scope = make('p', undefined, 'ws-scope');
    const clear = make('button', 'Show all materials'); clear.type = 'button';
    clear.addEventListener('click', () => emit({ materialId: null }));
    scope.append(make('span', `Material: ${filters.materialId}`, 'type-data'), clear);
    root.append(scope);
  }
  const counts = make('p', `Total ${result.total} · Matched ${result.matched} · Verified ${result.verified}`, 'ws-counts type-data');
  counts.setAttribute('role', 'status');
  root.append(counts);
  if (result.verified === 0) root.append(make('p', '0 verified rows: labels are not produced; records below are inspection only.', 'ws-note'));
  if (!result.matched) { root.append(make('p', 'No records match these filters.', 'text-2')); return { ...result, cards }; }
  const list = make('ul', undefined, 'ws-cards');
  list.setAttribute('aria-label', 'Source records');
  const { sources } = index(evidence);
  for (const row of result.rows) {
    const d = describeRecord(row, sources);
    const li = make('li');
    const b = make('button', undefined, 'ws-card'); b.type = 'button';
    b.setAttribute('data-evidence-id', d.id);
    b.setAttribute('aria-pressed', String(state.selectedId === d.id));
    b.append(make('span', `${d.id} · ${d.investigation}`, 'ws-card-title'),
      make('span', d.material, 'ws-card-line'),
      make('span', d.conditions.slice(0, 3).map(([k, v]) => `${k} ${v}`).join(' · '), 'ws-card-line type-data'),
      make('span', `Review: ${d.status}${d.inspectOnly ? ' · inspection only' : ''}`, 'ws-card-status'));
    b.addEventListener('click', () => onSelect(d.id));
    cards.set(d.id, b);
    li.append(b); list.append(li);
  }
  root.append(list);
  return { ...result, cards };
}

// Record detail: original citation, locator and test context. Escape closes and returns focus.
export function renderSourceDetail(root, row, evidence, { opener = null, onClose = () => {} } = {}) {
  const doc = root.ownerDocument, make = maker(doc);
  root.onkeydown = null;
  root.replaceChildren();
  if (!isObject(row)) return;
  const d = describeRecord(row, index(evidence).sources);
  const close = () => { root.onkeydown = null; root.replaceChildren(); onClose(); opener?.focus?.(); };
  root.onkeydown = event => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
  const section = make('section', undefined, 'ws-detail');
  section.setAttribute('aria-label', `Source record ${d.id}`);
  const head = make('div', undefined, 'ws-detail-head');
  head.append(make('h3', `Source record ${d.id}`));
  const closeButton = make('button', 'Close record'); closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close source record and return to the list');
  closeButton.addEventListener('click', close);
  head.append(closeButton);
  section.append(head);
  section.append(make('p', d.inspectOnly
    ? `Inspection only: ${d.status} record, not used for any label. Not certification.`
    : 'Verified record: may support a label when its conditions compare. Not certification.', d.inspectOnly ? 'ws-note' : 'text-2'));
  section.append(make('p', `${d.investigation} · ${d.material}`));
  section.append(conditionList(make, d.conditions));
  section.append(make('p', 'Measured source conditions above; the cabin request is a separate user input.', 'text-3'));
  const cite = make('p', undefined, 'ws-citation');
  if (d.citation.url) cite.append(link(make, d.citation.title, d.citation.url)); else cite.append(make('span', `${d.citation.title} (source URL unavailable)`));
  section.append(cite);
  section.append(make('p', `${d.citation.authors || 'Authors not stated'} · ${d.citation.year || 'Year not stated'}`, 'text-2'));
  if (d.citation.url && !d.citation.nasa) section.append(make('p', 'Non-NASA publication: not used for any label.', 'caveat'));
  section.append(make('p', `Locator: ${d.locator || 'not stated'}`, 'type-small ws-locator'));
  const more = make('details');
  more.append(make('summary', 'Method notes and record fields'));
  if (row.notes) more.append(make('p', String(row.notes)));
  more.append(conditionList(make, [
    ['Endpoint', reviewedEndpoint(row) ?? formatCondition(row.endpoint)], ['Outcome', formatCondition(row.outcome)],
    ['Value', reviewedEndpoint(row) ?? formatCondition(row.value, row.value_unit ?? '')], ['Flow', `${formatCondition(row.flow_speed_cm_s, 'cm/s')} · ${formatCondition(row.flow_direction)}`],
    ['Thickness', formatCondition(row.thickness_mm, 'mm')], ['Uncertainty', formatCondition(row.uncertainty)],
    ['Run', formatCondition(row.run_id)], ['Verifier', formatCondition(row.verified_by)],
  ], 'ws-conditions ws-conditions-wide'));
  section.append(more);
  const psi = make('p', 'Primary dataset: ');
  psi.append(link(make, 'NASA PSI Data Repository', PSI_URL));
  section.append(psi);
  root.append(section);
  closeButton.focus?.();
}

// HTML cabin-material controls: the fallback and companion to the illustrative model.
export function renderMaterialControls(root, { items = [], evidence, selectedId = null, onSelect = () => {} } = {}) {
  const doc = root.ownerDocument, make = maker(doc);
  const { rows } = index(evidence);
  const buttons = [];
  const list = (Array.isArray(items) ? items : []).filter(i => isObject(i) && typeof i.material_id === 'string' && i.material_id);
  root.replaceChildren();
  if (!list.length) {
    root.append(make('p', 'Load the lunar rover demo or add cabin items to choose materials.', 'text-3'));
    return buttons;
  }
  const ul = make('ul', undefined, 'ws-materials');
  ul.setAttribute('aria-label', 'Cabin items');
  for (const item of list) {
    const id = item.material_id;
    const mine = rows.filter(r => r.material_id === id);
    const verified = mine.filter(r => r.review_status === 'verified').length;
    const display = (Array.isArray(evidence?.materials) ? evidence.materials : []).find(m => m?.material_id === id)?.display_name;
    const li = make('li');
    const b = make('button', undefined, 'ws-material'); b.type = 'button';
    b.setAttribute('data-material-id', id);
    b.setAttribute('aria-pressed', String(selectedId === id));
    b.append(make('span', str(item.name) || str(display) || id, 'ws-card-title'),
      make('span', str(display) || id, 'ws-card-line'),
      make('span', `${mine.length} source record${mine.length === 1 ? '' : 's'} · ${verified} verified`, 'ws-card-status type-data'));
    b.addEventListener('click', () => onSelect(id));
    buttons.push(b);
    li.append(b); ul.append(li);
  }
  root.append(ul);
  return buttons;
}
