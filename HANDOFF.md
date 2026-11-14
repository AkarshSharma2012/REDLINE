# Issue #62 — Final submission write-up

Updated docs/submission-draft.md against the actual checkout, source registers, AI disclosure and task handoffs. Includes objective-to-feature mapping, explicit primary PSI dataset, NASA resource uses/locators, agent/Fable status, human-review limits, and honest accuracy status.

Key findings: all 29 evidence rows are draft; comparison/label/evidence-panel implementations are stubs; main wiring and catalog/UI provenance adaptation are incomplete; Ask/gravity/accuracy modules are not mounted. No validation-results.csv exists locally or on fetched origin/task/56. Accuracy is therefore not run, not a synthetic score or the V1 transcription audit.

Scope: only owned submission draft plus this required root handoff changed. Integration/data/engine work remains with its owners; this documentation issue does not repair it.

Verification pending: final diff/link checks and local page smoke check. node --test exited 0: 89 tests, 88 passed, 0 failed, 1 TODO (all 26 catalog investigation insights missing). No empirical accuracy claim follows from these tests.

Final verification:
- node --test: exit 0, 89 tests / 88 pass / 0 fail / 1 TODO; the TODO records missing catalog insights, not a completed scientific evaluation.
- git diff --check HEAD: passed; all 48 Markdown links inspected for syntax and all relative targets exist. NASA Combustion Science overview opened for context; PSI landing page returns a JavaScript shell. Dataset claims use repository source registers, not a claim of fresh independent revalidation of all NASA papers.
- Served repository using Python 3.12 -m http.server 8062 --bind 127.0.0.1. Isolated headless Edge opened / and exited 0, producing the rendered DOM. Submission draft returned HTTP 200. Browser smoke is not an end-to-end scientific validation. Catalog/UI schema mismatch remains for the integration owner.
- Only docs/submission-draft.md and required root HANDOFF.md modified. Documentation task complete; absence of an empirical accuracy report is explicitly disclosed rather than filled with fixture results.

STATUS: DONE
