# Issue #19 handoff

Scope: BASS-II PSI-25 research only; current task/19 branch. Handoff is in research/ to honor the issue's folder restriction; no root handoff existed.

Done:
- Read README.md and AGENTS.md; inspected fetched branches.
- Read R1 schema from origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md.
- Verified anonymous NASA downloads of CSV, README DOCX and one MP4; documented resolvers and source locators in bass2.md.

Next:
- Finish table dictionary, caveats, draft evidence rows and source/CSV validation.
- Finish reviewing downloaded summary report if available.

Decisions:
- Use R1 required and recommended columns; preserve unknowns.
- Never interpret pre/post oxygen as an extinction measurement.
- Keep raw downloads in temporary storage; commit Markdown/CSV research deliverables only.

Validation so far: public HTTP 200 responses, local CSV parse (129 records), DOCX XML extraction, NASA paper Appendix run IDs checked.
