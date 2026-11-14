# Saffire-III extraction — issue #108

## Result and scope

Two distinct, page-cited qualitative burn observations are supplied in `rows-saffire3.csv`, both **draft**. The requested minimum of three was not reached. This is the issue's documented fallback, not a claim of complete coverage. Concurrent and opposed observations share a flight/sample holdout group; they are not independent replicates. No measured flammability limit is extracted.

The issue's parenthetical flight year is incorrect: NASA lists Saffire-III mission operations on **June 4, 2017**, aboard Cygnus OA-7 ([NASA presentation, slide/PDF p. 15](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=15)).

## Extracted evidence and field provenance

Primary source: Gary A. Ruff, *Spacecraft Fire Safety: Protecting Vehicles and Crews on Long-Duration Exploration Missions*, FISO seminar. [NTRS record](https://ntrs.nasa.gov/citations/20180004258) verifies author and publication date; the title slide gives November 15, 2017 ([PDF p. 1](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=1)). Page numbers below are one-based PDF pages and match slide numbers.

| CSV record | Reported evidence | Locator |
|---|---|---|
| SF3-C | Concurrent flame sequence; imposed flow **25 cm/s**; reported burn duration **320 s**. Burn duration is not total experiment duration. | [p. 17, left sequence and caption](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=17) |
| SF3-O | Opposed flame shown in comparison with concurrent flame; flow **25 cm/s**. Duration left blank. | [p. 17, lower comparison and caption](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=17) |

Material is explicitly composite fabric/SIBAL cloth on [p. 13, Saffire-I/-III sample card](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=13). Fabric form and `outcome=spread`, `endpoint=burn/no-burn` are editorial classifications of the reported flame observations, not source endpoint codes. `material_id=sibal` is a proposed mapping, not an existing metadata registration. `gravity_g=0` denotes the schema's orbital microgravity class, not a measured acceleration: see [p. 12, low-gravity objective](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=12) and the [p. 15 flight table](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=15). Cygnus is mapped to `free-flyer`; this is not an ISS glovebox test. Source run IDs were not given in the reviewed slides; CSV IDs are editorial.

## Reports located and exclusions

- Peer-reviewed report located: Urban, Ferkul, Olson, Ruff, Easton, T'ien, Liao, Li, Fernandez-Pello, Torero, Legros, Eigenbrod, Smirnov, Fujita, Rouvreau, Toth and Jomaas, *Flame spread: Effects of microgravity and scale*, **2019**, [publisher record/abstract](https://www.sciencedirect.com/science/article/pii/S0010218018304395), DOI [10.1016/j.combustflame.2018.10.012](https://doi.org/10.1016/j.combustflame.2018.10.012). Bibliography and journal pagination are corroborated by the [institutional publication record](https://www.research.ed.ac.uk/en/publications/flame-spread-effects-of-microgravity-and-scale/). Full publisher text returned HTTP 403 during this review. Search-index excerpts suggest additional conditions, but their page-level provenance is **unverified**; they supply no CSV values. Obtain the full article and inspect its methods and flight-specific tables before enriching these rows.
- Do not transfer Saffire-I trajectory measurements to this flight: the [NASA presentation p. 19](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=19) explicitly attributes the flame-base/pyrolysis traces to Saffire-I. No graph coordinates were digitized.
- Do not import silicone, PMMA or Nomex outcomes from the [p. 18 Saffire-II summary](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf#page=18). Those are a different flight.
- Earlier planned configurations are not as-run evidence: [NASA preflight poster, sample layout panels](https://ntrs.nasa.gov/api/citations/20150000894/downloads/20150000894.pdf). No planned airflow or dimensions were carried into these rows.
- [NASA PSI Data Repository](https://psi.nasa.gov/) is the challenge's primary dataset route. In this session its root redirected to [NASA BPS Data](https://science.nasa.gov/biological-physical/data/). A flight-specific downloadable Saffire-III run table was **not verified**; no PSI study number, file identifier or raw measurements are invented.

## Missing information and extraction limits

Oxygen concentration, pressure, thickness, precise exposed width, numerical spread rates, uncertainty, external heating and source run IDs remain **unverified** at page level for these observations and are blank (uncertainty is `not stated`, run ID is the schema's em dash). Geometry was not reconciled across rounded presentation dimensions and the inaccessible article. No assumed atmospheric pressure, no inferred extinction oxygen, and no zero heat flux were inserted. The opposed duration remains blank; the concurrent duration must not be copied to it.

A third distinct flight-specific test outcome was not established in the reviewed material. Multiple images, flame positions, burn duration and spread speed from one burn must not be counted as separate tests to meet a row target. Needed next: accessible full peer-reviewed text and/or PSI as-run data, followed by independent page-level verification of conditions and endpoints. These draft observations must not drive cabin labels or be interpreted as lunar measurements.

PDF text was accessible; screenshot requests returned cache-miss errors. This extraction therefore relies on explicit textual captions, not visual coordinate readings.

## Proposed metadata entry (do not apply automatically)

```json
{
  "SF3R17": {
    "title": "Spacecraft Fire Safety: Protecting Vehicles and Crews on Long-Duration Exploration Missions",
    "authors": "Gary A. Ruff",
    "year": 2017,
    "url": "https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf"
  }
}
```

The key is new relative to the checked metadata. No edits were made to `data/` or `src/`.
