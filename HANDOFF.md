# HANDOFF: #249 final 60-second demo script

Done:
- `docs/pitch.md`: new "Current 60-second demo (2026-11-15)" table (timestamps, exact clicks, 122-word narration) and "Technical workflow" section; header now cites main `9b7250a` (PRs #238 #239 #244 #246 #248 #250 #251). Historical 2026-11-14 sections kept and dated.
- `tests/pitch-demo.test.mjs`: regression test for the script (timing 0:00–1:00, 100–140 words, prohibited wording, click labels, U25-01-L is HOLD_scientific_review with nasa.gov source and locator, historical headings dated).

Decisions: browser path is cited as reported in #249, not re-run here (no server/browser allowed). Accuracy tab excluded from the cut; validation-results CSV 404 = not run, no accuracy claimed. Opus UI pass not approved: recheck click labels if it lands.

Tested: full `node --test` once: 1150 tests, 0 fail.

STATUS: DONE
