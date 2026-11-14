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
- Research complete. Endpoint extraction and video/calibration analysis are follow-on work before these draft narratives can drive quantitative labels.

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

## Final validation
- PASS: 15 unique evidence IDs; all 150 copied source fields match the original NASA CSV after the documented none-to-empty conversion.
- PASS: each row has source titles, URLs, run-specific locators, observation paraphrase, and caveat.
- PASS: git diff --check; all issue changes are Markdown/CSV under research/. No app files or configuration changed.
- Draft conditions and report observations were reviewed together; recorded B14/B16 source differences remain explicitly flagged.

## R1 schema follow-up (2026-11-14)
- Read R1's now-available evidence-spec.md on origin/task/18-r1-evidence-table-spec-and-comparability at 278d60b0a20a354cd88bc8c84e3762d4f39f78c8.
- Added its 17 required columns in order plus notes, preserving all original source/provenance columns and all 15 run IDs. Geometry uses explicit source-string unit conversions; film-to-sheet classification is labeled editorial inference.
- Left endpoint/result, single flow/O2 and pressure fields empty where this transcription does not establish them. Initial/final oxygen remains separate. These are incomplete draft endpoint rows, not quantitative boundary records.
- Refetched public PSI metadata and experiment CSV anonymously; version 4, DOI and CSV hash match the original investigation. Previously downloaded README/report hashes match, and their caveat paragraphs and selected Table A.1 observations were rechecked.
- Revalidated all 150 copied source fields, row uniqueness, required-column order, numeric geometry, missing endpoint fields and source locators. No app/config files changed.



## Independent verification pass (2026-11-14)
- Retained the existing 15-row CSV and R1 column ordering. Restored the detailed report and handoff after a preliminary checkpoint briefly replaced their content.
- Freshly downloaded NASA CSV, README, B1 MP4 and summary PDF; all four hashes match the documented originals. Re-read README caveats and Table A.1 observations for all selected runs.
- Re-fetched the public version-4 file tree: 695 leaves and the documented format counts; no restricted leaves.
- PASS: 129 original records; 15 unique draft IDs; 150 copied fields match; every row has condition/observation provenance; quantitative endpoint fields remain empty. PASS: git diff --check.
- Corrected access guidance: exact URL-encoded filenames worked in this pass; earlier 404 observations are historical, not a claim that filenames cannot work.
- Added the source-backed GMT45-T4 versus GMT45-T15 correction for R1's tentative SIBAL example; no other branch edited.
- All tracked changes remain Markdown under research/; no app/config/scaffold changes. No additional endpoint extraction is required for this research draft; physical boundary extraction remains follow-on work.

STATUS: DONE
