# Issue 21 handoff

STATUS: IN PROGRESS

Completed: research/pmma-endpoints.md and six draft rows in research/pmma-rows.csv. Read README.md/AGENTS.md first; reviewed fetched issue 18 schema, issue 19 row format and issue 20 lunar report with git show. No prior local handoff or misplaced research/docs handoff existed.

Findings: accessible NASA MIST prose gives approximate LOC-FS 18.8% (1g) and 16.2% (ISS) for 12.7 mm rods at 100 kPa. Numerical LOC-FR not found in the sources reviewed; CSV records that gap without fabricated values. Marcum transfer requires geometry/stretch/blockage/buoyancy corrections and was empirically aligned to flight data. Extrapolation and sampled stable-flame observation are explicitly distinct from measured oxygen limits. No lunar label or implementation written.

Decisions: preserve the issue 18 first 17 columns and add explicit provenance/exclusion fields. Earlier numeric pair flow/heating remain unresolved rather than borrowing later apparatus settings. Publication access failures and conflicting pressure summaries are documented. Other agents' files were not edited.

Validation: Import-Csv round-trip checked six unique IDs, complete title/URL/locator/uncertainty fields, FS transcription, blank FR values and excluded extrapolation. Explicit NASA prose values only; no graph digitization. Web screenshot service failed; PDF text was accessible. git diff --check passed. Only research deliverables and root HANDOFF.md changed.

Next: final scope/provenance checks, final completion commit and push current task branch.
