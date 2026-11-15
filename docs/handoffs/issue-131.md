# Issue #131

- Added per-evidence-ID snapshots of the full labelMaterial result and S1 query conditions, with a guarded regeneration script.
- Every evidence row supplies a query; candidate evidence is verified and material-matched. Unknown conditions stay null.
- Current engine is a stub; golden captures existing behavior, not scientific validation. No engine changes made.
- Verified: `node --test` reports 236 tests, 149 pass, 0 fail, 87 existing TODOs; all 45 snapshot cases pass.
- Intentional golden mismatch failed with the affected evidence ID in the diagnostic; original golden restored. Regeneration produced no diff.
- No server/browser started, per conductor instruction. No remaining work for this issue.

STATUS: DONE
