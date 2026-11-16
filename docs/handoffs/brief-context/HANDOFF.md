# #329 B2: tested conditions and source caveats in portable brief

Conductor marker only; exclude from integration if not wanted.

Done (src/rules/research-brief.js, tests/research-brief.test.mjs only, based on task/323-upgrade-integration 29c4ccf):
- Candidate accepts optional `tested_conditions` (exact 11 keys; missing key -> null, 0 stays 0, extra keys dropped, bad types rejected) and `source_notes` (string|null). Absent -> `tested_conditions: null`, `tested_conditions_status: 'unavailable'`, explicit Markdown "unavailable, not supplied".
- Markdown: per-candidate tested-conditions line, verbatim escaped source notes, partial-g context label pointing to notes (simulated/normalized).
- PARTIAL_G_LIMITATION rewritten: no 0 g/1 g bound, no "no direct data" claim.
- Change summary, IDs, locators unchanged; new fields not diffed. Older brief JSON still renders.

Tested: node --test tests/research-brief.test.mjs 15/15 (U25-01-L production values+notes from data/evidence.json); npm test 1357 total, 1313 pass, 0 fail, 44 todo; npm run build-ui OK. No server started.

Next: B1 populates producer fields in evidence-triage.js (not touched here).

STATUS: DONE
