// Field-by-field grade, R1 §4 rules (S1 §3.1, S4 §4). Pure, no DOM. Owner: B3.

// compareRow(query, row, ctx) -> { grade: "OK"|"FLAG"|"INVALID", rules: [{ rule, grade, why }] }
export function compareRow(query, row, ctx = { quench_speeds_cm_s: [] }) {
  // TODO: implement rules E M F T W D V P G X H A U.
  return { grade: 'FLAG', rules: [] };
}
