import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../src/schema/csv.js';
import { FIELDS, ENUMS } from '../src/schema/validate.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const numeric = new Set([...FIELDS.filter(f => f.type === 'number').map(f => f.key),
  'pressure_psia', 'o2_initial_calibrated_vol_pct', 'o2_final_calibrated_vol_pct']);
// Recognizable UTF-8 decoded as Windows-1252/Latin-1, plus replacement characters.
const mojibake = /\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF\u20AC\u2018-\u201E\u2122]|\u00EF\u00BB\u00BF/;

export function lintCsv(text) {
  const errors = [];
  const add = (row, column, code, message) => errors.push({ row, column, code, message });
  let rows;
  try {
    // Parse the header separately too, so header-only files are checked.
    rows = parseCsv(text.replace(/^\uFEFF/, ''));
    const header = parseCsv(`__header\n"${text.replace(/^\uFEFF/, '').split(/\r?\n/)[0].replaceAll('"', '""')}"`)[0]?.__header;
    if (!header || !rows.length) add(0, '', 'empty-data', 'CSV must contain a header and evidence rows.');
  } catch (error) {
    add(0, '', 'csv-format', error.message);
    return { rowCount: 0, errors };
  }
  const ids = new Map();
  const materials = new Map();
  const units = new Map();
  for (const [index, row] of rows.entries()) {
    const n = index + 1;
    for (const column of ['evidence_id', 'material_id', 'source_locator', 'endpoint', 'value_unit']) {
      if (!(column in row)) add(n, column, 'missing-column', `Missing required column ${column}.`);
    }
    for (const [column, value] of Object.entries(row)) {
      if (/\s$/u.test(value)) add(n, column, 'trailing-space', 'Cell ends in whitespace.');
      if (mojibake.test(value)) add(n, column, 'mojibake', 'Possible encoding corruption; review original text.');
      if (numeric.has(column) && value.trim() && (!decimal.test(value) || !Number.isFinite(Number(value)))) {
        add(n, column, 'mixed-units', 'Numeric column requires a finite decimal in its declared unit, without a unit suffix.');
      }
    }
    const id = row.evidence_id?.trim();
    if (!id) add(n, 'evidence_id', 'blank-id', 'Evidence ID is blank.');
    else if (ids.has(id)) add(n, 'evidence_id', 'duplicate-id', `Duplicate evidence ID; first appears in data row ${ids.get(id)}.`);
    else ids.set(id, n);
    const material = row.material_id?.trim();
    if (material) {
      const key = material.toLowerCase();
      if (materials.has(key) && materials.get(key) !== material) add(n, 'material_id', 'material-case', `Casing differs from ${materials.get(key)}.`);
      else materials.set(key, material);
    }
    for (const column of Object.keys(row).filter(c => c.endsWith('source_locator'))) {
      const prefix = column.slice(0, -'locator'.length);
      if ((column === 'source_locator' || row[`${prefix}url`]?.trim() || row[`${prefix}title`]?.trim()) && !row[column].trim()) {
        add(n, column, 'blank-locator', 'Source locator is blank.');
      }
    }
    const unit = row.value_unit?.trim();
    if (unit && !ENUMS.value_unit.includes(unit)) add(n, 'value_unit', 'mixed-units', `Unrecognized unit ${unit}; use a schema unit.`);
    if (row.value?.trim() && !unit) add(n, 'value_unit', 'mixed-units', 'A numeric result requires a value unit.');
    if (unit && row.endpoint?.trim()) {
      const endpoint = row.endpoint.trim();
      if (units.has(endpoint) && units.get(endpoint) !== unit) add(n, 'value_unit', 'mixed-units', `Endpoint ${endpoint} mixes ${units.get(endpoint)} and ${unit}; review and normalize explicitly.`);
      else units.set(endpoint, unit);
    }
  }
  return { rowCount: rows.length, errors };
}

const escape = value => String(value).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ');
export function renderReport(result, input = 'data/evidence.csv') {
  return `# CSV lint report\n\nInput: ${escape(input)}\n\nData rows: ${result.rowCount}. Errors: ${result.errors.length}.\n\n` +
    'Run `node scripts/lint-csv.mjs [input.csv] [report.md]` from any directory. Defaults use repository paths. Exit status is 1 for lint or I/O errors, 0 for a clean file. Data is never modified. Row numbers below count parsed data records, excluding the header; quoted multiline cells count as one record.\n\n' +
    'Checks: trailing cell whitespace; common mojibake/replacement characters; finite unit-free numeric cells and schema value units; differing value units within an endpoint; inconsistent case for the same material ID; blank primary or populated secondary source locators; duplicate evidence IDs. Mixed endpoint units require review, not automatic conversion. Blank optional secondary provenance is allowed. Free-text source quotations are not unit-normalized. This is a hygiene check, not scientific or source verification.\n\n' +
    (result.errors.length ? '| Data row | Column | Code | Finding |\n| --- | --- | --- | --- |\n' + result.errors.map(e => `| ${e.row || 'file'} | ${escape(e.column)} | ${e.code} | ${escape(e.message)} |`).join('\n') + '\n' : 'No lint errors found.\n');
}

export async function runLint(input = resolve(root, 'data/evidence.csv'), output = resolve(root, 'docs/csv-lint-report.md')) {
  let result;
  try { result = lintCsv(await readFile(input, 'utf8')); }
  catch (error) { result = { rowCount: 0, errors: [{ row: 0, column: '', code: 'read-error', message: error.message }] }; }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderReport(result, input === resolve(root, 'data/evidence.csv') ? 'data/evidence.csv' : input));
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 4) { console.error('Usage: node scripts/lint-csv.mjs [input.csv] [report.md]'); process.exitCode = 1; }
  else try {
    const result = await runLint(...process.argv.slice(2));
    console.log(`CSV lint: ${result.rowCount} rows, ${result.errors.length} errors.`);
    process.exitCode = result.errors.length ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
