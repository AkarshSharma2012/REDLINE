# HANDOFF: issue #26 (S1) Architecture plan and data schema

## Done
- `docs/specs/architecture.md`: stack (static HTML + vanilla JS ES modules, `node --test`, GitHub Pages, no backend), folder layout, data flow, fixed function interfaces, label rules, accuracy-test design (unit tests + R8 leave-one-source-out script), exact `evidence.json` schema (R1 column names + R2 provenance + S1 additions), validator rules, cabin-preset shape, Saturday build order (B0-B12 in 4 waves).
- Inputs read from branches: R1 (#18), R2 (#19), R5 (#22), R7 (#24), R8 (#25), V1 (#31), W2 (#30). #20 had no files.
- Stack facts verified against Node, MDN, Python and GitHub docs (2026-11-14).

## Key decisions
- One copy of the rules in `src/rules/`, pure functions, used by both UI and accuracy test.
- `data/evidence.csv` is the human-edited source; `evidence.json` is generated and validated.
- Only `review_status: "verified"` rows can drive labels (R2/V1: draft rows lack endpoints).
- S1 additions to R1 schema: `material_id`, `outcome`, numeric `gravity_g`, `review_status`, `verified_by`, `holdout_group` (from R8).
- Null cabin field -> FLAG ("not specified"), never OK.
- No pre-breathe interpolation (R7).

## Next
- At kickoff: B0 scaffold, then waves per architecture.md §5.
- Science lead to review R1 thresholds (1-point NEAR, 2x, 10 kPa, 5 kW/m2) before test split is scored.

## Testing
- Plan only; nothing to run. Checked every schema column against R1 §2 and R2 CSV header; checked tool claims via fetched docs.

STATUS: DONE
