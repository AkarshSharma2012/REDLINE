# Partial-gravity flammability: literature notes

Issue #92. Source check: 2026-11-14. This is a literature assessment, not a new experiment or a material-approval record. **Inference** labels identify REDLINE interpretation; **unverified** identifies information not established in this review. PDF locators below use one-based PDF pages.

## Main finding and scope

A universal physical bound between 0 g and 1 g results is not established: published centrifuge work reports maximum PMMA flammability near lunar gravity. These are laboratory results, not observations of burning on the lunar surface. [O24, abstract/highlights][O24]

NASA's [PSI Data Repository][PSI] remains REDLINE's primary dataset; NASA lists BASS, BASS-II and ACME BRE among its combustion investigations. The papers below provide interpretation and related experiments; this review did not extract PSI raw data or verify investigation-specific dataset DOIs. [NASA investigation index][PSI-index]

## Verified studies and their limits

### 1. Sacksteder, Ferkul, Feier, Kumar and T'ien: aircraft experiments and modeling (2003)

**Source:** [*Upward and Downward Flame Spreading and Extinction in Partial Gravity Environments*][SF03], NASA workshop paper, printed pp. 141–144.

- **Conditions/material:** thin cellulosic Kimwipes tissue; 21% oxygen, balance nitrogen; 0.2–0.4 atm; KC-135 partial-gravity tests at 0.1, 0.16 and 0.38 Earth gravity, with normal-gravity comparisons. Figure 1 uses 2 cm-wide samples at 27.6 kPa. [SF03, PDF pp. 1–2][SF03]
- **Found:** upward spread increased approximately linearly with gravity over the tested range; downward spread peaked near 0.38 g. The downward pressure–gravity extinction boundary was U-shaped. The authors attributed high-gravity extinction to short residence time and low-gravity extinction to radiation loss. [SF03, PDF pp. 2–4, Figs. 1–2][SF03]
- **Interpretation:** evidence for nonmonotonic behavior, not a measured lunar oxygen threshold. **Inference:** neither spread rate nor extinction can be assumed to vary linearly between endpoint gravities. Pressure-boundary results must not be relabeled as oxygen-index measurements. [SF03, Figs. 1–2][SF03]

### 2. Olson and Ferkul: historical films/fabric comparison

**Source:** [*Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test*][OF], NTRS 20130010991; methods pp. 2–4, Table I p. 6.

**Conditions:** concurrent spread; Ultem 1000 film (10 mil), Nomex HT90-40 fabric (12 mil), Mylar G film (5 mil). Ground PET comparisons used Melinex 515. Microgravity comparison flow was 30 cm/s; centrifuge drops lasted 5.18 s. [OF, pp. 2–4][OF]

Reported oxygen concentrations (% molar), copied from Table I; these are **different endpoint definitions**, not interchangeable confidence bounds. [OF, pp. 2, 4, 6][OF]

| Material; pressure | 1 g MOC / ULOI | Simulated lunar MOC* / ULOI* | 0 g MOC* / ULOI* |
|---|---|---|---|
| Mylar G comparison; 10.2 psia | 20.0 / 21.2 | 14.1 / 15.6 | 16.0 / 17.0 |
| Ultem 1000; 10.2 psia | 23.0 / 23.5 | 19.9 / 21.0 | 23.0 / 24.0 |
| Nomex HT90-40; 14.7 psia | 22.1 / 23.5 | 19.9 / 21.0 | 22.0 / 23.0 |

MOC*/ULOI* denote extinction during/survival through the drop. Ground MOC/ULOI use repeated burn-length outcomes. Some Martian-gravity flames were still shrinking at drop end. [OF, pp. 2, 4][OF]

**Inference:** the table challenges endpoint bracketing; duration, criteria, PET identity and forced/buoyant-flow mismatches prevent a universal correction factor. [OF, pp. 2–7][OF]

### 3. Ferkul: centrifuge facility demonstration (2017)

