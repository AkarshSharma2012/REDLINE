import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBom } from '../src/ui/bom-import.js';
import { labelCabin } from '../src/rules/label.js';
import { sortByConcern } from '../src/ui/sort-results.js';
import { renderResultsTable } from '../src/ui/results-table.js';

const csv = await readFile(new URL('../data/sample-bom-rover.csv', import.meta.url), 'utf8');
const evidence = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const conditions = {
  o2_pct: 34, pressure_kpa: 56.5, gravity_g: 0.16,
  flow_speed_cm_s: null, flow_direction: null, external_heat_flux_kw_m2: null,
};
const tiers = ['BURNED', 'NEAR', 'NOT_ESTABLISHED'];

function evaluate() {
  const { lines, errors } = parseBom(csv, evidence.materials);
  assert.deepEqual(errors, []);
  assert.deepEqual(lines.map(line => line.material_id), ['pmma', 'cotton', 'p213', 'nomex']);
  const results = labelCabin({ conditions: structuredClone(conditions), materials: lines }, evidence);
  assert.equal(results.length, lines.length);
  assert.deepEqual(results.map(row => row.material_id), lines.map(line => line.material_id));
  return { lines, results: sortByConcern(results) };
}

// A minimal DOM exercises actual displayed text and anchors in Node, without a browser.
class Element {
  constructor(tag, document) {
    this.tagName = tag; this.ownerDocument = document; this.children = [];
    this.attributes = {}; this.style = {}; this.classList = { add() {} }; this.text = '';
  }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(' '); }
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; this.text = ''; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener() {}
  all(tag) { return this.children.flatMap(child => [ ...(child.tagName === tag ? [child] : []), ...child.all(tag)]); }
}

function render(results, lines) {
  const document = {
    createElement: tag => new Element(tag, document),
    createTextNode: text => {
      const node = new Element('#text', document); node.textContent = text; return node;
    },
    getElementById: () => null,
  };
  document.head = document.createElement('head');
  const root = document.createElement('div');
  renderResultsTable(root, results, { evidence, items: lines });
  return root;
}

test('rover CSV → real engine → concern sort is deterministic over 20 complete runs', () => {
  const before = JSON.stringify(evidence);
  const baseline = evaluate();
  for (let run = 1; run < 20; run++) assert.deepEqual(evaluate(), baseline, `run ${run + 1}`);
  assert.equal(JSON.stringify(evidence), before, 'pipeline must not mutate the dataset');
  const ranks = baseline.results.map(row => {
    assert.ok(tiers.includes(row.label), `unknown label: ${row.label}`);
    return tiers.indexOf(row.label);
  });
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test('every established rover result resolves its citations to rendered NASA source links', () => {
  const { results, lines } = evaluate();
  for (const result of results.filter(row => row.label !== 'NOT_ESTABLISHED')) {
    assert.ok(result.cited.length > 0, result.material_id);
    const root = render([result], [lines.find(line => line.material_id === result.material_id)]);
    const links = root.all('a').map(link => link.href);
    for (const id of result.cited) {
      const record = evidence.evidence.find(row => row.evidence_id === id);
      assert.equal(record?.review_status, 'verified', id);
      const url = evidence.sources[record.source_key]?.url;
      assert.ok(url, `missing source URL for ${id}`);
      const parsed = new URL(url);
      assert.equal(parsed.protocol, 'https:');
      assert.match(parsed.hostname, /(^|\.)nasa\.gov$/i);
      assert.ok(links.includes(url), `source link not displayed for ${id}`);
    }
  }
});

test('rendered rover UI text and accessible labels contain no prohibited wording', () => {
  const { results, lines } = evaluate();
  const root = render(results, lines);
  const strings = [root.textContent, ...root.all('span').map(node => node.attributes['aria-label'] || '')];
  for (const text of strings) assert.doesNotMatch(text, /\bsafe\b|never burns|never tested|will burn on the moon/i);
});

test('mixed-tier sort contract is exercised even when real rover evidence has missing coverage', () => {
  // Ordering probes only: these are not observations or manufactured engine evidence.
  const probes = ['NOT_ESTABLISHED', 'NEAR', 'BURNED'].map(label => ({ material_id: 'probe', label }));
  assert.deepEqual(sortByConcern(probes).map(row => row.label), tiers);
});
