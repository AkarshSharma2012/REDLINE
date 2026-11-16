// #323 evidence review cockpit: matrix, baseline difference, stale-state clearing and exports.
// Fixtures implement the A2 #321 triage contract; they are test-only, not NASA data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  conditionMatrix, compareSnapshots, describeFieldChange, orderFieldChanges, parseFieldRef,
  safeFilename, snapshot, triageQuery,
} from '../src/ui/cockpit-model.js';
import { mountReviewCockpit, STATUS_TEXT } from '../src/ui/review-cockpit.js';

const COND = { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16, external_heat_flux_kw_m2: null };
const evidence = { evidence: [
  { evidence_id: 'R1', material_id: 'pmma', form: 'sheet', thickness_mm: 0.1, width_mm: 20, o2_pct: null, pressure_kpa: null, gravity_g: 0, endpoint: null },
  { evidence_id: 'R2', material_id: 'pmma', form: 'rod', thickness_mm: 3, width_mm: null, o2_pct: 21, pressure_kpa: 101.3, gravity_g: 1, endpoint: 'LOC-FS' },
] };
const cand = (id, over = {}) => ({ evidence_id: id, review_status: 'draft',
  source: { title: `Source ${id}`, url: 'https://ntrs.nasa.gov/x.pdf#page=3', locator: `Table ${id}` },
  grade: 'FLAG', rules: [{ rule: 'G', grade: 'FLAG', why: 'gravity: cabin 0.16 g vs row 0 g; cross-gravity comparison' }],
  missing_fields: ['request.thickness_mm', 'source.pressure_kpa'], conflicts: ['gravity_g'], review_ready: false, ...over });
const item = (line_id, material_id, name, candidates, conditions = COND) => ({ line_id, material_id, name,
  request: { ...conditions, material_id, form: 'sheet', thickness_mm: null, width_mm: null },
  status: candidates.length ? 'REVIEW_REQUIRED' : 'NO_CANDIDATES', candidates,
  next_actions: candidates.length ? [{ kind: 'inspect_condition', field: 'gravity_g', message: 'Check the gravity context in the cited table.', evidence_ids: candidates.map((c) => c.evidence_id) }] : [] });
const triage = (items, conditions = COND) => ({ version: 1, conditions, items,
  summary: { line_count: items.length, candidate_count: items.reduce((n, i) => n + i.candidates.length, 0), verified_count: 0, review_ready_count: 0 },
  limitations: ['fixture'] });

test('field refs: canonical keys, request/source side and free text', () => {
  assert.deepEqual(parseFieldRef('source.pressure_kpa'), { key: 'pressure_kpa', side: 'source' });
  assert.deepEqual(parseFieldRef('gravity_g'), { key: 'gravity_g', side: null });
  assert.equal(parseFieldRef('unequal o2_pct between request and source').key, 'o2_pct');
  assert.equal(parseFieldRef(42), null);
  assert.equal(parseFieldRef('nonsense'), null);
});

test('matrix: requested vs source values, unknown stays unknown, never zero; rod width not applicable', () => {
  const it = item('line-1', 'pmma', 'Window', [cand('R1')]);
  const m = conditionMatrix(it, it.candidates[0], evidence.evidence[0]);
  const by = Object.fromEntries(m.map((c) => [c.key, c]));
  assert.equal(by.gravity_g.state, 'conflict');
  assert.equal(by.gravity_g.requested, '0.16 g');
  assert.equal(by.gravity_g.source, '0 g');
  assert.equal(by.pressure_kpa.state, 'unknown');
  assert.equal(by.pressure_kpa.side, 'source');
  assert.equal(by.pressure_kpa.source, null, 'missing source pressure is not coerced to 0');
  assert.equal(by.external_heat_flux_kw_m2.requested, null, 'unknown heat flux is not 0');
  assert.equal(by.thickness_mm.side, 'request');
  const rod = conditionMatrix(it, cand('R2', { missing_fields: [], conflicts: [] }), evidence.evidence[1]);
  assert.equal(rod.find((c) => c.key === 'width_mm').state, 'na');
  assert.equal(conditionMatrix(it, cand('R1'), undefined).find((c) => c.key === 'form').source, null);
});

