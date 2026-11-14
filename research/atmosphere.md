# Cabin atmospheres and EVA pre-breathe evidence

Issue #24; NASA sources reviewed 14 November 2026. Research only. This supports an illustrative comparison, not mission planning or medical decisions. Source IDs below resolve to titles, URLs and exact locators. No direct quotations are used.

## Atmosphere presets and where they belong

| Pressure (absolute); oxygen fraction | Published context | Evidence status and source |
| --- | --- | --- |
| 8.2 psia; 34% O2, 66% N2 | HLS, lunar habitat and pressurized rover nominal atmosphere in a 2026 NASA presentation | Published planning description, not evidence of flight operation or a final vehicle requirement. [S1, printed p.24 / PDF p.25] |
| 8.2 psia; 34% O2 | NASA's rover assessment describes HLS planning at this atmosphere and recommends rover compatibility with HLS/habitat pressure and oxygen concentration | Design assessment / compatibility recommendation. [S2, Table 7, printed p.16 / PDF p.23] |
| 10.2 psia; 26.5% O2 | Shuttle staged decompression cabin and ISS airlock campout | Established historical operational setting; ISS campout uses the airlock, not a change to the whole station. A fixed HLS/rover/habitat assignment for this exact pair was not found in the sources reviewed. [S3, printed p.7 / PDF p.17] |
| 14.7 psia; about 21% O2 | ISS reference atmosphere; S4 gives 20.8% in its technical comparison | Established reference, not a claim that every exploration cabin uses this pair. [S4, Table 1, journal p.77 / PDF p.2] |

## Published pre-breathe durations: preserve the protocol context

All durations below are oxygen pre-breathe or source-defined protocol comparison values, not total time from deciding to leave a cabin to starting EVA.

| Starting / saturation atmosphere | Published microgravity comparison | Published planetary comparison | Interpretation |
| --- | --- | --- | --- |
| 14.7 psia / 21% O2 | 4 h | 6 h 30 min–7 h | S5 reports the first as a microgravity comparator and explicitly labels the planetary column estimated. The resting in-suit 4 h procedure is also documented by S6. |
| 10.2 psia / 26.5% O2 | 40–70 min | 3 h–3 h 30 min | S5 comparison values; the short time must not erase prior staged exposure. Planetary values are estimates. |
| 8.2 psia / 34% O2 | 0–15 min | 0–30 min | S5 short-protocol estimates, not a demonstrated zero-time lunar procedure. S4 separately models a 15 min protocol and requires ground validation before operational implementation. |

**Source and assumptions for the whole comparison table:** [S5, final slide, PDF p.38, “Beyond 8.2/34 for Exploration Prebreathe”]. Its footnote assumes a 6 h EVA at 4.3 psia suit pressure; it includes an unvalidated / unavailable-for-flight-use annotation. Preserve that limitation for the exploratory short-time values. Do not present the planetary column as measured lunar results or apply it to other suit pressures.

### Why 40 minutes is not the complete 10.2 psia procedure

S3 documents the Shuttle sequence: initial 60 min mask oxygen breathing (45 min before depressurization), at least 12 h at 10.2 psia / 26.5% O2, then 40–75 min in-suit oxygen breathing before reaching 4.3 psia. With more than 36 h at the intermediate pressure, the initial mask period was omitted. Its historical ISS campout description instead includes 8 h 40 min at reduced pressure, a 70 min mask period during a return to station pressure, and a final 50 min in-suit period. These are different sequences, not interchangeable totals. [S3, printed p.7 / PDF p.17]

S6 describes a past resting in-suit protocol: 4 h breathing 100% oxygen at 14.7 psia. It also describes exercise and campout alternatives; therefore 4 h is a particular protocol, not the unique time implied by that cabin atmosphere. [S6, p.11]

## Status, uncertainty and illustrative-slider specification

