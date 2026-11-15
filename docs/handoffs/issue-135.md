# Issue #135 handoff

STATUS: DONE
Implemented scripts/eval-errors.mjs, docs/eval-errors.md and small fixture tests.
Reuses holdout runner; nearest means retained verified uncited same-material row.
Engine is currently a stub; fixture tests inject decisions. No engine changes needed.
Verified: full node --test exited 0 (existing TODO tests remain); both new tests pass.
CLI fixture smoke: valid JSON, 10 evaluated, 9 disagreements, 0 excluded (seed 7).
git diff --check passed. No server, browser or persistent process started.
