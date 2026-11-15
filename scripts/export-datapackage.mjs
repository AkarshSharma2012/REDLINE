import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Export unchanged evidence alongside a portable Frictionless descriptor. */
export async function exportDatapackage({
  dataDir = resolve(root, 'data'),
  outputDir = resolve(dataDir, 'exports'),
} = {}) {
  // Read every input before writing anything; missing inputs leave exports alone.
  const [metadataText, csv, json] = await Promise.all([
    readFile(resolve(dataDir, 'metadata.json'), 'utf8'),
    readFile(resolve(dataDir, 'evidence.csv')),
    readFile(resolve(dataDir, 'evidence.json')),
  ]);
  const metadata = JSON.parse(metadataText);
  JSON.parse(json.toString('utf8'));
  const sources = Array.isArray(metadata.sources)
    ? metadata.sources.map(source => ({ ...source }))
    : Object.entries(metadata.sources ?? {}).map(([key, source]) => {
      const { url, ...details } = source;
      return { ...details, name: key, ...(url ? { path: url } : {}) };
    });
  const descriptor = {
    profile: 'data-package',
    name: 'redline-evidence',
    title: 'REDLINE evidence data package',
    sources,
    ...(metadata.licenses ? { licenses: metadata.licenses } : {}),
    resources: [
      { name: 'evidence-csv', path: 'evidence.csv', format: 'csv', mediatype: 'text/csv', encoding: 'utf-8', bytes: csv.length },
      { name: 'evidence-json', path: 'evidence.json', format: 'json', mediatype: 'application/json', encoding: 'utf-8', bytes: json.length },
    ],
  };
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, 'evidence.csv'), csv);
  await writeFile(resolve(outputDir, 'evidence.json'), json);
  await writeFile(resolve(outputDir, 'datapackage.json'), `${JSON.stringify(descriptor, null, 2)}\n`);
  return descriptor;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  exportDatapackage().catch(error => {
    console.error(`Data package export failed: ${error.message}`);
    process.exitCode = 1;
  });
}
