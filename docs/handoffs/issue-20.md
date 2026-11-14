# Issue #20: NASA 2025 lunar-gravity research

Branch: task/20-r3-nasa-2025-lunar-gravity-flammability

## Progress
- Read README.md and AGENTS.md; no existing local handoff or misplaced handoff was present.
- Inspected fetched research from issues #18, #19, and #22 with git show. Use #18 columns as a starting point; retain explicit simulated-gravity and extraction provenance fields.
- Located and opened Urban et al., ICES-2025-392 (NTRS 20250002114, corrected-caption paper), its presentation (20250006779), and Olson/Ferkul 2012 (20130010991).

## Next
- Research deliverables are complete. Downstream science review must resolve the documented source discrepancies before promoting 2025 rows into classifications. No human input is required to complete this research task.

## Decisions / limitations
- Research only. No app code, configuration, or scaffolding.
- Distinguish simulated lunar gravity from on-Moon measurements; flag the repository's blanket no-direct-data / endpoint-bound assumption for evidence review.
- Keep Nomex fabric distinct from Nomex Velcro, and cotton flaming distinct from smoldering.
- Initial sandbox download failed; approved public NASA downloads and temporary PDF rendering succeeded. No downloaded files or tooling were added to the repo.
- Wrote research/lunar-2025.md and a 30-row research/lunar-2025-rows.csv. Separate graph-read references, plot extrapolations, table compensation estimates and historical fabric endpoints.
- Found source inconsistencies: cotton plots repeat essentially the same fit despite distinct endpoints; plotted cotton direction conflicts with the discussion; several table slopes differ from plotted fits. Preserve both, flag all 2025 rows HOLD_scientific_review, and do not synthesize a cabin safety label.
- Verified 2026 FM2 current concept separately from older SIBAL/PMMA plans. Planned oxygen starts are not measured extinction limits.

## Verification so far
- Working branch and clean initial state verified with git status.
- NASA catalog records and PDF sections read. Locally rendered corrected-caption paper pp. 8, 9, 11; presentation slides 14-16; Olson/Ferkul Table I p. 6.
- Digitized vector plot lines using separately calibrated axes, checked against rendered paper; editorial allowances are +/-0.5 pp for lunar references and +/-1.0 pp for extrapolated ordinates, not source confidence intervals.
- Table 2 and historical Table I checked visually; preserve source rounding for compensation factors.
- Import-Csv validation: 30 rows, unique evidence IDs, required provenance/uncertainty fields populated, NASA NTRS source URLs, and blank unknown lunar-flow values. Counts: 6 plot references, 12 fit extrapolations, 12 table transcriptions (6 factors + 6 historical endpoints).
- Cross-checked report/CSV material values, figure numbers, Table 2 values and historical fabric endpoint pairs. git diff --check passed.
- Scope check: only research/lunar-2025.md, research/lunar-2025-rows.csv and root HANDOFF.md changed. No app code, configuration, scaffolding, dependencies or temporary extraction tools committed.
- Commits: f9fa7d0 (research plan); 4756d3b (evidence report and rows); final handoff verification committed separately. Push targets only the assigned task branch.

STATUS: DONE
