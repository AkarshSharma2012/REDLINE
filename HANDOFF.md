# Issue #134
- Added report wrapper around unchanged runEvaluation; test-only metrics, both methods, all scored errors with provenance.
- Real frozen queries are absent; committed run will explicitly use existing synthetic holdout fixtures.
- Next: generate report, run node --test once, commit verified output. No server processes.
