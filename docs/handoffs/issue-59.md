# Issue #59 — B9: wire everything together in main.js + rover demo preset

## Done
- `index.html` (layout only): header with "Evidence review, not cabin certification", a one-line Prevention · Detection · Suppression framing, the partial-gravity note (no partial-gravity data in PSI yet; shown only as an estimate beside 0 g and 1 g results), dataset revision line. Tabs: **Investigations** (first screen) | Ask REDLINE | Cabin Check | Gravity view | O2 tradeoff | Accuracy. Small inline `<style>` for the tab bar and `[hidden]` (styles.css `.layout` sets `display:grid`, which would otherwise override `hidden`).
- `src/main.js`:
  - Hash routing (`#investigations`, `#ask`, `#cabin`, `#gravity`, `#oxygen`, `#accuracy`), arrow-key tab switching.
  - Loads `data/evidence.json`; error state with Retry. Investigations keeps its own `<script>` so the first screen works even if evidence fails to load; Gravity view needs no evidence either.
  - Cabin form -> real `labelCabin` (verified rows only) -> results table (with `items` + `evidence`) -> evidence panel on select (passes `result.query` and `options.query`, matching the #57 branch's contract; compatible with the main stub) -> fixes/experiment cards (`{ cabinQuery, evidence }`) -> O2 slider `update()`.
  - O2 slider mounts lazily on its tab from the evaluated cabin; Apply writes O2/pressure into the cabin form inputs and re-evaluates (the form has no setter API); Cancel returns to the cabin.
  - Gravity view gets the current cabin conditions as `request` and a Back to cabin button.
  - Accuracy loads `research/validation-results.csv` (absent -> "Held-out evaluation not run").
  - Ask REDLINE via `mountAsk(root, evidence)`.
  - **Lunar rover demo preset** (`ROVER_DEMO`, button "Load lunar rover demo"): screens.md §7 / docs/pitch.md 0:00-0:20 — PMMA window panel (sheet), cotton crew clothing (fabric), P213 hardware tape (tape), Nomex seat cover (fabric); default sourced exploration preset 56.5 kPa / 34% O2 (R7-S4); lunar scenario 0.16 g. Labelled illustrative, not a real rover manifest.
- `tests/main.test.mjs`: tab order (Investigations first), one tab + panel per screen, framing + gravity note present, banned wording absent, rover demo materials exist in evidence.json, verified-only filter, rover demo through `labelCabin` with frozen per-result query snapshots.

## Verified
- `node --test`: 96 tests, 95 pass, 0 fail, 1 pre-existing `todo` (insights for every catalog investigation; not this issue).
- `python -m http.server 8059`, then headless Chrome driven over the DevTools protocol (script kept outside the repo): Investigations shown first, others hidden; dataset line shows 29 rows / 0 verified; rover demo fills 4 items + 34% / 56.5 kPa and evaluates; fixes/experiment cards render; O2 tab shows presets, slider moves, Apply sets cabin O2 to 30 and re-evaluates; Gravity shows requested conditions; Accuracy shows "not run"; Ask retrieves 8 rows. Only console errors: 404 for favicon.ico and the (expected absent) validation-results.csv.

## Known state / for other owners
- **Engine is still a stub** (`src/rules/label.js`, `compare.js`, `lunar.js`) and `data/evidence.json` has **0 verified rows**, so the results table honestly shows "No verified evidence rows loaded." and every material is NE-no-data. The demo click-path will show real labels once B3/B4 land and rows are verified; no main.js change needed.
- **Evidence panel**: `origin/task/57-b7-evidence-panel-why-each-test-matches` is not merged; main still has the stub. main.js already passes `result.query` / `{ query }` as that branch expects.
- **Bug for B11 owner** (`src/ui/investigations.js` ~line 117): `root.replaceChildren(fixture ? el(...) : null, ...)` prints the text "null" at the top of the dashboard. Fix: pass `''` or filter out `null`.
- Nice-to-have for cabin-form owner: a `setConditions()` on the controller would replace main.js's input-editing in `applyConditions`.

STATUS: DONE
