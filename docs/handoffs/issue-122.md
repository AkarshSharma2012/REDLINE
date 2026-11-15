# Issue #122 â€” PTFE / silicone / rubber extraction

## Done

- Read repository instructions and binding specifications.
- Extracted nine draft MOC-T1 thresholds for PTFE, silicone and EPDM from NTRS 20070005041, Table 2, PDF/printed p. 4.
- Preserved exact production CSV header order; source URLs and page locators accompany numeric fields.
- Documented source status, skipped reports, unknowns, endpoint limits and proposed HWB06 metadata in research/rows-ptfe-silicone.md.
- Only task-owned research files and this required root handoff changed.

## Decisions / next

- No production data or metadata edits. Required form and numeric gravity are unverified and blank; direct schema import requires the integrator to resolve these fields and material catalog entries.
- MOC screening results do not imply no ignition/no spread and cannot be converted into flame-spread limits.
- Final journal publication identity is unverified; cite the NTRS preprint.
- Independent review and visual table verification remain for the verification task; no human input is needed to finish this extraction.

## Validation

- CSV integrity checks passed: nine unique rows; exact 60-column header; table values and pressure mapping; draft status; page URLs/locators; unknown fields blank; lossless CSV round trip.
- node --test exited 0. Existing TODO assertions were reported by the suite; this is not a claim that every TODO passes. A dot-reporter rerun also exited 0.
- PDF text checked at cited pages; inspectable table screenshots unavailable. Visual confirmation remains for independent review.
- No persistent process, server or browser started.

STATUS: DONE

