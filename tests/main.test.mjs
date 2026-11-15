// B9 integration: main.js helpers, rover demo preset and the tabbed layout in index.html.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TABS, ROVER_DEMO, tabFromHash, verifiedOnly, withQueries } from '../src/main.js';
import { labelCabin } from '../src/rules/label.js';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('data/evidence.json', root), 'utf8'));
const html = await readFile(new URL('index.html', root), 'utf8');

test('Cabin Check is the first screen; unknown hashes fall back to it', () => {
  assert.equal(TABS[0], 'cabin');
  assert.deepEqual(TABS, ['cabin', 'investigations', 'gravity', 'oxygen', 'accuracy', 'ask']);
  assert.equal(tabFromHash(''), 'cabin');
  assert.equal(tabFromHash('#nope'), 'cabin');
  assert.equal(tabFromHash('#gravity'), 'gravity');
});

test('index.html has one tab and one panel per screen, only the first visible', () => {
  for (const tab of TABS) {
    assert.match(html, new RegExp(`id="tab-${tab}"[^>]*aria-controls="panel-${tab}"`), tab);
    const panel = html.match(new RegExp(`<[a-z]+ id="panel-${tab}"[^>]*>`))?.[0];
    assert.ok(panel, `panel-${tab}`);
    assert.equal(/\shidden\b/.test(panel), tab !== TABS[0], `panel-${tab} hidden state`);
  }
  for (const id of ['investigations-root', 'ask-root', 'cabin-form', 'results-table', 'evidence-panel', 'fixes', 'gravity-view', 'o2-slider', 'accuracy-view', 'rover-demo', 'status', 'dataset']) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
});

test('header shows Prevention / Detection / Suppression framing and the 0 g / 1 g bound note', () => {
  assert.match(html, /Prevention · Detection · Suppression/);
  assert.match(html, /no partial-gravity data in PSI yet/);
  assert.match(html, /estimate beside 0 g and 1 g results/);
});

test('no banned wording in the page or main.js', async () => {
  const main = await readFile(new URL('src/main.js', root), 'utf8');
  for (const text of [html, main]) {
    for (const banned of [/\bsafe\b/i, /never burns/i, /never tested/i, /will burn on the moon/i]) {
      assert.doesNotMatch(text.replace(/<style>[\s\S]*?<\/style>/, ''), banned);
    }
  }
});

test('rover demo uses only materials in evidence.json, with form and use set', () => {
  const ids = new Set(evidence.materials.map((m) => m.material_id));
  assert.ok(ROVER_DEMO.items.length >= 4);
  for (const item of ROVER_DEMO.items) {
    assert.ok(ids.has(item.material_id), item.material_id);
    assert.ok(item.form && item.use && item.name, item.material_id);
  }
  // The form's default atmosphere is the sourced exploration preset the demo relies on.
  const preset = evidence.cabin_presets.find((p) => p.o2_pct === 34);
  assert.ok(preset?.source_key && evidence.sources[preset.source_key], 'exploration preset is sourced');
});

test('verifiedOnly passes only verified rows to the engine', () => {
  const ev = { sources: {}, evidence: [{ review_status: 'verified' }, { review_status: 'draft' }] };
  assert.equal(verifiedOnly(ev).evidence.length, 1);
  assert.equal(ev.evidence.length, 2, 'input unchanged');
  assert.deepEqual(verifiedOnly(null).evidence, []);
});

test('rover demo flows through labelCabin; each result carries its query snapshot', () => {
  const query = {
    conditions: { o2_pct: 34, pressure_kpa: 56.5, flow_speed_cm_s: null, flow_direction: null, gravity_g: 0.16, external_heat_flux_kw_m2: null },
    materials: ROVER_DEMO.items.map((m, i) => ({ item_id: `i${i}`, ...m })),
  };
  const results = withQueries(labelCabin(query, verifiedOnly(evidence)), query);
  assert.equal(results.length, ROVER_DEMO.items.length);
  results.forEach((r, i) => {
    assert.equal(r.material_id, ROVER_DEMO.items[i].material_id);
    assert.equal(r.query.material_id, r.material_id);
    assert.equal(r.query.o2_pct, 34);
    assert.equal(r.query.gravity_g, 0.16);
    assert.equal(r.query.form, ROVER_DEMO.items[i].form);
    assert.ok(Object.isFrozen(r.query));
  });
});
