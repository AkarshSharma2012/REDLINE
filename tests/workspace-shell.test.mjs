// #277 three-pane workspace shell: structure, preferences, configuration, viewer
// failure isolation and motion. Node checks only; visual acceptance is a browser task.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PREFS_KEY, DEFAULT_PREFS, PANE_BOUNDS, VIEWER_LABEL, sanitizePrefs, readPrefs, writePrefs,
  resizePane, layoutColumns, mountWorkspace } from '../src/ui/workspace.js';
import { createMotion, prefersReducedMotion, GSAP_VERSION } from '../src/ui/workspace-motion.js';
import { resultForMaterial } from '../src/main.js';
import { workspaceDoc, memoryStorage } from './fixtures/workspace-dom.mjs';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const evidence = JSON.parse(await read('data/evidence.json'));
const main = html.match(/<main\b[^>]*id="panel-cabin"[^>]*>([\s\S]*?)<\/main>/);

test('cabin panel is a three-pane workspace that keeps every existing ID and control', () => {
  assert.ok(main, 'main#panel-cabin');
  assert.match(main[0], /class="layout workspace"/);
  const panes = [...main[1].matchAll(/<section\b[^>]*id="(ws-pane-[a-z]+)"/g)].map(m => m[1]);
  assert.deepEqual(panes, ['ws-pane-controls', 'ws-pane-sources', 'ws-pane-visual']);
  for (const id of ['rover-demo', 'rover-note', 'cabin-form', 'status', 'results-table', 'fixes', 'evidence-panel',
    'cabin-heading', 'results-heading', 'evidence-heading', 'ws-sources', 'ws-materials', 'ws-source-detail', 'rover-viewer-root']) {
    assert.match(main[1], new RegExp(`id="${id}"`), id);
  }
  assert.match(main[1], /<div id="rover-viewer-root"[^>]*\bhidden/, 'model area hidden until requested');
  assert.equal(html.split(VIEWER_LABEL).length - 1, 1, 'illustrative model label present once');
  assert.equal(VIEWER_LABEL, 'Illustrative cabin model - not a fire simulation');
});

test('toolbar offers labelled pane, width, density, view and reset controls plus keyboard separators', () => {
  assert.match(main[1], /<div id="workspace-toolbar" class="ws-toolbar"[^>]*\bhidden>/, 'toolbar revealed by script');
  for (const id of ['ws-toggle-controls', 'ws-toggle-sources', 'ws-narrow-controls', 'ws-widen-controls', 'ws-narrow-sources',
    'ws-widen-sources', 'ws-density-comfortable', 'ws-density-compact', 'ws-view-evidence', 'ws-view-model', 'ws-reset',
    'ws-jump-controls', 'ws-jump-sources', 'ws-jump-visual']) {
    assert.match(main[1], new RegExp(`<button type="button" id="${id}"`), id);
  }
  for (const pane of ['controls', 'sources']) {
    const sep = main[1].match(new RegExp(`<div[^>]*id="ws-sep-${pane}"[^>]*>`));
    assert.ok(sep, pane);
    assert.match(sep[0], /role="separator"/);
    assert.match(sep[0], /tabindex="0"/);
    assert.match(sep[0], new RegExp(`aria-valuemin="${PANE_BOUNDS[pane].min}"`));
    assert.match(sep[0], new RegExp(`aria-valuemax="${PANE_BOUNDS[pane].max}"`));
    assert.match(sep[0], new RegExp(`aria-valuenow="${PANE_BOUNDS[pane].default}"`));
  }
  assert.match(html, /<link rel="stylesheet" href="src\/styles\/workspace\.css">/);
  assert.doesNotMatch(html, /vendor\/|three|gsap/i, 'no animation or 3D library fetched by the page');
});

