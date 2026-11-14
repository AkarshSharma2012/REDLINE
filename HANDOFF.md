# BASS-II research handoff — issue #19

Current branch: `task/19-r2-bass-ii-psi-25-data-access-and-draft`.

Done:
- Read README.md and AGENTS.md; no existing HANDOFF.md was present.
- Reviewed R1 schema at `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md`.
- Located PSI-25 and NASA NTRS report 20210011385. PSI returns a JavaScript application shell; web-reader PDF fetch exceeded its size limit.
- Preserved the committed 15-row PMMA draft and reviewed its source contract.
- Independently retrieved the public CSV, README, B1 MP4, test-matrix XLSX and fan-calibration XLSX without login. Added workbook access results and the HEAD-vs-GET caveat to research/bass2.md.
- Fresh NTRS report download matched the existing SHA-256. Rechecked the 15 PMMA observation paraphrases against Table A.1 using the identical temporary PDF.
- Cross-checked R1's tentative fabric run match against the 2015 NASA-hosted paper: GMT45-T4 is the quench run; GMT45-T15 reports no blow-off.

Next:
- Finish structural and source-field validation, commit, and push the assigned branch.

Decisions:
- Research only. No app code, configuration, or scaffold changes.
- Treat inaccessible sources as gaps; do not infer extinction oxygen from initial/final oxygen.
- Root HANDOFF.md is maintained as explicitly requested; research deliverables stay in research/.
- Keep the existing 15 draft rows. Their unresolved endpoint fields stay empty, with observations and initial/final gas values separately attributed.
