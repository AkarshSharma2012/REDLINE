import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TABS, tabFromHash } from '../src/main.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const tabs = [...html.matchAll(/<button\b([^>]*\brole="tab"[^>]*)>([\s\S]*?)<\/button>/g)];

test('Cabin Check leads navigation and is the initial and fallback view', () => {
  assert.match(tabs[0][1], /id="tab-cabin"/);
  assert.match(tabs[0][1], /aria-selected="true"/);
  assert.match(tabs[0][2], /Cabin Check/);
  assert.match(html, /<main\b(?=[^>]*id="panel-cabin")(?![^>]*\bhidden)[^>]*>/);
  assert.equal(tabFromHash(''), 'cabin');
  assert.equal(tabFromHash('#unknown'), 'cabin');
  assert.deepEqual(tabs.map((tab) => tab[1].match(/id="tab-([^"]+)"/)[1]), TABS);
});

for (const view of ['investigations', 'gravity', 'accuracy', 'ask', 'oxygen']) {
  test(`${view} stays reachable with a persistent Research preview explanation`, () => {
    const tab = tabs.find((entry) => entry[1].includes(`id="tab-${view}"`));
    assert.ok(tab);
    assert.match(tab[2], /Research preview/);
    assert.equal(tabFromHash(`#${view}`), view);
    const panel = html.match(new RegExp(`<section\\b[^>]*id="panel-${view}"[^>]*>([\\s\\S]*?)<\\/section>`));
    assert.ok(panel);
    assert.match(panel[0].split('>')[0], /\bhidden/);
    assert.match(panel[1], /<aside\b[^>]*class="research-preview"[\s\S]*?Research preview[\s\S]*?<p>[\s\S]+?<\/p>[\s\S]*?<\/aside>\s*<div/);
    assert.match(panel[1], /review|evaluation/);
  });
}

test('preview explanations address incomplete scores and missing citations', () => {
  assert.match(html, /tied zero scores[^<]+/i);
  assert.match(html, /No source given[^<]+/);
  assert.doesNotMatch(html, /\bTODO\b|\bplaceholder\b/i);
});
