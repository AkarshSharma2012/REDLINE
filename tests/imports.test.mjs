// Guards the live site: one missing named export makes the browser refuse to load ANY module,
// so the whole dashboard goes blank. This checks every `import { x } from './...'` in src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function jsFiles(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? jsFiles(p) : p.endsWith('.js') ? [p] : [];
  });
}

test('every named import in src/ resolves to an export', () => {
  const missing = [];
  for (const file of jsFiles('src')) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g)) {
      const target = path.join(path.dirname(file), m[2]);
      assert.ok(fs.existsSync(target), `${file} imports a file that does not exist: ${m[2]}`);
      const t = fs.readFileSync(target, 'utf8');
      for (const name of m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        const re = new RegExp(`export\\s+(async\\s+)?(function|const|let|class)\\s+${name}\\b|export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`);
        if (!re.test(t)) missing.push(`${file} imports ${name} from ${m[2]}`);
      }
    }
  }
  assert.deepEqual(missing, [], `broken imports:\n${missing.join('\n')}`);
});
