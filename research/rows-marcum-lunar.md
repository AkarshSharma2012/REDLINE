# Marcum lunar counter-example: extraction result (issue #117)

Research only; reviewed 2026-11-14. **Outcome: no rows extracted.** [rows-marcum-lunar.csv](rows-marcum-lunar.csv) holds only the exact header of `data/evidence.csv`. Fewer than 3 lunar-gravity rows with page-level citations could be verified, so the issue's fallback applies. This note says what was found, what is missing and why.

## 1. Main finding: no Marcum paper with a lunar-gravity result was found

The issue assumes that Marcum et al. paper(s) report a lunar-gravity result that does not follow the simple 0 g to 1 g trend. **That paper was not found in the sources reviewed.**

All Marcum (J. W.) combustion records in NASA NTRS were searched (API queries `Marcum`, `Marcum Olson`, `Marcum Ferkul`, `Marcum lunar`). Each available PDF was downloaded and text-searched for `lunar`, `moon`, `mars`, `partial`, `centrifug`, `0.16` and `1/6`:

| NTRS ID | Title (authors, year) | Gravity levels in the paper | Lunar terms found |
|---|---|---|---|
| [20160012691](https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf) | Correlation of Normal Gravity Mixed Convection Blowoff Limits with Microgravity Forced Flow Blowoff Limits (Marcum, Olson, Ferkul, 2016) | 1 g ground compared with BASS-II microgravity (p. 1, abstract) | none (9 pp.) |
| [20170006615](https://ntrs.nasa.gov/api/citations/20170006615/downloads/20170006615.pdf) | Mixed Convection Blowoff Limits as a Function of Oxygen Concentration and Upward Forced Stretch Rate for Burning PMMA Rods of Various Sizes (Marcum, Ferkul, Olson, ICES 2017) | 1 g and BASS-II microgravity (NTRS abstract) | none (8 pp.; one reference title contains "Partial Scaling") |
| [20170003880](https://ntrs.nasa.gov/api/citations/20170003880/downloads/20170003880.pdf) | Low Pressure Flame Blowoff from the Forward Stagnation Region of a Blunt-Nosed Cast PMMA Cylinder in Axial Mixed Convective Flow (Marcum, Rachow, Ferkul, Olson, 2017) | 1 g, plus a handful of microgravity drop tests (NTRS abstract) | none ("partial" hits are all "partial pressure of oxygen") |
| NTRS ID 87770875226299 | High-speed video analysis of flame oscillations along a PMMA rod after stagnation region blowoff (Olson, Ferkul, Marcum) | not reviewed: NTRS record has no abstract and no PDF | unverified |

The 2019 journal versions (Marcum et al., *Proc. Combust. Inst.* 37, 4001–4008; Marcum et al., *Combust. Flame* 216 (2020) 385–397) are listed in the NASA Task Book bibliography for the same project (FY2019–FY2022 entries; see §2). Their full text was not retrieved. Their Task Book summaries describe only normal-gravity and microgravity tests. **Inference:** Marcum's papers give the 1 g / 0 g blowoff correlation that [pmma-endpoints.md](pmma-endpoints.md) already calls the "Marcum counter-example". That counter-example is about Earth tests reproducing a flight boundary. It does not concern lunar gravity. The issue title probably merges it with the lunar result below.

## 2. Where the lunar counter-example actually comes from

The lunar-gravity PMMA rod result comes from the same NASA Glenn project (PI Sandra Olson), which also produced the Marcum papers. The same concurrent axial-stagnation rod geometry was used. The result is reported under Olson et al., not Marcum:

- **Peer-reviewed paper (not retrieved):** S. L. Olson, E. S. Neumann, V. M. Valletta, A. L. Ogorzaly, J. C. Owens, "Partial gravity flammability of cast PMMA rods in concurrent axial stagnation flow," *Fire Safety Journal* 150 (2024) 104267, DOI [10.1016/j.firesaf.2024.104267](https://doi.org/10.1016/j.firesaf.2024.104267). Authors and volume come from Crossref. **Marcum is not an author.** OpenAlex lists an author-manuscript URL. ScienceDirect returned HTTP 403 for both the article and the manuscript pages. The paper is not in PMC (NCBI ID converter: "Identifier not found in PMC"). No values from this paper are used.
- **NASA Task Book, FY2023 entry** (Task Last Updated 11/18/2022), *Correlation of Normal Gravity Aerospace Materials Flammability Data with Flammability in Microgravity Environments*, PI S. Olson, NASA GRC. [NASA PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=D98ECEE7D8DDC71091E3471C2D981FFC), p. 2, Task Progress. It reports these results:
  - Concurrent rod blowoff tests were run at variable gravity levels in the centrifuge drop vehicle of the Zero Gravity Research Facility.
  - The rods were 0.318 cm radius PMMA, tested at 8.2 psia (the lunar exploration vehicle pressure).
  - The boundary is "just slightly shifted down" from the BASS-II boundary.
  - The buoyant flow is estimated as Ub = 25 (g/gEarth)^1/2 cm/s.
  - "The stable flame at lunar g level and 13.8% O2 is very close to the minimum in the BASS-II flammability boundary."
- **NASA Task Book, FY2022 entry** (updated 10/28/2021). [NASA PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A9296A5251A3ABD303281BAD39D22367), p. 2, Task Progress. It gives the same 13.8% O2 lunar-g statement and says "a few additional tests are planned".
- **NASA Task Book, FY2025 entry** (updated 02/24/2025). [NASA PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=492A5F96AAA7FB9492887E390BF6713F), p. 2. It cites the *Fire Safety Journal* 2024 paper, gives the pressure as about 56 kPa, and says the gravity levels went up to simulated normal gravity. Its key statement: "The most flammable condition (the lowest oxygen that supports a flame) appears to be near lunar gravity levels." This is the qualitative statement of the non-monotonic (counter-example) trend. It gives no numeric values.
- **NASA LPSC 2026 presentation** (Ferkul, Kralik, Liao, Johnston). [NTRS PDF](https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf), PDF p. 20 (printed "Page 19"). It reproduces the Olson et al. (2024) "Flammability Boundary for upward-burning PMMA rods in centrifuge" figure and says the "extinction boundary shaded in green divides steady flames from extinguished flames in centrifuge drop tests". Run values appear only as graphics. No numbers are in the text layer, and none were digitized.

## 3. Why no CSV rows

| Candidate | Status | Reason |
|---|---|---|
| PMMA rod, r = 0.318 cm (6.36 mm diameter), 8.2 psia, simulated lunar g (centrifuge drop), 13.8% O2, stable flame | **Not entered; one candidate only** | This is the only text-stated lunar test point. It falls short of the 3-row minimum. Forced-flow speed, exact g value, run ID, test duration and the 1 g / 0 g comparison values at the same conditions are **unverified** (not stated in the Task Book text). It comes from a progress report, not the peer-reviewed paper. |
| Other centrifuge runs (other g levels, extinguished points) | Skipped | Shown only in the figure (F26 PDF p. 20; *Fire Safety Journal* 2024). The full paper is inaccessible. Digitizing a reproduced figure would not give run-level values, so they were not guessed. |
| "Most flammable near lunar gravity" | Skipped as a row | Qualitative statement with no value (Task Book FY2025 p. 2). It can be quoted as context with its link. |
| LUCI New Shepard lunar-g PMMA/SIBAL ([NTRS 20250010653](https://ntrs.nasa.gov/api/citations/20250010653/downloads/ASGSR%202025-LUCI-Ferkul-Presentation-v2-20250010653.pdf)); SIBAL aircraft lunar-g spread rates (F26 PDF pp. 21–22) | Out of scope | Not Marcum and not this counter-example. They belong to a separate LUCI/FM2 extraction task if the team wants them. |
| U25/OF12 lunar centrifuge limits | Already extracted | Covered by [lunar-2025.md](lunar-2025.md) (issue #20). Not duplicated here. |

If a human later adds the candidate row, these values are sourced: material `PMMA, cast` (rod), `thickness_mm` 6.36 (diameter = 2 × 0.318 cm), `pressure_psia` 8.2 (`pressure_kpa` about 56.5, a unit conversion), `o2_pct` 13.8, `facility` drop-tower (centrifuge), `gravity_regime` simulated lunar, `outcome` stable flame. The proper wording would be "burned in testing at these conditions". It should be flagged as a short-duration drop result, with `flow_speed_cm_s` blank. This was not done here because of the 3-row rule.

## 4. Proposed `data/metadata.json` entries (not edited)

No rows use these keys yet. They are proposed so a later extraction can cite the sources.

```json
"OLSON-TB23": {
  "title": "Correlation of Normal Gravity Aerospace Materials Flammability Data with Flammability in Microgravity Environments (NASA Task Book, FY2023)",
  "authors": "Sandra Olson (PI)",
  "year": 2022,
  "url": "https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=D98ECEE7D8DDC71091E3471C2D981FFC"
},
"OLSON-FSJ24": {
  "title": "Partial gravity flammability of cast PMMA rods in concurrent axial stagnation flow",
  "authors": "S.L. Olson; E.S. Neumann; V.M. Valletta; A.L. Ogorzaly; J.C. Owens",
  "year": 2024,
  "url": "https://doi.org/10.1016/j.firesaf.2024.104267"
}
```

`year` for OLSON-TB23 is the "Task Last Updated" date (11/18/2022), not the fiscal year label (FY2023). OLSON-FSJ24 is peer-reviewed but was **not read** (paywalled/403).

## 5. What is missing (for a human)

1. The full text of Olson et al., *Fire Safety Journal* 150 (2024) 104267. The author manuscript is listed as open (OpenAlex), but automated fetches were blocked. Its run table or figure data are needed for ≥3 lunar/partial-g rows with page citations.
2. Confirmation from the issue author: does "Marcum lunar counter-example" mean this Olson et al. result? If yes, retitle the task. If a specific Marcum paper was meant, its citation is needed: none was found in the sources reviewed.
3. The NTRS record 87770875226299 (Olson, Ferkul, Marcum) has no file attached. Its contents are unverified.
