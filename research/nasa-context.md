# NASA's position: flammability standards, FM2 and Saffire

Issue #22. Sources reviewed 14 November 2026. Research only; no app code.
Every fact carries a source ID from the register at the end, with a page, slide, table or
section locator. Quotes are verbatim and under 15 words; everything else is paraphrase.
Lines marked **Inference** are our reading, not NASA's words.

Page convention: "p. X" is the printed page number. For slide decks without printed page
numbers, "PDF p. X" is the page in the PDF file.

---

## 1. NASA-STD-6001B, Test 1 (Upward Flame Propagation)

Source: [STD6001], section 7.1, printed pp. 27–30 of 158.

**Document status.** NASA-STD-6001B was approved 2011-08-26. Change 3 (2025-6-9) is an
administrative change that revalidates the standard "as-is". [STD6001, cover p. 1; Document
History Log p. 2]

**What it measures.** Purpose: to find whether a material exposed to a standard ignition source
"will self-extinguish and not transfer burning debris, which can ignite adjacent materials."
[STD6001 §7.1.1, p. 27]

**How it is run.**
- The material is tested in the worst-case atmosphere it could be exposed to. [§7.1.2 a, p. 27]
- Five specimens, each 30 cm × 6.5 cm (12 in × 2.5 in), are mounted vertically and tested one at
  a time. [§7.1.2 b, p. 27]
- Each is ignited at the bottom and allowed to burn until it self-extinguishes. [§7.1.2 c, p. 27]
- Burn length is recorded, and so is whether burning debris ignites the paper below the
  specimen. [§7.1.2 d–e, p. 28; §7.1.4 d(1), p. 29]
- The method follows ISO 14624-1:2003 with NASA exceptions. [§7.1.4, p. 29]
- The test gas is a GOX/GN2 mix at the highest oxygen level the material could see in use.
  [§7.1.4 f(1), p. 29]
- "Air shall not be allowed to flow during tests." [§7.1.4 i, p. 30] Gravity-driven
  (buoyant) flow is the only flow present. **Inference:** that follows from a still-air upward
  burn on Earth; the standard does not state it in these words.
- The igniter is a chemical igniter wrapped with nickel-chromium wire. [§7.1.4 k, p. 30]
- Materials are tested in the worst-case configuration. [§7.1.4 e, p. 29]

**Pass/fail criteria.** A material passes and is considered self-extinguishing only if both
hold [§7.1.3 a, p. 28]:
1. "No test specimen of the five standard-sized specimens burns >15 cm (6 in)."
2. "No test specimen propagates a flame by the transfer of burning debris."

Also: "Failure of any one specimen constitutes failure of the material in that test environment."
[§7.1.4 d(2), p. 29]

**Maximum Oxygen Concentration (MOC).** Defined as "the maximum oxygen concentration at which at
least five specimens pass the acceptance criteria." [§7.1.4 c, p. 29] Finding the MOC is
recommended when the worst-case environment is uncertain. [§7.1.4 f(1), pp. 29–30]

**Gravity.** A text search of the extracted standard for "gravity" (which also matches
"microgravity") returned no hits. Nothing about reduced gravity was found in the extracted
text of NASA-STD-6001B w/Change 3. The reduced-gravity caveat comes from JSC 27301 (section 2).

**Test atmospheres used in practice.** A 2026 NASA presentation says Test 1 has historically been
run at 30% O2, 10.2 psia, described as the Shuttle pre-EVA atmosphere. [FERKUL26, PDF p. 27]
**Inference:** this is one presenter's summary, not a requirement in the standard. The standard
itself requires the worst-case use atmosphere.

---

## 2. JSC 27301 Rev J, section 5.1.1 (Flammability Control)

Source: [JSC27301], "Materials and Processes Selection, Control, and Implementation Plan for JSC
Flight Hardware", Rev J, 31 July 2025, 125 pp. Section 5.1.1 is on printed pp. 51–53.

**Scope.** It is a JSC plan for JSC-developed flight hardware. [JSC27301 catalog page, "Scope"]
NASA's standards catalog lists it as not a NASA mandatory standard. [JSC27301 catalog page]

