// Investigation dashboard: summary table, filters, rank-for-habitat with reasons, side-by-side compare.
// UI module (DESIGN.md). Rules live in src/rules/rank-investigations.js. Owner: B11.
import {
  HABITATS, NEEDS, COMPARE_FIELDS, field, facetValues, filterInvestigations,
  rankInvestigations, compareInvestigations,
} from '../rules/rank-investigations.js';

const CATALOG_URL = 'data/investigations.json';
const FIXTURE_URL = 'tests/fixtures/investigations.json';
const NOT_FOUND = 'Not found in the sources reviewed';

const SUMMARY_COLUMNS = [
  ['fire_safety_areas', 'Area'],
  ['objectives', 'Objectives'],
  ['fuel_type', 'Fuel'],
  ['fuel_sample', 'Sample shape / size'],
  ['o2_pct', 'O2 %'],
  ['pressure_kpa', 'Pressure kPa'],
  ['airflow_cm_s', 'Airflow cm/s'],
  ['gravity', 'Gravity'],
  ['variables_varied', 'What varied'],
  ['variables_fixed', 'What stayed fixed'],
  ['sensors', 'Sensors'],
  ['hardware', 'Hardware'],
  ['key_findings', 'Key findings'],
];
const NUMERIC = new Set(['o2_pct', 'pressure_kpa', 'airflow_cm_s']);
const GRAVITY_TEXT = { '0g': '0 g', '1g': '1 g', partial: 'partial g', 'partial-analog': 'partial-g analog' };
const FACTOR_TEXT = { need: 'Need', habitat: 'Habitat', o2: 'Oxygen', pressure: 'Pressure', gravity: 'Gravity' };

// Scoped styles until these move into src/styles.css (styles.css is not owned by B11).
const CSS = `
.inv-controls { display: flex; flex-wrap: wrap; gap: var(--space-12) var(--space-16); margin-bottom: var(--space-12); }
.inv-controls > div { min-width: 160px; }
.inv-banner { border-left: 2px solid var(--text-1); background: var(--surface-2); padding: var(--space-8) var(--space-12); margin-bottom: var(--space-12); }
.inv-cell-src { display: block; font-size: 12px; line-height: 16px; color: var(--text-3); }
.inv-cell-src a { color: var(--accent); }
.inv-unknown { color: var(--text-3); }
.inv-table td { min-width: 120px; }
.inv-table td.num { min-width: 88px; }
.inv-table th[scope="row"] { min-width: 140px; }
.inv-why td { background: var(--surface-2); }
.inv-why ul { margin: 0; padding-left: var(--space-16); }
.inv-why li { margin-bottom: var(--space-4); }
.inv-pts { font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--text-1); }
.inv-tag { display: inline-block; padding: 0 var(--space-4); border: 1px solid var(--border-control); border-radius: var(--radius-control); font-size: 12px; line-height: 16px; color: var(--text-2); }
.inv-tag-differ { border-style: dashed; }
.inv-compare-pickers { display: flex; flex-wrap: wrap; gap: var(--space-16); margin: var(--space-12) 0; }
.inv-subhead { margin: var(--space-16) 0 var(--space-8); }
.inv-name-btn { background: none; border: 0; padding: 0; color: var(--text-1); font: inherit; font-weight: 600; text-align: left; text-decoration: underline; min-height: 24px; }
`;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) node.append(c);
  return node;
}

// formatValue(key, value) -> display text. Exported for tests and other views.
export function formatValue(key, value) {
  if (value == null) return NOT_FOUND;
  if (key === 'gravity') return [].concat(value).map((g) => GRAVITY_TEXT[g] ?? g).join(', ');
  if (typeof value === 'number' && !Number.isFinite(value)) return NOT_FOUND;
  if (Array.isArray(value)) return value.length ? value.map((v) => formatValue(null, v)).join(', ') : NOT_FOUND;
  if (typeof value === 'object') {
    if ('min' in value) return value.min === value.max ? formatValue(null, value.min) : `${formatValue(null, value.min)}–${formatValue(null, value.max)}`;
    if ('value' in value) return formatValue(key, value.value);
    return NOT_FOUND;
  }
  return String(value);
}

