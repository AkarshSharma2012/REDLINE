// Readable Ask results (#339, B1 fallback for offline A2): question -> what matched -> strongest
// source cards with original conditions -> why a record may not answer -> next research check.
// Deterministic from retrieved rows only: no generated summary, no confidence meter.
// All untrusted text passes through esc(); links come from the source registry via sourceLink.
// Local HTML escape (same rules as the Ask boundary module, which only ask.js may import).
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { reviewedGravity, reviewedForm, reviewedEndpoint } from './evidence-provenance.js';

export const EXAMPLE_QUESTIONS = Object.freeze([
  'Which PMMA tests ran in microgravity?',
  'What was tested at lunar gravity?',
  'Nomex oxygen limit tests',
  'Cotton fabric flame spread',
]);

const FIELDS = [
  ['Form', (r) => reviewedForm(r) ?? r.form],
  ['Oxygen', (r) => (r.o2_pct == null ? null : `${r.o2_pct}%`)],
  ['Pressure', (r) => (r.pressure_kpa == null ? null : `${r.pressure_kpa} kPa`)],
  ['Gravity', (r) => reviewedGravity(r) ?? (r.gravity_g == null ? null : `${r.gravity_g} g`)],
  ['Flow', (r) => [r.flow_direction, r.flow_speed_cm_s == null ? null : `${r.flow_speed_cm_s} cm/s`].filter((v) => v != null && v !== '').join(' ') || null],
  ['Endpoint', (r) => reviewedEndpoint(r) ?? r.endpoint],
];

function conditions(row) {
  return FIELDS.map(([label, get]) => {
    const v = get(row);
    return { label, value: v == null || v === '' ? null : String(v) };
  });
}

// Reasons a matched record may not answer the question. Facts about the record only.
export function caveatsFor(hit, unmatched = []) {
  const row = hit?.row ?? {};
  const out = [];
  if (row.review_status && row.review_status !== 'verified') out.push(`Review status is ${row.review_status}: not verified against the source by the team.`);
  const missing = conditions(row).filter((c) => c.value === null).map((c) => c.label.toLowerCase());
  if (missing.length) out.push(`The record does not state: ${missing.join(', ')}.`);
  const words = (Array.isArray(unmatched) ? unmatched : []).filter(Boolean);
  if (words.length) out.push(`No retrieved record mentions: ${words.join(', ')}.`);
  const matched = [...new Set((hit?.matched ?? []).map((m) => m?.term).filter(Boolean))];
  if (matched.length) out.push(`Matched on the words: ${matched.join(', ')}. A word match is not an answer.`);
  return out;
}

export function nextCheckFor(hit) {
  const row = hit?.row ?? {};
  const missing = conditions(row).filter((c) => c.value === null).map((c) => c.label.toLowerCase());
  const where = hit?.source?.locator ? `at ${hit.source.locator}` : 'in the cited source';
  if (missing.length) return `Open the source ${where} and look for the unstated ${missing.slice(0, 3).join(', ')} before relying on this record.`;
  if (row.review_status && row.review_status !== 'verified') return `Open the source ${where} and confirm the recorded conditions; the record is still a draft.`;
  return `Compare these tested conditions with your own scenario before citing the record.`;
}

export function sourceCardHtml(hit, unmatched, sourceLink) {
  const row = hit.row ?? {};
  const draft = row.review_status && row.review_status !== 'verified' ? ` <span class="flag">${esc(row.review_status)}, not verified</span>` : '';
  const dl = conditions(row).map((c) => `<dt>${esc(c.label)}</dt><dd>${c.value === null ? '<span class="text-3">not stated</span>' : esc(c.value)}</dd>`).join('');
  const why = caveatsFor(hit, unmatched).map((t) => `<li>${esc(t)}</li>`).join('');
  return `<article class="ask-card" data-role="source-card" data-id="${esc(hit.id)}">
    <h4 class="type-label"><span class="type-data">${esc(hit.id)}</span> · ${esc(row.material ?? row.material_id ?? 'Material not stated')}${draft}</h4>
    ${row.observation_paraphrase ? `<p class="type-body">${esc(row.observation_paraphrase)}</p>` : ''}
    <dl class="ask-conditions">${dl}</dl>
    <p class="type-small">Source: ${sourceLink(hit.source)}</p>
    <details class="ask-why"><summary>Why it may not answer your question</summary><ul>${why}</ul></details>
    <p class="ask-next"><strong>Next research check:</strong> ${esc(nextCheckFor(hit))}</p>
  </article>`;
}

// Summary + up to three strongest evidence records, in retrieval order.
export function resultsSummaryHtml(hits, unmatched, sourceLink, { max = 3 } = {}) {
  hits = (Array.isArray(hits) ? hits : []).filter((h) => h && typeof h === 'object');
  if (!hits.length) {
    return `<section class="ask-summary" data-role="summary"><h3 class="type-heading">What matched</h3>
      <p class="type-body">No record matched the words in your question. Try a material (PMMA, Nomex, cotton), a condition (oxygen, pressure, microgravity) or an investigation name.</p></section>`;
  }
  const count = (k) => hits.filter((h) => h.kind === k).length;
  const ev = hits.filter((h) => h.kind === 'evidence');
  const parts = [[count('evidence'), 'evidence record'], [count('investigation'), 'investigation'], [count('insight'), 'stored insight']]
    .filter(([n]) => n).map(([n, w]) => `${n} ${w}${n === 1 ? '' : 's'}`).join(', ');
  const cards = ev.slice(0, max).map((h) => sourceCardHtml(h, unmatched, sourceLink)).join('');
  return `<section class="ask-summary" data-role="summary"><h3 class="type-heading">What matched</h3>
    <p class="type-body">${esc(parts)} matched words in your question. These are search matches with their original test conditions, not an answer.</p>
    ${ev.length ? `<h4 class="type-label">Strongest matching evidence${ev.length > max ? ` (top ${max} of ${ev.length})` : ''}</h4><div class="ask-cards">${cards}</div>`
    : '<p class="type-body">No evidence record matched; see the catalog rows below.</p>'}
  </section>`;
}
