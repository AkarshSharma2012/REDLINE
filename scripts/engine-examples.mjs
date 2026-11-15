import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { labelMaterial } from '../src/rules/label.js';
import { compareRow } from '../src/rules/compare.js';

const fields = ['material_id', 'form', 'thickness_mm', 'width_mm', 'o2_pct',
  'pressure_kpa', 'flow_speed_cm_s', 'flow_direction', 'gravity_g', 'external_heat_flux_kw_m2'];
const fixtureUrl = new URL('../tests/fixtures/holdout-evidence.json', import.meta.url);
const docUrl = new URL('../docs/engine-examples.md', import.meta.url);

// These are illustrative queries, not additional measured NASA records.
export function buildExamples(data) {
  const byId = new Map(data.evidence.map(row => [row.evidence_id, row]));
  const cases = [
    ['Spread observation', 'LINK2018-UG-B19', {}],
    ['No-spread observation', 'LINK2018-UG-17', {}],
    ['Normal-gravity observation', 'LINK2018-1G-18', {}],
    ['Normal-gravity measured limit', 'OSORIO2014-ETFE-1G', {}],
    ['Microgravity measured limit', 'OSORIO2014-ETFE-UG', {}],
    ['One oxygen percentage point below a measured limit', 'OSORIO2014-ETFE-UG', { o2_pct: 25 }],
    ['Below the near-limit band', 'OSORIO2014-ETFE-UG', { o2_pct: 23 }],
    ['Different endpoint: quench speed', 'ZHAO2015-SIBAL-T4', {}],
    ['Form mismatch', 'LINK2018-UG-B19', { form: 'fabric' }],
    ['Flow-direction mismatch', 'LINK2018-UG-B19', { flow_direction: 'concurrent' }],
    ['Pressure not specified', 'LINK2018-UG-17', { pressure_kpa: null }],
    ['Lunar estimate query', 'LINK2018-UG-B19', { gravity_g: 0.16 }],
  ];
  return cases.map(([title, id, overrides], index) => {
    const seed = byId.get(id);
    if (!seed) throw new Error(`Missing worked-example fixture row: ${id}`);
    const query = { ...Object.fromEntries(fields.map(key => [key, seed[key] ?? null])), ...overrides };
    const rows = data.evidence.filter(row => row.review_status === 'verified' && row.material_id === query.material_id);
    const result = labelMaterial(query, rows);
    return { number: index + 1, title, seed, query, result,
      rows: rows.map(row => ({ row, comparison: compareRow(query, row) })) };
  });
}

const inline = value => String(value).replace(/[\r\n]+/g, ' ').replaceAll('`', "'");
function source(data, row) {
  const record = data.sources[row.source_key];
  if (!record?.url) throw new Error(`Missing source for ${row.evidence_id}`);
  return `[${inline(row.evidence_id)}](${record.url}) — ${inline(row.source_locator)}`;
}

export function renderExamples(data) {
  const examples = buildExamples(data);
  const incomplete = examples.some(example => example.rows.length &&
    example.rows.every(item => item.comparison.rules.length === 0));
  const lines = ['# Engine worked examples', '',
    'Generated with `node scripts/engine-examples.mjs --write`; stdout is the same Markdown.', '',
    'Dataset: [S1 holdout fixture](../tests/fixtures/holdout-evidence.json), not the production evidence inventory. Primary repository context: [NASA PSI](https://psi.nasa.gov/). Fixture review status is test metadata, not independent verification.', '',
    'Queries copy the linked seed record except where the heading specifies an illustrative change. Modified queries are hypothetical inputs, not NASA measurements. Each result is returned by `labelMaterial`; row diagnostics come from `compareRow`. Candidate rows are not necessarily used to support the label.', '',
    'Lunar queries are estimates using separate 0 g and 1 g results; they do not establish a measured lunar limit.', ''];
  if (incomplete) lines.push('**BLOCKED by #55:** the checked-in comparison engine has no rule diagnostics. Current labels are provisional stub output, not scientific findings. These 12 calls demonstrate integration only; regenerate after the real engine lands.', '');
  for (const example of examples) {
    const { number, title, seed, query, result, rows } = example;
    lines.push(`## Example ${number}: ${title}`, '', `Query seed: ${source(data, seed)}.`, '',
      '```json', JSON.stringify(query, null, 2), '```', '',
      `Engine label: **${result.label}**; reason: ${result.reason ?? 'none'}.`, '',
      `Engine wording: ${result.wording ? inline(result.wording) : '(not supplied)'}.`, '',
      `Flags: ${result.flags.join(', ') || 'none'}; cross-gravity: ${result.cross_gravity}.`, '',
      'Evidence rows used / cited by the engine:', '');
    if (!result.cited.length) lines.push('- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.');
    for (const id of result.cited) {
      const item = rows.find(candidate => candidate.row.evidence_id === id);
      if (!item) throw new Error(`Engine cited an unavailable row: ${id}`);
      lines.push(`- ${source(data, item.row)}. Engine reason: ${result.reason ?? result.label}; comparison: ${item.comparison.grade}.`);
    }
    lines.push('', 'Candidate-row diagnostics (including rows not cited):', '');
    for (const { row, comparison } of rows) {
      lines.push(`- ${source(data, row)}. Endpoint: ${inline(row.endpoint)}; outcome: ${inline(row.outcome)}; limit: ${inline(row.value)} ${inline(row.value_unit)}. Grade: ${comparison.grade}.`,
        ...(comparison.rules.length ? comparison.rules.map(rule => `  - ${rule.rule}: ${rule.grade} — ${inline(rule.why)}`)
          : ['  - No rule explanations returned; dependency #55 is incomplete.']));
    }
    if (result.estimate) lines.push('', 'Separate gravity results:', '', '```json', JSON.stringify(result.estimate, null, 2), '```');
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--write')) throw new Error('Usage: node scripts/engine-examples.mjs [--write]');
  const output = renderExamples(JSON.parse(await readFile(fixtureUrl, 'utf8')));
  if (args.includes('--write')) await writeFile(docUrl, output);
  process.stdout.write(output);
}
