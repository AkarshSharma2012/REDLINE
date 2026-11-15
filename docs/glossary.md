# REDLINE plain-language glossary

Issue #89 (D1). Sources reviewed 14 November 2026. These are short explanations of terms that judges and the
public may not know, as used in REDLINE. Every factual sentence has a source key in square brackets with a
locator. Keys are listed under [Sources](#sources) at the end. **Inference** marks our own reading, not a
source's words. **Unverified** means we could not confirm it in the sources reviewed.

The primary dataset is NASA's Physical Sciences Informatics (PSI) Data Repository [PSI].

---

## Data and programs

**1. PSI (Physical Sciences Informatics).** NASA's public data repository for physical-science
investigations, including those listed under the research area "Combustion Science" [PSICAT, "Combustion
Science"; PSI]. On 14 Nov 2026 its public search returned 24 investigation records classified as Combustion
Science. That count is a dated inventory, not a permanent total [PSISEARCH; REDLINE `data/investigations.json`,
`coverage`].

**2. Investigation (PSI-nn).** One PSI record for an experiment or a data-analysis study, with an accession
number such as PSI-25 and its own permalink [PSI-25]. Some PSI records are ground studies that re-analyse flight
data rather than new flights [PSI-62; PSI-60].

**3. ISS (International Space Station).** The orbiting laboratory where most of the PSI combustion experiments
ran, for example BASS-II, FLEX and ACME [GUIDE, PDF pp. 21, 36, 44]. Results there are microgravity results,
not lunar or Martian ones (**Inference**, from the definition of microgravity below).

**4. MSG and CIR (station hardware).** The Microgravity Science Glovebox (MSG) is an enclosed, workbench-style
rack on the ISS; BASS and SPICE ran in it [GUIDE, PDF pp. 13, 21, 44]. The Combustion Integrated Rack (CIR) is
an ISS rack "designed to test experiments that focus on fire prevention, detection and suppression"; FLEX ran
in it with the MDCA droplet insert, and ACME used it too [GUIDE, PDF pp. 36, 43–44].

## Experiments in REDLINE

**5. BASS and BASS-II (Burning and Suppression of Solids).** ISS glovebox experiments that burned small solid
samples (fabrics, acrylic and others) in slow, controlled airflow to study ignition, spread, extinction and
nitrogen suppression [PSI-26; PSI-25; GUIDE, PDF p. 21]. BASS-II ran airflow from 0 to 55 cm/s at oxygen levels
of 21% and below [FERKUL16, slide 7].

**6. Saffire (Spacecraft Fire Experiments I–VI).** Large-scale fire tests run inside uncrewed Cygnus cargo
vehicles after they left the ISS, from 2016 to January 2024 [SAFNEWS24; SAFSHEET]. They measured how big fires
grow and how they affect a closed vehicle; one Nomex sample "did not ignite" in Saffire-VI [SAF21, abstract
pp. 1–2; SAF24, p. 4]. These are microgravity, forced-flow results, not lunar results (**Inference**).

**7. SAME and SAME-R (Smoke Aerosol Measurement Experiment, and Reflight).** ISS experiments that measured the
size of smoke particles from overheated spacecraft materials, which matters for designing smoke detectors
[PSI-102; PSI-101]. DAFT and DAFT-2 were earlier ISS tests of the particle counters used for SAME [PSI-47].

**8. FLEX and FLEX-2 (Flame Extinguishment Experiment).** ISS tests that burned single fuel droplets in the
CIR to study burning limits and how well inert gases put flames out [PSI-69; PSI-68; GUIDE, PDF p. 36].
FLEX found that droplets kept vaporizing after the visible flame went out, supported by a "cool flame"
(see 9) [GUIDE, PDF pp. 33–34].

**9. Cool flame; CFI (Cool Flames Investigation).** A cool flame is a weak, low-temperature flame that can
persist, invisible to the eye, after the visible flame has gone out [GUIDE, PDF pp. 33–34, 41–42]. CFI and the
gas-fuelled CFI-G studied when cool flames form and go out [PSI-39; PSI-159].

**10. ACME (Advanced Combustion via Microgravity Experiments).** A set of gas-flame experiments that shared one
modular insert in the CIR, covering soot, flame stability and extinction, flammability and electric-field
effects [GUIDE, PDF p. 44; ACME]. Its sub-studies have their own PSI records: BRE, CLD Flame, E-FIELD Flames,
Flame Design, s-Flame and CFI-G [PSI-20; PSI-21; PSI-22; PSI-10; PSI-23; PSI-159].

**11. SPICE and SLICE.** SPICE (Smoke Point In Coflow Experiment) measured the "smoke point" of gas-jet flames,
the fuel flow at which a flame tip opens and starts to release soot [PSI-107; GUIDE, PDF p. 13]. SLICE studied
how such flames lift off and stabilize, using the SPICE hardware in the MSG [PSI-106; GUIDE, PDF p. 15].

**12. FM2 (Flammability of Materials on the Moon).** A planned sealed chamber that is to burn four samples one
at a time on the lunar surface; NASA calls it the first combustion experiment on another planetary body
[FM2WEB, "Background"; "Approach and Hardware"]. Its goal includes testing whether some materials are more
flammable in partial gravity than at 1 g [FM2WEB, "Objectives"]. No flight date was found in the official
sources reviewed [R5 §3].

## Gravity and airflow

**13. Microgravity (0 g).** The near-weightless condition in orbit, which changes fire behavior [GUIDE, PDF
p. 5]. Without gravity there is no buoyant flow, so a flame gets fresh oxygen only from forced airflow or
diffusion (**Inference**, consistent with [GUIDE, PDF pp. 33–34] on buoyant flow in normal gravity).

**14. Partial gravity (lunar, Martian).** Gravity between 0 g and 1 g, as on the Moon or Mars. NASA's JSC materials
plan says limited drop-tower tests show "materials may be more flammable in partial gravity environments than
in Earth gravity" [JSC27301, §5.1.1 i, p. 53]. REDLINE has no direct lunar-gravity burn data, so any lunar answer
is shown only as an estimate bounded by 0 g and 1 g results [AGENTS]. Lunar gravity as "about 0.16 g" (the
value REDLINE uses in queries) is **unverified** against a NASA source in this glossary.

**15. Buoyant flow (natural convection).** On Earth, hot gas rises and pulls fresh air past a flame; this
"buoyancy-induced flow" can blow near-limit flames off [GUIDE, PDF p. 33]. For PMMA rods on the ground this flow
is about 30 cm/s [LINK18, Results, Fig. 6b discussion, via R1].

**16. Opposed vs concurrent flame spread.** In opposed spread the airflow moves against the direction the flame
travels; in concurrent spread it moves with it. BASS-II tested and reported the two separately, and REDLINE never
compares one with the other [FERKUL16, slide 7; ZHAO15, p. 1; R1 §4 rule D].

**17. Drop tower and parabolic flight.** Ground facilities that give only seconds of low gravity. They give
"some data", but long-duration data are needed for all but the thinnest samples [FERKUL16, slide 4].

## Fire events

**18. Ignition vs flame spread.** Ignition is whether an igniter can start a flame at all; flame spread is
whether that flame then travels over fresh material. Sources record them separately, for example "No ignition"
runs versus runs that burned and then went out [ZHAO15, p. 9 appendix; R1 §3]. Flame spread rate is how fast the
flame front moves, in mm/s; it is a speed, not a limit [LINK18, Figs. 7–8].

**19. Quenching and blow-off (flow limits).** In microgravity, if the airflow is too slow the flame starves, shrinks
and goes out. Cotton/fiberglass (SIBAL) fabric flames on the ISS quenched at 1–5 cm/s [ZHAO15, pp. 5–7]. Blow-off is the opposite limit: airflow so fast it pushes the flame off the sample. A 1 g PMMA rod flame blew
off when opposed flow reached 310 cm/s [HUANG19, p. 3].

## Limits, tests and standards

**20. LOC (limiting oxygen concentration).** The oxygen level "below which flame spread cannot occur" for a given
material and condition [LINK18, Results, Fig. 7 text]. On the ISS, black PMMA rods burned in testing at 17% O2 in
slow opposed flow; on the ground the same rods did not burn at 18% or below [LINK18, Fig. 8].

**21. LOC-FS (LOC for flame spread).** The lowest oxygen at which a flame keeps travelling across unburned material
[LINK18; OSORIO14, p. 84 via R1]. REDLINE uses only this kind of limit to say a cabin value is "close to a measured
limit" [S4 §4.3].

**22. LOC-FR (LOC for fuel regression).** The lowest oxygen at which a flame survives by burning down the end of a
thick piece in place, like a candle, even when it no longer spreads along the side [HUANG19, Abstract]. The
"LOC-FS"/"LOC-FR" labels come from an ICES-2025 paper whose full text we could not open, so the meanings here rely on
[HUANG19] [R1 §3 note].

**23. LOI (limiting oxygen index, ASTM D2863).** A ground, candle-style test of the lowest oxygen that sustains
burning. Near this limit a thick sample can burn on its top surface rather than spread, so the index may reflect
regression burning, not spread [HUANG19, pp. 1, 8].

**24. NASA-STD-6001 Test 1 (upward flame propagation).** NASA's standard 1 g screening test. Five 30 × 6.5 cm samples
are burned upward in still gas at the worst-case oxygen level; a material passes only if none burns more than 15 cm
and none drops burning debris that lights paper below [STD6001, §7.1.2 a–c, p. 27; §7.1.3 a, p. 28; §7.1.4 i, p. 30].
Saffire authors found Test 1 useful for spotting highly flammable materials, but passing it "cannot be assumed to
indicate that a material will not burn" in low gravity [SAF21, p. 10].

**25. MOC (maximum oxygen concentration) and self-extinguishing.** A material that passes Test 1 is called
self-extinguishing in that atmosphere [STD6001, §7.1.3 a, p. 28]. The MOC is "the maximum oxygen concentration at which
at least five specimens pass the acceptance criteria" [STD6001, §7.1.4 c, p. 29]. It is a pass/fail screening result,
not a physical flame limit like LOC [R1 §3].

**26. JSC 27301.** NASA Johnson Space Center's materials plan for its flight hardware; it requires materials to meet
NASA-STD-6001 [JSC27301, §5.1, p. 51]. For lunar and Martian uses, it says reduced-gravity effects "shall be evaluated"
to ensure Test 1 data are adequately conservative [JSC27301, §5.1.1 i, p. 53].

## Atmosphere and units

**27. psia and kPa; oxygen percent vs partial pressure.** psia is pounds per square inch, absolute (total gas
pressure). REDLINE converts with 1 psia = 6.895 kPa, a standard unit conversion [S4 §3]. Oxygen percent alone is not enough: for Nomex the burning limit followed oxygen partial pressure, so a
fire-resistant fabric can become flammable at lower total pressure [URBAN14, Nomex panel, via R1 §4 rule P].

**28. Exploration atmosphere (8.2 psia / 34% O2).** The lower-pressure, oxygen-enriched cabin air NASA plans for the
Human Landing System, a lunar habitat and the pressurized rover, with control bands expected up to 37% O2 [FERKUL26,
PDF p. 25]. NASA's 2022 life-support baseline recommends it for rovers and surface habitats with frequent spacewalks
and summarizes its pre-breathe as 15 min [R7-S12, §4.6.3.6, p. 142, via R7]. The ISS reference atmosphere is
14.7 psia with about 21% O2 [R7-S4, Table 1, via R7].

## Materials named in REDLINE

**29. PMMA, SIBAL, Nomex.** PMMA is acrylic plastic [REDLINE `data/metadata.json`; LINK18]. SIBAL is a cotton/fiberglass
blend fabric used in BASS-II and Saffire [ZHAO15, p. 2; R5 §4]. Nomex is a fire-resistant aramid fabric (fiber type:
**unverified** in the sources reviewed); a Nomex sample in Saffire-II "could not be ignited even when bathed by a pilot
flame" at the conditions tested [SAF17, PDF p. 26, via R5 §4].

**30. Thin vs thick fuel.** Thin samples (such as fabric) burn through quickly; thick ones (such as acrylic rods) can
also burn in place. Thin and thick samples of the same material can show different oxygen limits [HUANG19, p. 8].

---

## Sources

NASA primary sources first. "via R1/R5/R7" means the fact was taken from a REDLINE research file that cites the
original with a locator; we did not re-open that original for this glossary. [GUIDE] was opened and text-searched for
this glossary on 14 Nov 2026 (PDF page numbers).

| Key | Source | URL |
|---|---|---|
| PSI | NASA Physical Sciences Informatics Data Repository | https://psi.nasa.gov/physci/repo/ |
| PSICAT | NASA, PSI Investigations by Research Area | https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/ |
| PSISEARCH | PSI public investigation search (run 14 Nov 2026) | https://psi.nasa.gov/geode-py/ws/repo/search?size=200&type=investigation |
| PSI-10 | ACME / Flame Design | https://psi.nasa.gov/physci/repo/data/investigations/PSI-10 |
| PSI-20 | ACME Burning Rate Emulator | https://psi.nasa.gov/physci/repo/data/investigations/PSI-20 |
| PSI-21 | ACME Coflow Laminar Diffusion Flame | https://psi.nasa.gov/physci/repo/data/investigations/PSI-21 |
| PSI-22 | ACME Electric-Field Effects | https://psi.nasa.gov/physci/repo/data/investigations/PSI-22 |
| PSI-23 | ACME s-Flame | https://psi.nasa.gov/physci/repo/data/investigations/PSI-23 |
| PSI-25 | Burning and Suppression of Solids-II | https://psi.nasa.gov/physci/repo/data/investigations/PSI-25 |
| PSI-26 | Burning and Suppression of Solids | https://psi.nasa.gov/physci/repo/data/investigations/PSI-26 |
| PSI-39 | Cool Flames Investigation | https://psi.nasa.gov/physci/repo/data/investigations/PSI-39 |
| PSI-47 | DAFT / DAFT-2 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-47 |
| PSI-60 | Computational and Experimental Analysis of SPICE Data Sets | https://psi.nasa.gov/physci/repo/data/investigations/PSI-60 |
| PSI-62 | Concurrent Flame Spread Modeling ... BASS Experiments | https://psi.nasa.gov/physci/repo/data/investigations/PSI-62 |
| PSI-68 | Flame Extinguishment Experiment-2 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-68 |
| PSI-69 | Flame Extinguishment Experiment | https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 |
| PSI-101 | Smoke Aerosol Measurement Experiment-Reflight | https://psi.nasa.gov/physci/repo/data/investigations/PSI-101 |
| PSI-102 | Smoke and Aerosol Measurement Experiment | https://psi.nasa.gov/physci/repo/data/investigations/PSI-102 |
| PSI-106 | Structure and Liftoff In Combustion Experiment | https://psi.nasa.gov/physci/repo/data/investigations/PSI-106 |
| PSI-107 | Smoke Point In Co-flow Experiment | https://psi.nasa.gov/physci/repo/data/investigations/PSI-107 |
| PSI-159 | ACME / Cool Flames Investigation with Gases | https://psi.nasa.gov/physci/repo/data/investigations/PSI-159 |
| GUIDE | NASA, *A Researcher's Guide to ISS Combustion Science* (Oct 2015) | https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf |
| ACME | NASA NTRS 20220015583, *ACME: Advanced Combustion via Microgravity Experiments* | https://ntrs.nasa.gov/citations/20220015583 |
| STD6001 | NASA-STD-6001B w/Change 3, §7.1 Test 1 (via R5 §1, R1) | https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf |
| JSC27301 | NASA JSC 27301 Rev J, §5.1–5.1.1 (via R5 §2) | https://standards.nasa.gov/system/files/tmp/JSC-27301J_Final.pdf |
| FM2WEB | NASA Glenn, *Flammability of Materials on the Moon (FM2)* (via R5 §3) | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/ |
| FERKUL26 | Ferkul et al., *Material Flammability at Lunar and Martian Gravity*, LPSC 2026, NTRS 20260001966 (via R5, R7) | https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf |
| SAFNEWS24 | NASA Glenn, *Flame Burns Out on NASA's Long-Running Spacecraft Fire Experiment* (via R5 §4) | https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/ |
| SAFSHEET | NASA, *Spacecraft Fire Safety Demonstration (Saffire)* fact sheet (via R5 §4) | https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf |
| SAF17 | Ferkul et al., *Results of Large-Scale Spacecraft Flammability Tests*, ICES 2017, NTRS 20170008805 (via R5 §4) | https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf |
| SAF21 | Urban et al., ICES-2021-266, Saffire IV and V, NTRS 20210011521 (via R5 §4) | https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf |
| SAF24 | Urban et al., *Preliminary Results from the Saffire VI Experiment*, ICES-2024-365, NTRS 20240002981 (via R5 §4) | https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf |
| FERKUL16 | Ferkul et al., *Combustion of Solids in Microgravity: Results from the BASS-II Experiment*, NTRS 20160000593 (via R1) | https://ntrs.nasa.gov/api/citations/20160000593/downloads/20160000593.pdf |
| ZHAO15 | Zhao, T'ien, Ferkul, Olson, *Concurrent flame growth, spread and extinction over composite fabric samples ...* (2015) (via R1) | https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf |
| URBAN14 | Urban et al., *Large-Scale Spacecraft Fire Safety Tests* (poster, 2014), NTRS 20150000894 (via R1) | https://ntrs.nasa.gov/citations/20150000894 |
| R7-S4 | Abercromby, Conkin, Gernhardt, *Modeling a 15-min extravehicular activity prebreathe protocol* (2015) (via R7) | https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf |
| R7-S12 | Ewert, Chen, Powell (eds.), *Life Support Baseline Values and Assumptions Document* (2022) (via R7) | https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf |
| LINK18 | Link, Huang, Fernandez-Pello, Olson, Ferkul, *The Effect of Gravity on Flame Spread over PMMA Cylinders*, Sci. Rep. 8, 120 (2018) (peer-reviewed; via R1, S4) | https://www.nature.com/articles/s41598-017-18398-4 |
| HUANG19 | Huang et al., *Transition from Opposed Flame Spread to Fuel Regression and Blow off*, Proc. Combust. Inst. 37 (2019), DOI 10.1016/j.proci.2018.06.022 (peer-reviewed; via R1) | https://ira.lib.polyu.edu.hk/bitstream/10397/89528/1/34_ProCI_2019_buring-spread.pdf |
| OSORIO14 | Osorio, *Effect of Environmental Variables on the Flammability of Fire Resistant Materials*, PhD diss., UC Berkeley (2014) (via R1) | https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf |

REDLINE internal references (not NASA sources; they record where a fact was checked):

| Key | File |
|---|---|
| AGENTS | `AGENTS.md`, "Science rules" |
| S4 | `docs/specs/evidence-engine.md` |
| R1 | `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md` |
| R5 | `origin/task/22-r5-nasa-s-position-standards-fm2-saffire:research/nasa-context.md` |
| R7 | `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md` |
