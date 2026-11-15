# Issue #230
- Reproduced production contract mismatch with three failing Node regressions: separate provenance, aliases, filters/ranking.
- Next: resolve field-level sources/locators and explicit aliases; preserve unknowns and prevent planned/model-only records receiving tested-condition points.
- Verification so far: node --test tests/investigation-production-adapter.test.mjs (3 expected failures). No servers or browsers.
