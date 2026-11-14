# Issue #81 — edge-case tests

Implemented `tests/edge-cases.test.mjs` only, plus this required root handoff.
Read README, AGENTS, DESIGN, S1 architecture, S3 screens, S4 engine, and V2 review.
All required specs were present locally. No source or dependency changes.

43 ordinary tests cover compareRow, labelMaterial, labelCabin, and baselineLabel:
empty/one-row evidence, duplicate rows, BURNED-over-NEAR precedence in both
orders, missing O2/pressure, exact LOC and margin boundaries, % O2 versus kPa O2,
mm/cm/s ratios, pressure-gap/quench boundaries, verified filtering, citations,
and V2 U1/U2 coverage corrections. Inline numbers are explicitly synthetic,
using the existing fixture's S1 row shape and NASA source register; they are
not newly extracted NASA measurements. No tests are skipped or marked TODO.

## Initial verification and precise source defects

`node --test tests/edge-cases.test.mjs`: 43 tests, 19 pass, 24 fail.
All 11 baselineLabel cases pass. Failures expose existing scaffold behavior:

- `src/rules/compare.js`: compareRow always returns `{grade:'FLAG',rules:[]}`.
  A fully specified identical comparison must include the 13 E/M/F/T/W/D/V/P/G/X/H/A/U
  results; P, dimension/flow ratios, and quench-crossing contracts are absent.
- `src/rules/label.js`: labelMaterial always returns NE-no-data and empty citations,
  even with a verified spread row at exactly the cabin O2. Consequently BURNED,
  NEAR, incompatible-versus-absent reasons, V2 covering tests, unit-aware limits,
  and winning source citations are unimplemented.
- `src/rules/label.js`: labelCabin discards its evidence argument and calls
  labelMaterial with `[]` for every item. A one-row verified cabin therefore
  returns NE-no-data instead of BURNED; shared-condition routing cannot work.

These are reported rather than fixed because issue #81 forbids src changes.
Passing empty/missing-data tests do not establish that these stubs are correct.

## Final verification

- `node --test`: 139 tests, 115 pass, 24 fail; all failures are the new contracts
  listed above. The other 96 existing tests pass. Exit status is failing;
  this is not a merge-ready passing engine.
- `git diff --check`: clean.
- `python -m http.server` could not start: Python is unavailable on PATH
  (also no py/python3 launcher). Served the unchanged app with a temporary
  Node built-in HTTP server instead: `/` and `/src/main.js` both returned 200.
- Attempted to open `http://127.0.0.1:8081/` through the browser tool; it reports
  "The browser access host is unavailable". Visual page verification remains
  unavailable in this environment; no UI files were changed.

Test deliverable complete; source owners must implement the documented stubs
before the new contract tests can pass. No human decision is needed for #81.

STATUS: DONE
