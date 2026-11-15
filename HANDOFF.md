# Issue #165 — BOM import

- Added browser-only CSV paste/file/drop importer using the existing CSV parser, 200-row/100-KB limits, physical line errors and catalog aliases.
- Imports append through cabin form addItem/changed; unknown materials retain distinct IDs and remain evaluable. Quantity and note are preserved. Rover CSV uses illustrative items with unknown dimensions blank.
- Alias research #125 is not integrated into this checkout's evidence catalog; existing catalog aliases are supported.
- Next: add Node parsing and DOM integration tests, run full suite once, commit and push. No servers or browsers will be started per task hard rule.
