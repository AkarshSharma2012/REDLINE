// B6 (#56): R8 §5 naive lookup, the leave-one-source-out runner and the accuracy screen.
// Fixture rows are S4 §7.1 published values marked fixture-only; they test code, not REDLINE.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { baselineLabel, normalizeBaselineName } from '../src/rules/baseline.js';
import {
  linkGroups, removeGroup, assertNoLeak, splitGroups, runEvaluation, toCsv,
} from '../scripts/eval-holdout.mjs';
import {
  scoreAnswer, wilson, exactOneSided, summarizeResults, parseCsv, accuracyViewHtml,
} from '../src/ui/accuracy-view.js';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(readFileSync(new URL('tests/fixtures/holdout-evidence.json', root), 'utf8'));
const queries = parseCsv(readFileSync(new URL('tests/fixtures/holdout-queries.csv', root), 'utf8'));
const rows = evidence.evidence;
const q = (over) => ({ display_name: 'PMMA (acrylic)', material_id: 'pmma', form: 'rod', o2_pct: 21, gravity_g: 0, ...over });

// --- baselineLabel (R8 §5) -----------------------------------------------------------------

test('normalizeBaselineName follows R8 §5 step 1 literally', () => {
  assert.equal(normalizeBaselineName('100 micron PMMA film 2 cm wide'), 'pmma');
  assert.equal(normalizeBaselineName('PMMA, cast black'), 'pmma');
  assert.equal(normalizeBaselineName('PMMA (acrylic)'), 'pmma');
  assert.equal(normalizeBaselineName('SIBAL, 75% cotton / 25% fiberglass'), 'sibal');
  assert.equal(normalizeBaselineName('ETFE insulation on copper'), 'etfe insulation on copper');
  assert.notEqual(normalizeBaselineName('Teflon'), normalizeBaselineName('PTFE')); // no synonyms
});

test('S4 §7.4 B1: sheet query matches rod rows by name and reads BURNED from UG-17', () => {
  const r = baselineLabel(q({ form: 'sheet', thickness_mm: 0.2, width_mm: 10 }), rows);
  assert.deepEqual([r.label, r.reason, r.cited], ['BURNED', null, ['LINK2018-UG-17']]);
});

test('S4 §7.4 B2: "ETFE" does not match "ETFE insulation on copper"', () => {
  const r = baselineLabel({ display_name: 'ETFE', o2_pct: 34, external_heat_flux_kw_m2: 25 }, rows);
  assert.deepEqual([r.label, r.reason, r.cited], ['NOT_ESTABLISHED', 'NE-no-data', []]);
});

test('NEAR band is b - 1 <= O2 < b; below it is NE-no-burn citing the row that set b', () => {
  assert.equal(baselineLabel(q({ o2_pct: 16 }), rows).label, 'NEAR');
  assert.equal(baselineLabel(q({ o2_pct: 16.9 }), rows).label, 'NEAR');
  const low = baselineLabel(q({ o2_pct: 15.9 }), rows);
  assert.deepEqual([low.label, low.reason, low.cited], ['NOT_ESTABLISHED', 'NE-no-burn', ['LINK2018-UG-17']]);
});

test('limit endpoints set b from their value; quench limits and no-spread rows do not', () => {
  const etfe = { display_name: 'ETFE insulation on copper' };
  const r = baselineLabel({ ...etfe, o2_pct: 26 }, rows);
  assert.deepEqual([r.label, r.cited], ['BURNED', ['OSORIO2014-ETFE-UG']]);
  const sibal = baselineLabel({ display_name: 'SIBAL', o2_pct: 40 }, rows);
  assert.deepEqual([sibal.label, sibal.reason, sibal.cited], ['NOT_ESTABLISHED', 'NE-no-burn', ['ZHAO2015-SIBAL-T4']]);
});

test('baseline ignores every condition and never returns NE-incompatible', () => {
  const variants = [{ gravity_g: 1 }, { flow_direction: 'concurrent' }, { external_heat_flux_kw_m2: 50 }, { pressure_kpa: 10 }];
  const base = baselineLabel(q({}), rows);
  for (const v of variants) assert.deepEqual(baselineLabel(q(v), rows), base);
  for (const o2 of [0, 10, 16.5, 17, 50]) assert.notEqual(baselineLabel(q({ o2_pct: o2 }), rows).reason, 'NE-incompatible');
  assert.deepEqual(baselineLabel(q({}), rows), baselineLabel(q({}), rows)); // pure
});

// --- holdout runner (R8 §2) ----------------------------------------------------------------

test('fixture has three source groups; removing one leaves no linked row', () => {
  const groupOf = linkGroups(rows);
  assert.deepEqual([...new Set(groupOf.values())].sort(), ['Link2018', 'Osorio2014', 'Zhao2015']);
  const kept = removeGroup(rows, groupOf, 'Link2018');
  assert.equal(kept.length, 3);
  assert.doesNotThrow(() => assertNoLeak(kept, rows.filter((r) => r.source_key === 'Link2018')));
});

