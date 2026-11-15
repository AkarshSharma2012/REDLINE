# Issue #234
- Activated both V2 U1 regressions; focused `node --test --test-name-pattern='V2 U1' tests/edge-cases.test.mjs` fails twice as reported.
- Cause: eligible comparisons fall through to NE-no-burn without oxygen coverage.
- Next: require covering no-spread/limit evidence, preserve BURNED/NEAR precedence, then run full node --test once.
