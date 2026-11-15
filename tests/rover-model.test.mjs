import test from 'node:test';
import assert from 'node:assert/strict';
import { ROVER_DEMO } from '../src/main.js';
import {
  ROVER_PARTS, SUPPORTED_MATERIAL_IDS, normalizeViewerState, formatConditions,
  VIEW_DEFAULT, VIEW_LIMITS, clampView, stepView, keyToAction,
  PREF_KEY, DEFAULT_PREFS, parsePrefs, readPrefs, writePrefs,
  capPixelRatio, isClick, pointerToNdc, createRenderScheduler,
} from '../src/ui/rover-model.js';

test('modeled parts are exactly the ROVER_DEMO material IDs, frozen', () => {
  assert.deepEqual([...SUPPORTED_MATERIAL_IDS], ROVER_DEMO.items.map(item => item.material_id));
  assert.deepEqual(ROVER_PARTS.map(part => part.materialId), ['pmma', 'cotton', 'p213', 'nomex']);
  assert.ok(Object.isFrozen(ROVER_PARTS) && ROVER_PARTS.every(Object.isFrozen));
  for (const part of ROVER_PARTS) assert.match(part.part, /\w/);
});

test('selection validation never silently matches unsupported or removed IDs', () => {
  const all = ['pmma', 'cotton', 'p213', 'nomex'];
  assert.equal(normalizeViewerState({ materialIds: all, selectedMaterialId: 'nomex' }).selection.state, 'modeled');
  const removed = normalizeViewerState({ materialIds: ['pmma', 'cotton'], selectedMaterialId: 'nomex' });
  assert.equal(removed.selection.state, 'not-in-request');
  assert.equal(removed.highlightId, null);
  assert.equal(removed.parts.find(part => part.materialId === 'nomex').inRequest, false);
  const registry = normalizeViewerState({ materialIds: ['pmma', 'kapton'], selectedMaterialId: 'kapton' });
  assert.equal(registry.selection.state, 'not-modeled');
  assert.equal(registry.highlightId, null);
  assert.deepEqual(registry.extraIds, ['kapton']);
  for (const bad of [42, '', '  ', {}, ['pmma'], 'x'.repeat(200)]) {
    const state = normalizeViewerState({ materialIds: all, selectedMaterialId: bad });
    assert.equal(state.selectedMaterialId, null);
    assert.equal(state.selection.state, 'none');
  }
  assert.equal(normalizeViewerState().selection.state, 'none');
  assert.equal(normalizeViewerState({ materialIds: all, selectedMaterialId: 'pmma' }).highlightId, 'pmma');
});

test('material ID lists are deduplicated, bounded and string-only', () => {
  const state = normalizeViewerState({ materialIds: ['pmma', 'pmma', 7, null, ' cotton ', ...Array.from({ length: 300 }, (_, i) => `m${i}`)] });
  assert.equal(state.materialIds.filter(id => id === 'pmma').length, 1);
  assert.ok(state.materialIds.includes('cotton'));
  assert.ok(state.materialIds.length <= 100);
  assert.deepEqual(normalizeViewerState({ materialIds: 'pmma' }).materialIds, []);
});

test('conditions are read-only requested context with units and no outcome words', () => {
  const input = Object.freeze({ o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16, flow_speed_cm_s: 2 });
  const rows = formatConditions(input);
  assert.deepEqual(rows.map(row => row.text), ['34% O2', '56.5 kPa', '0.16 g']);
  assert.deepEqual(formatConditions({ o2_pct: 140, pressure_kpa: -1, gravity_g: NaN }), []);
  assert.deepEqual(formatConditions(null), []);
  const words = JSON.stringify(normalizeViewerState({ conditions: input }));
  assert.doesNotMatch(words, /safe|burn|flame|ignit|predict|measured value/i);
});

test('camera view steps stay inside bounds and reset exactly', () => {
  let view = VIEW_DEFAULT;
  for (let i = 0; i < 50; i += 1) view = stepView(view, 'up');
  assert.equal(view.elevation, VIEW_LIMITS.maxElevation);
  for (let i = 0; i < 50; i += 1) view = stepView(view, 'down');
  assert.equal(view.elevation, VIEW_LIMITS.minElevation);
  for (let i = 0; i < 50; i += 1) view = stepView(view, 'in');
  assert.equal(view.distance, VIEW_LIMITS.minDistance);
  for (let i = 0; i < 50; i += 1) view = stepView(view, 'out');
  assert.equal(view.distance, VIEW_LIMITS.maxDistance);
  const left = stepView(VIEW_DEFAULT, 'left');
  assert.notEqual(left.azimuth, VIEW_DEFAULT.azimuth);
  assert.ok(Math.abs(left.azimuth) <= 180);
  assert.deepEqual(stepView(view, 'reset'), VIEW_DEFAULT);
  assert.deepEqual(stepView(VIEW_DEFAULT, 'nonsense'), VIEW_DEFAULT);
  assert.deepEqual(clampView({ azimuth: 540, elevation: 999, distance: -4 }),
    { azimuth: 180, elevation: VIEW_LIMITS.maxElevation, distance: VIEW_LIMITS.minDistance });
  assert.deepEqual(clampView({}), VIEW_DEFAULT);
});

