import test from 'node:test';
import assert from 'node:assert/strict';
import { mountRoverViewer, VIEWER_CAPTION } from '../src/ui/rover-viewer.js';

// Minimal DOM: enough for the HTML controls and fallback path. Real WebGL,
// pointer orbit and layout are checked by the coordinator in Chrome.
class Element {
  constructor(tag, doc) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = [];
    this.attrs = {}; this.events = {}; this.hidden = false; this.disabled = false; this.text = '';
  }
  set textContent(text) { this.text = String(text); this.children = []; }
  get textContent() { return [this.text, ...this.children.map(child => child.textContent)].filter(Boolean).join(' '); }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return key in this.attrs ? this.attrs[key] : null; }
  removeAttribute(key) { delete this.attrs[key]; }
  hasAttribute(key) { return key in this.attrs; }
  append(...nodes) { for (const node of nodes) { node.parentNode = this; this.children.push(node); } }
  replaceChildren(...nodes) { this.children = []; this.text = ''; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; }
  addEventListener(type, fn) { (this.events[type] ??= new Set()).add(fn); }
  removeEventListener(type, fn) { this.events[type]?.delete(fn); }
  dispatch(type, extra = {}) {
    if (this.disabled) return;
    const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
    for (const fn of [...(this.events[type] ?? [])]) fn(event);
    return event;
  }
  getContext() { return null; }
}
const all = node => [node, ...node.children.flatMap(all)];
const listenerCount = node => all(node).reduce((sum, el) => sum + Object.values(el.events).reduce((n, set) => n + set.size, 0), 0);
function setup() {
  const doc = { createElement: tag => new Element(tag, doc), createElementNS: (ns, tag) => new Element(tag, doc) };
  doc.head = new Element('head', doc);
  const root = new Element('section', doc);
  return { doc, root };
}
const buttonFor = (root, id) => all(root).find(el => el.tagName === 'BUTTON' && el.getAttribute('data-material-id') === id);
const ALL = ['pmma', 'cotton', 'p213', 'nomex'];

test('module imports in Node without browser globals', () => {
  assert.equal(typeof mountRoverViewer, 'function');
  assert.equal(VIEWER_CAPTION, 'Illustrative cabin model - not a fire simulation');
});

test('failed Three.js import gives a usable HTML fallback with caption, schematic and material controls', async () => {
  const { doc, root } = setup();
  const viewer = await mountRoverViewer(root, { loadThree: () => Promise.reject(new Error('offline')) });
  for (const key of ['update', 'setVisible', 'destroy']) assert.equal(typeof viewer[key], 'function');
  viewer.update({ materialIds: ALL, conditions: { o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16 } });
  const text = root.textContent;
  assert.match(text, /Illustrative cabin model - not a fire simulation/);
  assert.match(text, /3D view unavailable/i);
  assert.match(text, /Requested scenario/);
  assert.match(text, /34% O2/);
  assert.doesNotMatch(text, /\bsafe\b|fps|frame rate|burning/i);
  assert.ok(all(root).some(el => el.getAttribute('data-rover-schematic') !== null));
  assert.equal(all(root).filter(el => el.tagName === 'CANVAS').length, 0, 'no blank canvas in fallback');
  for (const id of ALL) assert.equal(buttonFor(root, id).getAttribute('aria-pressed'), 'false');
  assert.equal(doc.head.children.filter(el => el.getAttribute('data-rover-viewer-css') !== null).length, 1);
  const link = doc.head.children[0];
  assert.match(link.href, /styles\/rover-viewer\.css$/);
  viewer.destroy();
});

test('stylesheet link is added once across mounts', async () => {
  const { doc, root } = setup();
  const second = new Element('section', doc);
  const a = await mountRoverViewer(root, { loadThree: () => Promise.reject(new Error('x')) });
  const b = await mountRoverViewer(second, { loadThree: () => Promise.reject(new Error('x')) });
  assert.equal(doc.head.children.length, 1);
  a.destroy(); b.destroy();
});

test('WebGL context failure with the real library still falls back to HTML', async () => {
  const { root } = setup();
  const viewer = await mountRoverViewer(root, { loadThree: () => import('../src/vendor/three/three.module.min.js') });
  viewer.update({ materialIds: ALL });
  assert.match(root.textContent, /3D view unavailable/i);
  assert.equal(all(root).filter(el => el.tagName === 'CANVAS').length, 0);
  assert.ok(buttonFor(root, 'pmma'));
  viewer.destroy();
});

