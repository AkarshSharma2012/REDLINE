// Labels, reason codes and the wording table (S1 §3.1-3.2, S4 §5-6). Pure, no DOM. Owner: B4.

// labelMaterial(query, rows) -> { label, reason, cited, flags, flag_details, cross_gravity, estimate, wording }
export function labelMaterial(query, rows) {
  // TODO: S1 §3.2 rules. Stub: every material reads as "not found in the sources reviewed".
  return {
    label: 'NOT_ESTABLISHED',
    reason: 'NE-no-data',
    cited: [],
    flags: [],
    flag_details: [],
    cross_gravity: false,
    estimate: null,
    wording: 'Not found in the sources reviewed',
  };
}

// labelCabin(cabinQuery, evidence) -> [ { material_id, ...labelMaterial result } ]
// cabinQuery shape (V2 U5): { conditions: {...}, materials: [{ material_id, form, thickness_mm, width_mm }] }
export function labelCabin(cabinQuery, evidence) {
  // TODO: build one S1 query per material line; pass only verified rows for that material.
  return (cabinQuery?.materials ?? []).map((m) => ({
    material_id: m.material_id,
    ...labelMaterial({ ...cabinQuery.conditions, ...m }, []),
  }));
}
