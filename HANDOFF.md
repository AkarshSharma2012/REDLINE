# HANDOFF — issue #29 (S4: Evidence Engine build spec)

## Done
- `docs/specs/evidence-engine.md` (~330 lines, no code): inputs, extraction + hand-check workflow,
  output JSON (S1 schema + two additive fields), compareRow rule table (R1 rules E M F T W D V P G X H A U,
  exact conditions), labelMaterial algorithm with reason codes, uncertainty handling, lunar 0 g / 1 g
  estimate, wording table, 14 label test cases + 3 compareRow golden cases + 2 baseline cases +
  5 extraction checks from real rows (Link2018, Osorio2014, Zhao2015, BASS-II PSI-25), 10 acceptance criteria.
- Expected outputs were hand-computed against the rules and re-checked once.
- Link2018 values re-verified against the article (2026-11-14). Osorio2014/Zhao2015 values taken
  from R1/R2, not re-opened (stated in spec).

## Key decisions (see spec §9)
- Verified rows may have null `pressure_kpa` (relaxes S1 §4.3 rule 4); rule P flags it.
- Only LOC-FS rows can give NEAR; a single burn point is not a limit.
- Cross-gravity-only evidence -> NE-incompatible with cross_gravity true.
- Lunar top label = more severe of g0/g1; both shown as an estimate.
- All 15 BASS-II rows stay draft; the engine never sees them.

## Next (at kickoff)
- B1: apply the relaxed validator rule. B3/B4/B6: implement from the spec; tests = spec §7.
- Science lead: review the constants in §4.4 before the test split is scored.

STATUS: DONE
