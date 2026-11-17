// Read-only observations of production coverage, not scientific validation (#318).
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { compareRow } from '../../src/rules/compare.js';
import { labelMaterial } from '../../src/rules/label.js';
import { gravityClass } from '../../src/rules/normalize.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fields = ['material_id', 'material', 'form', 'thickness_mm', 'width_mm',
  'o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g',
  'facility', 'external_heat_flux_kw_m2', 'limit_approach', 'pass_criterion'];
const missing = value => value === null || value === undefined || value === '';
const select = (row, keys) => Object.fromEntries(keys.map(key => [key, row[key] ?? null]));
const tally = values => values.reduce((counts, value) => {
  const key = missing(value) ? '(not stated)' : String(value);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
const supporting = result => result.label === 'BURNED' || result.label === 'NEAR'
  || result.reason === 'NE-no-burn';

function observe(question, query, rows, scope = 'production') {
  // Candidate means same material ID, regardless of review, configuration or endpoint.
  // Name-only query deliberately supplies no conditions; it is not a matching algorithm.
  const candidates = rows.filter(row => row.material_id === query.material_id);
  const result = labelMaterial(query, rows);
  const passes = result.estimate
    ? [['g0', { ...query, gravity_g: 0 }], ['g1', { ...query, gravity_g: 1 }]]
    : [['same-gravity', query]];
  const diagnostics = passes.map(([pass, q]) => {
    const comparisons = candidates.map(row => {
      // Same verified quench context used by the public label interface.
      const quench = candidates.filter(other => other.review_status === 'verified'
        && other.endpoint === 'quench-limit' && other.value_unit === 'cm/s'
        && gravityClass(other.gravity_g) === gravityClass(row.gravity_g));
      const comparison = compareRow(q, row, { quench_speeds_cm_s: quench.map(r => r.value) });
      return { evidence_id: row.evidence_id, review_status: row.review_status,
        same_gravity_class: gravityClass(q.gravity_g) === gravityClass(row.gravity_g),
        comparison };
    });
    return { pass, comparisons };
  });
  // 'cited' also contains rejected rows on refusal; never count those as support.
  const parts = result.estimate ? Object.values(result.estimate) : [result];
  const eligibleIds = [...new Set(parts.filter(supporting).flatMap(part => part.cited))];
  const comparableIds = [...new Set(diagnostics.flatMap(({ comparisons }) => comparisons
    .filter(r => r.review_status === 'verified' && r.same_gravity_class && r.comparison.grade !== 'INVALID')
    .map(r => r.evidence_id)))];
  return { question, scope, query, candidate_count: candidates.length,
    verified_candidate_count: candidates.filter(r => r.review_status === 'verified').length,
    comparable_count: comparableIds.length, eligible_supporting_count: eligibleIds.length,
    eligible_supporting_ids: eligibleIds, result, diagnostics,
    coverage_observation: scope === 'synthetic-only' ? 'Isolated invented software stimulus; no production or NASA support.'
      : !candidates.length ? 'No production candidate for this material ID.'
      : !candidates.some(r => r.review_status === 'verified')
        ? 'Candidates exist; no verified row. Review gate is not evidence of physical incompatibility.'
        : 'Compare/label outcomes describe rule eligibility, not physical compatibility.' };
}

export function buildReport(data, snapshot = {}) {
  const before = JSON.stringify(data);
  const rows = data.evidence;
  const source = rows.find(r => r.evidence_id === 'M25-FS-M');
  const preset = data.cabin_presets.find(p => p.preset_id === 'exploration-8.2-34');
  assert.ok(source && preset, 'Expected explicit source-condition seed and cabin preset');
  const cabin = { material_id: 'pmma', display_name: 'PMMA (acrylic)', form: 'sheet',
    gravity_g: 0.16, o2_pct: preset.o2_pct, pressure_kpa: preset.pressure_kpa };
  const sourceQuery = select(source, fields);
  const cases = [
    observe('Requested lunar cabin PMMA sheet', cabin, rows),
    observe('Source-condition PMMA query (M25-FS-M)', sourceQuery, rows),
    observe('Material-name-only match (registry ID pmma)', { material_id: 'pmma', display_name: 'PMMA (acrylic)' }, rows),
    observe('Unknown material (deliberately absent ID)', { ...cabin, material_id: 'a2-unknown-material' }, rows),
    observe('Incompatible form (PMMA fabric query)', { ...sourceQuery, form: 'fabric' }, rows),
    observe('Missing pressure (source query with pressure omitted)', { ...sourceQuery, pressure_kpa: null }, rows),
  ];
  // Entirely invented software stimulus in a separate array; no production row is promoted.
  const synthetic = { evidence_id: 'SYNTHETIC-A2-POSITIVE', material_id: 'synthetic-a2',
    material: 'SYNTHETIC software control', form: 'sheet', thickness_mm: 1, width_mm: 10,
    o2_pct: 21, pressure_kpa: 100, gravity_g: 0, flow_direction: 'opposed',
    flow_speed_cm_s: 2, external_heat_flux_kw_m2: 0, facility: 'ISS',
    endpoint: 'burn/no-burn', outcome: 'spread', uncertainty: 'not stated',
    review_status: 'verified', verified_by: 'SYNTHETIC test metadata only; no human review' };
  const control = observe('SYNTHETIC positive control (not NASA evidence)',
    select(synthetic, fields), [synthetic], 'synthetic-only');
  assert.equal(control.result.label, 'BURNED');
  assert.equal(control.eligible_supporting_count, 1);
  assert.equal(cases[3].candidate_count, 0);
  assert.equal(cases[3].eligible_supporting_count, 0);
  assert.ok(cases[4].diagnostics[0].comparisons.some(r => r.comparison.rules
    .some(rule => rule.rule === 'F' && rule.grade === 'INVALID')));
  assert.ok(cases[5].diagnostics[0].comparisons.every(r => r.comparison.rules
    .some(rule => rule.rule === 'P' && rule.grade === 'FLAG')));
  assert.equal(JSON.stringify(data), before, 'Diagnostic must not mutate production data');
  const inventory = rows.map(row => ({ ...select(row, ['evidence_id', ...fields,
    'review_status', 'verified_by', 'endpoint', 'endpoint_source', 'value', 'value_unit',
    'outcome', 'uncertainty', 'test_duration_s', 'research_status', 'source_key',
    'source_locator', 'condition_source_url', 'condition_source_locator', 'notes']),
    source_url: row.source_url ?? data.sources[row.source_key]?.url ?? null,
    missing_conditions: fields.filter(key => key !== 'material' && missing(row[key])) }));
  const materials = [...new Set([...data.materials.map(m => m.material_id), ...rows.map(r => r.material_id)])]
    .map(material_id => {
      const mine = inventory.filter(r => r.material_id === material_id);
      return { material_id, rows: mine.length, statuses: tally(mine.map(r => r.review_status)),
        configurations: tally(mine.map(r => `${r.form ?? '?'} / ${r.thickness_mm ?? '?'} mm / ${r.width_mm ?? '?'} mm width / ${r.gravity_g ?? '?'} g`)),
        endpoints: tally(mine.map(r => r.endpoint)),
        missing_conditions: tally(mine.flatMap(r => r.missing_conditions)) };
    });
  return { command: 'node --test scripts/global-readiness/a2-decision-coverage.mjs', ...snapshot,
    primary_dataset: 'https://psi.nasa.gov/', rows: rows.length,
    statuses: tally(rows.map(r => r.review_status)),
    endpoint_counts: tally(rows.map(r => r.endpoint)),
    query_basis: { cabin_atmosphere: select(preset, ['preset_id', 'o2_pct', 'pressure_kpa', 'source_key', 'source_locator']),
      atmosphere_source_url: data.sources[preset.source_key]?.url,
      assumptions: 'Lunar gravity 0.16 g and sheet are requested diagnostic inputs; dimensions, flow and heating are unspecified. Source query copies M25-FS-M, including unknowns, without changing its draft status.' },
    definitions: 'Candidate = same material ID, all statuses. Comparable = verified, non-INVALID compareRow in a label gravity pass. Eligible supporting = unique cited rows from BURNED, NEAR or NE-no-burn public label results; rejected cited rows do not count. Counts are winning support, not every potentially useful row.',
    limits: [
      'Software observations only, not scientific validation, held-out accuracy, material qualification or cabin certification.',
      'Reuses #315 audit context; no source fetching, transcription re-audit or evidence promotion.',
      'NE-no-data filters by verified status: draft candidates are not absent research. INVALID is rule incompatibility, not proof of physical incompatibility.',
      'Missing values stay unknown, not zero. Missing-condition counts are descriptive, not a universal required-field or eligibility checklist; width may not apply to rods.',
      'Five-second extinction, ignition, quench/blowoff, MOC/ULOI and flame-spread endpoints remain distinct. Source endpoint text and caveats are retained.',
      'Partial gravity uses public 0 g / 1 g passes only. Neither pass establishes a lunar measurement or physical boundary; missing endpoints cannot supply a two-sided range.',
      'Synthetic control proves detection plumbing only and is excluded from every production count.',
    ], materials, inventory, cases, control };
}

function render(report) {
  const lines = [`Command: ${report.command}`, `Main SHA: ${report.main_sha}`, `HEAD: ${report.head_sha}`,
    `Production evidence SHA256: ${report.evidence_sha256}`,
    `Primary dataset: ${report.primary_dataset}`, `Rows: ${report.rows}; review statuses: ${JSON.stringify(report.statuses)}`,
    report.definitions, '', '| Question | Candidates | Verified | Comparable | Eligible supporting | Public label / reason |',
    '| --- | ---: | ---: | ---: | ---: | --- |'];
  for (const c of [...report.cases, report.control]) {
    lines.push(`| ${c.question} | ${c.candidate_count} | ${c.verified_candidate_count} | ${c.comparable_count} | ${c.eligible_supporting_count} | ${c.result.label} / ${c.result.reason ?? '-'} |`);
  }
  lines.push('');
  for (const c of [...report.cases, report.control]) {
    if (c.result.estimate) lines.push(`0 g / 1 g public results: ${JSON.stringify(c.result.estimate)}`);
    lines.push(`${c.question}: ${c.coverage_observation}`);
    const nonOk = c.diagnostics.flatMap(p => p.comparisons.flatMap(r => r.comparison.rules
      .filter(rule => rule.grade !== 'OK').map(rule => `${rule.rule}:${rule.grade}`)));
    lines.push(`Public compare rule counts (all candidates, all passes; not physical conclusions): ${JSON.stringify(tally(nonOk))}`);
  }
  lines.push('', `Query basis: ${JSON.stringify(report.query_basis)}`, '', 'Material/configuration coverage:');
  for (const m of report.materials) lines.push(JSON.stringify(m));
  lines.push('', 'ALL production rows (null = unknown; source locators and caveats retained):');
  for (const row of report.inventory) lines.push(JSON.stringify(row));
  lines.push('', 'Limits:', ...report.limits.map(limit => `- ${limit}`),
    '', 'For exact queries, per-row public compare reasons, labels and citations: node scripts/global-readiness/a2-decision-coverage.mjs --json');
  return lines.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const bytes = await readFile(new URL('../../data/evidence.json', import.meta.url));
  const { createHash } = await import('node:crypto');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const report = buildReport(JSON.parse(bytes), { main_sha: git('rev-parse', 'origin/main'),
    head_sha: git('rev-parse', 'HEAD'), evidence_sha256: createHash('sha256').update(bytes).digest('hex') });
  console.log(process.argv.includes('--json') ? JSON.stringify(report, null, 2) : render(report));
}
