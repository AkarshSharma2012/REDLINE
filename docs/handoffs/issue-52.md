# Issue #52 — Cabin form + results table

STATUS: DONE

## Delivered
- `src/ui/cabin-form.js`: scaffold-compatible `renderCabinForm(root, options)`; named illustrative rover/habitat scenario; sourced paired presets; oxygen, absolute pressure with kPa/psia conversion, optional airflow/direction, gravity; stable duplicate material items with name/use/grade/form/dimensions; add/remove/undo; inline validation and linked error summary; explicit evaluation and stale async result rejection.
- `src/ui/results-table.js`: scaffold-compatible `renderResultsTable(root, results, options)`; semantic table, row selection callback, exact material/use/form, three text/shape/style chips, engine wording, all supplied FLAG/INVALID details, cross-gravity tag, separate g0/g1/optional gP results and citations; loading/error/retry/empty/zero-verified states; safe text rendering and HTTPS NASA source links.
- `tests/fixtures/ui-cabin.json`: S1 evidence envelope plus explicitly named UI-only result extension; three sourced atmosphere pairs and material catalog. Empty evidence is deliberate: no invented burn measurements. Stub returns fixture coverage records and both reference-gravity results for lunar queries.
- Scoped DESIGN.md styles live in the owned results module because this task cannot edit styles.css. No dependency or stack change.

## Verification
- Node v26.13.1. Both JS files pass `node --check`; `git diff --check` passes.
- `node --test` on the initial checkout reported zero tests (no scaffold/test suite merged here).
- `node --test .ui-test.mjs` (temporary focused harness): 3/3 passed: duplicate order/fixture immutability, explicit fixture opt-in, S1 fixture/preset provenance contract.
- Local headless Edge, served over HTTP: 26 DOM assertions passed. Covered duplicate IDs/order, one row per item, selection identity, fixture disclosure, invalid pressure/O2, linked errors, remove/undo, preset item preservation, null airflow, quiescent conflict, pressure-unit conversion, custom atmosphere, pending evaluation invalidation, lunar endpoint disagreement display, visible mismatch explanations, NASA citation resolution, loading, retry, zero verified rows, escaping untrusted strings, controller cleanup.
- Inspected screenshots at desktop and 320 CSS px. Final narrow measurements after wrapping the test log: viewport 320, document scrollWidth 305, table internal scrollWidth 1037. Form fits; table scroll is contained. Native inputs/buttons support keyboard interaction; focus rings and associated labels are present. No screen-reader or color-vision emulator audit claimed.
- Python and py are absent, so `python -m http.server` could not run. Used an equivalent temporary dependency-free Node HTTP server on 127.0.0.1:8052. Initial sandbox Edge GPU startup failed; elevated local Edge worked.
- Temporary harnesses/screenshots removed after verification to respect owned-file limits. No permanent `.mjs` test added because this issue owns only the listed UI modules and ui-*.json fixtures.

## Integration contract / work outside this issue
The checkout contains only baseline README/AGENTS; scaffold and specs are on other origin/task branches. Read S1/S2/S3/S4/V2 from #26/#27/#28/#29/#32; inspected #50 scaffold exports/main wiring. No scaffold files were copied onto this branch.

B1/integration owner wires main.js (outside ownership):
1. Import both render functions. Load data or the fixture explicitly.
2. Call `renderCabinForm(formRoot, { materials: data.materials, presets: data.cabin_presets, sources: data.sources, evidence: data, items, evaluate, onChange, onEvaluate })`.
3. In fixture mode omit `evaluate`: exported stub `labelCabin(query, fixture)` requires `ui_fixture: true` and reads fixture result records. Never silently fall back to fixtures after an engine/data failure.
4. For real data pass `evaluate: labelCabin` imported from rules/label.js; receives the exact V2 U5 `{ conditions, materials }` shape plus local scenario/item metadata. Unknown heating is null, not an invented zero.
5. `onChange(query, {valid, stale})` marks old table results stale. `onEvaluate(results, query, {fixture})` renders with `renderResultsTable(resultsRoot, results, { evidence: data, items: query.materials, fixture, onSelect })`. Return values are synchronous controller/table handles; engine evaluation may be sync or async.
6. `onSelect(result, { item, index })` routes to evidence panel without merging duplicate materials. `state` options: ready/loading/updating/error/empty-evidence; `onRetry` handles data reload.
7. B8 owns slider/counts/pre-breathe protocol display; no duplicate slider added here. No interpolated pre-breathe duration is produced. Shared page layout/navigation/evidence panel remain with their owners.
8. Real result wording is consumed from the engine, including V2 corrected coverage wording. No UI thresholds or matching rules are implemented here. Source inventory links are coverage provenance, not support for a burn finding.

All implementation files are within task ownership; root HANDOFF.md is the required coordination exception. Current task branch only; never main.
