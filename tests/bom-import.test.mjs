import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBom, renderBomImport, BOM_MAX_BYTES } from '../src/ui/bom-import.js';
import { renderCabinForm } from '../src/ui/cabin-form.js';
import { labelCabin } from '../src/rules/label.js';

const evidence = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));
const header = 'material,form,thickness_mm,width_mm,quantity,note\n';
const parse = text => parseBom(text, evidence.materials);

test('catalog IDs, display names and aliases match case-insensitively; duplicates stay separate', () => {
  const result = parse(header + 'ACRYLIC,sheet,2,20,2,"panel, front"\nPMMA (acrylic),sheet,,,,\npmma,rod,,,,');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.lines.map(line => line.material_id), ['pmma', 'pmma', 'pmma']);
  assert.equal(result.lines[0].quantity, 2);
  assert.equal(result.lines[0].note, 'panel, front');
  assert.equal(result.lines[1].thickness_mm, null);
});

test('unknown material is retained and reaches the actual engine as missing coverage', () => {
  const { lines, errors } = parse(header + '<img src=x>,fabric,,,,');
  assert.equal(errors.length, 0);
  assert.equal(lines[0].material_recognised, false);
  assert.equal(lines[0].name, '<img src=x>');
  const [result] = labelCabin({ conditions: { gravity_g: 1 }, materials: lines }, evidence);
  assert.equal(result.label, 'NOT_ESTABLISHED');
  assert.equal(result.reason, 'NE-no-data');
});

test('bad rows report physical lines, including CRLF, blank lines and multiline notes', () => {
  const { lines, errors } = parse('\uFEFF' + header.replace('\n', '\r\n') +
    'pmma,sheet,1,2,1,"two\r\nlines"\r\n\r\ncotton,fabric,-1,,,\r\nnomex,fabric,,0,,\r\npmma,sheet,,,,\r\n');
  assert.deepEqual(errors.map(error => error.line), [5, 6]);
  assert.deepEqual(lines.map(line => line.line), [2, 7]);
  assert.equal(lines[0].note, 'two\r\nlines');
});

test('required headers, CSV syntax, finite positive dimensions, quantity and form are validated', () => {
  for (const text of ['', 'material,form\npmma,sheet', 'material,material\npmma,pmma']) assert.ok(parse(text).errors.length);
  for (const row of ['pmma,sheet,NaN,,,', 'pmma,sheet,Infinity,,,', 'pmma,sheet,,,0,', ',sheet,,,,', 'pmma,typo,,,,', 'pmma,sheet', 'pmma,sheet,,,,"unterminated']) {
    const result = parse(header + row);
    assert.equal(result.lines.length, 0, row);
    assert.equal(result.errors[0].line, 2, row);
  }
});

test('limits reject the entire import; UTF-8 bytes are measured, not characters', () => {
  assert.equal(parse(header + 'pmma,sheet,,,,\n'.repeat(200)).lines.length, 200);
  const overflow = parse(header + 'pmma,sheet,,,,\n'.repeat(201));
  assert.equal(overflow.lines.length, 0);
  assert.equal(overflow.errors[0].line, 202);
  const exact = header + 'pmma,sheet,,,,"' + 'x'.repeat(BOM_MAX_BYTES - header.length - 16) + '"';
  assert.equal(new TextEncoder().encode(exact).length, BOM_MAX_BYTES);
  assert.equal(parse(exact).lines.length, 1);
  assert.equal(parse(exact + ' ').lines.length, 0);
  assert.match(parse(header + 'é'.repeat(60000)).errors[0].message, /100 KB/);
});

// Small DOM double: exercise event wiring and query payloads without a browser or dependencies.
class Node {
  constructor(d, tag) {
    this.ownerDocument = d; this.tagName = tag.toUpperCase(); this.children = []; this.events = {};
    this.style = {}; this.classList = { add() {} }; this.value = ''; this.textContent = '';
  }
  append(...nodes) { for (const node of nodes) { this.children.push(node); node.parent = this; } }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(key, value) { this[key] = value; }
  addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); }
  focus() {}
  async fire(type, extra = {}) {
    const event = { target: this, preventDefault() {}, stopPropagation() { this.stopped = true; }, ...extra };
    for (let node = this; node; node = node.parent) {
      for (const fn of node.events[type] || []) await fn(event);
      if (event.stopped) break;
    }
  }
}
function dom() {
  const d = { createElement: tag => new Node(d, tag), getElementById: () => null };
  d.head = new Node(d, 'head');
  return new Node(d, 'div');
}
function all(root) { return [root, ...root.children.flatMap(all)]; }

