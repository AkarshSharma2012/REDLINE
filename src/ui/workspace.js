// Evidence workspace (#277/#297, recomposed into four sections in #337): the illustrative
// cabin model bridge, selection sync between cabin items, the source browser and the model,
// the stage view preference and the model summary strip. Section routing lives in
// section-nav.js. It never evaluates evidence, never changes review state and never
// persists anything except the stage view preference.
import { filterSources, renderSourceBrowser, renderSourceDetail, renderMaterialControls } from './workspace-evidence.js';
import { createMotion } from './workspace-motion.js';

export const PREFS_KEY = 'redline.workspace.v2';
const VERSION = 2;
export const DEFAULT_PREFS = Object.freeze({ view: 'evidence' });
export const VIEWER_LABEL = 'Illustrative cabin model - not a fire simulation';
const VIEWS = ['evidence', 'model'];
export const NARROW_QUERY = '(max-width: 1080px)';

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// Stored values are untrusted: wrong version, type or value falls back to defaults.
export function sanitizePrefs(raw) {
  const p = { ...DEFAULT_PREFS };
  if (isObject(raw) && raw.v === VERSION && VIEWS.includes(raw.view)) p.view = raw.view;
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
  const main = $('app-main'), toolbar = $('workspace-toolbar');
  if (!main || !$('panel-model') || typeof main.setAttribute !== 'function') return inert();
  const anim = motion === undefined ? createMotion({ window: win }) : motion;
  const disposers = [];
  const on = (el, type, fn) => { if (typeof el?.addEventListener !== 'function') return; el.addEventListener(type, fn); disposers.push(() => el.removeEventListener(type, fn)); };

  let prefs = readPrefs(storage);
  let evidence; // undefined = loading, null = unavailable
  let cabin = { materials: [], conditions: Object.freeze({}) };
  let selectedMaterialId = null, selectedSourceId = null;
  let filters = { text: '', review: 'all', materialId: null };
  let cards = new Map(), materialButtons = [];
  let active = true, destroyed = false;
  const viewer = { promise: null, handle: null };

  // ---- Stage view: evidence-only part list, or the lazily loaded illustrative model ----
  function applyPrefs() {
    main.setAttribute('data-view', prefs.view);
    for (const v of VIEWS) $(`ws-view-${v}`)?.setAttribute('aria-pressed', String(prefs.view === v));
    const modelRoot = $('rover-viewer-root'), empty = $('ws-stage-empty'), load = $('ws-load-model');
    if (modelRoot) modelRoot.hidden = prefs.view !== 'model';
    if (empty) empty.hidden = prefs.view === 'model';
    if (load) load.textContent = viewer.promise ? 'Show rover model' : 'Load rover model';
    if (prefs.view === 'model') ensureViewer();
    showViewer();
  }

  function commit(next) {
    prefs = sanitizePrefs({ ...next, v: VERSION });
    writePrefs(storage, prefs);
    applyPrefs();
  }

  for (const v of VIEWS) on($(`ws-view-${v}`), 'click', () => commit({ ...prefs, view: v }));
  on($('ws-load-model'), 'click', () => commit({ ...prefs, view: 'model' }));

  // Phones and tablets stack the Model section; a selection moves focus to the inspector or
  // record detail so the result is not left off screen. Desktop never steals focus.
  const narrow = () => { try { return Boolean(win?.matchMedia?.(NARROW_QUERY)?.matches); } catch { return false; } };
  function reveal(id) {
    if (narrow()) $(id)?.focus?.({ preventScroll: false });
  }

  // Masthead scope notes: Escape closes and returns focus to the summary; on desktop, where
  // the notes overlay content, a pointerdown outside closes. Native details otherwise.
  const popovers = [doc.querySelector?.('.mission-notes')].filter(Boolean);
  for (const d of popovers) {
    on(d, 'keydown', event => { if (event.key === 'Escape' && d.open) { event.preventDefault(); d.open = false; d.querySelector?.('summary')?.focus?.(); } });
  }
  on(doc, 'pointerdown', event => { for (const d of popovers) if (d.open && !narrow() && !d.contains?.(event.target)) d.open = false; });

  // ---- Illustrative model: loaded only when requested; any failure keeps HTML controls ----
  function viewerStatus(text) { const s = $('ws-viewer-status'); if (s) s.textContent = text; }
  let evidenceStates = null;
  function pushViewer() {
    if (!viewer.handle) return;
    try {
      viewer.handle.update({ materialIds: cabin.materials.map(m => m.material_id), selectedMaterialId, conditions: cabin.conditions, evidenceStates });
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
    renderSourceDetail(host, row, evidence, { opener: cards.get(id), onClose: () => { selectedSourceId = null; markCards(); } });
    reveal('ws-pane-detail');
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
    if (notify) try { onSelectMaterial(id); } catch { /* host failure leaves the selection visible */ }
    if (notify) reveal('ws-inspector');
    return true;
  }

  // evidenceStates (#336): optional categorical review state per material, forwarded to the viewer.
  function update({ cabinQuery, evidenceStates: states = null } = {}) {
    evidenceStates = states;
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

  if (toolbar) toolbar.hidden = false;
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
