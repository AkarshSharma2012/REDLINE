// #297 reference-faithful workspace shell: spatial hierarchy, compact chrome, layout
// popover, phone pane switch, intentional model load and summary strip. Static and
// fake-DOM checks only; real 1440x900 / 390 / 320 rendering is a coordinator browser task.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEFAULT_PREFS, PANE_BOUNDS, SEPARATOR_PX, NARROW_QUERY, mountWorkspace } from '../src/ui/workspace.js';
import { filterSources } from '../src/ui/workspace-evidence.js';
import { workspaceDoc, memoryStorage, El } from './fixtures/workspace-dom.mjs';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const css = await read('src/styles.css');
const wsCss = await read('src/styles/workspace.css');
const evidence = JSON.parse(await read('data/evidence.json'));
const main = html.match(/<main\b[^>]*id="panel-cabin"[^>]*>([\s\S]*?)<\/main>/)[1];
const token = name => Number(css.match(new RegExp(`--${name}: (\\d+)px;`))[1]);

test('chrome stack (masthead + tabs + toolbar) fits in 120 px at a fine pointer', () => {
  const bar = token('bar-h');
  assert.ok(bar <= 36, 'bar height');
  assert.match(css, /\.app-header \{[^}]*min-height: var\(--bar-h\);[^}]*padding: 0 /, 'masthead has no vertical padding');
  assert.match(css, /\.tabs \[role="tab"\] \{[^}]*min-height: var\(--bar-h\);/);
  assert.match(wsCss, /\.ws-toolbar \{[^}]*min-height: var\(--bar-h\);[^}]*padding: 0 /);
  assert.ok(3 * bar + 3 <= 120, '3 bars + 3 hairlines');
  assert.match(css, /\.app-header \.type-title \{[^}]*font-size: 16px;/, 'wordmark, not a hero title');
  assert.ok(token('control-h') >= 24, 'WCAG 2.5.8 minimum');
});

test('default desktop geometry gives the model pane at least half of a 1440 px workspace', () => {
  const used = DEFAULT_PREFS.controls + DEFAULT_PREFS.sources + 2 * SEPARATOR_PX;
  assert.ok((1440 - used) / 1440 >= 0.5, `model share ${(1440 - used) / 1440}`);
  assert.ok(DEFAULT_PREFS.controls / 1440 < 0.18, 'slim filter rail');
  for (const pane of ['controls', 'sources']) {
    const sep = main.match(new RegExp(`id="ws-sep-${pane}"[^>]*`))[0];
    assert.match(sep, new RegExp(`aria-valuemin="${PANE_BOUNDS[pane].min}" aria-valuemax="${PANE_BOUNDS[pane].max}" aria-valuenow="${PANE_BOUNDS[pane].default}"`));
  }
  assert.match(wsCss, /\.ws-sep::after \{[^}]*left: -4px; right: -4px;/, 'hairline keeps a 9 px drag target');
});

test('toolbar shows only the pane switch, view and one Layout disclosure; rare controls are tucked away', () => {
  const toolbar = main.match(/<div id="workspace-toolbar"[\s\S]*?\n {4}<\/div>\n/)[0];
  const settings = toolbar.match(/<details id="ws-settings" class="ws-settings">\s*<summary>Layout<\/summary>([\s\S]*?)<\/details>/);
  assert.ok(settings, 'native details with a named summary');
  assert.doesNotMatch(settings[0], /<details[^>]*\bopen/);
  for (const id of ['ws-toggle-controls', 'ws-toggle-sources', 'ws-narrow-controls', 'ws-widen-controls',
    'ws-narrow-sources', 'ws-widen-sources', 'ws-density-comfortable', 'ws-density-compact', 'ws-reset']) {
    assert.match(settings[1], new RegExp(`id="${id}"`), `${id} inside Layout`);
  }
  const outside = toolbar.replace(settings[0], '');
  assert.equal((outside.match(/<button\b/g) ?? []).length, 5, '3 pane switches (phones) + 2 view buttons');
});

test('setup rail starts with one action and one short note, not an essay', () => {
  const rail = main.match(/<section id="ws-pane-controls"[\s\S]*?<div id="cabin-form">/)[0];
  const paras = [...rail.matchAll(/<p\b[^>]*>([^<]*)<\/p>/g)].map(m => m[1]);
  assert.equal(paras.length, 1);
  assert.ok(paras[0].split(/\s+/).length <= 16, 'one-line note');
});

