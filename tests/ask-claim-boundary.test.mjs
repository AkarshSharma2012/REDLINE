// #325: Ask output claim boundary. All answer strings here are SYNTHETIC stub probes written for
// this test (many adapted from the #319 harness); none came from the live Claude API, and no
// network call or API key is used. Passing these tests shows the structural boundary holds for
// these inputs; it is not a live-model evaluation and does not show any claim is supported.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { answerHtml, renderAsk } from '../src/ui/ask.js';
import { isDecisionRequest, screenGenerated, rowAnchor } from '../src/ui/ask-boundary.js';
import { sourceFor } from '../src/rules/retrieve.js';

const evidence = JSON.parse(readFileSync(new URL('../data/evidence.json', import.meta.url)));
const byId = new Map(evidence.evidence.map((r) => [r.evidence_id, r]));
const pin = (id) => ({ kind: 'evidence', id, score: 1, matched: [], row: byId.get(id), source: sourceFor('evidence', byId.get(id), evidence.sources) });
const GROUND = ['PSI25-B1', 'U25-01-L'].map(pin);

// Generated prose section only (the part a model wrote), and its NASA links.
const prose = (html) => (html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/) || [])[1] ?? '';
const withheld = (html) => /Live answer (withheld|not shown)/.test(html);

function host() {
  const nodes = new Map();
  const root = { innerHTML: '', querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', textContent: '', value: '', events: {},
      addEventListener(type, fn) { this.events[type] = fn; } });
    return nodes.get(selector);
  } };
  const get = (role) => root.querySelector(`[data-role="${role}"]`);
  const setKey = (k) => { get('key').value = k; get('key').events.input(); };
  return { root, get, setKey };
}
const deferred = () => { let resolve; const promise = new Promise((a) => { resolve = a; }); return { promise, resolve }; };

