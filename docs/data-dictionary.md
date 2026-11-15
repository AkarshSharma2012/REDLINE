# Evidence CSV data dictionary

Scope: all 60 columns of [data/evidence.csv](../data/evidence.csv), in header order. Types below are **built JSON types**; CSV cells are text. This describes the checked-in contract, not independent verification of the experiments.

## Contract and rule references

- [Validator](../src/schema/validate.js): `FIELDS`, `PROVENANCE_KEYS`, `ENUMS`, `RANGES` and `checkRow` are the implemented constraints. V1-V6 below mean validator rules 1-6 (distinct from the V2 review document): V1 = key/type/enum/range checks; V2 = unique ID and dictionary references; V3 = nonempty locator/uncertainty; V4 = verified-row completeness; V5 = value requires unit; V6 = burn/no-burn requires outcome. Every column receives V1 checks, including the provenance string-or-null check.
- [S1 architecture sections 4.2-4.3](specs/architecture.md): field meanings and evaluation grouping. [S4 engine sections 4-5](specs/evidence-engine.md): comparison letters E/M/F/T/W/D/V/P/G/X/H/A/U and label support. [V2 review](specs/review.md): amendments and proposals, particularly C1/C3/C6 and U1/U2. **Rule-use entries describe the specification**, not completed runtime behavior: [compare.js](../src/rules/compare.js) and [label.js](../src/rules/label.js) are currently stubs.
- [CSV builder](../scripts/build-evidence.mjs) converts empty cells to `null`, converts only declared numeric fields to finite decimal numbers, and preserves other nonempty text. Empty means unknown, never zero. `number?` / `string?` mean nullable. Required nonnullable strings must be nonempty after trimming. All numeric values must be finite; ranges below apply only when nonnull.
- All 28 core columns are in this CSV. The validator permits omission of `limit_approach`, `pass_criterion`, `test_duration_s`, `notes`, and `verified_by`; other core keys must exist even if nullable. All 32 provenance keys are optional string-or-null fields. Blank provenance is unknown; numeric-looking provenance remains text.
- The validator follows S4 section 9 / V2 C3: verified rows may have unknown pressure. Verified rows require endpoint and O2, and at least one of value/outcome. V2 C1 adds `MOC`, `ULOI`, `extinction-5s` to the original S1 enum. Unknown external heat flux is nullable, superseding S1's original nonnullable field. It must not be filled with zero merely to satisfy a rule.
- The validator checks neither endpoint/unit compatibility nor the truth of provenance. It does not validate provenance URLs; the resolved `sources[source_key].url` is separately restricted to HTTPS NASA domains or `taskbook.nasaprs.com`. `source_key` must resolve even when extra source URLs exist.
- Examples are literal cells from the CSV, identified by evidence ID (long cells marked "excerpt"). Follow the row's source key and locator for its NASA evidence. Examples illustrate storage, not a verified result. `blank` means all current cells in that column are empty.

## Core columns

