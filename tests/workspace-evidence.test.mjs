// #277 source browser: real dataset counts, filtering, record detail, material controls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterSources, describeRecord, reviewOptions, renderSourceBrowser, renderSourceDetail,
  renderMaterialControls, formatCondition } from '../src/ui/workspace-evidence.js';
import { ROVER_DEMO } from '../src/main.js';
import { makeDoc } from './fixtures/workspace-dom.mjs';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('data/evidence.json', root), 'utf8'));
const rows = evidence.evidence;
const verifiedCount = rows.filter(r => r.review_status === 'verified').length;
const banned = /\bsafe\b|never\s+burns|never\s+tested|will\s+burn\s+on\s+the\s+moon|nonflammable|fire[ -]safe/i;

test('counts come from the loaded dataset: total, matched and verified stay distinct', () => {
  const all = filterSources(evidence);
  assert.equal(all.ok, true);
  assert.equal(all.total, rows.length);
  assert.equal(all.matched, rows.length);
  assert.equal(all.verified, verifiedCount);
  const onlyVerified = filterSources(evidence, { review: 'verified' });
  assert.equal(onlyVerified.total, rows.length, 'total never shrinks with filters');
  assert.equal(onlyVerified.matched, verifiedCount);
  assert.deepEqual(reviewOptions(evidence), ['all', ...new Set(rows.map(r => r.review_status))].sort((a, b) => (a === 'all' ? -1 : b === 'all' ? 1 : a < b ? -1 : 1)));
});

test('text filter searches material, investigation, evidence ID and source title; material scope narrows', () => {
  const pmma = filterSources(evidence, { text: 'PMMA' });
  assert.ok(pmma.matched > 0 && pmma.matched < rows.length);
  for (const r of pmma.rows) assert.match([r.material, r.material_id, r.investigation, r.evidence_id, r.source_key, evidence.sources[r.source_key]?.title].join(' '), /pmma/i);
  const scoped = filterSources(evidence, { materialId: 'cotton' });
  assert.equal(scoped.matched, rows.filter(r => r.material_id === 'cotton').length);
  assert.ok(scoped.rows.every(r => r.material_id === 'cotton'));
  assert.equal(filterSources(evidence, { text: 'zz-no-such-record-zz' }).matched, 0);
});

test('missing or malformed evidence is reported as unavailable, never as zero coverage', () => {
  for (const bad of [null, undefined, {}, { evidence: 'x' }, 42]) {
    const r = filterSources(bad);
    assert.equal(r.ok, false);
    assert.equal(r.rows.length, 0);
  }
  const mixed = filterSources({ sources: {}, evidence: [null, 7, { evidence_id: 'X1', review_status: 'draft', material_id: 'pmma' }] });
  assert.equal(mixed.ok, true);
  assert.equal(mixed.total, 1, 'non-object rows are skipped, not counted');
});

