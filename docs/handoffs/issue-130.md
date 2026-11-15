# Issue #130
- Added 12 determinism tests for labelCabin, baselineLabel and lunarEstimate: repeated calls, four fixed evidence permutations, empty/non-burning evidence, baseline O2 branches, and mutable plus deeply frozen inputs.
- Reused the existing S1-shaped holdout fixture; no src/ changes.
- Verified: full `node --test` run: 203 tests, 116 pass, 0 fail, 87 existing TODO tests. `git diff --check` passed. No server or browser started.
- Limitation: labelCabin and lunarEstimate are currently stubs; these tests verify purity/determinism, not scientific correctness. Existing TODO failures appear after the summary but are not active test failures.
- Next: conductor integration.
STATUS: DONE