**Baseline rule.** Section 5.1 requires materials to meet NASA-STD-6001. [§5.1, p. 51] Section 5.1.1
requires materials that are nonflammable or self-extinguishing in their use configuration, per
NASA-STD-6001 Test 1 or an appropriate configurational test, with listed exceptions (a–i).
[§5.1.1, p. 51] Under section 5.0, deviations need an approved Materials Usage Agreement (MUA).
[§5.0, p. 51]

**What it says about reduced gravity (exact items):**
- **Exception e, microgravity.** Materials that pass NASA-STD-6001 may be used in microgravity at
  lower oxygen concentration without further testing. The oxygen partial pressure must not
  exceed the test level, unless data show that the lower concentration outweighs the higher
  partial pressure. [§5.1.1 e, p. 52]
- **Note under e, lunar/Martian gravity.** The plan states it is established that
  "earth gravity is a less severe environment for flammability" than lunar and Martian gravity.
  It gives the reason as Earth's natural convection producing flows above the optimum
  for combustion. [§5.1.1 e note, p. 52]
- **Same note, open study.** It says studies are in progress on whether NASA-STD-6001 testing
  at higher oxygen than the use level can be used to determine flammability in lunar gravity.
  [§5.1.1 e note, p. 52]
- **Requirement i.** For lunar and Martian applications, reduced-gravity effects "shall be
  evaluated to ensure that the data from NASA-STD-6001 testing are adequately conservative."
  [§5.1.1 i, p. 53]
- **Evidence cited under i.** Limited drop-tower partial-gravity testing shows "materials may be
  more flammable in partial gravity environments than in Earth gravity." [§5.1.1 i, p. 53]
- **Earth-gravity data.** Under h, the plan notes that MAPTIS similarity data are all from Earth-gravity
  testing. [§5.1.1 h, p. 53]

**Related item (not gravity).** Note under g: a 25 W ignition threshold at 34% O2, 15 psia is
called "incorrect and unconservative". It recommends using under 2 W short-circuit power when
specific data are absent. [§5.1.1 g note, pp. 52–53]

**Inference:** NASA's own JSC plan already flags that 1 g Test 1 data may not be conservative
for the Moon, and requires that this be evaluated. REDLINE must present this as NASA's known
concern, not as a gap REDLINE discovered.

---

## 3. FM2: Flammability of Materials on the Moon

**What it is.** A sealed, autonomous combustion chamber that burns four samples one at a time on
the lunar surface. NASA calls it the first combustion experiment on another planetary body.
[FM2WEB, "Background"; "Approach and Hardware"] PI: Paul Ferkul (USRA). Co-Is: Ya-Ting Liao
(CWRU) and Michael Johnston (GRC). PM: Amber Krauss (GRC). [FM2WEB, "Contact Information"]

**Hypothesis.** Modeling, parabolic-flight and ISS work suggest that "materials may burn at lower
oxygen concentrations in lunar gravity compared to Earth". [FM2WEB, "Background"] The 2026
presentation says lunar gravity is "nearly the most flammable condition" in numerical and
experimental evidence. Its stated reason: the oxygen needed for flammability reaches a minimum
near lunar g. [FERKUL26, PDF p. 18]

**Objectives (official web page)** [FM2WEB, "Objectives"]:
1. "Conduct the first-ever observations and measurements of flame spread on the Moon."
2. Verify whether some materials may be more flammable in partial gravity than at 1 g.
3. "Provide a bridge between the standard 1g material screening method and actual behavior".

**Objectives (2026 presentation, more specific)** [FERKUL26, PDF p. 9]:
- Run lunar-surface flammability tests important to NASA's Human Landing System (HLS).
- Help validate Phase 3 HLS/NESC flammability testing, and find the flammability limit of one
  material per flight at 8.2 psia, upward burning.
- Test the partial-g hypothesis: ignition, growth, extinction oxygen and spread, compared with 1 g.
- Bridge the 1 g screening method and reduced-gravity behavior.

