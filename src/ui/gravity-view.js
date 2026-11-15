// Research display adapter, deliberately separate from S1 evidence/label inputs.
const SOURCES = {
  urban: ['Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results',
    'https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf'],
  marcum: ['Correlation of normal gravity mixed convection blowoff limits with microgravity forced flow blowoff limits',
    'https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf'],
};
const GROUPS = [
  ['pmma', 'PMMA', 'PMMA sheet · flaming', 'Fig. 7, p. 8'],
  ['p213', 'P213', 'P213 fiberglass tape with acrylic adhesive · flaming', 'Fig. 8, p. 8'],
  ['cotton-flaming', 'Cotton', 'Cotton Beefy-T · flaming', 'Fig. 9, p. 8'],
  ['cotton-smolder', 'Cotton', 'Cotton Beefy-T · smolder extinction', 'Fig. 10, p. 8'],
  ['polycarbonate', 'Polycarbonate', 'Polycarbonate · flaming', 'Fig. 11, p. 9'],
  ['nomex-velcro', 'Nomex', 'Nomex Velcro · flaming', 'Fig. 12, p. 9'],
  ['nomex-fabric', 'Nomex', 'Nomex HT90-40 fabric · historical endpoints', 'Table I, p. 6'],
];
const FABRIC_SOURCE = ['Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test',
  'https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf'];
const mounted = new WeakMap();
const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const known = (n) => typeof n === 'number' && Number.isFinite(n);
const number = (n, unit) => known(n) ? `${n} ${unit}` : 'Not stated in this source';

function nasaUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov')
      || u.hostname === 'taskbook.nasaprs.com') ? u.href : null;
  } catch { return null; }
}

function sourceLink(title, url, locator) {
  const href = nasaUrl(url);
  if (!href || !title || !locator) return 'Source metadata unavailable';
  const page = String(locator).match(/(?:slide|p\.?|page)\s*(\d+)/i)?.[1];
  return `<a href="${escape(href)}${page && !href.includes('#') ? `#page=${page}` : ''}" target="_blank" rel="noopener noreferrer">${escape(title)} — ${escape(locator)} <span class="gv-hint">(opens in new tab)</span></a>`;
}

const citation = (p) => sourceLink(p.source_title, p.source_url, p.source_locator);
const groupSource = (g) => sourceLink(...(g[0] === 'nomex-fabric' ? FABRIC_SOURCE : SOURCES.urban), g[3]);

// Missing provenance/units never becomes an illustrative dot or a zero.
function missingFields(p) {
  const missing = [];
  for (const field of ['evidence_id', 'material', 'form', 'endpoint', 'gravity_context', 'facility',
    'uncertainty', 'review_status', 'source_title', 'source_locator']) {
    if (typeof p[field] !== 'string' || !p[field].trim()) missing.push(field);
  }
  if (!nasaUrl(p.source_url)) missing.push('NASA source_url');
  if (p.value_unit !== '% O2') missing.push('value_unit (% O2)');
  if (!known(p.value) || p.value < 0 || p.value > 100) missing.push('oxygen value');
  if (!['measurement', 'digitized-reference', 'extrapolation'].includes(p.kind)) missing.push('extraction kind');
  return missing;
}

function basis(p) {
  if (p.kind === 'extrapolation') return 'Earth-based prediction · REDLINE digitized/extrapolated fit (not a measurement)';
  if (p.kind === 'digitized-reference') return 'Measured simulated-lunar reference · REDLINE digitized ordinate';
  return 'Tabulated measurement · source endpoint criteria apply';
}

function conditions(p) {
  const pressure = known(p.pressure_kpa) ? number(p.pressure_kpa, 'kPa') : number(p.pressure_psia, 'psia');
  const flow = p.kind === 'extrapolation'
    ? `${number(p.comparison_velocity_cm_s, 'cm/s')} comparison coordinate; not an observed flow`
    : `${number(p.flow_speed_cm_s, 'cm/s')} forced flow; buoyant speed not inferred`;
  return `${p.material}; ${p.form}; thickness ${number(p.thickness_mm, 'mm')}; ${pressure}; ${flow}; ${p.flow_direction || 'direction not stated'}; ${p.gravity || 'gravity not stated'} (${p.gravity_context}); ${p.facility}; observation ${number(p.test_duration_s, 's')}`;
}

