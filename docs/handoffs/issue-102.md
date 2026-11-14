# HANDOFF: issue #102 (V: Verify US25 evidence rows against the source)

## Done
- Wrote `research/verify-us25.md`: one verdict line per US25 evidence_id (U25-01-L to U25-06-L), field-by-field table with quotes and page/slide/figure locators, and a reproducible value-reading method.
- Result: all six `value` / `o2_pct` entries match the NASA source exactly (vector read of the blue "GRC Centrifuge Limit (reference)" lines: 0.135, 0.130, 0.110, 0.110, 0.210, 0.240 mole fraction). Every row is marked MISMATCH for `gravity_g` only: the source says "1/6 g" (ICES-2025-392 paper p. 7); rows hold 0.16 per the project mapping in `docs/specs/review.md`. `form = sheet` for PMMA and polycarbonate is CANNOT-CHECK (not stated in the sources reviewed).
- No data/, src/ or other files changed. `review_status` untouched.

## How it was tested
- Downloaded both NTRS PDFs (presentation 20250006779, paper 20250002114) to a temp folder; extracted text with `pdftotext -layout`; rendered slides 14-16 and paper pp. 8-9 to PNG and inspected them.
- Converted slides 14-16 to SVG with `pdftocairo -svg`, took the y coordinate of each blue reference path, calibrated against each panel's own labelled y-axis ticks, and interpolated. Results match row values to < 0.01 pp.
- Every quote in the .md was checked against the extracted text.

## For a human
- Decide whether `gravity_g = 0.16` (project convention) is acceptable versus the source's 1/6 g (~0.167).
- Decide whether `form = sheet` for U25-01-L and U25-05-L should stay, given the source does not state it.
- U25-04-L (smolder) has the same `endpoint` as the flaming row; the smolder distinction only lives in `endpoint_source`.

STATUS: DONE