test('pinned rows exist with NASA sources', () => {
  for (const h of GROUND) { assert.ok(h.row, h.id); assert.match(h.source.url, /^https:\/\/[^/]*nasa\.gov\//); }
});

test('known real citation on an unsupported approval claim is never rendered as verified evidence', () => {
  const html = answerHtml('This polymer is approved for lunar cabin use [PSI25-B1].', GROUND);
  assert.ok(withheld(html));
  assert.doesNotMatch(html, /approved for lunar/);
  assert.doesNotMatch(html, /https:\/\//);
});

// Unsupported claims with real IDs. Some are caught by the coarse wording screen; the rest must
// still be shown only as unverified generated text with no NASA link on the sentence.
const UNSUPPORTED = [
  'Cleared for use inside pressurized lunar rovers without added fire controls [PSI25-B1].',
  'This film is non-flammable in lunar cabins [PSI25-B1].',
  'This film is safe for lunar cabins [PSI25-B1].',
  'Because the film extinguished in microgravity, it will also self-extinguish in a lunar habitat [PSI25-B1].',
  'PMMA is approved for lunar cabin use [PSI25-B1, PSI99-Z9].',
  'PMMA is rated for lunar use [NASA-STD-6001 approved].',
  'At 0.16 g the PMMA sample extinguished at 18% O2 [U25-01-L].',
  'Nomex extinguished at 13.5% O2 in simulated lunar gravity [U25-01-L].',
  'NASA has determined this material meets every requirement for Artemis cabins [PSI25-B1].',
];
for (const text of UNSUPPORTED) {
  test(`unsupported claim stays outside verified evidence: ${text.slice(0, 50)}`, () => {
    const html = answerHtml(text, GROUND);
    if (withheld(html)) return assert.doesNotMatch(html, /https:\/\//);
    assert.match(html, /data-role="generated" data-verified="false"/);
    assert.match(html, /Unverified: not checked against the rows/);
    assert.match(html, /does not show the row supports the sentence/);
    assert.doesNotMatch(prose(html), /https?:|target="_blank"/);
    // The NASA link only appears in the exact-row section, next to data copied from the row.
    for (const m of html.matchAll(/<a href="https:[^"]+"/g)) assert.ok(m.index > html.indexOf('data-role="cited-rows"'));
  });
}

test('wording screen is a backstop for obvious decision wording, not a verifier', () => {
  for (const t of ['It is safe.', 'Certified for flight.', 'Nonflammable.', 'It is non flammable.', 'It will not burn there.', 'It cannot ignite.', 'Recommended for cabins.'])
    assert.equal(screenGenerated(t).reason, 'wording', t);
  // A false number passes the screen: only the structural label protects it.
  assert.equal(screenGenerated('It extinguished at 18% O2 [U25-01-L].').ok, true);
});

test('unknown and missing citations are caveated', () => {
  assert.match(answerHtml('PMMA burned at 21% O2 [PSI99-Z9].', GROUND), /PSI99-Z9, which is not among the retrieved rows[\s\S]*cites no retrieved row/);
  assert.match(answerHtml('PMMA burned at 21% O2.', GROUND), /cites no retrieved row/);
  assert.match(answerHtml('PMMA burned [PSI25-B1].', []), /PSI25-B1, which is not among/);
  assert.doesNotMatch(answerHtml('not found in the sources reviewed.', GROUND), /Caveat|data-verified/);
});

test('ordinary grounded answer: in-page citation, exact row copy with NASA link and draft caveat', () => {
  const html = answerHtml('At 0.16 g simulated lunar gravity, the PMMA sample reached five-second extinction at 13.5% O2 [U25-01-L].', GROUND);
  assert.match(prose(html), /\[<a href="#ask-row-U25-01-L">U25-01-L<\/a>\]/);
  assert.match(html, /<li id="ask-row-U25-01-L">/);
  assert.ok(html.includes(`href="${GROUND[1].source.url}"`));
  if (GROUND[1].row.review_status !== 'verified') assert.match(html, /U25-01-L is a draft row, not yet verified/);
});

test('multiple IDs in one bracket: each known ID linked and copied, unknown one caveated', () => {
  const html = answerHtml('Both films ignited [PSI25-B1, U25-01-L; FAKE-2].', GROUND);
  assert.match(prose(html), /\[<a href="#ask-row-PSI25-B1">PSI25-B1<\/a>, <a href="#ask-row-U25-01-L">U25-01-L<\/a>, FAKE-2\]/);
  assert.equal((html.match(/<li id="ask-row-/g) || []).length, 2);
  assert.match(html, /FAKE-2, which is not among/);
  const drafts = GROUND.filter((g) => g.row.review_status !== 'verified').map((g) => g.id);
  if (drafts.length) assert.match(html, new RegExp(`${drafts.join(', ')} (are draft rows|is a draft row)`));
});

test('Markdown and HTML injection in answers and row IDs is rendered inert', () => {
  const evil = [
    '<script>alert(1)</script> burned [PSI25-B1].',
    '[PSI25-B1](javascript:alert(1)) burned.',
    '[click](https://evil.example) **bold** <img src=x onerror=alert(1)> [PSI25-B1].',
    '"><a href="javascript:alert(1)">x</a> [PSI25-B1].',
  ];
  for (const t of evil) {
    const html = answerHtml(t, GROUND);
    assert.doesNotMatch(html, /<script|<img|javascript:alert\(1\)">|href="https:\/\/evil|<a href="javascript/i, t);
    assert.doesNotMatch(prose(html), /<a href="(?!#ask-row-)/);
  }
  const odd = { ...pin('PSI25-B1'), id: 'X"><img src=x onerror=1>' };
  const html = answerHtml(`burned [${odd.id}].`, [odd]);
  assert.doesNotMatch(html, /<img/);
  assert.equal(rowAnchor(odd.id), 'ask-row-X___img_src_x_onerror_1_');
});

test('malformed model outputs are not shown', () => {
  for (const out of [undefined, null, '', '   ', 42, {}, [], ['text'], { text: 'x [PSI25-B1]' }, 'a'.repeat(7000)])
    assert.match(answerHtml(out, GROUND), /Live answer not shown/, JSON.stringify(out)?.slice(0, 30));
});

test('no-key mode: ordinary question still returns rows with NASA links, no generated text', async () => {
  const h = host();
  const out = await renderAsk(h.root, { evidence }).ask('Which materials were tested at lunar gravity?');
  assert.ok(out.hits.length > 0);
  assert.equal(out.answer, null);
  assert.equal(out.generated, undefined);
  assert.match(h.get('hits').innerHTML, /href="https:\/\/[^"]*nasa\.gov/);
  assert.doesNotMatch(h.get('answer').innerHTML, /data-role="generated"/);
});

const DECISIONS = ['Is PMMA safe for a lunar cabin?', 'Is this polymer approved for lunar cabin use?', 'Can we use Nomex in the rover?',
  'Will Nomex burn on the Moon?', 'Predict the flame spread of PMMA at 0.16 g', 'Is the film certified for Artemis?', 'is my rover going to explode'];
for (const q of DECISIONS) {
  test(`safety/certification/prediction request gets no generated advice: ${q}`, async () => {
    const h = host();
    let calls = 0;
    const view = renderAsk(h.root, { evidence }, { requestAnswer: async () => { calls++; return 'It is fine [PSI25-B1].'; } });
    h.setKey('sk-test-not-real');
    const out = await view.ask(q);
    assert.equal(calls, 0);
    assert.equal(out.answer, null);
    assert.equal(out.boundary, 'decision-request');
    assert.match(h.get('answer').innerHTML, /does not approve, certify or predict/);
    assert.ok(Array.isArray(out.hits));
  });
}
for (const q of ['Which materials were tested at lunar gravity?', 'What oxygen level did BASS-II PMMA burn at?', 'flame spread rate of cotton in microgravity'])
  test(`ordinary retrieval question is not treated as a decision request: ${q}`, () => assert.equal(isDecisionRequest(q), false));

test('live stub answer is flagged generated and unverified in the result', async () => {
  const h = host();
  const view = renderAsk(h.root, { evidence }, { requestAnswer: async ({ hits }) => `Burned in testing at these conditions [${hits[0].id}].` });
  h.setKey('sk-test-not-real');
  const out = await view.ask('PMMA flame spread microgravity');
  assert.equal(out.generated, true);
  assert.equal(out.verified, false);
  assert.match(h.get('answer').innerHTML, /data-verified="false"/);
});

test('malformed stub output through renderAsk is not shown and not returned', async () => {
  const h = host();
  const view = renderAsk(h.root, { evidence }, { requestAnswer: async () => ({ text: 'x' }) });
  h.setKey('sk-test-not-real');
  const out = await view.ask('PMMA flame spread microgravity');
  assert.equal(out.answer, null);
  assert.match(h.get('answer').innerHTML, /Live answer not shown/);
});

for (const change of ['key edited', 'invalidate()']) {
  test(`stale response is dropped after context change: ${change}`, async () => {
    const h = host();
    const pending = deferred();
    const view = renderAsk(h.root, { evidence }, { requestAnswer: () => pending.promise });
    h.setKey('sk-test-not-real');
    const req = view.ask('PMMA flame spread microgravity');
    if (change === 'key edited') h.setKey('sk-other'); else view.invalidate();
    pending.resolve('Old answer [PSI25-B1].');
    const out = await req;
    assert.equal(out.stale, true);
    assert.doesNotMatch(h.get('answer').innerHTML, /Old answer/);
  });
}

test('generated Ask text has no consumer outside the Ask screen', () => {
  const dir = new URL('../src/', import.meta.url);
  const files = readdirSync(dir, { recursive: true }).filter((f) => /\.(js|jsx|mjs)$/.test(f));
  for (const f of files) {
    const s = readFileSync(new URL(f.replace(/\\/g, '/'), dir), 'utf8');
    if (/ask-boundary\.js/.test(s)) assert.match(f, /ui[\\/]ask\.js$/, f);
    if (/from '\.\/ui\/ask\.js'|from '\.\/ask\.js'/.test(s)) assert.doesNotMatch(s, /answerHtml|\.ask\(/, f);
  }
});
