# Issue #150 — Engine examples

- Merged origin/main (includes #55 engine). `scripts/engine-examples.mjs` now runs the real `labelMaterial`/`compareRow` on the S1 holdout fixture; stub/BLOCKED text removed.
- 12 examples: 5 unmodified fixture seeds + quench-endpoint seed + 6 queries explicitly titled `SYNTHETIC query:` (hypothetical inputs, not production evidence). Fixed mislabeled example 2 (LINK2018-UG-17 is a spread row). Lunar example shows separate 0 g / 1 g results as an estimate.
- `docs/engine-examples.md` regenerated with `node scripts/engine-examples.mjs --write`.
- Tests: `tests/engine-examples.test.mjs` (5 tests: CLI/doc parity + prints output, wording guard, real rule diagnostics, cited ⊆ candidates, synthetic-title ⇔ modified-query, lunar estimate). Full `node --test`: 1157 tests, 1074 pass, 0 fail, 83 todo. No server/browser started.
- Review 07:56 fix: compacted doc formatting only (one-line query JSON, label/wording/flags on one line, each row's rule diagnostics grouped on one line with every rule reason kept). Doc 825 -> 261 lines; test asserts < 500 lines. All 12 examples, cited/candidate split, disclaimers and CLI/doc parity unchanged. Full `node --test`: 1157 tests, 1074 pass, 0 fail, 83 todo.

STATUS: DONE
