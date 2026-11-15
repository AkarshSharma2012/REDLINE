# Issue #138
- Implemented pure pairwise detector and CLI in scripts/find-duplicates.mjs; generated docs/duplicates-report.md with row source links/locators.
- Decision: conservative material/endpoint/context matching; documented editorial numeric tolerances; unknown required conditions excluded. Candidates do not establish experimental dependence or scientific contradiction.
- Current inventory: 45 rows, all excluded for missing comparison fields; report lists gaps, so zero candidates is inconclusive.
- Verified: initial missing-module test failure, then all 6 detector tests pass; full node --test: 696 pass, 87 TODO, 0 fail (783 total). Existing TODO assertions print diagnostics. git diff --check passed. No server/browser started.
- No changes needed outside owned files except this required root handoff. Next: conductor review/merge.
STATUS: DONE
