// Diagnostic companion to eval-holdout; never changes truth or engine decisions.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { runEvaluation } from './eval-holdout.mjs';
import { labelMaterial } from '../src/rules/label.js';
import { answerCategory, parseCsv } from '../src/ui/accuracy-view.js';

const NUMERIC = ['thickness_mm', 'width_mm', 'flow_speed_cm_s', 'o2_pct',
  'pressure_kpa', 'gravity_g', 'external_heat_flux_kw_m2'];
const CATEGORICAL = ['form', 'flow_direction', 'endpoint'];
const missing = (v) => v === null || v === undefined || v === '';

// Diagnostic distance only: each known numeric difference is normalized to [0, 1].
export function rowDistance(query, row) {
  let distance = 0;
  for (const key of [...NUMERIC, ...CATEGORICAL]) {
    if (missing(query[key])) continue;
    if (missing(row[key])) { distance += 1; continue; }
    if (NUMERIC.includes(key)) {
      const a = Number(query[key]), b = Number(row[key]);
      distance += Number.isFinite(a) && Number.isFinite(b)
        ? Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1) : 1;
    } else distance += query[key] === row[key] ? 0 : 1;
  }
  return distance;
}

export function analyzeErrors({ evidence, queries, seed = 0, redline = labelMaterial }) {
  const calls = new Map();
  const results = runEvaluation({ evidence, queries, seed, redline(query, rows) {
    const result = redline(query, rows);
    calls.set(query.query_id, { query, rows, result });
    return result;
  } });
  const snapshot = (row) => ({ ...row, source_url: evidence.sources?.[row.source_key]?.url ?? null });
  const errors = [];
  for (const evaluation of results) {
    if (evaluation.split === 'excluded' || ['correct', 'correct-refusal'].includes(evaluation.score)) continue;
    const { query, rows, result } = calls.get(evaluation.query_id);
    const cited = new Set(result.cited ?? []);
    const candidates = rows.filter((row) => !cited.has(row.evidence_id))
      .map((row) => ({ row, distance: rowDistance(query, row) }))
      .sort((a, b) => a.distance - b.distance || a.row.evidence_id.localeCompare(b.row.evidence_id));
    const nearest = candidates[0];
    errors.push({
      query_id: evaluation.query_id, split: evaluation.split, holdout_group: evaluation.holdout_group,
      query, expected: query.query_type === 'incompatible' ? 'NE-incompatible'
        : query.query_type === 'absent' ? 'NE-no-data'
          : ({ burned: 'BURNED', near: 'NEAR', 'no-burn': 'NE-no-burn' }[query.truth] ?? query.truth),
      actual: answerCategory(result.label, result.reason), score: evaluation.score,
      truth_source_url: evidence.sources?.[query.truth_source_key]?.url ?? null,
      truth_source_locator: query.truth_source_locator ?? null,
      result,
      used_rows: [...cited].map((id) => {
        const row = rows.find((r) => r.evidence_id === id);
        if (!row) throw new Error(`Engine cited unavailable evidence row: ${id}`);
        return snapshot(row);
      }),
      nearest_unused_row: nearest ? { ...snapshot(nearest.row), distance: nearest.distance } : null,
    });
  }
  return { seed, evaluated: results.filter((r) => r.split !== 'excluded').length,
    excluded: results.filter((r) => r.split === 'excluded').map((r) => ({ query_id: r.query_id, notes: r.notes })),
    errors };
}

function main(argv) {
  const args = { evidence: 'data/evidence.json', queries: 'research/validation-queries.csv', seed: '0', out: null };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !(key in args) || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error('Usage: node scripts/eval-errors.mjs [--evidence file] [--queries file] [--seed integer] [--out file]');
    }
    args[key] = argv[++i];
  }
  if (!/^\d+$/.test(args.seed)) throw new Error('seed must be a non-negative integer');
  const evidence = JSON.parse(readFileSync(args.evidence, 'utf8'));
  const text = readFileSync(args.queries, 'utf8');
  const queries = args.queries.endsWith('.json') ? JSON.parse(text) : parseCsv(text);
  if (queries.some((q) => !q.query_id) || new Set(queries.map((q) => q.query_id)).size !== queries.length) {
    throw new Error('Queries must have unique, non-empty query_id values');
  }
  const report = JSON.stringify(analyzeErrors({ evidence, queries, seed: Number(args.seed) }), null, 2) + '\n';
  if (args.out) writeFileSync(args.out, report); else process.stdout.write(report);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
