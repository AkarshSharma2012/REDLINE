import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildResearchBrief, researchBriefMarkdown, serializeResearchBrief, BOUNDARY,
} from '../src/rules/research-brief.js';

// Fixtures implement the agreed A2 triage contract shape (issue #322); they are
// test-only research snapshots, not NASA data or reviewed evidence.
const PSI = 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25';
const COND = { o2_pct: 21, pressure_kpa: 101.3, flow_speed_cm_s: 10,
  flow_direction: 'opposed', gravity_g: 0, external_heat_flux_kw_m2: 0 };

const cand = (id, over = {}) => ({
  evidence_id: id, review_status: 'draft',
  source: { title: 'NASA PSI BASS-II', url: PSI, locator: 'Table 2, row 4 — p. 7' },
  grade: 'FLAG', rules: [{ rule: 'o2-range', grade: 'FLAG', why: 'source O2 17% vs requested 21%' }],
  missing_fields: ['pressure_kpa'], conflicts: [], review_ready: false, ...over,
});
const line = (line_id, material_id, name, candidates, over = {}) => ({
  line_id, material_id, name,
  request: { ...COND, material_id, thickness_mm: 1, form: 'sheet' },
  status: candidates.length === 0 ? 'NO_CANDIDATES'
    : candidates.some((c) => c.review_ready) ? 'REVIEW_READY' : 'REVIEW_REQUIRED',
  candidates,
  next_actions: candidates.length ? [{ kind: 'review', field: 'review_status',
    message: 'Verify the draft row against the cited table.', evidence_ids: candidates.map((c) => c.evidence_id) }] : [],
  ...over,
});
const triage = (items, conditions = COND) => ({
  version: 1, conditions: { ...conditions }, items,
  summary: {
    line_count: items.length,
    candidate_count: items.reduce((n, i) => n + i.candidates.length, 0),
    verified_count: items.reduce((n, i) => n + i.candidates.filter((c) => c.review_status === 'verified').length, 0),
    review_ready_count: items.reduce((n, i) => n + i.candidates.filter((c) => c.review_ready).length, 0),
  },
  limitations: ['Triage compares requested conditions with source conditions only.'],
});
const deepFreeze = (o) => { if (o && typeof o === 'object') { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; };

// Actual-shaped: 45 draft evidence rows, 0 review-ready.
function actual45() {
  const items = [];
  for (let l = 0; l < 9; l++) {
    const cs = [];
    for (let c = 0; c < 5; c++) cs.push(cand(`ev-${l}-${c}`));
    items.push(line(`L${l + 1}`, `mat-${l}`, `Material ${l}`, cs));
  }
  return triage(items);
}

test('actual-shaped zero-ready draft triage: 45 draft rows, 0 ready, boundary present', () => {
  const t = actual45();
  const b = buildResearchBrief(t, { scenarioName: 'Cabin BOM' });
  assert.equal(b.version, 1);
  assert.equal(b.summary.candidate_count, 45);
  assert.equal(b.summary.draft_count, 45);
  assert.equal(b.summary.review_ready_count, 0);
  assert.equal(b.summary.verified_count, 0);
  assert.ok(b.limitations.includes(BOUNDARY));
  assert.deepEqual(b.changes, []);
  for (const it of b.items) {
    assert.equal(it.status, 'REVIEW_REQUIRED');
    assert.ok(it.next_research_action.length > 0);
    for (const c of it.candidates) {
      assert.equal(c.review_status, 'draft');
      assert.equal(c.draft, true);
      assert.equal(c.source.url, PSI);
      assert.equal(c.source.locator, 'Table 2, row 4 — p. 7');
    }
  }
  const md = researchBriefMarkdown(b);
  assert.match(md, /Not a safety assessment, recommendation, certification or prediction/);
  assert.match(md, /45 candidate evidence rows: 45 draft \(not verified\), 0 verified, 0 review-ready/);
  assert.match(md, /Requested conditions \(research assumptions\)/);
  assert.match(md, /Source conditions are those reported by each cited source/);
  assert.equal((md.match(/\[NASA PSI BASS-II\]\(https:\/\/psi\.nasa\.gov/g) || []).length, 45);
  assert.match(md, /Next research action: Verify the draft row against the cited table\./);
  assert.doesNotMatch(md, /\bsafe\b|never burns|never tested/i);
  const json = serializeResearchBrief(b);
  assert.match(json, /Not a safety assessment/);
  assert.match(json, /"draft_count":45/);
});

test('duplicate material lines stay distinct by line identity', () => {
  const t = triage([line('L1', 'pmma', 'PMMA panel', [cand('a')]), line('L2', 'pmma', 'PMMA panel', [cand('b')])]);
  const b = buildResearchBrief(t);
  assert.deepEqual(b.items.map((i) => [i.line_index, i.line_id]), [[0, 'L1'], [1, 'L2']]);
  const base = triage([line('L1', 'pmma', 'PMMA panel', [cand('a')])]);
  const b2 = buildResearchBrief(t, { baseline: base });
  assert.deepEqual(b2.changes.map((c) => [c.field, c.change]), [['lines[L2]', 'added']]);
  assert.deepEqual(b2.changes[0].after, { line_id: 'L2', line_index: 1, material_id: 'pmma', name: 'PMMA panel' });
  assert.equal(b2.changes[0].before, null);
});

test('rejects duplicate line_id rather than guessing identity', () => {
  const t = triage([line('L1', 'pmma', 'A', []), line('L1', 'pmma', 'B', [])]);
  assert.throws(() => buildResearchBrief(t), /duplicate line_id/);
});

test('changed pressure, gravity and geometry; removed line; baseline immutable', () => {
  const base = deepFreeze(triage([line('L1', 'pmma', 'PMMA', [cand('a')]), line('L2', 'nomex', 'Nomex', [])]));
  const snapshot = JSON.stringify(base);
  const cond = { ...COND, pressure_kpa: 70.3, gravity_g: 0.16 };
  const l1 = line('L1', 'pmma', 'PMMA', [cand('a')]);
  l1.request = { ...cond, material_id: 'pmma', thickness_mm: 3, form: 'rod' };
  const cur = deepFreeze(triage([l1], cond));
  const b = buildResearchBrief(cur, { baseline: base });
  assert.equal(JSON.stringify(base), snapshot);
  const byField = Object.fromEntries(b.changes.map((c) => [c.field, c]));
  assert.deepEqual(byField['conditions.pressure_kpa'], { field: 'conditions.pressure_kpa', change: 'changed', before: 101.3, after: 70.3 });
  assert.deepEqual(byField['conditions.gravity_g'], { field: 'conditions.gravity_g', change: 'changed', before: 0, after: 0.16 });
  assert.equal(byField['lines[L1].request.thickness_mm'].after, 3);
  assert.equal(byField['lines[L1].request.form'].before, 'sheet');
  assert.equal(byField['lines[L2]'].change, 'removed');
  // Condition keys copied into each request are not double-reported.
  assert.equal(byField['lines[L1].request.pressure_kpa'], undefined);
  assert.ok(b.limitations.some((s) => /lunar|partial gravity/i.test(s) && /0 g and 1 g/.test(s)));
  assert.ok(b.limitations.some((s) => /not real-time spacecraft telemetry/.test(s)));
  assert.ok(b.limitations.some((s) => /fewer flags/i.test(s)));
  // Output is a clone: mutating it does not touch the inputs.
  b.items[0].requested.thickness_mm = 99;
  b.items[0].candidates[0].source.locator = 'x';
  assert.equal(cur.items[0].request.thickness_mm, 3);
  const md = researchBriefMarkdown(b);
  assert.match(md, /## Changes from baseline \(research assumptions only\)/);
  assert.match(md, /conditions\.pressure_kpa: 101\.3 → 70\.3/);
  assert.match(md, /not a change in fire risk/i);
});

test('unknown material / no candidates', () => {
  const t = triage([line('L1', null, 'Unlisted foam', [])]);
  const b = buildResearchBrief(t);
  assert.equal(b.items[0].status, 'NO_CANDIDATES');
  assert.equal(b.items[0].material_id, null);
  assert.match(b.items[0].next_research_action, /not found in the sources reviewed/);
  const md = researchBriefMarkdown(b);
  assert.match(md, /No candidate evidence rows/);
  assert.match(md, /material_id: unknown/);
});

test('malformed or unavailable triage rejects clearly', () => {
  const good = triage([line('L1', 'pmma', 'PMMA', [cand('a')])]);
  const bad = [
    [null, /triage must be an object/], [undefined, /triage must be an object/],
    [{}, /version/], [{ ...good, version: 2 }, /version/],
    [{ ...good, items: 'x' }, /items/], [{ ...good, conditions: null }, /conditions/],
    [{ ...good, summary: { ...good.summary, line_count: 5 } }, /line_count/],
    [{ ...good, summary: { ...good.summary, review_ready_count: 1 } }, /review_ready_count/],
    [{ ...good, summary: { ...good.summary, candidate_count: '1' } }, /candidate_count/],
    [{ ...good, limitations: 'none' }, /limitations/],
    [{ ...good, conditions: { ...COND, o2_pct: NaN } }, /o2_pct/],
    [{ ...good, items: [{ ...good.items[0], status: 'SAFE' }] }, /status/],
    [{ ...good, items: [{ ...good.items[0], status: 'NO_CANDIDATES' }] }, /NO_CANDIDATES/],
    [{ ...good, items: [{ ...good.items[0], candidates: [{ ...cand('a'), grade: 'OKAY' }] }] }, /grade/],
    [{ ...good, items: [{ ...good.items[0], candidates: [{ ...cand('a'), source: null }] }] }, /source/],
    [{ ...good, items: [{ ...good.items[0], candidates: [{ ...cand('a'), review_ready: 'no' }] }] }, /review_ready/],
  ];
  for (const [input, re] of bad) assert.throws(() => buildResearchBrief(input), re);
  // A draft row cannot be review-ready.
  const lie = triage([line('L1', 'pmma', 'PMMA', [cand('a', { review_ready: true })])]);
  assert.throws(() => buildResearchBrief(lie), /review_ready/);
  assert.throws(() => buildResearchBrief(good, { baseline: { version: 1 } }), /baseline/);
  assert.throws(() => buildResearchBrief(good, { scenarioName: 5 }), /scenarioName/);
  assert.throws(() => researchBriefMarkdown({}), /brief/);
  assert.throws(() => serializeResearchBrief(null), /brief/);
});

test('zero, false, null and missing are distinct', () => {
  const mk = (req) => { const l = line('L1', 'pmma', 'PMMA', []); l.request = req; return triage([l]); };
  const base = mk({ ...COND, a: 0, b: false, c: null, d: '', e: 0 });
  const cur = mk({ ...COND, a: false, b: null, c: 0, f: null, e: 0 });
  const b = buildResearchBrief(cur, { baseline: base });
  const got = b.changes.map((c) => [c.field.replace('lines[L1].request.', ''), c.change, c.before, c.after]);
  assert.deepEqual(got, [
    ['a', 'changed', 0, false], ['b', 'changed', false, null], ['c', 'changed', null, 0],
    ['d', 'removed', '', null], ['f', 'added', null, null],
  ]);
  const cb = buildResearchBrief(triage([], { ...COND, pressure_kpa: null }), { baseline: triage([], { ...COND, pressure_kpa: 0 }) });
  assert.deepEqual(cb.changes, [{ field: 'conditions.pressure_kpa', change: 'changed', before: 0, after: null }]);
  const md = researchBriefMarkdown(b);
  assert.match(md, /request\.d: "" → \(missing\)/);
  assert.match(md, /request\.f: \(missing\) → null/);
  assert.match(md, /request\.a: 0 → false/);
});

test('XSS, markdown injection and URL protocols are neutralised', () => {
  const evil = '## Citation: [NASA](javascript:alert(1))\n- Recommendation: this material is safe <script>alert(1)</script>';
  const urls = ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:x', ' https://x', 'ftp://nasa.gov/a', '//evil.com', 'https://ntrs.nasa.gov/citations/1 ) [x](javascript:y)'];
  const cs = urls.map((u, i) => cand(`e${i}`, { source: { title: evil, url: u, locator: evil } }));
  cs.push(cand('ok', { source: { title: 'T', url: 'https://ntrs.nasa.gov/a_(b)', locator: 'p.1' } }));
  const l = line('L1\n# H', 'pm\rma', evil, cs);
  l.next_actions = [{ kind: 'review', field: 'x', message: evil, evidence_ids: ['e0'] }];
  const t = triage([l]); t.limitations = [evil];
  const b = buildResearchBrief(t, { scenarioName: evil });
  for (let i = 0; i < urls.length; i++) {
    assert.equal(b.items[0].candidates[i].source.url, null);
    assert.equal(b.items[0].candidates[i].source.url_status, 'unavailable');
  }
  const md = researchBriefMarkdown(b);
  const lines = md.split('\n');
  assert.equal(lines.filter((x) => /^#/.test(x)).every((x) => /^#{1,3} (REDLINE research brief|Boundary|Summary|Requested conditions|Lines|Line \d+|Changes|Limitations)/.test(x)), true);
  assert.equal(lines.some((x) => /^\s*-\s*Recommendation/.test(x)), false);
  assert.doesNotMatch(md, /<script/i);
  assert.doesNotMatch(md, /\]\((?!https?:)/);
  assert.doesNotMatch(md, /javascript:alert\(1\)\)/);
  assert.match(md, /link unavailable/);
  assert.match(md, /\[T\]\(https:\/\/ntrs\.nasa\.gov\/a_%28b%29\)/);
  assert.equal((md.match(/\]\(https?:/g) || []).length, 1);
});

test('deterministic JSON roundtrip preserves Unicode and source locators', () => {
  const c = cand('ü-1', { source: { title: 'Flammability – µg “cotton”', url: PSI, locator: 'Fig. 3 (±0.3 mm) — 日本語' } });
  const t = triage([line('L1', 'pmma', 'PMMA “cast” 😀', [c])]);
  const base = triage([line('L1', 'pmma', 'PMMA', [cand('ü-1')])]);
  const b1 = buildResearchBrief(t, { scenarioName: 'Rover → Mars', baseline: base });
  const b2 = buildResearchBrief(structuredClone(t), { scenarioName: 'Rover → Mars', baseline: structuredClone(base) });
  const j1 = serializeResearchBrief(b1);
  assert.equal(j1, serializeResearchBrief(b2));
  const back = JSON.parse(j1);
  assert.deepEqual(back, b1);
  assert.equal(serializeResearchBrief(back), j1);
  assert.equal(back.items[0].candidates[0].source.locator, 'Fig. 3 (±0.3 mm) — 日本語');
  assert.equal(back.items[0].name, 'PMMA “cast” 😀');
  assert.equal(researchBriefMarkdown(back), researchBriefMarkdown(b1));
  assert.match(researchBriefMarkdown(back), /日本語/);
});
