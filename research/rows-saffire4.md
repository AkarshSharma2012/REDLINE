# Saffire-IV extraction — issue #109

Result: two draft records; the requested minimum of three distinct, page-cited test rows could not be established. This completes the issue's documented-shortfall path. These are research inputs, not verified engine data.

The flight occurred in May 2020, rather than the issue's 2019 date ([report, p. 2, Introduction](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=2)).

## Extracted and withheld

The CSV uses the exact header/order from `data/evidence.csv`. Conditions come from [p. 3, Table 1](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=3); outcomes from [p. 8, sections III.C–D](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=8). Page numbers are printed and PDF pages alike.

- SIBAL: recorded as a spread observation. Width conversion is documented in the CSV.
- PMMA: retained as an incomplete descriptive record. Regression burning cannot be encoded as `no-spread` without risking an incorrect no-burning interpretation. Endpoint, outcome and value remain blank.
- Two other Saffire-IV samples were not ignited ([p. 3, section II](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf#page=3)). They are excluded, not classified as ignition failures.

Editorial decisions: do not multiply rows for flow changes, upper/lower surfaces, repeated publications, or flame-size metrics unsupported by the allowed endpoint vocabulary. Saffire-V observations are outside this issue. Unknown heat flux, formal pass criterion, uncertainty bounds, fabric thickness and run duration remain unverified/blank; `uncertainty` uses the required `not stated` sentinel. No graph coordinates were estimated. Oxygen is transcribed from the reported molar percentage into the schema's percentage field; source units remain noted. Gravity is an orbital class, not a measured acceleration. Independent review is required before promotion.

## Source inventory and remaining gaps

The principal source is a public NASA conference paper, identified as single-expert technical review in its [NTRS record](https://ntrs.nasa.gov/citations/20210011521). Do not describe it as a verified journal article.

A close journal lead is [The effect of duct size, sample size, and fuel composition on concurrent flame spread over large cellulose samples in microgravity](https://www.sciencedirect.com/science/article/abs/pii/S0010218022005673). Search-visible abstract text identifies Saffire-IV fabric results, but full-text access returned HTTP 403. Its page-level values, author list and publication details are **unverified** here; nothing was extracted from it.

The [NASA modeling report](https://ntrs.nasa.gov/citations/20220002714) describes comparison against previously reported gas measurements; its abstract does not establish another flammability test. Full text was not reviewed. The [earlier PMMA journal paper](https://www.research.ed.ac.uk/en/publications/concurrent-flame-spread-over-two-sided-thick-pmma-slabs-in-microg/) is not used to fill this flight's gaps.

[PSI Data Repository](https://psi.nasa.gov/) is the primary NASA dataset route. It redirected to [NASA BPS Data](https://science.nasa.gov/biological-physical/data/) during this review. No Saffire-IV run-level download was verified. Missing for expansion: an accessible per-run source establishing an additional distinct outcome and its conditions, plus a schema decision for regression burning. The search does not establish absence of further public evidence.

## Proposed metadata entry — do not merge automatically

```json
{
  "source_key": "SF4U21",
  "title": "Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires",
  "authors": "David L. Urban et al.",
  "year": 2021,
  "url": "https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf"
}
```

Metadata verified against the report title page and NTRS record. Author field is an abbreviated attribution. No change to `data/metadata.json` is proposed beyond this entry; no application files were modified.
