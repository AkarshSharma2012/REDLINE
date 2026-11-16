// Entry point: loads data/evidence.json and wires the UI to the rules (S1 §2-3).
// #337: four top sections (Model, Evidence, Investigations, Review brief); the older screens
// open as sub-views inside them and keep their hashes (src/ui/section-nav.js).
// The Investigations tab mounts itself (src/ui/investigations.js has its own <script> tag),
// independently of the Cabin Check default if evidence.json fails to load.
import { labelCabin } from './rules/label.js';
import { renderCabinForm } from './ui/cabin-form.js';
import { buildCabinQuery } from './ui/cabin-query.js';
import { renderResultsTable } from './ui/results-table.js';
import { renderEvidencePanel } from './ui/evidence-panel.js';
import { renderO2Slider } from './ui/o2-slider.js';
import { renderFixes } from './ui/fixes.js';
import { renderGravityView } from './ui/gravity-view.js';
import { loadAccuracyReport, renderAccuracyView } from './ui/accuracy-view.js';
import { mountAsk } from './ui/ask.js';
import { validateEvidence } from './schema/validate.js';
import { mountWorkspace } from './ui/workspace.js';
import { mountReviewCockpit } from './ui/review-cockpit.js';
import { triageQuery } from './ui/cockpit-model.js';
import { SECTIONS, routeFromHash, applyRoute, nextSection, wireHelp } from './ui/section-nav.js';

const EVIDENCE_URL = 'data/evidence.json';

export const TABS = SECTIONS;

// Illustrative lunar pressurized rover cabin (screens.md §7, docs/pitch.md 0:00-0:20).
// Item uses are hypothetical, not a real rover manifest. Atmosphere: the form's default
// sourced exploration preset (56.5 kPa / 34% O2, R7-S4); gravity: lunar scenario (0.16 g).
export const ROVER_DEMO = Object.freeze({
  name: 'Lunar pressurized rover cabin (illustrative)',
  items: Object.freeze([
    { material_id: 'pmma', name: 'Window / display panel', use: 'Cabin window and display cover', form: 'sheet' },
    { material_id: 'cotton', name: 'Crew clothing', use: 'Worn by crew in the cabin', form: 'fabric' },
    { material_id: 'p213', name: 'Hardware tape', use: 'Cable and stowage tape', form: 'tape' },
    { material_id: 'nomex', name: 'Seat cover', use: 'Crew seat upholstery', form: 'fabric' },
  ]),
});

export async function loadEvidence(url = EVIDENCE_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const evidence = await res.json();
  // Reject invalid datasets before any UI or engine can mistake them for missing coverage.
  const validation = validateEvidence(evidence);
  if (!validation.ok) throw new Error(`${url}: validation failed: ${validation.errors[0]}`);
  return evidence;
}

// tabFromHash('#gravity') -> 'gravity' (a view); '#cabin' and anything unknown -> 'model'.
export function tabFromHash(hash = '') {
  return routeFromHash(hash).view;
}

// label.js takes only verified rows (S1 §3.2); drafts stay inspectable in the evidence panel.
export function verifiedOnly(evidence) {
  return { ...evidence, evidence: (evidence?.evidence ?? []).filter((r) => r.review_status === 'verified') };
}

// The cabin form state -> engine labels, using verified rows and the material registry only.
export function evaluateCabin(state, evidence, evaluate = labelCabin) {
  return evaluate(buildCabinQuery(state), verifiedOnly(evidence));
}

// Each result carries an immutable query snapshot (material line + cabin conditions) so the
// evidence panel and experiment cards compare against what the user actually asked.
export function withQueries(results, cabinQuery) {
  return results.map((result, i) => ({
    ...result,
    query: Object.freeze({ ...cabinQuery.conditions, ...cabinQuery.materials[i] }),
  }));
}

// Workspace bridge (#277): the model and HTML cabin items select a result by material ID.
export function resultForMaterial(results, materialId) {
  return (Array.isArray(results) ? results : []).find((r) => r?.query?.material_id === materialId) ?? null;
}

