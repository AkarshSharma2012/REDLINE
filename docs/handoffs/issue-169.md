# Handoff: #169 X1 Judge click-through resilience

## Done
- `tests/resilience.test.mjs`: tiny fake DOM; calls every exported render/build function in the owned views
  with undefined/null/{}/[]/strings/records with missing fields, a 300-character material name, a failed fetch
  and a 404. Asserts no exception and no `undefined`, `NaN` or `[object Object]` in the rendered output.
- fixes.js: null/malformed results and context are handled; experiment cards can't break the fixes list.
- ask.js: all helpers handle null and missing fields; unknown fields read "not stated". Retrieval errors show the empty state.
  New `evidenceErrorHtml()`: `mountAsk(root, null)` shows a plain-language "data/evidence.json could not load …
  retry" message with a retry link (reloads the page).
- accuracy-view.js: non-array or non-record rows fall back to the "not run" view; missing run metadata reads "not stated".
- investigations.js: catalog records that aren't objects are skipped; a missing id or name gets a stable id or the "not found in the sources reviewed" text.
  formatValue handles NaN, empty arrays, {value} and other objects.
- o2-slider.js: missing or malformed evidence and cabin query become empty. Engine TypeErrors show a plain sentence,
  not the raw JS message. No "undefined%" in the preview line or aria-valuetext.
- gravity-view.js: already passed (failed fetch shows an error with a "Retry gravity data" button); no change.

## Tested
`node --test`: 894 tests, 1 failure: `missing-fields.test.mjs` "checked-in report matches current evidence".
That test covers scripts/missing-fields.mjs and the data report, not files from this task. No server started (conductor rule).

## For other owners (not my files)
- main.js: on an evidence.json failure, also call `mountAsk(document.getElementById('ask-root'), null)` so
  the Ask tab shows the retry notice instead of staying blank. main.js already shows a Retry button in #status.
- results-table.js (W3): `${detail.rule} · ${detail.grade} · ${detail.why}` and `tag.title` print "undefined"
  when flag_details entries lack fields. `sourceLink` prints "undefined — …" when source.title is missing.
  `item.name` throws if the cabin query has fewer materials than results. Suggest `?? 'not stated'` guards.

STATUS: DONE
