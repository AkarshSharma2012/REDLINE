# NASA lunar-gravity flammability: 2025 evidence extraction

Issue #20. Research only; reviewed 2026-11-14. Draft rows: [lunar-2025-rows.csv](lunar-2025-rows.csv). Source keys below resolve to NASA titles, URLs and page locators. PDF page numbers are one-based.

## Sources and access

| Key | Title and NASA URL | Locators used |
|---|---|---|
| U25 | Urban et al., *Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results*, ICES-2025-392, July 2025. [NTRS record](https://ntrs.nasa.gov/citations/20250002114); [corrected-caption paper](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf) | pp. 5–8 experimental method; Figs. 7–10 p. 8; Figs. 11–12 p. 9; Fig. 13 and compensation method p. 10; Table 2 and conclusion p. 11 |
| US25 | Urban et al., same title, accompanying [NASA presentation](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf), [NTRS record](https://ntrs.nasa.gov/citations/20250006779) | slides/PDF pp. 11–16 methods and data; slide 18 factors; slide 19 conclusions |
| OF12 | Olson and Ferkul, *Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test*, ICES 2012. [NTRS record](https://ntrs.nasa.gov/citations/20130010991); [paper](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf) | pp. 2–4 materials/criteria; Table I and Eq. (1) p. 6; Figs. 6–7 pp. 7–8 |
| F26 | Ferkul, Kralik, Liao and Johnston, *Material Flammability at Lunar and Martian Gravity*, LPSC March 2026. [NTRS record](https://ntrs.nasa.gov/citations/20260001966); [presentation](https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf) | PDF pp. 4–10 FM2 concept/requirements; pp. 20–22 partial-gravity examples. Printed slide labels start at Page 0, so add one for PDF page. |
| FMweb | NASA Glenn, [*Flammability of Materials on the Moon (FM2)*](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/) | Background; Objectives; Approach and Hardware |

All five sources were opened and read in the relevant sections. NASA PDFs were downloaded to temporary storage and text-extracted; U25 pp. 8, 9, 11, US25 pp. 14–16 and OF12 p. 6 were also rendered and visually inspected. Web PDF screenshots failed; local rendering succeeded. F26 failed in the web reader but its NASA download succeeded. The 2011 Ferkul–Olson centrifuge article is identified in OF12 reference 8 and U25 reference 3; its full text was not independently retrieved. Historical lunar values below come from OF12's explicit reproduction, not an assumed reading of that article.

## Facilities, conditions and material identity

The comparison uses **56.5 kPa / 8.2 psia**, concurrent spread and a **5-second extinction** endpoint. WSTF uses a ground upward-flow duct; GRC uses a **5.2-second drop-tower centrifuge**, rotated at **20.4 rpm** for simulated **1/6 g**. WSTF tests include **60, 80, 100, 144 cm/s**; PMMA additionally has **25, 40 cm/s**. The GRC buoyant speed is unknown. These are extinction tests after assisted ignition, not ignition thresholds or the standard burn-length certification test. [U25, pp. 5–8, Figs. 5–6]

At WSTF the specimen is **5.2 × 14.0 cm**. PMMA is **0.8 mm**; P213 is fiberglass tape with acrylic adhesive; cotton is Beefy-T shirt material. Polycarbonate and Nomex Velcro complete the campaign. Other specimen thicknesses, product grades and fabric areal densities were **not found in the sources reviewed**. Nomex fabric must remain separate from the thicker Velcro product. [U25, p. 6; pp. 8–9, Figs. 7–12 and discussion]

WSTF's limiting point requires five consecutive extinguishments; GRC normally requires four below a surviving-flame condition, with a one-percentage-point oxygen separation described in the method. Ignition orientations and conditioning differ. [U25, pp. 6–9] **Inference:** the nominal oxygen step and short observation period prevent treating a visually precise graph ordinate as an exact physical threshold.

## Per-material measured reference versus terrestrial extrapolation

All oxygen entries below are **mole/volume percent**, not partial pressure. The first numeric column is the graph's simulated-lunar reference, not a measurement on the Moon. The next columns are **our digitization and extrapolation of the displayed WSTF fit**, not published table entries. Zero and 35 cm/s are comparison coordinates, not measured lunar velocities. [U25, pp. 8–10; US25, slides 14–16]

| Material / endpoint | Simulated-lunar reference, % O2 | WSTF fit at zero flow, % O2 | WSTF fit at 35 cm/s, % O2 | Paper figure; presentation |
|---|---:|---:|---:|---|
| PMMA sheet, flaming | ~13.5 | ~13.6 | ~14.7 | U25 Fig. 7 p. 8; US25 slide 14 left |
| P213 tape, flaming | ~13.0 | ~15.7 | ~16.3 | U25 Fig. 8 p. 8; US25 slide 14 right |
| Cotton Beefy-T, flaming | ~11.0 | ~8.5 | ~9.7 | U25 Fig. 9 p. 8; US25 slide 15 left |
| Cotton Beefy-T, smolder extinction | ~11.0 | ~8.5 | ~9.7 | U25 Fig. 10 p. 8; US25 slide 15 right |
| Polycarbonate, flaming | ~21.0 | ~17.6 | ~19.0 | U25 Fig. 11 p. 9; US25 slide 16 left |
| Nomex Velcro, flaming | ~24.0 | ~21.1 | ~21.1 | U25 Fig. 12 p. 9; US25 slide 16 right |

### Extraction method and uncertainty — editorial estimates

Digitization used US25's vector graphics, cross-checked against U25's rendered figures. Axis ticks calibrate each panel separately; read the blue horizontal reference and the black straight fit. Convert mole fraction to percent by multiplying by 100. Extend the displayed fit as `oxygen_pct(v) = b + 100*m*v`; this is our mathematical extrapolation, not an additional experiment.

Reproduction anchors: the black fit endpoints are at 60 and 144 cm/s except polycarbonate, whose displayed line ends at 140 cm/s. Vector-derived slopes, rounded in mole-fraction units per cm/s, are PMMA 0.00029545; P213 0.00017355; cotton flaming 0.00033419; cotton smolder 0.00033418; polycarbonate 0.00040233; Velcro 0.0000157. Intercepts before report rounding are 13.62, 15.74, 8.55, 8.55, 17.63 and 21.05 percent. [Digitization/inference from US25 slides 14–16, corresponding U25 Figs. 7–12]

Assign **±0.5 percentage point** to each blue-reference read and **±1.0 percentage point** to each extrapolated ordinate. These are conservative editorial reading/extrapolation allowances, not instrument uncertainty, replicate scatter or confidence intervals. They do not resolve source inconsistencies. CSV values are rounded to one decimal; no digitized burn/fail points or run IDs are invented.

### Source discrepancy requiring review

U25 p. 9 describes PMMA, P213 and flaming cotton lunar limits as below the terrestrial extrapolation. However, the rendered cotton flaming and smolder panels show essentially the same fit and reference; their zero-flow extrapolations are below the lunar reference. PMMA's zero-flow difference is unresolved at our extraction allowance. US25 reproduces these plots. **Inference:** the figures do not independently establish every directional claim in the discussion. Do not repair the plots, relabel the endpoints, or turn these discrepancies into cabin safety classifications.

The plotted PMMA, P213 and cotton-flaming slopes also differ from the best-fit slopes in Table 2 by more than graph-reading precision. Polycarbonate, Velcro and cotton-smolder agree approximately. **Inference:** keep table factors separate from plot-derived limits; do not combine Table 2 slopes with these digitized intercepts. All 2025 CSV rows are held for scientific review, even where transcription is verified.

## Table values: compensation factors, not measured lunar limits

These are transcribed, **not digitized**. The last column is the source's rounded estimate using the conservative slope over a 35-to-zero cm/s interval; its unit is **oxygen percentage points**, not percent relative change. The one-tailed slope bound is not an error bar on the lunar reference. [U25, p. 10 §III.A; Table 2 p. 11; US25 slide 18]

| Material / endpoint | Best-fit slope, s/cm | Conservative 95% slope, s/cm | Reported delta, pp O2 |
|---|---:|---:|---:|
| PMMA | 0.00022 | 0.00056 | 1.9 |
| Polycarbonate | 0.00040 | 0.00065 | 2.3 |
| Nomex Velcro | 0.000016 | 0.000090 | 0.32 |
| P213 | 0.00030 | 0.00040 | 1.4 |
| Cotton flaming | 0.00017 | 0.00023 | 0.82 |
| Cotton smolder | 0.00034 | 0.00050 | 1.8 |

**Inference / arithmetic check:** `100 × 35 × upper_slope` gives 1.96, 2.275, 0.315, 1.4, 0.805 and 1.75 pp respectively from the printed rounded slopes. Preserve the source's reported deltas; do not silently replace them with recomputed rounding. Table 1 p. 9 contains model material properties, not experimental oxygen limits.

## Nomex fabric and earlier partial-gravity evidence

OF12 Table I p. 6 directly tabulates Nomex HT90-40 fabric at **14.7 psia**, thickness **12 mil** (p. 3). These are not Velcro results and not 2025 extrapolations.

| Gravity / facility | Maximum extinguishing O2, % | Sustaining / ULOI O2, % | Provenance |
|---|---:|---:|---|
| 1 g, WSTF | 22.1 MOC | 23.5 ULOI | OF12 Table I p. 6 |
| Simulated lunar, GRC centrifuge | 19.9 MOC* | 21.0 ULOI* | OF12 Table I p. 6 |
| Microgravity, 30 cm/s concurrent flow | 22.0 MOC* | 23.0 ULOI* | OF12 Table I p. 6; flow p. 4 |

Asterisked low-gravity endpoints use extinction/survival during the drop; 1 g uses modified Test 1 criteria. Table I's lunar margin is **−2.35 pp**, defined using midpoint limits in Eq. (1), not subtracting just the two ULOIs. [OF12 pp. 2, 4, 6] **Inference:** the lunar Nomex fabric pair lies below both displayed endpoint-gravity pairs; a 0 g-to-1 g interpolation is not a verified universal bound. Do not substitute these fabric numbers for 2025 Velcro.

## FM2 context and limits on REDLINE claims

NASA describes FM2 as a planned bridge between terrestrial screening and on-Moon behavior; its objectives are prospective, not a table of completed lunar-surface burn results. [FMweb, Background/Objectives] F26's current concept specifies four refreshed-atmosphere burns of one fabric, Synergy Pro Navy, at 8.2 psia, initially 37/33/29/25% O2. Those are planned starting conditions, not extinction measurements. [F26 PDF pp. 5, 6, 9–10] Do not merge them into the CSV as measured limits.

F26 also reports short-duration PMMA centrifuge evidence and SIBAL aircraft/drop-tower comparisons. [F26 PDF pp. 20–22] These support distinguishing ground simulation from lunar-surface evidence; they do not validate arbitrary cabin materials or geometries.

**Inference / implementation handoff:** retain measured simulated-gravity evidence as such. For actual lunar-habitat behavior, show estimates and explicit coverage gaps; do not assert that a material will burn on the Moon. The root AGENTS.md and issue #18 spec's blanket 0 g/1 g bounding assumption needs scientific review against OF12 before any safety labeling. No app rules or other agents' files were changed. For missing combinations use **not found in the sources reviewed**.

## Cross-branch review and CSV contract

Read with `git show` from fetched branches: issue #18 `research/evidence-spec.md` supplied the base columns; issue #19 `research/bass2-rows.csv` supplied a provenance example; issue #22 `research/nasa-context.md` supplied NASA source leads, rechecked above. No existing Urban-2025 extraction was found in those reviewed files. Other agents' files were not copied or edited, including their handoffs.

CSV contains one row per extracted result: six simulated references, twelve plot extrapolations (zero and 35 cm/s), six tabulated factors, and six historical Nomex fabric endpoints. Custom endpoints preserve the 5-second and smolder distinctions; they are draft vocabulary, not changes to issue #18's schema. Blank numeric cells mean unknown/not applicable, never zero. `flow_speed_cm_s` is blank for unknown buoyancy; `comparison_velocity_cm_s` carries extrapolation coordinates. `gravity_context` distinguishes simulated gravity and mathematical fit coordinates. `uncertainty` separates editorial allowances from source-reported bounds. Source titles, URLs and locators travel with each row. Rows are research inputs, not cabin clearance or certification.