test('model pane offers an intentional load action, honest label, and no fake status', () => {
  const visual = main.match(/<section id="ws-pane-visual"[\s\S]*?<\/section>/)[0];
  assert.match(visual, /<div id="ws-stage-empty" class="ws-stage-empty">[\s\S]*<button type="button" id="ws-load-model" class="btn-primary">Load rover model<\/button>/);
  assert.ok(visual.indexOf('ws-stage-empty') < visual.indexOf('rover-viewer-root'), 'stage placeholder occupies the model slot');
  assert.match(wsCss, /\.ws-stage-empty \{[^}]*aspect-ratio: 16 \/ 10;/, 'reserved like the viewer stage: no layout jump');
  const text = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(text, /\blive\b|online|connected|log ?in|sign ?in|notification|account|nasa seal|meatball/i);
});

test('summary strip starts loading and cites the primary NASA dataset', () => {
  const bar = main.match(/<footer class="ws-infobar"[\s\S]*?<\/footer>/)[0];
  assert.match(bar, /id="ws-info-records" class="type-data">loading</);
  assert.match(bar, /id="ws-info-selected" class="type-data">none</);
  assert.match(bar, /href="https:\/\/www\.nasa\.gov\/psi\/" target="_blank" rel="noopener">Primary dataset: NASA PSI Data Repository</);
});

