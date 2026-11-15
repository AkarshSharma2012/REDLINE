# Issue #166

- Implemented pure, non-mutating `sortByConcern`: BURNED, NEAR, NOT_ESTABLISHED; material-name tie-break, stable equal names. S1 material IDs are the fallback; the renderer resolves catalog display names.
- Results render three named/count-bearing row groups, including zero counts and the evidence-gap note. Sources, lunar endpoints, duplicate item identity and original selection indices are retained; selection resets across groups.
- Verification: new tests failed before implementation, then `node --test tests/sort-results.test.mjs` passed 3/3. `git diff --check` passed. No server/browser processes started.
- Full `node --test`: 878 tests; 788 pass, 3 fail, 87 TODO. Repeated with TAP filtering to inventory failures after truncated output.
- Out-of-scope follow-up: `tests/cabin-query.test.mjs:101,121` assume first tbody children are only data rows (now also a heading). Update assertions to count material-row buttons across all groups. Both failures are from the intentional grouped-table structure.
- Unrelated existing failure: `tests/missing-fields.test.mjs:64` ("checked-in report matches current evidence") compares generated audit text to a stale report; neither input/report nor audit code changed here.
- All issue-owned regression tests pass. Remaining suite failures require the owning tasks above; no changes made outside the three owned files and this required handoff.

STATUS: DONE
