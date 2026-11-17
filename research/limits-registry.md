# Flammability limits registry (LOC and related limits)

Issue #124. Data: [`limits-registry.csv`](limits-registry.csv) (88 rows, one published value per row).

These are values **published in NASA sources**, tied to the conditions they were measured at (material, gravity, pressure, flow, method). A value here means "close to a measured limit at these conditions". It is not a rating for any other condition.

## Method classes: only two rows are true LOC-FS, two are LOC-FR

The sources use several different limit definitions. They are **not interchangeable**, so `method_class` keeps them apart:

| Class | Meaning | Rows |
|---|---|---|
| `LOC-FS` | O2 at which flame spread stops (MIST, closed chamber, O2 depletion) | 2 |
| `LOC-FR` | O2 at which the regressing flame goes out, below LOC-FS | 2, **value blank: not found in the sources reviewed** |
| MOC (Test 1) | Highest O2 at which the material consistently self-extinguishes under NASA-STD-6001 Test 1 (upward, quiescent, 1 g) | 33 (HWB06) + OF12/TM08 1 g |
| ULOI | O2 at which the material passes Test 1 about half the time | OF12/TM08 1 g |
| MOC\* / ULOI\* | Drop-test versions: highest O2 that went out during the drop / lowest O2 that burned for the whole drop. Criteria differ from 1 g because drop time is short (OF12 p. 6) | OF12, TM08 |
| Simulated-lunar extinction | 1/6 g centrifuge in a drop tower, 5 s extinction | 6 (U25) |
| Flow limits | Flow speed (cm/s) at which a single flame quenched or blew off at a fixed O2 | 7 (SIB15) |
| Estimates | Author extrapolation or secondhand observation, not a bracketed limit | 2 (M16) |

The issue asks for the test method as LOC-FS or LOC-FR. Only MIST reports those endpoints. All other rows say `other: ... (not LOC-FS/LOC-FR)`, so a MOC is never shown as a LOC-FS.

## Sources

| Key | Source | Values used | How checked |
|---|---|---|---|
| HWB06 | Hirsch, Williams, Beeson, *Pressure Effects on Oxygen Concentration Flammability Thresholds of Materials for Aerospace Applications*, J. Testing and Evaluation, 2006. [NTRS PDF](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf) | Table 2 p. 4: MOC for 11 materials at 48.2, 85.3 and 101.3 kPa. Method p. 3, thickness ~1.5 mm p. 2 | Re-read from the PDF text for this task |
| OF12 | Olson, Ferkul, *Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test*, ICES 2012. [NTRS PDF](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf) | Table I p. 6: Mylar G, Ultem 1000, Nomex HT90-40 at 1 g, Martian g, lunar g, 0 g | Re-read from PDF text; also `verify-of12.md`, `rows-olson-partial-g.md` |
| TM08 | *Microgravity Flame Spread in Exploration Atmospheres: Pressure, Oxygen, and Velocity Effects on Opposed and Concurrent Flame Spread*, NASA/TM-2008-215260. [NTRS PDF](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf) | Table 1, printed p. 3 (PDF p. 7): same three materials, 1 g and 0 g at 30 cm/s | Re-read from the PDF text for this task |
| M25 | *Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres*, NASA Task Book FY2025. [Task Book PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225) | p. 3: LOC-FS about 18.8% (1 g) and about 16.2% (microgravity), 12.7 mm black PMMA rod, 100 kPa | `verify-pmma.md` (CONFIRMED). Not re-fetched: this URL returns HTTP 409 to scripts (`verify-other.md`) |
| M16 | Marcum, Olson, Ferkul, *Correlation of normal gravity mixed convection blowoff limits with microgravity forced flow blowoff limits*, 2016. [NTRS PDF](https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf) | p. 8: 13.4% (extrapolated estimate), 13.6% (lowest stable BASS-II flame, cited secondhand) | `verify-pmma.md` (CONFIRMED) |
| U25 | Urban et al., *Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results*, ICES-2025-392. [Paper](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf), [slides](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf) | Figs. 7-12 pp. 8-9: simulated-lunar reference values at 56.5 kPa | `verify-us25.md` (values CONFIRMED) |
| SIB15 | *Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity* (BASS/BASS-II SIBAL). [NTRS PDF](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) | Appendix p. 9: tests marked "Quenched" or "Blow-off" | Re-read from the PDF text for this task |

