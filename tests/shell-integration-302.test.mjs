// #302 B2 integration of A2 source records (PR300) and B1 viewer ownership (#299) into the
// PR301 black shell. Static CSS/HTML checks only; not a substitute for real browser review.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = p => readFile(new URL(p, root), 'utf8');
const html = await read('index.html');
const wsCss = await read('src/styles/workspace.css');
const recCss = await read('src/styles/source-records.css');
const rules = css => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sel: m[1].trim(), body: m[2] }));

test('index links source-records.css after workspace.css', () => {
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  const ws = links.indexOf('src/styles/workspace.css');
  const rec = links.indexOf('src/styles/source-records.css');
  assert.ok(ws >= 0 && rec > ws, `order: ${links.join(', ')}`);
});

test('no shell rule places a record-card child outside the single column', () => {
  for (const { sel, body } of rules(wsCss)) {
    if (!/\.ws-card\b/.test(sel)) continue;
    assert.doesNotMatch(body, /grid-(column|row):\s*(2|auto\s*\/\s*2)/, `${sel} must not force column/row 2`);
    const cols = body.match(/grid-template-columns:\s*([^;]+)/);
    if (cols && /\.ws-card(?![-\w])/.test(sel) && !/\.ws-material/.test(sel)) {
      assert.equal(cols[1].trim(), 'minmax(0, 1fr)', `${sel} records are one column`);
    }
  }
  assert.match(recCss, /#ws-sources \.ws-card \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(recCss, /#ws-sources \.ws-record-conditions \{[^}]*grid-template-columns/);
});

test('shell does not override B1 viewer stage or tool layout', () => {
  for (const { sel } of rules(wsCss)) {
    assert.doesNotMatch(sel, /\.rover-viewer/, `${sel} belongs to B1 rover-viewer.css`);
  }
});

test('workspace body surfaces are explicit black', () => {
  assert.match(wsCss, /\n\.workspace \{[^}]*background: #000/);
  assert.match(wsCss, /#ws-pane-controls \{[^}]*background: #000; \}/);
  assert.match(wsCss, /\.ws-detail \{[^}]*background: #000/);
});
