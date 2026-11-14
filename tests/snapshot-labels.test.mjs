import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evidenceUrl, goldenUrl, snapshotLabels } from '../scripts/update-golden.mjs';

const actual = snapshotLabels(JSON.parse(readFileSync(evidenceUrl, 'utf8')));
const golden = JSON.parse(readFileSync(goldenUrl, 'utf8'));

// Union catches additions and removals as well as changed outputs. Separate
// tests retain Node's expected/actual diff and print every affected row ID.
for (const id of [...new Set([...Object.keys(actual), ...Object.keys(golden)])].sort()) {
  test(`label snapshot: evidence row ${id}`, () => {
    assert.ok(Object.hasOwn(actual, id), `Evidence row removed: ${id}`);
    assert.ok(Object.hasOwn(golden, id), `Golden missing evidence row: ${id}`);
    assert.deepStrictEqual(actual[id], golden[id],
      `Label snapshot changed for evidence row ${id}. Review the diff; regenerate with node scripts/update-golden.mjs`);
  });
}
