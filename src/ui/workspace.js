// #277/#297 three-pane evidence workspace: layout preferences, pane configuration, the
// illustrative cabin model bridge, selection sync between cabin items, the source
// browser and the model, and the shell chrome (layout popover, phone pane switch,
// bottom summary strip). It never evaluates evidence, never changes review state and
// never persists anything except layout preferences.
import { filterSources, renderSourceBrowser, renderSourceDetail, renderMaterialControls } from './workspace-evidence.js';
import { createMotion } from './workspace-motion.js';

export const PREFS_KEY = 'redline.workspace.v1';
const VERSION = 1;
export const WIDTH_STEP = 20;
export const PANE_BOUNDS = Object.freeze({
  controls: Object.freeze({ min: 220, max: 400, default: 240 }),
  sources: Object.freeze({ min: 300, max: 560, default: 400 }),
});
export const DEFAULT_PREFS = Object.freeze({
  controls: 240, sources: 400, controlsOpen: true, sourcesOpen: true, density: 'comfortable', view: 'evidence',
});
export const VIEWER_LABEL = 'Illustrative cabin model - not a fire simulation';
const DENSITIES = ['comfortable', 'compact'];
const VIEWS = ['evidence', 'model'];
const PANES = ['controls', 'sources'];
export const SEPARATOR_PX = 1;
export const NARROW_QUERY = '(max-width: 1080px)';
const JUMPS = ['controls', 'sources', 'visual'];

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const clamp = (pane, value) => Math.min(PANE_BOUNDS[pane].max, Math.max(PANE_BOUNDS[pane].min, Math.round(value)));

// Stored values are untrusted: wrong version, type or range falls back per field.
export function sanitizePrefs(raw) {
  const p = { ...DEFAULT_PREFS };
  if (!isObject(raw) || raw.v !== VERSION) return p;
  for (const pane of PANES) {
    if (typeof raw[pane] === 'number' && Number.isFinite(raw[pane])) p[pane] = clamp(pane, raw[pane]);
    if (typeof raw[`${pane}Open`] === 'boolean') p[`${pane}Open`] = raw[`${pane}Open`];
  }
  if (DENSITIES.includes(raw.density)) p.density = raw.density;
  if (VIEWS.includes(raw.view)) p.view = raw.view;
  return p;
}

export function readPrefs(storage) {
  try {
    const text = storage?.getItem?.(PREFS_KEY);
    return sanitizePrefs(typeof text === 'string' ? JSON.parse(text) : null);
  } catch { return sanitizePrefs(null); }
}

export function writePrefs(storage, prefs) {
  try {
    storage.setItem(PREFS_KEY, JSON.stringify({ v: VERSION, ...sanitizePrefs({ ...prefs, v: VERSION }) }));
    return true;
  } catch { return false; }
}

export function resizePane(prefs, pane, delta) {
  if (!PANE_BOUNDS[pane]) return prefs;
  return { ...prefs, [pane]: clamp(pane, (prefs[pane] ?? PANE_BOUNDS[pane].default) + Number(delta || 0)) };
}

const setPane = (prefs, pane, value) => ({ ...prefs, [pane]: clamp(pane, value) });

export function layoutColumns(p) {
  const col = pane => (p[`${pane}Open`] ? `${p[pane]}px ${SEPARATOR_PX}px` : '0 0');
  return `${col('controls')} ${col('sources')} minmax(0, 1fr)`;
}

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

const inert = () => ({
  update() {}, setEvidence() {}, selectMaterial: () => false, setActive() {}, destroy() {},
  getPrefs: () => ({ ...DEFAULT_PREFS }), counts: () => ({ total: 0, matched: 0, verified: 0 }),
  viewerReady: () => Promise.resolve(null),
});

