import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hitsTableHtml, renderAsk } from '../src/ui/ask.js';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('Ask scrollport contains absolute screen-reader citations instead of overflowing the page', () => {
  assert.match(css, /#ask-root\s+\.table-scroll\s*\{[^}]*position:\s*relative\s*;/);
  assert.match(css, /\.table-scroll\s*\{[^}]*overflow-x:\s*auto\s*;/);
});

test('populated Ask retains the scroll wrapper and every full NASA citation', () => {
  const nodes = new Map();
  const root = { innerHTML: '', querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { addEventListener() {} });
    return nodes.get(selector);
  } };
  renderAsk(root);
  assert.match(root.innerHTML, /class="table-scroll" data-role="hits"/);
  const hits = Array.from({ length: 8 }, (_, i) => ({
    id: `ROW-${i}`, kind: 'investigation', row: { name: 'Long source description '.repeat(30) },
    source: { title: `NASA source ${i} ${'citation'.repeat(80)}`, url: `https://ntrs.nasa.gov/citations/${i}` },
  }));
  const html = hitsTableHtml(hits);
  assert.equal((html.match(/<tr>/g) || []).length, 9);
  for (const hit of hits) {
    assert.ok(html.includes(`href="${hit.source.url}"`));
    assert.ok(html.includes(hit.source.title));
  }
});
