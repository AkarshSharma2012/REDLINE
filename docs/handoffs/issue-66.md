# Issue #66 — PSI investigation catalog

Branch: task/66-b10-psi-investigation-catalog-data

Read README.md, AGENTS.md, DESIGN.md and S1/S3/S4/V2 specs in this checkout.
S1 has no catalog schema; use a separate descriptive artifact without changing evidence.json or engine interfaces.

Done: fetched NASA PSI public search (`/geode-py/ws/repo/search?size=200&type=investigation`), which returns 133 investigations, including 24 classified Combustion Science. Temporary metadata cache is outside the repository. DAFT and DAFT-2 share PSI-47. Six ACME children have their own accessions; ACME is an umbrella, not a seventh independent dataset.

Done: created data/investigations.json (26 entries / 24 unique PSI accessions), research/investigations-sources.md, and tests/investigations.test.mjs. Every catalog field resolves to a NASA source and locator; unknowns have notes. ACME hierarchy, shared DAFT accession, five derived studies, planned/protocol ranges, and CFI/Saffire conflicts are explicit.

Verification: node --test passes 32/32; catalog tests pass 4/4 including invalid-data mutations. Tests initially failed on the absent catalog before creation. git diff --check passes. Python 3.12 -m http.server 8066 --bind 127.0.0.1 served index.html, data/investigations.json and research/investigations-sources.md with HTTP 200; served JSON parsed to 26 entries / 24 unique PSI IDs, and the HTML contains src/main.js. Server stopped after verification.

Visual check limitation: attempted to open http://127.0.0.1:8066/ through the computer-use browser tool; it returned "The browser access host is unavailable". No visual rendering claim is made. This issue adds data/tests only and changes no page/UI code. A human/browser-capable environment can repeat the visual smoke check.

Completed extraction and source conflict audit. No engine/schema changes needed elsewhere. Future source expansion should replace unknowns only after inspecting the appropriate run-level source; structural provenance tests do not independently validate scientific paraphrases. Catalog/data commit: 3402ad7.

Decisions: metadata objectives/hypotheses are not findings. Numeric envelopes must specify whether planned, measured or hardware capability. Generic PSI Flight Platform conflicts with Approach for Saffire-I/III; use Cygnus and document conflict. CFI pressure text also conflicts; retain null pending resolution. No planetary-gravity predictions or engine labels are generated.

Environment: default sandbox cannot reach NASA; read-only public metadata fetch succeeds with approved escalation. Python is available outside sandbox PATH at C:/Users/nehap/AppData/Local/Programs/Python/Python312/python.exe. Git commits require escalation because worktree metadata is outside the writable workspace; first handoff committed as 802a9cf.

STATUS: DONE