test('workspace CSS is focused, restrained and stacks without page overflow on phones', async () => {
  const css = await read('src/styles/workspace.css');
  assert.ok(css.split('\n').length < 500);
  assert.doesNotMatch(css, /gradient\(|text-shadow|backdrop-filter|blur\(|drop-shadow|box-shadow:\s*0 0 \d+px [^;]*(?:accent|7CB8FF)/i);
  assert.match(css, /grid-template-columns: var\(--ws-columns/);
  assert.match(css, /@media \(max-width: 1080px\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /\[data-density="compact"\]/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height: 44px/);
});

test('DESIGN.md records the narrow illustrative-model exception without weakening evidence rules', async () => {
  const design = await read('DESIGN.md');
  assert.match(design, /Illustrative cabin model - not a fire simulation/);
  assert.match(design, /no flames/i);
  assert.match(design, /not a fire simulation/);
});

test('GSAP 3.15.1 core is pinned locally with provenance and a matching checksum', async () => {
  assert.equal(GSAP_VERSION, '3.15.1');
  const lib = await readFile(new URL('src/vendor/gsap/gsap.min.js', root));
  assert.match(lib.subarray(0, 200).toString(), /GSAP 3\.15\.1/);
  const prov = await read('src/vendor/gsap/PROVENANCE.md');
  assert.ok(prov.includes(createHash('sha256').update(lib).digest('hex')), 'checksum recorded');
  assert.match(prov, /standard-license/);
  assert.match(prov, /registry\.npmjs\.org\/gsap\/-\/gsap-3\.15\.1\.tgz/);
});

test('preferences: defaults, clamping, malformed and stale storage fall back', () => {
  assert.deepEqual(sanitizePrefs(undefined), DEFAULT_PREFS);
  const clamped = sanitizePrefs({ v: 1, controls: 9999, sources: -5, density: 'compact', view: 'model', controlsOpen: false, sourcesOpen: 'no' });
  assert.equal(clamped.controls, PANE_BOUNDS.controls.max);
  assert.equal(clamped.sources, PANE_BOUNDS.sources.min);
  assert.equal(clamped.density, 'compact');
  assert.equal(clamped.view, 'model');
  assert.equal(clamped.controlsOpen, false);
  assert.equal(clamped.sourcesOpen, true, 'non-boolean ignored');
  assert.equal(sanitizePrefs({ v: 1, controls: 'NaN', density: 'huge', view: 'flames' }).controls, DEFAULT_PREFS.controls);
  assert.deepEqual(sanitizePrefs({ v: 0, density: 'compact' }), DEFAULT_PREFS, 'stale version ignored');
  for (const raw of ['{not json', '[]', 'null', '"x"']) assert.deepEqual(readPrefs(memoryStorage({ [PREFS_KEY]: raw })), DEFAULT_PREFS, raw);
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual(readPrefs(denied), DEFAULT_PREFS);
  assert.deepEqual(readPrefs(null), DEFAULT_PREFS);
  assert.equal(writePrefs(denied, DEFAULT_PREFS), false);
});

test('only layout preferences are persisted: no science, verification or scenario', () => {
  const store = memoryStorage();
  assert.equal(writePrefs(store, { ...DEFAULT_PREFS, verified: 45, apiKey: 'k', o2_pct: 34, selectedMaterialId: 'pmma' }), true);
  const saved = JSON.parse(store.data[PREFS_KEY]);
  assert.deepEqual(Object.keys(saved).sort(), ['controls', 'controlsOpen', 'density', 'sources', 'sourcesOpen', 'v', 'view']);
});

test('resize is bounded and layout columns follow collapsed panes', () => {
  let p = resizePane(DEFAULT_PREFS, 'controls', 20);
  assert.equal(p.controls, DEFAULT_PREFS.controls + 20);
  p = resizePane(p, 'controls', 10000);
  assert.equal(p.controls, PANE_BOUNDS.controls.max);
  p = resizePane(p, 'sources', -10000);
  assert.equal(p.sources, PANE_BOUNDS.sources.min);
  assert.deepEqual(resizePane(p, 'visual', 20), p, 'unknown pane unchanged');
  assert.equal(layoutColumns(DEFAULT_PREFS), '280px 8px 380px 8px minmax(0, 1fr)');
  assert.equal(layoutColumns({ ...DEFAULT_PREFS, controlsOpen: false }), '0 0 380px 8px minmax(0, 1fr)');
  assert.equal(layoutColumns({ ...DEFAULT_PREFS, controlsOpen: false, sourcesOpen: false }), '0 0 0 0 minmax(0, 1fr)');
});

function mount(opts = {}) {
  const doc = workspaceDoc();
  const storage = opts.storage ?? memoryStorage();
  const selected = [];
  const ws = mountWorkspace({ document: doc, storage, window: null, motion: null,
    loadViewer: opts.loadViewer ?? (() => { throw new Error('viewer not requested'); }),
    onSelectMaterial: id => selected.push(id), ...opts.extra });
  return { doc, storage, ws, selected, $: id => doc.getElementById(id) };
}

test('settings visibly change the workspace and persist; reset restores defaults', () => {
  const { $, storage, ws } = mount();
  const main = $('panel-cabin');
  assert.equal($('workspace-toolbar').hidden, false);
  assert.equal(main.style.props['--ws-columns'], layoutColumns(DEFAULT_PREFS));
  $('ws-widen-controls').click();
  assert.equal($('ws-sep-controls').getAttribute('aria-valuenow'), '300');
  assert.match(main.style.props['--ws-columns'], /^300px/);
  $('ws-toggle-sources').click();
  assert.equal($('ws-pane-sources').hidden, true);
  assert.equal($('ws-toggle-sources').getAttribute('aria-pressed'), 'false');
  assert.equal($('ws-sep-sources').hidden, true);
  $('ws-density-compact').click();
  assert.equal(main.getAttribute('data-density'), 'compact');
  assert.equal($('ws-density-compact').getAttribute('aria-pressed'), 'true');
  const saved = JSON.parse(storage.data[PREFS_KEY]);
  assert.equal(saved.controls, 300); assert.equal(saved.sourcesOpen, false); assert.equal(saved.density, 'compact');
  $('ws-reset').click();
  assert.deepEqual(ws.getPrefs(), DEFAULT_PREFS);
  assert.equal($('ws-pane-sources').hidden, false);
  assert.equal(main.getAttribute('data-density'), 'comfortable');
});

test('separators resize with keyboard: arrows, Home/End bounds and Enter reset', () => {
  const { $ } = mount();
  const sep = $('ws-sep-sources');
  sep.dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(sep.getAttribute('aria-valuenow'), '400');
  sep.dispatch('keydown', { key: 'End' });
  assert.equal(sep.getAttribute('aria-valuenow'), String(PANE_BOUNDS.sources.max));
  sep.dispatch('keydown', { key: 'Home' });
  assert.equal(sep.getAttribute('aria-valuenow'), String(PANE_BOUNDS.sources.min));
  sep.dispatch('keydown', { key: 'Enter' });
  assert.equal(sep.getAttribute('aria-valuenow'), String(PANE_BOUNDS.sources.default));
  sep.dispatch('pointerdown', { clientX: 100, pointerId: 1, button: 0 });
  sep.dispatch('pointermove', { clientX: 160, pointerId: 1 });
  sep.dispatch('pointerup', { clientX: 160, pointerId: 1 });
  assert.equal(sep.getAttribute('aria-valuenow'), String(PANE_BOUNDS.sources.default + 60));
});

test('invalid stored preferences cannot crash the mount or hide the visual pane', () => {
  const { $, ws } = mount({ storage: memoryStorage({ [PREFS_KEY]: '{"v":1,"controlsOpen":false,"sourcesOpen":false,"controls":"x"}' }) });
  assert.equal($('ws-pane-visual').hidden, false);
  assert.equal(ws.getPrefs().controls, DEFAULT_PREFS.controls);
  $('ws-toggle-controls').click();
  assert.equal($('ws-pane-controls').hidden, false, 'collapsed pane is one click away');
});

test('viewer library is not requested in evidence view; failed import keeps HTML material controls', async () => {
  let calls = 0;
  const { $, ws } = mount({ loadViewer: async () => { calls++; throw new Error('WebGL unavailable'); } });
  ws.setEvidence(evidence);
  ws.update({ cabinQuery: { conditions: { o2_pct: 34, pressure_kpa: 56.5 }, materials: [{ material_id: 'pmma', name: 'Window' }, { material_id: 'cotton', name: 'Clothing' }] } });
  assert.equal(calls, 0, 'nothing fetched before the model is requested');
  $('ws-view-model').click();
  await ws.viewerReady();
  assert.equal(calls, 1);
  assert.equal($('rover-viewer-root').hidden, false);
  assert.match($('ws-viewer-status').textContent, /Model unavailable/);
  assert.equal($('ws-materials').all('button').length, 2, 'HTML material controls remain');
});

test('viewer gets read-only requested conditions and selection; its picks only change UI selection', async () => {
  const updates = []; let picker; let visible = [];
  const loadViewer = async () => ({
    mountRoverViewer: async (el, { onSelectMaterial }) => { picker = onSelectMaterial; return { update: u => updates.push(u), setVisible: v => visible.push(v), destroy() {} }; },
  });
  const { $, ws, selected } = mount({ loadViewer, storage: memoryStorage({ [PREFS_KEY]: JSON.stringify({ ...DEFAULT_PREFS, v: 1, view: 'model' }) }) });
  ws.setEvidence(evidence);
  const conditions = { o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16 };
  ws.update({ cabinQuery: { conditions, materials: [{ material_id: 'pmma' }, { material_id: 'nomex' }] } });
  await ws.viewerReady();
  const last = updates.at(-1);
  assert.deepEqual(last.materialIds, ['pmma', 'nomex']);
  assert.deepEqual(last.conditions, conditions);
  assert.ok(Object.isFrozen(last.conditions));
  picker('nomex');
  assert.deepEqual(selected, ['nomex']);
  assert.equal(updates.at(-1).selectedMaterialId, 'nomex');
  assert.match($('ws-sources').textContent, /Material: nomex/);
  picker('<img onerror=x>'); picker(42);
  assert.deepEqual(selected, ['nomex'], 'unknown or non-string IDs ignored');
  $('ws-view-evidence').click();
  assert.equal(visible.at(-1), false);
  assert.equal($('rover-viewer-root').hidden, true);
  assert.equal(evidence.evidence.filter(r => r.review_status === 'verified').length, ws.counts().verified, 'review state untouched');
});

test('mount is inert when the page lacks the workspace markup', () => {
  const doc = { getElementById: () => null, createElement: () => ({}) };
  const ws = mountWorkspace({ document: doc, storage: null, window: null });
  assert.doesNotThrow(() => { ws.update({}); ws.setEvidence(null); ws.selectMaterial('pmma'); ws.setActive(false); ws.destroy(); });
});

test('main bridges results to the workspace through explicit functions', async () => {
  const src = await read('src/main.js');
  assert.match(src, /import \{ mountWorkspace \} from '\.\/ui\/workspace\.js'/);
  assert.doesNotMatch(src, /MutationObserver/);
  const results = [{ query: { material_id: 'pmma' } }, { query: { material_id: 'nomex' } }];
  assert.equal(resultForMaterial(results, 'nomex'), results[1]);
  assert.equal(resultForMaterial(results, 'kapton'), null);
  assert.equal(resultForMaterial(null, 'pmma'), null);
});

function fakeGsap() {
  const calls = [];
  return { calls, fromTo: (el, from, to) => { calls.push(['fromTo', el, from, to]); return { kill() {} }; },
    killTweensOf: el => calls.push(['kill', el]), set: (el, v) => calls.push(['set', el, v]) };
}
const win = reduce => {
  const listeners = [];
  const mq = { matches: reduce, addEventListener: (_t, fn) => listeners.push(fn), removeEventListener() {} };
  return { mq, listeners, matchMedia: () => mq };
};

test('motion: short transform/opacity tweens that overwrite and clean up', async () => {
  const gsap = fakeGsap(); const w = win(false);
  const motion = createMotion({ window: w, importer: async () => gsap });
  await motion.preload();
  const el = { id: 'x' };
  assert.equal(motion.enter(el), true);
  const [, target, from, to] = gsap.calls.find(c => c[0] === 'fromTo');
  assert.equal(target, el);
  assert.deepEqual(Object.keys(from).sort(), ['opacity', 'y']);
  assert.ok(to.duration >= 0.15 && to.duration <= 0.24);
  assert.equal(to.overwrite, true);
  assert.match(to.clearProps, /opacity/);
  motion.destroy();
  assert.ok(gsap.calls.some(c => c[0] === 'kill' && c[1] === el));
  assert.ok(gsap.calls.some(c => c[0] === 'set' && c[1] === el && /opacity/.test(c[2].clearProps)));
});

test('motion: reduced motion is honored live and a failed GSAP import never blocks', async () => {
  const gsap = fakeGsap(); const w = win(true);
  const motion = createMotion({ window: w, importer: async () => gsap });
  await motion.preload();
  assert.equal(prefersReducedMotion(w), true);
  assert.equal(motion.enter({}), false);
  w.mq.matches = false;
  assert.equal(motion.enter({}), true, 'live preference change');
  const broken = createMotion({ window: win(false), importer: async () => { throw new Error('404'); } });
  assert.equal(await broken.preload(), null);
  assert.equal(broken.enter({}), false);
  assert.equal(createMotion({ window: null, importer: async () => gsap }).enter({}), false, 'no animation before load');
  assert.equal(prefersReducedMotion(null), false);
});
