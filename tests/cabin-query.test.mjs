import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCabinQuery } from '../src/ui/cabin-query.js';
import { wireCabin, ROVER_DEMO } from '../src/main.js';
import { readFileSync } from 'node:fs';

const conditions = { o2_pct: '34', pressure_kpa: '56.5', flow_speed_cm_s: '',
  flow_direction: '', gravity_g: '0', external_heat_flux_kw_m2: null };

test('V2 query copies matching fields, keeps unknowns null and preserves duplicate lines', () => {
  const state = { name: 'Example', conditions, materials: [
    { material_id: 'pmma', name: 'Window', form: 'sheet', thickness_mm: '2', width_mm: '' },
    { material_id: 'pmma', name: 'Cover', form: '', thickness_mm: null, width_mm: '10' },
  ] };
  const before = structuredClone(state);
  const query = buildCabinQuery(state);
  assert.deepEqual(query, { conditions: { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: null,
    flow_direction: null, gravity_g: 0, external_heat_flux_kw_m2: null }, materials: [
    { material_id: 'pmma', form: 'sheet', thickness_mm: 2, width_mm: null },
    { material_id: 'pmma', form: null, thickness_mm: null, width_mm: 10 },
  ] });
  query.conditions.o2_pct = 21; query.materials[0].form = 'rod';
  assert.deepEqual(state, before);
  assert.deepEqual(buildCabinQuery().materials, []);
  assert.equal(buildCabinQuery({ conditions: { flow_speed_cm_s: 0, external_heat_flux_kw_m2: 0 } }).conditions.flow_speed_cm_s, 0);
});

// Small in-memory DOM: real form events and real results renderer, no browser/server.
class Element {
  constructor(tag, doc) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = [];
    this.attrs = {}; this.events = {}; this.style = {}; this.value = ''; this.text = '';
    this.classList = { add() {} };
  }
  set textContent(v) { this.text = String(v); this.children = []; }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(' '); }
  set value(v) { this.rawValue = String(v); }
  get value() { return this.rawValue; }
  append(...nodes) { for (const node of nodes) {
    if (this.tagName === 'SELECT' && !this.children.length) this.value = node.value;
    node.parent = this; this.children.push(node);
  } }
  replaceChildren(...nodes) { this.children = []; this.text = ''; this.append(...nodes); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
  dispatchEvent(event) {
    const target = event.target ?? this;
    for (const fn of this.events[event.type] ?? []) fn({ type: event.type, target, preventDefault() {} });
    if (event.bubbles && this.parent) this.parent.dispatchEvent({ type: event.type, target, bubbles: true });
    return true;
  }
  focus() {}
  remove() { this.parent.children = this.parent.children.filter(c => c !== this); }
  insertBefore(node, before) { node.parent = this; this.children.splice(before ? this.children.indexOf(before) : this.children.length, 0, node); }
  all() { return this.children.flatMap(c => [c, ...c.all()]); }
  querySelectorAll(selector) {
    return this.all().filter(c => selector.startsWith('[')
      ? (c[selector.match(/\[([\w-]+)=/)[1]] ?? c.attrs[selector.match(/\[([\w-]+)=/)[1]]) === selector.match(/="([^"]*)"/)[1]
      : c.tagName === selector.toUpperCase());
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  requestSubmit() { this.dispatchEvent({ type: 'submit' }); }
}
// W3 groups rows under concern-tier heading rows; count only material rows.
const dataRows = root => root.querySelectorAll('tr').filter(r => r.parent?.tagName === 'TBODY' && r.className !== 'concern-heading').length;
function setup() {
  const nodes = {};
  const doc = { createElement: tag => new Element(tag, doc), createTextNode: text => {
    const node = new Element('#text', doc); node.textContent = text; return node;
  }, getElementById: id => nodes[id] ?? null };
  doc.head = doc.createElement('head');
  for (const id of ['cabin-form', 'results-table', 'evidence-panel', 'fixes', 'rover-demo', 'o2-slider']) {
    nodes[id] = doc.createElement('div'); nodes[id].id = id;
  }
  const evidence = JSON.parse(readFileSync(new URL('fixtures/ui-cabin.json', import.meta.url), 'utf8'));
  evidence.materials.push({ material_id: 'p213', display_name: 'Fixture tape' });
  evidence.evidence = [{ evidence_id: 'fixture-only', review_status: 'verified', source_key: 'B22', source_locator: 'Synthetic UI locator' },
    { evidence_id: 'draft-only', review_status: 'draft' }];
  const calls = [];
  wireCabin(evidence, { document: doc, labelCabin: (query, rows) => {
    calls.push(structuredClone({ query, rows }));
    return query.materials.map(m => ({ material_id: m.material_id, label: 'BURNED',
      wording: 'Burned in testing at these conditions', cited: ['fixture-only'], flags: [] }));
  } });
  const form = () => nodes['cabin-form'].querySelector('form');
  const button = text => form().all().find(n => n.tagName === 'BUTTON' && n.textContent === text);
  const field = name => form().querySelector(`[name="${name}"]`);
  const edit = (input, value, type = 'input') => { input.value = value; input.dispatchEvent({ type, bubbles: true }); };
  return { nodes, calls, form, button, field, edit };
}

test('form changes render labelled rows and NASA source links without submit; removal clears results', () => {
  const s = setup();
  assert.match(s.nodes['results-table'].textContent, /Add a material/);
  assert.equal(s.calls.length, 0);
  s.button('Add material').dispatchEvent({ type: 'click' });
  const material = s.form().all().find(n => n.name?.endsWith('-material'));
  s.edit(material, 'pmma', 'change');
  assert.equal(s.calls.length, 1);
  // labelCabin (#55) takes the dataset with verified rows only, plus the material registry
  // (persona B2 fix: a bare row array made every label "not found").
  assert.ok(Array.isArray(s.calls[0].rows.evidence));
  assert.deepEqual(s.calls[0].rows.evidence.map(r => r.evidence_id), ['fixture-only']);
  assert.ok(Array.isArray(s.calls[0].rows.materials));
  assert.equal(dataRows(s.nodes['results-table']), 1);
  assert.match(s.nodes['results-table'].textContent, /Burned in testing at these conditions/);
  assert.ok(s.nodes['results-table'].all().some(n => n.href?.startsWith('https://ntrs.nasa.gov/')));
  s.edit(s.field('o2'), '26.5');
  assert.equal(s.calls.at(-1).query.conditions.o2_pct, 26.5);
  const count = s.calls.length;
  s.edit(s.field('o2'), '');
  assert.equal(s.calls.length, count, 'invalid edits do not evaluate');
  assert.equal(s.nodes['results-table'].querySelector('table'), null, 'stale labels removed');
  assert.match(s.nodes['results-table'].textContent, /Correct/);
  s.edit(s.field('o2'), '34');
  s.button('Remove material').dispatchEvent({ type: 'click' });
  assert.match(s.nodes['results-table'].textContent, /Add a material/);
});

test('rover demo evaluates all lines immediately and retains item names', async () => {
  const s = setup();
  s.nodes['rover-demo'].dispatchEvent({ type: 'click' });
  await Promise.resolve();
  assert.deepEqual(s.calls.at(-1).query.materials.map(m => m.material_id), ROVER_DEMO.items.map(m => m.material_id));
  assert.equal(dataRows(s.nodes['results-table']), ROVER_DEMO.items.length);
  assert.match(s.nodes['results-table'].textContent, /Window \/ display panel/);
});
