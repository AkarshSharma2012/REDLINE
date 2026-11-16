import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildResearchBrief, researchBriefMarkdown, serializeResearchBrief, BOUNDARY, TESTED_KEYS,
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
  assert.match(json, /"draft_count": 45/);
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
  assert.ok(b.limitations.some((s) => /lunar/i.test(s) && /do not establish behavior at the requested gravity/.test(s)));
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

// B1 #323 integration additions (reviewed on PR #324): candidate-level change tracking and
// request-or-source missing-field label.
test('candidate-level changes: gravity 0.16 -> 1 adds a gravity_g conflict on a draft row', () => {
  const base = triage([line('L1', 'pmma', 'Window', [cand('R1', { conflicts: [] }), cand('R2')])], { ...COND, gravity_g: 0.16 });
  const cur = triage([line('L1', 'pmma', 'Window', [cand('R1', { conflicts: ['gravity_g'] }), cand('R3')], { request: { ...COND, gravity_g: 1, material_id: 'pmma', thickness_mm: 1, form: 'sheet' } })], { ...COND, gravity_g: 1 });
  const b = buildResearchBrief(cur, { baseline: base });
  const f = b.changes.map((c) => `${c.field}:${c.change}`);
  assert.ok(f.includes('conditions.gravity_g:changed'));
  const g = b.changes.find((c) => c.field === 'lines[L1].candidates[R1].conflicts');
  assert.deepEqual([g.before, g.after], [[], ['gravity_g']]);
  assert.ok(f.includes('lines[L1].candidates[R3]:added'));
  assert.ok(f.includes('lines[L1].candidates[R2]:removed'));
  assert.equal(b.changes.find((c) => c.field === 'lines[L1].candidates[R3]').after.review_status, 'draft');
  assert.deepEqual(buildResearchBrief(cur, { baseline: base }).changes, b.changes, 'deterministic');
  const md = researchBriefMarkdown(b);
  assert.match(md, /lines\\[L1\\]\.candidates\\[R1\\]\.conflicts: \[\] → \\["gravity\_g"\\]|candidates.*R1.*conflicts/);
  assert.match(md, /Missing or unknown fields \(request or source side\): pressure_kpa/);
  assert.doesNotMatch(md, /Source fields not reported/);
});

// #329: tested conditions and source caveats survive the file handoff.
// U25-01-L values and notes copied verbatim from data/evidence.json (draft row,
// HOLD_scientific_review); the test does not change or promote it.
const U25_NOTES = 'NASA nominal simulated acceleration: 1/6 g; 0.16 g is project normalization, not NASA nominal. PMMA form sheet is inferred, not source-stated. 13.5 mol% O2 is a plot-derived five-second extinction result for 0.8 mm PMMA at 56.5 kPa absolute, not a general flammability or safety limit. Review: CORRECTION NEEDED (Lakshya, relayed by user through chat, 2026-11-15); HOLD_scientific_review and draft retained. Durable record: research/reviews/U25-01-L-2026-11-15.md. Draft; simulated conditions are not on-Moon behavior. See lunar-2025.md source discrepancy register. Flow blank: not measured, not zero. Unknown heat flux remains blank per V1; original endpoint and gravity retained as provenance.';
const U25_TESTED = { form: 'sheet', thickness_mm: 0.8, width_mm: null, o2_pct: 13.5, pressure_kpa: 56.5, flow_speed_cm_s: null,
  flow_direction: 'concurrent', gravity_g: 0.16, external_heat_flux_kw_m2: null, endpoint: 'extinction-5s', outcome: null };
const u25 = (over = {}) => cand('U25-01-L', {
  source: { title: 'Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results',
    url: 'https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf', locator: 'pp. 5-8 Experimental Method; Fig. 7 p. 8' },
  tested_conditions: { ...U25_TESTED }, source_notes: U25_NOTES, ...over });

