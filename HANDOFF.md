# Issue #231
- Added loader and isolated startup regressions for null, malformed evidence arrays/rows, and malformed material registries.
- Reproduced the null startup rejection with node --test (2 failing regressions before fix).
- Loader now reuses validateEvidence before handing data to UI/engine; failures use existing Retry flow.
- Verification: ran full `node --test` once; it exposed missing DOM stub support in the new regression. Corrected the stub and child-process script transport (stdin avoids Windows command length limits).
- Final affected tests: `node --test tests/evidence-startup.test.mjs tests/main.test.mjs` — 10 passed, 0 failed, including 15 invalid startup payloads and valid empty coverage. Full suite was not repeated after harness corrections.
- No server or browser processes used.
STATUS: DONE
