# Issue #165 — BOM import

- Added browser-only CSV paste/file/drop importer using the existing CSV parser, 200-row/100-KB limits, physical line errors and catalog aliases.
- Imports append through cabin form addItem/changed; unknown materials retain distinct IDs and remain evaluable. Quantity and note are preserved. Rover CSV uses illustrative items with unknown dimensions blank.
- Alias research #125 is not integrated into this checkout's evidence catalog; existing catalog aliases are supported.
- Verification: all 8 BOM tests pass (parsing, multiline physical lines, limits, paste/file/drop, real-engine unknown result, form change/evaluation, sample). Full `node --test` run once: 879 total, 791 pass, 87 TODO, 1 unrelated failure in `tests/missing-fields.test.mjs:64` (checked-in report CRLF vs generated LF). Owner should normalize the report/assertion; no unowned files changed. `git diff --check` passed.
- No server, browser or persistent process started per task hard rule. Browser visual verification intentionally omitted; Node DOM double checks event wiring and query payloads.

STATUS: DONE
