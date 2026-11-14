// #68: Ask REDLINE retrieval (src/rules/retrieve.js) and live-mode plumbing (src/ui/ask.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { retrieve, queryTerms, tokenize, buildPrompt, citationsIn, isNotFound, NOT_FOUND, SYSTEM_PROMPT } from '../src/rules/retrieve.js';
import { askClaude, answerHtml, hitsTableHtml, relatedInsights, summarize, esc, API_URL } from '../src/ui/ask.js';

const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
const evidence = await read('../data/evidence.json');
const insights = await read('../data/insights.json');
const investigations = await read('./fixtures/investigations.sample.json');
const data = { evidence, insights, investigations };

test('tokenize keeps decimals and drops stop words', () => {
  assert.deepEqual(tokenize('What is the O2 limit at 0.16 g?'), ['o2', 'limit', '0.16', 'g']);
  assert.ok(queryTerms('moon').some((t) => t.term === 'lunar' && t.weight === 0.5));
});

test('lunar question ranks simulated-lunar evidence first', () => {
  const { hits } = retrieve('Which materials were tested at lunar gravity?', data);
  assert.ok(hits.length > 0);
  const top = hits.filter((h) => h.kind === 'evidence').slice(0, 3);
  for (const h of top) assert.equal(h.row.gravity_g, 0.16, h.id);
});

test('material + condition question finds the matching rows with source links', () => {
  const { hits } = retrieve('nomex oxygen limit microgravity', data);
  const ev = hits.filter((h) => h.kind === 'evidence');
  assert.ok(ev.length);
  assert.ok(ev.every((h) => h.row.material_id === 'nomex' || h.row.gravity_g === 0));
  assert.equal(ev[0].id, 'OF12-NOMEX-0G-MOCSTAR');
  for (const h of hits) if (h.kind === 'evidence') assert.match(h.source.url, /^https:\/\/(ntrs\.nasa\.gov|psi\.nasa\.gov|taskbook\.nasaprs\.com)/);
});

test('catalog investigations and insights are retrievable', () => {
  const { hits } = retrieve('BASS-II airflow suppression', data);
  assert.ok(hits.some((h) => h.kind === 'investigation' && h.id === 'BASS-II'));
  assert.ok(hits.some((h) => h.kind === 'insight' && h.id === 'INS-BASS-II'));
  assert.ok(hits.find((h) => h.id === 'BASS-II').source.url.startsWith('https://psi.nasa.gov/'));
});

test('acrylic alias reaches PMMA rows; unrelated question retrieves nothing', () => {
  assert.ok(retrieve('acrylic', data).hits.some((h) => h.row.material_id === 'pmma'));
  assert.deepEqual(retrieve('rocket propellant thrust', data).hits, []);
  assert.deepEqual(retrieve('', data).hits, []);
});

test('retrieval is deterministic and respects the limit', () => {
  const a = retrieve('PMMA flame spread opposed flow', data, { limit: 5 });
  const b = retrieve('PMMA flame spread opposed flow', data, { limit: 5 });
  assert.equal(a.hits.length, 5);
  assert.deepEqual(a.hits.map((h) => h.id), b.hits.map((h) => h.id));
  for (let i = 1; i < a.hits.length; i++) assert.ok(a.hits[i - 1].score >= a.hits[i].score);
});

test('prompt contains only the retrieved rows and the grounding rules', () => {
  const { hits } = retrieve('nomex lunar', data, { limit: 8 });
  const { system, messages } = buildPrompt('nomex lunar', hits);
  assert.match(system, /ONLY from the rows/);
  assert.ok(system.includes(NOT_FOUND));
  assert.match(system, /cite/i);
  const user = messages[0].content;
  const sent = [...user.matchAll(/"id":"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sent, hits.filter((h) => h.kind !== 'insight').map((h) => h.id));
  assert.ok(hits.some((h) => h.kind === 'insight'), 'question retrieves an insight');
  assert.ok(!sent.some((id) => id.startsWith('INS-')), 'AI-written insights are never sent as sources');
  assert.ok(!user.includes('null'), 'null fields are not sent');
});

test('citationsIn separates retrieved ids from made-up ones', () => {
  const hits = [{ id: 'A-1' }, { id: 'B-2' }];
  assert.deepEqual(citationsIn('x [A-1]. y [B-2, Z-9].', hits), { cited: ['A-1', 'B-2'], unknown: ['Z-9'] });
  assert.ok(isNotFound('Not found in the sources reviewed.'));
  assert.ok(!isNotFound('PMMA burned [A-1].'));
});

test('askClaude sends only the prompt rows to the Messages API with the user key', async () => {
  const { hits } = retrieve('nomex lunar', data, { limit: 2 });
  let call;
  const fetchImpl = async (url, opts) => {
    call = { url, opts };
    return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'Nomex [OF12-NOMEX-L-MOCSTAR].' }] }) };
  };
  const answer = await askClaude({ apiKey: 'sk-test', question: 'nomex lunar', hits, fetchImpl });
  assert.equal(answer, 'Nomex [OF12-NOMEX-L-MOCSTAR].');
  assert.equal(call.url, API_URL);
  assert.equal(call.opts.headers['x-api-key'], 'sk-test');
  assert.equal(call.opts.headers['anthropic-dangerous-direct-browser-access'], 'true');
  const body = JSON.parse(call.opts.body);
  assert.equal(body.system, SYSTEM_PROMPT);
  assert.equal(body.messages.length, 1);
  assert.deepEqual(body.messages, buildPrompt('nomex lunar', hits).messages);
  await assert.rejects(askClaude({ apiKey: 'bad', question: 'q', hits, fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: { message: 'invalid x-api-key' } }) }) }), /invalid x-api-key/);
});

test('answer rendering escapes HTML, links citations and flags unknown ones', () => {
  const { hits } = retrieve('nomex lunar', data, { limit: 3 });
  const id = hits.find((h) => h.kind === 'evidence').id;
  const html = answerHtml(`<img src=x onerror=alert(1)> ok [${id}] and [FAKE-1].`, hits);
  assert.ok(!html.includes('<img'));
  assert.match(html, new RegExp(`<a href="https://[^"]+"[^>]*>${id}</a>`));
  assert.match(html, /FAKE-1, which is not among the retrieved rows/);
  assert.match(answerHtml('PMMA burned.', hits), /cites no retrieved row/);
  assert.doesNotMatch(answerHtml(`${NOT_FOUND}.`, hits), /Caveat/);
});

test('no-key view: table shows sources, unknowns as "not stated", and related insights', () => {
  const { hits } = retrieve('BASS-II PMMA', data);
  const html = hitsTableHtml(hits);
  assert.match(html, /psi\.nasa\.gov|ntrs\.nasa\.gov/);
  const b1 = hits.find((h) => h.id === 'PSI25-B1') || retrieve('PSI25-B1', data).hits[0];
  assert.match(summarize(b1), /O2 not stated/);
  assert.ok(relatedInsights(hits, insights).some((i) => i.insight_id === 'INS-BASS-II'));
  assert.match(hitsTableHtml([]), /not found in the sources reviewed/);
  assert.equal(esc('<a "x">'), '&lt;a &quot;x&quot;&gt;');
});
