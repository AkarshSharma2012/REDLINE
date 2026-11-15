import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, hitsTableHtml, renderAsk } from '../src/ui/ask.js';

// Synthetic presentation fixtures, not research observations.
test('Ask summaries retain values and render readable ASCII separators', () => {
  const hit = { id: 'fixture', kind: 'evidence', row: {
    material: 'Example <polymer> & "sample"', form: "sheet's",
    o2_pct: 21.5, pressure_kpa: 101.3, gravity_g: 0,
    flow_direction: 'opposed', flow_speed_cm_s: 2.5,
    endpoint: 'spread', value: 0.25, value_unit: 'mm/s',
    observation_paraphrase: 'Fixture <only> & unchanged.',
  } };
  const before = structuredClone(hit);
  assert.equal(summarize(hit), 'Example <polymer> & "sample" (sheet\'s) | O2 21.5% | 101.3 kPa | 0 g (microgravity) | flow opposed 2.5 cm/s | spread 0.25 mm/s. Fixture <only> & unchanged.');
  const html = hitsTableHtml([hit]);
  assert.ok(html.includes('Example &lt;polymer&gt; &amp; &quot;sample&quot; (sheet&#39;s) | O2 21.5% | 101.3 kPa | 0 g (microgravity) | flow opposed 2.5 cm/s | spread 0.25 mm/s. Fixture &lt;only&gt; &amp; unchanged.'));
  assert.deepEqual(hit, before);

  for (const field of ['objective', 'objectives']) {
    const investigation = { kind: 'investigation', row: {
      name: { value: 'Example <name>' }, fuel: { value: 'Example & fuel' },
      [field]: { value: 'Example "objective"' },
    } };
    assert.equal(summarize(investigation), 'Example <name> | Example & fuel | Example "objective"');
    assert.ok(hitsTableHtml([investigation]).includes('Example &lt;name&gt; | Example &amp; fuel | Example &quot;objective&quot;'));
  }
  assert.doesNotMatch(html, /[^\x00-\x7f]/);
});

test('Ask citation locators retain text and escape source fields', () => {
  const hit = { id: 'fixture', kind: 'insight', row: { text: 'Fixture' }, source: {
    url: 'https://ntrs.nasa.gov/example?a=1&b="two"',
    title: 'Example <title> & "paper"', locator: 'Table <2> & "row\'s"',
  } };
  const before = structuredClone(hit);
  const html = hitsTableHtml([hit]);
  assert.ok(html.includes('href="https://ntrs.nasa.gov/example?a=1&amp;b=&quot;two&quot;"'));
  assert.ok(html.includes('Example &lt;title&gt; &amp; &quot;paper&quot;'));
  assert.ok(html.includes('<span class="text-3">- Table &lt;2&gt; &amp; &quot;row&#39;s&quot;</span>'));
  assert.doesNotMatch(html, /[^\x00-\x7f]/);
  assert.deepEqual(hit, before);
});

test('Ask live request displays readable pending punctuation', async () => {
  const nodes = new Map();
  const root = { querySelector(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: '', textContent: '', innerHTML: '', listeners: {},
      addEventListener(name, handler) { this.listeners[name] = handler; },
    });
    return nodes.get(selector);
  } };
  const status = () => root.querySelector('[data-role="status"]').textContent;
  const view = renderAsk(root, { evidence: { evidence: [
    { evidence_id: 'fixture', material_id: 'example', endpoint: 'spread' },
  ], materials: [], sources: {} } }, { requestAnswer: async () => {
    assert.equal(status(), 'Asking Claude using only the retrieved rows...');
    return 'Fixture [fixture]';
  } });
  const key = root.querySelector('[data-role="key"]');
  key.value = 'fixture-key';
  key.listeners.input();
  const result = await view.ask('example');
  assert.equal(result.answer, 'Fixture [fixture]');
  assert.equal(status(), '');
});
