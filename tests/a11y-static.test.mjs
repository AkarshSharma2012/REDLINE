import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);

// Source lint, not a browser accessibility tree. Do not execute UI modules.
// Collect quoted HTML as well as templates: some renderers concatenate both.
// Nested interpolation literals are checked independently; expressions become
// DYNAMIC text candidates, whose actual values require a rendered-state audit.
function literals(source) {
  const found = [];
  let i = 0;
  function code(interpolation = false) {
    let depth = 0;
    while (i < source.length) {
      const c = source[i];
      if (source.startsWith('//', i)) {
        const end = source.indexOf('\n', i);
        i = end < 0 ? source.length : end + 1;
      } else if (source.startsWith('/*', i)) {
        const end = source.indexOf('*/', i + 2);
        i = end < 0 ? source.length : end + 2;
      } else if (c === '/' && /(?:^|[=(,:!&|?{};\[]|\breturn|=>)\s*$/.test(source.slice(0, i))) {
        // Regex literals can contain quotes/backticks; do not treat those as
        // JavaScript strings. This is a lexical heuristic, not a JS parser.
        i++;
        let characterClass = false;
        while (i < source.length) {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === '[') characterClass = true;
          if (source[i] === ']') characterClass = false;
          if (source[i++] === '/' && !characterClass) break;
        }
      } else if ('\'"`'.includes(c)) {
        const quote = c;
        const offset = ++i;
        let html = '';
        while (i < source.length && source[i] !== quote) {
          if (source[i] === '\\') {
            // Preserve offsets; escaped quotes do not terminate a literal.
            html += source.slice(i, i + 2);
            i += 2;
          } else if (quote === '`' && source.startsWith('${', i)) {
            const start = i;
            i += 2;
            code(true);
            const expression = source.slice(start, i);
            html += expression.replace(/[^\r\n]/g, ' ').replace(/ {3}/, 'DYN');
          } else html += source[i++];
        }
        i++;
        if (/<\/?[a-z][\s>]/i.test(html) || /<[a-z][\w-]*\b/i.test(html)) {
          found.push({ html, offset });
        }
      } else if (interpolation && c === '}' && depth === 0) {
        i++;
        return;
      } else {
        if (c === '{') depth++;
        if (c === '}') depth--;
        i++;
      }
    }
  }
  code();
  return found.sort((a, b) => a.offset - b.offset);
}

function attributes(tag) {
  const result = {};
  const body = tag.replace(/^<\/?[\w-]+/, '').replace(/\/?\s*>$/, '');
  for (const m of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return result;
}

function textContent(html) {
  return html.replace(/<([\w-]+)\b[^>]*(?:aria-hidden\s*=\s*["']true["']|\bhidden)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => {
      const value = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
      return value <= 0x10ffff ? String.fromCodePoint(value) : '';
    })
    .replace(/&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace);/gi, ' ')
    .replace(/&[a-z]+;/gi, '')
    .trim();
}
const hasText = value => /[\p{L}\p{N}]/u.test(textContent(value ?? ''));

function elements(fragment) {
  const nodes = [];
  const stack = [];
  // Mask comments, scripts and styles without shifting diagnostic locations.
  const html = fragment.html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    s => s.replace(/[^\r\n]/g, ' '));
  for (const m of html.matchAll(/<\/?[a-z][\w-]*\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi)) {
    const tag = /^<\/?([\w-]+)/.exec(m[0])[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const index = stack.findLastIndex(n => n.tag === tag);
      if (index >= 0) {
        stack[index].body = html.slice(stack[index].end, m.index);
        stack.splice(index);
      }
      continue;
    }
    const node = { tag, attrs: attributes(m[0]), raw: m[0], body: '',
      position: fragment.offset + m.index, end: m.index + m[0].length,
      ancestors: [...stack] };
    nodes.push(node);
    if (!/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag)
        && !m[0].endsWith('/>')) stack.push(node);
  }
  return nodes;
}

