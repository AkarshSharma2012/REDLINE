# HANDOFF: issue #319 (B2 adversarial known-citation claim-boundary harness)

Done: `scripts/global-readiness/b2-claim-boundary.mjs` (only file owned). Read-only, no network, no deps, no app/data edits.
Runs 14 synthetic answers (2 supported, 11 constructed-false, 1 control) through `answerHtml` + `citationsIn`/`isNotFound`/`groundingHits`/`sourceFor`/`retrieve`, pinned grounding rows PSI25-B1, U25-01-L, U25-06-L (all draft).
Result: 6 of 11 constructed-false claims (approval, false number, misattributed material, 0 g -> lunar transfer, paraphrased approval, "non-flammable") render with a real NASA link and no caveat. Guards are a word blocklist + ID-membership only; no semantic check, no draft notice.
Exit 0 = ran; exit 2 = setup error only.

Tested: `node scripts/global-readiness/b2-claim-boundary.mjs` (and `--json`), `npm test` (1283 tests, 0 fail, after `npm ci` from lockfile), `npm run build-ui` OK.
Next: coordinator re-runs harness and decides the structural fix (not in scope here).

STATUS: DONE
