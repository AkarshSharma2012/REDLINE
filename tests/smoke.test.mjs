// Scaffold smoke test: the page and every S1 module load, and the S1 function names exist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('index.html loads src/main.js as a module', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /<script type="module" src="src\/main\.js"><\/script>/);
  assert.match(html, /href="src\/styles\.css"/);
});

test('S1 modules export the binding function names', async () => {
  const expected = {
    'src/rules/normalize.js': ['o2PartialKpa', 'gravityClass'],
    'src/rules/compare.js': ['compareRow'],
    'src/rules/label.js': ['labelMaterial', 'labelCabin'],
    'src/rules/lunar.js': ['lunarEstimate'],
    'src/rules/experiments.js': ['suggestExperiments'],
    'src/rules/baseline.js': ['baselineLabel'],
    'src/schema/validate.js': ['validateEvidence'],
    'src/ui/cabin-form.js': ['renderCabinForm'],
    'src/ui/results-table.js': ['renderResultsTable'],
    'src/ui/evidence-panel.js': ['renderEvidencePanel'],
    'src/ui/o2-slider.js': ['renderO2Slider'],
    'src/ui/fixes.js': ['renderFixes'],
    'src/main.js': ['loadEvidence'],
  };
  for (const [file, names] of Object.entries(expected)) {
    const mod = await import(new URL(file, root));
    for (const name of names) assert.equal(typeof mod[name], 'function', `${file} exports ${name}`);
  }
});

test('labelCabin returns one S1-shaped result per material', async () => {
  const { labelCabin } = await import(new URL('src/rules/label.js', root));
  const results = labelCabin(
    { conditions: { o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16 }, materials: [{ material_id: 'nomex', form: 'fabric' }] },
    { evidence: [] },
  );
  assert.equal(results.length, 1);
  assert.equal(results[0].material_id, 'nomex');
  assert.ok(['BURNED', 'NEAR', 'NOT_ESTABLISHED'].includes(results[0].label));
  for (const key of ['reason', 'cited', 'flags', 'cross_gravity', 'estimate']) assert.ok(key in results[0], key);
});

test('styles.css defines the DESIGN.md tokens and three label chips', async () => {
  const css = await readFile(new URL('src/styles.css', root), 'utf8');
  for (const token of ['--bg: #0E1013', '--ev-burned: #FF6A33', '--ev-near: #F0D545', '--ev-ne: #8EC5F0', '--accent: #7CB8FF']) {
    assert.ok(css.includes(token), token);
  }
  for (const chip of ['.chip-burned', '.chip-near', '.chip-ne']) assert.ok(css.includes(chip), chip);
});
