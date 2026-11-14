# PMMA endpoints and the Marcum counter-example

Issue #21; research only; reviewed 2026-11-14. Draft evidence: [pmma-rows.csv](pmma-rows.csv). Source keys resolve to titles, URLs and locators below. PDF pages are one-based. Unknown numeric fields are blank, not zero.

## What the accessible evidence establishes

A flame can stop advancing while the already heated material continues burning. LOC-FS marks cessation of spread; LOC-FR marks extinction of that remaining regression flame. NASA's MIST report describes oxygen depletion in a closed chamber at controlled pressure and reports LOC-FR below LOC-FS. [M25, pp. 2–3, experimental description and Task Progress]

| Reported result | Oxygen, volume % | Conditions and status | Exact source |
|---|---:|---|---|
| LOC-FS, Earth gravity | approximately 18.8 | Black PMMA rod; diameter 12.7 mm; 100 kPa; ground | M25, p. 3, Task Progress paragraph beginning “The results of the tests” |
| LOC-FS, microgravity | approximately 16.2 | Same reported diameter and pressure; ISS | M25, p. 3, same paragraph; facility/material p. 2 |
| LOC-FR, Earth gravity | not found in the sources reviewed | Separate endpoint described; no numerical value in the accessible report | M25, p. 3, paragraph following the numeric LOC-FS comparison |
| LOC-FR, microgravity | not found in the sources reviewed | Lower endpoint described; no numerical value in the accessible report | M25, pp. 2–3, experimental description and Task Progress |

**Inference:** the difference between the reported LOC-FS values is about 2.6 oxygen percentage points. This subtraction is not a universal safety factor. The report does not give uncertainty, replicate counts or run IDs for this pair; do not turn its approximate values into exact thresholds. [M25, p. 3, numeric comparison]

The newer report describes cast black rods, a nominal forced flow of 10 cm/s, and pressures from 40 to 100 kPa in ground and SoFIE/MIST ISS apparatus. It again separates spread cessation from final extinction. It provides no numerical LOC-FR table in the reviewed text. [M26, pp. 2–3, Experimental Apparatus and methodology; Experimental results]

**Inference / provenance decision:** the M25 numeric pair stays linked to M25. The M26 apparatus description does not establish the exact run settings of the earlier pair. Therefore CSV flow speed and external heat flux remain blank. A blank heat-flux field must not be interpreted as no heating.

## Recent publication and access inventory

These are publication leads, not permission to invent values from inaccessible tables. “Accessible” distinguishes readable NASA prose from search-index previews and a retrieved full paper.

| Study / source | Access verified this review | Numerical extraction permitted here |
|---|---|---|
| M25: NASA MIST FY2025 report | Full public NASA PDF text, pp. 2–3 | Only the approximate LOC-FS pair above; no numerical LOC-FR found |
| M26: NASA MIST FY2026 report | Full public NASA PDF text, pp. 2–4 | Endpoint definitions and methods; no numerical FS/FR pair found |
| Liveretou et al., *The limiting oxygen volume fraction for opposed flame spread extinction*, DOI 10.1016/j.proci.2024.105224 | NASA bibliography identifies the article [M25 p. 3]; publisher URL below returned HTTP 403 | No numeric endpoint rows extracted; do not assume its generic LOC is a separately measured FS/FR pair |
| Liveretou et al., *Flame extinction of thermally thick PMMA in Earth gravity versus microgravity: A comparison of Earth and on-orbit space experiments*, DOI 10.1016/j.firesaf.2025.104625 | NASA lists Fire Safety Journal 160, 104625, May 2026 [M26 p. 4]; publisher full text unavailable to this review | No numerical values extracted; DOI year and NASA publication listing differ, so preserve both rather than infer the publication year from the DOI |
| Rivera et al., *Opposed flame spread limit over PMMA rods in normal and micro gravity*, DOI 10.1016/j.firesaf.2026.104719 | Title listed in NASA bibliography [M26 p. 4]; publisher search preview identifies separate limits; direct page retrieval returned HTTP 403 | No numerical FS/FR pairs extracted from preview; figures/tables not reviewed |
| *Gravity and thickness effects on the path from ignition to extinction in opposed flame spread over PMMA Rods*, publisher PII S1540748926004566 | Publisher search preview only; direct page returned HTTP 403; full paper not reviewed | No numerical rows or claimed table contents |
| Thomsen et al., *Extinction of Opposed Flame Spread and Regression Burning of Thick Solid Fuels*, ICES-2025-323, DOI 10.32865/2346/102744 | Official ICES program lists title/authors, technical session entry ICES-2025-323; DOI returned HTTP 403 | No numerical endpoints extracted; model contents not assumed |

