# Issue #284

- Changed only public Investigations explanatory copy and added focused wording regression tests.
- Removed unsupported universal gravity bounds and blanket PSI absence wording. Distinguished catalog coverage from measured simulated-partial-gravity research; stated missing reviewed compatible endpoints, unestablished transfer, and required compatibility review.
- Existing citations, catalog/scoring/filter behavior, data/rules/schema/research and review flags are untouched. No new science verification claimed.
- Regression check: `node --test tests/investigation-gravity-wording.test.mjs` failed on old copy as intended (2 failures).
- Final validation: `node --test`: 1,183 tests, 1,139 passed, 44 TODO, 0 failed. Focused regressions pass. No server or browser started.
- Next: draft PR review and independent coordinator tests before release integration; no merge/deploy.

STATUS: DONE
