import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TABS, tabFromHash } from '../src/main.js';
import { SUBVIEWS } from '../src/ui/section-nav.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const tabs = [...html.matchAll(/<button\b([^>]*\brole="tab"[^>]*)>([\s\S]*?)<\/button>/g)];

test('Model leads the four-section navigation and is the initial and fallback view (#337)', () => {
  assert.match(tabs[0][1], /id="tab-model"/);
  assert.match(tabs[0][1], /aria-selected="true"/);
  assert.match(tabs[0][2], /^Model$/);
  assert.match(html, /<section\b(?=[^>]*id="panel-model")(?![^>]*\bhidden)[^>]*>/);
  assert.equal(tabFromHash(''), 'model');
  assert.equal(tabFromHash('#unknown'), 'model');
  assert.deepEqual(tabs.map((tab) => tab[1].match(/id="tab-([^"]+)"/)[1]), TABS);
  assert.deepEqual(tabs.map((tab) => tab[2].replace(/<[^>]+>/g, '').trim()), ['Model', 'Evidence', 'Investigations', 'Review brief']);
  for (const id of TABS.slice(1)) assert.match(html, new RegExp(`<section\\b[^>]*id="panel-${id}"[^>]*\\bhidden`), id);
});

for (const view of ['investigations', 'gravity', 'accuracy', 'ask', 'oxygen']) {
  test(`${view} stays reachable with a persistent Research preview explanation`, () => {
    assert.equal(tabFromHash(`#${view}`), view);
    // Reachable from a top tab or from its section's sub-view links.
    if (SUBVIEWS[view]) assert.match(html, new RegExp(`<nav class="subnav"[\\s\\S]*?<a href="#${view}">`));
    else assert.ok(tabs.some((tab) => tab[1].includes(`id="tab-${view}"`)));
    const container = SUBVIEWS[view]
      ? html.match(new RegExp(`<section\\b[^>]*id="panel-${view}"[^>]*>([\\s\\S]*?)<\\/section>`))
      : html.match(new RegExp(`<div id="${view}-main"[^>]*>([\\s\\S]*?)<\\/div>\\s*<section`));
    assert.ok(container, view);
    if (SUBVIEWS[view]) assert.match(container[0].split('>')[0], /\bhidden/);
    assert.match(container[1], /<aside\b[^>]*class="research-preview"[\s\S]*?Research preview[\s\S]*?<p>[\s\S]+?<\/p>[\s\S]*?<\/aside>\s*<div/);
    assert.match(container[1], /review|evaluation/);
  });
}

test('preview explanations address incomplete scores and missing citations', () => {
  assert.match(html, /tied zero scores[^<]+/i);
  assert.match(html, /No source given[^<]+/);
  assert.doesNotMatch(html, /\bTODO\b|\bplaceholder\b/i);
});
