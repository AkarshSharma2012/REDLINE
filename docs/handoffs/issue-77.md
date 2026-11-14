# Issue #77 handoff

STATUS: DONE

## Final resolution (2026-11-14; supersedes historical blockers below)

- Updated issue authorization permits replacing only the two hard-coded 29-row assertions in tests/schema.test.mjs. Both now compare against parseCsv(csv).length.
- node scripts/build-evidence.mjs: succeeds, 45 rows, 0 verified.
- node --test: exit 0; 89 tests, 88 pass, 0 fail, 1 existing TODO for catalog insight coverage.
- Independent preservation checks against b0000b0 parent: original 29 parsed rows/header and existing metadata unchanged; exactly ZHAO15 and SAFFIRE21 added; all 16 additions are drafts with registered NASA URLs, nonempty locators and empty verifiers.
- Browser verification and a local web server were not run on this resume: the updated issue explicitly requires only the build and node --test.
- Generated data/evidence.json was rebuilt for tests, then restored to respect file ownership. The integration owner must rebuild it from the CSV before publication.
- Human scientific review remains required before promoting additions to verified. BRE/SAME endpoint support and fresh lunar digitization remain separate work for the reasons in research/evidence-additions.md.

## Historical handoff (before updated authorization)

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

## Fresh resume verification (2026-11-14)

- Re-ran build: succeeds with 45 draft rows, 0 verified.
- Re-ran node --test: 86 pass, 2 fail, 1 TODO (89 total). Failures remain the fixed 29-row assertions in tests/schema.test.mjs:21 and :74; no test changes authorized by file ownership.
- Independently compared parsed original 29 rows and existing metadata against b0000b0 parent: unchanged. All 16 additions have draft status, empty verifiers, locators and registered sources.
- Python remains unavailable on PATH. Prior HTTP smoke check and browser limitation above remain the available page verification; no new visual verification claimed.
- No additional evidence edits needed on resume. Integration remains blocked by test ownership and visual verification availability.