export function mountWorkspace({
  document: doc = globalThis.document, storage = defaultStorage(), window: win = globalThis.window ?? null,
  motion, loadViewer = () => import('./rover-viewer.js'), onSelectMaterial = () => {},
} = {}) {
  const $ = id => doc?.getElementById?.(id) ?? null;
  const main = $('panel-cabin'), toolbar = $('workspace-toolbar');
  if (!main || !toolbar || typeof main.style?.setProperty !== 'function') return inert();
  const anim = motion === undefined ? createMotion({ window: win }) : motion;
  const disposers = [];
  const on = (el, type, fn) => { if (typeof el?.addEventListener !== 'function') return; el.addEventListener(type, fn); disposers.push(() => el.removeEventListener(type, fn)); };

  let prefs = readPrefs(storage);
  let evidence; // undefined = loading, null = unavailable
  let cabin = { materials: [], conditions: Object.freeze({}) };
  let selectedMaterialId = null, selectedSourceId = null;
  let filters = { text: '', review: 'all', materialId: null };
  let cards = new Map(), materialButtons = [];
  let active = true, destroyed = false, pane = 'sources';
  const viewer = { promise: null, handle: null };

  // ---- Layout configuration ----
  function applyPrefs() {
    main.style.setProperty('--ws-columns', layoutColumns(prefs));
    main.setAttribute('data-density', prefs.density);
    main.setAttribute('data-view', prefs.view);
    for (const pane of PANES) {
      const open = prefs[`${pane}Open`];
      const section = $(`ws-pane-${pane}`), sep = $(`ws-sep-${pane}`), toggle = $(`ws-toggle-${pane}`);
      if (section) section.hidden = !open;
      if (sep) { sep.hidden = !open; sep.setAttribute('aria-valuenow', String(prefs[pane])); }
      toggle?.setAttribute('aria-pressed', String(open));
      toggle?.setAttribute('aria-expanded', String(open));
    }
    for (const d of DENSITIES) $(`ws-density-${d}`)?.setAttribute('aria-pressed', String(prefs.density === d));
    for (const v of VIEWS) $(`ws-view-${v}`)?.setAttribute('aria-pressed', String(prefs.view === v));
    const modelRoot = $('rover-viewer-root'), empty = $('ws-stage-empty'), load = $('ws-load-model');
    if (modelRoot) modelRoot.hidden = prefs.view !== 'model';
    if (empty) empty.hidden = prefs.view === 'model';
    if (load) load.textContent = viewer.promise ? 'Show rover model' : 'Load rover model';
    if (prefs.view === 'model') ensureViewer();
    showViewer();
  }

  function commit(next, { save = true } = {}) {
    const before = prefs;
    prefs = sanitizePrefs({ ...next, v: VERSION });
    if (save) writePrefs(storage, prefs);
    applyPrefs();
    for (const pane of PANES) if (!before[`${pane}Open`] && prefs[`${pane}Open`]) anim?.enter?.($(`ws-pane-${pane}`));
  }

  for (const pane of PANES) {
    on($(`ws-toggle-${pane}`), 'click', () => commit({ ...prefs, [`${pane}Open`]: !prefs[`${pane}Open`] }));
    on($(`ws-narrow-${pane}`), 'click', () => commit(resizePane(prefs, pane, -WIDTH_STEP)));
    on($(`ws-widen-${pane}`), 'click', () => commit(resizePane(prefs, pane, WIDTH_STEP)));
    wireSeparator(pane);
  }
  for (const d of DENSITIES) on($(`ws-density-${d}`), 'click', () => commit({ ...prefs, density: d }));
  for (const v of VIEWS) on($(`ws-view-${v}`), 'click', () => commit({ ...prefs, view: v }));
  on($('ws-reset'), 'click', () => commit({ ...DEFAULT_PREFS }));
  on($('ws-load-model'), 'click', () => commit({ ...prefs, view: 'model' }));
  for (const target of JUMPS) on($(`ws-jump-${target}`), 'click', () => showPane(target, { focus: true }));

  // Phones and tablets show one pane at a time (CSS keys off data-pane below 1080 px);
  // desktop ignores the attribute. Opening a pane re-opens it if it was collapsed.
  const narrow = () => { try { return Boolean(win?.matchMedia?.(NARROW_QUERY)?.matches); } catch { return false; } };
  function showPane(target, { focus = false, reopen = true } = {}) {
    if (!JUMPS.includes(target)) return;
    const changed = pane !== target;
    pane = target;
    main.setAttribute('data-pane', target);
    for (const t of JUMPS) $(`ws-jump-${t}`)?.setAttribute('aria-pressed', String(t === target));
    if (reopen && PANES.includes(target) && !prefs[`${target}Open`]) commit({ ...prefs, [`${target}Open`]: true });
    else if (changed && narrow()) anim?.enter?.($(`ws-pane-${target}`));
    if (focus) $(`ws-pane-${target}`)?.focus?.({ preventScroll: true });
  }
  // A selection made in the records pane shows its detail; on a phone that means switching panes.
  function revealVisual() {
    const moved = pane !== 'visual';
    showPane('visual');
    if (moved && narrow()) $('ws-pane-visual')?.focus?.({ preventScroll: true });
  }

  // Overlay disclosures (Layout settings, masthead scope notes): Escape closes and returns
  // focus to the summary; a pointerdown outside closes. Native details otherwise.
  const popovers = [$('ws-settings'), doc.querySelector?.('.mission-notes')].filter(Boolean);
  const close = (d, restore) => { d.open = false; if (restore) d.querySelector?.('summary')?.focus?.(); };
  for (const d of popovers) {
    on(d, 'keydown', event => { if (event.key === 'Escape' && d.open) { event.preventDefault(); close(d, true); } });
  }
  // Below 1080 px the scope notes expand in flow, so closing them on a tap would shift content.
  const overlay = d => d.id === 'ws-settings' || !narrow();
  on(doc, 'pointerdown', event => { for (const d of popovers) if (d.open && overlay(d) && !d.contains?.(event.target)) close(d, false); });

  // Separator: drag, or keyboard (arrows step, Home/End bounds, Enter resets this pane).
  function wireSeparator(pane) {
    const sep = $(`ws-sep-${pane}`);
    let drag = null;
    on(sep, 'keydown', event => {
      const b = PANE_BOUNDS[pane];
      const next = { ArrowLeft: prefs[pane] - WIDTH_STEP, ArrowRight: prefs[pane] + WIDTH_STEP,
        Home: b.min, End: b.max, Enter: b.default }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      commit(setPane(prefs, pane, next));
    });
    on(sep, 'dblclick', () => commit(setPane(prefs, pane, PANE_BOUNDS[pane].default)));
    on(sep, 'pointerdown', event => {
      if (event.button !== 0) return;
      drag = { x: event.clientX, width: prefs[pane], id: event.pointerId };
      try { sep.setPointerCapture?.(event.pointerId); } catch { /* capture is optional */ }
      event.preventDefault?.();
    });
    on(sep, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      commit(setPane(prefs, pane, drag.width + (event.clientX - drag.x)), { save: false });
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const width = drag.width + (Number.isFinite(event.clientX) ? event.clientX - drag.x : 0);
      drag = null;
      try { sep.releasePointerCapture?.(event.pointerId); } catch { /* already released */ }
      commit(setPane(prefs, pane, width));
    };
    on(sep, 'pointerup', end);
    on(sep, 'pointercancel', end);
  }

  // ---- Illustrative model: loaded only when requested; any failure keeps HTML controls ----
  function viewerStatus(text) { const s = $('ws-viewer-status'); if (s) s.textContent = text; }
  function pushViewer() {
    if (!viewer.handle) return;
    try {
      viewer.handle.update({ materialIds: cabin.materials.map(m => m.material_id), selectedMaterialId, conditions: cabin.conditions });
    } catch { viewerStatus('Model update failed; use the cabin item list. Evidence is unaffected.'); }
  }
  function showViewer() {
    try { viewer.handle?.setVisible(active && prefs.view === 'model'); } catch { /* viewer optional */ }
  }
  function ensureViewer() {
    if (viewer.promise) return viewer.promise;
    viewerStatus('Loading illustrative model…');
    viewer.promise = (async () => {
      try {
        const mod = await loadViewer();
        if (typeof mod?.mountRoverViewer !== 'function') throw new Error('viewer module missing');
        const handle = await mod.mountRoverViewer($('rover-viewer-root'), { onSelectMaterial: id => { selectMaterial(id); } });
        if (!['update', 'setVisible', 'destroy'].every(k => typeof handle?.[k] === 'function')) throw new Error('viewer handle invalid');
        if (destroyed) { handle.destroy(); return null; }
        viewer.handle = handle;
        viewerStatus('');
        pushViewer();
        showViewer();
        return handle;
      } catch {
        viewerStatus('Model unavailable in this browser; use the cabin item list below. Evidence is unaffected.');
        return null;
      }
    })();
    return viewer.promise;
  }

  // ---- Bottom summary strip: real counts from the evidence file and the current selection ----
  function renderInfo() {
    const records = $('ws-info-records'), picked = $('ws-info-selected');
    if (records) {
      const r = filterSources(evidence, filters);
      records.textContent = evidence === undefined ? 'loading' : !r.ok ? 'unavailable'
        : `${r.matched} of ${r.total} shown · ${r.verified} verified`;
    }
    if (picked) {
      const parts = [selectedMaterialId && `material ${selectedMaterialId}`, selectedSourceId && `record ${selectedSourceId}`].filter(Boolean);
      picked.textContent = parts.length ? parts.join(' · ') : 'none';
    }
  }

  // ---- Source browser, record detail and cabin item controls ----
  function renderBrowser() {
    renderInfo();
    const host = $('ws-sources');
    if (!host) return;
    if (evidence === undefined) { host.replaceChildren(Object.assign(doc.createElement('p'), { className: 'text-3', textContent: 'Loading source records…' })); return; }
    const focused = doc.activeElement?.id;
    const out = renderSourceBrowser(host, { evidence, state: { ...filters, selectedId: selectedSourceId }, onSelect: selectSource, onFilter: setFilters });
    cards = out.cards ?? new Map();
    if (focused === 'ws-filter-text' || focused === 'ws-filter-review') {
      const el = $(focused); el?.focus?.();
      if (focused === 'ws-filter-text') try { el?.setSelectionRange?.(el.value.length, el.value.length); } catch { /* not a text input */ }
    }
  }
  function setFilters(next) {
    filters = { text: String(next?.text ?? ''), review: String(next?.review ?? 'all'), materialId: allowedMaterial(next?.materialId) ? next.materialId : null };
    renderBrowser();
  }
  function markCards() { for (const [id, b] of cards) b.setAttribute('aria-pressed', String(id === selectedSourceId)); renderInfo(); }
  function selectSource(id) {
    const row = filterSources(evidence).rows.find(r => r.evidence_id === id);
    if (!row) return;
    selectedSourceId = id;
    markCards();
    const host = $('ws-source-detail');
    if (!host) return;
    const from = pane;
    revealVisual();
    renderSourceDetail(host, row, evidence, { opener: cards.get(id), onClose: () => { selectedSourceId = null; markCards(); showPane(from); } });
    anim?.enter?.(host.children?.[0]);
  }
  function renderMaterials() {
    const host = $('ws-materials');
    if (!host) return;
    materialButtons = renderMaterialControls(host, { items: cabin.materials, evidence, selectedId: selectedMaterialId, onSelect: id => selectMaterial(id) }) ?? [];
  }

  function allowedMaterial(id) {
    if (typeof id !== 'string' || !id) return false;
    const registry = Array.isArray(evidence?.materials) ? evidence.materials.map(m => m?.material_id) : [];
    return cabin.materials.some(m => m.material_id === id) || registry.includes(id);
  }

  // UI selection only: scopes the browser, marks the item and tells the host to open evidence.
  function selectMaterial(id, { notify = true } = {}) {
    if (!allowedMaterial(id)) return false;
    selectedMaterialId = id;
    filters = { ...filters, materialId: id };
    renderBrowser();
    for (const b of materialButtons) {
      const mine = b.getAttribute('data-material-id') === id;
      b.setAttribute('aria-pressed', String(mine));
      if (mine) anim?.select?.(b);
    }
    pushViewer();
    revealVisual();
    if (notify) try { onSelectMaterial(id); } catch { /* host failure leaves the selection visible */ }
    return true;
  }

  function update({ cabinQuery } = {}) {
    const materials = Array.isArray(cabinQuery?.materials) ? cabinQuery.materials : [];
    cabin = {
      materials: materials.filter(m => isObject(m) && typeof m.material_id === 'string' && m.material_id)
        .map(m => ({ material_id: m.material_id, name: typeof m.name === 'string' ? m.name : '' })),
      conditions: Object.freeze(isObject(cabinQuery?.conditions) ? { ...cabinQuery.conditions } : {}),
    };
    if (selectedMaterialId && !cabin.materials.some(m => m.material_id === selectedMaterialId)) {
      if (filters.materialId === selectedMaterialId) filters = { ...filters, materialId: null };
      selectedMaterialId = null;
      renderBrowser();
    }
    renderMaterials();
    pushViewer();
  }

  function setEvidence(next) {
    evidence = isObject(next) ? next : null;
    renderBrowser();
    renderMaterials();
  }

  toolbar.hidden = false;
  showPane(prefs.sourcesOpen ? 'sources' : 'visual', { reopen: false });
  applyPrefs();
  renderBrowser();
  renderMaterials();
  if (anim && win) (win.requestIdleCallback ?? (fn => win.setTimeout?.(fn, 200)))?.call(win, () => anim.preload?.());

  return {
    update, setEvidence, selectMaterial,
    setActive(value) { active = Boolean(value); showViewer(); },
    getPrefs: () => ({ ...prefs }),
    counts: () => { const r = filterSources(evidence); return { total: r.total, matched: r.matched, verified: r.verified }; },
    viewerReady: () => viewer.promise ?? Promise.resolve(null),
    destroy() {
      destroyed = true;
      disposers.splice(0).forEach(fn => fn());
      anim?.destroy?.();
      try { viewer.handle?.destroy(); } catch { /* viewer optional */ }
      viewer.handle = null;
    },
  };
}
