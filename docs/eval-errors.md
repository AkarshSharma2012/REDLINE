# Holdout error analysis

Run the same frozen queries and seed as the holdout evaluation:

```sh
node scripts/eval-errors.mjs --seed 7 --out eval-errors.json
node scripts/eval-errors.mjs --seed 7 --evidence tests/fixtures/holdout-evidence.json --queries tests/fixtures/holdout-queries.csv
```

The second command uses synthetic fixture adjudications, not scientific validation.
Without `--out`, JSON goes to stdout. Missing inputs or malformed arguments fail without
writing a report. CSV and JSON query arrays are accepted. No dependencies or server are needed.

The script reuses `runEvaluation` from `eval-holdout.mjs`, including verified-row filtering,
linked-source removal, seeded dev/test assignment, normalization and scoring. Both dev and
test disagreements are listed with their split; excluded queries are listed separately.
Correct answers and correct control refusals are omitted. Refusals on answerable queries
remain errors. Expected categories use the existing truth mapping and control definitions.

Each error contains the normalized query, expected and actual categories, score, complete
engine result, cited evidence snapshots (`used_rows`), truth source URL and locator, and
`nearest_unused_row`. Evidence snapshots preserve conditions, source locator and source URL.
An unavailable engine citation fails the report rather than silently inventing evidence.
Missing source URLs are explicit nulls, not fabricated citations.

“Used” means cited by the engine's public `cited` interface, not every row it inspected.
“Unused” means uncited, verified rows for the same material remaining **after** holdout
removal. Held-out truth and linked rows cannot become nearest candidates. A null nearest
row means this candidate pool is empty; an empty used list means no rows were cited.

Nearest is a diagnostic heuristic, not an engine comparability grade or a scientific claim.
For each known query field, categorical mismatches cost 1; missing row values cost 1;
numeric differences cost `abs(a-b) / max(abs(a), abs(b), 1)`. Unknown query fields are
ignored. Numeric fields: thickness, width, flow speed, oxygen, pressure, gravity and external
heat flux. Categorical fields: form, flow direction and endpoint. Costs are summed with equal
weight, and ties sort by evidence ID. This ranking deliberately includes incompatible
uncited rows to make possible rejection mistakes visible. It does not explain causation.

At implementation time `labelMaterial` is a scaffold stub; reports from that stub cannot
establish engine accuracy. The small fixture tests inject decisions to verify diagnostics,
source preservation, leakage exclusion, nearest ranking, correct-answer omission and empty
candidate handling. Run verification with `node --test`.
