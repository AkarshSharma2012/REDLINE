# Verification: OF12 evidence rows against the source (issue #103)

**Source checked:** S.L. Olson and P.V. Ferkul, *Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test* (AIAA/ICES 2012), NTRS 20130010991.
PDF: <https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf> (9 pages; NTRS record <https://ntrs.nasa.gov/citations/20130010991>).

**Method (2026-11-14):** I downloaded the NASA PDF and extracted its text with `pdftotext -layout`. I rendered PDF pages 3 and 6 to PNG and read them visually. Text extraction scrambles the Nomex column of Table I, so every Table I number below comes from the rendered page image. I also checked those numbers against the table's own ΔO2 % rows using Eq. (1), p. 6. In this PDF, PDF page numbers match the printed page numbers. I compared each row in `data/evidence.csv` with `source_key = OF12`, and the same 6 rows in `data/evidence.json` (their values are identical). **No data file or review_status was changed.** A human decides.

## Verdicts (one line per evidence_id)

- `OF12-NOMEX-1G-MOC`: **CONFIRMED**. Nomex HT90-40, 14.7 psia (→101.3 kPa), 1 g, WSTF, 1g MOC = 22.1 % O2 [OF12 Table I p. 6]; MOC definition "at least five samples passed … at least one sample failed in … 1 percent more oxygen" [p. 2]; 12 mil fabric [p. 3]; upward (STD-6001 Test 1) [pp. 1, 4].
- `OF12-NOMEX-1G-ULOI`: **CONFIRMED**. 1g ULOI = 23.5 % O2 [Table I p. 6]; ULOI = O2 where material passes Test 1 burn length criterion "approximately half the time" [p. 2]; 14.7 psia [Table I header p. 6].
- `OF12-NOMEX-L-MOCSTAR`: **CONFIRMED except gravity_g: CANNOT-CHECK**. Lunar MOC* = 19.9 % O2, 14.7 psia [Table I p. 6]; MOC* = max O2 where the flame self-extinguished during the drop [pp. 4, 6]; lunar data are from ref. 8 (Ferkul & Olson 2011, J. Thermophysics Heat Transfer 25(3)) [pp. 5, 6, 9]. OF12 gives no numeric lunar g-level (no "1/6", "0.16" or "0.17" in the text), so the 0.16 can't be checked against this source: unverified here.
- `OF12-NOMEX-L-ULOISTAR`: **CONFIRMED except gravity_g: CANNOT-CHECK**. Lunar ULOI* = 21.0 % O2 [Table I p. 6]; ULOI* = min O2 where the flame survived the full drop time [pp. 4, 6]. gravity_g 0.16: unverified here (same reason as above).
- `OF12-NOMEX-0G-MOCSTAR`: **CONFIRMED**. 0g* MOC* = 22.0 % O2 [Table I p. 6]; concurrent flow 30 cm/s [p. 4]; drop-test criterion [p. 6].
- `OF12-NOMEX-0G-ULOISTAR`: **CONFIRMED**. 0g* ULOI* = 23.0 % O2 [Table I p. 6]; concurrent flow 30 cm/s [p. 4]; drop-test criterion [p. 6].

## Field-by-field check

All locators refer to the PDF above.

| Field | Rows | Data value | What the source says | Result |
|---|---|---|---|---|
| material | all 6 | Nomex HT90-40 | "Nomex® HT90-40" column, Table I p. 6; described p. 3 | CONFIRMED |
| form | all 6 | fabric | "12 mil thick fire retarded aromatic nylon fabric", p. 3 | CONFIRMED |
| thickness_mm | all 6 | blank | 12 mil, p. 3 (left blank on purpose; source units kept in notes) | CONFIRMED (blank is allowed) |
| width_mm | all 6 | blank | p. 3 gives a 5 cm × 15 cm frame opening, but for the Martian-g centrifuge setup; 1 g WSTF and ref. 8 lunar/0g sample widths aren't stated in OF12 | blank is correct; not checked |
| o2_pct / value | 1G-MOC | 22.1 | 1g MOC 22.1, Table I p. 6 | CONFIRMED |
| o2_pct / value | 1G-ULOI | 23.5 | 1g ULOI 23.5, Table I p. 6 | CONFIRMED |
| o2_pct / value | L-MOCSTAR | 19.9 | Lunar MOC* 19.9, Table I p. 6 | CONFIRMED |
| o2_pct / value | L-ULOISTAR | 21 | Lunar ULOI* 21.0, Table I p. 6 | CONFIRMED |
| o2_pct / value | 0G-MOCSTAR | 22 | 0g* MOC* 22.0, Table I p. 6 | CONFIRMED |
| o2_pct / value | 0G-ULOISTAR | 23 | 0g* ULOI* 23.0, Table I p. 6 | CONFIRMED |
| value_unit | all 6 | % O2 | Table I title: "Limiting Oxygen Molar Concentrations", p. 6 | CONFIRMED (source says molar %; data says % O2) |
| pressure_kpa / pressure_psia | all 6 | 101.3 / 14.7 | "14.7 psia" under Nomex header, Table I p. 6. 14.7 × 6.89476 = 101.35 kPa | CONFIRMED |
| gravity_g | 1G-* | 1 | "1g", Table I p. 6 | CONFIRMED |
| gravity_g | L-* | 0.16 | "Lunar" / "Lunar g", Table I p. 6; no numeric value anywhere in OF12 (it gives Martian as 0.38 g, p. 1) | CANNOT-CHECK (not stated in OF12) |
| gravity_g | 0G-* | 0 | "0g*", Table I p. 6; "microgravity with forced convection", p. 1 | CONFIRMED |
| flow_speed_cm_s | 0G-* | 30 | "0g (with a concurrent flow of 30 cm/s…)", p. 4 | CONFIRMED |
| flow_speed_cm_s | 1G-*, L-* | blank | not stated for these cases in OF12 | blank is correct |
| flow_direction | 1G-* | upward-buoyant | Test 1 is "an upward flame propagation test", p. 1; WSTF used STD-6001 Test 1 protocol, p. 4 | CONFIRMED |
| flow_direction | 0G-* | concurrent | "concurrent flow of 30 cm/s", p. 4 | CONFIRMED |
| flow_direction | L-* | concurrent | p. 3 describes the centrifuge's concurrent-flow geometry (ignition at the furthest point; buoyant flow toward the centre, Fig. 3), but for the Martian-g tests in this paper. The lunar tests used a centrifuge (ref. 8 title, p. 9), but OF12 doesn't describe their geometry | partly checked: consistent, but not stated directly for the lunar case |
| facility | 1G-* | ground | WSTF, pp. 2, 4 | CONFIRMED |
| facility | L-*, 0G-* | drop-tower | Eq. (1) text: low-g limits come from "the drop test" for 0g, Lunar-g and Martian-g, p. 6; centrifuge built for the GRC Zero Gravity Facility (drop tower), p. 2 | CONFIRMED |
| endpoint | 1G-MOC / 1G-ULOI | MOC / ULOI | "1g MOC" / "1g ULOI", Table I p. 6; definitions p. 2 | CONFIRMED |
| endpoint | L-*, 0G-* | MOC / ULOI | source label is **MOC\* / ULOI\***, which has a different (drop-time) definition, pp. 4, 6. The data keeps the starred label in `endpoint_source` | CONFIRMED value; note for human: the plain `endpoint` field drops the asterisk |
| pass_criterion | 1G-MOC | five Test 1 burn-criterion passes; fail at 1 pp higher O2 | p. 2 definition | CONFIRMED |
| pass_criterion | 1G-ULOI | approximately half pass Test 1 burn criterion | p. 2 definition | CONFIRMED |
| pass_criterion | *-MOCSTAR | highest O2 extinguishing within drop | "maximum oxygen concentration at which the flame was observed to self-extinguish during the drop time", p. 4; p. 6 | CONFIRMED |
| pass_criterion | *-ULOISTAR | lowest O2 surviving full drop | "minimum oxygen concentration where the flame survived the full drop time", p. 4; p. 6 | CONFIRMED |
| outcome | all 6 | blank | — | blank is correct (these are limit values, not single burn/no-burn runs) |
| uncertainty | all 6 | not stated for this table entry | Table I gives no uncertainty. The only precision statement is "precision mixtures of gases (+/- 0.1% O2) but at increments of 1% O2", pp. 7–8, in the Fig. 7 Mylar discussion; OF12 doesn't say it applies to the Nomex entries | CONFIRMED (not stated for Nomex) |
| test_duration_s | all 6 | blank | Martian drops lasted 5.18 s (p. 4; Fig. 4 caption). Lunar/0g drop durations aren't stated in OF12 | blank is correct |
| run_id | all 6 | not provided | OF12 gives no run IDs | CONFIRMED |
| source_locator | all 6 | Table I p. 6; criteria pp. 2,4; material p. 3 | Table I is on p. 6; criteria on pp. 2, 4 (also restated p. 6); Nomex description on p. 3 | CONFIRMED |
| condition_source_locator | all 6 | pp. 2-4 experimental description; Table I p. 6 | Section II "Experiment Description" runs pp. 2–4 | CONFIRMED |
| gravity_context | 1G-* | terrestrial WSTF | pp. 2, 4 | CONFIRMED |
| gravity_context | L-* | simulated lunar centrifuge | lunar values "from ref. 8", p. 6; ref. 8 is titled "Zero-Gravity Centrifuge Used for the Evaluation of Material Flammability in Lunar Gravity", p. 9 | CONFIRMED |
| gravity_context | 0G-* | microgravity with forced concurrent flow | pp. 1, 4 | CONFIRMED |
| gravity_source | L-* | 1/6 g | the text "1/6 g" doesn't appear in OF12 | CANNOT-CHECK (not stated in OF12) |

## Notes for the human reviewer (no change made)

1. **Stale text in `notes` (all 6 rows):** the notes say "Pressure kPa blank; source gives 14.7 psia", but `pressure_kpa` is now 101.3 and the same notes later say "Converted 14.7 psia to 101.3 kPa per V2 C1". This is an internal contradiction, not a disagreement with the source.
2. **Lunar g-level:** 0.16 is the usual lunar value, but OF12 doesn't state it. It would need to be checked against ref. 8 (Ferkul & Olson 2011, J. Thermophysics Heat Transfer 25(3)). I didn't retrieve ref. 8, so this stays unverified.
3. **Starred endpoints:** for the 4 low-g rows, `endpoint` = MOC/ULOI but the source endpoints are MOC\*/ULOI\*. These use different criteria: the source says "the low g extinction limit criteria are not the same as 1g due to time constraints in drop testing" (p. 6). `endpoint_source` keeps the asterisk; a human should decide whether the UI must show it.
4. **1 g igniter:** WSTF tests used a hot-wire igniter instead of the standard chemical igniter (p. 4). This isn't recorded in the rows. It may matter if these rows are compared with standard Test 1 results.
5. **Not in the dataset (scope note only):** Table I p. 6 also lists Nomex Martian ULOI\* 19.9 and MOC\* 19.0 (Martian g = 0.38 g, p. 1), plus ΔO2 % values (Martian −3.35, Lunar −2.35, 0g −0.3). I recomputed these with Eq. (1) from the table values, and they match the printed numbers, which confirms how the Nomex column reads.
