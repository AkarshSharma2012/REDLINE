# REDLINE Evidence Engine: build spec

Issue #29 (S4). Written 2026-11-14, before the 9 AM kickoff. **Spec only, no code.** The
implementer builds `src/rules/normalize.js`, `compare.js`, `label.js`, `lunar.js` and their
tests (S1 tasks B3, B4, B6) from this document alone.

Sourced facts carry a key from [Sources](#sources) plus a locator. **Inference:** marks our own
design choices. Most of §4–§6 is design (inference) built on R1's draft rules. Every threshold
is a named constant (§4.4) so the science lead can change it in one place before the test
split is scored ([R8] §2.3).

## 0. What the engine does, in one paragraph

Input: one cabin material plus cabin conditions (O2 %, total pressure, airflow, gravity).
The engine compares it field by field with every **verified** evidence row for that material
(`compareRow`, R1 rules E M F T W D V P G X H A U). It then picks a label (`labelMaterial`):
**BURNED** ("burned in testing at these conditions"), **NEAR** ("close to a measured limit"),
or **NOT_ESTABLISHED** with a reason code. Every answer cites the rows behind it. A lunar
(about 0.16 g) query is answered twice, with 0 g rows and with 1 g rows, and shown as an
estimate between the two ([AGENTS] Science rules; [S1] §3.2 step 5).

**Binding interfaces** are [S1] §3.1 (`compareRow`, `labelMaterial`, `labelCabin`,
`baselineLabel`) and the row schema is [S1] §4.2. This spec adds two backward-compatible
items, listed in §3.3. Where this spec and S1 disagree, §9 says which one wins.

## 1. Inputs

### 1.1 Research files (read with `git show origin/<branch>:<path>`)

| Input | Location | What the engine takes from it |
|---|---|---|
| R1 evidence spec | `task/18-…:research/evidence-spec.md` | Columns §2, endpoint codes §3, comparability rules §4, worked examples §5 |
| R2 BASS-II rows | `task/19-…:research/bass2-rows.csv` (15 rows, 40 columns) and `research/bass2.md` | Draft PSI-25 run records with provenance; "Draft evidence contract" limits |
| V1 audit | `task/31-…:research/verification-report.md` | 15/15 rows are correct transcriptions, but none is ready for numeric labels |
| S1 architecture | `task/26-…:docs/specs/architecture.md` | Interfaces §3.1, label rules §3.2, JSON schema §4, build order §5 |
| R8 validation plan | `task/25-…:research/validation-plan.md` | Reason codes §1, controls §3.2, baseline §5, checks C1–C5 §4.2 |
| R5 NASA context | `task/22-…:research/nasa-context.md` | "Wording rules for REDLINE" |
| R7 atmospheres | `task/24-…:research/atmosphere.md` | Cabin presets (8.2 psia / 34%, 10.2 / 26.5, 14.7 / 21) for query defaults |

Branch `task/20-r3-…` (lunar-gravity data) had no files when read. **No lunar-gravity
flame-spread limits were found in the sources reviewed** ([R1] §6; [R8] §0).

### 1.2 Data status on kickoff morning (sourced)

- All 15 BASS-II rows have empty `flow_speed_cm_s`, `o2_pct`, `pressure_kpa`, `endpoint`,
  `value` and `value_unit` ([V1] "Missing columns and unusable rows"; [R2] "Draft evidence
  contract"). They are `review_status: "draft"` and **must not reach `label.js`**.
- The only rows with usable numbers are the published values in R1 §5 (Link2018, Osorio2014,
  Zhao2015). They are also `draft` until B11 checks each one against its locator ([S1] §4.5).
- **Inference:** on Saturday the real `evidence.json` may hold zero verified rows. The engine
  must still work and must return `NE-no-data` for every material in that case. All tests below
  use the fixture in §7.1, never the live file.

## 2. Extraction and hand-check workflow (data tasks B2 and B11)

This is the human/agent procedure that turns sources into rows. The engine trusts only its output.

1. **One row = one reported outcome** at one set of conditions ([R1] §2). A run that stepped
   through several flows is **one** row, not several ([V1] inference paragraph; [R8] §2.1).
2. **Copy, do not compute.** Fill R1 columns only from the cited page. Unit conversions
   allowed: µm → mm (÷1000), cm → mm (×10), 1 atm → 101.3 kPa, psia → kPa (×6.895). Record
   any conversion in `notes`.
3. **Forbidden fills** (each one is a known trap in these sources):
   - Never copy BASS-II **initial or final calibrated O2** into `o2_pct` of a limit row. They
     are before/after readings, not extinction oxygen ([R2] "Caveats", citing S5 pp. 6, 67;
     [V1] "Initial/final O2 is not an oxygen extinction threshold").
   - Never enter a **fan potentiometer** setting or a mid-ramp air display as `flow_speed_cm_s`
     ([V1] per-row note under the table; [R2] "Flow lag", citing S5 p. 66, p. 13).
   - Never assume **standard pressure** when the source gives none: leave `pressure_kpa` empty
     ([V1] "Missing pressure and endpoint values").
   - **Empty means unknown, never zero** ([R2] "Draft evidence contract"; [S1] §4.2).
4. **Classify the outcome** with R1 §3 endpoint codes and S1 `outcome`. Blow-off (B18, B19),
   full consumption (B6, B20) and brief ignition then extinction (B14) are **not** oxygen limits
   ([V1] same section; [R8] §3.1). Use `outcome: "blowoff" | "consumed" | "no-ignition"`.
5. **Do not reconcile conflicts.** Keep both values in `notes` and leave the numeric cell empty
   (example: B16 air display differs between the PSI CSV and Table A.1, [V1] "Discrepancy").
6. **Locator required:** page/section/figure/table, else no row ([R1] §2.1 col 17).
7. **Hand-check (B11):** a second person opens the locator and checks material, form,
   dimensions, O2, pressure, flow, gravity and endpoint (the R8 C1 field list, [R8] §4.2). Only
   then set `review_status: "verified"` and `verified_by` to the issue or PR number.
8. **Holdout group:** set `holdout_group` per [R8] §2.2 (run, reused sample, source; merged).
9. Run `scripts/build-evidence.mjs`; the validator ([S1] §4.3, as amended in §9) must pass.

## 3. Output JSON

### 3.1 Evidence file

`data/evidence.json` exactly as [S1] §4 (top level §4.1, row §4.2, validator §4.3). Not repeated here.

### 3.2 Engine result (per material)

Shape from [S1] §3.1, with the field meanings fixed here:

```json
{
  "material_id": "pmma",
  "label": "BURNED",
  "reason": null,
  "cited": ["LINK2018-UG-B19", "LINK2018-UG-17"],
  "flags": ["M", "P", "T", "V"],
  "flag_details": [{ "evidence_id": "LINK2018-UG-B19", "rule": "P", "grade": "FLAG", "why": "pressure not stated in row" }],
  "cross_gravity": false,
  "estimate": null,
  "wording": "Burned in testing at these conditions"
}
```

- `label`: `BURNED` | `NEAR` | `NOT_ESTABLISHED`.
- `reason`: `null` unless `NOT_ESTABLISHED`; then `NE-no-burn` | `NE-incompatible` | `NE-no-data`
  ([R8] §1).
- `cited`: ordered `evidence_id` list (ordering in §5.3). Empty **only** for `NE-no-data`.
- `flags`: sorted, de-duplicated rule letters whose grade was not OK on any **cited** row.
- `flag_details` and `wording` are **additions** (§3.3).
- `estimate`: `null`, or `{ "g0": <result>, "g1": <result> }` for lunar queries (§5.4).

### 3.3 Additions to S1 (backward compatible)

1. Result gets `flag_details` (every non-OK rule on every cited row, with its `why`) and
   `wording` (from the §6 table). Needed for the evidence panel B7 and check C3 ([R8] §4.2).
2. `compareRow(query, row, ctx = { quench_speeds_cm_s: [] })`: optional third argument for
   rule V (§4.2). Callers that omit it get the S1 behaviour.
3. `query` may carry optional fields used only when a query is built from an evidence row
   (golden tests, R8 holdout): `material`, `endpoint`, `facility`, `limit_approach`,
   `pass_criterion`, `uncertainty`. A cabin query from the UI leaves them out.

## 4. Matching rules: `compareRow(query, row, ctx)`

Returns `{ grade, rules: [{ rule, grade, why }] }`, one entry per rule letter, in the order
E M F T W D V P G X H A U. Overall `grade` = worst of the rules (INVALID > FLAG > OK) ([R1] §4).

### 4.1 Normalization (`normalize.js`)

- **Gravity class** of a number g: `"0g"` if g ≤ `G_MICRO_MAX`; `"1g"` if g ≥ `G_EARTH_MIN`;
  else `"partial"`. A `"partial"` **query** goes to lunar mode (§5.4). A `"partial"` **row**
  (none exist today) only matches a `"partial"` query; this is an inference.
- **O2 partial pressure** `o2_partial_kpa = o2_pct × pressure_kpa / 100`, computed, never
  stored ([R1] §2.2). `null` if either input is `null`.
- **Uncertainty parse** (string → number of O2 percentage points or `null`):
  `±x` or `+/-x` → x; `between a and b` → (b − a) / 2; `not stated` or anything else → `null`.
- **Null-safe ratio** of two positive numbers: max/min. Undefined if either is null or zero.
- Number equality uses tolerance `EPS = 1e-9`.

### 4.2 Rule table (implement exactly)

`q` = query, `r` = row. "Null" means `null` or absent. Spread family `SPREAD = {LOC-FS,
burn/no-burn, spread-rate}`. Short-duration facilities `SHORT = {drop-tower, aircraft}`.

| Rule | INVALID when | FLAG when | Otherwise | Basis |
|---|---|---|---|---|
| E endpoint | q.endpoint null and r.endpoint ∉ SPREAD; or q.endpoint set and ≠ r.endpoint | — | OK | [R1] §3, §4 rule E. **Inference:** a cabin question asks "will flame spread", so its implied endpoint is the spread family ([R1] §3 last paragraph). |
| M material | q.material_id ≠ r.material_id | q.material set and ≠ r.material; or q.material null and r.material (lowercased, trimmed) ≠ display_name or any alias (lowercased) | OK | [R1] rule M. String test is an inference so "grade/colour/maker differs" is machine-checkable. |
| F form | both set and different | q.form null | OK | [R1] rule F |
| T thickness | — | either null; or ratio > `RATIO_FLAG` | OK | [R1] rule T. The thin/thick INVALID case is not machine-checkable from current columns (§9 gap). |
| W width | — | r.form ∈ {rod, wire}: never; else either null or ratio > `RATIO_FLAG` | OK | [R1] rule W |
| D direction | opposed vs concurrent; forced (opposed/concurrent) vs quiescent; forced vs upward-buoyant | q direction null | OK | [R1] rule D |
| V flow speed | some s in `ctx.quench_speeds_cm_s` with min(q,r) < s ≤ max(q,r) | either null; one is 0 and the other is not; ratio > `RATIO_FLAG` | OK (both 0 = OK) | [R1] rule V |
| P pressure | — | either null; or abs diff > `PRESSURE_FLAG_KPA` | OK | [R1] rule P |
| G gravity | — | gravity classes differ (also sets `cross_gravity`) | OK | [R1] rule G |
| X facility | — | q.facility set: exactly one side ∈ SHORT. q.facility null: r.facility ∈ SHORT | OK | [R1] rule X. A cabin is long-duration (inference). |
| H heat flux | exactly one side is 0 (other > 0), or abs diff > `HEAT_FLUX_INVALID_KW_M2` | — | OK. Null query flux = 0. | [R1] rule H |
| A approach | — | both sides set and different, for `limit_approach` or for `pass_criterion` | OK | [R1] rule A |
| U uncertainty | — | either side's `uncertainty` is `not stated` (query side only if present); or both O2 values set and abs(q.o2 − r.o2) ≤ parsed row uncertainty | OK | [R1] rule U |

`ctx.quench_speeds_cm_s` (built by `labelMaterial`): `value` of every verified row with the same
`material_id`, the same gravity class as the row being compared, `endpoint = quench-limit` and
`value_unit = cm/s`. **Inference:** this is how "a reported quench speed for that material"
in R1 rule V becomes computable.

Every rule entry carries a short `why` string naming both values, e.g.
`"pressure: cabin 56.5 kPa vs row not stated"`. Never write "safe" in a `why`.

### 4.3 What a row can prove

| Row type | Supports BURNED at query O2 `o` when | Supports NEAR |
|---|---|---|
| `burn/no-burn`, `outcome: spread` | r.o2_pct ≤ o | no |
| `spread-rate` (outcome null or `spread`) | r.o2_pct ≤ o | no |
| `LOC-FS`, `value_unit: % O2` | r.value ≤ o (spread was observed at the limit value) | o < r.value and r.value − o ≤ max(`NEAR_MARGIN_PP`, parsed uncertainty) |
| `LOC-FS`, `value_unit: kPa O2` | query partial O2 ≥ r.value (skip if query pressure null) | same test in kPa, margin = `NEAR_MARGIN_PP` × q.pressure / 100 |
| `burn/no-burn` with any other outcome; anything not in SPREAD | never | never |

Basis: R1 §4 "How REDLINE should use the grade"; [S1] §3.2 steps 2–3. **Inference:** a single
burn point at 17% is not a "measured limit" (the limit could be far lower), so only `LOC-FS`
rows can give NEAR. The LOC-FS reading follows Osorio's definition, "lowest O2 resulting in
opposed flame spread" ([R1] §5 Example 2, citing Osorio2014 p. 84).

### 4.4 Constants (one place, `compare.js` / `label.js`)

| Name | Value | Status |
|---|---|---|
| `NEAR_MARGIN_PP` | 1.0 percentage point | R1 inference, awaiting science lead ([R1] §6) |
| `RATIO_FLAG` | 2 | R1 inference |
| `PRESSURE_FLAG_KPA` | 10 | R1 inference |
| `HEAT_FLUX_INVALID_KW_M2` | 5 | R1 inference |
| `G_MICRO_MAX` | 0.01 g | **Inference (this spec)** |
| `G_EARTH_MIN` | 0.9 g | **Inference (this spec)** |

## 5. Labeling rules: `labelMaterial(query, rows)`

`rows` = evidence rows already filtered to `review_status === "verified"` by the caller
(`labelCabin` does this filter; `labelMaterial` must also skip any non-verified row it is given).

### 5.1 Algorithm (non-lunar query)

1. `mine` = rows with `material_id === query.material_id`. If empty → `NOT_ESTABLISHED`,
   `NE-no-data`, `cited: []`, `flags: []`.
2. Grade every row in `mine` with `compareRow` (ctx from §4.2).
3. `eligible` = rows with grade ≠ INVALID **and** gravity class = query class.
4. If `eligible` is empty → `NOT_ESTABLISHED`, `NE-incompatible`, `cited` = all of `mine`
   sorted by `evidence_id`. This covers "only cross-gravity rows" too: S1 §3.2 step 2 requires
   the same gravity class for BURNED.
5. `burn` = eligible rows that support BURNED (§4.3). If non-empty → `BURNED`, cited = `burn`.
6. Else `near` = eligible rows that support NEAR. If non-empty → `NEAR`, cited = `near`.
7. Else → `NOT_ESTABLISHED`, `NE-no-burn`, cited = `eligible`.
8. `flags`, `flag_details` from cited rows only. `cross_gravity` = true if any cited row's
   gravity class ≠ query class.

Precedence is BURNED > NEAR > NE-no-burn. **Inference:** under-warning is the worst error for
a fire tool ([R8] §4.1), so any burning evidence wins.

### 5.2 Uncertainty handling

- NEAR uses margin = max(`NEAR_MARGIN_PP`, parsed row uncertainty) (§4.3), so a stated error
  bar can only widen the "close" band, never shrink it below 1 point.
- Unparseable uncertainty strings (e.g. "O2 drift < 1.0% of set value") use the 1-point margin
  and do **not** raise U. `not stated` raises U FLAG.
- BURNED compares raw values with no margin. **Inference:** if the query sits within the row's
  error bar of a spread point, rule U already flags it, and the UI shows the flag.
- Missing cabin fields (null) never block a label; they raise FLAG "not specified" ([S1] §3.1).

### 5.3 Ordering of `cited`

BURNED / NEAR / NE-no-burn: ascending by number of non-OK rules on that row, then by
`evidence_id` (plain string compare). NE-incompatible: by `evidence_id`. Lunar: g0 list then g1
list, duplicates removed.

### 5.4 Lunar and other partial-gravity queries (`lunar.js`)

1. Run §5.1 with `gravity_g = 0` → `g0`; run with `gravity_g = 1` → `g1`.
2. Top-level `label`/`reason` = the more severe of g0 and g1 by the order BURNED > NEAR >
   NE-no-burn > NE-incompatible > NE-no-data. **Inference:** a conservative choice; the UI must
   still show both.
3. `cited` per §5.3; `flags` = union of g0 and g1 flags, plus `G` if `cited` is non-empty; `cross_gravity: true`;
   `estimate: { g0, g1 }`.
4. Wording is prefixed "Estimate between 0 g and 1 g results:" ([AGENTS] Science rules). Never
   present this as a bound: FM2's background raises the possibility of lower lunar limits
   ([W2] "Presenter preparation", citing FM2 page "Background").

### 5.5 `baselineLabel` (R8 §5)

Implement R8 §5 word for word: normalize names, match on name only, `b` = lowest O2 among
matched rows with spread or any limit value, then BURNED / NEAR (b − 1 ≤ o < b) / NE-no-burn /
NE-no-data. Never returns NE-incompatible. Query name = the material's `display_name`.

## 6. Wording table (`label.js`, the only place UI strings come from)

| Result | `wording` |
|---|---|
| BURNED | Burned in testing at these conditions |
| NEAR | Close to a measured limit |
| NE-no-burn | No burning found in comparable tests at or below this oxygen level in the sources reviewed |
| NE-incompatible | Not established: tests were found, but none is comparable to this cabin |
| NE-no-data | Not found in the sources reviewed |
| lunar prefix | Estimate between 0 g and 1 g results: |
| cross-gravity tag | Cross-gravity comparison |

Banned anywhere in output (case-insensitive): "safe", "never tested", "never burns",
"will burn on the moon", "nonflammable", "fire-safe" ([R8] §4.2 C2; [R5] "Wording rules";
task rules). Note: the README uses "never tested"; the UI must not ([R5]; §9).

## 7. Test cases

### 7.1 Fixture (`tests/fixtures/engine.json`), real published values

Fixture rows are set to `review_status: "verified"`, `verified_by: "fixture-only"`. **In the
live data they stay `draft` until B11 verifies them.** Common to all: `external_heat_flux_kw_m2: 0`,
`value`/`value_unit` null unless shown. Materials: `pmma` ("PMMA (acrylic)", alias "acrylic"),
`etfe` ("ETFE"), `sibal` ("SIBAL (cotton/fiberglass)"), `nomex` ("Nomex").

| evidence_id | material / form | thick, width mm | flow cm/s, dir | O2 %, kPa | g, facility | endpoint, value, outcome | uncertainty; approach / criterion | Source (locator) |
|---|---|---|---|---|---|---|---|---|
| LINK2018-UG-B19 | "PMMA, cast black" / rod | 6.4, null | null, opposed | 17.5, null | 0, ISS | burn/no-burn, —, spread | ±0.3; lower-flow | [Link2018] Results with Figs. 4, 6a (sample B19, 0.64 cm rod, 17.5% O2; flow lowered 7.6 → 0.7 cm/s, extinction below 0.6); Fig. 7 caption (±0.3%) |
| LINK2018-UG-17 | "PMMA, cast black" / rod | null, null | null, opposed | 17, null | 0, ISS | burn/no-burn, —, spread | ±0.3; lower-flow | [Link2018] Results, Fig. 8 discussion; Abstract. Diameter for this point not stated in the text |
| LINK2018-1G-18 | "PMMA, cast black" / rod | null, null | null, opposed | 18, null | 1, ground | burn/no-burn, —, no-spread | not stated; raise-flow | [Link2018] Results, Fig. 8 discussion. Fig. 6 caption gives < 18.5% for a 1.27 cm rod: keep the conflict in `notes` |
| OSORIO2014-ETFE-1G | "ETFE insulation on copper" / wire | 0.30, null | 12, opposed | 31.5, 100 | 1, ground | LOC-FS, 31.5 % O2 | "O2 drift < 1.0% of set value"; criterion "flame spread > 100 mm" | [Osorio2014] pp. 74, 79, 84, as reported in [R1] §5 Ex. 2 and [S1] §4.5 |
| OSORIO2014-ETFE-UG | "ETFE insulation on copper" / wire | 0.30, null | 12, opposed | 26, 100 | 0, aircraft | LOC-FS, 26 % O2 | same drift; criterion "flame still present at end of µg period" | [Osorio2014] pp. 84, 100, as reported in [R1] §5 Ex. 2 |
| ZHAO2015-SIBAL-T4 | "SIBAL, 75% cotton / 25% fiberglass" / fabric | 0.32, 22 | 2.2, concurrent | 18.7, 101.3 | 0, ISS | quench-limit, 2.2 cm/s, quenched | not stated | [Zhao2015] pp. 2, 3, 5, p. 9 appendix; run GMT45-T4 per [R2] "Independent revalidation" |
| PSI25-B10, PSI25-B14 | as in `bass2-rows.csv` | | | | | | | **left `draft`** ([R2]; [V1]) |

Link2018 locators were checked against the article on 2026-11-14 (web fetch, HTML). Osorio2014
and Zhao2015 values were **not re-opened** by this task; they come from R1 (and R2 for the T4
run ID).

### 7.2 Label cases (`labelCabin` on the whole fixture)

Default query: `pressure_kpa: null`, `flow_speed_cm_s: null`, `external_heat_flux_kw_m2: 0`,
`width_mm: null`. Lunar query uses 0.16 g. Lists are exact (order matters for `cited`).

| # | Query (material, form, thick, O2, kPa, flow, dir, g, other) | label / reason | cited | flags | cross_gravity |
|---|---|---|---|---|---|
| T1 | pmma rod 6.4, 21%, 56.5, 2, opposed, 0 | BURNED | UG-B19, UG-17 | M P T V | false |
| T2 | as T1 but 16.5% | NE / NE-no-burn (a burn point is not a limit, §4.3) | UG-B19, UG-17 | M P T V | false |
| T3 | pmma rod 6.4, 17.5%, null, null, opposed, 1 | NE / NE-no-burn | 1G-18 | M P T U V | false |
| T4 | pmma rod 6.4, 34%, 56.5, 2, opposed, 0.16 | BURNED; estimate g0 = BURNED (UG-B19, UG-17), g1 = NE-no-burn (1G-18) | UG-B19, UG-17, 1G-18 | G M P T U V | true |
| T5 | etfe wire 0.30, 34%, 100, 12, opposed, 1 | BURNED | OSORIO-1G | M | false |
| T6 | as T5, 30.8% | NEAR (31.5 − 30.8 = 0.7 ≤ 1) | OSORIO-1G | M | false |
| T7 | as T5, 30.5% | NEAR (boundary: exactly 1.0 is inclusive) | OSORIO-1G | M | false |
| T8 | as T5, 30.0% | NE / NE-no-burn (1.5 > 1) | OSORIO-1G | M | false |
| T9 | etfe wire 0.30, 27%, 100, 12, opposed, 0 | BURNED (LOC 26 ≤ 27) | OSORIO-UG | M X | false |
| T10 | as T5 but heat flux 25 kW/m² | NE / NE-incompatible (H) | OSORIO-1G, OSORIO-UG | G H M X | true |
| T11 | sibal fabric 0.32 × 22, 21%, 101.3, 2.2, concurrent, 0 | NE / NE-incompatible (E: quench-limit is not a spread endpoint) | ZHAO-T4 | E M U | false |
| T12 | nomex fabric, 34%, 56.5, 0.16 | NE / NE-no-data; wording "Not found in the sources reviewed" | (empty) | (empty) | true (lunar), estimate both NE-no-data |
| T13 | pmma sheet 0.2 × 10, 21%, null, null, opposed, 0 | NE / NE-incompatible (F: rod vs sheet). PSI25-B10/B14 must **not** appear | 1G-18, UG-17, UG-B19 | F G M P T U V | true |
| T14 | pmma rod 6.4, 21%, 56.5, 2, **concurrent**, 0 | NE / NE-incompatible (D) | 1G-18, UG-17, UG-B19 | D G M P T U V | true |

IDs are shortened: `UG-B19` = `LINK2018-UG-B19`, `OSORIO-1G` = `OSORIO2014-ETFE-1G`, and so on.
T13/T14 cite the 1 g row too because §5.1 step 4 cites all of `mine`. T12 `cross_gravity` is
true because lunar mode always sets it (§5.4).

### 7.3 `compareRow` golden cases (R1 §5 examples)

| # | Query built from | Row | Expected grade | Non-OK rules (exact) |
|---|---|---|---|---|
| C1 (R1 Ex. 1) | LINK2018-UG-17 (all optional fields copied) | LINK2018-1G-18 | FLAG | A G P T U V |
| C2 (R1 Ex. 2) | OSORIO2014-ETFE-1G (all optional fields copied) | OSORIO2014-ETFE-UG | FLAG | A G X (same set as R1) |
| C3 (R1 Ex. 3) | ZHAO2015-SIBAL-T4 but `endpoint: MOC-T1`, `flow_direction: upward-buoyant`, flow null, pressure null, width 65, g 1, `facility: ground`, uncertainty absent | ZHAO2015-SIBAL-T4 | INVALID | INVALID: D E. FLAG: G P U V W |

C1 has more flags than R1 (T, U) because our rows leave diameter and 1 g uncertainty null; R1
graded OK where it had more context. C3's query side is synthetic: a NASA-STD-6001 Test 1 result
for SIBAL was not found in the sources reviewed ([R1] §5 Ex. 3). Its width uses Test 1's
6.5 cm sample width ([R1] §5 Ex. 3, citing NASA6001B §7.1.2 b, p. 27).

### 7.4 Baseline contrast (R8 §5)

| # | Query | REDLINE | `baselineLabel` |
|---|---|---|---|
| B1 | T13 query | NE-incompatible | BURNED, cites LINK2018-UG-17 ("PMMA, cast black" → "pmma"; b = 17 ≤ 21) |
| B2 | T10 query | NE-incompatible | NE-no-data: "ETFE insulation on copper" normalizes to "etfe insulation on copper" ≠ "etfe" |

B2 pins R8's literal normalization: it does not drop words like "insulation" ([R8] §5 step 1).

### 7.5 Extraction checks (real BASS-II rows, for B2/B11 and `build-evidence.mjs`)

| # | Input row | Expected handling |
|---|---|---|
| X1 | PSI25-B14 (initial O2 15, brief ignition then extinction) | stays `draft`; never `outcome: spread`; `o2_pct` stays empty ([V1] B14 bullet) |
| X2 | PSI25-B18 (blow-out at pot 7.0) | if finalized: `outcome: blowoff`; `flow_speed_cm_s` empty (pot is not cm/s); never supports BURNED/NEAR |
| X3 | PSI25-B6 (consumed before 10 cm/s) | `outcome: consumed`; not an O2 limit |
| X4 | PSI25-B16 (air display differs CSV vs Table A.1) | both values in `notes`; numeric cell empty |
| X5 | Any draft row in `evidence.json` | `labelCabin` output never cites it (T13 asserts this) |

## 8. Acceptance criteria

The engine is done when all of these pass under `node --test`:

1. **Golden tests:** every case in §7.2, §7.3 and §7.4 gives exactly the listed label,
   reason, `cited` (in order), `flags` and `cross_gravity`.
2. **Purity:** `compareRow`, `labelMaterial`, `labelCabin`, `baselineLabel` touch no DOM,
   network or clock; same input → deep-equal output.
3. **Traceability (R8 C1, automated part):** every result except `NE-no-data` has non-empty
   `cited`; every cited id exists, is `verified`, and its row has non-empty `source_key`
   (present in `sources`) and `source_locator`.
4. **Wording (C2):** a scan of every `wording` and `why` string from all fixture runs finds no
   banned phrase (§6).
5. **Flags shown (C3):** for every cited row, every non-OK rule appears in `flag_details`.
6. **Cross-gravity (C4) and lunar (C5):** every query with 0.01 < g < 0.9 returns `estimate`
   with both `g0` and `g1`, `cross_gravity: true` and the lunar prefix.
7. **Draft exclusion:** adding any number of `draft` or `reviewed` rows to the fixture changes
   no result.
8. **Empty data:** with zero verified rows, every material returns `NE-no-data` without error.
9. **Constants:** changing `NEAR_MARGIN_PP` to 0.5 flips T6 and T7 to NE-no-burn and changes nothing else in §7.2.
10. **Refusal controls:** T10, T11, T13, T14 (rules H, E, F, D) return NE-incompatible, never
    BURNED/NEAR/NE-no-burn ([R8] K2).

## 9. Conflicts with other specs, decisions and gaps

- **S1 validator rule 4 vs missing pressure.** S1 §4.3 requires non-null `pressure_kpa` for
  verified rows. Link2018 gives no pressure ([Link2018] full text, checked) and V1 forbids
  assuming one. **Decision (this spec):** allow null `pressure_kpa` in verified rows; rule P
  flags it. Otherwise no Link2018 row can ever be verified. B1 implements the relaxed rule.
- **Cross-gravity-only evidence** → `NE-incompatible` with `cross_gravity: true` (§5.1 step 4).
  R8 defines that code as "every row INVALID"; we extend it to "no same-gravity row survives".
  Inference; flag to the science lead.
- **README says "never tested"**; R5 and task rules require "not found in the sources reviewed".
  The UI follows R5.
- **Rule T thin/thick INVALID** is not implemented: no column records the regime. Gap, not
  silently OK: T still FLAGs ratios > 2.
- **Rule A for cabin queries** is OK by construction (a cabin has no approach or criterion).
- **No BASS-II row can drive a label yet** ([V1]). Live demo labels depend on B11.
- **Not reviewed by this task:** Osorio2014 and Zhao2015 (values via R1/R2), Link2018
  Supplementary Tables S1/S2.

## Sources

| Key | Title | URL / location | Locators used |
|---|---|---|---|
| AGENTS | Rules for AI agents working on REDLINE | `AGENTS.md` on `main` | Science rules |
| S1 | REDLINE architecture plan and evidence-file schema (#26) | `origin/task/26-s1-architecture-plan-and-data-schema:docs/specs/architecture.md` | §3.1, §3.2, §4.2, §4.3, §4.5 |
| R1 | REDLINE evidence table: schema and comparability rules (#18) | `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md` | §2–§6 |
| R2 | BASS-II (PSI-25) data access and draft evidence (#19) | `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft:research/bass2.md`, `research/bass2-rows.csv` | "Caveats", "Draft evidence contract", "Independent revalidation" |
| V1 | Independent evidence verification (#31) | `origin/task/31-v1-verify-every-evidence-row-against-its:research/verification-report.md` | per-row table, "Discrepancy", "Missing columns and unusable rows" |
| R5 | NASA's position: standards, FM2 and Saffire (#22) | `origin/task/22-r5-nasa-s-position-standards-fm2-saffire:research/nasa-context.md` | "Wording rules for REDLINE" |
| R7 | Cabin atmospheres and EVA pre-breathe (#24) | `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md` | "Atmosphere presets" |
| R8 | REDLINE validation plan (#25) | `origin/task/25-r8-validation-plan-how-redline-proves-it:research/validation-plan.md` | §0–§7 |
| W2 | REDLINE rover-cabin demo and pitch (#30) | `origin/task/30-w2-demo-script-and-pitch-outline:docs/pitch.md` | "Presenter preparation" |
| Link2018 | Link, Huang, Fernandez-Pello, Olson, Ferkul, *The Effect of Gravity on Flame Spread over PMMA Cylinders*, Sci. Rep. 8, 120 (2018) | https://www.nature.com/articles/s41598-017-18398-4 | Experiments; Results (Figs. 4, 6a, 7, 8); Fig. 6, 7, 8 captions; Abstract. Opened 2026-11-14 |
| Osorio2014 | Osorio, *Effect of Environmental Variables on the Flammability of Fire Resistant Materials*, PhD diss., UC Berkeley (2014) | https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf | pp. 74, 79–80, 84, 100 (via R1; not re-opened) |
| Zhao2015 | Zhao, T'ien, Ferkul, Olson, *Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity* (2015) | https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf | pp. 2, 3, 5, 9 (via R1 and R2; not re-opened) |
| PSI25 | NASA PSI, BASS-II (PSI-25) experimental table; Olson et al., BASS-II Summary Report, NASA/TM-20210011385 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-25 ; https://ntrs.nasa.gov/citations/20210011385 | Table A.1, printed pp. 103–104 (via R2/V1) |
