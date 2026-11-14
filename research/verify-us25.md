# Verification of US25 evidence rows against the NASA source (issue #102)

Audit date: 2026-11-14. Scope: the six rows in `data/evidence.csv` / `data/evidence.json` with `source_key = US25` (U25-01-L to U25-06-L). This is a read-only audit. No data file, `review_status` or code was changed; a human decides what to do with these findings.

## Verdicts (one line per evidence_id)

- **U25-01-L** (PMMA 0.8 mm, flaming): **MISMATCH (gravity_g only).** Value 13.5 % O2 CONFIRMED (blue reference = 0.1350 mole fraction, [S] slide 14 left; same line in [P] Fig. 7 p. 8). Thickness 0.8 mm, 56.5 kPa, concurrent flow, drop tower, 5 s extinction, pass criterion and locators CONFIRMED. Source states the gravity as "1/6 g" ([P] p. 7), not 0.16 g. Form `sheet` CANNOT-CHECK: source only says "0.8 mm PMMA Sample".
- **U25-02-L** (P-213 tape, flaming): **MISMATCH (gravity_g only).** Value 13 % O2 CONFIRMED (0.1300, [S] slide 14 right; [P] Fig. 8 p. 8). Material/form, 56.5 kPa, flow direction, facility, endpoint, pass criterion and locators CONFIRMED. Source states "1/6 g" ([P] p. 7).
- **U25-03-L** (Cotton Beefy-T, gas-phase flame limit): **MISMATCH (gravity_g only).** Value 11 % O2 CONFIRMED (0.1100, [S] slide 15 left; [P] Fig. 9 p. 8). Material/form, 56.5 kPa, flow direction, facility, endpoint, pass criterion and locators CONFIRMED. Source states "1/6 g" ([P] p. 7).
- **U25-04-L** (Cotton Beefy-T, smolder limit): **MISMATCH (gravity_g only).** Value 11 % O2 CONFIRMED (0.1100, [S] slide 15 right, "Smolder limit"; [P] Fig. 10 p. 8). Material/form, 56.5 kPa, flow direction, facility, pass criterion and locators CONFIRMED. Source states "1/6 g" ([P] p. 7). Note: `endpoint` = `extinction-5s` is the same as the flaming row; the smolder distinction is kept only in `endpoint_source` = `smolder-extinction-5s` (matches source).
- **U25-05-L** (Polycarbonate, flaming): **MISMATCH (gravity_g only).** Value 21 % O2 CONFIRMED (0.2100, [S] slide 16 left; [P] Fig. 11 p. 9). 56.5 kPa, flow direction, facility, endpoint, pass criterion and locators CONFIRMED. Source states "1/6 g" ([P] p. 7). Form `sheet` CANNOT-CHECK: source only says "Polycarbonate"; no form or thickness found in the sources reviewed (unverified).
- **U25-06-L** (Nomex Velcro, flaming): **MISMATCH (gravity_g only).** Value 24 % O2 CONFIRMED (0.2400, [S] slide 16 right; [P] Fig. 12 p. 9). Material, form `other`, 56.5 kPa, flow direction, facility, endpoint, pass criterion and locators CONFIRMED. Source states "1/6 g" ([P] p. 7). Slide/caption text says "8.2 psi" (not "psia"); [P] p. 6 gives all testing at 56.5 kPa (8.2 psia).

**Summary:** all six numeric values (`value`, `o2_pct`) match the source. The only field that differs from the source in every row is `gravity_g`: the source says **1/6 g** (≈ 0.167 g), the rows hold **0.16**. This 0.16 is the project mapping set in `docs/specs/review.md` ("Map `1/6 g` → `gravity_g: 0.16`") and S1, and the rows keep `gravity_source = 1/6 g`. It is reported as a MISMATCH because the task asks for strict agreement with the source; whether to keep the convention is a human call. Two `form` values (`sheet` for PMMA and polycarbonate) are not stated in the sources reviewed.

## Sources opened

- **[S]** Urban et al., *Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results*, ICES-2025-392 presentation (source_key US25). NTRS record https://ntrs.nasa.gov/citations/20250006779 ; PDF https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf (20 PDF pages; slide number = PDF page).
- **[P]** Same authors and title, ICES-2025-392 paper, corrected captions (the paper the rows cite as "paper Fig. N p. N" and as `condition_source_url`). NTRS record https://ntrs.nasa.gov/citations/20250002114 ; PDF https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf (12 PDF pages; page numbers = printed page numbers).

Both PDFs were downloaded directly from NTRS on 2026-11-14 and read in full in the relevant sections (text extraction plus visual rendering of [S] slides 14–16 and [P] pp. 8–9).

## Field-by-field evidence