// DESIGN.md 5.5: Title — locator, underlined, new tab with a hint.
function sourceLink(src, { short = false } = {}) {
  if (!src) return el('span', { class: 'inv-unknown' }, 'No source given in the catalog');
  const label = short ? 'Source' : src.title;
  const name = `${src.title}${src.locator ? `, ${src.locator}` : ''} (opens in new tab)`;
  const link = src.url
    ? el('a', { href: src.url, target: '_blank', rel: 'noopener', 'aria-label': name, title: name }, label)
    : el('span', {}, label);
  return el('span', {}, link, !short && src.locator ? el('span', { class: 'text-3' }, ` — ${src.locator}`) : null);
}

function valueCell(f, key, tag = 'td') {
  const known = f.value != null;
  return el(tag, { class: NUMERIC.has(key) ? 'num' : null },
    el('span', { class: known ? null : 'inv-unknown' }, formatValue(key, f.value)),
    f.note && known ? el('span', { class: 'inv-cell-src' }, f.note) : null,
    el('span', { class: 'inv-cell-src' }, sourceLink(f.source, { short: true })));
}

function select(id, labelText, options, value, onchange) {
  return el('div', {},
    el('label', { for: id }, labelText),
    el('select', { id, onchange: (e) => onchange(e.target.value) },
      options.map(([v, t]) => el('option', { value: v, selected: v === value }, t))));
}

function normalizeCatalog(catalog) {
  catalog = catalog && typeof catalog === 'object' ? catalog : {};
  let sources = catalog.sources && typeof catalog.sources === 'object' ? catalog.sources : {};
  if (Array.isArray(sources)) sources = Object.fromEntries(sources.filter((s) => s && typeof s === 'object').map((s) => [s.id ?? s.key, s]));
  // Judge click-through (#169): skip non-records; a record without id/name still gets a stable id and plain text.
  const investigations = (Array.isArray(catalog.investigations) ? catalog.investigations : [])
    .filter((inv) => inv && typeof inv === 'object')
    .map((inv, i) => {
      const name = typeof inv.name === 'string' ? inv.name : inv.name?.value;
      return { ...inv, id: inv.id ?? `entry-${i + 1}`, name: typeof name === 'string' && name ? name : 'Name not found in the sources reviewed' };
    });
  return { ...catalog, sources, investigations };
}