test('keyboard mapping covers every camera action and ignores other keys', () => {
  assert.equal(keyToAction('ArrowLeft'), 'left');
  assert.equal(keyToAction('ArrowRight'), 'right');
  assert.equal(keyToAction('ArrowUp'), 'up');
  assert.equal(keyToAction('ArrowDown'), 'down');
  assert.equal(keyToAction('+'), 'in');
  assert.equal(keyToAction('='), 'in');
  assert.equal(keyToAction('-'), 'out');
  assert.equal(keyToAction('Home'), 'reset');
  for (const key of ['Tab', 'Enter', ' ', 'Escape', 'a', undefined]) assert.equal(keyToAction(key), null);
});

test('preferences validate, fall back on malformed/denied storage and never store science', () => {
  assert.deepEqual(parsePrefs(null), DEFAULT_PREFS);
  assert.deepEqual(parsePrefs('{bad json'), DEFAULT_PREFS);
  assert.deepEqual(parsePrefs('{"layer":"exploded","wireframe":"yes"}'), DEFAULT_PREFS);
  assert.deepEqual(parsePrefs('{"layer":"shell","wireframe":true,"selected":"pmma","o2_pct":34}'),
    { layer: 'shell', wireframe: true });
  assert.deepEqual(parsePrefs('x'.repeat(5000)), DEFAULT_PREFS);
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual(readPrefs(denied), DEFAULT_PREFS);
  assert.equal(writePrefs(denied, { layer: 'shell' }), false);
  assert.deepEqual(readPrefs(undefined), DEFAULT_PREFS);
  const store = new Map();
  const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  assert.equal(writePrefs(storage, { layer: 'shell', wireframe: true, selectedMaterialId: 'pmma' }), true);
  assert.deepEqual(JSON.parse(store.get(PREF_KEY)), { layer: 'shell', wireframe: true });
  assert.deepEqual(readPrefs(storage), { layer: 'shell', wireframe: true });
});

test('pixel ratio is capped at 1.5 and pointer helpers separate drag from click', () => {
  assert.equal(capPixelRatio(3), 1.5);
  assert.equal(capPixelRatio(1), 1);
  assert.equal(capPixelRatio(undefined), 1);
  assert.equal(capPixelRatio(0.5), 1);
  assert.equal(isClick({ x: 10, y: 10 }, { x: 13, y: 12 }), true);
  assert.equal(isClick({ x: 10, y: 10 }, { x: 30, y: 10 }), false);
  assert.deepEqual(pointerToNdc(150, 100, { left: 50, top: 50, width: 200, height: 100 }), { x: 0, y: 0 });
  assert.deepEqual(pointerToNdc(50, 50, { left: 50, top: 50, width: 200, height: 100 }), { x: -1, y: 1 });
  assert.equal(pointerToNdc(1, 1, { left: 0, top: 0, width: 0, height: 10 }), null);
});

test('render scheduler renders on demand only, coalesces, pauses and cancels', () => {
  const queue = new Map();
  let next = 1;
  const request = fn => { const id = next++; queue.set(id, fn); return id; };
  const cancel = id => queue.delete(id);
  const flush = () => { const fns = [...queue.values()]; queue.clear(); fns.forEach(fn => fn(0)); };
  let renders = 0;
  const scheduler = createRenderScheduler({ request, cancel, render: () => { renders += 1; } });
  assert.equal(queue.size, 0, 'no frame before any change');
  scheduler.invalidate(); scheduler.invalidate(); scheduler.invalidate();
  assert.equal(queue.size, 1);
  flush();
  assert.equal(renders, 1);
  flush();
  assert.equal(renders, 1, 'idle: zero frames after settle');
  scheduler.setActive(false);
  scheduler.invalidate();
  assert.equal(queue.size, 0, 'hidden viewer does no work');
  scheduler.setActive(true);
  assert.equal(queue.size, 1, 'pending change renders once when visible again');
  flush();
  assert.equal(renders, 2);
  scheduler.invalidate();
  scheduler.destroy();
  assert.equal(queue.size, 0, 'destroy cancels the queued frame');
  scheduler.invalidate();
  assert.equal(queue.size, 0);
});