// Three-pane workspace (layout, source browser, optional illustrative model). It is a
// progressive enhancement: if it cannot mount, Cabin Check works exactly as before.
let workspace = null;
function startWorkspace() {
  try {
    workspace = mountWorkspace({ onSelectMaterial: (id) => current.selectMaterial(id) });
  } catch (err) {
    workspace = null;
  }
}

function showTab(id, { focus = false } = {}) {
  const route = routeFromHash(id);
  applyRoute(document, route);
  if (focus) document.getElementById(`tab-${route.section}`)?.focus();
  workspace?.setActive(route.section === 'model');
  onShow[route.view]?.();
}

const onShow = {};

function wireTabs() {
  const list = document.getElementById('tabs');
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[role="tab"]');
    if (button) location.hash = button.id.replace('tab-', '');
  });
  // Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern).
  list.addEventListener('keydown', (event) => {
    const next = nextSection(routeFromHash(location.hash).section, event.key);
    if (!next) return;
    event.preventDefault();
    history.replaceState(null, '', `#${next}`);
    showTab(next, { focus: true });
  });
  window.addEventListener('hashchange', () => showTab(tabFromHash(location.hash)));
  showTab(tabFromHash(location.hash));
}

// Evidence triage (#321) and research brief (#322) load as optional modules: if either is
// missing the cockpit says so and Cabin Check keeps working.
export async function loadReviewEngines(load = (path) => import(path)) {
  const [triage, brief] = await Promise.allSettled([load('./rules/evidence-triage.js'), load('./rules/research-brief.js')]);
  return {
    buildTriage: triage.status === 'fulfilled' ? triage.value.buildEvidenceTriage ?? null : null,
    brief: brief.status === 'fulfilled' ? brief.value : null,
  };
}

// Cockpit input: the same cabin query the labels use, plus BOM line names; duplicates kept.
export function reviewTriage(formState, evidence, buildTriage) {
  if (typeof buildTriage !== 'function') throw new Error('evidence triage module unavailable');
  return buildTriage(triageQuery(buildCabinQuery(formState), formState), evidence);
}