test('one run reported by two sources, or one reused sample, is never split across sides', () => {
  const base = { review_status: 'verified', holdout_group: '' };
  const linked = [
    { ...base, evidence_id: 'a', source_key: 'BASS2TM', investigation: 'PSI-25', run_id: 'T4', pi: 'X' },
    { ...base, evidence_id: 'b', source_key: 'Zhao2015', investigation: 'PSI-25', run_id: 'T4', pi: 'X' },
    { ...base, evidence_id: 'c', source_key: 'Other', investigation: 'PSI-25', run_id: 'B14', sample_id: 'S1' },
    { ...base, evidence_id: 'd', source_key: 'Other2', investigation: 'PSI-25', run_id: 'B21', sample_id: 'S1' },
    { ...base, evidence_id: 'e', source_key: 'Lonely' },
  ];
  const g = linkGroups(linked);
  assert.equal(g.get('a'), g.get('b'));
  assert.equal(g.get('a'), 'BASS2TM+Zhao2015');
  assert.equal(g.get('c'), g.get('d'));
  assert.notEqual(g.get('e'), g.get('a'));
});

test('K7: the leakage check catches an injected leak', () => {
  const groupOf = linkGroups(rows);
  const heldOut = rows.filter((r) => groupOf.get(r.evidence_id) === 'Osorio2014');
  const leaked = [...removeGroup(rows, groupOf, 'Osorio2014'), { ...heldOut[0], evidence_id: 'COPY-WITH-NEW-ID' }];
  assert.throws(() => assertNoLeak(leaked, heldOut), /K7 leak/);

  const leakyRetain = (all, gOf, group) => [...removeGroup(all, gOf, group), all.find((r) => gOf.get(r.evidence_id) === group)];
  const out = runEvaluation({ evidence, queries, seed: 1, retain: leakyRetain, meta: { evidence_kind: 'real' } });
  assert.ok(out.filter((r) => r.query_type === 'answerable').every((r) => r.leak_check === 'fail'));
  assert.equal(summarizeResults(out).status, 'invalid');
});

test('dev/test split is seeded, deterministic and about 30% dev', () => {
  const groups = Array.from({ length: 10 }, (_, i) => `G${i}`);
  const a = splitGroups(groups, 42);
  assert.deepEqual([...a.dev], [...splitGroups(groups, 42).dev]);
  assert.equal(a.dev.size, 3);
  assert.equal(a.dev.size + a.test.size, 10);
});

test('runEvaluation writes R8 §8 rows; held-out source is absent when its queries are asked', () => {
  const seen = [];
  const spy = (query, retained) => { seen.push([query.material_id, retained.map((r) => r.source_key)]); return baselineLabel(query, retained); };
  const out = runEvaluation({ evidence, queries, seed: 3, redline: (qq) => ({ label: 'NOT_ESTABLISHED', reason: 'NE-no-data', cited: [] }), baseline: spy });
  const byId = Object.fromEntries(out.map((r) => [r.query_id, r]));
  assert.equal(out.length, queries.length);
  for (const r of out.filter((x) => x.query_type === 'answerable')) {
    assert.ok(['dev', 'test'].includes(r.split));
    assert.equal(r.leak_check, 'pass');
  }
  // answerable baseline calls never see their own source (LOSO)
  const answerableCalls = seen.slice(0, 5);
  assert.ok(answerableCalls.every(([, srcs], i) => !srcs.includes(['Link2018', 'Link2018', 'Osorio2014', 'Osorio2014', 'Zhao2015'][i])));
  // single-source materials: the naive lookup has nothing left to match
  assert.equal(byId['FX-A1'].baseline_answer, 'NE-no-data');
  // controls use the full table: the naive lookup answers the T13 sheet control
  assert.equal(byId['FX-I1'].baseline_answer, 'BURNED');
  assert.equal(byId['FX-I1'].baseline_score, 'answered-incompatible');
  assert.equal(byId['FX-N1'].baseline_score, 'correct-refusal');
  const csv = toCsv(out);
  assert.match(csv.split('\n')[0], /^query_id,split,holdout_group,query_type,invalid_rule,/);
  assert.deepEqual(parseCsv(csv).map((r) => r.query_id), out.map((r) => r.query_id));
});

test('eval-holdout.mjs CLI writes the CSV and reports synthetic status on the fixture', () => {
  const out = join(mkdtempSync(join(tmpdir(), 'redline-')), 'results.csv');
  const stdout = execFileSync(process.execPath, ['scripts/eval-holdout.mjs', '--seed', '7',
    '--evidence', 'tests/fixtures/holdout-evidence.json', '--queries', 'tests/fixtures/holdout-queries.csv', '--out', out],
  { cwd: new URL('.', root), encoding: 'utf8' });
  assert.match(stdout, /Status: synthetic/);
  const written = parseCsv(readFileSync(out, 'utf8'));
  assert.equal(written.length, 10);
  assert.ok(written.every((r) => r.run_seed === '7' && r.evidence_kind === 'fixture'));
});

// --- scoring and the accuracy screen (R8 §4, screens.md §6) --------------------------------

