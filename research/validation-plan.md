# REDLINE validation plan: how REDLINE proves its accuracy

Issue #25 (R8). Research and planning only: no code. Written 2026-11-14.

Facts carry a source key from the [Sources](#sources) list with a section, page, table or
equation. **Inference:** marks our own reasoning or a design choice. Thresholds in this plan
are design choices made **before** any results exist, so that the test can actually fail.

**No evaluation has been run. No accuracy number is claimed here.**

## 0. What is being validated (and what is not)

REDLINE takes a material and cabin conditions and returns one of three answers, each with a
link to the test behind it (`README.md`; `AGENTS.md`, Science rules). This plan checks three things:

1. **Traceability:** does the cited row really support the answer?
2. **Held-out agreement:** when REDLINE has never seen a test, does its answer match what
   that test actually recorded?
3. **Correct refusal:** does REDLINE refuse when the only evidence comes from an
   incompatible test?

**Out of scope.** Lunar gravity (about 0.16 g) is not scored. No lunar-gravity flame-spread
limits were found in the sources reviewed ([R1] §6), and `AGENTS.md` requires lunar values to
be shown only as an estimate bounded by 0 g and 1 g. This plan only checks that the estimate
label is present (check C5). Passing this plan shows that REDLINE reads NASA test data
faithfully. It does **not** show that a material will or will not burn on the Moon.

**Current data status (from other branches).** The 15 BASS-II draft rows have empty
`endpoint`, `value`, `o2_pct`, `flow_speed_cm_s` and `pressure_kpa` cells in all 15 records,
and V1 says none should enter a numeric boundary table yet ([V1] "Missing columns and unusable
rows"; [R2] "Draft evidence contract"). **Inference:** as of today there are zero rows
eligible for this test. The plan below is ready to run once rows are finalized.

## 1. The three answers, defined for scoring

The labels follow R1's draft rules ([R1] §4, "How REDLINE should use the grade") and the
`AGENTS.md` wording. A comparison is `INVALID`, `FLAG` or `OK` per R1 rules E, M, F, T, W, D,
V, P, G, X, H, A and U ([R1] §4 table).

| Answer | REDLINE returns it when (draft rule, [R1] §4) |
|---|---|
| **BURNED** ("burned in a comparable test") | A row graded OK or FLAG, in the same gravity class, shows flame spread at an O2 at or below the query's O2. |
| **NEAR** ("close to a measured limit") | The query O2 is within the row's uncertainty, or within 1 percentage point, of a `LOC-FS` row graded OK or FLAG. |
| **NOT ESTABLISHED** | No BURNED or NEAR row survives. Wording: "not found in the sources reviewed" ([R1] §4; `AGENTS.md`). |

**Inference (a requirement for the build team):** NOT ESTABLISHED must carry one of three
reason codes, because scoring needs to tell them apart:

| Reason code | Meaning | Counts as |
|---|---|---|
| `NE-no-burn` | Comparable rows exist (OK/FLAG) and none burned at or below the query O2 | an **answer** |
| `NE-incompatible` | Rows for this material exist, but every one is INVALID for this query | a **refusal** |
| `NE-no-data` | No row for this material at all | a **refusal** |

## 2. Holdout design: hold out whole runs and whole sources

### 2.1 Why not random points

Test points from one run are not independent. One BASS-II run (B10) stepped its fan through
six settings in one burn ([R2] `bass2-rows.csv`, row B10, `fan_display_source`). V1 warns
not to split a changing-flow run into several independent tests ([V1] "Missing columns and
unusable rows", inference paragraph). scikit-learn's guide says grouped samples break the
i.i.d. assumption. To measure generalization to unseen groups, every validation sample must
come from a group "not represented at all" in training ([SKL] §3.1.2.4). **Inference:** if
neighbouring points of one run sit on both sides, REDLINE looks up its own run and the score
is inflated.

### 2.2 Group keys

Every evidence row gets a `holdout_group`. Rows with the same group are always on the same side.

| Level | Key | Example |
|---|---|---|
| Run | `investigation` + `run_id` (+ `pi` for BASS-II) | `PSI-25/Bhattacharjee/B10` |
| Physical sample | `sample_id` when a sample was reused across runs | B14 and B21 share a sample; so do B18 and B22 ([V1] same section) |
| Source | `source_key` (one paper, report or dataset) | `Link2018`, `Osorio2014` |
| Same run, two sources | merged into one group | GMT45-T4 is reported both in BASS-II TM Table 7.1 and in Zhao2015 p. 9 ([R2] "Independent revalidation") |

**Inference:** groups are merged transitively (union-find): any two rows that share a run,
a reused sample, or a cross-reported run end up in one group. Reused samples are merged
conservatively even though V1 found they are separate runs ([V1]), because the same physical
specimen links them.

### 2.3 Splits

1. **Primary: leave-one-source-out (LOSO).** For each source group *s*: remove every row of
   *s* from REDLINE's table, ask the queries built from *s* (§3), score, put *s* back.
   scikit-learn's `LeaveOneGroupOut` does the same thing, holding out one group per split
   ([SKL] §3.1.2.4, Leave One Group Out subsection; read via a tool summary, see §9).
   **Inference:** this is the strictest test available. It asks whether other labs' tests
   predict this lab's result.
2. **Secondary: leave-one-run-out** within a source, using the run-level groups from §2.2.
   Reported separately. It is never pooled with LOSO.
3. **Dev/test freeze.** Before any scoring, randomly assign about 30% of source groups to
   **dev** and 70% to **test**, with a seed written in the results file. R1's thresholds
   (2× thickness, 10 kPa, 1-point "near", 5 kW/m²) are marked as inferences to be reviewed
   ([R1] §6). They may be tuned **only** on dev groups. After the test groups are scored once,
   no threshold may change for this report. **Inference:** this stops tuning to the answer.
4. **Leakage check (automated, before every split).** Assert that no row with the held-out
   `holdout_group` remains in the table. One leak makes the run invalid (kill rule K7).

## 3. Building the queries and the truth

Queries are written down and frozen **before** REDLINE is run on them.

### 3.1 Held-out queries (answerable)

From each held-out row, build one query with that row's material, form, thickness, width,
flow speed and direction, O2, pressure, gravity and external heat flux. Its **truth** comes
from the row alone:

| Held-out row says | Truth |
|---|---|
| Flame spread at these conditions (`burn/no-burn` = burn, or a `LOC-FS` bracket's burning side) | `burned` |
| No spread / extinguished / quenched, and the query O2 is within 1 point or the stated uncertainty of a `LOC-FS` value in the same source | `near` |
| No spread, and not near any limit in the same source | `no-burn` |

Example (structure only): Link2018 reports flame spread at 17% O2 on the ISS and no flame at
18% and below on the ground for the same black PMMA rods ([Link2018] Results, Fig. 8, as
summarized in [R1] §5 Example 1). That bracket gives two queries, one per gravity class.

**Inference:** outcomes that are not O2 limits are excluded from O2 truth: blow-off, sample
fully consumed, "no ignition". V1 says B18/B19 (blow-off) and B6/B20 (consumption) do not
supply oxygen extinction limits ([V1] same section). R1 also lists "No ignition" separately
from "Quenched" ([R1] §3, `ignition` row).

### 3.2 Incompatible controls (refusals expected)

Pair a query with a table that holds **only** evidence that is INVALID for it. At least two
controls are needed for each R1 INVALID rule:

| Rule ([R1] §4) | Control |
|---|---|
| E endpoint | The canonical case: ISS SIBAL quench at 18.7% O2 vs a NASA-STD-6001 Test 1 screen. R1 grades it INVALID ([R1] §5 Example 3). |
| D flow direction | Opposed-flow evidence only, concurrent-flow query |
| F form | Rod evidence only, sheet query |
| M material | Same family, different base material (e.g. R1's ETFE vs PE wire pairing, INVALID for a per-material label, [R1] §5 Example 2) |
| V flow | Evidence above a reported quench speed, query below it |
| H heat flux | Heated evidence only, unheated query |

Correct output: `NE-incompatible`. **Absent-data controls:** at least 5 materials with no row
at all. Correct output: `NE-no-data`. The pitch already proposes one mismatched-specimen
control and one absent combination ([W2] "The one falsifiable question"). This plan widens
that to every INVALID rule.

### 3.3 Adjudication

Two people label the truth for every query independently from the source page, without
seeing REDLINE's output. Disagreements are discussed. Any that are still unresolved are
**dropped and listed**, never decided by REDLINE's answer. **Inference:** blind labelling
keeps the truth from being shaped by the tool.

## 4. Scoring

### 4.1 Score matrix for answerable queries

| Truth ↓ / REDLINE → | BURNED | NEAR | NE-no-burn | NE-incompatible / NE-no-data |
|---|---|---|---|---|
| `burned` | correct | wrong (mild) | **wrong: under-warning** | refusal |
| `near` | wrong: over-claim | correct | wrong (mild) | refusal |
| `no-burn` | wrong: over-claim | wrong (mild) | correct | refusal |

**Inference:** under-warning is the worst error for a fire tool, because it implies no
burning evidence when the held-out test burned. It gets its own kill rule (K3).

### 4.2 Answer checks applied to every output

- **C1 Traceability:** the cited `source_key` and `source_locator` open to a page that
  supports the label, including material, form, O2, pressure, flow, gravity and endpoint.
  This matches the pitch's proposed test ([W2] same section).
- **C2 Wording:** no "safe", "will burn on the Moon" or "never burns". Absence is worded as
  "not found in the sources reviewed" (`AGENTS.md`).
- **C3 Flags shown:** every FLAG rule that applied is visible ([R1] §4).
- **C4 Cross-gravity:** a 0 g vs 1 g comparison is labelled cross-gravity ([R1] §4 rule G).
- **C5 Lunar:** any 0.16 g output is labelled an estimate between the 0 g and 1 g results.

### 4.3 Metrics

The definitions follow selective classification. Coverage is the share of inputs that are
not rejected, and selective risk is the error rate on the accepted inputs only ([GE2017]
§2, Eq. 1; empirical forms §3).

| Metric | Formula | Computed on |
|---|---|---|
| **Coverage** | answered ÷ answerable queries ("answered" = BURNED, NEAR or `NE-no-burn`) | §3.1 queries |
| **Selective accuracy** | correct ÷ answered (= 1 − selective risk) | §3.1 queries |
| **Under-warning rate** | under-warnings ÷ answered | §3.1 queries |
| **Correct-refusal rate** | `NE-incompatible` ÷ incompatible controls | §3.2 controls |
| **Absent-data accuracy** | `NE-no-data` ÷ absent controls | §3.2 controls |
| **Traceability** | answers passing C1–C5 ÷ all answers | everything |

Report every rate as *k*/*n* with a 95% **Wilson** interval. NIST recommends it over the plain
normal approximation because its lower limit cannot go negative ([NIST] §7.2.4.1). When
*k* = 0 or *k* = *n*, also report the exact one-sided bound. NIST gives exact binomial
intervals for small counts ([NIST] §7.2.4.1, "Exact Intervals..."). **Our calculation:** with
zero errors in *n* trials, the exact one-sided 95% upper bound on the error rate is
1 − 0.05^(1/*n*), which is about 3/*n*.

Break the results down by source, by gravity class (0 g / 1 g) and by endpoint. **Never
report one pooled number alone.**

## 5. Baseline: naive name-only lookup

The baseline gets the **same** evidence table and the **same** held-out removal as REDLINE.

**Definition (exact):**

1. **Normalize the name:** lowercase it, drop everything after the first comma or
   parenthesis, drop digits, units and these words: `film`, `sheet`, `rod`, `fabric`, `wire`,
   `black`, `clear`, `cast`, `wide`, `thick`. Then collapse spaces. Example: `"100 micron PMMA
   film 2 cm wide"` → `"pmma"`. Synonyms are **not** merged ("teflon" ≠ "ptfe").
2. **Match:** keep every row whose normalized name equals the query's normalized name.
   **Ignore every other column:** form, thickness, width, flow, direction, pressure, gravity,
   facility, heat flux, endpoint and pass criterion.
3. **Burn threshold:** *b* = the lowest O2 among matched rows that either recorded flame
   spread, or report any limit value (`LOC-FS`, `LOC-FR`, `LOI-D2863`, `MOC-T1`) read as
   "burns at and above this value".
4. **Answer:**
   - no matched rows → `NE-no-data`;
   - query O2 ≥ *b* → **BURNED**;
   - *b* − 1 ≤ query O2 < *b* → **NEAR**;
   - otherwise → `NE-no-burn`.
5. **Citation:** the row that set *b*. The baseline **never** returns `NE-incompatible`.

**Inference:** this is how a careless spreadsheet lookup behaves. It mixes endpoints, which
R1 forbids (rule E; [R1] §3 citing Huang2019 on "misuse"). Its expected correct-refusal rate
is 0% by construction. So the refusal metric shows REDLINE's added value, and the
selective-accuracy comparison shows whether the comparability rules cost or gain accuracy
on answerable queries.

## 6. Minimum sample size

| Set | Minimum | Why (calculation is ours) |
|---|---|---|
| Answerable held-out queries (test split) | **30**, from **≥ 5** source groups, including **≥ 1** source per gravity class | With 0 errors in 30, the 95% upper bound on the error rate is 1 − 0.05^(1/30) ≈ **9.5%**. With 27/30 correct, the Wilson 95% interval is about **74%–97%** ([NIST] §7.2.4.1 formula). Fewer queries give intervals too wide to separate REDLINE from the baseline. |
| Incompatible controls | **12** (2 per INVALID rule in §3.2) | 12/12 refused gives a one-sided 95% lower bound of 0.05^(1/12) ≈ **78%** |
| Absent-data controls | **5** | Smoke test only; no rate is claimed |
| Adjudicated truth | 100% double-labelled | §3.3 |

**If a minimum is not met:** the result is reported as **"descriptive only, too few
independent tests"**. Counts are shown, no accuracy percentage is put on a slide, and K6
applies. **Inference:** 30 queries from 5 sources looks reachable if the BASS-II Table A.1
runs, Zhao2015's appendix runs and the Link2018, Osorio2014 and Urban2014 brackets are
finalized. It is **not** reachable from today's rows (§0).

## 7. Kill criteria (written before results)

Any one of these means **REDLINE failed this validation**, and the demo must say so.

| ID | Fails if | Plain meaning |
|---|---|---|
| **K1** | Any answer fails C1 (cited row does not support it) | It made something up. One is enough (same bar as [W2]). |
| **K2** | Any incompatible control answered BURNED, NEAR or `NE-no-burn` | It compared apples to oranges. |
| **K3** | Under-warning rate > 5% of answered queries (≥ 2 of 30) | It said "no burn found" when a test burned. |
| **K4** | Selective accuracy point estimate < 80% | Too often wrong when it does answer. |
| **K5** | Coverage < 30%, **or** REDLINE's selective accuracy ≤ the baseline's on the same queries | It refuses almost everything, or it adds nothing over a name lookup. |
| **K6** | §6 minimums not met | Not a failure of REDLINE, but **no accuracy claim** may be made. |
| **K7** | A held-out group's rows were present while it was scored, or a threshold changed after test scoring | The run is void. Fix it and re-run on a fresh split. |

C2–C5 failures are bugs to fix, not kills. **Inference:** they are display problems that do
not change the evidence. Report their count anyway.

The 80% / 30% / 5% thresholds are **our design choices**, not sourced values. They are set
now so the result can fail. The science lead may change them **before** the test split is
scored, never after.

## 8. Results file (to be produced at evaluation time, not now)

One row per query in `research/validation-results.csv`. Columns: `query_id`, `split`
(`dev`/`test`), `holdout_group`, `query_type` (`answerable`/`incompatible`/`absent`),
`invalid_rule`, conditions (R1 §2.1 units), `truth`, `truth_source_key`,
`truth_source_locator`, `adjudicator_1`, `adjudicator_2`, `redline_answer`,
`redline_reason_code`, `redline_cited_row`, `baseline_answer`, `baseline_cited_row`,
`score`, `C1`–`C5`, `notes`. Record the random seed and the commit hashes of the evidence
table and the code.

## 9. Gaps and access notes

- **Roberts et al. 2017**, *Cross-validation strategies for data with temporal, spatial,
  hierarchical, or phylogenetic structure*, Ecography, https://doi.org/10.1111/ecog.02881:
  HTTP 403 at Wiley. **Not reviewed.** It is not used as a source.
- **Eypasch et al. 1995** (BMJ, "rule of three"): the PMC link we tried resolved to an
  unrelated article. **Not reviewed.** The zero-error bound in §4.3 is our own calculation
  from the binomial and is labelled as such.
- **[SKL] LeaveOneGroupOut details** come from the fetch tool's summary of the truncated part
  of the page, not from verbatim text. The core no-shared-group statement (§3.1.2.4 intro and
  §3.1.2.4.1) was read directly.
- **Link2018, Huang2019, Osorio2014, Zhao2015, Urban2014** are cited only as R1 reports them
  ([R1] §5, Sources). This task did not re-open them.
- **Other branches:** `task/20` (lunar gravity) had no research files when this was written.
  `task/31` (V1) and `task/19` (R2) were used for data status.

## 10. One-slide version (plain language)

> **How do we know REDLINE is right?**
>
> - **We hide whole experiments.** We remove one NASA experiment at a time, ask REDLINE
>   about it, and compare with what really happened. We never hide half an experiment.
> - **Three answers are scored:** *burned in a comparable test*, *close to a measured limit*,
>   *not established*.
> - **We count three things:** how often it is right when it answers, how often it answers,
>   and how often it correctly says "these tests aren't comparable".
> - **We race a dumb lookup** that matches the material name and ignores everything else.
>   REDLINE must beat it.
> - **It fails if:** it cites a test that doesn't back it up, compares incompatible tests,
>   says "no burn found" when a test burned, or is right less than 80% of the time.
> - **Honest limits:** at least 30 hidden tests from 5 sources, or we show counts, not
>   percentages. Lunar gravity is an estimate, never scored.

## Sources

| Key | Title | URL | Locator used |
|---|---|---|---|
| SKL | *3.1. Cross-validation: evaluating estimator performance*, scikit-learn 1.9.1 documentation | https://scikit-learn.org/stable/modules/cross_validation.html | §3.1.2.4 "Cross-validation iterators for grouped data"; §3.1.2.4.1 Group K-fold; Leave One Group Out subsection |
| NIST | *7.2.4.1. Confidence intervals*, NIST/SEMATECH e-Handbook of Statistical Methods | https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm | Wilson method formulas; "Exact Intervals for Small Numbers of Failures..."; Terminology Note |
| GE2017 | Geifman & El-Yaniv, *Selective Classification for Deep Neural Networks* (arXiv 1705.08500v2, 2017) | https://arxiv.org/abs/1705.08500 (HTML: https://arxiv.org/html/1705.08500v2) | §2 Problem Setting: coverage φ(f,g), selective risk Eq. (1); §3 empirical coverage and risk |
| R1 | REDLINE evidence-table spec (issue #18), project document, not NASA evidence | `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md` | §3, §4, §5 Examples 1–3, §6; its own Sources table gives URLs for Link2018, Huang2019, Zhao2015, Osorio2014, NASA6001B, Urban2014 |
| R2 | REDLINE BASS-II (PSI-25) data access and draft (issue #19), citing NASA PSI-25 and NASA/TM-20210011385 | `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft:research/bass2.md` and `bass2-rows.csv` | "Draft evidence contract"; "Independent revalidation"; CSV row B10 |
| V1 | REDLINE verification report (issue #31) | `origin/task/31-v1-verify-every-evidence-row-against-its:research/verification-report.md` | "Missing columns and unusable rows" |
| W2 | REDLINE pitch outline (issue #30) | `origin/task/30-w2-demo-script-and-pitch-outline:docs/pitch.md` | "The one falsifiable question" |
| Link2018 | Link et al., *The Effect of Gravity on Flame Spread over PMMA Cylinders*, Sci. Rep. 8, 120 (2018) | https://www.nature.com/articles/s41598-017-18398-4 | Results, Fig. 8 (as reported in R1 §5) |
