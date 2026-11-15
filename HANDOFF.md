# Issue #95 handoff

- Added docs/credits.md: all 10 metadata sources and 244 distinct research URLs (page fragments deduplicated), NASA reuse guidance, challenge, Node/GitHub Pages and bounded AI disclosure.
- Preserved provenance links and marked independently unchecked bibliography, rights, deployment and AI-history details unverified. Flagged obsolete MIST URL and research-reported replacement.
- Verification: node --test run once; suite reports failures in evidence/data-integrity validation (PSI25 rows with missing/unknown endpoints) and TODO engine expectation mismatches. These are outside the owned documentation file; no engine/data edits made. git diff --check passed. No server/browser/background process started.
- Next: conductor can integrate credits; data/engine owners should resolve suite failures. Refresh register when additional sources merge. No human dependency for this documentation task.

STATUS: DONE
