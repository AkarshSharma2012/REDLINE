// Investigation catalog rules: filter, rank by habitat + need, compare two. Pure, no DOM. Owner: B11.
//
// Catalog shape (B10 data/investigations.json; fixture in tests/fixtures/investigations.json):
//   { sources: { <id>: { title, url } }, investigations: [ { id, name, <field>: { value, source, locator, note } } ] }
// A field may also be a bare value; then it has no source and the UI says so.

export const NEEDS = ['prevention', 'detection', 'suppression'];

// Habitat atmospheres come from R7 (research/atmosphere.md). Gravity is a regime, not a number.
export const HABITATS = [
  {
    id: 'spacecraft', name: 'Crewed spacecraft / lander', gravity: '0g',
    o2_pct: { min: 21, max: 26.5 }, pressure_kpa: { min: 70.3, max: 101.3 },
    sources: [
      { title: 'Modeling a 15-min EVA prebreathe protocol (Abercromby et al. 2015)', url: 'https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf', locator: 'Table 1, p. 77' },
      { title: 'Life Support Baseline Values and Assumptions Document', url: 'https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf', locator: 'section 4.6.3.6, printed p. 142' },
    ],
  },
  {
    id: 'station', name: 'Space station', gravity: '0g',
    o2_pct: { min: 20.8, max: 21 }, pressure_kpa: { min: 101.3, max: 101.3 },
    sources: [
      { title: 'Modeling a 15-min EVA prebreathe protocol (Abercromby et al. 2015)', url: 'https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf', locator: 'Table 1, p. 77' },
    ],
  },
  {
    id: 'lunar-base', name: 'Lunar base', gravity: 'partial',
    o2_pct: { min: 26.5, max: 34 }, pressure_kpa: { min: 56.5, max: 70.3 },
    sources: [
      { title: 'Material Flammability at Lunar and Martian Gravity (Ferkul et al. 2026)', url: 'https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf', locator: 'printed p. 24' },
      { title: 'Internal Layout of a Lunar Surface Habitat (Burke et al. 2022)', url: 'https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf?attachment=true', locator: 'section II, p. 2' },
    ],
  },
  {
    id: 'mars-base', name: 'Mars base', gravity: 'partial',
    o2_pct: { min: 34, max: 34 }, pressure_kpa: { min: 56.5, max: 56.5 },
    sources: [
      { title: 'Life Support Baseline Values and Assumptions Document', url: 'https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf', locator: 'section 4.6.3.6, printed p. 142 (surface habitats with frequent EVAs)' },
    ],
  },
  {
    id: 'pressurized-rover', name: 'Pressurized rover', gravity: 'partial',
    o2_pct: { min: 34, max: 34 }, pressure_kpa: { min: 56.5, max: 56.5 },
    sources: [
      { title: 'NESC Lunar Rover Design Concepts Assessments, NASA/TM-20240014203', url: 'https://ntrs.nasa.gov/api/citations/20240014203/downloads/11-15-24%2020240014203.pdf', locator: 'Table 7, printed p. 16' },
    ],
  },
];

// Points per factor. Shown to the user next to every score.
export const WEIGHTS = { need: 3, habitat: 2, o2: 2, pressure: 1, gravity: 2 };
// O2 within this many percentage points of the habitat range counts as "close" (our choice, not a NASA value).
export const O2_CLOSE_PCT = 3;

const NOT_FOUND = 'not found in the sources reviewed';

// field(inv, key, sources) -> { value, source: {title,url,locator}|null, note }
export function field(inv, key, sources = {}) {
  const raw = inv?.[key];
  if (raw === undefined || raw === null) return { value: null, source: null, note: NOT_FOUND };
  if (typeof raw !== 'object' || Array.isArray(raw) || !('value' in raw)) {
    return { value: raw, source: null, note: 'no source given in the catalog' };
  }
  let source = null;
  if (raw.source) {
    const s = typeof raw.source === 'string' ? sources[raw.source] : raw.source;
    if (s) source = { title: s.title ?? String(raw.source), url: s.url ?? null, locator: raw.locator ?? s.locator ?? '' };
  }
  return { value: raw.value ?? null, source, note: raw.note ?? (raw.value == null ? NOT_FOUND : '') };
}

