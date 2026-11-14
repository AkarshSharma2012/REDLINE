# HANDOFF — Issue #25 (R8): Validation plan

STATUS: DONE

## Done
- `research/validation-plan.md`: whole-run/whole-source holdout (LOSO primary, union-find group keys, dev/test freeze, leakage check); 3 scored answers with reason codes for "not established"; score matrix; metrics (coverage, selective accuracy, under-warning, correct-refusal, traceability) with Wilson CIs; exact name-only baseline; minimum sample sizes; kill criteria K1–K7; results-file schema; 1-slide plain-language version.
- Numbers in §4.3/§6 (9.5%, 74–97%, 78%) recomputed with Python.

## Key decisions
- Thresholds (80% accuracy, 30% coverage, 5% under-warning, n≥30 from ≥5 sources, 12 controls) are design choices, labelled as such; change only before test split is scored.
- Lunar gravity not scored (no data in sources reviewed); only the estimate label is checked.
- Today zero rows are eligible (V1: all 15 BASS-II rows lack endpoint/value) → plan is ready, no result claimed.

## Gaps
- Roberts et al. 2017 (Ecography) 403 — not reviewed. Eypasch 1995 rule-of-three not reviewed; bound derived ourselves.
- Science lead should review thresholds and R1 inference thresholds on dev split.

## Next (at kickoff, other issues)
- Finalize evidence rows with endpoints; add `holdout_group` and NE reason codes to the build.
