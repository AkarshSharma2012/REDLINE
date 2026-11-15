import { sortByConcern } from './sort-results.js';

// DOM rendering uses textContent throughout: catalog and engine strings are untrusted text.
export function element(document, tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function sourceLink(document, source, locator) {
  if (!source?.url || !locator) return element(document, 'span', 'Source unavailable');
  let url;
  try { url = new URL(source.url); } catch { return element(document, 'span', 'Source unavailable'); }
  if (url.protocol !== 'https:' || !/(^|\.)nasa\.gov$/i.test(url.hostname)) {
    return element(document, 'span', 'NASA source unavailable');
  }
  const link = element(document, 'a', `${source.title} — ${locator} (opens in new tab)`);
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

// Scoped here because issue #52 does not own styles.css.
export function styleUI(root) {
  root.classList.add('cabin-ui');
  const d = root.ownerDocument;
  if (d.getElementById('cabin-ui-styles')) return;
  const style = d.createElement('style'); style.id = 'cabin-ui-styles';
  style.textContent = `
    .cabin-ui { color:#E8EAED; background:#16191E; font:14px/20px system-ui,sans-serif; padding:16px; min-width:0; overflow-wrap:anywhere; }
    .cabin-ui * { box-sizing:border-box; }
    .cabin-ui h2 { font-size:16px; line-height:24px; margin:0 0 16px; }
    .cabin-ui .concern-heading h3 { font-size:16px; line-height:24px; margin:0; }
    .cabin-ui .concern-heading { background:#1E2228; }
    .cabin-ui .concern-heading p { color:#A9B0BB; font-weight:400; margin:4px 0 0; }
    .cabin-ui p { margin:4px 0 12px; }
    .cabin-ui p:empty { display:none; }
    .cabin-ui label { display:block; color:#A9B0BB; margin-top:12px; }
    .cabin-ui fieldset { border:1px solid #737B88; border-radius:6px; margin:16px 0; min-width:0; padding:12px; }
    .cabin-ui input,.cabin-ui select,.cabin-ui button { background:#1E2228; color:#E8EAED; border:1px solid #737B88; border-radius:4px; font:inherit; min-height:24px; padding:4px 8px; max-width:100%; }
    .cabin-ui input,.cabin-ui select { width:100%; }
    .cabin-ui button { cursor:pointer; margin:4px 4px 4px 0; white-space:normal; }
    .cabin-ui button:disabled { cursor:default; color:#8A929E; }
    .cabin-ui button[aria-pressed=true] { background:#262B33; border-bottom:2px solid #7CB8FF; }
    .cabin-ui :focus-visible { outline:2px solid #7CB8FF; outline-offset:2px; }
    .cabin-ui a { color:#7CB8FF; text-decoration:underline; }
    .cabin-ui table { border-collapse:collapse; width:100%; min-width:760px; text-align:left; }
    .cabin-ui th,.cabin-ui td { padding:8px 12px; vertical-align:top; border-bottom:1px solid #2C313A; }
    .cabin-ui th:first-child { min-width:140px; }
    .cabin-ui td:nth-child(2) { min-width:180px; }
    .cabin-ui td:nth-child(3) { min-width:200px; }
    .cabin-ui td:nth-child(5),.cabin-ui td:nth-child(6) { min-width:240px; }
    .cabin-ui thead { background:#1E2228; color:#A9B0BB; }
    .cabin-ui .mismatch-flag { border:1px solid #737B88; padding:2px 4px; font-family:monospace; }
    .cabin-ui .gravity-estimate { border:1px dashed #737B88; }
  `;
  d.head.append(style);
}

const chips = {
  BURNED: ['\u25A0', 'Burned in comparable test'],
  NEAR: ['\u25B3', 'Near measured limit'],
  NOT_ESTABLISHED: ['\u25CB', 'Not established'],
};
const concernGroups = [
  ['BURNED', 'Burned in testing at these conditions'],
  ['NEAR', 'Close to a measured limit'],
  ['NOT_ESTABLISHED', 'Not found in the sources reviewed'],
];
function chip(document, result) {
  const [glyph, text] = chips[result.label] || chips.NOT_ESTABLISHED;
  const node = element(document, 'span', `${glyph} ${text}`, `label-chip label-${result.label}`);
  node.setAttribute('aria-label', result.wording || 'Result wording unavailable');
  node.style.cssText = 'display:inline-block;padding:2px 4px;border-radius:4px;border:1.5px solid;white-space:normal;';
  if (result.label === 'BURNED') node.style.cssText += 'background:#FF6A33;color:#0E1013;border-color:#FF6A33;';
  else if (result.label === 'NEAR') node.style.color = '#F0D545';
  else { node.style.color = '#8EC5F0'; node.style.borderStyle = 'dashed'; }
  return node;
}

/** S1 scaffold API. evidence resolves cited IDs; items preserves duplicate material identity. */
export function renderResultsTable(root, results = [], options = {}) {
  const { onSelect, evidence = {}, items = [], state = 'ready', onRetry, fixture = false } = options;
  const d = root.ownerDocument;
  styleUI(root);
  root.replaceChildren();
  const heading = element(d, 'h2', 'Results');
  heading.id = `${root.id || 'cabin-results'}-heading`;
  root.append(heading);
  const status = element(d, 'p');
  status.setAttribute('role', 'status');
  root.append(status);
  if (fixture) status.textContent = 'UI fixture preview — synthetic checks, not scientific results.';
  if (state === 'loading' || state === 'updating') {
    status.textContent = state === 'loading' ? 'Loading evidence…' : 'Updating for these conditions';
    root.setAttribute('aria-busy', 'true');
    return;
  }
  root.removeAttribute('aria-busy');
  if (state === 'error') {
    status.textContent = 'Evidence could not be loaded. Results unavailable.';
    const retry = element(d, 'button', 'Retry'); retry.type = 'button';
    retry.addEventListener('click', () => onRetry?.()); root.append(retry); return;
  }
  if (state === 'empty-evidence' || (!fixture && Array.isArray(evidence.evidence) && !evidence.evidence.some(r => r.review_status === 'verified'))) {
    status.textContent = 'No verified evidence rows loaded.'; return;
  }
  if (!results.length) { status.textContent = 'Add a material to compare evidence'; return; }
  const wrap = element(d, 'div'); wrap.style.overflowX = 'auto';
  const table = element(d, 'table'); table.setAttribute('aria-labelledby', heading.id);
  const head = element(d, 'thead'), header = element(d, 'tr');
  for (const title of ['Material', 'Label', 'Reason', 'Flags', 'Gravity', 'Source']) {
    const th = element(d, 'th', title); th.scope = 'col';
    if (title === 'Label') th.setAttribute('aria-sort', 'other');
    header.append(th);
  }
  head.append(header); table.append(head);
  // Decorate before sorting so input-index item identity survives, including duplicates.
  const sorted = sortByConcern(results.map((result, index) => {
    const item = items[index] || {};
    const material = evidence.materials?.find(m => m.material_id === result.material_id);
    return { label: result.label, material_name: material?.display_name || result.material_name || result.material_id,
      result, index, item, material };
  }));
  for (const [tier, title] of concernGroups) {
    const entries = sorted.filter(entry => entry.label === tier);
    const body = element(d, 'tbody');
    const groupRow = element(d, 'tr', null, 'concern-heading');
    const groupCell = element(d, 'th'); groupCell.colSpan = 6; groupCell.scope = 'rowgroup';
    const groupHeading = element(d, 'h3', `${title} (${entries.length})`);
    groupHeading.id = `${heading.id}-${tier}`;
    body.setAttribute('aria-labelledby', groupHeading.id);
    groupCell.append(groupHeading);
    if (tier === 'NOT_ESTABLISHED') {
      groupCell.append(element(d, 'p', 'This is a gap in the evidence, not a finding about the material.'));
    }
    groupRow.append(groupCell); body.append(groupRow);
    entries.forEach(({ result, index, item, material }) => {
      const row = element(d, 'tr'), name = element(d, 'th'); name.scope = 'row';
      const button = element(d, 'button', item.name || material?.display_name || result.material_id);
      button.type = 'button'; button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        table.querySelectorAll('button[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        onSelect?.(result, { item, index });
      });
      name.append(button, element(d, 'div', material?.display_name || result.material_id), element(d, 'div', [item.use, item.form].filter(Boolean).join(' · '))); row.append(name);
      const label = element(d, 'td'); label.append(chip(d, result)); row.append(label);
      row.append(element(d, 'td', result.wording || 'Result wording unavailable'));
      const flags = element(d, 'td');
      const details = result.flag_details || [];
      for (const rule of [...new Set([...(result.flags || []), ...details.map(f => f.rule)])]) {
        const descriptions = details.filter(f => f.rule === rule).map(f => `${f.grade}: ${f.why}`).join('; ');
        const tag = element(d, 'span', rule, 'mismatch-flag');
        tag.title = `${rule}: ${descriptions || 'Mismatch details unavailable'}`;
        tag.setAttribute('aria-label', tag.title); flags.append(tag, d.createTextNode(' '));
      }
      // Details remain visible and available without hover, including INVALID exclusions.
      for (const detail of details) flags.append(element(d, 'div', `${detail.rule} · ${detail.grade} · ${detail.why}`));
      if (result.cross_gravity) flags.append(element(d, 'div', 'Cross-gravity comparison'));
      row.append(flags);
      const gravity = element(d, 'td');
      if (result.estimate) {
        gravity.classList.add('gravity-estimate');
        gravity.append(element(d, 'p', 'Estimate shown beside 0 g and 1 g results; not a validated lunar bound.'));
        for (const [key, text] of [['g0', '0 g'], ['g1', '1 g'], ['gP', 'Simulated partial gravity']]) {
          if (!result.estimate[key]) continue;
          const endpoint = element(d, 'div', `${text}: `);
          endpoint.append(chip(d, result.estimate[key]), element(d, 'p', result.estimate[key].wording));
          for (const id of result.estimate[key].cited || []) {
            const record = evidence.evidence?.find(r => r.evidence_id === id);
            endpoint.append(sourceLink(d, evidence.sources?.[record?.source_key], record?.source_locator));
          }
          gravity.append(endpoint);
        }
      } else gravity.textContent = 'Reference test comparison';
      row.append(gravity);
      const sources = element(d, 'td');
      for (const id of result.cited || []) {
        const record = evidence.evidence?.find(r => r.evidence_id === id);
        const line = element(d, 'div'); line.append(sourceLink(d, evidence.sources?.[record?.source_key], record?.source_locator)); sources.append(line);
      }
      if (!result.cited?.length) {
        sources.append(element(d, 'div', 'Coverage: reviewed source inventory'));
        for (const source of Object.values(evidence.sources || {})) sources.append(sourceLink(d, source, 'Reviewed source inventory'));
      }
      row.append(sources); body.append(row);
    });
    table.append(body);
  }
  wrap.append(table); root.append(wrap);
  return { table };
}
