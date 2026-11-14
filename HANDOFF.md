# Issue #101 — Verify BASS2-TM evidence rows against the source

Done: `research/verify-bass2-tm.md` checks all 15 `source_key=BASS2-TM` rows in `data/evidence.csv`
against NASA/TM-20210011385 (Table A.1, printed pp. 103–104 / PDF pp. 111–112; §2.1 printed p. 13).

Result: 9 CONFIRMED (B1, B6, B10, B11, B12, B13, B15, B21, B22); 1 MISMATCH (B16: the TM air display
prints "3, 5 pot, 0.4 pot", the data has "0.5 pot"; the fan value is not in the TM); 5 CANNOT-CHECK
(B14, B17–B20: `fan_display_source` comes from the PSI-25 CSV; the TM fan cell prints dashes).
Blank pressure, endpoint, value and o2_pct fields remain blank: the TM has no per-test values for them.

For a human reviewer (not changed here, files not owned):
- B16 air-display discrepancy: decide which source wins.
- B14, B17–B20 fan display values: cite them to PSI-25 only, not the TM.
- `uncertainty` "not stated": the TM gives a qualitative statement only (§2.1.2.1, PDF p. 21).
- `data/metadata.json` BASS2-TM authors "Not stated in extraction": the TM title page lists them.
- B2–B5 and B7–B9 are in Table A.1 but have no evidence row.

Decisions: no `review_status` or data file changes. The PDF was read with `pdftotext -raw`, and column
alignment was checked with `pypdf` text positions. No visual render was made.

Verification: `node --test` passes 98/98 (no code changed). The report is a Markdown file only, so
there was no page to open.

STATUS: DONE
