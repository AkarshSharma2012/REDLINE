// Accuracy screen (screens.md §6): REDLINE vs the R8 §5 naive name-only lookup on held-out
// observations. Reads research/validation-results.csv (R8 §8) written by scripts/eval-holdout.mjs.
// The scoring helpers below are pure (no DOM) so the eval script and the tests share them.
// Metric arithmetic is computed by REDLINE; only truth and evidence rows link to sources.

import { publishedAccuracyReportUrl } from './accuracy-report-url.js';

export const RESULTS_URL = 'research/validation-results.csv';

// R8 §6 minimums and §7 kill thresholds: project design choices, not NASA requirements.
export const MINIMUMS = Object.freeze({ answerable: 30, groups: 5, incompatible: 12, absent: 5 });
export const KILL = Object.freeze({ underWarning: 0.05, selective: 0.8, coverage: 0.3 });
const Z95 = 1.959964;

// Display text for answers (wording per S4 §6; switch to label.js's table once it exports one).
export const ANSWER_TEXT = Object.freeze({
  BURNED: 'Burned in testing at these conditions',
  NEAR: 'Close to a measured limit',
  'NE-no-burn': 'No burning found in comparable tests at or below this oxygen level in the sources reviewed',
  'NE-incompatible': 'Not established: tests were found, but none is comparable',
  'NE-no-data': 'Not found in the sources reviewed',
});
const ANSWERED = new Set(['BURNED', 'NEAR', 'NE-no-burn']);

// --- pure helpers ------------------------------------------------------------------------

// answerCategory('NOT_ESTABLISHED', 'NE-no-burn') -> 'NE-no-burn'; BURNED/NEAR pass through.
export function answerCategory(label, reason) {
  if (label === 'BURNED' || label === 'NEAR') return label;
  return reason || 'NE-no-data';
}

// R8 §4.1 score matrix for answerable queries; §3.2 for controls.
export function scoreAnswer(queryType, truth, category) {
  if (queryType === 'incompatible') {
    if (category === 'NE-incompatible') return 'correct-refusal';
    return ANSWERED.has(category) ? 'answered-incompatible' : 'wrong-refusal';
  }
  if (queryType === 'absent') return category === 'NE-no-data' ? 'correct-refusal' : 'wrong';
  if (!ANSWERED.has(category)) return 'refusal';
  const expected = { burned: 'BURNED', near: 'NEAR', 'no-burn': 'NE-no-burn' }[truth];
  if (category === expected) return 'correct';
  if (truth === 'burned' && category === 'NE-no-burn') return 'under-warning';
  if (truth !== 'burned' && category === 'BURNED') return 'over-claim';
  return 'wrong-mild';
}

// Wilson 95% interval (NIST e-Handbook §7.2.4.1). Returns null for n = 0.
export function wilson(k, n, z = Z95) {
  if (!n) return null;
  const p = k / n;
  const z2 = z * z;
  const centre = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return { low: Math.max(0, centre - half), high: Math.min(1, centre + half) };
}

// Exact one-sided 95% bound when k = 0 or k = n (R8 §4.3: 1 - 0.05^(1/n)).
export function exactOneSided(k, n) {
  if (!n || (k !== 0 && k !== n)) return null;
  const b = 1 - Math.pow(0.05, 1 / n);
  return k === 0 ? { side: 'upper', value: b } : { side: 'lower', value: 1 - b };
}

const kn = (k, n) => ({ k, n });

function methodMetrics(rows, who) {
  const ans = rows.filter((r) => r.query_type === 'answerable');
  const inc = rows.filter((r) => r.query_type === 'incompatible');
  const abs = rows.filter((r) => r.query_type === 'absent');
  const cat = (r) => (who === 'redline' ? answerCategory(r.redline_answer, r.redline_reason_code) : r.baseline_answer);
  const score = (r) => (who === 'redline' ? r.score : r.baseline_score);
  const answered = ans.filter((r) => ANSWERED.has(cat(r)));
  const outputs = who === 'redline' ? rows.filter((r) => cat(r) !== 'NE-no-data') : [];
  return {
    selective: kn(answered.filter((r) => score(r) === 'correct').length, answered.length),
    coverage: kn(answered.length, ans.length),
    underWarning: kn(answered.filter((r) => score(r) === 'under-warning').length, answered.length),
    correctRefusal: kn(inc.filter((r) => cat(r) === 'NE-incompatible').length, inc.length),
    absent: kn(abs.filter((r) => cat(r) === 'NE-no-data').length, abs.length),
    traceability: who === 'redline'
      ? kn(outputs.filter((r) => ['C1', 'C2', 'C3', 'C4', 'C5'].every((c) => r[c] !== 'fail')).length, outputs.length)
      : null,
  };
}