function audit(file, source, isPage = false) {
  const fragments = isPage ? [{ html: source, offset: 0 }] : literals(source);
  const groups = fragments.map(elements);
  const nodes = groups.flat();
  const errors = [];
  function fail(rule, node, detail) {
    const before = source.slice(0, node?.position ?? 0);
    const line = before.split('\n').length;
    const column = before.length - before.lastIndexOf('\n');
    errors.push({ rule, message: `${file}:${line}:${column} [${rule}] ${detail}${node ? `; ${node.raw}` : ''}` });
  }
  const namedBy = node => {
    const ids = (node.attrs['aria-labelledby'] ?? '').trim().split(/\s+/).filter(Boolean);
    return ids.length > 0 && ids.every(id => nodes.some(n => n.attrs.id === id && hasText(n.body)));
  };
  const ariaName = n => hasText(n.attrs['aria-label']) || namedBy(n);
  const visibleName = n => hasText(n.body) || elements({ html: n.body, offset: 0 })
    .some(child => child.tag === 'img' && hasText(child.attrs.alt));

  if (isPage) {
    const html = nodes.find(n => n.tag === 'html');
    if (!html || !/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(html.attrs.lang ?? '')) {
      fail('lang', html, 'html needs a nonempty language tag');
    }
    const h1s = nodes.filter(n => n.tag === 'h1');
    if (h1s.length !== 1) fail('h1', h1s[1] ?? h1s[0], `expected exactly one h1, found ${h1s.length}`);
  } else {
    for (const node of nodes.filter(n => n.tag === 'h1')) fail('h1', node, 'UI fragment adds another page h1');
  }
  // Each literal is a fragment, not render order. Its first heading inherits
  // context from the caller; index.html starts at h1. Never infer helper order.
  for (const group of groups) {
    let previous = isPage ? 0 : null;
    for (const n of group.filter(n => /^h[1-6]$/.test(n.tag))) {
      const level = Number(n.tag[1]);
      if (previous !== null && level > previous + 1) {
        fail('headings', n, `heading jumps from ${previous ? `h${previous}` : 'page start'} to ${n.tag}`);
      }
      if (!visibleName(n)) fail('headings', n, 'heading has no text candidate');
      previous = level;
    }
  }
  for (const n of nodes) {
    const a = n.attrs;
    if (n.tag === 'img' && !Object.hasOwn(a, 'alt')) fail('alt', n, 'image needs alt (alt="" allowed for decorative images)');
    const buttonInput = n.tag === 'input' && /^(button|submit|reset|image)$/i.test(a.type ?? '');
    const control = /^(input|select|textarea)$/.test(n.tag) && a.type !== 'hidden' && !buttonInput;
    if (control || a.role === 'slider') {
      const label = nodes.some(l => l.tag === 'label' && hasText(l.body)
        && ((a.id && l.attrs.for === a.id) || n.ancestors.includes(l)));
      if (!ariaName(n) && !label) fail('labels', n, 'control needs text in an associated label, aria-label or resolved aria-labelledby');
    }
    if (n.tag === 'button' || a.role === 'button' || buttonInput) {
      const nativeName = buttonInput && (hasText(a.value) || (a.type === 'image' && hasText(a.alt))
        || /^(submit|reset)$/i.test(a.type));
      if (!ariaName(n) && !visibleName(n) && !nativeName) fail('buttons', n, 'button needs a text/name candidate');
    }
    if (/(?:^|\s)(?:chip(?:-[\w-]+)?|label-chip|label-(?:BURNED|NEAR|NOT_ESTABLISHED))(?:\s|$)/i.test(a.class ?? '')
        && !hasText(n.body)) {
      fail('chips', n, 'label chip needs visible text; color, glyphs and aria-label alone are insufficient');
    }
  }
  return errors;
}

test('static accessibility checker detects regressions with precise locations', () => {
  const bad = '<html><h1>One</h1><h1>Two</h1>\n<h3>Jump</h3><img src="x">'
    + '<input type="range"><button><span aria-hidden="true">X</span></button>'
    + '<span class="label-chip" aria-label="Burned">&#9632;</span></html>';
  const errors = audit('fixture.html', bad, true);
  assert.deepEqual([...new Set(errors.map(e => e.rule))].sort(),
    ['alt', 'buttons', 'chips', 'h1', 'headings', 'labels', 'lang']);
  assert.match(errors.find(e => e.rule === 'headings').message, /^fixture\.html:2:1 /);
});

test('static accessibility checker accepts label and name alternatives', () => {
  const good = '<html lang="en-US"><h1>Title</h1><h2>Controls</h2><img alt="">'
    + '<label for="o2">Oxygen</label><input id="o2" type="range">'
    + '<label>Pressure<input type="number"></label><input aria-label="Flow">'
    + '<span id="gravity">Gravity</span><div role="slider" aria-labelledby="gravity"></div>'
    + '<button aria-label="Close"></button><button><img alt="Retry"></button>'
    + '<input type="hidden"><input type="submit"><span class="chip chip-near">Near measured limit</span></html>';
  assert.deepEqual(audit('fixture.html', good, true), []);
  assert.equal(audit('fixture.html', '<input aria-labelledby="missing">', true)
    .filter(e => e.rule === 'labels').length, 1);
});

test('extracts nested templates and quoted HTML without executing JavaScript', () => {
  const js = '// <button>comment</button>\nconst escape = s => s.replace(/[&<>"\']/g, x => x);\nconst html = `<h2>Title</h2>${items.map(x => `<button>${x.name}</button>`).join(\'\')}<input aria-label="Oxygen">`;'
    + '\nconst chip = \'<span class="chip">Burned in testing</span>\';';
  assert.equal(literals(js).length, 3);
  assert.deepEqual(audit('fixture.js', js), []);
  assert.equal(audit('fixture.js', 'const html = `<h2>Title</h2><h4>Skipped</h4><button></button>`;').length, 2);
});

const sources = [
  ['index.html', true],
  ...readdirSync(new URL('src/ui/', root)).filter(f => f.endsWith('.js')).sort().map(f => [`src/ui/${f}`, false]),
];
for (const [file, isPage] of sources) {
  test(`static accessibility: ${file}`, () => {
    const errors = audit(file, readFileSync(new URL(file, root), 'utf8'), isPage);
    assert.equal(errors.length, 0, '\n' + errors.map(e => e.message).join('\n'));
  });
}
