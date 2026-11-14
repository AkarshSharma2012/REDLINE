// R8 leave-one-source-out holdout run (S1 §3.4): REDLINE (labelMaterial) vs the R8 §5 naive
// lookup (baselineLabel) on frozen, human-labelled queries. Writes research/validation-results.csv
// (R8 §8 columns). The script never creates truth; it reads it from the queries file.
//
//   node scripts/eval-holdout.mjs --seed 7
//   node scripts/eval-holdout.mjs --evidence tests/fixtures/holdout-evidence.json \
//     --queries tests/fixtures/holdout-queries.csv --out <file> --seed 7
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { labelMaterial } from '../src/rules/label.js';
import { baselineLabel } from '../src/rules/baseline.js';
import { answerCategory, scoreAnswer, summarizeResults, parseCsv } from '../src/ui/accuracy-view.js';

export const DEV_SHARE = 0.3; // R8 §2.3: about 30% of source groups go to dev
const BANNED = ['safe', 'never tested', 'never burns', 'will burn on the moon', 'nonflammable', 'fire-safe'];
const NUMERIC = ['thickness_mm', 'width_mm', 'o2_pct', 'pressure_kpa', 'flow_speed_cm_s', 'gravity_g', 'external_heat_flux_kw_m2'];
export const COLUMNS = [
  'query_id', 'split', 'holdout_group', 'query_type', 'invalid_rule',
  'material_id', 'display_name', 'form', 'thickness_mm', 'width_mm', 'flow_speed_cm_s', 'flow_direction',
  'o2_pct', 'pressure_kpa', 'gravity_g', 'external_heat_flux_kw_m2', 'endpoint',
  'truth', 'truth_source_key', 'truth_source_locator', 'adjudicator_1', 'adjudicator_2',
  'redline_answer', 'redline_reason_code', 'redline_cited_row', 'baseline_answer', 'baseline_cited_row',
  'score', 'baseline_score', 'C1', 'C2', 'C3', 'C4', 'C5', 'leak_check', 'notes',
  'evaluation', 'run_seed', 'run_commit', 'evidence_built_from', 'evidence_kind', 'run_at',
];

// Link keys for one row (R8 §2.2): source, holdout_group, run, reused physical sample.
function linkKeys(row) {
  const keys = [`src:${row.source_key}`];
  if (row.holdout_group) keys.push(`hg:${row.holdout_group}`);
  if (row.run_id && row.run_id !== '—' && row.run_id !== '-') {
    keys.push(`run:${row.investigation ?? row.source_key}/${row.run_id}/${row.pi ?? ''}`);
  }
  if (row.sample_id) keys.push(`sample:${row.investigation ?? ''}/${row.sample_id}`);
  return keys;
}

// linkGroups(rows) -> Map evidence_id -> group name. Union-find over shared link keys, so one
// run, one reused sample, or one run reported by two sources always ends up in one group.
export function linkGroups(rows) {
  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const union = (a, b) => { parent.set(find(a), find(b)); };
  for (const row of rows) {
    const keys = linkKeys(row);
    for (const k of keys) if (!parent.has(k)) parent.set(k, k);
    for (const k of keys.slice(1)) union(keys[0], k);
  }
  const names = new Map();
  for (const row of rows) {
    const root = find(`src:${row.source_key}`);
    (names.get(root) ?? names.set(root, new Set()).get(root)).add(row.source_key);
  }
  const groupOf = new Map();
  for (const row of rows) groupOf.set(row.evidence_id, [...names.get(find(`src:${row.source_key}`))].sort().join('+'));
  return groupOf;
}

// removeGroup(rows, groupOf, group) -> the table with every row of that group removed.
export function removeGroup(rows, groupOf, group) {
  return rows.filter((r) => groupOf.get(r.evidence_id) !== group);
}

// assertNoLeak(retained, heldOut) throws if any retained row shares an id, source, holdout
// group, run or sample with a held-out row (kill rule K7).
export function assertNoLeak(retained, heldOut) {
  const ids = new Set(heldOut.map((r) => r.evidence_id));
  const keys = new Set(heldOut.flatMap(linkKeys));
  for (const row of retained) {
    if (ids.has(row.evidence_id) || linkKeys(row).some((k) => keys.has(k))) {
      throw new Error(`K7 leak: ${row.evidence_id} is linked to the held-out group`);
    }
  }
}

