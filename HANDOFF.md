# Issue #28 - Screen-by-screen UI specs

STATUS: DONE

## Deliverable
- docs/specs/screens.md: all five screens (Cabin Check, Evidence, Gravity, Oxygen tradeoff, Accuracy), each with purpose, ASCII wireframe, complete element/interaction inventory, empty/loading/error and partial states, and data read contracts.
- Includes shared source/accessibility/navigation rules, source register, pinned cross-branch provenance, six-segment 120-second illustrative lunar-rover demo and later implementation acceptance checklist.
- Specs only; no app/UI code, configurations, scaffolding or stack changes.

## Research and decisions
- Read README.md and AGENTS.md first; no pre-existing root or misplaced handoff on this branch.
- Inspected fetched branches using git branch -r, git ls-tree and git show. Used R1, R3, R4, R7, R8, S1, S4 and W2; source pins/locators are in the deliverable.
- No DESIGN.md locally or in inspected S2 snapshot. Use AGENTS.md restrained dark/high-contrast style until available.
- Independently opened NASA U25, OF12, Marcum, A15 atmosphere-model and B22 baseline PDFs. Rechecked B22 printed p.142/PDF p.156 protocol summary and A15 Table 1; source title/URL/locator retained.
- U25 chart screenshot retrieval failed; no independent graph digitization claimed. R3 plot-derived numbers remain science-review gated. A 2020 workshop PDF timed out and supplies no value here.
- Simulated-lunar measurements are distinct from lunar-surface estimates. The requested 0 g/1 g range is labeled an assumed envelope, not a verified bound; unavailable for incompatible/missing endpoint pairs. R3 disputes and fabric/Velcro distinctions remain explicit.
- Missing coverage says Not found in the sources reviewed. Draft evidence cannot drive numeric labels; unrun/insufficient evaluations cannot display invented accuracy.

## Verification performed
- Native PowerShell static checks passed: five screen contracts each contain purpose, layout, element inventory, states and data reads; all six requested sections found; ten balanced wireframe fences; thirteen linked NASA/project sources; prohibited wording absent; UTF-8 readable without replacement characters.
- git diff --check passed. Scope check: only docs/specs/screens.md and root HANDOFF.md changed from origin/main.
- Manually reviewed scientific assertions against source locators and separated proposals/inferences from findings. No runtime tests apply: there is no implementation in this task.

## Kickoff integration dependencies (not blockers to this completed specification)
- Reviewed numeric evidence and scientific resolution of R3 source discrepancies/envelope assumptions.
- Adapters for simulated-gravity/custom endpoints, protocol-context fields, all-candidate comparisons and browser-readable frozen evaluation reports.
- Eventual DESIGN.md; actual demo rehearsal after implementation. Until then use the specified unavailable states and honest demo fallback.
