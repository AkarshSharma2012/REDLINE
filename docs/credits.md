# Credits and data attributions

Inventory date: 15 November 2026. Scope: `data/metadata.json` and all files in `research/` on this branch. Research citations include context, excluded candidates and access attempts; inclusion here does **not** mean a source supplies production evidence. Follow the linked research note for authors, publication details, page/figure locators, extraction decisions and verification status. New sources added after this snapshot need corresponding credits.

## NASA content and reuse

**Source: NASA ? Physical Sciences Informatics (PSI) Data Repository, NASA Technical Reports Server (NTRS), and the NASA programs and named authors credited below. Adaptation, selection, unit conversion, summaries and interpretations: REDLINE / Interlake Embers.**

NASA's [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) ask that NASA be acknowledged as the source, prohibit implying endorsement, and retain restrictions on identified third-party content. They do not prescribe a universal bibliography template. This register supplies agency, title/identifier, author/year where recorded, source link and local provenance. NASA hosting alone does not establish that a journal article or third-party figure is public domain: item-specific rights and any required permission remain **unverified** unless explicitly recorded. Preserve original creator/copyright credit when reproducing such an item. NASA insignia and identifiers have separate protections; this credit grants no logo rights. REDLINE is an independent challenge project; no NASA endorsement is claimed.