| Field (row value) | What the source says | Locator | Verdict |
|---|---|---|---|
| `value` / `o2_pct` | Blue "GRC Centrifuge Limit (reference)" lines, y-axis "Ambient Oxygen Mole Fraction". Vector read: PMMA 0.1350, P-213 0.1300, cotton flame 0.1100, cotton smolder 0.1100, polycarbonate 0.2100, Nomex Velcro 0.2400 (×100 = % O2) | [S] slides 14–16; same plots [P] Figs. 7–12 pp. 8–9 | CONFIRMED (all six) |
| `value_unit` (% O2) | Axis is O2 mole fraction; % = ×100. Not partial pressure | [S] slides 14–16 axis title | CONFIRMED |
| `material` | "0.8 mm PMMA Sample"; "P-213 Tape sample" (= "fiberglass with an acrylic (PMMA) adhesive", [P] p. 8); "Cotton T-Shirt (Beefy-T)"; "Polycarbonate"; "Nomex Velcro" | [S] slides 14–16 captions; [P] p. 8 §III | CONFIRMED |
| `thickness_mm` (0.8, PMMA only) | "0.8 mm PMMA Sample" | [S] slide 14 left; [P] Fig. 7 p. 8 | CONFIRMED. Other rows blank: no thickness stated in sources reviewed |
| `form` | tape / T-shirt fabric stated; "sheet" not stated for PMMA or polycarbonate; Velcro = `other` is consistent | [S] slides 14–16 | CONFIRMED for tape, fabric, other; CANNOT-CHECK for `sheet` (unverified) |
| `pressure_kpa` (56.5) / `pressure_psia` (8.2) | "the planned NASA lunar habitat pressure of 56.5 kPa (8.2 psia)"; slide captions "8.2 psia" (Nomex: "8.2 psi") | [P] p. 6; [S] slides 14–16 | CONFIRMED |
| `gravity_g` (0.16) | "spinning to produce a 1/6 g radial acceleration"; strong gravity gradient noted ("Owing to the short radius of rotation, there was a significant gravity gradient") | [P] p. 7 | MISMATCH: source says 1/6 g (≈ 0.167); 0.16 is the project mapping (`docs/specs/review.md`) |
| `facility` (drop-tower) | "centrifuge test facility in the ZGRF 5.2 second drop tower" | [P] p. 7; [S] slide 13 | CONFIRMED |
| `flow_direction` (concurrent) | "the resulting buoyant flow is concurrent with the direction of flame spread" | [P] p. 7 | CONFIRMED |
| `flow_speed_cm_s` (blank) | "the actual velocity (induced by the simulated gravity) is not known"; the horizontal line is placed at low velocities for display only | [P] p. 8 §III | CONFIRMED that the source gives no value; blank is correct |
| `endpoint` (extinction-5s) / `test_duration_s` (5) | "If the sample extinguished in 5 seconds it was a 'pass'"; GRC: "If it extinguished before the end of the drop, it was identified as non-flammable (passed)" in a 5.2 s drop | [S] slide 11; [P] pp. 6–8 | CONFIRMED |
| `pass_criterion` | "Tests were repeated until 4 sequential extinguishments occurred 1% lower in oxygen concentration than a case where it did not extinguish"; "found by multiple passes (usually 4) below the lowest oxygen concentration fail" | [P] p. 8 lines 1–3; [P] p. 9 | CONFIRMED |
| `uncertainty` | No experimental uncertainty for the centrifuge limits found in the sources reviewed; 1 % O2 step confirmed ([P] p. 8). The ±0.5 pp is an editorial plot-read allowance; the vector read differs from the row values by < 0.01 pp | [P] p. 8; [S] slides 14–16 | CONFIRMED (as described: editorial, not a source value) |
| `outcome` (blank) | Source gives a limit line, not a single-run outcome | [S] slides 14–16 | Consistent (nothing to check) |
| `source_locator` | Slide 14 left/right, 15 left/right, 16 left/right; Figs. 7–10 on p. 8, Figs. 11–12 on p. 9 | [S]; [P] | CONFIRMED. Note: `source_url` is the presentation [S], while "paper Fig. N p. N" refers to [P], whose URL is in `condition_source_url` |

## How the values were read (reproducible)

1. Downloaded [S] and rendered slides 14–16 (`pdftoppm -r 110`) for a visual check.
2. Converted each slide to SVG (`pdftocairo -svg`). Each panel has exactly one blue (`rgb(0%,0%,100%)`) dashed line in the plot area (the second blue path is the legend sample). Took its y coordinate in points.
3. Calibrated each panel separately from its own labelled major y-axis tick marks (longest tick paths on the axis), mapped to the printed labels, and interpolated linearly.

| Panel | Blue line y (pt) | Labelled ticks used | Mole fraction | Row value |
|---|---|---|---|---|
| Slide 14 left (PMMA) | 290.55 | 0.10–0.24, 8 ticks | 0.1350 | 13.5 |
| Slide 14 right (P-213) | 296.02 | 0.10–0.24, 8 ticks | 0.1300 | 13 |
| Slide 15 left (cotton flame) | 238.13 | 0.06–0.20, 8 ticks | 0.1100 | 11 |
| Slide 15 right (cotton smolder) | 238.66 | 0.06–0.20, 8 ticks | 0.1100 | 11 |
| Slide 16 left (polycarbonate) | 220.79 | 0.14–0.30, 9 ticks | 0.2100 | 21 |
| Slide 16 right (Nomex Velcro) | 144.98 | 0.18–0.24, 4 ticks | 0.2400 | 24 |

4. Rendered [P] pp. 8–9 and confirmed Figs. 7–12 show the same reference lines at the same levels as [S] slides 14–16.

## Scope notes for the reviewer

- These values are drop-tower centrifuge results at simulated lunar gravity (1/6 g for about 5 s), not measurements on the Moon. They are burned/extinguished-in-testing limits at these conditions only.
- [P] p. 9 says the lunar-g limits for PMMA, P213 and flaming Beefy-T were lower than the WSTF extrapolation and calls this "contrary to expected behavior"; the cause was not determined. This is already recorded in `research/lunar-2025.md` ("Source discrepancy requiring review") and does not change the transcribed values.
- Nothing in this audit was guessed. Fields marked CANNOT-CHECK are unverified in the sources reviewed and should stay as the human reviewer decides.