test('material selection calls back exactly once per selection and updates never call back', async () => {
  const { root } = setup();
  const calls = [];
  const viewer = await mountRoverViewer(root, { onSelectMaterial: id => calls.push(id), loadThree: () => Promise.reject(new Error('x')) });
  viewer.update({ materialIds: ALL });
  buttonFor(root, 'nomex').dispatch('click');
  assert.deepEqual(calls, ['nomex']);
  assert.equal(buttonFor(root, 'nomex').getAttribute('aria-pressed'), 'true');
  buttonFor(root, 'nomex').dispatch('click');
  assert.deepEqual(calls, ['nomex'], 'reselecting the current item does not repeat the callback');
  viewer.update({ materialIds: ALL, selectedMaterialId: 'nomex' });
  viewer.update({ materialIds: ALL, selectedMaterialId: 'pmma' });
  assert.deepEqual(calls, ['nomex'], 'shell-driven updates never call back');
  assert.equal(buttonFor(root, 'pmma').getAttribute('aria-pressed'), 'true');
  assert.equal(buttonFor(root, 'nomex').getAttribute('aria-pressed'), 'false');
  assert.match(root.textContent, /Selected: Window \/ display panel/);
  buttonFor(root, 'cotton').dispatch('click');
  assert.deepEqual(calls, ['nomex', 'cotton']);
  viewer.destroy();
});

test('a throwing selection callback cannot break the viewer', async () => {
  const { root } = setup();
  const viewer = await mountRoverViewer(root, { onSelectMaterial: () => { throw new Error('shell bug'); }, loadThree: () => Promise.reject(new Error('x')) });
  viewer.update({ materialIds: ALL });
  assert.doesNotThrow(() => buttonFor(root, 'p213').dispatch('click'));
  assert.equal(buttonFor(root, 'p213').getAttribute('aria-pressed'), 'true');
  viewer.destroy();
});

test('removed and unsupported materials show a clear state, never a fake part match', async () => {
  const { root } = setup();
  const calls = [];
  const viewer = await mountRoverViewer(root, { onSelectMaterial: id => calls.push(id), loadThree: () => Promise.reject(new Error('x')) });
  viewer.update({ materialIds: ['pmma', 'cotton'], selectedMaterialId: 'nomex' });
  assert.equal(buttonFor(root, 'nomex').disabled, true);
  assert.equal(buttonFor(root, 'nomex').getAttribute('aria-pressed'), 'false');
  assert.match(root.textContent, /nomex is not in the current request/i);
  buttonFor(root, 'nomex').dispatch('click');
  assert.deepEqual(calls, []);
  viewer.update({ materialIds: ['pmma', 'kapton'], selectedMaterialId: 'kapton' });
  assert.match(root.textContent, /kapton has no part in this illustrative model/i);
  assert.ok(ALL.every(id => buttonFor(root, id).getAttribute('aria-pressed') === 'false'));
  viewer.update({ materialIds: ALL, selectedMaterialId: 42 });
  assert.match(root.textContent, /No material selected/);
  viewer.destroy();
});

test('setVisible and destroy stop work, remove listeners and are idempotent', async () => {
  const { root } = setup();
  const viewer = await mountRoverViewer(root, { loadThree: () => Promise.reject(new Error('x')) });
  viewer.update({ materialIds: ALL });
  const shell = root.children[0];
  viewer.setVisible(false);
  assert.equal(shell.hidden, true);
  viewer.setVisible(true);
  assert.equal(shell.hidden, false);
  assert.ok(listenerCount(root) > 0);
  const nodes = all(root);
  viewer.destroy();
  assert.equal(root.children.length, 0);
  assert.equal(nodes.reduce((sum, el) => sum + Object.values(el.events).reduce((n, set) => n + set.size, 0), 0), 0);
  assert.doesNotThrow(() => { viewer.destroy(); viewer.update({ materialIds: ALL }); viewer.setVisible(true); });
  assert.equal(root.children.length, 0);
});

test('missing root returns an inert handle instead of throwing through startup', async () => {
  const viewer = await mountRoverViewer(null);
  assert.doesNotThrow(() => { viewer.update({}); viewer.setVisible(false); viewer.destroy(); });
});
