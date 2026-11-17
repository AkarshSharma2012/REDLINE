# Testing REDLINE

Run commands from the repository root. Tests use Node's built-in runner and strict assertions; no dependency installation, framework, bundler, backend, API key, or web server is required. Use a current Node release with ES modules, `node --test`, and `structuredClone` available.

## Run tests

```sh
node --test
```

This discovers the `tests/*.test.mjs` files. Read the final pass/fail/skip/TODO counts and exit code; a completed run is not necessarily a passing run. Some tests read committed production data, so failures can indicate data drift as well as code regressions. Older comments describing engine tests as TODOs are historical; inspect the actual test declarations and runner output.

For focused work:

```sh
node --test tests/retrieve.test.mjs
node --test --test-name-pattern="label snapshot" tests/snapshot-labels.test.mjs
```

Node tests exercise UI helpers with small DOM/event doubles and inspect HTML/source text. They do not establish browser layout, keyboard behavior in a real browser, or full accessibility conformance. Network-facing tests inject request doubles rather than requiring live NASA or model API access. Do not start persistent processes for conductor verification.

## Coverage by test file

All names below are relative to `tests/`.

| File | Coverage |
| --- | --- |
| `a11y-static.test.mjs` | Static HTML/UI literal audit: language, headings, image alternatives, control/button names and visible chip text; checker regression cases. |
| `baseline.test.mjs` | Naive name lookup, oxygen thresholds, source-group holdout and leakage checks, seeded splits, evaluation CLI, scoring/statistics and accuracy view states. |
| `build-determinism.test.mjs` | Byte-identical repeated evidence builds with an explicit timestamp, for original and reversed CSV inputs; input order is preserved, not canonicalized. |
| `check-links.test.mjs` | URL collection/deduplication, mocked HEAD/GET fallback, failures, timeout aborts, delays and escaped reporting. |
| `coverage-by-source.test.mjs` | Counts by source/investigation/review status, provenance, deterministic Markdown, malformed inputs and CLI output protection. |
| `csv.test.mjs` | Quoted commas, doubled quotes, BOM, trailing empty fields, ragged records and long fields. |
| `data-integrity.test.mjs` | Published evidence/source inventory, unique IDs and field completeness, including draft rows; stricter completeness checks can flag unknowns allowed by the schema. |
| `determinism.test.mjs` | Repeated calls, evidence permutations and input immutability for cabin labels, baseline and lunar estimates, including empty/non-spreading evidence. |
| `edge-cases.test.mjs` | Binding comparison/label rules and synthetic boundary conditions, including corrected S4/V2 contracts. |
| `eval-errors.test.mjs` | Holdout error explanations, retained verified uncited candidates, distance ordering, citations and explicit empty/refusal/control cases. |
| `eval-report.test.mjs` | Per-label denominators, refusal matrix, incorrect answers, source links and undefined accuracy for empty groups. |
| `evidence-panel.test.mjs` | Candidate ordering, mismatch reasons, filters, provenance, lunar separation, empty/error/retry states, immutability and literal text rendering. |
| `experiments.test.mjs` | Grouped/ranked evidence gaps and evidence-supported material/oxygen suggestions. |
| `export-datapackage.test.mjs` | Deterministic portable exports, exact resource bytes, provenance/licenses, custom destinations and invalid-input behavior. |
| `export-schema.test.mjs` | Reproducible committed JSON Schema, published rows and agreement with the runtime validator across mutations. |
| `find-duplicates.test.mjs` | Exact/conflicting/near duplicates, inclusive tolerances, incompatible or incomplete conditions, units and deterministic cited reports. |
| `gap-report.test.mjs` | Nine condition bins per material, verified versus draft coverage, exclusions, provenance and CLI failure/output handling. |
| `gravity-view.test.mjs` | Gravity data adapter, research gates, paired records, sourced SVG, filtering/navigation, loading/retry/lifecycle and hostile metadata handling. |
| `imports.test.mjs` | Named imports in `src/` resolve to exports, guarding module-load failures. |
| `insights.test.mjs` | AI/team-review flags, valid cited IDs, sentence/wording constraints and insight coverage for catalog investigations. |
| `investigations.test.mjs` | Catalog schema, field-level NASA provenance, invalid metadata/ranges, distinct investigation identities and wording. |
| `lint-csv.test.mjs` | CSV hygiene, endpoint-specific units, secondary provenance, malformed input, escaped reports and CLI exit behavior. |
| `main.test.mjs` | Tabs/hash fallback, page structure, framing/wording, rover preset, verified-only filtering and query snapshots. |
| `missing-fields.test.mjs` | Missing versus zero values, per-source summaries, provenance, deterministic reports, CLI errors and committed report freshness. |
| `normalize.test.mjs` | Oxygen partial-pressure calculation and gravity-class boundaries; psia conversion in test setup is not a tested production converter. |
| `o2-slider.test.mjs` | Fixed oxygen sweep, engine counts, presets/protocols, explicit Apply/Cancel, validation, mutation protection and failure/retry behavior. |
| `rank-investigations.test.mjs` | Habitat provenance, filters, factor scores, partial-gravity bounds, stable ranking/ties and comparisons with unknowns. |
| `retrieve.test.mjs` | Tokenization, weighted search, aliases, exact numeric tokens, stable ties/limits, prompt grounding, citation validation, mocked model requests and escaped answer rendering. |
| `schema.test.mjs` | Published CSV/JSON agreement, preserved unknowns/provenance, lunar mappings, schema enforcement, CSV round trips and validated build output. |
| `size-budget.test.mjs` | Recursive uncompressed static-asset byte budget, external-resource detection, allowed citations/SVG and CLI behavior. |
| `smoke.test.mjs` | Module entry point, binding exports, cabin-result shape and design tokens/label chips. |
| `snapshot-labels.test.mjs` | Exact per-evidence-row query/result comparison against committed golden labels; added and removed IDs fail too. |
| `units-audit.test.mjs` | Numeric ranges/types, unknowns, suspected unit magnitudes, preset provenance and clean/flagged/malformed CLI statuses. |
| `validate-rules.test.mjs` | Systematic required/nullable/type/enum/range/reference/uniqueness checks, verified-row conditions, sources, materials and cabin/prebreathe records. |
| `verification-checklist.test.mjs` | Draft-only source-grouped checklist, quoted/multiline CSV, traceable claims, escaping, dictionary sources and empty inventory. |

