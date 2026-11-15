# HANDOFF: issue #55, F1 Evidence Engine

STATUS: DONE

## What was done
- `src/rules/normalize.js`: `o2PartialKpa`, `gravityClass`, `parseUncertainty`, `uncertaintyNotStated`, `ratio`, constants `G_MICRO_MAX`, `G_EARTH_MIN`, `EPS` (S4 §4.1).
- `src/rules/compare.js`: `compareRow(query, row, ctx)` with all 13 rules in the order E M F T W D V P G X H A U; every rule returns a `why` naming both values (S4 §4.2). Constants `RATIO_FLAG`, `PRESSURE_FLAG_KPA`, `HEAT_FLUX_INVALID_KW_M2`.
- `src/rules/label.js`: `labelMaterial`, `labelCabin`, `labelSameGravity` (S4 §5.1 to §5.3), the `WORDING` table (S4 §6), `NEAR_MARGIN_PP`. Only `review_status: "verified"` rows count; rows are de-duplicated by `evidence_id`.
- `src/rules/lunar.js`: `lunarEstimate` (g0, g1) and `lunarLabel` for any query with 0.01 < g < 0.9 (S4 §5.4).
- `tests/fixtures/labels.golden.json` regenerated with `node scripts/update-golden.mjs`. Only the 8 simulated-lunar query rows changed: they now carry `estimate: { g0, g1 }`, `cross_gravity: true` and the estimate prefix. All 45 are still NE-no-data because live `data/evidence.json` has zero verified rows.
- The three acceptance test files were not changed. No test contradicted S4.

## How it was verified
- `node --test` (whole repo): 1093 tests, 1006 pass, 0 fail, 87 todo.
- `node --test tests/compare.test.mjs tests/label.test.mjs tests/wording.test.mjs`: 188 pass, 0 fail.
- Banned-word scan of the four engine files (`safe`, `never burns`, `never tested`, `will burn on the Moon`, `nonflammable`): no match.
- No server was started; the page was not opened in a browser.

## Decisions and things the next person should know
- Rule U does not flag a parsed uncertainty of exactly 0 (`+/-0`). S4 says "abs diff <= parsed uncertainty"; a zero-width band is treated as no band. This matches the todo test in `tests/edge-cases.test.mjs` ("one fully specified comparable row ... grade OK").
- A row uncertainty that starts with "not stated" (live data has "not stated for this table entry; ...") raises U, like the exact string.
- `labelCabin` adds `display_name` and `aliases` from `evidence.materials` to each query so rule M can use them. `labelMaterial` called directly without them flags M on every row.
- A query with unknown gravity (null) is not sent to lunar mode; it gets NE-incompatible with G flagged when rows exist.
- Lunar `flag_details`: one G entry per cited row (cabin gravity vs row), then the g0/g1 details for that row.
- `label.js` and `lunar.js` import each other (function use only at call time, so load order does not matter).

## Not done, outside this task's files
- `tests/normalize.test.mjs` and `tests/edge-cases.test.mjs` still use `test.todo`. 80 of those 84 now pass and `.todo` can be removed. The 4 that still fail encode review U1/U2 (coverage and pressure rules for NE-no-burn), which contradict the S4 goldens T2, T3 and T4 g1. S4 was followed. Science lead to decide.
- Review C2 (`gP` pass so verified partial-gravity rows can be cited) is not implemented; S4 §5.4 runs 0 g and 1 g only. The UI already tolerates an `estimate.gP` key.
- `src/rules/rank-investigations.js` and `src/rules/retrieve.js` contain the string "safe" (the `fire_safety_areas` field name, "fire-safety" text, and a prompt that lists the banned words). Not owned by this task, not changed.