- **Established historical operation:** the ISS reference atmosphere and Shuttle/ISS staging settings above; their documented procedures remain tied to their own conditions. [S3; S4 Table 1; S6 p.11]
- **Proposed / planned atmosphere:** the exploration preset is explicitly associated with surface vehicles, but atmosphere selection alone does not validate a pre-breathe procedure. [S1 p.24; S2 Table 7; S4 abstract]
- **Modeled / estimated duration:** S4's 15 min result is a preliminary model assessment, not a human trial of that protocol. S5's planetary ranges are explicitly estimates. [S4 abstract, journal p.76 / PDF p.1; S5 PDF p.38]
- **Current source limitation:** S6 Revision D still describes Exploration Atmosphere studies and working/step-down pre-breathe as future options. A final flight-approved planetary protocol for each preset was not found in the sources reviewed. This is a bounded search result, not a claim that no further tests or approvals exist. [S6 p.13]

**REDLINE recommendation / inference:** show discrete pressure-and-oxygen presets with separate microgravity and estimated-planetary labels. Display ranges and a protocol-context note; do not fit a continuous oxygen-to-time curve. At intermediate slider positions, show “pre-breathe duration not found in the sources reviewed.” Do not interpolate a medical result, equate the lower endpoint with permission to skip pre-breathe, or compute mission-specific DCS risk. This is an author recommendation based on the protocol differences and assumptions above, not a NASA requirement.

## Source register

- **S1 — Ferkul et al., _Material Flammability at Lunar and Martian Gravity_**, Lunar and Planetary Science Conference, March 2026. NASA NTRS 20260001966. https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf . Locator: printed p.24 (PDF p.25), atmosphere-planning bullets. Treat as presentation-level planning evidence.
- **S2 — Holladay et al., _NASA Engineering and Safety Center Lunar Rover Design Concepts Assessments_**, NASA/TM-20240014203, November 2024. https://ntrs.nasa.gov/api/citations/20240014203/downloads/11-15-24%2020240014203.pdf . Locator: Table 7, pressure/O2 levels row, printed p.16 (PDF p.23).
- **S3 — Conkin, _Preventing Decompression Sickness Over Three Decades of Extravehicular Activity_**, NASA/TP-2011-216147, June 2011. https://www.nasa.gov/wp-content/uploads/2023/03/conkin-prebreathe-overview-tp216147-2011.pdf . Locator: printed p.7 (PDF p.17), Shuttle staged protocol and “International Space Station Campout.” Historical description, not a present operations checklist.
- **S4 — Abercromby, Conkin and Gernhardt, _Modeling a 15-min extravehicular activity prebreathe protocol using NASA's exploration atmosphere (56.5 kPa/34% O2)_**, Acta Astronautica 109 (2015), 76–87; NASA-hosted full paper. https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf . Locators: abstract, p.76 (PDF p.1), validation limitation; Table 1 and section 1, p.77 (PDF p.2), atmospheres and proposed model. The paper's modeled scenarios must not be reduced to a validated 15 min rule.
- **S5 — _Human Health and Performance_**, NASA EVA Exploration Workshop, 18 February 2020, NTRS 20200001073. Catalog/title/date: https://ntrs.nasa.gov/citations/20200001073 . Full PDF: https://ntrs.nasa.gov/api/citations/20200001073/downloads/20200001073.pdf?attachment=true . Locator: final slide, PDF p.38, “Beyond 8.2/34 for Exploration Prebreathe,” comparison table, footnote and validation annotation. Underlying reports cited in that slide were not independently reviewed here.
- **S6 — NASA OCHMO, _Decompression Sickness (DCS) Risk Mitigation_**, NASA-STD-3001 Technical Brief OCHMO-TB-037, Revision D, 5 October 2026. https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-037-decompression-sickness.pdf . Locators: p.11, past protocols; p.13, future options. The URL's directory date is not its revision date. This brief is reference material and does not supersede requirements (page footers).

## Access and cross-branch review

All six cited PDFs yielded readable text. S5 initially timed out without its query parameter; the linked attachment URL succeeded. A screenshot request for S5 failed with a cache miss; the comparison was transcribed from the accessible PDF text, not an inspected image. No content was inferred from the failed fetch.

Fetched branches inspected with git branch -r and git ls-tree: origin/task/18-r1-evidence-table-spec-and-comparability and origin/task/19-r2-bass-ii-psi-25-data-access-and-draft contained no research files. Read origin/task/33-w1-draft-the-submission-write-up-data-ai:docs/submission-draft.md with git show; it supplied no atmosphere dataset to reuse. Cross-agent atmosphere evidence was unavailable at review time; this note proceeds from NASA sources directly. No app, UI, configuration or scaffold was created.
