# Issue #132

- Added byte-level repeatability tests using temporary CSV, metadata and JSON files, with automatic cleanup.
- Tests cover original and reversed row order. Builder preserves order, so cross-order equality is not required. Fixed `builtAt` makes time an explicit input; script unchanged.
- Verified: `node --test` exited 0; both new determinism tests passed. Existing TODO-marked assertions still report failures without failing the suite. No server or browser started.
- Script unchanged; no remaining implementation work.

STATUS: DONE
