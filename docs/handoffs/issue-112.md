# Issue #112 — ACME BRE evidence extraction

Completed the explicitly permitted insufficient-evidence fallback. `research/rows-acme-bre.csv` is header-only with the exact `data/evidence.csv` header. `research/rows-acme-bre.md` records the inspected NASA sources, peer-reviewed report leads, retrieval limitations, missing test-level evidence, exclusions and proposed BRE-S21 metadata. No fabricated test rows or changes to data/, src/ or dependencies.

Key decision: NASA aggregate burner extinction summaries do not establish individual solid-material flammability tests. Do not convert burner geometry into specimen thickness or extinction time into a spread limit. No further work is required for this issue's fallback; future extraction needs accessible test tables and an explicit burner endpoint mapping.

Validation: Node assertions confirmed exact header equality with data/evidence.csv and that the repository CSV parser returns an empty row array. `node --test` exited 0; existing TODO assertions report incomplete evidence fields and normalization gaps, so this is not a claim that all TODO checks pass. The first inline validation command hit PowerShell quoting trouble; rerunning it through stdin passed. No server or browser started, per conductor instruction.

STATUS: DONE
