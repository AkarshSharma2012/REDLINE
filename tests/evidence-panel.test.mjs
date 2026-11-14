import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderEvidencePanel } from '../src/ui/evidence-panel.js';

// Minimal DOM implements only browser primitives used by the panel; events drive
// the same rendering path as real controls. All records below are synthetic.
class Element {
  constructor(tag, doc) { this.tagName = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.events = {}; this.text = ''; }
  set textContent(v) { this.text = String(v); this.children = []; }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(' '); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.text = ''; this.children = nodes; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(k, fn) { this.events[k] = fn; }
  all(tag) { return this.children.flatMap(c => [...(c.tagName === tag ? [c] : []), ...c.all(tag)]); }
}
const doc = { createElement: tag => new Element(tag, doc) };
const root = () => new Element('div', doc);
const base = { material_id: 'nomex', material: 'Synthetic specimen', form: 'fabric', thickness_mm: null, width_mm: 10,
  o2_pct: 30, pressure_kpa: 100, flow_speed_cm_s: 0, flow_direction: 'quiescent', gravity_g: 0,
  facility: 'ISS', endpoint: 'burn/no-burn', value: null, value_unit: null, outcome: 'spread', uncertainty: 'not stated',
  run_id: 'fixture', source_key: 'NASA', source_locator: 'Synthetic test locator', external_heat_flux_kw_m2: 0,
  holdout_group: 'fixture', review_status: 'verified' };
const row = (id, extras = {}) => ({ ...base, evidence_id: id, ...extras });
const dataset = rows => ({ sources: { NASA: { title: 'Synthetic NASA metadata', url: 'https://ntrs.nasa.gov/citations/fixture' },
  OTHER: { title: 'Synthetic other publication', url: 'https://example.org/paper' } }, evidence: rows });
const query = { ...base, o2_pct: 34, pressure_kpa: 56.5, material: undefined };
const result = { material_id: 'nomex', query, wording: 'Burned in testing at these conditions', cited: ['A'], label: 'BURNED' };
const comparisons = {
  A: { grade: 'OK', rules: [{ rule: 'P', grade: 'OK', why: 'Fixture pressure agreement' }] },
  B: { grade: 'FLAG', rules: [{ rule: 'P', grade: 'FLAG', why: 'Pressure differs' }, { rule: 'T', grade: 'FLAG', why: 'Thickness not stated' }] },
  C: { grade: 'INVALID', rules: [{ rule: 'E', grade: 'INVALID', why: 'Different endpoint' }, { rule: 'F', grade: 'INVALID', why: 'Different form' }] },
};
const adapter = (_q, r) => comparisons[r.evidence_id] ?? comparisons.A;
const render = (r, rows, value = result, opts = {}) => renderEvidencePanel(r, value, dataset(rows), { compareRow: adapter, ...opts });
const click = (r, text) => { const b = r.all('button').find(b => b.textContent.includes(text)); assert.ok(b, text); b.events.click(); };

