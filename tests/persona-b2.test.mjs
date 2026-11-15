// Regression tests for persona B2 findings (issue #224): Dr. Rana Whitfield, materials scientist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evaluateCabin, verifiedOnly } from '../src/main.js';
import { labelCabin } from '../src/rules/label.js';
import { retrieve } from '../src/rules/retrieve.js';
import { coverageHtml } from '../src/ui/ask.js';
import { parseBom, suggestMaterial } from '../src/ui/bom-import.js';
import { renderCabinForm, toKpa, pressureUnitHint } from '../src/ui/cabin-form.js';
import { requestText } from '../src/ui/gravity-view.js';
import { renderEvidencePanel } from '../src/ui/evidence-panel.js';

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const evidence = await read('../data/evidence.json');
const investigations = await read('../data/investigations.json');
const insights = await read('../data/insights.json');
const header = 'material,form,thickness_mm,width_mm\n';

// Small DOM double (same pattern as bom-import.test.mjs): no browser, no dependencies.
class Node {
  constructor(d, tag) {
    this.ownerDocument = d; this.tagName = tag.toUpperCase(); this.children = []; this.events = {};
    this.style = {}; this.classList = { add() {} }; this.textContent = ''; this._value = '';
  }
  // Like a real input, value is always a string.
  get value() { return this._value; }
  set value(v) { this._value = String(v); }
  append(...nodes) { for (const node of nodes) { if (typeof node === 'string') continue; this.children.push(node); node.parent = this; } }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(key, value) { this[key] = value; }
  addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((node) => node !== this); }
  focus() {}
  async fire(type) {
    const event = { target: this, preventDefault() {}, stopPropagation() { this.stopped = true; } };
    for (let node = this; node; node = node.parent) {
      for (const fn of node.events[type] || []) await fn(event);
      if (event.stopped) break;
    }
  }
}
function dom() {
  const d = { createElement: (tag) => new Node(d, tag), getElementById: () => null };
  d.head = new Node(d, 'head');
  return new Node(d, 'div');
}
const all = (root) => [root, ...root.children.flatMap(all)];
const text = (root) => all(root).map((n) => n.textContent).join('\n');

test('persona B2 (materials scientist): Cabin Check reaches the engine with the dataset, so verified rows produce labels', () => {
  // In-memory copy only: the shipped data is untouched and no row is marked verified on disk.
  const data = structuredClone(evidence);
  for (const row of data.evidence) if (row.material_id === 'sibal') row.review_status = 'verified';
  const state = { conditions: { o2_pct: 21, pressure_kpa: 101.3, gravity_g: 0 }, materials: [{ material_id: 'sibal' }] };
  const [result] = evaluateCabin(state, data);
  assert.equal(result.label, 'BURNED', 'a verified SIBAL spread row at 21% must not read as "not found"');
  const direct = labelCabin({
    conditions: { ...state.conditions, flow_speed_cm_s: null, flow_direction: null, external_heat_flux_kw_m2: null },
    materials: [{ material_id: 'sibal', form: null, thickness_mm: null, width_mm: null }],
  }, verifiedOnly(data));
  assert.deepEqual(result, direct[0]);
  // Drafts are still never used for a label.
  const [draftOnly] = evaluateCabin(state, evidence);
  assert.equal(draftOnly.reason, 'NE-no-data');
});

test('persona B2 (materials scientist): psia input carries no float noise and unit switching does not drift', async () => {
  assert.equal(toKpa(8.2, 'psia'), 56.537);
  assert.equal(toKpa(56.5, 'kpa'), 56.5);
  const root = dom(); let query;
  const presets = evidence.cabin_presets;
  const form = renderCabinForm(root, { materials: evidence.materials, presets, sources: evidence.sources,
    onChange: (q) => { query = q; } });
  const fields = all(root);
  const unit = fields.find((n) => n.name === 'unit'), pressure = fields.find((n) => n.name === 'pressure');
  assert.equal(form.getQuery().conditions.pressure_kpa, 56.5);
  unit.value = 'psia'; await unit.fire('change');
  assert.equal(pressure.value, '8.1946');
  assert.equal(form.getQuery().conditions.pressure_kpa, 56.5, 'shown psia value maps back to the exact kPa');
  unit.value = 'kpa'; await unit.fire('change');
  assert.equal(pressure.value, '56.5');
  const preset = fields.find((n) => n.textContent === presets.find((p) => p.o2_pct === 34).label);
  assert.equal(preset['aria-pressed'], 'true', 'the sourced 56.5 kPa / 34% preset stays selected after a round trip');
  unit.value = 'psia'; await unit.fire('change');
  pressure.value = '8.2'; await pressure.fire('input');
  assert.equal(query.conditions.pressure_kpa, 56.537);
  form.destroy();
});

