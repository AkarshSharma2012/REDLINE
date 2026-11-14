import test from 'node:test';
import assert from 'node:assert/strict';
import { buildO2Preview, mountO2Slider, O2_RANGE, MISSING_PREBREATHE } from '../src/ui/o2-slider.js';

// Synthetic engine contract checks, not scientific observations. Inline because
// issue #53 owns this test file, not tests/fixtures/*. R7 protocol values below
// retain their NASA source/locator; no fixture labels claim measured outcomes.
const data = {
  schema_version: '1.0.0', built_at: 'fixture-only', built_from: 'synthetic test fixture',
  sources: {
    atmosphere: { title: 'Life Support Baseline Values and Assumptions Document', year: 2022,
      url: 'https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf' },
    historical: { title: 'Human Health and Performance', year: 2020,
      url: 'https://ntrs.nasa.gov/citations/20200001073' },
  },
  materials: [{ material_id: 'fixture-a', display_name: 'Synthetic item A', aliases: [] },
    { material_id: 'fixture-b', display_name: 'Synthetic item B', aliases: [] }],
  evidence: [{ evidence_id: 'synthetic-only', material_id: 'fixture-a', material: 'Synthetic item A',
    form: 'fabric', thickness_mm: null, width_mm: null, flow_speed_cm_s: null,
    flow_direction: 'opposed', o2_pct: 21, pressure_kpa: 101.3, gravity_g: 1,
    facility: 'ground', endpoint: 'burn/no-burn', value: null, value_unit: null,
    outcome: 'spread', uncertainty: 'not stated', run_id: 'synthetic-only',
    source_key: 'atmosphere', source_locator: 'Synthetic traceability check only; not a combustion source',
    external_heat_flux_kw_m2: 0, holdout_group: 'fixture-only', review_status: 'verified',
    verified_by: 'fixture-only' }],
  cabin_presets: [
    { preset_id: 'reference', label: '14.7 psia / about 21% O2', pressure_kpa: 101.3, o2_pct: 21,
      status: 'historical reference', context: 'ISS reference atmosphere', source_key: 'historical',
      source_locator: 'PDF p.38', prebreathe: [
        { minutes: '240', regime: 'microgravity comparison', kind: 'historical comparison',
          assumptions: '6 h EVA at 4.3 psia suit', source_key: 'historical', source_locator: 'PDF p.38' },
        { minutes: '390–420', regime: 'planetary comparison', kind: 'estimate',
          assumptions: '6 h EVA at 4.3 psia suit', validation_note: 'Unvalidated / unavailable for flight use annotation',
          source_key: 'historical', source_locator: 'PDF p.38' }] },
    { preset_id: 'staged', label: '10.2 psia / 26.5% O2', pressure_kpa: 70.3, o2_pct: 26.5,
      status: '2022 baseline recommendation', context: 'Intermediate / contingency EVA',
      source_key: 'atmosphere', source_locator: '§4.6.3.6, printed p.142 / PDF p.156',
      prebreathe: [{ minutes: '40', regime: 'baseline summary', kind: '2022 baseline summary',
        assumptions: '4.3 psia suit; not a complete procedure', source_key: 'atmosphere',
        source_locator: '§4.6.3.6, printed p.142 / PDF p.156' }] },
    { preset_id: 'exploration', label: '8.2 psia / 34% O2', pressure_kpa: 56.5, o2_pct: 34,
      status: '2022 baseline recommendation', context: 'Rovers / surface habitats with frequent EVAs',
      source_key: 'atmosphere', source_locator: '§4.6.3.6, printed p.142 / PDF p.156',
      prebreathe: [{ minutes: '15', regime: 'baseline summary', kind: '2022 baseline summary',
        assumptions: '4.3 psia suit; not a complete procedure', source_key: 'atmosphere',
        source_locator: '§4.6.3.6, printed p.142 / PDF p.156' }] },
  ],
};
const cabin = { conditions: { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: 2,
  flow_direction: 'opposed', gravity_g: 1, external_heat_flux_kw_m2: 0 },
materials: [{ material_id: 'fixture-a', form: 'fabric', thickness_mm: null, width_mm: null },
  { material_id: 'fixture-b', form: 'fabric', thickness_mm: null, width_mm: null }] };

