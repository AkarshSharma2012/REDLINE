# REDLINE screen specifications

Issue #28. Pre-kickoff specification only; no implementation or stack decision.

## Status and interpretation

All layouts, interactions, timings, field contracts and acceptance criteria in this document are **design inferences/proposals**, not NASA findings or implemented behavior. Scientific content must resolve through the source register below and retain its locator beside the displayed value. Hypothetical cabin choices are user inputs, not claims about installed rover hardware.

The latest issue #28 instructions override older README wording: missing coverage reads **Not found in the sources reviewed**. A source-backed result describes testing at its stated conditions; it does not certify a cabin.

## NASA source register

Keys below are shorthand for the complete title, URL and locator, not substitutes for them in the finished UI. PDF page numbers are one-based unless a printed page is specified.

| Key | Title and URL | Locator and use |
|---|---|---|
| U25 | Urban et al., [Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf), ICES-2025-392 | pp. 5–8 methods; Figs. 7–10 p. 8, Figs. 11–12 p. 9; Table 2 p. 11. Ground-flow predictions versus short-duration simulated-lunar results. |
| OF12 | Olson and Ferkul, [Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf) | pp. 2–4 methods/criteria; Table I and Eq. (1), p. 6. Historical Nomex fabric comparison, distinct from Velcro. |
| M16 | Marcum, Olson and Ferkul, [Correlation of normal gravity mixed convection blowoff limits with microgravity forced flow blowoff limits](https://ntrs.nasa.gov/api/citations/20160012691/downloads/20160012691.pdf) | pp. 6–9, Figs. 4–6 and Table 1. Calibrated PMMA blowoff correlation and transfer limits. |
| A15 | Abercromby, Conkin and Gernhardt, [Modeling a 15-min extravehicular activity prebreathe protocol using NASA's exploration atmosphere (56.5 kPa/34% O2)](https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf) | Abstract, journal p. 76/PDF p. 1; Table 1, journal p. 77/PDF p. 2. Atmosphere context and model-versus-validation distinction. |
| B22 | Ewert, Chen and Powell (editors), [Life Support Baseline Values and Assumptions Document](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf), NASA/TP-2015-218570/REV2, February 2022 | §4.6.3.6, printed p. 142/PDF p. 156. Dated exploration atmosphere/pre-breathe baseline, with suit-pressure assumption. |

These NASA PDFs were opened as text for this task. U25 chart screenshot requests failed; no graph coordinates were independently digitized here. The R3 extraction remains review-gated. A separate 2020 workshop PDF timed out; its table is not used here. No inaccessible source supplies a value.

## 1. Shared contract (design inference)

Everything below is a proposed interface, not implemented behavior. Screen IDs describe navigation, not a framework. Do not choose or change the stack here.

- Header: REDLINE, “Evidence review, not cabin certification”, dataset revision/date and review status. Navigation: Cabin Check, Gravity, Oxygen tradeoff, Accuracy. Evidence opens from an item with a named Back to cabin control.
- Preserve one scenario across navigation: scenario name, item IDs, material/product/form/use, oxygen volume %, absolute total pressure with unit, forced airflow speed/direction and requested gravity. Unknown means “Not specified”, never zero.
- Use AGENTS.md dark, high-contrast pro-tool styling. No gradients, glass, emoji or decoration. DESIGN.md was absent locally and from the fetched #27 snapshot; eventual design tokens must preserve these content requirements.
- Every scientific value, outcome, interpreted label and chart mark has an adjacent source control. Its disclosure shows full title, NASA URL, page/figure/table, row/run ID, exact specimen, conditions, endpoint, review status and uncertainty. No source/locator means no scientific value or label. Coverage messages link the reviewed source inventory/version instead of inventing a supporting experiment.
- Source disclosure is a side panel on wide displays, stacked region on narrow displays; Close/Escape restores focus to its opener. External links are explicitly named and retain a readable locator. Do not promise a PDF viewer will jump to a figure.
- Sources temporarily offline: retain previously reviewed metadata marked “Original source currently unavailable”, with URL/locator and retry. Without a verified local record, withhold the value. Retrieval failure is not absent evidence.
- Visible labels, units, keyboard operation, focus indicators, text status plus shape/border, table headers and chart data tables are required. Stack inputs above results on narrow displays; preserve fields in expandable detail, not silent omission. Changes announce status without stealing focus.
- Back restores selected item, filters, input and scroll. Preview edits are separate until Apply. No remote writes, accounts or persistence promise is introduced.

### Results and state vocabulary

The UI reads the shared engine's label, reason and cited records; it never creates its own thresholds. Proposed strings:

| Result | Required disclosure |
|---|---|
| Burned in testing at these conditions | Observed outcome, actual test conditions, source and every difference from the scenario. This is not a cabin prediction. |
| Close to a measured limit | Measured endpoint/value, uncertainty or “Not stated”, distance with units and proximity rule marked “REDLINE inference”. |
| Not established - no burning found in comparable records at this setting | Comparable records and search scope; no general clearance claim. |
| Not established - evidence is incompatible | Excluded records and exact mismatch reasons. |
| Not found in the sources reviewed | Reviewed inventory/version and exact requested combination. |
| Estimate / assumed envelope between 0 g and 1 g results | Both source-backed endpoint-gravity results plus explicit unvalidated-bound warning; no single lunar threshold. |

Root AGENTS.md requests a 0 g/1 g range. Show it only as an **assumed envelope**, separate from simulated-gravity measurements. Historical Nomex results use differing gravity endpoints/criteria [OF12, pp. 2-4, Table I p. 6]. **Inference:** a universal physical bound is not established by that comparison. Do not clamp simulated-gravity data inside the envelope. Missing or incompatible endpoint pairs mean “Envelope unavailable”. Science/schema review is required before changing the engine; this spec changes no rules.

| Shared state | Visible behavior |
|---|---|
| Initial loading | Named loading message; no placeholder values or outcome badges. Inputs remain editable. |
| Recalculating | “Updating for these conditions”; old results lose current status. If retained, label with previous conditions. Discard out-of-order responses. |
| Zero reviewed rows | Usable form plus reviewed inventory; no numeric labels from draft rows. Draft inspection is separate. |
| Invalid input | Associated inline error; Evaluate error summary links to fields; preserve entries and block evaluation. |
| Data/engine failure | Retry and explicit failure; never substitute a coverage or no-burning result. |
| Partial results | Keep usable results and explicitly identify unavailable items/series. |

Do not display certification, approval, a safe-material score or predictions of future lunar burning. Unknown is not zero; graph extrapolation is not measurement; oxygen percentage points are distinct from relative percent change.

## 2. Cabin Check (`cabin`)

### Purpose

Build an illustrative rover/habitat material list with use and conditions; inspect per-item evidence, sources and mismatches. This is a structured form, not a geometry editor.

### Layout

```text
+------------------------------------------------------------------+
| REDLINE  Cabin Check | Gravity | Oxygen tradeoff | Accuracy        |
| Evidence review, not cabin certification       Dataset [revision] |
+-----------------------------+------------------------------------+
| SCENARIO                    | RESULTS FOR [scenario revision]    |
| Name [ ] Rover ( ) Habitat   | O2 / pressure / flow / gravity     |
| Preset [Custom v] [Source]   | Counts: support / gaps / exclusions |
| O2 [ ] vol% Pressure [ ]     | Item | label + source | mismatches |
| Unit [kPa v]                | [item] [Evidence]                  |
| Flow [ ] cm/s [direction v]  | [item] [Evidence]                  |
| Gravity [lunar scenario v]   |                                    |
| ITEMS               [+ Add] | Selected item: requested vs tested |
| [material] [use/location]    | [Open evidence] [Gravity context]  |
| [form] [dimensions/details]  |                                    |
| [Remove]                    | Gap / candidate experiment question|
| [Evaluate cabin]            | [Edit item] [Oxygen tradeoff]       |
+-----------------------------+------------------------------------+
```

### Every element and behavior

1. Scenario name and Rover/Habitat toggle. Toggle changes context only, not matching. Explicit Reset clears this scenario; preset changes never delete items.
2. Preset dropdown: Custom and sourced atmosphere pairs, with source/date/category. Proposed illustrative default: **8.2 psia / 34% oxygen**, a dated baseline recommendation [B22, section 4.6.3.6, printed p. 142/PDF p. 156], not a flight requirement. Selecting a preset applies pressure and oxygen together; manual edits switch to Custom.
3. Oxygen numeric input (% by volume), absolute pressure numeric input and kPa/psia unit selector. Optional partial pressure reads “Calculated: fraction x total pressure”, with input provenance. Reject nonfinite input, oxygen outside 0-100%, pressure at/below zero. These are syntax-validation choices, not a habitable range.
4. Forced airflow speed (cm/s), unknown option and direction dropdown: opposed, concurrent, quiescent, upward-buoyant, unspecified. Help defines direction relative to flame spread in the experiment, not a computed cabin flow field. Reject negative speed and nonzero-speed/quiescent conflict. Unknown is distinct from quiescent. Do not invent universal flow-regime cutoffs.
5. Gravity: Earth reference, microgravity reference, lunar scenario. Query context never relabels ISS or centrifuge records as lunar-surface measurements.
6. Item editor: stable item ID, user item name, catalog material search, exact grade/product, custom-name option, use/location, physical form, thickness/diameter (mm), exposed width (mm). Expandable details: areal density, backing/core, coating and heating with unknown option. Missing detail is explicit. Custom names cannot inherit catalog evidence silently.
7. Proposed illustrative uses: PMMA panel, cotton clothing, P213 tape and Nomex fabric covering. These are scenario hypotheses, not NASA vehicle bill-of-materials facts. Use/location is contextual, not an installation-specific model. Nomex Velcro is separate from fabric. Duplicate materials with different form/use remain separate items.
8. Add item, Remove with adjacent Undo and Evaluate cabin. Initial evaluation is explicit; later valid edits may recalculate under the stale-result rule. No numeric outcome is promised for these illustrative items.
9. Result rows in input order: item/use, exact material/form, full result string, source(s), reviewed evidence count, mismatch count/summary and Open evidence. Summary counts describe evidence labels, not a physical fire-risk percentage.
10. Expanded row: requested/tested conditions with units, specimen, endpoint and every mismatch. Lead with consequential exclusions. Keep conflicting/flagged evidence visible; never select only a convenient record.
11. Open evidence carries item/scenario identity. Gravity context selects material/endpoint. Oxygen tradeoff copies the scenario into preview. Gap card lists missing conditions as “Candidate experiment question / REDLINE inference”, linked to source inventory; no NASA scheduling/acceptance claim.

### States

- Empty: “Add a material to compare evidence”; Add item available, Evaluate disabled with reason; no zero-risk count.
- Unknown identity: ask for material; unknown dimensions remain warnings, not defaults. Missing atmosphere fields block evaluation.
- Loading/recalculating/error: shared rules; item-level retry for partial failure.
- No evidence: preserve item and exact query, show inventory. All incompatible: excluded count and mismatch link. Draft-only: inspect draft, but no reviewed numeric label.

### Data read

S1 `materials`, `cabin_presets`, `sources`, `evidence` and dataset metadata; local scenario/items; S4 `labelCabin` output (`label`, `reason`, `cited`, `flags`, `flag_details`, `cross_gravity`, `estimate`, `wording`). Matching inputs include material ID/form/dimensions, O2, total pressure, forced flow/direction, gravity and heating. Use/location remain local context. Scientific labels consume reviewed records only.

## 3. Evidence view (`evidence`)

### Purpose

Rank experiments for one item and explain why each matches, partially matches or is excluded, separating recorded outcome from applicability.

### Layout

```text
+------------------------------------------------------------------+
| [Back to cabin: item]     EVIDENCE: [exact material/product]        |
| Request: form / dimensions / O2 / pressure / flow / gravity         |
+----------------------------+-------------------------------------+
| Filter [All reviewed v]     | SELECTED EXPERIMENT                  |
| Sort [Match] [Why order]    | Title / run / status / locator       |
| [Inspect drafts: off]      | Original outcome / endpoint / units |
| Counts: compared/excluded  | Field     Requested Tested Verdict  |
| 1 [Comparable with notes]  | form      ...       ...    ...      |
|    title / first reason    | pressure / flow / g / endpoint / ...|
| 2 [Excluded]               | [Open NASA source] [Source details] |
|    endpoint mismatch       | Supports / does not establish        |
+----------------------------+-------------------------------------+
```

### Every element and behavior

1. Named Back control, material/product and use heading, immutable request summary with scenario revision. Returning from changed cabin refreshes against that revision, not a stale request.
2. Counts: reviewed, comparable, flagged, excluded and draft. Filters: All reviewed, Comparable, With mismatches, Excluded; Clear filters when active. Draft inspection off by default, visibly outside labeling.
3. Candidate card: ordinal, title/run ID, exact specimen/form, facility/gravity, endpoint, outcome/value/unit, review status, match grade and first reason. No unsupported confidence percentage.
4. **Proposed deterministic ranking:** no-notes comparable first, comparable-with-notes second, excluded last; within group ascending non-OK rule count then stable evidence ID. Drafts are a separate final group. Why order explains this editorial ranking. S4 cited-row order is not a ranking of every candidate; call `compareRow` for all candidates. Sorting never makes exclusions eligible.
5. Detail header: full title, authors/year when known, run/sample ID or “Not stated”, review state, source URL/locator. Preserve original endpoint/value and reported outcome.
6. Comparison table includes every field: material/grade, form, thickness/diameter, width, oxygen fraction, pressure, forced flow speed/direction, gravity, facility/duration, heat flux, endpoint, approach/pass criterion and uncertainty. Each row shows requested/tested values, units, OK/mismatch/excluded/unknown and reason. Unspecified is not “matched”.
7. Separate “Recorded outcome” from “Applicability to this request”. Second block shows engine grade, full result and all rule notes. Plain language first, rule IDs in detail. Cross-gravity and short-duration caveats visible above fold.
8. “Supports this statement” is a bounded sourced claim. “Does not establish” names a missing endpoint or cabin inference. No generated explanation may invent conditions. Supporting/conflicting record links switch selection without clearing request.
9. Source preview failure retains metadata, locator and explicit Open NASA source link.

### States

- No origin item: Choose a cabin item. No request-free ranking.
- No candidates: coverage message/inventory, no fake rank 1. Empty filter: Clear filters.
- Loading: request remains, separate list/detail indicators. Selected ID missing after revision: explicit unavailable record, no silent substitution.
- All excluded: preserve ranked list and mismatch details. Draft-only: no reviewed result. Compare/data failure: Retry, not a coverage conclusion.

### Data read

Scenario/item snapshot, all candidate rows and sources, optional draft rows, S4 `compareRow` grade and all rule reasons, `labelMaterial` output and cited IDs. Read R1/S1 fields, review status, verifier, notes and provenance. UI ranking cannot change engine eligibility or outcomes.

## 4. Gravity view (`gravity`)

### Purpose

Compare Earth-based predictions with **measured simulated-lunar-gravity** results for the requested material families. Preserve specimen, facility, endpoint and airflow context. Short-duration centrifuge testing is distinct from a lunar-surface experiment [U25, pp. 5-8].

### Layout

```text
+------------------------------------------------------------------+
| GRAVITY [Back to cabin]        Request: material / pressure / flow  |
| Earth-based prediction vs measured simulated-lunar result          |
| Not measurements on the lunar surface                             |
+------------------------------------------------------------------+
| [PMMA] [Cotton] [P213] [Nomex: Velcro / HT90-40 fabric]             |
| Endpoint [ ] Condition group [ ] [Original sources]                |
+--------------------------------------+---------------------------+
| O2 limit (vol%)                      | DATA TABLE                |
| measured symbol / bracket            | series / value / basis    |
| fitted line / dashed extension       | endpoint / source / status|
| no continuous gravity curve          | uncertainty / limitations |
| Airflow (cm/s), when reported         | [Open evidence record]    |
+--------------------------------------+---------------------------+
| Qualitative flow context: low / intermediate / high                |
| Separate 0 g / 1 g assumed envelope [sources] / unavailable         |
| Counter-example: corrected Earth tests can transfer [Source]       |
+------------------------------------------------------------------+
```

### Every element and behavior

1. Subtitle always says simulated-lunar, including chart/table accessible names. No toggle may shorten it to measured-on-Moon. Tabs: PMMA sheet, cotton, P213, Nomex; exact product identity precedes any value.
2. Nomex selector separates 2025 Velcro from historical HT90-40 fabric. Cotton selector separates flaming/smolder endpoints. Preserve source endpoint names if ingestion vocabulary lacks them; no coercion to generic flame-spread limits.
3. Condition selector fixes source, pressure, specimen and method before choosing series. Unknown test flow is not plotted at zero. Highlight cabin differences without converting a source record into a cabin prediction.
4. Chart: oxygen volume % versus forced airflow cm/s, only for supported series. Distinct symbols/styles for measured result, author fit and REDLINE digitized/extrapolated result; named legend. Dashed extrapolation only with reviewed method and locator. Unknown simulated-gravity flow is a separately identified reference band/annotation, not a point at an invented velocity. No unsupported lines.
5. Table is the full chart equivalent: series, measurement/digitization/extrapolation status, endpoint, value/unit, pressure, flow definition or comparison coordinate, gravity/facility/duration, uncertainty type, review status and source. A reading allowance is not instrument uncertainty or a confidence interval.
6. Panel source map: PMMA -> U25 Fig. 7 p. 8; P213 -> Fig. 8 p. 8; cotton flaming -> Fig. 9 p. 8; cotton smolder -> Fig. 10 p. 8; Nomex Velcro -> Fig. 12 p. 9. Historical Nomex fabric -> OF12 Table I p. 6. These are candidate series, not approved engine rows.
7. Review banner: R3 reports plot/text and fit/table discrepancies (see pinned research below). **Inference:** suppress directional summaries and computed differences for disputed pairs pending science review. Keep source and discrepancy note visible. Table 2 compensation factors are not measured oxygen limits [U25, Table 2 p. 11].
8. Qualitative flow strip: low-flow extinction/quenching, intermediate sustaining conditions, high-flow extinction/blowoff; source conceptual boundary [U25, Fig. 1 p. 2]. No universal numeric cutoffs. Show direction and forced/buoyant context. **Inference:** a high-flow correlation cannot establish a low-flow boundary by itself.
9. Separate optional envelope panel follows section 1: endpoint-gravity records, assumed range and warning. No continuous oxygen-versus-gravity curve or guaranteed lunar threshold. Missing/incompatible endpoints mean unavailable, not extrapolation through an invented point.
10. **Counter-example card:** “Corrected Earth tests can reproduce a particular flight boundary.” Marcum's PMMA rod blowoff comparison accounts for buoyancy/blockage and uses flight data in calibration [M16, pp. 6-9, Figs. 4-6]. **Inference:** useful condition-specific agreement, not independent universal Earth-to-space prediction. Show geometry, branch, calibration limitation, source and Open evidence; no invented numerical agreement tolerance.
11. Back preserves cabin; Open evidence passes selected record/material. Source disclosures remain reachable when numeric series are withheld.

### States

- Unreviewed/empty extraction: tabs and source map remain; “Reviewed numeric series unavailable”; no illustrative dots or fabricated limits. R3 draft plot estimates may be inspected only in separately labeled research detail, not cabin results.
- One series missing: show available series, missing counterpart and no delta/connecting line. Missing units/provenance: withhold mark and name missing field.
- Loading/error: separate chart/source-detail messages and Retry. Source disagreement is a review state, not a network failure or invitation to interpolate.
- No compatible endpoint pair: envelope unavailable with material/endpoint/condition reason; simulated-gravity records remain independently inspectable.

### Data read

R3 `lunar-2025-rows.csv` after science review: source title/URL/locator, material/form, endpoint, pressure, gravity context, flow speed, comparison velocity, value/unit, extraction status, uncertainty/method. Historical fabric rows and R4 counter-example context remain distinct. S1 needs a reviewed adapter for custom endpoints, simulation context, fit provenance and editorial allowances; until then use source-linked unavailable states. Do not force these records into S4's current endpoint-gravity estimator.

## 5. Oxygen tradeoff (`oxygen`)

### Purpose

Explore evidence-label changes with oxygen beside **separately sourced protocol context**. Illustrative only: no continuous medical curve or pre-breathe prescription.

### Layout

```text
+------------------------------------------------------------------+
| OXYGEN TRADEOFF (ILLUSTRATIVE) [Back to cabin]                      |
| Pressure / flow / gravity / items held at displayed settings       |
+------------------------------------------------------------------+
| O2 vol% [number] [--------|--------] [Reset preview]                |
| Paired presets [reference] [staged] [baseline] [Source]             |
+---------------------------------+--------------------------------+
| EVIDENCE AT PREVIEW O2           | PUBLISHED PROTOCOL CONTEXT     |
| item | label | change | source  | exact pressure + oxygen pair   |
| gaps / exclusions stay visible  | duration / status / assumptions|
| [Inspect changed item]          | source / date / locator        |
|                                 | no interpolation between pairs |
+---------------------------------+--------------------------------+
| [Apply preview to cabin] [Cancel preview]                          |
+------------------------------------------------------------------+
```

### Every element and behavior

1. Persistent Illustrative heading and complete held-conditions strip. Preview is a copy of the entry scenario. Slider edits oxygen only; no silent pressure/flow/gravity/item changes.
2. Synchronized numeric field and keyboard slider; proposed demo range 21-34 vol%, step 0.1 percentage point (**interaction choices**, not operating limits). Out-of-range existing input remains visible with numeric editing, never silent clamping. Cabin accepts other syntactically valid values under section 2.
3. Reset preview restores entry snapshot. Cancel returns unchanged. Apply writes displayed oxygen, plus pressure only if explicitly selected in a paired preset, then recalculates Cabin Check.
4. Paired presets show both fields and announce both changes: 14.7 psia/about 21% reference [A15, Table 1, journal p. 77/PDF p. 2]; 10.2 psia/26.5% and 8.2 psia/34% baseline contexts [B22, section 4.6.3.6, printed p. 142/PDF p. 156]. Retain dated planning/reference category, not flight-requirement language.
5. Evidence table: original/preview labels per item, sources, all mismatches and gaps. Counts represent engine labels, not how many cabin materials will ignite. No promised monotonic response or guaranteed label change.
6. Protocol list requires a sourced pressure/O2 pairing. Each record displays date, category (historical operation/baseline summary/modeled/chamber-tested only if supported), duration/range, starting atmosphere, prior acclimation/staging, pre-breathe gas, suit pressure, EVA duration/gravity context, validation note and full source locator. Missing assumptions read “Not stated in this source”. No borrowing conditions from another report.
7. Optional example only as **2022 baseline summary**: 8.2/34 -> 15 min; 10.2/26.5 -> 40 min, assuming a 4.3 psia suit [B22, same locator]. Not complete procedures. A15 is model evidence, not a completed human trial [A15, Abstract, journal p. 76/PDF p. 1]. No line connects protocol times.
8. Intermediate oxygen, pressure mismatch or absent protocol: “Pre-breathe duration not found in the sources reviewed for this pairing”. No interpolated time, DCS-risk estimate or recommendation to skip pre-breathe. Material evidence remains independently usable.
9. Source controls and Inspect changed item open Evidence with the preview request visibly named; Back returns to preview, not silently applied cabin values.

### States

- No materials: slider/protocol context usable; Add cabin materials link instead of zero-risk result.
- Missing protocol: explicit coverage message independent of evidence panel. One panel failure leaves the other usable.
- Loading/recalculation: pending O2 visible, old counts not current. Invalid numeric input blocks Apply; retry preserves preview.
- No changed labels: “No label changes in reviewed evidence at these settings”; no implication of no physical effect.

### Data read

Scenario snapshot; original/preview engine results; sourced atmosphere presets; **separate protocol records** with all context/provenance fields above. S1 `cabin_presets` is insufficient if it contains only pressure and oxygen; reviewed protocol-context adapter needed. Pre-breathe data never enters the material-evidence engine.

## 6. Accuracy (`accuracy`)

### Purpose

Compare agreement with held-out observations against the defined naive lookup, exposing refusals, uncertainty and failed checks. This evaluates evidence interpretation, not lunar-cabin fire prediction.

### Layout

```text
+------------------------------------------------------------------+
| ACCURACY [Back to cabin]        [Report status / dataset revision] |
| REDLINE vs naive name-only lookup - held-out observations          |
| Run / split / seed / versions / independent groups / exclusions    |
+------------------------------------------------------------------+
| Metric                  REDLINE k/n         Naive k/n             |
| Selective accuracy      [value or --]        [value or --]         |
| Coverage / under-warning / correct refusal / traceability          |
| Interval method and denominator explained inline                   |
+-------------------------------+----------------------------------+
| [Source] [Gravity] [Endpoint]  | Checks / failed criteria         |
| confusion matrix + refusals   | leakage / source audit / minima  |
+-------------------------------+----------------------------------+
| Query | truth + NASA source | REDLINE | naive | explanation        |
| [Inspect case] [Report details] [Download published results]        |
+------------------------------------------------------------------+
```

### Every element and behavior

1. Banner: Not run / Descriptive only / Evaluation failed / Invalid run / Completed. No mock percentage, default winner or success badge. Distinguish real held-out observations from synthetic fixtures.
2. Method disclosure follows R8 sections 2-3: primary leave-one-source-out; separate secondary leave-one-run-out. Show split/seed, frozen queries, independent source groups, evidence/rules versions, timestamp and adjudication. Never pool the two evaluations.
3. Baseline disclosure follows R8 section 5: exact name normalization, name-only matching, ignored conditions and mixed endpoints. Both methods use identical evidence and held-out removals. This is a project-designed baseline, not a NASA benchmark or description of NASA software.
4. Metric table: selective accuracy = correct/answered; coverage = answered/answerable; under-warning = under-warnings/answered; correct refusal = incompatible controls refused/incompatible controls; absent-data controls as counts; traceability = outputs passing C1-C5/all checked outputs. Refusals remain visible in coverage. No-burning-found is an answer, distinct from incompatible/absent-data refusal.
5. Show k/n with eligible rate and R8-defined interval, method and confidence level. Zero denominator: “Not defined (0 eligible cases)”. Insufficient evaluation uses counts only per R8 section 6, including tooltips/export preview; no percentage headline.
6. Minimum gate (R8 section 6, **project policy**, not NASA requirement): 30 answerable queries from at least five source groups including both endpoint-gravity classes; 12 incompatible and five absent-data controls; independently adjudicated truth. If unmet: “Descriptive only - too few independent tests”.
7. Breakdown selectors: source, gravity class, endpoint with denominators. Matrix: truth rows, answer categories and separate refusal column. Controls have separate tables; no pooled headline alone.
8. Check list mirrors R8 C1-C5 and K1-K7, each pass/fail/not assessed plus count and inspect link. Source-support failures, incompatible answers and leakage visible. Threshold changes after scoring/leakage mean Invalid run with no leaderboard score. Evaluation failure is distinct from loading failure.
9. Query table: query ID/group, exact conditions/specimen/endpoint, independently labeled truth + NASA source/locator, both answers/reasons/cited rows, score, adjudication and failures. Inspect case uses **that split's retained evidence**, not the full runtime catalog that would reintroduce held-out rows.
10. Download published results enabled only for a real report with version/hash. Report details shows omissions/method. Screen is read-only; cabin edits cannot tune or rerun a frozen report.

### States

- No report: “Held-out evaluation not run”, methodology and missing requirements, no scores. Fixture-only report: “Synthetic checks - not held-out accuracy”, excluded from headline.
- Loading: status placeholder only. Malformed or inconsistent revision: “Report cannot be verified for this dataset”, suppress comparison with Retry/details.
- Partial report: completed versus unassessed checks distinct; incomplete denominators prevent Completed status. Empty filter: Clear filters. Offline truth source retains reviewed locator/availability note.
- Failed evaluation: retain results and failed cases/gates. Insufficient evidence stays descriptive even if all available examples agree.

### Data read

R8 frozen queries and `validation-results.csv` section 8: truth source/locator, holdout group, query type, both answers/citations, score, C1-C5. Add a proposed **report adapter** for run metadata, split membership, intervals/denominators, exclusions and K1-K7. S1 specifies evaluation output, not a browser-ready report artifact; adapter is a kickoff dependency, not created here. Truth/supporting rows link NASA sources; metric arithmetic reads “Computed by REDLINE” with report provenance, not false NASA attribution.

## 7. Two-minute demo click-path: illustrative lunar rover

**Design proposal, not rehearsed runtime.** Target 120 seconds. Prepare one reviewed example, one deliberate form mismatch and one absent combination; freeze dataset revision. These item uses are hypothetical, not a real rover manifest. Coordinate spoken wording with W2; this path covers all five requested screens.

| Time | Interaction | Visible evidence / spoken point | Honest fallback |
|---|---|---|---|
| 0:00-0:20 | Cabin Check: select sourced exploration baseline; add prepared PMMA panel, cotton clothing, P213 tape and separate Nomex fabric; lunar scenario. | Material form/use and atmosphere stay visible. “An illustrative rover request, not its materials approval.” Preset: B22 section 4.6.3.6. | Load prepared scenario if implemented; otherwise announce a planned walkthrough using this source-linked spec. |
| 0:20-0:40 | Evaluate; open deliberately mismatched item's Evidence view. | Requested/tested specimen, rank/exclusion reason, full NASA title and locator. “A shared material name does not erase a form mismatch.” This is a proposed matching explanation. | No verified numeric row: inspect source record and draft/exclusion status; invent no outcome. |
| 0:40-1:00 | Open Gravity for selected material; show simulated-gravity label, flow context and counter-example. | “Short-duration simulated gravity is distinct from on-Moon measurement.” U25 methods/figure; M16 calibrated blowoff case. | Source map and withheld-series note if extraction review incomplete. |
| 1:00-1:20 | Oxygen tradeoff: move O2 with pressure/flow fixed; inspect changed or unchanged item. | Evidence at preview O2; protocol context tied to sourced pressure/O2 pair. Intermediate setting shows missing protocol coverage. | Label change not required; explicit no-change/coverage message. |
| 1:20-1:40 | Cancel preview; Accuracy: inspect one held-out case or not-run gate. | REDLINE versus naive counts, coverage/refusals; otherwise say “Held-out evaluation not run”. No lunar-safety claim. | Show method/minimum requirements without scores. |
| 1:40-2:00 | Back to Cabin Check; open absent-combination gap; finish on conditions/source inventory. | “The gap becomes a candidate experiment question. Can each asserted result survive a source check?” Candidate is a REDLINE inference. | Reviewed inventory/gap state; no fabricated NASA request or submission claim. |

Demo acceptance: scenario survives navigation; original source opens with identified locator; mismatch and absence distinct; simulated gravity named; no unrun score narrated as measured. Rehearse after implementation; this schedule does not demonstrate a two-minute runtime.

## 8. Cross-branch provenance and kickoff dependencies

Read fetched refs using `git show` on 2026-11-14. These are project planning inputs, **not primary NASA evidence**. Pins permit reproduction if branches move.

| Input and locator | Pinned document | Use |
|---|---|---|
| R1 sections 2-4 | [Evidence schema/comparability](https://github.com/AkarshSharma2012/REDLINE/blob/278d60b0a20a354cd88bc8c84e3762d4f39f78c8/research/evidence-spec.md) | Fields/endpoints/mismatch explanations; supersede old missing-coverage wording. |
| R3 source register, discrepancies, Nomex and CSV contract | [Lunar research](https://github.com/AkarshSharma2012/REDLINE/blob/0d0cb9aeba1c93640cedaab916b7a7acc816a9c5/research/lunar-2025.md) | Source leads, review gates, simulation/extrapolation separation. CSV inspected; no plot numbers copied into this spec. |
| R4 Marcum/transfer rules | [PMMA research](https://github.com/AkarshSharma2012/REDLINE/blob/305221f2f0c5f5112df68741cd255ae768dce170/research/pmma-endpoints.md) | Counter-example; M16 independently opened. |
| R7 illustrative-slider specification, source register | [Atmosphere research](https://github.com/AkarshSharma2012/REDLINE/blob/1ea3b7e13f1e425b3452a148a6f58618ce4f46b4/research/atmosphere.md) | Protocol fields/discrete-pair approach; A15/B22 independently opened. No later-test claim imported. |
| R8 sections 1-8 | [Validation plan](https://github.com/AkarshSharma2012/REDLINE/blob/2b733e0c0838750be08663b694915e1a970c6288/research/validation-plan.md) | Proposed holdouts/baseline/metrics/gates; no completed result claimed. |
| S1 sections 3-4 | [Architecture/schema plan](https://github.com/AkarshSharma2012/REDLINE/blob/406c51ca3f43b50975f375c60ef19ea92fb1023a/docs/specs/architecture.md) | Interface/data names; no stack change. |
| S4 sections 3-6 | [Evidence engine](https://github.com/AkarshSharma2012/REDLINE/blob/279a39dc16b9cb91d12fe1b7b7980a458e89de7a/docs/specs/evidence-engine.md) | Outputs/reasons; candidate-ranking adapter needed. Older no-lunar-data statement narrowed by R3 simulation evidence. |
| W2 demo/fallback | [Pitch draft](https://github.com/AkarshSharma2012/REDLINE/blob/0df4e860015e04d59e48f0861859d177a3a30b16/docs/pitch.md) | Rover narrative, traceability question and fallback. |

S2 `origin/task/27-s2-design-md-ui-rules` at `b24b04639b2105bb2152774e8cb9808847168c68` contained baseline repository files only. No local DESIGN.md. No misplaced handoff existed on this task branch; other branches' handoffs were not copied or moved.

Kickoff dependencies, **not blockers to this spec-only task**: reviewed numeric rows; science review of R3 discrepancies and envelope assumptions; simulated-gravity/endpoint adapter; protocol-context records; browser-readable frozen evaluation report; eventual DESIGN.md. Until available, implement the explicit unavailable states. This document creates no code, new match thresholds, scientific result or physical model.

## 9. Acceptance checklist for later implementation

These are proposed manual acceptance checks, not claims that an app exists.

- [ ] Cabin: add/edit/remove duplicate materials with different forms/uses; IDs/evidence remain distinct; Undo restores the item.
- [ ] Inputs: unknown airflow distinct from zero; invalid atmosphere blocked; paired preset announces both fields; user input receives no false NASA provenance.
- [ ] Navigation: all five screens preserve scenario; Back restores item; Cancel leaves cabin unchanged; Apply changes only displayed preview fields.
- [ ] Sources: each value/label/chart mark resolves to full NASA title/URL/locator; coverage resolves to reviewed inventory; withheld values never appear as zeros.
- [ ] Evidence: deterministic ranking for every candidate; every comparison field inspectable; exclusions/draft inspection never change eligibility.
- [ ] Gravity: all four material families reachable; fabric/Velcro and flaming/smolder separate; measured/digitized/extrapolated states distinct; disputed pairs produce no unsupported directional summary.
- [ ] Gravity: no implied lunar-surface measurement; assumed envelope separate and may be unavailable; counter-example includes calibration/branch limitations.
- [ ] Oxygen: no intermediate pre-breathe interpolation; assumptions/date visible; counts describe evidence labels; no guaranteed change.
- [ ] Accuracy: absent/insufficient/invalid/failed/completed distinguishable; no insufficient-test percentages, zero-denominator scores, fixture headlines, leakage or invented winner; drill-down uses split evidence.
- [ ] Resilience: empty/loading/stale/partial/malformed-data/source-unavailable/retry paths checked on every screen; old results never appear current.
- [ ] Access: keyboard/focus/labels/text status/narrow layout and chart tables preserve all information.
- [ ] Demo: rehearse six timed segments with reviewed data; use documented fallback if dependency missing and state whether workflow is planned or running.
