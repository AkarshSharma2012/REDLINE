# HANDOFF: #56 B6 Accuracy test (holdout vs naive lookup) + accuracy screen

STATUS: DONE

## Done
- `src/rules/baseline.js`: `baselineLabel(query, rows)` follows R8 §5 exactly. It normalizes the name (`normalizeBaselineName`), matches on the name only, sets *b* = the lowest O2 among rows that spread or have a limit endpoint, and returns BURNED / NEAR (b−1 ≤ O2 < b) / NE-no-burn / NE-no-data. It never returns NE-incompatible. The query name is `display_name`, then `material`, then `material_id` (S4 §5.5). Golden cases S4 §7.4 B1 and B2 pass.
- `scripts/eval-holdout.mjs`: leave-one-source-out. A union-find over source, `holdout_group`, run and reused sample means one run is never split across sides. The dev/test split is seeded (30% dev). The K7 leak check (`assertNoLeak`) runs before each group is scored. REDLINE (`labelMaterial`) and the baseline see the same retained table. The script writes `research/validation-results.csv` with the R8 §8 columns, plus `baseline_score`, `leak_check` and run metadata (`run_seed`, `run_commit`, `evidence_built_from`, `evidence_kind`, `run_at`) repeated on every row. Lunar queries and queries with no evidence group are marked `split=excluded`. If the evidence file or the queries file is missing, it exits 1 and writes nothing.
- `src/ui/accuracy-view.js`: `renderAccuracyView(root, rows, { sources, onBack })`, `loadAccuracyReport(url)` (404 → "not run"), and the pure `summarizeResults`, `scoreAnswer`, `wilson`, `exactOneSided`, `parseCsv` and `accuracyViewHtml`. Status banner values: Not run / Synthetic / Invalid (K7) / Descriptive only / Failed / Partial / Completed. Percentages and Wilson intervals appear only once the R8 §6 minimums are met. Before that the screen shows k/n counts only, and a zero denominator reads "Not defined (0 eligible cases)". The screen also has the minimum gate, K1–K7, breakdowns by source, gravity and endpoint, both confusion matrices, the method and baseline disclosure, and a query table whose truth column links to the source.
- `tests/baseline.test.mjs` (16 tests) and the fixtures `tests/fixtures/holdout-evidence.json` (S4 §7.1 rows across 3 source groups, `fixture-only`) and `tests/fixtures/holdout-queries.csv`.

## How it was tested
- `node --test`: 20/20 pass. One of those tests plants a leak and checks that K7 catches it and the run is marked invalid.
- `node scripts/eval-holdout.mjs --seed 7 --evidence tests/fixtures/holdout-evidence.json --queries tests/fixtures/holdout-queries.csv --out <tmp>.csv` printed "Status: synthetic" with counts.
- Ran `python -m http.server` with a temporary page (not committed) that loads the fixture results and calls `renderAccuracyView`, then rendered it in headless Edge. The synthetic banner, counts-only metrics, source links and the 404 → not-run path all checked out.

## Key decisions
- `research/validation-results.csv` is **not committed**. `data/evidence.json` and `research/validation-queries.csv` don't exist yet, and the label.js engine is still a stub, so the honest state is "Held-out evaluation not run". Writing fixture results into `research/` would mislead.
- The scoring and summary helpers live in `accuracy-view.js` (pure, no DOM), and the script imports them. That keeps one copy of the scoring logic without adding files outside this task.
- C1 is written as `auto-pass` (the cited row exists and has a URL and a locator). K1 stays "not assessed" until a person sets C1 = `pass` after opening the page.

## Next steps (outside this task's files)
- `index.html` / `src/main.js`: add the Accuracy nav item and a container, then call `loadAccuracyReport()` → `renderAccuracyView(el, rows, { sources: evidence.sources, onBack })`.
- When `label.js` exports its wording table, `ANSWER_TEXT` in `accuracy-view.js` should import it.
- People need to write `research/validation-queries.csv` (same columns as `tests/fixtures/holdout-queries.csv`; `from_evidence_id` ties each query to its held-out row). After the engine (B4) lands, run `node scripts/eval-holdout.mjs --seed <n>`.
- "Inspect case with that split's retained evidence" (screens §6 item 9) is not built yet.
