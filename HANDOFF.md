# Issue #20: NASA 2025 lunar-gravity research

Branch: task/20-r3-nasa-2025-lunar-gravity-flammability

## Progress
- Read README.md and AGENTS.md; no existing local handoff or misplaced handoff was present.
- Inspected fetched research from issues #18, #19, and #22 with git show. Use #18 columns as a starting point; retain explicit simulated-gravity and extraction provenance fields.
- Located and opened Urban et al., ICES-2025-392 (NTRS 20250002114, corrected-caption paper), its presentation (20250006779), and Olson/Ferkul 2012 (20130010991).

## Next
- Visually verify figures and tables; extract limits with stated plot-reading uncertainty.
- Write research/lunar-2025.md and research/lunar-2025-rows.csv; validate citations, CSV, and scope; commit and push this branch.

## Decisions / limitations
- Research only. No app code, configuration, or scaffolding.
- Distinguish simulated lunar gravity from on-Moon measurements; flag the repository's blanket no-direct-data / endpoint-bound assumption for evidence review.
- Keep Nomex fabric distinct from Nomex Velcro, and cotton flaming distinct from smoldering.
- Shell PDF download failed (network connection); browser web tool can read the corrected-caption paper and presentation.

## Verification so far
- Working branch and clean initial state verified with git status.
- NASA catalog records and readable PDF text opened. Figure values are not yet verified.

STATUS: IN PROGRESS