// Cabin request in words and units, never raw JSON (persona B2 finding).
const GRAVITY_TEXT = { 0: 'microgravity reference (0 g)', 1: 'Earth reference (1 g)', 0.16: 'lunar scenario (0.16 g, estimate)' };
export function requestText(r = {}) {
  const has = (v) => typeof v === 'number' && Number.isFinite(v);
  return [
    has(r.o2_pct) ? `${r.o2_pct}% O2` : 'O2 not stated',
    has(r.pressure_kpa) ? `${r.pressure_kpa} kPa absolute` : 'pressure not stated',
    has(r.flow_speed_cm_s) ? `forced airflow ${r.flow_speed_cm_s} cm/s` : 'forced airflow not specified',
    r.flow_direction ? `${r.flow_direction} flow` : 'flow direction not specified',
    has(r.gravity_g) ? (GRAVITY_TEXT[r.gravity_g] ?? `${r.gravity_g} g`) : 'gravity not stated',
  ].join('; ');
}

function dataTable(points, research) {
  if (!points.length) return '<p>No numeric records in this series.</p>';
  return `<div class="gv-scroll" tabindex="0" role="region" aria-label="${research ? 'Research detail' : 'Reviewed'} chart data"><table>
    <caption>Oxygen limits for these tested setups · simulated-lunar references are not lunar-surface measurements</caption>
    <thead><tr><th scope="col">Series / record</th><th scope="col">Oxygen (vol%)</th><th scope="col">Endpoint and conditions</th><th scope="col">Uncertainty / status / source</th></tr></thead>
    <tbody>${points.map((p) => {
      const missing = missingFields(p);
      return `<tr><th scope="row">${escape(basis(p))}<br>${escape(p.evidence_id)}<br><button type="button" data-record="${escape(p.evidence_id)}">Open evidence record</button></th>
      <td>${missing.length ? `Value withheld: missing ${escape(missing.join(', '))}` : `${escape(p.value)} % O2<br>${citation(p)}`}</td>
      <td>${escape(p.endpoint)}<br>${escape(conditions(p))}<br>Criterion: ${escape(p.pass_criterion || 'Not stated in this source')}<br>Run: ${escape(p.run_id || 'Not stated in this source')}<br>${p.condition_source_locator ? sourceLink(p.condition_source_title, p.condition_source_url, p.condition_source_locator) : citation(p)}</td>
      <td>${escape(p.uncertainty)}<br>Review: ${escape(p.review_status)}<br>${escape(p.notes)}<br>${citation(p)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

/** Hand-built SVG; unknown lunar flow stays outside the airflow coordinate system. */
function chart(points, historical, research) {
  const valid = points.filter((p) => missingFields(p).length === 0);
  const plotted = historical ? [] : valid.filter((p) => p.kind === 'extrapolation'
    ? known(p.comparison_velocity_cm_s) && p.comparison_velocity_cm_s >= 0
    : known(p.flow_speed_cm_s) && p.flow_speed_cm_s >= 0);
  const references = historical ? valid : valid.filter((p) => p.kind !== 'extrapolation' && !known(p.flow_speed_cm_s));
  if (!valid.length) return '<p>No source-complete numeric marks available.</p>';
  // Historical endpoints are categorical records, never a continuous gravity curve.
  const marks = historical ? references : plotted;
  const values = valid.map((p) => p.value);
  const low = Math.max(0, Math.floor(Math.min(...values) - 2));
  const high = Math.min(100, Math.ceil(Math.max(...values) + 2));
  const span = high - low || 1;
  const y = (v) => 270 - (v - low) / span * 208;
  const xmax = Math.max(40, ...plotted.map((p) => p.kind === 'extrapolation' ? p.comparison_velocity_cm_s : p.flow_speed_cm_s));
  const x = (v) => 64 + v / xmax * 500;
  const name = `${research ? 'Draft research detail: ' : ''}oxygen limits, Earth-based prediction and measured simulated-lunar context`;
  const axes = [0, 1, 2, 3, 4].map((i) => {
    const v = low + span * i / 4;
    return `<line x1="64" x2="584" y1="${y(v)}" y2="${y(v)}" stroke="#2C313A"/><text x="54" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1)}</text>`;
  }).join('');
  const ticks = historical ? '' : [0, xmax / 2, xmax].map((v) => `<text x="${x(v)}" y="292" text-anchor="middle">${v.toFixed(0)}</text>`).join('');
  const dots = marks.map((p, i) => {
    const px = historical ? 100 + i * 450 / Math.max(1, marks.length - 1) : x(p.kind === 'extrapolation' ? p.comparison_velocity_cm_s : p.flow_speed_cm_s);
    const py = y(p.value);
    const label = `${p.evidence_id}: ${basis(p)}, ${p.value} % O2; ${p.endpoint}; ${p.source_locator}; ${p.review_status}`;
    const marker = p.kind === 'extrapolation'
      ? `<path d="M${px},${py - 6} l6,6 -6,6 -6,-6 Z" fill="#16191E" stroke="#E8EAED" stroke-width="2"/>`
      : `<circle cx="${px}" cy="${py}" r="5" fill="#E8EAED"/>`;
    const page = p.source_locator.match(/(?:slide|p\.?|page)\s*(\d+)/i)?.[1];
    const href = nasaUrl(p.source_url);
    return `<a href="${escape(href)}${page && !href.includes('#') ? `#page=${page}` : ''}" target="_blank" rel="noopener noreferrer" fill="#7CB8FF" aria-label="${escape(label)} (opens in new tab)" data-point="${escape(p.evidence_id)}"><title>${escape(label)}</title>${marker}<text x="${px < 100 ? px + 10 : px}" y="${py - 12}" text-anchor="${px < 100 ? 'start' : 'middle'}">${p.value.toFixed(1)}</text>${historical ? `<text x="${px}" y="292" text-anchor="middle">${escape(p.gravity)} · ${escape(p.endpoint)}</text>` : ''}</a>`;
  }).join('');
  return `<figure><figcaption>${escape(name)}. ${historical ? 'Discrete gravity/endpoint categories; criteria differ.' : 'Oxygen (vol%) versus forced airflow comparison coordinate (cm/s).'}</figcaption>
    <div class="gv-scroll" tabindex="0" role="region" aria-label="Oxygen chart viewport"><svg viewBox="0 0 640 336" fill="#A9B0BB" role="img" aria-label="${escape(name)}; full values and provenance in adjacent data table" style="width:100%;min-width:640px;display:block;background:#16191E;color:#A9B0BB;font:13px system-ui">
    ${axes}<path d="M64 48 V270 H584" fill="none" stroke="#737B88"/><text x="64" y="24">Oxygen (vol%)</text>${ticks}${dots}
    <text x="320" y="326" text-anchor="middle">${historical ? 'Gravity / endpoint (categorical; no interpolation)' : 'Forced airflow comparison coordinate (cm/s)'}</text></svg></div>
    <p>Hollow diamond: REDLINE extrapolation. Solid circle: tabulated measurement. No continuous gravity curve or connecting line.</p>
    ${!historical && references.length ? `<div class="gv-note"><strong>Separate simulated-lunar references · flow not stated; not plotted at zero</strong>${references.map((p) => `<p>${escape(p.material)} · ${escape(p.endpoint)}: approximately ${p.value.toFixed(1)} % O2; ${escape(p.uncertainty)}. ${citation(p)}</p>`).join('')}</div>` : ''}
    ${!historical && (!plotted.length || !references.length) ? '<p>Counterpart unavailable; no difference or connecting line is computed.</p>' : ''}</figure>`;
}

const style = `<style>
.gravity-view{color:var(--text-1,#E8EAED);background:var(--bg,#0E1013);font:14px/1.5 system-ui;padding:16px;overflow-wrap:anywhere}
.gravity-view *{box-sizing:border-box}.gravity-view h2{font-size:20px}.gravity-view h3{font-size:16px}.gravity-view h4{font-size:14px}
.gravity-view a{color:var(--accent,#7CB8FF);text-decoration:underline}.gravity-view .gv-hint{font-size:12px}
.gravity-view button,.gravity-view select{font:inherit;color:#E8EAED;background:#1E2228;border:1px solid #737B88;border-radius:4px;padding:4px 8px;min-height:32px;max-width:100%}
.gravity-view :focus-visible{outline:2px solid #7CB8FF;outline-offset:2px}.gravity-view button[aria-pressed=true]{border-bottom:3px solid #7CB8FF}
.gravity-view nav{display:flex;gap:8px;flex-wrap:wrap}.gravity-view label{display:block;margin:12px 0}.gravity-view select{display:block;margin-top:4px}
.gravity-view .gv-note,.gravity-view article{padding:12px;border:1px solid #737B88;margin:16px 0;background:#16191E}
.gravity-view figure{margin:16px 0}.gravity-view .gv-scroll{overflow-x:auto;max-width:100%}.gravity-view table{border-collapse:collapse;min-width:640px;width:100%;font-size:13px}
.gravity-view th,.gravity-view td{text-align:left;vertical-align:top;border:1px solid #2C313A;padding:8px 12px}.gravity-view td:nth-child(2){font-variant-numeric:tabular-nums}
.gravity-view summary{cursor:pointer;padding:8px 0;min-height:32px}.gravity-view .gv-status{color:#A9B0BB}.gravity-view dl{margin:0}.gravity-view dd{margin:0 0 8px}
</style>`;

function contextCards() {
  return `<article><h3>Airflow regime · qualitative context</h3><p>Low flow: extinction / quenching. Intermediate flow: sustaining conditions. High flow: extinction / blowoff. No universal numeric cutoffs are assigned.</p>
    <p>Forced flow direction and buoyancy depend on the setup. REDLINE inference: a high-flow correlation alone does not establish the low-flow boundary.</p>${sourceLink(...SOURCES.urban, 'Fig. 1, p. 2')}
    <p>Stopped spreading does not mean stopped burning. Spread cessation (LOC-FS) and final regression-flame extinction (LOC-FR) remain separate endpoints.</p>
    ${sourceLink('Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres, FY2025', 'https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225', 'pp. 2–3')}</article>
    <article><h3>Corrected Earth tests can reproduce a particular flight boundary</h3>
    <p>Marcum’s concurrent, axisymmetric PMMA rod / stagnation-flow blowoff comparison accounts for buoyancy and blockage. The corrections align ground results with the flight blowoff branch for these tested setups.</p>
    <p>Flight data informed calibration. REDLINE inference: this is useful condition-specific agreement, not independent universal Earth-to-space prediction. It does not establish a low-flow quenching boundary, another geometry, or lunar behavior. No numerical agreement tolerance is supplied here.</p>
    ${sourceLink(...SOURCES.marcum, 'pp. 6–9, Figs. 4–6, Table 1')}
    <p><button type="button" data-context="marcum">Open Marcum evidence context</button></p></article>`;
}

/** Load this separate display dataset; it must never be passed to labelCabin. */
export async function loadGravityPoints(url = new URL('../../data/gravity-points.json', import.meta.url), fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`Gravity data: HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.schema_version !== 'gravity-view-1' || !Array.isArray(data.points)
    || data.points.some((p) => !p || typeof p !== 'object')) throw new Error('Gravity data schema unavailable');
  return data;
}

/**
 * Mount standalone screen. Caller owns scenario/navigation and engine eligibility.
 * onOpenEvidence receives the unmodified record plus { request, researchOnly }.
 * Returns { ready, reload, destroy }; destroy invalidates outstanding loads.
 */
export function renderGravityView(root, options = {}) {
  if (!root || typeof root.addEventListener !== 'function') throw new TypeError('Gravity view needs a DOM root');
  mounted.get(root)?.destroy();
  let data = options.data;
  let selected = GROUPS.some((g) => g[0] === options.groupId) ? options.groupId : 'pmma';
  let historicalEndpoint = 'ULOI';
  let generation = 0;
  let destroyed = false;
  let evidenceOpener = null;

  function draw(status = '', error = false) {
    if (destroyed) return;
    evidenceOpener = null;
    const group = GROUPS.find((g) => g[0] === selected);
    const historical = selected === 'nomex-fabric';
    const selectedPoints = (data?.points ?? []).filter((p) => p.group_id === selected
      && (!historical || (typeof p.endpoint === 'string' && p.endpoint.replace('*', '') === historicalEndpoint)));
    const reviewed = selectedPoints.filter((p) => p.review_status === 'verified');
    const draft = selectedPoints.filter((p) => p.review_status !== 'verified');
    const family = group[1];
    root.innerHTML = `${style}<section class="gravity-view" aria-label="Gravity evidence review">
      <h2>Earth-based prediction vs measured simulated-lunar result</h2>
      <p>For these tested setups. Not measurements on the lunar surface. Evidence review, not cabin certification.</p>
      ${options.onBack ? '<button type="button" data-back>Back to cabin</button>' : ''}
      ${options.request ? `<p>Requested conditions (user input): ${escape(requestText(options.request))}. Source records remain at their published conditions.</p>` : ''}
      <nav aria-label="Material family">${[...new Set(GROUPS.map((g) => g[1]))].map((f) => `<button type="button" data-family="${f}" aria-pressed="${f === family}">${f}</button>`).join('')}</nav>
      <label>Specimen / endpoint / condition group<select data-group>${GROUPS.filter((g) => g[1] === family).map((g) => `<option value="${g[0]}" ${g[0] === selected ? 'selected' : ''}>${g[2]}</option>`).join('')}</select></label>
      ${historical ? `<label>Historical endpoint (criteria differ by gravity)<select data-endpoint><option ${historicalEndpoint === 'ULOI' ? 'selected' : ''}>ULOI</option><option ${historicalEndpoint === 'MOC' ? 'selected' : ''}>MOC</option></select></label>` : ''}
      <p>${groupSource(group)}</p>
      <p class="gv-status" role="status" aria-live="polite">${escape(status)}</p>${error ? '<button type="button" data-retry>Retry gravity data</button>' : ''}
      ${data ? `<div class="gv-note"><strong>Scientific review state</strong><p>R3 reports plot/text and fit/table discrepancies in the 2025 extraction. Numeric series retain their original review status. No directional summary, computed difference, or compensation factor is used as a measured limit.</p>${sourceLink(...SOURCES.urban, 'p. 9 discussion; Table 2, p. 11')}</div>
      <h3>${escape(group[2])}</h3>
      ${reviewed.length ? `${chart(reviewed, historical, false)}${dataTable(reviewed, false)}` : '<p>Reviewed numeric series unavailable. No reviewed limits are inferred for this request.</p>'}
      ${draft.length ? `<details data-research><summary>Inspect draft research detail · excluded from cabin results</summary><p>Research only. These are unreviewed extractions, not approved numeric series. Reading/extrapolation allowances are editorial estimates, not instrument uncertainty or confidence intervals. Dashed fitted extensions are withheld pending science review.</p>${chart(draft, historical, true)}${dataTable(draft, true)}</details>` : ''}
      ${!selectedPoints.length ? '<p>No records in this extraction for the selected condition group. Source links remain available.</p>' : ''}
      <p class="gv-status">Research revision: ${escape(data.research_revision || 'Not stated')}; ${escape(data.research_path || 'Not stated')}</p>` : ''}
      <div class="gv-note"><h3>0 g / 1 g assumed envelope unavailable</h3><p>No reviewed compatible endpoint pair is supplied here. Do not infer a lunar threshold or clamp simulated-gravity results into an assumed range. Lunar behavior may fall outside a range between 0 g and 1 g results.</p>${sourceLink(...FABRIC_SOURCE, 'pp. 2–4; Table I and Eq. (1), p. 6')}</div>
      ${contextCards()}<section data-evidence-detail aria-label="Selected evidence detail"></section></section>`;
  }

  async function reload() {
    const ticket = ++generation;
    data = null;
    draw('Loading gravity evidence…');
    try {
      const loaded = await loadGravityPoints(options.url, options.fetchImpl);
      if (!destroyed && ticket === generation) { data = loaded; draw('Gravity research loaded. Review gates apply.'); }
    } catch (err) {
      if (!destroyed && ticket === generation) draw(`Gravity data could not be loaded (${err.message}).`, true);
    }
  }

  function click(event) {
    const target = event.target.closest('button');
    if (!target || !root.contains(target)) return;
    if (target.hasAttribute('data-back')) options.onBack?.(options.request);
    if (target.hasAttribute('data-close')) closeEvidence();
    if (target.hasAttribute('data-retry')) void reload();
    if (target.dataset.family) {
      selected = GROUPS.find((g) => g[1] === target.dataset.family)[0];
      draw('Material selection updated.');
      root.querySelector(`[data-family="${target.dataset.family}"]`)?.focus();
    }
    const record = data?.points.find((p) => p.evidence_id === target.dataset.record);
    if (record || target.dataset.context) {
      const selectedRecord = record ?? { evidence_id: 'M16-context', source_title: SOURCES.marcum[0], source_url: SOURCES.marcum[1], source_locator: 'pp. 6–9, Figs. 4–6, Table 1' };
      if (options.onOpenEvidence) options.onOpenEvidence(selectedRecord, { request: options.request, researchOnly: record?.review_status !== 'verified' });
      else {
        const panel = root.querySelector('[data-evidence-detail]');
        evidenceOpener = target;
        panel.innerHTML = `<button type="button" data-close>Close evidence detail</button><h3>Selected evidence: ${escape(selectedRecord.evidence_id)}</h3>${record ? dataTable([record], record.review_status !== 'verified') : sourceLink(...SOURCES.marcum, selectedRecord.source_locator)}`;
        panel.tabIndex = -1;
        panel.focus();
      }
    }
  }

  function closeEvidence() {
    const panel = root.querySelector('[data-evidence-detail]');
    panel.innerHTML = '';
    if (evidenceOpener && root.contains(evidenceOpener)) evidenceOpener.focus();
    evidenceOpener = null;
  }

  function keydown(event) {
    if (event.key === 'Escape' && evidenceOpener) {
      event.preventDefault();
      closeEvidence();
    }
  }

  function change(event) {
    if (event.target.matches('[data-group]')) selected = event.target.value;
    else if (event.target.matches('[data-endpoint]')) historicalEndpoint = event.target.value;
    else return;
    const selector = event.target.matches('[data-group]') ? '[data-group]' : '[data-endpoint]';
    draw('Condition group updated.');
    root.querySelector(selector)?.focus();
  }

  root.addEventListener('click', click);
  root.addEventListener('change', change);
  root.addEventListener('keydown', keydown);
  const controller = { ready: null, reload, destroy() {
    destroyed = true;
    generation++;
    root.removeEventListener('click', click);
    root.removeEventListener('change', change);
    root.removeEventListener('keydown', keydown);
    mounted.delete(root);
  } };
  mounted.set(root, controller);
  if (data && data.schema_version === 'gravity-view-1' && Array.isArray(data.points)
    && data.points.every((p) => p && typeof p === 'object')) {
    draw('Gravity research loaded. Review gates apply.');
    controller.ready = Promise.resolve();
  } else if (options.data !== undefined) {
    data = null;
    draw('Gravity data schema unavailable.', true);
    controller.ready = Promise.resolve();
  } else controller.ready = reload();
  return controller;
}
