# Issue #145 — Synthetic evidence generator

- Added CLI tests for schema validation, exact row count, seeded reproducibility, draft synthetic labeling, and invalid arguments/output paths.
- Verification: targeted `node --test tests/make-synthetic-evidence.test.mjs` fails as expected because the generator is not implemented yet.
- Next: implement dependency-free CLI; run full `node --test`. No server or browser processes.