const rate = (m) => (m.n ? m.k / m.n : null);
const gravityClass = (g) => (Number(g) === 0 ? '0 g' : Number(g) === 1 ? '1 g' : `${g} g`);

function breakdown(rows, keyOf) {
  const out = {};
  for (const r of rows) {
    const key = keyOf(r) || '(not stated)';
    const b = (out[key] ??= { n: 0, redline: kn(0, 0), baseline: kn(0, 0) });
    b.n++;
    if (ANSWERED.has(answerCategory(r.redline_answer, r.redline_reason_code))) {
      b.redline.n++;
      if (r.score === 'correct') b.redline.k++;
    }
    if (ANSWERED.has(r.baseline_answer)) {
      b.baseline.n++;
      if (r.baseline_score === 'correct') b.baseline.k++;
    }
  }
  return out;
}

function matrix(rows, who) {
  const m = {};
  for (const r of rows) {
    const c = who === 'redline' ? answerCategory(r.redline_answer, r.redline_reason_code) : r.baseline_answer;
    const col = ANSWERED.has(c) ? c : 'refusal';
    m[r.truth] ??= { BURNED: 0, NEAR: 0, 'NE-no-burn': 0, refusal: 0 };
    m[r.truth][col]++;
  }
  return m;
}

// summarizeResults(rows) -> everything the screen shows. rows = parsed R8 §8 CSV records.
export function summarizeResults(rows) {
  // Judge click-through (#169): ignore non-record entries; anything unusable reads as "not run".
  rows = (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r === 'object' && !Array.isArray(r));
  if (!rows.length) return { status: 'not-run', rows };
  const first = rows[0];
  const meta = {
    seed: first.run_seed, commit: first.run_commit, built_from: first.evidence_built_from,
    run_at: first.run_at, kind: first.evidence_kind, evaluation: first.evaluation || 'leave-one-source-out',
  };
  const test = rows.filter((r) => r.split === 'test');
  const ans = test.filter((r) => r.query_type === 'answerable');
  const groups = new Set(ans.map((r) => r.holdout_group));
  const gravities = new Set(ans.map((r) => gravityClass(r.gravity_g)));
  const adjudicated = rows.filter((r) => r.query_type === 'answerable' && r.adjudicator_1 && r.adjudicator_2);
  const counts = (t) => test.filter((r) => r.query_type === t).length;
  const minima = [
    { id: 'answerable', text: 'Answerable held-out queries (test split)', need: MINIMUMS.answerable, have: ans.length },
    { id: 'groups', text: 'Independent source groups', need: MINIMUMS.groups, have: groups.size },
    { id: 'gravity', text: 'Gravity classes covered (0 g and 1 g)', need: 2, have: ['0 g', '1 g'].filter((g) => gravities.has(g)).length },
    { id: 'incompatible', text: 'Incompatible controls', need: MINIMUMS.incompatible, have: counts('incompatible') },
    { id: 'absent', text: 'Absent-data controls', need: MINIMUMS.absent, have: counts('absent') },
    { id: 'adjudicated', text: 'Answerable queries double-labelled', need: rows.filter((r) => r.query_type === 'answerable').length, have: adjudicated.length },
  ].map((m) => ({ ...m, met: m.have >= m.need }));
  const minimaMet = minima.every((m) => m.met);

  const redline = methodMetrics(test, 'redline');
  const baseline = methodMetrics(test, 'baseline');
  const gated = (fails) => (minimaMet ? (fails ? 'fail' : 'pass') : 'not-assessed');
  const c1 = test.map((r) => r.C1).filter((v) => v && v !== 'n/a');
  const leaks = rows.filter((r) => r.leak_check === 'fail').length;
  const incAnswered = test.filter((r) => r.query_type === 'incompatible' && r.score === 'answered-incompatible').length;
  const sel = rate(redline.selective);
  const kills = [
    { id: 'K1', text: 'Cited row supports the answer (C1)', count: c1.filter((v) => v === 'fail').length,
      state: c1.includes('fail') ? 'fail' : c1.length && c1.every((v) => v === 'pass') ? 'pass' : 'not-assessed' },
    { id: 'K2', text: 'No incompatible control answered', count: incAnswered,
      state: incAnswered ? 'fail' : redline.correctRefusal.n ? 'pass' : 'not-assessed' },
    { id: 'K3', text: `Under-warning at most ${KILL.underWarning * 100}% of answered`, count: redline.underWarning.k,
      state: gated(rate(redline.underWarning) > KILL.underWarning) },
    { id: 'K4', text: `Selective accuracy at least ${KILL.selective * 100}%`, count: redline.selective.n - redline.selective.k,
      state: gated(sel === null || sel < KILL.selective) },
    { id: 'K5', text: `Coverage at least ${KILL.coverage * 100}% and above the naive lookup`, count: null,
      state: gated(rate(redline.coverage) === null || rate(redline.coverage) < KILL.coverage
        || sel === null || sel <= (rate(baseline.selective) ?? -1)) },
    { id: 'K6', text: 'R8 §6 minimums met', count: minima.filter((m) => !m.met).length, state: minimaMet ? 'pass' : 'fail' },
    { id: 'K7', text: 'No held-out row present while scored', count: leaks, state: leaks ? 'fail' : 'pass' },
  ];

  let status;
  if (leaks) status = 'invalid';
  else if (rows.every((r) => r.evidence_kind === 'fixture')) status = 'synthetic';
  else if (!minimaMet) status = 'descriptive';
  else if (kills.some((k) => k.state === 'fail')) status = 'failed';
  else if (kills.some((k) => k.state === 'not-assessed')) status = 'partial';
  else status = 'completed';

  return {
    status, meta, rows, minima, kills, redline, baseline,
    showRates: status === 'completed' || status === 'failed' || status === 'partial',
    groups: groups.size,
    devQueries: rows.length - test.length,
    breakdown: {
      source: breakdown(ans, (r) => r.holdout_group),
      gravity: breakdown(ans, (r) => gravityClass(r.gravity_g)),
      endpoint: breakdown(ans, (r) => r.endpoint),
    },
    matrix: { redline: matrix(ans, 'redline'), baseline: matrix(ans, 'baseline') },
  };
}

