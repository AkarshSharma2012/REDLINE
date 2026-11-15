import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('src/vendor/react-controls.js', root);
await build({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['scripts/ui/react-controls.js'], outfile: 'src/vendor/react-controls.js',
  bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'eof',
});
// Keep all bundled dependency license texts alongside the committed asset.
const lock = JSON.parse(await readFile(new URL('package-lock.json', root), 'utf8'));
const licenses = [];
for (const [path, pkg] of Object.entries(lock.packages)) {
  if (!path || pkg.dev || pkg.optional) continue;
  for (const filename of ['LICENSE', 'LICENSE.txt', 'LICENSE.md']) {
    try {
      licenses.push(`${path} ${pkg.version} (${pkg.license ?? 'see text'})\n${await readFile(new URL(`${path}/${filename}`, root), 'utf8')}`);
      break;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
await mkdir(new URL('src/vendor/react-controls/', root), { recursive: true });
await writeFile(new URL('src/vendor/react-controls/LICENSES.txt', root), licenses.join('\n\n---\n\n'));
const bytes = await readFile(output);
console.log(`React controls production ESM: ${bytes.length} raw bytes; ${gzipSync(bytes).length} gzip bytes`);
