# HANDOFF: issue #83 J1 Judge Q&A prep sheet

- Done: `docs/judge-qa.md` refreshed against `main` at 82f7364 (after UI PR #255). Still 45 evidence rows / 0 verified; no evidence status changed.
- Corrections: Q5/Q20 now say #234/#235 were fixed by PR #242/#247 (merged before b9e64d0); Q9 describes `coversNoBurn`; Q11 no longer says every number is a NASA measurement (inputs/inferences are not; extracted rows are unverified, no accuracy claim); Q15/Q17 call 0 g/1 g a context comparison, not physical bounds, and cite the Gravity view "assumed envelope unavailable" note; Q18 says the UI shipped via PR #255 but to await the Pages build before claiming it live.
- Test: full `node --test` on 82f7364 + this doc: 1150 tests, 1067 pass, 0 fail, 83 todo, exit 0. No server started.

STATUS: DONE
