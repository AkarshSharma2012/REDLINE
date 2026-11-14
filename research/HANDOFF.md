# Issue 19 handoff

Scope: BASS-II / PSI-25 research only. Branch: task/19-r2-bass-ii-psi-25-data-access-and-draft.

## Done
- Read README.md and AGENTS.md; root HANDOFF.md was absent.
- Inspected fetched branches. R1 evidence-spec.md was absent; documented a provisional CSV contract.
- Verified NASA PSI public version-4 metadata and file tree, and anonymously downloaded the experiment CSV, README DOCX, and B1 MP4 to temporary storage.
- Downloaded NASA/TM-20210011385 from NTRS and extracted the report text.
- Wrote research/bass2.md with precise source locators, file inventory, reproducible access procedure, caveats, hashes, and schema.
- Wrote research/bass2-rows.csv with 15 selected run IDs, copied NASA CSV conditions, and individually cited report observation paraphrases.

## Next
- Finish independent field/provenance validation; inspect final diff and scope.
- Commit verification results, mark STATUS: DONE, and push assigned branch.

## Decisions and limits
- All tracked output stays in research/, including this handoff, to honor the issue's folder-only scope.
- No app code, configuration, or scaffolding. No third-party dataset transcriptions.
- Keep initial/final oxygen separate from extinction thresholds; preserve mixed fan/display source strings.
- Flag B16 CSV/report flow discrepancy; retain B14 missing final oxygen as empty. Exclude suspicious B2 final oxygen rather than repairing it.
- Only the CSV, README, one MP4, and NTRS report were downloaded; other inventory entries are listed-only evidence. Video content analysis and XLSX calibration analysis are outside this draft.

## Verification so far
- NASA CSV: 129 records, 17 source columns. Draft: 15 rows.
- README: DOCX ZIP/XML opened and paragraphs read.
- MP4: full download size matches listed bytes; signature ftypisom.
- Report: printed Table A.1 pp. 103-104 confirmed as PDF pp. 111-112; selected run/sample IDs and oxygen values reviewed against those tables.
