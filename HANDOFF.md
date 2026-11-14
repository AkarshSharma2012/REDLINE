# Issue #77 handoff

STATUS: BLOCKED: Data integration is complete, but two schema tests hard-code 29 rows outside task ownership; browser verification host is unavailable.

Branch: task/77-b14-more-evidence-rows-saffire-bass-same

## Completed

- Retained 16 saved cited BASS/BASS-II and Saffire-I/II/III rows; corrected only their review_status values to draft. Original 29 rows and header preserved.
- Added ZHAO15 and SAFFIRE21 source entries without changing existing metadata.
- Updated research/evidence-additions.md with current integration results; retained scientific caveats, source discrepancies and reasons for avoiding incompatible BRE/SAME rows and duplicate lunar rows.

## Verification

- Build succeeds: 45 draft rows, 0 verified.
- Preservation/source checks pass: existing 29 rows unchanged, saved additions changed only in status, existing metadata unchanged, new rows have registered sources, locators and empty verifiers.
- node --test: 89 tests, 86 pass, 2 fail, 1 TODO. Both failures are tests/schema.test.mjs hard-coded 29-row assertions (lines 24 and 74), now receiving 45. No tests edited because outside ownership.
- Temporary Node static server: HTTP 200 for /, /src/main.js, /data/evidence.json. Python unavailable on PATH; browser host unavailable, so no visual verification.
- Generated data/evidence.json was rebuilt for tests, then restored to respect file ownership. No generated output committed.

## Next owner actions

1. Test owner: replace both fixed 29-row assertions with CSV-derived counts.
2. Integration owner: regenerate data/evidence.json and rerun node --test; perform browser check when available.
3. Human scientific review before upgrading any additions to verified; inspect documented Saffire airflow and nominal/measured-condition discrepancies.
