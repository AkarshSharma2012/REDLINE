import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { serializeSchema } from '../scripts/export-schema.mjs';
import { FIELDS, ENUMS, PROVENANCE_KEYS, validateEvidence } from '../src/schema/validate.js';

const schemaText = await readFile(new URL('../data/evidence.schema.json', import.meta.url), 'utf8');
const schema = JSON.parse(schemaText);
const data = JSON.parse(await readFile(new URL('../data/evidence.json', import.meta.url), 'utf8'));

// Interpreter for exactly the standard JSON Schema keywords emitted by the
// exporter. Fail closed on unsupported keywords; no dependency or eval needed.
function matches(value, rule) {
  for (const [key, constraint] of Object.entries(rule)) {
    switch (key) {
      case '$schema': case 'title': case '$comment': case 'then': break;
      case 'type': {
        const types = Array.isArray(constraint) ? constraint : [constraint];
        if (!types.some((type) => type === 'null' ? value === null
          : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value)
            : type === 'number' ? typeof value === 'number' && Number.isFinite(value)
              : typeof value === type)) return false;
        break;
      }
      case 'required': if (value && typeof value === 'object' && constraint.some((name) => !Object.hasOwn(value, name))) return false; break;
      case 'properties': if (value && typeof value === 'object' && Object.entries(constraint).some(([name, sub]) => Object.hasOwn(value, name) && !matches(value[name], sub))) return false; break;
      case 'additionalProperties': if (constraint === false && value && typeof value === 'object' && Object.keys(value).some((name) => !Object.hasOwn(rule.properties, name))) return false; break;
      case 'enum': if (!constraint.includes(value)) return false; break;
      case 'const': if (value !== constraint) return false; break;
      case 'pattern': if (typeof value === 'string' && !new RegExp(constraint).test(value)) return false; break;
      case 'minimum': if (typeof value === 'number' && value < constraint) return false; break;
      case 'maximum': if (typeof value === 'number' && value > constraint) return false; break;
      case 'exclusiveMinimum': if (typeof value === 'number' && value <= constraint) return false; break;
      case 'not': if (matches(value, constraint)) return false; break;
      case 'allOf': if (!constraint.every((sub) => matches(value, sub))) return false; break;
      case 'anyOf': if (!constraint.some((sub) => matches(value, sub))) return false; break;
      case 'if': if (matches(value, constraint) && rule.then && !matches(value, rule.then)) return false; break;
      default: throw new Error(`Unsupported schema keyword: ${key}`);
    }
  }
  return true;
}

test('committed draft 2020-12 schema is reproducible', () => {
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schemaText.replace(/\r\n/g, '\n'), serializeSchema());
});

test('every evidence row satisfies the exported schema', () => {
  assert.ok(data.evidence.length > 0);
  for (const row of data.evidence) assert.ok(matches(row, schema), row.evidence_id);
});

test('schema agrees with validator across field mutations and conditional rules', () => {
  const baseline = structuredClone(data.evidence[0]);
  const compare = (row) => {
    const result = validateEvidence({ ...data, evidence: [row] });
    const localErrors = result.errors.filter((error) => !/ (?:source_key .* not in sources|material_id .* not in materials)$/.test(error));
    assert.equal(matches(row, schema), localErrors.length === 0, JSON.stringify({ row, errors: localErrors }));
  };
  compare(baseline);
  for (const { key } of FIELDS) {
    const missing = { ...baseline }; delete missing[key]; compare(missing);
    for (const value of [null, '', '   ', 'invalid', -1, 0, 0.5, 100, 101, true, {}, []]) compare({ ...baseline, [key]: value });
    for (const value of ENUMS[key] ?? []) compare({ ...baseline, [key]: value });
  }
  for (const key of PROVENANCE_KEYS) {
    for (const value of [null, '', 'source text', 3]) compare({ ...baseline, [key]: value });
  }
  compare({ ...baseline, unexpected: true });
  for (const review_status of ['draft', 'reviewed', 'verified']) {
    for (const endpoint of [null, 'burn/no-burn', 'spread-rate']) {
      for (const value of [null, 1]) for (const outcome of [null, 'spread']) {
        for (const value_unit of [null, 'cm/s']) for (const o2_pct of [null, 21]) {
          compare({ ...baseline, review_status, endpoint, value, outcome, value_unit, o2_pct, pressure_kpa: null });
        }
      }
    }
  }
});
