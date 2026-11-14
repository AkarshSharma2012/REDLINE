# REDLINE competitor audit — issue #23 (R6)

Reviewed 2026-11-14. Research and specifications only. No competitor application was installed or executed; documented features and reported evaluation results are not independently reproduced results. This is a bounded public-source audit, not a complete inventory or a claim that REDLINE has already outperformed these tools.

## Scope and method

Searches: `"Flame in Freefall" github`, `"Flame in Freefall" "projects"`, `"Flame in Freefall" site:spaceappschallenge.org project`, and `NASA MAPTIS materials database flammability`. Search results were discovery leads; findings below use opened first-party pages, repository documentation, reviewed source code, and NASA documents. Section names are locators for unpaginated HTML/Markdown. Line ranges identify the reviewed raw code snapshot. Repository default-branch links can change; recheck before a submission claim.

The official challenge teams page failed to load (HTTP 502), so official participation, submission status and completeness of the competitor list are **unverified** [S9]. The three repositories below self-identify with the challenge [S1, S3, S5]. Do not describe them as confirmed finalists or winners.

**Audit definitions (our criteria):** geometry matching means checking specimen form, dimensions and substrate; flow matching means checking speed and direction; endpoint matching means distinguishing ignition, sustained spread, regression, extinction and screening pass/fail. A citation, similarity score, software test or source-data schema check alone does not validate an answer against independent experimental evidence.

## Public tools and projects

### 1. Flame in Freefall / Fire Safety Intelligence — Mehedi752

Repository: https://github.com/Mehedi752/Flame-in-Freefall. Linked project: https://flame-in-freefall.vercel.app/ [S1, About].

| Dimension | Finding and evidence |
|---|---|
| Features claimed | Evidence explorer, record comparison, rule-based analyst, mission scenarios and research-gap views. Outputs distinguish evidence, interpretation and safety considerations [S1, Demo flow; Trust labels; Swapping in a real LLM]. |
| Geometry / flow / endpoint | **Static code finding:** `assessScenario` ranks by gravity, oxygen, pressure and fuel class; geometry, flow and endpoint are absent from that distance. `compare` lists flow differences but sets its comparability flag from shared program identity [S2, lines 223–244]. **Inference:** shared program identity is insufficient to establish matched configurations. |
| Answer validation | The reviewed scoring code assigns risk using fixed additions and thresholds; evidence confidence derives from tier scores. Independent held-out answer validation was **not found in the sources reviewed** [S2, lines 7, 140–147, 191–208, 245–268]. **Inference:** these percentages must not be treated as calibrated failure probabilities. |
| Data sources | README names NTRS, journal papers and NASA Glenn/PSI resources; records expose publication links. It warns that some values came from abstracts/excerpts [S1, Data provenance]. This audit did not verify the underlying experimental numbers. |

### 2. FLARE-X — SoyebuzamanNaim/ALPINE_IBEX

Repository/project documentation: https://github.com/SoyebuzamanNaim/ALPINE_IBEX [S3].

| Dimension | Finding and evidence |
|---|---|
| Features claimed | Evidence lookup, experimental-domain checks, comparisons and optional model exploration. README describes condition differences, cited scenario bundles, deterministic explanations and abstention [S3, Evidence workflow]. |
| Geometry / flow / endpoint | Model inputs are oxygen percentage, pressure, flow speed and material; outputs classify spread. The model card explicitly omits geometry, flow direction and ignition history [S4, Inputs; Classes; limitations, lines 6–7, 21–24]. **Inference:** speed matching does not establish a matched flow configuration. The evidence workflow may expose more context than the classifier; this audit does not establish that every retrieval path enforces geometry/endpoint compatibility. |
| Answer validation | Model card reports grouped selection accuracy **84.0%**, majority baseline **81.5%**, balanced accuracy **40.3%**, and full-search nested accuracy **25.5%**. These are team-reported, unreproduced figures with different meanings. It identifies report imbalance, unvalidated cross-report probabilities and no independent external validation [S4, lines 8–14, 18–25]. Do not summarize this as validated 84% safety accuracy. |
| Data sources | Repository describes curated observations and provenance, plus an ingestion audit/quarantine process [S3b, What is included; Rebuild data and model artifacts]. Original per-row NASA source accuracy was not rechecked here. |

### 3. Fotia — AnteurAbderraouf

Repository: https://github.com/AnteurAbderraouf/Fotia. Linked project: https://nasafotia.streamlit.app/ [S5, opening].