export function wireCabin(evidence, { labelCabin: evaluate = labelCabin, document: doc = globalThis.document, workspace: ws = null,
  cockpit = null, buildTriage = null } = {}) {
  const $ = (id) => doc.getElementById(id);
  const verified = verifiedOnly(evidence);
  let cabinQuery = null;
  let shown = [];
  let form = null;
  let slider = null;

  function showResults(results, query) {
    cabinQuery = query;
    const withQ = withQueries(results, query);
    shown = withQ;
    const context = { cabinQuery: query, evidence };
    $('evidence-panel').replaceChildren(Object.assign(doc.createElement('p'),
      { className: 'text-3', textContent: 'Select a material to see the tests behind its label.' }));
    renderResultsTable($('results-table'), withQ, {
      evidence,
      items: query.materials,
      onSelect: (result) => {
        renderEvidencePanel($('evidence-panel'), result, evidence, { query: result.query });
        ws?.selectMaterial(result.query?.material_id, { notify: false });
      },
    });
    renderFixes($('fixes'), withQ, context);
    slider?.update(query);
    ws?.update({ cabinQuery: query, results: withQ });
    refreshCockpit(query);
  }

  // Analysis and exported brief are rebuilt together from the current inputs only.
  function refreshCockpit(query) {
    if (!cockpit) return;
    try {
      cockpit.update({ triage: reviewTriage(query, evidence, buildTriage), evidence, scenarioName: query.name ?? '' });
    } catch (err) {
      cockpit.clear(`Evidence review unavailable (${err.message}). No analysis or brief is shown.`);
    }
  }

  // Model or HTML cabin item -> the same engine result and evidence panel as the results table.
  // Works with 0 verified rows, when the table shows no rows: drafts stay inspection only.
  function selectMaterial(materialId) {
    const result = resultForMaterial(shown, materialId);
    cockpit?.selectLineByMaterial(materialId);
    if (!result) return false;
    $('results-table').querySelectorAll?.('button[aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    renderEvidencePanel($('evidence-panel'), result, evidence, { query: result.query });
    return true;
  }

  // labelCabin (#55) takes the DATASET ({ evidence, materials }), not the row array: passing
  // the array made every label "Not found in the sources reviewed" (persona B2 finding).
  function evaluateForm(state) {
    return evaluateCabin(state, evidence, evaluate);
  }

  function changed(state, { valid }) {
    if (!state.materials.length || !valid) {
      cabinQuery = null;
      shown = [];
      ws?.update({ cabinQuery: null, results: [] });
      cockpit?.clear(state.materials.length
        ? 'Correct the cabin fields to update the review. The previous analysis and brief were cleared.'
        : 'Add a material or load the lunar rover scenario to start a review.');
      slider?.destroy(); slider = null;
      $('evidence-panel').replaceChildren();
      $('fixes').replaceChildren();
      // Empty input takes precedence over the dataset's zero-verified-row state.
      renderResultsTable($('results-table'), [], { evidence: {} });
      if (state.materials.length) {
        $('results-table').querySelector('[role="status"]').textContent =
          'Correct the cabin fields to update results. Previous labels have been cleared.';
      }
      return;
    }
    showResults(evaluateForm(state), state);
  }

  function mountForm(items = []) {
    form?.destroy();
    form = renderCabinForm($('cabin-form'), {
      materials: evidence.materials,
      presets: evidence.cabin_presets,
      sources: evidence.sources,
      evidence: verified,
      items,
      evaluate: evaluateForm,
      onChange: changed,
      onEvaluate: showResults,
    });
    // Initialize results after the form has installed presets and demo items.
    // The normal input path supplies validation without moving keyboard focus.
    $('cabin-form').querySelector('form').dispatchEvent(new Event('input', { bubbles: true }));
  }

  // The form exposes no condition setter, so Apply from the O2 preview edits its inputs and
  // re-evaluates; the scenario (items, name, flow, gravity) is untouched.
  function applyConditions(next) {
    const root = $('cabin-form');
    const set = (name, value) => {
      const input = root.querySelector(`[name="${name}"]`);
      if (!input) return;
      input.value = String(value);
      input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    };
    set('unit', 'kpa');
    set('pressure', next.conditions.pressure_kpa);
    set('o2', next.conditions.o2_pct);
    root.querySelector('form')?.requestSubmit();
  }

  function loadRoverDemo() {
    mountForm(ROVER_DEMO.items);
    const name = $('cabin-form').querySelector('[name="name"]');
    if (name) name.value = ROVER_DEMO.name;
    $('cabin-form').querySelector('form')?.requestSubmit();
  }

  mountForm();
  current.loadRoverDemo = loadRoverDemo;
  $('rover-demo').disabled = false;
  $('rover-demo').addEventListener('click', loadRoverDemo);

  onShow.oxygen = () => {
    const root = $('o2-slider');
    if (!cabinQuery) {
      slider?.destroy(); slider = null;
      root.replaceChildren(Object.assign(doc.createElement('p'), { className: 'text-2',
        textContent: 'Evaluate a cabin in Model first (or load the lunar rover demo). The preview holds that cabin\'s items, pressure, airflow and gravity fixed.' }));
      return;
    }
    if (slider) return;
    root.replaceChildren();
    slider = renderO2Slider(root, {
      cabinQuery, evidence,
      labelCabin: (query, dataset) => evaluateCabin(query, dataset, evaluate),
      onApply: (next) => { applyConditions(next); location.hash = 'model'; },
      onCancel: () => { location.hash = 'model'; },
    });
  };

  current.query = () => cabinQuery;
  current.selectMaterial = selectMaterial;
}

// Shared with the gravity view, which needs no evidence.json and works even if it fails to load.
const current = { query: () => null, selectMaterial: () => false, loadRoverDemo: () => {} };

let gravity = null;
onShow.gravity = () => {
  gravity?.destroy();
  gravity = renderGravityView(document.getElementById('gravity-view'), {
    request: current.query()?.conditions,
    onBack: () => { location.hash = 'model'; },
  });
};

async function wireAccuracy(evidence) {
  const root = document.getElementById('accuracy-view');
  try {
    const rows = await loadAccuracyReport();
    renderAccuracyView(root, rows, { sources: evidence?.sources ?? {}, onBack: () => { location.hash = 'model'; } });
  } catch (err) {
    root.textContent = `Accuracy report could not be loaded (${err.message}).`;
  }
}

// Header status rail: counts come only from the loaded evidence file, never from markup.
export function datasetStatus(evidence) {
  const rows = evidence?.evidence ?? [];
  return { rows: rows.length, verified: rows.filter((r) => r.review_status === 'verified').length };
}

export function showDataset(evidence, doc = document) {
  const { rows, verified } = datasetStatus(evidence);
  doc.getElementById('dataset').textContent =
    `Dataset ${evidence.built_from ?? 'revision not stated'} · built ${evidence.built_at ?? 'date not stated'} · ${rows} evidence rows, ${verified} verified (labels use verified rows only).`;
  showRail(doc, String(rows), String(verified), verified === 0 ? 'none' : 'some');
}

function showRail(doc, rows, verified, state) {
  const rowsCell = doc.getElementById('rail-rows'), verifiedCell = doc.getElementById('rail-verified');
  if (rowsCell) rowsCell.textContent = rows;
  if (verifiedCell) { verifiedCell.textContent = verified; verifiedCell.parentElement?.setAttribute('data-state', state); }
}

let cockpit = null;
function startCockpit(brief) {
  const root = document.getElementById('review-cockpit');
  if (!root) return null;
  try {
    return mountReviewCockpit(root, {
      brief,
      onLoadScenario: () => current.loadRoverDemo(),
      onSelectLine: (item) => workspace?.selectMaterial(item.material_id, { notify: false }),
    });
  } catch (err) {
    root.textContent = `Evidence review could not start (${err.message}).`;
    return null;
  }
}

async function start() {
  startWorkspace();
  wireHelp(document);
  wireTabs();
  const status = document.getElementById('status');
  status.textContent = 'Loading evidence…';
  const engines = await loadReviewEngines();
  cockpit = startCockpit(engines.brief);
  let evidence;
  try {
    evidence = await loadEvidence();
  } catch (err) {
    status.textContent = `Evidence file could not be loaded (${err.message}). `;
    const retry = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Retry' });
    retry.addEventListener('click', () => location.reload());
    status.append(retry);
    showRail(document, 'unavailable', 'unavailable', 'unavailable');
    cockpit?.clear('Evidence file unavailable. No analysis or brief is shown.');
    workspace?.setEvidence(null);
    renderResultsTable(document.getElementById('results-table'), [], {
      state: 'error', onRetry: () => location.reload(),
    });
    wireAccuracy(null);
    mountAsk(document.getElementById('ask-root'), null);
    return;
  }
  status.textContent = '';
  showDataset(evidence);
  workspace?.setEvidence(evidence);
  wireCabin(evidence, { workspace, cockpit, buildTriage: engines.buildTriage });
  wireAccuracy(evidence);
  mountAsk(document.getElementById('ask-root'), evidence).catch((err) => {
    document.getElementById('ask-root').textContent = `Ask REDLINE could not start (${err.message}).`;
  });
  showTab(tabFromHash(location.hash));
}

if (typeof document !== 'undefined') {
  // Minimal non-browser test fixtures have no DOM realm. In the browser wait for
  // the local island, then mount synchronously before attaching native handlers.
  if (document.defaultView?.HTMLElement && document.querySelectorAll) {
    import('./vendor/react-controls.js').then(({ mountReactControls }) => {
      mountReactControls();
    }).catch(() => { /* Native controls remain usable if enhancement fails. */ })
      .then(() => start());
  } else start();
}