**Planned conditions: two published versions. Do not merge them.**

| Version | Atmospheres | Samples | Source |
| --- | --- | --- | --- |
| 2024 posters | 21% O2 at 14.7 psia and 34% O2 at 8.2 psia | 2 SIBAL fabric (cotton/fiberglass) in air; 2 PMMA (acrylic) rods in normoxic exploration atmosphere; one of each upward, one downward | [FM2POSTER24, Introduction]; [FM2ASGSR24, abstract] |
| 2026 "current concept" after replanning | Four tests at 8.2 psia (±0.3 psi), starting at 37%, 33%, 29%, 25% O2, balance N2 | Fabric sheets (Synergy Pro "Navy"), 2 cm × 20 cm exposed, hot-wire ignition at bottom (upward) | [FERKUL26, PDF pp. 5, 10] |

- The 2026 deck says NASA's Biological and Physical Sciences (BPS) management asked for closer
  alignment with exploration needs. The team proposed testing a material from HLS/NESC Phase 3.
  [FERKUL26, PDF p. 4]
- Concept: material expected lunar LOC of 24–26%; the 25% test "not expected to ignite". It would
  add margin if the limit is lower than expected. [FERKUL26, PDF p. 5]
- Diagnostics: two cameras (≥20 frames/s), two radiometers, and O2, CO2, CO and humidity
  sensors. [FERKUL26, PDF p. 11] Chamber volume 14.4 L; atmosphere refreshed between burns.
  [FERKUL26, PDF p. 6]
- Candidate materials considered include Nomex, a Teflon fabric, Kevlar webbing, PBI, silicone
  rubbers, Kapton tape and PTFE/polyimide wire. [FERKUL26, PDF p. 14, table] **Inference:** this
  is a candidate list for down-selection, not a test plan.
- Context: HLS, lunar habitat and pressurized rover will "nominally use 8.2 psia / 34% O2". Control
  bands are expected to allow up to 37% O2. [FERKUL26, PDF p. 25]

**Delivery and status. No flight date is stated in any official source reviewed.**
- 2024 posters: delivery on CLPS lander mission CP-21. [FM2POSTER24, Introduction; FM2ASGSR24,
  abstract]. The same 2024 poster's "Future Work" names the SpaceX HLS demonstration flight,
  with flight hardware built by ZIN Technologies. [FM2POSTER24, Future Work; Acknowledgements]
- 2026: "Delivered to the Lunar Surface by the SpaceX uncrewed demo". [FERKUL26, PDF p. 6]
  Flight engineering model photographs are shown. [FERKUL26, PDF p. 7]
- The laboratory prototype became operational in summer 2024. [FM2ASGSR24, abstract]
- The NASA FM2 page (last updated 12 Aug 2026) gives no launch date or lander. [FM2WEB]
- **Inference:** the latest official source names the SpaceX uncrewed HLS demo. Earlier documents
  say CLPS CP-21. REDLINE should say "planned to fly to the Moon" and give no date or vehicle,
  or cite FERKUL26 for the vehicle.

**Relevance to REDLINE (inference).** Every FM2 data point will be one material in one atmosphere.
Most combinations in a cabin material list will still be "not found in the sources reviewed" after
FM2. That is why REDLINE's suggested-experiment list is complementary.

---

## 4. Saffire: large-scale spacecraft fire experiments (Saffire I–VI)

Six uncrewed experiments flew in Cygnus cargo vehicles after they left the ISS, before reentry, from 2016 to January 2024.
[SAFNEWS24; SAFSHEET]

**Program objectives.**
- Saffire-I: flame spread of a large-scale fire (spread rate, mass consumption, heat release).
- Saffire-II: verify oxygen flammability limits in low gravity.
- Saffire-III: same as I at higher flow speed.
- The program also aimed to "Evaluate NASA's normal-gravity material flammability screening test" in
  low gravity, and to validate fire-response models.
- [SAF17, PDF p. 4]
- Series objectives also included assessing fire impact on the spacecraft and demonstrating
  combustion-product measurement and post-fire cleanup. [SAF21, p. 2]

