// #321 evidence triage (B1 takeover). Research-review readiness only: never a burn prediction,
// certification or safety output. Synthetic rows below are labelled test fixtures, not NASA data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildEvidenceTriage, TRIAGE_FIELDS } from '../src/rules/evidence-triage.js';

const actual = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const COND = { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16, external_heat_flux_kw_m2: null };
const ROVER = [
  { material_id: 'pmma', form: 'sheet', thickness_mm: null, width_mm: null, name: 'Window / display panel' },
  { material_id: 'cotton', form: 'fabric', thickness_mm: null, width_mm: null, name: 'Crew clothing' },
  { material_id: 'p213', form: 'tape', thickness_mm: null, width_mm: null, name: 'Hardware tape' },
  { material_id: 'nomex', form: 'fabric', thickness_mm: null, width_mm: null, name: 'Seat cover' },
];
const deepFreeze = (o) => { if (o && typeof o === 'object') { Object.freeze(o); Object.values(o).forEach(deepFreeze); } return o; };

// Labelled synthetic positive: a verified row whose every stated condition equals the request.
const SYN = {
  evidence_id: 'SYN-1', material: 'acrylic', material_id: 'pmma', form: 'sheet', thickness_mm: 0.2, width_mm: 20,
  flow_speed_cm_s: 10, flow_direction: 'opposed', o2_pct: 21, pressure_kpa: 101.3, gravity_g: 0, facility: 'ISS',
  endpoint: 'LOC-FS', external_heat_flux_kw_m2: 0, uncertainty: 'stated in synthetic table', review_status: 'verified',
  source_key: 'SYNKEY', source_locator: 'Synthetic table 1, row 1',
};
const synData = (rows) => ({ sources: { SYNKEY: { title: 'Synthetic test source (fixture)', url: 'https://ntrs.nasa.gov/synthetic.pdf' } }, materials: [{ material_id: 'pmma', display_name: 'PMMA (acrylic)', aliases: ['acrylic'] }], evidence: rows });
const synQuery = (over = {}, mat = {}) => ({
  conditions: { o2_pct: 21, pressure_kpa: 101.3, flow_speed_cm_s: 10, flow_direction: 'opposed', gravity_g: 0, external_heat_flux_kw_m2: 0, ...over },
  materials: [{ material_id: 'pmma', form: 'sheet', thickness_mm: 0.2, width_mm: 20, ...mat }],
});

