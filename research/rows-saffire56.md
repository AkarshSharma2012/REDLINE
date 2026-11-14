# Saffire V and VI draft extraction

Issue #110. Four draft rows in `rows-saffire56.csv`; exact header copied from `data/evidence.csv`. No changes to production data or metadata. Reviewed NASA/NTRS reports directly; these are preliminary conference reports, not independently validated limits.

## Sources and date correction

- **SFV21**: Urban et al., [Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf), title/authors/date on p. 1; experiment chronology on p. 2. Saffire V testing occurred in January 2021, not necessarily its launch year.
- **SFVI24**: Urban et al., [Preliminary Results from the Saffire VI Experiment](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf), title/authors/date on p. 1. The issue's requested 2020-2022 window cannot cover this report. NASA's [mission recap](https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/), opening mission-summary paragraph, dates the VI launch to August 2023 and completion to January 2024. Included the actual later report rather than relabeling its date.
- NASA's [Physical Sciences Informatics repository](https://psi.nasa.gov/) is the project's primary dataset route. Its landing URL redirected to [NASA BPS Data](https://science.nasa.gov/biological-physical/data/) during this review. No run-level PSI download was verified here; these rows are report extractions, not claimed PSI raw-data extractions.

## Extracted observations

Page numbers below are both printed and one-based PDF pages.

| Run | Material/configuration | O2 (mol %) | Pressure (kPa) | Nominal forced flow (cm/s) | Source and observation |
|---|---|---:|---:|---:|---|
| V-2 | Cotton jersey | 26.2 | 70.7 | 20 | [SFV21 pp. 3-4, Table 1, section III.A, Fig. 3](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=3): burned, resumed after fan interruption, then consumed. |
| VI-2 | SIBAL cloth | 31.0 | 54.1 | 20 | [SFVI24 pp. 3-4, Table 1, section III, Fig. 3](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=3): steady flame size and spread. |
| VI-3 | Two-sided cast PMMA | 30.3 | 54.6 | 20 | [SFVI24 pp. 3-4, Table 1, sections II-III, Fig. 3](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=3): growing flame; thickness 10 mm (p. 4). |
| VI-4 | One-sided cast PMMA | 28.8 | 55.2 | 20 | [SFVI24 pp. 3-4, Table 1, sections II-III, Fig. 3](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=3): growing flame; thickness 5 mm (p. 4). |

## Interpretation and missing fields

`burn/no-burn` denotes qualitative run observations, with no numeric `value` or invented pass/fail encoding. V-2 retains `consumed` per S4 rather than converting complete consumption to a limit. VI outcomes use the report's flame-growth/spread description. No oxygen threshold, spread speed or extinction criterion is inferred. Each row is one run, even when airflow changed.

The VI-3 forced flow changed from 20 to 5 cm/s at 1120 s and ended at 1420 s ([SFVI24 p. 5, Figs. 4-6](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=5)). The table's flow is a nominal initial phase, not the whole run or a measured quench boundary. Oxygen is tabulated as mol %, mapped to gas volume % by the ideal-gas convention. Microgravity is encoded as nominal `gravity_g=0`, not a measured acceleration ([SFVI24 p. 1](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=1); [SFV21 pp. 1-2](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=1)). `free-flyer`, material IDs and form enums are editorial schema mappings.

Fabric thickness, exposed width, imposed external heat flux, full test duration, formal pass criterion and quantitative uncertainty are unverified here. Corresponding numeric fields remain blank; uncertainty is `not stated`. No zero heat flux is assumed. Width descriptions differ between the reports' abstracts, so no width is assigned without resolving exposed versus nominal geometry. PMMA thickness is copied directly in mm; no unit conversion is needed.

All rows remain `draft`, with `verified_by` blank. `Saffire-IV-VI` is a conservative shared holdout group to prevent repeated reporting of the same flight data from being treated as independent evidence. It can be split only after a provenance review.

## Skipped and follow-up sources

- Saffire IV results are outside this issue. Other V samples were not needed to meet the extraction threshold; no claim of exhaustive flight coverage is made.
- Nomex did not ignite in VI ([SFVI24 p. 4, section II](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf#page=4)); it is excluded because sample-specific conditions are absent from Table 1. Do not copy the next sample's conditions to Nomex or treat ignition failure as a spread limit.
- [Opposed flame spreading along a structured PMMA-sample in exploration atmosphere under microgravity](https://ntrs.nasa.gov/citations/20210017838) identifies a relevant V experiment; no extra structured-sample row was extracted from the abstract alone. Detailed geometry/result transcription remains unverified.
- The peer-reviewed [The effect of duct size, sample size, and fuel composition on concurrent flame spread over large cellulose samples in microgravity](https://doi.org/10.1016/j.combustflame.2022.112559) is identified by the [publisher](https://www.sciencedirect.com/science/article/pii/S0010218022005673) and [UCL author-manuscript record](https://discovery.ucl.ac.uk/id/eprint/10164340/). It covers V cotton and IV SIBAL. Bibliographic year is 2023 despite the DOI's 2022 segment; article front matter/abstract supports that attribution. Its detailed quantitative tables were not extracted or independently verified here; no duplicate rows added. A peer-reviewed VI journal article was not verified in this bounded search.
- Heat release, smoke and toxic-gas concentrations are not flammability endpoints in this schema and were omitted.

## Proposed metadata additions (do not apply automatically)

Author strings are abbreviated from each report's title page. Keys are new and local to this extraction.

```json
{
  "SFV21": {
    "title": "Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires",
    "authors": "David L. Urban, Gary A. Ruff, Paul Ferkul, et al.",
    "year": 2021,
    "url": "https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf"
  },
  "SFVI24": {
    "title": "Preliminary Results from the Saffire VI Experiment",
    "authors": "David L. Urban, Gary A. Ruff, Paul Ferkul, et al.",
    "year": 2024,
    "url": "https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf"
  }
}
```

## Verification

CSV integrity checks passed (exact header, row lengths, unique IDs, draft status, blank unknown fields and page-level provenance). `node --test`: 98 passed, none failed. Python static-server/browser smoke check unavailable because Python is absent from PATH; no UI was modified. Full results are recorded in root `HANDOFF.md`.