// renderInvestigations(root, catalog, opts) — draws the whole dashboard into root and keeps its own state.
export function renderInvestigations(root, rawCatalog, { fixture = false } = {}) {
  if (!document.getElementById('inv-styles')) document.head.append(el('style', { id: 'inv-styles' }, CSS));
  const catalog = normalizeCatalog(rawCatalog);
  const { investigations: all, sources } = catalog;
  const state = { habitat: 'lunar-base', need: 'any', area: 'all', fuelType: 'all', hardware: 'all', open: new Set(), a: all[0]?.id, b: all[1]?.id };

  const controls = el('div', { class: 'inv-controls' });
  const status = el('p', { role: 'status', 'aria-live': 'polite', class: 'text-2' });
  const summary = el('div', { class: 'table-scroll' });
  const compare = el('div');
  root.replaceChildren(
    fixture || catalog.fixture
      ? el('p', { class: 'inv-banner type-small' }, 'Development fixture: a few investigations copied from REDLINE research notes, not the full PSI catalog. The full catalog (B10) replaces it when data/investigations.json exists.')
      : '',
    el('p', { class: 'text-2 type-small' },
      'Ranking adds visible points per factor: need, habitat named in the catalog notes, oxygen and pressure overlap with the habitat atmosphere, and gravity. Open a row to see why. Partial-gravity results are not in PSI yet; 0 g and 1 g results can only bound them as an estimate.'),
    controls, status, summary,
    el('h3', { class: 'type-heading inv-subhead', id: 'inv-compare-heading' }, 'Compare two investigations'),
    compare,
  );

  const habitatOpts = HABITATS.map((h) => [h.id, h.name]);
  const needOpts = [['any', 'Any need'], ...NEEDS.map((n) => [n, n[0].toUpperCase() + n.slice(1)])];
  const facet = (key, allText) => [['all', allText], ...facetValues(all, key).map((v) => [v, v])];

  function drawControls() {
    const set = (k) => (v) => { state[k] = v; draw(); };
    controls.replaceChildren(
      select('inv-habitat', 'Rank for habitat', habitatOpts, state.habitat, set('habitat')),
      select('inv-need', 'Need', needOpts, state.need, set('need')),
      select('inv-area', 'Filter: fire-safety area', facet('fire_safety_areas', 'All areas'), state.area, set('area')),
      select('inv-fuel', 'Filter: fuel type', facet('fuel_type', 'All fuel types'), state.fuelType, set('fuelType')),
      select('inv-hardware', 'Filter: hardware', facet('hardware', 'All hardware'), state.hardware, set('hardware')),
    );
  }

  function whyRow(scored, habitat, colspan) {
    return el('tr', { class: 'inv-why', id: `inv-why-${scored.id}` },
      el('td', { colspan },
        el('p', { class: 'type-small text-2' }, `Why ${scored.name} scores ${scored.score} of ${scored.max} for ${habitat.name.toLowerCase()}:`),
        el('ul', {}, scored.reasons.map((r) => el('li', { class: 'type-small' },
          el('span', { class: 'inv-pts' }, `+${r.points}/${r.max} `),
          el('strong', {}, `${FACTOR_TEXT[r.factor] ?? r.factor}: `), r.why, ' ',
          r.sources.length
            ? el('span', { class: 'text-3' }, '[', r.sources.flatMap((s, i) => [i ? '; ' : '', sourceLink(s)]), ']')
            : el('span', { class: 'inv-unknown' }, '[no source given in the catalog]')))),
      ));
  }

  function drawSummary() {
    const shown = filterInvestigations(all, state);
    const habitat = HABITATS.find((h) => h.id === state.habitat);
    const ranked = rankInvestigations(shown, { habitat: state.habitat, need: state.need }, sources);
    const byId = new Map(shown.map((i) => [i.id, i]));
    const needText = state.need === 'any' ? 'any need' : state.need;
    status.textContent = `${shown.length} of ${all.length} investigations, ranked for ${habitat.name.toLowerCase()} and ${needText}.`;
    if (!shown.length) {
      summary.replaceChildren(el('p', { class: 'text-2' }, 'No investigations match these filters.'));
      return;
    }
    const colspan = SUMMARY_COLUMNS.length + 3;
    const rows = ranked.flatMap((s) => {
      const inv = byId.get(s.id);
      const psi = field(inv, 'psi_id', sources);
      const open = state.open.has(s.id);
      const row = el('tr', {},
        el('td', { class: 'num' }, String(s.rank)),
        el('th', { scope: 'row' },
          el('button', {
            class: 'inv-name-btn', type: 'button', 'aria-expanded': String(open), 'aria-controls': `inv-why-${s.id}`,
            onclick: () => { open ? state.open.delete(s.id) : state.open.add(s.id); drawSummary(); },
          }, s.name),
          el('span', { class: 'inv-cell-src' }, psi.value ?? 'PSI id not found in the sources reviewed', ' · ', sourceLink(psi.source, { short: true }))),
        el('td', { class: 'num' }, el('span', { class: 'inv-pts' }, `${s.score}/${s.max}`), el('span', { class: 'inv-cell-src' }, open ? 'Reasons shown below' : 'Open the name for reasons')),
        SUMMARY_COLUMNS.map(([key]) => valueCell(field(inv, key, sources), key)));
      return open ? [row, whyRow(s, habitat, colspan)] : [row];
    });
    summary.replaceChildren(el('table', { class: 'inv-table', 'aria-labelledby': 'investigations-heading' },
      el('thead', {}, el('tr', {},
        el('th', { scope: 'col', class: 'num' }, 'Rank'),
        el('th', { scope: 'col' }, 'Investigation'),
        el('th', { scope: 'col', class: 'num', 'aria-sort': 'descending' }, 'Score'),
        SUMMARY_COLUMNS.map(([key, label]) => el('th', { scope: 'col', class: NUMERIC.has(key) ? 'num' : null }, label)))),
      el('tbody', {}, rows)));
  }

  function drawCompare() {
    const opts = all.map((i) => [i.id, i.name]);
    const set = (k) => (v) => { state[k] = v; drawCompare(); };
    const pickers = el('div', { class: 'inv-compare-pickers' },
      select('inv-cmp-a', 'Investigation A', opts, state.a, set('a')),
      select('inv-cmp-b', 'Investigation B', opts, state.b, set('b')));
    const a = all.find((i) => i.id === state.a);
    const b = all.find((i) => i.id === state.b);
    if (!a || !b || a === b) {
      compare.replaceChildren(pickers, el('p', { class: 'text-2' }, 'Pick two different investigations.'));
      return;
    }
    const { same, differ } = compareInvestigations(a, b, sources);
    const table = (rows, kind) => el('div', { class: 'table-scroll' }, el('table', {},
      el('thead', {}, el('tr', {},
        el('th', { scope: 'col' }, 'Attribute'), el('th', { scope: 'col' }, a.name), el('th', { scope: 'col' }, b.name),
        el('th', { scope: 'col' }, 'Result'))),
      el('tbody', {}, rows.map((r) => el('tr', {},
        el('th', { scope: 'row' }, r.label), valueCell(r.a, r.key), valueCell(r.b, r.key),
        el('td', {}, kind === 'same'
          ? el('span', { class: 'inv-tag' }, 'Same')
          : el('span', {},
            el('span', { class: 'inv-tag inv-tag-differ' }, r.a.value == null || r.b.value == null ? 'Cannot compare' : 'Differs'),
            r.shared.length ? el('span', { class: 'inv-cell-src' }, `Shared: ${r.shared.join(', ')}`) : null)))))));
    compare.replaceChildren(pickers,
      el('p', { class: 'text-2 type-small' }, `${same.length} attributes the same, ${differ.length} differ or cannot be compared (a value not found in the sources reviewed is never counted as the same).`),
      el('h4', { class: 'type-label inv-subhead' }, 'What is the same'),
      same.length ? table(same, 'same') : el('p', { class: 'text-3' }, 'No attributes match.'),
      el('h4', { class: 'type-label inv-subhead' }, 'What differs'),
      differ.length ? table(differ, 'differ') : el('p', { class: 'text-3' }, 'No differences in the compared attributes.'));
  }

  function draw() {
    drawControls();
    drawSummary();
  }
  draw();
  drawCompare();
  return state;
}

// loadInvestigations() -> { catalog, fixture } — B10's catalog if present, else the dev fixture.
export async function loadInvestigations(url = CATALOG_URL, fallback = FIXTURE_URL) {
  const res = await fetch(url);
  if (res.ok) return { catalog: await res.json(), fixture: false };
  const fb = await fetch(fallback);
  if (!fb.ok) throw new Error(`${url}: HTTP ${res.status}; ${fallback}: HTTP ${fb.status}`);
  return { catalog: await fb.json(), fixture: true };
}

async function boot() {
  const root = document.getElementById('investigations-root');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  root.textContent = 'Loading investigations…';
  try {
    const { catalog, fixture } = await loadInvestigations();
    renderInvestigations(root, catalog, { fixture });
  } catch (err) {
    root.replaceChildren(el('p', { role: 'alert' }, `Investigation catalog could not be loaded (${err.message}). `),
      el('button', { type: 'button', onclick: () => { delete root.dataset.mounted; boot(); } }, 'Retry'));
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