| Name | Meaning | Type | Unit | Allowed values (plus null for ?) | Example (evidence ID) | Rules / use beyond V1 |
|---|---|---|---|---|---|---|
| `evidence_id` | Unique evidence-row identifier. | `string` | none | any nonempty string | `PSI25-B1` (PSI25-B1) | V2 uniqueness; citation IDs and deterministic ordering |
| `material` | Source's own material name; grade/colour stays here. | `string` | none | any nonempty string | `100 micron PMMA film   2 cm wide` (PSI25-B1) | M |
| `material_id` | Base-material key into metadata materials; not a synonym assertion. | `string` | none | any nonempty string | `pmma` (PSI25-B1) | V2 resolution; M and material selection |
| `form` | Specimen form. | `string` | none | `sheet`, `rod`, `fabric`, `tape`, `wire`, `slab`, `foam`, `other` | `sheet` (PSI25-B1) | F; W treats rod/wire specially |
| `thickness_mm` | Specimen thickness; rod diameter conventions are unknown in these specifications. | `number?` | mm | > 0 | `0.1` (PSI25-B1) | T |
| `width_mm` | Specimen width; S1 says null for rod/wire (not enforced). | `number?` | mm | > 0 | `20` (PSI25-B1) | W |
| `flow_speed_cm_s` | Reported flow speed, not an uncalibrated fan setting. | `number?` | cm/s | >= 0 | `30` (OF12-NOMEX-0G-MOCSTAR) | V; quench context |
| `flow_direction` | Flow direction relative to flame spread. | `string` | none | `opposed`, `concurrent`, `quiescent`, `upward-buoyant` | `opposed` (PSI25-B1) | D |
| `o2_pct` | Test oxygen concentration; not automatically a measured extinction endpoint. | `number?` | % O2 | 0-100 inclusive | `13.5` (U25-01-L) | U; label oxygen comparisons; derived partial pressure |
| `pressure_kpa` | Test total pressure. | `number?` | kPa | > 0 | `56.5` (U25-01-L) | P; partial pressure and V2 U2 coverage restriction |
| `gravity_g` | Reported gravity expressed relative to Earth gravity; context belongs in provenance. | `number` | g (relative) | >= 0 | `0` (PSI25-B1) | G; gravity-class selection and lunar passes |
| `facility` | Test facility category. | `string` | none | `ISS`, `free-flyer`, `drop-tower`, `aircraft`, `ground` | `ISS` (PSI25-B1) | X |
| `endpoint` | Measurement endpoint code; endpoints are not interchangeable. | `string?` | none | `LOC-FS`, `LOC-FR`, `quench-limit`, `blowoff-limit`, `MOC-T1`, `LOI-D2863`, `ignition`, `spread-rate`, `burn/no-burn`, `MOC`, `ULOI`, `extinction-5s` | `extinction-5s` (U25-01-L) | E; label support; quench context |
| `value` | Numeric endpoint result, interpreted only with endpoint and value_unit. | `number?` | value_unit | any finite number | `13.5` (U25-01-L) | V4, V5; label support; V quench context |
| `value_unit` | Unit/category attached to value. | `string?` | enumerated | `% O2`, `kPa O2`, `cm/s`, `mm/s`, `pass/fail` | `% O2` (U25-01-L) | V5; label support and quench context |
| `outcome` | Categorical observation; consumption/blowoff is not an oxygen-limit measurement. | `string?` | none | `spread`, `no-spread`, `quenched`, `blowoff`, `no-ignition`, `consumed` | `quenched` (B14-GMT45-T4) | V4, V6; label support and coverage |
| `uncertainty` | Source uncertainty text; not stated means unknown. S4 parses usable uncertainty for margins; unparseable text does not supply a numeric error. | `string` | source-dependent | any nonempty string | `not stated` (PSI25-B1) | V3; U and NEAR margin |
| `run_id` | Source's run identifier; S1 permits an em dash if absent. | `string` | none | any nonempty string | `B1` (PSI25-B1) | Traceability; holdout grouping input |
| `source_key` | Key resolving a NASA source in metadata sources. | `string` | none | any nonempty string | `BASS2-TM` (PSI25-B1) | V2 resolution; citations |
| `source_locator` | Page, section, figure, table or other precise source locator. | `string` | none | any nonempty string | `slide 14 left blue reference; paper Fig. 7 p. 8` (U25-01-L) | V3; citations |
| `external_heat_flux_kw_m2` | External heat flux; blank is unknown, zero requires evidence of none. | `number?` | kW/m^2 | >= 0 | blank (`null`); no nonempty CSV example | H |
| `limit_approach` | How a measurement approached a limit. | `string?` | none | `lower-flow`, `raise-flow`, `lower-o2`, `fixed` | `lower-o2` (M25-FS-G) | A |
| `pass_criterion` | Source test pass/extinction criterion, retained as free text. | `string?` | source-dependent | any string | `extinguishes before end of drop; normally four passes below surviving case` (U25-01-L) | A |
| `test_duration_s` | Reported test duration. | `number?` | s | > 0 | `5` (U25-01-L) | No direct S4 comparison rule |
| `notes` | Free-text qualifications and conversion/editorial notes. | `string?` | none | any string | `Draft only: endpoint and numeric result unresolved. Film classified as sheet by editorial inference; geometry convert...` (PSI25-B1; excerpt) | No direct S4 comparison rule |
| `holdout_group` | Merged group of linked runs, reused samples and sources to prevent holdout leakage. | `string` | none | any nonempty string | `BASS-II` (PSI25-B1) | S1 evaluation source-group exclusion |
| `review_status` | Review gate; only verified rows may drive rule labels. Reviewed is excluded like draft (V2 C6). | `string` | none | `draft`, `reviewed`, `verified` | `draft` (PSI25-B1) | V4; label eligibility and quench context |
| `verified_by` | Issue/PR identifying verification; validator does not require it even for verified rows. | `string?` | none | any string | blank (`null`); no nonempty CSV example | Verification audit trail |

