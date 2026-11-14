# FLEX / FLEX-2 evidence search — issue #111

Extraction result: **no eligible rows found in the sources reviewed**. The CSV contains only the exact header copied from `data/evidence.csv`. This uses the issue's fallback when fewer than three page-cited rows can be extracted. No placeholder tests or zero-valued measurements were added. Any future extracted rows must have `review_status: draft`.

## Scope and findings

Reviewed against `research/evidence-spec.md` sections 2–4 and the binding S1/S4/V2 specifications. Search terms combined FLEX/FLEX-2, ISS, solid fuel, flame spread, droplet combustion and extinction, prioritizing NASA, NTRS and original journal records. This is a bounded source review, not proof that other results do not exist.

| Proposed key | Source and precise locator | Finding and extraction decision |
|---|---|---|
| FXOV | NASA, [Flame Extinguishment Experiment (FLEX)](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf#page=1), PDF pp. 1–2, objectives and “Fuel Type” | Liquid-fuel suppression and droplet extinction. PMMA and paper appear as examples contrasted with the droplet fuels, not as tested specimens. Skip: no solid-fuel outcome. |
| FXOV | Same [NASA document](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf#page=3), PDF pp. 3–4, FLEX-2 description and binary-array procedure | Liquid droplets, fuel mixtures and convection; the binary droplets are ignited simultaneously. That procedure does not establish measured propagation along a solid or droplet array. Skip: no eligible flame-spread result. |
| FXOV | Same [NASA document](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf#page=4), PDF pp. 4–5, FLEX-2J description | Explicit droplet-to-droplet flame-spread investigation. This is a related but separately named experiment and a prospective description, without measured spread results. Skip: no page-cited test outcome; do not silently substitute it for FLEX-2. |
| FX14 | Nayagam et al., [Cool-flame extinction during n-alkane droplet combustion in microgravity](https://ntrs.nasa.gov/api/citations/20140006750/downloads/20140006750.pdf#page=2), printed/PDF p. 2, Introduction and section 2; pp. 3–6, Figs. 1–3 and results | Actual ISS liquid-droplet observations, not solid specimens or flame-front propagation measurements. Skip: droplet size histories and burning-rate constants are not solid flame-spread rates or solid oxygen limits. |
| FXTP | Dietrich et al., [Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011](https://ntrs.nasa.gov/citations/20150023456), NTRS abstract and bibliographic record | NASA technical publication on droplet combustion. Record and author list verified. Full PDF retrieval exceeded the web reader's size limit; page-level contents **unverified**. No values extracted from this report. |

The [NASA PSI Data Repository investigation landing page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) was located, but opening it produced no readable content. Its dataset files, run records and eligibility are **unverified** in this review. No PSI measurement was transcribed.

## Peer-reviewed literature located; access limits

- Nayagam, Dietrich, Ferkul, Hicks and Williams, [Can cool flames support quasi-steady alkane droplet burning?](https://doi.org/10.1016/j.combustflame.2012.07.012). Publisher search record identifies *Combustion and Flame* and liquid n-heptane observations. Direct page retrieval failed; full text and page-level results **unverified**. No extraction. The publication date and pagination were not used as measurement evidence.
- Nayagam, Dietrich, Hicks and Williams, [Cool-flame extinction during n-alkane droplet combustion in microgravity](https://doi.org/10.1016/j.combustflame.2015.01.012). Publisher search record identifies liquid-droplet combustion; direct retrieval returned forbidden. Journal full text and page-level results **unverified**. FX14 is an accessible conference paper with the same title, not a verified substitute for the journal version.

## What is missing / why no numeric rows

An eligible row needs an actual solid-fuel or flame-spread test outcome, linked specimen and conditions, a compatible endpoint, and a page/figure/table citation. Those were not found for FLEX/FLEX-2 in the accessible sources reviewed. Droplet regression, hot-flame extinction and cool-flame extinction cannot be relabeled `LOC-FS`, `LOC-FR`, `spread-rate` or solid `burn/no-burn` merely because they concern fire suppression. This is an endpoint/form comparability decision under R1, not an assertion that liquid-fuel experiments lack fire-safety relevance.

Unverified quantities remain absent: no inferred pressure, oxygen limit, flow, heat flux, uncertainty, duration or solid specimen dimensions. No measurements were digitized or converted. A future droplet-array flame-spread paper would need its own review; liquid-array results must retain their actual form and experiment identity.

## Proposed metadata entries (context only; do not import evidence)

These short keys are new proposals, unused by the header-only CSV. `data/metadata.json` was not edited. The overview has no verified publication year or individual author credit; the empty year is intentional, and the URL upload directory is not treated as its publication date.

```json
{
  "FXOV": {
    "title": "Flame Extinguishment Experiment (FLEX)",
    "authors": "NASA",
    "year": null,
    "url": "https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf"
  },
  "FX14": {
    "title": "Cool-flame extinction during n-alkane droplet combustion in microgravity",
    "authors": "V. Nayagam; D. Dietrich; M. C. Hicks; F. A. Williams",
    "year": 2014,
    "url": "https://ntrs.nasa.gov/api/citations/20140006750/downloads/20140006750.pdf"
  },
  "FXTP": {
    "title": "Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011",
    "authors": "Daniel L. Dietrich; Paul V. Ferkul; Victoria M. Bryg; M. Vedha Nayagam; Michael C. Hicks; Forman A. Williams; Frederick L. Dryer; Benjamin D. Shaw; Mun Y. Choi; C. Thomas Avedisian",
    "year": 2015,
    "url": "https://ntrs.nasa.gov/citations/20150023456"
  }
}
```

Metadata provenance: FX14 title/authors/year are on [PDF p. 1](https://ntrs.nasa.gov/api/citations/20140006750/downloads/20140006750.pdf#page=1). FXTP title/authors/publication year are in the [NTRS bibliographic record](https://ntrs.nasa.gov/citations/20150023456), under Title, Authors and Publication Date. FXOV title and institutional attribution are from the [NASA-hosted overview, PDF p. 1](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf#page=1); publication year **unverified**.
