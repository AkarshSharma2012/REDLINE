import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../src/schema/csv.js';
import { FIELDS, PROVENANCE_KEYS, validateEvidence } from '../src/schema/validate.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const numeric = new Set(FIELDS.filter((f) => f.type === 'number').map((f) => f.key));
const allowed = new Set([...FIELDS.map((f) => f.key), ...PROVENANCE_KEYS]);

export function convertRows(text) {
  return parseCsv(text).map((raw, i) => Object.fromEntries(Object.entries(raw).map(([key, value]) => {
    if (!allowed.has(key)) throw new Error(`CSV row ${i + 1}: unknown column ${key}`);
    if (value === '') return [key, null];
    if (!numeric.has(key)) return [key, value];
    // Number(' ') and hexadecimal literals must not become experimental values.
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value) || !Number.isFinite(Number(value))) {
      throw new Error(`CSV row ${i + 1}: ${key} is not a finite decimal number`);
    }
    return [key, Number(value)];
  })));
}

export async function buildEvidence({ input = resolve(root, 'data/evidence.csv'), metadata = resolve(root, 'data/metadata.json'), output = resolve(root, 'data/evidence.json'), builtAt = new Date().toISOString() } = {}) {
  const evidence = convertRows(await readFile(input, 'utf8'));
  const dictionaries = JSON.parse(await readFile(metadata, 'utf8'));
  let sha;
  try { sha = execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch { throw new Error('Cannot record evidence provenance: git HEAD is unavailable'); }
  const data = { ...dictionaries, schema_version: '1.0.0', built_at: builtAt, built_from: `data/evidence.csv@${sha}`, evidence };
  const { ok, errors } = validateEvidence(data);
  if (!ok) throw new Error(`Evidence validation failed:\n${errors.join('\n')}`);
  // Never replace the last usable artifact on parse/schema failure.
  const temporary = `${output}.${process.pid}.tmp`;
  try { await writeFile(temporary, JSON.stringify(data, null, 2) + '\n'); await rename(temporary, output); }
  finally { await unlink(temporary).catch(() => {}); }
  return data;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) { console.error('Usage: node scripts/build-evidence.mjs'); process.exitCode = 1; }
  else try { const data = await buildEvidence(); console.log(`Built ${data.evidence.length} evidence rows (${data.evidence.filter((r) => r.review_status === 'verified').length} verified)`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
