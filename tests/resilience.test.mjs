// X1 (#169): every owned view survives empty, missing and malformed input, a failed fetch and a
// very long material name: no exception, and no 'undefined' / 'NaN' / '[object Object]' in output.
import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal DOM: enough for createElement/innerHTML views; serialize() flattens everything rendered.
class Node {
  constructor(tag = 'div', doc) { this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.attrs = {}; this.dataset = {}; this.style = {}; this.text = ''; this.html = ''; this.listeners = {}; }
  set textContent(v) { this.text = String(v ?? ''); this.children = []; this.html = ''; }
  get textContent() { return this.text + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join(''); }
  set innerHTML(v) { this.html = String(v); this.children = []; this.text = ''; }
  get innerHTML() { return this.html; }
  append(...nodes) { for (const n of nodes) if (n != null) this.children.push(n); }
  appendChild(n) { this.append(n); return n; }
  prepend(...nodes) { this.children.unshift(...nodes.filter((n) => n != null)); }
  replaceChildren(...nodes) { this.children = []; this.text = ''; this.html = ''; this.append(...nodes); }
  remove() {}
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  toggleAttribute(k, on) { if (on ?? !(k in this.attrs)) this.attrs[k] = ''; else delete this.attrs[k]; }
  addEventListener(e, fn) { (this.listeners[e] ??= []).push(fn); }
  removeEventListener() {}
  focus() {}
  contains() { return true; }
  closest() { return null; }
  querySelector() { return new Node('div', this.ownerDocument); }
  querySelectorAll() { return []; }
  get classList() { return { add() {}, remove() {}, toggle() {}, contains: () => false }; }
  serialize() {
    return `${this.text}${this.html}${Object.values(this.attrs).join(' ')}${this.children.map((c) => (typeof c === 'string' ? c : c.serialize())).join('')}`;
  }
}
const doc = { createElement: (t) => new Node(t, doc), createTextNode: (t) => String(t), getElementById: () => null, head: new Node('head'), body: new Node('body') };
doc.head.ownerDocument = doc;
globalThis.document ??= doc;
const root = () => new Node('div', doc);

const BAD = /undefined|NaN|\[object Object\]/;
function clean(label, out) {
  const s = typeof out === 'string' ? out : out.serialize();
  assert.doesNotMatch(s, BAD, `${label} rendered: ${s.match(new RegExp(`.{0,60}(${BAD.source}).{0,60}`))?.[0]}`);
  return s;
}
const LONG = `Polytetrafluoroethylene-coated fiberglass composite ${'very-long-name-'.repeat(20)}`;
const failFetch = async () => { throw new Error('network down'); };
const notFound = async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => '' });

const { renderFixes, suggestFixes } = await import('../src/ui/fixes.js');
const ask = await import('../src/ui/ask.js');
const acc = await import('../src/ui/accuracy-view.js');
const { renderGravityView, loadGravityPoints } = await import('../src/ui/gravity-view.js');
const inv = await import('../src/ui/investigations.js');
const { buildO2Preview, mountO2Slider } = await import('../src/ui/o2-slider.js');
const { labelCabin } = await import('../src/rules/label.js');

const EMPTIES = [undefined, null, {}, [], 'garbage', 42];

test('fixes: empty, malformed and long-name inputs', () => {
  for (const results of [undefined, null, [], [{}], [null], 'x', [{ label: 'BURNED', material_id: LONG }]]) {
    for (const context of [undefined, null, {}, { evidence: null }, { cabinQuery: null }, { evidence: { evidence: 'x' } }]) {
      const r = root();
      renderFixes(r, results, context);
      clean('renderFixes', r);
      assert.ok(Array.isArray(suggestFixes(results, context)));
    }
  }
  renderFixes(null, []);
});

