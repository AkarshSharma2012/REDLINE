import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateWorksheet } from '../scripts/verification-worksheet.mjs';
import { parseCsv } from '../src/schema/csv.js';

async function fixture(rows, run) {
  const dir = await mkdtemp(join(tmpdir(), 'redline-worksheet-'));
  try {
    const input = join(dir, 'evidence.csv');
    const output = join(dir, 'worksheet.md');
    const keys = [...new Set(rows.flatMap(Object.keys))];
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = '\uFEFF' + [keys, ...rows.map((r) => keys.map((k) => r[k]))]
      .map((r) => r.map(quote).join(',')).join('\r\n');
    await writeFile(input, csv);
    await generateWorksheet({ input, output, sources: { NASA: { url: 'https://ntrs.nasa.gov/paper' } } });
    await run(await readFile(output, 'utf8'), { input, output });
    assert.equal(await readFile(input, 'utf8'), csv, 'source CSV must stay byte-for-byte unchanged');
  } finally { await rm(dir, { recursive: true, force: true }); }
}

const row = (id, extra = {}) => ({ evidence_id: id, material_id: 'pmma', review_status: 'draft',
  source_key: 'NASA', source_locator: 'p. 2', ...extra });
const dataLines = (text) => text.split('\n').filter((line) => /\| \[ \] \|  \|$/.test(line));
const ids = (text) => dataLines(text).map((line) => line.split('|')[1].trim());

test('only the five exact draft material IDs, ordered lunar then ISS 21–34% then remaining', async () => {
  await fixture([
    row('remaining', { material_id: 'p213', gravity_g: '1' }),
    row('unknown', { material_id: 'cotton', gravity_g: '', facility: 'ISS', o2_pct: '21' }),
    row('lower', { material_id: 'sibal', gravity_g: '0', facility: 'ISS', o2_pct: '21' }),
    row('lunar', { material_id: 'nomex', gravity_g: '0.16' }),
    row('upper', { gravity_g: '0', facility: 'ISS', o2_pct: '34' }),
    row('initial', { gravity_g: '0', gravity_regime: 'ISS microgravity', o2_initial_calibrated_vol_pct: '22.2', o2_final_calibrated_vol_pct: '20.9' }),
    row('context', { gravity_context: 'simulated lunar centrifuge' }),
    row('below', { gravity_g: '0', facility: 'ISS', o2_pct: '20.9' }),
    row('above', { gravity_g: '0', facility: 'ISS', o2_pct: '34.1' }),
    row('final-only', { gravity_g: '0', facility: 'ISS', o2_final_calibrated_vol_pct: '23' }),
    row('test-first', { gravity_g: '0', facility: 'ISS', o2_pct: '15', o2_initial_calibrated_vol_pct: '21' }),
    row('not-iss', { gravity_g: '0', facility: 'free-flyer', o2_pct: '21' }),
    row('excluded', { material_id: 'ptfe', material: 'pmma' }),
    row('verified', { review_status: 'verified' }),
    row('reviewed', { review_status: 'reviewed' }),
  ], async (text, { input, output }) => {
    assert.deepEqual(ids(text), ['lunar', 'context', 'lower', 'upper', 'initial', 'remaining', 'unknown', 'below', 'above', 'final-only', 'test-first', 'not-iss']);
    assert.match(text, /initial 22.2 %; final 20.9 %/);
    assert.match(text, /not stated \| not stated \| not stated/);
    for (const line of dataLines(text)) assert.equal(line.split('|').length, 12);
    await generateWorksheet({ input, output, sources: { NASA: { url: 'https://ntrs.nasa.gov/paper' } } });
    assert.equal(await readFile(output, 'utf8'), text, 'generation must be deterministic');
  });
});

test('preserves claims, locators and provenance while keeping caveats outside table', async () => {
  await fixture([
    row('A', { o2_pct: '24', pressure_kpa: '101.3', gravity_g: '0.16', endpoint: 'LOC-FS',
      value: '23', value_unit: '% O2', value_qualifier: 'approximately', outcome: 'spread',
      observation_paraphrase: 'A | B\nsecond line <tag>', caveat: 'Shared | caveat',
      uncertainty: 'plot read', source_url: 'https://ntrs.nasa.gov/evidence', source_locator: 'p. 3 | Fig. 1',
      condition_source_url: 'https://psi.nasa.gov/conditions', condition_source_locator: 'Table 2',
      observation_source_url: 'https://ntrs.nasa.gov/observation', observation_source_locator: 'p. 4' }),
    row('B', { caveat: 'Shared | caveat', source_url: 'javascript:alert(1)' }),
    row('C', { source_key: '', source_url: '' }),
  ], async (text) => {
    const [table, caveats] = text.split('## Caveats');
    assert.match(table, /LOC-FS; approximately 23 % O2; spread; A &#124; B second line &lt;tag&gt;/);
    assert.match(table, /24 % \| 101.3 kPa \| 0.16 g/);
    assert.match(table, /\[S1\]\(<https:\/\/ntrs.nasa.gov\/evidence>\)/);
    assert.match(table, /\[S3\]\(<https:\/\/ntrs.nasa.gov\/observation>\)/);
    assert.match(table, /\[S2\]\(<https:\/\/psi.nasa.gov\/conditions>\)/);
    assert.match(table, /S2: Table 2; S3: p. 4/);
    // The general source locator is retained even when the observation has its own citation.
    assert.match(table, /p. 3 &#124; Fig. 1/);
    assert.doesNotMatch(table, /Shared|plot read/);
    assert.equal((caveats.match(/Shared &#124; caveat/g) || []).length, 1);
    assert.match(caveats, /A, B: Shared/);
    assert.match(caveats, /Uncertainty: plot read/);
    assert.doesNotMatch(text, /\]\(<javascript:/);
    assert.match(text, /verifies nothing/);
    assert.match(text, /Regeneration clears/);
    assert.match(text, /Verified by \/ date/);
    assert.doesNotMatch(text, /\[x\]/i);
  });
});

test('metadata fallback and empty draft inventory', async () => {
  await fixture([row('A')], async (text) => {
    assert.match(text, /\[S1\]\(<https:\/\/ntrs.nasa.gov\/paper>\)/);
    assert.match(text, /S1: p. 2/);
  });
  await fixture([row('excluded', { material_id: 'etfe' })], async (text) => {
    assert.equal(dataLines(text).length, 0);
    assert.match(text, /0 draft rows/);
    assert.match(text, /No draft evidence rows for the demo materials/);
  });
});

test('college student: checked-in sheet matches draft inventory across checkout line endings without changing evidence', async () => {
  const input = new URL('../data/evidence.csv', import.meta.url);
  const before = await readFile(input, 'utf8');
  const dir = await mkdtemp(join(tmpdir(), 'redline-worksheet-live-'));
  try {
    const output = join(dir, 'sheet.md');
    await generateWorksheet({ output });
    const text = await readFile(output, 'utf8');
    assert.equal(text.replace(/\r\n/g, '\n'), (await readFile(new URL('../docs/verification-demo-sheet.md', import.meta.url), 'utf8')).replace(/\r\n/g, '\n'));
    const expected = parseCsv(before).filter((r) => r.review_status === 'draft' && ['pmma', 'nomex', 'sibal', 'cotton', 'p213'].includes(r.material_id));
    assert.deepEqual(ids(text).sort(), expected.map((r) => r.evidence_id).sort());
    assert.equal(await readFile(input, 'utf8'), before);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