// Deterministic seeded shuffle (mulberry32) of sorted group names; first DEV_SHARE go to dev.
export function splitGroups(groups, seed) {
  let a = Number(seed) >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const list = [...new Set(groups)].sort();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const nDev = Math.round(list.length * DEV_SHARE);
  return { dev: new Set(list.slice(0, nDev)), test: new Set(list.slice(nDev)) };
}

function toQuery(q) {
  const query = { ...q };
  for (const k of NUMERIC) query[k] = q[k] === '' || q[k] == null ? null : Number(q[k]);
  if (query.external_heat_flux_kw_m2 === null) query.external_heat_flux_kw_m2 = 0;
  for (const k of ['form', 'flow_direction', 'endpoint']) if (query[k] === '') query[k] = null;
  return query;
}

const gClass = (g) => (g === 0 ? 0 : g === 1 ? 1 : null);

// R8 §4.2 automated checks on one REDLINE result.
function checks(query, result, retained, sources) {
  const category = answerCategory(result.label, result.reason);
  const byId = new Map(retained.map((r) => [r.evidence_id, r]));
  const cited = (result.cited ?? []).map((id) => byId.get(id));
  let C1 = 'n/a';
  if (category !== 'NE-no-data') {
    const ok = cited.length && cited.every((r) => r && sources?.[r.source_key]?.url && String(r.source_locator ?? '').trim());
    C1 = ok ? 'auto-pass' : 'fail'; // human page check still needed for 'pass'
  }
  const words = String(result.wording ?? '').toLowerCase();
  const C2 = !result.wording ? 'n/a' : BANNED.some((w) => words.includes(w)) ? 'fail' : 'pass';
  const C3 = 'not-assessed'; // display check, done in the UI
  const crosses = cited.some((r) => r && gClass(r.gravity_g) !== gClass(query.gravity_g));
  const C4 = !cited.length ? 'n/a' : crosses && !result.cross_gravity ? 'fail' : 'pass';
  const lunar = query.gravity_g !== null && query.gravity_g > 0 && query.gravity_g < 1;
  const C5 = !lunar ? 'n/a' : result.estimate ? 'pass' : 'fail';
  return { C1, C2, C3, C4, C5 };
}

// runEvaluation({...}) -> R8 §8 result rows. `retain` is injectable so tests can plant a leak.
export function runEvaluation({
  evidence, queries, seed = 0, meta = {},
  redline = labelMaterial, baseline = baselineLabel, retain = removeGroup,
}) {
  const rows = (evidence.evidence ?? []).filter((r) => r.review_status === 'verified');
  const groupOf = linkGroups(rows);
  const groupOfQuery = (q) => groupOf.get(q.from_evidence_id)
    ?? groupOf.get(rows.find((r) => r.holdout_group === q.holdout_group || r.source_key === q.holdout_group)?.evidence_id);
  const answerable = queries.filter((q) => q.query_type === 'answerable');
  const { dev } = splitGroups(answerable.map(groupOfQuery).filter(Boolean), seed);

  return queries.map((q) => {
    const query = toQuery(q);
    const out = { ...Object.fromEntries(COLUMNS.map((c) => [c, ''])), ...pick(q), ...meta, run_seed: String(seed) };
    let group = q.query_type === 'answerable' ? groupOfQuery(q) : (q.holdout_group ? groupOfQuery(q) : undefined);
    if (q.query_type === 'answerable' && !group) {
      return { ...out, split: 'excluded', notes: join(q.notes, 'no verified evidence row for this query group; not scored') };
    }
    if (q.query_type === 'answerable' && gClass(query.gravity_g) === null) {
      return { ...out, split: 'excluded', notes: join(q.notes, 'partial-gravity query; R8 §0 does not score lunar gravity') };
    }
    const retained = group ? retain(rows, groupOf, group) : rows;
    let leak = 'pass';
    if (group) {
      try { assertNoLeak(retained, rows.filter((r) => groupOf.get(r.evidence_id) === group)); } catch { leak = 'fail'; }
    }
    const r = redline(query, retained.filter((row) => row.material_id === query.material_id));
    const b = baseline(query, retained);
    const rCat = answerCategory(r.label, r.reason);
    const bCat = answerCategory(b.label, b.reason);
    return {
      ...out,
      split: q.query_type === 'answerable' && dev.has(group) ? 'dev' : 'test',
      holdout_group: group ?? q.holdout_group ?? '',
      redline_answer: r.label, redline_reason_code: r.reason ?? '', redline_cited_row: (r.cited ?? []).join(' '),
      baseline_answer: bCat, baseline_cited_row: (b.cited ?? []).join(' '),
      score: scoreAnswer(q.query_type, q.truth, rCat), baseline_score: scoreAnswer(q.query_type, q.truth, bCat),
      ...checks(query, r, retained, evidence.sources), leak_check: leak,
    };
  });
}

