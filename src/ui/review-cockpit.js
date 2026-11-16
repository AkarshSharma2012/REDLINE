// Evidence review cockpit (#323): BOM line -> candidate NASA record -> requested-vs-source
// condition matrix -> pinned baseline difference -> ordered research questions -> reviewer
// brief. Renders A2 triage (#321) and B2 brief (#322) data only; text via textContent.
// Review-ready means bounded exact-context source review, never safe or certified.
import { element } from './results-table.js';
import {
  conditionMatrix, compareSnapshots, describeFieldChange, orderFieldChanges, rowIndex,
  safeFilename, snapshot, STATE_TEXT,
} from './cockpit-model.js';

export const STATUS_TEXT = Object.freeze({
  NO_CANDIDATES: 'No candidate records in the sources reviewed',
  REVIEW_REQUIRED: 'Review required',
  REVIEW_READY: 'Ready for exact-context source review',
});

const INTRO = 'Load the illustrative lunar rover BOM, pick a line, and see which NASA records were tested under the conditions you request and which were not.';

function safeHref(url) {
  if (typeof url !== 'string' || /[\s\u0000-\u001f]/.test(url)) return null;
  try { const u = new URL(url); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch { return null; }
}

function button(d, text, { id, pressed } = {}) {
  const b = element(d, 'button', text); b.type = 'button';
  if (id) b.id = id;
  if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
  return b;
}

/**
 * mountReviewCockpit(root, { brief, onSelectLine, onLoadScenario, document })
 * brief: { buildResearchBrief, researchBriefMarkdown, serializeResearchBrief } (B2 module).
 * Returns { update({ triage, evidence, scenarioName }), clear(message), pin(), getState(), destroy() }.
 */
export function mountReviewCockpit(root, options = {}) {
  const d = options.document ?? root.ownerDocument;
  const brief = options.brief ?? null;
  const state = { triage: null, evidence: null, scenarioName: '', baseline: null, lineId: null, evidenceId: null,
    exported: null, message: '' };

  const heading = element(d, 'h2', 'Evidence review', 'cockpit-title'); heading.id = 'cockpit-heading';
  const intro = element(d, 'p', INTRO, 'cockpit-intro');
  const load = button(d, 'Load lunar rover scenario', { id: 'cockpit-load' }); load.className = 'btn-primary';
  load.addEventListener('click', () => options.onLoadScenario?.());
  const summary = element(d, 'p', '', 'cockpit-summary type-data'); summary.id = 'cockpit-summary';
  summary.setAttribute('role', 'status');
  const notice = element(d, 'p', '', 'cockpit-notice'); notice.id = 'cockpit-notice';

  const pin = button(d, 'Pin baseline', { id: 'cockpit-pin' });
  const unpin = button(d, 'Clear baseline', { id: 'cockpit-unpin' }); unpin.hidden = true;
  const md = button(d, 'Download Markdown brief', { id: 'cockpit-md' });
  const json = button(d, 'Download JSON brief', { id: 'cockpit-json' });
  const open = button(d, 'Open brief', { id: 'cockpit-open' });
  const fileLabel = element(d, 'label', 'Open a brief file', 'cockpit-file');
  const file = element(d, 'input'); file.type = 'file'; file.id = 'cockpit-file';
  file.accept = '.json,.md,application/json,text/markdown,text/plain';
  fileLabel.htmlFor = file.id;
  const actions = element(d, 'div', null, 'cockpit-actions');
  actions.setAttribute('role', 'group'); actions.setAttribute('aria-label', 'Baseline and reviewer brief');
  actions.append(pin, unpin, md, json, open, fileLabel, file);

  const lines = element(d, 'ol', null, 'cockpit-lines'); lines.setAttribute('aria-label', 'BOM lines');
  const detail = element(d, 'div', null, 'cockpit-detail');
  const changes = element(d, 'section', null, 'cockpit-changes'); changes.setAttribute('aria-labelledby', 'cockpit-changes-heading');
  changes.hidden = true;
  const dialog = element(d, 'dialog', null, 'cockpit-brief'); dialog.id = 'cockpit-brief';
  dialog.setAttribute('aria-labelledby', 'cockpit-brief-title');

  root.classList.add('cockpit');
  root.replaceChildren(heading, intro, load, summary, notice, actions, changes, lines, detail, dialog);

  function setExportEnabled(on) { for (const b of [pin, md, json, open]) b.disabled = !on; }

  function currentBrief() {
    if (!brief || !state.triage) return null;
    const built = brief.buildResearchBrief(state.triage, { scenarioName: state.scenarioName, baseline: state.baseline });
    return { brief: built, markdown: brief.researchBriefMarkdown(built), json: brief.serializeResearchBrief(built) };
  }

  function download(text, name, type) {
    const blob = new d.defaultView.Blob([text], { type });
    const url = d.defaultView.URL?.createObjectURL?.(blob);
    if (!url) return;
    const a = element(d, 'a'); a.href = url; a.download = name; a.hidden = true;
    d.body.append(a); a.click(); a.remove();
    d.defaultView.setTimeout(() => d.defaultView.URL.revokeObjectURL(url), 1000);
  }

  function exportCurrent(kind) {
    try {
      const out = currentBrief();
      if (!out) return;
      state.exported = out;
      if (kind === 'md') download(out.markdown, safeFilename(state.scenarioName, 'md'), 'text/markdown;charset=utf-8');
      else download(out.json, safeFilename(state.scenarioName, 'json'), 'application/json;charset=utf-8');
      notice.textContent = `${kind === 'md' ? 'Markdown' : 'JSON'} brief downloaded for the current conditions.`;
    } catch (err) {
      notice.textContent = `Brief unavailable: ${err.message}`;
    }
  }

  function showBrief(title, text) {
    const head = element(d, 'h2', title); head.id = 'cockpit-brief-title';
    const note = element(d, 'p', 'Read-only reviewer view. Not a safety assessment, recommendation, certification or prediction.', 'text-3');
    const pre = element(d, 'pre', text, 'cockpit-brief-text'); pre.tabIndex = 0;
    pre.setAttribute('aria-label', 'Brief text');
    const close = button(d, 'Close brief', { id: 'cockpit-brief-close' });
    close.addEventListener('click', () => closeBrief());
    dialog.replaceChildren(head, note, pre, close);
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal(); else dialog.setAttribute('open', '');
    close.focus();
  }
  function closeBrief() {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else dialog.removeAttribute('open');
    open.focus();
  }

  pin.addEventListener('click', () => {
    if (!state.triage) return;
    state.baseline = snapshot(state.triage);
    notice.textContent = 'Baseline pinned. Change pressure, oxygen or gravity to see which evidence changes and why.';
    render();
  });
  unpin.addEventListener('click', () => { state.baseline = null; notice.textContent = 'Baseline cleared.'; render(); pin.focus(); });
  md.addEventListener('click', () => exportCurrent('md'));
  json.addEventListener('click', () => exportCurrent('json'));
  open.addEventListener('click', () => {
    try {
      const out = currentBrief();
      if (out) { state.exported = out; showBrief(`Reviewer brief: ${out.brief.title}`, out.markdown); }
    } catch (err) { notice.textContent = `Brief unavailable: ${err.message}`; }
  });
  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      if (/\.json$/i.test(f.name) || f.type === 'application/json') {
        if (!brief) throw new Error('brief reader unavailable');
        showBrief(`Brief file: ${f.name}`, brief.researchBriefMarkdown(JSON.parse(text)));
      } else showBrief(`Brief file: ${f.name}`, text);
      notice.textContent = `Opened ${f.name} as a read-only reviewer brief.`;
    } catch (err) {
      notice.textContent = `Could not open ${f.name}: ${err.message}`;
    } finally { file.value = ''; }
  });

  function renderLines() {
    const items = state.triage?.items ?? [];
    lines.replaceChildren(...items.map((it, i) => {
      const li = element(d, 'li');
      const ready = it.candidates.filter((c) => c.review_ready).length;
      const b = button(d, '', { pressed: it.line_id === state.lineId });
      b.className = 'cockpit-line'; b.dataset.lineId = it.line_id; b.dataset.status = it.status;
      b.append(element(d, 'span', `Line ${i + 1}`, 'type-data'),
        element(d, 'span', it.name || it.material_id || 'Unnamed line', 'cockpit-line-name'),
        element(d, 'span', `${STATUS_TEXT[it.status] ?? it.status} · ${it.candidates.length} candidate${it.candidates.length === 1 ? '' : 's'} · ${ready} ready`, 'cockpit-line-meta'));
      b.addEventListener('click', () => { state.lineId = it.line_id; state.evidenceId = null; render(); options.onSelectLine?.(it); focusLine(it.line_id); });
      li.append(b);
      return li;
    }));
  }
  function focusLine(id) { [...lines.querySelectorAll(".cockpit-line")].find((b) => b.dataset.lineId === id)?.focus(); }

  function sourceCitation(candidate) {
    const p = element(d, 'p', null, 'cockpit-source');
    const href = safeHref(candidate.source?.url);
    const title = candidate.source?.title || 'Untitled source';
    if (href) {
      const a = element(d, 'a', `${title} (opens in new tab)`); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      p.append(a);
    } else p.append(element(d, 'span', `${title} — link unavailable`));
    p.append(element(d, 'span', ` · Locator: ${candidate.source?.locator || 'not stated'}`),
      element(d, 'span', ` · Review status: ${candidate.review_status}${candidate.review_status === 'verified' ? '' : ' (not verified)'}`));
    return p;
  }

  function renderDetail(item, baseIndex) {
    const rows = rowIndex(state.evidence);
    detail.replaceChildren();
    if (!item) return;
    const h = element(d, 'h3', `Line ${state.triage.items.indexOf(item) + 1}: ${item.name || item.material_id}`);
    detail.append(h);
    if (!item.candidates.length) {
      detail.append(element(d, 'p', `No record for ${item.material_id || 'this material'} in the sources reviewed. This is a research task, not a finding that it was never tested.`));
    } else {
      const label = element(d, 'label', 'Candidate NASA record'); const select = element(d, 'select'); select.id = 'cockpit-candidate';
      label.htmlFor = select.id;
      for (const c of item.candidates) {
        const o = element(d, 'option', `${c.evidence_id} · ${c.review_status} · compare ${c.grade}${c.review_ready ? ' · review-ready' : ''}`);
        o.value = c.evidence_id; select.append(o);
      }
      const candidate = item.candidates.find((c) => c.evidence_id === state.evidenceId) ?? item.candidates[0];
      state.evidenceId = candidate.evidence_id; select.value = candidate.evidence_id;
      select.addEventListener('change', () => { state.evidenceId = select.value; render(); d.getElementById('cockpit-candidate')?.focus(); });
      detail.append(label, select, sourceCitation(candidate));
      const matrix = conditionMatrix(item, candidate, rows.get(candidate.evidence_id));
      const before = baseIndex?.get(`${item.line_id}\u0000${candidate.evidence_id}`) ?? null;
      const wrap = element(d, 'div', null, 'table-scroll cockpit-matrix'); wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', `Requested versus source conditions for ${candidate.evidence_id}`);
      const table = element(d, 'table');
      table.append(element(d, 'caption', `Requested vs source (${candidate.evidence_id}). Triage states describe review context only.`));
      const head = element(d, 'tr');
      for (const t of ['Condition', 'Requested', 'Source', 'Triage', ...(before ? ['At baseline'] : []), 'Compare reason']) {
        const th = element(d, 'th', t); th.scope = 'col'; head.append(th);
      }
      const thead = element(d, 'thead'); thead.append(head);
      const tbody = element(d, 'tbody');
      matrix.forEach((cell, i) => {
        const tr = element(d, 'tr'); tr.dataset.state = cell.state; tr.dataset.key = cell.key;
        const th = element(d, 'th', cell.label); th.scope = 'row';
        const side = cell.side ? ` (${cell.side} side)` : '';
        const old = before?.[i];
        const changed = old && (old.state !== cell.state || old.requested !== cell.requested);
        if (changed) tr.dataset.changed = 'true';
        tr.append(th, element(d, 'td', cell.requested ?? 'not specified'), element(d, 'td', cell.source ?? 'not stated'),
          element(d, 'td', `${STATE_TEXT[cell.state]}${side}${cell.note ? `: ${cell.note}` : ''}`, `cockpit-state state-${cell.state}`));
        if (before) tr.append(element(d, 'td', old ? `${STATE_TEXT[old.state]}${changed ? ` · was ${old.requested ?? 'not specified'}` : ''}` : 'not in baseline'));
        tr.append(element(d, 'td', cell.why ?? (cell.key === 'o2_pct' ? 'No standalone oxygen rule in compare; see triage state.' : '—'), 'text-3'));
        tbody.append(tr);
      });
      table.append(thead, tbody); wrap.append(table); detail.append(wrap);
    }
    const qh = element(d, 'h3', 'Research questions for this line, in order');
    const ol = element(d, 'ol', null, 'cockpit-questions');
    for (const a of item.next_actions ?? []) {
      const li = element(d, 'li', a.message);
      const meta = [a.field && `field ${a.field}`, a.evidence_ids?.length && `records ${a.evidence_ids.join(', ')}`].filter(Boolean).join(' · ');
      if (meta) li.append(element(d, 'span', ` (${meta})`, 'text-3'));
      ol.append(li);
    }
    if (!ol.children.length) ol.append(element(d, 'li', 'No research action listed by triage for this line.'));
    detail.append(qh, ol);
  }

  function renderChanges() {
    if (!state.baseline || !state.triage) { changes.hidden = true; changes.replaceChildren(); return; }
    const diff = compareSnapshots(state.baseline, state.triage, state.evidence);
    const h = element(d, 'h3', 'What changed since the pinned baseline'); h.id = 'cockpit-changes-heading';
    const list = element(d, 'ul');
    for (const c of diff.conditions) list.append(element(d, 'li', `Requested ${c.label.toLowerCase()}: ${c.before ?? 'not specified'} → ${c.after ?? 'not specified'}`));
    for (const l of diff.lines) {
      const text = l.change === 'added' ? `Line ${l.line_id} (${l.name}) added: ${STATUS_TEXT[l.after]}`
        : l.change === 'removed' ? `Line ${l.line_id} (${l.name}) removed`
          : `Line ${l.line_id} (${l.name}): ${STATUS_TEXT[l.before]} → ${STATUS_TEXT[l.after]}`;
      list.append(element(d, 'li', text));
    }
    const b = diff.counts.before, a = diff.counts.after;
    const counts = element(d, 'p', `Review-ready records: ${b.review_ready_count} → ${a.review_ready_count}. Candidates: ${b.candidate_count} → ${a.candidate_count}. Fewer gaps do not mean lower fire risk.`, 'type-data');
    const ordered = orderFieldChanges(diff.fields);
    const fh = element(d, 'p', ordered.length ? `${ordered.length} record condition${ordered.length === 1 ? '' : 's'} changed state:` : 'No record changed triage state.');
    const fl = element(d, 'ol', null, 'cockpit-field-changes');
    for (const f of ordered.slice(0, 12)) fl.append(element(d, 'li', `${f.name || f.line_id}: ${describeFieldChange(f)}`));
    if (ordered.length > 12) fl.append(element(d, 'li', `${ordered.length - 12} more in the exported brief and the matrix above.`));
    if (!list.children.length) list.append(element(d, 'li', 'Requested conditions and BOM lines are unchanged.'));
    changes.replaceChildren(h, list, counts, fh, fl);
    changes.hidden = false;
  }

  function render() {
    const t = state.triage;
    load.hidden = Boolean(t);
    intro.hidden = Boolean(t);
    unpin.hidden = !state.baseline; pin.textContent = state.baseline ? 'Re-pin baseline' : 'Pin baseline';
    setExportEnabled(Boolean(t && brief));
    if (!t) {
      summary.textContent = state.message || 'No scenario evaluated yet.';
      lines.replaceChildren(); detail.replaceChildren(); changes.hidden = true; changes.replaceChildren();
      return;
    }
    const s = t.summary;
    summary.textContent = `${state.scenarioName || 'Scenario'} · ${s.line_count} lines · ${s.candidate_count} candidate records · ${s.verified_count} verified · ${s.review_ready_count} review-ready`;
    if (!t.items.some((it) => it.line_id === state.lineId)) { state.lineId = t.items[0]?.line_id ?? null; state.evidenceId = null; }
    renderLines();
    let baseIndex = null;
    if (state.baseline) {
      const rows = rowIndex(state.evidence);
      baseIndex = new Map();
      for (const it of state.baseline.items ?? []) for (const c of it.candidates ?? []) {
        baseIndex.set(`${it.line_id}\u0000${c.evidence_id}`, conditionMatrix(it, c, rows.get(c.evidence_id)));
      }
    }
    renderDetail(t.items.find((it) => it.line_id === state.lineId), baseIndex);
    renderChanges();
  }

  setExportEnabled(false);
  render();

  return {
    update({ triage, evidence, scenarioName = '' }) {
      state.triage = triage; state.evidence = evidence; state.scenarioName = scenarioName; state.message = '';
      state.exported = null;
      render();
    },
    // Invalid, empty or unavailable input clears stale analysis and disables export.
    clear(message = '') {
      state.triage = null; state.exported = null; state.message = message;
      if (dialog.open) closeBrief();
      render();
    },
    selectLineByMaterial(materialId) {
      const it = state.triage?.items.find((x) => x.material_id === materialId);
      if (it && it.line_id !== state.lineId) { state.lineId = it.line_id; state.evidenceId = null; render(); }
    },
    getState: () => ({ triage: state.triage, baseline: state.baseline, lineId: state.lineId, evidenceId: state.evidenceId }),
    destroy() { root.replaceChildren(); },
  };
}
