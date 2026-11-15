// Unit helpers (S1 §2, S4 §4.1). Pure, no DOM. Owner: rules tasks (B3/B4).

// Gravity class thresholds (S4 §4.4). Inference of the S4 spec, awaiting science-lead review.
export const G_MICRO_MAX = 0.01;
export const G_EARTH_MIN = 0.9;
// Number equality tolerance (S4 §4.1).
export const EPS = 1e-9;

// A measured number, or null. Empty means unknown, never zero (S1 §4.2).
export function num(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

// O2 partial pressure in kPa; derived, never stored (S1 §4.2).
export function o2PartialKpa(o2_pct, pressure_kpa) {
  const o2 = num(o2_pct);
  const pressure = num(pressure_kpa);
  return o2 === null || pressure === null ? null : o2 * pressure / 100;
}

// Gravity class for rule G: "0g" | "partial" | "1g", or null if gravity is unknown.
export function gravityClass(gravity_g) {
  const g = num(gravity_g);
  if (g === null) return null;
  if (g <= G_MICRO_MAX) return '0g';
  if (g >= G_EARTH_MIN) return '1g';
  return 'partial';
}

// Uncertainty string -> O2 percentage points, or null if it cannot be parsed.
// "±x" or "+/-x" -> x; "between a and b" -> (b - a) / 2; anything else -> null.
export function parseUncertainty(text) {
  if (typeof text !== 'string') return null;
  const s = text.trim();
  const NUMBER = '([0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)';
  const plusMinus = s.match(new RegExp(`^(?:±|\\+/-)\\s*${NUMBER}(?:\\s*(?:%|pp)(?:\\s*O2)?)?$`, 'i'));
  if (plusMinus) return Number(plusMinus[1]);
  const between = s.match(new RegExp(`^between\\s+${NUMBER}\\s+and\\s+${NUMBER}(?:\\s*%(?:\\s*O2)?)?$`, 'i'));
  if (between) return Math.abs(Number(between[2]) - Number(between[1])) / 2;
  return null;
}

// True when the source gives no uncertainty at all (raises rule U).
export function uncertaintyNotStated(text) {
  return typeof text !== 'string' || text.trim() === '' || /^not stated\b/i.test(text.trim());
}

// Null-safe ratio of two positive numbers: max/min. null if either is null or not positive.
export function ratio(a, b) {
  const x = num(a);
  const y = num(b);
  if (x === null || y === null || x <= 0 || y <= 0) return null;
  return Math.max(x, y) / Math.min(x, y);
}
