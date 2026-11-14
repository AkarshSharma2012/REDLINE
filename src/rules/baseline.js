// R8 §5 naive name-only lookup, for the accuracy run only (S1 §3.1). Pure, no DOM. Owner: B10.

// baselineLabel(query, rows) -> same shape as labelMaterial, never NE-incompatible
export function baselineLabel(query, rows) {
  // TODO: R8 §5 rules.
  return {
    label: 'NOT_ESTABLISHED',
    reason: 'NE-no-data',
    cited: [],
    flags: [],
    cross_gravity: false,
    estimate: null,
  };
}
