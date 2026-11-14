// Minimal RFC 4180 CSV reader/writer for data/evidence.csv. Pure, no DOM, no dependencies.

// parseCsv(text) -> [ { header: value } ]. Quoted fields may hold commas, quotes ("") and newlines.
export function parseCsv(text) {
  const src = text.replace(/^﻿/, '');
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;
  let closed = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"') {
      if (field !== '' || closed) throw new Error('CSV: unexpected quote');
      quoted = true;
    } else if (c === ',') {
      record.push(field); field = ''; closed = false;
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      record.push(field); records.push(record);
      record = []; field = ''; closed = false;
    } else {
      if (closed) throw new Error('CSV: unexpected character after closing quote');
      field += c;
    }
  }
  if (quoted) throw new Error('CSV: unterminated quoted field');
  if (field !== '' || record.length) { record.push(field); records.push(record); }

  const rows = records.filter((r) => !(r.length === 1 && r[0] === ''));
  if (!rows.length) return [];
  const [header, ...body] = rows;
  if (header.some((h) => !h.trim()) || new Set(header).size !== header.length) {
    throw new Error('CSV: empty or duplicate column header');
  }
  return body.map((r, n) => {
    if (r.length !== header.length) {
      throw new Error(`CSV: data line ${n + 1} has ${r.length} fields, header has ${header.length}`);
    }
    return Object.fromEntries(header.map((h, i) => [h, r[i]]));
  });
}

// toCsv(columns, rows) -> text. Every field is quoted; null/undefined become empty cells.
export function toCsv(columns, rows) {
  const q = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`;
  return [columns.map(q).join(','), ...rows.map((r) => columns.map((c) => q(r[c])).join(','))].join('\n') + '\n';
}