**Access limitation:** numerical LOC-FR values may exist in the journal bodies or supplements. They were **not found in the sources reviewed**, which is a retrieval boundary, not a claim about whether they were measured or published.

### A conflict that must remain visible

M26 p. 3 says the limits decrease with reduced pressure. The publisher abstract preview of the 2026 Rivera paper says LOC decreases with ambient pressure (the opposite directional reading), and its highlight says decreasing pressure raises LOC. M26 p. 3 also contains both increasing and decreasing descriptions of time to reach the limits. **Inference:** do not encode a pressure correction or time-to-extinction rule from these summaries. This review cannot resolve those discrepancies without the complete journal results. They do not change the explicitly reported M25 pair at one pressure. [M26 p. 3, Experimental results and Summary; R26, Abstract/Highlights, preview only]

## Marcum: what actually transferred

The ground experiment retained the BASS-II concurrent, axisymmetric PMMA rod/stagnation configuration; buoyant flow was added by Earth gravity. The NASA follow-on abstract reports favorable blowoff agreement after buoyancy and blockage corrections. [M17, abstract; M16, p. 1]

The corrections are explicit:

- Stretch: `a = (3/2) U/r`; thermal-length normalization: `sqrt(r/r0)`.
- Blockage: `B = A_tube/(A_tube - A_rod)`; adjusted forced stretch: `a0 = a B sqrt(r/r0)`.
- Add empirical buoyant stretch: `a_total = a0 + 78 s^-1`; `r0 = 0.318 cm`.

The corrected ground points collapse and align with the flight blowoff branch. The zero-stretch extrapolation is **13.4% O2**, versus a **13.6% O2** minimum sampled stable-flame condition in BASS-II. These are an estimate and an observation, respectively. The fit used the flight boundary to choose the shift; the authors explicitly require further validation for other materials. Ground 14% data were discarded after an entrainment check. [M16, pp. 3, 6–9; Figs. 4–6; Table 1]

**Inference:** this is evidence of a useful calibrated correlation, not independent prediction of an unknown flight boundary. Agreement is reported qualitatively; no numerical agreement tolerance is supplied in the cited comparison. It supports neither arbitrary PMMA geometries nor a universal Earth-to-space offset. The extrapolated intercept is not a measured LOC-FS or LOC-FR. [M16, pp. 7–9; M17, abstract]

For related work, the earlier NASA flight abstract describes both blowoff and low-flow quenching, with flow deliberately raised for blowoff tests. [B15, abstract] **Inference:** matching only the high-flow extinction mechanism cannot certify the entire low-flow boundary. Do not combine BASS-II concurrent rods with MIST opposed black rods as one interchangeable material limit.

## Plain-language transfer rules for REDLINE

**Synthesis / inferences from M16 pp. 6–9, B15 abstract and M25 pp. 2–3:**

1. Earth data can help when the fuel, shape, flow direction and extinction event match, and a physically motivated correction has been checked against low-gravity tests. Marcum is a specific successful example.
2. An ordinary ground oxygen limit cannot automatically answer the same question in microgravity: buoyant airflow changes the conditions at the flame. MIST's matched-diameter LOC-FS pair illustrates a lower flight spread limit.
3. “Stopped spreading” does not mean “stopped burning.” Keep FS and FR separate in every comparison and label.
4. Do not transfer a fitted blowoff curve into the quenching regime, another pressure, a sheet, a different heating condition or lunar gravity without evidence covering that change.
5. For unrepresented conditions use **not found in the sources reviewed**. No lunar material classification is produced here. Any future lunar estimate must be labeled as an estimate; a bounding/interpolation method requires separate scientific review.

