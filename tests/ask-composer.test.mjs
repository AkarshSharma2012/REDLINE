// #339 (B1 fallback): visible composer, example chips, readable source cards. Synthetic-free:
// uses the actual evidence file and the local retriever; no network and no generated text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { renderAsk } from '../src/ui/ask.js';
import { caveatsFor, nextCheckFor, resultsSummaryHtml, EXAMPLE_QUESTIONS } from '../src/ui/ask-results.js';

const evidence = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
function mount() {
  const w = new JSDOM('<!doctype html><head></head><body><div id="ask-root"></div></body>').window;
  let calls = 0;
  const api = renderAsk(w.document.getElementById('ask-root'), { evidence }, { requestAnswer: async () => { calls++; return 'x'; } });
  return { w, d: w.document, api, calls: () => calls };
}

test('composer is a labelled multiline field with a worded primary action and example chips', () => {
  const { d } = mount();
  const field = d.getElementById('ask-question');
  assert.equal(field.tagName, 'TEXTAREA');
  assert.equal(d.querySelector('label[for="ask-question"]').textContent, 'Ask about the NASA combustion tests');
  assert.match(field.getAttribute('placeholder'), /For example/);
  assert.equal(d.querySelector('button[type="submit"]').textContent, 'Find evidence');
  assert.match(d.querySelector('.ask-mode').textContent, /Local evidence search.*nothing sent anywhere/);
  assert.deepEqual([...d.querySelectorAll('[data-example]')].map((b) => b.textContent), [...EXAMPLE_QUESTIONS]);
});

test('example chip fills the field and runs local search with source cards; no API call without a key', async () => {
  const { d, calls } = mount();
  d.querySelector('[data-example="Which PMMA tests ran in microgravity?"]').click();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(d.getElementById('ask-question').value, 'Which PMMA tests ran in microgravity?');
  const cards = d.querySelectorAll('[data-role="source-card"]');
  assert.ok(cards.length >= 1 && cards.length <= 3);
  const text = cards[0].textContent;
  assert.match(text, /draft, not verified/);
  assert.match(text, /Next research check:/);
  assert.match(text, /Why it may not answer your question/);
  assert.ok(cards[0].querySelector('a[href^="https://"]'), 'source link adjacent to the record');
  assert.match(d.querySelector('[data-role="summary"]').textContent, /not an answer/);
  assert.equal(calls(), 0);
});

test('Enter submits, Shift+Enter does not; empty question gets guidance', () => {
  const { w, d } = mount();
  const field = d.getElementById('ask-question');
  field.value = '';
  d.querySelector('[data-role="form"]').dispatchEvent(new w.Event('submit', { cancelable: true }));
  assert.match(d.querySelector('[data-role="status"]').textContent, /Enter a question/);
  field.value = 'nomex';
  field.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, cancelable: true }));
  assert.equal(d.querySelector('[data-role="summary"]').textContent, '');
  field.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
  assert.match(d.querySelector('[data-role="summary"]').textContent, /What matched/);
});

test('no match, unknown conditions and injected text are handled without invention', () => {
  const none = resultsSummaryHtml([], [], () => '');
  assert.match(none, /No record matched/);
  const hit = { id: '<b>X</b>', kind: 'evidence', row: { material: '<img src=x onerror=1>', review_status: 'draft', o2_pct: null, pressure_kpa: 0 },
    source: { locator: 'Table 1' }, matched: [{ term: 'pmma' }] };
  const html = resultsSummaryHtml([hit], ['lunar'], () => 'link');
  assert.ok(!html.includes('<img') && !html.includes('<b>X'));
  assert.match(html, /0 kPa/, '0 stays 0');
  const why = caveatsFor(hit, ['lunar']).join(' ');
  assert.match(why, /not verified/); assert.match(why, /does not state: .*oxygen/); assert.match(why, /No retrieved record mentions: lunar/);
  assert.match(nextCheckFor(hit), /at Table 1/);
  assert.doesNotMatch(html + why, /\bsafe\b|confidence|probability|risk score/i);
});
