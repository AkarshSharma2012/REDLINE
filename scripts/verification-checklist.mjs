import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../src/schema/csv.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cell = (value) => String(value ?? '').replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  .replaceAll('|', '&#124;').replaceAll('[', '&#91;').replaceAll(']', '&#93;')
  .replaceAll('*', '&#42;').replaceAll('_', '&#95;').replaceAll('`', '&#96;')
  .replaceAll('\\', '&#92;').replace(/\r\n|\r|\n/g, '<br>');
const present = (value) => value !== undefined && value !== null && value !== '';
const join = (parts) => parts.filter(present).join('; ') || 'not stated';
const fields = (row, definitions) => join(definitions.map(([key, label, unit = '']) =>
  present(row[key]) ? `${label}: ${row[key]}${unit ? ` ${unit}` : ''}` : ''));
const link = (url) => {
  if (!url) return 'not stated';
  // Preserve unknown schemes as text rather than emitting an active link.
  return /^https?:\/\//i.test(url)
    ? `[${cell(url)}](<${url.replace(/[<>\s|]/g, (c) => encodeURIComponent(c))}>)`
    : cell(url);
};

export async function generateChecklist({
  input = resolve(root, 'data/evidence.csv'),
  output = resolve(root, 'docs/verification-checklist.md'),
  sources,
} = {}) {
  sources ??= JSON.parse(await readFile(resolve(root, 'data/metadata.json'), 'utf8')).sources;
  const rows = parseCsv((await readFile(input, 'utf8')).replace(/^\uFEFF/, ''));
  const groups = new Map();
  for (const row of rows.filter((r) => r.review_status === 'draft')) {
    const source = sources[row.source_key] ?? {};
    const url = row.source_url || source.url || row.observation_source_url || row.condition_source_url || '';
    const key = row.source_key || url || 'Source not stated';
    if (!groups.has(key)) groups.set(key, { title: source.title || row.source_title || key, url, rows: [] });
    groups.get(key).rows.push({ row, url });
  }
  const lines = [
    '# Evidence verification checklist', '',
    'Generated from `data/evidence.csv` by `node scripts/verification-checklist.mjs`.', '',
    'Draft claims only; this checklist does not verify evidence or change review status. Open every cited source and check the material, conditions, result and locator before ticking a box and recording verified by / date. Unknown values are not zero. Regeneration resets manual checkmarks and signatures; save completed reviews separately first.', '',
    'Primary dataset: [NASA PSI Data Repository](https://psi.nasa.gov/).', '',
    `${[...groups.values()].reduce((n, g) => n + g.rows.length, 0)} draft evidence rows.`, '',
  ];
  if (!groups.size) lines.push('No draft evidence rows.', '');
  for (const [key, group] of groups) {
    lines.push(`## ${cell(key)} — ${cell(group.title)}`, '', `Source: ${link(group.url)}`, '',
      '| Checked | ID | Material | Conditions | Claimed result (unverified) | Source URL | Page / figure / table | Verified by / date |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const { row: r, url } of group.rows) {
      const conditions = fields(r, [
        ['form', 'form'], ['thickness_mm', 'thickness', 'mm'], ['width_mm', 'width', 'mm'],
        ['o2_pct', 'O2', '%'], ['pressure_kpa', 'pressure', 'kPa'], ['gravity_g', 'gravity', 'g'],
        ['flow_speed_cm_s', 'flow', 'cm/s'], ['flow_direction', 'flow direction'], ['facility', 'facility'],
        ['external_heat_flux_kw_m2', 'external heat flux', 'kW/m2'], ['test_duration_s', 'duration', 's'],
        ['o2_initial_calibrated_vol_pct', 'initial O2', 'vol%'], ['o2_final_calibrated_vol_pct', 'final O2', 'vol%'],
        ['gravity_context', 'gravity context'], ['gravity_regime', 'gravity regime'],
      ]);
      const result = join([r.endpoint, join([r.value, r.value_unit].filter(present)).replaceAll('; ', ' '),
        r.outcome, r.observation_paraphrase, r.uncertainty && `uncertainty: ${r.uncertainty}`,
        r.value_qualifier, r.caveat, r.notes]);
      const citations = [['Evidence', url, r.source_locator],
        ['Conditions', r.condition_source_url, r.condition_source_locator],
        ['Observation', r.observation_source_url, r.observation_source_locator]]
        .filter(([label, u, locator]) => label === 'Evidence' || u || locator);
      lines.push(`| [ ] | ${cell(r.evidence_id)} | ${cell(r.material)} | ${cell(conditions)} | ${cell(result)} | ${citations.map(([label, u]) => `${label}: ${link(u)}`).join('<br>')} | ${citations.map(([label, , loc]) => `${label}: ${cell(loc || 'not stated')}`).join('<br>')} |  |`);
    }
    lines.push('');
  }
  await writeFile(output, lines.join('\n'), 'utf8');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) { console.error('Usage: node scripts/verification-checklist.mjs'); process.exitCode = 1; }
  else try { await generateChecklist(); console.log('Wrote docs/verification-checklist.md'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
