# SAME-R (PSI-101): extraction disposition

STATUS: DONE — insufficient qualifying flammability evidence; no data rows extracted.

## Scope and decision

Primary dataset: [NASA PSI SAME-R investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101), Description / Approach / Publications. NASA identifies this as the reflight; the report below calls it SAME-2. The report explicitly distinguishes flight-specific discussion from discussion applying to both flights (printed p. 3).

The companion CSV contains only the exact header from data/evidence.csv. No dummy rows or unsupported endpoint classifications were added. Any future extracted rows must have review_status `draft`. This completes the issue's insufficient-evidence fallback, not a claim that qualifying data do not exist elsewhere.

## Public report reviewed

**SR12**: [Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2](https://ntrs.nasa.gov/api/citations/20130000422/downloads/20130000422.pdf). Page numbers below are printed pages and match PDF pages.

- Abstract, p. 1: Teflon, Kapton, cotton, silicone rubber and Pyrell were heated below ignition. These are smoke-generation experiments, not measured ignition thresholds.
- Experimental Results, p. 7: sample temperatures were selected using pyrolysis properties and instrument response. The section includes discussion spanning the original and reflight experiments; its aggregate test description must not be assigned wholesale to SAME-R.
- Instruments, pp. 4–6: aerosol instruments measure concentration and particle-size moments. These quantities are outside the endpoints and units in research/evidence-spec.md §§2–3.

Extraction decision: smoke production does not establish `spread`, `no-spread`, an ignition limit, or a flame-spread oxygen limit. In particular, heating below ignition is not a failed ignition test. No qualifying per-run flammability outcome was found in the sections reviewed. No numerical aerosol results were transcribed into the flammability CSV.

## Peer-reviewed reports located

- [Evaluation of spacecraft smoke detector performance in the low-gravity environment](https://doi.org/10.1016/j.firesaf.2018.04.004). Verified title, author order and year through NASA PSI Publications and the [NIST publication record](https://www.nist.gov/publications/evaluation-spacecraft-smoke-detector-performance-low-gravity-environment), Abstract / Citation. This concerns oxidative-pyrolysis smoke and detector response. Full-text page-level extraction is **unverified**: the publisher returned HTTP 403 and the PMC page returned a browser verification screen. No numerical values or rows extracted. NIST's author listing differs in order from NASA PSI; the proposed metadata below follows NASA PSI.
- [Smoke Characterization and Feasibility of the Moment Method for Spacecraft Fire Detection](https://doi.org/10.1080/02786826.2015.1025124). [NIST publication record](https://www.nist.gov/publications/smoke-characterization-and-feasibility-moment-method-spacecraft-fire-detection), Abstract / Citation, verifies publication details and describes smoke-size statistics and ground/flight comparisons. Full-text page-level results and assignment of individual observations to SAME-R are **unverified**. Skipped for quantitative extraction.

## Other leads and missing evidence

NASA PSI Publications lists *Smoke Aerosol Measurement Experiment-2: Comparison of Flight Experiment Results with Ground Test Results* (https://doi.org/10.2514/6.2013-3433). Full-text results were not reviewed; page-level flammability evidence is **unverified**.

NASA PSI Version History lists `PSI-101_Reports_SAME-R_Final Report.pdf`. Its full text and any run-level outcomes are **unverified** in this extraction. A follow-up should inspect this repository attachment before claiming exhaustive coverage. The public NTRS report already provides sufficient evidence to reject conversion of its aerosol results into flame-spread labels.

Missing for eligible rows: a source-supported flammability endpoint and outcome tied to a material and actual test conditions, with page/table/figure locators. Unknown oxygen, pressure, geometry, uncertainty and run identifiers were not inferred. The CSV leaves all result fields absent by containing no records. A separate smoke/detection schema would be needed to preserve aerosol measurements; changing that schema is outside this issue.

## Proposed metadata entries (not applied)

New short source keys are proposals only; no metadata.json changes.

```json
{
  "SR12": {
    "title": "Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2",
    "authors": ["David L. Urban", "Gary A. Ruff", "Paul S. Greenberg", "David Fischer", "Marit Meyer", "George Mulholland", "Zeng-guang Yuan", "Victoria Bryg", "Thomas Cleary", "Jiann Yang"],
    "year": 2012,
    "url": "https://ntrs.nasa.gov/api/citations/20130000422/downloads/20130000422.pdf"
  },
  "SR18": {
    "title": "Evaluation of spacecraft smoke detector performance in the low-gravity environment",
    "authors": ["Marit E. Meyer", "David L. Urban", "George W. Mulholland", "Victoria Bryg", "Zeng-Guang Yuan", "Gary A. Ruff", "Thomas Cleary", "Jiann Yang"],
    "year": 2018,
    "url": "https://doi.org/10.1016/j.firesaf.2018.04.004"
  }
}
```

Bibliographic provenance: SR12 title/authors/year are on the linked report p. 1; SR18 metadata are on NASA PSI Publications and NIST Citation (web sections, not numerical experimental results).

## Validation and handoff

Read README.md, AGENTS.md, DESIGN.md, architecture, screens, evidence-engine, review and evidence-spec before extraction. No data/ or src/ files changed. No server or persistent process started. Root HANDOFF.md records verification and completion as specifically required by the task.

Validation result: node --test completed with 735 passing, zero failing and 87 TODO tests (822 total). Header comparison passed: exact column order, 60 columns, zero records. git diff --check passed.
