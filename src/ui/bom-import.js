import { parseCsv } from '../schema/csv.js';
import { element } from './results-table.js';

export const BOM_MAX_ROWS = 200;
export const BOM_MAX_BYTES = 100 * 1024;
const forms = new Set(['sheet', 'rod', 'fabric', 'tape', 'wire', 'slab', 'foam', 'other']);

/** Locate physical record starts only; all CSV field parsing uses parseCsv. */
function records(text) {
  const result = [];
  let start = 0, line = 1, startLine = 1;
  for (const match of text.matchAll(/"(?:[^"]|"")*"|(\r\n|\r|\n)/g)) {
    if (match[1]) {
      const value = text.slice(start, match.index);
      if (value.trim()) result.push({ text: value, line: startLine });
      start = match.index + match[0].length;
    }
    line += (match[0].match(/\r\n|\r|\n/g) || []).length;
    if (match[1]) startLine = line;
  }
  if (text.slice(start).trim()) result.push({ text: text.slice(start), line: startLine });
  return result;
}

/** Returns valid lines and line-numbered errors. Unknown names remain distinct IDs. */
export function parseBom(text, materials = []) {
  const lines = [], errors = [];
  const fail = (line, message) => errors.push({ line, message });
  if (new TextEncoder().encode(text).length > BOM_MAX_BYTES) {
    fail(1, 'CSV exceeds 100 KB.'); return { lines, errors };
  }
  const input = records(text.replace(/^\uFEFF/, ''));
  if (!input.length) { fail(1, 'CSV is empty.'); return { lines, errors }; }
  const header = input.shift();
  let columns;
  try {
    // Let the shared parser validate headers, including a header-only file.
    parseCsv(header.text);
    columns = Object.keys(parseCsv(`${header.text}\n${header.text}`)[0]);
  } catch (error) { fail(header.line, error.message); return { lines, errors }; }
  if (!['material', 'form', 'thickness_mm', 'width_mm'].every(key => columns.includes(key))) {
    fail(header.line, 'Required columns: material, form, thickness_mm, width_mm.');
    return { lines, errors };
  }
  if (input.length > BOM_MAX_ROWS) {
    fail(input[BOM_MAX_ROWS].line, 'CSV exceeds 200 rows. No rows imported.');
    return { lines, errors };
  }
  const names = new Map();
  for (const material of materials) {
    for (const name of [material.material_id, material.display_name, ...(material.aliases || [])]) {
      names.set(name.trim().toLowerCase(), material.material_id);
    }
  }
  for (const record of input) {
    try {
      const row = parseCsv(`${header.text}\n${record.text}`)[0];
      const material = row.material.trim();
      if (!material) throw new Error('Material is required.');
      const form = row.form.trim().toLowerCase();
      if (form && !forms.has(form)) throw new Error('Form must be sheet, rod, fabric, tape, wire, slab, foam or other.');
      const positive = (key) => {
        const raw = (row[key] || '').trim();
        if (!raw) return null;
        const value = Number(raw);
        if (!Number.isFinite(value) || value <= 0) throw new Error(`${key} must be positive or blank.`);
        return value;
      };
      const material_id = names.get(material.toLowerCase());
      lines.push({ material_id: material_id || `unrecognised:${material}`, material_recognised: !!material_id,
        name: material, form: form || null, thickness_mm: positive('thickness_mm'),
        width_mm: positive('width_mm'), quantity: positive('quantity'), note: row.note || '', line: record.line });
    } catch (error) { fail(record.line, error.message); }
  }
  if (!input.length) fail(header.line, 'CSV contains no material rows.');
  return { lines, errors };
}

let instance = 0;
export function renderBomImport(root, { materials = [], onImport } = {}) {
  const d = root.ownerDocument, id = `bom-${++instance}`;
  const section = element(d, 'fieldset'); section.append(element(d, 'legend', 'Import bill of materials'));
  section.append(element(d, 'p', 'Processed in your browser. CSV contents are not uploaded to any server. Maximum 200 rows and 100 KB. Imported rows are added to the material list.'));
  section.append(element(d, 'p', 'Columns: material, form, thickness_mm, width_mm; optional quantity and note. Leave unknown dimensions blank.'));
  const sample = element(d, 'a', 'Download illustrative rover CSV'); sample.href = 'data/sample-bom-rover.csv'; sample.download = 'sample-bom-rover.csv'; section.append(sample);
  const drop = element(d, 'div', 'Drop one CSV here, or choose a file below.');
  drop.style.cssText = 'border:1px dashed #737B88;padding:12px;margin-top:12px;';
  const fileLabel = element(d, 'label', 'Choose CSV file'); fileLabel.htmlFor = `${id}-file`;
  const file = element(d, 'input'); file.type = 'file'; file.accept = '.csv,text/csv'; file.id = fileLabel.htmlFor;
  const pasteLabel = element(d, 'label', 'Paste CSV'); pasteLabel.htmlFor = `${id}-paste`;
  const paste = element(d, 'textarea'); paste.id = pasteLabel.htmlFor; paste.rows = 6;
  paste.style.cssText = 'width:100%;max-width:100%;background:#1E2228;color:#E8EAED;border:1px solid #737B88;border-radius:4px;font:inherit;padding:8px;';
  const button = element(d, 'button', 'Import pasted CSV'); button.type = 'button';
  const report = element(d, 'div'); report.id = `${id}-report`; report.setAttribute('role', 'status'); report.setAttribute('aria-live', 'polite');
  paste.setAttribute('aria-describedby', report.id); file.setAttribute('aria-describedby', report.id);
  let revision = 0;
  function show(text) {
    const result = parseBom(text, materials);
    report.replaceChildren(element(d, 'p', `${result.lines.length} material rows imported. ${result.errors.length} row errors.`));
    for (const error of result.errors) report.append(element(d, 'p', `Error: line ${error.line}: ${error.message}`));
    for (const line of result.lines.filter(line => !line.material_recognised)) {
      report.append(element(d, 'p', `Line ${line.line}: ${line.name} — material not recognised; not found in the sources reviewed.`));
    }
    if (result.lines.length) onImport?.(result.lines);
    return result;
  }
  async function load(files) {
    const current = ++revision;
    if (files.length !== 1 || files[0].size > BOM_MAX_BYTES) {
      report.textContent = 'Error: choose one CSV file of at most 100 KB.'; return;
    }
    report.textContent = 'Reading CSV in this browser.';
    try { const text = await files[0].text(); if (current === revision) show(text); }
    catch { if (current === revision) report.textContent = 'Error: CSV could not be read. Try pasting its contents.'; }
  }
  button.addEventListener('click', () => { revision++; show(paste.value); });
  file.addEventListener('change', () => load(file.files));
  for (const type of ['dragover', 'drop']) drop.addEventListener(type, event => {
    event.preventDefault(); if (type === 'drop') load(event.dataTransfer.files);
  });
  // Import controls must not submit the parent cabin form or stale its current results.
  section.addEventListener('input', event => event.stopPropagation());
  section.addEventListener('change', event => event.stopPropagation());
  section.append(drop, fileLabel, file, pasteLabel, paste, button, report); root.append(section);
  return { importText: text => { revision++; return show(text); }, destroy: () => { revision++; section.remove(); } };
}
