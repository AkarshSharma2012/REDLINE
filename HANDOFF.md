# HANDOFF: issue #118, R: Extract partial-gravity limits (Olson/Ferkul) evidence rows

## Done
- `research/rows-olson-partial-g.csv`: 24 draft rows in the exact `data/evidence.csv` column order.
  - 18 rows are OF12 Table I limits (key `OF12`, already in metadata): Mylar G and Ultem 1000 at 1g, Martian, lunar and 0g, plus the Nomex Martian rows. The Nomex 1g, lunar and 0g rows are already in data.
  - 6 rows are LUCI25 spread rates (simulated lunar g on a New Shepard rocket, and 1 g).
- `research/rows-olson-partial-g.md`: sources, the proposed `LUCI25` metadata entry, what was skipped and why.

## How tested
- I read the NTRS PDFs with pdftotext and checked OF12 Table I and LUCI pp. 22 and 33 on rendered page images.
- I recomputed the OF12 Eq. (1) ΔO2 values from the transcribed numbers, and all match the printed ones.
- A Python check confirms the CSV header equals the evidence.csv header and every row has the same field count.
- No code was changed, so `node --test` is not affected.

## For a human / next
- Add `LUCI25` to `data/metadata.json` (JSON is in the .md).
- Map facility `sounding-rocket` to an enum value.
- Retrieve ref. 8 (Ferkul & Olson 2011, JTHT 25(3)) to confirm the lunar g-level and test durations.

STATUS: DONE