// Minimal RFC 4180 CSV parser (quoted fields, doubled quotes, CRLF). Returns array of objects.
export function parseCsv(text) {
  const records = [];
  let field = '';
  let rec = [];
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { rec.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      rec.push(field); records.push(rec); rec = []; field = '';
    } else field += ch;
  }
  if (field || rec.length) { rec.push(field); records.push(rec); }
  const rows = records.filter((r) => r.some((v) => v !== ''));
  if (!rows.length) return [];
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

// --- rendering -----------------------------------------------------------------------------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => `${(x * 100).toFixed(1)}%`;

const BANNERS = {
  'not-run': ['Held-out evaluation not run', 'No results file was found for this dataset. No scores are shown.'],
  synthetic: ['Synthetic checks - not held-out accuracy', 'These rows come from test fixtures. They check the scoring code, not REDLINE. Counts only.'],
  invalid: ['Invalid run', 'A held-out row was present while its group was scored (K7). No score from this run may be used.'],
  descriptive: ['Descriptive only - too few independent tests', 'R8 §6 minimums are not met, so counts are shown and no accuracy percentage is claimed.'],
  failed: ['Evaluation failed', 'At least one R8 §7 kill criterion failed. The failed checks are listed below.'],
  partial: ['Partial report', 'Some checks are not assessed yet, so this report is not complete.'],
  completed: ['Completed', 'All R8 §6 minimums are met and no R8 §7 kill criterion failed.'],
};

function cell(m, showRates) {
  if (!m) return '<td class="num">--</td>';
  if (!m.n) return '<td class="num">Not defined (0 eligible cases)</td>';
  let text = `${m.k}/${m.n}`;
  if (showRates) {
    const w = wilson(m.k, m.n);
    text += ` (${pct(m.k / m.n)}; Wilson 95%: ${pct(w.low)} to ${pct(w.high)}`;
    const e = exactOneSided(m.k, m.n);
    if (e) text += `; exact one-sided 95% ${e.side} bound ${pct(e.value)}`;
    text += ')';
  }
  return `<td class="num type-data">${esc(text)}</td>`;
}

function sourceLink(key, locator, sources) {
  const src = sources?.[key];
  const where = locator ? `, ${esc(locator)}` : '';
  if (src?.url) return `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title || key)}</a>${where}`;
  return key ? `${esc(key)}${where} <span class="text-3">(link not in this dataset)</span>` : '<span class="text-3">Not stated</span>';
}

