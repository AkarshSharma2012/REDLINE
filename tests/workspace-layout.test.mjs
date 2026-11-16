// #297 workspace shell, recomposed into four sections in #337: compact chrome, intentional
// model load, summary strip, record detail and narrow-screen focus. Static and fake-DOM
// checks only; real browser rendering is a coordinator task.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { NARROW_QUERY, mountWorkspace } from '../src/ui/workspace.js';
import { filterSources } from '../src/ui/workspace-evidence.js';
import { workspaceDoc, memoryStorage, El } from './fixtures/workspace-dom.mjs';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const css = await read('src/styles.css');
const wsCss = await read('src/styles/workspace.css');
const evidence = JSON.parse(await read('data/evidence.json'));
const main = html.match(/<main\b[^>]*id="app-main"[^>]*>([\s\S]*?)<\/main>/)[1];
const token = name => Number(css.match(new RegExp(`--${name}: (\\d+)px;`))[1]);

test('chrome stack (masthead + tabs + pane header) fits in 120 px at a fine pointer', () => {
  const bar = token('bar-h');
  assert.ok(bar <= 36, 'bar height');
  assert.match(css, /\.app-header \{[^}]*min-height: var\(--bar-h\);[^}]*padding: 0 /, 'masthead has no vertical padding');
  assert.match(css, /\.tabs \[role="tab"\] \{[^}]*min-height: var\(--bar-h\);/);
  assert.ok(3 * bar + 3 <= 120, '3 bars + 3 hairlines');
  assert.match(css, /\.app-header \.type-title \{[^}]*font-size: 16px;/, 'wordmark, not a hero title');
  assert.ok(token('control-h') >= 24, 'WCAG 2.5.8 minimum');
});

test('BOM sidebar starts with one action; its explanation is contextual help, not prose', () => {
  const rail = main.match(/<section id="ws-pane-controls"[\s\S]*?<div id="cabin-form">/)[0];
  assert.equal([...rail.matchAll(/<p\b/g)].length, 0, 'no visible paragraph before the form');
  assert.match(rail, /<button type="button" class="help-btn" aria-label="About the rover demo" aria-describedby="rover-note" aria-expanded="false">\?<\/button><span id="rover-note" class="help-tip">Illustrative pressurized rover cabin; item uses are hypothetical/);
  assert.match(rail, /id="rover-demo"[^>]*aria-describedby="rover-note"/);
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
  const bar = main.match(/<div class="ws-infobar"[\s\S]*?\n {6}<\/div>/)[0];
  assert.match(bar, /not a fire simulation/, 'model caveat stays visible text');
  assert.match(bar, /id="ws-info-records" class="type-data">loading</);
  assert.match(bar, /id="ws-info-selected" class="type-data">none</);
  assert.match(bar, /href="https:\/\/www\.nasa\.gov\/psi\/" target="_blank" rel="noopener">Primary dataset: NASA PSI Data Repository</);
});

test('phones stack each section in one column; help tips stay inside the viewport', () => {
  const mobile = wsCss.match(/@media \(max-width: 1080px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(mobile, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(mobile, /\.workspace \.ws-pane \{ overflow: visible; \}/);
  const phone = wsCss.match(/@media \(max-width: 480px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(phone, /\.help-tip \{ position: fixed;[^}]*left: var\(--space-12\); right: var\(--space-12\); width: auto; max-width: none; \}/);
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
  const ws = mountWorkspace({ document: doc, storage, window: win, motion: null,
    loadViewer: loadViewer ?? (() => { throw new Error('not requested'); }) });
  return { doc, $, ws, fire: (t, e) => (docListeners[t] ?? []).forEach(fn => fn(e)) };
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

test('scope notes close on Escape with focus restored, and on outside pointerdown on desktop', () => {
  const { $, doc, fire } = mount();
  doc.notes.open = true;
  const e = doc.notes.dispatch('keydown', { key: 'Escape' });
  assert.equal(doc.notes.open, false, 'scope notes close on Escape');
  assert.equal(e.defaultPrevented, true);
  assert.equal(doc.activeElement, doc.notesSummary);
  doc.notes.open = true;
  fire('pointerdown', { target: doc.notesSummary });
  assert.equal(doc.notes.open, true, 'inside');
  fire('pointerdown', { target: $('ws-pane-visual') });
  assert.equal(doc.notes.open, false, 'desktop overlay closes on outside pointerdown');
});

test('phones keep in-flow scope notes open on outside taps (no content shift under the finger)', () => {
  const { doc, $, fire } = mount({ win: { matchMedia: q => ({ matches: q === NARROW_QUERY }) } });
  doc.notes.open = true;
  fire('pointerdown', { target: $('ws-pane-visual') });
  assert.equal(doc.notes.open, true);
});

test('record detail opens beside the records and closes back to the record', () => {
  const { $, ws, doc } = mount();
  ws.setEvidence(evidence);
  const card = $('ws-sources').all(n => n.getAttribute('data-evidence-id'))[0];
  card.click();
  assert.equal(card.getAttribute('aria-pressed'), 'true');
  const detail = $('ws-source-detail');
  assert.ok(detail.children.length, 'detail rendered');
  assert.equal(doc.activeElement, null, 'desktop keeps focus on the list');
  detail.onkeydown({ key: 'Escape', preventDefault() {} });
  assert.equal(detail.children.length, 0);
  assert.equal(card.getAttribute('aria-pressed'), 'false');
  assert.equal(doc.activeElement, card, 'focus restored to the record');
});

test('stored v1 layout preferences are ignored; stage view starts on the part list', () => {
  const { $, ws } = mount({ storage: memoryStorage({ 'redline.workspace.v1': JSON.stringify({ v: 1, view: 'model', sourcesOpen: false }) }) });
  assert.deepEqual(ws.getPrefs(), { view: 'evidence' });
  assert.equal($('ws-stage-empty').hidden, false);
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

test('narrow screens move focus to the inspector on a part pick; desktop never steals focus', () => {
  const narrow = { matchMedia: q => ({ matches: q === NARROW_QUERY }) };
  const phone = mount({ win: narrow });
  phone.ws.setEvidence(evidence);
  phone.ws.update({ cabinQuery: { conditions: {}, materials: [{ material_id: 'pmma' }] } });
  phone.ws.selectMaterial('pmma', { notify: false });
  assert.equal(phone.doc.activeElement, null, 'host-driven syncs (results row, brief line) keep focus');
  phone.ws.selectMaterial('pmma');
  assert.equal(phone.doc.activeElement, phone.$('ws-inspector'));
  const desk = mount();
  desk.ws.setEvidence(evidence);
  desk.ws.update({ cabinQuery: { conditions: {}, materials: [{ material_id: 'pmma' }] } });
  desk.ws.selectMaterial('pmma');
  assert.equal(desk.doc.activeElement, null);
});
