# Issue #57 — evidence panel

Implemented S1 renderEvidencePanel with deterministic candidate ranking, selection, filters, draft/non-NASA inspection, full cabin/test comparison, all non-OK rule reasons, source metadata, conflict/related-endpoint annotations and separate lunar references.

Integration contract: pass result.query (selected material plus cabin conditions), or fourth argument options.query. Optional options.compareRow adapter defaults to B3 compareRow. Result wording comes from the engine. Missing query does not rank records; an empty-rule scaffold comparison shows a retryable engine failure.

Only verified NASA records can source a result statement. Other publications remain inspection-only under V2 D2. No unverified OF12 numeric estimate note is fabricated.

Next: run unit tests and local HTTP browser verification. B5/B12 must wire the query snapshot in src/main.js; that file is outside this issue's ownership. B3 must replace the current comparison stub.

Verification:
- node --test: 38 passed, 0 failed (includes 10 new panel tests).
- git diff --check: passed.
- python -m http.server 8057 --bind 127.0.0.1: served successfully outside sandbox; GET / returned HTTP 200.
- Browser open attempted with cua.createBrowserTab at http://127.0.0.1:8057/. Tool failed with "The browser access host is unavailable". No visual/browser interaction verification is claimed.
- Tests use inline synthetic S1-shaped rows because tests/fixtures is outside this issue's owned files. No scientific fixture claim is presented as actual NASA evidence.

Remaining: browser verification requires a working browser host. Then verify responsive wrapping, keyboard focus during selection/filter updates, and source navigation. The shipped scaffold still needs B3 comparison implementation and B5/B12 query snapshot wiring; these files were not modified.

STATUS: BLOCKED: Required browser verification unavailable because the browser access host is unavailable.