| Dimension | Finding and evidence |
|---|---|
| Features claimed | Droplet extinction, burning rate, lifetime and proximity-to-test badges; spacecraft atmosphere presets, a 3D flame and an engine-grounded assistant [S5, opening; What we built]. |
| Geometry / flow / endpoint | Controls include droplet size, fuel, diluent, oxygen, pressure and gravity. README labels displayed airflow illustrative. Outputs concern droplets, not solid specimen spread. It says changing gravity above microgravity keeps numerical predictions at microgravity values [S5, The dashboard; How a prediction is made]. **Inference:** these outputs cannot establish solid panel/fabric behavior in a lunar cabin. |
| Answer validation | Reports cross-validated burning-rate R² **0.64**, extinction balanced accuracy **0.75**, and ROC AUC **0.83** [S5, How a prediction is made]. These are reported results, not reproduced here; independent report-held-out answer validation was **not found in the sources reviewed**. |
| Data sources | Claims PSI investigation tables and Spacelab MSL-1 droplet data [S5, What we built]. Underlying NASA measurements were not re-audited. |

### 4. Firelytics AI — public team announcement, not a verified tool

The author's recruitment post proposes an AI dashboard for summarizing, ranking and interpreting NASA combustion data [S6, opening post, 2026-11-09]. Implemented features, geometry/flow/endpoint matching, answer-validation results and specific dataset provenance were **not found in the sources reviewed**. The announcement supports intent only; it does not establish a working competitor. Team-page link: https://www.spaceappschallenge.org/2026/find-a-team/firelytics-ai/ [S6, opening post].

### 5. Additional project-page lead — inaccessible content

https://nasa-five-rose.vercel.app/ returned no readable page text [S10]. Ownership, challenge affiliation, features, configuration matching, validation and data sources are **unverified**. Do not count it as an additional confirmed product or infer its behavior from its title.

## NASA MAPTIS — reference system, not a hackathon submission

Public site: https://maptis.nasa.gov/ [S7].

| Dimension | Finding and evidence |
|---|---|
| Features / sources | Public Features page describes cross-database material search. Its Materials Selection database supplies ratings/test data, including nonmetal flammability and wire tests, predominantly under NASA-STD-6001B. Named test sources include Marshall, White Sands, Kennedy and Goddard; it also lists commercial test facilities for thermal-vacuum-stability data [S7a, Features; NASA Databases → Materials Selection Database]. |
| Geometry / flow / endpoint | NASA JSC 27301H warns against transferring a metallic-substrate MAPTIS pass to unsupported/nonmetallic-substrate use. It identifies the cited screening data as Earth-gravity testing and requires reduced-gravity evaluation for lunar/Martian applications [S8, §5.1.1, printed pp. 5-2–5-3, PDF pp. 53–54]. **Inference:** a MAPTIS rating is configuration-dependent, not a generic lunar burn threshold. Public evidence does not establish whether the signed-in interface automatically checks geometry, flow direction or endpoint compatibility. |
| Answer validation | NASA documents support standardized tests and restrictions on applying results [S7a; S8]. Independent validation of an automated lunar scenario answer was **not found in the sources reviewed**. This is an access/evidence limitation, not a claim that MAPTIS records lack testing. |
| Access | Public notice says cost-sharing took effect January 2026 and unsupported accounts may be locked pending payment [S7, top notice]. Signed-in records were not accessed; no account or purchase was attempted. |

## Evidence register and access limits

All sources retrieved 2026-11-14. Publication/update dates are unstated unless given below. No source-date estimate is inferred from search-engine crawl labels. Numerical competitor metrics are dimensionless, team-reported evaluation claims; they are not NASA material-property values. No NASA experimental threshold is imported from competitor code or documentation into REDLINE by this audit.

