import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { wireCabin } from '../src/main.js';
import { mountWorkspace } from '../src/ui/workspace.js';
import { loadAccuracyReport, accuracyViewHtml, summarizeResults, RESULTS_URL } from '../src/ui/accuracy-view.js';

const root = new URL('../', import.meta.url);
const evidence = JSON.parse(await readFile(new URL('data/evidence.json', root), 'utf8'));
const html = (await readFile(new URL('index.html', root), 'utf8')).replace(/<script\b[\s\S]*?<\/script>/g, '');

test('unpublished held-out results make no HTTP request and retain the existing not-run view', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('unpublished CSV must not be requested'); });
  const rows = await loadAccuracyReport();
  assert.deepEqual(rows, []);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
  assert.match(accuracyViewHtml(summarizeResults(rows)), /Held-out evaluation not run/);
});

test('explicit published report URLs still load and unexpected HTTP errors remain visible', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, text: async () => 'query_id,split\nq1,test\n' }));
  assert.equal((await loadAccuracyReport(RESULTS_URL))[0].query_id, 'q1');
  assert.equal(fetch.mock.calls[0].arguments[0], RESULTS_URL);
  fetch.mock.mockImplementation(async () => ({ ok: false, status: 500 }));
  await assert.rejects(loadAccuracyReport(RESULTS_URL), /HTTP 500/);
  fetch.mock.mockImplementation(async () => ({ ok: false, status: 404 }));
  assert.deepEqual(await loadAccuracyReport(RESULTS_URL), []);
});

test('desktop rover demo wiring: four materials, model selection, PMMA NASA record and provenance', async () => {
  const w = new JSDOM(html, { pretendToBeVisual: true }).window;
  const d = w.document;
  const previousEvent = globalThis.Event;
  globalThis.Event = w.Event;
  let pick;
  let modelState;
  // JSDOM has no WebGL. Exercise the actual lazy-load/selection bridge with a viewer
  // adapter here; the coordinator separately checks the real headless WebGL canvas.
  const workspace = mountWorkspace({ document: d, window: w, motion: null, storage: null,
    loadViewer: async () => ({ mountRoverViewer: async (_host, options) => {
      pick = options.onSelectMaterial;
      return { update: state => { modelState = state; }, setVisible() {}, destroy() {} };
    } }),
  });
  try {
    workspace.setEvidence(evidence);
    wireCabin(evidence, { document: d, workspace });
    d.getElementById('rover-demo').click();
    assert.deepEqual([...d.querySelectorAll('#ws-materials [data-material-id]')].map(b => b.dataset.materialId),
      ['pmma', 'cotton', 'p213', 'nomex']);
    d.getElementById('ws-load-model').click();
    assert.ok(await workspace.viewerReady());
    assert.deepEqual(modelState.materialIds, ['pmma', 'cotton', 'p213', 'nomex']);
    pick('pmma');
    const record = [...d.querySelectorAll('#ws-sources button')].find(b => b.textContent.includes('PSI25-B1'));
    assert.ok(record, 'window selection exposes the BASS-II NASA record');
    record.click();
    const detail = d.getElementById('ws-source-detail');
    assert.match(detail.textContent, /Source and provenance/);
    assert.match(detail.textContent, /NASA\/TM[–-]20210011385/);
    assert.match(detail.textContent, /Table A\.1/);
    assert.ok([...detail.querySelectorAll('a')].some(a => /ntrs\.nasa\.gov/.test(a.href)));
  } finally {
    workspace.destroy();
    w.close();
    globalThis.Event = previousEvent;
  }
});