The primary dataset is the [NASA Physical Sciences Informatics Data Repository](https://psi.nasa.gov/). We credit its investigators and contributing research teams, not just the repository host. PSI descriptions, experimental tables and published results have different roles; catalog summaries are not substituted for run outcomes. No blanket claim of downloading or reprocessing every raw archive is made.

## Production metadata source register

These entries reproduce the bibliographic fields in [data/metadata.json](../data/metadata.json). Their presence is verified locally; external content and complete author lists were not independently rechecked for this credits task. Missing authors and abbreviated lists remain **unverified/incomplete**. NASA is the host/source provider; authors retain their scientific attribution.

| Key | Authors / year recorded | Report or paper | Provider |
|---|---|---|---|
| `ZHAO15` | Zhao, T'ien, Ferkul and Olson (2015) | [Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) | NASA / NTRS |
| `SAFFIRE21` | Urban et al. (2021) | [Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf) | NASA / NTRS |
| `BASS2-TM` | Not stated in extraction (2021) | [Burning and Suppression of Solids-II (BASS-II) Summary Report; NASA/TM-20210011385](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf) | NASA / NTRS |
| `US25` | Urban et al. (2025) | [Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results (presentation)](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf) | NASA / NTRS |
| `OF12` | Olson and Ferkul (2012) | [Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf) | NASA / NTRS |
| `M25` | Not stated in extraction (2025) | [Material Ignition and Suppression Test (MIST) in Space Exploration Atmospheres, NASA Task Book FY2025](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225) | NASA / Task Book |
| `R7-S4` | Abercromby, Conkin and Gernhardt (2015) | [Modeling a 15-min extravehicular activity prebreathe protocol](https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf) | NASA / nasa.gov |
| `R7-S5` | NASA (2020) | [Human Health and Performance, NASA EVA Exploration Workshop](https://ntrs.nasa.gov/api/citations/20200001073/downloads/20200001073.pdf?attachment=true) | NASA / NTRS |
| `R7-S7` | Garbino et al. (2024) | [Development, Validation and Approval of A Planetary Extravehicular Activity Prebreathe Protocol: NASA Exploration Atmosphere Tests 1 & 2](https://ntrs.nasa.gov/citations/20230015380) | NASA / NTRS |
| `R7-S12` | Ewert, Chen and Powell (editors) (2022) | [Life Support Baseline Values and Assumptions Document](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf) | NASA / NTRS |

**MIST access caveat:** `M25` retains an obsolete numeric report URL. [verify-other.md](../research/verify-other.md) reports access failure; [verify-pmma.md](../research/verify-pmma.md) reports the [FY2025 replacement PDF](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A4E891655E49E9A6A0353DF3D9B4DE14) and credits PI C. Fernandez-Pello. This task has not independently verified the replacement or changed metadata. `BASS2-TM` author metadata is incomplete; the research notes credit Olson et al. and direct readers to the report title page. The 2025 lunar presentation and corrected paper are distinct artifacts, not interchangeable citations.

## Research source register

Each distinct external URL in `research/` is retained below (page fragments deduplicated; download queries preserved). Labels are taken from research links when available, otherwise an accession or file identifier is used rather than inventing a title. Local notes provide the full citation context. **Verification status for every entry: source identity/content, current availability, full author list and reuse rights are unverified independently by this credits task.** Prior checks, failures and exclusions remain documented in the linked notes; this register does not upgrade their status. Non-NASA papers and competitor references are credited to their original authors/owners, not to NASA.

### PSI datasets and repository services

| Source / artifact | Research provenance |
|---|---|
| [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=67a3a17b09ed061032c19775&version=1&studyVersion=4) | [bass2-rows.csv](../research/bass2-rows.csv), [bass2.md](../research/bass2.md), [verification-input-bass2-rows.csv](../research/verification-input-bass2-rows.csv), [verification-report.md](../research/verification-report.md) |
| [PSI Data Repository, BASS-II investigation PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) | [bass2.md](../research/bass2.md), [evidence-additions.md](../research/evidence-additions.md), [investigations-sources.md](../research/investigations-sources.md), [rows-sibal.md](../research/rows-sibal.md) |
| [NASA PSI-25](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25) | [bass2.md](../research/bass2.md), [investigations-sources.md](../research/investigations-sources.md) |
| [v2](https://psi.nasa.gov/geode-py/ws/files/v2) | [bass2.md](../research/bass2.md) |
| [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=692480587f6aa6a830210602&version=2&studyVersion=4) | [bass2.md](../research/bass2.md) |
| [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=6924803a7f6aa6a8302103cc&version=2&studyVersion=4) | [bass2.md](../research/bass2.md) |
| [download](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?file=PSI-25_Science%20Documents_BASS-II_Test.Matrices.xlsx&redirect=false) | [bass2.md](../research/bass2.md) |
| [download](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?file=PSI-25_Reference%20Data_Fan%20calibration%20data.xlsx&redirect=false) | [bass2.md](../research/bass2.md) |
| [Physical Sciences Informatics repository](https://psi.nasa.gov/) | [evidence-additions.md](../research/evidence-additions.md), [material-aliases.md](../research/material-aliases.md), [rows-cellulose.md](../research/rows-cellulose.md), [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md), [rows-saffire1.md](../research/rows-saffire1.md), [rows-saffire2.md](../research/rows-saffire2.md), [rows-saffire3.md](../research/rows-saffire3.md), [rows-saffire4.md](../research/rows-saffire4.md), [rows-saffire56.md](../research/rows-saffire56.md) |
| [Burning and Suppression of Solids](https://psi.nasa.gov/physci/repo/data/investigations/PSI-26) | [evidence-additions.md](../research/evidence-additions.md), [investigations-sources.md](../research/investigations-sources.md) |
| [Spacecraft Fire Safety Experiment-I](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98) | [evidence-additions.md](../research/evidence-additions.md), [investigations-sources.md](../research/investigations-sources.md) |
| [Spacecraft Fire Experiment-II](https://psi.nasa.gov/physci/repo/data/investigations/PSI-99) | [evidence-additions.md](../research/evidence-additions.md), [investigations-sources.md](../research/investigations-sources.md) |
| [Spacecraft Fire Experiment-III](https://psi.nasa.gov/physci/repo/data/investigations/PSI-100) | [evidence-additions.md](../research/evidence-additions.md), [investigations-sources.md](../research/investigations-sources.md) |
| [PSI repository](https://psi.nasa.gov/physci/repo/) | [investigations-sources.md](../research/investigations-sources.md) |
| [public search](https://psi.nasa.gov/geode-py/ws/repo/search?size=200&type=investigation) | [investigations-sources.md](../research/investigations-sources.md) |
| [Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-142) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-142](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-142) | [investigations-sources.md](../research/investigations-sources.md) |
| [Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography](https://psi.nasa.gov/physci/repo/data/investigations/PSI-62) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-62](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-62) | [investigations-sources.md](../research/investigations-sources.md) |
| [Computational and Experimental Analysis of SPICE Data Sets](https://psi.nasa.gov/physci/repo/data/investigations/PSI-60) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-60](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-60) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-26](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-26) | [investigations-sources.md](../research/investigations-sources.md) |
| [Structure and Liftoff In Combustion Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-106) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-106](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-106) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-98](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-98) | [investigations-sources.md](../research/investigations-sources.md) |
| [Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis](https://psi.nasa.gov/physci/repo/data/investigations/PSI-117) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-117](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-117) | [investigations-sources.md](../research/investigations-sources.md) |
| [Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity](https://psi.nasa.gov/physci/repo/data/investigations/PSI-115) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-115](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-115) | [investigations-sources.md](../research/investigations-sources.md) |
| [Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2](https://psi.nasa.gov/physci/repo/data/investigations/PSI-47) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-47](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-47) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-100](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-100) | [investigations-sources.md](../research/investigations-sources.md) |
| [Cool Flames Investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-39](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-39) | [investigations-sources.md](../research/investigations-sources.md) |
| [Smoke and Aerosol Measurement Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102) | [investigations-sources.md](../research/investigations-sources.md), [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [NASA PSI-102](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-102) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-159](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-159) | [investigations-sources.md](../research/investigations-sources.md) |
| [Smoke Aerosol Measurement Experiment-Reflight](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101) | [investigations-sources.md](../research/investigations-sources.md), [rows-same-psi102.md](../research/rows-same-psi102.md), [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [NASA PSI-101](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-101) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-99](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-99) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-22) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-22](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-22) | [investigations-sources.md](../research/investigations-sources.md) |
| [Smoke Point In Co-flow Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107) | [investigations-sources.md](../research/investigations-sources.md), [rows-spice.md](../research/rows-spice.md) |
| [NASA PSI-107](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-107) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame](https://psi.nasa.gov/physci/repo/data/investigations/PSI-21) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-21](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-21) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments - Burning Rate Emulator](https://psi.nasa.gov/physci/repo/data/investigations/PSI-20) | [investigations-sources.md](../research/investigations-sources.md), [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [NASA PSI-20](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-20) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-23) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-23](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-23) | [investigations-sources.md](../research/investigations-sources.md) |
| [Advanced Combustion via Microgravity Experiments / Flame Design](https://psi.nasa.gov/physci/repo/data/investigations/PSI-10) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-10](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-10) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI Data Repository investigation landing page](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) | [investigations-sources.md](../research/investigations-sources.md), [rows-flex.md](../research/rows-flex.md) |
| [NASA PSI-69](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-69) | [investigations-sources.md](../research/investigations-sources.md) |
| [Flame Extinguishment Experiment - 2](https://psi.nasa.gov/physci/repo/data/investigations/PSI-68) | [investigations-sources.md](../research/investigations-sources.md) |
| [NASA PSI-68](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-68) | [investigations-sources.md](../research/investigations-sources.md) |
| [search](https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
### NASA reports, standards and program pages

| Source / artifact | Research provenance |
|---|---|
| [presentation](https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf) | [atmosphere.md](../research/atmosphere.md), [habitat-atmospheres.md](../research/habitat-atmospheres.md), [lunar-2025.md](../research/lunar-2025.md), [nasa-context.md](../research/nasa-context.md), [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [NASA 20240014203](https://ntrs.nasa.gov/api/citations/20240014203/downloads/11-15-24%2020240014203.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [conkin-prebreathe-overview-tp216147-2011.pdf](https://www.nasa.gov/wp-content/uploads/2023/03/conkin-prebreathe-overview-tp216147-2011.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20200001073](https://ntrs.nasa.gov/citations/20200001073) | [atmosphere.md](../research/atmosphere.md) |
| [ochmo-tb-037-decompression-sickness.pdf](https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-037-decompression-sickness.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20220013669](https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf?attachment=true) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20230013523](https://ntrs.nasa.gov/api/citations/20230013523/downloads/Evidence%20Report%20Draft%20Hypoxia%20and%20DCS_20230918.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20205008200](https://ntrs.nasa.gov/api/citations/20205008200/downloads/EVA-EXP-0042%20xEVA%20System%20Con%20Ops%20Rev%20B%20Final%20dtd%2010192020_REF%20DOC.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [nasa-tp-2019-220232.pdf](https://www.nasa.gov/wp-content/uploads/2018/11/nasa-tp-2019-220232.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20240013238](https://ntrs.nasa.gov/api/citations/20240013238/downloads/ASMA_2025_EA_Garbino_v2.pdf) | [atmosphere.md](../research/atmosphere.md) |
| [NASA 20210011385](https://ntrs.nasa.gov/citations/20210011385) | [bass2.md](../research/bass2.md), [verification-report.md](../research/verification-report.md) |
| [Materials And Processes Technical Information System (MAPTIS)](https://maptis.nasa.gov/) | [competitor.md](../research/competitor.md) |
| [MAPTIS — Features](https://maptis.nasa.gov/Features) | [competitor.md](../research/competitor.md) |
| [Materials and Processes Selection, Control, and Implementation Plan for JSC Flight Hardware — JSC 27301H](https://standards.nasa.gov/sites/default/files/standards/JSC/H/0/JSC27301H.pdf) | [competitor.md](../research/competitor.md) |
| [NASA 20180005168 presentation, p. 30 Table 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf) | [evidence-additions.md](../research/evidence-additions.md), [rows-saffire1.csv](../research/rows-saffire1.csv), [rows-saffire1.md](../research/rows-saffire1.md) |
| [Urban et al., ICES-2025-392 corrected paper](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf) | [evidence-additions.md](../research/evidence-additions.md), [limits-registry.csv](../research/limits-registry.csv), [limits-registry.md](../research/limits-registry.md), [lunar-2025-rows.csv](../research/lunar-2025-rows.csv), [lunar-2025.md](../research/lunar-2025.md), [partial-gravity-literature.md](../research/partial-gravity-literature.md), [verify-us25.md](../research/verify-us25.md) |
| [NASA 20220007191, slide 4](https://ntrs.nasa.gov/api/citations/20220007191/downloads/ACME%20CSSCI%2020220509.pdf) | [evidence-additions.md](../research/evidence-additions.md) |
| [NASA 20170009141, p. 1](https://ntrs.nasa.gov/api/citations/20170009141/downloads/20170009141.pdf) | [evidence-additions.md](../research/evidence-additions.md) |
| [Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2](https://ntrs.nasa.gov/api/citations/20130000422/downloads/20130000422.pdf) | [evidence-additions.md](../research/evidence-additions.md), [rows-same-psi102.md](../research/rows-same-psi102.md), [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf](https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf) | [evidence-spec.md](../research/evidence-spec.md), [nasa-context.md](../research/nasa-context.md) |
| [NASA 20150000894](https://ntrs.nasa.gov/citations/20150000894) | [evidence-spec.md](../research/evidence-spec.md) |
| [NASA preflight poster, sample layout panels](https://ntrs.nasa.gov/api/citations/20150000894/downloads/20150000894.pdf) | [evidence-spec.md](../research/evidence-spec.md), [rows-saffire3.md](../research/rows-saffire3.md) |
| [NASA 20160000593](https://ntrs.nasa.gov/api/citations/20160000593/downloads/20160000593.pdf) | [evidence-spec.md](../research/evidence-spec.md) |
| [NASA 20050185597](https://ntrs.nasa.gov/citations/20050185597) | [habitat-atmospheres.md](../research/habitat-atmospheres.md) |
| [NASA 20050185597](https://ntrs.nasa.gov/api/citations/20050185597/downloads/20050185597.pdf) | [habitat-atmospheres.md](../research/habitat-atmospheres.md) |
| [NASA 20150021491](https://ntrs.nasa.gov/citations/20150021491) | [habitat-atmospheres.md](../research/habitat-atmospheres.md) |
| [NASA 20150021491](https://ntrs.nasa.gov/api/citations/20150021491/downloads/20150021491.pdf) | [habitat-atmospheres.md](../research/habitat-atmospheres.md) |
| [NASA 20070021378](https://ntrs.nasa.gov/api/citations/20070021378/downloads/20070021378.pdf) | [habitat-atmospheres.md](../research/habitat-atmospheres.md) |
| [NTRS 20070018178](https://ntrs.nasa.gov/citations/20070018178) | [habitat-atmospheres.md](../research/habitat-atmospheres.md), [rows-std6001-test1.md](../research/rows-std6001-test1.md) |
| [NASA 20070018178](https://ntrs.nasa.gov/api/citations/20070018178/downloads/20070018178.pdf) | [habitat-atmospheres.md](../research/habitat-atmospheres.md), [rows-std6001-test1.csv](../research/rows-std6001-test1.csv), [rows-std6001-test1.md](../research/rows-std6001-test1.md) |
| [Exploration-atmosphere report, printed p. 3 / PDF p. 7, fuel descriptions and Table 1](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf) | [habitat-atmospheres.md](../research/habitat-atmospheres.md), [limits-registry.csv](../research/limits-registry.csv), [limits-registry.md](../research/limits-registry.md), [material-aliases.csv](../research/material-aliases.csv), [material-aliases.md](../research/material-aliases.md), [rows-cellulose.csv](../research/rows-cellulose.csv), [rows-cellulose.md](../research/rows-cellulose.md), [rows-polyimide.csv](../research/rows-polyimide.csv), [rows-polyimide.md](../research/rows-polyimide.md) |
| [PSI investigation index, Combustion Science section, SPICE entry](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/) | [investigations-sources.md](../research/investigations-sources.md), [nasa-context.md](../research/nasa-context.md), [partial-gravity-literature.md](../research/partial-gravity-literature.md), [rows-same-psi102.md](../research/rows-same-psi102.md), [rows-spice.md](../research/rows-spice.md) |
| [A Researcher's Guide to ISS Combustion Science](https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf) | [investigations-sources.md](../research/investigations-sources.md) |
| [ACME NASA NTRS record 20220015583](https://ntrs.nasa.gov/citations/20220015583) | [investigations-sources.md](../research/investigations-sources.md) |
| [Pressure-effects report, p. 3, Table 1, Silicone Rubber row](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf) | [limits-registry.csv](../research/limits-registry.csv), [limits-registry.md](../research/limits-registry.md), [material-aliases.csv](../research/material-aliases.csv), [material-aliases.md](../research/material-aliases.md), [rows-ptfe-silicone.csv](../research/rows-ptfe-silicone.csv), [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [NASA NTRS full paper](https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf) | [limits-registry.csv](../research/limits-registry.csv), [limits-registry.md](../research/limits-registry.md), [partial-gravity-literature.md](../research/partial-gravity-literature.md), [pmma-endpoints.md](../research/pmma-endpoints.md), [pmma-rows.csv](../research/pmma-rows.csv), [rows-marcum-lunar.md](../research/rows-marcum-lunar.md), [verify-pmma.md](../research/verify-pmma.md) |
| [NASA 20250002114](https://ntrs.nasa.gov/citations/20250002114) | [lunar-2025.md](../research/lunar-2025.md), [verify-us25.md](../research/verify-us25.md) |
| [NASA 20250006779](https://ntrs.nasa.gov/citations/20250006779) | [lunar-2025.md](../research/lunar-2025.md), [verify-us25.md](../research/verify-us25.md) |
| [NASA 20130010991](https://ntrs.nasa.gov/citations/20130010991) | [lunar-2025.md](../research/lunar-2025.md), [rows-olson-partial-g.md](../research/rows-olson-partial-g.md), [verify-of12.md](../research/verify-of12.md) |
| [NASA 20260001966](https://ntrs.nasa.gov/citations/20260001966) | [lunar-2025.md](../research/lunar-2025.md) |
| [*Flammability of Materials on the Moon (FM2)*](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/) | [lunar-2025.md](../research/lunar-2025.md), [nasa-context.md](../research/nasa-context.md) |
| [rehydration report, Table 1, printed pp. 5-6 / PDF pp. 9-10, separate cellulose derivatives](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf) | [material-aliases.csv](../research/material-aliases.csv), [material-aliases.md](../research/material-aliases.md) |
| [Optical characterization, PDF p. 5, sections 3.1 and 3.2](https://ntrs.nasa.gov/api/citations/20150017032/downloads/20150017032.pdf) | [material-aliases.csv](../research/material-aliases.csv), [material-aliases.md](../research/material-aliases.md) |
| [JSC-27301J_Final.pdf](https://standards.nasa.gov/system/files/tmp/JSC-27301J_Final.pdf) | [nasa-context.md](../research/nasa-context.md) |
| [JSC-27301](https://standards.nasa.gov/standard/JSC/JSC-27301) | [nasa-context.md](../research/nasa-context.md) |
| [www.nasa.gov](https://www.nasa.gov/flammability-of-materials-on-the-moon-fm2/) | [nasa-context.md](../research/nasa-context.md) |
| [NASA 20240008623](https://ntrs.nasa.gov/api/citations/20240008623/downloads/20240008623.pdf) | [nasa-context.md](../research/nasa-context.md) |
| [NASA 20240015307](https://ntrs.nasa.gov/citations/20240015307) | [nasa-context.md](../research/nasa-context.md) |
| [NASA presentation, title slide/PDF p. 1](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf) | [nasa-context.md](../research/nasa-context.md), [rows-saffire1.md](../research/rows-saffire1.md), [rows-saffire2.csv](../research/rows-saffire2.csv), [rows-saffire2.md](../research/rows-saffire2.md) |
| [Preliminary Results from the Saffire VI Experiment](https://ntrs.nasa.gov/api/citations/20240002981/downloads/Saffire-ICES-2024-ICES-365-accepted%20final.pdf) | [nasa-context.md](../research/nasa-context.md), [rows-saffire56.csv](../research/rows-saffire56.csv), [rows-saffire56.md](../research/rows-saffire56.md) |
| [mission recap](https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/) | [nasa-context.md](../research/nasa-context.md), [rows-saffire56.md](../research/rows-saffire56.md) |
| [spacecraft-fire-safety-demonstration-saffire.pdf](https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf) | [nasa-context.md](../research/nasa-context.md) |
| [NASA 20040053567](https://ntrs.nasa.gov/api/citations/20040053567/downloads/20040053567.pdf) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
| [NASA 20170011213](https://ntrs.nasa.gov/citations/20170011213) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
| [tbpdf.cfm](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=492A5F96AAA7FB9492887E390BF6713F) | [partial-gravity-literature.md](../research/partial-gravity-literature.md), [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [PS-01548-ACME-info-sheet-1.pdf](https://www1.grc.nasa.gov/wp-content/uploads/PS-01548-ACME-info-sheet-1.pdf) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
| [tbpdf.cfm](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=15DD0E09BD99042CCB3B52BBA64ED2D7) | [pmma-endpoints.md](../research/pmma-endpoints.md), [verify-pmma.md](../research/verify-pmma.md) |
| [NASA NTRS record](https://ntrs.nasa.gov/citations/20170006615) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [NASA NTRS record](https://ntrs.nasa.gov/citations/20150008961) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [BRE investigation description](https://science.nasa.gov/biological-physical/investigations/bre/) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [NASA operations page](https://gipoc.grc.nasa.gov/wp/fcf-cir/acme/burning-rate-emulator-bre-operations/) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [Recent Research on Flames of Gaseous Fuel Aboard the International Space Station](https://ntrs.nasa.gov/api/citations/20210022542/downloads/ACME%20JASMAC-33%2020211007.pdf) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [ACME Publications register](https://www1.grc.nasa.gov/wp-content/uploads/ACME-publications-20230830.pdf) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [NASA CR-198537, printed pp. 55–57 / PDF pp. 67–69, text and Figs. 30–31](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf) | [rows-cellulose.csv](../research/rows-cellulose.csv), [rows-cellulose.md](../research/rows-cellulose.md) |
| [Cavanagh et al., NTRS abstract](https://ntrs.nasa.gov/citations/20040084168) | [rows-cellulose.md](../research/rows-cellulose.md) |
| [Flame Extinguishment Experiment (FLEX)](https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf) | [rows-flex.md](../research/rows-flex.md) |
| [Cool-flame extinction during n-alkane droplet combustion in microgravity](https://ntrs.nasa.gov/api/citations/20140006750/downloads/20140006750.pdf) | [rows-flex.md](../research/rows-flex.md) |
| [Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011](https://ntrs.nasa.gov/citations/20150023456) | [rows-flex.md](../research/rows-flex.md) |
| [20170006615](https://ntrs.nasa.gov/api/citations/20170006615/downloads/20170006615.pdf) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [20170003880](https://ntrs.nasa.gov/api/citations/20170003880/downloads/20170003880.pdf) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [tbpdf.cfm](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=D98ECEE7D8DDC71091E3471C2D981FFC) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [tbpdf.cfm](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A9296A5251A3ABD303281BAD39D22367) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [NTRS 20250010653](https://ntrs.nasa.gov/api/citations/20250010653/downloads/ASGSR%202025-LUCI-Ferkul-Presentation-v2-20250010653.pdf) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md), [rows-olson-partial-g.csv](../research/rows-olson-partial-g.csv), [rows-olson-partial-g.md](../research/rows-olson-partial-g.md) |
| [NASA 20250010653](https://ntrs.nasa.gov/citations/20250010653) | [rows-olson-partial-g.md](../research/rows-olson-partial-g.md) |
| [NTRS 19760003644](https://ntrs.nasa.gov/api/citations/19760003644/downloads/19760003644.pdf) | [rows-polyimide.md](../research/rows-polyimide.md) |
| [NASA TM X-64760](https://ntrs.nasa.gov/api/citations/19730017854/downloads/19730017854.pdf) | [rows-polyimide.md](../research/rows-polyimide.md) |
| [PSI Data Repository](https://www.nasa.gov/physical-sciences-informatics-psi/) | [rows-polyimide.md](../research/rows-polyimide.md), [rows-std6001-test1.md](../research/rows-std6001-test1.md) |
| [NASA 20070005041](https://ntrs.nasa.gov/citations/20070005041) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [Harper et al., *Oxygen Partial Pressure and Oxygen Concentration Flammability: Can They Be Correlated?*](https://ntrs.nasa.gov/api/citations/20160001047/downloads/20160001047.pdf) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [NASA 20160001047](https://ntrs.nasa.gov/citations/20160001047) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [*Polymer-Oxygen Compatibility Testing: Effect of Oxygen Aging on Ignition and Combustion Properties*](https://ntrs.nasa.gov/citations/20000102418) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [*A Model For The Burning of Teflon*](https://ntrs.nasa.gov/citations/20000102417) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [*Test System to Study the Ignition of Metals by Polymers in Oxygen*](https://ntrs.nasa.gov/citations/20000085164) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [19990053973](https://ntrs.nasa.gov/citations/19990053973) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [19970020612](https://ntrs.nasa.gov/citations/19970020612) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [19970020547](https://ntrs.nasa.gov/citations/19970020547) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [20160010073](https://ntrs.nasa.gov/citations/20160010073) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [20170009141](https://ntrs.nasa.gov/citations/20170009141) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [20210022402](https://ntrs.nasa.gov/api/citations/20210022402/downloads/217-_GollnerMichaelJ.pdf) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [19990054085](https://ntrs.nasa.gov/citations/19990054085) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [20010074003](https://ntrs.nasa.gov/citations/20010074003) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [19990053965](https://ntrs.nasa.gov/api/citations/19990053965/downloads/19990053965.pdf) | [rows-quintiere.md](../research/rows-quintiere.md) |
| [NASA BPS data landing page](https://science.nasa.gov/biological-physical/data/) | [rows-saffire2.md](../research/rows-saffire2.md), [rows-saffire3.md](../research/rows-saffire3.md), [rows-saffire4.md](../research/rows-saffire4.md), [rows-saffire56.md](../research/rows-saffire56.md) |
| [p. 17, lower comparison and caption](https://ntrs.nasa.gov/api/citations/20180004258/downloads/20180004258.pdf) | [rows-saffire3.csv](../research/rows-saffire3.csv), [rows-saffire3.md](../research/rows-saffire3.md) |
| [NASA 20180004258](https://ntrs.nasa.gov/citations/20180004258) | [rows-saffire3.md](../research/rows-saffire3.md) |
| [NASA 20210011521](https://ntrs.nasa.gov/citations/20210011521) | [rows-saffire4.md](../research/rows-saffire4.md) |
| [NASA modeling report](https://ntrs.nasa.gov/citations/20220002714) | [rows-saffire4.md](../research/rows-saffire4.md) |
| [Opposed flame spreading along a structured PMMA-sample in exploration atmosphere under microgravity](https://ntrs.nasa.gov/citations/20210017838) | [rows-saffire56.md](../research/rows-saffire56.md) |
| [2009, NTRS publication record](https://ntrs.nasa.gov/citations/20120012884) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [report title page, p. 1](https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [2012, NTRS record](https://ntrs.nasa.gov/citations/20130000422) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [Solid Inflammability Boundary At Low-Speed (SIBAL), NTRS record](https://ntrs.nasa.gov/citations/20040053507) | [rows-sibal.md](../research/rows-sibal.md) |
| [PDF pp. 1-2, Research Summary / Detailed Research Description](https://ntrs.nasa.gov/api/citations/20090014827/downloads/20090014827.pdf) | [rows-spice.md](../research/rows-spice.md) |
| [NASA 20130004397](https://ntrs.nasa.gov/api/citations/20130004397/downloads/20130004397.pdf) | [rows-spice.md](../research/rows-spice.md) |
| [NTRS bibliographic record](https://ntrs.nasa.gov/citations/20090014827) | [rows-spice.md](../research/rows-spice.md) |
| [index.cfm](https://taskbook.nasaprs.com/tbp/index.cfm?action=public_query_taskbook_content&TASKID=16225) | [verify-other.md](../research/verify-other.md) |
| [index.cfm](https://taskbook.nasaprs.com/tbp/index.cfm?st=advanced) | [verify-other.md](../research/verify-other.md) |
| [tbpdf.cfm](https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=A4E891655E49E9A6A0353DF3D9B4DE14) | [verify-pmma.md](../research/verify-pmma.md) |
| [index.cfm](https://taskbook.nasaprs.com/tbp/index.cfm?action=public_query_taskbook_content&TASKID=15DD0E09BD99042CCB3B52BBA64ED2D7) | [verify-pmma.md](../research/verify-pmma.md) |
### Other publications and research context

| Source / artifact | Research provenance |
|---|---|
| [Flame in Freefall — repository README](https://github.com/Mehedi752/Flame-in-Freefall) | [competitor.md](../research/competitor.md) |
| [flame-in-freefall.vercel.app](https://flame-in-freefall.vercel.app/) | [competitor.md](../research/competitor.md) |
| [FLARE-X — repository README](https://github.com/SoyebuzamanNaim/ALPINE_IBEX) | [competitor.md](../research/competitor.md) |
| [Fotia](https://github.com/AnteurAbderraouf/Fotia) | [competitor.md](../research/competitor.md) |
| [nasafotia.streamlit.app](https://nasafotia.streamlit.app/) | [competitor.md](../research/competitor.md) |
| [www.spaceappschallenge.org](https://www.spaceappschallenge.org/2026/find-a-team/firelytics-ai/) | [competitor.md](../research/competitor.md) |
| [Flame in Freefall — additional project-page lead](https://nasa-five-rose.vercel.app/) | [competitor.md](../research/competitor.md) |
| [Flame in Freefall — lib/engine.ts](https://raw.githubusercontent.com/Mehedi752/Flame-in-Freefall/main/lib/engine.ts) | [competitor.md](../research/competitor.md) |
| [FLARE-X — raw README](https://raw.githubusercontent.com/SoyebuzamanNaim/ALPINE_IBEX/master/README.md) | [competitor.md](../research/competitor.md) |
| [Model Card: FLARE-X Flame-Spread Classifier](https://raw.githubusercontent.com/SoyebuzamanNaim/ALPINE_IBEX/master/docs/MODEL_CARDS.md) | [competitor.md](../research/competitor.md) |
| [Fotia — README](https://raw.githubusercontent.com/AnteurAbderraouf/Fotia/main/README.md) | [competitor.md](../research/competitor.md) |
| [Looking for team members — Flame in Freefall challenge — Firelytics AI](https://github.com/nasa/spaceapps/discussions/1897) | [competitor.md](../research/competitor.md) |
| [Flame in Freefall — official challenge teams page](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/?tab=teams) | [competitor.md](../research/competitor.md) |
| [R1: REDLINE evidence table: schema and comparability rules](https://github.com/AkarshSharma2012/REDLINE/blob/278d60b0a20a354cd88bc8c84e3762d4f39f78c8/research/evidence-spec.md) | [competitor.md](../research/competitor.md) |
| [R8: validation plan](https://github.com/AkarshSharma2012/REDLINE/blob/2b733e0c0838750be08663b694915e1a970c6288/research/validation-plan.md) | [competitor.md](../research/competitor.md) |
| [s41598-017-18398-4](https://www.nature.com/articles/s41598-017-18398-4) | [evidence-spec.md](../research/evidence-spec.md), [validation-plan.md](../research/validation-plan.md) |
| [34_ProCI_2019_buring-spread.pdf](https://ira.lib.polyu.edu.hk/bitstream/10397/89528/1/34_ProCI_2019_buring-spread.pdf) | [evidence-spec.md](../research/evidence-spec.md) |
| [qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) | [evidence-spec.md](../research/evidence-spec.md) |
| [S0379711224001802](https://www.sciencedirect.com/science/article/pii/S0379711224001802) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
| [S0010218013000692](https://www.sciencedirect.com/science/article/abs/pii/S0010218013000692) | [partial-gravity-literature.md](../research/partial-gravity-literature.md) |
| [Publisher](https://www.sciencedirect.com/science/article/pii/S1540748924000348) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [Publisher](https://www.sciencedirect.com/science/article/abs/pii/S0379711225002899) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [Publisher](https://www.sciencedirect.com/science/article/pii/S0379711226000871) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [Publisher](https://www.sciencedirect.com/science/article/pii/S1540748926004566) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [Official ICES 2025 program](https://ices.space/wp-content/uploads/2025/07/ICES_2025_program_final_WEB_spreads_minus-PR-back-page.pdf) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [102744](https://doi.org/10.32865/2346/102744) | [pmma-endpoints.md](../research/pmma-endpoints.md) |
| [j.combustflame.2021.01.035](https://doi.org/10.1016/j.combustflame.2021.01.035) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [j.combustflame.2021.111572](https://doi.org/10.1016/j.combustflame.2021.111572) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [j.proci.2022.08.107](https://doi.org/10.1016/j.proci.2022.08.107) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [j.combustflame.2023.112809](https://doi.org/10.1016/j.combustflame.2023.112809) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [j.proci.2020.06.110](https://doi.org/10.1016/j.proci.2020.06.110) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [Using a Burning Rate Emulator to Analyze Flame Extinction Time on the International Space Station](https://drum.lib.umd.edu/items/b21822b4-9024-46d6-8cef-88f1e01a9d31) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [UMD dissertation PDF](https://api.drum.lib.umd.edu/server/api/core/bitstreams/737cc34c-44b2-40c3-ab77-14bf9569edd8/content) | [rows-acme-bre.md](../research/rows-acme-bre.md) |
| [Microgravity Science and Technology (2006), DOI landing page, Abstract and About this article](https://link.springer.com/article/10.1007/BF02870979) | [rows-cellulose.md](../research/rows-cellulose.md) |
| [Can cool flames support quasi-steady alkane droplet burning?](https://doi.org/10.1016/j.combustflame.2012.07.012) | [rows-flex.md](../research/rows-flex.md) |
| [Cool-flame extinction during n-alkane droplet combustion in microgravity](https://doi.org/10.1016/j.combustflame.2015.01.012) | [rows-flex.md](../research/rows-flex.md) |
| [10.1016/j.firesaf.2024.104267](https://doi.org/10.1016/j.firesaf.2024.104267) | [rows-marcum-lunar.md](../research/rows-marcum-lunar.md) |
| [TTU record](https://ttu-ir.tdl.org/items/1922ad9f-ef4c-4f52-96a4-980c23debe5e) | [rows-olson-partial-g.md](../research/rows-olson-partial-g.md) |
| [publisher record](https://www.sciencedirect.com/science/article/abs/pii/S1540748918302852) | [rows-polyimide.md](../research/rows-polyimide.md) |
| [j.proci.2018.06.102](https://doi.org/10.1016/j.proci.2018.06.102) | [rows-polyimide.md](../research/rows-polyimide.md) |
| [ASTM publisher issue listing](https://store.astm.org/journals/volume/listing/coden/JTEVAB/issue/1/volume/36/online-issue-date/2008-01-01%2B00%3A00%3A00) | [rows-ptfe-silicone.md](../research/rows-ptfe-silicone.md) |
| [10.1016/j.combustflame.2018.10.012](https://doi.org/10.1016/j.combustflame.2018.10.012) | [rows-saffire1.md](../research/rows-saffire1.md), [rows-saffire2.md](../research/rows-saffire2.md), [rows-saffire3.md](../research/rows-saffire3.md) |
| [institutional publication record](https://www.research.ed.ac.uk/en/publications/flame-spread-effects-of-microgravity-and-scale/) | [rows-saffire1.md](../research/rows-saffire1.md), [rows-saffire3.md](../research/rows-saffire3.md) |
| [Buoyancy effects on concurrent flame spread over thick PMMA](https://pmc.ncbi.nlm.nih.gov/articles/PMC8862122/) | [rows-saffire2.md](../research/rows-saffire2.md) |
| [10.1016/j.combustflame.2018.10.016](https://doi.org/10.1016/j.combustflame.2018.10.016) | [rows-saffire2.md](../research/rows-saffire2.md) |
| [Flame spread: Effects of microgravity and scale](https://www.sciencedirect.com/science/article/pii/S0010218018304395) | [rows-saffire2.md](../research/rows-saffire2.md), [rows-saffire3.md](../research/rows-saffire3.md) |
| [conference-paper PDF at Edinburgh](https://www.pure.ed.ac.uk/ws/portalfiles/portal/41273713/ICES_2017_ICES2017_224.pdf) | [rows-saffire2.md](../research/rows-saffire2.md) |
| [The effect of duct size, sample size, and fuel composition on concurrent flame spread over large cellulose samples in microgravity](https://www.sciencedirect.com/science/article/abs/pii/S0010218022005673) | [rows-saffire4.md](../research/rows-saffire4.md) |
| [earlier PMMA journal paper](https://www.research.ed.ac.uk/en/publications/concurrent-flame-spread-over-two-sided-thick-pmma-slabs-in-microg/) | [rows-saffire4.md](../research/rows-saffire4.md) |
| [The effect of duct size, sample size, and fuel composition on concurrent flame spread over large cellulose samples in microgravity](https://doi.org/10.1016/j.combustflame.2022.112559) | [rows-saffire56.md](../research/rows-saffire56.md) |
| [publisher](https://www.sciencedirect.com/science/article/pii/S0010218022005673) | [rows-saffire56.md](../research/rows-saffire56.md) |
| [UCL author-manuscript record](https://discovery.ucl.ac.uk/id/eprint/10164340/) | [rows-saffire56.md](../research/rows-saffire56.md) |
| [NIST publication record](https://www.nist.gov/publications/smoke-characterization-and-feasibility-moment-method-spacecraft-fire-detection) | [rows-same-psi102.md](../research/rows-same-psi102.md), [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [Smoke Characterization and Feasibility of the Moment Method for Spacecraft Fire Detection](https://doi.org/10.1080/02786826.2015.1025124) | [rows-same-psi102.md](../research/rows-same-psi102.md), [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [NIST publication record](https://www.nist.gov/publications/pyrolysis-smoke-generated-under-low-gravity-conditions) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [journal DOI](https://doi.org/10.1080/02786826.2015.1025125) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [Publisher record](https://www.sciencedirect.com/science/article/abs/pii/S0379711216302181) | [rows-same-psi102.md](../research/rows-same-psi102.md) |
| [Evaluation of spacecraft smoke detector performance in the low-gravity environment](https://doi.org/10.1016/j.firesaf.2018.04.004) | [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [NIST publication record](https://www.nist.gov/publications/evaluation-spacecraft-smoke-detector-performance-low-gravity-environment) | [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [6.2013-3433](https://doi.org/10.2514/6.2013-3433) | [rows-samer-psi101.md](../research/rows-samer-psi101.md) |
| [volume 36, issue 2, 2017, pp. 2971–2978; DOI 10.1016/j.proci.2016.06.028](https://www.sciencedirect.com/science/article/abs/pii/S1540748916300864) | [rows-sibal.md](../research/rows-sibal.md) |
| [Author-hosted PDF, printed p. 552 / PDF p. 3, Experimental methods and Table 2](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf) | [rows-spice.md](../research/rows-spice.md) |
| [ecog.02881](https://doi.org/10.1111/ecog.02881) | [validation-plan.md](../research/validation-plan.md) |
| [cross_validation.html](https://scikit-learn.org/stable/modules/cross_validation.html) | [validation-plan.md](../research/validation-plan.md) |
| [prc241.htm](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) | [validation-plan.md](../research/validation-plan.md) |
| [1705.08500](https://arxiv.org/abs/1705.08500) | [validation-plan.md](../research/validation-plan.md) |
| [1705.08500v2](https://arxiv.org/html/1705.08500v2) | [validation-plan.md](../research/validation-plan.md) |

## Challenge and tools

- [NASA International Space Apps Challenge 2026 ? Flame in Freefall](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/): challenge framing and NASA resource pointers. Event/team identity (Interlake Embers, Seattle) is recorded in the repository README; registration and challenge-page contents are **unverified** in this task. The research competitor audit records a failed challenge-page access; no judging or reuse requirements are invented here.
- [Node.js](https://nodejs.org/), credited to the Node.js contributors: JavaScript runtime for scripts and the built-in `node --test` runner. No dependency was added by this task. Exact deployed tool versions are **unverified**.
- [GitHub Pages](https://docs.github.com/en/pages), GitHub: intended static hosting; [GitHub](https://github.com/) provides source control, issues and pull requests. Actual publication/deployment status is **unverified** in this task.
- Browser-native HTML, CSS and JavaScript ES modules form the application stack. These are platform standards, not NASA software.

## AI assistance and responsibility

AI coding agents assisted with repository research notes, source extraction, draft documentation, implementation and tests. Repository task instructions identify Claude Code as the issue generator; this credits task was drafted and checked by OpenAI Codex. Exact model versions, the complete agent roster and the extent of human review across other tasks are **unverified** here. This is a bounded disclosure, not a complete historical usage audit.

AI-generated summaries, concern labels, proposed comparisons and interpretations are REDLINE outputs, not NASA statements. A source link or passing software test does not independently validate a scientific extraction. Source authors receive credit for the underlying experiments and publications; the project team remains responsible for checking transcription, scientific wording, rights, and the final submission. No claim is made that AI performed new physical experiments or that every cited source was independently verified.
