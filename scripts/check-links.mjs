import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Parse quoted commas, escaped quotes, CRLF and multiline CSV fields.
function csvRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n')) {
      row.push(field.replace(/\r$/, '')); field = '';
      if (c === '\n') { rows.push(row); row = []; }
    } else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}

export function collectLinks(metadata, csv) {
  const links = new Map();
  function add(value, location) {
    if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return;
    const url = value.trim();
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(location);
  }
  function walk(value, path) {
    if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}[${i}]`));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`);
    } else add(value, path);
  }
  walk(metadata, 'data/metadata.json');
  const [headers = [], ...rows] = csvRows(csv.replace(/^\uFEFF/, ''));
  rows.forEach((row, i) => row.forEach((value, j) =>
    add(value, `data/evidence.csv row ${i + 2} (${headers[j] ?? j})`)));
  return [...links].map(([url, locations]) => ({ url, locations: [...locations] }));
}

export async function checkLinks(links, {
  fetchImpl = globalThis.fetch, timeoutMs = 10_000, delayMs = 250, wait = sleep,
} = {}) {
  const results = [];
  let requests = 0;
  async function request(url, method) {
    if (requests++) await wait(delayMs);
    const controller = new AbortController();
    let timer;
    try {
      const response = await Promise.race([
        Promise.resolve().then(() => fetchImpl(url, { method, signal: controller.signal, redirect: 'follow' })),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error('Request timed out')); }, timeoutMs);
        }),
      ]);
      // GET only needs headers; avoid downloading entire papers.
      await response.body?.cancel().catch(() => {});
      return String(response.status);
    } catch { return 'UNREACHABLE'; }
    finally { clearTimeout(timer); }
  }
  for (const link of links) {
    const head = await request(link.url, 'HEAD');
    const get = /^2\d\d$/.test(head) ? '—' : await request(link.url, 'GET');
    results.push({ ...link, head, get, status: get === '—' ? head : get });
  }
  return results;
}

const escape = value => String(value).replace(/\|/g, '&#124;').replace(/[\r\n]/g, ' ');

export function renderReport(results, date = new Date()) {
  return `# Source link report\n\nChecked: ${date.toISOString()}\n\nRun: \`node scripts/check-links.mjs\`. Each request has a 10 s timeout; requests are sequential with a 250 ms delay. GET follows failed HEAD requests. Redirects are followed. UNREACHABLE means a network failure or timeout, not proof that a source is missing. HTTP results describe reachability only, not scientific validity.\n\n${results.length} unique source URLs. CSV row numbers count logical records, including the header.\n\n| Source URL | HEAD | GET fallback | Final status | Locations |\n| --- | --- | --- | --- | --- |\n${results.map(r => `| <${escape(r.url)}> | ${r.head} | ${r.get} | ${r.status} | ${escape(r.locations.join('; '))} |`).join('\n')}\n`;
}

export async function main() {
  const [metadata, csv] = await Promise.all([
    readFile(resolve(root, 'data/metadata.json'), 'utf8'),
    readFile(resolve(root, 'data/evidence.csv'), 'utf8'),
  ]);
  const results = await checkLinks(collectLinks(JSON.parse(metadata), csv));
  const output = resolve(root, 'docs/link-report.md');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderReport(results));
  console.log(`Wrote ${results.length} source URL results to ${output}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
