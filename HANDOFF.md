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
- Final audit, full suite and local HTTP page check: pending.

## Next

Run final verification; record results and push this issue branch.
