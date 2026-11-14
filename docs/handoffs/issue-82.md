# Issue #82 — Evidence verification checklist generator

Implemented the dependency-free generator and fixture tests. The generator reuses the existing CSV parser, includes only `review_status=draft`, groups rows by source key, resolves source metadata, and retains separate condition/observation citations. Missing values remain explicit. Fixture CSVs are created in temporary directories so no unowned fixture files are added.

Run `node scripts/verification-checklist.mjs` from any directory to regenerate `docs/verification-checklist.md`. Regeneration resets manual checkmarks/signatures; completed human reviews should be saved separately. This tool does not promote evidence review status.

Verification: `node --test` passes all 98 tests, including the two new fixture tests (first observed failing before implementation). Ran `node scripts/verification-checklist.mjs`: 29 unchecked draft rows across four source groups. Fixture tests cover filtering, grouping, dictionary URLs, unknown values, multiline/quoted CSV, Markdown escaping, zero gravity, blank signatures, empty drafts and deterministic regeneration. `git diff --check` passes.

Local HTTP smoke check: served and fetched `/` and `/docs/verification-checklist.md` using Node's built-in HTTP server; both returned HTTP 200 and the served checklist contained 29 unchecked rows. `python -m http.server` was attempted but Python is unavailable on PATH. No browser visual check was performed; no UI files changed.

Only the three issue-owned files plus this required root handoff changed. No outstanding code dependencies or changes needed elsewhere. Human source verification remains intentionally manual; all draft claims are still unverified.

STATUS: DONE
