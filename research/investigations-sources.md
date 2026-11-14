# PSI combustion investigation catalog ? source review

Issue #66. Reviewed 2026-11-14. This is an investigation inventory, not a material flammability table and not evidence that any habitat is approved for particular conditions.

## Scope and inventory

NASA's [PSI repository](https://psi.nasa.gov/physci/repo/) is the primary dataset. The anonymous [public search](https://psi.nasa.gov/geode-py/ws/repo/search?size=200&type=investigation) returned 133 investigation records, of which 24 had Research Area = Combustion Science. All 24 are represented here. The [NASA research-area index](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/) was also inspected, but is less complete than live search. This is a dated snapshot, not a claim about future completeness.

There are 26 catalog entries: 19 experimental PSI datasets become 20 entries because DAFT and DAFT-2 share PSI-47; five more are derived studies; ACME adds one umbrella. The umbrella and shared accession must not increase counts of independent datasets. ACME has six children: BRE, CLD Flame, E-FIELD Flames, Flame Design, s-Flame, and CFI-G. CFI (droplets, PSI-39) differs from CFI-G (gaseous spherical burners, PSI-159).

Rockets/propellants are excluded. SoFIE, FLARE, FM2 and LUCI are not invented as PSI accessions: none was returned as a combustion record by this search. This inventory makes no claim about their current flight status.

## JSON contract and consumer rules

S1 defines evidence.json, not an investigation schema. investigations.json is a separate, hand-curated descriptive artifact; it changes no engine interface and cannot supply evidence rows for labelMaterial. It has schema_version = 1, a source registry, dated coverage metadata, and an investigations array. All scientific/display fields are flat record properties. Every property has a matching provenance entry with one or more source_id + locator references resolved through sources. Consumers must display the referenced NASA URL beside the field, plus its note and basis where relevant. No new dependency, framework, bundler or backend is introduced.

- reported: NASA reports this fact or description; this does not mean every described test was completed.
- interpretation: REDLINE's navigation tag or application reading, explicitly distinguished from NASA findings. In particular, prevention/detection/suppression tags describe topic relevance, not performance ratings. E-FIELD's direct category is null because its PSI summary says it has no intended space application.
- editorial: slugs, hierarchy and record classification. These are organization choices grounded in the cited NASA identity/project description.
- unknown: value is null with a note specifying the reviewed scope. Null never means zero, no burning, or no possible relevance. For parent_id it means no parent assigned; for ACME psi_id/psi_url it means no umbrella accession established.

Ranges use min/max and scope. Oxygen is percent by mole/volume as described in the note, pressure kPa, and airflow cm/s; the property name supplies the unit. scope distinguishes reported-test-conditions, protocol and planned. Numeric spans are bounding summaries of listed conditions, not continuous coverage or burning/extinction thresholds. Equal bounds denote one documented nominal condition. Hardware capability is not silently converted into a test envelope. Size strings preserve representative geometry and whether it describes a burner, droplet, sample or aerosol bag.

Only reported observations/results populate key_findings. An objective or hypothesis is not rewritten as a discovery. Null findings mean a supported result was not extracted from the specified summary; underlying data/reports may contain results. Measurements may describe intended diagnostics and do not guarantee successful recovery (especially SAME TEM). Derived-study measurements are computational outputs or reanalysis, not new flight observations.

## Scientific limits and source conflicts