test('missing selection/query never compares request-free records', () => {
  const r = root(); render(r, [], null); assert.match(r.textContent, /Choose a cabin item/);
  render(r, [row('A')], { material_id: 'nomex' }); assert.match(r.textContent, /request snapshot/); assert.equal(r.all('ol').length, 0);
});
test('all candidates ranked independently of cited order with stable IDs and inspection last', () => {
  const r = root(), calls = [];
  render(r, [row('C'), row('B'), row('D', { review_status: 'draft' }), row('A'), row('AA')], result,
    { compareRow: (q, row, ctx) => { calls.push([q, row, ctx]); return adapter(q, row); } });
  assert.equal(calls.length, 5);
  assert.deepEqual(r.all('ol')[0].all('button').map(b => b.textContent.split(' ·')[0]), ['A', 'AA', 'B', 'C']);
  click(r, 'Inspect drafts'); assert.equal(r.all('ol')[0].all('button').at(-1).textContent, 'D · Inspection only');
});
test('selected mismatches show every non-OK reason and requested/tested partial pressure', () => {
  const r = root(); render(r, [row('B'), row('A')]); click(r, 'B ·');
  assert.match(r.textContent, /Pressure differs \(P: FLAG\)/); assert.match(r.textContent, /Thickness not stated \(T: FLAG\)/);
  assert.match(r.textContent, /19.21 kPa O2/); assert.match(r.textContent, /30 kPa O2/); assert.match(r.textContent, /Unknown/);
  assert.equal(r.all('table').length, 1); assert.equal(r.all('tbody')[0].all('tr').length, 18);
  assert.ok(r.all('a').some(a => a.href === 'https://www.nasa.gov/psi/'));
});
test('excluded and related tests preserve engine reasons and conflicts', () => {
  const r = root(); render(r, [row('A'), row('C', { endpoint: 'MOC-T1' })], { ...result, conflicts: ['C'] });
  assert.match(r.textContent, /Other comparable tests disagree/); assert.match(r.textContent, /Related test/);
  click(r, 'C ·'); assert.match(r.textContent, /Different form \(F: INVALID\)/); assert.match(r.textContent, /Recorded outcome/);
});
test('filters recover from empty views without resetting request', () => {
  const r = root(); render(r, [row('A')]); let s = r.all('select')[0]; s.value = 'INVALID'; s.events.change();
  assert.match(r.textContent, /No experiments in this view/); click(r, 'Clear filters'); assert.match(r.textContent, /A · Comparable/);
});
test('non-NASA and unverified records cannot source result wording; URLs are constrained', () => {
  const r = root(); render(r, [row('A', { source_key: 'OTHER' })]);
  assert.doesNotMatch(r.textContent, /Burned in testing/); click(r, 'Inspect drafts'); assert.match(r.textContent, /non-NASA publication/);
  const data = dataset([row('A')]); data.sources.NASA.url = 'javascript:alert(1)';
  renderEvidencePanel(r, result, data, { compareRow: adapter }); click(r, 'Inspect drafts');
  assert.match(r.textContent, /scientific values withheld/); assert.equal(r.all('a').length, 0);
});
test('lunar references remain separate and missing selected ID never substitutes a record', () => {
  const r = root(); render(r, [row('A')], { ...result, estimate: { g0: result, g1: { ...result, wording: 'Close to a measured limit' } } });
  assert.match(r.textContent, /0 g: Burned/); assert.match(r.textContent, /1 g: Close/); assert.match(r.textContent, /not a verified lunar bound/);
  render(r, [row('A')], result, { selectedId: 'removed' }); assert.match(r.textContent, /unavailable in this revision/); assert.equal(r.all('table').length, 0);
});
test('empty rows differ from comparison failures; retry can recover', () => {
  const r = root(); render(r, []); assert.match(r.textContent, /Not found in the sources reviewed for this material/);
  let ready = false;
  render(r, [row('A')], result, { compareRow: () => ready ? comparisons.A : { grade: 'FLAG', rules: [] } });
  assert.match(r.textContent, /engine failure/); ready = true; click(r, 'Retry comparison'); assert.equal(r.all('table').length, 1);
});
test('quench context is verified and gravity-specific; input objects remain unchanged', () => {
  const rows = [row('A'), row('Q', { endpoint: 'quench-limit', value_unit: 'cm/s', value: 4 }), row('D', { review_status: 'draft', endpoint: 'quench-limit', value_unit: 'cm/s', value: 9 })];
  const before = JSON.stringify(rows); const r = root();
  render(r, rows, result, { compareRow: (q, row, ctx) => { assert.deepEqual(ctx.quench_speeds_cm_s, [4]); q.o2_pct = 99; return adapter(q, row); } });
  assert.equal(JSON.stringify(rows), before); assert.equal(query.o2_pct, 34);
});
test('text is rendered literally rather than parsed as HTML', () => {
  const r = root(); render(r, [row('A', { notes: '<img src=x onerror=alert(1)>' })]);
  assert.match(r.textContent, /<img/); assert.equal(r.all('img').length, 0);
});
