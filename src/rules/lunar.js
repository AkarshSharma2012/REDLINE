// 0 g / 1 g bounded estimate for 0.16 g queries (S1 §3.2 step 5, S4 §5.4). Pure, no DOM. Owner: B4.

// lunarEstimate(query, rows) -> { g0: <label result>, g1: <label result> }
export function lunarEstimate(query, rows) {
  // TODO: run labelMaterial once with 0 g rows and once with 1 g rows.
  return { g0: null, g1: null };
}
