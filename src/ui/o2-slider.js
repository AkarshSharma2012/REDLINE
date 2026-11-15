/**
 * Oxygen tradeoff preview (S1 §3.3, screens §5, V2 U3/U5).
 * mountO2Slider(root, { cabinQuery, evidence, labelCabin, onApply?, onCancel? })
 * Engine injection allows this module to precede the shared engine merge.
 * Returns { update(cabinQuery, evidence?), destroy() }; callbacks receive copies.
 * Dataset/preset/protocol fields follow S1 §4; extra protocol context is displayed
 * verbatim. This module contains no combustion or pre-breathe model.
 */
export const O2_RANGE = Object.freeze({ min: 15, max: 40, step: 0.5 });
export const MISSING_PREBREATHE = 'pre-breathe duration not found in the sources reviewed';
const LABELS = {
  BURNED: 'Burned in testing at these conditions',
  NEAR: 'Close to a measured limit',
  NOT_ESTABLISHED: 'Not established',
};
const copy = value => structuredClone(value);
const stated = value => value === null || value === undefined || value === ''
  ? 'Not stated in this source' : String(value);

// Judge click-through (#169): missing or malformed inputs become empty, never a crash.
// Valid inputs are returned unchanged so dataset identity checks still hold.
function safeEvidence(evidence) {
  if (evidence && Array.isArray(evidence.evidence)) return evidence;
  return { ...(evidence && typeof evidence === 'object' ? evidence : {}), evidence: [] };
}
function safeQuery(cabinQuery) {
  const q = cabinQuery && typeof cabinQuery === 'object' ? cabinQuery : {};
  return { ...q, conditions: { ...(q.conditions ?? {}) },
    materials: (Array.isArray(q.materials) ? q.materials : []).filter(m => m && typeof m === 'object') };
}

function sourceLink(data, key, locator) {
  const source = data.sources?.[key];
  let url;
  try { url = new URL(source?.url); } catch { throw new Error('NASA source URL missing'); }
  if (url.protocol !== 'https:' || !/(^|\.)nasa\.gov$/.test(url.hostname)
      || !source.title || !locator?.trim()) {
    throw new Error('NASA source title, HTTPS URL and locator required');
  }
  return { title: source.title, url: url.href, locator, year: source.year };
}

function resultSources(result, data) {
  const links = (result.cited ?? []).map(id => {
    const row = data.evidence.find(row => row.evidence_id === id);
    if (!row || row.review_status !== 'verified') throw new Error('Unverified result citation');
    return sourceLink(data, row.source_key, row.source_locator);
  });
  if (!links.length && result.reason !== 'NE-no-data') throw new Error('Result citation missing');
  return links;
}

/** Pure preview adapter. Calls the supplied engine once for this setting. */
export function buildO2Preview(cabinQuery, evidence, labelCabin) {
  cabinQuery = safeQuery(cabinQuery);
  evidence = safeEvidence(evidence);
  const { o2_pct, pressure_kpa } = cabinQuery.conditions;
  if (!Number.isFinite(o2_pct) || o2_pct < 0 || o2_pct > 100
      || !Number.isFinite(pressure_kpa) || pressure_kpa <= 0) {
    throw new Error('Enter oxygen from 0 to 100% and an absolute pressure above 0 kPa.');
  }
  const counts = { BURNED: 0, NEAR: 0, NOT_ESTABLISHED: 0 };
  const rows = evidence.evidence.filter(row => row?.review_status === 'verified');
  const results = labelCabin(copy(cabinQuery), copy({ ...evidence, evidence: rows }));
  if (!Array.isArray(results) || results.length !== cabinQuery.materials.length) {
    throw new Error('Engine returned an incomplete material list');
  }
  const items = results.map((result, index) => {
    if (!Object.hasOwn(LABELS, result.label)
        || result.material_id !== cabinQuery.materials[index].material_id) {
      throw new Error('Engine returned an invalid material result');
    }
    counts[result.label]++;
    const sources = resultSources(result, evidence);
    const endpoints = Object.entries(result.estimate ?? {}).map(([gravity, endpoint]) => ({
      gravity, ...endpoint, sources: resultSources(endpoint, evidence),
    }));
    return { ...result, sources, endpoints };
  });
  const preset = (evidence.cabin_presets ?? []).find(preset =>
    preset.o2_pct === o2_pct && preset.pressure_kpa === pressure_kpa);
  return { counts, items, preset, verifiedRows: rows.length };
}

