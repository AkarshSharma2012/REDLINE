# Saffire-II extraction — issue #107

Four draft silicone test points extracted. No sustained flame spread was reported after igniter shutdown; this does not establish an oxygen limit or certify a cabin. All rows remain `draft`; no independent verification is claimed.

## Sources and proposed metadata

The extraction source is the NASA-hosted **presentation**, not the similarly titled conference paper. Proposed entry under `sources` in `data/metadata.json` (not edited):

```json
"SF2-F17": {
  "title": "Results of Large-Scale Spacecraft Flammability Tests (presentation)",
  "authors": "Paul Ferkul; Sandra Olson; David L. Urban; Gary A. Ruff; John Easton; James S. T'ien; Ya-Ting T. Liao; A. Carlos Fernandez-Pello; Jose L. Torero; Christian Eigenbrod; Guillaume Legros; Nickolay Smirnov; Osamu Fujita; Sebastien Rouvreau; Balazs Toth; Grunde Jomaas",
  "year": 2017,
  "url": "https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf"
}
```

Title, authors and publication year: [NASA presentation, title slide/PDF p. 1](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=1). Page numbers below are one-based PDF pages and match printed slide numbers.

NASA's [Physical Sciences Informatics repository](https://psi.nasa.gov/) is the project's primary dataset repository; its entry URL redirected to the [NASA BPS data landing page](https://science.nasa.gov/biological-physical/data/) during this review. No PSI raw Saffire-II run files were retrieved. These rows are report-derived, not a transcription of PSI telemetry.

## Row audit and interpretation

| Sample | Silicone sheet thickness (mm) | Forced-flow direction | Outcome locator |
|---|---|---|---|
| 2-1 | 0.27 | concurrent | PDF p. 12 |
| 2-2 | 0.61 | concurrent | PDF p. 12 |
| 2-3 | 1.03 | concurrent | PDF p. 12 |
| 2-4 | 0.37 | opposed | PDF p. 12 |

Every sample ID and thickness above comes from [NASA presentation p. 9](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=9). Outcomes come from [p. 12, silicone results](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=12): residual flame near the igniter did not spread, then extinguished. Therefore the categorical mapping is `burn/no-burn` / `no-spread`, rather than `no-ignition`. Numeric result and result unit are blank; zero was not invented as a measurement.

Shared conditions: width **5 cm**, converted to **50 mm**; forced flow **20 cm/s**; initial oxygen **22.1%**, explicitly an ISS reading for the flight ([p. 9](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=9)). Do not treat that oxygen as a calibrated per-sample concentration or an extinction measurement. No calibrated-oxygen provenance cells are populated. The direction categories are an editorial mapping of the slide's upward/downward descriptions and ignition/airflow geometry ([pp. 7, 9](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=7)); in microgravity these describe orientation to forced flow, not buoyancy.

`gravity_g=0` is the schema's microgravity class, not a measured acceleration. Low-gravity purpose and testing in detached resupply vehicles are described on [pp. 4–5](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=4); `facility=free-flyer` avoids assigning these runs to the ISS. Pressure, imposed external heat flux, numerical uncertainty and actual run duration are **unverified** in the reviewed silicone sections. Numeric cells remain blank; uncertainty uses the spec's `not stated`. Igniter-on duration is not substituted for test duration.

## Other reports found; exclusions

- [Buoyancy effects on concurrent flame spread over thick PMMA](https://pmc.ncbi.nlm.nih.gov/articles/PMC8862122/), Maria Thomsen, Carlos Fernandez-Pello, Gary A. Ruff and David L. Urban, *Combustion and Flame*, DOI [10.1016/j.combustflame.2018.10.016](https://doi.org/10.1016/j.combustflame.2018.10.016). The accessible author manuscript identifies the Saffire-II flat PMMA experiment in section 2.2 and Fig. 4. It concerns a different material; its atmospheric conditions were not copied into silicone rows. No PMMA graph values were digitized or additional rows claimed. PMC gives online publication in 2018 and an issue date in 2019 (article header).
- [Flame spread: Effects of microgravity and scale](https://www.sciencedirect.com/science/article/pii/S0010218018304395), Urban et al., DOI [10.1016/j.combustflame.2018.10.012](https://doi.org/10.1016/j.combustflame.2018.10.012), peer-reviewed companion work. Located as related literature; no page-level numerical extraction from its full text was completed, so it supplies no CSV values.
- The similarly titled [conference-paper PDF at Edinburgh](https://www.pure.ed.ac.uk/ws/portalfiles/portal/41273713/ICES_2017_ICES2017_224.pdf) could not be opened by the web fetcher. Its search-index excerpt and the NASA presentation assign the higher flow to different fabric samples. That assignment is **unverified**; neither fabric run was extracted. The NASA presentation's fabric results and composite Nomex discussion also remain unextracted; the present deliverable is a bounded silicone set.
- Ground silicone comparisons on [presentation p. 11](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=11) were skipped: those summary statements do not provide a matched per-run condition record. They must not be combined with flight oxygen and airflow.
- No lunar inference rows, oxygen limits, assumed ambient pressure, assumed zero external heating, or invented source identifiers were added.

## Integration and verification

CSV uses exactly the current `data/evidence.csv` header, including all provenance columns. New `silicone` material registration and the proposed source entry require the data owner's review; neither registry was changed. Rows share a flight holdout group to avoid treating related specimens as independent validation data. URLs plus page locators are carried in the CSV itself.

Validation results and repository test outcome are recorded in root `HANDOFF.md`. No application code or production data was edited.
