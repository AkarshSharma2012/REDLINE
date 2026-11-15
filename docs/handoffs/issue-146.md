# HANDOFF: #146 S: Expand the holdout query set

## Done
- `tests/fixtures/holdout-queries-2.csv`: 40 queries, with the same columns as set 1.
  - 26 answerable: 15 `burned`, 4 `no-burn`, 7 `near`. Each one comes from a published row in
    `data/evidence.csv` or `research/*.csv` (`from_evidence_id`), with its source key and page.
  - 9 incompatible controls (rules D, F, E, H, V).
  - 5 absent-data controls.
- `docs/holdout-notes.md`: how each query was chosen, how the truth was set, merged groups, why
  the set is independent of the training rows, and what was left out.
- `tests/fixtures/holdout-queries.csv` was not changed.

## Decisions
- Partial-gravity, no-ignition, blow-off and fit-extrapolation rows are excluded (R8 §0, §3.1).
- Groups that share data are merged: Saffire-I/III go into SAFFIRE-I-III-SIBAL, Saffire-IV into
  Saffire-IV-VI, and OF12 with OMR08 into OF12-OMR08.
- Adjudicators are `pending`: R8 §3.3 needs two human labellers before a scored report.

## How tested
- A one-off node script (deleted after use) checked these points:
  - There are 40 rows and every `query_id` is unique.
  - Every `from_evidence_id` exists in a row file, and its source key, O2 and flow direction
    match that row.
  - The truth vocabulary is `burned`, `near` or `no-burn`.
  - No query reuses a row from set 1.
  - The absent materials have no rows, and the incompatible materials do have rows.
- `node scripts/eval-holdout.mjs --seed 1 --evidence data/evidence.json --queries tests/fixtures/holdout-queries-2.csv`
  parsed all 40 queries. The leak check (K7) passed.
- `node --test`: 870 tests, 1 failure. The failure is
  `tests/missing-fields.test.mjs` "checked-in report matches current evidence". It was already
  failing and does not touch the files of this task. `docs/missing-fields.md` needs to be
  regenerated (owner: missing-fields task).

## Next (others)
- Optional: add a test that loads `holdout-queries-2.csv` (this task does not own test files).

STATUS: DONE
