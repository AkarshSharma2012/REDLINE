# Issue #51 handoff

Implemented the B2 data layer on task/51-b2-evidence-data-file-build-validate-scr.

- data/evidence.csv: 29 source-linked draft rows: 15 BASS-II observations, 12 lunar records, 2 M25 PMMA limits. Original endpoints, source URLs/locators, statuses and condition provenance retained. No independently verified quantitative rows; label consumers must filter review_status === verified.
- V1: initial/final oxygen is not LOC; fan/pot settings are not calibrated boundary flow; missing pressure/endpoint/heating remain unknown; B14 is not sustained propagation; B16 conflicting strings remain unresolved. V1 covered BASS-II only, not later lunar/PMMA files.
- V2 C1: fitted/extrapolated and compensation estimates excluded. Lunar rows remain draft, gravity mapped to 0.16, 14.7 psia mapped to 101.3 kPa where supplied, original starred/smolder/flame endpoints and centrifuge context retained. MOC is not silently mapped to MOC-T1. ETFE and PTFE are separate, no Teflon alias on ETFE.
- data/metadata.json: source/material dictionaries plus three atmosphere presets with separate source-dated protocols and assumptions. data/README.md records frozen input refs, exclusions and schema decisions.
- src/schema/validate.js: S1 validation with S4/V2 nullable pressure, V2 additional endpoints and V1 nullable unknown heating; type/range/enum/reference/unique ID checks, NASA source URLs, preset/protocol checks.
- src/schema/csv.js: strict quoted CSV parsing, BOM/CRLF/multiline handling, duplicate/empty header rejection. No dependencies.
- scripts/build-evidence.mjs: CSV to generated JSON; decimal numbers only, empty to null, validation before atomic replacement, timestamp and checkout SHA provenance. Works from script-relative root.
- tests/schema.test.mjs: synthetic verified fixture in test code; no synthetic verified data in production. Eight passing test groups cover data holds, mappings, required fields/enums, malformed input and preservation of prior output on failure.

Verification (Node v26.13.1): node scripts/build-evidence.mjs succeeded (29 rows, 0 verified); node --test passed 8/8; git diff --check passed. Ran existing Python312 interpreter with -m http.server 8051 --bind 127.0.0.1. HTTP fetch of /data/evidence.json returned 200, application/json, 29 rows / 0 verified. Browser open attempted, but browser access host is unavailable. This branch has no index.html/app scaffold, so visual page integration remains the scaffold/UI owner's check. No changes outside owned files except this required root HANDOFF.md.

Binding docs read with git show from origin/task/26 (S1), 27 (DESIGN), 28 (screens), 29 (S4), 32 (V2); R1 from 18, inputs from 19/20/21, V1 from 31, atmosphere from 24. Existing validator/CSV checkpoint continued. Independent scientific review is still needed before any row is promoted; no accuracy claim is supported by this import.

STATUS: DONE