test('persona B2 (materials scientist): a pressure typed in the wrong unit gets a visible check-the-unit hint', () => {
  assert.match(pressureUnitHint(8.2, 'kpa'), /8\.2 psia would be 56\.537 kPa/);
  assert.match(pressureUnitHint(101.3, 'psia'), /101\.3 kPa would be 14\.69 psia/);
  assert.equal(pressureUnitHint(70, 'kpa'), '');
  assert.equal(pressureUnitHint(14.7, 'psia'), '');
});

test("persona B2 (materials scientist): BOM accepts the catalog's own bracketed names and an explicit mm suffix", () => {
  const { lines, errors } = parseBom(header + 'Teflon,sheet,0.3 mm,\nPTFE  (Teflon),sheet,,\nAcrylic.,sheet,3,\n', evidence.materials);
  assert.deepEqual(errors, []);
  assert.deepEqual(lines.map((l) => [l.material_id, l.thickness_mm]), [['ptfe', 0.3], ['ptfe', null], ['pmma', 3]]);
});

test('persona B2 (materials scientist): BOM rejects other length units with the mm conversion, never converts silently', () => {
  const { lines, errors } = parseBom(header + 'pmma,sheet,0.3 cm,\nnomex,fabric,,2 in\ncotton,fabric,abc,\n', evidence.materials);
  assert.equal(lines.length, 0);
  assert.deepEqual(errors.map((e) => e.message), [
    'thickness_mm is in mm: write 3 for 0.3 cm.',
    'width_mm is in mm: write 50.8 for 2 in.',
    'thickness_mm must be a positive number in mm, or blank (got "abc").',
  ]);
});

test('persona B2 (materials scientist): a typo is suggested, not substituted, and unknown materials stay unknown', async () => {
  assert.equal(suggestMaterial('Nomx', evidence.materials)?.material_id, 'nomex');
  assert.equal(suggestMaterial('Kapton', evidence.materials), null);
  const { lines } = parseBom(header + 'Nomx,fabric,,\nKapton,tape,,\n', evidence.materials);
  assert.deepEqual(lines.map((l) => l.material_id), ['unrecognised:Nomx', 'unrecognised:Kapton']);
  const root = dom();
  const form = renderCabinForm(root, { materials: evidence.materials });
  const paste = all(root).find((n) => n.tagName === 'TEXTAREA');
  paste.value = header + 'Nomx,fabric,,\nKapton,tape,,\n';
  await all(root).find((n) => n.textContent === 'Import pasted CSV').fire('click');
  const report = text(root);
  assert.match(report, /Nomx — material not recognised; not found in the sources reviewed\. Did you mean Nomex\? It was not substituted/);
  assert.match(report, /Kapton — material not recognised; not found in the sources reviewed\.$/m);
  form.destroy();
});

test('persona B2 (materials scientist): Ask says which question words no row covers instead of implying near-misses answer it', () => {
  const data = { evidence, investigations, insights };
  const { hits, unmatched } = retrieve('What is the NASA-STD-6001B Test 1 MOC of Kapton at 30% O2?', data);
  assert.ok(hits.length > 0, 'keyword near-misses are still retrieved');
  assert.ok(unmatched.includes('kapton'));
  const html = coverageHtml(unmatched);
  assert.match(html, /No row mentions: .*kapton/);
  assert.match(html, /the answer is: not found in the sources reviewed/);
  assert.doesNotMatch(html, /\bsafe\b|never burns|never tested|will burn/i);
  assert.deepEqual(retrieve('Will Nomex burn on the Moon?', data).unmatched, []);
  assert.equal(coverageHtml([]), '');
});

test('persona B2 (materials scientist): Gravity tab shows the cabin request with units, not raw JSON', () => {
  const line = requestText({ o2_pct: 34, pressure_kpa: 56.537, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16 });
  assert.equal(line, '34% O2; 56.537 kPa absolute; forced airflow not specified; flow direction not specified; lunar scenario (0.16 g, estimate)');
  assert.doesNotMatch(line, /[{}"]/);
  assert.match(requestText({ o2_pct: 21, pressure_kpa: 101.3, flow_speed_cm_s: 5, flow_direction: 'opposed', gravity_g: 0 }),
    /forced airflow 5 cm\/s; opposed flow; microgravity reference \(0 g\)/);
});

test('persona B2 (materials scientist): evidence panel names an unrecognised material instead of showing its internal ID', () => {
  const root = dom();
  const result = { material_id: 'unrecognised:Kapton', label: 'NOT_ESTABLISHED', reason: 'NE-no-data', cited: [], wording: 'Not found in the sources reviewed' };
  renderEvidencePanel(root, result, evidence, { query: { material_id: 'unrecognised:Kapton', o2_pct: 30, pressure_kpa: 70, gravity_g: 1 } });
  const out = text(root);
  assert.match(out, /Evidence: Kapton \(material not recognised\)/);
  assert.doesNotMatch(out, /Evidence: unrecognised:/);
});
