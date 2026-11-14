# HANDOFF — Issue #18: R1 Evidence-table spec and comparability rules

## Done
- `research/evidence-spec.md`: table schema (17 required columns from the issue + 6 recommended extras),
  endpoint explainer (LOC-FS, LOC-FR, quench, blow-off, MOC-T1, LOI-D2863, ignition, spread rate),
  14 comparability rules graded INVALID / FLAG / OK, 3 worked examples with published values
  (PMMA rods ISS vs 1 g [Link 2018]; ETFE wire 1 g vs parabolic flight [Osorio 2014];
  SIBAL fabric ISS quench vs NASA-STD-6001 Test 1 = INVALID), sources list with page/section locators.
- Verified: every page/figure locator was checked against text extracted from the source PDFs
  (NASA-STD-6001B Change 3, Zhao 2015, Osorio 2014, Huang 2019, Ferkul 2016 slides, Urban 2014 poster)
  or the Sci Rep HTML (Link 2018, sections/figures; no page numbers online).

## Gaps (not reviewed; see spec section 6)
- Texas Tech repository (ICES-2025-323 with LOC-FS/LOC-FR terminology; Olson ICES 2019 BASS-II limits)
  returned HTTP 403 to the fetcher. A human could download them manually.
- BASS-II Summary Report TM-20210011385 exceeds the 10 MB fetch limit.
- Thresholds marked "inference" in the rules table (2x, 10 kPa, 5 kW/m2, 1 point) need science-lead review.

## Key decisions
- Endpoint mismatch is always INVALID; gravity mismatch is always FLAG (labelled "cross-gravity").
- O2 % and total pressure stored separately; O2 partial pressure is derived, never entered.
- Added `wire` form and `upward-buoyant` flow direction so Test 1 and wire data fit the schema.

STATUS: DONE