function engine(query) {
  return query.materials.map(item => ({ material_id: item.material_id,
    label: item.material_id === 'fixture-b' ? 'NOT_ESTABLISHED'
      : query.conditions.o2_pct >= 30 ? 'BURNED' : 'NEAR',
    reason: item.material_id === 'fixture-b' ? 'NE-no-data' : null,
    cited: item.material_id === 'fixture-b' ? [] : ['synthetic-only'],
    flags: ['P'], flag_details: [{ rule: 'P', why: 'Synthetic fixture comparison' }],
    cross_gravity: false, estimate: null }));
}

// Minimal DOM for deterministic interaction tests. Real native controls are also
// checked in the browser with the opt-in temporary harness below.
class Element {
  constructor(tag, ownerDocument) { this.tagName = tag; this.ownerDocument = ownerDocument;
    this.children = []; this.attrs = {}; this.events = {}; this.value = ''; this.disabled = false; }
  set textContent(text) { this.text = String(text); this.children = []; }
  get textContent() { return (this.text ?? '') + this.children.map(child => child.textContent).join(' '); }
  setAttribute(key, value) { this.attrs[key] = value; }
  append(node) { node.parent = this; this.children.push(node); }
  replaceChildren() { this.children = []; this.text = ''; }
  addEventListener(type, fn) { (this.events[type] ??= new Set()).add(fn); }
  removeEventListener(type, fn) { this.events[type]?.delete(fn); }
  dispatch(type) { if (!this.disabled) for (const fn of this.events[type] ?? []) fn(); }
  remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
}
function all(root) { return [root, ...root.children.flatMap(all)]; }
function setup(overrides = {}) {
  const doc = { createElement: tag => new Element(tag, doc) };
  const root = new Element('main', doc);
  const calls = [];
  const api = mountO2Slider(root, { evidence: structuredClone(data), cabinQuery: structuredClone(cabin),
    labelCabin: (q, e) => { calls.push(structuredClone(q)); return engine(q, e); }, ...overrides });
  const button = text => all(root).find(node => node.tagName === 'button' && node.textContent.startsWith(text));
  const input = type => all(root).find(node => node.attrs.type === type);
  return { root, api, calls, button, input };
}

test('fixed V2 sweep and counts come from one shared-engine evaluation', () => {
  assert.deepEqual(O2_RANGE, { min: 15, max: 40, step: 0.5 });
  let calls = 0;
  const original = structuredClone(cabin);
  const state = buildO2Preview(cabin, data, (q, e) => { calls++;
    assert.deepEqual(q, cabin); assert.equal(e.schema_version, '1.0.0'); return engine(q); });
  assert.equal(calls, 1);
  assert.deepEqual(state.counts, { BURNED: 1, NEAR: 0, NOT_ESTABLISHED: 1 });
  assert.equal(state.preset.preset_id, 'exploration');
  assert.deepEqual(cabin, original);
});

test('slider changes only oxygen at every input, preserves caller and clears protocol', () => {
  const { root, input, calls } = setup();
  input('range').value = '26.5'; input('range').dispatch('input');
  assert.deepEqual(calls.at(-1), { ...cabin, conditions: { ...cabin.conditions, o2_pct: 26.5 } });
  assert.match(root.textContent, new RegExp(MISSING_PREBREATHE));
  assert.doesNotMatch(root.textContent, /Published duration:/);
  assert.match(root.textContent, /1 — Close to a measured limit/);
  assert.equal(input('number').value, '26.5');
  assert.equal(cabin.conditions.o2_pct, 34);
  assert.ok(all(root).some(node => node.attrs['aria-live'] === 'polite'));
});

test('all 51 sweep steps rerun the engine; duplicate material lines are counted separately', () => {
  const duplicate = structuredClone(cabin);
  duplicate.materials.push(structuredClone(duplicate.materials[0]));
  const { root, input, calls } = setup({ cabinQuery: duplicate });
  const before = calls.length;
  for (let oxygen = 15; oxygen <= 40; oxygen += 0.5) {
    input('range').value = String(oxygen); input('range').dispatch('input');
    assert.equal(calls.at(-1).conditions.o2_pct, oxygen);
    assert.equal(calls.at(-1).conditions.pressure_kpa, 56.5);
    if (oxygen !== 34) assert.doesNotMatch(root.textContent, /Published duration:/);
  }
  assert.equal(calls.length - before, 51);
  assert.match(root.textContent, /2 — Burned in testing at these conditions/);
});