const join = (...parts) => parts.filter(Boolean).join('; ');
function pick(q) {
  return Object.fromEntries(COLUMNS.filter((c) => c in q).map((c) => [c, q[c] ?? '']));
}

export function toCsv(rows, columns = COLUMNS) {
  const cell = (v) => { const s = String(v ?? ''); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [columns.join(','), ...rows.map((r) => columns.map((c) => cell(r[c])).join(','))].join('\n') + '\n';
}

function readQueries(path) {
  const text = readFileSync(path, 'utf8');
  return path.endsWith('.json') ? JSON.parse(text) : parseCsv(text);
}

function parseArgs(argv) {
  const args = { evidence: 'data/evidence.json', queries: 'research/validation-queries.csv', out: 'research/validation-results.csv', seed: null };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (key in args) args[key] = argv[++i];
  }
  return args;
}

function commit() {
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'unknown'; }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.seed === null || !/^\d+$/.test(args.seed)) {
    console.error('Usage: node scripts/eval-holdout.mjs --seed <non-negative integer> [--evidence f] [--queries f] [--out f]');
    process.exit(2);
  }
  for (const f of [args.evidence, args.queries]) {
    if (!existsSync(f)) {
      console.error(`Held-out evaluation not run: ${f} not found. Queries and truth are written by people before the run (R8 §3). Nothing was written.`);
      process.exit(1);
    }
  }
  const evidence = JSON.parse(readFileSync(args.evidence, 'utf8'));
  const verified = (evidence.evidence ?? []).filter((r) => r.review_status === 'verified');
  const meta = {
    evaluation: 'leave-one-source-out', run_commit: commit(), run_at: new Date().toISOString(),
    evidence_built_from: evidence.built_from ?? args.evidence,
    evidence_kind: verified.length && verified.every((r) => r.verified_by === 'fixture-only') ? 'fixture' : 'real',
  };
  const rows = runEvaluation({ evidence, queries: readQueries(args.queries), seed: Number(args.seed), meta });
  writeFileSync(args.out, toCsv(rows));

  const s = summarizeResults(rows);
  const kn = (m) => (m ? `${m.k}/${m.n}` : '--');
  console.log(`Wrote ${rows.length} rows to ${args.out} (seed ${args.seed}, ${verified.length} verified evidence rows).`);
  console.log(`Status: ${s.status}${s.status === 'descriptive' ? ' (descriptive only, too few independent tests)' : ''}`);
  for (const [name, key] of [['Selective accuracy', 'selective'], ['Coverage', 'coverage'], ['Under-warning', 'underWarning'],
    ['Correct refusal', 'correctRefusal'], ['Absent-data controls', 'absent'], ['Traceability', 'traceability']]) {
    console.log(`  ${name.padEnd(22)} REDLINE ${kn(s.redline[key]).padEnd(8)} naive ${kn(s.baseline[key])}`);
  }
  for (const [by, table] of Object.entries(s.breakdown)) {
    for (const [k, v] of Object.entries(table)) {
      console.log(`  by ${by} ${k}: ${v.n} queries, REDLINE ${kn(v.redline)} correct/answered, naive ${kn(v.baseline)}`);
    }
  }
  for (const k of s.kills) console.log(`  ${k.id} ${k.text}: ${k.state}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