### Pending dependency files (#144 and #145)

These files were inspected on the following remote branches and are not present in this checkout yet. Their commands become available after integration; this guide does not imply they ran as part of this checkout's suite.

| Branch | Test and script | Coverage/use |
| --- | --- | --- |
| `origin/task/144-s-retrieval-benchmark` | `tests/bench-retrieve.test.mjs`, `scripts/bench-retrieve.mjs` | Small benchmark smoke cases, deterministic synthetic IDs and budget/report logic. |
| `origin/task/145-s-synthetic-evidence-generator` | `tests/make-synthetic-evidence.test.mjs`, `scripts/make-synthetic-evidence.mjs` | CLI schema validity, same-seed reproducibility, different seeds, empty output, invalid options and forbidden destinations. |

After integration, run the full retrieval workload separately:

```sh
node scripts/bench-retrieve.mjs
```

It times one full retrieval call at 1,000, 10,000 and 50,000 synthetic rows after warmup, excluding dataset setup. Only the 10,000-row result exceeding 200 ms causes exit code 1. The unit test uses small datasets and tests the budget predicate; it does not enforce real 10,000-row timing. Record hardware and Node version when comparing timings.

Generate larger schema-shaped stress inputs separately:

```sh
node scripts/make-synthetic-evidence.mjs --rows 10000 --seed 42
```

