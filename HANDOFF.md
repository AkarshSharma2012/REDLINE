# HANDOFF: issue #344, deck numbers and sources match the app

## Done
- Checked both decks (`docs/pitch/REDLINE-final-4min.pptx`, `REDLINE-final-pitch.pptx`) against `data/` and the UI code.
- Fix 1, display: the Sources record view (`src/ui/workspace-evidence.js`) and the evidence panel (`src/ui/evidence-panel.js`) marked the two MIST rows (NASA Task Book, `taskbook.nasaprs.com`) as "Non-NASA publication". They now use the same NASA host rule as `src/schema/validate.js` and `gravity-view.js`.
- Fix 2, data display: the 56.5 kPa / 34% O2 preset cited Abercromby 2015 (R7-S4). It now cites NASA BVAD 2022 (R7-S12), Section 4.6.3.6, p.142 / PDF p.156. That is the same locator the repo already used for this atmosphere in the prebreathe row. Changed in `data/metadata.json`, `data/evidence.json` and `data/exports/evidence.json`. No values changed and no rows were marked verified.
- New `tests/deck-claims.test.mjs` pins each deck number (45 records, 6 distinct cited sources, 26 PSI entries, material counts, MIST limits, BVAD preset, NASA host per record).
- Revision (PR #347): removed the verification-count assertion and wording from that test; verification work is frozen. No review-status, verified-count or verification-wording changes in data or UI.
- The claims table is posted on issue #344.

## Testing
- Revision run: `npm ci`, `node scripts/build-ui.mjs` OK, `node --test`: 1381 tests, 1337 pass, 0 fail, 44 todo (existing TODO-marked test-data checks, not touched here). Branch already on current origin/main.

STATUS: DONE
