// Turns NOT_ESTABLISHED results into suggested-experiment cards (S1 §5 B9). Pure, no DOM.

// suggestExperiments(results) -> [ { material_id, reason, missing: [field] } ]
export function suggestExperiments(results) {
  // TODO: one card per NE-no-data / NE-incompatible result.
  return [];
}