## Draft CSV contract and cross-branch review

The first 17 columns follow issue #18's fetched `research/evidence-spec.md`; additions carry row identity, source title/URL, approach, provenance and exclusion status. Six draft rows comprise two approximate LOC-FS observations, two explicitly missing LOC-FR records, one author extrapolation and one minimum sampled stable-flame condition. Only the two LOC-FS observation rows contain numerical measured oxygen-limit values. Missing-value records are not tests with a zero result. The extrapolation is excluded from measured-limit ingestion; the stable-flame observation is not an exact minimum LOC.

Read with `git show`, without modifying other branches:

- `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md`: schema and endpoint separation.
- `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft:research/bass2-rows.csv`: provenance format; no run rows copied.
- `origin/task/20-r3-nasa-2025-lunar-gravity-flammability:research/lunar-2025.md`: distinct partial-gravity evidence and warnings about universal bounding. Its sheet results are outside this rod endpoint extraction.

No earlier PMMA deliverable or misplaced handoff existed on the current branch. Other branches' handoffs were left untouched.

## Source register

| Key | Title and URL | Reviewed locator / access |
|---|---|---|
| M25 | NASA Task Book, *Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres*, FY2025, PI Carlos Fernandez-Pello. [NASA PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225) | pp. 2–3; p. 3 Task Progress numeric paragraph; bibliography. Report fiscal year is distinct from generated date. |
| M26 | NASA Task Book, same project, FY2026. [NASA PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=15DD0E09BD99042CCB3B52BBA64ED2D7) | pp. 2–4; apparatus, experimental results, bibliography |
| M16 | J. W. Marcum, S. L. Olson, P. V. Ferkul, *Correlation of normal gravity mixed convection blowoff limits with microgravity forced flow blowoff limits*, Central States Section of the Combustion Institute, 2016. [NASA NTRS full paper](https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf) | pp. 1, 3, 6–9; Figs. 4–6; Table 1. Full PDF text read; screenshot service failed, so no graph digitization. |
| M17 | J. W. Marcum, P. V. Ferkul, S. L. Olson, *Mixed Convection Blowoff Limits as a Function of Oxygen Concentration and Upward Forced Stretch Rate for Burning Pmma Rods of Various Sizes*, 2017. [NASA NTRS record](https://ntrs.nasa.gov/citations/20170006615) | Abstract; linked PDF returned HTTP 403. No full-paper content inferred. |
| B15 | S. L. Olson, P. V. Ferkul, *Microgravity Flammability of PMMA Rods in Concurrent Flow*, 2015. [NASA NTRS record](https://ntrs.nasa.gov/citations/20150008961) | Abstract |
| L24 | *The limiting oxygen volume fraction for opposed flame spread extinction*. [Publisher](https://www.sciencedirect.com/science/article/pii/S1540748924000348) | Article identity corroborated by M25 p. 3; direct access failed |
| L26 | *Flame extinction of thermally thick PMMA in Earth gravity versus microgravity: A comparison of Earth and on-orbit space experiments*. [Publisher](https://www.sciencedirect.com/science/article/abs/pii/S0379711225002899) | Article identity corroborated by M26 p. 4; direct access failed |
| R26 | *Opposed flame spread limit over PMMA rods in normal and micro gravity*. [Publisher](https://www.sciencedirect.com/science/article/pii/S0379711226000871) | Abstract/Highlights search preview only; title corroborated by M26 p. 4; direct access failed |
| G26 | *Gravity and thickness effects on the path from ignition to extinction in opposed flame spread over PMMA Rods*. [Publisher](https://www.sciencedirect.com/science/article/pii/S1540748926004566) | Title and Introduction/Conclusions preview only; direct access failed; not a numerical source |
| T25 | *Extinction of Opposed Flame Spread and Regression Burning of Thick Solid Fuels*. [Official ICES 2025 program](https://ices.space/wp-content/uploads/2025/07/ICES_2025_program_final_WEB_spreads_minus-PR-back-page.pdf); [DOI](https://doi.org/10.32865/2346/102744) | PDF p. 21, technical-session entry ICES-2025-323; full-paper DOI access failed |
