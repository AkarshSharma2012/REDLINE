// The form supplies pressure in kPa and dimensions in mm. Keep display metadata
// outside the engine's V2 U5 query; unknown inputs remain null, never zero.
const numberOrNull = value => value == null || String(value).trim() === ''
  ? null : Number.isFinite(Number(value)) ? Number(value) : null;

export function buildCabinQuery(formState = {}) {
  const conditions = formState.conditions ?? {};
  return {
    conditions: {
      o2_pct: numberOrNull(conditions.o2_pct),
      pressure_kpa: numberOrNull(conditions.pressure_kpa),
      flow_speed_cm_s: numberOrNull(conditions.flow_speed_cm_s),
      flow_direction: conditions.flow_direction || null,
      gravity_g: numberOrNull(conditions.gravity_g),
      external_heat_flux_kw_m2: numberOrNull(conditions.external_heat_flux_kw_m2),
    },
    materials: (formState.materials ?? []).map(material => ({
      material_id: material.material_id,
      form: material.form || null,
      thickness_mm: numberOrNull(material.thickness_mm),
      width_mm: numberOrNull(material.width_mm),
    })),
  };
}
