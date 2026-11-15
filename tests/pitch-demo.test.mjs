// Issue #233: current demo data-path rehearsal. No browser/server or NASA validation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ROVER_DEMO, evaluateCabin } from '../src/main.js';
import { buildCabinQuery } from '../src/ui/cabin-query.js';
import { buildO2Preview } from '../src/ui/o2-slider.js';
import { labelCabin } from '../src/rules/label.js';
import { retrieve } from '../src/rules/retrieve.js';

const evidence = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const pitch = await readFile(new URL('../docs/pitch.md', import.meta.url), 'utf8');

test('current pitch inventory matches checked-in data', () => {
  const verified = evidence.evidence.filter(row => row.review_status === 'verified').length;
  assert.ok(pitch.includes(`**${evidence.evidence.length} rows and zero verified rows**`));
  assert.equal(verified, 0);
  assert.ok(pitch.includes(evidence.built_from));
});

test('current rover and 30% oxygen preview retain four missing-evidence results', () => {
  const state = {
    conditions: { o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16,
      flow_speed_cm_s: '', flow_direction: '', external_heat_flux_kw_m2: '' },
    materials: structuredClone(ROVER_DEMO.items),
  };
  const original = structuredClone(state);
  const missing = rows => {
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.map(row => row.material_id), ROVER_DEMO.items.map(item => item.material_id));
    for (const row of rows) {
      assert.equal(row.label, 'NOT_ESTABLISHED');
      assert.equal(row.reason, 'NE-no-data');
      assert.deepEqual(row.cited, []);
    }
  };
  missing(evaluateCabin(state, evidence));
  const query = buildCabinQuery(state);
  assert.equal(query.conditions.flow_speed_cm_s, null, 'unknown flow stays unknown');
  const previewQuery = structuredClone(query);
  previewQuery.conditions.o2_pct = 30;
  const preview = buildO2Preview(previewQuery, evidence, labelCabin);
  missing(preview.items);
  assert.equal(preview.verifiedRows, 0);
  assert.deepEqual(preview.counts, { BURNED: 0, NEAR: 0, NOT_ESTABLISHED: 4 });
  assert.deepEqual({ ...previewQuery.conditions, o2_pct: 34 }, query.conditions);
  assert.deepEqual(previewQuery.materials, query.materials);
  assert.deepEqual(state, original, 'evaluation and preview preserve original cabin');
});

test('current lunar question retrieves source-linked unverified evidence without generation', () => {
  const { hits } = retrieve('Which materials were tested at lunar gravity?', { evidence });
  const rows = hits.filter(hit => hit.kind === 'evidence');
  assert.ok(rows.length > 0);
  for (const hit of rows) {
    assert.notEqual(hit.row.review_status, 'verified');
    assert.ok(hit.row.source_locator);
    const url = new URL(hit.source.url);
    assert.equal(url.protocol, 'https:');
    assert.match(url.hostname, /(^|\.)nasa\.gov$/);
  }
});
