// Field-by-field grade, R1 §4 rules (S1 §3.1, S4 §4). Pure, no DOM. Owner: B3.
import { EPS, num, gravityClass, parseUncertainty, uncertaintyNotStated, ratio } from './normalize.js';

// Thresholds (S4 §4.4). R1 inferences awaiting science-lead review; change them here only.
export const RATIO_FLAG = 2;
export const PRESSURE_FLAG_KPA = 10;
export const HEAT_FLUX_INVALID_KW_M2 = 5;

// A cabin question asks "will flame spread", so its implied endpoint is the spread family.
export const SPREAD_ENDPOINTS = Object.freeze(['LOC-FS', 'burn/no-burn', 'spread-rate']);
export const SHORT_FACILITIES = Object.freeze(['drop-tower', 'aircraft']);
export const RULE_ORDER = Object.freeze(['E', 'M', 'F', 'T', 'W', 'D', 'V', 'P', 'G', 'X', 'H', 'A', 'U']);

const FORCED = ['opposed', 'concurrent'];
const WIDTH_EXEMPT_FORMS = ['rod', 'wire'];
const RANK = { OK: 0, FLAG: 1, INVALID: 2 };

const text = (value) => (typeof value === 'string' && value.trim() ? value : null);
// Cabin gaps read "not specified" (the user did not say); row gaps read "not stated" (the source did not say).
const cabin = (value, unit = '') => (value === null || value === undefined ? 'not specified' : `${value}${unit}`);
const stated = (value, unit = '') => (value === null || value === undefined ? 'not stated' : `${value}${unit}`);
const both = (name, q, r, unit = '') => `${name}: cabin ${cabin(q, unit)} vs row ${stated(r, unit)}`;

function endpointRule(q, r) {
  const qe = text(q.endpoint);
  const re = text(r.endpoint);
  if (qe === null) {
    const why = `endpoint: cabin asks about flame spread vs row ${stated(re)}`;
    return SPREAD_ENDPOINTS.includes(re) ? ['OK', why] : ['INVALID', `${why}, which is not a flame-spread endpoint`];
  }
  return [qe === re ? 'OK' : 'INVALID', `endpoint: query ${qe} vs row ${stated(re)}`];
}

function materialRule(q, r) {
  if (q.material_id !== r.material_id) {
    return ['INVALID', `material: cabin ${cabin(q.material_id)} vs row ${stated(r.material_id)}`];
  }
  const rowName = text(r.material);
  const queryName = text(q.material);
  if (queryName !== null) {
    return [queryName === rowName ? 'OK' : 'FLAG', `material: cabin "${queryName}" vs row ${rowName === null ? 'not stated' : `"${rowName}"`}`];
  }
  const names = [q.display_name, ...(Array.isArray(q.aliases) ? q.aliases : [])]
    .filter((name) => text(name) !== null)
    .map((name) => name.trim().toLowerCase());
  const known = rowName !== null && names.includes(rowName.trim().toLowerCase());
  const why = `material: cabin ${cabin(text(q.display_name) ?? q.material_id)} vs row ${rowName === null ? 'not stated' : `"${rowName}"`}`;
  return known ? ['OK', why] : ['FLAG', `${why}; grade, colour or maker may differ`];
}

function formRule(q, r) {
  const qf = text(q.form);
  const rf = text(r.form);
  const why = both('form', qf, rf);
  if (qf === null) return ['FLAG', why];
  return [rf !== null && qf !== rf ? 'INVALID' : 'OK', why];
}

// Shared by T and W: FLAG when either side is unknown or the sizes differ by more than RATIO_FLAG.
function sizeRule(name, qv, rv) {
  const q = num(qv);
  const r = num(rv);
  const why = both(name, q, r, ' mm');
  if (q === null || r === null) return ['FLAG', why];
  const k = ratio(q, r);
  if (k === null || k > RATIO_FLAG + EPS) return ['FLAG', `${why}; differs by more than ${RATIO_FLAG}x`];
  return ['OK', why];
}

function widthRule(q, r) {
  if (WIDTH_EXEMPT_FORMS.includes(r.form)) {
    return ['OK', `width: cabin ${cabin(num(q.width_mm), ' mm')} vs row ${r.form}, where width does not apply`];
  }
  return sizeRule('width', q.width_mm, r.width_mm);
}

function directionRule(q, r) {
  const qd = text(q.flow_direction);
  const rd = text(r.flow_direction);
  const why = both('flow direction', qd, rd);
  if (qd === null || rd === null) return ['FLAG', why];
  if (qd === rd) return ['OK', why];
  const qForced = FORCED.includes(qd);
  const rForced = FORCED.includes(rd);
  // opposed vs concurrent, or a forced flow vs quiescent / upward-buoyant.
  return [qForced || rForced ? 'INVALID' : 'OK', why];
}

function flowRule(q, r, quenchSpeeds) {
  const qv = num(q.flow_speed_cm_s);
  const rv = num(r.flow_speed_cm_s);
  const why = both('flow speed', qv, rv, ' cm/s');
  if (qv === null || rv === null) return ['FLAG', why];
  const lo = Math.min(qv, rv);
  const hi = Math.max(qv, rv);
  const crossed = quenchSpeeds.map(num).find((s) => s !== null && lo < s - EPS && s <= hi + EPS);
  if (crossed !== undefined) return ['INVALID', `${why}; a reported quench speed of ${crossed} cm/s lies between them`];
  if (lo <= EPS && hi <= EPS) return ['OK', why];
  if (lo <= EPS) return ['FLAG', `${why}; one has no flow`];
  if (hi / lo > RATIO_FLAG + EPS) return ['FLAG', `${why}; differs by more than ${RATIO_FLAG}x`];
  return ['OK', why];
}

