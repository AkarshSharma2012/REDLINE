// #277 workspace shell, recomposed into the #337 four-section Model view: structure, preferences, configuration, viewer
// failure isolation and motion. Node checks only; visual acceptance is a browser task.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PREFS_KEY, DEFAULT_PREFS, VIEWER_LABEL, sanitizePrefs, readPrefs, writePrefs, mountWorkspace } from '../src/ui/workspace.js';
import { createMotion, prefersReducedMotion, GSAP_VERSION } from '../src/ui/workspace-motion.js';
import { resultForMaterial } from '../src/main.js';
import { workspaceDoc, memoryStorage } from './fixtures/workspace-dom.mjs';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const evidence = JSON.parse(await read('data/evidence.json'));
const model = html.match(/<section id="panel-model"[\s\S]*?(?=<section id="panel-evidence")/);
const evidenceSec = html.match(/<section id="panel-evidence"[\s\S]*?(?=<section id="panel-investigations")/);

test('Model section: BOM sidebar, center viewer, summary bar and inspector keep every existing ID', () => {
  assert.ok(model && evidenceSec);
  assert.match(html, /<main id="app-main" class="workspace"/);
  const panes = [...model[0].matchAll(/<section\b[^>]*id="((?:ws-pane-|ws-inspector)[a-z]*)"/g)].map(m => m[1]);
  assert.deepEqual(panes, ['ws-pane-controls', 'ws-pane-visual', 'ws-inspector']);
  assert.ok(model[0].indexOf('ws-infobar') < model[0].indexOf('ws-pane-controls'), 'summary sits above the panes');
  for (const id of ['rover-demo', 'rover-note', 'cabin-form', 'results-table', 'fixes', 'evidence-panel', 'cabin-heading',
    'results-heading', 'evidence-heading', 'ws-materials', 'rover-viewer-root', 'ws-load-model', 'ws-info-records']) {
    assert.match(model[0], new RegExp(`id="${id}"`), id);
  }
  for (const id of ['ws-sources', 'ws-source-detail']) assert.match(evidenceSec[0], new RegExp(`id="${id}"`), id);
  assert.match(html, /id="status" role="status"/);
  assert.match(model[0], /<div id="rover-viewer-root"[^>]*\bhidden/, 'model area hidden until requested');
  assert.equal(html.split(VIEWER_LABEL).length - 1, 0, 'shell carries no duplicate caption; the viewer renders it once (#306)');
  assert.equal(VIEWER_LABEL, 'Illustrative cabin model - not a fire simulation');
});

test('stage toolbar offers labelled Model / Parts only toggles and nothing decorative', () => {
  const bar = model[0].match(/<div id="workspace-toolbar"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(bar);
  assert.match(bar[0], /role="group" aria-label="Stage view" hidden>/, 'revealed by script');
  const ids = [...bar[1].matchAll(/<button type="button" id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['ws-view-model', 'ws-view-evidence']);
  assert.match(html, /<link rel="stylesheet" href="src\/styles\/workspace\.css">/);
  assert.doesNotMatch(html, /vendor\/|three|gsap/i, 'no animation or 3D library fetched by the page');
});

test('workspace CSS is focused, restrained and stacks without page overflow on phones', async () => {
  const css = await read('src/styles/workspace.css');
  assert.ok(css.split(/\r?\n/).length < 500);
  assert.doesNotMatch(css, /gradient\(|text-shadow|backdrop-filter|blur\(|drop-shadow|box-shadow:\s*0 0 \d+px [^;]*(?:accent|7CB8FF)/i);
  assert.match(css, /@media \(max-width: 1080px\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /prefers-reduced-motion/);
  const tokens = await read('src/styles.css');
  assert.match(tokens, /@media \(pointer: coarse\), \(max-width: 1080px\) \{\s*:root \{ --control-h: 44px;/, '44 px touch targets on touch and narrow screens');
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

test('preferences: defaults, malformed and stale storage fall back', () => {
  assert.deepEqual(sanitizePrefs(undefined), DEFAULT_PREFS);
  assert.equal(sanitizePrefs({ v: 2, view: 'model' }).view, 'model');
  assert.deepEqual(sanitizePrefs({ v: 2, view: 'flames' }), DEFAULT_PREFS);
  assert.deepEqual(sanitizePrefs({ v: 1, view: 'model' }), DEFAULT_PREFS, 'stale version ignored');
  for (const raw of ['{not json', '[]', 'null', '"x"']) assert.deepEqual(readPrefs(memoryStorage({ [PREFS_KEY]: raw })), DEFAULT_PREFS, raw);
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual(readPrefs(denied), DEFAULT_PREFS);
  assert.deepEqual(readPrefs(null), DEFAULT_PREFS);
  assert.equal(writePrefs(denied, DEFAULT_PREFS), false);
});

test('only the stage view preference is persisted: no science, verification or scenario', () => {
  const store = memoryStorage();
  assert.equal(writePrefs(store, { ...DEFAULT_PREFS, verified: 45, apiKey: 'k', o2_pct: 34, selectedMaterialId: 'pmma' }), true);
  assert.deepEqual(Object.keys(JSON.parse(store.data[PREFS_KEY])).sort(), ['v', 'view']);
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

test('invalid stored preferences cannot crash the mount or hide the stage', () => {
  const { $, ws } = mount({ storage: memoryStorage({ [PREFS_KEY]: '{"v":2,"view":"x"}' }) });
  assert.equal($('ws-pane-visual').hidden, false);
  assert.deepEqual(ws.getPrefs(), DEFAULT_PREFS);
  assert.equal($('workspace-toolbar').hidden, false);
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
  const { $, ws, selected } = mount({ loadViewer, storage: memoryStorage({ [PREFS_KEY]: JSON.stringify({ ...DEFAULT_PREFS, v: 2, view: 'model' }) }) });
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

test('Pages subpath: page and workspace modules use only relative, existing local paths', async () => {
  const { existsSync } = await import('node:fs');
  for (const m of html.matchAll(/\b(?:src|href)="([^"#]+)"/g)) {
    if (/^https?:/.test(m[1])) continue;
    assert.doesNotMatch(m[1], /^\//, `${m[1]} must be relative for a /REDLINE/ subpath`);
    assert.ok(existsSync(new URL(m[1], root)), m[1]);
  }
  for (const f of ['workspace.js', 'workspace-evidence.js', 'workspace-motion.js']) {
    const src = await read(`src/ui/${f}`);
    for (const m of src.matchAll(/(?:from\s+|import\()\s*'([^']+)'/g)) {
      assert.match(m[1], /^\.\.?\//, `${f}: ${m[1]} relative`);
      if (m[1] === './rover-viewer.js') continue; // optional viewer lane module; absence is handled
      assert.ok(existsSync(new URL(`src/ui/${m[1]}`, root)), `${f}: ${m[1]}`);
    }
  }
});