test('#329 production U25-01-L tested conditions and caveats survive JSON and Markdown', () => {
  const t = triage([line('L1', 'pmma', 'PMMA window', [u25()])], { ...COND, gravity_g: 0.16 });
  const snap = JSON.stringify(t);
  const b = buildResearchBrief(deepFreeze(t));
  assert.equal(JSON.stringify(t), snap, 'input untouched');
  const c = b.items[0].candidates[0];
  assert.deepEqual(c.tested_conditions, U25_TESTED);
  assert.equal(c.tested_conditions_status, 'available');
  assert.equal(c.source_notes, U25_NOTES);
  assert.equal(c.review_status, 'draft'); assert.equal(c.draft, true); assert.equal(c.review_ready, false);
  // Reopen from the file alone (no dataset): exact values, notes and provenance.
  const back = JSON.parse(serializeResearchBrief(b));
  assert.deepEqual(back, b);
  const bc = back.items[0].candidates[0];
  assert.deepEqual(bc.tested_conditions, U25_TESTED);
  assert.equal(bc.source_notes, U25_NOTES);
  assert.equal(bc.evidence_id, 'U25-01-L');
  assert.equal(bc.source.locator, 'pp. 5-8 Experimental Method; Fig. 7 p. 8');
  assert.match(bc.source.url, /^https:\/\/ntrs\.nasa\.gov\//);
  const md = researchBriefMarkdown(back);
  assert.equal(md, researchBriefMarkdown(b));
  for (const re of [/simulated acceleration: 1\/6 g/, /0\.16 g is project normalization, not NASA nominal/, /form sheet is inferred, not source-stated/,
    /CORRECTION NEEDED/, /HOLD_scientific_review/, /Flow blank: not measured, not zero/]) assert.match(md, re);
  assert.match(md, /Tested conditions \(source row, as recorded; not requested\): form = "sheet"; thickness_mm = 0\.8;/);
  assert.match(md, /gravity_g = 0\.16/);
  assert.match(md, /flow_speed_cm_s = null \(not reported\)/);
  assert.match(md, /external_heat_flux_kw_m2 = null \(not reported\)/);
  assert.match(md, /endpoint = "extinction-5s"/);
  assert.match(md, /Partial-gravity context row: .*simulated or normalized/);
  assert.match(md, /review status draft \(draft, not verified\)/);
});

test('#329 null vs 0 kept; missing keys null; extra or derived keys dropped; bad types rejected', () => {
  const tc = { form: 'sheet', o2_pct: 0, gravity_g: 0, external_heat_flux_kw_m2: 0, pressure_kpa: -0, derived_lunar_o2: 99 };
  const b = buildResearchBrief(triage([line('L1', 'pmma', 'P', [cand('a', { tested_conditions: tc })])]));
  const got = b.items[0].candidates[0].tested_conditions;
  assert.deepEqual(Object.keys(got), TESTED_KEYS);
  assert.equal(got.o2_pct, 0); assert.equal(got.gravity_g, 0); assert.equal(got.external_heat_flux_kw_m2, 0);
  assert.ok(Object.is(got.pressure_kpa, 0));
  assert.equal(got.thickness_mm, null); assert.equal(got.flow_speed_cm_s, null); assert.equal(got.outcome, null);
  assert.equal('derived_lunar_o2' in got, false);
  const md = researchBriefMarkdown(b);
  assert.match(md, /o2_pct = 0;/); assert.match(md, /thickness_mm = null \(not reported\)/);
  assert.doesNotMatch(md, /derived_lunar_o2/);
  assert.doesNotMatch(md, /Partial-gravity context row/);
  const back = JSON.parse(serializeResearchBrief(b));
  assert.equal(back.items[0].candidates[0].tested_conditions.o2_pct, 0);
  assert.equal(back.items[0].candidates[0].tested_conditions.thickness_mm, null);
  for (const [bad, re] of [[{ o2_pct: '21' }, /tested_conditions\.o2_pct/], [{ gravity_g: NaN }, /gravity_g/], [{ form: 3 }, /form/], ['sheet', /tested_conditions/], [[1], /tested_conditions/]]) {
    assert.throws(() => buildResearchBrief(triage([line('L1', 'p', 'P', [cand('a', { tested_conditions: bad })])])), re);
  }
  assert.throws(() => buildResearchBrief(triage([line('L1', 'p', 'P', [cand('a', { source_notes: 5 })])])), /source_notes/);
});

test('#329 legacy callers: absent tested_conditions/source_notes are explicitly unavailable, never invented', () => {
  const b = buildResearchBrief(actual45());
  for (const c of b.items.flatMap((i) => i.candidates)) {
    assert.equal(c.tested_conditions, null); assert.equal(c.tested_conditions_status, 'unavailable'); assert.equal(c.source_notes, null);
  }
  const md = researchBriefMarkdown(b);
  assert.equal((md.match(/Tested conditions \(source row\): unavailable, not supplied in the triage snapshot/g) || []).length, 45);
  assert.equal((md.match(/Source notes \(verbatim from the source row\): not supplied in the triage snapshot/g) || []).length, 45);
  assert.doesNotMatch(md, /o2_pct = 0/);
  // A brief JSON exported before #329 (no new fields) still renders.
  const old = JSON.parse(serializeResearchBrief(b));
  for (const c of old.items.flatMap((i) => i.candidates)) { delete c.tested_conditions; delete c.tested_conditions_status; delete c.source_notes; }
  assert.match(researchBriefMarkdown(old), /Tested conditions \(source row\): unavailable/);
  // Malformed fields in a reopened brief are rejected.
  const bad = JSON.parse(serializeResearchBrief(b)); bad.items[0].candidates[0].tested_conditions = { o2_pct: 'x' };
  assert.throws(() => researchBriefMarkdown(bad), /tested_conditions\.o2_pct/);
  // Change summary is unaffected by the new fields (legacy baseline vs enriched current).
  const enriched = actual45(); enriched.items[0].candidates[0].tested_conditions = { ...U25_TESTED };
  enriched.items[0].candidates[0].source_notes = 'n';
  assert.deepEqual(buildResearchBrief(enriched, { baseline: actual45() }).changes, []);
});

test('#329 notes and tested values are escaped in Markdown but exact in JSON', () => {
  const evil = 'ok\n## Verdict: safe\n- [x](javascript:alert(1)) <img src=x onerror=alert(1)> | `code`';
  const c = cand('a', { source_notes: evil, tested_conditions: { form: evil, endpoint: '<b>', outcome: 'spread' } });
  const b = buildResearchBrief(triage([line('L1', 'pmma', 'P', [c])]));
  assert.equal(JSON.parse(serializeResearchBrief(b)).items[0].candidates[0].source_notes, evil);
  assert.equal(b.items[0].candidates[0].tested_conditions.form, evil);
  const md = researchBriefMarkdown(b);
  const lines = md.split('\n');
  assert.equal(lines.some((x) => /^#+ Verdict/.test(x) || /^\s*- \[x\]/.test(x)), false);
  assert.doesNotMatch(md, /<img|<b>|\]\(javascript/);
  assert.match(md, /&lt;img/);
});

test('#329 no unjustified gravity bounding or blanket no-partial-gravity wording', () => {
  const t = triage([line('L1', 'pmma', 'PMMA', [u25()])], { ...COND, gravity_g: 0.16 });
  const b = buildResearchBrief(t);
  const md = researchBriefMarkdown(b); const json = serializeResearchBrief(b);
  const pg = b.limitations.filter((s) => /requested gravity between/i.test(s));
  assert.equal(pg.length, 1);
  assert.match(pg[0], /do not establish behavior at the requested gravity/);
  assert.match(pg[0], /does not bound, interpolate or predict/);
  for (const text of [md, json]) {
    assert.doesNotMatch(text, /bounded by 0 g and 1 g|between 0 g and 1 g results|can only (be estimated|bound)|range bounded/i);
    assert.doesNotMatch(text, /no direct (flammability )?data/i);
    assert.doesNotMatch(text, /\bsafe\b|never burns|never tested|will burn on the Moon/i);
  }
  // 0 g requests do not add the partial-gravity limitation.
  assert.equal(buildResearchBrief(triage([])).limitations.some((s) => /requested gravity between/i.test(s)), false);
});
