# Issue #77 handoff

STATUS: BLOCKED: Requested unverified status is rejected by the schema; new NASA source keys require metadata entries outside B14 ownership. Build and two tests cannot pass until the owners reconcile these files.

Branch: task/77-b14-more-evidence-rows-saffire-bass-same.

## Delivered

- Appended 16 sourced rows to data/evidence.csv: 10 BASS-II (6 quench, 1 blow-off, 3 ignition failures), 2 BASS spread observations, 4 Saffire-I/II/III spread observations. 45 total rows; original 29 unchanged (Git line-ending-normalized comparison).
- All additions use literal review_status=unverified, empty verifier, NASA URLs and page/figure/table locators. No row is human verified.
- research/evidence-additions.md contains row inventory, source registration details, comparability caveats, holdout grouping, source discrepancies and exclusions. Existing six 2025 lunar rows not duplicated. BRE burner and SAME smoke results cannot be represented honestly by the solid-flammability endpoints, and are documented for follow-up instead.
- Only owned CSV/research note and this required root handoff changed. No application, metadata, validator or generated JSON changes.

## Verification

- Append-only / citation / review checks pass. Current schema returns exactly 32 errors (status and source lookup for each new row).
- node scripts/build-evidence.mjs: failed on those errors; atomic build preserved previous data/evidence.json.
- node --test: 89 tests, 86 passed, 2 failed, 1 TODO, 0 skipped. Failing tests: CSV/JSON agreement and build-validation/output-path test. Both require successful schema/source integration.
- In-memory diagnostic with draft status plus registered source keys passes validateEvidence; no diagnostic changes persisted.
- Python unavailable on PATH. Temporary Node static server: HTTP 200 for /, /src/main.js and /data/evidence.json. Browser open failed: browser access host unavailable. Visual/interactive check not completed.

## Next owner actions

1. Schema owner: reconcile issue's required unverified status with S1's draft/reviewed/verified vocabulary; keep unverified rows excluded from label/evaluation paths.
2. Metadata owner: register ZHAO15 and SAFFIRE21 using the exact sources in research/evidence-additions.md.
3. Rebuild generated evidence, rerun node --test, perform browser check, then obtain separate human scientific verification. Review Saffire nominal-vs-measured conditions and III-1 airflow discrepancy before any promotion.
4. Further coverage: digitize additional 2025 ground results carefully; design distinct gas-burner/smoke evidence support for BRE/SAME rather than forcing them into material limits.

No STATUS: DONE claim: integration and browser verification remain outstanding.
