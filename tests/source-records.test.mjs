import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderSourceBrowser, renderSourceDetail, describeRecord } from '../src/ui/workspace-evidence.js';
import { makeDoc } from './fixtures/workspace-dom.mjs';
const evidence = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const css = await readFile(new URL('../src/styles/source-records.css', import.meta.url), 'utf8');
function host() { const doc = makeDoc(); const root = doc.createElement('div'); doc.body.append(root); return { doc, root }; }

test('record list aligns labelled conditions, preserves order and exposes selection', () => {
  const { root } = host(); const picked = [];
  const selectedId = evidence.evidence[3].evidence_id;
  const result = renderSourceBrowser(root, { evidence, state: { selectedId }, onSelect: id => picked.push(id) });
  assert.deepEqual([...result.cards.keys()], evidence.evidence.map(r => r.evidence_id));
  for (const [id, button] of result.cards) {
    assert.equal(button.getAttribute('aria-pressed'), String(id === selectedId));
    const cells = button.all(n => n.className === 'ws-record-condition');
    assert.equal(cells.length, 3);
    assert.deepEqual(cells.map(n => n.children[0].textContent), ['Oxygen', 'Pressure', 'Gravity']);
  }
  result.cards.get(selectedId).click(); assert.deepEqual(picked, [selectedId]);
});

test('no results clear action resets every filter and focuses replacement search', () => {
  const { doc, root } = host(); let updated;
  const onFilter = state => { updated = state; renderSourceBrowser(root, { evidence, state, onFilter }); };
  renderSourceBrowser(root, { evidence, state: { text: 'missing-zzzz', materialId: 'pmma', review: 'draft' }, onFilter });
  assert.match(root.textContent, /No records match.*Clear filters/);
  root.all('button').find(b => b.textContent === 'Clear filters').click();
  assert.deepEqual(updated, { text: '', review: 'all', materialId: null });
  assert.equal(doc.activeElement, doc.getElementById('ws-filter-text'));
  assert.equal(root.all(n => n.getAttribute('data-evidence-id')).length, evidence.evidence.length);
});

test('every record remains inspectable; details preserve source values, notes and native disclosure', () => {
  const before = JSON.stringify(evidence);
  for (const row of evidence.evidence) {
    const { root, doc } = host(); const opener = doc.createElement('button'); doc.body.append(opener);
    renderSourceDetail(root, row, evidence, { opener });
    assert.match(root.textContent, /Method notes and record fields/);
    if (row.notes) assert.ok(root.textContent.includes(row.notes));
    assert.ok(root.textContent.includes(describeRecord(row, evidence.sources).locator));
    const disclosures = root.all('details'); assert.equal(disclosures.length, 2);
    assert.equal(disclosures[0].open, true);
    assert.equal(disclosures[0].children[0].tagName, 'SUMMARY');
    assert.ok(root.all('a').some(a => a.href === 'https://www.nasa.gov/psi/'));
    root.dispatch('keydown', { key: 'Escape' }); assert.equal(doc.activeElement, opener);
  }
  assert.equal(JSON.stringify(evidence), before);
});

test('U25 correction stays explicit in detail and nominal gravity in list', () => {
  const row = evidence.evidence.find(r => r.evidence_id === 'U25-01-L'); const { root } = host();
  const result = renderSourceBrowser(root, { evidence });
  assert.match(result.cards.get(row.evidence_id).textContent, /1\/6 g.*0.16 g project normalization/);
  renderSourceDetail(root, row, evidence);
  for (const phrase of ['HOLD', 'sheet (inferred, not source-stated)', '13.5 mol% O2', 'five-second', '0.8 mm', '56.5 kPa']) assert.ok(root.textContent.includes(phrase), phrase);
});

test('long and missing values remain available without unsafe markup or URL protocols', () => {
  const { root } = host(); const row = { evidence_id: 'X', material: 'M'.repeat(500), notes: '<script>literal</script>', source_key: 'bad' };
  const data = { evidence: [row], sources: { bad: { url: 'javascript:alert(1)' } } };
  renderSourceBrowser(root, { evidence: data }); assert.ok(root.textContent.includes(row.material));
  renderSourceDetail(root, row, data); assert.match(root.textContent, /Not stated/);
  assert.ok(root.textContent.includes(row.notes)); assert.equal(root.all('script').length, 0);
  assert.equal(root.all('a').length, 1);
  assert.match(css, /overflow-wrap: anywhere/); assert.doesNotMatch(css, /max-height|line-clamp/);
});

test('source stylesheet preserves black, native focus and minimum readable type contracts', () => {
  assert.match(css, /background: #000/); assert.match(css, /:focus-visible/);
  assert.match(css, /grid-template-columns: 1fr 1fr 1.35fr/);
  assert.match(css, /font-variant-numeric: tabular-nums/);
  assert.doesNotMatch(css, /font-size:\s*(?:[0-9]|1[01])px|gradient|blur\(/);
  assert.doesNotMatch(css, /position:\s*(?:fixed|absolute)/);
});

test('existing text tokens meet AA on black and hover surfaces using WCAG luminance', () => {
  const luminance = hex => {
    const v = hex.match(/[a-f\d]{2}/gi).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return v[0] * .2126 + v[1] * .7152 + v[2] * .0722;
  };
  for (const text of ['E8EAED', 'A9B0BB', '8A929E']) for (const bg of ['000000', '1E2228']) {
    assert.ok((luminance(text) + .05) / (luminance(bg) + .05) >= 4.5, `${text} on ${bg}`);
  }
});

test('static entrypoint keeps source module reachable without build or remote dependencies', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const shell = await readFile(new URL('../src/ui/workspace.js', import.meta.url), 'utf8');
  assert.match(html, /id="ws-sources"/); assert.match(html, /id="ws-source-detail"/);
  assert.match(shell, /from '\.\/workspace-evidence.js'/);
  const source = await readFile(new URL('../src/ui/workspace-evidence.js', import.meta.url), 'utf8');
  assert.ok(source.split('\n').length < 500); assert.doesNotMatch(source, /from ['"]https?:/);
  // B2 owns index.html and adds source-records.css during shell integration.
});
