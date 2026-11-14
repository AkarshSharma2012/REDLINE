# Issue #127 — CSV parser tests

- Added `tests/csv.test.mjs` covering quoted commas, embedded LF/CRLF,
  escaped quotes, LF/CRLF records, UTF-8 BOM, trailing empty fields,
  short/long ragged rows, and a 1 MiB field.
- Source files unchanged; no dependencies added. No parser bugs found in these cases.
- Verification: full `node --test` run exited 0; all 11 new CSV tests passed.
  Existing TODO tests elsewhere still report pending assertions.
- No server or browser started. No remaining implementation work.

STATUS: DONE
