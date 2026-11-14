# Verify OTHER evidence rows against the source (#105)

Scope: every row in `data/evidence.csv` whose `source_key` is not BASS2-TM, US25, OF12 or PMMA. On this branch (based on `6addd9f`) the only such key is **M25**, which has 2 rows. No data file was changed, and `review_status` stays with a human.

Source cited by both rows: NASA Task Book, *Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres*, FY2025: https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225 (row locator: p. 3, Task Progress; p. 2 for material/facility).

## Results

- M25-FS-G: CANNOT-CHECK. The cited NASA PDF could not be opened on 2026-11-14 (see "Access attempts" below). None of the fields could be compared with the source: material (PMMA, black), rod geometry (12.7 mm), O2 18.8 %, pressure 100 kPa, gravity 1 g / ground, flow (opposed; speed blank), endpoint LOC-FS, value 18.8 % O2 "approximately", uncertainty "not stated", and the locator p. 3 / p. 2. All are unverified.
- M25-FS-M: CANNOT-CHECK. Same reason. None of the fields could be compared with the source: material (PMMA, black), rod geometry (12.7 mm), O2 16.2 %, pressure 100 kPa, gravity 0 g / ISS, flow (opposed; speed blank), endpoint LOC-FS, value 16.2 % O2 "approximately", uncertainty "not stated", and the locator p. 3 / p. 2. All are unverified.

## Access attempts (2026-11-14)

- `https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225` returned HTTP 409 Conflict with an empty HTML body. It still failed with a browser User-Agent, with a session cookie taken from `tbp/index.cfm`, and with a Referer header.
- `https://taskbook.nasaprs.com/tbp/index.cfm?action=public_query_taskbook_content&TASKID=16225` returned HTTP 200, but the page says "Invalid Reference!". So 16225 is a report ID, not a TASKID, and the public TASKID for this project was not found.
- The Wayback Machine has no snapshot of the PDF URL.
- A web search found no other copy of the FY2025 Task Book report. Related items exist, such as NTRS 20150023467 (an earlier MIST/BASS-II summary) and a UC Berkeley project page. They are different documents, so they were not used to verify these rows.

## Notes for the human reviewer (source-independent; no data changed)

- In both rows `run_id` holds a single em dash (U+2014) instead of being blank. The row notes say run ID is "unresolved". The reviewer may want the field to be truly blank so code does not read the dash as an ID.
- The values were transcribed earlier in `research/pmma-endpoints.md` (lines 11–12, citing M25 p. 3). That is the project's own earlier reading, not an independent check.
- Next step: a human with a browser should open the PDF URL above (or find the MIST project in the Task Book search at https://taskbook.nasaprs.com/tbp/index.cfm?st=advanced). They should check p. 3, Task Progress, for the approximately 18.8 % and 16.2 % LOC-FS values, and p. 2 for the black PMMA rod, 12.7 mm diameter, 100 kPa, and ground/ISS facility.
