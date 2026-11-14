# REDLINE architecture plan and evidence-file schema

Issue #26 (S1). Plan only: no code, configs or scaffolding exist yet. Written 2026-11-14,
before the 9 AM kickoff.

Facts carry a source key from [Sources](#sources) with a section or locator.
**Inference:** marks our own design choices. Most of this document is design, so most of it
is inference; the sourced parts are (a) what other REDLINE research branches decided and
(b) what the tools we pick are documented to do.

## 1. Stack (one recommendation)

**Static site: plain HTML + CSS + JavaScript ES modules. No framework, no bundler, no
backend. Tests and the accuracy run use Node's built-in test runner. Hosting on GitHub Pages.**

| Piece | Choice | Why (brief) |
|---|---|---|
| App | `index.html` + `src/*.js` ES modules + one CSS file | Nothing to install or configure; any agent can edit any file. **Inference:** a framework's setup time and build errors cost more than they save in 2 days for a one-screen tool. |
| Data | One static file, `data/evidence.json`, loaded with `fetch()` | The app only reads published data; nothing is written back. **Inference:** no user accounts or saved state are required by the README pitch, so a backend is not needed ([README]). |
| Rules | Pure functions in `src/rules/` with no DOM access | The same file runs in the browser and in Node, so the UI and the accuracy test use **one** copy of the rules. |
| Tests | `node --test` (built-in `node:test`) | Stable since Node v20.0.0 ([NodeTest], "Test runner" header, History table). No test library to install. |
| JSON in Node | `import data from './data/evidence.json' with { type: 'json' }` | Import attributes for JSON are stable and `type: 'json'` is mandatory ([NodeESM], "Import attributes" and "JSON modules"). `fs.readFileSync` also works ([NodeFS], "Synchronous API"). |
| Local run | `python -m http.server` from the repo root | ES modules cannot load from `file://` because module requests use CORS ([MDNModWeb], "Server configuration"). `http.server` serves the current directory ([PyHTTP], "Command-line interface"); it is not for production ([PyHTTP], top warning), which is fine for local dev only. |
| Hosting | GitHub Pages from `main` | A static site hosting service ([GHPages], "About GitHub Pages"). Plan/visibility requirements for Pages were **not found in the page reviewed**; check repo settings at kickoff. Fallback if Pages is unavailable: demo from `python -m http.server` on a laptop. |

**Rejected (inference):** React/Vite (install + build step, more merge conflicts across
parallel agents); any database or server (no write path exists); a Python backend for the
rules (would split the rules into a second language from the UI).

**Node version:** require Node ≥ 22.12 so `node:test` and JSON import attributes are both
stable ([NodeTest]; [NodeESM] History: "no longer experimental" in v22.12.0). The scaffold
task checks `node --version` on each team laptop.

## 2. Folder layout

```text
index.html                 one page; loads src/main.js as type="module"
src/
  main.js                  loads data/evidence.json, wires UI to rules
  rules/
    normalize.js           unit helpers, o2_partial_kpa, gravity class
    compare.js             R1 §4 field-by-field grade: OK / FLAG / INVALID
    label.js               BURNED / NEAR / NOT ESTABLISHED + reason code + citations
    lunar.js               0 g / 1 g bounded estimate for 0.16 g queries
    experiments.js         turns gaps into suggested-experiment cards
    baseline.js            R8 §5 naive name-only lookup (for the accuracy run only)
  schema/validate.js       checks evidence.json against §4 of this doc
  ui/
    cabin-form.js          material list, O2, pressure, flow, presets
    results-table.js       one row per material: label, flags, citation link
    evidence-panel.js      cabin vs experiment side by side, all flags shown
    o2-slider.js           oxygen sweep + discrete pre-breathe presets
    fixes.js               swap material / cap O2 suggestions
  styles.css
data/
  evidence.csv             human-edited source of truth (R1 columns, spreadsheet-friendly)
  evidence.json            GENERATED from evidence.csv; never hand-edited
scripts/
  build-evidence.mjs       CSV -> JSON, runs validate.js, fails on any error
  eval-holdout.mjs         R8 leave-one-source-out run -> research/validation-results.csv
tests/
  fixtures/                small hand-written evidence files for unit tests
  schema.test.mjs
  compare.test.mjs         R1 §5 worked examples as golden tests
  label.test.mjs
  wording.test.mjs         banned words, citation present on every label (R8 C1-C5)
docs/specs/                this plan
research/                  research branches' CSV/MD (inputs to data/evidence.csv)
```

**Inference:** `index.html` stays at the repo root so GitHub Pages can serve the root of
`main` without a deploy workflow.

## 3. Data flow

```text
research/*.csv (R2, later rows)        <- researchers + V1 verification
        | copy reviewed rows
data/evidence.csv                      <- one row per published outcome (R1 §2)
        | node scripts/build-evidence.mjs   (validate; fail on error)
data/evidence.json                     <- the only file the app loads
        | fetch() in browser  /  import in Node
src/rules/compare.js   cabin query x each evidence row -> grade + flag list
        |
src/rules/label.js     graded rows -> label, reason code, cited rows
        |                \-> lunar.js (0.16 g: run 0 g and 1 g, show range as estimate)
        |                \-> experiments.js (NE-* labels -> suggested experiment)
src/ui/*               table, evidence panel, O2 slider, fixes
```

### 3.1 Interfaces (fixed now so agents can build in parallel)

All functions are pure and synchronous. Names are binding for Saturday's tasks.

```text
compareRow(query, row)  -> { grade: "OK"|"FLAG"|"INVALID", rules: [{ rule: "E", grade, why }] }
labelMaterial(query, rows) -> {
    label: "BURNED"|"NEAR"|"NOT_ESTABLISHED",
    reason: null|"NE-no-burn"|"NE-incompatible"|"NE-no-data",
    cited: [evidence_id],          // never empty unless reason is NE-no-data
    flags: [rule letters],         // every FLAG that applied (R8 check C3)
    cross_gravity: boolean,        // R1 rule G, R8 check C4
    estimate: null | { g0: <label result>, g1: <label result> }   // lunar only, R8 check C5
}
labelCabin(cabinQuery, evidence) -> [ { material_id, ...labelMaterial result } ]
baselineLabel(query, rows)       -> same shape, R8 §5 rules, never NE-incompatible
```

`query` = one material line of the cabin plus the cabin conditions:

```json
{
  "material_id": "nomex",
  "form": "fabric",
  "thickness_mm": null,
  "width_mm": null,
  "o2_pct": 34,
  "pressure_kpa": 56.5,
  "flow_speed_cm_s": null,
  "flow_direction": null,
  "gravity_g": 0.16,
  "external_heat_flux_kw_m2": 0
}
```

**Inference:** a `null` cabin field means "the user did not say". `compareRow` grades it
FLAG ("not specified"), never OK and never INVALID, so the UI shows the gap instead of
hiding it. The example values 34% / 56.5 kPa are the 8.2 psia / 34% exploration preset
([R7] "Atmosphere presets", citing its S1 and S4 Table 1).

### 3.2 Label rules used by `label.js`

Taken from R1's draft rules ([R1] §4, "How REDLINE should use the grade") and the reason
codes R8 requires ([R8] §1). Only rows with `review_status: "verified"` are passed in
(see §4.3).

1. Drop rows whose grade is INVALID. If the material has rows but all are INVALID ->
   `NOT_ESTABLISHED / NE-incompatible`. If the material has no rows -> `NE-no-data`.
2. **BURNED:** a surviving row in the same gravity class records flame spread at
   `o2_pct` <= query O2.
3. **NEAR:** query O2 is within the row's uncertainty, or within 1 percentage point, of a
   surviving `LOC-FS` row. The 1-point margin is an R1 inference awaiting science-lead review
   ([R1] §6).
4. Otherwise `NOT_ESTABLISHED / NE-no-burn`.
5. Gravity: 0 g and 1 g are separate classes. For a 0.16 g query, run steps 1-4 once with
   0 g rows and once with 1 g rows and return both as `estimate`, labelled as an estimate
   between 0 g and 1 g results ([AGENTS], Science rules; [R1] §2.1 `gravity` note).
6. UI wording comes from one table in `label.js`: "burned in testing at these conditions",
   "close to a measured limit", "not found in the sources reviewed" ([AGENTS], Science
   rules; [R5] "Wording rules for REDLINE"). `wording.test.mjs` fails on "safe",
   "never burns", "never tested", "will burn on the Moon" ([R8] §4.2 C2).

### 3.3 Oxygen slider and pre-breathe

The slider re-runs `labelCabin` at each O2 step and counts materials per label.
**Pre-breathe time is not computed.** R7 recommends discrete pressure/oxygen presets with
source-dated protocol notes, no fitted O2-to-time curve, and "pre-breathe duration not found
in the sources reviewed" at intermediate positions ([R7] "Status, uncertainty and
illustrative-slider specification"). Presets live in `evidence.json` under `cabin_presets`
(§4.4).

### 3.4 How the accuracy test runs

Two levels, both from the command line, both using the same `src/rules/` files as the UI.

| Command | What it checks | Pass/fail |
|---|---|---|
| `node --test` | Unit tests: schema validator; R1 §5 Examples 1-3 must grade FLAG, FLAG, INVALID ([R1] §5); every label has a `source_url` + `source_locator`; wording bans; lunar output always carries `estimate` | Any failure blocks merge |
| `node scripts/eval-holdout.mjs --seed <n>` | R8's plan: leave-one-source-out holdout, queries frozen before the run, REDLINE vs `baselineLabel`, coverage / selective accuracy / under-warning / correct-refusal, Wilson 95% intervals, kill rules K1-K7 ([R8] §§2-7) | Writes `research/validation-results.csv` with the columns in [R8] §8; prints "descriptive only, too few independent tests" when R8 §6 minimums are not met |

Steps inside `eval-holdout.mjs` (design, following [R8]):

1. Load `evidence.json`; keep `review_status: "verified"` rows.
2. Load frozen queries and adjudicated truth from `research/validation-queries.csv`
   (written by humans per [R8] §3; the script never creates truth).
3. Assign source groups to dev/test with the seed ([R8] §2.3).
4. For each test source group: remove all rows with that `holdout_group`, assert none remain
   (K7), run `labelMaterial` and `baselineLabel` on that group's queries, score per [R8] §4.1.
5. Run incompatible and absent controls ([R8] §3.2).
6. Write per-query rows and print per-source, per-gravity, per-endpoint breakdowns
   ([R8] §4.3: never one pooled number).

**Current status (sourced):** the 15 BASS-II draft rows have empty `endpoint`, `value`,
`o2_pct`, `flow_speed_cm_s` and `pressure_kpa` ([R2] "Draft evidence contract"; [V1] "Missing
columns and unusable rows"), so R8 counts zero eligible rows today ([R8] §0). **Inference:**
on Saturday the holdout script can be built and tested on fixtures, but a real accuracy
number depends on the data team finishing verified rows.

## 4. Evidence file schema (`data/evidence.json`)

Row keys are **exactly R1's column names** ([R1] §2.1 and §2.2), in snake_case, so the CSV
headers, the JSON keys and the research docs all match. R2 already uses R1's 17 columns in
the same order, then `notes`, then provenance columns ([R2] "Draft evidence contract");
those provenance columns are kept. Extra keys added here are marked **(S1)** and are
inferences needed by the rules or by R8.

### 4.1 Top level

```json
{
  "schema_version": "1.0.0",
  "built_at": "2026-11-15T12:00:00Z",
  "built_from": "data/evidence.csv@<git sha>",
  "sources":       { "<source_key>": { "title": "", "authors": "", "year": 0, "url": "" } },
  "materials":     [ { "material_id": "pmma", "display_name": "PMMA (acrylic)", "aliases": ["acrylic"] } ],
  "evidence":      [ <evidence row, §4.2> ],
  "cabin_presets": [ <preset, §4.4> ]
}
```

- `sources` holds the Sources lists of R1/R2 by key, so a row stores only `source_key`.
  Every `source_key` in `evidence` must exist here (validator error otherwise).
- `materials` (S1) is the list shown in the cabin form. `aliases` are display/search help
  only; rule M still compares `material_id`, and R8's baseline must not use aliases
  ([R8] §5: synonyms not merged).

### 4.2 Evidence row

| Key | JSON type | Required | Allowed values | Origin |
|---|---|---|---|---|
| `evidence_id` | string | yes | unique, e.g. `PSI25-B1` | [R2] |
| `material` | string | yes | source's own name | [R1] col 1 |
| `material_id` | string | yes | key into `materials`, base material only (`pmma`, `nomex`, `etfe`) | **(S1)** needed for rule M; grade/colour stays in `material` |
| `form` | string | yes | `sheet` `rod` `fabric` `tape` `wire` `slab` `foam` `other` | [R1] col 2 |
| `thickness_mm` | number\|null | yes | > 0 | [R1] col 3 |
| `width_mm` | number\|null | yes | > 0; null for rod/wire | [R1] col 4 |
| `flow_speed_cm_s` | number\|null | yes | >= 0 | [R1] col 5 |
| `flow_direction` | string | yes | `opposed` `concurrent` `quiescent` `upward-buoyant` | [R1] col 6 |
| `o2_pct` | number\|null | yes | 0-100 | [R1] col 7 |
| `pressure_kpa` | number\|null | yes | > 0 | [R1] col 8 |
| `gravity_g` | number | yes | `0`, `1`, or measured value | [R1] col 9 `gravity`, stored as a number **(S1)**: `"0g"` -> 0, `"1g"` -> 1 |
| `facility` | string | yes | `ISS` `free-flyer` `drop-tower` `aircraft` `ground` | [R1] col 10 |
| `endpoint` | string\|null | yes | `LOC-FS` `LOC-FR` `quench-limit` `blowoff-limit` `MOC-T1` `LOI-D2863` `ignition` `spread-rate` `burn/no-burn` | [R1] col 11, §3 |
| `value` | number\|null | yes | in `value_unit` | [R1] col 12 |
| `value_unit` | string\|null | yes | `% O2` `kPa O2` `cm/s` `mm/s` `pass/fail` | [R1] col 13 |
| `outcome` | string\|null | yes | `spread` `no-spread` `quenched` `blowoff` `no-ignition` `consumed` | **(S1)** single burn/no-burn points need a machine-readable result; R8 excludes blow-off, consumption and no-ignition from O2 truth ([R8] §3.1) |
| `uncertainty` | string | yes | `±x`, `between a and b`, or `not stated`; never empty | [R1] col 14 |
| `run_id` | string | yes | source's ID or `—` | [R1] col 15 |
| `source_key` | string | yes | key into `sources` | [R1] col 16 |
| `source_locator` | string | yes | page/section/figure/table; non-empty | [R1] col 17 ("No locator, no row") |
| `external_heat_flux_kw_m2` | number | yes | >= 0, 0 if none | [R1] §2.2 |
| `limit_approach` | string\|null | no | `lower-flow` `raise-flow` `lower-o2` `fixed` | [R1] §2.2 |
| `pass_criterion` | string\|null | no | free text | [R1] §2.2 |
| `test_duration_s` | number\|null | no | > 0 | [R1] §2.2 |
| `notes` | string | no | free text | [R1] §2.2 |
| `holdout_group` | string | yes | union of run / sample / source links | [R8] §2.2 |
| `review_status` | string | yes | `draft` `reviewed` `verified` | **(S1)** R2 says draft rows must not drive labels before endpoint review ([R2] "Draft evidence contract"); only `verified` rows reach `label.js` |
| `verified_by` | string\|null | no | issue/PR that verified the row, e.g. `#31` | **(S1)** |
| provenance | strings | no | `investigation` `pi` `as_run_number` `sample_id` `date_source` `material_source` `gravity_regime` `flow_configuration` `flow_restrictor_source` `fan_display_source` `air_display_source` `o2_initial_calibrated_vol_pct` `o2_final_calibrated_vol_pct` `observation_paraphrase` `condition_source_title` `condition_source_url` `condition_source_locator` `observation_source_title` `observation_source_url` `observation_source_locator` `caveat` | [R2] "Draft evidence contract" (kept verbatim, not used by rules) |

**Not stored:** `o2_partial_kpa`. R1 says it is derived (`o2_pct` × `pressure_kpa` / 100) and
should be computed, not typed ([R1] §2.2 and inference below it). `normalize.js` computes it.

**Empty means unknown, never zero** ([R2] "Draft evidence contract"; [R7] implementation
handoff). In JSON that is `null`; in the CSV it is an empty cell.

### 4.3 Validator rules (`src/schema/validate.js`, errors stop the build)

1. Every required key present; types and enums as in §4.2.
2. `evidence_id` unique; `source_key` exists in `sources`; `material_id` exists in `materials`.
3. `source_locator` and `uncertainty` non-empty.
4. If `review_status` is `verified`: `endpoint`, `o2_pct` and `pressure_kpa` are non-null,
   and either `value` or `outcome` is non-null. **Inference:** R1's labels need these to
   compare; a verified row without them could not support any label.
5. `value_unit` is set whenever `value` is set.
6. `endpoint: "burn/no-burn"` requires `outcome`.

### 4.4 Cabin preset

```json
{
  "preset_id": "exploration-8.2-34",
  "label": "8.2 psia / 34% O2 (exploration atmosphere)",
  "pressure_kpa": 56.5,
  "o2_pct": 34,
  "status": "planned",
  "context": "HLS / lunar habitat / pressurized rover planning",
  "source_key": "R7-S4",
  "source_locator": "Table 1, journal p.77 / PDF p.2",
  "prebreathe": [
    { "minutes": "0-15", "regime": "microgravity comparison", "kind": "estimate",
      "assumptions": "6 h EVA at 4.3 psia suit", "source_key": "R7-S5", "source_locator": "PDF p.38" }
  ]
}
```

Values in this example come from [R7] ("Atmosphere presets" table; "Older comparison (2020
source)" table, S5 PDF p.38; S4 title gives 56.5 kPa). The data task copies all three
presets (14.7/21, 10.2/26.5, 8.2/34) with every protocol as a separate `prebreathe` entry,
never merged ([R7] implementation handoff).

### 4.5 Example evidence row (illustrative, from R1 Example 2)

```json
{
  "evidence_id": "OSORIO2014-ETFE-1G",
  "material": "ETFE insulation on copper",
  "material_id": "etfe",
  "form": "wire",
  "thickness_mm": 0.30,
  "width_mm": null,
  "flow_speed_cm_s": 12,
  "flow_direction": "opposed",
  "o2_pct": 31.5,
  "pressure_kpa": 100,
  "gravity_g": 1,
  "facility": "ground",
  "endpoint": "LOC-FS",
  "value": 31.5,
  "value_unit": "% O2",
  "outcome": null,
  "uncertainty": "O2 drift < 1.0% of set value",
  "run_id": "—",
  "source_key": "Osorio2014",
  "source_locator": "p. 84 (LOC); p. 74 (flow); p. 79 (pressure); pp. 79-80 (O2 drift)",
  "external_heat_flux_kw_m2": 0,
  "limit_approach": null,
  "pass_criterion": "flame spread > 100 mm",
  "test_duration_s": null,
  "notes": "core 0.50 mm",
  "holdout_group": "Osorio2014",
  "review_status": "draft",
  "verified_by": null
}
```

All values are as reported in [R1] §5 Example 2, which cites Osorio2014 pp. 74, 79, 84.
This task did not reopen Osorio2014, so the row stays `draft` until a verification task
checks it.

## 5. Saturday build order

Each task is sized for one agent, roughly 1-2 hours. Tasks in the same wave run in parallel;
they only depend on the interfaces in §3.1 and the schema in §4, not on each other's code.
Times are targets, not commitments.

### Wave 0 (9:00-9:45), one agent, blocks everything

| ID | Task | Done when |
|---|---|---|
| B0 | Scaffold: folders from §2, `index.html` that loads `src/main.js`, empty modules exporting the §3.1 function names (returning a fixed stub), `package.json` with `"type": "module"` and `"test": "node --test"`, one passing smoke test, run instructions in README, Pages enabled | `python -m http.server` shows the page; `node --test` passes; Pages URL loads |

### Wave 1 (9:45-11:30), six agents in parallel

| ID | Task | Inputs | Done when |
|---|---|---|---|
| B1 | Schema validator `src/schema/validate.js` + `tests/schema.test.mjs` | §4 | Good and bad fixtures pass/fail as expected |
| B2 | Data: `data/evidence.csv` with every R1/R2 row + `scripts/build-evidence.mjs` -> `evidence.json`; presets from R7 | [R1] §5, [R2] CSV, [R7] | Build runs clean; rows not yet verified are `draft` |
| B3 | `compare.js`: all R1 §4 rules (E M F T W D V P G X H A U) + R1 §5 examples as golden tests | [R1] §4-5 | Examples 1-3 grade FLAG, FLAG, INVALID |
| B4 | `label.js` + `lunar.js`: §3.2 rules, reason codes, wording table | §3.2, [R8] §1 | Unit tests on fixtures for each label and each reason code |
| B5 | UI: cabin form + results table (`cabin-form.js`, `results-table.js`, `styles.css`), using B0 stubs | README, [AGENTS] style rule | Enter materials and conditions, see one row per material with label and link |
| B6 | `wording.test.mjs` + traceability test: every non-`NE-no-data` result cites a row with URL and locator | [R8] §4.2 | Fails on a fixture with a banned word or missing locator |

### Wave 2 (11:30-13:00), five agents in parallel

| ID | Task | Depends on | Done when |
|---|---|---|---|
| B7 | `evidence-panel.js`: cabin vs experiment side by side, every FLAG with its `why`, cross-gravity tag, lunar estimate range | B3, B4, B5 | Clicking a row shows the panel with source link opening the cited page |
| B8 | `o2-slider.js`: sweep O2, count materials per label; preset buttons with pre-breathe notes, "not found in the sources reviewed" between presets | B4, B2 presets | Slider changes counts without reload; no interpolated pre-breathe time appears |
| B9 | `fixes.js` + `experiments.js`: suggest swap (material with BURNED -> one with NE-no-burn at same conditions) and O2 cap; turn each NE-no-data / NE-incompatible into an experiment card listing the missing conditions | B4 | Cards appear only for NE labels; fixes never claim "safe" |
| B10 | `baseline.js` + `scripts/eval-holdout.mjs` per §3.4, tested on a fixture with 3 fake source groups | B3, B4 | Script writes the R8 §8 CSV and the leakage check (K7) catches an injected leak |
| B11 | Data verification: move rows to `verified` only after checking each against its locator; log in `verified_by` | B2 | At least the R1 §5 rows checked; R8 §6 minimum progress reported honestly |

### Wave 3 (13:00-14:00), integration

| ID | Task | Done when |
|---|---|---|
| B12 | Wire real `evidence.json` into the UI end to end; run `node --test` and `eval-holdout.mjs`; fix integration bugs; deploy to Pages | Demo path from [W2] (cabin -> one item -> evidence -> O2 change -> gap) works on the Pages URL |

**Inference on risk:** the critical path is data (B2 -> B11), not code. If verified rows are
too few, the app still demos with `draft` rows hidden and the accuracy run reports
"descriptive only" ([R8] §6), which is the honest outcome R8 requires.

## 6. Gaps and open items

- The 1-point NEAR margin and R1's 2×, 10 kPa and 5 kW/m² thresholds are R1 inferences
  awaiting science-lead review ([R1] §6). They should live as named constants in
  `compare.js` / `label.js` so they can change in one place, before the test split is scored
  ([R8] §2.3).
- Branch `origin/task/20-r3-nasa-2025-lunar-gravity-flammability` had no files relative to
  `main` when read. No lunar-gravity data is assumed here.
- GitHub Pages plan/visibility requirements were not found in the page reviewed ([GHPages]).
- The cabin form needs a real material list (Nomex, cotton, Teflon, acrylic per [README]).
  Which of these have evidence rows depends on B2/B11; materials with no row will show
  `NE-no-data`, worded "not found in the sources reviewed".

## Sources

### REDLINE project files and research branches (read with `git show`)

| Key | Title | Location | Used for |
|---|---|---|---|
| README | REDLINE README | `README.md` on `main` (b24b046) | Pitch, features, material examples |
| AGENTS | Rules for AI agents working on REDLINE | `AGENTS.md`, "Science rules", "Engineering rules" | Wording, lunar estimate rule, UI style |
| R1 | REDLINE evidence table: schema and comparability rules (#18) | `origin/task/18-r1-evidence-table-spec-and-comparability` @ 278d60b, `research/evidence-spec.md` | Schema columns §2, endpoints §3, rules §4, examples §5, gaps §6 |
| R2 | BASS-II PSI-25 data access and draft rows (#19) | `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft` @ 38bb557, `research/bass2.md` "Draft evidence contract", `research/bass2-rows.csv` | Provenance columns; draft-row limits |
| R5 | NASA's position: flammability standards, FM2 and Saffire (#22) | `origin/task/22-r5-nasa-s-position-standards-fm2-saffire` @ 3892357, `research/nasa-context.md` §5 "Wording rules for REDLINE" | Wording table |
| R7 | Cabin atmospheres and EVA pre-breathe evidence (#24) | `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu` @ 1ea3b7e, `research/atmosphere.md` | Presets, slider rules |
| R8 | REDLINE validation plan (#25) | `origin/task/25-r8-validation-plan-how-redline-proves-it` @ 2b733e0, `research/validation-plan.md` | Accuracy test design §§0-8 |
| V1 | Verification report (#31) | `origin/task/31-v1-verify-every-evidence-row-against-its` @ 450342c, `research/verification-report.md` "Missing columns and unusable rows" | Data status |
| W2 | Rover-cabin demo and pitch (#30) | `origin/task/30-w2-demo-script-and-pitch-outline` @ 0df4e86, `docs/pitch.md` | Demo path for B12 |

### Tool documentation (opened 2026-11-14 via a web fetcher)

| Key | Title | URL | Locator |
|---|---|---|---|
| NodeTest | Test runner, Node.js v26.13.1 Documentation | https://nodejs.org/api/test.html | "Test runner" header: Stability 2 - Stable; History v20.0.0 "The test runner is now stable." |
| NodeESM | Modules: ECMAScript modules, Node.js v26.13.1 Documentation | https://nodejs.org/api/esm.html | "Import attributes"; "JSON modules"; History: no longer experimental in v22.12.0 / v23.1.0 |
| NodeFS | File system, Node.js v26.13.1 Documentation | https://nodejs.org/api/fs.html | "Synchronous API", `fs.readFileSync(path[, options])` (listed in contents; body not read) |
| MDNModWeb | Using modules on the web, MDN | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules/Modules_on_the_web | "Server configuration": module requests use CORS; `file://` never same-origin |
| PyHTTP | http.server, Python 3.15.2 documentation | https://docs.python.org/3/library/http.server.html | "Command-line interface"; warning at top of page |
| GHPages | What is GitHub Pages? | https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages | "About GitHub Pages": static site hosting service |