- CFI pressure is null: PSI-39 Objectives says 0.25?5 atm, Approach 0.25?0.5 atm. No typographic correction is guessed. PSI's unusual gas-species wording was not copied into a quantitative composition.
- Saffire-I and III generic Flight Platform says ISS, but Approach and hardware identify Cygnus after ISS departure. The catalog follows the experiment-specific Approach, records the disagreement, and excludes misleading generic dates.
- Saffire-III airflow is null: PSI-100 Approach says 30 cm/s, while [ICES-2021-266 Table 2](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf) reports 25 cm/s for III-1. Saffire-II's PSI summary gives 20 or 30 cm/s; that is labeled as a PSI summary, not substituted for the table's individual II-6 condition. The 5 ? 29 cm specimen summary also differs from some table lengths; no universal size is inferred.
- BASS/BASS-II 40 cm/s is fan capability; complete tested airflow bounds remain null. BASS-II oxygen below 21% supplies no complete lower bound. Initial/final calibrated oxygen and fan settings are not extinction limits.
- BRE's 21/26.5/34% oxygen and 14.7/10.2/8.2 psia are discrete atmospheres in Objectives, explicitly planned. They are not a continuous test grid. FLEX/FLEX-2 ranges come from described procedures and are tagged protocol.
- Unit conversions: pressure atm ? 101.3; psia ? 6.895; meters ? 1000 and centimeters ? 10 for millimeters; oxygen mole fraction ? 100. Converted digits are arithmetic outputs, not added measurement precision.
- Planetary and pressurized-rover transfer is not established by these summaries. Those fields are null with individual notes, rather than guessed relevance scores. Spacecraft/station relevance is retained when supported, and station extrapolation is labeled interpretation. Microgravity is a regime, not exactly 0 g. E-FIELD ion-driven convection is not measured partial gravity and no equivalent g is assigned.
- No lunar/Mars burning prediction or universal physical bound is generated. If later consumers present 0 g/1 g endpoints as an intermediate-gravity range, label it an assumed estimate and preserve the V2/S3 warning that an empirical bound is not established. No direct partial-gravity PSI measurement was identified in this dated catalog.

## Source register

Each PSI record was retrieved directly via its public metadata endpoint (not just a search snippet). Locators use the displayed section names: Project / Flight Platform, Objectives, Approach, Hypothesis, Hardware, Publications, and Research Impacts/Earth Benefits. Their JSON equivalents are flightProgram, objective, approach, hypothesis, experimentHardware, and researchImpacts. Accession/title/acronym map to accession/title/investigationAcronym. Versions below are PSI record versions, not validation grades. NASA descriptions were paraphrased; no underlying raw archive was independently reprocessed for this catalog.

