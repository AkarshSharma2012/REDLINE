# HANDOFF: issue #103, V: Verify OF12 evidence rows against the source

## Done
- Wrote `research/verify-of12.md` (the only file this task owns besides this handoff).
- I opened the NASA source (NTRS 20130010991 PDF), extracted the text with pdftotext, and rendered PDF pp. 3 and 6 to read Table I and the material description by eye.
- I checked all 6 OF12 rows in data/evidence.csv (and evidence.json, which has the same values) field by field.
- Results: 4 rows CONFIRMED (1G-MOC, 1G-ULOI, 0G-MOCSTAR, 0G-ULOISTAR). The 2 lunar rows are CONFIRMED except gravity_g 0.16 (and gravity_source "1/6 g"), which is CANNOT-CHECK because OF12 never states a numeric lunar g-level.
- No MISMATCH in values. The reviewer notes list: stale "Pressure kPa blank" text in notes; endpoint loses the asterisk (MOC*/ULOI*); the hot-wire igniter at WSTF is not recorded.

## Not changed
- No data/, src/ or review_status edits. A human decides.

## How tested
- I compared every Table I number with the rendered page image, not only the extracted text (the Nomex column comes out scrambled in text).
- I recomputed the Nomex ΔO2 % rows with Eq. (1): Martian -3.35, Lunar -2.35, 0g -0.3. They match the printed values, which confirms the row-to-value mapping.
- I checked the JSON rows with a short node script.

## Next (for a human)
- Optionally check lunar g = 0.16 against OF12 ref. 8 (Ferkul & Olson 2011, JTHT 25(3)); I did not retrieve it.

STATUS: DONE