test('record description keeps units, citation, locator and inspection-only state', () => {
  const row = rows.find(r => r.o2_pct !== null && r.pressure_kpa !== null) ?? rows[0];
  const d = describeRecord(row, evidence.sources);
  assert.equal(d.id, row.evidence_id);
  assert.equal(d.status, row.review_status);
  assert.equal(d.inspectOnly, row.review_status !== 'verified');
  assert.equal(d.locator, row.source_locator);
  assert.equal(d.citation.title, evidence.sources[row.source_key].title);
  assert.match(d.citation.url, /^https:\/\/([\w-]+\.)*nasa\.gov\//);
  assert.equal(d.citation.nasa, true);
  const labels = d.conditions.map(([k]) => k);
  assert.deepEqual(labels, ['Oxygen', 'Pressure', 'Gravity', 'Form', 'Facility',
    ...(row.evidence_id === 'U25-01-L' ? ['Endpoint'] : [])]);
  assert.equal(formatCondition(null, 'kPa'), 'Not stated');
  assert.equal(formatCondition(56.5, 'kPa'), '56.5 kPa');
  const unsafe = describeRecord({ evidence_id: 'Z', source_key: 'BAD' }, { BAD: { title: 'T', url: 'javascript:alert(1)' } });
  assert.equal(unsafe.citation.url, null, 'only http(s) source URLs become links');
});

const click = (el) => el.dispatch('click');

test('browser renders counts, the zero-verified state and the full list without emptying it', () => {
  const doc = makeDoc(); const host = doc.createElement('div'); doc.body.append(host);
  const picks = [];
  renderSourceBrowser(host, { evidence, state: {}, onSelect: id => picks.push(id), onFilter: () => {} });
  const text = host.textContent;
  assert.match(text, new RegExp(`Total ${rows.length}`));
  assert.match(text, new RegExp(`Matched ${rows.length}`));
  assert.match(text, new RegExp(`Verified ${verifiedCount}`));
  if (verifiedCount === 0) assert.match(text, /0 verified rows: labels are not produced; records below are inspection only/);
  const cards = host.all(n => n.tagName === 'BUTTON' && n.getAttribute('data-evidence-id'));
  assert.equal(cards.length, rows.length);
  click(cards[2]);
  assert.deepEqual(picks, [rows[2].evidence_id]);
  assert.ok(host.all('input').some(i => i.getAttribute('type') === 'search'), 'native text filter');
  assert.ok(host.all('label').length >= 2, 'filters are labelled');
  assert.doesNotMatch(text, banned);
});

test('filter controls report changes through onFilter with sanitized values', () => {
  const doc = makeDoc(); const host = doc.createElement('div'); doc.body.append(host);
  const seen = [];
  renderSourceBrowser(host, { evidence, state: { materialId: 'pmma' }, onSelect() {}, onFilter: f => seen.push(f) });
  assert.match(host.textContent, /Material: pmma/);
  const search = host.all('input')[0]; search.value = '  BASS  '; search.dispatch('input');
  const select = host.all('select')[0]; select.value = 'not-a-status'; select.dispatch('change');
  const clear = host.all('button').find(b => /Show all materials/.test(b.textContent)); click(clear);
  assert.equal(seen[0].text, 'BASS');
  assert.equal(seen[1].review, 'all', 'unknown review status falls back to all');
  assert.equal(seen[2].materialId, null);
});

test('unavailable evidence keeps a readable message and no fabricated counts', () => {
  const doc = makeDoc(); const host = doc.createElement('div'); doc.body.append(host);
  renderSourceBrowser(host, { evidence: null, state: {}, onSelect() {}, onFilter() {} });
  assert.match(host.textContent, /Source records unavailable/);
  assert.doesNotMatch(host.textContent, /Total \d|Verified \d/);
});

test('detail shows original citation and test context; Escape closes and restores focus', () => {
  const doc = makeDoc(); const host = doc.createElement('div'); doc.body.append(host);
  const opener = doc.createElement('button'); doc.body.append(opener); opener.focus();
  const row = rows[0];
  let closed = 0;
  renderSourceDetail(host, row, evidence, { opener, onClose: () => closed++ });
  const text = host.textContent;
  assert.match(text, new RegExp(row.evidence_id));
  assert.match(text, new RegExp(row.source_locator.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(text, /Inspection only: draft record, not used for any label/);
  assert.match(text, /Not certification/);
  const link = host.all('a').find(a => a.href === evidence.sources[row.source_key].url);
  assert.ok(link, 'original citation link');
  assert.equal(link.target, '_blank');
  assert.ok(host.all('a').some(a => a.href === 'https://www.nasa.gov/psi/'), 'PSI repository cited');
  assert.ok(host.all('details').length >= 1, 'long notes behind an explicit disclosure');
  const ev = host.dispatch('keydown', { key: 'Escape' });
  assert.equal(ev.defaultPrevented, true);
  assert.equal(closed, 1);
  assert.equal(doc.activeElement, opener);
  assert.equal(host.children.length, 0);
  assert.doesNotMatch(text, banned);
});

test('material controls list the requested cabin items with review counts and pressed state', () => {
  const doc = makeDoc(); const host = doc.createElement('div'); doc.body.append(host);
  const picks = [];
  renderMaterialControls(host, { items: ROVER_DEMO.items, evidence, selectedId: 'cotton', onSelect: id => picks.push(id) });
  const buttons = host.all('button');
  assert.deepEqual(buttons.map(b => b.getAttribute('data-material-id')), ['pmma', 'cotton', 'p213', 'nomex']);
  assert.deepEqual(buttons.map(b => b.getAttribute('aria-pressed')), ['false', 'true', 'false', 'false']);
  for (const id of ['pmma', 'cotton', 'p213', 'nomex']) {
    const n = rows.filter(r => r.material_id === id).length;
    const v = rows.filter(r => r.material_id === id && r.review_status === 'verified').length;
    assert.match(host.textContent, new RegExp(`${n} source records? · ${v} verified`));
  }
  click(buttons[3]);
  assert.deepEqual(picks, ['nomex']);
  const empty = doc.createElement('div');
  renderMaterialControls(empty, { items: [], evidence, onSelect() {} });
  assert.match(empty.textContent, /Load the lunar rover demo or add cabin items/);
});

test('workspace modules never write untrusted HTML', async () => {
  for (const f of ['workspace.js', 'workspace-evidence.js', 'workspace-motion.js']) {
    const src = await readFile(new URL(`src/ui/${f}`, root), 'utf8');
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, f);
    assert.doesNotMatch(src, /MutationObserver/, f);
    assert.ok(src.split('\n').length < 500, `${f} under 500 lines`);
    assert.doesNotMatch(src, banned, f);
  }
});