test('ask: helpers tolerate empty and malformed rows', async () => {
  for (const hits of [undefined, null, [], [{}], [{ kind: 'evidence', row: {} }], [{ kind: 'investigation', row: {} }], [{ kind: 'insight', row: {} }],
    [{ id: 'E1', kind: 'evidence', row: { material: LONG }, matched: [{ term: 'x' }], source: { url: 'https://ntrs.nasa.gov/x' } }]]) {
    clean('hitsTableHtml', ask.hitsTableHtml(hits));
    assert.ok(Array.isArray(ask.relatedInsights(hits, null)));
    clean('answerHtml', ask.answerHtml('Answer [E1] [Z9].', hits));
    for (const h of hits ?? []) clean('summarize', ask.summarize(h));
  }
  for (const ins of [undefined, null, {}, { subject: null, cited_ids: null }, { subject: { name: LONG }, text: 't', cited_ids: ['E1'] }]) {
    clean('insightHtml', ask.insightHtml(ins, null));
  }
  clean('answerHtml', ask.answerHtml(undefined, []));
  assert.equal(await ask.loadOptionalJson('x', failFetch), null);
  assert.equal(await ask.loadOptionalJson('x', notFound), null);
});

test('ask: renders with no data, and shows an error with retry when evidence is missing', async () => {
  for (const data of [undefined, null, {}, { evidence: null }, { evidence: { evidence: 'x', sources: null } }]) {
    const r = root();
    const view = ask.renderAsk(r, data);
    const out = await view.ask('which materials burned at lunar gravity?');
    assert.ok(Array.isArray(out.hits));
    clean('renderAsk', r);
  }
  const r = root();
  await ask.mountAsk(r, null, failFetch);
  const s = clean('mountAsk', r);
  assert.match(s, /could not load/i);
  assert.match(s, /retry<\/a>/);
});

test('accuracy view: empty, malformed rows and missing sources', () => {
  for (const rows of [undefined, null, [], [{}], [null], 'x', [{ query_id: LONG, query_type: 'answerable', truth: 'BURNED', label: 'BURNED' }]]) {
    const r = root();
    renderAccuracyView(r, rows, { sources: null });
    clean('renderAccuracyView', r);
  }
  for (const text of ['', 'a,b\n', '\n\n', 'x']) assert.ok(Array.isArray(acc.parseCsv(text)));
  clean('accuracyViewHtml', acc.accuracyViewHtml(acc.summarizeResults([])));
  function renderAccuracyView(...a) { return acc.renderAccuracyView(...a); }
});

test('gravity view: missing data, malformed points, failed fetch', async () => {
  for (const data of [{ points: [] }, { points: [{}] }, { points: [{ group_id: 'pmma', review_status: 'verified' }, { group_id: 'pmma' }] }, { points: 'x' }]) {
    const r = root();
    renderGravityView(r, { data, request: { o2_pct: undefined, material: LONG } }).destroy();
    clean('renderGravityView', r);
  }
  const r = root();
  const view = renderGravityView(r, { fetchImpl: failFetch });
  await view.ready;
  const s = clean('renderGravityView failed fetch', r);
  assert.match(s, /could not be loaded/);
  assert.match(s, /Retry/);
  view.destroy();
  await assert.rejects(loadGravityPoints('x', notFound));
});

test('investigations: empty and malformed catalogs', () => {
  for (const cat of [undefined, null, {}, { investigations: [] }, { investigations: [{}] }, { investigations: [null] }, { investigations: 'x', sources: 'x' },
    { investigations: [{ id: 'x', name: LONG }, { id: 'y', name: { value: LONG } }], sources: [] }]) {
    const r = root();
    inv.renderInvestigations(r, cat);
    clean('renderInvestigations', r);
  }
  for (const [k, v] of [['name', undefined], ['o2_pct', null], ['x', {}], ['x', NaN], ['x', []]]) clean('formatValue', String(inv.formatValue(k, v)));
});

test('o2 slider: empty cabin, empty evidence, long names', () => {
  const evidence = { evidence: [], sources: {}, cabin_presets: [] };
  const cabin = { conditions: { o2_pct: 21, pressure_kpa: 101.3 }, materials: [{ material_id: 'x', name: LONG }] };
  const p = buildO2Preview(cabin, evidence, labelCabin);
  assert.equal(p.items.length, 1);
  for (const [cq, ev] of [[cabin, evidence], [cabin, {}], [cabin, null], [{ conditions: {}, materials: [] }, evidence], [undefined, undefined], [{}, { evidence: 'x' }]]) {
    const r = root();
    const view = mountO2Slider(r, { cabinQuery: cq, evidence: ev, labelCabin });
    clean('mountO2Slider', r);
    view?.destroy?.();
  }
});