**Source:** [*Centrifuge in Free Fall: Combustion at Partial Gravity*][F17], NASA-hosted presentation; NTRS abstract.

**Conditions/material:** 23 drops with simulated candles fueled by heptane or ethanol; 5.18-second free fall, rotation up to 1 revolution/s, simulated acceleration from zero to 1 g at 30 cm radius. Flames became longer, narrower and brighter as gravity increased; Coriolis effects tilted flames. [F17, abstract][F17]

**Inference:** establishes a method for controlled partial-gravity combustion and a rotation-related artifact to track. It does not establish solid-material oxygen limits or validate endpoint interpolation. Test oxygen and pressure for these candle drops are **unverified** here; do not substitute habitat settings. [F17, abstract][F17]

### 4. Marcum, Olson and Ferkul: corrected Earth-to-microgravity blowoff comparison (2016)

**Source:** [*Correlation of Normal Gravity Mixed Convection Blowoff Limits with Microgravity Forced Flow Blowoff Limits*][M16], Central States Section technical-meeting paper.

**Conditions/material:** cast PMMA rods, diameters 0.635–3.81 cm; 14–18% oxygen by volume in nitrogen; upward axial stagnation flow in a normal-gravity tube, compared with ISS BASS-II. Ground trials determined the forced velocity at blowoff. [M16, pp. 1–3][M16]

**Found:** after curvature/blockage corrections, an empirical buoyant-stretch offset aligned the ground blowoff data with BASS-II. The authors discarded the 14% ground dataset from further analysis after finding air entrainment at low flow. [M16, pp. 3, 6–7, Figs. 4–6][M16]

**Inference:** a useful counterexample to claiming Earth tests cannot inform reduced-gravity behavior. However, calibration against flight data is not independent prediction. This compares the blowoff branch for a particular rod geometry, not lunar-gravity measurements or a validated low-flow quenching boundary. It supports condition-specific transfer methods, not a universal 0 g / 1 g bound. [M16, pp. 1, 6–8][M16]

### 5. Olson, Neumann, Valletta, Ogorzaly and Owens: partial-gravity PMMA rods (2024)

**Source:** [*Partial Gravity Flammability of Cast PMMA Rods in Concurrent Axial Stagnation Flow*][O24], *Fire Safety Journal* 150, 104267; [NASA bibliography corroborates authors and publication][O24-NASA].

**Conditions/material:** cast PMMA rods in buoyant concurrent axial stagnation flow; centrifuge drop vehicle; 0.04 g to simulated 1 g; 13.2–15.2% oxygen by volume, average pressure 57.6 kPa (8.4 psia). [O24, abstract][O24]

**Found:** the publisher's highlights report enhanced flammability with a maximum near lunar gravity. **Inference:** this directly challenges monotonic gravity interpolation for this configuration. Because the stated gravity sweep begins above zero, it alone does not measure a matched 0 g endpoint. [O24, abstract/highlights][O24]

**Access limit:** publisher-indexed abstract/highlights were accessible through search; direct full-page requests returned HTTP 403. Exact minimum oxygen, its uncertainty, and complete test protocol are **unverified** here; no plotted coordinates were digitized or adopted. The publication is verified, but these notes intentionally use only its accessible abstract-level findings.

### 6. Urban and colleagues: lunar-application test-method comparison (2025)

**Source:** [*Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results*][U25], ICES-2025-392, corrected-captions PDF.

**Conditions/material:** nominal 56.5 kPa (8.2 psia); Earth high-flow blowoff tests versus centrifuge lunar-gravity buoyant tests. Materials included 0.8 mm PMMA sheet, P213 fiberglass tape with acrylic adhesive, cotton Beefy-T, polycarbonate and Nomex Velcro. The comparison uses a five-second extinction criterion because drop duration is limited. [U25, pp. 6–9, Figs. 7–12][U25]

