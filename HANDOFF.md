# HANDOFF — Issue #67 (B11: Investigation dashboard UI)

STATUS: DONE

## Done
- `src/rules/rank-investigations.js` (pure, no DOM):
  - `HABITATS`: spacecraft, station, lunar base, Mars base, pressurized rover. Each has an O2 range, a pressure range and a gravity regime, plus NASA source links from R7 (`research/atmosphere.md`).
  - `field()` reads catalog fields shaped as `{ value, source, locator, note }`. A null value shows as "not found in the sources reviewed".
  - `filterInvestigations()` filters by fire-safety area, fuel type and hardware. `facetValues()` builds the filter menus.
  - `scoreInvestigation()` / `rankInvestigations()`: a transparent score made of visible points per factor (`WEIGHTS`):
    - need: 3
    - habitat named in the catalog relevance notes: 2
    - O2 overlap: 2, or 1 if within 3 points (`O2_CLOSE_PCT` is our choice)
    - pressure overlap: 1
    - gravity: 2. For partial-g habitats, 0 g gives 1 point and 0 g + 1 g bounds or an analog gives 2, always labelled as an estimate, because PSI has no partial-g tests.
    - Every reason carries its investigation and habitat sources. Ties share a rank and are sorted by name.
  - `compareInvestigations()` sorts the challenge attributes into same and differ, and shows shared list items. An unknown value never counts as "same".
- `src/ui/investigations.js`: `renderInvestigations(root, catalog)` and `loadInvestigations()`. It boots itself into `#investigations-root`.
  - Controls: habitat, need and three filters.
  - Ranked summary table with every challenge attribute. Each value cell has a source link (`Source`, aria-label = title + locator).
  - Clicking an investigation's name expands its "why" breakdown with full `Title — locator` links.
  - Side-by-side compare.
  - Status is announced in a live region. Load errors show a retry button.
- `index.html`: new full-width section `#investigations-root`, plus its own `<script type="module" src="src/ui/investigations.js">`. `main.js` is not touched.
- `tests/fixtures/investigations.json`: 5 investigations (BASS-II and Saffire-II/IV/V/VI). Values are copied from `research/bass2.md` and `research/nasa-context.md`, with sources and locators. Unknowns are null with a note. The UI shows a "Development fixture" banner while it is in use.
- `tests/rank-investigations.test.mjs`: 11 tests covering habitats, field sourcing, filters, score = sum of factors, the O2 partial point, partial-g bounds, ranking and ties, compare, and banned wording.

## How it was tested
- `node --test`: 39 pass, 0 fail.
- `python -m http.server`, then a headless Chromium (Playwright) run on `index.html`:
  - changing habitat and need re-ranks the table
  - opening a name shows the reasons with sources
  - the suppression filter leaves 1 of 5
  - Saffire-IV vs -V compare gives 7 same, 6 differ
  - 0 value cells without a link; no horizontal page scroll at 320 px
  - the only console error is the expected 404 for `data/investigations.json` (B10 not merged yet), after which it falls back to the fixture

## Notes for other tasks
- **B10 (data/investigations.json):** the UI expects:
  - `{ sources: { id: { title, url } } | [ { id, title, url } ], investigations: [ { id, name, <field>: { value, source, locator, note } } ] }`
  - field keys: `psi_id, objectives, hardware, fire_safety_areas, fuel_type, fuel_sample, o2_pct {min,max}, pressure_kpa {min,max}, airflow_cm_s {min,max}, gravity ["0g"|"1g"|"partial"|"partial-analog"], variables_varied, variables_fixed, sensors, key_findings, habitat_relevance [habitat ids], earth_applications`
  - Habitat ids: `spacecraft, station, lunar-base, mars-base, pressurized-rover`.
  - If B10 picks other key names, change the column lists in `investigations.js` and `COMPARE_FIELDS`. Nothing else needs to change.
- **styles.css owner:** `investigations.js` injects a small scoped `<style id="inv-styles">` (`.inv-*` classes, tokens only). Move it into `src/styles.css` when convenient.
- **main.js owner (optional):** it could import `renderInvestigations` instead of the extra script tag. The self-boot is guarded by `data-mounted`, so it won't render twice.
- **B12:** `rankInvestigations` and `compareInvestigations` are reusable for the AI insights.
