import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderGravityView, loadGravityPoints } from '../src/ui/gravity-view.js';

const data = JSON.parse(await readFile(new URL('../data/gravity-points.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(data);

// Minimal event host for Node; real DOM/SVG/layout are checked in the browser.
class Root {
  innerHTML = '';
  listeners = new Map();
  focusSelector = null;
  panel = { innerHTML: '', focus() {} };
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  removeEventListener(name, fn) { if (this.listeners.get(name) === fn) this.listeners.delete(name); }
  contains() { return true; }
  querySelector(selector) {
    if (selector === '[data-evidence-detail]') return this.panel;
    return { focus: () => { this.focusSelector = selector; } };
  }
  fire(name, dataset = {}, value = '') {
    const target = { dataset, value,
      closest() { return this; },
      focus() {},
      hasAttribute(attr) { return Object.hasOwn(dataset, attr.replace(/^data-/, '')); },
      matches(selector) { return Object.hasOwn(dataset, selector.slice(6, -1)); },
    };
    this.listeners.get(name)?.({ target });
  }
}
function mount(options = {}) {
  const root = new Root();
  const view = renderGravityView(root, { data: clone(), ...options });
  return { root, view };
}

test('sourced adapter retains all 24 non-compensation records and the research gate', () => {
  assert.equal(data.schema_version, 'gravity-view-1');
  assert.match(data.research_revision, /^[a-f0-9]{40}$/);
  assert.equal(data.points.length, 24);
  assert.equal(new Set(data.points.map((p) => p.evidence_id)).size, 24);
  assert.equal(data.points.filter((p) => p.kind === 'extrapolation').length, 12);
  assert.equal(data.points.filter((p) => p.kind === 'digitized-reference').length, 6);
  assert.equal(data.points.filter((p) => p.kind === 'measurement').length, 6);
  for (const p of data.points) {
    assert.ok(p.group_id && p.endpoint && p.source_title && p.source_locator);
    assert.equal(new URL(p.source_url).hostname, 'ntrs.nasa.gov');
    assert.equal(p.value_unit, '% O2');
    assert.ok(Number.isFinite(p.value));
    assert.notEqual(p.review_status, 'verified');
    assert.notEqual(p.endpoint, 'compensation-factor-estimate');
    assert.ok(p.uncertainty);
  }
});

test('preserves R3 paired values, separate forms and cotton endpoints', () => {
  const expected = {
    pmma: [13.5, 13.6, 14.7], p213: [13, 15.7, 16.3],
    'cotton-flaming': [11, 8.5, 9.7], 'cotton-smolder': [11, 8.5, 9.7],
    polycarbonate: [21, 17.6, 19], 'nomex-velcro': [24, 21.1, 21.1],
  };
  for (const [group, values] of Object.entries(expected)) {
    const records = data.points.filter((p) => p.group_id === group);
    assert.deepEqual(records.map((p) => p.value), values);
    assert.deepEqual(records.map((p) => p.comparison_velocity_cm_s), [null, 0, 35]);
    assert.equal(records[0].flow_speed_cm_s, null);
    assert.ok(records.every((p) => p.review_status === 'HOLD_scientific_review'));
  }
  assert.equal(data.points.find((p) => p.group_id === 'cotton-smolder').endpoint, 'smolder-extinction-5s');
  assert.ok(data.points.filter((p) => p.group_id === 'nomex-fabric').every((p) => p.material === 'Nomex HT90-40'));
});

test('held numeric content appears only inside explicitly labeled research detail', () => {
  const { root } = mount();
  const [main, detail] = root.innerHTML.split('<details data-research>');
  assert.match(main, /Reviewed numeric series unavailable/);
  assert.doesNotMatch(main, /data-point=|13\.5 % O2|<svg/);
  assert.match(detail, /Research only/);
  assert.match(detail, /excluded from cabin results/);
  assert.match(detail, /HOLD_scientific_review/);
  assert.match(detail, /editorial estimates/);
  assert.match(root.innerHTML, /For these tested setups/);
  assert.match(root.innerHTML, /Not measurements on the lunar surface/);
});

test('SVG never invents a zero-flow lunar point; each plotted point links its NASA page', () => {
  const { root } = mount();
  const points = [...root.innerHTML.matchAll(/<a href="([^"]+)"[^>]*data-point="([^"]+)"/g)];
  assert.deepEqual(points.map((m) => m[2]), ['U25-01-E0', 'U25-01-E35']);
  // The digitization URL is the presentation: slide 14, not paper page 8.
  assert.ok(points.every((m) => m[1].includes('ntrs.nasa.gov') && m[1].endsWith('#page=14')));
  assert.match(root.innerHTML, /Separate simulated-lunar references · flow not stated; not plotted at zero/);
  assert.match(root.innerHTML, /approximately 13\.5 % O2/);
  assert.match(root.innerHTML, /<table>/);
  assert.match(root.innerHTML, /<caption>Oxygen limits for these tested setups/);
  assert.doesNotMatch(root.innerHTML, /<polyline|<linearGradient|<canvas|<script/);
});

test('source-complete reviewed fixture renders independently of held research', () => {
  const fixture = clone();
  fixture.points = fixture.points.filter((p) => p.group_id === 'pmma').map((p) => ({ ...p, review_status: 'verified', verified_by: 'fixture-only' }));
  const { root } = mount({ data: fixture });
  assert.doesNotMatch(root.innerHTML, /Reviewed numeric series unavailable|data-research/);
  assert.match(root.innerHTML, /data-point="U25-01-E0"/);
  assert.match(root.innerHTML, /Hollow diamond/);
  assert.match(root.innerHTML, /not a measurement/);
  assert.match(root.innerHTML, /Unknown|not stated|Not stated/);
});

test('missing provenance or units withholds values and SVG marks', () => {
  for (const field of ['source_locator', 'source_url', 'value_unit', 'uncertainty']) {
    const fixture = clone();
    fixture.points = [fixture.points.find((p) => p.evidence_id === 'U25-01-E0')];
    fixture.points[0][field] = '';
    const { root } = mount({ data: fixture });
    assert.doesNotMatch(root.innerHTML, /data-point=/);
    assert.match(root.innerHTML, /Value withheld: missing/);
    assert.doesNotMatch(root.innerHTML, />13\.6 % O2/);
  }
});

test('missing counterpart does not produce a delta or an invented partner', () => {
  const fixture = clone();
  fixture.points = [fixture.points.find((p) => p.evidence_id === 'U25-01-E35')];
  const { root } = mount({ data: fixture });
  assert.match(root.innerHTML, /Counterpart unavailable/);
  assert.doesNotMatch(root.innerHTML, /data-point="U25-01-L"/);
});

test('family and condition controls separate cotton smolder, Velcro and historical fabric', () => {
  const { root } = mount();
  root.fire('click', { family: 'Cotton' });
  assert.match(root.innerHTML, /cotton-flaming/);
  root.fire('change', { group: '' }, 'cotton-smolder');
  assert.match(root.innerHTML, /smolder-extinction-5s/);
  assert.doesNotMatch(root.innerHTML, /data-point="U25-03-/);
  root.fire('click', { family: 'Nomex' });
  assert.match(root.innerHTML, /Nomex Velcro/);
  root.fire('change', { group: '' }, 'nomex-fabric');
  assert.match(root.innerHTML, /Nomex HT90-40/);
  assert.match(root.innerHTML, /Discrete gravity\/endpoint categories; criteria differ/);
  assert.match(root.innerHTML, /data-point="OF12-NOMEX-L-ULOISTAR"/);
  assert.doesNotMatch(root.innerHTML, /data-point="U25-06|data-point="OF12-NOMEX-1G-MOC/);
  root.fire('change', { endpoint: '' }, 'MOC');
  assert.match(root.innerHTML, /data-point="OF12-NOMEX-L-MOCSTAR"/);
  assert.doesNotMatch(root.innerHTML, /data-point="OF12-NOMEX-L-ULOISTAR"/);
  assert.equal(root.focusSelector, '[data-endpoint]');
});

test('source-linked flow note and Marcum card retain branch and calibration limitations', () => {
  const { root } = mount();
  assert.match(root.innerHTML, /Low flow: extinction \/ quenching/);
  assert.match(root.innerHTML, /No universal numeric cutoffs/);
  assert.match(root.innerHTML, /Flight data informed calibration/);
  assert.match(root.innerHTML, /axisymmetric PMMA rod/);
  assert.match(root.innerHTML, /not independent universal Earth-to-space prediction/);
  assert.match(root.innerHTML, /20160012691\.pdf#page=6/);
  assert.match(root.innerHTML, /Fig\. 1, p\. 2/);
  assert.match(root.innerHTML, /taskbook\.nasaprs\.com/);
  assert.doesNotMatch(root.innerHTML, /Source metadata unavailable/);
});

test('navigation forwards original request and unmodified evidence with research flag', () => {
  const request = Object.freeze({ material_id: 'pmma', pressure_kpa: 56.5 });
  const calls = [];
  const { root } = mount({ request, onBack: (q) => calls.push(q), onOpenEvidence: (p, ctx) => calls.push([p, ctx]) });
  root.fire('click', { back: '' });
  root.fire('click', { record: 'U25-01-L' });
  assert.equal(calls[0], request);
  assert.equal(calls[1][0].evidence_id, 'U25-01-L');
  assert.equal(calls[1][1].request, request);
  assert.equal(calls[1][1].researchOnly, true);
});

test('loader rejects HTTP/schema failures and passes the specified URL', async () => {
  await assert.rejects(loadGravityPoints('/test', async () => ({ ok: false, status: 404 })), /HTTP 404/);
  await assert.rejects(loadGravityPoints('/test', async () => ({ ok: true, json: async () => ({ points: [] }) })), /schema/);
  const loaded = await loadGravityPoints('/fixture', async (url) => {
    assert.equal(url, '/fixture');
    return { ok: true, json: async () => clone() };
  });
  assert.equal(loaded.points.length, 24);
});

test('loading/failure/retry is distinct from an empty extraction', async () => {
  const root = new Root();
  let calls = 0;
  const view = renderGravityView(root, { fetchImpl: async () => {
    calls++;
    if (calls === 1) throw new Error('offline');
    return { ok: true, json: async () => clone() };
  } });
  assert.match(root.innerHTML, /Loading gravity evidence/);
  assert.doesNotMatch(root.innerHTML, /data-point=/);
  await view.ready;
  assert.match(root.innerHTML, /could not be loaded \(offline\)/);
  assert.match(root.innerHTML, /Retry gravity data/);
  await view.reload();
  assert.match(root.innerHTML, /Gravity research loaded/);
  assert.doesNotMatch(root.innerHTML, /could not be loaded/);
  const empty = mount({ data: { ...clone(), points: [] } });
  assert.match(empty.root.innerHTML, /No records in this extraction/);
  assert.match(empty.root.innerHTML, /ntrs.nasa.gov/);
});

test('destroy and remount prevent late loads and duplicate listeners', async () => {
  const root = new Root();
  let resolve;
  const old = renderGravityView(root, { fetchImpl: () => new Promise((r) => { resolve = r; }) });
  const current = renderGravityView(root, { data: clone(), groupId: 'p213' });
  const html = root.innerHTML;
  resolve({ ok: true, json: async () => ({ ...clone(), points: [] }) });
  await old.ready;
  assert.equal(root.innerHTML, html);
  assert.equal(root.listeners.size, 3);
  current.destroy();
  assert.equal(root.listeners.size, 0);
});

test('local evidence disclosure closes with Escape and restores its opener', () => {
  const { root } = mount();
  let restored = false;
  const target = { dataset: { record: 'U25-01-L' }, closest() { return this; },
    hasAttribute() { return false; }, focus() { restored = true; } };
  root.listeners.get('click')({ target });
  assert.match(root.panel.innerHTML, /Selected evidence: U25-01-L/);
  assert.match(root.panel.innerHTML, /Close evidence detail/);
  root.listeners.get('keydown')({ key: 'Escape', preventDefault() {} });
  assert.equal(root.panel.innerHTML, '');
  assert.equal(restored, true);
});

test('malformed data and hostile metadata cannot inject markup or executable URLs', () => {
  const invalid = mount({ data: { schema_version: 'gravity-view-1', points: [null] } });
  assert.match(invalid.root.innerHTML, /schema unavailable/);
  const fixture = clone();
  fixture.points = [fixture.points[1]];
  fixture.points[0].source_url = 'javascript:alert(1)';
  fixture.points[0].material = '<img src=x onerror=alert(1)>';
  const { root } = mount({ data: fixture, request: '<script>alert(1)</script>' });
  assert.doesNotMatch(root.innerHTML, /<img|<script|href="javascript:/);
  assert.match(root.innerHTML, /&lt;img/);
  assert.match(root.innerHTML, /Value withheld/);
});

test('all material views preserve science wording and never emit a cabin classification', () => {
  for (const groupId of new Set(data.points.map((p) => p.group_id))) {
    const { root } = mount({ groupId });
    assert.doesNotMatch(root.innerHTML, /\b(?:safe|nonflammable)\b|never burns|never tested|will burn on the moon/i);
    assert.match(root.innerHTML, /assumed envelope unavailable/);
    assert.match(root.innerHTML, /Lunar behavior may fall outside/);
    assert.doesNotMatch(root.innerHTML, /data-label="(?:BURNED|NEAR)"/);
  }
});
