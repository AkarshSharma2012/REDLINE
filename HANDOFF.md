# BASS-II research handoff — issue #19

Current branch: `task/19-r2-bass-ii-psi-25-data-access-and-draft`.

Done:
- Read README.md and AGENTS.md; no existing HANDOFF.md was present.
- Reviewed R1 schema at `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md`.
- Located PSI-25 and NASA NTRS report 20210011385. PSI returns a JavaScript application shell; web-reader PDF fetch exceeded its size limit.

Next:
- Verify PSI file inventory and unauthenticated download behavior.
- Review run tables and instrument caveats; draft source-linked rows using R1 columns.
- Validate Markdown/CSV deliverables, commit, and push the assigned branch.

Decisions:
- Research only. No app code, configuration, or scaffold changes.
- Treat inaccessible sources as gaps; do not infer extinction oxygen from initial/final oxygen.
- Root HANDOFF.md is maintained as explicitly requested; research deliverables stay in research/.