test('contract shape on the actual dataset; all 45 drafts stay not review-ready', () => {
  const t = buildEvidenceTriage({ conditions: COND, materials: ROVER }, actual);
  assert.equal(t.version, 1);
  assert.deepEqual(Object.keys(t).sort(), ['conditions', 'items', 'limitations', 'summary', 'version']);
  assert.equal(t.items.length, 4);
  assert.deepEqual(t.items.map((i) => i.line_id), ['line-1', 'line-2', 'line-3', 'line-4']);
  assert.equal(t.summary.review_ready_count, 0);
  assert.equal(t.summary.verified_count, 0);
  for (const it of t.items) {
    assert.equal(it.status, 'REVIEW_REQUIRED');
    for (const c of it.candidates) {
      assert.deepEqual(Object.keys(c).sort(), ['conflicts', 'evidence_id', 'grade', 'missing_fields', 'review_ready', 'review_status', 'rules', 'source', 'source_notes', 'tested_conditions']);
      assert.equal(c.review_ready, false);
      assert.equal(c.review_status, 'draft');
      assert.ok(['OK', 'FLAG', 'INVALID'].includes(c.grade));
      assert.equal(typeof c.source.title, 'string'); assert.ok(c.source.title.length > 0, c.evidence_id);
      assert.match(c.source.url, /^https:\/\//, c.evidence_id);
      assert.ok(c.source.locator, c.evidence_id);
      for (const r of c.rules) assert.equal(typeof r.why, 'string');
    }
    assert.ok(it.next_actions.some((a) => a.kind === 'request_human_source_check'));
  }
  // All 45 draft rows across a BOM that names every catalogued material.
  const all = buildEvidenceTriage({ conditions: COND, materials: actual.materials.map((m) => ({ material_id: m.material_id })) }, actual);
  assert.equal(all.summary.candidate_count, 45);
  assert.equal(all.summary.review_ready_count, 0);
});

test('source URL and locator retained from the cited observation', () => {
  const t = buildEvidenceTriage({ conditions: COND, materials: [ROVER[0]] }, actual);
  const b1 = t.items[0].candidates.find((c) => c.evidence_id === 'PSI25-B1');
  const row = actual.evidence.find((r) => r.evidence_id === 'PSI25-B1');
  assert.equal(b1.source.url, row.observation_source_url);
  assert.equal(b1.source.locator, row.observation_source_locator);
  assert.equal(b1.source.title, row.observation_source_title);
});

test('unknown material is an explicit NO_CANDIDATES research task; duplicates preserved; no aliasing', () => {
  const t = buildEvidenceTriage({ conditions: COND, materials: [ROVER[0], { material_id: 'acrylic' }, ROVER[0]] }, actual);
  assert.deepEqual(t.items.map((i) => [i.line_id, i.status]), [['line-1', 'REVIEW_REQUIRED'], ['line-2', 'NO_CANDIDATES'], ['line-3', 'REVIEW_REQUIRED']]);
  assert.equal(t.items[1].candidates.length, 0);
  assert.equal(t.items[1].next_actions[0].kind, 'search_sources');
  assert.doesNotMatch(t.items[1].next_actions[0].message, /never tested|safe/i);
  assert.equal(t.summary.candidate_count, t.items[0].candidates.length * 2, 'counts per candidate occurrence across lines');
  assert.ok(t.limitations.some((l) => /per candidate occurrence/.test(l)));
});

test('missing pressure and heat flux stay unknown, never zero', () => {
  const t = buildEvidenceTriage(synQuery({ pressure_kpa: null, external_heat_flux_kw_m2: null }), synData([SYN]));
  const c = t.items[0].candidates[0];
  assert.ok(c.missing_fields.includes('request.pressure_kpa'));
  assert.ok(c.missing_fields.includes('request.external_heat_flux_kw_m2'));
  assert.equal(t.conditions.external_heat_flux_kw_m2, null);
  assert.equal(t.items[0].request.pressure_kpa, null);
  assert.equal(c.review_ready, false);
  assert.ok(t.items[0].next_actions.some((a) => a.kind === 'supply_query_field' && a.field === 'pressure_kpa'));
  const noSource = buildEvidenceTriage(synQuery(), synData([{ ...SYN, external_heat_flux_kw_m2: null }]));
  assert.ok(noSource.items[0].candidates[0].missing_fields.includes('source.external_heat_flux_kw_m2'));
  assert.equal(noSource.items[0].candidates[0].review_ready, false);
});

test('labelled synthetic verified positive reaches REVIEW_READY; each single mismatch removes it with the right reason', () => {
  const ok = buildEvidenceTriage(synQuery(), synData([SYN]));
  assert.equal(ok.items[0].status, 'REVIEW_READY');
  assert.equal(ok.items[0].candidates[0].review_ready, true);
  assert.deepEqual(ok.items[0].candidates[0].missing_fields, []);
  assert.deepEqual(ok.items[0].candidates[0].conflicts, []);
  assert.equal(ok.summary.review_ready_count, 1);
  const cases = [
    [synQuery({ o2_pct: 34 }), 'o2_pct'], [synQuery({ gravity_g: 0.16 }), 'gravity_g'], [synQuery({ pressure_kpa: 56.5 }), 'pressure_kpa'],
    [synQuery({ flow_direction: 'concurrent' }), 'flow_direction'], [synQuery({ flow_speed_cm_s: 20 }), 'flow_speed_cm_s'],
    [synQuery({}, { form: 'fabric' }), 'form'], [synQuery({}, { thickness_mm: 1 }), 'thickness_mm'], [synQuery({}, { width_mm: 50 }), 'width_mm'],
    [synQuery({ external_heat_flux_kw_m2: 10 }), 'external_heat_flux_kw_m2'],
  ];
  for (const [q, field] of cases) {
    const c = buildEvidenceTriage(q, synData([SYN])).items[0].candidates[0];
    assert.equal(c.review_ready, false, field);
    assert.ok(c.conflicts.includes(field), `${field}: ${c.conflicts}`);
  }
  const g = buildEvidenceTriage(synQuery({ gravity_g: 0.16 }), synData([SYN])).items[0].next_actions;
  assert.ok(g.some((a) => a.kind === 'investigate_gravity_mismatch' && a.evidence_ids.includes('SYN-1')));
  const draft = buildEvidenceTriage(synQuery(), synData([{ ...SYN, review_status: 'draft' }])).items[0];
  assert.equal(draft.status, 'REVIEW_REQUIRED');
  const endpoint = buildEvidenceTriage(synQuery(), synData([{ ...SYN, endpoint: 'ignition' }])).items[0].candidates[0];
  assert.ok(endpoint.conflicts.includes('endpoint'));
  const noEndpoint = buildEvidenceTriage(synQuery(), synData([{ ...SYN, endpoint: null }])).items[0].candidates[0];
  assert.ok(noEndpoint.missing_fields.includes('source.endpoint'));
});

test('rod/wire width is not applicable, not missing', () => {
  const rod = { ...SYN, form: 'rod', width_mm: null };
  const c = buildEvidenceTriage(synQuery({}, { form: 'rod', width_mm: null }), synData([rod])).items[0].candidates[0];
  assert.ok(!c.missing_fields.some((f) => f.endsWith('width_mm')));
  assert.equal(c.review_ready, true);
});

test('next actions are research steps, never swaps, operating advice or risk scores', () => {
  const t = buildEvidenceTriage({ conditions: COND, materials: [...ROVER, { material_id: 'mystery' }] }, actual);
  const text = JSON.stringify(t.items.flatMap((i) => i.next_actions));
  assert.doesNotMatch(text, /\bsafe\b|safer|swap|replace|use instead|risk score|lower the oxygen|emergency|never tested|certif/i);
  for (const it of t.items) for (const a of it.next_actions) {
    assert.ok(['supply_query_field', 'investigate_gravity_mismatch', 'inspect_source_condition', 'request_human_source_check', 'search_sources'].includes(a.kind));
    assert.ok(a.field === null || TRIAGE_FIELDS.includes(a.field), a.field);
    assert.ok(Array.isArray(a.evidence_ids));
  }
});

test('inputs are never mutated; output is deterministic', () => {
  const q = deepFreeze({ conditions: { ...COND }, materials: ROVER.map((m) => ({ ...m })) });
  const data = deepFreeze(structuredClone(actual));
  const a = buildEvidenceTriage(q, data);
  const b = buildEvidenceTriage(q, data);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  a.items[0].request.o2_pct = 99;
  assert.equal(buildEvidenceTriage(q, data).items[0].request.o2_pct, 34);
});

test('malformed boundaries fail clearly; empty BOM and unavailable dataset are distinct', () => {
  assert.throws(() => buildEvidenceTriage(null, actual), TypeError);
  assert.throws(() => buildEvidenceTriage({ conditions: COND }, actual), /materials/);
  assert.throws(() => buildEvidenceTriage({ conditions: { ...COND, o2_pct: 'lots' }, materials: [] }, actual), /o2_pct/);
  assert.throws(() => buildEvidenceTriage({ conditions: { ...COND, pressure_kpa: Infinity }, materials: [] }, actual), /pressure_kpa/);
  assert.throws(() => buildEvidenceTriage({ conditions: { ...COND, pressure_kpa: NaN }, materials: [] }, actual), /pressure_kpa/);
  assert.throws(() => buildEvidenceTriage({ conditions: { ...COND, flow_direction: 3 }, materials: [] }, actual), /flow_direction/);
  assert.throws(() => buildEvidenceTriage({ conditions: COND, materials: [{ material_id: '' }] }, actual), /material_id/);
  assert.throws(() => buildEvidenceTriage({ conditions: COND, materials: [{ material_id: 'pmma', thickness_mm: -1 }] }, actual), /thickness_mm/);
  assert.throws(() => buildEvidenceTriage({ conditions: COND, materials: [{ material_id: 'pmma', name: 5 }] }, actual), /name/);
  assert.throws(() => buildEvidenceTriage({ conditions: COND, materials: [] }, null), /unavailable/);
  assert.throws(() => buildEvidenceTriage({ conditions: COND, materials: [] }, { evidence: 'x' }), /unavailable/);
  const empty = buildEvidenceTriage({ conditions: COND, materials: [] }, actual);
  assert.equal(empty.items.length, 0);
  assert.ok(empty.limitations.some((l) => /No BOM lines/.test(l)));
  const noRows = buildEvidenceTriage({ conditions: COND, materials: [ROVER[0]] }, { evidence: [] });
  assert.equal(noRows.items[0].status, 'NO_CANDIDATES');
  assert.ok(noRows.limitations.some((l) => /0 evidence rows/.test(l)));
  // Missing conditions normalise to unknown (null), never to 0.
  const partial = buildEvidenceTriage({ conditions: {}, materials: [ROVER[0]] }, actual);
  assert.deepEqual(Object.values(partial.conditions), [null, null, null, null, null, null]);
});

test('tested_conditions are exact dataset values (null unknown, 0 kept) and source_notes keep provenance caveats', () => {
  const t = buildEvidenceTriage({ conditions: COND, materials: [ROVER[0]] }, actual);
  const u = t.items[0].candidates.find((c) => c.evidence_id === 'U25-01-L');
  const row = actual.evidence.find((r) => r.evidence_id === 'U25-01-L');
  assert.equal(u.tested_conditions.gravity_g, row.gravity_g);
  assert.equal(u.tested_conditions.flow_speed_cm_s, null, 'blank flow stays null, not 0');
  assert.equal(u.tested_conditions.external_heat_flux_kw_m2, null);
  assert.equal(u.tested_conditions.endpoint, row.endpoint);
  assert.ok('outcome' in u.tested_conditions);
  assert.match(u.source_notes, /1\/6 g; 0\.16 g is project normalization/);
  assert.match(u.source_notes, /form sheet is inferred/);
  assert.match(u.source_notes, /CORRECTION NEEDED/);
  assert.match(u.source_notes, /Research status: HOLD_scientific_review/);
  assert.match(u.source_notes, /Gravity context: simulated lunar acceleration in centrifuge/);
  const b1 = t.items[0].candidates.find((c) => c.evidence_id === 'PSI25-B1');
  assert.equal(b1.tested_conditions.gravity_g, 0, '0 g stays 0');
  const syn = buildEvidenceTriage(synQuery(), synData([SYN])).items[0].candidates[0];
  assert.equal(syn.source_notes, null);
  assert.equal(syn.tested_conditions.external_heat_flux_kw_m2, 0);
});

test('gravity next action never bounds, interpolates or predicts partial-gravity behaviour', () => {
  for (const g of [0.16, 0.38, 1, 0]) {
    const t = buildEvidenceTriage({ conditions: { ...COND, gravity_g: g }, materials: ROVER }, actual);
    for (const a of t.items.flatMap((i) => i.next_actions).filter((x) => x.kind === 'investigate_gravity_mismatch')) {
      assert.doesNotMatch(a.message, /bound|bracket|interpolat|extrapolat|predict|between 0 g and 1 g|no direct (lunar|partial)/i, a.message);
      assert.match(a.message, /context only/);
    }
  }
  assert.doesNotMatch(JSON.stringify(buildEvidenceTriage({ conditions: COND, materials: ROVER }, actual).limitations), /bounds? (it|by|between)|bracket|between 0 g and 1 g/i);
});
