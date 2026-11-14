import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkSizeBudget, findExternalResources, formatReport, SIZE_LIMIT_BYTES } from '../scripts/size-budget.mjs';

test('repository stays within budget and uses local static assets', async () => {
  const report = await checkSizeBudget();
  console.log(formatReport(report));
  assert.equal(report.ok, true, formatReport(report));
});

test('external resource contexts are rejected, including protocol-relative URLs', () => {
  for (const text of [
    '<script src="https://cdn.example/a.js"></script>',
    '<LINK href=//cdn.example/a.css rel=stylesheet>',
    '<img srcset="local.png 1x, https://cdn.example/a.png 2x">',
    '<image xlink:href="http://cdn.example/a.svg">',
    '<source src="https://cdn.example/a.png">',
    'body { background: url("https://cdn.example/a.png") }',
    '@import "https://cdn.example/font.css";',
    '@font-face { src: url(//cdn.example/font.woff2) }',
    'import "https://cdn.example/a.js";',
    'export { x } from "https://cdn.example/a.js";',
    'import("https://cdn.example/a.js")',
    'image.src = "https://cdn.example/a.png";',
    'image.setAttribute("src", "https://cdn.example/a.png")',
    '{"image_url":"https://cdn.example/a.png"}',
  ]) assert.ok(findExternalResources(text).length, text);
});

test('citations, local resources and embedded SVG namespaces are allowed', () => {
  assert.deepEqual(findExternalResources(`
    <a href="https://ntrs.nasa.gov/citations/123">NASA</a>
    {"source_url":"https://psi.nasa.gov/", "url":"https://www.nasa.gov/"}
    <script src="src/main.js"></script><img src="./local.png">
    import './rules/label.js';
    body { background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>") }
  `), []);
});

test('byte count is recursive, uncompressed, exact, and within decimal 2 MB', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'redline-budget-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'src', 'nested'), { recursive: true });
  await mkdir(path.join(root, 'data'));
  await writeFile(path.join(root, 'src', 'nested', 'a.js'), '\u00e9');
  await writeFile(path.join(root, 'data', 'a.json'), '{}');
  await writeFile(path.join(root, 'data', 'ignored.csv'), 'ignored');
  await writeFile(path.join(root, 'index.html'), 'x'.repeat(SIZE_LIMIT_BYTES - 5));
  let report = await checkSizeBudget(root);
  assert.equal(report.totalBytes, SIZE_LIMIT_BYTES - 1);
  assert.equal(report.ok, true);
  assert.equal(report.files.length, 3);
  await writeFile(path.join(root, 'index.html'), 'x'.repeat(SIZE_LIMIT_BYTES - 4));
  report = await checkSizeBudget(root);
  assert.equal(report.totalBytes, SIZE_LIMIT_BYTES);
  assert.equal(report.ok, true);
  await writeFile(path.join(root, 'index.html'), 'x'.repeat(SIZE_LIMIT_BYTES - 3));
  report = await checkSizeBudget(root);
  assert.equal(report.totalBytes, SIZE_LIMIT_BYTES + 1);
  assert.equal(report.ok, false);
  const cli = spawnSync(process.execPath, ['scripts/size-budget.mjs', root], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stdout, /TOTAL[\s]+2000001/);
  await writeFile(path.join(root, 'index.html'), '<script src="https://example.org/a.js"></script>');
  assert.equal((await checkSizeBudget(root)).violations.length, 1);
  await rm(path.join(root, 'index.html'));
  await assert.rejects(checkSizeBudget(root), /ENOENT/);
});

