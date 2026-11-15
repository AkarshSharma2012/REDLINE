import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { retrieve } from '../src/rules/retrieve.js';

export const DEFAULT_SIZES = [1_000, 10_000, 50_000];
export const LIMIT_MS = 200;
const QUESTION = 'acrylic oxygen';

// Synthetic retrieval workload only: these are not experimental observations.
export function syntheticData(size) {
  if (!Number.isSafeInteger(size) || size < 1) throw new RangeError('Size must be a positive safe integer');
  return {
    evidence: {
      sources: {},
      materials: [],
      evidence: Array.from({ length: size }, (_, i) => ({
        evidence_id: `SYNTHETIC-${String(i).padStart(8, '0')}`,
        material_id: i % 2 ? 'cotton' : 'pmma',
        material: i % 2 ? 'synthetic cotton' : 'synthetic acrylic',
        endpoint: 'burn/no-burn',
        gravity_g: i % 2,
        notes: 'Synthetic oxygen retrieval benchmark; no measured result',
        review_status: 'draft',
      })),
    },
  };
}

export function benchmark(sizes = DEFAULT_SIZES) {
  // Warm module/JIT paths using a small separate dataset; no timed result is discarded.
  retrieve(QUESTION, syntheticData(100));
  return sizes.map(size => {
    const data = syntheticData(size);
    const start = performance.now();
    const result = retrieve(QUESTION, data);
    const elapsedMs = performance.now() - start;
    if (!result.hits.length) throw new Error('Benchmark query returned no hits');
    return { rows: size, elapsedMs, hits: result.hits.length };
  });
}

export function exceedsBudget(results) {
  return results.some(result => result.rows === 10_000 && result.elapsedMs > LIMIT_MS);
}

export function formatReport(results) {
  return [
    'Synthetic retrieval benchmark (one full retrieve call; setup excluded)',
    'Rows       Time (ms)   Hits',
    ...results.map(r => `${String(r.rows).padEnd(10)} ${r.elapsedMs.toFixed(2).padStart(9)}   ${r.hits}`),
    `10k budget: <= ${LIMIT_MS} ms; ${exceedsBudget(results) ? 'FAIL' : 'PASS'}`,
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const results = benchmark();
  console.log(formatReport(results));
  if (exceedsBudget(results)) process.exitCode = 1;
}