test('baseline diff: gravity change names the record, field, requested and source values', () => {
  const base = triage([item('line-1', 'pmma', 'Window', [cand('R1', { conflicts: [] })])]);
  const pinned = snapshot(base);
  const cur = triage([item('line-1', 'pmma', 'Window', [cand('R1')], { ...COND, gravity_g: 1 })], { ...COND, gravity_g: 1 });
  const diff = compareSnapshots(pinned, cur, evidence);
  assert.deepEqual(diff.conditions, [{ key: 'gravity_g', label: 'Gravity', before: '0.16 g', after: '1 g' }]);
  const g = diff.fields.find((f) => f.key === 'gravity_g');
  assert.equal(g.before.state, 'listed'); assert.equal(g.after.state, 'conflict');
  assert.match(describeFieldChange(g), /^R1 · Gravity: requested 1 g vs source 0 g; now a conflict/);
  assert.equal(pinned.conditions.gravity_g, 0.16, 'baseline snapshot unaffected');
  assert.ok(!/safe|risk score|recommend/i.test(describeFieldChange(g)));
});

test('baseline diff: duplicate lines tracked separately; add/remove; no change is empty', () => {
  const a = triage([item('line-1', 'pmma', 'A', [cand('R1')]), item('line-2', 'pmma', 'A', [cand('R1')])]);
  const b = triage([item('line-1', 'pmma', 'A', [cand('R1')]), item('line-3', 'zzz', 'Unknown', [])]);
  const diff = compareSnapshots(a, b, evidence);
  assert.deepEqual(diff.lines.map((l) => [l.line_id, l.change]), [['line-3', 'added'], ['line-2', 'removed']]);
  const same = compareSnapshots(a, snapshot(a), evidence);
  assert.equal(same.conditions.length + same.lines.length + same.fields.length, 0);
  assert.deepEqual(compareSnapshots(null, a, evidence).fields, []);
  const ordered = orderFieldChanges([{ line_id: 'line-1', evidence_id: 'R1', after: { state: 'listed' } }, { line_id: 'line-2', evidence_id: 'R1', after: { state: 'conflict' } }]);
  assert.equal(ordered[0].after.state, 'conflict');
});

test('triage query keeps duplicates and names; filenames are safe', () => {
  const q = triageQuery({ conditions: COND, materials: [{ material_id: 'pmma', form: null, thickness_mm: null, width_mm: null }, { material_id: 'pmma', form: null, thickness_mm: null, width_mm: null }] },
    { materials: [{ name: ' Window ' }, { name: '' }] });
  assert.equal(q.materials.length, 2);
  assert.equal(q.materials[0].name, 'Window');
  assert.equal('name' in q.materials[1], false);
  assert.equal(safeFilename('Lunar rover <x>/../', 'md'), 'redline-brief-lunar-rover-x.md');
  assert.equal(safeFilename('', 'json'), 'redline-brief-scenario.json');
});

function dom() {
  const w = new JSDOM('<!doctype html><body><section id="c"></section></body>', { pretendToBeVisual: true }).window;
  return { w, d: w.document, root: w.document.getElementById('c') };
}
const fakeBrief = { calls: [],
  buildResearchBrief(t, o) { this.calls.push(o); return { title: o.scenarioName || 'Brief', t, o }; },
  researchBriefMarkdown: (b) => `# ${b.title}\nNot a safety assessment.`,
  serializeResearchBrief: (b) => JSON.stringify({ title: b.title }) };

test('cockpit: empty state shows one-sentence intro and primary action; exports disabled', () => {
  const { d, root } = dom();
  let loaded = 0;
  mountReviewCockpit(root, { brief: fakeBrief, onLoadScenario: () => loaded++ });
  assert.match(d.querySelector('.cockpit-intro').textContent, /^Load the illustrative lunar rover BOM/);
  d.getElementById('cockpit-load').click();
  assert.equal(loaded, 1);
  for (const id of ['cockpit-pin', 'cockpit-md', 'cockpit-json', 'cockpit-open']) assert.equal(d.getElementById(id).disabled, true, id);
});

