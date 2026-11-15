# Issue #168

- Implemented `scripts/verification-worksheet.mjs` based on #82 and generated `docs/verification-demo-sheet.md`: 44 draft rows for the five requested material IDs, stable lunar-first / ISS 21–34% O2 ordering, blank review cells, linked sources/locators and separate deduplicated caveats. Repeated source URLs share a link.
- No evidence or review status changed. Initial/final calibrated O2 stays distinct from test O2; unknown conditions stay unknown. Full sample/geometry/airflow/extraction notes remain in the linked CSV.
- Verification: full `node --test` exited 0 (existing TODO tests reported). After compacting duplicate source links, `node --test tests/verification-worksheet.test.mjs` passed 4/4; covers filtering/order/boundaries, escaping, provenance, unchanged input, deterministic generation and checked-in artifact parity. `git diff --check` passed. Inspected generated Markdown; no browser/server started, per hard rule.
- No remaining implementation work; the human must independently review and sign draft claims. Regeneration clears manual review entries.

STATUS: DONE
