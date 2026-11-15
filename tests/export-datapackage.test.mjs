import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { exportDatapackage } from '../scripts/export-datapackage.mjs';

async function fixture(t, metadata) {
  const dataDir = await mkdtemp(resolve(tmpdir(), 'redline-export-'));
  t.after(() => rm(dataDir, { recursive: true, force: true }));
  await writeFile(resolve(dataDir, 'metadata.json'), JSON.stringify(metadata));
  await writeFile(resolve(dataDir, 'evidence.csv'), 'evidence_id,notes\r\n1,"comma, quote "" and unicode é"\r\n');
  await writeFile(resolve(dataDir, 'evidence.json'), '{"evidence":[]}\n');
  return dataDir;
}

test('exports portable resources, source provenance, licenses and exact input bytes deterministically', async t => {
  const licenses = [{ name: 'CC-BY-4.0', path: 'https://creativecommons.org/licenses/by/4.0/' }];
  const source = { title: 'Fixture source', url: 'https://ntrs.nasa.gov/citations/example', year: 2025 };
  const dataDir = await fixture(t, { sources: { NASA: source }, licenses });
  const descriptor = await exportDatapackage({ dataDir });
  assert.equal(descriptor.profile, 'data-package');
  assert.deepEqual(descriptor.sources, [{ title: source.title, year: 2025, name: 'NASA', path: source.url }]);
  assert.deepEqual(descriptor.licenses, licenses);
  assert.equal(new Set(descriptor.resources.map(r => r.name)).size, 2);
  for (const resource of descriptor.resources) {
    assert.ok(['csv', 'json'].includes(resource.format));
    const input = await readFile(resolve(dataDir, resource.path));
    assert.deepEqual(await readFile(resolve(dataDir, 'exports', resource.path)), input);
    assert.equal(resource.bytes, input.length);
  }
  const before = await readFile(resolve(dataDir, 'exports/datapackage.json'));
  assert.deepEqual(JSON.parse(before), descriptor);
  await exportDatapackage({ dataDir });
  assert.deepEqual(await readFile(resolve(dataDir, 'exports/datapackage.json')), before);
});

test('does not invent licenses and supports Frictionless source arrays and custom output paths', async t => {
  const sources = [{ title: 'Fixture', path: 'https://psi.nasa.gov/' }];
  const dataDir = await fixture(t, { sources });
  const outputDir = resolve(dataDir, 'nested/package');
  const descriptor = await exportDatapackage({ dataDir, outputDir });
  assert.deepEqual(descriptor.sources, sources);
  assert.ok(!Object.hasOwn(descriptor, 'licenses'));
  await access(resolve(outputDir, 'datapackage.json'));
});

test('invalid JSON or missing input fails before creating output', async t => {
  const dataDir = await fixture(t, {});
  await writeFile(resolve(dataDir, 'evidence.json'), 'invalid');
  await assert.rejects(exportDatapackage({ dataDir }), SyntaxError);
  await assert.rejects(access(resolve(dataDir, 'exports')));
  await rm(resolve(dataDir, 'evidence.csv'));
  await assert.rejects(exportDatapackage({ dataDir }), { code: 'ENOENT' });
});
