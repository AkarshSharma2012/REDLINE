# Issue #57 — evidence panel

Implemented S1 renderEvidencePanel with deterministic candidate ranking, selection, filters, draft/non-NASA inspection, full cabin/test comparison, all non-OK rule reasons, source metadata, conflict/related-endpoint annotations and separate lunar references.

Integration contract: pass result.query (selected material plus cabin conditions), or fourth argument options.query. Optional options.compareRow adapter defaults to B3 compareRow. Result wording comes from the engine. Missing query does not rank records; an empty-rule scaffold comparison shows a retryable engine failure.

Only verified NASA records can source a result statement. Other publications remain inspection-only under V2 D2. No unverified OF12 numeric estimate note is fabricated.

Next: run unit tests and local HTTP browser verification. B5/B12 must wire the query snapshot in src/main.js; that file is outside this issue's ownership. B3 must replace the current comparison stub.