test('R8 §4.1 score matrix', () => {
  assert.equal(scoreAnswer('answerable', 'burned', 'BURNED'), 'correct');
  assert.equal(scoreAnswer('answerable', 'burned', 'NE-no-burn'), 'under-warning');
  assert.equal(scoreAnswer('answerable', 'burned', 'NEAR'), 'wrong-mild');
  assert.equal(scoreAnswer('answerable', 'no-burn', 'BURNED'), 'over-claim');
  assert.equal(scoreAnswer('answerable', 'near', 'NE-no-burn'), 'wrong-mild');
  assert.equal(scoreAnswer('answerable', 'near', 'NE-incompatible'), 'refusal');
  assert.equal(scoreAnswer('incompatible', '', 'NE-incompatible'), 'correct-refusal');
  assert.equal(scoreAnswer('incompatible', '', 'NE-no-burn'), 'answered-incompatible');
  assert.equal(scoreAnswer('absent', '', 'NE-no-data'), 'correct-refusal');
});

test('Wilson and exact bounds match R8 §6 worked numbers', () => {
  const w = wilson(27, 30);
  assert.ok(Math.abs(w.low - 0.744) < 0.01 && Math.abs(w.high - 0.965) < 0.01);
  assert.ok(Math.abs(exactOneSided(0, 30).value - 0.095) < 0.001);
  assert.ok(Math.abs(exactOneSided(12, 12).value - 0.779) < 0.001);
  assert.equal(wilson(0, 0), null);
});

function realRow(i, over = {}) {
  return {
    query_id: `Q${i}`, split: 'test', holdout_group: `S${i % 5}`, query_type: 'answerable', gravity_g: String(i % 2),
    endpoint: 'LOC-FS', truth: 'burned', truth_source_key: 'Zhao2015', truth_source_locator: 'p. 9',
    adjudicator_1: 'A', adjudicator_2: 'B', redline_answer: 'BURNED', redline_reason_code: '', score: 'correct',
    baseline_answer: 'NE-no-data', baseline_score: 'refusal', C1: 'pass', C2: 'pass', C3: 'pass', C4: 'pass', C5: 'n/a',
    leak_check: 'pass', evidence_kind: 'real', run_seed: '7', ...over,
  };
}

test('screen states: not run, synthetic, descriptive (counts only), failed, completed', () => {
  assert.equal(summarizeResults([]).status, 'not-run');
  assert.match(accuracyViewHtml(summarizeResults([])), /Held-out evaluation not run/);

  const fixture = runEvaluation({ evidence, queries, seed: 7, meta: { evidence_kind: 'fixture' } });
  const syn = accuracyViewHtml(summarizeResults(fixture), { sources: evidence.sources });
  assert.match(syn, /Synthetic checks - not held-out accuracy/);
  assert.doesNotMatch(syn, /\d%;|Wilson 95%:/);
  assert.doesNotMatch(syn, /Download published results/);

  const few = Array.from({ length: 6 }, (_, i) => realRow(i));
  const d = summarizeResults(few);
  assert.equal(d.status, 'descriptive');
  const dh = accuracyViewHtml(d);
  assert.match(dh, /Descriptive only - too few independent tests/);
  assert.match(dh, /6\/6/);
  assert.doesNotMatch(dh, /100\.0%/);

  const controls = [
    ...Array.from({ length: 12 }, (_, i) => realRow(100 + i, { query_type: 'incompatible', truth: '', redline_answer: 'NOT_ESTABLISHED', redline_reason_code: 'NE-incompatible', score: 'correct-refusal', baseline_answer: 'BURNED', baseline_score: 'answered-incompatible' })),
    ...Array.from({ length: 5 }, (_, i) => realRow(200 + i, { query_type: 'absent', truth: '', redline_answer: 'NOT_ESTABLISHED', redline_reason_code: 'NE-no-data', score: 'correct-refusal', baseline_answer: 'NE-no-data', baseline_score: 'correct-refusal' })),
  ];
  const full = [...Array.from({ length: 30 }, (_, i) => realRow(i)), ...controls];
  const c = summarizeResults(full);
  assert.equal(c.status, 'completed');
  assert.match(accuracyViewHtml(c), /30\/30 \(100\.0%; Wilson 95%/);

  const under = full.map((r, i) => (i < 2 ? { ...r, redline_answer: 'NOT_ESTABLISHED', redline_reason_code: 'NE-no-burn', score: 'under-warning' } : r));
  const f = summarizeResults(under);
  assert.equal(f.status, 'failed');
  assert.equal(f.kills.find((k) => k.id === 'K3').state, 'fail');
});

test('screen wording: no banned phrases, truth links to its source, zero denominators explained', () => {
  const fixture = runEvaluation({ evidence, queries, seed: 7, meta: { evidence_kind: 'fixture' } });
  const html = accuracyViewHtml(summarizeResults(fixture), { sources: evidence.sources }).toLowerCase();
  for (const banned of ['safe', 'never tested', 'never burns', 'will burn on the moon', 'nonflammable']) {
    assert.ok(!html.includes(banned), banned);
  }
  assert.ok(html.includes('href="https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf"'));
  assert.ok(html.includes('not defined (0 eligible cases)'));
  assert.ok(html.includes('not found in the sources reviewed'));
});
