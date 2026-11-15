#!/usr/bin/env node
// Usage: node scripts/make-synthetic-evidence.mjs --rows 10000 --seed 42 [--out path/evidence.json]
// Default output: a new OS temp directory. Generated values are NOT NASA measurements.
import { existsSync, mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';

function integer(value, name, maximum) {
  if (!/^\d+$/.test(value ?? '') || !Number.isSafeInteger(Number(value)) || Number(value) > maximum) {
    throw new Error(`${name} must be an integer from 0 to ${maximum}`);
  }
  return Number(value);
}

// Check both lexical and physical paths so symlinks cannot redirect output into data/.
function checkDestination(destination) {
  const forbidden = path => path.split(/[\\/]+/).some(part => part.toLowerCase() === 'data');
  if (forbidden(destination)) throw new Error('Output must not be inside data/');
  let ancestor = destination;
  const suffix = [];
  while (!existsSync(ancestor)) {
    suffix.unshift(basename(ancestor));
    ancestor = dirname(ancestor);
  }
  if (forbidden([realpathSync(ancestor), ...suffix].join(sep))) {
    throw new Error('Output must not resolve inside data/');
  }
}

function main(args) {
  const options = { '--rows': '1000', '--seed': '1' };
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    if (!['--rows', '--seed', '--out'].includes(flag) || args[i + 1] === undefined || args[i + 1].startsWith('--')) {
      throw new Error('Usage: make-synthetic-evidence.mjs [--rows N] [--seed uint32] [--out path/evidence.json]');
    }
    options[flag] = args[i + 1];
  }
  const count = integer(options['--rows'], '--rows', Number.MAX_SAFE_INTEGER);
  let state = integer(options['--seed'], '--seed', 0xffffffff);
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const pick = values => values[Math.floor(random() * values.length)];
  const materials = Array.from({ length: 8 }, (_, i) => ({
    material_id: `synthetic-material-${i + 1}`,
    display_name: `SYNTHETIC test material ${i + 1}`,
    aliases: [],
  }));
  const evidence = Array.from({ length: count }, (_, i) => {
    const material = pick(materials);
    return {
      evidence_id: `synthetic-${i + 1}`, material: material.display_name,
      material_id: material.material_id, form: pick(['sheet', 'rod', 'fabric', 'foam']),
      thickness_mm: 0.1 + Math.round(random() * 100) / 10,
      width_mm: 1 + Math.round(random() * 100),
      flow_speed_cm_s: Math.round(random() * 100),
      flow_direction: pick(['opposed', 'concurrent', 'quiescent']),
      o2_pct: 10 + Math.round(random() * 300) / 10,
      pressure_kpa: pick([null, 56.5, 70.3, 101.3]),
      gravity_g: pick([0, 1]), facility: pick(['ISS', 'ground', 'drop-tower']),
      endpoint: 'burn/no-burn', value: null, value_unit: null,
      outcome: pick(['spread', 'no-spread', 'quenched']),
      uncertainty: 'SYNTHETIC generated values; no measured uncertainty.',
      run_id: `synthetic-run-${i + 1}`, source_key: 'synthetic-context',
      source_locator: 'SYNTHETIC fixture; repository link is context only, not evidence for generated values.',
      external_heat_flux_kw_m2: null, limit_approach: 'fixed', pass_criterion: null,
      test_duration_s: 1 + Math.round(random() * 600),
      notes: 'SYNTHETIC stress-test data only. Not NASA measurements; do not use for scientific conclusions.',
      holdout_group: `synthetic-group-${i % 10}`, review_status: 'draft', verified_by: null,
    };
  });
  const data = {
    schema_version: '1.0.0', built_at: '2000-01-01T00:00:00.000Z',
    built_from: `SYNTHETIC generator; seed=${options['--seed']}; rows=${count}`,
    sources: {
      'synthetic-context': {
        title: 'NASA PSI repository — context only; synthetic values are not sourced measurements',
        url: 'https://psi.nasa.gov/', authors: 'NASA', year: 2000,
      },
    },
    materials, evidence, cabin_presets: [],
  };
  const out = options['--out'] === undefined
    ? join(mkdtempSync(join(tmpdir(), 'redline-synthetic-')), 'evidence.json')
    : resolve(options['--out']);
  checkDestination(out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(data)}\n`, { flag: 'wx' });
  console.log(out);
}

try { main(process.argv.slice(2)); }
catch (error) { console.error(`Error: ${error.message}`); process.exitCode = 1; }