test('cockpit: lines with duplicates and unknown material, matrix, questions, pinned change, clear', () => {
  const { d, root } = dom();
  const c = mountReviewCockpit(root, { brief: fakeBrief });
  const t1 = triage([item('line-1', 'pmma', 'Window', [cand('R1', { conflicts: [] })]), item('line-2', 'pmma', 'Window', [cand('R1', { conflicts: [] })]), item('line-3', 'mystery', 'Mystery', [])]);
  c.update({ triage: t1, evidence, scenarioName: 'Rover' });
  const lines = [...d.querySelectorAll('.cockpit-line')];
  assert.equal(lines.length, 3, 'duplicate lines preserved');
  assert.match(lines[2].textContent, new RegExp(STATUS_TEXT.NO_CANDIDATES));
  assert.match(d.getElementById('cockpit-summary').textContent, /3 lines · 2 candidate records · 0 verified · 0 review-ready/);
  assert.equal(d.querySelector('.cockpit-source a').getAttribute('href'), 'https://ntrs.nasa.gov/x.pdf#page=3');
  assert.match(d.querySelector('.cockpit-source').textContent, /Locator: Table R1.*draft \(not verified\)/);
  assert.match(d.querySelector('.cockpit-questions').textContent, /Check the gravity context/);
  lines[2].click();
  assert.match(d.querySelector('.cockpit-detail').textContent, /not a finding that it was never tested/);
  lines[0].click();
  d.getElementById('cockpit-pin').click();
  const t2 = triage([item('line-1', 'pmma', 'Window', [cand('R1')], { ...COND, gravity_g: 1 }), item('line-2', 'pmma', 'Window', [cand('R1')], { ...COND, gravity_g: 1 }), item('line-3', 'mystery', 'Mystery', [])], { ...COND, gravity_g: 1 });
  c.update({ triage: t2, evidence, scenarioName: 'Rover' });
  const changes = d.querySelector('.cockpit-changes');
  assert.equal(changes.hidden, false);
  assert.match(changes.textContent, /Requested gravity: 0.16 g → 1 g/);
  assert.match(changes.textContent, /R1 · Gravity: requested 1 g vs source 0 g; now a conflict/);
  assert.match(changes.textContent, /Fewer gaps do not mean lower fire risk/);
  assert.equal(d.querySelector('tr[data-key="gravity_g"]').dataset.changed, 'true');
  d.getElementById('cockpit-open').click();
  assert.equal(fakeBrief.calls.at(-1).baseline.conditions.gravity_g, 0.16, 'brief gets the pinned baseline');
  assert.match(d.querySelector('.cockpit-brief-text').textContent, /Not a safety assessment/);
  c.clear('Correct the cabin fields.');
  assert.equal(d.querySelectorAll('.cockpit-line').length, 0, 'stale lines cleared');
  assert.equal(d.querySelector('.cockpit-detail').children.length, 0);
  assert.equal(d.getElementById('cockpit-md').disabled, true);
  assert.equal(d.getElementById('cockpit-summary').textContent, 'Correct the cabin fields.');
});

test('cockpit: unsafe source URLs render as unavailable text, untrusted names stay text', () => {
  const { d, root } = dom();
  const c = mountReviewCockpit(root, { brief: fakeBrief });
  const evil = cand('R1', { source: { title: '<img src=x onerror=alert(1)>', url: 'javascript:alert(1)', locator: '# heading' } });
  c.update({ triage: triage([item('line-1', 'pmma', '<script>x</script>', [evil])]), evidence, scenarioName: 'x' });
  assert.equal(d.querySelector('.cockpit-source a'), null);
  assert.match(d.querySelector('.cockpit-source').textContent, /link unavailable/);
  assert.equal(d.querySelector('script, img'), null);
});

test('cockpit: brief failure is reported, not shown as an empty success', () => {
  const { d, root } = dom();
  const broken = { ...fakeBrief, buildResearchBrief: () => { throw new TypeError('triage.summary mismatch'); } };
  const c = mountReviewCockpit(root, { brief: broken });
  c.update({ triage: triage([item('line-1', 'pmma', 'W', [cand('R1')])]), evidence });
  d.getElementById('cockpit-open').click();
  assert.match(d.getElementById('cockpit-notice').textContent, /Brief unavailable: triage.summary mismatch/);
  assert.equal(d.querySelector('.cockpit-brief-text'), null);
});
