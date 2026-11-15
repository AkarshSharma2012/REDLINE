# Issue #148 handoff

- Added docs/contributing-data.md: source-to-CSV workflow, every core/provenance column, independent review/status gates, build/test instructions.
- Worked example: existing PSI25-B1 draft; preserves unresolved endpoint and distinguishes transcription review from quantitative verification.
- Current validator amendments documented: unknown pressure permitted; unknown heating stays null. No data/application edits needed.
- Verification: full `node --test` run once on Node v26.13.1; FAILED on existing data-integrity (B1 missing O2/pressure/endpoint) and rules/normalization assertions (including missing P/T/V and gravity classification). These files are outside ownership; no fixes attempted. Log: system TEMP/redline-148-tests.log. `git diff --check` passed. No server/browser started.
- Documentation checked against CSV header, existing B1 row, builder and validator. Example is explicitly not an independent NASA-source verification.
STATUS: DONE
