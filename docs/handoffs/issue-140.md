# Issue #140: Missing-field audit

- Added scripts/missing-fields.mjs and generated docs/missing-fields.md: every row, blank columns, per-source counts, source links and locators.
- Flow covers speed and direction separately. Absent/null/empty/whitespace fields are blank; zero and populated notes count as present. This audits completeness, not scientific validity.
- Added four tests covering aggregation, nonmutation, zero/blank handling, provenance, Markdown escaping, CLI success/failure and checked-in report consistency. Fixtures inline to respect ownership.
- Verification: node scripts/missing-fields.mjs succeeded; full node --test exited 0, including all four new tests. Existing TODO tests remain. No server or browser started.
- No changes needed outside owned files and required root HANDOFF.md.
STATUS: DONE
