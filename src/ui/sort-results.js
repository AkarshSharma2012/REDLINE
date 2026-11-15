const concernOrder = { BURNED: 0, NEAR: 1, NOT_ESTABLISHED: 2 };

/**
 * Return a new array of the original results, ordered by concern then material name.
 * S1 results have material_id only; callers with a catalog can supply material_name.
 * Equal tier/name pairs retain their input order, including duplicate cabin items.
 */
export function sortByConcern(results) {
  const name = result => String(result.material_name ?? result.material_id ?? '');
  return results.map((result, index) => ({ result, index }))
    .sort((a, b) => (concernOrder[a.result.label] - concernOrder[b.result.label])
      || name(a.result).localeCompare(name(b.result), 'en')
      || a.index - b.index)
    .map(entry => entry.result);
}