export function mountO2Slider(root, options) {
  const doc = root.ownerDocument;
  options = options ?? {};
  let data = safeEvidence(options.evidence);
  let original = copy(safeQuery(options.cabinQuery));
  let preview = copy(original);
  let pressureSelected = false;
  let baseline;
  let destroyed = false;
  const listeners = [];
  function el(tag, text, parent, attrs = {}) {
    const node = doc.createElement(tag);
    if (text !== null) node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
    parent?.append(node);
    return node;
  }
  function listen(node, event, callback) {
    node.addEventListener(event, callback);
    listeners.push(() => node.removeEventListener(event, callback));
  }
  function link(parent, source) {
    return el('a', `${source.title} — ${source.locator}${source.year ? ` (${source.year})` : ''}`,
      parent, { href: source.url, target: '_blank', rel: 'noopener noreferrer',
        'aria-label': `${source.title} — ${source.locator} (opens in new tab)` });
  }
  const panel = el('section', null, root, { class: 'o2-slider', 'aria-label': 'Oxygen tradeoff preview' });
  el('h2', 'Oxygen tradeoff (illustrative)', panel);
  el('p', 'Illustration, not a mission calculation. Counts describe evidence labels, not predicted ignition. No pre-breathe duration is computed.', panel);
  const presets = el('div', null, panel, { role: 'group', 'aria-label': 'Published atmosphere presets' });
  const buttons = [];
  for (const preset of data.cabin_presets ?? []) {
    const group = el('div', null, presets);
    try {
      const source = sourceLink(data, preset.source_key, preset.source_locator);
      const button = el('button', `${preset.label} — ${preset.pressure_kpa} kPa / ${preset.o2_pct}% O2`, group,
        { type: 'button', 'aria-pressed': 'false' });
      link(group, source);
      buttons.push({ button, preset });
      listen(button, 'click', () => {
        preview.conditions.o2_pct = preset.o2_pct;
        preview.conditions.pressure_kpa = preset.pressure_kpa;
        pressureSelected = true;
        render();
      });
    } catch {
      el('p', 'Atmosphere preset withheld: NASA source metadata incomplete.', group);
    }
  }
  const numericLabel = el('label', 'Preview oxygen (% by volume) ', panel);
  const numeric = el('input', null, numericLabel, { type: 'number', min: 0, max: 100, step: 'any' });
  const rangeLabel = el('label', 'Oxygen sweep (15–40%, 0.5 percentage-point steps) ', panel);
  const range = el('input', null, rangeLabel, { type: 'range', ...O2_RANGE });
  const held = el('p', null, panel);
  const error = el('p', null, panel, { role: 'alert' });
  const summary = el('div', null, panel, { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const results = el('div', null, panel);
  const protocols = el('section', null, panel, { 'aria-label': 'Published protocol context' });
  const reset = el('button', 'Reset preview', panel, { type: 'button' });
  const apply = el('button', 'Apply preview to cabin', panel, { type: 'button' });
  const cancel = el('button', 'Cancel preview', panel, { type: 'button' });
  apply.disabled = typeof options.onApply !== 'function';
  cancel.disabled = typeof options.onCancel !== 'function';

  function coverage(parent) {
    el('p', `Reviewed source inventory — ${stated(data.built_from)}; built ${stated(data.built_at)}`, parent);
    for (const [key, source] of Object.entries(data.sources ?? {})) {
      try { link(parent, sourceLink(data, key, 'Reviewed source inventory')); } catch { /* Withhold invalid links. */ }
    }
  }
  function showResult(parent, result) {
    el('p', result.wording || LABELS[result.label], parent);
    if (result.reason) el('p', result.reason, parent);
    for (const source of result.sources) link(parent, source);
    if (result.reason === 'NE-no-data') coverage(parent);
    if (result.cross_gravity) el('p', 'Cross-gravity comparison', parent);
    for (const flag of result.flag_details ?? []) el('p', `${flag.rule}: ${flag.why}`, parent);
    if (result.flags?.length) el('p', `Comparison flags: ${result.flags.join(', ')}`, parent);
    for (const endpoint of result.endpoints ?? []) {
      el('p', `${endpoint.gravity}: ${endpoint.wording || LABELS[endpoint.label]}`, parent);
      for (const source of endpoint.sources) link(parent, source);
      if (endpoint.reason === 'NE-no-data') coverage(parent);
    }
    if (result.endpoints?.length) el('p', 'Assumed envelope between 0 g and 1 g results; unvalidated estimate, not a measured lunar bound.', parent);
  }
  function showProtocols(preset) {
    protocols.replaceChildren();
    el('h3', 'Published protocol context', protocols);
    if (!preset) { el('p', MISSING_PREBREATHE, protocols); return; }
    try {
      const source = sourceLink(data, preset.source_key, preset.source_locator);
      el('p', `${preset.label}; ${preset.pressure_kpa} kPa / ${preset.o2_pct}% O2. ${stated(preset.status)}. ${stated(preset.context)}`, protocols);
      link(protocols, source);
    } catch { el('p', 'Preset context withheld: NASA source metadata incomplete.', protocols); return; }
    let shown = 0;
    for (const protocol of preset.prebreathe ?? []) {
      try {
        const source = sourceLink(data, protocol.source_key, protocol.source_locator);
        if (protocol.minutes === null || protocol.minutes === undefined || protocol.minutes === '') continue;
        const record = el('article', null, protocols);
        el('p', `Published duration: ${protocol.minutes} min — ${stated(protocol.regime)} / ${stated(protocol.kind)}`, record);
        el('p', `Starting atmosphere: ${preset.pressure_kpa} kPa / ${preset.o2_pct}% O2`, record);
        const fields = { assumptions: 'Assumptions', acclimation: 'Prior acclimation/staging',
          prebreathe_gas: 'Pre-breathe gas', suit_pressure: 'Suit pressure',
          eva_duration: 'EVA duration', validation_note: 'Validation note' };
        for (const [key, label] of Object.entries(fields)) el('p', `${label}: ${stated(protocol[key])}`, record);
        link(record, source);
        shown++;
      } catch { el('p', 'Protocol withheld: NASA source metadata incomplete.', protocols); }
    }
    if (!shown) el('p', MISSING_PREBREATHE, protocols);
    el('p', 'Separate published protocols retain their own assumptions; no interpolation or universal duration.', protocols);
  }
  function render(syncInputs = true) {
    if (destroyed) return;
    const conditions = preview.conditions;
    if (syncInputs) numeric.value = Number.isFinite(conditions.o2_pct) ? String(conditions.o2_pct) : '';
    const withinSweep = Number.isFinite(conditions.o2_pct)
      && conditions.o2_pct >= O2_RANGE.min && conditions.o2_pct <= O2_RANGE.max;
    const onStep = withinSweep && Number.isInteger((conditions.o2_pct - O2_RANGE.min) / O2_RANGE.step);
    range.disabled = !withinSweep;
    if (withinSweep) range.value = String(conditions.o2_pct);
    // Native range inputs snap off-step numeric edits; describe the actual thumb
    // rather than claiming that the snapped thumb equals the numeric preview.
    range.setAttribute('aria-valuetext', withinSweep
      ? `${range.value} percent oxygen${!onStep ? '; preview uses the numeric field' : ''}`
      : 'Outside the illustrative sweep');
    held.textContent = `Preview: ${Number.isFinite(conditions.o2_pct) ? `${conditions.o2_pct}% O2` : 'O2 not stated'}; pressure ${stated(conditions.pressure_kpa)} kPa; airflow ${stated(conditions.flow_speed_cm_s)} cm/s, ${stated(conditions.flow_direction)}; gravity ${stated(conditions.gravity_g)} g; ${preview.materials.length} material items. Sweep holds pressure, airflow, gravity and items fixed.`;
    error.textContent = withinSweep ? '' : 'Outside the illustrative sweep: edit the numeric oxygen field; the cabin value is not clamped.';
    results.replaceChildren();
    summary.replaceChildren();
    apply.disabled = true;
    // Protocol availability is independent of material-engine failure.
    showProtocols((data.cabin_presets ?? []).find(p =>
      p.o2_pct === conditions.o2_pct && p.pressure_kpa === conditions.pressure_kpa));
    for (const { button, preset } of buttons) button.setAttribute('aria-pressed',
      String(preset.o2_pct === conditions.o2_pct && preset.pressure_kpa === conditions.pressure_kpa));
    try {
      const state = buildO2Preview(preview, data, options.labelCabin);
      if (!state.items.length) el('p', 'Add cabin materials to compare evidence.', summary);
      else if (!state.verifiedRows) { el('p', 'No verified evidence loaded.', summary); coverage(summary); }
      else {
        for (const [label, count] of Object.entries(state.counts)) {
          const row = el('p', `${count} — ${LABELS[label]} (computed by REDLINE)`, summary);
          const items = state.items.filter(item => item.label === label);
          for (const item of items) for (const source of item.sources) link(row, source);
          if (!items.length || items.some(item => item.reason === 'NE-no-data')) coverage(row);
        }
        const table = el('table', null, results);
        el('caption', 'Original and preview evidence labels per material item', table);
        const header = el('tr', null, el('thead', null, table));
        for (const text of ['Material', 'Original label', 'Preview label / sources / mismatches']) el('th', text, header, { scope: 'col' });
        const body = el('tbody', null, table);
        state.items.forEach((item, index) => {
          const row = el('tr', null, body);
          el('th', preview.materials[index].name || item.material_id, row, { scope: 'row' });
          const before = el('td', null, row);
          if (baseline?.items[index]) showResult(before, baseline.items[index]);
          else el('p', 'Original result unavailable', before);
          showResult(el('td', null, row), item);
        });
        if (baseline && state.items.every((item, i) => item.label === baseline.items[i]?.label
            && item.reason === baseline.items[i]?.reason)) {
          el('p', 'No label changes in reviewed evidence at these settings.', results);
        }
      }
      apply.disabled = typeof options.onApply !== 'function';
    } catch (failure) {
      // Our own validation messages are plain language; anything else gets a generic sentence.
      const plain = failure instanceof TypeError || !failure?.message ? 'the cabin settings or evidence file are incomplete' : failure.message;
      error.textContent = `Evidence preview unavailable: ${plain}`;
      el('p', 'Counts unavailable. Change a setting or retry.', summary);
    }
  }
  function rebase() {
    try { baseline = buildO2Preview(original, data, options.labelCabin); } catch { baseline = null; }
  }
  listen(range, 'input', () => { preview.conditions.o2_pct = Number(range.value); render(); });
  listen(numeric, 'input', () => {
    preview.conditions.o2_pct = numeric.value.trim() === '' ? NaN : Number(numeric.value);
    render(false);
  });
  listen(reset, 'click', () => { preview = copy(original); pressureSelected = false; render(); });
  listen(apply, 'click', () => {
    if (apply.disabled) return;
    const next = copy(original);
    next.conditions.o2_pct = preview.conditions.o2_pct;
    if (pressureSelected) next.conditions.pressure_kpa = preview.conditions.pressure_kpa;
    options.onApply(next);
  });
  listen(cancel, 'click', () => options.onCancel?.(copy(original)));
  const retry = el('button', 'Retry evidence preview', panel, { type: 'button' });
  listen(retry, 'click', () => { rebase(); render(); });
  rebase();
  render();
  return {
    update(cabinQuery, evidence = data) {
      if (destroyed) return;
      if (evidence !== data && evidence !== options.evidence) throw new Error('Remount the slider when the dataset changes');
      original = copy(safeQuery(cabinQuery)); preview = copy(original); pressureSelected = false;
      rebase(); render();
    },
    destroy() { destroyed = true; listeners.forEach(remove => remove()); panel.remove(); },
  };
}

// main.js and the S1 smoke test call it renderO2Slider
export { mountO2Slider as renderO2Slider };