const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const norm = (s) => String(s).trim().toLowerCase();

// Distinct values of a list field across the catalog, for filter menus.
export function facetValues(investigations, key) {
  const seen = new Map();
  for (const inv of investigations) {
    for (const v of asList(field(inv, key).value)) if (!seen.has(norm(v))) seen.set(norm(v), String(v));
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

// filters: { area, fuelType, hardware } — empty / 'all' means no filter.
export function filterInvestigations(investigations, filters = {}) {
  const want = [['fire_safety_areas', filters.area], ['fuel_type', filters.fuelType], ['hardware', filters.hardware]]
    .filter(([, v]) => v && v !== 'all');
  return investigations.filter((inv) =>
    want.every(([key, v]) => asList(field(inv, key).value).some((x) => norm(x) === norm(v))));
}

function rangeOf(v) {
  if (v == null) return null;
  if (typeof v === 'number') return { min: v, max: v };
  if (typeof v.min === 'number' && typeof v.max === 'number') return v;
  return null;
}

const gap = (a, b) => Math.max(0, a.min - b.max, b.min - a.max);
const fmtRange = (r, unit) => (r.min === r.max ? `${r.min}${unit}` : `${r.min}–${r.max}${unit}`);

export function habitatById(id) {
  return HABITATS.find((h) => h.id === id) ?? null;
}

// scoreInvestigation(inv, { habitat, need }, sources) -> { id, name, score, max, reasons[] }
// Each reason: { factor, points, max, why, sources[] } where sources mix the investigation's field
// source and the habitat's atmosphere source, so every point can be traced.
export function scoreInvestigation(inv, { habitat, need } = {}, sources = {}) {
  const h = typeof habitat === 'string' ? habitatById(habitat) : habitat;
  if (!h) throw new Error(`Unknown habitat: ${habitat}`);
  const reasons = [];
  const add = (factor, points, max, why, srcs) => reasons.push({ factor, points, max, why, sources: srcs.filter(Boolean) });

  if (need && need !== 'any') {
    const f = field(inv, 'fire_safety_areas', sources);
    const hit = asList(f.value).some((a) => norm(a) === norm(need));
    add('need', hit ? WEIGHTS.need : 0, WEIGHTS.need,
      f.value == null ? `Fire-safety area ${NOT_FOUND}.`
        : hit ? `Lists ${need} among its fire-safety areas.` : `Lists ${asList(f.value).join(', ')}, not ${need}.`,
      [f.source]);
  }

  {
    const f = field(inv, 'habitat_relevance', sources);
    const hit = asList(f.value).some((x) => norm(x) === h.id);
    add('habitat', hit ? WEIGHTS.habitat : 0, WEIGHTS.habitat,
      f.value == null ? `Habitat relevance ${NOT_FOUND}.`
        : hit ? `Catalog relevance notes name ${h.name.toLowerCase()}.` : `Catalog relevance notes do not name ${h.name.toLowerCase()}.`,
      [f.source]);
  }

  {
    const f = field(inv, 'o2_pct', sources);
    const r = rangeOf(f.value);
    let pts = 0;
    let why = `Test O2 ${NOT_FOUND}; no points.`;
    if (r) {
      const d = gap(r, h.o2_pct);
      pts = d === 0 ? WEIGHTS.o2 : d <= O2_CLOSE_PCT ? 1 : 0;
      why = `Tested at ${fmtRange(r, '% O2')}; habitat ${fmtRange(h.o2_pct, '% O2')}: `
        + (d === 0 ? 'ranges overlap.' : `${round1(d)} points apart${pts ? ` (within ${O2_CLOSE_PCT})` : ''}.`);
    }
    add('o2', pts, WEIGHTS.o2, why, [f.source, ...h.sources]);
  }

  {
    const f = field(inv, 'pressure_kpa', sources);
    const r = rangeOf(f.value);
    let pts = 0;
    let why = `Test pressure ${NOT_FOUND}; no points.`;
    if (r) {
      const d = gap(r, h.pressure_kpa);
      pts = d === 0 ? WEIGHTS.pressure : 0;
      why = `Tested at ${fmtRange(r, ' kPa')}; habitat ${fmtRange(h.pressure_kpa, ' kPa')}: `
        + (d === 0 ? 'ranges overlap.' : `${round1(d)} kPa apart.`);
    }
    add('pressure', pts, WEIGHTS.pressure, why, [f.source, ...h.sources]);
  }

  {
    const f = field(inv, 'gravity', sources);
    const g = asList(f.value).map(norm);
    let pts = 0;
    let why;
    if (!g.length) why = `Gravity ${NOT_FOUND}.`;
    else if (h.gravity === '0g') {
      pts = g.includes('0g') ? WEIGHTS.gravity : 0;
      why = pts ? 'Tested in microgravity, matching this habitat.' : 'No microgravity tests listed.';
    } else if (g.includes('partial')) {
      pts = WEIGHTS.gravity;
      why = 'Tested in partial gravity.';
    } else {
      const bounds = g.includes('0g') && g.includes('1g');
      const analog = g.includes('partial-analog');
      pts = Math.min(WEIGHTS.gravity, (bounds ? 2 : 0) + (analog ? 1 : 0) + (!bounds && g.includes('0g') ? 1 : 0));
      const parts = [];
      if (bounds) parts.push('0 g and 1 g results can bound partial gravity (an estimate, not a measurement)');
      else if (g.includes('0g')) parts.push('0 g results give one bound for partial gravity (an estimate)');
      if (analog) parts.push('mimicked partial gravity');
      why = `No partial-gravity tests in PSI yet. ${parts.length ? parts.join('; ') + '.' : 'No 0 g bound listed.'}`;
    }
    add('gravity', pts, WEIGHTS.gravity, why, [f.source]);
  }

  const score = reasons.reduce((s, r) => s + r.points, 0);
  const max = reasons.reduce((s, r) => s + r.max, 0);
  return { id: inv.id, name: inv.name, score, max, reasons };
}

function round1(x) {
  return Math.round(x * 10) / 10;
}

// rankInvestigations(investigations, { habitat, need }, sources) -> scored list, best first, with rank.
// Ties share a rank and are ordered by name.
export function rankInvestigations(investigations, query, sources = {}) {
  const scored = investigations
    .map((inv) => scoreInvestigation(inv, query, sources))
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
  let prev = null;
  scored.forEach((s, i) => {
    s.rank = prev && prev.score === s.score ? prev.rank : i + 1;
    prev = s;
  });
  return scored;
}

// Attributes compared side by side (challenge "suggested attributes").
export const COMPARE_FIELDS = [
  ['objectives', 'Objectives'],
  ['fire_safety_areas', 'Fire-safety area'],
  ['hardware', 'Hardware'],
  ['fuel_type', 'Fuel type'],
  ['fuel_sample', 'Fuel sample shape / size'],
  ['o2_pct', 'O2 (% by volume)'],
  ['pressure_kpa', 'Pressure (kPa)'],
  ['airflow_cm_s', 'Airflow (cm/s)'],
  ['gravity', 'Gravity'],
  ['variables_varied', 'What varied'],
  ['variables_fixed', 'What stayed fixed'],
  ['sensors', 'Sensors / measurements'],
  ['key_findings', 'Key findings'],
];

function canon(v) {
  if (v == null) return null;
  if (Array.isArray(v)) return JSON.stringify(v.map(norm).sort());
  if (typeof v === 'object') return JSON.stringify(rangeOf(v) ?? v);
  return JSON.stringify(norm(v));
}

// compareInvestigations(a, b, sources) -> { same: [row], differ: [row] }
// row: { key, label, a: field(), b: field(), shared: [] (list fields only) }
// Unknown on either side counts as "differ" with no claim of sameness.
export function compareInvestigations(a, b, sources = {}) {
  const same = [];
  const differ = [];
  for (const [key, label] of COMPARE_FIELDS) {
    const fa = field(a, key, sources);
    const fb = field(b, key, sources);
    const row = { key, label, a: fa, b: fb, shared: [] };
    if (Array.isArray(fa.value) && Array.isArray(fb.value)) {
      const nb = new Set(fb.value.map(norm));
      row.shared = fa.value.filter((x) => nb.has(norm(x)));
    }
    const known = fa.value != null && fb.value != null;
    (known && canon(fa.value) === canon(fb.value) ? same : differ).push(row);
  }
  return { same, differ };
}
