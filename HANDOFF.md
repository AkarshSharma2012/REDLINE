# Issue #82 — Evidence verification checklist generator

Implemented the dependency-free generator and fixture tests. The generator reuses the existing CSV parser, includes only `review_status=draft`, groups rows by source key, resolves source metadata, and retains separate condition/observation citations. Missing values remain explicit. Fixture CSVs are created in temporary directories so no unowned fixture files are added.

Run `node scripts/verification-checklist.mjs` from any directory to regenerate `docs/verification-checklist.md`. Regeneration resets manual checkmarks/signatures; completed human reviews should be saved separately. This tool does not promote evidence review status.

Verification so far: the targeted fixture tests pass (2/2), after first failing because the generator did not exist. Generated the real checklist. Next: finish full-suite and HTTP checks, then commit the generated output and final status.
