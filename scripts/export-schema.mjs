import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { FIELDS, ENUMS, PROVENANCE_KEYS } from '../src/schema/validate.js';

// Row-local rules only: duplicate IDs and source/material reference resolution
// require the complete dataset and remain the responsibility of validateEvidence.
export function evidenceSchema() {
  const requiredNullable = new Set(['endpoint', 'value', 'value_unit', 'outcome',
    'thickness_mm', 'width_mm', 'flow_speed_cm_s', 'o2_pct', 'pressure_kpa',
    'external_heat_flux_kw_m2']);
  const positive = new Set(['thickness_mm', 'width_mm', 'pressure_kpa', 'test_duration_s']);
  const nonnegative = new Set(['flow_speed_cm_s', 'gravity_g', 'external_heat_flux_kw_m2']);
  const properties = Object.fromEntries(FIELDS.map(({ key, type, nullable }) => {
    const rule = { type: nullable ? [type, 'null'] : type };
    if (type === 'string' && !nullable) rule.pattern = '\\S';
    if (ENUMS[key]) rule.enum = [...ENUMS[key], ...(nullable ? [null] : [])];
    if (positive.has(key)) rule.exclusiveMinimum = 0;
    if (nonnegative.has(key)) rule.minimum = 0;
    if (key === 'o2_pct') Object.assign(rule, { minimum: 0, maximum: 100 });
    return [key, rule];
  }));
  for (const key of PROVENANCE_KEYS) properties[key] = { type: ['string', 'null'] };
  const present = (key) => ({ required: [key], properties: { [key]: { not: { type: 'null' } } } });
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'REDLINE evidence row',
    $comment: 'Mirrors row-local rules in src/schema/validate.js. Dataset-wide ID uniqueness and source/material reference resolution require validateEvidence.',
    type: 'object',
    required: FIELDS.filter(({ key, nullable }) => !nullable || requiredNullable.has(key)).map(({ key }) => key),
    properties,
    additionalProperties: false,
    allOf: [
      { if: { required: ['review_status'], properties: { review_status: { const: 'verified' } } },
        then: { allOf: [present('endpoint'), present('o2_pct'), { anyOf: [present('value'), present('outcome')] }] } },
      { if: present('value'), then: present('value_unit') },
      { if: { required: ['endpoint'], properties: { endpoint: { const: 'burn/no-burn' } } }, then: present('outcome') },
    ],
  };
}

export const serializeSchema = () => `${JSON.stringify(evidenceSchema(), null, 2)}\n`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeFile(new URL('../data/evidence.schema.json', import.meta.url), serializeSchema());
}
