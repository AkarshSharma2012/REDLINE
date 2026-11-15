import test from 'node:test';
import assert from 'node:assert/strict';
import { collectLinks, checkLinks, renderReport } from '../scripts/check-links.mjs';

test('collects and deduplicates metadata and quoted multiline CSV URLs', () => {
  const links = collectLinks({ sources: { A: { url: 'https://nasa.gov/a' } }, nested: ['https://nasa.gov/b'] },
    '\uFEFFid,notes,source_url\r\n1,"quoted ""text"",\nand more",https://nasa.gov/a\r\n2,,https://nasa.gov/c\r\n');
  assert.deepEqual(links.map(l => l.url), ['https://nasa.gov/a', 'https://nasa.gov/b', 'https://nasa.gov/c']);
  assert.equal(links[0].locations.length, 2);
  assert.match(links[0].locations[1], /row 2 \(source_url\)/);
});

test('HEAD success, GET fallback, HTTP failure and network recovery with polite delays', async () => {
  const calls = [], delays = [];
  const statuses = [200, 405, 200, 404, 404, new Error('offline'), 200, new Error('offline'), new Error('offline')];
  let cancelled = 0;
  const results = await checkLinks(['a', 'b', 'c', 'd', 'e'].map(url => ({ url, locations: [] })), {
    fetchImpl: async (url, options) => {
      calls.push([url, options.method]);
      assert.equal(options.redirect, 'follow');
      assert.ok(options.signal instanceof AbortSignal);
      const status = statuses.shift();
      if (status instanceof Error) throw status;
      return { status, body: { cancel: async () => { cancelled++; } } };
    }, wait: async ms => delays.push(ms),
  });
  assert.deepEqual(results.map(r => r.status), ['200', '200', '404', '200', 'UNREACHABLE']);
  assert.deepEqual(calls.map(c => c[1]), ['HEAD', 'HEAD', 'GET', 'HEAD', 'GET', 'HEAD', 'GET', 'HEAD', 'GET']);
  assert.deepEqual(delays, Array(8).fill(250));
  assert.equal(cancelled, 6);
});

test('timeouts abort requests and continue through remaining URLs', async () => {
  const signals = [];
  const results = await checkLinks([{ url: 'slow', locations: [] }, { url: 'next', locations: [] }], {
    timeoutMs: 5, wait: async () => {},
    fetchImpl: (url, { signal }) => {
      if (url === 'next') return Promise.resolve({ status: 204 });
      signals.push(signal);
      return new Promise(() => {});
    },
  });
  assert.equal(results[0].status, 'UNREACHABLE');
  assert.equal(results[1].status, '204');
  assert.ok(signals.every(signal => signal.aborted));
});

test('report includes status codes, unreachable results and escaped locations', () => {
  const report = renderReport([{ url: 'https://nasa.gov/a', head: '405', get: 'UNREACHABLE', status: 'UNREACHABLE', locations: ['a|b\nc'] }], new Date('2026-11-14T00:00:00Z'));
  assert.match(report, /405 \| UNREACHABLE \| UNREACHABLE/);
  assert.match(report, /a&#124;b c/);
  assert.match(report, /2026-11-14T00:00:00.000Z/);
  assert.match(renderReport([]), /0 unique source URLs/);
});
