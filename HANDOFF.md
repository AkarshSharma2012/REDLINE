# Issue #131

- Added per-evidence-ID snapshots of the full labelMaterial result and S1 query conditions, with a guarded regeneration script.
- Every evidence row supplies a query; candidate evidence is verified and material-matched. Unknown conditions stay null.
- Current engine is a stub; golden captures existing behavior, not scientific validation. No engine changes made.
- Next: generate golden, verify row-specific failure diagnostics and full node test suite, then commit/push.