| Source ID | NASA record | Version / modified date | Public metadata |
|---|---|---|---|
| PSI-142 | [Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-142) | 2 / 06-Mar-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-142) |
| PSI-62 | [Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography](https://psi.nasa.gov/physci/repo/data/investigations/PSI-62) | 1 / 14-Nov-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-62) |
| PSI-60 | [Computational and Experimental Analysis of SPICE Data Sets](https://psi.nasa.gov/physci/repo/data/investigations/PSI-60) | 1 / 30-Sep-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-60) |
| PSI-26 | [Burning and Suppression of Solids](https://psi.nasa.gov/physci/repo/data/investigations/PSI-26) | 4 / 19-Mar-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-26) |
| PSI-106 | [Structure and Liftoff In Combustion Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-106) | 3 / 06-Feb-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-106) |
| PSI-98 | [Spacecraft Fire Safety Experiment-I](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98) | 4 / 03-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-98) |
| PSI-117 | [Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis](https://psi.nasa.gov/physci/repo/data/investigations/PSI-117) | 2 / 09-Jun-2026 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-117) |
| PSI-115 | [Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity](https://psi.nasa.gov/physci/repo/data/investigations/PSI-115) | 3 / 02-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-115) |
| PSI-47 | [Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2](https://psi.nasa.gov/physci/repo/data/investigations/PSI-47) | 5 / 02-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-47) |
| PSI-100 | [Spacecraft Fire Experiment-III](https://psi.nasa.gov/physci/repo/data/investigations/PSI-100) | 4 / 05-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-100) |
| PSI-39 | [Cool Flames Investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39) | 4 / 03-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-39) |
| PSI-102 | [Smoke and Aerosol Measurement Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102) | 4 / 02-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-102) |
| PSI-159 | [Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159) | 1 / 20-Nov-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-159) |
| PSI-101 | [Smoke Aerosol Measurement Experiment-Reflight](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101) | 4 / 02-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-101) |
| PSI-25 | [Burning and Suppression of Solids - II](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) | 4 / 24-Nov-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25) |
| PSI-99 | [Spacecraft Fire Experiment-II](https://psi.nasa.gov/physci/repo/data/investigations/PSI-99) | 5 / 04-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-99) |
| PSI-22 | [Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-22) | 7 / 08-May-2026 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-22) |
| PSI-107 | [Smoke Point In Co-flow Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107) | 4 / 02-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-107) |
| PSI-21 | [Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame](https://psi.nasa.gov/physci/repo/data/investigations/PSI-21) | 4 / 22-Jan-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-21) |
| PSI-20 | [Advanced Combustion via Microgravity Experiments - Burning Rate Emulator](https://psi.nasa.gov/physci/repo/data/investigations/PSI-20) | 4 / 05-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-20) |
| PSI-23 | [Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames](https://psi.nasa.gov/physci/repo/data/investigations/PSI-23) | 4 / 05-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-23) |
| PSI-10 | [Advanced Combustion via Microgravity Experiments / Flame Design](https://psi.nasa.gov/physci/repo/data/investigations/PSI-10) | 1 / 20-Nov-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-10) |
| PSI-69 | [Flame Extinguishment Experiment](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) | 5 / 06-Jun-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-69) |
| PSI-68 | [Flame Extinguishment Experiment - 2](https://psi.nasa.gov/physci/repo/data/investigations/PSI-68) | 6 / 25-Nov-2025 | [metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-68) |

Additional sources:

- [A Researcher's Guide to ISS Combustion Science](https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf), October 2015. Printed page numbers (also PDF one-based page numbers here): pp. 19?20 for BASS environment and representative sphere; p. 22 nitrogen entrainment; pp. 33?34 FLEX cool flames; p. 14 Fig. 4 SPICE smoke transition. Old project plans in this guide are not treated as current status.
- [ACME NASA NTRS record 20220015583](https://ntrs.nasa.gov/citations/20220015583), Abstract: six investigations, dates, configurations and CIR hardware; project-level findings describe operations, not aggregate scientific performance.
- [ICES-2021-266](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf), Table 2: limited to the Saffire airflow conflict.

## Per-entry review and unknowns

The JSON is the field-level source of truth. This table lists remaining null scientific fields so review gaps are visible without interpreting absence as a negative result. Planetary/rover application fields are separately null for every entry as explained above; parent_id is an editorial hierarchy field.

| Entry | PSI | Type | Other null fields |
|---|---|---|---|
| bass | PSI-26 | flight | airflow_range_cm_s, fixed |
| bass-ii | PSI-25 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, key_findings |
| saffire-i | PSI-98 | flight | oxygen_range_pct, pressure_range_kpa, fixed, key_findings, station_relevance |
| saffire-ii | PSI-99 | flight | oxygen_range_pct, pressure_range_kpa, fixed, key_findings, station_relevance |
| saffire-iii | PSI-100 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, station_relevance |
| same | PSI-102 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings |
| same-r | PSI-101 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed |
| daft | PSI-47 | flight | fuel_type, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings |
| daft-2 | PSI-47 | flight | fuel_type, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings |
| flex | PSI-69 | flight | oxygen_range_pct, airflow_range_cm_s, fixed |
| flex-2 | PSI-68 | flight | sample_size, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| cfi | PSI-39 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings |
| acme | umbrella | umbrella | psi_id, psi_url, sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, spacecraft_relevance, station_relevance, earth_applications |
| acme-bre | PSI-20 | flight | airflow_range_cm_s, earth_applications |
| acme-cld | PSI-21 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| acme-e-field | PSI-22 | flight | fire_safety_area, sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| acme-flame-design | PSI-10 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| acme-s-flame | PSI-23 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| acme-cfi-g | PSI-159 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| spice | PSI-107 | flight | oxygen_range_pct, pressure_range_kpa, fixed |
| slice | PSI-106 | flight | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| spice-analysis | PSI-60 | derived-study | fuel_type, sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| bass-flamelet-modeling | PSI-62 | derived-study | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| same-smoke-modeling | PSI-115 | derived-study | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| cool-flame-perturbations | PSI-117 | derived-study | oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, key_findings, spacecraft_relevance, station_relevance |
| cool-flame-transitions | PSI-142 | derived-study | sample_size, oxygen_range_pct, pressure_range_kpa, airflow_range_cm_s, fixed, spacecraft_relevance, station_relevance |

## Validation and extension

Run node --test tests/investigations.test.mjs (or the full node --test suite). Tests check required family coverage, the six ACME children, 24 unique accessions, derived-study separation, required fields and types, NASA URLs, resolved source IDs and nonempty locators for every field, null notes, range bounds, and banned scientific wording. Mutation tests demonstrate rejection of missing citations, invalid locators/ranges, duplicate IDs, foreign domains and unexplained nulls. Structural tests cannot prove that NASA supports every paraphrase; the source locators and conflict review make that scientific audit possible.

To extend: re-run the public search, inspect each new metadata record, add only supported values, preserve planned/protocol/result distinctions, resolve or document conflicts, and rerun the suite. Keep raw test outcomes in the separate reviewed evidence pipeline.
