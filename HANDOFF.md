# Issue #66 — PSI investigation catalog

Branch: task/66-b10-psi-investigation-catalog-data

Read README.md, AGENTS.md, DESIGN.md and S1/S3/S4/V2 specs in this checkout.
S1 has no catalog schema; use a separate descriptive artifact without changing evidence.json or engine interfaces.

Done: fetched NASA PSI public search (`/geode-py/ws/repo/search?size=200&type=investigation`), which returns 133 investigations, including 24 classified Combustion Science. Temporary metadata cache is outside the repository. DAFT and DAFT-2 share PSI-47. Six ACME children have their own accessions; ACME is an umbrella, not a seventh independent dataset.

Next: extract field-level citations and null notes; write catalog contract/source review and schema/provenance tests; run full tests and HTTP/browser checks; commit and push this task branch.

Decisions: metadata objectives/hypotheses are not findings. Numeric envelopes must specify whether planned, measured or hardware capability. Generic PSI Flight Platform conflicts with Approach for Saffire-I/III; use Cygnus and document conflict. CFI pressure text also conflicts; retain null pending resolution. No planetary-gravity predictions or engine labels are generated.

Environment: default sandbox cannot reach NASA; read-only public metadata fetch succeeds with approved escalation. Python is not on PATH; locate interpreter before HTTP verification.
