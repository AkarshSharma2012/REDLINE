# Issue #127 — CSV parser tests

- Added `tests/csv.test.mjs` covering quoted commas, embedded LF/CRLF,
  escaped quotes, LF/CRLF records, UTF-8 BOM, trailing empty fields,
  short/long ragged rows, and a 1 MiB field.
- Source files unchanged; no dependencies added. No parser bugs observed yet.
- Next: run the full suite once with `node --test`, record results, and push.