**What was measured (by flight).**

| Flight | Samples (as reported) | Conditions | Measurements / findings | Source |
| --- | --- | --- | --- | --- |
| Saffire-I (2016) | Cotton-fiberglass (SIBAL) 40.6 × 94 cm | 20 cm/s flow; ~21.7% O2 (ISS reading) | Concurrent and opposed spread; a steady flame was reached even for a wide sample in concurrent flow, unlike 1 g. Spread was slower than in smaller ducts. | [SAF17, PDF pp. 14, 26] |
| Saffire-II (2016) | 9 samples, 5 cm wide: silicone, SIBAL, PMMA, PMMA+Nomex HT90-40 | 20 cm/s (one at 25 cm/s); ~22% O2 | Silicone flammability appeared reduced vs 1 g at flows tested. Nomex "could not be ignited even when bathed by a pilot flame." | [SAF17, PDF pp. 9, 24, 26, 29 Table I] |
| Saffire-III (2017) | Same SIBAL as Saffire-I at higher flow | — | Higher-flow repeat of Saffire-I | [SAF17, PDF p. 4; SAFSHEET] |
| Saffire-IV (2020) | SIBAL 50 cm; 2-sided PMMA 18 cm (40 cm wide) | 20 cm/s concurrent; 100.0 kPa; 22.0% O2 | Heat release, spread rate, vehicle effects | [SAF21, p. 3 Table 1] |
| Saffire-V (2021) | Cotton jersey 50 cm; 1-sided PMMA 18 cm; structured PMMA 20 cm | 20 cm/s; 70.7–72.6 kPa; 25.4–26.2% O2; one opposed | As above; surface structure mattered for spread | [SAF21, p. 3 Table 1; p. 10] |
| Saffire-VI (2023–24) | SIBAL 50 cm; 2-sided PMMA 18 cm; 1-sided PMMA 18 cm; Nomex 7 cm (all 41 cm wide) | 20 cm/s concurrent; 54.1–55.2 kPa; 28.8–31.0% O2 | Nomex sample "did not ignite"; heat release vs vehicle CO2/CO/temperature | [SAF24, abstract p. 1–2; p. 3 Table 1; p. 4] |

Saffire IV–V measured video, flame spread rate, flame temperatures, radiant output, oxygen-calorimetry heat
release, CO2 and temperature at six vehicle locations, and CO2, CO, O2, HF and HCl.
They also measured vehicle pressurized volume and aerosols. [SAF21, abstract pp. 1–2] Heat release reached up to 10 kW; average vehicle
conditions did not reach unacceptable levels. [SAF21, abstract p. 2]

Saffire-VI preliminary conclusions: fires of 1.5–3.2 kW raised temperature significantly only near
the fire. CO2 and CO rose significantly; PMMA tests exceeded the 1-hour CO2 and 24-hour CO limits.
A typical smoke-alarm threshold was reached only at 981 s. [SAF24, §IV Conclusion, p. 6] The authors
say further work is needed to extend results to partial gravity. [SAF24, §IV, p. 6]

**What Saffire says about Test 1.** [SAF21, §III, p. 10; §IV, p. 11]
- Test 1 "does not correspond to overall fire behavior in low gravity."
- The authors say Test 1 is quite successful at identifying highly flammable materials. They add that
  it "cannot be assumed to indicate that a material will not burn" in low gravity.
- Thick-fuel flame growth differed from Test 1: "This does not invalidate the test but does
  affect the interpretation."
- Observations are to be incorporated into fire safety requirements for exploration vehicles.

**Atmosphere note (inference).** Saffire-VI (about 54–55 kPa, 29–31% O2) is close to, but not the
same as, the planned 8.2 psia (56.5 kPa) / 34% O2 exploration atmosphere. Saffire was microgravity
with forced flow, not lunar gravity. Saffire results must not be shown as lunar results.

**Which Saffire reports are public (found in this review).**

