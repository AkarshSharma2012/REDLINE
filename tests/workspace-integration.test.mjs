// #283 integration repairs: source-first middle pane, real one-column mobile
// placement, and an unclipped viewer host. Static cascade checks only; the
// coordinator owns real browser layout at 1440/390/320.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const css = await read('src/styles/workspace.css');
const viewerCss = await read('src/styles/rover-viewer.css');

const sources = html.match(/<section\b[^>]*id="ws-pane-sources"[^>]*>([\s\S]*?)<\/section>/)[1];
const at = id => sources.indexOf(`id="${id}"`);

test('middle pane is source-first: results state, then NASA source browser, then fixes disclosure', () => {
  for (const id of ['status', 'results-table', 'sources-heading', 'ws-sources', 'fixes']) assert.ok(at(id) > -1, id);
  assert.ok(at('status') < at('results-table'));
  assert.ok(at('results-table') < at('sources-heading'), 'source browser follows compact results state');
  assert.ok(at('ws-sources') < at('fixes'), 'fixes/experiment planning sits below the source browser');
  const disclosure = sources.match(/<details\b[^>]*id="ws-fixes-disclosure"[^>]*>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/);
  assert.ok(disclosure, 'native details disclosure wraps fixes');
  assert.doesNotMatch(disclosure[0], /<details\b[^>]*\bopen/, 'collapsed by default');
  assert.match(disclosure[1], /changes the label/i);
  assert.match(disclosure[1], /experiment/i);
  assert.match(disclosure[2], /<div id="fixes"><\/div>/);
  assert.doesNotMatch(css, /#fixes[^{]*\{[^}]*display\s*:\s*none/, 'no CSS-only hiding');
});

// Minimal cascade: top-level rules plus one level of @media, selector specificity, source order.
function rules(text) {
  const out = [];
  const body = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, media = null, depth = 0;
  while (i < body.length) {
    const open = body.indexOf('{', i);
    if (open < 0) break;
    const close = body.indexOf('}', i);
    if (close > -1 && close < open) { if (media && depth === 1) media = null; depth = Math.max(0, depth - 1); i = close + 1; continue; }
    const head = body.slice(i, open).trim();
    if (head.startsWith('@media')) { media = head.slice(6).trim(); depth = 1; i = open + 1; continue; }
    const end = body.indexOf('}', open);
    const decls = Object.fromEntries(body.slice(open + 1, end).split(';').map(d => d.split(':').map(s => s?.trim()))
      .filter(([k, v]) => k && v).map(([k, ...v]) => [k, v.join(':')]));
    for (const sel of head.split(',')) out.push({ sel: sel.trim(), media, decls, order: out.length });
    i = end + 1;
  }
  return out;
}
const spec = sel => [(sel.match(/#[\w-]+/g) ?? []).length, (sel.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length,
  (sel.replace(/[#.:][\w-]+|\[[^\]]+\]/g, '').match(/[a-z]+/gi) ?? []).length];
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function matches(sel, el) {
  const parts = sel.split(/\s*>\s*|\s+/).filter(Boolean);
  const last = parts.at(-1);
  if (parts.length < 2 || !/\.workspace\b/.test(parts.slice(0, -1).join(' '))) return false;
  const ids = last.match(/#[\w-]+/g) ?? [], classes = last.match(/\.[\w-]+/g) ?? [];
  if (/[:[]/.test(last) || /^[a-z]/i.test(last)) return false;
  return ids.every(x => x === `#${el.id}`) && classes.every(c => el.classes.includes(c.slice(1)));
}
function resolve(el, prop, mobile) {
  let best = null;
  for (const r of rules(css)) {
    if (!(prop in r.decls) || !matches(r.sel, el)) continue;
    if (r.media && !(mobile && /max-width:\s*1080px/.test(r.media))) continue;
    const s = spec(r.sel);
    if (!best || cmp(s, best.s) > 0 || (cmp(s, best.s) === 0 && r.order > best.order)) best = { s, order: r.order, v: r.decls[prop] };
  }
  return best?.v;
}
const pane = id => ({ id, classes: ['region', 'ws-pane', id === 'ws-pane-controls' ? 'region-cabin' : id === 'ws-pane-sources' ? 'region-results' : 'region-evidence'] });

test('desktop keeps explicit three-pane placement', () => {
  assert.equal(resolve(pane('ws-pane-controls'), 'grid-column', false), '1');
  assert.equal(resolve(pane('ws-pane-sources'), 'grid-column', false), '3');
  assert.equal(resolve(pane('ws-pane-visual'), 'grid-column', false), '5');
});

test('mobile breakpoint overrides the ID placements: every pane resolves to column 1, auto row', () => {
  for (const id of ['ws-pane-controls', 'ws-pane-sources', 'ws-pane-visual']) {
    assert.equal(resolve(pane(id), 'grid-column', true), '1', id);
    assert.equal(resolve(pane(id), 'grid-row', true), 'auto', id);
    assert.equal(resolve(pane(id), 'min-width', true), '0', `${id} can shrink to the single track`);
  }
  const mobile = rules(css).find(r => r.media && /max-width:\s*1080px/.test(r.media) && r.decls['grid-template-columns']);
  assert.match(mobile.decls['grid-template-columns'], /^minmax\(0,\s*1fr\)\s*!important$/, 'one track');
});

test('viewer host flows the whole mounted widget; only the inner stage reserves aspect ratio and clips', () => {
  const host = rules(css).filter(r => r.sel === '.ws-viewer' && !r.media);
  assert.ok(host.length, '.ws-viewer rule');
  for (const r of host) {
    assert.ok(!('aspect-ratio' in r.decls), 'host has no aspect-ratio');
    assert.ok(!/hidden|clip/.test(r.decls.overflow ?? ''), 'host does not clip');
    assert.ok(!('height' in r.decls) && !('max-height' in r.decls), 'host height is content-driven');
  }
  const stage = rules(viewerCss).find(r => r.sel === '.rover-viewer__stage');
  assert.equal(stage.decls['aspect-ratio'], '16 / 10');
  assert.equal(stage.decls.overflow, 'hidden');
  assert.match(css, /@media print[\s\S]*\.ws-viewer/, 'print still hides the model');
});
