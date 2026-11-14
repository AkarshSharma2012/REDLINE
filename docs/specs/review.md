# REDLINE spec review: gaps, contradictions and overclaims

Issue #32 (V2). Reviewer pass written 2026-11-14, before the 9 AM kickoff. Review only: no
code, configs or scaffolding. Every finding cites the file and section it comes from (keys in
[Sources](#sources)). **Inference:** marks the reviewer's own reasoning or a proposed fix.

## 0. What was reviewed, and what was missing

| Key | File | Ref read |
|---|---|---|
| S1 | `docs/specs/architecture.md` | `origin/task/26-…` @ 406c51c |
| S4 | `docs/specs/evidence-engine.md` | `origin/task/29-…` @ 279a39d |
| R1 | `research/evidence-spec.md` | `origin/task/18-…` @ 278d60b |
| R2 | `research/bass2.md`, `research/bass2-rows.csv` | `origin/task/19-…` @ 38bb557 |
| R3 | `research/lunar-2025.md`, `research/lunar-2025-rows.csv` | `origin/task/20-…` @ 0d0cb9a |
| R5 | `research/nasa-context.md` | `origin/task/22-…` @ 3892357 |
| R7 | `research/atmosphere.md` | `origin/task/24-…` @ 1ea3b7e |
| R8 | `research/validation-plan.md` | `origin/task/25-…` @ 2b733e0 |
| V1 | `research/verification-report.md` | `origin/task/31-…` @ 450342c |
| W2 | `docs/pitch.md` | `origin/task/30-…` @ 0df4e86 |
| W1 | `docs/submission-draft.md` | `origin/task/33-…` @ 3be0fae |
| README, AGENTS | `README.md`, `AGENTS.md` | `main` @ b24b046 |

**Not found in the sources reviewed:**

- **`screens.md`** and **`DESIGN.md`**: no file matching `screens` or `design` exists on any
  fetched branch (`git ls-tree -r` on every `origin/*` ref). The screen and visual review below
  is therefore done against the UI parts of S1 (§2 `src/ui/*`, §5 B5, B7, B8, B9), README and W2.
  §7 proposes the minimum screen/state list the UI tasks need.
- **R4 (PMMA endpoint studies, `origin/task/21-…`)**: branch is at `main` (b24b046), no files.
- R3 now has files (commits from 07:42 to 07:55 on 2026-11-14). S1 §6, S4 §1.1, R8 §0/§9, V1 table
  and W2 "Cross-branch context" all say task/20 was empty. Those statements are **stale**; see C1.

## 1. Severity scale

| Severity | Meaning | When to fix |
|---|---|---|
| **BLOCKER** | Breaks the science rules in AGENTS, or makes a planned feature impossible to build as specified | Before Wave 1 starts (9:45) |
| **HIGH** | A judge or tester would catch a wrong or misleading output, or two specs tell an agent different things | Before the owning task starts |
| **MEDIUM** | Missing state or vague rule; an agent will have to guess | During the owning task |
| **LOW** | Wording, consistency, nice-to-have | If time allows |

## 2. Summary

| ID | Sev | Area | Issue (short) | Owner |
|---|---|---|---|---|
| D1 | BLOCKER | Science | "Bounded by 0 g and 1 g" is contradicted by simulated-lunar NASA data | Science lead; AGENTS, S1, S4, R1, R8 |
| D2 | BLOCKER | Science | 5 of 6 fixture/demo rows come from non-NASA sources; AGENTS requires NASA links | Science lead; B2 |
| C1 | HIGH | Schema vs data | R3's 30 lunar rows use vocab the S1 validator rejects | B1, B2 |
| C2 | HIGH | Engine | Partial-gravity rows can never be used: lunar mode only queries 0 g and 1 g | B4 |
| U1 | HIGH | Engine | `NE-no-burn` is returned with no test at or above the cabin's O2 | B4 |
| U2 | HIGH | Engine | Large pressure gap (56.5 vs 101 kPa) only FLAGs, even for "no burn" answers | Science lead; B3/B4 |
| D3 | HIGH | Science | Fixes feature turns burn points into an O2 "cap" and a "swap" | B9 |
| D4 | HIGH | Pitch | README claims: hospital fire-risk statement unsourced; "never tested"; slider "fire risk" | README owner |
| C3 | HIGH | Specs | S1 validator rule 4 (pressure required) vs S4 §9 (pressure may be null) | B1 |
| C4 | HIGH | Wording | Four different lunar-estimate wordings across AGENTS, S4, W2, W1 | B4, W1, W2 |
| E1 | HIGH | Schedule | No screen/visual spec exists; B5/B7/B8 start at 9:45 | Team lead |
| E2 | HIGH | Schedule | R8 accuracy number cannot be reached Saturday | B10, pitch |
| M1 | MEDIUM | States | Zero-verified-rows state is likely on demo day but has no screen | B5, B12 |
| M2 | MEDIUM | States | Conflicting evidence is hidden by BURNED precedence | B4, B7 |
| M3 | MEDIUM | States | Load/error/empty/input-validation states unspecified | B5 |
| M4 | MEDIUM | States | Rows with a non-spread endpoint (Test 1 MOC, ULOI, extinction) are invisible | B7 |
| U3 | MEDIUM | Slider | O2 slider: pressure fixed or coupled? range, step and preset behaviour unspecified | B8 |
| U4 | MEDIUM | Engine | Rule M will FLAG nearly every row (name string never equals display name) | B3 |
| U5 | MEDIUM | Schema | `labelCabin` cabin-query shape and multi-column CSV merge not defined | B0, B2 |
| U6 | MEDIUM | Data | "Teflon" in README; only ETFE rows exist; alias risk | B2 |
| C5 | MEDIUM | Wording | R8 BURNED/NE wording differs from S4 §6 table | B4, B6 |
| C6 | LOW | Specs | `reviewed` status exists but no rule uses it | B1 |
| C7 | LOW | Specs | Mars-gravity queries get the "lunar" path and a lunar-only prefix | B4 |
| E3 | MEDIUM | Schedule | B11 hand-verification and Pages setup are under-timed | Team lead |

## 3. Contradictions (schema vs screens vs engine vs research)

### C1 (HIGH). R3 lunar rows do not fit the S1 schema

- **What:** R3's CSV uses `gravity` = `1/6 g` (text), endpoints `uhoi-extinction-5s`,
  `uhoi-fit-extrapolation`, `smolder-extinction-5s`, `compensation-factor-estimate`, `MOC`,
  `ULOI`, `MOC*`, `ULOI*`, `review_status` = `HOLD_scientific_review` /
  `transcribed_cross_endpoint_caveat`, `value_unit` = `pp O2`, and `pressure_kpa` blank with
  `pressure_psia` = 14.7 for OF12 rows ([R3] CSV header and rows U25-*, OF12-*). S1 §4.2 allows
  `gravity_g` as a number, a fixed endpoint enum (R1 §2.1 col 11), `review_status` ∈
  {draft, reviewed, verified}, and units `% O2`, `kPa O2`, `cm/s`, `mm/s`, `pass/fail`. S1 §4.3
  rule 1 makes all of these build errors. S1 B2 inputs list only R1, R2, R7 ([S1] §5 Wave 1).
- **Also:** R3 marks the centrifuge as `facility: drop-tower` ([R3] rows U25-*-L), which is
  right for X (short duration) but loses "centrifuge" for the evidence panel.
- **Fix:** B2 imports R3 rows as `review_status: "draft"` (R3 itself holds them for science
  review, [R3] "Source discrepancy requiring review"). Map `1/6 g` → `gravity_g: 0.16`,
  `1g` → 1, `0g` → 0; convert 14.7 psia → 101.3 kPa (S4 §2 step 2 allows this) and note it.
  Add to the S1 endpoint enum: `MOC-T1` already exists, so map OF12 1 g `MOC` → `MOC-T1` only if
  the science lead confirms it is the Test 1 MOC (OF12 1 g uses "modified Test 1 criteria",
  [R3] "Nomex fabric…"); otherwise add `MOC`, `ULOI`, `extinction-5s`. Do **not** import
  `*-fit-extrapolation` or `compensation-factor-estimate` rows as evidence rows: R3 says they are
  "our digitization and extrapolation", not measurements ([R3] "Per-material measured
  reference…"). Keep them in `research/` only. Update S1 §6, S4 §1.1 and R8 §0 to say task/20
  now has simulated-lunar data.

### C2 (HIGH). Partial-gravity rows are unreachable

- **What:** S4 §4.1 says a `partial` row only matches a `partial` query. S4 §5.4 answers every
  partial query by running §5.1 with `gravity_g = 0` and `gravity_g = 1`, so no query is ever
  `partial` inside §5.1, and step 3 drops rows whose class differs. Result: the only
  simulated-lunar data (R3 U25-*-L, OF12-NOMEX-L-*) can never be cited, even after review.
- **Fix:** in `lunar.js`, add a third pass `gP` over `partial` rows; return
  `estimate: { g0, g1, gP }` (S1 §3.1 says `estimate` is an object, so adding a key is
  backward compatible). Label `gP` as "simulated partial gravity (short-duration)"; rule X will
  already FLAG it. Add a golden test once a verified partial row exists; until then assert
  `gP` = `NE-no-data`.

### C3 (HIGH). Validator rule 4 differs between S1 and S4

- **What:** S1 §4.3 rule 4 requires non-null `pressure_kpa` for verified rows. S4 §9 relaxes it
  because Link2018 gives no pressure, and says "B1 implements the relaxed rule". B1's inputs in
  S1 §5 are "§4" (S1's own schema), so a B1 agent reading only S1 will implement the strict rule
  and reject the S4 fixture rows.
- **Fix:** patch S1 §4.3 rule 4 to match S4 §9 at kickoff (one line), or add "read S4 §9" to
  B1's task text. Add a validator test: verified row with `pressure_kpa: null` passes.

### C4 (HIGH). Lunar estimate wording differs in four places

- AGENTS Science rules: range "bounded by 0 g and 1 g results".
- S4 §5.4/§6: prefix "Estimate between 0 g and 1 g results:", and "never present this as a bound".
- W2 "Presenter preparation": "estimate / assumed envelope".
- W1 "How the evidence would be presented": "estimate based on selected endpoint experiments".
- **Fix:** one string in `label.js`, used by UI, pitch and write-up. Proposed (inference):
  **"Estimate only: shown beside 0 g and 1 g test results. Lunar behaviour may fall outside
  this range."** The second sentence is required by D1. Change AGENTS "bounded by" to
  "shown beside" (team lead edit).

### C5 (MEDIUM). R8 wording vs S4 wording

- R8 §1 calls BURNED "burned in a comparable test" and gives every NOT ESTABLISHED the wording
  "not found in the sources reviewed". S4 §6 uses "Burned in testing at these conditions" and a
  different sentence per reason code. R8 C2 only bans phrases, so both pass, but adjudicators
  (R8 §3.3) and the UI will see different text.
- **Fix:** S4 §6 wins (it is the single wording table, S1 §3.2 step 6). Note this in R8 §1.
  Also fix the NE-no-burn sentence per U1.

### C6 (LOW). `reviewed` status has no meaning

S1 §4.2 adds `reviewed` between `draft` and `verified`; no rule in S1 or S4 uses it.
**Fix:** define it as "first extraction checked by the extractor; awaiting second person
(B11)", excluded from labels like `draft`. S4 §8 criterion 7 already tests the exclusion.

### C7 (LOW). Non-lunar partial gravity

S4 §4.1 sends any 0.01 < g < 0.9 query to lunar mode with the lunar wording; R8 C5 talks only
about 0.16 g. A Mars (0.38 g) cabin would get "lunar" text. **Fix:** prefix uses the query
value ("Estimate for 0.38 g…") or the UI restricts gravity to {0, 0.16, 1}. The latter is
cheaper (inference).

## 4. Scientific overclaims

### D1 (BLOCKER). The 0 g / 1 g "bound" is contradicted by NASA data

- **What:** AGENTS Science rules, S1 §3.2 step 5, R1 rule G and R8 C5 all treat lunar results
  as lying between 0 g and 1 g results. Sources now on the R3 branch contradict this:
  - OF12 Table I p. 6 (via [R3] "Nomex fabric and earlier partial-gravity evidence"): Nomex
    HT90-40 simulated-lunar MOC* 19.9% / ULOI* 21.0% are **below** both the 1 g values
    (22.1 / 23.5) and the 0 g values (22.0 / 23.0). R3's inference: a 0 g-to-1 g
    interpolation "is not a verified universal bound".
  - U25 p. 9 (via [R3] "Source discrepancy requiring review") describes PMMA, P213 and cotton
    lunar limits as below the terrestrial extrapolation, with plot inconsistencies R3 flags.
  - JSC 27301 Rev J §5.1.1 e note, p. 52 (via [R5] §5): the plan describes Earth gravity as
    less severe for flammability than lunar gravity.
  - FM2 Background (via [W2] "Presenter preparation"; [S4] §5.4): NASA raises the possibility
    of lower lunar oxygen limits.
- **Consequence:** S4 §5.4 takes the "more severe" of g0 and g1 as the top label. If lunar can
  be worse than both, that label can still under-warn, and calling it conservative is wrong.
- **Fix:** (1) wording per C4; (2) keep S4's "more severe" rule but drop the word
  "conservative" from S4 §5.4 and from any pitch text; (3) the lunar row in the results table
  must always show both g0 and g1 (and gP per C2), never only the top label; (4) the evidence
  panel shows the OF12 Nomex case as a one-line "why this is only an estimate" note with its
  locator, once B11 verifies it. (5) R8 §0 out-of-scope note: replace "no lunar-gravity limits
  were found" with "only short-duration simulated-lunar data were found (U25, OF12); not scored".

### D2 (BLOCKER). Non-NASA sources vs the AGENTS citation rule

- **What:** AGENTS Science rules require every value and label to link to a NASA source
  (PSI investigation, NTRS paper, or nasa.gov page). S4 §7.1's fixture, which is also the only
  realistic demo data (S4 §1.2), uses Link2018 (nature.com, Sci. Rep.) and Osorio2014
  (escholarship.org, UC Berkeley PhD thesis) for 5 of 6 rows. Only Zhao2015 is on NTRS
  ([S4] Sources).
- **Fix (pick one at kickoff, science lead):** (a) find NTRS records for the same results
  (an NTRS version of Link2018 or of Osorio's results was **not found in the sources
  reviewed**; check NTRS before assuming); or (b) amend AGENTS to "NASA source, or a
  peer-reviewed paper with NASA authors or NASA-run experiment data, labelled as such", and
  show a "non-NASA publication" tag in the evidence panel. Until decided, B2 keeps those rows
  `draft`. Note: R3's U25, US25, OF12 and F26 are all NTRS ([R3] "Sources and access"), so the
  NASA-only path is viable for Nomex, cotton and PMMA sheet once C1 is solved.

### D3 (HIGH). Fixes feature overclaims

- **What:** README "Fixes: swap a material or cap the oxygen level". S1 B9: suggest swapping a
  BURNED material for one with `NE-no-burn`, and an O2 cap. S4 §4.3 itself says a single burn
  point "is not a measured limit (the limit could be far lower)". A cap set just below the lowest
  burn point is therefore not a limit, and a swap to a `NE-no-burn` material may only mean fewer
  tests (see U1). R5 wording rules ban "fire-safe".
- **Fix:** rename the feature "What changes the label" (inference). (1) O2 control shows "At
  ≤ X% O2, no burned-in-testing result applies to this material in the sources reviewed",
  where X is just below the lowest BURNED row; never call it a cap or limit unless the row is a
  `LOC-FS`. (2) Swap suggestions only list materials whose label is `NE-no-burn` **with a
  covering row** (U1 fix) at the same conditions, worded "has no burned-in-testing result at
  these conditions". (3) Add both strings to `wording.test.mjs` (B6).

### D4 (HIGH). README claims

| README claim | Status in reviewed files | Fix |
|---|---|---|
| NASA plans Moon base at ~30% O2 or more | Supported: 8.2 psia / 34% O2 for habitats and rovers ([R7] "Atmosphere presets", S1 p. 24, S12 §4.6.3.6 p. 142); up to 37% ([R5] §5, FERKUL26 PDF p. 25) | Keep; cite R7 S1/S12 |
| "a level hospitals already treat as a fire risk" | **Not found in the sources reviewed** (no branch cites a hospital source) | Remove, or find and cite a source before it appears in any slide |
| Materials approved with an Earth-gravity fire test | Supported: Test 1 is a 1 g upward test ([R5] §1, STD6001 §7.1, pp. 27–30); JSC 27301 requires Test 1 ([R5] §2, p. 51) | Keep; cite |
| Label "never tested" | Banned ([R5] wording rules; [S4] §6) | Change README to "not found in the sources reviewed" |
| Label "close to the burn limit" | S4 §6 uses "close to a measured limit" | Use S4 wording |
| Slider: pre-breathe tradeoff vs "how many materials become a fire risk" | R7 recommends discrete presets, no O2-to-time curve ([R7] "Status, uncertainty…"); "fire risk" is a claim REDLINE cannot make (AGENTS) | "how many materials have a burned-in-testing result" |
| Untested combinations become suggested experiments "for NASA's upcoming Moon fire tests" | FM2 is planned; the current concept is four burns of one fabric (F26 PDF pp. 5–10, via [R3] "FM2 context") | "candidate questions for NASA's lunar flammability work" (W2 wording) |

### D5 (MEDIUM, folded into U1/U2). "No burning found" wording

See U1 and U2: both make the `NE-no-burn` sentence claim more coverage than the data has.

## 5. Unclear or unsafe rules

### U1 (HIGH). `NE-no-burn` without coverage

- **What:** S4 §5.1 step 7 returns `NE-no-burn` whenever eligible rows exist and none supports
  BURNED/NEAR. Wording: "No burning found in comparable tests at or below this oxygen level"
  ([S4] §6). In S4's own cases:
  - T4 `g1`: PMMA at **34%**, 1 g → `NE-no-burn`, citing only LINK2018-1G-18, a no-spread at
    **18%** in a raise-flow (blow-off) test. Nothing was tested between 18% and 34%. The sentence
    reads as if 1 g PMMA did not burn up to 34%. **Inference:** a judge would read this as an
    under-warning (R8 §4.1 calls under-warning the worst error).
  - T2: PMMA at 16.5%, 0 g → `NE-no-burn`, citing only burn points at 17% and 17.5%. No test
    at or below 16.5% exists in the fixture.
- **Fix:** a row **covers** query O2 `o` only if it is (a) a no-spread / extinction row at
  O2 ≥ `o`, or (b) a `LOC-FS` row with value > `o` + margin. `NE-no-burn` requires at least one
  covering eligible row. If eligible rows exist but none covers `o`, return
  `NOT_ESTABLISHED / NE-incompatible` with `why: "no comparable test at this oxygen level"`
  (keeps R8's three codes; R8 scores it as a refusal). Update T2 and T4 `g1` expectations to
  `NE-incompatible`; T8 stays `NE-no-burn` (LOC 31.5 > 30 + 1, same 100 kPa). T3 is covered
  on O2 (18 ≥ 17.5) but becomes `NE-incompatible` under U2, because both pressures are unknown.
  Reword NE-no-burn: "Did not burn in comparable tests at or above this oxygen level".

### U2 (HIGH). Pressure gap only FLAGs

- **What:** R1 rule P cites Urban2014 and Osorio2014 for the finding that a fire-resistant
  material can become flammable at reduced pressure at the same O2 partial pressure ([R1] §4,
  rule P). The demo cabin is 56.5 kPa ([R7] presets); most evidence is near 101 kPa or
  unstated. Under S4 §4.2 a 44 kPa gap is only a FLAG, so a 1 atm no-spread row can produce
  "did not burn" for a 56.5 kPa cabin.
- **Fix (inference, asymmetric and conservative):** keep P as FLAG for BURNED/NEAR (evidence
  of burning stays informative), but a row with |Δp| > `PRESSURE_FLAG_KPA` or unknown pressure
  **cannot cover** for `NE-no-burn` (U1). Show both `o2_pct` and computed `o2_partial_kpa` for
  cabin and row in the evidence panel (R1 §2.2 already requires the derived value). Science lead
  to confirm before the test split is scored ([R8] §2.3).

### U3 (MEDIUM). O2 slider semantics

- **What:** W2 changes "oxygen only, keeping pressure, airflow and the cabin list fixed". R7
  presets couple pressure and O2 (14.7/21, 10.2/26.5, 8.2/34). S1 §3.3 re-runs `labelCabin`
  "at each O2 step" but gives no range, step, or what happens to pressure.
- **Fix:** slider changes `o2_pct` only, range 15–40% in 0.5-point steps (inference: covers
  all fixture values and R5's "up to 37%"), pressure stays at the selected preset. Preset
  buttons set both. Pre-breathe notes appear only when both values equal a preset exactly;
  otherwise "pre-breathe duration not found in the sources reviewed" ([R7]). Show the count of
  materials per label as text, not a coloured gauge.

### U4 (MEDIUM). Rule M flags almost everything

S4 §4.2 rule M FLAGs when the row's `material` string differs from `display_name` and every
alias. Source names ("PMMA, cast black", "ETFE insulation on copper") will never match, so M is
on every row (it is in every S4 §7.2 flag list). **Inference:** a flag that is always on is
ignored. **Fix:** add optional `material_grade` (e.g. "cast black") to rows; FLAG M only when
the cabin line names a grade that differs, or when the row has a grade and the cabin line has
none ("grade not specified"). Keep the full source name visible in the panel.

### U5 (MEDIUM). Cabin query and CSV shape

- `labelCabin(cabinQuery, evidence)` ([S1] §3.1) never defines `cabinQuery`. **Fix:**
  `{ conditions: { o2_pct, pressure_kpa, flow_speed_cm_s, flow_direction, gravity_g,
  external_heat_flux_kw_m2 }, materials: [{ material_id, form, thickness_mm, width_mm }] }`;
  `labelCabin` builds one S1 `query` per material line.
- `data/evidence.csv` must hold R1 columns + R2's 23 provenance columns + R3's extra columns
  (`pressure_psia`, `comparison_velocity_cm_s`, `gravity_context`, …). **Fix:** one CSV with the
  S1 §4.2 columns first, then a free `provenance_json` column, or keep per-source CSVs and let
  `build-evidence.mjs` merge them. The second is less error-prone for parallel agents
  (inference).

### U6 (MEDIUM). "Teflon"

README lists Teflon. The only fluoropolymer rows are ETFE (S4 §7.1; [R1] §5 Ex. 2). R8 §5 says
synonyms are not merged ("teflon" ≠ "ptfe"). **Inference:** ETFE and PTFE are different
polymers by name (ethylene-tetrafluoroethylene vs polytetrafluoroethylene). **Fix:** no
`teflon` alias on `etfe`; add `ptfe` ("PTFE (Teflon)") as a material that returns `NE-no-data`
until a row exists. That makes a good absent-data demo item.

## 6. Missing states

### M1 (MEDIUM). Zero or few verified rows

S4 §1.2 says live `evidence.json` may hold zero verified rows on Saturday; then every material is
`NE-no-data`. Nothing in S1 tells the UI to explain this. **Fix:** header line "Evidence: N
verified rows from K sources (built <date>)", from `evidence.json` metadata. If N = 0, show
"No verified evidence loaded" instead of a table of identical NE labels. W2's static fallback
covers the pitch.

### M2 (MEDIUM). Conflicting evidence

S4 §5.1 cites only the rows that produced the winning label. A material with a BURNED row and a
no-spread row at higher O2 in the same class shows BURNED with the conflict hidden (e.g. Link2018
1 g: no-spread at 18%, while the Fig. 6 caption gives < 18.5% for a 1.27 cm rod; S4 §7.1 note).
**Fix:** add `conflicts: [evidence_id]` (eligible rows that point the other way); the panel
shows "Other comparable tests disagree" with those rows. Additive to S1 §3.1.

### M3 (MEDIUM). Basic UI states

None of these is specified ([S1] §5 B5, B7, B8): `evidence.json` loading; fetch failure
(including `file://`, [S1] §1 "Local run"); validator failure at build time; empty cabin list;
out-of-range input (O2 outside 0–100, pressure ≤ 0, negative flow); unknown material typed in;
lunar row with g0 ≠ g1; NE-incompatible row (must list the INVALID rules and why). **Fix:** §7
table.

### M4 (MEDIUM). Evidence that cannot drive a label

Rule E makes every non-spread endpoint INVALID for a cabin query (S4 §4.2 rule E). So NASA-STD-6001
Test 1 MOC rows, R3's ULOI/MOC and extinction rows, and quench limits never appear, even though
R5's wording rules expect "passed NASA-STD-6001 Test 1 at X% O2". **Fix:** evidence panel
section "Related tests (different endpoint, not used for the label)", listing them with endpoint
and locator. No engine change.

## 7. Minimum screen and state list (stands in for the missing `screens.md`)

**Inference / proposal**, sized for Saturday. One page, three regions. Visual style per AGENTS
"Engineering rules" (dark, high-contrast, no gradients, glass or emoji) until a `DESIGN.md` exists.

| Region | Content | States that must exist |
|---|---|---|
| Cabin form (B5) | Preset buttons (3, from R7); O2 slider (U3); pressure (kPa, psia shown); airflow (cm/s, optional); gravity {0, 0.16, 1}; material list with optional form/thickness | default = 8.2 psia / 34% / 0.16 g; invalid input inline error; unknown material → "not in the material list" |
| Results table (B5) | One row per material: label text (S4 §6), reason, flag letters, "cross-gravity" tag, lunar g0 / g1 (/ gP) side by side, first citation link | loading; load error; 0 verified rows (M1); NE-no-data; NE-incompatible; lunar disagreement |
| Evidence panel (B7) | Cabin vs row, field by field, every non-OK rule with `why`; % O2 and computed O2 partial pressure; source title, URL, locator; conflicts (M2); related tests (M4); estimate note (D1) | no row selected; non-NASA source tag (D2) |
| Slider/presets (B8) | Counts per label; pre-breathe notes at presets only | between presets: "not found in the sources reviewed" |
| Changes / experiments (B9) | D3 wording; experiment cards for NE labels listing missing conditions | none for BURNED/NEAR |

## 8. What cannot be built by Saturday afternoon (and what to cut)

### E1 (HIGH). No screen or design spec

B5 starts at 9:45 ([S1] §5) with no `screens.md` or `DESIGN.md`. **Fix:** use §7 above as the
B5/B7/B8 brief; do not write a design system on Saturday.

### E2 (HIGH). Accuracy number

R8 §6 needs ≥ 30 double-adjudicated held-out queries from ≥ 5 source groups, plus 12
incompatible controls. Today there are zero eligible rows ([R8] §0; [V1] summary), the
BASS-II rows lack endpoints and values ([V1]), and R3 rows are on hold ([R3]). **Fix:** build
B10 against the fixture only (S1 §5 already says so); the demo and write-up say "descriptive
only, too few independent tests" (R8 K6). Do not show any accuracy percentage. Keep the
incompatible-control demo (T10, T11, T13, T14), which is real and cheap.

### E3 (MEDIUM). Verification and hosting time

- B11 (11:30–13:00) needs a second person to reopen Osorio2014 (PhD thesis, pp. 74–100),
  Zhao2015 and Link2018 locators. **Inference:** about 6 fixture rows plus the 6 OF12 Nomex
  rows is realistic in 90 min; BASS-II endpoints and R3 U25 plot reads are not. Prioritise rows
  the demo uses (W2 path: one material, one gap).
- GitHub Pages plan/visibility requirements were not found in S1's sources ([S1] §1). **Fix:**
  B0 checks Pages in its first 10 minutes; fall back to `python -m http.server` on a laptop.

### E4 (LOW). Cut list if Wave 2 slips (inference)

1. `gP` third lunar pass (C2): keep the R3 rows as "related tests" (M4) instead.
2. `baseline.js` + holdout script (B10): fixture test only.
3. Swap suggestions (D3): keep only the O2 "what changes the label" line.
4. Conflict detection (M2): show all eligible rows in the panel instead.

Never cut: wording table + banned-word test (B6), citation on every label, lunar estimate note,
draft-row exclusion.

## 9. Action list for kickoff (in order)

1. Science lead decides D2 (NASA-only or amended rule) and approves C4 wording; edit AGENTS
   "bounded by" → "shown beside" (D1).
2. Patch S1 §4.3 rule 4 per C3; add U5 cabin-query shape to S1 §3.1.
3. Give B4 the U1 coverage rule and U2 pressure rule; update S4 T2 and T4 `g1` expectations.
4. Give B2 the C1 mapping and the U6 material list; import R3 rows as `draft`.
5. Give B5/B7/B8 the §7 table; B8 the U3 slider rule; B9 the D3 wording.
6. Fix README claims in D4 before any slide reuses them.

## Sources

All branch files were read with `git show origin/<branch>:<path>` on 2026-11-14 at the commits
in §0. No external web page was opened for this review; facts about NASA documents are
reported as the cited branch reports them, with that branch's locator.

| Key | Title | Location | Locators used |
|---|---|---|---|
| README | REDLINE README | `README.md`, `main` b24b046 | pitch, features |
| AGENTS | Rules for AI agents working on REDLINE | `AGENTS.md`, `main` b24b046 | Science rules; Engineering rules |
| S1 | REDLINE architecture plan and evidence-file schema (#26) | `origin/task/26-s1-architecture-plan-and-data-schema:docs/specs/architecture.md` | §1, §3.1–3.4, §4.2–4.4, §5, §6 |
| S4 | REDLINE Evidence Engine: build spec (#29) | `origin/task/29-s4-evidence-engine-build-spec-for-fable:docs/specs/evidence-engine.md` | §1.2, §4.1–4.3, §5.1, §5.4, §6, §7.1–7.2, §9, Sources |
| R1 | REDLINE evidence table: schema and comparability rules (#18) | `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md` | §2.1, §2.2, §4 (rules G, P), §5 Ex. 2, §6 |
| R2 | BASS-II PSI-25 data access and draft rows (#19) | `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft:research/bass2-rows.csv` | CSV header (40 columns) |
| R3 | NASA lunar-gravity flammability: 2025 evidence extraction (#20) | `origin/task/20-r3-nasa-2025-lunar-gravity-flammability:research/lunar-2025.md`, `research/lunar-2025-rows.csv` | "Sources and access"; "Per-material measured reference…"; "Source discrepancy requiring review"; "Nomex fabric and earlier partial-gravity evidence" (OF12 Table I p. 6); "FM2 context" (F26 PDF pp. 5–10); CSV rows U25-*, OF12-* |
| R5 | NASA's position: standards, FM2 and Saffire (#22) | `origin/task/22-r5-nasa-s-position-standards-fm2-saffire:research/nasa-context.md` | §1 (STD6001 §7.1 pp. 27–30); §2 (JSC27301 §5.1, p. 51); §5 (JSC27301 §5.1.1 e note p. 52; FERKUL26 PDF p. 25); "Wording rules for REDLINE" |
| R7 | Cabin atmospheres and EVA pre-breathe evidence (#24) | `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md` | "Atmosphere presets"; "NASA life-support baseline" (S12 §4.6.3.6 p. 142); "Status, uncertainty and illustrative-slider specification" |
| R8 | REDLINE validation plan (#25) | `origin/task/25-r8-validation-plan-how-redline-proves-it:research/validation-plan.md` | §0, §1, §2.3, §3.2, §4.1–4.2, §5, §6, §7 |
| V1 | Independent evidence verification (#31) | `origin/task/31-v1-verify-every-evidence-row-against-its:research/verification-report.md` | Result summary; fetched-ref table |
| W2 | REDLINE rover-cabin demo and pitch (#30) | `origin/task/30-w2-demo-script-and-pitch-outline:docs/pitch.md` | demo script 1:00–1:20; "Presenter preparation"; "Cross-branch context reviewed" |
| W1 | REDLINE submission draft (#33) | `origin/task/33-w1-draft-the-submission-write-up-data-ai:docs/submission-draft.md` | "How the evidence would be presented" |

Sources named inside those files (OF12, U25, JSC 27301, FM2 page, Link2018, Osorio2014,
Zhao2015, Urban2014) were **not re-opened** by this review; their content is taken from the
branch and locator cited.