| Item | ID | Status in this review |
| --- | --- | --- |
| Results of Large-Scale Spacecraft Flammability Tests (ICES 2017 presentation, Saffire I–II) | NTRS 20170008805 | Opened and read [SAF17] |
| Saffire: A Novel Approach to Study of Spacecraft Fire Safety Using Un-manned Spacecraft (ASGSR 2017 presentation) | NTRS 20180005168 | Opened; title page only checked |
| Fire Safety Implications of Preliminary Results from Saffire IV and V (ICES-2021-266) | NTRS 20210011521 | Opened and read [SAF21] |
| Saffire ICES 2021 presentation | NTRS 20210017780 | Found in search; not opened |
| Preliminary Results from the Saffire VI Experiment (ICES-2024-365) | NTRS 20240002981 | Opened and read [SAF24] |
| Saffire ICES 2024 presentation | NTRS 20240007488 | Found in search; not opened |
| NASA PSI catalog: SAFFIRE-I, -II, -III listed as "Complete" under Combustion Science | PSI catalog page | Listed [PSICAT]; IV–VI not listed there. Raw data not accessed |
| PSI record PSI-98 (possibly SAFFIRE-I per issue #33 branch) | psi.nasa.gov | Inaccessible (JavaScript shell); contents not verified |

Raw Saffire datasets (for IV–VI) were not found in the sources reviewed.

---

## 5. What NASA already knows vs what is still open

NASA already knows, and has written down, that its 1 g screening test may not be conservative
off Earth. Its JSC materials plan says Earth gravity is less severe for flammability than lunar
gravity, and it requires reduced-gravity effects to be evaluated. [JSC27301 §5.1.1 e note, i, pp. 52–53]
Its Saffire team showed in orbit that passing Test 1 cannot be assumed to mean a material will not burn in low
gravity. The same team still calls the test useful. [SAF21 p. 10] NASA built FM2 specifically to test
the lunar-gravity hypothesis and to bridge 1 g screening and reduced-gravity behavior.
[FM2WEB; FERKUL26 PDF p. 9] Meanwhile it plans 8.2 psia / 34% O2 (up to 37%) cabins.
[FERKUL26 PDF p. 25] What is still open, by NASA's own account: no material has yet been burned on the
Moon, and FM2 has not flown in the sources reviewed. Whether higher-oxygen Test 1 results can stand in
for lunar gravity is "in progress". [JSC27301 §5.1.1 e note, p. 52] Partial-gravity data come from
short drop-tower and aircraft tests. [FERKUL26 PDF pp. 3, 20] Saffire's authors say extension to partial gravity needs further
work. [SAF24 p. 6] **Inference / REDLINE framing:** REDLINE does not find something NASA missed. It
organises NASA's published data, for one cabin material list, so a user can see which
combinations are covered and which are not found in the sources reviewed.
Untested combinations become candidate questions for the work NASA already has under way.

### Wording rules for REDLINE (inference, derived from the above)
- Say: "NASA's own materials plan flags this" (cite JSC27301 §5.1.1 i). Never say "NASA overlooked".
- Say: "passed NASA-STD-6001 Test 1 at X% O2", not "fire-safe" or "nonflammable on the Moon".
- Say: "not found in the sources reviewed", never "never tested".
- FM2: "planned"; no flight date. Saffire: "microgravity, forced flow", never "lunar".

---

## Source register

- **[STD6001]** NASA, *Flammability, Offgassing, and Compatibility Requirements and Test
  Procedures*, NASA-STD-6001B w/Change 3 (approved 2011-08-26; Change 3 revalidated 2025-6-9).
  https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf
  Locators: cover p. 1; history log p. 2; §7.1 pp. 27–30.
- **[JSC27301]** NASA JSC, *Materials and Processes Selection, Control, and Implementation Plan
  for JSC Flight Hardware*, JSC 27301 Rev J, 31 July 2025.
  PDF: https://standards.nasa.gov/system/files/tmp/JSC-27301J_Final.pdf .
  Catalog: https://standards.nasa.gov/standard/JSC/JSC-27301 . Locators: §5.0–5.1.1, printed pp. 51–53 of 125.
- **[FM2WEB]** NASA Glenn, *Flammability of Materials on the Moon (FM2)*, page last updated 12 Aug 2026.
  https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/
  (same content at https://www.nasa.gov/flammability-of-materials-on-the-moon-fm2/). Locators: section headings
  "Background", "Objectives", "Approach and Hardware", "Contact Information". Read via web fetcher; HTML, no page numbers.
- **[FERKUL26]** Ferkul, Kralik, Liao, Johnston, *Material Flammability at Lunar and Martian Gravity*,
  Lunar and Planetary Science Conference, 16–20 March 2026. NTRS 20260001966.
  https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf
  Locators: PDF pages (slide label "Page N" = PDF p. N+1).
- **[FM2POSTER24]** Zayac, Johnston, Ruff, Ferkul, *Flammability of Materials on the Moon*, poster, 2024 Glenn Space Technology
  Symposium (15–17 July 2024). NTRS 20240008623.
  https://ntrs.nasa.gov/api/citations/20240008623/downloads/20240008623.pdf . Single-page poster; cited by panel.
- **[FM2ASGSR24]** Zayac, Johnston, Ruff, Ferkul, *Flammability of Materials on the Moon*, poster, ASGSR Annual Meeting,
  3–7 Dec 2024. NTRS 20240015307. https://ntrs.nasa.gov/citations/20240015307 . Locator: NTRS abstract (read via web fetcher).
- **[SAF17]** Ferkul, Olson, Urban, Ruff, Easton, T'ien, Liao, Fernandez-Pello, Torero, Eigenbrod, Legros, Smirnov, Fujita,
  Rouvreau, Toth, Jomaas, *Results of Large-Scale Spacecraft Flammability Tests*, ICES 2017 presentation, Charleston SC.
  NTRS 20170008805. https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf . Locators: PDF pages; Table I PDF p. 29.
- **[SAF21]** Urban, Ruff, Ferkul, et al., *Fire Safety Implications of Preliminary Results from Saffire IV and V
  Experiments on Large Scale Spacecraft Fires*, ICES-2021-266. NTRS 20210011521.
  https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf
  Locators: printed pp. 1–3 (abstract, Table 1), p. 10 (Test 1 discussion), p. 11 (§IV Summary).
- **[SAF24]** Urban, Ruff, Ferkul, et al., *Preliminary Results from the Saffire VI Experiment*, ICES-2024-365.
  NTRS 20240002981. https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf
  Locators: abstract pp. 1–2; Table 1 p. 3; Nomex note p. 4; §IV Conclusion p. 6. Preliminary; may be revised.
- **[SAFNEWS24]** NASA Glenn, *Flame Burns Out on NASA's Long-Running Spacecraft Fire Experiment*, 14 Feb 2024.
  https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/
  (read via web fetcher; no numeric atmosphere values given there).
- **[SAFSHEET]** NASA, *Spacecraft Fire Safety Demonstration (Saffire)* fact sheet.
  https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf . Locators: Saffire-I to -IV paragraphs, p. 1.
- **[PSICAT]** NASA, *PSI Investigations by Research Area*, page last updated 26 Jul 2023.
  https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/ . Locator: "Combustion Science".

## Access notes and cross-branch review
- All PDFs above were downloaded and text-extracted locally with `pdftotext`; the web fetcher alone returned
  no readable PDF text. FM2WEB, FM2ASGSR24, SAFNEWS24 and PSICAT are HTML pages read via the web fetcher.
- PSI record PSI-98 returned only a JavaScript shell; contents not verified.
- A July 2026 press article mentioned a late-2026 launch target. It is not an official NASA source, so no date is used here.
- Other branches read via `git show`. `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md`
  cites the same Test 1 locators (§7.1.2–7.1.4, pp. 27–29), consistent with this file.
  `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md` uses FERKUL26 p. 24 for 8.2 psia / 34% O2,
  consistent with PDF p. 25 here. `origin/task/33-w1-draft-the-submission-write-up-data-ai:docs/submission-draft.md` lists
  SAFFIRE PSI entries without data; consistent with PSICAT. Branch #19 had no research files.
