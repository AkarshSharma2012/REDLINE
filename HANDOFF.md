## Issue #279

- Base: current main d43e996; stayed on assigned task/279 branch. PR #276 (639e063) was already merged. Preserved its BOM flow and disclosure; corrected only lunar bounds, zero-verified output and checklist anchor/guidance.
- Source check: gravity-view.js supplies no reviewed compatible endpoint pair; results-table.js returns the zero-verified empty state before per-line rendering. No runtime, data or review-status changes.
- Regression: node --test --test-reporter=spec tests/submission-science-wording.test.mjs failed all 5 tests before correction, covering bounds, simulated tests, zero-verified output, checklist guidance and anchor.
- Verified: full node --test: 1181 tests, 1137 pass, 0 fail, 44 todo, exit 0; all 5 new regressions pass. Existing TODO diagnostics are not passing science validation. git diff --check clean.
- Delivery: commit as existing user identity, push assigned branch and open draft PR; PR #276 wording is superseded only by this narrow correction. No server/browser, submission or automation.
- Limits: no human science validation or browser validation performed; lunar transfer and held-out accuracy remain unestablished.

STATUS: DONE
