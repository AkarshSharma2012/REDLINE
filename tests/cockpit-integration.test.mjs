// #323 integration: real index.html markup, real cabin form and main.js wiring drive the
// review cockpit. Triage is a contract-shaped recorder (A2 #321 owns the real engine).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { wireCabin, loadReviewEngines, reviewTriage } from '../src/main.js';
import { mountReviewCockpit } from '../src/ui/review-cockpit.js';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('data/evidence.json', root), 'utf8'));
const html = (await readFile(new URL('index.html', root), 'utf8')).replace(/<script\b[\s\S]*?<\/script>/g, '');

function recorder() {
  const calls = [];
  const build = (query, dataset) => {
    calls.push(structuredClone(query));
    const items = query.materials.map((m, i) => ({ line_id: `line-${i + 1}`, material_id: m.material_id, name: m.name ?? m.material_id,
      request: { ...query.conditions, ...m }, status: 'NO_CANDIDATES', candidates: [], next_actions: [] }));
    assert.equal(dataset, evidence, 'triage receives the full loaded dataset, drafts included');
    return { version: 1, conditions: { ...query.conditions }, items,
      summary: { line_count: items.length, candidate_count: 0, verified_count: 0, review_ready_count: 0 }, limitations: [] };
  };
  return { calls, build };
}

function setup(buildTriage) {
  const w = new JSDOM(html, { pretendToBeVisual: true }).window;
  const d = w.document;
  globalThis.Event = w.Event; // main.js dispatches with the page realm's Event
  const brief = { buildResearchBrief: (t) => ({ title: 'b', t }), researchBriefMarkdown: () => '# b', serializeResearchBrief: () => '{}' };
  const cockpit = mountReviewCockpit(d.getElementById('review-cockpit'), { brief, onLoadScenario: () => d.getElementById('rover-demo').click() });
  wireCabin(evidence, { document: d, cockpit, buildTriage });
  return { w, d, cockpit };
}
const input = (w, el, value) => { el.value = value; el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };

test('scenario load -> one cockpit line per BOM row; condition edits rebuild the analysis', () => {
  const r = recorder();
  const { w, d } = setup(r.build);
  d.getElementById('cockpit-load').click();
  assert.equal(d.querySelectorAll('.cockpit-line').length, 4);
  const last = r.calls.at(-1);
  assert.deepEqual(last.materials.map((m) => m.name), ['Window / display panel', 'Crew clothing', 'Hardware tape', 'Seat cover']);
  assert.equal(last.materials[0].thickness_mm, null, 'unspecified thickness stays null, not 0');
  assert.equal(last.conditions.external_heat_flux_kw_m2, null, 'unknown heat flux stays null, not 0');
  assert.equal(last.conditions.gravity_g, 0.16);
  input(w, d.querySelector('#cabin-form [name="gravity"]'), '1');
  assert.equal(r.calls.at(-1).conditions.gravity_g, 1);
  assert.match(d.getElementById('cockpit-summary').textContent, /4 lines · 0 candidate records · 0 verified · 0 review-ready/);
});

test('invalid input clears stale analysis and disables export; fixing it restores', () => {
  const r = recorder();
  const { w, d } = setup(r.build);
  d.getElementById('cockpit-load').click();
  d.getElementById('cockpit-pin').click();
  const pressure = d.querySelector('#cabin-form [name="pressure"]');
  input(w, pressure, '');
  assert.equal(d.querySelectorAll('.cockpit-line').length, 0);
  assert.equal(d.getElementById('cockpit-md').disabled, true);
  assert.match(d.getElementById('cockpit-summary').textContent, /previous analysis and brief were cleared/);
  input(w, pressure, '70.3');
  assert.equal(d.querySelectorAll('.cockpit-line').length, 4);
  assert.equal(r.calls.at(-1).conditions.pressure_kpa, 70.3);
  assert.equal(d.getElementById('cockpit-md').disabled, false);
});

test('duplicate BOM lines stay separate lines', () => {
  const r = recorder();
  const { d } = setup(r.build);
  d.getElementById('cockpit-load').click();
  const add = [...d.querySelectorAll('#cabin-form button')].find((b) => b.textContent === 'Add material');
  add.click();
  const selects = d.querySelectorAll('#cabin-form select[name$="-material"]');
  const sel = selects[selects.length - 1];
  sel.value = 'pmma'; sel.dispatchEvent(new d.defaultView.Event('change', { bubbles: true }));
  assert.equal(d.querySelectorAll('.cockpit-line').length, 5);
  assert.deepEqual(r.calls.at(-1).materials.filter((m) => m.material_id === 'pmma').length, 2);
});

test('triage failure or missing module never leaves a stale or empty-success review', async () => {
  const { d } = setup(() => { throw new TypeError('dataset unavailable'); });
  d.getElementById('cockpit-load').click();
  assert.match(d.getElementById('cockpit-summary').textContent, /Evidence review unavailable \(dataset unavailable\)/);
  assert.equal(d.querySelectorAll('.cockpit-line').length, 0);
  const missing = setup(null);
  missing.d.getElementById('cockpit-load').click();
  assert.match(missing.d.getElementById('cockpit-summary').textContent, /triage module unavailable/);
  const engines = await loadReviewEngines(async () => { throw new Error('404'); });
  assert.deepEqual(engines, { buildTriage: null, brief: null });
  assert.throws(() => reviewTriage({ conditions: {}, materials: [] }, evidence, null), /unavailable/);
});

test('real pipeline: actual dataset -> triage -> brief with baseline -> Markdown and JSON round trip', async () => {
  const { buildEvidenceTriage } = await import('../src/rules/evidence-triage.js');
  const { buildResearchBrief, researchBriefMarkdown, serializeResearchBrief } = await import('../src/rules/research-brief.js');
  const conditions = { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0, external_heat_flux_kw_m2: null };
  const materials = [{ material_id: 'pmma', form: 'sheet', thickness_mm: null, width_mm: null, name: 'Window / display panel' },
    { material_id: 'pmma', form: 'sheet', thickness_mm: null, width_mm: null, name: 'Window / display panel' },
    { material_id: 'mystery', form: null, thickness_mm: null, width_mm: null, name: 'Unlisted gasket' }];
  const base = buildEvidenceTriage({ conditions, materials }, evidence);
  const cur = buildEvidenceTriage({ conditions: { ...conditions, gravity_g: 0.16 }, materials }, evidence);
  const brief = buildResearchBrief(cur, { scenarioName: 'Lunar rover (illustrative)', baseline: base });
  assert.equal(brief.summary.review_ready_count, 0);
  assert.equal(brief.summary.draft_count, brief.summary.candidate_count);
  assert.deepEqual(brief.items.map((i) => i.status), ['REVIEW_REQUIRED', 'REVIEW_REQUIRED', 'NO_CANDIDATES']);
  assert.ok(brief.changes.some((c) => c.field === 'conditions.gravity_g' && c.before === 0 && c.after === 0.16));
  const md = researchBriefMarkdown(brief);
  assert.match(md, /Not a safety assessment, recommendation, certification or prediction/);
  assert.match(md, /PSI25-B1/);
  assert.match(md, /Investigate the gravity mismatch/);
  const json = serializeResearchBrief(brief);
  assert.equal(researchBriefMarkdown(JSON.parse(json)), md, 'reopened JSON renders the same brief');
});
