# Issue #87 — evidence data integrity tests

Implemented `tests/data-integrity.test.mjs` with Node built-ins only. Checks all
published evidence rows for unique nonempty IDs, HTTPS source URLs, nonempty
source locators, review status, authoritative metadata source references, finite
O2 in [0, 100], finite positive pressure and known S1/V2 result endpoints/outcomes.
No data files changed. Primary source URLs resolve through the source dictionary;
the binding schema calls the result type `endpoint` and the locator `source_locator`.

## Data completeness findings

The 15 PSI25 rows have null `o2_pct`, `pressure_kpa` and `endpoint`:
PSI25-B1, PSI25-B6, PSI25-B10, PSI25-B11, PSI25-B12, PSI25-B13, PSI25-B14,
PSI25-B15, PSI25-B16, PSI25-B17, PSI25-B18, PSI25-B19, PSI25-B20, PSI25-B21,
PSI25-B22. All are draft. These are missing quantitative evidence, not invalid
transcriptions: S1/S4 explicitly preserve unknown draft fields, and S4 §9 / V2 C3
allow unknown verified pressure too. Issue #87 explicitly requests completeness
for every row, so its three corresponding audits fail rather than skip nulls or
invent values. Data owners must source missing measurements or the issue owner
must narrow the completeness policy before these checks can be green. Existing
schema validity and scientific review remain separate from this stricter audit.

## Verification

- Before changes: `node --test` — 96 passed, zero failed.
- `node --test tests/data-integrity.test.mjs` — 9 tests, 6 passed, 3 failed:
  O2 completeness, pressure completeness and known endpoint. Each lists all 15
  PSI25 IDs above. These are data findings, not suppressed or marked TODO.
- `node --test --test-reporter=tap` — 105 tests, 102 passed, 3 failed, exactly
  the new completeness findings. All 96 pre-existing tests still pass.
- `python -m http.server 8087 --bind 127.0.0.1` — could not start: Python is
  not on PATH; neither `py` nor `python3` was available. Browser/page verification
  was therefore not performed. This task changes tests only, no UI.

## Next

Data owners / issue owner: address the documented completeness-policy conflict
before merging a suite that requires every draft row to be quantitatively complete.
Test implementation and execution are finished; a green full suite is not claimed.

STATUS: DONE
