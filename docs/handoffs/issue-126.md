# Issue #126 — normalization unit tests

STATUS: DONE

Added `tests/normalize.test.mjs` using only node:test and node:assert/strict.
Read README.md, AGENTS.md, DESIGN.md, S1 architecture, S3 screens, S4 evidence-engine,
and V2 review from the working tree. No previous root handoff existed.

Coverage: both current exports; O2 percent-to-fraction calculation, zero and full
oxygen, fractional precision without early display rounding, null/absent/empty/
whitespace/NaN/nonfinite values, and inclusive gravity thresholds (0.01 and 0.9).
Invalid-value expectations are conservative test policy, informed by S3 input
validation; S4 explicitly guarantees null for null O2/pressure inputs.

## Real source bugs (left unchanged as required)

- `src/rules/normalize.js:4` o2PartialKpa unconditionally returns null. Example:
  `o2PartialKpa(34, 56.5)` must return 19.21 per S1 §4.2/S4 §4.1, but returns null.
  All 10 valid numeric calculation cases fail, including zero and precision cases.
- `src/rules/normalize.js:10` gravityClass unconditionally returns null. Per S4
  §4.1/§4.3 constants, 0 and 0.01 should yield '0g', 0.16 should yield 'partial',
  and 0.9 and 1 should yield '1g'. All 9 classification cases fail.
- There is no exported psia conversion or rounding helper. No function name or
  rounding precision contract is specified for those APIs. The three psia cases
  prepare kPa inputs with S4 §2's ×6.895 and test the actual partial-pressure
  export; they do not claim to test a production psia converter. Precision tests
  ensure the arithmetic is not prematurely rounded. Dedicated converter/rounding
  coverage needs an owning source task and an agreed API, not test-local substitutes.

## Verification

- Node v26.13.1; `node --test --test-reporter=tap tests/normalize.test.mjs`:
  41 tests, 22 pass, 19 fail, no skips/TODOs. Failures intentionally expose the
  existing stubs; tests were not weakened to match them.
- `node --test --test-reporter=tap`: 139 tests, 120 pass, same 19 failures.
- Requested `python -m http.server` page check could not run: python is not
  installed/on PATH; py and python3 were also unavailable. No browser verification
  was performed. This task changes tests only.

Next: source owner implements the two helpers, then rerun these commands. Existing
null-input passes alone do not demonstrate correct implementations.
