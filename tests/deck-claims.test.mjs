// #344: numbers and sources quoted in the submitted deck must match the app data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeRecord, filterSources } from '../src/ui/workspace-evidence.js';

const load = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const evidence = load('data/evidence.json');
const rows = evidence.evidence;

test('deck: 45 evidence records, 0 human verified, 6 NASA sources', () => {
  assert.equal(rows.length, 45);
  assert.equal(filterSources(evidence).verified, 0);
  assert.equal(new Set(rows.map((r) => r.source_key)).size, 6);
});

test('deck: 26 PSI catalog entries', () => {
  assert.equal(load('data/investigations.json').investigations.length, 26);
});

test('deck: per-material record counts PMMA 18, Nomex 7, Cotton 2, P213 tape 1', () => {
  const count = (id) => filterSources(evidence, { materialId: id }).matched;
  assert.deepEqual([count('pmma'), count('nomex'), count('cotton'), count('p213')], [18, 7, 2, 1]);
});

test('deck: every record links to a NASA source page in the Sources view', () => {
  for (const row of rows) {
    const d = describeRecord(row, evidence.sources);
    assert.ok(d.citation.url, `${row.evidence_id} has no source URL`);
    assert.equal(d.citation.nasa, true, `${row.evidence_id} source not recognised as NASA`);
    assert.ok(d.locator, `${row.evidence_id} has no locator`);
  }
});

test('deck: MIST black acrylic about 16.2% O2 (ISS) vs about 18.8% (ground), Task Book FY2025 p.3', () => {
  const mist = Object.fromEntries(rows.filter((r) => r.source_key === 'M25').map((r) => [r.gravity_g, r]));
  assert.equal(mist[0].value, 16.2);
  assert.equal(mist[1].value, 18.8);
  for (const r of Object.values(mist)) {
    assert.match(r.source_locator, /p\. 3/);
    assert.match(evidence.sources.M25.title, /MIST.*Task Book FY2025/);
    assert.equal(describeRecord(r, evidence.sources).citation.nasa, true);
  }
});

test('deck: 34% O2 / 56.5 kPa preset cites NASA BVAD 2022 Sec 4.6.3.6', () => {
  const preset = evidence.cabin_presets.find((p) => p.o2_pct === 34 && p.pressure_kpa === 56.5);
  assert.ok(preset);
  assert.match(evidence.sources[preset.source_key].title, /Life Support Baseline Values and Assumptions/);
  assert.equal(evidence.sources[preset.source_key].year, 2022);
  assert.match(preset.source_locator, /4\.6\.3\.6/);
});