function pressureRule(q, r) {
  const qp = num(q.pressure_kpa);
  const rp = num(r.pressure_kpa);
  const why = both('pressure', qp, rp, ' kPa');
  if (qp === null || rp === null) return ['FLAG', why];
  if (Math.abs(qp - rp) > PRESSURE_FLAG_KPA + EPS) return ['FLAG', `${why}; differs by more than ${PRESSURE_FLAG_KPA} kPa`];
  return ['OK', why];
}

function gravityRule(q, r) {
  const qc = gravityClass(q.gravity_g);
  const rc = gravityClass(r.gravity_g);
  const why = both('gravity', num(q.gravity_g), num(r.gravity_g), ' g');
  if (qc === null || rc === null) return ['FLAG', why];
  return qc === rc ? ['OK', why] : ['FLAG', `${why}; cross-gravity comparison`];
}

function facilityRule(q, r) {
  const qf = text(q.facility);
  const rf = text(r.facility);
  const rShort = SHORT_FACILITIES.includes(rf);
  if (qf === null) {
    const why = `facility: cabin (long duration) vs row ${stated(rf)}`;
    return rShort ? ['FLAG', `${why}, a short-duration test`] : ['OK', why];
  }
  const why = `facility: query ${qf} vs row ${stated(rf)}`;
  return SHORT_FACILITIES.includes(qf) !== rShort ? ['FLAG', `${why}; only one is a short-duration test`] : ['OK', why];
}

function heatRule(q, r) {
  // A cabin that does not give an external heat flux is read as 0 (S4 §4.2).
  const qh = num(q.external_heat_flux_kw_m2) ?? 0;
  const rh = num(r.external_heat_flux_kw_m2) ?? 0;
  const why = `external heat flux: cabin ${qh} kW/m2 vs row ${rh} kW/m2`;
  if ((qh === 0) !== (rh === 0)) return ['INVALID', `${why}; only one has external heating`];
  if (Math.abs(qh - rh) > HEAT_FLUX_INVALID_KW_M2 + EPS) return ['INVALID', `${why}; differs by more than ${HEAT_FLUX_INVALID_KW_M2} kW/m2`];
  return ['OK', why];
}

function approachRule(q, r) {
  const differs = (key) => text(q[key]) !== null && text(r[key]) !== null && q[key] !== r[key];
  const why = `limit approach: query ${cabin(text(q.limit_approach))} vs row ${stated(text(r.limit_approach))}; `
    + `pass criterion: query ${cabin(text(q.pass_criterion))} vs row ${stated(text(r.pass_criterion))}`;
  return [differs('limit_approach') || differs('pass_criterion') ? 'FLAG' : 'OK', why];
}

function uncertaintyRule(q, r) {
  const qo = num(q.o2_pct);
  const ro = num(r.o2_pct);
  const rowText = text(r.uncertainty) ?? 'not stated';
  const why = `uncertainty: cabin ${cabin(qo, '% O2')} vs row ${stated(ro, '% O2')}, row uncertainty ${rowText}`;
  if (uncertaintyNotStated(r.uncertainty)) return ['FLAG', why];
  // The query side counts only when a query built from an evidence row carries the field.
  if (q.uncertainty !== undefined && q.uncertainty !== null && uncertaintyNotStated(q.uncertainty)) {
    return ['FLAG', `${why}; query uncertainty not stated`];
  }
  const band = parseUncertainty(r.uncertainty);
  if (band !== null && band > 0 && qo !== null && ro !== null && Math.abs(qo - ro) <= band + EPS) {
    return ['FLAG', `${why}; cabin oxygen is within the row's stated uncertainty`];
  }
  return ['OK', why];
}

// compareRow(query, row, ctx) -> { grade: "OK"|"FLAG"|"INVALID", rules: [{ rule, grade, why }] }
export function compareRow(query, row, ctx = { quench_speeds_cm_s: [] }) {
  const q = query ?? {};
  const r = row ?? {};
  const quenchSpeeds = Array.isArray(ctx?.quench_speeds_cm_s) ? ctx.quench_speeds_cm_s : [];
  const graded = {
    E: endpointRule(q, r),
    M: materialRule(q, r),
    F: formRule(q, r),
    T: sizeRule('thickness', q.thickness_mm, r.thickness_mm),
    W: widthRule(q, r),
    D: directionRule(q, r),
    V: flowRule(q, r, quenchSpeeds),
    P: pressureRule(q, r),
    G: gravityRule(q, r),
    X: facilityRule(q, r),
    H: heatRule(q, r),
    A: approachRule(q, r),
    U: uncertaintyRule(q, r),
  };
  const rules = RULE_ORDER.map((rule) => ({ rule, grade: graded[rule][0], why: graded[rule][1] }));
  const grade = rules.reduce((worst, entry) => (RANK[entry.grade] > RANK[worst] ? entry.grade : worst), 'OK');
  return { grade, rules };
}
