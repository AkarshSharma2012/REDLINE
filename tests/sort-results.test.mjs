import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderResultsTable } from '../src/ui/results-table.js';

test('concern sort orders tiers, breaks ties by material name and preserves equal-name input order', async () => {
  const { sortByConcern } = await import('../src/ui/sort-results.js');
  const rows = Object.freeze([
    Object.freeze({ material_id: 'gap', label: 'NOT_ESTABLISHED' }),
    Object.freeze({ material_id: 'z', label: 'BURNED', material_name: 'Zinc' }),
    Object.freeze({ material_id: 'near', label: 'NEAR' }),
    Object.freeze({ material_id: 'b', label: 'BURNED', material_name: 'Acrylic', item_id: 'first' }),
    Object.freeze({ material_id: 'a', label: 'BURNED', material_name: 'Acrylic', item_id: 'second' }),
  ]);
  const sorted = sortByConcern(rows);
  assert.deepEqual(sorted, [rows[3], rows[4], rows[1], rows[2], rows[0]]);
  assert.notEqual(sorted, rows);
  assert.equal(sorted[0], rows[3]);
  assert.deepEqual(sortByConcern([]), []);
  assert.deepEqual(sortByConcern([{ material_id: 'z', label: 'NEAR' }, { material_id: 'a', label: 'NEAR' }])
    .map(r => r.material_id), ['a', 'z']);
});

// Minimal DOM adapter for exercising the real renderer without a browser or dependencies.
class Node {
  constructor(tag, document) {
    this.tagName = tag; this.ownerDocument = document; this.children = [];
    this.attributes = {}; this.style = {}; this.events = {};
    this.classList = { add() {} }; this.text = '';
  }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(' '); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren() { this.children = []; this.text = ''; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(type, callback) { this.events[type] = callback; }
  all(tag) { return this.children.flatMap(c => [...(c.tagName === tag ? [c] : []), ...c.all(tag)]); }
  querySelectorAll(selector) {
    assert.equal(selector, 'button[aria-pressed]');
    return this.all('button').filter(b => 'aria-pressed' in b.attributes);
  }
}
function setup() {
  const document = {
    createElement: tag => new Node(tag, document),
    createTextNode: text => { const node = new Node('#text', document); node.textContent = text; return node; },
    getElementById: () => null,
  };
  document.head = document.createElement('head');
  return document.createElement('div');
}

test('groups show ordered counts and evidence-gap wording while sorted rows retain sources and original item identity', () => {
  const root = setup();
  const results = [
    { material_id: 'nomex', label: 'NOT_ESTABLISHED', cited: [], wording: 'Not found in the sources reviewed' },
    { material_id: 'zinc', label: 'BURNED', cited: ['z-test'], wording: 'Burned in testing at these conditions' },
    { material_id: 'cotton', label: 'NEAR', cited: ['c-test'], wording: 'Close to a measured limit' },
    { material_id: 'pmma', label: 'BURNED', cited: ['p-test'], wording: 'Burned in testing at these conditions' },
    { material_id: 'pmma', label: 'BURNED', cited: ['p-test'], wording: 'Burned in testing at these conditions' },
  ];
  const items = ['Covering', 'A panel', 'Clothing', 'Z panel', 'Second panel'].map(name => ({ name }));
  const evidence = {
    materials: [
      { material_id: 'pmma', display_name: 'Acrylic' }, { material_id: 'zinc', display_name: 'Zinc' },
      { material_id: 'cotton', display_name: 'Cotton' }, { material_id: 'nomex', display_name: 'Nomex' },
    ],
    sources: { nasa: { title: 'Synthetic NASA source fixture', url: 'https://ntrs.nasa.gov/citations/20250002114' } },
    evidence: ['z-test', 'c-test', 'p-test'].map(evidence_id => ({
      evidence_id, review_status: 'verified', source_key: 'nasa', source_locator: evidence_id,
    })),
  };
  const selections = [];
  renderResultsTable(root, results, { items, evidence, onSelect: (...args) => selections.push(args) });
  assert.deepEqual(root.all('h3').map(n => n.textContent), [
    'Burned in testing at these conditions (3)', 'Close to a measured limit (1)',
    'Not found in the sources reviewed (1)',
  ]);
  assert.match(root.all('tbody')[2].textContent, /This is a gap in the evidence, not a finding about the material\./);
  assert.doesNotMatch(root.textContent, /safe/i);
  const buttons = root.all('button');
  assert.deepEqual(buttons.map(b => b.textContent), ['Z panel', 'Second panel', 'A panel', 'Clothing', 'Covering']);
  const rows = root.all('tbody').flatMap(b => b.children.slice(1));
  assert.deepEqual(rows.map(r => r.all('a').map(a => a.textContent)), [
    ['Synthetic NASA source fixture — p-test (opens in new tab)'],
    ['Synthetic NASA source fixture — p-test (opens in new tab)'],
    ['Synthetic NASA source fixture — z-test (opens in new tab)'],
    ['Synthetic NASA source fixture — c-test (opens in new tab)'],
    ['Synthetic NASA source fixture — Reviewed source inventory (opens in new tab)'],
  ]);
  for (const row of rows) assert.equal(row.all('a')[0].href, evidence.sources.nasa.url);
  buttons[0].events.click(); buttons[3].events.click();
  assert.deepEqual(selections, [[results[3], { item: items[3], index: 3 }], [results[2], { item: items[2], index: 2 }]]);
  assert.equal(buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(buttons[3].attributes['aria-pressed'], 'true');
});

test('absent tiers have zero counts and a rerender replaces previous groups', () => {
  const root = setup();
  renderResultsTable(root, [{ material_id: 'unknown', label: 'NOT_ESTABLISHED' }]);
  assert.deepEqual(root.all('h3').map(n => n.textContent), [
    'Burned in testing at these conditions (0)', 'Close to a measured limit (0)',
    'Not found in the sources reviewed (1)',
  ]);
  renderResultsTable(root, []);
  assert.equal(root.all('tbody').length, 0);
  assert.match(root.textContent, /Add a material/);
});
