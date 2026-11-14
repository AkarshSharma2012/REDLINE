# REDLINE evidence table: schema and comparability rules

Issue #18 (R1). Status: research spec, not code. Every fact below has a source in the
[Sources](#sources) list, cited by its key (for example **[Link2018]**) with a page, section,
figure or table. Text marked **Inference:** is our own reasoning and is not a sourced fact.

## 1. Purpose

REDLINE puts a cabin material at a set of cabin conditions (oxygen, pressure, airflow, gravity)
and labels it "burned in testing", "close to a measured limit" or "never tested" (see `AGENTS.md`).
Each label points to one row or a few rows of an **evidence table**: one row per published
test result. This spec says:

1. which columns a row needs (section 2);
2. what kind of limit a value is, because different tests measure different things (section 3);
3. when two rows, or a row and a cabin condition, can be compared (section 4);
4. three worked examples using published values (section 5).

## 2. Evidence-table schema

One row = one reported outcome (a measured limit, or one burn/no-burn test point) for one
material at one set of conditions. Units are fixed so values can be compared without conversion.

### 2.1 Required columns (the ones listed in issue #18)

| # | Column | Type / unit | Allowed values or format | Notes |
|---|---|---|---|---|
| 1 | `material` | text | Name as the source gives it, plus grade or colour if given (e.g. `PMMA, cast black`) | Colour and grade matter: [Link2018] chose black PMMA so radiation is not absorbed deep inside the sample (Methods). |
| 2 | `form` | enum | `sheet`, `rod`, `fabric`, `tape`, `wire` (insulated wire), `slab`, `foam`, `other` | `wire` is added to the issue's list because [Osorio2014] tests insulated wires (ch. 4). |
| 3 | `thickness_mm` | number, mm | Sheet/fabric/tape thickness; for `rod` give the diameter; for `wire` give the insulation thickness and put the core in `notes` | Fabrics: also record areal density in `notes` (e.g. SIBAL 18.2 mg/cm², [Zhao2015] p. 2). |
| 4 | `width_mm` | number, mm | Exposed sample width; for `rod`/`wire` leave empty | [Zhao2015] p. 7: the narrower (1.2 cm) fabric had a smaller flammable range than the 2.2 cm one. |
| 5 | `flow_speed_cm_s` | number, cm/s | Imposed forced-flow speed at the limit. `0` for quiescent | For 1 g tests note in `notes` that buoyant flow also acts (about 30 cm/s per [Link2018], Results, Fig. 6b discussion). |
| 6 | `flow_direction` | enum | `opposed`, `concurrent`, `quiescent`, `upward-buoyant` (standard 1 g upward test, no forced flow) | `upward-buoyant` is added for NASA-STD-6001 Test 1 rows, which use vertical upward burning ([NASA6001B] §7.1.2 b–c, p. 27). |
| 7 | `o2_pct` | number, % by volume | 0–100 | |
| 8 | `pressure_kpa` | number, kPa | Total pressure | Store pressure separately; do not reduce to O2 % alone (see rule P in §4). |
| 9 | `gravity` | text | `0g`, `1g`, or a number in g (e.g. `0.16`) | Lunar values (about 0.16 g) are not measured in the sources reviewed; `AGENTS.md` says to show them only as an estimate between 0 g and 1 g. |
| 10 | `facility` | enum | `ISS`, `free-flyer` (e.g. Cygnus/Saffire), `drop-tower`, `aircraft` (parabolic flight), `ground` | |
| 11 | `endpoint` | enum | See §3: `LOC-FS`, `LOC-FR`, `quench-limit`, `blowoff-limit`, `MOC-T1`, `LOI-D2863`, `ignition`, `spread-rate`, `burn/no-burn` | The most important column. Mismatched endpoints are never compared (rule E). |
| 12 | `value` | number | The measured value in the unit named by `value_unit` (e.g. `% O2` for a limit, `cm/s` for a quench flow speed, `mm/s` for a spread rate) | |
| 13 | `value_unit` | text | `% O2`, `kPa O2`, `cm/s`, `mm/s`, `pass/fail` | |
| 14 | `uncertainty` | text | `±x` in the value's unit, or a bracket like `between 17 and 18`, or `not stated` | Never leave empty; write `not stated` if the source gives none. |
| 15 | `run_id` | text | The source's own test ID (e.g. `GMT45-T15`), or `—` if none | [Zhao2015] gives IDs in its appendix table (p. 9). |
| 16 | `source_key` | text | Key into the Sources list | |
| 17 | `source_locator` | text | Page, section, figure or table (e.g. `p. 5, Fig. 5`) | Required. No locator, no row. |

### 2.2 Extra columns we recommend (not in the issue, but needed by the rules in §4)

| Column | Type | Why it is needed |
|---|---|---|
| `external_heat_flux_kw_m2` | number (0 if none) | In [Osorio2014] (Abstract, pp. 1–2) adding 25 kW/m² of radiant heat doubled the microgravity drop in LOC for ETFE wire (6% → 12%). A heated and an unheated test are not the same condition. |
| `limit_approach` | enum: `lower-flow`, `raise-flow`, `lower-o2`, `fixed` | [Link2018] reached the ISS limit by lowering flow until the flame went out, but the 1 g limit by raising flow until blow-off (Methods). Same material, different route to the limit. |
| `pass_criterion` | text | The rule the source used to call a test "burning" (e.g. "spread > 10 mm", "> 15 cm burn length", "flame still present at end of µg period"). [Osorio2014] used different criteria in 1 g and µg (p. 84). |
| `test_duration_s` | number | Drop towers and parabolic flights give seconds of low gravity; [Osorio2014] p. 84 had to relax the burning criterion because the µg time was too short for a 100 mm spread. |
| `o2_partial_kpa` | number (derived = `o2_pct` × `pressure_kpa` / 100) | Computed, not entered. Lets the app show both views (rule P). |
| `notes` | text | Anything else: areal density, wire core, igniter, data-quality warnings from the authors. |

**Inference:** `o2_partial_kpa` should be computed by the app, never typed in, to avoid two
copies of the same number disagreeing.

## 3. What the endpoint means (plain words)

A "limit" is only meaningful together with the event that defines it. The sources use several
different events. REDLINE must store which one a value is.

| Code | Plain-words meaning | Where it comes from |
|---|---|---|
| `LOC-FS` | **Limiting oxygen concentration for flame spread.** The lowest oxygen at which a flame keeps moving across fresh, unburned material. Below it, the flame does not travel. | [Link2018] defines LOC as the level "below which flame spread cannot occur" (Results, Fig. 7 text). [Osorio2014] p. 51 uses a practical version: the flame does not travel past a 10 mm zone around the igniter. |
| `LOC-FR` | **Limiting oxygen concentration for fuel regression.** The lowest oxygen at which a flame can stay alive by burning down the end of a thick piece in place, like a candle, even if it no longer travels along the side. | [Huang2019] describes the two processes: as flow rises, a thick PMMA rod's flame "can no longer spread over the fuel surface" and instead sits behind the end face like a pool fire (Abstract). See note below on the ICES-2025-323 paper. |
| `quench-limit` | **Low-flow quenching.** In microgravity, if the airflow is too slow, the flame starves and shrinks until it goes out. The value is a flow speed (cm/s) at a given O2. | [Zhao2015] pp. 5–7: SIBAL fabric flames shrank and went out as flow was turned down; quench speeds were 1–5 cm/s. |
| `blowoff-limit` | **High-flow blow-off.** Flow is so fast the flame is pushed off the sample. | [Huang2019] p. 3: a 1 g PMMA rod flame blew off when opposed flow was raised to 310 cm/s. |
| `MOC-T1` | **Maximum oxygen concentration, NASA-STD-6001 Test 1.** The highest oxygen at which at least five 30 × 6.5 cm samples, burned upward in 1 g, each burn no more than 15 cm and drop no burning debris that lights paper below. A pass/fail screening result, not a physical flame limit. | [NASA6001B] §7.1.2 b (p. 27), §7.1.3 (p. 28), §7.1.4 c (p. 29). |
| `LOI-D2863` | **Limiting oxygen index (ASTM D2863).** A ground candle-style test of the lowest oxygen that sustains burning. | [Huang2019] p. 1 and p. 8 argue that near this limit a thick sample burns on its top surface rather than spreading, so the index can reflect regression burning, not spread. [Osorio2014] p. 24 notes LOI has also been defined via Test 1 as passing "approximately half the time". |
| `ignition` | Whether a given igniter could start a flame at all. | [Zhao2015] appendix (p. 9) lists "No ignition" runs separately from "Quenched" runs. |
| `spread-rate` | A speed of the flame front (mm/s), not a limit. | [Link2018] Figs. 7–8. |
| `burn/no-burn` | A single test point: did it spread or not, at these exact conditions. | [Zhao2015] appendix; [Osorio2014] p. 51 (Propagation / No Propagation). |

**Note on LOC-FS vs LOC-FR terminology.** The labels "LOC-FS" and "LOC-FR" appear in an ICES
2025 paper, *Extinction of Opposed Flame Spread and Regression Burning of Thick Solid Fuels*
(ICES-2025-323, Texas Tech repository). Its full text returned HTTP 403 to our fetcher, so we
did **not** review it and do not report its contents. The meanings in the table above are built
from [Huang2019], which we did read.

**Why the distinction matters (sourced).**
- The two processes respond differently to conditions: lowering O2 to 20% pushed a 1 g PMMA rod
  into regression burning, and by 19% the regression angle reached 90° ([Huang2019] p. 8, Fig. 7a).
- Lower pressure moves the switch from spread to regression to slower flows ([Huang2019] p. 8,
  Fig. 6b).
- Thin samples have no stable zone for regression burning, which [Huang2019] p. 8 gives as the
  reason thin and thick samples of the same material show different LOCs.
- In microgravity at low opposed flow (< 10 cm/s), pure regression was not seen ([Huang2019]
  Abstract).

**Inference:** for a cabin question ("will a fire travel along this panel?") `LOC-FS` is usually
the relevant endpoint. A `LOC-FR` or `LOI-D2863` value may be lower than the spread limit for
thick parts and should not be used to say a material "spreads" at that oxygen.

## 4. Comparability rules

Two rows (or a row and a REDLINE cabin condition) are checked field by field. Each mismatch is
one of:

- **INVALID**: do not compare. The app must not show a label from this pairing.
- **FLAG**: compare, but show the label as weaker and say why in the UI.
- **OK**: same, or within the tolerance given.

A pairing's overall grade is the worst grade of any field.

| Rule | Field | INVALID when | FLAG when | Basis |
|---|---|---|---|---|
| E | `endpoint` | Endpoints differ (e.g. `LOC-FS` vs `MOC-T1`, or `LOC-FS` vs `LOC-FR`) | — | Different events, §3. [Huang2019] p. 1 calls mixing spread and regression a "misuse or misinterpretation". |
| M | `material` | Different base material (PMMA vs Nomex) | Same material, different grade, colour or maker | [Link2018] Methods (black vs clear PMMA). Inference for grade/maker. |
| F | `form` | Different form (rod vs sheet, fabric vs foam) | — | **Inference**, supported by [Huang2019] p. 8 (rods without a recirculation zone burn differently). |
| T | `thickness_mm` | One sample is thin and the other thick, as stated by the sources (e.g. thin rods vs thick rods in [Huang2019] p. 10) | Same regime but ratio > 2× | [Huang2019] p. 8 (thin vs thick give different LOCs). The 2× threshold is the issue's example and is an **inference**, not a sourced value. |
| W | `width_mm` | — | Ratio > 2× | [Zhao2015] p. 7 (narrow sample, smaller flammable range). Threshold is an **inference**. |
| D | `flow_direction` | `opposed` vs `concurrent`; any forced flow vs `quiescent`; forced flow vs `upward-buoyant` | — | Nomex HT90-40: forced or mixed flow vs quiescent gave different LOC values ([Urban2014] poster panel "Nomex Ignition Testing"). Opposed vs concurrent: **inference**; BASS-II tested and reported them separately ([Ferkul2016] slide 7; [Zhao2015] p. 1). |
| V | `flow_speed_cm_s` | One side is below a reported quench speed for that material and the other is above it | Same side of any known quench/blow-off limit but ratio > 2× | Microgravity limits depend strongly on flow: no PMMA rod spread below 0.6 cm/s ([Link2018] Results, Figs. 4, 6a); SIBAL quench at 1–5 cm/s ([Zhao2015] p. 7). Ratio threshold is an **inference**. |
| O | `o2_pct` | — | — | Not a mismatch rule: this is the axis REDLINE compares along. Always carry `uncertainty` (e.g. ±0.3% on ISS O2 in [Link2018] Fig. 7 caption). |
| P | `pressure_kpa` | — | Pressures differ by more than 10 kPa | For Nomex, the limit followed a nearly straight line in O2 partial pressure vs total pressure, so a fire-resistant material can become flammable at reduced pressure with the same O2 partial pressure ([Urban2014] poster, Nomex panel; [Osorio2014] Abstract, pp. 1–2). 10 kPa is an **inference**. |
| G | `gravity` | — | Always flag when gravity differs, and label the result "cross-gravity" | µg LOCs were lower than 1 g in every pairing reviewed ([Link2018] Fig. 8; [Osorio2014] p. 100). Lunar values: estimate only, between 0 g and 1 g (`AGENTS.md`). |
| X | `facility` | — | Drop tower or aircraft vs ISS/free-flyer | Short low-gravity time: drop towers give "some data" but long-duration data are needed for all but the thinnest films ([Ferkul2016] slide 4); [Osorio2014] p. 84 had to change its spread criterion for parabolic flights. |
| H | `external_heat_flux_kw_m2` | One side heated, other not (or fluxes differ by > 5 kW/m²) | — | Radiant flux of 25 kW/m² doubled the µg LOC drop for ETFE wire ([Osorio2014] Abstract, pp. 1–2). 5 kW/m² is an **inference**. |
| A | `limit_approach` / `pass_criterion` | — | Different approach or criterion | [Link2018] Methods (lower-flow vs raise-flow); [Osorio2014] p. 84 (different spread criteria in 1 g and µg). |
| U | `uncertainty` | — | `not stated` on either side, or the two values are closer than their combined uncertainty | Inference: if the gap is inside the error bars, the data cannot say which is lower. |

**How REDLINE should use the grade (inference, for the build team to confirm):**
- "burned in testing": a row with flame spread at O2 ≤ the cabin's O2, grade OK or FLAG, same
  gravity class as the cabin claim, with every FLAG shown.
- "close to a measured limit": the cabin O2 is within the row's uncertainty, or within 1
  percentage point, of a `LOC-FS` row graded OK or FLAG.
- "never tested": no row survives the INVALID filter. Wording must be "not found in the sources
  reviewed", never "never burns".

## 5. Worked examples (published values)

### Example 1: Black PMMA rods, ISS vs ground (grade: FLAG, comparable)

Source: [Link2018].

| Field | ISS row | Ground row |
|---|---|---|
| material / form | PMMA, cast black / rod | same |
| thickness_mm (diameter) | 6.4, 9.5, 12.7 | same three, plus 19 and 32 (Methods) |
| flow_direction | opposed | opposed (upward), plus buoyancy |
| flow_speed_cm_s | 0.4–8 (Methods); comparison at about 2 (Fig. 7 caption) | 0–350 (Methods) |
| o2_pct result | flame still spread at 17% (Results, Fig. 8) | no flame at 18% and below (Results, Fig. 8) |
| endpoint | LOC-FS (bracket) | LOC-FS (bracket) |
| limit_approach | lower-flow until extinction | raise-flow until blow-off |
| facility / gravity | ISS (BASS-II in Microgravity Science Glovebox) / 0 g | ground / 1 g |
| uncertainty | O2 ±0.3% (Fig. 7 caption); authors say µg points "were not systematically taken" (Results) | not stated in sections reviewed |
| pressure_kpa | not stated in the sections reviewed | not stated in the sections reviewed |

Rule check: E OK (both flame-spread limits). M, F, T OK. D OK. V FLAG (µg forced 2 cm/s vs
1 g buoyant flow of about 30 cm/s). G FLAG (cross-gravity, which is the point). A FLAG
(different approach to the limit). P FLAG (pressure not found in the sections reviewed).
U: 17% vs 18% differ by more than ±0.3%, so OK.

**Result:** comparable with flags. A fair sentence: "On the ISS, black PMMA rods burned in
testing at 17% O2 in slow opposed flow; on the ground the same rods did not burn at 18% or
below [Link2018, Fig. 8]."

### Example 2: ETFE-insulated wire, 1 g vs parabolic flight (grade: FLAG, comparable)

Source: [Osorio2014], chapter 4. ETFE is a fluoropolymer (Teflon family).

| Field | 1 g row | µg row |
|---|---|---|
| material / form | ETFE insulation on copper / wire | same |
| thickness_mm | insulation 0.30, core 0.50 (p. 84) | same |
| flow | opposed, 0.12 m/s = 12 cm/s (p. 74) | same |
| pressure_kpa | 100 (p. 79) | 100 (p. 79) |
| external_heat_flux | 0 | 0 |
| value (LOC, `LOC-FS`) | 31.5% (p. 84) | about 26% (p. 100) |
| pass_criterion | flame spread > 100 mm (p. 84) | flame still present at end of µg period (p. 84) |
| facility | ground | aircraft (parabolic flight) |
| uncertainty | O2 drift < 1.0% of the set value during a test (pp. 79–80) | same |

Rule check: E OK (both "lowest O2 resulting in opposed flame spread", p. 84). M, F, T, D, V,
P, H OK. G FLAG. X FLAG (parabolic flight). A FLAG (the author changed the criterion because
the µg time was too short, p. 84). U OK (5.5-point gap vs about 1% drift).

Data note: the abstract says a "6% decrease" (pp. 1–2) and p. 100 says "around 5.5%
(31.5% versus 26%)". **Inference:** both are percentage points of O2 and the abstract rounds.
Store the p. 100 numbers.

Also on p. 100 the author compares ETFE with PE-insulated wires from another study (19% vs 16%).
That cross-material pairing is INVALID under rule M for a per-material label; it may only be
used to show that the size of the gravity effect differs by material.

### Example 3: SIBAL fabric quench on ISS vs NASA-STD-6001 Test 1 (grade: INVALID)

Sources: [Zhao2015], [NASA6001B], [Urban2014].

| Field | ISS row | NASA Test 1 |
|---|---|---|
| material / form | SIBAL, 75% cotton / 25% fiberglass / fabric (p. 2) | any candidate material |
| thickness / areal density | about 0.32 mm, 18.2 mg/cm² (p. 2) | as used |
| sample size | 2.2 cm wide × 10 cm long (pp. 1–2) | 30 × 6.5 cm, five samples (§7.1.2 b, p. 27) |
| flow | concurrent, forced: ignited at 10 cm/s, reduced to 2.2 cm/s (p. 5, Figs. 5–6) | upward burning in 1 g, no forced flow (§7.1.2 b–c, p. 27) |
| o2_pct | 18.7% (p. 5) | the MOC is whatever O2 all samples pass at (§7.1.4 c, p. 29) |
| pressure | 1 atm (p. 3) | as specified for the worst-case atmosphere (§7.1.2 a, p. 27) |
| endpoint | `quench-limit`: flame shrank and went out at 2.2 cm/s (p. 5) | `MOC-T1`: pass if burn length ≤ 15 cm and no debris ignition (§7.1.3, p. 28) |
| run_id | Probably GMT45-T15: the appendix lists it as 2.2 cm, 18.7% O2, "Quenched" (p. 9). Its flow cell is garbled in our text copy, so this match is an **inference** | — |
| facility / gravity | ISS / 0 g | ground / 1 g |

Rule check: E INVALID (quench extinction at a fixed slow flow vs a 15 cm pass/fail screen).
D INVALID (concurrent forced vs upward buoyant). W, T FLAG (2.2 cm vs 6.5 cm width).

**Result:** INVALID. The ISS quench result cannot be used to confirm or reject a Test 1 MOC,
and an MOC must not be shown as an ISS flame limit. This gap is the reason NASA's Saffire-II
flight was planned to burn nine smaller 5 × 30 cm samples to check its screening tests
([Urban2014] NTRS abstract and poster "Saffire II Samples" panel). A Test 1 MOC for SIBAL
was not found in the sources reviewed.

## 6. Gaps and open items

- ICES-2025-323 (LOC-FS / LOC-FR terminology) and the 2019 ICES paper *Flammability Limits
  from BASS-II Testing in Microgravity Compared to Normal Gravity Limits* (Olson) are on the
  Texas Tech repository, which returned HTTP 403 to our fetcher. Not reviewed. Worth a manual
  download by a human.
- The BASS-II Summary Report (NASA TM-20210011385, 2021) is over our 10 MB fetch limit and was
  not reviewed; it likely holds full run tables.
- [Link2018] supplementary Tables S1/S2 (per-run data) were not reviewed.
- No lunar-gravity (0.16 g) flame-spread limits were found in the sources reviewed.
- Thresholds marked **inference** (2× thickness/width/flow, 10 kPa, 5 kW/m², 1 point "close")
  should be reviewed by the science lead before the app uses them.
- Other research branches: at the time of writing only `origin/task/33-...` existed and it had
  no research files, so this spec does not build on other agents' work.

## Sources

| Key | Title | Authors, year | URL | Used for |
|---|---|---|---|---|
| Link2018 | The Effect of Gravity on Flame Spread over PMMA Cylinders, *Scientific Reports* 8, 120 | S. Link, X. Huang, C. Fernandez-Pello, S. Olson, P. Ferkul, 2018 | https://www.nature.com/articles/s41598-017-18398-4 | Example 1; LOC definition (Results, Fig. 7 text); Methods; Figs. 4, 6–8. Online article has no page numbers, so sections/figures are cited. |
| Huang2019 | Transition from Opposed Flame Spread to Fuel Regression and Blow off: Effect of Flow, Atmosphere, and Microgravity, *Proc. Combust. Inst.* 37, 4117–4126 (pre-published version) | X. Huang, S. Link, A. Rodriguez, M. Thomsen, S. Olson, P. Ferkul, C. Fernandez-Pello, 2019 | https://ira.lib.polyu.edu.hk/bitstream/10397/89528/1/34_ProCI_2019_buring-spread.pdf (DOI 10.1016/j.proci.2018.06.022) | Spread vs regression (Abstract; pp. 1, 3, 8, 10). Pages are the manuscript's own page numbers (the title/abstract page is unnumbered). |
| Zhao2015 | Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity, 9th US National Combustion Meeting | X. Zhao, J. S. T'ien, P. V. Ferkul, S. L. Olson, 2015 | https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf | Example 3; quench limit (pp. 1–7); appendix run table (p. 9). |
| Osorio2014 | Effect of Environmental Variables on the Flammability of Fire Resistant Materials (PhD dissertation, UC Berkeley) | A. F. Osorio, 2014 | https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf | Example 2; LOC criterion (p. 51); MOC/LOI via Test 1 (p. 24); ETFE wire (pp. 74, 79, 84, 100); abstract (pp. 1–2). Printed page numbers. |
| NASA6001B | NASA-STD-6001B w/Change 3, Flammability, Offgassing, and Compatibility Requirements and Test Procedures | NASA, 2011, Change 3 dated 2025-06-09 | https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf | Test 1 and MOC definition, §7.1, pp. 27–29 of 158. |
| Urban2014 | Large-Scale Spacecraft Fire Safety Tests (poster, International Symposium on Combustion) | D. Urban, G. Ruff, P. Ferkul, S. Olson, A. C. Fernandez-Pello, J. T'ien, et al., 2014 | https://ntrs.nasa.gov/citations/20150000894 (PDF: https://ntrs.nasa.gov/api/citations/20150000894/downloads/20150000894.pdf) | Saffire-II purpose; Nomex HT90-40 flow and pressure effects on LOC. Single-page poster; cited by panel. |
| Ferkul2016 | Combustion of Solids in Microgravity: Results from the BASS-II Experiment (presentation) | P. V. Ferkul, S. Bhattacharjee, C. Fernandez-Pello, F. Miller, S. L. Olson, F. Takahashi, et al., 2016 | https://ntrs.nasa.gov/api/citations/20160000593/downloads/20160000593.pdf | Drop tower vs long-duration data (slide 4); BASS-II test ranges, 0–55 cm/s flow, O2 21% and below (slide 7). |
