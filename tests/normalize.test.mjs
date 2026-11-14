import { test } from 'node:test';
import assert from 'node:assert/strict';
import { o2PartialKpa, gravityClass } from '../src/rules/normalize.js';

// Contracts: S1 §4.2 and S4 §4.1. These exercise production exports,
// including unfinished implementations; failures must not be hidden with TODO.
function close(actual, expected) {
  assert.equal(typeof actual, 'number');
  assert.ok(Math.abs(actual - expected) <= 1e-9,
    `expected ${expected} ± 1e-9, received ${actual}`);
}

for (const [oxygen, pressure, expected] of [
  [21, 100, 21], [34, 56.5, 19.21], [26.5, 70.3, 18.6295],
  [0, 101.3, 0], [100, 101.3, 101.3], [34, 0, 0],
  [17.123456789, 56.54321, 9.682152131463527],
]) {
  test(`o2PartialKpa(${oxygen}, ${pressure}) preserves calculation precision`, () => {
    close(o2PartialKpa(oxygen, pressure), expected);
  });
}

// S4 §2 permits psia → kPa using ×6.895. No conversion helper is exported:
// conversion here prepares the kPa input; this does not test a production converter.
for (const [psia, oxygen, expected] of [
  [8.2, 34, 19.22326], [10.2, 26.5, 18.637185], [14.7, 21, 21.284865],
]) {
  test(`o2PartialKpa accepts kPa converted from ${psia} psia without early rounding`, () => {
    close(o2PartialKpa(oxygen, psia * 6.895), expected);
  });
}

for (const [name, value] of [
  ['null', null], ['absent', undefined], ['empty', ''],
  ['whitespace', '   '], ['NaN', NaN], ['infinity', Infinity],
  ['negative infinity', -Infinity],
]) {
  // S4 defines null/absent as unknown; S3 rejects empty/nonfinite numeric input.
  // Guard against Number(null) / Number('') silently manufacturing measured zero.
  test(`o2PartialKpa treats ${name} oxygen as unknown`, () => {
    assert.equal(o2PartialKpa(value, 101.3), null);
  });
  test(`o2PartialKpa treats ${name} pressure as unknown`, () => {
    assert.equal(o2PartialKpa(21, value), null);
  });
  test(`gravityClass treats ${name} gravity as unknown`, () => {
    assert.equal(gravityClass(value), null);
  });
}

test('o2PartialKpa returns null with both inputs absent', () => {
  assert.equal(o2PartialKpa(), null);
});

// S4 §4.1 and §3 constants: inclusive microgravity/Earth thresholds.
for (const [gravity, expected] of [
  [0, '0g'], [0.01, '0g'], [0.010001, 'partial'],
  [0.16, 'partial'], [0.5, 'partial'], [0.899999, 'partial'],
  [0.9, '1g'], [1, '1g'], [1.1, '1g'],
]) {
  test(`gravityClass(${gravity}) is ${expected}`, () => {
    assert.equal(gravityClass(gravity), expected);
  });
}