| ID | Title and URL | Page / section / code locator | Evidence status / assumptions |
|---|---|---|---|
| S1 | [Flame in Freefall — repository README](https://github.com/Mehedi752/Flame-in-Freefall#readme) | About; Demo flow; Data provenance; Trust labels; Swapping in a real LLM | Opened first-party claims; no runtime reproduction. |
| S2 | [Flame in Freefall — lib/engine.ts](https://raw.githubusercontent.com/Mehedi752/Flame-in-Freefall/main/lib/engine.ts) | `TIER`; `conf`; `analyze`; `compare`; `assessScenario`, lines 7, 140–147, 191–268 | Static source review; assessed matching/scoring logic, not publication accuracy. |
| S3 | [FLARE-X — repository README](https://github.com/SoyebuzamanNaim/ALPINE_IBEX#readme) | Evidence workflow | Opened first-party claims; no runtime reproduction. |
| S3b | [FLARE-X — raw README](https://raw.githubusercontent.com/SoyebuzamanNaim/ALPINE_IBEX/master/README.md) | What is included; Rebuild data and model artifacts | Opened; raw README differed from GitHub-rendered README, so claims are scoped to each reviewed version. |
| S4 | [Model Card: FLARE-X Flame-Spread Classifier](https://raw.githubusercontent.com/SoyebuzamanNaim/ALPINE_IBEX/master/docs/MODEL_CARDS.md) | Inputs; Classes; metrics; limitations, lines 6–25 | Training date stated: 2026-11-13. Metrics not reproduced. |
| S5 | [Fotia — README](https://raw.githubusercontent.com/AnteurAbderraouf/Fotia/main/README.md) | What we built; The dashboard; How a prediction is made | Opened first-party claims; no runtime reproduction. |
| S6 | [Looking for team members — Flame in Freefall challenge — Firelytics AI](https://github.com/nasa/spaceapps/discussions/1897) | Author's opening post | Dated 2026-11-09; recruitment announcement only. |
| S7 | [Materials And Processes Technical Information System (MAPTIS)](https://maptis.nasa.gov/) | Welcome; top cost-sharing notice | Opened public page; notice gives January 2026 effective date. Records not inspected. |
| S7a | [MAPTIS — Features](https://maptis.nasa.gov/Features) | Features; NASA Databases → Materials Selection Database | Opened official descriptions, not direct record inspection. |
| S8 | [Materials and Processes Selection, Control, and Implementation Plan for JSC Flight Hardware — JSC 27301H](https://standards.nasa.gov/sites/default/files/standards/JSC/H/0/JSC27301H.pdf) | §5.1.1, printed pp. 5-2–5-3; PDF pp. 53–54; revision table p. iv | Revision H dated February 2024. Reviewed restrictions, not an assertion this is the latest governing version. |
| S9 | [Flame in Freefall — official challenge teams page](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/?tab=teams) | Teams tab | HTTP 502; contents not reviewed. |
| S10 | [Flame in Freefall — additional project-page lead](https://nasa-five-rose.vercel.app/) | Landing page | No readable extracted text; contents not reviewed. |

### Coordination with existing REDLINE research

Read fetched remote branches using `git show`, without merging or modifying them:

- [R1: REDLINE evidence table: schema and comparability rules](https://github.com/AkarshSharma2012/REDLINE/blob/278d60b0a20a354cd88bc8c84e3762d4f39f78c8/research/evidence-spec.md), `origin/task/18-r1-evidence-table-spec-and-comparability`, commit `278d60b0a20a354cd88bc8c84e3762d4f39f78c8`: §§2–4 define specimen fields and endpoint/condition checks.
- [R8: validation plan](https://github.com/AkarshSharma2012/REDLINE/blob/2b733e0c0838750be08663b694915e1a970c6288/research/validation-plan.md), `origin/task/25-r8-validation-plan-how-redline-proves-it`, commit `2b733e0c0838750be08663b694915e1a970c6288`: §§4–7 propose answer checks, a name-only baseline and failure criteria.

These are internal proposals, not independently established scientific findings or completed validation. Original scientific references in those documents were not re-audited for this competitor task. No prior competitor deliverable was present on the fetched issue-23 branch.

## What REDLINE must do differently to be clearly better

**Inference / proposed acceptance criteria, not current capabilities or superiority claims:**

1. **Make compatibility a gate, not a similarity percentage.** Show a field-by-field match for form, dimensions, substrate, oxygen, pressure, gravity, flow speed/direction, heating and endpoint. Missing critical fields must produce an explicit refusal or qualified evidence view. Implement R1 only after reconciling its rules with verified NASA evidence. This addresses the reviewed Mehedi matching logic and FLARE-X classifier omissions [S2; S4]; substrate transfer has a direct NASA warning [S8, p. 5-2].
2. **Keep the decision unit a sourced test configuration.** Each output must expose the NASA document title, URL, page/figure/table, actual conditions, endpoint and uncertainty. A publication link alone is insufficient. Do not pool a droplet extinction result, a solid spread limit and a screening pass into a generic material threshold [audit criteria above; S5, How a prediction is made; S8, §5.1.1].
3. **Demonstrate correctness and refusal quality.** Execute R8's proposed held-out-source comparison and incompatible-condition controls at kickoff. Publish denominators, uncertainty, coverage, errors and a reproducible source/version manifest. Until run, call it a plan. Compare with the same-data name-only baseline; do not claim to beat competitor accuracy numbers measured on different tasks [R8, §§4–7; S4; S5].
4. **Keep lunar estimates visibly conditional.** Under the project rule, display any proposed range between 0 g and 1 g as an estimate, not a measured lunar bound or safety guarantee. NASA explicitly requires reduced-gravity evaluation [S8, p. 5-3]. If the available evidence cannot justify a bound, refuse a quantitative lunar answer and explain the gap. A generic two-endpoint envelope must not be advertised as validated physics.
5. **Treat MAPTIS as complementary evidence.** Preserve test method and substrate restrictions when referencing it; use accessible NASA publications for a reproducible public demo. Do not imply access to signed-in records or replacement of NASA materials approval [S7; S7a; S8].
6. **Make missing evidence scoped and actionable.** Say “not found in the sources reviewed,” list the incompatible/missing fields and propose the exact experiment needed. Recommendations to swap materials or change oxygen must retain the same compatibility gates and show their evidence. Proposal generation is not proof of an unstudied literature gap [S3, Evidence workflow; internal R1/R8].

**Proposed positioning:** a reproducible, configuration-aware audit of solid-material test evidence, with demonstrated refusals and source-level answer checks. Dashboard views, citations, gap maps and proximity badges alone are already claimed by reviewed projects [S1; S3; S5]. REDLINE earns a stronger claim only after its acceptance checks pass.
