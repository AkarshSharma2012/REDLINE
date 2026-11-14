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
- No remaining research deliverables. Conductor can review and merge the assigned branch.

Decisions:
- Research only. No app code, configuration, or scaffold changes.
- Treat inaccessible sources as gaps; do not infer extinction oxygen from initial/final oxygen.
- Root HANDOFF.md is maintained as explicitly requested; research deliverables stay in research/.
- Keep the existing 15 draft rows. Their unresolved endpoint fields stay empty, with observations and initial/final gas values separately attributed.

Verification:
- Imported research/bass2-rows.csv: 15 rows, 15 unique run IDs.
- Compared its first 17 columns to R1 section 2.1 on the fetched branch: exact names and order.
- Matched all 150 copied identity/condition fields against a fresh anonymous NASA CSV download (129 source records, 17 fields).
- Checked both condition and observation title/URL/locator fields on every row; confirmed six unresolved endpoint/condition fields remain empty.
- Read NASA Summary Report Table A.1, printed pp. 103-104, and checked all 15 observation paraphrases. Fresh report download and existing temporary PDF have identical SHA-256.
- git diff --check passed. Changed only Markdown; the existing research CSV was preserved unchanged. No app/UI/config/scaffold changes.
- Anonymous access checks are sampled; remaining videos/archives and fan-calibration contents were not analyzed. These are draft evidence narratives, not finalized quantitative limits.

STATUS: DONE
