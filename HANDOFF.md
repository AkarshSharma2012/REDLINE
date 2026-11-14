# Issue #134
- Done: scripts/eval-report.mjs reuses unchanged runEvaluation; REDLINE/baseline per-label counts, confusion matrices, and every scored error (split identified), with truth/citation source links.
- Generated docs/eval-report.md using: node scripts/eval-report.mjs --evidence tests/fixtures/holdout-evidence.json --queries tests/fixtures/holdout-queries.csv --seed 7
- Report is synthetic (10 fixture queries); real research/validation-queries.csv is absent. No real accuracy claim. Default CLI uses real paths and fails without writing if inputs are missing.
- Verified: full node --test exited 0 (existing TODO failures); 2 new fixture tests passed. Targeted tests passed again after provenance formatting changes; git diff --check passed. No server/browser started.
- No changes needed outside owned files and this required handoff.
STATUS: DONE
