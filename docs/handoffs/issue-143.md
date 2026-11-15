# Issue #143 — JSON Schema export

- Added deterministic `node scripts/export-schema.mjs` export to `data/evidence.schema.json` (draft 2020-12, individual evidence row schema).
- Imports field types, enums and provenance keys from the unchanged validator; mirrors required/nullable fields, numeric bounds and conditional rules.
- Dataset-wide ID uniqueness and source/material resolution remain in validateEvidence, as documented in the schema.
- Built-in-only tests check every published evidence row, export reproducibility, field mutations and conditional-rule parity. Reproducibility tolerates Git CRLF checkout conversion.
- Verified: targeted tests 3/3 pass; full `node --test --test-reporter=dot` exits 0 (existing TODO failures remain). No server or browser started.
- Next: conductor review/merge.

STATUS: DONE
