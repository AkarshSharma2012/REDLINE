import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { countCoverageBySource, renderCoverageBySource } from '../scripts/coverage-by-source.mjs';

// Inline synthetic S1-shaped fixture: this task owns no fixture files.
function fixture() {
  const row = { evidence_id: 'one', source_key: 'NASA', source_locator: 'Synthetic fixture p. 1', investigation: 'BASS-II', review_status: 'draft' };
  return { sources: { NASA: { url: 'https://ntrs.nasa.gov/citations/20210011385' } }, evidence: [
    row, { ...row, evidence_id: 'two' }, { ...row, evidence_id: 'three', review_status: 'verified' },
    { ...row, evidence_id: 'four', investigation: null }, { ...row, evidence_id: 'five', investigation: '' },
    { ...row, evidence_id: 'six', investigation: 'Other | [test]' },
  ] };
}

test('counts each source, investigation and status tuple without mutating input', () => {
  const data = fixture();
  data.sources.SECOND = data.sources.NASA;
  data.evidence.push({ ...data.evidence[0], source_key: 'SECOND', evidence_id: 'seven' });
  const before = structuredClone(data);
  assert.deepEqual(countCoverageBySource(data).map((g) => [g.source_key, g.investigation, g.review_status, g.count]), [
    ['NASA', null, 'draft', 2], ['NASA', 'BASS-II', 'draft', 2], ['NASA', 'BASS-II', 'verified', 1],
    ['NASA', 'Other | [test]', 'draft', 1], ['SECOND', 'BASS-II', 'draft', 1],
  ]);
  assert.deepEqual(data, before);
});

test('renders citations, locators, missing investigations and deterministic escaped Markdown', () => {
  const data = fixture();
  const report = renderCoverageBySource(data);
  assert.match(report, /Total evidence rows: \*\*6\*\*/);
  assert.match(report, /Not specified/);
  assert.match(report, /Other &#124; &#91;test&#93;/);
  assert.match(report, /https:\/\/ntrs.nasa.gov\/citations\/20210011385/);
  assert.match(report, /one: Synthetic fixture p. 1/);
  data.evidence.reverse();
  assert.equal(renderCoverageBySource(data), report);
  assert.match(renderCoverageBySource({ evidence: [] }), /No evidence rows/);
});

test('rejects malformed data and missing provenance', () => {
  assert.throws(() => countCoverageBySource({}), /evidence array/);
  for (const field of ['source_key', 'review_status', 'evidence_id', 'source_locator']) {
    const data = fixture(); data.evidence[0][field] = '';
    assert.throws(() => renderCoverageBySource(data));
  }
  const data = fixture(); data.sources.NASA.url = 'javascript:alert(1)';
  assert.throws(() => renderCoverageBySource(data), /Invalid source URL/);
});

test('CLI writes a report and leaves output intact on invalid input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-coverage-'));
  try {
    const input = join(dir, 'input.json'); const output = join(dir, 'docs', 'coverage.md');
    const script = fileURLToPath(new URL('../scripts/coverage-by-source.mjs', import.meta.url));
    await writeFile(input, JSON.stringify(fixture()));
    execFileSync(process.execPath, [script, input, output]);
    assert.equal(await readFile(output, 'utf8'), renderCoverageBySource(fixture()));
    await writeFile(input, '{}');
    assert.throws(() => execFileSync(process.execPath, [script, input, output], { stdio: 'pipe' }));
    assert.equal(await readFile(output, 'utf8'), renderCoverageBySource(fixture()));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
