// #337 four-section shell: routing, WAI-ARIA tab keyboard model, contextual help and the
// 390 px collapse rules. Runs the real index.html markup in jsdom; no server, no browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { SECTIONS, SUBVIEWS, routeFromHash, nextSection, applyRoute, wireHelp } from '../src/ui/section-nav.js';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const page = () => new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, '')).window.document;

test('four top tabs, each controlling one real tabpanel with content', () => {
  const doc = page();
  const tabs = [...doc.querySelectorAll('#tabs [role="tab"]')];
  assert.deepEqual(tabs.map(t => t.id), SECTIONS.map(s => `tab-${s}`));
  assert.deepEqual(tabs.map(t => t.textContent.trim()), ['Model', 'Evidence', 'Investigations', 'Review brief']);
  for (const t of tabs) {
    const panel = doc.getElementById(t.getAttribute('aria-controls'));
    assert.equal(panel?.getAttribute('role'), 'tabpanel', t.id);
    assert.equal(panel.getAttribute('aria-labelledby'), t.id);
    assert.ok(panel.querySelector('[id]'), `${t.id} panel has real content`);
  }
  assert.equal(doc.querySelectorAll('[role="tabpanel"]').length, 4, 'no duplicate hidden page');
});

test('hash routing: sections, sub-views inside their parent, #cabin alias, unknown -> Model', () => {
  for (const s of SECTIONS) assert.deepEqual(routeFromHash(`#${s}`), { section: s, view: s });
  for (const [v, s] of Object.entries(SUBVIEWS)) assert.deepEqual(routeFromHash(`#${v}`), { section: s, view: v });
  assert.deepEqual(routeFromHash('#cabin'), { section: 'model', view: 'model' });
  for (const h of ['', '#', '#nope', '#__proto__', '#constructor']) assert.equal(routeFromHash(h).section, 'model', h);
});

test('arrow keys wrap, Home/End jump, other keys are ignored', () => {
  assert.equal(nextSection('model', 'ArrowRight'), 'evidence');
  assert.equal(nextSection('brief', 'ArrowRight'), 'model');
  assert.equal(nextSection('model', 'ArrowLeft'), 'brief');
  assert.equal(nextSection('investigations', 'Home'), 'model');
  assert.equal(nextSection('evidence', 'End'), 'brief');
  assert.equal(nextSection('model', 'Enter'), null);
  assert.equal(nextSection('bogus', 'ArrowRight'), 'evidence');
});

test('applyRoute shows exactly one section, roving tabindex, one sub-view and aria-current', () => {
  const doc = page();
  applyRoute(doc, routeFromHash('#gravity'));
  const visible = SECTIONS.filter(s => !doc.getElementById(`panel-${s}`).hidden);
  assert.deepEqual(visible, ['evidence']);
  assert.equal(doc.getElementById('tab-evidence').getAttribute('aria-selected'), 'true');
  assert.equal(doc.getElementById('tab-evidence').tabIndex, 0);
  assert.equal(doc.getElementById('tab-model').tabIndex, -1);
  assert.equal(doc.getElementById('evidence-main').hidden, true);
  assert.equal(doc.getElementById('panel-gravity').hidden, false);
  assert.equal(doc.getElementById('panel-oxygen').hidden, true);
  assert.equal(doc.querySelector('.subnav a[aria-current="page"]').getAttribute('href'), '#gravity');
  assert.equal(doc.getElementById('app-main').getAttribute('data-section'), 'evidence');
  applyRoute(doc, routeFromHash('#model'));
  assert.equal(doc.getElementById('panel-model').hidden, false);
  assert.equal(doc.getElementById('panel-evidence').hidden, true);
  assert.equal(doc.getElementById('panel-gravity').hidden, true);
});

test('contextual help opens on tap, closes on Escape and outside tap; essentials stay visible', () => {
  const doc = page();
  assert.ok(wireHelp(doc) >= 1);
  const btn = doc.querySelector('.help > .help-btn');
  const tip = doc.getElementById(btn.getAttribute('aria-describedby'));
  assert.ok(tip?.textContent.trim(), 'tip text is the accessible description');
  btn.click();
  assert.equal(btn.getAttribute('aria-expanded'), 'true');
  btn.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
  btn.click();
  doc.body.dispatchEvent(new doc.defaultView.Event('pointerdown', { bubbles: true }));
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
  // Critical status is plain visible text, never inside a tip.
  for (const t of doc.querySelectorAll('.help-tip')) assert.doesNotMatch(t.textContent, /not a fire simulation|verified|not certification/i);
  const model = doc.getElementById('panel-model');
  assert.match(model.querySelector('.ws-infobar').textContent, /not a fire simulation/);
  assert.match(model.querySelector('.legend').textContent, /Not established/);
  assert.ok(doc.getElementById('rail-verified'));
});

test('help works on a minimal DOM without querySelectorAll', () => {
  assert.equal(wireHelp({}), 0);
  assert.doesNotThrow(() => applyRoute({ getElementById: () => null }, { section: 'model', view: 'model' }));
});

test('390 px: every section collapses to one column and tips stay inside the viewport', async () => {
  const css = await readFile(new URL('src/styles/workspace.css', root), 'utf8');
  const tablet = css.match(/@media \(max-width: 1080px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(tablet, /\.workspace > \.section-model, \.evidence-grid \{ grid-template-columns: minmax\(0, 1fr\)/);
  const phone = css.match(/@media \(max-width: 480px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(phone, /\.help-tip \{ position: fixed;[^}]*left: var\(--space-12\); right: var\(--space-12\)/);
  assert.match(css, /\.workspace \{ min-width: 0;/);
  assert.doesNotMatch(css.replace(/@media[^{]*/g, ''), /min-width:\s*(?:[4-9]\d\d|\d{4})px/, 'no fixed min-width wider than a phone');
});
