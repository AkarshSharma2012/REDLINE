import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const [published, metadata] = await Promise.all([
  load('../data/evidence.json'),
  load('../data/metadata.json'),
]);

// S1 §4.2 endpoint vocabulary, extended by V2 C1. There is no result_type
// field in the binding schema: endpoint identifies the result being reported.
const endpoints = new Set([
  'LOC-FS', 'LOC-FR', 'quench-limit', 'blowoff-limit', 'MOC-T1',
  'LOI-D2863', 'ignition', 'spread-rate', 'burn/no-burn',
  'MOC', 'ULOI', 'extinction-5s',
]);
const outcomes = new Set(['spread', 'no-spread', 'quenched', 'blowoff', 'no-ignition', 'consumed']);
const statuses = new Set(['draft', 'reviewed', 'verified']);
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const httpsUrl = (value) => {
  if (!nonEmpty(value)) return false;
  try { return new URL(value).protocol === 'https:'; }
  catch { return false; }
};

test('published evidence has rows and a metadata source dictionary', () => {
  assert.ok(Array.isArray(published.evidence) && published.evidence.length > 0);
  assert.ok(metadata.sources && typeof metadata.sources === 'object' && !Array.isArray(metadata.sources));
});

// Collect every offending ID, rather than stopping at the first incomplete row.
function checkRows(name, predicate, requirement, todo = false) {
  (todo ? test.todo : test)(name, () => {
    const problems = published.evidence.flatMap((row, index) => predicate(row)
      ? [] : [`${row.evidence_id ?? `row ${index}`}: ${requirement}`]);
    assert.deepEqual(problems, [], problems.join('\n'));
  });
}

test('every evidence row has a nonempty unique evidence_id', () => {
  const seen = new Set();
  const problems = [];
  for (const [index, row] of published.evidence.entries()) {
    if (!nonEmpty(row.evidence_id)) problems.push(`row ${index}: missing evidence_id`);
    else if (seen.has(row.evidence_id)) problems.push(`${row.evidence_id}: duplicate evidence_id`);
    seen.add(row.evidence_id);
  }
  assert.deepEqual(problems, [], problems.join('\n'));
});

checkRows('every source_key exists in data/metadata.json',
  (row) => nonEmpty(row.source_key) && Object.hasOwn(metadata.sources, row.source_key),
  'source_key must reference metadata.sources');

// S1 stores the primary URL in sources, not on every evidence row. Check
// both the authoritative metadata and the dictionary shipped to the browser.
checkRows('every row resolves to an HTTPS source URL',
  (row) => httpsUrl(metadata.sources[row.source_key]?.url)
    && httpsUrl(published.sources?.[row.source_key]?.url)
    && (row.source_url == null || httpsUrl(row.source_url)),
  'primary source URLs (and source_url when supplied) must use HTTPS');

checkRows('every row has a page/figure/table/section source_locator',
  (row) => nonEmpty(row.source_locator),
  'source_locator must contain the source location (S1 §4.2)');

checkRows('every review_status is draft, reviewed or verified',
  (row) => statuses.has(row.review_status),
  'unknown or missing review_status');

// Issue #87 requests completeness for EVERY row, including drafts. These
// checks deliberately report nulls; they do not redefine schema validity.
// S1 permits unknown draft values; S4 §9 / V2 C3 also permit unknown pressure
// on verified rows. Preserve those unknowns in data and report the gaps.
checkRows('every row has finite O2 percent between 0 and 100 inclusive',
  (row) => Number.isFinite(row.o2_pct) && row.o2_pct >= 0 && row.o2_pct <= 100,
  'o2_pct must be a finite number in [0, 100]; null is incomplete', true); // todo: draft rows still lack O2 until verified

checkRows('every row has finite pressure above zero',
  (row) => Number.isFinite(row.pressure_kpa) && row.pressure_kpa > 0,
  'pressure_kpa must be a finite number > 0; null is incomplete', true); // todo: draft rows still lack pressure until verified

checkRows('every row has a known result endpoint and any outcome is known',
  (row) => endpoints.has(row.endpoint)
    && (row.outcome === null || outcomes.has(row.outcome))
    && (row.endpoint !== 'burn/no-burn' || outcomes.has(row.outcome)),
  'endpoint must be a known S1/V2 result type; outcome must be known when supplied or required', true); // todo: 15 draft BASS rows have no endpoint until a human verifies them
