// Ask REDLINE (issue #68): the user types a question; src/rules/retrieve.js picks the most
// relevant catalog + evidence + insight rows client-side and this screen shows them with their
// source links. Optional live mode: with the user's own Anthropic API key (kept in a closure
// variable only, never stored, never committed) the question plus ONLY the retrieved rows go
// to the Claude API from the browser. Without a key: retrieved rows + pre-generated insights.
import { retrieve, buildPrompt, groundingHits, citationsIn, isNotFound, investigationList, NOT_FOUND } from '../rules/retrieve.js';

export const INSIGHTS_URL = 'data/insights.json';
export const INVESTIGATIONS_URL = 'data/investigations.json';
export const API_URL = 'https://api.anthropic.com/v1/messages';
export const MODEL = 'claude-sonnet-5-5';

// Screen-reader-only text (styles.css has no visually-hidden class yet; see HANDOFF.md).
const SR = 'style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"';
const GRAVITY = { 0: '0 g (microgravity)', 1: '1 g (Earth)', 0.16: '0.16 g (simulated lunar)' };

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const val = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v.value : v);
const shown = (v, unit = '') => (v == null || v === '' ? 'not stated' : `${v}${unit}`);

// Optional files: a missing catalog or insights file is an empty state, not an error.
export async function loadOptionalJson(url, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(url);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export function summarize(hit) {
  const r = hit?.row ?? {};
  if (hit?.kind === 'evidence') {
    const cond = [
      `${shown(r.material)} (${shown(r.form)})`,
      `O2 ${shown(r.o2_pct, '%')}`,
      `${shown(r.pressure_kpa, ' kPa')}`,
      GRAVITY[r.gravity_g] ?? (r.gravity_g == null ? 'gravity not stated' : `${r.gravity_g} g`),
      `flow ${shown(r.flow_direction)}${r.flow_speed_cm_s != null ? ` ${r.flow_speed_cm_s} cm/s` : ''}`,
      r.endpoint ? `${r.endpoint} ${shown(r.value, r.value_unit ? ` ${r.value_unit}` : '')}` : 'endpoint not stated',
    ].join(' Ã‚Â· ');
    return r.observation_paraphrase ? `${cond}. ${r.observation_paraphrase}` : cond;
  }
  if (hit?.kind === 'investigation') {
    return [val(r.name), val(r.fuel), val(r.objective) ?? val(r.objectives)].filter(Boolean).join(' Ã‚Â· ');
  }
  return r.text ?? '';
}

function sourceLink(src) {
  if (!src?.url) return '<span class="text-3">source link not found in the sources reviewed</span>';
  return `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.title)}<span ${SR}> (opens in new tab)</span></a>` +
    (src.locator ? ` <span class="text-3">Ã¢â‚¬â€ ${esc(src.locator)}</span>` : '');
}

function draftTag(row) {
  return row?.review_status && row.review_status !== 'verified'
    ? ` <span class="flag">${esc(row.review_status)}</span>` : '';
}

export function hitsTableHtml(hits) {
  hits = (Array.isArray(hits) ? hits : []).filter((h) => h && typeof h === 'object');
  if (!hits.length) return `<p class="text-2">No rows matched. Answer: ${NOT_FOUND}.</p>`;
  const rows = hits.map((h) => `<tr>
      <td class="type-data">${esc(h.id)}${draftTag(h.row)}</td>
      <td>${esc(h.kind)}</td>
      <td class="type-small">${esc(summarize(h))}</td>
      <td class="type-small text-2">${esc([...new Set((h.matched ?? []).map((m) => m?.term).filter(Boolean))].join(', '))}</td>
      <td class="type-small">${sourceLink(h.source)}</td>
    </tr>`).join('');
  return `<table><caption ${SR}>Rows retrieved for your question</caption>
    <thead><tr><th scope="col">ID</th><th scope="col">Kind</th><th scope="col">What the source says</th>
    <th scope="col">Matched words</th><th scope="col">Source</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// Insights relevant to the retrieved rows: retrieved directly, or citing a retrieved row.
export function relatedInsights(hits, insights) {
  const ids = new Set((Array.isArray(hits) ? hits : []).filter(Boolean).map((h) => String(h.id)));
  const list = Array.isArray(insights?.insights) ? insights.insights : [];
  return list.filter((ins) => ins && (ids.has(ins.insight_id) || (ins.cited_ids ?? []).some((id) => ids.has(id))));
}

export function insightHtml(ins, sources = {}) {
  ins = ins ?? {};
  sources = sources ?? {};
  const cited = Array.isArray(ins.cited_ids) ? ins.cited_ids : [];
  const check = ins.checked_by_team
    ? `AI-generated, checked by team (${esc(ins.checked_by)})`
    : 'AI-generated, not yet checked by team';
  const links = cited.filter((id) => sources[id]?.url)
    .map((id) => sourceLink({ title: sources[id].title, url: sources[id].url })).join('; ');
  return `<article class="panel ask-insight">
    <h4 class="type-label">${esc(ins.subject?.name ?? 'Insight')} <span class="flag">${check}</span></h4>
    <p class="type-body">${esc(ins.text)}</p>
    <p class="type-small text-2">Cited rows: ${esc(cited.join(', ') || 'none')}</p>
    ${links ? `<p class="type-small">Sources: ${links}</p>` : ''}
  </article>`;
}

// Words of the question that no evidence, catalog or insight row mentions.
export function coverageHtml(unmatched) {
  const words = (Array.isArray(unmatched) ? unmatched : []).filter(Boolean);
  if (!words.length) return '';
  return `<p class="caveat type-body" data-role="coverage">No row mentions: ${esc(words.join(', '))}. ` +
    `About ${words.length > 1 ? 'those' : 'that'}, the answer is: ${NOT_FOUND}. ` +
    'The rows below match other words in your question and may not answer it.</p>';
}

// Escapes the model's answer and turns [ID] citations into links to that row's source.
export function answerHtml(answer, hits) {
  answer = String(answer ?? '');
  if (/\bsafe\b|never\s+tested|never\s+burns|will\s+burn\s+on\s+the\s+moon|nonflammable/i.test(answer)) {
    return '<p class="caveat type-small">Live answer withheld: it used wording that goes beyond the evidence. Read the retrieved NASA rows below.</p>';
  }
  hits = (Array.isArray(hits) ? hits : []).filter((h) => h && typeof h === 'object');
  const byId = new Map(hits.map((h) => [String(h.id), h]));
  const { unknown } = citationsIn(answer, hits);
  const body = esc(answer).replace(/\[([^\]]+)\]/g, (whole, inner) => {
    const parts = inner.split(/[,;]\s*/).map((raw) => {
      const id = raw.trim();
      const h = byId.get(id);
      return h?.source?.url
        ? `<a href="${esc(h.source.url)}" target="_blank" rel="noopener noreferrer">${id}</a>`
        : id;
    });
    return `[${parts.join(', ')}]`;
  });
  const warn = unknown.length
    ? `<p class="caveat type-small">Caveat: the answer cites ${esc(unknown.join(', '))}, which ${unknown.length > 1 ? 'are' : 'is'} not among the retrieved rows. Do not rely on ${unknown.length > 1 ? 'those' : 'that'} citation.</p>`
    : '';
  const uncited = !isNotFound(answer) && !citationsIn(answer, hits).cited.length
    ? '<p class="caveat type-small">Caveat: the answer cites no retrieved row, so it is not grounded in the sources shown.</p>'
    : '';
  return `<p class="type-body">${body}</p>${warn}${uncited}`;
}

// askClaude -> answer text. Sends the question and ONLY the retrieved rows.
export async function askClaude({ apiKey, question, hits, fetchImpl = fetch, model = MODEL }) {
  const { system, messages } = buildPrompt(question, hits);
  const res = await fetchImpl(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: 700, system, messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

const FORM = `
  <form class="ask-form" data-role="form">
    <label for="ask-question">Question about the NASA tests</label>
    <input id="ask-question" name="question" type="text" autocomplete="off" required
      aria-describedby="ask-help" size="48">
    <button type="submit">Ask</button>
    <p id="ask-help" class="type-small text-3">Example: "Which materials were tested at lunar gravity?" REDLINE searches the evidence rows, the investigation catalog and the pre-generated insights in your browser.</p>
  </form>
  <details class="ask-live">
    <summary>Optional live answer with your own Anthropic API key</summary>
    <label for="ask-key">Anthropic API key</label>
    <input id="ask-key" type="password" autocomplete="off" spellcheck="false" data-role="key">
    <button type="button" data-action="forget">Forget key</button>
    <p class="type-small text-3">The key stays in this page's memory only: it is not saved, and it is cleared when you reload. With a key, your question and only the catalog and evidence rows shown below (not the AI-written insights) are sent from your browser to api.anthropic.com, and Claude is told to answer only from those rows.</p>
  </details>
  <div role="status" aria-live="polite" class="text-2 type-small" data-role="status"></div>
  <div data-role="answer"></div>
  <div class="table-scroll" data-role="hits"></div>
  <div data-role="insights"></div>`;

// renderAsk(root, { evidence, investigations, insights }) -> { ask(question) }
export function renderAsk(root, data = {}, { requestAnswer = askClaude } = {}) {
  data = data ?? {};
  root.innerHTML = FORM;
  const sources = data.evidence?.sources || {};
  const $ = (role) => root.querySelector(`[data-role="${role}"]`);
  let apiKey = '';
  let revision = 0;
  const keyInput = $('key');
  keyInput.addEventListener('input', () => { apiKey = keyInput.value.trim(); });
  root.querySelector('[data-action="forget"]').addEventListener('click', () => {
    revision++;
    apiKey = '';
    keyInput.value = '';
    $('status').textContent = 'Key forgotten.';
  });

  async function ask(question) {
    const current = ++revision;
    question = String(question ?? '').trim();
    if (!question) {
      $('status').textContent = 'Enter a question about the NASA tests.';
      return { hits: [], answer: null };
    }
    let hits = [], unmatched = [];
    try {
      ({ hits, unmatched = [] } = retrieve(question, data, { limit: 8 }));
    } catch {
      $('answer').innerHTML = '';
      $('hits').innerHTML = '';
      $('insights').innerHTML = '';
      $('status').textContent = 'Error: evidence search could not run. Try again or reload the evidence. This is a search failure, not a finding about coverage.';
      return { hits: [], answer: null, error: 'retrieval failed' };
    }
    hits = Array.isArray(hits) ? hits : [];
    $('answer').innerHTML = unmatched.length && hits.length ? coverageHtml(unmatched) : '';
    $('hits').innerHTML = `<h3 class="type-heading">Retrieved rows (${hits.length})</h3>${hitsTableHtml(hits)}`;
    const related = relatedInsights(hits, data.insights);
    $('insights').innerHTML = related.length
      ? `<h3 class="type-heading">Pre-generated insights</h3>${related.map((i) => insightHtml(i, sources)).join('')}`
      : '';
    if (!apiKey) {
      $('status').textContent = `${hits.length} rows retrieved by matching words in your question; they are not an answer. Add an API key for a live answer, or read the rows and insights below.`;
      return { hits, answer: null };
    }
    const ground = groundingHits(hits);
    if (!ground.length) {
      $('answer').innerHTML = `<p class="type-body">${NOT_FOUND}.</p>`;
      $('status').textContent = 'No catalog or evidence rows retrieved, so nothing was sent to Claude.';
      return { hits, answer: NOT_FOUND };
    }
    $('status').textContent = 'Asking Claude using only the retrieved rowsÃ¢â‚¬Â¦';
    try {
      const answer = await requestAnswer({ apiKey, question, hits: ground });
      if (current !== revision) return { hits, answer: null, stale: true };
      $('answer').innerHTML = `${unmatched.length ? coverageHtml(unmatched) : ''}<section class="panel"><h3 class="type-heading">Answer <span class="flag">AI-generated from the rows below</span></h3>${answerHtml(answer, ground)}</section>`;
      $('status').textContent = '';
      return { hits, answer };
    } catch (err) {
      if (current !== revision) return { hits, answer: null, stale: true };
      $('status').textContent = `Error: the live answer failed (${err.message}). The retrieved rows are still shown below.`;
      return { hits, answer: null, error: err };
    }
  }

  $('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = root.querySelector('#ask-question').value.trim();
    if (q) ask(q);
  });
  return { ask };
}

// Plain-language notice for a failed data/evidence.json load, with a retry link (#169).
export function evidenceErrorHtml(retryHref = '') {
  return `<div class="panel" role="alert"><p class="type-body">The NASA evidence file (data/evidence.json) could not load, so REDLINE cannot search the test results right now. Check your connection, then <a href="${esc(retryHref)}" data-action="retry">retry</a>.</p></div>`;
}

// Convenience loader for main.js: evidence is passed in; catalog and insights are optional.
// With no evidence (the evidence.json load failed) it shows the retry notice instead of a dead form.
export async function mountAsk(root, evidence, fetchImpl = fetch) {
  if (!evidence || typeof evidence !== 'object') {
    root.innerHTML = evidenceErrorHtml(globalThis.location?.href ?? '');
    root.querySelector('[data-action="retry"]')?.addEventListener('click', (e) => {
      if (globalThis.location?.reload) { e.preventDefault(); globalThis.location.reload(); }
    });
    return null;
  }
  const [investigations, insights] = await Promise.all([
    loadOptionalJson(INVESTIGATIONS_URL, fetchImpl),
    loadOptionalJson(INSIGHTS_URL, fetchImpl),
  ]);
  return renderAsk(root, { evidence, investigations: investigationList(investigations).length ? investigations : null, insights });
}
