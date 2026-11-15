# HANDOFF: #249 final 60-second demo script

Done (07:32 acceptance correction, on main `2655346`, after PR #253 merged):
- `docs/pitch.md` 60-second narration (125 words): Cabin now says labels remain unavailable and we expose missing coverage (UI shows only "No verified evidence rows loaded"); close says research records retain NASA URLs/locators and requested conditions/inferences stay separate; click label is **Gravity view**. Technical workflow: agents work on task branches, merger integrates tested PR heads into `main` with head/base guards. Opus UI noted as release PR #255, not yet approved. Historical 2026-11-14 sections unchanged and dated.
- `tests/pitch-demo.test.mjs`: guards the corrected wording and the two UI labels.

Tested: full `node --test` once: 1150 tests, 0 fail (83 TODO).

STATUS: DONE
