import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('[', '&#91;')
  .replaceAll(']', '&#93;').replaceAll('\r', ' ').replaceAll('\n', ' ');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

/** Count observed tuples only; missing optional investigations remain explicit. */
export function countCoverageBySource(data) {
  if (!Array.isArray(data?.evidence)) throw new Error('Expected an evidence array');
  const groups = new Map();
  for (const row of data.evidence) {
    if (!row || typeof row.source_key !== 'string' || !row.source_key.trim()
      || typeof row.review_status !== 'string' || !row.review_status.trim()) {
      throw new Error('Each row requires source_key and review_status');
    }
    if (row.investigation != null && typeof row.investigation !== 'string') {
      throw new Error('investigation must be a string or null');
    }
    const investigation = row.investigation?.trim() || null;
    const key = JSON.stringify([row.source_key, investigation, row.review_status]);
    if (!groups.has(key)) groups.set(key, {
      source_key: row.source_key, investigation, review_status: row.review_status, count: 0,
    });
    groups.get(key).count++;
  }
  return [...groups.values()].sort((a, b) => compare(a.source_key, b.source_key)
    || compare(a.investigation ?? '', b.investigation ?? '') || compare(a.review_status, b.review_status));
}

export function renderCoverageBySource(data) {
  const groups = countCoverageBySource(data);
  const lines = [
    '# Coverage by source', '',
    'Generated from `data/evidence.json` with `node scripts/coverage-by-source.mjs`.', '',
    'Primary dataset context: [NASA PSI Data Repository](https://psi.nasa.gov/).', '',
    'Counts are evidence rows grouped by source_key × investigation × review_status, not independent experiments or scientific validation. All review statuses are included. Only observed combinations appear; unused sources are omitted. “Not specified” means the investigation field is missing or blank; no investigation is inferred from the source title.', '',
    `Total evidence rows: **${data.evidence.length}**. Observed combinations: **${groups.length}**.`, '',
    '| Source key (NASA link) | Investigation | Review status | Rows | Evidence IDs and source locators |',
    '|---|---|---|---:|---|',
  ];
  for (const group of groups) {
    const source = data.sources?.[group.source_key];
    let url;
    try { url = new URL(source?.url); } catch { throw new Error(`Missing or invalid source URL: ${group.source_key}`); }
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Invalid source URL: ${group.source_key}`);
    const link = `<${url.href.replaceAll('>', '%3E')}>`;
    const rows = data.evidence.filter((row) => row.source_key === group.source_key
      && (row.investigation?.trim() || null) === group.investigation && row.review_status === group.review_status);
    const records = rows.map((row) => {
      if (!row.evidence_id || !row.source_locator) throw new Error(`Missing evidence ID or source locator: ${group.source_key}`);
      return `${text(row.evidence_id)}: ${text(row.source_locator)}`;
    }).sort(compare);
    lines.push(`| [${text(group.source_key)}](${link}) | [${text(group.investigation ?? 'Not specified')}](${link}) | ${text(group.review_status)} | [${group.count}](${link}) | ${records.join('; ')} |`);
  }
  if (!groups.length) lines.push('', 'No evidence rows in this dataset.');
  return `${lines.join('\n')}\n`;
}

export async function writeCoverageBySource(input = new URL('../data/evidence.json', import.meta.url), output = new URL('../docs/coverage-by-source.md', import.meta.url)) {
  const report = renderCoverageBySource(JSON.parse(await readFile(input, 'utf8')));
  await mkdir(dirname(output instanceof URL ? fileURLToPath(output) : output), { recursive: true });
  await writeFile(output, report, 'utf8');
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await writeCoverageBySource(...process.argv.slice(2)); }
  catch (error) { console.error(`Coverage report failed: ${error.message}`); process.exitCode = 1; }
}
