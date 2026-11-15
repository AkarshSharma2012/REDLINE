// 0 g / 1 g estimate for 0.16 g and other partial-gravity queries (S1 §3.2 step 5, S4 §5.4). Pure, no DOM. Owner: B4.
// The two results are shown side by side as an estimate. They are not a bound on lunar behaviour.
import { compareRow } from './compare.js';
import { labelSameGravity, wordingFor, LUNAR_PREFIX } from './label.js';

// Most severe first (S4 §5.4 step 2).
const SEVERITY = ['BURNED', 'NEAR', 'NE-no-burn', 'NE-incompatible', 'NE-no-data'];
const severity = (result) => SEVERITY.indexOf(result.reason ?? result.label);

// lunarEstimate(query, rows) -> { g0: <label result>, g1: <label result> }
export function lunarEstimate(query, rows) {
  return {
    g0: labelSameGravity({ ...query, gravity_g: 0 }, rows),
    g1: labelSameGravity({ ...query, gravity_g: 1 }, rows),
  };
}

// lunarLabel(query, rows) -> labelMaterial result with estimate: { g0, g1 } and cross_gravity: true.
export function lunarLabel(query, rows) {
  const estimate = lunarEstimate(query, rows);
  const { g0, g1 } = estimate;
  const top = severity(g1) < severity(g0) ? g1 : g0;
  // g0 list then g1 list, duplicates removed (S4 §5.3).
  const cited = [...new Set([...g0.cited, ...g1.cited])];

  // Every cited row is a cross-gravity comparison for the cabin's own gravity: rule G leads its details.
  const flag_details = [];
  const seen = new Set();
  const add = (detail) => {
    const key = `${detail.evidence_id}\n${detail.rule}`;
    if (seen.has(key)) return;
    seen.add(key);
    flag_details.push(detail);
  };
  for (const evidence_id of cited) {
    const row = rows.find((candidate) => candidate?.evidence_id === evidence_id && candidate.review_status === 'verified');
    const gravity = compareRow(query, row).rules.find((entry) => entry.rule === 'G');
    if (gravity.grade !== 'OK') add({ evidence_id, rule: 'G', grade: gravity.grade, why: gravity.why });
    for (const part of [g0, g1]) {
      for (const detail of part.flag_details) {
        if (detail.evidence_id === evidence_id && detail.rule !== 'G') add(detail);
      }
    }
  }
  const flags = new Set([...g0.flags, ...g1.flags]);
  if (cited.length) flags.add('G');

  return {
    label: top.label,
    reason: top.reason,
    cited,
    flags: [...flags].sort(),
    flag_details,
    cross_gravity: true,
    estimate,
    wording: `${LUNAR_PREFIX} ${wordingFor(top)}`,
  };
}
