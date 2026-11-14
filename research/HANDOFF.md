# HANDOFF: issue #22 (R5: NASA's position: standards, FM2, Saffire)

## Done
- research/nasa-context.md: NASA-STD-6001B Test 1 (purpose, method, pass/fail, MOC), JSC 27301J §5.1.1
  (reduced-gravity wording, pp. 51-53), FM2 (objectives, hypothesis, 2024 vs 2026 test plans, delivery/status,
  no flight date), Saffire I-VI (conditions table, measurements, Test 1 findings, public reports list),
  knows-vs-open paragraph, REDLINE wording rules, full source register.
- All PDFs text-extracted locally with pdftotext and checked line by line for page locators.
- Second-pass spot check (re-downloaded STD6001, JSC27301, SAF21): Test 1 pass criteria, "Air shall not be allowed to flow", JSC §5.1.1 e note and i quotes, and SAF21 Test 1 quotes all match. Corrected one error: the standard does mention microgravity once (App. A.2.1.3, Test 2, pp. 59–60), not zero times.
- Cross-checked against branches #18, #19, #24 and #33 (consistent; #19 re-checked after it gained research/bass2.md).

## Key decisions
- FM2 has two published test plans (2024: 21%/14.7 psia + 34%/8.2 psia, SIBAL + PMMA; 2026: 8.2 psia at
  37/33/29/25% O2, one fabric). Kept separate, not merged.
- FM2 vehicle: 2024 says CLPS CP-21, 2026 says SpaceX uncrewed demo. No official flight date found, so none given.
- Saffire = microgravity + forced flow; never present it as lunar data.
- Wording conflict: AGENTS.md lists "never tested" as allowed wording; the #22 issue rules forbid it. This file follows the issue ("not found in the sources reviewed"). Flag for a human to align AGENTS.md.

## Known gaps
- PSI Saffire raw data not accessed (psi.nasa.gov is a JS app); Saffire IV-VI not in PSI catalog page.
- NTRS 20210017780 / 20240007488 (Saffire presentations) found but not opened.

STATUS: DONE