test('paste appends through form change/evaluation path, retains unknowns and metadata', async () => {
  const root = dom(); let changed, evaluated;
  const form = renderCabinForm(root, { materials: evidence.materials,
    onChange: (query, meta) => { changed = { query, meta }; },
    evaluate: query => labelCabin(query, evidence), onEvaluate: results => { evaluated = results; } });
  const fields = all(root);
  for (const [name, value] of [['o2', '34'], ['pressure', '56.5'], ['unit', 'kpa'], ['gravity', '1']]) fields.find(node => node.name === name).value = value;
  form.addItem({ material_id: 'pmma', name: 'Existing panel' });
  const paste = fields.find(node => node.tagName === 'TEXTAREA');
  paste.value = header + 'New composite,fabric,,,3,seat\ncotton,fabric,,,,clothing';
  await paste.fire('input');
  assert.equal(changed, undefined, 'editing CSV does not change cabin');
  await fields.find(node => node.textContent === 'Import pasted CSV').fire('click');
  assert.equal(changed.meta.valid, true);
  assert.equal(changed.query.materials.length, 3);
  assert.equal(changed.query.materials[1].quantity, 3);
  assert.equal(changed.query.materials[1].note, 'seat');
  assert.equal(form.getQuery().materials[2].material_id, 'cotton');
  await fields.find(node => node.tagName === 'FORM').fire('submit');
  assert.equal(evaluated.length, 3);
  assert.equal(evaluated[1].reason, 'NE-no-data');
  form.destroy(); assert.equal(root.children.length, 0);
});

test('file selection and drop read locally; oversize and multiple files are rejected before reading', async () => {
  const root = dom(); const imports = [];
  const controller = renderBomImport(root, { materials: evidence.materials, onImport: rows => imports.push(rows) });
  const nodes = all(root), file = nodes.find(node => node.type === 'file');
  const drop = nodes.find(node => node.textContent.startsWith('Drop one'));
  const csv = { size: 40, text: async () => header + 'cotton,fabric,,,,' };
  file.files = [csv]; await file.fire('change');
  await drop.fire('drop', { dataTransfer: { files: [csv] } });
  assert.equal(imports.length, 2);
  file.files = [{ size: BOM_MAX_BYTES + 1, text: () => assert.fail('must not read') }];
  await file.fire('change');
  await drop.fire('drop', { dataTransfer: { files: [csv, csv] } });
  assert.equal(imports.length, 2);
  controller.destroy(); assert.equal(root.children.length, 0);
});

test('rover sample imports all four illustrative forms with unknown dimensions', async () => {
  const text = await readFile(new URL('../data/sample-bom-rover.csv', import.meta.url), 'utf8');
  const result = parse(text);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.lines.map(line => [line.material_id, line.form]), [['pmma', 'sheet'], ['cotton', 'fabric'], ['p213', 'tape'], ['nomex', 'fabric']]);
  assert.ok(result.lines.every(line => line.thickness_mm === null && line.width_mm === null));
});

test('college student: invalid browser number input is not treated as an omitted dimension', async () => {
  const root = dom(); let evaluated = false;
  renderCabinForm(root, { materials: evidence.materials, items: [{ material_id: 'pmma' }],
    evaluate: () => { evaluated = true; return []; } });
  const nodes = all(root);
  for (const [name, value] of [['o2', '34'], ['pressure', '56.5'], ['unit', 'kpa'], ['gravity', '1']]) nodes.find(n => n.name === name).value = value;
  const thickness = nodes.find(n => n.name?.endsWith('-thickness'));
  thickness.value = ''; thickness.validity = { badInput: true };
  await nodes.find(n => n.tagName === 'FORM').fire('submit');
  assert.equal(evaluated, false);
  assert.equal(thickness['aria-invalid'], 'true');
});

test('college student: double-clicking pasted CSV imports once and retains the paste', async () => {
  const root = dom(); let count = 0;
  renderBomImport(root, { materials: evidence.materials, onImport: () => count++ });
  const nodes = all(root), paste = nodes.find(n => n.tagName === 'TEXTAREA');
  const button = nodes.find(n => n.textContent === 'Import pasted CSV');
  paste.value = header + 'nomex,fabric,,,,';
  await button.fire('click', { detail: 1 });
  await button.fire('click', { detail: 2 });
  assert.equal(count, 1);
  assert.equal(paste.value, header + 'nomex,fabric,,,,');
  await button.fire('click', { detail: 0 });
  assert.equal(count, 2, 'later keyboard import remains available');
});
