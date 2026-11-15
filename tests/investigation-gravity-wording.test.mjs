import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/ui/investigations.js', import.meta.url), 'utf8');
const help = source.match(/'Ranking adds visible points per factor:[^']*'/)?.[0];

test('Investigations help rejects unsupported universal gravity bounds', () => {
  assert.ok(help, 'Public ranking help must remain present');
  assert.doesNotMatch(help, /Partial-gravity results are not in PSI yet|results can only bound them as an estimate/i);
  assert.match(help, /no universal 0 g\/1 g bracket is inferred/i);
  assert.match(help, /gravity transfer is not established/i);
  assert.match(help, /no reviewed compatible 0 g\/1 g endpoint pair is supplied/i);
});

test('Investigations help distinguishes catalog coverage from research and requires compatibility review', () => {
  assert.match(help, /source catalog coverage is distinct from measured simulated-partial-gravity research/i);
  assert.match(help, /condition-specific comparisons require reviewed compatibility/i);
});
