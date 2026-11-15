# HANDOFF: issue #120, R: Extract NASA-STD-6001B Test 1 thresholds evidence rows

## Done
- `research/rows-std6001-test1.csv`: 26 draft rows, in the exact `data/evidence.csv` column order. All come from Hirsch et al. 2007 (NTRS 20070018178), Table 2 (PDF p. 4), with every test at 70.1 kPa:
  - 20 `MOC-T1` threshold rows;
  - 6 `burn/no-burn` rows for materials that burned at least 15.2 cm at 30% O2 (Nomex HT90-40 configurations, Lexan 6006, CTD graphite/epoxies).
- `research/rows-std6001-test1.md`: what was extracted, caveats, skipped sources, and the proposed `HWHBP07` metadata entry.

## How tested
- Read the PDF with pdftotext. Checked every Table 2 value against a rendered image of PDF p. 4.
- A Python check confirmed the CSV header is byte-identical to `data/evidence.csv` and every row has the same field count.
- `node --test`: 870 tests, 782 pass, 1 fails. The failure is `tests/missing-fields.test.mjs` "checked-in report matches current evidence": the generated report has CRLF line endings on this Windows checkout. It does not involve the files this issue touches.

## For a human / next
- Add `HWHBP07` to `data/metadata.json` (the JSON is in the .md) and register the new material ids listed there.
- NTRS 20090012334 (Orion pressure series): the PDF download returned "Not found". NTRS 20100028155 and 20100015582 were not reviewed. These are the next sources to extract.

STATUS: DONE
