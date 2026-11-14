# HANDOFF: Issue #104, V: Verify PMMA evidence rows against the source

## Done
- Wrote `research/verify-pmma.md`, with one verdict per evidence_id for all 6 rows in `research/pmma-rows.csv`. Two of them (M25-FS-G, M25-FS-M) are also in `data/evidence.csv`.
- Result: 6 CONFIRMED, 0 MISMATCH, 0 CANNOT-CHECK. Every checked number has a source URL and page/figure locator.
- No data file was changed, and no `review_status` was changed.

## Findings that need a human (details in research/verify-pmma.md, "Findings for a human")
1. The M25 source URL `https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225` is dead (HTTP 409 / "Invalid Reference!"). The working FY2025 PDF is `https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A4E891655E49E9A6A0353DF3D9B4DE14`, and its page numbers match the existing locators. Fix it in `research/pmma-rows.csv`, `data/evidence.csv`/`evidence.json`, `docs/submission-draft.md` and `docs/verification-checklist.md`. These files are not owned by this task.
2. `run_id` in `data/evidence.csv` for M25-FS-G/M is an em dash (U+2014). Other rows use `not provided`.
3. M16-BASS2-STABLE (13.6% O2) comes secondhand from M16, which cites BASS-II ref. [12]. The primary paper was not opened.
4. The M26 (FY2026) report gives 10 cm/s fan flow for the ground apparatus, but nothing ties it to the M25 18.8/16.2 pair, so flow stays blank.

## How it was tested
- Downloaded the FY2025 and FY2026 Task Book PDFs and the M16 NTRS PDF with curl into a scratch directory outside the repo. Extracted text with `pdftotext -layout`.
- Mapped pages from the PDF page footers or printed page numbers. Searched for every row value and for all `NN%` patterns, to confirm that no numeric LOC-FR exists.
- No code changed, so `node --test` is not affected. This task is documentation only.

STATUS: DONE
