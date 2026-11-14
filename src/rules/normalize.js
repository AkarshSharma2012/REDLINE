// Unit helpers (S1 §2). Pure, no DOM. Owner: rules tasks (B3/B4).

// O2 partial pressure in kPa; derived, never stored (S1 §4.2).
export function o2PartialKpa(o2_pct, pressure_kpa) {
  // TODO: return o2_pct * pressure_kpa / 100, or null if either is null.
  return null;
}

// Gravity class for rule G: 0 g and 1 g are separate classes (S1 §3.2 step 5).
export function gravityClass(gravity_g) {
  // TODO: map a gravity_g number to its class.
  return null;
}
