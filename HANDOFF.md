# Issue #231
- Added loader and isolated startup regressions for null, malformed evidence arrays/rows, and malformed material registries.
- Reproduced the null startup rejection with node --test (2 failing regressions before fix).
- Loader now reuses validateEvidence before handing data to UI/engine; failures use existing Retry flow.
- Next: run the full node test suite once.
- No server or browser processes used.
