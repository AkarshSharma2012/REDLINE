import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { loadEvidence } from '../src/main.js';

const dataset = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const invalid = [
  null, [], {},
  ...[null, {}, 'bad', [null], [42], [{}]].map(evidence => ({ ...dataset, evidence })),
  ...[null, {}, 'bad', [null], [{}], [{ material_id: 'x', display_name: 'X', aliases: 42 }]]
    .map(materials => ({ ...dataset, materials })),
];

test('loadEvidence accepts the committed dataset and valid empty coverage', async (t) => {
  for (const data of [dataset, { ...dataset, evidence: [] }]) {
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
    assert.equal(await loadEvidence(), data);
    t.mock.restoreAll();
  }
});

test('loadEvidence rejects invalid JSON shapes with a validation error', async (t) => {
  for (const data of invalid) {
    t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
    await assert.rejects(loadEvidence(), /data\/evidence\.json: validation failed/i);
    t.mock.restoreAll();
  }
});

test('invalid evidence startup shows Retry, preserves tabs, and has no unhandled rejection', () => {
  for (const data of invalid) {
    const script = `
      import assert from 'node:assert/strict';
      class Node {
        constructor() { this.children = []; this.listeners = {}; this.attrs = {}; this.style = {}; this.classList = { add() {} }; this.ownerDocument = doc; this.text = ''; }
        set textContent(value) { this.text = value; this.children = []; }
        get textContent() { return this.text + this.children.map(c => c.textContent).join(''); }
        append(...nodes) { this.children.push(...nodes); }
        replaceChildren(...nodes) { this.children = nodes; }
        setAttribute(key, value) { this.attrs[key] = value; }
        addEventListener(key, handler) { this.listeners[key] = handler; }
        querySelector() { return null; }
      }
      const nodes = new Map();
      const doc = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Node()); return nodes.get(id); }, createElement() { return new Node(); } };
      doc.head = new Node();
      globalThis.document = doc;
      let hashchange, reloads = 0;
      globalThis.window = { addEventListener(event, handler) { if (event === 'hashchange') hashchange = handler; } };
      globalThis.location = { hash: '', reload() { reloads++; } };
      globalThis.fetch = async url => {
        if (url === 'data/evidence.json') return { ok: true, json: async () => ${JSON.stringify(data)} };
        throw new Error('optional report unavailable');
      };
      await import('./src/main.js');
      await new Promise(resolve => setImmediate(resolve));
      const status = doc.getElementById('status');
      assert.match(status.textContent, /Evidence file could not be loaded.*validation failed/);
      const retry = status.children.find(n => n.textContent === 'Retry');
      assert.ok(retry);
      retry.listeners.click();
      assert.equal(reloads, 1);
      assert.equal(doc.getElementById('dataset').textContent, '');
      assert.equal(doc.getElementById('cabin-form').children.length, 0);
      assert.doesNotMatch(doc.getElementById('results-table').textContent, /Not found in the sources reviewed/);
      location.hash = '#investigations';
      hashchange();
      assert.equal(doc.getElementById('panel-investigations').hidden, false);
      assert.equal(doc.getElementById('panel-cabin').hidden, true);
    `;
    const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', '--input-type=module', '--eval', script], {
      cwd: new URL('../', import.meta.url), encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr || String(result.error));
  }
});
