# Issue #129 handoff

- Added 8 isolated retrieval unit tests; preserved 11 existing tests.
- Covers weighted ranking, ID ties, empty/no matches, exact/synonym/substring material matching, aliases, gravity/pressure numeric matching, shuffled rows, limits and input immutability.
- Decision: current retrieve() is keyword-based, with no numeric distance function. Tests explicitly show nearer nonmatching gravity/pressure values receive no bonus. Implementing distance ranking requires a separate src/ task.
- Verification: ran full `node --test` once; it failed in existing data-integrity, edge-cases and normalize tests, plus an initially incorrect new gravity expected score. Corrected the expectation to include synonym weights; final `node --test tests/retrieve.test.mjs`: 19 passed, 0 failed. Full suite is not green; unrelated failures remain outside owned scope.
- No src/ edits, dependencies, server or browser processes. Next: conductor review/integration.

STATUS: DONE
