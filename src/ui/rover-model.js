// Pure helpers for the illustrative rover viewer: no DOM, no Three.js, Node-importable.
// Nothing here derives a combustion outcome; conditions are echoed as requested input only.

export const ROVER_PARTS = Object.freeze([
  Object.freeze({ materialId: 'pmma', part: 'Window / display panel', zone: 'Front' }),
  Object.freeze({ materialId: 'cotton', part: 'Crew clothing', zone: 'Stowage wall' }),
  Object.freeze({ materialId: 'p213', part: 'Hardware tape', zone: 'Cable runs' }),
  Object.freeze({ materialId: 'nomex', part: 'Seat cover', zone: 'Crew seats' }),
]);
export const SUPPORTED_MATERIAL_IDS = Object.freeze(ROVER_PARTS.map(part => part.materialId));

const MAX_IDS = 100;
const ID_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;

function cleanId(value) {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return ID_PATTERN.test(id) ? id : null;
}

const round = value => String(Math.round(value * 100) / 100);
const CONDITIONS = [
  { key: 'o2_pct', label: 'Oxygen', min: 0, max: 100, text: v => `${round(v)}% O2` },
  { key: 'pressure_kpa', label: 'Pressure', min: 0, max: 1000, text: v => `${round(v)} kPa` },
  { key: 'gravity_g', label: 'Gravity', min: 0, max: 10, text: v => `${round(v)} g` },
];

// Requested scenario values with units; out-of-range or non-numeric values are omitted.
export function formatConditions(conditions) {
  if (!conditions || typeof conditions !== 'object') return [];
  return CONDITIONS.flatMap(({ key, label, min, max, text }) => {
    const value = conditions[key];
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
      ? [{ key, label, text: text(value) }] : [];
  });
}

// Validate a shell update. Selection highlights a part only when the ID is both
// requested and modeled; anything else is reported, never matched to a stand-in mesh.
export function normalizeViewerState({ materialIds = [], selectedMaterialId = null, conditions = {} } = {}) {
  const ids = [];
  if (Array.isArray(materialIds)) {
    for (const value of materialIds) {
      const id = cleanId(value);
      if (id && !ids.includes(id)) ids.push(id);
      if (ids.length === MAX_IDS) break;
    }
  }
  const selected = cleanId(selectedMaterialId);
  let state = 'none';
  if (selected) state = !ids.includes(selected) ? 'not-in-request'
    : SUPPORTED_MATERIAL_IDS.includes(selected) ? 'modeled' : 'not-modeled';
  return {
    materialIds: ids,
    parts: ROVER_PARTS.map(part => ({ ...part, inRequest: ids.includes(part.materialId) })),
    extraIds: ids.filter(id => !SUPPORTED_MATERIAL_IDS.includes(id)),
    selectedMaterialId: selected,
    selection: { id: selected, state },
    highlightId: state === 'modeled' ? selected : null,
    conditions: formatConditions(conditions),
  };
}

// Camera orbit state in degrees around the cabin centre. Y is up.
export const VIEW_LIMITS = Object.freeze({ minElevation: -5, maxElevation: 80, minDistance: 5, maxDistance: 18 });
export const VIEW_DEFAULT = Object.freeze({ azimuth: -40, elevation: 22, distance: 11 });
const AZIMUTH_STEP = 15;
const ELEVATION_STEP = 10;
const ZOOM_FACTOR = 0.85;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
function wrapDegrees(value) {
  const turn = ((value % 360) + 360) % 360;
  return turn > 180 ? turn - 360 : turn;
}

export function clampView(view = {}) {
  return {
    azimuth: wrapDegrees(finite(view.azimuth, VIEW_DEFAULT.azimuth)),
    elevation: clamp(finite(view.elevation, VIEW_DEFAULT.elevation), VIEW_LIMITS.minElevation, VIEW_LIMITS.maxElevation),
    distance: clamp(finite(view.distance, VIEW_DEFAULT.distance), VIEW_LIMITS.minDistance, VIEW_LIMITS.maxDistance),
  };
}

export function stepView(view, action) {
  const v = clampView(view);
  switch (action) {
    case 'left': return clampView({ ...v, azimuth: v.azimuth - AZIMUTH_STEP });
    case 'right': return clampView({ ...v, azimuth: v.azimuth + AZIMUTH_STEP });
    case 'up': return clampView({ ...v, elevation: v.elevation + ELEVATION_STEP });
    case 'down': return clampView({ ...v, elevation: v.elevation - ELEVATION_STEP });
    case 'in': return clampView({ ...v, distance: v.distance * ZOOM_FACTOR });
    case 'out': return clampView({ ...v, distance: v.distance / ZOOM_FACTOR });
    case 'reset': return { ...VIEW_DEFAULT };
    default: return v;
  }
}

