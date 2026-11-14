import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Decimal KB; strictly under 600 KB, measured on disk (not compressed).
export const SIZE_LIMIT_BYTES = 600_000;
const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const external = /^(?:https?:)?\/\//i;

/** Static resource references only: ordinary citation/navigation URLs are allowed.
 * This is a regression guard, not a JavaScript evaluator or offline browser test.
 */
export function findExternalResources(text) {
  const found = new Set();
  const record = value => { if (external.test(value.trim())) found.add(value.trim()); };
  // HTML, including markup embedded in JS strings and inline SVG images.
  for (const tag of text.matchAll(/<(script|link|img|image|source|input|video|iframe|embed|object)\b[^>]*>/gi)) {
    const attrs = new Map();
    for (const a of tag[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs.set(a[1].toLowerCase(), a[2] ?? a[3] ?? a[4]);
    }
    for (const key of ['src', 'srcset', 'poster', 'xlink:href', 'data']) {
      const value = attrs.get(key);
      if (value) for (const part of value.split(',')) record(part.trim().split(/\s+/)[0]);
    }
    if (/^(link|image)$/i.test(tag[1])) record(attrs.get('href') ?? '');
  }
  // CSS url(), @import (including fonts), ES imports/re-exports/dynamic imports,
  // and direct DOM resource assignments. Data URLs remain local.
  const patterns = [
    /\burl\(\s*["']?([^\s"')]+)/gi,
    /@import\s*["']([^"']+)/gi,
    /\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?["']([^"']+)/g,
    /\bimport\s*\(\s*["']([^"']+)/g,
    /\.(?:src|srcset|poster)\s*=\s*["'`]([^"'`]+)/gi,
    /setAttribute\(\s*["'](?:src|srcset|poster)["']\s*,\s*["'`]([^"'`]+)/gi,
    /["']?(?:script_url|stylesheet_url|font_url|image_url|src|srcset|poster)["']?\s*:\s*["']([^"']+)/gi,
  ];
  for (const pattern of patterns) for (const match of text.matchAll(pattern)) record(match[1]);
  return [...found].sort();
}

async function filesBelow(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not a budgeted local asset: ${name}`);
    if (entry.isDirectory()) files.push(...await filesBelow(name));
    else if (entry.isFile()) files.push(name);
  }
  return files;
}

export async function checkSizeBudget(root = DEFAULT_ROOT) {
  const names = [path.join(root, 'index.html'), ...await filesBelow(path.join(root, 'src'))];
  for (const entry of await readdir(path.join(root, 'data'), { withFileTypes: true })) {
    if (entry.name.endsWith('.json')) {
      if (!entry.isFile()) throw new Error(`Expected regular JSON file: ${entry.name}`);
      names.push(path.join(root, 'data', entry.name));
    }
  }
  const files = [];
  const violations = [];
  for (const name of names.sort()) {
    const relative = path.relative(root, name).split(path.sep).join('/');
    files.push({ file: relative, bytes: (await stat(name)).size });
    for (const url of findExternalResources(await readFile(name, 'utf8'))) violations.push({ file: relative, url });
  }
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  return { files, totalBytes, limitBytes: SIZE_LIMIT_BYTES, violations,
    ok: totalBytes < SIZE_LIMIT_BYTES && violations.length === 0 };
}

export function formatReport(report) {
  return [
    'File                                              Bytes',
    ...report.files.map(({ file, bytes }) => `${file.padEnd(48)} ${String(bytes).padStart(7)}`),
    `${'TOTAL'.padEnd(48)} ${String(report.totalBytes).padStart(7)}`,
    `Budget: strictly under ${report.limitBytes} bytes (600 KB).`,
    ...report.violations.map(({ file, url }) => `External resource: ${file}: ${url}`),
    report.ok ? 'PASS: size and static resource checks.' : 'FAIL: size or external resource check.',
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const report = await checkSizeBudget(process.argv[2] && path.resolve(process.argv[2]));
    console.log(formatReport(report));
    if (!report.ok) process.exitCode = 1;
  } catch (error) {
    console.error(`Size budget check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
