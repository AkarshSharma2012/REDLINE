# #337 B2 four-section cockpit — handoff

Machine LAPTOP-AM, branch `task/337-b2-authorized-four-section-cockpit-match`, PR target `task/323-upgrade-integration`.

## Done
- Four top tabs (Model, Evidence, Investigations, Review brief) as WAI-ARIA tabs with one tabpanel each; arrows/Home/End, roving tabindex, hash routing. Old hashes (#cabin, #gravity, #oxygen, #accuracy, #ask) still work; sub-views open inside their parent section (`src/ui/section-nav.js`).
- Model section: summary strip on top (record counts, selection, label legend incl. "Not established", "Illustrative model · not a fire simulation", PSI citation), left Load rover demo + BOM sidebar, center viewer stage (lazy `mountRoverViewer`, HTML part list fallback), right Selected part inspector (evidence panel, results, fixes).
- Evidence section: NASA source records beside record detail. Brief section hosts `#review-cockpit` unchanged (pin/compare/export from B1).
- Contextual help (`.help`) opens on hover, focus and tap; Escape/outside tap closes. Critical status (dataset rows, verified count, research preview, not-a-fire-simulation, legend) stays visible text.
- One column at <=1080 px; tips fixed inside viewport at <=480 px; no fixed min-width wider than a phone.
- Did not touch A2 (rover-model/viewer/assets/CSV) or B1 pipeline modules. All existing element IDs kept.

## How tested
- `npm test`: 1358 tests, 1314 pass, 0 fail, 44 todo. `npm run build-ui`: OK.
- New `tests/section-nav.test.mjs` (jsdom on real index.html): routing, tab keys, single visible section, help tap/Escape, essentials visible, 390 px CSS rules.
- Load/select/condition/pin/export covered by existing jsdom suites (cockpit-integration, workspace-integration, react-controls, review-cockpit) — all pass.
- No browser/server run (hard rule for this conductor). Desktop and 390 px browser screenshots with console check still needed at integrated acceptance.

## Notes
- B1/A2 could not be messaged from this session; app-entry diff in `src/main.js` is limited to routing (`TABS`=sections, `tabFromHash` returns view, `#cabin`->model).
- Removed #277 pane resize/density toolbar (layout only); stage view pref key is `redline.workspace.v2`.

STATUS: DONE
