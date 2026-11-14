# Saffire-I extraction — issue #106

Completed using the issue's fewer-than-three-row path. The CSV contains two draft spread-rate outcomes, one per reported Saffire-I burn. No third independent Saffire-I test was identified in the sources reviewed. These rows are research inputs awaiting independent review, not production evidence.

## Sources and extraction

- **SF1U17**, Urban et al., *Saffire: A Novel Approach to Study of Spacecraft Fire Safety Using Un-Manned Spacecraft*: [NASA PDF](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf). PDF p. 30, Table 1 gives conditions for I-1 and I-2; p. 31, continued table labels these 1-1 and 1-2. PDF p. 12 establishes microgravity context. Page numbers here are one-based PDF pages.
- Cross-check: Ferkul et al., *Results of Large-Scale Spacecraft Flammability Tests*, [NASA PDF](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf), PDF pp. 14–17: Saffire-I description, fuel and burning sequence. It describes the opposed test as a contingency using material left after the concurrent burn. This is corroboration, not another experiment.
- Peer-reviewed report located: Urban et al., *Flame spread: Effects of microgravity and scale*, [publisher DOI](https://doi.org/10.1016/j.combustflame.2018.10.012). [Author institution record](https://www.research.ed.ac.uk/en/publications/flame-spread-effects-of-microgravity-and-scale/), bibliographic details and abstract, verifies journal publication and identifies the large-fabric flights. Full-text tables were not verified here; no numeric row relies on its abstract.
- Primary NASA dataset entry point: [PSI repository](https://psi.nasa.gov/), currently redirects to NASA's BPS Data page. A Saffire-I raw-data package/run manifest was not verified in this extraction. The CSV uses public NTRS reporting, not a claimed PSI download.

## Row audit

All values below come from [SF1U17, PDF pp. 30–31, Table 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=30).

| Source run | Configuration | Spread rate | Reported duration |
|---|---|---|---|
| I-1 / 1-1 | concurrent | 1.8 mm/s | 420 s |
| I-2 / 1-2 | opposed | 1.3 mm/s | 70 s |

Both condition rows report cotton-fiberglass fabric, thickness 0.37 mm, width 40.6 cm (converted to 406 mm), and flow 20 cm/s. Source: [SF1U17 p. 30, Table 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=30). The nominal original thickness does not establish the condition of the remaining specimen after burning. `gravity_g=0` represents the microgravity category, not a measured acceleration; `free-flyer` represents Cygnus, not ISS testing. Context: [SF1U17 pp. 12–13](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=12) and [Ferkul et al. p. 5](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf#page=5).

## Missing fields, exclusions and interpretation

- Pressure, external heat flux, formal spread pass criterion and spread-rate uncertainty: unverified in the cited extracts. Numeric fields remain blank; uncertainty is `not stated`. No ambient-pressure or zero-heat-flux assumption is inserted.
- Oxygen: [SF1U17 p. 30, Table 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=30) reports a changing initial/final reading for the concurrent burn and an approximate reading for the opposed burn. A calibrated scalar oxygen condition is unverified; `o2_pct` and calibrated oxygen fields remain blank. These are not oxygen extinction thresholds.
- Duration discrepancy: [SF1U17 p. 16](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=16) gives 400 s in narrative, whereas [p. 25 and p. 31](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=31) give 420 s. CSV follows the table and retains this caveat. Duration is the reported burn duration, not total available microgravity time.
- Ignition-power figures conflict within the presentation; no ignition power is extracted. Flame power, flame length and burn length are omitted because they are different quantities from the selected spread-rate endpoint.
- Later-flight silicone, Nomex and PMMA tests, smaller fabric samples and ground comparisons are outside this issue's flight scope. Ground comparators also lack sufficient matched-condition provenance here.
- Re-reporting the same burns as separate burn/no-burn rows would inflate the count. No graph digitization, inferred oxygen limit, lunar extrapolation or invented third row is included. The opposed result must remain linked to the prior concurrent burn in any evaluation split.

## Proposed metadata entry (do not merge automatically)

Title/authors/year verified from [SF1U17 PDF p. 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf#page=1); use the presentation year rather than the NTRS acquisition year.

```json
"SF1U17": {
  "title": "Saffire: A Novel Approach to Study of Spacecraft Fire Safety Using Un-Manned Spacecraft",
  "authors": "David L. Urban, Paul Ferkul, Sandra Olson, Gary A. Ruff, John Easton",
  "year": 2017,
  "url": "https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf"
}
```

## Validation

CSV header is copied in exactly the order of the current `data/evidence.csv`; all rows remain `draft`. Only the owned research files and the explicitly required root handoff are changed. No production dataset or metadata is edited. Verification results are recorded in `HANDOFF.md`.
