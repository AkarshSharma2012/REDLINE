# Issue 19 handoff

Scope: BASS-II / PSI-25 research only. Current branch: task/19-r2-bass-ii-psi-25-data-access-and-draft.

## Done
- Read README.md and AGENTS.md. No existing root HANDOFF.md was present.
- Inspected all fetched remote branches with git branch -r and git ls-tree. Only main, this issue branch, and task/33 were available; research/evidence-spec.md was absent. A provisional, explicitly documented CSV schema will be used.
- Located NASA PSI-25 investigation page and NASA/TM-20210011385 summary report.

## Next
- Inspect public PSI file listing and download behavior; extract source-specific caveats.
- Draft up to 15 individually cited run rows; validate CSV and references.

## Decisions
- All tracked output stays in research/ as requested, including this handoff.
- No app code, configuration, or scaffolding. No third-party transcriptions as evidence.
- Missing values stay empty; oxygen before/after readings must not become extinction thresholds.