test('phones show one pane at a time; no multi-column workspace below 1080 px', () => {
  const mobile = wsCss.match(/@media \(max-width: 1080px\) \{([\s\S]*?)\n\}/)[1];
  for (const p of ['controls', 'sources', 'visual']) {
    assert.match(mobile, new RegExp(`\\.workspace\\[data-pane="${p}"\\] > \\.ws-pane:not\\(#ws-pane-${p}\\)`));
  }
  assert.match(mobile, /grid-template-columns: minmax\(0, 1fr\) !important/);
  assert.match(mobile, /\.ws-jump \{ display: flex;/);
  assert.equal(NARROW_QUERY, '(max-width: 1080px)');
});

test('type stays readable: no workspace or shell text under 12 px; layout motion avoided', () => {
  for (const sheet of [css, wsCss].map(s => s.replace(/@media print \{[\s\S]*$/, ''))) {
    for (const m of sheet.matchAll(/font-size: (\d+)px/g)) assert.ok(Number(m[1]) >= 12, m[0]);
    assert.doesNotMatch(sheet, /transition:[^;]*(width|height|grid|left|top)/, 'no animated layout');
  }
  assert.match(wsCss, /\.ws-card-status \{[^}]*color: var\(--text-2\)/, 'review badge text at text-2 contrast');
  for (const f of [html, css, wsCss]) assert.ok(f.split('\n').length < 500);
});

function mount({ storage = memoryStorage(), win = null, loadViewer } = {}) {
  const doc = workspaceDoc();
  const docListeners = {};
  doc.addEventListener = (t, fn) => { (docListeners[t] ??= []).push(fn); };
  doc.removeEventListener = (t, fn) => { docListeners[t] = (docListeners[t] ?? []).filter(f => f !== fn); };
  const $ = id => doc.getElementById(id);
  const notes = new El('details', doc), notesSummary = new El('summary', doc);
  notes.append(notesSummary);
  notes.querySelector = () => notesSummary;
  doc.querySelector = sel => (sel === '.mission-notes' ? notes : null);
  doc.notes = notes; doc.notesSummary = notesSummary;
  const summary = new El('summary', doc);
  $('ws-settings').append(summary);
  $('ws-settings').querySelector = sel => (sel === 'summary' ? summary : null);
  const ws = mountWorkspace({ document: doc, storage, window: win, motion: null,
    loadViewer: loadViewer ?? (() => { throw new Error('not requested'); }) });
  return { doc, $, ws, summary, fire: (t, e) => (docListeners[t] ?? []).forEach(fn => fn(e)) };
}

test('Load rover model is lazy and user-triggered, then toggles to Show', async () => {
  let calls = 0;
  const loadViewer = async () => { calls++; return { mountRoverViewer: async () => ({ update() {}, setVisible() {}, destroy() {} }) }; };
  const { $, ws } = mount({ loadViewer });
  assert.equal(calls, 0);
  assert.equal($('ws-stage-empty').hidden, false);
  assert.equal($('ws-load-model').textContent, 'Load rover model');
  $('ws-load-model').click();
  await ws.viewerReady();
  assert.equal(calls, 1);
  assert.equal($('ws-stage-empty').hidden, true);
  assert.equal($('rover-viewer-root').hidden, false);
  assert.equal(ws.getPrefs().view, 'model');
  $('ws-view-evidence').click();
  assert.equal($('ws-stage-empty').hidden, false);
  assert.equal($('ws-load-model').textContent, 'Show rover model');
  $('ws-load-model').click();
  assert.equal(calls, 1, 'no second import');
});

test('Layout disclosure closes on Escape with focus restored, and on outside pointerdown', () => {
  const { $, doc, summary, fire } = mount();
  const settings = $('ws-settings');
  settings.open = true;
  const e = settings.dispatch('keydown', { key: 'Escape' });
  assert.equal(settings.open, false);
  assert.equal(e.defaultPrevented, true);
  assert.equal(doc.activeElement, summary);
  settings.open = true;
  fire('pointerdown', { target: summary });
  assert.equal(settings.open, true, 'inside');
  fire('pointerdown', { target: $('ws-pane-visual') });
  assert.equal(settings.open, false, 'outside');
  doc.notes.open = true;
  doc.notes.dispatch('keydown', { key: 'Escape' });
  assert.equal(doc.notes.open, false, 'scope notes close on Escape');
  assert.equal(doc.activeElement, doc.notesSummary);
  doc.notes.open = true;
  fire('pointerdown', { target: $('ws-pane-visual') });
  assert.equal(doc.notes.open, false, 'desktop overlay closes on outside pointerdown');
});

test('phones keep in-flow scope notes open on outside taps (no content shift under the finger)', () => {
  const { doc, $, fire } = mount({ win: { matchMedia: q => ({ matches: q === NARROW_QUERY }) } });
  doc.notes.open = true;
  fire('pointerdown', { target: $('ws-pane-visual') });
  assert.equal(doc.notes.open, true);
});

test('pane switch: jump buttons set data-pane and pressed state; record detail opens and returns', () => {
  const { $, ws, doc } = mount();
  const main = $('panel-cabin');
  assert.equal(main.getAttribute('data-pane'), 'sources');
  assert.equal($('ws-jump-sources').getAttribute('aria-pressed'), 'true');
  $('ws-jump-controls').click();
  assert.equal(main.getAttribute('data-pane'), 'controls');
  assert.equal(doc.activeElement, $('ws-pane-controls'));
  assert.equal($('ws-jump-sources').getAttribute('aria-pressed'), 'false');
  $('ws-toggle-sources').click();
  assert.equal($('ws-pane-sources').hidden, true);
  $('ws-jump-sources').click();
  assert.equal($('ws-pane-sources').hidden, false, 'switching to a collapsed pane re-opens it');
  ws.setEvidence(evidence);
  const card = $('ws-sources').all(n => n.getAttribute('data-evidence-id'))[0];
  card.click();
  assert.equal(main.getAttribute('data-pane'), 'visual', 'detail pane shown');
  assert.equal(card.getAttribute('aria-pressed'), 'true');
  const detail = $('ws-source-detail');
  detail.onkeydown({ key: 'Escape', preventDefault() {} });
  assert.equal(main.getAttribute('data-pane'), 'sources', 'back to the records list');
  assert.equal(doc.activeElement, card, 'focus restored to the record');
});

test('stored collapsed records pane starts on the model pane and is not silently reopened', () => {
  const { $, ws } = mount({ storage: memoryStorage({ 'redline.workspace.v1': JSON.stringify({ ...DEFAULT_PREFS, v: 1, sourcesOpen: false }) }) });
  assert.equal($('panel-cabin').getAttribute('data-pane'), 'visual');
  assert.equal(ws.getPrefs().sourcesOpen, false);
});

test('summary strip reports real counts and the current selection only', () => {
  const { $, ws } = mount();
  assert.equal($('ws-info-records').textContent, 'loading');
  ws.setEvidence(evidence);
  const r = filterSources(evidence);
  assert.equal($('ws-info-records').textContent, `${r.matched} of ${r.total} shown · ${r.verified} verified`);
  ws.update({ cabinQuery: { conditions: {}, materials: [{ material_id: 'pmma' }] } });
  ws.selectMaterial('pmma', { notify: false });
  const scoped = filterSources(evidence, { materialId: 'pmma' });
  assert.equal($('ws-info-records').textContent, `${scoped.matched} of ${scoped.total} shown · ${scoped.verified} verified`);
  assert.equal($('ws-info-selected').textContent, 'material pmma');
  ws.setEvidence(null);
  assert.equal($('ws-info-records').textContent, 'unavailable');
});

test('narrow screens move focus to the model pane on selection; desktop never steals focus', () => {
  const narrow = { matchMedia: q => ({ matches: q === NARROW_QUERY }) };
  const phone = mount({ win: narrow });
  phone.ws.setEvidence(evidence);
  phone.ws.update({ cabinQuery: { conditions: {}, materials: [{ material_id: 'pmma' }] } });
  phone.ws.selectMaterial('pmma', { notify: false });
  assert.equal(phone.doc.activeElement, phone.$('ws-pane-visual'));
  const desk = mount();
  desk.ws.setEvidence(evidence);
  desk.ws.update({ cabinQuery: { conditions: {}, materials: [{ material_id: 'pmma' }] } });
  desk.ws.selectMaterial('pmma', { notify: false });
  assert.equal(desk.doc.activeElement, null);
});