The CLI prints its new temporary output path. Defaults are 1,000 rows and seed 1; `--out` can select a new file. It refuses existing files and paths inside a directory named `data` (including resolved symlink destinations). Generated rows are explicitly synthetic drafts; the NASA repository URL is context only, not provenance for invented measurements. This generator is separate from the benchmark's internal workload. Never substitute generated rows for published evidence or claim scientific accuracy from stress-test results.

## Fixtures and isolation

Tests load fixtures explicitly with file URLs relative to `import.meta.url`; the runner does not auto-load JSON/CSV fixtures.

| Fixture | Purpose |
| --- | --- |
| `tests/fixtures/holdout-evidence.json` | Small fixture-only evidence dataset for labels, baseline, holdout leakage, determinism and error analysis. It tests software behavior, not empirical accuracy. |
| `tests/fixtures/holdout-queries.csv` | Paired answerable/incompatible/no-data queries for fixture holdout evaluation. |
| `tests/fixtures/investigations.json` | Development catalog for investigation ranking/filter/comparison tests; not the full production catalog. |
| `tests/fixtures/investigations.sample.json` | Small retrieval catalog, including a marked synthetic record. |
| `tests/fixtures/ui-cabin.json` | UI-only cabin/material/preset data with empty evidence and an explicit default result. |
| `tests/fixtures/labels.golden.json` | Generated expected label snapshots from production `data/evidence.json`; not hand-authored scientific truth. |

Many tests instead construct narrow inline synthetic records or read committed `data/` files. Keep that distinction explicit. For schema-valid evidence fixtures, include the schema/build metadata, source dictionary, materials, evidence and cabin presets, with resolvable IDs and required row fields. Preserve `null` for unknown conditions rather than substituting zero. Minimal partial records are appropriate only when the tested helper accepts them.

CLI/build tests use OS temporary directories. New tests should register cleanup with `t.after(...)` or use `try/finally`; pass explicit output paths so tests cannot replace published data/reports. Fix timestamps and random seeds where reproducibility matters. Stub fetch/model requests and test errors without relying on external availability.

## Add a test

1. Choose the existing file for the behavior, or add `tests/<feature>.test.mjs`.
2. Import `test` from `node:test`, assertions from `node:assert/strict`, and the actual production export. Use a small inline fixture or explicitly load a shared fixture; mark invented conditions as synthetic.
3. Assert an observable contract: expected result, relevant boundary/error behavior, citations, or input immutability. For a regression, choose an assertion that fails for the original defect. Avoid computing the expected result with the same function under test.
4. Run the focused file while developing, then `node --test` before handoff. Do not hide failures with skips/TODOs or weaken a fixture expectation merely to obtain a green run.
5. Add the file's purpose to this guide. Changes to fixtures, data or implementation belong in the issue that owns those files.

Example structure (replace the illustrative assertion with a production-function contract):

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('describes the input condition and expected behavior', () => {
  const input = { value: null }; // synthetic test input
  assert.equal(input.value, null);
});
```

## Regenerate golden labels

First investigate the snapshot failure and confirm the intended engine/data change. The generator reads `data/evidence.json`, sorts queries by evidence ID, copies each row's query conditions (unknowns remain `null`), and calls `labelMaterial` with only verified candidates for that material. Draft rows still supply queries. It saves the complete result, including wording, citations and flags, to `tests/fixtures/labels.golden.json`.

```sh
node scripts/update-golden.mjs
git diff -- tests/fixtures/labels.golden.json
node --test tests/snapshot-labels.test.mjs
node --test
```

Review every added, removed or changed ID and its query/result before committing the golden file alongside the intentional change. Missing/duplicate IDs or empty evidence cause generation to fail. Regeneration records current behavior; it does not validate the scientific interpretation or fix a defect. There is one golden file in this checkout. Other reproducible artifacts, such as the exported JSON Schema and missing-field report, have their own script/test contracts and are not regenerated by `update-golden.mjs`.
