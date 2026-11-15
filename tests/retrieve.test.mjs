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

// #129: isolated synthetic search fixtures, not scientific observations.
// Keep numeric-distance behavior explicit: retrieve() scores tokens, not proximity.
const searchRow = (evidence_id, fields = {}) => ({
  evidence_id,
  material_id: 'nomex',
  endpoint: 'spread',
  gravity_g: null,
  pressure_kpa: null,
  ...fields,
});
const searchData = (rows) => ({ evidence: { evidence: rows, materials: [], sources: {} } });
const ranked = (question, rows, options) => retrieve(question, searchData(rows), options).hits;

test('unit: descending ranking follows weighted identity, material, endpoint and text fields', () => {
  const rows = [
    searchRow('D', { notes: 'needle' }),
    searchRow('C', { endpoint: 'needle' }),
    searchRow('B', { material_id: 'needle' }),
    searchRow('needle'),
  ];
  assert.deepEqual(ranked('needle', rows).map(({ id, score }) => [id, score]),
    [['needle', 4], ['B', 3], ['C', 2], ['D', 1]]);
  assert.deepEqual(ranked('needle', rows, { limit: 2 }).map(({ id }) => id), ['needle', 'B']);
  assert.deepEqual(ranked('needle', rows, { limit: 0 }), []);
});

test('unit: equal scores use ascending IDs rather than input order', () => {
  const hits = ranked('spread', [searchRow('C'), searchRow('A'), searchRow('B')]);
  assert.deepEqual(hits.map(({ id, score }) => [id, score]), [['A', 2], ['B', 2], ['C', 2]]);
});

test('unit: empty, stop-word-only, unmatched and absent-data searches have no results', () => {
  const rows = [searchRow('A')];
  for (const question of ['', 'what is the', 'zzqunmatched']) {
    assert.deepEqual(ranked(question, rows), [], question);
  }
  assert.deepEqual(retrieve('spread').hits, []);
  assert.deepEqual(ranked('spread', []), []);
});

test('unit: exact material outranks a synonym and a condition-only match', () => {
  const rows = [searchRow('A'), searchRow('B', { material_id: 'acrylic' }),
    searchRow('C', { material_id: 'pmma' })];
  assert.deepEqual(ranked('pmma spread', rows).map(({ id, score }) => [id, score]),
    [['C', 5], ['B', 3.5], ['A', 2]]);
  // A synonym alone is insufficient: at least one original query term must match.
  assert.deepEqual(ranked('pmma', rows).map(({ id }) => id), ['C']);
  assert.deepEqual(ranked('pmm', rows), [], 'material substrings are not fuzzy matches');
});

test('unit: material display names and aliases provide exact search matches', () => {
  const fixture = searchData([searchRow('A', { material_id: 'polymer' })]);
  fixture.evidence.materials = [{ material_id: 'polymer', display_name: 'Example polymer', aliases: ['lucite'] }];
  const { hits } = retrieve('lucite', fixture);
  assert.deepEqual(hits.map(({ id, score }) => [id, score]), [['A', 3]]);
  assert.deepEqual(hits[0].matched, [{ term: 'lucite', field: 'display_name' }]);
});

test('unit: gravity matches exact numeric tokens; nearer nonmatches receive no distance bonus', () => {
  const rows = [searchRow('A', { gravity_g: 1 }), searchRow('B', { gravity_g: 0 }),
    searchRow('C', { gravity_g: 0.16 })];
  assert.deepEqual(ranked('spread 0.16', rows).map(({ id, score }) => [id, score]),
    [['C', 6], ['A', 2], ['B', 2]]);
  assert.equal(ranked('spread microgravity', rows)[0].id, 'B');
});

test('unit: pressure matches exact numeric tokens; nearer nonmatches receive no distance bonus', () => {
  const rows = [searchRow('A', { pressure_kpa: 101.3 }),
    searchRow('B', { pressure_kpa: 57 }), searchRow('C', { pressure_kpa: 56.5 })];
  assert.deepEqual(ranked('spread 56.5', rows).map(({ id, score }) => [id, score]),
    [['C', 3], ['A', 2], ['B', 2]]);
});

test('unit: shuffled rows preserve complete hits and limited tie selection without mutating inputs', () => {
  const rows = [searchRow('D', { notes: 'needle' }), searchRow('C', { endpoint: 'needle' }),
    searchRow('B', { material_id: 'needle' }), searchRow('A', { material_id: 'needle' })];
  const before = structuredClone(rows);
  const expected = ranked('needle', rows);
  for (const order of [[3, 2, 1, 0], [1, 3, 0, 2], [2, 0, 3, 1]]) {
    const shuffled = order.map((index) => rows[index]);
    assert.deepEqual(ranked('needle', shuffled), expected);
    assert.deepEqual(ranked('needle', shuffled, { limit: 1 }), expected.slice(0, 1));
    assert.deepEqual(shuffled, order.map((index) => before[index]));
  }
  assert.deepEqual(rows, before);
});
