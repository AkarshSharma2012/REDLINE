# Verification of PMMA endpoint rows against the NASA sources

Issue #104 (V). Reviewed 2026-11-14. Scope: all 6 rows in `research/pmma-rows.csv` and the 2 matching rows in `data/evidence.csv` (`M25-FS-G`, `M25-FS-M`). The other four PMMA rows are not in `data/evidence.csv`.
This review changed no data and no `review_status`. A human decides what to change.

## Result per evidence_id

| evidence_id | Status | Short reason |
|---|---|---|
| M25-FS-G | CONFIRMED | Every field matches FY2025 MIST report p. 3 (value, diameter, pressure, gravity) and p. 2 (black PMMA, opposed flow, ground chamber). The cited `source_url` does not resolve; see Finding 1. |
| M25-FR-G | CONFIRMED | No numeric LOC-FR appears in the FY2025 report; the endpoint is described on pp. 2–3. Blank value is correct. |
| M25-FS-M | CONFIRMED | Every field matches FY2025 MIST report p. 3 ("~16.2% in microgravity", 12.7 mm, 100 kPa) and p. 2 (ISS CIR, black PMMA). Same URL issue as M25-FS-G. |
| M25-FR-M | CONFIRMED | Same as M25-FR-G: endpoint described, no numeric value in the FY2025 or FY2026 reports. |
| M16-INTERCEPT | CONFIRMED | 13.4% O2 zero-stretch estimate is on M16 p. 8 and Fig. 6 is on p. 7. Material, rod geometry and concurrent flow match p. 1. Pressure not stated in the paper, so a blank field is correct. |
| M16-BASS2-STABLE | CONFIRMED | 13.6% O2 "minimum concentration needed to get stable flames in BASS-II" is on M16 p. 8. M16 cites BASS-II ref. [12] for it, so it is secondhand; see Finding 3. |

No row was found to be MISMATCH. No row is CANNOT-CHECK.

## Sources opened

| Key | Source actually opened | Notes |
|---|---|---|
| M25 | NASA Task Book, *Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres*, PI C. Fernandez-Pello, **FY 2025** (Task Last Updated 02/17/2025), 3-page PDF: <https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A4E891655E49E9A6A0353DF3D9B4DE14> | Same text is in the FY2025 section of the HTML task page: <https://taskbook.nasaprs.com/tbp/index.cfm?action=public_query_taskbook_content&TASKID=15DD0E09BD99042CCB3B52BBA64ED2D7>. Page numbers below come from the PDF's "Page N of 3" footers. |
| M26 | Same project, FY 2026 PDF: <https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=15DD0E09BD99042CCB3B52BBA64ED2D7> | Used only to check whether a numeric LOC-FR exists. None does: the text contains no oxygen percentages. |
| M16 | Marcum, Olson, Ferkul, *Correlation of normal gravity mixed convection blowoff limits with microgravity forced flow blowoff limits*, 2016 Spring Technical Meeting, Central States Section of the Combustion Institute: <https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf> | Read the full PDF text. Page numbers are the printed page numbers, which equal the PDF page numbers. |

## Field-by-field checks

### M25-FS-G: LOC-FS, Earth gravity

| Field | Row value | Source says | Locator | Check |
|---|---|---|---|---|
| material | PMMA, black | "cylindrical black poly(methyl methacrylate) (PMMA) samples" | M25 FY2025 PDF p. 2, Task Progress item 1 | CONFIRMED |
| form / thickness_mm | rod / 12.7 | "For the rods of 12.7 mm diameter" (`thickness_mm` holds the diameter for rods, per `research/evidence-spec.md` row 3) | p. 3, Task Progress | CONFIRMED |
| flow_direction | opposed | "a flame starts spreading along the solid fuel surface against the opposed forced gas flow"; in normal gravity "the opposed flow is a mixed forced and buoyant flow" | p. 2, Task Progress | CONFIRMED |
| flow_speed_cm_s | blank | FY2025 says only that the gas "flows at low velocity through the length of the duct" (p. 2, Methods/techniques). No speed is given for this pair. | p. 2 | CONFIRMED blank (unverified in FY2025; see Finding 4) |
| o2_pct / value | 18.8 / 18.8 | "the LOC-FS is approximately 18.8% in normal gravity" | p. 3, Task Progress | CONFIRMED |
| value_qualifier | approximately | "approximately" | p. 3 | CONFIRMED |
| pressure_kpa | 100 | "at a chamber pressure of 100 kPa" | p. 3 | CONFIRMED |
| gravity / facility | 1g / ground | "normal gravity", tested "in a similar chamber in normal gravity" | pp. 2–3 | CONFIRMED |
| endpoint | LOC-FS | "Limiting Oxygen Concentration (Volume Fraction) for Flame Spread (LOC-FS)" | p. 3 | CONFIRMED |
| uncertainty | not stated | The report gives no uncertainty, replicate count or error bars. The only oxygen percentages in the PDF are 18.8 and 16.2. | whole PDF (3 pp.) | CONFIRMED |
| external_heat_flux_kw_m2 | blank | The apparatus has radiant heaters (p. 2, Methods/techniques), but the report does not say whether they were on for this pair, or at what flux. | p. 2 | CONFIRMED blank (unverified) |
| run_id | blank in research CSV; U+2014 em dash in `data/evidence.csv` | No run ID is given. | none | CONFIRMED absent (see Finding 2) |
| source_locator | p. 3 numeric; p. 2 material/facility | The numeric sentence is on p. 3; black PMMA and ISS CIR/ground chamber are on p. 2. | FY2025 PDF | CONFIRMED |
| source_url | `tbpdf.cfm?id=16225` | Does not resolve; see Finding 1. | n/a | not a field in this checklist; flagged |

