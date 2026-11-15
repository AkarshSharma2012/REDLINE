# Adding and verifying an evidence row

The human-edited source is [data/evidence.csv](../data/evidence.csv); [data/metadata.json](../data/metadata.json) holds source and material dictionaries. Never hand-edit generated `data/evidence.json`. The primary dataset is the [NASA PSI Data Repository](https://psi.nasa.gov/); use its investigation records and linked NASA reports to trace each claim.

This guide follows the current [validator](../src/schema/validate.js) and [builder](../scripts/build-evidence.mjs). For rationale, see [S1 §4](specs/architecture.md), [S4](specs/evidence-engine.md), and [V2 C1/C3/C6](specs/review.md). Passing validation checks structure, not scientific correctness.

## 1. Find the actual observation

1. Start with the relevant PSI investigation and follow its NASA report or NTRS link. Confirm the title, report number, version and experiment before extracting anything.
2. Open the PDF and locate the table, figure or run log. Search for the material or test ID, then visually check the column headings, units, caption, footnotes and surrounding methods. PDF text extraction can scramble columns.
3. Record both PDF page number and printed page number, plus table/figure, test ID and sample/run ID. A paper title alone is not a reproducible locator.
4. Trace geometry, atmosphere, gravity, flow and heating to their own methods/table locators. If conditions and observations come from different documents, retain both citations in provenance. Do not attach conditions from a different run merely because the material matches.
5. Distinguish a measured spread limit from ignition, consumption, extinction, a fan setting, or initial/final oxygen. If an endpoint or calibration cannot be established, keep the row draft and explain the gap. Do not manufacture a numerical result from a qualitative observation.

## 2. Fill the CSV columns

Copy the existing header unchanged. Add one row per published outcome/condition; use a unique ID and avoid duplicating the same measurement from another publication. Use UTF-8 CSV, quote cells containing commas or newlines, and double embedded quotation marks. Numeric cells contain decimal numbers only, without units or surrounding spaces. An empty nullable cell becomes JSON `null`; do not type `null`, `unknown`, a dash or zero into a numeric cell. Zero is a measurement, not a missing-value marker.

The following covers every core column in CSV order. Allowed tokens are case-sensitive; [FIELDS, ENUMS and PROVENANCE_KEYS](../src/schema/validate.js) are the executable reference.

| Column | What to enter/check |
| --- | --- |
| `evidence_id` | Unique stable row ID; retain it when correcting an existing observation. |
| `material` | Source's full material name, including grade/colour/composition. |
| `material_id` | Existing key in metadata `materials`; ETFE and PTFE are distinct. |
| `form` | `sheet`, `rod`, `fabric`, `tape`, `wire`, `slab`, `foam`, or `other`; explain editorial mappings. |
| `thickness_mm` | Positive thickness/diameter in mm, or blank if unknown. Record original units and conversion. |
| `width_mm` | Positive width in mm, or blank if unknown/not applicable (e.g. rod). |
| `flow_speed_cm_s` | Calibrated speed in cm/s, ≥0, or blank. A fan display is not speed. |
| `flow_direction` | `opposed`, `concurrent`, `quiescent`, or `upward-buoyant`, supported by the setup description. |
| `o2_pct` | Applicable oxygen volume percentage, 0–100, or blank; do not substitute a limit or initial/final reading without justification. |
| `pressure_kpa` | Positive total pressure in kPa, or blank. Do not assume atmospheric pressure. |
| `gravity_g` | Nonnegative gravity in Earth-g units; 0 and 1 represent microgravity and Earth reference classes. Preserve measured acceleration/regime and any editorial mapping in provenance. |
| `facility` | `ISS`, `free-flyer`, `drop-tower`, `aircraft`, or `ground`. |
| `endpoint` | Source-supported `LOC-FS`, `LOC-FR`, `quench-limit`, `blowoff-limit`, `MOC-T1`, `LOI-D2863`, `ignition`, `spread-rate`, `burn/no-burn`, `MOC`, `ULOI`, or `extinction-5s`; blank if unresolved. Preserve the original endpoint/criterion. |
| `value` | Numeric endpoint result or blank; retain inequalities, ranges and plot-read limitations in provenance, not as an invented exact value. |
| `value_unit` | `% O2`, `kPa O2`, `cm/s`, `mm/s`, or `pass/fail`; required when `value` is populated. |
| `outcome` | `spread`, `no-spread`, `quenched`, `blowoff`, `no-ignition`, or `consumed`, or blank if unresolved; required for `burn/no-burn`. Do not equate these outcomes. |
| `uncertainty` | Source uncertainty/range, or `not stated`; never blank. Distinguish extraction uncertainty from reported uncertainty. |
| `run_id` | Source run/test ID, or `—` if none is stated. |
| `source_key` | Key resolving to metadata `sources`. |
| `source_locator` | Nonempty page/table/figure/run locator sufficient to reproduce the extraction. |
| `external_heat_flux_kw_m2` | Nonnegative external flux in kW/m²; blank if unknown. Enter 0 only with evidence of no imposed flux. |
| `limit_approach` | `lower-flow`, `raise-flow`, `lower-o2`, `fixed`, or blank. |
| `pass_criterion` | Source's operational criterion, including starred/smolder/flame distinctions, or blank. |
| `test_duration_s` | Positive duration in seconds, or blank. |
| `notes` | Conversions, assumptions, conflicts and unresolved checks; cite locators. |
| `holdout_group` | Shared group for linked runs/samples/sources; preserve existing grouping so duplicate observations cannot leak across evaluation splits. |
| `review_status` | Begin with `draft`; follow step 4 before promotion. |
| `verified_by` | Review issue/PR reference when verified; otherwise blank. |

Keep all existing provenance columns. They are optional strings/null, even where their names look numeric:

- Identity: `investigation`, `pi`, `as_run_number`, `sample_id`, `date_source`, `material_source`.
- Conditions: `gravity_regime`, `flow_configuration`, `flow_restrictor_source`, `fan_display_source`, `air_display_source`, `o2_initial_calibrated_vol_pct`, `o2_final_calibrated_vol_pct`.
- Separate citations: `condition_source_title`, `condition_source_url`, `condition_source_locator`, `observation_source_title`, `observation_source_url`, `observation_source_locator`.
- Interpretation: `observation_paraphrase`, `caveat`, `source_keys_research`, `source_title`, `source_url`, `endpoint_source`, `gravity_source`, `gravity_context`, `pressure_psia`, `extraction_method`, `evidence_kind`, `value_qualifier`, `research_status`.

Use these to retain original notation, qualifiers, conversion steps and each field's source. `research_status` does not replace `review_status`. Do not add arbitrary columns: the builder rejects unknown headers. Oxygen partial pressure is derived as `o2_pct × pressure_kpa / 100`; do not add it as a CSV column.

For a new source/material, update the appropriate metadata dictionary as part of an authorized data change. Sources require title, authors, publication year and a NASA URL; materials require ID, display name and aliases. Every value and label needs a NASA citation, not just a general repository link. If required nonnullable information is unavailable, record the gap in research notes rather than inventing a valid-looking row.

## 3. Worked example: inspect existing `PSI25-B1`

This is a walkthrough of the existing draft, not a new independent verification or a row to append again.

1. Open the [BASS-II summary report, NASA/TM-20210011385, PDF page 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111). Locate **Table A.1, printed page 103, test B1, as-run 7**, sample 147, dated 2/19/2014. Check gravity context in §2.1. Reopen the PDF yourself before signing a review.
2. Cross-check the [PSI-25 experimental table](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=67a3a17b09ed061032c19775&version=1&studyVersion=4) using PI Bhattacharjee, test B1, sample 147 and the same date. Keep this separate condition citation.
3. Compare the existing CSV cells with these recorded claims:

| Fields | Existing row / check |
| --- | --- |
| Identity | `evidence_id=PSI25-B1`, `material_id=pmma`, `run_id=B1`, `source_key=BASS2-TM`, `holdout_group=BASS-II`. |
| Material/geometry | Source name `100 micron PMMA film   2 cm wide`; `form=sheet` is an editorial mapping; 100 µm ÷ 1000 = `thickness_mm=0.1`; 2 cm × 10 = `width_mm=20`. |
| Environment | `flow_direction=opposed`, `gravity_g=0`, `facility=ISS`; provenance retains `ISS microgravity`. Calibrated flow, total pressure and heat flux remain blank. |
| Raw readings | Provenance retains flow restrictor `2`, fan display `62`, air display `5`, initial/final O2 `22.2`/`22.2`. These are not calibrated speed or an extinction limit. |
| Observation | Existing paraphrase: ignition followed by spread; stopping flow halfway was followed by rapid extinction. Check it against the report's actual wording. |
| Quantitative fields | `endpoint`, `value`, `value_unit`, `outcome` and core `o2_pct` remain blank; `uncertainty=not stated`. Limit approach, pass criterion and duration are blank. |
| Traceability/review | Preserve both condition and observation URLs/locators, original material/readings, caveat and notes; `review_status=draft`, `verified_by` blank. Other unused provenance cells stay blank. |

4. Record what was checked and what is unresolved. The existing note says V1 #31 checked transcription only. That does not establish a quantitative endpoint. Leave B1 `draft`: the validator requires an endpoint and core oxygen level plus a value or outcome for `verified`. Do not copy 22.2 into a limit field just to make validation pass.

## 4. Verify and set review status

Ask a second reviewer to reopen the cited sources independently. In the review issue/PR, record row IDs, reviewer/date, exact locators, condition/result checks, conversions, uncertainty, and remaining disagreements. Preserve completed checklists separately: `node scripts/verification-checklist.mjs` regenerates `docs/verification-checklist.md` for draft rows and resets manual checkmarks/signatures.

Use this workflow:

- `draft`: extraction incomplete, quantitative interpretation unresolved, or independent review pending.
- `reviewed`: review performed but unresolved checks prevent release. Both `draft` and `reviewed` are excluded from label inputs.
- `verified`: independent checks support the specific row, citations and endpoint. Set `verified_by` to the review issue/PR. Verified does not mean every cabin condition is covered or every endpoint drives a label.

A verified row must have non-null `endpoint` and `o2_pct`, and at least one of `value`/`outcome`. Unknown pressure **may remain blank** under S4 §9 / V2 C3; preserve the gap rather than guessing. The validator does not enforce a review signature, so a successful build is not permission to skip review. If a correction undermines a verified result, return it to draft pending re-review and explain why.

Use the approved wording: “burned in testing at these conditions”, “close to a measured limit”, and “not found in the sources reviewed”. Do not turn a missing match into a universal claim. Keep lunar estimates distinct from measured rows; do not encode an interpolated 0 g/1 g estimate as a measured lunar result.

## 5. Build, test and submit

From the repository root, with Node ≥22.12 and no dependency installation:

```sh
node scripts/build-evidence.mjs
node --test
git diff --check
git diff -- data/evidence.csv data/metadata.json data/evidence.json
```

The builder converts CSV blanks to null, validates the complete package and atomically replaces `data/evidence.json` only on success. Fix errors at the named row/column in the CSV or metadata, then rebuild. After any final review-status change, rebuild and run the tests again. Inspect generated changes, including expected `built_at`/`built_from` provenance; do not repair generated rows manually.

Tests check schema and behavior, not whether a PDF supports the measurement. Include the independent review record and command results in the PR. Commit the CSV, any authorized metadata changes and regenerated JSON together on the task branch; submit a PR rather than pushing to main. If file ownership excludes a needed data/metadata change, document the dependency in root `HANDOFF.md` for the owning task. This workflow needs no web server or persistent process.