test('presets pair pressure and oxygen; source protocols stay distinct; no interpolation', () => {
  const { root, button, input, calls } = setup();
  button('14.7 psia').dispatch('click');
  assert.equal(calls.at(-1).conditions.pressure_kpa, 101.3);
  assert.equal(calls.at(-1).conditions.o2_pct, 21);
  assert.match(root.textContent, /240 min/); assert.match(root.textContent, /390–420 min/);
  assert.match(root.textContent, /Not stated in this source/);
  assert.equal(button('14.7 psia').attrs['aria-pressed'], 'true');
  for (const oxygen of ['21.5', '26.5', '33.5']) {
    input('range').value = oxygen; input('range').dispatch('input');
    assert.match(root.textContent, new RegExp(MISSING_PREBREATHE));
    assert.doesNotMatch(root.textContent, /Published duration:/);
  }
  button('10.2 psia').dispatch('click'); assert.match(root.textContent, /40 min/);
  button('8.2 psia').dispatch('click'); assert.match(root.textContent, /15 min/);
  const links = all(root).filter(node => node.tagName === 'a');
  assert.ok(links.length > 0);
  assert.ok(links.every(node => /^https:\/\/(ntrs\.)?nasa\.gov\//.test(node.attrs.href)));
  assert.match(root.textContent, /Illustration, not a mission calculation/);
});

test('Apply is explicit, Cancel/reset preserve entry snapshot and update rebases', () => {
  const applied = [], canceled = [];
  const { api, button, input } = setup({ onApply: value => applied.push(value), onCancel: value => canceled.push(value) });
  button('10.2 psia').dispatch('click'); assert.equal(applied.length, 0);
  button('Apply').dispatch('click');
  assert.equal(applied[0].conditions.pressure_kpa, 70.3);
  button('Cancel').dispatch('click'); assert.deepEqual(canceled[0], cabin);
  button('Reset').dispatch('click'); assert.equal(input('number').value, '34');
  input('range').value = '30'; input('range').dispatch('input');
  button('Apply').dispatch('click'); assert.equal(applied[1].conditions.pressure_kpa, 56.5);
  const next = structuredClone(cabin); next.conditions.o2_pct = 22;
  api.update(next); assert.equal(input('number').value, '22');
  api.destroy(); assert.equal(input('number'), undefined);
});

test('invalid numbers never show stale counts; out-of-sweep cabin is not clamped', () => {
  const { root, button, input } = setup({ onApply() {} });
  for (const invalid of ['', '-1', '101', 'Infinity']) {
    input('number').value = invalid; input('number').dispatch('input');
    assert.equal(button('Apply').disabled, true);
    assert.match(root.textContent, /Counts unavailable/);
    assert.doesNotMatch(root.textContent, /computed by REDLINE/);
  }
  input('number').value = '42'; input('number').dispatch('input');
  assert.equal(input('number').value, '42'); assert.equal(input('range').disabled, true);
  assert.equal(button('Apply').disabled, false);
});

test('draft exclusion and traceability failure, engine failure and retry are explicit', () => {
  const withDraft = structuredClone(data);
  withDraft.evidence.push({ ...data.evidence[0], evidence_id: 'draft', review_status: 'draft' });
  buildO2Preview(cabin, withDraft, (q, e) => {
    assert.equal(e.evidence.length, 1); return engine(q);
  });
  assert.throws(() => buildO2Preview(cabin, data, () => []), /incomplete/);
  assert.throws(() => buildO2Preview(cabin, data, q => engine(q).map(r => ({ ...r, label: 'toString' }))), /invalid/);
  assert.throws(() => buildO2Preview(cabin, data, q => engine(q).map(r => ({ ...r, cited: ['missing'] }))), /Unverified/);
  let failing = true;
  const { root, button } = setup({ labelCabin(q) { if (failing) throw new Error('fixture failure'); return engine(q); } });
  assert.match(root.textContent, /Counts unavailable/);
  assert.match(root.textContent, /Published duration: 15 min/);
  failing = false; button('Retry').dispatch('click');
  assert.match(root.textContent, /computed by REDLINE/);
});

test('engine mutations cannot modify the caller query or evidence', () => {
  const query = structuredClone(cabin), evidence = structuredClone(data);
  buildO2Preview(query, evidence, (q, e) => {
    const result = engine(q);
    q.materials.length = 0; q.conditions.pressure_kpa = -1;
    e.evidence.length = 0; e.cabin_presets.length = 0;
    return result;
  });
  assert.deepEqual(query, cabin); assert.deepEqual(evidence, data);
});

test('zero verified rows and empty materials do not present zero-risk counts', () => {
  const emptyData = structuredClone(data); emptyData.evidence = [];
  const noData = q => q.materials.map(m => ({ material_id: m.material_id,
    label: 'NOT_ESTABLISHED', reason: 'NE-no-data', cited: [], flags: [], estimate: null }));
  const empty = setup({ evidence: emptyData, labelCabin: noData });
  assert.match(empty.root.textContent, /No verified evidence loaded/);
  assert.doesNotMatch(empty.root.textContent, /computed by REDLINE/);
  const blank = setup({ cabinQuery: { ...cabin, materials: [] } });
  assert.match(blank.root.textContent, /Add cabin materials/);
  assert.doesNotMatch(blank.root.textContent, /computed by REDLINE/);
});

test('lunar endpoint labels and source links remain visible; malformed preset withheld', () => {
  const { root } = setup({ labelCabin(q) {
    return engine(q).map(item => ({ ...item, cross_gravity: true,
      estimate: { g0: item, g1: item } }));
  } });
  assert.match(root.textContent, /g0:/); assert.match(root.textContent, /g1:/);
  assert.match(root.textContent, /unvalidated estimate/);
  const bad = structuredClone(data); bad.sources.atmosphere.url = 'javascript:alert(1)';
  const withheld = setup({ evidence: bad });
  assert.match(withheld.root.textContent, /preset withheld/);
  assert.doesNotMatch(withheld.root.textContent, /Published duration: 15/);
  assert.doesNotMatch(root.textContent, /\bsafe\b|never burns|never tested|will burn on the Moon/i);
});

// Generate an untracked, temporary browser harness only when explicitly requested.
// python -m http.server --directory <REDLINE_SLIDER_DEMO_DIR> serves this artifact.
if (process.env.REDLINE_SLIDER_DEMO_DIR) {
  const { mkdir, writeFile, copyFile } = await import('node:fs/promises');
  const path = await import('node:path');
  const dir = process.env.REDLINE_SLIDER_DEMO_DIR;
  await mkdir(dir, { recursive: true });
  await copyFile(new URL('../src/ui/o2-slider.js', import.meta.url), path.join(dir, 'o2-slider.js'));
  await writeFile(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width"><title>REDLINE slider fixture check</title>
<style>body{background:#0E1013;color:#E8EAED;font:14px/1.5 system-ui;margin:16px}button,input{font:inherit;min-height:24px;background:#1E2228;color:#E8EAED;border:1px solid #737B88;margin:4px;padding:4px}a{color:#7CB8FF;text-decoration:underline;margin:4px}button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #7CB8FF;outline-offset:2px}table{border-collapse:collapse}td,th{border:1px solid #737B88;padding:8px;vertical-align:top}input[type=range]{max-width:95%}p{overflow-wrap:anywhere}label{display:block}section,article{border:1px solid #2C313A;padding:8px}</style>
<h1>Synthetic fixture check — not scientific evidence</h1><main></main><p id="applied"></p>
<script type="module">import {mountO2Slider} from './o2-slider.js';
const data=${JSON.stringify(data)};const cabin=${JSON.stringify(cabin)};
const engine=${engine.toString()};
mountO2Slider(document.querySelector('main'),{cabinQuery:cabin,evidence:data,labelCabin:engine,
onApply:q=>document.querySelector('#applied').textContent='Applied '+q.conditions.o2_pct+'% / '+q.conditions.pressure_kpa+' kPa',
onCancel:()=>document.querySelector('#applied').textContent='Canceled; original cabin unchanged'});</script></html>`);
}