### M25-FS-M: LOC-FS, microgravity

The fields match M25-FS-G except for the ones below.

| Field | Row value | Source says | Locator | Check |
|---|---|---|---|---|
| o2_pct / value | 16.2 / 16.2 | "while it is ~16.2% in microgravity at a chamber pressure of 100 kPa" | p. 3, Task Progress | CONFIRMED |
| value_qualifier | approximately | "~" | p. 3 | CONFIRMED |
| gravity / facility | 0g / ISS | "sealed combustion chamber on the Combustion Integrated Rack (CIR) of the International Space Station (ISS)". The source says "microgravity", not exactly zero; the row notes say so. | p. 2 | CONFIRMED |
| flow_direction | opposed | "In microgravity (µg), the gas flow is forced" and the flame spreads against it | p. 2 | CONFIRMED |

### M25-FR-G and M25-FR-M: LOC-FR, no numeric value

| Field | Row value | Source says | Locator | Check |
|---|---|---|---|---|
| endpoint | LOC-FR | "Limiting Oxygen Concentration (Volume Fraction) for Fuel Regression (LOC-FR)"; "the LOC-FR is significantly lower than the LOC-FS" | p. 3, Task Progress; also p. 2 (definition "another at lower oxygen concentration at which the regressing flame extinguishes (LOC-FR)") | CONFIRMED |
| value | blank, "not found in the sources reviewed" | No numeric LOC-FR in the FY2025 PDF (only percentages are 18.8 and 16.2, p. 3). No numeric LOC-FR in the FY2026 PDF (no oxygen percentages at all). | M25 pp. 1–3; M26 pp. 1–4 | CONFIRMED blank |
| material / form / flow_direction | PMMA, black / rod / opposed | as for the LOC-FS rows | p. 2 | CONFIRMED |
| thickness, o2_pct, pressure | blank | Not stated for any individual FR measurement. Keeping these blank (not copying the FS pair's conditions) matches the source. | p. 3 | CONFIRMED blank |
| gravity / facility | 1g ground (FR-G); 0g ISS (FR-M) | Both regimes are described ("both in 1-g and µg") | pp. 2–3 | CONFIRMED |
| source_locator | pp. 2–3 | as above | FY2025 PDF | CONFIRMED |

### M16-INTERCEPT: zero-stretch extrapolation

| Field | Row value | Source says | Locator | Check |
|---|---|---|---|---|
| material | PMMA, cast | "Cast polymethylmethacrylate (PMMA) rods" (Abstract); ground tests used "cast clear PMMA rods" | M16 p. 1 Abstract; p. 2 | CONFIRMED (ground rods were clear; the row does not claim a colour) |
| form | rod | "axisymmetric rod geometry" | p. 1 Abstract | CONFIRMED |
| flow_direction | concurrent | "the same BASS-II concurrent rod geometry, but with the addition of normal gravity buoyant flow" | p. 1 Abstract | CONFIRMED |
| thickness_mm | blank | The value is an extrapolation across rods of radius 0.318–1.905 cm (p. 2), normalized to r0 (Fig. 6, p. 7). It is not tied to one diameter. | pp. 2, 7 | CONFIRMED blank |
| value | 13.4 | "extrapolating the linear blowoff boundary to zero stretch, which estimates that 13.4% O2 is the limiting oxygen concentration" | p. 8, first paragraph | CONFIRMED |
| endpoint / kind | blowoff-limit / author-extrapolation | The paper calls it an estimate from extrapolating the blowoff boundary. It is not a measured limit. | p. 8 | CONFIRMED |
| pressure_kpa | blank | Ambient pressure is not stated. "Pressure" appears only for regulators and system supply pressure (p. 2). | pp. 1–9 | CONFIRMED blank (unverified value) |
| gravity / facility | 0g / ground | Ground data (p. 2) used to estimate the microgravity (BASS-II) boundary (p. 8). The row notes explain the split. | pp. 2, 8 | CONFIRMED |
| uncertainty | not stated | The paper gives no numeric uncertainty for 13.4. It calls the blowoff region "inherently wide due to the stochastic nature" of blowoff. | p. 7 | CONFIRMED |
| source_locator | p. 8 paragraph; Fig. 6 p. 7 | Fig. 6 caption is on p. 7; the 13.4% sentence is on p. 8 | M16 | CONFIRMED |

### M16-BASS2-STABLE: minimum sampled stable-flame oxygen

| Field | Row value | Source says | Locator | Check |
|---|---|---|---|---|
| o2_pct | 13.6 | "the observed 13.6% O2 minimum concentration needed to get stable flames in BASS-II [12]" | M16 p. 8 | CONFIRMED |
| value | blank | The source gives an observation, not a limit value; leaving value blank is an encoding choice, consistent with the row notes | p. 8 | CONFIRMED (no conflict with source) |
| material / form | PMMA, cast / rod | "three different cast PMMA rod sizes [12]" tested on the ISS | p. 1, Introduction | CONFIRMED |
| flow_direction | concurrent | "BASS-II concurrent rod geometry" | p. 1 Abstract | CONFIRMED |
| gravity / facility | 0g / ISS | "International Space Station" | p. 1 | CONFIRMED |
| pressure, thickness, run_id | blank | Not stated for this observation in M16 | pp. 1, 8 | CONFIRMED blank (unverified value) |
| uncertainty | not stated | none given | p. 8 | CONFIRMED |
| source_locator | p. 8 paragraph; Fig. 6 p. 7 | as above | M16 | CONFIRMED |

## Findings for a human

1. **Broken source URL (M25, 4 research rows + 2 `data/evidence.csv` rows).** `https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225` returns HTTP 409 (curl and WebFetch, 2026-11-14), and the HTML route `index.cfm?action=public_query_taskbook_content&TASKID=16225` shows "Invalid Reference!". Numeric IDs no longer resolve; the Task Book now uses hex IDs. The FY2025 report is at <https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A4E891655E49E9A6A0353DF3D9B4DE14>, and its page numbers match the existing locators. The same old URL also appears in `docs/submission-draft.md` line 48 and `docs/verification-checklist.md` line 61. Not edited (not owned by this task).
2. **`run_id` placeholder in `data/evidence.csv`.** For M25-FS-G and M25-FS-M, `run_id` holds a single em dash (U+2014). Other rows use `not provided`, and the research CSV leaves it blank. The source gives no run ID, so the value is correct in meaning. A human may want one consistent placeholder.
3. **M16-BASS2-STABLE is a secondhand citation.** M16 attributes 13.6% O2 to BASS-II ref. [12]: S. L. Olson, P. V. Ferkul, 9th U.S. National Combustion Meeting, Cincinnati, May 17–20, 2015 (M16 p. 9, References). That primary paper was not opened in this review. The 13.6 value is confirmed only as stated in M16.
4. **Flow speed for the M25 pair.** The FY2026 report gives a 10 cm/s upward fan flow for the normal-gravity apparatus (M26 PDF p. 3, Task Progress, description of the Earth-gravity apparatus). FY2025 gives no speed for the 18.8/16.2 pair. Copying 10 cm/s into these rows would be an inference, so the blank field stays and the value is unverified.

## How this was checked

- Downloaded each PDF with `curl` into a scratch directory outside the repo and extracted text with `pdftotext -layout`. Assigned pages with the "Page N of M" footers (Task Book) or printed page numbers (M16).
- Searched the extracted text for every row value (`18.8`, `16.2`, `12.7`, `100 kPa`, `13.4%`, `13.6%`) and for all `NN%` patterns, to confirm that no other oxygen value (for example, a numeric LOC-FR) is present.
- Read the quoted sentences in context to check material, geometry, flow direction, gravity and facility.