## Provenance columns

These are retained verbatim and do not drive S4 comparison or labels. Allowed values for every provenance column are any string or null; controlled vocabularies, calibration and formats are unknown unless explicitly stated below. Some are also used by [retrieval source selection](../src/rules/retrieve.js); retrieval may search other retained text without interpreting it as a measurement.

| Name | Meaning | Type | Unit | Allowed values | Example (evidence ID) | Rules / use beyond V1 |
|---|---|---|---|---|---|---|
| `investigation` | Source investigation name/identifier retained as provenance. | `string?` | none | any string or null | `BASS-II (PSI-25)` (PSI25-B1) | Provenance only |
| `pi` | Source principal-investigator text. | `string?` | none | any string or null | `Bhattacharjee` (PSI25-B1) | Provenance only |
| `as_run_number` | Source as-run identifier; numeric-looking text is not converted. | `string?` | none | any string or null | `7` (PSI25-B1) | Provenance only |
| `sample_id` | Source sample identifier. | `string?` | none | any string or null | `147` (PSI25-B1) | Provenance only |
| `date_source` | Source date text; format/timezone unknown, no date parsing. | `string?` | unknown | any string or null | `2/19/2014` (PSI25-B1) | Provenance only |
| `material_source` | Original material description before normalization. | `string?` | none | any string or null | `100 micron PMMA film   2 cm wide` (PSI25-B1) | Provenance only |
| `gravity_regime` | Source gravity-regime text. | `string?` | source-dependent | any string or null | `ISS microgravity` (PSI25-B1) | Provenance only |
| `flow_configuration` | Source flow-configuration text. | `string?` | source-dependent | any string or null | `opposed` (PSI25-B1) | Provenance only |
| `flow_restrictor_source` | Source flow-restrictor notation; calibration/unit unknown. | `string?` | unknown | any string or null | `2` (PSI25-B1) | Provenance only |
| `fan_display_source` | Original fan display notation; calibration/unit unknown, not a calibrated speed. | `string?` | unknown | any string or null | `62` (PSI25-B1) | Provenance only |
| `air_display_source` | Original air display notation; calibration/unit unknown. | `string?` | unknown | any string or null | `5` (PSI25-B1) | Provenance only |
| `o2_initial_calibrated_vol_pct` | Initial calibrated oxygen concentration text; not an extinction endpoint. | `string?` | vol % O2 (column name) | any string or null | `22.2` (PSI25-B1) | Provenance only |
| `o2_final_calibrated_vol_pct` | Final calibrated oxygen concentration text; not an extinction endpoint. | `string?` | vol % O2 (column name) | any string or null | `22.2` (PSI25-B1) | Provenance only |
| `observation_paraphrase` | Paraphrased source observation. | `string?` | none | any string or null | `Flame was predominantly blue; soot appeared on the underside.` (PSI25-B12) | Provenance only |
| `condition_source_title` | Title of source supporting test conditions. | `string?` | none | any string or null | `NASA PSI-25 Experimental table BASS-II` (PSI25-B1) | Provenance only |
| `condition_source_url` | URL of source supporting test conditions. | `string?` | none | any string or null | `https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf` (OF12-NOMEX-1G-MOC) | Provenance only |
| `condition_source_locator` | Locator supporting test conditions. | `string?` | none | any string or null | `PI=Bhattacharjee; Test #=B1; Sample #=147; Date=2/19/2014` (PSI25-B1) | Provenance only |
| `observation_source_title` | Title of source supporting the observation. | `string?` | none | any string or null | `Burning and Suppression of Solids-II (BASS-II) Summary Report; NASA/TM-20210011385` (PSI25-B1) | Provenance; retrieval source title |
| `observation_source_url` | URL of source supporting the observation. | `string?` | none | any string or null | `https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf` (B14-GMT45-T4) | Provenance; retrieval source URL |
| `observation_source_locator` | Locator supporting the observation. | `string?` | none | any string or null | `p. 9 Appendix, GMT45-T4` (B14-GMT45-T4) | Provenance; retrieval source locator |
| `caveat` | Source/extraction limitations. | `string?` | none | any string or null | `Initial/final oxygen is not an extinction oxygen measurement; mixed fan and air strings are source notation, not a ca...` (PSI25-B1; excerpt) | Provenance only |
| `source_keys_research` | Original research source keys; delimiter/resolution contract unknown (examples use semicolons). | `string?` | none | any string or null | `S2;S3;S5` (PSI25-B1) | Provenance only |
| `source_title` | Retained research source title. | `string?` | none | any string or null | `Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results (presentation)` (U25-01-L) | Provenance only |
| `source_url` | Retained research source URL. | `string?` | none | any string or null | `https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf` (OF12-NOMEX-1G-MOC) | Provenance; retrieval fallback URL |
| `endpoint_source` | Original endpoint wording/code before mapping; full vocabulary unknown. | `string?` | none | any string or null | `uhoi-extinction-5s` (U25-01-L) | Provenance only |
| `gravity_source` | Original gravity notation before normalization. | `string?` | source-dependent | any string or null | `0g` (PSI25-B1) | Provenance only |
| `gravity_context` | Additional gravity/simulation context. | `string?` | source-dependent | any string or null | `simulated lunar acceleration in centrifuge; buoyant velocity unknown` (U25-01-L) | Provenance only |
| `pressure_psia` | Original pressure text; not automatically converted by the CSV builder. | `string?` | psia (column name) | any string or null | `8.2` (U25-01-L) | Provenance only |
| `extraction_method` | Research extraction-method text; controlled vocabulary unknown. | `string?` | none | any string or null | `digitized_plot_reference` (U25-01-L) | Provenance only |
| `evidence_kind` | Research evidence classification; controlled vocabulary unknown. | `string?` | none | any string or null | `reported-experimental-limit` (M25-FS-G) | Provenance only |
| `value_qualifier` | Research value qualifier; controlled vocabulary unknown. | `string?` | none | any string or null | `approximately` (M25-FS-G) | Provenance only |
| `research_status` | Original research workflow status; vocabulary unknown, does not replace review_status. | `string?` | none | any string or null | `draft` (PSI25-B1) | Provenance only |

## Interpretation limits

`o2_partial_kpa` is derived as `o2_pct * pressure_kpa / 100`, not a CSV column; it is unknown if either input is unknown. Initial/final oxygen provenance must not be substituted for a measured oxygen-limit endpoint. A fan display must not be substituted for calibrated flow speed.

V2 U1/U2 require oxygen coverage and adequate known pressure before a no-burning observation supports the corresponding label; schema acceptance alone does not establish comparability. An endpoint code or `review_status: verified` is not permission to generalize across endpoints, geometry, pressure or gravity. V2's suggested `material_grade` and `provenance_json` columns are not present or accepted by this validator. Do not add them based on this dictionary.

The specifications do not fully define every endpoint abbreviation or provenance vocabulary. Preserve source wording and consult the NASA source rather than infer those missing definitions. Label wording follows the project rules: "burned in testing at these conditions", "close to a measured limit", or "not found in the sources reviewed".
