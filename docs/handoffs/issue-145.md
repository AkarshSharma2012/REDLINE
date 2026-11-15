# Issue #145 — Synthetic evidence generator

- Implemented dependency-free CLI: `node scripts/make-synthetic-evidence.mjs --rows 10000 --seed 42 [--out path/evidence.json]`.
- Defaults to a new OS temp directory; refuses overwrites and lexical/physical paths under data/. Fixed timestamp and uint32 seeded PRNG give reproducible output.
- Generated rows are explicitly SYNTHETIC and draft; NASA repository link is context only, not support for generated measurements.
- Tests validate 1,000 rows and empty output through `validateEvidence`, compare repeated/different seeds, and reject invalid arguments/data paths.
- Verification: targeted test failed before implementation as expected; full `node --test` passed (exit 0; existing TODO failures remain). No server/browser started.
- No remaining work or changes needed outside owned files.

STATUS: DONE
