import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildEvidence } from '../scripts/build-evidence.mjs';
import { parseCsv, toCsv } from '../src/schema/csv.js';

// Time is an explicit build input; the production default intentionally uses now.
const builtAt = '2026-11-14T12:00:00.000Z';

for (const reversed of [false, true]) {
  test(`evidence build is byte-identical for repeated ${reversed ? 'reversed' : 'original'} CSV input`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), 'redline-determinism-'));
    t.after(() => rm(directory, { recursive: true, force: true }));

    const csv = await readFile(new URL('../data/evidence.csv', import.meta.url), 'utf8');
    const rows = parseCsv(csv).slice(0, 3);
    assert.equal(rows.length, 3, 'fixture must contain multiple evidence rows');
    if (reversed) rows.reverse();

    const input = join(directory, 'evidence.csv');
    const metadata = join(directory, 'metadata.json');
    await writeFile(input, toCsv(Object.keys(rows[0]), rows));
    await writeFile(metadata, await readFile(new URL('../data/metadata.json', import.meta.url)));

    const first = join(directory, 'first.json');
    const second = join(directory, 'second.json');
    await buildEvidence({ input, metadata, output: first, builtAt });
    await buildEvidence({ input, metadata, output: second, builtAt });

    const firstBytes = await readFile(first);
    const secondBytes = await readFile(second);
    assert.deepEqual(secondBytes, firstBytes, 'serialized JSON bytes must match');
    const result = JSON.parse(firstBytes.toString('utf8'));
    assert.equal(result.built_at, builtAt);
    // The builder preserves input order; it does not promise sorting across inputs.
    assert.deepEqual(result.evidence.map((row) => row.evidence_id), rows.map((row) => row.evidence_id));
  });
}