The PSI Data Repository is the primary NASA dataset for this project. BASS-II, the ISS SIBAL tests and MIST are PSI investigations. HWB06, OF12, TM08 and U25 are ground or drop-tower NASA work, cited through NTRS.

## Things to know before using these values

1. **The two sources disagree on 1 g values for the same materials.** For Nomex HT90-40, OF12 gives 1 g ULOI 23.5 and MOC 22.1, while TM08 gives 25.4 (±0.6) and 22. For Ultem 1000, OF12 gives 23.5 and 23.0, while TM08 gives 26.5 and 24. For Mylar G, OF12 gives 21.2 and 20.0, while TM08 gives 20.8 and 20. Both are listed and neither is preferred. TM08 marks its 1 g values as WSTF data (ref. 8), so they are secondhand. The 0 g values agree between the two sources.
2. **The lunar values are estimates between the 0 g and 1 g results, not lunar measurements.** OF12 and U25 simulate lunar g with a centrifuge in a drop tower. U25 notes a strong gravity gradient (p. 7). `gravity_g = 0.16` is the project mapping of "1/6 g" (`docs/specs/review.md`).
3. **The OF12 Nomex values are not monotonic with gravity.** As printed, lunar ULOI\* is 21.0 and Martian ULOI\* is 19.9. They are transcribed as printed and are not "corrected".
4. **Pressures differ by source:** 70.3 kPa (10.2 psia), 101.3 kPa, 100 kPa, 56.5 kPa, and 48.2/85.3/101.3 kPa. Compare values only at matching pressure.
5. **The U25 values were read from plotted reference lines.** The earlier extraction (`lunar-2025.md`) gives a ±0.5 percentage-point reading allowance. Its zero-flow and 35 cm/s fit extrapolations are *our* calculations, not published values, so they are **excluded** here. The U25 compensation factors are excluded for the same reason.
6. **The SIB15 rows are single tests** at a fixed O2 with changing flow. They are not bracketed limits, and the value unit is cm/s, not % O2.
7. **The 1 g MOC/ULOI values are quiescent upward Test 1 results.** Low-g drop-test values use a different criterion, so the difference between them (the "ΔO2 margin" in OF12/TM08) depends on the method as well as on gravity.

## Unverified / not found

- **LOC-FR numbers (MIST): not found in the sources reviewed.** M25 defines LOC-FR and says it is "significantly lower" than LOC-FS, but prints no number. The FY2026 report was also checked (`verify-pmma.md`). The journal papers linked in `pmma-endpoints.md` (L24, L26, R26) could not be accessed, so any values in them are **unverified** and left out.
- **M25 flow speed, uncertainty and replicate count:** not stated, left blank.
- **M16 pressure:** not stated, left blank.
- **U25 thickness for P-213 tape, cotton, polycarbonate and Nomex Velcro:** not stated, left blank.
- **NASA-STD-6001B threshold tables, and Saffire, FLEX and ACME limit values,** are covered by other issues (#120 and the extraction tasks). They are not repeated here unless they were already present as a verified limit value.

## CSV columns

`limit_id`, `material`, `material_detail`, `thickness_mm`, `gravity_g`, `gravity_label` (as stated by the source), `pressure_kpa`, `pressure_as_published`, `flow_speed_cm_s` (blank = not stated or buoyant only; 0 = no imposed flow), `flow_direction`, `method_class` (`LOC-FS`, `LOC-FR` or `other: ...`), `limit_type` (the source's own term), `value`, `value_unit`, `value_qualifier`, `test_method`, `facility`, `source_key`, `source_title`, `source_url`, `source_locator` (page/table/figure/row), `check` (how this row was verified), `caveat`. A blank cell means unknown, never zero.