export function viewToPosition(view) {
  const { azimuth, elevation, distance } = clampView(view);
  const az = azimuth * Math.PI / 180;
  const el = elevation * Math.PI / 180;
  return { x: distance * Math.cos(el) * Math.sin(az), y: distance * Math.sin(el), z: distance * Math.cos(el) * Math.cos(az) };
}

const KEY_ACTIONS = Object.freeze({
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  '+': 'in', '=': 'in', '-': 'out', Home: 'reset',
});
// Only consulted while the canvas itself has focus, so page keys are never hijacked.
export function keyToAction(key) {
  return Object.hasOwn(KEY_ACTIONS, key) ? KEY_ACTIONS[key] : null;
}

// Display preferences only: never selection, scenario values or review state.
export const PREF_KEY = 'redline.roverViewer.v1';
export const DEFAULT_PREFS = Object.freeze({ layer: 'cutaway', wireframe: false });
const LAYERS = ['cutaway', 'shell'];

function cleanPrefs(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    layer: LAYERS.includes(source.layer) ? source.layer : DEFAULT_PREFS.layer,
    wireframe: typeof source.wireframe === 'boolean' ? source.wireframe : DEFAULT_PREFS.wireframe,
  };
}

export function parsePrefs(raw) {
  if (typeof raw !== 'string' || raw.length > 1000) return { ...DEFAULT_PREFS };
  try { return cleanPrefs(JSON.parse(raw)); } catch { return { ...DEFAULT_PREFS }; }
}

export function readPrefs(storage) {
  try { return parsePrefs(storage?.getItem(PREF_KEY) ?? null); } catch { return { ...DEFAULT_PREFS }; }
}

export function writePrefs(storage, prefs) {
  try {
    if (!storage) return false;
    storage.setItem(PREF_KEY, JSON.stringify(cleanPrefs(prefs)));
    return true;
  } catch { return false; }
}

export function capPixelRatio(devicePixelRatio) {
  return clamp(finite(devicePixelRatio, 1), 1, 1.5);
}

// A press that travels less than the threshold (CSS px) is a click, not an orbit drag.
export function isClick(start, end, threshold = 6) {
  return Math.hypot(end.x - start.x, end.y - start.y) < threshold;
}

export function pointerToNdc(clientX, clientY, rect) {
  if (!rect || !(rect.width > 0) || !(rect.height > 0)) return null;
  return { x: 2 * (clientX - rect.left) / rect.width - 1, y: 1 - 2 * (clientY - rect.top) / rect.height };
}

// On-demand rendering: at most one queued frame, only after a real change, none while hidden.
export function createRenderScheduler({ request, cancel, render }) {
  let active = true;
  let dirty = false;
  let frame = null;
  let destroyed = false;
  const tick = () => {
    frame = null;
    if (!active || destroyed) return;
    dirty = false;
    render();
  };
  const queue = () => { if (active && dirty && frame === null && !destroyed) frame = request(tick); };
  const drop = () => { if (frame !== null) { cancel(frame); frame = null; } };
  return {
    invalidate() { if (destroyed) return; dirty = true; queue(); },
    setActive(value) { active = Boolean(value); if (active) queue(); else drop(); },
    destroy() { destroyed = true; drop(); },
  };
}

// Evidence-review overlay input (#336): one categorical state per material from the triage
// contract (#321). Review state only; never a risk score, probability or safety label.
export const EVIDENCE_STATE_TEXT = Object.freeze({
  'review-ready': 'Review-ready (bounded source review)',
  'review-required': 'Review required (gaps listed)',
  'no-record': 'No record / not evaluated',
});
export function evidenceStatesFromTriage(triage) {
  const out = {};
  for (const item of Array.isArray(triage?.items) ? triage.items : []) {
    const id = item?.material_id;
    if (typeof id !== 'string') continue;
    const prev = out[id] ?? { state: 'no-record', records: 0, ready: 0 };
    const cands = Array.isArray(item.candidates) ? item.candidates : [];
    const records = Math.max(prev.records, cands.length);
    const ready = Math.max(prev.ready, cands.filter(c => c?.review_ready === true).length);
    const state = ready > 0 ? 'review-ready' : records > 0 ? 'review-required' : 'no-record';
    out[id] = { state, records, ready };
  }
  for (const v of Object.values(out)) v.label = `${EVIDENCE_STATE_TEXT[v.state]} · ${v.records} record${v.records === 1 ? '' : 's'} · ${v.ready} ready`;
  return out;
}
export function sanitizeEvidenceStates(states) {
  if (!states || typeof states !== 'object') return null;
  const out = {};
  for (const [id, v] of Object.entries(states)) {
    if (v && EVIDENCE_STATE_TEXT[v.state] && typeof v.label === 'string') out[id] = { state: v.state, label: v.label };
  }
  return out;
}