function breakdownTable(title, b) {
  const rows = Object.entries(b).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="num">${v.n}</td>`
    + `<td class="num">${v.redline.k}/${v.redline.n}</td><td class="num">${v.baseline.k}/${v.baseline.n}</td></tr>`).join('');
  return `<table><caption class="type-label">By ${esc(title)}</caption><thead><tr><th>${esc(title)}</th>`
    + '<th class="num">Queries</th><th class="num">REDLINE correct/answered</th><th class="num">Naive correct/answered</th></tr></thead>'
    + `<tbody>${rows || '<tr><td colspan="4">No answerable queries</td></tr>'}</tbody></table>`;
}

function matrixTable(title, m) {
  const cols = ['BURNED', 'NEAR', 'NE-no-burn', 'refusal'];
  const rows = Object.entries(m).map(([t, v]) => `<tr><th>${esc(t)}</th>${cols.map((c) => `<td class="num">${v[c]}</td>`).join('')}</tr>`).join('');
  return `<table><caption class="type-label">${esc(title)}: truth (rows) vs answer</caption><thead><tr><th>Truth</th>`
    + `${cols.map((c) => `<th class="num">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows || '<tr><td colspan="5">None</td></tr>'}</tbody></table>`;
}

function conditions(r) {
  const parts = [r.material_id, r.form, r.thickness_mm && `${r.thickness_mm} mm`, r.o2_pct && `${r.o2_pct}% O2`,
    r.pressure_kpa && `${r.pressure_kpa} kPa`, r.flow_speed_cm_s && `${r.flow_speed_cm_s} cm/s`, r.flow_direction,
    r.gravity_g !== '' && r.gravity_g !== undefined && gravityClass(r.gravity_g), r.endpoint];
  return parts.filter(Boolean).map(esc).join(', ');
}

const answerText = (c) => ANSWER_TEXT[c] ?? c;

// accuracyViewHtml(summary, { sources }) -> HTML string. Pure; tested in Node.
export function accuracyViewHtml(summary, { sources = {} } = {}) {
  summary = summary?.status in BANNERS ? summary : { status: 'not-run', rows: [] };
  sources = sources ?? {};
  const [title, detail] = BANNERS[summary.status];
  const head = '<header class="panel"><h2 class="type-heading">Accuracy</h2>'
    + '<button type="button" data-action="back">Back to cabin</button>'
    + '<p class="text-2">REDLINE vs naive name-only lookup on held-out observations. '
    + 'This checks how REDLINE reads published test data; it does not predict lunar-cabin fires.</p>'
    + `<p role="status" class="caveat" data-status="${esc(summary.status)}"><strong>${esc(title)}.</strong> ${esc(detail)}</p></header>`;

  const method = '<section class="panel"><h3 class="type-label">Method</h3><ul class="text-2">'
    + '<li>Primary: leave-one-source-out (R8 §2.3). Each source group is removed from the table before its queries are asked; rows of one run, one reused sample or one cross-reported run always stay on the same side. Leave-one-run-out is reported separately and never pooled.</li>'
    + '<li>Naive baseline (R8 §5, project-designed, not a NASA method): lowercase the name, cut at the first comma or parenthesis, drop digits, units and form words; match on name only; ignore form, thickness, flow, pressure, gravity, heat flux and endpoint; mix endpoints. It never refuses for incompatibility. Both methods get the same evidence and the same removals.</li>'
    + '<li>Queries and truth are frozen and labelled by people before the run; the script never creates truth.</li>'
    + '</ul></section>';
  if (summary.status === 'not-run') {
    return head + method + '<section class="panel"><h3 class="type-label">Needed before scores can be shown</h3><ul class="text-2">'
      + `<li>Verified evidence rows and frozen queries in research/validation-queries.csv</li><li>At least ${MINIMUMS.answerable} answerable held-out queries from ${MINIMUMS.groups} source groups covering 0 g and 1 g; ${MINIMUMS.incompatible} incompatible and ${MINIMUMS.absent} absent-data controls; every truth double-labelled (R8 §6, project policy)</li>`
      + '<li>Run: node scripts/eval-holdout.mjs --seed &lt;n&gt;</li></ul></section>';
  }
  const m = summary.meta;
  const run = `<p class="panel text-3 type-small">Evaluation ${esc(m.evaluation)}; seed ${esc(m.seed ?? "not stated")}; code ${esc(m.commit ?? "not stated")}; evidence ${esc(m.built_from ?? "not stated")}; run ${esc(m.run_at ?? "not stated")}; `
    + `${summary.groups} independent source group(s) in the test split; ${summary.devQueries} dev-split or excluded queries not in the metrics.</p>`;

  const R = summary.redline;
  const B = summary.baseline;
  const show = summary.showRates;
  const metricRows = [
    ['Selective accuracy', 'correct / answered', R.selective, B.selective],
    ['Coverage', 'answered / answerable (refusals stay in the denominator)', R.coverage, B.coverage],
    ['Under-warning', 'said no burning found when the held-out test burned / answered', R.underWarning, B.underWarning],
    ['Correct refusal', 'incompatible controls refused / incompatible controls', R.correctRefusal, B.correctRefusal],
    ['Absent-data controls', '"not found in the sources reviewed" / absent controls (counts only)', R.absent, B.absent],
    ['Traceability', 'outputs with no failed check C1-C5 / outputs checked', R.traceability, B.traceability],
  ].map(([name, def, r, b]) => `<tr><th>${esc(name)}<div class="text-3 type-small">${esc(def)}</div></th>`
    + `${cell(r, show && name !== 'Absent-data controls')}${cell(b, show && name !== 'Absent-data controls')}</tr>`).join('');
  const metrics = '<section class="panel"><h3 class="type-label">Metrics (test split)</h3><div class="table-scroll"><table>'
    + '<thead><tr><th>Metric</th><th class="num">REDLINE k/n</th><th class="num">Naive k/n</th></tr></thead>'
    + `<tbody>${metricRows}</tbody></table></div>`
    + `<p class="text-3 type-small">${show ? 'Intervals: Wilson score, 95% confidence (NIST e-Handbook §7.2.4.1).' : 'Counts only: percentages are withheld until the R8 §6 minimums are met.'} Arithmetic computed by REDLINE from research/validation-results.csv.</p></section>`;

  const minima = '<section class="panel"><h3 class="type-label">Minimum gate (R8 §6, project policy)</h3><ul class="text-2">'
    + summary.minima.map((x) => `<li>${x.met ? 'Met' : 'Not met'}: ${esc(x.text)} ${x.have}/${x.need}</li>`).join('') + '</ul>'
    + '<h3 class="type-label">Checks (R8 §7)</h3><ul class="text-2">'
    + summary.kills.map((k) => `<li data-kill="${k.id}">${k.id} ${esc(k.text)}: ${k.state === 'not-assessed' ? 'not assessed' : k.state}${k.count ? ` (${k.count})` : ''}</li>`).join('')
    + '</ul></section>';

  const bd = summary.breakdown;
  const breakdowns = '<section class="panel"><h3 class="type-label">Breakdown (never one pooled number)</h3><div class="table-scroll">'
    + breakdownTable('source group', bd.source) + breakdownTable('gravity class', bd.gravity) + breakdownTable('endpoint', bd.endpoint)
    + matrixTable('REDLINE', summary.matrix.redline) + matrixTable('Naive lookup', summary.matrix.baseline) + '</div></section>';

  const qrows = summary.rows.map((r) => `<tr data-query="${esc(r.query_id)}"><td>${esc(r.query_id)}<div class="text-3 type-small">${esc(r.holdout_group)}; ${esc(r.query_type)}; ${esc(r.split)}</div></td>`
    + `<td>${conditions(r)}</td>`
    + `<td>${esc(r.truth || r.query_type)}<div class="type-small">${sourceLink(r.truth_source_key, r.truth_source_locator, sources)}</div></td>`
    + `<td>${esc(answerText(answerCategory(r.redline_answer, r.redline_reason_code)))}<div class="text-3 type-small">${esc(r.redline_cited_row)}</div></td>`
    + `<td>${esc(answerText(r.baseline_answer))}<div class="text-3 type-small">${esc(r.baseline_cited_row)}</div></td>`
    + `<td>${esc(r.score)} / ${esc(r.baseline_score)}</td></tr>`).join('');
  const queries = '<section class="panel"><h3 class="type-label">Queries</h3><div class="table-scroll"><table>'
    + '<thead><tr><th>Query</th><th>Conditions</th><th>Truth and source</th><th>REDLINE</th><th>Naive</th><th>Score (REDLINE / naive)</th></tr></thead>'
    + `<tbody>${qrows}</tbody></table></div>`
    + (m.kind === 'fixture' ? '' : `<p><a href="${RESULTS_URL}" download>Download published results</a></p>`)
    + '</section>';

  return head + run + metrics + minima + breakdowns + method + queries;
}

// loadAccuracyReport(url) -> rows ([] when the results file is absent: "not run").
export async function loadAccuracyReport(url = publishedAccuracyReportUrl) {
  if (url === null) return [];
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return parseCsv(await res.text());
}

// renderAccuracyView(root, rows, { sources, onBack }) -> summary. Read-only screen.
export function renderAccuracyView(root, rows, { sources = {}, onBack } = {}) {
  sources = sources ?? {};
  const summary = summarizeResults(rows);
  root.innerHTML = accuracyViewHtml(summary, { sources });
  root.querySelector('[data-action="back"]')?.addEventListener('click', () => onBack?.());
  return summary;
}
