# HANDOFF — issue #32 (V2: review all specs for gaps and contradictions)

## Done
- Wrote `docs/specs/review.md`: 24 findings with severity + concrete fix, a summary table,
  a minimum screen/state list (stands in for the missing `screens.md`), a cut list and a
  kickoff action list. Every finding cites branch file + section; NASA papers were not re-opened
  (content taken from the branch that cites them, with its locator).
- Inputs read at: S1 406c51c, S4 279a39d, R1 278d60b, R2 38bb557, R3 0d0cb9a, R5 3892357,
  R7 1ea3b7e, R8 2b733e0, V1 450342c, W2 0df4e86, W1 3be0fae, main b24b046.

## Key decisions / headline findings
- BLOCKER D1: the "0 g / 1 g bound" for lunar is contradicted by OF12 Nomex data on the R3 branch.
- BLOCKER D2: 5 of 6 fixture rows (Link2018, Osorio2014) are not NASA sources, against AGENTS.
- HIGH: R3 rows fail the S1 validator (C1); partial-g rows unreachable in S4 lunar mode (C2);
  `NE-no-burn` returned without coverage (U1); pressure gap only FLAGs (U2); S1 vs S4 validator
  rule 4 (C3); Fixes overclaim (D3); README claims (D4).

## Gaps
- `screens.md` and `DESIGN.md` not found on any branch; R4 (task/21) branch has no files.
- No tests to run (review-only task). Verified: file < 500 lines, all findings have locators.

## Next
- Team lead / science lead: work through §9 "Action list for kickoff" in `docs/specs/review.md`.

STATUS: DONE
