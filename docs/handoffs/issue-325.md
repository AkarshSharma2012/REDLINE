# Issue #325: B2 grounded Ask claim boundary

## Done
- `src/ui/ask-boundary.js` (new): the boundary between generated text and verified NASA evidence.
  - Generated prose only appears in an "AI-generated discussion: Unverified" panel (`data-verified="false"`), with a note that a bracketed ID shows the row was retrieved, not that the row supports the sentence.
  - `[ID]` in the prose never becomes a NASA link. Known IDs link to an in-page copy of that row (`#ask-row-<id>`). The copy (deterministic `summarize()` text, draft flag, NASA source link) appears in a separate "Exact retrieved rows it cites" section.
  - Questions asking REDLINE to judge safety, approve, certify, recommend or predict ("Will X burn on the Moon?") are never sent to the model. They get a fixed notice, and the retrieved rows are still shown.
  - A coarse wording screen (approval, certification, non-flammable, "will not burn"...) withholds obvious decision language. It is documented as a backstop, not a verifier.
  - Malformed output (non-string, empty, more than 6000 chars) is not shown. Unknown-ID, uncited and draft-row caveats are shown.
- `src/ui/ask.js`: `answerHtml` delegates to the boundary. `esc` is re-exported. Editing the key or calling the new `invalidate()` drops in-flight answers. The live result is flagged `{ generated: true, verified: false }`. Nothing outside the Ask screen reads it (a test checks this).
- `tests/retrieve.test.mjs`: one assertion updated. Generated `[ID]`s now link in-page, and the NASA link sits on the exact row.
- `tests/ask-claim-boundary.test.mjs` (new, 38 tests). All answers are synthetic stub probes. No live-model run, no network, no key.

## Tested
- `node --test` focused Ask files: 100 pass.
- Full `npm test`: 1271 pass, 1 fail. The failure was `react-controls.test.mjs` with ERR_MODULE_NOT_FOUND, because the worktree had no node_modules. After `npm ci` that file passes (2/2).
- `npm run build-ui`: OK.
- #319 harness (`fe3527b`), run against this code: 9 of 11 constructed-false probes withheld. C04 (wrong number) and C05 (wrong material) pass the wording screen, as expected: a lexical filter cannot catch those. They render only inside the Unverified panel, next to the exact row that shows the real value. The harness regex counts the in-page `#ask-row-` anchors as links.

## Limits
- No semantic entailment check exists. The protection is structural labeling plus the exact row copy.
- There is no live-model evaluation.

STATUS: DONE
