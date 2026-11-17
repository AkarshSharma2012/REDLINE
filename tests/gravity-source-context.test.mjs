import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { renderGravityView } from '../src/ui/gravity-view.js';

const data = JSON.parse(await readFile(new URL('../data/gravity-points.json', import.meta.url), 'utf8'));

test('source context is closed by default and retains both original articles verbatim', () => {
  const root = { innerHTML: '', addEventListener() {} };
  renderGravityView(root, { data });
  const html = root.innerHTML;
  const disclosures = [...html.matchAll(/<details\b[^>]*data-source-context[^>]*>/g)];
  assert.equal(disclosures.length, 1);
  assert.equal(disclosures[0][0], '<details data-source-context>');
  const start = disclosures[0].index;
  const end = html.indexOf('</details>', start) + '</details>'.length;
  const disclosure = html.slice(start, end);
  assert.match(disclosure, /^<details data-source-context><summary>Source context and methods<\/summary>/);
  const articles = disclosure.match(/<article>[\s\S]*?<\/article>/g);
  assert.equal(articles?.length, 2);
  assert.equal((html.match(/<article>/g) ?? []).length, 2);
  // Captured from the pre-change rendered articles: all prose, qualifiers,
  // NASA links, locators and the Marcum evidence button must stay identical.
  assert.equal(createHash('sha256').update(articles.join('\n    ')).digest('hex'),
    'a79fe57f7c9a44065cf244589833fc7eec4f7480e457499af18de6320e78f92f');
  assert.match(html, /\.gravity-view \[data-source-context\]>summary\{min-height:40px\}/);
  assert.match(html, /\.gravity-view :focus-visible\{outline:2px solid #7CB8FF;outline-offset:2px\}/);

  const before = html.slice(0, start);
  assert.match(before, /0 g \/ 1 g assumed envelope unavailable/);
  assert.match(before, /Lunar behavior may fall outside a range between 0 g and 1 g results/);
  assert.doesNotMatch(disclosure, /assumed envelope unavailable|data-evidence-detail|data-research/);
  assert.match(html.slice(end), /^<section data-evidence-detail aria-label="Selected evidence detail"><\/section><\/section>$/);

  // Draft research keeps its original selector and separate closed disclosure.
  const research = before.match(/<details data-research>[\s\S]*?<\/details>/);
  assert.ok(research);
  assert.match(research[0], /excluded from cabin results/);
});