**Found:** the text reports lower simulated-lunar limits than ground extrapolations for PMMA, P213 and flaming cotton; the discrepancy's cause remained unresolved. Cotton flaming and smolder extinction are separate outcomes. The authors caution that their Nomex Velcro differs from earlier Nomex fabric. [U25, pp. 8–9][U25]

**Inference:** a ground blowoff fit cannot simply be promoted to a lunar oxygen threshold. This is not a matched three-gravity demonstration. Numeric limits from these figures are **unverified** here; retain separate material forms and endpoints rather than filling gaps with fitted values. [U25, pp. 8–9][U25]

### 7. Quintiere-related work: relevant mechanisms, limited partial-gravity attribution

**Published experiment:** Zarzecki, Quintiere, Lyon, Rossmann and Diez, [*The Effect of Pressure and Oxygen Concentration on the Combustion of PMMA*][Q13], *Combustion and Flame* 160 (2013), 1519–1530.

The accessible publisher abstract describes PMMA mass-loss calorimetry in a 10 m³ pressure vessel, varying pressure, oxygen and external heat flux. Reduced pressure decreased mass-loss rate while shortening ignition delay under the investigated conditions; a simple analytical model was compared with measurements. The vessel's stated 0.1 atm capability is not a verified minimum test pressure. [Q13, abstract][Q13]

**Inference:** ignition delay and sustained burning are different outputs; pressure changes cannot stand in for a gravity sweep. A direct partial/lunar-gravity experiment attributable to Quintiere is **unverified in this review**. The publisher abstract was available via search; full text was not verified. [Q13, abstract][Q13]

**NASA program context:** NASA's [ACME information sheet][BRE] names Quintiere, Sunderland and deRis as BRE investigators. BRE uses a gas-fed perforated disk to emulate thermal feedback of solid/liquid burning and aims to assess flammability-test relevance for low/partial gravity. This is a stated objective and apparatus description, not a lunar-material measurement. No numeric partial-gravity result is claimed from it. [BRE, p. 1][BRE]

## Consequences for REDLINE (recommendations, not engine changes)

1. Keep the requested 0 g / 1 g comparison explicitly labeled as an **estimate/assumed envelope**. Add: “Lunar behaviour may fall outside this range.” Avoid claiming a validated physical bound. [O24, highlights][O24]
2. Keep simulated partial-gravity observations beside endpoint comparisons, with facility, duration and extinction definition. Require the test location to remain explicit.
3. Require matching material product/form, pressure, oxygen basis, flow direction, geometry and endpoint before transferring a limit. Ground correlations can work for specific comparisons; unexplained discrepancies also occur. [M16, pp. 6–8][M16]; [U25, pp. 8–9][U25]
4. If an endpoint or condition is absent, say “not found in the sources reviewed” or **unverified**; do not invent an interpolated limit. These notes propose no numeric lunar correction, certification criterion or new evidence-engine behavior.

## Verification boundaries

Full NASA PDF text was reviewed for SF03, OF, M16 and U25; F17 used its NASA abstract, and BRE its NASA information sheet. O24 and Q13 use publisher-indexed abstract/highlight content only. Source-access limits are recorded above. No new graph digitization, raw-data analysis, uncertainty calculation or lunar-surface dataset verification was performed. The bibliography is selective, not exhaustive; uncited leads are not treated as findings.

[PSI]: https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation
[PSI-index]: https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/
[SF03]: https://ntrs.nasa.gov/api/citations/20040053567/downloads/20040053567.pdf
[OF]: https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf
[F17]: https://ntrs.nasa.gov/citations/20170011213
[M16]: https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf
[O24]: https://www.sciencedirect.com/science/article/pii/S0379711224001802
[O24-NASA]: https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=492A5F96AAA7FB9492887E390BF6713F
[U25]: https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf
[Q13]: https://www.sciencedirect.com/science/article/abs/pii/S0010218013000692
[BRE]: https://www1.grc.nasa.gov/wp-content/uploads/PS-01548-ACME-info-sheet-1.pdf
